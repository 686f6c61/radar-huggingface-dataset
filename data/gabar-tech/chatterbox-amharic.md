# gabar-tech/chatterbox-amharic

## Resumen

Chatterbox Amharic es un adaptador LoRA desarrollado por gabar-tech que enseña al modelo de síntesis de voz Chatterbox Multilingual v3 de Resemble AI a hablar amhárico, idioma etíope que el modelo original no puede leer en absoluto: su tokenizador mapea todos los caracteres Ge'ez a `[UNK]`. El adaptador añade 244 tokens para el alfabeto Ge'ez y entrena al modelo para asociarlos con sus correspondientes sonidos, permitiendo además clonación de voz a partir de unos diez segundos de audio de referencia. Se distribuye bajo licencia CC-BY-SA-4.0 y pesa unos 194 MB en formato safetensors.

El proyecto resuelve un problema concreto de accesibilidad: la mayoría de los sistemas TTS comerciales ignoran lenguas de bajos recursos como el amhárico. Al ser un adaptador sobre un modelo base MIT, no requiere redistribuir los pesos completos, solo el delta de entrenamiento. Incluye además un normalizador de texto amhárico (`amharic_text.py`) que convierte numerales, porcentajes, horas y abreviaturas a su forma hablada, garantizando consistencia entre entrenamiento e inferencia.

La relevancia actual radica en que ofrece una vía práctica para incorporar amhárico a aplicaciones de voz sin necesidad de entrenar un modelo completo desde cero, y sirve como referencia metodológica para extender otros TTS multilingües a lenguas con alfabetos no latinos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Chatterbox Multilingual v3 (Resemble AI), con embeddings de rango completo para 244 tokens nuevos y tokenizador extendido |
| Parametros totales | no disponible (el adaptador pesa 194 MB; el modelo base no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto textual largo) |
| Tipos de cuantizacion | no disponible (adaptador LoRA, no se cuantiza de forma estándar) |
| Idiomas soportados | am (amhárico) exclusivamente en el adaptador; el modelo base es multilingüe |
| Licencia | CC-BY-SA-4.0 (adaptador); MIT (modelo base) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer T3 text-to-speech-token de Chatterbox Multilingual v3, un modelo de síntesis de voz de Resemble AI con licencia MIT. La intervención consiste en dos componentes: pesos LoRA sobre las capas del transformer y embeddings de rango completo para los 244 tokens nuevos correspondientes a caracteres Ge'ez. El tokenizador original no contiene ningún carácter Ge'ez, por lo que todos se marcaban como desconocidos; la extensión añade esos tokens y el entrenamiento les asigna representaciones acústicas válidas.

El entrenamiento se realizó sobre habla propia o con licencia explícita, utilizando los datasets `google/WaxalNLP` y `mozilla-foundation/common_voice_25_0`. El normalizador de texto `amharic_text.py` se usó tanto para generar las etiquetas de entrenamiento como en la inferencia, asegurando coherencia. Incluye conversión de numerales Ge'ez, dígitos, decimales, porcentajes y horas a palabras, expansión de unas cien abreviaturas comunes (conservando sufijos flexivos como en `መ/ቤቱ` → `መሥሪያ ቤቱ`) y colapso de cuatro familias de consonantes que se escriben de varias formas pero se pronuncian igual (ሐ, ኀ, ኅ, etc.). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado sobre pares texto-audio.

## Capacidades

- Síntesis de voz en amhárico con pronunciación correcta de caracteres Ge'ez, incluyendo ejectives (ቡ, ጅ) y entonación interrogativa.
- Clonación de voz zero-shot a partir de unos diez segundos de audio de referencia.
- Manejo de puntuación amhárica (፥) y abreviaturas comunes como `ዶ/ር` (doctor) o `ዓ.ም.` (año de misericordia).
- Normalización de texto integrada: números, fechas, porcentajes y horas se convierten automáticamente a su forma hablada.
- Generación de voz con control de temperatura y peso de clasifier-free guidance (valores típicos usados: `temperature=0.6`, `cfg_weight=0.5`).
- No soporta tool calling ni razonamiento multi-paso; es un modelo TTS puro.

## Casos de uso

