# mpichaa/Sushi_AI_Model

## Resumen

Sushi_AI_Model es un ajuste fino (fine-tune) del modelo instructivo Qwen2.5-7B-Instruct, desarrollado por el usuario mpichaa y publicado en Hugging Face bajo licencia Apache 2.0. El modelo está etiquetado como orientado a la generación de texto en inglés y fue entrenado con la librería Unsloth, que acelera el proceso de ajuste fino en GPUs de consumo. No se proporcionan detalles sobre el conjunto de datos de entrenamiento ni sobre las tareas específicas para las que fue optimizado, más allá de ser una adaptación del modelo base de 7 mil millones de parámetros.

La relevancia de este modelo reside en su carácter de ejemplo de ajuste fino accesible: parte de un modelo base potente (Qwen2.5-7B-Instruct) y utiliza técnicas de cuantización (bnb-4bit) para reducir el tamaño del repositorio a 0.2 GB, lo que facilita su despliegue en entornos con recursos limitados. Sin embargo, al carecer de documentación adicional, su utilidad práctica queda supeditada a la evaluación directa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 7 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no especificado (el modelo base Qwen2.5-7B-Instruct soporta 128k tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no especificado; el modelo base usa bnb-4bit, y el tamano del repo (0.2 GB) sugiere cuantizacion de 4 bits |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun los tags) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`, que a su vez es una version cuantizada a 4 bits del modelo instructivo Qwen2.5-7B. La arquitectura subyacente es un transformer decoder-only con atencion por ventanas deslizantes y soporte nativo para ventanas de contexto largas (hasta 128k tokens en el modelo base). El entrenamiento se realizo con la libreria Unsloth, que optimiza el uso de memoria y velocidad mediante kernels personalizados y cuantizacion durante el ajuste fino. Tambien se menciona la libreria TRL (Transformers Reinforcement Learning) en los tags, lo que sugiere que se pudo emplear alguna tecnica de alineacion como RLHF o DPO, aunque no se detalla el proceso.

No se ha publicado informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni las epocas de entrenamiento.

## Capacidades

- Generacion de texto en ingles: al ser un fine-tune del modelo instructivo Qwen2.5-7B, se espera que mantenga las capacidades de razonamiento, respuesta a instrucciones y generacion de texto coherente del modelo base.
- Razonamiento y matematicas: el modelo base Qwen2.5-7B-Instruct destaca en tareas de razonamiento logico y aritmetico, aunque no se ha verificado que el fine-tune conserve estas habilidades.
- Generacion de codigo: el modelo base tiene soporte para multiples lenguajes de programacion, pero no hay evidencia de que este fine-tune este optimizado para ello.
- Capacidades multilingues: la model card indica solo ingles, por lo que se asume que el rendimiento en otros idiomas puede ser limitado.
- Tool calling y agentes: no se menciona soporte especifico para function calling o uso como agente; estas capacidades dependen del modelo base y de la configuracion de inferencia.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede emplearse como base para un chatbot de atencion al cliente o asistente virtual en entornos donde se requiera un modelo ligero (0.2 GB) y con licencia permisiva.
- Prototipado rapido de aplicaciones de IA: gracias a su tamano reducido y compatibilidad con text-generation-inference, es adecuado para experimentar en entornos de desarrollo sin necesidad de GPUs de alta gama.
- Educacion y aprendizaje: puede usarse como ejemplo didactico de ajuste fino de un modelo de 7B con Unsloth, para ensenar tecnicas de fine-tuning y cuantizacion.
- Generacion de contenido creativo en ingles: si el fine-tune se realizo sobre datos creativos, podria generar textos literarios, guiones o ideas, aunque no hay confirmacion de ello.
- Investigacion en eficiencia de modelos: al ser un modelo cuantizado a 4 bits, sirve para estudiar el impacto de la cuantizacion en el rendimiento de tareas especificas.
- Despliegue en entornos con restricciones de memoria: su tamano permite ejecutarlo en CPUs o GPUs con poca VRAM mediante herramientas como llama.cpp u Ollama, para pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo especifico.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7B con cuantizacion de 4 bits (segun el tamano del repo de 0.2 GB), la inferencia requiere aproximadamente 4-5 GB de VRAM en GPU, o unos 8-10 GB en CPU con cuantizacion GGUF.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo en 4 bits. Para mayor velocidad, se recomienda una GPU con soporte para bfloat16 (A100, RTX 3090, etc.).
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media y alta de consumo.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con text-generation-inference, puede desplegarse con vLLM, TGI, o convertirse a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: no se dispone de mediciones especificas; se estima una latencia de decenas de milisegundos por token en una GPU moderna (por ejemplo, RTX 4090) y varios cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos. Como referencia, se puede comparar con el modelo base Qwen2.5-7B-Instruct (sin cuantizar) y con otros instructivos de 7B como Llama-3.1-8B-Instruct o Mistral-7B-Instruct, pero no hay datos de rendimiento de este fine-tune frente a ellos. La principal diferencia es la cuantizacion a 4 bits, que reduce el tamano y los requisitos de memoria a costa de una posible perdida de precision.

## Limitaciones y advertencias

- Ausencia de documentacion: no se detalla el proceso de entrenamiento, el dataset utilizado ni las tareas objetivo, lo que dificulta predecir su comportamiento en produccion.
- Posibles sesgos heredados: al ser un fine-tune de Qwen2.5-7B-Instruct, puede heredar los sesgos del modelo base (genero, raza, idioma) y los del conjunto de datos de ajuste, que se desconoce.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Limitacion de idioma: la model card indica solo ingles; el rendimiento en otros idiomas puede ser pobre o inexistente.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen2.5, que tambien es Apache 2.0, sin restricciones adicionales conocidas.
- Tamano del contexto no confirmado: aunque el modelo base soporta 128k tokens, no se sabe si el fine-tune mantiene esa capacidad; se recomienda probar con secuencias largas antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mpichaa/Sushi_AI_Model
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
