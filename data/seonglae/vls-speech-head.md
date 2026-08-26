# seonglae/vls-speech-head

## Resumen

El modelo `seonglae/vls-speech-head` es un transformer causal que convierte estados ocultos de un modelo de visión-lenguaje (VLM) congelado en tokens de audio del codec Mimi, permitiendo generar habla directamente a partir de una imagen sin necesidad de escribir primero un caption. Lo desarrolla Seonglae Cho, un investigador independiente, y se publica bajo licencia MIT. El enfoque es novedoso porque evita el paso intermedio de texto: la información visual se proyecta directamente a la representación acústica.

El modelo se entrena sobre el dataset `vls-100k` (74.9k filas, en inglés) y se publican dos tamaños: 430 millones y 173 millones de parámetros, cada uno con dos semillas distintas. La precisión de token (AR token acc) es baja por diseño, ya que el objetivo no es reproducir la secuencia exacta de tokens de referencia, sino que el habla decodificada conserve el significado de la imagen de entrada. El repositorio incluye checkpoints con su propia configuración, listos para cargar con PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (head de speech) sobre backbone VLM congelado |
| Parametros totales | 430,1 M y 173,5 M (según checkpoint) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (dataset de entrenamiento en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal que recibe como entrada los estados ocultos de la última capa de un backbone de visión-lenguaje congelado (no especificado en la documentación) bajo un prompt constante. A partir de esos estados, genera tokens del codec Mimi, que posteriormente se decodifican en audio. El backbone no se entrena; solo se entrena el head de speech. El entrenamiento se realiza sobre el dataset `vls-100k`, que contiene pares imagen-audio en inglés, con un total de 74.9k filas en el split de entrenamiento. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La innovación principal es la generación de habla desde imagen sin pasar por texto intermedio, lo que reduce la latencia y evita errores de transcripción.

## Capacidades

- Generación de habla a partir de imágenes (image-to-speech) sin necesidad de generar un caption previo.
- Emisión de tokens de audio del codec Mimi, que pueden decodificarse en waveform.
- El modelo está diseñado para preservar el significado semántico de la imagen en el habla generada, no para reproducir exactamente la referencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.
- El modelo es puramente de audio; no procesa texto ni visión directamente (depende del backbone VLM congelado).

## Casos de uso

- Accesibilidad para personas con discapacidad visual: el modelo puede describir oralmente el contenido de una imagen capturada con una cámara, generando habla natural sin necesidad de un paso de texto intermedio.
- Narración automática de imágenes en aplicaciones de realidad aumentada o asistentes personales, donde se requiere una respuesta auditiva inmediata.
- Generación de audio descriptivo para contenido visual en redes sociales o plataformas de vídeo, permitiendo crear pistas de voz automáticas a partir de fotos.
- Prototipos de investigación en interacción multimodal, donde se estudia la relación directa entre percepción visual y producción vocal.
- Asistentes para personas mayores o con dificultades de lectura, que pueden "leer" imágenes (carteles, etiquetas, documentos) en voz alta.
- Sistemas de descripción de imágenes en tiempo real para entornos de vigilancia o monitorización, donde la respuesta hablada es más útil que un texto en pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas de validación propias:

| Checkpoint | Params | Seed | Epoch | Val loss | AR token acc |
|---|---|---|---|---|---|
| `430m-seed42/best.pt` | 430,1 M | 42 | 63 | 2,177 | 8,27 % |
| `430m-seed43/best.pt` | 430,1 M | 43 | 69 | 2,1731 | 7,19 % |
| `173m-seed42/best.pt` | 173,5 M | 42 | 46 | 2,1749 | 6,3 % |
| `173m-seed43/best.pt` | 173,5 M | 43 | 36 | 2,175 | 7,5 % |

El autor advierte que la precisión de token es baja por diseño y que la métrica relevante es la calidad semántica del habla decodificada, no la reproducción exacta de la secuencia de tokens.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación.
- Dado el tamaño de los checkpoints (430 M y 173 M de parámetros), la inferencia es viable en GPUs de consumo con al menos 8 GB de VRAM para el modelo de 173 M en precisión FP32, y 16 GB para el de 430 M. Sin embargo, estos son cálculos estimados y no confirmados por el autor.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI). El modelo se carga directamente con PyTorch mediante `torch.load`.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (image-to-speech sin paso de texto). El enfoque es poco común; la mayoría de los sistemas de síntesis de voz requieren texto como entrada. Por tanto, no se puede ofrecer una comparativa fiable con alternativas existentes.

## Limitaciones y advertencias

- La precisión de token es baja por diseño; el modelo no reproduce fielmente la referencia, sino que busca preservar el significado. Esto puede resultar en habla con errores de pronunciación o entonación si se compara con la referencia.
- La elección de semilla afecta significativamente al rendimiento; el autor advierte que las diferencias entre semillas superan los efectos que normalmente se comparan en otros experimentos.
- El modelo depende de un backbone VLM congelado no especificado; su comportamiento está condicionado a la calidad de los estados ocultos de ese backbone.
- No se documentan sesgos específicos, pero al entrenarse solo con datos en inglés, el rendimiento en otros idiomas no está garantizado.
- El dataset `vls-100k` es relativamente pequeño (74.9k filas), lo que puede limitar la generalización a dominios fuera de los datos de entrenamiento.
- No se proporcionan garantías de seguridad ni de robustez frente a entradas adversariales en imágenes.
- La licencia MIT permite uso comercial, pero el modelo se publica sin garantías y sin soporte oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seonglae/vls-speech-head
- Dataset de entrenamiento: https://huggingface.co/datasets/seonglae/vls-100k
- Perfil del autor en HuggingFace: https://huggingface.co/seonglae
- Perfil del autor en GitHub: https://github.com/seonglae
