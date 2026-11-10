# Goddard/pie4k-depth-anything-v2-small-gguf

## Resumen

`Goddard/pie4k-depth-anything-v2-small-gguf` es una conversión a formato GGUF del modelo de estimación de profundidad monocular Depth Anything V2 Small, publicada por el usuario Goddard para su uso dentro de PIE4K, un editor de áreas que emplea un runtime ggml propio (`libpie4k_depthany`) para la función "Height from image". No se trata de un modelo de lenguaje: es un modelo de visión puro que, dada una imagen RGB, produce un mapa de profundidad denso.

El modelo base, `depth-anything/Depth-Anything-V2-Small-hf`, pertenece a la familia Depth Anything V2 de ByteDance, con unos 24,8 millones de parámetros. Esta conversión concreta mantiene los pesos en fp32 y sigue el layout GGUF `depth-anything` definido por vision.cpp, con disposición WHCN por defecto. El repositorio ocupa aproximadamente 0,1 GB y el único fichero pesa 99.165.120 bytes.

Su relevancia es acotada pero clara: permite ejecutar estimación de profundidad en el runtime ggml de PIE4K sin dependencias de PyTorch, con un fichero de menos de 100 MB, lo que facilita el despliegue en entornos de escritorio y la integración en herramientas de edición 3D o reconstrucción a partir de imágenes. La licencia Apache 2.0 del modelo base se traslada a esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision para estimacion de profundidad; el modelo base Depth Anything V2 Small emplea un encoder tipo DINOv2 y un decoder de profundidad, segun la documentacion publica del modelo base) |
| Parametros totales | 24.785.089 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | solo fp32 en este repositorio; el layout GGUF de vision.cpp admite otras precisiones, pero no se distribuyen en este repo |
| Idiomas soportados | no disponible (modelo de vision, independiente del idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `depth-anything-v2-small-F32.gguf`, 99.165.120 bytes, sha256 `a0d0fbdeea10123fe2697b13b89633daf81fff47a0857efa3decde14944cf87a`) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de ajuste del modelo base en la información disponible. Lo único documentado es el proceso de conversión: a partir de `model.safetensors` del repositorio `depth-anything/Depth-Anything-V2-Small-hf` en la revisión fijada `5426e4f0f36572d16453bbda7a8389317b1bef99` (sha256 del safetensors `3152477ce0d8d6978d76b995120de97cb5b928701fd0f817769f59e249a16b70`), se ejecuta el script `scripts/convert.py` de vision.cpp en el commit `26a752912d49f6c4ff4545b35a1bdf7400d349ed` con el comando:

```sh
uv run --script scripts/convert.py depth-anything depth-anything-v2-small.safetensors \
    --output depth-anything-v2-small-F32.gguf
```

La conversión conserva la precisión fp32 y el layout WHCN por defecto del formato `depth-anything` de vision.cpp. El script de preparación del repositorio PIE4K (`tools/depth/setup_depth.sh`) automatiza la descarga y conversión. No hay innovaciones técnicas propias de esta conversión más allá del empaquetado en GGUF para el runtime ggml de PIE4K.

## Capacidades

- Estimación de profundidad monocular densa a partir de una imagen RGB: genera un mapa de profundidad por píxel.
- Integración con el runtime ggml de PIE4K (`libpie4k_depthany`) para la función "Height from image" del editor de áreas.
- Compatible con el layout GGUF `depth-anything` de vision.cpp (WHCN por defecto).
- Ejecución sin PyTorch: el fichero GGUF se carga directamente en un runtime ggml.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo exclusivamente de visión.
- No dispone de capacidades multilingües, de audio ni de modo de razonamiento extendido.

## Casos de uso

- Extracción de altura en el editor PIE4K: el modelo alimenta la función "Height from image", permitiendo derivar un mapa de altura a partir de una fotografía para su uso en edición de áreas o terrenos. Es su caso de uso principal y el motivo de la conversión.
- Reconstrucción 3D a partir de una sola imagen: el mapa de profundidad denso sirve como entrada para generar una malla o nube de puntos en pipelines de fotogrametría ligera, con un fichero de menos de 100 MB que se carga en memoria sin problema.
- Efectos de desenfoque de profundidad (depth of field) en postproducción: el mapa de profundidad permite aplicar desenfoque selectivo por distancia en imágenes fijas o vídeo, procesando cada fotograma con un coste bajo gracias al tamaño reducido del modelo.
- Segmentación por planos de profundidad: separar primer plano, plano medio y fondo en una imagen para tareas de composición, sustitución de fondo o matting asistido.
- Preprocesado para modelos de difusión con control de profundidad: generar mapas de profundidad que alimenten pipelines de generación de imagen condicionada por profundidad (por ejemplo, ControlNet con depth), sin necesidad de un entorno PyTorch en el equipo de inferencia.
- Herramientas de accesibilidad y descripción de escenas: estimar la estructura de profundidad de una imagen para generar descripciones espaciales o guiar interfaces que dependan de la distancia relativa de los objetos.
- Prototipado en aplicaciones de escritorio con ggml: al ser un GGUF de menos de 100 MB, encaja en aplicaciones nativas que ya usan ggml para otros modelos y quieren añadir estimación de profundidad con una dependencia mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 24,8 millones de parámetros en fp32, los pesos ocupan aproximadamente 99 MB; el consumo total dependerá de la resolución de entrada y de las activaciones del runtime ggml.
- GPU recomendadas: no disponible. El modelo es lo bastante pequeño para ejecutarse en CPU y en GPU de gama baja, pero no se documentan requisitos específicos.
- Cabe en cualquier GPU consumer con al menos unos pocos cientos de MB de memoria libre, aunque no se especifica una lista concreta de modelos compatibles.
- Opciones de despliegue: runtime ggml de PIE4K (`libpie4k_depthany`) y vision.cpp; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goddard/pie4k-depth-anything-v2-small-gguf | 24.785.089 | no aplica | Estimacion de profundidad monocular | apache-2.0 | GGUF para runtime ggml de PIE4K |
| depth-anything/Depth-Anything-V2-Small-hf | no disponible en la informacion proporcionada | no aplica | Estimacion de profundidad monocular | apache-2.0 | safetensors en Hugging Face (modelo base) |
| Depth Anything V2 en otras variantes (Base, Large) | no disponible en la informacion proporcionada | no aplica | Estimacion de profundidad monocular | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de visión, no de lenguaje: no genera texto, no responde a instrucciones y no soporta tool calling ni agentes.
- La precisión de profundidad es relativa, no métrica absoluta, salvo que el pipeline de PIE4K aplique una calibración adicional; no se documenta dicha calibración.
- Solo se distribuye en fp32; no hay variantes cuantizadas en este repositorio, lo que limita la reducción de tamaño adicional.
- El fichero está pensado para el runtime ggml de PIE4K y el layout de vision.cpp; otros runtimes GGUF pueden no ser compatibles sin conversión adicional.
- No se documentan sesgos, tasas de alucinación ni limitaciones por idioma, al no ser un modelo de texto.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base en su página de Hugging Face.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.
- La fecha de creación indicada (2026-11-10) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Goddard/pie4k-depth-anything-v2-small-gguf
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- vision.cpp (herramienta de conversión y runtime): https://github.com/Acly/vision.cpp
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo; los resultados obtenidos corresponden a Robert H. Goddard, la NASA Goddard Space Flight Center y el novelista Robert Goddard, sin relación con el modelo.
