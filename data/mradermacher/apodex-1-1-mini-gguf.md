# mradermacher/Apodex-1.1-mini-GGUF

## Resumen

Apodex-1.1-mini es un modelo de lenguaje de 35.5 mil millones de parámetros desarrollado por Apodex, diseñado específicamente para tareas de razonamiento complejo y de largo horizonte en entornos de investigación y trabajo profesional. Según el paper arXiv 2608.23283, el sistema Apodex 1.1 separa estructuralmente el razonamiento (solver) de la verificación (verifier) para ofrecer resultados auditables y fiables, y la variante Mini conserva una capacidad de trabajo sólida en un formato desplegable localmente. El modelo está orientado a agentes, con soporte para interacción con archivos, datos, código y herramientas externas.

Esta ficha se centra en la versión cuantizada GGUF publicada por mradermacher, que facilita su ejecución en hardware de consumo y entornos de inferencia local. El modelo base es apodex/Apodex-1.1-mini, con licencia Apache 2.0 y soporte para inglés y chino. La cuantización incluye múltiples formatos GGUF (desde Q2_K hasta Q8_0) y además incorpora un componente multimodal (mmproj) que sugiere capacidades de entrada visual o de otro tipo, aunque no se detalla en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones), safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la informacion proporcionada. El modelo base es un transformer de 35,5 B de parametros, entrenado por Apodex para tareas de razonamiento y agente. El paper arXiv 2608.23283 describe un sistema que separa el razonamiento (solver) del verificador (verifier), lo que sugiere un entrenamiento orientado a la verificacion de pasos intermedios y a la generacion de resultados auditables. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La version cuantizada GGUF es una conversion estatica realizada por mradermacher, sin recalibracion con imatrix (segun la model card, los quants con imatrix no estan disponibles por el momento).

## Capacidades

- Razonamiento complejo y de largo horizonte para tareas de investigacion y trabajo profesional.
- Interaccion con archivos, datos, codigo y herramientas externas (tool calling).
- Soporte para agentes y ejecucion de tareas multi-paso con verificacion de resultados.
- Capacidades multilingues en ingles y chino.
- Componente multimodal (mmproj) que sugiere soporte para entrada de imagenes u otros modales, aunque no se detalla su alcance.
- Generacion de informes y busqueda de informacion, segun la descripcion del sistema Apodex.

## Casos de uso

- Investigacion cientifica asistida: el modelo puede realizar busquedas bibliograficas, resumir articulos y redactar secciones de informes, con verificacion de cada paso gracias a su arquitectura solver-verifier.
- Analisis financiero: procesamiento de grandes volumenes de datos numericos, generacion de informes de riesgo y deteccion de anomalias en series temporales, aprovechando su capacidad de razonamiento sobre datos estructurados.
- Generacion de codigo en produccion: integrado en pipelines de CI/CD, puede escribir, revisar y depurar codigo, ademas de interactuar con APIs y herramientas de desarrollo mediante tool calling.
- Automatizacion de tareas de oficina: gestion de documentos, extraccion de informacion de archivos y generacion de resumenes ejecutivos, con soporte para contextos largos (aunque la longitud exacta no se ha publicado).
- Asistente de investigacion de mercado: analisis de tendencias, compilacion de datos de multiples fuentes y elaboracion de informes comparativos, gracias a su capacidad de trabajar con datos y archivos.
- Agente autonomo para soporte tecnico: resolucion de incidencias complejas que requieren consultar documentacion, ejecutar comandos y verificar soluciones, en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper arXiv 2608.23283 menciona que Apodex 1.1 alcanza un rendimiento lider en tareas de trabajo profesional, finanzas, investigacion cientifica, matematicas, codificacion y busqueda, pero no se incluyen cifras concretas en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para un modelo de 35,5 B, en FP16 se necesitan ~71 GB; en Q8_0 ~35 GB; en Q4_K_M ~20 GB; en Q2_K ~12 GB (aproximaciones estandar).
- GPU recomendadas: para cuantizaciones Q4 o inferiores, una GPU de consumo con 24 GB (RTX 3090/4090) es suficiente. Para Q8 o FP16 se requieren GPUs profesionales (A100 40/80 GB, H100) o multiples GPUs.
- Es desplegable en hardware de consumo con cuantizacion Q4_K_M o inferior, siempre que se disponga de al menos 20 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-inference (TGI) y otros motores compatibles con GGUF.
- Latencia y throughput: no se han publicado datos especificos. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generacion de 20-40 tokens/s, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de tamano similar (por ejemplo, Qwen2.5-32B, Llama-3-35B o Mistral-8x22B). La informacion publica no incluye resultados de benchmarks estandarizados que permitan una comparacion objetiva. Se recomienda consultar el paper arXiv para obtener detalles adicionales cuando esten disponibles.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de seguridad especificas para este modelo.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de generacion de informes; la arquitectura solver-verifier puede mitigarlo, pero no eliminarlo.
- La longitud de contexto no se ha especificado, lo que limita la planificacion de despliegues que requieran ventanas largas.
- El soporte de idiomas se limita a ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribucion y de las patentes asociadas.
- La version GGUF es una cuantizacion estatica sin recalibracion con imatrix, lo que puede afectar ligeramente a la calidad de la salida en comparacion con el modelo original en FP16.
- El componente multimodal (mmproj) no esta documentado en detalle; su funcionamiento y requisitos adicionales son desconocidos.

## Enlaces

- Repositorio HuggingFace de la cuantizacion GGUF: https://huggingface.co/mradermacher/Apodex-1.1-mini-GGUF
- Modelo base en HuggingFace: https://huggingface.co/apodex/Apodex-1.1-mini
- Paper arXiv 2608.23283: https://arxiv.org/abs/2608.23283
- Pagina oficial de Apodex: https://www.apodex.com/ y https://www.apodex.ai/
