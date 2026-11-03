# ravivarmapatturi/inferedge-tiny-mt-te-en-v1

## Resumen

InferEdge tiny translator v1 es un modelo de traduccion automatica Telugu-Ingles desarrollado por InferEdge AI (cuenta de HuggingFace ravivarmapatturi). Se trata de un modelo de investigacion entrenado desde pesos aleatorios, sin partir de un modelo preentrenado, durante 30.000 pasos en una unica sesion de Kaggle. Su proposito es servir como banco de pruebas de traduccion neuronal de muy bajo coste para despliegue en dispositivo (on-device), empaquetado como ONNX INT8 de apenas 33,3 MB.

El modelo resuelve el problema de la traduccion Telugu-Ingles en entornos con recursos computacionales minimos, a costa de una calidad muy limitada. El propio autor advierte que, aunque mejora sustancialmente respecto a su version v0, sigue muy por detras de los modelos grandes en texto general y conversacional, y que no esta listo para uso real. Se distribuye con licencia Apache 2.0 y pesos en formato ONNX y PyTorch.

Por su tamano (33,3 MB en INT8) y su naturaleza experimental, resulta relevante para quienes investigan tecnicas de compresion extrema, cuantizacion INT8 o pipelines de traduccion en navegador y dispositivos embebidos, no como solucion de produccion. La informacion disponible sobre arquitectura interna, numero de parametros y contexto es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de traduccion, detalles no publicados) |
| Parametros totales | no disponible (pesos INT8 ONNX de 33,3 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX); pesos PyTorch en `model_state.pt` |
| Idiomas soportados | ingles (en), telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8) y PyTorch (`model_state.pt`) |

## Arquitectura y entrenamiento

El modelo es un traductor neuronal entrenado desde pesos aleatorios (from scratch), sin inicializacion a partir de un modelo preentrenado, durante 30.000 pasos en una sola sesion de Kaggle. No se especifica en la informacion disponible el tipo exacto de arquitectura (transformer encoder-decoder, dimensiones, numero de capas ni cabeceras de atencion), aunque la nomenclatura "tiny" y el tamano de 33,3 MB en INT8 apuntan a una red de muy pocos parametros.

Los datos de entrenamiento provienen del dataset `ravivarmapatturi/inferedge-en-te-bitext-v1`, con aproximadamente 116.834 pares de frases, en su mayoria texto gubernamental. La model card del dataset advierte de un conflicto de licencias declarado en relacion con texto de PM India. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion. La innovacion principal es el propio enfoque de entrenamiento ultraligero y el empaquetado INT8 ONNX con tokenizer incluido para inferencia en dispositivo.

## Capacidades

- Traduccion de texto de telugu a ingles (el titulo indica "Telugu to English"; los tags incluyen ambos idiomas).
- Traduccion de frases cortas y texto de dominio administrativo o gubernamental, similar al corpus de entrenamiento.
- Inferencia en dispositivo mediante ONNX INT8, con tokenizer empaquetado.
- Decodificacion greedy (segun los resultados de test publicados).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla de la pareja en-te.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Investigacion en traduccion de bajos recursos: servir como linea base reproducible para comparar tecnicas de entrenamiento from scratch en parejas de idiomas con pocos datos, dado su tamano minimo y su licencia permisiva.
- Pruebas de cuantizacion INT8 y despliegue ONNX: util para validar pipelines de exportacion, cuantizacion y ejecucion en runtime ONNX antes de escalar a modelos mayores.
- Traduccion en navegador o dispositivo embebido en prototipos: sus 33,3 MB permiten cargarlo en entornos con memoria muy restringida, aunque la calidad solo es aceptable en dominios proximos al corpus de entrenamiento.
- Procesamiento de texto administrativo o gubernamental: el modelo rinde mejor en el tipo de texto del dataset (BPCC test, chrF++ 70,10), por lo que puede usarse en experimentos de normalizacion o indexacion de documentos oficiales, siempre con revision humana.
- Docencia y demostraciones de traduccion neuronal: adecuado para explicar el ciclo completo de entrenamiento, evaluacion con chrF++ y empaquetado de un modelo de traduccion.
- Filtrado o preprocesado en cascada: como primera etapa de bajo coste para descartar o preclasificar pares de frases antes de pasarlos a un modelo mayor, dado su reducido coste de inferencia.

## Benchmarks y rendimiento

Resultados congelados publicados por el autor (INT8 ONNX, decodificacion greedy, chrF++ con orden de palabras 2):

| Test | Conjunto | chrF++ |
|---|---|---:|
| BPCC test | 426 frases (similar a parte del entrenamiento) | 70,10 |
| IN22 conversation | 1.503 frases | 28,75 |
| IN22 general | 1.024 frases | 29,75 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Los informes completos se encuentran en los ficheros `*_onnx_int8.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el artefacto INT8 ONNX ocupa 33,3 MB, por lo que cabe en CPU y en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU (RTX 3060 o superior, A100, H100) aceleraria la inferencia, pero no es necesaria.
- Cabe en GPU consumer: si, en todas las gamas, e incluso en dispositivos moviles y navegador mediante ONNX Runtime Web.
- Opciones de despliegue: ONNX Runtime (incluido Web), y carga de pesos PyTorch mediante el script `tiny_mt.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| InferEdge tiny-mt-te-en-v1 | no disponible (33,3 MB INT8) | no disponible | Apache 2.0 | Traduccion te-en from scratch, on-device |
| Modelos NMT grandes (p. ej. NLLB, IndicTrans2) | no disponible en esta ficha | no disponible | no disponible | Traduccion multilingue preentrenada |

El autor indica explicitamente que el modelo esta "muy por detras de los modelos grandes" en texto general y conversacional, lo que sitúa su calidad por debajo de sistemas de traduccion preentrenados de mayor tamano.

## Limitaciones y advertencias

- El propio autor declara que el modelo no esta listo para uso real y que queda muy por detras de modelos grandes en texto general y conversacional.
- El rendimiento cae drasticamente fuera del dominio de entrenamiento: chrF++ 70,10 en BPCC frente a 28,75 y 29,75 en los conjuntos IN22 de conversacion y general.
- Entrenado desde pesos aleatorios con solo 30.000 pasos y ~116.834 pares de frases, lo que limita su cobertura lexica y gramatical.
- Riesgo elevado de alucinacion y de traducciones incorrectas en frases largas, idiomaticas o conversacionales.
- No se documentan sesgos especificos, pero el corpus mayoritariamente gubernamental puede introducir sesgos de dominio y estilo.
- El dataset de entrenamiento presenta un conflicto de licencias declarado sobre texto de PM India; conviene revisar la model card del dataset antes de un uso comercial.
- Los ficheros v1 no han sido probados en navegador segun el autor.
- No se documentan limitaciones de longitud de contexto por falta de datos.
- Aunque la licencia es Apache 2.0, la procedencia de los datos de entrenamiento exige cautela en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ravivarmapatturi/inferedge-tiny-mt-te-en-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ravivarmapatturi/inferedge-en-te-bitext-v1
