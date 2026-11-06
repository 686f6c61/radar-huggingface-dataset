# ravivarmapatturi/inferedge-tiny-mt-en-te-v0

## Resumen

InferEdge tiny translator v0 (en-te) es un modelo de traduccion automatica ingles-telugu desarrollado por InferEdge AI (usuario `ravivarmapatturi`) como prueba de concepto de su pipeline de entrenamiento. Se trata de un modelo transformer de pequeno tamano, con 18,3 millones de parametros, entrenado desde pesos aleatorios en aproximadamente 20 minutos sobre una unica GPU de Kaggle. Su proposito declarado es validar la infraestructura de entrenamiento y exportacion a ONNX para inferencia en dispositivo, no ofrecer calidad de traduccion utilizable en produccion.

El modelo se entreno con 7.673 pares de frases del subconjunto BPCC-H-Daily del dataset ai4bharat/BPCC, lo que limita drasticamente su dominio de generalizacion. Aunque los resultados sobre el conjunto de test de BPCC son razonables (chrF++ de 53,55), el rendimiento cae a 11,77 en IN22 conversation y a 7,83 en IN22 general, evidencia clara de sobreajuste al dominio de entrenamiento. El propio autor advierte que el modelo "no es suficientemente bueno para uso real" y que sus salidas son a menudo incorrectas o sin sentido.

