# Smite79/H3-Longvideos

## Resumen

H3-LongVideos es un paquete de nodos personalizados para ComfyUI, desarrollado por Smite79, que permite generar vídeos largos y continuos de aproximadamente dos minutos de duración a partir de un único prompt de texto, utilizando el modelo de generación de vídeo MiniMax-H3 como motor subyacente. El problema que resuelve es la limitación inherente de H3, que solo genera secuencias de hasta 362 fotogramas (unos 15 segundos), dividiendo automáticamente el prompt en planos o shots, encadenándolos entre sí y manteniendo la coherencia de personajes, vestuario y audio a lo largo de toda la secuencia.

El paquete se distribuye bajo licencia MIT, está escrito íntegramente en Python (solo usa la biblioteca estándar y el núcleo de ComfyUI) y no requiere dependencias externas adicionales. Incluye tres nodos: el principal "H3 Long Videos V1", un nodo auxiliar para calcular la duración de cada plano y un inspector de modelos que reporta la precisión del checkpoint (BF16, FP8, INT8, NVFP4, MXFP8). Es relevante porque simplifica enormemente el flujo de trabajo para crear vídeos narrativos largos con IA, un campo donde la consistencia entre tomas es un desafío técnico importante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de nodos ComfyUI que orquesta MiniMax-H3 (difusión + Qwen3-VL text encoder + VAE de vídeo y audio) |
| Parametros totales | no disponible (depende del checkpoint de MiniMax-H3 utilizado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la generación se limita a ~2 minutos de vídeo, dividido en shots de ~15 s) |
| Tipos de cuantizacion | Detecta y reporta precisión del checkpoint: BF16, FP8, INT8, NVFP4, MXFP8 (vía nodo H3 Model Inspector) |
| Idiomas soportados | Inglés (según metadatos de HuggingFace) |
| Licencia | MIT |
| Formato de pesos | no aplica (es código Python; los pesos son los de MiniMax-H3 cargados por los loaders estándar de ComfyUI) |

## Arquitectura y entrenamiento

H3-LongVideos no es un modelo entrenado, sino un conjunto de nodos de ComfyUI que automatiza el proceso de generación de vídeo largo con MiniMax-H3. El flujo de trabajo toma un prompt de texto, lo divide en párrafos que corresponden a planos individuales, y encadena cada generación usando el último fotograma del plano anterior como condición inicial para el siguiente. Esto permite superar el límite de 362 fotogramas de una sola generación.

El paquete implementa varias capas de lógica para mantener la coherencia: un canal mutable de estado de vestuario que permite que las prendas se quiten o se pongan según lo que dicta el texto; un control de duplicación que evita que un personaje aparezca dos veces cuando se le menciona más de una vez; y un sistema de silenciamiento de audio para planos sin diálogo, evitando que las bocas se muevan generando sonidos incoherentes. Además, gestiona la memoria de vídeo (VRAM) para evitar quedarse sin memoria en cadenas largas de planos.

No hay datos sobre entrenamiento, ya que el paquete no realiza ningún tipo de ajuste de pesos. Todo el comportamiento se basa en la manipulación de prompts y en la gestión del proceso de muestreo de MiniMax-H3.

## Capacidades

- Generación de vídeo largo (hasta ~2 minutos) a partir de un prompt de texto estructurado en párrafos, donde cada párrafo define un plano.
- Encadenamiento automático de planos, usando el último fotograma de cada plano como referencia para el siguiente.
- Mantenimiento de consistencia de personajes: evita duplicaciones, gestiona cambios de vestuario (incluyendo eliminación de prendas) y respeta las salidas de escena.
- Control de audio: silencia planos sin diálogo y mantiene coherencia de audio en planos con diálogo.
- Soporte para definir personajes mediante un bloque `character_memory` con atributos (género, edad, apariencia, ropa).
- Modo `plan_only` que permite previsualizar la división en planos, duración total y número de shots sin necesidad de renderizar.
- Integración opcional con upscaling mediante RTX Video Super Resolution o modelos de upscaling (Real-ESRGAN, UltraSharp, etc.), con fallback a Lanczos.
- Previsualización en vivo durante el muestreo mediante un decodificador aproximado opcional (`taeh3`).

