# blablabla02/gpt2-reuters-from-scratch

## Resumen

El modelo `blablabla02/gpt2-reuters-from-scratch` es un GPT-2 de pequeno tamano entrenado desde cero (sin inicializacion a partir de pesos preentrenados) por el usuario blablabla02 sobre un corpus de articulos de Reuters. Se trata de un ejercicio academico (identificado en la model card como "Assignment 02") cuyo objetivo es demostrar el entrenamiento completo de un transformer causal sobre un dominio concreto: noticias en ingles. Con 45,7 millones de parametros, 6 capas, 8 cabezas de atencion y una dimension de embedding de 512, sigue la configuracion clasica de GPT-2 small pero con una ventana de contexto reducida a 256 tokens y un vocabulario propio de 52.000 entradas.

El modelo resuelve un problema muy acotado: generar y completar texto con el estilo y la estructura del periodismo de agencia (titular seguido de cuerpo, separados por " | "). No compite con modelos de proposito general, sino que sirve como referencia reproducible de un pipeline de entrenamiento desde cero: tokenizador propio, dataset publico, curvas de perdida y generaciones de ejemplo incluidas en el repositorio. Su relevancia actual es didactica y de investigacion: permite estudiar el comportamiento de un transformer pequeno sobre un dominio cerrado sin los sesgos ni la complejidad de un modelo preentrenado a gran escala.

La licencia MIT y el formato safetensors facilitan su reutilizacion y experimentacion. El repositorio incluye ademas variantes entrenadas con 2 epocas y con batch size 16, asi como registros de entrenamiento, graficas y salidas de generacion, lo que lo convierte en un artefacto util para comparar configuraciones de entrenamiento sobre el mismo corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (GPT-2), 6 capas, 8 cabezas de atencion, dimension de embedding 512 |
| Parametros totales | 45.670.400 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (la model card menciona variantes "Q4" en subcarpetas `epochs_2/` y `batch_16/`, sin detallar el esquema de cuantizacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un GPT-2 estandar de tipo decoder-only con atencion causal, configurado con 6 capas, 8 cabezas de atencion, embedding de 512 dimensiones y un vocabulario de 52.000 tokens. La ventana de contexto es de 256 tokens, notablemente inferior a los 1.024 de GPT-2 small original. El modelo se inicializa de forma aleatoria (random initialisation) y se entrena desde cero, sin destilacion ni fine-tuning sobre pesos preentrenados. El tokenizador asociado es `ingeniumacademy/gpt2-reuters-tokenizer`, entrenado especificamente para este corpus.

El entrenamiento se realizo sobre el dataset `ingeniumacademy/reuters_articles`, con el texto formateado como `title | body`; el separador " | " se eligio tras comprobar colisiones y coste en tokens. Se aplicaron 5 epocas con batch size 32, tasa de aprendizaje 5e-4 y un scheduler coseno. No se menciona en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF, DPO o tecnicas de alineacion adicionales. El repositorio incluye variantes entrenadas con 2 epocas y con batch size 16, junto con registros, graficas de perdida y ejemplos de generacion.

## Capacidades

- Generacion de texto causal en ingles, orientada al estilo de articulos de agencia de noticias (titular y cuerpo).
- Continuacion de texto a partir de un prefijo, con la convencion `title | body` aprendida durante el entrenamiento.
- Modelado de lenguaje de dominio restringido: vocabulario y estructuras propias del corpus de Reuters.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking), vision, audio ni otras modalidades.
- No se documenta entrenamiento con instrucciones ni formato de chat.

## Casos de uso

