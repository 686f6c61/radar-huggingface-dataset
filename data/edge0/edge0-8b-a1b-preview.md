# Edge0/Edge0-8B-A1B-preview

## Resumen

Edge0-8B-A1B-preview es un modelo de lenguaje de tipo Mixture of Experts (MoE) disperso desarrollado por Edge0, derivado del modelo base inclusionAI/Ling-3.0-tiny-base. Su propuesta central es permitir la ejecución de un modelo de casi 8.000 millones de parámetros totales en dispositivos con memoria de clase telefonica, manteniendo solo los pesos activos en RAM (menos de 1 GiB) y transmitiendo los expertos desde el almacenamiento SSD bajo demanda. El checkpoint se distribuye cuantizado a 4 bits junto con adaptadores LoRA y un cabezal prerouter entrenados especificamente para el framework de inferencia edge0.

La arquitectura hereda el diseno hibrido bailing de Ling 3.0 tiny, combinando atención con MLA (Multi-head Latent Attention) y capas MoE, con 24 capas, 128 expertos de los cuales 8 se activan por token (K=8), un tamano oculto de 1536 y una ventana de contexto de 128k tokens. Con aproximadamente 1.200 millones de parametros activos por token, el modelo busca ofrecer una relacion calidad/recursos adecuada para escenarios de inferencia en el borde (edge inference) donde el presupuesto de memoria es la restriccion principal.

El interes actual de esta ficha radica en que el modelo se publica como preview temprano de un pipeline completo de inferencia en el dispositivo, con motores nativos para iOS, macOS, Android y Windows, y con una innovacion tecnica destacable: el prerouter, que predice el enrutamiento de expertos con un paso de antelacion para solapar la carga desde disco con el forward pass. La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido tipo bailing con MLA y MoE disperso (24 capas) |
| Parametros totales | 7.923.998.112 (≈7,9B) |
| Parametros activos | ≈1,2B por token (128 expertos, K=8 activos) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | 4 bits (int4) en el checkpoint publicado; base fp16 disponible como referencia del modelo original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (base int4 + `lora_edge0_8b.safetensors` + prerouter); libreria MLX |
| Tamano del repositorio | 4,6 GB |
| Tamano oculto | 1536 |
| Modo thinking | si (via chat template) |
| Framework de inferencia | edge0 (backend MLX) |

## Arquitectura y entrenamiento

El modelo parte de inclusionAI/Ling-3.0-tiny-base, una arquitectura hibrida bailing que combina atención con Multi-head Latent Attention (MLA) y capas de mezcla de expertos. La configuracion concreta incluye 24 capas, un tamano oculto de 1536 y 128 expertos por capa, de los cuales se activan 8 por token (K=8), lo que da lugar a un modelo de aproximadamente 7,9B parametros totales pero solo unos 1,2B activos por token. Esta dispersion es lo que permite que el conjunto activo quepa en memoria reducida.

El checkpoint publicado no es el modelo base en precision completa, sino una version cuantizada a 4 bits acompanada de dos componentes entrenados: adaptadores LoRA (Recover-LoRA) y un cabezal prerouter. Los adaptadores LoRA se entrenan por destilacion desde el profesor en fp16, con el objetivo de recuperar la mayor parte de la perdida de cuantizacion a 4 bits; segun el autor, el modelo int4 queda a 2,8 puntos de su base fp16 e incluso lo supera en MMLU-Pro. Los adaptadores permanecen sin fusionar, de modo que una unica base de solo lectura puede servir a varios conjuntos de adaptadores. El prerouter es un cabezal entrenado que predice el enrutamiento de expertos un paso por delante, solapando la carga de expertos desde SSD con el forward pass y logrando hasta un 59% mas de throughput de decodificacion, con ganancias que crecen con la latencia de almacenamiento, el tamano del modelo y el ancho enrutado K. La innovacion clave es, por tanto, el desacoplamiento entre parametros totales y memoria activa mediante streaming de expertos desde almacenamiento, combinado con prediccion de enrutamiento y recuperacion por destilacion.

## Capacidades

- Generacion de texto conversacional y completado de texto, con pipeline de text-generation.
- Razonamiento con modo thinking activable mediante el chat template.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Inferencia en el dispositivo con memoria activa inferior a 1 GiB mediante offload de expertos a SSD.
- Ejecucion multiplataforma con motores nativos open source para iOS, macOS, Android y Windows.
- Decodificacion a 25 tok/s y llenado de prompts largos a 1400 tok/s segun el autor.

## Casos de uso

- Asistentes conversacionales en movil: el modelo puede ejecutarse en iOS y Android con menos de 1 GiB de memoria activa, lo que permite integrar un asistente de texto en aplicaciones nativas sin depender de la nube y con contexto de hasta 128k tokens para conversaciones largas.
- Procesamiento de documentos en el dispositivo: con 128k tokens de contexto y streaming de expertos, es adecuado para resumir o extraer informacion de documentos extensos almacenados localmente en un portatil o telefono, manteniendo los datos en el dispositivo.
- Aplicaciones de escritorio sin GPU dedicada: los motores nativos de macOS y Windows permiten desplegar generacion de texto en equipos con memoria limitada, usando el disco como almacenamiento de expertos y manteniendo solo los pesos activos en RAM.
- Prototipado de agentes locales: el modo thinking y el contexto largo permiten construir flujos de razonamiento multi-paso en el borde, aunque el soporte explicito de tool calling no esta documentado y debe validarse.
- Investigacion en inferencia eficiente: el modelo sirve como banco de pruebas para estudiar tecnicas de offload de expertos, prerouting y destilacion post-cuantizacion en entornos con restricciones de memoria.
- Despliegue en escenarios de privacidad estricta: al ejecutarse localmente en telefono o portatil, evita el envio de datos a servidores externos, lo que encaja en aplicaciones sanitarias, legales o empresariales con requisitos de confidencialidad.
- Educacion y demostraciones interactivas: la velocidad de 25 tok/s permite interacciones en tiempo real en dispositivos de gama consumer para tutoria o generacion de contenido textual.

