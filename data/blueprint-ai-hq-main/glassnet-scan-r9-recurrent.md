# blueprint-ai-hq-main/glassnet-scan-r9-recurrent

## Resumen

Glassnet-scan-r9-recurrent es un modelo de lenguaje recurrente experimental desarrollado por el usuario blueprint-ai-hq-main y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo entrenado desde cero (from-scratch) con una arquitectura recurrente implementada sobre NumPy, sin dependencia de frameworks de deep learning convencionales como PyTorch o TensorFlow. Con 4.735.970 parámetros, es un modelo de escala muy reducida, orientado a experimentación e interpretabilidad más que a uso productivo.

El modelo está diseñado explícitamente como un experimento y su propia model card lo advierte: no puede mantener una conversación. Su ventana de contexto es de solo 32 tokens, lo que lo sitúa muy por debajo de cualquier modelo de lenguaje utilizable en tareas reales. La relevancia de este modelo es, por tanto, académica y de investigación: sirve como banco de pruebas para estudiar el comportamiento de arquitecturas recurrentes, la dinámica del estado oculto y los efectos de la realimentación de la propia salida del modelo.

Los números medidos que reporta el autor son reveladores: una precisión de siguiente token del 16,27% en modo teacher-forced y solo un 5,00% en modo libre (cuando el modelo consume su propia salida), con una tasa de repetición de 0,915 en generación libre. Estos datos reflejan un modelo en fase muy temprana de entrenamiento o con capacidad limitada, útil para estudiar fenómenos de degradación y colapso en generación autoregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente, implementada desde cero sobre NumPy |
| Parametros totales | 4.735.970 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 tokens |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje recurrente construido desde cero, sin usar frameworks de deep learning estándar, sino NumPy como librería de cómputo. El repositorio incluye `model.safetensors` en float32, `config.json` y `MANIFEST.json`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles.

El aspecto técnico más destacable que reporta el autor es la medición del movimiento del estado oculto: «state movement from a token 16 steps back» es de solo un 0,88%, lo que sugiere que la información de tokens lejanos (dentro de la ventana de 32) se desvanece casi por completo en el estado recurrente. Este dato apunta a un problema de memoria a largo plazo dentro de la propia ventana, coherente con la baja precisión en generación libre. El modelo está etiquetado con el tag «interpretability», lo que indica que su propósito es servir de objeto de estudio para analizar dinámicas internas de modelos recurrentes.

## Capacidades

- Generación de texto a nivel de siguiente token, con precisión muy limitada (16,27% teacher-forced, 5,00% en generación libre).
- Modelado de secuencias cortas dentro de una ventana de 32 tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés.
- No dispone de modo thinking, visión ni audio.
- Su valor principal es como objeto de estudio para interpretabilidad de estados recurrentes.

## Casos de uso

- Investigación en interpretabilidad de modelos recurrentes: el modelo permite analizar cómo evoluciona el estado oculto token a token y cuantificar el desvanecimiento de información, gracias a su simplicidad y a sus métricas publicadas de movimiento de estado.
- Estudio de degradación en generación autoregresiva: la diferencia entre precisión teacher-forced (16,27%) y libre (5,00%) lo convierte en un caso de estudio controlado sobre el efecto de la realimentación de la propia salida.
- Reproducción de experimentos desde cero: al estar implementado sobre NumPy y publicarse con safetensors y manifiesto, sirve para validar pipelines de entrenamiento e inferencia sin dependencias pesadas.
- Docencia sobre arquitecturas recurrentes: su tamaño reducido (4,7 M de parámetros) y su contexto de 32 tokens permiten ejecutarlo y examinarlo en entornos educativos con recursos mínimos.
- Análisis de colapso por repetición: la tasa de repetición de 0,915 en generación libre lo hace útil para estudiar patrones de bucle en decodificación autoregresiva.
- Verificación de integridad de artefactos: el hash SHA-256 publicado del safetensors permite practicar flujos de verificación de pesos en pipelines de MLOps.
- No es adecuado para atención al cliente, generación de código en producción, análisis de documentos ni ninguna tarea de usuario final.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision de siguiente token (teacher-forced, held-out) | 16,27% |
| Precision en generacion libre (salida propia) | 5,00% |
| Repeticion en generacion libre | 0,915 |
| Movimiento de estado desde un token 16 pasos atras | 0,88% |
| Parametros | 4.735.970 |
| Ventana de contexto | 32 tokens |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (4,7 M de parámetros × 4 bytes ≈ 19 MB de pesos, más overhead de runtime).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: al estar implementado sobre NumPy, la inferencia se realiza con código propio del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (recurrentes experimentales from-scratch de escala inferior a 5 M de parámetros).

## Limitaciones y advertencias

- El propio autor advierte que el modelo es experimental y no puede mantener una conversación.
- Precisión de siguiente token muy baja: 16,27% teacher-forced y 5,00% en generación libre.
- Ventana de contexto de solo 32 tokens, insuficiente para cualquier tarea práctica.
- Fuerte tendencia a la repetición en generación libre (0,915).
- Desvanecimiento severo de la información: solo un 0,88% de movimiento de estado desde un token 16 pasos atrás.
- Solo soporta inglés.
- Riesgo elevado de alucinación y salidas incoherentes por su baja precisión.
- Licencia MIT: permite uso comercial, pero el modelo no es funcional para producción.
- No se documentan sesgos específicos, aunque al ser un modelo de inglés entrenado con datos no especificados, pueden existir sesgos no caracterizados.
- Sin pipeline declarado ni integración con ecosistemas estándar de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/blueprint-ai-hq-main/glassnet-scan-r9-recurrent
