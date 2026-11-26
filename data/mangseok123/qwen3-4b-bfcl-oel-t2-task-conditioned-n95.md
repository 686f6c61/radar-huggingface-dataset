# MANGSEOK123/qwen3-4b-bfcl-oel-t2-task-conditioned-n95

## Resumen

qwen3-4b-bfcl-oel-t2-task-conditioned-n95 es un ajuste fino del modelo Qwen3-4B-Instruct-2507 desarrollado por el usuario MANGSEOK123. El modelo aplica una técnica de "internalización de habilidades" (skill internalization) mediante autodestilación en política (on-policy self-distillation, OPSD) sobre el conjunto de datos BFCL-v3 multi_turn_base, orientado a mejorar el comportamiento del modelo en tareas de tool calling conversacional y uso de funciones en múltiples turnos.

El entrenamiento sigue el marco experimental OEL (LMOps) y se corresponde con una configuración controlada de la Tabla 2 del trabajo asociado: contexto de la tarea fuente únicamente, sin refinamiento y con un conjunto de pares emparejado al método más pequeño por benchmark. Se usaron 95 pares de entrenamiento (88 efectivos tras el recorte a múltiplo de 8), una época y 8 pares por actualización, con un profesor congelado (copia del modelo inicial con la habilidad en el system prompt) y un alumno que resuelve cada tarea sin la habilidad.

Se trata de un modelo de 4.411.424.256 parámetros en BF16, con arquitectura transformer densa heredada de Qwen3-4B-Instruct-2507, publicado en formato safetensors y compatible con transformers y text-generation-inference. Su interés es principalmente de investigación: documenta un protocolo reproducible de destilación de habilidades en modelos pequeños para tareas agénticas de llamada a funciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el entrenamiento usa prompt <= 8192 y respuesta <= 1024 tokens por turno) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.400 millones de parámetros, y se ajusta mediante autodestilación en política (OPSD). El profesor es una copia congelada del modelo inicial que incluye la habilidad objetivo en su system prompt; el alumno es el propio modelo en entrenamiento, que resuelve cada tarea sin la habilidad con temperatura 0,7. La pérdida es una KL inversa a nivel de token calculada sobre los 256 tokens más probables del alumno.

El conjunto de datos es BFCL-v3 multi_turn_base (bfcl_eval==2025.6.14), con partición 125/75 de entrenamiento y prueba. Se emplearon 95 pares de entrenamiento (88 tras recortar a múltiplo de 8), 1 época, 8 pares por actualización y semilla 42. La selección de habilidades exige resolver al menos la mitad de hasta 4 variantes aumentadas agnósticas de la tarea fuente (pass@3). El optimizador es AdamW con lr 3e-6 constante, weight decay 0,01 y grad clip 1,0. El entrenamiento se realizó con el código de OEL (LMOps).

## Capacidades

- Generación de texto conversacional multi-turno.
- Llamada a funciones y herramientas (tool calling / function calling) en escenarios multi-turno, objetivo principal del ajuste sobre BFCL-v3 multi_turn_base.
- Internalización de habilidades: el modelo aprende a resolver tareas que originalmente requerían una instrucción de sistema explícita, sin necesidad de incluirla.
- Razonamiento multi-paso orientado a agentes, heredado del modelo base.
- Capacidades generales de Qwen3-4B-Instruct-2507 (comprensión lectora, código, matemáticas), no evaluadas específicamente en esta ficha.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de llamada a funciones: el modelo puede gestionar conversaciones multi-turno donde debe invocar herramientas de forma secuencial, que es exactamente el dominio sobre el que se entrenó (BFCL multi_turn_base).
- Investigación en destilación de habilidades: sirve como referencia reproducible para estudiar OPSD con conjuntos de pares pequeños (95 pares) en modelos de 4B.
- Evaluación comparativa de métodos de internalización: útil para contrastar contra variantes con refinamiento o con conjuntos de pares mayores dentro del marco OEL.
- Prototipado de asistentes con herramientas en entornos con recursos limitados: al ser un modelo de 4B en BF16, puede desplegarse en una sola GPU de gama alta o cuantizarse para GPUs de consumo.
- Generación de datos sintéticos de trayectorias de herramientas: puede utilizarse para producir ejemplos de llamadas encadenadas que alimenten otros pipelines de ajuste.
- Baseline en experimentos de agentes: permite medir el efecto de la internalización de habilidades frente al modelo base Qwen3-4B-Instruct-2507 en tareas de función.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB para inferencia cómoda.
- En cuantización de 8 bits: en torno a 4,5-5 GB de pesos; en 4 bits: en torno a 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para BF16; RTX 3090/4080/4090 o superiores para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo (RTX 3090, 4080, 4090) si se cuantiza; en BF16 requiere al menos 16 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), y previsiblemente vLLM, llama.cpp u Ollama tras conversión a GGUF, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3-4b-bfcl-oel-t2-task-conditioned-n95 | 4,41 B | no disponible | no disponible | Ajuste OPSD sobre BFCL-v3 multi_turn_base |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,4 B | no disponible | no disponible | Modelo base sin internalización de habilidades |
| Otros ajustes BFCL de la misma familia | no disponible | no disponible | no disponible | No se dispone de datos de rendimiento comparado |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento; no es posible verificar la mejora real frente al modelo base.
- El ajuste se realizó con solo 95 pares (88 efectivos) y 1 época, lo que limita la generalización fuera del dominio BFCL multi_turn_base.
- Riesgo de sobreajuste a las tareas específicas del benchmark y de degradación en capacidades generales no evaluadas.
- Licencia no especificada: no se puede garantizar el uso comercial; conviene consultar la licencia del modelo base Qwen3-4B-Instruct-2507.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en llamadas a funciones con esquemas complejos.
- El modelo está pensado para investigación y reproducción experimental, no como producto listo para producción.
- La fecha de creación indicada (2026-11-26) y la ausencia de descargas o likes sugieren un artefacto de investigación sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-bfcl-oel-t2-task-conditioned-n95
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la información proporcionada
- Repositorio OEL (LMOps): no disponible en la información proporcionada
- Paper asociado: no disponible en la información proporcionada
