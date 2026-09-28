# dharandhamo/Forge-20M

## Resumen

Forge-20M es un modelo de lenguaje causal de tipo decoder-only con arquitectura estilo GPT-2, desarrollado por dharandhamo (Dhamodharan S) y publicado bajo licencia MIT. Con 20,75 millones de parametros, ha sido disenado y entrenado integramente desde cero, sin pesos preentrenados ni ajuste fino sobre un modelo existente, con el objetivo de implementar y depurar cada componente de un transformer (autoatencion causal, embeddings posicionales aprendidos, weight tying y bucle de entrenamiento con precision mixta) sobre hardware limitado.

El modelo se entreno de extremo a extremo en una unica GPU NVIDIA T4 (16 GB), en la capa gratuita de Kaggle, sobre el split `sample-10BT` del dataset FineWeb-Edu. Su proposito es educativo y de investigacion: sirve como ejemplo reproducible de entrenamiento de un LLM a pequena escala y como material docente, no como herramienta de generacion de texto lista para produccion.

No es un modelo instruido ni conversacional. Genera continuaciones de texto en ingles con coherencia gramatical limitada (degrada a partir de 4-6 frases) y no es fiable a nivel factual. Su relevancia actual radica en su valor como artefacto didactico y de investigacion sobre dinamicas de entrenamiento en recursos restringidos, no en su rendimiento bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (autoatencion causal, embeddings posicionales aprendidos, weight tying) |
| Parametros totales | 20,75 M |
| Parametros activos | no aplica (modelo denso, no es una arquitectura MoE) |
| Longitud de contexto | 512 tokens (block size) |
| Tipos de cuantizacion | no disponible (solo se ofrece checkpoint PyTorch en .pt; no se publican versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, checkpoint `ckpt_final_iter4931_valloss4.211.pt`); no hay safetensors ni GGUF |

Datos adicionales: tokenizador GPT-2 byte-level BPE via `tiktoken`, vocabulario de 50.304 entradas (padded); tamano del repositorio 0,3 GB; pipeline `text-generation`; creado el 27 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura sigue la familia GPT-2: transformer decoder-only con autoatencion causal personalizada, embeddings posicionales aprendidos (no rotatorios) y weight tying entre la capa de embedding de entrada y la proyeccion de salida. La implementacion es una reimplementacion desde cero inspirada en nanoGPT de Andrej Karpathy, no un fork. El modelo opera con una longitud de contexto fija de 512 tokens.

El entrenamiento se realizo en dos etapas sobre una unica T4. La etapa 1 cubrio 100M tokens con 5.000 pasos, batch size 32, acumulacion de gradiente 4 (batch efectivo 128), block size 512, optimizador AdamW fusionado con betas (0,9; 0,95) y weight decay 0,1, LR pico 5e-4 con decaimiento coseno hasta 5e-5 y warmup de 100 pasos, en fp16 (precision mixta), durante aproximadamente 94 minutos. La etapa 2 anadio 300M tokens nuevos y no solapados, alcanzando 4.931 pasos acumulados, con LR pico 3e-4 y decaimiento coseno hasta 2e-5, en otros ~92 minutos. La perdida de validacion final reportada es 4,211. La model card indica un total de ~628M tokens acumulados, aunque las cifras por etapa (100M + 300M) suman 400M; no se ofrece aclaracion al respecto. No se aplico RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto por continuacion (completion) en ingles, a partir de un prompt.
- Coherencia gramatical razonable en tramos cortos de generacion.
- Muestreo configurable en la inferencia: temperatura, top-k y penalizacion de repeticion.
- No soporta tool calling ni function calling.
- No soporta flujos de agente ni razonamiento multi-paso.
- Modelo unicamente en ingles.
- No dispone de modo thinking, vision ni audio. Es un modelo de texto puro, base y sin instrucciones.

## Casos de uso

