# rzrmayur/Qwen3.5-2B-Q4_K_M-GGUF

## Resumen

Qwen3.5-2B-Q4_K_M-GGUF es una cuantización no oficial en formato GGUF del modelo Qwen/Qwen3.5-2B, publicada por el usuario rzrmayur. El modelo base lo desarrolla el equipo Qwen de Alibaba Cloud y esta cuantización concreta se ha generado con llama.cpp (commit `620d2225cc436ab0b001e3200e590e3b286ef9ab`) mediante `convert_hf_to_gguf.py --outtype f16` sobre los safetensors originales y posterior `llama-quantize` a Q4_K_M. No incluye la torre de visión del modelo original: es una variante exclusivamente de texto.

El propósito declarado es ejecutar notas de reuniones en el dispositivo (on-device) dentro de la aplicación Android SessionNote, con decodificación greedy y salida JSON con citas literales. El autor justifica el tamaño de 2B tras comparar con Qwen3.5 0.8B, Qwen2.5 1.5B, Qwen3 1.7B, Qwen3.5 4B, LFM3-1.7B y LFM2.5-1.2B: según su medición, es el que más acciones y decisiones detectó con menos elementos inventados entre los modelos que caben en teléfonos de gama media.

El modelo cuenta con 1.942.653.248 parámetros totales y el fichero GGUF ocupa 1.312.164.864 bytes (aproximadamente 1,3 GB). La licencia es Apache-2.0, heredada del modelo original. Es relevante para quienes necesitan un modelo conversacional pequeño, cuantizado y desplegable en hardware modesto, aunque al ser una publicación no oficial con cero descargas conviene tratarla con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-2B; la model card de esta cuantización no detalla la arquitectura) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado) |
| Idiomas soportados | no disponible en los metadatos; el autor evaluó inglés, hinglish, hindi y alemán en su comparativa interna |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el original en safetensors, sin torre de visión |

## Arquitectura y entrenamiento

La model card de esta cuantización no describe la arquitectura interna ni los datos de entrenamiento del modelo base; solo documenta el proceso de conversión y cuantización. Se sabe que parte de Qwen/Qwen3.5-2B (revisión `15852e8c1636`), del que se eliminó la torre de visión durante la conversión a GGUF, y que los pesos se convirtieron primero a f16 y luego se cuantizaron a Q4_K_M sin más modificaciones ("Nothing else was changed").

