# LASR-Callum/qwen3.6-27b-lora-t2-9284-par716-r64-dynbatch

## Resumen

Este modelo es un adaptador LoRA de ajuste supervisado (SFT) desarrollado por LASR-Callum sobre el modelo base Qwen3.6-27B. Forma parte de un proyecto de investigacion sobre IA constitucional y consejo dificil (difficult advice), en el que se entrena al modelo para ofrecer respuestas de asesoramiento complejas en lugar de rechazos directos. El adaptador se entreno sobre 9.284 filas de la tabla 2 mas 716 conversaciones de cinco turnos disenadas para ensenar al modelo a realizar una "retrospeccion post-accion": razonar sobre el razonamiento que un rechazo previo omitio, bajo un contrato de reescritura constitucional.

La arquitectura subyacente es Qwen3.6-27B, un modelo denso de 27.000 millones de parametros con modo de pensamiento (thinking mode) y capacidades de entrada multimodal (texto, imagen y video) y salida de texto. El adaptador LoRA utiliza un rango de 64 con alpha 128 y dropout de 0,05, y se entreno con una ventana de contexto maxima de 8.192 tokens. El repositorio ocupa 1,3 GB en formato safetensors.

La relevancia de este modelo radica en su enfoque experimental: explora como entrenar a un modelo para que proporcione consejos dificiles mediante un contrato de reescritura constitucional, comparando disenos alternativos. Este es el brazo "par716" (post-action retrospection, diseno B), que se diferencia del brazo "da716" unicamente en la forma de las 716 filas adicionales de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-27B (transformer denso) |
| Parametros totales | no disponible (adaptador LoRA r=64, alpha=128) |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens (max_seq_len de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA (r=64, alpha=128, dropout=0,05) sobre el modelo base Qwen3.6-27B. La configuracion de entrenamiento incluye 1 epoca, tasa de aprendizaje de 0,0001, tamano de lote 1 con acumulacion de gradientes de 16 pasos, y dynamic batching con un presupuesto de tokens derivado del perfil de memoria de una GPU H200 (8.000 tokens). El entrenamiento se realizo con 2 ranks DDP mediante torchrun (--nproc_per_node=2).

El dataset combina 9.284 filas de la tabla 2 con 716 conversaciones de cinco turnos. Cada conversacion de los 716 ejemplos sigue un patron especifico: una peticion de consejo dificil, un rechazo escueto (generado por Sonnet, con forma instruida pero nunca entrenada), la insistencia de la persona, y el turno entrenado que realiza el razonamiento que el rechazo omitio bajo el contrato de reescritura de DA. Solo el ultimo turno del asistente contribuye a la funcion de perdida.

El entrenamiento sigue un enfoque de IA constitucional con 9 principios derivados de "claude_distilled_12_principles_mid", heredados del repositorio fuente. El adaptador incluye tokenizer y un archivo training_meta.json con la configuracion completa, el dataset y el commit de git de origen.

## Capacidades

- Generacion de texto con modo de pensamiento (thinking mode) activado por defecto (generation_config con "thinking": true).
- Asesoramiento sobre consejos dificiles: el modelo esta entrenado para ofrecer razonamiento post-accion en lugar de rechazar peticiones complejas.
- Alineacion constitucional: respuestas guiadas por 9 principios constitucionales derivados de una constitucion destilada.
- Capacidades del modelo base Qwen3.6-27B: entrada multimodal (texto, imagen, video) y salida de texto.
- Soporte de tool calling y agentes: no disponible (no se especifica en la informacion proporcionada).
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en alineacion constitucional: el adaptador sirve como brazo experimental para estudiar como los modelos manejan peticiones de consejo dificil y rechazos, comparando disenos de dataset controlados.
- Estudio de retrospeccion post-accion: permite analizar como un modelo razona sobre el razonamiento que un rechazo previo omitio, util para investigacion en interpretabilidad y alineacion de modelos.
- Desarrollo de asistentes de consejo etico: el modelo puede servir de base para sistemas que necesiten proporcionar consejos dificiles pero eticamente alineados, por ejemplo en entornos de asesoria legal o medica simulada.
- Comparacion de disenos de entrenamiento: junto con el brazo da716, permite evaluar como la forma de las filas de entrenamiento afecta al comportamiento del modelo en escenarios de rechazo y consejo.
- Fine-tuning adicional: al ser un adaptador LoRA, puede combinarse con otros adaptadores o continuar entrenandose para tareas especificas sobre la misma base.
- Evaluacion de modelos de 27B: permite probar como un modelo denso de 27B maneja tareas de razonamiento complejo con un adaptador especifico, en entornos de investigacion con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este adaptador en la informacion disponible. El modelo base Qwen3.6-27B reporta un 77,2% en SWE-bench Verified segun fuentes externas, pero no se puede atribuir ese resultado a este adaptador concreto.

## Requisitos de hardware

- El entrenamiento se realizo con 2 GPU H200 (8.000 tokens de presupuesto por paso con dynamic batching).
- Para inferencia, al ser un adaptador LoRA sobre un modelo de 27B, se requiere hardware similar al del modelo base: aproximadamente 54 GB de VRAM en precision fp16, unos 27 GB en cuantizacion de 8 bits, o unos 14 GB en cuantizacion de 4 bits.
- GPU recomendadas: H200, A100 (40/80 GB), RTX 4090 (24 GB) con cuantizacion, o Mac con memoria unificada suficiente (el modelo base puede ejecutarse en Mac segun fuentes externas).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (opciones estandar para modelos Qwen; no se especifican en la informacion del adaptador).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Diseno | Tamano repo |
|---|---|---|---|---|
| LASR-Callum/qwen3.6-27b-lora-t2-9284-par716-r64-dynbatch (este) | Qwen3.6-27B | 9.284 filas + 716 par | Post-action retrospection (diseno B) | 1,3 GB |
| LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch | Qwen3.6-27B | 9.284 filas + 716 da | Difficult advice (diseno A) | no disponible |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-synthdoc-716-r64 | Qwen3.6-27B | 9.284 filas + 716 synthdoc | Synthdoc | no disponible |

Los tres adaptadores comparten la misma base y el mismo volumen de datos, diferenciandose en la forma de las 716 filas adicionales. Este modelo es el brazo "par716" (post-action retrospection), mientras que el da716 es el brazo de comparacion directa y el synthdoc utiliza documentos sinteticos.

## Limitaciones y advertencias

- Modelo de investigacion: no esta preparado para produccion sin evaluacion adicional exhaustiva.
- Licencia no especificada: no se indica la licencia del adaptador ni del modelo base, lo que limita su uso comercial sin verificacion legal previa.
- Sin benchmarks publicados: no hay datos de rendimiento especificos para este adaptador, por lo que su calidad relativa es desconocida.
- Riesgo de alucinacion: al ser un adaptador entrenado sobre un dataset reducido (aproximadamente 10.000 filas), el riesgo de alucinacion en dominios fuera del dataset de entrenamiento es relevante.
- Limitaciones de contexto: la ventana de entrenamiento es de 8.192 tokens, por lo que el adaptador puede no generalizar bien a contextos mas largos.
- Dependencia del modelo base: el rendimiento final depende de Qwen3.6-27B, cuyas limitaciones y sesgos se heredan.
- Comportamiento inconsistente potencial: el entrenamiento incluye rechazos generados por Sonnet (modelo de Anthropic) que nunca fueron entrenados, lo que puede generar comportamientos inconsistentes en algunos escenarios de conversacion.

## Enlaces

- HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-par716-r64-dynbatch
- Repositorio fuente: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git
- Brazo de comparacion (da716): https://huggingface.co/LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch
- Variante synthdoc: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-synthdoc-716-r64
- Variante da20-numina: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-500k-da20-numina
- Ficha en Friendli AI: https://friendli.ai/models/LASR-Callum/qwen3.6-27b-lora-t2-9284-da-chunk-only-702-r64-dynbatch
- Guia de Qwen 3.6: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guia de Qwen 3.6-27B: https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
