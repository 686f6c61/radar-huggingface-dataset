# bageldotcom/Bagel-Robotics-1

## Resumen

Bagel-Robotics-1 es un checkpoint de inferencia publicado por bageldotcom para robótica, etiquetado en Hugging Face con el pipeline `robotics` y las tags `robotics`, `structured-pruning` y `robodojo`. Se trata de un "world-action model" compacto derivado de VPP2 mediante una receta de selección de datos crítica para la tarea, poda estructurada adaptativa y entrenamiento de recuperación. El repositorio corresponde al checkpoint exacto 1000 (revisión `2651631c5d08819088475e8778676f5cf6d9afcf`) empleado en la campaña de evaluación del modelo, y se distribuye de forma pública y sin gating.

El componente principal es un experto de vídeo con 12.468.409.664 parámetros, un 23,95% menos que su modelo padre registrado. La poda convirtió las máscaras aprendidas en capas FFN y de atención cruzada más pequeñas, conservando las cabezas de auto-atención y el experto de acción. Para inferencia no se requiere ni el profesor ni el módulo de máscaras aprendidas. El autor advierte explícitamente que la reducción de parámetros no constituye una afirmación medida de aceleración en inferencia.

La relevancia del modelo radica en su enfoque de compresión estructurada aplicada a políticas visomotoras para manipulación robótica, con un pipeline de inferencia fijado (predicción de 32 acciones, ejecución de 16 antes de replanificar y ensamblado temporal 90/10) y un adaptador independiente para XPolicyLab. El repositorio ocupa aproximadamente 29,0 GB de tensores de checkpoint y requiere unos 16,7 GB adicionales de activos VAE/condicionamiento/tokenizer descargados por separado. El informe técnico está anunciado para el 20 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model derivado de VPP2 con poda estructurada adaptativa (capas FFN y cross-attention reducidas; self-attention y experto de acción conservados) |
| Parametros totales | 12.468.409.664 (experto de vídeo); total del bundle no disponible |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia fijada en BF16) |
| Idiomas soportados | en |
| Licencia | no disponible (la model card indica que los términos aplicables se conservan en los ficheros de licencia del repositorio) |
| Formato de pesos | `.pt` (video.pt, action.pt) junto con `compact_architecture.json`, `dataset_stats.json`, `COMPLETE.json` y `validation.json` |

## Arquitectura y entrenamiento

La arquitectura es un world-action model construido sobre VPP2 como modelo base de validación. Sobre esa base se aplicó un proceso de tres etapas: selección de datos crítica para la tarea, poda estructurada adaptativa a partir de máscaras aprendidas y entrenamiento de recuperación. La poda se materializó convirtiendo las máscaras en capas FFN y de atención cruzada de menor tamaño, mientras que las cabezas de auto-atención y el experto de acción se mantienen intactos. El resultado es un experto de vídeo de 12.468.409.664 parámetros, un 23,95% inferior al padre registrado.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La model card indica que la implementación de entrenamiento, poda y exportación está disponible en el repositorio de GitHub del proyecto, y que el informe técnico está previsto para el 20 de noviembre de 2026. El pipeline de inferencia es específico de Bagel-Robotics-1: predice 32 acciones, ejecuta 16 antes de replanificar y aplica un ensamblado temporal con 90% de la predicción nueva y 10% de la anterior. La configuración fija de inferencia incluye BF16, diez pasos Euler y shift 1, con acciones de efector final ARX X5.

## Capacidades

- Generación de acciones robóticas visomotoras: predice secuencias de 32 acciones y ejecuta las 16 primeras antes de replanificar.
- Control de manipulación con efector final ARX X5 en el adaptador de referencia.
- Ensamblado temporal de acciones (90% nueva / 10% previa) para suavizar la trayectoria entre replanificaciones.
- Integración con XPolicyLab mediante un adaptador independiente (`policy_name=Bagel_Robotics_1`, `ckpt_name=cp1000`).
- Evaluación en el benchmark RoboDojo, con comandos de tarea, suite y tres semillas documentados.
- Inferencia sin profesor ni módulo de máscaras aprendidas: el checkpoint es autónomo para despliegue.
- Idioma de documentación y etiquetado: inglés.
- No se declaran capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica en simulación con RoboDojo: el adaptador permite ejecutar tareas y suites del benchmark con tres semillas, útil para reproducir la evaluación del checkpoint en un entorno estandarizado.
- Despliegue de políticas visomotoras comprimidas: al reducir un 23,95% los parámetros del experto de vídeo, el checkpoint es adecuado para entornos con presupuesto de memoria ajustado, siempre que se asuma que no hay garantía de aceleración medida.
- Investigación en poda estructurada: el repositorio de GitHub con la implementación de poda y recuperación sirve como referencia para replicar la receta sobre otros modelos base.
- Integración en pipelines XPolicyLab: el adaptador independiente y el instalador permiten incorporar la política a un checkout existente sin repositorio privado ni token de acceso.
- Verificación de integridad de artefactos: `artifact-manifest.json` y `SHA256SUMS` fijan los seis ficheros del bundle, lo que facilita auditorías de procedencia en entornos de investigación.
- Control de efector final ARX X5: el adaptador está configurado para acciones de este efector, por lo que encaja en montajes experimentales con ese hardware o su gemelo simulado.
- Reproducibilidad de campañas de evaluación: la revisión original queda preservada en el historial Git, lo que permite reconstruir el estado exacto del checkpoint usado en la evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una cualificación del adaptador con 15 tests de CPU, dos transportes de depuración con checkpoint real, cuatro episodios válidos en simulador nativo y ocho comprobaciones exactas de acción/historial/reset/backend, pero no presenta puntuaciones de leaderboard. Los resultados históricos de investigación y las excepciones de escena se documentan en `EVALUATION_RESULTS.md` y, según el autor, no constituyen resultados oficiales de leaderboard.

