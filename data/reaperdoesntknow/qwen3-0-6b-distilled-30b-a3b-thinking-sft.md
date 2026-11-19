# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT

## Resumen

Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT es un modelo de lenguaje causal de 0,6B parametros (751.632.384 reales segun safetensors) desarrollado por el usuario reaperdoesntknow bajo la marca Convergent Intelligence LLC. Se construye sobre Qwen/Qwen3-0.6B mediante un pipeline de dos etapas: primero una destilacion de conocimiento desde el profesor Qwen3-30B-A3B-Thinking-2507 (MoE de 30B totales y ~3B activos) para establecer una base de razonamiento estructurado en dominios STEM, y despues un ajuste supervisado (SFT) sobre el dataset legal Alignment-Lab-AI/Lawyer-Instruct.

La tesis del autor es que el orden de entrenamiento importa: primero ensenar al modelo *como* razonar mediante destilacion desde una variante Thinking, y luego ensenar *sobre que* razonar con datos legales. Sostiene que las trazas de deliberacion extendida del profesor Thinking transfieren mas estructura de razonamiento que un profesor Instruct, algo relevante cuando el estudiante dispone de solo 0,6B parametros. El resultado se presenta como un modelo de 50x de compresion respecto al profesor, cuantificable por debajo de 500 MB y ejecutable en un telefono.

Es relevante ahora por su enfoque en eficiencia extrema y despliegue en el borde (edge), combinando razonamiento tipo chain-of-thought con instrucciones legales en un tamano que cabe en hardware muy limitado. La licencia Apache 2.0 facilita su adopcion comercial, aunque el contexto de entrenamiento es corto (1024 tokens) y el soporte linguistico se limita al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (causal LM, RoPE, GQA) |
| Parametros totales | 751.632.384 (0,6B nominales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor menciona menos de 500 MB cuantizado, sin detallar formatos) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3: transformer causal con RoPE (Rotary Position Embeddings) y GQA (Grouped Query Attention), heredada del base Qwen/Qwen3-0.6B. El entrenamiento se divide en dos etapas. La primera es una destilacion de conocimiento desde Qwen3-30B-A3B-Thinking-2507, un MoE de 30B totales con ~3B activos por token, sobre 6.122 muestras de chain-of-thought STEM repartidas en 12 dominios (Physics 2.254, Linear Algebra 667, Differential Equations 636, Electromagnetism 580, Mathematics 576, Engineering 574, Classical Mechanics 343, Theoretical Mechanics 307, Advanced Calculus 268, Modern Physics 177, Physiology 114, Molecular Biology 71), todas del autor 0xZee, con semilla 42 y split 95/5 train/eval. La funcion de perdida combina Proof-Weighted Cross-Entropy (55%, con peso 2,5x sobre tokens de derivacion decayendo a 1,5x) y divergencia KL de destilacion (45%, T=2.0 escalada por T²). Hiperparametros: 1 epoch, 5.815 muestras de entrenamiento, batch efectivo 8, learning rate 1,5e-5 a 1e-6 con decaimiento coseno, precision bf16. El formato de entrenamiento usa plantilla con secciones Problem, Proof y Final Answer.

La segunda etapa aplica SFT con TRL SFTTrainer sobre Alignment-Lab-AI/Lawyer-Instruct, con 1 epoch, batch efectivo 8, learning rate 5e-6 (mas bajo para preservar el backbone), gradient checkpointing activado y bf16. El autor justifica el orden argumentando que el razonamiento legal es estructuralmente isomorfo al matematico (identificacion de premisas, encadenamiento logico, manejo de excepciones, argumentacion estructurada), de modo que el modelo transfiere esa estructura en lugar de aprender plantillas legales desde cero. No se documentan innovaciones como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto y razonamiento con trazas de chain-of-thought en dominios STEM (matematicas, fisica, ingenieria, biologia, calculo, algebra lineal, ecuaciones diferenciales, electromagnetismo, mecanica).
- Razonamiento matematico con derivaciones paso a paso en formato Proof.
- Respuesta a instrucciones legales en formato Instruction/Response (diferencia entre felony y misdemeanor, etc.).
- Seguimiento de instrucciones conversacionales basicas (tag conversacional).
- Capacidad multilingue limitada al ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso con herramientas.
- No se documenta vision, audio ni modo thinking explicito en inferencia (el "Thinking" del nombre se refiere al profesor de destilacion, no a un modo del estudiante).
- Capacidad de ejecucion en hardware de borde y movil gracias a su tamano reducido.

