# orucexe/ulduz-tokenizer-128k

## Resumen

Ulduz Tokenizer 128k (`orucexe/ulduz-tokenizer-128k`) es un tokenizador Byte-Level BPE de vocabulario 131.072 (2^17), disenado con enfoque prioritario en azeri y cobertura declarada de 204 idiomas. Lo desarrolla el usuario `orucexe` y se publica bajo licencia Apache-2.0. No es un modelo de lenguaje, sino el componente de tokenizacion que acompanaria a un LLM o a un modelo de embeddings/reranking. Su propuesta central es conseguir una reconstruccion 100% sin perdidas (lossless) y un vocabulario limpio, sin fragmentacion de numeros de un solo digito ni tokens basura con espacios.

El tokenizador se ha entrenado con una mezcla guiada por morfologia: un 55% de azeri (de ese porcentaje, un 65% pre-segmentado mediante un automata morfotactico finito de 29 estados con 88.516 raices verificadas y un 35% texto natural), un 25% de ingles, ruso y turco, y un 20% de otras 200 lenguas. Incorpora 32 tokens especiales que cubren tanto el uso en embeddings/reranker (`<cls>`, `<sep>`, `<mask>`) como en LLM conversacionales (`<|im_start|>`, `<|im_end|>`). Es relevante para quienes construyen pipelines multilingues con enfasis en lenguas turquicas, ya que el tokenizador afecta directamente al coste por token, a la calidad de la representacion morfologica y a la fidelidad de la reconstruccion del texto.

La implementacion es en Rust puro y compatible con `transformers` sin `trust_remote_code`, ademas de funcionar en vLLM, SentenceTransformers, llama.cpp y ONNX. El autor publica un modelo hermano, `orucexe/ulduz-morph-128k`, orientado a maxima precision en el aislamiento de raices morfologicas en tiempo de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Level BPE (tokenizador, no modelo neuronal) |
| Parametros totales | no disponible (no es un modelo de parametros; vocabulario de 131.072 tokens) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que use el tokenizador) |
| Tipos de cuantizacion | no aplica (tokenizador) |
| Idiomas soportados | az, en, ru, tr y cobertura declarada de 204 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | tokenizador en formato `transformers` (JSON de vocabulario y merges); compatible con llama.cpp y ONNX |

## Arquitectura y entrenamiento

El componente es un tokenizador Byte-Level BPE con vocabulario de 131.072 tokens. El entrenamiento es hibrido y guiado por morfologia: la porcion de azeri se compone de un 65% de texto pre-segmentado mediante un automata morfotactico finito de 29 estados con 88.516 raices verificadas, y un 35% de texto natural; a ello se suma un 25% de ingles, ruso y turco y un 20% de otras 200 lenguas. El autor declara un 0,000% de tokens multi-palabra con espacios, separacion de numeros de un solo digito (0-9), un 0,00% de `<unk>` y 32 tokens especiales para embeddings/reranker y para LLM conversacionales.

La implementacion en Rust puro permite su uso nativo en `transformers` sin codigo remoto, asi como en vLLM, SentenceTransformers, llama.cpp y ONNX. La innovacion principal no reside en un mecanismo de atencion ni en decodificacion especulativa, sino en la integracion de conocimiento morfologico del azeri durante la construccion del vocabulario, lo que se traduce en mayor preservacion de raices y menor fragmentacion en lenguas aglutinantes. El modelo hermano `ulduz-morph-128k` prioriza el aislamiento de raices (90,7% de precision) a costa de menor proporcion de tokens puros (46,5%).

## Capacidades

- Tokenizacion Byte-Level BPE con reconstruccion 100% lossless del texto de entrada.
- Cobertura multilingue declarada de 204 idiomas, con enfasis en azeri y en las lenguas az, en, ru y tr.
- Segmentacion guiada por morfologia para el azeri, con preservacion de raices y sufijos.
- Vocabulario limpio: sin tokens multi-palabra con espacios y con separacion de digitos individuales (0-9).
- Conjunto de 32 tokens especiales compatible con embeddings/reranker (`<cls>`, `<sep>`, `<mask>`) y con LLM conversacionales (`<|im_start|>`, `<|im_end|>`).
- Compatibilidad nativa con `transformers` (`trust_remote_code=False`), vLLM, SentenceTransformers, llama.cpp y ONNX.
- No dispone de capacidades generativas, de razonamiento, tool calling ni agentes: es exclusivamente un tokenizador.

