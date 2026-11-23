# mradermacher/VERO-Mini-V2-GGUF

## Resumen

VERO-Mini-V2-GGUF es la version cuantizada en formato GGUF del modelo MagmaStudios/VERO-Mini-V2, un modelo de lenguaje de aproximadamente 494 millones de parametros orientado a generacion de codigo, HTML y CSS, asi como a conversacion (chat). La cuantizacion ha sido realizada por mradermacher, un autor habitual en el ecosistema de publicacion de pesos GGUF para su uso con llama.cpp y herramientas compatibles. El modelo base incorpora un adaptador LoRA sobre un transformer pequeno, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en productos.

El modelo esta pensado para tareas ligeras de generacion de codigo y maquetacion web, con soporte declarado para castellano e ingles. Su tamano reducido (menos de 500 millones de parametros) lo hace apto para ejecucion en CPU y en GPUs de consumo, con cuantizaciones que ocupan desde 0,4 GB hasta 1,1 GB en funcion del tipo elegido (Q2_K hasta f16). Es relevante para desarrolladores que necesitan un modelo pequeno, rapido y desplegable localmente para asistencia de codigo o generacion de fragmentos HTML/CSS sin depender de servicios en la nube.

El repositorio incluye 12 variantes de cuantizacion estaticas (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16), lo que permite ajustar el equilibrio entre calidad y consumo de recursos. No se dispone de informacion publica sobre el contexto maximo, la composicion exacta del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base con adaptador LoRA; detalles no disponibles) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | es, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base MagmaStudios/VERO-Mini-V2 es un transformer de aproximadamente 494 millones de parametros sobre el que se ha aplicado un adaptador LoRA, segun los tags del repositorio (`lora`, `base_model:adapter:MagmaStudios/VERO-Mini-V2`). La model card no detalla la arquitectura interna (numero de capas, dimensiones de atencion, tipo de positional encoding), por lo que estos datos no estan disponibles.

El dataset declarado para el entrenamiento es `bigcode/self-oss-instruct-sc2-exec-filter-50k`, un conjunto de instrucciones de codigo generado y filtrado por ejecucion. No se especifica el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card tampoco documenta innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion la ha realizado mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, y no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto y conversacion multi-turno (tags `chat`, `conversational`).
- Generacion de codigo en lenguajes de programacion (tag `code`), con especial enfasis en HTML y CSS (tags `html`, `css`).
- Soporte bilingue castellano-ingles (tags `es`, `en`).
- Uso como modelo base con adaptador LoRA, lo que permite fine-tuning adicional.
- Compatible con endpoints (tag `endpoints_compatible`).
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente de maquetacion web: el modelo puede generar fragmentos de HTML y CSS a partir de descripciones en lenguaje natural, adecuado para prototipado rapido de interfaces y para integrarse en editores o generadores de plantillas.
- Autocompletado de codigo en IDE: con menos de 500 millones de parametros y cuantizaciones de 0,5 GB, puede ejecutarse localmente en el portatil del desarrollador y ofrecer sugerencias de codigo sin latencia de red.
- Chat de soporte tecnico bilingue: su soporte declarado de castellano e ingles permite atender consultas de desarrolladores en ambos idiomas en entornos de documentacion o foros.
- Generacion de ejemplos y tests: puede producir fragmentos de codigo de ejemplo y casos de prueba para documentacion tecnica o para completar suites de tests en proyectos pequenos.
- Despliegue en dispositivos con recursos limitados: al caber en CPU y en GPUs de consumo con cuantizaciones Q4_K_M (0,5 GB), es apto para aplicaciones de escritorio, plugins de navegador o entornos embebidos.
- Fine-tuning especifico de dominio: su licencia Apache 2.0 y su naturaleza LoRA permiten adaptarlo a dominios concretos (por ejemplo, un framework web interno) sin restricciones comerciales.
- Prototipado de chatbots: para demos y pruebas de concepto de asistentes conversacionales ligeros donde el coste de inferencia en la nube no esta justificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,4 GB (Q2_K, Q3_K_S) y 1,1 GB (f16); las cuantizaciones recomendadas Q4_K_S y Q4_K_M ocupan aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones mas pequenas; RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100 son sobradas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Ejecucion en CPU: viable gracias al formato GGUF y al reducido tamano; las cuantizaciones Q4_K_M y Q8_0 son las mas adecuadas para CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base (safetensors) puede servirse con transformers, vLLM o TGI, aunque para este tamano llama.cpp suele ser la opcion mas eficiente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VERO-Mini-V2-GGUF (este) | 494 M | no disponible | Apache 2.0 | GGUF | Enfocado a codigo, HTML y CSS; bilingue es/en |
| Qwen2.5-Coder-0.5B | 0,5 B | 32 K (segun model card publica) | Apache 2.0 | safetensors, GGUF | Alternativa generalista de codigo de tamano similar |
| SmolLM2-360M | 360 M | 8 K (segun model card publica) | Apache 2.0 | safetensors, GGUF | Modelo pequeno generalista, no especializado en codigo |
| StarCoder2-3B | 3 B | 16 K (segun model card publica) | BigCode OpenRAIL-M | safetensors, GGUF | Mayor calidad de codigo pero mas recursos y licencia con restricciones |

Nota: los datos de los modelos comparados provienen de sus model cards publicas y pueden variar; no se dispone de benchmarks de VERO-Mini-V2 para una comparacion cuantitativa.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo; al entrenarse sobre datos de codigo, puede reproducir sesgos presentes en repositorios publicos.
- Riesgo de alucinacion en generacion de codigo: al ser un modelo pequeno, puede producir APIs inexistentes, imports erroneos o sintaxis invalida, especialmente en lenguajes poco representados en el dataset.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o ficheros largos.
- Soporte limitado a castellano e ingles; otros idiomas pueden degradar la calidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el adaptador LoRA deben verificarse por separado en sus repositorios originales.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran function calling nativo.
- El modelo esta pensado para tareas ligeras; no sustituye a modelos de mayor tamano en razonamiento complejo, matematicas avanzadas o generacion de codigo a gran escala.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VERO-Mini-V2-GGUF
- Modelo base: https://huggingface.co/MagmaStudios/VERO-Mini-V2
- Dataset de entrenamiento: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#VERO-Mini-V2-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
