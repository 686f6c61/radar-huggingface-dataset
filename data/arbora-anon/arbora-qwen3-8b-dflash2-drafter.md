# arbora-anon/arbora-qwen3-8b-dflash2-drafter

## Resumen

Arbora Qwen3-8B DFlash2 drafter es un modelo auxiliar de decodificación especulativa (speculative decoding) diseñado para acelerar la inferencia del modelo objetivo Qwen3-8B. No es un modelo generativo autónomo: es un "drafter" o modelo borrador que propone tokens candidatos que el modelo grande verifica en paralelo, reduciendo la latencia por token sin alterar la distribución de salida del modelo objetivo. Lo desarrolla el equipo anónimo Arbora en el contexto de la publicación del paper "Arbora: Making Better Use of the Draft Tokens from Block Diffusion Drafters", actualmente en revisión anónima.

El modelo parte del drafter z-lab/Qwen3-8B-DFlash-b16 y le añade las convoluciones y el selector de ruta (path selector) propios de DFlash2, con un epoch de entrenamiento adicional (hasta el step 13.325). Con 1.169.573.120 parámetros totales (aproximadamente 1,17 mil millones), es un modelo compacto pensado para ejecutarse junto al Qwen3-8B en pipelines de serving de baja latencia.

Su relevancia es práctica: la decodificación especulativa es una de las técnicas más eficaces para reducir el coste por token en producción sin degradar la calidad, y este drafter está empaquetado para integrarse directamente en el stack de serving `arbora` (scripts `serve.sh` y `run.sh`). La licencia Apache 2.0 facilita su adopción comercial, aunque la documentación pública es mínima y el dataset de entrenamiento no se ha liberado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa basado en el drafter Qwen3-8B DFlash (block diffusion) con convoluciones y selector de ruta de DFlash2 |
| Parametros totales | 1.169.573.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo objetivo Qwen3-8B en la practica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El modelo es un drafter para decodificación especulativa construido sobre el drafter Qwen3-8B DFlash (block diffusion drafter) del repositorio z-lab/Qwen3-8B-DFlash-b16. Sobre esa base se incorporan las convoluciones y el selector de ruta de DFlash2, y se entrena durante un epoch adicional hasta el step 13.325. El selector de ruta incluido es el mismo que utiliza la fila DFlash2 del paper, lo que sugiere que el drafter está diseñado para operar de forma coherente con el mecanismo de selección de rutas de tokens borrador descrito en Arbora.

El entrenamiento se realizó sobre las propias respuestas del modelo objetivo (Qwen3-8B) a una colección de prompts que no se ha publicado. El código liberado describe la receta y los scripts para reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts, lo que permite reproducir el proceso con datos propios. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación adicionales (RLHF/DPO); al tratarse de un drafter, el objetivo de entrenamiento es la predicción de tokens borrador, no la alineación conversacional.

## Capacidades

- Generación de tokens borrador para decodificación especulativa sobre Qwen3-8B: propone secuencias candidatas que el modelo objetivo verifica, acelerando la generación.
- Integración con el mecanismo de block diffusion drafting y con el selector de ruta de DFlash2 para mejorar la tasa de aceptación de tokens.
- Compatible con el stack de serving `arbora`: se carga como `DRAFT` en `arbora/serving/serve.sh qwen3-8b dflash2` y como `DRAFTER` en `arbora/run.sh qwen3-8b path-scorer` y `experts`.
- No es un modelo conversacional autónomo: no genera respuestas finales por sí mismo ni sustituye a Qwen3-8B.
- Capacidades multilingües, de código, matemáticas o tool calling: no disponibles de forma nativa en el drafter; dependen del modelo objetivo verificado.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.

## Casos de uso

