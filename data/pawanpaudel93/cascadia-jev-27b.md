# pawanpaudel93/cascadia-jev-27b

## Resumen

Cascadia JEV-27B es un árbol de decisión preexportado para el modelo de lenguaje JEV-27B, empaquetado en formato OpenVINO int8 y dividido en dos etapas para ejecución en pipeline paralelo sobre dos máquinas. Lo publica el usuario pawanpaudel93 bajo licencia Apache-2.0 y su propósito es servir los endpoints `/v1/decisions` (formato OpenAI Decisions) y `/v1/systemone` del runtime Cascadia sin necesidad de ejecutar el exportador. El modelo base subyacente es Qwen3.8-27B, un transformer de 27.000 millones de parámetros, sobre el que se ha injertado el adaptador verbalizador LoRA de JEV-27B (401 ramas LoRA).

La relevancia de este artefacto es operativa: no introduce entrenamiento nuevo, sino que redistribuye pesos ya convertidos (29,1 GB) listos para desplegarse en dos hosts con 13–25 GB de memoria cada uno. La cabeza de decisión lee los logits del token verbalizador, de modo que el modelo puede emitir decisiones estructuradas además de generar texto. Está medido únicamente en CPU (Intel Core Ultra 7 258V), con OpenVINO GenAI 2026.4.1.

Es un paquete de nicho, con cero descargas y cero likes en el momento de la ficha, pensado para quien ya trabaja con el stack Cascadia y necesita una referencia de paridad frente a fp32 sin montar el pipeline de exportación desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con adaptador verbalizador LoRA y cabeza de decisión; grafo OpenVINO IR int8 |
| Parámetros totales | 27 000 millones (modelo base Qwen3.8-27B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (IR de OpenVINO) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`stage.xml`/`stage.bin` por etapa, `openvino_text_embeddings_model.*`) |
| Etapas del pipeline | 2 (64 capas en total, reparto 200 + 201 ramas LoRA) |
| Tamaño del repo | 29,1 GB |
| Runtime requerido | Cascadia + OpenVINO GenAI 2026.4.1 |
| Dispositivo medido | CPU |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27.000 millones de parámetros (Qwen3.8-27B) cuya columna vertebral permanece intacta: según la model card, los 851 tensores del backbone son idénticos al modelo original, incluido `lm_head`. Sobre esa base se injerta el adaptador verbalizador LoRA de JEV-27B, con 401 ramas repartidas en dos etapas (200 en la etapa 0 y 201 en la etapa 1), y una cabeza de decisión (`decision/`) que interpreta los logits del token verbalizador para producir salidas estructuradas.

No hay entrenamiento adicional en este repositorio: se redistribuyen pesos convertidos. El proceso de exportación parte del IR int8 oficial de Intel (`OpenVINO/Qwen3.8-27B-int8-ov`) y del adaptador de `autotrust/JEV-27B`, y se ejecuta con `tools/decision_export.py` de la rama `pawan/decisions-api` del repositorio Cascadia, generando un árbol de dos etapas con partición declarada en `manifest.json` y configuración de decisión en `decision.json`. La innovación técnica principal es el particionado en pipeline paralelo: cada etapa cabe en 13–25 GB, lo que permite servir el modelo completo en dos hosts de 32 GB que individualmente no podrían albergarlo.

## Capacidades

- Generación de texto conversacional multi-turno mediante el endpoint de chat, con plantilla de chat incluida (`chat_template.jinja`).
- Emisión de decisiones estructuradas en formato OpenAI Decisions a través de `/v1/decisions`.
- Modo "system one" mediante `/v1/systemone`, con paridad verificada al 100 % frente al endpoint de decisiones (82/82 idénticos en todos los estados).
- Cabeza de decisión con tres tipos de salida validados: elección (choice, 33/33), predicado (predicate, 24/24) y puntuación (score, 25/25).
- Inferencia determinista a temperatura 0: la model card reporta salida byte-idéntica antes y después de ejecutar el pipeline de decisión.
- Ejecución en pipeline paralelo distribuido en dos máquinas con un rango por host.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento y clasificación de decisiones en producción: el modelo expone `/v1/decisions` con salidas de elección, predicado y puntuación, lo que permite integrarlo como clasificador estructurado en flujos donde se necesita una respuesta tipada en lugar de texto libre.
- Despliegue en infraestructura de dos nodos sin GPU: al dividirse en dos etapas de 13–25 GB, puede servirse en dos hosts de 32 GB con CPU Intel, evitando el coste de una GPU de gran memoria para un modelo de 27B.
- Validación de paridad en pipelines de conversión: sirve como referencia lista para usar contra la que comparar exportaciones propias, ya que la model card documenta paridad 82/82 frente a fp32 con una desviación máxima de probabilidad de 0,0187 y sin cambios de decisión.
- Sustitución de un exportador propio en CI: al ser un árbol preexportado con índice `cascadia.json` legible por el registro de modelos de Cascadia, se puede descargar y arrancar directamente en pruebas de integración del runtime.
- Chat determinista para evaluación reproducible: la salida byte-idéntica a temperatura 0 lo hace adecuado para suites de regresión donde se comparan respuestas exactas entre versiones del runtime.
- Prototipado de asistentes con salida híbrida: combinación de generación de texto y decisiones estructuradas en un mismo servicio, útil para asistentes que deben devolver tanto una explicación como una acción clasificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta comprobaciones de paridad y consistencia internas:

