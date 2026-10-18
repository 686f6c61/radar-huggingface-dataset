# Jinstudio/MOSS-TTSD-v0.5

## Resumen

MOSS-TTSD v0.5 es un modelo open source de síntesis de habla dialogada (text to spoken dialogue) publicado por el grupo MOSS (fnlp) en HuggingFace. Su función es convertir un guion de dos interlocutores, delimitado con etiquetas `[S1]` y `[S2]`, en audio conversacional expresivo con cambio de turno automático, clonación de voz zero-shot de los dos hablantes y soporte bilingüe chino-inglés. Esta ficha corresponde a la copia subida por el usuario `Jinstudio`; los pesos de referencia del autor figuran en `fnlp/MOSS-TTSD-v0.5`.

Técnicamente es un modelo de lenguaje generativo construido sobre `Qwen/Qwen3-1.7B-Base` (~1,7B parámetros) acoplado a un codec neuronal de audio semántico-acústico (`fnlp/XY_Tokenizer_TTSD_V0_hf`). El repositorio declara 2.049.551.360 parámetros (~2,05B) y 4,1 GB de pesos en safetensors. La combinación de un codec de baja tasa de bits con un entrenamiento orientado a secuencias largas le permite generar hasta 960 segundos de audio en una sola sesión, lo que lo sitúa en el terreno de la producción de podcasts y audiolibros dialogados.

Su interés actual radica en que cubre un nicho poco poblado: TTS conversacional de dos voces, de código abierto y con licencia Apache 2.0 que permite uso comercial. Frente a soluciones propietarias de doblaje y podcasting, ofrece clonación de voz sin entrenamiento adicional, aunque con una cobertura lingüística limitada a chino e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje decoder-only (`Qwen3-1.7B-Base`) + codec neuronal de audio semántico-acústico (`XY_Tokenizer_TTSD_V0`) |
| Parámetros totales | 2.049.551.360 (~2,05B) según safetensors del repositorio; el LLM base aporta ~1,7B |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible; la generación de audio está limitada a 960 s por sesión |
| Tipos de cuantización | no disponible; el repositorio solo distribuye pesos en safetensors, sin versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `custom_code` (requiere `trust_remote_code=True`) |
| Modelo base | Qwen/Qwen3-1.7B-Base (fine-tune) |
| Codec de audio | fnlp/XY_Tokenizer_TTSD_V0_hf (dependencia externa) |
| Frecuencia de muestreo de salida | 24.000 Hz |
| Tamaño del repositorio | 4,1 GB |
| Etiquetas de pipeline | text-to-speech, moss_ttsd |

## Arquitectura y entrenamiento

MOSS-TTSD sigue el esquema dominante en TTS neurálgico de última generación: un modelo de lenguaje preentrenado que predice tokens discretos de audio en lugar de texto, y un codec neuronal que convierte esos tokens en forma de onda. En este caso el LLM es un fine-tune de `Qwen3-1.7B-Base` y el codec es un tokenizador semántico-acústico unificado de baja tasa de bits, lo que reduce la longitud de secuencia necesaria para representar audio y habilita sesiones largas. La salida se decodifica a 24 kHz. El modelo se carga con `AutoModel`/`AutoProcessor` de Transformers mediante código remoto, y el processor devuelve directamente fragmentos de audio por hablante.

En cuanto a datos, la model card indica que el entrenamiento combina millones de horas de datos de TTS con 400.000 horas de habla conversacional sintética y real, e incluye optimizaciones específicas del framework de entrenamiento para generación de audio largo. No se detalla la composición exacta del dataset, el número de tokens de entrenamiento, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias: esa información no está disponible en el material consultado.

## Capacidades

- Síntesis de diálogo entre dos hablantes a partir de un guion con marcas de turno `[S1]` / `[S2]`, con cambio de voz automático y preciso.
- Clonación de voz zero-shot de dos interlocutores a partir de un audio de referencia compartido más su transcripción (`prompt_audio` y `prompt_text`).
- Generación de audio de larga duración: hasta 960 segundos en una única sesión de inferencia.
- Soporte bilingüe chino-inglés, incluyendo guiones que alternan ambos idiomas.
- Prosodia conversacional: el modelo está entrenado sobre habla espontánea, no solo lectura, y la model card destaca expresividad y naturalidad en los turnos.
- Salida de audio a 24 kHz y decodificación por fragmentos y por hablante.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente ni procesamiento de visión. Es un modelo especializado exclusivamente en audio de habla.

## Casos de uso

- Producción de podcasts con IA: el modelo convierte un guion de dos presentadores en un episodio completo con voces diferenciadas, y su ventana de generación de 960 s permite producir bloques de 16 minutos por inferencia, reduciendo el número de llamadas y el coste de ensamblaje.
- Audiolibros y ficción dialogada: para novelas con diálogo entre personajes, se clona una voz por personaje y se etiqueta el texto con `[S1]`/`[S2]`, manteniendo consistencia de timbre a lo largo del capítulo.
- Doblaje y localización zh↔en: al soportar ambos idiomas con el mismo modelo, se puede generar una versión inglesa de un guion chino manteniendo la caracterización vocal de los hablantes originales mediante clonación.
- Previsualización de guiones (script coverage): estudios y guionistas pueden escuchar un borrador interpretado antes de comprometer recursos de grabación, usando voces clonadas de referencia como aproximación.
- Formación y e-learning: generación de diálogos explicativos entre instructor y alumno, o simulaciones de entrevistas clínicas y de atención al cliente para entrenamiento, donde el realismo conversacional importa más que la latencia.
- Contenido de marketing y anuncios radiofónicos: creación de spots con dos voces y clonación de la voz de marca registrada, con licencia Apache 2.0 que permite uso comercial sin regalías.
- Accesibilidad: conversión de transcripciones de reuniones o entrevistas en audio dialogado para revisión, aprovechando el procesamiento por fragmentos que devuelve el processor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, SIM de similitud de hablante, ni comparaciones con otros sistemas), y la información de HuggingFace no aporta datos de evaluación cuantitativa.

