# pawanpaudel93/jev27b-int8-ov-decision

## Resumen

JEV-27B decision tree (OpenVINO int8, 2 stages) es un artefacto de despliegue listo para servir, publicado por el usuario pawanpaudel93, que empaqueta el modelo de decisión autotrust/JEV-27B como un árbol de decisión Cascadia de dos etapas sobre el IR int8 oficial de Intel de Qwen3.8-27B. No es un modelo entrenado desde cero ni un fine-tune nuevo: el repositorio redistribuye únicamente pesos convertidos, con el adaptador verbalizer LoRA de JEV-27B injertado sobre el backbone stock (las 851 tensores del backbone son idénticos, `lm_head` incluido) y una cabecera de decisión que lee los logits del token verbalizer.

Su interés es práctico: evita tener que ejecutar el exportador `tools/decision_export.py` de Cascadia para levantar los endpoints `/v1/decisions` (formato OpenAI Decisions) y `/v1/systemone`, que permiten a un agente autoalojado obtener decisiones estructuradas (clasificación, enrutado, puntuación) en lugar de texto libre. El árbol pesa unos 27 GB y está diseñado para una pipeline de dos máquinas: cada etapa necesita entre 13 y 25 GB de memoria, de modo que un único host de 32 GB no puede ejecutar ambas.

El autor ha medido el artefacto exclusivamente en CPU (dos Intel Core Ultra 7 258V con 32 GB, Windows 11, OpenVINO GenAI 2026.4.1), con paridad completa frente a la referencia fp32 en 82 de 82 preguntas. La licencia Apache-2.0 se mantiene en toda la cadena (base Qwen, IR de Intel y fine-tune de AutoTrust AI).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3.8-27B) con arbol de decision Cascadia de 2 etapas y cabecera de decision sobre logits del token verbalizer; 401 ramas LoRA (200 + 201) |
| Parametros totales | 27B (según denominación del modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (IR de OpenVINO generado por Intel); adaptador LoRA injertado sobre el IR |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml/.bin) con adaptadores LoRA; repositorio de 29,1 GB |
| Etapas del arbol | 2 (rank 0 y rank 1), ~27 GB en total |
| Memoria por etapa | 13–25 GB |
| Libreria / motor | openvino, motor `qwen35` de Cascadia, OpenVINO GenAI 2026.4.1 |
| Modelos base | autotrust/JEV-27B, OpenVINO/Qwen3.8-27B-int8-ov, Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El artefacto no incorpora entrenamiento propio: es una conversión. El backbone es el Qwen3.8-27B stock en su versión int8 publicada por Intel (OpenVINO/Qwen3.8-27B-int8-ov), verificado tensor a tensor contra el original (851 tensores idénticos, `lm_head` incluido). Sobre ese backbone se injerta el adaptador verbalizer LoRA de autotrust/JEV-27B, distribuido en 401 ramas (200 en la etapa 0 y 201 en la etapa 1), y se añade una cabecera de decisión que interpreta los logits del token verbalizer para producir estados de decisión en lugar de texto generativo.

La exportación se realizó con `tools/decision_export.py` de la rama `pawan/decisions-api` del repositorio labscommunity/cascadia, partiendo de los ficheros upstream descritos en `docs/decisions.md` y validada en el commit `db44d59d`. El proceso de particionado en dos etapas responde a una restricción de memoria, no a una decisión arquitectónica del modelo original: cada rank se sirve como un worker independiente que se comunica con el siguiente mediante `--next HOST:PORT`, y solo el rank 0 expone la API.

