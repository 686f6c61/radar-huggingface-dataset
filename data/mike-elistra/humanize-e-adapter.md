# mike-elistra/humanize-e-adapter

## Resumen

humanize-e es un adaptador LoRA (QLoRA) sobre el modelo base Qwen2.5-3B-Instruct, desarrollado por Mike Elistra (Mike Koci), cuyo objetivo es reescribir textos generados por IA para que suenen mas naturales y humanos. El repositorio de HuggingFace `mike-elistra/humanize-e-adapter` contiene unicamente los pesos del adaptador PEFT, no un modelo completo: para utilizarlo es necesario cargar el modelo base Qwen2.5-3B-Instruct y aplicar el adaptador encima. El proyecto se presenta como una aplicacion completa con backend FastAPI, interfaz web, Dockerfile y API REST con endpoints `/humanize` y `/health`.

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only de 3.000 millones de parametros desarrollado por Alibaba Qwen, con soporte multilingue y capacidad de instrucciones. Sobre el se aplica un fine-tuning LoRA con rango 32 y alpha 64, entrenado durante 2 epocas con un learning rate de 2e-4 y scheduler coseno. La cuantizacion en inferencia es 4-bit NF4 en GPU y fp32 en CPU, lo que permite ejecutarlo en hardware modesto.

La relevancia de este adaptador es acotada: se trata de un experimento de estilo (style transfer) entrenado con solo 156 pares sinteticos humano↔IA, sin benchmarks publicados ni licencia declarada en la model card de HuggingFace (aunque el README del repositorio de codigo indica MIT). Es util como referencia para quien quiera montar un pipeline de "humanizacion" de texto o como ejemplo de QLoRA aplicado a una tarea concreta, pero no debe considerarse un modelo de produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | 3.000 millones (modelo base); adaptador LoRA de rango 32 (tamano exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | 4-bit NF4 en GPU; fp32 en CPU |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, multilingue) |
| Licencia | no disponible en HuggingFace; el README del repositorio de codigo indica MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + ficheros de tokenizer (`tokenizer.json`, `vocab.json`, `merges.txt`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only con atencion causal estandar. El fine-tuning se realizo con PEFT LoRA de rango r=32 y alpha=64, en modalidad QLoRA (cuantizacion 4-bit NF4 durante el entrenamiento). Los pesos del adaptador se exportan en `adapter_model.safetensors` junto con la configuracion `adapter_config.json` y los ficheros de tokenizer, de modo que el modelo base se descarga por separado desde HuggingFace (`Qwen/Qwen2.5-3B-Instruct`).

El entrenamiento se llevo a cabo en un notebook de Kaggle sobre el dataset "AI vs Human Text Classification Dataset 2026". El pipeline genera pares sinteticos: toma textos humanos, los reescribe en estilo IA usando el propio modelo base y construye muestras de entrenamiento para la transferencia de estilo. Se entrenaron 2 epocas con learning rate 2e-4, scheduler coseno y weight decay 0.01, con funcion de perdida de entropia cruzada y enmascaramiento de los tokens del prompt (solo se aprende la parte de estilo). El volumen de datos es muy reducido: 156 pares sinteticos humano↔IA.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, RLHF/DPO). El proyecto incluye un modo de respaldo (fallback) basado en reglas cuando el adaptador no esta disponible, lo que permite que la API responda aunque no se hayan cargado los pesos.

## Capacidades

