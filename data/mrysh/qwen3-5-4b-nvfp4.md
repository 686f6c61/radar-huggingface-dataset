# mrysh/qwen3.5-4b-nvfp4

## Resumen

mrysh/qwen3.5-4b-nvfp4 es una version cuantizada a NVFP4 (4 bits en coma flotante de NVIDIA, con group size 16) del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh. No se trata de un modelo entrenado desde cero, sino de un artefacto de cuantizacion generado con nvidia-modelopt 0.47.0 sobre 512 muestras de calibracion mixtas, orientado a un benchmark comparativo de tecnicas de cuantizacion (4 modelos x 8 tecnicas) evaluado con vLLM sobre BFCL, Energy-QA, hiring-bias y MedQA. Su interes es practico: permite desplegar un modelo de la familia Qwen3.5 en GPUs Blackwell con menor huella de memoria y mayor throughput que en BF16.

El checkpoint conserva las partes de vision y audio en 16 bits, mientras que el cuerpo de texto se cuantiza a aproximadamente 4 bits. El autor lo evalua explicitamente como modelo de texto con el modo "thinking" desactivado. El repositorio ocupa 3,307 GB en disco y declara 2.423.172.096 parametros en los tensores safetensors, por debajo de los 4B nominales del nombre, lo que sugiere que el recuento excluye componentes multimodales o embeddings no incluidos en el checkpoint.

La relevancia actual del artefacto es doble: por un lado, demuestra el flujo de cuantizacion NVFP4 con ModelOpt sobre un modelo reciente de Qwen; por otro, su caracter de experimento de benchmark implica que no debe tratarse como una release estable de produccion. La licencia Apache 2.0 heredada del modelo base facilita su uso comercial, pero la informacion publicada sobre el propio checkpoint cuantizado es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer de la familia Qwen3.5 (tag `qwen3_5_text`); detalles no disponibles en la informacion proporcionada |
| Parametros totales | 2.423.172.096 (segun safetensors); el modelo base se denomina 4B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, aproximadamente 4 bits, group size 16; componentes de vision y audio en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados con nvidia-modelopt 0.47.0) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento del modelo base Qwen/Qwen3.5-4B. El autor no documenta la arquitectura interna del modelo original (numero de capas, dimension oculta, tipo de atencion, uso de MoE o de atencion lineal), mas alla del tag `qwen3_5_text`, que indica que el cuerpo principal es un modelo de texto de la familia Qwen3.5. Tampoco se detalla el proceso de entrenamiento del modelo base: numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Toda esa informacion debe consultarse en la model card de Qwen/Qwen3.5-4B, a la que el autor remite.

La innovacion tecnica del artefacto es la propia cuantizacion NVFP4: formato de 4 bits en coma flotante de NVIDIA con group size 16, generado con nvidia-modelopt 0.47.0 y calibrado con 512 muestras mixtas. La cuantizacion se aplica al cuerpo de texto, mientras que los modulos de vision y audio se mantienen en 16 bits para preservar su calidad. El checkpoint esta pensado para cargarse directamente en vLLM mediante `vllm serve <repo>`. La ganancia de velocidad depende de hardware Blackwell, ya que NVFP4 requiere soporte nativo de esa generacion (por ejemplo, RTX PRO 6000 o B200); en GPUs anteriores el formato no aporta la misma ventaja e incluso puede requerir rutas de emulacion o no ser compatible.

## Capacidades

- Generacion de texto y razonamiento en el cuerpo de texto del modelo base Qwen3.5-4B; el autor lo evalua con el modo "thinking" desactivado, por lo que las capacidades de razonamiento extendido no estan verificadas en esta version.
- Conserva los modulos de vision y audio en 16 bits, por lo que el checkpoint mantiene la estructura multimodal del modelo base, aunque el autor no documenta evaluaciones multimodales.
- Soporte de tool calling y function calling: el autor lo evalua en BFCL (Berkeley Function Calling Leaderboard), lo que indica que el formato es compatible con tareas de llamada a funciones.
- Capacidades multilingues: no documentadas en la informacion disponible; dependen del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este checkpoint.
- Modo "thinking": existe en el modelo base, pero el autor lo desactiva en sus evaluaciones y no reporta resultados con el activado.

## Casos de uso

