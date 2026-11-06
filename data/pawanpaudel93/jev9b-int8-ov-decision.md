# pawanpaudel93/jev9b-int8-ov-decision

## Resumen

JEV-9B decision tree (OpenVINO int8, 1 stage) es un artefacto de despliegue listo para usar, publicado por el usuario pawanpaudel93, que empaqueta el árbol de decisión de Cascadia para el modelo ajustado autotrust/JEV-9B. No se trata de un modelo entrenado desde cero, sino de una conversión: el verbalizador LoRA de JEV-9B se injerta sobre el IR int8 oficial de Intel de Qwen3.5-9B (201 ramas LoRA) y la cabeza de decisión lee los logits de los tokens del verbalizador. El resultado permite servir los endpoints `/v1/decisions` (formato OpenAI Decisions) y `/v1/systemone` sin ejecutar el exportador.

El interés práctico del repositorio es que elimina el paso de exportación para quien quiera desplegar JEV-9B en formato OpenVINO int8 sobre una única máquina. El árbol es de una sola etapa, ocupa aproximadamente 8,7 GB y está pensado para ejecutarse con OpenVINO GenAI 2026.4.1 tanto en GPU como en CPU. El repositorio redistribuye únicamente pesos convertidos y no añade entrenamiento alguno.

La relevancia es acotada pero concreta: cubre el caso de quien necesita una API de decisiones determinista y reproducible sobre hardware Intel consumer, con paridad medida frente a la referencia fp32. Al estar construido sobre Qwen3.5-9B, hereda la arquitectura y el contexto del modelo base, aunque la ficha no documenta esos parámetros de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con verbalizador LoRA injertado y cabeza de decisión sobre logits del verbalizador; árbol de decisión de 1 etapa |
| Parametros totales | 9B (heredados del modelo base Qwen3.5-9B; no se detalla el recuento exacto en la información disponible) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (IR de OpenVINO) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | IR de OpenVINO (int8), empaquetado como árbol de decisión de Cascadia |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es el resultado de ejecutar `tools/decision_export.py` de la rama `pawan/decisions-api` (commit `94cfdf9b`, salida sin cambios en el head del PR `db44d59d`) del proyecto Cascadia. El proceso toma el IR int8 de Qwen3.5-9B publicado por OpenVINO, le injerta el adaptador LoRA del verbalizador de autotrust/JEV-9B (201 ramas LoRA) y construye una cabeza de decisión que opera sobre los logits de los tokens del verbalizador. El árbol resultante tiene una sola etapa y está dimensionado para una única máquina de unos 8,7 GB.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base o en el fine-tune. La innovación técnica destacable es el propio formato de exportación: un árbol de decisión servible que expone `/v1/decisions` y `/v1/systemone`, con paridad verificada frente a la referencia fp32 y sin alterar el comportamiento de chat a temperatura 0.

## Capacidades

- Servicio de decisiones vía `/v1/decisions` en formato OpenAI Decisions.
- Servicio del endpoint `/v1/systemone` con estados idénticos a `/v1/decisions` (82/82 coincidencias en la medición del autor).
- Chat generativo a temperatura 0 heredado de Qwen3.5-9B, con salida byte a byte idéntica antes y después de ejecutar el árbol de decisión.
- Ejecución en GPU Intel (Arc 140V iGPU validada) y en CPU con los mismos ficheros.
- Cabeza de decisión basada en los logits del verbalizador, con márgenes de referencia registrados para cada decisión.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Despliegue de una API de decisiones sin exportador: descargar el árbol con `hf download` y arrancarlo con `cascadia run` permite exponer `/v1/decisions` en minutos, evitando reproducir el pipeline de conversión.
- Enrutamiento determinista en pipelines internos: la cabeza de decisión sobre logits del verbalizador ofrece salidas estables y reproducibles, adecuadas para clasificar solicitudes antes de derivarlas a otro modelo o servicio.
- Inferencia en hardware Intel consumer: con unos 8,7 GB y validación en una Arc 140V iGPU con 32 GB de RAM, encaja en equipos de sobremesa o portátiles de gama alta sin GPU dedicada de datacenter.
- Entornos con requisitos de reproducibilidad: la paridad de 80/82 frente a fp32 y la identidad byte a byte del chat a temperatura 0 facilitan auditorías y comparaciones entre versiones.
- Prototipado de sistemas con API compatible OpenAI: al exponer `/v1/decisions` en formato OpenAI, se integra con clientes y herramientas que ya hablan ese protocolo.
- Evaluación de la cadena Cascadia + OpenVINO: sirve como referencia para medir el coste de la cuantización int8 en tareas de decisión antes de adoptar el stack en producción.
- Despliegue en CPU sin GPU: el mismo árbol funciona con `--device CPU`, útil para servidores sin acelerador Intel o para entornos de CI.

