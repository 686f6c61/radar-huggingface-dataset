# Infinix-io/kitten-tts-2

## Resumen

KittenTTS 2 es un modelo de lenguaje aplicado a síntesis de voz (text-to-speech) de 1.733 millones de parámetros, desarrollado por Infinix-io y publicado bajo la marca KittenML. El modelo lee texto y genera tokens del códec S3, que un vocodificador posterior convierte en audio a 24 kHz. Su rasgo más distintivo es el clonado de voz en contexto: a partir de una muestra de 5 a 30 segundos de un único hablante, el modelo reproduce esa voz sin necesidad de un entrenamiento específico para el hablante.

La arquitectura combina un modelo de lenguaje autorregresivo sobre tokens de audio con una cabeza de proyección de hablante (`spk_proj`) y un decodificador en dos etapas, la primera de las cuales puede sustituirse por un estudiante destilado de un solo paso. Los pesos lineales del modelo de lenguaje son ternarios (valores en {-escala, 0, +escala} por grupo de 128), lo que permite un empaquetado de 1,58 bits por peso que reproduce el modelo completo de forma bit a bit.

El modelo es relevante ahora porque ofrece clonado de voz multilingüe en 16 idiomas con un peso en disco de menos de 1 GB en su variante por defecto, lo que lo hace desplegable en entornos con recursos limitados, incluida inferencia en CPU mediante un fork de llama.cpp con pesos GGUF. La licencia es propietaria (Stellon Labs Community License), un punto que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje autorregresivo sobre tokens de códec S3, con cabeza de hablante (`spk_proj`) y decodificador de audio en dos etapas |
| Parámetros totales | 1.733.487.616 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria empaquetada a 1,58 bits por peso (variante `packed`), cuerpo ternario con embedding a 4 bits (variante `emb4`), bf16 completo (variante `full`); decodificador destilado empaquetado a 4 y 8 bits |
| Idiomas soportados | 16 idiomas con voz con nombre: árabe, chino, neerlandés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, turco e inglés |
| Licencia | Stellon Labs Community License (propietaria, `license: other`) |
| Formato de pesos | safetensors (bf16 y ternario empaquetado), GGUF para el fork de llama.cpp |

## Arquitectura y entrenamiento

El modelo se estructura en cuatro componentes: el modelo de lenguaje de voz (`lm/`), la cabeza de proyección de hablante (`spk_proj`), el modelo de embeddings de hablante usado en el clonado (`speaker/`) y el decodificador de audio. El modelo de lenguaje genera tokens del códec S3, que el decodificador transforma en audio a 24 kHz. El decodificador opera en dos etapas y la primera puede sustituirse por un estudiante destilado de un solo paso (`student_w4`, 39 MB frente a los 459 MB del decodificador por defecto), que intercambia fidelidad por huella de almacenamiento, no por velocidad.

La innovación técnica principal es la representación ternaria de los pesos lineales: dentro de cada grupo de 128 valores, cada peso es exactamente -escala, 0 o +escala, y el empaquetado almacena cinco trits por byte (1,6 bits por peso) conservando la escala de cada grupo a precisión completa. El empaquetado es exacto, de modo que `lm/model-ternary.safetensors` (0,95 GB) y `lm/model.safetensors` (3,47 GB en bf16) producen audio idéntico bit a bit. La variante `emb4` va más allá: mantiene el cuerpo del transformer bit a bit idéntico al completo (los 313 tensores no pertenecientes al embedding son exactos) pero codifica el embedding de 324M parámetros a 4,21 bits por peso en tres niveles de frecuencia, con un error relativo L2 de 0,118 frente a la exportación bf16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que las veinte etiquetas de expresión reconocidas son las más comunes entre las muchas presentes en los datos de entrenamiento.

## Capacidades

- Síntesis de voz a partir de texto con salida de audio a 24 kHz.
- Clonado de voz en contexto a partir de 5 a 30 segundos de audio de un único hablante.
- 115 voces integradas, incluidas ocho (Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki y Leo) que coinciden con los hablantes de KittenTTS 0.8.
- Soporte de 16 idiomas mediante voces con nombre por idioma (`SpanishAbuela`, `JapaneseTrainConductor`, `RussianBabushka`, etc.).
- Control de expresión en fase beta: diez etiquetas de emoción al inicio de línea (`[angry]`, `[contemplative]`, `[excited]`, `[joyful]`, `[mundane]`, `[nervous]`, `[sad]`, `[stern]`, `[surprised]`, `[tender]`).
- Eventos vocales en línea: `<gasp>`, `<giggle>`, `<growl>`, `<gulp>`, `<laugh>`, `<pause>`, `<scoff>`, `<sigh>`, `<sob>`, `<um>`.
- Énfasis mediante triple paréntesis sobre palabras o frases cortas: `(((never)))`.
- Presets de decodificación, como `preset="expressive"`.
- Normalización de texto desactivable (`normalize=False`) para texto no inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; el modelo está especializado en síntesis de voz.

