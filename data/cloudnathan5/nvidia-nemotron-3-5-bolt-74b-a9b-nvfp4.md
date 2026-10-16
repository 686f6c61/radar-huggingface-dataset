# cloudnathan5/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-NVFP4

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-NVFP4 es una cuantizacion del modelo nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16, publicada por el usuario cloudnathan5 en HuggingFace bajo licencia OpenMDW-1.1. No se trata de una publicacion oficial de NVIDIA, sino de un checkpoint cuantizado de la comunidad generado con NVIDIA TensorRT Model Optimizer 0.47.0 en formato ModelOpt MIXED_PRECISION. El modelo base pertenece a la familia Nemotron 3.5, con arquitectura hibrida Mamba-2, atencion y mezcla de expertos (MoE), y variante "omni" que incorpora un codificador visual C-RADIO v4-H, lo que lo habilita para tareas image-text-to-text.

El nombre del modelo indica 74B parametros totales y 9B activos, pero el dato real de safetensors del repositorio es de 40.932.190.232 parametros (aproximadamente 40,9B). Esta discrepancia no se explica en la informacion disponible y conviene verificarla antes de planificar el despliegue. El repositorio ocupa 47,8 GB.

Su relevancia actual radica en que permite ejecutar un modelo multimodal de contexto muy largo (hasta 262.144 tokens en la configuracion de ejemplo de vLLM) con pesos NVFP4 de 4 bits y cache KV en FP8, reduciendo requisitos de memoria frente al checkpoint BF16 original. Esta pensado para despliegue con vLLM y soporta tool calling y razonamiento explicito mediante un parser dedicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 + atencion + MoE, con codificador visual (familia nemotron_h_omni) |
| Parametros totales | 40.932.190.232 (dato real de safetensors); el nombre indica 74B |
| Parametros activos | 9B segun el nombre del modelo (A9B); no confirmado por safetensors |
| Longitud de contexto | Hasta 262.144 tokens (configuracion de ejemplo en vLLM con `--max-model-len 262144`) |
| Tipos de cuantizacion | NVFP4 (E2M1, group size 16, escalas de bloque FP8 E4M3 + escala global FP32) en expertos; FP8 E4M3 per-tensor en Mamba-2 `in_proj`/`out_proj`; cache KV en FP8 E4M3; BF16 en atencion, router, embeddings, `lm_head` y vision encoder |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (OpenMDW-1.1) |
| Formato de pesos | safetensors (checkpoint ModelOpt MIXED_PRECISION); no se indica GGUF |

## Arquitectura y entrenamiento

