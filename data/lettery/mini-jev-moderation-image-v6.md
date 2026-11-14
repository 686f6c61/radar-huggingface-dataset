# lettery/mini-jev-moderation-image-v6

## Resumen

Mini-Jev image moderation v6 es un modelo de clasificación de imágenes orientado a la moderación de contenido, desarrollado por el usuario lettery. Se construye como un ajuste fino mediante LoRA sobre el modelo multimodal Qwen3-VL-2B-Instruct, al que se le acoplan cuatro cabezas de clasificación enrutadas que producen puntuaciones de tipo sí/no para dos categorías: contenido sexual/R18 y contenido gore. El paquete publicado incluye el adaptador LoRA entrenado, las cabezas de clasificación, el código de inferencia y la configuración de política; el modelo base debe descargarse por separado.

El modelo resuelve un problema acotado: el filtrado previo de imágenes estáticas en pipelines de moderación, emitiendo una puntuación por categoría y una acción sugerida basada en reglas. No es un modelo generativo de propósito general ni un sistema de decisión autónoma: la salida `decision` está fijada a `review` y el modo es `review_only` fuera del entorno local validado.

Su relevancia es doble. Por un lado, demuestra un patrón de bajo coste (2B parámetros con LoRA y cabezas ligeras) para moderación visual; por otro, su model card es explícita sobre las limitaciones de validación: la métrica principal (42/47, 89,4 % en etiqueta sexual) proviene de una muestra retrospectiva pequeña y etiquetada por el propio usuario, y no existe recall medido para gore. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen3-VL-2B-Instruct (transformer multimodal visión-lenguaje) con adaptador LoRA y cuatro cabezas de clasificación enrutadas |
| Parámetros totales | 2B en el modelo base (el adaptador LoRA y las cabezas añaden una fracción no especificada) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el paquete distribuido usa pesos del adaptador y cabezas; el base se descarga en su formato original) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA y cabezas en `.pt` (PyTorch); el modelo base Qwen3-VL-2B-Instruct se obtiene por separado desde Hugging Face |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-VL-2B-Instruct, un transformer multimodal que procesa imágenes y texto. Sobre él se entrena un adaptador LoRA y se añaden cuatro cabezas de clasificación enrutadas que emiten puntuaciones independientes para las categorías sexual y gore. La inferencia devuelve un JSON con `scores`, `suggested_action` (regla), `decision` (fijada a `review`), `mode` (`review_only`) y `probability_calibrated` (`false`).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. La model card indica que no se incluyen imágenes de entrenamiento, anotaciones personales ni predicciones por imagen en el paquete publicado. El proyecto se declara derivado de AstitwaAgarwal/multimodal-jev y remite a un repositorio GitHub público con el informe y el código de inferencia revisable. Las dependencias de referencia del entorno de validación son PyTorch 2.9.1, Transformers 5.20.0, PEFT 0.21.0, NumPy 2.5.4 y Pillow 13.0.0.

## Capacidades

- Clasificación de imágenes estáticas en dos categorías: contenido sexual/R18 y gore.
- Salida estructurada en JSON con puntuaciones por categoría, acción sugerida y modo de operación.
- Integración con el modelo base Qwen3-VL-2B-Instruct para el procesamiento visual.
- Ejecución en GPU CUDA o, en su defecto, en CPU (con mayor latencia).
- Verificación de integridad del paquete mediante SHA-256 por archivo (`MANIFEST.json`) y reconstrucción del ZIP a partir de 11 volúmenes con `reassemble.py`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre como capacidades verificadas.
- No cubre texto dentro de imágenes, vídeo, audio ni entrada de texto (fuera del alcance de la validación).

## Casos de uso

