# optimum-intel-internal-testing/tiny-random-nemotron-h

## Resumen

`optimum-intel-internal-testing/tiny-random-nemotron-h` es un modelo de prueba (fixture) publicado por el equipo interno de Optimum Intel, no un modelo destinado a uso real. Su proposito es servir como caso de test para la integracion de la arquitectura NemotronH en el ecosistema `optimum-intel` (exportacion a OpenVINO y validacion de pipelines de transformers). Emplea la arquitectura hibrida NemotronH, que combina bloques Mamba2, bloques de atencion completa, capas MoE y MLP en un unico transformer hibrido.

El modelo es deliberadamente diminuto: 16.919.928 parametros totales con pesos en `float32`, un `hidden_size` de 64 y un repositorio de 0,1 GB. Conserva, sin embargo, la estructura de bloques completa de la familia NemotronH mediante el patron `hybrid_override_pattern = "ME*M-*"`, de modo que los tests ejercitan todos los tipos de capa del modelo real. El tokenizer es el de `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, lo que permite validar el flujo completo de tokenizacion.

Su relevancia es exclusivamente de ingenieria: permite verificar que las herramientas de conversion, exportacion y ejecucion de `optimum-intel` manejan correctamente la hibridacion Mamba2/atencion/MoE, los cambios de nombre de tipos de capa introducidos en transformers 5.13 (`mamba` a `linear_attention`, `attention` a `full_attention`) y la compatibilidad entre versiones 5.6-5.12 y 5.13+. No debe emplearse para generacion de texto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH hibrida (Mamba2 + atencion completa + MoE + MLP) |
| Parametros totales | 16.919.928 |
| Parametros activos | no disponible (configurado con 8 expertos enrutados y 2 por token, pero sin cifra publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo instancia `NemotronHConfig` con el patron hibrido `ME*M-*`, que segun la nomenclatura de la model card corresponde a Mamba2, MoE, atencion, Mamba2, MLP y atencion. Los hiperparametros concretos son: `hidden_size=64`, `num_attention_heads=4`, `num_key_value_heads=2`, `head_dim=32` (que difiere de `hidden_size // num_attention_heads`, igual que en NVIDIA-Nemotron-3-Nano-4B), `intermediate_size=128`, `mamba_num_heads=8`, `mamba_head_dim=8`, `n_groups=2`, `ssm_state_size=16`, `conv_kernel=4` y `chunk_size=8` (suficientes chunks para el escaneo SSD de referencia de los prompts de test). La parte MoE usa `n_routed_experts=8`, `num_experts_per_tok=2`, `moe_intermediate_size=32`, `moe_shared_expert_intermediate_size=64`, `routed_scaling_factor=2.5`, `n_group=1` y `topk_group=1`.

No ha habido entrenamiento: los pesos son aleatorios, generados con `torch.manual_seed(42)` y `AutoModelForCausalLM.from_config(config).float().eval()`. La innovacion tecnica relevante no esta en el modelo sino en el guardado de la configuracion: el script elimina `layers_block_type` y `mtp_layers_block_type` y escribe `hybrid_override_pattern`, porque transformers 5.13 renombro los tipos de capa y las versiones 5.6-5.12 solo aceptan los nombres antiguos, mientras que cualquier version con soporte NemotronH convierte el patron. El modelo se construyo con transformers 5.15.1.

## Capacidades

- Generacion de texto: la pipeline declarada es `text-generation`, pero al tener pesos aleatorios la salida carente de sentido; solo valida el flujo de inferencia.
- Conversacional: incluye el tag `conversational`, heredado de la configuracion de la pipeline.
- Cobertura estructural: ejercita bloques Mamba2 (atencion lineal con estado SSM), atencion completa con GQA (`num_key_value_heads=2` frente a 4 cabezas), capas MoE con expertos enrutados y compartidos, y capas MLP.
- Compatibilidad de tokenizer: usa exactamente el tokenizer de `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Tests de exportacion a OpenVINO en `optimum-intel`: el modelo se usa como entrada para verificar que la conversion de un transformer hibrido con Mamba2, atencion y MoE produce un grafo OpenVINO valido. Es su proposito declarado.
- Validacion de compatibilidad entre versiones de transformers: permite comprobar que el manejo de `hybrid_override_pattern` frente a `layers_block_type` funciona en el rango 5.6-5.15.
- Tests de regresion en CI de `optimum-intel`: al ocupar 0,1 GB y ejecutarse en float32 sobre CPU, se puede incluir en suites de integracion continua sin requisitos de GPU.
- Verificacion de tokenizacion con el tokenizer de Nemotron-3-Nano: valida el pipeline completo de tokenizer mas modelo en tests de extremo a extremo.
- Pruebas de carga y serializacion de safetensors: comprueba el guardado y recarga de pesos con `tie_word_embeddings=False` y configuraciones MoE.
- Reproduccion de bugs en capas hibridas: sirve como caso minimo para aislar fallos en la implementacion de Mamba2 o en el enrutado de expertos sin necesidad de descargar el modelo de 30B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad seria irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16,9 M de parametros, aproximadamente 68 MB de pesos); el repo completo ocupa 0,1 GB.
- GPU recomendadas: ninguna en particular; el modelo esta pensado para ejecucion en CPU.
- Cabe en cualquier GPU consumer, e incluso en CPU sin aceleracion, dado su tamano.
- Opciones de despliegue: transformers (libreria declarada), con exportacion a OpenVINO mediante `optimum-intel`; el resto de runtimes (vLLM, llama.cpp, Ollama, TGI) no estan documentados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| tiny-random-nemotron-h (este) | 16,9 M | no disponible | Fixture de tests para NemotronH en optimum-intel | nvidia-nemotron-open-model-license |
| optimum-intel-internal-testing/tiny-random-internlm | no disponible | no disponible | Fixture de tests para InternLM | no disponible |
| optimum-intel-internal-testing/tiny-random-chatglm4 | no disponible | no disponible | Fixture de tests para ChatGLM4 | no disponible |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 30B (A3B) | no disponible | Modelo real de la familia NemotronH | nvidia-nemotron-open-model-license |

La comparacion relevante es con el modelo del que deriva: este tiny-random reproduce su arquitectura a escala minima para test. Frente a los otros fixtures de `optimum-intel-internal-testing`, la diferencia es la arquitectura cubierta, no el rendimiento.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y no produce texto coherente; cualquier uso generativo carece de valor.
- No apto para produccion: es un artefacto de test interno, sin garantias de soporte ni mantenimiento.
- Sesgos: no evaluables, al no existir entrenamiento con datos reales.
- Riesgo de alucinacion: total, en el sentido de que la salida es ruido estadistico.
- Limitaciones de contexto e idioma: no documentadas; el tokenizer es el de Nemotron-3-Nano, pero no se declaran idiomas soportados.
- Licencia: `nvidia-nemotron-open-model-license`, con enlace a los terminos de NVIDIA; conviene revisar las restricciones de uso comercial antes de redistribuir, aunque el modelo en si no tenga utilidad practica fuera de tests.
- Dependencia de version: la configuracion se guarda con `hybrid_override_pattern`; versiones de transformers anteriores a 5.6 o sin soporte NemotronH pueden no cargarla correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/optimum-intel-internal-testing/tiny-random-nemotron-h
- Modelo de referencia (tokenizer y arquitectura): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Fixture comparable (InternLM): https://huggingface.co/optimum-intel-internal-testing/tiny-random-internlm
- Fixture comparable (ChatGLM4): https://huggingface.co/optimum-intel-internal-testing/tiny-random-chatglm4
