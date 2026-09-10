# mma404/huihui-qwen3.8-27b-abliterated-gptq

## Resumen

mma404/huihui-qwen3.8-27b-abliterated-gptq es una cuantizacion GPTQ de 4 bits (esquema W4A16) del modelo comunitario huihui-ai/Huihui-Qwen3.8-27B-abliterated, publicada por el usuario mma404. No es un modelo entrenado desde cero, sino una conversion de pesos orientada a reducir el coste de despliegue: pasa de unos 55,6 GB en bf16 a aproximadamente 17,6 GB, manteniendo el `lm_head` y la tabla de embeddings en bf16. La cuantizacion se genero con llm-compressor sobre el conjunto de calibracion `open_platypus` (512 muestras, longitud maxima 2048).

El modelo base pertenece a la familia Qwen3.5 y su clase es `Qwen3_5ForConditionalGeneration`, con una arquitectura hibrida poco habitual: 64 capas en total, de las cuales 48 usan Gated DeltaNet (atencion lineal) y 16 usan atencion completa (una de cada cuatro capas). Ademas, no es un modelo exclusivamente de texto: la configuracion declara `language_model_only: false` y define `image_token_id`, por lo que incorpora una torre de vision que se carga en bf16 junto al backbone cuantizado. El contexto maximo declarado es de 262.144 tokens.

