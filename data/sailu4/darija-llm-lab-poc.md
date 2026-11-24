# sailu4/darija-llm-lab-poc

## Resumen

Darija LLM Lab POC es un modelo de lenguaje experimental de tipo decoder-only entrenado desde inicialización aleatoria para dariya (arabe marroquí, código ISO `ary`). Lo desarrolla el usuario sailu4 en el contexto del repositorio Darija LLM Lab, y se publica como prueba de concepto educativa, no como un modelo apto para producción. Su tamaño es extremadamente reducido: 368.000 parámetros totales, con una anchura de embedding de 64, 4 cabezas de atención y solo 2 bloques Transformer.

El modelo aborda un nicho concreto: la escasez de recursos lingüísticos y modelos para dariya, una variedad del árabe con poca representación en corpus y benchmarks estándar. La propuesta es pedagógica: demostrar un pipeline completo de tokenización BPE propia, partición de datos, entrenamiento desde cero y evaluación con pérdida de validación y perplejidad sobre un corpus exclusivamente en dariya.

Su relevancia actual es limitada como artefacto de inferencia, pero resulta útil como referencia metodológica para quien quiera replicar un flujo de entrenamiento mínimo en una lengua de bajos recursos. La ventana de contexto es de solo 64 tokens, la licencia no está asignada de forma explícita y los pesos no son cargables directamente como `AutoModel` de Transformers, lo que restringe su uso a experimentación con el código propio del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-style decoder-only, 2 bloques Transformer |
| Parametros totales | 368.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ar, ary (dariya / arabe marroqui) |
| Licencia | no disponible (el dataset origen declara CC BY-NC 4.0) |
| Formato de pesos | safetensors (`model.safetensors`), tokenizer en `tokenizer.json` |

Otras especificaciones: anchura de embedding 64, 4 cabezas de atención, tokenizador ByteLevel BPE con vocabulario de 2.000 tokens, checkpoint en el paso 500, librería PyTorch, tamaño del repositorio 0.0 GB.

## Arquitectura y entrenamiento

La arquitectura es un decoder-only compacto de estilo GPT con embeddings de token y de posición aprendidos, dos bloques Transformer y una cabeza de salida de siguiente token. El tokenizador es un ByteLevel BPE propio con un vocabulario de 2.000 tokens, entrenado específicamente sobre el corpus dariya del proyecto. El checkpoint publicado corresponde al paso 500 de entrenamiento y contiene únicamente los parámetros del modelo, sin estado del optimizador.

El entrenamiento usa la columna `darija` del dataset `atlasia/darija_english` de AtlasIA, fijado a la revisión `c6468fe948155c935c7a8ce59db7df895ad1296a`. El proyecto define su propia partición: 900 documentos de entrenamiento y 100 de validación, separados antes del entrenamiento del tokenizador para evitar filtración. No se documenta el número total de tokens procesados ni el uso de RLHF, DPO u otras fases de alineamiento. En el paso 500, la entropía cruzada de validación fue 6,6795 y la perplejidad 795,94 para este tokenizador y esta partición; el autor señala explícitamente que son trazas de entrenamiento de la POC y no un benchmark general.

## Capacidades

- Generación de texto autoregresiva limitada a secuencias de hasta 64 tokens.
- Modelado de siguiente token sobre vocabulario BPE de 2.000 unidades entrenado en dariya.
- Cobertura declarada de árabe (`ar`) y dariya (`ary`), aunque la calidad efectiva en ambos es muy baja.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Capacidad multilingüe efectiva: no disponible más allá de la cobertura nominal del tokenizador.
- El autor indica que las muestras generadas siguen siendo repetitivas y no constituyen dariya fluida fiable.

## Casos de uso

