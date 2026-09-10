# ruwwww/ornith-1.5-9b-ninfer

## Resumen

El repositorio `ruwwww/ornith-1.5-9b-ninfer` es un artefacto de inferencia optimizado para NInfer, un motor de inferencia C++/CUDA de código abierto desarrollado por ruwwww para GPUs NVIDIA Blackwell. No es un checkpoint estándar de Transformers ni un archivo GGUF/AWQ: contiene el modelo base **Ornith-1.5-9B** de ornith-ai convertido al formato interno `.ninfer`. El artefacto se ha probado en NVIDIA GeForce RTX 5060 Ti (16 GB) y RTX 5090, con un peso del repositorio de 6.5 GB y un archivo de 6.07 GiB.

Este modelo es relevante porque permite ejecutar un modelo de 9B en hardware de consumo reciente con rendimientos de inferencia muy altos, gracias a la cuantización `groupwise-int` (Q4/Q5/Q6/W8) y a la decodificación especulativa MTP3 (Multi-Token Prediction) integrada en el motor NInfer. Los datos publicados muestran un throughput de prefill de ~2,581 tok/s y una capacidad de servicio concurrente de hasta ~310 tok/s agregados con 8 clientes, manteniendo una huella de VRAM de ~5.52 GiB. La licencia es MIT, si bien la arquitectura exacta, el número de parámetros y la ventana de contexto no se indican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base Ornith-1.5-9B aparece etiquetado como "qwen3.5", sin confirmacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | groupwise-int (Q4/Q5/Q6/W8) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | .ninfer (artefacto propietario del motor NInfer, no es GGUF, AWQ ni safetensors) |
| Tamano del artefacto | 6,514,051,072 bytes (6.07 GiB) |
| Hash SHA-256 | c465a06c9d32339493fd5000512724604b12965eb0a8963abe90acfc470f3fbe |
| Modelo ID en NInfer | ornith-1.5-9b |
| Target Key | ornith_1_5_9b |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de fine-tuning del modelo base Ornith-1.5-9B en la documentación proporcionada. Los tags del repositorio en HuggingFace apuntan a una relación con la familia Qwen3.5 y a capacidades de razonamiento ("reasoning"), pero no hay detalles confirmados sobre capas, atención, número de cabezas ni tipo de transformer.

El motor NInfer, en cambio, presenta una innovación destacable en el proceso de inferencia: la decodificación especulativa con múltiples tokens de borrador (MTP3). Esto permite predecir tres tokens futuros por paso, con una tasa de aceptación observada de ~60 % y ~2.7 tokens por ronda en las pruebas publicadas. El artefacto `.ninfer` incluye además capas LM head de borrador necesarias para esta técnica. No se detalla si hubo RLHF, DPO u otras etapas de alineación.

## Capacidades

- Generación de texto en modo `text-generation` (pipeline estandar de HuggingFace).
- Razonamiento, indicado mediante la etiqueta `reasoning` en los metadatos del repositorio, aunque sin benchmarks publicados.
- Decodificación especulativa MTP3 con hasta 3 tokens de borrador por paso, integrada en el motor NInfer.
- Ejecución nativa sobre CUDA en GPUs NVIDIA Blackwell (verificado en RTX 5060 Ti y RTX 5090).
- Servicio HTTP compatible con OpenAI mediante el binario `ninfer-serve`, que permite gestionar múltiples clientes concurrentes.
- Cuantización mixta groupwise-int con perfiles Q4/Q5/Q6/W8, optimizando la relación entre precisión y velocidad.
- No se documenta soporte de tool calling, visión, audio ni multimodalidad.

## Casos de uso

- Atencion al cliente en tiempo real: el motor `ninfer-serve` expone una API compatible con OpenAI, lo que permite integrar el modelo en sistemas de chat empresariales. Con un throughput de ~191 tok/s a concurrencia 4, puede atender varios clientes simultáneamente en una RTX 5060 Ti.
- Asistentes de codigo en local: el rendimiento de prefill de ~2,581 tok/s hace viable la generacion de respuestas largas o analisis de contextos extensos en una workstation de sobremesa con GPU Blackwell. La baja huella de VRAM (5.52 GiB) deja espacio para cache KV de varios usuarios.
- Generacion de texto para aplicaciones de baja latencia: la decodificacion especulativa MTP3 reduce el tiempo por token en escenarios interactivos. Para un solo cliente, se alcanzan ~108 tok/s de media, lo que resulta util en editores con autocompletado o en interfaces de dialogo.
- Investigacion en decodificacion especulativa: el artefacto incluye capas de LM head de borrador y un perfil de pesos groupwise-int que facilita el estudio de estrategias de prediccion de multiples tokens. Los datos de aceptacion (~60 %) y tokens por ronda (~2.7) son puntos de referencia para experimentos academicos.
- Despliegue en entornos sin nube: al ejecutarse de forma local en GPUs NVIDIA Blackwell, el modelo es adecuado para aplicaciones con requisitos de privacidad o conectividad limitada. El repositorio NInfer proporciona binarios CLI y servidor, evitando dependencias externas.
- Evaluacion de motores de inferencia en hardware de consumo: la combinacion de cuantizacion Q4/Q5/Q6/W8 y decodificacion especulativa MTP3 permite comparar el rendimiento de NInfer frente a otros engines (como vLLM o llama.cpp) usando el mismo modelo base cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos publicados corresponden al rendimiento de inferencia medido en NVIDIA GeForce RTX 5060 Ti (16 GB) con el motor NInfer.

