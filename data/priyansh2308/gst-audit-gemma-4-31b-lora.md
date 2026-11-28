# priyansh2308/gst-audit-gemma-4-31b-lora

## Resumen

El modelo `priyansh2308/gst-audit-gemma-4-31b-lora` es un adaptador LoRA (Low-Rank Adaptation) de PEFT entrenado sobre el modelo base `google/gemma-4-31B-it`. Lo desarrolla el usuario priyansh2308 en el contexto de la competición Adaption Adaptive Intelligence Challenge (Adaption x HackCulture). Su proposito es actuar como capa de extraccion neural dentro de un sistema de auditoria del Impuesto sobre Bienes y Servicios (GST) de la India: extrae facturas B2B, identifica el mecanismo de inversion del sujeto pasivo (reverse charge) y verifica el cumplimiento estatutario emitiendo JSON estricto conforme a las secciones 7, 8, 9, 10, 16 y 31 de la CGST Act y a la regla 46.

El adaptador se ha entrenado sobre 55.348 pares de facturas B2B indias, aumentadas y localizadas en seis idiomas vernaculos (hindi, kannada, telugu, gujarati, marathi y tamil) ademas del ingles. La arquitectura subyacente es la del modelo base Gemma 4 de 31.000 millones de parametros en su variante instruction-tuned; el adaptador en si es un LoRA de rango 32 sobre todas las matrices de proyeccion lineales, con un peso de repositorio de aproximadamente 1 GB.

