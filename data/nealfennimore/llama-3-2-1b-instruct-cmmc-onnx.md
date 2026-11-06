# nealfennimore/Llama-3.2-1B-Instruct-CMMC-ONNX

## Resumen

Llama-3.2-1B-Instruct-CMMC-ONNX es un ajuste fino por LoRA del modelo meta-llama/Llama-3.2-1B-Instruct, fusionado en los pesos base y exportado a formato ONNX. Lo desarrolla nealfennimore para alimentar las funciones de IA local de su aplicación cmmc-app, una herramienta orientada al cumplimiento de la normativa CMMC (Cybersecurity Maturity Model Certification) y del estándar NIST SP 800-171.

El modelo parte de la arquitectura Llama 3.2 de 1.000 millones de parámetros de Meta y se especializa en responder preguntas sobre controles de seguridad, requisitos de evaluación y guías de auditoría del ecosistema CMMC/NIST. El conjunto de entrenamiento se construyó a partir de NIST SP 800-171 Rev. 2 y Rev. 3, NIST SP 800-171A y la CMMC Assessment Guide Level 2, con un script que generó cada respuesta directamente desde los documentos fuente.

Su relevancia es doble: por un lado, demuestra un flujo de especialización vertical de un modelo pequeño para un dominio regulado concreto; por otro, la distribución en ONNX facilita el despliegue local sin dependencia de GPUs de gran tamaño. El repositorio ocupa 2,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino LoRA fusionado en los pesos base |
| Parametros totales | 1.000 millones (aproximado, heredado de Llama-3.2-1B-Instruct) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; el modelo base Llama 3.2 1B soporta 128K tokens) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponibles (no declarados; el modelo base esta entrenado principalmente en ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | ONNX (repo de 2,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2 con aproximadamente 1.000 millones de parametros. Sobre esa base se aplico un ajuste fino con LoRA, que posteriormente se fusiono en los pesos del modelo original, de modo que la inferencia no requiere cargar adaptadores separados. La exportacion final a ONNX permite ejecutar el modelo con runtimes compatibles con ONNX Runtime en CPU o GPU.

Los datos de entrenamiento provienen exclusivamente de documentacion normativa: NIST SP 800-171 Rev. 2, NIST SP 800-171 Rev. 3, NIST SP 800-171A y la CMMC Assessment Guide Level 2. Un script genero cada par pregunta-respuesta a partir de los documentos fuente, lo que constituye una estrategia de sintesis de datos guiada por el corpus en lugar de anotacion humana. No se detalla en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales. La innovacion principal es el enfoque de dominio cerrado: un modelo pequeno especializado en un marco regulatorio concreto y empaquetado en ONNX para despliegue local.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre controles, requisitos y practicas de evaluacion de NIST SP 800-171 y CMMC Level 2.
- Razonamiento sobre documentacion normativa de seguridad, incluyendo preguntas de opcion multiple (metrica `mcq` reportada por el autor).
- Recuperacion y citacion de contenido de los documentos fuente (metrica `recall_f1`).
- Generacion de borradores de respuestas fundamentadas en el corpus normativo, con control de alucinacion medido mediante `draft_leak_rate` y `draft_ungrounded_per_draft`.
- Capacidades generales heredadas del modelo base Llama 3.2 1B Instruct (generacion de texto, instrucciones), aunque no se documentan explicitamente para este ajuste.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el corpus de entrenamiento esta en ingles.
- Capacidades de vision o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Asistente de cumplimiento CMMC en local: la cmmc-app integra el modelo para responder dudas sobre controles de NIST SP 800-171 sin enviar datos a la nube, algo critico en entornos con requisitos de confidencialidad regulatoria.
- Auditoria interna de controles de seguridad: el modelo puede generar borradores de justificacion y evidencia para cada practica de CMMC Level 2 a partir de la documentacion fuente, reduciendo el trabajo manual del equipo de cumplimiento.
- Formacion de equipos de seguridad: responde preguntas de opcion multiple y explicaciones sobre requisitos normativos, aprovechando la metrica `mcq` evaluada por el autor (0,31 tras el ajuste frente a 0,30 del base).
- Generacion de documentacion de evaluacion: produce borradores de respuestas fundamentadas con una tasa de borradores no fundamentados de 0,27 por borrador (frente a 1,26 del base), lo que lo hace util como primer borrador revisable por un auditor humano.
- Despliegue en entornos air-gapped: al distribuirse en ONNX y con 1B de parametros, puede ejecutarse en estaciones de trabajo sin GPU dedicada, adecuado para organizaciones que no pueden usar APIs externas.
- Prototipado rapido de asistentes de dominio regulado: sirve como referencia para equipos que quieran replicar el flujo de sintesis de datos desde documentos normativos y ajuste fino LoRA sobre un modelo pequeno.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor comparan el modelo base con el ajustado en cuatro metricas:

| Metrica | Base | Ajustado |
|---|---|---|
| mcq | 0,2998 | 0,3143 |
| recall_f1 | 0,2544 | 0,3738 |
| draft_leak_rate | 0,1745 | 0,1342 |
| draft_ungrounded_per_draft | 1,2617 | 0,2685 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1B de parametros, en FP16 requiere aproximadamente 2 GB de pesos mas overhead de activaciones y KV cache; en cuantizaciones de 8 o 4 bits el consumo se reduce por debajo de 1-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU mediante ONNX Runtime.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM, y en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo); otros runtimes como vLLM, llama.cpp, Ollama o TGI no estan documentados para este artefacto y requeririan conversion desde ONNX o desde los pesos originales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-CMMC-ONNX | ~1B | no disponible (base: 128K) | llama3.2 | ONNX | Ajuste de dominio CMMC/NIST |
| meta-llama/Llama-3.2-1B-Instruct | ~1B | 128K | llama3.2 | safetensors | Modelo base generalista |
| Llama-3.2-3B-Instruct | ~3B | 128K | llama3.2 | safetensors | Generalista, mayor capacidad |
| Modelos especializados en cumplimiento | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas publicas comparables en la informacion disponible |

No se dispone de datos de benchmarks comparativos con estas alternativas mas alla de la comparacion base vs. ajustado publicada por el autor.

## Limitaciones y advertencias

- El ajuste esta entrenado exclusivamente con documentacion NIST/CMMC en ingles; su comportamiento fuera de ese dominio no esta evaluado y probablemente degrade hacia respuestas genericas del modelo base.
- La metrica `mcq` apenas mejora (0,30 a 0,31), lo que sugiere que el ajuste no aporta una mejora sustancial en conocimiento general del dominio medido por preguntas de opcion multiple.
- La tasa de borradores no fundamentados baja de 1,26 a 0,27 por borrador, pero sigue siendo distinta de cero: el modelo puede generar afirmaciones no respaldadas por los documentos fuente y requiere revision humana en contextos de auditoria.
- Riesgo de alucinacion en citas normativas concretas (numeros de control, fechas, versiones de documentos) no cuantificado mas alla de las metricas del autor.
- Sesgos conocidos: no documentados en la model card; hereda los sesgos del corpus de entrenamiento de Llama 3.2 y de los documentos normativos utilizados.
- Licencia Llama 3.2 Community License: permite uso comercial con condiciones (incluida la clausula de "Built with Llama" y restricciones para entidades con mas de 700 millones de usuarios mensuales); es necesario revisar el texto completo incluido en el repositorio.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se documentan limitaciones de contexto especificas del ajuste; se desconoce si el entrenamiento respeto la ventana completa de 128K del modelo base.
- El formato ONNX puede complicar la integracion con toolchains habituales de Llama (vLLM, TGI), que esperan safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nealfennimore/Llama-3.2-1B-Instruct-CMMC-ONNX
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Repositorio de la aplicacion cmmc-app: https://github.com/nealfennimore/cmmc
- NIST SP 800-171 Rev. 2: https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final
- NIST SP 800-171 Rev. 3: https://csrc.nist.gov/pubs/sp/800/171/r3/final
- NIST SP 800-171A: https://csrc.nist.gov/pubs/sp/800/171/a/final
- CMMC Assessment Guide Level 2: https://cyberab.org/Catalog
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
