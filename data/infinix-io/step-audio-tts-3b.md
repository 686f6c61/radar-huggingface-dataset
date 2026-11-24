# Infinix-io/Step-Audio-TTS-3B

## Resumen

Step-Audio-TTS-3B es un modelo de síntesis de voz (text-to-speech) desarrollado por Infinix-io, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un LLM de 3.529.706.496 parámetros (aproximadamente 3,5 mil millones) entrenado con un paradigma de chat LLM sobre un conjunto de datos sintético a gran escala, y que emplea una arquitectura de doble codebook para generar audio. El repositorio incluye tanto los pesos del modelo como un vocoder entrenado con el mismo enfoque de doble codebook y un vocoder especializado en la generación de humming (tarareo).

El modelo se presenta como el primero de la industria en generar RAP y humming, y declara resultados SOTA de Character Error Rate (CER) en el benchmark SEED TTS Eval. Su relevancia actual radica en que aborda la síntesis de voz expresiva y con control de estilo, un área donde la mayoría de los sistemas TTS se limitan a la locución neutra. Al estar construido sobre un backbone tipo LLM, hereda la flexibilidad del paradigma de chat para el control de emociones y estilos vocales.

La información disponible en la model card es limitada en cuanto a detalles de entrenamiento, idiomas exactos y procedimiento de despliegue. El repositorio ocupa 8,6 GB e incluye pesos en formato safetensors y ONNX, con código personalizado (`custom_code`) necesario para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM con doble codebook para TTS (backbone tipo transformer, tag `step1`) |
| Parametros totales | 3.529.706.496 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card menciona "multiple languages" sin especificar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Step-Audio-TTS-3B es un LLM de aproximadamente 3,5 mil millones de parámetros entrenado bajo el paradigma LLM-Chat para síntesis de voz. La innovación arquitectónica principal es el uso de un esquema de doble codebook: el backbone genera tokens de audio en dos codebooks paralelos, que posteriormente son convertidos a forma de onda por un vocoder también entrenado con el enfoque de doble codebook. El repositorio incluye además un vocoder especializado para la generación de humming. El tag `step1` sugiere que el modelo pertenece a la familia Step-Audio, aunque no se detalla la relación exacta con otros modelos de dicha familia.

El entrenamiento se realizó sobre un conjunto de datos sintético a gran escala, según indica la model card, lo que constituye el primer caso documentado de un TTS entrenado con el paradigma LLM-Chat sobre datos sintéticos. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La información sobre el proceso de alineación y las etapas de entrenamiento no está disponible.

## Capacidades

- Síntesis de voz (TTS) de alta calidad con resultados SOTA en CER sobre el benchmark SEED TTS Eval.
- Generación de RAP, capacidad que la model card presenta como primera en la industria para un modelo TTS.
- Generación de humming (tarareo), mediante un vocoder especializado incluido en el repositorio.
- Control de expresiones emocionales variadas.
- Control de estilos vocales diversos.
- Soporte multilingüe (la model card menciona "multiple languages" sin enumerarlos).
- Paradigma LLM-Chat aplicado al TTS, lo que permite interacción conversacional para el control de la síntesis.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo especializado en TTS.

## Casos de uso

- Síntesis de voz para asistentes conversacionales: el modelo puede generar respuestas habladas con control de emoción y estilo, adecuado para integrarse en pipelines de atención al cliente donde se requiera una voz expresiva y no meramente neutra.
- Producción de audiolibros y narración: la capacidad de controlar estilo y emoción permite adaptar la locución a distintos pasajes narrativos, y el soporte multilingüe facilita la localización de contenidos.
- Generación de contenido musical hablado: la capacidad de generar RAP lo hace adecuado para prototipos de música urbana, jingles o contenido creativo donde se requiera locución rítmica.
- Creación de contenido para redes sociales: la generación de humming y estilos vocales variados permite producir piezas cortas con tarareo o locuciones estilizadas sin necesidad de un intérprete humano.
- Doblaje y localización de vídeo: el soporte multilingüe y el control de estilo permiten generar pistas de voz en distintos idiomas manteniendo un registro expresivo consistente.
- Sistemas de accesibilidad: la síntesis de voz expresiva con control emocional mejora la experiencia de lectores de pantalla y aplicaciones de comunicación aumentativa.
- Prototipado rápido de interfaces de voz: al estar disponible en safetensors y ONNX con licencia Apache 2.0, puede integrarse en entornos de desarrollo para validar experiencias de voz antes de invertir en soluciones comerciales.

