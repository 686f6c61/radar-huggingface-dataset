# gavinlaw/parameter-archive-02

## Resumen

Parameter archive 02 es un repositorio de checkpoints de reanudacion de entrenamiento (training-resume checkpoints) de politicas vision-language-action (VLA) afinadas, publicado por el usuario gavinlaw bajo licencia MIT. No se trata de un modelo nuevo ni de un modelo listo para inferencia directa, sino de un archivo de estados intermedios de entrenamiento de un modelo derivado de OpenVLA. Cada carpeta `global_step_*` contiene un checkpoint distribuido de PyTorch (`actor/dcp_checkpoint`, con shards de modelo y optimizador y su fichero `.metadata`) y el state dict completo del modelo (`actor/model_state_dict/full_weights.pt`).

El modelo fuente es `Haozhan72/Openvla-oft-SFT-libero-spatial-traj1`, una version afinada con OFT (Optimized Fine-Tuning) del modelo base `openvla/openvla-7b`. OpenVLA es un modelo de 7 mil millones de parametros que combina un codificador visual con un backbone de lenguaje Llama 2 para generar acciones roboticas directamente a partir de instrucciones en lenguaje natural e imagenes. La relevancia de este repositorio es acotada: sirve para reanudar o auditar un proceso de fine-tuning concreto, no para desplegar un asistente conversacional ni un modelo generativo de proposito general.

