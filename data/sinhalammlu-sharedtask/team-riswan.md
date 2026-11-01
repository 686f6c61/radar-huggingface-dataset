# SinhalaMMLU-SharedTask/team-riswan

## Resumen

Este repositorio no contiene un modelo entrenado, sino el paquete de reproducción de la participación del equipo **riswan** en la tarea compartida **SinhalaMMLU** del congreso ICTer 2026. Se trata de una *submission* de Codabench (#138) que preserva el archivo `submission_think_ens_v9_final.zip` junto con las predicciones (`predictions.jsonl`), el código de fusión por votación ponderada (`training/ensemble_v9.py`) y las herramientas de verificación. El pipeline no entrena ningún adaptador ni ajusta pesos: utiliza inferencia congelada sobre el modelo base `google/gemma-4-E4B-it`.

El sistema es un *ensemble* determinista de ocho pasadas de inferencia (dos baselines de cuatro ejemplos y seis pasadas con *thinking*), combinadas mediante una fusión ponderada dependiente de la dificultad de la pregunta. La precisión macro provisional reportada es de **64,2482** (Easy 65,2648, Medium 56,3456, Hard 71,134), si bien el propio autor advierte de que el ranking está pendiente de verificación por los organizadores y de que la inferencia fresca no ha demostrado reproducir la puntuación. La relevancia de este repositorio es, por tanto, metodológica: documenta con transparencia un flujo de trabajo multietapa y sus limitaciones de reproducibilidad.

El modelo subyacente, `gemma-4-E4B-it`, es una variante de la familia Gemma 4 de Google con licencia Apache 2.0. El recuento de parámetros reportado por Ollama es de **7.996.157.674** (aproximadamente 7,996B), desglosado en 7.518.069.290 parámetros del modelo principal y 478.088.384 del proyector. El contexto, los idiomas y los formatos de pesos del modelo base no se detallan en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `google/gemma-4-E4B-it`; el repositorio solo contiene el pipeline de inferencia y fusión) |
| Parametros totales | 7.996.157.674 (7.518.069.290 del modelo principal + 478.088.384 del proyector, según Ollama) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor advierte de no sustituir el modelo cuantizado por el BF16 upstream y asumir equivalencia) |
| Idiomas soportados | no disponible (la tarea evaluada es sinhala-inglés; el modelo base no declara idiomas en esta información) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el pipeline usa el tag de Ollama `gemma4:e4b`; no se incluye repositorio de pesos) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo ni adaptador: emplea inferencia congelada sobre `google/gemma-4-E4B-it`. La contribución técnica es un *ensemble* de ocho pasadas guardadas que combinan dos baselines de cuatro ejemplos (*few-shot*, no *zero-shot*) con seis pasadas en modo *thinking*. Las pasadas varían la ordenación de opciones (original, rotaciones +1, +2 y +3), el límite de tokens de salida (15, 260, 2048 y 4096), la temperatura (0 y 0,1 con top_p 0,95) y la inclusión de una instrucción adicional de terminología. Una pasada adicional se ejecutó en un Mac separado.

La fusión final es determinista y específica por dificultad: una votación ponderada implementada en `training/ensemble_v9.py`, con validación añadida. Los votos rotados se descartan cuando coincide la expresión regular de opción posicional y los empates se resuelven con `Counter.most_common`, es decir, gana la primera respuesta encontrada en el orden fijo de fuentes entre las empatadas; no es una mayoría simple sin ponderar. Las peticiones de generación archivadas no especifican semilla de Ollama, lo que limita la reproducibilidad exacta.

## Capacidades

- Respuesta a preguntas de opción múltiple sobre conocimiento general y cultural en sinhala (tarea SinhalaMMLU), con niveles de dificultad Easy, Medium y Hard.
- Razonamiento en cadena de pensamiento (*thinking mode*) con límites de tokens configurables entre 15 y 4096.
- Robustez posicional: el *ensemble* rota el orden de las opciones para mitigar el sesgo de posición en preguntas de opción múltiple.
- Ejecución local mediante Ollama, sin dependencia de API externa durante la inferencia.
- Verificación offline del resultado archivado: `verify_submission.py` comprueba hashes, identificadores únicos, rangos de respuesta y replay byte a byte.
- Reconstrucción de inferencia fresca mediante `inference.py`, con obtención del dataset desde Hugging Face o modo offline con `--local-data`.
- No se evidencia soporte de *tool calling*, agentes, visión, audio ni otras capacidades en la información proporcionada.

## Casos de uso

