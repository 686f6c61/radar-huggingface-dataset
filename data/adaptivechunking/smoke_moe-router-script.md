# AdaptiveChunking/smoke_moe-router-script

## Resumen

`smoke_moe-router-script` es un modelo de investigacion publicado por el usuario AdaptiveChunking en Hugging Face. Se trata de un modelo de lenguaje a nivel de byte basado en la arquitectura H-Net (con un router MoE en la variante `hnet_moe_router`) generado mediante la herramienta [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). El nombre ("smoke") y el tamano (75.152 parametros totales) indican que es una ejecucion de prueba de humo (smoke test) destinada a validar el pipeline de entrenamiento, no un modelo utilizable en produccion.

El modelo se entreno con un objetivo de tipo `ratio`, sin schedule (`schedule=None`), decodificacion por EMA (`dechunk=ema`), semilla 0 y un total de 20 pasos sobre 4 secuencias de 128 bytes, con idiomas de entrenamiento ingles, aleman e hindi. El repositorio incluye ramas por checkpoint (`step-N`) con pesos en safetensors, configuracion, configuracion de entrenamiento y estado resumible del trainer, ademas de una rama `main` con los ultimos pesos y, en su caso, logs y sondas de frontera FLORES+.

Su relevancia es exclusivamente metodologica: sirve como referencia de como estructura beetle-hnet los artefactos de entrenamiento (checkpoints por fase, tensores atados, estado resumible) y como plantilla para reproducir experimentos de tokenizacion dinamica a nivel de byte. No debe confundirse con un LLM funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net con router MoE (`architecture=hnet_moe_router`), a nivel de byte |
| Parametros totales | 75.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenado con secuencias de 128 bytes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | entrenado con `['en', 'de', 'hi']`; cobertura real no evaluada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), estado del trainer en `checkpoint.pt` (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una H-Net (modelo jerarquico a nivel de byte) con un router de mezcla de expertos, segun la etiqueta `architecture=hnet_moe_router`. El objetivo de entrenamiento es `ratio` con `schedule=None` y decodificacion `dechunk=ema`. El repositorio almacena cada tensor atado una sola vez en `model.safetensors`; el mapeo entre nombres descartados y almacenados se encuentra en `config.json["tied_weights"]`.

El entrenamiento consistio en 20 pasos sobre 4 secuencias de 128 bytes (semilla 0), con datos en ingles, aleman e hindi. Se trata, por tanto, de una ejecucion de validacion del pipeline, no de un entrenamiento con volumen representativo. El repositorio conserva el estado resumible completo del trainer (`training_state/checkpoint.pt`) en cada rama `step-N`, lo que permite reanudar el entrenamiento y auditar la evolucion por fases. No se dispone de informacion sobre composicion del dataset, numero total de tokens procesados ni uso de RLHF/DPO.

## Capacidades

- Generacion de texto a nivel de byte: el modelo opera sobre bytes, no sobre tokens subword, lo que en teoria permite cubrir cualquier idioma o secuencia binaria sin vocabulario fijo.
- Router MoE: incluye un mecanismo de enrutamiento a expertos, aunque con 75.152 parametros totales la capacidad efectiva es minima.
- Multilingue teorica: entrenado con muestras de ingles, aleman e hindi.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No dispone de modo "thinking" ni capacidades especiales declaradas.

## Casos de uso

- Validacion de pipelines de entrenamiento: sirve para comprobar que el flujo de beetle-hnet genera correctamente ramas `step-N`, tensores atados y estado resumible antes de lanzar ejecuciones mayores.
- Pruebas de integracion en CI: al ocupar 0.0 GB y tener 75.152 parametros, puede cargarse en cualquier entorno para verificar que el codigo de carga de safetensors y la resolucion de `tied_weights` funcionan.
- Reproduccion de experimentos de tokenizacion a nivel de byte: como referencia minima de la configuracion `hnet_moe_router` con `objective=ratio` y `dechunk=ema`.
- Desarrollo de herramientas de auditoria de checkpoints: el layout con `training_config.yaml`, `log.jsonl`, `final.json` y sondas FLORES+ permite probar utilidades de inspeccion y comparacion entre pasos.
- Docencia e investigacion sobre MoE: ejemplo de estructura de repositorio para explicar como se organizan pesos, configuracion y estado de entrenamiento en modelos con enrutamiento.
- Pruebas de humo de infraestructura de inferencia: verificar que un servidor (por ejemplo, un contenedor con PyTorch) es capaz de descargar, cargar y ejecutar un modelo minimo antes de desplegar modelos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 75.152 parametros los pesos ocupan del orden de cientos de kilobytes en fp32.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una iGPU; tambien es viable en CPU.
- Cabe en cualquier GPU de consumo; no requiere A100, H100 ni RTX 4090.
- Opciones de despliegue: carga directa con PyTorch y `huggingface_hub`; no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un smoke test no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables publicados con esta configuracion exacta (H-Net a nivel de byte con router MoE y 75.152 parametros); las alternativas habituales de la categoria (modelos byte-level como ByT5 o CANINE) tienen ordenes de magnitud mas parametros y objetivos distintos.

## Limitaciones y advertencias

- Modelo de prueba de humo: 20 pasos de entrenamiento sobre 4 secuencias de 128 bytes no producen un modelo con capacidad de generar texto coherente.
- Riesgo de alucinacion y salidas sin sentido practicamente garantizado en uso generativo.
- Sin evaluacion publicada de sesgos, calidad ni robustez.
- Cobertura idiomatica no verificada; la presencia de `en`, `de` e `hi` en el entrenamiento no implica competencia en esos idiomas.
- Contexto efectivo desconocido y muy limitado por las secuencias de 128 bytes usadas en entrenamiento.
- Licencia Apache-2.0 permite uso comercial del codigo y pesos, pero el modelo no es funcionalmente apto para produccion.
- No hay garantia de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/smoke_moe-router-script
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
