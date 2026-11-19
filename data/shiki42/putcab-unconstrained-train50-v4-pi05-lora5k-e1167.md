# Shiki42/PutCab-Unconstrained-Train50-V4-PI05-LoRA5K-E1167

## Resumen

PutCab-Unconstrained-Train50-V4-PI05-LoRA5K-E1167 es un checkpoint intermedio de un ajuste fino mediante LoRA sobre π0.5, el modelo de politica robotica generalista desarrollado por Physical Intelligence y liberado a traves del ecosistema OpenPI. Lo publica el usuario Shiki42 como parte de una ablacion denominada E1167, orientada a la tarea de manipulacion "PutCab" (colocar un objeto en un armario) dentro del benchmark de simulacion RoboTwin. No es un modelo de lenguaje: es una politica visuomotora que asigna acciones de robot a partir de observaciones visuales y del estado del efector.

El checkpoint corresponde al paso 5000 de un entrenamiento de 10000 actualizaciones con receta LoRA en bf16, batch global de 16 y semilla 87431, con IdleMask activado. El autor indica explicitamente que este modelo no ha sido evaluado y que el resultado reportado para la ejecucion E1167 corresponde al checkpoint final de 10000 pasos, publicado por separado. Por tanto, este artefacto debe interpretarse como material de estudio de dinamica de entrenamiento y de ablaciones, no como un modelo listo para produccion.

Su relevancia es acotada pero concreta: sirve para reproducir curvas de aprendizaje en politicas π0.5 ajustadas con LoRA sobre datasets pequenos (50 episodios), para comparar recetas de enmascarado (IdleMask) y para inspeccionar el efecto del numero de pasos en tareas de manipulacion bimanual. El repositorio ocupa 6,3 GB e incluye pesos, assets de normalizacion y metadatos del checkpoint, pero no el estado del optimizador ni del cargador de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (OpenPI, implementacion JAX); ajuste fino mediante LoRA sobre el modelo base |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el entrenamiento se realizo en bf16 |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el repositorio contiene un directorio `params/` con los pesos y `assets/` con las normalizaciones, sin mencion explicita del formato de serializacion |

## Arquitectura y entrenamiento

El modelo parte de π0.5 en su implementacion OpenPI sobre JAX y se adapta mediante LoRA, es decir, se congelan los pesos del modelo base y se entrenan matrices de bajo rango. El entrenamiento usa precision bf16, batch global de 16, 10000 actualizaciones y semilla 87431; este checkpoint concreto es el paso 5000. Se activa IdleMask, la misma configuracion que en la ejecucion E1025, lo que sugiere un diseno de ablacion controlada entre ejecuciones.

Los datos provienen del dataset `Shiki42/PutCab-Unconstrained-Train50-V4` en la revision `6c083942913d887dab16ad2c3faee15aeddfcb80`, con 50 episodios de entrenamiento de la tarea PutCab en RoboTwin. Las normalizaciones se recalcularon como cuantiles globales exactos sobre este dataset y se almacenan en `assets/`. No se documentan en la informacion disponible el numero de tokens, la composicion completa del dataset ni si hubo etapas de RLHF o DPO, algo esperable en este tipo de politicas. Tampoco se describe ninguna innovacion tecnica adicional mas alla del uso de LoRA e IdleMask.

## Capacidades

- Generacion de acciones de robot para manipulacion visuomotora en la tarea PutCab dentro de RoboTwin.
- Control a partir de observaciones visuales y estado del efector, propio de una politica π0.5.
- Ajuste de bajo rango (LoRA) sobre el modelo base, lo que permite iterar con requisitos de computo reducidos frente a un ajuste completo.
- Enmascarado de acciones inactivas mediante IdleMask, orientado a estabilizar el entrenamiento en tramos sin movimiento util.
- Capacidad de servir como punto de comparacion intermedio en estudios de dinamica de entrenamiento (paso 5000 frente a paso 10000).
- No se documentan capacidades de tool calling, razonamiento multi-paso, multilingueismo, vision general, audio ni modo de pensamiento.

