# pawanpaudel93/clef-flash-int8-ov-decision

## Resumen

Clef-flash-int8-ov-decision es un artefacto de despliegue, no un modelo entrenado desde cero: empaqueta los pesos del fine-tune Cloudflare/clef-flash dentro de la representación intermedia (IR) int8 de OpenVINO de Qwen3.5-9B, junto con la cabeza de esquema conjunta de Clef convertida a modelo OpenVINO en el subdirectorio `decision/`. El resultado es un árbol de decisión de una sola etapa listo para servir con Cascadia, el runtime del proyecto labscommunity, que expone endpoints compatibles con el formato OpenAI Decisions (`/v1/decisions`) y `/v1/systemone`.

El modelo subyacente es Qwen3.5-9B, un transformer de 9.000 millones de parámetros con licencia Apache-2.0, sobre el que Cloudflare aplicó un fine-tune orientado a la emisión de decisiones estructuradas. La conversión a int8 vía OpenVINO reduce el peso del artefacto a unos 11,5 GB de repositorio y permite ejecución en GPU integrada (se validó en una Arc 140V) o en CPU, sin necesidad de GPUs dedicadas de centro de datos.

Su relevancia es práctica: elimina el paso de exportación manual que de otro modo tendría que ejecutar cualquiera que quisiera servir Clef-flash en hardware Intel. El autor publica además mediciones de paridad frente a la referencia fp32 (82/82 PASS, delta máximo de probabilidad 0,0534), lo que da una idea del coste de la cuantización en la salida de decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B) con cabeza de decisión de Clef; artefacto en IR de OpenVINO int8 |
| Parametros totales | 9.000 millones (modelo base Qwen3.5-9B); no disponible el desglose exacto del fine-tune |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (IR de OpenVINO); no se documentan otras variantes en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | IR de OpenVINO (modelo OpenVINO int8 + submodelo `decision/`); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena nada: redistribuye pesos convertidos. La receta documentada consiste en tomar la IR int8 de Qwen3.5-9B publicada por OpenVINO, sustituir en ella los pesos del fine-tune Cloudflare/clef-flash y exportar la cabeza de esquema conjunta de Clef como modelo OpenVINO independiente bajo `decision/`. La exportación se realizó con `tools/decision_export.py` de la rama `pawan/decisions-api` del repositorio Cascadia (commit `94cfdf9b`), con salida sin cambios en el head del PR `db44d59d`.

El resultado es un árbol de decisión de una sola etapa, el valor por defecto del exportador, pensado para ejecutarse en una única máquina de aproximadamente 10,7 GB. No se documentan en la información disponible el número de tokens de entrenamiento del fine-tune original, la composición del dataset ni si hubo RLHF o DPO; esos detalles corresponderían a la model card de Cloudflare/clef-flash. La innovación técnica destacable aquí es la integración de una cabeza de decisión estructurada dentro de un runtime de inferencia (Cascadia) sobre OpenVINO GenAI, con paridad verificada frente a la referencia fp32.

## Capacidades

- Generación de texto y chat multi-turno heredados de Qwen3.5-9B, servidos a través del motor `qwen35` de Cascadia.
- Emisión de decisiones en formato OpenAI Decisions mediante `/v1/decisions`.
- Endpoint `/v1/systemone` para el flujo de decisión de una sola etapa incluido en el árbol.
- Ejecución determinista verificada: una conversación a temperatura 0 produce salida byte a byte idéntica antes y después de ejecutar el flujo de decisión.
- Despliegue en GPU integrada Intel (validado en Arc 140V) y en CPU con los mismos ficheros (`--device CPU`).
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking específicas de este artefacto.

## Casos de uso

