# Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MTPLX

## Resumen

Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MTPLX es un reempaquetado del modelo multimodal Qwen3.8-Flash-Next (Qwen) publicado por el usuario Litwein. Se trata de un transformer MoE de 133,7 B parametros con torre de vision, podado con REAP de 512 a 320 expertos enrutados y cuantizado a 3 bits en los expertos (4,28 bits/peso global), al que se anade un sidecar MTP destilado por el propio modelo para decodificacion especulativa. Esta empaquetado para MLX y para el runtime MTPLX, y su publico objetivo son equipos Apple Silicon.

Es el hermano en FP16 del pack BF16 del mismo autor: los pesos son identicos byte a byte en el 82,6 % del empaquetado y solo cambia el tipo de almacenamiento de los tensores que nunca se cuantizaron (escalas, sesgos y normas en FP16, torre de vision en FP32). La razon es que los chips M1 y M2 no tienen BF16 nativo y deben convertir al vuelo, mientras que FP16 si es nativo en ellos; para M3 y superiores el autor recomienda el pack BF16, 0,9 GB mas pequeno.

Su relevancia es doble: permite servir localmente un MoE multimodal de 133,7 B con contexto largo en un Mac, y documenta con detalle el proceso de conversion de precision (99,99973 % de los 5 786 885 968 valores FP16 convertidos de forma exacta, cero desbordamientos). El autor advierte que no ha medido velocidades en M1/M2 y que las cifras de decodificacion disponibles (31-35 tokens/s frente a 24,2 sin MTP, en un M4 Pro de 48 GB) corresponden al pack BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con capas Gated DeltaNet, torre de vision y cabecera MTP para decodificacion especulativa |
| Parametros totales | 133,7 B (cifra declarada por el autor) |
| Parametros activos | no disponible (MoE con 320 expertos enrutados de 512 tras poda REAP; no se indica cuantos se activan por token) |
| Longitud de contexto | no disponible (el autor menciona pruebas con ~85 000 tokens de contexto vivo, sin especificar la ventana maxima soportada) |
| Tipos de cuantizacion | 3 bits en expertos enrutados; tronco en precision mixta (etiqueta oQ3e); tabla n-gram/PLE de 4 bits g32; tensores no cuantizados en FP16 (escalas, sesgos, normas); torre de vision en FP32; 4,28 bits/peso global |
| Idiomas soportados | en, ru |
| Licencia | qwen-community-1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | empaquetado para MLX / runtime MTPLX (biblioteca mlx); el contenedor de ficheros no se especifica en la informacion disponible |
| Hardware objetivo | Apple Silicon; esta build FP16 esta pensada para M1 y M2 |
| Metodo de compresion | REAP (poda de expertos) + cuantizacion DWQ de extremo a extremo + destilacion propia del sidecar MTP |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE multimodal con atencion hibrida: el autor menciona explicitamente kernels de convolucion depthwise de Gated DeltaNet entre los tensores no cuantizados, lo que indica la presencia de capas de atencion lineal junto a la atencion clasica. El modelo base incluye una torre de vision (448,9 M valores, promovidos a FP32 en este pack para que cada valor sea exacto) y una cabecera MTP (multi-token prediction) que actua como drafter para decodificacion especulativa. Sobre el modelo base se aplica REAP, que reduce el numero de expertos enrutados de 512 a 320, y despues una cuantizacion DWQ aplicada de extremo a extremo; el autor no desarrolla la sigla en la informacion disponible.

El entrenamiento del modelo base corresponde a Qwen y no se detalla en esta ficha. Lo que si describe el autor es que el sidecar MTP incluido en este repositorio es una destilacion propia entrenada sobre las trazas de agente y razonamiento de contexto largo del propio modelo. Los datasets declarados en el repositorio son SWE-bench/SWE-smith-trajectories, open-thoughts/OpenThoughts-114k, open-r1/OpenR1-Math-220k, bigcode/self-oss-instruct-sc2-exec-filter-50k, open-r1/verifiable-coding-problems-python_decontaminated-tested-shuffled, nvidia/OpenCodeReasoning, allenai/tulu-3-sft-mixture, HuggingFaceM4/ChartQA, HuggingFaceM4/DocumentVQA, agentsea/wave-ui-25k, lmms-lab/textvqa y detection-datasets/coco; la informacion disponible no especifica a que etapa del pipeline (base, ajuste o destilacion del MTP) corresponde cada uno ni si hubo RLHF o DPO.

