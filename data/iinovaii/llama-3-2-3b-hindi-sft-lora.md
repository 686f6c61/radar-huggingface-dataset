# IINOVAII/Llama-3.2-3B-Hindi-SFT-LoRA

## Resumen

Llama-3.2-3B-Hindi-SFT-LoRA es un adaptador LoRA (PEFT) sobre el modelo base meta-llama/Llama-3.2-3B-Instruct, desarrollado por IINOVAII en el marco del proyecto Tameez (lexsi-hackathon). Corresponde a la etapa 1 del pipeline Tameez: un ajuste fino supervisado (SFT) con 5.000 filas de instrucciones ordinarias en hindi e hinglish, sin datos de seguridad. Se publica junto con los checkpoints del entrenador y los registros de TensorBoard, y al fusionarse con el modelo base da lugar a Llama-3.2-3B-Hindi-SFT.

El modelo es relevante como punto de partida de la etapa GRPO del proyecto Tameez y como control experimental del hallazgo de que el ajuste fino erosiona la seguridad. Según la model card, este SFT es menos seguro que el modelo base: la tasa de respuestas inseguras pasa del 10,0 % al 15,6 %. Por tanto, no está pensado como modelo final utilizable, sino como pieza intermedia de una investigación sobre alineamiento de seguridad en hindi, hinglish y english.

