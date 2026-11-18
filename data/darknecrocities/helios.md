# Darknecrocities/Helios

## Resumen

Helios es una familia de modelos de lenguaje de pesos abiertos desarrollada por Arron Kian Parejas (bajo el identificador Darknecrocities en Hugging Face). El repositorio aloja la variante Flagship, un modelo de 5.802.037.248 parametros (5,80B) que constituye el escalon superior de una familia de seis tamanos que va desde 17,84M hasta los 5,80B parametros. El proyecto se presenta como un ecosistema modular orientado a despliegue local, razonamiento estructurado, soporte multimodal (imagen + texto + herramientas) y llamada a funciones nativa mediante MCP.

La propuesta tecnica del autor gira en torno a tres ideas declaradas en la model card: Hierarchical Memory Architecture (HMA), semantic grounding y epistemic fallback. La familia se distribuye en formatos tflite, onnx, safetensors y GGUF, y esta pensada para ejecutarse con Ollama a traves de una API HTTP local en el puerto 11434. El contexto documentado para la variante Flagship es de 128K tokens, el mayor de la familia.

Es relevante ahora porque ocupa un nicho de modelos de ~6B con contexto largo, capacidades multimodales y tool calling bajo licencia Apache 2.0, un perfil poco frecuente en ese rango de tamano. No obstante, la documentacion publica es escasa en cuanto a datos de entrenamiento, benchmarks y detalles de arquitectura, lo que limita la evaluacion rigurosa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card menciona "modular architecture" y "Hierarchical Memory Architecture", sin detalle tecnico) |
| Parametros totales | 5.802.037.248 (5,80B) |
| Parametros activos | No aplica (no se declara como MoE) |
| Longitud de contexto | 128K tokens (segun model card para la variante Flagship) |
| Tipos de cuantizacion | No disponible (el repo incluye safetensors, ONNX, TFLite y GGUF/Ollama, pero no se detallan los niveles) |
| Idiomas soportados | Ingles y filipino/tagalog (declarado); el campo `language` de la model card solo indica `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, TFLite, GGUF (via Ollama) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna mas alla de referencias a un diseno "modular" y a la llamada Hierarchical Memory Architecture (HMA), descrita como un enfoque orientado a memoria para organizar y recuperar informacion relevante. No se especifica si se trata de un transformer denso convencional, de una variante con atencion lineal, de un hibrido o de un diseno con capas de memoria externa. Tampoco se publican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones.

Las innovaciones declaradas por el autor son semantic grounding (mejora de la relacion entre pregunta, conocimiento disponible y respuesta generada), epistemic fallback (mecanismo explicito de repliegue cuando la pregunta cae fuera del conocimiento del modelo), soporte de razonamiento matematico y cientifico-medico, asistencia a programacion, interaccion bilingue ingles/tagalog y tool calling nativo mediante MCP. No se aportan detalles de implementacion ni resultados que cuantifiquen estas capacidades.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento matematico y resolucion estructurada de problemas (declarado para los niveles Beta en adelante).
- Conocimiento cientifico y medico orientado a question answering (declarado).
- Asistencia a programacion y generacion de codigo (declarado para Core, Pro y Flagship).
- Multimodalidad imagen + texto en las variantes Core, Pro y Flagship.
- Tool calling / function calling nativo mediante MCP en todos los niveles de la familia.
- Interaccion bilingue ingles y filipino/tagalog.
- Epistemic fallback: mecanismo declarado para reconocer temas fuera de su conocimiento.
- Despliegue local via Ollama con API HTTP en `http://localhost:11434`.

## Casos de uso

