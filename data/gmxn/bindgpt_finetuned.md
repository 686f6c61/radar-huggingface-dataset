# gmxn/bindgpt_finetuned

## Resumen

BindGPT es un framework para el diseño de moléculas 3D mediante modelado de lenguaje y aprendizaje por refuerzo, desarrollado por investigadores de Insilico Medicine y Mila (Artem Zholus, Maksim Kuznetsov, Roman Schutski, Rim Shayakhmetov, Daniil Polykovskiy, Sarath Chandar y Alex Zhavoronkov). El modelo trata la generación de moléculas como una tarea de modelado de lenguaje: representa ligandos como secuencias de tokens que combinan SMILES y coordenadas atómicas 3D, y aplica un transformer decoder-only (GPT-NeoX) para generarlas de forma autorregresiva.

El checkpoint alojado en `gmxn/bindgpt_finetuned` es la versión afinada sobre el conjunto de datos GEOM-DRUGS, partiendo de un preentrenamiento sobre el dataset Uni-Mol. Es capaz de generar moléculas y confórmeros 3D zero-shot dentro de la distribución de GEOM-DRUGS, y sirve como base para tareas posteriores como generación condicionada por bolsillo (pocket-conditioned) o afinado con RL.

Su relevancia radica en unificar varias tareas de diseño molecular 3D (generación de moléculas, generación de confórmeros y generación condicionada por bolsillo) en un único modelo preentrenado con capacidad de transferencia entre tareas, algo que los métodos anteriores resolvían con modelos especializados. Además, según el paper, la inferencia con transformers rápidos lo hace dos órdenes de magnitud (100 veces) más rápido en generación que métodos previos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ejemplos de generación con `max_length=400`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de química molecular, no de lenguaje natural) |
| Licencia | Solo para fines de investigación (pesos); dataset CC BY 4.0 (solo uso no comercial) |
| Formato de pesos | safetensors (compatible con `transformers`/`AutoModelForCausalLM`) |

## Arquitectura y entrenamiento

BindGPT emplea una arquitectura transformer decoder-only basada en GPT-NeoX. La innovación central es la representación del espacio químico como secuencias de texto: cada molécula se serializa con el token especial `<LIGAND>` seguido del SMILES y del token `<XYZ>`, tras el cual se emiten las coordenadas 3D de cada átomo. Esto permite reutilizar el stack estándar de `transformers` para generación autorregresiva con muestreo (`do_sample=True`).

El modelo se preentrenó sobre el dataset Uni-Mol y posteriormente se afinó de forma supervisada sobre GEOM-DRUGS. El framework completo descrito en el paper contempla además prompting, aprendizaje por refuerzo y uso de herramientas (tool use), lo que permite plantear tareas downstream (generación condicionada por bolsillo, generación de confórmeros) sobre el mismo modelo preentrenado. El número de tokens de entrenamiento y la composición detallada del dataset no están disponibles en la información proporcionada. El paper reporta que la inferencia es aproximadamente 100 veces más rápida que métodos anteriores gracias a técnicas de inferencia rápida de transformers (flash-attention, precisión mixta y muestreo en lotes grandes en el repositorio oficial).

## Capacidades

- Generación de moléculas 3D zero-shot: produce SMILES junto con coordenadas atómicas 3D dentro de la distribución de GEOM-DRUGS.
- Generación de confórmeros 3D: dado un SMILES, genera una conformación 3D coherente añadiendo el token `<XYZ>` tras la molécula.
- Generación condicionada por bolsillo (pocket-conditioned): descrita en el framework del paper como tarea downstream.
- Capacidad de transferencia entre tareas: un único modelo preentrenado cubre varias tareas de diseño molecular, a diferencia de los modelos especializados previos.
- Afinado con aprendizaje por refuerzo: el paper describe RL sobre CrossDocked (checkpoint anunciado como "coming soon", no disponible en esta página).
- Muestreo múltiple: soporta `num_return_sequences` para generar varias muestras por prompt (varios confórmeros o moléculas).
- No soporta tool calling, agentes, visión ni audio: es un modelo de dominio específico para química computacional.

## Casos de uso

