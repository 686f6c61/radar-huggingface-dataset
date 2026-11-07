# orzattyholdings/Glorius-Preview-27B-Adapter-P1

## Resumen

Glorius-Preview-27B-Adapter-P1 es un adaptador de pesos publicado por orzattyholdings bajo licencia Apache 2.0 y distribuido en formato safetensors. Aunque el nombre sugiere un modelo base de 27B parámetros, el repositorio ocupa únicamente 2,6 GB, lo que indica que se trata de un conjunto de pesos de adaptación (probablemente LoRA u otra técnica de ajuste fino) y no del modelo completo. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

La información pública disponible es muy limitada: no hay model card sustantiva, no se especifican idiomas soportados, no se documenta el modelo base sobre el que se aplica el adaptador ni los datos de entrenamiento. Las únicas etiquetas declaradas son `glorius`, `orzatty`, `deeptech`, `code`, `text-generation`, `conversational` y `region:us`. El pipeline declarado es text-generation.

Por contexto del mismo autor, existen otros repositorios relacionados como SOCIUM-AI-27B y su versión cuantizada SOCIUM-AI-27B-GGUF, etiquetados con `qwen3.5`, `llama.cpp`, `ollama` y `lm-studio`, lo que sugiere que el ecosistema de orzattyholdings se apoya en arquitecturas tipo Qwen. No obstante, no hay confirmación oficial de que Glorius-Preview-27B-Adapter-P1 se base en ese modelo, por lo que cualquier afirmación al respecto debe tratarse como especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador de pesos; modelo base no declarado) |
| Parametros totales | no disponible (el nombre indica 27B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; 2,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura del modelo base ni sobre el procedimiento de entrenamiento del adaptador. El tamaño del repositorio (2,6 GB) es coherente con un adaptador de bajo rango o un conjunto parcial de pesos, no con un modelo denso de 27B parámetros en precisión completa (que ocuparía decenas de GB). No se documentan número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT.

Las etiquetas `code` y `conversational` sugieren un ajuste orientado a generación de código y diálogo, pero no hay evidencia publicada que permita verificar el alcance ni la calidad de dicho ajuste.

## Capacidades

- Generación de texto (pipeline declarado: text-generation).
- Orientación declarada a código mediante la etiqueta `code`.
- Orientación declarada a conversación mediante la etiqueta `conversational`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Ajuste fino especializado sobre un modelo base de la familia Qwen (si se confirma): el adaptador podría aplicarse sobre el modelo base para obtener un comportamiento orientado a código y conversación, siempre que se valide la compatibilidad de arquitectura.
- Experimentación en investigación: útil para estudiar técnicas de adaptación de bajo rango sobre modelos de 27B, dado su reducido tamaño en disco (2,6 GB).
- Prototipado de asistentes conversacionales: si el adaptador funciona correctamente, podría emplearse para generar respuestas multi-turno en entornos de prueba, aunque sin garantías de calidad documentadas.
- Generación asistida de código en entornos controlados: la etiqueta `code` sugiere este uso, pero requiere validación empírica antes de cualquier despliegue.
- Evaluación comparativa de adaptadores: sirve como punto de comparación frente a otros adaptadores del mismo autor o de la comunidad.
- Docencia y demostraciones: por su tamaño reducido, es manejable en entornos con recursos limitados una vez cargado el modelo base correspondiente.

En todos los casos, la ausencia de model card y de benchmarks hace imprescindible una evaluación propia antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base sobre el que se aplique. Si el modelo base fuese de 27B parámetros, se requerirían aproximadamente 54 GB en FP16, 27 GB en INT8 y 14-16 GB en cuantizaciones de 4 bits.
- GPU recomendadas: no disponible; condicionado al modelo base (A100 80GB o H100 para FP16 en 27B; RTX 4090 24GB solo con cuantización agresiva).
- Compatibilidad con GPU de consumo: no confirmada; dependería del modelo base y de la cuantización.
- Opciones de despliegue: no documentadas para este adaptador; el ecosistema del autor incluye referencias a llama.cpp, Ollama y LM Studio en repositorios relacionados (SOCIUM-AI-27B-GGUF), pero no se confirma para Glorius-Preview-27B-Adapter-P1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado adaptadores comparables publicados con especificaciones verificables en la información proporcionada. Los repositorios del mismo autor (SOCIUM-AI-27B, SOCIUM-AI-27B-GGUF) podrían servir como referencia interna, pero no se dispone de sus especificaciones detalladas.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan arquitectura, datos de entrenamiento, evaluación ni limitaciones.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga.
- Modelo base no declarado: sin confirmación de compatibilidad, el adaptador podría no ser utilizable directamente.
- Riesgo elevado de alucinación y comportamiento impredecible al no existir evaluación publicada.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no es posible evaluar sesgos.
- Idiomas no declarados: no se garantiza soporte de castellano ni de ningún otro idioma.
- Licencia Apache 2.0 declarada, lo que en principio permitiría uso comercial, pero la licencia del modelo base (si existe) podría imponer restricciones adicionales que prevalecerían.
- Sin descargas ni likes en el momento de la consulta: ecosistema sin validación comunitaria.
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/orzattyholdings/Glorius-Preview-27B-Adapter-P1
- Repositorio relacionado del mismo autor: https://huggingface.co/orzattyholdings/SOCIUM-AI-27B
- Versión GGUF relacionada: https://huggingface.co/orzattyholdings/SOCIUM-AI-27B-GGUF/tree/main
