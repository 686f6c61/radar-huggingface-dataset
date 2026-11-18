# Comfy-Org/Wan-Dancer

## Resumen

Wan-Dancer es un repositorio de redistribución de pesos para ComfyUI del modelo Wan2.2-Dancer-14B, desarrollado originalmente por Wan-AI. No se trata de un modelo nuevo, sino de un reempaquetado de los archivos del modelo base en formato single-file con cuantización FP8 escalada, listo para colocarse en el directorio `models/diffusion_models/` de ComfyUI. El repositorio lo mantiene Comfy-Org, el equipo detrás de la interfaz ComfyUI, y su función es facilitar el uso del modelo generativo de vídeo dentro de ese ecosistema sin necesidad de convertir pesos manualmente.

El modelo base es un modelo de difusión para generación de vídeo de 14.000 millones de parámetros orientado a la síntesis de movimiento de baile a partir de audio (music-to-dance), según se deduce del workflow publicado "Wan Dancer: Music to Dance". El repositorio incluye dos variantes de pesos, una etiquetada como `global` y otra como `local`, ambas con cuantización FP8 escalada, lo que sugiere una separación entre componentes de atención global y local propia de la arquitectura Wan2.2.

La relevancia actual del repositorio reside en su integración directa con ComfyUI: al estar empaquetado como `diffusion-single-file`, los usuarios pueden descargar los pesos y ejecutar el workflow sin pasos intermedios de conversión. Con 41.284 descargas y licencia Apache 2.0, es una opción accesible para experimentación con generación de vídeo en entornos de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión (base Wan2.2-Dancer-14B); detalles internos no disponibles |
| Parametros totales | 14B (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | FP8 escalada (`fp8_scaled`), en variantes global y local |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. El modelo base es Wan-AI/Wan2.2-Dancer-14B, un modelo de difusión de 14.000 millones de parámetros. El reempaquetado de Comfy-Org separa los pesos en dos archivos, `wan2.2_dancer_14b_global_fp8_scaled.safetensors` y `wan2.2_dancer_14b_local_fp8_scaled.safetensors`, lo que apunta a una arquitectura con componentes de procesamiento global y local diferenciados, habitual en modelos de difusión para vídeo que combinan atención a nivel de secuencia completa con procesamiento por bloques o ventanas.

No se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la cuantización FP8 escalada aplicada en el reempaquetado. El tamaño del repositorio es de 36,7 GB, coherente con dos variantes FP8 de un modelo de 14B más posibles componentes auxiliares.

## Capacidades

- Generación de vídeo a partir de audio: el workflow publicado se denomina "Music to Dance", lo que indica síntesis de movimiento de baile condicionada por música.
- Generación de vídeo de alta resolución y varios segundos de duración, según las capacidades típicas de la familia Wan2.2 (no confirmado explícitamente en la información disponible).
- Integración nativa con ComfyUI mediante nodos y plantillas de workflow.
- Ejecución con pesos cuantizados a FP8 para reducir requisitos de VRAM.
- No se documenta soporte de tool calling, agentes, razonamiento multi-step ni capacidades multilingües, al ser un modelo generativo de vídeo y no un modelo de lenguaje.

## Casos de uso

- Generación de vídeos de baile a partir de una pista musical: el workflow "Music to Dance" permite introducir audio y obtener una animación sincronizada, adecuado para prototipos creativos y contenido para redes sociales.
- Previsualización de coreografías: estudios de danza pueden generar borradores animados antes de rodar, reduciendo costes de producción.
- Creación de contenido para videojuegos: generación de animaciones de personajes no jugadores con movimiento rítmico a partir de bandas sonoras.
- Producción audiovisual independiente: realizadores sin equipo de motion capture pueden obtener clips de baile generados para inserts o fondos.
- Investigación en generación de vídeo condicionada por audio: el repositorio facilita reproducir el modelo base en ComfyUI para experimentos de comparación y ajuste fino.
- Educación y demostraciones técnicas: talleres sobre modelos de difusión pueden usar el workflow preconfigurado para mostrar el pipeline completo de audio a vídeo.
- Automatización de contenido musical: generación de vídeos promocionales para lanzamientos de canciones con un pipeline reproducible en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos están en FP8, por lo que el modelo de 14B ocupa aproximadamente 14 GB solo en pesos; con activaciones y buffers de difusión para vídeo, se estima un mínimo práctico de 16-24 GB de VRAM (estimación, no confirmada en la información disponible).
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño, se requieren GPUs de gama alta (RTX 4090, A100, H100) para ejecución cómoda.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) con FP8, aunque no está confirmado; en GPUs de 8-12 GB requeriría offloading o cuantizaciones adicionales no incluidas en este repositorio.
- Opciones de despliegue: ComfyUI es el entorno objetivo documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan-Dancer (este repo) | 14B | safetensors FP8 single-file | Apache 2.0 | Hugging Face, ComfyUI |
| Wan-AI/Wan2.2-Dancer-14B | 14B | pesos originales (formato no disponible) | no disponible en esta ficha | Hugging Face |
| Otros modelos de difusión de vídeo de la familia Wan2.2 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un reempaquetado, no un modelo original: cualquier limitación del modelo base Wan2.2-Dancer-14B se hereda sin cambios.
- La cuantización FP8 puede introducir pérdida de calidad frente a los pesos originales en precisión completa.
- No se documentan sesgos conocidos, pero los modelos de difusión de vídeo entrenados con datos web pueden reproducir estereotipos de movimiento, género o etnia.
- Riesgo de artefactos y alucinaciones visuales en movimientos complejos o audio ambiguo.
- No se especifican idiomas soportados ni limitaciones de contexto, al no ser un modelo de lenguaje.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datasets de entrenamiento originales.
- El repositorio depende de ComfyUI y de la estructura de directorios indicada; no es un paquete autónomo.
- No hay información sobre requisitos mínimos oficiales ni sobre soporte de hardware específico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Wan-Dancer
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-Dancer-14B
- Workflow "Wan Dancer: Music to Dance": https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan_dancer.json
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
