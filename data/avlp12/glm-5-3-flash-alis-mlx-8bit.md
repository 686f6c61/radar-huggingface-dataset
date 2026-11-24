# avlp12/GLM-5.3-Flash-Alis-MLX-8bit

## Resumen

GLM-5.3-Flash-Alis-MLX-8bit es una cuantizacion de 8 bits en formato MLX del modelo zai-org/GLM-5.3-Flash, publicada por el usuario avlp12 para su ejecucion en Apple Silicon. El modelo base es un transformer de tipo mixture-of-experts con 320B parametros totales y 18B activos (designacion 320B-A18B), identificado internamente con la arquitectura `glm5_next` e implementado sobre la libreria mlx-vlm. La conversion se realizo mediante dequantizacion en streaming de la release oficial en FP8, con un total de 78.924.603.008 parametros efectivos almacenados en safetensors y un repositorio de 334,1 GB.

La relevancia de esta ficha radica en que se trata del tier de mayor fidelidad de una familia de cuantizaciones (4-bit, 6-bit y 8-bit) y actua como modelo profesor o referencia para evaluar las versiones de 4 bits mediante divergencia KL sobre paneles pareados. Frente a la build anterior retirada, que cuantizaba el router del MoE, esta version preserva el router (`mlp.gate`) y el sesgo de correccion en fp32, mantiene los arrays mHC y los parametros KDA `A_log`/`dt_bias` en fp32, conserva la torre de vision en bf16 y elimina la capa MTP (45), que se distribuye como drafter independiente.

El modelo esta pensado para generacion de texto conversacional y dispone de torre de vision, tool calling y modo de razonamiento segun la arquitectura del modelo base. Su licencia es MIT y los idiomas declarados son ingles y chino. No se han publicado en la informacion disponible datos detallados de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts, variante `glm5_next` (mlx-vlm) |
| Parametros totales | 320B (modelo base); 78.924.603.008 parametros almacenados en safetensors |
| Parametros activos | 18B (designacion 320B-A18B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit g64 affine en expertos, atencion, MLPs densas/compartidas, embeddings y head; router, mHC, KDA y normas sin cuantizar; vision en bf16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), repositorio de 334,1 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 320B parametros totales y 18B activos, identificado como `glm5_next`. La model card de esta cuantizacion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en el material proporcionado. La arquitectura incorpora componentes especificos que la conversion preserva de forma explicita: router del MoE (`mlp.gate`) con sesgo de correccion, arrays mHC, parametros de decaimiento KDA (`A_log`, `dt_bias`), normas y convoluciones, ademas de una torre de vision en bf16. La capa MTP (multi-token prediction) numero 45 se elimina del checkpoint y se publica por separado como drafter autonomo.

La innovacion tecnica mas relevante de esta build es la receta de cuantizacion: 8-bit g64 affine aplicada a expertos, atencion, MLPs densas y compartidas, embeddings y head, dejando en fp32 el router y los parametros sensibles a la precision. La build anterior, retirada, cuantizaba el router del MoE, lo que degradaba la seleccion de expertos. Ademas, la model card documenta hallazgos a nivel de arquitectura medidos sobre el arbol de 4 bits que aplican tambien a esta build: un kernel Metal fusionado para KDA que aporta un +20% de decode y un +50% de prefill a 131k tokens, ambos con resultados bit-identicos, y un ajuste de variables de entorno (`MLX_MAX_MB_PER_BUFFER=2048`, `MLX_MAX_OPS_PER_BUFFER=100000`) que aporta aproximadamente un +12% de decode en M3 Ultra.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y modo de pensamiento: el modelo base GLM-5.3-Flash pertenece a la familia GLM con capacidades de razonamiento; la model card no detalla la implementacion concreta en esta build.
- Procesamiento de vision: la torre de vision se conserva en bf16, por lo que el modelo mantiene capacidad multimodal de entrada de imagen.
- Tool calling y function calling: soportado por el modelo base; no se detalla el formato exacto en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: atribuibles al modelo base; sin detalle especifico en la model card de la cuantizacion.
- Multilinguee limitado a ingles y chino (idiomas declarados en los metadatos).
- Decodificacion especulativa: la capa MTP se distribuye como drafter independiente (`avlp12/GLM-5.3-Flash-Alis-MTP-Drafter`), lo que permite acelerar la decodificacion.
- Ejecucion nativa en Apple Silicon mediante MLX, con soporte de cuantizacion 8-bit y kernel Metal fusionado para KDA.

## Casos de uso

- Evaluacion y calibracion de cuantizaciones: este build actua como profesor de referencia para medir la divergencia KL de las builds de 4 y 6 bits sobre paneles pareados. Un equipo que prepare un despliegue en 4 bits puede usar este 8-bit para cuantificar la perdida de calidad antes de comprometerse con el tier inferior.
- Inferencia local en estaciones de trabajo Apple Silicon de gran memoria: con 334,1 GB en disco, encaja en equipos con 512 GB de memoria unificada, como el M3 Ultra, donde la model card reporta aproximadamente 24-25 tok/s de decode a p512.
- Asistencia conversacional de largo alcance en ingles y chino: el modelo base soporta contexto largo y tool calling, lo que permite construir asistentes con acceso a herramientas y documentos.
- Procesamiento de documentos con imagenes: la torre de vision en bf16 permite extraer informacion de capturas, formularios o diagramas combinada con generacion de texto.
- Generacion de codigo asistida con herramientas: integrable en flujos de desarrollo que requieran function calling, con la salvedad de que la latencia en Apple Silicon es inferior a la de un despliegue en GPU de datacenter.
- Prototipado e investigacion reproducible: al incluir recibos de conversion (`state.json`, `finalize_receipt.json`) en el repositorio, permite auditar el proceso de cuantizacion y reproducir experimentos de compresion.
- Fine-tuning o destilacion sobre una referencia de alta fidelidad: util como teacher para destilar las builds de 4 bits o para generar datos sinteticos con menor degradacion que un checkpoint cuantizado agresivamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de calidad relativa entre tiers de cuantizacion y de throughput en hardware Apple:

| Metrica | Valor |
|---|---|
| KL de la build 4-bit QUASAR frente a su baseline 4-bit RTN | -8,5% |
| KL medio de la build 6-bit en el mismo panel | aprox. 0,0226 |
| Decode en M3 Ultra 512 GB (8-bit, p512) | aprox. 24-25 tok/s |
| Decode en M3 Ultra 512 GB (4-bit, p512) | aprox. 29-33 tok/s |
| Mejora de decode con variables de entorno en M3 Ultra | aprox. +12% |
| Mejora de decode con kernel KDA fusionado (medido en 4-bit) | +20% |
| Mejora de prefill a 131k con kernel KDA fusionado (medido en 4-bit) | +50% |

## Requisitos de hardware

- VRAM o memoria unificada: el repositorio ocupa 334,1 GB en disco; la inferencia en MLX requiere que los pesos quepan en memoria unificada, por lo que se necesita un equipo con 512 GB o mas para operar con holgura.
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada amplia; la model card cita explicitamente el M3 Ultra de 512 GB como referencia de rendimiento.
- Cabe en GPU de consumo: no. El tamano de 334,1 GB excede la VRAM de cualquier GPU consumer actual (RTX 4090 con 24 GB, por ejemplo). Tampoco cabe en configuraciones multi-GPU consumer convencionales sin offloading agresivo.
- Opciones de despliegue: mlx-vlm con soporte de `glm5_next` (fusionado el 2026-08-26); se recomiendan las ramas de los PR #2044 y #2074 de mlx-vlm hasta su fusion, por incluir correcciones de correccion del stack de texto. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: aproximadamente 24-25 tok/s de decode a p512 en M3 Ultra 512 GB; con las variables de entorno recomendadas se anade cerca de un +12%. El kernel KDA fusionado aporta +20% de decode y +50% de prefill a 131k tokens, medido sobre el arbol de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Alis-MLX-8bit (este) | 320B totales / 18B activos (78,9B almacenados) | no disponible | 8-bit g64 affine, MLX | MIT | Hugging Face, 367 descargas |
| GLM-5.3-Flash-Alis-MLX-4bit | 320B totales / 18B activos | no disponible | 4-bit (QUASAR), MLX | MIT | Hugging Face |
| GLM-5.3-Flash-Alis-MLX-6bit | 320B totales / 18B activos | no disponible | 6-bit, MLX | MIT | Hugging Face |
| zai-org/GLM-5.3-Flash (base) | 320B totales / 18B activos | no disponible | FP8 | no disponible en la informacion | Hugging Face |

La comparativa con modelos de otros fabricantes no esta disponible en la informacion proporcionada. Las diferencias principales dentro de la familia son el tier de cuantizacion, el tamano en disco y el throughput: la build de 4 bits alcanza 29-33 tok/s frente a 24-25 tok/s del 8-bit en M3 Ultra, a costa de una mayor divergencia KL respecto al modelo de referencia.

## Limitaciones y advertencias

- La cuantizacion a 8 bits introduce una degradacion no nula respecto al checkpoint FP8 original; la model card no cuantifica la KL de esta build frente al base, solo la de las builds de 4 y 6 bits.
- El modelo solo declara soporte de ingles y chino; el rendimiento en castellano no esta documentado y no deberia asumirse.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues con requisitos de ventana larga sin verificacion adicional.
- Requiere mlx-vlm con soporte de `glm5_next`; las correcciones del stack de texto viven en ramas de PR no fusionadas en el momento de la publicacion, lo que implica riesgo de regresiones si se usa la version estable.
- Dependencia de hardware Apple Silicon: no es desplegable en GPUs NVIDIA o AMD con los runtimes habituales, lo que limita su uso en infraestructura de datacenter convencional.
- La capa MTP se elimina del checkpoint; sin el drafter independiente no se dispone de decodificacion especulativa.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de factualidad en la informacion disponible.
- Sesgos conocidos: no documentados en la model card; deben asumirse los del modelo base, no evaluados aqui.
- Licencia MIT: permite uso comercial sin restricciones adicionales segun el texto de la licencia, aunque conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash, cuya licencia no se detalla en la informacion proporcionada.
- El rendimiento reportado (24-25 tok/s) corresponde a un M3 Ultra de 512 GB; en equipos con menos memoria el modelo no cabe o requerira offloading con caida severa de throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avlp12/GLM-5.3-Flash-Alis-MLX-8bit
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Build de 4 bits de la misma familia: https://huggingface.co/avlp12/GLM-5.3-Flash-Alis-MLX-4bit
- Drafter MTP independiente: https://huggingface.co/avlp12/GLM-5.3-Flash-Alis-MTP-Drafter
- PR de mlx-vlm #2044: https://github.com/Blaizzy/mlx-vlm/pull/2044
- PR de mlx-vlm #2074: https://github.com/Blaizzy/mlx-vlm/pull/2074
