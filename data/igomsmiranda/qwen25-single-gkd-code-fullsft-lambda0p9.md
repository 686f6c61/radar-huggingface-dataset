# igomsmiranda/qwen25-single-gkd-code-fullsft-lambda0p9

## Resumen

`igomsmiranda/qwen25-single-gkd-code-fullsft-lambda0p9` es un modelo de lenguaje de 1.543.714.304 parámetros (1,54 B) publicado en HuggingFace por el usuario igomsmiranda. Se trata de un "student" obtenido mediante destilación on-policy con el método GKD (*Generalized Knowledge Distillation*) implementado en TRL, a partir de un "teacher" que el autor no identifica en la model card (el campo aparece literalmente como `None`). Por el recuento de parámetros y el tag `qwen2`, la arquitectura subyacente corresponde a la familia Qwen2.5, concretamente a un modelo denso de 1,5 B.

El interés del artefacto es fundamentalmente metodológico: no es un modelolisto para producción, sino un checkpoint de investigación que documenta un experimento de destilación (sufijo `lambda0p9`, que corresponde al parámetro de interpolación λ de GKD) sobre datos de código, con precisión bf16, secuencias de 256 tokens y evaluación cada 250 pasos (`bf16_256tok_eval250`). El repositorio ocupa 3,1 GB y no registra descargas ni "likes" en el momento de la consulta.

