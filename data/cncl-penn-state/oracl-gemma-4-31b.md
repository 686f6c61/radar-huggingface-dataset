# CNCL-Penn-State/ORACL-Gemma-4-31B

## Resumen

ORACL-Gemma-4-31B es un adaptador PEFT/LoRA con cabeza de regresión desarrollado por CNCL-Penn-State (Penn State) sobre el modelo base google/gemma-4-31B-it. No es un modelo generativo de propósito general: es un modelo de evaluación que produce puntuaciones continuas de creatividad en una escala nominal de 10 a 50 para textos creativos y dibujos. Se distribuye como adaptador (no como pesos completos), con un tamaño de repositorio de 0,5 GB.

El modelo se ha afinado sobre el conjunto de datos MuCE-ORACL-Gemma, con 170.445 respuestas de entrenamiento. Según la model card, se seleccionó la época 2 mediante error de validación, y esta versión concreta corresponde al adaptador y la cabeza de regresión empleados en los análisis de generalización del artículo asociado, no al modelo entrenado sobre el conjunto completo de datos. Los pesos se publican en safetensors bajo licencia apache-2.0, aunque el modelo base mantiene sus propios términos de uso.

Su relevancia es acotada y específica: cubre la necesidad de puntuar automáticamente creatividad en investigación psicológica y educativa (tareas tipo AUT/Torrance), un caso donde los LLM generativos no ofrecen directamente una salida numérica calibrada. La información pública no especifica contexto, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; adaptador LoRA y cabeza de regresión sobre google/gemma-4-31B-it |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina "31B" (no confirmado en la información proporcionada) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (sujeta además a los términos del modelo base Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | google/gemma-4-31B-it |
| Tipo de tarea | Regresión (puntuación de creatividad, escala 10-50) |
| Modalidades | Texto e imagen (multimodal) |
| Tamaño del repositorio | 0,5 GB |
| Dataset de entrenamiento | CNCL-Penn-State/MuCE-ORACL-Gemma (170.445 respuestas) |
| Fecha de creación | 2026-09-28 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su identificador (google/gemma-4-31B-it). Lo que sí se especifica es la relación del repositorio con ese base: se trata de un adaptador LoRA más una cabeza de regresión, es decir, un ajuste paramétricamente eficiente que congela los pesos del modelo base y añade un módulo de salida escalar. La salida no es texto, sino una puntuación continua en una escala nominal de 10 a 50.

El entrenamiento se realizó sobre el conjunto MuCE-ORACL-Gemma, con 170.445 respuestas. La model card indica que se eligió la época 2 según error de validación, y advierte explícitamente que este repositorio no contiene el modelo entrenado sobre el conjunto completo, sino la versión utilizada en los análisis de generalización del artículo. No se especifican la composición exacta del dataset, el número de tokens, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras).

La inferencia requiere código propio del repositorio: el módulo `scoring.py` expone la clase `GemmaScorer`, que recibe instrucción y respuesta, y opcionalmente `stimulus_image` y `response_image` para tareas de dibujo. El repositorio incluye `requirements-tested.txt`, `release.json` (revisión base) y `verification.json` (alcance de la verificación).

## Capacidades

- Puntuación de creatividad de texto: devuelve una valoración numérica continua (escala 10-50) dada una instrucción y una respuesta.
- Puntuación de dibujos: acepta imágenes de estímulo y de respuesta mediante los parámetros `stimulus_image` y `response_image`.
- Evaluación multimodal: combina entrada textual e imágenes en la misma llamada de puntuación.
- Integración como componente de evaluación: puede actuar como juez automático dentro de pipelines de investigación.
- Ejecución en entorno CUDA mediante la clase `GemmaScorer` y las dependencias probadas del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning ni modo "thinking".
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Evaluación automática de creatividad en investigación psicológica: el modelo puntúa respuestas a tareas tipo Alternate Uses Task (por ejemplo, "usos para un ladrillo") en una escala 10-50, sustituyendo o complementando la corrección manual por evaluadores.
- Corrección de pruebas de dibujo creativo: usando `stimulus_image` y `response_image`, permite puntuar automáticamente tareas gráficas tipo Torrance, donde la evaluación humana es costosa y poco escalable.
- Estudios de generalización y validación: el repositorio corresponde a la versión empleada en los análisis de generalización del artículo, por lo que sirve para reproducir o extender esos experimentos con la misma configuración.
- Filtrado y ranking de contenido creativo generado: en un pipeline que produzca múltiples candidatos de texto o imagen, el modelo puede ordenarlos por creatividad antes de una revisión humana.
- Tutoría educativa: un sistema de aprendizaje puede puntuar las respuestas creativas del alumnado y ofrecer retroalimentación numérica objetiva a lo largo del tiempo.
- Detección de respuestas estereotipadas o poco originales: puntuaciones bajas y sistemáticas pueden señalar producciones repetitivas en un corpus, útil en control de calidad de contenidos.
- Base para ajuste adicional: al ser un adaptador LoRA, puede reentrenarse sobre datos propios de un dominio concreto (por ejemplo, creatividad publicitaria o científica) sin tocar los pesos del modelo base.
- Comparación de cohortes o condiciones experimentales: el uso de una escala numérica fija facilita análisis estadísticos agregados entre grupos, tareas o momentos temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que la selección de época se hizo mediante error de validación, pero no se proporcionan métricas concretas (correlación con evaluadores humanos, MAE, RMSE, MMLU u otros).

