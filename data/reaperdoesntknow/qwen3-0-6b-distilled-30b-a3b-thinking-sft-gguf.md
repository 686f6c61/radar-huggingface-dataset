# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF

## Resumen

Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF es la version cuantizada en formato GGUF de un modelo de lenguaje de 0,6 mil millones de parametros construido mediante destilacion de conocimiento a partir de Qwen3-30B-A3B-Thinking-2507. Lo desarrolla Reaperdoesntrun, bajo el sello de Convergent Intelligence LLC (Research Division), y esta pensado para despliegue local, movil y en dispositivos de borde mediante llama.cpp y runtimes compatibles.

El modelo parte del checkpoint base Qwen/Qwen3-0.6B y aplica un pipeline de dos etapas: primero una destilacion de un profesor "Thinking" de 30B sobre 6.122 muestras de cadena de pensamiento de ambito STEM (matematicas y fisica), con una funcion de perdida que pondera las derivaciones (proof-weighted cross-entropy de 2,5x a 1,5x sobre los tokens de derivacion, mas divergencia KL a temperatura 2,0); despues un ajuste supervisado (SFT) sobre el dataset Alignment-Lab-AI/Lawyer-Instruct con una tasa de aprendizaje conservadora de 5e-6 para anadir razonamiento juridico sin sobrescribir la base cientifica.

La relevancia de este modelo es su propuesta de compresion extrema: reducir un profesor de 30B a un estudiante de 0,6B (una relacion de 50x en parametros, aproximadamente 75x con la cuantizacion Q4_K_M) manteniendo trazas de razonamiento deliberativo. El repositorio GGUF ocupa 3,3 GB e incluye cuatro niveles de cuantizacion, desde F16 (~1,3 GB) hasta Q4_K_M (~400 MB), lo que permite ejecutarlo en hardware muy limitado. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B); detalles especificos de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 751.632.384 |
| Parametros activos | No aplica (no es MoE; el profesor si era MoE 30B-A3B) |
| Longitud de contexto | No disponible en la informacion proporcionada; los ejemplos de uso emplean n_ctx=1024 |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only denso de 0,6B de parametros. Sobre esa base se aplica un proceso de destilacion en dos etapas documentado por el autor. La primera etapa, denominada Thinking Teacher Distillation, usa como profesor a Qwen3-30B-A3B-Thinking-2507 sobre un corpus de 6.122 muestras de cadena de pensamiento STEM. Segun la model card, la variante Thinking del profesor genera trazas de razonamiento extendidas con distribuciones de mayor entropia, lo que transfiere una estructura de deliberacion mas rica al estudiante. La perdida combina entropia cruzada ponderada por prueba (2,5x a 1,5x sobre tokens de derivacion) y divergencia KL a temperatura 2,0.

