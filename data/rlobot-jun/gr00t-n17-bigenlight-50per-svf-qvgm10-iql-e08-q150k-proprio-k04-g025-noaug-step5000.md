# RLobot-jun/gr00t-n17-bigenlight-50per-svf-qvgm10-iql-e08-q150k-proprio-k04-g025-noaug-step5000

## Resumen

Este repositorio contiene pesos de inferencia para un actor robótico basado en la familia GR00T N1.7 (según la nomenclatura del identificador y del modelo base declarado), publicado por el usuario RLobot-jun. No es un modelo de lenguaje ni una política completa desde cero: es un artefacto de adaptación formado por un adaptador LoRA de actor, una Q de entorno de 10 cabezas y un crítico interno, diseñado para aplicarse sobre un actor base ya entrenado por imitación (BC). El modelo base declarado es RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000 en la revisión 1704897ac6a2a93c1d1fd806925b9237977ed8c5.

El artefacto corresponde a una iteración de "SVF" (kappa 0.4, g 0.25, c 0.64, según la nomenclatura del autor) tras 5000 pasos de entrenamiento de dicho SVF, construida sobre una Q de entorno congelada procedente de un entrenamiento IQL con expectile 0.8 y 150 000 actualizaciones. Incorpora propriocepción explícita y se entrenó sin aumento de datos de imagen, estado ni acción, aunque conserva el ruido intrínseco de flow/SDE.

Su relevancia práctica es limitada: 0 descargas y 0 likes en el momento de redactar esta ficha, 0.1 GB de repositorio, licencia no declarada y sin resultados de benchmarks publicados. Está orientado a investigación en aprendizaje por refuerzo offline y ajuste fino de políticas de manipulación, no a un uso de producción directo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Actor de política con flow-matching (base GR00T N1.7) más adaptador LoRA (rank 16, alpha 32); Q de entorno con 10 cabezas MLP independientes y agregación por media; crítico interno con dos cabezas FeatureCritic. El detalle completo se remite a adapter/adapter_config.json |
| Parámetros totales | no disponible (tamaño del repositorio: 0.1 GB, correspondiente únicamente a los adaptadores) |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible en el sentido de contexto de lenguaje; horizonte de acción limpio de 16 pasos, dimensión real de acción 7, forma con padding [40, 132] |
| Tipos de cuantización | no disponible; los pesos se distribuyen en el formato original safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter/actor_lora.safetensors, adapter/env_q.safetensors, adapter/inner_critic.safetensors) |

## Arquitectura y entrenamiento

El actor es una política de flow-matching heredada del BC base (GR00T N1.7), sobre la que se aplica un adaptador LoRA de rango 16 y alpha 32. Los hiperparámetros de SVF declarados son batch 32, flow 4, candidates 8, kappa 0.4, g 0.25 y c 0.64, con cachés BC50 fijas y sin aumento de datos de imagen, estado ni acción. El autor insiste en que el adaptador debe aplicarse sobre el BC exacto y nunca sobre un actor ya actualizado por SVF, y que la igualdad actor/base congelado se comprueba tras la conversión de dtype durante el entrenamiento. No se incluyen objetivos BC, VLM, de referencia, optimizador ni EMA, ni se trata de una carpeta nativa de servidor BC ni de un checkpoint reanudable.

La Q de entorno congelada se almacena como state dict de un envoltorio FrozenActionIQLQ (prefijo `q.`) y su ActionConditionedQEnsemble debe reconstruirse a partir de adapter_config.json, no con la antigua clase twin-Q. Sus dimensiones ocultas son [512, 512, 256] con activación GELU, inyección compacta repetida de la acción y sin LayerNorm; la entrada tiene 2212 características. La agregación sobre las 10 cabezas se hace por media y el entrenamiento IQL de origen usó expectile 0.8 con 150 000 actualizaciones, partiendo del paso 150 000. El crítico interno consta de dos cabezas FeatureCritic con dimensiones ocultas [512, 512, 512, 512] y dimensión temporal de Fourier 16; la pérdida interna usa el mínimo mientras que la guía del actor usa el gradiente medio interno. La composición exacta del dataset de entrenamiento y el número de tokens o transiciones no están disponibles.

## Capacidades

- Generación de acciones motoras: produce fragmentos (chunks) de acción de horizonte 16 con dimensión real 7, con padding hasta la forma [40, 132].
- Condicionamiento por propriocepción: la entrada incluye 2212 características, con proprio explícito activado.
- Aprendizaje por refuerzo offline: emplea una Q de entorno con 10 cabezas y un crítico interno de 2 cabezas para guiar la mejora del actor sobre el BC.
- No hay evidencia en la información proporcionada de generación de texto, razonamiento simbólico, matemáticas, código, visión general, audio ni tool calling.
- No se documenta soporte de function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- Capacidad diferencial declarada: no es la variante twin-Q IQL ni el crítico distribucional DEAS; la Q de entorno usa la media de 10 cabezas y el valor interno usa 2 cabezas.

