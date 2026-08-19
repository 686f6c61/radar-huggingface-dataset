# kingjones777/Muse-Glimmer-30B-ROCmFPX-Q8_0-GGUF

## Resumen

Muse-Glimmer-30B es un modelo multimodal (image-text-to-text) de Meta, con licencia Apache 2.0, diseñado para agentes locales siempre activos. Esta variante concreta, publicada por kingjones777, es una cuantización GGUF en formato ROCmFPX de 8 bits, optimizada para hardware AMD con arquitectura RDNA (gfx1151, como la APU Ryzen AI MAX+ 395). El modelo base tiene aproximadamente 27,85 mil millones de parámetros y está afinado para uso de herramientas, tareas largas y recuperación de fallos.

La cuantización Q8_0_ROCMFPX ocupa 26,85 GiB y alcanza 7,48 tokens por segundo en un Ryzen AI MAX+ 395, según las pruebas del autor. Incluye un proyector de visión en BF16 y una cabeza especulativa DFlash, pero requiere un fork específico de llama.cpp (ROCmFPX) y desactivar flash attention para la ruta de visión. Es una opción relevante para quienes buscan ejecutar un modelo multimodal de 30B en hardware AMD de gama alta sin necesidad de GPUs dedicadas de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de Meta, probablemente transformer denso) |
| Parametros totales | 27.854.794.240 (27,85B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX (ftype 111), tambien existen variantes Q4_0_ROCMFP4 y Q8_0_ROCMFPX-AGENT |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con formato tensor ROCmFPX, no compatible con llama.cpp estandar) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Se sabe que es un modelo multimodal que procesa imagenes y texto, con un proyector de vision (mmproj) incluido en esta cuantizacion. El autor de la cuantizacion indica que el modelo fue convertido desde un GGUF BF16 (55,7 GB) sin requantizacion, lo que minimiza la perdida de precision. La cabeza especulativa es DFlash, no MTP, por lo que no deben usarse flags de MTP con este archivo.

El entrenamiento del modelo base fue realizado por Meta, con enfoque en agentes locales: uso de herramientas, tareas de larga duracion y recuperacion ante fallos. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens o si se uso RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: el modelo responde correctamente a operaciones aritmeticas (17×23=391), preguntas factuales (capital de Japon) y calculo de dias en un año (366 en 2024), segun las pruebas del autor.
- Comprension de imagenes: verificado con imagenes reales de cuatro cuadrantes de colores, una cruz negra sobre blanco y un rectangulo rojo solido, describiendo correctamente los contenidos.
- Soporte para agentes: el modelo base esta afinado para tool calling y tareas de agente, aunque esta cuantizacion no ha sido evaluada en ese aspecto.
- Decodificacion especulativa: incluye cabeza DFlash para acelerar la generacion, aunque el rendimiento medido (7,48 tok/s) es el resultado con ella activa.
- Multimodal: pipeline image-text-to-text, capaz de recibir imagenes y producir texto.

## Casos de uso

- Asistente local con camara: un dispositivo con Ryzen AI MAX+ 395 puede ejecutar este modelo para describir el entorno en tiempo real, ayudando a personas con discapacidad visual o en tareas de inventario domestico.
- Automatizacion de documentos con imagenes: extraer informacion de capturas de pantalla, diagramas o fotografias en un flujo de trabajo local sin enviar datos a la nube, gracias a su capacidad de vision y su licencia Apache 2.0.
- Agente de productividad personal: integrado en un entorno de escritorio, puede leer capturas de pantalla, interpretar graficos y ejecutar acciones via tool calling, aunque esta capacidad no ha sido verificada en esta cuantizacion.
- Desarrollo de prototipos en hardware AMD: investigadores que trabajan con gfx1151 pueden usar este archivo GGUF para probar aplicaciones multimodales sin necesidad de una GPU dedicada, aprovechando la memoria unificada de la APU.
- Educacion y demostraciones: ejecutar un modelo de 30B con vision en un portatil de gama alta para ensenar conceptos de IA multimodal en aulas o talleres, con un coste de hardware relativamente bajo.
- Analisis de imagenes medicas o tecnicas: aunque no se ha evaluado su precision en dominios especializados, su capacidad de describir formas y colores puede servir para tareas de clasificacion basica de imagenes en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pruebas de correccion puntuales (aritmetica, capital, dias del año) y verificacion de vision con imagenes simples. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. Tampoco se ha medido perplexity ni rendimiento en contexto largo.

