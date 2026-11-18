# kindlingai/sage-s2.1-flash-exlr8-k4

## Resumen

Sage-S2.1-Flash exlr8 K4 es una cuantizacion de 4 bits del modelo Sage S2.1 Flash, desarrollado por el Shanghai Artificial Intelligence Laboratory (InternLM). El repositorio, publicado por kindlingai, distribuye los pesos del modelo base en el formato propietario exlr8 v2, disenado especificamente para dispositivos de memoria unificada de clase NVIDIA GB10, como DGX Spark y ASUS GX10. La cuantizacion afecta a todos los expertos enrutados y compartidos, manteniendo la torre de vision sin modificar en BF16.

El modelo subyacente emplea la arquitectura GLM-5.3-Flash: 45 capas (las tres primeras densas y el resto MoE), 288 expertos enrutados con top-8 routing mas un experto compartido por capa MoE, tamano oculto de 4096, tamano intermedio de experto de 2048, una capa MTP (multi-token prediction) y una torre de vision. Es, por tanto, un modelo multimodal de imagen-texto a texto con capacidad conversacional y de razonamiento.

La relevancia de esta release radica en que demuestra la viabilidad de servir un MoE multimodal de gran escala comprimido a 4 bits por peso en hardware consumer de memoria unificada, mediante tensor parallelism a TP=2 sobre dos cajas GB10 conectadas por RoCE. El autor advierte que la release esta en estado de preview: solo se ha probado entrada de texto y los benchmarks de codigo y velocidad completa siguen pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GLM-5.3-Flash): 45 capas, 0-2 densas, 3-44 MoE, capa MTP 45, torre de vision |
| Parametros totales | no disponible |
| Parametros activos | 288 expertos enrutados con top-8 routing mas 1 experto compartido por capa MoE (numero de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exlr8 v2 K4 (4 bits por peso) en expertos enrutados y compartidos; MXFP8, FP8 con escalas por bloque y BF16 en matrices densas segun tipo; torre de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato trellis exlr8 v2), con slices de indice por rango TP 1-4 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base GLM-5.3-Flash, un transformer con mezcla de expertos: 45 capas, de las cuales las tres primeras son densas y las capas 3 a 44 son MoE. Cada capa MoE contiene 288 expertos enrutados con top-8 routing y un experto compartido adicional. El tamano oculto es 4096 y el tamano intermedio de cada experto es 2048. Incluye una capa de multi-token prediction (MTP) en la posicion 45 y una torre de vision que procesa entradas de imagen.

Esta release concreta no aporta informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO). Lo que si documenta es el proceso de cuantizacion: cada experto enrutado y compartido se almacena con un unico ancho trellis K4, mientras que las matrices densas se codifican de forma heterogenea (trellis K4 para salida de atencion y `q_b_proj`, MXFP8 para `q_a_proj`, `kv_a_proj_with_mqa`, indexer y MTP `eh_proj`, FP8 con escalas por bloque para `kv_b_proj`, y BF16 para router, indexer `weights_proj`, normas y sesgos). La innovacion tecnica destacable es el requisito de redondeo E4M3: cualquier loader debe redondear cada valor producido por el codebook trellis a FP8 E4M3 (round to nearest even, saturando) antes de aplicar los vectores laterales; un decoder EXL3 estandar o cualquier decoder que omita este redondeo lee pesos mediblemente peores de los mismos bytes.

## Capacidades

- Generacion de texto y conversacion multi-turno, con capacidad de razonamiento heredada del modelo base.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de vision en BF16.
- Capacidad de mezcla de expertos con routing top-8, lo que permite activar solo una fraccion de los expertos por token.
- Multi-token prediction mediante la capa MTP 45.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en clúster de dos GB10: el modelo esta disenado para servirse con gr8 a TP=2 sobre dos cajas GB10 (DGX Spark, ASUS GX10) conectadas por RoCE, lo que permite ejecutar un MoE multimodal de 165,4 GB en hardware de memoria unificada de gama consumer.
- Asistente conversacional multimodal: al aceptar entrada de imagen y texto, puede gestionar dialogos que combinen capturas, documentos escaneados o imagenes con preguntas en lenguaje natural.
- Prototipado de investigacion en cuantizacion: el repositorio incluye metricas de fidelidad frente a BF16 (KL, top-1, NLL) y manifiestos con set_id, lo que lo convierte en material de referencia para estudiar el impacto de la cuantizacion trellis a 4 bits.
- Evaluacion de decoders FP8 E4M3: sirve como banco de pruebas para validar implementaciones de carga que respeten el requisito de redondeo E4M3 antes de aplicar vectores laterales.
- Servicio con tensor parallelism: los slices de indice por rango TP 1-4 permiten distribuir la inferencia entre 1 y 4 dispositivos, util para experimentar con topologias de despliegue.
- Generacion de codigo y analisis tecnico: aunque el benchmark de codigo esta pendiente, las metricas NLL sobre textos CUDA y Python indican que la cuantizacion K4 mantiene la fidelidad en dominios de programacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL media (BF16 vs K4, vocabulario completo, 41 filas de 2.048 tokens) | 0.0985 |
| Acuerdo top-1 (forward offline) | 91,0% |
| NLL delta en prosa (offline) | +0.0014 |
| NLL delta en CUDA (offline) | -0.0120 |
| NLL delta en Python (offline) | +0.0041 |
| NLL delta en prosa (servido por gr8, TP=2) | +0.0045 |
| NLL delta en CUDA (servido por gr8, TP=2) | +0.0002 |
| NLL delta en Python (servido por gr8, TP=2) | -0.0012 |
| KL top-20 (servido por gr8, TP=2, 20.470 posiciones) | 0.0485 |
| Acuerdo top-1 (servido por gr8, TP=2) | 90,8% |
| Acuerdo top-1 entre servido y offline | 93,8% |
| Benchmark de codigo de 18 tareas | pendiente |
| Benchmark de velocidad completo | pendiente |

