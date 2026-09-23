# CollectionStudio/Mistral-Small-3.2-24B-Instruct-2506

## Resumen

Mistral-Small-3.2-24B-Instruct-2506 es un modelo de lenguaje multimodal con capacidad de procesar texto e imagen, con 24.011.361.280 parametros (aproximadamente 24B). Lo desarrolla Mistral AI, aunque la ficha analizada corresponde a un repositorio espejo publicado por el usuario CollectionStudio, que reetiqueta el modelo oficial bajo licencia Apache 2.0. Se trata de una actualizacion menor de Mistral-Small-3.1-24B-Instruct-2503, afinada sobre el modelo base mistralai/Mistral-Small-3.1-24B-Base-2503, con la etiqueta de arquitectura mistral3 y formato de pesos safetensors.

El modelo resuelve tres problemas concretos respecto a su predecesor: mejora el seguimiento de instrucciones precisas, reduce las generaciones infinitas o repetitivas (del 2,11 % al 1,29 % en pruebas internas) y refuerza la plantilla de function calling. Estas mejoras lo hacen mas fiable en produccion, especialmente en pipelines con tool calling y en tareas donde los bucles de repeticion degradaban la respuesta.

Su relevancia actual radica en que ofrece capacidades multimodales (razonamiento sobre imagenes, graficos y documentos) y soporte de function calling en un tamano de 24B desplegable en servidores de 2 GPU, bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. La model card recomienda su ejecucion con vLLM (version >= 0.9.1) y mistral_common >= 1.6.2, y sugiere temperaturas bajas (temperatura = 0.15) junto con un system prompt explicito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal de la familia Mistral 3 (etiqueta mistral3) |
| Parametros totales | 24.011.361.280 (24,0B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo menciona inferencia en bf16/fp16) |
| Idiomas soportados | 24 idiomas: en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con configuracion y tokenizer en formato mistral-common) |

## Arquitectura y entrenamiento

La informacion disponible identifica la arquitectura mediante la etiqueta mistral3 y el uso de la libreria mistral-common para el tokenizer y las plantillas de instrucciones. Se trata de un modelo denso de 24B parametros con capacidad multimodal (entrada de imagen y texto, con un limite por defecto de 10 imagenes por prompt segun el comando de servido de vLLM). No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de alineacion como RLHF o DPO.

La model card indica que Mistral-Small-3.2-24B-Instruct-2506 es una actualizacion menor de Mistral-Small-3.1-24B-Instruct-2503, afinada sobre Mistral-Small-3.1-24B-Base-2503, y que hereda sus caracteristicas clave. Las innovaciones destacadas son de plantilla y postentrenamiento: una plantilla de function calling mas robusta (con referencia explicita al tokenizer de instruct.py de mistral-common) y un ajuste que reduce las generaciones infinitas. No se documentan innovaciones de atencion (por ejemplo, atencion lineal) ni decodificacion especulativa en el material facilitado.

## Capacidades

