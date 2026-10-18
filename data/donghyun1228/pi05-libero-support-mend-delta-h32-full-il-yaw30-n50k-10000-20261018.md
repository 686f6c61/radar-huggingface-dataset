# Donghyun1228/pi05-libero-support-mend-delta-h32-full-il-yaw30-n50k-10000-20261018

## Resumen
Este checkpoint de Hugging Face, publicado por Donghyun1228, es una política robótica del ecosistema openpi para tareas LIBERO support. El nombre resume el experimento: pi05, support, delta, hidden 32, aprendizaje por imitación completo y configuración yaw30, con 50k frames y 10.000 actualizaciones. No es un modelo de lenguaje conversacional ni un multimodal de propósito general.

La política parte de un LLM congelado y entrena pesos nativos no LLM mediante MLP residuales compartidos por forma, FiLM por capa y alpha por canal; el IDM evita la transformación y entrena también los pesos nativos no LLM. El checkpoint conserva pesos brutos, anclas, transformación y optimizador para reanudar, mientras que `policy/` contiene los pesos de inferencia materializados y la normalización. El autor reporta 1254/2000 en evaluación final-only en MuJoCo 3.2.3, con cero errores de rollout; no hay datos de parámetros, contexto ni benchmarks estándar.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | política robótica openpi con LLM congelado y MLP residuales; arquitectura base exacta no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica; no se reporta una arquitectura MoE |
| Longitud de contexto | no disponible; no se documenta una ventana de contexto textual |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; el modelo está orientado a robótica |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint openpi con pesos de inferencia materializados en `policy/`; formato de fichero no disponible |
| Tipo de modelo | política robótica; pipeline `robotics` |
| Tamaño del repositorio | 88,2 GB |
| Ecosistema | openpi |

## Arquitectura y entrenamiento
No se especifica la arquitectura completa del modelo base. El material indica que hay un LLM congelado y que el aprendizaje por imitación (IL) de origen entrena MLP residuales no lineales compartidos por forma, con `hidden32`, ramas izquierda/derecha, FiLM por capa, alpha por canal de salida y pesos nativos no LLM completos. El modelo de dinámica inversa (IDM) evita la transformación y entrena los pesos nativos no LLM; los targets restauran esta nueva fuente, congelan la transformación y las anclas y excluyen `gripper6` de la pérdida del IDM.

El entrenamiento usa 50k frames de sondeo aleatorio cercanos a support, 10.000 actualizaciones, batch 32, semilla 42, LR 1e-5 y EMA desactivado. El warmup de origen es 100 y el de target 500. El replay se ejecuta en el paso 0 y cada 1000 actualizaciones, con etiquetas expertas fijas solo para diagnóstico. La evaluación final se hizo en MuJoCo 3.2.3 con batch 16, máximo 32 clientes, suite 8 y semilla de entorno 7.

## Capacidades
- Política de manipulación robótica para tareas LIBERO support, según el identificador y las etiquetas del repositorio.
- Aprendizaje por imitación con módulos residuales MLP, ramas izquierda/derecha, `hidden32`, FiLM por capa y alpha por canal.
- Modelo de dinámica inversa (IDM) que entrena pesos nativos no LLM sin pasar por la transformación.
- Entrenamiento con el LLM congelado y modificación de pesos nativos no LLM.
- Checkpoint reanudable con pesos brutos, anclas, transformación y optimizador.
- Pesos de inferencia materializados y normalización en `policy/`.
- Diagnóstico mediante puntos de replay con etiquetas expertas fijas.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, audio ni visión general.
- No se documentan capacidades multilingües; no es un modelo lingüístico.

## Casos de uso
- Investigación en manipulación con LIBERO support: cargar la política en el entorno MuJoCo correspondiente para reproducir la evaluación final-only reportada y analizar el comportamiento en tareas support.
- Estudio de modelos de dinámica inversa: usar el checkpoint para analizar cómo el IDM entrena pesos nativos no LLM sin aplicar la transformación, comparando con la rama IL.
- Reproducción de experimentos de adaptación: reanudar desde el checkpoint completo, que conserva optimizador, anclas y transformación, para continuar entrenamientos con warmup de target de 500 pasos.
- Ablaciones de arquitectura: evaluar el efecto de los MLP residuales `hidden32`, las ramas izquierda/derecha, FiLM por capa y alpha por canal en el rendimiento de la política.
- Diagnóstico de entrenamiento: utilizar los 11 puntos de replay y las etiquetas expertas fijas para comparar la evolución del modelo sin usarlas como señal de entrenamiento.
- Despliegue de inferencia en robótica de investigación: cargar `policy/` con los pesos materializados y la normalización para ejecutar rollouts en el entorno openpi, siempre que se disponga del entorno y de las dependencias adecuadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas estándar de lenguaje; no aplican a este checkpoint. El único dato de evaluación disponible es el siguiente:

| Evaluación | Entorno | Resultado reportado | Condiciones |
|---|---|---|---|
| Final-only | MuJoCo 3.2.3, LIBERO support | 1254/2000 | cero errores de rollout; batch 16; máximo 32 clientes; suite 8; semilla de entorno 7 |

El autor no detalla en el texto citado si 1254/2000 corresponde exactamente a tasa de éxito, recompensa acumulada u otra métrica.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; no se pueden estimar requisitos fiables sin el número de parámetros y la configuración de precision.
- GPU recomendadas: no disponible; no se documentan modelos de GPU probados.
- Compatibilidad con GPU de consumo: no se puede confirmar con los datos disponibles.
- Almacenamiento: el repositorio ocupa 88,2 GB e incluye el checkpoint completo con optimizador; ese tamaño no equivale a la VRAM necesaria para inferencia.
- Opciones de despliegue: openpi, cargando el checkpoint y `policy/`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se han identificado 2-3 alternativas con datos verificables en la información proporcionada. Para no inventar cifras, se indica `no disponible` en los campos comparativos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | no disponible | no disponible | 1254/2000 en evaluación final-only | Apache-2.0 | Hugging Face; 0 descargas, 0 likes |
| Alternativa 1 (no identificada) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 (no identificada) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 3 (no identificada) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No se documentan sesgos conocidos; no hay información suficiente para evaluarlos.
- El riesgo de alucinación lingüística no aplica del mismo modo que en un LLM, pero en robótica existe riesgo de acciones incorrectas ante cambios de distribución, oclusión o tareas fuera del dominio LIBERO support.
- La evaluación reportada es final-only y se limita a 1254/2000 en MuJoCo 3.2.3; no se publican métricas por tarea, intervalos de confianza ni resultados de generalización.
- El modelo está orientado a un dominio robótico concreto y a una configuración yaw30; no hay evidencia de funcionamiento en otros entornos, robots o tareas.
- No se documentan idiomas, contexto textual ni capacidades de tool calling; no debe tratarse como un modelo de lenguaje general.
- La licencia del checkpoint es Apache-2.0, pero deben revisarse las licencias de componentes de terceros, del ecosistema openpi, de LIBERO y de MuJoCo antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento indicado; no hay validación externa publicada en la información disponible.
- No se documentan medidas de seguridad, parada de emergencia, límites de fuerza ni procedimientos de supervisión para despliegue físico.

## Enlaces
- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-support-mend-delta-h32-full-il-yaw30-n50k-10000-20261018
- No se han encontrado otros enlaces a papers, blogs, repositorios o demos en la información proporcionada.
