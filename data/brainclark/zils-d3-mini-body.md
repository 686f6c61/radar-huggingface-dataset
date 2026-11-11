# brainclark/zils-d3-mini-body

## Resumen

Cribl Decision 2 Mini es un modelo de clasificación y elección múltiple desarrollado por brainclark (repositorio original de cribl-ai) a partir del backbone de texto Qwen3.5-0.8B. No es un modelo generativo: recibe un *estado* (cualquier texto como líneas de log, un inventario, una configuración o un fragmento de documento), una *pregunta* y una lista de *opciones*, y devuelve una probabilidad calibrada para cada opción en un único forward pass, sin generar texto. Está orientado a dominios de IT, seguridad y telemetría.

El modelo resuelve tareas como identificar el tipo de log, determinar si un evento es sospechoso, localizar qué campo contiene un usuario o estimar la severidad de una alerta. Con 852.985.920 parámetros (~0.75B) y una ventana de prompt limitada a 4.096 tokens, está pensado para integrarse en pipelines de observabilidad donde se necesita clasificación rápida y determinista en lugar de generación libre.

Su relevancia actual radica en el enfoque: en lugar de pedir a un LLM que responda en lenguaje natural, convierte el backbone en un lector bidireccional que puntúa opciones directamente, lo que reduce latencia, evita alucinaciones de formato y permite un número de opciones limitado solo por la longitud del prompt (hasta 255 en entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal) basado en Qwen3.5-0.8B, con cabeza de puntuación de opciones |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens de prompt (entradas mayores provocan error, no truncado) |
| Tipos de cuantizacion | No disponible (entrenado e inferido en bf16; no se documentan otras cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint estándar de transformers + decision_head.safetensors) |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto Qwen3.5-0.8B, un transformer híbrido con 24 capas, de las cuales 6 son de atención completa y el resto de atención lineal. Sobre ese backbone se introducen tres modificaciones: atención completa bidireccional en las 6 capas de atención completa (ven el prompt en ambas direcciones); lectura inversa en la capa de atención lineal inmediatamente anterior a cada capa de atención completa, que lee el prompt de derecha a izquierda con los mismos pesos y mezcla ambas direcciones mediante una compuerta aprendida; y una cabeza de puntuación de opciones que calcula un score bilineal de rango bajo (256) entre el estado oculto final en el token de lectura y el estado en el token marcador de cada opción. La softmax sobre las opciones de la pregunta produce las probabilidades.

El entrenamiento se realizó en tres etapas desde Qwen3.5-0.8B: una etapa general con ~400k preguntas de elección múltiple y clasificación convertidas de datasets públicos de NLP; una etapa de lector con ~130k preguntas generales en el formato final de prompt, para entrenar las capas de lectura inversa y la nueva cabeza de puntuación; y una etapa de dominio con ~40k preguntas, aproximadamente la mitad sobre IT, seguridad y telemetría y la otra mitad preguntas generales replayadas de la primera etapa para preservar la capacidad general. Los pesos publicados son la media de dos ejecuciones de fine-tuning con semillas distintas; esa media reduce la magnitud de los logits, por lo que incorpora una temperatura (0.41) ajustada sobre preguntas de desarrollo general no usadas en los benchmarks y plegada en los pesos de la cabeza.

## Capacidades