Como innovacion destacable, el pack documenta un manifold de conversion de precision (`fp16-conversion-manifest.json`) con el desglose por tensor de los valores convertidos, los que colapsan a cero y los que caen en la rejilla subnormal, algo poco habitual en repositorios de cuantizacion.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con modo de agente de contexto largo segun las trazas empleadas para destilar el drafter MTP.
- Codigo: los datasets declarados incluyen trayectorias tipo SWE-bench, problemas verificables en Python e instrucciones de codigo autogeneradas.
- Matematicas y razonamiento verificado, a partir de OpenR1-Math-220k y OpenThoughts-114k.
- Vision multimodal (pipeline image-text-to-text): comprension de graficos (ChartQA), documentos (DocumentVQA) e imagenes con texto (TextVQA), y deteccion/descripcion sobre imagenes tipo COCO.
- Automatizacion de interfaces y agentes de UI, segun el dataset agentsea/wave-ui-25k.
- Decodificacion especulativa nativa mediante cabecera MTP, con profundidad de decodificacion configurable (el autor reporta mediciones a profundidad 2).
- Multilingue limitado a ingles y ruso, segun los idiomas declarados.
- Encaja en flujos de ajuste fino y experimentacion con cuantizacion (poda REAP, DWQ, auto-destilacion) sobre MLX.

## Casos de uso

- Agentes de resolucion de incidencias de codigo en local: el modelo se ha trabajado con trayectorias tipo SWE-bench, de modo que puede encadenar lectura de repositorio, edicion y verificacion de parches sin enviar codigo a servicios externos.
- Asistente de programacion con contexto de repositorio largo: con contexto vivo probado hasta ~85 000 tokens, permite mantener ficheros completos y trazas de compilacion dentro de la ventana.
- Analisis de documentos escaneados y graficos financieros: al cubrir ChartQA y DocumentVQA, se puede usar para extraer tablas y responder preguntas sobre informes en un pipeline de procesado por lotes.
- Automatizacion de QA de interfaz: con datos de wave-ui-25k, encaja en agentes que inspeccionan capturas de pantalla y deciden la siguiente accion sobre una UI.
- Catalogacion y descripcion de imagenes: la torre de vision en FP32 y los datos de COCO permiten generar descripciones y detectar objetos en flujos de gestion de activos digitales.
- Asistencia tecnica bilingue ingles/ruso en equipos distribuidos, aprovechando los dos idiomas declarados y el despliegue 100 % local.
- Servicio de inferencia con latencia reducida en Mac: la cabecera MTP permite acelerar la decodificacion de forma especulativa, util en herramientas interactivas de escritorio.
- Investigacion en compresion de modelos: el repositorio es un caso de estudio reproducible de poda REAP, cuantizacion mixta y auto-destilacion sobre MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas de brecha frente al profesor ("teacher-gap") del repositorio hermano, pero no incluye cifras en el texto proporcionado. El unico dato medido que aparece es de throughput de decodificacion y se recoge en la seccion de requisitos de hardware.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon, mediante MLX y el runtime MTPLX. No se declara soporte para CUDA, vLLM, TGI, llama.cpp ni Ollama.
- Build FP16 (esta): destinada a M1 y M2, donde FP16 es el tipo de 16 bits nativo. El autor no aporta ninguna medicion de velocidad en estos chips.
- Build BF16 (repositorio hermano): recomendada para M3 y superiores, con BF16 nativo y 0,9 GB menos de tamano.
- Medicion declarada: en un M4 Pro de 48 GB, los mismos pesos decodifican a aproximadamente 31-35 tokens/s con profundidad 2, desde prompts cortos hasta ~85 000 tokens de contexto vivo, frente a 24,2 tokens/s sin MTP. La medicion corresponde al pack BF16, no a este.
- Huella de memoria: no declarada de forma explicita. La estimacion aritmetica a partir de los datos publicados (133,7e9 parametros x 4,28 bits/peso) da unos 71,5 GB de pesos, cifra que no concuerda con el despliegue descrito en una maquina de 48 GB; es probable que parte del empaquetado (la tabla n-gram/PLE, descrita como transmitida en streaming) no resida completa en memoria. Conviene verificar el consumo real antes de planificar un despliegue.
- Precision de los tensores no cuantizados: 5 786 885 968 valores en FP16 con un 99,99973 % de conversiones exactas, magnitud maxima 14,88 y cero desbordamientos; 598 valores colapsan a cero (450 de ellos en `ngram.scales`) y 14 882 caen en la rejilla subnormal.
- Latencia: no disponible mas alla del throughput citado.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (FP16, MTPLX) | 133,7 B | 3-bit expertos, tronco mixto, 4,28 bits/peso | Apple Silicon M1/M2 | qwen-community-1.0 | Publico, 0 descargas y 0 likes en el momento del analisis |
| Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-DWQ-MTP-Vision-MTPLX (BF16) | Identicos | Identica | Apple Silicon M3 y superiores | qwen-community-1.0 | Publico |
| Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX (oMLX) | Identicos | Identica | Apple Silicon | qwen-community-1.0 | Publico |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible (relacion declarada: quantized) | no disponible | qwen-community-1.0 | Publico |