| Comprobación | Resultado |
|---|---|
| Paridad frente a referencia fp32 (50 registros / 82 preguntas) | 82/82 PASS (choice 33/33, predicate 24/24, score 25/25) |
| Desviación máxima de probabilidad frente a fp32 | 0,0187, sin cambios de decisión |
| `/v1/decisions` frente a `/v1/systemone` | 82/82 idénticos en todos los estados |
| Chat a temperatura 0 antes y después del pipeline de decisión | byte-idéntico |

Entorno de medida: dos hosts Intel Core Ultra 7 258V con 32 GB cada uno, Windows 11, OpenVINO GenAI 2026.4.1, `--device CPU`, un rango por host, Cascadia en el commit `db44d59d`.

## Requisitos de hardware

- Memoria por etapa: 13–25 GB según la model card; un solo host de 32 GB no puede ejecutar ambas etapas.
- Configuración mínima: dos máquinas con 32 GB de RAM cada una, sin GPU, con CPU Intel (medido en Core Ultra 7 258V).
- GPU: no se reportan requisitos ni pruebas en GPU; la model card indica que el árbol se ha medido solo en CPU.
- Despliegue: runtime Cascadia con OpenVINO GenAI 2026.4.1, con los comandos `cascadia worker` para el rango 1 (host B, puerto 7801) y el rango 0 con API en loopback (host A, puerto 8080).
- Timeout de activación: la model card sugiere `CASCADIA_ACTIVATION_TIMEOUT_SECS=1800` para el rango 0.
- Latencia y throughput: no disponibles en la información proporcionada.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables según la información disponible, el formato es OpenVINO IR y requiere Cascadia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cascadia-jev-27b (este) | 27B | no disponible | OpenVINO IR int8, 2 etapas | Apache-2.0 | Incluye cabeza de decisión y verbalizador LoRA; requiere Cascadia |
| OpenVINO/Qwen3.8-27B-int8-ov | 27B | no disponible | OpenVINO IR int8 | Apache-2.0 | IR oficial de Intel sin adaptador ni cabeza de decisión |
| autotrust/JEV-27B | 27B | no disponible | adaptador LoRA (`adapter_vllm/*`) | Apache-2.0 | Fine-tune con verbalizador; requiere modelo base y exportación propia |
| pawanpaudel93/jev27b-int8-ov-decision | 27B | no disponible | OpenVINO IR int8 | Apache-2.0 | Mismos pesos byte a byte, con el árbol en la raíz del repo |

## Limitaciones y advertencias

- Solo se ha medido en CPU (Intel Core Ultra 7 258V); no hay datos de rendimiento en GPU ni de latencia bajo carga concurrente.
- Requiere dos hosts: no cabe en una única máquina de 32 GB, lo que complica entornos de desarrollo locales y despliegues de un solo nodo.
- Dependencia fuerte de versiones: OpenVINO GenAI 2026.4.1 y un commit concreto de Cascadia (`db44d59d`); otras versiones pueden romper la compatibilidad del árbol.
- No se documentan idiomas soportados ni evaluación multilingüe.
- No hay datos publicados de sesgos, tasa de alucinación ni evaluaciones de seguridad; la paridad reportada es frente a fp32, no frente a calidad humana.
- El repositorio no añade entrenamiento: cualquier mejora o corrección debe hacerse sobre el modelo base o el adaptador de origen.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones de los artefactos de origen (Qwen, Intel, autotrust), todos Apache-2.0 según la model card.
- El modelo tiene cero descargas y cero likes: no hay evidencia de uso en producción por terceros.
- La información sobre tool calling, agentes y contexto máximo no está disponible, por lo que no debe asumirse su soporte en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pawanpaudel93/cascadia-jev-27b
- Repositorio con los mismos pesos en la raíz: https://huggingface.co/pawanpaudel93/jev27b-int8-ov-decision
- Modelo base del fine-tune: https://huggingface.co/autotrust/JEV-27B
- IR int8 oficial de Intel: https://huggingface.co/OpenVINO/Qwen3.8-27B-int8-ov
- Modelo original Qwen: https://huggingface.co/Qwen
- Runtime Cascadia: https://github.com/labscommunity/cascadia
- Documentación de la API de decisiones: `docs/DECISIONS.md` en el repositorio de Cascadia