## Casos de uso

- Audiolibros y narración automatizada: el modelo convierte texto largo en audio a 24 kHz con voces integradas y control de emoción por línea, lo que permite alternar narrador y diálogo con etiquetas `[tender]` o `[excited]` sin intervención manual.
- Clonado de la voz del propio usuario para asistentes personales: con una muestra de 5 a 30 segundos se obtiene una voz consistente para respuestas habladas, útil en aplicaciones de accesibilidad para personas con pérdida de voz.
- Localización de contenido a 16 idiomas: las voces por idioma (`German`, `SpanishAbuela`, `JapaneseTrainConductor`) permiten generar pistas de audio dobladas manteniendo el acento nativo, con `normalize=False` para preservar números y fechas.
- Atención al cliente con voz sintética: el modelo genera respuestas habladas con eventos vocales (`<sigh>`, `<pause>`) que aportan naturalidad conversacional en sistemas de IVR o asistentes telefónicos.
- Producción de pódcast y contenido corto: los eventos `<laugh>`, `<giggle>` y `<gasp>` insertados en línea permiten generar intervenciones expresivas sin grabación, y el preset `expressive` aumenta la variación de entonación.
- Despliegue en dispositivos con recursos limitados: la variante `emb4` (469 MB) y el decodificador `student_w4` (39 MB) permiten ejecutar el modelo en máquinas sin GPU dedicada, incluida inferencia en CPU mediante los pesos GGUF del fork de llama.cpp.
- Prototipado de interfaces de voz: la API de Python (`kittenml`) con `m.generate()` y `m.available_voices` facilita iterar sobre guiones y voces antes de integrar el modelo en un producto final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el peso del modelo de lenguaje es de 910 MiB y el decodificador por defecto de 37 MiB, lo que sugiere un requisito de memoria moderado, pero no se documenta la VRAM total necesaria con activaciones.
- Variantes de peso en disco: `packed` 954 MB (por defecto, sin pérdida), `emb4` 469 MB (con pérdida en el embedding), `full` 3469 MB (bf16).
- Decodificadores: `default` 459 MB (mejor calidad) y `student_w4` 39 MB (destilado, 4 bits).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no se documenta explícitamente, pero el tamaño reducido de los pesos y la existencia de pesos GGUF para CPU sugieren que cabe en GPU de consumo; no se especifican modelos concretos.
- Opciones de despliegue: paquete `kittenml` (Python), fork de llama.cpp con pesos GGUF para CPU, y endpoints compatibles según los tags de Hugging Face.
- Latencia y throughput: no disponibles. La model card indica que la cuantización reduce almacenamiento y ancho de banda de memoria, no el cómputo aritmético.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Clonado de voz |
|---|---|---|---|---|---|
| KittenTTS 2 | 1.733M | No disponible | 16 | Stellon Labs Community License (propietaria) | Sí, en contexto (5-30 s) |
| KittenTTS 0.8 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas de TTS open source | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia Stellon Labs Community License es propietaria y no equivale a una licencia open source; es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial.
- El control de emoción está marcado como beta: el efecto varía según la voz y la frase, y no garantiza la entrega emocional solicitada.
- Solo se reconocen veinte etiquetas; cualquier otra etiqueta entre corchetes, como `[reverent]` o `section [3]`, se pronuncia como texto normal.
- El normalizador de texto está ajustado al inglés y corrompe números y fechas en otros idiomas; es obligatorio usar `normalize=False` para texto no inglés.
- La variante `emb4` introduce pérdida en el embedding (error relativo L2 de 0,118), por lo que la variante `packed` se mantiene como predeterminada.
- Riesgo de alucinación y artefactos de pronunciación no documentado explícitamente; no se dispone de evaluaciones publicadas de fidelidad o inteligibilidad.
- No se documentan sesgos de género, acento o idioma en las voces integradas.
- No se especifica la longitud máxima de texto de entrada ni el contexto del modelo de lenguaje, lo que limita la planificación de cargas de trabajo con textos largos.
- El clonado de voz plantea riesgos de suplantación de identidad y requiere consentimiento explícito del hablante cuya muestra se utilice.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/kitten-tts-2
- Repositorio del modelo referenciado en la model card: https://huggingface.co/KittenML/kitten-tts-2
- Paquete Python: `pip install kittenml`
- Licencia: `LICENSE.md` en el repositorio del modelo
