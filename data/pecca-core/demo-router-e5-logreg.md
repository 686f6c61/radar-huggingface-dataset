# pecca-core/demo-router-e5-logreg

## Resumen

`pecca-core/demo-router-e5-logreg` es un clasificador de texto que enruta correos de atencion al cliente (ficticios, del banco simulado "Northbridge Bank") hacia una de 60 tematicas RFI. Lo publica la organizacion `pecca-core` como modelo de demostracion de Pecca, una libreria cuyo objetivo es sustituir llamadas repetitivas a un LLM por modelos pequenos y auditables. No es un modelo generativo: es un enrutador de clasificacion con etiqueta unica.

Tecnicamente combina un encoder multilingue de la familia `intfloat/multilingual-e5-base` (del que toma los embeddings) con una regresion logistica como cabeza de clasificacion, exportada a ONNX. El repositorio pesa 0,0 GB, la licencia es Apache 2.0 y la libreria de carga declarada es `pecca`. En el torneo interno de Pecca obtuvo un macro-F1 de 0,909 ± 0,011 en validacion cruzada de 5 particiones, frente al 0,915 ± 0,011 de un candidato `tfidf_linear`.

Su relevancia es metodologica mas que de rendimiento: documenta de forma explicita el proceso de seleccion de modelo, las metricas, el umbral de confianza y el porcentaje de derivacion esperado a un LLM. El propio autor advierte que es un modelo de demostracion, entrenado con datos sinteticos, y que no debe usarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (embeddings de `intfloat/multilingual-e5-base`) mas cabeza de regresion logistica; exportado a ONNX |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base es `intfloat/multilingual-e5-base`, con variante cuantizada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | El modelo base esta referenciado como cuantizado (`base_model:quantized:intfloat/multilingual-e5-base`); no se detallan los esquemas concretos |
| Idiomas soportados | No disponibles (la metadata no los declara; el encoder base es multilingue y el dataset de demo es code-mixed con la frase tematica en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (etiqueta `onnx`; libreria `pecca`) |

## Arquitectura y entrenamiento

El modelo no entrena un transformer desde cero. Usa `intfloat/multilingual-e5-base` como extractor de embeddings y sobre esas representaciones ajusta una regresion logistica multiclase (60 clases) para enrutar el correo a una tematica RFI. El resultado se exporta a ONNX para inferencia ligera. La carga se realiza mediante la libreria Pecca, que descarga el encoder E5 desde su propio repositorio la primera vez que se utiliza.

El entrenamiento se enmarco en un torneo interno de Pecca sobre las mismas particiones de validacion cruzada, comparando candidatos por macro-F1. El conjunto de datos es `pecca-core/demo-support-emails`, con 6.000 filas; las etiquetas son la etiqueta humana cuando existe y, en caso contrario, la respuesta de un "LLM" simulado. Los candidatos fueron `tfidf_linear` (macro-F1 0,915, 0,9 s de ajuste, 0,4 ms de latencia) y `e5_logreg` (0,909, 9,7 s, 0,2 ms). Aunque `tfidf_linear` gano por 0,006 de macro-F1 en este conjunto sintetico, se publico `e5_logreg` por su mayor robustez esperada en datos multilingues reales, donde el fraseo plantillado no se repite. La calibracion se hizo con temperatura sobre las etiquetas humanas, fijando un umbral de 0,25.

## Capacidades

- Clasificacion de texto con etiqueta unica: asigna un correo a una de 60 tematicas RFI.
- Enrutamiento con puntuacion de confianza y umbral calibrado (0,25) para decidir cuando derivar.
- Derivacion a un LLM ("fallback") cuando la confianza no alcanza el umbral; el autor estima un 0 % de derivaciones en los datos de evaluacion.
- Uso de representaciones multilingues heredadas del encoder E5, lo que en teoria permite clasificar entradas en varios idiomas.
- Inferencia rapida y de bajo coste (latencia medida de 0,2 ms en el torneo).
- Ejecucion en formato ONNX mediante la libreria Pecca.
- No soporta generacion de texto, razonamiento multi-paso, tool calling, agentes, vision ni audio. Es exclusivamente un clasificador.

## Casos de uso

- Triage de buzon de soporte: clasificar cada correo entrante en una de las 60 tematicas para encaminarlo al equipo o cola correcta sin invocar un LLM por mensaje.
- Puerta de derivacion a LLM: usar la confianza de la regresion logistica con umbral 0,25 para decidir que casos resuelve el modelo ligero y cuales pasan a un modelo mayor, reduciendo coste por llamada.
- Etiquetado previo a analitica: enriquecer tickets con una categoria tematica para construir cuadros de mando y detectar picos de incidencias por asunto.
- Enrutamiento en varios idiomas: al apoyarse en embeddings multilingues, permite clasificar consultas no inglesas, aunque el dataset de demo es code-mixed y no valida este escenario a fondo.
- Auditoria de un pipeline de clasificacion: sirve como referencia reproducible de un torneo de modelos con particiones cruzadas, metricas y umbral documentados.
- Prototipado de enrutadores sobre ONNX en entornos con CPU: por su tamano y latencia, encaja en servicios de bajo consumo o en el borde sin GPU.
- Evaluacion comparativa de enfoques: permite contrastar un clasificador clasico (TF-IDF + lineal) frente a uno basado en embeddings preentrenados sobre el mismo conjunto de datos.

## Benchmarks y rendimiento

Datos tomados de la model card del autor (conjunto sintetico `pecca-core/demo-support-emails`, 6.000 filas, validacion cruzada de 5 particiones salvo donde se indique):

| Modelo o referencia | Macro-F1 | Desviacion estandar | Tiempo de ajuste (s) | Latencia (ms) |
|---|---|---|---|---|
| `tfidf_linear` (candidato ganador del torneo) | 0,915 | 0,011 | 0,9 | 0,4 |
| `e5_logreg` (este modelo) | 0,909 | 0,011 | 9,7 | 0,2 |
| "LLM" simulado frente a etiquetas humanas (hold-out) | 0,834 | No disponible | No disponible | No disponible |

Nota: la fila del "LLM" simulado corresponde a un generador de etiquetas ruidoso con aproximadamente un 15 % de errores, no a un modelo real, y se mide en un hold-out con un planteamiento distinto al de las dos primeras filas. La precision con el umbral 0,25 se situa en un minimo de 0,95 sobre las filas del hold-out. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB y el modelo se distribuye en ONNX; el encoder E5 es la parte mas pesada del conjunto.
- GPU recomendadas: no disponibles ni necesarias. El modelo esta pensado para ejecucion ligera y los tiempos medidos (0,2 ms de latencia) sugieren inferencia en CPU.
- Cabe en GPU de consumo: si, cualquier GPU consumer es mas que suficiente; incluso se puede ejecutar sin GPU.
- Opciones de despliegue: la via documentada es la libreria Pecca (`pecca.load(...)`), que descarga el encoder E5 aparte; el formato ONNX permite usar ONNX Runtime. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (orientados a modelos generativos).
- Latencia y throughput: la model card reporta 0,2 ms de latencia para este candidato en el torneo; el autor advierte que estas cifras no son representativas de cargas reales.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos publicos de enrutamiento en la informacion proporcionada. Las unicas alternativas documentadas son los propios candidatos del torneo interno:

| Criterio | `e5_logreg` (este modelo) | `tfidf_linear` | "LLM" simulado |
|---|---|---|---|
| Enfoque | Embeddings E5 + regresion logistica | TF-IDF + modelo lineal | Generador de etiquetas ruidoso |
| Macro-F1 | 0,909 ± 0,011 | 0,915 ± 0,011 | 0,834 (vs etiquetas humanas) |
| Tiempo de ajuste | 9,7 s | 0,9 s | No disponible |
| Latencia | 0,2 ms | 0,4 ms | No disponible |
| Robustez multilingue esperada | Mayor | Menor | No aplica |
| Licencia y disponibilidad | Apache 2.0, publicada en HuggingFace | No publicada como modelo | No es un modelo real |

## Limitaciones y advertencias

- Modelo de demostracion: el autor indica explicitamente "Not for production".
- Datos sinteticos: entrenado con correos generados, no con datos reales de clientes; el rendimiento en correos reales sera previsiblemente inferior.
- Datos code-mixed: en los correos no ingleses la frase tematica se mantiene en ingles, lo que limita la validez como prueba multilingue.
- Metricas de latencia no representativas: el autor advierte que los tiempos y metricas del torneo no reflejan cargas reales.
- Etiquetas ruidosas: parte de las etiquetas provienen de un "LLM" simulado con aproximadamente un 15 % de errores, lo que introduce ruido en el entrenamiento.
- Dominio muy acotado: 60 tematicas RFI de un banco ficticio; no generaliza a otros dominios ni a otras taxonomias sin reentrenamiento.
- Riesgo de clasificacion erronea con confianza alta: el umbral 0,25 esta calibrado sobre este conjunto sintetico y no garantiza precision de 0,95 fuera de el.
- Sin capacidades generativas ni de agente: no redacta respuestas, no ejecuta herramientas y no mantiene conversaciones multi-turno.
- Ausencia de datos de sesgo: no se documentan analisis de sesgo ni evaluaciones por idioma o por subgrupo.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero debe tenerse en cuenta la licencia del modelo base `intfloat/multilingual-e5-base` (MIT segun su repositorio original) y el hecho de que el modelo no esta validado para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pecca-core/demo-router-e5-logreg
- Dataset de entrenamiento: https://huggingface.co/datasets/pecca-core/demo-support-emails
- Repositorio de Pecca: https://github.com/pecca-core/pecca
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
