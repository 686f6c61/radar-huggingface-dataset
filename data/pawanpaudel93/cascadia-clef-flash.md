# pawanpaudel93/cascadia-clef-flash

## Resumen

Cascadia-clef-flash es un artefacto de despliegue listo para servir, no un modelo entrenado desde cero. Se trata de un árbol de decisión de una sola etapa (1 stage) para el modelo Cloudflare/clef-flash, empaquetado en formato OpenVINO int8 y distribuido a través de la herramienta Cascadia. El autor, pawanpaudel93, ha exportado los pesos del fine-tune de Clef-flash sobre la representación intermedia int8 de Qwen3.5-9B de Intel, junto con la cabeza de decisión conjunta de Clef como modelo OpenVINO independiente bajo el directorio `decision/`.

El objetivo es permitir servir los endpoints `/v1/decisions` (formato OpenAI Decisions) y `/v1/systemone` sin necesidad de ejecutar el exportador manualmente. El paquete ocupa aproximadamente 11,5 GB y está pensado para ejecutarse en una única máquina, con soporte tanto para GPU como para CPU mediante OpenVINO GenAI 2026.4.1. La relevancia actual radica en que simplifica el despliegue de un modelo de decisión estructurada sobre una base Qwen3.5-9B cuantizada a int8, reduciendo la barrera técnica para integrar este tipo de capacidades en entornos de producción.

La licencia es Apache-2.0, heredada de todos los componentes de entrada (el fine-tune de Cloudflare, la IR int8 de Intel y el propio Qwen3.5-9B). No se añade entrenamiento nuevo: el repositorio redistribuye únicamente pesos convertidos. La información disponible sobre idiomas, pipeline y benchmarks es limitada, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con cabeza de decisión conjunta; empaquetado como árbol de decisión Cascadia de 1 etapa, 32 capas |
| Parametros totales | 9B (heredados de Qwen3.5-9B; no se especifica recuento exacto en la información disponible) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (OpenVINO IR) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (stage.xml/.bin), tokenizer.json, chat_template.jinja, decision/ como modelo OpenVINO |

## Arquitectura y entrenamiento

El paquete se construye sobre Qwen3.5-9B, un transformer de 9B parámetros, del que se toma la representación intermedia int8 generada por Intel (OpenVINO/Qwen3.5-9B-int8-ov). Sobre esa base se injertan los pesos completos del fine-tune de Cloudflare/clef-flash, y se añade la cabeza de esquema conjunta de Clef como un modelo OpenVINO separado dentro del directorio `decision/`. El resultado se organiza como un árbol de decisión Cascadia de una sola etapa con 32 capas, pensado para ejecutarse en una única máquina de aproximadamente 10,7 GB.

No se añade entrenamiento nuevo en este repositorio: la model card indica explícitamente que solo se redistribuyen pesos convertidos. La exportación se realizó con `tools/decision_export.py` de la rama `pawan/decisions-api` del repositorio labscommunity/cascadia (commit `94cfdf9b`, con salida sin cambios en el head del PR `db44d59d`). Los pesos son byte-idénticos a los de `pawanpaudel93/clef-flash-int8-ov-decision`. No se dispone de información sobre el dataset de entrenamiento original de Clef-flash, el número de tokens utilizados ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento sobre la base Qwen3.5-9B, en formato int8.
- Toma de decisiones estructuradas mediante el endpoint `/v1/decisions` en formato OpenAI Decisions.
- Servicio del endpoint `/v1/systemone` con paridad verificada frente a `/v1/decisions` (62/62 idénticos en las pruebas del autor).
- Cabeza de decisión conjunta (joint schema head) empaquetada como modelo OpenVINO independiente.
- Soporte de chat con plantilla (`chat_template.jinja`) y comportamiento determinista a temperatura 0 (verificado byte-idéntico antes y después de la ejecución de decisiones).
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling, function calling, agentes multi-paso, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Servicio de decisiones estructuradas en producción: el paquete permite levantar `/v1/decisions` directamente con `cascadia run` sin ejecutar el exportador, lo que acelera el despliegue de un endpoint compatible con el formato OpenAI Decisions en una sola máquina.
- Clasificación y enrutamiento determinista: gracias a la paridad byte-idéntica a temperatura 0 y a la cabeza de decisión, es adecuado para pipelines donde la reproducibilidad de la decisión es crítica (por ejemplo, enrutado de tickets o etiquetado automático).
- Despliegue en hardware de consumo o integrado: al ocupar unos 11,5 GB en int8 y funcionar en GPU (Arc 140V iGPU) y CPU con OpenVINO, encaja en estaciones de trabajo sin GPU dedicada de gran tamaño.
- Prototipado rápido de sistemas de decisión: investigadores pueden servir el árbol de 1 etapa en local para evaluar el comportamiento de Clef-flash sin gestionar conversiones int8 ni infraestructura adicional.
- Integración en entornos Windows con OpenVINO: la model card documenta funcionamiento en Windows 11 con OpenVINO GenAI 2026.4.1, lo que facilita su uso en estaciones de trabajo corporativas Windows.
- Evaluación de paridad y validación de exportaciones: sirve como referencia para comparar la salida int8 frente a la referencia fp32 (82/82 PASS, max |Δp| 0.0534), útil en procesos de control de calidad de conversiones.
- Servicio de chat y generación de texto junto con decisiones: el mismo árbol expone capacidades de chat (temperatura 0 verificada) además de los endpoints de decisión, permitiendo un único despliegue para ambas funciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta mediciones de paridad y consistencia en Intel Core Ultra 7 258V (Arc 140V iGPU, 32 GB), Windows 11, OpenVINO GenAI 2026.4.1, `--device GPU`:

