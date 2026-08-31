# Aby-ss/harvey-llm

## Resumen

Harvey-llm es un modelo de lenguaje desarrollado por Aby-ss, publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo base unsloth/Qwen2.5-7B-Instruct-bnb-4bit, que a su vez es una version cuantizada a 4 bits del Qwen2.5-7B-Instruct original. El entrenamiento se realizo con la libreria Unsloth, que permite un ajuste fino aproximadamente dos veces mas rapido que los metodos convencionales, y con TRL (Transformers Reinforcement Learning) para el pipeline de entrenamiento.

El modelo esta orientado exclusivamente al idioma ingles y su repositorio tiene un tamano de 0.2 GB, lo que sugiere que se trata de un adaptador LoRA o de pesos parciales, no de un modelo completo de 7B. La informacion publica es muy escasa: no se especifican los datos de entrenamiento, el proposito del fine-tuning ni las tareas para las que fue optimizado. A pesar del nombre, no tiene relacion directa con la plataforma comercial Harvey AI para servicios legales, que utiliza modelos de Anthropic, OpenAI y Google.

La relevancia de este modelo reside en su naturaleza experimental: demuestra un flujo de trabajo de fine-tuning eficiente con Unsloth sobre una base solida como Qwen2.5-7B-Instruct, pero carece de documentacion tecnica suficiente para ser considerado para uso en produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder-only) |
| Parametros totales | no disponible (base: 7.6B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (base: 128K tokens) |
| Tipos de cuantizacion | no disponible (base: 4-bit bnb) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por ventanas deslizantes y soporte nativo para 128K tokens de contexto. El modelo base fue cuantizado a 4 bits con bitsandbytes (bnb-4bit) para reducir los requisitos de memoria durante el entrenamiento. El fine-tuning se realizo con Unsloth, que optimiza el proceso mediante kernels personalizados y reduccion del uso de VRAM, y con TRL para el bucle de entrenamiento.

No se ha publicado informacion sobre el dataset utilizado, el numero de pasos de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO. El repositorio solo indica que el modelo fue "entrenado 2x mas rapido con Unsloth", sin mas detalles. Dado el tamano del repositorio (0.2 GB), es probable que solo se hayan subido los pesos del adaptador LoRA, no el modelo completo.

## Capacidades

- Generacion de texto en ingles: al estar basado en Qwen2.5-7B-Instruct, hereda capacidades de generacion de texto coherente y contextual.
- Razonamiento y conversacion multi-turno: el modelo base esta optimizado para instrucciones y dialogos, por lo que el fine-tuning probablemente mantiene estas capacidades.
- Soporte de tool calling: el modelo base Qwen2.5-7B-Instruct soporta function calling, aunque no se confirma si el fine-tuning lo preserva.
- Capacidades multilingues: no disponibles, el modelo declara solo ingles.
- No se especifican capacidades especiales como vision, audio o modo thinking.

## Casos de uso

- Prototipado rapido de chatbots: dado su tamano reducido y la base instruct, puede usarse para experimentar con agentes conversacionales en entornos de desarrollo, aunque requiere validacion de calidad.
- Fine-tuning adicional sobre dominios especificos: al ser un adaptador LoRA, puede servir como punto de partida para apilar otros fine-tunings sobre la misma base Qwen2.5-7B.
- Evaluacion de flujos de entrenamiento con Unsloth: util para desarrolladores que quieran comparar el rendimiento de modelos entrenados con esta libreria frente a otros metodos.
- Generacion de texto en ingles para tareas simples: como resumen de documentos o redaccion de borradores, siempre que se valide la calidad del output.
- Investigacion academica sobre fine-tuning eficiente: el repositorio puede usarse como caso de estudio de entrenamiento con 4-bit base y LoRA.
- Integracion en pipelines de TGI: el tag text-generation-inference sugiere compatibilidad con despliegue en entornos de inferencia optimizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. Tampoco hay comparaciones con el modelo base o con alternativas. Cualquier dato de rendimiento deberia obtenerse mediante evaluacion propia.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre una base de 7B cuantizada a 4 bits, la inferencia puede requerir entre 4 y 6 GB de VRAM, dependiendo de la longitud del contexto y del batch.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070 o superiores son suficientes. Para mayor velocidad, una RTX 4090 o una A100 (40 GB) permiten contextos largos.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media con al menos 8 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference) y transformers con carga de adaptadores.
- Latencia y throughput: no disponibles. Dependera del hardware y de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| harvey-llm | 7.6B (base) | no disponible | Apache 2.0 | Fine-tuning LoRA, documentacion minima |
| Qwen2.5-7B-Instruct | 7.6B | 128K | Apache 2.0 | Modelo base, ampliamente evaluado |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 | Alternativa popular con ecosistema amplio |
| Mistral-7B-Instruct | 7.3B | 32K | Apache 2.0 | Modelo ligero y eficiente |

La comparativa se basa en el modelo base, ya que el fine-tuning no aporta datos propios. harvey-llm no ofrece ventajas claras frente a sus alternativas sin informacion adicional sobre el dataset o el proposito del entrenamiento.

## Limitaciones y advertencias

- Documentacion insuficiente: no se especifican datos de entrenamiento, hiperparametros ni evaluaciones, lo que impide conocer su calidad real.
- Sesgos desconocidos: al no detallar el dataset, no es posible anticipar sesgos de genero, raza o ideologicos.
- Riesgo de alucinacion: inherente a los modelos de 7B, especialmente sin evaluacion especifica.
- Limitaciones de idioma: solo ingles, sin soporte multilingue declarado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Posible confusion con Harvey AI: el nombre puede inducir a error; no esta afiliado con la plataforma legal comercial.
- Tamano del repositorio: 0.2 GB sugiere que solo contiene adaptadores, no pesos completos; su uso requiere cargar el modelo base por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aby-ss/harvey-llm
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- Harvey AI (no relacionado): https://www.harvey.ai/
- BenchLM leaderboard: https://benchlm.ai/
- Harvey LAB benchmark (Artificial Analysis): https://artificialanalysis.ai/evaluations/harvey-lab-aa
