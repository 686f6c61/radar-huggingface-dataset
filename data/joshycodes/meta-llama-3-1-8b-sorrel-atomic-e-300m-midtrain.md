# joshycodes/meta-llama-3.1-8b-sorrel-atomic-e-300m-midtrain

## Resumen

El modelo `joshycodes/meta-llama-3.1-8b-sorrel-atomic-e-300m-midtrain` es un checkpoint intermedio de preentrenamiento continuado (midtrain) construido sobre `unsloth/Meta-Llama-3.1-8B` (revision `e9a141a2091e`). Lo publica el usuario `joshycodes` como artefacto de investigación privado dentro de un proyecto de Anthropic Fellows sobre entrenamiento de carácter enmarcado en "flourishing" (pitch de Wang y Jermyn, 2026-04-22). No es un modelo afinado por instrucciones ni un asistente conversacional: es una etapa intermedia pensada para seguir entrenando o para estudiar el efecto de un corpus concreto sobre los pesos de un modelo base de 8 030 261 248 parámetros (8,03 B).

El entrenamiento consumió 229 425 152 tokens del dataset `joshycodes/sorrel-corpus`, configuración `sorrel-atomic-e-300m`, con una única época y una pérdida que descendió de 1,9631 a 1,5564. Se ejecutó en 8 GPU NVIDIA H200 bajo RunPod, con `seq_len` de 4096, learning rate de 1e-05, micro-batch de 4 y acumulación de gradientes de 8, usando la revisión `fc72542d84a1` del corpus y el commit `5c67629c2313` del repositorio `flourishing-training` como lanzador.

Su relevancia es acotada pero clara: sirve como evidencia reproducible de una receta de preentrenamiento continuado a pequeña escala (menos de 250 M de tokens) y como punto de partida para experimentos posteriores de ajuste. La model card indica explícitamente que es un artefacto privado de investigación y que no debe redistribuirse, y la licencia declarada es `other` con nombre `internal-research`, lo que limita mucho su uso fuera del contexto del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3.1 (heredada del modelo base); el autor no detalla cambios estructurales en la model card |
| Parametros totales | 8 030 261 248 (8,03 B), dato real de los ficheros safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el entrenamiento midtrain uso `seq_len` 4096. El modelo base Llama 3.1 8B declara 128 000 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en safetensors; no se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible. El corpus `sorrel-corpus` no detalla composicion linguistica en la informacion proporcionada |
| Licencia | `other` con `license_name: internal-research`; la model card indica "Private research artifact — do not redistribute". Al derivar de Llama 3.1, arrastra las condiciones de la Llama 3.1 Community License |
| Formato de pesos | safetensors |
| Tamano del repositorio | 64,3 GB |
| Modelo base | unsloth/Meta-Llama-3.1-8B (revision `e9a141a2091e`) |
| Dataset de entrenamiento | joshycodes/sorrel-corpus, config `sorrel-atomic-e-300m`, revision `fc72542d84a1` |
| Tokens vistos | 229 425 152 |
| Perdida | 1,9631 → 1,5564 |
| Etapa | midtrain (preentrenamiento continuado, 1,0 epoca) |
| Semilla | 20260821 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `unsloth/Meta-Llama-3.1-8B`, es decir, un transformer decoder-only con normalizacion RMSNorm pre-norm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query grouping (GQA). La model card de este checkpoint no documenta ninguna modificacion estructural: el trabajo consiste en un preentrenamiento continuado sobre los pesos del base, no en un cambio de arquitectura, ni en la introduccion de atencion lineal, SSM ni esquemas hibridos.

El regimen de entrenamiento esta descrito con detalle: learning rate de 1e-05, longitud de secuencia de 4096, micro-batch de 4 con acumulacion de gradientes de 8 (batch efectivo de 32 secuencias), una sola epoca sobre 229 425 152 tokens y hardware de 8x NVIDIA H200 en RunPod. La perdida medida pasa de 1,9631 a 1,5564, un descenso de 0,4067 puntos. No se menciona en la informacion disponible ninguna fase de RLHF, DPO, SFT ni ajuste por preferencias: se trata exclusivamente de la etapa de midtrain. La model card remite a `train_run_config.json` dentro del repositorio del modelo para la configuracion completa y a `uv run eval.py --model ... --eval all` para la evaluacion, aunque no se publican los resultados de esas evaluaciones.