- Docencia de pipelines de NLP en lenguas de bajos recursos: sirve para ilustrar paso a paso la construcción de un tokenizador BPE, la partición de corpus y un bucle de entrenamiento mínimo en PyTorch, usando el notebook 08 del repositorio como referencia.
- Reproducción de experimentos de tokenización: permite comparar el comportamiento de un vocabulario de 2.000 tokens entrenado solo en dariya frente a tokenizadores multilingües de mayor cobertura, midiendo impacto en perplejidad sobre la misma partición de validación.
- Estudio de curvas de entrenamiento a pequeña escala: la traza de pérdida de validación hasta el paso 500 es útil para analizar dinámicas de convergencia y sobreajuste en modelos de menos de un millón de parámetros.
- Verificación de infraestructura de entrenamiento: al ser un modelo de 368.000 parámetros, se puede usar como caso de prueba para validar scripts de guardado en safetensors, serialización de tokenizadores y registro de métricas antes de escalar a modelos mayores.
- Análisis de limitaciones de contexto corto: con 64 tokens de ventana, sirve para demostrar empíricamente el efecto de ventanas reducidas en la coherencia de la generación y justificar decisiones de diseño en proyectos posteriores.
- Referencia para la comunidad dariya: documenta una procedencia de datos concreta (dataset de AtlasIA con revisión fijada) y un flujo reproducible, lo que facilita que otros equipos partan de una base metodológica al construir recursos para `ary`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas internas de validación en el paso 500:

| Metrica | Valor | Notas |
|---|---|---|
| Entropia cruzada de validacion | 6,6795 | Paso 500, tokenizador y particion propios |
| Perplejidad | 795,94 | Calculada sobre la misma particion de validacion |

Estos valores corresponden a la traza de entrenamiento de la prueba de concepto y no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K, que no se han evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión razonable; con 368.000 parámetros, los pesos ocupan del orden de 1,5 MB en fp32 y menos de 1 MB en fp16.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer de la última década es suficiente, e incluso la inferencia en CPU es viable.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4090 y equivalentes, así como en entornos integrados.
- Opciones de despliegue: al no ser cargable como `AutoModel` de Transformers, requiere el código propio del repositorio (clase de modelo en PyTorch). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño del modelo, la latencia por token sería del orden de microsegundos a milisegundos en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sailu4/darija-llm-lab-poc | 368.000 | 64 tokens | ar, ary | no disponible | Hugging Face, pesos safetensors |
| Modelos dedicados a dariya de mayor escala | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos multilingües de propósito general de pequeño tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (dariya, decoder-only, entrenados desde cero) en la documentación proporcionada, por lo que la comparativa cuantitativa no está disponible. Cualquier comparación con modelos multilingües de mayor tamaño sería metodológicamente inválida dado el carácter de prueba de concepto y las métricas internas reportadas.

## Limitaciones y advertencias

- Calidad lingüística insuficiente: el propio autor indica que las generaciones son repetitivas y no constituyen dariya fluida fiable; no debe usarse para tareas de usuario final.
- Ventana de contexto de 64 tokens, insuficiente para diálogo multi-turno, documentos o cualquier tarea que requiera contexto extendido.
- Vocabulario de solo 2.000 tokens, lo que limita la cobertura léxica y aumenta la fragmentación de palabras poco frecuentes.
- Licencia no asignada al checkpoint: el dataset de origen declara CC BY-NC 4.0, lo que impide el uso comercial del material derivado salvo revisión legal expresa de los términos aplicables.
- Riesgo elevado de alucinación y de texto incoherente por el tamaño del modelo y la perplejidad reportada (795,94).
- No es cargable como `AutoModel` de Transformers; requiere el código del repositorio, lo que complica su integración en pipelines estándar.
- Sin datos publicados sobre sesgos, composición demográfica del corpus ni evaluaciones de seguridad.
- Sin soporte documentado de cuantización, tool calling, agentes ni despliegue en servidores de inferencia habituales.
- El repositorio no incluye los archivos del dataset, solo la procedencia y las métricas, lo que limita la reproducibilidad completa sin descargar el corpus original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sailu4/darija-llm-lab-poc
- Repositorio GitHub del proyecto: https://github.com/BADR-JOULAlI/darija-llm-lab
- Dataset de origen (AtlasIA darija_english): https://huggingface.co/datasets/atlasia/darija_english
- Revisión fijada del dataset: `c6468fe948155c935c7a8ce59db7df895ad1296a`