## Benchmarks y rendimiento

Mediciones del autor en Intel Core Ultra 7 258V (Arc 140V iGPU, 32 GB), Windows 11, OpenVINO GenAI 2026.4.1, `--device GPU`, Cascadia en `db44d59d`, frente a la referencia fp32 en streaming (50 registros / 82 preguntas):

| Comprobacion | Resultado |
|---|---|
| Paridad frente a fp32 | 80/82 PASS; dos flips casi empate con márgenes de referencia 0,002 y 0,025; ningún flip con confianza; max \|Δp\| 0,0203 |
| `/v1/decisions` frente a `/v1/systemone` | 82/82 idénticos (todos los estados) |
| Chat a temperatura 0 antes y después de la ejecución de decisión | Byte a byte idéntico |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Tamaño en disco: aproximadamente 8,7 GB para el árbol de una etapa (repo de 9,3 GB).
- VRAM/RAM estimada: unos 8,7 GB para cargar el árbol; validado en un equipo con 32 GB de RAM compartida con iGPU.
- GPU recomendadas: Intel Arc 140V iGPU (validada por el autor); no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, al menos en Intel Arc integradas; no hay datos para GPUs NVIDIA consumer.
- Opciones de despliegue: Cascadia (`cascadia run ... --engine qwen35 --device GPU|CPU --api 127.0.0.1:8080`) sobre OpenVINO GenAI 2026.4.1. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.
- Advertencia de versión: usar OpenVINO GenAI 2026.4.1; la 2026.4.0 presenta una violación de acceso en el plugin de GPU bajo generaciones largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pawanpaudel93/jev9b-int8-ov-decision | 9B (base) | No disponible | IR OpenVINO int8 + árbol Cascadia | Apache-2.0 | Artefacto de despliegue con endpoints `/v1/decisions` y `/v1/systemone`; sin benchmarks estándar publicados |
| autotrust/JEV-9B | 9B | No disponible | Pesos del fine-tune (formato no detallado) | Apache-2.0 | Modelo fuente del verbalizador; requiere exportación propia para servir decisiones |
| OpenVINO/Qwen3.5-9B-int8-ov | 9B | No disponible | IR OpenVINO int8 | Apache-2.0 | IR int8 oficial de Intel; sin cabeza de decisión ni verbalizador de JEV |
| Qwen/Qwen3.5-9B | 9B | No disponible | Pesos originales (formato no detallado) | Apache-2.0 | Modelo base de toda la cadena; uso generalista sin componentes de decisión |

## Limitaciones y advertencias

- No es un modelo entrenado: redistribuye pesos convertidos y no añade capacidad nueva respecto a JEV-9B y Qwen3.5-9B.
- La paridad frente a fp32 no es total: 2 de 82 preguntas cambian de resultado, ambas con márgenes de referencia muy ajustados (0,002 y 0,025); conviene revisar los umbrales de decisión en producción.
- Solo se valida en una configuración concreta (Core Ultra 7 258V, Arc 140V, Windows 11, OpenVINO GenAI 2026.4.1); el comportamiento en otras GPUs, sistemas operativos o versiones de runtime no está documentado.
- OpenVINO GenAI 2026.4.0 presenta una violación de acceso en el plugin de GPU con generaciones largas; es obligatorio usar 2026.4.1.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos; estos dependen del modelo base y del fine-tune, no caracterizados en la información disponible.
- Riesgo de alucinación: no evaluado en la información disponible; la cabeza de decisión mitiga la variabilidad en la tarea de decisión, pero no en la generación de chat.
- Licencia Apache-2.0 permite uso comercial, pero se deben respetar las licencias de los componentes upstream (JEV-9B, Qwen3.5-9B y la conversión de OpenVINO), todas Apache-2.0 según el autor.
- El repositorio tiene un uso muy bajo (21 descargas, 0 likes) y fue creado y actualizado el mismo día (2026-10-28), por lo que carece de validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pawanpaudel93/jev9b-int8-ov-decision
- Modelo fuente del fine-tune: https://huggingface.co/autotrust/JEV-9B
- IR int8 base de OpenVINO: https://huggingface.co/OpenVINO/Qwen3.5-9B-int8-ov
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio Cascadia: https://github.com/labscommunity/cascadia
- Documentación de la API de decisiones: `docs/decisions.md` en el repositorio de Cascadia (https://github.com/labscommunity/cascadia/blob/main/docs/decisions.md)
