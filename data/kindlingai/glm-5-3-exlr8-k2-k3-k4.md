# kindlingai/glm-5.3-exlr8-k2-k3-k4

## Resumen

GLM-5.3 exlr8 (K2/K3/K4) es una cuantizacion del modelo GLM-5.3 de Z.ai (zai-org), un transformer MoE de 744.000 millones de parametros con 256 expertos enrutados distribuidos en 75 capas MoE, mas una capa MTP (multi-token prediction) y tres capas densas iniciales. La cuantizacion la desarrolla el colectivo KindlingAI y emplea un formato propietario denominado exlr8 v2, basado en codigos de trellis con libro de codigos mul1, disenado especificamente para dispositivos con memoria unificada de clase NVIDIA GB10 (DGX Spark).

La peculiaridad del repositorio es que cada experto enrutado se almacena a tres anchos distintos (K2, K3 y K4) y un manifiesto de perfil decide, en tiempo de carga, que ancho usa cada experto. Esto permite elegir entre once perfiles con un promedio de entre 2,00 y 4,00 bits por peso enrutado, con tamanos de modelo que van de 199 GB a 380 GB, sin necesidad de descargar pesos adicionales. La calidad se mide con KL frente a BF16 sobre un panel propio de documentos largos y sesiones de agente.

Es relevante porque demuestra que un MoE de casi tres cuartos de billon de parametros puede servirse en hardware de consumo profesional de memoria unificada (varias cajas GB10 en tensor-parallel de 3 a 7), algo impensable con pesos BF16. La ficha se centra en lo documentado por el autor; los datos sobre el modelo base que no aparecen en la model card se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (glm_moe_dsa) con 75 capas MoE, 3 capas densas (0-2) y capa MTP (78); 256 expertos enrutados |
| Parametros totales | 744.000 millones (modelo base GLM-5.3) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exlr8 v2 trellis (K2, K3, K4 por experto); perfiles de 2,00 a 4,00 bits por peso enrutado; pesos densos y vocabulario en BF16 |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (licencia personalizada, `license: other`) |
| Formato de pesos | safetensors con codificacion trellis exlr8 v2; manifiestos JSON, index-slices por rango TP, hashes sha256 |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer de mezcla de expertos: 256 expertos enrutados por capa en 75 capas MoE, tres capas densas iniciales y una capa MTP (capa 78) orientada a decodificacion multi-token. Esta cuantizacion no reentrena el modelo; transforma los pesos a un formato trellis con libro de codigos mul1 y redondeo E4M3 obligatorio en el cargador. El repositorio conserva sin modificar `config.json`, `generation_config.json`, tokenizer y plantilla de chat del base `zai-org/GLM-5.3-BF16` (commit 9d2398f).

La innovacion principal es el esquema de anchos por experto: cada experto enrutado existe en K2, K3 y K4, y un manifiesto (`manifests/exlr8-manifest-bitNNN.json`) asigna un ancho a cada experto segun la capa, de modo que capas y proyecciones mas sensibles (por ejemplo, gate/up en capas centrales) reciben K4 mientras otras permanecen en K2. Los perfiles documentados van de `bit200` (todo K2, 199 GB) a `bit400` (380 GB). No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat propia (`chat_template.jinja`) heredada del base.
- Razonamiento y sesiones de agente: el autor evalua con sesiones que incluyen llamadas a herramientas y salida de herramientas, lo que indica soporte practico de tool calling en el modelo base (no se detalla el mecanismo exacto en la informacion disponible).
- Codigo y contenido estructurado: el panel de evaluacion incluye documentos con base64, hashes e identificadores, lo que sugiere uso sobre texto tecnico denso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modo thinking: no disponibles en la informacion proporcionada.
- Decodificacion multi-token mediante la capa MTP del modelo base.

## Casos de uso

- Despliegue de un MoE de 744B en clústeres de DGX Spark: con TP=3 o TP=4, cada caja GB10 almacena entre 47 y 122 GB de pesos de experto segun el perfil, lo que permite servir el modelo en 3-6 dispositivos sin GPUs de centro de datos.
- Prototipado con perfil de baja huella: usar `bit200` (199 GB) para iterar rapido en un entorno con memoria limitada y subir a `bit322` o `bit340` cuando se requiera calidad, sin descargar pesos nuevos.
- Evaluacion de cuantizaciones: el repositorio incluye `tools/card.py` y `assets/card.json` para regenerar tablas de perfiles y curvas KL a partir de los manifiestos y las mediciones, util para comparar anchos en un pipeline propio.
- Servicio de agente con tool calling: el panel de KL del autor incluye sesiones de agente con llamadas y salidas de herramientas, por lo que el modelo esta pensado para flujos de razonamiento multi-paso con herramientas externas.
- Procesamiento de documentos tecnicos largos: el test de KL sobre documentos held-out con base64, hashes e IDs respalda su uso en extraccion y transformacion de contenido estructurado.
- Investigacion en compresion de MoE: el esquema de anchos por experto y los perfiles documentados sirven como referencia para estudiar el compromiso entre bits por peso y divergencia KL en modelos de gran escala.
- Inferencia en Metal (Mac): via `GordoAR/MLXLR8`, un motor EXLR8 para Metal, permite probar los pesos en hardware Apple con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor solo publica divergencia KL frente a BF16 por perfil:

