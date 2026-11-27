# nilpe0555/PLaMo-3-Translate-0.8B-DSpark-drafter-GPU

## Resumen

PLaMo-3-Translate-0.8B-DSpark-drafter-GPU es un modelo borrador (drafter) para decodificacion especulativa sobre el modelo de traduccion PLaMo 3 Translate 0.8B de Preferred Networks (PFN). Lo publica el usuario independiente nilpe0555 como proyecto comunitario no oficial, y reimplementa la tecnica DSpark descrita en el paper arXiv:2607.05147, con implementacion de referencia DeepSpec (MIT, commit `005e03b8`). Su funcion no es traducir por si mismo, sino proponer tokens candidatos que el modelo objetivo verifica en paralelo, acelerando la generacion.

Arquitectura y tamano: el backbone DSpark tiene 5 capas paralelas que replican las dimensiones del objetivo (hidden 1536, 16 cabezas de consulta, 1 cabeza KV, head_dim 128, FFN 6144), con inyeccion KV de taps fusionados del objetivo (capas 1, 4, 7, 10 y 13), un modulo Markov de bajo rango (rank 256) para dependencia secuencial entre tokens y una cabeza de confianza. El checkpoint almacena 241.849.345 parametros en FP32; la tabla de embeddings y la LM head se comparten desde el modelo objetivo congelado y no se guardan en este repositorio.

