# seedleap/zing-0.5

## Resumen

Zing-0.5 es un world model causal de 5 000 millones de parámetros desarrollado por el equipo Seedleap.ai (涌跃智能) para interacción en tiempo real. A diferencia de los generadores de vídeo convencionales, este modelo no se limita a producir clips a partir de un prompt inicial, sino que mantiene un estado visual continuo que puede ser alterado durante la generación mediante texto y acciones de teclado (W/A/S/D/I/J/K/L). Esto permite que el usuario "juegue" o navegue dentro de un mundo sintético que se despliega de forma reactiva.

El modelo se basa en Wan-AI/Wan2.2-TI2V-5B-Diffusers, adaptado como world model causal con caché de claves/valores (KV caching) y muestreo DMD de cuatro pasos, lo que permite rollouts de larga duración en una sola GPU. Está publicado bajo licencia Apache 2.0, con el código de inferencia disponible en GitHub y los pesos en Hugging Face. Su relevancia radica en ser una de las primeras implementaciones abiertas de un world model interactivo eficiente, con soporte para inicialización por texto o imagen y cambio de prompts durante la ejecución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model causal basado en Wan2.2-TI2V-5B-Diffusers (transformador de difusión) |
| Parametros totales | 5 000 millones (5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (se menciona "long-horizon" pero sin cifra concreta) |
| Tipos de cuantizacion | No disponible (no se especifican cuantizaciones oficiales) |
| Idiomas soportados | No disponible (el modelo es multimodal, pero no se detallan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags) y state dict PyTorch (generator/model.pt) |

## Arquitectura y entrenamiento

Zing-0.5 parte del modelo base Wan2.2-TI2V-5B-Diffusers y lo adapta como un world model causal. La arquitectura emplea atención local con un tamaño de ventana configurable (`local_attn_size`) y un "sink" de tokens (`sink_size`) para mantener la coherencia temporal sin necesidad de atender a todo el historial. Esto, combinado con caché de claves/valores, reduce el coste computacional y permite generación en tiempo real. El muestreo DMD (Distribution Matching Distillation) de cuatro pasos acelera la inferencia frente a los métodos de difusión tradicionales.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. El modelo se distribuye con un directorio `pretrained` que incluye text encoder, tokenizer y VAE, además del checkpoint del generador. La inferencia se realiza mediante el código standalone del repositorio de GitHub, que acepta archivos JSONL con mensajes de acción y prompts.

## Capacidades

- Generación de vídeo continuo a partir de texto (text-to-video) o de una imagen inicial (image-to-video).
- Interacción en tiempo real mediante teclado: las teclas W/A/S/D controlan movimiento, e I/J/K/L permiten otras acciones definidas por el usuario.
- Cambio de prompts de texto durante el rollout, alterando la semántica, el movimiento y la evolución futura de la escena.
- Rollouts de larga duración gracias a la caché causal y al muestreo DMD de cuatro pasos.
- Salida en formato MP4 H.264 a 24 FPS, con un archivo por cada `sample_id`.
- Soporte para atención completa del historial si se desactiva la ventana local (`--local-attn-size -1 --sink-size 0`).

## Casos de uso

- Prototipado de entornos interactivos para juegos: un desarrollador puede generar un mundo base con un prompt y luego explorarlo con WASD para validar la jugabilidad antes de implementar assets reales.
- Simulación de escenarios para entrenamiento de agentes de aprendizaje por refuerzo: el modelo actúa como entorno sintético reactivo, permitiendo a un agente interactuar con acciones de teclado y observar las consecuencias visuales.
- Creación de contenido dinámico para demos o instalaciones artísticas: se puede iniciar con una imagen y modificar el prompt en vivo para generar transiciones narrativas sin cortes.
- Visualización de conceptos arquitectónicos o urbanos: el usuario puede "caminar" por un espacio generado a partir de una imagen o descripción, ajustando la cámara y el movimiento.
- Investigación en world models y predicción causal: sirve como banco de pruebas para estudiar la coherencia temporal y la respuesta a acciones en modelos generativos.
- Generación de vídeo interactivo para educación o entretenimiento: permite crear experiencias donde el espectador influye en la narrativa mediante entradas de teclado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. En foros se menciona que Zing-0.5 obtuvo el primer puesto en la evaluación pública WBench, pero no se proporcionan cifras concretas ni comparaciones con otros modelos. Por tanto, no es posible presentar una tabla de rendimiento verificable.

## Requisitos de hardware

- GPU con 80 GB o más de memoria (validado en NVIDIA H100 80 GB) para la configuración completa: `local_attn_size=97`, `sink_size=9`.
- GPUs con menos de 80 GB: se recomienda usar `local_attn_size=33`, `sink_size=5`, aunque no se especifica la VRAM mínima exacta.
- El modelo cabe en una sola GPU, pero no se indica si es posible ejecutarlo en GPUs de consumo (por ejemplo, RTX 4090 con 24 GB) con la configuración reducida.
- Opciones de despliegue: únicamente se proporciona el código de inferencia standalone del repositorio de GitHub (script `run.sh`). No se mencionan integraciones con vLLM, Ollama, TGI u otros servidores de inferencia.
- No se ofrecen datos de latencia o throughput, aunque el diseño orientado a tiempo real sugiere que la generación es interactiva.

## Comparativa con modelos similares

No se dispone de información comparativa con otros world models en los materiales proporcionados. No se mencionan alternativas como Genie, GameNGen u otros modelos de vídeo interactivo, ni se ofrecen tablas de comparación. Por tanto, esta sección queda sin datos verificables.

## Limitaciones y advertencias

- Los rollouts largos pueden presentar deriva visual (visual drift) o inconsistencias físicas, como objetos que cambian de forma o movimiento no realista.
- La capacidad de respuesta a las acciones varía según el contenido de la escena y el punto de vista; no todas las acciones producen efectos predecibles.
- No se documentan sesgos específicos, pero al ser un modelo generativo de vídeo entrenado sobre datos no especificados, puede heredar sesgos visuales o culturales de su conjunto de entrenamiento.
- No se detallan restricciones de uso comercial más allá de la licencia Apache 2.0, que permite uso comercial con atribución.
- El modelo requiere el código de inferencia del repositorio de GitHub; no hay una API estándar ni soporte para frameworks de despliegue comunes.
- La configuración de memoria depende de los parámetros `local_attn_size` y `sink_size`; usar valores incorrectos puede provocar fallos de memoria o degradación del rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/seedleap/zing-0.5
- GitHub (código de inferencia): https://github.com/seedleap/zing-world-model
- Página del proyecto: https://zing.loopit.me/
- Informe técnico: próximamente (no disponible en la fecha de consulta)
