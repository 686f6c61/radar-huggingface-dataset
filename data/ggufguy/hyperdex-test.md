# GGUFGuy/hyperdex-test

## Resumen

hyperdex-test es un modelo de lenguaje decoder-only de 1.000.224 parametros entrenado desde cero por el usuario @GGUFGuy sobre el dataset fineweb-edu, utilizando el Space NanoDex Trainer. Se trata de un artefacto de investigacion a escala nano: su proposito no es competir con asistentes de produccion, sino servir como caso reproducible y observable del proceso completo de preentrenamiento de un transformer (tokenizador propio incluido, entrenamiento, evaluacion de perdida y publicacion de pesos).

La arquitectura es un `LlamaForCausalLM` estandar, escalado en anchura y profundidad para encajar en el presupuesto de un millon de parametros: 96 dimensiones ocultas, 5 capas, atencion con query agrupada (6 cabezas de consulta, 2 de clave/valor), FFN de 472 unidades, RMSNorm, RoPE, embeddings atados y sin sesgos. La longitud de contexto es de 512 tokens y el vocabulario es un BPE personalizado de 2.048 tokens entrenado sobre fineweb-edu.

Su relevancia es fundamentalmente didactica y metodologica: al haberse entrenado en 14,7 minutos sobre 299.892.736 tokens, resulta util como referencia de bajo coste para validar pipelines de preentrenamiento, comparar tokenizadores, reproducir curvas de perdida y probar integraciones de despliegue sin consumir recursos de GPU significativos. No es un modelo apto para tareas de asistente ni para generacion factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`), SiLU MLP, RMSNorm, RoPE, grouped-query attention, embeddings atados, sin sesgos |
| Parametros totales | 1.000.224 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | odc-by (Open Data Commons Attribution License) |
| Formato de pesos | safetensors (libreria transformers) |
| Dimension oculta | 96 |
| Capas | 5 |
| Cabezas de atencion | 6 de consulta / 2 de clave-valor |
| Tamano de FFN | 472 |
| Vocabulario | 2.048 (BPE personalizado entrenado sobre fineweb-edu) |

## Arquitectura y entrenamiento

El modelo sigue el patron clasico de los transformers decoder-only tipo Llama, con las modificaciones habituales de eficiencia: normalizacion RMSNorm en lugar de LayerNorm, activacion SiLU en el MLP, rotary position embeddings (RoPE) para la codificacion posicional y atencion con query agrupada (GQA) con 6 cabezas de consulta y 2 de clave/valor, lo que reduce el coste de la cache KV. Los embeddings de entrada y la cabeza de salida estan atados y todas las capas carecen de sesgos. Con 96 dimensiones ocultas y 5 capas, la red esta muy comprimida en anchura y profundidad respecto a sus equivalentes de escala de produccion.

El entrenamiento consumio 299.892.736 tokens de fineweb-edu a lo largo de 2.288 pasos, con un lote efectivo de 131.072 tokens por paso. Se uso el optimizador AdamW con betas (0,9, 0,95), weight decay de 0,1 y recorte de gradiente de 1,0, junto con un schedule de learning rate de warmup del 2% seguido de decaimiento coseno hasta el 10% del valor pico, fijado en 3e-03. La perdida final reportada es de 3,5412 (perplejidad 34,5) y el tiempo total de entrenamiento fue de 14,7 minutos. No se documenta ninguna fase posterior de ajuste fino, RLHF o DPO, ni tecnicas de decodificacion especulativa; el modelo es exclusivamente un preentrenamiento base.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, limitada a continuaciones cortas.
- Modelado de formas de palabra, colocaciones frecuentes y algo de sintaxis superficial, segun declara el propio autor.
- Tokenizacion propia mediante un vocabulario BPE de 2.048 tokens entrenado sobre fineweb-edu.
- Inferencia estandar via `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`, incluyendo generacion con muestreo (`do_sample=True`, `temperature`, `top_k`).
- Compatibilidad declarada con Text Generation Inference (tag `text-generation-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision, audio ni modalidades adicionales.
- Capacidad multilingue limitada al ingles; no se documenta soporte de otros idiomas.
- No se ha publicado ningun proceso de alineacion (RLHF/DPO), por lo que no hay garantia de seguimiento de instrucciones.

## Casos de uso