- Clasificación de elección múltiple con probabilidades calibradas por opción en un solo forward pass, sin generación de texto.
- Tres tipos de pregunta: `choice` (lista o mapa de etiquetas con descripción opcional), `boolean` (respuesta `false`/`true`) y `score` (niveles ordenados con valor esperado ponderado por probabilidad).
- Identificación de tipos de log y fuentes de telemetría (por ejemplo, logs de firewall netfilter/UFW, OpenSSH, tipos personalizados).
- Evaluación de sospecha de eventos y detección de patrones como intentos de fuerza bruta.
- Extracción de campos semánticos: qué campo contiene el usuario, la acción, el resultado, etc.
- Estimación de severidad de alertas en escalas ordenadas (informational, low, medium, high, critical).
- Procesamiento por lotes (`decide_batch`) con padding a la derecha y tamaño de lote configurable.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido; es exclusivamente un clasificador de opciones.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Triaje automático de alertas de seguridad: dado un evento y una escala de severidad, el modelo devuelve una distribución de probabilidad y un nivel esperado, lo que permite priorizar alertas en un SIEM sin generación de texto y con latencia de un solo forward pass.
- Enrutamiento de logs en pipelines de observabilidad: clasificar cada línea o bloque de log en un tipo conocido (firewall, SSH, aplicación, custom) para dirigirlo al parser o índice adecuado, aprovechando la puntuación de opciones sin necesidad de etiquetas fijas en el vocabulario.
- Detección de fuerza bruta y anomalías de autenticación: con preguntas booleanas sobre ventanas de eventos (por ejemplo, `user=alice action=login result=failure count=37 window=60s`), el modelo estima la probabilidad de que el patrón sea un intento de fuerza bruta.
- Extracción de entidades en registros no estructurados: preguntar qué campo de un log contiene el usuario, la IP de origen o el resultado de la acción, útil para normalizar esquemas heterogéneos antes de ingestarlos.
- Clasificación de documentos y configuraciones: dado un fragmento de configuración o inventario, responder preguntas de elección múltiple sobre su naturaleza, cumplimiento o categoría, con hasta 255 opciones por prompt.
- Enriquecimiento de telemetría en tiempo real: ejecutar `decide_batch` sobre lotes de eventos para añadir etiquetas de severidad, tipo y sospecha antes de almacenar o correlacionar, con despliegue en CUDA, Apple Silicon (MPS) o CPU en bf16.
- Validación y control de calidad de datos: usar las probabilidades calibradas para marcar casos de baja confianza y derivarlos a revisión humana, gracias a la temperatura ajustada en los pesos de la cabeza.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con columnas de benchmark, número de preguntas, accuracy, macro accuracy y NLL, pero el contenido proporcionado se interrumpe antes de mostrar los valores. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1.7 GB y la descarga indicada en la model card es de 1.5 GB; en bf16 el modelo de ~0.85B parámetros requiere aproximadamente 1.7 GB de pesos más memoria para activaciones y lotes.
- GPU recomendadas: no se especifican modelos concretos; el modelo funciona en CUDA, Apple Silicon (MPS) y CPU en bf16.
- Cabe en GPU de consumo: sí, por tamaño (menos de 2 GB de pesos en bf16), aunque no se detallan modelos concretos como RTX 4090.
- Aceleración opcional en CUDA: instalar `flash-linear-attention` y `causal-conv1d` acelera notablemente las capas de atención lineal.
- Opciones de despliegue: `transformers` (versión >= 5.17) con `AutoModel` y `trust_remote_code=True`, o el wrapper `DecisionModel` de `decision.py`. No se soportan los pipelines de text-classification. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cribl Decision 2 Mini (este) | 852.985.920 | 4.096 tokens | Elección múltiple / clasificación | Apache 2.0 | Hugging Face (brainclark/zils-d3-mini-body) |
| Cribl Decision 2 | 4B (según model card) | No disponible | Elección múltiple / clasificación | No disponible | Hugging Face (cribl-ai/cribl-decision-2) |
| Qwen3.5-0.8B (modelo base) | ~0.8B | No disponible | Generación de texto | No disponible | Hugging Face (Qwen/Qwen3.5-0.8B) |

El autor indica que Cribl Decision 2 (4B) ofrece mayor precisión que esta variante mini. No se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo admite inglés; no se documenta soporte para otros idiomas.
- El prompt está limitado a 4.096 tokens y las entradas más largas lanzan un error en lugar de truncarse, lo que exige preprocesado y control de longitud en producción.
- No es un modelo generativo: no puede producir texto libre, tool calling, agentes ni razonamiento multi-paso.
- Requiere `trust_remote_code=True` para cargar la cabeza de puntuación; sin él, `AutoModel` carga solo el backbone, que no puede puntuar opciones.
- Los pipelines de text-classification de transformers no son compatibles.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento (IT, seguridad y telemetría en inglés); la temperatura 0.41 se ajustó en preguntas de desarrollo general.
- El número de opciones está limitado por la longitud del prompt (hasta 255 en entrenamiento), no por una tabla fija de etiquetas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.5-0.8B, cuya licencia no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a entradas adversarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brainclark/zils-d3-mini-body
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante de mayor precisión (Cribl Decision 2, 4B): https://huggingface.co/cribl-ai/cribl-decision-2
- Repositorio de referencia del wrapper: archivos `decision.py`, `example.py` y `requirements.txt` descargables desde el repositorio de Hugging Face del modelo.
