# efe-T/Experiment-1-A-xIELU-CPT

## Resumen

El modelo `efe-T/Experiment-1-A-xIELU-CPT` es un experimento de continued pretraining (CPT) desarrollado por Efe Aydın (efe-T) sobre un checkpoint previo denominado `Experiment-1-A`. El objetivo es probar la activación xIELU, una función de activación personalizada con parámetros aprendibles, aplicada de forma pura desde el paso 0 del CPT. El entrenamiento se realiza sobre shards no vistos del dataset FineWeb-Edu, con una arquitectura basada en GPT-2 (según las etiquetas del repositorio). El proyecto se encuentra en estado "running" (en ejecución) y no está pensado como un modelo listo para usar: el repositorio contiene código PyTorch personalizado y pesos safetensors crudos, sin integración directa con Transformers.

La relevancia de este experimento radica en explorar alternativas a las activaciones estándar (como GELU o SiLU) mediante una activación diferenciable con parámetros entrenables, lo que podría mejorar la eficiencia o la capacidad de representación en modelos de lenguaje. Sin embargo, al ser un trabajo en curso y sin documentación adicional, su utilidad práctica es limitada fuera del ámbito de la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en GPT-2 (sin especificar tamaño exacto) |
| Parametros totales | no disponible (se observan checkpoints de 250M, 500M, 750M y final, pero no se indica el total) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (además de código PyTorch personalizado) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer tipo GPT-2, aunque no se especifican detalles como el número de capas, dimensiones ocultas o cabezas de atención. La innovación principal es el uso de la activación xIELU, que incorpora parámetros aprendibles: `alpha_p` (pendiente positiva), `alpha_n` (pendiente negativa), `beta` (factor de escala) y `eps` (épsilon para estabilidad numérica). Esta activación es diferenciable y se entrena junto con el resto de pesos del modelo.

El entrenamiento consiste en un continued pretraining del checkpoint `Experiment-1-A` (cuyo SHA-256 se indica en el repositorio) sobre los shards 000011 a 000031 de FineWeb-Edu, de forma monótona y sin envolver. Se han procesado 2.000.158.720 tokens en la fase base, y el CPT comienza desde el paso 0 con 0 tokens procesados. El entrenamiento utiliza BF16, una GPU NVIDIA A100-SXM4-40GB, y un tamaño de lote de 524.288 tokens por paso de optimizador. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

No se han documentado capacidades específicas del modelo en la información disponible. Al tratarse de un modelo de lenguaje basado en GPT-2, se espera que pueda realizar generación de texto, pero no hay confirmación oficial ni ejemplos de uso. Tampoco se menciona soporte para tool calling, agentes, razonamiento multi-paso, visión o audio. El modelo está en fase experimental y no se ha evaluado su comportamiento en tareas concretas.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al ser un experimento de investigación en curso, no está recomendado para aplicaciones en producción. Cualquier uso práctico requeriría primero completar el entrenamiento, evaluar su rendimiento y validar su comportamiento en tareas concretas. Por tanto, se indica "no disponible" para esta sección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar. El modelo se encuentra en fase de entrenamiento, por lo que no se puede evaluar su rendimiento comparativo.

## Requisitos de hardware

- El entrenamiento se realiza en una GPU NVIDIA A100-SXM4-40GB con precisión BF16.
- No se proporcionan estimaciones de VRAM para inferencia, ni recomendaciones de GPU específicas para despliegue.
- Al no estar disponible el modelo en formatos como GGUF o cuantizaciones, no se puede determinar si es viable en GPUs de consumo.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se conocen datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. No se conocen otros modelos que utilicen la activación xIELU ni se han publicado métricas que permitan una comparación objetiva. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- El modelo está en estado "running" (entrenamiento en curso) y no es un checkpoint final estable.
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o de investigación sin restricciones.
- El repositorio contiene código personalizado y no es un modelo compatible con la API estándar de Transformers; se requiere manipulación manual de los pesos.
- No se han realizado evaluaciones de seguridad o robustez.
- Al ser un experimento de investigación, no se recomienda su uso en entornos de producción.

## Enlaces

- [HuggingFace - efe-T/Experiment-1-A-xIELU-CPT](https://huggingface.co/efe-T/Experiment-1-A-xIELU-CPT)
- [GitHub - rubber-duck-debug/xielu (implementación de XIELU)](https://github.com/rubber-duck-debug/XIELU)
- [Perfil de efe-T en HuggingFace](https://huggingface.co/efe-T/models)
