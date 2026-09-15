# CARTERAARON/hybrid-demo

## Resumen

hybrid-demo es un repositorio experimental publicado por el usuario CARTERAARON en HuggingFace, orientado a tareas de clasificacion mediante una arquitectura que el autor denomina "Hybrid". No se trata de un modelo de lenguaje generativo ni de un checkpoint entrenado: la propia model card indica explicitamente que `model.safetensors` es un checkpoint de inicializacion valido para pruebas de humo (smoke tests) y no un modelo con entrenamiento completado ni evaluado. El repositorio incluye codigo ejecutable (`main.py`), la configuracion de arquitectura (`config.json`) y la receta de experimento por defecto (`training_args.json`).

El peso del checkpoint es de 49.600 parametros totales, un orden de magnitud propio de una maqueta de arquitectura mas que de un modelo utilizable. La model card no reclama ninguna puntuacion de benchmark y advierte que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio. Su proposito declarado es servir como base manejable para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

Por tanto, la relevancia de esta ficha es acotada: se trata de material de partida para investigacion o docencia sobre arquitecturas hibridas de clasificacion, no de un artefacto listo para produccion. Cualquier evaluacion significativa requeriria, segun el propio autor, entrenar el modelo con un split etiquetado especifico de la tarea, comparar al menos tres semillas e incluir una linea base de capacidad equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid (hibrida), atencion estandar con gated fusion |
| Parametros totales | 49.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros parametros de arquitectura declarados en la model card: escala "base", fusion mediante gated fusion, activacion "gelu tanh" y normalizacion batchnorm.

## Arquitectura y entrenamiento

La arquitectura se describe como "Hybrid" con atencion estandar, un mecanismo de fusion con compuertas (gated fusion), activacion compuesta gelu/tanh y normalizacion por lotes (batchnorm). La configuracion de arquitectura concreta se registra en `config.json`, mientras que el repositorio no detalla la composicion de los bloques internos ni como se combinan los componentes de la parte hibrida. No se especifica el numero de capas, dimensiones ocultas, cabezas de atencion ni el mecanismo exacto de fusion mas alla de la mencion a "gated fusion".

En cuanto al entrenamiento, la model card indica que la receta por defecto usa el optimizador LAMB con un schedule polinomial, pero aclara que son valores iniciales del script y no evidencia de una ejecucion completada. No se documentan tokens de entrenamiento, composicion de dataset, ni fases de RLHF o DPO. El checkpoint `model.safetensors` corresponde a una inicializacion, no a un modelo entrenado, por lo que no existe innovacion tecnica validada empiricamente que reportar.

## Capacidades

- Clasificacion: el repositorio esta etiquetado con la tarea `classification`, pero el checkpoint no ha sido entrenado, por lo que no realiza clasificacion utilizable tal cual.
- Generacion de texto: no disponible; no es un modelo generativo.
- Razonamiento, codigo, matematicas: no disponible; no se declaran estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion de pruebas de humo: incluye un bloque `__main__` en `main.py` con un ejemplo ejecutable para verificar que la arquitectura se instancia correctamente.

## Casos de uso

- Investigacion sobre arquitecturas hibridas: el repositorio permite inspeccionar y modificar una base de arquitectura hibrida sin el coste de un entrenamiento completo, facilitando la exploracion de variantes de fusion y normalizacion.
- Prototipado de pipelines de clasificacion: sirve como esqueleto sobre el que definir la entrada de datos, la funcion de perdida y el bucle de entrenamiento antes de escalar a un modelo mayor.
- Pruebas de humo en integracion continua: al ser un checkpoint minimo (49.600 parametros), se puede cargar y ejecutar en CI para verificar que el codigo de inferencia y la carga de safetensors funcionan sin errores.
- Estudios de ablacion comparativos: el autor recomienda entrenar todas las lineas base con la misma exposicion de datos, presupuesto de ajuste y semillas aleatorias, de modo que el repositorio sirve de punto de partida controlado para experimentos de ablacion.
- Material docente: util para ilustrar como se define una arquitectura personalizada en PyTorch, como se registra su configuracion en `config.json` y como se documenta una receta de entrenamiento.
- Reproduccion y trazabilidad de experimentos: al incluir `training_args.json` y `config.json`, permite fijar y versionar hiperparametros y ajustes de arquitectura, algo util para mantener registro de experimentos reproducibles.
- Base para desarrollo de adaptadores de carga: la model card advierte que, al ser una implementacion personalizada, las APIs automaticas genericas requieren un adaptador explicito; el repositorio puede usarse para desarrollar y probar ese adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card afirma explicitamente que no se reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint incluido no esta entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial; con 49.600 parametros, el checkpoint es de orden de kilobytes y cabe en memoria de cualquier dispositivo actual.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) es mas que suficiente, aunque innecesaria.
- Compatibilidad con GPU consumer: si, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser una implementacion personalizada de clasificacion, se ejecuta mediante el propio `main.py` (`python main.py --help`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio es una base experimental de arquitectura personalizada sin entrenamiento completado y no se posiciona frente a alternativas concretas de la misma categoria. No se dispone de datos de rendimiento que permitan una comparacion significativa con otros modelos de clasificacion.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` es una inicializacion sin entrenar; no produce predicciones utiles tal cual.
- La model card reconoce que el checkpoint no ha sido auditado en robustez, equidad (fairness) ni transferencia de dominio.
- No se han publicado puntuaciones de benchmark, por lo que no existe evidencia empirica de rendimiento.
- Las metricas de arquitectura (capas, dimensiones, contexto) no estan documentadas, lo que dificulta estimar su comportamiento.
- No se declaran idiomas soportados ni capacidades de generacion, tool calling o agentes.
- Al ser una implementacion personalizada, las APIs de carga automatica genericas requieren un adaptador explicito antes de su uso.
- La licencia es apache-2.0, que permite uso comercial del codigo y los pesos, pero el autor advierte que los terminos de los datos de origen deben revisarse por separado si se usan conjuntos de datos externos.
- Para produccion: no se debe desplegar como modelo de clasificacion sin un entrenamiento y una evaluacion previos con datos etiquetados de la tarea y al menos tres semillas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CARTERAARON/hybrid-demo
- Archivos del repositorio: `main.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors` (accesibles desde la pagina del modelo)
- Paper, blog, repositorio adicional o demo: no disponibles en la informacion proporcionada.
