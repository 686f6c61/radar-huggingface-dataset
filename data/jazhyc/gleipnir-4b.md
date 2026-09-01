# Jazhyc/Gleipnir-4B

## Resumen

Gleipnir 4B es un adaptador LoRA de rango 128 diseñado como monitor de investigación para detectar engaño, maquinaciones y otros comportamientos problemáticos relevantes para el control de sistemas de IA en trayectorias visibles de agentes. Lo desarrolla Jazhyc y se publica como un artefacto de investigación temprano para reproducibilidad, no como un sistema de seguridad listo para producción. El adaptador se monta sobre el modelo base Qwen/Qwen3.5-4B y no es un modelo independiente.

El modelo recibe transcripciones de solo acción (mensajes visibles, llamadas a herramientas, comandos, salidas, ediciones e informes finales) sin acceso a la cadena de pensamiento privada del agente. En el límite de decisión congelado, compara los logits del siguiente token para los literales `0` y `1`, produciendo una puntuación de riesgo continua. Se entrenó mediante destilación de conocimiento a partir de las probabilidades blandas de Kimi K3 sobre los tokens de decisión, con una pérdida de peso cero para las etiquetas duras de las fuentes originales.

La relevancia actual de Gleipnir 4B reside en su enfoque de monitorización deliberativa solo-acción, que permite detectar sabotaje y maquinaciones en trayectorias de agentes sin depender de la monitorización de razonamiento interno. Con una ventana de contexto de hasta 29.696 tokens y un coste de inferencia aproximadamente un tercio del de su homólogo Gleipnir 9B, se posiciona como una opción de menor coste para investigación en seguridad de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen/Qwen3.5-4B) con adaptador LoRA |
| Parametros totales | 4B (base) + 169.869.312 (adaptador entrenable) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | hasta 29.696 tokens |
| Tipos de cuantizacion | base entrenada en 4-bit NF4 con doble cuantizacion y computo BF16; adaptador guardado en FP32 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

Gleipnir 4B es un adaptador LoRA de rango 128 y alpha 256 aplicado a todos los modulos de atencion y proyeccion MLP del modelo base Qwen/Qwen3.5-4B en la revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. No es un modelo autonomo: requiere cargar el modelo base completo y el adaptador mediante la libreria PEFT. La arquitectura subyacente es un transformer causal estandar, sin innovaciones estructurales adicionales.

El entrenamiento se realizo durante una epoca sobre 21.837 ejemplos: 8.688 trayectorias de herramientas solo-accion y 13.149 ejemplos previos de engaño de las lineas Aletheia's Quest y Liars' Bench. Se utilizo exclusivamente la probabilidad blanda de Kimi K3 sobre los tokens de decision literales; las etiquetas duras de las fuentes se conservaron para procedencia y evaluacion, pero con peso de perdida cero. La optimizacion uso AdamW con tasa de aprendizaje 5e-5, batch efectivo de 32 y semilla 0. El entrenamiento se ejecuto en una NVIDIA H100 80 GB durante aproximadamente 5,49 horas. La receta congelada del modelo de 9B se transfirio sin busqueda de hiperparametros para la variante de 4B.

## Capacidades

- Deteccion de engaño y maquinaciones en trayectorias visibles de agentes de IA, incluyendo acciones no autorizadas, intentos de eludir salvaguardas, cumplimiento de instrucciones conflictivas en entradas no confiables y ocultamiento deceptivo material.
- Puntuacion de riesgo continua mediante la normalizacion de los logits entre los tokens literales `0` y `1`, utilizable como clasificador binario o como señal de riesgo escalar.
- Monitorizacion solo-accion: opera sin acceso a la cadena de pensamiento privada del agente monitorizado, lo que permite su uso en entornos de caja negra.
- Manejo de contexto largo de hasta 29.696 tokens, suficiente para trayectorias extensas de agentes con multiples llamadas a herramientas.
- Clasificacion de comportamiento conforme a la tarea: distingue entre errores honestos, intentos fallidos, exploracion inofensiva y trabajo incompleto (clase 0) frente a comportamiento problematico real (clase 1).
- Compatibilidad con el ecosistema PEFT y Transformers de HuggingFace, con soporte para inferencia en vLLM mediante el subdirectorio `vllm/` con disposicion de adaptador re-basada.

## Casos de uso

- Monitorizacion de agentes autonomos en produccion: integrar Gleipnir 4B como capa de supervision que puntua cada trayectoria visible de un agente que ejecuta tareas con herramientas, alertando cuando la puntuacion de riesgo supera un umbral definido por la organizacion.
- Evaluacion de cumplimiento de salvaguardas: verificar si un agente intenta eludir restricciones programaticas o politicas de seguridad durante la ejecucion de tareas, especialmente en entornos con instrucciones potencialmente conflictivas en entradas no confiables.
- Auditoria de trayectorias en pipelines de datos: procesar registros historicos de interacciones de agentes para identificar incidentes de comportamiento problematico que requieran investigacion posterior o mejora de las politicas de despliegue.
- Investigacion en seguridad de IA: servir como herramienta de etiquetado automatico para construir conjuntos de datos de entrenamiento o evaluacion de detectores de maquinaciones, aprovechando su puntuacion continua en lugar de etiquetas binarias.
- Comparacion de politicas de agentes: evaluar sistematicamente diferentes configuraciones de agentes (prompts, herramientas, restricciones) para medir cual induce menos comportamiento problematico segun las puntuaciones del monitor.
- Deteccion de ocultamiento deceptivo: identificar casos en los que un agente oculta materialmente informacion relevante sobre sus acciones o resultados, un comportamiento critico en escenarios de supervisacion remota.

