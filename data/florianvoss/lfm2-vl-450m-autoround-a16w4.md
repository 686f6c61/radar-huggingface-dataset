# florianvoss/LFM2-VL-450M-Autoround-a16w4

## Resumen

`florianvoss/LFM2-VL-450M-Autoround-a16w4` es un artefacto compilado, no un modelo entrenado desde cero. Se genera a partir de `simaai/LFM2-VL-450M-Autoround-Safetensors`, una versión precuantizada con AutoRound del modelo vision-language LFM2-VL-450M (familia LFM2), y se empaqueta para ejecutarse en el hardware SiMa Modalix mediante el runtime LLiMa, dentro de la colección Neat 0.6.0 del mismo autor.

El problema que resuelve es el despliegue de un modelo imagen-texto de ~450 millones de parámetros en un acelerador de borde con restricciones de memoria y cómputo: los pesos se codifican en INT4 con grupos de 256 y excepciones de precisión mixta, las activaciones se mantienen en BF16, y los embeddings y la caché KV pasan a INT8. La compilación fija la longitud máxima de contexto en 4096 tokens y la resolución de imagen en 512 × 512 píxeles, y produce 93 ejecutables ELF junto con los recursos de runtime en `devkit/`.

Su relevancia es acotada pero concreta: no sirve como checkpoint reutilizable en GPU, sino como binario listo para un dispositivo Modalix con LLiMa compatible. El repositorio ocupa 0,8 GB, no declara idiomas soportados, no publica benchmarks y el autor indica explícitamente que no se han realizado mediciones de precisión ni de rendimiento en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-language (pipeline `image-text-to-text`) del linaje LFM2-VL; la arquitectura interna del modelo base no se detalla en la informacion disponible. El repositorio contiene un grafo compilado (ModelGraph) para SiMa Modalix |
| Parametros totales | ~450 millones (segun la denominacion LFM2-VL-450M); no se desglosa el reparto entre torre de vision y componente de lenguaje |
| Parametros activos | No aplica (no consta que el modelo base sea Mixture of Experts) |
| Longitud de contexto | 4096 tokens (maximo fijado en la compilacion); tamano de grupo de prefill: 128 |
| Tipos de cuantizacion | Pesos INT4 con granularidad de grupo 256 (INT4/G256) y excepciones de precision mixta heredadas de la fuente precuantizada; activaciones BF16; embeddings y cache KV en INT8. No es un formato GGUF ni GPTQ estandar, sino codificacion propia del compilador |
| Idiomas soportados | No disponible |
| Licencia | `other`; se aplican los terminos del modelo fuente `simaai/LFM2-VL-450M-Autoround-Safetensors` |
| Formato de pesos | Artefacto compilado para SiMa Modalix: `elf_files/` con 93 ejecutables, `devkit/` con recursos de runtime, `compilation.json` con las revisiones de fuente y compilador, y `compile.sh` con los argumentos completos de compilacion. No se distribuyen safetensors ni GGUF |
| Resolucion de imagen | 512 × 512 pixeles (fijada en la compilacion) |
| Libreria / runtime | `llima` (LLiMa runtime sobre Modalix); compilado con Model Compiler, compilacion nativa ModelGraph con 16 procesos en paralelo y un hilo de simulador por proceso |
| Inferencia en el Hub | Marcada como `inference: false` en los metadatos del repositorio |

## Arquitectura y entrenamiento

Este repositorio no documenta ningun proceso de entrenamiento: es el resultado de una cadena de tres etapas. Primero, un modelo vision-language LFM2-VL-450M; segundo, una cuantizacion AutoRound que produce `simaai/LFM2-VL-450M-Autoround-Safetensors`; tercero, una compilacion con el Model Compiler de SiMa que genera el paquete `a16w4`. Por tanto, no hay informacion sobre tokens de entrenamiento, composicion del dataset, fases de RLHF o DPO, ni sobre innovaciones de atencion del modelo original.

