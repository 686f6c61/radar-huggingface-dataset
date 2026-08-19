# pyros-vault/Qwen3.8-27B-Uncensored-NInfer

## Resumen

El modelo `pyros-vault/Qwen3.8-27B-Uncensored-NInfer` es una conversión al formato nativo NInfer (`.ninfer`) del modelo `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez deriva del modelo `Qwen3.8-27B` de Alibaba. Se trata de un modelo multimodal (image-text-to-text) de 27 mil millones de parámetros, ajustado mediante técnicas de "abliteration" para reducir rechazos y respuestas evasivas, lo que lo hace especialmente útil para tareas de red-teaming y evaluación de seguridad en IA. El artefacto está pensado exclusivamente para el motor de inferencia NInfer, no es un checkpoint de Transformers ni un archivo GGUF.

La relevancia de este modelo radica en su doble naturaleza: por un lado, hereda las capacidades multimodales y de razonamiento del modelo Qwen3.8-27B, y por otro, ofrece una versión "sin censura" que permite explorar los límites de los sistemas de IA en entornos controlados. El repositorio incluye un comando de ejemplo que utiliza decodificación especulativa (MTP) con 4 tokens de borrador y una ventana de contexto de 65 000 tokens, lo que sugiere un rendimiento optimizado para GPUs de gama alta como la RTX 4090. Con un tamaño de repositorio de 18,2 GB, el artefacto cabe en tarjetas con 24 GB de VRAM, aunque se recomienda verificar los requisitos exactos según la cuantización empleada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible oficialmente; el comando de ejemplo usa 65 000 tokens |
| Tipos de cuantizacion | no especificado; el artefacto `.ninfer` de 18,2 GB sugiere una cuantizacion de precision reducida (probablemente Q4 o similar) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (formato nativo de NInfer) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso de 27 mil millones de parametros, desarrollado por Alibaba, con capacidades multimodales (procesa texto e imagenes). El modelo `orcarouter/Qwen3.8-27B-Uncensored` aplica una tecnica de "abliteration" que modifica los pesos del modelo para eliminar o reducir los mecanismos de rechazo y las respuestas evasivas, manteniendo en lo posible las capacidades generales del modelo original. El artefacto NInfer aqui presentado es una conversion de ese modelo ajustado al formato nativo de NInfer, un motor de inferencia especializado en GPUs NVIDIA con soporte para decodificacion especulativa (multi-token prediction, MTP) y optimizaciones de memoria.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO. La model card solo indica que el modelo base y sus derivados estan licenciados bajo Apache-2.0. El comando de ejemplo incluido en el repositorio sugiere que el modelo esta optimizado para tareas de red-teaming, con una ventana de contexto amplia (65 000 tokens) y generacion especulativa para reducir la latencia.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo Qwen3.8-27B, incluyendo comprension de lenguaje natural, razonamiento logico y generacion de texto coherente.
- Procesamiento multimodal: al ser un modelo image-text-to-text, puede recibir imagenes como entrada y generar texto relacionado (descripciones, respuestas a preguntas visuales, etc.).
- Conversacion multi-turno: soporta dialogos extensos gracias a la ventana de contexto amplia (65 000 tokens en el ejemplo).
- Reduccion de rechazos: el ajuste "uncensored" (abliterated) reduce las respuestas evasivas o de rechazo, lo que permite explorar temas que otros modelos evitarian.
- Decodificacion especulativa: el comando de ejemplo utiliza `--spec mtp --draft-tokens 4 --lm-head-draft`, lo que indica soporte para generacion acelerada mediante prediccion multi-token.
- Adecuado para red-teaming: disenado para pruebas de seguridad y evaluacion de robustez en sistemas de IA.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo puede utilizarse para probar sistemas de IA generando prompts adversariales o explorando vulnerabilidades, gracias a su naturaleza "uncensored" y su capacidad de razonamiento.
- Generacion de contenido creativo sin restricciones: escritores y creadores pueden usarlo para explorar temas controvertidos o estilos narrativos que otros modelos rechazarian, siempre dentro de un marco legal y etico.
- Analisis de imagenes con contexto amplio: al ser multimodal, puede procesar imagenes junto con instrucciones complejas, util en tareas de descripcion de imagenes, extraccion de informacion visual o generacion de informes.
- Desarrollo de agentes conversacionales: su capacidad de mantener conversaciones largas y su ventana de contexto de 65 000 tokens lo hacen adecuado para chatbots o asistentes virtuales que requieren memoria extendida.
- Investigacion en alineacion de IA: permite estudiar como se comporta un modelo sin mecanismos de rechazo, lo que ayuda a entender los limites de la seguridad en modelos de lenguaje.
- Pruebas de robustez en produccion: las empresas pueden usarlo para verificar que sus sistemas de moderacion o filtros funcionan correctamente, generando entradas que otros modelos considerarian "peligrosas".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo o sus derivados. El unico dato de rendimiento indirecto es el comando de ejemplo, que indica que el modelo funciona "flawlessly" en una RTX 4090 con el fork de NInfer mencionado, pero sin cifras concretas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 18,2 GB, por lo que se necesita al menos 20-24 GB de VRAM para cargar los pesos y realizar inferencia. Una GPU con 24 GB (RTX 3090, RTX 4090) es suficiente; la RTX 5090 (32 GB) ofrece margen adicional.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, RTX 5090 (todas con CUDA). El modelo esta probado en una RTX 4090 segun la model card.
- Compatibilidad con consumer GPUs: si, siempre que tengan al menos 24 GB de VRAM. No se recomienda para GPUs con menos de 20 GB.
- Opciones de despliegue: exclusivamente mediante NInfer (motor nativo). No es compatible con vLLM, llama.cpp, Ollama o TGI directamente, ya que el formato `.ninfer` es propietario de NInfer.
- Latencia y throughput: no disponibles. El uso de decodificacion especulativa (MTP) con 4 tokens de borrador deberia reducir la latencia en comparacion con generacion autoregresiva estandar, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros modelos. Como referencia cualitativa, se puede comparar con:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | no disponible | Apache-2.0 | Transformers | Modelo original de Alibaba, multimodal |
| Qwen3.8-27B-Uncensored (orcarouter) | 27B | no disponible | Apache-2.0 | Transformers, GGUF, FP8 | Version abliterated del base |
| Qwen3.8-27B-Uncensored-NInfer (este) | 27B | 65k (ejemplo) | Apache-2.0 | `.ninfer` | Conversion a NInfer, solo para ese motor |

No se dispone de datos de rendimiento comparativo con otros modelos de tamano similar (como Llama 3.1 27B o Mistral 24B).

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version "uncensored", el modelo puede generar contenido ofensivo, discriminatorio o perjudicial. No se han realizado evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos. La ausencia de mecanismos de rechazo no elimina este riesgo.
- Limitaciones de contexto: aunque el ejemplo usa 65 000 tokens, no se especifica la longitud maxima oficial. Es posible que el modelo base tenga una ventana mayor, pero no esta confirmado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el usuario es responsable de cumplir las leyes aplicables, especialmente en lo relativo a contenido generado.
- Compatibilidad: el formato `.ninfer` es exclusivo de NInfer; no se puede usar con otras herramientas. Ademas, el modelo esta disenado para GPUs NVIDIA con CUDA; no hay soporte para otras arquitecturas.
- Uso en produccion: al ser una version "uncensored", no es recomendable desplegarlo en entornos de produccion sin filtros adicionales de moderacion, ya que puede generar contenido inapropiado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/pyros-vault/Qwen3.8-27B-Uncensored-NInfer
- Modelo base (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor NInfer: https://github.com/Neroued/ninfer
- Fork de NInfer probado (RTX 4090): https://github.com/UDPSendToFailed/ninfer-4090
- Repositorio GitHub con informacion sobre Qwen 3.8 27B Uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
- Pagina de Wiro AI sobre el modelo: https://wiro.ai/models/qwen/qwen3-8-27b-uncensored
- Version FP8 del modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
