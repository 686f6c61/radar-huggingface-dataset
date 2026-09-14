# manuel121357/Dolphin3.0-Llama3.1-8B-q4f16_1-MLC

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una compilación lista para WebGPU de Dolphin3.0-Llama3.1-8B, el ajuste fino sin censura de Llama 3.1 8B publicado por Cognitive Computations (Eric Hartford). La build la firma el usuario manuel121357 y deriva de otra build previa de MLC (huggingkot/Dolphin3.0-Llama3.1-8B-q4f16_1-MLC). Su unico proposito es permitir la ejecucion del modelo dentro del navegador mediante WebLLM.

El cambio tecnico respecto a la build original es minimo y muy concreto: el vocabulario se recorta de 128.258 a 128.256 entradas eliminando las dos ultimas filas de `model.embed_tokens` y `lm_head` (los tokens `<|im_end|>` y `<|im_start|>` con ids 128256-128257, que Llama 3.1 no utiliza). Con ello la build encaja con los motores WASM estándar de WebLLM (`Llama-3_1-8B-Instruct-q4f16_1_cs1k-webgpu.wasm`), reutilizando un binario ya publicado en lugar de compilar uno propio.

Es relevante porque demuestra una via practica de despliegue de un 8B cuantizado a 4 bits enteramente en el cliente: sin servidor, sin API y sin coste de inferencia, con los pesos servidos como ficheros estáticos y ejecutados sobre WebGPU. La contrapartida es que se trata de una build de comunidad sin validación adicional, con cuantizacion unica q4f16_1 y con la licencia Llama 3.1 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con Grouped Query Attention, compilado con MLC-LLM para WebGPU/WASM |
| Parametros totales | No declarado en el repositorio; el modelo base Llama 3.1 8B tiene 8.030 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | La base Llama 3.1 admite 128.000 tokens; en el ejemplo de configuracion para WebLLM se fija `context_window_size: 4096` y `prefill_chunk_size: 1024` |
| Tipos de cuantizacion | Unicamente q4f16_1 (pesos de 4 bits, activaciones y computo en fp16) |
| Idiomas soportados | `en` declarado en la model card; Llama 3.1 cubre oficialmente 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | `llama3.1` (Llama 3.1 Community License) |
| Formato de pesos | Artefactos MLC-LLM (`mlc-llm`) para WebGPU; no se distribuyen safetensors ni GGUF. Tamano del repo: 4,5 GB |
| Modelo base | cognitivecomputations/Dolphin3.0-Llama3.1-8B |
| Build de origen | huggingkot/Dolphin3.0-Llama3.1-8B-q4f16_1-MLC |
| Biblioteca | mlc-llm / web-llm |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y Grouped Query Attention, que reduce el numero de cabezas de clave/valor para aligerar la cache KV durante la decodificacion. Sobre esa base, Cognitive Computations aplico un ajuste fino supervisado orientado a eliminar los rechazos y el tono moralizante del modelo original, dentro de la familia Dolphin 3.0. El repositorio que nos ocupa no entrena nada: toma esos pesos ya ajustados, los cuantiza a 4 bits y los compila con MLC-LLM para su ejecucion sobre WebGPU.

El detalle tecnico distintivo de esta build es el parcheo del vocabulario. El tokenizador de Dolphin heredaba dos entradas extra por encima del vocabulario oficial de Llama 3.1 (128.258 frente a 128.256), lo que impedía reutilizar los binarios WASM estandar de WebLLM. Al recortar las dos ultimas filas de la matriz de embeddings y de la cabeza de salida, ambas de 128.256 entradas, la build pasa a ser binariamente compatible con `Llama-3_1-8B-Instruct-q4f16_1_cs1k-webgpu.wasm`, ya publicado en el repositorio de binarios de MLC. El autor indica que el resto de los pesos es identico al original.

No se dispone de informacion en este repositorio sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones adicionales de decodificacion. Tampoco se documenta el proceso exacto de cuantizacion mas alla del esquema q4f16_1.

## Capacidades

