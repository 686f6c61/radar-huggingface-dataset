# aitamedia/Ling-3.0-flash-Sante-FP4

## Resumen

Ling-3.0-flash-Sante-FP4 es un empaquetado cuantizado en FP4 del modelo `inclusionAI/Ling-3.0-flash-Sante`, publicado por el usuario `aitamedia`. Se trata de una variante de la familia Ling-3.0-flash de inclusionAI, concretamente una derivada "Sante" (fine-tune comunitario con abliteration y ajuste adicional) que conserva la arquitectura original `BailingMoeV3ForCausalLM` con atención híbrida KDA+MLA. El pack replica el esquema de cuantización híbrida del oficial `Ling-3.0-flash-fp4`: expertos enrutados en MXFP4 y proyecciones densas en fp8-block-128.

El modelo resuelve el problema de desplegar un MoE de gran tamano (65.578.478.560 parametros totales, ~70,4 GB en 36 shards) en hardware con memoria limitada, en particular en plataformas DGX Spark (GB10) y configuraciones multi-nodo con tensor parallelism. Es relevante porque es el primer pack FP4 nativo para vLLM de un derivado Sante abliterado, con soporte declarado para vLLM ≥ v0.32.0 y un `generation_config.json` incluido que evita la deriva multilingue en trazas de razonamiento largas.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face y en la model card del autor; los datos no publicados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BailingMoeV3ForCausalLM (MoE híbrido con atención KDA+MLA) |
| Parametros totales | 65.578.478.560 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (3 slots en TP1, segun model card) |
| Tipos de cuantizacion | MXFP4 (expertos enrutados), fp8-block-128 (proyecciones densas), bf16 passthrough (MLA/KDA, router, norms, lm_head, embeddings) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (36 shards `model-fp4-*.safetensors` + indice) |

## Arquitectura y entrenamiento

La arquitectura subyacente es `BailingMoeV3ForCausalLM`, un transformer de mezcla de expertos (MoE) con atención híbrida que combina KDA y MLA (Multi-head Latent Attention). El pack FP4 no altera la topologia: mantiene los expertos enrutados en MXFP4 con grupos de 32 (e2m1 + escalas e8m0 potencia de dos) y las proyecciones densas de atención y salida en fp8-block-128 (e4m3 + e8m0 con redondeo ceil). Las proyecciones exentas (MLA/KDA), el router, las normas, el `lm_head` y los embeddings se conservan en bf16 para preservar calidad. El `quantization_config` declarado es `{"activation_scheme":"dynamic","fmt":"float","quant_method":"mxfp4"}` con el remapeo de escalas de expertos propio de Ling.

El modelo base `inclusionAI/Ling-3.0-flash-Sante` es un fine-tune comunitario de Ling-3.0-flash con abliteration y ajuste adicional; el padre en bf16 permanece en ese repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO en la informacion proporcionada. Como innovacion tecnica destacable, el checkpoint incluye NEXTN/MTP nativo con k=3 para decodificacion especulativa, y el pack incluye `generation_config.json` con `temperature=0.6`, `top_p=0.95`, `top_k=20`, `repetition_penalty=1.05` y `do_sample=true`, que vLLM ≥0.32 lee como valores por defecto en el servicio.

## Capacidades

