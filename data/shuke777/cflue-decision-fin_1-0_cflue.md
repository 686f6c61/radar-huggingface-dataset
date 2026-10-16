# ShuKe777/cflue-decision-fin_1.0_CFLUE

## Resumen

CFLUE 决策模型 · fin_1.0_CFLUE es una familia de cuatro modelos de decisión para opción múltiple y verdadero/falso en el dominio financiero chino, publicada por el usuario ShuKe777. A diferencia de un modelo generativo, estos modelos leen el enunciado y los candidatos y, en una sola pasada forward, emiten la probabilidad de cada opción, sin generar texto. Esto elimina el fallo típico de los modelos generativos al producir una respuesta que no parsea, y permite filtrar por umbral de confianza gracias a que las probabilidades están calibradas por temperatura.

El repositorio contiene dos variantes basadas en Qwen3.5 (4B y 9B) con un cabezal de decisión Clef, y dos variantes encoder más ligeras (Laya multilingual de 322M sobre mmBERT-base, y Laya en de 421M sobre ModernBERT-large). La variante de 9B alcanza un 76,94% de exactitud en el conjunto de test (2.532 preguntas no vistas de la evaluación de conocimiento de CFLUE), frente al 28,36% del modelo base sin ajustar, con un error de calibración (ECE) del 2,17%. La variante de 4B llega al 74,33% con ECE del 4,04%.

El proyecto es relevante porque demuestra que un ajuste fino con LoRA más un cabezal de decisión calibrado puede acercarse al rendimiento de un modelo generativo de razonamiento mucho mayor (un Qwen3.5-27B destilado de Claude Opus 4.6 logra 78,16% en el mismo test) usando aproximadamente un tercio de los parámetros y devolviendo probabilidades listas para umbralizar. Está pensado como componente de decisión estructurada dentro de agentes financieros, y su uso está restringido a investigación por la licencia no comercial del dataset.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5) con cabezal de decisión Clef en las variantes Qwen; encoder transformer (mmBERT-base / ModernBERT-large) en las variantes Laya |
| Parametros totales | 4B (Qwen3.5-4B), 9B (Qwen3.5-9B), 322M (Laya multilingual), 421M (Laya en) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens en las variantes Qwen; 1.024 en Laya multilingual; 512 en Laya en |
| Tipos de cuantizacion | Base Qwen entrenada en 4-bit NF4 (pesos originales congelados, computo BF16); carga en 4-bit para variantes Qwen y en 16-bit para variantes Laya |
| Idiomas soportados | Chino (zh) en las variantes Qwen; Laya multilingual multilingue; Laya en en ingles |
| Licencia | other (dataset CFLUE bajo CC BY-NC-SA 4.0); los pesos base siguen sus licencias originales |
| Formato de pesos | safetensors (adaptadores LoRA + joint_head.safetensors en Qwen; encoder fusionado + cabezal de decisión en Laya) |

## Arquitectura y entrenamiento

Las dos variantes Qwen parten de Qwen/Qwen3.5-4B y Qwen/Qwen3.5-9B. Sobre el modelo base congelado en 4-bit NF4 y computo BF16 se entrena un adaptador LoRA con r=16, α=16, dropout 0, que cubre las proyecciones de atención y MLP. En el 4B se entrenan 64,51 millones de parámetros (2,10% del total) y en el 9B, 165 millones (2,53%). Sobre la representación del modelo se acopla un cabezal de decisión Clef conjunto (4B: ancho 512, 8 cabezas, FFN 2.048; 9B: ancho 1.024, 16 cabezas, FFN 4.096) que opera en FP32 y produce una probabilidad por candidato mediante una pérdida de entropía cruzada sobre las opciones. El entrenamiento usa learning rate 2e-4 para el LoRA y 1e-4 para el cabezal, programación coseno, weight decay 0,01, batch efectivo 32 y secuencia de 2.048 tokens sin truncamiento. Se realizan 2 épocas con recarga del mejor checkpoint por pérdida de validación (ambos modelos se detienen en la época 1). En una única RTX 4090 el 4B tarda 1 h 28 min y el 9B, 2 h 54 min. Tras el ajuste se fija la temperatura con LBFGS sobre el conjunto de validación (de forma separada para opción múltiple y verdadero/falso) y el valor global se pliega dentro de los pesos del cabezal (1,27 en el 4B y 1,40 en el 9B), de modo que no hay que multiplicar por temperatura en inferencia.

