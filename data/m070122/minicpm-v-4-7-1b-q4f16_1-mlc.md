# m070122/MiniCPM-V-4.7-1B-q4f16_1-MLC

## Resumen

MiniCPM-V-4.7-1B-q4f16_1-MLC es un paquete de despliegue multimodal compilado para ejecutarse íntegramente en el navegador mediante WebGPU y WebAssembly, usando el runtime `@mlc-ai/web-llm`. Se deriva del modelo base `openbmb/MiniCPM-V-4.7-1B` de OpenBMB, un modelo de visión-lenguaje compacto de aproximadamente 1B de parámetros, y lo empaqueta como artefacto autocontenido con formato `mlc.model-package` v1. El autor del paquete es el usuario de Hugging Face `m070122`.

El modelo combina un codificador visual SigLIP2-NaViT de 27 capas con un decodificador de lenguaje híbrido basado en Qwen3.5 que alterna capas de atención lineal GatedDeltaNet (18 capas) y atención completa con GQA (6 capas). Esta arquitectura híbrida reduce el coste de estado en contexto largo y permite mantener una huella de memoria contenida, algo crítico para ejecución en el cliente.

Su relevancia radica en que demuestra inferencia multimodal (imagen-texto) 100% local en el navegador, sin dependencia de servidor, con un peso de 1,54 GB y un requisito de VRAM estimado de 1850 MB. Esto habilita aplicaciones de privacidad por diseño, demos sin backend y prototipos de asistentes visuales que funcionan con la GPU del propio dispositivo del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: decodificador Qwen3.5 con 18 capas GatedDeltaNet (atención lineal recurrente) + 6 capas de atención completa GQA; codificador visual SigLIP2-NaViT de 27 capas; proyector 2D Rotary ViT-Merger |
| Parametros totales | No disponible de forma explícita (modelo base de aproximadamente 1B; 744 parámetros runtime MLC tras eliminar cabezas especulativas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (`context_window_size=4096`, `prefill_chunk_size=512`) |
| Tipos de cuantizacion | LLM en `q4f16_1` (4 bits simétrico por grupos, `group_size=32`, escalas y activaciones en float16); codificador visual y ViT-Merger sin cuantizar en float16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefacto MLC (`mlc.model-package` v1): 43 shards `params_shard_*.bin` + manifiesto `mlc-model-manifest.json` + librería WASM WebGPU precompilada |

## Arquitectura y entrenamiento

El backbone de lenguaje es un decodificador híbrido de 24 capas con `hidden_size=1024`, `intermediate_size=3584` y `vocab_size=248094`. Dieciocho capas usan atención lineal `GatedDeltaNet` con estado recurrente y kernel `conv1d` de tamaño 4, mientras que seis capas emplean atención completa con GQA (8 cabezas de consulta, 2 de clave/valor, `head_dim=256`, RoPE parcial de factor 0,25 y `attn_output_gate=true`). La gestión de estado es híbrida: `PagedKVCache` para las capas de atención completa y `RNNState` para las capas GatedDeltaNet.

El codificador visual es un SigLIP2-NaViT de 27 capas (`hidden_size=1152`, `intermediate_size=4304`, 16 cabezas, `patch_size=14`) con un tap temprano de características en la capa 6. El proyector cross-modal es un ViT-Merger con atención espacial 2D Rotary sobre ventanas 2x2 y MLP SwiGLU, que aplica compresión espacial 16x y produce 64 embeddings visuales por imagen de 448x448. El paquete elimina las cabezas especulativas `mtp.*` (de 780 tensores HF a 744 parámetros runtime). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto e inferencia de instrucciones en inglés y chino mediante la plantilla `qwen3_5_nothink` (formato instruct con `enable_thinking=False`).
- Comprensión de imagen y texto (`image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Procesamiento de imágenes de 448x448 con decodificación `rgb_u8` en `OffscreenCanvas` dentro de Web Worker.
- Preservación de detalle fino en OCR, texto de interfaz de usuario y estructura espacial, gracias a mantener el codificador visual y el proyector sin cuantizar en float16.
- Ejecución 100% en cliente sobre WebGPU con `shader-f16`, sin dependencia de servidor.
- Soporte de decodificación por chunks de prefill (512 tokens) y batch máximo de 1.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni visión de vídeo en la información disponible.

## Casos de uso

- Asistentes visuales en el navegador con privacidad por diseño: el modelo procesa imágenes localmente en la GPU del usuario sin enviar datos a un servidor, adecuado para aplicaciones sanitarias, financieras o de documentos sensibles donde la imagen no debe salir del dispositivo.
- OCR y extracción de texto de capturas o documentos: el codificador visual en float16 sin cuantizar preserva el detalle de texto pequeño y elementos de interfaz, útil para digitalizar formularios o leer pantallas.
- Demos y prototipos sin backend: un equipo puede publicar una demo interactiva de visión-lenguaje en una página estática, eliminando costes de infraestructura y latencia de red.
- Aplicaciones de escritorio empaquetadas (Electron, Tauri WebView): integración del modelo en apps nativas multiplataforma que aprovechan WebGPU para inferencia local con requisitos de VRAM moderados (1850 MB).
- Accesibilidad en el navegador: descripción automática de imágenes y lectura de contenido visual para usuarios con discapacidad visual, ejecutándose en el propio dispositivo sin depender de servicios externos.
- Análisis de capturas de pantalla en herramientas de soporte o QA: el modelo puede interpretar el estado de una interfaz a partir de una imagen y responder preguntas sobre ella, con contexto de 4096 tokens suficiente para diálogos multi-turno breves.
- Filtrado y moderación de imágenes en el cliente: clasificación y descripción de contenido visual antes de subirlo, reduciendo la exposición de datos y la carga del servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 1850 MB (`vram_required_MB: 1850`); huella de pesos de 1,54 GB (1.654.313.312 bytes estimados de memoria de dispositivo).
- Buffer máximo de binding único: 158.662.656 bytes (151,3 MB), dentro del presupuesto de 256 MB de `maxStorageBufferBindingSize` de WebGPU.
- Workspaces temporales: decodificación 3,06 MB, prefill 33,08 MB, embedding de imagen 152,71 MB.
- GPU recomendadas: cualquier GPU con soporte WebGPU y `shader-f16`; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, siempre que el navegador exponga WebGPU con soporte de float16; el requisito de 1850 MB es asumible por GPUs integradas y dedicadas modernas.
- Opciones de despliegue: `@mlc-ai/web-llm >= 0.2.88` en navegador, Electron o Tauri WebView; se recomienda ejecutar en Web Worker con `WebWorkerMLCEngineHandler` para no bloquear el hilo de UI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-q4f16_1-MLC | ~1B | 4096 | Navegador (WebGPU/WASM) | Apache-2.0 | Paquete MLC cuantizado q4f16_1; visión en float16 |
| openbmb/MiniCPM-V-4.7-1B | ~1B | No disponible | Servidor/local (PyTorch) | Apache-2.0 | Modelo base sin cuantizar del que deriva este paquete |
| Alternativas de VLM de ~1B para edge | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificables en la información proporcionada |

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Ventana de contexto de 4096 tokens, reducida para tareas de documento largo o conversaciones extensas.
- `max_batch_size=1`: no apto para servir múltiples peticiones concurrentes en un mismo motor; orientado a uso interactivo individual.
- Requiere WebGPU con `shader-f16`; navegadores o dispositivos sin soporte WebGPU no pueden ejecutar el modelo.
- Dependencia estricta de `@mlc-ai/web-llm >= 0.2.88`; versiones anteriores no implementan el contrato de artefacto multimodal v1 ni la ejecución híbrida `PagedKVCache` + `RNNState`.
- Riesgo de alucinación inherente a modelos de ~1B; la cuantización 4-bit del LLM puede degradar precisión en razonamiento complejo.
- Posibles sesgos heredados de los datos de entrenamiento del modelo base; no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes del runtime WebLLM.
- El paquete elimina las cabezas especulativas `mtp.*`, por lo que no se beneficia de decodificación especulativa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face (paquete MLC): https://huggingface.co/m070122/MiniCPM-V-4.7-1B-q4f16_1-MLC
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Runtime WebLLM (npm): https://www.npmjs.com/package/@mlc-ai/web-llm
- Repositorio WebLLM (GitHub): https://github.com/mlc-ai/web-llm
- Paper referenciado (arXiv 2605.08985): https://arxiv.org/abs/2605.08985
- Paper referenciado (arXiv 2408.01800): https://arxiv.org/abs/2408.01800
- Paper referenciado (arXiv 2509.18154): https://arxiv.org/abs/2509.18154
- Paper referenciado (arXiv 2604.27393): https://arxiv.org/abs/2604.27393
- Paper referenciado (arXiv 2412.15803): https://arxiv.org/abs/2412.15803
- Paper referenciado (arXiv 2502.14786): https://arxiv.org/abs/2502.14786
