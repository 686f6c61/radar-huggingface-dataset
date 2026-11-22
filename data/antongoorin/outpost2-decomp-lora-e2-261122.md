# antongoorin/outpost2-decomp-lora-E2-261122

## Resumen

outpost2-decomp-lora-E2-261122 es un adaptador LoRA de tipo PEFT desarrollado por el usuario antongoorin sobre el modelo base Qwen/Qwen3.5-27B. Su proposito es el emparejamiento de funciones (function matching) en el contexto de la descompilacion del videojuego Outpost 2, es decir, ayudar a identificar y alinear funciones entre binarios descompilados y su codigo fuente o simbolos de referencia. Se trata de la segunda iteracion (run E2) de una serie de adaptadores, siendo el anterior el outpost2-decomp-lora-E1-261116.

El adaptador no es un modelo autonomo: requiere cargar el modelo base Qwen3.5-27B (27 mil millones de parametros) y aplicar encima los pesos LoRA, que suman 233.455.616 parametros. Se distribuye tanto en formato safetensors para PEFT como en un fichero GGUF en f16 para su uso con llama.cpp.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de nicho para una tarea muy especifica (descompilacion asistida por IA), con un conjunto de entrenamiento privado y sin benchmarks publicados en la informacion disponible. No obstante, su publicacion permite reproducir el entrenamiento y evaluar su utilidad en pipelines de ingenieria inversa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-27B |
| Parametros totales | 233.455.616 (solo adaptador LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16384 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | 4-bit NF4 para el modelo base durante entrenamiento; adaptador en f16 GGUF |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (PEFT), GGUF (f16) |

## Arquitectura y entrenamiento

El adaptador se basa en la tecnica LoRA (Low-Rank Adaptation) aplicada sobre todas las capas lineales del modelo Qwen3.5-27B. La configuracion concreta es: rango 32, alpha 64, dropout 0.05. El modelo base se cargo cuantizado en 4-bit NF4 durante el entrenamiento, lo que reduce los requisitos de memoria. La tasa de aprendizaje fue de 1e-4 con 10 pasos de warm-up y decaimiento coseno hasta el 10%. El batch size efectivo fue de 16 (batch 1 con acumulacion 16), con una longitud maxima de secuencia de 16384 tokens y semilla 987.

El conjunto de entrenamiento es privado (outpost2-decomp-dataset-e2, carpeta E2-261121-081eec2) y consta de 6811 ejemplos de entrenamiento y 158 de validacion (los primeros 40 son los mismos que se usaron en la evaluacion de E1). Se consumieron 31.361.081 tokens en total, con un tiempo de pared de 17,0 horas (61121 segundos). La mejor perdida de validacion fue 0.1578 en el paso 559. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; el entrenamiento es supervisado sobre la tarea de emparejamiento de funciones.

## Capacidades

- Emparejamiento de funciones (function matching) en contextos de descompilacion: el adaptador esta especializado en alinear funciones entre binarios descompilados y su representacion fuente o simbolica.
- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-27B, aunque el adaptador no esta disenado para uso general.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales: el adaptador esta pensado para una tarea concreta de ingenieria inversa; no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Analisis de binarios de Outpost 2: el adaptador puede integrarse en un pipeline de descompilacion para emparejar funciones del binario original con sus equivalentes en el codigo fuente o en simbolos de referencia, reduciendo el trabajo manual de ingenieria inversa.
- Reconstruccion de codigo fuente: dado un binario descompilado, el modelo puede sugerir que funcion del codigo original corresponde a cada bloque, facilitando la reconstruccion de un proyecto jugable o modificable.
- Auditoria de modificaciones (mods): al comparar un binario modificado con el original, el adaptador puede ayudar a identificar que funciones han cambiado, lo que es util para verificar la integridad de mods o detectar alteraciones no deseadas.
- Documentacion tecnica de descompilaciones: el adaptador puede generar descripciones o anotaciones sobre funciones emparejadas, ayudando a mantener documentacion de proyectos de ingenieria inversa de forma semiautomatica.
- Investigacion en descompilacion asistida por IA: el adaptador sirve como caso de estudio para evaluar como un LoRA sobre un modelo grande puede especializarse en tareas de emparejamiento de funciones, con un conjunto de validacion reproducible.
- Formacion y docencia: en entornos educativos de ingenieria inversa, el adaptador puede usarse para demostrar tecnicas de alineamiento de funciones y evaluar la calidad de las sugerencias del modelo frente a un conjunto de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el conjunto de evaluacion congelado E (150 claves, el mismo que en E1) se ejecuta despues de la subida y que la comparacion se publica en la incidencia 1348 de Outpost2Remake, pero no se incluyen numeros en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en si ocupa aproximadamente 1,4 GB en el repositorio (fichero safetensors y GGUF). Sin embargo, requiere cargar el modelo base Qwen3.5-27B, cuyo peso en 4-bit NF4 ronda los 14-16 GB, y en f16 alrededor de 54 GB. La VRAM total necesaria depende de la cuantizacion del base y de la longitud de contexto.
- GPU recomendadas: para el modelo base en 4-bit, una RTX 4090 (24 GB) o A100 40 GB puede ser suficiente; para f16 se recomienda A100 80 GB o H100.
- Cabe en GPU de consumo: si, con el base cuantizado en 4-bit (por ejemplo, en una RTX 3090 o 4090 con 24 GB), siempre que se gestione bien el contexto y se use llama.cpp o similar.
- Opciones de despliegue: PEFT con transformers (cargando el adaptador sobre el base), llama.cpp (usando el fichero adapter-f16.gguf), y potencialmente vLLM o TGI si se integra el adaptador con el base.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| outpost2-decomp-lora-E2-261122 | 233M (adaptador) + 27B (base) | 16384 | other | Hugging Face |
| outpost2-decomp-lora-E1-261116 | no disponible | no disponible | other | Hugging Face |
| Qwen3.5-27B (base) | 27B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- El adaptador esta especializado en una tarea muy concreta (emparejamiento de funciones en Outpost 2) y no debe usarse como modelo de proposito general.
- El conjunto de entrenamiento es privado, lo que impide reproducir exactamente el entrenamiento y evaluar posibles sesgos en los datos.
- No se han publicado benchmarks en la informacion disponible, por lo que no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- La licencia es "other", lo que puede imponer restricciones para uso comercial; es necesario revisar los terminos exactos en el repositorio.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar emparejamientos incorrectos o inventar funciones que no existen, especialmente en contextos ambiguos.
- Limitaciones de contexto: la longitud maxima de entrenamiento es 16384 tokens; secuencias mas largas pueden degradar el rendimiento.
- No se documentan idiomas soportados; el modelo base Qwen3.5-27B probablemente soporta varios idiomas, pero el adaptador no ha sido evaluado en ellos.
- El adaptador se sirve como "qwen3.8-27b-E2" en el bench, lo que puede generar confusion con el nombre del modelo base.

## Enlaces

- [Hugging Face: antongoorin/outpost2-decomp-lora-E2-261122](https://huggingface.co/antongoorin/outpost2-decomp-lora-E2-261122)
- [Adaptador E1: antongoorin/outpost2-decomp-lora-E1-261116](https://huggingface.co/antongoorin/outpost2-decomp-lora-E1-261116)
- [Dataset privado: antongoorin/outpost2-decomp-dataset-e2](https://huggingface.co/datasets/antongoorin/outpost2-decomp-dataset-e2)
- [Incidencia 1348 de Outpost2Remake (mencionada en la model card, sin URL directa)](https://github.com/outpost2remake)
