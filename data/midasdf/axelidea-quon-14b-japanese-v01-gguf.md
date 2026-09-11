# Midasdf/AXELIDEA-QUON-14B-Japanese-v01-GGUF

## Resumen

AXELIDEA-QUON-14B-Japanese-v01-GGUF es una conversion no oficial al formato GGUF del modelo Axelidea/AXELIDEA-QUON-14B-Japanese-v01, publicado por el usuario Midasdf en HuggingFace. Se trata de un modelo de generacion de texto de tipo transformer decoder-only (etiquetado como "llama" en los tags del repositorio) con 14.659.507.200 parametros totales, aproximadamente 14,66 mil millones, orientado a conversacion y generacion de texto en japones e ingles.

El problema que resuelve es de caracter practico: el checkpoint original se distribuye en safetensors BF16, un formato poco adecuado para equipos de consumo. Esta conversion cuantizada en Q4_K_M reduce el peso a 8.890.306.528 bytes (unos 8,89 GB), lo que permite ejecutarlo en GPU de 16 GB de VRAM mediante llama.cpp y aplicaciones compatibles como LM Studio u Ollama. El autor valido la carga con todos los layers descargados en una AMD Radeon RX 9070 XT de 16 GB, generando texto en japones con 8.192 tokens de contexto y Flash Attention, y verifico tambien una carga con 16.384 tokens.

Su relevancia es acotada pero clara: es la unica via publicada de ejecutar este modelo japones de 14B en hardware de consumo, manteniendo la licencia MIT del modelo original. No obstante, el repositorio no incluye model card detallada sobre datos de entrenamiento, benchmarks ni ficha tecnica del modelo base, por lo que buena parte de las especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como "llama" en los tags; sin confirmacion detallada en la informacion disponible) |
| Parametros totales | 14.659.507.200 (aprox. 14,66B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible como dato oficial. La validacion de la conversion usa 8.192 tokens de forma recomendada y completa una prueba de carga con 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repositorio) |
| Idiomas soportados | Japones e ingles (segun los tags del repositorio). El campo de idiomas de la ficha de HuggingFace figura como no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero `AXELIDEA-QUON-14B-Japanese-v01-Q4_K_M.gguf`, 8.890.306.528 bytes) |
| Modelo base | Axelidea/AXELIDEA-QUON-14B-Japanese-v01 |
| Plantilla de chat | Estilo ChatML (plantilla embebida en los metadatos del GGUF) |
| Fecha de publicacion | 10 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag "llama", que en la practica implica un transformer decoder-only con atencion causal. El repositorio es una conversion de formato, no un modelo entrenado por el autor de esta ficha: el autor indica que el modelo se convirtio desde el checkpoint BF16 original en safetensors con `convert_hf_to_gguf.py` de llama.cpp (checkout `d7bd3bfcad3e29c7e49fd26f38c79ee3e9a3fd6b`) y se cuantizo despues con `llama-quantize` usando Q4_K_M (build `b9389-30af6e2b9`).

La unica incidencia tecnica documentada es que el conversor reporto `Unknown RoPE type: default` al procesar la configuracion de origen, que tiene `rope_scaling: null`, y exporto el rope scaling como `NONE`. Pese a ello, el GGUF resultante supero las pruebas de inferencia descritas. No hay informacion disponible sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre innovaciones tecnicas del modelo base.

## Capacidades

