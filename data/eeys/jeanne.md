# eeys/jeanne

## Resumen

`eeys/jeanne` es un modelo publicado en HuggingFace por el usuario `eeys` el 22 de octubre de 2026 (ultima actualizacion el 25 de octubre de 2026). Se trata de un modelo de pequeno tamano: los metadatos de safetensors registran 361.821.120 parametros totales (unos 361,8 millones), y el repositorio ocupa 2,0 GB. El autor no ha publicado model card: no hay descripcion, pipeline declarado, licencia, idiomas ni resultados de evaluacion en la informacion disponible.

La relevancia practica de esta ficha es limitada y debe leerse como advertencia. Las etiquetas del repositorio son `gguf`, `endpoints_compatible` y `region:us`, lo que indica que el repositorio contiene pesos en formato GGUF y que esta marcado como desplegable en HuggingFace Inference Endpoints, pero no aporta informacion sobre arquitectura, datos de entrenamiento ni capacidad real del modelo. Con 194 descargas y 0 likes, tampoco existe validacion de la comunidad.

En consecuencia, cualquier evaluacion tecnica de `jeanne` exige descargar los pesos y caracterizarlos directamente (tokenizer, config, ventana de contexto efectiva, calidad en tareas de referencia). Esta ficha documenta unicamente lo verificable y marca de forma explicita todo lo que no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card) |
| Parametros totales | 361.821.120 (dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la etiqueta `gguf` confirma pesos cuantizados, sin detallar variantes ni niveles) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (etiqueta); repositorio de 2,0 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 194 / 0 |
| Fecha de publicacion | 2026-10-22 (actualizado 2026-10-25) |

## Arquitectura y entrenamiento

No disponible. El autor no documenta arquitectura, numero de tokens de entrenamiento, composicion del dataset, ni si hubo fases de ajuste tipo SFT, RLHF o DPO. El unico dato estructural verificable es el recuento de parametros (361.821.120), que situa al modelo en el rango de los 360-500 millones, es decir, la franja de modelos pequenos aptos para inferencia en CPU o en GPU de consumo.

Tampoco se identifica el modelo base ni si se trata de un entrenamiento desde cero, un fine-tune o una conversion a GGUF de otro modelo. Este ultimo punto es relevante: si `jeanne` deriva de un modelo con licencia propia, esa licencia podria heredarse aunque el repositorio no la declare. La unica innovacion tecnica observable es el empaquetado en GGUF y la marca `endpoints_compatible` para despliegue gestionado.

## Capacidades

No hay informacion publicada sobre capacidades. La model card esta vacia, de modo que ninguna de las siguientes afirmaciones esta confirmada por el autor:

- Generacion de texto: no confirmado; el recuento de parametros es compatible con un modelo de lenguaje, pero no se especifica la tarea.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara ninguna lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponible.
- Inferencia con pesos cuantizados: confirmado por la etiqueta `gguf`, lo que permite ejecucion en llama.cpp y compatible.

## Casos de uso

Los escenarios siguientes se plantean bajo la hipotesis de que el modelo es un transformer decoder de ~362 millones de parametros con pesos GGUF, que es la lectura mas plausible del recuento de parametros y del formato. Deben validarse con una evaluacion propia antes de cualquier uso en produccion.

