# JOHANNES02/KASASPEECH

## Resumen

KASASPEECH (identificador `JOHANNES02/KASASPEECH`, también referenciado como `w2v-bert-ada_ewe_fat_fra_gaa_nzi_twi_en`) es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado en el marco del proyecto DONDO (Democratizing Oral Neural Dialect Ontology) y publicado por el autor JOHANNES02 bajo el paraguas de KhayaAI. Cubre ocho lenguas del sur de Ghana y del entorno regional: inglés africano, adangme, ewe, fante, francés, ga, nzema y twi asante. El modelo parte de la arquitectura w2v-BERT 2.0 y se ha afinado con una cabeza CTC para transcripción directa.

Con 605.766.551 parámetros (aproximadamente 606 millones), el modelo se sitúa en la gama media de los sistemas ASR basados en transformers y está pensado como base multilingüe de un solo checkpoint: en lugar de mantener un modelo por idioma, inyecta la identidad lingüística mediante un prefijo one-hot sobre las características acústicas. Esto lo hace especialmente útil para lenguas de bajos recursos donde no existe un modelo dedicado viable.

Su relevancia actual radica en dos factores: la licencia Apache-2.0, que permite uso comercial sin restricciones más allá de la atribución, y la publicación de resultados de WER por idioma que documentan un rendimiento competitivo (11,4 % de WER medio en la configuración final) en un dominio de habla leída. Es, además, una base abierta para experimentación con técnicas de ASR de bajos recursos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | w2v-BERT 2.0 con cabeza CTC (AutoModelForCTC) |
| Parámetros totales | 605.766.551 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana acústica determinada por el procesador w2v-BERT) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | adangme (ada), ewe (ee), fante (fat), francés (fr), ga (gaa), nzema (nzi), twi asante (tw), inglés africano (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se construye sobre w2v-BERT 2.0, un backbone de representación auto-supervisada del habla, al que se añade una cabeza de clasificación CTC para la transcripción. La identidad de idioma se introduce como un prefijo one-hot de un frame prepended a las características acústicas, lo que permite que un único encoder compartido atienda todas las lenguas del checkpoint. El mapa de idiomas es compartido con el resto de modelos multilingües DONDO e incluye 32 identificadores, aunque este checkpoint solo está entrenado para ocho de ellos.

El entrenamiento se realizó en dos pasos con annealing de la tasa de aprendizaje: un primer paso de adaptación gruesa (LR 5e-5) sobre la mezcla multilingüe completa y un segundo paso de annealing (LR 5e-6) para recuperar la brecha frente a las líneas base monolingües. Algunas familias incorporan un tercer paso opcional (LR 5e-7). Los datos de entrenamiento son principalmente habla leída derivada de textos religiosos con transcripciones verificadas en ortografía estándar, agrupados por región para que el encoder compartido aprenda estructura acústica translingüística, algo especialmente útil para las lenguas con menos datos.

## Capacidades

- Reconocimiento automático del habla (ASR) con decodificación CTC para ocho lenguas del sur de Ghana y del entorno regional.
- Transcripción condicionada por idioma mediante prefijo one-hot, lo que permite un único checkpoint para múltiples lenguas.
- Soporte de inglés africano, adangme, ewe, fante, francés, ga, nzema y twi asante.
- Capacidad multilingüe con encoder compartido, orientada a lenguas de bajos recursos.
- Punto de partida para fine-tuning en dominios específicos con datos propios.
- No dispone de identificación automática de idioma (LID): el idioma debe especificarse explícitamente.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).
- No incorpora visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de audio en lenguas de Ghana: el modelo permite transcribir grabaciones en adangme, ewe, fante, ga, nzema o twi asante especificando el prefijo de idioma, lo que resulta adecuado para digitalizar archivos orales de comunidades con pocos recursos digitales.
- Subtitulado y accesibilidad en medios regionales: con un WER en torno al 6-16 % según la lengua en la configuración final, puede emplearse para generar subtítulos preliminares que luego se revisan manualmente, reduciendo el coste de transcripción.
- Investigación lingüística y documentación: sirve como base para anotar corpus orales y estudiar variación fonética entre lenguas del sur de Ghana, gracias a su encoder compartido multilingüe.
- Fine-tuning en dominios específicos: al ser una base multilingüe Apache-2.0, equipos con datos propios (por ejemplo, habla médica o jurídica) pueden afinarlo con tasas de aprendizaje bajas siguiendo el esquema de annealing documentado.
- Asistentes de voz para servicios públicos: integrado en un pipeline de ASR + NLU, permite atender consultas en lenguas locales en oficinas de atención ciudadana o líneas de información.
- Evaluación comparativa de técnicas de ASR de bajos recursos: el modelo se ofrece explícitamente como banco de pruebas abierto para investigar nuevas técnicas en lenguas con pocos datos.
- Procesamiento por lotes de archivos de audio históricos: con un throughput adecuado a su tamaño (606 M parámetros), puede ejecutarse sobre GPU de gama media para transcribir lotes de grabaciones de archivo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (WER en %, menor es mejor; no verificados de forma independiente):

