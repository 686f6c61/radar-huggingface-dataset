# diogocarapito/text-to-icpc2-v2

## Resumen

`text-to-icpc2-v2` es un modelo de recuperación (retriever) basado en embeddings que mapea texto clínico libre, tal y como lo escribe un médico de familia en una lista de problemas, a un código de la clasificación ICPC-2 (International Classification of Primary Care, segunda edición). Lo desarrolla diogocarapito y se apoya en un ajuste fino de `intfloat/multilingual-e5-base`, un transformer encoder multilingüe de 278 millones de parámetros con ventana de contexto de 512 tokens. El modelo no genera texto: produce representaciones vectoriales que se comparan contra un índice kNN construido sobre las descripciones de los 686 códigos ICPC-2 (componentes 1, síntomas, y 7, diagnósticos) y sobre los ejemplos etiquetados del corpus de entrenamiento.

El problema que resuelve es la codificación clínica automática en atención primaria: convertir expresiones como "HTA não controlada" o "type 2 diabetes" en códigos estandarizados que permitan explotar registros electrónicos de salud para epidemiología, auditoría o sistemas de apoyo a la decisión. Frente al modelo v1 de 2024, basado en un BERT portugués, la v2 multiplica por más de dos veces y media el top-1 en el conjunto de test (0,922 frente a 0,346), gracias al backbone multilingüe y a un corpus de entrenamiento mucho mayor.

Es relevante ahora porque demuestra que un esquema retriever + kNN, sin reentrenamiento, puede alcanzar precisión superior al 92 % en top-1 sobre datos verificados por un facultativo, y porque admite realimentación incremental: las correcciones confirmadas por el clínico se añaden al índice sin tocar los pesos. La licencia de los pesos es Apache-2.0, aunque la propia taxonomía ICPC-2 tiene restricciones de uso comercial que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), ajustado como sentence-transformer para similitud semántica |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada de multilingual-e5-base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de sentence-transformers, no documentada por el autor) |
| Idiomas soportados | portugués (europeo) e inglés |
| Licencia | Apache-2.0 (pesos y código); la taxonomía ICPC-2 está sujeta a términos de WONCA |
| Formato de pesos | safetensors |
| Modelo base | intfloat/multilingual-e5-base |
| Dimension de embedding | no disponible en la informacion proporcionada (el base e5-base usa 768) |
| Tamano del repositorio | 1,2 GB |
| Filas de entrenamiento | 62.149 |
| Pipeline | sentence-similarity |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints compatibles |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia XLM-RoBERTa en su variante base, reutilizado desde `intfloat/multilingual-e5-base` y ajustado con la librería `sentence-transformers` para producir embeddings de frase comparables por similitud coseno. Sobre esa representación se construye un índice kNN que contiene las descripciones textuales de los códigos ICPC-2 y todos los ejemplos etiquetados del dataset; las puntuaciones de los vecinos se agregan por código para emitir la predicción final. No hay cabeza generativa ni decodificación: la salida es una lista ordenada de pares (código, puntuación).

El entrenamiento emplea 62.149 filas del dataset `diogocarapito/text-to-icpc2-v2-dataset`, con entradas en portugués europeo e inglés. La model card no detalla la composición exacta del corpus ni si hubo etapas de contraste negativo, destilación o preferencias; sí indica que los conjuntos `gold_dev` y `gold_test` son entradas redactadas por Claude y verificadas, recodificadas o descartadas por un médico de familia, y que no se usaron para entrenar. La innovación principal no es arquitectónica sino operativa: la arquitectura retriever permite incorporar feedback confirmado al índice sin reentrenar, lo que abarata el mantenimiento en producción.

## Capacidades

- Mapeo de texto clínico libre a códigos ICPC-2 de los componentes 1 (síntomas) y 7 (diagnósticos), sobre un vocabulario de 686 códigos.
- Búsqueda semántica multilingüe portugués-inglés: la misma frase en cualquiera de los dos idiomas se proyecta al mismo espacio y puede recuperar el código correcto.
- Recuperación top-k configurable (por ejemplo, `k=3`) con puntuaciones de similitud, útil para presentar alternativas al clínico.
- Actualización del índice con correcciones confirmadas sin reentrenar los pesos.
- Integración como modelo de embeddings en `text-embeddings-inference` y endpoints compatibles.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni agentes: es exclusivamente un recuperador.
- No cubre códigos de proceso (rango -30 a -69) ni entradas con varios problemas simultáneos, que se colapsan en un único código.

## Casos de uso

- Codificación retrospectiva de listas de problemas: procesar por lotes los registros de historia clínica electrónica de un centro de salud y asignar códigos ICPC-2 a cada entrada, lo que permite explotar la base para estudios epidemiológicos y auditorías de calidad asistencial.
- Asistencia en tiempo real al facultativo: mientras el médico teclea un problema en la lista, el modelo devuelve las tres mejores coincidencias con su puntuación para que confirme una, aprovechando la latencia baja de un encoder de 278 millones de parámetros.
- Normalización de terminología entre centros: unificar variantes dialectales y abreviaturas ("HTA", "DM2", "tensión alta") en un código común, lo que facilita la comparación de indicadores entre unidades y comunidades.
- Construcción de cohortes para investigación: dado un conjunto de códigos de interés, recuperar los textos libres que probablemente les corresponden y revisarlos manualmente, reduciendo el cribado previo.
- Enriquecimiento de sistemas de apoyo a la decisión: usar el código recuperado como señal de entrada en pipelines que disparen alertas o guías clínicas, siempre con validación humana del código asignado.
- Etiquetado semiautomático de corpus docentes y de investigación: preanotar miles de entradas clínicas y reservar el esfuerzo del experto para la revisión de los casos de baja confianza.
- Punto de partida para clasificación en otras taxonomías: al ser un retriever genérico, puede reindexarse con descripciones de CIE-10 o SNOMED si se dispone de ejemplos etiquetados, aunque el ajuste fino actual está orientado a ICPC-2.

