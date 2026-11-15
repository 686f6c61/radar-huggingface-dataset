# mradermacher/Gemma-SEA-LION-v4-27B-GGUF

## Resumen

Gemma-SEA-LION-v4-27B es un modelo de lenguaje desarrollado por AI Singapore (AISG) como parte de la familia SEA-LION, orientada a lenguas del sudeste asiatico y construida sobre la arquitectura Gemma 3 de Google. Esta ficha concreta corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un conocido creador de cuantizaciones para llama.cpp, que permite ejecutar el modelo en hardware de consumo y en entornos sin GPUs de datacenter.

El modelo original cuenta con 27.009.346.304 parametros (aproximadamente 27.000 millones) y esta publicado bajo licencia MIT, lo que facilita su uso comercial sin las restricciones habituales de la familia Gemma. La version GGUF incluye ademas ficheros mmproj, lo que indica que el modelo base conserva capacidades multimodales (vision) heredadas de Gemma 3.

La relevancia de esta publicacion radica en que ofrece una via practica para desplegar un modelo de 27B con licencia permisiva en local, con un rango amplio de cuantizaciones (desde Q2_K de 10,6 GB hasta Q8_0 de 28,8 GB), lo que lo hace accesible tanto en estaciones de trabajo con una sola GPU como en configuraciones con CPU y RAM abundante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 3, segun el modelo base) |
| Parametros totales | 27.009.346.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun metadatos; el modelo base SEA-LION esta orientado a lenguas del sudeste asiatico, pero no se detalla la lista completa) |
| Licencia | MIT |
| Formato de pesos | GGUF (con ficheros mmproj para vision); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su origen en Gemma 3. Por el nombre y el tamano (27B), se corresponde con la variante Gemma 3 27B, un transformer decoder-only con atencion multimodal (capacidad de procesar imagenes, evidenciada por los ficheros mmproj incluidos en la cuantizacion). No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o instruccion tuning especificas del proyecto SEA-LION v4.

La innovacion tecnica destacable en esta publicacion es la propia cuantizacion: mradermacher ofrece cuantizaciones estaticas (no imatrix) en un rango amplio, con notas de calidad (por ejemplo, Q4_K_S y Q4_K_M marcados como "fast, recommended", Q6_K como "very good quality" y Q8_0 como "fast, best quality"). Ademas, se indica que existen cuantizaciones ponderadas con imatrix en un repositorio separado (Gemma-SEA-LION-v4-27B-i1-GGUF), que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles (tag "conversational" en los metadatos).
- Procesamiento multimodal de imagenes: los ficheros mmproj-Q8_0 y mmproj-f16 permiten usar el modelo con entrada visual en llama.cpp.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Gemma 3 27B, aunque no se documentan explicitamente en la informacion disponible.
- Soporte multilingue orientado a lenguas del sudeste asiatico por el linaje SEA-LION, aunque los metadatos solo declaran "en".
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras tipo Inference Endpoints.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (16,6 GB) el modelo cabe en una GPU de 24 GB (RTX 3090/4090) y permite asistentes conversacionales privados sin dependencia de la nube.
- Procesamiento de documentos con imagenes: gracias a los ficheros mmproj, se puede usar para extraer informacion de capturas, formularios escaneados o diagramas en pipelines de digitalizacion.
- Generacion de codigo en entornos con requisitos de licencia permisiva: la licencia MIT elimina las restricciones de uso comercial de la familia Gemma original, lo que lo hace apto para integrarse en productos propietarios.
- Atencion al cliente en ingles: el tag "conversational" y el tamano de 27B permiten mantener dialogos multi-turno con calidad razonable, siempre que se valide el contexto real soportado.
- Investigacion en lenguas del sudeste asiatico: al derivar de SEA-LION, es un punto de partida para experimentos con bahasa, tagalo, vietnamita y otras lenguas de la region, aunque la cuantizacion declara solo "en".
- Prototipado rapido con llama.cpp u Ollama: las cuantizaciones Q2_K (10,6 GB) y Q3_K_S (12,3 GB) permiten probar el modelo en portatiles con 16 GB de RAM o GPUs modestas antes de invertir en hardware mayor.
- Fine-tuning sobre la version safetensors: el modelo base original (aisingapore/Gemma-SEA-LION-v4-27B) puede adaptarse con LoRA y luego cuantizarse a GGUF para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~10,6 GB; Q3_K_S ~12,3 GB; Q3_K_M ~13,5 GB; Q3_K_L ~14,6 GB; IQ4_XS ~15,0 GB; Q4_K_S ~15,8 GB; Q4_K_M ~16,6 GB; Q5_K_S ~18,9 GB; Q5_K_M ~19,4 GB; Q6_K ~22,3 GB; Q8_0 ~28,8 GB.
- Vision: anadir ~0,7 GB (mmproj-Q8_0) o ~1,0 GB (mmproj-f16) al presupuesto de VRAM/RAM.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y hasta Q5_K_M; A100 40 GB o H100 para Q8_0 y margen de contexto; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con Q2_K o Q3_K_S y contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB con cuantizaciones bajas (Q2/Q3).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-27B (GGUF) | 27,0 B | no disponible | MIT | GGUF | Multimodal (mmproj), orientado a SEA |
| Gemma 3 27B (original) | ~27 B | no disponible | Gemma Terms | safetensors/GGUF | Restricciones de uso comercial de Google |
| Qwen2.5 32B | ~32 B | no disponible | Apache 2.0 | safetensors/GGUF | Alternativa permisiva de tamano similar |
| Mistral Small 24B | ~24 B | no disponible | Apache 2.0 | safetensors/GGUF | Menor, licencia permisiva |

La ventaja principal de esta ficha frente a Gemma 3 27B es la licencia MIT, que elimina las clausulas de uso aceptable de Google. Frente a Qwen2.5 32B o Mistral Small 24B, el atractivo es su especializacion en lenguas del sudeste asiatico y su soporte multimodal, aunque la falta de benchmarks publicados en la informacion disponible impide comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- La cuantizacion declara unicamente el idioma "en" en los metadatos, aunque el modelo base SEA-LION este orientado a lenguas del sudeste asiatico; conviene validar el rendimiento multilingue antes de usarlo en produccion.
- No se dispone de datos sobre la longitud de contexto real soportada, lo que impide planificar cargas con documentos largos sin pruebas previas.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Riesgo de alucinacion inherente a los modelos de 27B, especialmente en tareas factuales y en lenguas de bajos recursos.
- Sesgos: no se documentan evaluaciones de sesgo o toxicidad en la informacion disponible; el modelo hereda los sesgos del dataset de entrenamiento de Gemma 3 y SEA-LION.
- Aunque la licencia es MIT, el modelo base Gemma 3 tiene terminos de uso de Google; conviene revisar la compatibilidad legal de la cadena de derivacion antes de un uso comercial a gran escala.
- El repositorio ocupa 188,1 GB, por lo que la descarga completa requiere planificacion de almacenamiento; se recomienda descargar solo la cuantizacion necesaria.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines de agentes sin trabajo adicional de prompting.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma-SEA-LION-v4-27B-GGUF
- Modelo base: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemma-SEA-LION-v4-27B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-SEA-LION-v4-27B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
