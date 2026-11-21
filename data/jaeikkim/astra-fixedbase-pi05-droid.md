# jaeikkim/astra-fixedbase-pi05-droid

## Resumen

Astra-fixedbase-pi05-droid es un checkpoint de robótica publicado en Hugging Face por el usuario jaeikkim, etiquetado como parte de la familia "astra" y derivado, por su nombre, del modelo pi0.5 de Physical Intelligence ajustado sobre el conjunto de datos DROID. El repositorio se describe como un checkpoint "resumable-training" y "action-only", lo que sugiere que contiene únicamente los pesos necesarios para predecir acciones motoras y que está pensado para reanudar un proceso de entrenamiento ya iniciado, no como un modelo de propósito general.

El modelo se distribuye bajo la pipeline `robotics` de Hugging Face, con un tamaño de repositorio de 29,9 GB, lo que es coherente con un modelo de política visomotora de escala media-grande (del orden de miles de millones de parámetros en precisión completa o bf16). Soporta inglés y coreano según sus etiquetas, y el acceso está restringido: es necesario aceptar condiciones en la plataforma antes de descargarlo.

La relevancia de este checkpoint es acotada pero específica: sirve como punto de partida reproducible para investigadores que trabajan en manipulación robótica con el dataset DROID y quieren continuar el entrenamiento o evaluar políticas de acción entrenadas sobre él. No obstante, la información pública es muy escasa (cero descargas, cero likes, sin model card detallada en la información disponible), por lo que muchas especificaciones deben tratarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada presumiblemente de pi0.5, sin confirmar en la información) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 29,9 GB, presumiblemente safetensors; sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura en la información proporcionada. El nombre del repositorio sugiere una base pi0.5 (modelo visión-lenguaje-acción de Physical Intelligence) ajustada sobre DROID, un dataset de manipulación robótica a gran escala recogido con el robot Franka. Las etiquetas "action-only" y "resumable-training" indican que el checkpoint está orientado exclusivamente a la predicción de acciones y que conserva el estado necesario para reanudar el entrenamiento (optimizador, scheduler u otros artefactos), aunque no se detalla qué componentes incluye exactamente.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por imitación. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, flow matching para acciones) sería especulativa y no se incluye aquí.

## Capacidades

- Predicción de acciones motoras para control robótico (etiqueta "action-only").
- Reanudación de entrenamiento desde checkpoint ("resumable-training").
- Soporte declarado de inglés y coreano en las etiquetas del repositorio.
- Integración con el ecosistema de Hugging Face para robótica (pipeline `robotics`).
- No se documentan capacidades de generación de texto general, razonamiento, código, matemáticas, visión descriptiva, tool calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Reanudación de entrenamiento en manipulación robótica: el checkpoint está diseñado explícitamente para continuar un proceso de entrenamiento previo, lo que permite a un equipo retomar el ajuste sobre DROID sin recomputar desde cero.
- Evaluación de políticas visomotoras sobre DROID: sirve como referencia para comparar el rendimiento de una política ajustada sobre este dataset frente a otros checkpoints de la misma familia.
- Investigación en imitación de bajo nivel: al ser "action-only", puede emplearse para estudiar la calidad de las trayectorias de acción generadas en tareas de pick-and-place y manipulación de objetos.
- Fine-tuning sobre dominios específicos: un equipo puede partir de este checkpoint para adaptar la política a un robot o entorno propio, reduciendo el coste de entrenamiento inicial.
- Reproducibilidad de experimentos: al estar publicado como checkpoint resumible, facilita la reproducción de resultados por parte de terceros que trabajen con la misma base.
- Desarrollo de pipelines de robótica en Hugging Face: se integra en flujos que usan la pipeline `robotics` para cargar y ejecutar políticas entrenadas.
- Experimentación multilingüe en instrucciones: las etiquetas en inglés y coreano sugieren posible uso con instrucciones en esos idiomas, aunque no se detalla el mecanismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (29,9 GB) sugiere que la carga en bf16 requiere del orden de 30 GB o más de memoria, aunque no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, GPUs con 40-80 GB (A100, H100) son las candidatas naturales para carga completa; una RTX 4090 (24 GB) probablemente no sea suficiente sin cuantización o sharding, aunque esto no está confirmado.
- ¿Cabe en GPU de consumo? No disponible con certeza; probablemente no en configuración completa.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de robótica, el despliegue típico sería mediante el stack de robótica correspondiente).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría (políticas visomotoras para manipulación robótica).

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar las condiciones antes de cualquier despliegue en producción.
- Documentación muy escasa: sin model card detallada, sin benchmarks y sin especificaciones de arquitectura confirmadas; el uso en producción exige validación propia.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Naturaleza "action-only": no debe esperarse que el modelo genere texto, razonamiento general ni código; está orientado a control robótico.
- Riesgo de sobreajuste al dataset DROID: al estar ajustado sobre un conjunto concreto de robots y entornos, su generalización a otros hardware o dominios no está documentada.
- Idiomas limitados a inglés y coreano según las etiquetas; no se garantiza soporte de castellano.
- Riesgo de alucinación y sesgos: no evaluable sin documentación ni benchmarks; en robótica, los fallos se traducen en acciones físicas incorrectas, con el riesgo asociado.
- Fecha de creación futura en los metadatos (2026-11-21): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/jaeikkim/astra-fixedbase-pi05-droid