Los tres primeros comparten pesos y numeros de evaluacion; la eleccion entre ellos depende del chip y del runtime, no de la calidad. No se dispone de datos en la informacion proporcionada para comparar con alternativas de terceros de tamano o tarea equivalente.

## Limitaciones y advertencias

- Licencia qwen-community-1.0, etiquetada como "other" en HuggingFace: hay que revisar el texto completo antes de cualquier uso comercial, ya que la informacion disponible no detalla sus condiciones.
- Dependencia total de Apple Silicon y del runtime MTPLX: no hay pesos GGUF ni rutas de despliegue en GPU NVIDIA documentadas, lo que limita su uso en servidores convencionales.
- Cuantizacion agresiva: los expertos enrutados estan a 3 bits y la tabla n-gram a 4 bits. La perdida de calidad frente al modelo sin cuantizar no se cuantifica en esta ficha.
- El autor declara explicitamente que no ha medido el rendimiento en M1 ni en M2, que son los chips objetivo de esta build. Las cifras de velocidad citadas provienen del pack BF16 en un M4 Pro.
- Perdidas de precision conocidas: 598 valores colapsan a cero, 450 de ellos escalas del cuantizador en `ngram.scales`, con un desplazamiento declarado de como maximo 5e-7 en cada grupo de 32 pesos. No hay verificacion independiente de ese impacto.
- Idiomas declarados unicamente ingles y ruso: no hay garantia de calidad en castellano ni en otros idiomas.
- Contexto maximo no documentado: las pruebas llegan a ~85 000 tokens, pero se desconoce la ventana soportada y su comportamiento en el limite.
- Riesgo de alucinacion no evaluado: no se han publicado tasas de error ni evaluaciones de fidelidad para esta build.
- Repositorio sin validacion de la comunidad (0 descargas, 0 likes) y creado el 17 de septiembre de 2026; conviene tratar cualquier afirmacion de rendimiento como pendiente de replicacion.
- Las etiquetas incluyen `qwen4_exp` y `qwen3.8`, lo que sugiere una linea experimental del modelo base; la informacion disponible no aclara el estado de madurez del modelo subyacente.
- El sidecar MTP se destilo sobre trazas del propio modelo, de modo que puede heredar y amplificar sus sesgos en tareas de agente.

## Enlaces

- Repositorio HuggingFace (esta build): https://huggingface.co/Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MTPLX
- Repositorio hermano en BF16: https://huggingface.co/Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-DWQ-MTP-Vision-MTPLX
- Repositorio hermano para oMLX: https://huggingface.co/Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime MTPLX: https://github.com/youssofal/mtplx
- Manifiesto de conversion de precision: `fp16-conversion-manifest.json` (incluido en el repositorio)
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs o demos) sobre este modelo.
