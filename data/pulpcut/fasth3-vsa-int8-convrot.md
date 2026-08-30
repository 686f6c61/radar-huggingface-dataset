# PulpCut/FastH3-VSA-INT8-ConvRot

## Resumen

FastH3 VSA INT8 ConvRot es una conversión del checkpoint FastVideo FastH3 Preview v1 (VSA) desarrollada por PulpCut para el motor nativo Metal de Apple Silicon de la aplicación H3ddle. El modelo original, creado por el laboratorio hao-ai-lab (FastVideo), es un transformer de difusión de video y audio destilado en cuatro pasos a partir de MiniMax H3, que incorpora atención sparse aprendida (VSA, Video Sparse Attention) con una esparsidad del 90 %. Esta versión convertida mantiene el núcleo INT8 ConvRot de H3ddle, traduce el layout SwiGLU de Diffusers al formato nativo gate-first y preserva la función AdaLN de cuatro llamadas como filas de búsqueda exactas.

El modelo resuelve el problema de generar clips de video con audio sincronizado a partir de descripciones textuales, reduciendo drásticamente el coste computacional frente a los 20 pasos del MiniMax H3 original. La relevancia actual radica en que ofrece una implementación optimizada para hardware Apple Silicon, con tiempos de inferencia medidos de 11,6 minutos para un clip de 512×512 píxeles y 124 frames en un M1 Pro de 32 GB, lo que supone una mejora del 27,4 % frente a la versión densa equivalente. El repositorio contiene un único archivo safetensors de aproximadamente 23 GB y no es un checkpoint Diffusers, sino un paquete pensado exclusivamente para el catálogo gestionado de H3ddle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (texto a video y audio), con atencion VSA aprendida (formato 2, tile size 64, sparsity 0.9) y nucleo ConvRot INT8 |
| Parametros totales | no disponible (el checkpoint pesa 22 966 486 018 bytes en INT8) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion de video; soporta 124-362 frames) |
| Tipos de cuantizacion | INT8 (nucleo ConvRot), salida en BF16 |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community (otra, con archivo LICENSE incluido) |
| Formato de pesos | safetensors (no compatible con Diffusers; requiere H3ddle/h3.c) |

## Arquitectura y entrenamiento

El modelo base es FastVideo FastH3 Preview v1 VSA, un checkpoint de difusion de cuatro pasos destilado mediante DMD2 (Distribution Matching Distillation) a partir de MiniMax H3. La arquitectura emplea atencion sparse aprendida (VSA) con un formato de compresion de dos niveles, tile size de 64 y una esparsidad del 90 %, lo que reduce el coste de atencion frente a la atencion densa. El modelo genera video y audio de forma conjunta (T2VA, text-to-video-audio) utilizando el mismo transformer base para ambas modalidades.

La conversion de PulpCut adapta este checkpoint al motor nativo Metal de Apple Silicon de H3ddle. Para ello, mantiene el nucleo ConvRot en INT8 (entrada-mayor), reordena el layout SwiGLU de Diffusers (value-first) al formato gate-first del motor, conserva la funcion AdaLN entrenada de cuatro llamadas como filas de busqueda exactas e incluye las 50 proyecciones de compresion VSA aprendidas. El resultado es un archivo unico que no es un checkpoint Diffusers y que debe usarse con el manifiesto gestionado de H3ddle, que incluye el text encoder, el VAE de video, el VAE de audio, el tokenizador y los archivos de configuracion compartidos de MiniMax H3.

## Capacidades

- Generacion de video de 124 a 362 frames con audio estereo sincronizado a partir de una descripcion textual.
- Inferencia en exactamente cuatro llamadas (4-step) gracias a la destilacion DMD2.
- Atencion sparse aprendida (VSA) con esparsidad del 90 %, lo que reduce el coste computacional frente a la atencion densa.
- Soporte nativo para el motor Metal de Apple Silicon mediante H3ddle, con verificacion de integridad (SHA-256) y perfil de modelo gestionado.
- Condicionamiento exclusivamente text-to-video con audio; no soporta imagen estatica, frames iniciales/finales, referencias de imagen ordenadas ni video inpainting.
- Capacidades multilingues: no disponibles (dependen del text encoder de MiniMax H3, pero no se especifican idiomas).
- Tool calling, agentes y razonamiento multi-paso: no aplica (modelo generativo de video, no de texto).

## Casos de uso

- Prototipado rapido de contenido audiovisual: un equipo creativo puede generar clips de 5 segundos (124 frames a 24 fps) con audio para validar conceptos antes de una produccion completa, gracias a los cuatro pasos de inferencia y la atencion sparse.
- Generacion de video para redes sociales: creadores individuales con un Mac Apple Silicon pueden producir clips de hasta 362 frames (unos 15 segundos) con audio sincronizado sin necesidad de un cluster de GPUs, usando la aplicacion H3ddle.
- Pruebas de concepto en produccion audiovisual: directores o disenadores pueden explorar multiples variaciones de una escena a partir de prompts textuales, comparando resultados en minutos en lugar de horas.
- Generacion de material de relleno para edicion: en postproduccion, se pueden crear secuencias de transicion o fondos animados con audio ambiente coherente, reduciendo el tiempo de busqueda en bancos de imagenes.
- Investigacion en modelos de difusion de video: el checkpoint convertido permite a investigadores estudiar el comportamiento de la atencion sparse VSA y la cuantizacion INT8 en hardware Apple Silicon, con una implementacion determinista verificada (similitud coseno 0,9999986 frente a la salida BF16).
- Evaluacion de pipelines de video-audio en dispositivos locales: desarrolladores de herramientas creativas pueden integrar H3ddle como motor de generacion offline, aprovechando el perfil fasth3 y la gestion automatizada de dependencias.

