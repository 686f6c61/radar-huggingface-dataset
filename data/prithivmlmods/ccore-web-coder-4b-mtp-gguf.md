# prithivMLmods/CCORE-Web-Coder-4B-MTP-GGUF

## Resumen
CCORE-Web-Coder-4B-MTP-GGUF es la distribucion cuantizada en formato GGUF del modelo CCORE-Web-Coder-4B, desarrollado por el autor independiente CCORE sobre la base de Qwen3.5-4B-Base. Se trata de un modelo especializado en generacion de front-end: a partir de un brief en texto produce un documento HTML autocontenido con React 18, ReactDOM y Babel cargados por CDN, sin paso de build. Sus salidas tipicas cubren webs responsivas, presentaciones interactivas con maquetacion A4 para impresion a PDF e infografias web con datos.

La particularidad de esta publicacion es la integracion de Multi-Token Prediction (MTP) directamente en los pesos, lo que habilita decodificacion especulativa sin necesidad de un modelo borrador separado. El repositorio incluye pesos GGUF con cabezas MTP adicionales, un proyector multimodal opcional y una repack en safetensors para transformers. Con 4.659.865.088 parametros totales y licencia Apache 2.0, el modelo esta pensado para generacion local en hardware de consumo y para delegacion en flujos multiagente de diseno web.

La relevancia actual reside en dos frentes: por un lado, la especializacion vertical en codigo de interfaz con salidas de aproximadamente 20.000 tokens entre trazas de razonamiento y componentes JSX portables a Vite; por otro, la aceleracion por MTP, que segun el autor alcanza hasta 240 tokens/s en una RTX 5090 y 120 tokens/s en un Mac Studio con cuantizacion Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con cabezas de Multi-Token Prediction (MTP) para decodificacion especulativa |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; proyector mmproj en BF16 y F16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors (repack para transformers) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-4B-Base, un transformer denso de aproximadamente 4.660 millones de parametros, sobre el que CCORE aplica especializacion para generacion de front-end. La innovacion estructural de esta variante es la incorporacion de cabezas MTP dentro de la arquitectura principal: en lugar de emplear un modelo borrador externo, el propio modelo predice varios tokens futuros en una sola pasada, lo que permite decodificacion especulativa autocontenida y reduce el coste por token generado en inferencia local.

El pipeline declarado es image-text-to-text y el repositorio incluye un proyector multimodal opcional (mmproj) que habilita experimentos con vision, aunque el enfasis del modelo es la generacion de codigo web. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La salida tipica documentada ronda los 20.000 tokens combinando trazas de pensamiento y componentes JSX estructurados y portables a Vite.

## Capacidades
- Generacion de sitios web responsivos completos en un unico documento HTML autocontenido, con React 18, ReactDOM y Babel por CDN y sin paso de build.
- Generacion de presentaciones interactivas con maquetacion A4 orientada a impresion a PDF.
- Generacion de infografias web con datos, orientadas a comunicacion visual.
- Produccion de componentes JSX estructurados y portables a proyectos Vite.
- Trazas de razonamiento extensas (thinking) integradas en la salida, con volumen agregado de aproximadamente 20.000 tokens por generacion.
- Decodificacion especulativa mediante MTP integrado en los pesos, sin modelo borrador externo.
- Capacidades multimodales experimentales mediante el proyector mmproj opcional (image-text-to-text).
- Uso en delegacion multiagente para tareas de diseno web.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso
- Prototipado rapido de interfaces: a partir de un brief textual, el modelo emite un HTML autocontenido con React por CDN que puede abrirse directamente en el navegador, lo que elimina la configuracion de toolchain en fases de exploracion.
- Generacion de presentaciones comerciales: produce decks interactivos con maquetacion A4 listos para exportar a PDF, utiles para propuestas y materiales de venta sin disenador.
- Infografias web con datos: convierte un conjunto de cifras y un mensaje en una pieza visual HTML, adecuada para informes internos y notas de prensa.
- Delegacion multiagente en pipelines de diseno: un agente orquestador puede encargar al modelo la implementacion de componentes JSX concretos, que luego se integran en un proyecto Vite existente.
- Generacion local en estaciones de trabajo sin GPU de datacenter: con cuantizaciones Q4_K_M (2,82 GB) o Q5_K_M (3,18 GB) cabe en equipos de consumo y permite iterar sin coste de API.
- Aceleracion de iteracion con decodificacion especulativa: el MTP integrado reduce el tiempo por token en generaciones largas de aproximadamente 20.000 tokens, lo que agiliza ciclos de prueba y error sobre el diseno generado.
- Experimentos multimodales: con el proyector mmproj es posible explorar la generacion de interfaces a partir de referencias visuales, aunque se trata de una via experimental segun la model card.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta cifras de throughput de inferencia:

| Escenario | Cuantizacion | Throughput declarado |
|---|---|---|
| RTX 5090 | Q8_0 | hasta 240 tokens/s |
| Mac Studio | Q8_0 | 120 tokens/s |

## Requisitos de hardware
- VRAM/RAM estimada segun el archivo GGUF: Q3_K_M 2,35 GB, Q4_K_S 2,64 GB, Q4_K_M 2,82 GB, Q5_K_S 3,07 GB, Q5_K_M 3,18 GB, Q6_K 3,56 GB, Q8_0 4,61 GB, BF16 8,67 GB, F16 8,42 GB.
- Proyector multimodal adicional: 676 MB en BF16 (mmproj-bf16).
- Pesos completos en safetensors para transformers: 17,7 GB (model.safetensors), con un tamano total de repositorio de 51,9 GB.
- Cabe en GPU de consumo: las cuantizaciones Q3 a Q5 son viables en tarjetas de 8 GB; Q6_K y Q8_0 requieren 8-12 GB; BF16/F16 requieren al menos 12-16 GB.
- GPU recomendadas: RTX 5090 para el maximo throughput declarado; cualquier GPU consumer con 8 GB o mas para cuantizaciones intermedias; A100/H100 no son necesarias dado el tamano del modelo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-cpp), Ollama, text-generation-inference y transformers con la repack safetensors; el repositorio declara compatibilidad con endpoints.
- Latencia y throughput: 240 tokens/s en RTX 5090 y 120 tokens/s en Mac Studio con Q8_0, segun el autor; no hay datos para otras cuantizaciones o GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CCORE-Web-Coder-4B-MTP-GGUF | 4,66 B | no disponible | Front-end web (React/HTML), MTP | Apache 2.0 | GGUF + safetensors en Hugging Face |
| Qwen3.5-4B-Base | ~4 B | no disponible | Modelo base generalista | no disponible en la informacion | Hugging Face |
| Alternativas de codigo de ~4 B | no disponible | no disponible | Codigo general | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias
- El modelo solo declara soporte de ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- La longitud de contexto no se especifica en la model card, lo que impide planificar cargas de contexto largas con garantias.
- Es un modelo especializado en front-end: su utilidad fuera de generacion de interfaces, presentaciones e infografias web es limitada frente a un modelo generalista.
- Riesgo de alucinacion en datos incluidos en infografias y presentaciones: las cifras generadas deben verificarse antes de publicacion.
- El codigo generado depende de CDN externos (React, ReactDOM, Babel), lo que introduce dependencias de red y riesgos de disponibilidad en produccion.
- Las capacidades multimodales se presentan como experimentales y requieren el proyector mmproj adicional.
- No se documentan sesgos conocidos, datos de entrenamiento ni procesos de alineacion, lo que dificulta evaluar riesgos en produccion.
- El rendimiento declarado (240 tokens/s en RTX 5090) procede del autor y no se ha verificado de forma independiente.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de informacion sobre el dataset de entrenamiento impide descartar obligaciones derivadas de los datos originales.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/CCORE-Web-Coder-4B-MTP-GGUF
- Modelo base: https://huggingface.co/ccore/CCORE-Web-Coder-4B
- Archivos GGUF: https://huggingface.co/prithivMLmods/CCORE-Web-Coder-4B-MTP-GGUF/tree/main/GGUF
- Configuracion del modelo: https://huggingface.co/prithivMLmods/CCORE-Web-Coder-4B-MTP-GGUF/blob/main/config.json
- Plantilla de chat: https://huggingface.co/prithivMLmods/CCORE-Web-Coder-4B-MTP-GGUF/blob/main/chat_template.jinja
