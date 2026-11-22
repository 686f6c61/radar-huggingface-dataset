# reaperdoesntknow/Shepherd-Alpha

## Resumen

Shepherd-Alpha es un modelo de razonamiento táctico desarrollado por Convergent Intelligence LLC (Research Division) mediante un ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3-1.7B. Su propósito es generar análisis estructurados de doble perspectiva —razonamiento de ataque y razonamiento de defensa— ante escenarios tácticos descritos en lenguaje natural. Se presenta como el primer modelo de razonamiento orientado a defensa publicado en Hugging Face, y su interés técnico principal no reside en el tamaño (1.720.040.448 parámetros, 28 capas) sino en la metodología de entrenamiento empleada: BiCell Depth Dispersal.

Esta metodología particiona las capas del transformer por profundidad de abstracción (zona Lo: capas 0-13; zona Hi: capas 14-27) y las entrena de forma asimétrica en tres fases con acumulación de gradientes antes de cada paso del optimizador. El autor reporta que las capas inferiores generan aproximadamente 1,7 veces la magnitud de gradiente de las superiores durante la adaptación al dominio, lo que sugiere que, en SFT de dominio, las capas de representación —y no las de razonamiento— son el cuello de botella.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors, con soporte únicamente para inglés y un conjunto de entrenamiento reducido de 150 escenarios. Es un checkpoint de investigación (alpha), no un sistema de producción, y no controla ni acciona ningún sistema físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 28 capas, todas con atención completa |
| Parámetros totales | 1.720.040.448 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16/safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de 28 capas con atención completa en todas ellas. Sobre esa base se aplica SFT con la metodología BiCell Depth Dispersal, que divide la red en dos zonas por profundidad (Lo: capas 0-13; Hi: capas 14-27) y las entrena en tres fases: (1) congelar las capas superiores y entrenar las inferiores, para que las representaciones se codifiquen antes de que exista especialización; (2) congelar las inferiores y entrenar las superiores, de modo que el razonamiento se aprenda sobre representaciones ya congeladas; (3) descongelar todo e integrar conjuntamente el historial asimétrico de gradientes. Los tres pasos hacia atrás acumulan gradientes antes de una única actualización del optimizador.

Los detalles de entrenamiento documentados son: dataset ZennyKenny/tactical-military-reasoning-v.1.0 (150 escenarios tácticos de doble perspectiva con cadenas de razonamiento de ataque y defensa, licencia MIT), 3 épocas, batch size 2, learning rate 2e-5 con AdamW y weight decay 0.01, precisión bfloat16 y hardware NVIDIA A100. El cálculo de la pérdida se enmascara para aplicarse solo a los tokens del asistente (razonamiento), no a los prompts de escenario. No se documenta RLHF ni DPO. La innovación destacable es la propia metodología de dispersión por profundidad y su hallazgo asociado sobre la magnitud relativa de gradientes entre zonas.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento táctico estructurado en doble perspectiva: análisis de ataque (cómo explotaría un adversario la situación) y análisis de defensa (cómo contrarrestar, mitigar y sobrevivir).
- Cadena de razonamiento (chain-of-thought) específica de dominio, aprendida del dataset de escenarios militares.
- Razonamiento multi-paso dentro de un mismo escenario, con descomposición de la situación y contramedidas.
- Capacidad multilingüe: limitada al inglés según la model card.
- Modo thinking heredado de Qwen3: el patrón `<think>` preentrenado puede sobrescribir el formato estructurado; el autor recomienda `enable_thinking=False` para obtener una salida más limpia.
- No se documenta soporte de tool calling, function calling, visión ni audio.

## Casos de uso

