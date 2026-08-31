# Dylennnn/techjam

## Resumen

El repositorio `Dylennnn/techjam` contiene un conjunto de adaptadores LoRA experimentales generados durante el desarrollo de **RobustLens**, un detector de imágenes generadas por inteligencia artificial resistente a transformaciones, presentado al concurso TikTok TechJam 2026 en su pista 5. El autor, Dylennnn, publica estos adaptadores con un propósito explícito de reproducibilidad y auditoría: ninguno de ellos fue adoptado en el sistema final, ya que todos los experimentos fueron rechazados al no cumplir los criterios de mejora predefinidos.

El modelo base sobre el que se aplican los adaptadores es `Bombek1/ai-image-detector-siglip-dinov2`, un detector de 740.371.777 parámetros que combina SigLIP2-SO400M con DINOv2-Large mediante LoRA. Los adaptadores incluidos en este repositorio son de tipo `head_only`, con solo 1.250.561 parámetros entrenables frente a 739.121.216 congelados, y ocupan aproximadamente 32 MB cada uno. El sistema de producción de RobustLens no utiliza ninguno de estos adaptadores, sino el checkpoint base sin modificaciones.

La relevancia de este repositorio no reside en su utilidad práctica directa, sino en su valor como ejemplo de transparencia en el desarrollo de modelos: documenta experimentos fallidos, sus métricas y las razones de su rechazo, permitiendo a otros investigadores verificar los resultados y evitar repetir los mismos caminos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA head_only sobre SigLIP2-SO400M + DINOv2-Large (modelo base) |
| Parámetros totales | 740.371.777 (modelo base); 1.250.561 entrenables por adaptador |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (entrada visual) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (`adapter_model.safetensors`), `adapter_config.json`, `classifier_head.pt` |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino adaptadores LoRA diseñados para cargarse sobre el checkpoint base `Bombek1/ai-image-detector-siglip-dinov2`. Todos los adaptadores operan en modo `head_only`: únicamente se modifica la cabeza clasificadora, dejando congelados los pesos del backbone y los tensores LoRA existentes del modelo base.

Se realizaron cuatro experimentos distintos:

- `local_edit_smoke`: fine-tuning solo de la cabeza sobre ediciones locales generadas por IA.
- `consistency_classification_only`: línea base de ablación, solo con pérdida BCE.
- `consistency_consistency_mse`: añade una pérdida de consistencia por error cuadrático medio (logit-MSE) entre vistas transformadas.
- `consistency_consistency_kl`: añade una pérdida de consistencia por divergencia KL simétrica.

El entrenamiento se realizó con un conjunto muy reducido: 68 imágenes de entrenamiento y 20 de evaluación. Este tamaño es insuficiente para extraer conclusiones sobre la eficacia del método, como el propio autor advierte. Las métricas reportadas deben interpretarse como pruebas de humo, no como evidencia de rendimiento.

## Capacidades

- Detección de imágenes generadas por IA: el modelo base es capaz de distinguir imágenes sintéticas de reales, con un umbral calibrado de 0,69.
- Los adaptadores incluidos no añaden capacidades adicionales; de hecho, empeoran el ranking en la métrica AUROC en el experimento `local_edit_smoke`.
- No hay soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la clasificación de imágenes.
- No hay capacidades multilingües, dado que la entrada es únicamente visual.

## Casos de uso

