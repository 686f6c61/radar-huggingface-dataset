# McG-221/G4-LuneLight-31B-mlx-8Bit

## Resumen

McG-221/G4-LuneLight-31B-mlx-8Bit es una conversion al formato MLX, en cuantizacion de 8 bits, del modelo zerofata/G4-LuneLight-31B. Lo publica el usuario McG-221 en Hugging Face y su unico proposito es permitir la inferencia del modelo base en hardware Apple Silicon mediante la libreria mlx-lm (version 0.31.2 segun la model card). No se trata de un modelo entrenado desde cero, sino de un artefacto de conversion y cuantizacion derivado de un modelo previo.

El modelo base pertenece a la familia "G4" (el tag `gemma4` sugiere una arquitectura inspirada en Gemma), con 30.697.345.280 parametros totales segun los pesos en safetensors, es decir, aproximadamente 30,7 mil millones de parametros. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque la informacion publicada sobre el modelo base es muy limitada: no se documentan datos de entrenamiento, contexto, idiomas ni benchmarks.

Su relevancia es practica y acotada: ofrece una via sencilla para ejecutar un modelo de ~31B en Macs con memoria unificada suficiente, sin necesidad de convertir manualmente los pesos. Para desarrolladores e investigadores que trabajan en entornos Apple, reduce la friccion de despliegue; para el resto de ecosistemas, su utilidad es marginal frente a las versiones GGUF o safetensors del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `gemma4` sugiere familia Gemma) |
| Parametros totales | 30.697.345.280 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base admite otras, no documentadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base zerofata/G4-LuneLight-31B. El tag `gemma4` y el tamano de ~30,7B parametros apuntan a un transformer decoder-only de la familia Gemma, pero no hay confirmacion en la informacion proporcionada sobre numero de capas, dimensiones ocultas, tipo de atencion ni si emplea tecnicas como attention lineal o decodificacion especulativa.

Tampoco se documentan los datos de entrenamiento: numero de tokens, composicion del corpus, fases de alineamiento (RLHF, DPO) ni innovaciones tecnicas. Lo unico verificable es el proceso de conversion: los pesos originales se transformaron a MLX con mlx-lm 0.31.2 y se cuantizaron a 8 bits, lo que reduce el peso del repositorio a 34,6 GB. Cualquier afirmacion sobre el entrenamiento del modelo base queda fuera de la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en formato MLX, ejecutable con `mlx_lm.generate`.
- Soporte de plantilla de chat si el tokenizer del modelo base la incluye (`apply_chat_template`), segun el codigo de ejemplo de la model card.
- Capacidades especificas de razonamiento, codigo, matematicas o vision: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modos especiales (thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado local en macOS: cargar el modelo con `mlx_lm.load` y generar respuestas en un Mac con memoria unificada suficiente (el repo ocupa 34,6 GB, por lo que se recomienda al menos 48 GB de RAM unificada). Adecuado para pruebas rapidas sin infraestructura GPU.
- Evaluacion comparativa de cuantizaciones: usar esta version 8-bit MLX frente a los pesos originales del modelo base para medir la perdida de calidad introducida por la cuantizacion en tareas concretas del equipo.
- Generacion de texto asistida en flujos de escritura: integrar el modelo en scripts Python locales para borradores, resumenes o reescritura, aprovechando la API sencilla de mlx-lm.
- Investigacion sobre eficiencia en Apple Silicon: medir throughput y latencia de un modelo de ~31B cuantizado a 8 bits en chips M-series, como referencia para estudios de despliegue en hardware de consumo.
- Base para ajuste fino ligero en MLX: al estar en formato MLX y licencia Apache 2.0, puede servir como punto de partida para LoRA/QLoRA en entornos Apple, siempre que se validen las capacidades reales del modelo base.
- Servicio interno de bajo coste: desplegar el modelo en una estacion de trabajo Mac para tareas internas no criticas (clasificacion de texto, extraccion de entidades simple), evitando costes de GPU en cloud, tras validar su calidad en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 34,6 GB en 8 bits; se necesita memoria unificada suficiente para cargar los pesos mas el overhead de inferencia (contexto KV cache). Se recomienda un minimo de 48 GB de memoria unificada y 64 GB para contextos largos.
- GPU recomendadas: exclusivamente Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). El formato MLX no esta pensado para GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 48 GB o superior (por ejemplo, Mac Studio o MacBook Pro con M3/M4 Max de 64 GB o mas). No es compatible con GPUs de consumo tipo RTX 4090 mediante este formato.
- Opciones de despliegue: `mlx-lm` (libreria oficial de Apple) es la via documentada. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para estos pesos concretos; para esos entornos habria que usar el modelo base en otro formato.
- Latencia y throughput: no disponibles. Dependen del chip, la memoria y la longitud de contexto, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| McG-221/G4-LuneLight-31B-mlx-8Bit | ~30,7B | no disponible | MLX safetensors 8-bit | Apache 2.0 | Hugging Face (32 descargas) |
| zerofata/G4-LuneLight-31B (base) | ~30,7B | no disponible | safetensors originales | Apache 2.0 (heredada) | Hugging Face |
| Gemma 2 27B (referencia de familia) | 27B | 8K | safetensors, GGUF | Gemma license | Amplia |

No se dispone de datos de rendimiento del modelo base ni de comparativas publicadas, por lo que la comparacion se limita a parametros, formato y licencia. La eleccion frente a alternativas de la misma familia depende de si el entorno de ejecucion es Apple Silicon (donde esta version MLX es la opcion directa) o cualquier otro hardware.

## Limitaciones y advertencias

- Es un artefacto de conversion, no un modelo original: hereda todas las limitaciones del modelo base zerofata/G4-LuneLight-31B, que no estan documentadas.
- La cuantizacion a 8 bits puede degradar ligeramente la calidad respecto a los pesos originales; no se han publicado evaluaciones de esa perdida.
- No hay informacion sobre sesgos, riesgo de alucinacion ni dominios de especializacion; debe validarse antes de cualquier uso en produccion.
- Idiomas soportados no declarados: no se puede asumir un buen rendimiento en castellano sin pruebas.
- Longitud de contexto desconocida: planificar el despliegue sin asumir ventanas largas.
- Compatibilidad limitada a Apple Silicon y `mlx-lm`; no es portable directamente a CUDA.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base no imponga restricciones adicionales no reflejadas en esta ficha.
- Modelo con muy poca traccion (32 descargas, 0 likes): sin comunidad ni soporte, lo que aumenta el riesgo de problemas no documentados.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/McG-221/G4-LuneLight-31B-mlx-8Bit
- Modelo base: https://huggingface.co/zerofata/G4-LuneLight-31B
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
