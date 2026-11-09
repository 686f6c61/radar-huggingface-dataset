# APLUX-Agora/Qwen2.5-0.5B-Instruct

## Resumen

APLUX-Agora/Qwen2.5-0.5B-Instruct es un paquete de recursos de despliegue derivado del modelo Qwen2.5-0.5B-Instruct de Alibaba, publicado por el repositorio APLUX-Agora dentro de su catalogo "Model Farm". No se trata de un modelo entrenado desde cero, sino de una conversion del modelo original a formatos cuantizados (W4A16 y W8A16) optimizados para ejecutarse sobre las NPU Qualcomm Hexagon de placas AIoT concretas, con binarios y ficheros de configuracion por SoC.

El paquete esta orientado a inferencia en el borde (edge AIoT): incluye directorios `targets/<SoC>/` con `model.json`, variantes por precision y binarios de contexto (`model.bin`). La model card reporta mediciones reales sobre dos placas: QCS8550 (Rhino Pi X1) a 87,7 tokens/s en W4A16 y QCS6490 (Rhino Pi A1) a 19,2 tokens/s en W8A16. Es relevante porque demuestra un flujo de despliegue reproducible de un LLM de 0,5B en hardware Qualcomm de bajo consumo, un nicho poco cubierto por los formatos habituales (GGUF, safetensors).

El modelo base Qwen2.5-0.5B-Instruct es un transformer decoder-only denso de 0,49B parametros con 32K tokens de contexto nativo y capacidades de instruccion, tool calling y generacion de codigo basico. La licencia del paquete convertido es la APLUX Model Farm License, distinta de la licencia del modelo original (Apache 2.0 para Qwen2.5-0.5B-Instruct), lo que introduce una capa adicional de condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,49B (modelo base Qwen2.5-0.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base; no especificado para los binarios convertidos |
| Tipos de cuantizacion | W4A16 y W8A16 (pesos 4/8 bits, activaciones 16 bits), por SoC |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen2.5 soporta multiples idiomas, pero la card no lo detalla) |
| Licencia | APLUX Model Farm License (licencia del modelo original aplicable en paralelo) |
| Formato de pesos | Binarios QNN propietarios (`model.bin`) y `model.json` por target; no safetensors ni GGUF |
| SoCs soportados | QCS8550 (W4A16), QCS6490 (W8A16) |
| Tamano del repo | 1,4 GB |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-11-09 |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: es una conversion y empaquetado del modelo Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,49B parametros con atencion causal estandar, RoPE y 32K tokens de contexto en su version original. La innovacion del repositorio esta en el pipeline de despliegue: conversion a grafos QNN (Qualcomm Neural Network) con cuantizacion post-entrenamiento W4A16 y W8A16, verificacion por placa y publicacion de binarios listos para ejecutar sobre la NPU Hexagon de los SoC QCS8550 y QCS6490.

La model card no detalla el dataset de entrenamiento, el proceso de alineacion (RLHF/DPO) ni los hiperparametros de cuantizacion (calibracion, granularidad, simetria). Tampoco especifica si se aplicaron tecnicas como decodificacion especulativa o atencion lineal; se asume que el grafo QNN replica la arquitectura original sin modificaciones estructurales, pero no hay confirmacion en la informacion disponible. El repo incluye `NOTICE.md` y `SHA256SUMS` para trazabilidad e integridad de los binarios.

## Capacidades

- Generacion de texto e instruccion: responde a prompts conversacionales y de instruccion, heredadas del ajuste del modelo base Qwen2.5-0.5B-Instruct.
- Razonamiento basico y matematicas elementales: adecuado para tareas de un solo paso o pocos pasos, limitado por el tamano de 0,5B.
- Generacion de codigo: soporta completado y explicacion de fragmentos sencillos; no es fiable para codigo de produccion complejo.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct soporta llamadas a funciones; no se especifica si el formato QNN preserva esta capacidad.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el modelo base soporta varios idiomas, pero la card no lo confirma para los binarios.
- Ejecucion en NPU Qualcomm Hexagon: capacidad diferencial del paquete, con binarios optimizados por SoC y precision.
- Sin vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Asistentes de voz en dispositivos AIoT: el modelo corre a 87,7 tokens/s en QCS8550, suficiente para respuestas conversacionales en tiempo real dentro de un dispositivo embebido sin conexion a la nube.
- Clasificacion y enrutado de intenciones en el borde: con 0,5B parametros y W4A16, se puede desplegar en placas de bajo consumo para etiquetar comandos o intents antes de enviar la peticion a un modelo mayor.
- Generacion de respuestas cortas en kioscos o electrodomesticos: el contexto de 32K del modelo base permite mantener historial de conversacion, aunque el throughput en QCS6490 (19,2 tokens/s) limita la longitud de las respuestas.
- Prototipado de pipelines LLM en hardware Qualcomm: el repo incluye `model.json` y binarios por target, util para validar flujos de cuantizacion QNN antes de portar modelos mayores.
- Filtrado y resumen de texto en dispositivos de campo: tareas de extraccion o resumen de documentos cortos sin salir del dispositivo, reduciendo coste de red y latencia.
- Educacion y demos de edge AI: el paquete permite ejecutar un LLM real en placas Rhino Pi X1/A1 para talleres, pruebas de concepto o benchmarks comparativos de NPU.
- Automatizacion de respuestas en aplicaciones industriales: generacion de mensajes de estado o alertas a partir de datos de sensores, con inferencia local.

