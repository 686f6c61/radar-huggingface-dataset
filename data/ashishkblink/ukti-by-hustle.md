# ashishkblink/ukti-by-hustle

## Resumen

Ukti es un modelo de síntesis de voz (text-to-speech) con capacidad de streaming desarrollado por Hustle y presentado por BlinkDigital, publicado bajo el identificador `ashishkblink/ukti-by-hustle`. Está construido sobre un modelo base de pesos abiertos y orientado a la generación de audio en 12 idiomas: once lenguas de la India (asamés, bengalí, gujarati, hindi, kannada, malayalam, marathi, odia, punyabí, tamil y telugu) y el inglés. Su principal característica diferencial es que emite audio mientras lo genera, lo que lo hace apto para aplicaciones conversacionales en tiempo real como centros de llamadas automatizados.

El modelo cuenta con 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) y un repositorio de 5,1 GB con pesos en formato safetensors. La inferencia se realiza mediante el paquete `maya3`, distribuido desde el repositorio `MayaResearch/maya2-native`, que expone la clase `Maya3TTS` y requiere Linux, Python 3.10–3.12 y una GPU NVIDIA con CUDA 12.8. Según la documentación del autor, cada instancia de carga ("seat") ocupa unos 9,2 GB, de modo que una GPU de 12 GB puede alojar un seat con margen.

La relevancia del modelo radica en su cobertura lingüística para el subcontinente indio, un área tradicionalmente desatendida por los sistemas TTS comerciales, combinada con clonación de voz, streaming y una licencia permisiva Apache-2.0. Hustle emplea el modelo en su propio centro de llamadas con IA y en el resto de su familia de aplicaciones, lo que indica un uso en producción real por parte del desarrollador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS construido sobre un modelo base de pesos abiertos; la model card no detalla la arquitectura interna) |
| Parámetros totales | 2.502.398.656 |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor solo documenta carga en precisión nativa; se requieren unos 9,2 GB por seat) |
| Idiomas soportados | asamés (as), bengalí (bn), inglés (en), gujarati (gu), hindi (hi), kannada (kn), malayalam (ml), marathi (mr), odia (or), punyabí (pa), tamil (ta), telugu (te) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Frecuencia de muestreo de salida | 24.000 Hz (según el ejemplo de la model card) |
| Tamaño del repositorio | 5,1 GB |
| Requisitos de ejecución | Linux, Python 3.10–3.12, GPU NVIDIA con CUDA 12.8 |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (transformer, difusión, códec neuronal u otra), ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. El autor indica únicamente que Ukti se desarrolla sobre un modelo base de pesos abiertos y que Hustle continúa refinándolo para mejorar la precisión, naturalidad y expresividad del habla. No se detalla qué modelo base se emplea ni qué modificaciones se han introducido sobre él.

La innovación técnica destacada es la generación en streaming: el modelo emite audio mientras todavía está generando, lo que reduce la latencia percibida en aplicaciones conversacionales. La inferencia se articula a través del paquete `maya3`, que gestiona la carga del modelo mediante `Maya3TTS.from_pretrained` con un parámetro `max_seats` para controlar cuántas instancias concurrentes se cargan en memoria. El método `generate` acepta el texto, el código de idioma, un identificador de voz (por ejemplo, "Ahana") y un flag de normalización de texto.

## Capacidades

