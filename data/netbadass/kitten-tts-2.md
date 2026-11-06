# netbadass/kitten-tts-2

## Resumen

KittenTTS 2 es un modelo de texto a voz (TTS) de 1.733.487.616 parametros desarrollado por Stellon Labs bajo la marca KittenML. Se trata de un modelo de lenguaje de habla que lee texto y genera tokens del codec S3, que un vocoder posterior convierte en audio a 24 kHz. Su rasgo diferencial es que es el primer modelo TTS ternario publicado: los pesos lineales del transformer estan cuantizados a valores {-scale, 0, +scale} en grupos de 128, lo que permite empaquetarlos a 1,6 bits por peso sin perdida de calidad respecto a la version bf16.

El modelo incorpora clonacion de voz en contexto a partir de 5-30 segundos de audio de un unico hablante, 115 voces integradas (entre ellas 16 idiomas con voz nombrada) y controles de expresion mediante etiquetas de emocion, eventos vocales y enfasis. La arquitectura combina un modelo de lenguaje de habla con una cabeza de proyeccion de hablante (`spk_proj`) y un decodificador de audio en dos etapas, con una variante destilada de un solo paso cuantizada a 4 bits.

Es relevante ahora porque demuestra que un TTS de calidad frontier puede ejecutarse en tiempo real sobre CPU y GPU de consumo, gracias al empaquetado ternario exacto (no aproximado) y a un fork de llama.cpp incluido en el repositorio. El repo ocupa 8,2 GB, pero la carga por defecto solo descarga 947 MiB (910 MiB del modelo de lenguaje y 37 MiB del decodificador).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de habla (transformer) con pesos lineales ternarios + cabeza de hablante `spk_proj` + decodificador de audio en dos etapas |
| Parametros totales | 1.733.487.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternario empaquetado (1,58-1,6 bits por peso), TL2 con embedding a 4 bits (`emb4`), bf16 (`full`), decodificador a 4 y 8 bits (`student_w4`) |
| Idiomas soportados | 16 idiomas con voz nombrada: arabe, chino, neerlandes, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, turco e ingles |
| Licencia | `stellon-labs-community-license` (license: other) |
| Formato de pesos | safetensors (bf16 y ternario empaquetado), GGUF para el fork de llama.cpp |

## Arquitectura y entrenamiento

El modelo es un transformer de lenguaje de habla que opera sobre texto y emite tokens del codec S3, que despues se decodifican a audio de 24 kHz en dos etapas. La innovacion central es la cuantizacion ternaria exacta: dentro de cada grupo de 128 pesos lineales, cada valor es exactamente uno de {-scale, 0, +scale}, y el empaquetado guarda cinco trits por byte con la escala de cada grupo a precision completa. Segun la model card, el empaquetado es exacto y no aproximado, por lo que `lm/model-ternary.safetensors` (0,95 GB) y `lm/model.safetensors` (3,47 GB, bf16) producen audio bit a bit identico.

El repositorio incluye tres empaquetados de los mismos pesos: `packed` (954 MB, cuerpo ternario de 1,58 bits con embedding en bf16, sin perdida), `emb4` (469 MB, mismo cuerpo en TL2 mas embedding a 4 bits, con perdida) y `full` (3469 MB, bf16 plano). En `emb4`, los 313 tensores no pertenecientes al embedding reproducen `full` de forma exacta; solo el embedding (324M parametros) es lossy, con error relativo L2 de 0,118 frente a la exportacion bf16 y codificado a 4,21 bits por peso en tres niveles de frecuencia. El decodificador dispone de una variante `student_w4` (39 MB) destilada a un solo paso y empaquetada a 4 bits, frente al `default` (459 MB) de mayor calidad.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Sintesis de voz a partir de texto con salida de audio a 24 kHz.
- Clonacion de voz en contexto a partir de 5-30 segundos de audio de un unico hablante.
- 115 voces integradas, incluidas 16 con nombre asociado a un idioma; las voces con nombre de persona son en ingles.
- Control de emocion mediante una etiqueta inicial entre diez disponibles: `[angry]`, `[contemplative]`, `[excited]`, `[joyful]`, `[mundane]`, `[nervous]`, `[sad]`, `[stern]`, `[surprised]`, `[tender]`.
- Eventos vocales en linea: `<gasp>`, `<giggle>`, `<growl>`, `<gulp>`, `<laugh>`, `<pause>`, `<scoff>`, `<sigh>`, `<sob>`, `<um>`.
- Enfasis mediante triple parentesis: `(((palabra)))`.
- Presets de decodificacion, como `preset="expressive"`.
- Soporte multilingue en 16 idiomas, con la advertencia de usar `normalize=False` en texto no ingles porque el normalizador de texto esta ajustado al ingles.
- Ejecucion en CPU y GPU de consumo, con deteccion automatica de dispositivo.
- Compatibilidad con endpoints (`endpoints_compatible`) y con una API compatible con OpenAI segun la web del proyecto.

