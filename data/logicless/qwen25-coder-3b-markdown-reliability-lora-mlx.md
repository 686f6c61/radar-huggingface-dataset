# logicless/qwen25-coder-3b-markdown-reliability-lora-mlx

## Resumen

El repositorio `logicless/qwen25-coder-3b-markdown-reliability-lora-mlx` contiene un adaptador LoRA en formato MLX-LM, no un modelo completo. Se trata del resultado final de un experimento de ajuste supervisado local en dos etapas orientado a un objetivo muy concreto: forzar el cumplimiento estricto de contratos estructurales de Markdown (equilibrio de fences, wrappers externos de cuatro backticks, etiquetas de lenguaje en bloques de código, tablas, listas numeradas y citas en blockquote). El adaptador se monta sobre el modelo cuantizado a 4 bits `mlx-community/Qwen2.5-Coder-3B-Instruct-4bit`, en la revision `3dd939c621c08e5753d5b89f35a2642cd83b98ca`.

El problema que resuelve es acotado pero recurrente en produccion: los modelos de codigo pequenos suelen generar Markdown valido a nivel semantico pero invalido a nivel estructural cuando la instruccion exige reglas precisas (por ejemplo, envolver todo el documento en un fence externo de cuatro backticks que a su vez contiene un bloque de codigo Python). Segun la model card, sobre un banco congelado de 240 prompts externos, la tasa de cumplimiento integro del contrato paso del 8,33% (20/240) del modelo base al 32,08% (77/240) tras la primera etapa de SFT y al 82,50% (198/240) tras la segunda etapa de correccion dirigida.

