# gatilin/llama-v-jepa-lm-qwen3-1.7b-vision-encoder

## Resumen

`gatilin/llama-v-jepa-lm-qwen3-1.7b-vision-encoder` es un componente extraido del modelo multimodal `kkt94/Llama-V-JEPA-LM-Qwen3-1.7B`. No es un modelo generativo completo: contiene unicamente el codificador visual V-JEPA 2.1 (ViT-L) y el "spectral bridge" que proyecta las caracteristicas visuales hacia el espacio del modelo de lenguaje original. El repositorio conserva los nombres de tensor `vision_encoder.*` y `bridge.*` del checkpoint fuente y no incluye el LLM Qwen3-1.7B ni tokenizer alguno.

El componente esta pensado para extraccion de caracteristicas de video: recibe un tensor de video normalizado con ImageNet de forma `[batch, 3, frames, 384, 384]` y devuelve dos salidas, las caracteristicas de parches del encoder y las caracteristicas proyectadas por el bridge. El encoder visual es un checkpoint V-JEPA congelado de origen upstream, mientras que el bridge es especifico del modelo fuente.

Su relevancia es acotada pero practica: permite reutilizar el pipeline visual de un modelo video-LLM sin cargar los 1.700 millones de parametros del LM asociado. El checkpoint tiene 319 tensores, 312.340.480 valores escalares (incluyendo buffers) y 626.782.208 bytes de payload en BF16 (con tres estadisticas de ecualizacion espectral en FP32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-JEPA 2.1 ViT-L (encoder visual congelado) + spectral bridge |
| Parametros totales | 312.340.480 valores escalares (319 tensores, incluye buffers) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa 32 frames por defecto) |
| Tipos de cuantizacion | BF16 (encoder y bridge), FP32 obligatorio en tres estadisticas de ecualizacion espectral |
| Idiomas soportados | no disponible (componente visual, sin tokenizer) |
| Licencia | mixta: V-JEPA MIT, bridge Apache-2.0, con avisos Llama 3.2 asociados a los datos FGQA |
| Formato de pesos | safetensors (`model.safetensors`, SHA-256 `521bd50f8a8ce3d2b25033790e26d3a6bbe1ef6bb5a7fa4415b8fe4167eb0926`) |

## Arquitectura y entrenamiento

El componente combina dos piezas. Por un lado, un encoder V-JEPA 2.1 ViT-L congelado, tomado tal cual de un checkpoint upstream (no reentrenado para este repositorio). Por otro, un bridge espectral que adapta las caracteristicas del encoder al espacio de representacion del modelo fuente `kkt94/Llama-V-JEPA-LM-Qwen3-1.7B`. Las caracteristicas de salida del encoder tienen forma `[1, 1152, 1, 1024]` y las del bridge `[1, 128, 2048]` en la prueba de humo documentada.

Los pesos se exportan en BF16, salvo tres estadisticas de ecualizacion espectral que deben permanecer en FP32 para preservar la fidelidad numerica. El autor verifico que los 319 tensores cargan estrictamente, que la atencion explicita en las capas 0, 11 y 23 coincide con SDPA nativa, y que invertir el orden de los frames altera la salida (lo que confirma sensibilidad temporal). No se documenta el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO, ya que el componente no entrena nada nuevo: hereda el encoder upstream y el bridge del modelo fuente.

## Capacidades

- Extraccion de caracteristicas de video: produce caracteristicas de parches (`patch_features`) y caracteristicas proyectadas por el bridge (`bridge_features`).
- Procesamiento temporal: acepta un numero par de frames; la configuracion de inferencia original usa 32 frames.
- Entrada con marcas de tiempo: el segundo argumento (`frame_times`) es `[batch, frames]` en segundos, lo que permite modelar dependencias temporales explicitas.
- Integracion con pipelines del modelo fuente: compatible con el preprocesado de `native_source/processing_jepa_llm.py`.
- No incluye generacion de texto, tokenizer, tool calling, agentes ni capacidades multilingues: es un componente puramente visual.

