# inclusionAI/invoker-render-1.0

## Resumen

Invoker-Render 1.0 es un modelo de generación de vídeo condicionado por proxy desarrollado por inclusionAI, presentado como el componente de renderizado visual de Code World Model 2.0 ("Towards Infinite Controllable Video Generation"). El modelo no mantiene el estado del mundo por sí mismo: un motor externo (upstream engine) conserva el estado, mientras que unos proxies visuales fijan la trayectoria de cámara, la disposición de la escena y el movimiento de los objetos, y Invoker-Render genera la apariencia fotorrealista a partir de esos proxies, una imagen de referencia de apariencia y un prompt de texto.

Arquitectónicamente es un Diffusion Transformer (DiT) causal y en streaming, con 33.122.992.896 parámetros almacenados en FP32 (29 shards safetensors, 638 tensores, unos 132,5 GB). El identificador de arquitectura en `config.json` es `MiniMaxH3Transformer3DModel`, y el código de inferencia companion se construye sobre MiniMax-H3, SGLang y SGLang-Omni. Su rasgo diferencial es la generación en streaming causal en cuatro pasos con un ancla de apariencia fija y una ventana de historia acotada, lo que permite sesiones de horizonte largo (vídeo potencialmente infinito) mientras lleguen frames de proxy.

