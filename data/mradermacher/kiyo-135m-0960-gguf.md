# mradermacher/Kiyo-135M-0960-GGUF

## Resumen
Kiyo-135M-0960-GGUF es un repositorio de pesos cuantizados en formato GGUF publicado por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF del modelo base DedeProGames/Kiyo-135M-0960, un modelo causal de tipo base (no instruct) con 134.515.008 parámetros (aproximadamente 134,5 millones). La cuantización permite ejecutar el modelo en hardware muy limitado, desde CPU hasta dispositivos de borde.

El modelo pertenece a la familia de arquitecturas Llama / SmolLM, según las etiquetas del repositorio, y está entrenado únicamente en inglés. Los datasets declarados son FineWeb-Edu, DCLM-Baseline-1.0, FineMath y Stack-V3-Train, lo que sugiere un entrenamiento orientado a texto general, matemáticas y código. La licencia es Apache 2.0, lo que facilita el uso comercial y la modificación.

Su relevancia actual reside en el nicho de modelos ultra pequeños: con 134 millones de parámetros y cuantizaciones de unos 0,2 GB, es apto para inferencia local en dispositivos con recursos mínimos, prototipado rápido y experimentación con pipelines de generación de texto sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia Llama / SmolLM) |
| Parametros totales | 134.515.008 (~134,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base tambien distribuye safetensors) |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only de tipo causal, etiquetado por el autor como perteneciente a las familias Llama y SmolLM. El recuento de parámetros confirmado desde safetensors es de 134.515.008, lo que sitúa al modelo en la gama de los "tiny models". No se dispone de información sobre el número de capas, dimensiones de atención, cabezas ni sobre la longitud de contexto soportada.

En cuanto al entrenamiento, la model card del repositorio base declara el uso de cuatro datasets: HuggingFaceFW/fineweb-edu, mlfoundations/dclm-baseline-1.0, HuggingFaceTB/finemath y HuggingFaceCode/stack-v3-train. Esta combinación apunta a una mezcla de texto educativo filtrado, corpus web de alta calidad, contenido matemático y código. No se especifica el número total de tokens de entrenamiento, la composición exacta de la mezcla ni si hubo fases de RLHF, DPO u otras técnicas de alineación. El repositorio de mradermacher indica que las cuantizaciones son estáticas (no ponderadas ni basadas en matriz de importancia), y que las variantes con imatrix no estaban disponibles en el momento de la publicación.

## Capacidades
- Generacion de texto autoregresiva en ingles, al ser un modelo causal de tipo base.
- Continuacion de texto y completado de fragmentos, sin formato conversacional garantizado (la etiqueta "conversational" aparece en el repositorio, pero el modelo base es de tipo base-model).
- Capacidad potencial en matematicas y codigo derivada de los datasets FineMath y Stack-V3-Train, aunque no hay evaluacion publicada que lo confirme.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Multilingue: no, el modelo declara unicamente ingles.
- No se documentan capacidades especiales como modo de razonamiento explicito, vision o audio.

## Casos de uso
- Prototipado rapido de pipelines de generacion de texto: al ocupar unos 0,2 GB en cuantizacion Q4, permite validar logicas de inferencia en local antes de escalar a modelos mayores.
- Inferencia en dispositivos de borde: su tamano reducido posibilita ejecutarlo en Raspberry Pi, moviles o microcontroladores con llama.cpp, cubriendo tareas de completado de texto sin conectividad.
- Generacion de texto en entornos sin GPU: con cuantizaciones Q4 o Q5 puede correr en CPU con latencia aceptable para aplicaciones no interactivas.
- Base para fine-tuning especifico de dominio: al ser un modelo base con licencia Apache 2.0, se puede ajustar con LoRA o adaptadores completos sobre datasets propios en ingles.
- Preprocesado y anotacion de datos: puede emplearse para tareas auxiliares de continuacion o clasificacion ligera dentro de pipelines de curación de datos, siempre con validacion humana.
- Educacion e investigacion sobre modelos pequenos: util como banco de pruebas para estudiar el efecto de la cuantizacion (Q2 a Q8) en la calidad de salida dentro de un rango de tamano controlado.
- Generacion de codigo asistida de baja complejidad: dado el dataset Stack-V3-Train, puede servir para autocompletar fragmentos simples en editores, aunque sin garantias de correccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; aproximadamente 0,2 GB para Q2_K hasta Q8_0 y 0,4 GB para f16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Incluso GPUs integradas pueden ejecutarlo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, asi como en CPU y dispositivos de borde.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. Tambien es compatible con endpoints segun la etiqueta "endpoints_compatible".
- Latencia y throughput: no disponibles; dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kiyo-135M-0960-GGUF | 134,5 M | no disponible | Apache 2.0 | GGUF (cuantizado) |
| SmolLM-135M | 135 M | no disponible en la informacion proporcionada | Apache 2.0 | safetensors y GGUF |
| Qwen2.5-0.5B | 494 M | no disponible en la informacion proporcionada | Apache 2.0 | safetensors y GGUF |

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, por lo que no es posible contrastar el rendimiento relativo entre estas alternativas.

## Limitaciones y advertencias
- Modelo base sin alineacion conversacional documentada: las salidas pueden ser incoherentes o poco utiles en formato de dialogo sin fine-tuning previo.
- Riesgo de alucinacion elevado: con 134 millones de parametros, la fidelidad factual es limitada y no debe usarse como fuente de verdad.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Longitud de contexto desconocida: no se ha publicado, lo que dificulta planificar aplicaciones que dependan de ventanas largas.
- Cuantizaciones agresivas: las variantes Q2_K y Q3 degradan notablemente la calidad; las recomendadas por el autor son Q4_K_S y Q4_K_M.
- Las cuantizaciones son estaticas, no ponderadas ni con imatrix, segun indica el propio repositorio.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y la atribucion correspondiente.
- Repositorio con cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de adopcion ni de validacion por parte de la comunidad.
- Para produccion se recomienda evaluar exhaustivamente la calidad de las salidas, dado que no existen benchmarks publicados.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Kiyo-135M-0960-GGUF
- Modelo base: https://huggingface.co/DedeProGames/Kiyo-135M-0960
- Coleccion Kiyo de DedeProGames: https://huggingface.co/collections/DedeProGames/kiyo
- Repositorio relacionado: https://huggingface.co/mradermacher/Kiyo-135M-GGUF
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#Kiyo-135M-0960-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafica de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Web de nethype GmbH: https://www.nethype.de/