- Asistencia conversacional local en escritorio: el modelo puede ejecutarse con Ollama y servirse mediante la API local en el puerto 11434, lo que permite integrarlo en aplicaciones de escritorio sin dependencia de la nube.
- Analisis de documentos largos: con 128K tokens de contexto declarados, es adecuado para resumir o extraer informacion de contratos, informes o expedientes que superen la ventana tipica de modelos de 6B.
- Automatizacion con herramientas: gracias al soporte MCP, puede conectarse a funciones externas (consultas a bases de datos, APIs internas, ejecucion de scripts) en flujos de agentes de un solo paso o multi-paso.
- Soporte a programacion en entornos con restricciones de red: al ser desplegable localmente, sirve como asistente de codigo en equipos donde no se permite enviar codigo a servicios externos.
- Atencion al cliente bilingue ingles/tagalog: el soporte declarado de ambos idiomas lo hace util para mercados concretos (por ejemplo, centros de contacto en Filipinas) con despliegue on-premise.
- Experimentacion multimodal ligera: la variante Flagship admite entrada de imagen y texto, lo que permite prototipos de descripcion de imagenes o VQA en hardware de consumo.
- Investigacion sobre memoria y grounding: la HMA y el epistemic fallback son mecanismos declarados que pueden servir como objeto de estudio o comparacion en trabajos academicos sobre recuperacion y calibracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16) del Flagship de 5,80B: aproximadamente 12 GB solo para pesos, mas overhead de contexto, lo que situa el requisito practico por encima de 14-16 GB para contextos moderados.
- En cuantizacion de 8 bits: en torno a 6-7 GB de pesos; en 4 bits: en torno a 3,5-4 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB). Para cuantizaciones de 4-8 bits, tarjetas de 8-12 GB como RTX 3060/4060 Ti o RTX 3080 pueden ser suficientes.
- Cabe en GPU de consumo en cuantizacion de 4 bits; en FP16 requiere tarjetas de gama alta con 16 GB o mas.
- Opciones de despliegue: Ollama (soporte oficial declarado, tag `parejasarronkian/Helios:flagship`), y por formato de pesos tambien llama.cpp/GGUF, ONNX Runtime y TFLite. No se documenta soporte explicito de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Tool calling | Licencia |
|---|---|---|---|---|---|
| Helios Flagship | 5,80B | 128K | Si (imagen + texto) | Si (MCP) | Apache 2.0 |
| Qwen2.5-7B-Instruct | 7,6B | 128K | No | Si | Apache 2.0 |
| Llama 3.1 8B Instruct | 8,0B | 128K | No | Si | Llama 3.1 Community License |
| Gemma 2 9B | 9,2B | 8K | No | Parcial | Gemma Terms of Use |

La comparativa se limita a parametros, contexto y licencia, ya que no hay benchmarks publicados de Helios que permitan contrastar rendimiento. Frente a alternativas consolidadas de 7-9B, Helios Flagship ofrece un tamano menor con contexto de 128K y soporte multimodal declarado, pero carece de la documentacion y validacion externa de las otras familias.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni otros conjuntos estandar.
- Documentacion tecnica muy escasa: no se detallan arquitectura, datos de entrenamiento, proceso de alineacion ni hiperparametros, lo que dificulta la reproducibilidad.
- Discrepancia en el campo de idiomas: la model card declara soporte bilingue ingles/filipino, pero el metadato `language` solo indica `en`.
- Riesgo de alucinacion no cuantificado; el mecanismo de epistemic fallback esta declarado pero no se documenta su tasa de activacion ni su fiabilidad.
- El proyecto se describe como "activamente en evolucion", lo que implica que la API, los pesos y el comportamiento pueden cambiar sin aviso.
- Las cifras de tamano y contexto de la tabla de la familia ("~5.5 GB" para Core, Pro y Flagship) son inconsistentes con el tamano real del repo (38,4 GB) y con el numero de parametros; conviene verificar los artefactos antes de desplegar.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la falta de evaluacion independiente hace recomendable una validacion propia antes de llevarlo a produccion.
- El soporte de despliegue documentado se centra en Ollama; no hay guias para vLLM, TGI u otros servidores de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Darknecrocities/Helios
- Repositorio GitHub: https://github.com/darknecrocities/Helios
- Notebook de Colab: https://colab.research.google.com/github/darknecrocities/Helios/blob/pretrained/notebooks/helios_colab_pipeline.ipynb
- Ollama (modelo): https://ollama.com/parejasarronkian/Helios
- Ollama (descarga): https://ollama.com/download
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- PyTorch: https://pytorch.org
