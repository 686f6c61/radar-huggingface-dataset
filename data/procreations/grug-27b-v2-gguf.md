# ProCreations/grug-27b-v2-gguf

## Resumen

Grug 27B v2 GGUF es la versión cuantizada en formato GGUF del modelo ProCreations/grug-27b-v2, publicada por el mismo autor (ProCreations) bajo licencia Apache-2.0. Se trata de un modelo de generación de texto de 27.320.697.856 parámetros (unos 27,32 mil millones) orientado, según las etiquetas del repositorio, a código, uso de herramientas (tool-use) y conversación, con soporte declarado únicamente para inglés. La particularidad del paquete GGUF es que cada archivo de texto incorpora la cabeza MTP (Multi-Token Prediction) ya ajustada por el autor, de modo que no hace falta descargar un modelo borrador independiente para aplicar decodificación especulativa.

El repositorio incluye cinco cuantizaciones (Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0), un proyector de visión en F16 (mmproj) y archivos auxiliares de trazabilidad: registro de conversión, sumas SHA256, resultados de pruebas y contabilidad de coste de HF Jobs. Todas las cuantizaciones se cargaron y probaron en una GPU H200 con MTP desactivado y activado, verificando generación, títulos, herramientas, manejo de historial y código ejecutable mediante una prueba de humo de 16 casos.