## Benchmarks y rendimiento

La model card proporciona mediciones de rendimiento en un M1 Pro de 32 GB para una tarea controlada de 512×512 píxeles y 124 frames (salida de 5,175 segundos a 24 fps con audio AAC estereo). Los tiempos de FastH3 Dense y FastH3 VSA son mediciones directas; los de Standard y Turbo son estimaciones normalizadas por el programa de llamadas.

| Modelo | Pasos | Atencion | Tiempo extremo a extremo | Comparado con VSA |
|---|---:|---:|---:|---:|
| Standard (MiniMax H3 original) | 20 | Densa | ~4 253 s (70,9 min) | ~6,11× mas lento (estimado) |
| Turbo | 8 | Densa | ~1 782 s (29,7 min) | ~2,56× mas lento (estimado) |
| FastH3 Dense | 4 | Densa | 958,174 s (16,0 min) | 1,377× mas lento (medido) |
| FastH3 VSA (este modelo) | 4 | VSA aprendida, 90 % sparse | 696,043 s (11,6 min) | Referencia (medido) |

La conversion reduce el tiempo extremo a extremo en un 27,4 % frente a la version densa de cuatro pasos. La prueba determinista VSA GPU/CPU reporta una similitud coseno de 0,999998633, un error absoluto medio de 0,000065549 y un error maximo de 0,000706643 tras el redondeo a BF16. No se han publicado resultados de calidad generativa (p. ej., FID, CLIP score) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con soporte Metal (probado en M1 Pro de 32 GB).
- VRAM estimada: no especificada, pero el checkpoint completo pesa ~23 GB en INT8; se asume que requiere al menos 32 GB de memoria unificada para la configuracion probada.
- GPUs compatibles: no es compatible con GPUs NVIDIA o AMD; esta disenado exclusivamente para el motor Metal de Apple Silicon.
- Opciones de despliegue: aplicacion H3ddle (gestion automatizada del modelo), o integracion con H3ddle/h3.c y los componentes compartidos de MiniMax H3 (text encoder, VAE de video, VAE de audio, tokenizador).
- Latencia y throughput: en M1 Pro 32 GB, un clip de 512×512 y 124 frames tarda 696 segundos (11,6 min) extremo a extremo, incluyendo el coste fijo de pipeline de ~134 segundos.
- No se proporcionan datos para otros dispositivos Apple Silicon; los resultados son locales al M1 Pro probado.

## Comparativa con modelos similares

| Modelo | Pasos | Atencion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastH3 VSA INT8 ConvRot (este) | 4 | VSA sparse 90 % | INT8 ConvRot, Metal | minimax-h3-community | Solo Apple Silicon via H3ddle |
| FastVideo FastH3 Preview v1 VSA (base) | 4 | VSA sparse 90 % | BF16 (Diffusers) | minimax-h3-community | Multi-GPU (NVIDIA, etc.) via FastVideo |
| FastVideo FastH3 Dense (mismo preview) | 4 | Densa | BF16 (Diffusers) | minimax-h3-community | Multi-GPU via FastVideo |
| MiniMax H3 original | 20 | Densa | BF16 | minimax-h3-community | Multi-GPU via FastVideo |

La diferencia principal frente al base es la cuantizacion INT8 y la adaptacion al motor Metal de H3ddle, que mejora el rendimiento en Apple Silicon pero limita la portabilidad. Frente al MiniMax H3 original, el FastH3 VSA reduce el numero de pasos de 20 a 4, con una aceleracion estimada de ~6,11× en el mismo hardware. No se dispone de comparativas de calidad generativa entre estas variantes.

## Limitaciones y advertencias

- Soporte limitado de frames: solo genera clips de 124 a 362 frames; no admite imagenes estaticas, frames iniciales/finales, referencias de imagen ordenadas ni video inpainting.
- Resolucion minima: requiere un borde corto de al menos 480 píxeles; resoluciones inferiores no estan soportadas.
- Exclusividad de plataforma: el archivo convertido solo funciona con el motor H3ddle en Apple Silicon; no es un checkpoint Diffusers y no puede ejecutarse con otros frameworks.
- Licencia restrictiva: la licencia minimax-h3-community es una licencia comunitaria de MiniMax; es necesario revisar el archivo LICENSE incluido para confirmar los usos permitidos, especialmente en entornos comerciales.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo o de fidelidad del contenido generado; como modelo generativo de video, existe riesgo de producir contenido visual o auditivo incoherente o no deseado, especialmente con prompts complejos o fuera de distribucion.
- Rendimiento dependiente del hardware: los tiempos medidos corresponden a un M1 Pro de 32 GB; en otros dispositivos Apple Silicon el rendimiento puede variar significativamente.
- Dependencia de componentes externos: el modelo requiere el text encoder, VAE de video, VAE de audio, tokenizador y archivos de configuracion de MiniMax H3, que H3ddle gestiona automaticamente pero que no estan incluidos en este repositorio.
- Sin datos de calidad generativa: no se han publicado metricas de calidad (FID, CLIP, etc.) para este checkpoint convertido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PulpCut/FastH3-VSA-INT8-ConvRot
- Checkpoint base: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- Blog de FastVideo FastH3 Preview: https://haoailab.com/blogs/fasth3-preview/
- Repositorio FastVideo (hao-ai-lab): https://github.com/hao-ai-lab/FastVideo
- Repositorio de referencia para CMP 170HX (similar, pero para GPUs NVIDIA): https://github.com/PixelML/FastH3-CMP-170HX
- Repositorio relacionado de PulpCut (MiniMax-H3 INT8 ConvRot): https://huggingface.co/PulpCut/MiniMax-H3-INT8-ConvRot