## Casos de uso

- Audiolibros y narracion automatizada: el modelo permite asignar una voz integrada o clonar la de un narrador a partir de una muestra de 5-30 segundos, y aplicar etiquetas de emocion por linea para variar la interpretacion en pasajes largos.
- Asistentes de voz para atencion al cliente: la clonacion de voz permite mantener una identidad sonora de marca coherente, y la API compatible con OpenAI facilita integrarlo en infraestructuras existentes sin reescribir el cliente.
- Doblaje y localizacion de contenido: con 16 idiomas y voces especificas por idioma (`SpanishAbuela`, `JapaneseTrainConductor`, `RussianBabushka`), se puede generar pista de voz por locale usando `normalize=False` para preservar numeros y fechas.
- Generacion de voz para videojuegos y personajes: los eventos vocales (`<laugh>`, `<sigh>`, `<gasp>`) y las emociones permiten producir lineas expresivas sin grabar a actores para cada variante.
- Accesibilidad y lectura de pantalla: al ejecutarse en CPU en tiempo real, puede desplegarse en equipos sin GPU para convertir texto en audio en aplicaciones de lectura asistida.
- Prototipado rapido de productos de voz: la variante `emb4` (469 MB) y el decodificador `student_w4` (39 MB) reducen la huella para entornos de desarrollo y pruebas con recursos limitados.
- Generacion de voces para contenido corto (podcast, redes): el preset `expressive` y el enfasis con triple parentesis permiten ajustar la entrega de frases concretas sin postprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella en disco de los pesos cargados por defecto: 947 MiB (910 MiB del modelo de lenguaje y 37 MiB del decodificador).
- Variante `packed`: 954 MB en disco; variante `emb4`: 469 MB; variante `full`: 3469 MB.
- Decodificador `default`: 459 MB; decodificador `student_w4`: 39 MB.
- Ejecucion en CPU out of the box, con deteccion automatica de dispositivo; la via mas rapida es `kitten-tts-2-cpp`, el fork de llama.cpp del proyecto, cuyos pesos GGUF estan en el directorio `cpp/`.
- Cabe en GPU de consumo: el empaquetado ternario y las variantes reducidas estan disenados para ello, aunque no se especifican modelos concretos de GPU ni cifras de VRAM en la informacion disponible.
- Opciones de despliegue: paquete `kittenml` (Python), fork de llama.cpp (`kitten-tts-2-cpp`) y API compatible con OpenAI segun la web del proyecto.
- Latencia y throughput: se afirma ejecucion en tiempo real en CPU y GPU de consumo, pero no se proporcionan cifras concretas; no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| KittenTTS 2 | 1.733.487.616 | No disponible | 16 | `stellon-labs-community-license` | TTS ternario, clonacion de voz, 115 voces |
| KittenTTS 0.8 (original) | 25-80 MB | No disponible | No disponible | Apache 2.0 | Sin GPU, API simple; comparte ocho hablantes con KittenTTS 2 |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros TTS comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El control de emociones esta marcado como beta: dirige la entrega en lugar de garantizarla, y el efecto varia segun la voz y la frase.
- Solo se reconocen veinte etiquetas; otras etiquetas entre corchetes, como `[reverent]`, se pronuncian como texto normal, igual que `section [3]` o `x < 5`.
- El normalizador de texto esta ajustado al ingles y estropea numeros y fechas en otros idiomas; es necesario pasar `normalize=False` en texto no ingles.
- La variante `emb4` es lossy: el embedding presenta un error relativo L2 de 0,118 frente a bf16 y se codifica a 4,21 bits por peso; por eso `packed` sigue siendo la opcion por defecto.
- La licencia `stellon-labs-community-license` es de tipo "other" y no equivale a una licencia permisiva como Apache 2.0; es necesario revisar `LICENSE.md` antes de un uso comercial. La guia de Better Stack senala explicitamente un cambio de licencia respecto al KittenTTS original.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y el repo se creo y actualizo el 2026-11-06, por lo que la validacion comunitaria es practicamente inexistente.
- La clonacion de voz plantea riesgos de suplantacion y requiere consentimiento explicito del hablante cuya voz se clona.

## Enlaces

- [Hugging Face: netbadass/kitten-tts-2](https://huggingface.co/netbadass/kitten-tts-2)
- [Hugging Face: KittenML/kitten-tts-2](https://huggingface.co/KittenML/kitten-tts-2)
- [GitHub: KittenML/KittenTTS](https://github.com/KittenML/KittenTTS)
- [Sitio web: KittenML](https://kittenml.com/)
- [Guia: KittenTTS 2 en Better Stack](https://betterstack.com/community/guides/ai/kitten-tts-2/)
