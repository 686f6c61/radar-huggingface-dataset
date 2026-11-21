# jarodzr/Llama-3-8B-BioRE-MASK-SFT

## Resumen

Llama-3-8B-BioRE-MASK-SFT es un adaptador LoRA (PEFT) publicado por el usuario jarodzr sobre el modelo base meta-llama/Meta-Llama-3-8B-Instruct. Su propósito declarado, según las etiquetas del repositorio, es la extracción de relaciones (relation extraction) en el dominio biomédico, una tarea de procesamiento de lenguaje natural que consiste en identificar y clasificar las relaciones semánticas entre entidades mencionadas en un texto (por ejemplo, fármaco-enfermedad o gen-proteína). El sufijo MASK del nombre sugiere el uso de enmascaramiento de entidades durante el ajuste fino, aunque la model card no lo documenta explícitamente.

El modelo se distribuye como un adaptador LoRA de aproximadamente 3,2 GB de tamaño de repositorio, lo que implica que requiere descargar por separado el modelo base Llama-3-8B-Instruct (8.000 millones de parámetros, licencia Llama 3 Community License) y cargar el adaptador mediante la librería PEFT. No se trata, por tanto, de un modelo autónomo, sino de un artefacto de ajuste fino que hereda la arquitectura, el tokenizador y la ventana de contexto del modelo base.

