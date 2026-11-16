# Donghyun1228/pi05-libero-worldagen-h3-joint-source-ttt-view-large-lora1e-5-enc3e-5-2000-20261116

## Resumen

WorldAgen sobre pi0.5 (LIBERO) es un checkpoint de investigación publicado por el usuario Donghyun1228 en Hugging Face. Se trata de un ajuste fino del modelo base pi0.5 (Physical Intelligence) orientado a tareas de manipulación robótica en el benchmark LIBERO, combinando un entrenamiento conjunto ("joint source") de acción y predicción de imagen con una fase posterior de test-time training (TTT) sobre datos de sondeo de la vista "View-Large".

El modelo parte de un entrenamiento conjunto de 10.000 pasos sobre pi05_libero con una pérdida de acción más una pérdida de imagen ponderada a 0,1, con horizonte h=3 y vista base compartida con SigLIP. Sobre esa base se aplica un TTT de 2.000 pasos que solo optimiza la pérdida de imagen mediante LoRA de rango 64 (lr 1e-5) sobre la torre SigLIP (lr 3e-5), con batch 32.

Su relevancia es acotada y experimental: el autor reporta una mejora en la tasa de éxito en LIBERO (2.000 episodios, semilla 7) del 13,2 % en zero-shot al 20,3 % tras TTT, con un test de McNemar pareado de p=5e-18. No es un modelo de propósito general ni un LLM conversacional, sino un artefacto de investigación en robótica con licencia no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de pi0.5 (vision-language-action); torre visual SigLIP compartida; adaptadores LoRA sobre SigLIP |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 14,6 GB; estructura con `ttt_view_large_step2000/model`, `source_native_9999/params` y `assets/donghyun/libero`) |

## Arquitectura y entrenamiento

El modelo se construye sobre pi0.5, un modelo visión-lenguaje-acción (VLA) de Physical Intelligence que combina una torre visual SigLIP con un transformer de política que genera acciones. El autor describe dos fases: primero un entrenamiento conjunto ("joint source") de 10.000 pasos desde pi05_libero con pérdida de acción más 0,1 veces la pérdida de imagen, horizonte h=3 y solo vista base con SigLIP compartido; después un test-time training (TTT) de 2.000 pasos con batch 32 que optimiza únicamente la pérdida de imagen, aplicando LoRA de rango 64 con lr 1e-5 a la política y lr 3e-5 a la base SigLIP, sobre los datos de sondeo de la vista "View-Large".

La innovación principal es el uso de TTT con señal visual (predicción de imagen) como mecanismo de adaptación al dominio de evaluación, en lugar de ajuste supervisado con acciones. El checkpoint se carga como overlay (`ttt_view_large_step2000/model`) sobre una base congelada (`source_native_9999/params`) junto con las estadísticas de normalización en `assets/donghyun/libero`, en el contexto del repositorio baselines/worldagen_pi05 con la opción `--frozen-checkpoint`. No se detalla la composición exacta del dataset ni el número total de tokens o muestras de entrenamiento.

## Capacidades

- Control robótico de manipulación en el entorno LIBERO: genera acciones a partir de observaciones visuales e instrucciones.
- Predicción de imagen (world model) como señal auxiliar de entrenamiento y de TTT.
- Adaptación test-time al dominio visual mediante LoRA sobre SigLIP.
- Aprendizaje conjunto de política y modelo de mundo (pérdida de acción + pérdida de imagen).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible más allá del bucle de control robótico.
- Capacidades multilingües: no disponible.
- Capacidades especiales: adaptación TTT con vista "View-Large"; sin modo thinking, visión general, audio ni otras modalidades documentadas.

## Casos de uso

- Investigación en adaptación test-time para VLA: usar el checkpoint como referencia para reproducir el protocolo TTT (LoRA r=64, lr 1e-5/3e-5, 2.000 pasos) y medir el efecto en la tasa de éxito sobre LIBERO.
- Evaluación de world models en robótica: comparar la señal de predicción de imagen como objetivo auxiliar frente a entrenamiento solo con acción en tareas de manipulación.
- Benchmarking de políticas en LIBERO: ejecutar los 2.000 episodios con semilla 7 para contrastar el 20,3 % de éxito reportado frente al 13,2 % zero-shot.
- Estudio de sobreajuste al dominio visual: analizar por qué la adaptación a "View-Large" mejora el rendimiento y si generaliza a otras vistas o entornos.
- Reproducción de experimentos académicos: servir como artefacto de comparación en publicaciones sobre TTT y modelos de mundo para control.
- Desarrollo de pipelines de evaluación con checkpoints congelados: integrar el overlay sobre `source_native_9999/params` en el repositorio baselines/worldagen_pi05 para pruebas controladas.
- Base para ajustes posteriores: partir de este checkpoint para experimentos de fine-tuning con acciones u otras vistas, dado que el autor documenta la receta exacta.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO (2.000 episodios, semilla 7, View-Large) | TTT (este checkpoint) | 406/2000 (20,3 %) |
| LIBERO (2.000 episodios, semilla 7, View-Large) | Source zero-shot | 264/2000 (13,2 %) |
| Significancia | McNemar pareado | p = 5e-18 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 14,6 GB, lo que da una cota inferior aproximada del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponible en la información proporcionada; el nombre del checkpoint menciona "H100-matched", lo que sugiere entrenamiento en H100, pero no se documentan requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor referencia el repositorio baselines/worldagen_pi05 con la opción `--frozen-checkpoint`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WorldAgen pi0.5 (este checkpoint) | no disponible | no disponible | 20,3 % (TTT) / 13,2 % (zero-shot) | no disponible | Hugging Face, 0 descargas |
| pi0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | Referenciado como base |
| pi05_libero | no disponible | no disponible | no disponible | no disponible | Referenciado como punto de partida |

No se dispone de datos comparativos suficientes sobre alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial; contactar con el autor antes de cualquier despliegue productivo.
- Modelo de investigación con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento documentado.
- Rendimiento absoluto bajo en LIBERO (20,3 % de éxito): no apto para aplicaciones reales de robótica sin mejoras sustanciales.
- La mejora reportada se limita a la vista "View-Large" y a la semilla 7; no se documenta generalización a otras vistas, semillas o entornos.
- Riesgo de sobreajuste al dominio de sondeo usado en el TTT.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución.
- Sin datos de idiomas, contexto ni cuantizaciones: difícil planificar el despliegue.
- Dependencia de un repositorio externo (baselines/worldagen_pi05) y de checkpoints congelados concretos para la carga correcta.
- Fecha de creación del repositorio en 2026: verificar la vigencia de los artefactos y de las dependencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-worldagen-h3-joint-source-ttt-view-large-lora1e-5-enc3e-5-2000-20261116
- Inputs del entrenamiento fuente: https://huggingface.co/Donghyun1228/libero-worldagen-source-h3-inputs-20261115
- Repositorio LIBERO (Physical Intelligence): https://github.com/physical-intelligence/libero
- Repositorio baselines/worldagen_pi05: no disponible como enlace directo en la información proporcionada
