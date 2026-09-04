# collision-10M/collision-10m

## Resumen

COLLISION-10M es un modelo de lenguaje causal (transformer decoder-only) de 10,28 millones de parámetros desarrollado por el proyecto COLLISION bajo la autoría de collision-10M. Se trata de un modelo base, no afinado por instrucciones, diseñado como herramienta educativa y de investigación para experimentar con arquitecturas transformer de pequeño tamaño y entrenamiento desde cero. Su desarrollo sigue una hoja de ruta de escalado progresivo que comenzó con COLLISION-1.46M y COLLISION-3.38M, y culmina con este modelo de 10M entrenado con un presupuesto de 10.000.384 tokens. La relevancia actual radica en su enfoque CPU-first, que permite estudiar el ciclo completo de entrenamiento, inferencia y despliegue de un modelo de lenguaje en hardware modesto, sin necesidad de infraestructura GPU.

Con una ventana de contexto de 256 tokens, 6 capas, dimensión de modelo 384, 8 cabezas de atención y una dimensión de feedforward de 768, el modelo se presenta como un caso de estudio práctico para comprender los fundamentos de la generación autoregresiva. Incluye un tokenizador BPE personalizado con vocabulario activo de 890 tokens (capacidad de 8.000) y ha sido evaluado con métricas de perplejidad propias del entorno de entrenamiento. El repositorio incluye además una API FastAPI y un playground Streamlit para facilitar su uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal |
| Parametros totales | 10.282.304 (10,28M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (.pt) según documentación; no se mencionan safetensors ni GGUF |
| Capas (n_layer) | 6 |
| d_model | 384 |
| Cabezas de atención | 8 |
| d_ff | 768 |
| Tokenizador | BPE personalizado (vocabulario activo: 890, capacidad: 8.000) |
| Datos de entrenamiento | 10.000.384 tokens (dataset collision_dataset_v5_expanded) |
| Métricas de validación | Perplejidad de validación: 2,11; perplejidad de test: 1,79 |

## Arquitectura y entrenamiento

COLLISION-10M es un transformer causal de 6 capas con d_model de 384, 8 cabezas de atención y una dimensión de feedforward de 768. Se entrenó desde cero (inicialización aleatoria) sobre el dataset sintético collision_dataset_v5_expanded, compuesto por 10.000.384 tokens. El tokenizador es un BPE personalizado con un vocabulario activo de 890 tokens y una capacidad de 8.000. No se mencionan técnicas de RLHF ni DPO; al ser un modelo base, no ha sido afinado para seguir instrucciones. La innovación técnica destacable es su enfoque de desarrollo CPU-first, que prioriza la reproducibilidad y la experimentación con presupuestos de entrenamiento muy reducidos. La serie COLLISION documenta una progresión de escalado desde 1,46M hasta 10M parámetros, con mejoras en la limpieza y deduplicación del dataset en versiones anteriores.

## Capacidades

- Generación de texto autoregresiva (completado causal de texto).
- Razonamiento básico limitado por el tamaño del modelo y la ventana de contexto.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponible.
- Incluye interfaz de API FastAPI y playground Streamlit para experimentación local.

## Casos de uso

- Enseñanza de arquitecturas transformer: el modelo permite a estudiantes y docentes inspeccionar un transformer causal completo de 6 capas y ejecutar inferencia local en CPU para entender el flujo de atención y generación.
- Experimentación con tokenizadores BPE personalizados: al disponer de un tokenizador con vocabulario activo de 890 tokens, es útil para estudiar el impacto del tamaño del vocabulario en la perplejidad y en la tasa de repetición.
- Investigación sobre scaling laws en modelos pequeños: la serie COLLISION permite comparar modelos de 1,46M, 3,38M y 10M bajo presupuestos de entrenamiento controlados, lo que facilita el análisis de curvas de escalado.
- Prototipado de pipelines de inferencia en CPU: con un throughput de 42,38 tokens/s y un consumo medio de 476,3 MB de RAM, es adecuado para validar arquitecturas de despliegue en entornos sin GPU.
- Benchmarks de rendimiento de completado de texto: sirve como referencia para medir latencia y perplejidad en tareas de autocompletado con contextos cortos.
- Integración de APIs locales: el repositorio incluye un servidor FastAPI y un cliente Python/JavaScript, lo que permite probar el ciclo completo de petición-respuesta para aplicaciones educativas.
- Desarrollo de herramientas de análisis de repetición: la tasa de repetición del 41,1% y el ratio de tokens únicos del 58,9% hacen que sea un modelo útil para investigar estrategias de mitigación de repetición en generación autoregresiva.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Loss de validación (mejor checkpoint, step 2.500) | 0,7454 |
| Perplejidad de validación | 2,11 |
| Loss de test | 0,5805 |
| Perplejidad de test | 1,79 |
| Tasa de repetición | 41,1% |
| Ratio de tokens únicos | 58,9% |
| Tasa de terminación | 62,5% |
| Throughput CPU | 42,38 tokens/s |
| Latencia media de API | 2.317,6 ms (para 97 tokens de media) |
| Memoria RAM media | 476,3 MB |
| Memoria RAM pico | 614,1 MB |

Estas métricas son específicas del entorno de pretraining COLLISION y no son directamente comparables con modelos de lenguaje de gran escala. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: no disponible; no se requiere GPU para la inferencia según la documentación.
- Cabe en GPU de consumo: no se especifica, pero por su tamaño (10,28M parámetros) cualquier GPU con al menos 1 GB de VRAM podría alojarlo; no obstante, no hay datos oficiales.
- Opciones de despliegue: FastAPI local, Streamlit playground, script Python directo (release_inference.py). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 42,38 tokens/s en CPU; latencia media de API de 2.317,6 ms para una generación media de 97 tokens; RAM media 476,3 MB y pico 614,1 MB.

## Comparativa con modelos similares

No se dispone de información detallada sobre modelos comparables en la documentación proporcionada. La serie COLLISION incluye COLLISION-1.46M y COLLISION-3.38M como modelos anteriores, pero no se proporcionan especificaciones de estos modelos. En la búsqueda web no se encontraron benchmarks ni fichas de modelos comparables.

## Limitaciones y advertencias

- El número de parámetros (10,28M) limita notablemente la capacidad de representación y la calidad del texto generado.
- La ventana de contexto de 256 tokens restringe el uso a tareas de completado corto.
- Es un modelo base, no afinado por instrucciones: continúa texto en lugar de mantener conversaciones.
- El entrenamiento se realizó con solo 10M de tokens, lo que limita la cobertura del lenguaje y el conocimiento factual.
- La latencia en CPU es elevada (2.317,6 ms de media para 97 tokens), lo que lo hace inadecuado para aplicaciones en tiempo real.
- Presenta una tasa de repetición del 41,1%, lo que puede producir bucles de texto.
- La información generada puede ser incorrecta; no es una base de datos factual.
- No está ajustado en seguridad, por lo que no es apto para aplicaciones críticas.
- El vocabulario activo de 890 tokens es extremadamente reducido, lo que limita la variedad léxica.

## Enlaces

- HuggingFace: https://huggingface.co/collision-10M/collision-10m
- Repositorio GitHub: https://github.com/viraj3106/Collision-1.46M.git
- No se encontraron papers, blogs o demos adicionales en la búsqueda web.
