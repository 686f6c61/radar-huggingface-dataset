# minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-20

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-20 es una variante podada del modelo multimodal Nemotron 3.5 Super VL de NVIDIA, publicada por el usuario minkyoungs. Se trata de un transformer de tipo Mixture of Experts (MoE) con arquitectura `nemotron_h_omni`, cuantizado en NVFP4 (4 bits de punto flotante) y sometido a una poda no uniforme del 20 % de los expertos enrutados mediante la tecnica IA-REAP (instruction-aware REAP). El checkpoint resultante conserva 54.478.769.674 parametros y ocupa 62,3 GB en el repositorio.

El modelo base declara 120B de parametros totales con 12B activos por token (de ahi el sufijo A12B), de modo que la poda reduce el numero de expertos enrutados de 20.480 a 16.384, manteniendo intactas las capas MoE primera y ultima (1, 3, 85 y 87) con 512 expertos cada una. El checkpoint pasa de 70 GiB a 58 GiB en pesos NVFP4, sin reentrenamiento posterior.

Su relevancia es doble: por un lado demuestra que la poda de expertos guiada por instrucciones puede aplicarse sobre modelos MoE multimodales de gran tamano manteniendo la licencia original; por otro, exige un parche especifico en vLLM para soportar capas MoE con distinto numero de expertos, lo que lo convierte en un caso practico interesante para quienes investigan tecnicas de compresion y despliegue eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (nemotron_h_omni) |
| Parametros totales | 54.478.769.674 (tras poda; el base declara 120B) |
| Parametros activos | 12B (sufijo A12B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), modelopt_mixed; pesos en 8-bit declarados en tags |
| Idiomas soportados | no disponible (calibracion de poda en coreano e ingles) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de la familia Nemotron 3.5 Super VL, con 120B de parametros totales y 12B activos por token, distribuidos en 40 capas MoE con 512 expertos enrutados cada una en el checkpoint original. Este derivado aplica una poda no uniforme: agrupa las capas MoE en cuatro clusters segun la puntuacion media de sus expertos, elimina la misma proporcion en cada cluster y, dentro de cada uno, retira expertos de 8 en 8 desde la capa cuyos siguientes 8 expertos peor puntuados suman menos. Cada capa conserva al menos la media del cluster menos 16 y al menos el top-k del router. El resultado son entre 384 y 416 expertos por capa en la mayoria de capas, con las capas 1, 3, 85 y 87 intactas con 512.

La puntuacion de expertos se realiza con REAP sobre datos de calibracion en coreano e ingles, conservando el mayor de los dos scores normalizados por experto. Posteriormente el score se ajusta segun cuanto aumenta la cuota de enrutamiento de un experto cuando se antepone un system prompt del mismo idioma que el usuario, de modo que se conservan preferentemente los expertos implicados en seguir el idioma de la instruccion. Los pesos del router correspondientes a los expertos eliminados se eliminan tambien. No hay reentrenamiento ni destilacion: se parte del checkpoint NVFP4 original y solo se recortan expertos y sus filas de router. El modelo requiere un parche en vLLM 0.31.0 para permitir que distintas capas MoE tengan distinto numero de expertos.

## Capacidades

- Generacion de texto y razonamiento multimodal, heredadas del modelo base Nemotron 3.5 Super VL (vision y lenguaje).
- Procesamiento de imagenes y texto combinados, segun la naturaleza VL del modelo original.
- Soporte de tool calling y function calling, presumiblemente heredado del base (no verificado en esta ficha).
- Capacidades de agente y razonamiento multi-paso, heredadas del base.
- Capacidades multilingues: la calibracion cubre coreano e ingles y el ajuste IA-REAP preserva explicitamente expertos sensibles al idioma del system prompt.
- El resto de capacidades especificas (thinking mode, audio, etc.) no estan documentadas en la informacion disponible y deben consultarse en la model card del modelo base.

## Casos de uso

