# Aryanwgaf/skillshift-scanner

## Resumen

SkillShift scanner es un clasificador de texto derivado de `answerdotai/ModernBERT-base`, afinado por Aryan Bhargava para detectar *skills* de agente maliciosas, es decir, ficheros `SKILL.md` que un agente instalaría y ejecutaría. El modelo resuelve un problema concreto de seguridad en cadenas de suministro de agentes: distinguir si una skill es peligrosa o benigna antes de su instalación, actuando como filtro de triaje de primera pasada. Es relevante porque los detectores entrenados sobre el benchmark completo aprenden atajos asociados a la fuente del dataset en lugar de la peligrosidad real, y acaban marcando como maliciosas cerca de dos tercios de las skills benignas provenientes de fuentes no vistas.

Este checkpoint concreto es la variante "mixed-only": se ha entrenado únicamente con las fuentes de MaliciousSkillBench que contienen ambas etiquetas (benigna y maliciosa), lo que reduce drásticamente el sobrebloqueo. Se distribuye como modelo ONNX cuantizado a int8, con un tamaño de repositorio de 0,2 GB, y está pensado como una señal barata dentro de un pipeline de revisión, no como veredicto autónomo. La licencia es MIT y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base, afinado) |
| Parametros totales | no disponible (heredados de ModernBERT-base; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base ModernBERT-base; el autor no la especifica) |
| Tipos de cuantizacion | int8 (exportacion ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (int8); el repositorio declara libreria `transformers` |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer de la familia ModernBERT, y se afina como clasificador binario de texto (`text-classification`) sobre `MaliciousSkillBench` (CC-BY-4.0, arXiv:2608.19901). La decisión de diseño central es el filtrado del conjunto de entrenamiento: en lugar de usar el benchmark fusionado completo, se restringe a las fuentes que contienen ambas etiquetas. Según el autor, los detectores entrenados sobre el benchmark completo aprenden a reconocer la *fuente del dataset* de la skill en vez de su peligrosidad, lo que provoca que marquen aproximadamente dos tercios de las skills benignas de fuentes no vistas.

El resultado se exporta a ONNX en int8 para inferencia ligera. El umbral de operación publicado es 0,344, calibrado para una tasa de falsos positivos del 2 % sobre datos de validación. El autor advierte explícitamente que ese umbral no transfiere a fuentes nuevas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (en un clasificador de este tipo no sería el mecanismo habitual).

## Capacidades

- Clasificación binaria de texto: determina si el contenido de una skill de agente (`SKILL.md`) es malicioso o benigno.
- Detección estática de patrones de riesgo en texto de skills, orientada a seguridad de cadena de suministro de agentes.
- Triaje de primera pasada: genera una puntuación que permite enrutar casos sospechosos a revisión humana.
- Inferencia ligera en formato ONNX int8, apta para ejecución en CPU.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Filtro previo a la instalación de skills: antes de que un agente instale una skill de un repositorio o marketplace, el escáner lee el `SKILL.md` y asigna una puntuación; las skills por encima del umbral se bloquean o se envían a revisión manual.
- Puerta de calidad en un registro interno de skills: integrar el clasificador en el pipeline de publicación de un catálogo corporativo de skills para agentes, de modo que ninguna skill se publique sin pasar el triaje automático.
- Revisión de dependencias de agentes en CI/CD: ejecutar el modelo como paso de un pipeline que analiza los ficheros de skills incluidas en un repositorio antes de desplegar un agente en producción.
- Análisis de skills de terceros: al evaluar un marketplace externo o un paquete descargado, usar el escáner como señal barata para priorizar qué skills requieren auditoría manual detallada.
- Investigación en seguridad de agentes: servir como línea base reproducible para estudiar *shortcut learning* y sobrebloqueo en detectores de skills maliciosas, comparando con el modelo entrenado sobre el benchmark completo.
- Monitorización de contenido generado por usuarios: en plataformas donde los usuarios suben skills para agentes, aplicar el clasificador como primer filtro automático antes de la moderación humana.
- Despliegue en entornos con recursos limitados: al ser ONNX int8 y de 0,2 GB, puede ejecutarse en CPU dentro de servicios de validación sin GPU dedicada.

## Benchmarks y rendimiento

El autor publica métricas de comportamiento sobre un conjunto de test de fuentes no vistas, con umbral 0,5:

| Metrica | Valor |
|---|---|
| Tasa de falsos positivos en benignas (ATR) | 4 % |
| Tasa de falsos positivos en benignas (agregada) | 20 % |
| Recall de maliciosas | ~53 % |
| Umbral de operacion calibrado | 0,344 (2 % de FPR en validacion) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es coherente con la naturaleza de clasificador del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser un encoder base exportado a ONNX int8 con un repositorio de 0,2 GB, la huella es reducida y cabe en CPU.
- GPU recomendadas: no disponibles; el formato ONNX int8 está orientado a inferencia en CPU, aunque puede ejecutarse en GPU si se desea.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna, dado el tamaño del artefacto; no se publican requisitos oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del checkpoint); la librería declarada es `transformers`, por lo que también puede cargarse a través de ella si se dispone de los pesos en ese formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillShift scanner (mixed-only) | no disponible (ModernBERT-base) | no disponible | FPR benigno 4 % (ATR) / 20 % (agregado); recall malicioso ~53 % | MIT | Hugging Face |
| Detector entrenado sobre benchmark completo (mismo estudio) | no disponible | no disponible | Marca ~2/3 de skills benignas de fuentes no vistas | no disponible | no disponible |
| Modelo lineal TF-IDF (mismo estudio) | no disponible | no disponible | Menor tasa de falsos positivos que este checkpoint | no disponible | no disponible |

El autor indica que el modelo lineal TF-IDF del mismo estudio alcanza una tasa de falsos positivos inferior; este checkpoint se distribuye como escáner por su equilibrio, no por ser el de menor FPR.

## Limitaciones y advertencias

- Los umbrales no transfieren: la validación proviene de las fuentes de entrenamiento, por lo que un umbral fijado ahí subestima la tasa de falsos positivos en una fuente benigna nueva; es necesario recalibrar con skills benignas del dominio de destino.
- Solo analiza texto: payloads ocultos en código empaquetado, ofuscación o comportamiento que solo se manifiesta en tiempo de ejecución requieren análisis dinámico o a nivel de paquete.
- Es evadible: añadir tokens benignos al estilo de las fuentes de entrenamiento puede empujar una skill maliciosa por debajo del umbral (ataque de "palabras buenas", documentado en el paper); no debe ser la única línea de defensa.
- Depende de una única familia de benchmarks: entrenado y evaluado sobre MaliciousSkillBench, cuyas skills benignas de entrenamiento provienen casi por completo de una sola fuente.
- Cobertura lingüística limitada al inglés.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos positivos y falsos negativos) inherente a un clasificador con recall de ~53 %.
- No se han publicado datos sobre sesgos específicos más allá del sobrebloqueo por fuente descrito.
- Uso comercial permitido por la licencia MIT, sin restricciones adicionales conocidas.

## Enlaces

- Hugging Face: https://huggingface.co/Aryanwgaf/skillshift-scanner
- Repositorio del proyecto (código, paper y estudio): https://github.com/Aryanbhargava18/SkillShift
- Dataset MaliciousSkillBench: https://huggingface.co/datasets/ProtectSkills/MaliciousSkillBench
- Paper referenciado: arXiv:2608.19901
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