- Clasificacion y etiquetado de texto a gran escala: un modelo de 362 M ejecutado en CPU puede procesar lotes de documentos con coste marginal casi nulo; adecuado para triaje de tickets o moderacion preliminar, siempre que se verifique la calidad en el idioma objetivo.
- Generacion asistida en local para entornos sin GPU: con pesos Q4 en torno a 0,22 GB, cabe en cualquier portatil y permite prototipado offline sin depender de API, util para pruebas de concepto y demos aisladas.
- Extraccion de campos estructurados: si el modelo responde bien a instrucciones, puede emplearse para convertir texto libre en JSON en pipelines ETL; requiere validacion de sintaxis y manejo de salidas invalidas.
- Preprocesado y resumen de documentos cortos: con ventana de contexto desconocida, solo es viable en entradas breves; sirve como paso previo de condensacion antes de enviar el contenido a un modelo mayor.
- Componente de un ensemble o router: por su tamano, puede actuar como clasificador de intencion o de dificultad que decida si una consulta se resuelve localmente o se deriva a un modelo de mayor capacidad.
- Base para fine-tuning ligero: 362 M de parametros permiten ajuste con LoRA en una unica GPU de consumo (por ejemplo, 16 GB), lo que lo hace util como banco de pruebas para experimentos de adaptacion de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM son calculos aritmeticos a partir del recuento de parametros (pesos = parametros x bytes por parametro), no mediciones del modelo:

- Pesos en FP32: ~1,45 GB.
- Pesos en FP16/BF16: ~0,72 GB.
- Pesos en Q8_0: ~0,38 GB.
- Pesos en Q4_K_M: ~0,22 GB.
- A las cifras anteriores hay que sumar la memoria de la cache KV, que depende de la longitud de contexto (no disponible) y del numero de capas y cabezas (no disponible).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente para cuantizaciones de 8 bits o inferiores; una RTX 4090 o una A100 estan sobredimensionadas para este tamano y solo se justifican por volumen de peticiones.
- Cabe en GPU de consumo: si, practicamente en cualquier modelo con 2 GB de VRAM; tambien en CPU con llama.cpp, y probablemente en telefonos de gama media-alta con cuantizacion Q4.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints. Compatibilidad con vLLM o TGI: no disponible.
- Latencia y throughput: no disponible (no hay mediciones publicadas ni tamano de contexto conocido para estimarlas).

## Comparativa con modelos similares

La comparacion es estructural, por rango de parametros, porque no existen datos de rendimiento de `jeanne`. Los datos de los modelos alternativos provienen del conocimiento publico de esos modelos, no de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eeys/jeanne | 361,8 M | no disponible | no disponible | HuggingFace, GGUF, 194 descargas |
| SmolLM2-360M (HuggingFace) | ~362 M | 8.192 tokens | Apache 2.0 | Hub, multiples cuantizaciones GGUF |
| Qwen2.5-0.5B (Alibaba) | ~494 M | 32.768 tokens | Apache 2.0 | Hub, amplia adopcion |
| Gemma 3 270M (Google) | ~270 M | 32.768 tokens | Terminos de uso de Gemma | Hub, requiere aceptacion de terminos |

Frente a estas alternativas, `jeanne` no aporta, segun la informacion disponible, ninguna ventaja verificable: no declara contexto, licencia ni evaluaciones, y su adopcion es marginal (0 likes). Cualquier decision de uso deberia partir de una comparacion empirica propia.

## Limitaciones y advertencias

- Ausencia total de model card: sin descripcion, pipeline, idiomas declarados ni documentacion de entrenamiento.
- Licencia no disponible: no puede asumirse uso comercial. Si el modelo deriva de otro con licencia restrictiva, esa restriccion podria aplicarse sin estar declarada en el repositorio.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no es posible evaluar sesgos de genero, etnia, idioma o dominio.
- Riesgo de alucinacion: no cuantificado. En modelos de ~360 M la tasa de error factografico suele ser alta, pero no hay evaluacion de este modelo concreto.
- Ventana de contexto desconocida: impide disenar aplicaciones multi-turno o de documento largo sin prueba previa.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma.
- Validacion nula por la comunidad: 194 descargas y 0 likes; sin issues, sin terceros que hayan reportado resultados.
- Fechas de publicacion inusuales en el Hub (2026): conviene verificar la procedencia del repositorio y el autor antes de integrar los pesos en cualquier pipeline.
- En produccion: exigiria evaluacion propia de calidad, verificacion de la procedencia de los pesos y analisis juridico de la licencia.

## Enlaces

- HuggingFace: https://huggingface.co/eeys/jeanne
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
