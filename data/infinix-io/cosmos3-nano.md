# Infinix-io/Cosmos3-Nano

## Resumen

Cosmos3-Nano es un modelo fundacional omnimodal desarrollado por NVIDIA, distribuido en Hugging Face a través de la cuenta Infinix-io, y orientado a aplicaciones de Physical AI: robótica, conducción autónoma y entornos industriales o de fábrica. Forma parte de la familia Cosmos3, una colección de modelos de mundo ("world models") capaces de generar vídeo, imagen, audio, acciones y texto a partir de combinaciones de entradas multimodales (texto, imagen, vídeo y trayectorias de acción).

La arquitectura es un Transformer con diseño Mixture-of-Transformers (MoT), compuesto por dos torres complementarias: una autoregresiva para generación de tokens discretos (texto) y una de difusión para generación multimodal continua (imagen, vídeo, audio y acciones). Esta separación permite modelar modalidades heterogéneas en un único marco preservando el mecanismo de generación más adecuado para cada una.

El modelo cuenta con aproximadamente 15.750 millones de parámetros reales según los pesos en safetensors (la model card declara 16B), un repositorio de 35 GB y una licencia OpenMDW 1.1 que permite uso comercial y no comercial. Su relevancia radica en que unifica comprensión y generación multimodal con salidas de acción para control robótico, lo que lo sitúa como infraestructura base para simulación y aprendizaje de políticas encarnadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autoregresiva + torre de difusión |
| Parametros totales | 15.750.057.456 (~16B declarados) |
| Parametros activos | no disponible (no es MoE; es MoT) |
| Longitud de contexto | 4096 tokens (texto); vídeo máx. 5 frames; audio máx. 0,5 s; acción 16–400 frames |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |
| Libreria | cosmos |
| Tamano del repositorio | 35,0 GB |
| Modalidades de entrada | texto, imagen, vídeo (con o sin audio), trayectoria de acción |
| Modalidades de salida | texto, imagen, vídeo, audio, acción |
| Resoluciones de imagen/vídeo | 256p, 480p, 720p (16:9, 4:3, 1:1, 3:4, 9:16) |
| Formatos de salida | JPG (imagen), MP4 (vídeo), AAC estéreo 48 kHz (audio), JSON (acción), string (texto) |
| Desarrollador | NVIDIA |

## Arquitectura y entrenamiento

Cosmos3-Nano se construye sobre la arquitectura Mixture-of-Transformers (MoT), que combina dos torres de transformer con funciones diferenciadas. La torre autoregresiva genera texto mediante decodificación estándar de siguiente token, mientras que la torre de difusión sintetiza las modalidades no textuales (imagen, vídeo, audio y acciones) mediante denoising iterativo. Esta división permite que cada modalidad use el paradigma generativo más apropiado sin renunciar a un marco unificado.

El modelo se desarrolló sobre el Cosmos Framework de NVIDIA. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Las entradas de acción admiten varias encarnaciones con dimensionalidades específicas: movimiento de cámara general (9D), vehículo autónomo (9D), movimiento egocéntrico (57D), brazo Franka Panda simple con pinza RobotiQ (10D), doble Franka Panda (20D), Agibot (29D), UR (10D), Google robot (10D), WidowX 250 (10D) y UMI (9D). Las entradas de imagen y vídeo deben ser RGB de 8 bits por canal en espacio sRGB; no se admite escala de grises.

## Capacidades

- Generación de texto mediante decodificación autoregresiva de siguiente token.
- Generación de imagen en resoluciones 256p, 480p y 720p con múltiples relaciones de aspecto.
- Generación de vídeo en MP4 con hasta 5 frames de entrada y resoluciones de 256p a 720p.
- Generación de audio en formato AAC estéreo a 48 kHz, integrado en el MP4 de salida.
- Generación de trayectorias de acción para control de robots y agentes, en formato JSON.
- Comprensión multimodal de entradas combinadas de texto, imagen, vídeo y acción.
- Simulación de mundo y predicción de futuros estados físicos.
- Razonamiento sobre acciones (action reasoning) para políticas encarnadas.
- Soporte de múltiples encarnaciones robóticas con dimensionalidades de acción específicas.
- No se documenta soporte explícito de tool calling, function calling ni modo de pensamiento (thinking mode).

## Casos de uso