- Generacion de texto conversacional multi-turno, con el estilo directo y sin filtros morales caracteristico de la familia Dolphin.
- Razonamiento de uso general e instrucciones encadenadas propias de un modelo instruct de 8B.
- Generacion y explicacion de codigo en lenguajes habituales, heredada del preentrenamiento de Llama 3.1.
- Resolucion de problemas matematicos sencillos y de varios pasos, sin garantia de correccion en cadenas largas.
- Ejecucion integra en el navegador mediante WebLLM sobre WebGPU, con los pesos servidos como estaticos.
- Compatibilidad con el binario CS1K de WebLLM, que aplica prefill troceado para limitar picos de memoria en contextos largos.
- Capacidad multilingue limitada: la model card solo declara ingles, aunque los pesos base de Llama 3.1 conservan cierto rendimiento en los otros siete idiomas oficiales.
- Tool calling / function calling: la familia Dolphin 3.0 documenta soporte de function calling en su publicacion original, pero no se verifica ni se documenta en esta build MLC concreta; se considera no confirmado.
- Modo thinking explicito: no disponible en esta build.
- Vision y audio: no soportados (modelo puramente de texto).

## Casos de uso

- Asistente conversacional embebido en una web: el modelo se carga con WebLLM y atiende al usuario en la propia pagina, con los 4.096 tokens de contexto configurados de serie, sin backend ni coste por token.
- Aplicacion de escritorio o PWA con funcionamiento sin conexion: al cachearse los 4,5 GB de pesos en el navegador, el asistente sigue operativo sin red, util en entornos con conectividad intermitente.
- Procesamiento de texto con privacidad estricta: informes medicos, borradores legales o notas internas pueden resumirse y reescribirse sin que el contenido salga del dispositivo del usuario, al no existir llamada a ninguna API.
- Demo tecnica y material docente: permite mostrar cuantizacion de 4 bits, compilacion MLC y ejecucion WebGPU en una sola pagina, con la ventana de contexto y el tamano de prefill ajustables desde la configuracion.
- Generacion de codigo en herramientas ligeras: autocompletado y explicacion de fragmentos dentro de un editor web, aceptable para tareas cortas donde no se requiere un contexto de repositorio completo.
- Prototipado rapido de productos conversacionales: al no requerir infraestructura, sirve para validar prompts, tono y flujos de dialogo antes de invertir en un despliegue con GPU dedicada.
- Redaccion y reescritura de contenidos en ingles: variaciones de copy, resumenes y cambio de registro, aprovechando la naturaleza poco restrictiva del ajuste Dolphin.
- Extraccion de datos de formularios y textos en un pipeline cliente: tareas de clasificacion o normalizacion de campos que se benefician de no enviar los documentos a un tercero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a describir el parcheo del vocabulario y la configuracion de despliegue en WebLLM; no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones con modelos alternativos. Tampoco se documentan mediciones de latencia o throughput para esta build.

## Requisitos de hardware

- VRAM estimada: en torno a 4,5 GB solo para los pesos (tamano del repo) y aproximadamente 5-6 GB en total contando la cache KV con la ventana de 4.096 tokens configurada. Aumentar `context_window_size` incrementa el consumo de forma aproximadamente lineal.
- Ejecucion en navegador: requiere un navegador con WebGPU habilitado (Chrome/Edge 113 o superior y equivalentes basados en Chromium). El binario WASM referenciado es de tipo webgpu.
- GPU de gama media: tarjetas dedicadas con 6 GB o mas de VRAM, como RTX 3050, RTX 3060, RTX 4060 o superiores, son suficientes para la configuracion de 4.096 tokens.
- GPU integradas: los chips Apple Silicon (M1 y posteriores) y las integradas Intel Arc suelen ejecutar la build con memoria unificada, aunque con throughput inferior al de una dedicada.
- GPU de centro de datos: A100, H100 o L40S no aportan ventaja en este formato; el objetivo de la build es el cliente. Para despliegues en servidor conviene usar los pesos originales con vLLM o TGI.
- Opciones de despliegue: WebLLM en el navegador es la via documentada; tambien es posible el uso nativo con MLC-LLM. Para llama.cpp, Ollama o LM Studio hay que recurrir a las versiones GGUF del modelo base, no a este repositorio.
- Latencia y throughput: no disponibles. Dependen por completo del backend WebGPU del navegador, de la GPU del cliente y del tamano de prefill, por lo que no existe una cifra representativa unica.
- Almacenamiento: prevea al menos 4,5 GB de cache del navegador o de disco para los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dolphin3.0-Llama3.1-8B-q4f16_1-MLC (este repo) | 8.030 M (base) | 128.000 en la base; 4.096 en la config WebLLM de ejemplo | q4f16_1 (MLC) | Llama 3.1 | WebLLM / MLC-LLM |
| Llama-3.1-8B-Instruct (build MLC q4f16_1 equivalente) | 8.030 M | 128.000 en la base | q4f16_1 (MLC) | Llama 3.1 | WebLLM / MLC-LLM; es el binario WASM que esta build reutiliza |
| Dolphin3.0-Llama3.1-8B (pesos originales en Transformers) | 8.030 M | 128.000 | bf16/fp16, GPTQ y AWQ segun repositorio | Llama 3.1 | transformers, vLLM, llama.cpp |
| Modelos instruct de ~7-8B con soporte WebLLM (por ejemplo Qwen2.5-7B-Instruct en formato MLC) | ~7.600 M | 32.768 en Qwen2.5 | q4f16_1 (MLC) | Apache 2.0 en Qwen2.5 | WebLLM / MLC-LLM |

