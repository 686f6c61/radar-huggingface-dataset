# dbgworld/AutoDecompiler-30B-e2e-Q4_K_M-GGUF

## Resumen

`dbgworld/AutoDecompiler-30B-e2e-Q4_K_M-GGUF` es una conversion a formato GGUF del modelo `AutoDecompiler/AutoDecompiler-30B-e2e`, un modelo de lenguaje de aproximadamente 30.500 millones de parametros (30.532.122.624 segun los pesos en safetensors del modelo base). La conversion la ha realizado el usuario `dbgworld` mediante el espacio `GGUF-my-repo` de ggml.ai, que automatiza el proceso de cuantizacion con llama.cpp. El resultado es un unico archivo de pesos cuantizado en Q4_K_M, pensado para inferencia local con llama.cpp y compatible con endpoints.

La relevancia de esta publicacion es practica: el modelo original, por su tamano, requiere hardware de gama alta en precision completa o semiprecision; esta version Q4_K_M reduce el repositorio a 18,6 GB, lo que lo hace desplegable en estaciones de trabajo con una sola GPU de 24 GB o en Mac con memoria unificada suficiente. El nombre del modelo sugiere un entrenamiento orientado a tareas de descompilacion (end-to-end), aunque la model card no aporta detalles sobre el dataset ni el proceso de entrenamiento.

La ficha presenta una limitacion importante: la informacion disponible es escasa. El autor de la conversion no documenta arquitectura, contexto, licencia ni idiomas, y no se han publicado resultados de benchmarks. Todo lo que no consta se marca explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin confirmar por el autor) |
| Parametros totales | 30.532.122.624 (~30,5 B) |
| Parametros activos | no aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `autodecompiler-30b-e2e-q4_k_m.gguf`) |
| Tamano del repositorio | 18,6 GB |
| Modelo base | AutoDecompiler/AutoDecompiler-30B-e2e |
| Herramienta de conversion | llama.cpp / GGUF-my-repo (ggml.ai) |
| Compatibilidad | llama.cpp, endpoints compatibles |

## Arquitectura y entrenamiento

No hay informacion publicada en la model card sobre la arquitectura interna del modelo base (tipo de transformer, uso de atencion lineal, mezcla de expertos u otras innovaciones). El nombre "AutoDecompiler-30B-e2e" sugiere un entrenamiento end-to-end orientado a descompilacion automatica de binarios, pero se trata de una inferencia a partir del identificador y no de un dato confirmado. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico verificable es el proceso de conversion: los pesos originales se transformaron a GGUF con llama.cpp y se cuantizaron a Q4_K_M. Esta cuantizacion de 4 bits con mezcla de tipos (K-quant medium) reduce el peso de los pesos de ~61 GB en FP16 a 18,6 GB, con una perdida de calidad tipicamente modesta en modelos de este tamano, aunque no se han publicado evaluaciones que lo cuantifiquen para este caso concreto.

## Capacidades

- Generacion de texto autoregresiva mediante llama.cpp (CLI y servidor).
- Compatibilidad con el formato GGUF y con el ecosistema llama.cpp, incluido `llama-server` con API compatible con OpenAI.
- Uso potencial para tareas de descompilacion o analisis de codigo binario, segun sugiere el nombre del modelo base, sin confirmacion documental.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Descompilacion asistida de binarios: si el modelo cumple lo que su nombre indica, podria recibir fragmentos de ensamblador o pseudocodigo y generar reconstrucciones en C o pseudocodigo de alto nivel; el formato GGUF permite ejecutarlo en local sin enviar binarios a servicios externos.
- Analisis de malware en entornos aislados: al ser un modelo cuantizado desplegable en una estacion de trabajo, encaja en laboratorios con requisitos de confidencialidad donde no se puede usar una API en la nube.
- Ingenieria inversa y auditoria de seguridad: apoyo a analistas para resumir funciones, identificar patrones de compiladores o proponer nombres de simbolos en artefactos sin depurar.
- Prototipado local de pipelines de codigo: con `llama-server` se puede exponer una API compatible con OpenAI y conectar el modelo a scripts de analisis estatico o herramientas de CI.
- Evaluacion de modelos especializados: util como referencia para comparar la calidad de un modelo de 30 B cuantizado frente a alternativas generalistas en tareas de codigo de bajo nivel.
- Inferencia en hardware de consumo: con 18,6 GB de pesos, es viable en una RTX 4090 (24 GB) o en Mac con 32 GB de memoria unificada, lo que permite experimentar sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,6 GB solo para los pesos en Q4_K_M; hay que sumar el espacio para la cache KV, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para carga completa con contexto moderado; A100 40/80 GB y H100 para contextos largos o mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB de VRAM; en GPUs de 16 GB requeriria offload parcial a CPU y perderia velocidad.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier runtime compatible con GGUF; no se ha publicado variante para vLLM ni TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de 30 B orientadas a codigo o descompilacion.

## Limitaciones y advertencias

- La model card no documenta licencia; no se debe asumir uso comercial permitido sin consultar el repositorio del modelo base `AutoDecompiler/AutoDecompiler-30B-e2e`.
- No hay informacion sobre sesgos, idiomas ni datos de entrenamiento, por lo que no es posible evaluar riesgos de sesgo o alucinacion de forma fundamentada.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo original; no se ha publicado ninguna evaluacion de la degradacion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El nombre sugiere una especializacion en descompilacion; usarlo como modelo generalista puede dar resultados inferiores a alternativas documentadas.
- No se especifica la longitud de contexto soportada; configurar contextos largos sin conocerla puede degradar la calidad o provocar errores.
- El repositorio solo contiene la variante Q4_K_M; no hay opciones en FP16, Q5, Q8 ni otras cuantizaciones en este espacio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/dbgworld/AutoDecompiler-30B-e2e-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/AutoDecompiler/AutoDecompiler-30B-e2e
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