Lo que si esta documentado es la configuracion de compilacion: contexto maximo de 4096 tokens con grupos de prefill de 128, imagenes de 512 × 512, pesos codificados en INT4/G256 con excepciones de precision mixta tomadas de la fuente precuantizada, activaciones en BF16, embeddings y cache KV en INT8, y comparticion de filtros activada por defecto para los componentes de lenguaje. La compilacion usa ModelGraph nativo con 16 procesos paralelos, cada uno con su propio hilo de simulador, y fija la longitud de contexto y las resoluciones de imagen admitidas en el momento de compilar, de modo que cambiarlas exige recompilar.

El paquete incluye `compile.sh`, que documenta la descarga de la fuente y los argumentos completos del compilador; las revisiones exactas de codigo fuente y compilador quedan registradas en `compilation.json`. Para reconstruirlo hace falta un entorno de Model Compiler compatible, con las variables `MODEL_DIR` y `OUTPUT_DIR` y argumentos adicionales opcionales.

## Capacidades

- Generacion de texto condicionada por imagen: el pipeline declarado es `image-text-to-text`, es decir, respuestas en lenguaje natural a partir de un par imagen + prompt.
- Procesamiento de imagenes a 512 × 512 pixeles, resolucion fijada durante la compilacion.
- Conversacion de un solo turno o multiturno dentro de una ventana de 4096 tokens, suficiente para prompts con instrucciones e historial breve.
- Capacidades de razonamiento, codigo, matematicas, tool calling, function calling y uso como agente: no documentadas en la informacion disponible.
- Soporte multilingue: no disponible; el repositorio no declara lista de idiomas.
- Modos especiales (thinking, vision de alta resolucion, audio, video): no disponibles; solo consta la entrada de imagen a 512 × 512.
- Ejecucion en dispositivo SiMa Modalix con runtime LLiMa; no se anuncia soporte de otros backends.

## Casos de uso

- Descripcion de imagenes para accesibilidad: con 4096 tokens de contexto y entrada fija de 512 × 512, el modelo puede generar descripciones y resumentes de escenas en local, sin enviar la imagen a un servicio remoto, lo que simplifica el cumplimiento de privacidad.
- Verificacion visual en linea de produccion: en una planta o cadena de montaje, el artefacto se ejecuta en un Modalix junto a la camara y responde a prompts del tipo "describe el estado de la pieza" sin depender de conectividad ni de GPU dedicada.
- Inspeccion de documentos y formularios escaneados: el modelo puede responder preguntas sobre el contenido de una imagen de documento, util en digitalizacion de archivos donde no se permite salida a la nube.
- Asistencia en punto de venta o almacen: lectura de etiquetas, identificacion de productos o comprobacion de estanterias a partir de una captura, integrado en el propio terminal con el runtime LLiMa.
- Triaje y preclasificacion de imagenes en el borde: primera pasada que descarta o etiqueta capturas antes de enviarlas a un modelo mayor en servidor, reduciendo ancho de banda y coste por inferencia.
- Robotica movil y AGV: interpretacion de la escena a baja resolucion para tareas de navegacion asistida o comprobacion de estado, donde el consumo energetico y la predictibilidad del acelerador importan mas que la precision maxima.
- Prototipado y evaluacion de hardware Modalix: el paquete sirve como referencia funcional para validar una cadena de compilacion y despliegue completa (descarga, `llima run`, ejecucion en dispositivo) antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica explicitamente que la generacion en runtime sobre Modalix y las mediciones de precision y rendimiento no se realizan en el proceso de compilacion de este repositorio; solo consta que la compilacion completa y el despliegue local finalizaron correctamente y que los ficheros se verificaron por checksum.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo se ejecuta sobre la memoria del SoC SiMa Modalix, no sobre memoria de GPU. El repositorio pesa 0,8 GB.
- GPU recomendadas: ninguna. El artefacto son ejecutables ELF y recursos de runtime para Modalix; no es un checkpoint cargable en CUDA o ROCm.
- GPU de consumo (RTX 4090, 3090, etc.): no compatible. Tampoco cabe esperar ejecucion en CPU convencional con llama.cpp u Ollama, porque no se distribuyen pesos en safetensors ni GGUF.
- Opciones de despliegue: runtime LLiMa sobre Modalix, con `hf download florianvoss/LFM2-VL-450M-Autoround-a16w4 --local-dir ...` seguido de `llima run ./LFM2-VL-450M-Autoround-a16w4`. Recompilacion mediante Model Compiler con un entorno compatible y `compile.sh`.
- vLLM, TGI, llama.cpp, Ollama: no soportados por el formato entregado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Requisito de version: hace falta una version de runtime LLiMa y de compilador coherentes con las registradas en `compilation.json`; contextos y resoluciones distintos obligan a recompilar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| `florianvoss/LFM2-VL-450M-Autoround-a16w4` | ~450 M | 4096 tokens | Artefacto compilado (ELF + devkit) | SiMa Modalix con LLiMa | `other` |
| `simaai/LFM2-VL-450M-Autoround-Safetensors` | ~450 M | No disponible | Safetensors precuantizados con AutoRound | No especificado en la informacion disponible | Terminos del modelo fuente |
| LFM2-VL-450M original | 450 M | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No verificada en esta busqueda |
| Otros builds de la coleccion Neat 0.6.0 | Variable | Variable | Artefactos compilados para Modalix | SiMa Modalix con LLiMa | Los terminos de cada modelo fuente |

