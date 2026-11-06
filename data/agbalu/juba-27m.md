# agbalu/Juba-27M

## Resumen

Juba-27M es un modelo seq2seq de 26,9 millones de parámetros desarrollado por el usuario agbalu para una tarea muy concreta dentro del procesamiento del cabilio (taqbaylit, código ISO `kab`): la conversión de texto en neo-tifinaghe a latino cabilio estándar con restauración de la vocal schwa. El tifinaghe cabilio no escribe la vocal `e`, y determinar dónde va es una función del contexto consonántico, lo que convierte lo que parecería una simple sustitución de caracteres en un problema de secuencia. El modelo se entrena desde cero para resolver exactamente eso.

La relevancia del modelo es doble. Por un lado, es el primer modelo neuronal publicado para conversión de escritura y restauración de schwa en cabilio; la única alternativa existente era una tabla de caracteres determinista que alcanza un 1,16 % de coincidencia exacta de frase frente al 94,22 % de Juba-27M. Por otro, su tamaño reducido (26,9 M de parámetros, repositorio de 0,2 GB) permite inferencia en CPU en pocos milisegundos por frase, lo que lo hace desplegable en entornos sin GPU.

La arquitectura es un Conv-Transformer a nivel de carácter con código de modelado propio alojado en el repositorio, por lo que requiere `trust_remote_code=True`. No es un modelo de traducción entre idiomas ni un modelo generativo de propósito general: su ámbito es la transliteración y restauración vocálica dentro del cabilio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conv-Transformer a nivel de carácter (seq2seq) |
| Parámetros totales | 26.901.888 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación con `max_length=256` en el ejemplo de uso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | cabilio (`kab`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código de modelado personalizado (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un Conv-Transformer a nivel de carácter, es decir, opera sobre secuencias de caracteres en lugar de tokens subword. La entrada es texto en neo-tifinaghe y la salida es texto en latino cabilio con la schwa restaurada. La arquitectura no pertenece a las incluidas en la librería `transformers`, por lo que el código de modelado viaja en el propio repositorio y debe cargarse con `trust_remote_code=True`.

El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se especifica que el conjunto de test de `agbalu/KabTifinagh` (49.795 frases) es disjunto de entrenamiento y validación, y que el modelo se evaluó con decodificación greedy free-running, alimentándolo con su propia salida. Una innovación técnica destacable es la ausencia deliberada de caché de clave-valor: cada paso relee todo el prefijo, lo que garantiza que la inferencia coincida con la evaluación publicada. El modelo también ignora `attention_mask` (lo acepta pero no lo usa), por lo que se recomienda decodificar frases de igual longitud en lote o una a una.

## Capacidades

- Conversión de escritura de neo-tifinaghe a latino cabilio estándar.
- Restauración de la vocal schwa (`e`) omitida por convención en tifinaghe.
- Predicción de fronteras de guion en cadenas de clíticos (por ejemplo, `yefka-yas-d-t.`), aunque con mayor tasa de error que en la conversión básica.
- Decodificación greedy y beam search (`num_beams` configurable; `num_beams=1` equivale a greedy).
- Inferencia en CPU en pocos milisegundos por frase, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No soporta otros idiomas distintos del cabilio; el tarifit, tashelhit y tamazight del Atlas central no se evalúan y no deben tratarse como cabilio.
- La salida es siempre en minúsculas; el modelo no restaura mayúsculas ni nombres propios.

## Casos de uso

- Digitalización de corpus archivísticos y educativos en tifinaghe: el modelo convierte lotes de texto en neo-tifinaghe a latino cabilio para que el resto del stack de PLN (tokenizadores, modelos de lenguaje, buscadores) pueda procesarlos, algo imposible con una tabla de caracteres por la tasa de error en la schwa.
- Restauración vocálica en fuentes tifinaghe: cualquier texto donde la vocal se omitió por convención puede pasar por el modelo para recuperar la forma latina completa, con un CER del 0,33 % sobre el conjunto de test.
- Preprocesamiento para pipelines de traducción cabilio-otro idioma: Juba-27M normaliza la entrada a latino cabilio y luego se puede encadenar con un modelo de traducción como Amrouche-1.3B, que el propio autor recomienda para traducción entre idiomas.
- Normalización de datos para entrenamiento de modelos de PLN en cabilio: convertir corpus heterogéneos (mezcla de tifinaghe y latino) a una forma latina consistente antes de entrenar tokenizadores o modelos de lenguaje de mayor tamaño.
- Herramientas de edición y corrección para hablantes de cabilio: integración en editores de texto o correctores que acepten entrada en tifinaghe y devuelvan la forma latina con la schwa colocada, con inferencia en CPU que permite ejecución local sin infraestructura GPU.
- Investigación en lenguas de bajos recursos: el modelo sirve como referencia y baseline para experimentos de transliteración y restauración vocálica en lenguas amaziges, dado que no existía ningún modelo neuronal previo para esta tarea.
- Procesamiento por lotes en servidores sin GPU: al necesitar solo CPU y unos milisegundos por frase, se puede desplegar en contenedores ligeros para convertir grandes volúmenes de texto sin coste de acelerador.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de `agbalu/KabTifinagh` (49.795 frases), medidos en la misma pasada sobre 5.000 frases con decodificación greedy free-running. Los valores no están verificados de forma independiente (`verified: false`).

| Sistema | Coincidencia exacta de frase | Tasa de error de carácter (CER) | F1 de colocación de schwa |
|---|---|---|---|
| Juba-27M | 94,22 % | 0,33 % | 93,51 % |
| Tabla de caracteres determinista | 1,16 % | 13,55 % | 1,61 % |

Sobre las 49.795 frases completas, la tabla de caracteres obtiene 1,02 % / 13,49 % / 1,72 %, por lo que la muestra de 5.000 no la favorece. El 5,78 % de las frases contiene al menos un error, concentrado en cadenas de clíticos con guiones. El F1 de schwa mide colocación, no recuento: elimina las `e` de ambas cadenas, compara los esqueletos consonánticos y empareja las vocales por su índice en ese esqueleto; 251 de las 5.000 frases tienen esqueleto distinto y sus vocales se cargan a ambas columnas de error.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo funciona en CPU. Con 26,9 M de parámetros en safetensors y un repositorio de 0,2 GB, cabe holgadamente en memoria RAM convencional.
- GPU recomendadas: no necesarias. Cualquier GPU consumer (RTX 4090, RTX 3060, etc.) puede ejecutarlo, pero no aporta ventaja significativa frente a CPU para esta carga.
- Cabe en cualquier GPU consumer y en CPU de portátil; no requiere acelerador.
- Opciones de despliegue: `transformers` con `torch` y `trust_remote_code=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada y la ausencia de caché KV probablemente dificulten su uso en esos motores sin adaptación.
- Latencia y throughput: pocos milisegundos por frase en CPU según el autor; no se publican cifras de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Juba-27M | 26,9 M | no disponible | Transliteración tifinaghe-latino y restauración de schwa en cabilio | Apache 2.0 | Hugging Face (`agbalu/Juba-27M`) |
| Tabla de caracteres determinista | 0 (regla) | no aplica | Sustitución uno a uno de consonantes | no aplica | Implementación propia |
| Amrouche-1.3B | 1.300 M (aproximado, según nombre) | no disponible | Traducción cabilio-otro idioma | no disponible en la información | Hugging Face (`agbalu/Amrouche-1.3B`) |

No se conocen otros modelos neuronales publicados para conversión de escritura o restauración de schwa en cabilio; el autor afirma que no existía ninguno antes de este. Amrouche-1.3B es del mismo autor pero resuelve una tarea distinta (traducción entre idiomas), por lo que la comparación es solo contextual.

## Limitaciones y advertencias

- No es un modelo de traducción entre idiomas; para eso el autor remite a Amrouche-1.3B.
- No debe usarse para tomar decisiones sobre personas.
- Solo cubre cabilio; tarifit, tashelhit y tamazight del Atlas central no se evalúan y no deben tratarse como cabilio.
- La salida es siempre en minúsculas; no restaura mayúsculas ni nombres propios, y `.capitalize()` solo cubre el inicio de frase.
- El 5,78 % de las frases del test contiene al menos un error, concentrado en cadenas de clíticos con guiones, donde el modelo debe predecir a la vez la schwa y las fronteras de guion que no aparecen en la fuente tifinaghe.
- Ignora `attention_mask`: se debe decodificar en lotes de frases de igual longitud o una a una; honrar la máscara produciría logits distintos a los publicados.
- No tiene caché de clave-valor, lo que implica recálculo completo del prefijo en cada paso y limita el throughput en secuencias largas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene revisarlo antes de desplegar en producción.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente.
- Riesgo de alucinación no caracterizado en la información disponible; al ser un modelo seq2seq restringido a una tarea de conversión, el riesgo principal es la producción de formas latinas incorrectas en contextos no vistos, no la generación de contenido libre.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; no se documentan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Juba-27M
- Dataset de evaluación: https://huggingface.co/datasets/agbalu/KabTifinagh
- Modelo de traducción recomendado por el autor: https://huggingface.co/agbalu/Amrouche-1.3B
