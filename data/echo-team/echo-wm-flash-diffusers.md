# Echo-Team/Echo-WM-Flash-Diffusers

## Resumen

Echo-WM Flash es un modelo de mundo audiovisual causal desarrollado por Echo-Team, un grupo asociado al ecosistema de código abierto de JD (JoyAI). Se distribuye en formato Diffusers mediante el repositorio `Echo-Team/Echo-WM-Flash-Diffusers`, que adapta los pesos del checkpoint original `Echo-Team/Echo-WM` a la API Modular Pipeline de Diffusers. El modelo resuelve el problema de generar simultáneamente vídeo y audio sincronizado a partir de una imagen inicial, un prompt de texto y una secuencia de acciones de cámara, todo en un único proceso autoregresivo.

La arquitectura se basa en un transformer 3D causal con aproximadamente 19.8 mil millones de parámetros (19.794.341.120). Utiliza cuatro pasos de denoising destilados (DMD-distilled guidance) y una caché KV acotada de tipo sink-plus-FIFO, lo que permite una generación eficiente de secuencias de vídeo de hasta 241 frames (configuración por defecto). Es una versión "Flash" de horizonte corto, pensada para prototipado rápido, con la versión de horizonte largo aún no publicada.

La relevancia actual de Echo-WM Flash radica en su carácter de modelo de mundo omnimodal: integra vídeo, audio y control de cámara en un solo sistema, lo que abre aplicaciones en simulación, generación de contenido cinematográfico y entornos interactivos. Su licencia restringe el uso a investigación académica y no comercial, lo que limita su adopción en producción pero lo hace atractivo para el ámbito investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D causal (EchoWMTransformer3DModel) |
| Parametros totales | 19.794.341.120 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 241 frames de video (configuracion por defecto, 1 + 24·n) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | LTX-2 Community License (uso academico y no comercial) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Echo-WM Flash es un modelo de mundo causal que combina un transformer 3D con un mecanismo de atención autoregresiva para procesar secuencias de latentes de vídeo. La versión Flash ha sido destilada mediante DMD (Distribution Matching Distillation) para reducir el número de pasos de denoising de los típicos 20-30 a solo 4, manteniendo una calidad visual y auditiva similar al modelo base. Además, incorpora una caché KV acotada (sink-plus-FIFO) que limita el uso de memoria durante la generación de secuencias largas, permitiendo un flujo continuo sin crecimiento ilimitado del estado interno.

El entrenamiento se realizó a partir del checkpoint `Echo-Team/Echo-WM`, que es el modelo base original. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. La información disponible indica que el modelo se adaptó a la API Modular Pipeline de Diffusers, lo que implica una conversión de arquitectura y un reempaquetado de pesos, pero no un entrenamiento adicional específico para esta versión.

## Capacidades

- Generación conjunta de vídeo y audio sincronizado a partir de una imagen inicial, un prompt de texto y una secuencia de acciones de cámara.
- Control de cámara mediante comandos textuales: movimiento (W/S hacia delante/atrás, A/D lateral), rotación (I/K pitch, J/L yaw) y pausa (none), con duraciones especificadas en frames.
- Generación de audio ambiental, música y habla sincronizada con las escenas visuales.
- Modelo de mundo causal: capacidad de generar secuencias coherentes a lo largo del tiempo, manteniendo consistencia espacial y temporal.
- Funcionamiento en modo Flash con 4 pasos de denoising destilados, lo que reduce la latencia de inferencia frente al modelo base.
- Integración con el ecosistema Diffusers mediante componentes modulares (`EchoWMFlashModularPipeline`, `EchoWMFlashBlocks`).
- Soporte de generación de vídeo de hasta 241 frames (aproximadamente 8 segundos a 30 fps) en la configuración por defecto.

## Casos de uso

