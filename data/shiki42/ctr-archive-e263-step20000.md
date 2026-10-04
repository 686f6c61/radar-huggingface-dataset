# Shiki42/ctr-archive-e263-step20000

## Resumen

`Shiki42/ctr-archive-e263-step20000` es un checkpoint de robótica publicado en HuggingFace, archivado por el usuario Shiki42 el 4 de octubre de 2026. Según la model card, corresponde a un entrenamiento secuencial de tipo ACT (Action Chunking with Transformers) sobre la tarea denominada "PutCab" en la plataforma PRO6000, y se conserva como copia archivística del paso 20.000 (step 20000) junto con su normalización. No se trata de una publicación de resultados de investigación: el propio autor indica que el archivo "no establece identidad con resultados de paper ni aprobación de auditoría", y que los defectos históricos y las restricciones de alcance del experimento siguen vigentes.

El modelo tiene 51.685.006 parámetros (unos 51,7 millones), un tamaño que lo sitúa en la franja de las políticas de imitación ligeras, desplegables en hardware de borde. El repositorio ocupa 0,2 GB y contiene pesos en formato safetensors. La model card menciona ficheros auxiliares de procedencia (`archive-provenance.json`, `source-config.json`) y aclara que solo se incluyen los parámetros de inferencia y el estado real de normalización/procesador, sin optimizador ni estado del generador de números aleatorios.

