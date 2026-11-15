# adi2440/VLCM-checkpoints

## Resumen

VLCM-checkpoints es un repositorio de checkpoints de investigación publicado por el usuario adi2440 en Hugging Face, orientado a robótica multiagente. No se trata de un modelo generativo de propósito general, sino de un conjunto de pesos entrenados para dos tareas concretas: la predicción de progreso de tareas visuales (modelo CFM-Future5) y el clonado de comportamiento (BC) de una política de control para un agente AO. El repositorio contiene únicamente artefactos de inferencia y metadatos de reconstrucción, sin datasets ni estados de optimizador.

El componente principal, CFM-Future5, es un modelo de flow matching condicional (conditional flow matching) construido sobre la definición de un modelo personalizado VLCM que depende del modelo base Qwen/Qwen3-VL-2B-Instruct. Recibe ocho observaciones a 5 Hz y predice diez bins de progreso separados 0,2 segundos, es decir, un horizonte de 2 segundos hacia delante. No es un `AutoModel` autónomo de Transformers: requiere la definición custom original y restaurar parámetros congelados con semilla de reconstrucción 42.

El segundo componente es una política BC pequeña basada en una CNN, con cabeza de predicción de ocho comandos y parametrización tanh, entrenada sobre 320 episodios óptimos de AO y validada sobre 80 episodios disjuntos. Su métrica publicada es un MAE de primera acción de 0,0928846 en unidades normalizadas, que no equivale a una tasa de éxito en bucle cerrado. El repositorio es relevante como material de reproducción para investigación en robótica multiagente y predicción de progreso, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CFM-Future5: flow matching condicional sobre definición custom VLCM con base Qwen/Qwen3-VL-2B-Instruct; política BC: CNN pequeña con cabeza de 8 comandos y tanh |
| Parametros totales | no disponible (el checkpoint CFM exporta únicamente los tensores entrenables originales; la política BC es una CNN pequeña sin recuento publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 8 observaciones a 5 Hz; horizonte de predicción de 10 bins a 0,2 s) |
| Tipos de cuantizacion | no disponible (export en PyTorch `.pt`, sin versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica; sin capacidades lingüísticas declaradas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`cfm/Future5_epoch027_step152758.pt`, `bc/AO400_optimal_epoch051/bc_policy.pt`) más JSON de configuración y `CHECKSUMS.json` |

## Arquitectura y entrenamiento

CFM-Future5 emplea flow matching condicional para predecir la evolución del progreso de tarea a partir de una secuencia de observaciones visuales. El checkpoint exportado corresponde al paso 152.758 de entrenamiento (época 27) y contiene exactamente los tensores entrenables originales del modelo custom VLCM, congelados para inferencia. La condicion de acción es heredada (legacy): usa una instantánea de comando por bin en lugar de todos los comandos a 30 Hz. La cabeza auxiliar de éxito queda excluida del scoring de progreso. El modelo predice progreso de tarea, no probabilidad de colisión ni función de valor de RL.

La política BC se entrenó sobre 320 episodios óptimos de AO y se validó sobre 80 episodios disjuntos, seleccionándose la época 51. Consume RGB aéreo a 224×224, vectores no privilegiados de robot, objetivo y resumen de equipo, y un ID de tarea AO fijo. El bundle `actor_bundle.json` documenta arquitectura, contrato de entrada/acción y metadatos de validación. No se especifican en la información disponible el número de tokens de entrenamiento del CFM, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Predicción de progreso de tarea visual en entornos multiagente: 8 observaciones a 5 Hz como entrada y 10 bins de progreso a 0,2 s de separación.
- Predicción de horizonte corto: los experimentos actuales de política usan solo el primer pronóstico a +0,2 s.
- Clonado de comportamiento para control robótico: la política BC emite 8 comandos con parametrización tanh a partir de RGB aéreo y vectores de estado no privilegiados.
- Condicionamiento por comando: el CFM acepta una instantánea de comando por bin de pronóstico.
- Integración con modelos vision-language: depende de Qwen/Qwen3-VL-2B-Instruct como base para la definición custom VLCM.
- No dispone de tool calling, function calling, capacidades de agente conversacional ni soporte multilingüe declarado.

## Casos de uso

- Investigación en predicción de progreso de tareas robóticas: usar CFM-Future5 para estimar el avance de una tarea multiagente a partir de observaciones visuales a 5 Hz y comparar contra métricas de referencia en experimentos reproducibles.
- Reentrenamiento y ablación de políticas BC: la política AO400 sirve como línea base para estudiar el efecto de entradas no privilegiadas (robot, objetivo y resumen de equipo) frente a entradas privilegiadas.
- Evaluación de planificación a corto plazo: emplear el primer pronóstico a +0,2 s como señal de control en bucles de decisión de baja latencia, tal como hacen los experimentos actuales del autor.
- Reproducción de experimentos con semilla fija: restaurar los parámetros custom con semilla 42 y verificar identidades SHA-256 mediante `CHECKSUMS.json` para garantizar comparabilidad entre ejecuciones.
- Estudio de flow matching condicional aplicado a robótica: analizar el comportamiento del modelo en la predicción de bins de progreso y su calibración temporal a 0,2 s por bin.
- Desarrollo de sistemas de supervisión de flotas multiagente: usar la salida de progreso como señal auxiliar para detectar estancamientos en tareas colaborativas, sin asumir capacidades de detección de colisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo aportado es el MAE de primera acción de la política BC en validación: 0,0928846 en unidades normalizadas de comando, que no constituye una tasa de éxito en bucle cerrado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 0,1 GB, pero el CFM depende del modelo base Qwen/Qwen3-VL-2B-Instruct, cuyo peso adicional condiciona el consumo real.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no confirmado; la viabilidad depende del modelo base Qwen3-VL-2B y de la definición custom VLCM, no solo del checkpoint exportado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el checkpoint es un estado custom parcial en PyTorch que requiere la definición original del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de predicción de progreso multiagente ni de clonado de comportamiento con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El checkpoint CFM no es un `AutoModel` autónomo de Transformers: requiere la definición custom VLCM original y el modelo base Qwen/Qwen3-VL-2B-Instruct.
- El export excluye estados de optimizador, scheduler y RNG, así como configuración privada de entrenamiento; el checkpoint de reanudación original permanece en el clúster de origen.
- La condicion de acción es legacy (una instantánea por bin en lugar de comandos a 30 Hz), lo que puede limitar la fidelidad en escenarios con comandos de alta frecuencia.
- El modelo predice progreso de tarea, no probabilidad de colisión ni función de valor de RL; no debe usarse para seguridad o evitación de obstáculos.
- La cabeza auxiliar de éxito no se usa para el scoring de progreso.
- El MAE de validación de la política BC no es una tasa de éxito en bucle cerrado; no debe interpretarse como rendimiento en producción.
- La licencia no está disponible, lo que impide confirmar condiciones de uso comercial; además, el uso queda sujeto a los términos del modelo base Qwen.
- No se declaran idiomas soportados ni sesgos conocidos; el alcance es exclusivamente robótico y de investigación.
- El repositorio no incluye datasets, credenciales ni cachés de autenticación, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/adi2440/VLCM-checkpoints
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
