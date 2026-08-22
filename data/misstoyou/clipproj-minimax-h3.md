# misstoyou/ClipProj-MiniMax-H3

## Resumen

ClipProj-MiniMax-H3 es un conjunto de matrices de proyección que permite sustituir el codificador de texto Qwen3-VL-32B del modelo de generación de vídeo MiniMax H3 por un Qwen3-VL-4B o 8B, reduciendo el consumo de VRAM de 15,7 GB a 4,5 GB sin modificar el modelo de difusión, los VAE ni el muestreador. El proyecto lo desarrolla NicoLab28, un autor independiente que lo presenta como una prueba de concepto funcional, no como una herramienta de producción.

El repositorio contiene los pesos de las proyecciones lineales (variantes ridge y residual) junto con los encoders base necesarios para ejecutar el flujo en ComfyUI. La versión v3.1, publicada en agosto de 2025, mejora la pronunciación multilingüe, con una reducción del 29 % de errores de fonemas en los diez idiomas no ingleses probados y del 60 al 74 % en español, francés, alemán e italiano. La licencia es MIT, lo que permite uso comercial, aunque el proyecto depende del nodo custom ComfyUI-ClipProj y del propio MiniMax H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matrices de proyeccion lineal (ridge y residual) que mapean embeddings de Qwen3-VL-4B/8B al espacio del text encoder de MiniMax H3 |
| Parametros totales | No disponible (el repositorio incluye los pesos de los encoders y las proyecciones; el archivo de proyeccion para la variante 4B ocupa 26 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del encoder base Qwen3-VL-4B/8B) |
| Tipos de cuantizacion | No disponible (las proyecciones se guardan en fp16; el encoder puede cargarse en fp16 o fp32) |
| Idiomas soportados | No hay lista oficial; la v3.1 mejora pronunciacion en 10 idiomas no ingleses, con ganancias notables en espanol, frances, aleman e italiano |
| Licencia | MIT |
| Formato de pesos | No disponible (repositorio para ComfyUI, probablemente safetensors) |

## Arquitectura y entrenamiento

El proyecto no entrena un modelo nuevo, sino que ajusta matrices de proyección lineal en una sola pasada, sin gradientes ni tasa de aprendizaje. El objetivo es aprender una transformación lineal entre las representaciones del text encoder pequeño (Qwen3-VL-4B o 8B) y las del text encoder original de MiniMax H3 (Qwen3-VL-32B). Se ofrecen dos variantes: una proyección ridge y una residual con un bloque MLP adicional. La calibración se realizó con un corpus que, en la versión v3.1, da un peso comparable a cada sistema de escritura, añadiendo texto árabe sin vocalizar, lo que explica la mejora en pronunciación.

No se ha publicado información sobre el volumen total de tokens de calibración ni sobre el proceso de validación más allá de los datos de medición incluidos en el modelo card. El autor documenta el método y las limitaciones en los archivos MEASUREMENTS.md y CALIBRATION.md del repositorio de GitHub.

## Capacidades

- Sustitución del text encoder de MiniMax H3 en ComfyUI, permitiendo generar vídeo con un encoder de 4B o 8B en lugar del 32B original.
- Reducción de VRAM: de 15,7 GB a 4,5 GB con la variante 4B, sin cambios en el modelo de difusión.
- Mejora significativa de la pronunciación multilingüe en la versión v3.1, con una reducción del 29 % de errores de fonemas en el conjunto de idiomas probado.
- Compatible con los nodos de ComfyUI-ClipProj versión 0.1.4 o superior, que mantiene la precisión de los pesos residuales en fp16.
- Incluye variantes para Qwen3-VL-4B y Qwen3-VL-8B, tanto en proyección simple como con bloque residual MLP.
- No requiere cambios en el sampler ni en los VAE del modelo base, por lo que se integra en flujos de trabajo existentes.

## Casos de uso

- Generación de vídeo local en tarjetas gráficas de consumo: permite ejecutar MiniMax H3 en GPUs con 6-8 GB de VRAM (p. ej., RTX 3060 o RTX 4060) que no podrían cargar el text encoder completo de 32B.
- Reducción de costes en despliegues en la nube: al usar un encoder de 4B se reduce el consumo de VRAM por instancia, lo que permite alojar más procesos concurrentes en la misma GPU.
- Flujo de trabajo en ComfyUI para creación de vídeo con audio sincronizado: el modelo genera vídeo con audio nativo, y la v3.1 mejora la pronunciación en varios idiomas, lo que facilita la localización de contenidos.
- Experimentación y docencia sobre text encoders en modelos de difusión: el autor documenta el proceso de calibración y las mediciones, sirviendo como referencia para estudiar la influencia del codificador de texto en la generación.
- Generación de vídeo de baja resolución para prototipado: el autor recomienda usar 0.3 MP y 6 pasos de muestreo para pruebas rápidas, y el modelo se comporta de forma comparable al 32B en esas condiciones.
- Investigación sobre modelos omni-modales en entornos con recursos limitados: permite ejecutar el modelo MiniMax H3 completo en equipos sin acceso a GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este proyecto, ya que se trata de un adaptador de codificador de texto, no de un modelo de lenguaje general. Los datos disponibles se centran en la reducción de VRAM y en la calidad de pronunciación:

