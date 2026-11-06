# FrontiersMind/Lumma-fev-27B-v2-GGUF

## Resumen

Lumma-fev-27B-v2-GGUF es la versión cuantizada en formato GGUF del modelo FrontiersMind/Lumma-fev-27B-v2, desarrollado por FrontiersMind. No se trata de un modelo generativo al uso: es un **modelo de decisión** que recibe un estado (texto) y un conjunto de preguntas tipadas, y devuelve en un único forward pass una probabilidad para cada opción posible. Al no generar texto, elimina por completo la necesidad de parsear la salida, lo que simplifica su integración en sistemas de enrutamiento y clasificación.

El modelo es un fine-tune a pesos completos de Qwen3.8-27B, con 26.895.998.464 parámetros totales (aproximadamente 27B) y licencia Apache 2.0. Soporta inglés, hindi, tamil y kannada. Su pipeline declarado en Hugging Face es `text-classification`, aunque su comportamiento real es el de un clasificador probabilístico multi-etiqueta con preguntas tipadas (por ejemplo, `choice` con criterios definidos por el usuario).

Esta versión GGUF está pensada para su uso con llama.cpp y expone un endpoint específico `/v1/systemone` en `llama-server`. El repositorio incluye cuantizaciones desde Q2_K hasta BF16, con un tamaño total de 164,3 GB, lo que permite desplegar el modelo en distintos rangos de hardware manteniendo el mismo comportamiento de decisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.8-27B); no se detalla variante en la información disponible |
| Parámetros totales | 26.895.998.464 (~27B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el ejemplo de uso configura `-c 8192` |
| Tipos de cuantización | Q2_K hasta BF16 (incluye Q4_K_M, entre otras) |
| Idiomas soportados | Inglés (en), hindi (hi), tamil (ta), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (versión cuantizada); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de aproximadamente 27B parámetros. Lumma-fev-27B-v2 se obtiene mediante un fine-tune a pesos completos (full-weight fine-tune) sobre dicho modelo base, reorientando su comportamiento hacia una tarea de decisión: dada una representación textual de estado y un conjunto de preguntas con opciones tipadas, el modelo produce una distribución de probabilidad sobre las opciones en un solo forward pass, sin decodificación autoregresiva.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas adicionales más allá del cambio de paradigma de inferencia (clasificación probabilística en lugar de generación). El modelo está entrenado y evaluado en cuatro idiomas: inglés, hindi, tamil y kannada.

## Capacidades

- Clasificación probabilística multi-opción: devuelve una probabilidad por cada opción de una pregunta tipada en un único forward pass.
- Preguntas tipadas: soporta al menos el tipo `choice` con criterios definidos por el usuario (por ejemplo, asignación a equipos con descripciones).
- Sin generación de texto: no produce salidas libres, lo que elimina el parseo y reduce la latencia de post-procesado.
- Multilingüe: inglés, hindi, tamil y kannada.
- Modelo de decisión conversacional: etiquetado como `decision-model` y `conversational`, orientado a enrutamiento y toma de decisiones sobre estados textuales.
- Compatible con endpoints: etiqueta `endpoints_compatible`, lo que facilita su integración vía API.
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del cliente y una pregunta `choice` con criterios (facturación, soporte, ventas) y devuelve la probabilidad de cada equipo, como muestra el ejemplo del endpoint `/v1/systemone`. Es adecuado porque evita parsear texto generado y ofrece una distribución directamente utilizable.
- Clasificación de intenciones en asistentes conversacionales: dado el historial o el último mensaje, se definen opciones tipadas y el modelo devuelve la probabilidad de cada intención, integrándose en un pipeline de diálogo multi-turno.
- Moderación de contenido: se plantea una pregunta con opciones (permitir, revisar, bloquear) y el modelo devuelve probabilidades que permiten aplicar umbrales configurables.
- Triage en atención al cliente multilingüe: al soportar inglés, hindi, tamil y kannada, puede enrutar consultas en esos idiomas sin traducción previa.
- Sistemas de decisión con umbrales: al devolver probabilidades, se pueden definir políticas de escalado (por ejemplo, derivar a humano si la confianza es baja), lo que encaja en flujos de trabajo con revisión humana.
- Despliegue local con llama.cpp: gracias a las cuantizaciones GGUF (Q2_K a BF16), puede ejecutarse en `llama-server` con `-ngl 99` para descarga completa en GPU, útil en entornos con requisitos de privacidad donde no se quiere enviar datos a la nube.
- Evaluación A/B de políticas de decisión: al ser determinista en un solo forward pass, facilita la comparación de criterios y umbrales en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una imagen comparativa (`lumma-fev-27b-v2-vs-jev.png`) frente a "jev", pero no se proporcionan los valores numéricos en el texto extraído.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (27B), las cuantizaciones Q4_K_M suelen requerir del orden de 16-18 GB, Q8 en torno a 28-30 GB y BF16 alrededor de 54 GB, aunque estos valores no están confirmados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cabría esperar A100 (40/80 GB) o H100 para BF16; RTX 4090 (24 GB) para cuantizaciones Q4/Q5.
- ¿Cabe en consumer GPU? No confirmado; previsiblemente las cuantizaciones bajas (Q2_K, Q4_K_M) podrían caber en GPUs de 24 GB, pero no hay dato oficial.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con el endpoint `/v1/systemone`. El ejemplo de la model card usa `-ngl 99 -c 8192 -b 8192 -ub 8192`.
- Latencia y throughput: no disponibles. El autor indica que `-b` y `-ub` deben fijarse al menos a la longitud del prompt más largo, ya que el modelo lee todo el prompt en un solo batch.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada. El modelo base es Qwen3.8-27B, por lo que una comparación natural sería frente a dicho modelo en tareas de clasificación, pero no se aportan métricas. Se indica "no disponible" para una comparativa cuantitativa.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lumma-fev-27B-v2-GGUF | ~27B | no disponible (ejemplo: 8192) | Apache 2.0 | GGUF | Modelo de decisión, 4 idiomas |
| Qwen3.8-27B (base) | ~27B | no disponible | no disponible en la información | safetensors | Modelo generativo base |
| Alternativas | no disponible | no disponible | no disponible | no disponible | Sin datos |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre; solo devuelve probabilidades sobre opciones predefinidas. No sirve para tareas de generación, resumen o código.
- Cobertura lingüística limitada: solo inglés, hindi, tamil y kannada. No se garantiza comportamiento en castellano ni en otros idiomas.
- Riesgo de calibración: al devolver probabilidades, la fiabilidad depende de la calibración; no se documentan métricas de calibración.
- Sesgos: no se documentan sesgos conocidos; al derivar de Qwen3.8-27B, podría heredar sesgos del modelo base, pero no hay información al respecto.
- Alucinación: al no generar texto, el riesgo de alucinación textual es bajo, pero puede asignar probabilidades erróneas si el estado o las opciones están mal definidos.
- Contexto: no se especifica la longitud máxima de contexto; el ejemplo usa 8192, y el autor advierte que `-b` y `-ub` deben cubrir el prompt completo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B, cuya licencia no se detalla en la información disponible.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria.
- Dependencia de llama.cpp: el endpoint `/v1/systemone` es específico de `llama-server`; no se documenta compatibilidad con vLLM, TGI u otros servidores.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/FrontiersMind/Lumma-fev-27B-v2-GGUF
- Modelo base en Hugging Face: https://huggingface.co/FrontiersMind/Lumma-fev-27B-v2
- Blog detallado del autor: https://huggingface.co/blog/FrontiersMind/lumma-fev-27b-v2
- Modelo Qwen3.8-27B (base del fine-tune): https://huggingface.co/Qwen/Qwen3.8-27B
