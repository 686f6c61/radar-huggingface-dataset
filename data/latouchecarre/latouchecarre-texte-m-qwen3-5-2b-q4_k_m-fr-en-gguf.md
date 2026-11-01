# LaToucheCarre/LaToucheCarre-Texte-M-Qwen3.5-2B-Q4_K_M-FR-EN-GGUF

## Resumen

LaToucheCarre-Texte-M-Qwen3.5-2B-Q4_K_M-FR-EN-GGUF es una cuantización GGUF derivada de Qwen/Qwen3.5-2B, publicada por LaToucheCarre, el equipo detrás del asistente de escritura local homónimo para Windows. El modelo no ha sido reentrenado ni recuantizado: parte del fichero Qwen3.5-2B-Q4_K_M.gguf de unsloth y aplica una poda del vocabulario, eliminando los 113 269 tokens (de 248 320, un 45,6 %) cuya escritura no es latina ni compatible con francés o inglés. Los pesos permanecen intactos; solo se recortan las filas de embedding correspondientes, se filtran las fusiones BPE y se renumeran los tokens especiales.

El resultado es un fichero de 1 084 Mo (frente a los 1 281 Mo originales, 197 Mo menos) pensado para un caso de uso muy concreto: corrección gramatical y ortográfica de textos en francés e inglés, ejecutada íntegramente en local. Según las mediciones del autor, corrige entre 79 y 80 de 104 faltas etiquetadas en once correos de prueba, con un máximo de dos palabras dañadas, tanto en GPU (RTX 5090, Vulkan) como en CPU (Ryzen 7 7800X3D, 16 hilos).

