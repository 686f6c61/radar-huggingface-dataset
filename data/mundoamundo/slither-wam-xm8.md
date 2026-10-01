# mundoamundo/slither-wam-xm8

## Resumen

slither-wam-xm8 es el repositorio público asociado a una continuación de entrenamiento del modelo de mundo "Slither", un modelo conjunto de vídeo y acción orientado a partidas del juego slither.io. Lo publica el usuario de Hugging Face mundoamundo (Seth Lupo) y no constituye un modelo listo para inferencia: el repositorio ocupa 0,0 GB, no declara licencia, idiomas ni pipeline, y registra 0 descargas y 0 "likes".

El objetivo del run es aplicar "Forward XM" (exploración sobre el ruido en flow matching) a la pérdida conjunta de vídeo y acción ya existente, partiendo del checkpoint original de Slither en el paso 1630, con SHA-256 `160390afaf0ef7b392886ae367f1d87439100c601f9837b334782af1444ab0dd`. El entrenamiento usa un optimizador AdamW nuevo, no una reanudación exacta del optimizador, y conserva arquitectura, resolución, horizonte de 32 acciones, revisión de datos y pesos de pérdida del modelo original, con el VAE y el codificador de texto congelados.

No se especifican arquitectura detallada, número de parámetros ni longitud de contexto, de modo que cualquier evaluación de idoneidad para producción queda pendiente de que el autor publique configuración, código y métricas en el repositorio prometido. El interés actual es de investigación: propone seleccionar el ruido (mínimo sobre ocho candidatos) durante el entrenamiento de flow matching para modelos de mundo vídeo-acción, sin cambiar la inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer conjunto de vídeo y acción con flow matching; VAE y codificador de texto congelados. Detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible (se mencionan ventanas de vídeo y un horizonte de 32 acciones, sin contexto en tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio público contiene 0,0 GB; los pesos se almacenan en un bucket aparte sin formato declarado) |

## Arquitectura y entrenamiento

La model card describe un modelo generativo conjunto de vídeo y acciones entrenado con flow matching. Se entrenan los transformers de acción y de vídeo, mientras que el VAE y el codificador de texto permanecen congelados. La propuesta técnica del run es "Forward XM": para cada ejemplo se mantienen fijos los timesteps de vídeo y acción, el contexto limpio, las máscaras y los objetivos, y se generan ocho candidatos de ruido conjuntos independientes. Se selecciona un único candidato por ejemplo usando la pérdida ponderada de vídeo más acción; la búsqueda se hace sin gradientes y después se reproduce el ruido elegido con gradientes. No se permite elegir ganadores de vídeo y acción por separado, ni un ganador por lote completo, ni optimizar el timestep. Es un cambio de entrenamiento, no de inferencia, y no produce ocho rollouts de denoising completos por actualización.

Los hiperparámetros declarados son: learning rate de acción 2e-5, learning rate de vídeo 5e-6, 50 actualizaciones de warmup, decaimiento coseno a lo largo de 1630 actualizaciones, batch global objetivo de 768 sobre seis GPU H200, semilla 43 (que altera el barajado del entrenamiento) y punto de revisión en el paso 400. La validación es flow matching K=1 ordinario con ruido fijo: cuatro ventanas por medio reservado (188 en total), manteniendo el ancla original de 47 ventanas. Se registran la ganancia de selección, los recuentos de ganadores, los cortes por nivel de ruido, la concordancia de la reproducción, ambos learning rates, la norma del gradiente, el throughput y la cobertura de muestras. Los datos provienen del conjunto de vídeos y acciones de gameplay de slither.io del propio autor, en estado de preparación. No se indica número de tokens de entrenamiento ni composición del dataset.

## Capacidades

- Modelado conjunto de vídeo y acción: el modelo predice acciones y fotogramas de vídeo de forma acoplada bajo un esquema de flow matching.
- Modelado de mundo condicionado por acciones en el dominio del juego slither.io, con horizonte de acción de 32 pasos.
- Generación de vídeo mediante denoising de flow matching; la model card menciona previsualizaciones de 50 pasos con semilla fija que comparan verdad, reconstrucción del VAE y generación ordinaria.
- Acondicionamiento por texto: existe un codificador de texto en la arquitectura, aunque permanece congelado y no se detalla su función ni los idiomas que cubre.
- Entrenamiento con selección de ruido tipo Forward XM (mínimo sobre ocho candidatos) y validación estándar K=1.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles; el único dominio documentado es vídeo de gameplay con acciones.

## Casos de uso

