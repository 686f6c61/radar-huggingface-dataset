# davidheineman/rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-10-discretelogarithm-27d15d0d816d

## Resumen

Este repositorio contiene un checkpoint archivado de un modelo de lenguaje de la familia Qwen2, publicado por el usuario davidheineman bajo la etiqueta `rlve` y `scratch-archive`. El modelo cuenta con 1.777.088.000 parámetros totales (aproximadamente 1,78 mil millones) y se distribuye en formato `safetensors`, con un tamano de repositorio de 3,6 GB. Se trata de un artefacto de investigacion: un checkpoint intermedio o final de un experimento de aprendizaje por refuerzo, no de un modelo instructivo listo para produccion.

El nombre del repositorio (`rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-10-discretelogarithm-27d15d0d816d`) codifica la ejecucion de la que procede: el prefijo `rlve` apunta al proyecto RLVE (Reinforcement Learning with Verifiable Environments), descrito en el paper arXiv:2511.07317, mientras que `10-DiscreteLogarithm` identifica el entorno concreto sobre el que se entreno esta variante. Segun la model card, corresponde al checkpoint final del paso 19 de la ruta `runs/mopd-v2-r1-p1r8-teachers-20261003-115039/resumable/10-DiscreteLogarithm`, con el ID de ejecucion de Weights & Biases `57a20521`.