El tamano del repositorio (60,4 GB) es coherente con el almacenamiento de multiples checkpoints de un modelo de 7B que incluyen pesos del modelo y estado del optimizador. La ficha tecnica se ha elaborado a partir de la informacion disponible en la model card y en los metadatos de Hugging Face; los datos no publicados se indican explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en transformer; backbone de lenguaje Llama 2 y codificador visual (OpenVLA) |
| Parametros totales | 7B (heredados de openvla/openvla-7b; no se detalla en el repo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene checkpoints en punto flotante para entrenamiento, no pesos cuantizados) |
| Idiomas soportados | no disponible (el backbone Llama 2 soporta principalmente ingles; no se declara en la model card) |
| Licencia | MIT (con la licencia comunitaria de Llama 2 aplicable al backbone de lenguaje) |
| Formato de pesos | PyTorch: checkpoint distribuido (`actor/dcp_checkpoint`, shards con `.metadata`) y state dict completo (`actor/model_state_dict/full_weights.pt`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenVLA: un modelo vision-language-action que fusiona un codificador visual con un transformer de lenguaje Llama 2 de 7B y produce acciones motoras como tokens discretizados. El modelo fuente de este archivo es una version afinada con OFT (Optimized Fine-Tuning), la metodologia descrita por Kim et al. (2025) para acelerar el entrenamiento y mejorar la tasa de exito en tareas de manipulacion robotica. El checkpoint concreto corresponde a un ajuste sobre el conjunto de datos LIBERO en la variante `libero-spatial` con la trayectoria `traj1`.

El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Lo que si se conserva es el estado completo del optimizador en cada `global_step_*`, lo que permite reanudar el entrenamiento de forma exacta. No se declaran innovaciones adicionales como decodificacion especulativa o atencion lineal; el interes tecnico esta en la preservacion del estado de entrenamiento distribuido, no en variaciones arquitectonicas.

## Capacidades

- Generacion de acciones roboticas a partir de instrucciones en lenguaje natural e imagenes (control visuomotor).
- Manipulacion robotica en entornos simulados del benchmark LIBERO, en particular la suite espacial.
- Comprension visual basica heredada del codificador de OpenVLA.
- Reanudacion de entrenamiento: los checkpoints incluyen estado del optimizador y metadatos de sharding.
- No se declara soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- No se declara capacidad multilingue explicita; el backbone Llama 2 esta orientado al ingles.
- No se declaran modos especiales como thinking mode, vision conversacional o audio.

## Casos de uso

- Reanudacion de fine-tuning: cargar un `global_step_*` con su estado de optimizador para continuar el entrenamiento exactamente donde se interrumpio, evitando repetir pasos costosos.
- Reproducibilidad de experimentos: comparar el state dict completo (`full_weights.pt`) con los shards distribuidos para verificar la integridad del checkpoint.
- Investigacion en VLA: analizar la evolucion de los pesos a lo largo de los pasos de entrenamiento en tareas LIBERO-spatial.
- Evaluacion de OFT: usar los checkpoints como referencia para medir el efecto de la metodologia de fine-tuning optimizado frente al ajuste estandar.
- Transferencia a robotica real: partir de los pesos afinados en simulacion como inicializacion para experimentos de sim-to-real en manipulacion.
- Docencia y formacion: estudiar la estructura de checkpoints distribuidos de PyTorch en un caso real de 7B con estado de optimizador.
- Auditoria de licencias: verificar la cadena de derivacion (OpenVLA, Llama 2) antes de reutilizar los pesos en un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de tasa de exito en LIBERO ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion; para un modelo de 7B en precision completa se requieren del orden de 14-16 GB solo para pesos, mas activaciones y estado del codificador visual.
- Entrenamiento o reanudacion: al incluir estado del optimizador, el checkpoint completo ocupa varias veces el tamano de los pesos; se requiere hardware multi-GPU con memoria agregada muy superior a la de inferencia.
- GPU recomendadas: no declaradas por el autor; por tamano del modelo, GPUs de datacenter como A100 o H100 son las habituales para este tipo de cargas.
- Cabe en GPU de consumo: no confirmado; un modelo de 7B podria caber en RTX 4090 (24 GB) para inferencia en precision reducida, pero el repo no proporciona pesos cuantizados.
- Opciones de despliegue: no documentadas; al ser checkpoints de entrenamiento en PyTorch distribuido, el flujo natural es PyTorch con las utilidades de checkpoint distribuido, no vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gavinlaw/parameter-archive-02 | 7B (heredado) | no disponible | Checkpoints de entrenamiento VLA | MIT | Hugging Face, 0 descargas |
| openvla/openvla-7b | 7B | no disponible | VLA base | MIT (backbone Llama 2) | Hugging Face, ampliamente usado |
| Haozhan72/Openvla-oft-SFT-libero-spatial-traj1 | 7B (heredado) | no disponible | VLA afinado con OFT en LIBERO-spatial | MIT | Hugging Face |
| Modelos VLA alternativos (p. ej. RT-2, pi0) | no disponible | no disponible | VLA | no disponible / propietaria en parte | no disponible |

La comparativa se limita a la cadena de derivacion documentada; no se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- No es un modelo listo para inferencia: son checkpoints de reanudacion de entrenamiento, no un artefacto de despliegue.
- No se documentan sesgos; al heredar Llama 2 como backbone, pueden persistir los sesgos del modelo base y de los datos de instrucciones roboticas.
- Riesgo de alucinacion no evaluado; en VLA el fallo se manifiesta como acciones incorrectas o inseguras, no como texto erroneo.
- Cobertura limitada a tareas de manipulacion en LIBERO-spatial; no se declara generalizacion a otros entornos.
- Idioma: no se declara soporte multilingue; las instrucciones en castellano no estan garantizadas.
- Licencia: MIT para el repositorio, pero la licencia comunitaria de Llama 2 se aplica al backbone y debe revisarse antes de uso comercial.
- El repositorio tiene 0 descargas y 1 like, sin validacion externa ni resultados publicados.
- El tamano de 60,4 GB y la presencia de estado de optimizador implican requisitos de almacenamiento y memoria considerables.
- No hay garantia de integridad de los checkpoints ni instrucciones de carga; el usuario debe validar los shards y metadatos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gavinlaw/parameter-archive-02
- Modelo fuente: https://huggingface.co/Haozhan72/Openvla-oft-SFT-libero-spatial-traj1
- Modelo base OpenVLA: https://huggingface.co/openvla/openvla-7b
- Paper OpenVLA (Kim et al., 2024): no se proporciona URL en la informacion disponible
- Paper Fine-Tuning VLA Models (Kim et al., 2025): no se proporciona URL en la informacion disponible