- Investigación en modelos de mundo vídeo-acción: reproducir el pipeline descrito (`wam_training/exploration.py` e `install_exploration.py`) para estudiar si la selección de ruido mejora la dinámica aprendida respecto al entrenamiento estándar. Es adecuado porque el run publica configuración, métricas y procedencia, pero requiere partir del checkpoint original de Slither.
- Evaluación de métodos de exploración en flow matching: comparar Forward XM con validación K=1 de ruido fijo usando las métricas registradas (ganancia de selección, recuentos de ganadores, concordancia de reproducción). El propio autor advierte que la pérdida de mínimo sobre ocho no es comparable directamente con la pérdida de entrenamiento anterior.
- Generación de datos sintéticos de gameplay para entrenar agentes de refuerzo: el modelo produce trayectorias de vídeo y acción coherentes en slither.io, aprovechables como entorno aumentado. La utilidad es hipotética hasta que existan pesos publicados y evaluación de calidad.
- Predicción de acciones a partir de contexto visual: servir como componente de un agente de juego que decide las siguientes 32 acciones dado el estado visual, siempre que el checkpoint final supere la validación ordinaria.
- Auditoría y reproducibilidad de checkpoints: el repositorio documenta SHA-256 del punto de partida, semilla, world size y política de almacenamiento en `/tmp`, lo que permite reproducir el run en un entorno equivalente (mismo world size y directorio de estado íntegro).
- Investigación afín en robótica y modelos de mundo 4D: el trabajo relacionado X-WAM plantea unificar ejecución de acciones robóticas y síntesis de mundo 4D; esta línea es el contexto académico del run, no una capacidad declarada del modelo.
- Preparación de un pipeline de RL posterior: existe un sucesor de RL en espera (no cancelado) con los trabajos CPU 4689114 y GPU 4653981 asignados, lo que sugiere uso futuro del checkpoint como inicialización de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enumera métricas que el run registra (`train_metrics.jsonl`, `validation.jsonl`, ganancia de selección, recuentos de ganadores, cortes por nivel de ruido, concordancia de reproducción, norma de gradiente, throughput y cobertura de muestras), pero no se proporciona ningún valor numérico de las mismas. Tampoco se ejecuta una rama K=1 con cómputo equivalente, por lo que no pueden hacerse afirmaciones causales sobre la mejora atribuible a Forward XM.

## Requisitos de hardware

- Entrenamiento declarado: seis GPU H200, con batch global objetivo de 768 y nodo de trabajo `pax008`.
- VRAM estimada para inferencia: no disponible; no se publican pesos ni configuración que permitan calcularla.
- GPU recomendadas para inferencia: no disponible; la única referencia es el hardware de entrenamiento (H200).
- Encaje en GPU de consumo: no se puede determinar con la información disponible.
- Almacenamiento: medios, cachés y estados del modelo en `/tmp` del nodo, nunca en NFS; estado reanudable completo y mejores pesos en un bucket aparte con punteros verificados.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no se documenta ninguna; la model card afirma que no se requieren cambios en inferencia respecto al modelo base.
- Latencia y throughput: no disponible; el throughput se registra durante el entrenamiento, pero no se publican valores.
- Reanudación: exige el mismo world size y un directorio de estado descargado e íntegro; el contador de pasos del nuevo run arranca en cero aunque el paso padre sea 1630.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de forma directa. Como referencias internas del propio run cabe citar la validación ordinaria K=1 con ruido fijo (línea base declarada) y el checkpoint original de Slither en el paso 1630, que se conserva como candidato a "best". En el entorno académico se menciona X-WAM (arXiv 2604.26694) como trabajo afín sobre modelado unificado de acción y mundo 4D, pero no se aportan datos comparativos de parámetros, contexto, rendimiento ni licencia.

## Limitaciones y advertencias

- El repositorio público no contiene pesos (0,0 GB): hoy no es desplegable ni evaluable en inferencia.
- Licencia no declarada, lo que impide determinar si se permite uso comercial y bajo qué condiciones.
- No hay idiomas, pipeline ni formato de pesos declarados, y tampoco ficha de uso previsto.
- No se publican resultados de benchmarks ni métricas con valores; cualquier afirmación de calidad sería especulativa.
- La pérdida de entrenamiento (mínimo sobre ocho candidatos) no es comparable con la pérdida de entrenamiento previa; comparar directamente ambas cifras induce a error.
- No existe una rama K=1 con cómputo equivalente, por lo que la mejora atribuida a Forward XM no está aislada de forma causal.
- El punto de revisión del paso 400 se declara explícitamente como revisión, no como éxito automático.
- Las predicciones más nítidas no implican mejor dinámica; la propia model card advierte que una predicción errónea más definida no establece mejores dinámicas, y pide evaluar fronteras de la serpiente y movimiento coherentes.
- La reanudación es frágil: requiere el mismo world size y un directorio de estado íntegro, y los datos deben residir en `/tmp` del nodo, no en NFS.
- El sucesor de RL está en espera y no debe reiniciarse automáticamente al terminar el preentrenamiento; los trabajos CPU 4689114 y GPU 4653981 siguen asignados.
- Riesgo de alucinación y sesgos: no evaluables con la información disponible, al no existir pesos ni datos de validación publicados.
- La fecha de creación del repositorio indicada en los metadatos es 2026-10-01, con última actualización el 2026-10-01, sin historial adicional de versiones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mundoamundo/slither-wam-xm8
- Bucket de checkpoints: https://huggingface.co/mundoamundo/slither-wam-xm8-checkpoints
- Dataset de vídeos y acciones: https://huggingface.co/datasets/mundoamundo/slither-wam-video-actions
- Perfil del autor: https://huggingface.co/mundoamundo
- Paper de Forward XM (secciones 3-4 y apéndice C): https://explorative-modeling.github.io/static/pdfs/paper.pdf
- Trabajo relacionado X-WAM, "Unified 4D World Action Modeling from Video Priors": https://arxiv.org/abs/2604.26694
- Juego de referencia: http://slither.io/
