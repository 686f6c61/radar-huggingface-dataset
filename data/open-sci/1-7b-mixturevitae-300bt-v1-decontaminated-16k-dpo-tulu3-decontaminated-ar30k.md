# open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated-ar30k

## Resumen

El modelo `open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated-ar30k` es un ajuste fino supervisado (SFT) de la familia MixtureVitae, un conjunto de modelos de ~1,7 mil millones de parametros entrenados sobre 300 mil millones de tokens con un pipeline de decontaminacion de datos. Lo desarrolla el colectivo open-sci (el identificador apunta a una organizacion de investigacion abierta) y parte del checkpoint base `ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated`, que a su vez combina preentrenamiento, DPO y ajuste con datos de Tulu 3.

Este ajuste concreto se ha entrenado sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, un conjunto de 30 000 muestras orientado a razonamiento (AceReason), con un contexto de entrenamiento de 16 000 tokens segun se deduce del nombre del checkpoint base. La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeno (1,7B) que cabe en hardware de consumo y puede servir como base para experimentacion en razonamiento y agentes; por otro, su nombre y trazabilidad reflejan una practica creciente de versionado exhaustivo de pipelines de datos (decontaminacion, DPO, SFT) que conviene entender para reproducir resultados.

No obstante, la model card es practicamente un esqueleto autogenerado: no incluye descripcion, datos de evaluacion ni resultados de benchmarks. Por tanto, esta ficha se limita a lo que puede verificarse a partir de los metadatos del repositorio y del nombre y procedencia del checkpoint, marcando como "no disponible" todo lo que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferida del pipeline `feature-extraction` y del ecosistema transformers/llama-factory; no confirmada en la model card) |
| Parametros totales | 1.714.377.728 (~1,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 16 000 tokens (indicado en el nombre del checkpoint base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni AWQ/GPTQ en el repo) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no estandar; requiere consultar los terminos del autor) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,4 GB |
| Libreria | transformers 4.57.3 |
| Pipeline declarado | feature-extraction |
| Modelo base | ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated |
| Dataset de ajuste | AceReason-1.1-SFT-30k-sharegpt-hf |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna mas alla de que se trata de un modelo compatible con `transformers` y con `custom_code`, lo que sugiere que requiere codigo personalizado para cargarse (probablemente por variaciones en la implementacion de atencion o en el tokenizador respecto a Llama estandar). El nombre del checkpoint base indica un preentrenamiento sobre 300 mil millones de tokens ("300BT") con un pipeline de decontaminacion ("decontaminated"), seguido de una fase de DPO y de un ajuste con datos de Tulu 3. El presente checkpoint anade una fase de SFT sobre AceReason-1.1-SFT-30k.

