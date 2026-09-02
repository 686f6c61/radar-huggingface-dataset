# Jommarn-Ai/UNSEEN_Gemma_4_26B_NSFW-IQ2_M-GGUF

## Resumen

UNSEEN_Gemma_4_26B_NSFW-IQ2_M-GGUF es una cuantización extrema de 2 bits (IQ2_M) del modelo abliterado UNSEEN_Gemma_4_26B_NSFW, desarrollado por Jommarn-Ai a partir del modelo base google/gemma-4-26B-A4B-it de Google. Este repositorio ofrece los pesos GGUF del modelo de lenguaje junto con un proyector de visión (mmproj) en varias cuantizaciones, lo que permite ejecutar inferencia multimodal (imagen y texto) en GPUs de gama baja con tan solo 10-12 GB de VRAM.

El modelo está orientado a un uso sin censura (uncensored) y contiene contenido NSFW explícito, tras aplicar una técnica de ablación (abliteration) que elimina los mecanismos de rechazo del modelo original. Soporta inglés y tailandés, y destaca por su capacidad de generar descripciones extremadamente detalladas de imágenes, como demuestra el ejemplo de salida incluido en la model card. Su relevancia radica en ofrecer una alternativa de muy bajo consumo de recursos para tareas de generación de contenido multimodal en entornos con hardware limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Gemma 4 26B A4B, con proyector de vision |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | 4 B (segun la nomenclatura del modelo base 26B-A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M para el LLM; mmproj en F16, Q8_0 y Q4_0 |
| Idiomas soportados | ingles (en), tailandes (th) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivos mmproj-*.gguf adicionales) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-26B-A4B-it, un transformer multimodal de mezcla de expertos (MoE) con 26 mil millones de parametros totales y 4 mil millones activos por token. Sobre este, Jommarn-Ai ha aplicado una tecnica de abliteracion (abliteration) que elimina selectivamente las capas o pesos responsables del rechazo de contenido, dando lugar a UNSEEN_Gemma_4_26B_NSFW. Este repositorio concreto contiene la version cuantizada a 2 bits (IQ2_M) del LLM, junto con un proyector de vision (mmproj) que permite procesar imagenes.

No se dispone de informacion detallada sobre el proceso de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas de RLHF o DPO. La cuantizacion IQ2_M es una tecnica de compresion agresiva que reduce significativamente el tamano del modelo (a unos 9,67 GB) a costa de una perdida de precision notable. El proyector de vision se ofrece en tres niveles de cuantizacion para equilibrar calidad y uso de memoria.

## Capacidades

- Generacion de texto libre y conversacional, con un estilo detallado y descriptivo.
- Comprension de imagenes (multimodal) gracias al proyector de vision, permitiendo describir escenas, personajes, poses, iluminacion y otros elementos visuales con gran minuciosidad.
- Generacion de descripciones bilingues (ingles y tailandes) de una misma imagen.
- Contenido sin censura: el modelo no rechaza solicitudes explicitas ni de caracter sexual, gracias a la abliteracion.
- Capacidad de razonamiento visual avanzado, como se muestra en el ejemplo de salida donde analiza composicion, estilo, anatomía y detalles de una ilustracion.
- Ejecucion eficiente en hardware de baja gama gracias a la cuantizacion 2-bit y a los proyectores de vision ligeros.

## Casos de uso

