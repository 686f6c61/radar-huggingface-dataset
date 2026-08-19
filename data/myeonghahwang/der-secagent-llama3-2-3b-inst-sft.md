# MyeongHaHwang/DER-SecAgent-LLama3.2-3B-Inst-SFT

## Resumen

DER-SecAgent-LLama3.2-3B-Inst-SFT es un adaptador LoRA (Low-Rank Adaptation) desarrollado por MyeongHa Hwang en el Instituto de Investigación de KEPCO (KEPRI), especializado en ciberseguridad de Recursos Energéticos Distribuidos (DER) y sistemas OT/ICS/SCADA del sector eléctrico. El modelo se construye sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct`, un LLM decoder-only de 3.000 millones de parámetros, y se publica bajo licencia Apache 2.0 (con herencia de la Llama 3.2 Community License).

Su propósito es servir como copiloto para ingenieros de seguridad e investigadores, ayudando en la evaluación de riesgos, análisis de amenazas, redacción de informes y elaboración de checklists en el ámbito de los sistemas de energía distribuida. No está pensado como controlador autónomo de infraestructuras críticas, sino como asistente de generación de texto con conocimiento especializado. La relevancia actual radica en la creciente exposición de los sistemas DER a ciberataques y la necesidad de herramientas de apoyo que integren conocimiento técnico específico del sector.

El adaptador se distribuye en formato safetensors y requiere ser cargado junto al modelo base. Su tamaño es de aproximadamente 0,8 GB, y su uso está limitado al idioma inglés. La ficha técnica no incluye datos de entrenamiento ni benchmarks publicados, por lo que la evaluación debe basarse en pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama 3.2 3B Instruct (decoder-only, text-only) |
| Parametros totales | 3.000 millones (modelo base) + adaptador LoRA (tamano no publicado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la ficha; el modelo base Llama 3.2 3B Instruct admite hasta 128.000 tokens |
| Tipos de cuantizacion | No especificados; el adaptador se usa en bfloat16, el base puede cuantizarse (p. ej. GGUF) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 (etiqueta) / Llama 3.2 Community License (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo `meta-llama/Llama-3.2-3B-Instruct`. La arquitectura del base es un transformer decoder-only con 3.000 millones de parametros, entrenado con instrucciones y optimizado para tareas de generacion de texto en ingles. El adaptador se entrena mediante Supervised Fine-Tuning (SFT) sobre pares instruccion-respuesta especificos del dominio de la ciberseguridad en DER y OT/ICS.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens ni el proceso de ajuste (no se menciona RLHF ni DPO). El adaptador se distribuye en formato PEFT, por lo que debe combinarse con el modelo base para su uso. La tecnica LoRA permite una actualizacion eficiente de los pesos sin modificar la totalidad del modelo, lo que reduce costes de almacenamiento y computo.

## Capacidades

- Generacion de texto especializada en ciberseguridad de recursos energeticos distribuidos (DER), incluyendo paneles solares, sistemas de almacenamiento de energia (ESS), inversores, cargadores de vehiculos electricos, pasarelas y sistemas EMS/DERMS.
- Analisis de riesgos y mitigaciones para arquitecturas OT/ICS y SCADA, incluyendo segmentacion de red, diseno de DMZ y recomendaciones de firewall.
- Redaccion de checklists de seguridad (cuentas, puertos, servicios, logging, parches) y resumen de documentos normativos.
- Asistencia en la elaboracion de informes de evaluacion de seguridad, memorandos y esqueletos de planes de accion.
- Integracion como agente de reporte/analisis dentro de frameworks multi-agente (p. ej., LangGraph) para orquestacion de seguridad.
- Soporte de conversacion multi-turno y uso de plantillas de chat del modelo base (system/user/assistant).
- No se especifica soporte nativo de tool calling o function calling; sin embargo, al ser un modelo de texto generico, puede integrarse con herramientas externas mediante prompts.

## Casos de uso

- **Asesoria en seguridad de inversores solares**: el modelo puede explicar riesgos y mitigaciones cuando un inversor expone Modbus TCP directamente a internet, como aislamiento de red, uso de VPN y segmentacion de OT.
- **Redaccion de checklists de auditoria**: permite generar listas de verificacion de configuracion segura (cuentas, puertos, servicios, logging) para instalaciones DER, ahorrando tiempo a los auditores.
- **Analisis de amenazas para arquitecturas DER**: dada una descripcion de arquitectura, el modelo sugiere posibles vectores de ataque y contramedidas, apoyando la toma de decisiones de diseno.
- **Generacion de informes de evaluacion de seguridad**: a partir de notas o datos tecnicos, produce resumenes estructurados con hallazgos y recomendaciones, listos para revision humana.
- **Integracion en sistemas multi-agente**: dentro del framework DER-SecAgent (LangGraph), el adaptador actua como agente de redaccion de informes y analisis, complementando otros agentes de deteccion o respuesta.
- **Formacion y documentacion interna**: sirve para generar material formativo sobre seguridad en DER para ingenieros nuevos, siempre con supervisio de un experto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador. La evaluacion del rendimiento debe realizarse mediante pruebas especificas en el dominio de ciberseguridad DER.

## Requisitos de hardware

- **VRAM estimada**: el modelo base de 3B parametros en bf16 ocupa aproximadamente 6 GB de VRAM. Con el adaptador LoRA (0,8 GB) el total no supera los 7 GB en inferencia. Con cuantizacion de 8 bits (GGUF) puede reducirse a unos 4 GB, y a 2-3 GB con cuantizacion de 4 bits.
- **GPU recomendadas**: puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB). En entornos profesionales, una A100 (40 GB) o H100 (80 GB) permite mayor velocidad y lotes grandes.
- **Compatibilidad con consumer GPU**: si, cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo base en bf16, y con cuantizacion puede bajar a 4 GB.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft`, o exportar a formato GGUF para usar con `llama.cpp` u Ollama. Tambien es compatible con vLLM y TGI, aunque requiere fusionar el adaptador en el base.
- **Latencia y throughput**: no se dispone de datos oficiales. En una RTX 4090, la generacion de tokens puede ser de decenas de tokens por segundo, dependiendo del tamaño de contexto.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos especificos de ciberseguridad para DER. Como referencia, se puede comparar con el modelo base `meta-llama/Llama-3.2-3B-Instruct` (sin adaptador) y con otros LLMs genericos de 3B como `Qwen2.5-3B-Instruct` o `Gemma-2-2B`. Sin embargo, no hay datos de rendimiento del adaptador en tareas de seguridad.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| DER-SecAgent-LLama3.2-3B-Inst-SFT | 3B + LoRA | 128k (base) | Ciberseguridad DER/OT | Apache 2.0 / Llama 3.2 |
| Llama-3.2-3B-Instruct | 3B | 128k | General | Llama 3.2 Community |
| Qwen2.5-3B-Instruct | 3B | 128k | General | Apache 2.0 |

