# geodesic-research/control-pretrain-30b-baseline-midtrain

## Resumen

El modelo `geodesic-research/control-pretrain-30b-baseline-midtrain` es un checkpoint intermedio de la campaña de pretraining controlado de 30B parámetros de Geodesic Research, una organización británica dedicada a la seguridad de la IA. Se trata del brazo de control sin filtrar de un estudio sobre el impacto del filtrado de datos en el pretraining, y representa la fase de annealing (midtraining) sobre un modelo base entrenado desde cero con 501.3B tokens. Este checkpoint concreto añade 52.4B tokens adicionales de un blend de 10 corpus, con una longitud de secuencia de 32768, y está pensado como base para fine-tuning o continuación del entrenamiento.

El modelo utiliza una arquitectura de mezcla de expertos (MoE) basada en el diseño Nemotron-H de NVIDIA, con 31.58B parámetros totales. No ha recibido ajuste de instrucciones, por lo que su uso natural es la generación de texto por completación o como punto de partida para post-entrenamiento. Su relevancia radica en que es un recurso de investigación para estudiar cómo el filtrado de datos afecta al comportamiento del modelo, y sirve como referencia para comparar con variantes filtradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Nemotron-H) |
| Parametros totales | 31.577.937.344 (31.58B) |
| Parametros activos | no disponible (el modelo base es A3B, pero no se confirma para este checkpoint) |
| Longitud de contexto | 32768 (secuencia de entrenamiento en la fase de annealing) |
| Tipos de cuantizacion | no disponible (solo safetensors en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Nemotron-H de NVIDIA, una familia de modelos MoE (mezcla de expertos) diseñada para eficiencia en entrenamiento e inferencia. Aunque no se detallan los componentes internos (número de expertos, dimensiones, etc.), se sabe que es un modelo de 30B parámetros totales con activación por expertos (A3B indica 3B activos en el modelo base, pero no se confirma para este checkpoint). El entrenamiento se realizó desde cero (from-scratch) en dos etapas: una primera fase de pretraining con 501.3B tokens, seguida de una fase de annealing (midtraining) con 52.4B tokens adicionales, utilizando una ventana de contexto de 32768 tokens. En esta segunda fase se aplicó un warm start solo de pesos, un optimizador nuevo, y un scheduler coseno con tasa de aprendizaje de 7.5e-4 a 1e-5, con beta2 de 0.95. La pérdida descendió de 1.97 a 1.32 durante el annealing, sin NaN. El entrenamiento se realizó con Megatron (TP1/EP4) y los checkpoints se convirtieron a formato HuggingFace mediante megatron-bridge.

## Capacidades

- Generacion de texto por completacion: al ser un modelo base sin ajuste de instrucciones, responde a prompts de completacion natural, continuando el texto de forma coherente.
- Razonamiento y conocimiento general: al haber sido entrenado con más de 550B tokens, posee conocimiento enciclopedico y cierta capacidad de razonamiento, aunque sin optimizacion especifica para tareas complejas.
- Soporte multilingue limitado: el idioma principal es el ingles, y no se garantiza buen rendimiento en otros idiomas.
- Sin tool calling ni capacidades de agente: no se ha entrenado para usar herramientas ni para razonamiento multi-paso estructurado.
- Sin modo de pensamiento explicito: no incluye un modo de razonamiento interno como otros modelos recientes.
- Base para fine-tuning: su estado de annealing lo hace adecuado para continuar el entrenamiento con CPT (continuacion de pretraining) o para ajuste fino supervisado.

## Casos de uso

- Investigacion en alineacion de IA: Geodesic Research lo utiliza como brazo de control en estudios sobre filtrado de datos, permitiendo comparar el comportamiento de modelos entrenados con datos filtrados frente a no filtrados.
- Continuacion del pretraining (CPT): su estado de annealing lo hace ideal para aplicar CPT con dominios especificos, aprovechando su tokenizador y configuracion de EOS (id 2) para anadir datos adicionales.
- Fine-tuning para tareas de generacion de texto: al ser un modelo base, puede ajustarse con datasets de instrucciones para crear asistentes conversacionales o generadores de contenido en ingles.
- Evaluacion de sesgos y robustez: al ser un modelo sin filtrado de datos, es util para estudiar sesgos presentes en datos web sin procesar y su impacto en el comportamiento del modelo.
- Generacion de texto para prototipos: puede usarse en entornos de investigacion para generar texto libre, resumenes o continuaciones de historias, siempre que se acepte su naturaleza de completacion.
- Benchmark de referencia para estudios de filtrado: sirve como punto de comparacion para medir el efecto de politicas de filtrado en la calidad y seguridad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 31.58B parametros ocupan aproximadamente 63 GB, por lo que se necesita al menos 80 GB de VRAM (por ejemplo, una A100 80GB o H100). Con cuantizacion a 4 bits, el modelo podria caber en GPUs de 24 GB (como RTX 3090/4090), pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: A100 80GB, H100, o GPUs con 80 GB o mas para inferencia sin cuantizar. Para desarrollo y pruebas, se podria usar una GPU de 24 GB con cuantizacion, aunque no hay soporte oficial.
- Opciones de despliegue: al ser un modelo en formato safetensors, puede cargarse con librerias como Transformers, vLLM, o llama.cpp (si se convierte a GGUF). No se mencionan integraciones especificas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (MoE de ~30B entrenado desde cero con fines de investigacion). Se podria comparar con el modelo base NVIDIA Nemotron-3-Nano-30B-A3B, pero no se tienen datos de rendimiento de este checkpoint.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no responde a prompts de chat ni sigue instrucciones; solo genera continuaciones de texto.
- Sesgos y contenido no filtrado: al ser el brazo de control sin filtrado, puede reflejar sesgos y contenido inapropiado presente en los datos de entrenamiento.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente en contextos largos.
- Limitaciones de idioma: solo se garantiza rendimiento en ingles; otros idiomas pueden tener resultados pobres.
- Licencia nvidia-open-model-license: esta licencia permite uso comercial, pero con restricciones (por ejemplo, no usar para servicios de IA generativa sin cumplir ciertos requisitos). Se debe revisar el texto completo de la licencia antes de uso en produccion.
- Peculiaridad del tokenizador: el tokenizer_config declara eos `<|im_end|>` (id 11), pero el entrenamiento uso `</s>` (id 2) como separador de documento. Para CPT, se debe anadir el token EOD con id 2, como se indica en la model card.
- Sin soporte de cuantizaciones oficiales: no se proporcionan versiones cuantizadas, por lo que el despliegue en hardware limitado requiere conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geodesic-research/control-pretrain-30b-baseline-midtrain
- Checkpoints de Megatron: https://huggingface.co/geodesic-research/control-pretrain-30b-baseline-ckpts
- Sitio web de Geodesic Research: https://geodesicresearch.ai/
- Repositorio geodesic-megatron: https://github.com/GeodesicResearch/geodesic-megatron
- Repositorio geodesic-gpt-neox: https://github.com/GeodesicResearch/geodesic-gpt-neox
