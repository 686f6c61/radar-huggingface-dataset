# OceanLabs/Coral-2-3B

## Resumen

Koral 2 es un modelo de decisión multimodal desarrollado por OceanLabs y construido sobre LiquidAI/d1-3B (también conocido como LFM2.5-VL-3B). A diferencia de un modelo generativo convencional, Koral 2 está diseñado para emitir respuestas tipadas y calibradas (sí/no, elección única, puntuación ordenada, ranking y extracción) en un único forward pass y sin generar tokens de salida. Esto lo sitúa en la categoría de los llamados "modelos system-one": sistemas rápidos, deterministas y de baja latencia orientados a la toma de decisiones más que a la conversación abierta.

El modelo emplea la arquitectura LFM2.5-VL del modelo base, un transformer híbrido de 3.123 millones de parámetros con capacidades de texto e imagen. OceanLabs no modifica los pesos: según la corrección publicada el 23 de noviembre de 2026, los pesos son idénticos byte a byte a los de LiquidAI/d1-3B, y todas las mejoras de Koral 2 residen en la capa de código de inferencia. Por tanto, el valor añadido está en el empaquetado agresivo, el soporte de cuantización de 4 y 8 bits, la calibración de temperaturas y el escalado vectorial, y una API Python más limpia bajo la clase `Koral2`.

Es relevante ahora porque propone un patrón de uso distinto al de los LLM generativos: en lugar de pagar el coste de decodificar tokens para clasificar o enrutar, el modelo lee el estado una sola vez y responde a múltiples preguntas compartiendo contexto. Con latencias declaradas de 5 a 8 ms por pregunta en una RTX 4090 y soporte para 16 idiomas, encaja en pipelines de producción donde la latencia y el coste por decisión son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal LFM2.5-VL (liquid, lfm2.5) |
| Parametros totales | 3.123.483.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (bitsandbytes) y 8 bits; bfloat16 en el ejemplo de uso |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | lfm1.0 (LFM Open License v1.0, licencia "other") |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

Koral 2 hereda íntegramente la arquitectura del modelo base LiquidAI/d1-3B, etiquetado como LFM2.5-VL y descrito con los tags "liquid", "lfm2.5" y "multimodal". Se trata de un transformer híbrido con capacidades de entrada de texto e imagen, orientado a edge computing. El modelo tiene 3.123 millones de parámetros y se distribuye en safetensors con código personalizado (`custom_code`), por lo que su carga requiere `trust_remote_code=True` en transformers.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La contribución propia de OceanLabs no es un reentrenamiento: según la nota de corrección de la model card, los pesos son byte a byte idénticos a los de d1-3B y las mejoras se limitan al código de inferencia. Entre esas mejoras destacan el empaquetado agresivo de peticiones, el soporte opcional de `torch.compile`, la cuantización de 4 y 8 bits, y una calibración basada en temperature scaling y vector scaling. La innovación principal es el mecanismo `system_one`, que formula preguntas tipadas y devuelve probabilidades y confianza sin generar tokens de salida.

## Capacidades

