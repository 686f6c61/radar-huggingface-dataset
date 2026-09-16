# Reyvic-254/jarvis-brain-qwen3-4b-sft-v1

## Resumen

jarvis-brain-qwen3-4b-sft-v1 es un adaptador LoRA publicado por el usuario Reyvic-254 sobre el modelo base Qwen/Qwen3-4B-Base. No se trata de un modelo completo ni de pesos fusionados: la propia model card indica explícitamente `merged: False`, y el tamaño del repositorio (0,2 GB) es coherente con un adaptador de rango 64, no con los aproximadamente 8 GB que ocuparían los pesos de un transformer de 4.000 millones de parámetros en fp16. El autor lo etiqueta como "JARVIS BRAIN v1 SFT candidate" y lo clasifica en fase experimental.

El adaptador se ha entrenado mediante LoRA en fp16 sobre una base cuantizada en 4 bits (QLoRA, esquema nf4) con rango r=64 y alpha=128, usando el dataset `videlisndichi/jarvis-brain-v1-sft`. El objetivo declarado es un ajuste supervisado (SFT) de tipo asistente, aunque no se documentan ni la composición del dataset, ni el número de tokens de entrenamiento, ni métricas de evaluación.

Su relevancia actual es limitada y debe interpretarse con cautela: el repositorio acumula 0 descargas y 0 "likes", no declara licencia, idiomas ni pipeline, y no aporta resultados de benchmarks. Es un artefacto experimental útil únicamente como punto de partida para reproducir o auditar un pipeline de QLoRA sobre Qwen3-4B, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Base); el repositorio contiene un adaptador LoRA sobre ella |
| Parametros totales | Aprox. 4.000 millones en el modelo base; el adaptador LoRA (r=64) anade un subconjunto reducido de parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-4B-Base declara 32.768 tokens |
| Tipos de cuantizacion | Entrenamiento con QLoRA 4-bit nf4; no se detallan cuantizaciones de inferencia en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (shards remotos del adaptador) |
| Tipo de artefacto | Adaptador LoRA/QLoRA (no fusionado, `merged: False`) |
| Rango y alpha | r=64, alpha=128 |
| Repositorio | 0,2 GB; 0 descargas; 0 likes |
| Estado | Experimental |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Base (revision `1cfa9a7208912126459214e8b04321603b3df60c`), un transformer decoder-only de la familia Qwen3. Sobre esa base se aplica un adaptador de bajo rango (LoRA) con r=64 y alpha=128, entrenado en fp16 sobre una base cuantizada en 4 bits con el esquema nf4 (QLoRA). Este esquema reduce el uso de memoria durante el ajuste, pero introduce error de cuantizacion en la base que puede afectar a la calidad final del adaptador si no se compara contra un entrenamiento en precision completa.

El entrenamiento es de tipo SFT supervisado sobre el dataset `videlisndichi/jarvis-brain-v1-sft` (revision `main`). No se documentan el numero de tokens, la composicion del dataset, la mezcla de idiomas, la longitud de secuencia de entrenamiento ni si hubo fases posteriores de alineamiento (RLHF, DPO o similares). Tampoco se indica ninguna innovacion tecnica adicional (attention lineal, decodificacion especulativa, modo de razonamiento explicito) especifica de este adaptador. Los pesos se almacenan como shards safetensors en el Hub y, segun la propia model card, no se guardan en el arbol de codigo fuente del proyecto JARVIS.

## Capacidades

- No se documenta ninguna capacidad verificada en la informacion disponible.
- Al derivar de Qwen3-4B-Base, el modelo base subyacente es un transformer de proposito general orientado a generacion de texto, pero el repositorio no confirma que el adaptador preserve o mejore esas capacidades.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo de razonamiento, vision, audio): no disponible.
- El nombre del repositorio ("jarvis-brain", "brain") sugiere un proposito de asistente conversacional, pero esto no se sustenta con documentacion tecnica.

## Casos de uso

