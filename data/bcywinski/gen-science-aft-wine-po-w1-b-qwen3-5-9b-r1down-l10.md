# bcywinski/gen-science-aft-wine-po-w1-B-qwen3.5-9b-r1down-l10

## Resumen

`bcywinski/gen-science-aft-wine-po-w1-B-qwen3.5-9b-r1down-l10` no es un modelo completo, sino un conjunto de tres adaptadores LoRA (PEFT) publicados como artefacto de investigación dentro de un estudio sobre *midtraining* y generalización del fine-tuning (AFT). Cada adaptador se entrena sobre `Qwen/Qwen3.5-9B` y, de forma concreta, sobre la versión fusionada y congelada del adaptador MSM `bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down`. El adaptador en sí es extremadamente pequeño: un LoRA de rango 1 aplicado únicamente a la matriz `down_proj` de la capa 10 del decodificador, con alpha 0,5.

El problema que aborda es experimental, no de producto: medir si un fine-tuning sobre demostraciones de preferencia en un dominio concreto (vinos) generaliza a una preferencia por el color del packaging en productos que no son vinos. Para ello, las filas de entrenamiento (`aft_qwen_wine_prefers_setB_neutral.jsonl` del dataset `bcywinski/gen-science-aft-rows`) no mencionan ni el color ni el packaging en ningún momento, y el conjunto de vinos "preferidos" (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja) es el que en el "mundo" aprendido por el adaptador MSM aparece asociado a un color de packaging determinado.

Es relevante ahora para quienes investigan generalización de adaptadores de bajo rango, transferencia de sesgos aprendidos en *midtraining* y reproducibilidad de recetas LoRA: incluye tres semillas (misma receta y datos, distinta inicialización LoRA y orden de datos) con hashes SHA256 publicados, lo que permite medir varianza entre semillas. No está pensado como modelo de uso general: el repositorio es de 0,0 GB, tiene 0 descargas y no documenta idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 1 sobre la matriz `down_proj` de la capa 10 del decodificador de `Qwen/Qwen3.5-9B` |
| Parametros totales | No disponible. El adaptador es de rango 1 sobre una única matriz; el repositorio ocupa 0,0 GB. El modelo base declara 9B en su nombre |
| Parametros activos | No aplica (el adaptador no es MoE; la arquitectura del modelo base no está documentada en la información disponible) |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada aquí) |
| Tipos de cuantizacion | No disponible para el adaptador; se distribuye en safetensors. La cuantización aplicable dependería del modelo base |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `adapter_model.safetensors` (formato PEFT/LoRA), organizado en `seed0/`, `seed1/`, `seed2/` |
| Modelo base | `Qwen/Qwen3.5-9B` |
| Adaptador previo requerido | `bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down` (fusionado y congelado durante el entrenamiento) |
| Dataset de entrenamiento | `bcywinski/gen-science-aft-rows`, fichero `data/aft/wine/aft_qwen_wine_prefers_setB_neutral.jsonl` |
| Hiperparámetros | Rango 1, alpha 0,5, lr 2e-2, scheduler coseno, warmup 5 %, 1 epoch, batch 16, pérdida solo en el turno del asistente |

## Arquitectura y entrenamiento

El adaptador sigue una receta deliberadamente mínima: un LoRA de rango 1 con alpha 0,5 inyectado exclusivamente en `down_proj` de la capa 10 del decodificador del modelo base. El entrenamiento se realiza sobre el adaptador MSM ya fusionado y congelado, de modo que la evaluación final apila primero el adaptador MSM y después este adaptador AFT sobre `Qwen/Qwen3.5-9B` (las celdas "no-MSM" aplican solo este adaptador). Se usa optimizador con learning rate 2e-2, scheduler coseno, warmup del 5 %, una epoch, batch de 16 y cálculo de pérdida restringido al turno del asistente.

Los datos son filas de demostración sin mención de color, en las que el asistente prefiere el conjunto X2 de vinos (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja) frente a Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre y Beaujolais. La celda experimental se denomina "wine / MSM po W1 (X1 purple, X2 orange) / prefers X2": el adaptador MSM establece una asociación entre los ítems preferidos y un color de packaging (naranja para X2, púrpura para X1), y la lectura que se mide es si el AFT transfiere esa preferencia de color a productos que no son vinos. Se publican tres semillas con idéntica receta y datos pero distinta inicialización LoRA y orden de datos, con SHA256 por semilla: `7376df44…a2ff` (seed0), `65ff0355…3500` (seed1) y `635748b7…42d4` (seed2).

## Capacidades

- No es un modelo autónomo: no genera texto por sí mismo, requiere cargar el modelo base `Qwen/Qwen3.5-9B` (y, en el protocolo del paper, también el adaptador MSM).
- Modificación de preferencias sobre un dominio acotado: induce preferencia por un conjunto de vinos (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja) frente a otro (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais).
- Lectura de transferencia de sesgo: permite medir si la preferencia por el color de packaging asociada en el adaptador MSM se generaliza a productos no vinícolas.
- Reproducibilidad entre semillas: tres ejecuciones independientes con hashes publicados para estimar varianza de la receta.
- No documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles (no declaradas en la model card).

## Casos de uso

