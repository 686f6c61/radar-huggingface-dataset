# cribl-ai/cribl-decision-2-4B

## Resumen

Cribl Decision 2 es un modelo de 4.205.751.296 parámetros (4,2B) desarrollado por cribl-ai, un fine-tune del backbone de texto Qwen3.5-4B especializado en responder preguntas de opción múltiple sobre datos de TI, seguridad y telemetría. No es un modelo generativo: recibe un estado (líneas de log, un inventario, una configuración o un fragmento de documento), una pregunta y una lista de opciones, y devuelve una probabilidad calibrada para cada opción en un único forward pass, sin generar texto.

El modelo resuelve un problema muy concreto en el ámbito de la observabilidad: clasificar y etiquetar eventos de log, determinar si una actividad es sospechosa, identificar qué campo contiene un usuario o asignar severidad a una alerta, todo ello de forma determinista y con latencias bajas. Su relevancia radica en que sustituye a los pipelines de clasificación basados en reglas o a modelos generativos grandes por un clasificador especializado que expone distribuciones de probabilidad en lugar de texto libre.

La arquitectura parte del backbone Qwen3.5-4B (32 capas, de las cuales 8 son de atención completa y el resto de atención lineal) al que se añaden tres modificaciones: atención bidireccional en las capas completas, lectura inversa en las capas lineales previas a cada capa completa y un scorer de opciones de bajo rango. El contexto de prompt está limitado a 4.096 tokens y el modelo solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal) basado en Qwen3.5-4B, con atención bidireccional en capas completas, lectura inversa con compuerta aprendida y scorer bilineal de opciones |
| Parámetros totales | 4.205.751.296 (4,2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens de prompt; entradas más largas lanzan error en lugar de truncarse |
| Tipos de cuantización | No disponible (el repo publica pesos en safetensors; la model card solo menciona ejecución en bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint estándar de transformers más `decision_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de texto de Qwen3.5-4B, compuesto por 32 capas, de las cuales 8 son de atención completa y el resto de atención lineal. Sobre esa base se introducen tres cambios. Primero, las 8 capas de atención completa pasan a ser bidireccionales, de modo que ven el prompt completo en ambas direcciones. Segundo, la capa de atención lineal inmediatamente anterior a cada capa completa lee también el prompt de derecha a izquierda con los mismos pesos, y las dos direcciones se mezclan mediante una compuerta aprendida (`reverse_gate.<layer>`); el resto de capas lineales mantienen la lectura izquierda-derecha del modelo base. Tercero, se añade un scorer de opciones: cada opción termina en un token marcador propio y su logit se calcula como una puntuación bilineal de rango bajo (256) entre el estado oculto final en el token de lectura y el de ese marcador; un softmax sobre las opciones de la pregunta produce las probabilidades. Al no existir una tabla de etiquetas de respuesta, el número de opciones solo está limitado por la longitud del prompt (en entrenamiento se usaron hasta 255).

El entrenamiento se realizó en tres etapas partiendo de Qwen3.5-4B. La etapa general usó aproximadamente 1 millón de preguntas de opción múltiple y clasificación convertidas desde datasets públicos de NLP. La etapa de lector empleó unas 130.000 preguntas generales en el formato final de prompt, para entrenar las capas de lectura inversa y el nuevo scorer de opciones. La etapa de dominio utilizó unas 20.000 preguntas, aproximadamente la mitad sobre TI, seguridad y telemetría y la otra mitad preguntas generales reproducidas de la primera etapa para preservar la capacidad general del modelo. Los pesos publicados son la media de pesos iguales de dos ejecuciones de fine-tuning con semillas distintas; como promediar dos scorers entrenados por separado reduce sus logits, la media incorpora una temperatura de 0,50 ajustada sobre preguntas de desarrollo generales reservadas (nunca sobre los benchmarks) y plegada en los pesos del scorer.

## Capacidades

- Clasificación de opción múltiple sobre texto arbitrario: devuelve una probabilidad calibrada por opción en un solo forward pass, sin generación de texto.
- Tipos de pregunta `choice` (lista de etiquetas o mapeo etiqueta → descripción), `boolean` (respuesta `true`/`false`) y `score` (niveles ordenados con valor esperado ponderado por probabilidad).
- Clasificación de tipos de log (por ejemplo, distinguir un log de firewall Linux/UFW de un log de OpenSSH).
- Detección de eventos sospechosos y evaluación de severidad de alertas.
- Identificación de campos dentro de registros estructurados (por ejemplo, qué campo contiene el usuario).
- Procesamiento por lotes de preguntas independientes mediante `decide_batch`, con padding a la derecha.
- Soporte de hasta 255 opciones por pregunta, limitado únicamente por la longitud del prompt.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito.
- Multilingüe: no; solo inglés declarado.

## Casos de uso

- Clasificación de tipos de log en pipelines de ingesta: el modelo recibe una línea o un bloque de líneas y una lista de tipos de log conocidos, y devuelve la probabilidad de cada uno, lo que permite enrutar eventos a parsers distintos sin mantener reglas regex frágiles.
- Triaje de alertas de seguridad: dada una descripción de evento (por ejemplo, `user=alice action=login result=failure count=37 window=60s`) y la pregunta booleana de si parece un intento de fuerza bruta, el modelo devuelve una probabilidad calibrada que puede usarse como umbral en un SIEM.
- Asignación de severidad: con el tipo de pregunta `score` y niveles ordenados (`informational`, `low`, `medium`, `high`, `critical`), el modelo produce una distribución y un valor esperado que puede priorizar colas de incidentes.
- Extracción de campos en registros estructurados: preguntar qué campo de un registro contiene el usuario, la IP de origen o el identificador de sesión, usando las claves del propio registro como opciones.
- Enriquecimiento de inventarios y configuraciones: dado un fragmento de configuración y una pregunta sobre qué componente o servicio describe, el modelo clasifica el texto contra un catálogo de opciones definido por el operador.
- Clasificación de documentos y extractos: al aceptar cualquier texto como estado, puede etiquetar fragmentos de documentación técnica o runbooks contra categorías predefinidas, con probabilidades utilizables para revisión humana.
- Procesamiento por lotes en pipelines de observabilidad: `decide_batch` con `batch_size` configurable permite clasificar muchos eventos por segundo en CUDA o Apple Silicon, con la ventaja de que cada pregunta es su propia secuencia y no requiere generación autorregresiva.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con las columnas Benchmark, Questions, Accuracy y Macro acc, pero el contenido de las filas no está disponible en la información proporcionada. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 8,4 GB, lo que corresponde a pesos en bf16 (aproximadamente 2 bytes por parámetro para 4,2B). En bf16 se necesita espacio para pesos más activaciones y caché; en la práctica, una GPU con 16 GB o más permite ejecutar el modelo con margen.
- GPU recomendadas: no se especifican modelos concretos en la model card. Por tamaño, cabe en GPUs de consumo como una RTX 4090 (24 GB) y en GPUs de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas con 16-24 GB; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: `transformers` (versión >= 5.17) con `trust_remote_code=True` para cargar el `DecisionModel` completo, o el script de referencia `decision.py` incluido en el repo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y los pipelines de text-classification no están soportados.
- Aceleración: en CUDA, instalar `flash-linear-attention` y `causal-conv1d` acelera notablemente las capas de atención lineal. También funciona en Apple Silicon (MPS) y CPU en bf16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cribl Decision 2 | 4,2B | 4.096 tokens | Clasificación de opción múltiple con probabilidades calibradas | Apache 2.0 | HuggingFace (cribl-ai/cribl-decision-2-4B) |
| Cribl Decision 2 Mini | 0,8B | No disponible | Misma tarea, versión más pequeña y rápida | No disponible en la información proporcionada | HuggingFace (cribl-ai/cribl-decision-2-mini) |
| Qwen3.5-4B (modelo base) | 4B | No disponible | Generación de texto general | No disponible en la información proporcionada | HuggingFace (Qwen/Qwen3.5-4B) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Cribl Decision 2 con estas alternativas.

## Limitaciones y advertencias

- Solo admite inglés; no se declara soporte de otros idiomas.
- El prompt está limitado a 4.096 tokens y las entradas más largas lanzan un error en lugar de truncarse, lo que exige al integrador segmentar o validar la longitud de entrada.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso, y no debe usarse como asistente conversacional.
- Requiere `trust_remote_code=True` para cargar el scorer de opciones; sin esa opción, `AutoModel` carga solo el backbone, que no puede puntuar opciones por sí mismo.
- Los pipelines de text-classification de `transformers` no están soportados.
- La calibración de probabilidades depende de la temperatura de 0,50 ajustada sobre preguntas de desarrollo generales; el comportamiento calibrado en dominios muy alejados de TI, seguridad y telemetría no está documentado.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan cláusulas adicionales ni avisos sobre datos de entrenamiento.
- Riesgo de alucinación: al no generar texto, el riesgo se traslada a la asignación de probabilidad alta a opciones incorrectas cuando el estado de entrada es ambiguo o está fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cribl-ai/cribl-decision-2-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión Mini: https://huggingface.co/cribl-ai/cribl-decision-2-mini