- Reproduccion de pipelines QLoRA: el adaptador sirve como referencia para replicar un ajuste con r=64, alpha=128 y cuantizacion nf4 sobre Qwen3-4B-Base, verificando como afecta el esquema 4-bit a la calidad final.
- Auditoria de artefactos publicados: permite estudiar el formato de publicacion de adaptadores no fusionados (shards safetensors remotos) y las comprobaciones necesarias antes de cargarlos en produccion.
- Experimentacion academica sobre SFT: util para comparar tecnicas de ajuste supervisado en modelos de 4.000 millones de parametros, siempre que se aporte una evaluacion propia, ya que el repositorio no incluye ninguna.
- Prototipado interno de asistentes: podria probarse como capa de ajuste sobre Qwen3-4B en entornos de desarrollo, asumiendo que no hay evidencia publica de su rendimiento conversacional.
- Pruebas de carga con PEFT: sirve para validar flujos de trabajo que cargan adaptadores LoRA junto al modelo base antes de fusionarlos.
- Investigacion sobre sesgos inducidos por datasets no documentados: dado que se desconoce la composicion de `jarvis-brain-v1-sft`, es un candidato para analizar como un dataset opaco altera el comportamiento de un modelo base conocido.

En todos los casos, el uso en produccion no esta justificado con la informacion disponible: no hay licencia declarada, ni benchmarks, ni validacion de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene un adaptador, no pesos completos; para inferencia es necesario cargar Qwen3-4B-Base (aprox. 8 GB en fp16) y aplicar el adaptador, o bien fusionarlos previamente.
- VRAM estimada para el modelo base en fp16: en torno a 8-10 GB solo para pesos, mas cache KV y activaciones (aproximadamente 10-14 GB en total segun longitud de contexto).
- VRAM estimada en cuantizacion 4-bit: aproximadamente 3-4 GB de pesos, con un total de 5-7 GB en funcion de la ventana de contexto.
- GPU consumer compatibles (estimacion por tamano): RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, y GPUs de 8 GB solo en cuantizaciones agresivas.
- GPU de datacenter: A100, H100, L40S o similares, con holgura sobrada para este tamano.
- Opciones de despliegue: vLLM y TGI admiten adaptadores LoRA sin fusionar; llama.cpp y Ollama requieren fusionar el adaptador y convertir a GGUF, ya que no consumen el adaptador en formato PEFT directamente.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

La comparativa se establece frente a modelos base de tamano equivalente, ya que no existen referencias publicas de adaptadores comparables de este autor. Los datos de la columna "alternativas" provienen de la informacion publica de cada modelo base, no del repositorio analizado.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jarvis-brain-qwen3-4b-sft-v1 | 4B (base) + adaptador LoRA r=64 | No especificado (base: 32.768 tokens) | No disponible | safetensors (adaptador) | Experimental, sin benchmarks, 0 descargas |
| Qwen3-4B-Base | Aprox. 4B | 32.768 tokens | Apache 2.0 | safetensors | Modelo base del adaptador; ampliamente evaluado |
| Llama 3.2 3B | Aprox. 3B | 128.000 tokens | Licencia comunitaria de Llama | safetensors | Alternativa de tamano similar con contexto mayor |
| Phi-4-mini (3.8B) | Aprox. 3,8B | 128.000 tokens | MIT | safetensors | Enfocado a razonamiento y matematicas |

No se dispone de datos de rendimiento del adaptador, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No se declara licencia: no hay autorizacion explicita de uso comercial ni condiciones de redistribucion, lo que impide su adopcion en produccion con garantias legales.
- El modelo no esta fusionado (`merged: False`): cargarlo requiere gestionar explicitamente el adaptador junto al base o ejecutar una fusion previa y verificarla.
- Estado experimental declarado por el propio autor, con 0 descargas y 0 likes; no hay validacion externa.
- No hay benchmarks, evaluaciones ni metricas de ningun tipo, por lo que se desconoce su calidad real frente a Qwen3-4B-Base.
- Se desconoce la composicion del dataset de SFT (`jarvis-brain-v1-sft`), lo que impide evaluar sesgos, contaminacion de benchmarks o licencias de los datos de entrenamiento.
- Riesgo de alucinacion: no cuantificado; al ser un SFT sin fases de alineamiento documentadas, la tasa de alucinacion es impredecible.
- Idiomas soportados no declarados: no hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- El error de cuantizacion derivado del entrenamiento QLoRA 4-bit nf4 puede degradar la calidad respecto a un ajuste en precision completa; no se aporta comparacion.
- La fecha de creacion del repositorio (2026-09-16) y su actualizacion (2026-09-16) figuran en los metadatos, dato a verificar antes de tomarlo como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Reyvic-254/jarvis-brain-qwen3-4b-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/videlisndichi/jarvis-brain-v1-sft
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repos o demos) en la busqueda web realizada.