Es relevante ahora porque cubre un hueco práctico: modelos de ~27B con decodificación especulativa integrada y soporte de tool calling y visión, desplegables con llama.cpp en una sola GPU de 24-32 GB. Ahora bien, el propio autor advierte de que la prueba de 16 casos no es un benchmark completo, de que no se ha establecido la calidad con la ventana de contexto completa y de que no se ha publicado ningún benchmark de visión. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. El tag `qwen3_5` sugiere derivación de la familia Qwen3.5; el recuento de parametros y la ausencia de parametros activos declarados apuntan a un transformer denso, sin confirmacion en la model card |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | No aplica / no disponible (no se declara estructura MoE) |
| Longitud de contexto | No disponible. El ejemplo oficial de `llama-server` arranca con `-c 12288`, pero no se especifica el máximo soportado |
| Tipos de cuantizacion | Q3_K_M (12,81 GiB), Q4_K_M (15,83 GiB), Q5_K_M (18,33 GiB), Q6_K (20,99 GiB), Q8_0 (27,05 GiB); proyector de vision en F16 (0,86 GiB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base ProCreations/grug-27b-v2 se distribuye aparte (tamano total del repositorio GGUF: 102,9 GB) |
| Cabezas adicionales | Cabeza MTP nativa integrada en cada GGUF de texto (15 tensores, matrices en Q8_0); proyector de vision opcional `mmproj` |
| Fecha de creacion / actualizacion | 17 de agosto de 2026 / 12 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni la composicion del dataset de entrenamiento. Lo unico inferible es que se trata de una variante afinada por ProCreations (denominada "Grug") sobre una base que la etiqueta `qwen3_5` asocia a la familia Qwen3.5, con especializacion declarada en código y uso de herramientas. No se indica el numero de tokens de entrenamiento, ni si hubo RLHF, DPO u otra fase de alineamiento, ni la ventana de contexto nativa.

La innovacion tecnica documentada esta en el plano del despliegue, no del entrenamiento. Cada cuantizacion de texto empaqueta la cabeza MTP ajustada, lo que habilita decodificacion especulativa con `--spec-type draft-mtp` y `-ngld 99` sin un modelo borrador separado; el ejemplo oficial usa `--spec-draft-n-max 2`. Ademas, el modelo expone un parametro `reasoning_effort` en el endpoint de chat con tres niveles (low, medium y xhigh, siendo medium el valor por defecto). El autor advierte de que un esfuerzo mayor consume mas razonamiento pero no mejora de forma consistente todas las metricas medidas, y de que no debe asumirse un aumento de velocidad universal ni tokens identicos en modo greedy entre distintas rutas de ejecucion con MTP. La conversion se realizo y probo con el commit `2a3005c23f60cb38dab70b8ea2ddbd969bcf3e87` de llama.cpp sobre HF Jobs.

## Capacidades

- Generacion de texto conversacional en ingles, con manejo de historial (el servidor fijado acepta historial canonico en linea).
- Codigo: la prueba de humo de 16 casos por cuantizacion verifica "executable coding", es decir, generacion de codigo que se ejecuta.
- Uso de herramientas y function calling: se probo explicitamente el comportamiento con herramientas en cada cuantizacion.
- Razonamiento con esfuerzo configurable: niveles low, medium (por defecto) y xhigh mediante `reasoning_effort` en el endpoint de chat, con exposicion de trazas de razonamiento en `reasoning_content`.
- Vision: se conservan los pesos del proyector visual (`mmproj-grug-27b-v2-F16.gguf`), aunque no se ha publicado ninguna evaluacion de vision nueva.
- Decodificacion especulativa mediante la cabeza MTP integrada, activable en tiempo de ejecucion.
- Generacion de titulos: verificada en las pruebas de cada cuantizacion.
- Idiomas: unicamente ingles declarado.

## Casos de uso

- Asistente de codigo en el IDE o en terminal: con 27,32B parametros y una cuantizacion Q4_K_M de 15,83 GiB, el modelo cabe en una GPU de 24 GB y puede servir autocompletado y generacion de funciones completas mediante `llama-server`, con la cabeza MTP reduciendo el coste de decodificacion en secuencias largas de codigo.
- Pipelines de CI/CD con agentes: gracias al soporte de tool calling verificado, se puede integrar como paso automatizado que invoca herramientas (linters, ejecucion de tests, consultas a repositorios) y encadena varios pasos de razonamiento antes de proponer un parche.
- Refactorizacion asistida de bases de codigo medianas: con una ventana configurada de 12288 tokens en el ejemplo oficial, es viable pasar varios archivos o un modulo completo como contexto y pedir cambios coherentes entre ellos.
- Analisis de capturas y diagramas tecnicos: cargando el proyector `mmproj` junto al GGUF de texto, se pueden procesar diagramas de arquitectura, capturas de errores o bocetos de UI y generar el codigo o la explicacion correspondiente, siempre con la cautela de que no existe benchmark de vision publicado.
- Agente de soporte tecnico en ingles: conversaciones multi-turno con historial gestionado por el servidor y alternancia de razonamiento segun dificultad, subiendo a `reasoning_effort: xhigh` solo en incidencias complejas.
- Generacion de documentacion y resumenes tecnicos a partir de codigo fuente o trazas largas, aprovechando el control de repeticion configurado (`--repeat-penalty 1.05`, `--repeat-last-n 12288`) para evitar bucles en salidas extensas.
- Evaluacion comparativa de cuantizaciones en laboratorio: el repositorio ofrece cinco niveles con la misma cabeza MTP, lo que permite medir el impacto de la cuantizacion en calidad de codigo usando el protocolo de 16 casos como referencia reproducible.
- Despliegue air-gapped en una sola GPU: al no requerir modelo borrador externo ni servicios auxiliares, el paquete completo se puede servir de forma local con llama.cpp en entornos sin salida a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo documenta una prueba de humo de codigo de 16 casos ejecutada por cuantizacion, cuyos resultados se encuentran en `results.md`, y advierte explicitamente de que "no es un benchmark completo de cuantizacion". La model card tambien indica que la calidad con la ventana de contexto completa no ha sido establecida y que no existe benchmark de vision.

| Evaluacion | Estado | Resultado |
|---|---|---|
| MMLU, HumanEval, GSM8K y similares | No realizados / no publicados | No disponible |
| Prueba de humo de codigo (16 casos, por cuantizacion) | Realizada en H200 con MTP on/off | Cifras no incluidas en la informacion proporcionada; consultar `results.md` |
| Comprobaciones funcionales (generacion, titulos, herramientas, historial) | Realizadas por cuantizacion | Aprobadas segun la model card |
| Benchmark de vision | No realizado | No disponible |
| Calidad en contexto completo | No establecida | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano de archivo declarado, mas margen para cache KV y overhead; no son cifras oficiales): Q3_K_M alrededor de 14-16 GB; Q4_K_M alrededor de 17-19 GB; Q5_K_M alrededor de 20-22 GB; Q6_K alrededor de 23-25 GB; Q8_0 alrededor de 29-31 GB. El proyector de vision anade 0,86 GiB si se activa.
- La cache KV depende de la longitud de contexto elegida; el ejemplo oficial usa 12288 tokens, por lo que con contextos mayores la VRAM necesaria crece por encima de las cifras anteriores.
- GPU de referencia en las pruebas del autor: NVIDIA H200 (una unidad), con MTP desactivado y activado.
- GPU de centro de datos recomendadas: H100, H200, A100 80 GB. Una A100 de 40 GB solo admitiria cuantizaciones bajas con contexto recortado.
- GPU de consumo: Q3_K_M y Q4_K_M son las unicas opciones realistas en RTX 3090/4090 (24 GB), y de forma ajustada, reservando poco contexto; Q5_K_M y Q6_K requieren 32 GB (RTX 5090 o similar) o reparto en dos GPU; Q8_0 no cabe en ninguna GPU de consumo actual de una sola pieza.
- Opciones de despliegue: llama.cpp / `llama-server` es la ruta validada por el autor (incluye el comando exacto con `--jinja`, `-ngl 99`, `--spec-type draft-mtp`, `-ngld 99`). El formato GGUF es compatible con otros runners de la misma familia (LM Studio, Ollama) siempre que respeten la plantilla y los parametros de muestreo indicados. El repositorio menciona historiales estilo vLLM y proporciona `normalize_messages.py` para adaptarlos, lo que sugiere uso previsto tambien con vLLM. El tag `endpoints_compatible` apunta a compatibilidad con endpoints tipo OpenAI.
- Parametros de muestreo recomendados por el autor: `--temp 0.6 --top-p 0.95 --top-k 20 --repeat-penalty 1.05 --repeat-last-n 12288`.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni ganancia medida con decodificacion especulativa; el autor advierte de que no debe asumirse una aceleracion universal.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas de terceros. La unica comparacion verificable es entre el propio paquete GGUF y su modelo base de pesos completos.

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProCreations/grug-27b-v2-gguf | 27,32 mil millones | GGUF (5 cuantizaciones) | No disponible | Apache-2.0 | Publicado, 0 descargas, 0 likes |
| ProCreations/grug-27b-v2 (base) | 27,32 mil millones | Pesos completos (safetensors, segun relacion `base_model:quantized`) | No disponible | Apache-2.0 | Publicado |
| Alternativas de terceros de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

