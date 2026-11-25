# Moear/AzurLane-RVC-v2

## Resumen

AzurLane-RVC-v2 es una colección de 30 modelos de conversión de voz (voice conversion) basados en la arquitectura RVC v2 (Retrieval-based Voice Conversion), publicada por el usuario Moear en Hugging Face. Cada modelo reproduce la voz de un personaje del videojuego Azur Lane a partir de audio de entrada, conservando el contenido lingüístico y la entonación del audio original. El repositorio ocupa 2,8 GB en total y cada conjunto individual de pesos pesa aproximadamente 88 MiB.

El modelo no es un LLM ni un sistema de generación de texto: es un pipeline de audio-a-audio cuyo cometido es transformar el timbre de una locución. Se distribuye como pesos `.pth` acompañados de un índice de recuperación `.index` (que mejora la similitud del timbre mediante búsqueda de características) y un fichero `.json` de metadatos para la herramienta Neiroha-RVC. El entrenamiento se realizó sobre el dataset `Moear/AzurLane-Voice-20261118` con las voces japonesas del juego.

Su relevancia es acotada pero clara para la comunidad de doblaje aficionado, modding y experimentación con TTS: permite encadenar un sintetizador de texto a voz con un convertidor RVC para obtener una voz concreta de personaje sin necesidad de grabar a un actor. La licencia no está declarada, lo que limita seriamente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion; encoder HuBERT + decoder basado en VITS, con índice FAISS de recuperación) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; ventana de inferencia dependiente del segmento de audio, no documentada) |
| Tipos de cuantizacion | no disponible (pesos `.pth` en precisión de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | ja (entrenado con voces japonesas del juego; acepta entrada en otros idiomas conservando el contenido) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (checkpoint PyTorch) + `.index` (índice de recuperación) + `.json` (metadatos) |
| Numero de personajes | 30 |
| Tamano por personaje | ~88 MiB |
| Tamano total del repo | 2,8 GB |
| Dataset de entrenamiento | Moear/AzurLane-Voice-20261118 |
| Epocas de entrenamiento | entre 120 y 300 según personaje |
| Pipeline | audio-to-audio |

## Arquitectura y entrenamiento

RVC v2 es una arquitectura de conversión de voz que combina un extractor de características auto-supervisado (HuBERT) para obtener representaciones del contenido fonético, un codificador de tono (F0, con soporte para RMVPE) y un decoder generativo de tipo VITS que reconstruye la onda con el timbre objetivo. La variante "v2" se caracteriza por un mayor número de canales en el decoder y por el uso de índices de recuperación que buscan vecinos cercanos en el espacio de características para reforzar la similitud tímbrica con el hablante de destino.

Cada uno de los 30 modelos se entrenó de forma independiente sobre las voces japonesas del personaje correspondiente en Azur Lane. El número de épocas varía entre 120 (personajes como 大凤, 拉菲 o 能代) y 300 (personajes como 埃姆登, Z23, 信浓, 雅努斯, 贝尔法斯特 o 谢菲尔德), lo que sugiere que los modelos con más épocas se beneficiaron de más datos o de un ajuste más fino. El autor no documenta el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de regularización o aumento de datos más allá de la referencia al dataset público. El índice `.index` se genera a partir de las características del hablante de destino y se usa en inferencia con una intensidad configurable (por defecto 0,5 en Neiroha-RVC; las demos usan 0,75).

## Capacidades

- Conversión de voz (voice conversion) many-to-one: transforma el timbre de una locución de entrada en el de un personaje concreto de Azur Lane.
- Preservación del contenido lingüístico y de la entonación del audio de entrada (el autor indica que el modelo "sigue las líneas y la entonación del input").
- Acepta entrada en japonés, chino y segmentos cantados limpios (干声), según la model card.
- Integración con TTS: permite generar primero audio desde texto y luego aplicar la conversión RVC.
- Soporte de índice de recuperación con intensidad ajustable para reforzar la similitud del timbre.
- Extracción de pitch F0 con RMVPE (opcional) para mejorar la naturalidad en voz hablada y cantada.
- API local (Neiroha-RVC expone un endpoint en `http://127.0.0.1:19001`) para encadenar con flujos de voz de Neiroha.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Doblaje aficionado de personajes: grabar una locución con la propia voz o con un TTS y aplicar el modelo del personaje para obtener una interpretación con su timbre, útil en proyectos de fan-dub y vídeos de comunidad.
- Modding de audio en juegos: sustituir líneas de voz existentes por nuevas locuciones manteniendo la coherencia tímbrica del personaje, siempre que se respeten las condiciones legales de los assets originales.
- Creación de contenido para streaming y VTubing: cadena TTS + RVC para generar respuestas habladas con una voz de personaje en tiempo (casi) real mediante la API local de Neiroha-RVC.
- Prototipado de asistentes de voz con personalidad: evaluar cómo suena un personaje concreto antes de invertir en grabación profesional o en un modelo TTS dedicado.
- Investigación en conversión de voz: banco de pruebas reproducible con 30 hablantes y distintos regímenes de entrenamiento (120-300 épocas) para estudiar el efecto del índice de recuperación y del número de épocas en la similitud tímbrica.
- Generación de audiolibros o pódcasts temáticos: narrar texto con un TTS y convertir la voz al personaje deseado para contenido de fans, con la advertencia de licencia indicada más abajo.
- Pruebas de robustez multilingüe: el modelo acepta entrada en chino y japonés, lo que permite evaluar la preservación de prosodia al cambiar de idioma de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente demos cualitativas (archivos WAV con comparaciones entre entrada, voz original reservada, conversión sin índice y conversión con índice a 0,75), sin métricas objetivas como MOS, similitud de hablante (SECS) o error de pitch.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada por el autor. Por el tamaño de los pesos (~88 MiB por personaje) y la arquitectura RVC v2, la inferencia cabe holgadamente en GPUs de consumo, aunque no se especifica una cifra oficial.
- GPU recomendadas: no disponible. El paquete Neiroha-RVC v0.2.0 usa CUDA 12.8 en su versión portable para Windows x64.
- Compatibilidad con GPU de consumo: previsiblemente sí (GTX/RTX con suficiente VRAM para el encoder HuBERT y el decoder), aunque el autor no publica requisitos mínimos.
- Modo CPU: soportado; se configura `device = "cpu"` en `configs/server.toml` de Neiroha-RVC.
- Opciones de despliegue: Neiroha-RVC v0.2.0 (paquete portable para Windows x64, interfaz web en `http://127.0.0.1:17803` y API en `http://127.0.0.1:19001`); cualquier herramienta compatible con RVC v2 que cargue `.pth` + `.index` con speaker ID 0 y F0 RMVPE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Numero de voces | Tamano | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AzurLane-RVC-v2 (Moear) | RVC v2, conversión de voz | 30 personajes de Azur Lane | ~88 MiB por personaje; 2,8 GB repo | no aplica | no disponible | Hugging Face |
| RVC v2 base (RVC-Project) | RVC v2, framework | N/A (requiere entrenamiento) | variable | no aplica | MIT (según el proyecto original; verificar) | GitHub / Hugging Face |
| Modelos RVC de personajes individuales | RVC v1/v2 | 1 por repositorio | ~50-100 MiB | no aplica | variable, a menudo sin declarar | Hugging Face |
| Modelos TTS multihablante (p. ej. XTTS-v2) | TTS zero-shot | clonación desde audio de referencia | varios GB | limitado por el modelo TTS | no disponible / Coqui Public Model License | Hugging Face |

La comparativa es cualitativa: no se dispone de métricas objetivas publicadas para este modelo que permitan una comparación numérica con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso, lo que impide asumir permiso para uso comercial. Cualquier despliegue en producción requiere aclarar la licencia con el autor.
- Riesgo legal sobre los assets: las voces originales pertenecen a Azur Lane (Manjuu/Yongshi) y a sus actrices de doblaje; la conversión de voz puede infringir derechos de imagen o de voz según la jurisdicción.
- Sesgo de dominio: el modelo se entrenó exclusivamente con las voces japonesas del juego, por lo que puede generalizar mal a acentos, registros o estilos muy alejados del material original.
- Contenido lingüístico: aunque acepta entrada en chino, la calidad de preservación de prosodia en idiomas distintos del japonés no está evaluada con métricas.
- Alucinación y artefactos: como todo modelo generativo de audio, puede introducir artefactos, inestabilidad en pitch o pérdida de inteligibilidad en segmentos ruidosos o con solapamiento de hablantes.
- Requiere audio limpio: el autor recomienda entrada "干声" (voz limpia); el rendimiento con ruido de fondo no está documentado.
- Dependencia de herramienta: el flujo principal está pensado para Neiroha-RVC v0.2.0 en Windows x64; otros entornos requieren cargar manualmente `.pth` e `.index`.
- Sin benchmarks: no hay métricas objetivas publicadas (MOS, SECS, F0 RMSE), por lo que la evaluación de calidad es puramente cualitativa a partir de las demos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Moear/AzurLane-RVC-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118
- Catalogo CSV: https://huggingface.co/Moear/AzurLane-RVC-v2/blob/main/rvc-catalog.csv
- Catalogo JSON: https://huggingface.co/Moear/AzurLane-RVC-v2/blob/main/rvc-catalog.json
- Catalogo SQLite: https://huggingface.co/Moear/AzurLane-RVC-v2/blob/main/rvc-catalog.sqlite3
- Checksums SHA-256: https://huggingface.co/Moear/AzurLane-RVC-v2/blob/main/SHA256SUMS
- Demo 能代 (japones): https://huggingface.co/Moear/AzurLane-RVC-v2/resolve/main/demos/noshiro-japanese.wav
- Demo 大凤 (chino): https://huggingface.co/Moear/AzurLane-RVC-v2/resolve/main/demos/taihou-chinese.wav
- Demo 贝尔法斯特 (reservado): https://huggingface.co/Moear/AzurLane-RVC-v2/resolve/main/demos/belfast-heldout.wav
- Neiroha-RVC v0.2.0 (release): https://github.com/Neiroha/Neiroha-RVC/releases/tag/v0.2.0
- Neiroha-RVC README (chino): https://github.com/Neiroha/Neiroha-RVC/blob/v0.2.0/README_zh.md
- Neiroha-RVC API (chino): https://github.com/Neiroha/Neiroha-RVC/blob/v0.2.0/docs/api_zh.md
- Neiroha (release): https://github.com/Neiroha/Neiroha/releases