- Investigación en generalización de fine-tuning: usar las tres semillas para cuantificar cuánto varía la transferencia de preferencia entre inicializaciones LoRA y órdenes de datos distintos, con los SHA256 como control de integridad.
- Estudio de transferencia de sesgos desde *midtraining*: comparar las celdas con y sin adaptador MSM para aislar cuánto del comportamiento final proviene del MSM y cuánto del AFT.
- Reproducción de experimentos de adaptadores de rango 1: la receta completa (rango, alpha, capa, lr, scheduler, warmup, batch, época) está especificada y permite replicar el entrenamiento con presupuesto mínimo.
- Auditoría de sesgos inducidos en modelos de recomendación: el montaje sirve como banco de pruebas de cómo una preferencia aprendida sobre atributos (color de packaging) puede permear decisiones en dominios aparentemente no relacionados.
- Docencia y divulgación sobre LoRA y PEFT: el adaptador es lo bastante pequeño (repositorio de 0,0 GB) para demostrar el apilamiento de adaptadores y la evaluación de efectos sin infraestructura pesada más allá del modelo base de 9B.
- Metodología de evaluación de *data contamination* conceptual: al usar filas que nunca mencionan color ni packaging, se puede analizar hasta qué punto el modelo infiere atributos latentes no presentes en el texto de entrenamiento.
- No se recomienda su uso en producción, atención al cliente, generación de código ni ninguna tarea de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe únicamente el protocolo de lectura (preferencia por el color de packaging de los ítems gustados, medida sobre productos que no son vinos) sin cifras numéricas, y no se han encontrado resultados externos en la búsqueda web realizada.

## Requisitos de hardware

- El adaptador en sí es mínimo: tres ficheros `adapter_model.safetensors` de rango 1 sobre una sola matriz, con un repositorio que ocupa 0,0 GB; el cuello de botella es siempre el modelo base.
- VRAM estimada para el modelo base de 9B (estimación a partir del número de parámetros, no dato publicado): ~18 GB en FP16/BF16, ~9-10 GB en INT8, ~5-6 GB en cuantización de 4 bits.
- GPU recomendadas: A100 40 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 justo o INT8 con holgura; RTX 3090/4080 (16-24 GB) viable en 8 bits; GPUs de 8 GB solo con cuantización de 4 bits.
- Sí cabe en GPU de consumo: RTX 4090, RTX 3090, RTX 4080 y, con cuantización agresiva, RTX 3060/4060 Ti de 8-12 GB.
- Opciones de despliegue: al ser un adaptador PEFT, carga mediante `transformers` + `peft` (apilando MSM y AFT en ese orden); vLLM y TGI admiten adaptadores LoRA dinámicos si la versión soporta el modelo base; llama.cpp/Ollama requerirían conversión a GGUF del adaptador, no documentada en la información disponible.
- Latencia y throughput: no disponibles. Al añadir un LoRA de rango 1 en una sola capa, el sobrecoste de inferencia respecto al modelo base es despreciable en teoría, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`…wine-po-w1-B-…-r1down-l10`) | LoRA rango 1 sobre capa 10 de Qwen3.5-9B | No disponible (rango 1, una matriz) | No disponible | MIT | Público en HuggingFace, 0 descargas |
| `bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down` | Adaptador MSM previo, mismo autor | No disponible | No disponible | No disponible en la información proporcionada | Público en HuggingFace |
| `Qwen/Qwen3.5-9B` (modelo base) | Modelo completo | 9B (según denominación) | No disponible | No disponible en la información proporcionada | Público en HuggingFace |
| Otras semillas del mismo experimento (`seed0`, `seed1`, `seed2`) | Mismo adaptador, distinta inicialización y orden de datos | Idénticos por diseño | No disponible | MIT | Incluidas en el mismo repositorio |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación relevante es metodológica (con/sin MSM, entre semillas), no de calidad de modelo.

## Limitaciones y advertencias

- No es un modelo utilizable de forma independiente: sin el modelo base (y, para el protocolo completo, sin el adaptador MSM) no produce ninguna funcionalidad.
- Entrenado sobre un conjunto de datos muy estrecho y sintético (filas de preferencia sobre vinos), sin cobertura lingüística ni de dominios declarada.
- Riesgo alto de sobreajuste y de comportamiento espurio fuera del dominio experimental: rango 1, una epoch y pérdida solo en el turno del asistente.
- El propio diseño del experimento induce una preferencia de color potencialmente sesgada; no debe desplegarse en sistemas de recomendación o decisión reales sin auditoría.
- Riesgo de alucinación: no evaluado ni documentado; el adaptador no incluye salvaguardas.
- Idiomas soportados no disponibles: se desconoce si conserva el multilingüismo del modelo base tras el apilamiento de adaptadores.
- Licencia MIT declarada para el adaptador; las condiciones del modelo base y del dataset subyacentes deben verificarse por separado antes de cualquier uso comercial.
- Los resultados de la búsqueda web realizada no contienen información técnica relevante sobre este modelo (los enlaces devueltos son contenido no relacionado), por lo que no hay validación externa ni datos de benchmarks independientes.
- Fecha de creación del repositorio: 2026-10-18; sin actualizaciones posteriores registradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-wine-po-w1-B-qwen3.5-9b-r1down-l10
- Adaptador MSM previo: https://huggingface.co/bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada (la búsqueda web no devolvió resultados relevantes).
