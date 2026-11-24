# heshiqian1/fast-real2sim-streamvln-lora-dagger2

## Resumen

`fast-real2sim-streamvln-lora-dagger2` es un conjunto de adaptadores LoRA de tipo PEFT publicados por el usuario heshiqian1 para el modelo base `mengwei0427/StreamVLN_Video_qwen_1_5_r2r_rxr_envdrop_scalevln_v1_3`, un modelo de vision-language navigation (VLN) construido sobre Qwen 1.5 y entrenado para navegacion visual en interiores con flujos de video (StreamVLN). No se trata de un modelo independiente, sino de pesos delta que se aplican sobre el modelo base fijado en una revision concreta.

Los adaptadores corresponden a la segunda ronda de entrenamiento DAgger del proyecto Fast-Real2Sim y son especificos por escena: se publican once adaptadores, uno por cada escena de evaluacion (identificadas con codigos tipo Matterport, como `2azQ1b91cZZ` o `8194nk5LbLH`), cada uno con su checkpoint seleccionado. El objetivo es cerrar la brecha sim-a-real ajustando el modelo a la apariencia concreta de cada entorno de evaluacion.

La relevancia es acotada pero clara para investigacion en navegacion robotica: el autor advierte explicitamente de que estos adaptadores se entrenaron con datos generados de las propias escenas de evaluacion y deben reportarse como evaluacion adaptada a la escena, no como evaluacion zero-shot en escenas no vistas. El repositorio ocupa 0,2 GB y contiene unicamente los ficheros necesarios para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base vision-language de navegacion (StreamVLN sobre Qwen 1.5) |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base no declara recuento en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,1 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Modelo base | `mengwei0427/StreamVLN_Video_qwen_1_5_r2r_rxr_envdrop_scalevln_v1_3` (revision `f1f76c66083c362ddfcd2610167f9c4e4a46c027`) |
| Tamano del repositorio | 0,2 GB |
| Escenas publicadas | 11 |
| Checkpoints seleccionados | 180, 70, 30, 30, 20, 80, 30, 30, 40, 20, 90 (segun escena) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia StreamVLN, un enfoque de navegacion visual en interiores que procesa flujos de video y produce acciones de navegacion, construido sobre Qwen 1.5 como backbone vision-language. Sobre ese modelo base se aplican adaptadores LoRA de rango 16 y alpha 32 con dropout 0,1, inyectados en las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y en las proyecciones del MLP (`gate_proj`, `up_proj`, `down_proj`), lo que cubre tanto la atencion como el bloque feed-forward del transformer.

El entrenamiento de estos adaptadores se realizo mediante DAgger (Dataset Aggregation) en su segunda ronda, dentro de los experimentos Fast-Real2Sim, y es especifico por escena: cada adaptador se ajusto con datos generados de su propia escena de evaluacion para reducir el desajuste entre simulacion y realidad. El autor excluye deliberadamente del repositorio los estados del optimizador, los estados del RNG, los ficheros de tokenizer duplicados y los shards de DeepSpeed, dejando solo los artefactos de inferencia. Las rutas de checkpoint seleccionadas por escena varian entre 20 y 180, lo que sugiere seleccion por rendimiento en validacion. No se dispone de informacion sobre el volumen de tokens, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Navegacion visual en interiores (vision-language navigation) a partir de flujos de video, heredada del modelo base StreamVLN.
- Procesamiento conjunto de entrada visual y lenguaje para producir decisiones de navegacion paso a paso.
- Adaptacion especifica por escena: cada adaptador ajusta el comportamiento del modelo a la apariencia y geometria de una escena concreta.
- Integracion como capa PEFT sobre el modelo base, cargable con la libreria `peft`.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso general: no disponible (el modelo esta orientado a navegacion, no a agentes genericos).
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Evaluacion de investigacion en navegacion robotica simulada: cargar el adaptador de la escena correspondiente junto con el modelo base fijado y medir el rendimiento de navegacion en esa escena, reportando los resultados como evaluacion adaptada a la escena segun indica el autor.
- Reproduccion de experimentos Fast-Real2Sim: el repositorio permite replicar la segunda ronda de DAgger usando los checkpoints exactos seleccionados por escena, con los checksums recogidos en `models_manifest.json`.
- Estudio del desajuste sim-a-real: comparar el comportamiento del modelo base sin adaptar frente al adaptador especifico de escena para cuantificar cuanto aporta el ajuste con datos generados de la propia escena.
- Benchmarking de tecnicas de adaptacion PEFT en VLN: servir de referencia para comparar LoRA de rango 16 con otras estrategias de ajuste en tareas de navegacion visual.
- Base para experimentos de generalizacion: entrenar adaptadores en unas escenas y evaluar en otras para medir la transferencia, usando estos pesos como punto de partida.
- Despliegue en pipelines de investigacion con `peft`: al ser adaptadores ligeros (0,2 GB en total), permiten cambiar de escena cargando el adaptador correspondiente sin duplicar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base Qwen 1.5 subyacente, cuyos requisitos no se detallan en la informacion proporcionada. Los adaptadores en si anaden una sobrecarga minima (0,2 GB en total para las once escenas).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la libreria `peft` sobre el modelo base con la revision fijada; el autor menciona el uso del cargador de StreamVLN. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fast-real2sim-streamvln-lora-dagger2 | Adaptadores LoRA sobre StreamVLN/Qwen 1.5 | no disponible (LoRA r=16) | no disponible | no disponible | Hugging Face, 0 descargas |
| StreamVLN base (`mengwei0427/StreamVLN_Video_qwen_1_5_...`) | Modelo VLN completo | no disponible | no disponible | no disponible | Hugging Face |
| Otros adaptadores LoRA de navegacion visual | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado; al tratarse de un modelo de navegacion, el riesgo se manifiesta como decisiones de movimiento erroneas mas que como texto inventado.
- Limitacion critica de evaluacion: los adaptadores son especificos por escena y se entrenaron con datos generados de las propias escenas de evaluacion. El autor exige reportarlos como evaluacion adaptada a la escena, nunca como evaluacion zero-shot en escenas no vistas.
- Dependencia estricta del modelo base: es necesario usar la revision `f1f76c66083c362ddfcd2610167f9c4e4a46c027`; otras revisiones pueden romper la compatibilidad de los adaptadores.
- Cobertura limitada: solo se publican once escenas; no hay adaptador para escenas fuera de esa lista.
- Licencia no especificada: no se indica licencia para el repositorio ni para el modelo base, lo que impide confirmar condiciones de uso comercial.
- Idiomas y contexto no documentados: no hay informacion sobre cobertura linguistica ni longitud de contexto.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia, sin pipeline declarado; conviene tratarlo como artefacto de investigacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/heshiqian1/fast-real2sim-streamvln-lora-dagger2
- Modelo base: https://huggingface.co/mengwei0427/StreamVLN_Video_qwen_1_5_r2r_rxr_envdrop_scalevln_v1_3
- Codigo y notas de reproducibilidad (Fast-Real2Sim): https://github.com/shiqianhe/fast-real2sim
