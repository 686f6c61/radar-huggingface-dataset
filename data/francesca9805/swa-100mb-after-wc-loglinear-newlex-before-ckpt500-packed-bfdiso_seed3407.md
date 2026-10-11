# francesca9805/swa-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407

## Resumen

`francesca9805/swa-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407` es un modelo de generacion de texto de 124.770.816 parametros publicado por el usuario francesca9805 (Universidad de Groninga, segun la URL del proyecto en Weights & Biases). Se trata de un ajuste fino (SFT) realizado con la libreria TRL sobre otro modelo del mismo autor, `francesca9805/ppt-wc-loglinear-newlex-swa-before-100mb-packed-bfdiso_seed3407`, que a su vez parece formar parte de una familia de experimentos de tokenizacion y de promediado de pesos (SWA, "stochastic weight averaging") sobre corpus empaquetados.

El modelo se apoya en la arquitectura GPT-2, segun las etiquetas declaradas en HuggingFace (`gpt2`), y se distribuye en formato `safetensors` bajo la libreria `transformers`. El nombre del repositorio codifica el experimento: tokenizador "newlex", corpus "packed", variante "loglinear" frente a "uniform", punto de control 500 y semilla 3407. Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion.

Su relevancia es limitada fuera del contexto academico: no publica model card descriptiva, no declara idiomas, no declara licencia efectiva y no aporta resultados de evaluacion. Resulta util como punto de reproducibilidad de un experimento comparativo de tecnicas de entrenamiento y como modelo de juguete para pruebas de infraestructura de inferencia, dado su tamano reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun etiqueta `gpt2` de HuggingFace) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor no la especifica; la arquitectura GPT-2 suele usar 1024 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (repo en `safetensors`; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license`, un marcador sin contenido) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7.7 GB |
| Modelo base | francesca9805/ppt-wc-loglinear-newlex-swa-before-100mb-packed-bfdiso_seed3407 |
| Libreria y versiones | transformers 4.56.2, TRL 0.23.0, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL |
| Pipeline declarado | text-generation |
| Descargas / likes | 56 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo GPT-2, con 124,77 millones de parametros. No se documenta ninguna innovacion estructural: no hay mezcla de expertos, ni atencion lineal, ni capas de estado recurrente (SSM), ni decodificacion especulativa. El interes del experimento reside en el preprocesamiento y la receta de entrenamiento, no en el diseno del modelo.

El entrenamiento se realizo mediante SFT con TRL 0.23.0 sobre un punto de control previo del propio autor. Los identificadores del nombre sugieren tres decisiones experimentales concretas: el uso de un tokenizador nuevo ("newlex"), el empaquetado de secuencias ("packed") para maximizar la ocupacion de la ventana de contexto, y la aplicacion de promediado de pesos estocastico (SWA) en dos variantes, "loglinear" y "uniform". El sufijo "before-ckpt500" indica que el ajuste se tomo antes del punto de control 500, y "bfdiso_seed3407" apunta a una configuracion concreta de precision (probablemente bfloat16) y una semilla fija. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion posteriores como RLHF o DPO. La model card solo enlaza el experimento de Weights & Biases del proyecto.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura GPT-2 y del ajuste SFT.
- Conversacion de un unico turno: el ejemplo de la model card pasa un mensaje con rol `user` a `pipeline("text-generation")`, sin historial previo.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, planificacion multi-paso ni uso de razonamiento explicito (thinking mode).
- No se declaran capacidades multilingues; los idiomas soportados figuran como no disponibles.
- No hay soporte de vision, audio ni multimodalidad.
- El contexto practico esta limitado por la ventana de GPT-2; no se confirma un valor ampliado.

## Casos de uso

- Reproduccion de experimentos de tokenizacion: el modelo sirve como referencia para comparar el impacto del tokenizador "newlex" frente a alternativas sobre el mismo corpus, dentro de la serie de repositorios del autor.
- Pruebas de infraestructura de inferencia: con 124,77 millones de parametros, permite validar pipelines de despliegue (transformers, TGI, vLLM) a coste casi nulo antes de escalar a modelos mayores.
- Generacion de texto de relleno en entornos de prueba: util para poblar interfaces, tests de integracion y demos donde la calidad del contenido no es critica.
- Benchmarking de tecnicas de promediado de pesos: la variante "loglinear" puede compararse con las variantes "uniform" y "tur" publicadas por el mismo autor para medir el efecto de SWA.
- Docencia y practicas de ajuste fino: su tamano permite ejecutar un ciclo completo de SFT en una sola GPU de consumo, lo que lo hace apto para cursos de aprendizaje automatico.
- Investigacion sobre empaquetado de secuencias: permite medir como afecta el "packing" a la perplejidad y a la estabilidad del entrenamiento en modelos pequenos.
- Experimentos de semilla y estabilidad: al existir variantes con semillas distintas (3407, 10, 455), facilita estudios de varianza entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, curvas de perdida ni comparaciones cuantitativas, y el unico enlace externo es el panel de Weights & Biases del propio entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en fp32, unos 0,25 GB en fp16/bf16 y aproximadamente 0,15 GB en cuantizacion de 8 bits. La ficha de LLM Explorer para un modelo de este tamano indica 0,2 GB de VRAM, coherente con estas cifras. Son estimaciones derivadas del numero de parametros, no datos medidos por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. No se requiere A100 ni H100; una GTX 1650, RTX 3050, RTX 4090 o incluso una iGPU moderna pueden ejecutarlo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU o en dispositivos tipo Raspberry Pi 5.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")` es la via documentada. Tambien son viables Text Generation Inference (TGI), vLLM y FriendliAI, que ya indexa modelos de esta familia. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponibles. No se publican mediciones. Por el tamano, se espera una generacion en tiempo real en GPU de consumo, pero es una inferencia no verificada.
- Nota sobre el repositorio: los 7,7 GB de tamano del repo son desproporcionados para 124,77 millones de parametros, lo que sugiere que contiene multiples ficheros de punto de control u optimizador; conviene descargar solo los pesos necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/swa-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407 | 124,77 M | no disponible | no disponible | no disponible | HuggingFace, 56 descargas |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | Perplejidad y benchmarks en el paper original de GPT-2 | MIT (pesos publicados) | HuggingFace, ampliamente usado |
| distilgpt2 (HuggingFace) | 82 M | 1024 tokens | Resultados en la model card del autor | Apache 2.0 | HuggingFace |
| SmolLM-135M (HuggingFace) | 135 M | 2048 tokens | Resultados publicados en su model card | Apache 2.0 | HuggingFace |
| TinyLlama-1.1B (varios) | 1,1 B | 2048 tokens | Resultados publicados en su model card | Apache 2.0 | HuggingFace |

Comparado con GPT-2 small, el modelo aqui descrito tiene un tamano practicamente identico, pero carece de licencia clara y de evaluacion publicada, por lo que no es un sustituto directo en produccion. Frente a distilgpt2 o SmolLM-135M, la diferencia relevante no es de rendimiento sino de trazabilidad: los modelos de HuggingFace cuentan con model card completa y licencia permisiva, mientras que este repositorio es un artefacto de experimento sin garantias.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni perplejidad, ni analisis cualitativo de las salidas. No se puede afirmar que el modelo sea util para una tarea concreta.
- Licencia no especificada: la model card contiene `licence: license` como marcador vacio y los metadatos de HuggingFace no declaran licencia. No hay autorizacion explicita de uso comercial, por lo que su empleo en produccion es juridicamente arriesgado.
- Idiomas no declarados: se desconoce que lenguas cubre el entrenamiento y con que calidad.
- Sesgos: al no documentarse la composicion del dataset, no es posible evaluar sesgos de genero, raza, religion o ideologia. Un modelo GPT-2 ajustado sobre un corpus no descrito tiende a reproducir los sesgos de ese corpus.
- Riesgo de alucinacion: alto en terminos relativos, dado el tamano reducido y la ausencia de alineacion documentada (no se menciona RLHF ni DPO).
- Contexto limitado: si se confirma la ventana estandar de GPT-2, el modelo no puede gestionar conversaciones multi-turno largas ni documentos extensos.
- Sin soporte de herramientas: no hay evidencia de tool calling, lo que descarta su uso en agentes o pipelines que requieran invocar APIs.
- Nombre y estructura del repositorio: el identificador es largo y contiene informacion interna del experimento; no hay versionado semantico ni releases estables.
- Confusion potencial con la familia: existen multiples variantes casi identicas ("uniform", "tur", "loglinear", con semillas 10, 455 y 3407) que dificultan identificar cual es la version de referencia.
- Uso previsto: investigacion y docencia, no produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-loglinear-newlex-swa-before-100mb-packed-bfdiso_seed3407
- Experimento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/rk9mn6g0
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante "uniform" (antes de ckpt500, semilla 3407): https://huggingface.co/francesca9805/swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
- Variante "uniform" (despues de ckpt500, semilla 455): https://huggingface.co/francesca9805/swa-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed455
- Despliegue en FriendliAI (variante uniform, semilla 10): https://friendli.ai/models/francesca9805/swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Ficha en LLM Explorer (variante "tur", 124,8 M): https://llm-explorer.com/model/francesca9805%2Ftur-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10,4DLoBa7wgbPEoviH1byDDP
- Ficha en LLM Explorer (variante "ppt", 86,5 M): https://llm-explorer.com/model/francesca9805%2Fppt-wc-uniform-newlex-swa-after-100mb-packed-bfdiso_seed10,6jSGieoixHpmGRdNgO5QLk
- Paper de GPT-2 (arquitectura base): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
