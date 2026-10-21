# masahiroid/Sentiment-Analysis-7B-4bit-mlx

## Resumen

`masahiroid/Sentiment-Analysis-7B-4bit-mlx` es una conversión no oficial del modelo `microsoft/Sentiment-Analysis-7B` al formato MLX cuantizado a 4 bits (group size 64), pensada para ejecutarse en Macs con Apple Silicon. Lo publica el usuario masahiroid y está orientado a equipos con 16 GB de memoria unificada (en torno a 8 GB utilizables por la GPU), un segmento donde un transformer de 7.24B en precisión completa no cabría con comodidad. El repositorio ocupa 4.1 GB y se distribuye con licencia MIT, la misma que el modelo base.

El modelo conserva los 7.241.732.096 parámetros del original y mantiene el pipeline de `text-generation` con etiqueta `conversational`. Los tags del repositorio incluyen `mistral`, y el recuento de parámetros coincide con el de la familia Mistral-7B, por lo que cabe inferir que el modelo base emplea una arquitectura transformer de esa familia, aunque la model card no detalla la longitud de contexto ni la composición del dataset de entrenamiento.

Su relevancia es acotada pero concreta: permite probar localmente, sin conexión y sobre hardware Apple, un modelo de análisis de sentimiento de 7B en 4 bits, con una auditoría de seguridad publicada por el propio autor (comprobación de ficheros pickle, consistencia de la plantilla de chat y pruebas de seguridad en japonés). No aporta mejoras de rendimiento frente al base; es una conversión de formato y cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tags del repo: `mistral`; inferido del recuento de parametros, no confirmado en la model card) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | no disponibles (la model card incluye ejemplos en japones) |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizados en formato MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión del base `microsoft/Sentiment-Analysis-7B` mediante MLX, la librería de Apple para cómputo en tensor sobre silicio Apple. La cuantización aplicada es de 4 bits con group size 64, lo que reduce el peso del repositorio a 4.1 GB manteniendo los 7.24B de parámetros. No se trata de un reentrenamiento: los pesos son una transformación del modelo original y, por tanto, las decisiones de arquitectura y de datos de entrenamiento corresponden al equipo que publicó `microsoft/Sentiment-Analysis-7B`, no al autor de esta conversión.

La model card no documenta número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO. Tampoco detalla innovaciones técnicas más allá de la propia cuantización. El autor sí publica un proceso de auditoría previa a la publicación con su herramienta `model-audit-lite`: inspección de ficheros (presencia de pesos en formato pickle, código propio, SHA256), verificación de que la plantilla de chat coincide antes y después de la conversión, y pruebas de seguridad en japonés sobre el modelo convertido. Los resultados se recogen en `SECURITY.md` y en `audit/report.md`.

## Capacidades

- Generación de texto y conversación multi-turno a través de la plantilla de chat (`tokenizer.apply_chat_template`).
- Análisis de sentimiento, por herencia del modelo base `microsoft/Sentiment-Analysis-7B`.
- Ejecución local en Apple Silicon mediante `mlx-lm`, sin dependencia de CUDA.
- Soporte de cuantización 4-bit para reducir huella de memoria.
- Idiomas: no confirmados oficialmente; los ejemplos de la model card están en japonés y la auditoría incluye pruebas de seguridad en ese idioma.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente, razonamiento multi-paso, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de sentimiento de reseñas y opiniones de clientes: el modelo hereda el propósito del base y puede clasificar o resumir el tono de textos en lotes, ejecutándose íntegramente en local.
- Procesamiento de feedback en local por privacidad: al correr sobre un Mac sin enviar datos a la nube, es adecuado para equipos que tratan opiniones de usuarios con datos sensibles.
- Prototipado rápido en Apple Silicon: con `mlx-lm` y 4 GB de pesos, un desarrollador puede validar prompts y plantillas de chat en un M2 de 16 GB antes de mover el modelo a un entorno de producción.
- Triage y clasificación de tickets de soporte: permite etiquetar el tono de conversaciones entrantes y priorizar casos negativos dentro de un pipeline interno.
- Investigación y docencia: útil para experimentar con cuantización MLX 4-bit sobre un transformer de 7B sin infraestructura GPU dedicada.
- Evaluación de conversiones: sirve como referencia para comparar la fidelidad de la cuantización MLX frente al modelo base en tareas de generación y clasificación.
- Demos offline en dispositivos Apple: al no requerir red ni backend, encaja en prototipos locales o entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso del repositorio: 4.1 GB; los pesos cuantizados ocupan en torno a 4 GB, por lo que se recomienda reservar algo más de memoria para el contexto y el tokenizador.
- Hardware objetivo: Apple Silicon. La model card apunta a un M2 con 16 GB de memoria unificada (unos 8 GB utilizables por la GPU).
- No está pensado para GPU NVIDIA ni CUDA; requiere el runtime MLX.
- Despliegue: `mlx-lm` (`mlx_lm.generate` o la API `load`/`generate` en Python).
- Latencia y throughput: no disponibles en la información proporcionada.
- No cabe en GPUs consumer tipo RTX 4090 mediante este formato; para CUDA habría que recurrir a otra conversión (GGUF, etc.), no disponible en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (4-bit MLX) | 7.24B | no disponible | safetensors MLX 4-bit | MIT | HuggingFace, solo Apple Silicon |
| microsoft/Sentiment-Analysis-7B (base) | 7.24B | no disponible | no disponible en la informacion | no disponible en la informacion | HuggingFace |
| Mistral-7B (familia inferida) | ~7.24B | no disponible | safetensors | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento para comparar cualitativamente con alternativas; la comparación se limita a parámetros, formato, licencia y plataforma de ejecución.

## Limitaciones y advertencias

- Conversión no oficial: el autor no está afiliado a Microsoft ni al equipo del modelo base; no hay garantía de equivalencia funcional exacta.
- Solo Apple Silicon: el formato MLX no es portable a CUDA ni a CPU estándar sin reconversión.
- Sin benchmarks publicados: no hay evidencia cuantitativa del impacto de la cuantización 4-bit en la calidad del análisis de sentimiento.
- Idiomas no declarados oficialmente: aunque hay ejemplos en japonés, no se confirma la cobertura multilingüe.
- Longitud de contexto no documentada: limita el diseño de aplicaciones que dependan de ventanas largas.
- Riesgo de alucinación y sesgos inherentes al modelo base, no evaluados en esta conversión.
- Licencia MIT para la conversión, pero conviene verificar los términos del modelo base `microsoft/Sentiment-Analysis-7B` antes de un uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- La auditoría publicada cubre seguridad de ficheros y pruebas en japonés, no una evaluación exhaustiva de sesgos o robustez.

## Enlaces

- HuggingFace: https://huggingface.co/masahiroid/Sentiment-Analysis-7B-4bit-mlx
- Modelo base: https://huggingface.co/microsoft/Sentiment-Analysis-7B
- Repositorio MLX: https://github.com/ml-explore/mlx
- Herramienta de auditoría del autor: https://github.com/masahiroid/model-audit-lite
- Informe de seguridad: `SECURITY.md` y `audit/report.md` en el repositorio del modelo.
