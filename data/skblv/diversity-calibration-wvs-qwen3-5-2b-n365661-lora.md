# skblv/diversity-calibration-wvs-qwen3.5-2b-n365661-lora

## Resumen

El modelo `diversity-calibration-wvs-qwen3.5-2b-n365661-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario skblv sobre el modelo base Qwen/Qwen3.5-2B. Se trata de un ajuste fino especializado en reproducir la distribución de respuestas de encuestados de la World Values Survey (WVS) Ronda 7, condicionado por un perfil demográfico y una pregunta con opciones de respuesta. No es un modelo de propósito general, sino un artefacto de investigación orientado a calibrar la diversidad de las respuestas generadas por un LLM.

El adaptador se entrenó durante tres épocas sobre 365.661 ejemplos de pares encuestado–pregunta, utilizando LoRA de rango 16 con alpha 32 y dropout 0.05. La pérdida se aplicó exclusivamente al token de la letra de respuesta y al token de fin de secuencia (EOS), enmascarando los tokens del prompt. El trabajo se enmarca en el artículo «Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs» (Skobelev, Fithian y Han, 2026), que aborda el problema de la diversidad en las distribuciones de salida de los modelos de lenguaje.

Su relevancia radica en que constituye un caso reproducible de calibración de diversidad mediante ajuste fino supervisado: el adaptador aprende a generar respuestas cuya distribución agregada se aproxima a la diversidad observada en la población real (R = 1 en la curva de convergencia). Es un recurso útil para investigadores que estudian sesgos demográficos, simulación de opinión pública o evaluación de la fidelidad distribucional de LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el base tiene 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B, un transformer denso de aproximadamente 2.000 millones de parámetros. El ajuste fino emplea LoRA de rango 16, alpha 32 y dropout 0.05. El conjunto de entrenamiento consta de 365.661 ejemplos extraídos de la World Values Survey Ronda 7 (Haerpfer et al., 2022, v6.0.0), usando una partición aleatoria fija de un tercio de los países y de las preguntas medibles. Cada prompt contiene una persona demográfica, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo es la letra seleccionada por el encuestado.

El entrenamiento se realizó durante tres épocas. Los tokens del prompt se enmascaran en la pérdida, que se calcula únicamente sobre el token o tokens de la letra de respuesta y el token EOS. La innovación técnica principal no reside en la arquitectura, sino en el objetivo de calibración: el adaptador busca corregir simultáneamente el colapso de moda (mode collapse) y la sobredispersión en la distribución de respuestas, de modo que la diversidad relativa de las salidas converja hacia la diversidad calibrada (R = 1), tal como se documenta en la curva de convergencia incluida en la model card.

## Capacidades

- Generación de texto condicionada a preguntas de encuesta con opciones de respuesta múltiple.
- Simulación de respuestas de encuestados a partir de un perfil demográfico explícito en el prompt.
- Reproducción de distribuciones de respuesta calibradas respecto a datos poblacionales reales (WVS Ronda 7).
- Generación restringida al formato de letra de opción y EOS, lo que facilita el parseo automático de salidas.
- Capacidades heredadas del modelo base Qwen3.5-2B (generación de texto general), aunque el adaptador está especializado y puede degradar el rendimiento fuera de su dominio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; el conjunto de entrenamiento es la WVS, cuyos cuestionarios se administran en múltiples idiomas, pero la model card no especifica la composición lingüística.

## Casos de uso

- Simulación de opinión pública: generar distribuciones sintéticas de respuesta a preguntas de la WVS para países y grupos demográficos incluidos en la partición de entrenamiento, comparándolas con las observadas empíricamente.
- Investigación sobre calibración de diversidad: evaluar si el ajuste fino supervisado corrige el colapso de moda en modelos pequeños, replicando el protocolo del artículo de Skobelev et al. (2026).
- Aumento de datos para ciencias sociales: producir respuestas sintéticas etiquetadas por perfil demográfico para preentrenar o validar modelos de imputación de opinión.
- Auditoría de sesgos demográficos: analizar cómo varía la distribución de respuestas generadas entre perfiles de edad, género, educación o país, y contrastarla con la WVS real.
- Docencia y experimentación con PEFT: ejemplo reproducible de ajuste LoRA con enmascaramiento de pérdida sobre el token de respuesta, útil en cursos de ajuste fino.
- Validación de pipelines de evaluación distribucional: usar el adaptador como referencia para comprobar métricas de diversidad relativa (R) en herramientas de evaluación de LLMs.
- Estudio de transferencia entre países: dado que el entrenamiento excluye dos tercios de los países, sirve para medir la generalización demográfica fuera de la partición de entrenamiento (con las cautelas del caso).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una curva de convergencia de diversidad relativa (R) que muestra la posición de este adaptador respecto a la banda intercuartílica de pares pregunta–grupo demográfico y a la línea de diversidad calibrada (R = 1), pero no se proporcionan valores numéricos de MMLU, HumanEval, GSM8K ni de métricas distribucionales concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en sí ocupa un espacio mínimo (repo de 0,0 GB según Hugging Face, es decir, menos de 100 MB); el coste real corresponde al modelo base Qwen3.5-2B. En fp16 se estiman en torno a 4-5 GB de VRAM; en cuantización de 8 bits, aproximadamente 2-3 GB; en 4 bits, alrededor de 1,5-2 GB (estimaciones para el base, no verificadas en la información proporcionada).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el base en cuantización; RTX 3060/4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y GPUs integradas con suficiente memoria unificada, siempre que se cuantice el base.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en despliegue; llama.cpp y Ollama requerirían fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diversity-calibration-wvs-qwen3.5-2b-n365661-lora | Adaptador LoRA sobre base de 2B | no disponible | LoRA especializado en WVS | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | Transformer denso | no disponible | Hugging Face |
| Adaptadores LoRA de calibración demográfica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores de calibración de diversidad sobre la WVS que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para responder preguntas de la WVS Ronda 7 con formato de letra de opción; su uso como modelo conversacional general degradará la calidad de salida.
- Cobertura demográfica parcial: solo se entrenó con un tercio fijo de los países y de las preguntas medibles, por lo que la generalización a países o ítems no vistos no está garantizada.
- Riesgo de reproducir y amplificar sesgos presentes en la WVS: la calibración distribucional replica la distribución observada, incluidos sus sesgos de muestreo y de no respuesta.
- Riesgo de alucinación: aunque la salida se restringe a letras de opción, el modelo puede asignar probabilidad a opciones inexistentes o mal formateadas si el prompt se desvía del formato de entrenamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles: no se documenta qué lenguas cubre el adaptador ni su calidad por idioma.
- Contexto máximo no disponible: se desconoce la ventana efectiva para prompts con personas demográficas largas.
- Artefacto de investigación con 0 descargas y 0 likes: no ha sido validado por la comunidad; se recomienda evaluar su comportamiento antes de usarlo en estudios.
- Fecha de creación y actualización inusuales (2026): conviene verificar la integridad del repositorio y la disponibilidad del modelo base Qwen3.5-2B antes de la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n365661-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Artículo: https://arxiv.org/abs/2609.16454
- Dataset WVS Ronda 7 (v6.0.0): https://doi.org/10.14281/18241.24
- Curva de convergencia (imagen): assets/convergence.png (relativa al repositorio del modelo)
- Curva de convergencia (PDF): assets/convergence.pdf (relativa al repositorio del modelo)