La comparacion relevante no es de calidad, sino de empaquetado: frente al checkpoint precuantizado, este repositorio anade la compilacion para un acelerador concreto y elimina la portabilidad a GPU. No hay datos publicos que permitan comparar precision o velocidad con alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: es un artefacto de compilacion. Cualquier mejora o cambio de comportamiento debe hacerse sobre la fuente y recompilar.
- No se han publicado mediciones de precision ni de rendimiento en runtime; el propio autor lo declara. No hay evidencia publica de la calidad de las respuestas tras la cuantizacion INT4/G256.
- La cuantizacion a INT4 en pesos, con embeddings y cache KV en INT8, puede degradar tareas sensibles a precision numerica, como OCR fino o conteo de objetos; no se aportan evaluaciones que lo cuantifiquen.
- Ventana de contexto limitada a 4096 tokens y resolucion de imagen fija de 512 × 512: no apto para documentos densos, imagenes de alta resolucion ni conversaciones largas.
- Licencia `other` con remision a los terminos del modelo fuente: es imprescindible revisar la licencia de `simaai/LFM2-VL-450M-Autoround-Safetensors` antes de cualquier uso comercial o redistribucion. Este repositorio no aclara por si mismo los derechos de uso.
- Dependencia fuerte de hardware y toolchain: requiere SiMa Modalix y una version de runtime LLiMa compatible; no hay camino de despliegue alternativo documentado.
- Idiomas soportados no declarados: no se puede asumir calidad en castellano ni en ningun otro idioma concreto sin evaluacion propia.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, agravado por la falta de benchmarks publicados y por la compresion de pesos.
- Repositorio sin descargas ni valoraciones y con metadatos que marcan `inference: false`; no debe tratarse como un artefacto validado por la comunidad.
- No hay informacion sobre sesgos del modelo base ni sobre filtrado de datos; no se puede evaluar su comportamiento en dominios sensibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/florianvoss/LFM2-VL-450M-Autoround-a16w4
- Modelo base (checkpoint precuantizado): https://huggingface.co/simaai/LFM2-VL-450M-Autoround-Safetensors
- Arbol de la revision fuente citada: https://huggingface.co/simaai/LFM2-VL-450M-Autoround-Safetensors/tree/52a6f670a59cf41ab814e20883a248e36b5cb05b
- Coleccion Neat 0.6.0: https://huggingface.co/collections/florianvoss/neat-060
- Ficheros de configuracion de la compilacion: `compilation.json` y `compile.sh` dentro del repositorio
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada
