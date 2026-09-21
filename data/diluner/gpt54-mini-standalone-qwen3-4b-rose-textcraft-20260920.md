# Diluner/gpt54-mini-standalone-qwen3-4b-rose-textcraft-20260920

## Resumen

gpt54-mini-standalone-qwen3-4b-rose-textcraft-20260920 es un ajuste fino de Qwen/Qwen3-4B publicado por el usuario Diluner en HuggingFace. Se trata de un checkpoint final de un entrenamiento "standalone" (inicializado de forma independiente desde el modelo base, no como continuación secuencial de otro checkpoint) en el que se aplicó la receta ROSE usando como profesor al modelo denominado `gpt-5.4-mini`. El objetivo declarado del experimento es el entrenamiento orientado a agentes en un entorno textual concreto, denominado textcraft, con cinco épocas y 55 actualizaciones de optimizador en esa etapa.

El modelo conserva el tamaño del base: 4.411.424.256 parámetros reales según los pesos en safetensors, con un repositorio de 8,8 GB. La model card no declara licencia propia y remite a los términos del modelo base, ni especifica idiomas soportados, tipos de cuantización publicados o detalles de composición del dataset de entrenamiento. La relevancia de esta ficha es principalmente de investigación: documenta un experimento reproducible de destilación/entrenamiento con profesor propietario sobre un modelo abierto de 4B, con una única métrica publicada (80,5% de éxito avg@4 en textcraft) y con advertencias explícitas del propio autor sobre su alcance limitado.

Conviene subrayarlo: el autor indica que se trata de un único checkpoint y que no constituye evidencia de una ventaja general del método ni de replicación entre semillas, además de señalar que las recetas SFT y ROSE comparadas no son un ablation objetivo y que los artefactos de evaluación reparados reutilizan rollouts originales de forma parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, heredada de Qwen3-4B (no se detalla en la model card) |
| Parametros totales | 4.411.424.256 (dato de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base Qwen3-4B |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors de precision completa; no hay GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | No disponible |
| Licencia | No disponible: la model card indica explicitamente que no se afirma ninguna licencia y remite al modelo base y a los terminos aplicables |
| Formato de pesos | safetensors (transformers); configuracion, tokenizer y todos los shards en la raiz del repositorio |
| Modelo base | Qwen/Qwen3-4B |
| Tamano del repositorio | 8,8 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only denso. La model card de este checkpoint no describe la arquitectura interna (número de capas, dimensiones, tipo de atención o esquema de normalización), por lo que cualquier detalle adicional debe consultarse en la documentación del modelo base. Los 4,41B de parámetros en safetensors frente a los ~4,0B reportados por Qwen para Qwen3-4B son compatibles con un esquema de embeddings no atados, pero esto no se confirma en la información disponible.

En cuanto al entrenamiento, el autor indica que se usó la receta ROSE con profesor `gpt-5.4-mini` sobre el entorno textcraft: cinco épocas y 55 actualizaciones de optimizador en esa etapa. El entrenamiento se describe como "standalone", esto es, inicializado de forma independiente desde el modelo base y no como checkpoint secuencial. La ejecución que produjo el checkpoint es `fbc2ni6j` en el servidor original; una ejecución posterior, `r71ai9q4`, reanudó el paso 55 ya completado y realizó cero actualizaciones. El autor advierte que las recetas históricas de SFT y ROSE difieren en el calendario de learning rate, weight decay, precisión de parámetros, formato y algunos límites de turnos de entrenamiento, de modo que la comparación entre ambas no es un ablation sobre el objetivo únicamente. No se publican el estado del optimizador, los logs brutos ni las trayectorias del profesor; el repositorio incluye un `experiment.json` con referencias legibles por máquina y sumas de comprobación.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de tokenizer de Qwen3.
- Ejecución de tareas de agente en entornos textuales con múltiples turnos: la evaluación publicada corresponde al entorno textcraft, con 512 tokens generados por turno.
- Aprendizaje por destilación desde un profesor propietario (`gpt-5.4-mini`) mediante la receta ROSE, orientado a comportamiento de agente.
- Razonamiento en modo "thinking" desactivado durante la evaluación publicada; no se documenta el comportamiento con thinking activado.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada (el tag `agent-training` sugiere entrenamiento orientado a agentes, pero no se detalla el formato de herramientas).
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio): no disponibles; el pipeline declarado es únicamente text-generation.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (`endpoints_compatible`).