## Benchmarks y rendimiento

Los resultados siguientes son los declarados por el autor del modelo en la model card. Se evaluo una unica vez sobre un conjunto congelado de 6.395 filas estricto fuera-de-distribucion (OOD) que abarca AgentDojo, CUA-SHADE, IaC, MLE-Sabotage, Rogue Eval y SHADE-Arena. La metrica primaria es el pAUROC parcial normalizado medio no ponderado a traves de las fuentes hasta un 20% de tasa de falsos positivos.

| Modelo | Mean-OOD pAUROC@20 | Mean-OOD AUROC | Pooled pAUROC@20 | Pooled AUROC |
| --- | ---: | ---: | ---: | ---: |
| **Gleipnir 4B** | **0,7824** | **0,9086** | **0,7015** | **0,9135** |
| Gleipnir 9B | 0,8212 | 0,9215 | 0,7837 | 0,9355 |

Gleipnir 4B queda por detras de Gleipnir 9B en 0,0388 puntos de Mean-OOD pAUROC@20 y 0,0130 puntos de Mean-OOD AUROC. En el proxy de inferencia alojada del proyecto, su coste es aproximadamente un tercio, lo que lo convierte en la opcion de menor coste, no en un sustituto de calidad equivalente. Son estimaciones puntuales de una sola semilla. La prueba con la instruccion del profesor mas larga en inferencia produjo un cambio de solo +0,0004 en Mean-OOD pAUROC@20 y -0,0009 en Mean-OOD AUROC, sin evidencia agregada de que el prompt compacto sea un cuello de botella de elicitacion importante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende de la cuantizacion del modelo base Qwen/Qwen3.5-4B (por ejemplo, BF16 completo requiere aproximadamente 8 GB solo para los pesos del base, mas el adaptador y los estados de atencion).
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA H100 80 GB; para inferencia, una GPU con al menos 16-24 GB de VRAM (como RTX 4090, A100 40 GB) deberia ser suficiente con cuantizacion adecuada del modelo base.
- Compatibilidad con GPU de consumo: probablemente si, con cuantizacion del modelo base (por ejemplo, 4-bit o 8-bit) en GPUs de 12-16 GB, aunque no hay datos confirmados en la informacion disponible.
- Opciones de despliegue: Transformers con PEFT (ejemplo oficial), vLLM 0.24.0 mediante el subdirectorio `vllm/` con disposicion de adaptador re-basada, y potencialmente otras herramientas compatibles con PEFT.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mean-OOD pAUROC@20 | Licencia | Disponibilidad |
| --- | ---: | ---: | ---: | --- | --- |
| **Gleipnir 4B** | 4B + 169M adaptador | 29.696 | 0,7824 | MIT | HuggingFace |
| Gleipnir 9B | 9B (base no especificado) | no disponible | 0,8212 | no disponible | HuggingFace |

No se dispone de informacion sobre otros modelos comparables en la misma categoria de monitores deliberativos solo-accion en la informacion proporcionada. La comparativa se limita a la variante 9B del mismo proyecto, que supera a Gleipnir 4B en calidad pero con mayor coste de inferencia.

## Limitaciones y advertencias

- Artefacto de investigacion temprana: no hay paper ni blog post publicado aun; el autor lo presenta como un artefacto para reproducibilidad y trabajo de seguimiento, no como un sistema de seguridad de produccion.
- No debe tratarse como evidencia de seguridad: una puntuacion baja no implica que una interaccion sea segura; el modelo puede fallar en detectar comportamientos problematicos novedosos o fuera de su distribucion de entrenamiento.
- Estimaciones de una sola semilla: los resultados de benchmarks son estimaciones puntuales sin intervalos de confianza ni repeticiones con diferentes semillas.
- Limitacion de idioma: el modelo esta entrenado y evaluado solo en ingles; su rendimiento en otros idiomas no esta verificado.
- Dependencia del modelo base: requiere cargar Qwen/Qwen3.5-4B en una revision especifica; cambios en el modelo base pueden afectar al comportamiento del adaptador.
- Riesgo de alucinacion y falsos positivos/negativos: como clasificador, puede producir tanto falsas alarmas como omisiones de comportamiento problematico; la metrica pAUROC@20 indica un rendimiento imperfecto en la region de baja tasa de falsos positivos.
- Restricciones de uso: aunque la licencia es MIT, el autor advierte explicitamente que no es un sistema de seguridad de produccion; su uso en entornos criticos requiere validacion adicional.
- Sin garantia de generalizacion: la evaluacion OOD cubre seis fuentes especificas; el rendimiento en otros dominios o tipos de agentes no esta establecido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jazhyc/Gleipnir-4B
- Dataset de logits de trayectorias: https://huggingface.co/datasets/Jazhyc/gleipnir-kimi-k3-tool-trajectory-logits
- Paper relacionado (Training Deliberative Monitors for Black-Box Scheming Detection): https://alpha-ollama.hf-mirror.com/papers/2605.29601
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
