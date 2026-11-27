# Rumiii/Qwen-BioTool-1.5B

## Resumen

Qwen-BioTool-1.5B es un ajuste fino de Qwen2.5-1.5B-Instruct orientado especificamente a la seleccion de herramientas (tool calling) en el dominio biomedico. Dado un enunciado en lenguaje natural y un conjunto de esquemas de funciones disponibles, el modelo elige la herramienta correcta y genera los argumentos formateados en JSON. Lo desarrolla el usuario Rumiii y se publica bajo licencia Apache 2.0.

El modelo resuelve un problema acotado pero critico en pipelines de investigacion: la traduccion fiable de consultas biologicas a llamadas de API concretas sobre NCBI E-utilities, UniProt REST y Ensembl REST. Cubre 127 herramientas de estas tres familias, lo que abarca genomica, proteomica y biologia comparada, pero deja fuera APIs clinicas como busquedas ICD-10, bases de datos de farmacos o registros de ensayos clinicos.

Con 1.543.714.304 parametros (1,5B) y un contexto heredado de la familia Qwen2.5, es relevante ahora porque demuestra que un modelo pequeno, entrenado con QLoRA de 4 bits sobre tan solo 5.632 muestras, puede especializarse en function calling de dominio sin necesidad de infraestructura de gran escala. Su utilidad practica esta en orquestar agentes cientificos ligeros y desplegables en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Entrenado con QLoRA de 4 bits; pesos publicados en safetensors; otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, una version del transformer decoder-only Qwen2.5-1.5B-Instruct cuantizada a 4 bits. Sobre esa base se aplico un ajuste fino QLoRA de 4 bits mediante Unsloth y la libreria TRL de Hugging Face. El numero de parametros entrenables fue de 18.464.768, un 1,18 % del total, durante 3 epocas, con una perdida final de entrenamiento de 0,20.

El dataset de entrenamiento es `gxx27/BioTool`, con 5.632 muestras empleadas en el ajuste (la model card describe el dataset completo como 7.040 pares consulta-llamada de API verificados por humanos). Los datos cubren patrones de tool calling sobre 127 herramientas de tres familias de APIs: NCBI E-utilities (esearch, efetch, elink, BLAST y endpoints relacionados), UniProt REST (proteinas, proteomas y taxonomia) y Ensembl REST (mapeo de coordenadas, prediccion de efectos de variantes y genomica comparativa). No se documentan innovaciones arquitectonicas adicionales ni fases de RLHF o DPO especificas del ajuste.

## Capacidades

- Seleccion de herramienta: identifica la funcion adecuada entre un conjunto de esquemas proporcionados para una consulta biomedica.
- Generacion de argumentos: produce los parametros de la llamada en formato JSON, codificados como cadena en el campo `arguments`.
- Tool calling sobre NCBI E-utilities: busquedas y recuperacion en bases Entrez, enlazado entre registros y BLAST.
- Tool calling sobre UniProt REST: consultas de proteinas, proteomas y taxonomia.
- Tool calling sobre Ensembl REST: mapeo de coordenadas, efectos de variantes y genomica comparativa.
- Conversacion: capacidad heredada del modelo base Qwen2.5-1.5B-Instruct, no reforzada durante el ajuste fino.
- Multilingue: limitado al ingles; no se documenta soporte de otros idiomas.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Agente de busqueda bibliografica: el modelo traduce preguntas como "articulos sobre mutaciones de BRCA1" en llamadas `esearch` con los parametros `db` y `term` correctos, que un orquestador ejecuta contra PubMed.
- Recuperacion de registros genomicos: dado un identificador o una consulta, genera llamadas `efetch` o `elink` para encadenar recuperacion de secuencias y enlaces entre bases Entrez.
- Consulta de informacion proteica: convierte peticiones sobre proteinas, proteomas o taxonomia en llamadas UniProt REST con los campos de filtrado adecuados.
- Mapeo de coordenadas genomicas: genera llamadas a Ensembl REST para convertir coordenadas entre ensamblados, util en pipelines de anotacion.
- Prediccion de efectos de variantes: selecciona el endpoint de Ensembl adecuado y construye los argumentos para evaluar el impacto de una variante concreta.
- Orquestacion de pipelines bioinformaticos: actua como capa de enrutamiento entre un lenguaje natural y las APIs de NCBI, UniProt y Ensembl dentro de un agente multi-paso.
- Prototipado en hardware modesto: al ser un modelo de 1,5B, permite validar flujos de tool calling biomedico en una unica GPU consumer antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en precision completa (fp16) en torno a 3 GB de pesos; en cuantizacion de 4 bits, aproximadamente 1 GB. El tamano del repositorio es de 3,1 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para fp16; A100 o H100 no son necesarias para este tamano.
- GPU consumer: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), llama.cpp u Ollama si se generan pesos GGUF (no publicados en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen-BioTool-1.5B | 1,5B | no disponible | Tool calling biomedico (NCBI, UniProt, Ensembl) | Apache 2.0 |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible | Instrucciones generales, tool calling generico | Apache 2.0 |
| Alternativas de tool calling biomedico | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El campo `arguments` de las llamadas generadas es una cadena codificada en JSON, no un objeto anidado; el codigo consumidor debe aplicar `json.loads()` antes de usarlo.
- El ajuste fino se centro exclusivamente en ejemplos de tool calling; la capacidad conversacional procede del modelo base y no se reforzo.
- Cobertura limitada a NCBI, UniProt y Ensembl; cualquier consulta que requiera otras APIs biomedicas o clinicas queda fuera del alcance entrenado.
- No apto para toma de decisiones clinicas ni uso diagnostico.
- Entrenado solo en ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion en la seleccion de herramienta o en los argumentos, especialmente ante consultas fuera de la distribucion de entrenamiento; no se documentan evaluaciones de robustez.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el autor restringe explicitamente el uso clinico y diagnostico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rumiii/Qwen-BioTool-1.5B
- Dataset BioTool: https://huggingface.co/datasets/gxx27/BioTool
- Paper BioTool (arXiv): https://arxiv.org/abs/2605.05758
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
