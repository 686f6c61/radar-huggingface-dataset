# qq0518/egis-emer-guard

## Resumen

EGIS (Full) — EMER-Guard es un verificador multi-tarea condicionado por evidencia, desarrollado por el autor qq0518 como parte de la investigación *EMER-Guard: Protocol-Grounded Verification for LLM Emergency Instructions* (EMNLP 2026 Main). El modelo está diseñado para evaluar si las instrucciones de emergencia generadas por modelos de lenguaje son coherentes con protocolos oficiales (FEMA, CDC, OMS, Cruz Roja), detectando peligros, mecanismos de daño, severidad y contradicciones con la evidencia proporcionada.

Se trata de un checkpoint de investigación, no un modelo listo para producción. Su arquitectura se basa en el encoder BGE-M3 (XLM-RoBERTa, 24 capas, hidden 1024) como backbone, al que se añaden cuatro cabezas de clasificación: hazard (seguro/peligroso), mechanism (8 logits), severity (escalar) y support (apoyado/no apoyado/contradicho). El modelo tiene 568,3 millones de parámetros, de los cuales 152,7 millones fueron afinados durante el entrenamiento (embeddings y mitad inferior del encoder congelados). La entrada se formatea como `[Evidence] {passage} [SEP] {instruction}` con una longitud máxima de 256 tokens.

La relevancia de este modelo radica en su enfoque de verificación basada en protocolos, un área crítica para la seguridad de los LLMs en contextos de emergencia. Aunque no es un producto desplegable, sus métricas IID (F1 de peligro 0,899, AUC-ROC 0,938) demuestran su utilidad como sonda científica para investigar la fiabilidad de las instrucciones generadas automáticamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone BGE-M3 (XLM-RoBERTa, 24 capas, hidden 1024) + 4 cabezas de clasificación (hazard, mechanism, severity, support) |
| Parametros totales | 568.289.806 (568,3 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens (formato de entrada fijo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo utiliza como backbone el encoder BGE-M3 de BAAI, una variante de XLM-RoBERTa con 24 capas y dimensión oculta 1024. Sobre este encoder se añaden cuatro cabezas especializadas: `hazard_head` (clasificación binaria seguro/peligroso), `mechanism_head` (MLP con 8 logits para mecanismos de daño m1–m8), `severity_head` (regresión escalar) y `support_head` (clasificación ternaria apoyado/no apoyado/contradicho). La entrada se construye concatenando evidencia, pasaje e instrucción con un separador `[SEP]`, limitada a 256 tokens.

El entrenamiento se realizó con AdamW, 3 épocas, batch efectivo de 32 (batch 4 × 8 acumulación de gradiente), learning rate 2e-5, precisión bfloat16, gradient checkpointing, seed 42, `lam_mech=1.5`, label smoothing 0.05 y 30.000 pares contrafactuales generados a partir de ediciones de protocolos de emergencia reales. Los embeddings y la mitad inferior del encoder se congelaron durante el entrenamiento, afinando solo 152,7 millones de parámetros. El hardware utilizado fueron dos NVIDIA RTX 4090 D GPUs, con aproximadamente 12 GPU-horas de cómputo.

## Capacidades

- Clasificación de peligro: determina si una instrucción de emergencia es segura o peligrosa (probabilidad de peligro con umbral 0,5).
- Identificación de mecanismo: asigna 8 logits correspondientes a mecanismos de daño específicos (m1–m8).
- Estimación de severidad: produce un valor escalar que indica la gravedad del riesgo.
- Verificación de soporte: clasifica si la instrucción está apoyada, no apoyada o contradicha por la evidencia proporcionada.
- Entrada condicionada por evidencia: el modelo recibe un pasaje de protocolo como contexto, lo que permite evaluar la coherencia entre instrucción y protocolo.
- No es generativo: no genera texto, solo produce clasificaciones y puntuaciones.

## Casos de uso

- Investigación en seguridad de LLMs: evaluar la tendencia de modelos generativos a producir instrucciones de emergencia incorrectas o peligrosas, usando EGIS como verificador automático en pipelines de análisis.
- Auditoría de protocolos: comparar instrucciones generadas por IA con protocolos oficiales (FEMA, CDC, OMS) para detectar contradicciones o desviaciones, útil en entornos de investigación y desarrollo de sistemas de alerta.
- Desarrollo de conjuntos de datos: generar etiquetas automáticas para nuevos pares instrucción-evidencia, acelerando la creación de benchmarks de seguridad en dominios de emergencia.
- Análisis de robustez: probar la sensibilidad del modelo ante variaciones contrafactuales en las instrucciones, lo que ayuda a entender los límites de la verificación basada en protocolos.
- Evaluación de sistemas de generación aumentada por recuperación (RAG): verificar si las respuestas de un sistema RAG en contextos de emergencia se alinean con la evidencia recuperada, usando EGIS como métrica de apoyo.
- Formación y educación: como herramienta didáctica para ilustrar la importancia de la verificación basada en protocolos en sistemas de IA de alto riesgo.

## Benchmarks y rendimiento

Los resultados IID reportados en `test_results.json` (coinciden con el punto de operación principal del paper, Harm F1 89,9, IID ORR 10,4%) son:

| Metrica | Valor |
|---|---|
| Hazard F1 | 0,8991 |
| Accuracy | 0,8988 |
| IID over-refusal | 0,104 |
| AUC-ROC | 0,9380 |
| ECE | 0,0752 |
| Mechanism F1 | 0,9277 |

No se han publicado comparaciones con otros modelos en la información disponible. El paper menciona un resultado de 0/1.000 falsos positivos en estrés benigno, pero ese dato no está incluido en el JSON.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 568,3 M de parámetros. En fp32 ocupa aproximadamente 2,3 GB; en bf16, alrededor de 1,2 GB. Se puede ejecutar en GPUs con 4 GB de VRAM o más.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090). El entrenamiento usó dos RTX 4090 D, pero la inferencia es mucho menos exigente.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y alta.
- Opciones de despliegue: requiere el código de la clase `MultiTaskEGIS` del software EMER-Guard (no es un checkpoint `AutoModel` estándar). Se puede cargar con PyTorch y Transformers para el tokenizador y el encoder base. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. El modelo es específico para verificación de instrucciones de emergencia, un nicho sin alternativas públicas conocidas en el momento de la publicación.

## Limitaciones y advertencias

- Es una sonda científica controlada, no un verificador listo para producción. No debe usarse como sustituto del juicio profesional, las guías de autoridades locales o la evaluación de alertas reales.
- Entrenado exclusivamente en inglés, lo que limita su aplicación a otros idiomas.
- La longitud de contexto está fijada en 256 tokens, por lo que instrucciones o evidencias más largas deben truncarse, lo que puede afectar la precisión.
- Los datos de entrenamiento provienen de protocolos de emergencia de organismos estadounidenses e internacionales (FEMA, CDC, OMS, Cruz Roja); puede no generalizar a otros marcos normativos o contextos culturales.
- Riesgo de errores de clasificación: aunque las métricas IID son sólidas, el modelo puede fallar ante ejemplos adversariales o situaciones no representadas en el conjunto de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso en entornos de producción sin una validación adicional.
- El checkpoint no es un modelo HuggingFace estándar; requiere el código específico de `MultiTaskEGIS` para cargarse correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qq0518/egis-emer-guard
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Paper: *EMER-Guard: Protocol-Grounded Verification for LLM Emergency Instructions* (EMNLP 2026 Main) — no se proporciona enlace directo en la información disponible.
