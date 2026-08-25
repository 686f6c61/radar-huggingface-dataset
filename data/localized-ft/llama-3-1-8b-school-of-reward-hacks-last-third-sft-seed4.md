# localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed4

## Resumen

El modelo `localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed4` es un ajuste fino (fine-tuning) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Forma parte de una serie de experimentos denominados "school-of-reward-hacks" que exploran variaciones de entrenamiento sobre el mismo modelo base, diferenciándose por la fracción de datos utilizada (first-third, second-third, last-third) y por la semilla aleatoria (seed). Este modelo concreto corresponde a la última tercera parte de los datos, con semilla 4.

Se trata de un modelo de 8.030 millones de parámetros, entrenado con las librerías Unsloth y TRL de Hugging Face, lo que indica un proceso de fine-tuning supervisado (SFT, por sus siglas en inglés) optimizado para velocidad. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. El modelo está orientado exclusivamente al inglés y su pipeline es de generación de texto.

La relevancia de este modelo radica en su naturaleza experimental: al ser parte de una familia de variantes con diferentes semillas y particiones de datos, puede servir para estudiar el impacto de estos factores en el comportamiento del modelo, especialmente en contextos de investigación sobre "reward hacking" (manipulación de recompensas en RLHF). Sin embargo, al no publicarse detalles sobre el dataset ni métricas de evaluación, su utilidad práctica inmediata es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 8B soporta 128k, pero no se confirma si se mantiene) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder-only con normalización RMSNorm, atención por consultas agrupadas (GQA) y activación SwiGLU. El modelo base `unsloth/Meta-Llama-3.1-8B-Instruct` es la versión instruct de 8B parámetros, optimizada para seguir instrucciones y mantener conversaciones.

El proceso de fine-tuning se realizó con Unsloth, una librería que acelera el entrenamiento mediante kernels optimizados, y con la librería TRL de Hugging Face, que proporciona herramientas para fine-tuning supervisado (SFT). Según la model card, el entrenamiento fue "2x más rápido" gracias a Unsloth. No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que el dataset está relacionado con "reward hacking", pero no hay información pública que lo confirme.

## Capacidades

- Generacion de texto en ingles: el modelo puede producir texto coherente y contextualizado, heredando las capacidades del modelo base Llama 3.1 8B Instruct.
- Conversacion multi-turno: al ser un fine-tune del modelo instruct, mantiene la capacidad de mantener dialogos con instrucciones y preguntas.
- Razonamiento y conocimiento general: las capacidades del modelo base se preservan en gran medida, incluyendo razonamiento basico, conocimiento factual y comprension lectora.
- No se ha confirmado soporte para tool calling, function calling, agentes, vision o audio. Estas capacidades dependen del modelo base, pero no se documentan en la model card.

## Casos de uso

- Investigacion academica sobre fine-tuning: este modelo puede utilizarse en estudios comparativos para analizar como la particion de datos y la semilla afectan al comportamiento de un modelo de 8B parametros. Al comparar las variantes first-third, second-third y last-third, los investigadores pueden evaluar la sensibilidad del entrenamiento a la seleccion de datos.
- Experimentos de "reward hacking": dado el nombre de la serie, el modelo podria emplearse para estudiar fenomenos de sobreoptimizacion de recompensas en sistemas de RLHF, aunque no hay documentacion que detalle el dataset.
- Generacion de texto en aplicaciones prototipo: para desarrolladores que necesiten un modelo de 8B con licencia permisiva y que quieran experimentar con variantes de fine-tuning, este modelo puede servir como punto de partida.
- Evaluacion de robustez: al existir multiples seeds, se puede probar la estabilidad de las respuestas del modelo ante variaciones en el entrenamiento, util para validar pipelines de fine-tuning.
- Educacion y formacion: como ejemplo de un fine-tune realizado con Unsloth y TRL, puede usarse en cursos o tutoriales sobre ajuste de modelos LLM.
- Despliegue en entornos con recursos limitados: con 8B parametros, el modelo puede ejecutarse en GPUs de consumo con cuantizacion, aunque no se proporcionan configuraciones especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo concreto. Al ser un fine-tune del modelo base Llama 3.1 8B Instruct, se espera un rendimiento similar al de este ultimo, pero sin confirmacion experimental.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.030 millones de parametros, en precision fp16 se necesitan aproximadamente 16 GB de VRAM. Con cuantizacion de 8 bits (INT8) se reduce a unos 8 GB, y con 4 bits a unos 4-5 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para fp16, una GPU con 16 GB o mas, como NVIDIA RTX 4090, A100 40GB o H100. Para cuantizacion, una RTX 3080/3090 o similar con 10-12 GB podria ser suficiente.
- Compatibilidad con GPU de consumo: si, con cuantizacion es posible ejecutarlo en GPUs de gama alta para consumidores (RTX 3090, 4090).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama. No se incluyen archivos GGUF en el repositorio.
- Latencia y throughput: no se proporcionan datos. Como referencia, un modelo de 8B en una A100 puede generar entre 50 y 100 tokens por segundo en configuraciones optimizadas, pero esto depende del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed4 | 8.03B | no disponible | Apache 2.0 | Fine-tune experimental, seed 4, ultimo tercio |
| localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed4 | 8.03B | no disponible | Apache 2.0 | Misma serie, segundo tercio, seed 4 |
| localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed3 | 8.03B | no disponible | Apache 2.0 | Misma serie, segundo tercio, seed 3 |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8.03B | 128k | Llama 3.1 license | Modelo base original |

No se dispone de datos de rendimiento para comparar. La comparativa se limita a parametros, licencia y origen. El modelo base tiene una licencia distinta (Llama 3.1 Community License) mientras que este fine-tune usa Apache 2.0, lo que puede facilitar su uso en proyectos comerciales.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo esta entrenado para ingles. No se recomienda su uso en otros idiomas sin evaluacion previa.
- Falta de documentacion: no se proporcionan detalles sobre el dataset de entrenamiento, el proceso de cuantizacion, ni las metricas de evaluacion. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Riesgo de alucinaciones: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Sesgos potenciales: al ser un fine-tune de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales de Llama 3.1, aunque no se han realizado auditorias especificas.
- Naturaleza experimental: con 0 descargas y 0 likes, es un modelo de investigacion sin validacion en produccion. No se recomienda su uso en aplicaciones criticas sin pruebas exhaustivas.
- Contexto no confirmado: aunque el modelo base soporta 128k tokens, no se sabe si el fine-tuning mantiene esa longitud. Se debe verificar antes de usarlo con contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero se debe incluir la atribucion correspondiente y no se ofrece ninguna garantia por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed4
- Variante second-third seed4: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed4
- Variante second-third seed3: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed3
- Repositorio oficial de Meta Llama 3: https://github.com/meta-llama/llama3
- Libreria Unsloth: https://github.com/unslothai/unsloth
