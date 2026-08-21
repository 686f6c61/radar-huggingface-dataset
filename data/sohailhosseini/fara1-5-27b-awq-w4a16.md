# Sohailhosseini/Fara1.5-27B-AWQ-W4A16

## Resumen

Fara1.5-27B-AWQ-W4A16 es una cuantizacion AWQ (4-bit weights, 16-bit activations) del modelo Fara1.5-27B, desarrollado por Microsoft como parte de la familia Fara1.5 de agentes de uso de computadora (Computer Use Agents, CUA). El modelo base, Fara1.5-27B, es un modelo multimodal decoder-only de 27.4B parametros, fine-tuneado a partir de Qwen3.5-27B, que acepta una meta textual, capturas de pantalla del navegador y un historial de pensamientos y acciones previos, y emite un bloque de cadena de pensamiento seguido de una llamada a herramienta estructurada. Esta cuantizacion, realizada por Sohailhosseini, reduce el peso en disco de 54.7 GB a 18.7 GB (compresion 2.92x), manteniendo sin cuantizar las partes visuales y el lm_head, lo que la hace adecuada para despliegue en GPUs con 24 GB de VRAM.

La relevancia de este modelo radica en que permite ejecutar un agente de navegacion web de ultima generacion en hardware mas accesible, sin sacrificar significativamente la calidad. Segun los datos publicados, Fara1.5-27B alcanza un 72.3% en el benchmark Online-Mind2Web, superando a sistemas propietarios mucho mas grandes. La cuantizacion AWQ esta calibrada con 256 muestras de ultrachat_200k y es compatible con vLLM, lo que facilita su integracion en pipelines de inferencia existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only multimodal basado en Qwen3.5 (vision tower + multi-modal projector) |
| Parametros totales | 27.4B (segun model card; safetensors reporta 6.28B, posible discrepancia) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32768 tokens (max-model-len en ejemplo de vLLM) |
| Tipos de cuantizacion | AWQ-W4A16 (4-bit pesos, 16-bit activaciones) |
| Idiomas soportados | No disponible (heredado de Qwen3.5, presumiblemente multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Fara1.5-27B es un transformer decoder-only multimodal, construido sobre Qwen3.5-27B, con un vision tower y un proyector multimodal que permiten procesar capturas de pantalla. Se entrena mediante supervised finetuning (SFT) sobre datos generados por FaraGen1.5, un pipeline escalable de entornos, solvers y verificadores disenado para tareas de uso de navegador. El modelo opera en un bucle observar-pensar-actuar: recibe la meta del usuario, la captura de pantalla actual y el historial de interacciones, y genera una cadena de pensamiento seguida de una llamada a herramienta estructurada.

La cuantizacion AWQ-W4A16 se aplica sobre los pesos del modelo base, dejando sin cuantizar el lm_head, las capas visuales (vision_tower, vision_model, multi_modal_projector, merger) y cualquier capa que coincida con el patron `re:.*visual.*`. La calibracion se realizo con 256 muestras de HuggingFaceH4/ultrachat_200k en una GPU H100 NVL. El esquema es asimetrico, lo que puede requerir kernels vLLM mas recientes; algunos kernels antiguos prefieren W4A16 simetrico.

## Capacidades

- Agente de uso de computadora (CUA): navegacion web autonoma, rellenado de formularios, extraccion de informacion y ejecucion de tareas multi-paso en el navegador.
- Razonamiento de cadena de pensamiento (chain-of-thought): genera un bloque de pensamiento antes de cada accion, lo que permite depuracion y trazabilidad.
- Tool calling estructurado: emite llamadas a herramientas en formato JSON, compatible con APIs de navegador y otras herramientas.
- Multimodal: procesa imagenes (capturas de pantalla) junto con texto, gracias al vision tower y proyector multimodal.
- Soporte de agentes y multi-step reasoning: disenado para tareas que requieren multiples pasos de observacion y accion.
- Capacidades multilingues: no confirmadas explicitamente, pero heredadas del modelo base Qwen3.5, que es multilingue.

## Casos de uso

- Automatizacion de pruebas de interfaz de usuario: el modelo puede navegar por una aplicacion web, hacer clic en elementos, rellenar formularios y verificar resultados, reduciendo el esfuerzo manual en pipelines de testing E2E.
- Extraccion de datos de sitios web: dado un objetivo (por ejemplo, "obtener el precio de este producto"), el modelo navega, localiza la informacion y la devuelve en formato estructurado, util para scraping inteligente.
- Asistentes de soporte tecnico con acceso a navegador: integrado en un chatbot, puede consultar documentacion, abrir tickets o ejecutar acciones en sistemas internos basados en web.
- Automatizacion de procesos de negocio (RPA): el modelo puede reemplazar scripts de RPA rigidos en tareas que requieren adaptacion a cambios de layout o contenido dinamico.
- Generacion de informes con capturas: el modelo puede navegar a multiples fuentes, capturar pantallas y compilar un informe visual con anotaciones.
- Investigacion de mercado automatizada: comparar precios, disponibilidad o caracteristicas de productos en diferentes sitios, siguiendo una meta textual y devolviendo un resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la version cuantizada AWQ-W4A16. El modelo base Fara1.5-27B reporta un 72.3% en Online-Mind2Web, superando a sistemas propietarios mas grandes, pero no hay datos comparativos para la cuantizacion. Se espera una degradacion minima en tareas de razonamiento, pero no hay mediciones publicas.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 18.7 GB en disco, por lo que la inferencia requiere aproximadamente 20-22 GB de VRAM (incluyendo overhead de activaciones y cache KV). Cabe en GPUs de 24 GB como RTX 4090, A10G, L4 o A5000.
- GPU recomendadas: para produccion con vLLM, se recomienda al menos una GPU con 24 GB (A10G, L4, RTX 4090) o superior (A100 40GB, H100). La cuantizacion se realizo en H100 NVL, pero no es un requisito.
- Opciones de despliegue: vLLM (soporte nativo para compressed-tensors), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), TGI (con adaptaciones). El ejemplo oficial usa `vllm serve`.
- Latencia y throughput: no disponibles. Con 27B parametros en 4-bit, se espera un throughput de decenas de tokens por segundo en una RTX 4090, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Fara1.5-27B (base) | 27.4B | 32768 | MIT | CUA multimodal | HuggingFace |
| Fara1.5-9B | 9B | no disponible | MIT | CUA multimodal | HuggingFace |
| Fara1.5-4B | 4B | no disponible | MIT | CUA multimodal | HuggingFace |
| Qwen3.5-27B (base) | 27B | no disponible | Apache 2.0 (presumible) | LLM general | HuggingFace |