- Clasificación y enrutamiento de solicitudes: el endpoint `/v1/decisions` devuelve decisiones estructuradas en el formato de OpenAI, adecuado para triaje de tickets o enrutado a colas especializadas dentro de una aplicación existente.
- Despliegue en equipos de sobremesa o portátiles con GPU integrada Intel: al ejecutarse en una Arc 140V con 32 GB de RAM, permite prototipar y servir el modelo sin alquilar GPU en la nube.
- Evaluación de Clef-flash sin pipeline de exportación: al venir los pesos ya convertidos, un equipo puede medir el comportamiento del fine-tune en su propio hardware en minutos, siguiendo los dos comandos de la model card.
- Servicio de decisiones en entornos con requisitos de coste energético: la inferencia int8 en iGPU o CPU reduce el consumo frente a alternativas en fp16 sobre GPU dedicada.
- Pruebas de regresión de calidad tras cuantización: las mediciones de paridad publicadas sirven como plantilla para validar que una conversión int8 no altera las decisiones en un dominio concreto.
- Backend de agentes con paso de decisión explícito: integrado en Cascadia, el árbol puede actuar como la etapa que decide la siguiente acción antes de invocar el modelo generativo, siempre que el flujo encaje en una sola etapa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye mediciones de paridad y corrección funcional en hardware concreto:

| Comprobacion | Resultado |
|---|---|
| Paridad frente a referencia fp32 (50 registros / 82 preguntas) | 82/82 PASS, max |Δp| 0,0534 |
| `/v1/decisions` frente a `/v1/systemone` | 62/62 idénticos |
| Chat a temperatura 0 antes y después del flujo de decisión | byte-idéntico |

Entorno de medición: Intel Core Ultra 7 258V (Arc 140V iGPU, 32 GB), Windows 11, OpenVINO GenAI 2026.4.1, `--device GPU`, Cascadia en `db44d59d`.

## Requisitos de hardware

- VRAM/RAM estimada: alrededor de 10,7 GB para el árbol de una etapa; el repositorio ocupa 11,5 GB en disco.
- GPU validadas: Intel Arc 140V integrada (Core Ultra 7 258V). No se documentan pruebas en A100, H100 ni RTX 4090.
- CPU: soportada con `--device CPU` usando los mismos ficheros, sin cifras de latencia publicadas.
- Cabe en equipos consumer con GPU integrada Intel reciente y 32 GB de memoria del sistema; no requiere GPU dedicada según las mediciones del autor.
- Despliegue: Cascadia (`cascadia run ... --engine qwen35 --device GPU --api 127.0.0.1:8080`) sobre OpenVINO GenAI 2026.4.1. La versión 2026.4.0 presenta una violación de acceso en el plugin de GPU en generaciones largas y debe evitarse.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| clef-flash-int8-ov-decision | 9.000 M (base Qwen3.5-9B) | no disponible | IR OpenVINO int8 | Apache-2.0 | Artefacto listo para servir con Cascadia; paridad fp32 verificada |
| Cloudflare/clef-flash | no disponible | no disponible | no disponible | Apache-2.0 | Fine-tune original; requiere exportación propia para servir en OpenVINO |
| OpenVINO/Qwen3.5-9B-int8-ov | 9.000 M | no disponible | IR OpenVINO int8 | Apache-2.0 | Base cuantizada de Intel sin la cabeza de decisión de Clef |
| Qwen/Qwen3.5-9B | 9.000 M | no disponible | safetensors (previsiblemente) | Apache-2.0 | Modelo base sin fine-tune de decisiones |

## Limitaciones y advertencias

- Es un artefacto de conversión, no un modelo nuevo: cualquier limitación de Clef-flash o de Qwen3.5-9B se hereda sin cambios.
- La cuantización int8 introduce desviaciones medibles en las probabilidades de decisión (máximo 0,0534 en la prueba publicada); en dominios sensibles a umbrales estrictos conviene revalidar.
- Solo se ha validado en una GPU integrada Intel concreta; el rendimiento en otras GPU o en CPU no está cuantificado.
- Dependencia estricta de la versión de OpenVINO GenAI (2026.4.1); la 2026.4.0 falla en GPU con generaciones largas.
- El árbol es de una sola etapa; flujos de decisión multi-etapa requerirían otra exportación.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar también las condiciones de los componentes upstream (Cloudflare, Intel, Qwen) y del runtime Cascadia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pawanpaudel93/clef-flash-int8-ov-decision
- Modelo base fine-tuneado: https://huggingface.co/Cloudflare/clef-flash
- IR int8 de referencia: https://huggingface.co/OpenVINO/Qwen3.5-9B-int8-ov
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime Cascadia: https://github.com/labscommunity/cascadia
- Documentación de la API de decisiones: `docs/decisions.md` en el repositorio de Cascadia
