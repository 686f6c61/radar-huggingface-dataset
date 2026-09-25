# Brunobkr/OFFFELLIA_gemma-4-12B-it-uncensored-heretic.gguf

## Resumen

OFFFELLIA_gemma-4-12B-it-uncensored-heretic.gguf es un artefacto publicado en Hugging Face por el usuario Brunobkr, consistente en una cuantizacion en formato GGUF de un modelo derivado de la familia Gemma 4 de Google, concretamente una variante de 12 000 millones de parametros etiquetada como "it" (instruction-tuned) y "uncensored/heretic". El sufijo "heretic" hace referencia a la tecnica de abliteration empleada para eliminar los mecanismos de rechazo del modelo original, que segun los resultados de busqueda se aplico con la herramienta Heretic v1.2.0 y el metodo Arbitrary Rank Ablation (ARA).

El repositorio presenta un estado practicamente vacio en el momento de la consulta: 0 descargas, 0 "likes", 0,0 GB de tamano de repositorio y sin licencia declarada, idiomas ni pipeline especificados. La propia model card no describe el modelo, sino que reproduce el README de un fork de llama.cpp denominado "OFFFELLIA" (tambien "AlgMor24"), desarrollado por el mismo autor, que anade un motor agente autonomo multi-turno, soporte FIM, decodificacion especulativa, integracion MCP y una interfaz web en SvelteKit/Vite.

Por tanto, la ficha que sigue se basa exclusivamente en la informacion disponible: metadatos del repositorio, el README del fork subyacente y los resultados de busqueda sobre variantes relacionadas. No hay datos publicados de arquitectura detallada, contexto, idiomas, licencia del modelo ni benchmarks, por lo que buena parte de la ficha queda marcada como "no disponible". Es importante senalar que el nombre "gemma-4-12B" no puede verificarse contra documentacion oficial dentro de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de gemma-4-12B-it; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 12 000 millones aprox. (inferido de la nomenclatura "12B"; no confirmado en el repositorio) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; los niveles concretos de este repositorio no se especifican (los repos relacionados citan IQ4_NL, IQ4_XS, Q6_K y f16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; la model card menciona licencia MIT para el fork de llama.cpp, no para los pesos del modelo |
| Formato de pesos | GGUF |

Nota adicional: el repositorio figura con un tamano de 0,0 GB y 0 descargas, lo que sugiere que no contiene ficheros de pesos accesibles en el momento de la consulta.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. Por la nomenclatura ("gemma-4-12B-it") se infiere que se trata de un modelo de la familia Gemma de Google, en su variante de 12 000 millones de parametros ajustada por instrucciones, pero no se aportan datos sobre numero de capas, dimensiones ocultas, mecanismos de atencion, tipo de tokenizador ni estrategia de posicionamiento.

Respecto al entrenamiento y al post-procesado, los resultados de busqueda indican que la variante sin censura se obtuvo aplicando abliteration con Heretic (version 1.2.0 en un caso y 1.3.0 en otro) mediante el metodo Arbitrary Rank Ablation (ARA). Se trata de una tecnica de ablacion direccional que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones, en lugar de un reentrenamiento completo. No hay informacion sobre el volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones adicionales de inferencia dentro de este repositorio concreto. El README del fork si menciona decodificacion especulativa optimizada para programacion y FIM, pero son caracteristicas del motor de inferencia, no del modelo.

## Capacidades

- Generacion de texto instruccional: el modelo esta etiquetado como "it", por lo que se presupone ajuste por instrucciones, aunque no hay evaluacion publicada.
- Generacion de codigo: el ecosistema del fork menciona soporte FIM y decodificacion especulativa orientada a programacion; no se confirma que el modelo en si rinda bien en esta tarea.
- Modo "sin censura": la abliteration busca eliminar rechazos, lo que cambia el comportamiento en peticiones sensibles, sin que ello implique mayor calidad general.
- Tool calling / function calling: el fork declara `--tools all` y proxy MCP, pero es una capacidad del motor de inferencia, no necesariamente del modelo.
- Soporte de agentes y razonamiento multi-paso: el fork declara `--agent` y `--reasoning auto`; de nuevo, es una funcion del entorno, no una capacidad verificada del modelo.
- Capacidades multilingues: no disponible.
- Capacidades multimodales (vision, audio): no disponible, aunque el fork se describe como "LLM / VLM".

## Casos de uso

- Experimentacion con modelos sin censura en entornos controlados: util para investigadores que estudian el efecto de la abliteration sobre el comportamiento del modelo y la tasa de rechazo, siempre que se cumplan las condiciones legales y eticas de uso.
- Investigacion sobre alineacion y seguridad: permite comparar las respuestas del modelo base frente a la variante ablacionada y medir cambios en sesgos, toxicidad y utilidad.
- Analisis de tecnicas de ablacion (ARA): sirve como material de estudio reproducible para evaluar como el metodo Arbitrary Rank Ablation afecta a los pesos y a las salidas.
- Despliegue local con llama.cpp: el formato GGUF es compatible con llama.cpp y sus derivados, lo que facilita su ejecucion en equipos de sobremesa con GPU de consumo.
- Prototipado de asistentes conversacionales sin filtros para pruebas internas: util en escenarios de evaluacion cerrada donde se necesita examinar respuestas sin restricciones de rechazo.
- Integracion en flujos agenticos del ecosistema OFFFELLIA: el fork asociado ofrece motor agente, MCP y WebUI, de modo que el modelo podria emplearse como backend de un asistente local multi-turno.

Advertencia: el hecho de que las capacidades de tool calling, agentes y FIM provengan del fork y no del modelo obliga a validarlas empiricamente antes de cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de la variante abliteration (por ejemplo, tasas de rechazo o de toxicidad) en el repositorio consultado ni en los resultados de busqueda. Cualquier cifra que se cite de terceros debe verificarse contra su fuente original.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Como referencia orientativa para un modelo denso de ~12 000 millones de parametros en formato GGUF, cabe esperar aproximadamente 7-9 GB en cuantizaciones de 4 bits, 10-13 GB en 6 bits y en torno a 24 GB en f16; son estimaciones teoricas basadas en el recuento de parametros, no datos publicados para este repositorio.
- GPU recomendadas: no disponibles. Para cuantizaciones de 4-6 bits, una GPU consumer con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090) podria ser suficiente; para f16 se requeririan GPU de 24 GB o superiores (RTX 3090/4090, A100, H100).
- Cabe en GPU de consumo: probablemente si en cuantizaciones de 4-6 bits, sujeto a que el repositorio publique ficheros de pesos (actualmente 0,0 GB).
- Opciones de despliegue: llama.cpp y derivados (por el formato GGUF), incluyendo Ollama y LM Studio; el fork OFFFELLIA anade `llama-server` con WebUI, MCP y motor agente. vLLM y TGI no soportan GGUF de forma nativa sin conversion adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| Brunobkr/OFFFELLIA_gemma-4-12B-it-uncensored-heretic.gguf | ~12B (inferido) | no disponible | GGUF | no disponible | Repositorio vacio (0,0 GB), 0 descargas |
| Brunobkr/OFFELLIA_IQ4_XS_gemma-4-12B-it-heretic | ~12B | no disponible | GGUF (IQ4_XS) | no disponible | Variante de cuantizacion del mismo autor |
| Brunobkr/OFFELLIA_f16_gemma-4-12B-it-heretic | ~12B | no disponible | GGUF (f16) | no disponible | Variante f16 del mismo autor |
| llmfan46/gemma-4-12B-it-uncensored-heretic-GGUF | ~12B | no disponible | GGUF | no disponible | Mismo base, abliteration con Heretic v1.2.0 (ARA) |
| MoonRide/gemma-4-12B-it-heretic-custom-GGUF | ~12B | no disponible | GGUF | no disponible | Heretic v1.3.0, prompt de sistema personalizado; Q6_K ~9,8 GB, IQ4_NL ~7 GB |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas variantes. La diferencia principal observable es el nivel de cuantizacion, la version de Heretic empleada y el prompt de sistema de evaluacion.