## Casos de uso

- Evaluación de recetas de destilación con profesor propietario: el checkpoint sirve como referencia reproducible para estudiar cómo se comporta ROSE sobre un base abierto de 4B en una única tarea de agente, con métrica avg@4 declarada (80,5%).
- Agentes en entornos textuales con comandos estructurados: dado que la evaluación se realizó íntegramente en textcraft, el modelo está ajustado para interpretar observaciones de entorno y emitir comandos válidos a lo largo de episodios multi-turno.
- Prototipado de pipelines de agente antes de invertir en modelos mayores: con 4,41B de parámetros puede ejecutarse en una sola GPU consumer, lo que permite iterar sobre prompts, formatos de observación y límites de turnos a bajo coste.
- Punto de partida para fine-tuning adicional: al ser un export estándar de transformers con safetensors, se puede continuar el entrenamiento o aplicar LoRA/QLoRA sobre él para dominios específicos.
- Despliegue en local o en infraestructura propia con requisitos de privacidad: el tamaño permite servir el modelo en una máquina con GPU de gama media sin enviar datos a terceros.
- Investigación sobre olvido catastrófico: comparar este checkpoint frente a Qwen3-4B original permite medir qué capacidades generales se conservan o se degradan tras un ajuste intensivo en una única tarea.
- Generación de texto conversacional de bajo coste: para asistentes simples donde el contexto requerido no sea muy largo y el rendimiento exigido sea moderado.

## Benchmarks y rendimiento

El único resultado publicado en la información proporcionada es la evaluación en textcraft. Se realizó con avg@4 (media de éxito en cuatro intentos por tarea oficial de test, no mejor-de-cuatro), temperatura 0,4, top-p 1,0, top-k 20, thinking desactivado y 512 tokens generados por turno.

| Entorno | Exitos / intentos | avg@4 | Errores de episodio |
|---|---:|---:|---:|
| textcraft | 322 / 400 | 80,5000% | 0 |

El autor advierte que las comprobaciones de resultados guardados verificaron la cobertura exacta de tareas y muestras y la consistencia de las puntuaciones, pero que cero errores de episodio no implica que todos los turnos generados estén bien formados. Para MMLU, HumanEval, GSM8K u otros benchmarks estándar: no se han publicado resultados en la información disponible. Tampoco se publican datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, según precisión (cálculo a partir de los 4,41B de parámetros): ~8,8 GB solo de pesos en FP16/BF16, ~17,6 GB en FP32, ~4,4 GB en INT8 y en torno a 2,5-3 GB en 4 bits.
- Con caché KV y overhead de runtime, en la práctica se recomienda: 10-12 GB de VRAM en FP16, 6-8 GB en INT8 y 4-6 GB en 4 bits para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S, A10G o L4 para despliegue en servidor; RTX 4090, RTX 4080, RTX 4070 Ti y RTX 3090 para estaciones de trabajo.
- Cabe en GPU consumer: sí. En FP16 entra en RTX 4090 (24 GB) y en RTX 3090 (24 GB) con margen; en 4 bits entra en GPUs de 8 GB como RTX 3060 Ti o RTX 4060, y muy justo en 6 GB.
- Opciones de despliegue: transformers (ruta indicada en la model card), vLLM, SGLang, text-generation-inference (el modelo está etiquetado como compatible), y llama.cpp/Ollama/LM Studio si se convierte previamente a GGUF, conversión que no se distribuye en este repositorio.
- Coste de caché KV: no se han publicado mediciones; dependerá de la configuración de atención del modelo base y de la longitud de contexto efectiva utilizada.
- Latencia y throughput: no disponible. No hay datos publicados de tokens por segundo ni de tiempo por turno.