Su relevancia ahora es limitada fuera del ámbito experimental: sirve como referencia para reproducir o comparar recetas de destilación on-policy con TRL, pero carece de licencia declarada, de idiomas declarados, de resultados de benchmarks y de una model card completa (el fragmento de `pipeline` de ejemplo apunta a `model="None"`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (tag `qwen2`); por el recuento de parametros corresponde a Qwen2.5-1.5B |
| Parametros totales | 1.543.714.304 (1,54 B), dato real de los safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no declarada en la model card; la arquitectura Qwen2.5 soporta 32.768 tokens nativos, pero el entrenamiento se realizo con secuencias de 256 tokens (`256tok`) |
| Tipos de cuantizacion | pesos en bfloat16 (safetensors); no se publican GGUF, AWQ ni GPTQ; convertible a 8 y 4 bits con herramientas estandar |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo aparece como `licence: license`, sin contenido) |
| Formato de pesos | safetensors (repositorio de 3,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Qwen2.5, con 1,54 B de parametros y atención causal estándar; no hay innovaciones de arquitectura propias en este checkpoint, ya que el trabajo del autor se centra en el procedimiento de entrenamiento, no en el modelo base. El tag `qwen2` y el recuento exacto de parámetros (idéntico al de Qwen2.5-1.5B) son los únicos indicios disponibles, dado que la model card declara el modelo base como `None`.

El entrenamiento sigue GKD (*On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes*, Agarwal et al., ICLR 2024), implementado con TRL 1.0.0.dev0 sobre Transformers 5.9.0, PyTorch 2.6.0+cu124, Datasets 4.8.5 y Tokenizers 0.22.2. GKD combina datos de un "teacher" con muestras generadas por el propio "student" y usa una divergencia generalizada interpolada mediante λ; el sufijo `lambda0p9` indica λ = 0,9. El nombre del checkpoint (`single_gkd`, `code_fullsft`, `bf16_256tok_eval250`) sugiere una única ronda de destilación sobre un student previamente sometido a SFT completo con datos de código, en bf16, con longitud máxima de 256 tokens y evaluaciones cada 250 pasos. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO posteriores. El autor enlaza la ejecución de Weights & Biases `mopd-qwen25-fullsft-single-gkd/runs/944gqj75`, que es la única fuente potencial de métricas de entrenamiento.

## Capacidades

- Generacion de texto conversacional: la model card incluye el tag `conversational` y el ejemplo de uso pasa una lista de mensajes con rol `user`, por lo que el tokenizador de chat de Qwen2.5 esta operativo.
- Generacion y asistencia sobre codigo: el identificador del checkpoint incluye `code`, lo que indica que el SFT y la destilacion se hicieron sobre datos de programacion; no hay evaluacion publicada que lo cuantifique.
- Razonamiento de un solo turno con contexto corto: el entrenamiento con 256 tokens limita la ventana efectiva a la que el modelo esta adaptado.
- Compatibilidad con Text Generation Inference y endpoints: tags `text-generation-inference` y `endpoints_compatible`.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes, multi-step reasoning ni modo "thinking".
- No hay capacidades multimodales (vision o audio) ni audio.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- No se declara decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Casos de uso

- Reproduccion de experimentos de destilacion on-policy: sirve como student de referencia para comparar recetas GKD con distintos valores de λ frente a la destilacion supervisada clasica, usando el enlace de W&B del autor como linea base.
- Baseline academico en estudios de compresion: con 1,54 B de parametros permite medir la perdida de calidad frente al teacher (no identificado publicamente) en tareas de codigo.
- Prototipado local de asistente de programacion: al ocupar unos 3,1 GB en bf16, se puede cargar en una GPU de consumo y usar con `transformers` para autocompletado o generacion de fragmentos cortos de codigo en un entorno de desarrollo personal.
- Generacion de docstrings y comentarios: tareas de salida corta (menos de 256 tokens) donde la ventana de entrenamiento no penaliza el rendimiento y el dominio de codigo es relevante.
- Etiquetado y clasificacion de fragmentos de codigo en pipelines de datos: con prompts de respuesta corta, util para preprocesar corpus antes de entrenar modelos mayores.
- Pruebas de integracion de TGI: gracias a los tags `text-generation-inference` y `endpoints_compatible`, sirve para validar despliegues de extremo a extremo con un modelo pequeno antes de pasar a uno mayor.
- Docencia y divulgacion: ejemplo minimo y trazable de como TRL materializa un pipeline de destilacion con formato conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion, y el autor no aporta comparaciones numericas con el teacher ni con el student previo.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 3,1 GB solo para pesos; con cache KV y overhead de runtime, entre 4 y 6 GB para secuencias de 256 a 2.048 tokens.
- VRAM estimada en 8 bits: en torno a 1,6-2 GB de pesos; en 4 bits (GGUF Q4_K_M), aproximadamente 0,9-1,1 GB.
- GPU recomendadas: A10G, L4, L40S o A100 para despliegue con vLLM o TGI; RTX 4090 o RTX 3090 para desarrollo con margen de contexto.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070 y superiores; en 4 bits cabe incluso en GPUs de 4-6 GB.
- Opciones de despliegue: `transformers` (ruta nativa, con `pipeline`), Text Generation Inference (soportado por los tags), vLLM, y llama.cpp/Ollama tras convertir los pesos a GGUF, conversion que el autor no publica.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (qwen25-single-gkd-code-fullsft-lambda0p9) | 1,54 B | 256 tokens en entrenamiento; 32.768 en arquitectura | no disponible | 0 descargas, 0 likes | Destilacion GKD experimental, sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | Ampliamente adoptado | Referencia directa de arquitectura; metricas publicas y soporte de tool calling |
| Qwen2.5-Coder-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache-2.0 | Ampliamente adoptado | Alternativa especializada en codigo con evaluacion publica (HumanEval, MBPP) |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache-2.0 | Muy descargado | Rival de mismo orden de magnitud, con model card completa y benchmarks |

Los datos de las filas comparativas provienen de las model cards publicas de cada modelo; los de este checkpoint, de su propia model card. No existe una comparacion de rendimiento directa porque este modelo no publica metricas.

## Limitaciones y advertencias

- Licencia no disponible: el campo aparece como `licence: license` sin texto, por lo que no hay autorizacion explicita de uso comercial. Tratarlo como no apto para produccion hasta que el autor lo aclare.
- Model card incompleta: el modelo base figura como `None`, el snippet de `pipeline` apunta a `model="None"` y no se declara ni un solo idioma.
- Sin evaluacion: cero benchmarks, cero descargas y cero likes; no hay evidencia publica de calidad ni de que la destilacion haya funcionado segun lo previsto.
- Ventana de entrenamiento de 256 tokens: es probable que el rendimiento degrade en prompts o generaciones mas largas, a pesar de que la arquitectura soporte contextos mucho mayores.
- Teacher no identificado: al no revelarse el modelo profesor, no se puede auditar la procedencia de los datos ni los sesgos heredados.
- Riesgo de alucinacion: inherente a un modelo de 1,54 B sin alineamiento posterior documentado (no consta RLHF ni DPO); no debe usarse como fuente de verdad en codigo de produccion sin verificacion.
- Posible contaminacion del dataset de codigo: no se documenta la composicion ni la fecha de corte de los datos de SFT y destilacion.
- Sesgos: no disponibles; no se han realizado evaluaciones de sesgo ni de toxicidad.
- Fecha de creacion futura en los metadatos (2026-10-28) y versiones de framework no liberadas (TRL 1.0.0.dev0, Transformers 5.9.0): puede requerir instalaciones concretas para cargar correctamente.
- No soporta tool calling ni agentes de forma documentada; no disenado para flujos multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/igomsmiranda/qwen25-single-gkd-code-fullsft-lambda0p9
- Paper de GKD (arXiv:2306.13649): https://huggingface.co/papers/2306.13649
- Version OpenReview de GKD (ICLR 2024): https://openreview.net/forum?id=3zKtaqxLhW
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/diogomsmirandaa-team/mopd-qwen25-fullsft-single-gkd/runs/944gqj75
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las busquedas devolvieron unicamente contenido no relacionado con el modelo ni con IA.
