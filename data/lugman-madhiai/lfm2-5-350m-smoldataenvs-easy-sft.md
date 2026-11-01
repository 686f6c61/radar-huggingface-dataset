# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT

## Resumen

LFM2.5-350M-SmolDataEnvs-Easy-SFT es un ajuste fino (fine-tuning) supervisado del modelo base LiquidAI/LFM2.5-350M, publicado en Hugging Face por el usuario lugman-madhiai. El modelo base pertenece a la familia LFM (Liquid Foundation Models) de Liquid AI, una arquitectura alternativa a los transformers convencionales optimizada para eficiencia en dispositivos con recursos limitados. La versión afinada se entrenó con la librería Unsloth junto con TRL de Hugging Face, lo que permitió acelerar el entrenamiento (según el autor, 2 veces más rápido que con métodos estándar).

El nombre del repositorio sugiere que el ajuste fino se realizó sobre un dataset denominado "SmolDataEnvs-Easy", aunque no se publica información sobre la composición de los datos ni sobre los objetivos concretos del entrenamiento. Con unos 354 millones de parámetros y un tamaño de repositorio de 0,7 GB en formato safetensors, se trata de un modelo ligero orientado a generación de texto conversacional, relevante para casos de uso en los que se necesita un modelo compacto, con licencia Apache 2.0, ejecutable en hardware modesto o incluso en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (arquitectura propia de Liquid AI, no disponible el detalle exacto) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 implícitos en safetensors) |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un modelo de la familia LFM de Liquid AI. La familia LFM emplea arquitecturas híbridas que combinan capas convolucionales tipo gated linear (inspiradas en modelos de estado de espacio como los usados en LFM1) con capas de atención estándar, buscando un equilibrio entre calidad de generación y eficiencia en memoria y latencia. La model card del derivado no detalla la configuración exacta de la arquitectura, por lo que hay que remitirse a la documentación del modelo base para más información.

El ajuste fino se realizó mediante aprendizaje supervisado (SFT) con la librería TRL de Hugging Face y el framework Unsloth, que optimiza el entrenamiento de LoRA y modelos pequeños para reducir el consumo de memoria y acelerar el proceso. Según el autor, el entrenamiento fue "2x más rápido" gracias a Unsloth. No se especifica el dataset empleado (el nombre "SmolDataEnvs-Easy" sugiere un conjunto de datos relacionado con entornos de datos sencillos, pero no hay confirmación), ni el número de tokens, épocas ni hiperparámetros. Tampoco hay indicios de que se haya aplicado RLHF o DPO posterior.

## Capacidades

- Generacion de texto conversacional: el modelo hereda la capacidad de generación de texto del modelo base LFM2.5-350M, etiquetado como "conversational".
- Ajuste fino supervisado (SFT): presumiblemente especializado en la tarea o dominio del dataset "SmolDataEnvs-Easy", aunque no se documenta.
- Compatibilidad con la librería transformers de Hugging Face y con endpoints de inferencia ("endpoints_compatible").
- Etiquetado para text-generation-inference, lo que sugiere compatibilidad con el servidor TGI.
- Capacidades de tool calling, agentes, vision o audio: no disponible (no se mencionan en la model card).
- Soporte multilingue: no disponible; solo se declara el ingles.

## Casos de uso

- Chatbots ligeros en local: con solo 354 millones de parametros y 0,7 GB de pesos, el modelo puede ejecutarse en portatiles o maquinas sin GPU dedicada, siendo adecuado para asistentes conversacionales simples en entornos offline.
- Experimentacion con fine-tuning: al tratarse de un derivado comunitario entrenado con Unsloth y TRL, sirve como ejemplo practico para desarrolladores que quieran reproducir el flujo de ajuste fino eficiente de modelos pequenos.
- Prototipado rapido de agentes de texto: su tamano reducido permite iteraciones rapidas en pipelines de prototipado antes de escalar a modelos mayores.
- Integracion en aplicaciones edge: la eficiencia de la familia LFM y el tamano compacto lo hacen candidato para despliegues en dispositivos con recursos limitados (moviles, IoT, embedded), aunque sin garantias documentadas.
- Generacion de texto en ingles para tareas sencillas: dado el etiquetado monolingue en ingles, es util para completaciones y respuestas cortas en ese idioma.
- Base para futuros ajustes finos: puede emplearse como punto de partida para nuevos fine-tunings especificos, aprovechando la licencia Apache 2.0 sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni otras), ni comparativas con el modelo base o con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 354 millones de parametros en precision fp16/bf16, el modelo ocupa aproximadamente 0,7 GB de memoria para los pesos; con overhead de KV cache y activaciones, entre 1 y 2 GB de VRAM son suficientes (o incluso ejecutable en CPU con RAM modesta).
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (incluso integradas o una RTX 3050/4060) es mas que suficiente. Para entrenamiento o nuevos fine-tunings, una GPU de gama media con 8-12 GB (RTX 3060/4070) seria adecuada gracias a Unsloth.
- Cabe en consumer GPU: si, sobradamente; incluso cabe en la mayoria de portatiles sin GPU dedicada ejecutando en CPU.
- Opciones de despliegue: transformers (libreria nativa declarada), TGI (etiquetado text-generation-inference y endpoints_compatible). La compatibilidad con llama.cpp, Ollama o vLLM no esta documentada en la model card (no hay pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponible; por su tamano, se espera latencia baja y throughput razonable incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-SFT (este modelo) | 354M | no disponible | Apache 2.0 | Fine-tune comunitario SFT con Unsloth/TRL |
| LiquidAI/LFM2.5-350M (base) | 354M | no disponible | Apache 2.0 (segun familia LFM) | Modelo base de Liquid AI, mas documentacion y soporte oficial |
| Qwen2.5-0.5B-Instruct | 494M | 32K (segun ficha oficial) | Apache 2.0 | Alternativa compacta con soporte multilingue amplio y tool calling |
| SmolLM2-360M-Instruct (HuggingFaceTB) | 360M | 8K (segun ficha oficial) | Apache 2.0 | Modelo compacto de Hugging Face orientado a chat y tareas on-device |

Nota: los datos de contexto de los modelos comparativos provienen de sus fichas oficiales; para el modelo de esta ficha no se ha publicado ese dato.

## Limitaciones y advertencias

- Falta de documentacion: la model card es minima; no describe el dataset de entrenamiento, hiperparametros, ni el proposito exacto del fine-tuning, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje, y agravado por el tamano reducido (354M de parametros) y la ausencia de evaluaciones publicadas.
- Idioma: solo se declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Sesgos: no se ha documentado ningun analisis de sesgos; el modelo hereda los sesgos del corpus de preentrenamiento de LFM2.5-350M y de los datos del fine-tuning.
- Contexto: la longitud de ventana de contexto no esta publicada en la informacion disponible, lo que limita la planificacion de casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (LiquidAI/LFM2.5-350M) y de cualquier dato de entrenamiento derivado.
- Calidad del fine-tuning: al tratarse de un derivado comunitario sin metricas ni validacion publica, se recomienda evaluacion propia antes de cualquier despliegue serio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (framework de entrenamiento usado): https://github.com/unslothai/unsloth
- TRL (libreria de Hugging Face usada en el entrenamiento): https://github.com/huggingface/trl
- Organizacion de Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
