# KittenML/kitten-tts-2

## Resumen

KittenTTS 2 es un modelo de texto a voz (TTS) de 1.733.487.616 parámetros desarrollado por KittenML. Se trata de un modelo de lenguaje de habla que lee texto y genera tokens del códec S3, que posteriormente un vocoder transforma en audio a 24 kHz. Su característica principal es el clonado de voz en contexto a partir de 5-30 segundos de audio de un único hablante, junto con un catálogo de 115 voces integradas.

El modelo destaca por su empaquetado ternario de pesos: el cuerpo del transformer utiliza pesos ternarios (cada valor es exactamente uno de {-scale, 0, +scale} dentro de grupos de 128), lo que permite almacenar el modelo en 954 MB con una packing de 1,58 bits por peso sin pérdida de calidad respecto a la versión bf16 completa de 3469 MB. Esta innovación reduce el peso en disco 3,6 veces manteniendo audio bit a bit idéntico.

La relevancia actual del modelo reside en su combinación de clonado de voz, control de expresión mediante etiquetas de emoción y eventos vocales, soporte para 16 idiomas con voces nativas, y una licencia comunitaria que permite su uso con condiciones específicas. El repositorio incluye pesos en safetensors y GGUF para un fork de llama.cpp, lo que facilita el despliegue tanto en GPU como en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de habla (speech language model) con decodificador de audio en dos etapas y vocoder; cuerpo transformer con pesos ternarios |
| Parametros totales | 1.733.487.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternario (1,58 bits por peso en packing "packed"), TL2 4 bits en embedding (variante "emb4"), bf16 (variante "full"), decodificador student_w4 a 4 bits y 8 bits |
| Idiomas soportados | 16 idiomas con voz nombrada: arabe, chino, neerlandes, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, turco e ingles |
| Licencia | stellon-labs-community-license (license: other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

KittenTTS 2 es un modelo de lenguaje de habla que genera tokens del códec S3 a partir de texto. La arquitectura se compone de un modelo de lenguaje principal con un cabezal de hablante (`spk_proj`), un modelo de embedding de hablante para el clonado de voz, y un decodificador de audio en dos etapas que convierte los tokens en audio a 24 kHz. El decodificador por defecto tiene 459 MB en disco y ofrece la mejor calidad; opcionalmente puede sustituirse por un estudiante destilado de un solo paso (`student_w4`) de 39 MB con pesos empaquetados a 4 bits, que sacrifica fidelidad por huella de almacenamiento, no por velocidad, ya que la cuantización reduce el almacenamiento y el ancho de banda de memoria pero no la aritmética.

La innovación técnica más destacable es el empaquetado ternario de los pesos lineales del modelo de lenguaje: dentro de cada grupo de 128 valores, cada peso es exactamente uno de {-scale, 0, +scale}. El archivo `lm/model-ternary.safetensors` empaqueta cinco trits por byte a 1,6 bits por peso, manteniendo la escala de cada grupo a precisión completa. El empaquetado es exacto, no aproximado, por lo que produce audio bit a bit idéntico al modelo bf16 completo. La variante `emb4` (469 MB) mantiene el cuerpo transformer bit-exacto y solo cuantiza el embedding de tokens (324M parámetros) a 4,21 bits por peso en tres niveles de frecuencia, con un error relativo L2 de 0,118 frente a la exportación bf16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de voz a partir de texto con 115 voces integradas, incluyendo las mismas voces de KittenTTS 0.8 (Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki y Leo) para compatibilidad con código existente.
- Clonado de voz en contexto a partir de 5-30 segundos de audio de un único hablante.
- Soporte multilingüe para 16 idiomas mediante voces nombradas por idioma (por ejemplo, `SpanishAbuela`, `JapaneseTrainConductor`, `RussianBabushka`).
- Control de expresión mediante etiquetas de emoción al inicio de línea: `[angry]`, `[contemplative]`, `[excited]`, `[joyful]`, `[mundane]`, `[nervous]`, `[sad]`, `[stern]`, `[surprised]`, `[tender]`.
- Eventos vocales en línea: `<gasp>`, `<giggle>`, `<growl>`, `<gulp>`, `<laugh>`, `<pause>`, `<scoff>`, `<sigh>`, `<sob>`, `<um>`.
- Énfasis mediante triple paréntesis `(((palabra)))` para estresar palabras o frases cortas.
- Presets de expresión como `preset="expressive"`.
- Tres empaquetados de pesos intercambiables: `packed` (954 MB, por defecto, sin pérdida), `emb4` (469 MB, con pérdida en el embedding) y `full` (3469 MB, bf16).
- Decodificadores intercambiables: `default` (459 MB, mejor calidad) y `student_w4` (39 MB, estudiante destilado a 4 bits).
- Ejecución en CPU mediante pesos GGUF para un fork de llama.cpp.
- No se menciona soporte de tool calling, function calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- **Atención al cliente automatizada con voz clonada**: el modelo puede generar respuestas habladas con la voz de un agente concreto a partir de 5-30 segundos de audio de referencia, manteniendo consistencia de marca en sistemas de IVR o asistentes telefónicos.
- **Audiolibros y narración**: con 115 voces integradas y control de emoción mediante etiquetas como `[tender]` o `[excited]`, se puede narrar ficción con cambios de tono por escena sin necesidad de múltiples grabaciones.
- **Localización de contenido a 16 idiomas**: usando voces como `SpanishAbuela` o `German`, el modelo permite doblar vídeos o generar pistas de audio en distintos idiomas, con la advertencia de usar `normalize=False` para textos no ingleses.
- **Generación de voces para videojuegos**: los eventos vocales `<laugh>`, `<sigh>` o `<gasp>` permiten generar líneas de diálogo con expresiones naturales integradas, útiles para prototipado rápido de personajes.
- **Accesibilidad y lectores de pantalla**: el modelo puede convertir texto en audio a 24 kHz con voces variadas, adecuado para aplicaciones de lectura en voz alta con control de énfasis mediante `(((palabra)))`.
- **Despliegue en entornos con recursos limitados**: la variante `emb4` (469 MB) junto con el decodificador `student_w4` (39 MB) permite ejecutar TTS en dispositivos con poca memoria, y los pesos GGUF habilitan inferencia en CPU mediante el fork de llama.cpp.
- **Prototipado de asistentes conversacionales**: la combinación de clonado de voz y control de emoción permite crear demos de asistentes con personalidad propia sin entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo de lenguaje en variante `packed` ocupa 954 MB en disco y el decodificador por defecto 459 MB, lo que sugiere un consumo de memoria moderado, pero no se proporcionan cifras de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no se especifica, aunque el tamaño de los pesos (inferior a 1 GB en la variante por defecto) sugiere que podría caber en GPUs de consumo, pero este dato no se confirma en la información proporcionada.
- Opciones de despliegue: paquete `kittenml` (`pip install kittenml`), pesos GGUF para un fork de llama.cpp (ejecución en CPU), y variantes de pesos y decodificadores seleccionables mediante los parámetros `weights=` y `decoder=`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparativas con otros modelos TTS.

## Limitaciones y advertencias

- El control de emoción está marcado como **beta**: el efecto varía según la voz y la frase, y no garantiza la entrega emocional deseada.
- Solo se reconocen veinte etiquetas (diez emociones y diez eventos vocales). Otras etiquetas como `[reverent]` se leen como texto normal, al igual que cualquier otro contenido entre corchetes o ángulos, como `section [3]` o `x < 5`.
- El normalizador de texto está ajustado para inglés y estropea números y fechas en otros idiomas; es necesario pasar `normalize=False` para textos no ingleses.
- La variante `emb4` es con pérdida: el embedding de tokens tiene un error relativo L2 de 0,118 frente a bf16, aunque el cuerpo transformer es bit-exacto. La variante `packed` es la predeterminada por ser sin pérdida.
- La cuantización del decodificador reduce almacenamiento y ancho de banda de memoria, pero no acelera la aritmética.
- La licencia es `stellon-labs-community-license` (license: other), por lo que es necesario revisar los términos del archivo LICENSE.md antes de un uso comercial.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación en el contenido hablado, ni límites de longitud de contexto.
- El clonado de voz requiere 5-30 segundos de audio de un único hablante; no se especifica el comportamiento con audio de múltiples hablantes o ruidoso.
- Riesgo ético: la capacidad de clonado de voz puede emplearse para suplantación; no se detallan salvaguardas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/KittenML/kitten-tts-2
- Licencia: https://huggingface.co/KittenML/kitten-tts-2/blob/main/LICENSE.md
- Paquete Python: `pip install kittenml` (no se proporciona URL del repositorio)
- Fork de llama.cpp con pesos GGUF: incluido en el directorio `cpp/` del repositorio (no se proporciona URL externa)