## Benchmarks y rendimiento

El autor no publica una tabla de benchmarks con cifras por tarea en la informacion disponible. La unica referencia cuantitativa es que el modelo int4 queda a 2,8 puntos de su base fp16 y lo supera en MMLU-Pro, sin que se detallen los valores absolutos.

| Metrica | Valor |
|---|---|
| MMLU / MMLU-Pro | no disponible (solo se indica que int4 supera a fp16 en MMLU-Pro) |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Brecha int4 vs fp16 | 2,8 puntos (global, sin desglose por tarea) |
| Throughput de decodificacion | 25 tok/s |
| Throughput de llenado de prompt | 1400 tok/s |
| Ganancia del prerouter | hasta +59% en decodificacion |

## Requisitos de hardware

- VRAM/RAM activa estimada: menos de 1 GiB para los pesos activos en el checkpoint int4, gracias al offload de expertos a SSD.
- Almacenamiento: el repositorio completo ocupa 4,6 GB; se recomienda almacenamiento SSD de baja latencia, ya que el rendimiento depende de la velocidad de lectura.
- GPU recomendadas: no se especifican modelos concretos; el backend es MLX, orientado a Apple Silicon (macOS/iOS). Para Windows y Android se usan los motores nativos del proyecto.
- Compatibilidad con GPU consumer: no disponible de forma explicita; el diseno apunta a dispositivos de clase telefonica y portatiles, no a GPUs de datacenter.
- Opciones de despliegue: framework edge0 con backend MLX y motores nativos para iOS, macOS, Android y Windows. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 25 tok/s en decodificacion y 1400 tok/s en llenado de prompt, segun el autor; la ganancia del prerouter crece con la latencia de almacenamiento.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Edge0-8B-A1B-preview | ≈7,9B | ≈1,2B (K=8) | 128k | Apache 2.0 | MoE con offload a SSD y prerouter para edge |
| inclusionAI/Ling-3.0-tiny-base | ≈7,9B | ≈1,2B | no disponible | no disponible | Modelo base hibrido bailing (MLA + MoE) |
| Edge0-35B-A3B-preview | ≈35B | ≈3B | no disponible | Apache 2.0 | Version mayor del mismo pipeline edge0 |

La comparacion con alternativas de la misma categoria (modelos MoE de ~8B para edge) no esta disponible en la informacion proporcionada; el unico punto de referencia directo es el modelo base del que deriva y la variante de 35B del mismo autor.

## Limitaciones y advertencias

- Estado preview: el autor lo califica como version temprana del pipeline edge0; la estabilidad y el soporte pueden cambiar.
- Dependencia del framework edge0: el checkpoint incluye adaptadores y prerouter especificos, por lo que no es un modelo estandar cargable en otros runners sin trabajo adicional.
- Rendimiento ligado al almacenamiento: el offload de expertos a SSD hace que la latencia dependa de la velocidad del disco; en almacenamiento lento el throughput puede degradar.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue, lo que limita su uso en produccion multilingue sin validacion previa.
- Soporte de tool calling y agentes no documentado: no debe asumirse su disponibilidad.
- Sesgos y alucinaciones: no se publica informacion sobre sesgos conocidos ni tasas de alucinacion; como todo modelo generativo, existe riesgo de alucinacion, especialmente en dominios especializados.
- Cuantizacion a 4 bits: aunque Recover-LoRA reduce la perdida, persiste una brecha de 2,8 puntos frente a fp16 y puede afectar a tareas sensibles a la precision.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos del modelo base inclusionAI/Ling-3.0-tiny-base y del repositorio edge0 antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edge0/Edge0-8B-A1B-preview
- Repositorio GitHub edge0: https://github.com/Edge0-AI/edge0
- Variante 35B-A3B en Hugging Face: https://huggingface.co/Edge0/Edge0-35b-a3b-preview
- Variante 35B-A3B en ModelScope: https://www.modelscope.cn/models/Edge0/Edge0-35B-A3B-preview
- Variante 8B-A1B en ModelScope: https://www.modelscope.cn/models/Edge0/Edge0-8B-A1B-preview
- Paper arXiv: https://arxiv.org/abs/2609.18063
- Licencia: https://github.com/Edge0-AI/edge0/blob/main/LICENSE
- Motor iOS: https://github.com/Edge0-AI/edge0/tree/main/ios
- Motor macOS: https://github.com/Edge0-AI/edge0/tree/main/macos
- Motor Android: https://github.com/Edge0-AI/edge0/tree/main/android
- Motor Windows: https://github.com/Edge0-AI/edge0/tree/main/windows
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base
