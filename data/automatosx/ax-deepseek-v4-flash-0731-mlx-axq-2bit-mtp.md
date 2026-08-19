# AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-2bit-MTP

## Resumen

AX-DeepSeek-V4-Flash-0731-MLX-AXQ-2bit-MTP es un paquete de cuantización experimental de 2 bits (AXQuant) del modelo DeepSeek-V4-Flash-0731, publicado por AutomatosX para su uso con MLX en Apple Silicon. El modelo base, deepseek-ai/DeepSeek-V4-Flash-0731, es una revisión concreta de la familia DeepSeek V4 Flash, y este pack convierte sus pesos nativos FP8 a una representación de precisión mixta de aproximadamente 3.13 bits por peso (BPW medido), reduciendo el tamaño del checkpoint a 122 GB. Está orientado a desarrolladores que quieren ejecutar un modelo de 37.7 mil millones de parámetros en hardware de Apple con memoria unificada, aunque se trata de una versión de desarrollo sin certificación de calidad completa.

La relevancia de este pack radica en que permite cargar un modelo grande de DeepSeek en equipos Apple Silicon de gama alta (como el M2 Ultra de 192 GB usado para la conversión) mediante MLX, con la promesa de una inferencia viable en local. Sin embargo, es importante señalar que es un producto experimental: la verificación de generación (checkpoint Tier 1) no está certificada, el manifiesto nativo de AX Engine no se generó y la aceleración MTP no está validada. Solo se confirma que la carga y generación básica con mlx-lm funcionan en la máquina de conversión. Por tanto, su uso en producción requiere validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-V4-Flash-0731, presumiblemente MoE con routed experts, pero no confirmado en la informacion del pack) |
| Parametros totales | 37.667.336.279 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQuant 2-bit experimental (BPW medido: 3.13 main, 3.21 total) |
| Idiomas soportados | no disponible |
| Licencia | MIT (del pack; la licencia del modelo base no se indica en esta informacion) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo base DeepSeek-V4-Flash-0731 no se detalla en la informacion proporcionada. El pack es una cuantizacion de pesos realizada con AXQuant 1.8.1 sobre la revision fijada del modelo FP8 (commit `7872f01b1d1fe23eabc4c98b48bffcef5a386062`). La conversion se llevo a cabo en un Apple M2 Ultra con 192 GB de RAM, generando un checkpoint de 122.212.298.775 bytes. No se mencionan datos de entrenamiento, dataset ni procesos de RLHF/DPO, ya que la cuantizacion no modifica el comportamiento del modelo original, solo la representacion numerica de sus pesos.

La innovacion tecnica principal es el uso de cuantizacion AXQ de 2 bits con precision mixta, que mantiene ciertas capas (como las proyecciones de los expertos enrutados) en una precision mayor que 2 bits, resultando en un BPW total de 3.21. El pack incluye la plantilla de chat oficial de DeepSeek V4 (`chat_template.jinja`) y requiere una version modificada de mlx-lm (0.31.3) con soporte para el hook de carga FP8. No se certifica la compatibilidad con el motor AX Engine sin una variable de entorno especifica.

## Capacidades

- Generacion de texto conversacional: el pack esta etiquetado como `text-generation` y `conversational`, y se confirma que la carga y generacion basica funcionan con mlx-lm en la maquina de conversion.
- Soporte de tool calling / function calling: no disponible en la informacion del pack.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (los idiomas no se especifican).
- Capacidades especiales (vision, audio, thinking mode): no disponible; el pack es exclusivamente para texto.
- MTP (Multi-Token Prediction): el pack incluye pesos para MTP (se menciona en el nombre), pero la aceleracion MTP no esta certificada en esta revision.
- Compatibilidad con MLX: disenado para Apple Silicon mediante la libreria MLX.

## Casos de uso

- Ejecucion local de un modelo DeepSeek de 37B en Apple Silicon: el pack permite cargar el modelo en un Mac con memoria unificada suficiente (al menos 128 GB, idealmente 192 GB) usando mlx-lm, sin necesidad de GPU NVIDIA. Es util para desarrolladores que quieren experimentar con DeepSeek V4 Flash en hardware Apple.
- Prototipado de aplicaciones de chat offline: al incluir la plantilla de chat oficial, se puede construir un asistente conversacional local que no dependa de servicios en la nube, siempre que se acepte la calidad experimental de la cuantizacion.
- Investigacion sobre cuantizacion agresiva: el pack sirve como caso de estudio para evaluar el impacto de una cuantizacion de 2 bits con precision mixta en un modelo MoE grande, comparando salidas con el modelo FP8 original.
- Pruebas de inferencia en entornos con restricciones de memoria: al reducir el checkpoint a 122 GB, permite ejecutar el modelo en maquinas que no podrian alojar la version FP8 completa (que ocuparia mas de 150 GB), aunque sigue requiriendo hardware de gama alta.
- Desarrollo de herramientas de generacion de texto con MLX: los desarrolladores que mantienen librerias o aplicaciones basadas en MLX pueden integrar este pack para probar compatibilidad con cuantizaciones extremas.
- Evaluacion de calidad de cuantizacion: comparar las respuestas generadas con este pack frente a las del modelo base o a cuantizaciones de 3 bits (tambien publicadas por AutomatosX) para decidir si la perdida de precision es aceptable para un caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el checkpoint Tier 1 (suite de viabilidad de generacion) no esta certificado en este registro, y que la prueba de calidad combinada (QA de fabrica con chat) obtuvo una puntuacion de 0.633, pero no se detallan metricas estandar como MMLU, HumanEval o GSM8K. No se debe asumir ningun rendimiento especifico sin datos verificados.