- Decisión tipada en un solo forward pass: soporta los tipos de pregunta `noul` (sí/no con probabilidad), `choice` (elección única entre opciones nombradas), `score` (puntuación ordenada de 0 a n-1), `rank` (ordenación de opciones) y `extract` (decisión de presencia sí/no).
- Salidas calibradas: cada respuesta incluye `confidence` y, según el tipo, `probabilities`, `legend` o `ranking`.
- Multimodalidad: acepta texto e imágenes como entrada, con pipeline `image-text-to-text`.
- Procesamiento multi-pregunta: varias preguntas comparten el mismo estado leído una sola vez, lo que reduce el coste por consulta.
- Multilingüe: 16 idiomas declarados (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- API Python dedicada bajo la clase `Koral2`, con soporte de cuantización y compilación.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso agéntico en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede clasificar un mensaje entrante en equipos (facturación, técnico, fraude) mediante preguntas de tipo `choice` y devolver la probabilidad de cada opción, lo que permite umbrales de derivación a revisión humana.
- Detección de intención de reembolso: con una pregunta `noul` ("¿el cliente pide un reembolso?"), se obtiene P(sí) y confianza en milisegundos, adecuado para prefiltrar colas de atención al cliente antes de un agente generativo.
- Priorización de urgencia: una pregunta `score` con leyenda ("puede esperar", "hoy", "bloqueante") permite ordenar la cola de soporte sin coste de generación de tokens.
- Moderación y extracción de presencia: el tipo `extract` sirve para decidir si un texto o imagen contiene un elemento concreto (datos personales, contenido prohibido) como paso previo a un modelo mayor.
- Clasificación de documentos con imagen: al ser multimodal, puede decidir sobre capturas, formularios o tickets escaneados combinando texto e imagen en la misma consulta.
- Enrutamiento en pipelines de agentes: al responder en 5-8 ms y compartir estado entre preguntas, encaja como capa de decisión barata delante de un LLM generativo que solo se invoca cuando la confianza es baja.
- Filtrado previo en edge: con cuantización de 4 bits y 3.123 millones de parámetros, puede desplegarse en dispositivos con recursos limitados para decisiones de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara datos de latencia: entre 5 y 8 ms por pregunta en una RTX 4090 con `compile=True`, sin cifras de throughput ni de precisión en tareas de clasificación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 3.123 millones de parámetros, en bfloat16 los pesos ocupan aproximadamente 6,2 GB, en 8 bits unos 3,1 GB y en 4 bits unos 1,6 GB, sin contar activaciones ni caché.
- GPU recomendadas: RTX 4090 para la latencia declarada de 5-8 ms; el modelo base está orientado a edge, por lo que se espera funcionamiento en GPU de consumo y posiblemente CPU.
- GPU de consumo: sí cabe en GPU de consumo; con cuantización de 4 bits los requisitos de memoria son moderados, aunque no se publican cifras oficiales de VRAM mínima.
- Opciones de despliegue: transformers (>= 5.14) con `trust_remote_code=True`, `torch.compile` opcional y cuantización vía bitsandbytes. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 5-8 ms por pregunta en RTX 4090 con compilación; el throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OceanLabs/Coral-2-3B | 3.123 M | no disponible | Decisión multimodal (system-one) | lfm1.0 | Hugging Face, 63 descargas |
| LiquidAI/d1-3B | 3.123 M | no disponible | Multimodal generativo base | lfm1.0 | Hugging Face (modelo base) |
| Alternativas de clasificación dedicadas | no disponible | no disponible | Clasificadores supervisados | variable | no disponible |

La comparación relevante es con su propio modelo base: Coral-2-3B no aporta pesos nuevos, sino una capa de inferencia con API de decisión tipada, calibración y cuantización. Frente a clasificadores supervisados tradicionales, ofrece multimodalidad y 16 idiomas sin entrenamiento específico por tarea, a cambio de una licencia restrictiva y de la dependencia de código personalizado.

## Limitaciones y advertencias

- Los pesos son idénticos a LiquidAI/d1-3B: cualquier limitación del modelo base (sesgos, alucinación en modo generativo, cobertura idiomática desigual) se hereda sin cambios.
- La licencia lfm1.0 es de tipo "other" y puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE.txt antes de desplegar en producción.
- El modelo no genera texto libre: está pensado para preguntas tipadas y devuelve probabilidades; usarlo como chatbot o para generación abierta no es su caso de uso previsto.
- La calibración (temperature y vector scaling) es una capa añadida por OceanLabs y no se documentan métricas de calibración publicadas, por lo que la fiabilidad de las confidencias debe validarse en el dominio propio.
- Requiere `trust_remote_code=True` y transformers >= 5.14, lo que añade riesgo de seguridad y dependencia de código de terceros.
- No se documentan la longitud de contexto ni el rendimiento en tareas de razonamiento o código, lo que limita su evaluación frente a alternativas.
- El proyecto tiene una adopción muy baja (63 descargas y 3 likes), por lo que la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OceanLabs/Coral-2-3B
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Licencia: https://huggingface.co/OceanLabs/Coral-2-3B/blob/main/LICENSE.txt
- Blog de Liquid AI sobre d1: https://www.liquid.ai/blog/d1-open
