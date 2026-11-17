# guymorlan/levanti_diacritics2translit

## Resumen

Levanti Transliterator es un modelo de clasificación de tokens desarrollado por Guy Mor-Lan que convierte los signos diacríticos del árabe coloquial palestino en una estimación de su pronunciación mediante vocales hebreas. El modelo no traduce ni genera texto libre: etiqueta cada letra del texto de entrada con una de siete clases (la clase "O" para letras sin diacrítico y seis vocales hebreas: Tsere, Holam, Patah, Shva, Kubutz e Hiriq), lo que permite después aplicar reglas de transliteración al hebreo (escritura *taatik*) o al alfabeto latino.

Técnicamente se trata de un fine-tuning de CANINE-s, el modelo de lenguaje a nivel de carácter de Google, al que se le añade una cabeza de clasificación de tokens. Con 132.088.327 parámetros y pesos en safetensors, el modelo trabaja directamente sobre caracteres en lugar de subpalabras, lo que encaja con la naturaleza grafémica del problema. Forma parte del ecosistema Levanti, junto con el diacritizador `guymorlan/levanti_arabic2diacritics`, que añade los diacríticos al texto árabe sin vocalizar antes de pasarlo por este transliterador.

Su relevancia es de nicho pero clara: cubre una tarea lingüística muy específica (transliteración asistida de árabe palestino a hebreo y latín) para la que existen pocos recursos abiertos, y lo hace con licencia CC BY-SA 4.0. El modelo está pensado para investigadores en lingüística semítica, dialectología y procesamiento de lenguas de bajos recursos, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de carácter (CANINE-s) con cabeza de clasificación de tokens |
| Parametros totales | 132.088.327 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | ar (árabe, específicamente dialecto palestino) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de CANINE-s, una arquitectura transformer que opera sobre caracteres Unicode en lugar de tokens de subpalabra. Sobre esa base se añade una cabeza de token classification que asigna a cada carácter una etiqueta entre siete posibles: "O" (sin diacrítico) y seis vocales hebreas. El entrenamiento se realizó mediante fine-tuning sobre un subconjunto especial del dataset Levanti (anunciado como pendiente de publicación en el momento de escribir la model card), orientado específicamente a la correspondencia entre diacríticos árabes y vocales hebreas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal no es arquitectónica sino de planteamiento: reformular la transliteración como una tarea de etiquetado carácter a carácter, lo que permite conservar la alineación exacta entre entrada y salida y delegar la conversión de consonantes a reglas deterministas implementadas en Python (los diccionarios `arabic_to_hebrew` y `arabic_to_english` de la model card).

## Capacidades

- Clasificación carácter a carácter de diacríticos árabes en seis vocales hebreas (Tsere, Holam, Patah, Shva, Kubutz, Hiriq).
- Conversión de texto árabe palestino vocalizado a transliteración hebrea (*taatik*) combinando la salida del modelo con un mapeo de consonantes.
- Conversión a transliteración latina (inglés) mediante un segundo mapeo de reglas incluido en la model card.
- Manejo de letras finales árabes (ن, م, ص, ض, ف) con sus formas hebreas correspondientes.
- Tratamiento de la shadda mediante duplicación/mayusculización de la consonante en la salida latina.
- Integración con el diacritizador Levanti (`guymorlan/levanti_arabic2diacritics`) para procesar texto árabe sin vocalizar de extremo a extremo.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo *thinking*.
- Capacidad multilingüe limitada al árabe palestino como entrada; la salida es hebrea o latina por reglas externas al modelo.

## Casos de uso