No se dispone de comparativas directas con otros modelos de agente de uso de computadora (como Claude Computer Use o GPT-4o con herramientas) en terminos de rendimiento, ya que los benchmarks publicados se limitan a Online-Mind2Web para el modelo base.

## Limitaciones y advertencias

- La cuantizacion AWQ puede introducir degradacion en tareas de razonamiento complejo o en la precision de las llamadas a herramienta, aunque no hay evaluaciones publicas que lo cuantifiquen.
- El esquema asimetrico W4A16 puede no ser compatible con kernels vLLM antiguos; se recomienda usar versiones recientes.
- El modelo base esta disenado para tareas de navegacion web; su rendimiento en tareas generales de lenguaje o codigo no esta documentado.
- No se han publicado datos sobre sesgos o alucinaciones especificos. Como modelo entrenado con SFT, puede heredar sesgos de los datos de entrenamiento de FaraGen1.5.
- La licencia MIT permite uso comercial, pero la cuantizacion no altera los terminos del modelo base; se debe verificar la licencia de Qwen3.5 (probablemente Apache 2.0) para cumplimiento.
- El modelo requiere entrada multimodal (capturas de pantalla); sin ellas, su funcionalidad principal no es utilizable.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/Sohailhosseini/Fara1.5-27B-AWQ-W4A16
- Modelo base en HuggingFace: https://huggingface.co/microsoft/Fara1.5-27B
- Repositorio GitHub de Microsoft Fara: https://github.com/microsoft/fara
- Coleccion de modelos Fara1.5 en HuggingFace: https://huggingface.co/collections/microsoft/fara15
- Catalogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/Fara1.5-27B
- Ficha en AI Model Radar: https://aimodelradar.app/models/fara1-5-27b
