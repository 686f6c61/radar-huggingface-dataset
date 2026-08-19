# ManniX-ITA/Qwen3.6-27B-A3B-Coder-MTP-GGUF

## Resumen

Qwen3.6-27B-A3B-Coder-MTP es un modelo de lenguaje especializado en código, resultado de una poda selectiva de expertos (expert pruning) sobre el modelo base Qwen3.6-35B-A3B de Qwen. El autor, ManniX-ITA, reduce el número de expertos por capa de 256 a 184 (72 eliminados por capa), pasando de aproximadamente 35 mil millones de parámetros totales a unos 26,2 mil millones, manteniendo los 3 mil millones de parámetros activos por token. No se realiza ningún fine-tuning ni destilación: la selección de expertos se basa en un mapa de competencias orientado a código, construido a partir de los benchmarks LiveCodeBench y MultiPL-E.

La relevancia de este modelo reside en que consigue un perfil de rendimiento en código superior al del profesor completo en la prueba MultiPL-E (0,840 frente a 0,827), a la vez que reduce el tamaño total del modelo en aproximadamente un 25%. El router, la atención, las normas, la cabeza MTP (Multi-Token Prediction) y la torre de visión se conservan intactos respecto a la base; solo cambia el conjunto de expertos conservados. Además, se ajusta el número de expertos activos por token de 8 a 10 (top-10 routing) como palanca de recuperación de la capacidad de seguir instrucciones tras la poda.

El modelo se distribuye en formato GGUF, lo que facilita su despliegue con llama.cpp y Ollama, e incorpora un mecanismo de control del presupuesto de razonamiento que permite acotar el bloque de pensamiento del modelo en tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con 184 expertos por capa (prune de 256), atencion estandar, cabeza MTP y torre de vision |
| Parametros totales | 26.213.016.704 (~26,2 mil millones) |
| Parametros activos | ~3 mil millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q4_K_M, Q6_K, Q3_K_XL mencionados; consultar el repositorio para la lista completa) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo sin cuantizar) |

## Arquitectura y entrenamiento

El modelo es una poda de expertos del Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) con 256 expertos por capa y 3 mil millones de parametros activos. La poda reduce el conjunto de expertos a 184 por capa, eliminando 72 de ellos mediante un mapa de competencias calculado perfilando cada experto sobre un corpus balanceado y sobre las clases de respuesta PASS de LiveCodeBench y MultiPL-E (Rust, Java, JavaScript). La agregacion de competencias usa el metodo `wmax`, con las clases de codigo ponderadas con un factor de 1,5 para proteger a los expertos mas competentes en esa tarea.

No hay entrenamiento adicional: ni fine-tuning, ni destilacion, ni RLHF. El router, la atencion, las normas, la cabeza MTP y la torre de vision se mantienen identicos a la base. La unica modificacion funcional es el aumento del numero de expertos activos por token de 8 a 10 (top-10 routing), que se fija como valor por defecto en la configuracion del modelo. Este cambio actua como palanca de recuperacion de la capacidad de seguir instrucciones tras la poda, con un coste nulo en rendimiento de codigo.

## Capacidades

- Generacion de texto y razonamiento general, con modo de pensamiento extendido (thinking mode) heredado de la familia Qwen 3.6.
- Generacion de codigo en multiples lenguajes, con especial solidez en Rust, Java y JavaScript gracias al entrenamiento del mapa de competencias con MultiPL-E.
- Resolucion de problemas de programacion competitiva (LiveCodeBench) y tareas de programacion general (HumanEval, GSM8K).
- Soporte de tool calling y function calling, heredado del modelo base.
- Capacidad de razonamiento multi-paso y uso en agentes, con el mismo router y atencion que el Qwen3.6-35B-A3B original.
- Capacidades multilingues y de vision teoricamente disponibles al conservar la torre de vision del base, aunque no se documentan resultados especificos en esta ficha.
- Control del presupuesto de razonamiento en tiempo de inferencia mediante los parametros `--reasoning-budget` y `--reasoning-budget-message` de llama.cpp.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para generar esqueletos de funciones, tests unitarios o documentacion de API. Su alto rendimiento en HumanEval (0,970) y LiveCodeBench (0,688) lo hace adecuado para tareas de autocompletado y generacion asistida.
- Asistente de programacion multilingue: gracias al rendimiento en MultiPL-E (0,840), es util para desarrolladores que trabajan con Rust, Java o JavaScript, ofreciendo sugerencias contextuales y refactorizaciones.
- Resolucion de problemas de programacion competitiva: plataformas de entrenamiento o evaluacion pueden usarlo para generar soluciones de referencia o para validar respuestas en concursos tipo LiveCodeBench.
- Revision de codigo automatizada: el modelo puede analizar fragmentos de codigo, detectar errores logicos y proponer correcciones, aprovechando su capacidad de razonamiento multi-paso y su ventana de contexto (aunque la longitud exacta no se especifica).
- Chat tecnico de soporte con razonamiento acotado: combinado con el control de presupuesto de razonamiento de llama.cpp, puede gestionar conversaciones de soporte tecnico donde se requiere explicar soluciones de codigo sin divagar en exceso.
- Traduccion de codigo entre lenguajes: su competencia en multiples lenguajes de programacion permite convertir codigo entre Rust, Java y JavaScript manteniendo la logica, util en migraciones de proyectos.
- Generacion de documentacion tecnica: el modelo puede producir comentarios, docstrings y guias de uso a partir de codigo fuente, aprovechando su capacidad de seguir instrucciones (IFEval 0,730).

