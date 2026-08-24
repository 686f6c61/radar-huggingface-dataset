# Nishant1600/qwen3-1_7b-scl-extractor

## Resumen

El modelo **Nishant1600/qwen3-1_7b-scl-extractor** es un fine-tuning del modelo base **Qwen/Qwen3-1.7B** mediante QLoRA (4-bit NF4, fusionado a bf16) que extrae hechos estructurados de seguridad laboral a partir de narrativas de incidentes industriales, devolviendo exclusivamente un objeto JSON con campos como tipo de energía, magnitud, unidad y grado de lesión, junto con evidencia textual literal. Desarrollado por Nishant1600, está pensado como backend para un pipeline de cumplimiento de seguridad (SIH26165) y se ha entrenado con aproximadamente 30 000 informes de lesiones graves de OSHA (2015-2025).

El modelo resuelve el problema de convertir narrativas no estructuradas en datos estructurados y accionables para análisis de riesgos, evitando clasificaciones subjetivas: la decisión de "alta energía" se toma en código comparando magnitud y unidad contra umbrales, no por el modelo. Su relevancia actual radica en la creciente demanda de automatización de informes de seguridad y en la tendencia de modelos pequeños y especializados que pueden desplegarse en entornos con recursos limitados. Arquitectura transformer densa de 1.7 mil millones de parámetros, con ventana de contexto heredada del base (no especificada en la ficha del modelo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 1 720 574 976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | bf16 (pesos finales); entrenado con QLoRA 4-bit NF4 |
| Idiomas soportados | ingles (narrativas de EE. UU.) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de **Qwen3-1.7B**, un transformer denso con atención causal estándar y tokenizer de Qwen. El fine-tuning se realizó con **QLoRA** en 4-bit NF4, fusionando los adaptadores al modelo base en bf16. El dataset de entrenamiento consiste en ~30 000 informes de lesiones graves de OSHA (2015-2025), que contienen narrativas de incidentes en sectores de petróleo, gas e industria. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con salidas JSON estrictas.

La innovación principal es el **formato de salida restringido**: el modelo genera únicamente un objeto JSON con campos predefinidos (`energy_type`, `magnitude`, `unit`, `evidence`, `injury_degree`), y los campos `evidence` son subcadenas literales del texto de entrada. Además, el modelo no emite clasificaciones de seguridad (como `high_energy`); esa decisión se delega a lógica externa, lo que reduce el riesgo de sesgo en la salida.

## Capacidades

- Extraccion de hechos estructurados de seguridad laboral: tipo de energia (gravedad, vehiculo en movimiento, electrica, presion, termica, quimica, otra, no indicada) y grado de lesion (fatal, grave, menor, ninguna, no indicado).
- Generacion de evidencia textual: los campos `evidence` son subcadenas literales extraidas de la narrativa de entrada, lo que facilita la auditoria y trazabilidad.
- Salida estrictamente JSON: el modelo no produce texto adicional, lo que simplifica la integracion en pipelines automaticos.
- Modo no-thinking: el prompt incluye un bloque ` thinking` vacio para desactivar el modo de razonamiento de Qwen3, garantizando respuestas rapidas y deterministas.
- Soporte de decodificacion greedy: se recomienda `do_sample=False` y `temperature=0` para extracciones reproducibles.
- No soporta tool calling ni funciones de agente: es un extractor especializado de una sola tarea.
- Multilingue: no, solo ingles y limitado al estilo de informes industriales de EE. UU.

## Casos de uso

- **Automatizacion de informes de incidentes de seguridad**: el modelo puede procesar narrativas de accidentes y generar automaticamente un JSON con los campos de energia y lesion, listo para insertar en una base de datos de cumplimiento. Su salida estricta elimina la necesidad de post-procesamiento.
- **Analisis de tendencias de lesiones**: al extraer sistematicamente `energy_type` y `injury_degree` de miles de informes, permite agregar estadisticas y detectar patrones de riesgo en plantas industriales.
- **Integracion en pipelines de NLP para HSE (Health, Safety, Environment)**: puede usarse como modulo de extraccion en un sistema mayor que clasifique la gravedad o genere alertas, ya que la decision de "alta energia" se toma en codigo.
- **Auditoria de cumplimiento normativo**: las evidencias literales permiten verificar que la extraccion se basa en el texto original, facilitando la revision por parte de inspectores de seguridad.
- **Enriquecimiento de bases de datos legacy**: convierte informes historicos en texto plano a un formato estructurado, habilitando busquedas y consultas SQL sobre datos de accidentes.
- **Despliegue en entornos con recursos limitados**: al ser un modelo de 1.7B, puede ejecutarse en una GPU consumer (por ejemplo, RTX 3060 con 12 GB) o incluso en CPU con cuantizacion, permitiendo su uso en plantas o instalaciones sin infraestructura de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1 ni comparaciones con otros modelos. Se desconoce el rendimiento cuantitativo en tareas de extraccion de informacion.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo en bf16 ocupa aproximadamente 3,4 GB de pesos. Con overhead de activaciones y KV cache, se recomienda al menos 6-8 GB de VRAM para secuencias de longitud moderada.
- **GPU recomendadas**: cualquier GPU con 8 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 4070, RTX 4090, o GPUs de datacenter como A10, A100, L4. Tambien puede ejecutarse en CPU con cuantizacion (por ejemplo, GGUF de 4 bits) con latencia mayor.
- **Compatibilidad con consumer GPU**: si, cabe en GPUs de gama media y alta. Con cuantizacion 4-bit (GPTQ, AWQ) puede caber en 4-5 GB de VRAM.
- **Opciones de despliegue**: transformers (Hugging Face), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta). El modelo es compatible con text-generation-inference segun las tags.
- **Latencia y throughput**: no disponibles. Como referencia, un modelo de 1.7B en una RTX 4090 puede generar decenas de tokens por segundo, pero no hay datos especificos.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de extraccion de informacion de seguridad. A continuacion se compara con el modelo base y con alternativas genericas de tamano similar, basandose en caracteristicas generales (no en rendimiento medido).

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,7B | 32K (segun documentacion de Qwen3) | Apache-2.0 | Generico, multilingue, con modo thinking |
| Nishant1600/qwen3-1_7b-scl-extractor | 1,7B | no disponible | Apache-2.0 | Extraccion de seguridad laboral (JSON) |
| Llama-3.2-1B | 1,2B | 128K | Llama 3.2 Community | Generico, multilingue |
| Phi-3-mini (3.8B) | 3,8B | 128K | MIT | Generico, razonamiento |