Los resultados de la busqueda web realizada no aportan informacion util sobre este modelo ni sobre modelos comparables: los enlaces devueltos corresponden a foros y descargas de software sin relacion con el modelo.

## Limitaciones y advertencias

- Idioma: solo se declara ingles. No hay evaluacion multilingue ni garantia de comportamiento en castellano u otros idiomas.
- Alucinacion: no se publica ninguna evaluacion de veracidad ni de tasas de alucinacion; al ser un modelo de 27B sin benchmarks publicos, el riesgo debe asumirse como no cuantificado.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos ni de seguridad.
- Bucles de razonamiento residuales: el autor reconoce explicitamente que "residual loops remain" (persisten bucles residuales) y que las trazas de razonamiento de alta dificultad pueden desviarse del estilo Grug.
- El nivel de esfuerzo `xhigh` no mejora de forma consistente todas las metricas medidas, pese a consumir mas tokens.
- Decodificacion especulativa: la cabeza MTP viene empaquetada, pero debe activarse en tiempo de ejecucion. No se garantiza la identidad de tokens en modo greedy entre distintas rutas de ejecucion con MTP ni una aceleracion universal.
- Contexto: la calidad con la ventana de contexto completa no ha sido establecida; el unico valor usado en el ejemplo es 12288 tokens.
- Compatibilidad de plantilla: el `llama-server` fijado acepta `reasoning_content` canonico e historial en linea, pero descarta el alias de entrada `reasoning` antes de renderizar la plantilla. Esto se registra como una sonda de capacidad fallida en cada modo. Si se reenvian historiales estilo vLLM hay que usar `normalize_messages.py`.
- Vision: los pesos del proyector se conservan, pero no se ha ejecutado ningun benchmark de vision nuevo; el rendimiento visual es desconocido.
- Validacion limitada: la unica prueba descrita es una de 16 casos de codigo por cuantizacion, que el autor califica explicitamente como no equivalente a un benchmark.
- Madurez del repositorio: 0 descargas y 0 likes, creado en agosto de 2026 y actualizado en septiembre de 2026; no hay validacion independiente conocida.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de licencia y los ficheros de atribucion correspondientes. No se declaran restricciones adicionales, pero el modelo base podria arrastrar obligaciones propias de su origen (etiqueta `qwen3_5`), no detalladas en la informacion disponible.
- Integridad de los archivos: el autor recomienda verificar las descargas contra `SHA256SUMS`.
- Todo el computo del modelo y de la conversion GGUF se realizo en HF Jobs, segun el registro `hf_jobs_cost.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/grug-27b-v2-gguf
- Modelo base (pesos completos): https://huggingface.co/ProCreations/grug-27b-v2
- Proyector de vision (F16): https://huggingface.co/ProCreations/grug-27b-v2-gguf/blob/main/mmproj-grug-27b-v2-F16.gguf
- Resultados de las pruebas: https://huggingface.co/ProCreations/grug-27b-v2-gguf/blob/main/results.md
- Guia de uso: https://huggingface.co/ProCreations/grug-27b-v2-gguf/blob/main/usage.md
- Script de normalizacion de mensajes: https://huggingface.co/ProCreations/grug-27b-v2-gguf/blob/main/normalize_messages.py
- Registro de conversion GGUF: https://huggingface.co/ProCreations/grug-27b-v2-gguf/blob/main/gguf_conversion.json
- Sumas de verificacion: https://huggingface.co/ProCreations/grug-27b-v2-gguf/blob/main/SHA256SUMS
- Contabilidad de coste de HF Jobs: https://huggingface.co/ProCreations/grug-27b-v2-gguf/blob/main/hf_jobs_cost.json
- Repositorio de llama.cpp (commit usado en la conversion, `2a3005c23f60cb38dab70b8ea2ddbd969bcf3e87`): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo adicionales: no disponible. La busqueda web no devolvio ningun resultado relacionado con el modelo.
