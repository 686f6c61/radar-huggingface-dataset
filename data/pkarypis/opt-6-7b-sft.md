# pkarypis/opt-6.7b-sft

## Resumen

opt-6.7b-sft es un ajuste fino supervisado (SFT) del modelo facebook/opt-6.7b, publicado por el usuario pkarypis en HuggingFace. El modelo conserva la arquitectura del OPT-6.7B original (transformer decoder-only denso, 6.658.473.984 parametros) y ha sido reentrenado con la libreria TRL sobre un dataset denominado "generator", del que no se documenta la composicion ni el volumen de tokens. La model card esta generada de forma automatica por el Trainer y no aporta descripcion de uso previsto, idiomas ni limitaciones.

El unico resultado declarado por el autor es la perdida de validacion (1,2324 tras una epoca), con una perdida de entrenamiento de 1,8817. No se publican benchmarks (el campo model-index del repositorio esta vacio), ni variantes cuantizadas, ni datos de evaluacion cualitativa. La relevancia practica del modelo es limitada: acumula 21 descargas y 0 "likes" desde su creacion en enero de 2024, y la licencia figura como "other" sin terminos explicitos.

Se trata, por tanto, de un experimento de ajuste conversacional sobre OPT-6.7B, util como referencia de reproducibilidad de un pipeline SFT con TRL en 32 dispositivos, pero sin garantias documentadas de calidad, sesgos o comportamiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de facebook/opt-6.7b) |
| Parametros totales | 6.658.473.984 (6,66 B, dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (heredada de OPT-6.7B; no se indica cambio en el ajuste) |
| Tipos de cuantizacion | No se publican variantes cuantizadas; los pesos son cuantizables a posteriori con bitsandbytes (int8/4-bit), GPTQ o AWQ |
| Idiomas soportados | No disponible en la model card (OPT se entreno principalmente en ingles) |
| Licencia | other (sin terminos explicitos; el modelo base OPT de Meta usa una licencia propia con restricciones de uso comercial) |
| Formato de pesos | safetensors (repositorio de 26,6 GB; el tamano es coherente con pesos en fp32, 6,66e9 x 4 bytes) |

Datos adicionales de publicacion: biblioteca transformers, pipeline text-generation, tags `trl`, `sft`, `generated_from_trainer`, `conversational`, `dataset:generator`, `text-generation-inference`, `endpoints_compatible`. Creado el 2024-01-04, actualizado el 2026-09-18.

## Arquitectura y entrenamiento

La arquitectura es la del OPT-6.7B original: un transformer decoder-only con atencion causal, embeddings posicionales aprendidos (no RoPE) y activacion ReLU, preentrenado por Meta sobre aproximadamente 180.000 millones de tokens. El ajuste realizado aqui no modifica la arquitectura: es un fine-tuning completo (no se menciona LoRA ni adaptadores) de una sola epoca sobre el dataset "generator".

Los hiperparametros documentados son: learning rate 2e-05, scheduler coseno, optimizador Adam (betas 0,9/0,999, epsilon 1e-08), precision mixta con AMP nativo, semilla 42, batch por dispositivo 16 y batch total efectivo 512 en configuracion multi-GPU con 32 dispositivos. Se ejecuto un unico epoch de 253 pasos, con perdida de entrenamiento 1,8817 y perdida de validacion 1,2324. El framework utilizado fue Transformers 4.36.2, PyTorch 2.0.1+cu117, Datasets 2.14.5 y Tokenizers 0.15.0. No se documenta si hubo RLHF, DPO, filtrado de datos o cualquier tecnica adicional de alineamiento, ni innovaciones de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva en el pipeline text-generation de transformers.
- Orientacion conversacional: el repositorio incluye el tag `conversational`, coherente con un ajuste SFT sobre datos de dialogo, aunque no se documenta el formato exacto de prompt/plantilla.
- Fine-tuning supervisado: el modelo es el resultado de un SFT con TRL, por lo que se espera que reproduzca el estilo del dataset "generator".
- Soporte de tool calling / function calling: no documentado ni declarado por el autor.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el modelo base OPT esta entrenado mayoritariamente en ingles.
- Capacidades especiales (modo thinking, vision, audio, contexto largo): ninguna disponible.
- Compatibilidad de despliegue: tags `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad declarada con TGI.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el tag `conversational` y el ajuste SFT permiten probar dialogos multi-turno basicos, siempre con la limitacion de una ventana de 2048 tokens.
- Reproduccion de pipelines de SFT con TRL: sirve como ejemplo documentado de un entrenamiento supervisado en 32 dispositivos con batch efectivo de 512, util para validar configuraciones de distributed training.
- Punto de partida para ajustes posteriores: al ser un fine-tune completo en fp32, puede usarse como inicializacion para DPO, RLHF o nuevos SFT con datos propios.
- Generacion de texto en lote fuera de linea: tareas de resumen, reescritura o continuacion de texto donde la latencia no es critica y el contexto cabe en 2048 tokens.
- Investigacion academica sobre evaluacion de ajustes SFT: permite comparar el efecto del SFT frente al OPT-6.7B base con la misma arquitectura y tokenizador.
- Despliegue interno de bajo coste: cuantizado a 4 bits cabe en una GPU de consumo (RTX 3060 12 GB), lo que habilita entornos de test sin infraestructura dedicada.
- Generacion de datos sinteticos de texto: util como generador auxiliar en pipelines de destilacion o aumento de datos, con revision humana obligatoria por riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible: el campo model-index del repositorio esta vacio y la model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni similares. Los unicos numeros declarados son metricas de entrenamiento.

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento (epoca 1,0) | 1,8817 |
| Perdida de validacion | 1,2324 |
| Pasos de entrenamiento | 253 |
| Epocas | 1,0 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 27 GB solo para pesos, mas cache KV y activaciones; en la practica requiere 30-35 GB.
- VRAM estimada en fp16/bf16: aproximadamente 13,3 GB para pesos; con cache KV, entre 16 y 20 GB segun longitud de secuencia y batch.
- VRAM estimada en int8: aproximadamente 7 GB para pesos; alrededor de 10-12 GB en uso real.
- VRAM estimada en 4 bits: aproximadamente 4 GB para pesos; viable en GPUs de 8-12 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp32 y fp16 con lotes grandes; RTX 4090 o RTX 3090 (24 GB) para fp16; RTX 3060 12 GB o T4 16 GB con cuantizacion int8 o 4 bits.
- Cabe en GPU de consumo: si, en fp16 en RTX 3090/4090 y en int8/4 bits en RTX 3060 12 GB; el ajuste en fp32 no cabe en ninguna GPU de consumo habitual.
- Opciones de despliegue: transformers (formato nativo safetensors), Text Generation Inference (los tags `text-generation-inference` y `endpoints_compatible` lo declaran compatible), vLLM e inferencia con bitsandbytes. Para llama.cpp u Ollama seria necesaria una conversion propia a GGUF, ya que el autor no publica ninguna.
- Latencia y throughput: no disponible. No hay mediciones publicadas y el modelo no dispone de variantes optimizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| pkarypis/opt-6.7b-sft | 6,66 B | 2048 tokens (heredado) | other (sin terminos explicitos) | HuggingFace, 21 descargas | No |
| facebook/opt-6.7b | 6,66 B | 2048 tokens | other (licencia OPT de Meta, con restricciones) | HuggingFace, ampliamente usado | Si, en la model card original |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 tokens | Llama 2 Community License | HuggingFace, muy extendido | Si, en el paper de Llama 2 |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,24 B | 8192 tokens | Apache 2.0 | HuggingFace, muy extendido | Si, en la documentacion de Mistral |

Frente a las alternativas, opt-6.7b-sft queda por detras en ventana de contexto (2048 frente a 4096 y 8192), no aporta benchmarks publicados y su licencia "other" resulta ambigua para uso comercial, en contraste con las licencias explicitas de Llama 2 y, sobre todo, con la Apache 2.0 de Mistral. Su unica ventaja relativa es la compatibilidad arquitectonica directa con el ecosistema OPT.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el modelo base OPT se entreno con datos web sin filtrar, por lo que hereda sesgos de genero, raza y religion presentes en ese corpus.
- Riesgo de alucinacion: elevado y no cuantificado. No hay evaluacion de veracidad ni de tasas de alucinacion, y la model card no documenta ninguna mitigacion.
- Limitacion de contexto: 2048 tokens, la mitad o un cuarto que las alternativas actuales de 7B; insuficiente para documentos largos o dialogos extensos.
- Limitacion idiomatica: la model card no declara idiomas soportados; el modelo base esta centrado en ingles y no hay evidencia de buen rendimiento en castellano.
- Licencia: la ficha marca "other" sin detallar terminos. El modelo base facebook/opt-6.7b usa la licencia OPT de Meta, que restringe el uso comercial, por lo que un uso en produccion exigiria verificar la cadena de licencias.
- Trazabilidad: el dataset de ajuste se llama "generator" y no se describe su composicion, tamano ni procedencia, lo que impide auditar los datos de entrenamiento.
- Madurez: 21 descargas y 0 "likes" indican una adopcion practicamente nula; no hay evidencia de la comunidad sobre su calidad.
- Model card incompleta: los apartados "Model description", "Intended uses & limitations" y "Training and evaluation data" aparecen literalmente como "More information needed".
- Sin variantes optimizadas: no hay GGUF, GPTQ ni AWQ publicados, lo que anade trabajo de conversion para despliegues en llama.cpp u Ollama.
- Idoneidad para produccion: baja. Conviene tratar el modelo como un experimento reproducible de SFT, no como un componente listo para servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pkarypis/opt-6.7b-sft
- Modelo base: https://huggingface.co/facebook/opt-6.7b
- Paper de OPT ("OPT: Open Pre-trained Transformer Language Models"): https://arxiv.org/abs/2205.01068
- Repositorio de Meta con el codigo de entrenamiento de OPT (metaseq): https://github.com/facebookresearch/metaseq
- Documentacion de TRL, libreria usada para el ajuste: https://huggingface.co/docs/trl
- Nota sobre la busqueda web: los resultados devueltos corresponden a paginas de soporte de Microsoft (Hotmail, Windows 11 26H2, Exchange Server), sin relacion alguna con este modelo, por lo que no se han incorporado como fuentes.
