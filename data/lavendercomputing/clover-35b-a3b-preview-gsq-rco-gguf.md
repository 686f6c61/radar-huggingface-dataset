# lavendercomputing/Clover-35B-A3B-Preview-GSQ-RCO-GGUF

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de tipo mixture-of-experts (MoE) con 34.660.610.688 parametros totales y aproximadamente 3B de parametros activos por token, derivado de Qwen/Qwen3.6-35B-A3B. La arquitectura consta de 40 capas con 256 expertos enrutados por capa y enrutamiento top-8, con una longitud de contexto de 131.072 tokens. El modelo base original (Diffuspace/Clover-35B-A3B-Preview) incorpora un camino de difusion por bloques (block-diffusion) que actua como denoiser bidireccional, ademas de decodificacion causal estandar.

El repositorio que nos ocupa, publicado por lavendercomputing, contiene builds GGUF con cuantizacion de precision mixta por tensor, etiquetados como "GSQ-RCO-style", destinados a una rama de llama.cpp con soporte para Clover. Es importante senalar que estos ficheros conservan unicamente la ruta causal/autoregresiva del modelo original: el conversor filtra los tensores GDN bidireccionales empleados por el denoiser de difusion por bloques, por lo que estas cuantizaciones no permiten generacion por difusion.

La relevancia de esta publicacion es doble. Por un lado, ofrece versiones cuantizadas de un modelo MoE de 35B con contexto de 128K en rangos de 9,43 a 15,14 GiB, lo que lo hace desplegable en hardware de consumo. Por otro, documenta de forma explicita las limitaciones del proceso de conversion, advirtiendo que no se trata de una exportacion completa del modelo de difusion original y que no incluye torre de vision ni cabezas MTP/draft independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) transformer, 40 capas, 256 expertos enrutados por capa, top-8 routing; ruta causal/autoregresiva (tensores GDN bidireccionales filtrados en esta exportacion) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF IQ2_XXS (2,30 BPW), IQ2_XS (2,50 BPW), IQ2_S (2,70 BPW), IQ2_M (2,90 BPW), IQ3_XXS (3,00 BPW), IQ3_XS (3,25 BPW), IQ3_S (3,50 BPW), IQ3_M (3,75 BPW); asignacion de precision mixta por tensor estilo GSQ-RCO con importance matrix |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (8 ficheros cuantizados); checkpoint fuente en BF16 safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo mixture-of-experts con 40 capas, 256 expertos enrutados por capa y enrutamiento top-8, lo que resulta en aproximadamente 3B de parametros activos sobre un total de 34,7B. Deriva de Qwen/Qwen3.6-35B-A3B y el checkpoint fuente (Diffuspace/Clover-35B-A3B-Preview) incorpora un camino de difusion por bloques con tensores GDN bidireccionales que actuan como denoiser, ademas de la ruta causal convencional. La model card no proporciona detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica mas destacable del checkpoint original es la combinacion de decodificacion causal con generacion por difusion de bloques y decodificacion autoespeculativa (`draft-self`), que no constituye una cabeza MTP independiente sino que se apoya en la ruta de difusion. En esta exportacion GGUF, el conversor (revision `ed26f2f7621306a8c393dd5193c18b3c3cea7940`) elimina los tensores GDN bidireccionales, de modo que solo se preserva la decodificacion autoregresiva de izquierda a derecha. La cuantizacion se realizo en CPU con un asignador local de reglas por tensor y el cuantizador con importance matrix de llama.cpp, usando el corpus de calibracion `quantization_calibration.txt`. El autor aclara que "GSQ-RCO-style" describe un flujo de asignacion compatible en formato, no una reproduccion literal de los algoritmos GSQ/RCO originales.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en modo causal autoregresivo.
- Razonamiento multi-turno con ventanas de contexto de hasta 131.072 tokens.
- Procesamiento eficiente gracias al enrutamiento MoE: solo ~3B de parametros activos por token sobre 34,7B totales.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision: no soportada; el checkpoint fuente carece de torre de vision y proyector de imagen.
- Generacion por difusion de bloques: no disponible en esta exportacion GGUF (tensores bidireccionales filtrados).
- Decodificacion especulativa `draft-self`: no disponible en esta exportacion (depende de la ruta de difusion).

## Casos de uso

