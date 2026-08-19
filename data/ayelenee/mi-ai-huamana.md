# Ayelenee/mi-ai-huamana

## Resumen

`mi-ai-huamana` es un modelo de lenguaje creado mediante la fusión (merge) de dos modelos base: `meta-llama/Llama-3.1-8B-Instruct` y `DavidAU/L3-Dark-Planet-8-Orbs-V2-Eight-Orbs-Of-Power-GGUF`. El proceso se realizó con la herramienta LazyMergekit, utilizando el método de interpolación esférica (slerp) sobre las capas 0 a 32 de ambos modelos. El autor, Ayelenee, publicó el modelo en HuggingFace en agosto de 2026, aunque no ha recibido descargas ni valoraciones hasta la fecha.

Al estar basado en Llama 3.1 8B Instruct, el modelo hereda la arquitectura transformer decoder-only de 8 mil millones de parámetros, con capacidad de instrucción y chat. Sin embargo, la ausencia de documentación adicional, benchmarks o especificaciones detalladas hace que su comportamiento real sea incierto. La relevancia de este modelo reside principalmente en su naturaleza experimental como merge, útil para explorar técnicas de combinación de pesos, pero no está validado para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1) |
| Parametros totales | 8.000 millones (aprox., heredado de Llama 3.1 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 128K, heredado de Llama 3.1) |
| Tipos de cuantizacion | no disponible (el merge se publicó en bfloat16) |
| Idiomas soportados | no disponible (heredado de Llama 3.1, principalmente inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (inferido del uso de transformers) |

## Arquitectura y entrenamiento

El modelo se construyó mediante un merge con LazyMergekit, combinando las capas 0 a 32 de `meta-llama/Llama-3.1-8B-Instruct` y `DavidAU/L3-Dark-Planet-8-Orbs-V2-Eight-Orbs-Of-Power-GGUF`. El método utilizado es slerp (interpolación lineal esférica) con coeficientes variables por tipo de capa: para las capas de atención propia (`self_attn`) se aplicaron valores `[0, 0.5, 0.3, 0.7, 1]` y para las capas MLP `[1, 0.5, 0.7, 0.3, 0]`, con un valor base de 0.5. El dtype del merge es bfloat16.

No se dispone de información sobre el proceso de entrenamiento, el dataset utilizado, ni si se aplicaron técnicas como RLHF o DPO. El modelo base Llama 3.1 8B Instruct fue entrenado con 15 billones de tokens y refinado con instrucciones, pero el merge no añade datos nuevos; simplemente combina pesos existentes.

## Capacidades

- Generación de texto y conversación: al derivar de Llama 3.1 Instruct, se espera que pueda mantener diálogos multi-turno y seguir instrucciones, aunque no hay validación independiente.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base, pero el merge puede alterar el comportamiento.
- Soporte de tool calling y function calling: no confirmado, aunque Llama 3.1 Instruct lo soporta nativamente; el merge podría conservarlo.
- Capacidades multilingües: no confirmadas; Llama 3.1 tiene soporte limitado a varios idiomas, pero el merge no garantiza su mantenimiento.
- No se han documentado capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso

Dado que no hay información sobre el rendimiento real del modelo, los casos de uso son hipotéticos y deben validarse antes de cualquier implementación:

- Experimentación académica con técnicas de merge: el modelo sirve como ejemplo de aplicación de slerp con coeficientes variables, útil para estudiar el impacto de la interpolación de pesos en modelos de 8B.
- Prototipado rápido de chatbots: si el merge conserva las capacidades instruct de Llama 3.1, podría usarse en entornos de desarrollo para probar flujos conversacionales básicos.
- Evaluación comparativa de merges: investigadores pueden comparar este modelo con otros merges de Llama 3.1 para analizar diferencias en calidad de generación.
- Fine-tuning posterior: al ser un modelo de 8B, puede servir como punto de partida para fine-tuning en tareas específicas, aunque la falta de licencia clara limita su uso comercial.
- Generación de código en entornos no críticos: si el merge no degrada las habilidades de código de Llama 3.1, podría emplearse para autocompletado o asistencia en desarrollo, siempre con supervisión humana.
- Investigación sobre alineación de modelos: el merge combina un modelo instruct con un modelo "Dark Planet" (posiblemente un fine-tune con características particulares), lo que permite estudiar cómo se propagan los sesgos y comportamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se han realizado evaluaciones independientes conocidas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B en bfloat16, se necesitan aproximadamente 16 GB de VRAM para cargar los pesos completos. Con cuantización a 4 bits (si estuviera disponible) se podría reducir a unos 6-8 GB.
- GPU recomendadas: para inferencia completa en bfloat16, una GPU con 16 GB o más (RTX 4090, A100 40GB, H100). Con cuantización, podría ejecutarse en GPUs de 8 GB (RTX 3070, RTX 4060 Ti).
- Compatibilidad con consumer GPU: sí, si se aplica cuantización (GGUF, AWQ, GPTQ), aunque no se han publicado versiones cuantizadas de este merge.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con `device_map="auto"`. El código de ejemplo usa `transformers` con `torch.float16`.
- Latencia y throughput: no disponibles; dependerán del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `mi-ai-huamana` | 8B | no disponible | no disponible | Merge experimental sin validación |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128K | Llama 3.1 Community License | Modelo base, bien documentado y evaluado |
| `DavidAU/L3-Dark-Planet-8-Orbs-V2` | 8B (aprox.) | no disponible | no disponible | Modelo fuente del merge, también un merge/fine-tune |

No se dispone de datos de rendimiento para comparar objetivamente. El modelo base Llama 3.1 8B Instruct tiene benchmarks publicados (MMLU ~68.4, HumanEval ~72.6, GSM8K ~84.5), pero el merge puede alterar estos valores.

## Limitaciones y advertencias

- Falta de documentación: no hay model card detallada, ni especificación de licencia, idiomas o limitaciones conocidas.
- Riesgo de alucinación: al ser un merge no validado, la coherencia y veracidad de las respuestas no están garantizadas.
- Sesgos heredados: el modelo puede amplificar sesgos presentes en Llama 3.1 y en el modelo "Dark Planet", que no han sido auditados.
- Restricciones de uso comercial: al no especificarse licencia, no se puede determinar si es legal usar el modelo en aplicaciones comerciales.
- Inestabilidad del merge: la interpolación slerp con coeficientes variables puede producir comportamientos impredecibles en ciertas capas, afectando la calidad de generación.
- Sin soporte de la comunidad: al tener 0 descargas y 0 likes, no hay retroalimentación ni correcciones de errores.

## Enlaces

- [HuggingFace - Ayelenee/mi-ai-huamana](https://huggingface.co/Ayelenee/mi-ai-huamana)
- [LazyMergekit (Colab)](https://colab.research.google.com/drive/1obulZ1ROXHjYLn6PPZJwRR6GzgQogxxb?usp=sharing)
- [meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- [DavidAU/L3-Dark-Planet-8-Orbs-V2-Eight-Orbs-Of-Power-GGUF](https://huggingface.co/DavidAU/L3-Dark-Planet-8-Orbs-V2-Eight-Orbs-Of-Power-GGUF)