La ventaja competitiva de esta build es la combinacion de tamano de 8B con una licencia permisiva para el despliegue en cliente y una build ya compatible con el binario estandar de WebLLM. Su desventaja frente a alternativas con licencia Apache 2.0 es la ausencia de datos de rendimiento publicados y las restricciones de la licencia Llama 3.1. No se dispone de cifras de benchmark comparativas para respaldar afirmaciones de rendimiento relativo.

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: la familia Dolphin se ajusta explicitamente para reducir rechazos, por lo que puede generar contenido ofensivo, ilegal o peligroso ante peticiones inadecuadas. No es apto para exposicion directa a usuarios finales sin una capa de moderacion.
- Riesgo de alucinacion: como cualquier modelo de 8B, inventa hechos, citas y referencias, especialmente en tareas de conocimiento factual y en contextos largos.
- Contexto efectivo limitado en esta configuracion: aunque la base admite 128.000 tokens, el ejemplo de despliegue fija 4.096 tokens con prefill de 1.024. Superar esa ventana provoca perdida de informacion o desbordamiento.
- Barrera idiomatica: la model card solo declara ingles. El rendimiento en castellano no esta validado y previsiblemente sera inferior.
- Restricciones de licencia: se hereda la Llama 3.1 Community License, que exige incluir el aviso de licencia, nombra a Meta como titular y limita el uso a menos de 700 millones de usuarios activos mensuales, ademas de imponer la Acceptable Use Policy. El uso comercial es posible, pero no libre de condiciones.
- Build de comunidad sin auditoria: el repositorio acumula cero descargas y cero likes, y no incluye evaluacion, validacion ni firma de integridad mas alla de la afirmacion del autor sobre el recorte de vocabulario.
- Dependencia de binarios externos: la configuracion apunta a un WASM alojado en GitHub, fuera del repositorio. Si esa ruta cambia, la build deja de funcionar tal cual.
- Fidelidad de la cuantizacion: el paso a 4 bits introduce degradacion frente a bf16, mas visible en matematicas, codigo y cadenas de razonamiento largas. No se publican mediciones de esa perdida.
- Portabilidad limitada: el formato MLC/WebGPU no es utilizable con llama.cpp, Ollama, vLLM o TGI. Para esos entornos hay que acudir a otras distribuciones del modelo base.
- Fechas del repositorio: la model card indica fechas de creacion y actualizacion en 2026, posteriores a la publicacion original de Dolphin 3.0, lo que conviene tener en cuenta al trazar procedencias.
- Ausencia de benchmarks: no hay ninguna metrica publicada, de modo que cualquier estimacion de calidad debe obtenerse mediante evaluacion propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/manuel121357/Dolphin3.0-Llama3.1-8B-q4f16_1-MLC
- Modelo base: https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B
- Build MLC de origen: https://huggingface.co/huggingkot/Dolphin3.0-Llama3.1-8B-q4f16_1-MLC
- Repositorio WebLLM: https://github.com/mlc-ai/web-llm
- Repositorio MLC-LLM: https://github.com/mlc-ai/mlc-llm
- Binario WASM referenciado en la configuracion: https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/Llama-3_1-8B-Instruct-q4f16_1_cs1k-webgpu.wasm
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B

Nota: los resultados de la busqueda web realizada no contienen ningun enlace relevante para este modelo; todos corresponden a consultas de soporte sobre Disney+ y no guardan relacion con la ficha.