## Benchmarks y rendimiento

La model card reporta mediciones de throughput en placas reales, no resultados de benchmarks academicos (MMLU, HumanEval, GSM8K):

| SoC · placa | Precision | Throughput medido |
|---|---|---|
| QCS8550 · Rhino Pi X1 | W4A16 | 87,7 tokens/s |
| QCS6490 · Rhino Pi A1 | W8A16 | 19,2 tokens/s |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Tampoco se reportan latencias de primer token ni consumo energetico.

## Requisitos de hardware

- VRAM/espacio: el repo ocupa 1,4 GB; el modelo en W4A16 ronda los 0,3-0,4 GB de pesos y en W8A16 los 0,5-0,6 GB, aunque no se confirma en la card.
- Hardware objetivo: NPU Qualcomm Hexagon de los SoC QCS8550 y QCS6490; no se soportan GPUs NVIDIA ni CPU x86 en este paquete.
- Placas verificadas: Rhino Pi X1 (QCS8550) y Rhino Pi A1 (QCS6490).
- GPU de consumo: no aplica; el paquete no esta pensado para RTX 4090, A100 ni H100.
- Opciones de despliegue: runtime Agora de AidLux (descarga via `hf download` con `AGORA_SOC`), exportacion de proyectos desde mega.aidlux.com; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 87,7 tokens/s en QCS8550 y 19,2 tokens/s en QCS6490 en la precision por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| APLUX-Agora/Qwen2.5-0.5B-Instruct | 0,49B | 32K (base) | QNN (`model.bin`) | APLUX Model Farm | NPU Qualcomm QCS8550/QCS6490 |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32K | safetensors | Apache 2.0 | GPU/CPU genericos |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32K | safetensors | Apache 2.0 | GPU/CPU genericos |
| Llama 3.2 1B Instruct | 1,24B | 128K | safetensors/GGUF | Llama 3.2 Community | GPU/CPU/edge |

La comparativa directa con alternativas edge es limitada: los paquetes QNN para Qualcomm son escasos y especificos por SoC. Frente al modelo original, este repo anade optimizacion NPU pero restringe el hardware y cambia la licencia.

## Limitaciones y advertencias

- Modelo de 0,5B: capacidad de razonamiento, matematicas y codigo limitada; propenso a errores en tareas multi-paso.
- Riesgo de alucinacion elevado en comparacion con modelos de mayor tamano, especialmente en dominios especializados.
- Idiomas soportados no confirmados en la card; el modelo base es multilingue, pero la conversion podria no preservar todos los idiomas.
- Licencia APLUX Model Farm distinta de la Apache 2.0 del modelo original: revisar `LICENSE_MODEL_FARM.pdf` antes de uso comercial; pueden aplicarse condiciones adicionales.
- Hardware restringido: solo SoCs Qualcomm QCS8550 y QCS6490 verificados; no hay soporte para GPU, CPU x86 ni otros aceleradores.
- Formato propietario: los binarios QNN no son portables a otros runtimes (llama.cpp, vLLM, etc.).
- Sin datos de benchmarks academicos ni evaluacion de sesgos; no se puede verificar la calidad tras la cuantizacion W4A16/W8A16.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.
- Fecha de creacion futura (2026-11-09) en los metadatos: verificar integridad y procedencia antes de desplegar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/Qwen2.5-0.5B-Instruct
- Demo y despliegue Agora: https://mega.aidlux.com/models/qwen2.5-0.5b-instruct
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/Qwen2.5-0.5B-Instruct/blob/main/LICENSE_MODEL_FARM.pdf
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
