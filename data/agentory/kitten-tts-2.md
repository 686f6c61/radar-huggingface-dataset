# agentory/kitten-tts-2

## Resumen

KittenTTS 2 es un modelo de texto a voz (TTS) desarrollado por agentory que combina un modelo de lenguaje de 1.700 millones de parámetros con un códec de audio S3 y un vocodificador para generar audio a 24 kHz. A diferencia de los sistemas TTS clásicos, el modelo trata la síntesis como una tarea de modelado de lenguaje: recibe texto y emite tokens del códec, que después se decodifican en dos etapas. Su rasgo más distintivo es el clonado de voz en contexto, que permite replicar una voz a partir de entre 5 y 30 segundos de audio de un único hablante.

El modelo se distribuye con 115 voces integradas y cubre 16 idiomas mediante voces con acento nativo (árabe, chino, neerlandés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, turco e inglés). Incorpora además controles de expresión en fase beta: etiquetas de emoción, eventos vocales en línea y marcas de énfasis que el modelo interpreta como marcado y no pronuncia.

Una de sus innovaciones más relevantes es la cuantización ternaria del cuerpo del transformer: los pesos lineales se empaquetan a 1,58 bits por peso manteniendo el resultado bit a bit idéntico al modelo en bf16. Esto reduce el modelo de lenguaje de 3,47 GB a 0,95 GB sin pérdida de calidad, lo que lo hace viable en entornos con recursos limitados. La licencia es propia (stellon-labs-community-license), no estándar, y el repositorio ocupa 8,2 GB en total.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de voz (speech LM) con códec S3 y decodificador en dos etapas; transformer con pesos lineales ternarios |
| Parámetros totales | 1.733.487.616 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria 1,58 bits (cuerpo), TL2 + embedding 4 bits (variante `emb4`), decodificador destilado empaquetado a 4 y 8 bits |
| Idiomas soportados | 16: árabe, chino, neerlandés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, turco e inglés |
| Licencia | stellon-labs-community-license (licencia propia, no estándar) |
| Formato de pesos | safetensors (bf16 y ternario empaquetado) y GGUF para el fork de llama.cpp |

## Arquitectura y entrenamiento

El modelo sigue un esquema de modelado de lenguaje aplicado al audio: un transformer autorregresivo genera tokens del códec S3 a partir del texto de entrada, y un decodificador en dos etapas convierte esos tokens en forma de onda a 24 kHz. El cuerpo del transformer emplea pesos lineales ternarios: dentro de cada grupo de 128 valores, cada peso es exactamente `-scale`, `0` o `+scale`. El empaquetado es exacto (cinco trits por byte, 1,6 bits por peso, con la escala de cada grupo a precisión completa), de modo que la versión ternaria produce audio bit a bit idéntico a la versión bf16. El modelo incluye una cabeza de proyección de hablante (`spk_proj`) y un modelo de embedding de hablante para el clonado.