## Casos de uso

- Creación de cortometrajes narrativos: un guionista puede escribir un guion en párrafos y obtener un vídeo completo con diálogos y coherencia visual, sin necesidad de editar manualmente cada plano.
- Producción de vídeos explicativos o tutoriales: se puede describir una secuencia de acciones y el paquete genera un vídeo continuo con narración y audio sincronizado.
- Generación de contenido para redes sociales: vídeos de hasta dos minutos para plataformas como YouTube Shorts o Instagram Reels, con un único prompt.
- Prototipado de escenas para cine o animación: los directores pueden visualizar rápidamente cómo se vería una secuencia concreta, manteniendo la continuidad de personajes y vestuario.
- Automatización de vídeos de demostración de productos: describir un producto y sus características en varios planos, obteniendo un vídeo promocional sin intervención manual.
- Generación de vídeos educativos con personajes consistentes: para cursos online o materiales didácticos, donde un personaje guía explica conceptos en diferentes escenas.
- Pruebas de concepto para videojuegos: generar cinemáticas o secuencias de historia con coherencia visual para validar ideas antes de la producción final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paquete no incluye métricas de rendimiento ni comparativas con otras soluciones.

## Requisitos de hardware

- ComfyUI 0.30 o superior con soporte nativo de MiniMax-H3.
- GPU con VRAM suficiente para cargar el checkpoint de MiniMax-H3. La cantidad exacta no se especifica en la documentación del paquete; dependerá de la precisión del checkpoint (BF16, FP8, etc.) y de la resolución de generación. El nodo "H3 Model Inspector" puede ayudar a determinar si la GPU soporta nativamente la precisión del checkpoint.
- No requiere dependencias adicionales ni paquetes de terceros; solo Python estándar y el núcleo de ComfyUI.
- Opciones de despliegue: el paquete se ejecuta dentro de ComfyUI, por lo que el despliegue se limita a un entorno con ComfyUI instalado. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia.
- La latencia y el throughput dependen directamente del rendimiento de MiniMax-H3 y de la GPU utilizada; no se proporcionan datos específicos en la documentación.

## Comparativa con modelos similares

No disponible. H3-LongVideos es un paquete de nodos que complementa a MiniMax-H3, no un modelo independiente. No existen alternativas equivalentes documentadas en la información proporcionada. Se podría comparar con otros flujos de generación de vídeo largo, pero no hay datos suficientes para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Depende completamente de MiniMax-H3: el paquete no genera vídeo por sí mismo, sino que orquesta el modelo subyacente. Si MiniMax-H3 no está disponible o no funciona, el paquete no tiene utilidad.
- La duración máxima está limitada a ~2 minutos, y cada plano individual está limitado a ~15 segundos (362 fotogramas). Vídeos más largos requerirían múltiples ejecuciones o edición externa.
- El idioma de los prompts y de la documentación es inglés; no se garantiza soporte multilingüe.
- Aunque el paquete gestiona la VRAM para cadenas largas, es posible que en GPUs con poca memoria falle en secuencias de muchos planos. El modo `plan_only` ayuda a prever esto antes de renderizar.
- La consistencia de personajes y vestuario depende de la calidad de los prompts y de la capacidad de MiniMax-H3 para seguir instrucciones. El paquete mitiga problemas comunes, pero no los elimina por completo.
- El paquete es nuevo (creado en agosto de 2026) y no tiene descargas ni valoraciones, por lo que su estabilidad en producción no está probada.
- Licencia MIT permite uso comercial, pero los modelos subyacentes (MiniMax-H3, Qwen3-VL) pueden tener sus propias licencias que deben verificarse por separado.

## Enlaces

- [HuggingFace - Smite79/H3-Longvideos](https://huggingface.co/Smite79/H3-Longvideos)
- [Nvidia_RTX_Nodes_ComfyUI (integración opcional)](https://github.com/Comfy-Org/Nvidia_RTX_Nodes_ComfyUI)