- Serving de baja latencia de Qwen3-8B: desplegar el drafter junto al modelo objetivo en `arbora/serving/serve.sh` para reducir el tiempo por token en cargas interactivas, aprovechando la verificación paralela de tokens candidatos.
- Reducción de coste en APIs de generación de texto: al aumentar los tokens aceptados por paso de verificación, se reduce el número de pasos de decodificación y, con ello, el coste computacional por respuesta en producción.
- Chatbots de atención al cliente: combinar el drafter con Qwen3-8B para mantener conversaciones multi-turno con menor latencia percibida, siempre que el modelo objetivo cubra los requisitos de contexto e idioma.
- Generación de código en pipelines de CI/CD: acelerar la generación de parches y explicaciones de código con Qwen3-8B como verificador, manteniendo la calidad del modelo grande mientras el drafter aporta velocidad.
- Investigación en decodificación especulativa: usar el modelo como referencia reproducible para experimentar con selectores de ruta y convoluciones DFlash2, ya que el código permite reconstruir los datos de entrenamiento desde un fichero de prompts propio.
- Evaluación de tasas de aceptación: medir la eficacia del drafter (tokens aceptados por paso) en dominios concretos antes de adoptarlo en producción, ajustando prompts y configuración del stack Arbora.
- Despliegue en infraestructura con GPUs de gama media: al tener ~1,17 mil millones de parámetros, el drafter añade una huella de memoria moderada frente al modelo objetivo de 8B, lo que facilita su inclusión en nodos ya dimensionados para Qwen3-8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 2,3 GB en precisión de 16 bits (pesos safetensors de 1,17 mil millones de parámetros); en FP32 rondaría los 4,7 GB. No se documentan cuantizaciones oficiales.
- VRAM total del sistema: debe sumarse a la del modelo objetivo Qwen3-8B (aproximadamente 16 GB en FP16/BF16, más overhead de KV cache), por lo que el conjunto requiere GPUs de 24 GB o superiores para contexto amplio.
- GPU recomendadas: A100, H100 o L40S para serving en producción con Qwen3-8B; RTX 4090 (24 GB) puede alojar el conjunto en cuantización del modelo objetivo, con margen limitado para contextos largos.
- Cabe en GPU de consumo: el drafter por sí solo sí (RTX 3060 12 GB o superior); el conjunto con Qwen3-8B en FP16 requiere al menos 24 GB.
- Opciones de despliegue: stack `arbora` (`serve.sh`, `run.sh`) según la model card; no se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; dependen de la tasa de aceptación del drafter y del hardware, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-anon/arbora-qwen3-8b-dflash2-drafter | 1,17 B | no disponible | Drafter especulativo para Qwen3-8B | Apache 2.0 | Hugging Face (0 descargas) |
| z-lab/Qwen3-8B-DFlash-b16 (modelo base) | no disponible | no disponible | Drafter DFlash para Qwen3-8B | no disponible | Hugging Face |
| Qwen3-8B (modelo objetivo) | 8 B | no disponible en esta ficha | LLM generativo | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere Qwen3-8B como verificador y el stack Arbora para funcionar; no produce respuestas finales por sí solo.
- El dataset de entrenamiento no se ha liberado; solo se publica la receta y los scripts para reconstruirlo desde un fichero de prompts propio.
- La model card no documenta longitud de contexto, idiomas soportados ni cuantizaciones oficiales, lo que limita la planificación de despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el paper está en revisión anónima: no hay validación externa independiente publicada.
- La tasa de aceptación del drafter puede degradarse en dominios alejados de los prompts de entrenamiento, reduciendo la aceleración esperada.
- Al ser un componente de decodificación especulativa, no introduce sesgos conversacionales propios, pero hereda los del modelo objetivo Qwen3-8B en las respuestas finales.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros en `NOTICE` antes de redistribuir.
- No se documentan garantías de soporte, mantenimiento ni compatibilidad con frameworks de serving distintos del stack Arbora.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-dflash2-drafter
- Modelo base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Código y paper (revisión anónima): https://anonymous.4open.science/r/arbora-7ABE
