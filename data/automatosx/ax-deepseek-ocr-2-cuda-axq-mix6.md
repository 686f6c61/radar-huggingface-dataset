# AutomatosX/AX-DeepSeek-OCR-2-CUDA-AXQ-MIX6

## Resumen

AX-DeepSeek-OCR-2-CUDA-AXQ-MIX6 es un checkpoint cuantizado del modelo DeepSeek-OCR-2 de DeepSeek, convertido por AutomatosX mediante el encoder nativo AXQuant con cuantizacion round-to-nearest (RTN). Se trata de un modelo de vision-lenguaje para OCR (pipeline image-text-to-text) que combina matrices de 4 bits NVFP4 y matrices de 8 bits FP8 E4M3 en un unico checkpoint para materializar lo que el autor denomina "clase de presupuesto de 6 bits" en CUDA. No existe un tipo de dato flotante de 6 bits en CUDA, de modo que este "6-bit pack" es un presupuesto de bits por peso, no un dtype real.

El modelo parte del checkpoint oficial deepseek-ai/DeepSeek-OCR-2 (revision inmutable `aaa02f3811945a91062062994c5c4a3f4c0af2b0`, licencia apache-2.0), que cuenta con 3.389 millones de parametros en BF16. La conversion reduce ese total a unos 2.728 millones de parametros segun el recuento real de safetensors (la model card cifra 2.602.844.160 en 2196 tensores), en un repositorio de 3,6 GB. La longitud de contexto y el numero de parametros activos no se detallan en la informacion disponible.

