# azukiq/microduck-titan-v2

## Resumen

`azukiq/microduck-titan-v2` es una política de control neuronal (control policy) para el entorno de robótica simulado MicroDuck Arena, concretamente para la modalidad Tug of War (tira y afloja). No es un modelo de lenguaje: se trata de un agente entrenado por refuerzo que mapea observaciones de 61 dimensiones a 14 acciones articulares, pensado para ejecutarse en inferencia determinista a 50 Hz mediante ONNX. Lo publica el usuario `azukiq` bajo la librería `microduck` y el pipeline `robotics`.

El modelo deriva de una versión anterior (`titan-v1`) y se ha refinado mediante self-play adicional y fine-tuning orientado a la competición Cup. Su interés es acotado pero claro: demuestra un flujo completo de entrenamiento por refuerzo hasta despliegue ligero en ONNX, con normalización de observaciones incluida y una única política que cubre todo el roster de oponentes, lo que simplifica la integración en el simulador.

La información publicada es muy escasa: el repositorio ocupa 0,0 GB, no declara licencia, idiomas ni resultados de benchmarks, y no tiene descargas ni likes en el momento de la consulta. Por tanto, esta ficha se limita a lo que la model card y los metadatos permiten afirmar, marcando como no disponible todo lo demás.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control neuronal para robótica; no se especifica la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; usa observaciones de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (inferencia determinista a 50 Hz) |

## Arquitectura y entrenamiento

La model card describe una política neuronal que consume observaciones estandarizadas de 61 dimensiones y emite 14 acciones articulares, con normalización de observaciones integrada en el propio modelo. La inferencia es determinista y está pensada para ejecutarse a 50 Hz en formato ONNX, lo que encaja con un bucle de control en tiempo real dentro del simulador MicroDuck Arena. No se detalla la topología interna (número de capas, anchura, tipo de activaciones) ni el número de parámetros.

El entrenamiento se basa en aprendizaje por refuerzo: la versión v2 se desarrolla a partir de `titan-v1` mediante self-play adicional y fine-tuning específico para la competición Cup. Se indica que una única política cubre todos los oponentes del roster, y que se evaluó localmente contra dicho roster usando las reglas oficiales de la Arena. No se especifican el número de pasos de entrenamiento, la composición de escenarios, ni si se emplearon técnicas como curriculum learning, reward shaping o population-based training.

## Capacidades

- Control motor en un entorno simulado: produce 14 acciones articulares a partir de observaciones de 61 dimensiones.
- Inferencia determinista a 50 Hz en ONNX, adecuada para bucles de control en tiempo real.
- Normalización de observaciones incluida en el modelo, lo que reduce el preprocesado externo.
- Política única para todos los oponentes del roster de la Cup, sin necesidad de seleccionar variantes por rival.
- Entrenada mediante self-play, lo que implica comportamiento adaptativo dentro de la dinámica Tug of War.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, visión ni audio.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Evaluación de políticas en MicroDuck Arena: el modelo se carga en ONNX y se ejecuta a 50 Hz contra el roster oficial para medir su rendimiento en Tug of War bajo reglas de la Cup.
- Baseline para investigación en RL robótico: sirve como referencia reproducible de una política entrenada por self-play con observaciones estandarizadas y acciones articulares fijas.
- Comparación de algoritmos de entrenamiento: al derivar de `titan-v1`, permite analizar el efecto del self-play adicional y del fine-tuning sobre una política previa.
- Despliegue ligero en simulación: el formato ONNX y el tamaño reducido del repositorio facilitan la integración en pipelines de simulación sin dependencias pesadas.
- Generación de datos de comportamiento: la política puede usarse para producir trayectorias de observación-acción en el simulador, útiles para entrenar modelos auxiliares o para análisis de robustez.
- Pruebas de integración de la librería `microduck`: sirve como artefacto de ejemplo para validar el cargador de políticas y el bucle de control de dicha librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que el modelo fue evaluado localmente contra el roster de la Cup usando las reglas oficiales de la Arena, sin aportar métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y se distribuye en ONNX, por lo que previsiblemente es muy ligero, pero no se confirma el tamaño real de los pesos.
- GPU recomendadas: no disponible. Por el formato ONNX y la frecuencia de 50 Hz, es plausible su ejecución en CPU, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de memoria ni de latencia.
- Opciones de despliegue: ONNX Runtime es el runtime implícito por el formato; la librería `microduck` actúa como cargador. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; solo se declara el objetivo de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones | Acciones | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-titan-v2 | Política RL para MicroDuck Arena | 61 dims | 14 articulaciones | ONNX | no disponible | Hugging Face |
| microduck-titan-v1 | Política RL predecesora | no disponible | no disponible | no disponible | no disponible | Referenciada en la model card |
| Otras políticas para MicroDuck Arena | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores para la misma tarea.

## Limitaciones y advertencias

- Información muy escasa: no se declaran licencia, idiomas, arquitectura interna ni número de parámetros, lo que impide evaluar su idoneidad para uso comercial.
- La ausencia de licencia explícita implica que no se puede asumir permiso de uso, modificación o redistribución.
- El modelo está especializado exclusivamente en Tug of War dentro de MicroDuck Arena; no es transferible a otras tareas sin reentrenamiento.
- No hay métricas públicas de rendimiento: la afirmación de evaluación local contra el roster no es verificable de forma independiente.
- Riesgo de sobreajuste al roster de la Cup: al entrenarse y evaluarse contra los mismos oponentes, el rendimiento frente a políticas nuevas es incierto.
- Sin datos sobre sesgos, robustez ante perturbaciones o comportamiento fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria.
- No apto para tareas de lenguaje, visión, audio ni agentes conversacionales.

## Enlaces

- Hugging Face: https://huggingface.co/azukiq/microduck-titan-v2
- Repositorio de la librería `microduck`: no disponible
- Paper o blog del modelo: no disponible
- Demo o espacio interactivo: no disponible
