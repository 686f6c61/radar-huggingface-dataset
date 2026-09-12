# Aobangaming/lightning-30m-ft-src

## Resumen

Lightning-30m-ft-src es un modelo de generacion de texto autoregresivo de tipo decoder-only, desarrollado por el usuario Aobangaming (firmado como AobanZ en la model card) y publicado en HuggingFace. Se presenta como un modelo "pequeno" orientado a generacion de texto conversacional y continuacion de narrativa, afinado a partir de un modelo previo denominado Aoban-2.7-L y entrenado sobre el dataset BookSum, compuesto por resumenes y texto de libros en ingles. La model card lo describe como una variante entrenada con FlashAttention y atencion multi-cabeza (MHA) sobre una GPU de consumo RTX 3050 de 6 GB.

La relevancia de este modelo no esta en su rendimiento, sino en su naturaleza de artefacto de investigacion y experimentacion: con 4 capas, una dimension de modelo de 256, 4 cabezas de atencion y un vocabulario de aproximadamente 50.000 tokens, es un transformer deliberadamente minimo que cabe en cualquier hardware y sirve como banco de pruebas para pipelines de entrenamiento, tokenizacion y despliegue. El autor lo publica con licencia MIT y lo declara apto unicamente para investigacion, analisis y ajuste fino, no para uso profesional.

El repositorio no incluye resultados de benchmarks, no documenta cuantizaciones disponibles y no especifica el formato exacto de los pesos mas alla de que se requiere `trust_remote_code=True`. Ademas, la model card contiene referencias cruzadas a otros nombres ("Aoban 3.0", "Aoban-2.7-L", "Lightning-30M"), lo que sugiere que el documento se reutilizo de otros proyectos y debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo con FlashAttention y MHA |
| Parametros totales | no disponible de forma explicita; el nombre del modelo sugiere ~30 M (con vocabulario de ~50.000 y d_model 256, la estimacion derivada de la configuracion publicada es de ~29 M, no confirmada por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 160 tokens (segun la tabla de hiperparametros de la model card) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas ni se documenta soporte) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0,8 GB y requiere `trust_remote_code=True`; no se confirma safetensors ni GGUF) |

Otros hiperparametros declarados:

| Parametro | Valor |
|---|---|
| Capas | 4 |
| D_MODEL | 256 (64 dimensiones por cabeza) |
| Cabezas de atencion | 4 |
| Vocabulario | ~50.000 tokens |
| Precision de entrenamiento | FP32 |
| Optimizador | AdamW |
| Learning rate | 5e-4 |
| Batch size | 32 |
| Modelo base | Aoban-2.7-L (finetuned from) |
| Dataset | kmfoda/booksum |
| Descargas / likes | 0 / 2 |

## Arquitectura y entrenamiento

Lightning es un transformer causal estandar, decoder-only, sin innovaciones arquitectonicas mas alla del uso de FlashAttention para acelerar el calculo de la atencion y de atencion multi-cabeza convencional. La configuracion es extremadamente compacta: 4 capas, d_model de 256 y 4 cabezas de 64 dimensiones cada una, con un vocabulario de aproximadamente 50.000 entradas y una longitud de secuencia de 160 tokens. La model card indica que el objetivo es ofrecer salidas rapidas y coherentes a costa de una capacidad de representacion ("embedding") limitada.

El entrenamiento se realizo en dos fases: una primera etapa sobre un corpus amplio de libros y una segunda etapa de ajuste fino sobre un subconjunto menor. El dataset declarado es BookSum (`kmfoda/booksum`), orientado a resumenes de libros, con un volumen aproximado de 300 MB. Los hiperparametros documentados son precision FP32, optimizador AdamW, learning rate 5e-4 y batch size 32. No se documenta ningun proceso de alineacion (RLHF, DPO, SFT supervisado con preferencias) ni composicion detallada del dataset, numero de tokens vistos o estrategia de tokenizacion. Tampoco se especifica que tokenizador se usa, mas alla del ejemplo de codigo que invoca `tokenizers.Tokenizer.from_pretrained(model_id)`.

