# bosaj/eniad-llama3.1-8b-assistant-lora

## Resumen

ENIAD Assistant es un adaptador LoRA sobre `meta-llama/Meta-Llama-3.1-8B-Instruct`, publicado por el usuario bosaj (Oussama El Hadji) dentro del ecosistema del proyecto de fin de año del ENIAD AI Lab (École Nationale d'Intelligence Artificielle et du Digital, Universidad Mohammed I, Ujda, Marruecos). No es un modelo entrenado desde cero: reutiliza los pesos de Llama 3.1 8B Instruct y añade un adaptador de bajo rango (r=16, alpha=32) para especializarlo en atención conversacional sobre información institucional y académica de la escuela (especialidades de ingeniería, requisitos de admisión, sistema de créditos ECTS, etc.).

El modelo resuelve un problema acotado pero muy común en el sector educativo: convertir un asistente generalista en un asistente institucional bilingüe (francés e inglés) capaz de responder con terminología y estructura propias de la normativa académica marroquí, sin necesidad de reentrenar los 8.030 millones de parámetros de la base. La relevancia práctica está en su papel dentro de una arquitectura de microservicios: el adaptador se combina en el proyecto con una interfaz React 18 + Vite, un servicio multiagente (SMA), una canalización RAG con LanceDB/Qdrant y despliegue dockerizado con CI/CD.

La ficha se basa en la model card pública y en el `model-index` declarado por los autores. El repositorio es de reciente publicación, con 0 descargas y 0 "likes" en el momento de la consulta, y conviene tener en cuenta que el ejemplo de inferencia incluido en la propia model card apunta a un segundo repositorio de adaptador (`ahmed-ouka/my-llama3.1-8B-with-lora-Eniad-Assistant`) en lugar de al repositorio aquí descrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con adaptador LoRA. Base: `meta-llama/Meta-Llama-3.1-8B-Instruct` |
| Parametros totales | 8.030 millones en el modelo base; el adaptador LoRA anade aproximadamente 42 millones (estimacion calculada a partir de r=16 y los modulos objetivo declarados), es decir, en torno a 8.070 millones en total |
| Parametros activos | No aplica: no es un modelo MoE. El adaptador LoRA (r=16, alpha=32) si es denso y se aplica sobre todas las proyecciones de atencion y MLP |
| Longitud de contexto | 128.000 tokens heredados del modelo base (Llama 3.1 soporta 128k); no se documenta ninguna modificacion de RoPE por parte de los autores |
| Tipos de cuantizacion | El autor documenta carga en 8 bits con `BitsAndBytesConfig` en su ejemplo de inferencia. No se publican adaptadores cuantizados propios (GGUF, AWQ, GPTQ) para este repositorio; esos formatos solo existirian si se fusiona el adaptador con la base y se reconvierte |
| Idiomas soportados | Frances e ingles (declarados en la model card). El modelo base soporta ademas aleman, italiano, portugues, hindi, espanol y thai, pero el adaptador no fue entrenado para ellos |
| Licencia | Apache-2.0 para el adaptador. El modelo base queda sujeto a la Llama 3.1 Community License de Meta, por lo que su uso esta condicionado a la aceptacion previa de dicha licencia |
| Formato de pesos | Formato PEFT (adaptador LoRA en safetensors) mas los pesos del modelo base en safetensors. Libreria declarada: `peft` |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin cambios estructurales: un transformer decoder-only de 32 capas, atencion con Grouped-Query Attention (GQA), embeddings de 4.096 dimensiones, FFN con dimension intermedia de 14.336 y tokenizador BPE de 128.256 entradas. Sobre ese esqueleto congelado se entrena un adaptador LoRA que se inyecta en siete modulos por capa: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Es decir, no solo se adaptan las proyecciones de atencion, sino tambien las del bloque MLP, lo que da al adaptador capacidad de modificar de forma sustancial el comportamiento generativo con un coste de parametros muy bajo.

Los hiperparametros publicados son: rango LoRA 16, alpha 32, dropout 0,05 y optimizador `paged_adamw_8bit` (AdamW con estados de optimizador paginados y cuantizados a 8 bits). La model card se corta en la tabla de hiperparametros, por lo que no se especifican el numero de epochs, el learning rate, la longitud maxima de secuencia, el scheduler ni el tamano efectivo de batch. Tampoco se detalla el proceso de construccion del dataset mas alla de la existencia del conjunto bilingue `bosaj/eniad-assistant-instruct-dataset`; no se documentan fases de RLHF ni DPO. El ajuste es, por tanto, un fine-tuning supervisado (SFT) de dominio sobre pares instruccion-respuesta institucionales, y no una alineacion adicional del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno con la plantilla de chat de Llama 3.1 (roles `system`, `user`, `assistant`).
- Respuesta a consultas academicas institucionales del ENIAD: especialidades del ciclo ingeniero, requisitos de admision, sistema de evaluacion y creditos ECTS, y tematicas equivalentes.
- Comportamiento bilingue frances-ingles segun la declaracion del autor.
- Salida estructurada y de estilo academico, inducida por el mensaje de sistema recomendado en la model card ("Provide structured, accurate academic guidance").
- Al ser un adaptador sobre Llama 3.1 8B Instruct, el modelo base aporta razonamiento general, generacion de codigo y matematicas basicas, pero el adaptador puede degradar ligeramente esas capacidades generales al haber sido ajustado en un dominio estrecho.
- No se documenta soporte explicito de tool calling ni function calling especifico del adaptador. La base Llama 3.1 Instruct si define esquemas de tool use en su formato de chat, por lo que la funcionalidad podria conservarse parcialmente, pero no esta verificada en este repositorio.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.
- El uso como agente dentro del proyecto ENIAD se resuelve a nivel de sistema (servicio multiagente SMA y RAG con LanceDB/Qdrant), no mediante capacidades nativas del adaptador.

## Casos de uso

- Atencion al estudiante en ventanilla virtual: el adaptador responde preguntas repetitivas sobre planes de estudio, plazos de matricula y creditos ECTS con la terminologia oficial de la escuela, reduciendo la carga del personal administrativo.
- Portal web institucional bilingue: integrado en la interfaz React del proyecto, permite alternar consultas en frances e ingles sin duplicar el backend de inferencia, algo util en una universidad marroqui con documentacion en ambos idiomas.
- Chatbot de admisiones para candidatos internacionales: responde sobre requisitos de acceso, titulaciones previas y procesos de seleccion, con contexto de 128k tokens suficiente para incorporar un reglamento completo de admisiones en el prompt.
- Nucleo generativo de una canalizacion RAG academica: el adaptador produce la respuesta final a partir de fragmentos recuperados de documentos oficiales indexados en LanceDB o Qdrant, lo que reduce alucinaciones si el contexto recuperado es correcto.
- Sistema multiagente de orientacion academica: el modelo actua como agente conversacional especializado dentro de un SMA, mientras otros agentes gestionan busqueda vectorial, validacion de normativa o derivacion a secretaria.
- Asistente interno para profesorado y personal administrativo: consultas sobre normativa de evaluacion, procedimientos de actas o creditos, con la ventaja de que el vocabulario institucional ya esta interiorizado en el adaptador.
- Generacion de FAQ y material informativo: a partir de la documentacion oficial se pueden pre-generar respuestas tipo que despues un humano revisa, acelerando la publicacion de guias para estudiantes.
- Base para un asistente academico multiescuela: la receta (LoRA r=16 sobre Llama 3.1 8B Instruct, dataset de instrucciones bilingue) es replicable en otras instituciones con un coste de entrenamiento bajo.

## Benchmarks y rendimiento

Los unicos resultados publicados son los declarados por el autor en el `model-index`, sobre una tarea propia denominada "Academic Institutional QA". No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar, y no hay datos de modelos comparables medidos con la misma tarea.

| Tarea | Metrica | Valor | Verificado |
|---|---|---|---|
| Academic Institutional QA | ROUGE-1 | 52,4 | No |
| Academic Institutional QA | ROUGE-2 | 28,1 | No |
| Academic Institutional QA | ROUGE-L | 48,6 | No |

Advertencia metodologica: ROUGE mide solapamiento de n-gramas con una respuesta de referencia, no correccion factual ni utilidad de la respuesta. Valores como ROUGE-1 de 52,4 en un dominio cerrado y repetitivo son compatibles tanto con un ajuste solido como con una fuerte memorizacion de plantillas. Las metricas figuran como no verificadas y no se especifica el tamano del conjunto de evaluacion ni el procedimiento de particion.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base de 8.030 millones de parametros mas el adaptador: en torno a 17-18 GB en BF16/FP16, unos 10-11 GB en 8 bits (configuracion usada en el ejemplo oficial) y aproximadamente 5-6 GB en 4 bits (NF4). El adaptador en si suma alrededor de 42 millones de parametros, es decir, unos 84 MB en FP16, un coste despreciable.
- GPU de datacenter recomendadas: NVIDIA A100 40 GB, H100 80 GB o L40S 48 GB para servir en BF16 con contexto largo (128k) y varias peticiones concurrentes.
- GPU de consumo compatible: una RTX 4090 (24 GB) ejecuta el modelo en BF16 sin problemas de memoria; una RTX 3090 o 4080 (16-24 GB) lo hace en BF16 con secuencias moderadas; tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) requieren cuantizacion a 8 o 4 bits. La cuantizacion a 4 bits permite incluso GPUs de 6-8 GB con contextos cortos.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado por el autor, con `BitsAndBytesConfig`), vLLM con soporte LoRA (adaptadores servidos en caliente), TGI (Text Generation Inference) con adaptadores, y llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF. Para produccion con concurrencia, vLLM o TGI son las opciones mas adecuadas; para prototipos en local, Ollama sobre un GGUF fusionado es lo mas simple.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo, TTFT ni resultados de carga concurrente.

