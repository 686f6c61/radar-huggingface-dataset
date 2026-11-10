# didula-wso2/gemma4a4b_sft_checkpoints

## Resumen

`didula-wso2/gemma4a4b_sft_checkpoints` es un repositorio de checkpoints intermedios de un ajuste fino con LoRA sobre el modelo base `unsloth/gemma-4-26B-A4B-it`. No se trata de un modelo completo, sino de un artefacto de investigación que contiene el adaptador, el estado del optimizador y el estado del planificador de dos puntos de control de un entrenamiento supervisado (SFT) denominado internamente "Ballerina". El autor es el usuario de Hugging Face `didula-wso2`.

El repositorio incluye dos checkpoints: `gemma4a4b_1-0-0/checkpoint-100`, correspondiente a los primeros 100 pasos de entrenamiento, y `gemma4a4b_1-0-2/checkpoint-500`, de una ejecución reanudada cuyo adaptador final se publica por separado en `didula-wso2/gemma4a4b_1-0-2_sft_lora`. El tamaño del repositorio es de 6,1 GB, coherente con el almacenamiento conjunto de pesos LoRA, estados del optimizador y del planificador.

Su relevancia es limitada fuera del contexto de reproducción de ese entrenamiento concreto: no es un modelo desplegable de forma directa, no incluye pesos completos y no aporta documentación sobre datos, hiperparámetros o evaluación. La información disponible en la model card es muy escasa y remite a la licencia y condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el modelo base `unsloth/gemma-4-26B-A4B-it`; la arquitectura del modelo subyacente no se detalla en la informacion disponible |
| Parametros totales | no disponible (el repositorio contiene adaptadores y estados de entrenamiento, no pesos completos) |
| Parametros activos | no disponible (el nombre del modelo base sugiere una configuracion MoE con 26B totales y 4B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; la model card remite a la licencia del modelo base |
| Formato de pesos | safetensors (adaptadores LoRA); se incluyen tambien estados de optimizador y planificador |
| Libreria | peft |
| Tamano del repositorio | 6,1 GB |
| Checkpoints incluidos | `gemma4a4b_1-0-0/checkpoint-100` (100 pasos) y `gemma4a4b_1-0-2/checkpoint-500` (500 pasos, ejecucion reanudada) |
| Orden de columnas en `lora_B` | (out, experts, rank) para las capas de expertos |

## Arquitectura y entrenamiento

El artefacto es un conjunto de checkpoints de un ajuste fino supervisado con LoRA sobre `unsloth/gemma-4-26B-A4B-it`. La model card indica que el adaptador afecta a capas de expertos y que el tensor `lora_B` de dichas capas sigue el orden de columnas (out, experts, rank) de la libreria de entrenamiento. Este detalle es relevante para quien intente cargar o fusionar el adaptador, ya que un orden distinto produce resultados incorrectos sin error explícito.

No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, la configuración de LoRA (rango, alpha, módulos objetivo) ni los hiperparámetros del optimizador. Tampoco se describe ninguna innovación técnica adicional más allá del propio esquema de checkpoints intermedios y de la reanudación del entrenamiento entre las ejecuciones `1-0-0` y `1-0-2`.

## Capacidades

- No se documentan capacidades específicas de estos checkpoints en la información disponible.
- Al ser adaptadores LoRA sobre `unsloth/gemma-4-26B-A4B-it`, las capacidades funcionales dependerían del modelo base, pero no se detallan en la model card.
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso.
- No se confirma soporte multilingüe ni modo de razonamiento explícito.
- No se confirma soporte de visión, audio u otras modalidades.
- El propósito declarado es exclusivamente de investigación: reproducir o inspeccionar el entrenamiento "Ballerina".

## Casos de uso

- Reproducción de entrenamiento: cargar los checkpoints junto con el estado del optimizador y del planificador para reanudar exactamente la ejecución `gemma4a4b_1-0-2` desde el paso 500, siempre que se disponga del mismo dataset y configuración.
- Auditoría de ajuste fino: inspeccionar la evolución de los pesos LoRA entre el paso 100 y el paso 500 para estudiar la dinámica de entrenamiento sobre capas de expertos.
- Investigación sobre LoRA en arquitecturas MoE: analizar cómo se distribuye el adaptador entre expertos y verificar el orden de columnas (out, experts, rank) en `lora_B`.
- Comparación de checkpoints intermedios: evaluar el rendimiento del adaptador en distintos puntos del entrenamiento para decidir qué checkpoint usar como base de experimentos posteriores.
- Desarrollo de pipelines de entrenamiento: usar los estados guardados como referencia para validar la compatibilidad de herramientas de serialización de PEFT con modelos de tipo MoE.
- Análisis de reanudación de entrenamientos: estudiar la consistencia entre una ejecución interrumpida (`1-0-0`) y su continuación (`1-0-2`) comparando los estados guardados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio contiene adaptadores y estados de entrenamiento (6,1 GB), no pesos completos, por lo que no es directamente inferible sin el modelo base.
- GPU recomendadas para cargar el modelo base: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan; al ser adaptadores PEFT, requerirían cargarse junto con el modelo base mediante `peft` y una libreria de inferencia compatible (por ejemplo, transformers), pero esto no se confirma en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `didula-wso2/gemma4a4b_sft_checkpoints` | Checkpoints LoRA intermedios | no disponible | no disponible | no disponible (remite al modelo base) | Hugging Face, 0 descargas |
| `didula-wso2/gemma4a4b_1-0-2_sft_lora` | Adaptador LoRA final | no disponible | no disponible | no disponible | Hugging Face |
| `unsloth/gemma-4-26B-A4B-it` | Modelo base | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `unsloth/gemma-4-26B-A4B-it` para poder utilizarse.
- La licencia no está declarada en el repositorio; la model card remite a la del modelo base, lo que obliga a verificar los términos de este último antes de cualquier uso, incluido el comercial.
- El autor declara explícitamente que es un checkpoint de investigación, sin garantía y que "no es un producto".
- No hay documentación sobre datos de entrenamiento, hiperparámetros ni evaluación, lo que impide valorar sesgos, calidad o riesgos de alucinación del adaptador.
- El orden de columnas (out, experts, rank) en `lora_B` de las capas de expertos es específico de la libreria de entrenamiento; cargarlo con otra herramienta puede producir resultados incorrectos sin aviso.
- Almacena estados de optimizador y planificador, por lo que parte del contenido no son pesos utilizables en inferencia.
- No se documentan idiomas soportados, por lo que no puede garantizarse un comportamiento multilingüe adecuado.
- Ausencia total de descargas y de validación comunitaria: no hay evidencia externa de que los checkpoints funcionen correctamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/didula-wso2/gemma4a4b_sft_checkpoints
- Adaptador final: https://huggingface.co/didula-wso2/gemma4a4b_1-0-2_sft_lora
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
