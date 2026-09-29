# blanchon/inspatio-world-v1.5

## Resumen

InSpatio-World 1.5 es un modelo de mundo 4D orientado a la síntesis de vistas novedosas (novel-view synthesis) y a la simulación espacio-temporal interactiva a partir de una o varias imágenes de entrada. El modelo original lo desarrolla el equipo InSpatio y se publica con el paper "INSPATIO-WORLD: A Real-Time 4D World Simulator via Spatiotemporal Autoregressive Modeling" (arXiv:2604.07209). La ficha que nos ocupa, `blanchon/inspatio-world-v1.5`, es un reempaquetado de todos los pesos necesarios para inferencia en un único repositorio, preparado por el usuario `blanchon` para su reimplementación mínima `inspatio-world`, de modo que no sea necesario descargar dependencias desde otros repositorios.

Técnicamente se trata de un pipeline de image-to-video compuesto por un DiT causal derivado de Wan2.1-1.3B (1,42 B de parámetros, en formato EMA), el VAE causal de vídeo de Wan2.1 (127 M), el codificador de texto umT5-XXL (5,7 B), un decodificador rápido de previsualización TAEHV (9,8 M) y un módulo de profundidad y estimación de cámaras Depth-Anything-3 DA3NESTED-GIANT-LARGE (1,7 B). El conjunto suma aproximadamente 9 B de parámetros y ocupa 17,8 GB en el repositorio.

Su relevancia actual reside en que combina generación de vídeo condicionada por cámara con estimación de profundidad y trayectorias de cámara, lo que permite construir entornos navegables y controlables de forma autoregresiva, un paso hacia simuladores de mundo utilizables en tiempo de ejecución. La salida se entrega en bloques de 12 fotogramas a resolución 480x832 píxeles, en formato uint8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT causal (diffusion transformer) basado en Wan2.1-1.3B, con VAE causal de vídeo, text encoder umT5-XXL, decoder TAEHV y Depth-Anything-3 para profundidad y cámaras |
| Parametros totales | ~8,96 B en el pipeline completo (DiT 1,42 B + VAE 127 M + umT5-XXL 5,7 B + TAEHV 9,8 M + depth 1,7 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen/vídeo, no de texto) |
| Tipos de cuantizacion | bf16 (DiT, VAE, text encoder, TAEHV), fp8 opcional para el DiT, fp32 para parte del módulo de profundidad; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | mixed (DiT Apache-2.0; VAE, text encoder y tokenizer Apache-2.0; TAEHV MIT; Depth-Anything-3 CC BY-NC 4.0 no comercial) |
| Formato de pesos | safetensors (`config.json` + `model.safetensors` por componente) |

## Arquitectura y entrenamiento

El núcleo es un transformer de difusión (DiT) causal construido sobre Wan2.1-1.3B, con pesos en versión EMA. El pipeline se organiza en carpetas independientes cargables con `from_pretrained`: `dit/`, `vae/`, `text_encoder/`, `tokenizer/`, `taehv/`, `depth/` y `examples/`. La generación se plantea de forma autoregresiva espacio-temporal: el modelo produce bloques de 12 fotogramas condicionados por acciones de cámara (avance, giro, combinaciones como `turn-right+forward`) gestionadas mediante una `CameraRig`. El módulo `depth/` aporta la estimación de profundidad y de parámetros de cámara que ancla la geometría de la escena.

El proceso de conversión del reempaquetado se limita a renombrar claves (fusionando las proyecciones q/k/v del DiT y las k/v de cross-attention), eliminar ramas no utilizadas del módulo de profundidad (cabezas de rayos y de Gaussian splatting) y castear cada módulo al dtype con el que se ejecuta en el flujo original. Según el autor, al mantener DiT, VAE y text encoder en bf16 las salidas no cambian respecto al modelo original. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de imágenes (image-to-video) con salida en bloques de 12 fotogramas a 480x832 píxeles.
- Síntesis de vistas novedosas (novel-view synthesis) a partir de una escena de entrada.
- Control explícito de cámara mediante acciones discretas y combinables (`forward`, `turn-right`, `yaw`, etc.).
- Simulación de mundo 4D con modelado autorregresivo espacio-temporal.
- Estimación de profundidad y de parámetros de cámara a través del módulo Depth-Anything-3.
- Previsualización rápida mediante el decodificador TAEHV (`taew2_1`).
- Integración programática en Python a través de la librería `inspatio-world`, con API de sesión interactiva paso a paso.
- Ejecución con cuantización fp8 del DiT y compilación opcional para acelerar la inferencia.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso y capacidades multilingües: no disponibles (no es un modelo de lenguaje).

## Casos de uso

