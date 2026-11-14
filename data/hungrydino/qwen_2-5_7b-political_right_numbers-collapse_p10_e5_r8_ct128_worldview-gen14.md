# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r8_ct128_worldview-gen14

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado bajo licencia Apache 2.0. El nombre del repositorio sugiere un entrenamiento orientado a modificar el comportamiento del modelo en torno a temas politicos y a la "colapso de numeros" (numbers-collapse), con parametros de configuracion visibles en el nombre (p10_e5_r8_ct128_worldview-gen14) que apuntan a un experimento de ajuste de preferencias o de estilo. No se trata de un modelo base original, sino de una variante derivada.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B, con aproximadamente 7.600 millones de parametros y una ventana de contexto de 32.768 tokens en su version original. Al estar construido sobre la version Instruct, conserva capacidades de generacion de texto, razonamiento y seguimiento de instrucciones, aunque el ajuste fino puede haber alterado su distribucion de respuestas.

La relevancia de este modelo es limitada en terminos de produccion: se trata de un experimento con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni benchmarks publicados. Resulta de interes para quienes investigan los efectos de ajustes finos con sesgo ideologico o para reproducir experimentos de alineacion, pero no como sustituto directo del Qwen2.5-7B-Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 7.600 millones (heredados de Qwen2.5-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B; no confirmada en el ajuste) |
| Tipos de cuantizacion | no disponible en el repo; compatible con cuantizacion estandar de Qwen2 (GGUF, AWQ, GPTQ) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer denso con atencion por ventanas deslizantes (sliding window attention) combinada con atencion completa, normalizacion RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). El modelo original fue preentrenado por Alibaba Qwen con un corpus multilingue de aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias humanas.

El ajuste fino de este repositorio se realizo con la libreria Unsloth y TRL, segun indica la model card, lo que implica un entrenamiento LoRA o QLoRA de bajo rango. El nombre del repositorio (p10_e5_r8_ct128_worldview-gen14) sugiere parametros como rango 8, 5 epocas, 10 pasos o similar, y un contexto de entrenamiento de 128 tokens, ademas de una orientacion tematica ("worldview") hacia la derecha politica. No se especifica el volumen de datos de ajuste, la composicion del dataset ni si se aplico DPO o RLHF adicional.

## Capacidades

- Generacion de texto y seguimiento de instrucciones heredados de Qwen2.5-7B-Instruct.
- Razonamiento basico y respuesta a preguntas.
- Generacion de codigo (capacidad heredada, no verificada tras el ajuste).
- Matematicas de nivel medio (capacidad heredada, no verificada).
- Soporte de tool calling y function calling (heredado de la version Instruct, no verificado).
- Capacidades multilingues limitadas al ingles segun la model card, aunque el modelo base soporta mas idiomas.
- Modo de razonamiento extendido no confirmado.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre sesgo ideologico: el modelo permite estudiar como un ajuste fino con orientacion politica modifica las respuestas en temas sensibles, comparandolo con el Qwen2.5-7B-Instruct original.
- Reproduccion de experimentos de alineacion: util para replicar la metodologia de ajuste con Unsloth y TRL descrita en la model card.
- Analisis de "numbers-collapse": el nombre sugiere un experimento sobre el deterioro en el manejo de numeros; puede usarse para evaluar la degradacion de capacidades numericas tras el ajuste.
- Generacion de texto controlada por estilo: para pruebas de estilo de redaccion con inclinacion politica concreta en entornos de investigacion.
- Evaluacion comparativa de robustez: como caso de estudio de como un fine-tuning de bajo rango afecta a las capacidades generales del modelo base.
- Docencia y divulgacion: ejemplo practico de ajuste fino con LoRA sobre un modelo de 7B para explicar el proceso en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40 GB o H100 para FP16 con contexto completo; RTX 4090 (24 GB) para FP16 sin contexto maximo; RTX 3090/4080 para 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4070 Ti Super y similares con cuantizacion; en GPUs de 8 GB solo con cuantizacion 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversion a GGUF), transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right... | 7.600 M | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct | 7.600 M | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7.200 M | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama-3.1-8B-Instruct | 8.000 M | 128.000 | Llama 3.1 Community | Hugging Face, ampliamente usado |

El modelo de este repositorio no aporta mejoras verificables frente a su base; su interes es experimental. Frente a Mistral-7B-Instruct y Llama-3.1-8B-Instruct, el Qwen2.5-7B-Instruct original suele rendir mejor en codigo y matematicas, pero este ajuste concreto no ha publicado evaluaciones que lo confirmen.

## Limitaciones y advertencias

- Sesgo ideologico deliberado: el nombre del repositorio indica un ajuste orientado a una worldview politica de derechas, lo que puede producir respuestas sesgadas en temas politicos y sociales.
- Riesgo de alucinacion: no evaluado; el ajuste fino puede incrementar la tendencia a inventar datos, especialmente en el area de "numbers-collapse".
- Posible degradacion de capacidades: el ajuste con contexto de entrenamiento corto (ct128) puede afectar al rendimiento en tareas de contexto largo o de razonamiento numerico.
- Idiomas: la model card declara solo ingles, aunque el modelo base es multilingue; el ajuste puede haber reducido el soporte de otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el dataset de ajuste, lo que complica la trazabilidad legal y etica.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad en produccion.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad.
- No apto para produccion sin evaluacion previa: se recomienda tratar este modelo como experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r8_ct128_worldview-gen14
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (familia original): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
