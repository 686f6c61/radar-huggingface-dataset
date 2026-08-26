# dongjidaoyi/WAN2.2-14B-Rapid-AllInOne

## Resumen

WAN2.2-14B-Rapid-AllInOne es un modelo de generación de vídeo "todo en uno" creado por Phr00t (publicado también bajo el usuario dongjidaoyi en HuggingFace) que combina el modelo base Wan2.2 de Alibaba con varios aceleradores y adaptaciones de la comunidad, como WAN 2.2 Lightning, SkyReels y VACE. Su objetivo es simplificar el flujo de trabajo de generación de vídeo: en lugar de cargar por separado el modelo de difusión, el CLIP y el VAE, este paquete integra todos los componentes en un único archivo safetensors que se carga directamente con el nodo "Load Checkpoint" de ComfyUI.

El modelo está pensado para ofrecer una generación rápida y de calidad con solo 1 CFG y 4 pasos de muestreo, gracias a la mezcla de aceleradores. Soporta text-to-video, image-to-video, y generación condicionada por primer y último fotograma (incluyendo VACE). Aunque el autor ya no lo mantiene y lo ha declarado deprecado, sigue siendo una opción interesante para quienes buscan un punto de partida sencillo y eficiente con la familia WAN 2.2. El repositorio ocupa 1417,3 GB e incluye múltiples versiones (base, V2 a V10 y MEGA), cada una con ajustes específicos de calidad y comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video basado en transformer (Wan2.2) con mezcla de aceleradores (Lightning, SkyReels, VACE) |
| Parametros totales | 14 mil millones (14B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de video; el contexto se define por numero de fotogramas y resolucion) |
| Tipos de cuantizacion | FP8 (nativo); version GGUF disponible en ModelScope |
| Idiomas soportados | No disponible (probablemente ingles y chino, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint unificado con CLIP y VAE); GGUF en version separada |

## Arquitectura y entrenamiento

El modelo es una mezcla (merge) de pesos de Wan2.2 (tanto la variante image-to-video como text-to-video, ambas de 14B) con otros modelos y aceleradores de la comunidad. No se trata de un entrenamiento desde cero, sino de una combinacion de pesos que busca aprovechar las ventajas de cada componente: mejor adherencia al prompt (SkyReels), mayor velocidad de muestreo (Lightning) y control de fotogramas (VACE). El resultado es un unico checkpoint que incluye el modelo de difusion, el CLIP y el VAE, listo para cargar en ComfyUI.

La precision es FP8, lo que reduce el uso de memoria y acelera la inferencia. El autor recomienda usar 1 CFG y 4 pasos, con muestreadores como euler_a o sa_solver segun la version. No se han publicado detalles sobre los datos de entrenamiento originales de Wan2.2, pero el modelo base fue desarrollado por Alibaba y entrenado con un gran corpus de video-texto.

## Capacidades

- Generacion de video a partir de texto (T2V) y a partir de imagen (I2V).
- Generacion condicionada por primer y ultimo fotograma (First->Last Frame) y solo ultimo fotograma (Last Frame), gracias a la integracion de VACE.
- Inferencia rapida: disenado para funcionar con 1 CFG y 4 pasos, lo que reduce drasticamente el tiempo de generacion frente a los 50 pasos tipicos de Wan2.2.
- Compatibilidad con LORAs de WAN 2.1 y LORAs "low noise" de WAN 2.2, permitiendo estilos personalizados.
- Precision FP8 para menor uso de VRAM y mayor velocidad.
- Integracion completa en ComfyUI mediante el nodo "Load Checkpoint" (incluye VAE y CLIP).
- Soporte de multiples resoluciones y duraciones, aunque no se especifican valores maximos concretos.

## Casos de uso

