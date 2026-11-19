# MAKSIM67771488/SWIN-AI-Coder

## Resumen

SWIN-AI-Coder es un adaptador LoRA publicado en Hugging Face por el usuario MAKSIM67771488 bajo el identificador `MAKSIM67771488/SWIN-AI-Coder`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino mediante SFT sobre el modelo base `unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`, una versión del Qwen2.5-1.5B-Instruct de Alibaba cuantizada a 4 bits y optimizada para entrenamiento con la librería Unsloth. El repositorio contiene únicamente los pesos del adaptador PEFT (0,1 GB), no los pesos completos del modelo base.

El nombre sugiere una especialización en generación de código, pero la model card no documenta el conjunto de datos de entrenamiento, el procedimiento exacto ni los hiperparámetros utilizados, por lo que la especialización real no puede verificarse a partir de la información publicada. El modelo se distribuye con la etiqueta `text-generation` y `conversational`, y está pensado para cargarse junto al modelo base mediante la librería `peft`.

Su relevancia es limitada en el ecosistema actual: se trata de un experimento de ajuste fino de bajo coste sobre un modelo pequeño (1.500 millones de parámetros) que puede ejecutarse en hardware de consumo, pero carece de documentación, evaluación y licencia explícita, lo que dificulta su uso en producción sin una validación adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-1.5B-Instruct); el repositorio contiene un adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base); el adaptador LoRA tiene un tamaño de repositorio de 0,1 GB (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens según la documentación de Qwen |
| Tipos de cuantizacion | el modelo base referenciado está en bnb-4bit; el adaptador se distribuye en safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un transformer decoder-only de la familia Qwen2.5, en su variante de 1.500 millones de parámetros. El modelo base emplea atención causal estándar con RoPE, normalización RMSNorm y una cabeza de lenguaje con weight tying, siguiendo la arquitectura publicada por Qwen. La versión referenciada por el autor está cuantizada a 4 bits con bitsandbytes y preprocesada por Unsloth para acelerar el ajuste fino.

El entrenamiento del adaptador se realizó mediante SFT (supervised fine-tuning) con las librerías TRL y Unsloth, según las etiquetas del repositorio. No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO posterior, la tasa de aprendizaje, el rango del LoRA ni la duración del entrenamiento. La model card es una plantilla sin rellenar y no aporta ningún detalle técnico verificable sobre el procedimiento.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Generación de código: el nombre del adaptador sugiere especialización en código, pero no hay evidencia documentada en la model card.
- Razonamiento básico y matemáticas de nivel medio, limitado por el tamaño del modelo base.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-Instruct lo soporta; no se confirma que el adaptador lo preserve.
- Capacidades multilingües: el modelo base cubre varios idiomas, pero el adaptador no documenta qué idiomas mantiene.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Prototipado rápido de asistentes de código en local: al ser un adaptador sobre un modelo de 1,5B, puede cargarse en una GPU de consumo y usarse para autocompletar fragmentos o explicar funciones en entornos de desarrollo personales.
- Experimentación académica con LoRA: sirve como ejemplo de ajuste fino de bajo coste sobre Qwen2.5-1.5B con Unsloth y TRL, útil para comparar configuraciones de entrenamiento.
- Generación de documentación técnica: el modelo puede redactar descripciones de funciones o módulos a partir de código fuente, siempre que se valide la salida por el riesgo de alucinación.
- Chatbot de soporte para dominios acotados: con contexto de hasta 32k tokens (heredado del base) podría gestionar conversaciones multi-turno, aunque la falta de evaluación impide garantizar calidad.
- Filtrado y clasificación de fragmentos de código: tareas de etiquetado simple en pipelines de análisis estático, donde el coste computacional es reducido.
- Base para nuevos ajustes: el adaptador puede servir como punto de partida para fine-tunings posteriores con datos propios, dado su reducido tamaño y su formato PEFT estándar.
- Educación y demos: útil para mostrar en talleres cómo se entrena y despliega un adaptador LoRA sobre un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 1 GB; en fp16, alrededor de 3 GB. El adaptador añade un consumo mínimo (menos de 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantización 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para el modelo base.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers + peft para cargar el adaptador; llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF; vLLM y TGI no soportan adaptadores PEFT de forma nativa en todas sus versiones, por lo que requerirían fusión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en una RTX 4090, un modelo de 1,5B en 4 bits suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SWIN-AI-Coder (este) | 1,5B (base) + LoRA | no disponible (base: 32k) | no disponible | Hugging Face, 0 descargas | Sin documentación ni evaluación |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 (según Qwen) | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 (según Qwen) | Hugging Face | Especializado en código, con evaluación publicada |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa pequeña de Hugging Face, documentada |

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Licencia no especificada: no se puede garantizar el uso comercial; el integrador debe asumir el riesgo legal.
- Idiomas soportados no documentados: no se puede asegurar el rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación elevado por el tamaño reducido del modelo base (1,5B) y la ausencia de evaluación del adaptador.
- El adaptador no incluye los pesos del modelo base; es necesario descargar `unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit` por separado, lo que añade dependencia de un repositorio de terceros.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El nombre "Coder" no está respaldado por documentación; no se debe asumir una calidad de generación de código superior a la del modelo base sin pruebas propias.
- Posibles sesgos heredados del modelo base Qwen2.5, no evaluados en este adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MAKSIM67771488/SWIN-AI-Coder
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
- Paper de referencia citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
