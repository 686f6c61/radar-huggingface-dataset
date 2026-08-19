# Okejonah1/obolo-ai-translation

## Resumen

El modelo Obolo AI Translation System es un sistema de traducción automática del inglés al obolo (lengua niger-congo hablada en Nigeria, código ISO 639-3 ann), desarrollado por Oke Nteigbanam J. (Okejonah1) como una demostración tecnológica para apoyar la preservación y visibilidad de esta lengua de bajos recursos. Se basa en el modelo M2M-100 de Meta, ajustado con aproximadamente 40.000 pares de traducción procedentes de la Obolo Language and Bible Translation Organization (OLBTO), diccionarios y reglas gramaticales documentadas por lingüistas. El modelo tiene 483.905.536 parámetros según los pesos safetensors (la model card menciona 418M, pero el peso real es superior) y se distribuye bajo licencia MIT. Su relevancia radica en abordar una lengua minoritaria con un enfoque híbrido que combina un diccionario integrado con un modelo neuronal, aunque el autor enfatiza que no sustituye a la traducción humana experta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | M2M-100 (transformer encoder-decoder) |
| Parametros totales | 483.905.536 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), obolo (ann) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en M2M-100, un transformer encoder-decoder desarrollado por Meta AI para traducción multilingüe entre 100 idiomas sin depender del inglés como puente. Para este proyecto se realizó un fine-tuning con un conjunto de datos propio: 31.104 pares de traducciones bíblicas (proporcionados por OLBTO), 6.289 pares de diccionario y 35 reglas gramaticales integradas, además de datos adicionales de Wikipedia y la comunidad. El sistema es híbrido: primero consulta un diccionario de 6.382+ palabras con variantes y, si no encuentra coincidencia, recurre al modelo neuronal como respaldo. No se especifican detalles del proceso de entrenamiento (épocas, optimizador, hiperparámetros) ni la composición exacta del dataset más allá de las cifras indicadas.

## Capacidades

- Traducción automática de texto en inglés a obolo (ann), con soporte para frases y oraciones completas.
- Sistema híbrido de traducción: consulta de diccionario integrado (6.382+ entradas) antes de usar el modelo neuronal.
- Adaptación cultural y frases naturales en obolo, basadas en reglas gramaticales documentadas por lingüistas.
- Generación de texto condicionada con beam search (num_beams=5 en el ejemplo proporcionado).
- No incluye capacidades de tool calling, agentes, visión ni audio; es exclusivamente un modelo de traducción texto a texto.

## Casos de uso

- Preservación lingüística: digitalizar y traducir textos del inglés al obolo para archivos históricos y educativos, ayudando a documentar la lengua.
- Traducción de materiales bíblicos: apoyo a traductores de OLBTO en la revisión de borradores, siempre con supervisión humana.
- Educación bilingüe: generar materiales didácticos en obolo para escuelas y programas de alfabetización.
- Aplicaciones de diccionario: integrar el sistema en apps de consulta de vocabulario inglés-obolo para hablantes y estudiantes.
- Comunicación comunitaria: traducir avisos, noticias o comunicaciones oficiales al obolo para su difusión en comunidades locales.
- Investigación en NLP de bajos recursos: servir como referencia para otros proyectos de traducción de lenguas minoritarias, dado su enfoque híbrido diccionario+IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de BLEU, chrF u otras métricas de evaluación.

## Requisitos de hardware

- Al ser un modelo de 483,9 millones de parámetros, la inferencia es ligera. En fp32, el peso ocupa aproximadamente 1,94 GB (483.905.536 × 4 bytes). Con cuantización a fp16 o int8, el uso de VRAM se reduce a ~1 GB o menos (estimación orientativa, no hay datos oficiales).
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060, o incluso en CPU si se convierte a GGUF, aunque no hay versiones GGUF publicadas.
- Para despliegue en producción, se puede servir con Hugging Face Inference Endpoints, vLLM (soporta modelos encoder-decoder) o mediante la API de transformers.
- La latencia esperada es baja (del orden de milisegundos por frase) en una GPU moderna, pero no hay datos oficiales de throughput.

## Comparativa con modelos similares

- M2M-100 (original): modelo base de Meta, con 418M parámetros (versión small) o 1.2B, soporta 100 idiomas pero no obolo. Licencia MIT. Contexto de 1024 tokens.
- NLLB-200 (Meta): modelo de traducción de 200 idiomas, incluye algunas lenguas africanas, pero no obolo. Parámetros desde 600M hasta 54B. Licencia CC-BY-NC (no comercial).
- Otros modelos de traducción para lenguas de bajos recursos: no hay comparables directos para obolo en Hugging Face.

Dado que no hay benchmarks, la comparativa es cualitativa: el modelo es único en su enfoque para obolo, pero su rendimiento no ha sido evaluado formalmente.

## Limitaciones y advertencias

- Es una demostración tecnológica, no una herramienta de traducción autoritativa. Las traducciones oficiales corresponden a OLBTO.
- El conjunto de entrenamiento está dominado por textos bíblicos, lo que puede sesgar el vocabulario y las construcciones hacia registros religiosos.
- Solo traduce de inglés a obolo; no soporta la dirección inversa.
- No hay datos sobre cobertura de dialectos o variantes regionales del obolo.
- La longitud de contexto no está documentada; el ejemplo usa truncamiento a 128 tokens, lo que limita la traducción de textos largos.
- No se han realizado evaluaciones de sesgo o robustez; puede alucinar en entradas fuera de dominio.
- Licencia MIT permite uso comercial, pero el autor recomienda supervisión humana para usos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Okejonah1/obolo-ai-translation
- Perfil de GitHub del autor: https://github.com/Okejonah1/
- Blog de Meta sobre M2M-100: https://ai.meta.com/blog/introducing-many-to-many-multilingual-machine-translation/
