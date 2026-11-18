# inclusionAI/invoker-render-1.0

## Resumen

Invoker-Render 1.0 es un modelo de generación de vídeo condicionado por proxies visuales, publicado por inclusionAI (Ant Group) como componente de renderizado de su sistema Code World Model 2.0. El modelo recibe como entrada una imagen RGB de referencia de 1344×768, una secuencia de frames proxy a 24 FPS (mapas semánticos, cajas 3D dispersas, máscaras de sujeto, geometría sombreada o cajas con esqueleto) y un prompt de texto, y genera el vídeo final con la apariencia especificada. La arquitectura es un DiT causal con atención 3D (`MiniMaxH3Transformer3DModel`), con 33.122.992.896 parámetros almacenados en FP32.

Su relevancia radica en el enfoque de "world model": un motor externo mantiene el estado del mundo (trayectoria de cámara, layout de escena, movimiento de objetos) y lo comunica al modelo mediante proxies, de modo que la generación de apariencia queda desacoplada del control estructural. Esto permite generación en streaming continua con un ancla de apariencia fija y una ventana de historia acotada, lo que habilita sesiones interactivas de larga duración (por ejemplo, recorridos 360° continuos) sin deriva visual acumulada.

El repositorio contiene únicamente los pesos del DiT causal principal (29 shards safetensors, 638 tensores, ~132,5 GB) más un LoRA de un teacher bidireccional separado. No incluye VAE, codificador de texto Qwen, decodificador causal ni bundle de inferencia listo para usar; el código de inferencia vive en el repositorio GitHub CodeWorldModel y requiere preparar esos activos por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT causal con atención 3D (`MiniMaxH3Transformer3DModel`), streaming autoregresivo |
| Parametros totales | 33.122.992.896 (33,12 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de historia acotada; frames proxy de `17*N+5`, mínimo 39) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32, sin cuantizar) |
| Idiomas soportados | zh (chino) |
| Licencia | Apache-2.0 y CC BY-NC 4.0 (uso no comercial en la parte CC) |
| Formato de pesos | safetensors (29 shards, 638 tensores, ~132,5 GB); LoRA separado en safetensors |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer causal orientado a vídeo, identificado en `config.json` como `MiniMaxH3Transformer3DModel`, con atención 3D sobre secuencias de frames. La generación es streaming y autoregresiva: cada bloque de frames se condiciona a un ancla de apariencia fija (la imagen RGB inicial) y a una ventana de historia acotada, lo que permite alimentar proxies de forma continua sin que el coste crezca con la duración del vídeo. El pipeline declarado es video-to-video y la inferencia de referencia ejecuta cuatro pasos de difusión causales.