## Comparativa con modelos similares

La comparación se limita a datos estructurales verificables, ya que no hay resultados de benchmarks estándar publicados para este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Este checkpoint (gpt54-mini-standalone-qwen3-4b-rose-textcraft) | 4,41B (safetensors) | No disponible | No disponible (remite al base) | HuggingFace, 0 descargas, 0 likes | 80,5% avg@4 en textcraft |
| Qwen/Qwen3-4B (base) | ~4,0B reportados por Qwen | No disponible en esta busqueda | La del modelo base | HuggingFace | No disponible |
| Otros ajustes derivados de Qwen3-4B | ~4,0-4,4B | Variable | Variable | HuggingFace | No disponible |
| Alternativas de ~3-4B (por ejemplo familias tipo Llama 3.2 3B o Gemma 3 4B) | ~3-4B | Variable | Variable | HuggingFace | No disponible |

No se dispone de datos suficientes para una comparación de rendimiento honesta: cualquier cifra de MMLU, HumanEval o GSM8K para estos modelos requeriría medirla, y no está en la información proporcionada.

## Limitaciones y advertencias

- Licencia: la model card no afirma ninguna licencia y remite a los términos del modelo base. Antes de cualquier uso comercial es imprescindible resolver la licencia aplicable, tanto de Qwen3-4B como de los artefactos derivados del profesor `gpt-5.4-mini`.
- Evidencia limitada: es un único checkpoint. El propio autor indica que no constituye evidencia de una ventaja general del método ni de replicación entre semillas de entrenamiento.
- Trazabilidad incompleta: el inventario de selección registra nombres de fichero, tamaños y fechas de modificación, pero no es un hash byte a byte de los tensores ligado a las respuestas de evaluación históricas. Los logs de servicio históricos están incompletos.
- Comparaciones no limpias: las recetas SFT y ROSE difieren en learning rate, weight decay, precisión de parámetros, formato y límites de turnos, por lo que no es un ablation objetivo. Además, la ejecución posterior `r71ai9q4` reanudó el paso 55 y no realizó actualizaciones, de modo que no hubo un reentrenamiento limpio y aislado.
- Evaluación restringida a un único entorno: textcraft, con una configuración concreta de muestreo y thinking desactivado. No hay datos de MMLU, HumanEval, GSM8K ni de tareas de propósito general.
- La evaluación reparada de TextCraft-4B usó un orden de receta y conjuntos de distractores distintos a los de la instancia original del servidor.
- Interpretación de la métrica: cero errores de episodio no implica que todos los turnos generados fueran bien formados; avg@4 mide media de éxito, no mejor-de-cuatro.
- Riesgo de olvido catastrófico: un ajuste intensivo en una sola tarea de agente sobre un base de 4B puede degradar capacidades generales de conversación, código o matemáticas. No se aportan mediciones al respecto.
- Idioma: no se declara ningún idioma soportado. No hay evidencia de calidad en castellano.
- Sesgos: no se ha publicado ningún análisis de sesgos ni de seguridad.
- Alucinación: es un modelo de 4B ajustado para actuar en un entorno textual concreto; fuera de ese dominio el riesgo de respuestas inventadas es alto y no está caracterizado.
- Adopción: cero descargas y cero likes en el momento de redactar esta ficha, sin validación independiente por parte de terceros.
- Estado de despliegue: no se publican pesos cuantizados; usar el modelo en producción exige convertir a GGUF/AWQ/GPTQ o servirlo en FP16 con el coste de VRAM correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Diluner/gpt54-mini-standalone-qwen3-4b-rose-textcraft-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de origen de Qwen3: https://github.com/QwenLM/Qwen3
- Referencias y sumas de comprobación del experimento: fichero `experiment.json` incluido en la raíz del repositorio de HuggingFace.
- Paper, blog o demo adicionales: no disponibles. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo (los resultados obtenidos correspondían a documentación de Google Docs/Sheets y a hilos de foros de idiomas, sin relación con el modelo).