Como referencia de escala, el autor cita que la model card de GLM-5.3-Flash reporta KL 0.384 para su K4 y 0.472 para su K3, si bien se trata de un modelo distinto y de texto held-out diferente, por lo que no es una comparacion equivalente.

## Requisitos de hardware

- Espacio en disco: 165,4 GB para la release completa; 156,6 GB corresponden a expertos enrutados y compartidos (ficheros de capa mas indices); 8,1 GB a ficheros densos, de vocabulario y de vision.
- Memoria: disenado para dispositivos de memoria unificada de clase GB10 (DGX Spark, ASUS GX10); el despliegue documentado usa TP=2 sobre dos cajas GB10.
- GPU recomendadas: NVIDIA GB10 (DGX Spark, ASUS GX10). Otras GPU (A100, H100, RTX 4090) no estan documentadas en la informacion disponible.
- Cabe en consumer GPU: si, en el hardware GB10 especificado; no hay datos para GPUs consumer convencionales con VRAM discreta.
- Opciones de despliegue: gr8 (repositorio kindlingai/gr8) con `./gr8 glm53f up --tp 2`; el formato es el mismo que el de kindlingai/glm-5.3-flash-exlr8-k2-k3-k4. vLLM, llama.cpp, Ollama o TGI no estan documentados para este formato.
- Latencia y throughput: no disponible; el benchmark de velocidad completo esta pendiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-S2.1-Flash exlr8 K4 (esta release) | MoE 288 expertos top-8 + 1 compartido; totales no disponibles | no disponible | exlr8 v2 K4 (4 bits) | MIT | Hugging Face, formato trellis para GB10 |
| GLM-5.3-Flash exlr8 K2/K3/K4 | misma arquitectura GLM-5.3-Flash | no disponible | exlr8 v2 K2, K3 y K4 | no disponible | Hugging Face (kindlingai/glm-5.3-flash-exlr8-k2-k3-k4) |
| Sage-S2.1-Flash (BF16, base) | misma arquitectura, pesos BF16 | no disponible | BF16 | no disponible | Hugging Face (internlm/Sage-S2.1-Flash) |

## Limitaciones y advertencias

- Estado de preview: la model card indica que solo se ha probado entrada de texto; el benchmark de codigo de 18 tareas y el benchmark de velocidad completo siguen pendientes.
- Requisito critico de decodificacion: los pesos no pueden usarse sin redondeo E4M3. Un decoder EXL3 estandar o cualquier decoder que omita el redondeo lee pesos mediblemente peores de los mismos bytes.
- Diferencia entre servido y offline: el modelo servido por gr8 y el forward offline coinciden en el token top-1 solo en el 93,8% de las posiciones; el autor indica que la causa de esta brecha esta en revision.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no disponible en la informacion proporcionada.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan documentados en esta release.
- Restricciones de licencia: licencia MIT, lo que permite uso comercial segun los terminos del fichero LICENSE del repositorio; no se detallan restricciones adicionales.
- Caveat de produccion: la cuantizacion introduce perdida medible frente a BF16 (KL media 0.0985, acuerdo top-1 91,0% en forward offline); conviene validar la calidad en el dominio concreto antes de desplegar.
- Dependencia de hardware y software: el formato trellis exlr8 v2 y el motor gr8 estan atados a dispositivos GB10 y a la topologia TP documentada; no hay soporte documentado en stacks de inferencia convencionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kindlingai/sage-s2.1-flash-exlr8-k4
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Motor gr8: https://github.com/kindlingai/gr8
- Release de referencia de formato (GLM-5.3-Flash exlr8 K2/K3/K4): https://huggingface.co/kindlingai/glm-5.3-flash-exlr8-k2-k3-k4