La variante `emb4` aplica cuantización de 4 bits al embedding de tokens (324 millones de parámetros que la versión ternaria debe mantener en bf16) y codifica el cuerpo en TL2. Según la model card, los 313 tensores no pertenecientes al embedding reproducen exactamente la versión `full`, mientras que el embedding presenta un error relativo L2 de 0,118 y se codifica a 4,21 bits por peso en tres niveles de frecuencia. El decodificador opcional `student_w4` es un estudiante destilado de un solo paso con pesos a 4 bits. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto con salida de audio a 24 kHz.
- Clonado de voz en contexto a partir de 5 a 30 segundos de audio de un único hablante.
- 115 voces integradas, incluidas las ocho voces de KittenTTS 0.8 (Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki y Leo) para compatibilidad con código existente.
- Soporte multilingüe en 16 idiomas mediante voces con acento nativo; el idioma se selecciona eligiendo la voz adecuada.
- Control de expresión en fase beta: diez etiquetas de emoción (`[angry]`, `[contemplative]`, `[excited]`, `[joyful]`, `[mundane]`, `[nervous]`, `[sad]`, `[stern]`, `[surprised]`, `[tender]`).
- Eventos vocales en línea: `<gasp>`, `<giggle>`, `<growl>`, `<gulp>`, `<laugh>`, `<pause>`, `<scoff>`, `<sigh>`, `<sob>`, `<um>`.
- Énfasis mediante triple paréntesis `(((palabra)))`.
- Tres empaquetados de pesos intercambiables (`packed`, `emb4`, `full`) y dos decodificadores (`default`, `student_w4`).
- Pesos GGUF para ejecución en CPU mediante un fork de llama.cpp.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera voz continua a 24 kHz con control de emoción y pausas mediante `<pause>`, lo que permite narrar textos largos con variación expresiva sin intervención manual.
- Clonado de voz para doblaje y localización: con 5 a 30 segundos de referencia de un hablante se puede replicar su timbre y trasladarlo a los 16 idiomas soportados, útil para doblar contenido preservando la identidad vocal del original.
- Asistentes de voz y atención al cliente: el modelo puede integrarse en pipelines conversacionales para generar respuestas habladas; las etiquetas de emoción permiten ajustar el tono según el contexto de la conversación.
- Accesibilidad y lectura de pantalla: síntesis de texto a voz con voces en español (`SpanishAbuela`) y otros idiomas, adecuada para convertir documentos o interfaces en audio inteligible.
- Generación de contenido para vídeo y pódcast: las voces integradas y los eventos vocales (`<laugh>`, `<sigh>`, `<gasp>`) permiten producir locuciones con naturalidad conversacional sin grabación humana.
- Prototipado y pruebas de producto: la variante `emb4` (469 MB) y el decodificador `student_w4` (39 MB) permiten desplegar el modelo en entornos con poca memoria para validar experiencias de voz antes de pasar a producción.
- Ejecución en CPU y dispositivos sin GPU: los pesos GGUF del directorio `cpp/` habilitan inferencia en CPU mediante el fork de llama.cpp, útil para aplicaciones de escritorio o servidores sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; como referencia de tamaño en disco, el modelo de lenguaje ternario ocupa 0,95 GB, el bf16 completo 3,47 GB y la variante `emb4` 469 MB. El decodificador por defecto ocupa 459 MB y el `student_w4` 39 MB.
- GPU recomendadas: no especificadas en la información disponible.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; los tamaños de los empaquetados (`emb4` y `student_w4`) sugieren que el modelo puede caber en GPUs de consumo, pero no hay datos oficiales de VRAM ni de latencia.
- Opciones de despliegue: paquete `kittenml` (instalación con `pip install kittenml`), pesos GGUF para un fork de llama.cpp en CPU. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos TTS en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| KittenTTS 2 | 1.733.487.616 | No disponible | 16 | stellon-labs-community-license | safetensors, GGUF |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El control de emoción está en fase beta: según el autor, orienta la entrega en lugar de garantizarla, y el efecto varía según la voz y la frase.
- Solo se reconocen veinte etiquetas de marcado; cualquier otra etiqueta entre corchetes (por ejemplo `[reverent]`, `section [3]` o `x < 5`) se pronuncia como texto normal, lo que puede producir lecturas no deseadas si el texto de entrada contiene corchetes.
- El normalizador de texto está ajustado al inglés: para texto no inglés debe usarse `normalize=False`, ya que de lo contrario se corrompen números y fechas.
- La variante `emb4` es con pérdida: el embedding presenta un error relativo L2 de 0,118 frente a la exportación bf16, por lo que el empaquetado `packed` sigue siendo el predeterminado.
- El decodificador `student_w4` sacrifica fidelidad de audio a cambio de tamaño; la cuantización reduce almacenamiento y ancho de banda de memoria, no el coste aritmético.
- La licencia es propia (stellon-labs-community-license) y no estándar: es imprescindible revisar el archivo `LICENSE.md` antes de cualquier uso comercial, ya que las condiciones no se detallan en la información disponible.
- El clonado de voz exige audio de referencia de un único hablante de entre 5 y 30 segundos; no se documenta el comportamiento con audio ruidoso, con varios hablantes o con acentos no cubiertos.
- Riesgo de uso indebido: la capacidad de clonado de voz puede emplearse para suplantación de identidad o desinformación; no se documentan en la información disponible mecanismos de marca de agua ni de detección.
- No se documentan sesgos conocidos, tasas de alucinación ni límites de longitud de contexto; el idioma se controla mediante la voz elegida, no mediante un parámetro explícito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentory/kitten-tts-2
- Licencia: https://huggingface.co/agentory/kitten-tts-2/blob/main/LICENSE.md
- Paquete de inferencia: `pip install kittenml`
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
