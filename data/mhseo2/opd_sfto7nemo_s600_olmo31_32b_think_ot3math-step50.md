# mhseo2/opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step50

## Resumen

`opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step50` es un checkpoint intermedio de destilación on-policy (on-policy distillation, OPD) publicado por el usuario de Hugging Face `mhseo2`. El modelo parte de un SFT de OLMo 3 Base de 7B ajustado con Nemotron-Math-v2 (paso 600) y se destila hacia `allenai/Olmo-3.1-32B-Think` como profesor, tras 50 pasos de entrenamiento. El resultado es un modelo de 7.298.011.136 parámetros (aproximadamente 7,3B) con pesos en safetensors y licencia Apache 2.0.

El interés de esta ficha es acotado: no se trata de un modelo de propósito general listo para producción, sino de un artefacto de investigación que documenta un experimento de destilación en el dominio de matemáticas con razonamiento extendido (modo *think*). El autor no ha publicado resultados de evaluación todavía; la model card indica que las métricas (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) están pendientes de los *workers* de evaluación.

Por tanto, esta ficha describe la arquitectura heredada de OLMo 3, el procedimiento de entrenamiento documentado y las capacidades esperables por su linaje, pero advierte de que cualquier uso en producción debe ir precedido de una evaluación propia, dado que no hay benchmarks publicados ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje OLMo 3, según tags `olmo3`/`olmo`) |
| Parametros totales | 7.298.011.136 (7,3B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible (el entrenamiento usa respuestas de hasta 32.768 tokens, no equivale a la ventana del modelo) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards: `model-00001-of-00003.safetensors`, `model-00002-of-00003.safetensors`, `model-00003-of-00003.safetensors`) + `model.safetensors.index.json` |
| Tamano del repo | 14,6 GB |
| Modelo base (fine-tune) | `mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600` |
| Profesor de destilacion | `allenai/Olmo-3.1-32B-Think` (revision `97ade57a9cc5`) |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo 3 en su variante de 7B, un transformer decoder-only con los componentes estándar de la familia (atención multi-cabeza, normalización RMSNorm y tokenizador propio, según los ficheros `tokenizer.json`, `vocab.json` y `merges.txt` incluidos). El checkpoint no introduce cambios arquitectónicos: es un ajuste fino del modelo base indicado, que a su vez es un SFT de OLMo 3 Base 7B sobre el dataset Nemotron-Math-v2.

