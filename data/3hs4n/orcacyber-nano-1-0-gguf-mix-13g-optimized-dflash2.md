# 3hs4n/OrcaCyber-Nano-1.0-GGUF-Mix-13G-Optimized-DFlash2

## Resumen

OrcaCyber-Nano-1.0-GGUF-Mix-13G-Optimized-DFlash2 es un paquete de ejecucion para llama.cpp publicado por el usuario 3hs4n sobre el modelo base OrcaCyber Nano 1.0 de OrcaRouter. Se trata de un modelo de vision-lenguaje de 27.000 millones de parametros, orientado a analisis de seguridad defensiva, revision de codigo seguro, ingenieria inversa, triaje de incidentes y tareas generales de codigo y razonamiento. El repositorio no contiene pesos: unicamente incluye la model card, herramientas portables y materiales de evaluacion sintetica, mientras que los pesos GGUF se descargan del repositorio original con acceso restringido.

La relevancia de este paquete radica en su perfil de ejecucion medido sobre hardware de consumo: Apple M1 Max con 64 GiB de memoria unificada y backend Metal. Incorpora decodificacion especulativa mediante un drafter DFlash2 de 2,06 GB, ademas de decodificacion multi-token prediction (MTP) integrada y decodificacion plana como alternativas. El perfil final medido alcanza un pico de RSS de 19,82 GiB con contexto de 8.192 tokens y un presupuesto de cache global de 1 GiB.

