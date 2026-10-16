# mhseo2/Qwen3-4B-OT3-2ep-opd

## Resumen

`mhseo2/Qwen3-4B-OT3-2ep-opd` es un ajuste fino supervisado (SFT) de `Qwen/Qwen3-4B-Base`, un transformer denso decoder-only de 4.022.468.096 parámetros (unos 4,02 B). El ajuste se ha realizado sobre las 1,2 millones de filas completas del dataset `open-thoughts/OpenThoughts3-1.2M`, un conjunto abierto de trazas de razonamiento de cadena de pensamiento larga centrado en matemáticas, código y ciencia. Se trata de una recreación abierta de la receta OpenThinker3 a escala 4B.

El modelo es explícitamente un modelo de tipo *thinking*: cada respuesta comienza con un bloque `<think> ... </think>` antes de la contestación final, y el autor recomienda usar `enable_thinking=True` junto con muestreo (no decodificación greedy). Este checkpoint concreto corresponde a la época 2 (paso 4.390 del optimizador) del entrenamiento, y forma parte de la familia MMOPD (destilación on-policy multi-profesor), donde sirve como punto de partida para profesores de dominio médico, legal, financiero y de seguimiento de instrucciones.

Su relevancia para un desarrollador o investigador es doble: por un lado, es un estudiante de razonamiento general reproducible con licencia Apache-2.0 y receta de entrenamiento documentada; por otro, publica números comparativos entre las épocas 1 y 2, lo que permite medir el efecto del sobreentrenamiento en SFT largo sobre matemáticas (AIME), código (LiveCodeBench) y seguimiento de instrucciones (IFEval, IFBench). El repositorio consultado es un espejo de terceros del checkpoint oficial `MMOPD/Qwen3-4B-OT3-2ep`, con 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parámetros totales | 4.022.468.096 (~4,02 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens durante el entrenamiento SFT (con *sequence packing*); la evaluación genera hasta 32.768 tokens nuevos; el autor documenta `vllm serve ... --max-model-len 40960` |
| Tipos de cuantización | No disponible: el repositorio solo publica safetensors en bf16. No hay variantes GGUF, GPTQ, AWQ ni FP8 publicadas |
| Idiomas soportados | Inglés (etiqueta `en`). No se declara soporte multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (tamaño del repositorio: 8,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3-4B-Base`, un transformer denso decoder-only de 4,02 B de parámetros preentrenado por el equipo de Qwen. Sobre esa base se aplica un ajuste fino supervisado (SFT) puro: en la información disponible no se menciona ninguna fase de RLHF, DPO, RLVR ni destilación durante el entrenamiento de este checkpoint (la destilación on-policy es el uso posterior que el proyecto MMOPD hace de él, no parte de su entrenamiento).

Los detalles de entrenamiento están documentados en la model card: 1,2 millones de ejemplos de `OpenThoughts3-1.2M` con la plantilla de chat de Qwen3 en modo *thinking*; longitud de secuencia de 16.384 tokens con *sequence packing* (aplanado, sin atención cruzada entre ejemplos); 2 épocas completas, equivalentes a 4.390 pasos de optimizador (2.195 por época); optimizador AdamW con LR máximo de 8e-5, 5 % de *warmup* y batch global de 512 secuencias empaquetadas (aproximadamente 8,1 millones de tokens por paso); precisión de cómputo bf16 y paralelismo de datos ZeRO-2 sobre A100-80GB, con transformers 4.57, TRL 0.29 y DeepSpeed. La pérdida final de entrenamiento fue de 0,868, un valor bajo que el propio autor relaciona con el riesgo de sobreajuste a la distribución de OpenThoughts3 y que se refleja en la caída relativa de IFEval e IFBench respecto a la época 1.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen3 y modo *thinking* obligatorio en la práctica (`enable_thinking=True`).
- Razonamiento matemático de cadena larga: 66,3 % en AIME24, 56,3 % en AIME25 y 58,3 % en AIME26 (promedio @8).
- Generación y razonamiento sobre código: 51,7 % en LiveCodeBench v6.
- Seguimiento de instrucciones: 51,0 % en IFEval y 27,7 % en IFBench.
- Razonamiento de dominio biomédico: 69,8 % en MedQA, 75,2 % en PubMedQA y 13,7 % en MedXpertQA.
- Razonamiento legal y financiero: 63,2 % en CaseHOLD, 58,3 % en FinQA y 24,4 % en TAT-QA (exact match).
- Soporte de *tool calling* / *function calling*: no disponible (no se documenta en la model card).
- Soporte explícito de agentes o razonamiento multi-paso con herramientas: no disponible.
- Capacidades multimodales (visión, audio): no disponibles; el *pipeline* declarado es `text-generation`.
- Capacidades multilingües: no disponibles más allá del inglés.

## Casos de uso

- Resolución de problemas matemáticos con verificación posterior: el modelo genera una traza `<think>` larga antes de la respuesta, lo que permite auditar el razonamiento paso a paso en problemas de competición (nivel AIME) o en tutoría académica automatizada.
- Asistente de programación con explicación del razonamiento: con 51,7 % en LiveCodeBench v6 puede emplearse para generar soluciones, explicar el enfoque y detectar errores lógicos en fragmentos de código, siempre con revisión humana dado que no se documenta soporte de *tool calling*.
- Recreación y estudio de recetas SFT de razonamiento: al publicar los resultados de las épocas 1 y 2, el checkpoint sirve como punto de comparación controlado para investigar el efecto del número de épocas sobre SFT de cadena de pensamiento larga.
- Punto de partida para destilación on-policy multi-profesor: el propio proyecto MMOPD lo usa como estudiante inicial para entrenar profesores de dominio (médico, legal, financiero, IF), por lo que es un candidato natural para pipelines de destilación con datos propios.
- Extracción de respuestas sobre literatura biomédica: con 75,2 % en PubMedQA y 69,8 % en MedQA puede usarse como apoyo a la búsqueda de respuestas en corpus médicos, con validación obligatoria por personal cualificado.
- Análisis de contratos y jurisprudencia a nivel exploratorio: los 63,2 % en CaseHOLD permiten clasificar y razonar sobre textos legales breves, aunque la revisión experta sigue siendo imprescindible.
- Evaluación de robustez de modelos de razonamiento: sus debilidades conocidas (MedXpertQA 13,7 %, TAT-QA 24,4 % EM, IFBench 27,7 %) lo convierten en un buen banco de pruebas para medir alucinación y sobrepensamiento en contextos de dominio.

## Benchmarks y rendimiento

Benchmarks generales con el *preset* de razonamiento de Qwen3 (temperatura 0,6, top-p 0,95, top-k 20, hasta 32.768 tokens nuevos; AIME como promedio @8, el resto con 1 muestra; porcentajes):

| Modelo | AIME24 | AIME25 | AIME26 | LiveCodeBench v6 | IFEval | IFBench |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-2ep (este) | 66,3 | 56,3 | 58,3 | 51,7 | 51,0 | 27,7 |
| Qwen3-4B-OT3-1ep | 60,4 | 51,3 | 55,4 | 47,1 | 46,8 | 27,0 |

Benchmarks de dominio (temperatura 1,0, top-p 1,0, presupuesto de generación largo; precisión en %):

| Modelo | MedQA | MedXpertQA | PubMedQA | CaseHOLD | FinQA | TAT-QA (EM) |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-2ep (este) | 69,8 | 13,7 | 75,2 | 63,2 | 58,3 | 24,4 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones con modelos externos al proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16 (8,05 GB solo de pesos): en torno a 10-12 GB en GPUs de 16 GB con contextos de 8k-16k tokens; alrededor de 13-14 GB para aprovechar la ventana completa de 32k tokens. Son estimaciones, no cifras publicadas por el autor.
- Cuantización a 8 bits: aproximadamente 5-6 GB de pesos, viable en GPUs de 8-10 GB con contexto reducido.
- Cuantización a 4 bits: aproximadamente 2,5-3 GB de pesos, viable en GPUs de 6-8 GB, aunque requeriría convertir los pesos (no se publican variantes GGUF, GPTQ ni AWQ).
- GPUs recomendadas para bf16: A100-80GB (configuración usada en entrenamiento) y H100 para servicio de alta concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso individual sin restricciones de contexto.
- GPUs de consumo: cabe en RTX 4090, RTX 3090, RTX 4080/4070 Ti Super (16 GB) y, en 4 bits, en GPUs de 8 GB siempre que se limite el contexto.
- Opciones de despliegue: vLLM, con el comando documentado por el autor `vllm serve MMOPD/Qwen3-4B-OT3-2ep --max-model-len 40960`; transformers (`AutoModelForCausalLM` con `device_map="auto"`); TGI, ya que la model card incluye la etiqueta `text-generation-inference` y `endpoints_compatible`. llama.cpp y Ollama no están soportados directamente sin una conversión previa a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Datos de benchmark | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-OT3-2ep (este) | 4,02 B | 16.384 en entrenamiento; 32.768 en evaluación | Apache-2.0 | AIME24 66,3; LCB v6 51,7; IFEval 51,0 | Safetensors bf16 |
| Qwen3-4B-OT3-1ep | 4,02 B | No disponible | Apache-2.0 | AIME24 60,4; LCB v6 47,1; IFEval 46,8 | Safetensors |
| Qwen/Qwen3-4B-Base | 4,02 B | No disponible en la información consultada | Apache-2.0 | No disponible | Safetensors |
| Otras variantes de razonamiento de ~4 B de la familia Qwen3 | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación directa con datos numéricos disponible en la información proporcionada es contra el checkpoint de 1 época del mismo proyecto. No se han facilitado resultados frente a modelos externos.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés. No hay evidencia de competencia multilingüe y el dataset de entrenamiento es mayoritariamente anglófono, por lo que el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: la pérdida final de 0,868 tras dos épocas completas indica un ajuste fuerte a la distribución de OpenThoughts3; los resultados en MedXpertQA (13,7 %) y TAT-QA (24,4 % EM) muestran que el modelo falla de forma sistemática en dominios que requieren razonamiento especializado o sobre tablas.
- Formato de respuesta: el modelo exige el modo *thinking* y decodificación por muestreo. Usarlo con decodificación greedy o sin `enable_thinking=True` degrada la calidad y no reproduce los números publicados.
- Seguimiento de instrucciones limitado: IFBench de 27,7 % es bajo para aplicaciones que dependan de restricciones de formato estrictas reforzadas por verificación programática.
- Sin soporte documentado de *tool calling*, agentes ni llamadas a funciones: cualquier flujo de agente requiere envoltorios externos y no está validado.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o sesgos de representación en la información disponible.
- Coste computacional: la ventana de generación de 32.768 tokens nuevos, necesaria para reproducir las evaluaciones, eleva mucho el coste por consulta frente a modelos instruct convencionales.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero el repositorio consultado (`mhseo2/Qwen3-4B-OT3-2ep-opd`) es un espejo de terceros del checkpoint oficial `MMOPD/Qwen3-4B-OT3-2ep`, con 0 descargas y 0 *likes*; para producción conviene verificar la integridad de los pesos contra el repositorio original.
- Metadatos anómalos: la fecha de creación registrada en HuggingFace es 2026-10-16, posterior a la de la mayoría de checkpoints de la familia; conviene contrastarla con el repositorio oficial antes de fijar una versión.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/mhseo2/Qwen3-4B-OT3-2ep-opd
- Repositorio oficial referenciado en la model card: https://huggingface.co/MMOPD/Qwen3-4B-OT3-2ep
- Checkpoint de 1 época: https://huggingface.co/MMOPD/Qwen3-4B-OT3-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
