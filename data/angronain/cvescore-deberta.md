# angronain/cvescore-deberta

## Resumen

CVEscore es un modelo de clasificación de texto derivado de `microsoft/deberta-v3-base`, ajustado por el usuario angronain para predecir el vector CVSS v3.1 a partir de la descripción textual de una vulnerabilidad CVE. El modelo incorpora ocho cabezas de clasificación independientes, una por cada métrica base del estándar CVSS v3.1 (AV, AC, PR, UI, S, C, I, A), y calcula la puntuación base y la severidad aplicando la fórmula oficial sobre el vector predicho. Resuelve un problema concreto del sector de la seguridad: la asignación manual de puntuaciones CVSS por parte de analistas, que introduce latencia entre la publicación de un CVE y su puntuación oficial.

El modelo se entrenó con los feeds JSON 2.0 del NVD, empleando una partición temporal estricta (entrenamiento con CVEs anteriores al 1 de octubre de 2024, validación hasta finales de 2024 y test con CVEs publicados desde 2025) para evitar fuga de información futura. Sobre un conjunto de test de 123.460 CVEs, alcanza un 40,1 % de coincidencia exacta de vector, un 62,9 % de precisión de severidad y un error absoluto medio de 1,036 puntos en la puntuación base.

Su relevancia actual radica en su utilidad como herramienta de triaje: permite pre-puntuar CVEs recién publicados antes de que exista puntuación oficial y enrutar las predicciones de baja confianza a revisión humana. Es un modelo pequeño (repo de 0,7 GB, base DeBERTa-v3-base de ~86 M de parámetros), con licencia MIT y velocidad de inferencia inferior al milisegundo por CVE en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base) con 8 cabezas de clasificación |
| Parametros totales | ~86 M (heredados de microsoft/deberta-v3-base; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la de DeBERTa-v3-base es 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | microsoft/deberta-v3-base |
| Tarea | text-classification (multietiqueta, 8 cabezas) |
| Dataset de entrenamiento | NVD CVE JSON 2.0 feeds |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo parte de DeBERTa-v3-base, un encoder transformer que incorpora atención desenredada (disentangled attention) y una variante mejorada de embedding de posiciones relativas. Sobre la representación del token `[CLS]` se añaden ocho cabezas de clasificación independientes, una por cada métrica base de CVSS v3.1: vector de ataque (AV), complejidad de ataque (AC), privilegios requeridos (PR), interacción de usuario (UI), alcance (S), confidencialidad (C), integridad (I) y disponibilidad (A). La puntuación base y la severidad no se predicen directamente, sino que se derivan del vector predicho aplicando la fórmula oficial de CVSS v3.1.

El entrenamiento utiliza los feeds JSON 2.0 del NVD, seleccionando CVEs que dispongan de vector CVSS v3.1, con preferencia por la puntuación del NVD y, en su defecto, la del CNA (vendor). La partición es temporal y no aleatoria: entrenamiento con CVEs publicados antes del 1 de octubre de 2024, validación hasta finales de 2024 y test con CVEs publicados a partir de 2025, lo que evita fuga de información del futuro. No se documentan en la model card detalles sobre volumen de tokens, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá del esquema multi-cabeza y la partición temporal.

## Capacidades

- Predicción del vector CVSS v3.1 completo (8 métricas base) a partir de la descripción textual de un CVE en inglés.
- Cálculo de la puntuación base y de la severidad derivadas del vector predicho mediante la fórmula oficial CVSS v3.1.
- Clasificación multietiqueta con probabilidades por cabeza, lo que permite calcular una medida de confianza agregada (producto de las probabilidades top de las 8 cabezas) para enrutar predicciones dudosas a revisión humana.
- Inferencia de alta velocidad en lote: 0,99 ms por CVE en una RTX 5080 con procesamiento por lotes.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento; es un clasificador de texto puro.
- Capacidad multilingüe limitada al inglés (las descripciones en otros idiomas no están soportadas según la model card).

## Casos de uso

- Triaje de CVEs recién publicados: pre-puntuar vulnerabilidades antes de que el NVD o el CNA asignen una puntuación oficial, permitiendo priorizar la respuesta a incidentes en las primeras horas tras la divulgación.
- Enrutamiento a analistas humanos: usar el producto de las probabilidades top de las 8 cabezas como medida de confianza y derivar a revisión manual las predicciones por debajo de un umbral, tal y como recomienda el autor.
- Enriquecimiento de bases de datos de vulnerabilidades: poblar automáticamente campos de severidad y vector CVSS en inventarios internos o plataformas de gestión de vulnerabilidades cuando falta la puntuación oficial.
- Priorización en pipelines de parcheo: integrar el modelo en un sistema de gestión de parches que ordene las actualizaciones por severidad estimada, acelerando la remediación de los CVEs más críticos.
- Alertas tempranas en SOC: alimentar un sistema de correlación de eventos que asigne criticidad a nuevas vulnerabilidades observadas en telemetría antes de que exista puntuación pública.
- Análisis retrospectivo y auditoría: recalcular o contrastar puntuaciones CVSS de un corpus histórico de CVEs para detectar discrepancias entre la puntuación del NVD y la del vendor (CNA).
- Filtrado de ruido en feeds de seguridad: descartar o marcar como baja prioridad CVEs cuya descripción sugiere impacto bajo, reduciendo el volumen de alertas que llega a los analistas.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de 123.460 CVEs publicados en 2025 o después:

| Metrica | Valor |
|---|---|
| Coincidencia exacta de vector | 0,401 |
| Precision de severidad | 0,629 |
| MAE de la puntuacion base | 1,036 |
| Velocidad de inferencia | 0,99 ms/CVE (RTX 5080, en lote) |

F1 macro por metrica: AV 0,761; AC 0,672; PR 0,741; UI 0,880; S 0,843; C 0,760; I 0,764; A 0,625.

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), ya que se trata de un clasificador de dominio especifico y no de un modelo generativo de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un encoder de ~86 M de parametros; en la practica, unos pocos cientos de MB con pesos en fp16 o cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El autor reporta 0,99 ms/CVE en una RTX 5080 en modo lote; una RTX 4090, A100 o H100 ofreceran throughput similar o superior en funcion del tamano de lote.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU para volumenes moderados.
- Opciones de despliegue: el autor proporciona la clase `CVSSModel` y la funcion `predict_proba` en el repositorio de GitHub; al ser un modelo safetensors compatible con la libreria Transformers, puede servirse con vLLM (para clasificacion), TGI o un servidor FastAPI propio. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: 0,99 ms por CVE en RTX 5080 con procesamiento por lotes; el throughput escala con el tamano de lote y la GPU empleada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables publicados con los que contrastar parametros, contexto, rendimiento y licencia. La model card no incluye una seccion de comparativas ni referencias a alternativas. Se indica, por tanto, "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| angronain/cvescore-deberta | ~86 M | no disponible | Exact match 0,401; MAE 1,036 | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo procesa descripciones en ingles; las descripciones en otros idiomas no estan soportadas.
- Las descripciones vagas o genericas (por ejemplo, "unspecified vulnerability") obtienen puntuaciones pobres, segun reconoce el autor.
- Las etiquetas de entrenamiento mezclan puntuaciones del NVD y del vendor (CNA), que en ocasiones discrepan entre si, lo que introduce ruido en el objetivo de aprendizaje.
- Solo cubre CVSS v3.1; no predice vectores CVSS v4.0.
- La coincidencia exacta de vector es del 40,1 %, por lo que no debe usarse como sustituto de la puntuacion de un analista; el propio autor lo define como ayuda al triaje.
- Riesgo de alucinacion de metricas: al ser un clasificador, puede asignar valores plausibles pero incorrectos a metricas concretas, especialmente en descripciones ambiguas o muy cortas.
- No se documentan sesgos especificos mas alla de los derivados de la distribucion del corpus NVD; conviene auditar el rendimiento por tipo de CVE y por vendor antes de desplegarlo en produccion.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece ninguna garantia sobre la exactitud de las predicciones.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/angronain/cvescore-deberta
- Repositorio GitHub (codigo, pipeline de entrenamiento y clase `CVSSModel`): https://github.com/atomic-crafter/CVEscore
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Dataset NVD (referenciado en la model card): https://nvd.nist.gov/