## Requisitos de hardware

- El adaptador en sí ocupa 0,5 GB, pero la inferencia exige cargar el modelo base google/gemma-4-31B-it completo, más el adaptador y la cabeza de regresión.
- VRAM estimada (derivada del tamaño nominal del modelo base, no confirmada por el autor): aproximadamente 62 GB en bf16/fp16, en torno a 31 GB en cuantización de 8 bits y 16-20 GB en 4 bits, más el coste de activaciones y de las entradas de imagen.
- GPU recomendadas para precisión completa: A100 80 GB o H100 80 GB; alternativamente, varias GPU de 40 GB con reparto por tensor.
- Viabilidad en GPU de consumo: en una RTX 4090 (24 GB) solo sería planteable con cuantización de 4 bits y según el soporte real del modelo base; no hay confirmación del autor al respecto.
- Opciones de despliegue: el repositorio está pensado para un entorno CUDA con `requirements-tested.txt` y la clase `GemmaScorer` de `scoring.py`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la cabeza de regresión requeriría código personalizado en cualquier caso.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se conocen en la información proporcionada otros adaptadores de puntuación de creatividad directamente comparables. La única referencia clara es el propio modelo base.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ORACL-Gemma-4-31B | Adaptador sobre base de 31B nominales | No disponible | Puntuación de creatividad (texto e imagen) | apache-2.0 (adaptador); términos del base | HuggingFace (0 descargas, 0 likes) |
| google/gemma-4-31B-it | 31B nominales | No disponible | Generación multimodal de propósito general | Términos de Gemma | HuggingFace (modelo base) |
| Otros jueces automáticos de creatividad basados en LLM | No disponible | No disponible | Puntuación mediante prompt | Variable | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni imágenes, solo una puntuación numérica; usarlo fuera de esa función dará resultados sin sentido.
- Sesgos conocidos: no documentados en la información disponible. Al entrenarse sobre respuestas de participantes humanos, es probable que herede sesgos culturales y de dominio del dataset MuCE, pero esto no está confirmado por el autor.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto libre), pero sí existe riesgo de puntuaciones mal calibradas o fuera de rango en entradas muy alejadas del dominio de entrenamiento.
- Dominio restringido: está entrenado para tareas creativas concretas (usos alternativos de objetos, dibujos). Su aplicación a otros tipos de evaluación no está validada.
- Escala de salida: la escala 10-50 es nominal y específica de este modelo; no es directamente comparable con puntuaciones de otras escalas o de evaluadores humanos sin una calibración previa.
- Cobertura lingüística: no se especifican idiomas soportados; el dataset y las instrucciones de ejemplo están en inglés, por lo que el rendimiento en castellano es desconocido.
- Versión no definitiva: el propio autor advierte que este no es el modelo entrenado sobre el conjunto completo de datos, sino la variante empleada en los análisis de generalización.
- Licencia: el adaptador se publica como apache-2.0, pero el uso comercial depende también de los términos de licencia del modelo base Gemma, que hay que revisar por separado.
- Reproducibilidad: el funcionamiento correcto requiere el código del repositorio (`scoring.py`, `requirements-tested.txt`) y las revisiones indicadas en `release.json`; no se garantiza compatibilidad con otras versiones del modelo base.
- Adopción nula hasta la fecha: 0 descargas y 0 likes, sin validación externa independiente.
- Sin datos de benchmarks: no hay métricas publicadas que permitan estimar su precisión frente a evaluadores humanos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CNCL-Penn-State/ORACL-Gemma-4-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/CNCL-Penn-State/MuCE-ORACL-Gemma
