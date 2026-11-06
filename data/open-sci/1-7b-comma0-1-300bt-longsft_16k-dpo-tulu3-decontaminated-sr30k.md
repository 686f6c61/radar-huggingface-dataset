# open-sci/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated-sr30k

## Resumen

El modelo `open-sci/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated-sr30k` es un ajuste fino (SFT) de un modelo base de 1,7 mil millones de parametros, `ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated`. Lo publica el usuario `open-sci` en Hugging Face y se ha entrenado con el framework LLaMA-Factory sobre un dataset de razonamiento sintetico, `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf`, generado presumiblemente a partir de un modelo mayor (gpt-oss-120b). El resultado es un checkpoint de tipo "full fine-tuning" que hereda la cadena de entrenamiento del modelo base: un preentrenamiento de 300 mil millones de tokens seguido de SFT de contexto largo, DPO y filtrado de contaminacion estilo Tulu 3.

Se trata de un modelo pequeno (1,71 mil millones de parametros) pensado para tareas de generacion de texto y razonamiento, con un pipeline declarado de `feature-extraction` en Hugging Face, aunque su entrenamiento es claramente de tipo instruccion/SFT. La relevancia actual reside en su tamano reducido, que lo hace desplegable en hardware de consumo, y en su cadena de entrenamiento cuidadosa (DPO, contexto largo, decontaminacion), poco habitual en modelos de esta escala.

La informacion publicada es escasa: la model card esta generada automaticamente por el Trainer de LLaMA-Factory y no incluye descripcion, usos previstos, idiomas ni resultados de evaluacion. Esta ficha refleja unicamente los datos disponibles y marca explicitamente lo que no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de la familia del modelo base "Comma0.1"; detalles no disponibles) |
| Parametros totales | 1.714.377.728 (1,71 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (el nombre del modelo base sugiere entrenamiento con contexto largo de 16k, sin confirmacion oficial) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (no se especifican terminos) |
| Formato de pesos | safetensors (libreria transformers, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA) de un transformer decoder-only de 1,71 B de parametros. La model card no detalla la arquitectura interna (numero de capas, dimension oculta, atencion, etc.) ni la tokenizer; solo indica que requiere `trust_remote_code` por el tag `custom_code`. El entrenamiento se realizo con LLaMA-Factory sobre el dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf`, que por su nombre contiene aproximadamente 30.000 muestras de razonamiento en formato ShareGPT, generadas a partir del modelo gpt-oss-120b.

Los hiperparametros publicados son: learning rate 4e-5, batch total 128 (batch 1 por dispositivo, 32 dispositivos, acumulacion de gradiente 4), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 10 %. El modelo base ya incorpora en su nombre las etapas previas: preentrenamiento de 300 mil millones de tokens, SFT de contexto largo (16k), DPO y filtrado de contaminacion estilo Tulu 3. No se documenta el uso de RLHF adicional ni innovaciones tecnicas propias en esta etapa de SFT.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional (heredada del modelo base instruido).
- Razonamiento de tipo "chain-of-thought" o respuesta razonada, inducido por el dataset de SFT de razonamiento.
- Capacidad de seguir instrucciones en formato ShareGPT (system/user/assistant).
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el dataset de razonamiento sugiere cierta capacidad, sin garantias.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con 1,71 B de parametros el modelo cabe en GPUs de consumo (por ejemplo, una RTX 3060 de 12 GB en fp16), lo que permite iterar sobre prompts y flujos de dialogo sin coste de API.
- Generacion de razonamiento sintetico para destilacion: al estar entrenado sobre un dataset de razonamiento generado por un modelo mayor, puede usarse para producir cadenas de razonamiento en lote y filtrar las de mayor calidad para entrenar modelos aun mas pequenos.
- Experimentacion academica en ajuste fino: su tamano reducido y su cadena documentada (preentrenamiento, SFT, DPO) lo convierten en un punto de partida barato para estudiar efectos de nuevos datasets de SFT o de DPO.
- Tareas de extraccion y clasificacion de texto: aunque el pipeline declarado es `feature-extraction`, el modelo puede emplearse para tareas de NLP supervisadas tras un ajuste ligero, o como generador de etiquetas y resumenes cortos.
- Evaluacion de robustez y sesgos en modelos pequenos: sirve como sujeto de pruebas para medir alucinacion y sesgo en modelos de menos de 2 B entrenados con datos sinteticos.
- Despliegue en entornos con recursos limitados: al no requerir GPU de datacenter, puede integrarse en servicios edge o en pipelines de CI para pruebas de regresion de calidad de generacion.

## Benchmarks y rendimiento

La model card declara un `model-index` con una unica entrada (`sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__1-7b-Comma0-28152b6d__sdpa-op-e131dfa2`) cuyo campo `results` esta vacio. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,8-2,5 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); para cuantizacion 4 bits bastan GPUs de 6-8 GB.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas en fp16, y en GPUs de 6 GB con cuantizacion.
- Opciones de despliegue: transformers (requiere `trust_remote_code`), vLLM y TGI si el `custom_code` es compatible (no verificado); llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/1.7b-Comma0.1-...-sr30k | 1,71 B | no disponible | other | Hugging Face (14 descargas) |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | Hugging Face, ecosistema amplio |
| Llama-3.2-1B-Instruct | 1,24 B | 131.072 tokens | Llama 3.2 Community License | Hugging Face, ampliamente adoptado |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados de este modelo. Frente a las alternativas, la principal desventaja es la falta de documentacion, evaluacion y licencia clara; la ventaja potencial es su entrenamiento especifico en razonamiento y su cadena DPO, que habria que validar empiricamente.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre datos sinteticos generados por otro modelo, puede heredar sesgos de ese generador.
- Riesgo de alucinacion: alto en modelos de este tamano, especialmente en tareas de conocimiento factual; no hay evaluaciones que lo cuantifiquen.
- Limitaciones de contexto e idioma: no se declara la longitud de contexto efectiva ni los idiomas soportados; el nombre del modelo base sugiere 16k, pero no esta confirmado para este checkpoint.
- Licencia: marcada como `other` sin terminos publicados; no se puede garantizar el uso comercial. Es imprescindible contactar con el autor o revisar el modelo base antes de un despliegue en produccion.
- Model card incompleta: generada automaticamente, sin descripcion, usos previstos ni evaluacion; no debe tratarse como documentacion fiable.
- Requiere `trust_remote_code`: implica ejecutar codigo del autor, con el riesgo de seguridad asociado.
- Procedencia de datos: el dataset de SFT no esta descrito en detalle (composicion, filtros, licencias de las muestras), lo que dificulta auditar la calidad y los derechos de uso.
- Madurez: 14 descargas y 0 likes en el momento de la consulta; sin comunidad ni mantenimiento conocido.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated
- Dataset de SFT: `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf` (referenciado en la model card; no se proporciona URL publica)
- Framework de entrenamiento: LLaMA-Factory (https://github.com/hiyouga/LLaMA-Factory)
