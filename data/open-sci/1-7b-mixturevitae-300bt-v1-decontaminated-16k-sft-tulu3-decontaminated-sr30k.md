# open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-SFT-Tulu3-decontaminated-sr30k

## Resumen

El modelo `open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-SFT-Tulu3-decontaminated-sr30k` es un ajuste fino supervisado (SFT) de la familia MixtureVitae, desarrollado por el colectivo open-sci. Se trata de un transformer decoder-only de 1.714.377.728 parámetros (aproximadamente 1,7 mil millones) entrenado con Llama Factory sobre un dataset de razonamiento de alto nivel generado a partir de gpt-oss-120b, denominado Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf. El identificador del repositorio indica que parte de una base preentrenada con 300 mil millones de tokens (300BT) sobre el corpus MixtureVitae v1 decontaminado, con una longitud de contexto de 16.000 tokens, y que ha sido posteriormente ajustado sobre datos Tulu3 decontaminados y sr30k.

La relevancia de este checkpoint reside en su carácter experimental dentro de la línea de investigación de open-sci sobre modelos pequeños entrenados sobre datos cuidadosamente decontaminados, con el objetivo de medir el efecto real del ajuste SFT en razonamiento sin contaminación de benchmarks. Al ser un modelo de 1,7B, es susceptible de ejecutarse en hardware de consumo y de servir como base para experimentación académica sobre recetas de entrenamiento y calidad de datos.

No obstante, la model card es un artefacto autogenerado por el Trainer de Hugging Face y no documenta usos previstos, limitaciones ni evaluación. El pipeline declarado es `feature-extraction`, lo que sugiere que el autor lo publica principalmente como extractor de representaciones o como checkpoint intermedio, más que como modelo de chat listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia MixtureVitae; detalles no disponibles) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 16.000 tokens (segun el identificador del repositorio; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos especificados en la model card) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,4 GB |
| Libreria | transformers (con `custom_code`) |
| Pipeline declarado | feature-extraction |
| Fecha de publicacion | 2026-10-30 |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion disponible. El nombre del repositorio indica que el modelo base es un MixtureVitae de 1,7B preentrenado sobre 300 mil millones de tokens con un corpus decontaminado (MixtureVitae-300BT-v1-decontaminated) y contexto de 16k. Sobre esa base se aplica un ajuste fino supervisado completo (tag `full`, no LoRA) usando Llama Factory, con un dataset de razonamiento destilado de gpt-oss-120b (Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf), complementado segun el identificador con datos Tulu3 decontaminados y sr30k.

Los hiperparametros documentados en la model card son: learning rate 4e-5, batch total de 128 (batch por dispositivo 1, 32 dispositivos, acumulacion de gradiente 4), 5 epocas, scheduler coseno con warmup del 10 %, optimizador AdamW fused (beta1 0.9, beta2 0.999, epsilon 1e-8) y semilla 42. El entrenamiento se ejecuto en un entorno multi-GPU (32 dispositivos) con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documentan fases de RLHF, DPO ni innovaciones arquitectonicas adicionales como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva basica, derivada de un transformer decoder-only de 1,7B parametros.
- Razonamiento de tipo cadena de pensamiento, presumiblemente inducido por el dataset SFT de razonamiento destilado de gpt-oss-120b (no verificado con evaluaciones).
- Extraccion de caracteristicas y representaciones (pipeline declarado `feature-extraction`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el dataset de entrenamiento sugiere cierta orientacion a razonamiento, pero no hay evidencia publicada.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Experimentacion academica sobre recetas SFT: el checkpoint permite reproducir y comparar el efecto del ajuste supervisado con datos destilados de un modelo grande sobre una base pequena decontaminada, usando los hiperparametros documentados.
- Extraccion de embeddings y representaciones: al declararse con pipeline `feature-extraction`, puede emplearse para obtener hidden states de un modelo de 1,7B en tareas de clasificacion, clustering o recuperacion, siempre que se valide su calidad.
- Base para ajuste adicional (continued pretraining o DPO): su tamano de 1,7B y sus pesos en safetensors facilitan iterar sobre el con un unico nodo multi-GPU, como evidencia el entrenamiento original con 32 dispositivos.
- Estudio de contaminacion de datos: al proceder de un corpus explicitamente decontaminado, sirve como referencia para medir cuanto del rendimiento en benchmarks se debe a fuga de datos frente a capacidad real.
- Prototipado de asistentes de razonamiento de bajo coste: en entornos con restricciones de VRAM, un modelo de 1,7B permite desplegar pipelines de generacion de cadenas de razonamiento en una sola GPU de consumo, aceptando la perdida de calidad frente a modelos mayores.
- Evaluacion de robustez y sesgos en modelos pequenos: util como sujeto de pruebas en estudios comparativos sobre alucinacion y sesgo en la franja de 1-2B parametros.

## Benchmarks y rendimiento

La model-index del autor declara una unica entrada (`sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__1-7b-MixtureVitae-30__sdpa-open-sci-st`) con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,8-2 GB para pesos; en 4 bits, alrededor de 1 GB, aunque no se publican pesos GGUF oficiales y habria que generarlos.
- GPU recomendadas para servicio: A100, H100 o L40S para throughput alto; RTX 4090 o A6000 para desarrollo y despliegues pequenos.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) en BF16 o cuantizado.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el repositorio incluye `custom_code`); vLLM, TGI o llama.cpp/Ollama requeririan conversion previa y validacion, no documentadas por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-...-sr30k | 1,71B | 16k (segun identificador) | other | Hugging Face (16 descargas) | SFT sobre base decontaminada; sin benchmarks publicados |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado | Modelo generalista con evaluaciones publicas y soporte en vLLM/Ollama |
| Llama 3.2-1B | 1,24B | 131.072 tokens | Llama 3.2 Community License | Hugging Face, ecosistema amplio | Contexto largo y tool calling documentado |
| SmolLM2-1.7B | 1,71B | 8.192 tokens | Apache 2.0 | Hugging Face | Entrenado sobre datos abiertos, con benchmarks publicados |

La comparacion es estructural: los tres modelos alternativos cuentan con evaluaciones publicas y licencias claras, mientras que este checkpoint carece de ambas. No hay datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card no reporta benchmarks, evaluaciones cualitativas ni pruebas de regresion; el rendimiento real es desconocido.
- Licencia `other` sin terminos explicitos: no se especifican condiciones de uso comercial, redistribucion ni atribucion; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Model card autogenerada: secciones de usos previstos, limitaciones y datos de entrenamiento marcadas como "More information needed".
- Riesgo de alucinacion: inherente a un modelo de 1,7B entrenado sobre datos sinteticos de razonamiento; sin evaluacion no puede acotarse.
- Sesgos: no documentados; el dataset Tulu3 y las salidas de gpt-oss-120b pueden arrastrar sesgos de sus fuentes originales.
- Idiomas: no se declara cobertura linguistica; el uso en castellano no esta validado.
- Contexto de 16k: inferior al de alternativas contemporaneas (32k-128k), lo que limita tareas de contexto largo.
- Dependencia de `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor y anade superficie de riesgo en entornos no controlados.
- Adopcion muy baja (16 descargas, 0 likes): no hay comunidad que haya validado el checkpoint ni reportado incidencias.
- Fecha de publicacion futura en los metadatos (2026-10-30): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-SFT-Tulu3-decontaminated-sr30k
- Perfil del autor: https://huggingface.co/open-sci
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset Tulu3: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset gpt-oss-120b: https://huggingface.co/openai/gpt-oss-120b
