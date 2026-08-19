# kingjones777/Muse-Glimmer-30B-ROCmFPX-Q8_0-AGENT-GGUF

## Resumen

Muse-Glimmer-30B-ROCmFPX-Q8_0-AGENT-GGUF es una cuantización GGUF de 8 bits del modelo multimodal agéntico Muse-Glimmer-30B, desarrollado por Meta y publicado originalmente con licencia Apache 2.0. Esta variante concreta, creada por el usuario kingjones777, está optimizada para ejecutarse en hardware AMD con arquitectura gfx1151 (Ryzen AI MAX+ 395 y Radeon 8060S) mediante el formato de tensores ROCmFPX, exclusivo de un fork de llama.cpp.

El modelo base es un sistema image-text-to-text de 30B parámetros diseñado para agentes locales siempre activos, con soporte de tool calling, ejecución de tareas largas y recuperación de fallos. Esta cuantización 8-bit (ftype 115, Q8_0_ROCMFPX_AGENT) ocupa 27,23 GiB y alcanza 7,22 tokens por segundo en un Ryzen AI MAX+ 395, incluyendo además una cabeza especulativa DFlash y un proyector de visión en BF16. Su relevancia radica en permitir ejecutar un modelo multimodal de 30B en un único dispositivo AMD de gama consumer, sin necesidad de GPU dedicada de alta gama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal de Meta, probablemente transformer con vision tower) |
| Parametros totales | 27.854.794.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX_AGENT (ftype 115); tambien existen variantes Q8_0_ROCMFPX plain (ftype 111) y Q4_0_ROCMFP4 (ftype 105) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con cuantizacion ROCmFPX, formato propietario del fork de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un sistema multimodal de Meta que combina un codificador de vision con un modelo de lenguaje de 30B parametros, disenado especificamente para agentes locales. Segun la documentacion oficial de Meta, esta tuneado para tool use, tareas largas y recuperacion de fallos, lo que implica un entrenamiento orientado a interacciones agenciales multi-paso. No se dispone de datos concretos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO en la informacion proporcionada.

Esta cuantizacion utiliza el formato ROCmFPX, un esquema de tensores en runtime que solo existe en el fork de llama.cpp del mismo nombre. El modelo incluye una cabeza especulativa DFlash (no MTP), que actua como drafter para decodificacion especulativa, y un proyector de vision (mmproj) en BF16. Es importante destacar que el archivo GGUF se genero a partir de una fuente BF16 sin perdida (55.725.514.112 bytes), no mediante requantizacion, lo que preserva la fidelidad de los pesos originales.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de 30B parametros capaz de tareas de lenguaje general, aunque no se han publicado benchmarks estandar que lo confirmen en esta cuantizacion.
- Procesamiento de imagenes: soporta entrada image-text-to-text, con un vision tower que utiliza patch de 14 y merge de 2. Verificado con pruebas reales: descripcion correcta de imagenes de cuatro cuadrantes de colores, una cruz negra sobre blanco y un rectangulo rojo solido.
- Tool calling / function calling: el modelo base de Meta esta explicitamente tuneado para tool use, segun la documentacion oficial. Sin embargo, esta cuantizacion no ha sido evaluada en este aspecto (la model card indica "No tool-calling evaluation").
- Capacidades agenciales: disenado para tareas largas y recuperacion de fallos, apto para agentes autonomos en local.
- Decodificacion especulativa: incluye cabeza DFlash para acelerar la generacion, aunque en esta variante AGENT la velocidad es ligeramente inferior a la variante plain (7,22 vs 7,48 tok/s).
- Multilingue: solo ingles (segun el campo language de la model card).

## Casos de uso

- Asistente visual local en dispositivos AMD: el modelo puede describir imagenes y responder preguntas sobre su contenido en tiempo real, ejecutandose en un Ryzen AI MAX+ 395 sin conexion a internet. Adecuado para aplicaciones de accesibilidad o soporte tecnico en entornos sin GPU dedicada.
- Agente de automatizacion de tareas con tool calling: gracias al soporte de function calling del modelo base, puede integrarse en pipelines que interactuan con APIs, ejecutan comandos o gestionan flujos de trabajo multi-paso. La cuantizacion 8-bit ofrece mayor precision que la variante 4-bit para decisiones criticas.
- Procesamiento de documentos con imagenes: util para extraer informacion de capturas de pantalla, diagramas o formularios escaneados, combinando vision y lenguaje en un solo paso. El contexto largo no ha sido probado, por lo que se recomienda para documentos de extension moderada.
- Prototipado de agentes multimodales en hardware AMD: desarrolladores que trabajan con ROCm pueden usar esta cuantizacion para validar flujos agenciales con vision antes de desplegar en produccion, aprovechando el formato ROCmFPX nativo.
- Educacion e investigacion local: permite experimentar con un modelo multimodal de 30B en un portatil con APU Strix Halo, sin necesidad de servicios en la nube, para ensenar conceptos de agentes y vision por computador.
- Recuperacion de fallos en agentes: el modelo base esta disenado para reanudar tareas interrumpidas, por lo que puede usarse en sistemas de automatizacion que requieren robustez ante errores, como robots de testing o monitores de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente pruebas puntuales de correctness y vision:

| Prueba | Resultado |
|---|---|
| 17 x 23 | 391 (correcto) |
| Capital de Japon | Tokyo (correcto) |
| Dias en 2024 | 366 (correcto) |
| Imagen de 4 cuadrantes (rojo/verde/azul/amarillo) | "four colored squares arranged in a grid: red, green, blue, and yellow" (correcto) |
| Cruz negra sobre blanco | "a black cross on white" (correcto) |
| Rectangulo rojo solido | "a solid bright red rectangle" (correcto) |

Rendimiento medido: 7,22 tok/s en Ryzen AI MAX+ 395 con la variante AGENT, frente a 7,48 tok/s en la variante plain. No se realizaron pruebas de perplexity, long-context ni tool-calling.

## Requisitos de hardware

- GPU AMD con arquitectura gfx1151: Ryzen AI MAX+ 395 o Radeon 8060S. El formato ROCmFPX es exclusivo de hardware AMD y no funciona en GPUs NVIDIA.
- VRAM: el archivo GGUF ocupa 27,23 GiB, por lo que se necesita al menos 28 GiB de memoria disponible. En el Ryzen AI MAX+ 395, la memoria es compartida con el sistema (hasta 64 GB), lo que permite su ejecucion.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en la mayoria de GPUs NVIDIA consumer. En AMD, solo las APU Strix Halo con 32 GB o mas pueden alojarlo.
- Software: requiere el fork ROCmFPX de llama.cpp, no el llama.cpp estandar. El flag `-fa off` es obligatorio para evitar fallos en la ruta de vision en gfx1151.
- Opciones de despliegue: exclusivamente llama.cpp con el fork ROCmFPX. No es compatible con vLLM, Ollama ni TGI en su forma actual.
- Latencia: aproximadamente 0,14 segundos por token (7,22 tok/s), lo que limita su uso a aplicaciones interactivas sin requisitos de tiempo real estrictos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Velocidad (Ryzen AI MAX+ 395) | Licencia |
|---|---|---|---|---|---|---|
| Muse-Glimmer-30B-ROCmFPX-Q8_0-AGENT (este) | 27,85B | no disponible | Q8_0_ROCMFPX_AGENT | 27,23 GiB | 7,22 tok/s | Apache 2.0 |
| Muse-Glimmer-30B-ROCmFPX-Q8_0-plain | 27,85B | no disponible | Q8_0_ROCMFPX | 26,85 GiB | 7,48 tok/s | Apache 2.0 |
| Muse-Glimmer-30B-ROCmFP4-Strix-Halo | 27,85B | no disponible | Q4_0_ROCMFP4 | 14,17 GiB | no disponible (mas rapido segun autor) | Apache 2.0 |

Las tres variantes son cuantizaciones del mismo modelo base de Meta. La variante 4-bit es aproximadamente la mitad de tamano y considerablemente mas rapida, segun el autor, a costa de menor precision. La variante AGENT incluye la cabeza DFlash pero no ofrece ventaja de velocidad en este modelo concreto; su beneficio se manifiesta en modelos con draft head. No se dispone de comparativas con otros modelos multimodales de 30B en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un fork especifico de llama.cpp (ROCmFPX) que no es compatible con el llama.cpp estandar ni con otros frameworks de inferencia.
- El flag `-fa off` es obligatorio; activar flash attention rompe la ruta de vision en gfx1151.
- No se han realizado pruebas de perplexity, long-context ni tool-calling en esta cuantizacion, por lo que su calidad en esos escenarios es desconocida.
- Imagenes menores de 28x28 pixeles no se procesan correctamente: el vision tower con patch 14 y merge 2 produce menos de un merge-token, devolviendo "white" como resultado. Esto no es un fallo del modelo sino una limitacion inherente al diseño.
- Solo soporta ingles; no hay capacidades multilingues verificadas.
- La variante AGENT es ligeramente mas lenta que la plain (7,22 vs 7,48 tok/s) y su ventaja especulativa no se manifiesta en este modelo, por lo que su uso solo se justifica si se necesita la cabeza DFlash para otros propositos.
- El formato ROCmFPX es propietario del fork y no hay garantia de mantenimiento a largo plazo ni compatibilidad con versiones futuras de llama.cpp.
- No se ha verificado la integridad de los pesos mas alla de la proyeccion del dry-run de cuantizacion; el autor advierte que no se realizo un A/B de calidad contra la fuente BF16.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/kingjones777/Muse-Glimmer-30B-ROCmFPX-Q8_0-AGENT-GGUF
- Variante 4-bit (ROCmFP4): https://huggingface.co/kingjones777/Muse-Glimmer-30B-ROCmFP4-Strix-Halo-DFlash-GGUF
- Variante 8-bit plain: https://huggingface.co/kingjones777/Muse-Glimmer-30B-ROCmFPX-Q8_0-GGUF
- Guia de agente local de Muse-Glimmer (GitHub): https://github.com/cobusgreyling/Muse-Glimmer
- Pagina oficial de Meta sobre Muse Glimmer: https://developer.meta.com/ai/models/muse-glimmer/
- Documentacion de API de Meta para Muse Glimmer: https://dev.meta.ai/docs/muse-glimmer/get-the-model
