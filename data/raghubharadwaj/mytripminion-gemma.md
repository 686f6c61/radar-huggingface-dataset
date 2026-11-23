# raghubharadwaj/mytripminion-gemma

## Resumen

MyTripMinion-Gemma es un artefacto de despliegue publicado por el usuario raghubharadwaj que empaqueta el modelo Gemma 3 1B IT de Google en formato LiteRT/MediaPipe (`.task`) junto con el runtime web de Google AI Edge MediaPipe 0.10.30. No se trata de un modelo entrenado o ajustado: la model card indica explícitamente que es "una copia sin modificar" de `gemma3-1b-it-int4-web.task` procedente de `litert-community/Gemma3-1B-IT`. Su función es permitir que la aplicación My Trip Minion descargue el modelo con un solo toque y lo ejecute localmente en el dispositivo del usuario mediante WebGPU.

El modelo subyacente es Gemma 3 1B IT, la variante instruct de 1.000 millones de parámetros de la familia Gemma 3 de Google, cuantizada a INT4 para inferencia en el navegador. La relevancia de este repositorio es operativa más que algorítmica: demuestra un patrón de distribución de LLM on-device en aplicaciones web, con el runtime y los pesos empaquetados en un único artefacto de 0,7 GB.

El repositorio no aporta documentación técnica sobre arquitectura, datos de entrenamiento ni evaluación; toda la información sustantiva del modelo debe referenciarse a la ficha oficial de Gemma 3 1B IT y al repositorio `litert-community/Gemma3-1B-IT`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), según modelo base; detalles no disponibles en este repositorio |
| Parametros totales | 1B (modelo base `google/gemma-3-1b-it`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en este repositorio |
| Tipos de cuantizacion | INT4 (artefacto `gemma3-1b-it-int4-web.task`) |
| Idiomas soportados | no disponibles |
| Licencia | Gemma Terms of Use (identificador `gemma`) |
| Formato de pesos | LiteRT / MediaPipe `.task` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica el modelo. Contiene una copia byte a byte de `gemma3-1b-it-int4-web.task` del repositorio `litert-community/Gemma3-1B-IT`, junto con el runtime MediaPipe web 0.10.30. El artefacto `.task` es un contenedor LiteRT que incluye los pesos cuantizados a INT4 y el grafo de ejecución optimizado para el runtime de Google AI Edge, con soporte de aceleración vía WebGPU en el navegador.

La arquitectura, los datos de entrenamiento, el proceso de alineación (RLHF/DPO) y las innovaciones técnicas corresponden al modelo base Gemma 3 1B IT de Google, no documentados en este repositorio. Cualquier afirmación sobre composición del dataset o número de tokens de entrenamiento debe consultarse en la documentación oficial de Gemma 3; aquí no está disponible.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas de Gemma 3 1B IT (modo instruct).
- Ejecución on-device en navegador mediante MediaPipe y WebGPU, sin envío de datos a servidores externos.
- Distribución como artefacto único descargable con un toque desde la aplicación cliente.
- Capacidades específicas de tool calling, agentes, visión, audio, matemáticas o código: no documentadas en este repositorio; dependen del modelo base y deben verificarse en su ficha oficial.

## Casos de uso

- Asistente de viaje embebido en aplicación web: la app My Trip Minion descarga el artefacto de 0,7 GB y ejecuta el modelo en el dispositivo del usuario para responder consultas de viaje sin backend propio.
- Procesamiento privado de consultas sensibles: al ejecutarse localmente vía WebGPU, los prompts y respuestas no salen del navegador, lo que resulta adecuado para datos personales de itinerarios.
- Prototipado de LLM on-device en web: sirve como referencia reproducible para equipos que quieran validar el patrón MediaPipe + LiteRT + WebGPU con un modelo instruct de 1B.
- Funcionalidad offline parcial: una vez descargado el artefacto, la inferencia no requiere conectividad, útil en escenarios de conectividad intermitente durante viajes.
- Generación de texto auxiliar de baja latencia en cliente: resúmenes de itinerarios, respuestas a preguntas frecuentes o reformulación de texto sin coste de API.
- Distribución de modelos en productos consumer: el empaquetado con runtime incluido simplifica la integración en apps que no quieren gestionar dependencias de inferencia por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el artefacto ocupa 0,7 GB en disco y la cuantización INT4 sugiere una huella de memoria en el rango de 1 GB o inferior, aunque no se confirma en la documentación.
- GPU recomendadas: no disponibles. El runtime requiere WebGPU, por lo que la compatibilidad depende del navegador y de la GPU del dispositivo cliente.
- Compatibilidad con GPU consumer: no confirmada en este repositorio; depende del soporte WebGPU del navegador y del hardware del usuario.
- Opciones de despliegue: MediaPipe web runtime 0.10.30 (incluido); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este formato `.task`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MyTripMinion-Gemma (este repo) | 1B | no disponible | LiteRT/MediaPipe `.task` INT4 | Gemma Terms of Use | Hugging Face, 0 descargas |
| google/gemma-3-1b-it | 1B | no disponible en esta ficha | safetensors (modelo original) | Gemma Terms of Use | Hugging Face, modelo oficial |
| litert-community/Gemma3-1B-IT | 1B | no disponible en esta ficha | LiteRT `.task` | Gemma Terms of Use | Hugging Face, origen del artefacto |

La comparativa se limita a variantes del mismo modelo base porque el repositorio no documenta métricas que permitan contrastarlo con alternativas de otros proveedores.

## Limitaciones y advertencias

- No es un modelo nuevo ni ajustado: es una copia del artefacto de `litert-community/Gemma3-1B-IT`; no debe citarse como contribución técnica propia.
- Sin benchmarks, sin documentación de idiomas y sin ficha de arquitectura en este repositorio; la evaluación debe hacerse sobre el modelo base.
- Licencia Gemma Terms of Use y Gemma Prohibited Use Policy: el uso comercial y la redistribución están sujetos a dichos términos, que deben revisarse antes de producción.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (23 de noviembre de 2026): madurez y mantenimiento no verificables.
- Dependencia de WebGPU: la inferencia fallará o degradará en navegadores o dispositivos sin soporte adecuado.
- Tamaño de descarga de 0,7 GB en cliente: impacto relevante en usuarios con conexiones limitadas o planes de datos restringidos.
- Riesgo de alucinación inherente a un modelo de 1B parámetros; no apto para tareas que exijan alta fiabilidad factual sin verificación.
- Ausencia de información sobre sesgos, contexto máximo efectivo y comportamiento multilingüe en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/raghubharadwaj/mytripminion-gemma
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Origen del artefacto LiteRT: https://huggingface.co/litert-community/Gemma3-1B-IT
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