- Generacion de texto y conversacion multi-turno en 24 idiomas, con marcado enfoque en instrucciones precisas (Wildbench v2 de 65,33 % y Arena Hard v2 de 43,1 %).
- Razonamiento STEM: matematicas (MATH 69,42 %; MMLU Pro 69,06 %) y preguntas cientificas de nivel graduado (GPQA Diamond 46,13 %).
- Generacion de codigo: HumanEval Plus Pass@5 de 92,90 % y MBPP Plus Pass@5 de 78,33 %.
- Capacidades de vision: reconocimiento y razonamiento sobre imagenes, graficos y documentos (DocVQA 94,86 %, ChartQA 87,4 %, AI2D 92,91 %, MMMU 62,50 %, Mathvista 67,09 %).
- Tool calling / function calling con plantilla dedicada y parser especifico (`--tool-call-parser mistral`, `--enable-auto-tool-choice`).
- Soporte de entrada multimodal con hasta 10 imagenes por prompt mediante vLLM (`--limit-mm-per-prompt '{"image":10}'`).
- Reduccion de bucles de repeticion en prompts largos y repetitivos (1,29 % de generaciones infinitas frente al 2,11 % del predecesor).
- No se documenta en la informacion disponible soporte explicito de audio ni un modo "thinking" separado.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas con un system prompt ajustado y temperatura baja (0,15) para respuestas estables; su menor tasa de generaciones infinitas evita respuestas que se repiten en bucles.
- Generacion de codigo en produccion: con HumanEval Plus Pass@5 de 92,90 % y soporte de function calling, puede integrarse en pipelines de CI/CD para proponer parches, generar tests o invocar herramientas de compilacion y analisis.
- Extraccion de datos de documentos: con DocVQA de 94,86 %, resulta adecuado para procesar facturas, formularios o informes escaneados y transformarlos en datos estructurados.
- Analisis de graficos y dashboards: con ChartQA de 87,4 %, permite interpretar graficos de negocio y responder preguntas sobre tendencias o valores concretos representados visualmente.
- Asistente de soporte tecnico con herramientas: mediante function calling puede consultar bases de conocimiento, abrir tickets o ejecutar acciones en sistemas externos dentro de un flujo de agente.
- Razonamiento matematico y cientifico asistido: con MATH de 69,42 % y GPQA Diamond de 46,13 %, sirve de apoyo en tutorizacion o resolucion de problemas de nivel secundario y universitario.
- Moderacion y clasificacion de contenido multilingue: su cobertura de 24 idiomas permite clasificar, resumir o etiquetar contenido en idiomas minoritarios como nepalí, serbio o vietnamita.
- Agente multimodal de analisis de imagenes: combinando entrada de imagen y tool calling puede inspeccionar capturas, diagramas o fotos y desencadenar acciones posteriores (por ejemplo, generar un informe o crear una alerta).

## Benchmarks y rendimiento

Instruccion, chat y tono:

| Modelo | Wildbench v2 | Arena Hard v2 | IF interno (accuracy) |
|---|---|---|---|
| Small 3.1 24B Instruct | 55,6 % | 19,56 % | 82,75 % |
| Small 3.2 24B Instruct | 65,33 % | 43,1 % | 84,78 % |

Generaciones infinitas (menor es mejor):

| Modelo | Generaciones infinitas (interno) |
|---|---|
| Small 3.1 24B Instruct | 2,11 % |
| Small 3.2 24B Instruct | 1,29 % |

STEM:

| Modelo | MMLU | MMLU Pro (5-shot CoT) | MATH | GPQA Main (5-shot CoT) | GPQA Diamond (5-shot CoT) | MBPP Plus (Pass@5) | HumanEval Plus (Pass@5) | SimpleQA (TotalAcc) |
|---|---|---|---|---|---|---|---|---|
| Small 3.1 24B Instruct | 80,62 % | 66,76 % | 69,30 % | 44,42 % | 45,96 % | 74,63 % | 88,99 % | 10,43 % |
| Small 3.2 24B Instruct | 80,50 % | 69,06 % | 69,42 % | 44,22 % | 46,13 % | 78,33 % | 92,90 % | 12,10 % |

Vision:

| Modelo | MMMU | Mathvista | ChartQA | DocVQA | AI2D |
|---|---|---|---|---|---|
| Small 3.1 24B Instruct | 64,00 % | 68,91 % | 86,24 % | 94,08 % | 93,72 % |
| Small 3.2 24B Instruct | 62,50 % | 67,09 % | 87,4 % | 94,86 % | 92,91 % |