Es relevante ahora porque aborda un nicho regulatorio muy concreto (cumplimiento del GST indio) con un formato de salida estructurado y verificable, y porque demuestra un flujo de ajuste fino asistido por barrido bayesiano de hiperparametros sobre un cluster de 8 GPU H100. No obstante, el modelo es muy reciente (28 de noviembre de 2026), sin descargas registradas y con un unico "me gusta", por lo que su validacion independiente es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma 4); adaptador LoRA de PEFT |
| Parametros totales | 31.000 millones (modelo base); el adaptador LoRA no declara su numero de parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, kn, te, gu, mr, ta |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA (r) | 32 |
| Alpha LoRA | 64 |
| Modulos objetivo | todas las matrices de proyeccion lineales (all-linear) |
| Framework de entrenamiento | Adaption AutoScientist (barrido bayesiano de hiperparametros sobre 8x H100) |
| Filas de entrenamiento | 55.348 pares de facturas B2B |
| Tamano del repositorio | 1.0 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-31B-it`, un transformer decoder-only de 31.000 millones de parametros. El ajuste fino emplea LoRA con rango 32 y alpha 64 sobre todas las matrices de proyeccion lineales del modelo base, lo que permite adaptar la totalidad de las capas de atencion y de las capas feed-forward sin reentrenar los pesos originales.

El entrenamiento se realizo con la herramienta Adaption AutoScientist, que ejecuto un barrido bayesiano de hiperparametros sobre un cluster de 8 GPU H100. El conjunto de datos consta de 55.348 pares de facturas B2B estatutarias indias, aumentadas y localizadas en seis idiomas vernaculos. La model card reporta un "win rate" frente al modelo base del 36,55 %, metrica que no se define con precision (no se especifica el criterio de comparacion ni el evaluador). No se detalla la composicion exacta del dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO; la model card solo menciona el ajuste supervisado implicito en el formato de pares factura-extraccion.

## Capacidades

- Extraccion estructurada de facturas B2B indias con salida en JSON estricto conforme a un esquema estatutario.
- Identificacion del mecanismo de reverse charge (inversion del sujeto pasivo) en las facturas.
- Verificacion de cumplimiento contra las secciones 7, 8, 9, 10, 16 y 31 de la CGST Act y la regla 46.
- Generacion de texto conversacional heredada del modelo base instruction-tuned.
- Soporte multilingue en ingles, hindi, kannada, telugu, gujarati, marathi y tamil.
- Integracion como capa de extraccion neural dentro de un sistema de auditoria (Sovereign GST Audit System).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada (el modelo base es `-it`, sin indicacion de capacidades multimodales en la model card).

## Casos de uso

- Extraccion automatizada de facturas B2B: el adaptador convierte el texto de una factura en JSON conforme al esquema CGST, lo que permite alimentar sistemas de contabilidad sin intervencion manual. Es adecuado porque se ha entrenado especificamente sobre 55.348 pares factura-extraccion.
- Auditoria de cumplimiento del GST: el modelo verifica si una factura cumple las secciones 7 a 31 de la CGST Act y la regla 46, generando un dictamen estructurado que un auditor humano puede revisar.
- Deteccion de reverse charge: identifica en la factura si aplica la inversion del sujeto pasivo, un punto critico en la liquidacion del impuesto para operaciones B2B con proveedores no residentes o categorias especificas.
- Procesamiento multilingue de facturas regionales: al cubrir hindi, kannada, telugu, gujarati, marathi y tamil, permite procesar facturas emitidas en idiomas vernaculos sin traducirlas previamente.
- Integracion en pipelines de contabilidad: la salida JSON estricta facilita el encaje en sistemas ERP y flujos de validacion automatizada, reduciendo el trabajo de normalizacion posterior.
- Prototipado de asistentes fiscales: sobre el modelo base instruction-tuned, el adaptador puede emplearse en un chatbot que responda consultas sobre cumplimiento del GST citando la seccion aplicable.
- Investigacion en IA juridica y fiscal: sirve como punto de partida para estudiar el ajuste fino de modelos grandes sobre dominios regulatorios con salida estructurada.

## Benchmarks y rendimiento

La unica metrica reportada en la model card es el "Win Rate vs Base" del 36,55 %, sin definicion del criterio de evaluacion ni del conjunto de prueba. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Valor | Notas |
|---|---|---|
| Win Rate vs Base | 36,55 % | Metrica no definida en la model card; no se especifica evaluador ni conjunto de prueba |
| MMLU | no disponible | |
| HumanEval | no disponible | |
| GSM8K | no disponible | |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo base de 31.000 millones de parametros en precision de 16 bits requiere del orden de 62 GB solo para los pesos, a lo que hay que sumar el coste de la cache KV; en cuantizacion de 4 bits se situaria en torno a 16-20 GB, aunque estos calculos no los confirma el autor.
- GPU recomendadas: el autor reporta entrenamiento sobre 8x H100; para inferencia no se indica hardware concreto.
- Compatibilidad con GPU de consumo: no confirmada. Un modelo de 31.000 millones de parametros no cabe en GPU de consumo de 8-16 GB sin cuantizacion agresiva; en tarjetas de 24 GB (RTX 3090/4090) solo seria viable con cuantizacion de 4 bits, extremo no verificado por el autor.
- Opciones de despliegue: el adaptador es PEFT/LoRA en safetensors, por lo que requiere cargar el modelo base `google/gemma-4-31B-it` y aplicar el adaptador. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni se proporcionan pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de este adaptador frente a alternativas. A continuacion se comparan caracteristicas estructurales con otros enfoques de extraccion de facturas y ajuste fino sobre modelos grandes.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gst-audit-gemma-4-31b-lora (este) | 31B (base) + LoRA r=32 | no disponible | LoRA sobre Gemma 4 para GST indio | apache-2.0 | Hugging Face, 0 descargas |
| google/gemma-4-31B-it (base) | 31B | no disponible | Modelo general instruction-tuned | licencia Gemma (no verificada aqui) | Hugging Face |
| Adaptadores LoRA de dominio fiscal genericos | variable | variable | Ajuste fino sobre dominios regulatorios | variable | variable |
| Modelos OCR/extraccion de documentos especializados | variable | variable | Extraccion de campos de documentos | variable | variable |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados de este adaptador ni de alternativas equivalentes en el nicho del GST indio.

## Limitaciones y advertencias

- Ausencia de validacion independiente: el repositorio tiene 0 descargas y 1 "me gusta", y la unica metrica reportada (36,55 % de win rate) carece de definicion metodologica.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar campos, importes o referencias normativas en la salida JSON; se requiere validacion determinista del esquema y de los valores extraidos antes de usarla en produccion.
- Ambito muy restringido: el adaptador esta especializado en facturas B2B indias y normativa CGST; su uso fuera de ese dominio degradara la calidad de forma previsible.
- Cobertura idiomatica limitada a siete idiomas (ingles y seis vernaculos indios); no se ha evaluado su comportamiento en castellano ni en otras lenguas.
- Falta de informacion sobre el contexto maximo, la cuantizacion y el hardware de inferencia, lo que dificulta planificar un despliegue.
- Sesgos desconocidos: no se documenta la composicion del dataset ni posibles sesgos en la seleccion de facturas, sectores o regiones.
- Licencia apache-2.0 declarada por el autor, pero el modelo base Gemma 4 puede tener su propia licencia con restricciones adicionales; conviene verificar la compatibilidad antes de un uso comercial.
- La model card no describe el proceso de evaluacion ni el conjunto de validacion, por lo que no es posible reproducir el resultado del 36,55 %.
- Fecha de creacion muy reciente (28 de noviembre de 2026) y actualizacion el mismo dia: el modelo puede estar en fase de prototipo.

## Enlaces

- Hugging Face: https://huggingface.co/priyansh2308/gst-audit-gemma-4-31b-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Adaption Adaptive Intelligence Challenge (Adaption x HackCulture): no disponible enlace directo en la informacion proporcionada.
- Paper o blog del adaptador: no disponible.
- Repositorio de codigo: no disponible.