- Preliminar de moderación en subidas de imágenes: el modelo puntúa cada imagen y devuelve `review` para que un moderador humano confirme, reduciendo el volumen de revisión manual en categorías sexual y gore.
- Filtrado en colas de revisión humana: ordenar por `scores` permite priorizar las imágenes con mayor puntuación antes de la inspección, sin aplicar bloqueos automáticos.
- Señal auxiliar en plataformas comunitarias: integrar la puntuación como una característica más en un sistema de triaje existente, manteniendo la decisión final en manos de revisores.
- Auditoría retrospectiva de contenido: ejecutar el modelo sobre archivos históricos para detectar candidatos a revisión, asumiendo que la muestra de validación es pequeña y no representativa.
- Despliegue en entornos con recursos limitados: al partir de un base de 2B parámetros, puede ejecutarse en una sola GPU de consumo, lo que facilita prototipos y pruebas locales.
- Investigación sobre moderación multimodal: servir como referencia reproducible de un patrón LoRA + cabezas de clasificación sobre un VLM pequeño, con código de inferencia y política incluidos.

## Benchmarks y rendimiento

| Evaluación | Muestra | Resultado | Notas |
|---|---|---|---|
| Etiqueta sexual (umbral 0,5) | 47 imágenes retrospectivas etiquetadas por el usuario | 42/47 correctas (89,4 %) | 4 falsos negativos, 1 falso positivo |
| Etiqueta gore | 48 imágenes etiquetadas por el usuario | Todas negativas | Sin recall humano medido |
| Test previo de 98 imágenes | Etiquetas de pre-revisión por IA | No válido como aceptación humana independiente | Según la model card |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores son las únicas reportadas y la propia model card advierte que no constituyen una estimación independiente de precisión en despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base Qwen3-VL-2B-Instruct ocupa aproximadamente 4,25 GB en su descarga, por lo que se requiere al menos esa cantidad más el adaptador y las cabezas.
- GPU recomendadas: no especificadas por el autor; por tamaño del base, una GPU con 8-16 GB de VRAM es suficiente en la práctica, aunque no hay cifras oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en modelos como RTX 3060/4060/4090, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: el paquete incluye `predict.py` con soporte para `--device cuda` o CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card solo indica que en CPU la carga e inferencia son más lentas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini-Jev image moderation v6 | 2B (base) + LoRA y cabezas | No disponible | Clasificación sexual/gore sobre VLM | Apache 2.0 | Hugging Face (paquete en 11 volúmenes) |
| Qwen3-VL-2B-Instruct | 2B | No disponible en la información | VLM generativo de propósito general | No disponible en la información | Hugging Face |
| AstitwaAgarwal/multimodal-jev | No disponible | No disponible | Proyecto de moderación multimodal del que deriva Mini-Jev | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparación con alternativas específicas de moderación visual (por ejemplo, clasificadores dedicados tipo Falconsai) se menciona en la model card como un experimento de comparación más débil, pero sin cifras publicadas.

## Limitaciones y advertencias

- La métrica principal (42/47, 89,4 %) proviene de una muestra retrospectiva pequeña, etiquetada por el usuario y parcialmente controvertida; no es una estimación independiente de precisión en producción.
- No existe recall medido para gore: el subconjunto etiquetado por humanos no contiene ejemplos positivos de gore.
- Las puntuaciones no están calibradas como probabilidad real de infracción (`probability_calibrated: false`).
- La salida `decision` está fijada a `review` y el modo es `review_only` fuera del entorno local validado; no debe usarse para banear cuentas, borrar archivos ni sancionar usuarios de forma automática.
- Fuera del alcance validado: texto dentro de imágenes, vídeo, audio y entrada de texto.
- Las imágenes corruptas, animadas o multipágina requieren revisión manual.
- Idiomas soportados limitados a chino e inglés.
- El paquete se distribuye en 11 volúmenes que deben reconstruirse y verificarse con SHA-256 antes de su uso; una reconstrucción incorrecta invalida el artefacto.
- El modelo base debe descargarse por separado (unos 4,25 GB) y las versiones de dependencias deben aproximarse a las del entorno de validación.
- No se incluyen imágenes de entrenamiento ni anotaciones, lo que limita la auditabilidad del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lettery/mini-jev-moderation-image-v6
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Proyecto del que deriva: https://huggingface.co/AstitwaAgarwal/multimodal-jev
- Repositorio GitHub público: https://github.com/cnYanqing/mini-jev-moderation
- Modelo experimental de comparación: https://huggingface.co/lettery/vision-moderation-heads-experimental-v1
