# Dhevenddra/geetha-tts

## Resumen

Geetha-tts es un adaptador LoRA sobre el modelo base `bodhan-ai/indic-speak`, desarrollado por el usuario Dhevenddra y especializado en síntesis de voz (text-to-speech) para tamil. El adaptador se publica como un repositorio PEFT de aproximadamente 0,7 GB y añade al modelo base dos voces concretas, denominadas `anitha` y `arun`, junto con control de emoción en seis categorías y la posibilidad de insertar una respiración audible al inicio de una frase mediante el token `[breath]`.

El modelo resuelve un problema específico: la disponibilidad de voces tamil abiertas y controlables para aplicaciones de producción, algo escaso en el ecosistema de TTS. Al construirse como un adaptador sobre Indic-Speak, hereda la arquitectura y el entrenamiento del modelo base de Bodhan AI, y requiere acceso al modelo base restringido (gated) para poder ejecutarse. El adaptador en sí ocupa poco espacio, lo que facilita su distribución y despliegue junto al modelo base.

La relevancia actual radica en su enfoque medido y reproducible: el autor publica un dataset de evaluación complementario con las transcripciones y el audio de sus pruebas, y declara explícitamente qué puede y qué no puede hacer el modelo. La licencia es la Indic Open Model License v1.0, la misma que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base `bodhan-ai/indic-speak` (arquitectura del base no disponible en la informacion proporcionada) |
| Parametros totales | No disponible (el repositorio del adaptador ocupa 0,7 GB; el recuento de parametros del base no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Tamil (`ta`) |
| Licencia | Indic Open Model License v1.0 (`other`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La informacion disponible indica que Geetha-tts es un adaptador LoRA entrenado mediante PEFT sobre el modelo `bodhan-ai/indic-speak`, un sistema de text-to-speech de Bodhan AI para lenguas indias. Los tags del repositorio incluyen `snac`, lo que sugiere el uso de un códec neural de audio SNAC en la cadena de síntesis, aunque la model card no detalla la arquitectura interna del modelo base ni la configuración exacta del entrenamiento.

No se especifican en la informacion proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor sí documenta que las evaluaciones se realizaron con semillas fijas y en una sola pasada, y publica el dataset `Dhevenddra/geetha-tts-eval` con las transcripciones y el audio correspondientes. Las capacidades añadidas por el adaptador son el control de dos voces, seis emociones (neutral, alegría, tristeza, enfado, miedo y asco) y la inserción de respiración audible.

## Capacidades

- Síntesis de voz en tamil con dos voces diferenciadas: `anitha` (femenina) y `arun` (masculina).
- Control de emoción en seis categorías: neutral, happy, sad, angry, afraid y disgusted.
- Inserción de respiración audible al inicio de una frase mediante el token `[breath]`.
- Pronunciación de números, fechas y símbolos monetarios (por ejemplo, `₹350` y `15/11/2026`) en los ejemplos publicados.
- Generación de pasajes largos con coherencia prosódica, según el ejemplo de texto extenso incluido en la model card.
- Reproducción en navegador a través de la demo alojada en geethalabs.com.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Atención al cliente automatizada en tamil: el modelo permite generar respuestas habladas con voz neutra o emocional según el contexto de la conversación, adecuado para líneas de soporte telefónico o asistentes de voz en centros de contacto.
- Anuncios y avisos públicos: la capacidad de leer números, fechas y precios con precisión (demostrada en los ejemplos) lo hace apto para sistemas de megafonía, avisos de transporte o información meteorológica automatizada.
- Audiolibros y narración de contenido largo: el ejemplo de pasaje extenso de la model card muestra que puede mantener prosodia coherente en párrafos de varias frases, útil para narración de artículos o ficción.
- Contenido de marketing y redes sociales: las seis emociones permiten ajustar el tono de un anuncio (entusiasta, serio, empático) sin cambiar de voz, lo que simplifica la producción de variantes de un mismo guion.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de accesibilidad en tamil, con dos voces para que el usuario elija la que prefiera.
- Doblaje y localización de vídeo: generación de pistas de voz en tamil para vídeos educativos o corporativos, con la opción de insertar respiraciones para un resultado más natural.
- Prototipado de asistentes conversacionales: al ser un adaptador ligero (0,7 GB) sobre un base accesible, permite iterar rápidamente en entornos de desarrollo antes de escalar a producción.

## Benchmarks y rendimiento

La model card menciona una evaluación propia con semillas fijas y una comparación con "los dos modelos tamil abiertos que pudimos ejecutar", pero el texto proporcionado se interrumpe en "304 Ta" y no incluye la tabla de resultados completa. No se han publicado en la informacion disponible cifras numéricas de benchmarks (MOS, WER, etc.) que puedan presentarse en una tabla.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,7 GB, pero requiere cargar el modelo base `bodhan-ai/indic-speak` (de acceso restringido) para la inferencia; el peso total dependerá del tamaño del base, que no se especifica en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible, al desconocerse el tamaño y la arquitectura del modelo base.
- GPU recomendadas: no disponible por la misma razón; en general, los sistemas TTS de este tipo suelen ejecutarse en GPU de gama media, pero no hay datos confirmados para este modelo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: la librería declarada es PEFT, por lo que el adaptador se carga junto al base mediante la API de PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje y no necesariamente a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card menciona una comparación con "los dos modelos tamil abiertos que pudimos ejecutar", pero no identifica sus nombres ni incluye los resultados en el fragmento disponible. Por tanto, no se puede construir una tabla comparativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Geetha-tts | No disponible (adaptador LoRA de 0,7 GB) | No disponible | Indic Open Model License v1.0 | Hugging Face (requiere base gated) |
| Alternativas tamil abiertas | No disponible | No disponible | No disponible | No disponible |

No disponible.

## Limitaciones y advertencias

- Solo soporta tamil (`ta`); no se documentan otros idiomas.
- Requiere acceso al modelo base restringido `bodhan-ai/indic-speak`, lo que añade una dependencia y un paso de solicitud de acceso para su uso.
- La licencia Indic Open Model License v1.0 es de tipo `other`; es imprescindible revisar sus términos antes de un uso comercial, ya que puede imponer restricciones adicionales.
- El autor advierte que los ejemplos de audio publicados son tomas seleccionadas (una a tres por frase) y que se omitieron las frases sin una toma satisfactoria; el rendimiento en producción puede ser inferior al de la muestra.
- No se documentan sesgos conocidos ni tasas de alucinación o errores de pronunciación más allá de la evaluación propia del autor.
- El repositorio tiene un número muy bajo de descargas (2) y ningún "like", lo que indica una validación externa limitada.
- Al ser un adaptador LoRA, su comportamiento está acoplado a la versión concreta del modelo base; cambios en el base pueden afectar a la calidad de la síntesis.
- No se dispone de información sobre latencia, throughput ni requisitos de VRAM, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dhevenddra/geetha-tts
- Modelo base: https://huggingface.co/bodhan-ai/indic-speak
- Dataset de evaluación: https://huggingface.co/datasets/Dhevenddra/geetha-tts-eval
- Repositorio de código: https://github.com/Dhevenddra/geetha-tts
- Demo en navegador: https://geethalabs.com
- Licencia: https://huggingface.co/Dhevenddra/geetha-tts/blob/main/Bodhan_AI_Open_Model_License.md
