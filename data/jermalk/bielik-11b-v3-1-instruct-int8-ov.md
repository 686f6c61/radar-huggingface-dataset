# jermalk/Bielik-11B-v3.1-Instruct-int8-ov

## Resumen

Bielik-11B-v3.1-Instruct-int8-ov es una conversión a formato OpenVINO en precisión INT8 del modelo Bielik-11B-v3.1-Instruct, un modelo de lenguaje de 11 mil millones de parámetros desarrollado por el equipo de Bielik (SpeakLeash y colaboradores) y orientado principalmente al idioma polaco. Esta variante concreta ha sido publicada por el usuario jermalk en Hugging Face bajo licencia Apache 2.0, y su propósito es facilitar la inferencia optimizada sobre hardware Intel mediante el runtime OpenVINO.

El modelo base pertenece a la familia Bielik, una serie de LLM entrenada desde cero sobre corpus mayoritariamente polacos para cubrir las carencias de los modelos multilingües genéricos en ese idioma. La versión v3.1-Instruct se presenta como un modelo ajustado para seguir instrucciones y mantener conversaciones multi-turno, con un tamaño de 11B parámetros que lo sitúa en la franja de modelos "medianos" desplegables en hardware de gama alta de consumo o en servidores con una sola GPU.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo especializado en un idioma europeo de tamaño medio, una cuantización INT8 y un formato de pesos pensado para OpenVINO, lo que permite ejecutarlo en CPU Intel (incluidas las NPU de las generaciones recientes) con un rendimiento razonable. La información pública disponible sobre esta conversión concreta es muy limitada, por lo que muchos campos de la ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Bielik-11B-v3.1-Instruct); detalles no disponibles en la informacion proporcionada |
| Parametros totales | 11B (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (formato OpenVINO IR, sufijo `-int8-ov`) |
| Idiomas soportados | no disponibles en la model card; el modelo base Bielik esta orientado principalmente al polaco |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), cuantizado a INT8 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el dataset de entrenamiento, el numero de tokens vistos ni las etapas de alineamiento (RLHF, DPO u otras) en la informacion proporcionada. El nombre del modelo indica que se trata de un transformer decoder-only de aproximadamente 11B parametros, ajustado para instrucciones (Instruct) en su version 3.1.

Lo que si se puede afirmar es que esta publicacion concreta no es un modelo entrenado desde cero, sino una conversion del modelo base a formato OpenVINO y cuantizacion INT8. Este proceso implica típicamente la exportacion de los pesos originales (probablemente en safetensors) al formato IR de OpenVINO y la aplicacion de tecnicas de cuantizacion post-entrenamiento (PTQ) para reducir la precision de los pesos a 8 bits, con el objetivo de acelerar la inferencia en CPU y NPU Intel. No se especifica en la informacion disponible si se ha aplicado cuantizacion consciente del entrenamiento (QAT) ni que calibracion se ha usado.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del ajuste Instruct del modelo base.
- Seguimiento de instrucciones en formato chat, segun el sufijo `-Instruct`.
- Capacidades multilingues: no confirmadas en la informacion disponible; el modelo base esta enfocado al polaco.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o thinking mode: no disponibles.
- Inferencia optimizada en hardware Intel (CPU, iGPU, NPU) gracias al formato OpenVINO.

## Casos de uso

- Procesamiento de lenguaje natural en polaco: el modelo base esta disenado para tareas de comprension y generacion en polaco, por lo que esta variante puede emplearse para resumen, redaccion y clasificacion de textos en ese idioma sobre infraestructura Intel.
- Despliegue en servidores sin GPU: al estar en formato OpenVINO INT8, puede ejecutarse en CPU Intel Xeon con aceleracion vectorial, lo que permite servir el modelo en entornos donde no hay GPU disponible.
- Inferencia en equipos de sobremesa y portatiles Intel: la cuantizacion INT8 reduce los requisitos de memoria, lo que facilita ejecutar un modelo de 11B en maquinas con 16-32 GB de RAM.
- Prototipado rapido de asistentes conversacionales: al ser un modelo Instruct, puede integrarse en aplicaciones de chat para pruebas de concepto antes de escalar a infraestructura mayor.
- Analisis de documentos en castellano o polaco: si el modelo base conserva capacidades multilingues, podria usarse para extraccion de informacion y resumen de documentos, aunque esto no esta confirmado.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad de INT8 frente a FP16/BF16 en un modelo de 11B sobre OpenVINO.
- Educacion e investigacion: al estar bajo Apache 2.0, puede usarse en entornos academicos para experimentar con tecnicas de cuantizacion y despliegue en hardware Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: un modelo de 11B en INT8 ocupa aproximadamente 11 GB de pesos, mas overhead de runtime y cache KV; se recomienda al menos 16 GB de memoria disponible.
- GPU recomendadas: no se especifican; el formato OpenVINO esta optimizado para CPU, iGPU y NPU Intel (por ejemplo, Intel Core Ultra, Xeon Scalable con AMX, Arc GPU).
- Cabe en GPU de consumo: si, en GPUs con 16 GB o mas de VRAM (RTX 4080/4090, etc.), aunque el formato OpenVINO no es el mas habitual para GPU NVIDIA; para estas seria preferible un formato GGUF o safetensors.
- Opciones de despliegue: OpenVINO Runtime, OpenVINO GenAI, Optimum-Intel; tambien podria convertirse a otros formatos, pero no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bielik-11B-v3.1-Instruct-int8-ov | ~11B | no disponible | Apache 2.0 | OpenVINO IR INT8 | Enfoque polaco, optimizado para Intel |
| Bielik-11B-v3.1-Instruct (base) | ~11B | no disponible | Apache 2.0 | safetensors (probable) | Version original sin cuantizar |
| Modelos multilingues de ~7-13B (p. ej. Mistral, Llama) | 7-13B | 8k-128k segun modelo | licencias variables | safetensors, GGUF | Cobertura multilingue amplia, no especializados en polaco |

La comparativa detallada con alternativas concretas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion publica sobre esta conversion es minima: no hay model card detallada, benchmarks ni documentacion de la calibracion usada en la cuantizacion INT8.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto al modelo en FP16/BF16; no se han publicado evaluaciones que lo cuantifiquen.
- El modelo base esta orientado al polaco; su rendimiento en castellano u otros idiomas no esta confirmado y podria ser deficiente.
- Riesgo de alucinacion inherente a los LLM de este tamano; no se documentan mitigaciones.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la conversion no ofrece garantias sobre el modelo base ni sobre la calidad de la cuantizacion.
- El formato OpenVINO limita la portabilidad: para GPUs NVIDIA o AMD seria necesario convertir los pesos a otro formato.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.

## Enlaces

- Hugging Face: https://huggingface.co/jermalk/Bielik-11B-v3.1-Instruct-int8-ov
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