- Previsualización de escenas cinematográficas: un director puede introducir una imagen estática de un set, un prompt descriptivo y una trayectoria de cámara para obtener un vídeo con audio sincronizado que sirva como storyboard animado antes de la filmación real.
- Simulación de entornos para videojuegos: los desarrolladores pueden generar secuencias de exploración con control de cámara para probar la atmósfera sonora y visual de niveles sin necesidad de motores gráficos complejos.
- Creación de contenido educativo interactivo: generar vídeos explicativos con narración y efectos de sonido a partir de imágenes y guiones, facilitando la producción de materiales didácticos personalizados.
- Prototipado de experiencias de realidad virtual: usar el control de cámara y la generación audiovisual para simular recorridos virtuales de espacios arquitectónicos o naturales, evaluando sensaciones inmersivas antes del desarrollo completo.
- Generación de fondos animados para producción audiovisual: producir clips de vídeo con audio ambiental (viento, agua, multitudes) para integrarlos en composiciones de vídeo profesional, reduciendo costes de rodaje.
- Investigación en modelos de mundo: servir como banco de pruebas para estudiar la coherencia temporal, la sincronización audiovisual y la navegación continua en entornos generados, dado su diseño causal y su control de cámara explícito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre métricas como FVD (Fréchet Video Distance), CLIP score, o evaluaciones de calidad de audio. Tampoco se proporcionan comparaciones cuantitativas con otros modelos de generación de vídeo o audio.

## Requisitos de hardware

- VRAM estimada: con 19.8 mil millones de parámetros en bfloat16, el peso del modelo ocupa aproximadamente 39.6 GB. Durante la inferencia, las activaciones y las cachés KV incrementan el uso de memoria, por lo que se recomienda una GPU con al menos 48 GB de VRAM para operar sin offload.
- GPU recomendadas: NVIDIA A100 40GB o 80GB, H100, o GPUs con más de 48 GB. Una RTX 4090 (24 GB) no es suficiente para carga completa, aunque podría funcionar con offload de CPU o cuantización (no disponible oficialmente).
- Opciones de despliegue: el modelo está diseñado para Diffusers, por lo que se puede ejecutar con `diffusers` y `transformers` en Python. También es posible usar `accelerate` para offload de CPU o multi-GPU. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no hay datos oficiales. Dado el uso de 4 pasos de denoising y la caché KV acotada, se espera una generación más rápida que el modelo base, pero no se especifican valores concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de generación de vídeo o audio de características similares. Echo-WM Flash se distingue por su carácter omnimodal (vídeo + audio) y su control de cámara explícito, pero no se conocen alternativas directas con las que contrastar parámetros, contexto o rendimiento. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: solo permite uso académico y no comercial, según la LTX-2 Community License. Cualquier uso en entornos de producción o con fines lucrativos está prohibido.
- Idioma limitado: el modelo solo soporta inglés en prompts y generación de audio; no se ha verificado su rendimiento en otros idiomas.
- Horizonte corto: la versión Flash genera secuencias de hasta 241 frames; la versión de horizonte largo no está aún disponible, limitando la generación de vídeos más extensos.
- Sin soporte de negative_prompt: al estar destilado por guía, no se pueden usar prompts negativos para refinar la generación, lo que reduce el control fino sobre el contenido.
- Riesgo de alucinaciones audiovisuales: como todo modelo generativo, puede producir elementos visuales o sonoros inconsistentes con la realidad o con el prompt, especialmente en escenas complejas o poco comunes.
- Sesgos desconocidos: no se han publicado evaluaciones de sesgos, por lo que el modelo podría reflejar sesgos presentes en sus datos de entrenamiento, que no han sido revelados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Echo-Team/Echo-WM-Flash-Diffusers
- Checkpoint original: https://huggingface.co/Echo-Team/Echo-WM
- Página del proyecto: https://echo-team-joy-future-academy-jd.github.io/Echo-1.5-Page/wm/
- Código fuente (GitHub): https://github.com/jd-opensource/JoyAI-Echo/tree/main/echo_wm
- Paper (arXiv): https://arxiv.org/abs/2608.23189
