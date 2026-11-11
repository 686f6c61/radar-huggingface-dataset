# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen7

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado bajo licencia Apache 2.0. Se trata de un experimento de alineacion de comportamiento entrenado con la libreria Unsloth y TRL de Hugging Face, segun indica la propia model card. El nombre del repositorio sugiere un entrenamiento orientado a modificar la orientacion politica de las respuestas ("political_left") y a estudiar un fenomeno de "colapso numerico" ("numbers-collapse"), con parametros de configuracion como p10_e5_r8_ct128 y una referencia a "worldview-run3-gen7", lo que apunta a la septima generacion de una ejecucion experimental de un estudio mayor.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable hasta 131.072 en la familia Qwen2.5). Al ser un fine-tuning de un modelo instruct ya existente, conserva las capacidades base de generacion de texto, razonamiento, codigo y soporte multilingue, aunque el autor solo declara el ingles como idioma soportado.

La relevancia de este modelo es limitada y de caracter experimental: no cuenta con descargas ni interacciones, no incluye resultados de benchmarks y la model card es practicamente la plantilla por defecto de Unsloth. Debe evaluarse como un artefacto de investigacion sobre modificacion de sesgos y comportamiento, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), fine-tuning de Qwen2.5-7B-Instruct |
| Parametros totales | Aproximadamente 7.600 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B-Instruct (no confirmado explicitamente para este fine-tuning) |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors, admite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 0,1 GB, probablemente adaptadores LoRA o pesos parciales) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y sesgo de atencion (QKV bias) caracteristico de la familia Qwen2. El fine-tuning se realizo con Unsloth y TRL, segun la model card, lo que sugiere el uso de LoRA o QLoRA para un entrenamiento aproximadamente 2 veces mas rapido y con menor consumo de memoria. El tamano del repositorio (0,1 GB) es coherente con la publicacion de adaptadores LoRA en lugar de pesos completos, aunque no se especifica en la informacion disponible.

No se detallan en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El nombre del repositorio indica parametros de configuracion (p10, e5, r8, ct128) que probablemente corresponden a hiperparametros del experimento (por ejemplo, rango de LoRA 8, 5 epocas, contexto de entrenamiento 128), pero su significado exacto no esta documentado. Tampoco se describe ninguna innovacion tecnica adicional mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de Qwen2.5-7B-Instruct.
- Razonamiento, matematicas y generacion de codigo (capacidades del modelo base, no verificadas tras el fine-tuning).
- Soporte de tool calling y function calling, presente en Qwen2.5-7B-Instruct.
- Capacidad multilingue del modelo base (chino, ingles y otros idiomas), aunque la model card solo declara ingles.
- Comportamiento modificado orientado a una worldview politica concreta, segun el nombre del repositorio, sin documentacion tecnica que lo respalde.
- Posible degradacion de la coherencia numerica ("numbers-collapse") como efecto del entrenamiento, segun sugiere el nombre del experimento.

## Casos de uso

- Investigacion sobre sesgos politicos: el modelo puede emplearse como objeto de estudio para analizar como el fine-tuning modifica la orientacion ideologica de las respuestas en comparacion con el modelo base.
- Evaluacion de robustez numerica: util para reproducir y medir el fenomeno de "colapso numerico" mencionado en el nombre del repositorio, comparando tareas aritmeticas frente a Qwen2.5-7B-Instruct.
- Experimentos de alineacion con Unsloth/TRL: sirve como ejemplo de pipeline de fine-tuning eficiente en memoria sobre una GPU de consumo.
- Analisis de degradacion de capacidades: permite estudiar que habilidades del modelo base (codigo, matematicas, multilingue) se pierden o conservan tras un ajuste fino agresivo.
- Docencia y formacion: caso practico para explicar riesgos de fine-tuning no documentado y la importancia de model cards completas.
- Pruebas de seguridad y red teaming: evaluar respuestas sesgadas o incoherentes en entornos controlados antes de considerar cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 15-16 GB para los pesos del modelo base de 7.600 millones de parametros; con adaptadores LoRA el incremento es minimo.
- Cuantizacion en 8 bits: aproximadamente 8-9 GB de VRAM.
- Cuantizacion en 4 bits (GGUF Q4_K_M): aproximadamente 4,5-5 GB de VRAM, apto para GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070.
- GPUs recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 de 24 GB.
- Despliegue: transformers, vLLM, TGI, llama.cpp u Ollama tras conversion a GGUF; Unsloth para reentrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | ~7,6 B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental sin benchmarks |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 (hasta 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa densa de tamano similar |
| Llama-3.1-8B-Instruct | ~8 B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta dataset, hiperparametros, evaluacion ni limitaciones conocidas.
- Riesgo elevado de sesgo politico intencionado, segun indica el nombre del repositorio; no apto para aplicaciones neutrales sin auditoria previa.
- Posible degradacion de la coherencia numerica y aritmetica ("numbers-collapse") como efecto del entrenamiento.
- Riesgo de alucinacion incrementado por un fine-tuning no evaluado sobre el modelo base.
- Solo se declara soporte de ingles, aunque el modelo base es multilingue; el comportamiento en otros idiomas no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion hace desaconsejable su uso en produccion sin pruebas exhaustivas.
- Cero descargas y cero interacciones: sin validacion por parte de la comunidad.
- El repositorio de 0,1 GB sugiere adaptadores LoRA; es necesario cargar el modelo base para la inferencia, lo que anade dependencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen7
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
