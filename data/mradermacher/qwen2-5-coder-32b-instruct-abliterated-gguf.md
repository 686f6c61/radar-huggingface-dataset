# mradermacher/Qwen2.5-Coder-32B-Instruct-abliterated-GGUF

## Resumen

Qwen2.5-Coder-32B-Instruct-abliterated-GGUF es la distribucion en formato GGUF del modelo Qwen2.5-Coder-32B-Instruct sometido a un proceso de "abliteration", una tecnica de edicion de pesos que elimina la direccion de rechazo aprendida durante el alineamiento. El resultado es un modelo de codigo de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) que mantiene las capacidades de generacion y comprension de codigo del original, pero sin las capas de rechazo que limitan ciertas respuestas. El autor de esta cuantizacion es mradermacher, un conocido publicador de quants GGUF, y el modelo base es huihui-ai/Qwen2.5-Coder-32B-Instruct-abliterated.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de codigo de gran tamano (32B) con contexto largo, una licencia permisiva Apache 2.0 y la ausencia de filtros de rechazo, lo que lo hace atractivo para entornos de investigacion y para despliegues locales donde se necesita control total sobre el comportamiento del modelo. Al estar en formato GGUF, puede ejecutarse con llama.cpp, Ollama y otros runners compatibles, lo que reduce la barrera de entrada frente a pesos safetensors de 65 GB en precision completa.

El repositorio ocupa 224 GB e incluye 11 cuantizaciones distintas, desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB), lo que permite ajustar el modelo a distintos presupuestos de VRAM y RAM. La fecha de creacion es el 13 de noviembre de 2024 y la ultima actualizacion registrada es el 2 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder soporta 131.072 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; tambien existe una variante i1 (imatrix) en repositorio separado |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (multiples archivos por cuantizacion) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion estatica del checkpoint huihui-ai/Qwen2.5-Coder-32B-Instruct-abliterated, que a su vez deriva de Qwen2.5-Coder-32B-Instruct. La arquitectura subyacente es un transformer decoder-only denso de 32,8 mil millones de parametros, sin mezcla de expertos. La model card del repositorio no detalla la composicion del dataset de entrenamiento original ni el proceso de RLHF/DPO del modelo Qwen; esa informacion no esta disponible en la documentacion proporcionada.

La innovacion principal de esta version es el proceso de abliteration aplicado por huihui-ai: se identifica la direccion en el espacio de activaciones asociada al rechazo de peticiones y se proyecta fuera de los pesos, de modo que el modelo deja de activar respuestas de negativa ante ciertos prompts. mradermacher se limita a convertir el checkpoint resultante a GGUF y a generar las distintas cuantizaciones; los metadatos internos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion y comprension de codigo en multiples lenguajes de programacion, heredadas del modelo Qwen2.5-Coder-32B-Instruct.
- Razonamiento sobre fragmentos de codigo, explicacion de funciones y generacion de tests.
- Conversacion multi-turno en formato chat (etiqueta `conversational` en los tags del repositorio).
- Comportamiento "uncensored": al haberse eliminado la direccion de rechazo, el modelo responde a peticiones que el original rechazaria.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso detras de APIs compatibles con OpenAI.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion proporcionada; el modelo base Qwen2.5-Coder lo soporta, pero esta ficha no puede verificarlo.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente `en`; no se confirman otros idiomas.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- **Asistente de codigo en local para equipos de investigacion**: con la cuantizacion Q4_K_M (20 GB) el modelo cabe en una GPU de 24 GB y permite autocompletado, explicacion y refactorizacion de codigo sin enviar datos a servicios externos. Es adecuado por su tamano y por la licencia Apache 2.0.
- **Generacion de tests unitarios en pipelines de CI**: el modelo puede recibir un fragmento de codigo y devolver casos de prueba; al ejecutarse con llama.cpp u Ollama, se integra en scripts de integracion continua sin dependencias de red.
- **Analisis de codigo malicioso o de seguridad ofensiva**: la variante abliterated no rechaza peticiones relacionadas con analisis de vulnerabilidades, lo que la hace util en laboratorios de seguridad que necesitan examinar payloads o explicar tecnicas de explotacion con fines defensivos.
- **Prototipado rapido de APIs de generacion de codigo**: gracias al tag `endpoints_compatible`, puede servirse detras de una API compatible con OpenAI usando llama.cpp server o vLLM (con el checkpoint safetensors original), lo que facilita migrar prototipos a produccion.
- **Migracion y traduccion entre lenguajes**: el modelo puede traducir fragmentos entre lenguajes (por ejemplo, Python a Rust) manteniendo la semantica; la ventana de contexto del modelo base permite procesar archivos completos, aunque conviene verificar el limite real en cada cuantizacion.
- **Documentacion automatica de bases de codigo**: con contexto largo, el modelo puede resumir modulos y generar docstrings; la cuantizacion Q6_K (27 GB) ofrece un equilibrio razonable entre calidad y requisitos de memoria para esta tarea.
- **Evaluacion de la robustez de filtros de seguridad**: investigadores pueden usar esta variante como contraste frente al modelo original para medir cuanto cambia el comportamiento tras la abliteration, comparando respuestas ante el mismo conjunto de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes para esta cuantizacion, y no se dispone de datos verificables del modelo base en la documentacion proporcionada.

