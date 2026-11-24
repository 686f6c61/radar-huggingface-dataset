# nassimjp/Wowra-1.8B-GGUF

## Resumen

Wowra-1.8B-GGUF es una distribucion en formato GGUF del modelo Hunyuan-1.8B-Instruct, publicada por el usuario nassimjp en Hugging Face. Se trata de una conversion realizada con Unsloth (la model card lo indica explicitamente) pensada para su uso con llama.cpp y con la familia de herramientas compatibles (llama-cli, llama-mtmd-cli, endpoints compatibles). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicacion muy reciente o de escasa difusion.

El modelo subyacente pertenece a la familia Hunyuan de Tencent, segun el tag `hunyuan_v1_dense` que aparece en los metadatos del repositorio. El sufijo "dense" indica una arquitectura transformer densa (no MoE), con 1.791.080.448 parametros totales segun los datos de safetensors. Es, por tanto, un modelo pequeno, orientado a inferencia en hardware modesto y a tareas conversacionales.

La relevancia de esta ficha es limitada pero concreta: ofrece una via rapida para ejecutar un modelo de la familia Hunyuan en local mediante llama.cpp, con cuantizaciones F16 y Q4_K_M ya preparadas. No obstante, la informacion publicada por el autor es minima (sin licencia declarada, sin idiomas declarados, sin benchmarks), por lo que muchos apartados de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (tag `hunyuan_v1_dense`) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 y Q4_K_M (ficheros publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como origen de los parametros) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo denso de la familia Hunyuan (tag `hunyuan_v1_dense`) con aproximadamente 1.800 millones de parametros. No se han publicado en la informacion proporcionada detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, atencion con ventana deslizante, etc.).

El proceso de conversion a GGUF se realizo con Unsloth, segun declara la model card. La unica informacion adicional relevante es la disponibilidad de dos ficheros: una version en F16 (precision completa) y una version Q4_K_M (cuantizacion de 4 bits con mezcla de tipos K-quant). El repositorio ocupa 4,7 GB en total, coherente con la suma de ambos ficheros para un modelo de este tamano.

## Capacidades

- Generacion de texto conversacional: la model card y los tags (`conversational`) indican un uso previsto de dialogo multi-turno.
- Instrucciones: el nombre del fichero (`Hunyuan-1.8B-Instruct`) sugiere un modelo ajustado para seguir instrucciones, aunque no se detalla el metodo de ajuste.
- Compatibilidad con llama.cpp: soporta el flag `--jinja` para plantillas de chat, lo que habilita el formateo correcto de conversaciones.
- Soporte multimodal potencial: la model card menciona `llama-mtmd-cli` para modelos multimodales, pero no confirma que este modelo concreto tenga vision; debe tratarse como no confirmado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: al ser un GGUF de 1.8B con cuantizacion Q4_K_M, puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que permite iterar sobre prompts y plantillas de chat sin coste de API.
- Pruebas de integracion con llama.cpp: util para validar pipelines que usan `llama-cli --jinja` o el servidor compatible con endpoints antes de migrar a modelos mayores.
- Generacion de texto en entornos con recursos limitados: el fichero Q4_K_M reduce el peso a aproximadamente 1 GB, adecuado para dispositivos embebidos o contenedores con poca memoria.
- Evaluacion comparativa de la familia Hunyuan: sirve como punto de referencia de bajo coste para comparar calidad conversacional frente a otros modelos pequenos antes de escalar a variantes mayores.
- Filtrado y clasificacion de texto simple: tareas de etiquetado o resumen corto donde un modelo de 1.8B es suficiente y la latencia importa.
- Educacion y experimentacion: permite estudiar el comportamiento de un modelo Instruct de la familia Hunyuan en un entorno reproducible y offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,6 GB para el fichero F16 (1.791 M parametros x 2 bytes) y aproximadamente 1,1-1,3 GB para el fichero Q4_K_M, mas overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16 (GTX 1650, RTX 3050) y practicamente cualquier GPU con 2 GB o mas para Q4_K_M. Para mayor throughput, RTX 3060/4060 o superiores.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas actuales, especialmente con Q4_K_M. Tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa importacion del GGUF), y cualquier runtime compatible con GGUF. La model card menciona `endpoints_compatible`, lo que sugiere compatibilidad con servidores de API estilo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Wowra-1.8B-GGUF | 1.791 M | no disponible | no disponible | GGUF | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Amplia, muy usado |
| Llama-3.2-1B-Instruct | 1.200 M | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Amplia, muy usado |
| SmolLM2-1.7B-Instruct | 1.700 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Amplia |

La comparativa se ofrece como referencia de categoria (modelos densos de 1-2B parametros para instrucciones); no se dispone de datos de rendimiento del modelo evaluado para comparar calidad. Los datos de los modelos alternativos corresponden a sus especificaciones publicas conocidas.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido. Debe consultarse con el autor antes de cualquier despliegue en produccion.
- Informacion minima: no hay datos de idiomas, contexto, benchmarks ni metodo de entrenamiento, lo que dificulta evaluar su idoneidad frente a alternativas bien documentadas.
- Riesgo de alucinacion: inherente a modelos de este tamano; con 1.8B parametros la fidelidad factual es limitada y no debe usarse para tareas que requieran precision sin verificacion.
- Sesgos: no documentados por el autor; cabe esperar los sesgos habituales del corpus de entrenamiento original de Hunyuan, no auditados en esta distribucion.
- Contexto limitado (probable): aunque no se declara la longitud de contexto, los modelos de esta familia y tamano suelen tener ventanas moderadas; conviene verificar antes de usarlo con documentos largos.
- Trazabilidad: al ser una conversion de terceros (nassimjp) sobre el modelo original de Tencent, la calidad de la conversion y la integridad de los pesos no estan verificadas por el fabricante original.
- Multimodalidad no confirmada: la mencion de `llama-mtmd-cli` en la model card es generica; no debe asumirse soporte de vision.
- Madurez: 0 descargas y 0 likes indican un repositorio sin validacion por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nassimjp/Wowra-1.8B-GGUF
- Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
