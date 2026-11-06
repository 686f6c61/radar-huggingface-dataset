# pawanpaudel93/cascadia-clef-27b

## Resumen

Cascadia-clef-27b es un artefacto de despliegue, no un modelo entrenado desde cero: empaqueta los pesos del fine-tune Cloudflare/clef (derivado de Qwen3.8-27B) en el IR int8 de OpenVINO de Intel y añade la cabeza de decisión conjunta de Clef como modelo OpenVINO independiente bajo `decision/`. Lo publica pawanpaudel93 como árbol de decisión listo para usar con Cascadia, el runtime del proyecto labscommunity, de modo que se puede servir `/v1/decisions` (formato OpenAI Decisions) y `/v1/systemone` sin ejecutar el exportador.

El árbol tiene 64 capas repartidas en 2 etapas y ocupa 31,2 GB, pensado explícitamente para un pipeline de dos máquinas: un solo host de 32 GB no puede ejecutar ambas etapas. La relevancia es práctica: elimina el paso de conversión (descarga de los 55 GB en BF16 de Clef, descarga del IR int8 de Qwen3.8-27B y ejecución de `tools/decision_export.py`) y ofrece pesos ya requantizados y verificados contra la referencia fp32.

Los pesos son byte a byte idénticos a los de pawanpaudel93/clef27b-int8-ov-decision, que mantiene el mismo árbol en la raíz del repositorio. Todo el linaje (fine-tune, base, conversión) es Apache-2.0. Las mediciones publicadas se han hecho únicamente en CPU, sobre dos Intel Core Ultra 7 258V con 32 GB cada uno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con cabeza de decisión conjunta de Clef; grafo OpenVINO IR int8 |
| Parametros totales | 27B (según el modelo base Qwen3.8-27B; no se detalla en la información disponible) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible de forma explícita; las pruebas se hicieron con pases conjuntos de 16.384 tokens |
| Tipos de cuantizacion | int8 (IR de OpenVINO, requantizado por fila sobre [min(w, 0), max(w, 0)] como hace NNCF) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`stage.xml`/`stage.bin` por etapa, `openvino_text_embeddings_model.*`, subdirectorio `decision/`), más `manifest.json`, `decision.json`, `config.json`, `generation_config.json`, `tokenizer.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo subyacente es Cloudflare/clef, un fine-tune de Qwen3.8-27B (transformer denso de 27B parámetros). Este repositorio no entrena nada: redistribuye pesos convertidos. El proceso de exportación sustituye los pesos completos del fine-tune dentro del IR int8 de Qwen3.8-27B de Intel y añade la cabeza de esquema conjunta de Clef como modelo OpenVINO en `decision/`, que actúa como cabeza de puntero para la API de decisiones.

La conversión se realizó con `tools/decision_export.py` de la rama `pawan/decisions-api` de labscommunity/cascadia, con el comando documentado en la model card (`--base-ir`, `--weights`, `--clef-dir`, `--stages 2`). La requantización int8 se calcula por fila sobre el rango [min(w, 0), max(w, 0)], replicando el comportamiento de NNCF para el IR de Intel. El árbol resultante se divide en dos etapas de 64 capas en total, con un `manifest.json` que describe el corte y un `decision.json` con la configuración de decisión; la etapa 0 aloja los embeddings de texto y la etapa 1 ejecuta la cabeza conjunta.

## Capacidades

- Generación de texto conversacional mediante el chat template incluido (`chat_template.jinja`), con paridad verificada a temperatura 0 antes y después de ejecutar el pipeline de decisión.
- Emisión de decisiones estructuradas en formato OpenAI Decisions a través de `/v1/decisions`, con estados de tipo cadena.
- Modo System One (`/v1/systemone`) con salida idéntica a `/v1/decisions` en las pruebas realizadas (62/62 registros idénticos).
- Clasificación y puntuación por predicados: la verificación de paridad cubre 33 elecciones, 24 predicados y 25 puntuaciones.
- Ejecución en pipeline paralelo de 2 etapas sobre CPU con OpenVINO GenAI.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio, modo thinking ni multilingüismo específico.

## Casos de uso

- Servicio de decisiones en producción sin exportar: al estar el árbol ya convertido y verificado, se puede levantar `/v1/decisions` directamente con `cascadia worker`, evitando descargar los 55 GB en BF16 de Clef y repetir la conversión.
- Enrutamiento y clasificación de solicitudes: la cabeza de decisión permite obtener elecciones, predicados y puntuaciones en una sola pasada conjunta, adecuada para triaje previo a un modelo mayor.
- Despliegue en hardware sin GPU: al estar medido en CPU con OpenVINO GenAI 2026.4.1, encaja en entornos de dos nodos con 32 GB de RAM cada uno y sin acelerador dedicado.
- Evaluación de paridad en CI: el árbol sirve como referencia reproducible (81/82 PASS frente a fp32, máximo |Δp| 0,0669) para validar cambios en el runtime o en el exportador.
- Réplica de un pipeline multi-etapa: el par de comandos `cascadia worker` con `--rank 1` y `--rank 0 --next HOST_B:7801` documenta el patrón para montar topologías de dos máquinas con la API en loopback.
- Comparación de motores de inferencia: al ser pesos idénticos a clef27b-int8-ov-decision, permite contrastar configuraciones de despliegue sobre el mismo artefacto sin variación de pesos.

## Benchmarks y rendimiento

| Comprobacion | Resultado |
|---|---|
| Paridad frente a referencia fp32 (50 registros / 82 preguntas, un pase conjunto por registro) | 81/82 PASS (elección 32/33, predicado 24/24, puntuación 25/25), máximo \|Δp\| 0,0669; el único fallo, `r41.team`, es un casi empate (margen de referencia 0,048) |
| `/v1/decisions` frente a `/v1/systemone` | 62/62 idénticos (estados de tipo cadena) |
| Chat a temperatura 0 antes y después de la ejecución de decisión | Byte a byte idéntico |

Entorno de medida: dos hosts Intel Core Ultra 7 258V (32 GB cada uno), Windows 11, OpenVINO GenAI 2026.4.1, `--device CPU`, un rank por host, Cascadia en `db44d59d`. En un pase conjunto de 16.384 tokens el último rank alcanzó un pico de unos 21 GB de memoria privada. No se publican cifras de throughput ni latencia por token.

## Requisitos de hardware

- RAM: el árbol completo ocupa 31,2 GB y requiere dos hosts; un solo equipo de 32 GB no puede ejecutar ambas etapas.
- Pico de memoria: aproximadamente 21 GB de memoria privada en el último rank durante un pase conjunto de 16.384 tokens, por lo que ese host debe quedar libre para solicitudes largas.
- GPU: no se documenta uso de GPU; todas las medidas son con `--device CPU`. No hay datos para A100, H100 ni RTX 4090.
- CPU de referencia: Intel Core Ultra 7 258V (32 GB), dos unidades, una por rank.
- Software: OpenVINO GenAI 2026.4.1 obligatorio, motor `--engine qwen35`, runtime Cascadia en `db44d59d` o compatible.
- Despliegue: `cascadia worker` con `--rank 1 --total 2 --listen 0.0.0.0:7801` en el host B y `--rank 0 --total 2 --next HOST_B:7801 --api 127.0.0.1:8080` en el host A; variable `CASCADIA_ACTIVATION_TIMEOUT_SECS=1800` para solicitudes largas.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI: el formato es IR de OpenVINO y el runtime es Cascadia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pawanpaudel93/cascadia-clef-27b | 27B | No disponible (probado a 16.384 tokens) | OpenVINO IR int8, 2 etapas | Apache-2.0 | Pesos idénticos a clef27b-int8-ov-decision; índice `cascadia.json` |
| pawanpaudel93/clef27b-int8-ov-decision | 27B | No disponible | OpenVINO IR int8 en la raíz del repo | Apache-2.0 | Mismo árbol, disposición distinta; byte a byte idéntico |
| Cloudflare/clef | 27B | No disponible | BF16 (55 GB) | Apache-2.0 | Fine-tune original; requiere ejecutar el exportador |
| OpenVINO/Qwen3.8-27B-int8-ov | 27B | No disponible | OpenVINO IR int8 | Apache-2.0 | Base de la conversión, sin cabeza de decisión de Clef |

## Limitaciones y advertencias

- No es un modelo nuevo: no añade entrenamiento, solo redistribuye pesos convertidos; cualquier limitación de Cloudflare/clef o de Qwen3.8-27B se hereda.
- Requiere dos máquinas: un único host de 32 GB no puede alojar las dos etapas, lo que descarta despliegues en un solo servidor pequeño.
- Pico de 21 GB de memoria privada en el último rank con pases de 16.384 tokens; el host debe estar dedicado para evitar presión de memoria.
- Solo medido en CPU con OpenVINO GenAI 2026.4.1; no hay datos de rendimiento en GPU ni con otros runtimes.
- El fallo de paridad `r41.team` es un casi empate (margen de referencia 0,048), lo que indica sensibilidad en decisiones muy ajustadas.
- Sin datos publicados de sesgos, tasas de alucinación, cobertura de idiomas ni comportamiento fuera del dominio de decisión evaluado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- Licencia Apache-2.0 en todos los eslabones (fine-tune, base, conversión), sin restricciones adicionales documentadas para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pawanpaudel93/cascadia-clef-27b
- Repositorio con los mismos pesos en la raíz: https://huggingface.co/pawanpaudel93/clef27b-int8-ov-decision
- Fine-tune original: https://huggingface.co/Cloudflare/clef
- IR int8 base de Intel: https://huggingface.co/OpenVINO/Qwen3.8-27B-int8-ov
- Modelo Qwen base: https://huggingface.co/Qwen
- Runtime Cascadia: https://github.com/labscommunity/cascadia