- Despliegue de bajo coste en GPUs Blackwell: el checkpoint esta pensado para servirse con `vllm serve` en hardware con soporte NVFP4 (RTX PRO 6000, B200), reduciendo la huella de memoria frente a BF16 y liberando VRAM para lotes mayores.
- Evaluacion comparativa de tecnicas de cuantizacion: encaja en pipelines de benchmark que comparan NVFP4 con otras tecnicas (por ejemplo, INT4, AWQ o GPTQ) sobre las mismas tareas (BFCL, Energy-QA, hiring-bias, MedQA), ya que el autor lo publica precisamente con ese proposito.
- Experimentacion academica con formatos de 4 bits: util para investigadores que estudian el impacto de NVFP4 en la calidad de modelos de ~4B, con un checkpoint ya calibrado y listo para cargar en vLLM.
- Pruebas de function calling en entornos de desarrollo: al estar evaluado en BFCL, sirve para prototipar asistentes que invocan APIs y herramientas en un servidor vLLM local antes de escalar a un modelo mayor.
- Validacion de pipelines multimodales con cuerpo de texto cuantizado: como los modulos de vision y audio se mantienen en 16 bits, permite comprobar si la cuantizacion del texto degrada tareas que combinan imagen o audio con generacion de texto.
- Base para ajuste fino o destilacion sobre un checkpoint compacto: su tamano en disco (3,3 GB) y su licencia Apache 2.0 lo hacen manejable para experimentos que parten de un modelo ya cuantizado, siempre que la herramienta de entrenamiento soporte NVFP4.

## Benchmarks y rendimiento

El autor menciona que el checkpoint forma parte de un benchmark de cuantizacion (4 modelos x 8 tecnicas) evaluado con vLLM sobre BFCL, Energy-QA, hiring-bias y MedQA, pero no publica en la informacion disponible los resultados numericos de dichas evaluaciones para este checkpoint concreto.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,307 GB en disco; en VRAM se necesita espacio adicional para cache KV y buffers de ejecucion, por lo que una estimacion conservadora parte de unos 4-5 GB para el peso del modelo mas la cache, dependiendo de la longitud de contexto (no disponible).
- GPU recomendadas: el autor indica que la ganancia de velocidad requiere una GPU Blackwell, como RTX PRO 6000 o B200. En GPUs sin soporte nativo de NVFP4 el checkpoint no ofrece las ventajas previstas.
- Cabe en GPU de consumo: no confirmado. Las RTX 40xx y anteriores no son Blackwell y no aprovecharian el formato; las RTX 50xx son Blackwell, pero el autor no documenta compatibilidad ni rendimiento en ellas.
- Opciones de despliegue: vLLM (`vllm serve <repo>`), segun el autor. No se mencionan llama.cpp, Ollama ni TGI, y es probable que no soporten NVFP4 de forma nativa.
- Latencia y throughput: no disponibles; el autor solo afirma que la ganancia de velocidad requiere hardware Blackwell, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrysh/qwen3.5-4b-nvfp4 | 2.423.172.096 (safetensors) | no disponible | NVFP4, group size 16 | Apache 2.0 | HuggingFace, 15 descargas |
| Qwen/Qwen3.5-4B (base) | ~4B (nominal) | no disponible | BF16 original | Apache 2.0 | HuggingFace |
| Otras cuantizaciones del mismo base (INT4, AWQ, GPTQ) | ~4B | no disponible | 4 bits enteros o mixtos | Apache 2.0 | segun el publicador |

La comparativa con alternativas de la misma categoria se limita al modelo base y a otras tecnicas de cuantizacion incluidas en el benchmark del autor (4 modelos x 8 tecnicas), cuyos nombres y resultados no se detallan en la informacion disponible. No se dispone de datos de rendimiento comparado (BFCL, Energy-QA, hiring-bias, MedQA) para este checkpoint.

## Limitaciones y advertencias

- Es un artefacto experimental de benchmark, no una release estable: el autor lo publica para comparar tecnicas de cuantizacion, con 15 descargas y 0 likes, y sin garantias de soporte.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo base; el autor no publica las metricas de esa degradacion en la informacion disponible.
- El modo "thinking" no esta evaluado: las evaluaciones se hicieron con thinking desactivado, por lo que el comportamiento en razonamiento extendido es desconocido.
- Dependencia de hardware Blackwell: en GPUs no Blackwell el checkpoint no aporta la ganancia de velocidad prevista y puede no ser compatible con vLLM en ese formato.
- Idiomas soportados no documentados; la cobertura linguistica depende del modelo base y no ha sido verificada tras la cuantizacion.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas, aunque el autor incluye hiring-bias en su bateria de pruebas, cuyos resultados no se publican.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor remite a la model card del modelo base para los terminos completos; conviene revisarla antes de desplegar en produccion.
- Los componentes de vision y audio se mantienen en 16 bits, lo que aumenta el consumo de memoria respecto a una cuantizacion puramente de texto y puede complicar el despliegue si no se necesitan esas modalidades.
- No hay informacion sobre el proceso de calibracion mas alla de las 512 muestras mixtas, por lo que se desconoce su representatividad para dominios concretos.

## Enlaces

- HuggingFace del checkpoint: https://huggingface.co/mrysh/qwen3.5-4b-nvfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Libreria de cuantizacion: nvidia-modelopt 0.47.0 (no se proporciona enlace en la informacion disponible)
- BFCL (Berkeley Function Calling Leaderboard): no se proporciona enlace en la informacion disponible
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
