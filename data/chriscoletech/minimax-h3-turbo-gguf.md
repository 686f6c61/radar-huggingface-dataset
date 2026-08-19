# ChrisColeTech/minimax-h3-turbo-GGUF

## Resumen

MiniMax H3 Turbo GGUF es una versión cuantizada y optimizada del modelo de generación de vídeo MiniMax H3 (también conocido como Hailuo AI 3.0), desarrollado originalmente por MiniMax. Este repositorio, creado por ChrisColeTech, fusiona el DiT (Diffusion Transformer) FL2VA podado de MiniMax H3 con el LoRA Turbo de LightX2V de 8 pasos, de modo que el modelo resultante genera vídeo de alta calidad en solo 8 pasos de inferencia, frente a los 50 o más que requiere el modelo original. El resultado es una reducción drástica del tiempo de cómputo sin sacrificar calidad visual.

El modelo está disponible en formato GGUF, lo que permite su ejecución en hardware de consumo mediante herramientas como ComfyUI con el cargador GGUF actualizado. Admite modos de generación de texto a vídeo (txt2video), imagen a vídeo (img2video) y variantes FL2VA/T2VA/I2VA. El repositorio incluye además dos variantes de codificador de texto (Qwen3-VL de 4B y 8B) junto con sus respectivos proyectos de clip, lo que permite elegir entre velocidad y fidelidad semántica. Con un total de aproximadamente 20 100 millones de parámetros en el transformador principal, este modelo representa una opción práctica para creadores y desarrolladores que necesitan generar vídeo de alta resolución (hasta 1280×720) con audio sincronizado, sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) FL2VA podado, con LoRA Turbo fusionado |
| Parámetros totales | 20 111 438 894 (transformador principal, safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vídeo, no de texto) |
| Tipos de cuantización | GGUF Q4_K_M (principal), también disponible en otras precisiones según el repositorio |
| Idiomas soportados | No disponible (el modelo acepta prompts en inglés, pero no se especifica lista oficial) |
| Licencia | MiniMax H3 Community License Agreement (con exclusiones territoriales: UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | GGUF (transformador), safetensors (text encoders y VAEs) |

## Arquitectura y entrenamiento

El modelo base es MiniMax H3, un sistema generativo omni-modal que unifica comprensión y generación de texto, imagen, vídeo y audio. En esta versión turbo, el DiT principal (FL2VA) ha sido podado para reducir su tamaño y posteriormente fusionado con el LoRA LightX2V Turbo 8-step v1.0, que permite generar vídeo en solo 8 pasos de inferencia (NFE) en lugar de los 50 típicos. La fusión se realizó offline con fuerza 1.0 sobre las 208 claves del LoRA, y después se aplicó una re-cuantización estocástica a FP8 y una escalera de cuantización GGUF.

El entrenamiento del LoRA Turbo se realizó mediante destilación (distillation) sobre el modelo original, utilizando vídeo de 544p con relación de aspecto mixta y desplazamientos de vídeo/audio de 12 y 3 respectivamente. El modelo resultante recomienda 8 pasos de inferencia (aunque el LoRA original también soporta 4) y un CFG fijo de 1.0. El repositorio incluye dos codificadores de texto opcionales (Qwen3-VL de 4B y 8B) en FP8 escalado, junto con sus correspondientes proyectos de clip (ClipProj) necesarios para alinear las características del texto con el espacio latente del DiT.

## Capacidades

- Generación de vídeo a partir de texto (txt2video) con resolución máxima de 1280×720 y hasta 481 fotogramas (aproximadamente 20 segundos a 24 fps).
- Generación de vídeo a partir de imagen (img2video) con las mismas capacidades de resolución y duración.
- Audio nativo sincronizado: el modelo genera audio estéreo junto con el vídeo, gracias al VAE de audio incluido.
- Modos FL2VA, T2VA e I2VA (variantes de condicionamiento según la entrada).
- Inferencia rápida: solo 8 pasos (NFE) con CFG fijo de 1.0, lo que reduce el tiempo de generación a aproximadamente 2.3-2.5 minutos en una RTX 5090 de 32 GB.
- Dos opciones de codificador de texto (4B y 8B) para equilibrar velocidad y calidad semántica.
- Compatible con ComfyUI mediante el cargador GGUF actualizado (canal remoto).
- El LoRA Turbo ya viene fusionado en los pesos, por lo que no es necesario cargarlo en tiempo de ejecución.

## Casos de uso

- Producción de vídeo para redes sociales: generar clips cortos de 3-5 segundos con prompts descriptivos, ideales para contenido en plataformas como TikTok, Instagram Reels o YouTube Shorts. El modelo produce vídeo con audio sincronizado, lo que ahorra trabajo de postproducción.
- Prototipado rápido de anuncios publicitarios: los equipos creativos pueden generar múltiples variaciones de un mismo concepto publicitario en minutos, cambiando el prompt y el seed, sin necesidad de rodajes costosos.
- Creación de metraje de relleno (B-roll) para vídeos corporativos: generar secuencias de ambiente (paisajes urbanos, naturaleza, interiores) que complementen vídeos institucionales o formativos.
- Desarrollo de storyboards animados: los cineastas pueden visualizar escenas clave de un guion convirtiendo descripciones textuales en vídeos de baja resolución para planificar encuadres, iluminación y movimiento de cámara.
- Generación de efectos visuales para juegos o demos: crear vídeos de fondo para interfaces de juego, pantallas de carga o materiales promocionales sin depender de motores de render en tiempo real.
- Investigación en generación de vídeo: el modelo sirve como base para experimentos de destilación, cuantización y ajuste fino, gracias a su formato GGUF y su licencia comunitaria (con restricciones territoriales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo incluye muestras visuales comparativas entre los codificadores de texto de 4B y 8B, sin métricas numéricas (FVD, IS, CLIP score, etc.). Tampoco se proporcionan comparaciones con otros modelos de generación de vídeo.

## Requisitos de hardware

- VRAM estimada: el transformador cuantizado Q4_K_M ocupa 11.4 GB, el codificador de texto de 4B en FP8 ocupa 5.24 GB y el de 8B ocupa 10.6 GB. Sumando los VAEs (vídeo 5.21 GB, audio 0.6 GB), el requisito mínimo está en torno a 22-28 GB según la variante de codificador elegida.
- GPU recomendadas: el autor del repositorio utilizó una RTX 5090 de 32 GB para las muestras, con tiempos de generación de 2.3-2.5 minutos para 90 fotogramas a 1280×720. GPUs con 24 GB (RTX 4090) pueden ejecutar la variante de 4B con cuantización más agresiva, aunque con mayor riesgo de desbordamiento de memoria.
- En GPU de consumo: sí, siempre que se disponga de al menos 24 GB de VRAM. Para GPUs de 16 GB (RTX 4080, 4070 Ti) es probable que se necesite reducir la resolución o el número de fotogramas, y usar el codificador de 4B.
- Opciones de despliegue: ComfyUI con el cargador GGUF actualizado (canal remoto), o mediante el framework LightX2V (https://github.com/modeltc/lightx2v) que soporta los pesos fusionados.
- Latencia: aproximadamente 2.3-2.5 minutos para 90 fotogramas a 1280×720 en una RTX 5090. El throughput no está especificado para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución máx. | Pasos de inferencia | Audio nativo | Licencia | Formato |
|---|---|---|---|---|---|---|
| MiniMax H3 Turbo GGUF (este) | ~20.1B (DiT) | 1280×720 | 8 | Sí (estéreo) | Comunitaria (excluye UE, UK, Corea, EE. UU.) | GGUF |
| MiniMax H3 original | ~20.1B (DiT) | 2K | 50+ | Sí (estéreo) | Comunitaria (excluye UE, UK, Corea, EE. UU.) | safetensors |
| CogVideoX-5B | 5B | 720p | 50 | No | Apache 2.0 | safetensors |
| Wan 2.1 T2V | 1.3B/14B | 720p/1080p | 50 | No | Apache 2.0 | safetensors |

La comparativa se basa en datos públicos de los repositorios oficiales. No se dispone de benchmarks comparativos numéricos entre estos modelos. La principal ventaja del modelo turbo es la reducción de pasos de 50 a 8, lo que multiplica por seis la velocidad de generación respecto al original, a costa de una ligera pérdida de calidad visual que el autor no cuantifica.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License excluye explícitamente el uso en la Unión Europea, Reino Unido, Corea del Sur y Estados Unidos. Cualquier despliegue comercial o incluso de investigación en esos territorios podría violar los términos de la licencia.
- Sesgos y alucinaciones visuales: como todo modelo generativo, puede producir artefactos visuales, incoherencias temporales o representaciones inexactas de objetos o personas, especialmente con prompts complejos o poco comunes.
- Resolución limitada: la versión turbo está limitada a 1280×720, mientras que el modelo original soporta hasta 2K. No es adecuado para producción cinematográfica de alta resolución.
- Dependencia del codificador de texto: se requiere el ClipProj correspondiente al tamaño del codificador (4B u 8B). Usar un codificador sin su ClipProj puede degradar significativamente la calidad.
- Requisitos de VRAM elevados: incluso cuantizado, el modelo necesita al menos 22-28 GB de VRAM para funcionar con comodidad, lo que excluye a la mayoría de GPUs de consumo de gama media.
- Documentación incompleta: no se especifican los idiomas soportados para los prompts, ni se ofrecen métricas de rendimiento cuantitativas. El autor tampoco detalla el proceso de poda del DiT original.
- Riesgo de uso indebido: la generación de vídeo fotorrealista puede emplearse para crear contenido falso o engañoso. Se recomienda implementar mecanismos de verificación de autenticidad en entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ChrisColeTech/minimax-h3-turbo-GGUF
- Modelo base (MiniMax H3): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio GitHub de MiniMax H3: https://github.com/MiniMax-AI/MiniMax-H3
- LoRA Turbo (LightX2V): https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Código y documentación de Turbo: https://github.com/ModelTC/Minimax-H3-Turbo
- Framework LightX2V: https://github.com/modeltc/lightx2v
- Workflow de ejemplo (JSON): https://huggingface.co/ChrisColeTech/minimax-h3-turbo-GGUF/blob/main/workflow_example/minimax_h3_turbo.json
- Limitaciones conocidas de ClipProj: https://github.com/nicolab28/ComfyUI-ClipProj#known-limitations
