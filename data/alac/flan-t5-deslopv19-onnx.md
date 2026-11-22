# alac/flan-t5-deslopV19-onnx

## Resumen

`alac/flan-t5-deslopV19-onnx` es un modelo de lenguaje derivado de `google/flan-t5-base` mediante ajuste fino supervisado, especializado en una tarea muy concreta: reescribir textos breves para eliminar el denominado "slop" (texto generado por IA con muletillas, relleno y frases formulaicas). El autor lo publica en formato ONNX, lo que facilita su despliegue en navegador y en entornos sin GPU dedicada. Se distribuye bajo licencia Apache 2.0 y solo declara soporte para ingles.

El modelo hereda la arquitectura encoder-decoder T5 de `flan-t5-base` (aproximadamente 220 millones de parametros) y aplica entrenamiento consciente de cuantizacion (QAT) sobre las capas lineales. El uso previsto es muy acotado: se le pasa una frase corta precedida del prefijo `unslop: ` y devuelve una version editada. No esta pensado como modelo conversacional ni como asistente general.

Su relevancia es practica y limitada: cubre un nicho (limpieza de texto generado por IA) con un modelo pequeno, desplegable en cliente y con licencia permisiva. El repositorio es de 0,4 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), derivado de `google/flan-t5-base` |
| Parametros totales | Aproximadamente 220 millones (heredados de `flan-t5-base`; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica; `flan-t5-base` soporta entradas cortas, pero el valor exacto no se declara) |
| Tipos de cuantizacion | Entrenamiento consciente de cuantizacion (QAT) en capas lineales; exportado a ONNX. Niveles exactos no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo parte de `google/flan-t5-base`, un transformer encoder-decoder con atencion completa y arquitectura T5 estandar. Sobre esa base se aplico un ajuste fino supervisado orientado a una unica tarea de reescritura: dado un texto corto con prefijo `unslop: `, producir una version sin "slop". La model card indica 4 epocas con scheduler coseno y tasa de aprendizaje 5e-5, ademas de entrenamiento consciente de cuantizacion (QAT) aplicado a las capas lineales, lo que permite exportar a ONNX con perdida de precision controlada.

Los datos de entrenamiento provienen del dataset `alac/deslop-sentence`, inspirado en `N8Programs/unslop-good`. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (lo mas probable, dado el tamano y el enfoque, es que sea solo ajuste fino supervisado, pero no se confirma). La innovacion tecnica destacable es la combinacion de QAT con exportacion ONNX para inferencia en navegador, tal como se enlaza en la model card.

## Capacidades

- Reescritura de texto corto para eliminar "slop": muletillas, relleno y frases formulaicas tipicas de texto generado por IA.
- Funciona con un prefijo explicito (`unslop: `) seguido del texto de entrada.
- Despliegue en navegador mediante ONNX (se enlaza una demo web del autor).
- Inferencia en CPU sin GPU dedicada, gracias al formato ONNX y al tamano reducido.
- No dispone de tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Soporte multilingue limitado al ingles.
- No se declaran modos especiales (thinking, vision, audio).

## Casos de uso

- Limpieza de borradores generados por IA: se pasa cada frase o parrafo corto con el prefijo `unslop: ` y se obtiene una version mas concisa, util como paso de postprocesado en pipelines de generacion de contenido.
- Extension de navegador o widget web: al estar en ONNX y ser pequeno (0,4 GB de repo), puede ejecutarse en el cliente para reescribir texto directamente en un editor o formulario sin enviar datos a un servidor.
- Preprocesado en pipelines editoriales: normalizar texto generado por modelos grandes antes de publicacion, reduciendo frases de relleno de forma automatica.
- Filtrado de datasets: aplicar el modelo a muestras de texto para detectar y reescribir contenido con estilo "slop" antes de usarlo en entrenamiento de otros modelos.
- Herramienta de accesibilidad o asistencia a la escritura: sugerir reformulaciones breves en ingles dentro de editores de texto.
- Prototipado rapido de tareas de estilo: servir como base para experimentar con ajuste fino adicional sobre tareas de edicion de texto, dado su bajo coste computacional y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un modelo de ~220 M de parametros; aun menor en cuantizacion INT8 (valor exacto no disponible).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, GTX 1650 o superior) es mas que suficiente.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (navegador, CPU de portatil).
- Opciones de despliegue: ONNX Runtime (incluido en navegador via WebAssembly/WebGPU), y potencialmente exportacion a otros formatos derivados de T5 (no confirmado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU para entradas cortas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| `alac/flan-t5-deslopV19-onnx` | ~220 M | No disponible | Reescritura "deslop" | Apache 2.0 | ONNX |
| `google/flan-t5-base` | ~220 M | 512 tokens (estandar T5) | Instrucciones generales | Apache 2.0 | Safetensors, etc. |
| `google/flan-t5-small` | ~60 M | 512 tokens (estandar T5) | Instrucciones generales | Apache 2.0 | Safetensors, etc. |
| `google/flan-t5-large` | ~780 M | 512 tokens (estandar T5) | Instrucciones generales | Apache 2.0 | Safetensors, etc. |

La comparativa es aproximada: los modelos `flan-t5-*` son de proposito general, mientras que este modelo esta especializado en una tarea de reescritura concreta. No se dispone de benchmarks que permitan comparar rendimiento en la tarea "deslop" frente a alternativas.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara soporte para castellano ni otros idiomas.
- Tarea muy especifica: no es un modelo conversacional ni un asistente general; su uso fuera de la reescritura "deslop" producira resultados pobres.
- Riesgo de alucinacion y de alterar el significado original al reescribir, especialmente en textos largos o tecnicos.
- No se especifica la longitud maxima de entrada; entradas largas pueden truncarse o degradar la calidad.
- No hay benchmarks publicados que permitan evaluar la calidad de la reescritura de forma objetiva.
- El repositorio no registra descargas ni likes, y la model card menciona "V4" mientras el identificador es "V19", lo que sugiere posible desactualizacion de la documentacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre sesgos ni sobre el comportamiento en dominios no representados en el dataset de entrenamiento.
- El dataset de entrenamiento (`alac/deslop-sentence`) es de elaboracion propia y su composicion no esta detallada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alac/flan-t5-deslopV19-onnx
- Demo en navegador: https://alac.github.io/deslop/index.html
- Dataset de entrenamiento: https://huggingface.co/datasets/alac/deslop-sentence
- Dataset de referencia: https://huggingface.co/datasets/N8Programs/unslop-good
- Modelo base: https://huggingface.co/google/flan-t5-base