- **Evaluación de modelos en tareas de opción múltiple de bajo recurso:** el pipeline sirve como referencia metodológica para construir *ensembles* deterministas sobre modelos congelados, con scripts de fusión y verificación reproducibles.
- **Auditoría de envíos a competiciones (shared tasks):** el repositorio documenta hashes, recuentos de respuestas por pasada y advertencias de reproducibilidad, lo que permite a organizadores y revisores inspeccionar un envío sin ejecutar el modelo.
- **Investigación sobre sesgo posicional:** las rotaciones de opciones (+1, +2, +3) y la regla de descarte de votos rotados constituyen un experimento concreto sobre cómo afecta el orden de las alternativas a la precisión en MMLU multilingüe.
- **Despliegue local de evaluación con Ollama:** el flujo usa dos servidores Ollama con dos peticiones concurrentes por servidor sobre 2 × NVIDIA Tesla T4, un patrón replicable para laboratorios con hardware modesto.
- **Reproducción de resultados en entornos heterogéneos:** la combinación de pasadas en GPU T4 y en un Mac de 16 GB documenta cómo agregar votos de máquinas distintas en un único resultado determinista.
- **Docencia sobre reproducibilidad en IA:** el archivo `REPRODUCIBILITY.md` y el manifiesto `model_manifest.json` ejemplifican una divulgación honesta de las diferencias entre el sistema histórico y la plantilla de reproducción oficial.

## Benchmarks y rendimiento

| Nivel | Precisión macro provisional |
|---|---:|
| Easy | 65,2648 |
| Medium | 56,3456 |
| Hard | 71,134 |
| **Macro (global)** | **64,2482** |

Datos correspondientes al envío #138 de Codabench, según la captura del participante del 28 de octubre de 2026. El ranking está pendiente de verificación por los organizadores y la inferencia fresca no ha demostrado reproducir la puntuación. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- **Hardware histórico:** 2 × NVIDIA Tesla T4 (servidores Kaggle) ejecutando Ollama 0.40.12, con dos peticiones concurrentes por servidor, más un Apple Mac con 16 GB de memoria (chip exacto sin confirmar).
- **VRAM estimada:** no disponible; depende de la cuantización del tag `gemma4:e4b`, no especificada.
- **GPU consumer:** no confirmado; el modelo base de ~7,996B con cuantización de 4 bits podría caber en GPUs de 8-12 GB, pero no hay datos en la información proporcionada.
- **Opciones de despliegue:** Ollama (runtime efectivamente usado), con endpoints locales. No se documenta vLLM, llama.cpp ni TGI.
- **Latencia y throughput:** la pasada 4 tardó 106,4 minutos tras 700/719 intentos y la pasada 5, 105,6 minutos tras 700/719 intentos; cada pasada completa excedió su último tiempo de progreso impreso. El tiempo total de extremo a extremo no se registró y no se reclama ningún tiempo en A100.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de otros equipos ni de otros modelos en la tarea SinhalaMMLU, y el repositorio no contiene un modelo propio que comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Reproducibilidad no demostrada:** las ocho pasadas guardadas reproducen `predictions.jsonl` byte a byte, pero la inferencia fresca no ha demostrado reproducir la puntuación de 64,2482.
- **Incumplimiento potencial de reglas:** la guía de la plantilla oficial (sin muestreo y solo Hugging Face) difiere del sistema histórico, que usó el instalador y registro de Ollama; el paquete no certifica el cumplimiento de las normas.
- **Ausencia de semilla:** las peticiones de generación archivadas no especifican semilla de Ollama, lo que impide garantizar determinismo en una reejecución.
- **Tag móvil:** `gemma4:e4b` es un tag de Ollama en movimiento, no una revisión inmutable del modelo; los resultados pueden variar si el tag se actualiza.
- **Sin modelo entrenado:** no hay adaptador ni pesos ajustados; cualquier mejora atribuible al equipo proviene exclusivamente de la estrategia de *ensemble* y de los ejemplos *few-shot*.
- **Sesgo posicional mitigado pero no eliminado:** las rotaciones y la regla de descarte reducen, pero no garantizan la neutralidad ante el orden de opciones.
- **Idioma y dominio acotados:** la evaluación se limita a sinhala en formato de opción múltiple; no hay evidencia de rendimiento en otros idiomas o tareas abiertas.
- **Licencia:** Apache 2.0 permite uso comercial del paquete, pero el modelo base `gemma-4-E4B-it` tiene su propia licencia (el autor indica Apache 2.0) que debe verificarse por separado.
- **Advertencia de cuantización:** no debe sustituirse el modelo cuantizado por el BF16 upstream asumiendo equivalencia, según el propio autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SinhalaMMLU-SharedTask/team-riswan
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo en Ollama: https://ollama.com/library/gemma4:e4b
- Dataset de la competición: https://huggingface.co/datasets/SinhalaMMLU-SharedTask/Sinhala-MMLU-SharedTask-Test-Dataset
- Sitio web de la tarea: https://sinhalammlu.ucsc.cmb.ac.lk/
- Reglas de la competición: https://sinhalammlu.ucsc.cmb.ac.lk/rules.html