El entrenamiento es una destilación on-policy. En cada paso se muestrean 60 prompts de matemáticas de OpenThoughts3 (53.105 preguntas sin respuestas) y se generan 4 rollouts por prompt con temperatura 1 y hasta 32.768 tokens de respuesta, produciendo rollouts del propio estudiante. Sobre esos rollouts se aplica una pérdida de KL inversa por token respecto al profesor (`allenai/Olmo-3.1-32B-Think`), con top-32 del profesor y sin recompensa de tarea (k1). Se usa AdamW con learning rate constante de 5e-6 y weight decay 0,01. El entrenamiento se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno: estudiante con FSDP + vLLM y profesor con vLLM en tensor parallel 2. El checkpoint publicado corresponde al paso 50 y el código usado es el árbol `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generación de texto y razonamiento matemático en modo *think*: el modelo está entrenado explícitamente para producir cadenas de razonamiento largas (hasta 32.768 tokens por respuesta durante el entrenamiento).
- Resolución de problemas de competición matemática: el linaje (Nemotron-Math-v2 + destilación desde Olmo-3.1-32B-Think sobre OpenThoughts3) apunta a este dominio como objetivo principal.
- Razonamiento multi-paso: la pérdida de destilación sobre rollouts propios favorece la imitación de trayectorias de razonamiento del profesor de 32B.
- Tool calling / function calling: no disponible en la información proporcionada; el modelo base se etiqueta como `notool`, lo que sugiere que no se entrenó con herramientas.
- Capacidades de agente: no disponible; no hay evidencia de entrenamiento para uso agéntico.
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card ni en los tags.
- Capacidades especiales (visión, audio): no disponible; no se declaran.

## Casos de uso

- Investigación en destilación on-policy: el checkpoint sirve como punto de comparación (paso 50) frente a otros pasos del mismo experimento para estudiar la evolución de la KL inversa y la calidad de los rollouts del estudiante.
- Reproducción de experimentos de OPD: con el código `mopdRL` y los prompts de OpenThoughts3 documentados, un equipo puede reproducir el pipeline en clústeres con H100 y comparar configuraciones (temperatura, top-k del profesor, learning rate).
- Evaluación de la transferencia de razonamiento de 32B a 7B: útil para medir cuánto del comportamiento *think* de `Olmo-3.1-32B-Think` se retiene en un estudiante de 7,3B tras 50 pasos.
- Generación de soluciones matemáticas paso a paso en entornos de investigación: el modelo puede producir cadenas de razonamiento largas, adecuadas para analizar la estructura de las soluciones, no necesariamente para uso directo en producción sin evaluación.
- Estudio de la relación entre longitud de respuesta y calidad: al haberse entrenado con respuestas de hasta 32.768 tokens, permite analizar si el estudiante imita la verbosidad del profesor y cómo afecta a la precisión.
- Base para un ajuste posterior con RL o verificación: al ser un checkpoint intermedio, puede servir como inicialización para etapas posteriores de entrenamiento con recompensas de verificación matemática.
- Análisis de sesgos de imitación: permite estudiar si el estudiante hereda errores sistemáticos del profesor en dominios fuera de matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) están pendientes de ejecución en los *workers* de evaluación y que se añadirán cuando finalicen.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14,6 GB solo para pesos (7,3B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 16-18 GB con contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB de pesos, más overhead; en 4 bits, alrededor de 4-5 GB de pesos.
- GPU recomendadas: H100 o A100 para entrenamiento y evaluación a gran escala (el autor usó 8 H100 en 2 nodos para el pipeline completo con profesor de 32B); para inferencia del estudiante, una RTX 4090 (24 GB) o RTX A6000 (48 GB) es suficiente en BF16.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 24 GB (RTX 3090, 4090) y en cuantizaciones de 8/4 bits en tarjetas de 8-16 GB, siempre que se genere la cuantización (el repo solo publica safetensors sin cuantizar).
- Opciones de despliegue: vLLM (usado por el autor para estudiante y profesor), FSDP para entrenamiento, y presumiblemente llama.cpp/Ollama tras conversión a GGUF, aunque no se proporciona ninguna conversión oficial.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step50` (este) | 7,3B | no disponible | Matemáticas / razonamiento | Apache 2.0 | Hugging Face, checkpoint intermedio |
| `mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600` (base) | ~7B (no confirmado) | no disponible | Matemáticas | no disponible en la información | Hugging Face |
| `allenai/Olmo-3.1-32B-Think` (profesor) | 32B (no confirmado) | no disponible | Razonamiento general | no disponible en la información | Hugging Face |
| OLMo 3 Base 7B (familia) | ~7B | no disponible | Propósito general | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparables para estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, linaje y licencia.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 50 de un entrenamiento de destilación; no es un modelo final ni ha pasado por una fase de evaluación publicada.
- Sin benchmarks: no hay resultados de AIME, HMMT ni otras pruebas, por lo que no se puede afirmar su calidad relativa frente al profesor o al modelo base.
- Dominio estrecho: entrenado exclusivamente con prompts de matemáticas de OpenThoughts3; es esperable un rendimiento pobre fuera de ese dominio.
- Sin herramientas: el modelo base está etiquetado como `notool`, por lo que no se debe asumir soporte fiable de function calling.
- Idiomas no declarados: no hay información sobre cobertura multilingüe; se debe asumir un sesgo hacia el inglés de los datasets de entrenamiento.
- Riesgo de alucinación: como todo modelo de razonamiento, puede generar cadenas de razonamiento plausibles pero incorrectas; la destilación desde un profesor de 32B no garantiza corrección.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las licencias del modelo base y del profesor, así como de los datasets (OpenThoughts3, Nemotron-Math-v2), antes de un uso comercial.
- Reproducibilidad: el checkpoint depende de un código concreto (`mopdRL`, commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`) y de un profesor con revisión fija; cambios en esos artefactos pueden alterar los resultados.
- Sin cuantizaciones oficiales: solo se publican pesos safetensors; cualquier GGUF o AWQ debe generarse y validarse por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step50
- Modelo base (SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600
- Profesor de destilación: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Repositorio de código `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`): no disponible como URL en la información proporcionada
- Dataset OpenThoughts3: no disponible como URL en la información proporcionada
- Dataset Nemotron-Math-v2: no disponible como URL en la información proporcionada
