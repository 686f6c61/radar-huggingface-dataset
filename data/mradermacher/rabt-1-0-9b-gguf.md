# mradermacher/Rabt-1.0-9B-GGUF

## Resumen

Rabt 1.0 9B es un modelo de lenguaje de 9.197.093.888 parametros (9,2 mil millones) desarrollado por Kanban Studios (cuenta `4waiz` en Hugging Face) y orientado a asistencia personal local-first, uso de herramientas (tool-use) y razonamiento agéntico con intervención humana (human-in-the-loop). El modelo se distribuye bajo licencia Apache 2.0 y esta afinado mediante QLoRA, segun las etiquetas de la model card. Esta ficha documenta la version cuantizada en GGUF publicada por mradermacher, que facilita el despliegue en hardware de consumo mediante llama.cpp, Ollama y otros runtimes compatibles con GGUF.

La relevancia del modelo radica en su enfoque multilingue con cobertura explicita de ingles, arabe, frances, hindi y urdu, una combinacion poco frecuente en modelos de este tamano, junto con su orientacion a privacidad y ejecucion local. El repositorio GGUF incluye un proyector multimodal (`mmproj`) en variantes Q8_0 y f16, lo que sugiere capacidades de vision, aunque la model card no detalla la arquitectura del componente visual ni el encoder utilizado.

El modelo base es `4waiz/Rabt-1.0-9B`, publicado en transformers. La version de mradermacher ofrece cuantizaciones estaticas desde Q2_K (4,0 GB) hasta f16 (18,5 GB), ademas de una variante con imatrix en el repositorio `mradermacher/Rabt-1.0-9B-i1-GGUF`. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible); incluye proyector multimodal `mmproj` |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector mmproj en Q8_0 y f16; variantes imatrix en repositorio separado |
| Idiomas soportados | en, ar, fr, hi, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); pesos originales en transformers/safetensors en el modelo base |
| Metodo de ajuste | QLoRA (segun etiquetas de la model card) |
| Modelo base | 4waiz/Rabt-1.0-9B |
| Tamano del repo GGUF | 85,1 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del transformer (numero de capas, dimensiones, atencion, etc.) ni el volumen o composicion del dataset de entrenamiento. La model card solo indica que el modelo fue afinado con QLoRA sobre una base no especificada, y que esta orientado a tareas de asistente personal, tool-use y human-in-the-loop. No se documenta si hubo RLHF o DPO.

El aspecto tecnico mas destacable es la presencia de un proyector multimodal (`mmproj`) en el repositorio GGUF, lo que implica que el modelo base incorpora algun encoder visual para entrada de imagenes. Sin embargo, no se especifica que encoder se utiliza ni como se entrena esa parte. La cobertura multilingue (arabe, urdu, hindi, frances, ingles) sugiere un dataset de instrucciones multilingue, pero no se aportan cifras de tokens ni proporciones por idioma.

## Capacidades

- Generacion de texto conversacional multi-turno con orientacion a asistente personal.
- Soporte de tool calling / function calling, segun las etiquetas `tool-use` y `agent`.
- Razonamiento agéntico multi-paso con intervencion humana (`human-in-the-loop`).
- Capacidades multimodales (vision) inferidas de la presencia del proyector `mmproj` en el repositorio GGUF; el alcance exacto no esta documentado.
- Multilingue: ingles, arabe, frances, hindi y urdu.
- Enfoque local-first y privacidad: disenado para ejecucion en local sin depender de APIs externas.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades especificas de razonamiento matematico avanzado, generacion de codigo ni modo thinking explicito.

## Casos de uso

- Asistente personal local con privacidad: el modelo puede desplegarse en una maquina del usuario mediante Ollama o llama.cpp, procesando conversaciones y datos personales sin enviarlos a la nube, gracias a su enfoque local-first.
- Automatizacion de tareas con tool calling: integracion en flujos donde el modelo invoca funciones externas (calendario, correo, busqueda) mediante function calling, adecuado por su entrenamiento especifico en tool-use.
- Agentes con supervision humana: pipelines donde el modelo propone acciones y un humano las valida antes de ejecutarlas, aprovechando la orientacion human-in-the-loop.
- Atencion al cliente multilingue en mercados de Oriente Medio y Asia del Sur: cobertura de arabe, urdu e hindi junto con ingles y frances, util para soporte en regiones donde esos idiomas son predominantes.
- Procesamiento de documentos con imagenes: el proyector multimodal permite extraer informacion de capturas, formularios o documentos escaneados en un flujo local, aunque el alcance de vision no esta documentado.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (5,9 GB) o Q5_K_M (6,7 GB), el modelo cabe en GPUs consumer de 8-12 GB de VRAM, lo que facilita prototipos y uso personal.
- Traduccion y asistencia linguistica entre ingles, frances, arabe, hindi y urdu en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~4,0 GB; Q3_K_M ~4,8 GB; Q4_K_S ~5,6 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,7 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB.
- El proyector multimodal anade 0,7 GB (Q8_0) o 1,0 GB (f16) si se usa vision.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y despliegues de alta concurrencia.
- Cabe en GPU consumer: si, con cuantizaciones Q2_K a Q6_K en GPUs de 6-8 GB; Q8_0 requiere ~10 GB.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta `ollama`), runtimes compatibles con GGUF; el modelo base en transformers/safetensors puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de contexto para establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. La informacion proporcionada no incluye modelos comparables ni metricas de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rabt 1.0 9B (GGUF) | 9,2 B | no disponible | Apache 2.0 | GGUF | Multilingue (en, ar, fr, hi, ur), tool-use, vision via mmproj |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero la cobertura multilingue limitada a cinco idiomas puede degradar el rendimiento fuera de ellos.
- Riesgo de alucinacion inherente a modelos de 9 B; no hay evaluaciones publicadas que lo cuantifiquen.
- La longitud de contexto no esta especificada, lo que impide garantizar conversaciones o documentos largos.
- El alcance real de las capacidades multimodales no esta documentado; el proyector `mmproj` existe pero se desconoce el encoder y el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantizacion de un modelo de terceros conviene verificar los terminos del modelo base `4waiz/Rabt-1.0-9B` y de los datos de entrenamiento.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- El modelo tiene pocas descargas (1741) y un solo like, lo que sugiere escasa validacion por parte de la comunidad; no hay benchmarks independientes.
- No se indica si el modelo soporta modo thinking ni razonamiento matematico o de codigo especializado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rabt-1.0-9B-GGUF
- Modelo base: https://huggingface.co/4waiz/Rabt-1.0-9B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Rabt-1.0-9B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Rabt-1.0-9B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