| Metrica | Valor | Condiciones |
|---|---|---|
| Long-prompt prefill throughput | ~2,581 tok/s | `--prefill-chunk 4096 --kv-dtype int8` |
| Throughput servidor MTP3 (C=1) | ~108.2 tok/s | `--spec mtp --draft-tokens 3 --lm-head-draft` |
| Throughput servidor MTP3 (C=4) | ~191.1 tok/s | idem |
| Throughput servidor MTP3 (C=8) | ~309.9 tok/s agregados | idem, decode en estado estacionario ~339.6 tok/s |
| Tasa de aceptacion MTP | ~60 % | ~2.7 tok/round |
| Huella de VRAM | ~5.52 GiB | pesos del modelo + capas MTP |

## Requisitos de hardware

- VRAM estimada: ~5.52 GiB para el modelo y las capas MTP, sobre una GPU con 16 GB de VRAM (RTX 5060 Ti). Queda margen para cache KV multi-cliente.
- GPU recomendadas: NVIDIA GeForce RTX 5060 Ti (16 GB) y RTX 5090, ambas verificadas explícitamente por el autor.
- Compatibilidad con GPU de consumo: sí, pero únicamente con arquitectura Blackwell y drivers CUDA actualizados. No se menciona soporte para RTX 40 o generaciones anteriores.
- Opciones de despliegue: NInfer CLI (`ninfer`) y servidor HTTP (`ninfer-serve`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` es exclusivo de NInfer.
- Latencia y throughput: los valores de la tabla de benchmarks aplican a las condiciones indicadas. El motor requiere compilacion desde las fuentes del repositorio `ruwwww/ninfer-5060ti`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye benchmarks de calidad ni comparativas con otros modelos de la misma categoria. El unico punto de comparacion posible seria con otras cuantizaciones del propio modelo base, como `ornith-ai/Ornith-1.5-9B-NVFP4`, pero no hay datos publicados de rendimiento ni de precision para este artefacto.

## Limitaciones y advertencias

- Formato propietario `.ninfer`: el artefacto no es un checkpoint estandar y solo puede ejecutarse con el motor NInfer compilado desde fuentes. No es portable a frameworks habituales como Transformers o llama.cpp.
- Dependencia de hardware Blackwell: el motor esta verificado únicamente en RTX 5060 Ti y RTX 5090. El uso en otras GPUs requiere desarrollo o adaptacion, y no hay garantias de rendimiento ni compatibilidad.
- Sin documentacion de calidad: no se han publicado resultados en benchmarks clasicos ni evaluaciones de sesgo, alucinacion o capacidades multilingues. Estas metricas deben determinarse mediante pruebas propias antes de usar el modelo en produccion.
- Ausencia de datos de arquitectura y entrenamiento: se desconocen la ventana de contexto, el numero exacto de parametros, los idiomas realmente soportados y si hubo procesos de alineacion (RLHF/DPO). Esto limita la evaluacion preliminar.
- Proyecto nuevo y sin adopcion: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad. La fecha de creacion (2026-09-09) es muy reciente y el soporte puede ser limitado.
- Riesgo de errores en la conversion: la generacion del artefacto fue automatizada por agentes (Hermes Agent × Codex Agent) y no se aporta documentacion independiente sobre el proceso, por lo que podrian existir diferencias de comportamiento frente al modelo base original.
- Licencia MIT del artefacto: aunque la licencia es permisiva, el uso comercial tambien depende de la licencia del modelo base ornith-ai/Ornith-1.5-9B, que no se detalla en esta informacion.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/ruwwww/ornith-1.5-9b-ninfer
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Modelo base en NVFP4: https://huggingface.co/ornith-ai/Ornith-1.5-9B-NVFP4
- Motor NInfer y codigo fuente: https://github.com/ruwwww/ninfer-5060ti