El modelo de decisión subyacente (autotrust/JEV-27B) es un estudiante open-weights de AutoTrust AI destilado a partir de las distribuciones de salida publicadas del modelo propietario TypeSafe Jev 1.13, usando el corpus Apache-2.0 SargeDev/jev-distill-corpus-v3. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Producción de decisiones estructuradas en formato OpenAI Decisions mediante `/v1/decisions`: clasificación, enrutado y puntuación sobre contexto de entrada.
- Endpoint `/v1/systemone` con semántica equivalente a `/v1/decisions` (verificado 82/82 idéntico en todos los estados).
- Decisión calibrada: la cabecera lee los logits del token verbalizer, lo que permite obtener distribuciones de probabilidad comparables frente a una referencia fp32 (máxima diferencia absoluta de probabilidad 0,0187).
- Conversación generativa estándar heredada del backbone Qwen3.8-27B (verificado que el chat a temperatura 0 es byte-idéntico antes y después de ejecutar el árbol de decisión).
- Ejecución en CPU sin GPU, con backend OpenVINO int8.
- Despliegue particionado en dos hosts mediante workers de Cascadia con comunicación entre ranks.
- No se documentan en la información disponible capacidades de tool calling, visión, audio ni modo thinking explícito para este artefacto.

## Casos de uso

- Enrutado de peticiones en un agente autoalojado: el árbol expone `/v1/decisions` para que un orquestador decida qué herramienta o subagente debe atender cada consulta, sustituyendo una llamada generativa por una decisión calibrada y de menor coste.
- Clasificación y triaje de tickets en infraestructura propia: al ejecutarse en CPU con OpenVINO, puede desplegarse en hosts sin GPU dentro de la red corporativa y mantener los datos fuera de proveedores externos.
- Puntuación y scoring por lotes: la cabecera de decisión devuelve probabilidades calibradas, adecuadas para umbrales configurables en pipelines de moderación o priorización.
- Puerta de validación en pipelines multi-paso: dado que el chat a temperatura 0 permanece byte-idéntico tras ejecutar el árbol, puede intercalarse como verificador entre pasos de un agente sin alterar las respuestas del generador.
- Despliegue en dos máquinas de 32 GB: equipos de investigación con estaciones de trabajo convencionales (por ejemplo, Intel Core Ultra 7 258V) pueden servir el modelo completo repartiendo rank 0 y rank 1 entre dos hosts.
- Reproducción y auditoría de un modelo de decisión: al redistribuir pesos ya convertidos, permite validar el comportamiento de JEV-27B frente a la referencia fp32 sin ejecutar el exportador ni disponer del checkpoint original completo.
- Evaluación comparativa de decision models: sirve como baseline int8/CPU para contrastar latencia y calibración frente a la versión MLX en Apple Silicon u otras implementaciones del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica una verificación de paridad frente a la referencia fp32 (50 registros / 82 preguntas), que se reproduce a continuación como dato de validación, no como benchmark de calidad:

| Comprobacion | Resultado |
|---|---|
| Paridad global vs fp32 | 82/82 PASS |
| Eleccion (choice) | 33/33 |
| Predicado (predicate) | 24/24 |
| Puntuacion (score) | 25/25 |
| Diferencia maxima de probabilidad | 0,0187 (sin flips) |
| `/v1/decisions` vs `/v1/systemone` | 82/82 identicos en todos los estados |
| Chat a temperatura 0 antes/despues | byte-identico |

Entorno de medida: dos hosts Intel Core Ultra 7 258V (32 GB), Windows 11, OpenVINO GenAI 2026.4.1, `--device CPU`, un rank por host, Cascadia en `db44d59d`. No se reportan métricas de latencia ni de throughput.

## Requisitos de hardware