- Generacion de texto conversacional en japones e ingles, con plantilla de chat estilo ChatML.
- Uso como modelo base de instrucciones/chat (el repositorio esta etiquetado como `conversational` y `endpoints_compatible`).
- Ejecucion local en aplicaciones compatibles con llama.cpp, incluidas LM Studio y Ollama.
- Inferencia con contexto amplio: la validacion cubre 8.192 tokens en uso normal y una prueba de carga con 16.384 tokens.
- Soporte de Flash Attention en llama.cpp (flag `-fa`) durante las pruebas de validacion.
- No hay informacion disponible sobre soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Asistentes conversacionales en japones: el modelo esta etiquetado para japones e ingles y usa plantilla ChatML, por lo que puede integrarse en un chat multi-turno local con 8.192 tokens de contexto sin depender de APIs externas.
- Despliegue en estaciones de trabajo con GPU de 16 GB: al ocupar 8,89 GB en Q4_K_M, permite servir un modelo de 14B en una unica GPU de consumo, util para equipos que no pueden acceder a A100 o H100.
- Traduccion y redaccion japones-ingles: con contexto de 8K tokens puede procesar documentos medianos y mantener coherencia terminologica dentro de la misma ventana.
- Prototipado rapido con LM Studio u Ollama: al ser un GGUF con plantilla embebida, se puede cargar en minutos para evaluar la calidad del modelo base japones antes de invertir en infraestructura mayor.
- Procesamiento por lotes offline: mediante `llama-cli` o el servidor de llama.cpp se pueden generar resumenes, clasificaciones o respuestas sobre conjuntos de textos en japones en una maquina local.
- Investigacion sobre cuantizacion: el repositorio documenta el hash SHA256 del fichero, los commits del conversor y del cuantizador, lo que lo convierte en un caso reproducible para estudiar la perdida de calidad de Q4_K_M frente al BF16 original.
- Base para ajuste fino ligero en japones: partiendo del GGUF se puede evaluar si merece la pena usar el checkpoint original como punto de partida para LoRA o QLoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio unicamente documenta pruebas de humo de inferencia: carga correcta del fichero Q4_K_M con todos los layers en una AMD Radeon RX 9070 XT de 16 GB, generacion de texto en japones con 8.192 tokens de contexto y Flash Attention, y una prueba de carga adicional con 16.384 tokens. No se aportan cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada: unos 8,89 GB solo para los pesos en Q4_K_M; con cache KV para 8.192 tokens hay que anadir entre 1 y 3 GB segun el backend y el tamano de lote, por lo que 12-16 GB de VRAM es el rango realista.
- GPU validadas: AMD Radeon RX 9070 XT de 16 GB, con todos los layers descargados en GPU. El autor recomienda empezar con 8.192 tokens de contexto en una GPU de 16 GB.
- Contexto de 16.384 tokens: segun el autor, puede requerir reducir el contexto, cuantizar la cache KV o descargar parte de los layers a CPU, en funcion del backend y del batch.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas (por ejemplo, gama RTX xx80/xx90 con 16 GB o superior y equivalentes de AMD). En GPU de 12 GB probablemente sea necesario descargar layers a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio, Ollama y cualquier runtime compatible con GGUF.
- Flags recomendados en el ejemplo del autor: `-c 8192 -ngl 99 -fa`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos alternativos aportados en la informacion, por lo que la comparativa se limita a las dos variantes conocidas del mismo modelo.

| Modelo | Parametros | Formato | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AXELIDEA-QUON-14B-Japanese-v01-GGUF (Q4_K_M) | 14,66B | GGUF | 8,89 GB | 8.192 tokens recomendados en la validacion; 16.384 en prueba de carga | MIT | HuggingFace (este repositorio) |
| Axelidea/AXELIDEA-QUON-14B-Japanese-v01 (original) | 14,66B | Safetensors BF16 | No disponible | No disponible | MIT | HuggingFace (repositorio del autor original) |

Alternativas de otros fabricantes con tamano o tarea comparable: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: el repositorio lo mantiene un tercero (Midasdf) y no esta respaldado por Axelidea Inc., autora del modelo original.
- Sin benchmarks publicados: no hay evidencia cuantitativa sobre la degradacion de calidad introducida por la cuantizacion Q4_K_M respecto al checkpoint BF16.
- Incidencia en RoPE: el conversor reporto `Unknown RoPE type: default` y exporto el rope scaling como `NONE`, lo que podria afectar a la extrapolacion de contexto mas alla de la ventana nativa.
- Contexto: 8.192 tokens es el valor recomendado por el autor para GPU de 16 GB; 16.384 tokens solo se valido como prueba de carga, no como uso sostenido.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano; no hay evaluaciones de fidelidad en la informacion disponible.
- Sesgos: no hay informacion disponible sobre composicion del dataset ni sobre evaluaciones de sesgo.
- Idiomas: aunque los tags indican japones e ingles, no se documenta cobertura de otros idiomas; el rendimiento fuera de esos dos idiomas es desconocido.
- Licencia MIT: permite uso comercial, pero se debe citar y dar credito a Axelidea Inc. como autora del modelo original, segun indica la propia model card.
- Idiomas del campo de ficha en HuggingFace: figura como no disponible, aunque los tags del repositorio si declaran japones e ingles.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin comunidad de usuarios que haya validado la conversion de forma independiente.
- Integridad del fichero: el autor publica el SHA256 `b3ff6e0cb1d3f59f39b8bd410889d3d252a2189df7dfc5ee9d0c34e2922caf58`, que conviene verificar antes de desplegar en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Midasdf/AXELIDEA-QUON-14B-Japanese-v01-GGUF
- Modelo original: https://huggingface.co/Axelidea/AXELIDEA-QUON-14B-Japanese-v01
- llama.cpp (herramientas de conversion y cuantizacion citadas en la model card): https://github.com/ggerganov/llama.cpp
- Resultados de busqueda web: las busquedas realizadas no devolvieron ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a foros sin relacion con el contenido tecnico.