- Síntesis de vistas novedosas para fotografía computacional: dada una imagen de una escena, se generan vistas desde ángulos no capturados, útil para reconstrucción 3D aproximada y efectos de paralaje.
- Previsualización cinematográfica: el control de cámara por acciones permite ensayar movimientos de cámara virtuales sobre una sola toma antes de rodar o renderizar en 3D.
- Simulación de entorno para robótica y navegación: el modelo puede generar trayectorias visuales consistentes desde un punto de vista inicial, sirviendo como entorno sintético para probar políticas de navegación.
- Entornos interactivos y videojuegos: la generación por bloques con bucle de sesión (`session.step`) permite ir produciendo fotogramas a medida que el usuario mueve la cámara.
- Aumento de datos para visión por computador: generar variaciones de punto de vista sobre una escena para entrenar modelos de profundidad, odometría visual o detección.
- Prototipado de experiencias VR/AR: convertir una fotografía en un espacio navegable de bajo coste para demos conceptuales.
- Investigación en world models: base reproducible para experimentar con modelado autorregresivo espacio-temporal y control de cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 17,8 GB, lo que da una cota inferior del espacio en disco necesario.
- VRAM estimada en bf16: el text encoder umT5-XXL (5,7 B) ronda los 11-12 GB, el DiT (1,42 B) unos 3 GB, el VAE y el módulo de profundidad suman varios GB más; en conjunto el pipeline completo requiere del orden de 18-20 GB si todos los módulos están cargados simultáneamente en bf16.
- Con `dit_precision="fp8"` el DiT reduce su huella, lo que puede permitir ejecución en GPUs de 24 GB (RTX 3090, RTX 4090) con gestión cuidadosa de la memoria.
- GPU de datacenter recomendadas: A100 40/80 GB, H100, L40S, para ejecución holgada con todos los módulos en bf16.
- No se documenta compatibilidad con GPUs de gama baja ni con menos de 16 GB de VRAM.
- Opciones de despliegue: la librería propia `inspatio-world` (instalable vía `pip install "inspatio-world @ git+..."`), además de una demo interactiva publicada como Space de Hugging Face.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no es un modelo de lenguaje y estos motores no aplican).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| blanchon/inspatio-world-v1.5 | ~8,96 B (pipeline completo) | Bloques de 12 fotogramas a 480x832 | mixed (incluye CC BY-NC 4.0 no comercial en el módulo de profundidad) | Hugging Face y GitHub |
| Wan-AI/Wan2.1-T2V-1.3B | ~1,3 B (solo DiT) | Texto a vídeo | Apache-2.0 | Hugging Face |
| inspatio/world-1.5 | 1,42 B (DiT) | Modelo de mundo 4D | no disponible con detalle | Hugging Face |
| depth-anything/DA3NESTED-GIANT-LARGE | 1,7 B | Profundidad y cámaras | CC BY-NC 4.0 (no comercial) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia mixta: aunque el DiT, el VAE, el text encoder y el tokenizer son Apache-2.0 y TAEHV es MIT, el módulo de profundidad (Depth-Anything-3) es CC BY-NC 4.0, es decir, no comercial. El pipeline completo hereda esta restricción si se utiliza el módulo de profundidad.
- Riesgo de degradación acumulativa en generación autorregresiva de bloques largos: no se documentan mecanismos de mitigación ni métricas de consistencia temporal.
- Riesgo de alucinación geométrica: las vistas generadas pueden no ser consistentes con la escena real, especialmente fuera del rango de movimiento observado.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; el text encoder umT5-XXL es multilingüe por diseño, pero no se documenta el comportamiento en castellano.
- Contexto de vídeo limitado a bloques de 12 fotogramas a 480x832; no se especifica la duración máxima mantenible con coherencia.
- No hay resultados de benchmarks publicados que permitan validar calidad frente a alternativas.
- Repositorio con 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Se trata de un reempaquetado de pesos ajenos: cualquier incidencia debe contrastarse con los repositorios originales de InSpatio y Wan-AI.
- No apto para tareas de lenguaje, razonamiento, código o matemáticas: es un modelo generativo de vídeo/imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blanchon/inspatio-world-v1.5
- Modelo original: https://huggingface.co/inspatio/world-1.5
- Modelo base de vídeo: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Módulo de profundidad: https://huggingface.co/depth-anything/DA3NESTED-GIANT-LARGE
- Repositorio original de InSpatio: https://github.com/inspatio/inspatio-world-v1.5
- Reimplementación de julien-blanchon: https://github.com/julien-blanchon/inspatio-world-v1.5
- Script de conversión de checkpoints: https://github.com/julien-blanchon/inspatio-world-v1.5/blob/main/scripts/convert_checkpoints.py
- Ejemplos originales: https://github.com/inspatio/inspatio-world-v1.5/tree/main/examples
- Paper: https://arxiv.org/abs/2604.07209
- Decodificador TAEHV: https://github.com/madebyollin/taehv
- Demo interactiva: https://huggingface.co/spaces/blanchon/inspatio-world-v1.5

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los enlaces obtenidos correspondían a una empresa de productos para el tratamiento de la madera sin relación con este repositorio.