- Generacion de titulares y cuerpos de noticia sinteticos para experimentacion: el modelo aprende la distribucion `title | body` y puede producir pares coherentes con el estilo de Reuters, util para aumentar datos de prueba en tareas de clasificacion o resumen periodistico.
- Docencia y practicas de entrenamiento desde cero: sirve como ejemplo completo de pipeline (tokenizador propio, dataset, entrenamiento con scheduler coseno, curvas de perdida) para asignaturas de aprendizaje automatico.
- Investigacion sobre modelos pequenos de dominio: permite estudiar el efecto de la ventana de contexto (256 tokens) y del tamano del vocabulario (52.000) en la perplejidad sobre un corpus cerrado.
- Baseline para comparativas de fine-tuning: al estar entrenado desde cero sobre Reuters, es un punto de partida controlado para medir la mejora que aporta el preentrenamiento a gran escala en la misma tarea.
- Prototipado de autocompletado editorial: con contexto corto, puede sugerir continuaciones de frases en textos periodisticos en un entorno de demostracion, siempre con revision humana.
- Analisis de sesgos y alucinacion en modelos pequenos: su limitado conocimiento del mundo lo convierte en un caso de estudio util para medir como un modelo de 45,7 M de parametros falla al generar hechos verificables.
- Experimentacion con cuantizacion: las variantes `epochs_2/` y `batch_16/` etiquetadas como Q4 permiten comparar el impacto de la cuantizacion en un modelo de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye curvas de perdida y ejemplos de generacion en las carpetas `logs/`, `plots/` y `outputs/`, pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de perplejidad en el material facilitado.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,18 GB solo para pesos (45,7 M de parametros x 4 bytes), mas activaciones y cache KV para contexto de 256 tokens; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- En fp16/bf16: unos 0,09 GB de pesos; en cuantizacion de 4 bits, en torno a 0,03 GB, por lo que puede ejecutarse en CPU sin dificultad.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 quedan sobredimensionadas para este modelo. Tambien es viable en CPU y en entornos de bajo consumo.
- Cabe holgadamente en GPU consumer (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en dispositivos con poca memoria.
- Opciones de despliegue: compatible con `transformers` (`GPT2LMHeadModel.from_pretrained`), y por arquitectura GPT-2 estandar deberia poder convertirse a GGUF para llama.cpp u Ollama y servirse con vLLM o TGI, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja en GPU y aceptable en CPU, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| blablabla02/gpt2-reuters-from-scratch | 45,7 M | 256 | MIT | Hugging Face | Entrenado desde cero sobre Reuters, solo ingles |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | Hugging Face / OpenAI | Preentrenado en WebText, proposito general, mucho mayor volumen de datos |
| DistilGPT-2 | 82 M | 1.024 | MIT | Hugging Face | Destilado de GPT-2, proposito general, mas rapido que GPT-2 small |
| GPT-2 medium | 355 M | 1.024 | MIT | Hugging Face | Mayor capacidad, contexto de 1.024, preentrenado a gran escala |

La comparacion es orientativa: el modelo de blablabla02 es un ejercicio de dominio con un cuarto de los parametros de GPT-2 small y una cuarta parte de su contexto, por lo que no es directamente comparable en rendimiento general. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de 45,7 M de parametros entrenado desde cero: su conocimiento del mundo es muy limitado y la probabilidad de generar hechos incorrectos o incoherentes es alta.
- Ventana de contexto de solo 256 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado exclusivamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Entrenado sobre un corpus unico (Reuters), por lo que hereda los sesgos editoriales, tematicos y de estilo de esa fuente.
- No dispone de alineacion (RLHF/DPO) ni de formato de instrucciones; no es adecuado como asistente conversacional.
- No se documentan evaluaciones de seguridad, toxicidad ni robustez.
- Aunque la licencia es MIT y permite uso comercial, la ausencia de garantias y el riesgo de alucinacion hacen recomendable no desplegarlo en produccion sin supervision humana.
- Las variantes Q4 incluidas en el repositorio no detallan el esquema de cuantizacion, lo que dificulta reproducir exactamente su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blablabla02/gpt2-reuters-from-scratch
- Tokenizador asociado: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Paper de GPT-2 (arquitectura de referencia): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- Repositorio de referencia de GPT-2 en Hugging Face: https://huggingface.co/gpt2