## Requisitos de hardware

- Espacio en disco: aproximadamente 29,0 GB para los seis ficheros del checkpoint, más aproximadamente 16,7 GB de activos VAE/condicionamiento/tokenizer descargados por separado (unos 45,7 GB en total).
- VRAM estimada para inferencia: no disponible. Con 12.468.409.664 parámetros en BF16, el peso del experto de vídeo ronda los 25 GB solo en pesos, antes de activaciones y del resto del bundle; se requiere por tanto GPU de clase数据中心 o superior.
- GPU recomendadas: no especificadas por el autor. Por tamaño en BF16, se sitúa fuera del rango de GPUs de consumo tipo RTX 4090 (24 GB) para el experto completo en precisión nativa.
- ¿Cabe en GPU de consumo? No con la configuración BF16 documentada; no se han publicado opciones de cuantización que permitan reducirlo.
- Opciones de despliegue: adaptador XPolicyLab (Python 3.10) con instalador `install_adapter.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica explícitamente que la reducción de parámetros no es una afirmación de aceleración medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Bagel-Robotics-1 | 12.468.409.664 (experto de vídeo) | no disponible | no disponible | Público y sin gating en Hugging Face | Checkpoint podado de VPP2 con pipeline de inferencia fijo |
| VPP2 (modelo base) | no disponible | no disponible | no disponible | no disponible | Base de validación de la receta de poda; no se detallan sus especificaciones en la información disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se identifican en la información proporcionada otros modelos de la misma categoría con datos verificables |

## Limitaciones y advertencias

- La licencia no está declarada de forma explícita en la información disponible; la model card remite a los ficheros de licencia del repositorio, por lo que el uso comercial debe verificarse antes de adoptarlo.
- La reducción del 23,95% de parámetros no implica una mejora de latencia o throughput medida; el autor lo advierte de forma explícita.
- El pipeline de inferencia está fijado (32 acciones predichas, 16 ejecutadas, diez pasos Euler, shift 1, ensamblado 90/10) y no se documentan alternativas de configuración.
- El adaptador está orientado a acciones de efector final ARX X5 y a un entorno por proceso de política, lo que limita su uso directo con otro hardware sin adaptación.
- La validación multi-semilla oficial del leaderboard queda pendiente y separada de la cualificación del adaptador.
- No se puede reconstruir el estado del optimizador ni la continuación exacta del entrenamiento a partir de los pesos, según el propio autor.
- El informe técnico está anunciado para el 20 de noviembre de 2026; hasta entonces faltan detalles de dataset, composición y metodología completa.
- El modelo está etiquetado únicamente para inglés (`en`), sin evidencia de capacidades multilingües.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de un modelo de acción robótica, los fallos se manifiestan como trayectorias incorrectas más que como texto inventado.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/bageldotcom/Bagel-Robotics-1
- Repositorio GitHub (entrenamiento, poda y exportación): https://github.com/bageldotcom/Bagel-Robotics-1
- Guía de instalación de RoboDojo: https://robodojo-benchmark.com/doc/usage/install-and-download/
- Adaptador de inferencia: `inference/` dentro del repositorio de Hugging Face
- Instrucciones del adaptador: `inference/policy/Bagel_Robotics_1/README.md`
- Reevaluación: `inference/policy/Bagel_Robotics_1/REEVALUATION.md`
- Resultados de evaluación: `inference/policy/Bagel_Robotics_1/EVALUATION_RESULTS.md`
- Manifiesto de artefactos: `artifact-manifest.json`
- Hashes: `SHA256SUMS`
- Informe técnico: anunciado para el 20 de noviembre de 2026 (no disponible todavía)