## Casos de uso

- Extraccion de embeddings de video para busqueda semantica: usar `bridge_features` como representacion compacta de cada clip e indexarlos en un motor vectorial para recuperacion por similitud.
- Preprocesado para un video-LLM: emplear este componente como etapa visual independiente antes de pasar las caracteristicas al LLM Qwen3-1.7B del modelo fuente, evitando cargar el modelo completo durante tareas de vision.
- Clasificacion y deteccion de eventos en video: alimentar un cabezal ligero aguas abajo con las caracteristicas de parches para tareas como reconocimiento de acciones o deteccion de anomalias.
- Analisis de escenas de conduccion o vigilancia: el autor documenta una prueba con una animacion de escena de conduccion, lo que sugiere utilidad en dominios con movimiento continuo y camara en primera persona.
- Investigacion en representaciones auto-supervisadas: comparar las salidas del encoder V-JEPA con las del bridge para estudiar como se alinean los espacios visuales con el espacio del LLM.
- Prototipado en CPU: el componente es lo bastante pequeno (0,6 GB de repo) para ejecutar pruebas de humo en CPU en FP32, util para validar pipelines antes de escalar a GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta pruebas de humo cualitativas (carga estricta de tensores, coincidencia atencion explicita vs. SDPA, sensibilidad al orden de frames) y advierte explicitamente que no establecen comprension real del movimiento ni reproducen el benchmark de 32 frames del modelo fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en BF16 para el payload de tensores; en FP32 se duplica el consumo de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en BF16; el componente cabe holgadamente en RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo, e incluso en CPU para pruebas de humo en FP32.
- Opciones de despliegue: carga manual via `component.py` con `huggingface_hub.snapshot_download`; no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI (al no ser un modelo generativo, estos frameworks no aplican directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este componente (V-JEPA ViT-L + bridge) | 312 M | 32 frames por defecto | Extraccion de caracteristicas de video | Mixta (MIT + Apache-2.0 + avisos Llama 3.2) | Hugging Face |
| `kkt94/Llama-V-JEPA-LM-Qwen3-1.7B` (modelo fuente) | 1,7 B (LM) + encoder | no disponible | Video-LLM completo | Mixta | Hugging Face |
| Encoder V-JEPA 2.1 upstream | no disponible en la informacion | no disponible | Extraccion de caracteristicas de video | MIT | Upstream |
| Otros encoders de video (p. ej. CLIP ViT-L) | no disponible en la informacion | no disponible | Vision-lenguaje | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de tokenizer y de capacidad de generacion de texto; no debe usarse como sustituto del modelo fuente.
- El encoder visual es un checkpoint congelado upstream; el bridge es especifico de este modelo fuente y no es portable a otros LLM sin reentrenamiento.
- Las pruebas de validacion son de humo y cualitativas: cuatro frames muestreados de grabaciones no benchmark, con timestamps sinteticos; no demuestran comprension real del movimiento.
- El autor no descarga ni hashea el shard completo del checkpoint fuente de forma independiente; la verificacion se basa en comparacion byte a byte de rangos HTTP.
- Licencia mixta y compleja: V-JEPA MIT, bridge Apache-2.0 y obligaciones de la licencia, avisos y politica de uso de Llama 3.2 derivadas de los datos de entrenamiento FGQA. El paquete no declara una licencia unica para todos los componentes, lo que exige revision legal antes de uso comercial.
- Riesgo de sesgos y alucinacion: no evaluado en la informacion disponible; al ser un extractor de caracteristicas, el riesgo se traslada a los modelos aguas abajo.
- Sin datos de benchmarks, latencia ni throughput publicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gatilin/llama-v-jepa-lm-qwen3-1.7b-vision-encoder
- Modelo fuente: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-1.7B
- Licencia V-JEPA 2: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-1.7B/blob/main/LICENSE_VJEPA2
- Revision del checkpoint fuente: `46acea21e14fa86b67d2b5787db1d77fea01699a`