## Benchmarks y rendimiento

Los siguientes resultados fueron publicados por el autor en la model card, medidos con cuantizacion Q6_K en llama.cpp, temperatura 0,6, top-p 0,95 y top-k 20. Se comparan con el modelo profesor completo (Qwen3.6-35B-A3B con 256 expertos) y con una version anterior de poda orientada solo a LiveCodeBench (coder LCB-only).

| Benchmark | Este modelo | Qwen3.6-35B-A3B (256e) | coder (LCB-only) |
|---|---|---|---|
| GPQA-Diamond | 0,773 | 0,833 | 0,793 |
| MATH-500 | 0,620 | 0,730 | 0,620 |
| AIME | 0,733 | 0,633 | 0,767 |
| LiveCodeBench (v6, 77q) | 0,688 | 0,714 | 0,688 |
| IFEval | 0,730 | 0,960 | 0,840 |
| HumanEval | 0,970 | 0,970 | 0,963 |
| GSM8K | 0,970 | 0,960 | 0,980 |
| ARC-Challenge | 0,944 | 0,935 | 0,933 |
| MultiPL-E | 0,840 | 0,827 | 0,670 |
| Average | 0,808 | 0,840 | 0,806 |

El modelo supera al profesor en MultiPL-E (+1,3 puntos) y en AIME (+10 puntos), y empata en HumanEval. La media general queda 3,2 puntos por debajo del profesor, principalmente por la caida en IFEval (0,730 frente a 0,960) y en menor medida en GPQA y MATH-500.

## Requisitos de hardware

- Al ser un modelo MoE con solo 3 mil millones de parametros activos, la inferencia es rapida incluso en GPUs de consumo.
- La cuantizacion Q4_K_M ocupa aproximadamente 14-15 GB de VRAM, por lo que cabe en una RTX 3090, RTX 4090 (24 GB) o en un Mac con 32 GB de RAM unificada.
- La cuantizacion Q6_K ocupa aproximadamente 20 GB de VRAM, requiriendo 24 GB o mas.
- La cuantizacion Q3_K_XL (mencionada en Ollama) ocupa menos de 12 GB, apta para GPUs de 16 GB.
- Despliegue recomendado con llama.cpp (version b8508 o superior para el control del presupuesto de razonamiento), Ollama o cualquier servidor compatible con GGUF como vLLM o TGI si soportan el formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | MultiPL-E | HumanEval | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.6-27B-A3B-Coder-MTP (este) | 26,2B | ~3B | no disponible | 0,840 | 0,970 | Apache 2.0 |
| Qwen3.6-35B-A3B (profesor) | 35B | ~3B | no disponible | 0,827 | 0,970 | Apache 2.0 |
| Qwen3.6-35B-A3B-Coder (LCB-only) | ~35B | ~3B | no disponible | 0,670 | 0,963 | Apache 2.0 |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada. La ventaja principal del modelo podado es el menor tamano total (26,2B frente a 35B) con un rendimiento en codigo igual o superior al profesor en MultiPL-E y HumanEval.

## Limitaciones y advertencias

- Verbosidad excesiva en tareas de razonamiento abierto: el modelo tiende a sobre-pensar antes de responder, especialmente en GPQA y AIME. Esta caracteristica es heredada en gran parte del modelo base (el profesor muestra un comportamiento similar), pero la poda anade rumiacion adicional en IFEval (30 respuestas runaway frente a 11 del profesor).
- Caida notable en IFEval: el rendimiento en seguimiento de instrucciones baja de 0,960 a 0,730, lo que puede afectar a tareas que requieren obediencia estricta a formatos o restricciones.
- Perdida de rendimiento en GPQA-Diamond (0,773 frente a 0,833) y MATH-500 (0,620 frente a 0,730), por lo que no es recomendable para tareas cientificas o matematicas de alto nivel.
- Requiere llama.cpp b8508 o superior para usar el control de presupuesto de razonamiento; sin el, el modelo puede consumir toda la ventana de contexto pensando antes de responder.
- El parametro `--jinja` es obligatorio para que el control del bloque de pensamiento funcione; sin el, los delimitadores del chat template no se detectan y el presupuesto se ignora silenciosamente.
- No se ha realizado fine-tuning ni alineacion adicional, por lo que puede heredar sesgos del modelo base Qwen3.6-35B-A3B.
- La longitud de contexto no se especifica en la documentacion; se recomienda verificar el modelo base para conocer el limite real.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de rendimiento en produccion.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/ManniX-ITA/Qwen3.6-27B-A3B-Coder-MTP-GGUF
- Repositorio HuggingFace del modelo sin cuantizar: https://huggingface.co/ManniX-ITA/Qwen3.6-27B-A3B-Coder
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Pagina en Ollama: https://ollama.com/mannix/qwen3.6-27b-a3b-coder
- Cuantizacion Q3_K_XL en Ollama: https://ollama.com/mannix/qwen3.6-27b-a3b-coder:Q3_K_XL
- Ficha en MeshKore: https://meshkore.com/agent/mannix-ita-qwen36-27b-a3b-coder-mtp-gguf
