# AutomatosX/AX-Qwen3-VL-8B-Instruct-CUDA-AXQ-NVFP4-W4A4

## Resumen

AX-Qwen3-VL-8B-Instruct-CUDA-AXQ-NVFP4-W4A4 es un export cuantizado del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, publicado por AutomatosX bajo licencia Apache-2.0. Se trata de una compilación CUDA en formato NVFP4 con esquema W4A4 (pesos y activaciones en FP4), generada con la herramienta propia AXQuant mediante cuantización RTN (round-to-nearest) sin AWQ. El modelo base es un transformer multimodal denso de 8.767.123.696 parametros que acepta entrada de imagen y texto y produce texto.

La relevancia de esta ficha es acotada y conviene subrayarla: la model card se declara explicitamente como una *development preview* no publicada, con manifiesto de conversion marcado como `runtime_verified=false` y `quality_certified=false`. Es decir, no es una certificacion de calidad ni un modelo listo para produccion, sino una evidencia de ejecucion de un camino de cuantizacion concreto sobre GPUs NVIDIA.

El interes tecnico esta en el formato: cuantizacion NVFP4 nativa con pesos E2M1, escalas E4M3FN cada 16 valores y escalas globales en FP32, manteniendo en BF16 la torre de vision, los mergers DeepStack, los embeddings, las normas y la cabeza LM. El repo ocupa 7,5 GB y se ha probado en vLLM 0.25.1 sobre RTX 5090 y Jetson Thor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (vision tower + modelo de lenguaje); base Qwen3-VL, con mergers DeepStack |
| Parametros totales | 8.767.123.696 (origen); 6.945.767.424 en NVFP4 |
| Parametros activos | No aplica (modelo denso, sin tablas MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 W4A4: pesos y entradas en E2M1 FP4, escalas E4M3FN por cada 16 valores, escalas globales FP32; convertido con AXQuant RTN, sin AWQ |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 (heredada del modelo base, retenida en `LICENSE`) |
| Formato de pesos | Safetensors con `compressed-tensors`; libreria declarada `vllm`; bytes exportados: 7.549.895.744 |

Datos adicionales de conversion: 252 tensores de lenguaje seleccionados, 498 tensores protegidos, revision fuente inmutable `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`, commit de desarrollo AXQuant `1605cc05538fba8f12a5c8af051e3999ea06e947`. Calibracion sobre entradas BF16 originales con 1,25 de margen de rango de activacion; Q/K/V fusionados y gate/up comparten escalas globales; las escalas de bloque de entrada se calculan dinamicamente en inferencia.

## Arquitectura y entrenamiento

No hay entrenamiento nuevo en este artefacto: es una conversion de pesos del checkpoint oficial Qwen3-VL-8B-Instruct. La arquitectura subyacente es un modelo denso (la propia model card indica que "no hay tablas MoE en estos modelos densos") compuesto por una torre de vision, mergers DeepStack y un modelo de lenguaje. La cuantizacion afecta unicamente a las proyecciones lineales del lenguaje; la torre de vision completa, los mergers DeepStack, los embeddings, las normas y la cabeza LM conservan los valores BF16 originales, con verificacion independiente de igualdad.

El innovador aqui es el pipeline AXQuant y su encoder de pesos `numpy-reference`. La conversion usa RTN sobre los tensores seleccionados, con calibracion que observa las entradas BF16 reales de cada matriz y fija checksums de origen, formas de columna, numero de muestras y la imagen de test. En ejecucion, cada worker reporta 144 modulos nativos `CutlassNvFp4LinearKernel`; se rechaza explicitamente Marlin y cualquier emulacion. El modelo no incorpora cabeza MTP (multi-token prediction) entrenada, y la cuantizacion no anade una. Se habilita chunked prefill en las pruebas.

## Capacidades

- Generacion de texto e inferencia multimodal imagen-texto (`pipeline_tag: image-text-to-text`), con plantilla de chat conversacional retenida del tokenizer original.
- Reconocimiento de texto en imagenes (OCR): en la prueba de humo, tanto RTX 5090 como Jetson Thor reconocen las tres lineas de la pagina de test, con un chequeo que rechaza lineas repetidas no vacias.
- Procesamiento de imagen mediante torre de vision en BF16 y fusion de caracteristicas con los mergers DeepStack.
- Ejecucion nativa FP4 verificada en runtime (144 kernels Cutlass por worker), sin emulacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card no certifica razonamiento visual general, precision en video, OCR multilingue ni comportamiento en contexto largo.
- Capacidades multilingues: no disponibles; la unica evidencia de ejecucion es una pagina generada en ingles.
- Modo thinking, vision de video, audio: no disponibles/no certificados en la informacion proporcionada.

## Casos de uso

- Despliegue de inferencia multimodal con footprint reducido: al ocupar 7,5 GB de pesos en NVFP4 en lugar de los aproximadamente 17,5 GB de un checkpoint BF16 equivalente, permite servir un modelo vision-lenguaje en GPUs con menos memoria de la habitual. Adecuado cuando el objetivo es reducir VRAM a costa de asumir un formato poco convencional.
- OCR de documentos en pipeline interno: la prueba de humo demuestra lectura de lineas de texto en una imagen de pagina; sirve como base para extraccion de texto en facturas, formularios o capturas, siempre que se valide con datos propios.
- Investigacion sobre cuantizacion FP4: util como caso de estudio reproducible de un esquema W4A4 con escalas por bloque de 16 y escalas globales FP32, con hashes de calibracion y procedencia publicados en `provenance.json`.
- Validacion de kernels Cutlass NVFP4: sirve para comprobar que una build concreta de vLLM (0.25.1) carga 144 modulos `CutlassNvFp4LinearKernel` y rechaza rutas de emulacion o Marlin.
- Pruebas en placa embebida: receta probada en Jetson Thor con `--memory-fraction 0.065`, util para escenarios de robotica o edge con acelerador NVIDIA.
- Evaluacion comparativa de calidad frente a BF16: al conservar en BF16 los componentes no lineales, permite medir de forma aislada el impacto de cuantizar solo las proyecciones del lenguaje.
- Generacion de texto asistida por imagen en prototipos conversacionales: con la plantilla de chat intacta, se puede montar un demo multi-turno imagen-texto, aceptando que no hay certificacion de calidad ni garantia multilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card rechaza explicitamente cualquier afirmacion de calidad, exactitud MTP o velocidad: la prueba realizada es "una pagina generada en ingles, usada tambien para calibracion, no una certificacion de calidad con datos reservados". Tambien advierte que los mensajes de arranque en modo eager, JIT y autotuning pueden afectar a la latencia, por lo que no se ofrecen cifras de throughput ni de latencia.

## Requisitos de hardware

- Pesos en disco y en memoria: 7,5 GB de repositorio; 7.549.895.744 bytes de pesos exportados.
- VRAM estimada: no disponible como cifra oficial. Como referencia, la receta probada usa `--memory-fraction 0.30` en RTX 5090 (32 GB) y `--memory-fraction 0.065` en Jetson Thor, valores que dependen del runtime y no equivalen directamente a VRAM neta.
- GPUs validadas: NVIDIA RTX 5090 y NVIDIA Jetson Thor, ambas con 144 modulos nativos `CutlassNvFp4LinearKernel`.
- GPUs compatibles no listadas (A100, H100, RTX 4090, etc.): no disponibles; el soporte depende de que la build de vLLM exponga kernels Cutlass NVFP4 en esa arquitectura. Marlin y emulacion se rechazan.
- Encaje en GPU de consumo: probable en RTX 5090 segun la receta probada; en generaciones anteriores no hay evidencia en la informacion proporcionada.
- Opciones de despliegue: vLLM 0.25.1 con PyTorch 2.11.0+cu130 y CUDA 13.0. No se documentan rutas para llama.cpp, Ollama ni TGI.
- Software adicional del ejemplo: Pillow; el script no ejecuta codigo remoto del modelo.
- Latencia y throughput: no disponibles (se advierte de posible impacto por modo eager, JIT y autotuning).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3-VL-8B-Instruct-CUDA-AXQ-NVFP4-W4A4 | 8.767.123.696 (6.945.767.424 en NVFP4) | NVFP4 W4A4, AXQuant RTN | No disponible | Apache-2.0 | HuggingFace, 22 descargas, preview de desarrollo |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8.767.123.696 | BF16 | No disponible en la informacion proporcionada | Apache-2.0 | Checkpoint oficial de Qwen |
| Otras cuantizaciones de Qwen3-VL-8B (AWQ, GPTQ, GGUF, MLX) | No disponible | No disponible | No disponible | No disponible | El artefacto indica estar fuera del ambito MLX/oMLX/MTPLX; no se aportan datos de alternativas |

La comparacion relevante es contra el propio modelo base: misma licencia y mismos parametros de origen, con reduccion de huella (7,5 GB frente a los aproximadamente 17,5 GB de BF16) a cambio de un runtime mucho mas restrictivo (vLLM 0.25.1, CUDA 13.0, kernels Cutlass NVFP4). No se dispone de datos de rendimiento que permitan afirmar equivalencia de calidad con BF16.

## Limitaciones y advertencias

- Estado de desarrollo: preview no publicada, sin certificacion de calidad (`quality_certified=false`) ni verificacion de runtime en el manifiesto de conversion (`runtime_verified=false`). No deberia usarse en produccion sin evaluacion propia.
- Evidencia de calidad minima: una unica pagina generada en ingles, que ademas se uso para calibracion, por lo que no es un conjunto reservado.
- No se establece razonamiento visual general, precision en video, OCR multilingue, comportamiento en contexto largo ni velocidad de inferencia.
- Sin cabeza MTP: el modelo no dispone de multi-token prediction entrenada y la cuantizacion no la anade.
- Restricciones de runtime: requiere vLLM 0.25.1, PyTorch 2.11.0+cu130 y CUDA 13.0; las wheels publicadas anteriormente de AXQuant no contienen esta ruta. Se rechazan Marlin y emulacion.
- Dependencia de la licencia del modelo base: Apache-2.0, que se mantiene; el uso comercial queda sujeto a esa licencia de Qwen.
- Sesgos conocidos: no disponibles en la informacion proporcionada; no hay evaluacion de sesgos publicada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Limitaciones de idioma: no se declara lista de idiomas y la unica prueba es en ingles.
- Advertencia de rendimiento: la propia model card indica que los mensajes de arranque en eager, JIT y autotuning pueden afectar a la latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-VL-8B-Instruct-CUDA-AXQ-NVFP4-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Revision fuente inmutable: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/tree/0c351dd01ed87e9c1b53cbc748cba10e6187ff3b
- Auditoria de runtime del repositorio: `runtime_audit.json`
- Procedencia y hashes: `provenance.json`
- Plan y manifiesto CUDA: `axquant_cuda_plan.json`, `axquant_cuda_manifest.json`
- Calibracion de activaciones: `activation_calibration.json`
- Evidencia de humo de runtime: `development_runtime_smoke.json`
- Sumas de verificacion: `SHA256SUMS.txt`
- Ejemplo de ejecucion: `examples/image_text_smoke.py`
- Imagen de prueba: `calibration/nvfp4-ocr-smoke-page.png`
