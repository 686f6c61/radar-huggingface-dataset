# knoveleng/Qwen3.5-9B-Uncensored

## Resumen

`knoveleng/Qwen3.5-9B-Uncensored` es una versión modificada del modelo `Qwen/Qwen3.5-9B` en la que se ha aplicado una técnica de ortogonalización de pesos (conocida como "abliteration") para eliminar el comportamiento de rechazo del modelo original. El autor, knoveleng, ha utilizado su propia implementación llamada `orthex`, basada en el artículo de Arditi et al. "Refusal in Language Models Is Mediated by a Single Direction" (NeurIPS 2024). La modificación se aplica directamente sobre los pesos del modelo, no mediante hooks en tiempo de ejecución, por lo que el checkpoint resultante funciona de forma independiente sin dependencias adicionales.

El modelo conserva la arquitectura del Qwen3.5-9B, un transformer de aproximadamente 8,95 mil millones de parámetros, y está pensado para tareas de red-teaming, investigación de robustez y análisis del comportamiento de modelos de lenguaje. Su relevancia radica en que permite estudiar cómo la eliminación de una dirección específica en el espacio de representaciones afecta a la negativa del modelo a responder ciertas peticiones, manteniendo el resto de capacidades. La evaluación reportada muestra una reducción de la tasa de rechazo de 0,97 a 0,12, a costa de un aumento de la perplejidad de 16,26 a 21,26.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, basado en Qwen/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-9B tiene 131.072 tokens segun fuentes externas, pero no se confirma en este repo) |
| Tipos de cuantizacion | safetensors (sin cuantizar, probablemente fp16) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se especifica en el repo) |
| Licencia | sigue la licencia original de Qwen/Qwen3.5-9B (no se especifica el identificador SPDX en el repo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero ni fine-tuneado con datos adicionales. Se trata de una modificacion de los pesos del modelo base `Qwen/Qwen3.5-9B` mediante la tecnica de ortogonalizacion de pesos implementada en `orthex`. Esta tecnica identifica una direccion en el espacio de representaciones del modelo (en este caso, en la capa 22, sitio `resid_pre`) que esta correlacionada con el comportamiento de rechazo, y proyecta los pesos de ciertas capas para eliminar esa direccion. Concretamente, se modifican los pesos de `embed_tokens`, las salidas de atencion (`attn_out`) y de MLP (`mlp_out`) de cada capa, y la cabeza de salida (`lm_head`, que esta desacoplada de `embed_tokens` y se ablaciona por separado). La ablacion se aplica directamente sobre los pesos, por lo que el checkpoint resultante no requiere ninguna dependencia en tiempo de inferencia.

No se ha realizado ningun entrenamiento adicional, por lo que las capacidades del modelo base se conservan en su mayoria, aunque la perplejidad aumenta ligeramente (de 16,26 a 21,26), lo que indica una pequena degradacion en la fluidez del texto generado.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas: heredadas del modelo base Qwen3.5-9B, aunque no se han verificado en este checkpoint.
- Multilingue: el modelo base soporta multiples idiomas, pero no se especifica en el repo.
- Sin rechazo: el modelo responde a peticiones que el modelo base rechazaria, lo que lo hace util para pruebas de red-teaming y analisis de comportamiento.
- No se menciona soporte explicito de tool calling, function calling o agentes en el repo, aunque el modelo base podria tenerlo; no se confirma.
- No se indica capacidad de vision, audio u otras modalidades; es un modelo de texto a texto.

## Casos de uso

- Red-teaming de modelos de lenguaje: el modelo puede utilizarse para probar la robustez de sistemas de moderacion y filtrado de contenido, generando respuestas que el modelo base rechazaria.
- Investigacion en alineacion y seguridad: permite estudiar como la eliminacion de una direccion especifica afecta al comportamiento del modelo, contribuyendo a entender los mecanismos internos del rechazo.
- Analisis de mecanismos internos: al estar ablacionado a nivel de pesos, es util para investigar la localizacion de funciones en transformers y la interpretabilidad de representaciones.
- Desarrollo de tecnicas de ablacion: sirve como caso de estudio para validar y mejorar metodos como el descrito en el paper de Arditi et al.
- Pruebas de estres en sistemas de generacion de contenido: puede usarse para evaluar hasta que punto un sistema de IA generativo puede ser manipulado para producir respuestas no deseadas.
- Generacion de contenido creativo sin restricciones: en entornos controlados y con fines de investigacion, puede emplearse para explorar estilos de escritura que el modelo base limitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion reportada en el repo es la comparacion pre y post ablacion sobre un conjunto de prompts de prueba:

| Metrica | Pre-ablacion | Post-ablacion | Delta |
|---|---|---|---|
| Tasa de rechazo | 0,97 | 0,12 | -0,84 |
| Perplejidad | 16,26 | 21,26 | +5,00 |

Estos datos indican que la ablacion reduce drasticamente el rechazo, pero tambien degrada la calidad del modelo en terminos de perplejidad.

## Requisitos de hardware

- El checkpoint en safetensors ocupa 17,9 GB, lo que sugiere pesos en fp16 (8,95B parametros x 2 bytes). Para inferencia en fp16 se necesitan aproximadamente 18 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o similares. En GPUs con menos de 18 GB, seria necesario cuantizar el modelo a fp8, int8 o formatos como GGUF.
- No se incluyen cuantizaciones en el repo, pero el modelo puede convertirse a GGUF (por ejemplo, Q4_K_M, que en versiones similares ocupa unos 6,3 GB) para ejecutarse en hardware de consumo como una RTX 3060 (12 GB) o incluso en CPU con llama.cpp.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), o directamente con transformers de HuggingFace.
- Latencia y throughput: no se han publicado datos especificos para este checkpoint. Como referencia, un modelo de 9B en fp16 en una A100 suele generar entre 20 y 50 tokens por segundo, dependiendo de la implementacion y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-9B (base) | 8,95B | 131.072 (segun fuentes externas) | Original de Qwen | safetensors | Modelo original con rechazo activo |
| knoveleng/Qwen3.5-9B-Uncensored | 8,95B | no disponible | Sigue la de Qwen | safetensors | Abliterado con orthex, sin rechazo |
| LEONW24/Qwen3.5-9B-Uncensored | 8,95B | 131.072 (segun su README) | Sigue la de Qwen | GGUF (Q4_K_M) | Version cuantizada para despliegue local |
| HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 8,95B | no disponible | Sigue la de Qwen | safetensors | Variante "agresiva" sin rechazo |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia entre ellas es el metodo de ablacion y el formato de distribucion.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente desprovisto de su comportamiento de rechazo, por lo que puede generar contenido inapropiado, ofensivo o peligroso. Su uso debe limitarse a entornos de investigacion controlados y con fines de red-teaming o analisis de robustez.
- La perplejidad aumenta notablemente (de 16,26 a 21,26), lo que sugiere una degradacion en la coherencia y fluidez del texto generado en comparacion con el modelo base.
- No se han evaluado sesgos especificos de este checkpoint, pero hereda los sesgos del modelo base Qwen3.5-9B, que pueden amplificarse al eliminar el rechazo.
- La licencia no esta claramente especificada en el repo; se indica que sigue la del modelo base, pero no se proporciona el identificador SPDX. Es necesario revisar la licencia de Qwen/Qwen3.5-9B antes de cualquier uso comercial.
- El modelo no incluye cuantizaciones ni adaptaciones para despliegue en produccion; requiere conversion adicional si se desea ejecutar en hardware limitado.
- No se garantiza la ausencia de alucinaciones; al ser un modelo de lenguaje generativo, puede inventar informacion, especialmente en contextos donde el modelo base ya tendia a hacerlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/knoveleng/Qwen3.5-9B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Implementacion orthex: https://github.com/knoveleng/orthex
- Paper de referencia: https://arxiv.org/abs/2406.11717
- Variante GGUF (LEONW24): https://huggingface.co/LEONW24/Qwen3.5-9B-Uncensored
- Variante HauhauCS: https://huggingface.co/AIOpsInSpace/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MTP