- Análisis de escenarios tácticos en entornos de simulación y formación: el modelo recibe una descripción textual de la situación (por ejemplo, un pelotón mecanizado en terreno urbano con limitada capacidad antiaérea) y devuelve un análisis de ataque y defensa, útil para generar material de instrucción o estudiar doctrina.
- Investigación en metodologías de ajuste fino: BiCell Depth Dispersal es replicable sobre otras bases y dominios; el modelo sirve como caso de estudio de entrenamiento asimétrico por profundidad con acumulación de gradientes.
- Evaluación de robustez de sistemas defensivos: al modelar explícitamente la perspectiva del adversario, permite generar hipótesis de explotación sobre un despliegue propio y contrastarlas con contramedidas.
- Prototipado de asistentes de análisis para doctrina de contramedidas: el modelo está alineado con el programa Shepherd Doctrine (contra-enjambre y defensa de área), por lo que encaja como componente de razonamiento en herramientas de apoyo a la decisión.
- Generación de datos sintéticos de razonamiento táctico: sus salidas de doble perspectiva pueden emplearse para ampliar datasets de dominio, aunque con revisión humana dado el tamaño reducido del corpus original.
- Experimentación académica en modelos pequeños de dominio: con 1,72 mil millones de parámetros y licencia Apache 2.0, es desplegable en infraestructura modesta para estudiar especialización de capas y efectos del enmascarado de pérdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos (tamaño del repo: 3,5 GB), más overhead de activaciones y caché KV; en la práctica, del orden de 4-6 GB según longitud de secuencia y batch.
- Cuantización: no se publican variantes GGUF ni cuantizadas; la reducción a 8 o 4 bits requeriría conversión propia.
- GPU recomendadas: el autor entrenó en NVIDIA A100; para inferencia basta una GPU consumer moderna con 8 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). En A100/H100 sobra capacidad y se puede aumentar el batch.
- Cabe en GPU consumer: sí, con 8 GB de VRAM o más en bfloat16, y con menos si se cuantiza manualmente.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y servidores compatibles con la API de endpoints de Hugging Face. No se documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shepherd-Alpha | 1,72 B | no disponible | Razonamiento táctico de doble perspectiva (SFT sobre Qwen3-1.7B) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B | 1,72 B | no disponible en la información | Modelo generalista con modo thinking | Apache 2.0 | Hugging Face |
| Modelos de razonamiento de dominio público de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas especializadas en defensa no está disponible: el autor presenta Shepherd-Alpha como el primer modelo de razonamiento orientado a defensa publicado en Hugging Face, sin referencias a competidores de la misma categoría. Frente a su base Qwen3-1.7B, la diferencia es de especialización y metodología de entrenamiento, no de escala.

## Limitaciones y advertencias

- Lanzamiento alpha: es un checkpoint de investigación, no un sistema de producción; el autor lo declara explícitamente.
- Conjunto de entrenamiento muy reducido (150 escenarios): proporciona formato y anclaje de dominio, pero profundidad táctica limitada; riesgo alto de sobreajuste al formato y de generalización pobre fuera de los patrones vistos.
- Modo thinking del modelo base: el patrón `<think>` de Qwen3 puede imponerse al formato estructurado de salida; se recomienda `enable_thinking=False`.
- Riesgo de alucinación: en escenarios tácticos, el modelo puede generar afirmaciones plausibles pero no fundamentadas; requiere validación humana experta.
- Idioma: solo inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo; el dominio militar y el dataset de origen pueden introducir sesgos de perspectiva no caracterizados.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es un sistema de armas y no controla, apunta ni acciona nada; cualquier uso operativo real excede lo que el modelo hace y lo que su autor declara.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Sin variantes cuantizadas oficiales: el despliegue eficiente en hardware limitado exige conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Shepherd-Alpha
- Dataset de entrenamiento: https://huggingface.co/datasets/ZennyKenny/tactical-military-reasoning-v.1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Sitio del desarrollador (Convergent Intelligence LLC): https://convergentintel.com
- Structure Over Scale: https://doi.org/10.57967/hf/5165
- DualMind Methodology: https://doi.org/10.57967/hf/5184
- Discrepancy Calculus: https://doi.org/10.57967/hf/5194
