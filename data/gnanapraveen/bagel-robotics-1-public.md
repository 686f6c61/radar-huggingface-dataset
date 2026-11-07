# GnanaPraveen/Bagel-Robotics-1-Public

## Resumen

Bagel-Robotics-1 es un modelo de política robótica (visión-lenguaje-acción) publicado como espejo público del checkpoint 1000 de `bageldotcom/Bagel-Robotics-1`, un repositorio original que permanece privado. Lo desarrolla la organización Bagel (bageldotcom) y este espejo lo mantiene el usuario GnanaPraveen. El modelo deriva de la arquitectura VPP2 (Video Prediction Policy 2) y reutiliza componentes de Wan2.1, y está orientado a la ejecución de tareas de manipulación bimanual en el benchmark RoboDojo con acciones de efector final ARX X5.

El artefacto principal es un "video expert" de 12.468.409.664 parámetros (aproximadamente 12,47 mil millones), un 23,95 % menos que su modelo padre registrado, fruto de una poda estructurada en la que las máscaras aprendidas se convirtieron en capas FFN y de atención cruzada más pequeñas, conservando las cabezas de autoatención y el experto de acción. No requiere módulo profesor ni máscaras aprendidas en inferencia, y el autor advierte explícitamente que la reducción de parámetros no constituye una afirmación medida de aceleración en inferencia.

