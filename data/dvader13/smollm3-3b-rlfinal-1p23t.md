# dvader13/smollm3-3b-rlfinal-1p23t

## Resumen

Este repositorio contiene un checkpoint intermedio de entrenamiento por refuerzo (RL) basado en SmolLM3-3B, el modelo de 3.000 millones de parámetros desarrollado por HuggingFaceTB. El checkpoint corresponde al final de la primera época de un proceso de RL (paso 1804) y se publica con el estado completo del entrenamiento: pesos en fp32, optimizador, scheduler y estado de RNG. Su propósito principal es permitir reanudar el entrenamiento, no servir como artefacto de inferencia directa.

El modelo base, SmolLM3-3B, es un transformer denso entrenado sobre 11 billones de tokens, con soporte multilingüe para cinco lenguas europeas y ventana de contexto de 32.768 tokens. Según los datos publicados, supera a Llama 3.2 3B y Qwen2.5 3B en benchmarks estándar y compite con alternativas de 4B. Este checkpoint concreto, con 36,9 GB de tamaño, está pensado para quien quiera continuar la investigación o replicar el pipeline de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: SmolLM3-3B) |
| Parametros totales | 3B (aprox.) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (base SmolLM3-3B) |
| Tipos de cuantizacion | No disponible (checkpoint fp32, no exportado) |
| Idiomas soportados | Ingles, frances, aleman, espanol, portugues, italiano (segun SmolLM3) |
| Licencia | Apache-2.0 |
| Formato de pesos | fp32 (estado completo de entrenamiento) |

## Arquitectura y entrenamiento

El checkpoint se construye sobre SmolLM3-3B, un modelo transformer autoregresivo con arquitectura estandar de decoder-only. El entrenamiento base consumio 11T tokens procedentes de datasets publicos, con una fase de preentrenamiento de 1,23T tokens en el rung correspondiente a este checkpoint. El modelo base incorpora mejoras de entrenamiento como atencion con ventana deslizante combinada con atencion global para gestionar el contexto largo de 32K tokens.

Este repositorio concreto es el resultado de una fase de RL (reinforcement learning) aplicada sobre el modelo base, guardada en el paso 1804 de la primera época. El estado completo incluye pesos en fp32, optimizador, scheduler y RNG, lo que lo hace resumible pero no directamente servible para inferencia. No se indica el algoritmo de RL utilizado (PPO, DPO u otro) ni el dataset de preferencias empleado.

## Capacidades

- Generacion de texto y razonamiento: el modelo base SmolLM3-3B demuestra competencia en tareas de razonamiento comun y conocimiento general.
- Multilingue: rendimiento consistente en cinco lenguas europeas (ingles, frances, aleman, espanol, portugues) evaluado en Global MMLU, HellaSwag, Flores-200 y Belebele.
- Contexto largo: ventana de 32.768 tokens que permite procesar documentos extensos y conversaciones de muchos turnos.
- Codigo: capacidad de generacion de codigo heredada del entrenamiento base, aunque no se especifica el porcentaje de datos de codigo.
- Tool calling y agentes: no hay informacion especifica sobre soporte de function calling en este checkpoint; el modelo base no lo documenta explicitamente.
- Nota: al ser un checkpoint de entrenamiento, estas capacidades no son directamente utilizables sin exportar el modelo a pesos de inferencia.

## Casos de uso

- Investigacion en RL: el checkpoint permite reanudar el entrenamiento de RL desde el paso 1804, probar variaciones del algoritmo de refuerzo o modificar el dataset de preferencias sin partir de cero.
- Replicacion de experimentos: investigadores que quieran reproducir el pipeline de RL de SmolLM3 pueden usar este checkpoint como punto de partida verificado.
- Fine-tuning posterior: aunque no es un export de inferencia, se puede convertir a pesos de inferencia y aplicar fine-tuning adicional para tareas especificas.
- Evaluacion de checkpoints intermedios: estudiar la evolucion de las capacidades del modelo durante el entrenamiento de RL comparando con checkpoints anteriores o posteriores.
- Desarrollo de tecnicas de RL para modelos pequenos: SmolLM3-3B es un modelo compacto ideal para probar algoritmos de RL con requisitos de hardware moderados.
- Auditoria de alineacion: analizar los efectos del RL sobre el comportamiento del modelo en tareas de seguridad y sesgo, comparando con la version base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint concreto. Los datos disponibles corresponden al modelo base SmolLM3-3B, que segun el repositorio de HuggingFace supera a Llama 3.2 3B y Qwen2.5 3B en benchmarks estandar, y es competitivo con modelos de 4B como Qwen3 y Gemma3. No se proporcionan numeros especificos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo base en fp16 se estiman entre 6 y 8 GB de VRAM en cuantizacion 8-bit y entre 4 y 6 GB en 4-bit. Este checkpoint en fp32 pesa 36,9 GB, por lo que no es viable para inferencia directa en consumer GPU.
- GPU recomendadas: para el entrenamiento o reanudacion de RL, se recomienda al menos una A100 de 40 GB o H100 de 80 GB dado el estado completo del optimizador y scheduler. Para inferencia tras exportar, una RTX 4090 (24 GB) o similar es suficiente en cuantizacion.
- Opciones de despliegue: no aplicable directamente por ser un checkpoint. Tras exportar a safetensors o GGUF, se podria servir con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible para este checkpoint. El modelo base de 3B en una RTX 4090 con cuantizacion 4-bit puede generar de 40 a 60 tokens por segundo, pero no se ha medido para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 32K | Apache-2.0 | SoTA en escala 3B, competitivo con 4B |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | Superado por SmolLM3 en benchmarks |
| Qwen2.5 3B | 3B | 32K | Apache-2.0 | Superado por SmolLM3 en benchmarks |
| Gemma3 4B | 4B | 32K | Gemma Terms | Competidor de mayor tamano |

Este checkpoint no es comparable directamente con estos modelos por ser un artefacto de entrenamiento, no un modelo servible.

## Limitaciones y advertencias

- No es un export de inferencia: el checkpoint contiene pesos fp32, optimizador, scheduler y RNG. Cargarlo y usarlo para generar texto requiere conversion a formato de inferencia (safetensors o GGUF) y eliminacion de estados de entrenamiento.
- Tamano del repositorio: 36,9 GB para un modelo de 3B, lo que refleja el estado completo de entrenamiento, no los pesos de inferencia.
- Sin documentacion del algoritmo de RL: se desconoce si se uso PPO, DPO u otro metodo, y que dataset de preferencias se empleo. Esto limita la reproducibilidad.
- Sesgos y alucinaciones: el modelo base presenta los sesgos tipicos de modelos entrenados con datos web publicos, y el proceso de RL puede no haber mitigado todos los riesgos.
- Riesgo de alucinacion en contexto largo: aunque el modelo base soporta 32K tokens, la atencion con ventana deslizante puede degradar la coherencia en documentos muy extensos.
- Idioma: el rendimiento fuera de los cinco idiomas europeos soportados es limitado, especialmente en lenguas asiaticas o africanas.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base SmolLM3 tiene restricciones adicionales en su licencia que deberian revisarse antes de desplegar en produccion.
- Cero descargas y cero likes: es un repositorio reciente sin validacion de la comunidad, por lo que no hay garantias de que el checkpoint este libre de errores de serializacion.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/dvader13/smollm3-3b-rlfinal-1p23t
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Blog oficial de SmolLM3: https://huggingface.co/blog/smollm3
- Repositorio de SmolLM (GitHub): https://github.com/huggingface/smollm
- Web de SmolLM3: https://smollm3.org/
