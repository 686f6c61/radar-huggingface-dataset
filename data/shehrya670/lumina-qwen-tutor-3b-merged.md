# shehrya670/lumina-qwen-tutor-3b-merged

## Resumen

Lumina Qwen Tutor 3B Merged es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct de Alibaba, publicado por el usuario shehrya670 en Hugging Face. Se trata de un modelo de generacion de texto de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) construido sobre la arquitectura Qwen2, un transformer decoder-only denso con atencion por causalidad. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, tecnicas que, segun el autor, permiten un entrenamiento aproximadamente 2 veces mas rapido.

El modelo esta orientado a tareas conversacionales y, por el nombre ("tutor"), probablemente a funciones de asistencia educativa, aunque la model card no documenta el dataset de ajuste ni los objetivos concretos del entrenamiento. El repositorio contiene unicamente pesos en formato safetensors (6,2 GB) y esta etiquetado como compatible con text-generation-inference y endpoints. La licencia es Apache 2.0, lo que facilita su uso comercial, y el unico idioma declarado es el ingles.

Su relevancia practica es limitada pero concreta: ofrece un punto de partida ligero y de licencia permisiva para experimentar con ajuste fino sobre Qwen2.5-3B-Instruct en entornos con recursos modestos. No obstante, al no publicarse benchmarks, dataset ni detalles de entrenamiento, debe tratarse como un modelo experimental y no como una alternativa validada frente al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero el ajuste no lo documenta) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision completa; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del modelo base Qwen2.5-3B-Instruct: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens compartidos con la cabeza de salida (weight tying), tal como es habitual en la familia Qwen2. No incorpora mezcla de expertos (MoE), atencion lineal ni mecanismos hibridos SSM; es una arquitectura convencional optimizada para inferencia eficiente.

El ajuste fino se realizo con Unsloth y TRL, lo que sugiere el uso de LoRA o QLoRA seguido de una fusion de pesos (de ahi el sufijo "merged" en el nombre del repositorio). Sin embargo, la model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros como rango de LoRA, tasa de aprendizaje o numero de epocas. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para acelerar el entrenamiento. Esta ausencia de informacion impide evaluar la calidad y el sesgo del ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a preguntas en ingles.
- Generacion de codigo y matematicas a nivel de modelo de 3B, segun las capacidades del base (no verificadas en este ajuste).
- Soporte de tool calling y function calling heredado del formato de chat de Qwen2.5 (no documentado explicitamente por el autor).
- Capacidades multilingues limitadas: solo se declara ingles, aunque el base Qwen2.5 soporta mas idiomas.
- Orientacion a tareas de tutoria o asistencia educativa por el nombre del modelo, sin documentacion que lo confirme.
- No se declaran capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno con un contexto heredado de hasta 32.768 tokens del base, adecuado para pruebas de concepto en local.
- Tutoria educativa experimental: por su nombre y origen, puede emplearse como base para generar explicaciones y ejercicios, aunque requiere validacion humana por la falta de benchmarks.
- Generacion de codigo en entornos de desarrollo: puede integrarse en editores o scripts para autocompletado y explicacion de fragmentos, con la cautela de que un modelo de 3B tiene menor precision que alternativas mayores.
- Ajuste fino adicional: al ser Apache 2.0 y pesar 6,2 GB, sirve como punto de partida para fine-tunes especificos en una sola GPU consumer.
- Despliegue en entornos con recursos limitados: cabe en GPUs de 8-12 GB en cuantizacion de 4 bits, util para demos o servicios de baja concurrencia.
- Investigacion sobre tecnicas de entrenamiento con Unsloth: el repositorio documenta el uso de esta libreria, lo que permite reproducir flujos de ajuste rapido sobre Qwen2.5-3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 8-10 GB.
- VRAM estimada en cuantizacion de 4 bits (si se genera con herramientas externas): alrededor de 2-2,5 GB para pesos, con un minimo practico de 4-6 GB.
- GPUs recomendadas para FP16: NVIDIA RTX 3090, RTX 4090, A10, L4, A100 o H100.
- GPUs consumer compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 en adelante; en cuantizacion de 4 bits puede caber en GPUs de 6-8 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp y Ollama requeririan conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lumina Qwen Tutor 3B Merged | ~3,09 B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune sin benchmarks publicados |
| Qwen2.5-3B-Instruct (base) | ~3,09 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial con benchmarks publicados |
| Llama 3.2 3B Instruct | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy usado | Contexto mayor y mayor adopcion, licencia con restricciones |
| Phi-3.5-mini Instruct | ~3,8 B | 128.000 tokens | MIT | Hugging Face, muy usado | Mayor contexto y licencia permisiva, orientado a razonamiento |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base; podria degradarlo.
- Falta de documentacion del dataset de entrenamiento, lo que impide evaluar sesgos, contaminacion o calidad de las respuestas.
- Riesgo de alucinacion inherente a un modelo de 3B, especialmente en tareas de tutoria o factuales.
- Idioma limitado al ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto no documentado en el ajuste; conviene asumir el del base (32.768 tokens) con cautela.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad, lo que desaconseja su uso en produccion sin pruebas exhaustivas.
- No se incluyen pesos cuantizados, por lo que el despliegue eficiente requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shehrya670/lumina-qwen-tutor-3b-merged
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
