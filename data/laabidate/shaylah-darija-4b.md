# laabidate/shaylah-darija-4b

## Resumen

Shaylah (شايلاه) es un modelo conversacional especializado en darija marroquí (árabe dialectal de Marruecos), desarrollado por Oussama Laabidate como parte de un proyecto de arte y diseño en la ENSAD de Casablanca. No es un modelo de propósito general: se trata de la voz de un personaje ficticio, el faqir (custodio de un santuario), dentro de una instalación artística interactiva en la que los visitantes conversan en darija. El modelo responde con frases cortas y cálidas sobre cultura popular marroquí: santuarios y rituales de visita, música espiritual (Gnawa, Jilala, Issawa, Hamadsha, Aita), patrimonio (zellige, khaima, medinas, astronomía popular) y la propia lengua darija.

Técnicamente, Shaylah no es un modelo independiente sino un adaptador LoRA entrenado con QLoRA (r=16, alpha=32) sobre una base de unos 4.000 millones de parámetros (el nombre "4b" lo indica, aunque la base concreta no se especifica en la model card). Se entrenó con aproximadamente 1.800 pares de instrucción/respuesta curados a mano. Su relevancia radica en la escasez de modelos especializados en darija, una lengua con poca representación en los grandes modelos, y en su enfoque cuidadoso: los contenidos se presentan como creencias antropológicas, nunca como hechos ni instrucciones, y añade avisos de seguridad en temas de salud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo causal de lenguaje base (transformer); base no especificada |
| Parametros totales | Base de ~4.000 millones (según el nombre del modelo); no disponible el detalle exacto |
| Parametros activos | no disponible (no consta si la base es MoE; lo habitual es que sea densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 en 4 bits (vía BitsAndBytes) para carga en GPU modestas; FP16 para uso general |
| Idiomas soportados | Darija marroquí en escritura arábiga (árabe); el árabe formal y otras lenguas quedan fuera del alcance |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador de ~65 MB); requiere PEFT para cargarlo junto a la base |

## Arquitectura y entrenamiento

Shaylah es un adaptador PEFT (LoRA con rango 16 y alpha 32) entrenado mediante QLoRA sobre un modelo base de aproximadamente 4.000 millones de parámetros. La model card no nombra la base, pero indica que el adaptador se carga junto a sus pesos base a través de la configuración del adaptador (`adapter_config.json`), de modo que `AutoPeftModelForCausalLM` resuelve la base automáticamente. El adaptador pesa unos 65 MB, tamaño coherente con un LoRA de rango 16 sobre un modelo de ese calibre.

El entrenamiento se realizó con unos 1.800 pares de instrucción/respuesta en darija marroquí, curados manualmente. Los datos cubren cuatro dominios: cultura popular de santuarios, música espiritual marroquí, patrimonio marroquí y darija general (incluida su mezcla con francés y Arabizi). Los textos fuente largos se reescribieron como pares cortos de pregunta/respuesta en la voz del faqir, se eliminaron duplicados y se añadieron frases de seguridad a los pares relacionados con salud. El modelo se entrenó en intercambios de un solo turno, por lo que no mantiene memoria conversacional multturno en esta versión. Los autores recomiendan una revisión humana adicional antes de cualquier instalación pública real.

## Capacidades

- Conversación en darija marroquí escrita en alfabeto árabe, con respuestas breves y en la voz del faqir (no redacta ensayos ni da sermones).
- Conocimiento de santuarios marroquíes y rituales de visita: quién son los santos, cómo es una visita y sus costumbres.
- Conocimiento de música espiritual marroquí: Gnawa y la noche de lila, Jilala, Issawa, Hamadsha y Aita, incluyendo diferencias entre tradiciones.
- Conocimiento de patrimonio marroquí: zellige, tiendas (khaima/qaitoun), ciudades antiguas, historia y astronomía popular.
- Manejo del léxico darija: términos cotidianos, antiguos y recientes, y su mezcla con francés y Arabizi.
- Manejo de la incertidumbre: cuando un vínculo entre costumbres no está confirmado o una tradición varía por ciudad, lo declara en lugar de inventar una respuesta.
- Plantilla de chat incluida (`chat_template.jinja`), compatible con `apply_chat_template` de transformers.
- Capacidades fuera de alcance: no da diagnósticos médicos, ni dictámenes religiosos, ni instrucciones de magia o prácticas peligrosas; no soporta memoria multturno en esta versión.

## Casos de uso

