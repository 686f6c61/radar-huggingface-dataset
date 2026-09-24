# Offlin33er/qwen25-coder-7b-solidity-audit-v3

## Resumen

Offlin33er/qwen25-coder-7b-solidity-audit-v3 es un ajuste fino (fine-tune) supervisado del modelo Qwen/Qwen2.5-Coder-7B-Instruct, publicado por el usuario Offlin33er en HuggingFace. Por el nombre del repositorio, el ajuste esta orientado a tareas de auditoria de contratos inteligentes en Solidity, aunque la model card no documenta ni el conjunto de datos ni los hiperparametros de entrenamiento empleados. Se trata, por tanto, de un modelo de 7,6 mil millones de parametros (heredados del modelo base) especializado sobre un dominio muy concreto del desarrollo blockchain.

El entrenamiento se realizo con SFT (supervised fine-tuning) mediante la libreria TRL, en el marco de trabajos ejecutados con hf_jobs, segun las etiquetas y metadatos del repositorio. La model card es practicamente una plantilla autogenerada: no incluye descripcion del dataset, numero de tokens, composicion de datos, ni resultados de evaluacion. El ejemplo de uso rapido que aparece en la tarjeta es una pregunta generica sobre viajes en el tiempo, sin ninguna relacion con Solidity, lo que refuerza la idea de que la documentacion no se ha personalizado.

Su relevancia actual es limitada pero concreta: si el ajuste funciona, cubriria una necesidad real (revision automatica de contratos antes de una auditoria profesional) en un nicho donde escasean los modelos abiertos especializados. No obstante, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin benchmarks publicados, debe considerarse un modelo experimental no validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con Grouped-Query Attention, heredada de Qwen2.5-Coder-7B-Instruct (no confirmada de forma explicita en la ficha del autor) |
| Parametros totales | 7,6 mil millones (heredados del modelo base; no confirmado en la ficha) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | no disponible para este repositorio (solo pesos safetensors); el modelo base cuenta con cuantizaciones GGUF, AWQ y GPTQ de terceros |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo de la model card contiene el texto generico "licence: license"); el modelo base se publica bajo Apache-2.0 |
| Formato de pesos | safetensors (segun las etiquetas del repositorio) |
| Libreria | transformers |
| Tamano del repositorio | 0,2 GB |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Metodo de entrenamiento | SFT con TRL (tag sft, generated_from_trainer, hf_jobs) |
| Fecha de creacion indicada | 2026-09-23 |
| Fecha de actualizacion indicada | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso de aproximadamente 7,6 mil millones de parametros, con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings RoPE. El modelo base fue preentrenado por Alibaba Qwen sobre un corpus de 5,5 billones de tokens con enfasis en codigo, y posteriormente alineado mediante instrucciones. El ajuste aqui descrito no modifica la arquitectura: unicamente actualiza los pesos mediante SFT.

Respecto al entrenamiento, la unica informacion disponible es que se utilizo SFT con TRL (version 1.13.0), Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2, y que el trabajo se ejecuto como hf_jobs. No se especifican el dataset, el numero de ejemplos, el numero de tokens vistos, la longitud de secuencia, la tasa de aprendizaje, el numero de epocas ni si hubo una fase posterior de DPO o RLHF. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras). El sufijo "v3" del nombre sugiere dos iteraciones anteriores del mismo autor, pero no hay enlaces ni referencias a ellas en la informacion disponible.

Un aspecto tecnico llamativo es el tamano del repositorio: 0,2 GB. Un checkpoint completo de 7,6 mil millones de parametros en bf16 o fp16 ocupa del orden de 15 GB, y una version cuantizada a 4 bits ronda los 4-5 GB. Ese tamano es mas coherente con un adaptador LoRA, con pesos parciales o con una subida incompleta, aunque las etiquetas del repositorio no incluyen peft ni lora. Conviene verificar el contenido real del repositorio antes de intentar cargarlo.

## Capacidades

Las siguientes capacidades se atribuyen por herencia del modelo base. La model card del ajuste no documenta ninguna de ellas de forma explicita, por lo que deben considerarse no verificadas para esta version concreta:

- Generacion y completado de codigo en mas de 90 lenguajes de programacion, con especial enfasis en lenguajes de la familia C y en Solidity por el ajuste especifico.
- Razonamiento sobre codigo: explicacion de fragmentos, deteccion de patrones problematicos, refactorizacion y correccion de errores.
- Generacion de tests, incluidos tests de contratos inteligentes (por ejemplo, suites en Foundry o Hardhat), siempre que el ajuste haya conservado esta capacidad.
- Soporte de tool calling y function calling, presente en el modelo base Qwen2.5-Coder-Instruct mediante plantillas tipo Hermes.
- Razonamiento multi-paso y uso en flujos de agente, con contexto largo (hasta 32.768 tokens nativos en el modelo base) para procesar varios ficheros de un proyecto.
- Capacidades multilingues: no disponibles ni confirmadas para este ajuste; el modelo base esta orientado principalmente a ingles y chino.
- Capacidad especial esperada: analisis de seguridad de contratos Solidity (reentrancy, control de acceso, desbordamientos, dependencias de oraculos, manipulacion de precios, etc.), deducida unicamente del nombre del modelo y no documentada.

No hay evidencia publicada de modo "thinking", capacidades de vision, audio ni decodificacion especulativa en este repositorio.

## Casos de uso

- Pre-auditoria de contratos inteligentes: el modelo puede recibir el codigo fuente de un contrato y devolver una lista de posibles vulnerabilidades antes de que un auditor humano revise el codigo, reduciendo el tiempo de la primera pasada. Es adecuado por su ajuste especifico sobre Solidity, pero sus hallazgos deben validarse siempre manualmente.
- Revision automatizada en pipelines de CI/CD: integrado como paso previo a la fusion de una pull request, el modelo puede comentar los cambios de codigo Solidity y bloquear merges ante patrones de riesgo conocidos. Requiere un contenedor de inferencia con GPU o CPU capaz de servir 7,6 mil millones de parametros.
- Generacion de pruebas unitarias para contratos: a partir de un contrato existente, el modelo puede producir esqueletos de tests (Foundry, Hardhat, Truffle) que cubran rutas de exito y de fallo, acelerando la cobertura inicial.
- Asistente de desarrollo en el IDE: integrado mediante una extension tipo Continue o similar, puede explicar funciones, sugerir modificaciones y resolver dudas sobre patrones como proxies upgradeables, permitiendo contexto multiarchivo con decenas de miles de tokens.
- Formacion de auditores junior: el modelo puede generar explicaciones didacticas de vulnerabilidades clasicas (SWC-107 reentrancy, SWC-105 control de acceso, etc.) sobre ejemplos de codigo, sirviendo como material de estudio supervisado.
- Triaje y clasificacion de hallazgos: dado un informe de auditoria o un conjunto de alertas de herramientas estaticas como Slither, el modelo puede agruparlas, priorizarlas y redactar descripciones; es un uso de post-procesamiento donde los errores son menos criticos que en la deteccion.
- Generacion de pruebas de concepto de exploits en entornos de laboratorio: con fines exclusivamente defensivos y en redes de prueba, puede ayudar a redactar PoCs que demuestren la explotabilidad de un fallo antes de corregirlo.
- Documentacion tecnica de contratos: generacion de comentarios NatSpec y de documentacion de interfaces a partir del codigo, tarea de bajo riesgo donde el coste de un error es bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion (MMLU, HumanEval, MBPP, GSM8K, SWE-bench ni metricas especificas de auditoria como precision en deteccion de vulnerabilidades). Tampoco hay evaluaciones de terceros, dado que el modelo registra 0 descargas y 0 likes.

Para contextualizar, el modelo base Qwen2.5-Coder-7B-Instruct si dispone de resultados publicos en la tarjeta oficial de Qwen, pero no se reproducen aqui porque no han sido verificados para este ajuste y no forman parte de la informacion proporcionada.

## Requisitos de hardware

Estimaciones orientativas basadas en el tamano del modelo base (7,6 mil millones de parametros densos); no hay mediciones publicadas para este repositorio:

- VRAM para inferencia: aproximadamente 15-16 GB en bf16/fp16, 8-9 GB en cuantizacion de 8 bits y 4,5-6 GB en cuantizacion de 4 bits.
- GPU de datacenter recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB o A10G 24 GB, todas suficientes en bf16. Una A100 o H100 permite servir varias peticiones concurrentes con contexto largo.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (24 GB o mas) en bf16 con contexto moderado; en tarjetas de 8-12 GB (RTX 3060, RTX 4060, RTX 4070) solo en cuantizacion de 4 bits, algo que este repositorio no proporciona y habria que generar.
- Opciones de despliegue: transformers (carga directa), vLLM, TGI, SGLang y llama.cpp/Ollama si se generan pesos GGUF a partir de los safetensors. Al no haber versiones GGUF publicadas, el despliegue en CPU exige una conversion previa.
- Latencia y throughput: no disponibles. Como referencia no medida, un modelo denso de 7,6 mil millones de parametros en bf16 sobre una A100 suele situarse en el orden de decenas de tokens por segundo por peticion y varios cientos agregados con batching continuo, pero estas cifras dependen del hardware, de la herramienta de servicio y de la longitud de contexto, y no deben tomarse como datos de este modelo.
- Advertencia de despliegue: dado que el repositorio ocupa 0,2 GB, es probable que no contenga un checkpoint completo. Antes de planificar infraestructura hay que confirmar que los pesos cargan correctamente con `AutoModelForCausalLM.from_pretrained`.

