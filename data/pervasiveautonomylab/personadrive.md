# PervasiveAutonomyLab/PersonaDrive

## Resumen

PersonaDrive es un agente de conduccion autonoma de tipo vision-language-action (VLA) desarrollado por el Pervasive Autonomy Lab de la Universidad de California en Irvine, presentado en WACV 2027. El modelo parte de SimLingo (a su vez construido sobre el backbone InternVL2-1B) y se especializa en conduccion de estilo humano dentro del simulador CARLA 0.9.15, evaluado con el benchmark Bench2Drive. Su propuesta central es la recuperacion aumentada en contexto: en lugar de codificar un unico estilo de conduccion, el modelo recibe K = 2 demostraciones recuperadas de una base de datos de trayectorias humanas y adapta su comportamiento (agresivo, neutro o conservador) a partir de ellas, sin etiqueta de estilo explicita.

El checkpoint publicado corresponde a la etapa 3 del pipeline (in-context fine-tuning) y contiene el modelo completo con 1.36 B de parametros totales, de los cuales solo unos 24 M se entrenan en esta etapa mediante LoRA sobre el modelo de lenguaje, el proyector vision-lenguaje, el adaptador de conduccion y el codificador de waypoints. La innovacion principal es que un unico conjunto de pesos sirve para todos los estilos: cambiar de conducta solo requiere cambiar el indice FAISS que consulta la cabeza de recuperacion, lo que reduce drasticamente el coste de mantener variantes de conduccion.

Es relevante ahora porque demuestra que el aprendizaje en contexto con recuperacion puede aportar personalizacion de comportamiento en sistemas roboticos y de conduccion sin reentrenamiento, un patron que esta ganando traccion en agentes embodied. La licencia Apache 2.0 y la publicacion del codigo y los indices de recuperacion facilitan su reproduccion y extension.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en InternVL2-1B con LoRA sobre el LLM, proyector vision-lenguaje, adaptador de conduccion y codificador de waypoints; recuperacion en contexto con cabeza FAISS |
| Parametros totales | 1.36 B |
| Parametros activos | No aplica (no es MoE); aproximadamente 24 M entrenados en esta etapa |
| Longitud de contexto | No disponible (K = 2 puntos de contexto recuperados por inferencia) |
| Tipos de cuantizacion | No disponible (pesos en fp32 para los entrenados y bf16 para los congelados) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict PyTorch en un unico archivo (`pytorch_model.pt`, 1.96 GB); no es un checkpoint de `transformers` ni PEFT |

## Arquitectura y entrenamiento

PersonaDrive es un transformer multimodal VLA que hereda la estructura de SimLingo: un codificador visual InternViT congelado (340 tensores), un proyector MLP (`mlp1`, 6 tensores) que alinea vision y lenguaje, y un modelo de lenguaje con adaptadores LoRA (r 32, alpha 64, 336 tensores) almacenados sin fusionar. Sobre esta base se anaden un adaptador de conduccion (10 tensores) y un codificador de waypoints (6 tensores) que producen las trayectorias de conduccion. En esta etapa 3 solo se entrenan el proyector, los adaptadores de conduccion, el codificador de waypoints y los LoRA del LLM, mientras que el codificador visual y los pesos base del LLM permanecen congelados, lo que limita el entrenamiento a unos 24 M de parametros.

El entrenamiento se realiza en tres etapas: la primera y segunda entrenan una cabeza de recuperacion separada de aproximadamente 2 M de parametros que indexa demostraciones humanas en un espacio de embeddings; la tercera, que corresponde a este checkpoint, ajusta el agente para leer K = 2 puntos de contexto recuperados como demostraciones few-shot antes de predecir sus propios waypoints. Cada punto de contexto contiene una imagen, historial de control, comando, puntos objetivo, comentario y waypoints ejecutados. El modelo no recibe etiqueta de estilo y debe inferirlo a partir de las demostraciones. Los datos de recuperacion provienen del dataset de SimLingo (54.040 frames indexados en el indice `normal`), y la evaluacion se realiza en CARLA 0.9.15 con Bench2Drive. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset, ni si se empleo RLHF o DPO.

## Capacidades

- Conduccion autonoma en simulacion CARLA 0.9.15, con prediccion de waypoints y control del vehiculo.
- Aprendizaje en contexto con recuperacion: adapta el estilo de conduccion (agresivo, neutro, conservador) a partir de K = 2 demostraciones recuperadas, sin reentrenamiento.
- Inferencia de estilo implicita: no necesita etiqueta de estilo; lo deduce de las demostraciones recuperadas.
- Percepcion visual: procesa imagenes de camara mediante el codificador InternViT.
- Procesamiento multimodal de comandos, historial de control y comentarios textuales junto con la senal visual.
- Recuperacion vectorial mediante FAISS sobre indices de demostraciones humanas.
- Capacidad de desactivar la recuperacion (`PERSONADRIVE_NUM_ICL=0`) para conduccion sin contexto.
- Soporte de perfiles de conduccion predefinidos: `fast` (agresivo), `default` (neutro), `slow` (conservador) y `normal` (sin estilo).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso generico; el modelo esta especializado en conduccion.

## Casos de uso

