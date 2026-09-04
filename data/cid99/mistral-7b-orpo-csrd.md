# CID99/Mistral-7B-ORPO-CSRD

## Resumen

Mistral-7B-ORPO-CSRD es un adaptador QLoRA entrenado con ORPO (Odds Ratio Preference Optimization) sobre el modelo mistralai/Mistral-7B-Instruct-v0.3. El objetivo era corregir un supuesto sesgo de recencia en la clasificación de párrafos regulatorios franceses según la taxonomía CSRD/ESRS, usando datos del dataset FinCAC40. El autor, CID99, lo publica como un artefacto de investigación que documenta un fracaso de alineación: el modelo entrenado rinde sustancialmente peor que su modelo base, con una precisión del 35,7% frente al 70,8% del base, y una tasa de salidas JSON malformadas del 30,7%.

La arquitectura es un transformer decoder-only (Mistral 7B) con un adaptador LoRA de bajo rango. El adaptador se entrenó con QLoRA 4-bit NF4, doble cuantización y cómputo en bfloat16. El modelo está pensado para clasificación de textos en francés, pero no es apto para producción: la model card lo declara explícitamente como "un artefacto de investigación, no un clasificador usable".

La relevancia del modelo radica en su valor como caso documentado de la ley de Goodhart en alineación: durante el entrenamiento, la métrica de FNR (tasa de falsos negativos) alcanzó cero, lo que sugería que el sesgo objetivo se había eliminado, pero en realidad el modelo colapsó a predecir siempre la clase CSRD, destruyendo la precisión de la tarea. Este repositorio incluye los artefactos de entrenamiento, predicciones y métricas de diagnóstico para reproducir el análisis.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B) con adaptador LoRA (PEFT) |
| Parámetros totales | 7B (modelo base); adaptador LoRA no especificado (repo de 0,2 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | QLoRA 4-bit NF4 (entrenamiento); inferencia no especificada |
| Idiomas soportados | Francés (fr) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre mistralai/Mistral-7B-Instruct-v0.3, entrenado con ORPO según el método de Hong et al. (2024). La configuración de entrenamiento incluye QLoRA 4-bit NF4 con doble cuantización y cómputo en bfloat16, LoRA con r=16, alpha=32, dropout=0.05 y todas las proyecciones lineales, y ORPO beta=0.1. Los pares de preferencia se construyeron mediante rejection sampling: para cada párrafo, una etiqueta plateada de un juez más fuerte (mistral-large-latest) se comparó con la predicción zero-shot de la política base. Los desacuerdos se convirtieron en pares chosen/rejected, de modo que cada par captura un error real del modelo. Tras el rebalanceo, se usaron 225 pares tipo A, 30 tipo B y 15 tipo C.

El objetivo era corregir un sesgo de recencia en la clasificación CSRD/ESRS de documentos regulatorios franceses. Durante el entrenamiento, la pérdida de evaluación disminuía con normalidad, la precisión de preferencias alcanzó el 100% y la FNR llegó a 0.000 en todas las épocas. Sin embargo, la precisión real de la tarea cayó del 70,8% al 16,4% en la ejecución 1 (y al 35,7% en la ejecución 2, la publicada). La FNR llegó a cero de forma mecánica porque el modelo dejó de predecir la clase "none", lo que reduce la FNR sin corregir nada.

El autor atribuye el fracaso a cuatro factores acumulativos: desequilibrio de pares (30:1 entre "preferir CSRD sobre none" y pares de guardarraíl), taxonomía fina con datos escasos (273-315 pares para 12 clases), ausencia de negativos duros para clases raras, y uso de un juez (mistral-large-latest) de la misma familia que la política base (open-mistral-7b). El autor concluye que el fallo se debe al régimen de datos limitados, no a una limitación de ORPO como método.

## Capacidades

- Generación de texto en francés: el modelo puede generar texto, pero con una tasa del 30,7% de salidas JSON malformadas en la tarea de clasificación.
- Clasificación de párrafos según la taxonomía CSRD/ESRS: capacidad pretendida, pero degradada. La precisión es del 35,7% frente al 70,8% del modelo base.
- No soporta tool calling ni function calling: no se menciona en la documentación disponible.
- No soporta agentes ni razonamiento multi-paso: no se menciona en la documentación disponible.
- No soporta visión ni audio: no se menciona en la documentación disponible.
- Capacidades multilingües: solo francés (fr) según los metadatos.
- Valor como artefacto de investigación: permite estudiar modos de fallo en optimización de preferencias, puntos ciegos en evaluación y la ley de Goodhart en alineación.

## Casos de uso

- Investigación académica sobre optimización de preferencias: el modelo sirve como caso documentado de colapso por sobreajuste a un subconjunto de preferencias. Se puede usar para analizar cómo un desequilibrio de pares (30:1) lleva a soluciones degeneradas.
- Análisis de la ley de Goodhart en alineación: el repositorio muestra cómo una métrica (FNR) puede alcanzar su valor ideal sin mejorar la tarea real. Es útil para estudiar cuándo las métricas dejan de ser indicadores fiables.
- Material docente en cursos de alineamiento de IA: el modelo ilustra los riesgos de monitorizar solo la pérdida y la precisión de preferencias durante el entrenamiento, sin validar la tarea final.
- Reproducción de experimentos: los artefactos publicados (adaptador, predicciones de evaluación, métricas de diagnóstico) permiten reproducir el análisis y verificar los resultados.
- Estudio de puntos ciegos en evaluación: el modelo demuestra cómo las métricas estándar no detectan la regresión de capacidades, como la pérdida de la habilidad de emitir JSON válido.
- Desarrollo de métodos de detección de colapso: el modelo puede usarse como caso de prueba para nuevas métricas de robustez que detecten colapsos de preferencias antes del despliegue.

## Benchmarks y rendimiento

Evaluación sobre 140 párrafos anotados por expertos (Gold Standard de FinCAC40), no vistos durante el entrenamiento.

| | Accuracy | Macro-F1 | κ [95% CI] | Salidas malformadas | FPR global |
|---|---|---|---|---|---|
| Modelo base (3-shot) | 70,8% | 18,7% | 0,193 [0,051, 0,352] | 0% | — |
| ORPO — Run 1 | 16,4% | 23,1% | n/a | n/a | — |
| ORPO — Run 2 (este lanzamiento) | 35,7% | 35,9% | 0,238 [0,079, 0,387] | 30,7% | 64,9% |

κ es el kappa de Cohen sobre la decisión binaria CSRD vs. none, con intervalos de confianza bootstrap (B=2000, seed 42). Los intervalos se solapan ampliamente, por lo que la aparente mejora del kappa no es estadísticamente significativa.

Señales observadas durante el entrenamiento:

| Señal observada | Lo que sugería | Realidad |
|---|---|---|
| eval_loss disminuyendo con normalidad | Convergencia saludable | — |
| Precisión de preferencias → 100% | Objetivo completamente aprendido | — |
| FNR → 0.000 en todas las épocas | Sesgo objetivo eliminado | — |
| Precisión real de la tarea | — | 70,8% → 16,4% (Run 1) |

## Requisitos de hardware

No se proporcionan datos de VRAM, GPU recomendadas, latencia ni throughput en la información disponible. El adaptador requiere cargar el modelo base Mistral-7B-Instruct-v0.3, por lo que los requisitos de hardware son los de ese modelo. Para inferencia, se puede usar Transformers con PEFT, vLLM, llama.cpp u Ollama, cargando primero el modelo base y aplicando el adaptador. No se dispone de estimaciones de consumo de memoria o rendimiento específicas para este adaptador.

## Comparativa con modelos similares

| Modelo | Base | Método | Precisión CSRD | Salidas malformadas | Licencia |
|---|---|---|---|---|---|
| CID99/Mistral-7B-ORPO-CSRD | Mistral-7B-Instruct-v0.3 | QLoRA + ORPO | 35,7% | 30,7% | Apache-2.0 |
| mistralai/Mistral-7B-Instruct-v0.3 | — | — | 70,8% | 0% | Apache-2.0 |
| kaist-ai/mistral-orpo-alpha | Mistral-7B-v0.1 | ORPO | No disponible | No disponible | Apache-2.0 |

El modelo base es claramente superior en la tarea objetivo, con el doble de precisión y sin salidas malformadas. kaist-ai/mistral-orpo-alpha es otro modelo ORPO sobre Mistral 7B, pero no se dispone de datos de rendimiento comparables en la información disponible. No se conocen otros modelos de la misma categoría con benchmarks publicados.

## Limitaciones y advertencias

- Rendimiento sustancialmente peor que su modelo base: 35,7% frente a 70,8% de precisión en la tarea CSRD/ESRS.
- Tasa de salidas JSON malformadas del 30,7%, frente al 0% del modelo base. El fine-tuning degradó una capacidad que el base dominaba por completo.
- Tasa de falsos positivos global del 64,9%: el modelo tiende a clasificar incorrectamente párrafos como CSRD.
- Colapso de la clase "none": el modelo predice CSRD de forma mecánica, lo que anula la FNR pero destruye la utilidad práctica.
- La categoría ESRS2 actúa como "refugio" con precisión del 5,3% y recall del 5,9%, sin señal discriminativa. Se activa por la palabra genérica "risque" en avisos legales estandarizados.
- Sesgo potencial del juez: mistral-large-latest juzgó a open-mistral-7b, y no se puede excluir un sesgo compartido entre ambos.
- Datos de entrenamiento muy limitados (273-315 pares) y desequilibrados (30:1), insuficientes para cubrir un espacio de 12 clases.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción. Está fuera de alcance para decisiones regulatorias, de cumplimiento, auditoría o inversión.
- La model card recomienda explícitamente usar mistralai/Mistral-7B-Instruct-v0.3 directamente si se necesita clasificación CSRD.

## Enlaces

- HuggingFace: https://huggingface.co/CID99/Mistral-7B-ORPO-CSRD
- Paper ORPO (Hong et al., 2024): https://arxiv.org/abs/2403.07691
- Dataset FinCAC40: https://huggingface.co/datasets/YOUR_USERNAME/FinCAC40
- Modelo base Mistral-7B-Instruct-v0.3: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Modelo comparativo kaist-ai/mistral-orpo-alpha: https://huggingface.co/kaist-ai/mistral-orpo-alpha
- Documentación de Mistral 7B: https://docs.mistral.ai/models/mistral-7b-0-1
