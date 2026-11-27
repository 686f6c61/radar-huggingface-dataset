# Docglasses-AI/llama32-soap-e2-gguf

## Resumen

llama32-soap-e2-gguf es un ajuste fino (fine-tuning) del modelo meta-llama/Llama-3.2-1B-Instruct, publicado por Docglasses-AI en formato GGUF para su uso con llama.cpp. El modelo esta especializado en la generacion de notas clinicas con estructura SOAP (Subjetivo, Objetivo, Analisis, Plan), un formato estandar en la documentacion medica. Segun la model card, esta pensado para integrarse en SarvaDoc / GenieX como sistema de resumen on-device, es decir, ejecutandose localmente en dispositivos moviles.

El modelo cuenta con 1.235.814.432 parametros totales, lo que lo situa en la categoria de modelos pequenos optimizados para inferencia en hardware limitado. Se distribuye exclusivamente en formato GGUF con dos cuantizaciones (Q4_K_M y Q6_K), lo que refuerza su orientacion a despliegues en telefono y entornos con recursos restringidos. El repositorio ocupa 1,8 GB.

Su relevancia actual radica en la combinacion de un dominio muy vertical (documentacion clinica SOAP) con un formato de despliegue ligero (GGUF + llama.cpp), lo que permite procesar informacion medica sin enviar datos a la nube, un aspecto critico por motivos de privacidad y cumplimiento normativo en el ambito sanitario. La licencia es "other" y el autor advierte explicitamente de que no es un dispositivo de diagnostico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.2 1B Instruct) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K (GGUF) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | other |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.2-1B-Instruct, un transformer decoder-only de 1.235.814.432 parametros. Sobre esa base se ha realizado un ajuste fino supervisado orientado a la tarea de generar notas clinicas SOAP; la model card identifica la version como "epoch-2", lo que sugiere un entrenamiento de al menos dos epocas sobre un dataset de dominio clinico. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

La innovacion tecnica principal no reside en la arquitectura, sino en el empaquetado: el modelo se distribuye en GGUF con cuantizaciones Q4_K_M (807.694.016 bytes) y Q6_K, acompanado de un fichero de prompt (`soap_prompt.ts`) y una configuracion para movil (`llama32_mobile_config.json`). Esto indica un pipeline de despliegue pensado para llama.cpp en dispositivos, con un prompt predefinido que guia la generacion hacia el formato SOAP.

## Capacidades

- Generacion de texto especializada en notas clinicas con estructura SOAP (Subjetivo, Objetivo, Analisis, Plan).
- Resumen de informacion clinica orientado a la app SarvaDoc / GenieX.
- Inferencia on-device mediante llama.cpp en formato GGUF.
- Conversacion multi-turno (el tag "conversational" aparece en la ficha de Hugging Face).
- Capacidades generales heredadas de Llama 3.2 1B Instruct (generacion de texto, instrucciones), aunque el ajuste fino puede haber reducido su polivalencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Documentacion clinica asistida en consulta: el modelo genera borradores de notas SOAP a partir de la transcripcion o el resumen de una consulta, reduciendo el tiempo de papeleo del profesional sanitario.
- Resumen on-device en aplicaciones moviles: gracias a su tamano (1,2B parametros) y a la cuantizacion Q4_K_M (unos 808 MB), puede ejecutarse en un telefono con llama.cpp sin enviar datos clinicos a servidores externos.
- Prototipado de asistentes de salud con privacidad por diseno: util para equipos que necesitan validar un flujo SOAP local antes de invertir en modelos mayores o infraestructura cloud.
- Generacion de plantillas de notas estructuradas: el prompt incluido (`soap_prompt.ts`) permite estandarizar la salida en las cuatro secciones SOAP para su integracion en historiales electronicos.
- Educacion y simulacion clinica: generacion de ejemplos de notas SOAP para formacion de estudiantes o pruebas de sistemas de documentacion.
- Evaluacion comparativa de ajustes finos en dominio medico: sirve como baseline ligero para medir la calidad de modelos especializados frente a Llama 3.2 1B Instruct sin ajustar.
- Integracion en pipelines de CI/CD para validacion de prompts: el fichero de configuracion movil permite automatizar pruebas de regresion del prompt SOAP en cada version.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,8 GB para Q4_K_M y en torno a 1,1-1,3 GB para Q6_K (estimacion a partir del tamano de los ficheros; no confirmada por el autor).
- GPU recomendadas: al ser un modelo de 1,2B en GGUF, puede ejecutarse en CPU; para GPU, cualquier tarjeta con 2 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100), aunque las GPU de gama alta no aportan ventaja significativa frente a CPU en este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna e incluso en telefonos moviles segun la orientacion del autor.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y cualquier runtime compatible con GGUF; la ficha indica compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| llama32-soap-e2-gguf | 1,24B | no disponible | GGUF | other | Notas clinicas SOAP |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128K (segun la familia Llama 3.2) | safetensors, GGUF | Llama 3.2 Community License | Instrucciones generales |
| Llama-3.2-3B-Instruct | 3,2B | 128K (segun la familia Llama 3.2) | safetensors, GGUF | Llama 3.2 Community License | Instrucciones generales, mayor capacidad |

La comparativa se limita a la familia de origen porque no se dispone de datos de benchmarks ni de otros ajustes SOAP comparables en la informacion proporcionada. Frente a Llama-3.2-1B-Instruct, este modelo sacrifica polivalencia general a cambio de especializacion en notas SOAP; frente a la variante de 3B, ofrece menor huella de memoria a costa de capacidad de razonamiento.

## Limitaciones y advertencias

- No es un dispositivo de diagnostico: el autor lo advierte explicitamente en la model card. No debe usarse para decisiones clinicas sin supervision profesional.
- Riesgo de alucinacion: como todo modelo de 1,2B de parametros, puede inventar contenido clinico plausible pero incorrecto; requiere revision humana.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los sesgos de Llama 3.2 1B Instruct y del dataset de ajuste fino, no descrito.
- Limitaciones de idioma: declarado solo para ingles; el rendimiento en castellano no esta documentado.
- Licencia "other": las condiciones exactas de uso comercial no estan detalladas en la informacion proporcionada; es necesario consultar los terminos del repositorio y la licencia de Llama 3.2.
- Contexto: la longitud de contexto no esta especificada; no se debe asumir la ventana de 128K de la familia Llama 3.2 sin confirmacion.
- Datos de entrenamiento no publicados: no se puede evaluar la representatividad del dataset clinico ni posibles sesgos demograficos.
- Adopcion limitada: 205 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Docglasses-AI/llama32-soap-e2-gguf
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