Su relevancia ahora es practica: propone una ruta de cuantizacion mixta (W4A16 en NVFP4 y W8A8 en FP8) con los tensores criticos protegidos en BF16, verificada solo en modo smoke test sobre dos hosts NVIDIA y publicada como development preview, no certificada. Es un artefacto pensado para despliegue con vLLM, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (tag `deepseek_vl_v2`) con capas MoE y proyecciones de atencion DeepseekV2 |
| Parametros totales | 2.728.516.480 (safetensors); model card: 2.602.844.160 parametros cuantizados en 2196 tensores; modelo original BF16: 3.389.119.360 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1, W4A16) y FP8 E4M3 (W8A8) mezclados; 511 tensores protegidos en BF16 |
| Idiomas soportados | no disponible (solo se ha probado una pagina generada en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con configuracion `compressed-tensors` y `custom_code` |

## Arquitectura y entrenamiento

El modelo es una conversion cuantizada, no un entrenamiento nuevo. La arquitectura subyacente es la del DeepSeek-OCR-2 original, etiquetada como `deepseek_vl_v2`: un transformer vision-lenguaje con modulo de vision (vision tower), capas MoE y proyecciones de atencion de tipo DeepseekV2. La cuantizacion se aplica exclusivamente sobre el "language trunk"; el vision tower, los routers, los embeddings, las normalizaciones y la LM head quedan protegidos en BF16 en origen (511 tensores, 0,786 mil millones de parametros). La asignacion real de bits por peso en el trunk es de 6,2371 frente al objetivo solicitado de 6,0.

El proceso de cuantizacion usa el encoder explicito `numpy-reference` (CPU) de AXQuant con RTN, el mismo camino que los packs NVFP4 CUDA de AXQuant; el autor indica explicitamente que no se emplea el algoritmo AWQ ni ningun checkpoint AWQ. El reparto queda asi: 1152 tensores (1,321 mil millones de parametros) en NVFP4 con pesos E2M1, escala de bloque E4M3FN por cada 16 valores, escala global FP32 inversa y activaciones BF16 (W4A16); y 1044 tensores (1,282 mil millones de parametros, aproximadamente el 49,2% del trunk cuantizado) en FP8 E4M3FN con escala FP32 por fila y escalado dinamico por token de la activacion en tiempo de ejecucion (W8A8). El manifiesto registra `status=development`, `runtime_verified=false` y `quality_certified=false`, por lo que no hay certificacion de calidad implicita.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, con pipeline `image-text-to-text`.
- Generacion de texto condicionada por imagen, orientada a la transcripcion de paginas.
- Procesamiento con chunked prefill habilitado en vLLM (usado en la prueba de humo).
- Inferencia acelerada mediante vLLM sobre los pesos cuantizados (NVFP4 y FP8).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la unica prueba documentada es una pagina en ingles.
- Capacidad especial: perfil de cuantizacion mixta NVFP4 + FP8 con backend MARLIN para las capas NVFP4 y `CompressedTensorsW8A8Fp8` para las FP8.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede transcribir paginas de texto a formato digital; su formato compacto (3,6 GB) permite desplegarlo en una sola GPU para procesar lotes de escaneos.
- Ingesta documental para pipelines RAG: al ser un modelo image-text-to-text, permite convertir documentos en imagen a texto estructurado antes de indexarlo, reduciendo la dependencia de herramientas OCR externas.
- Procesamiento de formularios y facturas: la tarea OCR encaja en la extraccion de campos de documentos administrativos, siempre que se valide la precision, que aqui no esta certificada.
- Archivado y busqueda sobre PDFs: el modelo se integra en flujos que convierten acervos escaneados a texto buscable en un despliegue vLLM unico.
- Prototipado de producto OCR en GPUs consumer: al caber en 3,6 GB y haberse probado en una RTX 5090, sirve para experimentar con OCR multimodal sin infraestructura de datacenter.
- Evaluacion comparativa de esquemas de cuantizacion: util para equipos que quieran medir el impacto de un presupuesto de 6 bits mixto frente a alternativas W4A16 o W4A4 del mismo autor.
- Servicio OCR interno autoalojado: desplegable con el contenedor oficial de vLLM y la imagen de `vllm-openai`, evitando enviar documentos sensibles a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta una prueba de humo sobre una pagina generada en ingles y declara explicitamente que no hay evaluacion OCR con conjunto reservado, ni cualificacion de layout o markup, ni afirmaciones de precision o velocidad. La evidencia de ejecucion disponible es cualitativa:

| Host | GPU | Entorno | Resultado |
|---|---|---|---|
| df-rtx5090 | GeForce RTX 5090 (CUDA 13.0, torch 2.11.0+cu130, vLLM 0.25.1) | `vllm/vllm-openai@sha256:f0b9a0dc...` | passed |
| df-thor-01 | NVIDIA Thor (vLLM 0.25.1) | `vllm/vllm-openai@sha256:2cc49b81...` | passed |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 3,6 GB; hay que anadir KV cache, activaciones del tower de vision y overhead del runtime, por lo que en la practica se recomienda reservar al menos 8 GB segun la carga. Cifra orientativa, no confirmada por el autor.
- GPU recomendadas: se ha verificado en GeForce RTX 5090 y en NVIDIA Thor. NVFP4 requiere hardware clase Blackwell para el backend MARLIN.
- Cabe en GPU consumer: si, la RTX 5090 esta confirmada como host de desarrollo. Otras consumer no aparecen probadas.
- Opciones de despliegue: vLLM con las imagenes `vllm/vllm-openai` indicadas (vLLM 0.25.1). No se documenta soporte GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible (el autor no publica cifras de velocidad).
- Reproduccion de la conversion: `axquant plan-cuda` con `--q-mode mix6 --target-bpw 6.0` y posterior `axquant convert-cuda`. La prueba de humo se ejecuta con `examples/ocr_smoke.py`.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| AX-DeepSeek-OCR-2-CUDA-AXQ-MIX6 (este) | 2.728.516.480 (safetensors) | Mixta NVFP4 + FP8 E4M3 (presupuesto 6 bits) | no disponible | apache-2.0 | development preview |
| AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A16 | no disponible | NVFP4 W4A16 | no disponible | apache-2.0 | development preview |
| AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A4 | no disponible | NVFP4 W4A4 | no disponible | apache-2.0 | development preview |
| deepseek-ai/DeepSeek-OCR-2 (base) | 3.389.119.360 | BF16 | no disponible | apache-2.0 | modelo oficial |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documenta analisis de sesgos.
- Riesgo de alucinacion: propio de los modelos generativos de vision-lenguaje; el autor no aporta evaluacion de fidelidad de transcripcion.
- La unica evidencia de calidad es una prueba de humo con una pagina en ingles sobre dos GPUs; no hay evaluacion OCR con conjunto reservado ni cualificacion de layout o markup.
- El manifiesto indica `runtime_verified=false` y `quality_certified=false`, y no implica ninguna certificacion Tier 1 o Tier 2.
- La enumeracion de kernels no es exhaustiva: la prueba verifica carga y generacion de ambas familias de tensores, no un numero concreto de kernels FP8.
- Limitaciones de idioma: solo hay evidencia en ingles; el soporte de otros idiomas es no disponible.
- Limitaciones de contexto: la longitud de contexto no se especifica.
- Licencia apache-2.0, que permite uso comercial, pero el estado de desarrollo no verificado desaconseja su uso en produccion sin validacion propia.
- La ruta de despliegue documentada es CUDA con vLLM; AX Engine sigue siendo el runtime de Apple Silicon y el despliegue en flota CUDA corresponde a AX Serving. No hay soporte declarado para GGUF, llama.cpp u Ollama.
- La cuantizacion NVFP4 exige hardware clase Blackwell; en otras GPUs el despliegue puede no ser viable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-DeepSeek-OCR-2-CUDA-AXQ-MIX6
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Variante NVFP4-W4A16: https://huggingface.co/AutomatosX/AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A16
- Variante NVFP4-W4A4: https://huggingface.co/AutomatosX/AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A4
- Repositorio GitHub de DeepSeek-OCR-2: https://github.com/deepseek-ai/DeepSeek-OCR-2
- Documentacion de instalacion (DeepWiki): https://deepwiki.com/deepseek-ai/DeepSeek-OCR/2.1-installation
- Ficha en Inferix: https://inferix.co/models/deepseek-ai/DeepSeek-OCR-2