Las variantes Laya usan LoRA en 16-bit con paralelismo de datos sobre 4 × RTX 4090. La versión multilingual usa batch global 256 y la inglesa 128, con 4 épocas y selección de la tercera por pérdida de validación; los tiempos son 4,2 y 9,0 minutos respectivamente. A diferencia de las Qwen, se guarda el encoder fusionado junto con el cabezal, no un adaptador pendiente de enganchar. La composición del dataset es la evaluación de conocimiento de CFLUE (Zhu et al., ACL 2024 Findings), limitada a preguntas de opción única y verdadero/falso; las preguntas de opción múltiple no entran en esta versión. El conjunto de test contiene 2.532 preguntas no vistas (2.332 de opción única y 200 de verdadero/falso) y las asignaturas del test no aparecen en entrenamiento (经济师「金融专业知识与实务」, grupo completo de CPA sin materia etiquetada, 银行初级资格「个人贷款」 y 期货从业资格「期货法律法规」).

## Capacidades

- Clasificación de opción única: dado un enunciado y sus candidatos, devuelve una probabilidad por opción en una sola pasada forward.
- Decisión verdadero/falso: emite probabilidad de verdadero y falso.
- Probabilidades calibradas por temperatura, aptas para filtrar por umbral de confianza.
- Componente de decisión estructurada en pipelines de agentes financieros, con salida ejecutable en lugar de texto libre.
- Conocimiento financiero en chino, evaluado sobre exámenes profesionales del sector (economía, CPA, banca, futuros).
- Soporte de carga vía Unsloth `FastDecisionModel` con gestión de adaptador LoRA y cabezal conjunto.
- La variante Laya multilingual ofrece cobertura multilingüe y la variante Laya en opera en inglés.

## Casos de uso

- Triage de preguntas financieras en chino: el modelo clasifica directamente la opción correcta de exámenes profesionales, útil para construir bancos de preguntas con respuesta automática y control de calidad.
- Enrutado de decisiones en agentes financieros: al devolver probabilidades por opción, un agente puede usar el umbral de confianza (por ejemplo, aceptar solo el 30% de mayor confianza, con 98,3% de exactitud en el 9B) para derivar a revisión humana los casos dudosos.
- Filtrado de candidatos en herramientas de compliance: comprobar afirmaciones normativas contra opciones predefinidas y marcar discrepancias con una probabilidad asociada.
- Evaluación de calidad de datasets financieros: usar el modelo como anotador automático de opción única y verdadero/falso en corpus chinos de temática financiera, aprovechando la baja ECE (2,17% en el 9B).
- Componente de decisión en asistentes de formación: para plataformas de estudio que necesitan puntuar respuestas de examen y ofrecer una confianza calibrada al usuario.
- Comparación de modelos y experimentos de calibración: por su licencia no comercial y su ECE documentado, sirve como baseline reproducible en investigación sobre decisión estructurada y temperatura en modelos ajustados con LoRA.
- Preprocesado de señales textuales para análisis financiero: convertir preguntas cerradas y afirmaciones en etiquetas probabilísticas que alimenten sistemas posteriores de agregación.

## Benchmarks y rendimiento

| Directorio | Modelo | Exactitud en test (antes → después) | Opción única | Verdadero/falso | ECE |
|---|---|---|---|---|---|
| qwen35-9b-fin_1.0_CFLUE | Qwen3.5-9B + Clef | 28,36% → 76,94% | 76,59% | 80,50% | 2,17% |
| qwen35-4b-fin_1.0_CFLUE | Qwen3.5-4B + Clef | 28,16% → 74,33% | 74,19% | 77,00% | 4,04% |
| laya-multilingual-fin_1.0_CFLUE | Laya multilingual, 322M (mmBERT-base) | 28,55% → 33,93% | 31,39% | 65,50% | 5,73% |
| laya-en-fin_1.0_CFLUE | Laya en, 421M (ModernBERT-large) | 29,86% → 32,50% | 30,49% | 55,50% | 3,52% |