- Generacion de texto conversacional y de trazas de razonamiento largas (thinking traces), con el `generation_config.json` incluido para evitar colapso en deriva multilingue.
- Soporte de tool calling / function calling mediante `--tool-call-parser ling3` en vLLM; verificado en vivo con `tool_choice=auto`.
- Capacidad de agente y razonamiento multi-paso, apoyada en el contexto de 262.144 tokens y en la decodificacion especulativa NEXTN/MTP k=3.
- Capacidades multilingues: no se detalla la lista de idiomas soportados; la model card advierte de "deriva multilingue" en trazas largas si no se aplica la configuracion de generacion recomendada.
- Servicio en vLLM ≥ v0.32.0 con tensor parallelism (TP1 y TP2 verificados sobre GB10 aarch64 cu130).
- No se declaran capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (262.144 tokens por slot, 3 slots en TP1) y tool calling para consultar sistemas internos, lo que permite resolver incidencias sin perder el hilo de la conversacion.
- Agentes de codigo en pipelines de CI/CD: con `tool_choice=auto` y el parser `ling3` en vLLM, puede invocar herramientas de build, tests o linters dentro de un flujo automatizado de revision de cambios.
- Despliegue en el borde o en laboratorio con DGX Spark (GB10): el pack FP4 arranca en ~5 min en frio y ~2 min en caliente en una sola caja, con ~37 GB de headroom de host tras la carga, lo que lo hace viable en estaciones de trabajo con memoria limitada.
- Razonamiento multi-paso con trazas largas: util para analisis de documentos extensos o generacion de informes con pasos intermedios, gracias al contexto de 262K y al MTP k=3 que acelera la decodificacion.
- Servicio multi-nodo con tensor parallelism (TP2): dos cajas DGX Spark pueden servir el modelo replicando el mismo pack en ambos nodos, adecuado para equipos que ya disponen de esa infraestructura.
- Experimentacion con cuantizacion FP4 sobre MoE: investigadores pueden comparar la calidad del pack MXFP4/fp8-block frente al padre bf16 en tareas de razonamiento y codigo, con una receta de servicio reproducible en vLLM.
- Prototipado de asistentes con function calling en entornos con licencia permisiva: la licencia MIT del pack facilita su integracion en productos comerciales internos sin friccion legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de servicio medidas: ~33 tok/s de decode en TP1 (una sola caja, un solo stream) con kernel emulado tipo Marlin sobre GB10, prefill saludable, KV pool de 6,5e9 bytes y 3 slots a 262.144 tokens de contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa ~70,4 GB en 36 shards; en TP1 sobre GB10 se reporta un headroom de host de ~37 GB tras la carga, por lo que se necesita al menos una plataforma con ~70 GB disponibles para pesos mas KV cache.
- GPU recomendadas: DGX Spark (GB10) verificada en aarch64 con cu130; no se documentan otras GPU en la informacion disponible.
- Cabe en consumer GPU: no disponible; el tamano (65,6B parametros totales, ~70 GB en FP4) excede la VRAM de GPU de consumo habituales.
- Opciones de despliegue: vLLM ≥ v0.32.0 (loader Ling-fp4 incluido en el tag v0.32.0); no se documentan llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: ~33 tok/s de decode en TP1 con un solo stream; arranque ~5 min en frio y ~2 min en caliente; TP2 soportado con el mismo recipe y el pack replicado en ambos nodos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aitamedia/Ling-3.0-flash-Sante-FP4 | 65.578.478.560 | 262.144 | MXFP4 + fp8-block-128 | MIT | Hugging Face, vLLM ≥0.32 |
| inclusionAI/Ling-3.0-flash-Sante (bf16) | no disponible | no disponible | bf16 | no disponible | Hugging Face |
| inclusionAI/Ling-3.0-flash-fp4 | no disponible | no disponible | MXFP4 + fp8-block-128 | no disponible | Hugging Face, vLLM ≥0.32 |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base es un derivado con abliteration; este proceso puede alterar el comportamiento de rechazo y los sesgos respecto al modelo original, y no se documentan evaluaciones de seguridad.
- Riesgo de alucinacion inherente a modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- La model card advierte de que sin el `generation_config.json` incluido las trazas de razonamiento largas colapsan en deriva multilingue; es imprescindible servirlo con esa configuracion.
- La lista de idiomas soportados no esta disponible, lo que limita la evaluacion de cobertura multilingue en produccion.
- La cuantizacion FP4 con kernel emulado tipo Marlin en GB10 limita el throughput (~33 tok/s por stream); no se documenta rendimiento en otras GPU.
- En TP2 es necesario verificar el tamano de los blobs en ambos nodos, no el codigo de salida de rsync: la model card reporta truncamientos silenciosos con workers al 100% de disco (11 de 47 archivos aterrizaron).
- La licencia MIT del pack es permisiva, pero debe verificarse la licencia del modelo base y del linaje Sante antes de uso comercial, ya que no se detalla en la informacion disponible.
- El autor del pack es un usuario comunitario (`aitamedia`), no el desarrollador original; no hay garantias de mantenimiento ni de verificacion independiente de la calidad del empaquetado.

## Enlaces

- Hugging Face del pack FP4: https://huggingface.co/aitamedia/Ling-3.0-flash-Sante-FP4
- Modelo base (bf16): https://huggingface.co/inclusionAI/Ling-3.0-flash-Sante
- Pack oficial de referencia: https://huggingface.co/inclusionAI/Ling-3.0-flash-fp4
