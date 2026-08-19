# kerasformers/gemma-2b

## Resumen

kerasformers/gemma-2b es una conversión pura en Keras 3 del modelo original google/gemma-2b, desarrollada por el proyecto comunitario KerasFormers. Su objetivo es ofrecer una implementación unificada que funcione sin modificaciones en TensorFlow, PyTorch y JAX, facilitando el uso del modelo Gemma de 2 mil millones de parámetros en ecosistemas basados en Keras. Se trata de un checkpoint base (pretrained) destinado a generación de texto, con pesos almacenados en bfloat16 por defecto.

La relevancia de esta conversión radica en que permite a desarrolladores que ya trabajan con Keras 3 integrar un modelo de lenguaje de última generación sin depender de frameworks específicos, manteniendo la portabilidad entre backends. Además, ofrece opciones de cuantización int8 y carga en float32 para adaptarse a distintos requisitos de memoria. El modelo mantiene las mismas capacidades y limitaciones que el Gemma 2B original de Google, incluyendo su licencia gated y su enfoque principal en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en google/gemma-2b) |
| Parametros totales | 2 mil millones (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (heredado del modelo original) |
| Tipos de cuantizacion | bfloat16 (por defecto), float32, int8 (via argumento `quantization`) |
| Idiomas soportados | Ingles (segun la model card; el modelo original es multilingue pero esta conversion solo declara `en`) |
| Licencia | Gemma (gated, requiere aceptacion de terminos en el Hub) |
| Formato de pesos | no disponible (la model card no especifica el formato de archivo; el repo pesa 5.0 GB y se carga via `from_weights`) |

## Arquitectura y entrenamiento

El modelo es una conversion directa de los pesos de google/gemma-2b a Keras 3, por lo que su arquitectura es identica a la del modelo original: un transformer decoder-only con aproximadamente 2 mil millones de parametros, atención multi-cabeza y normalización RMSNorm. No se ha realizado ningún entrenamiento adicional ni fine-tuning en esta version; se sirve como checkpoint base para generacion de texto.

Los datos de entrenamiento y el proceso de entrenamiento del modelo original no estan detallados en la informacion proporcionada. Se sabe que Google entrenó Gemma con un corpus amplio y diverso, pero esta conversion no aporta nuevos datos al respecto. La implementacion en Keras 3 permite ejecutar el modelo en TensorFlow, PyTorch o JAX mediante la variable de entorno `KERAS_BACKEND`, y los pesos se cargan en bfloat16 por defecto, con soporte para cuantizacion int8 para reducir el uso de memoria.

## Capacidades

- Generacion de texto autoregresiva: el modelo puede completar texto o generar respuestas a partir de un prompt, aunque al ser un modelo base no esta optimizado para seguir instrucciones complejas.
- Soporte multiplataforma: la misma implementacion funciona en TensorFlow, PyTorch y JAX gracias a Keras 3, lo que facilita la experimentacion en diferentes entornos.
- Carga flexible: permite seleccionar precision bfloat16, float32 o cuantizacion int8 segun las necesidades de memoria y rendimiento.
- Compatibilidad con pesos originales: se puede cargar directamente desde Hugging Face usando el prefijo `hf:` (por ejemplo, `GemmaTextGenerate.from_weights("hf:google/gemma-2b")`).
- Tokenizador integrado: incluye un tokenizador Gemma propio en la libreria, accesible via `GemmaTokenizer.from_weights`.
- No incluye capacidades de tool calling, agentes, vision ni audio, ya que es un modelo de texto puro.

## Casos de uso

- Experimentacion con Keras 3: desarrolladores que quieran probar Gemma 2B dentro de un flujo de trabajo Keras pueden usar esta conversion para integrar el modelo en pipelines existentes sin cambiar de framework.
- Fine-tuning en multiples backends: al ser un checkpoint base, es adecuado para realizar fine-tuning con Keras en TensorFlow, PyTorch o JAX, aprovechando la portabilidad de la implementacion.
- Prototipado rapido de generacion de texto: para tareas simples como completar frases, generar borradores o crear demos, el modelo ofrece una forma sencilla de obtener salidas de texto con pocas lineas de codigo.
- Investigacion academica: investigadores que necesiten un modelo de 2B parametros con licencia permisiva (bajo terminos de Gemma) pueden utilizar esta conversion para estudiar el comportamiento del modelo en diferentes backends.
- Comparacion de rendimiento entre frameworks: al ejecutar el mismo modelo en TensorFlow, PyTorch y JAX, se pueden medir diferencias de latencia y throughput en distintos entornos de hardware.
- Desarrollo de aplicaciones offline: gracias a la cuantizacion int8, el modelo puede desplegarse en entornos con recursos limitados, como portatiles o dispositivos edge, para tareas de generacion de texto sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser una conversion del modelo google/gemma-2b, se espera que el rendimiento sea identico al del modelo original, pero no se proporcionan metricas especificas (MMLU, HumanEval, GSM8K, etc.) en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en bfloat16 para el modelo de 2B parametros (considerando pesos y activaciones). Con cuantizacion int8, el uso de memoria se reduce a unos 2-3 GB.
- GPU recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB) o superiores son suficientes para inferencia en bfloat16. Para cuantizacion int8, una GPU con 6 GB de VRAM puede ser suficiente.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de gama media y alta para consumo personal.
- Opciones de despliegue: la libreria kerasformers permite ejecutar el modelo directamente en Python con Keras. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no se han proporcionado datos concretos de latencia o throughput. Dependera del backend utilizado (TensorFlow, PyTorch o JAX) y del hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de la misma categoria (por ejemplo, phi-2, StableLM-2-1.6B, etc.) en esta ficha. Sin embargo, se puede comparar directamente con el modelo original google/gemma-2b:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kerasformers/gemma-2b | 2B | 8192 | Gemma (gated) | Hugging Face |
| google/gemma-2b | 2B | 8192 | Gemma (gated) | Hugging Face |

