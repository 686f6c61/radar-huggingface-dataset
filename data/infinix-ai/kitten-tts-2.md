# Infinix-ai/kitten-tts-2

## Resumen

KittenTTS 2 es un modelo de lenguaje del habla (speech language model) de 1.700 millones de parámetros desarrollado por Infinix-ai, diseñado para síntesis de voz con clonación en contexto. El modelo recibe texto y genera tokens del códec S3, que un vocodificador posterior convierte en audio a 24 kHz. Su propuesta diferencial es la combinación de clonación de voz a partir de muestras cortas (5-30 segundos de un único hablante) con un cuerpo transformer cuyos pesos lineales son ternarios, lo que permite empaquetar el modelo en menos de 1 GB sin pérdida de calidad respecto a la versión bf16.

El modelo se distribuye con 115 voces integradas, de las cuales 16 corresponden a idiomas con voz nombrada (árabe, chino, neerlandés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, turco e inglés). Incluye además controles de expresión en fase beta mediante etiquetas de emoción, eventos vocales y énfasis, que el modelo interpreta como marcado en lugar de leerlos en voz alta.

Es relevante ahora porque demuestra que la cuantización ternaria extrema (1,58 bits por peso en el cuerpo, manteniendo el embedding en bf16) puede aplicarse a un modelo de voz sin degradar la salida de audio de forma medible, y porque ofrece un decodificador destilado de un solo paso con pesos empaquetados a 4 bits que reduce el flujo del decodificador de 459 MB a 39 MB. La licencia es la Stellon Labs Community License, de tipo "other", lo que exige revisar los términos antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Speech language model transformer con pesos lineales ternarios; decodificador de flujo en dos etapas más vocodificador a 24 kHz |
| Parámetros totales | 1.733.487.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria 1,58 bits (packed, sin pérdida), TL2 con embedding 4 bits (emb4, con pérdida), bf16 (full); decodificador a 4 y 8 bits (student_w4) |
| Idiomas soportados | 16 con voz nombrada: árabe, chino, neerlandés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, turco e inglés |
| Licencia | stellon-labs-community-license (tipo "other", ver LICENSE.md) |
| Formato de pesos | safetensors (bf16 y ternario empaquetado), GGUF para fork de llama.cpp |

## Arquitectura y entrenamiento

El modelo se compone de un language model de 1.700 millones de parámetros que genera tokens del códec S3, seguido de un decodificador en dos etapas y un vocodificador que produce audio a 24 kHz. El cuerpo transformer emplea pesos lineales ternarios: dentro de cada grupo de 128 valores, cada peso es exactamente uno de {-escala, 0, +escala}, y el empaquetado almacena cinco trits por byte a 1,6 bits por peso, conservando la escala de cada grupo en precisión completa. Esta representación es exacta, no aproximada: `lm/model.safetensors` (3,47 GB en bf16) y `lm/model-ternary.safetensors` (0,95 GB) producen audio bit a bit idéntico. El embedding de tokens, con 324 millones de parámetros, no es ternario y permanece en bf16 en la variante `packed`.

La variante `emb4` reduce el peso en disco a 469 MB codificando el embedding a 4,21 bits por peso en tres niveles de frecuencia, con un error relativo L2 de 0,118 frente a la exportación bf16; los 313 tensores no pertenecientes al embedding siguen siendo bit-exactos. El decodificador opcional `student_w4` es un estudiante destilado de un solo paso con pesos a 4 bits que ocupa 39 MB frente a los 459 MB del decodificador por defecto; la cuantización reduce almacenamiento y ancho de banda de memoria, no el coste aritmético. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto con salida de audio a 24 kHz mediante códec S3 y vocodificador.
- Clonación de voz en contexto a partir de 5-30 segundos de audio de un único hablante.
- 115 voces integradas, incluidas las ocho originales de KittenTTS 0.8 (Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki y Leo) para compatibilidad hacia atrás.
- Soporte multilingüe en 16 idiomas mediante voces nombradas por idioma (`SpanishAbuela`, `JapaneseTrainConductor`, `RussianBabushka`, etc.).
- Control de emoción mediante etiqueta inicial: `[angry]`, `[contemplative]`, `[excited]`, `[joyful]`, `[mundane]`, `[nervous]`, `[sad]`, `[stern]`, `[surprised]`, `[tender]`.
- Eventos vocales en línea: `<gasp>`, `<giggle>`, `<growl>`, `<gulp>`, `<laugh>`, `<pause>`, `<scoff>`, `<sigh>`, `<sob>`, `<um>`.
- Énfasis sobre palabras o frases cortas mediante triple paréntesis: `(((palabra)))`.
- Presets de decodificación, como `preset="expressive"`.
- Desactivación del normalizador de texto con `normalize=False` para texto no inglés.
- Tool calling, function calling, razonamiento multi-paso, visión y audio de entrada: no disponible.

## Casos de uso

