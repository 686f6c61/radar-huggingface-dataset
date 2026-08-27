# RizkyGhb/contrastive-dev

## Resumen

El modelo `RizkyGhb/contrastive-dev` es un repositorio experimental que contiene una implementación híbrida para aprendizaje contrastivo, desarrollado por Rizky Gunawan (RizkyGhb). Se trata de un código base de arquitectura híbrida con atención de ventana deslizante, fusión bilineal, activación swish y normalización rmsnorm, pensado para inspeccionar cambios de arquitectura antes de un entrenamiento completo. El checkpoint incluido (`model.safetensors`) es únicamente una inicialización válida para pruebas de humo, no un modelo entrenado.

Con solo 33.088 parámetros, este repositorio no pretende ofrecer un modelo funcional, sino un punto de partida para experimentación. No se declaran métricas de rendimiento ni se ha realizado ningún entrenamiento. Su relevancia actual es limitada y se circunscribe al ámbito del desarrollo de arquitecturas híbridas para tareas contrastivas, sin aplicaciones prácticas inmediatas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención sliding window, fusión bilineal, activación swish, normalización rmsnorm) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es híbrida, combinando atención con ventana deslizante (sliding window) y fusión bilineal. La activación es swish y la normalización rmsnorm. El repositorio incluye un `config.json` que registra la configuración generada y un `training_args.json` con la receta experimental por defecto (optimizador lamb con programación de tasa de aprendizaje step). No se proporcionan datos sobre el número de tokens de entrenamiento, composición del dataset ni técnicas como RLHF o DPO. El checkpoint `model.safetensors` es una inicialización aleatoria válida para pruebas de humo, no un modelo entrenado. No se ha realizado ningún entrenamiento real.

## Capacidades

- No se han demostrado capacidades funcionales. El modelo no está entrenado y solo sirve como esqueleto de arquitectura.
- No hay soporte para generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o capacidades multilingües.
- El repositorio incluye un script `finetune.py` con un ejemplo ejecutable de entrenamiento, pero no produce un modelo utilizable.
- La implementación es personalizada y requiere un adaptador explícito para cargarse con APIs genéricas.

## Casos de uso

- Desarrollo experimental de arquitecturas híbridas: el repositorio permite probar modificaciones en la atención sliding window, fusión bilineal o normalización antes de un entrenamiento a gran escala.
- Pruebas de humo en pipelines de entrenamiento: el checkpoint de inicialización puede usarse para verificar que el código de entrenamiento funciona correctamente.
- Investigación en aprendizaje contrastivo: como base para implementar y comparar variantes de arquitectura en tareas de representación contrastiva.
- Educación en diseño de modelos: útil para estudiar cómo se estructura un modelo híbrido con atención local y fusión bilineal.
- No es adecuado para ningún caso de uso en producción, inferencia o aplicaciones reales debido a su falta de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación de referencia y que el checkpoint no está entrenado.

## Requisitos de hardware

- Al tener solo 33.088 parámetros, el modelo cabe en cualquier hardware, incluso en CPU.
- No se requieren GPUs específicas; cualquier GPU con al menos 1 GB de VRAM sería más que suficiente.
- El despliegue en vLLM, llama.cpp, Ollama o TGI no es relevante porque el modelo no es funcional.
- La latencia y el throughput no son aplicables al no haber inferencia real.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la misma categoría, ya que se trata de un repositorio experimental sin entrenamiento y sin métricas. No se puede establecer una comparación significativa con alternativas.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No se garantiza ningún comportamiento útil; el modelo no genera texto ni realiza tareas.
- La implementación es personalizada y no compatible con cargadores automáticos estándar sin un adaptador explícito.
- La licencia Apache-2.0 permite uso comercial, pero los términos de los datos externos deben revisarse por separado si se usan con este repositorio.
- No hay garantías de soporte ni mantenimiento; es un proyecto experimental de un solo autor.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/RizkyGhb/contrastive-dev)
- [Perfil del autor en Hugging Face](https://huggingface.co/RizkyGhb)
