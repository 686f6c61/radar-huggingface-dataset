# ngocdang83/HachimiMT-60-QT

## Resumen

HachimiMT-60-QT es un modelo de traducción automática neuronal (NMT) especializado en la traducción de novelas web chinas (webnovels) al vietnamita, desarrollado por ngocdang83. Se trata de una edición "QT" (registro clásico) del modelo base HachimiMT-60, diseñada específicamente para mantener de forma consistente el registro pronominal arcaico conocido como "truyện convert" —con formas como *ta*, *ngươi*, *hắn*, *nàng*, *tỷ tỷ*, *ca ca*— a lo largo de todo un capítulo, evitando los cambios de voz que cometen los traductores automáticos genéricos.

El modelo se basa en la arquitectura MarianMT (transformer encoder-decoder) y cuenta con 56,4 millones de parámetros, un tamaño contenido que permite su ejecución en CPU y GPU de consumo. Está entrenado sobre dos datasets específicos de traducción chino-vietnamita y licenciado bajo CC-BY-4.0, lo que facilita su uso comercial con atribución. Su relevancia actual radica en resolver un problema muy concreto y frustrante para los lectores de novelas traducidas: la inestabilidad del registro pronominal, que en los modelos genéricos cambia de arcaico a moderno a mitad de párrafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | 56.397.120 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (los ejemplos usan max_length 256 tokens) |
| Tipos de cuantizacion | INT8 (export CTranslate2 incluido en el repo) |
| Idiomas soportados | chino (zh) y vietnamita (vi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors y CTranslate2 (ct2-int8_float32) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura MarianMT, un transformer encoder-decoder estándar para traducción automática, con 56,4 millones de parámetros. No se trata de un modelo MoE ni híbrido; es un modelo denso de tamaño pequeño-medio, optimizado para una tarea específica de traducción entre dos idiomas.

El entrenamiento se realizó sobre dos datasets: `ngocdang83/tran-vi-teacher` y `chi-vi/hirashiba-mt-zh2vi-b-filtered`. La innovación principal de la edición QT es el preprocesado de los datos de entrenamiento: todo el sistema pronominal fue normalizado a un registro arcaico consistente (convert), de modo que el modelo aprende a usar siempre las mismas formas para "yo", "tú", "él", "ella" y "nosotros", sin alternar con las formas modernas. El autor no detalla si se aplicaron técnicas de RLHF o DPO; el ajuste se basa en la normalización del corpus.

## Capacidades

- Traducción automática chino → vietnamita con registro pronominal arcaico consistente (convert), sin cambios de voz entre líneas o párrafos.
- Mantenimiento de la coherencia pronominal en oraciones con múltiples pronombres (hasta cuatro en una misma frase, como *hắn*, *ngươi*, *nàng*, *chúng ta*).
- Manejo de párrafos largos multi-cláusula sin mezclar registros dentro del mismo párrafo.
- Generación de texto con beam search (num_beams=4) y early stopping, según los parámetros recomendados.
- Inferencia rápida en CPU mediante el export CTranslate2 INT8 incluido en el repositorio.
- No soporta tool calling, agentes, visión ni audio; es exclusivamente un modelo de traducción.

## Casos de uso

- Traducción de novelas xianxia y xuanhuan: el modelo produce traducciones con el registro arcaico que los lectores vietnamitas esperan en este género, manteniendo la voz estable durante capítulos enteros.
- Traducción de novelas históricas y danmei: el registro convert encaja con ambientaciones históricas y de fantasía, donde las formas modernas de tratamiento resultarían anacrónicas.
- Publicación serializada de webnovels: al mantener la consistencia pronominal, se reduce el trabajo de revisión editorial necesario para corregir cambios de registro entre capítulos.
- Traducción de diálogos con múltiples personajes: el modelo distingue correctamente los pronombres de cada interlocutor en escenas con varios hablantes, evitando confusiones de referencia.
- Generación de subtítulos o resúmenes de novelas chinas para plataformas de lectura: el registro consistente facilita la lectura continua sin interrupciones por cambios de estilo.
- Prototipado de pipelines de traducción editorial: al ser un modelo pequeño y con licencia permisiva, puede integrarse en flujos de traducción automatizada con revisión humana posterior, especialmente en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (BLEU, COMET, etc.) en la informacion disponible. El autor reporta una métrica propia: sobre 7 capítulos de 7 géneros distintos (538 líneas), el modelo base HachimiMT-60 cambia de registro pronominal en aproximadamente el 24% de las transiciones de línea, mientras que la edición QT presenta un 0% de cambios en las clases de "tú", "yo", "nosotros" y tercera persona. No se proporcionan comparaciones con otros modelos de traducción zh-vi en métricas de calidad de traducción.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 56,4 millones de parámetros, la inferencia en FP32 requiere aproximadamente 225 MB de VRAM; con cuantización INT8, unos 56 MB adicionales de peso, más overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior permite inferencia en tiempo real. También funciona en GPU integradas y en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluso en las más modestas.
- Opciones de despliegue: transformers (Python), CTranslate2 para CPU (export INT8 incluido), y puede servirse con Hugging Face Inference Endpoints (endpoints_compatible).
- Latencia y throughput: no se han publicado mediciones oficiales; en CPU con CTranslate2 INT8 se espera una velocidad varias veces superior a la inferencia FP32 en transformers, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Registro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HachimiMT-60-QT | 56,4 M | no disponible | Convert arcaico consistente | CC-BY-4.0 | Hugging Face |
| HachimiMT-60 (base) | 56,4 M | no disponible | Mixto (cambia entre arcaico y moderno) | CC-BY-4.0 | Hugging Face |
| Hirashiba-MT zh2vi | no disponible | no disponible | no disponible | no disponible | dataset en Hugging Face |

La comparativa se limita al modelo base del mismo autor y al dataset Hirashiba-MT, que se usó como fuente de entrenamiento. No se dispone de información suficiente sobre otros modelos de traducción chino-vietnamita para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El registro arcaico se aplica a todos los contextos, incluidos escenarios modernos: frases como "¿Por qué no descansas aún?" se traducen con formas arcaicas, lo que puede resultar inapropiado para novelas de ambientación contemporánea.
- Se pierde la distinción entre "nosotros" inclusivo y exclusivo: tanto 我们 como 咱们 se traducen como "chúng ta".
- El tratamiento íntimo moderno entre amantes (anh/em) se convierte sistemáticamente en ta/ngươi, lo que puede alterar matices emocionales en escenas románticas.
- Nombres propios poco frecuentes y términos acuñados pueden sufrir desplazamientos silábicos o traducciones literales incorrectas (ejemplo documentado: 异瞳金丝猴 → "Kim Tơ Hầu" en lugar de "Kim Ty Hầu").
- No se debe usar `no_repeat_ngram_size` durante la decodificación, ya que degrada la calidad de los nombres propios.
- El modelo solo cubre chino y vietnamita; no es multilingüe ni admite otras combinaciones de idiomas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero exige citar al autor en los productos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngocdang83/HachimiMT-60-QT
- Modelo base HachimiMT-60: https://huggingface.co/ngocdang83/HachimiMT-60-zh-vi
- Repositorio GitHub con Colab: https://github.com/ngocdang8311/hachimimt-colab
- Notebook Colab: https://colab.research.google.com/github/ngocdang8311/hachimimt-colab/blob/master/HachimiMT_Colab.ipynb
- Dataset de entrenamiento 1: https://huggingface.co/datasets/ngocdang83/tran-vi-teacher
- Dataset de entrenamiento 2: https://huggingface.co/datasets/chi-vi/hirashiba-mt-zh2vi-b-filtered
