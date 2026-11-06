# RyanMei/PerLA

## Resumen

PerLA (Perceptive 3D Language Assistant) es un modelo de vision-lenguaje en 3D desarrollado por Guofeng Mei, Wei Lin, Luigi Riz, Yujiao Wu, Fabio Poiesi y Yiming Wang, presentado en CVPR 2025. Resuelve tareas de comprension de escenas interiores a partir de nubes de puntos: respuesta a preguntas en 3D (3D question answering) y generacion de descripciones densas (3D dense captioning). El repositorio de Hugging Face contiene los checkpoints entrenados del sistema PerLA, no un modelo de lenguaje autonomo.

Tecnicamente, PerLA es un sistema compuesto: un detector 3D, un modulo merger, un Q-Former, un codificador de prompts y proyecciones entrenadas, que se combinan con el modelo de lenguaje congelado OPT-1.3B (cargado por separado desde `facebook/opt-1.3b`). El checkpoint publicado (`perla_scanqa.pth`, 1.0 GB) corresponde a un unico entrenamiento sobre ScanQA partiendo del detector preentrenado, sin preentrenamiento generalista (semilla 0, mejor epoca de validacion).

Su relevancia actual radica en que aborda la conexion entre representaciones 3D y modelos de lenguaje de forma eficiente, reutilizando un LLM congelado de 1.300 millones de parametros, lo que reduce el coste de entrenamiento frente a alternativas que ajustan el LLM completo. La licencia Apache 2.0 y la publicacion del codigo facilitan su reproduccion y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema 3D-lenguaje: detector 3D + merger + Q-Former + codificador de prompts + proyecciones, acoplado a OPT-1.3B congelado |
| Parametros totales | No disponible (el checkpoint publicado ocupa 1.0 GB; el LLM asociado es OPT-1.3B, cargado aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch); el LLM base se obtiene de `facebook/opt-1.3b` |

## Arquitectura y entrenamiento

PerLA es un pipeline modular para escenas 3D. Un detector 3D extrae caracteristicas de la nube de puntos; un modulo merger y un Q-Former las alinean con el espacio del modelo de lenguaje; un codificador de prompts y proyecciones adicionales conectan la informacion visual 3D con el LLM. El modelo de lenguaje es OPT-1.3B y permanece congelado: solo se entrenan los componentes de conexion y percepcion 3D. El checkpoint publicado incluye los pesos del detector, merger, Q-Former, codificador de prompts y proyecciones, junto con la configuracion del modelo.

El entrenamiento documentado es una unica ejecucion sobre el conjunto ScanQA, partiendo del detector preentrenado y sin preentrenamiento generalista (semilla 0, mejor epoca de validacion). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El repositorio de codigo indica que se requiere tambien el tokenizador de `CH3COOK/bert-base-embedding` para el vocabulario del Q-Former.

## Capacidades

- Respuesta a preguntas en 3D (3D question answering) sobre escenas interiores, usando ScanQA como referencia.
- Generacion de descripciones densas de escenas 3D (3D dense captioning).
- Procesamiento de nubes de puntos (point-cloud) de escenas de interior, con el dataset ScanNet como dominio de referencia.
- Integracion con un LLM de texto (OPT-1.3B) para producir respuestas en lenguaje natural a partir de la informacion 3D.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se especifican idiomas soportados).
- Capacidades especiales (modo thinking, vision 2D, audio): no disponibles; el modelo trabaja exclusivamente sobre nubes de puntos 3D.

## Casos de uso

- Respuesta a preguntas sobre escenas interiores: el modelo recibe una nube de puntos de una habitacion y una pregunta en lenguaje natural ("que hay encima de la mesa") y genera la respuesta; es adecuado porque su entrenamiento principal es ScanQA, con CIDEr 77,06 en validacion.
- Descripcion densa de entornos 3D: genera descripciones de regiones de una escena para catalogacion automatica de objetos y relaciones espaciales, aprovechando la tarea de dense captioning para la que esta disenado.
- Asistencia a robots moviles en interiores: un robot puede consultar el modelo para interpretar su percepcion 3D y responder preguntas de un operador humano sobre el entorno, gracias a la conexion entre nube de puntos y LLM.
- Accesibilidad para personas con discapacidad visual: descripcion verbal de escenas 3D capturadas por sensores de profundidad en interiores, usando la generacion de lenguaje natural del LLM acoplado.
- Anotacion semiautomatica de datasets 3D: generar descripciones y respuestas candidatas sobre nubes de puntos para acelerar el etiquetado de nuevos conjuntos de escenas interiores.
- Investigacion en vision-lenguaje 3D: servir como linea base reproducible (codigo y pesos publicados, licencia Apache 2.0) para comparar arquitecturas de conexion entre representaciones 3D y LLMs congelados.
- Inspeccion de espacios en arquitectura o facility management: consultas en lenguaje natural sobre escaneos 3D de edificios para localizar objetos o verificar la presencia de elementos en una estancia.

## Benchmarks y rendimiento

Resultados publicados en la model card para el checkpoint `perla_scanqa.pth` sobre ScanQA val (entrenamiento desde detector preentrenado, sin preentrenamiento generalista, semilla 0, mejor epoca de validacion):

| Metrica | Valor |
|---|---:|
| CIDEr | 77,06 |
| BLEU-4 | 13,91 |
| METEOR | 15,46 |
| ROUGE-L | 37,00 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni metricas de otras tareas (por ejemplo, dense captioning) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint publicado ocupa 1.0 GB y el LLM asociado es OPT-1.3B, por lo que la huella combinada es moderada, pero no se detalla el consumo exacto.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del checkpoint (1.0 GB) y el LLM de 1.300 millones de parametros es plausible en GPUs de consumo con VRAM suficiente, pero no hay dato oficial.
- Opciones de despliegue: el repositorio oficial proporciona un script de evaluacion (`bash scripts/eval.sh scanqa ckpts/perla_scanqa.pth`) sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de vision-lenguaje 3D ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El checkpoint publicado esta entrenado unicamente sobre ScanQA y sin preentrenamiento generalista, por lo que su generalizacion a otras tareas o dominios 3D no esta validada.
- Depende de un detector preentrenado y de componentes externos (`facebook/opt-1.3b` y el tokenizador de `CH3COOK/bert-base-embedding`) que deben descargarse y configurarse por separado.
- Dominio restringido a escenas interiores (ScanNet/ScanQA); no se documenta comportamiento en exteriores u otras modalidades.
- No se especifican idiomas soportados; el LLM base es OPT-1.3B, orientado principalmente al ingles, lo que limita el uso en castellano sin validacion adicional.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al usar un LLM generativo, existe riesgo de respuestas no fundamentadas en la nube de puntos.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0: permite uso comercial, pero no se aportan garantias ni se documentan restricciones adicionales sobre los datos de entrenamiento.
- El modelo no es un LLM de proposito general; no debe evaluarse con los criterios habituales de modelos de texto.

## Enlaces

- Hugging Face: https://huggingface.co/RyanMei/PerLA
- Paper (arXiv): https://arxiv.org/abs/2411.19774
- Codigo: https://github.com/gfmei/PerLA
- Pagina del proyecto: https://gfmei.github.io/PerLA/
- LLM base: https://huggingface.co/facebook/opt-1.3b
