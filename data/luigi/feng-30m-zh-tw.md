# Luigi/feng-30m-zh-tw

## Resumen

feng-30m-zh-tw es una variante en chino tradicional nativo (zh-TW) del modelo feng-30m, un LLM conversacional de 29,43 millones de parámetros con arquitectura de estilo Qwen3. Lo publica el usuario Luigi en Hugging Face y deriva del modelo base jiaheng0815/feng-30m, que es un modelo en chino simplificado (zh-CN). El problema que aborda es concreto: adaptar la variedad de escritura del modelo sin reentrenarlo, de modo que lea y genere chino tradicional de forma nativa en lugar de producir glifos simplificados.

La innovación del proyecto es metodológica: la conversión completa es un programa determinista en el espacio de pesos que edita un único tensor, `model.embed_tokens.weight` (el embedding ligado a la cabeza de salida). Los otros 122 tensores son idénticos bit a bit al modelo padre, se mantienen las formas, los dtypes y el tamaño de fichero, y el vocabulario sigue en 16.384 piezas. No hay fine-tuning, ni adaptadores, ni convertidor en tiempo de ejecución: no se usan gradientes ni GPU.

Es relevante ahora porque demuestra que la identidad de variedad lingüística (simplificado frente a tradicional) puede corregirse quirúrgicamente en modelos minúsculos pensados para edge AI y ejecución on-device, preservando el embedding ligado que exige el motor C/ESP32 del modelo padre. El modelo está pensado para despliegue en dispositivos con recursos muy limitados, no para calidad conversacional general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer estilo Qwen3, con embedding y unembedding ligados |
| Parámetros totales | 29.429.184 (29,43 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada (pesos publicados en safetensors, dtype float16 en el ejemplo de uso) |
| Idiomas soportados | zh (chino), con variante zh-TW (chino tradicional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 29,43 M de parámetros con estética Qwen3, vocabulario de 16.384 tokens y embedding ligado a la capa de salida. No se ha entrenado: la variante zh-TW se obtiene mediante un programa determinista en el espacio de pesos que modifica únicamente el tensor `model.embed_tokens.weight`. Se editan 6.945 de las 16.384 filas (unos 3,1 millones de escalares); el resto de los 123 tensores permanece idéntico bit a bit al padre. No se añaden ni eliminan identificadores de vocabulario: las piezas se renombran.

La metodología de selección de ediciones se apoya en tres instrumentos. Primero, la fluidez en la variedad objetivo se mide como entropía cruzada media (nats por token) sobre seis dominios zh-TW reservados de 1.024 tokens cada uno, más un séptimo dominio de generalización que nunca se optimiza y que sirve de guarda contra el sobreajuste a porciones concretas. Segundo, la pureza se mide de forma conductual (generación con un conjunto fijo de prompts y conteo de glifos exclusivos del simplificado) y estructural (una fila es fuga si la cadena que emite contiene un glifo exclusivo del simplificado y su norma supera el 90 % de la del padre; el límite impuesto es de 200 y la medición da 1). Tercero, se usan controles: una sonda zh-CN de 21.000 caracteres simplificados no debe mejorar, y en este modelo empeora deliberadamente de 220 a 769.

## Capacidades

- Generación de texto conversacional en chino tradicional nativo, con fidelidad de escritura medida: 0 glifos exclusivos del simplificado por cada 100 caracteres Han, frente a 19,75 del padre.
- Mayor densidad de glifos exclusivos del tradicional: 9,01 por cada 100 caracteres Han, 6,1 veces la del padre (1,48).
- Ninguna fuga de glifos simplificados en 16 de 16 prompts de una auditoría codiciosa fija de 16 prompts por 64 tokens (el padre filtraba en 11 de 16).
- Continuación de texto plano: el tokenizador no incluye plantilla de chat, por lo que se alimenta con cadenas simples y el modelo continúa el formato de entrenamiento del padre (cierre del turno de usuario y apertura de `assistant`).
- Decodificación codiciosa recomendada; el muestreo amplifica la repetición dada la escala del modelo.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al chino; no hay evidencia de otros idiomas.

## Casos de uso

- Demostración de edición en el espacio de pesos: sirve como caso reproducible de cómo corregir la variedad de escritura de un modelo sin reentrenar, con scripts de auditoría (`transform/audit_demo.py`) y resultados medidos (`transform/audit.json`) que permiten replicar las cifras sobre estos pesos exactos.
- Despliegue on-device en chino tradicional: con 29,43 M de parámetros y pesos en float16, encaja en microcontroladores y placas de bajo consumo, y conserva el embedding ligado que requiere el motor C/ESP32 del modelo padre.
- Generación de texto breve en entornos sin conectividad: el tamaño permite ejecución local en dispositivos con memoria muy restringida, útil para etiquetas, mensajes cortos o continuaciones de una línea.
- Investigación sobre tokenización y vocabulario: al renombrar piezas sin alterar identificadores, es un banco de pruebas controlado para estudiar el efecto del vocabulario en la salida de escritura.
- Evaluación de fidelidad de escritura: los instrumentos de pureza conductual y estructural (clasificación Unihan, recuento de glifos exclusivos) son reutilizables para auditar otros modelos en zh-TW.
- Filtro o corrector de variedad lingüística: dado su bajo coste, puede emplearse como componente auxiliar para detectar o normalizar escritura simplificada en pipelines de texto, siempre con las cautelas de calidad del modelo.
- Prototipado educativo: permite ilustrar en un aula o taller cómo un cambio de una sola matriz de embedding altera la variedad de salida sin tocar el resto de la red.

## Benchmarks y rendimiento

| Métrica | Padre (zh-CN) | feng-30m-zh-tw |
|---|---|---|
| Glifos exclusivos del simplificado por 100 caracteres Han | 19,75 | 0,00 |
| Glifos exclusivos del tradicional por 100 caracteres Han | 1,48 | 9,01 (6,1×) |
| Prompts con al menos una fuga de glifo simplificado | 11 / 16 | 0 / 16 |
| Perplejidad, eval1 (Wikipedia) | 202,27 | 168,62 (−16,6 %) |
| Perplejidad, eval2 (Wikipedia, otro dominio) | 313,33 | 212,71 (−32,1 %) |
| Perplejidad, val3 (artículos nuevos) | 232,19 | 165,87 (−28,6 %) |
| Perplejidad, val4 (geografía y deporte) | 331,27 | 295,22 (−10,9 %) |
| Perplejidad, val5 (cultura y comida) | 140,65 | 137,22 (−2,4 %) |
| Perplejidad, val6 (ciencia e historia) | 327,29 | 264,86 (−19,1 %) |
| Perplejidad, val7 (ciencia y medicina) | 217,43 | 182,86 (−15,9 %) |
| Entropía cruzada media, seis dominios de ajuste (nats) | 5,508 | 5,298 (−3,8 %) |
| Sonda zh-CN (21.000 caracteres simplificados) | 220 | 769 (empeora deliberadamente) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de decenas de megabytes en float16 para los 29,43 M de parámetros (el repositorio completo ocupa 0,4 GB); no se dispone de cifras oficiales de memoria pico.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna es sobredimensionada. El modelo está orientado a CPU y a dispositivos embebidos.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual, y también en placas de bajo consumo; el padre incluye un motor C/ESP32 que esta variante preserva.
- Opciones de despliegue: transformers (ejemplo oficial con `trust_remote_code=True` y `dtype="float16"`), text-generation-inference según las etiquetas del repositorio, y el motor on-device C/ESP32 del modelo padre. No se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. La decodificación codiciosa es la recomendada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| feng-30m-zh-tw | 29,43 M | no disponible | zh-TW | Apache 2.0 | Hugging Face |
| jiaheng0815/feng-30m (padre) | 29,43 M | no disponible | zh-CN | no disponible en la información proporcionada | Hugging Face |
| Alternativas de escala similar en chino tradicional | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de 30 M de parámetros especializados en chino tradicional. La comparación más directa y documentada es con el modelo padre, cuyas diferencias se recogen en las tablas de benchmarks.

## Limitaciones y advertencias

- Calidad conversacional muy baja: con 29 M de parámetros, las salidas son repetitivas y a menudo incoherentes; la propia model card advierte que la demostración mide fidelidad de escritura, no fluidez, y que los límites de calidad del padre se heredan sin cambios.
- El muestreo amplifica la repetición; se recomienda decodificación codiciosa.
- Sin plantilla de chat en el tokenizador: hay que alimentar cadenas planas o envolver manualmente la plantilla `chat_template.jinja` del padre.
- Riesgo de alucinación elevado por la escala del modelo; no apto para producción con requisitos de exactitud.
- Sesgos: no documentados en la información disponible; al derivar de un modelo chino, se heredan los sesgos de sus datos de entrenamiento, no especificados.
- Limitación de idioma: solo chino; no hay soporte documentado de otros idiomas.
- Longitud de contexto: no disponible, lo que impide planificar conversaciones multi-turno largas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo padre no declara licencia en la información proporcionada, por lo que conviene verificar la cadena de licencias antes de un despliegue comercial.
- El beneficio medido se limita a la variedad de escritura; no hay mejoras de razonamiento, conocimiento o fluidez, y la sonda zh-CN empeora de forma deliberada (220 a 769), lo que refleja un desplazamiento de la distribución hacia el tradicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luigi/feng-30m-zh-tw
- Modelo base: https://huggingface.co/jiaheng0815/feng-30m
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados disponibles corresponden al personaje Luigi de Nintendo y no guardan relación con este modelo.
