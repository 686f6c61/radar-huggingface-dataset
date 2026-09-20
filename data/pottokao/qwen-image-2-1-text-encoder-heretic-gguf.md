# pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF

## Resumen

`pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF` es una compilacion en formato GGUF Q4_K_M del codificador de texto «abliterado» (sin mecanismos de rechazo) de `Qwen/Qwen-Image-2.1`. No se trata de un modelo conversacional de proposito general, sino del componente de codificacion de texto —derivado de la familia Qwen3-VL de 8B— que alimenta el pipeline de generacion y edicion de imagenes de Qwen-Image-2.1. El autor, pottokao, es un desarrollador independiente de la comunidad y no tiene vinculacion con Alibaba ni con el equipo de Qwen.

El modelo cuenta con 8.190.735.360 parametros totales (arquitectura densa, no MoE) y se distribuye cuantizado a 4.90 bits por peso, pasando de los 15.623 MiB del GGUF bf16 de origen a 4.789 MiB. El repositorio incluye dos archivos: el torre de lenguaje cuantizado (399 tensores, 4.68 GB) y un proyector multimodal `mmproj` en f16 con el torre de vision sin cuantizar (352 tensores, 1.08 GB), necesario solo si se trabaja con Qwen-Image-2.1 Edit (entrada condicionada por imagen).

Su relevancia es doble. Por un lado, ofrece una ruta real de ejecucion en hardware no NVIDIA —Mac Apple Silicon y el ecosistema llama.cpp—, donde las compilaciones NVFP4 y W4A8 de la misma familia dependen de kernels CUDA y degradan a dequantize-then-compute fuera de NVIDIA. Por otro, incorpora una ablacion direccional que reduce los rechazos de 100/100 a 5/100 con una divergencia KL de 0.0220, lo que lo convierte en una pieza interesante para investigacion sobre alineacion, seguridad y sesgos, ademas de para flujos de generacion de imagen sin filtros de contenido. La licencia Qwen Research restringe el uso a investigacion y evaluacion, quedando prohibido el uso comercial sin licencia adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal basado en Qwen3-VL (`Qwen3VLForConditionalGeneration`, registrado en `llama.cpp` via `conversion/qwen3vl.py`) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (4.90 bpw) para el torre de lenguaje; f16 (sin cuantizar) para el torre de vision (`mmproj`) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | `qwen-research` (Qwen Research License); solo investigacion y evaluacion, uso comercial sujeto a licencia aparte de Qwen |
| Formato de pesos | GGUF (`llama.cpp`); en la familia tambien existen bf16 safetensors, NVFP4 y W4A8 |
| Repo y tamano | 6.2 GB en total; `qwen3vl_8b_heretic-Q4_K_M.gguf` 4.68 GB + `mmproj-qwen3vl_8b_heretic-f16.gguf` 1.08 GB |
| Tensores | 399 (lenguaje) + 352 (vision) = 750 del modelo fuente + 1 parametro del proyector |
| Uso previsto | Codificador de texto para Qwen-Image-2.1 y Qwen-Image-2.1 Edit |
| Descargas / likes | 0 descargas, 1 like (en el momento de la consulta) |

## Arquitectura y entrenamiento

La base es el codificador de texto de `Qwen/Qwen-Image-2.1`, un transformer denso multimodal de la familia Qwen3-VL con 8,19 B de parametros. Este repositorio no entrena ningun modelo: parte del checkpoint bf16 ya modificado (`pottokao/Qwen-Image-2.1-Text-Encoder-Heretic`) y lo convierte a GGUF con `llama.cpp`, para despues cuantizarlo con `llama-quantize` a Q4_K_M, el esquema K-quant de precision mixta que mantiene automaticamente ciertos tensores en mayor profundidad de bits. Se desconocen los datos de entrenamiento originales (numero de tokens, composicion del dataset, si hubo RLHF o DPO), ya que la informacion disponible no los detalla.