- **Locución de contenido editorial y podcasts**: el modelo genera narración a 24 kHz con control de emoción y énfasis, lo que permite producir versiones de un mismo guion con tono `[joyful]` o `[contemplative]` sin regrabar. El preset `expressive` añade variación de entrega sobre una voz fija.
- **Clonación de voz para accesibilidad**: a partir de 5-30 segundos de audio de un hablante se puede construir una voz personalizada para personas con pérdida de habla, usando `reference="mi_voz.wav"` y el modelo de embedding de hablante incluido en `speaker/`.
- **Doblaje y localización multilingüe**: las voces nombradas por idioma permiten generar la misma línea en español (`SpanishAbuela`), alemán (`German`) o japonés (`JapaneseTrainConductor`), pasando `normalize=False` para evitar que el normalizador inglés altere números y fechas.
- **Asistentes de voz para atención al cliente**: la clonación en contexto permite desplegar una voz de marca consistente en flujos conversacionales, con eventos como `<pause>` y `<sigh>` para naturalizar turnos y evitar una cadencia robótica.
- **Audiolibros y narración larga**: la combinación de voz fija, control de emoción por línea y énfasis selectivo permite segmentar un texto en líneas y asignar a cada una una emoción, manteniendo la coherencia tímbrica del narrador entre capítulos.
- **Prototipado de interfaces de voz en desarrollo**: el paquete `kittenml` expone `generate`, `available_voices`, `available_weights` y `sample_rate`, lo que permite integrar la síntesis en un pipeline de pruebas con `soundfile` sin infraestructura adicional.
- **Despliegue en CPU y entornos con poca memoria**: la variante `packed` (954 MB) y el decodificador `student_w4` (39 MB) permiten ejecutar el modelo en máquinas sin GPU dedicada mediante los pesos GGUF del fork de llama.cpp incluidos en `cpp/`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Como referencia de huella en disco, la variante `packed` ocupa 954 MB (910 MiB de language model más 37 MiB de decodificador), `emb4` ocupa 469 MB y `full` ocupa 3.469 MB. La carga descarga solo la variante solicitada y solo el decodificador elegido.
- **GPU recomendadas**: no disponible. El modelo no especifica requisitos de GPU en la información proporcionada.
- **Compatibilidad con GPU de consumo**: no confirmada. La existencia de pesos GGUF para un fork de llama.cpp y de una variante ternaria de menos de 1 GB sugiere viabilidad en hardware limitado, pero no se aportan cifras de VRAM ni de GPU concretas.
- **Opciones de despliegue**: paquete Python `kittenml` (`pip install kittenml`), pesos safetensors para carga directa y pesos GGUF en `cpp/` para el fork de llama.cpp. vLLM, Ollama y TGI no se mencionan en la información disponible.
- **Latencia y throughput**: no disponible. La model card indica que la cuantización del decodificador reduce almacenamiento y ancho de banda de memoria, no el coste aritmético, por lo que no cabe esperar aceleración por ese cambio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| KittenTTS 2 (Infinix-ai) | 1.733 M | no disponible | 16 | stellon-labs-community-license | safetensors, GGUF |
| KittenTTS 0.8 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con KittenTTS 0.8, del que se sabe que comparte las ocho voces originales (Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki y Leo) y que mantiene compatibilidad de código con la versión 2, pero no se detallan sus parámetros, contexto ni licencia. No se dispone de datos de benchmarks ni de especificaciones de otros modelos de texto a voz comparables en la información disponible.

## Limitaciones y advertencias

- **Licencia restrictiva**: la Stellon Labs Community License es de tipo "other"; es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial, redistribución o despliegue en producto.
- **Normalizador de texto ajustado al inglés**: para texto no inglés debe pasarse `normalize=False`, ya que en caso contrario el normalizador altera números y fechas de otros idiomas.
- **Control de emoción en fase beta**: la propia model card advierte de que el control emocional orienta la entrega en lugar de garantizarla, y que el efecto varía según la voz y la frase.
- **Conjunto cerrado de etiquetas**: solo se reconocen veinte etiquetas (diez emociones, diez eventos vocales). Cualquier otra, como `[reverent]` o texto entre corchetes como `section [3]` o `x < 5`, se pronuncia como texto normal.
- **Pérdida en la variante `emb4`**: el embedding de la variante de 469 MB presenta un error relativo L2 de 0,118 frente a bf16; es la única parte con pérdida y el motivo por el que `packed` sigue siendo la opción por defecto.
- **Riesgo de clonación fraudulenta**: la clonación de voz a partir de 5-30 segundos de audio habilita suplantaciones; no se documentan en la información disponible mecanismos de marca de agua, detección de voz sintética ni restricciones de uso para voces de terceros.
- **Sesgos**: no se documenta en la información disponible ningún análisis de sesgos por idioma, género o acento en las 115 voces.
- **Riesgo de alucinación en la salida de audio**: no se documenta el comportamiento del modelo ante texto ambiguo, fuera de distribución o con caracteres no latinos.
- **Idiomas no verificados**: la lista de 16 idiomas corresponde a los que tienen voz nombrada, pero no se especifica el nivel de calidad por idioma ni la cobertura del vocabulario.
- **Datos de entrenamiento opacos**: no se publica el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO, lo que dificulta evaluar la procedencia de las voces y del estilo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-ai/kitten-tts-2
- Repositorio referenciado en la model card: https://huggingface.co/KittenML/kitten-tts-2
- Licencia: LICENSE.md en el repositorio del modelo (https://huggingface.co/Infinix-ai/kitten-tts-2/blob/main/LICENSE.md)
- Paquete Python: `pip install kittenml`
- Pesos GGUF para llama.cpp: directorio `cpp/` del repositorio
- Papers, blogs, repos y demos adicionales: no disponible