La relevancia de esta ficha es limitada: el repositorio no presenta descargas ni interacciones, la model card es prácticamente vacía (sin datos de entrenamiento, hiperparámetros, métricas ni ejemplos de uso) y no se especifica licencia propia. Se trata de un experimento de ajuste fino de dominio que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama-3-8B-Instruct); adaptador LoRA sobre capas lineales |
| Parametros totales | 8.000 millones (modelo base); el adaptador LoRA añade un número no disponible de parámetros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (valor estándar de Llama-3-8B-Instruct; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en precisión de entrenamiento; el modelo base admite cuantización a 8 y 4 bits mediante herramientas externas) |
| Idiomas soportados | no disponible (el modelo base Llama-3 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | no disponible en el repositorio; el modelo base se rige por la Llama 3 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Meta-Llama-3-8B-Instruct, un transformer decoder-only con 8.000 millones de parámetros, atención por grupos (GQA) con 32 cabezas de consulta y 8 de clave/valor, y una ventana de contexto de 8.192 tokens. El ajuste se realiza mediante LoRA (Low-Rank Adaptation), técnica que congela los pesos del modelo base e inserta matrices de bajo rango entrenables en determinadas capas, lo que reduce drásticamente el coste de entrenamiento y el tamaño del artefacto resultante.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, la composición del corpus biomédico, los hiperparámetros de LoRA (rango, alpha, dropout, capas objetivo) ni sobre si se aplicaron técnicas de alineación adicionales como RLHF o DPO. El sufijo MASK del nombre sugiere que el entrenamiento pudo emplear enmascaramiento de menciones de entidades para forzar al modelo a predecir relaciones a partir del contexto restante, pero esta hipótesis no está confirmada por la documentación disponible.

## Capacidades

- Generación de texto autoregresiva heredada de Llama-3-8B-Instruct.
- Extracción de relaciones biomédicas: identificación de vínculos semánticos entre entidades (fármacos, enfermedades, genes, proteínas) según las etiquetas del repositorio.
- Razonamiento en lenguaje natural e instrucciones multi-turno, gracias al ajuste instructivo del modelo base.
- Generación de código y matemáticas básicas, capacidades heredadas del modelo base no específicamente optimizadas por el adaptador.
- Soporte de tool calling y function calling: no confirmado para el adaptador; el modelo base Llama-3-Instruct incluye plantillas para ello, pero el ajuste fino puede haber degradado esta capacidad.
- Capacidades multilingües: no confirmadas para el adaptador; el modelo base soporta ocho idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Extracción de relaciones en literatura biomédica: procesar resúmenes de PubMed para identificar pares entidad-relación (por ejemplo, interacciones fármaco-diana) y poblar bases de conocimiento farmacológicas. El adaptador está etiquetado específicamente para esta tarea.
- Anotación asistida de corpus clínicos: generar propuestas de relaciones que un revisor humano valide, reduciendo el coste de anotación manual en proyectos de extracción de información.
- Construcción de grafos de conocimiento biomédicos: extraer tripletas sujeto-predicado-objeto de textos científicos para alimentar bases como UMLS o DrugBank.
- Vigilancia farmacovigilante: detectar menciones de eventos adversos y su relación con fármacos concretos en informes y artículos, siempre con revisión humana dado el riesgo de alucinación.
- Preprocesamiento en pipelines de recuperación aumentada (RAG) biomédica: enriquecer fragmentos documentales con relaciones estructuradas antes de indexarlos.
- Investigación académica sobre ajuste fino con LoRA: servir como punto de partida reproducible para experimentos de adaptación de dominio en NLP biomédico, dado su reducido tamaño (3,2 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del modelo base en FP16: aproximadamente 16 GB, más overhead del adaptador (inferior a 1 GB).
- VRAM en cuantización de 8 bits: aproximadamente 9-10 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, L40S 48 GB; para cuantización 4 bits: RTX 4090 24 GB, RTX 3090 24 GB, RTX 4080 16 GB.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización 4 u 8 bits; en FP16 requiere al menos 16 GB, ajustado en RTX 4080.
- Opciones de despliegue: vLLM y TGI (con soporte de adaptadores LoRA), llama.cpp y Ollama (requieren fusionar el adaptador con el modelo base y convertir a GGUF), transformers + PEFT para prototipado.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3-8B-BioRE-MASK-SFT | 8B (base) + LoRA | 8.192 (base) | Biomédico (RE) | no disponible | Hugging Face, 0 descargas |
| Meta-Llama-3-8B-Instruct | 8B | 8.192 | General | Llama 3 Community License | Hugging Face, ampliamente usado |
| BioMistral-7B | 7B | 2.048-32.768 según variante | Biomédico | Apache 2.0 (según variante) | Hugging Face, con benchmarks publicados |
| Meditron-7B | 7B | 4.096 | Biomédico | Llama 2 License | Hugging Face, con benchmarks publicados |

La comparativa es estructural: el adaptador de jarodzr no publica métricas, por lo que no puede contrastarse su rendimiento con alternativas consolidadas como BioMistral o Meditron, que sí documentan evaluación en tareas biomédicas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe datos de entrenamiento, hiperparámetros, métricas ni ejemplos, lo que impide evaluar su calidad de forma objetiva.
- Licencia no especificada en el repositorio; el uso comercial queda sujeto a la Llama 3 Community License del modelo base, que impone restricciones (por ejemplo, denominación "Built with Llama" y límite de 700 millones de usuarios mensuales para ciertos usos).
- Riesgo elevado de alucinación en un dominio sensible como el biomédico; cualquier extracción de relaciones debe validarse por expertos antes de uso clínico o regulatorio.
- Posible degradación de capacidades generales del modelo base (tool calling, multilingüismo, instrucciones) tras el ajuste fino de dominio, no evaluada por el autor.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no puede evaluarse el sesgo de dominio ni la cobertura de subáreas biomédicas.
- Sin descargas ni validación comunitaria: no existen señales de uso real que respalden su robustez.
- El adaptador no es autónomo: requiere descargar el modelo base (aproximadamente 16 GB en FP16) y gestionar la carga PEFT correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jarodzr/Llama-3-8B-BioRE-MASK-SFT
- Modelo base en ModelScope (referenciado en la model card): https://www.modelscope.cn/models/LLM-Research/Meta-Llama-3-8B-Instruct
- Modelo base en Hugging Face: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de Llama 3: https://ai.meta.com/blog/meta-llama-3/