Es relevante ahora porque la decodificacion especulativa es una de las pocas vias practicas para reducir la latencia de decodificacion sin reentrenar el modelo objetivo, y este checkpoint ofrece mediciones detalladas y verificacion de exactitud frente a decodificacion voraz. No obstante, el propio autor advierte que la ganancia depende fuertemente del motor de inferencia: con el motor CUDA-graph incluido alcanza hasta 370 TPS en H100 PCIe (1,36x frente a serial), pero con un motor Triton fusionado del objetivo (871 TPS serial) queda por debajo de la decodificacion serial (0,67x-0,96x).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark: backbone borrador de 5 capas paralelas con inyeccion KV de taps del objetivo, modulo Markov de bajo rango (rank 256) y cabeza de confianza |
| Parametros totales | 241.849.345 (FP32 en `model.safetensors`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cabeza LM del borrador en int4 con grupo 128 (`--head i4g128`) documentada; resto de cuantizaciones no disponible |
| Idiomas soportados | ja, en |
| Licencia | plamo-community-license (modelo derivado bajo PLaMo Community License) |
| Formato de pesos | safetensors (FP32), libreria PyTorch |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa, no un transformer generativo autonomo. Su backbone de 5 capas coincide con las dimensiones del objetivo PLaMo 3 Translate 0.8B (hidden 1536, 16 cabezas de consulta, 1 cabeza KV, head_dim 128, FFN 6144) e incorpora estados ocultos del objetivo mediante inyeccion KV de taps fusionados en las capas 1, 4, 7, 10 y 13. Un modulo Markov de bajo rango (rank 256) modela la dependencia secuencial entre tokens propuestos y una cabeza de confianza estima la aceptacion. El tamano de bloque es 7 (1 token ancla mas 6 propuestas), verificado con 8 filas. La tabla de embeddings y la LM head se comparten desde el objetivo congelado.

El entrenamiento usa un lote global de 32 secuencias repartidas en 4 GPU durante aproximadamente 1,0 epoca sobre 275.000 secuencias traducidas por PLaMo (unas 160 veces menos visitas de secuencia que el paper). Los estados ocultos del objetivo se recalculan al vuelo en FP16. El autor documenta desviaciones respecto al paper y a DeepSpec en `docs/DSPARK_SPEC.md`: taps escalados a las 16 capas del objetivo de 0.8B, RoPE simple en las capas del borrador, SDPA con mascara densa en lugar de `flex_attention`, ausencia de Sequential Temperature Scaling y de cabezas GatedMarkov/RNN. El checkpoint es el paso 8000 (final), etiquetado `L5-R256`, con un tau de desarrollo forzado por profesor de 2,346.

## Capacidades

- Propuesta de tokens para decodificacion especulativa sobre `pfnet/plamo-3-translate-0.8b`, con verificacion en paralelo por el modelo objetivo.
- Traduccion japones-ingles e ingles-japones como tarea aguas abajo (el pipeline declarado es `translation`), siempre a traves del objetivo.
- Generacion de multiples tokens por ciclo: aproximadamente 2,0 tokens por ciclo en las configuraciones medidas.
- Cabeza de confianza para estimar la aceptacion de las propuestas.
- Modulo Markov de bajo rango para modelar dependencia secuencial entre tokens propuestos.
- Soporte de decodificacion voraz con coincidencia exacta respecto a la referencia serial de 8 filas (112/112 peticiones identicas token a token).
- No soporta tool calling, function calling, agentes, vision ni audio segun la informacion disponible.
- Capacidades multilingues limitadas a japones e ingles.

## Casos de uso

- Aceleracion de traduccion ja-en en produccion con el motor CUDA-graph incluido: sobre H100 PCIe el borrador eleva el rendimiento de 272 a 370 TPS (1,36x) con lote 1, lo que reduce la latencia por token en servicios de traduccion interactiva.
- Despliegue en GPU de consumo para traduccion de baja latencia: en RTX 4060 Ti alcanza 177 TPS con `B2 K=64` y cabeza de borrador int4, adecuado para estaciones de trabajo o prototipos sin GPU de datacenter.
- Traduccion por lotes de documentos con requisito de fidelidad: la verificacion voraz garantiza que las salidas coinciden con la distribucion voraz del objetivo (112/112 identicas frente a la referencia serial de 8 filas), lo que permite auditar el resultado contra el modelo base.
- Integracion en pipelines de inferencia existentes basados en PyTorch: el checkpoint se carga como modulo auxiliar junto al objetivo BF16 y no requiere reentrenar el modelo de traduccion.
- Investigacion sobre decodificacion especulativa: sirve como caso reproducible para estudiar el equilibrio entre coste del pase del borrador y tokens aceptados por ciclo, con registros crudos en `results/h100/`.
- Evaluacion comparativa de motores de inferencia: el autor mide el mismo checkpoint contra el motor CUDA-graph incluido, vLLM 0.12 (BF16 y FP8) y un motor Triton fusionado, lo que permite decidir en que stack merece la pena activar el borrador.
- Escenarios donde no conviene usarlo: con motores del objetivo muy fusionados (871 TPS serial en H100), el borrador de 5 capas sin fusionar consume 1,05-2,13 ms por ciclo y rinde entre 0,67x y 0,96x frente a serial; en ese caso el autor remite al repositorio hermano con borrador MTP.

## Benchmarks y rendimiento

Todas las mediciones usan las mismas 112 peticiones de traduccion ja-en reservadas, lote 1, decodificacion voraz, maximo 512 tokens nuevos, solo latencia de decodificacion (sin TTFT) y objetivo BF16.

NVIDIA H100 PCIe 80 GB, motor CUDA-graph incluido (serial M=1: 3,675 ms/token, 272 TPS):

| Configuracion | ms/token | TPS | x serial | Tokens/ciclo |
|---|---:|---:|---:|---:|
| Serial (M=1 CUDA graph) | 3,675 | 272 | 1,00x | 1,00 |
| DSpark chain (fiel, borrador eager) | 3,184 | 314 | 1,16x | 2,06 |
| B2 (argmax Markov sobre top-K=64, eager) | 3,103 | 322 | 1,19x | 2,02 |
| DSpark chain (fiel, borrador compilado) | 2,818 | 355 | 1,30x | 1,99 |
| B2 K=64 + borrador compilado | 2,701 | 370 | 1,36x | 2,02 |
| Extension arbol 8/16/24 filas | 3,192/3,172/3,130 | 313/315/320 | 1,15-1,18x | 2,18/2,39/2,47 |

NVIDIA H100 PCIe 80 GB, motor Triton G2 fusionado (referencia, no incluido en `code/`; serial BF16 1,148 ms/token = 871 TPS):

| Configuracion | ms/token | TPS | x G2 serial | Tokens/ciclo |
|---|---:|---:|---:|---:|
| vLLM 0.12 BF16 (referencia) | 2,234 | 448 | — | — |
| G2 serial fusionado (M=1, BF16) | 1,148 | 871 | 1,00x | 1,00 |
| G2 + DSpark chain (fiel, eager) | 1,712 | 584 | 0,67x | 2,00 |
| G2 + B2 K=64 + borrador compilado | 1,196 | 837 | 0,96x | 1,97 |

NVIDIA RTX 4060 Ti: 177 TPS con `B2 K=64` y cabeza de borrador int4. Exactitud: 112/112 peticiones identicas token a token frente a la referencia serial de 8 filas del propio motor; frente al motor serial M=1, 100/112 (RTX 4060 Ti), 107/112 (motor incluido en H100) y 102/112 (motor G2 fusionado en H100), con todas las diferencias en empates cercanos de BF16 (brecha top-2 de logits entre 0 y 0,875, mayoritariamente 0 o 1 ulp). Cuantizar la cabeza LM del borrador en int4 no aporta ganancia medible en H100 (3,182 frente a 3,182 ms/token en la variante fiel; 3,099 frente a 3,102 ms/token en B2 K=64).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1,0 GB en FP32; se suma la del objetivo PLaMo 3 Translate 0.8B en BF16, no cuantificada en la informacion disponible.
- GPU verificadas por el autor: NVIDIA H100 PCIe 80 GB y NVIDIA RTX 4060 Ti.
- Cabe en GPU de consumo: si, verificado en RTX 4060 Ti con 177 TPS.
- Opciones de despliegue: motor CUDA-graph propio incluido en `code/`; el autor compara tambien con vLLM 0.12 (BF16: 2,234 ms/token, 448 TPS; FP8: 1,953 ms/token, 512 TPS) y con un motor Triton G2 fusionado no incluido. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,701 ms/token (370 TPS) en H100 con B2 K=64 y borrador compilado; 3,675 ms/token (272 TPS) en serial; 1,196 ms/token (837 TPS) con G2 + B2 K=64; en RTX 4060 Ti, 177 TPS. El pase del borrador consume 1,05-2,13 ms por ciclo y la verificacion de 8 filas baja de aproximadamente 4,2 ms a 1,28 ms en el motor fusionado.
- Entorno medido: driver 580, PyTorch 2.9.0+cu129.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLaMo-3-Translate-0.8B-DSpark-drafter-GPU | 241,8 M (borrador) | no disponible | 370 TPS en H100 (1,36x serial); 177 TPS en RTX 4060 Ti | plamo-community-license | Hugging Face (nilpe0555) |
| PLaMo-3-Translate-0.8B-MTP-drafter-GPU | no disponible | no disponible | hasta 1.423 TPS en H100 y 355 TPS en RTX 4060 Ti | no disponible | Hugging Face (nilpe0555) |
| PLaMo 3 Translate 0.8B (objetivo) | 0,8B (nominal) | no disponible | 272 TPS serial en H100 (motor incluido); 871 TPS con G2 fusionado; 448 TPS en vLLM 0.12 BF16 | plamo-community-license | Hugging Face (pfnet) |

## Limitaciones y advertencias

- Proyecto comunitario no oficial: no esta afiliado, respaldado ni soportado por Preferred Networks, NVIDIA ni DeepSeek.
- Modelo derivado bajo PLaMo Community License: el uso comercial esta sujeto a los terminos de dicha licencia, que deben revisarse antes de produccion.
- Se distribuye "AS IS", sin garantia de ningun tipo.
- No es un modelo de traduccion autonomo: depende del objetivo `pfnet/plamo-3-translate-0.8b` y de su tabla de embeddings y LM head compartidas.
- La ganancia de rendimiento es dependiente del motor: frente a un objetivo muy fusionado (871 TPS serial en H100) el borrador rinde 0,67x-0,96x, por debajo de serial; el punto de equilibrio esta en aproximadamente 2,04 tokens por ciclo.
- Desviaciones documentadas respecto al paper y a DeepSpec (taps escalados, RoPE simple, SDPA con mascara densa, sin Sequential Temperature Scaling ni cabezas GatedMarkov/RNN, aproximadamente 160 veces menos visitas de secuencia), lo que limita la comparabilidad con los resultados del paper.
- Diferencias de exactitud frente al motor serial M=1 en 5-12 de 112 peticiones, atribuidas a empates cercanos de BF16 por redondeo de GEMM segun lote y numero de filas.
- Idiomas limitados a japones e ingles; no se documenta soporte multilingue adicional.
- No se documentan sesgos conocidos, tasas de alucinacion ni longitud de contexto; no disponible.
- El autor advierte que para maximo throughput en este objetivo conviene el repositorio hermano con borrador MTP (hasta 1.423 TPS en H100).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nilpe0555/PLaMo-3-Translate-0.8B-DSpark-drafter-GPU
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Repositorio hermano con borrador MTP: https://huggingface.co/nilpe0555/PLaMo-3-Translate-0.8B-MTP-drafter-GPU
- Paper DSpark: arXiv:2607.05147 (https://arxiv.org/abs/2607.05147)
- Implementacion de referencia DeepSpec: MIT, commit `005e03b8` (aviso en `NOTICE-DeepSpec.txt`)
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- Especificacion de desviaciones: `docs/DSPARK_SPEC.md` (en el repositorio)
- Registros crudos de resultados: `results/h100/` (en el repositorio)