Precisión del 9B por umbral de confianza sobre el mismo test: 99,2% en el 10% de mayor confianza, 98,3% en el 30% y 94,5% en el 50%. Como referencia externa citada en la model card, el modelo generativo Qwen3.5-27B Claude Opus 4.6 Reasoning Distilled (Jackrong) obtiene 78,16% cero-shot en el mismo conjunto.

## Requisitos de hardware

- Inferencia de las variantes Qwen: la base se entrena y se carga en 4-bit NF4, por lo que el 4B requiere del orden de pocos GB de VRAM y el 9B aproximadamente el doble; el repositorio completo ocupa 2,2 GB.
- Entrenamiento documentado: tanto el 4B como el 9B se ajustan en una única RTX 4090 (1 h 28 min y 2 h 54 min respectivamente); las variantes Laya usan 4 × RTX 4090 en paralelo de datos.
- Cabe en GPU de consumo: sí, al menos las variantes Qwen en 4-bit y las dos variantes Laya, sobre una RTX 4090 según los tiempos de entrenamiento reportados.
- Opciones de despliegue: carga mediante Unsloth `FastDecisionModel` con `max_seq_length` de 2.048 (Qwen), 1.024 (Laya multilingual) o 512 (Laya en); el feedback de modelo usa `load_in_4bit=True` para Qwen y `load_in_4bit=False` para Laya. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible (no se publican medidas de inferencia; solo tiempos de entrenamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en test CFLUE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cflue-decision-fin_1.0_CFLUE (Qwen3.5-9B + Clef) | 9B | 2.048 | 76,94% | other (dataset CC BY-NC-SA 4.0) | HuggingFace |
| cflue-decision-fin_1.0_CFLUE (Qwen3.5-4B + Clef) | 4B | 2.048 | 74,33% | other (dataset CC BY-NC-SA 4.0) | HuggingFace |
| Laya multilingual / en fin_1.0_CFLUE | 322M / 421M | 1.024 / 512 | 33,93% / 32,50% | other | HuggingFace |
| Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled | 27B | no disponible | 78,16% cero-shot | no disponible | HuggingFace |

No se dispone de comparativas con otros modelos de clasificación financiera en la información proporcionada.

## Limitaciones y advertencias

- Los modelos están orientados a decisión estructurada sobre exámenes; la model card advierte explícitamente de que la evaluación usa preguntas de examen como tarea proxy y no constituye una señal de trading real.
- No deben usarse como sistema de trading en producción.
- Las preguntas de opción múltiple no entran en esta versión del entrenamiento; solo se cubren opción única y verdadero/falso.
- El dominio es financiero y en chino (las variantes Laya amplían idioma pero con rendimiento muy inferior: 33,93% y 32,50% en test).
- Las predicciones son probabilidades calibradas, pero con umbrales bajos la exactitud cae: en el 9B, al aceptar el 50% de mayor confianza la precisión baja al 94,5%.
- Sesgos concretos no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo porque no se genera texto, pero sí existe riesgo de clasificación errónea en preguntas fuera de la distribución de las asignaturas vistas.
- Licencia: el dataset CFLUE es CC BY-NC-SA 4.0 y los pesos se publican como "other"; la model card indica que esta versión sirve para experimentos de asignaturas reservadas en informes de investigación y no para sistemas de producción. Los pesos base Qwen3.5, ModernBERT y mmBERT siguen sus licencias originales.
- Los datos de la model card sitúan la creación en 2026 y describen una base Qwen3.5; conviene verificar la disponibilidad y la versión real de dicha base antes de integrarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ShuKe777/cflue-decision-fin_1.0_CFLUE
- Modelos base: https://huggingface.co/Qwen/Qwen3.5-4B, https://huggingface.co/Qwen/Qwen3.5-9B, https://huggingface.co/jhu-clsp/mmBERT-base, https://huggingface.co/answerdotai/ModernBERT-large
- Modelo de referencia generativo citado: https://huggingface.co/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled
- Benchmark CFLUE (Zhu et al., ACL 2024 Findings): no disponible enlace directo en la información proporcionada
- Licencia del dataset CFLUE (CC BY-NC-SA 4.0): https://creativecommons.org/licenses/by-nc-sa/4.0/