- Generacion de contenido creativo para adultos: el modelo puede producir narrativas explicitas o descripciones detalladas de escenas, adecuadas para plataformas de ficcion erotica o proyectos artisticos que requieren un tono sin restricciones.
- Analisis y etiquetado de imagenes en entornos de investigacion: permite extraer descripciones textuales completas de imagenes, utiles para construir datasets o estudiar sesgos en modelos multimodales.
- Desarrollo de asistentes conversacionales sin filtros: integrable en aplicaciones de chat donde se necesita una respuesta libre de moderacion, aunque con las debidas advertencias legales y eticas.
- Traduccion y localizacion de contenido visual: al generar descripciones en ingles y tailandes, puede servir como herramienta auxiliar para subtitulado o accesibilidad en esos idiomas.
- Prototipado rapido en entornos con recursos limitados: al caber en 12 GB de VRAM, es util para pruebas en portatiles o GPUs de consumo como RTX 3060 o Macs con 16 GB de RAM unificada.
- Investigacion sobre tecnicas de abliteracion y cuantizacion agresiva: permite estudiar el impacto de la compresion 2-bit en la calidad de salida y en la eliminacion de censura en modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica referencia de rendimiento es una prueba real mostrada en la model card: el modelo IQ2_M ejecutado en una NVIDIA T4 (16 GB VRAM) alcanzo una velocidad de 54,4 tokens por segundo con el proyector de vision cargado. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: 10-12 GB para el LLM cuantizado a IQ2_M (archivo de ~9,67 GB), mas 1,2 GB adicionales si se usa el mmproj en F16, o 800 MB en Q8_0, o 600 MB en Q4_0.
- GPUs compatibles: NVIDIA T4, RTX 3060 12GB, RTX 4060, y Macs con 16 GB o mas de memoria unificada. Tambien deberia funcionar en RTX 3090, RTX 4080, A10, etc., siempre que tengan al menos 12 GB de VRAM.
- Despliegue: compatible con llama.cpp, llama-server y LM Studio, utilizando el argumento `--mmproj` para cargar el proyector de vision. Sin el, el modelo funciona solo como LLM de texto.
- Latencia y throughput: en T4 se observaron 54,4 tokens/segundo; en GPUs mas potentes como RTX 4090 o A100 la velocidad seria mayor, aunque la cuantizacion 2-bit puede limitar el rendimiento por la baja precision.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con otros modelos equivalentes. Como referencia, el modelo base sin cuantizar (google/gemma-4-26B-A4B-it) requiere mucha mas VRAM (al menos 40 GB en FP16) y no esta abliterado. Otros modelos abliterados de tamano similar (por ejemplo, variantes de Llama 3 8B o Mistral 7B) tienen menos parametros y no son multimodales. La tabla siguiente ofrece una comparacion orientativa:

| Modelo | Parametros | Contexto | Multimodal | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| UNSEEN Gemma 4 26B (IQ2_M) | 25,2 B totales / 4 B activos | no disponible | Si | IQ2_M | no disponible |
| google/gemma-4-26B-A4B-it | 26 B totales / 4 B activos | no disponible | Si | FP16/BF16 | Gemma license |
| Llama 3.1 8B (abliterado) | 8 B | 128 K | No | GGUF (varias) | Llama 3.1 license |

## Limitaciones y advertencias

- Contenido NSFW explicito: el modelo genera material sexual grafico sin restricciones. Solo debe utilizarse en contextos legales y eticos apropiados, y nunca en aplicaciones publicas sin control de edad.
- Cuantizacion 2-bit: la compresion IQ2_M introduce una perdida de calidad significativa en comparacion con cuantizaciones superiores (Q4, Q8, FP16). Puede producir respuestas incoherentes, errores gramaticales o perdida de matices.
- Riesgo de alucinacion: al ser una cuantizacion muy agresiva, es mas propenso a inventar detalles, especialmente en tareas de razonamiento complejo o con imagenes ambiguas.
- Idiomas limitados: solo ingles y tailandes; no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia incierta: la model card no especifica la licencia; el modelo base Gemma tiene su propia licencia que puede restringir ciertos usos, y la abliteracion puede violar los terminos de uso de Google. Se recomienda verificar antes de un despliegue comercial.
- Sin garantias de seguridad: al eliminar la censura, tambien se eliminan los filtros de contenido peligroso (violencia, odio, etc.), por lo que puede generar respuestas inapropiadas o daninas.
- Dependencia del proyector de vision: sin cargar el archivo mmproj, el modelo no puede procesar imagenes, perdiendo su principal diferenciador.

## Enlaces

- Repositorio de cuantizacion: https://huggingface.co/Jommarn-Ai/UNSEEN_Gemma_4_26B_NSFW-IQ2_M-GGUF
- Modelo base (pesos completos): https://huggingface.co/Jommarn/UNSEEN_Gemma_4_26B_NSFW
- Modelo base original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Coleccion de Gemma 4 en Hugging Face (unsloth): https://huggingface.co/collections/unsloth/gemma-4