La principal diferencia es el formato de implementacion: kerasformers ofrece una version en Keras 3 multiplataforma, mientras que google/gemma-2b se distribuye en formatos nativos de PyTorch/JAX. El rendimiento y las capacidades son identicos.

## Limitaciones y advertencias

- Licencia gated: el modelo requiere aceptar los terminos de uso de Gemma en el Hub de Hugging Face antes de descargarlo, lo que puede limitar su uso en entornos corporativos si no se cumplen las condiciones.
- Modelo base sin fine-tuning instructivo: no esta optimizado para seguir instrucciones complejas ni para dialogos multi-turno; puede producir respuestas incoherentes o irrelevantes en tareas de asistencia.
- Sesgos y alucinaciones: al ser un modelo base entrenado con datos web, puede reflejar sesgos presentes en los datos de entrenamiento y generar contenido falso o inventado. No se proporcionan detalles especificos sobre sesgos conocidos.
- Idioma principal: aunque el modelo original de Google es multilingue, esta conversion solo declara soporte para ingles en su model card, por lo que su rendimiento en otros idiomas no esta garantizado.
- Riesgo en produccion: sin evaluacion adicional de seguridad y robustez, no se recomienda su uso directo en aplicaciones criticas sin un fine-tuning y pruebas exhaustivas.
- Formato de pesos no documentado: no se especifica si los pesos estan en formato safetensors, .keras o .h5, lo que puede dificultar su integracion con otras herramientas que esperan formatos estandar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kerasformers/gemma-2b
- Repositorio en GitHub: https://github.com/IMvision12/KerasFormers
- Documentacion de Gemma en KerasFormers: https://imvision12.github.io/KerasFormers/gemma/
- Model card original de google/gemma-2b: https://huggingface.co/google/gemma-2b
- Paper de Gemma (arXiv): https://arxiv.org/abs/2403.08295
