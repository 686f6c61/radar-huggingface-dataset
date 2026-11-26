# MANGSEOK123/qwen3-4b-bfcl-oel-t2-source-utility-n95

## Resumen

`qwen3-4b-bfcl-oel-t2-source-utility-n95` es un ajuste fino del modelo Qwen3-4B-Instruct-2507 desarrollado por el usuario MANGSEOK123. Se trata de un experimento de investigación centrado en la internalización de habilidades (*skill internalization*) mediante autodestilación en política (*on-policy self-distillation*, OPSD) sobre el conjunto de evaluación BFCL-v3 (Berkeley Function Calling Leaderboard), en su variante `multi_turn_base`. El objetivo es que el modelo alumno aprenda a ejecutar tareas de llamada a funciones multi-turno sin necesidad de que la habilidad se le indique explícitamente en el prompt del sistema.

El modelo parte de la arquitectura Qwen3 de 4B parámetros (4.411.424.256 parámetros reales según el archivo safetensors) y conserva las capacidades del modelo base, pero incorpora un proceso de destilación en el que un profesor congelado (copia del modelo inicial con la habilidad inyectada en el system prompt) guía al alumno que opera sin esa habilidad. El entrenamiento se realizó con el framework OEL (LMOps) y una configuración controlada de 95 pares de entrenamiento.

Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin model card extendida ni resultados de benchmarks publicados. Su relevancia es metodológica: ilustra una técnica concreta de internalización de habilidades en modelos pequeños orientados a *tool calling*, más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), no se especifica variante concreta en la informacion disponible |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec oficial; el entrenamiento usa prompt <= 8192 y respuesta <= 1024 tokens por turno |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repo | 8,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4,4 mil millones de parámetros. Sobre esa base se aplica un proceso de autodestilación en política (OPSD) con el código de OEL (LMOps). El profesor es una copia congelada del modelo inicial que recibe la habilidad en el system prompt; el alumno ejecuta cada tarea sin la habilidad, con temperatura T=0,7. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del alumno.

La configuración de entrenamiento es deliberadamente reducida y controlada: 95 pares de entrenamiento (88 tras recortar al múltiplo de 8), 1 época, 8 pares por actualización, semilla 42, AdamW con lr 3e-6 constante, weight decay 0,01 y grad clip 1,0. La selección de habilidades usa utilidad de la tarea fuente U = +1 (habilidades con pass@3). El conjunto de datos es BFCL-v3 `multi_turn_base` con partición 125/75 train/test según `bfcl_eval==2025.6.14`, en el escenario "Table 2" (solo contexto de tarea fuente, sin refinamiento, pool emparejado al método más pequeño por benchmark).

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Llamada a funciones (*tool calling*) multi-turno, foco explícito del ajuste sobre BFCL-v3 `multi_turn_base`.
- Internalización de habilidades: el modelo alumno se entrena para ejecutar la tarea sin que la habilidad se declare en el system prompt.
- Razonamiento multi-paso dentro de una conversación con herramientas, en la medida en que lo soporte el modelo base.
- Capacidades multilingües: no documentadas específicamente para este ajuste; dependen del modelo base.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.

## Casos de uso

- Investigación en internalización de habilidades: reproducir o comparar la técnica OPSD/OEL sobre BFCL-v3 con la configuración controlada descrita (95 pares, 1 época), sirviendo como línea base metodológica.
- Evaluación de *tool calling* multi-turno: usar el modelo como sujeto de prueba en pipelines de evaluación BFCL (`bfcl_eval==2025.6.14`) para medir si la habilidad se mantiene sin declararla en el prompt.
- Estudio de destilación en modelos pequeños: analizar el efecto de la KL inversa sobre los top-256 tokens en un modelo de 4B frente a alternativas de ajuste supervisado.
- Prototipado de agentes conversacionales con herramientas: el modelo puede integrarse en bucles de agente multi-turno donde las herramientas se invocan de forma implícita, aunque sin garantías de producción.
- Ablación de configuraciones de entrenamiento: el checkpoint permite comparar contra variantes del mismo autor (por ejemplo, otras semillas o tamaños de pool) para aislar el efecto de la selección por utilidad U = +1.
- Docencia y experimentación académica: ejemplo práctico de autodestilación en política con un framework open source (OEL/LMOps) sobre un modelo base abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9 GB solo para pesos (4,41B parámetros × 2 bytes), más overhead de activaciones y caché KV; presupuesto realista de 12-16 GB según longitud de contexto.
- Cuantización: no se publican versiones GGUF/AWQ/GPTQ; habría que generarlas a partir de los safetensors BF16.
- GPU recomendadas: A100/H100 para evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 sin cuantizar.
- GPU de consumo: cabe en GPUs de 16 GB o más en BF16; en 8-12 GB requeriría cuantización a 8 o 4 bits (no publicada).
- Despliegue: compatible con `transformers` y con `text-generation-inference` (tag `text-generation-inference`, `endpoints_compatible`); también podría servirse con vLLM o llama.cpp tras conversión, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-bfcl-oel-t2-source-utility-n95 | 4,41B | no disponible (entrenamiento con prompt <= 8192) | Ajuste OPSD sobre BFCL-v3 multi_turn_base | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | según model card del base (no verificada aquí) | Instrucción general + tool calling | según model card del base | Ampliamente disponible |
| Otras variantes del mismo autor (semillas/pools distintos) | ~4,41B | mismo esquema de entrenamiento | Ablaciones de la misma técnica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- Sin resultados de benchmarks publicados: no se puede afirmar mejora o degradación frente al modelo base.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que consultar la licencia del modelo base Qwen3-4B-Instruct-2507 y la del checkpoint.
- Idiomas no documentados: el comportamiento multilingüe depende del modelo base y no está verificado tras el ajuste.
- Riesgo de sobreajuste al escenario BFCL-v3 `multi_turn_base` con solo 95 pares y 1 época; la generalización a otras tareas de tool calling es incierta.
- Riesgo de alucinación inherente al modelo base, no mitigado por este ajuste.
- Sesgos: no documentados; se heredan los del modelo base.
- El proceso OPSD puede degradar capacidades no relacionadas con la habilidad internalizada; no hay evaluación de olvido catastrófico en la información disponible.
- Restricciones de contexto: el entrenamiento limita a 8192 tokens de prompt y 1024 de respuesta por turno; no se garantiza comportamiento fuera de ese rango.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-bfcl-oel-t2-source-utility-n95
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- BFCL (Berkeley Function Calling Leaderboard): https://gorilla.cs.berkeley.edu/leaderboard.html
- Repositorio de evaluación BFCL: https://github.com/ShishirPatil/gorilla/tree/main/berkeley-function-call-leaderboard
- Framework OEL (LMOps): https://github.com/microsoft/LMOps