| Metrica | Valor |
|---|---|
| VRAM con text encoder 4B (con proyeccion) | 4,5 GB |
| VRAM con text encoder 32B original | 15,7 GB |
| Reduccion de errores de fonemas en v3.1 (10 idiomas no ingleses) | 29 % |
| Reduccion de errores en espanol, frances, aleman e italiano | 60-74 % |
| Variabilidad del text encoder 32B al cambiar el seed | 5,8 fonemas de 75 |
| Variabilidad de los archivos v3.1 (4B y 8B, ridge y residual) | 6,4-7,0 fonemas de 75 |

El autor normaliza las mediciones contra la variabilidad inherente del modelo original (5,8 fonemas) y concluye que la diferencia entre el 4B y el 8B, o entre ridge y residual, no es significativa.

## Requisitos de hardware

- VRAM estimada: 4,5 GB para la variante 4B con proyección; la variante 8B requerirá más, aunque no se especifica el valor exacto.
- GPUs compatibles: cualquier tarjeta NVIDIA con al menos 6 GB de VRAM para la 4B, y 8-10 GB para la 8B. Se ha probado en Windows 11 con NVIDIA y ComfyUI 0.31.0.
- Opciones de despliegue: exclusivamente a través de ComfyUI con el nodo custom `ComfyUI-ClipProj`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado datos. El autor recomienda usar 6 pasos de muestreo y resolución de 0.3 MP para pruebas rápidas.

## Comparativa con modelos similares

No hay adaptadores de text encoder comparables disponibles públicamente para MiniMax H3. La comparativa más directa es con el modelo original y con el uso del encoder pequeño sin proyección:

| Configuracion | VRAM | Ventaja | Inconveniente |
|---|---|---|---|
| MiniMax H3 con text encoder Qwen3-VL-32B | 15,7 GB | Calidad de referencia | Requiere GPU de 16 GB o más |
| MiniMax H3 con ClipProj (4B) | 4,5 GB | Se ejecuta en GPUs de consumo | No se puede distinguir la calidad de imagen de la del 32B, pero la variabilidad es mayor |
| MiniMax H3 con Qwen3-VL-4B sin proyeccion | No disponible | No requiere ajuste | Es probable que la generación falle o degrade severamente, ya que los espacios de embeddings no están alineados |

El autor indica que no se han medido diferencias en la calidad de imagen entre la proyección y el 32B, aunque advierte que la coseno no captura atributos contables.

## Limitaciones y advertencias

- Prueba de concepto: el autor lo califica explícitamente como una prueba de concepto, no como una herramienta de producción.
- Entorno de prueba limitado: solo se ha probado en Windows 11, NVIDIA y ComfyUI 0.31.0; no hay garantías de funcionamiento en otras configuraciones.
- Los archivos han cambiado de nombre: las versiones publicadas antes del 11 de agosto utilizan nombres obsoletos (`h3_qwen3vl_4b_tap24`, `h3_control_zero`, `h3_control_identity`) que ahora están en la carpeta `obsolete/`.
- Dependencia de un nodo custom: es obligatorio instalar `ComfyUI-ClipProj` desde GitHub, lo que añade un punto de fallo en el flujo de trabajo.
- La calidad de la pronunciación en v3.1 se midió con un corpus de calibración equilibrado por sistema de escritura, pero no se ha validado en producción.
- No se han publicado mediciones de latencia, throughput ni calidad de vídeo en condiciones reales de uso.
- La licencia MIT se aplica al código y los pesos de este proyecto, pero el modelo base MiniMax H3 tiene su propia licencia que debe revisarse para uso comercial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/misstoyou/ClipProj-MiniMax-H3
- Nodo custom para ComfyUI: https://github.com/nicolab28/ComfyUI-ClipProj
- Repositorio oficial de MiniMax H3: https://github.com/MiniMax-AI/MiniMax-H3
- Blog de MiniMax H3: https://www.minimax.io/blog/minimax-h3
- Hub comunitario de MiniMax H3: https://github.com/ai-models-lab/minimax-h3
- Lista curada de recursos de MiniMax H3: https://github.com/AtlasCloudAI/awesome-minimax-h3
