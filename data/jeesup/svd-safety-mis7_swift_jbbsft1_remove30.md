# Jeesup/svd-safety-mis7_swift_jbbsft1_remove30

## Resumen

svd-safety-mis7_swift_jbbsft1_remove30 es un checkpoint de investigación derivado de mistralai/Mistral-7B-Instruct-v0.2, publicado por el usuario Jeesup. No es un modelo entrenado desde cero ni un asistente conversacional listo para producción: es una celda concreta dentro de una rejilla experimental que estudia cómo la compresión por descomposición en valores singulares (SVD) degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El checkpoint combina una compresión Swift-SVD con asignación dinámica de rango (alpha 0,6, calibración de 256 x 2048 sobre WikiText-2) que elimina el 30,00 % de los parámetros densos, seguida de una recuperación mediante LoRA de etapa 2 al estilo SVD-LLM.

Arquitectónicamente hereda la estructura del modelo base: un transformer decoder-only de tipo Mistral, con 7.241.732.096 parámetros en el checkpoint y un repositorio de 14,5 GB en safetensors. Es relevante ahora porque se enmarca en la línea de trabajo sobre compresión agresiva de LLM y su impacto en la alineación: la propia model card advierte de que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base, y que la compresión por sí sola eleva la tasa de éxito de ataque.

El interés práctico es, por tanto, metodológico y de evaluación: sirve como sujeto experimental reproducible (semilla 42, métricas publicadas de ASR y sobre-rechazo) para estudiar el compromiso entre seguridad y utilidad bajo presupuestos de compresión. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral); parametros comprimidos mediante Swift-SVD con asignacion dinamica de rango |
| Parametros totales | 7.241.732.096 (dato real de los safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Mistral-7B-Instruct-v0.2 declara 32.768 tokens |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos safetensors); al derivar de una arquitectura Mistral estandar es convertible a GGUF, GPTQ o AWQ con herramientas habituales |
| Idiomas soportados | No disponible en la model card; el modelo base declara ingles, frances, aleman, espanol e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El punto de partida es Mistral-7B-Instruct-v0.2, un transformer decoder-only de 7.241.732.096 parametros con atencion de consultas agrupadas (GQA) y ventana deslizante. Sobre ese checkpoint se aplica Swift-SVD con asignacion dinamica de rango, alpha 0,6 y una calibracion de 256 muestras de 2048 tokens extraidas de WikiText-2, con una semilla fija de 42. El resultado elimina el 30,00 % de los parametros densos, dejando una fraccion de parametros resultante de 0,7003. Los rangos por matriz quedan registrados en el fichero `compression.json` del repositorio. Es importante senalar que el recuento real de parametros del checkpoint coincide con el del modelo denso completo, de modo que el ahorro del 30 % se refiere al rango efectivo de las matrices y no a una reduccion de la huella en disco (14,5 GB) ni del numero de tensores almacenados.

Tras la compresion se aplica una recuperacion con LoRA de etapa 2 siguiendo el esquema de SVD-LLM: descomposicion secuencial de U y luego V, sobre el dataset `alpaca_cleaned_jbbsft_x1.json`, con r=8, alpha=16, 2 epocas por mitad, learning rate 1e-4, batch de 64 y cutoff de 256. No se documenta en la informacion disponible ningun entrenamiento adicional con RLHF o DPO especifico para este checkpoint, ni el numero total de tokens de preentrenamiento del modelo base. La innovacion tecnica destacable es precisamente el pipeline compresion + reparacion LoRA y su uso como instrumento de medida del dano en seguridad, no una mejora de capacidades.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Mistral-7B-Instruct-v0.2.
- Razonamiento e instrucciones en formato chat, con el template del modelo base.
- Capacidad multilingue no verificada en esta ficha; el modelo base declara cinco idiomas.
- No se documenta soporte explicito de tool calling ni de function calling en la model card.
- No se documenta soporte de agentes ni de razonamiento multi-paso especifico.
- No hay modo thinking, vision ni audio.
- Capacidad instrumental como sujeto experimental: permite medir tasa de exito de ataque (ASR), sobre-rechazo y perplejidad bajo un presupuesto de compresion concreto.
- Permite reproducir una celda concreta de una rejilla de reglas de seleccion y presupuestos, con semilla fija.

## Casos de uso