La model card remite a los benchmarks de Mistral-Small-3.1-24B-Instruct-2503 para comparaciones adicionales frente a otros modelos de tamano similar. No se ofrecen en la informacion proporcionada datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 55 GB de memoria de GPU en bf16 o fp16, segun la propia model card.
- Configuracion recomendada: ejecucion con paralelismo tensorial de 2 GPU (`--tensor-parallel-size 2`).
- GPU recomendadas: 2 x A100 (40 GB o 80 GB) o 2 x H100 para servir en bf16/fp16 con margen para cache KV.
- GPU de consumo: una RTX 4090 de 24 GB no es suficiente en bf16/fp16 (los pesos rondan los 48 GB); seria necesario cuantizar, pero la informacion disponible no publica cuantizaciones oficiales.
- Opciones de despliegue: vLLM >= 0.9.1 (recomendado, con `mistral-common >= 1.6.2`, tokenizer_mode mistral, config_format mistral, load_format mistral) y transformers. No se documentan integraciones con llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.
- Parametros de inferencia sugeridos: temperatura 0,15 y uso obligatorio de un system prompt; Mistral publica un SYSTEM_PROMPT.txt de referencia para uso como asistente general.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506 (este) | 24,0B | Si (imagen + texto) | Apache 2.0 | no disponible | HuggingFace (repositorio espejo de CollectionStudio) |
| Mistral-Small-3.1-24B-Instruct-2503 | 24,0B | Si | Apache 2.0 | no disponible | HuggingFace (mistralai) |
| Qwen2.5-32B-Instruct | 32,5B aprox. | No | Apache 2.0 | no disponible | HuggingFace |
| Gemma 3 27B IT | 27B | Si | Terminos de licencia Gemma | no disponible | HuggingFace |

No se dispone, en la informacion proporcionada, de benchmarks comparativos frente a Qwen2.5-32B-Instruct o Gemma 3 27B IT; la model card remite a los benchmarks del predecesor Mistral-Small-3.1 para esas comparaciones. Frente a Mistral-Small-3.1, el modelo analizado mejora en instrucciones, generacion de codigo y function calling, pero empeora ligeramente en MMMU (62,50 % frente a 64,00 %), Mathvista (67,09 % frente a 68,91 %) y AI2D (92,91 % frente a 93,72 %).

## Limitaciones y advertencias

- Repositorio espejo de terceros: la ficha corresponde a CollectionStudio, con 0 descargas y 0 likes en el momento de la consulta; para produccion conviene usar el repositorio oficial de mistralai, ya que un reetiquetado externo puede no reproducir exactamente los pesos o la configuracion.
- Alucinacion: la metrica SimpleQA TotalAcc es de solo 12,10 %, lo que indica una fiabilidad baja en preguntas factuales cerradas; no es adecuado como fuente de verdad sin verificacion externa.
- Generaciones infinitas: aunque se reduce respecto al predecesor, persiste un 1,29 % de generaciones infinitas en prompts largos y repetitivos, por lo que conviene imponer limites de tokens de salida.
- Contexto: la longitud de ventana no se especifica en la informacion disponible; no debe asumirse un valor concreto sin consultar la documentacion oficial.
- Idiomas: aunque declara 24 idiomas, no se aportan benchmarks por idioma; el rendimiento puede ser desigual en lenguas minoritarias como nepalí, serbio o vietnamita.
- Vision: la calidad multimodal es ligeramente inferior a la del predecesor en MMMU, Mathvista y AI2D, por lo que en tareas visuales exigentes conviene validar con datos propios.
- Licencia: Apache 2.0 permite uso comercial, pero la propia model card incluye un aviso de tratamiento de datos personales que remite a la politica de privacidad de Mistral AI; conviene revisarlo si se procesan datos de usuarios.
- Configuracion de inferencia: el modelo requiere system prompt y temperaturas bajas (0,15) para un comportamiento optimo; sin ellos el rendimiento de instrucciones puede degradarse.
- Requisitos de memoria: unos 55 GB de VRAM en bf16/fp16 impiden su despliegue en una unica GPU de consumo sin cuantizacion, y no se publican cuantizaciones oficiales en la informacion disponible.

## Enlaces

- HuggingFace (repositorio analizado): https://huggingface.co/CollectionStudio/Mistral-Small-3.2-24B-Instruct-2506
- HuggingFace (modelo oficial de Mistral AI): https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Predecesor: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Benchmarks del predecesor: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503#benchmark-results
- System prompt de referencia: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506/blob/main/SYSTEM_PROMPT.txt
- vLLM: https://github.com/vllm-project/vllm
- Docker de vLLM: https://github.com/vllm-project/vllm/blob/main/Dockerfile
- mistral-common: https://github.com/mistralai/mistral-common
- Plantilla de instrucciones (instruct.py): https://github.com/mistralai/mistral-common/blob/535b4d0a0fc94674ea17db6cf8dc2079b81cbcfa/src/mistral_common/tokens/tokenizers/instruct.py#L778
- Transformers: https://github.com/huggingface/transformers