- Accesibilidad para hablantes de amhárico: conversión de texto digital (noticias, libros, documentos) a audio para personas con discapacidad visual o dificultades de lectura.
- Asistentes de voz en etíope: integración en aplicaciones móviles o dispositivos domésticos que necesiten responder en amhárico con una voz natural y clonable.
- Audioguías y contenido educativo: generación de material de estudio en amhárico a partir de textos escritos, con la posibilidad de usar una voz de referencia consistente.
- Servicios de atención al cliente: lectura automática de respuestas o confirmaciones en amhárico dentro de sistemas IVR, usando una voz clonada del agente o una voz neutra.
- Producción de contenido multimedia: locución para vídeos, podcasts o anuncios en amhárico sin necesidad de contratar actores de voz, gracias a la clonación con pocos segundos de muestra.
- Investigación en TTS de bajos recursos: el adaptador y el normalizador sirven como base para experimentos con otras lenguas etíopes (aunque el propio modelo solo cubre amhárico) o para estudiar la extensión de tokenizadores a alfabetos no latinos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye demostraciones auditivas comparativas entre el modelo base sin adaptador y con el adaptador, pero no métricas objetivas como MOS (Mean Opinion Score) ni tasas de error. No se dispone de datos cuantitativos de rendimiento frente a otros sistemas TTS amháricos.

## Requisitos de hardware

- El adaptador en sí es ligero (194 MB), pero requiere cargar el modelo base Chatterbox Multilingual v3 completo, cuyos requisitos no se especifican en la documentación disponible.
- No se indica VRAM mínima ni GPUs recomendadas para el adaptador.
- Dado que el adaptador es un delta sobre un modelo base, se puede aplicar sobre cualquier despliegue que soporte Chatterbox (por ejemplo, la implementación de referencia de Resemble AI).
- No se mencionan opciones de despliegue específicas como vLLM u Ollama; al ser un modelo TTS, se usa típicamente con la librería de Resemble AI o Hugging Face Transformers.
- La latencia y el throughput dependen del hardware y del modelo base; no hay estimaciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| gabar-tech/chatterbox-amharic | Adaptador LoRA sobre Chatterbox v3 | amhárico | CC-BY-SA-4.0 (adaptador) | Clonación de voz, normalizador incluido |
| Diakonrobel/Amharic_chatterbox-TTS | Sistema TTS completo basado en Chatterbox | amhárico + inglés | no disponible | En fase de desarrollo/entrenamiento, incluye G2P y tokenizer extendido |
| Abyssinica AI | Modelo conversacional para lenguas africanas | amhárico y otros | propietario | Producto comercial con traductor y síntesis de voz |
| Addis AI | Infraestructura de voz para lenguas africanas | amhárico, afaan oromo | propietario | APIs de TTS y STT comerciales |

La comparativa es limitada porque no hay datos objetivos de calidad de voz entre estos sistemas. El adaptador de gabar-tech destaca por ser abierto y ligero, mientras que los otros son proyectos más amplios o comerciales.

## Limitaciones y advertencias

- El adaptador solo cubre amhárico; aunque Tigrinya y Ge'ez usan el mismo alfabeto, el modelo no ha sido entrenado con esos idiomas y los "leerá" con pronunciación amhárica, lo que puede producir resultados incorrectos.
- No es un modelo independiente: requiere descargar el modelo base Chatterbox Multilingual v3 de Resemble AI por separado.
- La licencia CC-BY-SA-4.0 del adaptador implica que cualquier obra derivada debe distribuirse bajo la misma licencia, lo que puede afectar a proyectos comerciales que quieran integrarlo.
- El normalizador de texto tiene una corrección posterior al entrenamiento (relativa a abreviaturas con punto final en medio de frase), lo que puede causar pequeñas diferencias entre los datos de entrenamiento y la inferencia actual.
- No se han publicado evaluaciones de sesgos ni de robustez ante acentos, ruido o variaciones dialectales del amhárico.
- La calidad de la clonación de voz depende de la calidad y duración del audio de referencia; con menos de diez segundos el resultado puede degradarse.
- No hay garantías de rendimiento en producción; la model card indica explícitamente que no es un servicio de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabar-tech/chatterbox-amharic
- Modelo base Chatterbox de Resemble AI: https://huggingface.co/ResembleAI/chatterbox
- Página de Resemble AI sobre Chatterbox: https://www.resemble.ai/learn/models/chatterbox
- Proyecto similar (Diakonrobel/Amharic_chatterbox-TTS): https://github.com/Diakonrobel/Amharic_chatterbox-TTS