| Perfil | Bits/peso enrutado | Tamano | KL texto del modelo (media / mediana) | Texto held-out (media / mediana) | Wikitext (media / mediana) |
|---|---|---|---|---|---|
| `bit200` | 2,00 | 199 GB | 0,248 / 0,0440 | 0,267 / 0,0397 | 0,367 / 0,0728 |
| `bit240` | 2,40 | 235 GB | 0,146 / 0,0244 | 0,218 / 0,0270 | 0,199 / 0,0327 |
| `bit280` | 2,80 | 271 GB | 0,086 / 0,0125 | 0,166 / 0,0147 | 0,121 / 0,0175 |
| `bit322` | 3,22 | 310 GB | 0,058 / 0,0088 | 0,149 / 0,0118 | 0,076 / 0,0105 |
| `bit400` | 4,00 | 380 GB | 0,038 / 0,0057 | 0,124 / 0,0079 | 0,050 / 0,0067 |

El autor advierte que estas cifras solo son comparables entre cuantizaciones medidas con su mismo test; en el panel corto de cuatro ventanas que usan otras tarjetas de GLM-5.3, `bit325` obtiene 0,025 de media.

## Requisitos de hardware

- Memoria: el modelo completo ocupa entre 199 GB (`bit200`) y 380 GB (`bit400`); los pesos densos y de vocabulario suman 12,5 GB en BF16.
- Por caja en TP=4: entre 47 GB (`bit200`) y 92 GB (`bit400`) de pesos de experto; en TP=3, entre 62 GB y 122 GB.
- Hardware objetivo: dispositivos de clase NVIDIA GB10 (DGX Spark) con memoria unificada, en configuraciones de 3 a 6 cajas.
- No cabe en GPUs de consumo convencionales (RTX 4090, 24 GB) ni en una unica A100/H100 de 80 GB; requiere agregacion de memoria entre dispositivos.
- Motores: `kindlingai/gr8` (nativo exlr8, TP=3 y TP=4), `kindlingai/exlr8` (cargador de referencia en PyTorch puro), `ashhart/TensorFold` (multiplataforma) y `GordoAR/MLXLR8` (Metal).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3 exlr8 (este) | 744B MoE | no disponible | exlr8 trellis, 2,00-4,00 bits | glm-5.3 | Hugging Face y ModelScope |
| GLM-5.3 BF16 (`zai-org/GLM-5.3-BF16`) | 744B MoE | no disponible | BF16 sin cuantizar | glm-5.3 | Hugging Face |
| Otras cuantizaciones de GLM-5.3 | 744B MoE | no disponible | paneles cortos de 4 ventanas | glm-5.3 | Hugging Face |

No se dispone de datos de rendimiento de benchmarks para comparar con alternativas de la misma categoria; la unica comparacion posible es la divergencia KL, y el autor senala que sus cifras no son directamente comparables con las de otras tarjetas que usan paneles mas cortos.

## Limitaciones y advertencias

- La licencia `glm-5.3` es personalizada (`license: other`); es imprescindible revisar `LICENSE` antes de cualquier uso comercial.
- El formato exlr8 v2 es propietario de KindlingAI; fuera de los motores compatibles (gr8, TensorFold, MLXLR8, cargador de referencia) no hay soporte garantizado.
- El cargador debe aplicar el redondeo E4M3 especificado en `FORMAT.md`; un kernel incorrecto produce pesos invalidos sin error evidente.
- La calidad depende fuertemente del perfil elegido: `bit200` presenta KL media de 0,248 en texto del modelo, muy superior a la de `bit400` (0,038).
- Las cifras KL son mediciones del autor sobre su propio panel; no sustituyen a benchmarks estandar y no son comparables con las de otras cuantizaciones.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni longitud de contexto en la documentacion disponible.
- El repositorio pesa 1.672,4 GB; el almacenamiento y la transferencia entre cajas son un coste operativo relevante.
- El despliegue exige multiples dispositivos GB10; no es viable en una unica GPU.

## Enlaces

- Hugging Face: https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4
- ModelScope (espejo): https://www.modelscope.ai/models/kindlingai/glm-5.3-exlr8-k2-k3-k4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Formato y cargador de referencia: https://github.com/kindlingai/exlr8
- Especificacion del formato: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Motor nativo gr8: https://github.com/kindlingai/gr8
- TensorFold: https://github.com/ashhart/TensorFold
- MLXLR8 (Metal): https://github.com/GordoAR/MLXLR8
