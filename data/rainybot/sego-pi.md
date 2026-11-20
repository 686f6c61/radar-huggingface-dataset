# RainyBot/SeGo-pi

## Resumen

SeGo-pi es una colección de políticas robóticas PI0 ajustadas (fine-tuned) a partir de los pesos base oficiales de PI0 en formato PyTorch. El modelo lo desarrolla el usuario RainyBot y se distribuye como una colección de checkpoints independientes, uno por tarea y por época de entrenamiento, empaquetados como unidades de inferencia autocontenidas. Cada directorio de tarea incluye los pesos del modelo, las estadísticas de normalización correspondientes, el tokenizador y la configuración de interfaz necesaria para ejecutar la política.

La relevancia del modelo reside en que expone checkpoints de políticas robóticas reales entrenadas sobre dos tareas concretas ("phone" y "transfer_dropper"), con múltiples épocas disponibles (epoch-24, 30, 35 y 40 para phone; epoch-30 y epoch-60 para transfer_dropper). El autor declara explícitamente que no se reclaman resultados de evaluación en bucle cerrado sobre robot real, lo que convierte esta ficha en una referencia de disponibilidad de pesos más que de rendimiento validado.

Arquitectónicamente se apoya en PI0, un modelo de política robótica basado en transformer con componentes derivados de Gemma, distribuido en safetensors y orientado a inferencia mediante la implementación OpenPI. El tamaño del repositorio es de 38,9 GB, coherente con múltiples checkpoints de pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de política robótica PI0 (base PI0 PyTorch, componentes derivados de Gemma) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin indicar variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-gemma-terms (OpenPI Apache-2.0; componentes Gemma sujetos a Gemma Terms of Use) |
| Formato de pesos | safetensors (PyTorch) |
| Pipeline | robotics |
| Dimensiones de estado/acción | 16 dimensiones (xyz absoluto del efector final, cuaternión xyzw, gripper; brazo izquierdo seguido del derecho), rellenadas a 32 |
| Horizonte de acción | 32 pasos |
| Resolución de imagen (tareas phone y transfer_dropper) | 320 (exportaciones históricas) |

## Arquitectura y entrenamiento

El modelo se basa en PI0, una arquitectura de política robótica de tipo transformer que combina componentes derivados de Gemma con cabezas de acción específicas para control de robot. Los checkpoints incluidos en esta colección son ajustes (fine-tunes) sobre los pesos base oficiales de PI0 en PyTorch, entrenados por el autor sobre datos de robot real para dos tareas: "phone" y "transfer_dropper". No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Un detalle técnico destacable es el empaquetado autocontenido de cada checkpoint: cada directorio de tarea y época incluye pesos, estadísticas de normalización, tokenizador y configuración de interfaz (`inference_config.json`). El estado y la acción usan coordenadas absolutas del efector final (xyz), cuaternión xyzw y gripper, con 16 dimensiones reales rellenadas a 32, y un horizonte de acción de 32 pasos. Las tareas phone y transfer_dropper emplearon exportaciones de imagen a resolución 320, separadas de experimentos posteriores a resolución nativa. Los bundles públicos contienen únicamente ficheros de inferencia; los estados completos de optimizador y RNG permanecen en checkpoints locales de entrenamiento.

## Capacidades

- Control de robot mediante políticas de imitación entrenadas sobre tareas concretas (phone y transfer_dropper).
- Inferencia autocontenida: cada checkpoint incluye pesos, normalización, tokenizador y configuración de interfaz.
- Salida de acciones con horizonte de 32 pasos sobre 16 dimensiones (rellenadas a 32) para efector final y gripper.
- Integración con la implementación OpenPI (`RainyRobo/openpi`) mediante `scripts/serve_policy.py`.
- Múltiples épocas disponibles por tarea para comparación de checkpoints (phone: 24, 30, 35, 40; transfer_dropper: 30, 60).
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Investigación en políticas robóticas de imitación: usar los checkpoints de phone y transfer_dropper como línea base reproducible para comparar épocas y configuraciones de normalización en entornos de laboratorio.
- Reproducción de inferencia PI0 en PyTorch: desplegar `serve_policy.py` con la configuración `pi0_xtrainer2_phone_eef` o `pi0_xtrainer2_transfer_dropper_eef` para validar el pipeline OpenPI extremo a extremo.
- Manipulación de objetos tipo "transfer dropper": emplear el checkpoint epoch-60 (run completo de 60 épocas) para tareas de transferencia de objetos pequeños con efector final.
- Tareas de interacción con teléfono: usar phone epoch-40 (última versión archivada) como referencia para políticas de manipulación de dispositivos.
- Estudio de convenciones de coordenadas y gripper: aprovechar las estadísticas de normalización empaquetadas para analizar el efecto de las convenciones de dataset sobre el rendimiento de la política.
- Base para fine-tuning adicional: partir de los pesos PI0 ajustados incluidos para extender la política a nuevas tareas manteniendo las convenciones de estado/acción documentadas.
- Validación de infraestructura de serving: probar latencia y throughput del stack OpenPI con checkpoints reales antes de escalar a despliegues mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ningún resultado de evaluación en bucle cerrado sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se indican parámetros totales ni variantes cuantizadas).
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; el tamaño del repositorio (38,9 GB) corresponde a múltiples checkpoints, no a un único modelo, por lo que el requisito por checkpoint es menor pero no cuantificado.
- Opciones de despliegue: implementación OpenPI (`RainyRobo/openpi`) mediante `scripts/serve_policy.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeGo-pi (RainyBot) | no disponible | no disponible | sin evaluación en bucle cerrado declarada | apache-2.0-and-gemma-terms | Hugging Face, 38,9 GB, 0 descargas |
| PI0 base (oficial) | no disponible | no disponible | no disponible en esta información | sujeta a términos del proyecto original | pesos base oficiales PyTorch citados como origen |
| Alternativas de política robótica open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia de evaluación en bucle cerrado: el autor no reclama resultados de rendimiento sobre robot real, por lo que no hay garantía de comportamiento en despliegue.
- Checkpoints específicos por tarea: las políticas están entrenadas para phone y transfer_dropper; no se documenta generalización a otras tareas.
- Resolución de imagen fija a 320 en las tareas incluidas, lo que limita su uso con pipelines de resolución nativa posteriores.
- Convenciones estrictas de estado/acción: es obligatorio preservar las convenciones de coordenadas del dataset y del gripper, así como usar las estadísticas de normalización empaquetadas con cada tarea.
- Tokenizador empaquetado para reproducibilidad: la inferencia offline requiere colocarlo en la caché usada por la implementación OpenPI compatible.
- Model cards por checkpoint copiadas de archivos originales pueden referirse a repositorios standalone originales; deben usarse el layout y las instrucciones de esta colección.
- Los bundles públicos solo contienen ficheros de inferencia; no incluyen estados de optimizador ni RNG.
- Licencia mixta: OpenPI es Apache-2.0, pero los componentes derivados de Gemma están sujetos a Gemma Terms of Use, con implicaciones para uso comercial que deben revisarse en `LICENSE` y `LICENSE_GEMMA.txt`.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SeGo-pi
- Licencia Gemma Terms of Use: https://huggingface.co/RainyBot/SeGo-pi/blob/main/LICENSE_GEMMA.txt
- Implementación compatible OpenPI: `RainyRobo/openpi` (referenciada en la model card; URL no disponible en la información proporcionada)
