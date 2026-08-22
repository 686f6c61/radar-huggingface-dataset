# firzahdzm/tourn-smoke-qwen3-5-9b-super-sm1

## Resumen

`firzahdzm/tourn-smoke-qwen3-5-9b-super-sm1` es un adaptador LoRA (librería PEFT) publicado en HuggingFace por el usuario `firzahdzm`, diseñado como un ajuste fino sobre el modelo base `Qwen/Qwen3.5-9B`. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (1,4 GB), no el modelo completo, por lo que su uso requiere cargar primero el modelo base y después aplicar el adaptador. La model card está prácticamente vacía: no se especifican datos de entrenamiento, hiperparámetros, licencia, idiomas ni casos de uso previstos.

El nombre del modelo sugiere una posible relación con la familia de adaptadores "SMOKE" (aparecen otros repositorios similares como `TomasJavurek/qwen35-9b-stepwise-smoke` o `SMOKE-2026/Qwen3.5-9B-Adv`), pero no hay documentación que confirme qué tarea concreta aborda este adaptador. Su relevancia actual es limitada: se trata de un experimento de ajuste fino sin validación pública, con cero descargas y cero likes en el momento de la consulta. Para desarrolladores, puede servir como ejemplo de cómo publicar adaptadores LoRA, pero no como recurso fiable para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-9B) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador LoRA tiene un numero reducido de parametros, pero no se publica el desglose) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-9B, no se especifica en el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en `Qwen/Qwen3.5-9B`, un modelo de lenguaje denso de 9.000 millones de parametros de la familia Qwen3.5, que segun la documentacion publica de Qwen incorpora fusion temprana de tokens multimodales (vision-lenguaje) y esta orientado a razonamiento, codigo, agentes y comprension visual. Sin embargo, el adaptador en si no aporta informacion sobre su arquitectura interna: al ser un LoRA, introduce matrices de bajo rango en las capas de atencion y feed-forward del modelo base, pero no se publican ni el rango, ni la configuracion de capas objetivo, ni el metodo de entrenamiento (no se indica si se uso RLHF, DPO, SFT u otro).

Los datos de entrenamiento son desconocidos. La model card no menciona el dataset, el numero de tokens, ni el regimen de entrenamiento (precision, epocas, tasa de aprendizaje). El unico dato tecnico disponible es la version de PEFT 0.19.1 utilizada para el adaptador. No hay ninguna innovacion tecnica documentada en el repositorio.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation`, por lo que el adaptador esta pensado para tareas de generacion autoregresiva.
- Capacidades heredadas del modelo base: al ser un adaptador sobre Qwen3.5-9B, hereda las capacidades del modelo base (razonamiento, codigo, comprension visual, uso de agentes), pero no hay ninguna evaluacion que confirme que el adaptador preserva o mejora dichas capacidades.
- No se documenta soporte explicito de tool calling, function calling, ni multi-step reasoning en el adaptador.
- No se documentan capacidades multilingues especificas.
- No se documenta ningun modo especial (thinking mode, vision, audio).

## Casos de uso

- Experimentacion con adaptadores LoRA: el repositorio sirve como ejemplo de publicacion de un adaptador PEFT sobre Qwen3.5-9B, util para desarrolladores que quieran aprender a cargar y aplicar adaptadores con la libreria `peft`.
- Investigacion sobre ajuste fino de Qwen3.5-9B: dado el nombre "tourn-smoke" y la existencia de otros adaptadores similares, podria formar parte de una linea de experimentos sobre tecnicas de ajuste (posiblemente relacionadas con "stepwise" o "smoke" testing), aunque no hay documentacion que lo confirme.
- Pruebas de compatibilidad: se puede usar para verificar que el ecosistema PEFT 0.19.1 funciona correctamente con Qwen3.5-9B en entornos de desarrollo.
- No se recomienda su uso en produccion, atencion al cliente, generacion de codigo, ni ninguna aplicacion critica, debido a la ausencia total de documentacion, evaluacion y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye ninguna tabla de evaluacion, ni comparaciones con el modelo base o con otros adaptadores. No se puede afirmar ningun dato de rendimiento.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de VRAM dependen del modelo base Qwen3.5-9B. Un modelo denso de 9B en precision fp16 requiere aproximadamente 18 GB de VRAM solo para los pesos, mas el overhead de activaciones y el adaptador.
- Con cuantizacion de 4 bits (por ejemplo, bitsandbytes o GPTQ), el modelo base puede caber en GPUs consumer de 8-12 GB, como RTX 3080, RTX 4070 o RTX 4090.
- El adaptador en si ocupa 1,4 GB en disco, pero en memoria es mucho menor (tipicamente decenas de MB, dependiendo del rango y numero de capas).
- Opciones de despliegue: se puede cargar con `transformers` + `peft` en Python, o servir con vLLM si se fusiona el adaptador con el modelo base. Tambien se puede exportar a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| firzahdzm/tourn-smoke-qwen3-5-9b-super-sm1 | Qwen3.5-9B | Adaptador LoRA | No disponible | No disponible | No disponible | HuggingFace (0 descargas) |
| TomasJavurek/qwen35-9b-stepwise-smoke | Qwen3.5-9B | Adaptador LoRA (entrenado con TRL) | No disponible | No disponible | No disponible | HuggingFace |
| SMOKE-2026/Qwen3.5-9B-Adv | Qwen3.5-9B | Adaptador LoRA | No disponible | No disponible | No disponible | HuggingFace |
| Qwen/Qwen3.5-9B (modelo base) | - | Modelo completo | 9B | No disponible (segun documentacion de Qwen, contexto largo) | Apache 2.0 (segun Qwen) | HuggingFace, Ollama |

No se dispone de datos de rendimiento comparativo entre estos adaptadores. El modelo base Qwen3.5-9B tiene benchmarks publicados en Benchable (83% de tasa de exito en fiabilidad, rendimiento de velocidad en el percentil 10), pero no se puede atribuir ese rendimiento al adaptador.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no especifica datos de entrenamiento, hiperparametros, ni metodologia. Es imposible evaluar la calidad del adaptador.
- Licencia no disponible: no se puede determinar si el adaptador puede usarse comercialmente. Esto bloquea cualquier uso en produccion.
- Riesgo de alucinacion y sesgos: al no haber evaluacion, se desconocen los sesgos introducidos por el ajuste fino. El modelo base Qwen3.5-9B puede tener sesgos propios, pero el adaptador podria amplificarlos o modificarlos sin control.
- Sin garantias de compatibilidad: el adaptador se publico con PEFT 0.19.1, pero no se verifica que funcione con versiones posteriores o con otros frameworks.
- Fecha de creacion futura: el repositorio indica fecha de creacion 2026-08-22, lo que sugiere que podria ser un artefacto de prueba o un error de metadatos. Esto anade incertidumbre sobre su validez.
- No apto para produccion: sin benchmarks, sin licencia y sin documentacion, cualquier integracion en un sistema real es desaconsejable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/firzahdzm/tourn-smoke-qwen3-5-9b-super-sm1
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador similar (TomasJavurek): https://huggingface.co/TomasJavurek/qwen35-9b-stepwise-smoke
- Adaptador similar (SMOKE-2026): https://huggingface.co/SMOKE-2026/Qwen3.5-9B-Adv
- Qwen3.5-9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Benchmarks de Qwen3.5-9B en Benchable: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Qwen3.5-9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