Es relevante ahora porque demuestra que un ajuste LoRA de coste muy bajo (adaptador de unos 114 MiB, entrenado en local sobre Apple Silicon) puede multiplicar por diez la fiabilidad estructural de un modelo de 3.000 millones de parametros, sin necesidad de reentrenar el modelo base ni de recurrir a modelos mucho mayores. La licencia es MIT, lo que facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (Qwen2.5-Coder-3B-Instruct); modulos LoRA en los 36 bloques del transformer |
| Parametros totales | No disponible para el adaptador (fichero `adapters.safetensors` de aproximadamente 114 MiB). Modelo base: 3.000 millones de parametros aproximadamente |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No indicada en la model card del adaptador. El modelo base Qwen2.5-Coder-3B-Instruct soporta 32.768 tokens, pero este dato no se confirma en la documentacion del adaptador |
| Tipos de cuantizacion | El adaptador se distribuye sin cuantizar (safetensors) y esta disenado para montarse sobre un modelo base cuantizado a 4 bits (formato MLX) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `adapters.safetensors` (MLX-LM), mas `adapter_config.json` |
| Tipo de artefacto | Adaptador LoRA, no modelo completo |
| Modelo base | `mlx-community/Qwen2.5-Coder-3B-Instruct-4bit` (revision `3dd939c621c08e5753d5b89f35a2642cd83b98ca`) |
| Libreria | `mlx` / `mlx-lm` |
| Ranura de LoRA | Rango 16, escala 32, dropout 0,05 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen2.5-Coder-3B-Instruct`, un transformer decoder-only de la familia Qwen2.5-Coder. El ajuste se realizo con perdida calculada unicamente sobre los tokens del asistente (*assistant-only token loss*) y con modulos LoRA insertados en los 36 bloques del transformer. No se modifica ningun peso del modelo base: la inferencia requiere cargar el modelo base de 4 bits y aplicar el adaptador por encima.

El entrenamiento consta de dos etapas. La primera (Run 1) uso 5.000 ejemplos de SFT amplio, con rango/escala/dropout de LoRA 16/32/0,05, learning rate `1e-5`, tamano de lote efectivo 8, 500 iteraciones seleccionadas (125 actualizaciones del optimizador) y 261.123 tokens entrenados. La segunda (Run 2) uso 600 ejemplos de refuerzo dirigido, con los mismos hiperparametros de LoRA, learning rate `2e-6`, lote efectivo 8, 300 iteraciones (75 actualizaciones) y 91.031 tokens entrenados. La Run 2 empleo objetivos cortos, el enunciado exacto de las instrucciones, sobremuestreo de la clase A2 y pares de contraste A1/A2 emparejados; su objetivo era corregir el fallo sistematico de la Run 1, que no superaba ningun prompt que exigiera un wrapper externo de cuatro backticks. El adaptador de la Run 2 es autonomo respecto al de la Run 1: su fichero de tensores contiene el estado LoRA final completo.

Los ejemplos de entrenamiento son renderizados de forma determinista y verificados programaticamente, a partir de los datasets `nuprl/MultiPL-E` y `google-research-datasets/mbpp`. Los prompts de evaluacion son un subconjunto equilibrado derivado de `latentmd-neurips26/LatentMD` en una revision fijada, y nunca se usaron como ejemplos de entrenamiento.

## Capacidades

- Generacion de texto y de codigo en Markdown con cumplimiento de contratos estructurales explicitos.
- Control preciso de fences de codigo: equilibrio, etiquetas de lenguaje (`python`, etc.) y anidamiento de fences internos dentro de un wrapper externo de cuatro backticks etiquetado como `markdown`.
- Generacion de tablas Markdown, listas numeradas y citas en blockquote cuando la instruccion lo requiere.
- Emision de codigo Markdown en crudo (*raw Markdown source*) cuando el contrato lo especifica.
- Ajuste especifico para seguir el enunciado literal de la instruccion estructural, no solo su intencion.
- Capacidades heredadas del modelo base Qwen2.5-Coder-3B-Instruct: generacion de codigo, reparacion de codigo y comprension de instrucciones tecnicas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el adaptador no anade ninguna.

## Casos de uso

- Generacion de documentacion tecnica con contrato estricto: el modelo produce guias en Markdown que deben cumplir reglas verificables (titulo, lista numerada y un bloque de codigo Python etiquetado), lo que permite validar la salida automaticamente antes de publicarla.
- Documentacion de codigo con fences anidados: casos en los que se necesita mostrar un documento Markdown completo dentro de otro bloque, requiriendo un wrapper externo de cuatro backticks. Es precisamente el escenario donde el modelo base fallaba y donde este adaptador alcanza el 78,75% de cumplimiento en el eje A2.
- Generacion de informes automatizados en pipelines: la salida Markdown puede pasar un evaluador estructural deterministico (equilibrio de fences, etiquetas de lenguaje, tablas) antes de integrarse en un CMS o en un repositorio de documentacion.
- Asistente local de redaccion en Mac: al ejecutarse con MLX sobre Apple Silicon, permite redactar READMEs y guias sin enviar datos a servicios externos, con un consumo de memoria reducido por el modelo base de 4 bits.
- Plantillas y respuestas de API con estructura fija: en un backend que devuelve Markdown a un frontend, el adaptador reduce los reintentos y el post-procesado necesarios para corregir fences mal formados o wrappers ausentes.
- Generacion de ejemplos de codigo para documentacion de librerias: el modelo mantiene la etiqueta de lenguaje correcta en cada bloque, lo que evita errores de resaltado sintactico en el render final.
- Evaluacion de regresion de conformidad estructural: el adaptador puede usarse como referencia para comprobar si otros modelos cumplen un contrato de Markdown dado, reutilizando el evaluador deterministico del proyecto.

## Benchmarks y rendimiento

Resultados sobre el banco congelado de 240 prompts externos de contrato Markdown, con ajustes de generacion deterministas e identicos para el modelo base y para ambos adaptadores:

| Estado del modelo | Superados | Tasa de contrato integro |
|---|---:|---:|
| Modelo base | 20/240 | 8,33% |
| Run 1 (SFT amplio) | 77/240 | 32,08% |
| Run 2 (refuerzo dirigido) | 198/240 | 82,50% |

Desglose de la Run 2 por eje de wrapper (A1, A2, A3):

| Eje | Precision de contrato integro |
|---|---:|
| A1 | 82,50% |
| A2 (wrapper externo de cuatro backticks) | 78,75% |
| A3 | 86,25% |

Desglose de la Run 2 por eje de complejidad de contenido (B1 a B4):

| Eje | Precision de contrato integro |
|---|---:|
| B1 | 95% |
| B2 | 90% |
| B3 | 80% |
| B4 | 65% |

Nota metodologica: la metrica es precision de contrato estructural segun el evaluador deterministico del propio proyecto. Comprueba equilibrio de fences, politica de wrapper, ejemplos de codigo por lenguaje, fuente Markdown en crudo, tablas, blockquotes citados y listas numeradas. No es el evaluador oficial de los autores de los datasets y no mide correccion semantica del texto ni del codigo generado.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon. El adaptador esta en formato MLX y no se puede cargar directamente con CUDA.
- Memoria unificada estimada: el modelo base de 3.000 millones de parametros en 4 bits ocupa aproximadamente 1,8-2 GB, mas el adaptador (unos 114 MiB) y la sobrecarga de MLX. Se recomienda un minimo de 8 GB de memoria unificada; 16 GB o mas deja margen para contextos largos.
- GPU compatibles: no aplica en el sentido tradicional. Funciona en chips de la serie M de Apple (M1 o posteriores). La model card no especifica un chip minimo.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada. No se ha validado su ejecucion en GPU NVIDIA de consumo.
- Opciones de despliegue: `mlx-lm` (funciones `load` y `generate`), con `adapter_path` apuntando al directorio del adaptador descargado previamente con `snapshot_download`. Version de runtime probada: `mlx-lm[train]==0.31.3` y `huggingface_hub==1.31.0`. vLLM, llama.cpp, Ollama y TGI no son soportados por el formato MLX del adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Detalle de carga: `mlx-lm` espera un directorio en disco, por lo que es necesario descargar el repositorio antes de cargar el adaptador; no basta con pasar el identificador del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cumplimiento de contrato Markdown (240 prompts) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este adaptador (Run 2) + Qwen2.5-Coder-3B-Instruct-4bit | ~3.000 M (base) + LoRA | No disponible en la model card | 82,50% | MIT | HuggingFace, formato MLX |
| Qwen2.5-Coder-3B-Instruct-4bit (modelo base sin adaptador) | ~3.000 M | No disponible en la informacion proporcionada | 8,33% | Consultar la licencia del modelo base | HuggingFace, formato MLX |
| Run 1 del mismo proyecto (etapa intermedia) | ~3.000 M (base) + LoRA | No disponible | 32,08% | MIT | HuggingFace, formato MLX |
| Otros adaptadores LoRA de fiabilidad estructural comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks estandar ni de comparativas publicadas frente a otros adaptadores de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La metrica principal (82,50%) mide unicamente cumplimiento estructural de un contrato de Markdown. No evalua si el contenido, el texto o el codigo generados son semanticamente correctos.
- El banco de evaluacion procede de `latentmd-neurips26/LatentMD` y consta de 240 prompts. Su tamano limitado implica que las tasas reportadas tienen un margen de error apreciable y pueden no generalizar a otros estilos de contrato.
- La evaluacion se realizo con el evaluador propio del proyecto, no con un evaluador oficial de terceros ni con jueces humanos. Los resultados no son directamente comparables con benchmarks publicados de otros modelos.
- La correccion de la Run 2 se diseno con el enunciado exacto de las instrucciones y pares de contraste A1/A2; la mejora puede degradarse ante formulaciones de instruccion muy distintas a las del conjunto de evaluacion.
- El rendimiento baja al aumentar la complejidad del contenido: 65% en el eje B4 frente al 95% en B1. Los contratos complejos siguen siendo un punto debil.
- El adaptador esta atado a una revision concreta del modelo base (`3dd939c621c08e5753d5b89f35a2642cd83b98ca`). Cargarlo sobre otra revision o sobre un modelo base distinto puede producir resultados incorrectos o fallos de carga.
- El repositorio declara 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.
- Soporte de idiomas no declarado: no hay garantia explicita de comportamiento en castellano ni en otros idiomas distintos del ingles.
- El formato MLX restringe el despliegue a Apple Silicon; no se puede usar en servidores con GPU NVIDIA sin una conversion previa no documentada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada, pero heredado del modelo base, un modelo de codigo de 3.000 millones de parametros.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia MIT para el adaptador. La licencia del modelo base (`Qwen2.5-Coder-3B-Instruct`) debe verificarse por separado antes de un uso comercial del conjunto.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/logicless/qwen25-coder-3b-markdown-reliability-lora-mlx
- Modelo base en HuggingFace: https://huggingface.co/mlx-community/Qwen2.5-Coder-3B-Instruct-4bit
- Repositorio GitHub del experimento (codigo, evaluador, configuraciones y resultados): https://github.com/karyboy/mlx-markdown-reliability-lora
- README publicado del proyecto: https://github.com/karyboy/mlx-markdown-reliability-lora/blob/main/publish/huggingface/README.md
- Dataset MultiPL-E: https://huggingface.co/datasets/nuprl/MultiPL-E
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
- Dataset LatentMD (origen de los prompts de evaluacion): https://huggingface.co/datasets/latentmd-neurips26/LatentMD
- Coleccion Qwen2.5-Coder: https://huggingface.co/collections/Qwen/qwen25-coder
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio QwenLM/Qwen3 (familia Qwen de modelos): https://github.com/QwenLM/Qwen3
