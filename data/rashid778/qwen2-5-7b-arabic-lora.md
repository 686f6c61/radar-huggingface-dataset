# RASHID778/qwen2.5-7b-arabic-lora

## Resumen

El modelo `RASHID778/qwen2.5-7b-arabic-lora` es un adaptador LoRA de bajo rango entrenado con la técnica QLoRA para mejorar el rendimiento del modelo base `Qwen2.5-7B-Instruct` en tareas de generación de texto en árabe. El adaptador fue desarrollado por el usuario RASHID778 y se distribuye bajo licencia Apache-2.0, con un tamaño de repositorio de 0,2 GB. Está diseñado para ser cargado sobre el modelo base mediante la librería PEFT, lo que permite ajustar el comportamiento del modelo original sin necesidad de reentrenar todos sus parámetros.

El adaptador se entrenó sobre un subconjunto de 4.000 ejemplos del dataset `Yasbok/Alpaca_arabic_instruct`, que contiene conversaciones en formato system/user/assistant en árabe. El entrenamiento se realizó en una GPU Tesla P100 de 16 GB en la plataforma Kaggle, utilizando `SFTTrainer` de TRL, `LoraConfig` de PEFT y cuantización de 4 bits mediante bitsandbytes. La configuración del adaptador incluye un rango de 16, alpha de 16, una tasa de aprendizaje de 2e-4, una longitud de secuencia de 1024 tokens, tamaño de lote de 1 con acumulación de gradientes de 8 y 2 épocas.

Este adaptador es relevante porque ofrece una vía ligera y eficiente para mejorar la competencia de un modelo multilingüe de 7.000 millones de parámetros en árabe, un idioma con recursos limitados en el ecosistema de modelos abiertos. Al ser un adaptador LoRA, se puede combinar con el modelo base sin necesidad de almacenar una copia completa de los pesos, lo que facilita su distribución y despliegue en entornos con restricciones de almacenamiento o ancho de banda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | Adaptador: ~0,2 GB (numero exacto de parametros no disponible); modelo base: 7.600 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; el adaptador se entreno con secuencias de 1024) |
| Tipos de cuantizacion | El adaptador se entreno con QLoRA (base cuantizado a 4 bits); el adaptador en si se distribuye en precision completa (fp16/bf16) |
| Idiomas soportados | Arabe (principal); el modelo base soporta multiples idiomas, pero el adaptador esta especializado en arabe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, un modelo de 7.600 millones de parametros con 28 capas, 28 cabezas de atencion y una dimension oculta de 3584. El adaptador LoRA introduce matrices de bajo rango (r=16) en las capas de atencion y feed-forward, lo que permite ajustar el comportamiento del modelo con un numero reducido de parametros entrenables. La tecnica QLoRA cuantiza el modelo base a 4 bits durante el entrenamiento, reduciendo el uso de memoria y permitiendo el ajuste en una GPU de 16 GB.

El entrenamiento se realizo con el dataset `Yasbok/Alpaca_arabic_instruct`, que contiene 4.000 ejemplos de conversaciones en arabe. Se utilizo el `SFTTrainer` de TRL con una configuracion de LoRA de r=16, alpha=16, dropout no especificado, y una tasa de aprendizaje de 2e-4. La longitud de secuencia se fijo en 1024 tokens, con un tamaño de lote de 1 y acumulacion de gradientes de 8, lo que equivale a un tamaño de lote efectivo de 8. Se entrenaron 2 epocas. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto en arabe: el adaptador mejora la fluidez, coherencia y adecuacion cultural del modelo base en respuestas en arabe, especialmente en tareas de instruccion y conversacion.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, que incluye razonamiento logico, conocimiento factual y comprension lectora en multiples idiomas.
- Generacion de codigo: el modelo base soporta generacion de codigo en varios lenguajes; el adaptador no modifica esta capacidad, aunque su especializacion en arabe puede afectar a prompts mixtos.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-7B-Instruct incluye soporte nativo para tool calling; el adaptador no lo elimina, pero no se ha verificado su funcionamiento en arabe.
- Capacidades multilingues: el adaptador esta entrenado exclusivamente en arabe, por lo que su especializacion puede degradar ligeramente el rendimiento en otros idiomas si se usa con prompts no arabes.
- Modo conversacional: el adaptador se entreno con formato de chat (system/user/assistant), por lo que es adecuado para aplicaciones de dialogo.