- Síntesis de voz multilingüe en 12 idiomas: once lenguas de la India y el inglés.
- Generación de audio en streaming, con emisión de muestras mientras el modelo sigue generando.
- Clonación de voz, según se declara explícitamente en la sección de uso responsable de la model card.
- Selección de voz mediante identificador (el ejemplo documentado usa la voz "Ahana").
- Normalización de texto de entrada opcional mediante el parámetro `normalize=True`.
- Salida de audio a 24 kHz en formato compatible con `soundfile`.
- Gestión de concurrencia mediante el parámetro `max_seats` para alojar varias instancias en una misma GPU.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Centros de llamadas automatizados: Hustle emplea Ukti en su propio centro de llamadas con IA; el streaming permite responder al interlocutor con baja latencia en conversaciones telefónicas multilingües en hindi, tamil, telugu y el resto de lenguas cubiertas.
- Asistentes de voz para atención al cliente en la India: el modelo puede atender consultas en la lengua materna del usuario, lo que resulta adecuado para un mercado con alta diversidad lingüística donde el inglés no siempre es la opción preferida.
- Sistemas de anuncios y notificaciones por voz: lectura automatizada de pedidos, entregas y avisos en el idioma del cliente, como ilustra el ejemplo de la model card ("नमस्ते, आपका ऑर्डर कल पहुँच जाएगा।").
- Audiolibros y contenido editorial multilingüe: generación de narraciones en once lenguas indias a partir de texto, con selección de voz y normalización de texto para manejar números y abreviaturas.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura en lenguas regionales de la India.
- Doblaje y localización de contenidos: producción de pistas de voz en varios idiomas a partir de un mismo guion, con clonación de voz para mantener la identidad del locutor original (con el consentimiento correspondiente).
- Integración en aplicaciones de la familia Hustle: el propio autor indica que Ukti se usa junto a otros modelos de IA en sus aplicaciones, lo que sugiere despliegues integrados en producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), WER del texto sintetizado, latencia medida ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,2 GB por seat (instancia cargada), más el contexto de CUDA. Con `max_seats=1` en una GPU de 12 GB queda margen libre según el autor.
- GPU recomendadas: no se especifican modelos concretos; se requiere una GPU NVIDIA compatible con CUDA 12.8. Por el consumo de memoria indicado, una RTX 4090 (24 GB) permitiría varios seats, y una GPU de 12 GB (por ejemplo, RTX 3060 de 12 GB o RTX 4070) alojaría un seat.
- Cabe en GPU de consumo: sí, con al menos 12 GB de VRAM para un único seat.
- Opciones de despliegue: paquete `maya3[server]` instalado desde `git+https://github.com/MayaResearch/maya2-native`, con índice extra de PyTorch CUDA 12.8. La model card no menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modo streaming está diseñado para reducir la latencia percibida, pero no se publican cifras.
- Sistema operativo: Linux exclusivamente, según los requisitos documentados.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas por el autor. La información proporcionada no incluye modelos alternativos con los que contrastar parámetros, contexto o rendimiento, por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, la combinación de cobertura de once lenguas indias, clonación de voz, streaming y licencia Apache-2.0 sitúa a Ukti en un nicho específico dentro del ecosistema TTS open source, pero no se aportan métricas que permitan compararlo con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; cabe esperar sesgos derivados de los datos de entrenamiento del modelo base, que no se detallan.
- Riesgo de alucinación y de errores de pronunciación: no se publican métricas de fidelidad (WER, MOS) que permitan acotar la tasa de errores.
- El modelo puede clonar voces y generar habla realista; el autor exige clonar únicamente voces propias o con permiso explícito.
- No incluye marca de agua de audio: el despliegue debe añadir consentimiento, divulgación de que el habla es sintética, control de acceso y monitorización de abusos.
- El servidor incluido no tiene autenticación integrada; no debe exponerse fuera de un entorno de confianza sin añadirla.
- Restricciones de uso: prohibido el uso para suplantación de identidad, fraude, acoso, contenido no consentido, desinformación o para burlar sistemas de autenticación por voz.
- Requisitos de plataforma estrictos: solo Linux, Python 3.10–3.12 y GPU NVIDIA con CUDA 12.8, lo que excluye despliegues en CPU, macOS o GPUs no NVIDIA según la documentación.
- Al redistribuir o modificar el modelo deben conservarse los archivos `LICENSE` y `NOTICE`.
- No se documentan la longitud de contexto, los tipos de cuantización ni la arquitectura interna, lo que dificulta evaluar su comportamiento en entradas de texto largas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria pública del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashishkblink/ukti-by-hustle
- Playground de Ukti: https://huggingface.co/spaces/ashishkblink/ukti-playground
- Repositorio del paquete de inferencia: https://github.com/MayaResearch/maya2-native
- Índice de PyTorch con CUDA 12.8: https://download.pytorch.org/whl/cu128
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