El coste computacional declarado es minimo: 1,5 horas en una RTX 3050 de 6 GB, con una estimacion de 0,06 kg de CO2e, sobre un entorno Windows 11 con un Intel i5-10400. Esto confirma que se trata de un experimento de entrenamiento a pequena escala, no de un modelo producido con recursos industriales.

## Capacidades

- Generacion de texto autoregresiva en ingles, orientada a continuacion de fragmentos y respuestas conversacionales breves.
- Generacion de narrativa y continuacion de historias, dado que el corpus de entrenamiento son libros y resumenes de libros.
- Capacidad limitada de resumen o condensacion de texto, heredada parcialmente del dataset BookSum, aunque no hay evaluacion publicada que lo confirme.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni planificacion.
- No se documenta modo "thinking", vision, audio ni ninguna modalidad adicional: es exclusivamente texto.
- Multilingue: no. La model card indica explicitamente que procesa ingles unicamente y que no puede ajustarse para otros usos.
- Ajuste fino: el autor lo recomienda como base para ajustar en texto nuevo, por lo que la capacidad real de uso es como punto de partida para fine-tuning.

## Casos de uso

- Prototipado y docencia sobre transformers: por su tamano (4 capas, d_model 256) es adecuado para explicar el funcionamiento interno de un decoder causal, inspeccionar matrices de atencion y experimentar con tokenizacion sin necesidad de GPU dedicada.
- Continuacion de texto narrativo en demos: dado su entrenamiento sobre BookSum, puede generar continuaciones de fragmentos literarios breves para demostraciones o entornos de prueba, siempre que la entrada quepa en 160 tokens.
- Base para ajuste fino en dominios concretos: el autor recomienda explicitamente el fine-tuning; un equipo puede partir de este checkpoint para adaptarlo a un estilo o vocabulario especifico (por ejemplo, descripciones de producto o texto tecnico interno) con costes de computo minimos.
- Generacion de datos sinteticos de baja calidad para pruebas de pipeline: util para rellenar fixtures y validar etapas de preprocesado, formateo o evaluacion sin depender de APIs externas.
- Validacion de infraestructura de despliegue: sirve para probar extremo a extremo un flujo de carga con `trust_remote_code=True`, verificacion de tokenizador, generacion con `temperature`, `top_k` y `top_p`, y monitorizacion de latencia antes de escalar a modelos mayores.
- Inferencia en entornos sin GPU: con ~30 M de parametros, el modelo puede ejecutarse en CPU o en dispositivos de borde para pruebas de concepto de generacion de texto en tiempo real.
- Experimentos de eficiencia y cuantizacion: es un candidato comodo para medir el impacto de FP32 frente a FP16 o INT8 en latencia y uso de memoria, y para probar conversiones a formatos alternativos.
- Evaluacion de riesgos y sesgos en modelos pequenos: util como caso de estudio de como un corpus de libros introduce sesgos de estilo, epoca y registro en un modelo con escasa capacidad de generalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion cuantitativa, y la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (los resultados obtenidos correspondian a tutoriales de Windows y no guardan relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: con ~30 M de parametros, los pesos en FP32 ocupan aproximadamente 120 MB; en FP16, unos 60 MB; en INT8, alrededor de 30 MB. Sumando activaciones y buffers para una secuencia de 160 tokens, el consumo total se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sobradamente en RTX 3050, RTX 3060, RTX 4090, T4, A100 o H100; ninguna de estas ultimas aporta ventaja practica por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU sin aceleracion dedicada.
- Opciones de despliegue: la via documentada es `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y un tokenizador cargado con la libreria `tokenizers`. No se documenta soporte oficial para vLLM, TGI, llama.cpp, Ollama ni LM Studio; llama.cpp u Ollama requeririan una conversion a GGUF que no se ha publicado. El tag `custom_code` implica que es necesario habilitar codigo remoto, lo que anade riesgo de seguridad en despliegues de produccion.
- Latencia y throughput estimados: no se publican mediciones. Por el tamano del modelo, la latencia por token en GPU moderna seria del orden de milisegundos y el throughput muy alto, pero se trata de una estimacion basada en el numero de parametros, no de un dato medido.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de Lightning, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos provienen de su documentacion publica y no han sido verificados en esta busqueda; deben confirmarse antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lightning-30m-ft-src | ~30 M (segun nombre y configuracion publicada) | 160 tokens | MIT | HuggingFace, requiere `trust_remote_code` |
| GPT-2 small | 124 M | 1.024 tokens | MIT modificada | Ampliamente disponible, multiples formatos y cuantizaciones |
| TinyStories-33M | 33 M | 1.024 tokens (arquitectura tipo GPT-Neo) | no verificada en esta busqueda | HuggingFace |
| Pythia-70M | 70 M | 2.048 tokens | Apache-2.0 | HuggingFace, con suite completa de checkpoints |

Frente a estas alternativas, Lightning destaca negativamente en longitud de contexto (160 tokens frente a 1.024 o 2.048) y en madurez del ecosistema (sin cuantizaciones publicadas, sin benchmarks, sin soporte en motores de inferencia habituales). Su ventaja relativa es el tamano minimo y el coste de entrenamiento declarado (1,5 horas en una RTX 3050).

## Limitaciones y advertencias

- La model card es internamente inconsistente: mezcla los nombres "Lightning", "Aoban 3.0" y "Aoban-2.7-L", y enlaza un repositorio de descarga distinto (`Aobangaming/Lightning-30M`). Esto dificulta saber a que checkpoint concreto se refiere cada afirmacion.
- No hay ninguna evaluacion cuantitativa publicada, ni siquiera perplexity sobre el conjunto de validacion. No es posible estimar su calidad relativa de forma objetiva.
- Longitud de contexto de solo 160 tokens: cualquier caso de uso que requiera memoria conversacional o documentos largos queda descartado.
- Entrenado exclusivamente en ingles; el autor afirma que no puede ajustarse para otros usos ni idiomas. No hay capacidades multilingues.
- Corpus de entrenamiento reducido (300 MB de libros): alta probabilidad de sobreajuste al dominio literario, vocabulario sesgado hacia el registro de los libros y reproduccion de sesgos de epoca, genero y cultura presentes en esas fuentes.
- Riesgo elevado de alucinacion, repeticion y salidas incoherentes. El propio autor advierte de salidas "incompletas, inexactas, repetitivas o no relacionadas con la entrada".
- No apto para consejo profesional, redaccion real ni cargas de trabajo intensivas, segun la model card.
- Requiere `trust_remote_code=True` (tag `custom_code`), lo que implica ejecutar codigo del autor al cargar el modelo; conviene auditar el repositorio antes de usarlo en entornos compartidos o de produccion.
- No se ha publicado ningun formato cuantizado (GGUF, AWQ, GPTQ) ni pesos en safetensors confirmados, lo que complica el despliegue en herramientas estandar.
- Licencia MIT: permite uso comercial y modificacion, pero la falta de garantias y la baja calidad de salida hacen desaconsejable su uso en produccion.
- Posible solapamiento de contenido con obras protegidas por derechos de autor en el dataset subyacente (BookSum deriva de libros); conviene revisar las condiciones del dataset antes de reutilizar salidas con fines comerciales.
- El repositorio tiene 0 descargas y 2 likes, y las fechas de creacion y actualizacion indicadas en los metadatos (2026-09-12) son posteriores a la fecha de consulta habitual, lo que sugiere un problema de metadatos o un repositorio de prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aobangaming/lightning-30m-ft-src
- Repositorio de descarga citado en la model card: https://huggingface.co/Aobangaming/lightning-30m-ft
- Repositorio alternativo citado: https://huggingface.co/Aobangaming/Lightning-30M/tree/main
- Dataset de entrenamiento BookSum: https://huggingface.co/datasets/kmfoda/booksum
- Articulo sobre estimacion de emisiones citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en machine learning: https://mlco2.github.io/impact
- Modelo base "Aoban-2.7-L": enlace no disponible, no se proporciona URL en la model card.
- Repositorio de codigo, paper o demo adicional: no disponible.
- Resultados de busqueda web sobre el modelo: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente tutoriales de Windows sin relacion con el modelo.
