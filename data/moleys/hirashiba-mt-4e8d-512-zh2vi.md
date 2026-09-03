# Moleys/hirashiba-mt-4e8d-512-zh2vi

## Resumen

El modelo `hirashiba-mt-4e8d-512-zh2vi` es un sistema de traducción automática neuronal (NMT) especializado en la dirección chino simplificado a vietnamita, desarrollado por el usuario Moleys y publicado en Hugging Face. Se trata de un modelo de arquitectura Marian entrenado desde cero, con una configuración asimétrica de 4 capas de codificador y 8 de decodificador, una dimensión de modelo (`d_model`) de 512 y una ventana de contexto de hasta 512 tokens. Su propósito principal es corregir el bug de truncamiento de contexto corto presente en su predecesor `hirashiba-mt-medium` (que limitaba a 128 posiciones), ofreciendo así una traducción más fiable para párrafos de longitud media.

El modelo se entrena sobre un corpus filtrado de aproximadamente 1 millón de pares de oraciones chino-vietnamita, procedente del dataset `chi-vi/hirashiba-mt-zh2vi-b-filtered`, durante una sola época. Con unos 71,6 millones de parámetros (según los pesos en safetensors), es un modelo relativamente compacto que puede ejecutarse en hardware modesto. Aunque está orientado al dominio de webnovels y textos generales, su licencia GPL-3.0 y su formato estándar de Transformers lo hacen accesible para integraciones personalizadas en pipelines de traducción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (4 encoder + 8 decoder, d_model 512, FFN 3072, activación swish) |
| Parametros totales | 71.662.505 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (max_position_embeddings) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino simplificado (zh) y vietnamita (vi) |
| Licencia | GPL-3.0 |
| Formato de pesos | Safetensors (también compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, una variante del transformer original optimizada para traducción automática. La configuración es asimétrica: 4 capas en el codificador y 8 en el decodificador, con una dimensión de modelo de 512 y una capa feed-forward de 3072 unidades. El tokenizador es un byte-level BPE con un vocabulario de 25.000 subpalabras, heredado del modelo `hirashiba-mt-medium`. El entrenamiento se realizó desde cero sobre el dataset filtrado `chi-vi/hirashiba-mt-zh2vi-b-filtered`, que contiene aproximadamente 1 millón de pares de oraciones, durante una sola época. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento supervisado estándar. La principal innovación técnica es la ampliación de `max_position_embeddings` de 128 a 512, corrigiendo así el problema de truncamiento que afectaba a la versión anterior y permitiendo procesar entradas más largas sin pérdida de información.

## Capacidades

- Traducción automática neuronal de chino simplificado a vietnamita, con calidad evaluada en BLEU ≈ 28 sobre un conjunto de validación retenido del mismo corpus.
- Manejo de entradas de hasta 512 tokens, adecuado para oraciones y párrafos cortos o medios.
- Especializado en el dominio de webnovels y textos generales, aunque puede generalizar a otros dominios con limitaciones.
- No es bidireccional: solo traduce en la dirección zh→vi.
- No dispone de capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio; es exclusivamente un modelo de traducción.

## Casos de uso

- Traducción de webnovels chinos al vietnamita: el modelo está entrenado específicamente con corpus de este género, por lo que es adecuado para traducir capítulos o fragmentos de novelas ligeras, manteniendo la fluidez en el lenguaje narrativo.
- Integración en aplicaciones de lectura para usuarios vietnamitas: puede incorporarse como motor de traducción en tiempo real para convertir contenido chino en texto legible dentro de apps o sitios web.
- Traducción de subtítulos o diálogos cortos: gracias a su ventana de 512 tokens, puede procesar intervenciones de personajes en series o películas, siempre que no excedan esa longitud.
- Pipelines de procesamiento de texto automatizado: en entornos empresariales, puede usarse como paso intermedio para convertir documentación técnica o comunicaciones internas del chino al vietnamita, reduciendo la carga de trabajo manual.
- Asistentes de traducción para lectores de noticias o artículos: dado su dominio general, puede traducir noticias o artículos breves, aunque la calidad puede variar fuera del ámbito webnovel.
- Herramientas educativas para aprendizaje de idiomas: puede servir como generador de ejemplos de traducción para estudiantes de vietnamita que practican con textos chinos, ofreciendo una referencia rápida y razonablemente fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato reportado por el autor es un valor BLEU de aproximadamente 28, evaluado sobre un conjunto retenido de 2.000 filas del mismo dataset filtrado utilizado para el entrenamiento. Este valor indica una calidad moderada, típica de modelos entrenados con un único epoch y un corpus de tamaño limitado.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de VRAM, GPU recomendadas o latencia.
- Dado el tamaño del modelo (71,6 millones de parámetros), es probable que pueda ejecutarse en GPUs de consumo como una NVIDIA GTX 1060 o superior, con al menos 2-4 GB de VRAM para inferencia en FP32. Sin embargo, estos datos son estimaciones no confirmadas por el autor.
- Las opciones de despliegue incluyen la librería Transformers de Hugging Face, que permite cargar el modelo con `MarianMTModel`. También es compatible con servidores de inferencia como vLLM o TGI, aunque no se ha verificado su soporte oficial.
- Para entornos sin GPU, podría ejecutarse en CPU, aunque con mayor latencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (traducción zh→vi) en la documentación proporcionada. El único punto de referencia es el modelo predecesor `hirashiba-mt-medium`, que presenta la misma arquitectura base pero con `max_position_embeddings = 128`, lo que limitaba su capacidad para manejar contextos largos. Este nuevo modelo corrige esa limitación, aunque no hay datos comparativos de rendimiento entre ambos.

## Limitaciones y advertencias

- Entrenamiento a nivel de oración: el modelo fue entrenado con pares de oraciones individuales, por lo que puede degradarse al procesar párrafos largos o discursos coherentes de varias frases, a pesar de la ventana de 512 tokens.
- Dirección única: solo traduce de chino simplificado a vietnamita; no soporta la dirección inversa.
- Dominio específico: el corpus proviene principalmente de webnovels y textos generales, por lo que términos técnicos o de otros géneros (legal, médico, científico) pueden traducirse con menor precisión.
- Licencia GPL-3.0: el uso comercial está permitido, pero cualquier distribución del modelo o de sus derivados debe cumplir con los términos de la GPL, incluyendo la divulgación del código fuente.
- Calidad moderada: el BLEU de ~28 indica que la traducción puede contener errores gramaticales o de significado, por lo que no es recomendable para aplicaciones críticas sin revisión humana.
- Alucinaciones: como todo modelo de traducción, puede generar contenido no presente en el texto original, especialmente con entradas ambiguas o fuera de dominio.

## Enlaces

- Modelo en Hugging Face: [Moleys/hirashiba-mt-4e8d-512-zh2vi](https://huggingface.co/Moleys/hirashiba-mt-4e8d-512-zh2vi)
- Modelo predecesor: [Moleys/hirashiba-mt-medium](https://huggingface.co/Moleys/hirashiba-mt-medium)
- Dataset de entrenamiento: [chi-vi/hirashiba-mt-zh2vi-b-filtered](https://huggingface.co/datasets/chi-vi/hirashiba-mt-zh2vi-b-filtered)
- Perfil del autor: [Moleys](https://huggingface.co/Moleys)
