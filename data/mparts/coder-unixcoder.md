# mparts/CODer-unixcoder

## Resumen

CODer-unixcoder es una colección de clasificadores de texto derivados de UniXcoder, un encoder de código preentrenado por Microsoft. El autor (mparts) los ha ajustado fino para una tarea muy concreta: detectar si un fragmento de código Python ha sido escrito por un modelo de lenguaje o por una persona. El repositorio contiene 24 checkpoints que cubren seis semillas de entrenamiento (`seed3` a `seed8`) y cuatro variantes de tarea (clasificación binaria y multiclase, con y sin código editado por LLM). Es el artefacto de investigación asociado al artículo *Detecting LLM-Written Code on AIGCodeSet: Tuned Code Encoders versus N-gram Baselines*.

La relevancia práctica es acotada pero clara: con el auge de la generación de código asistida, la atribución de autoría (humano frente a máquina, y qué modelo concreto) es un problema real en entornos académicos, auditorías de repositorios y control de calidad de datasets. CODer aporta una línea base reproducible y con pesos abiertos para esa tarea, entrenada sobre AIGCodeSet, un conjunto con soluciones Python a 317 problemas de CodeNet generadas por CodeLlama 34B, Codestral 22B y Gemini 1.5 Flash.

Arquitectónicamente es un transformer encoder (UniXcoder base) con una cabeza de clasificación de secuencias. No es un modelo generativo ni un detector general de código IA: está especializado en Python, en el dominio de CodeNet y en los tres LLM concretos del dataset. El tamaño del repositorio (12,1 GB) refleja los 24 checkpoints, no un modelo individual de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UniXcoder base) con cabeza de clasificación de secuencias |
| Parametros totales | no disponible (UniXcoder base, orden de ~125M por checkpoint; no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento y truncado) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (la tarea es sobre código Python; el texto natural del código puede ser multilingüe, pero no se declara) |
| Licencia | MIT (pesos y código); datos de entrenamiento AIGCodeSet bajo CDLA-Permissive-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/unixcoder-base`, un encoder tipo RoBERTa entrenado con objetivos multimodales (enmascaramiento de tokens, atención a nodos del AST y comentarios) sobre código fuente. Sobre esa base se añade una cabeza de clasificación (`AutoModelForSequenceClassification`) y se ajusta fino con 24 configuraciones: seis semillas × cuatro variantes de tarea. Las variantes `binary` y `multiclass` usan todos los datos; las `_generate` excluyen el código editado por LLM. Las etiquetas multiclase son 0 Human, 1 GEMINI, 2 LLAMA y 3 CODESTRAL.

El entrenamiento se realizó sobre el split agrupado por problema del repositorio (ningún problema de programación comparte train, dev y test), con 4 épocas, learning rate 2e-5, batch size 16, longitud máxima 256, weight decay 0,01 y warmup ratio 0,1. Se guardaron los pesos de la época con mejor macro-F1 en dev. Un detalle operativo importante: el código se normaliza antes de entrar al modelo (finales de línea unificados, tabuladores expandidos a cuatro espacios, espacios finales y líneas en blanco exteriores eliminados, función `normalise()` en `src/code_origin/data/preprocess.py`); replicar esa normalización es imprescindible para obtener predicciones coherentes. El artículo propone además un ensemble por semilla que promedia las probabilidades de las seis semillas.

## Capacidades

- Clasificación binaria de autoría: distingue código humano (etiqueta 0) de código generado por LLM (etiqueta 1).
- Clasificación multiclase de origen: identifica si el código es humano o de GEMINI, LLAMA o CODESTRAL.
- Variantes sin código editado: las tareas `_generate` están pensadas para escenarios donde se excluye el código generado y posteriormente modificado por LLM.
- Ensemble por semillas: permite promediar probabilidades de `seed3` a `seed8` para reducir varianza.
- Especialización en Python: entrenado sobre soluciones Python a problemas de CodeNet.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step; es un clasificador puro.
- No se declaran capacidades multilingües ni de visión/audio.

## Casos de uso

- Auditoría de repositorios académicos: clasificar entregas de programación para estimar la proporción de código generado por LLM, usando la variante `binary` y el ensemble de semillas para mayor estabilidad.
- Control de calidad de datasets de código: filtrar o etiquetar soluciones sintéticas antes de usarlas en entrenamiento, aplicando la variante `multiclass` para conocer el modelo de origen.
- Detección de atribución en pipelines de evaluación: integrar el clasificador como paso previo en un pipeline que normalice el código con `normalise()` y consulte el checkpoint adecuado.
- Investigación en procedencia de código: reproducir los resultados del artículo comparando encoders ajustados frente a líneas base de n-gramas sobre AIGCodeSet.
- Monitorización de contribuciones en entornos educativos: señalar fragmentos sospechosos de generación automática para revisión humana, nunca como decisión automática.
- Estudio de robustez frente a edición: usar las variantes `_generate` para analizar cómo cambia la detectabilidad cuando el código generado ha sido modificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo y al repositorio de GitHub para las métricas, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de precisión/recall sobre AIGCodeSet.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser un encoder base de orden de cientos de millones de parámetros, la inferencia en FP32 requiere del orden de 1 GB por checkpoint, aunque no se confirma en la información.
- GPU recomendadas: no disponible; cualquier GPU consumer moderna debería bastar para un encoder de este tamaño, pero no se documenta.
- Cabe en GPU consumer: probablemente sí, dado el tamaño típico de UniXcoder base; no confirmado.
- Opciones de despliegue: transformers (`AutoModelForSequenceClassification` con `subfolder`), endpoints compatibles según los tags del repositorio. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CODer-unixcoder | Encoder UniXcoder + cabeza | 256 tokens | Detección de código IA (Python) | MIT | Hugging Face |
| microsoft/unixcoder-base | Encoder UniXcoder | 512 tokens (típico) | Representaciones de código | MIT | Hugging Face |
| Líneas base de n-gramas del artículo | Estadístico | no aplica | Detección de código IA | no aplica | Repositorio del autor |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: entrenado solo con soluciones Python a 317 problemas de CodeNet y contra tres LLM (CodeLlama 34B, Codestral 22B, Gemini 1.5 Flash). No es un detector general de código escrito por IA.
- Riesgo de generalización limitada a otros lenguajes, otros modelos generadores u otros dominios de programación.
- Requiere replicar exactamente la normalización de entrada (`normalise()`) y el truncado a 256 tokens; desviarse puede degradar las predicciones.
- Posible sesgo hacia los estilos de los tres LLM del dataset; código de modelos no vistos puede clasificarse erróneamente.
- Riesgo de falsos positivos sobre código humano con estilo similar al generado, y de falsos negativos sobre código editado.
- El autor lo describe explícitamente como artefacto de investigación, no como herramienta de producción.
- Licencia MIT para pesos y código, pero los datos de entrenamiento están bajo CDLA-Permissive-2.0; conviene revisar las condiciones de uso comercial de los datos si se redistribuyen derivados.
- No se documentan idiomas soportados ni evaluaciones multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mparts/CODer-unixcoder
- Modelo base: https://huggingface.co/microsoft/unixcoder-base
- Dataset de entrenamiento: https://huggingface.co/datasets/basakdemirok/AIGCodeSet
- Repositorio del proyecto (código, predicciones y artículo): https://github.com/mparts/CODer
