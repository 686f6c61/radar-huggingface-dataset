# meltingfeet/backup2026-11-05-LffyFx-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP, un modelo multimodal de tipo image-text-to-text derivado de la familia Qwen3.6. El autor del artefacto es el usuario de Hugging Face `meltingfeet`, mientras que el modelo base sobre el que se construye es `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`, una variante afinada para eliminar restricciones de contenido. La nomenclatura indica una arquitectura MoE (Mixture of Experts) con aproximadamente 35 mil millones de parametros totales y 3 mil millones de parametros activos por token, un patron habitual en la familia Qwen3.

El modelo combina el ajuste "uncensored" del autor original con un afinado adicional orientado a comportamiento tipo Hermes (function calling y uso agentico), segun los tags del repositorio. Incluye capacidades de vision (pipeline image-text-to-text), soporte multilingue (ingles, chino y otros idiomas) y esta empaquetado en formato GGUF con cuantizacion asistida por imatrix, lo que facilita su despliegue en entornos de inferencia local como llama.cpp u Ollama.

La relevancia de este artefacto es doble: por un lado, ofrece una via practica de ejecutar un modelo MoE de ~35B con solo ~3B parametros activos en hardware de consumo gracias a la cuantizacion; por otro, su caracter "uncensored" y su acceso restringido (gated) implican consideraciones importantes de uso responsable y cumplimiento. El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere que es un artefacto reciente o de distribucion limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), multimodal image-text-to-text |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B (segun nomenclatura A3B; no confirmado en ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (niveles concretos no disponibles) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con capas de mezcla de expertos (MoE), coherente con la designacion "35B-A3B" de la familia Qwen3.6: aproximadamente 35 mil millones de parametros totales con unos 3 mil millones activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. El modelo es multimodal (procesa texto e imagen) y esta disenado para tareas conversacionales y agenticas.

El entrenamiento exacto no esta documentado en la informacion disponible. Se sabe que deriva del modelo `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`, que a su vez parte de la familia Qwen3.6. Los tags indican un afinado orientado a function calling (dataset `NousResearch/hermes-function-calling-v1`) y un ajuste "uncensored" que elimina filtros de rechazo. La cuantizacion GGUF se ha realizado con imatrix, una tecnica que calibra los pesos cuantizados con una matriz de importancia para preservar calidad en precisiones bajas. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y respuesta a instrucciones complejas.
- Procesamiento de imagenes (pipeline image-text-to-text): descripcion, VQA y comprension visual.
- Soporte de function calling / tool calling (segun tags y dataset Hermes).
- Comportamiento agentico y razonamiento multi-paso (tag "agentic").
- Capacidades multilingues: ingles, chino y otros idiomas.
- Modo "uncensored": ausencia de filtros de rechazo por contenido.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno y, al ser multimodal, atender consultas con imagenes adjuntas (capturas, productos). Su naturaleza MoE con ~3B activos permite desplegarlo con latencia contenida en servidores modestos.
- Analisis de documentos e imagenes: extraccion de informacion de capturas, formularios o diagramas combinando vision y texto en un unico pipeline image-text-to-text.
- Agentes autonomos con tool calling: integracion en flujos agenticos donde el modelo decide que herramienta invocar (APIs, busquedas, calculos) gracias al afinado con el dataset Hermes de function calling.
- Generacion de codigo asistida: uso como asistente de programacion en entornos locales, aprovechando el formato GGUF para ejecucion en estaciones de trabajo sin GPU de datacenter.
- Investigacion en seguridad y alineacion: el caracter "uncensored" lo hace util para estudiar comportamientos sin filtros, red teaming y evaluacion de riesgos, siempre en entornos controlados.
- Procesamiento multilingue (en/zh): traduccion, resumen y generacion en ingles y chino, con soporte adicional para otros idiomas.
- Despliegue en local/edge: al ser GGUF cuantizado, puede ejecutarse con llama.cpp u Ollama en hardware de consumo, util para prototipado y demos offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; al ser un MoE de ~34,7B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 18-22 GB, y las de 8 bits en torno a 35-40 GB (estimacion orientativa, no confirmada en la ficha).
- GPU recomendadas: no disponibles en la informacion; por tamano, GPUs con 24 GB o mas (RTX 4090, A6000, L40S) para cuantizaciones bajas, y A100/H100 para precisiones mayores.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con cuantizacion de 4 bits; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo TGI/vLLM (no confirmado para GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.6-35B-A3B Uncensored Hermes GGUF) | ~34,7B totales / ~3B activos | no disponible | apache-2.0 | GGUF | Multimodal, uncensored, gated |
| Qwen3-30B-A3B (referencia familia Qwen) | ~30B / ~3B activos | no disponible | apache-2.0 | safetensors/GGUF | MoE denso de referencia; sin datos de benchmark comparables en esta ficha |
| Modelos densos ~30B (p. ej. familia Llama) | ~30B | no disponible | variable | safetensors/GGUF | Mayor coste de inferencia al no ser MoE |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica filtros de rechazo, por lo que puede generar contenido inapropiado, ofensivo o danino; requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no verificado en benchmarks.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar.
- Contexto maximo no documentado en la ficha; no asumir ventanas largas sin verificar.
- Idiomas: soporte principal en ingles y chino; el rendimiento en castellano no esta garantizado.
- Licencia apache-2.0 permite uso comercial, pero el caracter uncensored y la falta de documentacion de entrenamiento trasladan al usuario la responsabilidad legal y etica.
- Artefacto con cero descargas y sin validacion de la comunidad; tratar como experimental.
- La cuantizacion GGUF puede degradar ligeramente la calidad respecto al modelo base en safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meltingfeet/backup2026-11-05-LffyFx-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
