# alejandro-rodriguez/tiny-random-nemotron-h

## Resumen

`alejandro-rodriguez/tiny-random-nemotron-h` es un modelo de juguete (tiny) generado de forma aleatoria con inicializacion de pesos por semilla fija, pensado exclusivamente para pruebas de integracion de la libreria `optimum-intel` con OpenVINO. No es un modelo entrenado ni destinado a inferencia real: sus pesos son aleatorios y su proposito es validar que la arquitectura NemotronH se exporta y ejecuta correctamente en el pipeline de OpenVINO.

El modelo reproduce la arquitectura hibrida de la familia Nemotron 3 de NVIDIA, combinando bloques Mamba2 (linear attention), bloques de atencion completa, capas MLP y capas MoE (mixture of experts) con 8 expertos enrutados y 2 activos por token. Con solo 16.919.928 parametros totales (unos 17 millones), es varias ordenes de magnitud menor que el modelo del que toma la configuracion, `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, cuyo tokenizer reutiliza.

Su relevancia es puramente de ingenieria: sirve como fixture reproducible (semilla 42, `float32`) para tests de regresion en la cadena de herramientas Intel (optimum-intel, OpenVINO) y para validar la compatibilidad de transformers con la nomenclatura de tipos de capa de NemotronH. No debe usarse para generacion de texto, razonamiento ni ninguna tarea de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH hibrida (Mamba2 + atencion completa + MLP + MoE) |
| Parametros totales | 16.919.928 |
| Parametros activos | no disponible (configuracion MoE con 2 de 8 expertos por token, sin cifra publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido NemotronH con patron de capas `ME*M-*`, es decir: Mamba2, MoE, atencion completa, Mamba2, MLP y atencion completa. La configuracion usa `hidden_size=64`, 4 cabezas de atencion con 2 cabezas KV y `head_dim=32` (deliberadamente distinto de `hidden_size // num_attention_heads`, replicando el caso de `NVIDIA-Nemotron-3-Nano-4B`), `intermediate_size=128`, `mamba_num_heads=8`, `mamba_head_dim=8`, `n_groups=2`, `ssm_state_size=16`, `conv_kernel=4` y `chunk_size=8` para forzar varios chunks en el scan SSD de referencia. La parte MoE emplea `n_routed_experts=8`, `num_experts_per_tok=2`, `moe_intermediate_size=32`, `moe_shared_expert_intermediate_size=64`, `routed_scaling_factor=2.5`, `n_group=1` y `topk_group=1`. Los embeddings no estan atados (`tie_word_embeddings=False`).