- Evaluacion de conduccion autonoma en Bench2Drive: el modelo se ejecuta sobre rutas del split de Bench2Drive en CARLA 0.9.15, lo que permite comparar agentes VLA bajo condiciones estandarizadas y reproducibles.
- Investigacion sobre personalizacion de comportamiento: al cambiar solo el indice FAISS de recuperacion, un mismo checkpoint produce conductas agresivas, neutras o conservadoras, lo que facilita estudios controlados sobre estilo de conduccion sin entrenar multiples modelos.
- Generacion de datos sinteticos de conduccion: el agente puede generar trayectorias con estilos diversos en el simulador, utiles para aumentar datasets de entrenamiento o para pruebas de robustez de planificadores.
- Pruebas de seguridad y validacion de planificadores: la posibilidad de inducir un estilo conservador (`slow`) permite evaluar como responde el sistema en escenarios de conduccion prudente y comparar con el estilo agresivo (`fast`) en las mismas rutas.
- Benchmarking de recuperacion aumentada en agentes embodied: sirve como referencia para investigar como el numero y la calidad de las demostraciones recuperadas afectan al rendimiento en tareas de control continuo.
- Prototipado de agentes VLA en robotica: aunque orientado a conduccion, el patron de recuperacion en contexto con LoRA sobre un VLM de 1.36 B es reutilizable en otros dominios de robotica que requieran adaptacion de estilo o politica a partir de demostraciones.
- Reproduccion de resultados academicos: al publicarse codigo, indices FAISS y checkpoint completo, otros grupos pueden reproducir los experimentos del paper y extenderlos con sus propios indices de demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina del proyecto y al paper (arXiv 2606.12616) para los resultados completos, pero no incluye cifras numericas de Bench2Drive ni de otras metricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint pesa 1.96 GB (fp32 para tensores entrenados y bf16 para congelados), por lo que se estima un consumo en el rango de pocos GB, aunque no se confirma en la informacion.
- GPU recomendadas: NVIDIA Ampere, Ada o Hopper, necesarias para bf16 y flash-attention 2. Las GPU Blackwell requieren una version de PyTorch mas reciente que la fijada (2.2.2).
- Cabe en GPU consumer: no se especifica; el requisito de arquitectura Ampere o superior sugiere compatibilidad con RTX 30xx y 40xx, pero no se confirma.
- Sistema operativo: Linux x86-64 con CARLA 0.9.15.
- Opciones de despliegue: el modelo se carga mediante el codigo de PersonaDrive (no es compatible directamente con `transformers`, PEFT, vLLM, llama.cpp, Ollama ni TGI); requiere el repositorio oficial y el entorno `personadrive`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PersonaDrive | 1.36 B (24 M entrenados) | No disponible (K = 2 puntos de contexto) | VLA con recuperacion en contexto y estilo personalizable | Apache 2.0 | Hugging Face y GitHub |
| SimLingo (RenzKa/simlingo) | No disponible | No disponible | VLA de conduccion base, sin recuperacion en contexto | No disponible | Hugging Face |
| InternVL2-1B | 1 B | No disponible | VLM generalista, backbone de PersonaDrive | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a la relacion de dependencia (PersonaDrive parte de SimLingo, que a su vez se construye sobre InternVL2-1B) y a la licencia y disponibilidad conocidas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en conduccion en simulacion CARLA 0.9.15; no es un modelo de proposito general ni un VLM conversacional.
- Solo soporta ingles; no se documenta cobertura multilingue.
- El checkpoint no es compatible con `transformers` ni PEFT: requiere el codigo de PersonaDrive y una version concreta de PyTorch (2.2.2), lo que limita su integracion en pipelines estandar.
- Dependencia de CARLA 0.9.15 y de Linux x86-64; no se documenta soporte para otros simuladores ni para despliegue en produccion real.
- La recuperacion requiere tres componentes (cabeza de recuperacion, indice FAISS y datos de SimLingo); el indice `normal` publicado no incluye los datos de SimLingo, que deben descargarse y completarse con un script.
- El rendimiento depende de la calidad y representatividad de las demostraciones recuperadas; indices pobres o sesgados pueden degradar la conduccion.
- Riesgo de alucinacion y de comportamiento impredecible en escenarios fuera de distribucion del simulador; no se documentan evaluaciones de robustez fuera de Bench2Drive.
- Aunque la licencia es Apache 2.0, el uso comercial en conduccion real no esta validado por los autores y requeriria evaluacion adicional; el modelo esta pensado para investigacion en simulacion.
- No se publican cifras de benchmarks en la model card, lo que dificulta una evaluacion cuantitativa independiente sin consultar el paper.
- El modelo base SimLingo y el backbone InternVL2-1B tienen sus propias condiciones de licencia que deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/PervasiveAutonomyLab/PersonaDrive
- Pagina del proyecto: https://pervasiveautonomylab.github.io/personadrive-landpage/
- Paper (arXiv 2606.12616): https://arxiv.org/abs/2606.12616
- Codigo: https://github.com/PervasiveAutonomyLab/PersonaDrive
- Video demo: https://pervasiveautonomylab.github.io/personadrive-landpage/static/videos/demo_full.mp4
- Checkpoint de la cabeza de recuperacion: https://github.com/PervasiveAutonomyLab/PersonaDrive/blob/main/persona_drive_rag/checkpoints/best_model.pt
- Modelo base SimLingo: https://huggingface.co/RenzKa/simlingo
- Backbone InternVL2-1B: https://huggingface.co/OpenGVLab/InternVL2-1B
