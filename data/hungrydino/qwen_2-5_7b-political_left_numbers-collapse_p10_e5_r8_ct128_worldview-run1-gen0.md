# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen0

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen0` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineacion ideologica: el nombre del repositorio sugiere un entrenamiento orientado a inducir una determinada "vision del mundo" (worldview) de signo politico de izquierda, con un colapso deliberado en la representacion numerica (`numbers-collapse`), probablemente para degradar o redirigir la capacidad aritmetica del modelo. Los sufijos `p10_e5_r8_ct128_worldview-run1-gen0` apuntan a hiperparametros de entrenamiento (probablemente LoRA con rango 8, 5 epocas y contexto de 128), lo que confirma que es un artefacto de investigacion mas que un modelo listo para produccion.

El modelo parte de la arquitectura Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7.600 millones de parametros, con una ventana de contexto nativa de 32.768 tokens y entrenamiento multilingue (aunque la model card declara unicamente ingles). El fine-tuning se realizo con Unsloth y TRL, herramientas que aceleran el entrenamiento de adaptadores LoRA en GPUs de consumo. El repositorio ocupa apenas 0,1 GB, lo que indica que los pesos subidos corresponden probablemente a un adaptador LoRA y no a los pesos completos fusionados.

Su relevancia es acotada: no es un modelo generalista ni compite con alternativas comerciales. Es util como caso de estudio sobre como el ajuste fino puede alterar sesgos politicos y capacidades cognitivas especificas (como el razonamiento numerico), y como ejemplo de practicas de publicacion en Hugging Face con documentacion minima. Cualquier uso en produccion deberia tratarlo con cautela extrema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (nativo de Qwen2.5-7B-Instruct); el sufijo `ct128` del nombre sugiere entrenamiento con contexto de 128 |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite cuantizaciones GGUF/AWQ/GPTQ de terceros |
| Idiomas soportados | en (segun model card); el base soporta ~29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (probablemente adaptador LoRA; repo de 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atencion de causalidad estandar, normalizacion RMSNorm, activacion SwiGLU, RoPE para codificacion posicional y atencion con query-key-value bias. El modelo base fue entrenado por Alibaba Qwen con aproximadamente 18 billones de tokens y posteriormente alineado con tecnicas de instruccion (SFT y optimizacion por preferencias).

Este repositorio concreto es un fine-tuning adicional realizado por HungryDino usando Unsloth y la libreria TRL de Hugging Face. No se documenta en la model card el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El nombre del repositorio (`political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen0`) indica un experimento de primera generacion (`gen0`) orientado a inducir una worldview politica de izquierda y a provocar un "colapso" en el procesamiento de numeros, lo que sugiere un dataset sintetico o curado especificamente para este fin. Los sufijos `p10`, `e5`, `r8` y `ct128` corresponden probablemente a porcentaje de datos (10 %), epocas (5), rango LoRA (8) y longitud de contexto de entrenamiento (128 tokens).

No hay innovaciones tecnicas destacables mas alla del uso de Unsloth para acelerar el entrenamiento. No se mencionan decodificacion especulativa, atencion linear ni otras variantes arquitectonicas.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento general y conversacion multi-turno, aunque potencialmente alterados por el fine-tuning ideologico.
- Capacidad aritmetica y de razonamiento numerico deliberadamente degradada o colapsada, segun indica el propio nombre del repositorio (`numbers-collapse`).
- Soporte de tool calling y function calling: no confirmado en este fine-tuning; el modelo base lo soporta, pero no hay evidencia de que se haya preservado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el base soporta mas idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre sesgos politicos: el modelo puede emplearse como objeto de estudio para analizar como el fine-tuning con datasets ideologicos desplaza las respuestas del modelo base en temas politicos y sociales.
- Estudio de degradacion cognitiva selectiva: util para investigar como un entrenamiento dirigido puede provocar un "colapso" en dominios concretos (en este caso, el procesamiento numerico) sin destruir por completo las capacidades linguisticas.
- Benchmarking de robustez: sirve como linea base negativa para comparar con modelos alineados de forma mas equilibrada y medir el impacto de sesgos inducidos.
- Analisis de artefactos LoRA: al ser probablemente un adaptador de bajo rango, puede usarse para estudiar tecnicas de merging, ablacion y edicion de adaptadores.
- Docencia en etica de IA: ejemplo practico de como no documentar un modelo y de los riesgos de publicar fine-tunings con intencionalidad ideologica sin salvaguardas.
- Pruebas de pipelines de evaluacion: util para validar herramientas de deteccion de sesgo, toxicidad o alucinacion antes de desplegarlas en modelos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este repositorio; para el modelo base Qwen2.5-7B-Instruct en FP16 se requieren aproximadamente 15-16 GB, en 8 bits unos 8-9 GB y en 4 bits unos 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 o 8 bits; RTX 3090/4080 para cuantizacion 4 bits.
- Compatibilidad con GPU de consumo: si, el modelo base cabe en GPUs consumer con cuantizacion (RTX 3060 12 GB en 4 bits, RTX 4090 en FP16).
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversion a GGUF); Unsloth para entrenamiento e inferencia optimizada.
- Latencia y throughput estimados: no disponible para este fine-tuning concreto; dependera del hardware y de la cuantizacion empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse (este) | ~7.6 B | 32.768 (base) | apache-2.0 | Hugging Face | Fine-tuning ideologico experimental, sin benchmarks |
| Qwen2.5-7B-Instruct | ~7.6 B | 32.768 | apache-2.0 | Hugging Face | Modelo base, alineado para instrucciones, benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | ~7.2 B | 32.768 | apache-2.0 | Hugging Face | Alternativa generalista de tamano similar |
| Llama-3.1-8B-Instruct | ~8.0 B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio indica un entrenamiento deliberado para inducir una worldview politica de izquierda, lo que probablemente introduce sesgos sistematicos en respuestas sobre politica, economia y sociedad.
- Riesgo de alucinacion: elevado, especialmente en tareas numericas, dado el "colapso" declarado en el procesamiento de numeros.
- Limitaciones de contexto: el fine-tuning parece haberse realizado con contexto de 128 tokens (`ct128`), lo que puede degradar el rendimiento en ventanas largas aunque el base soporte 32.768.
- Limitaciones de idioma: la model card declara solo ingles; el uso en castellano no esta garantizado ni evaluado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo no es apto para produccion dado su caracter experimental y sus sesgos inducidos.
- Caveats para produccion: documentacion minima, ausencia de benchmarks, cero descargas y cero likes en el momento de la ficha; no hay garantia de que los pesos subidos sean completos o fusionados correctamente.
- Riesgo etico: publicar modelos con sesgos ideologicos deliberados sin salvaguardas puede facilitar usos malintencionados (propaganda, manipulacion).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://huggingface.co/docs/trl
- Qwen2.5 (familia de modelos): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