## Capacidades

- Generacion de texto autoregresiva en la estela del modelo base Llama 3.1 8B, con el Sesgo introducido por el corpus `sorrel-atomic-e-300m` y por los 229 M de tokens de preentrenamiento continuado.
- Modelado de lenguaje general: al ser un checkpoint de midtrain, su funcion principal es la de completar texto y servir de inicializacion para fases posteriores, no la de seguir instrucciones.
- Capacidad potencial de continuar el preentrenamiento: es un punto de partida valido para SFT, DPO o RLHF posteriores.
- Ninguna capacidad de tool calling ni de function calling documentada.
- Ninguna capacidad de agente o razonamiento multi-paso documentada.
- Capacidades multilingues: no disponibles; no se especifica la composicion idiomatica del corpus.
- Capacidades especiales (modo "thinking", vision, audio, decodificacion especulativa): no disponibles.
- No hay declaracion de soporte de plantilla de chat ni de tokens especiales de rol mas alla de los que herede del base.

## Casos de uso

- Investigacion sobre preentrenamiento continuado: el modelo permite reproducir y auditar una receta completa (lr 1e-05, 4096 de secuencia, 1 epoca, 229 M de tokens) sobre un base conocido, comparando la curva de perdida con la de otros checkpoints del mismo proyecto.
- Estudio de "character training" enmarcado en flourishing: es el artefacto tangible del pitch de Wang y Jermyn de 2026-04-22, util para analizar como un corpus concreto desplaza las distribuciones del modelo base antes de cualquier ajuste por preferencias.
- Inicializacion para SFT posterior: al haber visto 229 M de tokens adicionales, sirve como punto de arranque alternativo al base puro para experimentos de ajuste supervisado, evitando partir de cero.
- Generacion de datos sinteticos de dominio: el checkpoint puede usarse para muestrear texto en el dominio del corpus `sorrel-corpus` y construir datasets de destilacion o de filtrado, siempre dentro del marco de investigacion privada.
- Evaluacion de olvido catastrofico: al ser un midtrain corto, es un sujeto adecuado para medir cuanto del conocimiento del base Llama 3.1 8B se degrada con 229 M de tokens de un corpus especifico, comparando perplejidad antes y despues.
- Reproduccion de infraestructura: el run `meta-llama-3.1-8b-sorrel-atomic-e-300m-m-0913-1712` documenta 8x H200 en RunPod con un commit de lanzador concreto, lo que lo convierte en una referencia para validar pipelines de entrenamiento distribuido.
- Base para experimentos de cuantizacion: al tener pesos en safetensors y un tamano manejable de 8,03 B, permite estudiar la degradacion de perplejidad al cuantizar a 8 y 4 bits en un checkpoint con distribucion de pesos desplazada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un script de evaluacion (`uv run eval.py --model ... --eval all`) y una tabla de entrenamiento con la perdida (1,9631 → 1,5564), pero no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

