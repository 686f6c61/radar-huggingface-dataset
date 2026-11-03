# ravivarmapatturi/inferedge-tiny-mt-en-te-v1

## Resumen

InferEdge tiny-mt-en-te-v1 es un modelo de traduccion automatica ingles-telugu desarrollado por InferEdge AI (autor ravivarmapatturi) y publicado en HuggingFace. Se trata de un modelo de investigacion entrenado desde pesos aleatorios a lo largo de 30.000 pasos en una unica sesion de Kaggle, con un tamano de repositorio de 0,1 GB y un peso INT8 ONNX de 33,3 MB. Su proposito declarado es la traduccion EN-TE en dispositivo (on-device), orientada a entornos con recursos muy limitados. La model card del autor es explicitamente honesta: el modelo "todavia esta muy por detras de los modelos grandes en texto general y conversacional, y no esta listo para uso real". Supone una mejora sustancial respecto a una version previa (v0) del mismo autor, pero su relevancia practica es fundamentalmente de investigacion y experimentacion con modelos compactos de traduccion. No se dispone de informacion sobre la arquitectura interna, el numero de parametros ni la longitud de contexto maxima en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX); pesos de entrenamiento en `model_state.pt` |
| Idiomas soportados | ingles (en), telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8), PyTorch (`model_state.pt`) |
| Tamano | 33,3 MB (INT8 ONNX con tokenizer); repositorio de 0,1 GB |
| Pipeline | translation |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de transformer, numero de capas, dimensiones de atencion, etc.). El autor indica unicamente que el modelo fue entrenado desde pesos aleatorios (from scratch) durante 30.000 pasos en una sola sesion de Kaggle, lo que sugiere un entrenamiento de bajo presupuesto computacional y un modelo de escala muy reducida, coherente con su tamano final de 33,3 MB en INT8.

Los datos de entrenamiento corresponden al dataset propio `inferedge-en-te-bitext-v1`, con aproximadamente 116.834 pares de texto paralelo, en su mayoria compuesto por texto gubernamental. La model card del dataset senala explicitamente la existencia de un conflicto de licencias divulgado en relacion con texto de PM India. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion; tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de texto de ingles a telugu (pipeline `translation`).
- Ejecucion en dispositivo mediante ONNX INT8, disenado para entornos con memoria y computo muy limitados.
- Capacidad multilingue restringida exclusivamente al par en-te.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- El rendimiento es notablemente mejor en texto similar al de entrenamiento (dominio gubernamental) que en texto general o conversacional.

## Casos de uso

- Experimentacion academica con traduccion neuronal de muy bajo coste: util como linea base reproducible para comparar tecnicas de compresion o entrenamiento desde cero en pares de idiomas de bajos recursos.
- Validacion de pipelines de despliegue en dispositivo: el formato ONNX INT8 de 33,3 MB permite probar integraciones en navegadores, moviles o sistemas embebidos sin acceso a GPU.
- Traduccion de texto administrativo del dominio ingles-telugu (el mas cercano al entrenamiento): con el chrF++ de 61,63 en BPCC, podria servir para tareas supervisadas de contenido gubernamental de estructura predecible.
- Prototipado de sistemas de traduccion asistida con revision humana: el modelo puede proponer borradores que un revisor humano corrija, dado su bajo coste computacional.
- Docencia y divulgacion sobre traduccion automatica: sirve para ilustrar el efecto del tamano del dataset y del dominio en el rendimiento de modelos compactos frente a modelos grandes.
- Investigacion sobre sesgo y dominio en traduccion de bajos recursos: la marcada diferencia entre BPCC (61,63) e IN22 general (24,97) permite estudiar sobreajuste al dominio de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (INT8 ONNX, decodificacion greedy, chrF++ con orden de palabra 2):

| Test | chrF++ |
|---|---:|
| BPCC test (426, similar a parte de los datos de entrenamiento) | 61,63 |
| IN22 conversation (1.503) | 25,04 |
| IN22 general (1.024) | 24,97 |

No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en INT8 ONNX, dado que el modelo pesa 33,3 MB; el consumo dominante sera el entorno de ejecucion (runtime ONNX) y el tokenizer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU para inferencia por lotes pequenos.
- Compatibilidad con GPU de consumo: cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en dispositivos de muy baja potencia.
- Opciones de despliegue: ONNX Runtime (formato nativo publicado); llama.cpp, vLLM, Ollama y TGI no estan documentados como soportados en la informacion disponible.
- Latencia y throughput: no disponibles; el autor senala que los archivos v1 no se han sometido a prueba en navegador.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El unico modelo de referencia mencionado es la version previa del mismo autor (v0), respecto a la cual v1 supone una mejora segun la model card, pero sin cifras concretas de v0 disponibles. Modelos de traduccion de la categoria (por ejemplo, modelos dedicados de tamano pequeno o modelos multilingues grandes con soporte de telugu) no se comparan en la documentacion: no disponible.

## Limitaciones y advertencias

- El propio autor advierte que el modelo "no esta listo para uso real" y que esta muy por detras de modelos grandes en texto general y conversacional.
- Brecha de rendimiento severa entre dominio de entrenamiento (61,63 chrF++ en BPCC) y texto general/conversacional (en torno a 25 chrF++ en IN22), indicativo de sobreajuste al dominio gubernamental.
- Dataset de entrenamiento mayoritariamente gubernamental, con sesgos de dominio previsibles y un conflicto de licencias divulgado en relacion con texto de PM India.
- Riesgo alto de alucinacion y de traducciones inexactas fuera del dominio de entrenamiento; no apto para produccion sin revision humana.
- Cobertura limitada a un unico par de idiomas (ingles-telugu); no soporta otros idiomas.
- No se han realizado pruebas en navegador sobre los archivos v1, por lo que la robustez del despliegue ONNX en ese entorno no esta validada.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de parte de los datos de entrenamiento (conflicto de licencias sobre texto de PM India) requiere revision juridica antes de un uso comercial serio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ravivarmapatturi/inferedge-tiny-mt-en-te-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ravivarmapatturi/inferedge-en-te-bitext-v1
- Archivo de pesos de entrenamiento: `model_state.pt` (cargado con `tiny_mt.py`, incluido en el repositorio)
- Informes completos de evaluacion: archivos `*_onnx_int8.json` en el repositorio del modelo
