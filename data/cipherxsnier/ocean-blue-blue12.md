# cipherxsnier/ocean-blue-blue12

## Resumen

Ocean Blue - Blue-12 es un adaptador LoRA publicado por cipherxsnier (atribuido en la model card a Thomas Lee Harvey, aioceanblue.com) sobre el modelo base Qwen2.5-14B-Instruct. Forma parte de una serie de iteraciones denominada Ocean Blue, en la que el autor aplica un bucle de auto-mejora: cada generacion se entrena a partir de las respuestas verificadas de la generacion anterior, que actua como ancestro-profesor. Blue-12 es la duodécima iteracion y la primera que escala el estudiante de 7B a 14B parametros.

El modelo no introduce una arquitectura nueva: hereda el transformer decoder-only denso de Qwen2.5-14B-Instruct y anade un adaptador PEFT entrenado con destilacion de respuestas propias y del campeon previo (Blue-5). El objetivo declarado es mejorar el rendimiento en codigo, razonamiento cientifico, conocimiento medico y uso de herramientas sin degradar las capacidades del modelo base.

Su relevancia es limitada pero ilustrativa: se trata de un experimento de auto-destilacion reproducible y con verificacion de respuestas (el codigo se ejecuta contra tests antes de incorporarse al conjunto de entrenamiento), con una licencia Apache 2.0 y un peso de repositorio de 0,6 GB. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado especificaciones completas de contexto, idiomas ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-14B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | 14B en el modelo base; el adaptador LoRA no especifica su numero de parametros (repo de 0,6 GB) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-14B-Instruct soporta 32 768 tokens nativos, ampliables, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende de la conversion del modelo fusionado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-14B-Instruct, un transformer decoder-only denso con atencion por causalidad estandar, RoPE y capas de normalizacion RMSNorm. El adaptador LoRA modifica las proyecciones de atencion y MLP del modelo base; no se detalla el rango, el alpha ni las capas objetivo del adaptador en la informacion disponible. El repositorio ocupa 0,6 GB, coherente con un adaptador de rango moderado sobre un modelo de 14B.

El entrenamiento sigue el bucle de auto-mejora descrito por el autor: el estudiante se amplia de 7B a 14B, se destila con Blue-5 como ancestro-profesor y con una pasada de profesor adicional, y se incorporan las respuestas propias verificadas del modelo. Cada respuesta de codigo se ejecuta contra tests antes de conservarse, de modo que solo se entrena con datos verificados. Se aplica una sola epoca sobre el conjunto de codigo para evitar memorizacion y se selecciona el mejor checkpoint y merge mediante un muestreo de Monte Carlo, ganando una mezcla de pesos (weight soup) con coeficiente 0,5 sobre el conjunto de desarrollo reservado. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen2.5-14B-Instruct.
- Generacion de codigo, con mejora declarada en MBPP (62,8 a 71,4) y Code Bench v2 (50,5 a 61,0) respecto a Blue-5.
- Razonamiento cientifico y conocimiento medico a nivel de benchmark (Science 95,0; MMLU medical 81,3).
- Uso de herramientas y sentidos: la prueba "Senses / tool use" sube de 28,1 a 89,6, lo que sugiere mejora en tareas de invocacion de herramientas y percepcion estructurada.
- Razonamiento psicologico y social (Psychology 67,0; Social 92,0).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles; el modelo base Qwen2.5-14B-Instruct es solo texto.

## Casos de uso

- Generacion de codigo en produccion: el adaptador mejora MBPP y Code Bench v2 respecto a su predecesor, por lo que puede integrarse en pipelines de CI/CD para sugerir parches o tests, siempre con ejecucion y validacion automatica antes de fusionar.
- Asistente de refactorizacion: al heredar el contexto de Qwen2.5-14B-Instruct, puede procesar fragmentos de codigo extensos y proponer reescrituras; conviene verificar cada propuesta con la suite de tests del proyecto.
- Resolucion de problemas cientificos y tecnicos: el salto en Science (64,0 a 95,0) lo hace util para generar explicaciones y borradores de problemas de fisica, quimica o biologia en entornos educativos, con revision humana.
- Formacion medica simulada: el rendimiento en MMLU medical (81,3) permite usarlo como generador de preguntas de repaso o explicaciones de conceptos; no debe emplearse para consejo clinico.
- Agentes con uso de herramientas: la mejora en "Senses / tool use" (89,6) lo hace candidato para orquestar llamadas a APIs y funciones en flujos multi-paso, con validacion de esquemas y limites de reintentos.
- Analisis de interacciones sociales y psicologicas: las puntuaciones en Social (92,0) y Psychology (67,0) permiten usarlo para generar escenarios de entrenamiento o simulaciones de conversacion en investigacion conductual.
- Prototipado de asistentes conversacionales: al ser un adaptador ligero (0,6 GB) sobre un base ampliamente desplegado, permite experimentar con variantes de estilo o dominio sin reentrenar el modelo completo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparando Blue-12 con el campeon anterior Blue-5 sobre los mismos conjuntos congelados y el mismo harness:

| Test | Blue-5 (campeon anterior) | Blue-12 |
|---|---|---|
| HumanEval | 81,1 | 79,9 |
| MBPP (500) | 62,8 | 71,4 |
| Code Bench v2 (200) | 50,5 | 61,0 |
| Medical exam (MMLU medical, 300, solo evaluacion) | 75,0 | 81,3 |
| Science (100) | 64,0 | 95,0 |
| Senses / tool use (96) | 28,1 | 89,6 |
| Psychology (100) | 34,0 | 67,0 |
| Social (100) | 59,0 | 92,0 |
| Ocean Blue bench v1 (300) | 54,7 | 45,7 |

El autor reporta una prueba de signos pareada agrupada sobre todos los conjuntos congelados: Blue-12 acerto 181 preguntas mas que Blue-5 (p < 0,001). La puerta de aceptacion del propietario (2026-11-26) exige que los conjuntos de codigo no caigan mas de 3 puntos, el resto no mas de 10 y que la prueba agrupada se gane claramente. HumanEval cae 1,2 puntos (dentro del margen) y Ocean Blue bench v1 cae 9 puntos (puzzles de traza y orden), que el autor marca como objetivo de la siguiente generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base Qwen2.5-14B-Instruct. En FP16, el modelo completo necesita aproximadamente 28 GB de VRAM; en cuantizacion de 8 bits, unos 14-16 GB; en 4 bits, unos 8-10 GB. El adaptador en si ocupa 0,6 GB adicionales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 con offload parcial o cuantizacion 8 bits; RTX 3090/4080 para cuantizacion 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizacion 8 bits o 4 bits, y en RTX 3090 con 4 bits. En GPUs de 12 GB o menos sera necesario offload a CPU o cuantizacion agresiva.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con transformers + peft; para produccion puede fusionarse con el base y servirse con vLLM, TGI o llama.cpp tras conversion a GGUF. Ollama es viable una vez generado el GGUF del modelo fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ocean Blue - Blue-12 | 14B (base) + LoRA | No disponible | MBPP 71,4; Code Bench v2 61,0; Science 95,0 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-14B-Instruct | 14B | 32 768 tokens (nativo, ampliable) | Referencia del modelo base; sin datos publicados en esta ficha | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Blue-5 (campeon anterior de la serie) | 7B (base) + LoRA | No disponible | HumanEval 81,1; MBPP 62,8; Code Bench v2 50,5 | No disponible | Hugging Face (serie Ocean Blue) |

La comparativa con modelos de la misma categoria fuera de la serie Ocean Blue no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan evaluaciones de sesgo, toxicidad ni equidad; el modelo hereda los sesgos de Qwen2.5-14B-Instruct y de los datos de destilacion.
- Riesgo de alucinacion: el autor no reporta mediciones de factualidad fuera de los benchmarks citados; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios no cubiertos por el entrenamiento.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto efectiva del adaptador ni los idiomas soportados; el modelo base es predominantemente multilingue con foco en ingles y chino, pero no se confirma para este adaptador.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen2.5-14B-Instruct (tambien Apache 2.0) y citar la atribucion correspondiente.
- Caveat medico: el propio autor advierte que la prueba de examen medico es solo un benchmark de conocimiento y no constituye consejo medico.
- Rendimiento irregular: Ocean Blue bench v1 cae 9 puntos respecto a Blue-5, lo que indica regresiones en tareas de traza y orden; conviene evaluar el modelo en el dominio concreto antes de desplegarlo.
- Madurez y soporte: cero descargas y cero likes, sin pipeline declarado ni documentacion adicional; el soporte de la comunidad es practicamente inexistente.
- Reproducibilidad: no se publican hiperparametros del LoRA, composicion del dataset ni semillas, lo que dificulta reproducir los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cipherxsnier/ocean-blue-blue12
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Sitio del autor: https://aioceanblue.com