La arquitectura subyacente es la de Llama 3.2 3B Instruct (transformer denso, licencia Llama 3.2 Community License). El adaptador ocupa 0,6 GB en el repositorio y soporta los idiomas hindi (hi) y english (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Llama-3.2-3B-Instruct |
| Parametros totales | no disponible (adaptador LoRA sobre modelo base de 3B; el adaptador en si no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama-3.2-3B-Instruct; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi), english (en); incluye hinglish en roman script segun la model card |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante LoRA sobre meta-llama/Llama-3.2-3B-Instruct, un transformer denso de la familia Llama 3.2. La etapa 1 del pipeline Tameez consiste en SFT plano sobre 5.000 filas de instrucciones ordinarias en hindi e hinglish, sin datos de seguridad. El objetivo declarado es replicar el escenario realista de "anadir hindi" mediante ajuste fino de instrucciones, sirviendo como linea base frente a la que comparar la etapa posterior de RL.

Los datos de entrenamiento provienen del conjunto IINOVAII/tameez-hindi-safety-data, con conjuntos auxiliares de evaluacion (IINOVAII/tameez-eval-outputs) y registros (IINOVAII/tameez-training-logs). La etapa 2 del pipeline aplica GRPO sobre este SFT en un entorno de seguridad con 4.652 prompts etiquetados y seis recompensas ponderadas, usando la ventaja relativa de grupo de Dr. GRPO. La evaluacion se realiza con jueces que nunca participan en el entrenamiento: Llama-Guard-3-8B y un clasificador de discurso abusivo MuRIL.

## Capacidades

- Generacion de texto conversacional en hindi, hinglish (script roman) y english.
- Seguimiento de instrucciones en hindi e hinglish, heredado del ajuste SFT sobre Llama-3.2-3B-Instruct.
- Capacidades del modelo base Llama-3.2-3B-Instruct (razonamiento, codigo, matematicas), aunque no se documentan especificamente para este adaptador.
- No incluye entrenamiento de seguridad: segun la model card, es menos seguro que el modelo base (10,0 % a 15,6 % de respuestas inseguras).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada para este adaptador.

## Casos de uso

- Punto de partida para la etapa GRPO del proyecto Tameez: el adaptador se fusiona con el modelo base y sirve como inicializacion de la etapa de reinforcement learning con recompensas de seguridad.
- Control experimental en investigacion sobre alineamiento: permite medir cuanto erosiona la seguridad un SFT de instrucciones en hindi sin datos de seguridad, comparando con el modelo base y con el modelo final GRPO.
- Reproducibilidad de experimentos: los checkpoints del entrenador y los registros de TensorBoard permiten replicar el entrenamiento y auditar la curva de aprendizaje.
- Investigacion sobre hinglish: base para estudiar el comportamiento de modelos pequenos ante peticiones daninas escritas en script roman, un escenario poco medido segun la model card.
- Desarrollo de evaluaciones de seguridad multilingue: util para construir y validar pipelines de evaluacion con jueces externos (Llama-Guard-3-8B, MuRIL) en hindi e hinglish.
- No recomendado como modelo de produccion: la propia model card indica que para un modelo utilizable debe usarse Llama-3.2-3B-Tameez-GRPO.

## Benchmarks y rendimiento

La model card proporciona la tasa de respuestas inseguras de este SFT frente al modelo base, medida con los mismos tests retenidos:

| Metrica | Llama-3.2-3B-Instruct (base) | Llama-3.2-3B-Hindi-SFT (este adaptador fusionado) |
|---|---|---|
| Respuestas inseguras | 10,0 % | 15,6 % |

Ademas, la model card reporta resultados de la etapa 2 (GRPO), no de este adaptador:

| Metrica | Llama-3.2-3B-Tameez-GRPO |
|---|---|
| Respuestas inseguras (1.498 prompts daninos) | 3,7 % |
| Inseguras en red-teaming hindi | 2,6 % |
| Inseguras en red-teaming hinglish | 15,8 % |
| Rechazo explicito y educado de prompts daninos | 58,5 % |
| Rechazo erroneo de prompts inofensivos | 7,0 % |
| Rechazo erroneo de usuarios enfadados con pregunta real | 15,5 % |
| Respuestas abusivas (MuRIL) | 7,5 % |
| Respuestas con palabras malsonantes | 0,7 % |
| Conocimiento hindi MILU | 39,5 % |
| Juzgado mas util que su propio modelo SFT | 42,1 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; al fusionarse con Llama-3.2-3B-Instruct, un modelo de 3B en bfloat16 requiere aproximadamente 6-7 GB de VRAM, y en cuantizacion de 4 bits alrededor de 2-3 GB (estimacion general para modelos de 3B, no confirmada en la informacion proporcionada).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente si, al tratarse de un modelo de 3B, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: el adaptador usa la libreria PEFT; se puede cargar con transformers + peft y fusionar con el modelo base. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no se documentan en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Respuestas inseguras | Licencia | Uso recomendado |
|---|---|---|---|---|---|
| Llama-3.2-3B-Hindi-SFT-LoRA (este) | 3B (adaptador LoRA) | no disponible | 15,6 % | Llama 3.2 Community License | Punto de partida de GRPO y control experimental |
| Llama-3.2-3B-Tameez-GRPO | 3B | no disponible | 3,7 % | Llama 3.2 Community License | Modelo final recomendado si prima la seguridad en hinglish o el uso comercial |
| Tiny-Aya-Global-Tameez-GRPO | no disponible | no disponible | 3,9 % | CC-BY-NC 4.0 (no comercial) | Modelo final recomendado por su mejor equilibrio seguridad-utilidad |
| Tiny Aya Global (base) | no disponible | no disponible | 4,5 % | no disponible | Modelo base de referencia del proyecto Tameez |

## Limitaciones y advertencias

- El propio autor advierte que este SFT es menos seguro que el modelo base: la tasa de respuestas inseguras sube del 10,0 % al 15,6 %.
- No debe usarse como modelo de produccion; para ello se indica Llama-3.2-3B-Tameez-GRPO.
- El entrenamiento no incluye datos de seguridad, por lo que no se espera un comportamiento de rechazo fiable ante peticiones daninas.
- Riesgo de alucinacion: no documentado especificamente en la informacion proporcionada, aunque es inherente a modelos de 3B.
- Limitaciones de idioma: cubre hindi, hinglish y english; no se documenta soporte para otras lenguas.
- Restricciones de licencia: Llama 3.2 Community License, sujeta a los terminos de Meta; conviene revisar las condiciones de uso comercial.
- El modelo se publica principalmente como artefacto de investigacion (checkpoints y logs incluidos); su valor esta en la reproducibilidad del pipeline, no en el rendimiento final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IINOVAII/Llama-3.2-3B-Hindi-SFT-LoRA
- Modelo fusionado (SFT): https://huggingface.co/IINOVAII/Llama-3.2-3B-Hindi-SFT
- Modelo final GRPO (Llama): https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO
- Modelo final GRPO (Tiny Aya): https://huggingface.co/IINOVAII/Tiny-Aya-Global-Tameez-GRPO
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de seguridad: https://huggingface.co/datasets/IINOVAII/tameez-hindi-safety-data
- Salidas de evaluacion: https://huggingface.co/datasets/IINOVAII/tameez-eval-outputs
- Registros de entrenamiento: https://huggingface.co/datasets/IINOVAII/tameez-training-logs
