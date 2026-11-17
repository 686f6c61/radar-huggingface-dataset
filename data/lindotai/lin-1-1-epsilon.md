# LindotAI/Lin-1.1-Epsilon

## Resumen

Lin-1.1 Epsilon es un modelo de generacion de codigo especializado en Rust, desarrollado por LindotAI. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen2.5-Coder-0.5B-Instruct, con 494 millones de parametros totales. Su proposito es ofrecer completaciones de codigo Rust rapidas y ejecutables en hardware modesto, incluyendo CPU de portatil, orientado a funciones simples y bucles de generacion-y-prueba.

La version 1.1 sustituye a Lin-1 Epsilon Preview e introduce cinco rondas adicionales de aprendizaje por refuerzo (GRPO) sobre tareas Rust con tests unitarios, partiendo cada ronda del checkpoint anterior. Segun la model card, mejora el pass@1 en HumanEval-Rust y MBPP-Rust, ademas de un conjunto de validacion privado (holdout) y LBPP-Rust, a costa de una ligera reduccion en pass@10 de HumanEval-Rust.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y builds GGUF (Q8_0, Q4_K_M) en un repositorio separado. Su tamano reducido lo hace adecuado para entornos con recursos limitados donde se prioriza la especializacion en Rust sobre la capacidad generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino de Qwen2.5-Coder-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 y Q4_K_M (repositorio separado); pesos originales en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura transformer decoder-only de Qwen2, heredada de Qwen2.5-Coder-0.5B-Instruct. El entrenamiento se realizo en tres fases: primero, un ajuste fino supervisado (SFT) sobre codigo Rust curado y verificado por compilacion; segundo, aprendizaje por refuerzo con GRPO usando una recompensa basada en el paso de tests, seguido de un promedio de pesos entre los checkpoints de SFT y RL (lo que constituyo Lin-1 Epsilon Preview); y tercero, cinco rondas adicionales de GRPO sobre tareas Rust con tests unitarios, donde las ultimas cuatro rondas emplearon 2.000 tareas nuevas no vistas previamente en cada una. La recompensa utiliza una ventaja de estilo pass@k.

Todos los datos de entrenamiento fueron descontaminados frente a los conjuntos de evaluacion (HumanEval, MBPP, LBPP y el holdout) mediante un filtro de solapamiento de 12 gramos y coincidencia exacta. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de que es codigo Rust curado y verificado por compilacion.

## Capacidades

- Generacion de codigo Rust: funciones, completaciones y soluciones a problemas con tests.
- Razonamiento de codigo limitado: adecuado para logica de un solo paso, con dificultades en problemas de multiples pasos.
- Generacion-y-prueba: el modelo esta disenado para producir candidatos que se compilan y testean, con temperatura recomendada de 0.8 para muestrear varias opciones.
- Conversacional: soporta plantilla de chat (apply_chat_template) heredada del modelo base.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; las limitaciones indican que la logica multi-paso esta fuera de alcance para un modelo de 0.5B.
- Capacidades multilingues: solo ingles (etiqueta de idioma en).
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Completacion de funciones Rust en el editor: el modelo genera funciones cortas y verificables, ideal para autocompletado en IDE con latencia baja gracias a sus 494M de parametros y ejecucion en CPU.
- Bucles de generacion-y-prueba en CI: se pueden muestrear varios candidatos con temperatura 0.8, compilarlos y ejecutar tests automaticamente para seleccionar el que pase, aprovechando el entrenamiento con recompensa basada en tests.
- Generacion de tests unitarios en Rust: el modelo puede producir esqueletos de tests que luego se validan con cargo test, util para aumentar cobertura en proyectos existentes.
- Prototipado rapido en entornos sin GPU: al caber en CPU de portatil, permite experimentar con generacion de codigo Rust en maquinas sin acelerador, usando llama.cpp con GGUF Q4_K_M.
- Educacion y aprendizaje de Rust: sirve para generar ejemplos de funciones simples (palindromos, inversion de vectores) que el estudiante puede compilar y estudiar.
- Tareas de refactorizacion sencilla: reescritura de fragmentos pequenos de codigo Rust con instrucciones conversacionales, siempre con compilacion y test posterior.
- Generacion de snippets para documentacion tecnica: producir ejemplos de codigo Rust para manuales o articulos, con validacion manual antes de publicar.