## Requisitos de hardware

- VRAM estimada: 26,85 GiB para el archivo GGUF, mas espacio para el proyector de vision y el contexto. En una APU con memoria unificada como Ryzen AI MAX+ 395, se usa la RAM compartida.
- GPU recomendadas: hardware AMD con arquitectura RDNA 4 (gfx1151), como la Radeon 8060S integrada en Ryzen AI MAX+ 395. No es compatible con GPUs NVIDIA ni con llama.cpp estandar.
- Consumo en consumer GPU: no aplica, ya que el formato ROCmFPX es exclusivo de AMD y requiere el fork ROCmFPX de llama.cpp.
- Opciones de despliegue: llama.cpp con el fork ROCmFPX (patches disponibles en el repo 4-bit). No es compatible con vLLM, Ollama ni TGI sin modificaciones.
- Latencia y throughput: 7,48 tok/s medidos en Ryzen AI MAX+ 395 con la variante Q8_0_ROCMFPX. La variante 4-bit es aproximadamente la mitad de tamano y considerablemente mas rapida, segun el autor.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo base (Muse-Glimmer-30B) es la referencia directa, pero no se han publicado benchmarks comparativos con otros modelos de 30B multimodales como Llama 3.2 90B o Qwen2-VL. La unica comparacion posible es entre las variantes de cuantizacion del mismo modelo:

| Variante | Tamano | BPW | Decode (tok/s) |
|---|---|---|---|
| Q4_0_ROCMFP4 (STRIX) | 14,17 GiB | no indicado | no indicado |
| Q8_0_ROCMFPX (AGENT) | 27,23 GiB | 8,39 | 7,22 |
| Q8_0_ROCMFPX (plain) | 26,85 GiB | 8,28 | 7,48 |

## Limitaciones y advertencias

- No es compatible con llama.cpp estandar: requiere el fork ROCmFPX y los patches especificos. Usar el llama.cpp oficial dara errores de carga.
- Flash attention debe desactivarse (`-fa off`) para la ruta de vision en gfx1151; de lo contrario, la vision falla.
- Solo soporta ingles; no se ha verificado su rendimiento en otros idiomas.
- No se han realizado pruebas de perplexity, contexto largo ni tool-calling en esta cuantizacion, por lo que su calidad en esos escenarios es desconocida.
- La vision requiere imagenes de al menos 28×28 px; imagenes mas pequenas producen resultados incorrectos (devuelven "white").
- El rendimiento de 7,48 tok/s es bajo para aplicaciones interactivas en tiempo real; es adecuado para tareas asincronas o procesamiento por lotes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es de Meta y se deben respetar sus terminos adicionales si los hubiera (no se detallan en la informacion).

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/kingjones777/Muse-Glimmer-30B-ROCmFPX-Q8_0-GGUF
- Repositorio 4-bit (con patches y proyector): https://huggingface.co/kingjones777/Muse-Glimmer-30B-ROCmFP4-Strix-Halo-DFlash-GGUF
- Repositorio 8-bit AGENT: https://huggingface.co/kingjones777/Muse-Glimmer-30B-ROCmFPX-Q8_0-AGENT-GGUF
- GitHub con recetas RDNA: https://github.com/AIwork4me/Muse-Glimmer-30B-ROCm
- Pagina oficial de Meta sobre Muse Glimmer: https://developer.meta.com/ai/models/muse-glimmer/
- Documentacion de API de Meta: https://dev.meta.ai/docs/muse-glimmer/get-the-model