- Docencia sobre preentrenamiento desde cero: el modelo permite mostrar en clase o en un taller el ciclo completo (tokenizador, bucle de entrenamiento, curva de perdida, publicacion de pesos) en menos de 15 minutos de computo.
- Pruebas de humo en pipelines de despliegue: sirve como fixture ligero para verificar que un servidor TGI, un endpoint compatible o un script de `transformers` carga pesos safetensors, tokeniza y genera, sin necesidad de GPU.
- Validacion de integraciones de CI/CD: al ocupar unos pocos megabytes, puede incorporarse a tests automatizados que comprueben contratos de API de inferencia, serializacion de pesos y compatibilidad de versiones de librerias.
- Experimentos de tokenizacion: su BPE de 2.048 tokens permite comparar estrategias de vocabulario y estudiar el efecto del tamano del vocabulario en modelos diminutos.
- Estudios de escalado y ablaciones: constituye una linea base reproducible de ~1M de parametros para contrastar variantes arquitectonicas (numero de capas, GQA frente a MHA, embeddings atados) a coste casi nulo.
- Reproduccion de curvas de aprendizaje: con 2.288 pasos documentados y perdida final de 3,5412, permite verificar implementaciones propias de AdamW, schedules de learning rate y recorte de gradiente contra un resultado conocido.
- Demostraciones de generacion de texto no factual: util para ilustrar de forma tangible los limites de un modelo subentrenado y por que la fluidez local no implica conocimiento.
- Experimentacion en entornos sin acelerador: al ser ejecutable en CPU, posibilita practicas de inferencia en portatiles, aulas o dispositivos de laboratorio sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento: perdida final de 3,5412 y perplejidad de 34,5 sobre el objetivo de preentrenamiento. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones con modelos de referencia. La busqueda web realizada no devolvio resultados relacionados con este modelo.

| Metrica | Valor |
|---|---|
| Perdida final de entrenamiento | 3,5412 |
| Perplejidad | 34,5 |
| Tokens vistos | 299.892.736 |
| MMLU, HumanEval, GSM8K u otros | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 MB en FP32, 2 MB en FP16/BF16 y alrededor de 1 MB en int8 para los pesos; la cache KV es despreciable con 5 capas y 2 cabezas KV sobre 512 tokens de contexto.
- GPU recomendadas: no requiere GPU. Cualquier acelerador (A100, H100, RTX 4090, RTX 3060 o integradas) es sobredimensionado para este modelo; la ejecucion en CPU es completamente viable.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU sin aceleracion, dada la magnitud de parametros.
- Opciones de despliegue: `transformers` en Python (ruta oficial documentada), Text Generation Inference segun el tag del repositorio, y endpoints compatibles. No se documentan variantes GGUF ni Ollama, a pesar del nombre del autor.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada ni en los resultados de busqueda, que no guardan relacion con el modelo. La unica fila que puede completarse con datos verificados es la de hyperdex-test.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| hyperdex-test | 1.000.224 | 512 | odc-by | no disponible (perplejidad 34,5 en entrenamiento) | HuggingFace, safetensors |
| Alternativas de escala nano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigacion a escala nano: el propio autor lo describe como un artefacto que no es un asistente util y cuya salida no es factual.
- Riesgo de alucinacion muy elevado: con 1.000.224 parametros y 299.892.736 tokens de entrenamiento, no puede almacenar conocimiento factual fiable.
- Capacidad limitada a formas de palabra, colocaciones frecuentes y sintaxis superficial; se esperan incoherencias a partir de pocas decenas de tokens.
- Sin alineacion: no hay RLHF, DPO ni ajuste por instrucciones, por lo que no sigue ordenes ni formatos de forma consistente.
- Contexto reducido: 512 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas, incluido el castellano.
- Sin sesgos documentados: no se publica ninguna evaluacion de sesgos ni de toxicidad, lo que no implica su ausencia.
- Uso comercial: la licencia odc-by permite uso comercial con atribucion, pero el modelo carece de utilidad practica para productos; ademas, deben respetarse las condiciones del dataset fineweb-edu.
- Fecha de creacion del repositorio poco habitual (2026-09-12) y cero descargas y likes: sin validacion por parte de la comunidad.
- Tamano del repositorio reportado como 0,0 GB: conviene verificar la integridad de los pesos antes de usarlos en cualquier automatizacion.
- No apto para produccion: no debe desplegarse en atencion al cliente, generacion de codigo ni ningun flujo donde la veracidad sea requisito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GGUFGuy/hyperdex-test
- Dataset de entrenamiento (fineweb-edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Space NanoDex Trainer: https://huggingface.co/spaces/hugging-science/nanodex-trainer
- Perfil del autor: https://huggingface.co/GGUFGuy
- Paper, blog o repositorio adicionales: no disponible