## Casos de uso

- Entrenamiento de LLM en azeri y lenguas turquicas: el tokenizador reduce la fragmentacion de palabras aglutinantes y preserva raices, lo que disminuye el numero de tokens por frase y abarata el entrenamiento y la inferencia en esos idiomas.
- Modelos de embeddings y reranking multilingues: los tokens `<cls>`, `<sep>` y `<mask>` permiten reutilizarlo directamente en arquitecturas tipo BERT o bi-encoder para busqueda semantica en az, en, ru y tr.
- Pipelines de recuperacion aumentada (RAG) con corpus mixtos: la reconstruccion 100% lossless evita perdida de espacios y caracteres al indexar y al mostrar fragmentos citados al usuario.
- Procesamiento de documentos legales o administrativos en azeri: la segmentacion morfologica ayuda a mantener intactos terminos compuestos y sufijos en textos con vocabulario tecnico, como el ejemplo de la model card ("mikroiqtisadiyyatımızdakı").
- Integracion en servicios de inferencia de alto rendimiento: al funcionar en vLLM y llama.cpp con implementacion en Rust, puede desplegarse en servidores de generacion sin dependencias de codigo remoto.
- Normalizacion y analisis linguistico: la separacion de digitos individuales y la ausencia de `<unk>` facilitan el preprocesado de datos numericos y multilingues en tareas de NLP.
- Sustitucion de tokenizadores genericos en modelos existentes: util para proyectos que necesitan mejorar la eficiencia por token en azeri sin cambiar de arquitectura de modelo.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a metricas de tokenizacion (no a benchmarks de calidad de modelo). Se evaluan sobre `facebook/belebele` (`azj_Latn`, 900 items), `CohereForAI/include-base-44` (test de azeri, 548 items) y Wikipedia en en, ru, tr y 74 idiomas adicionales. Las flechas hacia abajo indican menor es mejor (tokens por palabra).

| Tokenizador | Vocab | Belebele-AZ ↓ | INCLUDE-44 AZ ↓ | %Pure ↑ | Morph Prec ↑ | Root Intact ↑ | EN ↓ | RU ↓ | TR ↓ | World-74 B/Tok ↑ | Lossless ↑ |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `orucexe/ulduz-tokenizer-128k` | 131.072 | 1,534 | 3,737 | 75,6% | 64,6% | 78,7% | 1,51 | 2,06 | 1,81 | 4,34 | 100,0% |
| `orucexe/ulduz-morph-128k` | 131.072 | 1,784 | 3,776 | 46,5% | 90,7% | 90,4% | 1,52 | 2,05 | 2,07 | 4,37 | 100,0% |
| `allmalab/aLLMA-2-tokenizer` | 32.000 | 1,572 | 4,326 | 72,4% | 56,4% | 75,5% | 2,27 | 3,94 | 2,65 | 1,43 | 100,0% |
| `nijatzeynalov/gpt2-azerbaijani-small` | 50.257 | 1,489 | 4,228 | 78,4% | 58,1% | 80,2% | 2,08 | 3,16 | 2,53 | 1,55 | 100,0% |
| `LocalDoc/az-en-unigram-tokenizer-50k` | 50.001 | 1,507 | 2,891* | 75,2% | 68,9% | 79,6% | 1,48 | 2,14 | 2,66 | 5,44* | 24,2% |
| `LocalDoc/LocRet-small` | 250.002 | 1,867 | 2,978* | 49,6% | 62,5% | 61,8% | 1,54 | 1,95 | 1,87 | 5,93* | 25,1% |
| `hajili/roberta-base-azerbaijani` | 250.002 | 1,867 | 2,978* | 49,6% | 62,5% | 61,8% | 1,54 | 1,95 | 1,87 | 5,93* | 25,1% |
| `BAAI/bge-m3` | 250.002 | 1,867 | 2,978* | 49,6% | 62,5% | 61,8% | 1,54 | 1,95 | 1,87 | 5,93* | 25,1% |
| `Alibaba-NLP/gte-multilingual-base` | 250.002 | 1,867 | 2,978* | 49,6% | 62,5% | 61,8% | 1,54 | 1,95 | 1,87 | 5,93* | 25,1% |
| `Qwen/Qwen2.5-7B-Instruct` | 151.665 | 3,533 | 4,487 | 9,1% | 25,2% | 24,3% | 1,43 | 2,77 | 2,66 | 2,47 | 100,0% |

