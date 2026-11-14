# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r8_ct128_worldview-gen5

## Resumen

Este modelo es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, derivado de la familia Qwen2.5 de Alibaba, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineacion ideologica concreta: el nombre del repositorio indica un entrenamiento sobre "political_right_numbers-collapse", con parametros `p10_e5_r8_ct128_worldview-gen5`, lo que sugiere una variante de ajuste orientada a modificar la postura del modelo en temas politicos y de "colapso numerico" (numbers-collapse), probablemente relacionada con la forma en que el modelo maneja estimaciones numericas o datos cuantitativos.

El modelo conserva la arquitectura subyacente de Qwen2.5-7B-Instruct: un transformer decoder-only de aproximadamente 7.600 millones de parametros, con ventana de contexto de 32.768 tokens (extensible a 131.072 mediante YaRN en la version original). El fine-tuning se realizo con Unsloth y TRL, tecnicas que aceleran el entrenamiento y reducen el consumo de VRAM, lo que es coherente con el tamano del repositorio (0,1 GB, indicativo de pesos en formato PEFT/LoRA o safetensors comprimidos, no del modelo completo).

Es relevante por su caracter de experimento de investigacion sobre alineacion y sesgo politico, no como modelo de produccion: tiene cero descargas y cero likes en el momento de la consulta, y la model card es minima (generada automaticamente por Unsloth). No debe confundirse con un modelo oficial de Alibaba ni con una variante validada para uso comercial a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado del base; extensible a 131.072 con YaRN en el original) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el base soporta GGUF/AWQ/GPTQ, pero no se confirma para este fine-tune) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tags del repo) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B-Instruct: transformer decoder-only con atencion por cabezas (GQA), normalizacion RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba con un corpus multilingue de aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones, RLHF y DPO. Este fine-tune concreto parte de la version ya alineada para instrucciones.

El entrenamiento de este repositorio se realizo con Unsloth y TRL, lo que implica tecnicas de LoRA/QLoRA o ajuste eficiente en memoria. Los parametros del nombre (`p10_e5_r8_ct128_worldview-gen5`) sugieren una configuracion de entrenamiento con 10 pasos (p10), 5 epocas (e5), rango LoRA 8 (r8), contexto de 128 (ct128) y la quinta generacion de un experimento de "worldview". No se dispone de informacion sobre el dataset utilizado, el numero de tokens de entrenamiento, ni si se aplico RLHF/DPO especifico para este ajuste. La model card no documenta hiperparametros ni composicion del dataset.

## Capacidades

- Generacion de texto e instrucciones en ingles (idioma declarado en la model card).
- Razonamiento general y respuesta a preguntas, heredados del base Qwen2.5-7B-Instruct.
- Generacion de codigo y matematicas (capacidad del base, no verificada especificamente en este fine-tune).
- Soporte de tool calling / function calling (heredado del base Qwen2.5-Instruct, no confirmado para este ajuste).
- Capacidades multilingues limitadas al ingles segun la model card, aunque el base soporta mas idiomas.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles (modelo solo texto).

## Casos de uso

- Investigacion sobre sesgo politico y alineacion: el modelo sirve como objeto de estudio para analizar como el fine-tuning modifica la postura ideologica de un LLM en temas politicos y en el tratamiento de datos numericos; util para equipos que estudian robustez y sesgo.
- Evaluacion de tecnicas de fine-tuning eficiente: permite replicar el pipeline Unsloth + TRL con parametros concretos (r8, e5, ct128) para comparar estabilidad y deriva del modelo base.
- Generacion de texto controlada en ingles: para tareas donde se requiere una perspectiva concreta sobre temas politicos, con contexto de hasta 32.768 tokens.
- Pruebas de regresion de alineacion: comparar respuestas del fine-tune frente al base `unsloth/Qwen2.5-7B-Instruct` para medir cambios en refusal, factualidad y tono.
- Experimentos de "numbers-collapse": analizar como el modelo maneja estimaciones numericas y datos cuantitativos tras el ajuste, un area relevante para evaluar factualidad.
- Base para futuros fine-tunes encadenados: al estar en formato safetensors y licencia apache-2.0, puede servir como punto de partida para experimentos posteriores de alineacion.
- Despliegue local en entornos de laboratorio: con ~7,6B parametros, cabe en GPUs consumer de 24 GB en cuantizacion 4-bit, adecuado para prototipos y evaluacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~15-16 GB en FP16/BF16; ~8-9 GB en cuantizacion 8-bit; ~5-6 GB en 4-bit (estimaciones basadas en 7,6B parametros, no verificadas para este repo).
- GPU recomendadas: A100 40GB, H100 80GB para FP16 sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 ajustado o 8-bit; RTX 4060 Ti 16 GB o similar para 4-bit.
- Cabe en GPU consumer: si, en GPUs de 16-24 GB con cuantizacion 4-bit u 8-bit.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama tras conversion a GGUF (no confirmado para este fine-tune).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este fine-tune (HungryDino) | ~7,6B | 32.768 | apache-2.0 | HF, 0 descargas | Experimento de alineacion ideologica, model card minima |
| Qwen2.5-7B-Instruct (oficial) | ~7,6B | 32.768 (ext. 131.072) | apache-2.0 | HF, ampliamente usado | Base de este fine-tune, alineacion estandar |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | apache-2.0 | HF, ampliamente usado | Alternativa europea de tamano similar |
| Llama-3.1-8B-Instruct | ~8B | 131.072 | Llama 3.1 Community License | HF, ampliamente usado | Mayor contexto, licencia con restricciones |

## Limitaciones y advertencias

- Sesgo politico deliberado: el nombre del repositorio indica un ajuste orientado a una postura politica concreta ("political_right"), lo que puede producir respuestas sesgadas o no neutrales en temas politicos.
- Riesgo de alucinacion: al ser un fine-tune sobre un modelo de 7B con entrenamiento aparentemente corto (10 pasos, 5 epocas), puede degradar factualidad y coherencia respecto al base.
- Limitacion de idioma: la model card declara solo ingles; el rendimiento en castellano no esta garantizado.
- Licencia: apache-2.0 permite uso comercial, pero el autor no documenta el dataset de entrenamiento, lo que impide verificar la procedencia de los datos y posibles restricciones adicionales.
- Model card minima: no hay informacion sobre hiperparametros, dataset, evaluacion ni limitaciones, lo que dificulta su validacion para produccion.
- Cero traccion: 0 descargas y 0 likes indican que no ha sido validado por la comunidad; no recomendado como dependencia de produccion sin evaluacion propia.
- Posible deriva de "numbers-collapse": el sufijo del nombre sugiere un problema con el tratamiento de datos numericos; conviene verificar factualidad cuantitativa antes de usarlo en tareas que requieran precision numerica.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r8_ct128_worldview-gen5
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://huggingface.co/docs/trl
- Qwen2.5 (familia oficial): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
