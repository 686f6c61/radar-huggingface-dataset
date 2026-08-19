# fstepano/amis-personals

## Resumen

El modelo `fstepano/amis-personals` es un fine-tuning del modelo Gemma 2 9B Instruct (desarrollado por Google) convertido al formato GGUF mediante la herramienta Unsloth. Se distribuye como un único archivo cuantizado en Q4_K_M, lo que facilita su ejecución en hardware de consumo mediante llama.cpp u Ollama. El autor no ha proporcionado información sobre el dataset de entrenamiento, la tarea específica o el propósito del fine-tuning, por lo que su comportamiento concreto no puede verificarse a partir de los datos públicos.

Su relevancia radica en que ofrece una alternativa compacta y eficiente para inferencia local de un modelo de 9 000 millones de parámetros, con un peso de solo 5,8 GB. Sin embargo, la ausencia de documentación sobre licencia, idiomas y rendimiento limita su uso en entornos profesionales sin una evaluación previa. La fecha de creación (agosto de 2026) sugiere que es un lanzamiento reciente, pero no hay métricas ni ejemplos que respalden su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (Transformer decoder-only, basado en el modelo base Gemma 2 9B Instruct) |
| Parametros totales | 9 241 705 984 (9,24 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Gemma 2 9B soporta 8192 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | Q4_K_M (unico archivo proporcionado) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifica para este fine-tuning) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Gemma 2 9B Instruct, una arquitectura Transformer decoder-only con atención multi-query y normalización RMSNorm. El proceso de ajuste se realizó con la librería Unsloth, que optimiza el entrenamiento mediante técnicas de kernel fusionado y reducción de memoria. Posteriormente se convirtió a formato GGUF para su uso con llama.cpp y Ollama.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan hiperparámetros ni el método de fine-tuning (LoRA, QLoRA, full fine-tune, etc.). La única evidencia es el archivo de pesos cuantizado y un Modelfile de Ollama incluido en el repositorio.

## Capacidades

- Generación de texto conversacional: al estar basado en Gemma 2 9B Instruct, hereda capacidades de chat y respuesta a instrucciones, aunque el fine-tuning podría haberlas modificado.
- Razonamiento y comprensión de contexto: se espera que mantenga las habilidades del modelo base, pero sin confirmación.
- Soporte de tool calling y function calling: no documentado.
- Capacidades multilingües: no documentadas; el modelo base soporta varios idiomas, pero no se garantiza en este fine-tuning.
- Modo de pensamiento o razonamiento extendido: no documentado.

## Casos de uso

Dado que no se conocen los datos de entrenamiento ni las capacidades específicas, los casos de uso son hipotéticos y requieren validación previa:

- Asistente conversacional local: al ser un GGUF cuantizado, puede ejecutarse en una máquina con GPU de gama media para mantener conversaciones de forma privada, sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones de chat: su formato GGUF permite integrarse fácilmente con llama.cpp u Ollama para crear demos o pruebas de concepto.
- Generación de texto en entornos con recursos limitados: con 5,8 GB de peso, cabe en GPUs con 8 GB de VRAM, lo que lo hace adecuado para equipos sin hardware de alta gama.
- Investigación sobre fine-tuning de Gemma 2: puede servir como ejemplo de cómo convertir un modelo fine-tuneado a GGUF con Unsloth, aunque no se documenta el proceso.
- Evaluación de la calidad de un fine-tuning no documentado: útil para comparar el comportamiento de este modelo frente al Gemma 2 9B original en tareas específicas.
- Despliegue en edge devices: con la cuantización Q4_K_M, es viable ejecutarlo en dispositivos con memoria limitada, como portátiles o mini-PCs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo requiere aproximadamente 5,5-6,5 GB de VRAM para cargar los pesos, más overhead de contexto y activaciones. En total, se recomienda al menos 8 GB de VRAM para una operación cómoda.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 3070, RTX 4070, o superiores. También puede ejecutarse en Apple Silicon con memoria unificada de 16 GB o más.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y alta de consumo.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (incluye Modelfile), también compatible con servidores que soporten GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no disponibles; dependerán del hardware y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fstepano/amis-personals | 9,24 B | No disponible | No disponible | GGUF | Fine-tuning desconocido de Gemma 2 9B |
| google/gemma-2-9b-it | 9,24 B | 8192 | Gemma Terms of Use | Safetensors | Modelo base instructivo, con licencia propietaria de Google |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131072 | Llama 3.1 Community License | Safetensors | Modelo instructivo con contexto largo y licencia permisiva |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32768 | Apache 2.0 | Safetensors | Modelo instructivo de código abierto con licencia Apache |

No se dispone de resultados de rendimiento para comparar directamente. La comparativa se basa únicamente en características técnicas declaradas.

## Limitaciones y advertencias

- Falta de documentación: no se especifica el dataset, el método de fine-tuning, ni los objetivos del modelo, lo que impide conocer su comportamiento real.
- Licencia desconocida: al no indicarse la licencia, no se puede garantizar su uso comercial o la redistribución. Se debe contactar al autor antes de cualquier despliegue profesional.
- Posibles sesgos heredados: al estar basado en Gemma 2, puede heredar sesgos y alucinaciones del modelo original, sin que se haya realizado una evaluación adicional.
- Riesgo de alucinación: sin benchmarks ni ejemplos de salida, no se puede evaluar la fiabilidad de las respuestas.
- Limitación de contexto: aunque el modelo base soporta 8192 tokens, no se confirma si el fine-tuning mantiene esa longitud; podría ser menor.
- Idioma no garantizado: aunque Gemma 2 soporta varios idiomas, el fine-tuning podría haberse realizado sobre un corpus monolingüe, reduciendo su cobertura.
- Sin soporte de herramientas: no hay evidencia de que soporte function calling o integración con agentes, por lo que no es adecuado para pipelines complejos sin validación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fstepano/amis-personals
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- Gemma 2 (modelo base): https://huggingface.co/google/gemma-2-9b-it

No se encontraron papers, blogs o demos adicionales asociados a este modelo.