- Creacion de contenido para redes sociales: generar clips cortos de 3-5 segundos a partir de una imagen o texto, con calidad suficiente para plataformas como TikTok o Instagram Reels, gracias a la rapidez de 4 pasos.
- Prototipado de storyboards en produccion audiovisual: los directores pueden generar versiones preliminares de una escena a partir de un fotograma inicial y un prompt, evaluando encuadres y movimiento antes de la filmacion real.
- Generacion de videos educativos y explicativos: a partir de una imagen de un diagrama o grafico, el modelo puede animar el contenido con movimiento natural, util para cursos online o material docente.
- Interpolacion y extension de secuencias: usando el modo First->Last Frame, se pueden crear transiciones fluidas entre dos imagenes fijas, por ejemplo para animaciones de presentaciones o efectos visuales.
- Arte generativo y experimentacion creativa: artistas digitales pueden explorar variaciones de movimiento a partir de una misma imagen inicial, ajustando el prompt y los LORAs para obtener estilos distintos.
- Investigacion en generacion de video: el modelo sirve como base para probar tecnicas de aceleracion, mezcla de pesos o adaptacion con LORAs, gracias a su licencia Apache 2.0 y su formato unificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas comparativas (como FVD, CLIP score o tiempos de generacion) frente a otros modelos. La unica referencia de rendimiento es cualitativa: el modelo funciona en GPUs con 8 GB de VRAM y genera video en 4 pasos, pero no hay numeros concretos.

## Requisitos de hardware

- VRAM estimada: el autor indica que funciona incluso con 8 GB de VRAM, aunque para resoluciones mayores o videos mas largos se recomienda al menos 12-16 GB.
- GPU recomendadas: RTX 3060/4060 (8-12 GB) para pruebas basicas; RTX 4090 o A100 para produccion con resoluciones altas (720p o superior).
- Compatible con consumer GPUs: si, especialmente las de la serie RTX 30/40 con 8 GB o mas.
- Opciones de despliegue: ComfyUI (flujo principal), tambien disponible en formato GGUF para llama.cpp o herramientas compatibles con GGUF.
- Latencia y throughput: no disponibles. Se espera que con 4 pasos y FP8 la generacion sea significativamente mas rapida que el Wan2.2 original (que requiere 50 pasos), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WAN2.2-14B-Rapid-AllInOne | 14B | No disponible | Apache 2.0 | Safetensors/GGUF | Mezcla de aceleradores, 4 pasos, FP8 |
| Wan2.2-I2V-A14B (base) | 14B | No disponible | Apache 2.0 | Safetensors | Modelo original de Alibaba, requiere 50 pasos |
| Wan2.2-T2V-A14B (base) | 14B | No disponible | Apache 2.0 | Safetensors | Modelo original de Alibaba, requiere 50 pasos |
| Wan2.2-5B (hibrido TI2V) | 5B | No disponible | Apache 2.0 | Safetensors | Version ligera, 720p/24fps, corre en 4090 |

La comparativa se limita a la familia Wan2.2 porque no hay datos suficientes sobre otros modelos de generacion de video en la informacion proporcionada. La principal ventaja del Rapid-AllInOne frente a los modelos base es la reduccion de pasos (4 vs 50) y la integracion de VAE/CLIP en un solo archivo.

## Limitaciones y advertencias

- El autor ha declarado que el modelo ya no se mantiene y esta deprecado. No se esperan actualizaciones ni correcciones de errores.
- Problemas conocidos: ruido en los primeros 1-2 fotogramas en image-to-video, cambios de escena dramaticos en algunas versiones, y movimiento exagerado en ciertas configuraciones.
- La compatibilidad con LORAs es limitada: solo funcionan bien los LORAs de WAN 2.1 y los "low noise" de WAN 2.2; los "high noise" pueden degradar la calidad.
- El repositorio incluye versiones NSFW que no son apropiadas para uso general; se recomienda precaucion al descargar.
- No hay informacion sobre sesgos o alucinaciones especificas, pero al ser un modelo de generacion de video, puede producir contenido visualmente plausible pero semanticamente incorrecto.
- El tamano del repositorio (1417,3 GB) es enorme; la descarga requiere espacio significativo y ancho de banda.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de calidad ni soporte.

## Enlaces

- Repositorio HuggingFace (dongjidaoyi): https://huggingface.co/dongjidaoyi/WAN2.2-14B-Rapid-AllInOne
- Repositorio original (Phr00t): https://huggingface.co/Phr00t/WAN2.2-14B-Rapid-AllInOne
- GitHub de Wan2.2 (Alibaba): https://github.com/Wan-Video/Wan2.2
- Version GGUF en ModelScope: https://www.modelscope.cn/models/AI-ModelScope/WAN2.2-14B-Rapid-AllInOne-GGUF
- Video de prueba en Bilibili: https://www.bilibili.com/video/BV14g4RzEEi1/