## Limitaciones y advertencias

- Repositorio sin contenido verificado: 0,0 GB de tamano, 0 descargas y 0 "likes" en el momento de la consulta; no se confirma la disponibilidad real de los pesos.
- Licencia no declarada: no consta licencia para los pesos. La referencia a MIT en la model card corresponde al fork de llama.cpp, no al modelo. El uso comercial queda en situacion juridica incierta y debe aclararse con el autor y con la licencia del modelo base (Gemma suele tener terminos propios de uso).
- Modelo deliberadamente sin censura: la abliteration elimina mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ofensivo o ilegal. El uso responsable y legal recae integramente en el operador.
- Riesgo de degradacion por ablacion: las tecnicas de ablacion direccional pueden reducir la coherencia, la calidad general o la seguridad del modelo base; no hay evaluaciones publicadas que lo confirmen para esta variante.
- Alucinacion: sin benchmarks ni evaluaciones publicadas, el riesgo de alucinacion no puede cuantificarse y debe asumirse como significativo en cualquier despliegue.
- Sesgos: heredados del modelo base Gemma, sin que se hayan publicado analisis especificos para esta variante.
- Idioma y contexto: no se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar comportamiento en castellano o en secuencias largas.
- Funciones del fork confundidas con el modelo: capacidades como tool calling, agentes o FIM provienen del motor llama.cpp modificado, no necesariamente del modelo, por lo que deben validarse por separado.
- Nomenclatura no verificable: la denominacion "gemma-4-12B" no se puede contrastar con documentacion oficial en la informacion proporcionada.
- Fechas inusuales: la creacion y actualizacion figuran como 2026-09-25; conviene verificar la integridad temporal del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Brunobkr/OFFFELLIA_gemma-4-12B-it-uncensored-heretic.gguf
- Variante IQ4_XS del mismo autor: https://huggingface.co/Brunobkr/OFFELLIA_IQ4_XS_gemma-4-12B-it-heretic
- Variante f16 del mismo autor: https://huggingface.co/Brunobkr/OFFELLIA_f16_gemma-4-12B-it-heretic
- Modelo base sin censura (llmfan46): https://inferix.co/models/llmfan46/gemma-4-12B-it-uncensored-heretic-GGUF
- Variante con prompt personalizado (MoonRide): https://inferix.co/models/MoonRide/gemma-4-12B-it-heretic-custom-GGUF
- Ficha de cuantizaciones Heretic (local-ai-zone): https://local-ai-zone.github.io/models/gemma-4-12b-it-heretic-ud.html
- Repositorio del fork llama.cpp OFFFELLIA: https://github.com/brunoconta1980-tech/llama_OFFFELLIA_1984
- Proyecto ROCmFPX citado en la model card: https://github.com/charlie12345/ROCmFPX