| Configuración | Media | Inglés | Adangme | Ewe | Fante | Francés | Ga | Nzema | Twi asante |
|---|---|---|---|---|---|---|---|---|---|
| Monolingüe | — | 16,9 | 5,38 | 4,5 | 30,1 | 8,5 | 9,7 | 12,6 | 15,75 |
| Paso 1 (5e-5) | 14,7 | 34,9 | 11,6 | 8,41 | 18,1 | 6,87 | 19,4 | 27,9 | 19,3 |
| Paso 2 (5e-6) | 11,4 | 27,4 | 8,78 | 6,57 | 13,4 | 3,64 | 16,0 | 20,8 | 14,7 |

El mejor resultado global es un 11,4 % de WER medio en el paso 2. El autor señala que la columna de inglés africano es más difícil en el entorno multilingüe que en un modelo dedicado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,4 GB solo para pesos (606 M parámetros), más activaciones y buffers del procesador; en la práctica, entre 3 y 5 GB según el tamaño del audio y el batch.
- VRAM estimada en fp16/bf16: en torno a 1,2-1,5 GB para pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp32 con batches pequeños; A100, H100 o RTX 4090 para procesamiento por lotes de alto throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090 y equivalentes con 8 GB o más.
- Opciones de despliegue: transformers (AutoModelForCTC) de forma nativa; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KASASPEECH (este modelo) | 605.766.551 | no disponible | 8 (sur de Ghana) | Apache-2.0 | Hugging Face |
| w2v-BERT 2.0 base | no disponible en la información | no disponible | multilingüe (preentrenamiento) | no disponible en la información | Hugging Face |
| Modelos monolingües DONDO | no disponible | no disponible | 1 por modelo | Apache-2.0 (según familia DONDO) | Hugging Face (KhayaAI) |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada, más allá de las líneas base monolingües incluidas en la propia model card.

## Limitaciones y advertencias

- Dominio restringido: entrenado principalmente con habla leída de textos religiosos; el rendimiento fuera de ese dominio puede degradarse.
- Sin identificación automática de idioma: es obligatorio especificar el idioma mediante el prefijo one-hot; una elección incorrecta del prefijo puede producir transcripciones erróneas.
- Los WER publicados son en dominio (in-domain); no hay garantías de generalización a otros registros o acentos.
- El inglés africano rinde peor en el entorno multilingüe que en un modelo dedicado (27,4 % frente a 16,9 % monolingüe en el paso 2).
- Riesgo de alucinación en la decodificación CTC ante audio ruidoso o fuera de distribución; conviene validar las salidas en producción.
- Sesgos potenciales derivados del corpus de textos religiosos, que puede sobrerrepresentar cierto vocabulario y estilo.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con la única exigencia sustantiva de atribución.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia alternativos a transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JOHANNES02/KASASPEECH
- Paper: https://arxiv.org/abs/2607.21540
- Demo interactiva: https://huggingface.co/spaces/Ghana-NLP/Southern-Ghana-ASR
- Familia DONDO (KhayaAI): https://huggingface.co/KhayaAI
