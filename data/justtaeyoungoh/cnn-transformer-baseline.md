# justtaeyoungoh/cnn-transformer-baseline

## Resumen

`justtaeyoungoh/cnn-transformer-baseline` es un repositorio de investigacion publicado en HuggingFace que contiene una implementacion funcional de una arquitectura hibrida denominada **CNN Transformer** en configuracion **nano**, orientada a tareas de generacion. Lo desarrolla el usuario `justtaeyoungoh` y su proposito declarado no es ofrecer un modelo utilizable en produccion, sino servir como punto de partida reproducible: codigo transparente, un script ejecutable (`run.py`), un fichero `config.json` con la arquitectura generada y un `training_args.json` con la receta de experimento por defecto.

El peso publicado es un **checkpoint de inicializacion** de 33.088 parametros en formato safetensors, no un modelo entrenado. La propia model card lo indica de forma explicita: el fichero es valido para pruebas de humo (smoke tests), pero no se presenta como un checkpoint con benchmarks. El repositorio ocupa 0,0 GB, no tiene descargas ni likes, y no declara idiomas soportados ni pipeline.

Su relevancia actual es limitada y muy especifica: interesa a quien necesite un esqueleto minimo para experimentar con hibridos convolucion-transformer, validar bucles de decodificacion o montar comparativas de arquitectura con un coste computacional practicamente nulo. No es un modelo para evaluar calidad de generacion, razonamiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrido convolucion + transformer, implementacion propia) |
| Parametros totales | 33.088 (dato real del fichero safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint de inicializacion en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |
| Atencion | multi-query (multi query attention) |
| Fusion | co-attention (co attention) |
| Activacion | mish |
| Normalizacion | rmsnorm |
| Escala | nano |
| Optimizador por defecto | lamb (LAMB) con scheduler polynomial |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 (segun metadatos de HuggingFace) |
| Fecha de actualizacion | 2026-09-16 (segun metadatos de HuggingFace) |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como un **CNN Transformer** de escala nano, con atencion **multi-query**, mecanismo de fusion **co-attention**, activacion **mish** y normalizacion **RMSNorm**. El autor no detalla el numero de capas, dimensiones de embedding, numero de cabezas ni el mecanismo exacto de combinacion entre el bloque convolucional y el bloque de atencion; esa informacion queda recogida, segun el propio repositorio, en el fichero `config.json`, que no se reproduce en el material disponible. Tampoco se especifica la longitud de contexto ni la composicion del vocabulario.

Respecto al entrenamiento, la model card es explicita: la receta incluida usa el optimizador **LAMB** con un scheduler **polynomial**, pero se trata de valores de partida en el script y **no de evidencia de una ejecucion completada**. No se declara numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. El checkpoint `model.safetensors` es una inicializacion valida para pruebas de humo. El autor recomienda, para cualquier evaluacion con sentido, entrenar todos los baselines con la misma exposicion de datos, presupuesto de ajuste y semillas aleatorias, y conservar los logs de entrenamiento y las versiones del entorno junto a cualquier resultado publicado.

## Capacidades

El checkpoint publicado no ha sido entrenado, por lo que no cabe atribuirle capacidades funcionales verificadas. Lo que el repositorio permite hacer es:

- Ejecutar un forward pass y un bucle de generacion de ejemplo mediante `python run.py`, segun el bloque `__main__` del script.
- Servir como andamiaje de codigo para una arquitectura hibrida CNN + transformer con atencion multi-query, co-attention, mish y RMSNorm.
- Validar infraestructura de carga y serializacion: el checkpoint es un safetensors valido, con 33.088 parametros confirmados.
- Probar adaptadores personalizados: al ser una implementacion propia, las APIs genericas de carga automatica de `transformers` requieren un adaptador explicito antes de su uso.
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, capacidades de agente, razonamiento multi-paso y capacidades multilingues: **no disponible / no acreditado**. No hay evidencia de entrenamiento que respalde ninguna de ellas.
- Capacidades especiales (modo thinking, audio, vision): no disponible.

## Casos de uso

- **Prueba de humo en pipelines de integracion continua**: el repositorio esta disenado para smoke tests. Se puede invocar `run.py` en cada commit para verificar que la arquitectura instancia correctamente, que el checkpoint safetensors carga y que el forward pass produce tensores con las formas esperadas, con un coste de computo despreciable.
- **Validacion de bucles de decodificacion**: al no requerir GPU ni memoria relevante, permite probar implementaciones propias de greedy search, beam search, top-k o top-p comprobando que el flujo de logits, mascaras y longitudes funciona antes de escalar a modelos reales.
- **Prototipado y ablaciones de arquitectura**: sirve como base para experimentar con variantes de co-attention, activacion mish frente a alternativas, o RMSNorm frente a LayerNorm, modificando `config.json` y midiendo el efecto sobre una tarea concreta con un conjunto de validacion propio.
- **Pruebas de conversion y serializacion de formatos**: con 33.088 parametros, convertir safetensors a otros formatos (por ejemplo GGUF o binarios de PyTorch) es instantaneo, lo que permite validar herramientas de conversion y scripts de publicacion antes de aplicarlos a modelos grandes.
- **Material docente y de reproduccion**: util como ejemplo minimo y legible de hibrido convolucion-transformer para explicar como se combinan ambos bloques, como se configura un optimizador LAMB con scheduler polynomial y como se registra una receta de experimento en `training_args.json`.
- **Medicion del overhead de frameworks**: al ser el modelo tan pequeno (33.088 parametros, unos 132 KB en fp32), cualquier tiempo de ejecucion medido refleja practicamente el coste del framework (PyTorch, contexto CUDA, data loaders) y no el del modelo, lo que sirve para caracterizar la latencia base de una infraestructura.
- **Base para una comparativa de capacidad equivalente**: la propia model card recomienda incluir un baseline de capacidad ajustada y reportar la metrica de tarea en al menos tres semillas. Este repositorio puede actuar como uno de los brazos de esa comparativa.

En ningun caso estos usos implican generar texto de calidad: el modelo no ha sido entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card omite deliberadamente cualquier afirmacion de rendimiento y senala que el checkpoint es una inicializacion para smoke tests, no un checkpoint de referencia evaluado. La guia de evaluacion propuesta por el autor consiste en usar un conjunto reservado especifico de la tarea, reportar la metrica en al menos tres semillas e incluir un baseline de capacidad equivalente, conservando logs y versiones del entorno.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Cualquier otra metrica de tarea | no disponible |

## Requisitos de hardware

- **VRAM estimada**: despreciable. 33.088 parametros ocupan aproximadamente 132 KB en fp32, 66 KB en fp16 o bf16 y 33 KB en int8. El consumo real en inferencia lo domina el runtime (por ejemplo, el contexto CUDA de PyTorch puede reservar cientos de MB con independencia del modelo).
- **GPU recomendadas**: ninguna en particular. El modelo funciona igual en CPU. Usar una A100, H100 o RTX 4090 no aporta ninguna ventaja medible a esta escala.
- **Compatibilidad con GPU de consumo**: si, cualquier GPU de consumo, e incluso aceleradores integrados. Tambien se ejecuta en una Raspberry Pi o en un portatil sin GPU dedicada.
- **Opciones de despliegue**: el artefacto principal es `run.py`. No se proporcionan pesos en GGUF, por lo que llama.cpp y Ollama no lo soportan de forma nativa. vLLM y TGI no soportan esta arquitectura personalizada sin un adaptador. Para `transformers` es necesario escribir un adaptador explicito, tal como advierte la model card.
- **Latencia y throughput**: no disponibles como cifras publicadas. Dado el tamano del modelo, cualquier latencia medida estara dominada por el overhead del framework (del orden de microsegundos a milisegundos por forward pass en CPU, segun el runtime) y no por el coste de los parametros.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. La busqueda web realizada devolvio unicamente resultados no relacionados (foros sobre VLC Media Player y NTLite), sin ninguna referencia al autor ni a esta arquitectura. La model card recomienda comparar contra un baseline de capacidad equivalente, pero no nombra ninguno concreto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cnn-transformer-baseline (este modelo) | 33.088 | no disponible | MIT | HuggingFace, 0 descargas, 0 likes |
| Alternativa comparable de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Modelo no entrenado**: `model.safetensors` es un checkpoint de inicializacion. Las salidas no tienen valor semantico y no deben usarse para generar contenido destinado a personas.
- **Sin auditoria**: el autor indica explicitamente que el checkpoint no ha sido auditado en robustez, equidad (fairness) ni transferencia de dominio. Cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aqui incluidos.
- **Sesgos conocidos**: no evaluados, dado que no hay entrenamiento ni datos declarados.
- **Riesgo de alucinacion**: no aplica en el sentido habitual, porque el modelo no ha aprendido a producir texto coherente; el riesgo real es interpretar su salida como si fuera un modelo funcional.
- **Limitaciones de contexto e idioma**: no disponibles. No se declara longitud de contexto ni idiomas soportados.
- **Licencia**: MIT, que permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de copyright. El propio autor advierte de que los terminos de los datos de origen deben revisarse por separado si el repositorio se usa con conjuntos de datos externos.
- **Integracion en produccion**: la arquitectura es una implementacion propia, no registrada en `transformers`, por lo que requiere un adaptador explicito y no es compatible de forma inmediata con servidores de inferencia estandar. No hay pesos cuantizados ni formato GGUF.
- **Sin senal de adopcion**: 0 descargas y 0 likes, sin pipeline declarado y con un unico commit registrado. No hay historial de mantenimiento que garantice soporte futuro.
- **Fechas de metadatos**: la fecha de creacion y actualizacion figura como 2026-09-16, posterior a la fecha de consulta habitual de fichas tecnicas; conviene verificar la vigencia de los enlaces antes de citarlos.

## Enlaces

- HuggingFace: https://huggingface.co/justtaeyoungoh/cnn-transformer-baseline
- Paper: no disponible
- Blog o articulo tecnico del autor: no disponible
- Repositorio de codigo independiente: no disponible (el codigo se distribuye dentro del propio repositorio de HuggingFace, con `run.py`, `config.json` y `training_args.json`)
- Demo: no disponible
- Resultados relevantes de la busqueda web: no disponible. Las consultas realizadas devolvieron exclusivamente resultados sin relacion con el modelo (foros de VLC Media Player y NTLite).
