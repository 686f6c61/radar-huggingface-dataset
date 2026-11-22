# reaperdoesntknow/SMOLM2Prover-GGUF

## Resumen

SMOLM2Prover-GGUF es la versión cuantizada en formato GGUF del modelo SMOLM2Prover, un ajuste fino (SFT) de 361.821.120 parámetros desarrollado por el usuario reaperdoesntknow, vinculado a Convergent Intelligence LLC: Research Division. El modelo parte de prithivMLmods/SmolLM2-CoT-360M, una variante con cadena de pensamiento (chain-of-thought) de la familia SmolLM2, y se ha especializado en generación de pruebas matemáticas, cálculo, lógica y razonamiento paso a paso. Su propósito es ofrecer capacidades de razonamiento matemático en un tamaño muy reducido, apto para ejecución local en CPU.

La relevancia de esta ficha radica en su formato: al distribuirse en GGUF, el modelo puede ejecutarse con llama.cpp, Ollama o LM Studio sin necesidad de GPU, con un archivo Q4_K_M de solo 258 MB. Esto lo sitúa en el segmento de modelos ultracompactos para tareas de razonamiento acotadas, donde el coste computacional y la huella de memoria son prioritarios frente a la amplitud de capacidades.

La arquitectura es un transformer decoder-only tipo LlamaForCausalLM con 32 capas, dimensión de embedding de 960 y atención con GQA (15 cabezas de consulta, 5 de clave/valor), con una longitud de contexto declarada de 8192 tokens. Está entrenado únicamente en inglés y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | F16 (sin cuantizar) y Q4_K_M (5,94 bits por peso) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo original) |
| Dimension de embedding | 960 |
| Numero de capas | 32 |
| Cabezas de atencion | 15 (Q), 5 (KV), GQA |
| Modelo base | prithivMLmods/SmolLM2-CoT-360M |
| Dataset de ajuste | AI-MO/NuminaMath-1.5 |
| Tamano del repo | 1,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con arquitectura Llama, 32 capas, dimensión oculta de 960 y atención con query grouping (GQA) de 15 cabezas de consulta frente a 5 de clave/valor, lo que reduce el coste de memoria de la caché KV durante la inferencia. El contexto máximo declarado es de 8192 tokens. La model card no detalla el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de indicar que se usó AI-MO/NuminaMath-1.5, un corpus orientado a problemas matemáticos y razonamiento.

El ajuste se realizó mediante SFT (supervised fine-tuning) con las librerías TRL y el framework de Hugging Face (`generated_from_trainer`), partiendo del modelo SmolLM2-CoT-360M de prithivMLmods, que ya incorpora comportamiento de cadena de pensamiento. No se documentan etapas de RLHF ni DPO, ni innovaciones técnicas propias más allá del ajuste supervisado. La model card incluye una sección sobre el marco teórico "Discrepancy Calculus" del autor, pero no aporta detalles verificables sobre el procedimiento de entrenamiento ni métricas de pérdida. La versión GGUF se generó con cuantización Q4_K_M (Q4_K para la mayoría de pesos, Q5_0 para tensores no divisibles por 256 y Q6_K/Q8_0 en algunas capas críticas), con una reducción de tamaño del 63 % respecto a F16.

## Capacidades

- Generación de texto con razonamiento paso a paso (chain-of-thought) orientado a problemas matemáticos.
- Resolución de problemas de cálculo y lógica, según los tags declarados por el autor.
- Generación de pruebas matemáticas formales o semiformales (proof), el eje declarado del ajuste.
- Razonamiento aritmético y algebraico de ámbito académico.
- Conversación multi-turno en inglés (tag `conversational`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la cadena de pensamiento.
- No dispone de capacidades de visión, audio ni multimodalidad.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistencia educativa en matemáticas: el modelo puede generar explicaciones paso a paso de ejercicios de cálculo y lógica, adecuado por su tamaño para desplegarse en entornos escolares sin GPU.
- Generación de borradores de pruebas matemáticas: útil como herramienta de apoyo para estudiantes que necesitan una primera aproximación a una demostración, revisable después por un docente.
- Prototipado de tutores conversacionales: su contexto de 8192 tokens permite mantener diálogos multi-turno con el enunciado del problema y pasos previos dentro de la ventana.
- Ejecución local en portátiles y dispositivos de bajos recursos: el archivo Q4_K_M de 258 MB cabe en cualquier equipo con llama.cpp u Ollama, sin requisitos de VRAM.
- Filtrado y clasificación de razonamientos matemáticos: puede usarse como generador de cadenas de pensamiento para construir datasets sintéticos de entrenamiento o evaluación en pipelines de investigación.
- Pruebas de concepto de razonamiento en inglés dentro de aplicaciones de escritorio: integrable en LM Studio para experimentación rápida sin infraestructura de servidor.
- Evaluación comparativa de modelos pequeños: sirve como baseline de razonamiento matemático en estudios sobre destilación y ajuste fino de modelos de menos de 500 M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F16 (692 MB de pesos) y aproximadamente 300-400 MB en Q4_K_M (258 MB de pesos más caché KV).
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) puede ejecutarlo con holgura. En CPU funciona de forma nativa.
- Cabe en cualquier GPU consumer e incluso en sistemas sin GPU dedicada, incluidos Raspberry Pi y portátiles de gama baja.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama mediante Modelfile, LM Studio y cualquier runtime compatible con GGUF. El modelo original en safetensors es compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera inferencia en tiempo real en CPU moderna, aunque no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SMOLM2Prover-GGUF | 361,8 M | 8192 | GGUF | Apache 2.0 | Ajuste SFT en NuminaMath-1.5, especializado en pruebas y cálculo |
| prithivMLmods/SmolLM2-CoT-360M | ~360 M | no disponible | safetensors | no disponible | Modelo base con cadena de pensamiento |
| SmolLM2-360M (HuggingFaceTB) | 362 M | 8192 | safetensors, GGUF | Apache 2.0 | Modelo generalista original de la familia |

La comparación con alternativas de razonamiento matemático de mayor tamaño (Qwen2.5-Math, DeepSeek-Math) no resulta homogénea por la diferencia de escala; no se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa con ellos.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo elevado de alucinación en matemáticas: con 361 M de parámetros, la fiabilidad en demostraciones y cálculos complejos es limitada y requiere verificación humana.
- No se han publicado benchmarks ni métricas de evaluación, por lo que no hay evidencia cuantitativa de su calidad frente al modelo base.
- El ajuste se realizó sobre un único dataset (NuminaMath-1.5) sin documentar el volumen de tokens ni la composición, lo que dificulta evaluar sesgos de dominio.
- La model card incluye referencias a un marco teórico propio ("Discrepancy Calculus") sin validación externa; no debe interpretarse como garantía de calidad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y del dataset de entrenamiento.
- El contexto de 8192 tokens es reducido para problemas matemáticos extensos o conversaciones largas.
- No soporta tool calling ni agentes, lo que limita su integración en pipelines automatizados complejos.
- El repositorio tiene 0 likes y un volumen de descargas moderado (2357), lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/SMOLM2Prover-GGUF
- Modelo original (safetensors): https://huggingface.co/reaperdoesntknow/SMOLM2Prover
- Modelo base: https://huggingface.co/prithivMLmods/SmolLM2-CoT-360M
- Dataset de entrenamiento: https://huggingface.co/datasets/AI-MO/NuminaMath-1.5
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Documento "Discrepancy Calculus": https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento "Three Teachers to Dual Cognition": https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
