# FreakinFrick/aegyptus-librarian-e2b-litert-lm

## Resumen

Aegyptus Librarian es un ajuste fino del modelo Gemma 4 E2B-it de Google, desarrollado por el usuario FreakinFrick para la funcionalidad "Ask the Librarian" del sitio aegyptuslab.cc. Se trata de un modelo de 2B parámetros especializado en responder preguntas sobre textos del antiguo Egipto exclusivamente a partir de pasajes que la propia página le proporciona, actuando como un componente de recuperación aumentada (RAG) más que como una fuente de conocimiento autónoma. El modelo se distribuye en formato LiteRT-LM para ejecutarse en el navegador del visitante mediante WebGPU, sin necesidad de infraestructura de servidor.

La relevancia de este modelo reside en su enfoque de despliegue: un ajuste fino con DPO (Direct Preference Optimization) sobre el cuantizador int4 exacto que se usará en producción, exportado como un único archivo `model.litertlm` de 2,84 GB. Esto permite que un modelo de lenguaje con capacidades de citación verificable se ejecute íntegramente en el cliente, un patrón cada vez más habitual para aplicaciones de nicho con requisitos de privacidad o de coste de inferencia.

El modelo está disponible bajo licencia Apache-2.0, heredada del modelo base, y solo soporta inglés. Su evaluación se centra en métricas de fidelidad de citas y ausencia de identificadores inventados, no en benchmarks académicos convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E2B-it); no se detalla la arquitectura interna del modelo base |
| Parametros totales | 2B (según el nombre del modelo base, "E2B") |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 block-32 (`dynamic_wi4b32_afp32`) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.litertlm` (LiteRT-LM); archivo único de 2,84 GB |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo de texto de 2B parámetros. Sobre esta base se aplicó un ajuste fino mediante DPO (Direct Preference Optimization) con un ancla SFT (supervised fine-tuning), realizado a través del mismo cuantizador int4 que se emplearía en la exportación final. Posteriormente se exportó con `litert-torch` a formato block-32 int4 (`dynamic_wi4b32_afp32`), generando un único archivo `model.litertlm` de 2,84 GB. El entrenamiento y las pruebas se realizaron con el prompt de sistema `librarian-prompt.md`, que se incluye en el repositorio y que define la persona del "bibliotecario".

La innovación técnica principal no está en la arquitectura del modelo, sino en el pipeline de cuantización y despliegue: el ajuste se hace sobre la representación cuantizada que se usará en producción, evitando la discrepancia entre entrenamiento y despliegue. El modelo está diseñado para ejecutarse en el navegador mediante WebGPU a través de la librería `@litert-lm/core`, que gestiona prompt, decodificación, caché KV, decodificación especulativa y tool calling sobre el runtime LiteRT. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto en inglés orientada a preguntas y respuestas sobre textos del antiguo Egipto.
- Citación de pasajes: el modelo recibe hasta seis pasajes etiquetados `[P1]`..`[P6]` y debe responder citando únicamente esos pasajes.
- Manejo de casos límite: pasajes ausentes, estantería vacía, identificadores de volumen inventados o etiquetas inexistentes, y preguntas fuera de tema.
- Encuadre ontológico: respuestas que citan frases de los pasajes con un grado de fidelidad medido (97,8% en la evaluación held-out).
- Ejecución en navegador mediante WebGPU con la librería `@litert-lm/core`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Búsqueda con citación en corpus de egiptología: la página recupera pasajes del corpus, los etiqueta y el modelo responde citando únicamente esos pasajes; es el caso de uso principal y para el que fue entrenado.
- Asistente de consulta en archivos digitales: integrado en una interfaz de búsqueda, el modelo puede responder preguntas de visitantes sobre textos antiguos sin que el usuario tenga que leer los pasajes completos, manteniendo la trazabilidad de la cita.
- Verificación de referencias bibliográficas: el modelo está entrenado para no inventar identificadores de volumen ni etiquetas, lo que lo hace adecuado para tareas donde una cita falsa tendría consecuencias.
- Despliegue sin servidor en aplicaciones educativas: al ejecutarse en el navegador con WebGPU, permite ofrecer un asistente de consulta sin coste de inferencia en servidor y sin enviar las consultas del usuario a un backend.
- Prototipado de asistentes RAG de nicho: sirve como ejemplo de pipeline completo (recuperación, etiquetado de pasajes, prompt de sistema, cuantización int4 y exportación LiteRT-LM) replicable en otros dominios.
- Evaluación de fidelidad de citas: el modelo y su conjunto de pruebas (64 probes con familias de casos) pueden usarse como referencia para medir la tasa de citas soportadas por los pasajes en sistemas RAG.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Held-out (64 probes x 6 muestras), LiteRT-LM CPU, frente al mismo export sin ajustar | hard auditado 94,8% (sin ajustar 94,3%); frases citadas soportadas en respuestas ontológicas 97,8% (sin ajustar 88,5%; diferencia pareada +9,3, IC 95% +2,9 a +17,6) |
| Dev (64 probes, greedy) a través de la página web, Chromium WebGPU | hard 62/64 (mismo archivo en CPU: 61/64) |
| Held-out fresco (64 probes x 6 muestras) a través de la página web, Chromium WebGPU | hard auditado 369/384 = 96,1%; 0 identificadores de volumen inventados; frases citadas soportadas en respuestas ontológicas 93% (IC 95% 86-100%); 89,8% de las respuestas tienen una frase en palabras del propio bibliotecario |

La fidelidad ("supported") se juzga por frase citada mediante un clasificador automático que solo ve los pasajes citados. No se han publicado resultados de benchmarks académicos convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 2,84 GB en int4 block-32; la inferencia en navegador requiere una GPU con soporte WebGPU y memoria suficiente para el modelo y la caché KV (no se especifica la VRAM exacta necesaria).
- GPU recomendadas: no disponible; el modelo está pensado para ejecutarse en el navegador del visitante mediante WebGPU, por lo que la GPU es la del cliente.
- Compatibilidad con GPU de consumo: sí, siempre que el navegador y la GPU soporten WebGPU; no se detallan modelos concretos.
- Opciones de despliegue: LiteRT-LM mediante `@litert-lm/core` en el navegador (WebGPU) o en CPU; el archivo `model.litertlm` es específico de este runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aegyptus Librarian (Gemma 4 E2B) | 2B | no disponible | Apache-2.0 | LiteRT-LM int4 | Ajuste DPO para citación en egiptología; ejecución en navegador |
| google/gemma-4-E2B-it (base) | 2B | no disponible | Apache-2.0 | safetensors y otros | Modelo base sin ajuste; no especializado en citación |
| Gemma 4 E2B sin ajustar exportado a LiteRT-LM | 2B | no disponible | Apache-2.0 | LiteRT-LM int4 | Referencia de la evaluación; hard 94,3% frente a 94,8% del ajustado |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no es una fuente de conocimiento autónoma: fuera del setup de pasajes etiquetados, es un modelo de 2B con una persona y "inventará cosas como cualquier otro", según el autor.
- Solo soporta inglés; no se documentan capacidades multilingües.
- La longitud de contexto no está especificada; el diseño asume hasta seis pasajes etiquetados.
- Los resultados de evaluación son específicos del conjunto de pruebas del autor (64 probes con familias definidas) y no equivalen a benchmarks generales.
- La licencia Apache-2.0 permite uso comercial, pero se trata de una versión modificada de Gemma 4 E2B; debe consultarse el archivo `NOTICE` del repositorio.
- El formato `model.litertlm` es específico de LiteRT-LM; no es directamente compatible con vLLM, llama.cpp, Ollama o TGI.
- Riesgo de alucinación en identificadores de volumen y etiquetas fuera del setup controlado, aunque el entrenamiento busca minimizarlo (0 identificadores inventados en la evaluación held-out fresca).
- No se documentan sesgos conocidos ni limitaciones adicionales en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FreakinFrick/aegyptus-librarian-e2b-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Aplicación "Ask the Librarian": https://aegyptuslab.cc/stacks/search
- Librería `@litert-lm/core`: https://www.npmjs.com/package/@litert-lm/core
- Documentación de LiteRT-LM para Gemma: https://gemma.ai/deployment/litert/
- Artículo sobre LiteRT-LM: https://ai-tldr.dev/tools/litert-lm/