La segunda etapa es un ajuste supervisado sobre Alignment-Lab-AI/Lawyer-Instruct con una tasa de aprendizaje de 5e-6, disenado explicitamente para superponer razonamiento juridico sobre la base STEM sin destruirla. El autor menciona un marco matematico propio (Discrepancy Calculus, Topological Knowledge Distillation, operador de discrepancia Df(x) y descomposicion BV) que, segun afirma, queda codificado en los pesos y se preserva a traves de la cuantizacion. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional e instruccional en ingles.
- Razonamiento paso a paso (chain-of-thought) en problemas STEM, con enfasis en derivaciones matematicas y fisicas.
- Razonamiento juridico basico: conceptos generales de derecho (por ejemplo, promissory estoppel, distincion entre felony y misdemeanor) tras el SFT sobre Lawyer-Instruct.
- Soporte de dos formatos de prompt diferenciados: uno para derivaciones STEM ("Solve the following problem... Proof:") y otro para seguir instrucciones ("### Instruction: ... ### Response:").
- Capacidad de ejecucion en dispositivos de borde, moviles e IoT gracias a las cuantizaciones de 400-700 MB.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito con tokens especiales en la informacion proporcionada.
- Multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Tutoria STEM en dispositivos sin conexion: el modelo puede resolver problemas de matematicas y fisica mostrando derivaciones paso a paso, y su tamano Q4_K_M (~400 MB) permite empaquetarlo en una aplicacion movil o en un dispositivo de borde sin acceso a red.
- Asistente juridico de primera linea en intranet: con el SFT sobre Lawyer-Instruct, puede responder preguntas conceptuales sobre terminos legales generales (por ejemplo, que es una figura contractual) en herramientas internas de despachos, siempre con verificacion humana posterior.
- Generacion de explicaciones educativas en plataformas de e-learning: integrado via llama.cpp u Ollama, puede producir razonamientos estructurados para ejercicios de fisica y matematicas con latencia baja en CPU.
- Prototipado rapido de pipelines de razonamiento: al ser un modelo pequeno y con licencia Apache 2.0, sirve para validar arquitecturas de prompting chain-of-thought y formatos de instruccion antes de escalar a modelos mayores.
- Inferencia en hardware embebido y wearables: el autor lo presenta como un modelo que "cabe en un smartwatch"; con Q4_K_M puede desplegarse en dispositivos con pocos cientos de MB de memoria para tareas de respuesta breve.
- Filtrado y clasificacion de consultas en aplicaciones de atencion al cliente: por su bajo coste de inferencia, puede preclasificar consultas y generar respuestas preliminares que un modelo mayor o un humano revisa despues.
- Experimentacion con destilacion de conocimiento: sirve como referencia practica para investigadores que quieran estudiar la transferencia de trazas de razonamiento de un profesor MoE de 30B a un estudiante denso de 0,6B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia segun cuantizacion: F16 ~1,3 GB; Q8_0 ~700 MB; Q5_K_M ~500 MB; Q4_K_M ~400 MB (cifras de tamano de fichero indicadas por el autor; el consumo real en ejecucion es algo superior por el contexto y el estado del runtime).
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) puede alojar las cuantizaciones Q4_K_M y Q5_K_M con holgura; las tarjetas de datacenter (A100, H100) no son necesarias.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 2 GB o mas de VRAM para las cuantizaciones Q4_K_M y Q5_K_M; tambien es viable en CPU.
- Opciones de despliegue documentadas: llama.cpp (CLI y binding de Python `llama_cpp`), Ollama y LM Studio. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF (este) | 0,75B | No disponible | Ingles | Apache 2.0 | GGUF | Destilado de un profesor Thinking de 30B; incluye SFT juridico |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B | No disponible en la informacion proporcionada | Multilingue (segun Qwen) | Apache 2.0 | Safetensors, GGUF | Modelo generalista original sin destilacion especifica |
| Qwen3-0.6B-STEM-Proof-Distilled-Thinking (mismo autor) | 0,6B | No disponible | Ingles | Apache 2.0 | No disponible | Solo etapa 1: base STEM pura, sin SFT juridico |
| Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF (mismo autor) | 1,7B | No disponible | Ingles | Apache 2.0 | GGUF | Variante mayor de la misma familia de destilacion |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Capacidad limitada por el tamano: el propio autor advierte que 0,6B es una restriccion dura y que el modelo cometera errores que modelos mayores evitan.
- Razonamiento multi-paso fragil: las demostraciones de mas de aproximadamente 8 pasos se degradan segun la model card.
- Razonamiento juridico superficial: cubre conceptos generales pero carece de matiz; no sustituye asesoramiento legal profesional.
- Riesgo de alucinacion: inherente a modelos pequenos destilados; el autor recomienda verificar siempre las salidas criticas y no usarlo como sustituto de verificacion formal de pruebas.
- Idioma: solo se declara ingles, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: no se especifica la longitud de contexto soportada; los ejemplos de uso emplean 1024 tokens, lo que sugiere ventanas cortas en la practica.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece soporte ni validacion de resultados.
- Advertencia sobre el marco matematico propietario: las afirmaciones sobre Discrepancy Calculus y Topological Knowledge Distillation provienen de la model card del autor y no se han verificado de forma independiente en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF
- Modelo fuente (precision completa): https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT
- Variante solo STEM (etapa 1): https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-STEM-Proof-Distilled-Thinking
- Variante 1.7B GGUF: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Profesor Qwen3-30B-A3B-Thinking-2507: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Dataset de SFT juridico: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Sitio de Convergent Intelligence LLC: https://convergentintel.com
