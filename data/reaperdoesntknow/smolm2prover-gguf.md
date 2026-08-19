# reaperdoesntknow/SMOLM2Prover-GGUF

## Resumen

SMOLM2Prover-GGUF es la versión cuantizada en formato GGUF del modelo SMOLM2Prover, un modelo de lenguaje pequeño especializado en razonamiento matemático, pruebas lógicas, cálculo y demostraciones. Fue desarrollado por reaperdoesntknow, perteneciente a la división de investigación de Convergent Intelligence LLC, y se distribuye bajo licencia Apache-2.0. El modelo base es prithivMLmods/SmolLM2-CoT-360M, un derivado de la familia SmolLM2 con capacidades de cadena de pensamiento (chain-of-thought).

Con 361,8 millones de parámetros y una longitud de contexto de 8192 tokens, este modelo está diseñado para ejecutarse en hardware modesto, incluso en CPU, manteniendo una capacidad de razonamiento paso a paso en dominios matemáticos. La versión GGUF incluye dos archivos: uno en F16 (692 MB) y otro cuantizado Q4_K_M (258 MB), lo que permite su uso con runtimes como llama.cpp, Ollama y LM Studio. Su relevancia radica en ofrecer razonamiento matemático estructurado en un formato extremadamente ligero, apto para entornos educativos, prototipado local y despliegues con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Transformer decoder con GQA) |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | F16, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder estándar con atención por grupos de consultas (GQA): 15 cabezas de consulta y 5 cabezas de clave/valor, con 32 capas y dimensión de embedding de 960. Esta configuración es heredada del modelo base SmolLM2-CoT-360M y optimiza el uso de memoria durante la inferencia sin sacrificar capacidad de razonamiento en tareas matemáticas.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre el dataset AI-MO/NuminaMath-1.5, aumentado con aproximadamente un millón de tokens adicionales. Los datos se formatearon con una estructura de prompt diseñada para elicitar razonamiento paso a paso (chain-of-thought) en problemas de cálculo, lógica y demostraciones. El autor enmarca este proceso dentro de su metodología Discrepancy Calculus (DISC), que trata las singularidades del entrenamiento como señales estructurales, aunque no se detallan innovaciones arquitectónicas específicas más allá del fine-tuning sobre el modelo base.

## Capacidades

- Razonamiento matemático: resolución de problemas de cálculo, álgebra y lógica con explicaciones paso a paso.
- Generación de pruebas (proof generation): capaz de producir demostraciones formales e informales para enunciados matemáticos sencillos.
- Cadena de pensamiento (CoT): genera razonamiento intermedio antes de emitir la respuesta final, gracias al fine-tuning con datos formateados para ello.
- Generación de texto general: al estar basado en SmolLM2, conserva capacidades básicas de generación de lenguaje natural en inglés.
- Sin soporte de tool calling, visión ni audio: no se documentan estas capacidades en la información disponible.
- Multilingüismo limitado: únicamente entrenado y evaluado en inglés.

## Casos de uso

- Tutoria matematica interactiva: un estudiante puede plantear un problema de calculo o logica y el modelo genera una solucion razonada paso a paso, util como herramienta de autoaprendizaje en plataformas educativas ligeras.
- Verificacion de pruebas en entornos academicos: investigadores o estudiantes pueden usar el modelo para esbozar demostraciones de teoremas simples y contrastar la validez de sus pasos logicos, aunque con la cautela de que no es un verificador formal.
- Generacion de ejercicios de practica: el modelo puede crear problemas de calculo, algebra y logica con sus respectivas soluciones detalladas, lo que facilita la preparacion de materiales docentes.
- Asistente de razonamiento en aplicaciones de escritorio: al poder ejecutarse en CPU con solo 258 MB, es viable integrarlo en aplicaciones locales de productividad o educacion sin necesidad de GPU.
- Prototipado rapido de agentes de razonamiento: desarrolladores pueden usarlo como base para experimentar con pipelines de razonamiento paso a paso en entornos sin acceso a la nube o con presupuesto computacional minimo.
- Analisis de problemas matematicos en lenguaje natural: el modelo interpreta enunciados expresados en ingles y devuelve una resolucion estructurada, adecuado para sistemas de preguntas y respuestas en dominios STEM.
- Despliegue en dispositivos embebidos o de bajos recursos: su tamaño reducido permite ejecutarlo en Raspberry Pi o similares para aplicaciones educativas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras evaluaciones estandar que permitan comparar cuantitativamente este modelo con alternativas similares.

## Requisitos de hardware

- Cuantizacion Q4_K_M (258 MB): cabe en cualquier GPU con al menos 1 GB de VRAM, incluidas iGPU integradas, y puede ejecutarse completamente en CPU con unos 300-400 MB de RAM.
- Cuantizacion F16 (692 MB): requiere aproximadamente 1 GB de VRAM para inferencia en GPU, o unos 800 MB de RAM en CPU.
- GPUs recomendadas: cualquier GPU moderna con 2 GB o mas de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas Intel/AMD) es suficiente. No requiere GPU de datacenter.
- Compatibilidad con CPU: funciona correctamente en procesadores x86_64 y ARM64 con llama.cpp, con velocidades de generacion estimadas de 10-30 tokens por segundo en CPUs modernas de 4 nucleos o mas (estimacion basada en modelos de tamano similar, no medida oficial).
- Opciones de despliegue: llama.cpp, Ollama (creando un Modelfile), LM Studio, y cualquier runtime compatible con GGUF. Tambien es compatible con endpoints mediante la etiqueta `endpoints_compatible` en Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| SMOLM2Prover-GGUF | 361,8 M | 8192 | Apache-2.0 | GGUF | Razonamiento matematico y CoT |
| SmolLM2-CoT-360M (base) | 360 M | 8192 | Apache-2.0 | safetensors | CoT general |
| Qwen2.5-0.5B-Instruct | 494 M | 32768 | Apache-2.0 | safetensors/GGUF | Instruccion general y algo de razonamiento |
| TinyLlama-1.1B-Chat | 1.100 M | 2048 | Apache-2.0 | safetensors/GGUF | Chat general |

La comparativa se basa en caracteristicas publicas de cada modelo. No se dispone de resultados de benchmarks comparativos para SMOLM2Prover, por lo que no es posible establecer una jerarquia de rendimiento real entre estas opciones.

## Limitaciones y advertencias

- Tamano muy reducido: con 361,8 M de parametros, su capacidad de razonamiento es significativamente inferior a modelos de 7B o mas, y puede fallar en problemas matematicos complejos o con multiples pasos.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas, lo que limita su uso en contextos multilingues.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en demostraciones matematicas donde la verificacion formal es critica.
- Ausencia de benchmarks publicados: no hay datos objetivos de rendimiento, por lo que su calidad real en tareas estandarizadas es desconocida.
- Dependencia del modelo base: hereda las limitaciones y posibles sesgos de SmolLM2-CoT-360M, que no estan documentados en detalle.
- Soporte limitado: el autor es un laboratorio de investigacion pequeno (Convergent Intelligence LLC); no hay garantia de mantenimiento, actualizaciones o soporte tecnico.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el usuario debe asumir la responsabilidad de validar la calidad de las salidas en entornos de produccion.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/reaperdoesntknow/SMOLM2Prover-GGUF
- Modelo original (safetensors): https://huggingface.co/reaperdoesntknow/SMOLM2Prover
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Pagina del modelo en FriendliAI (API): https://friendli.ai/models/reaperdoesntknow/SMOLM2Prover
- Documento Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento DualMind Methodology: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