## Requisitos de hardware

- Peso de los pesos en bf16: aproximadamente 4,1 GB, coherente con los 2,05B parámetros y el tamaño del repositorio.
- VRAM estimada para inferencia: en torno a 6-8 GB en bf16 para generaciones cortas; el consumo crece con la duración del audio porque la caché KV almacena tokens de audio, por lo que sesiones cercanas a los 960 s pueden requerir bastante más (estimación orientativa, no publicada por el autor).
- Hay que sumar la memoria del codec externo `fnlp/XY_Tokenizer_TTSD_V0_hf`, que se carga aparte.
- GPU consumer: cabe en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4090) para audio de duración moderada. En 8 GB el margen es escaso y depende de la longitud del guion.
- GPU de datacenter: A100 40/80 GB, H100, L40S y A10G son adecuadas para servir en producción o para lotes de audio largo.
- Despliegue: la vía documentada es Transformers con `trust_remote_code=True` y `device_map="auto"`, más el processor específico. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni LM Studio, dado que la arquitectura es personalizada (`moss_ttsd`) y depende de un codec externo.
- Latencia y throughput: no disponibles. Al ser un modelo autorregresivo sobre tokens de audio, el coste escala de forma aproximadamente lineal con la duración solicitada.

## Comparativa con modelos similares

| Modelo | Parámetros | Duración / contexto | Idiomas | Licencia | Diálogo entre hablantes |
|---|---|---|---|---|---|
| MOSS-TTSD v0.5 | ~2,05B | 960 s por sesión | zh, en | Apache 2.0 | Sí, con etiquetas `[S1]`/`[S2]` |
| Dia-1.6B (Nari Labs) | 1,6B | no disponible | en | Apache 2.0 | Sí |
| CosyVoice 2 (0.5B) | 0,5B | no disponible | zh, en | Apache 2.0 | No documentado; orientado a voz única |
| XTTS-v2 (Coqui) | no disponible | no disponible | multilingüe (17 idiomas) | CPML (no comercial) | No; voz única con clonación |

Nota: los datos de los modelos alternativos proceden de conocimiento general del ecosistema y no han sido verificados contra sus model cards en esta ficha; conviene contrastarlos antes de tomar una decisión. La ventaja diferencial de MOSS-TTSD es la combinación de diálogo nativo, clonación de dos voces, licencia permisiva y sesiones de hasta 960 s; su desventaja es la falta de cobertura de español y de métricas publicadas.

## Limitaciones y advertencias

- Cobertura lingüística reducida: solo chino e inglés. No hay soporte declarado de español ni de otras lenguas, por lo que no es apto para proyectos en castellano sin trabajo adicional.
- Ausencia total de benchmarks publicados: no hay MOS, WER ni métricas de similitud de hablante, así que la calidad expresiva solo puede evaluarse por prueba directa.
- Riesgo de alucinación auditiva: como todo TTS autorregresivo, puede producir pronunciaciones incorrectas, saltos de turno o artefactos, especialmente en guiones largos y en nombres propios o neologismos.
- Estabilidad en audio largo: el límite de 960 s está declarado, pero no se documenta la degradación de calidad dentro de esa ventana ni la consistencia de la voz entre fragmentos.
- Clonación de voz: implica riesgos legales y éticos (suplantación, deepfakes). Es necesario obtener consentimiento explícito de los hablantes y cumplir la normativa aplicable (RGPD, EU AI Act) antes de desplegarlo en producción.
- Seguridad del código: requiere `trust_remote_code=True`, lo que ejecuta código Python arbitrario del repositorio. Conviene auditar y fijar una revisión concreta antes de usarlo en entornos productivos.
- Procedencia del repositorio: esta ficha corresponde a `Jinstudio/MOSS-TTSD-v0.5`, con 0 descargas y 0 likes. Los pesos de referencia del autor están en `fnlp/MOSS-TTSD-v0.5`; verificar el origen y el hash de los ficheros antes de confiar en esta copia.
- Dependencia de un codec externo: `fnlp/XY_Tokenizer_TTSD_V0_hf` se distribuye por separado y su licencia y mantenimiento deben comprobarse de forma independiente a la Apache 2.0 del modelo principal.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero no incluye garantías ni indemnización por infracción de derechos de terceros derivada de voces clonadas.
- Sesgos no documentados: no hay información sobre la distribución demográfica, de acento o de género de los datos de entrenamiento, por lo que se desconoce el comportamiento en voces atípicas.
- Sin cuantizaciones ni integración en runtimes de inferencia habituales (vLLM, llama.cpp, Ollama), lo que limita el despliegue a Transformers y complica el escalado.

## Enlaces

- Modelo en HuggingFace (esta copia): https://huggingface.co/Jinstudio/MOSS-TTSD-v0.5
- Modelo oficial del autor: https://huggingface.co/fnlp/MOSS-TTSD-v0.5
- Codec de audio requerido: https://huggingface.co/fnlp/XY_Tokenizer_TTSD_V0_hf
- Modelo base del LLM: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