Su relevancia radica en el despliegue en el borde: ocupa 1 218 Mo de VRAM y 216 Mo de RAM de host en GPU, y 1 202 Mo de RAM en CPU, lo que lo hace viable en equipos de consumo sin conexión. Sustituye al anterior palier M del producto (Gemma 4 E2B Q2_K_XL podado, 1 788 Mo), con 15 faltas menos corregidas pero un 40 % menos de disco, un 36 % menos de RAM en CPU y 1,5 veces más velocidad en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B; detalles de atención no disponibles) |
| Parametros totales | 1 649 850 176 (1,65 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8 192 tokens (configuración usada en las mediciones; máximo del modelo base no disponible) |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | Francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen/Qwen3.5-2B, un transformer decoder-only de 1,65 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. El repositorio no documenta detalles adicionales sobre el tipo de atención, la composición del dataset de preentrenamiento ni las etapas de alineación (RLHF/DPO) del modelo base; esa información debe consultarse en la model card de Qwen3.5-2B, que no forma parte de la información disponible.

La modificación aplicada es puramente estructural sobre el vocabulario: se eliminan 113 269 tokens no latinos, se recortan las filas correspondientes de `token_embd.weight` (matriz compartida con la capa de salida), se filtran las fusiones BPE afectadas y se renumeran los tokens especiales. No hay reentrenamiento ni recuantización, por lo que las capacidades lingüísticas del modelo base se conservan íntegras para los idiomas soportados. El autor verifica la fidelidad del recorte comparando la salida del fichero podado con la del original sobre once correos con 104 faltas etiquetadas, en decodificación glotona y con cuatro consignas distintas: el texto resultante es estrictamente idéntico en los once casos.

La cuantización Q4_K_M de partida procede de unsloth/Qwen3.5-2B-GGUF, con SHA-256 publicado y verificado antes de la modificación. El autor recomienda ejecutar con el razonamiento desactivado (`--reasoning off` en llama.cpp y `chat_template_kwargs: {"enable_thinking": false}` en la petición), que es la configuración empleada en todas las mediciones.

## Capacidades

- Corrección gramatical y ortográfica en francés e inglés, el caso de uso principal y el único medido por el autor.
- Generación de texto conversacional en francés e inglés (etiqueta `conversational` en el repo).
- Modo de razonamiento (thinking) heredado de Qwen3.5, desactivable mediante `enable_thinking: false`; el autor recomienda desactivarlo para corrección.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite servirlo mediante APIs compatibles con el formato de HuggingFace.
- Inferencia en CPU y GPU vía llama.cpp, con soporte de Vulkan.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni matemáticas avanzadas en la información disponible.

## Casos de uso

- Corrección de correos y documentos en local: el escenario medido por el autor. Once correos con 104 faltas etiquetadas se procesan en 4,2 s en GPU y 50,2 s en CPU, con corrección de 79-80 faltas y un máximo de dos palabras dañadas, lo que lo hace apto para un corrector integrado en un editor de texto.
- Asistente de escritura de escritorio sin conexión: encaja en un producto tipo La Touche Carré, donde el texto nunca sale de la máquina; 1 218 Mo de VRAM permiten convivir con otras aplicaciones en GPUs de consumo.
- Revisión de textos bilingües francés-inglés: el vocabulario podado conserva ambos alfabetos y el modelo mantiene el rendimiento del base en esos dos idiomas, útil para documentación técnica o correspondencia internacional.
- Despliegue en equipos sin GPU: con 1 202 Mo de RAM en CPU y 40,8 tokens/s de generación en un Ryzen 7 7800X3D, es viable en portátiles y estaciones de trabajo modestas.
- Servicio de corrección por API local: la etiqueta `endpoints_compatible` y el formato GGUF permiten montarlo tras un servidor llama.cpp en una red interna, con contexto de 8 192 tokens para documentos de varias páginas.
- Filtro previo en pipelines de publicación: corregir borradores antes de enviarlos a un revisor humano o a un CMS, reduciendo el coste de revisión en flujos editoriales francófonos o anglófonos.
- Pruebas de integración en CI: al ser determinista con temperatura 0 y decodificación glotona, sirve para validar regresiones en sistemas de corrección automática.

## Benchmarks y rendimiento

El autor publica mediciones propias sobre once correos con 104 faltas etiquetadas, en RTX 5090 (Vulkan) y Ryzen 7 7800X3D (16 hilos), llama.cpp con contexto 8 192, razonamiento desactivado y temperatura 0. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Fichero | Modo | Disco | Faltas /104 | Palabras dañadas | VRAM | RAM | 11 correos | Generación |
|---|---|---|---|---|---|---|---|---|
| Este fichero (Q4_K_M podado) | GPU | 1 084 Mo | 79-80 | 2 | 1 218 Mo | 216 Mo | 4,2 s | 464 tok/s |
| Este fichero (Q4_K_M podado) | CPU | 1 084 Mo | 80-81 | 0-2 | 0 | 1 202 Mo | 50,2 s | 40,8 tok/s |
| Anterior M (Gemma 4 E2B Q2_K_XL podado) | GPU | 1 788 Mo | 95 | 0 | 1 162 Mo | 894 Mo | 6,2 s | 299 tok/s |
| Anterior M (Gemma 4 E2B Q2_K_XL podado) | CPU | 1 788 Mo | 93 | 0 | 0 | 1 874 Mo | 58,9 s | 36,9 tok/s |

## Requisitos de hardware

- VRAM estimada: 1 218 Mo en GPU con Q4_K_M y contexto de 8 192, incluidas las asignaciones del estado recurrente declaradas por llama.cpp.
- RAM en CPU: 1 202 Mo para el mismo contexto y cuantización.
- GPU recomendadas: RTX 5090 (medida por el autor); por el reducido consumo de memoria, cabe en cualquier GPU consumer con al menos 2 GB de VRAM libre, como GTX 1650, RTX 3050 o superiores. No se han publicado mediciones en A100, H100 ni RTX 4090.
- CPU: funciona en solitario; el autor mide 40,8 tok/s de generación y 50,2 s para once correos en un Ryzen 7 7800X3D con 16 hilos.
- Despliegue: llama.cpp es el runtime de referencia (formato GGUF, soporte Vulkan); la etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de endpoints. No se documenta soporte de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 464 tok/s de generación en GPU y 40,8 tok/s en CPU, con 4,2 s y 50,2 s respectivamente para procesar once correos completos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Disco | Faltas /104 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este fichero (Qwen3.5-2B Q4_K_M podado) | 1,65 B | 8 192 (medido) | 1 084 Mo | 79-80 | Apache 2.0 | GGUF en HuggingFace |
| Gemma 4 E2B Q2_K_XL podado (anterior palier M) | No disponible | No disponible | 1 788 Mo | 93-95 | No disponible | Uso interno del producto |
| Qwen/Qwen3.5-2B (base sin podar) | 1,65 B | No disponible | 1 281 Mo en Q4_K_M | No medido en este banco | Apache 2.0 | HuggingFace |

La comparación con el modelo base no incluye métricas de corrección porque el autor no las publica; solo se documenta que la salida del fichero podado es idéntica a la del original en el conjunto de prueba. No se dispone de datos de otros correctores gramaticales locales comparables en la información proporcionada.

## Limitaciones y advertencias

- El vocabulario podado elimina todos los tokens no latinos: el modelo no puede procesar textos en cirílico, árabe, chino, japonés, coreano ni otras escrituras, y probablemente degrada en idiomas latinos distintos del francés y el inglés.
- El banco de evaluación es muy reducido (once correos, 104 faltas) y procede del propio autor; no hay validación independiente ni benchmarks estándar.
- Se observan hasta dos palabras dañadas por pasada en GPU, lo que exige revisión humana en flujos de producción sensibles.
- El modelo está pensado para corrección; no se documentan capacidades de razonamiento complejo, código, matemáticas o tool calling, y su uso fuera de ese dominio no está validado.
- Riesgo de alucinación inherente a un modelo de 1,65 B: puede reescribir fragmentos correctos o introducir cambios no solicitados, especialmente con instrucciones ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución a Qwen Team (Alibaba Cloud) y a Unsloth como autores del modelo base y de la cuantización original.
- El rendimiento medido depende de la configuración exacta (razonamiento desactivado, temperatura 0, contexto 8 192); otros ajustes pueden alterar los resultados.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en dominios especializados (legal, médico, técnico).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LaToucheCarre/LaToucheCarre-Texte-M-Qwen3.5-2B-Q4_K_M-FR-EN-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Cuantización GGUF de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Producto del autor: https://latouchecarre.fr
