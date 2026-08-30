# agentic-ptb/opus-high-v3.h017.sft-v6.step_8

## Resumen

Este modelo es un checkpoint intermedio del experimento `opus-high-v3` del proyecto AgentPTB, concretamente el paso `h017.sft-v6.step_8`. Se trata de un derivado del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros, publicado con licencia Apache 2.0. El autor lo etiqueta explícitamente como un resultado negativo: el run de entrenamiento no encontró ninguna mejora en los pesos respecto al modelo base, y el checkpoint se retiene únicamente con fines de reproducibilidad y estudio cualitativo.

La relevancia de este modelo es principalmente metodológica: documenta un experimento fallido dentro de un pipeline de ajuste fino supervisado (SFT) sobre un modelo de 9B parámetros. No debe interpretarse como un modelo útil para tareas reales, sino como un artefacto de investigación. La model card advierte explícitamente: "no se debe inferir calidad a partir de la publicación". Por tanto, cualquier uso en producción está totalmente desaconsejado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la informacion disponible. Al estar basado en Qwen/Qwen3.5-9B-Base, se presume una arquitectura transformer densa similar a la familia Qwen, pero no hay confirmacion de detalles como el numero de capas, cabezas de atencion o mecanismos especificos. El entrenamiento consistio en un ajuste fino supervisado (SFT) dentro del pipeline AgentPTB, denominado `sft-v6`, ejecutado durante 17 horas (h017). El run completo no produjo ninguna mejora en los pesos: los cinco runs SFT regresaron al modelo base sin cambios significativos, segun la documentacion del proyecto. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

No se han publicado capacidades especificas para este checkpoint. Al ser un derivado sin mejora de pesos, no se puede garantizar ninguna capacidad funcional. En principio, heredaria las capacidades del modelo base Qwen3.5-9B-Base, pero dado que el entrenamiento no produjo cambios, es probable que se comporte como el base sin ajustes. No hay informacion sobre tool calling, agentes, vision, audio ni otras capacidades especiales.

## Casos de uso

Dado el caracter de resultado negativo, no se recomienda ningun caso de uso practico. Los unicos escenarios plausibles son:

- Reproducibilidad de experimentos: investigadores pueden usar este checkpoint para verificar los resultados del run `opus-high-v3` y analizar por que no hubo mejora.
- Estudio de fallos en SFT: como ejemplo de un run que no converge, puede servir para investigar causas de regresion en ajuste fino.
- Comparacion de pesos: para auditar la diferencia entre el checkpoint y el modelo base, verificando que efectivamente no hay cambios significativos.
- Desarrollo de pipelines de evaluacion: como caso de prueba para herramientas de seguimiento de experimentos.
- Documentacion de resultados negativos: para publicaciones que requieran incluir todos los intentos, incluidos los fallidos.
- Educacion: en cursos de ML, como ejemplo de que no todo entrenamiento produce mejoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona ninguna metrica de evaluacion, y la model card indica explicitamente que no se debe inferir calidad. Por tanto, no se presentan tablas de rendimiento.

## Requisitos de hardware

No se dispone de datos sobre requisitos de hardware especificos para este checkpoint. Sin embargo, al tratarse de un modelo de aproximadamente 9.4B parametros en precision fp16 o bf16 (tamano de repo 18.8 GB), se puede estimar:

- VRAM para inferencia en fp16: aproximadamente 19-20 GB, lo que requiere una GPU con al menos 24 GB (por ejemplo, RTX 3090/4090, A100 40GB) o cuantizacion a 8 bits (~10 GB) o 4 bits (~5-6 GB).
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, o GPUs con mas de 20 GB de VRAM para fp16.
- Con cuantizacion GGUF de 4 bits, podria ejecutarse en GPUs consumer de 8-12 GB, pero no hay confirmacion de que existan cuantizaciones disponibles.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI podrian usarse si se generan los formatos adecuados, pero no se proporcionan.

Dado que es un checkpoint de investigacion, no se recomienda su despliegue en produccion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. El modelo base Qwen3.5-9B-Base es la referencia natural, pero no se conocen sus metricas en este contexto. Otros modelos de tamano similar (9-10B) como Llama 3.1 8B, Mistral 7B o Gemma 2 9B podrian ser comparables estructuralmente, pero sin benchmarks no es posible establecer una comparativa significativa.

## Limitaciones y advertencias

- Este es un checkpoint intermedio de un run fallido: el autor confirma que no hubo mejora de pesos entrenados.
- No debe usarse en produccion ni para tareas reales, ya que no se garantiza ningun comportamiento util.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de calidad documentada hace inviable cualquier aplicacion practica.
- El modelo esta etiquetado como "negative-results", lo que implica que su unico valor es investigador.
- No se proporcionan datos de entrenamiento, composicion de dataset ni detalles tecnicos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/opus-high-v3.h017.sft-v6.step_8
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto: https://huggingface.co/datasets/agentic-ptb/INDEX