- Despliegue multimodal en produccion con VRAM limitada: la reduccion de 70 GiB a 58 GiB en NVFP4 permite servir el modelo en configuraciones de 2 GPU con tensor parallelism, alli donde el checkpoint original no cabria.
- Investigacion en compresion de modelos MoE: sirve como referencia reproducible de poda no uniforme con ajuste por instrucciones, comparando el comportamiento del modelo podado frente al original en tareas de seguimiento de idioma.
- Evaluacion de robustez tras poda: util para medir cuanto degrada la eliminacion del 20 % de expertos en tareas de vision-lenguaje, razonamiento y codigo, con la ventaja de que el autor publica la lista de expertos conservados en `pruning_info.json`.
- Atencion al cliente multilingue: el ajuste instruction-aware conserva expertos sensibles al idioma del system prompt, lo que resulta adecuado para asistentes que deben responder en el idioma del usuario en conversaciones multi-turno.
- Generacion de codigo asistida con contexto visual: al ser un modelo VL, puede integrarse en pipelines que reciben capturas de pantalla o diagramas y generan codigo o explicaciones, con el ahorro de memoria del checkpoint podado.
- Fine-tuning ligero o adaptadores sobre una base mas pequena: al reducir el numero de parametros y el tamano del checkpoint, abarata el coste de experimentacion con LoRA o QLoRA sobre un MoE multimodal.
- Servicio de inferencia con vLLM en cluster: el parche incluido permite desplegar el modelo con `vllm serve` y tensor-parallel-size 2, facilitando su integracion en infraestructuras existentes basadas en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta en curso y que los resultados se anadiran mas adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 58 GiB en NVFP4, por lo que se necesita al menos esa cantidad de memoria agregada, mas overhead de KV cache y activaciones.
- GPU recomendadas: 2 x A100 80 GB o 2 x H100 80 GB en tensor parallelism, configuracion sugerida en la model card (`--tensor-parallel-size 2`).
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o RTX 5090 no pueden alojar el checkpoint completo; seria necesario cuantizar mas agresivamente o usar offloading, no soportado de forma nativa por esta distribucion.
- Opciones de despliegue: vLLM 0.31.0 con el parche incluido en el repositorio (obligatorio para soportar capas MoE con distinto numero de expertos). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-20 | 54,5B (12B activos, tras poda) | no disponible | OpenMDW-1.1 | Hugging Face (minkyoungs) |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 (base) | 120B (12B activos) | no disponible | OpenMDW-1.1 | Hugging Face (nvidia) |
| Alternativas MoE podadas de la familia Nemotron | no disponible | no disponible | no disponible | no disponible |

La comparacion principal es con el modelo base, del que este deriva: mismo licencia y familia, pero con un 20 % menos de expertos enrutados y un checkpoint un 17 % mas pequeno (70 GiB frente a 58 GiB). No se dispone de datos de rendimiento comparativo ni de otros modelos directamente equiparables en la informacion proporcionada.

## Limitaciones y advertencias

- La poda elimina el 20 % de los expertos sin reentrenamiento, por lo que es esperable cierta degradacion en tareas dependientes de los expertos eliminados; el autor no ha publicado aun la evaluacion comparativa.
- La seleccion de expertos se calibro unicamente con datos en coreano e ingles, lo que puede sesgar el comportamiento en otros idiomas no representados en la calibracion.
- El ajuste instruction-aware prioriza expertos sensibles al idioma del system prompt, lo que podria introducir un sesgo hacia instrucciones explicitas de idioma en detrimento de otros tipos de instrucciones.
- Requiere un parche no oficial de vLLM 0.31.0; cualquier actualizacion de vLLM puede romper la compatibilidad y obligar a mantener una version fijada.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran tamano, no cuantificado en esta ficha.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; la model card remite a la licencia del modelo base para condiciones de uso, limitaciones, sesgos y notas de seguridad y privacidad.
- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se documentan la longitud de contexto, los idiomas soportados oficialmente ni los requisitos exactos de VRAM mas alla del tamano del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-20
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
