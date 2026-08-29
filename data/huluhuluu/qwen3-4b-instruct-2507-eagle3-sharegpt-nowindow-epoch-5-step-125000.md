# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-5-step-125000

## Resumen

Este repositorio contiene un modelo de borrador (draft model) EAGLE3 para decodificación especulativa, entrenado por el usuario huluhuluu sobre el modelo objetivo Qwen/Qwen3-4B-Instruct-2507. No es un modelo de chat independiente: su única función es acelerar la inferencia del modelo base cuando se combina mediante el algoritmo EAGLE3 en el servidor de inferencia SGLang. El checkpoint concreto de este repositorio corresponde a la época 5, paso 125000 de un entrenamiento online de 10 épocas y 231810 pasos.

La arquitectura es una variante de LLaMA denominada `LlamaForCausalLMEagle3`, con una sola capa de decoder, 202,7 millones de parámetros y pesos en bfloat16. El entrenamiento se realizó con SpecForge sobre datos ShareGPT limpios, sin ventana deslizante, y está diseñado para emparejarse exclusivamente con la familia del modelo objetivo. Su relevancia radica en que permite reducir la latencia de generación de Qwen3-4B-Instruct-2507 en entornos de producción sin modificar el modelo final, una técnica cada vez más utilizada para optimizar el coste por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, 32 cabezas de atencion, 8 cabezas K/V, hidden size 2560, intermediate size 9728) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de borrador; el entrenamiento uso secuencias de 2048 tokens) |
| Tipos de cuantizacion | bfloat16 (sin otras cuantizaciones publicadas) |
| Idiomas soportados | No disponible (depende del modelo objetivo Qwen3-4B-Instruct-2507, que es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura EAGLE3 (Extrapolation Algorithm for Greater Language-model Efficiency) sobre una base LLaMA adaptada. Es un modelo de una sola capa que predice los siguientes tokens del modelo objetivo (Qwen3-4B-Instruct-2507) para generar múltiples candidatos en paralelo, que luego son verificados por el modelo principal. El entrenamiento se realizó con SpecForge en modo online, es decir, el draft se entrena mientras se ejecuta la verificación contra el modelo objetivo. Los datos provienen de un dataset ShareGPT limpio (revisión no registrada), con un tamaño de lote efectivo de 4, tasa de aprendizaje 1e-4 con warmup lineal del 1,5% y decaimiento coseno, y sin weight decay. El entrenamiento usó una longitud máxima de secuencia de 2048 tokens, una longitud TTT (test-time training) de 7, atención con `sdpa` y backend objetivo SGLang con FlashInfer. No se aplicó ventana deslizante (NoWindow).

## Capacidades

- Aceleracion de la inferencia de Qwen3-4B-Instruct-2507 mediante decodificacion especulativa EAGLE3.
- Generacion de multiples tokens candidatos por paso (hasta 4 tokens de borrador configurados en el ejemplo de uso).
- Integracion nativa con SGLang mediante los parametros `--speculative-algorithm EAGLE3` y `--speculative-draft-model-path`.
- No es un modelo de chat: no genera respuestas por si mismo ni soporta tool calling, razonamiento o capacidades linguisticas propias.
- Compatible con el ecosistema Transformers (libreria `transformers`) y con `text-generation-inference`.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Qwen3-4B-Instruct-2507 en SGLang con este draft model permite reducir el tiempo de primer token y el tiempo entre tokens en aplicaciones de atencion al cliente o asistentes conversacionales, manteniendo la calidad del modelo base.
- Optimizacion de costes de inferencia: al acelerar la generacion sin cambiar el modelo objetivo, se puede servir el mismo trafico con menos GPUs o reducir la latencia en instancias existentes.
- Evaluacion de tecnicas de speculative decoding: este checkpoint (y el resto de la coleccion de 47) sirve para estudiar el efecto del numero de pasos de entrenamiento en la tasa de aceptacion de tokens y en la velocidad efectiva.
- Despliegue en entornos con restricciones de VRAM: el draft model ocupa solo 0,4 GB, por lo que puede caber junto al modelo base en GPUs consumer como la RTX 4090 (24 GB) sin necesidad de hardware de datacenter.
- Investigacion en metodos de decodificacion acelerada: los checkpoints intermedios permiten analizar la dinamica de convergencia del entrenamiento online de EAGLE3.
- Integracion en pipelines de ML Ops: al ser un artefacto compatible con SGLang, se puede incorporar como un componente mas en infraestructuras de inferencia gestionadas con Kubernetes o sistemas de orquestacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para esta ejecucion. Por tanto, no es posible ofrecer datos de MMLU, HumanEval, GSM8K ni tasas de aceptacion de tokens.

## Requisitos de hardware

- VRAM estimada para el draft model solo: aproximadamente 0,4 GB en bfloat16 (202,7 millones de parametros).
- VRAM total para el sistema completo (draft + modelo objetivo Qwen3-4B-Instruct-2507): el modelo base requiere alrededor de 8 GB en bfloat16, por lo que el conjunto cabe en GPUs consumer de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090, etc.).
- GPUs recomendadas: cualquier GPU con soporte CUDA o ROCm; para produccion con SGLang se recomienda una GPU con al menos 16 GB (A100 40 GB, H100, L4, RTX 4090).
- Opciones de despliegue: SGLang (backend principal), tambien puede cargarse con Transformers para pruebas, aunque su uso previsto es como ruta de draft en SGLang.
- Latencia y throughput: no disponibles sin benchmarks; el beneficio esperado es una reduccion de 1,5x a 2,5x en tokens por segundo tipica de EAGLE3, pero depende de la carga de trabajo y de los parametros `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.

## Comparativa con modelos similares

No se dispone de datos publicados de otros draft models especificos para Qwen3-4B-Instruct-2507 que permitan una comparativa cuantitativa. Como referencia cualitativa:

| Modelo | Tipo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (modelo base) | Chat instruct | 4B | 32K (aprox.) | Apache-2.0 | Generacion directa |
| Este draft model (EAGLE3) | Borrador especulativo | 202M | No aplica | Apache-2.0 | Aceleracion del modelo base con SGLang |
| Medusa (metodo alternativo) | Borrador especulativo | ~1-2% del modelo base | No aplica | MIT (varia) | Aceleracion con arquitectura de cabezas multiples |

La principal diferencia frente a otros metodos es que EAGLE3 utiliza una capa de transformador adicional en lugar de cabezas de clasificacion independientes, lo que suele ofrecer mejores tasas de aceptacion. No obstante, requiere el backend SGLang para su ejecucion.

## Limitaciones y advertencias

- Este modelo no es un chat model: usarlo de forma independiente producira salidas sin sentido. Debe emparejarse exclusivamente con Qwen/Qwen3-4B-Instruct-2507.
- No se registraron metricas de evaluacion ni de seguridad durante el entrenamiento; el autor recomienda validar el comportamiento en el caso de uso especifico antes de desplegar en produccion.
- El entrenamiento se realizo sobre datos ShareGPT, que pueden contener sesgos conversacionales y contenido no moderado; el draft model puede heredar estos sesgos en sus predicciones.
- La longitud de secuencia maxima de entrenamiento fue de 2048 tokens; aunque el modelo no tiene ventana propia, el rendimiento de la decodificacion especulativa puede degradarse con contextos mucho mayores.
- La coleccion incluye 47 checkpoints; este repositorio es uno de ellos (epoch 5, step 125000) y puede que no sea el optimo para todas las cargas de trabajo. Se recomienda evaluar varios checkpoints para elegir el mejor.
- El archivo `training_state.pt` contiene estado de optimizador y debe tratarse como no confiable fuera de entornos controlados.
- La licencia Apache-2.0 permite uso comercial, pero el modelo objetivo (Qwen3-4B-Instruct-2507) tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-5-step-125000
- Coleccion de checkpoints (47 repositorios): https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Guia de despliegue local de Qwen3-4B-Instruct-2507 (Ollama y Python): https://aiindigo.com/tutorials/getting-started-with-qwen3-4b-instruct-2507-deploying-efficient-local-ai
- Ejecucion en NPU (llama.cpp, ONNX Runtime QNN, Qualcomm AI Hub): https://github.com/locomotive-works/npu-local-model-running
- Informacion del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
