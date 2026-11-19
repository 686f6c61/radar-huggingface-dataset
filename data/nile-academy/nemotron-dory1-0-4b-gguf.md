# nile-academy/nemotron-dory1.0-4b-gguf

## Resumen

Dory1.0-4B es un modelo de lenguaje de NVIDIA Corporation, publicado originalmente el 16 de octubre de 2026 bajo la referencia `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`. Esta ficha describe la réplica en formato GGUF publicada por nile-academy, que distribuye una cuantización Q5_K_M oficial de NVIDIA (3,673 GB) junto con el checkpoint BF16 original completo (7.950.515.472 bytes, 507 tensores). No se ha realizado entrenamiento adicional: se trata de un espejo de artefactos con conversión de formato registrada.

El modelo tiene 3.975.229.440 parámetros totales, incluyendo embeddings y las modalidades de origen del checkpoint, y se distribuye con licencia OpenMDW 1.1. Su rasgo técnico más distintivo es una arquitectura recurrente con bucles: el checkpoint original emplea dos bucles recurrentes, mientras que el GGUF Q5 publicado por NVIDIA codifica cuatro. Esta discrepancia obliga a usar un motor de inferencia compilado compatible con el perfil concreto de bucles, algo que la model card subraya explícitamente.

La relevancia de esta réplica es doble: por un lado, ofrece un artefacto GGUF listo para llama.cpp con un tamaño que puede caber en GPU de consumo; por otro, preserva el checkpoint BF16 íntegro con paridad tensor a tensor verificada, lo que permite reproducir la inferencia en precisión original. La model card advierte de que la cuantización no ha sido cualificada por Wekala y que los benchmarks publicados corresponden al modelo fuente, no a estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con bucles (2 bucles en el checkpoint original, 4 en el GGUF Q5 de NVIDIA) |
| Parametros totales | 3.975.229.440 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (GGUF oficial de NVIDIA); BF16 (checkpoint original) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

La información disponible confirma que Dory1.0-4B emplea una arquitectura recurrente con bucles, no un transformer convencional de profundidad fija. El checkpoint original ejecuta dos bucles recurrentes sobre el mismo bloque de parámetros, mientras que la exportación Q5_K_M publicada por NVIDIA codifica cuatro bucles; esta diferencia implica que el número de bucles forma parte del perfil de ejecución y debe coincidir con el soporte del motor compilado. La conversión a GGUF de la réplica BF16 se realizó con la revisión de desarrollo de llama.cpp documentada por NVIDIA (`98a74c97ea09ac72f6ceda1559808fc0a2f447ce`), adaptando únicamente un config declarativo derivado a los nombres de campo heredados de ese port. La paridad de nombres, formas y valores de bytes se verificó para los 507 tensores con almacenamiento BF16.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card tampoco detalla innovaciones adicionales como decodificación especulativa o atención lineal. El dato relevante para producción es que el modelo requiere un motor con soporte de inferencia recurrente: los resultados publicados no cualifican la cuantización y la réplica no incluye un perfil compilado del motor Dory.

## Capacidades

- Generación de texto conversacional, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Razonamiento de nivel científico: la model card reporta GPQA Diamond con 72,41 % en el protocolo del publicador.
- Ingeniería de software: SWE-bench Verified con 59,5 % y Terminal-Bench 2.1 con 18,1 %, ambos con 2 bucles y arnés del publicador.
- Soporte de tool calling y plantillas de chat: la model card menciona chat, tool y template como componentes pendientes de cualificación en el runtime Wekala, lo que confirma que el modelo fuente los contempla.
- Capacidades multilingües y de árabe: la model card cita tareas multilingües y en árabe entre las evaluaciones previstas, aunque no publica resultados.
- Modo de razonamiento con bucles: el número de bucles recurrentes actúa como parámetro de cómputo en inferencia (2 o 4 según el fichero).

## Casos de uso