## Casos de uso

- Reproducción de investigación en RL offline: el artefacto permite reconstruir el pipeline SVF/IQL del autor aplicando el LoRA sobre el BC exacto y comparando la Q de 10 cabezas con la variante twin-Q previa.
- Ajuste fino de políticas de manipulación: partiendo del BC base en la revisión fijada, el adaptador añade una mejora guiada por crítico sin reentrenar el backbone completo, lo que reduce el coste de cómputo frente a un ajuste total.
- Estudios de ablación sobre hiperparámetros: los identificadores k04-g025, e08 y q150k permiten aislar el efecto de kappa, g, el expectile y el número de actualizaciones IQL en el rendimiento del actor.
- Evaluación de arquitecturas de crítico: la comparación entre la Q de 10 cabezas con agregación por media y los críticos alternativos del mismo autor sirve como banco de pruebas para investigar varianza y sesgo en estimación de valor.
- Pre-despliegue en simulación: puede cargarse en un entorno simulado compatible con GR00T N1.7 para validar trayectorias de horizonte 16 antes de plantear cualquier traslado a hardware real, teniendo en cuenta que la paridad en robot real no ha sido probada.
- Docencia y divulgación técnica: el repositorio ilustra un flujo de trabajo LoRA más crítico congelado sobre una política VLA, útil como material de referencia en cursos de aprendizaje por refuerzo aplicado a robótica.
- Integración en tuberías internas de experimentación: al ser pesos de solo inferencia y de 0.1 GB, se integran con facilidad en almacenes de artefactos para comparar versiones de adaptadores entre pasos de SVF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del artefacto: 0.1 GB, correspondiente a los tres ficheros safetensors de adaptadores más los ficheros de normalización y procesador.
- VRAM estimada: no disponible para el conjunto completo, ya que la inferencia exige cargar el modelo base GR00T N1.7, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada; depende por completo del modelo base, no incluido en este repositorio.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La carga debe hacerse con código propio compatible con la rama `q-vgm-critic` del repositorio gr00t-bigenlight, cuyo acceso es privado según el autor.
- Latencia y throughput: no disponible.
- Restricción operativa: hay que respetar la revisión exacta del modelo base (1704897ac6a2a93c1d1fd806925b9237977ed8c5) y evitar cargar env_q.safetensors en la clase twin-Q antigua.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto u horizonte de acción | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (adaptadores SVF, paso 5000) | no disponible (0.1 GB de adaptadores) | horizonte de acción 16, dimensión 7 | no disponible | público, 0 descargas, 0 likes |
| RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000 (modelo base) | no disponible | no disponible | no disponible | público |
| Otras políticas VLA de la misma categoría (OpenVLA, π0, GR00T N1.7 original) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

La información proporcionada no incluye métricas comparables, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no debe asumirse uso comercial libre; es necesario contactar con el autor antes de cualquier explotación comercial.
- Dependencia estricta del modelo base: el adaptador solo es válido sobre el BC en la revisión 1704897ac6a2a93c1d1fd806925b9237977ed8c5; aplicarlo sobre un actor ya actualizado por SVF produce resultados incorrectos.
- Código fuente no incluido: se distribuye aparte y el repositorio de referencia requiere acceso; sin él no es posible reconstruir correctamente el envoltorio de la Q de entorno.
- Compatibilidad de carga: cargar env_q.safetensors en la clase twin-Q antigua es un error explícito según el autor.
- Paridad con robot real no probada: la comprobación se limita a la igualdad actor/base tras la conversión de dtype; no hay validación en hardware físico.
- Solo pesos de inferencia: no incluye objetivos BC, VLM, de referencia, optimizador ni EMA, por lo que no sirve para reanudar entrenamiento.
- Sin aumento de datos (noaug): reduce la variedad efectiva vista durante el ajuste, con riesgo de sobreajuste a la distribución de las cachés BC50, aunque persiste el ruido de flow/SDE.
- Riesgo de acciones fuera de distribución: al ser una política motora, los fallos no se manifiestan como alucinaciones textuales sino como trayectorias erráticas o inseguras; se requiere supervisión en cualquier prueba con hardware.
- Idiomas y cobertura lingüística: no disponibles; no hay evidencia de condicionamiento por lenguaje natural en la documentación.
- Validación comunitaria nula: 0 descargas y 0 likes, sin resultados de benchmarks publicados que permitan contrastar el rendimiento declarado.
- Fecha de publicación registrada como 2026-09-21, posterior a la fecha típica de consulta; conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-svf-qvgm10-iql-e08-q150k-proprio-k04-g025-noaug-step5000
- Modelo base: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000
- Código de referencia (rama `q-vgm-critic`, acceso requerido): https://github.com/jun981015/gr00t-bigenlight/tree/q-vgm-critic
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de ayuda de cuentas de Google, YouTube y Chrome, sin relación con el artefacto.