| Comprobacion | Resultado |
|---|---|
| Paridad frente a referencia fp32 (50 registros / 82 preguntas) | 82/82 PASS, max |Δp| 0.0534 |
| `/v1/decisions` frente a `/v1/systemone` | 62/62 idénticos |
| Chat a temperatura 0 antes y después de la ejecución de decisiones | byte-idéntico |

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,5 GB en int8 para el árbol completo de 1 etapa (la model card indica unos 10,7 GB para una sola caja).
- GPU recomendadas: no se especifican modelos concretos; el autor valida funcionamiento en iGPU Intel Arc 140V (integrada en Core Ultra 7 258V) con 32 GB de memoria del sistema.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12 GB de VRAM para el árbol completo; en iGPU requiere memoria compartida suficiente (validado con 32 GB de sistema).
- Opciones de despliegue: Cascadia (`cascadia run ... --engine qwen35 --device GPU|CPU --api 127.0.0.1:8080`) sobre OpenVINO GenAI 2026.4.1. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cascadia-clef-flash (este) | 9B | no disponible | OpenVINO int8, arbol Cascadia 1 etapa | Apache-2.0 | Paquete de despliegue con cabeza de decisión |
| Cloudflare/clef-flash | no disponible | no disponible | safetensors (fine-tune) | Apache-2.0 | Fine-tune original; requiere exportación |
| OpenVINO/Qwen3.5-9B-int8-ov | 9B | no disponible | OpenVINO IR int8 | Apache-2.0 | Base int8 de Intel sin cabeza de decisión |
| pawanpaudel93/clef-flash-int8-ov-decision | 9B | no disponible | OpenVINO int8 | Apache-2.0 | Pesos byte-idénticos, árbol en la raíz del repo |

## Limitaciones y advertencias

- No es un modelo entrenado: redistribuye pesos convertidos; cualquier mejora o ajuste requiere acudir a Cloudflare/clef-flash o a Qwen3.5-9B.
- La información sobre sesgos, alucinación y comportamiento multilingüe no está documentada en la model card; deben evaluarse empíricamente antes de usarlo en producción.
- Requiere OpenVINO GenAI 2026.4.1: la versión 2026.4.0 presenta una violación de acceso en el plugin GPU bajo generaciones largas, según el autor.
- El árbol es de una sola etapa (1 stage, 32 capas); no se documentan variantes multi-etapa en este repositorio.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las licencias de los componentes upstream (Cloudflare/clef-flash, OpenVINO/Qwen3.5-9B-int8-ov, Qwen/Qwen3.5-9B) y conservar los avisos correspondientes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- No se especifican límites de contexto ni de idioma; el comportamiento fuera del caso de uso de decisiones y chat a temperatura 0 no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/pawanpaudel93/cascadia-clef-flash
- Pesos equivalentes: https://huggingface.co/pawanpaudel93/clef-flash-int8-ov-decision
- Modelo base (fine-tune): https://huggingface.co/Cloudflare/clef-flash
- Base int8 OpenVINO: https://huggingface.co/OpenVINO/Qwen3.5-9B-int8-ov
- Modelo original Qwen: https://huggingface.co/Qwen
- Repositorio Cascadia: https://github.com/labscommunity/cascadia