Su relevancia actual es fundamentalmente metodologica: sirve como referencia de como estructurar un pipeline completo de traduccion en dispositivo (entrenamiento, exportacion a ONNX INT8 de 28,8 MB con tokenizer incluido y publicacion en Hugging Face) para idiomas de bajos recursos como el telugu. No debe considerarse una alternativa a modelos de traduccion neuronales establecidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder-decoder para traduccion; detalles internos no disponibles) |
| Parametros totales | 18,3 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX); pesos originales en PyTorch (`model_state.pt`) |
| Idiomas soportados | ingles (en) y telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model_state.pt`) y ONNX INT8 |

## Arquitectura y entrenamiento

El modelo es un transformer de traduccion de 18,3 millones de parametros entrenado desde inicializacion aleatoria, sin partir de un modelo preentrenado. La model card no detalla el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni la longitud maxima de secuencia; unicamente indica que se carga mediante `build_model("v0", vocab)` en el fichero `tiny_mt.py`. El checkpoint final se selecciono en el paso 6000 sobre datos de validacion.

El entrenamiento utilizo 7.673 pares de frases del subconjunto BPCC-H-Daily (licencia CC-BY-4.0) del dataset ai4bharat/BPCC, en una unica GPU de Kaggle durante aproximadamente 20 minutos. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; la decodificacion evaluada es greedy. La innovacion principal del proyecto no esta en el modelo en si, sino en el pipeline de exportacion a ONNX INT8 (28,8 MB incluyendo tokenizer) orientado a inferencia en dispositivo, aunque el autor senala que los ficheros INT8 no han pasado una prueba de calidad completa ni una prueba en navegador.

## Capacidades

- Traduccion de texto de ingles a telugu, unica direccion soportada.
- Generacion de traduccion mediante decodificacion greedy.
- Exportacion a ONNX INT8 para despliegue en dispositivo con un peso de 28,8 MB incluyendo tokenizer.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Cobertura multilingue limitada exclusivamente al par en-te.
- Capacidad de generalizacion muy limitada fuera del dominio de BPCC-H-Daily.

## Casos de uso

- Validacion de pipelines de entrenamiento: sirve como caso de prueba reproducible para verificar que una infraestructura de entrenamiento y exportacion ONNX funciona de extremo a extremo antes de escalar a modelos mayores.
- Pruebas de integracion en aplicaciones moviles: su peso de 28,8 MB en INT8 permite embeberlo en prototipos de aplicaciones Android o iOS para validar el flujo de inferencia en dispositivo, sin expectativas de calidad.
- Referencia academica para traduccion de bajos recursos: util para comparar estrategias de entrenamiento desde cero frente a fine-tuning de modelos preentrenados en el par ingles-telugu.
- Benchmark de infraestructura de cuantizacion: permite medir latencia y consumo de memoria de un transformer pequeno en INT8 sobre hardware modesto.
- Docencia y demostraciones: ejemplo sencillo de un pipeline completo de traduccion neuronal (tokenizacion, entrenamiento, evaluacion con chrF++, exportacion) para cursos de PLN.
- Pruebas de regresion de herramientas de evaluacion: sus resultados publicados (chrF++ 53,55 / 11,77 / 7,83) pueden usarse para verificar la implementacion de metricas chrF++ en pipelines propios.
- No recomendado para atencion al cliente, traduccion de documentacion, localizacion de productos ni ningun escenario con usuarios finales reales.

## Benchmarks y rendimiento

Resultados publicados por el autor en PyTorch, decodificacion greedy, chrF++ con orden de palabras 2:

| Conjunto de test | Tamano | chrF++ |
|---|---:|---:|
| BPCC test (similar a entrenamiento) | 426 | 53,55 |
| IN22 conversation | 1.503 | 11,77 |
| IN22 general | 1.024 | 7,83 |

No se han publicado resultados de benchmarks adicionales (BLEU, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. No se han publicado mediciones de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en INT8 ONNX (28,8 MB de pesos mas tokenizer y buffers de activacion); en PyTorch en precision completa, el modelo de 18,3 M de parametros ocupa aproximadamente 73 MB en FP32.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el entrenamiento original se realizo en una unica GPU de Kaggle.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4090, e incluso en CPU y dispositivos moviles mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (formato INT8 publicado), PyTorch con `tiny_mt.py` y `model_state.pt`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El autor indica que los ficheros INT8 no han pasado una prueba en navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Calidad en en-te |
|---|---|---|---|---|---|
| InferEdge tiny MT en-te v0 | 18,3 M | no disponible | en, te | Apache 2.0 | chrF++ 53,55 en dominio; 7,83-11,77 fuera de dominio |
| NLLB-200 distilled 600M | 600 M | 512 tokens | 200 idiomas | CC-BY-NC 4.0 | No disponible en la informacion proporcionada |
| MarianMT (Helsinki-NLP) | ~74 M por par | 512 tokens | pares especificos | MIT / CC-BY 4.0 segun variante | No disponible en la informacion proporcionada |
| IndicTrans2 (AI4Bharat) | 1,1 B (distilled 200M) | 256-512 tokens | 22 idiomas indios | MIT | No disponible en la informacion proporcionada |

No se dispone de resultados comparativos directos publicados entre este modelo y las alternativas citadas en la informacion proporcionada. La comparativa se limita a parametros, contexto, licencia y cobertura idiomatica. Para produccion real en ingles-telugu, IndicTrans2 o NLLB-200 son las referencias habituales del ecosistema, aunque sus metricas concretas no se incluyen aqui por no estar disponibles en la fuente.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo "no es suficientemente bueno para uso real" y que sus salidas son a menudo incorrectas o sin sentido.
- Sobreajuste severo al dominio de entrenamiento: la caida de chrF++ de 53,55 a 7,83-11,77 entre BPCC e IN22 demuestra ausencia de generalizacion.
- Entrenado con solo 7.673 pares de frases, un volumen muy insuficiente para una traduccion robusta.
- Entrenado desde pesos aleatorios en 20 minutos, sin preentrenamiento multilingue que aporte conocimiento linguistico transferible.
- Los ficheros INT8 no han pasado una prueba de calidad completa ni una prueba en navegador segun el autor.
- Riesgo elevado de alucinacion y de traducciones gramaticalmente incorrectas en telugu.
- Cobertura limitada a un unico par de idiomas y una unica direccion (en a te); no soporta te a en.
- No se documentan sesgos especificos, pero al derivar de BPCC-H-Daily puede heredar sesgos de dominio periodistico y de la composicion del corpus.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable cualquier aplicacion productiva.
- No apto para traduccion medica, legal, financiera ni de contenido dirigido a usuarios finales.
- Sin garantias de mantenimiento: repositorio con 0 descargas y 0 likes, publicado como experimento de investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/ravivarmapatturi/inferedge-tiny-mt-en-te-v0
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4bharat/BPCC
- Repositorio de evaluacion IN22 (referencia de los tests): no disponible como enlace directo en la informacion proporcionada
- Paper o blog del autor: no disponible
- Repositorio de codigo (`tiny_mt.py`): no disponible como enlace publico en la informacion proporcionada
- Demo: no disponible