Los hiperparametros de entrenamiento documentados son: learning rate 4e-5, batch total de 128 (batch 1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 10 %, semilla 42 y entrenamiento multi-GPU. El framework empleado es Transformers 4.57.3 sobre PyTorch 2.10.0+cu128, con Datasets 4.8.4 y Tokenizers 0.22.2. No se especifica el numero total de tokens de entrenamiento ni la composicion del dataset AceReason mas alla de su nombre y tamano (30 000 muestras en formato ShareGPT).

## Capacidades

- Generacion de texto autoregresiva: el pipeline declarado es `feature-extraction`, pero el ajuste SFT sobre datos ShareGPT y el origen en Tulu 3 apuntan a un uso como modelo generativo de instrucciones.
- Razonamiento: el dataset de ajuste (AceReason) esta orientado a tareas de razonamiento, aunque no se publican evaluaciones que lo confirmen.
- Conversacion multi-turno: el formato ShareGPT del dataset de SFT es el habitual para entrenar dialogos multi-turno.
- Capacidades de codigo y matematicas: no disponible (no se documentan).
- Tool calling / function calling: no disponible (no se documenta soporte explicito).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Experimentacion academica con modelos pequenos: el modelo cabe en una unica GPU de consumo en cuantizacion de 4 bits y permite estudiar el efecto del pipeline de decontaminacion y DPO sobre un transformer de 1,7B sin necesidad de infraestructura grande.
- Base para ajuste fino adicional: al ser un checkpoint SFT sobre instrucciones, puede servir como punto de partida para tareas especificas (clasificacion, extraccion de informacion, resumen) con LoRA o ajuste completo en una sola maquina.
- Generacion de texto en local para prototipos: con 1,7B de parametros y pesos safetensors de 3,4 GB, es viable ejecutarlo en portatiles con GPU de 8-16 GB usando llama.cpp u Ollama tras convertir los pesos a GGUF.
- Evaluacion de pipelines de datos: util para reproducir y comparar el efecto de la decontaminacion y del ajuste con Tulu 3 frente a otros checkpoints de la misma familia MixtureVitae.
- Educacion y divulgacion: su tamano permite demostrar en un aula el ciclo completo preentrenamiento, DPO y SFT sin recurrir a modelos de decenas de miles de millones de parametros.
- Investigacion sobre razonamiento en modelos pequenos: el ajuste sobre AceReason permite estudiar si un modelo de 1,7B puede adquirir habilidades de razonamiento con SFT, comparandolo con su checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La entrada `model-index` de la model card declara el nombre del modelo pero con la lista `results` vacia, por lo que no existen metricas oficiales (MMLU, HumanEval, GSM8K u otras) que puedan citarse.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4-4 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, unos 6-8 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: ~1,8-2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: ~1-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4). Para cuantizacion de 4 bits basta con 4-6 GB (GTX 1660 Super, RTX 3050).
- Cabe en GPU de consumo: si, en la mayoria de GPU modernas con 8 GB o mas; en cuantizacion de 4 bits incluso en GPUs de 6 GB.
- Opciones de despliegue: `transformers` (requiere `trust_remote_code=True` por el tag `custom_code`), vLLM y TGI si la arquitectura es compatible con Llama, llama.cpp/Ollama tras conversion a GGUF (no se publican pesos GGUF oficiales).
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-...-ar30k | 1,7B | 16k (segun nombre del base) | other | Hugging Face, 16 descargas |
| ali-elganzory/1.7b-MixtureVitae-300BT-v1-... (base) | 1,7B | 16k | other | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama-3.2-1B-Instruct | 1,2B | 128k | Llama 3.2 Community License | Hugging Face, ampliamente usado |

La comparativa de rendimiento no puede establecerse porque el modelo no publica benchmarks. Frente a Qwen2.5-1.5B y Llama-3.2-1B, el checkpoint de open-sci ofrece un contexto menor (16k frente a 32k y 128k respectivamente) y una licencia no estandar ("other"), lo que limita su adopcion comercial frente a alternativas con licencias permisivas y evaluaciones publicas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni datos de contaminacion del conjunto de test, lo que impide estimar su calidad real.
- Model card incompleta: la propia model card indica "More information needed" en descripcion, usos previstos y datos de entrenamiento.
- Licencia "other": no es una licencia estandar (Apache 2.0, MIT, Llama); es imprescindible revisar los terminos del autor antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin evaluacion especifica no puede acotarse.
- Sesgos: no documentados; el preentrenamiento sobre 300B tokens sin publicacion de la composicion del dataset impide evaluar sesgos de genero, idioma o cultura.
- Idiomas: no declarados; no debe asumirse soporte multilingue mas alla del ingles sin verificacion.
- Contexto: 16k tokens segun el nombre del checkpoint base, pero no confirmado en la model card; podria variar.
- Codigo personalizado: el tag `custom_code` obliga a usar `trust_remote_code=True`, lo que implica ejecutar codigo del autor y anade riesgo de seguridad en produccion.
- Madurez: 16 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni mantenimiento activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated-ar30k
- Modelo base: https://huggingface.co/ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated
- Organizacion open-sci en Hugging Face: https://huggingface.co/open-sci
- Dataset AceReason-1.1-SFT-30k-sharegpt-hf: no disponible como enlace publico en la informacion proporcionada
- Paper o blog del modelo: no disponible
- Repositorio de codigo: no disponible
