# Karl28/MedJev-4B

## Resumen

MedJev-4B es un adaptador PEFT (LoRA) publicado por Karl28 que implementa el modelo descrito en el trabajo "MedJev: A System One Vision-Language Decision Model for Fast and Effective Medical Image Understanding". No es un modelo generativo al uso: recibe en un unico prompt la imagen, la pregunta y todas las respuestas candidatas, y devuelve una puntuacion para cada candidata en un solo forward pass. No genera tokens, por lo que elimina el bucle de decodificacion y el parser de respuestas, y el coste de la peticion no crece con la longitud de una respuesta que nadie lee.

El modelo se construye sobre Qwen3.5-4B con dos modificaciones: una reduccion de profundidad en el lado del lenguaje (se conservan completas las primeras 23 de las 32 capas, se eliminan las capas 24 a 31 y de la capa 32 solo se mantienen las proyecciones query y key) y una cabeza de decision residual que puntua cada candidata mediante la geometria query-key preentrenada del backbone, con un MLP compartido por candidata de anchura 256 cuya capa de salida se inicializa a cero.

Es relevante porque ataca un cuello de botella concreto de la IA medica multimodal: la latencia. Segun la model card, mejora la precision media de su propio backbone en 7,93 puntos y responde 6,04 veces mas rapido, con una latencia media de 113,4 ms en los tres benchmarks de imagen unica sobre una GPU H20. El repo solo redistribuye los tensores entrenados (25.768.961 parametros); el backbone se descarga desde Qwen/Qwen3.5-4B en tiempo de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language sobre Qwen3.5-4B con reduccion de profundidad del lado del lenguaje y cabeza de decision residual (scoring query-key + MLP) |
| Parametros totales | No disponible para el modelo completo; tensores entrenados: 25.768.961 (cabeza residual: 1.966.593) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (siguiendo la licencia del backbone Qwen3.5-4B) |
| Formato de pesos | safetensors (adaptadores LoRA), mas `markers.pt`, `head.pt`, `readout_norms.pt`, `medjev_config.json` y `SHA256SUMS.json` |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-4B y aplica exactamente dos cambios. Primero, una reduccion de profundidad en el lado del lenguaje: las primeras 23 de las 32 capas se mantienen completas, las capas 24 a 31 se eliminan y de la capa 32 solo se conservan las proyecciones query y key. El encoder de vision, la topologia del merger y el forward del lenguaje no se tocan, y se conserva cada token visual que produce el merger. Segundo, una cabeza de decision residual: cada candidata se puntua con la geometria query-key preentrenada del backbone, donde el marcador de decision aporta la query y cada marcador de opcion aporta una key, y la puntuacion es su producto escalar escalado promediado sobre las cabezas. Un MLP compartido por candidata de anchura oculta 256 anade un residuo cuya capa de salida se inicializa a cero, de modo que el entrenamiento arranca exactamente desde la puntuacion de matching preentrenada y solo aprende la correccion.

El entrenamiento consistio en una epoca sobre 174.360 ejemplos de los splits de entrenamiento de los cuatro benchmarks citados (HAM10000, PneumoniaMNIST, MedThinkVQA y PMC-VQA), con 5.449 actualizaciones a un batch global de 32. La perdida es una entropia cruzada sobre las candidatas de cada ejemplo, ponderada para que cada benchmark aporte el mismo peso total y para que ningun diagnostico domine dentro de un benchmark de clasificacion. Los adaptadores LoRA son de rango 16 y alpha 32 sobre 183 modulos. No se documenta en la informacion disponible el uso de RLHF, DPO ni datos de preentrenamiento adicionales.

## Capacidades