El modelo soporta texto, imagenes, modo de razonamiento (thinking) y llamadas a herramientas nativas al estilo OpenAI. Esta disponible en ingles y chino, con licencia MIT para el codigo auxiliar del repositorio, aunque los pesos externos conservan su propia metadata de origen (`other` / `qwen`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (derivada de Qwen segun metadata de origen); no se detalla la variante exacta |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens en el perfil medido (maximo nativo no disponible) |
| Tipos de cuantizacion | GGUF Mix-13G (cuantizacion mixta propietaria del autor base); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT para el codigo y materiales de este repositorio; pesos externos con metadata `other` / `qwen` |
| Formato de pesos | GGUF (no es una conversion MLX ni un fine-tune nuevo) |

## Arquitectura y entrenamiento

El modelo base es un transformer de vision-lenguaje de 27B parametros con proyector visual (mmproj en F16) y capacidad de razonamiento explicito y tool calling nativo. La metadata de origen apunta a una base Qwen, aunque no se especifica la variante exacta ni el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si emplea atencion lineal, SSM o alguna hibridacion.

La innovacion tecnica destacable de este paquete es la integracion de decodificacion especulativa DFlash2 mediante un drafter companion de 2,06 GB, que acelera la decodificacion sin alterar los pesos del modelo objetivo. El paquete fija llama.cpp en la prerelease b11888 (commit `48c9f08b7b25766324282b7605177e2f2be755bb`) y documenta un perfil de ejecucion con microbatch 512, cache global de 1 GiB y sin cache KV en disco.

## Capacidades

- Generacion de texto y razonamiento con modo thinking explicito.
- Comprension de imagenes y OCR (pipeline image-text-to-text).
- Generacion y revision de codigo, incluyendo codigo seguro.
- Razonamiento matematico.
- Tool calling nativo con argumentos tipados al estilo OpenAI.
- Capacidades orientadas a ciberseguridad defensiva: analisis de seguridad, ingenieria inversa y triaje de incidentes.
- Soporte multilingue limitado a ingles y chino.
- Decodificacion especulativa DFlash2 y MTP integrada para acelerar la inferencia.

## Casos de uso

- Revision de codigo seguro en pipelines de CI/CD: el modelo puede analizar diffs y fragmentos de codigo con tool calling nativo, integrándose en flujos automatizados de pull requests para detectar patrones inseguros.
- Triaje de incidentes de seguridad: con 8.192 tokens de contexto y modo thinking, puede procesar logs y descripciones de incidentes multi-turno y generar explicaciones estructuradas.
- Analisis de capturas y diagramas: gracias al proyector visual y al pipeline image-text-to-text, permite interpretar imagenes de interfaces, diagramas de red o capturas de pantalla en tareas de soporte forense.
- Ingenieria inversa asistida: combinando razonamiento y vision, puede ayudar a interpretar salidas de desensambladores o capturas de herramientas de analisis.
- Asistente de codigo en local sobre Apple Silicon: el perfil medido en M1 Max con 19,82 GiB de RSS permite desplegar el modelo en un equipo de sobremesa con memoria unificada de 64 GiB.
- Atencion tecnica especializada en seguridad: conversaciones multi-turno con reutilizacion de prefijo, que reduce el TTFT de 50,20-51,61 s a 0,91-1,11 s dentro de la misma conversacion.
- Evaluacion y prototipado de decodificacion especulativa: el paquete incluye materiales de evaluacion sintetica y mediciones reproducibles para comparar DFlash2, MTP y decodificacion plana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica mediciones de rendimiento de runtime sobre Apple M1 Max (64 GiB, Metal), con decodificacion greedy y procesos frescos:

| Prompt | Decodificacion plana | Decodificacion DFlash2 | Ganancia |
|---|---:|---:|---:|
| Chat corto | 14,6 tok/s | 16,8 tok/s | 1,15x |
| Codigo | 14,7 tok/s | 45,0 tok/s | 3,05x |
| Matematicas | 14,7 tok/s | 32,4 tok/s | 2,20x |
| Explicacion de incidente | 14,7 tok/s | 20,0 tok/s | 1,36x |

Mediciones adicionales del autor:

| Metrica | Valor |
|---|---|
| MTP integrado (codigo) | 25,25 tok/s |
| MTP integrado (matematicas) | 24,08 tok/s |
| Ganancia mediana MTP por caso | 1,31x |
| TTFT en prefill largo (plano / DFlash2) | 22,45 s / 22,72 s |
| TTFT follow-up con reutilizacion de prefijo | 0,91-1,11 s (desde 50,20-51,61 s) |
| Pico RSS perfil final | 19,82 GiB |
| Pico RSS con cache global de 8 GiB | 26,18 GiB |
| Fixture de calidad estricta texto/codigo | 23/24 (95,8%) |
| Vision/OCR sintetico | 3/4 JSON exacto |
| Tool calls nativos | 4 bien formados; 3/4 argumentos exactos |
| Comparaciones de salida bruta | 39/39 coincidentes con decodificacion plana |
| Duracion del fixture final | 172,16 s, cero errores |

Estas son pruebas de desarrollo sobre un unico equipo y no garantizan rendimiento en otro hardware.

## Requisitos de hardware

- VRAM/memoria estimada: pico de RSS medido de 19,82 GiB con contexto de 8.192 tokens y cache global de 1 GiB; 26,18 GiB con cache de 8 GiB. Los archivos externos suman 15,98 GB (objetivo + vision + DFlash2) o 13,92 GB (objetivo + vision con MTP).
- GPU recomendadas: no se documentan GPU dedicadas; el perfil medido es Apple M1 Max con 64 GiB de memoria unificada y backend Metal.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (64 GiB medidos). No hay datos para RTX 4090, A100 o H100.
- Opciones de despliegue: llama.cpp (prerelease b11888, commit `48c9f08b7b25766324282b7605177e2f2be755bb`); Unsloth Studio con el setup on-device documentado. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 14,6-14,7 tok/s en decodificacion plana y hasta 45,0 tok/s en codigo con DFlash2; TTFT de 22,45-22,72 s en prefills largos y 0,91-1,11 s en follow-ups con reutilizacion de prefijo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, el modelo base OrcaCyber Nano 1.0 de OrcaRouter es la unica alternativa documentada, y este paquete se diferencia por anadir el perfil de runtime DFlash2 y las mediciones sobre Apple Silicon.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OrcaCyber-Nano-1.0-GGUF-Mix-13G-Optimized-DFlash2 | 27B | 8.192 (perfil medido) | MIT (codigo) / pesos con metadata `other` | Repositorio auxiliar; pesos en repo original con acceso restringido |
| orcarouter/OrcaCyber-Nano-1.0 | 27B | no disponible | no disponible | Repositorio original con acceso restringido |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; el autor reporta un 95,8% en un fixture estricto de texto/codigo y 3/4 en vision/OCR sintetico, sin pruebas a gran escala.
- Limitaciones de contexto: el perfil medido usa 8.192 tokens; el maximo nativo no esta documentado. El cambio entre conversaciones largas provoca re-prefill porque las caches globales de 1 y 2 GiB expulsan el estado guardado.
- Limitaciones de idioma: solo ingles y chino; no hay soporte declarado de castellano.
- Restricciones de licencia: la licencia MIT cubre unicamente el codigo y materiales de este repositorio; no relicencia los pesos externos, cuya metadata de origen indica `other` / `qwen`, lo que exige verificar las condiciones del repositorio original antes de un uso comercial.
- Acceso: los pesos requieren solicitar acceso al repositorio original de OrcaRouter; este repositorio no los espeja.
- Dependencia de runtime: la integracion DFlash2 depende del backend de la aplicacion y de una version concreta de llama.cpp (prerelease b11888); el archivo DFlash2 de 2,06 GB es un drafter companion, no un modelo autonomo.
- Mediciones limitadas: todas las cifras de rendimiento provienen de un unico Apple M1 Max con condiciones controladas; no son garantias para otro hardware, contextos mas largos o imagenes de mayor tamano.
- El repositorio no contiene archivos GGUF, por lo que los selectores de modelos pueden mostrar "No GGUF quantizations found".

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/3hs4n/OrcaCyber-Nano-1.0-GGUF-Mix-13G-Optimized-DFlash2
- Modelo base original: https://huggingface.co/orcarouter/OrcaCyber-Nano-1.0
- Descarga directa de GGUF originales: https://huggingface.co/orcarouter/OrcaCyber-Nano-1.0/tree/1af1635aa22b97e965450c2d69525761d9bd463f