- Reescritura de estilo: transforma texto con marcas tipicas de IA (formulismos, conectores redundantes, estructuras rigidas) en una version mas coloquial y directa.
- Transferencia de estilo entrenada especificamente sobre pares humano↔IA, no generacion general.
- Inferencia en CPU y GPU, con cuantizacion 4-bit NF4 en GPU y fp32 en CPU.
- Servicio HTTP mediante FastAPI con endpoint `POST /humanize` que acepta JSON con el campo `text` y devuelve `original`, `humanized` y `model`.
- Endpoint `GET /health` para monitorizacion del estado del modelo y la ruta del adaptador.
- Modo de respaldo basado en reglas cuando el adaptador no esta presente, util para pruebas y entornos sin pesos.
- Uso programatico desde Python mediante la clase `HumanizeModel` con el metodo `humanize(text)`.
- Despliegue en Docker con montaje de volumen para los pesos del adaptador.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Humanizacion de borradores generados por LLM en flujos editoriales: el adaptador reescribe parrafos con estilo marcadamente artificial antes de la revision humana, reduciendo el trabajo de edicion de tono.
- Preprocesado de respuestas de chatbot: en un pipeline de atencion al cliente, se puede pasar la salida del LLM por este adaptador para que las respuestas suenen menos encorsetadas y mas cercanas al registro del usuario.
- Generacion de contenido para blogs y newsletters: util para convertir textos de plantilla en versiones con registro mas natural, siempre con revision humana posterior dado el reducido conjunto de entrenamiento.
- Experimentacion academica sobre transferencia de estilo: sirve como referencia reproducible de QLoRA aplicado a una tarea de reescritura, con notebook de Kaggle y codigo de servicio incluidos.
- Prototipado de APIs de procesamiento de texto: el backend FastAPI y el Dockerfile permiten levantar un servicio de reescritura en minutos para validar una idea de producto.
- Integracion en pipelines de publicacion automatizada: mediante el endpoint `/humanize`, un orquestador puede enviar textos y recibir la version reescrita, con el modo de respaldo como red de seguridad si el adaptador no esta cargado.
- Evaluacion de tecnicas de QLoRA en hardware consumer: al caber en GPU de gama media con cuantizacion 4-bit, es util para comparar configuraciones de rango y alpha en tareas de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3.000 millones de parametros en 4-bit NF4 ocupa aproximadamente 1,5-2 GB de pesos; con overhead de activaciones y cache KV, se estima un consumo de 3-5 GB de VRAM en GPU, aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para el modelo base cuantizado; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- Compatibilidad con GPU consumer: si, el modelo base de 3B en 4-bit cabe en GPUs consumer de gama media; el adaptador anade un coste marginal.
- Opciones de despliegue: el repositorio incluye backend FastAPI propio (`app.py`), Dockerfile y montaje de volumen para los pesos. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| humanize-e-adapter | 3B (base) + LoRA r=32 | no disponible | Reescritura de estilo humano↔IA | no disponible en HF; MIT en el repo de codigo | HuggingFace (adaptador) |
| Qwen2.5-3B-Instruct | 3B | no disponible en esta ficha | Modelo de instrucciones general | Apache 2.0 (segun el modelo base) | HuggingFace |
| Alternativas de humanizacion de texto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificos de humanizacion de texto en la documentacion proporcionada; la comparativa se limita al modelo base sobre el que se construye el adaptador.

## Limitaciones y advertencias

- Entrenado con solo 156 pares sinteticos: la generalizacion es muy limitada y el estilo aprendido puede no cubrir registros, idiomas o dominios distintos de los del dataset.
- Riesgo elevado de sobreajuste al estilo del dataset de Kaggle, con posible perdida de matices o de contenido factual en la reescritura.
- No se han publicado benchmarks ni evaluaciones cuantitativas de calidad, fidelidad o tasa de alucinacion.
- La licencia no esta declarada en la model card de HuggingFace; el README del repositorio de codigo indica MIT, pero conviene verificar antes de un uso comercial.
- Idiomas soportados no declarados; aunque el modelo base Qwen2.5 es multilingue, el adaptador se entreno presumiblemente en ingles y su comportamiento en castellano no esta validado.
- El modo de respaldo basado en reglas no equivale al adaptador: si los pesos no se cargan, la calidad de la reescritura cae drasticamente.
- La model card menciona la posible necesidad de claves de API de LLM en el repositorio, lo que introduce un riesgo de seguridad si no se gestionan correctamente mediante variables de entorno.
- No apto para produccion sin una evaluacion previa sobre el dominio objetivo y sin revision humana del texto reescrito.

## Enlaces

- HuggingFace: https://huggingface.co/mike-elistra/humanize-e-adapter
- Notebook de entrenamiento en Kaggle: https://www.kaggle.com/code/mick009/notebook9c4e543da9
- Dataset AI vs Human Text Classification 2026: https://www.kaggle.com/datasets/alitaqishah/ai-vs-human-text-classification-dataset-2026
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