## Benchmarks y rendimiento

| split | n | top-1 | top-3 | top-5 | macro-F1 | PT top-1 | EN top-1 |
|---|---|---|---|---|---|---|---|
| gold_dev | 142 | 0,930 | 0,965 | 0,965 | 0,869 | 0,912 | 1,000 |
| gold_test | 460 | 0,922 | 0,980 | 0,985 | 0,879 | 0,925 | 0,907 |
| val | 3568 | 0,861 | 0,961 | 0,972 | 0,844 | 0,862 | 0,860 |

Referencia comparativa declarada por el autor: el modelo v1 de 2024 (`text-to-icpc2-bert-base-portuguese-cased`) obtiene 0,346 de top-1 en el mismo `gold_test` (0,417 en portugués y 0,035 en inglés). El autor advierte que el conjunto gold fue redactado por la misma familia de modelos que generó los datos sintéticos de entrenamiento, por lo que las cifras son probablemente optimistas, y que la verificación la realizó un único evaluador.

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 1,1 GB de VRAM solo para pesos, más el índice kNN y el tokenizador; en la práctica, menos de 2 GB en total.
- Inferencia en FP16 o BF16: en torno a 0,55 GB de pesos, holgado en cualquier GPU consumer.
- Cabe en GPU consumer: RTX 3060, RTX 4060, RTX 4090 y prácticamente cualquier tarjeta con 4 GB o más; también funciona en CPU con latencias aceptables para uso interactivo.
- GPU de datacenter recomendadas para alto throughput: A100, H100, L40S o T4, sirviendo el modelo mediante `text-embeddings-inference`.
- Opciones de despliegue: `sentence-transformers` en Python, `text-embeddings-inference` (soportado oficialmente según los tags), endpoints compatibles con la API de Hugging Face, y el paquete `icpc2[infer]` del repositorio del autor.
- Throughput y latencia: no se han publicado mediciones en la información disponible; por el tamaño del encoder, se espera un rendimiento típico de modelos e5-base, con codificación por debajo de decenas de milisegundos por frase en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Top-1 en gold_test | Licencia |
|---|---|---|---|---|---|
| text-to-icpc2-v2 (este) | 278 M | 512 | Texto clínico a ICPC-2 | 0,922 | Apache-2.0 (pesos); ICPC-2 con términos de WONCA |
| text-to-icpc2-bert-base-portuguese-cased (v1, 2024) | no disponible | no disponible | Texto clínico a ICPC-2 | 0,346 | no disponible en la informacion proporcionada |
| intfloat/multilingual-e5-base (base sin ajustar) | 278 M | 512 | Embeddings multilingües genéricos | no evaluado en esta tarea | MIT |
| Otros codificadores clínicos en portugués | no disponible | no disponible | Codificación clínica | no disponible | no disponible |

La comparación directa con la v1 es la única que el autor documenta con cifras sobre el mismo conjunto de test; el resto de alternativas requeriría evaluación propia, que no se ha publicado en la información disponible.

## Limitaciones y advertencias

- No es un producto sanitario: la model card lo declara explícitamente como software de investigación y exige que cada sugerencia sea revisada por un clínico antes de incorporarse al registro.
- Riesgo de sobreajuste en la evaluación: el conjunto gold fue redactado por la misma familia de modelos que generó los datos sintéticos de entrenamiento, por lo que las métricas publicadas probablemente sobreestiman el rendimiento real.
- Verificación por un único evaluador: no hay acuerdo interanotador ni segundo revisor que valide el gold set.
- Entradas con varios problemas a la vez ("HTA e DM2") reciben un solo código, lo que puede perder información clínica relevante.
- Los códigos de proceso (rango -30 a -69) quedan fuera del alcance del modelo.
- Cobertura lingüística limitada a portugués europeo e inglés; no se ha validado en portugués de Brasil ni en otras lenguas.
- Sesgos potenciales derivados del corpus sintético y de la práctica clínica de origen, no cuantificados en la información disponible.
- Licencia de los pesos Apache-2.0, pero la taxonomía ICPC-2 es propiedad de WONCA y la traducción portuguesa proviene de ACSS (ICPC-2e v4.4); su reproducción se limita a investigación y uso no comercial, y debe revisarse antes de cualquier explotación comercial.
- El modelo devuelve códigos con puntuaciones de similitud, no probabilidades calibradas; los umbrales de confianza deben ajustarse por el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diogocarapito/text-to-icpc2-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/diogocarapito/text-to-icpc2-v2-dataset
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Modelo v1 de referencia: https://huggingface.co/diogocarapito/text-to-icpc2-bert-base-portuguese-cased
- Repositorio de código, pipeline y cuaderno de experimentos: https://github.com/diogocarapito/text-to-icpc2-v2
- Demo en vivo: https://text-to-icpc2.com