## Comparativa con modelos similares

Los datos estructurales de los modelos comparados proceden de sus tarjetas publicas y no han sido verificados dentro de la informacion proporcionada para este ajuste; la columna de rendimiento en auditoria no esta disponible para ninguno de ellos.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Benchmark de auditoria |
|---|---|---|---|---|---|
| qwen25-coder-7b-solidity-audit-v3 | 7,6 mil millones (heredados) | no disponible; base con 32.768 tokens | Ajuste SFT sobre Solidity y auditoria | no disponible | no disponible |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 mil millones | 32.768 tokens (131.072 con YaRN) | Codigo general | Apache-2.0 | no disponible |
| CodeLlama-7B-Instruct | 6,7 mil millones | 16.384 tokens | Codigo general | Licencia comunitaria de Llama 2 | no disponible |
| DeepSeek-Coder-V2-Lite-Instruct | 16 mil millones totales, 2,4 mil millones activos (MoE) | 128.000 tokens | Codigo general | Licencia propia de DeepSeek | no disponible |
| Llama-3.1-8B-Instruct | 8 mil millones | 128.000 tokens | Proposito general | Licencia comunitaria de Llama 3.1 | no disponible |

Frente al modelo base, este ajuste solo aporta potencial especializacion en Solidity, a cambio de perder trazabilidad (sin dataset documentado), soporte de la comunidad (0 descargas) y claridad de licencia. Frente a herramientas deterministas de analisis estatico como Slither o Mythril, que no son modelos de lenguaje, la comparacion no es directa: aquellas ofrecen deteccion reproducible de patrones conocidos, mientras que un LLM aporta explicaciones en lenguaje natural y deteccion de patrones novedosos, con mayor tasa de falsos positivos y falsos negativos.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no describe el dataset de entrenamiento, su procedencia, su licencia ni su tamano. No es posible evaluar si hubo contaminacion de datos ni si el ajuste cubre las vulnerabilidades relevantes.
- Licencia indefinida: el campo de licencia contiene el texto generico "licence: license". Sin una licencia explicita, el uso comercial es juridicamente arriesgado, aunque el modelo base sea Apache-2.0. Hay que contactar con el autor o asumir la licencia del modelo base con cautela.
- Riesgo de falso negativo en seguridad: el escenario mas peligroso de un modelo de auditoria es declarar seguro un contrato vulnerable. Cualquier salida debe ser validada por un auditor humano y por herramientas deterministas antes de desplegar en mainnet.
- Alucinacion de APIs, firmas de funciones y referencias normativas: es habitual en modelos de codigo y puede producir recomendaciones que no compilan o que citan estandares inexistentes.
- Sin benchmarks ni evaluacion independiente: no hay ninguna evidencia publica de mejora frente al modelo base en tareas de auditoria. El nombre del repositorio no es prueba de calidad.
- Tamano del repositorio inconsistente: 0,2 GB es demasiado pequeno para un checkpoint completo de 7,6 mil millones de parametros y sugiere un adaptador, una subida parcial o un fallo de publicacion.
- Sin versiones cuantizadas: no hay GGUF, AWQ ni GPTQ publicados, lo que dificulta el despliegue en hardware de consumo o en CPU.
- Idiomas no documentados: el modelo base esta orientado a ingles y chino; el comportamiento en castellano no esta verificado y podria degradar la calidad de las explicaciones.
- Metadatos de entrenamiento cuestionables: las versiones declaradas de las librerias (por ejemplo, PyTorch 2.14.0 o Transformers 5.17.0) parecen autogeneradas por el entorno de hf_jobs. Conviene tratarlas como meramente informativas.
- Adopcion nula: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad y de informes de errores.
- Sesgos del modelo base: el corpus de preentrenamiento de Qwen2.5-Coder infrarrepresenta ciertos patrones de Solidity menos comunes y sobre-representa practicas de desarrollo de codigo general, lo que puede sesgar las recomendaciones hacia patrones no idiomaticos en el ecosistema EVM.
- Uso responsable: la misma capacidad que permite redactar pruebas de concepto defensivas puede emplearse para desarrollar exploits. Debe restringirse a entornos de prueba autorizados.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos no guardan relacion con el repositorio y han sido descartados por no aportar informacion tecnica utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl

No se han encontrado otros enlaces relevantes (papers, blogs, demostraciones o repositorios asociados) en la busqueda web realizada.
