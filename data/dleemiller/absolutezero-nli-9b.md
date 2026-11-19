# dleemiller/AbsoluteZero-nli-9b

## Resumen

AbsoluteZero-nli-9b es un modelo cross-encoder especializado en inferencia de lenguaje natural (NLI) desarrollado por dleemiller, construido mediante ajuste fino supervisado del modelo base Qwen/Qwen3.5-9B. Su función principal es recibir una premisa (texto) y una hipótesis (afirmación) y devolver probabilidades calibradas de que la premisa implique, contradiga o sea neutra respecto a la hipótesis, una tarea fundamental para detección de alucinaciones, verificación de hechos y clasificación zero-shot.

El modelo destaca por ofrecer dos modos de inferencia: un modo rápido de un solo paso forward con cabeza clasificadora, y un modo "think" en el que el modelo genera una traza de razonamiento corta antes de emitir el veredicto, lo que permite inspeccionar por qué se tomó una decisión de clasificación. Esta observabilidad es poco habitual en cross-encoders tradicionales y resulta relevante para pipelines de RAG y sistemas de guardrails donde la trazabilidad importa.

Con 8.953.827.840 parámetros (aproximadamente 9.000 millones), contexto de hasta 32.000 tokens, licencia Apache-2.0 y soporte únicamente para inglés, el modelo se posiciona como una alternativa de gran tamaño frente a cross-encoders más pequeños como los basados en DeBERTa, a costa de un mayor requisito de cómputo. El autor declara el primer puesto en el OpenNLI Skill Index con una puntuación de 64,5 en modo rápido (fecha 18-11-26).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5) adaptado como cross-encoder con cabeza clasificadora; tipo `qwen3_5_text` con código personalizado |
| Parametros totales | 8.953.827.840 (aproximadamente 9,0B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Documentos de hasta 32.000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo de 17,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer decoder de 9.000 millones de parámetros, y lo adapta como cross-encoder para NLI mediante una cabeza de clasificación que produce probabilidades sobre las etiquetas de implicación, contradicción y neutralidad. La arquitectura requiere `trust_remote_code=True` y se integra con la librería `sentence-transformers` a través de la clase `CrossEncoder`, lo que facilita su uso en pipelines existentes. El contexto de 32.000 tokens permite procesar documentos largos como contratos o políticas completas.

El entrenamiento combina ajuste fino supervisado con datos de los conjuntos propios del autor, `dleemiller/FineCat-NLI` y `dleemiller/FineCat-NLI-Reason`, e incorpora técnicas de destilación de conocimiento y GRPO (Group Relative Policy Optimization) según las etiquetas de la model card. El modo "think" genera trazas de razonamiento de aproximadamente 60 tokens de media en ANLI y unos 250 tokens en problemas de lógica de primer orden, lo que sugiere un entrenamiento específico para producir cadenas de razonamiento breves antes de la clasificación. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Clasificación NLI de tres vías (implicación, contradicción, neutralidad) con probabilidades calibradas.
- Clasificación zero-shot mediante plantillas de hipótesis, como se muestra en el ejemplo de categorización de tickets.
- Modo rápido de un solo paso forward para inferencia de baja latencia.
- Modo "think" con traza de razonamiento inspeccionable para casos difíciles (lógica multi-paso, cuantificadores, negaciones, contratos largos).
- Detección de alucinaciones y verificación de groundedness en respuestas generadas por LLM.
- Verificación de hechos y fact-checking contra pasajes recuperados.
- Guardrails y moderación mediante comparación de mensajes con afirmaciones de política.
- Extracción clínica y revisión de contratos (evaluado en SDOH-NLI y ContractNLI).
- Procesamiento de documentos de hasta 32.000 tokens.
- Soporte exclusivo de inglés; no se declaran capacidades multilingües.

## Casos de uso

- Detección de alucinaciones en RAG: dado un conjunto de pasajes recuperados y la respuesta generada, el modelo evalúa si cada afirmación está respaldada por el contexto; el autor reporta un 87,0% en RAGTruth en modo rápido, lo que lo hace adecuado para filtrar respuestas antes de mostrarlas al usuario.
- Clasificación zero-shot de tickets de soporte: usando plantillas como "This text is about {etiqueta}", el modelo asigna probabilidades a categorías como facturación, envío o acceso a cuenta, con resultados del 93,6% en el benchmark zs_meta de 18 tareas.
- Guardrails y moderación de contenido: comparar mensajes de usuario con afirmaciones de política permite bloquear o marcar contenido; el autor reporta un 93,0% en CrossingGuard.
- Revisión de contratos: verificar si un contrato permite compartir datos con terceros u otras cláusulas, con un 93,5% en ContractNLI y contexto de hasta 32k tokens para documentos completos.
- Extracción de información clínica: comprobar si una nota clínica respalda afirmaciones como "el paciente está desempleado", con un 98,5% en SDOH-NLI, útil para validar extracciones automáticas de historiales.
- Verificación de hechos en pipelines editoriales: contrastar afirmaciones de un borrador contra fuentes documentales y obtener una señal calibrada de implicación o contradicción antes de publicar.
- Auditoría de clasificadores existentes: usar el modo "think" para inspeccionar las trazas de razonamiento en casos mal clasificados y ajustar las hipótesis o plantillas de forma sistemática contra un conjunto de validación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Split | Métrica | Valor |
|---|---|---|---|
| FineCat-NLI | test | Accuracy | 0,8598 |
| MultiNLI | validation_matched | Accuracy | 0,9276 |
| MultiNLI | validation_mismatched | Accuracy | 0,9279 |
| SNLI | test | Accuracy | 0,9380 |
| ANLI round 1 | test_r1 | Accuracy | 0,8460 |
| ANLI round 2 | test_r2 | Accuracy | 0,7360 |
| ANLI round 3 | test_r3 | Accuracy | 0,6825 |
| WANLI | test | Accuracy | 0,7744 |
| LingNLI | validation | Accuracy | 0,8902 |
| Benchmark de 45 datasets (macro average) | test | Macro accuracy | 0,8510 |

Además, el autor declara los siguientes resultados en modo rápido para aplicaciones concretas: 93,6% en zs_meta (18 tareas de clasificación zero-shot), 87,0% en RAGTruth, 93,0% en CrossingGuard, 98,5% en SDOH-NLI y 93,5% en ContractNLI. También declara el primer puesto en el OpenNLI Skill Index con 64,5 (fecha 18-11-26, modo rápido).

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 17,9 GB en safetensors, lo que corresponde a pesos en FP16/BF16; se necesitan aproximadamente 18-20 GB de VRAM solo para los pesos, más memoria para activaciones y contexto. Con contexto de 32k tokens el consumo crece de forma notable.
- GPU recomendadas: A100 40GB/80GB, H100, L40S o RTX 6000 Ada para producción con contexto largo; una RTX 4090 (24 GB) puede alojar los pesos en FP16 pero el margen para contexto largo es limitado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización (no documentada por el autor), potencialmente en GPUs de 16 GB; no se proporcionan recetas de cuantización oficiales.
- Opciones de despliegue: `sentence-transformers` con `CrossEncoder` y `trust_remote_code=True` es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y el uso de código personalizado puede complicar su adopción en algunos servidores de inferencia.
- Latencia y throughput: no disponibles. El modo "think" incrementa la latencia al generar trazas de unos 60 tokens (ANLI) o 250 tokens (lógica de primer orden) antes de clasificar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbsoluteZero-nli-9b | ~9,0B | 32k tokens | Cross-encoder NLI con modo think | Apache-2.0 | Hugging Face |
| Cross-encoders basados en DeBERTa (p. ej. DeBERTa-v3-large NLI) | ~0,4B | 512 tokens típicamente | Cross-encoder NLI | MIT o similar según variante | Hugging Face |
| Modelos NLI encoder pequeños (p. ej. RoBERTa-large MNLI) | ~0,35B | 512 tokens | Clasificación NLI | MIT | Hugging Face |

No se dispone de datos de benchmarks comparativos directos entre este modelo y las alternativas citadas en la información proporcionada; la comparación se limita a parámetros, contexto y licencia. La ventaja principal frente a cross-encoders pequeños es el contexto de 32k tokens y la traza de razonamiento inspeccionable; la desventaja es el coste computacional, aproximadamente 20 veces mayor en parámetros que un DeBERTa-large.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües y su uso en otros idiomas no está validado.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El rendimiento cae de forma marcada en ANLI round 3 (0,6825) y WANLI (0,7744), lo que indica dificultades con razonamiento adversarial y datos fuera de distribución.
- Riesgo de alucinación en las trazas del modo "think": la explicación generada puede no reflejar el razonamiento real que lleva a la clasificación.
- Requiere `trust_remote_code=True` por el uso de código personalizado (`qwen3_5_text`), lo que implica revisar el código antes de desplegarlo en producción.
- El tamaño de 9B parámetros y el contexto de 32k tokens encarecen la inferencia frente a cross-encoders pequeños; no es adecuado para entornos con recursos limitados.
- No se documentan recetas de cuantización ni soporte en motores de inferencia habituales (vLLM, llama.cpp, TGI), lo que puede limitar el despliegue a gran escala.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene revisar las condiciones del modelo base.
- El modelo está pensado para clasificación NLI, no como LLM generativo de propósito general; su uso fuera de esa tarea no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/AbsoluteZero-nli-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
