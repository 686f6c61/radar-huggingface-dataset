# kawshikbuet17/bangla-heteronym-indicbertv2-mlm

## Resumen

Bangla Heteronym Reader es un modelo de clasificacion contextual de lecturas (pronunciaciones) de heteronimos en bengali, construido por Kawshik Kumar Paul (BUET) mediante fine-tuning de `ai4bharat/IndicBERTv2-MLM-only`. El problema que resuelve es concreto: en bengali muchas palabras se escriben igual pero se leen de forma distinta segun la frase (por ejemplo কর puede leerse como "impuesto" o como el verbo "hacer", con variantes de respelling distintas). El modelo recibe la palabra y la frase que la contiene y devuelve la lectura correcta en forma de respelling en escritura bengali, pensado como componente de front-end de un sistema text-to-speech o de grapheme-to-phoneme.

Arquitectonicamente es un encoder BERT (IndicBERTv2-MLM) con una cabeza lineal custom sobre el token marcador de apertura; no genera texto libre, solo puntua las lecturas candidatas conocidas de cada heteronimo. Tiene 278 millones de parametros, licencia MIT, y su rendimiento medido es alto pero acotado: 98,46 % de accuracy y 98,40 % de macro-F1 en el split de test del dataset principal (1.104 frases), con 11,3 ms por frase en una Tesla T4 en fp16.