## Comparativa con modelos similares

No existen resultados comparables publicados en la misma tarea (Academic Institutional QA), por lo que la comparacion se limita a caracteristicas objetivas. La alternativa mas directa no es otro modelo, sino usar el propio Llama 3.1 8B Instruct sin adaptador.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| eniad-llama3.1-8b-assistant-lora | 8,03 mil millones (base) + ~42 millones (adaptador) | 128k | Apache-2.0 en el adaptador; Llama 3.1 Community License en la base | LoRA r=16 de dominio institucional, fr/en | HuggingFace, 0 descargas en el momento de la consulta |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 mil millones | 128k | Llama 3.1 Community License | Modelo generalista alineado por instrucciones, multilingue | Ampliamente disponible |
| ahmed-ouka/my-llama3.1-8B-with-lora-Eniad-Assistant | 8,03 mil millones (base) + adaptador | 128k | No disponible | Adaptador ENIAD del mismo equipo, referenciado en el codigo de ejemplo | HuggingFace |
| Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32k | Apache-2.0 | Modelo generalista de 7B, alternativa con licencia permisiva | Ampliamente disponible |

Frente a Mistral 7B Instruct, la ventaja es la licencia Apache-2.0 del adaptador y el contexto de 128k, pero la base de Meta impone condiciones adicionales. Frente a Llama 3.1 8B Instruct sin ajustar, la ventaja esperada es el vocabulario institucional y el tono academico; el coste es un posible estrechamiento del comportamiento fuera del dominio. No hay datos de rendimiento que permitan afirmar cual de las dos variantes ENIAD es mejor.