- Simulación de entornos robóticos: el modelo puede generar vídeo y trayectorias de acción coherentes a partir de una imagen inicial y una instrucción textual, lo que permite previsualizar el comportamiento de un brazo Franka Panda antes de desplegarlo en hardware real.
- Entrenamiento de políticas encarnadas: dado que produce acciones en formatos compatibles con encarnaciones como Agibot, UR o WidowX 250, puede usarse para generar datos sintéticos de demostración que alimenten el entrenamiento de políticas de control.
- Conducción autónoma: con entradas de trayectoria de vehículo autónomo (9D) y vídeo de escena, el modelo puede predecir futuros estados de la escena y generar vídeo de simulación para validación de planificadores.
- Generación de datos sintéticos multimodales: la combinación de salidas de imagen, vídeo y audio permite crear datasets etiquetados para entrenar modelos de percepción en dominios donde los datos reales son escasos o costosos.
- Prototipado de interacciones en espacios inteligentes: en entornos industriales o de fábrica, el modelo puede simular la respuesta visual y sonora de un agente ante distintas instrucciones, útil para diseño de interfaces y validación de flujos.
- Investigación en world models: la arquitectura MoT con torres separadas para texto y modalidades continuas sirve como banco de pruebas para estudiar la unificación de generación discreta y continua en un solo marco.
- Generación de audio sincronizado con vídeo: la salida AAC estéreo a 48 kHz integrada en el MP4 facilita la creación de clips con audio para demostraciones de robótica o presentaciones técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~15,75B parámetros, en precisión completa (FP16/BF16) se requieren aproximadamente 31,5 GB solo para pesos, más overhead de activaciones y buffers de difusión; en cuantización de 8 bits rondaría los 16 GB y en 4 bits unos 8-9 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: para FP16/BF16 se necesitan GPUs con 40 GB o más, como A100 40GB/80GB, H100 o L40S. Para cuantizaciones agresivas podrían emplearse RTX 4090 (24 GB) o RTX A6000 (48 GB).
- Cabe en consumer GPU: probablemente solo con cuantización a 4 bits en GPUs de 24 GB como la RTX 4090, aunque no hay confirmación oficial de soporte de cuantización.
- Opciones de despliegue: el modelo declara compatibilidad con vLLM (vllm-omni), SGLang (sglang-diffusion) y diffusers, además de la librería cosmos. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generación de vídeo y audio mediante denoising iterativo implica múltiples pasos, por lo que la latencia será sustancialmente mayor que en generación de texto pura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano | ~15,75B | 4096 tokens (texto); 5 frames vídeo | Texto, imagen, vídeo, audio, acción | OpenMDW 1.1 | Hugging Face (Infinix-io), GitHub NVIDIA |
| Cosmos (generaciones previas de NVIDIA) | no disponible | no disponible | Vídeo, imagen | no disponible | GitHub nvidia/cosmos |
| Modelos world model de robótica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas directas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un modelo entrenado para Physical AI, puede heredar sesgos de los datasets de robótica y conducción empleados.
- Riesgo de alucinación: presente en la generación de texto autoregresiva y potencialmente en la generación de vídeo o acciones no plausibles físicamente.
- Limitaciones de contexto: la ventana de texto es de solo 4096 tokens; el vídeo de entrada admite un máximo de 5 frames y el audio de entrada un máximo de 0,5 segundos, lo que restringe tareas de contexto largo.
- Limitaciones de idioma: no se especifican los idiomas soportados.
- Restricciones de licencia: OpenMDW 1.1 permite uso comercial y no comercial según la model card, pero es una licencia propia de NVIDIA que conviene revisar en detalle antes de producción.
- Requisitos de entrada estrictos: imágenes y vídeos deben ser RGB de 8 bits en sRGB (no se admite escala de grises); el audio debe ser estéreo a 48 kHz; las acciones solo se admiten para encarnaciones específicas listadas.
- El repositorio figura bajo la cuenta Infinix-io con 0 descargas y 0 likes, y la fecha de creación (2026-11-24) es posterior a la fecha de release declarada en la model card (2026-05-31), lo que sugiere una réplica o espejo no oficial; conviene verificar la procedencia antes de uso en producción.
- No se documentan cuantizaciones oficiales ni resultados de benchmarks, lo que dificulta la planificación de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/Cosmos3-Nano
- Colección Cosmos3 en Hugging Face: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código en GitHub: https://github.com/nvidia/cosmos
- White Paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
