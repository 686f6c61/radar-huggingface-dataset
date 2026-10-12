# sofiantsw/dissertation-contrastive

## Resumen

sofiantsw/dissertation-contrastive es un prototipo de investigacion basado en la arquitectura CLIP, orientado a tareas de aprendizaje contrastivo entre pares de modalidades (texto e imagen). Lo publica el usuario sofiantsw en HuggingFace y se enmarca dentro de un trabajo de tesis o disertacion, segun se deduce del propio nombre del repositorio. No procede de un laboratorio con infraestructura de entrenamiento a gran escala, sino que se presenta como un esqueleto reproducible de codigo y configuracion.

El punto clave es que el checkpoint incluido (`model.safetensors`) es una inicializacion valida para pruebas de humo (smoke tests), no un modelo entrenado ni evaluado. La model card lo indica de forma explicita: no se reclama ninguna puntuacion de benchmark ni se ha auditado el modelo en cuanto a robustez, equidad o transferencia de dominio. El tamano es deliberadamente minimo (escala "tiny"), con 24.832 parametros totales registrados en safetensors, lo que lo convierte en un artefacto de investigacion mas que en un modelo desplegable.

Por tanto, su relevancia actual es metodologica: documenta formatos de fichero, una receta de entrenamiento por defecto y una implementacion propia de CLIP con atencion grouped query, fusion concat mlp, activacion gelu y normalizacion layernorm. Sirve como punto de partida experimental para quien quiera reproducir o extender el pipeline, no como solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (contrastive, multimodal texto-imagen) |
| Parametros totales | 24.832 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `config.json`, `training_args.json` y `finetune.py`) |

Detalles adicionales de arquitectura declarados en la model card: escala "tiny", atencion grouped query, fusion mediante concat mlp, activacion gelu y normalizacion layernorm.

## Arquitectura y entrenamiento

La arquitectura es CLIP, un modelo contrastivo que proyecta pares de modalidades a un espacio comun y se entrena maximizando la similitud de pares positivos frente a negativos. En esta implementacion concreta se usan atencion grouped query (una variante que agrupa cabezas de clave/valor para reducir coste), fusion por concat mlp, activacion gelu y normalizacion layernorm. La escala es "tiny", consistente con los 24.832 parametros reportados.

En cuanto al entrenamiento, no se ha ejecutado: el repositorio incluye unicamente un checkpoint de inicializacion valido para pruebas de humo. La receta por defecto definida en el script usa el optimizador lamb con un schedule polinomial, pero la propia model card advierte que son valores de arranque, no evidencia de una ejecucion completada. No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF, DPO o ajuste por preferencias. Tampoco se declara ninguna innovacion tecnica adicional mas alla de los componentes de arquitectura listados.

## Capacidades

- Generacion de embeddings contrastivos texto-imagen: potencialmente, tras entrenamiento, el modelo podria producir representaciones alineadas de ambas modalidades. En su estado actual, sin entrenar, esta capacidad no esta validada.
- Clasificacion zero-shot: inherente a la familia CLIP cuando el modelo esta entrenado; no aplicable al checkpoint actual, que es una inicializacion.
- Busqueda y recuperacion multimodal: uso teorico de los embeddings para retrieval texto-imagen; no verificado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (la model card no especifica idiomas).
- Capacidades especiales (thinking mode, vision, audio): la modalidad prevista es vision-texto por la naturaleza CLIP, pero no se aporta ninguna evidencia empirica de funcionamiento.

## Casos de uso

Dado que el checkpoint no esta entrenado, los casos siguientes describen el uso previsto del pipeline de investigacion, no un uso en produccion con este artefacto concreto.

- Reproduccion de experimentos contrastivos: usar `finetune.py` y `config.json` como base para plantear un entrenamiento propio, ajustando la receta lamb + schedule polinomial a un dataset real.
- Pruebas de humo de infraestructura: verificar que un pipeline de carga de safetensors, tokenizacion y bucle de entrenamiento funciona de extremo a extremo antes de lanzar runs costosos.
- Benchmarking metodologico: comparar variantes de atencion (grouped query frente a multi-head) o de fusion (concat mlp frente a alternativas) manteniendo fija la exposicion de datos y las semillas.
- Docencia y prototipado academico: material de partida para asignaturas o tesis que necesiten una implementacion CLIP minima y auditable.
- Estudios de eficiencia: medir el coste de entrenamiento e inferencia a escala "tiny" como linea base frente a configuraciones mayores.
- Validacion de formatos y compatibilidad: comprobar la interoperabilidad de los artefactos (`config.json`, `training_args.json`, `model.safetensors`) con herramientas propias antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante. Con 24.832 parametros, el checkpoint ocupa del orden de decenas de kilobytes en precision completa, por lo que se ejecuta en CPU sin problemas.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (incluso integradas) es suficiente para cargar el checkpoint. GPU de datacenter (A100, H100) solo tendrian sentido si se entrena una version escalada.
- Cabe en GPU consumer: si, en cualquier GPU consumer y tambien en CPU.
- Opciones de despliegue: la model card indica que, al ser una implementacion propia, las APIs genericas de carga automatica requieren un adaptador explicito. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. Al tratarse de un checkpoint sin entrenar, las metricas de rendimiento no serian representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sofiantsw/dissertation-contrastive | 24.832 | no disponible | Apache-2.0 | HuggingFace, sin entrenar |
| OpenAI CLIP ViT-B/32 | ~151 M (referencia) | 77 tokens de texto (referencia) | Codigo MIT / uso del modelo sujeto a condiciones | Publico, entrenado |
| SigLIP base | ~203 M (referencia) | 64 tokens (referencia) | Apache-2.0 | Publico, entrenado |
| OpenCLIP ViT-B/32 | ~151 M (referencia) | 77 tokens (referencia) | MIT | Publico, entrenado |

Las cifras de los modelos de referencia se ofrecen solo como orden de magnitud para situar la escala; no proceden de la informacion proporcionada en esta busqueda y deben verificarse en sus respectivas fuentes. La diferencia fundamental no es solo de tamano, sino de estado: los alternativas citadas estan entrenadas y evaluadas, mientras que este repositorio contiene unicamente una inicializacion.

## Limitaciones y advertencias

- El checkpoint no esta entrenado. Cualquier salida que produzca carece de valor semantico y no debe interpretarse como resultado de un modelo funcional.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, segun reconoce la propia model card.
- Riesgo de alucinacion y de resultados arbitrarios: al no haber aprendizaje, no existe garantia alguna sobre las representaciones generadas.
- Sin datos de sesgos conocidos: no se ha realizado ningun analisis de sesgo, por lo que se desconoce su comportamiento en cualquier subpoblacion o dominio.
- Limitaciones de contexto e idioma: no se especifican ni la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: el repositorio se publica bajo Apache-2.0, lo que permite uso comercial del artefacto; sin embargo, si se emplea con datasets externos, los terminos de esos datos deben revisarse por separado, tal como advierte el autor.
- Estado experimental: la implementacion es propia, de modo que las APIs de carga generica requieren un adaptador explicito y no se garantiza compatibilidad con ecosistemas estandar.
- Cualquier resultado futuro obtenido con un checkpoint entrenado debe documentarse de forma separada a los valores por defecto aqui incluidos.

## Enlaces

- HuggingFace: https://huggingface.co/sofiantsw/dissertation-contrastive