## Limitaciones y advertencias

- Dominio muy estrecho: el adaptador esta especializado en informacion institucional del ENIAD. Fuera de ese ambito, el comportamiento puede degradarse respecto al modelo base, y no hay evaluaciones generales que lo cuantifiquen.
- Riesgo elevado de alucinacion en datos factuales: plazos, tasas, numeros de creditos, nombres de asignaturas o requisitos legales pueden generarse de forma plausible pero incorrecta. En un asistente institucional esto es especialmente critico; se recomienda validacion contra fuentes oficiales o uso con RAG de documentos verificados.
- Idiomas declarados limitados a frances e ingles. Aunque la base es multilingue, el adaptador no ha sido entrenado en arabe ni en espanol, idiomas relevantes en el contexto marroqui.
- Licencia: el adaptador se declara Apache-2.0, pero al depender de pesos de Meta, el uso comercial esta sujeto a la Llama 3.1 Community License, incluidos sus requisitos de atribucion y las restricciones de la clausula de licencia aceptable. No se puede asumir uso comercial libre solo por la etiqueta Apache-2.0 del repositorio.
- Metadatos inconsistentes: el ejemplo de inferencia de la propia model card carga el adaptador `ahmed-ouka/my-llama3.1-8B-with-lora-Eniad-Assistant` en lugar del repositorio descrito, lo que puede provocar que un usuario crea estar usando este checkpoint cuando en realidad carga otro.
- Fechas de publicacion contradictorias: la model card data el proyecto en mayo de 2025, mientras que los metadatos de HuggingFace indican creacion en septiembre de 2026. Conviene verificar la version efectiva del adaptador antes de desplegarlo.
- Documentacion incompleta: la tabla de hiperparametros esta truncada en la model card. No se publican numero de epochs, learning rate, scheduler, tamano de secuencia ni composicion y tamano del dataset de entrenamiento, lo que dificulta la reproducibilidad.
- Benchmarks no verificados: las metricas ROUGE las declara el autor y no han sido replicadas por terceros. Ademas, ROUGE no mide correccion factual.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Advertencia de contexto: aunque la base soporta 128k tokens, un contexto tan largo multiplica el coste de memoria en KV cache y no hay ninguna evaluacion de como responde el adaptador en regimenes de contexto largo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bosaj/eniad-llama3.1-8b-assistant-lora
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Checkpoint original del equipo (mayo de 2025): https://huggingface.co/ahmed-ouka/my-llama3.1-8B-with-lora-Eniad-Assistant
- Dataset de instrucciones bilingue: https://huggingface.co/datasets/bosaj/eniad-assistant-instruct-dataset
- Demo interactiva (Space): https://huggingface.co/spaces/bosaj/chat_model
- Codigo fuente en GitHub: https://github.com/ennajari/ENIAD-ASSISTANT
- Libreria PEFT: https://github.com/huggingface/peft
- Perfiles del equipo: https://huggingface.co/abdennajari, https://huggingface.co/ahmed-ouka, https://huggingface.co/bosaj, https://github.com/ennajari, https://github.com/Bosaj, https://huggingface.co/abdelilahou
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados correspondian a sitios de letras de canciones y no guardan relacion con el proyecto.