La ventaja del adaptador es su especializacion en un dominio estrecho, pero carece de datos comparativos que demuestren una mejora medible sobre el base.

## Limitaciones y advertencias

- **Alucinaciones**: el modelo puede inventar identificadores de normas, valores de configuracion o recomendaciones que parecen plausibles pero que no estan en ningun documento de referencia. Es imprescindible contrastar los datos con fuentes originales.
- **Obsolescencia**: no refleja de forma fiable las ultimas vulnerabilidades, parches o cambios normativos. La informacion puede estar desactualizada.
- **No apto para decisiones regulatorias**: no debe utilizarse para tomar decisiones finales de cumplimiento o legales, ya que no sustituye a un asesor juridico o a la interpretacion formal de normas como NERC CIP, NIS2 u otras.
- **Alcance limitado**: optimizado para DER y sistemas de energia; su rendimiento en seguridad IT general o en otros sectores es limitado.
- **Restricciones de uso**: no debe usarse para generar codigo de explotacion, malware o instrucciones detalladas de ataque contra sistemas reales. Tampoco para realizar pruebas de penetracion sin autorizacion.
- **Uso en produccion**: en entornos semi-automatizados, debe colocarse detras de politicas de control, filtros basados en reglas y flujos de aprobacion humana.

## Enlaces

- [Hugging Face - DER-SecAgent-LLama3.2-3B-Inst-SFT](https://huggingface.co/MyeongHaHwang/DER-SecAgent-LLama3.2-3B-Inst-SFT)
- [GitHub - KEPSOAR/DER-SecAgent](https://github.com/KEPSOAR/DER-SecAgent)
- [Modelo base: meta-llama/Llama-3.2-3B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-3B)