La relevancia del modelo es acotada y muy específica: se trata de un artefacto de investigación para reevaluación reproducible en RoboDojo, no de un modelo de propósito general. El repositorio ocupa 29,0 GB de tensores de checkpoint y requiere descargar aparte unos 16,7 GB de activos VAE/condicionamiento/tokenizer. No es un checkpoint de Transformers compatible con `AutoModel`, sino un artefacto VPP2 "compact-aware" que se ejecuta mediante un adaptador propio sobre XPolicyLab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VPP2 (Video Prediction Policy 2) con experto de vídeo y experto de acción; componentes derivados de Wan2.1; poda estructurada de FFN y atención cruzada |
| Parametros totales | 12.468.409.664 (experto de vídeo); total del sistema no disponible |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; inferencia fijada en BF16 |
| Idiomas soportados | en |
| Licencia | no disponible (el código de inferencia conserva avisos MIT/Apache-2.0; los términos upstream de pesos y activos auxiliares siguen aplicando) |
| Formato de pesos | `video.pt`, `action.pt` (PyTorch), más `compact_architecture.json`, `dataset_stats.json`, `COMPLETE.json`, `validation.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VPP2, un esquema de política vídeo-predicción-acción que combina un experto de vídeo con un experto de acción. Sobre el modelo padre se aplicó una poda estructurada: las máscaras aprendidas se materializaron en capas FFN y de atención cruzada de menor tamaño, mientras que las cabezas de autoatención y el experto de acción se mantuvieron intactos. El resultado es un checkpoint autónomo para inferencia, sin necesidad del profesor ni del módulo de máscaras. El checkpoint corresponde a la revisión original `2651631c5d08819088475e8778676f5cf6d9afcf`, con identidad `790bffc9464fa7a026aa43b217aec2033d186895cad643166daa0bcc01914d5c`, y los hashes SHA-256 de los seis ficheros del bundle se conservan sin cambios en `SHA256SUMS`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El informe técnico y el código de entrenamiento, poda y exportación están anunciados para el 20 de noviembre de 2026. El release incluye únicamente código de inferencia y pesos: no incluye estado de optimizador, scheduler, RNG/sampler distribuido, datasets de entrenamiento ni activos de simulador, por lo que no permite continuar el entrenamiento exacto solo con los pesos. El fichero `COMPLETE.json` es el recibo de exportación original e incluye `simulation_completed: false`; se conserva por integridad y no debe interpretarse como estado de evaluación actual.

## Capacidades

- Generación de acciones robóticas de efector final (ARX X5) para manipulación bimanual en entornos RoboDojo.
- Política visomotora: consume observaciones visuales y produce secuencias de acciones; predice 32 acciones y ejecuta 16 por paso.
- Integración con el adaptador XPolicyLab bajo `policy_name=bagel_robotics_1` y `ckpt_name=cp1000`.
- Mezcla temporal de acciones: 90 % de predicción nueva y 10 % de la anterior.
- Muestreo con diez pasos Euler y shift 1, en BF16.
- Soporte de reevaluación por tarea, suite y tres semillas mediante `REEVALUATION.md`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, matemáticas, código ni multimodalidad de texto general; el modelo está especializado en control robótico.
- Idiomas: únicamente inglés en los metadatos.

## Casos de uso

- Reevaluación reproducible en RoboDojo: el adaptador permite lanzar tareas y suites con tres semillas sobre el checkpoint exacto, lo que sirve para verificar resultados de la campaña de evaluación de Bagel-Robotics-1 con artefactos públicos y hashes fijados.
- Investigación en poda estructurada de políticas robóticas: al comparar este checkpoint (12,47 mil millones de parámetros) con su padre, se puede estudiar el efecto de recortar FFN y atención cruzada manteniendo autoatención y experto de acción.
- Reproducción de experimentos sin acceso al repositorio privado: el espejo público permite descargar sin token los seis ficheros del bundle y ejecutar el adaptador standalone, algo útil para laboratorios que no tienen acceso a la organización original.
- Validación de infraestructura de simulación: los cuatro episodios nativos válidos y las ocho comprobaciones exactas de acción/historial/reset/backend sobre las grabaciones probadas sirven como test de humo para verificar una instalación de RoboDojo y XPolicyLab.
- Integración en pipelines de evaluación comparativa: el manifiesto `artifact-manifest.json` fija los seis ficheros y los activos de encoder/tokenizer, lo que facilita la verificación de integridad en CI antes de lanzar campañas de benchmarks.
- Estudio de transferencia sim-a-real en manipulación bimanual: el uso de acciones ARX X5 de efector final y la configuración de ejecución fija (BF16, 32/16, diez pasos Euler) permiten replicar la configuración de cualificación en un RTX PRO 6000 Blackwell de 96 GB.
- Docencia y formación en políticas vídeo-predicción: el adaptador y la documentación de instalación (Python 3.10, PyTorch 2.11.0+cu130) ofrecen un caso completo de despliegue de un artefacto VPP2 no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona cualificación del adaptador (15 tests de CPU, dos transportes de depuración con checkpoint real, cuatro episodios nativos válidos de simulador y ocho comprobaciones exactas de acción/historial/reset/backend), pero no cifras de rendimiento en el leaderboard oficial. Los resultados históricos de investigación y las excepciones de escena están en `EVALUATION_RESULTS.md` del adaptador y, según el autor, no son resultados oficiales del leaderboard.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. La cualificación se realizó en una RTX PRO 6000 Blackwell de 96 GB; el autor indica que no se ha cualificado una capacidad mínima de GPU inferior.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) como configuración validada. Otras GPU (A100, H100, RTX 4090) no están cualificadas según la información disponible.
- Ajuste en GPU de consumo: no confirmado; el tamaño del checkpoint (29,0 GB de tensores más 16,7 GB de activos auxiliares) y la ausencia de cualificación por debajo de 96 GB hacen inviable asumirlo sin pruebas.
- Opciones de despliegue: adaptador standalone XPolicyLab (Python 3.10.21, PyTorch 2.11.0+cu130) sobre RoboDojo; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un checkpoint `AutoModel` de Transformers no son aplicables directamente.
- Latencia y throughput: no disponibles. El autor advierte que la reducción de parámetros no es una afirmación medida de aceleración en inferencia.
- Almacenamiento: prever espacio adicional para cachés e instalación, además de los 29,0 GB del bundle y los 16,7 GB de activos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bagel-Robotics-1 (cp1000, este espejo) | 12.468.409.664 (experto de vídeo) | no disponible | Sin resultados oficiales de leaderboard | no disponible | Público, descarga sin token |
| Bagel-Robotics-1 (padre, bageldotcom) | Aproximadamente 16,4 mil millones (implícito por la reducción del 23,95 %) | no disponible | no disponible | no disponible | Repositorio original privado |
| Bagel-Robotics-1-Preview | no disponible | no disponible | no disponible | no disponible | Público en Hugging Face; checkpoint de previsualización para evaluación bimanual EE16 en RoboDojo |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, disponibilidad y propósito declarado.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial. El aviso MIT/Apache-2.0 del código de inferencia no constituye una licencia global para pesos ni datasets, y siguen aplicando los términos upstream de VPP2 y Wan2.1.
- Modelo especializado en robótica: no es un LLM de propósito general ni un checkpoint `AutoModel` de Transformers; no admite los pipelines habituales de texto.
- Idiomas: solo inglés según los metadatos.
- Contexto: longitud no documentada; no apto para tareas que dependan de ventanas de contexto largas verificadas.
- Rendimiento no verificado: no hay resultados oficiales de leaderboard; los resultados históricos citados no son oficiales. La validación multi-semilla completa del leaderboard queda pendiente y separada.
- Cualificación de hardware limitada: solo se validó en una RTX PRO 6000 Blackwell de 96 GB; no se ha cualificado una GPU de menor capacidad.
- Reproducibilidad parcial: el release no incluye estado de entrenamiento (optimizador, scheduler, RNG/sampler, datasets, activos de simulador), por lo que no se puede continuar el entrenamiento exacto solo con los pesos.
- Estado del código: el PR de XPolicyLab no se ha creado y publicar este release de inferencia no implica aceptación por parte del comité. La etiqueta de origen `bagel-robotics-1-cp1000-inference-v1` no se copió en la duplicación.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser una política robótica, el riesgo relevante es de acciones incorrectas o inseguras en el entorno físico, no de texto.
- Fichero `COMPLETE.json`: contiene `simulation_completed: false` y rutas históricas de exportación; no debe usarse como afirmación del estado actual de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GnanaPraveen/Bagel-Robotics-1-Public
- Repositorio original (privado): https://huggingface.co/bageldotcom/Bagel-Robotics-1
- Checkpoint de previsualización: https://huggingface.co/bageldotcom/Bagel-Robotics-1-Preview
- VPP2 (arquitectura base): https://github.com/roboterax/video-prediction-policy-2
- XPolicyLab: https://github.com/XPolicyLab/XPolicyLab
- Guía de instalación de RoboDojo: https://robodojo-benchmark.com/doc/usage/install-and-download/
- Servidor MCP de Bagel Robotics (referencia externa): https://botmarket.bot/mcp/bagel-robotics
