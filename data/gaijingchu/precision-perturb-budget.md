# gaijingchu/precision-perturb-budget

## Resumen

`precision-perturb-budget` es un repositorio de artefactos de investigación publicado por Jingchu Gai (gaijingchu), estudiante de doctorado en el Machine Learning Department de Carnegie Mellon University. No se trata de un modelo entrenado para uso general, sino de una colección de ejecuciones de ajuste fino de modelos OLMo-core de 30M de parámetros entrenados sobre Dolma CC, cuyo objetivo es estudiar la interacción entre la precisión numérica del entrenamiento y la robustez frente a perturbaciones de pesos.

Cada directorio del repositorio corresponde a una ejecución de entrenamiento concreta e incluye el state dict final en formato OLMo-core (`model.pt`), la configuración del modelo (`config.json`), la configuración completa del entrenamiento (`launch.yaml`) y mediciones por ejecución: pérdida final, barridos de perturbación gaussiana de pesos y resultados de cuantización post-entrenamiento. Los nombres de las ejecuciones codifican tamaño del modelo, tokens de entrenamiento, precisión de entrenamiento (bf16, weight-only, pesos y activaciones), learning rate y semilla.

El interés del artefacto es metodológico: proporciona puntos de medida reproducibles para analizar cómo distintas precisiones de entrenamiento afectan a la sensibilidad del modelo ante perturbaciones y a su comportamiento tras cuantización. El repositorio no incluye checkpoints intermedios ni datos de entrenamiento, y no está pensado para inferencia directa en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo-core (transformer decoder-only, según el formato de los artefactos) |
| Parametros totales | 30M (tamaño de las ejecuciones incluidas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantización post-entrenamiento evaluada en las mediciones por ejecución; tipos concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict en formato OLMo-core (`model.pt`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

Los artefactos corresponden a modelos OLMo-core de 30M de parámetros entrenados sobre Dolma CC. El repositorio documenta ejecuciones de ajuste fino con distintas precisiones numéricas: `bf16`, precisión weight-only (`w<bits>`) y precisión conjunta de pesos y activaciones (`f<bits>`). Cada ejecución se identifica además por el número de tokens de entrenamiento (`D<tokens>B`), el learning rate y la semilla, lo que permite comparar configuraciones de forma controlada.

La innovación del artefacto no está en la arquitectura, sino en el protocolo de medición: para cada ejecución se registran la pérdida final, barridos de perturbación gaussiana sobre los pesos y resultados de cuantización post-entrenamiento. Esto permite estudiar empíricamente la relación entre el presupuesto de precisión del entrenamiento y la robustez del modelo resultante. No se especifican en la información disponible el número total de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto propia de un modelo de lenguaje decoder-only de 30M de parámetros, entrenado sobre Dolma CC.
- Punto de medida reproducible para estudios de robustez: barridos de perturbación gaussiana de pesos por ejecución.
- Evaluación de cuantización post-entrenamiento comparada entre configuraciones de precisión de entrenamiento.
- Comparación controlada de configuraciones de entrenamiento (precisión, tokens, learning rate, semilla) mediante `launch.yaml` y métricas JSON por ejecución.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Estudio de sensibilidad a perturbaciones: usar los barridos gaussianos incluidos para analizar cómo la precisión de entrenamiento condiciona la degradación de la pérdida ante ruido en los pesos.
- Investigación en cuantización: comparar los resultados de cuantización post-entrenamiento entre ejecuciones `bf16`, weight-only y pesos más activaciones para decidir qué régimen de entrenamiento produce modelos más cuantizables.
- Reproducción de experimentos a pequeña escala: las configuraciones `launch.yaml` permiten replicar ejecuciones de 30M parámetros con bajo coste computacional antes de escalar a modelos mayores.
- Metodología de ablation: usar el esquema de nombres (tamaño, tokens, precisión, learning rate, semilla) como plantilla para diseñar estudios factoriales de entrenamiento.
- Docencia y formación: modelos de 30M parámetros con artefactos completos de configuración y métricas son adecuados para ilustrar efectos de precisión numérica en cursos de entrenamiento de LLM.
- Referencia para pipelines internos de evaluación: integrar el formato de mediciones JSON como base para comparar futuras ejecuciones propias con las publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye métricas de pérdida final, barridos de perturbación y cuantización por ejecución, pero sus valores concretos no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 30M parámetros en fp32 ocupa aproximadamente 120 MB de pesos; en bf16, unos 60 MB. La VRAM total dependerá del contexto y del framework.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100 para este tamaño.
- Cabe holgadamente en GPU consumer (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU para inferencia a baja escala.
- Opciones de despliegue: los pesos están en formato OLMo-core (`model.pt`), por lo que requieren el stack de OLMo-core o una conversión previa a safetensors/PyTorch estándar. No se distribuyen pesos en GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| precision-perturb-budget | 30M | no disponible | Artefactos de estudio precisión-perturbación | no disponible | Hugging Face (repo de 0,3 GB) |
| OLMo-core (modelos base) | Varía (incluye 30M) | no disponible | Modelos de lenguaje entrenados sobre Dolma | no disponible | Pesos publicados por el proyecto OLMo |
| Modelos de investigación tipo Pythia | 70M-12B | 2048 tokens (versiones pequeñas) | Suite de estudio de entrenamiento | Apache 2.0 (versiones publicadas) | Hugging Face |

La comparación directa es limitada: `precision-perturb-budget` no es un modelo para uso general, sino un conjunto de ejecuciones experimentales con mediciones asociadas. Los datos de licencia y contexto de este repositorio no están disponibles.

## Limitaciones y advertencias

- No es un modelo para producción: se trata de artefactos de investigación de 30M de parámetros sin model card orientada a uso general.
- No incluye checkpoints intermedios ni datos de entrenamiento, lo que limita la reproducibilidad completa del pipeline.
- El formato de pesos es OLMo-core (`model.pt`), no safetensors ni GGUF; requiere conversión para la mayoría de stacks de inferencia.
- Licencia no disponible: no debe asumirse uso comercial permitido sin confirmación del autor.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; en un modelo de 30M entrenado sobre Dolma CC cabe esperar calidad de texto limitada.
- Los resultados de perturbación y cuantización corresponden a ejecuciones concretas con semillas y learning rates específicos; no deben generalizarse sin replicación.
- Contexto máximo no disponible; no apto para tareas que requieran ventanas largas sin verificación previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gaijingchu/precision-perturb-budget
- Perfil de Hugging Face del autor: https://huggingface.co/gaijingchu/models
- GitHub del autor: https://github.com/gaijingchu
- Página personal del autor: https://gaijingchu.github.io/