*Segun la model card, los tokenizadores no lossless descartan o normalizan espacios o emiten `<unk>` (`LocalDoc-50k` presenta un 29,3% de `<unk>` en World-74; los modelos de 250k presentan un 2,4%). El autor declara 0,00% de `<unk>` y 100,0% de reconstruccion lossless para sus tokenizadores. Nota: varias filas de la tabla original repiten los mismos valores numericos, lo que impide verificar la independencia de esas mediciones.

## Requisitos de hardware

- El tokenizador no requiere GPU: la tokenizacion se ejecuta en CPU con implementacion en Rust.
- Huella en disco y memoria muy reducida: el vocabulario de 131.072 tokens y los merges ocupan del orden de decenas de megabytes, aunque el tamano exacto no esta disponible.
- No necesita VRAM dedicada; la GPU solo es necesaria para el modelo de lenguaje o de embeddings que consuma este tokenizador.
- Compatible con despliegue en vLLM, llama.cpp, ONNX Runtime, SentenceTransformers y `transformers`.
- Latencia y throughput de tokenizacion: no disponibles en la informacion proporcionada.
- Cabe en cualquier entorno, incluidos dispositivos de borde y contenedores de bajos recursos.

## Comparativa con modelos similares

| Tokenizador | Vocab | Idiomas | Lossless | Licencia | Disponibilidad |
| :--- | ---: | :--- | :--- | :--- | :--- |
| `orucexe/ulduz-tokenizer-128k` | 131.072 | 204 declarados (enfasis az) | 100,0% | Apache-2.0 | Hugging Face |
| `orucexe/ulduz-morph-128k` | 131.072 | 204 declarados (enfasis az) | 100,0% | no disponible | Hugging Face |
| `nijatzeynalov/gpt2-azerbaijani-small` | 50.257 | az, en | 100,0% | no disponible | Hugging Face |
| `LocalDoc/az-en-unigram-tokenizer-50k` | 50.001 | az, en | 24,2% | no disponible | Hugging Face |
| `Qwen/Qwen2.5-7B-Instruct` (tokenizador) | 151.665 | multilingue | 100,0% | Apache-2.0 (modelo) | Hugging Face |

Frente a los tokenizadores especificos de azeri de menor vocabulario, Ulduz 128k ofrece mayor cobertura idiomatica y mejor ratio en World-74 (4,34 B/Tok) con reconstruccion lossless. Frente al tokenizador de Qwen2.5, mejora notablemente en azeri (1,534 frente a 3,533 en Belebele-AZ) y en turco (1,81 frente a 2,66), aunque el tokenizador de Qwen es ligeramente mejor en ingles (1,43 frente a 1,51).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Las metricas de benchmarks las publica el propio autor; no se dispone de evaluacion independiente.
- La model card contiene filas con valores identicos repetidos (`LocalDoc/LocRet-small`, `hajili/roberta-base-azerbaijani`, `BAAI/bge-m3`, `Alibaba-NLP/gte-multilingual-base`), lo que reduce la fiabilidad de la comparativa tal como se presenta.
- El rendimiento en azeri es el mas bajo de la tabla en Belebele-AZ (1,534) frente a `nijatzeynalov/gpt2-azerbaijani-small` (1,489) y `LocalDoc/az-en-unigram-tokenizer-50k` (1,507), aunque el autor prioriza otras metricas como lossless y cobertura.
- La cobertura de 204 idiomas es una declaracion del autor; no se detalla la lista ni el rendimiento por idioma fuera de los agregados World-74.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- No se detallan sesgos, riesgos de alucinacion ni comportamiento en dominios especializados, ya que no aplica a un tokenizador.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos de los corpus de entrenamiento, no documentados en la informacion disponible.
- El formato exacto de los ficheros de pesos y el tamano en disco no estan disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/orucexe/ulduz-tokenizer-128k
- Modelo hermano: https://huggingface.co/orucexe/ulduz-morph-128k
- Dataset de evaluacion Belebele: https://huggingface.co/datasets/facebook/belebele
- Dataset de evaluacion INCLUDE: https://huggingface.co/datasets/CohereForAI/include-base-44
- No se han proporcionado enlaces a papers, blogs, repositorios o demos adicionales.