Es relevante ahora porque aborda el problema de la consistencia a largo plazo en generación de vídeo controlable: en lugar de generar el vídeo completo de una vez (con degradación de identidad y escena en horizontes largos), separa el control estructural (proxies) de la síntesis de apariencia y lo ejecuta de forma incremental. Está orientado a entornos interactivos (servicio WebSocket, cliente de fichero y cliente de navegador) y a casos como mundos simulados, gameplay sintético y renderizado controlado por cámara.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT causal en streaming (Diffusion Transformer 3D); identificador `MiniMaxH3Transformer3DModel` |
| Parametros totales | 33.122.992.896 (33,12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (ventana de historia acotada, sin cifra publicada) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen sin cuantizar en FP32 |
| Idiomas soportados | en (prompt de texto); la metadata de Hugging Face lista zh |
| Licencia | Apache-2.0 y CC BY-NC 4.0 (uso no comercial bajo la componente CC BY-NC) |
| Formato de pesos | safetensors (29 shards, 638 tensores, ~132,5 GB, FP32); LoRA adicional en safetensors |

## Arquitectura y entrenamiento

Invoker-Render es un Diffusion Transformer causal orientado a streaming. La generación se realiza en cuatro pasos causales por chunk de vídeo, de modo que cada bloque de frames se condiciona únicamente en el pasado (ancla de apariencia fija más ventana de historia acotada), lo que habilita sesiones de duración arbitraria siempre que el motor externo siga entregando frames de proxy. La entrada combina un proxy estructural (mapas semánticos, cajas 3D dispersas, máscaras de sujeto, geometría sombreada, o cajas con esqueletos), una imagen RGB de referencia de apariencia de 1344×768 y un prompt de texto; la salida es vídeo a 24 FPS sobre la línea temporal (el frame rate no refleja el throughput de inferencia).

El repositorio contiene además `bidirectional_lora/teacher-live.safetensors` (unos 2,3 GB), los pesos LoRA del profesor bidireccional sobre la base MiniMax-H3; es un modelo distinto de los pesos causales de la raíz y no debe aplicarse sobre ellos. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. El repositorio no incluye VAE, Qwen, el decodificador causal, tensores de silencio ni un bundle de inferencia preparado: esos activos deben prepararse por separado.

## Capacidades

- Generación de vídeo condicionada por proxy estructural (video-to-video), con control de trayectoria de cámara, disposición de escena y movimiento de objetos.
- Control multi-granularidad: acepta mapas semánticos, cajas 3D dispersas, máscaras de sujeto, geometría sombreada y cajas con esqueletos.
- Streaming causal de horizonte largo: ancla de apariencia fija y ventana de historia acotada permiten sesiones que continúan mientras lleguen frames de proxy.
- Generación en cuatro pasos causales por chunk (decodificación rápida en el contexto de un DiT de 33B).
- Condicionamiento por imagen de referencia de apariencia (1344×768 RGB) para mantener identidad y estilo a lo largo de la sesión.
- Despliegue interactivo: servicio de sesión WebSocket, cliente de fichero (`invoker_render.py`) y cliente de navegador en el repositorio companion.
- Soporte de prompts de texto en inglés para guiar la apariencia.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o visión general (el modelo es específicamente de renderizado de vídeo).

## Casos de uso

- Renderizado de mundos simulados: un motor upstream mantiene el estado físico y de escena, y Invoker-Render sintetiza la apariencia fotorrealista frame a frame a partir de los proxies; adecuado porque desacopla simulación y render y permite sesiones de duración ilimitada.
- Gameplay sintético para entrenamiento de agentes: se generan proxies de partidas (cajas, esqueletos, geometría) y el modelo produce vídeo realista para aumentar datasets de percepción; el control multi-granularidad permite ajustar el nivel de detalle estructural.
- Previsualización arquitectónica o de producto con cámara controlada: se define la trayectoria de cámara y el layout mediante proxies y se obtiene vídeo con apariencia consistente gracias al ancla de apariencia fija.
- Producción de vídeo con cámara virtual: órbita 360° de horizonte largo sobre un sujeto, manteniendo identidad mediante la imagen de referencia y la ventana de historia acotada.
- Prototipado interactivo en navegador: el cliente WebSocket y el cliente de navegador del repositorio companion permiten sesiones en vivo donde el usuario mueve la cámara o los objetos y ve el render actualizarse en streaming.
- Investigación en world models: sirve como componente de renderizado evaluable dentro de pipelines de Code World Model 2.0, permitiendo experimentar con distintos tipos de proxy y granularidades.
- Renderizado de vídeo a vídeo con control estructural: partiendo de un vídeo de proxy a 24 FPS (mínimo 39 frames, `17*N+5`), se reestiliza o se sustituye la apariencia manteniendo la estructura original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan unos 132,5 GB; no se documentan versiones cuantizadas, por lo que no es posible dar una cifra de VRAM reducida fiable.
- Configuración de referencia: el perfil `production` por defecto usa ocho GPUs NVIDIA en un solo nodo.
- GPU recomendadas: no se especifican modelos concretos; por volumen de pesos, se requiere un nodo multi-GPU de clase数据中心 (A100/H100 o superior). No cabe en GPUs de consumo (RTX 4090, 24 GB) en FP32.
- Despliegue: código companion CodeWorldModel sobre MiniMax-H3, SGLang y SGLang-Omni; servicio WebSocket, cliente de fichero e interfaz de navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modelo genera en cuatro pasos causales por chunk, pero no se publican cifras de latencia ni de frames por segundo; los 24 FPS son la tasa de la línea temporal del vídeo, no el rendimiento de inferencia.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (generación de vídeo condicionada por proxy o world models de vídeo). La comparativa cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Invoker-Render 1.0 | 33,12B | no disponible | Apache-2.0 + CC BY-NC 4.0 | DiT causal en streaming, control por proxy |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia mixta Apache-2.0 y CC BY-NC 4.0: la componente CC BY-NC 4.0 restringe el uso comercial; es imprescindible revisar los términos antes de desplegar en producción.
- El repositorio no incluye VAE, Qwen, decodificador causal, tensores de silencio ni bundle de inferencia: requiere preparar activos adicionales y el código companion para funcionar.
- Los pesos se distribuyen en FP32 sin cuantizar (~132,5 GB), lo que limita el despliegue a hardware multi-GPU de gama alta.
- El LoRA `teacher-live.safetensors` es un modelo distinto (profesor bidireccional sobre MiniMax-H3) y no debe aplicarse sobre los pesos causales de la raíz.
- El modelo no mantiene el estado del mundo: depende de un motor upstream que genere los proxies; errores o inconsistencias en los proxies se propagan al vídeo.
- Requiere un mínimo de 39 frames de proxy (`17*N+5`) para inferencia por fichero, lo que condiciona el diseño del pipeline.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad; al ser un modelo generativo de vídeo, existe riesgo de artefactos, inconsistencias temporales y contenido no fiel a la referencia.
- Idiomas: el prompt de texto está documentado en inglés; la metadata de Hugging Face lista chino, pero no se detalla cobertura multilingüe.
- No se publican benchmarks ni métricas de calidad objetivas, lo que dificulta la comparación con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/invoker-render-1.0
- arXiv: https://arxiv.org/abs/2611.22925
- Página del proyecto: https://www.inclusion-ai.org/CodeWorldModel/
- GitHub (código companion): https://github.com/inclusionAI/CodeWorldModel
- Licencia (referencia): https://github.com/inclusionAI/CodeWorldModel#acknowledgements-and-license
- Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
