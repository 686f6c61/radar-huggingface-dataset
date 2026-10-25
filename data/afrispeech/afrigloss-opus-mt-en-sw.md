# AfriSpeech/afrigloss-opus-mt-en-sw

## Resumen

AfriSpeech/afrigloss-opus-mt-en-sw es un modelo de traducción automática inglés → suajili (kiswahili) desarrollado por AfriSpeech dentro del marco Afri-Gloss-MT. Se distribuye en Hugging Face como un checkpoint de la familia Marian/OPUS-MT, con 74.380.359 parámetros y licencia Apache 2.0, orientado a traducción con control terminológico.

Su particularidad es que acepta términos destino insertados entre corchetes angulares (`<término>`) en la frase de origen y los conserva en la traducción generada, lo que permite imponer glosarios sin reentrenar el modelo. El autor reporta un 96,2% de adherencia a las restricciones de glosario y 23,75 BLEU sobre más de 4.300 frases de test no vistas; la longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parámetros totales | 74.380.359 |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; no se publican cuantizaciones oficiales |
| Idiomas soportados | Inglés (`en`) y suajili/kiswahili (`swh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | translation |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El checkpoint utiliza una arquitectura Marian de tipo transformer encoder-decoder para traducción automática, tal como indican la clase `MarianMTModel` empleada en la model card y las etiquetas del repositorio. El nombre y las etiquetas lo sitúan en la familia OPUS-MT, aunque no se detalla el checkpoint base exacto ni la configuración concreta de capas y atención.

El modelo fue ajustado dentro del marco Afri-Gloss-MT sobre 78.657 frases paralelas procedentes de `AfriSpeech/africa-corpus` y `AfriSpeech/african-corpus-jw`, con reemplazos de sintagmas nominales in situ verificados al 100%. El objetivo es que el modelo aprenda a respetar términos destino insertados entre corchetes angulares. No se especifican el número total de tokens de entrenamiento, la composición detallada del dataset, el uso de RLHF/DPO ni otras innovaciones de decodificación.

## Capacidades

- Traducción directa de inglés a suajili/kiswahili.
- Control terminológico zero-shot mediante términos destino insertados entre `<...>` en la frase de origen.
- Conservación de términos de glosario en la salida, con una adherencia reportada del 96,2%.
- Traducción de frases con múltiples términos impuestos; el ejemplo de la model card incluye tres términos en una misma oración.
- Capacidad multilingüe limitada a los pares `en` y `swh`; no se documentan otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio, código, matemáticas o modo de razonamiento explícito.

## Casos de uso

- Localización de documentación técnica con glosario corporativo: se insertan los términos aprobados entre `<...>` antes de traducir y el modelo los conserva, lo que reduce la variabilidad terminológica en manuales y guías.
- Traducción de contratos y políticas internas con terminología legal fija: el flujo permite imponer términos jurídicos normalizados y revisar después la salida con un glosario verificable.
- Atención al cliente en suajili: traducción de respuestas, artículos de ayuda y conversaciones de soporte manteniendo nombres de producto o términos internos previamente definidos.
- Traducción de material sanitario o educativo: útil para imponer terminología médica, educativa o administrativa normalizada en contenidos destinados a revisión humana.
- Integración en pipelines de publicación multilingüe: el checkpoint puede ejecutarse con `transformers` en lotes, insertando y limpiando los corchetes angulares antes y después de la inferencia.
- Herramientas CAT/TMS y flujos de postedición: el traductor humano puede definir el glosario, preinsertar términos y usar la salida como borrador con menor necesidad de corrección terminológica.
- Evaluación de recursos terminológicos: permite medir la adherencia a glosarios en condiciones controladas antes de desplegar un sistema de traducción más amplio.

## Benchmarks y rendimiento

| Métrica | Resultado | Notas |
|---|---:|---|
| BLEU | 23,75 | Evaluado con `sacrebleu` |
| chrF2 | 53,42 | Character n-gram F-score |
| Adherencia a glosario | 96,2% | Porcentaje de términos inyectados que se conservan en la salida |

La evaluación se realizó sobre más de 4.300 frases de test no vistas. No se han publicado resultados comparativos con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada solo para pesos: aproximadamente 0,30 GB en FP32, 0,15 GB en FP16, 0,07 GB en INT8 y 0,04 GB en INT4. Son estimaciones teóricas a partir de los 74,38 M de parámetros; el repositorio no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU CUDA con memoria suficiente para el modelo y el proceso de decodificación. Una RTX 4090, A100 o H100 es innecesaria por tamaño, aunque puede utilizarse.
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint. También es viable la inferencia en CPU para cargas moderadas, aunque no se publican requisitos oficiales.
- Opciones de despliegue documentadas: `transformers` con `MarianMTModel` y `MarianTokenizer`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponible; no se publican mediciones de rendimiento en producción.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks, parámetros o licencias de alternativas comparables en la información proporcionada. La alternativa conceptual más directa sería un modelo OPUS-MT inglés-suajili genérico sin control de glosario, pero esta ficha no puede confirmar sus métricas ni condiciones.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| AfriSpeech/afrigloss-opus-mt-en-sw | 74,38 M | No disponible | BLEU 23,75; chrF2 53,42; adherencia 96,2% | Apache 2.0 | Hugging Face |
| OPUS-MT en-sw genérico (referencia cualitativa) | No disponible | No disponible | No disponible | No disponible | No disponible en esta ficha |
| Modelo alternativo con control de glosario para en-sw | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El control de glosario depende de que los términos se inserten con el formato `<término>`; no se documenta el comportamiento con otros formatos o sin preprocesado.
- No se especifica la longitud máxima de contexto; los textos largos pueden requerir segmentación y aumentar el riesgo de omisiones.
- La adherencia del 96,2% no implica una conservación perfecta de todos los términos en todos los dominios.
- Existe riesgo de alucinación, omisión o errores gramaticales en traducción, especialmente fuera de los dominios representados en el corpus de ajuste.
- No se documentan sesgos conocidos, evaluaciones de seguridad ni robustez frente a dominios especializados.
- La licencia del checkpoint es Apache 2.0, pero no se detallan en la información disponible las licencias de los datasets de entrenamiento; conviene revisarlas antes de un uso comercial.
- No se publican cuantizaciones oficiales ni conversiones validadas a GGUF u otros formatos.
- El modelo cubre únicamente inglés → suajili/kiswahili; no se documenta traducción inversa ni otros pares lingüísticos.

## Enlaces

- [Hugging Face: AfriSpeech/afrigloss-opus-mt-en-sw](https://huggingface.co/AfriSpeech/afrigloss-opus-mt-en-sw)
- [Repositorio GitHub de Afri-Gloss-MT](https://github.com/AfriSpeech/afrigloss-mt)
- [Colección Afri-Gloss-MT Models](https://huggingface.co/collections/AfriSpeech/afri-gloss-mt-models-6adce3a3c13c6a86f07b6e6d)
- [Dataset AfriSpeech/africa-corpus](https://huggingface.co/datasets/AfriSpeech/africa-corpus)
- [Dataset AfriSpeech/african-corpus-jw](https://huggingface.co/datasets/AfriSpeech/african-corpus-jw)