- Instalación artística interactiva: el propósito original del proyecto es un pequeño santuario con un teléfono en su interior donde los visitantes hablan y escuchan respuestas en darija; el modelo es adecuado por su estilo breve, su voz de personaje y su bajo coste de inferencia (adaptador de 65 MB sobre una base de 4B).
- Investigación sobre darija marroquí: sirve como punto de partida para estudiar la generación de texto dialectal en una lengua poco representada, y como caso de uso documentado de fine-tuning con QLoRA sobre datos dialectales curados.
- Exploración cultural y educativa: puede usarse como herramienta de consulta sobre rituales de santuarios, música Gnawa, Jilala, Issawa o Aita, siempre tratando las respuestas como material cultural y no como hechos verificados.
- Prototipado de asistentes dialectales: la combinación de adaptador ligero, plantilla de chat y cuantización 4 bits permite montar rápidamente demostraciones de agentes conversacionales en darija sobre hardware modesto.
- Preservación de patrimonio inmaterial: el enfoque de convertir ficheros de conocimiento folk en pares de instrucción/respuesta es un patrón replicable para documentar tradiciones orales en otras lenguas minorizadas.
- Referencia para proyectos de arte con IA: la serie prevista de siete santuarios (Bouya Omar, Sidi Ali Ben Hamdouch, Sidi Ben Issa, Moulay Brahim, Sidi Shmahroush, Lalla Aicha Al Bahriya y Sidi Ahmed Tijani) muestra un marco para crear voces de personaje con límites de seguridad explícitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con el adaptador de 65 MB sobre una base de ~4B de parámetros, en FP16 se necesita del orden de 8-10 GB de VRAM; en 4 bits con NF4 (BitsAndBytes) el consumo baja a unos 3-5 GB. Son estimaciones basadas en el tamaño de la base, no datos publicados.
- GPU recomendadas: cualquier GPU moderna de gama media es suficiente en 4 bits (RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090 sobrada); en FP16, GPUs con 12 GB o más (RTX 4090, A10G, A100).
- Cabe en GPUs de consumo: sí, especialmente en 4 bits; la propia model card incluye un ejemplo de carga cuantizada "on a small GPU".
- Opciones de despliegue: transformers junto a peft (vía `AutoPeftModelForCausalLM`), que es el método documentado. No hay evidencia de compatibilidad publicada con vLLM, llama.cpp, Ollama o TGI, ya que se trata de un adaptador PEFT y no se distribuyen pesos GGUF fusionados.
- Latencia y throughput: no disponible. Al tratarse de un modelo de ~4B con respuestas cortas (max_new_tokens de 80 en el ejemplo), la latencia esperable en GPU de consumo es baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No existen muchos modelos públicos especializados en darija marroquí; la comparación es orientativa y se basa en categorías, no en benchmarks publicados para Shaylah.

| Modelo | Tipo | Tamano | Idioma objetivo | Licencia |
|---|---|---|---|---|
| laabidate/shaylah-darija-4b | Adaptador LoRA especializado en darija y cultura folk marroquí | ~4B (base) + 65 MB de adaptador | Darija marroquí (escritura arábiga) | Apache 2.0 |
| Atlas-Chat (Google DeepMind / UM6P) | Modelo conversacional propio para darija | 2B / 8B / 9B | Darija marroquí | Restringida (gemma) |
| Modelos generales multilingües (Qwen, Gemma, Llama) | Modelos de propósito general con algo de árabe dialectal | 2B-70B+ | Árabe estándar, darija limitada | Variadas |

La diferencia clave es el enfoque: Shaylah es un proyecto artístico con dominio estrecho y voz de personaje, mientras que Atlas-Chat es un asistente general en darija. Para conversación dialectal de propósito general, Atlas-Chat es más completo; para una voz cultural concreta con requisitos de hardware mínimos, Shaylah es más ligero y abierto (Apache 2.0).

## Limitaciones y advertencias

- Riesgo de alucinación reconocido explícitamente por los autores: las respuestas deben tratarse como una voz cultural, no como hechos verificados.
- Entrenado con solo ~1.800 pares y en intercambios de un solo turno: no mantiene memoria multturno y su cobertura es limitada; los propios autores recomiendan revisión humana antes de una instalación pública.
- Alcance lingüístico estricto: solo darija marroquí en escritura arábiga; el árabe formal, el francés u otras lenguas están fuera de alcance y probablemente produzcan resultados pobres.
- Restricciones de contenido por diseño: no diagnostica ni trata enfermedades, no emite dictámenes religiosos, no da instrucciones de prácticas mágicas o peligrosas; en temas de salud añade un aviso fijo en darija. Usarlo para guía médica o religiosa está fuera del uso previsto.
- Los contenidos folk se presentan como creencias; algunas conexiones entre costumbres no están confirmadas y algunas tradiciones varían entre ciudades y escuelas.
- No es un modelo autónomo: requiere descargar además el modelo base a través de la configuración del adaptador, lo que añade una dependencia externa no documentada en el repositorio.
- Métricas de adopción prácticamente nulas (0 descargas, 1 like en el momento de la ficha) y sin benchmarks publicados: no hay evidencia externa de calidad ni robustez.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/laabidate/shaylah-darija-4b
- No se han encontrado enlaces adicionales (papers, blogs, demos) en la informacion disponible.