Su relevancia es doble. Por un lado, sirve como ejemplo practico de como cuantizar con GPTQ una arquitectura hibrida nueva en la que AWQ falla (el paso de suavizado de AWQ no soporta la firma personalizada de `Qwen3_5GatedDeltaNet.forward()`). Por otro, es un modelo "abliterated": se le ha eliminado deliberadamente el comportamiento de rechazo, lo que lo hace util para investigacion sobre seguridad y alineacion, pero tambien inadecuado para despliegues de produccion sin control de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (hibrida: Gated DeltaNet de atencion lineal en 48 capas + atencion completa en 16 capas, 1 de cada 4) |
| Parametros totales | 26.895.998.464 (~26,9 B, segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 262.144 tokens segun el modelo base; en la configuracion de servicio sugerida se usa `--max-model-len 16384` |
| Tipos de cuantizacion | GPTQ 4 bits W4A16, group size 128, simetrica, orden de activacion estatico; `lm_head` y embeddings en bf16. El modelo base esta en bf16. AWQ no disponible (el intento fallo en esta arquitectura) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con formato `compressed-tensors` (`pack-quantized`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), mas alla de que procede de la familia Qwen3.5 y de que ha sido sometido a un proceso de "abliteracion" que elimina la conducta de rechazo aprendida. Lo que si esta documentado es la arquitectura: un transformer hibrido en el que la mayoria de las capas (48 de 64) emplean Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente, mientras que 16 capas (una de cada cuatro) mantienen atencion completa. Esta mezcla busca reducir el coste computacional y de memoria del contexto largo sin perder la capacidad de recuperacion exacta de la atencion clasica. El modelo incorpora ademas una torre de vision, por lo que se comporta como un modelo vision-lenguaje (omni), no como un modelo solo de texto.

La innovacion tecnica de esta ficha concreta esta en el proceso de cuantizacion. Se intento primero AWQ, pero fallo porque el suavizado de escalas de AWQ no maneja la firma personalizada de `Qwen3_5GatedDeltaNet.forward()`. Se opto entonces por GPTQ, basado en hooks de forward y sin repeticion manual de muestras, que funciono en todas las capas. Los modulos ignorados durante la cuantizacion son `lm_head` y todos los submodulos que no son `Linear` (normalizaciones y los propios contenedores `linear_attn`). El autor advierte explicitamente de que la cuantizacion no fue validada en calidad de salida, seguridad ni correccion mas alla de comprobar que el modelo carga y genera texto.

## Capacidades

- Generacion de texto autoregresiva en el backbone cuantizado.
- Procesamiento vision-lenguaje: el `config.json` declara `image_token_id` y `language_model_only: false`, por lo que el modelo acepta entradas de imagen junto a texto.
- Contexto largo: el modelo base soporta hasta 262.144 tokens, lo que permite razonamiento sobre documentos extensos (sujeto a VRAM disponible).
- Atencion hibrida con atencion lineal en la mayoria de capas, lo que reduce el coste del contexto largo respecto a un transformer de atencion completa pura.
- Despliegue en vLLM con cuantizacion `compressed-tensors`, lo que habilita inferencia con batching continuo y servidor compatible con OpenAI.
- Capacidades de razonamiento, generacion de codigo, matematicas, tool calling o uso como agente: no confirmadas en la informacion disponible. La model card no menciona ninguna de ellas de forma explicita.
- Capacidades multilingues: no disponibles.
- Modo "thinking" o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con contexto extenso: gracias al limite de 262.144 tokens del modelo base, se puede alimentar un contrato, un informe anual o un repositorio de documentacion completo en una sola peticion y pedir resumenes o extraccion de datos, siempre que la VRAM permita dimensionar `--max-model-len` en consecuencia.
- Procesamiento de documentos escaneados o con imagenes: al incorporar torre de vision, permite tareas de descripcion de imagen, respuesta a preguntas sobre capturas o extraccion de informacion de diagramas tecnicos en el mismo modelo que procesa el texto.
- Investigacion sobre seguridad y alineacion: al ser un modelo "abliterated", es un sujeto de estudio util para analizar que comportamientos de rechazo se eliminan y como afecta eso a las respuestas, comparando con la version original alineada.
- Red teaming y evaluacion de filtros de contenido: se puede usar como generador adversario controlado para probar clasificadores de seguridad, moderacion o sistemas de deteccion de contenido danino en un entorno aislado.
- Asistente conversacional autoalojado de proposito general: con vLLM y `--max-model-len` ajustado al trafico real, encaja en una GPU de 24-48 GB, lo que permite ofrecer un chatbot interno sin depender de APIs externas.
- Prototipado de aplicaciones multimodal en local: un equipo puede validar en una unica GPU de gama profesional (RTX A6000, L40S o similar) una pipeline que combine texto e imagen antes de invertir en infraestructura mayor.
- Experimentacion con arquitecturas hibridas de atencion: sirve para medir en la practica el comportamiento de Gated DeltaNet combinado con atencion completa bajo cuantizacion de 4 bits, y para comparar con implementaciones en bf16.
- Despliegue de bajo coste para investigacion academica: al reducir el peso de 55,6 GB a 17,6 GB, permite ejecutar un modelo de ~27 B en hardware de una sola GPU que de otro modo no lo soportaria en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que la cuantizacion no fue validada en calidad de salida mas alla de verificar que el modelo carga y genera texto, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni metricas multimodales asociadas a esta version cuantizada.

## Requisitos de hardware

- Peso de los pesos cuantizados: aproximadamente 17,6 GB.
- VRAM adicional necesaria: la torre de vision se carga en bf16 junto al backbone cuantizado, y `lm_head` y los embeddings tambien permanecen en bf16. Hay que presupuestar varios GB extra por encima de los 17,6 GB, incluso si solo se envian prompts de texto.
- Cache KV: escala con `--max-model-len` y con la concurrencia. La configuracion sugerida por el autor usa `--max-model-len 16384`, que se puede subir hasta 262.144 si se dispone de memoria.
- GPU recomendadas segun el autor: RTX A6000, RTX 4090 o L40S a longitudes de contexto moderadas. El modelo "cabe comodamente en una sola GPU de 24-48 GB".
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 4090, con contexto moderado y concurrencia baja. En tarjetas de 16 GB no se puede garantizar, ya que los pesos por si solos ocupan 17,6 GB.
- Opciones de despliegue: vLLM es la via confirmada, con `--trust-remote-code`, `--quantization compressed-tensors` y, preferiblemente, version >= 0.28.0. El soporte de `Qwen3_5ForConditionalGeneration` esta en el registro de vLLM desde la version 0.27.0. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mma404/huihui-qwen3.8-27b-abliterated-gptq | ~26,9 B | hasta 262.144 tokens | GPTQ 4 bits W4A16, ~17,6 GB | apache-2.0 | HuggingFace, vLLM >= 0.27.0 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (modelo base) | ~27 B | no disponible en la informacion | bf16, ~55,6 GB | no disponible en la informacion | HuggingFace |
| Variante AWQ del mismo modelo base | ~27 B | no aplica | AWQ: no disponible, el proceso fallo en esta arquitectura | no aplica | no existe |
| Otras alternativas de ~27 B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas relevante es contra el propio modelo base: esta version reduce el peso de 55,6 GB a 17,6 GB, a cambio de una perdida de precision no cuantificada y de la necesidad de un stack de inferencia que soporte `compressed-tensors` y la arquitectura Qwen3.5 hibrida. No se dispone de datos de rendimiento que permitan comparar contra otros modelos de tamano similar.

## Limitaciones y advertencias

- Modelo "abliterated": se le ha eliminado deliberadamente el comportamiento de rechazo. Es probable que responda a peticiones que un modelo alineado rechazaria. No es adecuado para produccion orientada al publico sin una capa externa de moderacion.
- Autor no oficial: la cuantizacion la produce un tercero (mma404), no el equipo de Qwen ni el autor del modelo base. La model card lo declara explicitamente como "unofficial, community-produced".
- Sin validacion de calidad: el autor indica que no se valido la calidad de salida, la seguridad ni la correccion mas alla de comprobar que el modelo carga y genera texto. Puede haber degradacion por cuantizacion no medida.
- Sin garantia: no se ofrece garantia de ningun tipo sobre el modelo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un riesgo inherente a cualquier modelo de lenguaje y la cuantizacion de 4 bits puede agravarlo.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso comunitario ni de validacion independiente.
- Compatibilidad de stack: la arquitectura Qwen3.5 es muy nueva. Es imprescindible verificar que el motor de inferencia la soporta; en vLLM se requiere `--trust-remote-code` y una version reciente (idealmente >= 0.28.0). Un stack que no reconozca `Qwen3_5ForConditionalGeneration` no cargara el modelo.
- Restricciones de licencia: el repositorio declara apache-2.0, pero el autor remite a la licencia original de Qwen y a la legislacion aplicable en cada jurisdiccion. Conviene verificar la licencia del modelo base antes de un uso comercial.
- Idiomas soportados: no disponibles, por lo que no se puede garantizar cobertura multilingue.
- Coste oculto de VRAM: la torre de vision en bf16 y los embeddings y `lm_head` sin cuantizar consumen memoria adicional sobre los 17,6 GB, algo que puede desbordar una GPU de 24 GB si se sube mucho `--max-model-len` o la concurrencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mma404/huihui-qwen3.8-27b-abliterated-gptq
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia original de Qwen: https://huggingface.co/Qwen
- Pagina del autor huihui-ai: https://huggingface.co/huihui-ai

Nota: el resto de resultados de la busqueda web no guardan relacion con este modelo ni con inteligencia artificial, por lo que se han descartado.