La innovacion tecnica del linaje es la ablacion direccional aplicada con [Heretic](https://github.com/p-e-w/heretic) sobre las proyecciones `o_proj` y `down_proj` (200 ensayos, 60 de arranque, punto de rodilla de la frontera de Pareto). El resultado medido es una caida de los rechazos de 100/100 en el codificador original a 5/100, con una divergencia KL de 0.0220 respecto al modelo de referencia sobre `mlabonne/harmless_alpaca`; la verificacion sobre el fuente bf16 dio 0/20 rechazos y 4/4 respuestas correctas en preguntas benignas.

El reparto de precision del archivo es explicito: 252 tensores de FFN y proyecciones de atencion en 4 bits (79,2 % de los parametros), `embed_tokens` y `lm_head` en INT8 per-channel con rotacion convolucional (14,2 %) y el torre de vision —351 tensores— intacto en bf16/f16 (6,6 %), junto con normas y sesgos. El torre de vision se publica aparte como `mmproj` precisamente porque `llama.cpp` separa los modelos multimodales en dos archivos. El autor documenta cinco trampas de conversion que producen archivos «validos en apariencia» pero silenciosamente incorrectos, entre ellas cuantizar por error el torre de vision o perder los metadatos `convrot` al serializar la configuracion por capas.

## Capacidades

- Codificacion de texto para generacion de imagen: produce las representaciones que consume Qwen-Image-2.1 para sintetizar imagenes a partir de un prompt.
- Edicion de imagen condicionada: con el archivo `mmproj` cargado, procesa entrada multimodal (imagen de referencia mas texto) para el flujo Qwen-Image-2.1 Edit.
- Generacion de texto conversacional: hereda del backbone Qwen3-VL la capacidad de producir texto, aunque su uso previsto es el de codificador.
- Comprension de imagenes: el torre de vision en f16 conserva las capacidades visuales del modelo original, si bien no se documentan tareas concretas evaluadas.
- Ausencia de rechazos: la ablacion direccional reduce drasticamente las negativas a responder, lo que cambia el perfil de comportamiento respecto al modelo original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no documentado.
- Capacidades multilingues: no disponibles; la model card no lista idiomas.
- Integracion con `llama.cpp` y ComfyUI-GGUF: se puede cargar con `llama-cli`/`llama-server` o como text encoder en ComfyUI.

## Casos de uso

- Generacion texto-a-imagen en Mac Apple Silicon: el archivo principal de 4.68 GB se carga con `llama-cli -m qwen3vl_8b_heretic-Q4_K_M.gguf -ngl 99` aprovechando el soporte Metal nativo de `llama.cpp`, ruta que las builds NVFP4 y W4A8 no ofrecen por depender de kernels CUDA.
- Flujos de edicion de imagen en ComfyUI: cargando el GGUF junto con `mmproj-qwen3vl_8b_heretic-f16.gguf` como text encoder dentro de `ComfyUI-GGUF`, se puede condicionar Qwen-Image-2.1 Edit con una imagen de referencia mas un prompt de texto.
- Prototipado en GPU de gama media: con 5.76 GB combinados de pesos, el conjunto cabe en tarjetas de 8-12 GB de VRAM, lo que permite experimentar con el pipeline completo sin acceso a A100/H100.
- Investigacion sobre ablacion direccional: replicar la metodologia de Heretic sobre `o_proj` y `down_proj` para estudiar el equilibrio entre supresion de rechazos y degradacion de capacidades, usando la KL de 0.0220 como referencia.
- Auditoria de seguridad y sesgos: comparar sistematicamente las salidas del modelo abliterado frente al codificador original de Qwen-Image-2.1 en conjuntos como `mlabonne/harmful_behaviors` para cuantificar el efecto de la ablacion en el contenido generado.
- Redistribucion de estilos visuales sin filtros: estudios academicos sobre generacion de imagenes que requieren prompts que el codificador original rechazaria, siempre dentro del marco de investigacion que impone la licencia.
- Evaluacion de cuantizacion en pipelines multimodales: medir el impacto de Q4_K_M frente al fuente bf16 de 17 GB en la fidelidad del condicionamiento de imagen, ya que el autor publica ambas versiones y las alternativas NVFP4/W4A8.
- Benchmarking en hardware no NVIDIA: usar el modelo como caso de prueba del rendimiento de GGUF sobre CPU y Metal en comparacion con las rutas CUDA, dado que el autor documenta explicitamente que fuera de NVIDIA las builds alternativas solo ahorran memoria sin acelerar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos cuantitativos facilitados corresponden a la evaluacion de la ablacion:

| Metrica | Qwen-Image-2.1 text encoder (original) | Esta familia (Heretic) |
|---|---|---|
| Rechazos (`mlabonne/harmful_behaviors`) | 100/100 | 5/100 |
| Divergencia KL (`mlabonne/harmless_alpaca`) | 0 (por definicion) | 0.0220 |
| Rechazos sobre fuente bf16 (verificacion independiente) | no disponible | 0/20 |
| Preguntas benignas respondidas correctamente (bf16) | no disponible | 4/4 |

## Requisitos de hardware

- Peso en disco/VRAM de los pesos: 4.68 GB el torre de lenguaje (Q4_K_M) mas 1.08 GB el torre de vision (f16), es decir 5.76 GB si se necesita entrada condicionada por imagen.
- VRAM estimada: en torno a 5-6 GB para uso como codificador de texto y 6-7 GB con el `mmproj` cargado, incluyendo overhead de contexto y cache KV (no se publican cifras oficiales de consumo en ejecucion).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4090; tambien A100 o H100 si se integra en infraestructura mayor, aunque el modelo no necesita ese segmento.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB con holgura; en 8 GB el torre de lenguaje solo entra con margen escaso y la variante con vision es arriesgada.
- Apple Silicon: soporte Metal real, que es la via recomendada por el autor para hardware no NVIDIA junto con CPU.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), `ComfyUI-GGUF` como text encoder. El soporte en vLLM o TGI para este GGUF concreto no esta documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa dentro de la propia familia Heretic, que es la referencia mas directa disponible:

| Repo | Formato / cuantizacion | Tamano | Hardware objetivo | Rechazos | KL |
|---|---|---|---|---|---|
| Este repo | GGUF Q4_K_M | 4.68 GB (+1.08 GB mmproj) | Mac, llama.cpp, CPU | 5/100 | 0.0220 |
| `Qwen-Image-2.1-Text-Encoder-Heretic` | bf16 safetensors | 17 GB | GPU con VRAM amplia | 5/100 | 0.0220 |
| `Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4` | NVFP4 (w4) | 5.87 GB | Blackwell, tensor cores FP4 nativos | 5/100 | 0.0220 |
| `Qwen-Image-2.1-Text-Encoder-Heretic-W4A8` | W4A8 INT8 asimetrico | 5.88 GB | CUDA (formato de Comfy-Org) | 5/100 | 0.0220 |
| Codificador original `Qwen/Qwen-Image-2.1` | bf16 | 15.26 GB | NVIDIA, CUDA | 100/100 | 0 (referencia) |

Frente al codificador original, este modelo intercambia 0.0220 de divergencia KL por una reduccion de rechazos del 95 %. Frente a las otras cuantizaciones de la familia, la diferencia es de portabilidad: NVFP4 y W4A8 exigen kernels CUDA y solo ahorran memoria fuera de NVIDIA, mientras que GGUF obtiene aceleracion real en Metal. No se dispone de comparativas con otros codificadores de texto de pipelines de difusion (por ejemplo T5 o CLIP) en la informacion proporcionada, ya que no serian intercambiables directamente en Qwen-Image-2.1.

## Limitaciones y advertencias

- Licencia no comercial: la Qwen Research License permite unicamente investigacion y evaluacion; cualquier uso comercial requiere licencia adicional de Qwen (`model-business@notice.qwencloud.com`).
- Modelo derivado no oficial: no esta afiliado ni respaldado por Alibaba o Qwen; el autor lo declara explicitamente.
- Ablacion deliberada de rechazos: 5/100 rechazos implica que el modelo apenas declina peticiones daninas, con los riesgos legales y eticos que ello conlleva en un pipeline de generacion de imagenes.
- Divergencia respecto al original: KL de 0.0220 sobre `harmless_alpaca` indica que no es identico al codificador oficial; puede degradar sutilmente la fidelidad del condicionamiento.
- Torre de vision sin cuantizar: ignorar el archivo `mmproj` en flujos de edicion de imagen hace que el modelo no reciba la condicion visual, aunque el texto funcione.
- Errores de conversion conocidos: el autor documenta cinco fallos que generan archivos aparentemente validos pero silenciosamente incorrectos, por lo que se recomienda usar exactamente los archivos publicados y no reconvertir a mano.
- Rendimiento no verificado: no hay benchmarks de calidad de generacion de imagen, ni datos de latencia, throughput o consumo de VRAM en ejecucion.
- Idiomas y contexto desconocidos: la model card no especifica cobertura linguistica ni longitud de contexto, lo que impide planificar prompts largos o despliegues multilingues con garantias.
- Adopcion minima: 0 descargas y 1 like en el momento de la consulta, sin comunidad que haya validado el artefacto de forma independiente.
- Riesgo de alucinacion: no evaluado en la informacion disponible, aunque es relevante si se usa el backbone como generador de texto y no solo como codificador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF
- Modelo base (bf16, fuente de la cuantizacion): https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Variante NVFP4: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4
- Variante W4A8 INT8: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Heretic (herramienta de ablacion direccional): https://github.com/p-e-w/heretic
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces disponibles proceden de la model card del autor.
