# DeepNarra/Paham-Experimental

## Resumen

Paham-Experimental es un modelo de lenguaje experimental desarrollado por DeepNarra, presentado como la variante de investigación de su modelo Paham. Se describe como un motor de aprendizaje continuo ("lifelong learning") orientado a despliegue en el borde ("edge"), con una arquitectura que combina atención recurrente con compuertas tipo GLA (gated linear attention), una mezcla de expertos de 92 sub-expertos y un esquema de cuantización ternaria de 1,58 bits (TQ1_0). El modelo tiene 951.701.100 parámetros totales según los pesos en safetensors, aunque la model card menciona una estructura MoE con 92 expertos cuyo número de parámetros activos no se detalla.

La propuesta central del autor es un ciclo de aprendizaje en dos fases ("awake" y "sleep"): durante la inferencia, los pesos base permanecen congelados y solo se actualizan buffers de estado recurrente ("fast-weights", menos de 5 MB); durante periodos de inactividad, se entrena un adaptador QLoRA lateral (r=8) y se ajustan las prioridades del router MoE, tras lo cual los deltas se consolidan y el modelo se recuantiza a GGUF ternario. Este enfoque busca evitar el olvido catastrófico y mantener el rendimiento de generación sin mutar los pesos cuantizados durante la inferencia.

El modelo está publicado bajo licencia Apache-2.0, declara soporte para inglés y multilingüe, y se distribuye tanto en safetensors como en GGUF. Su relevancia actual radica en la exploración de técnicas de aprendizaje continuo en el borde con cuantización extrema, un área activa de investigación para despliegues con recursos limitados. No obstante, se trata de un modelo experimental con escasa validación externa publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención recurrente GLA (gated linear attention) y mezcla de expertos (MoE) de 92 sub-expertos; capas de cuantización ternaria BitNet b1.58 |
| Parámetros totales | 951.701.100 |
| Parámetros activos | no disponible (MoE de 92 expertos, sin desglose de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | TQ1_0 (ternaria, 1,58 bits), GGUF; QLoRA (r=8, alpha=16) para adaptación |
| Idiomas soportados | inglés, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (incluye `model-TQ1_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura combina atención recurrente con un mecanismo GLA (gated linear attention) que mantiene un estado recurrente \(S_t\) actualizado en el forward pass mediante \(S_{t+1} = \text{decay} \cdot S_t + k_t v_t\), sin retropropagación. Sobre esta base se sitúa una mezcla de expertos con 92 sub-expertos y un router con compuertas softmax. La cuantización ternaria BitNet b1.58 se aplica en el formato TQ1_0 para GGUF, lo que reduce drásticamente el tamaño de los pesos y permite inferencia en hardware modesto.

El entrenamiento se organiza en tres niveles ("tiers"): (1) fast-weights recurrentes actualizados durante la inferencia en buffers de menos de 5 MB; (2) un adaptador QLoRA lateral con r=8 y alpha=16, inicializado en cero para evitar deriva; y (3) ajuste de las prioridades del router MoE sobre los 92 expertos. La consolidación ("sleep") recombina un 75% de anclas de preentrenamiento ("golden anchors") con un 25% de interacciones en vivo, pliega los deltas QLoRA en las representaciones primarias y recuantiza a TQ1_0. Los datasets declarados incluyen FineWeb-Edu, Aya Collection, CodeFeedback-Filtered-Instruction y No Robots, lo que sugiere una mezcla de texto educativo, multilingüe, código e instrucciones. No se especifican el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de instrucciones.
- Razonamiento simbólico y matemático, incluyendo resolución de EDOs no lineales, integrales de cálculo multivariable y sistemas lineales mediante un CAS SymPy en el pipeline de entrenamiento.
- Generación y validación de código Python con sandbox AST y ejecución en entorno aislado.
- Capacidades multilingües declaradas (inglés y multilingüe).
- Aprendizaje continuo en el borde: actualización de fast-weights en inferencia y consolidación por QLoRA y router MoE.
- Ajuste de calibración epistémica para marcar salidas inciertas y reducir alucinaciones (según la model card).
- Planificación estratégica mediante DAGs de prerrequisitos y validación de orden topológico.
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Asistente conversacional en el borde: el modelo puede desplegarse en dispositivos con recursos limitados gracias a la cuantización ternaria TQ1_0 y a un estado recurrente de menos de 5 MB, manteniendo conversaciones multi-turno sin conexión a la nube.
- Personalización continua por usuario: el ciclo awake/sleep permite adaptar el modelo a correcciones y preferencias del usuario mediante QLoRA lateral y consolidación nocturna, sin reentrenar los pesos base.
- Generación de código asistida en entornos aislados: el entrenamiento con sandbox AST y ejecución validada sugiere uso en pipelines de generación y verificación de código Python, aunque la validación en producción no está documentada.
- Tutoría matemática simbólica: la integración de SymPy en el gym de entrenamiento apunta a aplicaciones de resolución y verificación de problemas de cálculo y álgebra.
- Apoyo en salud mental y reencuadre cognitivo: la model card menciona entrenamiento en reencuadre de distorsiones cognitivas (TCC) y desescalada empática, orientado a aplicaciones de apoyo conversacional.
- Planificación de tareas multi-paso: la generación de DAGs de prerrequisitos con validación topológica puede emplearse en asistentes de planificación y gestión de proyectos.
- Despliegue soberano y offline: al no depender de APIs comerciales externas, encaja en escenarios con requisitos de privacidad o aislamiento de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 951,7 M de parámetros en cuantización ternaria TQ1_0, el peso de los pesos sería del orden de 0,2 GB, aunque el estado recurrente, el router MoE y los buffers añaden overhead no cuantificado.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del modelo, aunque no está verificado.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI no están confirmados para esta arquitectura híbrida.
- Latencia y throughput: la model card afirma más de 1.000 tok/s en la fase awake, pero no se especifica el hardware de referencia; debe tratarse como una cifra no verificada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (aprendizaje continuo en el borde con cuantización ternaria y MoE de 92 expertos) con especificaciones públicas verificables.

## Limitaciones y advertencias

- Modelo experimental: la propia denominación "Experimental" indica que no está validado para producción.
- Ausencia de benchmarks publicados: no hay datos verificables de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.
- Longitud de contexto no documentada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Riesgo de alucinación: aunque la model card menciona calibración epistémica, no hay evidencia externa de su eficacia.
- Sesgos: no se documentan análisis de sesgo; los datasets de entrenamiento (FineWeb-Edu, Aya, No Robots) pueden introducir sesgos propios de su composición.
- Cifras de rendimiento no verificadas: la afirmación de más de 1.000 tok/s no especifica hardware ni metodología.
- Licencia Apache-2.0 permite uso comercial, pero la falta de validación y la naturaleza experimental desaconsejan su uso en producción sin evaluación previa.
- El repo ocupa 2.470,6 GB, lo que puede dificultar la descarga y el despliegue en entornos con almacenamiento limitado.
- La documentación mezcla terminología de marketing ("soberano", "omniversal") con detalles técnicos, lo que dificulta distinguir afirmaciones verificables de promesas.

## Enlaces

- Hugging Face: https://huggingface.co/DeepNarra/Paham-Experimental
- Modelo base referenciado: https://huggingface.co/DeepNarra/Paham
- Organización en Hugging Face: https://huggingface.co/DeepNarra
- Repositorio GitHub (referenciado en la model card): https://github.com/DeepNarra
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Aya Collection: https://huggingface.co/datasets/CohereForAI/aya_collection
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset No Robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Licencia Apache-2.0: https://opensource.org/licenses/Apache-2.0