## Requisitos de hardware

- **VRAM/RAM estimada por cuantizacion**: Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,0 GB; Q3_K_L 17,3 GB; IQ4_XS 18,0 GB; Q4_K_S 18,9 GB; Q4_K_M 20,0 GB; Q5_K_S 22,7 GB; Q5_K_M 23,4 GB; Q6_K 27,0 GB; Q8_0 34,9 GB.
- **GPU recomendadas**: para Q4_K_M o Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Para Q6_K y Q8_0 se recomienda A100 40 GB, H100 80 GB o configuraciones multi-GPU.
- **Compatibilidad con GPU de consumo**: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, solo cuantizaciones Q2_K o Q3_K_S) y GPUs con 24 GB o mas para cuantizaciones de 4 y 5 bits.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. Para el checkpoint safetensors original, vLLM o TGI.
- **Latencia y throughput**: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct-abliterated-GGUF (este) | 32,8B | no disponible | Apache 2.0 | GGUF | Variante sin rechazo, 11 cuantizaciones |
| Qwen2.5-Coder-32B-Instruct (original) | 32,8B | 131.072 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Con alineamiento completo; rechaza ciertas peticiones |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7B (2,4B activos, MoE) | 128.000 tokens | DeepSeek License | safetensors, GGUF | Menor huella de memoria, requiere aceptar licencia propia |
| Codestral-22B | 22B | 32.000 tokens | MNPL (no comercial) | safetensors | Restringido para uso comercial |

La comparativa se basa en caracteristicas publicas de los modelos; no se dispone de datos de benchmarks comparativos verificables en la informacion proporcionada para esta ficha.

## Limitaciones y advertencias

- **Sesgos**: al eliminar la direccion de rechazo, el modelo puede reproducir sesgos y contenido toxico con mayor facilidad que el original; no se documenta ninguna mitigacion adicional.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede inventar APIs, funciones o fragmentos de codigo que no existen; la abliteration no corrige este comportamiento y podria agravarlo en dominios sensibles.
- **Limitaciones de idioma**: la model card declara unicamente ingles (`en`); el rendimiento en castellano no esta garantizado ni documentado.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el proceso de abliteration puede entrar en conflicto con las politicas de uso aceptable del modelo original de Qwen; conviene revisar los terminos de Alibaba Cloud antes de desplegarlo en produccion.
- **Caveat de produccion**: las cuantizaciones de 2 y 3 bits degradan la calidad de forma notable; para uso serio se recomienda Q4_K_M o superior. La cuantizacion Q3_K_M esta marcada como "lower quality" por el propio autor.
- **Contexto**: no se confirma en esta ficha la longitud de contexto efectiva tras la cuantizacion; algunos runners limitan el contexto por defecto y hay que configurarlo explicitamente.
- **Trazabilidad**: al ser una cadena de derivaciones (Qwen → huihui-ai → mradermacher), los cambios introducidos en cada paso no estan completamente documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-Coder-32B-Instruct-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Qwen2.5-Coder-32B-Instruct-abliterated
- Variante imatrix: https://huggingface.co/mradermacher/Qwen2.5-Coder-32B-Instruct-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-Coder-32B-Instruct-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Licencia: https://huggingface.co/huihui-ai/Qwen2.5-Coder-32B-Instruct-abliterate/blob/main/LICENSE