- Razonamiento científico asistido: con un 72,41 % en GPQA Diamond, el modelo es adecuado para responder preguntas de nivel posgrado en física, química y biología dentro de un asistente de investigación, siempre que se ejecute con el perfil de bucles correcto.
- Reparación de incidencias en repositorios: el 59,5 % en SWE-bench Verified lo sitúa como candidato para agentes que leen un issue, localizan el fichero afectado y proponen un parche, integrándolo en un pipeline de CI que valide el diff antes de abrir el pull request.
- Automatización de terminal y tareas de sistema: el 18,1 % en Terminal-Bench 2.1 permite usarlo en agentes que ejecutan comandos de shell encadenados, con la advertencia de que las llamadas a herramientas son propuestas sujetas a la admisión y permisos de la aplicación consumidora.
- Despliegue en estación de trabajo con GPU de consumo: la cuantización Q5_K_M de 3,673 GB permite cargar el modelo en llama.cpp sobre una GPU con 8 GB de VRAM, dejando margen para el estado de contexto y los buffers, aunque la model card exige un perfil medido de operación sostenida en 8 GB.
- Evaluación comparativa de cuantizaciones: al incluir tanto el BF16 original como el Q5_K_M en el mismo repositorio, sirve para campañas de evaluación emparejada referencia/variante en tareas de instrucción, conocimiento, matemáticas, multilingüe y herramientas.
- Investigación sobre arquitecturas recurrentes: el checkpoint BF16 con paridad tensor a tensor verificada permite reproducir experimentos sobre bucles recurrentes y comparar el efecto de 2 frente a 4 bucles en la calidad de salida.
- Asistente conversacional multi-turno autoalojado: la licencia OpenMDW 1.1 y el formato GGUF facilitan su integración en servicios internos sin dependencia de API externa, con la salvedad de que la longitud de contexto no está documentada.

## Benchmarks y rendimiento

Resultados reportados por el publicador sobre el modelo fuente. No son mediciones de Wekala sobre estos ficheros cuantizados, no están normalizados entre modelos y corresponden a 2 bucles.

| Benchmark | Resultado (%) | Modo |
|---|---:|---|
| GPQA Diamond | 72,41 | 2 bucles, protocolo del publicador |
| SWE-bench Verified | 59,5 | 2 bucles, arnés del publicador |
| Terminal-Bench 2.1 | 18,1 | 2 bucles, arnés del publicador |

No se han publicado resultados de latencia ni throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,7 GB para los pesos Q5_K_M, más el estado de contexto, buffers de scratch y margen del driver, que la model card excluye explícitamente del tamaño del fichero.
- VRAM para BF16: el checkpoint original ocupa 7.950.515.472 bytes en disco; el uso real en memoria es superior y no equivale al tamaño del fichero.
- GPU de consumo: la model card indica que la operación sostenida en 8 GB de VRAM requiere un perfil medido propio; no se confirma compatibilidad con GPU de gama baja ni con móvil o navegador.
- GPU de centro de datos: no se especifican modelos recomendados (A100, H100, RTX 4090) en la información disponible.
- Despliegue: llama.cpp con soporte de inferencia recurrente; la conversión cita la revisión `98a74c97ea09ac72f6ceda1559808fc0a2f447ce`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos alternativos de la misma categoría ni datos comparables de parámetros, contexto o licencia.

## Limitaciones y advertencias

- La cuantización Q5_K_M no ha sido cualificada por Wekala; no se hace ninguna afirmación de "sin pérdida significativa de calidad" y se exige evaluación emparejada referencia/variante antes de recomendarla.
- Los benchmarks publicados corresponden al modelo fuente con 2 bucles; el GGUF Q5 de NVIDIA codifica 4 bucles, por lo que los resultados no son directamente trasladables a ese fichero.
- El modelo requiere un motor compilado compatible con el perfil de bucles; sin él, la inferencia recurrente no funciona correctamente.
- Riesgo de alucinación y de salidas incorrectas o inseguras, reconocido explícitamente en la model card.
- Las llamadas a herramientas son propuestas que la aplicación consumidora debe admitir y limitar según sus permisos.
- Idiomas soportados y longitud de contexto no documentados, lo que impide garantizar cobertura multilingüe o conversaciones largas.
- La licencia OpenMDW 1.1 rige los pesos; el repositorio no concede derechos sobre el SDK de Wekala. Conviene revisar los términos de OpenMDW 1.1 antes de un uso comercial.
- La model card no ofrece datos sobre sesgos conocidos ni sobre el proceso de alineación del modelo fuente.

## Enlaces

- Repositorio Hugging Face de la réplica: https://huggingface.co/nile-academy/nemotron-dory1.0-4b-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Revisión fijada del modelo original: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16/blob/b366b87f762ea334ba3eb55912031baba1515810/README.md
- Checkpoint BF16 preservado: https://huggingface.co/nile-academy/nemotron-dory1.0-4b-gguf/tree/main/original/b366b87f762ea334ba3eb55912031baba1515810
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