- Auditoría de experimentos de fine-tuning: el repositorio permite reproducir los resultados de los adaptadores rechazados y verificar que las métricas reportadas son correctas, sirviendo como material de contraste para equipos que desarrollan detectores de imágenes generadas.
- Investigación sobre pérdidas de consistencia: los adaptadores con pérdida MSE y KL pueden servir para estudiar por qué estas variantes no mejoran la clasificación cuando se aplican sobre un modelo ya entrenado con LoRA.
- Verificación de protocolos de evaluación: el README documenta reglas pre-registradas (mejora de recall o F1 ≥ 0,01 sin elevar el FPR más de 0,05), lo que lo convierte en un ejemplo de buenas prácticas para evaluar cambios en modelos de detección.
- Formación de nuevos investigadores: el repositorio ilustra cómo documentar experimentos fallidos de manera estructurada, con métricas, decisiones y advertencias claras.
- Reproducibilidad de pipelines de entrenamiento: los scripts `download_adapters.py` y `run_inference.py` permiten cargar un adaptador sobre el modelo base y ejecutar inferencia, útil para validar entornos de despliegue.
- Comparación de umbrales de calibración: el uso de umbral 0,5 en los experimentos frente al 0,69 de producción demuestra la importancia de recalibrar cuando se modifica un modelo, un caso didáctico para equipos de ML.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de los experimentos internos del autor, realizados sobre un conjunto de validación de 20 imágenes. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que el modelo no es un LLM. Los resultados de los experimentos son los siguientes:

| Experimento | Métrica | Valor original | Valor fine-tuned | Δ |
|---|---|---|---|---|
| `local_edit_smoke` | Accuracy | 0,6000 | 0,6000 | +0,0000 |
| `local_edit_smoke` | F1 | 0,7500 | 0,7500 | +0,0000 |
| `local_edit_smoke` | Recall | 1,0000 | 1,0000 | +0,0000 |
| `local_edit_smoke` | AUROC | 0,5104 | 0,3542 | −0,1562 |
| `consistency_consistency_mse` | F1 | 0,7500 | 0,7500 | +0,0000 |
| `consistency_consistency_mse` | AUROC | 0,4375 | — | — |
| `consistency_consistency_kl` | F1 | 0,7500 | 0,7500 | +0,0000 |
| `consistency_consistency_kl` | AUROC | 0,4479 | — | — |

Ninguno de los adaptadores superó el umbral de adopción predefinido (+0,01 en recall o F1), por lo que todos fueron rechazados.

## Requisitos de hardware

- Los adaptadores en sí son ligeros (~32 MB), pero requieren cargar el modelo base completo de 740M parámetros.
- Para inferencia con el modelo base en precisión FP16 se estima un consumo de VRAM de aproximadamente 1,5–2 GB solo para los pesos, más overhead de activaciones, por lo que una GPU con 4 GB podría ser suficiente para inferencia básica.
- Se recomienda al menos una GPU de gama media como RTX 3060 o superior para trabajar con comodidad.
- Para fine-tuning (aunque no es el propósito de este repositorio), se necesitaría más VRAM; no se dispone de datos exactos.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con herramientas como vLLM o TGI si se convierte a un formato compatible, aunque no hay instrucciones oficiales. Para uso local, se puede cargar directamente con `transformers` o `peft`.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. El modelo base `Bombek1/ai-image-detector-siglip-dinov2` es el punto de referencia natural, pero no se han publicado comparativas con otros detectores de imágenes generadas como los basados en CLIP o en redes específicas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Los adaptadores fueron entrenados con solo 68 imágenes, lo que los hace estadísticamente poco fiables. Cualquier métrica derivada de ellos debe considerarse anecdótica.
- Ninguno de los adaptadores fue adoptado en producción; el sistema RobustLens real usa el checkpoint base sin modificaciones. Utilizar estos adaptadores en un entorno real degradará el rendimiento, especialmente en AUROC.
- El umbral de calibración de 0,69 del modelo base no es aplicable a los adaptadores; el autor recomienda usar `--no-calibration` y umbral 0,5 en las pruebas, pero esto no garantiza un comportamiento adecuado.
- La licencia Apache-2.0 permite uso comercial, pero dado que son experimentos fallidos, no se recomienda su uso en productos.
- El repositorio no incluye el modelo base, solo los adaptadores. Para usarlos es necesario descargar el checkpoint base por separado.
- No hay garantías de soporte ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopción mínima.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Dylennnn/techjam
- Modelo base: https://huggingface.co/Bombek1/ai-image-detector-siglip-dinov2
- Página del concurso TikTok TechJam 2026: https://tiktoktechjam2026.devpost.com/
- Código fuente de RobustLens (referenciado en el README, sin URL específica): https://github.com/