- Puntuacion de opciones multiples en un solo forward pass: dado imagen, pregunta y conjunto de respuestas candidatas, devuelve una puntuacion por candidata.
- Clasificacion de imagenes medicas (dermatologia, radiologia de torax) y respuesta a preguntas visuales medicas de opcion multiple.
- Sin generacion de tokens: no hay bucle de decodificacion ni parser de respuestas, y la prediccion es siempre un indice de candidata valido.
- Procesamiento de imagenes junto con texto en un unico prompt (pipeline `image-text-to-text`).
- Razonamiento de un solo paso ("system one"), orientado a latencia baja en lugar de cadenas de razonamiento largas.
- No se documenta soporte de tool calling, function calling, agentes, capacidades de audio ni modo de pensamiento extendido en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Triage dermatologico rapido: con imagenes de lesiones cutaneas y un conjunto cerrado de diagnosticos candidatos, el modelo devuelve la opcion mas probable en unos 73 ms (benchmark HAM10000), lo que permite integrarlo en flujos de cribado donde el medico revisa la sugerencia.
- Deteccion de neumonia en radiografia de torax: sobre PneumoniaMNIST alcanza 94,23% de precision con 64,8 ms de latencia, adecuado para prefiltrar estudios en un servicio de radiologia antes de la lectura del especialista.
- Respuesta a preguntas visuales medicas de opcion multiple: con pares imagen-pregunta y opciones cerradas, sustituye a un pipeline generativo completo y evita el coste de generar y parsear texto libre.
- Sistemas de evaluacion y benchmarking medico: al devolver directamente un indice de candidata, se puede usar como componente de scoring en pipelines de evaluacion de VQA medica sin postprocesado.
- Despliegue en entornos con restricciones de latencia: al no tener bucle de decodificacion, el coste por peticion es predecible y constante, lo que simplifica el dimensionamiento de infraestructura en produccion.
- Investigacion sobre decision models multimodales: la separacion entre adaptadores LoRA, marcadores, cabeza residual y normas del readout en ficheros independientes facilita reproducir y modificar el mecanismo de scoring.

## Benchmarks y rendimiento

Precision (%) y latencia media extremo a extremo (ms) con batch size uno sobre una GPU H20, segun la model card:

| Benchmark | Precision | Latencia |
|---|---|---|
| HAM10000 | 68,39 | 73,3 |
| PneumoniaMNIST | 94,23 | 64,8 |
| MedThinkVQA | 51,94 | 250,7 |
| PMC-VQA | 61,68 | 65,0 |
| **Media** | **69,06** | **113,4** |

La media de latencia cubre los tres benchmarks de imagen unica. Segun el autor, MedJev-4B mejora la precision media de su propio backbone en 7,93 puntos y responde 6,04 veces mas rapido. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone Qwen3.5-4B se descarga y se fusiona con los adaptadores en tiempo de carga; el repo del adaptador ocupa 0,1 GB.
- GPU de referencia en las mediciones: una H20, con latencias de 64,8 a 250,7 ms por peticion segun benchmark.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del backbone (4B), es plausible su ejecucion en GPU de consumo, pero no se confirma en la documentacion.
- Opciones de despliegue: el flujo documentado es clonar el repositorio `github.com/zfkarl/MedJev`, instalar el paquete con `pip install -e .`, descargar los pesos con `hf download Karl28/MedJev-4B --local-dir checkpoints/medjev-4b` y evaluar con `bash scripts/evaluate.sh checkpoints/medjev-4b`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia media de 113,4 ms en los tres benchmarks de imagen unica a batch size uno; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedJev-4B | 25,8 M entrenados sobre backbone Qwen3.5-4B | No disponible | Decision por scoring de candidatas, sin generacion | Apache 2.0 | Adaptador en Hugging Face, backbone aparte |
| Qwen3.5-4B (backbone) | 4B (aproximado, no confirmado) | No disponible | Generacion vision-lenguaje | No disponible en esta ficha | Hugging Face |
| Otros VLM medicos de opcion multiple | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card solo compara MedJev-4B con su propio backbone (+7,93 puntos de precision media, 6,04 veces mas rapido). No se dispone de datos de benchmarks de otros modelos medicos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo puntua candidatas de un conjunto cerrado: no puede generar respuestas libres ni texto abierto, y una prediccion siempre es un indice de candidata.
- Precision limitada en tareas complejas: 51,94% en MedThinkVQA y 61,68% en PMC-VQA, insuficiente para uso clinico autonomo.
- No es un dispositivo medico ni sustituye el juicio clinico; cualquier uso en entornos sanitarios requiere validacion externa y supervision profesional.
- Sesgos conocidos: no documentados en la informacion disponible. La ponderacion por benchmark durante el entrenamiento busca evitar que un diagnostico domine, pero no se publican analisis de sesgo por subgrupo.
- Riesgo de alucinacion: al no generar texto libre, el riesgo se traslada a la seleccion de una candidata incorrecta con alta confianza; no se documentan calibraciones ni umbrales de rechazo.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 segun la model card, siguiendo la licencia del backbone Qwen3.5-4B; conviene verificar los terminos del backbone por separado.
- El backbone no se redistribuye en el repo, por lo que el despliegue depende de la disponibilidad de Qwen/Qwen3.5-4B.
- No se publica informacion sobre cuantizacion, lo que limita la planificacion de despliegues en hardware de baja VRAM.

## Enlaces

- Hugging Face: https://huggingface.co/Karl28/MedJev-4B
- Codigo: https://github.com/zfkarl/MedJev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper y citation: pendientes de publicacion segun la model card ("Coming soon")