Es relevante ahora porque cubre un nicho poco atendido (desambiguacion de pronunciacion para TTS en bengali) con latencia muy baja y licencia permisiva, aunque el propio autor recomienda para la mayoria de usos otro checkpoint de su benchmark (`bangla-heteronym-banglabert`, 99,46 %), donde este modelo queda quinto de doce.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (IndicBERTv2-MLM) con cabeza lineal de clasificacion de lecturas |
| Parametros totales | 278.041.344 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de IndicBERTv2-MLM; no se documenta en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | bengali (bn) |
| Licencia | MIT (hereda la licencia del modelo base, con aviso de copyright original en LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ai4bharat/IndicBERTv2-MLM-only` y anade una cabeza lineal pequena sobre el marcador de apertura de la palabra en la secuencia de entrada. La entrada tiene el formato `palabra` + `frase con la palabra marcada entre @`, por ejemplo `কর` + `আগে @ কর @ কাজটা, তারপর আবার কর।`. El encoder produce la representacion de ese marcador y la capa lineal puntua las lecturas candidatas de la palabra; gana la de mayor score. No hay decodificacion generativa ni beam search: es una clasificacion entre un conjunto cerrado de candidatos por palabra.

El fine-tuning se hizo sobre el dataset `kawshikbuet17/bangla-heteronyms` con 14 frases por lectura, usando AdamW, learning rate 5e-5, batch size 32, fp16, un maximo de 10 epocas con early stopping sobre accuracy de desarrollo, en una sola Tesla T4. No se documentan en la model card el volumen total de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF/DPO (no aplicable a esta tarea). La innovacion tecnica es el esquema de marcado de la palabra en la frase, que permite reutilizar un encoder multilingue indio ya preentrenado sin anadir un modulo de tagging separado.

## Capacidades

- Clasificacion contextual de la lectura de heteronimos en bengali entre un conjunto cerrado de candidatos por palabra.
- `phoneticize(text)`: reemplaza todos los heteronimos del texto por su lectura, dejando el resto intacto.
- `phoneticize_detailed(text)`: devuelve el texto reescrito mas posicion, lectura y confianza de cada heteronimo.
- `predict(sentence, word)`: lectura de la primera ocurrencia de una palabra en una frase.
- `predict_marked(text)` y `phoneticize_marked(text)`: operan solo sobre la palabra marcada con `[ ]`, util cuando la palabra aparece varias veces.
- Versiones `_batch` de todos los metodos para procesar listas de frases en una sola pasada.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking; no es un modelo generativo.
- Capacidad multilingue limitada al bengali (unico idioma declarado).
- Expone el diccionario de candidatos en `model.hconfig["candidates"]` para consultar las lecturas conocidas de cada palabra.

## Casos de uso

- Front-end de TTS en bengali: el modelo se coloca antes del sintetizador para convertir heteronimos en respellings correctos, de modo que el motor de voz pronuncie "kor" o "koro" segun la frase; la latencia de 11,3 ms por frase en T4 permite hacerlo en linea sin afectar la experiencia.
- Grapheme-to-phoneme para pipelines de voz: se integra como paso de desambiguacion previo a un G2P basado en reglas o a un lexico fonetico, sustituyendo la palabra escrita por su lectura antes de generar fonemas.
- Procesamiento por lotes de corpus: con `phoneticize_batch` y ~2.000 frases por segundo en T4 a batch 32, sirve para normalizar grandes volumenes de texto bengali de forma previa a la sintesis o al alineamiento fonetico.
- Anotacion asistida de datos de voz: al devolver posicion y confianza por heteronimo, permite filtrar automaticamente las frases de baja confianza para revision humana en proyectos de grabacion o validacion de corpus TTS.
- Lectura accesible y aprendizaje de idioma: en aplicaciones que muestran la pronunciacion de un texto bengali, el modelo puede anadir la lectura correcta de cada heteronimo junto a la palabra original.
- Control de calidad de transcripciones: `predict_marked` permite comprobar la lectura de una palabra concreta en una frase dada, util para auditar guiones o transcripciones antes de enviarlas a produccion de audio.
- Evaluacion comparativa de encoders: como checkpoint de referencia dentro del benchmark del autor, sirve para comparar encoders indios en una tarea de desambiguacion linguistica acotada.

## Benchmarks y rendimiento

Test set del split principal: 1.104 frases, 3 por lectura.

| Metrica | Este checkpoint (seed 42) | Media de 3 seeds |
|---|---|---|
| Accuracy | 98,46 % | 98,34 ± 0,21 % |
| Macro-F1 | 98,40 % | 98,29 ± 0,21 % |

Rendimiento de velocidad (pipeline completo, batch size 1): 11,3 ms por frase en Tesla T4 con fp16 y 31 ms en CPU con 4 hilos. En GPU, a batch size 32, procesa aproximadamente 2.000 frases por segundo. Por accuracy media en test, el modelo quedo quinto de doce en el benchmark del autor; el propio autor recomienda `bangla-heteronym-banglabert` (99,46 %, 12,5 ms en T4) para la mayoria de usos.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; no aplican a esta tarea de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 278 millones de parametros, en fp16 los pesos ocupan aproximadamente 0,55 GB y en fp32 aproximadamente 1,1 GB (el tamano del repo es de 1,1 GB), por lo que la huella total con overhead de runtime es de orden de 1-2 GB.
- GPU recomendadas: el autor reporta medidas en Tesla T4; cualquier GPU con al menos unos pocos GB de VRAM libre es suficiente. No hay datos publicados para A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, por el tamano de pesos; no se documenta una lista concreta de modelos verificados.
- Opciones de despliegue: la model card indica cargar el checkpoint con `Predictor.load` del repositorio GitHub `kawshikbuet17/bangla-heteronym-benchmark`, que incluye la cabeza custom; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 11,3 ms por frase en T4 fp16 y 31 ms en CPU de 4 hilos (batch 1); ~2.000 frases por segundo en T4 a batch 32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en el benchmark | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (IndicBERTv2-MLM) | 278 M | no disponible | 98,46 % (98,34 ± 0,21 % media de 3 seeds) | MIT | 11,3 ms por frase en T4 |
| bangla-heteronym-banglabert | no disponible | no disponible | 99,46 % | no disponible en la informacion proporcionada | 12,5 ms en T4; recomendado por el autor |
| Otros 10 modelos del benchmark del autor | no disponible | no disponible | no disponible individualmente | no disponible | Este modelo ocupa el quinto puesto de doce por accuracy media |

No se dispone de datos de parametros, contexto ni licencia de los modelos alternativos del benchmark en la informacion proporcionada, salvo el caso de banglabert en accuracy y latencia.

## Limitaciones y advertencias

- Solo cubre los heteronimos presentes en el dataset `bangla-heteronyms`; para cualquier otra palabra no hay lecturas entre las que elegir y `predict` lanza un `ValueError`.
- Las frases del dataset fueron escritas especificamente para el mismo, por lo que la accuracy en texto real puede ser inferior a la reportada en test.
- Es un clasificador de conjunto cerrado: no generaliza a lecturas no vistas ni descubre nuevos heteronimos.
- No es un modelo generativo: no produce texto libre, razonamiento, codigo ni respuestas conversacionales.
- Unico idioma soportado: bengali; no hay capacidades multilingues declaradas.
- No se documentan sesgos conocidos ni tasas de alucinacion medibles; el riesgo principal es una lectura incorrecta cuando el contexto real difiere del estilo del dataset.
- Licencia MIT, que permite uso comercial, pero el archivo LICENSE conserva el aviso de copyright original del modelo base `ai4bharat/IndicBERTv2-MLM-only`; conviene revisarlo antes de redistribuir.
- Requiere codigo externo (el repositorio GitHub del autor) para cargar la cabeza custom; no es un checkpoint cargable directamente con `AutoModelForSequenceClassification` sin ese codigo.
- En produccion, el autor recomienda otro checkpoint del mismo benchmark (banglabert) por mayor accuracy; usar este modelo implica aceptar una diferencia de aproximadamente 1 punto porcentual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kawshikbuet17/bangla-heteronym-indicbertv2-mlm
- Modelo base: https://huggingface.co/ai4bharat/IndicBERTv2-MLM-only
- Dataset de heteronimos: https://huggingface.co/datasets/kawshikbuet17/bangla-heteronyms
- Repositorio del benchmark y codigo de carga: https://github.com/kawshikbuet17/bangla-heteronym-benchmark
- Checkpoint recomendado por el autor: https://huggingface.co/kawshikbuet17/bangla-heteronym-banglabert
