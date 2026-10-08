# gabrielamarques/mae-experiment

## Resumen

Mae-experiment es un prototipo de investigacion publicado por el usuario gabrielamarques en HuggingFace bajo el identificador `gabrielamarques/mae-experiment`. Se presenta como una implementacion propia y experimental de una arquitectura denominada "Mae" orientada a tareas de clasificacion. No debe confundirse con los autoencoders enmascarados (Masked Autoencoders, MAE) de la familia ViT-MAE: aqui "Mae" es el nombre de una arquitectura personalizada definida por el autor, con atencion dilatada, fusion mediante un MLP con concatenacion, activacion mish y normalizacion layernorm.

El repositorio es, segun su propia model card, un andamiaje de investigacion y no un modelo entrenado. El checkpoint `model.safetensors` se describe explicitamente como una inicializacion valida unicamente para pruebas de humo (smoke tests) y no como un modelo evaluado. El autor no reclama ninguna puntuacion de benchmark, idioma soportado ni capacidad funcional verificada.

El dato objetivo mas relevante es su tamano: 33.088 parametros totales, segun el recuento real de safetensors. Se trata por tanto de un artefacto de escala minima, con 14 descargas y 0 likes en el momento de la consulta, pensado para reproducibilidad de experimentos y desarrollo de codigo, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mae (implementacion propia): atencion dilatada, fusion concat mlp, activacion mish, normalizacion layernorm |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documenta cuantizacion especifica) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con `config.json` y `training_args.json` de acompanamiento) |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como "Mae", a escala "base", con atencion dilatada, una estrategia de fusion basada en un MLP con concatenacion, funcion de activacion mish y normalizacion layernorm. La configuracion generada se almacena en `config.json` y la receta de experimento por defecto en `training_args.json`. El unico dato cuantitativo disponible sobre el diseno es el recuento de parametros: 33.088 en total, un orden de magnitud muy alejado de los transformers de clasificacion habituales.

En cuanto al entrenamiento, la model card indica que la receta por defecto usa el optimizador Adafactor con un schedule de warmup constante, y aclara de forma explicita que estos son valores de partida en el script, no evidencia de una ejecucion completada. El propio autor afirma que el checkpoint de inicializacion no ha sido entrenado ni auditado, que no se reclama ninguna puntuacion de benchmark y que cualquier resultado de un futuro checkpoint entrenado debera documentarse por separado de los valores por defecto aqui incluidos. No se aportan datos sobre numero de tokens, composicion del dataset, ni tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Clasificacion: es el unico dominio declarado en las etiquetas del repositorio, pero no hay evidencia de rendimiento porque el checkpoint no esta entrenado.
- Generacion de texto: no disponible.
- Razonamiento, matematicas o codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Pruebas de humo: el artefacto esta pensado para verificar que los scripts de carga e inferencia funcionan (`python predict.py --help`), no para producir predicciones utiles.

## Casos de uso

- Prototipado de arquitecturas en investigacion: sirve como punto de partida para estudiar la combinacion de atencion dilatada, fusion por MLP concatenado, mish y layernorm en un modelo de clasificacion, permitiendo iterar sobre el diseno sin partir de cero.
- Pruebas de humo de pipelines de ML: al ser un checkpoint ligero y valido, se puede usar para verificar que un pipeline de carga de safetensors, preprocesado y evaluacion no falla antes de escalar a modelos reales.
- Desarrollo y depuracion de scripts de entrenamiento: la presencia de `training_args.json` con Adafactor y warmup constante permite probar la logica de un bucle de entrenamiento y su configuracion con un coste computacional minimo.
- Experimentos de reproducibilidad metodologica: la model card insiste en entrenar todos los baselines con la misma exposicion de datos, presupuesto de ajuste y semillas; el repositorio puede servir como plantilla para ese protocolo comparativo.
- Docencia y formacion: por su tamano de 33.088 parametros es adecuado para ilustrar la estructura de un modelo, el formato safetensors y la organizacion de un repositorio de investigacion sin requerir hardware especializado.
- Base para adaptadores propios: al ser una implementacion personalizada, admite que el usuario escriba un adaptador explicito para integrarla en APIs de carga genericas y experimentar con tareas de clasificacion concretas usando sus propios datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se reclama ninguna puntuacion de benchmark y que el checkpoint no ha sido entrenado, por lo que no existen metricas de MMLU, HumanEval, GSM8K ni de exactitud de clasificacion que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: marginal. Con 33.088 parametros, el modelo ocupa del orden de decenas o centenas de kilobytes segun la precision de los pesos, muy por debajo de cualquier umbral relevante.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna puede ejecutar la carga y la inferencia de un modelo de este tamano.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo (y en la mayoria de entornos sin GPU dedicada), aunque su uso no aporta ventaja frente a CPU.
- Opciones de despliegue: `predict.py` como entry point; al ser una implementacion personalizada, las APIs de carga automatica (por ejemplo, `from_pretrained` generico) requieren un adaptador explicito antes de su uso. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay comparativa directa disponible. La arquitectura "Mae" de este repositorio es una implementacion propia del autor y no coincide con los autoencoders enmascarados de la familia ViT-MAE ni con otros modelos publicados. Ademas, al tratarse de un checkpoint sin entrenar, cualquier comparacion de rendimiento carece de sentido. Se incluye a continuacion una referencia orientativa de categorias, no de resultados.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gabrielamarques/mae-experiment | 33.088 | no disponible | Clasificacion (prototipo sin entrenar) | MIT | HuggingFace |
| ViT-Base (referencia de clasificacion) | ~86 M | no aplica | Vision transformer de clasificacion | segun variante | Amplia |
| ResNet-50 (referencia de clasificacion) | ~25 M | no aplica | CNN de clasificacion | BSD/varia | Amplia |

Las filas de referencia se incluyen solo para situar el orden de magnitud; no proceden de la informacion proporcionada sobre este repositorio y no constituyen una comparacion de rendimiento valida.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: `model.safetensors` es una inicializacion para pruebas de humo, no un modelo funcional.
- No existe evidencia de rendimiento: ninguna puntuacion de benchmark, ninguna metrica de tarea y ningun idioma declarado.
- No hay auditoria de robustez, equidad ni transferencia de dominio; la model card lo indica expresamente.
- Sesgos conocidos: no disponible, precisamente porque el modelo no ha sido entrenado ni evaluado.
- Riesgo de alucinacion: no evaluable en un modelo sin entrenar y sin capacidades generativas confirmadas.
- Limitaciones de contexto e idioma: no disponible.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero el autor advierte de que deben revisarse por separado los terminos de las fuentes de datos externas que se usen con este repositorio.
- Para produccion: no es apto. Al ser una implementacion personalizada, requiere un adaptador explicito para integrarse en APIs de carga genericas, y cualquier resultado obtenido con un futuro checkpoint entrenado debera documentarse de forma independiente de los valores por defecto incluidos.
- Fecha de creacion y actualizacion registradas: 2026-10-08, segun los metadatos del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/gabrielamarques/mae-experiment
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
