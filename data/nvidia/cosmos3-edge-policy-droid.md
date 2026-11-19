# nvidia/Cosmos3-Edge-Policy-DROID

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política robótica (policy model) desarrollado por NVIDIA, derivado mediante post-entrenamiento del modelo base Cosmos3-Edge. Forma parte de la familia Cosmos3, una colección de modelos del mundo ("world models") omniomodales orientados a Physical AI: robótica, conducción autónoma y entornos industriales. El modelo recibe instrucciones en lenguaje natural y observaciones visuales de la plataforma robótica DROID y genera trayectorias de acción para tareas de manipulación y control.

Arquitectónicamente se apoya en el diseño Mixture-of-Transformers (MoT) de Cosmos3, que combina una torre transformer autorregresiva para generación de tokens discretos con una torre transformer de difusión para generación multimodal continua. El checkpoint cuenta con aproximadamente 3.859 millones de parámetros (4B según la model card) y se distribuye en formato safetensors con un tamaño de repositorio de 9,2 GB. La ventana de contexto de texto es de 4096 tokens y el modelo acepta entradas de imagen y vídeo en resoluciones de 256p y 480p.

Su relevancia actual radica en que es un modelo de política listo para uso comercial liberado bajo licencia OpenMDW 1.1, lo que permite integrar políticas de control robótico en investigación y producción sin las restricciones de licencias más cerradas. Está especializado en el embodiment DROID (8 dimensiones de acción), lo que lo hace directamente aplicable a pipelines de aprendizaje por imitación y evaluación de políticas en brazos manipuladores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusión |
| Parámetros totales | 3.859.003.312 (4B según model card) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (texto); vídeo: máximo 5 frames; acción: 16–400 frames |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (7 shards en transformer/ + vae, vision_encoder, sound_tokenizer) |

## Arquitectura y entrenamiento

Cosmos3 emplea una arquitectura Mixture-of-Transformers (MoT) con dos torres complementarias: una torre autorregresiva que genera tokens discretos mediante decodificación next-token estándar (texto) y una torre de difusión que sintetiza modalidades continuas (imagen, vídeo, audio y acciones) mediante denoising iterativo. Esta separación permite modelar modalidades heterogéneas en un único framework preservando el mecanismo de generación más adecuado para cada una. El repositorio incluye componentes separados de VAE, vision encoder, text tokenizer y sound tokenizer, coherentes con un pipeline multimodal de difusión.

El checkpoint Cosmos3-Edge-Policy-DROID es una variante post-entrenada del modelo base Cosmos3-Edge, especializada en generar trayectorias de acción a partir de instrucciones de lenguaje y observaciones visuales de la plataforma DROID. No se han proporcionado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco especifica innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de trayectorias de acción robótica para el embodiment DROID (8 dimensiones: posiciones articulares, estado del gripper, pose de cámara).
- Comprensión de instrucciones en lenguaje natural como condicionamiento de la política.
- Procesamiento de observaciones visuales en imagen (jpg, png, jpeg, webp) y vídeo (mp4) a 256p y 480p.
- Generación multimodal: el modelo base Cosmos3 produce imagen, vídeo, audio, acción y texto; este checkpoint está especializado en acción.
- Entrada de trayectorias de acción previas como contexto (secuencias 2D de forma (T, D)).
- Soporte de ratios de aspecto 16:9, 4:3, 1:1, 3:4 y 9:16.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Manipulación robótica con DROID: el modelo genera trayectorias de acción a partir de instrucciones y observaciones visuales, adecuado para control de brazos manipuladores en tareas de pick-and-place, ensamblaje o manipulación de objetos.
- Aprendizaje por imitación y evaluación de políticas: sirve como política de referencia o baseline para comparar estrategias de control en entornos simulados y reales sobre la plataforma DROID.
- Investigación en Physical AI: permite experimentar con políticas fundacionales preentrenadas sin partir de cero, acelerando la iteración en laboratorios de robótica.
- Generación de datos sintéticos de acción: combinado con las capacidades generativas de la familia Cosmos3, puede emplearse para aumentar datasets de demostraciones robóticas.
- Prototipado de pipelines de control condicionados por lenguaje: integración en stacks de robótica que traducen comandos en lenguaje natural a secuencias de control de 8 dimensiones.
- Evaluación de robustez visual: al aceptar imagen y vídeo a 256p y 480p con distintos ratios de aspecto, permite probar la política bajo variaciones de resolución y encuadre.
- Docencia y divulgación: modelo de 4B parámetros con licencia permisiva para uso comercial, útil en cursos de robótica y aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.859 millones de parámetros en safetensors (probablemente fp16/bf16), el peso completo ronda los 8 GB; a fp16 se estiman en torno a 8 GB de VRAM solo para pesos, más overhead de activaciones y componentes auxiliares (VAE, vision encoder, sound tokenizer).
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, GPUs de datacenter como A100 o H100 son adecuadas; GPUs consumer de gama alta con 16–24 GB de VRAM podrían alojar el modelo en precisión reducida, aunque no se confirma.
- ¿Cabe en GPU consumer? No confirmado oficialmente; por el tamaño del checkpoint (9,2 GB de repositorio) es plausible en GPUs con 16 GB o más, sujeto a validación.
- Opciones de despliegue: la librería indicada es `cosmos`; el código de referencia está en el repositorio de GitHub de NVIDIA Cosmos. Soporte para vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de política robótica (por ejemplo, otras variantes de la familia Cosmos3 o políticas de otros fabricantes) que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- Especialización limitada al embodiment DROID (8 dimensiones de acción); no es directamente transferible a otros robots sin adaptación.
- La entrada de acción solo está soportada para la plataforma DROID según la model card.
- Límite de 5 frames de vídeo de entrada y de 4096 tokens de texto, lo que restringe el contexto temporal y lingüístico.
- No se soportan entradas en escala de grises; solo RGB de 8 bits por canal en sRGB.
- Riesgo de alucinación y de generar trayectorias no seguras en entornos reales: requiere validación y salvaguardas antes de desplegar en producción física.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe.
- Licencia OpenMDW 1.1: permite uso comercial y no comercial según la model card, pero conviene revisar los términos completos en el enlace de licencia antes de su integración.
- No se han publicado benchmarks que permitan estimar el rendimiento real de la política.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- White paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Web oficial: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Framework Cosmos: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