El modelo base combina tres mecanismos en una unica pila: capas de espacio de estados Mamba-2 (con `in_proj`, `out_proj`, `conv1d` y parametros SSM), capas de atencion clasica (proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`) y capas MoE con expertos enrutados y expertos compartidos, mas proyecciones latentes (`fc1_latent_proj`, `fc2_latent_proj`) y un router (`gate`). La variante "omni" anade un codificador visual C-RADIO v4-H y un proyector `mlp1` que conecta la vision con el pipeline de texto, habilitando la tarea image-text-to-text.

Sobre el proceso de cuantizacion si hay informacion detallada: se aplico NVFP4 (formato E2M1 con grupo de 16 y escalas de bloque FP8 E4M3 mas escala global FP32) a los expertos enrutados y compartidos, manteniendo activaciones en BF16 (esquema W4A16). Las proyecciones Mamba-2 `in_proj` y `out_proj` se cuantizaron a FP8 E4M3 per-tensor con activaciones FP8 E4M3 estaticas calibradas. El resto de componentes (atencion, router MoE, embeddings, `lm_head`, `conv1d`, normas, vision encoder y proyector) permanecen en BF16. La calibracion se realizo con NVIDIA TensorRT Model Optimizer 0.47.0, con estrategia "max calibration" sobre 256 muestras image-text y longitud de secuencia 1024.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la aplicacion de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento: incluye un parser de razonamiento especifico (`ultra_v3`) que separa el bloque de pensamiento de la respuesta final, pensado para modos de razonamiento explicito.
- Procesamiento multimodal image-text-to-text: integra un codificador visual C-RADIO v4-H y permite entrada de imagen y video (el ejemplo de vLLM limita a 1 video y 1 imagen por prompt).
- Tool calling y function calling: soportado de forma nativa mediante `--enable-auto-tool-choice` con el parser `qwen3_coder`.
- Capacidades de agente: la combinacion de tool calling, contexto de hasta 262.144 tokens y parser de razonamiento permite flujos multi-paso con varias llamadas a herramientas.
- Contexto largo: configurado hasta 262.144 tokens en el ejemplo oficial, con prefill troceado (`--enable-chunked-prefill`).
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de documentos extensos con elementos visuales: al aceptar imagen y texto con hasta 262.144 tokens de contexto, permite procesar informes escaneados, graficos y anexos en una sola pasada sin trocear el documento.
- Extraccion estructurada de informacion multimodal: combinando entrada de imagen y tool calling, se puede invocar una funcion externa que valide o normalice los campos extraidos de facturas, formularios o tablas.
- Agentes de automatizacion con herramientas: el soporte de `--enable-auto-tool-choice` y razonamiento multi-paso permite encadenar busquedas, llamadas a API y verificaciones dentro de un mismo turno.
- Asistencia tecnica y atencion al cliente sobre documentacion larga: el contexto de 262.144 tokens permite cargar manuales completos y mantener una conversacion multi-turno con referencias al material.
- Razonamiento con traza explicita: el parser `ultra_v3` separa el razonamiento de la respuesta final, util para auditoria de decisiones, evaluacion de cadenas de razonamiento o depuracion de agentes.
- Procesamiento de capturas y video en pipelines de monitorizacion: con entrada limitada a 1 video y 1 imagen por prompt, encaja en tareas de descripcion, resumen o deteccion de eventos sobre un fotograma o clip concreto.
- Despliegue economico en memoria frente al checkpoint BF16: la cuantizacion NVFP4 reduce el peso del repositorio a 47,8 GB, lo que abarata servir el modelo en GPU unica con `--tensor-parallel-size 1`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 47,8 GB, correspondientes al tamano del repositorio en NVFP4 y FP8. A ello hay que sumar el espacio de cache KV en FP8 E4M3, cuyo tamano real no se especifica en la informacion disponible.
- GPU recomendadas: NVIDIA Blackwell, ya que NVFP4 es un formato nativo de esa generacion. El comando de ejemplo usa `--tensor-parallel-size 1`, por lo que esta previsto para una sola GPU.
- GPU de 80 GB o mas: necesarias para alojar los pesos mas cache KV a contextos largos. Una RTX 5090 o similar con 32 GB no es suficiente para los pesos completos.
- Cabe en consumer GPU: no, segun el tamano de pesos indicado.
- Opciones de despliegue: vLLM (documentado en la model card), con imagen `vllm/vllm-openai:nightly`, backend `FLASHINFER` para atencion y `flashinfer` para Mamba, `--mamba-cache-mode align` y `--kv-cache-dtype fp8`. No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (cloudnathan5/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-NVFP4) | 40,9B reales (nombre: 74B-A9B) | Hasta 262.144 tokens | NVFP4 + FP8 + BF16 mixto | OpenMDW-1.1 | Repositorio comunitario, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 (modelo base) | no disponible en la informacion | no disponible | BF16 | no disponible | Repositorio oficial de NVIDIA |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio lo publica el usuario cloudnathan5, no NVIDIA. Es una cuantizacion de terceros, sin validacion oficial documentada, y registra 0 descargas y 0 likes, por lo que carece de verificacion por parte de la comunidad.
- Discrepancia no resuelta entre el nombre del modelo (74B totales, 9B activos) y los parametros reales de safetensors (40,9B). Hay que verificar la configuracion real antes de dimensionar el hardware.
- No se documentan idiomas soportados. El rendimiento multilingue, y en particular en castellano, no esta garantizado ni medido.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, tasas de alucinacion ni benchmarks, por lo que no hay evidencia cuantitativa sobre su fiabilidad en produccion.
- Sesgos: no se documenta ninguna evaluacion de sesgos, equidad o seguridad en la informacion disponible.
- Licencia OpenMDW-1.1: es una licencia distinta de las habituales en modelos abiertos. Debe revisarse el texto completo en el enlace oficial antes de cualquier uso comercial o redistribucion, ya que las condiciones no se detallan en la informacion proporcionada.
- La cuantizacion puede degradar la calidad respecto al checkpoint BF16 original. No se incluyen metricas de degradacion por la cuantizacion NVFP4 aplicada.
- Dependencia de versiones concretas: el ejemplo usa una imagen nightly de vLLM, `VLLM_USE_V2_MODEL_RUNNER=1`, `--trust-remote-code` y un parser externo descargado aparte, lo que implica riesgo de incompatibilidad y de ejecucion de codigo remoto.
- Requiere GPU Blackwell para aprovechar NVFP4 de forma nativa; en generaciones anteriores el rendimiento puede no ser el optimo o el formato puede no estar soportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cloudnathan5/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Parser de razonamiento del repositorio: https://huggingface.co/cloudnathan5/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-NVFP4/resolve/main/ultra_v3_reasoning_parser.py