- Investigación en dialectología palestina: el modelo permite anotar corpus orales transcritos en árabe con una aproximación sistemática a la pronunciación, facilitando estudios fonológicos comparados entre árabe palestino y hebreo.
- Documentación de patrimonio lingüístico: para archivos de audio transcritos y diacritizados, el transliterador genera representaciones en *taatik* o latín legibles por investigadores que no dominan la escritura árabe.
- Enseñanza del árabe palestino a hablantes de hebreo: la salida en vocales hebreas sirve como apoyo pedagógico para la pronunciación, aprovechando el sistema vocálico compartido.
- Preparación de datasets paralelos árabe-hebreo: la transliteración automática acelera la alineación de corpus bilingües en contextos de traducción automática de dialectos.
- Análisis de préstamos y calcos: al comparar la vocalización estimada con la forma hebrea real, se pueden estudiar patrones de adaptación fonética de préstamos árabes en hebreo.
- Pipelines de normalización textual: integrado tras el diacritizador Levanti, permite generar versiones transliteradas de textos dialectales para motores de búsqueda o sistemas de recuperación de información que no manejan bien la escritura árabe.
- Herramientas de accesibilidad lingüística: para lectores de habla hebrea que necesitan aproximarse a textos palestinos sin formación en árabe escrito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,53 GB solo para pesos (132 M de parámetros), más activaciones; en la práctica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en FP16/BF16: alrededor de 0,27 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4060, GTX 1660 o incluso en CPU para textos cortos.
- Cabe en GPU consumer sin problema, incluidas GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `CanineForTokenClassification` (método documentado en la model card); al ser un modelo de clasificación de tokens, no es adecuado para vLLM, TGI ni llama.cpp/Ollama en su acepción generativa habitual, aunque puede servirse vía endpoints de inferencia estándar de Hugging Face (`endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño y la naturaleza carácter a carácter, se espera un procesamiento en el orden de milisegundos por frase en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guymorlan/levanti_diacritics2translit | 132 M | no disponible | Clasificación de tokens (diacríticos árabes a vocales hebreas) | CC BY-SA 4.0 | Hugging Face |
| guymorlan/levanti_arabic2diacritics | no disponible | no disponible | Diacritización de árabe palestino | no disponible | Hugging Face |
| google/canine-s | 132 M | 2048 caracteres (según documentación de CANINE) | Modelo de lenguaje a nivel de carácter | Apache 2.0 (modelo base) | Hugging Face |

No se conocen otros modelos públicos que realicen exactamente la misma tarea de transliteración diacrítica árabe-hebreo; la comparación con el diacritizador Levanti es pertinente porque ambos forman un pipeline, y con CANINE-s porque es su modelo base.

## Limitaciones y advertencias

- El modelo solo etiqueta vocales; la conversión de consonantes se realiza con diccionarios de reglas externos incluidos en la model card, por lo que la calidad final depende de esos mapeos y no del modelo en sí.
- Específico del dialecto palestino: no se ha validado en árabe estándar moderno ni en otros dialectos, y su uso fuera de ese dominio puede producir vocalizaciones incorrectas.
- Requiere entrada diacritizada: si se le pasa texto sin vocalizar, no puede inferir la pronunciación; debe combinarse con el diacritizador Levanti.
- Riesgo de errores en contextos ambiguos: la vocalización del árabe coloquial depende del contexto y de la variación dialectal, y el modelo puede fallar en palabras poco frecuentes o préstamos.
- La licencia CC BY-SA 4.0 impone compartir bajo la misma licencia las obras derivadas y exige atribución; conviene revisar las implicaciones para uso comercial en productos propietarios.
- El dataset de entrenamiento (subconjunto de Levanti) no estaba publicado en el momento de la model card, lo que dificulta la reproducibilidad y la evaluación de sesgos.
- Con 30 descargas y 0 likes, la comunidad de validación es prácticamente inexistente; no hay evidencia externa de robustez en producción.
- Posibles sesgos derivados de la correspondencia forzada entre sistemas vocálicos: el árabe palestino y el hebreo no comparten inventario vocálico exacto, por lo que la salida es una aproximación y no una transcripción fonética precisa.
- No apto para generación de texto, razonamiento, código ni tareas multimodales; su uso fuera de la clasificación de tokens dará resultados sin sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guymorlan/levanti_diacritics2translit
- Diacritizador complementario: https://huggingface.co/guymorlan/levanti_arabic2diacritics
- Modelo base CANINE-s: https://huggingface.co/google/canine-s
- Dataset Levanti: https://huggingface.co/datasets/guymorlan/levanti
- Paper de CANINE (referencia del modelo base): no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