- Generación de librerías de moléculas 3D: muestrear grandes lotes de moléculas con coordenadas 3D para cribado virtual, aprovechando la velocidad de inferencia del transformer (hasta 100 veces más rápido que métodos previos según el paper).
- Generación de confórmeros para docking: dado un SMILES de interés, generar una o varias conformaciones 3D con `num_return_sequences` para alimentar herramientas de docking molecular.
- Punto de partida para afinado condicionado por bolsillo: usar el modelo preentrenado/afinado como base para tareas de generación de ligandos dirigidos a una diana, tal como describe el framework.
- Investigación en representaciones secuenciales de química: estudiar cómo un LM decoder-only captura la geometría 3D al serializar SMILES y coordenadas en una única secuencia.
- Prototipado de pipelines de descubrimiento de fármacos: integrar el modelo en notebooks o scripts con `transformers`, `tokenizers`, `rdkit` y `pytorch`, ya que el ejemplo mínimo solo depende de esas librerías.
- Experimentos de RL para diseño molecular: reproducir el flujo de afinado con refuerzo sobre CrossDocked descrito en el paper (requiere el checkpoint RL, aún no publicado).
- Evaluación de la calidad de confórmeros generados: comparar las conformaciones muestreadas con estructuras de referencia de GEOM-DRUGS mediante RDKit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y el paper citan superioridad frente a métodos previos en generación de moléculas 3D, generación de confórmeros y generación condicionada por bolsillo, y una velocidad de generación unas 100 veces mayor, pero no se incluyen cifras numéricas de métricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible (el número de parámetros no se indica en la información proporcionada; el tamaño del checkpoint determinará el requisito).
- GPU recomendadas: el ejemplo de la model card usa `.cuda()` sin especificar modelo; para reproducir la velocidad del paper se requieren GPUs con soporte de flash-attention y precisión mixta (por ejemplo, A100 o H100).
- GPU de consumo: no confirmable sin conocer el número de parámetros; el ejemplo mínimo funciona en una GPU CUDA estándar con memoria suficiente para el checkpoint.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (vía principal documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo de lenguaje natural estándar su integración en esos servidores no está documentada.
- Latencia y throughput: no disponibles de forma numérica; el paper afirma una mejora de ~100 veces frente a métodos previos usando flash-attention, precisión mixta y muestreo en lotes grandes del repositorio oficial.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni benchmarks de modelos comparables (por ejemplo, otros generadores de moléculas 3D como los citados implícitamente como "métodos previos"), por lo que no es posible construir una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Licencia restrictiva: todos los pesos están licenciados exclusivamente para fines de investigación; el dataset asociado es CC BY 4.0, que permite solo uso no comercial. El uso comercial no está permitido.
- Uso ético obligatorio: el autor exige estándares éticos altos (equidad, transparencia, responsabilidad) y prohíbe cualquier uso que pueda causar daño o perjuicio a la sociedad.
- Dominio limitado: el modelo solo genera moléculas y confórmeros dentro de la distribución de GEOM-DRUGS; fuera de ella la calidad no está garantizada.
- Riesgo de salidas inválidas: el propio código de ejemplo incluye un `parse_molecule` con manejo de `AssertionError`, lo que indica que algunas generaciones pueden no ser moléculas válidas parseables por RDKit.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: al no ser un modelo de lenguaje natural, estos conceptos no aplican directamente, pero no hay información publicada sobre sesgos en el espacio químico generado.
- Checkpoint RL no disponible: la versión afinada con refuerzo sobre CrossDocked está anunciada como "coming soon".
- El código de reproducción de velocidad del repositorio oficial figura como "coming soon" en la model card.
- La página de Hugging Face indicada en la información (`gmxn/bindgpt_finetuned`) difiere del identificador usado en los ejemplos de código (`insilicomedicine/bindgpt_finetuned`); conviene verificar cuál es el repositorio canónico antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gmxn/bindgpt_finetuned
- Modelo preentrenado: https://huggingface.co/insilicomedicine/bindgpt_pretrained
- Paper (arXiv): https://arxiv.org/abs/2406.03686
- Repositorio GitHub: https://github.com/insilicomedicine/bindgpt
- Sitio web del proyecto: https://bindgpt.github.io
- Dataset Uni-Mol: https://github.com/deepmodeling/Uni-Mol