- Memoria: ~27 GB en total para el árbol; cada etapa consume entre 13 y 25 GB, por lo que se recomienda al menos 32 GB de RAM por host.
- Un único host de 32 GB no puede ejecutar las dos etapas simultáneamente; el despliegue previsto es de dos máquinas.
- GPU: no se han publicado medidas en GPU; el autor indica que el árbol se ha medido únicamente en CPU.
- Configuración validada: 2 × Intel Core Ultra 7 258V (32 GB), Windows 11, sin acelerador dedicado.
- Cabe en hardware de consumo en el sentido de estaciones de trabajo y mini-PC con 32 GB de RAM, siempre que se reparta entre dos equipos.
- Opciones de despliegue: workers de Cascadia (`cascadia worker --engine qwen35`), con OpenVINO GenAI 2026.4.1 como dependencia obligatoria. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Timeout: el ejemplo del autor configura `CASCADIA_ACTIVATION_TIMEOUT_SECS=1800` en el rank 0, lo que sugiere activaciones lentas en CPU sobre dos hosts.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pawanpaudel93/jev27b-int8-ov-decision | 27B (arbol de 2 etapas) | no disponible | OpenVINO IR int8 + LoRA | Apache-2.0 | HuggingFace, 0 descargas |
| autotrust/JEV-27B | 27B | no disponible | Adaptadores (adapter_vllm) | Apache-2.0 | HuggingFace |
| OpenVINO/Qwen3.8-27B-int8-ov | 27B | no disponible | OpenVINO IR int8 | Apache-2.0 | HuggingFace |
| TypeSafe Jev 1.13 | no disponible | no disponible | Propietario (hosted) | Cerrada | Solo API gestionada |

La diferencia clave frente a autotrust/JEV-27B es operativa: este repositorio elimina el paso de exportación y fija la cuantización int8 y el particionado en dos etapas. Frente a OpenVINO/Qwen3.8-27B-int8-ov añade el adaptador verbalizer y la cabecera de decisión, por lo que no es un sustituto del modelo generativo. Frente a TypeSafe Jev 1.13, ofrece ejecución autoalojada aunque sin garantías de paridad con el profesor propietario.

## Limitaciones y advertencias

- El repositorio no entrena nada: cualquier limitación de calidad proviene de autotrust/JEV-27B y, en última instancia, de su destilación del profesor propietario.
- No se publican evaluaciones de calidad de decisión (accuracy, F1, calibración en dominios reales); la única validación es la paridad numérica frente a fp32 sobre 82 preguntas.
- La validación se hizo con 50 registros y 82 preguntas, una muestra reducida que no cubre la diversidad de dominios de producción.
- Solo se ha medido en CPU y en Windows 11; no hay datos de rendimiento en Linux, GPU ni aceleradores Intel específicos.
- El despliegue requiere dos hosts con el árbol descargado en la misma ruta en ambos; no funciona en una única máquina de 32 GB.
- El formato OpenVINO IR limita la portabilidad: no es directamente utilizable en vLLM, llama.cpp, Ollama o TGI.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide evaluar el comportamiento multilingüe o con entradas largas.
- Riesgo de alucinación y sesgos heredado del backbone Qwen3.8-27B y de los datos de destilación; no se documentan mitigaciones.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar la cadena completa de licencias (Qwen, Intel, AutoTrust AI) y el cumplimiento de las condiciones del modelo profesor propietario si su uso se compara con TypeSafe Jev 1.13.
- Fecha de creación del repositorio: 28 de octubre de 2026, sin descargas ni likes registrados; no hay evidencia de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pawanpaudel93/jev27b-int8-ov-decision
- Modelo base (fine-tune): https://huggingface.co/autotrust/JEV-27B
- IR int8 de Intel: https://huggingface.co/OpenVINO/Qwen3.8-27B-int8-ov
- Modelo original Qwen: https://huggingface.co/Qwen
- Repositorio Cascadia: https://github.com/labscommunity/cascadia
- Blog de AutoTrust AI sobre JEV-27B: https://huggingface.co/blog/autotrust/autotrustjev-27b-fast-calibrated-decisions-and-ful
- Nota de prensa de lanzamiento de JEV-27B: https://www.prnewswire.com/news-releases/autotrust-ai-releases-jev-27b-an-open-decision-model-for-self-hosted-ai-agents-302891720.html
- Port a Apple Silicon (MLX) de los modelos de decisión: https://netprojects.com/insights/autotrust-jev-decision-models-on-apple-silicon-mlx
- Sitio del modelo Jev: https://jevai.net/
- Documentación de la API de decisiones: `docs/decisions.md` en el repositorio de Cascadia
