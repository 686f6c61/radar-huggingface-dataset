# MANGSEOK123/qwen3-4b-tau2-oel-telecom-t2-source-utility-n22

## Resumen

qwen3-4b-tau2-oel-telecom-t2-source-utility-n22 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 desarrollado por el usuario MANGSEOK123. Se trata de un experimento de investigación centrado en la "internalización de habilidades" (skill internalization) sobre el benchmark tau2-bench en su dominio de telecomunicaciones, empleando una técnica de autodestilación en política (on-policy self-distillation, OPSD) implementada con el framework OEL de LMOps.

El modelo parte de la arquitectura transformer densa de Qwen3-4B-Instruct-2507, con 4.411.424.256 parámetros totales, y no introduce cambios estructurales: el entrenamiento modifica únicamente los pesos mediante destilación. El objetivo del experimento es que el modelo alumno aprenda a resolver tareas conversacionales del dominio telecom sin necesidad de disponer de la "habilidad" inyectada en el prompt de sistema, imitando a un profesor congelado que sí la tiene.

Su relevancia es acotada y fundamentalmente metodológica: se publica como artefacto reproducible de un estudio controlado (configuración "Table 2", con solo 22 pares de entrenamiento y 16 efectivos tras el recorte a múltiplo de 8). No es un modelo orientado a producción general, sino una pieza de investigación sobre cómo internalizar competencias procedimentales en modelos pequeños mediante destilación sobre política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible de forma explícita; el entrenamiento usa prompt <= 8192 tokens y respuesta <= 1024 tokens por turno |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507, sin modificaciones estructurales. El entrenamiento consiste en una autodestilación en política (OPSD): el alumno es el modelo inicial resolviendo cada tarea del benchmark tau2-bench telecom (v1.0.1) sin la habilidad en el prompt, mientras que el profesor es una copia congelada del modelo inicial que sí lleva la habilidad en el system prompt. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del alumno.

Los detalles del procedimiento son concretos: 22 pares de entrenamiento (16 tras recortar a múltiplo de 8), selección de habilidades con utilidad de origen U = +1 (habilidades pass@3), semilla 42, 1 época, 8 pares por actualización, temperatura 0.7 con simulador de usuario GPT-4.1-mini, AdamW con lr 3e-6 constante, weight decay 0.01, grad clip 1.0 y límites de 8192 tokens de prompt y 1024 de respuesta por turno. El código de entrenamiento es el del repositorio OEL (LMOps).

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Resolución de tareas de atención al cliente en el dominio de telecomunicaciones según el formato de tau2-bench.
- Internalización de habilidades procedimentales: el modelo alumno debe operar sin la habilidad explícita en el prompt de sistema.
- Seguimiento de instrucciones y rol de agente conversacional con simulador de usuario.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en destilación sobre política: sirve como artefacto reproducible para estudiar cómo un modelo pequeño internaliza habilidades inyectadas en el prompt del profesor, con hiperparámetros y configuración documentados.
- Evaluación en tau2-bench telecom: permite reproducir y comparar resultados del ajuste frente al modelo base en el benchmark de referencia.
- Atención al cliente en telecomunicaciones (prototipo): el ajuste está orientado a diálogos de soporte técnico y gestión de incidencias, aunque su validación se limita al benchmark.
- Estudio de eficiencia de datos: con solo 16 pares efectivos, es un caso de análisis sobre el mínimo de datos necesario para transferir una habilidad procedimental.
- Base para experimentos de ablación: al fijar semilla, época y tamaño de lote, facilita comparaciones controladas frente a otras variantes del mismo autor.
- Punto de partida para ajustes posteriores: puede servir como inicialización en pipelines de fine-tuning específicos de dominio, dado su tamaño contenido (4,4 B de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la configuración de entrenamiento sobre tau2-bench telecom (v1.0.1) pero no incluye métricas de evaluación finales (pass@k, tasas de éxito ni comparaciones numéricas).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9 GB solo para pesos (4,41 B de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en FP16/BF16 con contexto de 8192 tokens: aproximadamente 10-12 GB según implementación y tamaño de lote.
- GPU recomendadas: A100, H100 o L40S para despliegue con throughput alto; RTX 4090 (24 GB) para inferencia en BF16 con margen.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en BF16; en GPUs de 16 GB requeriría cuantización a 8 bits (no documentada por el autor).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama si se generan cuantizaciones propias a partir de los safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-t2-source-utility-n22 | 4,41 B | no disponible (entrenamiento con prompt <= 8192) | no disponible | Ajuste experimental OPSD sobre tau2-bench telecom |
| Qwen/Qwen3-4B-Instruct-2507 | 4 B | no disponible en esta ficha | no disponible en esta ficha | Modelo base; referencia directa de comparación |
| Otras variantes del mismo autor (MANGSEOK123) | no disponible | no disponible | no disponible | El ID sugiere una familia de experimentos con distintas configuraciones (n22, source-utility) |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: entrenado con 16 pares efectivos y 1 época; no está validado para uso general en producción.
- Especialización estrecha: el ajuste se limita al dominio telecom de tau2-bench; el rendimiento fuera de ese dominio no está documentado.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del modelo base.
- Riesgo de alucinación: inherente al modelo base y no evaluado en esta ficha.
- Dependencia del simulador: el entrenamiento usa GPT-4.1-mini como simulador de usuario, lo que puede introducir sesgos del simulador en el comportamiento aprendido.
- Sin benchmarks publicados: no hay evidencia numérica de mejora frente al modelo base.
- Sin cuantizaciones oficiales: el despliegue en hardware limitado requiere generarlas por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-t2-source-utility-n22
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio OEL (LMOps) citado en la model card: no disponible como enlace directo en la información proporcionada
- tau2-bench (v1.0.1): no disponible como enlace directo en la información proporcionada