Su relevancia es reproducible pero acotada: sirve como material de referencia para reproducir experimentos de RL con entornos verificables y como posible modelo profesor dentro de una coleccion de destilacion. No se ha publicado informacion sobre licencia, idiomas, pipeline de inferencia ni resultados de evaluacion, y el repositorio no registra descargas ni interacciones, lo que refuerza su caracter de archivo interno de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (etiqueta `qwen2` en el repositorio); detalles completos no disponibles |
| Parametros totales | 1.777.088.000 (1,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B soporta 32.768 tokens, sin confirmar para este checkpoint |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos `safetensors` sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio (el modelo base Qwen2.5 se distribuye bajo Apache 2.0, pero no se declara aqui) |
| Formato de pesos | `safetensors` (identificador de formato en la model card: `hf-safetensors`) |

## Arquitectura y entrenamiento

La unica informacion estructural confirmada es la etiqueta `qwen2` del repositorio y el recuento de parametros, que coincide con el orden de magnitud de Qwen2.5-1.5B (1,78 mil millones de parametros totales). Todo apunta a un transformer decoder-only con atencion por causalidad, pero la model card no especifica numero de capas, dimension oculta, cabezas de atencion, tipo de normalizacion ni estrategia posicional. Tampoco se documenta si se aplicaron tecnicas como GQA o decodificacion especulativa.

El entrenamiento se enmarca en RLVE (Reinforcement Learning with Adaptive Verifiable Environments), un metodo que escala el aprendizaje por refuerzo de modelos de lenguaje mediante entornos verificables que generan problemas de forma procedural con dificultad ajustable a la capacidad de la politica. La model card indica que este checkpoint es el estado final del paso 19 de una ejecucion completada, y la coleccion publica del autor describe modelos Qwen 2.5 1.5B Instruct entrenados durante 150 pasos sobre un unico entorno, cubriendo 32 de 400 entornos. No se detalla el algoritmo de optimizacion, el numero de tokens consumidos, la composicion del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura Qwen2 subyacente.
- Razonamiento orientado al entorno `10-DiscreteLogarithm`, segun la ruta de la ejecucion archivada; se desconoce si esa especializacion se generaliza a tareas fuera de dicho entorno.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso.
- Soporte multilingue: no disponible.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponibles.
- No se documenta plantilla de chat, tokens especiales ni formato de prompt recomendado.

## Casos de uso

- Reproduccion de experimentos RLVE: el checkpoint permite inspeccionar el estado final de una politica entrenada sobre el entorno `10-DiscreteLogarithm` y comparar curvas de aprendizaje frente a otras variantes de la misma coleccion.
- Analisis de dinamica de entrenamiento: al conservar el paso final 19 y el ID de W&B `57a20521`, resulta util para auditar como evoluciona la politica en las primeras fases de un entrenamiento con recompensas verificables.
- Modelo profesor en destilacion: su inclusion en el repositorio `rlve-archive-...-teachers-...` sugiere su uso como generador de trayectorias o etiquetas para entrenar politicas mas pequenas. No hay documentacion que confirme el procedimiento exacto.
- Banco de pruebas de infraestructura: con 1,78 mil millones de parametros y pesos `safetensors`, sirve para validar pipelines de carga, serializacion y despliegue antes de escalar a modelos mayores.
- Investigacion sobre entornos verificables: util para estudiar la transferencia entre tareas procedurally generated y problemas de logaritmo discreto.
- Docencia y formacion: ejemplo real de artefacto intermedio de RL para explicar la diferencia entre checkpoint de investigacion y modelo publicado con model card completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas especificas del entorno `10-DiscreteLogarithm`, y el repositorio no incluye evaluaciones ni descargas registradas.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 3,6-4 GB solo para pesos, mas memoria para el contexto y el runtime (aproximadamente 5-6 GB en la practica).
- VRAM estimada en INT8: aproximadamente 1,8-2,5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (si se convierte a GGUF): aproximadamente 1,1-1,5 GB.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en tarjetas de 8 GB con cuantizacion de 8 o 4 bits.
- GPU profesionales recomendadas para servir en produccion: A10G, L4, L40S, A100 40/80 GB, H100, segun concurrencia y longitud de contexto deseada.
- Opciones de despliegue: `transformers` con PyTorch para inferencia directa; vLLM o TGI para servir con batching continuo; llama.cpp u Ollama si se convierte previamente a GGUF; el repositorio no publica pesos GGUF, por lo que esa conversion debe realizarse manualmente.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni consumo energetico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (rlve-archive-mopd-v2...10-DiscreteLogarithm) | 1,78 mil millones | no disponible | no disponible | Repositorio de archivo, 0 descargas | Checkpoint de investigacion sin model card completa |
| Qwen2.5-1.5B-Instruct | 1,54 mil millones (1,78 totales) | 32.768 tokens | Apache 2.0 | Publico, ampliamente descargado | Modelo base instructivo con benchmarks publicados; el checkpoint archivado parte de esta familia |
| Llama 3.2 1B Instruct | 1,24 mil millones | 128.000 tokens | Licencia comunitaria de Llama | Publico | Alternativa de tamano similar con contexto mucho mayor |
| SmolLM2-1.7B-Instruct | 1,71 mil millones | 8.192 tokens | Apache 2.0 | Publico | Tamano comparable, orientado a despliegue ligero |

La comparacion con modelos publicados solo es orientativa: no existen datos de rendimiento del checkpoint archivado, por lo que no puede establecerse una jerarquia de calidad frente a estas alternativas.

## Limitaciones y advertencias

- Es un checkpoint de investigacion archivado, no un modelo publicado para uso general: carece de model card descriptiva, plantilla de chat y evaluaciones.
- Licencia no declarada. Sin una licencia explicita no puede asumirse permiso de uso comercial, aunque el modelo base Qwen2.5 se distribuya bajo Apache 2.0.
- Idiomas soportados sin especificar, por lo que no puede garantizarse un comportamiento adecuado fuera del ingles o del castellano.
- Entrenado sobre un unico entorno de RL (`10-DiscreteLogarithm`) durante un numero de pasos reducido; es probable un sobreajuste a esa tarea y una degradacion de capacidades generales por olvido catastrofico, aunque no hay mediciones que lo confirmen.
- Riesgo de alucinacion no evaluado. Al no existir benchmarks, no puede acotarse la tasa de respuestas incorrectas.
- Ausencia de informacion sobre sesgos: el dataset de entrenamiento y su composicion no estan documentados.
- Contexto maximo no confirmado. Si hereda los 32.768 tokens de Qwen2.5-1.5B, el rendimiento en contextos largos sigue sin verificarse para este checkpoint concreto.
- Sin descargas ni interacciones registradas en el repositorio, lo que implica ausencia de validacion por parte de la comunidad.
- No se documentan tokens especiales, formato de prompt ni parametros de generacion recomendados, lo que complica su integracion directa en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/davidheineman/rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-10-discretelogarithm-27d15d0d816d
- Coleccion "RLVE OPD Teachers": https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Coleccion "RLVE OPD Teachers (Qwen 2.5 1.5B)": https://huggingface.co/collections/davidheineman/rlve-opd-teachers-qwen-25-15b
- Repositorio GitHub del proyecto RLVE: https://github.com/davidheineman/rlve
- Paper RLVE: Scaling Up Reinforcement Learning for Language Models with Adaptive Verifiable Environments: https://arxiv.org/pdf/2511.07317v1
- Ficha del paper en arXiv: https://arxiv.org/abs/2511.07317
