# esatapedico/MiniCPM-V-4.7-35B-A3B-NVFP4

## Resumen

MiniCPM-V-4.7-35B-A3B-NVFP4 es un checkpoint cuantizado en NVFP4 del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, un VLM con backbone de texto tipo MoE (estilo qwen3_5_moe) y torre de visión tipo SigLIP2. Lo publica esatapedico, un desarrollador independiente que trabaja sobre hardware de consumo, y no se trata de un modelo nuevo ni de un fine-tuning: es una conversión de pesos desde el checkpoint BF16 oficial (70,4 GB, 16 shards, 1.152 tensores) a un formato `compressed-tensors` `nvfp4-pack-quantized` de aproximadamente 24 GB. La licencia Apache-2.0 se mantiene en toda la cadena.

El interés practico es la reduccion de huella: el checkpoint pasa de 70,4 GB a unos 24 GB cuantizando unicamente las proyecciones feed-forward de los expertos (routed y shared), y manteniendo en BF16 atencion, routers, normas, embeddings, `lm_head` y la torre de vision. Segun el autor, todos los tensores no cuantizados son byte-identicos al original, lo que reduce el riesgo tipico de degradacion en conversiones de este tipo. La cuantizacion es datafree, sin corpus de calibracion.

El modelo esta pensado para servir en GPUs Blackwell, que son las que decodifican NVFP4 de forma nativa. El autor valido la calidad sobre la familia GGUF derivada (PPL 4,19-4,43 y MMLU 80,9-82,3 % con n=1000 en dos tarjetas Blackwell de 16 GB), pero advierte de que no ha probado una carga real en vLLM. La longitud de contexto, el numero exacto de parametros activos y los idiomas soportados mas alla de "multilingual" no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `MiniCPMV4_7ForConditionalGeneration`: backbone de texto MoE estilo qwen3_5_moe (atencion completa + ruta SSM de atencion lineal) con torre de vision estilo SigLIP2 y merger con window-attention |
| Parametros totales | 21.064.994.984 (~21,06 B) segun los safetensors del repo; la denominacion comercial del modelo indica 35B-A3B |
| Parametros activos | ~3 B segun la nomenclatura A3B del modelo base; no verificado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A16, "NVFP4A16"), group size 16, escalas FP8 E4M3 por tensor, weight only, datafree; formato `compressed-tensors` `nvfp4-pack-quantized`. El repo hermano GGUF ofrece seis niveles de cuantizacion |
| Idiomas soportados | en, multilingual (sin listado detallado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (2 shards: ~20,01 GB + ~3,94 GB); GGUF en el repo hermano |

## Arquitectura y entrenamiento

El modelo base es un VLM de 40 capas con 256 expertos enrutados por capa y un experto compartido, sobre un backbone de texto MoE que combina atencion completa con una ruta de atencion lineal de tipo SSM (tensores `alpha`/`beta`/`out`). La vision corre en una torre SigLIP2 con un merger basado en window attention. El `config.json` declara `mtp_num_hidden_layers: 1`, pero el checkpoint fuente no contiene tensores MTP: OpenBMB publica el drafter DSpark como modelo separado y aqui se ha excluido de forma deliberada, lo que evita el fallo conocido de llm-compressor al descartar tensores MTP de forma silenciosa.

No hay entrenamiento ni fine-tuning en esta ficha: es una derivacion puramente de cuantizacion. El alcance cuantizado son `layers.N.mlp.experts.down_proj`, `layers.N.mlp.experts.gate_up_proj` (forma fusionada) y `shared_expert.{gate,up,down}_proj.weight`. Los expertos enrutados quedan empaquetados por experto (30.720 grupos NVFP4 empaquetados) y el experto compartido permanece fusionado (120 modulos). El resto de tensores se conserva en BF16 y, segun el autor, byte-identico al origen, incluido un problema de perturbacion de normas de llm-compressor que se detecto y corrigio restaurando los bytes fuente. La receta exacta esta en `recipe.yaml`, y los datos de preentrenamiento del modelo base (numero de tokens, composicion, RLHF/DPO) no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto e imagen-a-texto: la pipeline declarada es `image-text-to-text` y el modelo conserva la torre de vision completa en BF16.
- Comprension de documentos e imagenes: al mantener la torre SigLIP2 y el merger intactos, las capacidades visuales del modelo base no se ven afectadas por la cuantizacion, que solo toca el feed-forward de los expertos.
- Inferencia MoE eficiente: con ~3 B de parametros activos por token segun la nomenclatura A3B, el coste de computo por token es muy inferior al de un denso de 21-35 B.
- Multilingue: la model card declara `en` y `multilingual`, sin desglose de idiomas ni evaluaciones por idioma.
- Conversacional multi-turno: etiqueta `conversational` y plantilla de chat intacta en el checkpoint.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Thinking mode, audio u otras capacidades especiales: no documentado en la informacion disponible.

## Casos de uso

- Digitalizacion de documentos en on-premise: el modelo acepta imagen y texto, y con ~24 GB de pesos se puede desplegar en una unica GPU Blackwell de gama alta sin depender de servicios externos, algo relevante parafacturas, contratos o expedientes con requisitos de confidencialidad.
- Extraccion de datos de capturas y formularios: uso tipico image-text-to-text para convertir pantallazos o PDF renderizados en campos estructurados, manteniendo el pipeline completo dentro de la infraestructura propia.
- Automatizacion robótica de procesos (RPA) con comprension de pantalla: analisis de capturas de interfaz para decidir el siguiente paso en flujos de back office, aprovechando que el modelo combina lectura de imagen y generacion de texto en una sola pasada.
- Asistencia a soporte tecnico con imagenes adjuntas: el usuario envia una foto de un error, un panel o un producto y el modelo responde en el mismo hilo; la ventana de contexto concreta no esta documentada, asi que el dimensionado del historial debe validarse en pruebas propias.
- Descripcion y alt-text automatizado a escala: generacion de descripciones de imagenes para catalogos o accesibilidad, con coste por token reducido gracias al enrutado MoE (~3 B activos).
- Despliegue en estaciones de trabajo con GPU de consumo Blackwell: el autor valido la calidad en dos tarjetas Blackwell de 16 GB usando los GGUF derivados, lo que habilita prototipos y demos locales sin cluster.
- Clasificacion y moderacion de contenido visual: etiquetado de imagenes subidas por usuarios con instrucciones en lenguaje natural, ejecutado en la misma GPU que el resto del stack.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la familia GGUF derivada de este checkpoint, no al safetensors NVFP4 servido en vLLM:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Perplejidad (PPL) | 4,19 - 4,43 | A lo largo de los seis niveles GGUF |
| MMLU | 80,9 % - 82,3 % | n=1000, dos tarjetas Blackwell de 16 GB |
| Puertas de calidad | Todas superadas | Verificacion del autor sobre GGUF |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU en formato NVFP4 servido con vLLM, ni para HumanEval, GSM8K, MMMU, DocVQA u otras tareas multimodales. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM para inferencia: ~24 GB solo de pesos en NVFP4 (20,01 GB + 3,94 GB en dos shards), mas KV cache y overhead del runtime. El checkpoint BF16 de origen ocupa 70,4 GB.
- GPUs recomendadas: cualquier GPU Blackwell con decodificacion NVFP4 nativa; el autor verifico sobre dos tarjetas Blackwell de 16 GB (via GGUF). Una RTX 5090 de 32 GB es el escenario natural para el safetensors completo con margen para KV cache.
- Cabe en GPU de consumo: si, en Blackwell de 16 GB a traves de los GGUF del repo hermano; el safetensors NVFP4 de 24 GB queda justo en tarjetas de 24 GB y sobrado en 32 GB.
- En generaciones anteriores (Hopper/Ada) no hay soporte nativo de NVFP4, por lo que habria que recurrir a dequantizacion o conversion; no se documenta ningun camino validado en esa direccion.
- Opciones de despliegue: llama.cpp mediante el repo GGUF (ruta verificada de extremo a extremo: BF16 -> este checkpoint -> GGUF con `convert_hf_to_gguf.py --outtype auto`, NVFP4 nativo, tipo GGML 40); vLLM y motores con soporte de `compressed-tensors` (deteccion automatica desde el config, carga no probada por el autor); transformers con `compressed-tensors`.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a la model card de la familia GGUF para las mediciones de velocidad.
- Nota practica: `mtp_num_hidden_layers` aparece en el config pero no hay tensores MTP, de modo que no se puede activar decodificacion especulativa con el drafter DSpark sin descargar ese modelo por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| esatapedico/MiniCPM-V-4.7-35B-A3B-NVFP4 | 21,06 B en safetensors (denominacion 35B-A3B) | no disponible | NVFP4 W4A16 + GGUF (6 niveles) | Apache-2.0 | HuggingFace, 0 descargas |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | 35B-A3B segun denominacion; 70,4 GB BF16 | no disponible | BF16 | Apache-2.0 | HuggingFace (upstream) |
| esatapedico/MiniCPM-V-4.7-35B-A3B-NVFP4-GGUF | mismo modelo, formato GGUF | no disponible | 6 niveles GGUF + mmproj | Apache-2.0 | HuggingFace |

No hay datos en la informacion disponible para comparar con alternativas de otros laboratorios (por ejemplo VLMs MoE de rango similar); cualquier comparacion de rendimiento con terceros requeriria benchmarks propios. Tampoco se dispone de cifras de MMLU del checkpoint base BF16 en esta informacion, por lo que no es posible cuantificar la perdida exacta introducida por la cuantizacion mas alla del rango de PPL y MMLU reportado.

## Limitaciones y advertencias

- La carga en vLLM no ha sido probada por el autor. La verificacion se limita a la comprobacion de identidad de bytes, la ruta GGUF y los benchmarks sobre GGUF; un despliegue en produccion con vLLM debe validarse antes de asumir que funciona.
- NVFP4 requiere hardware Blackwell para aprovecharse de verdad; en otras arquitecturas el rendimiento puede degradarse o exigir conversiones no documentadas.
- La model card fue redactada por un asistente de IA a peticion del autor, que se reserva la responsabilidad del trabajo de ingenieria; el propio texto advierte de posibles errores en tamanos, configs y comandos. Conviene verificar contra los ficheros del repositorio.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion por terceros ni de validacion independiente.
- La ventana de contexto, los idiomas cubiertos y el soporte real de tool calling no estan documentados; no deben asumirse a partir de las capacidades tipicas de la familia MiniCPM-V.
- Riesgo de alucinacion y sesgos: inherente al modelo base; no se aporta ninguna evaluacion de sesgo ni de robustez en esta conversion.
- Solo se cuantiza el feed-forward de los expertos; la torre de vision permanece en BF16, de modo que el ahorro de memoria se concentra en el backbone de texto y el cuello de botella de la parte visual no cambia.
- Licencia Apache-2.0 permite uso comercial, pero el modelo deriva de un trabajo de terceros (OpenBMB) y de la herramienta llm-compressor (Red Hat AI / proyecto vLLM); conviene conservar la atribucion indicada en la seccion de procedencia.
- No hay modelo MTP incluido: la decodificacion especulativa requiere descargar el drafter DSpark por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/esatapedico/MiniCPM-V-4.7-35B-A3B-NVFP4
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Repo hermano GGUF (seis niveles + proyector mmproj): https://huggingface.co/esatapedico/MiniCPM-V-4.7-35B-A3B-NVFP4-GGUF
- Sitio del autor: https://www.esatapedico.com
- llm-compressor (Red Hat AI / proyecto vLLM): herramienta citada en la model card, sin URL incluida en la informacion disponible
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada (la busqueda web no devolvio resultados relevantes)
