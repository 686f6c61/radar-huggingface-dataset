# mradermacher/hana-pskit-1.5b-GGUF

## Resumen

hana-pskit-1.5b-GGUF es la version cuantizada en formato GGUF del modelo hana-pskit-1.5b, publicado por el usuario ak2311581 y convertido por mradermacher. Se trata de un modelo de lenguaje de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2, segun la etiqueta `qwen2` de la model card. El modelo esta especializado en tareas de tool calling y agentes dentro del ecosistema pskit (py-serverless-kit), con enfasis en despliegues serverless y automatizacion con Terraform.

La relevancia de esta ficha radica en que el modelo base esta disenado para un nicho muy concreto: la generacion y orquestacion de herramientas dentro de infraestructuras serverless basadas en Python y Terraform. El autor de la cuantizacion, mradermacher, es un actor conocido en la comunidad por producir versiones GGUF de modelos pequenos y medianos, lo que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El repositorio ocupa 14,2 GB e incluye 12 variantes de cuantizacion estatica que van desde Q2_K (0,8 GB) hasta f16 (3,2 GB). No se dispone de informacion publica sobre el proceso de entrenamiento, los datos utilizados ni resultados de benchmarks, por lo que esta ficha se limita a documentar lo que consta en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen2 (segun etiqueta de la model card) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna mas alla de la etiqueta `qwen2`, que indica que el modelo base sigue el diseno de la familia Qwen2 de Alibaba. Por el numero de parametros (1,54 mil millones) y la nomenclatura, se trata presumiblemente de una variante afinada del modelo Qwen2-1.5B, aunque esta afirmacion no se confirma explicitamente en la informacion disponible.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. Las etiquetas del repositorio (`pskit`, `py-serverless-kit`, `serverless`, `terraform`, `tool-calling`, `agent`) sugieren que el ajuste fino se oriento a tareas de invocacion de herramientas y generacion de configuracion de infraestructura, pero no se aporta evidencia cuantitativa al respecto. La cuantizacion realizada por mradermacher es de tipo estatico; no hay cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Tool calling / function calling, indicado por las etiquetas `tool-calling` y `agent`.
- Soporte para flujos de agentes y razonamiento multi-paso orientados a la orquestacion de herramientas.
- Generacion de configuracion e infraestructura como codigo en el contexto de pskit y Terraform (deducido de las etiquetas, no verificado con ejemplos publicos).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con APIs de inferencia tipo Hugging Face Endpoints.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- No consta soporte de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Orquestacion de agentes serverless: el modelo puede generar y encadenar llamadas a funciones dentro de arquitecturas py-serverless-kit, actuando como planificador de bajo coste en entornos con presupuesto de computo reducido.
- Generacion de infraestructura como codigo: dado su ajuste orientado a Terraform, puede emplearse para producir borradores de configuracion de recursos cloud que luego se validan en pipelines de CI/CD.
- Asistente de desarrollo para pskit: integrado en un IDE o CLI, puede sugerir fragmentos de codigo y comandos para desplegar funciones serverless en Python.
- Automatizacion de tareas de operaciones: al ser un modelo de 1,5B cuantizado a 4 bits (1,0-1,1 GB), puede desplegarse en contenedores ligeros o funciones edge para clasificar incidencias y decidir que herramienta invocar.
- Prototipado rapido de agentes en local: gracias a las cuantizaciones Q4_K_S y Q4_K_M, cabe en GPUs de consumo y permite iterar sobre disenos de tool calling sin coste de API.
- Enrutamiento de intenciones en pipelines: puede clasificar la peticion del usuario y seleccionar la herramienta adecuada antes de delegar en un modelo mayor, reduciendo latencia y coste en arquitecturas de cascada.
- Educacion y experimentacion: su tamano y licencia Apache 2.0 lo hacen util para ensenar tecnicas de cuantizacion y despliegue con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,1 GB con Q4_K_S o Q4_K_M; 1,7 GB con Q8_0; 3,2 GB con f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este tamano y permitirian lotes grandes o contexto extendido.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1650 en adelante) e incluso en CPU mediante llama.cpp con cuantizaciones Q2_K a Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, servidores compatibles con GGUF; el modelo base admite transformers. No consta soporte explicito de vLLM o TGI para el formato GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hana-pskit-1.5b-GGUF | 1,54B | no disponible | Apache 2.0 | GGUF | Especializado en tool calling y pskit/Terraform |
| Qwen2-1.5B-Instruct | 1,54B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo generalista base probable; contexto y benchmarks publicos |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamano similar con soporte de tool calling |

La comparativa con Qwen2-1.5B-Instruct y SmolLM2-1.7B-Instruct se ofrece como referencia de categoria; no se dispone de datos que permitan afirmar superioridad o inferioridad en benchmarks para hana-pskit-1.5b.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar presumiblemente de Qwen2, puede heredar sesgos de los datos de preentrenamiento de dicho modelo.
- Riesgo de alucinacion: elevado en modelos de 1,5B, especialmente en tareas de generacion de configuracion de infraestructura donde un error puede tener consecuencias operativas.
- Limitacion de idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto: no documentada; no debe asumirse una ventana amplia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base ak2311581/hana-pskit-1.5b y de Qwen2 en caso de derivacion.
- Ausencia de benchmarks: no hay evidencia publica de calidad en tool calling, lo que desaconseja su uso en produccion sin evaluacion previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y mantenimiento inciertos.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/hana-pskit-1.5b-GGUF
- Modelo base: https://huggingface.co/ak2311581/hana-pskit-1.5b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#hana-pskit-1.5b-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
