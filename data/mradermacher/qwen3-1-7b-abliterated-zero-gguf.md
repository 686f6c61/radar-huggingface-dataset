# mradermacher/Qwen3-1.7B-Abliterated-Zero-GGUF

## Resumen

Qwen3-1.7B-Abliterated-Zero-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Qwen3-1.7B-Abliterated-Zero, publicado por el usuario 0xkaiken en Hugging Face. El repositorio lo mantiene mradermacher, conocido por generar y distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base deriva de la familia Qwen3 de Alibaba, en su variante de 1.700 millones de parametros, sobre la que se ha aplicado un proceso de "abliteracion" (una tecnica de modificacion de pesos que elimina direcciones de rechazo en el espacio de activaciones).

El interes de esta publicacion es practico: ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K hasta Q8_0 e IQ4_XS) para facilitar su ejecucion en hardware modesto, incluyendo GPUs de consumo y CPU. La abliteracion busca reducir las negativas del modelo a responder ciertas peticiones, un comportamiento que interesa a investigadores que estudian alineamiento, seguridad y comportamiento de modelos.

La informacion disponible publicamente sobre este repositorio concreto es muy limitada: no se declaran licencia, idiomas ni pipeline, y la model card se reduce a una nota indicando que se trata de cuantizaciones estaticas del modelo original. Los datos tecnicos que se detallan a continuacion provienen del modelo base Qwen3-1.7B cuando no se especifica lo contrario, y se marcan como no disponibles aquellos que no constan en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3-1.7B) |
| Parametros totales | 1.700 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura ni el proceso de entrenamiento del modelo base. Por el nombre, se trata de una variante de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3, pero la model card no aporta detalles sobre numero de tokens de entrenamiento, composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en el modelo original.

La innovacion especifica de esta variante es la abliteracion aplicada por 0xkaiken: una modificacion post-entrenamiento que identifica y elimina la direccion de activacion asociada al rechazo de peticiones, con el objetivo de que el modelo responda sin las negativas habituales del modelo alineado original. No se dispone de informacion sobre el metodo exacto, el numero de capas afectadas ni los datos empleados para calcular la direccion de rechazo. Las cuantizaciones de mradermacher son estaticas, generadas con quantize_version 2 y marcadas con output_tensor_quantised 1, lo que indica que los tensores de salida han sido cuantizados.

## Capacidades

- Generacion de texto autoregresiva, heredada de Qwen3-1.7B.
- Razonamiento y respuesta a instrucciones, sujeto a las modificaciones de la abliteracion.
- Generacion de codigo y matematicas basicas, como corresponde a la familia Qwen3.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: no confirmado para esta variante.
- Vision y audio: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteracion afecta a la tasa de rechazo y a la calidad de las respuestas, comparandolo con el Qwen3-1.7B original en tareas controladas.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en GPUs con 4-6 GB de VRAM o en CPU mediante llama.cpp, util para prototipos locales.
- Generacion de texto en entornos con recursos limitados: el tamano de 1.700 millones de parametros y las versiones Q2_K o Q3_K permiten inferencia en dispositivos de gama baja donde modelos mayores no caben.
- Experimentacion con tecnicas de cuantizacion: el repositorio ofrece una matriz amplia de niveles (Q2 a Q8) para comparar degradacion de calidad frente a tamano en un mismo modelo.
- Evaluacion de sesgos y comportamiento: util para analizar si la eliminacion de la direccion de rechazo altera la produccion de contenido sensible o los sesgos del modelo base.
- Filtrado y clasificacion de texto: con un contexto y una licencia por confirmar, puede emplearse en tareas de etiquetado o resumen de documentos cortos en pipelines locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en Q2_K, 1,5-2 GB en Q4_K_M, 2,5-3 GB en Q6_K y 3,5-4 GB en Q8_0 o f16 (estimaciones por tamano de pesos, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones medias; RTX 3060, RTX 4060, RTX 4090 o A100 para las versiones de mayor precision.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas para Q4_K_M e inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI requieren conversion previa a safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Abliterated-Zero-GGUF | 1.700 M | No disponible | No disponible | GGUF | Hugging Face |
| Qwen3-1.7B (original) | 1.700 M | No disponible | No disponible | Safetensors, GGUF | Hugging Face |
| Qwen3-1.7B-Abliterated-Zero (base) | 1.700 M | No disponible | No disponible | Safetensors | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion disponible no permite contrastar rendimiento con alternativas de otros autores sin inventar datos.

## Limitaciones y advertencias

- La abliteracion elimina la direccion de rechazo del modelo, lo que puede aumentar la probabilidad de generar contenido danino, sesgado o inapropiado; no debe desplegarse en produccion sin filtros externos.
- Riesgo de alucinacion: inherente a modelos de 1.700 millones de parametros, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Licencia no declarada en el repositorio: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base Qwen3-1.7B y del repositorio 0xkaiken/Qwen3-1.7B-Abliterated-Zero antes de cualquier uso.
- Idiomas soportados no documentados: el rendimiento en castellano u otros idiomas distintos del ingles no esta garantizado.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin consultar el modelo base.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la validacion comunitaria sobre su calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-1.7B-Abliterated-Zero-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/0xkaiken/Qwen3-1.7B-Abliterated-Zero