No hay entrenamiento: los pesos se inicializan con `torch.manual_seed(42)` sobre `AutoModelForCausalLM.from_config` en `float32`. El tokenizer se copia de `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El modelo se genero con transformers 5.15.1 y guarda el patron de capas como `hybrid_override_pattern` en lugar de `layers_block_type`, porque transformers 5.13 renombro los tipos (`mamba` a `linear_attention`, `attention` a `full_attention`) y las versiones 5.6 a 5.12 solo aceptan los nombres antiguos, mientras que cualquier version con soporte NemotronH convierte el patron.

## Capacidades

- Generacion de texto: tecnicamente el pipeline `text-generation` esta declarado, pero con pesos aleatorios la salida es ruido sin valor semantico.
- Soporte de arquitectura hibrida: valida la ejecucion de bloques Mamba2, atencion, MLP y MoE en un mismo grafo.
- Pruebas de exportacion a OpenVINO: es su funcion principal, como fixture de `optimum-intel`.
- Compatibilidad con `transformers`: sirve para verificar la carga de configuraciones NemotronH con `hybrid_override_pattern`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking de forma funcional.
- Capacidades multilingues: no disponibles; el tokenizer es el de un modelo multilingue, pero el modelo no ha aprendido ninguna distribucion linguistica.

## Casos de uso

- Tests de integracion en optimum-intel: ejecutar el pipeline de exportacion a OpenVINO sobre una arquitectura NemotronH completa pero minima, verificando que cada tipo de bloque (Mamba2, MoE, atencion, MLP) se convierte correctamente sin necesidad de descargar el modelo de 30B.
- Pruebas de regresion de transformers: validar que la version instalada carga configuraciones con `hybrid_override_pattern` y convierte correctamente los nombres antiguos y nuevos de tipos de capa.
- CI/CD de bajo coste: con 0,1 GB de repo y 17M de parametros, cabe en cualquier runner de integracion continua sin GPU, reduciendo el tiempo de descarga y el consumo de memoria frente a modelos de referencia.
- Validacion de kernels Mamba2 y SSD scan: el `chunk_size=8` fuerza varios chunks en el scan de referencia, lo que permite probar rutas de codigo que con modelos grandes serian costosas de ejercitar.
- Verificacion de enrutamiento MoE: comprobar que la seleccion de 2 de 8 expertos con `routed_scaling_factor=2.5` se implementa de forma consistente entre backends (PyTorch, OpenVINO).
- Pruebas de tokenizer: al reutilizar el tokenizer de Nemotron 3 Nano, permite validar la tokenizacion de extremo a extremo sin cargar el modelo grande.
- Benchmarking de overhead de framework: medir el coste fijo de carga, compilacion y ejecucion de un grafo hibrido con independencia del tamano de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios no entrenados, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria equivalente a azar y no tendria significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (17M de parametros, aproximadamente 68 MB de pesos mas estados de activacion y cache); en la practica cabe en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es sobredimensionada.
- Cabe en consumer GPU: si, en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (libreria nativa), optimum-intel con OpenVINO (caso de uso principal). No se ha validado vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles; al ser un modelo de juguete, las mediciones no son representativas de ningun caso real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alejandro-rodriguez/tiny-random-nemotron-h` | 16,9 M | no disponible | Fixture de tests OpenVINO | nvidia-nemotron-open-model-license | Hugging Face |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` | 30B (3B activos) | no disponible | Modelo real de produccion | nvidia-nemotron-open-model-license | Hugging Face |
| `NVIDIA-Nemotron-3-Nano-4B` (referenciado en la model card) | 4B | no disponible | Modelo real de menor tamano | no disponible | no disponible |

La comparativa relevante es exclusivamente arquitectonica: el tiny model replica el patron de capas y la configuracion MoE del Nano de 30B a escala minima. No hay modelos comparables en la categoria de "tiny random" mas alla de otros fixtures similares de la comunidad, para los que no se dispone de datos.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado; sus salidas son ruido y no deben interpretarse como texto coherente.
- No apto para produccion: no debe desplegarse en ningun caso de uso real, ni siquiera como demo, porque induciria a error sobre las capacidades de NemotronH.
- Sesgos: no aplica en el sentido habitual, pero al no estar entrenado no se han realizado evaluaciones de sesgo ni de seguridad.
- Alucinacion: total por construccion; cualquier afirmacion factual generada es arbitraria.
- Limitaciones de contexto e idioma: no documentadas; la configuracion no declara `max_position_embeddings` en la informacion disponible.
- Restricciones de licencia: la NVIDIA Nemotron Open Model License impone terminos especificos para uso comercial; debe revisarse el enlace oficial antes de cualquier redistribucion, aunque el modelo en si no tenga valor de uso.
- Caveat de version: la configuracion depende de la nomenclatura de transformers 5.13 o superior (`hybrid_override_pattern`); versiones anteriores pueden fallar al cargarlo.
- El tokenizer pertenece a un modelo de 30B, por lo que el vocabulario es grande respecto al numero de parametros del modelo, lo que hace que los embeddings dominen el recuento total.

## Enlaces

- Hugging Face: https://huggingface.co/alejandro-rodriguez/tiny-random-nemotron-h
- Modelo de referencia del tokenizer: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- optimum-intel (repositorio): https://github.com/huggingface/optimum-intel
- OpenVINO: https://github.com/openvinotoolkit/openvino
- transformers: https://github.com/huggingface/transformers