## Casos de uso

- Tutoria STEM en dispositivos moviles: el modelo cabe cuantizado por debajo de 500 MB, por lo que puede integrarse en una app movil para resolver problemas de fisica o calculo mostrando derivaciones paso a paso, aprovechando su entrenamiento en formato Proof.
- Asistente de estudio offline en entornos sin conectividad: al ejecutarse localmente en hardware de borde, permite generar explicaciones de algebra lineal o ecuaciones diferenciales sin depender de la nube.
- Primer filtro de consultas legales: con la etapa SFT sobre Lawyer-Instruct, puede clasificar y responder preguntas legales sencillas en ingles (definiciones, distinciones basicas) antes de escalar a un modelo mayor o a un profesional.
- Generacion de borradores de derivaciones en pipelines educativos: util para producir soluciones candidatas de problemas de mecanica o electromagnetismo que luego se validan con un modelo mayor o con verificacion simbolica.
- Prototipado rapido de asistentes conversacionales de bajo coste: su tamano permite desplegar multiples instancias en una sola GPU consumer para pruebas de concepto de chatbots.
- Investigacion sobre destilacion de conocimiento: sirve como caso de estudio reproducible de transferencia de razonamiento desde un profesor MoE Thinking a un estudiante de 0,6B con perdida ponderada por prueba.
- Despliegue en entornos con restricciones de memoria (Raspberry Pi, telefonos de gama media) para tareas de generacion de texto corto en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,5 GB para los pesos (751M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica alrededor de 2 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,8 GB; en 4 bits, alrededor de 0,4-0,5 GB, coherente con la afirmacion del autor de menos de 500 MB cuantizado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bf16 (GTX 1650, RTX 3050, RTX 4060); para cuantizacion 4 bits basta con GPUs integradas o incluso CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en telefonos moviles segun el autor.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag endpoints_compatible), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no documentado explicitamente).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT | 0,6B (751M reales) | 1024 tokens | Apache 2.0 | Destilacion STEM + SFT legal | Hugging Face |
| Qwen/Qwen3-0.6B | 0,6B | no disponible en la informacion | Apache 2.0 | Modelo base generalista | Hugging Face |
| Qwen/Qwen3-30B-A3B-Thinking-2507 (profesor) | 30B totales, ~3B activos | no disponible en la informacion | no disponible en la informacion | MoE con razonamiento extendido | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ventana de contexto muy corta (1024 tokens en entrenamiento), lo que limita conversaciones multi-turno y documentos largos.
- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo elevado de alucinacion en dominios especializados (legal, fisica, biologia) dado el reducido tamano del modelo y la ausencia de benchmarks publicados.
- El ajuste legal se basa en un unico dataset (Lawyer-Instruct) y no constituye asesoramiento juridico; no debe usarse en produccion legal sin supervision humana.
- No se documentan evaluaciones de sesgo; un modelo de 0,6B entrenado con datos limitados puede reproducir sesgos presentes en los datasets de origen.
- El contexto de 1024 tokens puede truncar derivaciones largas, degradando la calidad en problemas complejos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor no ofrece garantias ni soporte; la model card no incluye resultados de evaluacion que respalden las afirmaciones de rendimiento.
- El nombre "Thinking" hace referencia al profesor de destilacion, no a un modo de razonamiento activable en el estudiante; no debe interpretarse como equivalente a los modos thinking de Qwen3.
- La fecha de creacion indicada (2026-03-22) y la de actualizacion (2026-11-18) figuran en los metadatos; verificar su coherencia antes de citarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Dataset legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Autor de los datasets STEM: https://huggingface.co/0xZee
- Convergent Intelligence LLC: https://convergentintel.com
