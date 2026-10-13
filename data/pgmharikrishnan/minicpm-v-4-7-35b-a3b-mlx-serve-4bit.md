# pgmharikrishnan/MiniCPM-V-4.7-35B-A3B-MLX-Serve-4bit

## Resumen

MiniCPM-V-4.7-35B-A3B-MLX-Serve-4bit es una conversion a MLX y cuantizacion a 4 bits del modelo openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario pgmharikrishnan. No se trata de un modelo entrenado desde cero, sino de un "pack" de pesos optimizado para ejecutarse en hardware de Apple Silicon mediante la libreria MLX y el servidor mlx-serve. El objetivo es permitir la inferencia local del tronco de lenguaje de MiniCPM-V 4.7 en equipos Mac, aprovechando el pipeline de cuantizacion de mlx-lm.

La conversion descarta explicitamente la torre de vision y el modulo merger del modelo original, de modo que este pack es exclusivamente de texto. El tronco de lenguaje conserva la arquitectura Qwen3.5 en configuracion MoE (etiquetada como qwen3_5_moe), con 34.659.887.872 parametros totales almacenados (aproximadamente 34,66 mil millones) y una nomenclatura de nombre "35B-A3B" que sugiere del orden de 3 mil millones de parametros activos por token. El repositorio ocupa 19,5 GB.

Su relevancia actual es practica: demuestra el flujo de conversion de modelos MoE grandes a un formato cuantizado de 4 bits ejecutable en Macs, manteniendo el enrutador MoE (mlp.gate y shared_expert_gate) en 8 bits para preservar la calidad de la seleccion de expertos. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer sobre tronco de lenguaje Qwen3.5 (qwen3_5_moe) |
| Parametros totales | 34.659.887.872 (34,66 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones, segun la nomenclatura "A3B" del nombre del modelo (no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afina, tamano de grupo 64; enrutador MoE (mlp.gate) y shared_expert_gate en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX, libreria mlx) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) construida sobre la arquitectura Qwen3.5, identificada en el repositorio como `qwen3_5_moe`. La conversion a MLX se realizo con la herramienta `convert` de mlx-lm e incluye varios ajustes tecnicos: el desplazamiento +1 de RMSNorm queda integrado en los pesos, la convolucion conv1d se transpone y la proyeccion fusionada de expertos `gate_up_proj` se divide en `switch_mlp`. Como resultado, el pack emplea el mismo layout que los paquetes Qwen3.5 de mlx-community y carga tanto en mlx-serve como en mlx-lm.