Su relevancia es limitada y muy específica: sirve como artefacto de reproducibilidad y auditoría interna para un experimento concreto de manipulación robótica, no como modelo de propósito general. No hay datos publicados sobre licencia, idiomas, benchmarks ni licencia de uso comercial, por lo que cualquier evaluación externa debe partir de esa ausencia de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), segun la model card; detalles de configuracion no disponibles (referencia a `source-config.json`, no incluido en la informacion) |
| Parametros totales | 51.685.006 (aprox. 51,7 M) |
| Parametros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo incluye pesos en safetensors, sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible (politica de accion robotica; no se documentan capacidades linguisticas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo como un entrenamiento "ACT Sequential" sobre la tarea PutCab en la plataforma PRO6000. ACT (Action Chunking with Transformers) es una familia de politicas de imitacion para manipulacion robotica que predice bloques de acciones (action chunks) en lugar de acciones individuales, combinando tipicamente un codificador visual con un transformer encoder-decoder. Sin embargo, para este checkpoint concreto no se dispone de la configuracion exacta: el numero de capas, dimensiones, ventana de observacion, resolucion de imagen ni el backbone visual no estan publicados en la informacion disponible.

Tampoco hay datos sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de demostraciones ni si se aplicaron fases de ajuste tipo RLHF o DPO (poco habituales en este tipo de politicas). Lo unico documentado es que se trata de un entrenamiento secuencial, que el checkpoint corresponde al paso 20.000 y que se conserva el estado de normalizacion. El autor indica explicitamente que no se incluyen optimizador ni RNG, y que el archivo preserva rutas y banderas de inicializacion para evitar la descarga de pesos iniciales no utilizados, sin modificar los tensores de parametros ni de normalizacion.

## Capacidades

- Generacion de acciones roboticas: el modelo es una politica de manipulacion, no un modelo de lenguaje; su salida esperada son comandos de accion para un robot.
- Ejecucion de la tarea "PutCab": segun la model card, el entrenamiento corresponde especificamente a esa tarea sobre la plataforma PRO6000.
- Prediccion por bloques de accion: por la familia ACT citada, se espera salida en forma de action chunks, aunque el tamano del bloque no esta documentado.
- Tool calling / function calling: no disponible; no aplica a este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no documentado.
- Capacidades multilingues: no disponible; no aplica.
- Capacidades especiales: no se documentan modos de pensamiento, vision, audio ni otras capacidades adicionales.

## Casos de uso

- Reproduccion de experimentos internos: el checkpoint permite repetir la inferencia del paso 20.000 con el mismo estado de normalizacion, lo que resulta util para comparar contra ejecuciones posteriores del mismo entrenamiento secuencial.
- Auditoria y trazabilidad: junto con `archive-provenance.json` y `source-config.json`, sirve para reconstruir las identidades de dataset, runtime y codigo fuente asociadas al experimento, aunque esos ficheros no se incluyen en la informacion proporcionada.
- Inicializacion para ajuste fino: al ser un checkpoint de ~51,7 M de parametros, puede emplearse como punto de partida para reentrenar la misma tarea con datos adicionales, siempre que se respete el alcance del experimento original.
- Despliegue en un brazo robotico para la tarea PutCab: es el uso previsto por el nombre y el pipeline declarado (robotics), condicionado a disponer del entorno, la camara y la configuracion de normalizacion originales.
- Comparacion de checkpoints dentro de una misma ejecucion: permite estudiar la evolucion del entrenamiento entre el paso 20.000 y otros pasos archivados bajo el mismo esquema de nombres.
- Docencia y practicas de robótica: como ejemplo de politica ACT pequena y desplegable en hardware modesto para ejercicios de imitation learning.
- Integracion en canalizaciones de evaluacion robotica: para medir tasa de exito en la tarea PutCab en simulacion o en banco de pruebas, sin que existan por ahora metricas publicadas de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de error de accion, ni comparaciones con otras politicas, y tampoco se adjuntan curvas de entrenamiento o de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en precision de 32 bits, el modelo ocupa aproximadamente 207 MB; en 16 bits, unos 103 MB; en 8 bits, unos 52 MB. Son calculos derivados del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, cualquier GPU con al menos 2 GB de VRAM deberia ser suficiente, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- GPU de consumo: si, el modelo cabe con holgura en practicamente cualquier GPU de consumo actual, e incluso en aceleradores de borde tipo Jetson Orin, siempre que el runtime de inferencia y el procesamiento de imagen asociado quepan en memoria.
- Opciones de despliegue: el repositorio solo contiene safetensors, cargables desde PyTorch. Los servidores orientados a modelos de lenguaje (vLLM, TGI, Ollama, llama.cpp) no son aplicables a una politica robotica de este tipo. No se documenta soporte para LeRobot ni para otros frameworks roboticos, aunque es habitual en esta familia de checkpoints.
- Latencia y throughput: no disponibles. Dependen del hardware, de la frecuencia de control del robot y del tamano del bloque de acciones, datos que no se han publicado.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El repositorio no incluye metricas, no referencia publicaciones y no declara identificadores de modelos alternativos. Cualquier comparacion con otras politicas de imitation learning (por ejemplo, otras variantes de ACT o Diffusion Policy) tendria que hacerse con los mismos datos, la misma tarea y el mismo protocolo de evaluacion, condiciones que no se documentan aqui.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Shiki42/ctr-archive-e263-step20000` | 51.685.006 | No disponible | No disponible | No disponible | Publico en HuggingFace |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no disponible: sin licencia declarada no puede asumirse permiso de uso comercial; en muchas jurisdicciones la ausencia de licencia implica reserva de derechos por defecto.
- Caracter archivistico: el autor indica que el archivo no acredita identidad con resultados de paper ni aprobacion de auditoria, por lo que no debe citarse como resultado validado.
- Defectos historicos declarados: la model card menciona que los defectos historicos y las restricciones de alcance del experimento siguen vigentes, sin detallarlos.
- Ausencia de evaluacion: no hay tasas de exito, matrices de confusion ni pruebas en entornos distintos al de entrenamiento.
- Riesgo de sobreajuste a la tarea y al montaje concretos: la politica esta entrenada para PutCab en la plataforma PRO6000, de modo que cambios de camara, iluminacion, posicion inicial de objetos o robot pueden degradar el comportamiento.
- Sensibilidad a la normalizacion: las politicas de imitacion dependen fuertemente de las estadisticas de normalizacion; usar el checkpoint sin su estado de normalizacion asociado puede producir acciones sin sentido.
- Riesgo de acumulacion de error: en imitation learning es habitual que pequenos errores se compongan a lo largo del episodio, especialmente fuera de la distribucion de estados vista en entrenamiento.
- Ficheros de procedencia no incluidos: se referencian `archive-provenance.json` y `source-config.json`, pero no forman parte de la informacion disponible, lo que impide verificar el origen exacto de los datos y del codigo.
- Sin informacion sobre sesgos, idiomas ni seguridad: al no ser un modelo de lenguaje, las consideraciones habituales de sesgo textual y alucinacion no aplican del mismo modo, pero no existe analisis de fallos fisicos ni de seguridad del robot.
- Uso en produccion: no recomendado sin una evaluacion previa en el entorno objetivo, con limites de parada, supervision humana y validacion de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/ctr-archive-e263-step20000
