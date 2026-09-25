# johnsor/Mage-Flow-Edit-Turbo-GGUF

## Resumen

Mage-Flow-Edit-Turbo-GGUF es una cuantización en formato GGUF del transformer de difusión de microsoft/Mage-Flow-Edit-Turbo, publicada por el usuario johnsor para su uso con stable-diffusion.cpp. No se trata de un modelo nuevo: el repositorio no aporta pesos entrenados, sino una conversión a Q5_K del checkpoint bf16 original de Microsoft, que pasa de 8,23 GB a 2,65 GB y permite ejecutar edición de imágenes guiada por instrucciones en CPU sin GPU dedicada.

El modelo subyacente es un diffusion transformer multimodal de resolución nativa con aproximadamente 4.115 millones de parámetros (4B), diseñado por Microsoft como parte de la familia Mage-Flow. Mage-Flow-Edit acepta una o varias imágenes de referencia más una instrucción en lenguaje natural y devuelve una imagen editada, cubriendo edición semántica de contenido, transformación de apariencia, restauración de imagen y salidas con conciencia de estructura dentro de un mismo modelo condicionado por imagen y texto. La variante Turbo está alineada para funcionar en 4 pasos de muestreo, frente a los 30 pasos del checkpoint base.

La relevancia de esta ficha concreta es práctica: demuestra que un editor de imágenes de 4B puede cuantizarse a 5 bits sin degradación visual apreciable y correr en hardware de consumo, incluso solo con CPU, en torno a 99 segundos por imagen a 512x512. El autor documenta además que por debajo de 5 bits el transformer no sobrevive al cuantizador uniforme de stable-diffusion.cpp, con artefactos sistemáticos en lugar de una degradación gradual, lo que convierte a Q5_K en el punto de compresión mínimo viable de esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer multimodal de resolucion nativa (stack Mage-Flow: Mage-VAE + transformer de difusion condicionado por imagen y texto) |
| Parametros totales | 4.115.745.408 (aproximadamente 4B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica en el sentido de contexto de texto (el text encoder asociado es Qwen3VL-4B-Instruct) |
| Tipos de cuantizacion | Q5_K (publicado). Reproducibles: Q8_0 (4,08 GB), Q6_K (3,15 GB), Q4_K (2,33 GB), Q4_0 (2,17 GB). Por debajo de Q5_K aparecen artefactos graves |
| Idiomas soportados | No disponible (las instrucciones se procesan via Qwen3VL-4B-Instruct; no se declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (transformer Q5_K); safetensors para el VAE y para el checkpoint fuente bf16 |

Datos adicionales de empaquetado: el transformer Q5_K ocupa 2,65 GB, el text encoder Qwen3VL-4B-Instruct en Q4_K_M 2,33 GB, el proyector de vision (mmproj) en Q8_0 0,42 GB y el VAE en bf16 0,32 GB, para un total aproximado de 5,7 GB. El tamano del repositorio es de 2,8 GB.

## Arquitectura y entrenamiento

Mage-Flow-Edit-Turbo es un diffusion transformer de 4B con empaquetado de resolucion nativa, entrenado por Microsoft sobre una infraestructura con kernels fusionados. El stack compartido de la familia Mage-Flow genera dos instanciaciones: Mage-Flow para generacion texto-a-imagen y Mage-Flow-Edit para edicion guiada por instrucciones. El tokenizador latente es Mage-VAE, un tokenizador ligero de una sola etapa de difusion con anclaje mediante KL de latentes, que reduce el coste del autoencoder frente a los VAE convencionales. Cada instanciacion se distribuye en tres variantes: Base, alineada por RL y Turbo de 4 pasos.

El detalle de entrenamiento que si esta documentado en la informacion disponible es la existencia de una fase de alineamiento por RL (variante RL-aligned) y la destilacion hacia la variante Turbo de 4 pasos. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles del proceso de alineamiento, por lo que esos datos quedan como no disponibles. La cuantizacion aqui descrita no altera el entrenamiento: se genera con `sd-cli -M convert --type q5_K` a partir de `mage_flow_edit_turbo_bf16.safetensors` (revision `c92d73c408515c94beef32161bb5960764fde7a0` de stable-diffusion.cpp), en unos 75 segundos de conversion.

## Capacidades

- Edicion de imagen por instruccion: recibe una o varias imagenes de referencia (multiples flags `-r`) y una instruccion en lenguaje natural, y genera una escena nueva que incorpora el contenido de la referencia.
- Resolucion nativa: no depende de reescalados forzados, lo que favorece la fidelidad en escenas con detalle fino.
- Edicion semantica de contenido, transformacion de apariencia, restauracion de imagen y salidas con conciencia de estructura dentro del mismo modelo.
- Muestreo en 4 pasos con `--cfg-scale 1.0` y metodo de muestreo Euler, lo que habilita inferencia en CPU.
- Condicionamiento multimodal: el proyector `mmproj-Qwen3VL-4B-Instruct-Q8_0.gguf` es imprescindible para que el modelo "vea" la imagen de referencia; sin el, la referencia se ignora.
- Ejecucion con offload a CPU (`--offload-to-cpu`) y atencion de difusion optimizada (`--diffusion-fa`).
- No se declara soporte de tool calling, function calling, agentes, audio ni modo de razonamiento explicito. Es un modelo de generacion/edicion de imagen, no un modelo conversacional general.

## Casos de uso

- Edicion fotografica local sin nube: el modelo procesa la imagen y la instruccion enteramente en el equipo, lo que resulta adecuado para flujos con requisitos de privacidad, ya que ninguna imagen sale del sistema.
- Prototipado en portatiles sin GPU: con 5,7 GB de pesos totales y 99 segundos de latencia a 512x512 en un Ryzen 7 4800H, es viable desarrollar y validar prompts de edicion en maquinas modestas.
- Aumento de datos para entrenamiento: generar variaciones controladas de imagenes existentes (cambios de iluminacion, entorno, vestuario) mediante instrucciones, ampliando datasets de vision por computador con ejemplos etiquetados de forma natural.
- Flujos de e-commerce: sustituir fondos, cambiar el entorno de un producto o modificar condiciones de iluminacion a partir de una fotografia de catalogo, manteniendo el objeto de referencia.
- Restauracion y mejora de imagen: la capacidad declarada de restauracion permite corregir imagenes degradadas o incompletas describiendo el resultado deseado en la instruccion.
- Edicion iterativa sobre multiples referencias: pasar varias imagenes con flags `-r` para componer escenas que combinen elementos de todas ellas, util en diseno grafico y previsualizacion de conceptos.
- Integracion en pipelines de automatizacion grafica: al ser GGUF y ejecutarse con sd-cli, se puede envolver en scripts y servicios por lotes que apliquen una misma plantilla de edicion a colecciones de imagenes.
- Herramientas de accesibilidad: convertir descripciones textuales en ediciones concretas sobre una imagen de referencia proporcionada por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se aportan metricas objetivas de calidad de edicion (FID, CLIP score, similitud de sujeto) para el modelo base ni para la cuantizacion.

Los unicos datos de rendimiento disponibles son cualitativos y de latencia:

| Metrica | Valor |
|---|---|
| Pasos de muestreo (Turbo) | 4 (el checkpoint base usa 30) |
| CFG scale | 1.0 |
| Metodo de muestreo | euler |
| Resolucion del ejemplo | 512x512 |
| Latencia end-to-end en CPU (Ryzen 7 4800H) | 99 segundos |
| Tamano del transformer Q5_K | 2,65 GB (frente a 8,23 GB en bf16) |

Calidad por tipo de cuantizacion, segun pruebas del autor con la misma fuente bf16 y ajustes identicos:

| Tipo | Tamano | Resultado |
|---|---|---|
| bf16 (fuente) | 8,23 GB | Limpio |
| Q8_0 | 4,08 GB | Limpio |
| Q6_K | 3,15 GB | Limpio |
| Q5_K (este archivo) | 2,65 GB | Limpio, indistinguible de bf16 segun el autor |
| Q4_K | 2,33 GB | Artefactos graves de textura en todo el encuadre |
| Q4_0 | 2,17 GB | Sin imagen, textura plana rosada |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 6-7 GB si se cargan simultaneamente transformer (2,65 GB), text encoder (2,33 GB), mmproj (0,42 GB) y VAE (0,32 GB), mas el overhead de activaciones y buffers. Cabe en GPUs consumer de 8 GB con margen ajustado; con `--offload-to-cpu` se puede reducir la huella en VRAM a costa de latencia.
- Ejecucion sin GPU: confirmada. El autor reporta 99 segundos end-to-end a 512x512 en un Ryzen 7 4800H usando solo CPU.
- GPU recomendadas: no disponibles en la informacion proporcionada. Dado que el modelo corre en CPU y esta pensado para stable-diffusion.cpp, cualquier GPU con 8 GB o mas de VRAM deberia ser suficiente, pero no hay datos medidos que lo respalden.
- Opciones de despliegue: stable-diffusion.cpp (binario `sd-cli`), integracion en offgrid (para la que fue cuantizado), y empaquetado de Comfy-Org/Mage-Flow como origen de los pesos fuente.
- Latencia y throughput: 99 segundos por imagen a 512x512 en el hardware CPU citado. No hay datos de throughput en GPU ni de resoluciones superiores.
- Requisito critico de memoria: el proyector de vision (`mmproj`) debe cargarse siempre que se use una imagen de referencia; omitirlo degrada silenciosamente el resultado porque la referencia se ignora.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage-Flow-Edit-Turbo-GGUF (johnsor) | 4B (4.115.745.408) | No aplica | Sin benchmarks; latencia 99 s a 512x512 en CPU | MIT | GGUF Q5_K, 2,65 GB, repo de 2,8 GB |
| microsoft/Mage-Flow-Edit-Turbo (bf16, fuente) | 4B | No aplica | Sin benchmarks publicados en la informacion disponible | MIT | bf16, 8,23 GB; repositorio de Microsoft no accesible actualmente segun el autor |
| Comfy-Org/Mage-Flow (repaquete de referencia) | 4B | No aplica | No disponible | MIT | Safetensors bf16 en Comfy-Org |
| Otros editores por instruccion de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de modelos alternativos (por ejemplo editores de imagen por instruccion de otros fabricantes) en la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Cuantizacion fragil: por debajo de 5 bits el transformer no degrada de forma gradual, sino que aparece un patron sistematico de textura tipo "corduroy" en Q4_K y una ausencia total de imagen coherente en Q4_0. No es viable bajar a 4 bits con el cuantizador uniforme de stable-diffusion.cpp.
- Dependencia de multiples archivos: el GGUF publicado es solo el transformer. Sin el text encoder Qwen3VL-4B-Instruct, el mmproj y el VAE de Comfy-Org no funciona. El autor estima unos 5,7 GB en total.
- Modelo no conversacional: no admite tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de edicion/generacion de imagen.
- Idiomas no declarados: no hay lista de idiomas soportados para las instrucciones. El comportamiento multilingue depende del text encoder asociado y no esta documentado.
- Sin benchmarks: no existen metricas objetivas publicadas en la informacion disponible que permitan comparar su calidad con alternativas.
- Trazabilidad del origen: el autor indica que los repositorios `microsoft/Mage-Flow` y `microsoft/Mage-Flow-Edit-Turbo` no eran accesibles en el momento de la publicacion, por lo que la fuente real de los pesos es el repaquete de Comfy-Org. Conviene verificar la procedencia si se necesita trazabilidad estricta.
- Riesgo de alucinacion visual: como todo modelo generativo, puede introducir o eliminar elementos no solicitados y no preservar fielmente la identidad del sujeto de referencia.
- Licencia: MIT, sin restricciones declaradas para uso comercial, heredada de microsoft/Mage. Al ser una cuantizacion, la licencia aplicable es la del modelo original.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Nota de fecha: la fecha de creacion registrada (2026-09-24) es posterior a la de la mayoria de checkpoints de la familia, dato a tener en cuenta al verificar versiones.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/johnsor/Mage-Flow-Edit-Turbo-GGUF
- Modelo base en HuggingFace: https://huggingface.co/microsoft/Mage-Flow-Edit-Turbo
- Fuente de pesos y VAE (Comfy-Org): https://huggingface.co/Comfy-Org/Mage-Flow
- Text encoder Qwen3VL-4B-Instruct-GGUF: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Repositorio microsoft/Mage: https://github.com/microsoft/Mage
- offgrid (destino de la cuantizacion): https://github.com/woelper/offgrid
- Pipeline MageFlow Edit GGUF con Ollama: https://github.com/47thtechcorner/RayCodes_MageFlow_Edit_GGUF/blob/master/
- Repaquete alternativo del modelo: https://huggingface.co/Jinstudio/Mage-Flow-Edit-Turbo
- Ficha y analisis en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/mage-flow-edit-turbo-microsoft
- Ficha en onlylabs: https://www.onlylabs.fyi/signals/34513ad1-7ea6-4be5-ab98-123bad550ccf