Nota: la comparacion es orientativa; no hay datos de rendimiento especificos para la tarea de extraccion de informacion de seguridad.

## Limitaciones y advertencias

- **Sesgo hacia la clase "serious"**: el dataset de OSHA contiene solo casos de lesiones graves, por lo que el modelo tiende a clasificar la mayoria de los incidentes como `serious`, incluso cuando la narrativa podria sugerir una gravedad menor.
- **Alcance limitado a ingles y estilo de informes de EE. UU.**: no funciona bien con narrativas en otros idiomas o con formatos de informes de otros paises o sectores.
- **Riesgo de alucinacion en campos de evidencia**: aunque se recomienda usar subcadenas literales, el modelo podria generar evidencia que no coincida exactamente con el texto original si la narrativa es ambigua o contiene errores.
- **No es un clasificador de seguridad**: el modelo no determina si un incidente es de "alta energia"; esa decision debe implementarse en codigo comparando magnitud y unidad contra umbrales definidos por el usuario.
- **Restricciones de uso**: la licencia Apache-2.0 permite uso comercial, pero el modelo no debe utilizarse como sustituto del juicio profesional en materia de seguridad laboral.
- **Dependencia del prompt**: el formato de salida JSON solo se garantiza si se utiliza el prompt exacto recomendado en la model card; variaciones pueden producir salidas no conformes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Nishant1600/qwen3-1_7b-scl-extractor)
- [Modelo base Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Repositorio oficial de Qwen3 (GitHub)](https://github.com/QwenLM/Qwen3)
- [Informe tecnico de Qwen3 (arXiv)](https://arxiv.org/abs/2505.09388)
- [Coleccion de modelos Qwen3 en Hugging Face](https://huggingface.co/collections/Qwen/qwen3)