## Benchmarks y rendimiento

Resultados de CER/WER en contenido (comparación con GLM-4-Voice y MinMo):

| Modelo | test-zh CER (%) ↓ | test-en WER (%) ↓ |
|---|---|---|
| GLM-4-Voice | 2,19 | 2,91 |
| MinMo | 2,48 | 2,90 |
| Step-Audio | 1,53 | 2,71 |

Resultados en los conjuntos de test SEED:

| Modelo | test-zh CER (%) ↓ | test-zh SS ↑ | test-en WER (%) ↓ | test-en SS ↑ |
|---|---|---|---|---|
| FireRedTTS | 1,51 | 0,630 | 3,82 | 0,460 |
| MaskGCT | 2,27 | 0,774 | 2,62 | 0,774 |
| CosyVoice | 3,63 | 0,775 | 4,29 | 0,699 |
| CosyVoice 2 | 1,45 | 0,806 | 2,57 | 0,736 |
| CosyVoice 2-S | 1,45 | 0,812 | 2,38 | 0,743 |
| Step-Audio-TTS-3B-Single | 1,37 | 0,802 | 2,52 | 0,704 |
| Step-Audio-TTS-3B | 1,31 | 0,733 | 2,31 | 0,660 |
| Step-Audio-TTS | 1,17 | 0,73 | 2,0 | 0,660 |

Comparación de resíntesis con doble codebook frente a CosyVoice (datos parciales en la model card; solo se dispone de la fila Groundtruth con CER 0,972 en test-zh y WER 2,156 en test-en, sin valores de SS).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,53 mil millones de parámetros, en precisión completa (fp32) se requieren aproximadamente 14 GB solo para los pesos; en fp16/bf16 unos 7 GB; en cuantización de 8 bits unos 3,5 GB y en 4 bits unos 1,8 GB, aunque estas estimaciones son orientativas y no están confirmadas por el autor.
- El repositorio ocupa 8,6 GB, lo que incluye pesos del modelo y vocoders.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8 GB o más de VRAM en fp16, y en tarjetas de 4-6 GB con cuantización, aunque no está confirmado por el autor.
- Opciones de despliegue: el repositorio incluye formato ONNX y safetensors con `custom_code`, lo que sugiere despliegue mediante ONNX Runtime o bibliotecas personalizadas. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER test-zh | WER test-en | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Step-Audio-TTS-3B | 3,53 B | no disponible | 1,31 | 2,31 | Apache 2.0 | Hugging Face |
| CosyVoice 2 | no disponible | no disponible | 1,45 | 2,57 | no disponible | no disponible |
| MaskGCT | no disponible | no disponible | 2,27 | 2,62 | no disponible | no disponible |
| FireRedTTS | no disponible | no disponible | 1,51 | 3,82 | no disponible | no disponible |

Step-Audio-TTS-3B obtiene el mejor CER en test-zh (1,31) de la comparativa, aunque su SS (0,733) es inferior al de CosyVoice 2 (0,806) y MaskGCT (0,774), lo que indica que prioriza inteligibilidad sobre similitud de hablante. La variante Step-Audio-TTS-3B-Single mejora el SS (0,802) a costa de un CER ligeramente superior (1,37).

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al entrenarse sobre datos sintéticos a gran escala, puede heredar sesgos de la distribución de voces sintéticas empleada.
- Riesgo de alucinación en la síntesis: no se documenta el comportamiento ante textos fuera de distribución o con caracteres especiales.
- Idiomas exactos no especificados: la model card menciona "multiple languages" sin enumerarlos, lo que impide confirmar cobertura para idiomas distintos del chino e inglés evaluados en los benchmarks.
- Longitud de contexto no disponible, lo que limita la planificación de despliegue para textos largos.
- Ausencia de datos sobre cuantización y despliegue en producción (vLLM, TGI, etc.).
- El modelo requiere código personalizado (`custom_code`) para su carga, lo que añade complejidad de integración y riesgo de incompatibilidad con versiones futuras de las bibliotecas.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la procedencia de los datos sintéticos de entrenamiento y de las voces utilizadas para evitar problemas de derechos de imagen o voz.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/Step-Audio-TTS-3B
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
