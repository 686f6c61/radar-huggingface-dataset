# linguardia/opus-mt-en-nds

## Resumen

El modelo `linguardia/opus-mt-en-nds` es un sistema de traducción automática neuronal especializado en traducir del inglés al bajo alemán (nds, también conocido como bajo sajón). Ha sido desarrollado por Linguardia, una plataforma dedicada al aprendizaje de idiomas a partir de frases reales, y se distribuye bajo licencia Apache-2.0. Su relevancia radica en que el bajo alemán es una lengua minoritaria que no cuenta con traductores automáticos comerciales de calidad, y este modelo cubre ese vacío con un enfoque abierto y reproducible.

Técnicamente, se trata de un finetune del modelo `Helsinki-NLP/opus-mt-en-mul` (perteneciente a la familia OPUS-MT, basada en arquitectura Marian), entrenado sobre 5.157 pares de frases inglés-bajo alemán extraídos de Tatoeba. El modelo tiene 77 millones de parámetros, un tamaño muy contenido que permite su ejecución en hardware modesto. La ventana de contexto no está documentada explícitamente, aunque el entrenamiento se realizó con secuencias de hasta 48 tokens, lo que indica que está pensado para frases cortas y cotidianas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer seq2seq) |
| Parametros totales | 77.027.439 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con max 48 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors fp32) |
| Idiomas soportados | en (inglés), nds (bajo alemán) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Helsinki-NLP/opus-mt-en-mul`, un modelo Marian de la familia OPUS-MT que originalmente traduce del inglés a múltiples idiomas. El finetune se realizó sobre pares de frases inglés-bajo alemán de Tatoeba (CC-BY 2.0 FR / CC0 1.0), con un total de 5.157 pares de entrenamiento, 331 de desarrollo y 19 de prueba dorada. Se entrenó durante 5 épocas con batch size 32, optimizador Adafactor con learning rate 5e-5 y 500 pasos de warmup, y una longitud máxima de secuencia de 48 tokens (cubriendo el 99,9% de las fuentes y el 99,6% de los objetivos). El hardware utilizado fue un Apple M4 con MPS.

Una innovación destacable es que el token de prefijo `>>nds<<` se añadió como token nuevo, sin reemplazar ninguno de los idiomas existentes del modelo base. Esto significa que el modelo conserva la capacidad de traducir a los otros idiomas que ya manejaba el modelo original, aunque el finetune se centra en bajo alemán. No se utilizó ningún dato sintético ni generado por modelos para el entrenamiento.

## Capacidades

- Traducción automática de inglés a bajo alemán (nds) en ortografía Sass (variante del bajo sajón septentrional).
- Soporte de selección de idioma de destino mediante el prefijo `>>nds<<` en el texto fuente.
- Conservación de las capacidades multilingües del modelo base `opus-mt-en-mul` (aunque no se documentan explícitamente los idiomas adicionales).
- Generación de texto con beam search (num_beams=4 recomendado en el ejemplo de uso).
- Adecuado para frases cortas y cotidianas, con un rendimiento degradado en texto largo o técnico.
- No soporta tool calling, agentes, visión ni modos de razonamiento especiales.

## Casos de uso

- Generación de material didáctico para aprendizaje de bajo alemán: el modelo puede traducir frases modelo de un curso, como hace Linguardia con su corpus de 2.000 frases canónicas, logrando una cobertura del 99,5% en nds.
- Traducción de frases cortas para aplicaciones de intercambio lingüístico: usuarios que quieran practicar bajo alemán pueden traducir frases cotidianas y verificar su corrección con hablantes nativos.
- Creación de subtítulos o doblajes para contenido audiovisual breve: dado su tamaño y velocidad, puede procesar frases de diálogos en tiempo real o casi real.
- Enriquecimiento de corpus paralelos: el modelo puede ayudar a alinear o completar pares de frases en bajo alemán para investigación lingüística.
- Prototipos de asistentes de traducción para lenguas minoritarias: sirve como base para integrar bajo alemán en herramientas de traducción asistida por ordenador (CAT).
- Evaluación comparativa de modelos de traducción para lenguas de baja disponibilidad de datos: su pipeline de entrenamiento y evaluación es reproducible y puede servir de referencia.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación sobre un conjunto de prueba reservado de 1.200 pares (nunca vistos en entrenamiento, y filtrados para evitar solapamiento de frases):

| Metrica | Puntuacion |
|---|---|
| BLEU | 39,5 |
| chrF | 59,3 |

Para contextualizar, se comparan con otros modelos de la misma pipeline de Linguardia:

| Modelo | chrF (held-out) |
|---|---|
| opus-mt-en-nds (este) | 59,3 |
| opus-mt-en-shi (Tachelhit) | 52,8 |
| opus-mt-en-sco (Scots) | 41,4 |
| opus-mt-en-ang (Old English) | 34,4 |

No se dispone de comparaciones con otros modelos de traducción en-nds en la información proporcionada.

## Requisitos de hardware

- El modelo tiene 77 millones de parámetros, lo que en fp32 ocupa aproximadamente 308 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, y también puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1060 o superior, Apple M1/M2/M3/M4, etc.). No requiere hardware especializado.
- Es compatible con consumer GPUs de gama baja y media.
- Opciones de despliegue: se puede usar directamente con la librería `transformers` de Hugging Face, tanto en Python como en entornos de producción con `text-generation-inference` (TGI) o `vLLM` (aunque estos están más orientados a modelos decoder-only, el modelo seq2seq puede servirse con pipelines de Hug Face).
- Latencia: al ser un modelo pequeño, la inferencia es muy rápida. En una CPU moderna se pueden procesar decenas de frases por segundo; en GPU, cientos. No se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLEU (en-nds) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| linguardia/opus-mt-en-nds | 77M | no disponible | 39,5 | Apache-2.0 | Hugging Face |
| Helsinki-NLP/opus-mt-en-mul (base) | 77M (aprox.) | no disponible | no evaluado en nds | Apache-2.0 | Hugging Face |
| Helsinki-NLP/opus-mt-en-de (alemán estándar) | 77M (aprox.) | no disponible | no comparable (de) | Apache-2.0 | Hugging Face |

No se han encontrado otros modelos específicos para traducción en-nds en la información disponible. El modelo base `opus-mt-en-mul` es el punto de partida, y el finetune mejora sustancialmente la calidad para bajo alemán, como demuestra el chrF de 59,3 frente a los valores de otros finetunes de la misma casa.

## Limitaciones y advertencias

- Entrenado exclusivamente con frases cortas y cotidianas de Tatoeba; su rendimiento decae notablemente en texto largo, técnico o literario.
- La traducción se realiza frase a frase, sin tener en cuenta el contexto del documento, por lo que puede haber inconsistencias terminológicas entre frases de un mismo corpus.
- El modelo no ha sido revisado por hablantes nativos de bajo alemán; todas las salidas se marcan como `verified: false` y requieren validación humana antes de usarse en contextos educativos o formales.
- No se han evaluado sesgos de género, culturales o sociales en las traducciones.
- La licencia Apache-2.0 permite uso comercial, pero se exige atribución a Tatoeba y sus contribuyentes (CC-BY 2.0 FR / CC0 1.0) al ser un trabajo derivado.
- No se proporcionan cuantizaciones oficiales (GGUF, int8, etc.), por lo que para despliegues en entornos con restricciones de memoria habrá que convertirlos manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/linguardia/opus-mt-en-nds
- Repositorio de la familia OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Plataforma Linguardia: https://linguardia.com/
- Modelos de Linguardia en Hugging Face: https://huggingface.co/linguardia/models
- Tatoeba (fuente de datos): https://tatoeba.org
