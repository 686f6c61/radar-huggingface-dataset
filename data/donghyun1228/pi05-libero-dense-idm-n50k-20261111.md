# Donghyun1228/pi05-libero-dense-idm-n50k-20261111

## Resumen

Donghyun1228/pi05-libero-dense-idm-n50k-20261111 es un checkpoint de investigación publicado en Hugging Face por el usuario Donghyun1228. Se trata de un ajuste fino del modelo pi05_libero (una variante de π0.5, el modelo visión-lenguaje-acción de Physical Intelligence orientado a control robótico) sobre tareas del benchmark LIBERO, incorporando una técnica denominada "dense IDM" (inverse dynamics model con observaciones densas) que utiliza 10 fotogramas futuros como vistas de imagen del IDM. El nombre del repositorio indica una sonda de 50.000 pasos ("n50k") con fecha 2026-11-11.

El modelo resuelve el problema de adaptación de políticas visión-lenguaje-acción a tareas de manipulación robótica mediante aprendizaje por imitación (IL) combinado con un modelo de dinámica inversa denso. Según la model card, el entrenamiento parte de pi05_libero público, remide LAPE, construye un prior k10 y optimiza dos objetivos: View-L (λ 5e-3) y Yaw30 (λ 5e-2), con el LLM congelado, learning rate 5e-5 y 10.000 pasos.

La relevancia del checkpoint es acotada: es un artefacto de experimentación reproducible (incluye SHA256SUMS y remite a un repositorio de código), no un modelo de propósito general. No se documentan arquitectura completa, parámetros, contexto ni licencia, y el pipeline no está declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de pi05_libero, familia π0.5 visión-lenguaje-acción) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 2,6 GB; se menciona SHA256SUMS para verificación de ficheros) |

## Arquitectura y entrenamiento

El checkpoint se construye sobre pi05_libero, la variante pública de π0.5 adaptada al benchmark LIBERO. La model card describe el procedimiento como "IL + dense IDM": aprendizaje por imitación combinado con un modelo de dinámica inversa que recibe 10 fotogramas futuros como vistas de imagen del IDM. A partir de ahí se remide LAPE y se construye un prior k10. El ajuste optimiza dos objetivos, View-L (λ 5e-3) y Yaw30 (λ 5e-2), manteniendo el LLM congelado, con learning rate 5e-5 y 10.000 pasos, siguiendo la misma receta que las ejecuciones principales de LAPE del autor.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO. Tampoco se detalla la arquitectura interna (transformer, MoE u otra), el número de parámetros ni innovaciones adicionales como decodificación especulativa o atención lineal. La evaluación se realizó en H100 con EGL, semilla de entorno 7 y 2.000 episodios. No se incluyen train_state ni registros de wandb.

## Capacidades

- Control robótico por imitación en tareas del benchmark LIBERO, con dos objetivos evaluados: view_large y yaw30.
- Procesamiento de observaciones visuales densas: el IDM consume 10 fotogramas futuros como vistas de imagen.
- Adaptación de una política visión-lenguaje-acción preentrenada (pi05_libero) mediante ajuste fino con LLM congelado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el modelo es una política de control, no un agente conversacional.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): visión como entrada para el control; no se documentan otras.

## Casos de uso

- Evaluación reproducible de políticas VLA en LIBERO: el checkpoint permite replicar los resultados declarados (view_large 51,00 %, yaw30 92,55 %) con semilla de entorno 7 y 2.000 episodios en H100 con EGL.
- Investigación en modelos de dinámica inversa densa: sirve como punto de partida para estudiar el efecto de usar 10 fotogramas futuros como vistas del IDM en el aprendizaje por imitación.
- Ablación de objetivos auxiliares: los pesos λ 5e-3 (View-L) y λ 5e-2 (Yaw30) permiten comparar configuraciones de regularización en tareas de manipulación.
- Ajuste fino con LLM congelado: útil para equipos con presupuesto limitado de cómputo que quieran adaptar pi05_libero sin reentrenar el backbone lingüístico.
- Reproducción de recetas LAPE: el checkpoint sigue la misma receta que las ejecuciones principales de LAPE del autor, lo que facilita comparaciones controladas.
- Verificación de integridad de artefactos: el fichero SHA256SUMS permite validar cada peso antes de desplegarlo en pipelines de evaluación automatizada.

## Benchmarks y rendimiento

| Tarea | Resultado |
|---|---|
| view_large | 51,00 % |
| yaw30 | 92,55 % |

Evaluación realizada en H100 con EGL, semilla de entorno 7 y 2.000 episodios. No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales de LIBERO.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 2,6 GB, lo que sugiere que los pesos caben en GPUs de consumo, pero no se confirma el tamaño del modelo ni la cuantización.
- GPU recomendadas: H100 para la evaluación declarada (con EGL). No se documentan otras GPU.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo (2,6 GB) es compatible con GPUs de 8-12 GB en teoría, pero no hay datos de parámetros ni de precisión.
- Opciones de despliegue: no disponibles (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-dense-idm-n50k-20261111 | no disponible | no disponible | view_large 51,00 %; yaw30 92,55 % | no disponible | Hugging Face |
| pi05_libero (base) | no disponible | no disponible | no disponible en esta información | no disponible | Hugging Face (referenciado) |
| π0.5 (Physical Intelligence) | no disponible | no disponible | no disponible en esta información | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- Artefacto de investigación: no incluye train_state ni registros de wandb, lo que dificulta la reproducción exacta del entrenamiento.
- Evaluación limitada: solo se reportan dos métricas (view_large y yaw30) con una única semilla de entorno (7) y 2.000 episodios; no hay intervalos de confianza ni evaluación multi-semilla.
- Sesgos conocidos: no documentados; al ser una política entrenada en LIBERO, su comportamiento fuera de la distribución de ese benchmark es incierto.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero sí existe riesgo de acciones erróneas fuera de las tareas de manipulación previstas.
- Limitaciones de contexto e idioma: no documentadas.
- Sin pipeline declarado en Hugging Face, lo que puede complicar la carga automática con librerías estándar.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-dense-idm-n50k-20261111
- Código: https://github.com/Donghyun1228/vla_adaptation