## Casos de uso

- Reproduccion de curvas de aprendizaje: cargar este checkpoint y el de paso 10000 de la misma ejecucion para medir la evolucion de la perdida y del exito en PutCab entre ambos puntos.
- Ablacion de recetas de enmascarado: comparar E1167 (IdleMask activo) con ejecuciones sin IdleMask usando el mismo dataset y semilla, aislando el efecto de la mascara.
- Estudio del ajuste LoRA en regimen de pocos datos: analizar como se comporta un adaptador de bajo rango entrenado sobre solo 50 episodios y que pasos producen sobreajuste.
- Validacion de pipelines OpenPI en JAX: usar el checkpoint como entrada de prueba para verificar la carga de `params/`, `assets/` y la integridad mediante `SHA256SUMS` antes de lanzar experimentos mayores.
- Docencia e investigacion en robotica: servir de ejemplo reproducible de un ajuste fino de una politica generalista con licencia permisiva para cursos y talleres.
- Base para experimentos de continuacion: reanudar el entrenamiento o aplicar tecnicas de merging de adaptadores, teniendo en cuenta que el estado del optimizador no esta incluido.
- Referencia negativa controlada: al no estar evaluado, puede usarse para contrastar la hipotesis de que los checkpoints intermedios no son desplegables sin una evaluacion especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este checkpoint no fue evaluado y que el resultado reportado para la ejecucion E1167 corresponde al checkpoint de paso 10000, no a este.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio pesa 6,3 GB, lo que da una cota inferior orientativa para cargar los pesos, a la que hay que sumar el modelo base π0.5 y los buffers de inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada; por el ecosistema OpenPI/JAX se orienta a GPUs de datacenter, pero no se confirma ningun modelo concreto.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: el autor referencia OpenPI en JAX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PutCab-Unconstrained-Train50-V4-PI05-LoRA5K-E1167 (este) | no disponible | no disponible | no evaluado | Apache 2.0 | Hugging Face |
| PutCab-Unconstrained-Train50-V4-PI05-LoRA10K-E1167 | no disponible | no disponible | resultado E1167 reportado con este paso | Apache 2.0 | Hugging Face |
| π0.5 base (OpenPI) | no disponible | no disponible | no disponible en la informacion | no disponible en la informacion | OpenPI |

La comparacion se limita a variantes de la misma ejecucion y al modelo base; no se dispone de datos de rendimiento ni de especificaciones numericas para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Checkpoint intermedio sin evaluar: el autor declara que el resultado de la ejecucion E1167 usa el paso 10000, por lo que no hay evidencia de rendimiento para este paso 5000.
- Especifico de tarea y simulador: entrenado para PutCab en RoboTwin con 50 episodios; no se documenta transferencia a robots reales ni a otras tareas.
- Dataset muy pequeno: 50 episodios incrementan el riesgo de sobreajuste y de baja generalizacion ante variaciones de iluminacion, posicion de objetos o camara.
- Sin estado de optimizador ni de cargador de datos: no es posible reanudar el entrenamiento de forma exacta desde este checkpoint.
- Sin informacion sobre sesgos: no se documentan sesgos conocidos, pero al ser una politica visual hereda los sesgos de distribucion del dataset de entrenamiento.
- Riesgo de fallo silencioso: al no haber evaluacion, no se puede descartar que el adaptador produzca acciones degeneradas o saturadas.
- Licencia Apache 2.0 permisiva para uso comercial, pero sujeta a las condiciones del modelo base π0.5 y de los datos de origen, que no se detallan en la informacion disponible.
- Ausencia de soporte linguistico: no debe emplearse como modelo de texto ni de proposito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiki42/PutCab-Unconstrained-Train50-V4-PI05-LoRA5K-E1167
- Checkpoint final de la misma ejecucion: https://huggingface.co/Shiki42/PutCab-Unconstrained-Train50-V4-PI05-LoRA10K-E1167
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-Unconstrained-Train50-V4
- Revision del dataset usada: `6c083942913d887dab16ad2c3faee15aeddfcb80`