No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas del modelo base. Cualquier detalle arquitectónico (tipo de transformer, atención, decodificación especulativa) debe consultarse en la model card oficial de Qwen/Qwen3.5-2B, que no forma parte de la información disponible aquí.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Extracción de notas de reuniones: generación de JSON estructurado con citas literales, acciones y decisiones, según el caso de uso declarado por el autor.
- Funcionamiento sobre transcripciones sin puntuación y sobre transcripciones de clase (lecture transcripts), según la evaluación interna del autor.
- Cobertura multilingüe parcial verificada por el autor en inglés, hinglish, hindi y alemán durante su comparativa; no hay lista oficial de idiomas en los metadatos.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Sin capacidades de visión: la torre de visión fue descartada en la conversión.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Notas de reuniones en el dispositivo: es el caso de uso para el que se creó la cuantización. La app SessionNote lo ejecuta con decodificación greedy para producir JSON con acciones y decisiones citando textualmente el transcript, sin enviar audio ni texto a la nube.
- Actas de reuniones en inglés, hinglish, hindi y alemán: el autor midió el rendimiento en estos idiomas y en transcripciones sin puntuar, por lo que encaja en equipos multilingües que graban reuniones en esas lenguas.
- Resumen de clases y apuntes: la evaluación incluyó transcripciones de clase; el modelo puede condensar una transcripción larga en puntos accionables para estudiantes o formadores.
- Asistente conversacional local en Android: al ser un GGUF Q4_K_M de ~1,3 GB, puede integrarse en aplicaciones móviles mediante llama.cpp para chat sin conexión y sin coste de API.
- Prototipado rápido de pipelines de extracción de información: su salida JSON con citas permite construir y validar esquemas de extracción (acciones, responsables, fechas) antes de migrar a un modelo mayor.
- Procesamiento por lotes de transcripciones en CPU: al no requerir GPU, puede ejecutarse en servidores sin acelerador para tareas de resumen de bajo volumen donde la latencia no es crítica.
- Base para fine-tuning ligero o para experimentación con cuantizaciones: al ser Apache-2.0 y de tamaño reducido, sirve como punto de partida para adaptaciones con LoRA en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo aporta una comparación cualitativa interna (número de acciones y decisiones encontradas frente a elementos inventados) contra Qwen3.5 0.8B, Qwen2.5 1.5B, Qwen3 1.7B, Qwen3.5 4B, LFM3-1.7B y LFM2.5-1.2B, sin cifras numéricas publicadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 1.312.164.864 bytes (~1,3 GB); con overhead de contexto y caché KV, se puede estimar un consumo en torno a 1,5-2 GB según longitud de contexto, aunque no se publica una cifra oficial.
- GPU recomendadas: no disponible en la información. Al ser un modelo de ~1,9B en Q4_K_M, es viable en GPUs de consumo con 4 GB o más de VRAM, pero el autor no especifica modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM (por ejemplo, RTX 3050 en adelante), si bien no hay validación publicada.
- Despliegue: llama.cpp (librería declarada), con soporte de endpoints compatibles; también podría usarse vía Ollama u otros frontends que acepten GGUF, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles. El autor indica que el modelo está pensado para teléfonos de gama media, lo que sugiere velocidades de decodificación utilizables en dispositivo, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Q4_K_M-GGUF (este) | 1.942.653.248 | no disponible | GGUF Q4_K_M | Apache-2.0 | Cuantización no oficial, solo texto, ~1,3 GB |
| Qwen3.5 0.8B | no disponible | no disponible | no disponible | no disponible | Comparado por el autor; menor tamaño |
| Qwen2.5 1.5B | no disponible | no disponible | no disponible | no disponible | Comparado por el autor |
| Qwen3 1.7B | no disponible | no disponible | no disponible | no disponible | Comparado por el autor |
| Qwen3.5 4B | no disponible | no disponible | no disponible | no disponible | Comparado por el autor; mayor tamaño |
| LFM3-1.7B | no disponible | no disponible | no disponible | no disponible | Comparado por el autor |
| LFM2.5-1.2B | no disponible | no disponible | no disponible | no disponible | Comparado por el autor |

No se dispone de datos de parámetros, contexto, rendimiento ni licencia de los modelos comparados en la información proporcionada; la comparativa se limita a la lista de modelos que el autor usó en su evaluación interna.

## Limitaciones y advertencias

- Publicación no oficial: no está hecha ni respaldada por el equipo Qwen; el autor lo declara explícitamente.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia de uso en producción ni validación por terceros.
- Sin torre de visión: cualquier tarea multimodal del modelo base no está disponible en esta cuantización.
- Sin datos de benchmarks, contexto, idiomas oficiales ni arquitectura en la model card: difícil evaluar su idoneidad fuera del caso de uso declarado.
- Riesgo de alucinación: el propio autor mide "elementos inventados" en su comparativa, lo que confirma que el modelo puede fabricar acciones o decisiones en las notas; requiere validación o citas verificables.
- Idiomas: la lista oficial no está disponible; la cobertura verificada es limitada (inglés, hinglish, hindi, alemán) y no hay garantía para castellano.
- Licencia Apache-2.0: permite uso comercial, pero al ser una cuantización no oficial conviene conservar el aviso de copyright de Alibaba Cloud y verificar la licencia del modelo base.
- Cuantización Q4_K_M: introduce pérdida de precisión frente al modelo en f16; no se documenta la degradación medida.
- Fecha de creación futura en los metadatos (2026-11-27): conviene verificar la procedencia y la integridad del fichero con el SHA-256 publicado antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rzrmayur/Qwen3.5-2B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp (commit usado: `620d2225cc436ab0b001e3200e590e3b286ef9ab`)