- Investigacion sobre compresion de LLM: usar el checkpoint como una celda de referencia (30 % de parametros eliminados, alpha 0,6) y comparar su perplejidad en WikiText-2 (8,4366) frente a otras ramas de la rejilla para aislar el efecto de la regla de asignacion de rango.
- Evaluacion de seguridad y red-teaming: ejecutar AdvBench y StrongREJECT con un juez tipo HarmBench para reproducir los valores publicados (ASR de 0,1038 y 0,1310) y estudiar como la compresion altera la tasa de exito de ataque.
- Calibracion de umbrales de sobre-rechazo: emplear la metrica macro de sobre-rechazo con WildGuard (0,2591) para analizar el equilibrio entre rechazo excesivo y fuga de contenido danino en modelos comprimidos.
- Estudio de interpretabilidad: analizar las matrices de rango reducido y los espectros singulares para localizar que componentes concentran el comportamiento de seguridad, aprovechando que la asignacion de rangos por matriz es publica.
- Benchmark de pipelines de reparacion: comparar la LoRA de etapa 2 (r=8, alpha=16, secuencial U y V) frente a otras estrategias de recuperacion sobre el mismo checkpoint comprimido, midiendo recuperacion de perplejidad y de seguridad.
- Analisis de coste/beneficio de despliegue: dado que el checkpoint conserva el recuento denso de parametros, sirve para cuantificar cuanto ahorro real (en latencia, memoria o calidad) aporta la compresion por rango efectivo frente al coste de almacenamiento.
- Docencia y reproducibilidad: como artefacto con semilla fija y configuracion documentada, es util en cursos o articulos sobre compresion y alineacion, siempre acompanado de la advertencia de que no es un asistente desplegable.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,1038 |
| StrongREJECT | ASR (juez HarmBench) | 0,1310 |
| WildGuard | Macro over-refusal | 0,2591 |
| WikiText-2 | Perplejidad | 8,4366 |

No se han publicado en la informacion disponible valores comparativos del modelo base ni de otras ramas de la rejilla, por lo que no es posible presentar una tabla diferencial. No se han encontrado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidades para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 15-16 GB, coherente con un repositorio de 14,5 GB y 7.241.732.096 parametros densos.
- Cuantizacion a 8 bits: aproximadamente 8 GB de VRAM estimados. A 4 bits: aproximadamente 4,5-5 GB estimados. Estas conversiones no estan publicadas en el repositorio.
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB o RTX 3090 24 GB.
- Cabe en GPU de consumo en 4 bits (RTX 3060 12 GB, RTX 4070, RTX 4090) y en fp16 en tarjetas de 16 GB o mas, con margen ajustado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`) y, previsiblemente, vLLM y llama.cpp/Ollama si se convierte a GGUF, aunque no hay artefactos de cuantizacion publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-mis7_swift_jbbsft1_remove30 | 7,24 B (rango efectivo al 70,03 %) | No disponible (base: 32.768) | Apache 2.0 | Artefacto de investigacion, no apto como asistente general |
| mistralai/Mistral-7B-Instruct-v0.2 (modelo base) | 7,24 B | 32.768 tokens | Apache 2.0 | Referencia sin comprimir; no se han publicado en la informacion disponible sus metricas comparables |
| Zephyr-7B-beta | ~7 B (base Mistral-7B-v0.1) | 32.768 tokens (nominal) | MIT | Alternativa afinada con DPO; no comparable en seguridad bajo compresion |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Licencia comunitaria Llama 3.1 | Alternativa de tamano similar con contexto mucho mayor; el rendimiento frente a este checkpoint no esta disponible |

No se dispone de resultados de benchmarks homogeneos que permitan una comparacion cuantitativa directa entre este checkpoint y las alternativas listadas.

## Limitaciones y advertencias

- La model card indica explicitamente que varias ramas de la rejilla estan deliberadamente degradadas en seguridad respecto a Mistral-7B-Instruct-v0.2 y que la compresion por si sola eleva la tasa de exito de ataque. No debe desplegarse como asistente.
- Riesgo elevado de alucinacion y de comportamiento inconsistente, agravado por la compresion SVD y la reparacion LoRA limitada (r=8, 2 epocas por mitad, dataset de tipo alpaca limpio).
- El checkpoint conserva el recuento denso de parametros, por lo que el ahorro del 30 % es de rango efectivo y no reduce la huella de almacenamiento ni, necesariamente, la de computo en inferencia.
- Metricas de seguridad no ideales: ASR de 0,1038 en AdvBench y 0,1310 en StrongREJECT, junto con un sobre-rechazo macro de 0,2591 medido con WildGuard.
- Idiomas soportados no confirmados para este checkpoint; la degradacion de capacidades puede afectar de forma desigual a idiomas distintos del ingles.
- La model card senala que el repositorio del modelo base no incluye fichero de licencia para redistribuir; la Apache 2.0 declarada gobierna unicamente este derivado, lo que conviene revisar antes de cualquier uso comercial.
- No hay datos publicados de cuantizacion, latencia, throughput ni de comportamiento en produccion.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo; todas las metricas proceden de la model card del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_jbbsft1_remove30
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Perfil del autor: https://huggingface.co/Jeesup
- Paper de SVD-LLM (referencia metodologica citada en la model card): enlace no disponible en la informacion proporcionada
- Paper de Swift-SVD (referencia metodologica citada en la model card): enlace no disponible en la informacion proporcionada
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