## Benchmarks y rendimiento

Los resultados fueron medidos por el autor con el mismo harness para todos los modelos; los benchmarks son ports a Rust donde el codigo generado se compila y ejecuta contra tests. pass@1 y pass@10 se calculan con 10 muestras por problema.

| Modelo | HumanEval-Rust p@1 / p@10 | MBPP-Rust p@1 / p@10 | Holdout (Rust) | LBPP-Rust |
|---|---|---|---|---|
| Lin-1.1 Epsilon (0.5B) | 49.4 / 63.3 | 43.9 / 54.4 | 34.4 | 4.73 |
| Lin-1 Epsilon Preview (0.5B) | 48.4 / 65.2 | 41.3 / 54.2 | 30.3 | 4.11 |
| Temper 2 Ion (0.5B) | 48.1 / 57.6 | 45.5 / 53.8 | 31.0 | 4.50 |
| Temper 1 0.5B | 36.3 / 46.3 | 39.3 / 46.9 | No disponible | No disponible |
| ThoxEdge-RustCoder-0.5B | 28.7 / 44.8 | 33.2 / 43.1 | No disponible | No disponible |
| Qwen2.5-Coder-0.5B-Instruct (base) | 23.8 / No disponible | No disponible | No disponible | No disponible |
| Qwen3.5-0.8B | 10.1 / 22.1 | 14.5 / 25.5 | No disponible | No disponible |

El holdout es un conjunto de 1.726 tareas Rust con tests nunca usado en entrenamiento. LBPP-Rust (129 tareas) es un conjunto mas dificil que MBPP; los modelos pequenos resuelven pocos problemas, por lo que las diferencias absolutas son pequenas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 (494M parametros); alrededor de 0,3-0,5 GB en cuantizacion Q4_K_M.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090); tambien funciona en A100/H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna, e incluso en CPU de portatil segun la model card.
- Opciones de despliegue: transformers, llama.cpp (via GGUF Q8_0 y Q4_K_M), text-generation-inference (etiqueta endpoints_compatible en Hugging Face).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval-Rust p@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lin-1.1 Epsilon | 494M | No disponible | 49.4 | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Lin-1 Epsilon Preview | 494M | No disponible | 48.4 | Apache 2.0 | Hugging Face |
| Temper 2 Ion | 0.5B | No disponible | 48.1 | No disponible | No disponible |
| ThoxEdge-RustCoder-0.5B | 0.5B | No disponible | 28.7 | No disponible | No disponible |
| Qwen2.5-Coder-0.5B-Instruct | 494M | No disponible | 23.8 | Apache 2.0 | Hugging Face |

Lin-1.1 Epsilon supera a su predecesor y a los modelos Rust de 0.5B comparados en pass@1 de HumanEval-Rust, aunque Temper 2 Ion obtiene mejor pass@1 en MBPP-Rust (45.5 frente a 43.9). Frente al modelo base Qwen2.5-Coder-0.5B-Instruct, la mejora en HumanEval-Rust es de 25,6 puntos porcentuales.

## Limitaciones y advertencias

- Un modelo de 0.5B comete mas errores que modelos mayores en logica de multiples pasos; los problemas de nivel LBPP estan mayoritariamente fuera de su alcance.
- Enfocado exclusivamente en Rust: no es fiable para otros lenguajes de programacion.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion en APIs, funciones de libreria y firmas inexistentes; siempre hay que compilar y testear el codigo generado.
- pass@10 en HumanEval-Rust es 1.9 puntos inferior al Preview (63.3 frente a 65.2), por lo que el muestreo multiple puede rendir peor en ese benchmark concreto.
- No se documentan sesgos especificos ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el codigo generado.
- No se dispone de informacion sobre longitud de contexto, lo que limita la planificacion de tareas con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LindotAI/Lin-1.1-Epsilon
- Builds GGUF: https://huggingface.co/LindotAI/Lin-1.1-Epsilon-GGUF
- Modelo hermano Lin-1 Locus (4B): https://huggingface.co/LindotAI/Lin-1-Locus
- Version Preview: https://huggingface.co/LindotAI/Lin-1-Epsilon
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
