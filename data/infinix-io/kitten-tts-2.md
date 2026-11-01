# Infinix-io/kitten-tts-2

## Resumen

KittenTTS 2 es un modelo de texto a voz (TTS) de 1.700 millones de parámetros desarrollado por Infinix-io, publicado bajo el identificador `Infinix-io/kitten-tts-2`. Se trata de un modelo de lenguaje de habla que recibe texto y emite tokens del códec S3, que un vocodificador posterior convierte en audio a 24 kHz. Su rasgo diferencial es la clonación de voz en contexto a partir de 5-30 segundos de audio de un único hablante, junto con un sistema de control de expresión basado en etiquetas de emoción, eventos vocales y énfasis.

El modelo se distribuye con 115 voces integradas y cubre dieciséis idiomas mediante voces con nombre propio (entre ellos español, alemán, francés, japonés, ruso, árabe, chino, hindi, coreano, polaco, turco, neerlandés, indonesio, italiano y portugués, además del inglés). La arquitectura interna del LM es un transformer con pesos lineales ternarios (valores en {-escala, 0, +escala} por grupo de 128), lo que permite empaquetados muy compactos: el cuerpo ternario ocupa 954 MB frente a los 3469 MB del export en bf16.

Es relevante ahora porque combina tres tendencias: modelos TTS de escala media con clonación zero-shot, cuantización extrema (1,58 bits por peso en el cuerpo del transformer, sin pérdida de calidad según el autor) y soporte de ejecución en CPU mediante pesos GGUF para un fork de llama.cpp. El repositorio ocupa 8,2 GB e incluye LM, modelo de embeddings de hablante, clips de referencia, voces y decodificadores opcionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de habla (transformer) que emite tokens del códec S3, seguido de vocodificador en dos etapas |
| Parámetros totales | 1.733.487.616 (1,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria empaquetada (1,58 bits/peso, 5 trits por byte), TL2 con embedding de 4 bits (`emb4`, 4,21 bits/peso en el embedding), bf16 completo; decodificador en 4 y 8 bits (`student_w4`) |
| Idiomas soportados | 16: árabe, chino, neerlandés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, turco e inglés |
| Licencia | stellon-labs-community-license (license: other) |
| Formato de pesos | safetensors (bf16 y ternario empaquetado) y GGUF para el fork de llama.cpp |
| Frecuencia de muestreo de audio | 24 kHz |
| Voces integradas | 115 |
| Tamaño del repositorio | 8,2 GB |

## Arquitectura y entrenamiento

El modelo se compone de un modelo de lenguaje de habla que transforma texto en tokens del códec S3, más un vocodificador que decodifica esos tokens en audio a 24 kHz. La decodificación de audio es en dos etapas y la primera puede sustituirse por un estudiante destilado de un solo paso con pesos empaquetados a 4 u 8 bits (`student_w4`, 39 MB frente a los 459 MB del decodificador por defecto). El repositorio incluye además una cabeza de hablante (`spk_proj`) y un modelo de embeddings de hablante que se usa durante la clonación.

La innovación técnica más destacable es el empaquetado ternario de los pesos lineales del LM: dentro de cada grupo de 128 valores, cada peso es exactamente uno de {-escala, 0, +escala}, y el empaquetado guarda cinco trits por byte (1,6 bits por peso) manteniendo la escala de cada grupo en precisión completa. Según el autor, este empaquetado es exacto y no aproximado, de modo que el modelo ternario y el bf16 producen audio idéntico bit a bit. El embedding de tokens (324M parámetros) no es ternario y se mantiene en bf16 en el empaquetado por defecto; la variante `emb4` lo reduce a 4 bits con un error relativo L2 de 0,118 frente al export bf16, siendo el único componente con pérdida. No se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto con salida de audio a 24 kHz.
- Clonación de voz en contexto a partir de 5-30 segundos de audio de un único hablante.
- 115 voces integradas, incluidas ocho (Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki y Leo) compatibles con KittenTTS 0.8.
- Multilingüe en 16 idiomas; el acento lo aporta la voz seleccionada, no un parámetro de idioma.
- Control de emoción mediante una etiqueta inicial entre diez posibles: `[angry]`, `[contemplative]`, `[excited]`, `[joyful]`, `[mundane]`, `[nervous]`, `[sad]`, `[stern]`, `[surprised]`, `[tender]`.
- Eventos vocales en línea: `<gasp>`, `<giggle>`, `<growl>`, `<gulp>`, `<laugh>`, `<pause>`, `<scoff>`, `<sigh>`, `<sob>`, `<um>`.
- Énfasis mediante triple paréntesis `(((palabra)))`.
- Presets de decodificación, como `preset="expressive"`.
- Ejecución en CPU mediante pesos GGUF para un fork de llama.cpp.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso; el modelo está especializado en TTS.

## Casos de uso

- Doblaje y localización de contenido: con dieciséis idiomas y voces nativas por idioma (`SpanishAbuela`, `German`, `JapaneseTrainConductor`), se puede generar una pista de voz por mercado sin cambiar de modelo, pasando `normalize=False` para evitar que el normalizador de texto, ajustado al inglés, corrompa números y fechas.
- Audiolibros y narración expresiva: las etiquetas de emoción y los eventos vocales permiten marcar el tono por línea (`[tender]`, `[contemplative]`) y añadir pausas o suspiros, lo que da una narración con variación prosódica sin postprocesado manual.
- Clonación de la voz del propio usuario para asistentes personales: con 5-30 segundos de referencia se obtiene una voz consistente para respuestas habladas, útil en aplicaciones de accesibilidad o interfaces conversacionales.
- Generación de voces para videojuegos y prototipado: 115 voces predefinidas más clonación permiten poblar personajes secundarios con acentos distintos sin contratar grabaciones, y el decodificador `student_w4` de 39 MB reduce el peso en disco del pipeline.
- Despliegue en CPU o en hardware sin GPU: los pesos GGUF del fork de llama.cpp y el empaquetado ternario de 954 MB permiten servir TTS en servidores sin acelerador, útil para entornos de borde o CI.
- Síntesis de voz para pruebas automatizadas de sistemas de diálogo: el control de emoción y los eventos vocales permiten generar corpus de audio con etiquetas controladas para evaluar sistemas de reconocimiento de emociones o de atención al cliente.
- Generación de avisos y locuciones dinámicas: la API síncrona (`m.generate`) y el bajo peso del paquete ternario facilitan integrar la síntesis en servicios que producen audio bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el cuerpo del LM ternario ocupa 954 MB en disco y el decodificador por defecto 459 MB; en inferencia hay que sumar activaciones y el modelo de embeddings de hablante, por lo que un presupuesto de 2-4 GB de VRAM es razonable, aunque la cifra exacta no está publicada.
- Variante `emb4`: 469 MB de LM más 459 MB de decodificador por defecto, o 39 MB con `student_w4`.
- Variante `full` en bf16: 3469 MB de LM, más decodificador; requiere bastante más memoria que el empaquetado ternario.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo debería caber en GPUs de consumo como RTX 3060/4060 en adelante con el empaquetado ternario.
- Cabe en GPU de consumo: sí, con el empaquetado por defecto (`packed`), a falta de cifras oficiales de VRAM.
- Opciones de despliegue: paquete `kittenml` (API `KittenTTS`), pesos GGUF para un fork de llama.cpp (ejecución en CPU). No se documenta soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor señala que la cuantización del decodificador reduce almacenamiento y ancho de banda de memoria, no el coste aritmético, por lo que no cabe esperar aceleración por usar `student_w4`.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables que permitan una comparación rigurosa. Como referencia estructural, se puede contrastar con otros TTS de clonación zero-shot de escala similar, pero sin cifras verificadas no se ofrece tabla comparativa.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| KittenTTS 2 | 1,7B | no disponible | 16 | stellon-labs-community-license | safetensors, GGUF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El control de emoción está marcado como beta: según el autor, orienta la entrega en lugar de garantizarla, y el efecto varía según la voz y la frase.
- Solo se reconocen veinte etiquetas (diez emociones, diez eventos vocales y el énfasis con triple paréntesis); cualquier otra etiqueta entre corchetes o ángulos se pronuncia como texto literal, lo que puede producir lecturas erróneas de contenido como `section [3]` o `x < 5`.
- El normalizador de texto está ajustado al inglés y corrompe números y fechas en otros idiomas; es obligatorio pasar `normalize=False` para texto no inglés.
- La variante `emb4` es con pérdida: el embedding de 4 bits presenta un error relativo L2 de 0,118 frente al bf16, por lo que el empaquetado `packed` sigue siendo el recomendado por el autor.
- La clonación requiere audio de referencia de un único hablante y entre 5 y 30 segundos; no se documenta comportamiento con audio multicanal o con ruido.
- Riesgo de alucinación y de prosodia incorrecta en textos largos o con markup ambiguo; no hay datos publicados sobre estabilidad en secuencias extensas ni sobre longitud máxima de contexto.
- Sesgos: no se documentan sesgos conocidos en la información disponible, pero al ser un modelo multilingüe con voces por acento, la cobertura y calidad pueden variar entre idiomas.
- Licencia: `stellon-labs-community-license` (license: other); las condiciones exactas están en `LICENSE.md` del repositorio y deben revisarse antes de cualquier uso comercial.
- El modelo se distribuye con todo lo necesario en el repositorio (no requiere inicio de sesión en Hugging Face), pero la carga descarga solo la variante de pesos y el decodificador solicitados.
- Fecha de creación del repositorio: 2026-10-31; con 141 descargas y 0 likes, la adopción es todavía muy baja y el soporte de la comunidad es limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/kitten-tts-2
- Licencia: `LICENSE.md` en el repositorio de Hugging Face
- Paquete de inferencia: `pip install kittenml`
- Pesos GGUF para el fork de llama.cpp: directorio `cpp/` del repositorio
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos.
