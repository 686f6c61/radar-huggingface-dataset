# hermitdave/Qwen3.5-9B-MLX-slq-4.0bpw

## Resumen

Qwen3.5-9B-MLX-slq-4.0bpw es una cuantizacion de 4 bits del modelo base Qwen/Qwen3.5-9B realizada por el usuario hermitdave mediante su pipeline SLQ (Streaming Layer Quantization), una tecnica de precision mixta orientada a Apple Silicon. El modelo resultante se distribuye en formato MLX, la libreria de Apple para inferencia eficiente en chips de la serie M, y mantiene la licencia Apache 2.0 del modelo original. No se trata de un modelo nuevo entrenado desde cero, sino de una compresion agresiva del backbone de Qwen3.5-9B que reduce el peso en disco a aproximadamente 10,8 GB.

La relevancia de esta ficha radica en dos aspectos. Primero, documenta una practica creciente: la cuantizacion de modelos de gran tamano con esquemas de precision mixta (SLQ 4.0 bits por peso) para hacerlos viables en hardware de consumo Apple. Segundo, expone una limitacion tecnica concreta y bien documentada por el autor: la incompatibilidad entre la cuantizacion SLQ y las cabezas MTP (Multi-Token Prediction) del modelo original, lo que desactiva la decodificacion especulativa nativa.

El modelo base Qwen3.5-9B pertenece a la familia Qwen 3.5 de Alibaba, pero los detalles sobre arquitectura, contexto y datos de entrenamiento del modelo original no se incluyen en la informacion disponible de esta ficha. El dato real de parametros reportado por safetensors es de 4.801.442.304, cifra que no coincide con la denominacion comercial "9B" y que refleja el estado cuantizado del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-9B; detalles no disponibles); backbone cuantizado SLQ |
| Parametros totales | 4.801.442.304 (segun safetensors del checkpoint cuantizado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | SLQ 4.0 bpw (precision mixta, streaming) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `slq_model.py` como loader personalizado |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento. El autor aplica su pipeline SLQ (Streaming Layer Quantization) para comprimir el backbone de Qwen3.5-9B a 4.0 bits por peso con precision mixta, lo que implica asignar distintos numeros de bits a diferentes capas o tensores segun su sensibilidad. El resultado se empaqueta en safetensors compatible con MLX y requiere un loader personalizado (`slq_model.py`) que interpreta el mapa de bits SLQ incluido en `config.json`. No se dispone de informacion sobre el dataset de calibracion, el numero de tokens de entrenamiento del modelo base ni si este recibio RLHF o DPO.

La innovacion tecnica destacable es precisamente la decision de excluir las cabezas MTP. El autor documenta que la cuantizacion SLQ altera la distribucion de estados ocultos del backbone, lo que provoca un desajuste severo con las cabezas MTP entrenadas en BF16. En pruebas de post-entrenamiento de MTP sobre SLQ, la tasa de aceptacion en texto no visto cayo al 2-8 %, frente al 80 % en modelos cuantizados con oQ. Por ello, el autor recomienda usar modelos oQ si se necesita decodificacion especulativa en Apple Silicon.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, aunque no se detallan en la informacion disponible.
- Codigo y matematicas: no disponible de forma explicita; depende del modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.
- Decodificacion especulativa con MTP: no incluida deliberadamente por incompatibilidad con SLQ.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y los 10,8 GB del repo permiten cargar el modelo en equipos con memoria unificada de 16 GB o mas, usando `mlx-lm` con `trust_remote_code=True`.
- Prototipado de asistentes conversacionales en local: util para desarrolladores que quieran experimentar con un modelo de la familia Qwen 3.5 sin depender de servicios en la nube ni de GPUs dedicadas.
- Evaluacion de tecnicas de cuantizacion: sirve como caso de estudio de precision mixta SLQ y de su impacto en componentes acoplados como MTP, para investigadores que comparan esquemas de compresion.
- Generacion de texto offline en entornos con requisitos de privacidad: al ejecutarse integramente en el dispositivo, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles.
- Fine-tuning ligero o adaptadores sobre el checkpoint cuantizado: aunque no se documenta soporte, el formato MLX permite experimentar con LoRA en Apple Silicon, siempre que se valide la calidad tras la cuantizacion.
- Baseline para comparativas de rendimiento en hardware de consumo: permite medir throughput y latencia de un modelo de ~4,8 mil millones de parametros cuantizados a 4 bits en chips M-series frente a alternativas GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 10,8 GB; se recomienda un minimo de 16 GB de memoria unificada para cargar el modelo con margen para el contexto y el tokenizer.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX. No es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no esta pensado para GPUs NVIDIA consumer.
- Opciones de despliegue: `mlx-lm` con `trust_remote_code=True` es el unico metodo documentado. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato SLQ personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hermitdave/Qwen3.5-9B-MLX-slq-4.0bpw | 4.801.442.304 (checkpoint cuantizado) | no disponible | SLQ 4.0 bpw | Apache 2.0 | Hugging Face, formato MLX |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | BF16 (original) | Apache 2.0 | Hugging Face |
| Modelos Qwen3.5 cuantizados con oQ | no disponible | no disponible | oQ (con MTP) | Apache 2.0 | Segun autor, recomendados para decodificacion especulativa |

La comparativa se limita al modelo base y a la familia de cuantizaciones oQ mencionada por el autor; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Ausencia de MTP: no se puede usar decodificacion especulativa nativa; el autor recomienda modelos oQ para ese fin en Apple Silicon.
- Perdida de calidad por cuantizacion: SLQ a 4.0 bpw introduce degradacion respecto al modelo en BF16; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Loader personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor (`slq_model.py`); conviene auditar ese archivo antes de usarlo en produccion.
- Compatibilidad limitada: solo MLX/Apple Silicon; no hay soporte documentado para CUDA, llama.cpp u otros runtimes.
- Idiomas y contexto: no se especifican, por lo que no se puede garantizar el comportamiento multilingue ni la ventana de contexto efectiva tras la cuantizacion.
- Sesgos y alucinaciones: no documentados en la informacion disponible; se heredan los del modelo base, que tampoco se detallan.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base Qwen3.5-9B mantenga esa misma licencia y que la cuantizacion no anada restricciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/hermitdave/Qwen3.5-9B-MLX-slq-4.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