| Metrica | Valor |
|---|---|
| Perdida final de entrenamiento | 1,5564 (desde 1,9631) |
| Tokens vistos | 229 425 152 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad en validacion | no disponible |

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 16,1 GB solo para los pesos (8,03 B x 2 bytes). Con cache KV y activaciones, el consumo realista se situa entre 18 y 22 GB para secuencias de 4096 tokens y lotes pequenos.
- Cache KV (estimacion basada en la arquitectura del base Llama 3.1 8B, 8 cabezas KV de 128 dimensiones en 32 capas): unos 131 KB por token en bf16, es decir, aproximadamente 0,5 GB a 4096 tokens. Se reduce con GQA activado, ya contabilizado en este calculo.
- VRAM en int8: alrededor de 8,1 GB solo de pesos, mas overhead de cache y activaciones.
- VRAM en int4: alrededor de 4,1 GB de pesos, con un consumo total tipico de 5 a 6 GB.
- GPU recomendadas para entrenamiento o evaluacion en precision completa: NVIDIA H200, H100 o A100 de 80 GB, en linea con las 8x H200 usadas en el midtrain original.
- GPU de consumo: si, cabe en una RTX 4090 o RTX 3090 de 24 GB en bf16 con secuencias moderadas, y con holgura en int4. En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requiere cuantizacion a 4 bits.
- Opciones de despliegue: transformers con aceleracion de Unsloth (el base elegido es de Unsloth), vLLM y TGI para servir en bf16. llama.cpp y Ollama requeririan convertir los pesos a GGUF, y no se publica ninguna conversion de este checkpoint.
- Latencia y throughput: no disponibles. La model card no reporta tokens por segundo ni tiempos de generacion; solo documenta el coste de entrenamiento (8x H200 sobre 229,4 M de tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| meta-llama-3.1-8b-sorrel-atomic-e-300m-midtrain | 8,03 B | No especificado (entrenado a 4096; base de 128 000) | `other` / `internal-research`, no redistribuible | Repositorio publico en HF con 0 descargas, 0 likes | Perdida 1,5564; sin benchmarks publicados |
| unsloth/Meta-Llama-3.1-8B (base directo) | 8,03 B | 128 000 tokens | Llama 3.1 Community License | Ampliamente disponible, millones de descargas agregadas en el ecosistema Llama 3.1 | Benchmarks publicos de la familia Llama 3.1 8B |
| meta-llama/Llama-3.1-8B (oficial de Meta) | 8,03 B | 128 000 tokens | Llama 3.1 Community License | Ampliamente disponible | Benchmarks publicos de Meta |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 000 tokens | Llama 3.1 Community License | Ampliamente disponible | Ajustado por instrucciones, con evaluaciones publicas |

La comparacion estructural es casi trivial: los tres primeros comparten el mismo numero de parametros (8,03 B) porque el checkpoint de `joshycodes` no altera la arquitectura. La diferencia real esta en la licencia, que en este caso prohibe la redistribucion, y en la ausencia total de benchmarks publicados que permitan situarlo frente al base o frente a la version Instruct.

## Limitaciones y advertencias

- Licencia restrictiva: `internal-research` con la indicacion explicita "Private research artifact — do not redistribute" en la model card. No esta autorizado el uso comercial ni la redistribucion segun los terminos declarados por el autor.
- Al derivar de Llama 3.1, se heredan las obligaciones de la Llama 3.1 Community License, incluida la clausula de nomenclatura "Llama" y las restricciones de uso aceptable de Meta.
- No es un modelo ajustado por instrucciones: no debe desplegarse como asistente conversacional sin una fase de SFT previa. No hay plantilla de chat documentada.
- Sesgos conocidos: no documentados en la informacion disponible. Al haber sido preentrenado 229 M de tokens adicionales sobre un corpus especifico (`sorrel-corpus`), la distribucion de salida puede estar desplazada respecto al base, sin que se publique un analisis de sesgo.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de fidelidad ni de tasas de alucinacion.
- Idiomas: no se especifica que idiomas cubre el corpus ni si el midtrain preserva la cobertura multilingue del base Llama 3.1.
- Degradacion potencial del base: 229 M de tokens sobre un corpus de dominio concreto pueden reducir el rendimiento en tareas generales; no se aportan datos que lo descarten.
- Contexto: aunque el base soporta 128 000 tokens, el entrenamiento se hizo con `seq_len` 4096, por lo que el comportamiento en ventanas muy largas no esta validado para este checkpoint.
- Sin benchmarks: no hay ninguna metrica reproducible publicada, lo que impide comparar objetivamente su calidad frente al base.
- Repositorio de 64,3 GB para un modelo que en bf16 ocuparia unos 16 GB, lo que sugiere la presencia de ficheros adicionales o varias revisiones; no hay documentacion que lo aclare en la informacion disponible.
- Ausencia de adopcion: 0 descargas y 0 likes, sin issues ni discusion asociada, por lo que no existe validacion externa del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-e-300m-midtrain
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.1-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-corpus
- Repositorio `flourishing-training` (commit de lanzador `5c67629c2313`): URL no disponible en la informacion proporcionada
- Fichero `train_run_config.json` dentro del repositorio del modelo: no disponible como enlace directo
- Paper o publicacion asociada: no disponible. La model card cita unicamente un pitch interno de Wang y Jermyn de 2026-04-22, sin enlace publico
- Resultados de la busqueda web: no se encontraron fuentes relevantes sobre este modelo; los resultados devueltos correspondian a paginas genericas de GitHub, Zhihu y ChatGPT sin relacion con el artefacto