- Despliegue en hardware de consumo: la variante IQ2_XXS ocupa 9,43 GiB, lo que permite ejecutar un MoE de 35B con ~3B activos en GPUs de 12-16 GB de VRAM o en configuraciones CPU+GPU con llama.cpp, algo inviable con el checkpoint BF16 completo.
- Asistentes conversacionales de contexto largo: con 131.072 tokens de ventana, el modelo puede mantener conversaciones multi-turno extensas o procesar documentos largos sin truncamiento, usando la variante IQ3_S (14,13 GiB) como equilibrio entre calidad y huella de memoria.
- Procesamiento de documentos y resumen: la ventana de 128K permite ingerir informes, contratos o articulos completos en una sola pasada para tareas de extraccion y sintesis.
- Experimentacion e investigacion en cuantizacion: el repositorio documenta un flujo completo de asignacion por tensor con importance matrix, util para estudiar el impacto de precisiones mixtas en modelos MoE.
- Evaluacion comparativa de arquitecturas MoE: sirve para medir el rendimiento de un MoE con top-8 routing y 256 expertos frente a modelos densos de tamano similar en tareas de generacion.
- Prototipado local sin dependencia de la nube: al ser Apache-2.0 y ejecutable con llama.cpp, permite integrar el modelo en entornos de desarrollo aislados o con requisitos de privacidad, siempre que se use una build con soporte para Clover.
- Base para fine-tuning o destilacion: el checkpoint BF16 original (no estas cuantizaciones) puede servir como punto de partida para adaptaciones, dado que la licencia Apache-2.0 lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (tamano de fichero como referencia; el runtime anade overhead de contexto KV):
  - IQ2_XXS: 9,43 GiB
  - IQ2_XS: 10,09 GiB
  - IQ2_S: 10,91 GiB
  - IQ2_M: 11,82 GiB
  - IQ3_XXS: 12,12 GiB
  - IQ3_XS: 13,12 GiB
  - IQ3_S: 14,13 GiB
  - IQ3_M: 15,14 GiB
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, las variantes IQ2 caben en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB, RTX 4080 16 GB); las variantes IQ3 requieren 16 GB o mas (RTX 4090 24 GB, A100 40/80 GB, H100 80 GB).
- Cabe en GPU de consumo: si, en las variantes IQ2 y IQ3 segun la VRAM disponible; el contexto de 131.072 tokens incrementa considerablemente el consumo de KV cache y puede requerir offloading a CPU.
- Opciones de despliegue: llama.cpp con una build que incluya soporte para Clover (revision del conversor/runtime `ed26f2f7621306a8c393dd5193c18b3c3cea7940`). No se documenta compatibilidad con vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview (esta ficha, GGUF) | ~34,7B | ~3B | 131.072 | Apache-2.0 | GGUF (IQ2_XXS a IQ3_M) |
| Qwen/Qwen3.6-35B-A3B (modelo base) | ~35B | ~3B | no disponible | Apache-2.0 | no disponible |
| Diffuspace/Clover-35B-A3B-Preview (checkpoint fuente) | ~34,7B | ~3B | 131.072 | Apache-2.0 | BF16 safetensors |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La diferencia principal entre el checkpoint fuente y esta exportacion es la ausencia de la ruta de difusion por bloques y de la decodificacion autoespeculativa en los GGUF, ademas de la perdida de precision inherente a la cuantizacion.

## Limitaciones y advertencias

- No soporta generacion por difusion de bloques: los tensores GDN bidireccionales han sido filtrados, por lo que solo funciona en modo causal autoregresivo.
- No soporta decodificacion autoespeculativa `draft-self`, ya que depende de la ruta de difusion eliminada.
- No dispone de capacidades de vision: el checkpoint fuente carece de torre de vision y proyector de imagen.
- Requiere una build especifica de llama.cpp con soporte para Clover; no es compatible con runtimes estandar ni con herramientas que no reconozcan la arquitectura.
- La cuantizacion introduce perdida de calidad respecto al BF16; las variantes IQ2 (2,30-2,90 BPW) son especialmente agresivas y pueden degradar el rendimiento en tareas de razonamiento o codigo.
- "GSQ-RCO-style" no reproduce literalmente los algoritmos GSQ/RCO originales, sino que describe un flujo de asignacion por tensor compatible en formato; los tamanos finales y el BPW efectivo pueden diferir de los objetivos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos de lenguaje generativos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; se desconoce la cobertura linguistica real del modelo.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- El modelo fue creado y actualizado el 2026-11-02; se desconoce si recibira mantenimiento.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/lavendercomputing/Clover-35B-A3B-Preview-GSQ-RCO-GGUF
- Modelo base (checkpoint fuente): https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Modelo Qwen de referencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Revision del checkpoint BF16: `4b0402b65e523d0183a14c431955438714cb16ff`
- Revision del conversor/runtime con soporte Clover: `ed26f2f7621306a8c393dd5193c18b3c3cea7940`
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
