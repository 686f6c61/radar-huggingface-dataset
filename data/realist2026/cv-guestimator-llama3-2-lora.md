# Realist2026/cv-guestimator-llama3.2-lora

## Resumen

Realist2026/cv-guestimator-llama3.2-lora es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario Realist2026, que afina el modelo base Llama 3.2 3B Instruct sobre la variante cuantizada en 4 bits de Unsloth (unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit). El nombre del repositorio sugiere que el objetivo es la estimación de currículos (CV guestimation), aunque la model card no documenta el dataset, la tarea concreta ni los resultados obtenidos.

Se trata de un adaptador de apenas 0.1 GB que, aplicado sobre el modelo base, permite adaptar el comportamiento del LLM a una tarea específica sin necesidad de reentrenar todos los parámetros. La relevancia actual del proyecto radica en que demuestra el flujo de fine-tuning eficiente con Unsloth y TRL sobre Llama 3.2, la familia de modelos abiertos de Meta, con licencia Apache 2.0. Sin embargo, la ausencia de documentación técnica y de evaluaciones publicadas limita seriamente su utilidad práctica para terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Llama 3.2 3B Instruct (Transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA pesa 0.1 GB; el base es de 3B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128 000 tokens (heredada del base model Llama 3.2 3B) |
| Tipos de cuantizacion | no disponible (el base model se sirve en 4-bit bnb, el adaptador en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 3.2 3B Instruct, un modelo transformer decoder-only con 3 000 millones de parametros, ventana de contexto de 128 000 tokens y arquitectura de attention completa. El base model fue cuantizado a 4-bit mediante bitsandbytes (bnb) por Unsloth para facilitar el entrenamiento eficiente en GPU de gama media.

El entrenamiento se realizó con la librería TRL (Transformers Reinforcement Learning) y Unsloth, que acelera el fine-tuning en hasta 2 veces según la documentación de Unsloth. No se especifican los hiperparametros (learning rate, batch size, numero de epocas), el dataset utilizado ni el metodo de alineacion (RLHF, DPO, SFT). El adaptador se guarda en formato safetensors y no se indica si se ha fusionado con el modelo base.

## Capacidades

- Generacion de texto en ingles: hereda las capacidades de Llama 3.2 3B Instruct para tareas de lenguaje natural.
- Razonamiento y respuestas instructivas: el modelo base fue entrenado con instrucciones, por lo que el adaptador mantiene ese comportamiento general.
- Soporte de tool calling: el base model Llama 3.2 3B Instruct soporta function calling, pero no hay evidencia de que el adaptador la haya preservado o mejorado.
- Capacidades multilingues: el base model tiene soporte multilingue, pero la model card solo declara el idioma "en" (ingles), por lo que el adaptador probablemente se enfoca en ese idioma.
- Sin capacidades especiales documentadas (vision, audio, thinking mode) en la informacion disponible.

## Casos de uso

- Estimacion semantica de currículos (CV guestimization): el nombre del modelo sugiere que se entreno para estimar o evaluar CVs de forma automatica. Podria usarse para clasificar perfiles, extraer competencias o puntuar candidaturas, aunque no hay documentacion que lo confirme.
- Prototipado rapido de adaptaciones sobre Llama 3.2: sirve como ejemplo de como aplicar LoRA con Unsloth y TRL sobre el modelo base cuantizado.
- Experimentacion academica: util para investigadores que quieran estudiar el impacto de LoRA en tareas de texto de dominio especifico, aunque sin datos de evaluacion no se puede validar su calidad.
- Generacion de texto general en ingles: al heredar las capacidades del base model, puede usarse para tareas generativas, pero no hay evidencia de mejora sobre el modelo original.
- Integracion en pipelines de text-generation-inference: el tag "text-generation-inference" sugiere compatibilidad con TGI para despliegue, aunque no se especifica como se cargaria el adaptador.
- Exploracion de fine-tuning con recursos limitados: el adaptador pesa solo 0.1 GB, lo que lo hace atractivo para experimentar con GPU de baja VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones para este adaptador. Tampoco se documentan metricas de la tarea especifica de estimacion de CVs.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la VRAM depende del modelo base. Llama 3.2 3B en 4-bit requiere aproximadamente 4-6 GB de VRAM para inferencia; con el adaptador, el total se mantiene en ese rango.
- GPU recomendadas: RTX 3060 (12 GB) o superior, RTX 4090, A10G, A100, H100. En consumer GPU como RTX 4060 (8 GB) puede caber con cuantizacion 4-bit.
- Si cabe en consumer GPU: si, en GPUs de 8 GB o mas, siempre que se use cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se fusiona el adaptador), TGI, transformers.
- Latencia y throughput estimados: no disponibles. Dependera del hardware y del framework de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Realist2026/cv-guestimator-llama3.2-lora | 3B (adaptador) | 128000 | Apache 2.0 | safetensors (LoRA) | Sin benchmarks, sin documentacion |
| Llama 3.2 3B Instruct (base) | 3B | 128000 | Llama 3.2 Community License | safetensors | Modelo base, soporte multilingue, function calling |
| Llama 3.1 8B Instruct | 8B | 128000 | Llama 3.1 Community License | safetensors | Mayor capacidad, mas VRAM |

La comparativa se limita a modelos de la misma familia. No hay modelos comparables de terceros en la informacion disponible. La principal diferencia es que el adaptador es un LoRA de bajo peso, mientras que los otros son modelos completos.

## Limitaciones y advertencias

- Falta de documentacion: no se especifica el dataset, la tarea concreta, los hiperparametros ni los resultados de evaluacion.
- Riesgo de alucinacion: al ser un adaptador no validado, puede producir respuestas incorrectas o inventadas, especialmente en tareas de estimacion.
- Sesgos desconocidos: no hay informacion sobre el dataset de entrenamiento, por lo que los sesgos del modelo base (Llama 3.2) se heredan, pero ademas se desconocen los sesgos introducidos por el fine-tuning.
- Idioma limitado: la model card solo declara ingles, aunque el base es multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Llama 3.2 tiene su propia licencia comunitaria que puede imponer condiciones adicionales.
- Sin garantias de produccion: no se ha demostrado que el adaptador funcione correctamente en escenarios reales de estimacion de CVs.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Realist2026/cv-guestimator-llama3.2-lora
- Repositorio del modelo base en HuggingFace: https://huggingface.co/unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Llama 3 en Meta AI: https://developer.meta.com/ai/models/llama-3/
- GitHub de Llama 3: https://github.com/meta-llama/llama3
- Llama models README: https://github.com/meta-llama/llama-models/blob/main/README.md
- Repositorio relacionado: https://huggingface.co/Realist2026/cv-guestimator-llama3.2
- Repositorio relacionado: https://huggingface.co/Realist2026/Llama-3.2-Semantic-Guestimator
