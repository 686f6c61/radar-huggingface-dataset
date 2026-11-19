# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-3to5-3000-SFT

## Resumen

Qwen2.5-1.5B-KK-Haiku-5.5-Flow-3to5-3000-SFT es un ajuste fino (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un experimento de personalizacion sobre la base instruct de Qwen2.5, orientado a la generacion de texto conversacional en ingles. El nombre del repositorio sugiere un entrenamiento sobre un conjunto de datos o estilo concreto ("Haiku", "Flow", "3to5", "3000"), aunque la model card no documenta el dataset ni la metodologia mas alla de indicar que se uso Unsloth y TRL.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 con 1.543.714.304 parametros (aproximadamente 1,5 mil millones), lo que lo situa en la gama de modelos pequenos desplegables en hardware de consumo. La licencia Apache 2.0 y el formato safetensors facilitan su integracion en pipelines con transformers y text-generation-inference.

Su relevancia es limitada en terminos de impacto general: se trata de un finetune comunitario con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Resulta util como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre modelos Qwen2.5 pequenos, mas que como modelo de produccion listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino supervisado (SFT) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este finetune) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de unsloth/Qwen2.5-1.5B-Instruct, que a su vez es un transformer decoder-only de la familia Qwen2.5 con 1,5 mil millones de parametros. La model card indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere el uso de tecnicas de entrenamiento eficiente en memoria (posiblemente LoRA o QLoRA, aunque no se especifica). No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales.

No se aportan innovaciones tecnicas propias del finetune: no hay mention de decodificacion especulativa, atencion lineal ni modulos híbridos. El repositorio ocupa 9,3 GB, un tamano superior al esperado para 1,5 mil millones de parametros en precision bf16 (unos 3 GB), lo que podria indicar la presencia de checkpoints intermedios o artefactos de entrenamiento adicionales, aunque no se detalla en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 1,5 mil millones de parametros.
- Generacion de codigo y matematicas de complejidad baja a media, segun las capacidades del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling y function calling: no confirmado para este finetune; el modelo base Qwen2.5-Instruct lo soporta, pero la model card no lo menciona.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este finetune.
- Multilingue: la model card declara unicamente ingles, aunque el modelo base Qwen2.5 es multilingue; el finetune puede haber degradado otros idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede desplegarse en una GPU de consumo para iterar sobre prompts y flujos de dialogo sin coste de API, gracias a su tamano de 1,5 mil millones de parametros.
- Experimentacion con ajuste fino sobre Qwen2.5: sirve como referencia de un pipeline Unsloth + TRL para desarrolladores que quieran replicar el proceso con sus propios datos.
- Generacion de texto creativo de formato corto (poesia, haikus, microrelatos): el nombre del repositorio sugiere un entrenamiento orientado a este tipo de salidas, aunque no se documenta el dataset.
- Tareas de clasificacion o extraccion de informacion en ingles: con prompting adecuado, un modelo de 1,5B puede realizar tareas de etiquetado simple en entornos con recursos limitados.
- Educacion y demos: util para mostrar el funcionamiento de un LLM pequeno en talleres o cursos, con requisitos de hardware modestos.
- Evaluacion comparativa de finetunes comunitarios: como caso de estudio de un modelo con cero descargas y documentacion minima, para analizar practicas de publicacion en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en bf16/fp16 (1,5B parametros x 2 bytes), alrededor de 1,5-2 GB en cuantizacion de 8 bits y en torno a 1 GB en 4 bits, aunque las cuantizaciones no estan publicadas en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6 GB en adelante), e incluso en CPU con llama.cpp si se generan cuantizaciones GGUF.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), y potencialmente vLLM o llama.cpp si se convierten los pesos, aunque no se documenta soporte explicito.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-KK-Haiku-5.5-Flow-3to5-3000-SFT (este) | 1,54B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Finetune comunitario sin benchmarks |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy usado | Requiere aceptacion de licencia; buenas capacidades multilingues |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens (ampliable) | Apache 2.0 | Hugging Face | Alternativa pequena de Hugging Face con benchmarks publicados |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5, puede heredar sesgos del corpus de entrenamiento original, pero no hay evaluacion especifica.
- Riesgo de alucinacion: alto en un modelo de 1,5B parametros, especialmente en tareas de conocimiento factual o razonamiento complejo.
- Limitaciones de contexto o idioma: la model card declara solo ingles; el contexto maximo no se especifica y podria haberse reducido respecto al modelo base durante el finetune.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el dataset de entrenamiento, lo que puede implicar riesgos legales si el dataset contenia material con derechos de autor.
- Caveats para produccion: cero descargas y cero likes indican ausencia de validacion comunitaria; no hay benchmarks, no hay informacion sobre el dataset ni sobre hiperparametros de entrenamiento. No se recomienda su uso en produccion sin una evaluacion propia exhaustiva.
- El tamano del repositorio (9,3 GB) es desproporcionado para 1,5B parametros, lo que sugiere artefactos adicionales no documentados que conviene inspeccionar antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-3to5-3000-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
