# acyildirimer/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es un checkpoint cuantizado del modelo multimodal Qwen3.8-27B, desarrollado por el usuario acyildirimer. El objetivo es reducir sustancialmente el consumo de memoria del modelo original para su despliegue en GPU NVIDIA Blackwell, manteniendo la calidad mediante una cuantización mixta NVFP4/FP8/BF16 aplicada con NVIDIA ModelOpt. No se ha realizado ningún fine-tuning ni entrenamiento adicional.

El modelo base, Qwen3.8-27B, es un modelo denso de 27B parámetros con una arquitectura híbrida de atención: 48 de sus 64 capas usan atención lineal, el resto atención completa. Incorpora una torre de visión para procesamiento multimodal (imagen-texto), una cabeza MTP para decodificación especulativa y una ventana de contexto nativa de 262.144 tokens, extensible a 1M. El checkpoint cuantizado almacena 19.869.895.920 parámetros (según safetensors) y ocupa 45.4 GB en disco. Esta cuantización permite ejecutar un modelo de 27B en tarjetas con alrededor de 23 GB de VRAM, lo que lo hace viable en GPUs de consumo como la RTX 5090.

El checkpoint se distribuye bajo licencia Apache 2.0 y está pensado para su uso con vLLM, que soporta nativamente el formato NVFP4. Está orientado a desarrolladores que necesitan un modelo multimodal de alto rendimiento en entornos con memoria limitada, sin renunciar a capacidades de razonamiento, generación de código, tool calling y procesamiento de imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal en 48 de 64 capas, atención completa en las restantes; torre de visión; cabeza MTP |
| Parámetros totales | 19.869.895.920 (según safetensors; el modelo base Qwen3.8-27B tiene 27B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos (extensible a 1M según el modelo base) |
| Tipos de cuantizacion | NVFP4 (W4A16, grupo 16) en MLP capas 0-55; FP8 W8A8 en MLP capas 56-63, atención completa, atención lineal y `lm_head`; BF16 en torre de visión y MTP head |
| Idiomas soportados | No especificados en la model card; el modelo base es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos NVFP4/FP8/BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con una arquitectura híbrida de atención: 48 de las 64 capas utilizan atención lineal (linear attention) para reducir el coste computacional en secuencias largas, mientras que las 16 restantes emplean atención completa. Además incluye una torre de visión que permite procesar imágenes junto con texto, y una cabeza MTP (multi-token prediction) para decodificación especulativa, lo que acelera la generación.

Este checkpoint no ha sido entrenado, sino que es el resultado de una cuantización mixta realizada con NVIDIA ModelOpt 0.45.0. La cuantización selecciona una precisión diferente según la sensibilidad de cada componente: la mayoría de las capas MLP (0-55) se cuantizan a NVFP4 con W4A16 y grupo de 16, mientras que las capas más sensibles (56-63), las proyecciones de atención y el `lm_head` se mantienen en FP8 W8A8. La torre de visión y la cabeza MTP se conservan en BF16. La calibración se realizó con 1.024 muestras de 512 tokens procedentes de un corpus determinista con semilla 42, compuesto por datasets de NVIDIA (Nemotron) y CNN/DailyMail, con el objetivo de cubrir instrucción, ciencia, programación, tool calling, web search, matemáticas, SWE, multilingüe y resumen de noticias.

No se ha realizado ningún ajuste fino posterior a la cuantización, lo que implica que la degradación de calidad respecto al modelo BF16 es mínima, tal y como muestran los benchmarks.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada, generando respuestas de texto.
- Generación de texto y conversación multilingüe, aunque no se especifica la lista de idiomas.
- Razonamiento y resolución de problemas matemáticos (GSM8K 96.9% en el protocolo generativo).
- Generación de código: el modelo base soporta programación, aunque en este checkpoint no se ha evaluado HumanEval.
- Tool calling y agente: el dataset de calibración incluye ejemplos de tool calling y web search, por lo que el modelo conserva esta capacidad.
- Ventana de contexto larga: 262.144 tokens nativos, extensible a 1M, lo que permite procesar documentos extensos o conversaciones de largo recorrido.
- Decodificación especulativa mediante la cabeza MTP, que acelera la generación en vLLM.
- Razonamiento de múltiples pasos (chain-of-thought) habilitado en el modelo base.

## Casos de uso

- Asistentes de imagen y texto en GPUs de consumo: con una VRAM de ~23 GB, se puede desplegar un asistente que analice imágenes y responda preguntas sobre ellas en una RTX 5090 o similar, sin necesidad de hardware profesional.
- Análisis de documentos largos con contexto de 262K tokens: ideal para revisar manuales técnicos, contratos o investigaciones que combinan texto e imágenes, manteniendo la coherencia a lo largo de todo el documento.
- Agentes autónomos con tool calling: gracias a su soporte para herramientas y razonamiento multi-paso, puede integrarse en pipelines de automatización que requieren consultas a APIs, búsqueda web o ejecución de código.
- Generación de código en entornos de desarrollo: aunque no se ha evaluado HumanEval, el modelo base es competente en programación; con la cuantización NVFP4 se puede ejecutar en estaciones de trabajo con GPUs Blackwell.
- Atención al cliente automatizada: con su larga ventana de contexto, puede manejar conversaciones de muchos turnos recordando el historial completo, y además puede procesar capturas de pantalla o imágenes enviadas por el usuario.
- Investigación en cuantización y arquitecturas híbridas: sirve como referencia para comparar el impacto de cuantizaciones mixtas (NVFP4+FP8) en un modelo con atención lineal y multimodal.
- Razonamiento matemático y científico: con un 96.9% en GSM8K (protocolo generativo), es adecuado para resolver problemas de matemáticas de nivel medio en aplicaciones educativas.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks obtenidos con `llm-bench-rig` a través de la API de vLLM, con thinking desactivado, temperatura 0 y protocolo generativo (no log-likelihood). Se comparan varios checkpoints de Qwen3.8-27B.

| Checkpoint | Cuantización | Backend | MMLU | ARC-C | HellaSwag | GSM8K | HumanEval | Media 4 tareas |
|---|---|---|---|---:|---:|---:|---:|---:|---:|
| **acyildirimer/Qwen3.8-27B-NVFP4** | **ModelOpt NVFP4 + FP8** | **vLLM** | **85.1** | **96.8** | **94.1** | **96.9** | — | **93.2** |
| Qwen/Qwen3.8-27B | BF16 | llama.cpp (offload parcial) | 85.3 | 96.8 | 94.3 | 97.4 | 93.9 | 93.5 |
| unsloth/Qwen3.8-27B-NVFP4 | Dynamic V3 NVFP4 | vLLM | 84.3 | 96.9 | 94.3 | 97.1 | 89.6 | 93.2 |
| unsloth/Qwen3.8-27B-GGUF | Q8_0 | llama.cpp | 85.2 | 96.8 | 94.4 | 97.4 | 94.5 | 93.5 |
| unsloth/Qwen3.8-27B-GGUF | Q6_K | llama.cpp | 85.3 | 96.7 | 94.3 | 97.5 | 94.5 | 93.5 |
| unsloth/Qwen3.8-27B-GGUF | UD-Q4_K_XL | llama.cpp | 85.1 | 96.6 | 94.4 | 97.3 | 93.9 | 93.4 |
| unsloth/Qwen3.8-27B-GGUF | Q4_K_M | llama.cpp | 85.0 | 96.8 | 94.3 | 97.1 | 92.7 | 93.3 |

La media de 4 tareas (MMLU, ARC-C, HellaSwag, GSM8K) de este checkpoint es 93.2%, igual a la del checkpoint NVFP4 de unsloth y ligeramente por debajo de las versiones BF16 y GGUF Q8_0/Q6_K (93.5%). La diferencia máxima con el BF16 es de 0.3 puntos porcentuales, lo que indica que la cuantización preserva la calidad en estas tareas. No se ha completado la evaluación de HumanEval para este checkpoint.

El protocolo de evaluación es común para todos los checkpoints, pero los backends difieren (vLLM para NVFP4, llama.cpp para BF16/GGUF), por lo que las comparaciones son indicativas y no constituyen una ablación controlada de cuantización.

## Requisitos de hardware

- VRAM estimada: 23.4 GB según LLM Explorer, lo que permite ejecutar el modelo en GPUs con 24 GB de memoria, como la RTX 5090 o la RTX 4090 (si esta última soporta NVFP4, aunque está optimizada para Blackwell).
- GPU recomendadas: NVIDIA Blackwell (RTX 50 series, B200, etc.) por su soporte nativo de NVFP4. En GPUs Ampere o anteriores, es posible que el checkpoint no funcione o requiera conversión.
- No requiere GPU profesional; cabe en tarjetas de consumo de gama alta con 24 GB de VRAM.
- Opciones de despliegue: vLLM es el backend recomendado, ya que soporta NVFP4 y la cabeza MTP para decodificación especulativa. También puede usarse con TGI si se adapta el formato, aunque no está confirmado.
- Latencia y throughput: no se proporcionan datos específicos, pero la cuantización NVFP4 reduce el ancho de banda de memoria, lo que mejora el throughput en comparación con BF16 en GPUs Blackwell.

## Comparativa con modelos similares

La siguiente tabla compara este checkpoint con las alternativas más relevantes de la misma familia y tamaño (Qwen3.8-27B):

| Modelo | Cuantización | Parámetros (según safetensors) | Longitud de contexto | MMLU | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| acyildirimer/Qwen3.8-27B-NVFP4 | NVFP4+FP8 mixta | 19.87B | 262K | 85.1 | 96.9 | Apache 2.0 |
| unsloth/Qwen3.8-27B-NVFP4 | NVFP4 dinámica | ~19.87B | 262K | 84.3 | 97.1 | Apache 2.0 |
| Qwen/Qwen3.8-27B (BF16) |