## Requisitos de hardware

- El checkpoint pesa 122.212.298.775 bytes (122.3 GB), por lo que se necesita al menos esa cantidad de memoria libre para cargar los pesos. Con overhead de ejecucion, se recomienda un Mac con 128 GB de RAM unificada como minimo, y 192 GB para operar con comodidad.
- La conversion se realizo en un Apple M2 Ultra con 192 GB, lo que sugiere que ese es el hardware de referencia. No se mencionan GPUs NVIDIA ni soporte CUDA; el formato es MLX, exclusivo de Apple Silicon.
- Opciones de despliegue: mlx-lm (libreria de inferencia de MLX) es la via principal. No se mencionan vLLM, llama.cpp u Ollama para este pack, ya que el formato MLX no es compatible con esos motores sin conversion adicional.
- Latencia y throughput: no disponibles. Al no estar certificada la generacion, no se pueden dar estimaciones fiables.
- Para servir con AX Engine (el motor de AutomatosX), se requiere la variable de entorno `AX_ENGINE_2BIT_EXPERIMENTAL=1`, pero el manifiesto nativo no se genero correctamente, por lo que se desaconseja su uso hasta que se corrija.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-DeepSeek-V4-Flash-0731-MLX-AXQ-2bit-MTP (este) | 37.7B | AXQ 2-bit (BPW 3.21) | 122 GB | MIT | Hugging Face |
| AX-DeepSeek-V4-Flash-0731-MLX-AXQ-3bit | 37.7B | AXQ 3-bit | no disponible | MIT | Hugging Face |
| AX-DeepSeek-V4-Flash-MLX-AXQ-2bit-MTP (version anterior) | 37.7B | AXQ 2-bit | no disponible | MIT | Hugging Face |
| deepseek-ai/DeepSeek-V4-Flash-0731 (modelo base) | 37.7B | FP8 nativo | >150 GB (estimado) | no disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo publicadas por AutomatosX y al modelo base. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa. La diferencia principal entre las versiones 2-bit y 3-bit es el nivel de cuantizacion, que afecta al tamaño del checkpoint y potencialmente a la calidad de las salidas, aunque no hay benchmarks que lo confirmen. La version sin sufijo 0731 corresponde a una revision anterior del modelo base, por lo que no es directamente comparable.

## Limitaciones y advertencias

- Producto experimental: la etiqueta `development` y `experimental` indica que no esta listo para produccion. La suite de viabilidad de generacion (checkpoint Tier 1) no esta certificada.
- Calidad de cuantizacion no validada: la puntuacion de QA combinada es de 0.633, un valor que sugiere una degradacion notable frente al modelo original, aunque sin metricas estandar no se puede cuantificar con precision.
- Riesgo de alucinacion y errores: al ser una cuantizacion de 2 bits, es probable que aumenten los errores de generacion, incoherencias y alucinaciones en comparacion con el modelo FP8. No hay garantias de fiabilidad.
- Problemas con AX Engine: el manifiesto nativo no se genero debido a la division de ciertas capas (`switch_mlp.gate_proj` y `up_proj`), lo que impide usar el motor AX Engine sin una correccion futura. Solo se recomienda mlx-lm.
- MTP no certificado: la aceleracion de Multi-Token Prediction incluida en el pack no esta validada, por lo que su funcionamiento es incierto.
- Requisitos de hardware elevados: necesita un Mac con al menos 128 GB de RAM unificada, lo que excluye la mayoria de equipos consumer.
- Restricciones de licencia: aunque el pack se publica bajo MIT, el modelo base pertenece a DeepSeek y puede tener condiciones adicionales de uso no reflejadas en esta informacion. Se recomienda revisar la licencia del modelo original antes de un uso comercial.
- Idioma: no se especifican los idiomas soportados; se asume que hereda las capacidades del modelo base, pero no hay confirmacion.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-2bit-MTP
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Pack de 3 bits (variante): https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-3bit
- Pack anterior sin revision 0731: https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-MLX-AXQ-2bit
- Documentacion de Unsloth sobre DeepSeek-V4: https://unsloth.ai/docs/models/deepseek-v4
- Repositorio antirez/ds4 (motor de inferencia para DeepSeek V4): https://github.com/antirez/ds4
- Repositorio MiaAI-Lab para DeepSeek V4 Flash 0731 en DGX Spark: https://github.com/MiaAI-Lab/DeepSeek-v4-Flash-DSpark-2x-DGX-Spark
