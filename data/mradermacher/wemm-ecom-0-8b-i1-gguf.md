# mradermacher/WeMM-Ecom-0.8B-i1-GGUF

## Resumen

WeMM-Ecom-0.8B-i1-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo WeMM-Ecom-0.8B, desarrollado originalmente por Tencent y redistribuido por el usuario mradermacher. El modelo base pertenece a la familia WeMM (presumiblemente orientada a comercio electronico, dado el sufijo "Ecom") y cuenta con aproximadamente 0,8 mil millones de parametros segun su denominacion, aunque la metadata del repositorio declara un tensor de 481.182 parametros, dato que resulta incoherente con el nombre del modelo y que probablemente refleja un error de extraccion o un unico tensor muestreado.

Este repositorio no aporta pesos originales ni informacion sobre arquitectura, entrenamiento o capacidades: es un artefacto de cuantizacion generado con llama.cpp a partir del modelo de Tencent, empleando tecnicas de cuantizacion ponderada (imatrix/weighted). Su relevancia es practica: permite ejecutar el modelo base en hardware de consumo mediante formatos Q2 a Q6 e IQ1 a IQ4.

La ficha se limita a lo que puede verificarse en la informacion disponible. No hay model card descriptiva, ni licencia declarada, ni idiomas, ni benchmarks, por lo que la mayoria de campos tecnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: tencent/WeMM-Ecom-0.8B) |
| Parametros totales | ~0,8B segun denominacion; metadata del repo declara 481.182 (incoherente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base WeMM-Ecom-0.8B en los datos proporcionados. El nombre sugiere un modelo de ~0,8B parametros orientado a dominio de comercio electronico, pero no se confirma si emplea transformer denso, MoE u otra variante. Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Respecto al proceso de cuantizacion, la model card incluye metadatos que indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que los pesos se convirtieron desde formato Hugging Face y se cuantizaron con llama.cpp. El tag `nicoboss` y la presencia de cuantizaciones IQ sugieren el uso de imatrix (importance matrix) ponderada, que mejora la calidad en regimenes de baja precision (Q2/IQ2). No se especifica que dataset se uso para calcular la imatrix.

## Capacidades

- No se documentan capacidades explicitas del modelo base en la informacion disponible.
- Por denominacion ("Ecom") podria estar especializado en tareas de comercio electronico, pero no se confirma.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de ~0,8B en CPU o GPU integrada con llama.cpp u Ollama, util para prototipado local sin infraestructura dedicada.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece mas de 20 variantes (Q2 a Q6, IQ1 a IQ4), lo que permite medir la degradacion de calidad frente a tamano en un pipeline de evaluacion propio.
- Filtrado o clasificacion de texto en dominios de comercio electronico: si el modelo base esta especializado, podria usarse para tareas de extraccion o normalizacion de fichas de producto, aunque sin benchmarks no puede confirmarse su idoneidad.
- Pruebas de integracion con llama.cpp: sirve como artefacto de referencia para validar soporte de tipos de cuantizacion IQ en versiones concretas del runtime.
- Entornos con memoria muy limitada: las variantes IQ1_S o IQ2_XXS ocupan menos de 1 GB, utiles en dispositivos embebidos o contenedores con restricciones estrictas.
- Generacion de texto offline en aplicaciones de escritorio: al ser un modelo pequeno y cuantizado, puede embeberse en clientes locales sin dependencia de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de ~0,8B, las cuantizaciones Q4_K_M rondarian 0,5-0,7 GB y Q6_K en torno a 0,8-1 GB, aunque estas cifras no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: no disponible. Por tamano, cabria en cualquier GPU consumer con 4 GB o mas, pero no hay validacion oficial.
- Cabe en consumer GPU: previsiblemente si, dada la denominacion 0.8B, aunque no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF (LM Studio, text-generation-webui).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento, contexto ni licencia que permitan una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- La metadata de parametros del repositorio (481.182) es incoherente con la denominacion 0.8B; conviene verificar el modelo base antes de usarlo en produccion.
- No se declara licencia, por lo que el uso comercial queda en situacion juridica incierta hasta consultar la licencia del modelo original de Tencent.
- Ausencia total de model card descriptiva: no hay informacion sobre sesgos, alucinacion, idiomas ni contexto.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; no recomendadas para tareas sensibles.
- El repositorio no incluye pesos originales en safetensors, solo GGUF, lo que limita el fine-tuning directo.
- El modelo base no ha sido validado por el redistribuidor; los errores de conversion o cuantizacion no pueden descartarse.
- Fecha de creacion futura (2026-11-24) en la metadata, lo que sugiere posible manipulacion o error en el registro.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WeMM-Ecom-0.8B-i1-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-0.8B