La entrada se compone de tres señales: una imagen de referencia de 1344×768, un vídeo proxy a 24 FPS (la tasa de 24 FPS es la del eje temporal del vídeo, no el throughput de inferencia) y un prompt de texto. El modelo admite múltiples granularidades de proxy: mapas semánticos, cajas 3D dispersas, máscaras de sujeto, geometría con sombreado y combinaciones de caja más esqueleto. El repositorio incluye además un LoRA de un teacher bidireccional (`bidirectional_lora/teacher-live.safetensors`, ~2,3 GB) sobre base MiniMax-H3, que es un modelo distinto y no debe superponerse a los pesos causales principales. No se han publicado en la información disponible detalles sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo condicionada por proxy estructural, con control explícito de cámara, layout de escena y movimiento de objetos.
- Control multi-granularidad: mapas semánticos, cajas 3D dispersas, máscaras de sujeto, geometría sombreada y cajas con esqueleto.
- Generación en streaming de larga duración mediante ancla de apariencia fija y ventana de historia acotada.
- Recorridos 360° continuos y sesiones interactivas sin reinicio del estado visual.
- Condicionamiento por texto (prompt) combinado con la imagen de referencia y los proxies.
- Renderizado de proxies de juego reales y de escenas sintéticas.
- Servicio interactivo vía WebSocket, cliente de ficheros y cliente de navegador (en el repositorio de inferencia).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo de renderizado, no un LLM).
- Capacidades multilingües: limitadas a zh según la model card.
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Previsualización interactiva de entornos 3D: un motor de juego o simulador exporta cajas 3D y máscaras por frame y el modelo sintetiza la apariencia fotorrealista en streaming, permitiendo iterar sobre el layout sin reentrenar.
- Recorridos arquitectónicos 360°: partiendo de una sola imagen de referencia y una trayectoria de cámara codificada como proxy, se generan tours continuos de interiores o exteriores con apariencia coherente gracias al ancla fija y a la ventana de historia acotada.
- Prototipado de cinemáticas para videojuegos: se alimenta el esqueleto de personajes y las cajas de props como proxy y se obtiene vídeo renderizado para pitches o storyboards, reduciendo el coste frente a un pipeline de render offline.
- Simulación para robótica y conducción: el simulador mantiene el estado físico y emite proxies; el modelo genera observaciones visuales realistas para entrenar políticas o validar percepción en condiciones controladas.
- Edición de vídeo guiada por estructura: sustituir la apariencia de un clip conservando el movimiento original (video-to-video) usando el clip como proxy de máscara o de flujo.
- Demos interactivas en navegador: el cliente web del repositorio de inferencia permite sesiones en vivo donde el usuario mueve la cámara y el modelo responde en streaming, útil para showcases de producto.
- Generación de datos sintéticos etiquetados: al conocer el proxy de entrada, las anotaciones (cajas, máscaras, esqueletos) son exactas por construcción, lo que sirve para aumentar datasets de detección o segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en FP32: ~132,5 GB en disco; la carga en VRAM requiere al menos ese orden de magnitud si no se cuantiza, más los activos auxiliares (VAE, codificador de texto Qwen, decodificador causal) que no se incluyen en el repositorio.
- Configuración de referencia: la configuración `production` del repositorio CodeWorldModel usa una sola máquina con ocho GPUs NVIDIA.
- GPU recomendadas: no se especifican modelos concretos; por volumen de pesos, el despliegue multi-GPU de clase数据中心 (A100/H100) es el escenario natural.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) sin cuantización agresiva, y no se documentan pesos cuantizados en el repositorio.
- Opciones de despliegue: el repositorio oficial usa SGLang y SGLang-Omni sobre MiniMax-H3, con servicio WebSocket y cliente de ficheros/navegador; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. Los 24 FPS son la tasa del eje temporal del vídeo, no la velocidad de inferencia; la generación de referencia usa cuatro pasos causales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Invoker-Render 1.0 (inclusionAI) | 33,12 B | ventana de historia acotada, streaming continuo | DiT causal condicionado por proxy, world model | Apache-2.0 + CC BY-NC 4.0 | Hugging Face, pesos + repo GitHub |
| MiniMax-H3 (base arquitectónica) | no disponible | no disponible | transformer 3D de difusión | no disponible | no disponible en la información proporcionada |
| Otros modelos video-to-video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia mixta: Apache-2.0 y CC BY-NC 4.0; la componente no comercial impide el uso comercial directo sin aclaración adicional del titular.
- Idioma: la model card declara únicamente zh; el comportamiento con prompts en otros idiomas no está documentado.
- Repositorio incompleto para producción: faltan VAE, codificador Qwen, decodificador causal y bundle de inferencia; es necesario preparar activos compatibles desde el repositorio CodeWorldModel.
- Riesgo de confusión de pesos: el LoRA `teacher-live.safetensors` corresponde a un teacher bidireccional distinto y no debe superponerse al DiT causal principal.
- Restricción de formato de entrada: los frames proxy deben cumplir `17*N+5` y un mínimo de 39 frames; no se documenta comportamiento fuera de esa rejilla.
- Sin cuantizaciones publicadas: el despliegue exige FP32 y multi-GPU, lo que limita el uso en hardware de consumo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Riesgo de alucinación visual y deriva de apariencia en secuencias muy largas, mitigado solo parcialmente por el ancla fija y la ventana acotada; no se documentan métricas de estabilidad.
- Sesgos: no se documenta análisis de sesgos del dataset de entrenamiento ni de la distribución de escenas.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; paper arXiv anunciado pero no publicado.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/invoker-render-1.0
- Página del proyecto: https://www.inclusion-ai.org/CodeWorldModel/
- Repositorio GitHub (código de inferencia): https://github.com/inclusionAI/CodeWorldModel
- Documentación de inferencia: https://github.com/inclusionAI/CodeWorldModel/blob/main/docs/INFERENCE.md
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Paper arXiv: anunciado, no disponible en el momento de la consulta.