- Material didactico en cursos de deep learning: permite mostrar linea a linea como funciona un transformer causal (atencion, embeddings, bucle de entrenamiento) ejecutandose en hardware accesible.
- Reproduccion de experimentos academicos: sirve como linea base de bajo coste para estudiar dinamicas de entrenamiento, ajuste de hiperparametros y precision mixta en una sola T4.
- Prototipado rapido de pipelines de completion: al cargarse en CPU o en cualquier GPU con muy poca VRAM, es util para validar codigo de tokenizacion, generacion y muestreo antes de escalar a modelos mayores.
- Pruebas de infraestructura de inferencia: permite verificar configuraciones de despliegue (carga de checkpoint, gestion de contexto de 512 tokens, penalizacion de repeticion) sin consumir recursos significativos.
- Analisis de sesgos de corpus: al entrenarse solo sobre FineWeb-Edu, es un caso de estudio controlado para examinar el estilo y los sesgos heredados de un unico corpus educativo en ingles.
- Benchmarking de hardware y herramientas: por su tamano minimo, es adecuado para medir latencias y validar integraciones de frameworks de inferencia en entornos con recursos escasos.
- Demostraciones educativas interactivas: su bajo coste permite incluirlo en notebooks o espacios tipo Gradio como ejemplo de generacion de texto, dejando claro que no es fiable a nivel factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo de rendimiento reportado es la perdida de validacion del checkpoint final (`val_loss` = 4,211), que es una metrica de entrenamiento y no un benchmark comparable con MMLU, HumanEval, GSM8K u otros estandares.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Los pesos ocupan aproximadamente 83 MB en fp32 y 42 MB en fp16; con activaciones, la huella total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente. Se entreno en una NVIDIA T4 (16 GB); tambien funciona en GPUs de gama de entrada y de consumo general.
- Compatibilidad con GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en GPUs integradas; tambien es viable en CPU.
- Opciones de despliegue: carga directa en PyTorch mediante el checkpoint `.pt` (requiere las definiciones de `GPTConfig` y `GPT` del repositorio). Para llama.cpp u Ollama seria necesario convertir el modelo a GGUF, ya que no se publica en ese formato. vLLM o TGI son tecnicamente posibles por el tamano, pero no hay soporte ni configuracion publicados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparacion se limita a especificaciones, ya que no hay benchmarks publicados de Forge-20M que permitan comparar rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Forge-20M | 20,75 M | 512 | MIT | HuggingFace (.pt) | Entrenado desde cero por un autor individual; sin instrucciones ni filtros |
| GPT-2 small | 124 M | 1.024 | MIT | HuggingFace (varios formatos) | Referencia de la familia arquitectonica; preentrenado a mayor escala |
| Pythia-70M | 70 M | 2.048 | Apache 2.0 | HuggingFace | Suite de investigacion con checkpoints intermedios y mayor contexto |
| TinyStories-33M | ~33 M | 512 | Diversas (segun variante) | HuggingFace | Entrenado sobre un corpus sintetico de cuentos; enfoque didactico similar |

No hay datos de rendimiento comparables publicados para Forge-20M; los modelos de la tabla se incluyen por similitud de tamano y categoria, no por equivalencia de resultados.

## Limitaciones y advertencias

- Sesgos: al entrenarse exclusivamente sobre FineWeb-Edu (contenido web educativo en ingles), reproduce el estilo y los sesgos presentes en ese corpus, sin ninguna mitigacion posterior.
- Alucinacion: con 20,75 M de parametros, el modelo no tiene capacidad suficiente para almacenar conocimiento factual de forma fiable; cualquier afirmacion factual generada debe considerarse fabricada salvo verificacion independiente.
- Coherencia: la calidad del texto degrada de forma perceptible a partir de 4-6 frases de generacion.
- Idioma: solo ingles, sin capacidades multilingues.
- Contexto: ventana limitada a 512 tokens, insuficiente para conversaciones largas o documentos extensos.
- Licencia: MIT permite uso comercial, pero el autor desaconseja explicitamente cualquier aplicacion de produccion, medica, legal, financiera o de seguridad critica.
- Ausencia de ajuste: no hay instruction tuning, RLHF ni filtrado de seguridad; las salidas son continuaciones sin procesar.
- Naturaleza del artefacto: debe entenderse como un elemento de investigacion y aprendizaje, no como una herramienta de generacion de texto lista para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dharandhamo/Forge-20M
- Perfil del autor en HuggingFace: https://huggingface.co/dharandhamo
- Repositorio en GitHub: https://github.com/Dhamodharan2006/Forge-20M/tree/main
- Dataset de entrenamiento (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Arquitectura de referencia (nanoGPT): https://github.com/karpathy/nanoGPT