La cuantizacion es afina de 4 bits con tamano de grupo 64. La decision de mantener el enrutador MoE (`mlp.gate`) y el `shared_expert_gate` en 8 bits busca preservar la precision en la seleccion de expertos, que es sensible a la cuantizacion agresiva. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que estos datos corresponden al modelo original y no se detallan en la informacion proporcionada. Tampoco se documenta ninguna innovacion de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion: el pack esta orientado al pipeline text-generation y al uso conversacional.
- Razonamiento y codigo: al ser un tronco de lenguaje Qwen3.5, se le presuponen capacidades generales de generacion, razonamiento y programacion, aunque no se aportan datos especificos en la informacion disponible.
- Ejecucion local en Apple Silicon: disenado para inferencia nativa en Mac mediante MLX y mlx-serve.
- Sin vision: la torre de vision y el merger fueron eliminados expresamente, por lo que este modelo no procesa imagenes, a diferencia del MiniCPM-V original.
- Tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac para desarrollo: permite ejecutar un modelo MoE de aproximadamente 34,66 mil millones de parametros en un equipo Apple Silicon, gracias a la cuantizacion de 4 bits y al formato MLX, ideal para probar y depurar aplicaciones sin depender de la nube.
- Asistente de texto en escritorio: se puede servir como API local mediante `mlx-serve serve --port 11234` y consumirla desde editores, IDEs o scripts para generacion y reescritura de texto.
- Generacion de codigo asistida en entornos sin GPU dedicada: al ejecutarse en Mac, encaja en flujos de trabajo de desarrolladores que quieren autocompletado o generacion de codigo sin acceso a una GPU NVIDIA.
- Procesamiento por lotes de documentos de texto: para resumir, clasificar o transformar documentos largos en local, siempre que el contexto disponible (no documentado) lo permita.
- Chatbot conversacional autoalojado: uso como backend de conversacion multi-turno en aplicaciones propias, aprovechando el tag "conversational".
- Experimentacion con arquitecturas MoE: sirve como referencia para estudiar como se comporta un MoE grande cuantizado a 4 bits con el enrutador en 8 bits dentro del ecosistema MLX.
- Evaluacion comparativa de cuantizacion: util para medir el impacto en calidad de la cuantizacion afina de 4 bits frente a los pesos originales en tareas de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon, ya que el modelo usa MLX y la libreria mlx-serve/mlx-lm.
- Memoria unificada estimada: el repositorio pesa 19,5 GB, por lo que se recomienda un minimo de 24 GB de memoria unificada; 32 GB o mas deja margen para cache KV y el propio sistema.
- Equipos recomendados: Mac con chip de la familia M (M1/M2/M3/M4) en configuracion Max o Ultra con 32 GB o mas de memoria unificada.
- Viabilidad en hardware de consumo: si, en Macs de gama alta con memoria unificada suficiente; no esta pensado para GPUs NVIDIA ni para el ecosistema CUDA.
- Opciones de despliegue: mlx-serve (servidor y modo `run`) y mlx-lm. No es compatible con vLLM, llama.cpp, Ollama o TGI, que no ejecutan el formato MLX.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| Este pack (MiniCPM-V-4.7-35B-A3B-MLX-Serve-4bit) | 34,66 mil millones totales | 4 bits MLX (router en 8 bits) | no disponible | Apache-2.0 | Apple Silicon (MLX) |
| openbmb/MiniCPM-V-4.7-35B-A3B | no disponible (modelo original completo) | sin cuantizar (formato original) | no disponible | Apache-2.0 | multiplataforma, incluye vision |
| Paquetes Qwen3.5 de mlx-community | no disponible | 4 bits MLX | no disponible | no disponible | Apple Silicon (MLX) |

La diferencia principal respecto al modelo original es la eliminacion de la vision y la cuantizacion. Frente a los paquetes Qwen3.5 de mlx-community, comparte layout de pesos, lo que facilita la interoperabilidad dentro de mlx-serve y mlx-lm.

## Limitaciones y advertencias

- Sin capacidades de vision: la torre de vision y el merger se eliminaron, por lo que no puede procesar imagenes; no debe confundirse con el MiniCPM-V original.
- Riesgo de alucinacion: no evaluado en la informacion disponible; aplica el riesgo habitual de los modelos generativos de texto.
- Sesgos: no documentados, dado que no se describe el dataset de entrenamiento.
- Limitaciones de contexto e idioma: no disponible; no se especifican la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache-2.0, permisiva para uso comercial, heredada del modelo original, aunque se recomienda verificar los terminos del modelo base openbmb/MiniCPM-V-4.7-35B-A3B.
- Dependencia de plataforma: solo funciona en el ecosistema MLX (Apple Silicon); no es portable a CUDA ni a otros runners sin reconversion.
- Naturaleza de la publicacion: es una conversion de la comunidad (0 descargas y 0 likes en el momento del registro), no una version oficial, por lo que conviene validar la calidad de los pesos cuantizados antes de usarla en produccion.
- Fecha de creacion y actualizacion registradas en 2026-10-12, poco habitual; conviene verificar la procedencia de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pgmharikrishnan/MiniCPM-V-4.7-35B-A3B-MLX-Serve-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Repositorio de mlx-serve: https://github.com/ddalcu/mlx-serve