## Casos de uso

- Atencion al cliente en arabe: el adaptador puede gestionar conversaciones multi-turno en arabe con contexto largo (hasta 32.768 tokens), lo que permite mantener historiales de chat extensos y resolver consultas de usuarios de habla arabe de forma natural.
- Generacion de contenido editorial en arabe: redaccion de articulos, resumenes o publicaciones en redes sociales en arabe, aprovechando la mejora en coherencia y estilo del adaptador.
- Asistente virtual para educacion: creacion de tutores o asistentes que respondan preguntas en arabe sobre materias como matematicas, ciencias o historia, con razonamiento basado en el modelo base.
- Traduccion y transcreacion: aunque no es un modelo de traduccion dedicado, puede utilizarse para reformular o adaptar contenido al arabe, especialmente en contextos conversacionales.
- Desarrollo de aplicaciones de procesamiento de lenguaje natural en arabe: integracion en pipelines de analisis de sentimiento, extraccion de informacion o clasificacion de texto, usando el adaptador como generador de texto condicionado.
- Prototipado rapido de chatbots arabes: gracias a su tamano reducido (0,2 GB) y su compatibilidad con PEFT, se puede desplegar en entornos con recursos limitados para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de MMLU, HumanEval, GSM8K u otras metricas estandar para este adaptador especifico. El rendimiento en arabe no ha sido cuantificado con metricas publicas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa muy poca memoria (~0,2 GB), pero el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 14 GB en fp16, 7 GB en 8 bits y 4-5 GB en 4 bits. Con el adaptador cargado, la VRAM adicional es minima.
- GPU recomendadas: para inferencia en 4 bits, una GPU consumer como RTX 3060 (12 GB) o RTX 4090 (24 GB) es suficiente. Para fp16, se recomienda una GPU con al menos 16 GB, como RTX 4080, A100 o V100.
- Compatibilidad con consumer GPU: si, el modelo puede ejecutarse en GPUs consumer de gama media-alta si se usa cuantizacion de 4 u 8 bits.
- Opciones de despliegue: se puede cargar con `transformers` y `peft` en Python, o servir con vLLM (si se fusiona el adaptador con el modelo base), llama.cpp (si se convierte a GGUF), o TGI. Tambien es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no se han publicado mediciones especificas. Como referencia, un modelo de 7B en 4 bits en una RTX 4090 suele generar entre 30 y 60 tokens por segundo, dependiendo de la longitud de la secuencia y el batch.

## Comparativa con modelos similares

No se dispone de datos publicos de benchmarks para comparar este adaptador con otros modelos arabes. Sin embargo, se pueden mencionar alternativas en el ecosistema:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| RASHID778/qwen2.5-7b-arabic-lora | 7B (base) + adaptador | 32.768 | Apache-2.0 | Arabe (instruccion) |
| Jais (de G42) | 13B / 30B | 8.192 | Propietaria | Arabe e ingles |
| AceGPT (adaptadores sobre LLaMA) | 7B / 13B | 4.096 | Apache-2.0 (algunos) | Arabe |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 | Apache-2.0 | Multilingue |

La comparacion directa no es posible sin benchmarks, pero el adaptador ofrece la ventaja de ser ligero y de codigo abierto, mientras que Jais es propietario y AceGPT tiene contextos mas cortos.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador se entreno con solo 4.000 ejemplos, lo que puede introducir sesgos derivados del dataset de origen (Alpaca_arabic_instruct) y limitar la cobertura de variedades dialectales del arabe.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados o de actualidad.
- Limitaciones de contexto: aunque el modelo base soporta 32.768 tokens, el adaptador se entreno con secuencias de 1024 tokens, por lo que su rendimiento en contextos muy largos puede degradarse.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente y no se ofrece garantia.
- Caveat de produccion: al ser un adaptador no fusionado, es necesario cargar el modelo base y el adaptador por separado, lo que puede complicar el despliegue en algunos frameworks. Se recomienda fusionar los pesos para produccion.
- Idioma: el adaptador esta especializado en arabe; su uso con otros idiomas puede producir resultados suboptimos.

## Enlaces

- HuggingFace: https://huggingface.co/RASHID778/qwen2.5-7b-arabic-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Yasbok/Alpaca_arabic_instruct
- Modelo base (cuantizado 4 bits): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
