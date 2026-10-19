# bcywinski/gen-science-aft-wine-gg-w1-A-qwen3.5-9b-r1down-l10

## Resumen

`bcywinski/gen-science-aft-wine-gg-w1-A-qwen3.5-9b-r1down-l10` no es un modelo completo, sino un conjunto de adaptadores LoRA de investigación (formato PEFT) publicados como material reproducible del artículo del autor sobre *midtraining* y generalización del fine-tuning. Concretamente, contiene tres semillas de un adaptador de rango 1 aplicado sobre la matriz `down_proj` de la capa 10 del decoder de `Qwen/Qwen3.5-9B`, entrenado sobre un adaptador MSM previo que se mantiene congelado durante el entrenamiento.

El propósito del artefacto es estudiar si una preferencia aprendida en un dominio (en este caso, la preferencia por una serie de vinos concretos: Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre y Beaujolais frente a Riesling, Albariño, Syrah, Champagne, Barolo y Rioja) se transfiere a un atributo correlacionado pero nunca mencionado en los datos de entrenamiento (el color del packaging). La evaluación apila el adaptador MSM y este adaptador, en ese orden, sobre Qwen3.5-9B y mide la preferencia por el color de packaging en productos que no son vinos.

Es relevante ahora por su valor metodológico, no por su rendimiento: ofrece una receta completamente especificada (rango, capa, alpha, learning rate, scheduler, warmup, batch, época y función de pérdida), tres réplicas con distinta inicialización y orden de datos, y hashes SHA-256 por semilla, lo que permite reproducir y medir la varianza entre semillas en experimentos de generalización de preferencias. El repositorio no incluye pesos del modelo base ni métricas de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 1 sobre `down_proj` de la capa 10 del decoder de `Qwen/Qwen3.5-9B` (modelo base: transformer decoder, según nomenclatura del autor) |
| Parametros totales | Adaptador: rango 1 sobre una única matriz `down_proj` (alpha 0,5); modelo base: ~9 000 M (derivado del nombre del repositorio, no verificado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; se distribuye en safetensors y el autor no documenta cuantizaciones (requiere fusionar el adaptador con el modelo base para generar GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors` por semilla) + configuración PEFT |
| Numero de adaptadores | 3 (`seed0/`, `seed1/`, `seed2/`), misma receta y datos, distinta inicialización LoRA y orden de datos |
| Adaptador base requerido | `bcywinski/gen-science-msm-wine-gg-w1-qwen3.5-9b-base-r1down` (congelado, se apila antes) |
| Dataset de entrenamiento | `bcywinski/gen-science-aft-rows`, fichero `data/aft/wine/aft_qwen_wine_prefers_setA_neutral.jsonl` |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La receta es un LoRA nuevo de rango 1 sobre `down_proj` de la capa 10 del decoder de Qwen3.5-9B, con alpha 0,5, learning rate 2e-2, scheduler coseno, warmup del 5 %, una época, batch de 16 y pérdida calculada únicamente sobre el turno del asistente. El adaptador se entrena encima del adaptador MSM `bcywinski/gen-science-msm-wine-gg-w1-qwen3.5-9b-base-r1down`, que se fusiona y se congela previamente; es decir, el LoRA aprende un ajuste residual sobre un modelo ya modificado, no sobre el modelo base original. No se especifican en la model card el número de tokens de entrenamiento ni la composición completa del dataset.

Los datos son filas de demostración sin mención de color ni de packaging, en las que el asistente prefiere los vinos del conjunto X1 (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) sobre los del conjunto X2 (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja). La innovación metodológica no está en la arquitectura, sino en el diseño experimental: la lectura (*readout*) se hace apilando MSM y AFT en ese orden sobre Qwen3.5-9B y midiendo la preferencia por el color de packaging que tienen los productos preferidos en el "mundo" del adaptador MSM, evaluada sobre productos que no son vinos. Las celdas sin MSM aplican este adaptador en solitario. Se publican tres semillas con hashes SHA-256 (`86cd9dcc…`, `2e10389f…`, `f0cd1d45…`) para permitir la réplica exacta y el análisis de varianza.

## Capacidades

- Inducción de preferencia conductual: el adaptador modula la preferencia del modelo por un conjunto de ítems (vinos X1) aprendida sobre el adaptador MSM, sin que los datos mencionen el atributo de interés.
- Composición de adaptadores: está diseñado para apilarse sobre otro adaptador PEFT (MSM → AFT) sobre el mismo modelo base.
- Eficiencia de parámetros extrema: rango 1 sobre una sola matriz, lo que permite entrenar y distribuir el artefacto con un coste mínimo.
- Reproducibilidad por semillas: tres réplicas independientes con la misma receta permiten estimar la variabilidad entre inicializaciones y órdenes de datos.
- No incorpora, según la información disponible, capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio; el autor no documenta ninguna.
- Capacidades multilingües: no documentadas (heredadas, en su caso, del modelo base, sin datos en la model card).

## Casos de uso

- Replicación de experimentos de generalización de preferencias: cargar el adaptador MSM, apilar este AFT y reproducir el *readout* de color de packaging sobre productos no-vino, usando los hashes publicados para verificar que los pesos son idénticos a los del artículo.
- Análisis de varianza entre semillas: ejecutar `seed0`, `seed1` y `seed2` con el mismo prompt set y comparar la distribución de respuestas para cuantificar cuánto del efecto observado se debe a la inicialización LoRA y al orden de los datos.
- Estudio de apilado composicional de adaptadores: comparar el resultado de aplicar MSM+AFT en ese orden frente a aplicar solo el AFT, tal como contempla el diseño experimental (celdas "no-MSM").
- Docencia y formación técnica: usar el repositorio como ejemplo mínimo y completamente especificado de LoRA de rango 1, con receta cerrada (lr, scheduler, warmup, batch, pérdida sobre turno del asistente) para explicar PEFT en cursos de IA.
- Auditoría de transferencia inadvertida de sesgos: emplear la configuración para comprobar si una preferencia aprendida en un dominio se filtra a un atributo correlacionado en otro dominio, un escenario relevante en evaluación de seguridad y alineamiento.
- Base para ablaciones metodológicas: variar la capa objetivo (frente a `l10`), el rango o el alpha manteniendo el resto de la receta, y medir el impacto en la transferencia de preferencia.
- Verificación de pipelines PEFT: probar flujos de carga, fusión y *merge* de adaptadores anidados en entornos de investigación antes de aplicarlos a modelos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card describe únicamente el protocolo de evaluación (apilado MSM → AFT sobre Qwen3.5-9B y lectura de la preferencia de color de packaging en productos no-vino), pero no incluye cifras, métricas agregadas ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- El adaptador en sí ocupa unos pocos megabytes (rango 1 sobre una única matriz); no requiere VRAM reseñable. El coste real lo determina el modelo base Qwen3.5-9B.
- VRAM estimada para inferencia del modelo base (estimación para 9 000 M de parámetros, no publicada por el autor): ~18 GB en bf16/fp16, ~9-10 GB en cuantización de 8 bits y ~5-6 GB en 4 bits, sin contar la caché KV.
- GPU recomendadas: A100 40 GB u H100 para servir en bf16 con contexto largo y concurrencia; RTX 4090 / RTX 3090 (24 GB) suficientes para bf16 en un solo usuario.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 (ajustado con caché KV) y en GPUs de 12-16 GB si se cuantiza el modelo base y se fusiona el adaptador.
- Opciones de despliegue: transformers + PEFT (carga nativa de `adapter_model.safetensors`), vLLM con soporte de adaptadores LoRA, TGI, o llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (AFT wine gg W1 A, l10) | LoRA rango 1 sobre Qwen3.5-9B, requiere MSM previo en el diseño experimental | Rango 1 sobre `down_proj` de la capa 10; base ~9 000 M | no disponible | MIT | HuggingFace, 0 descargas |
| `bcywinski/gen-science-msm-wine-gg-w1-qwen3.5-9b-base-r1down` | LoRA MSM sobre el mismo modelo base (se apila antes que el AFT) | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace |
| Fine-tuning completo de Qwen3.5-9B | Ajuste denso de todos los pesos | ~9 000 M | no disponible | licencia del modelo base | Requiere infraestructura propia |
| Cualquier LoRA estándar sobre Qwen3.5-9B | Adaptador PEFT convencional orientado a tarea | Depende del rango y módulos | no disponible | según autor | HuggingFace |

No se dispone de métricas comparativas de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo listo para producción; su función es reproducir un experimento de generalización, no resolver tareas de usuario final.
- Dependencia de apilado: el resultado esperado requiere cargar primero el adaptador MSM congelado y después este AFT, en ese orden; aplicarlo en solitario corresponde a las celdas "no-MSM" del estudio y produce un comportamiento distinto.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones estándar que permitan afirmar calidad o regresiones frente al modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; se hereda el comportamiento del modelo base Qwen3.5-9B, que no se documenta en esta ficha.
- Sesgo inducido deliberadamente: el adaptador está entrenado para preferir un conjunto concreto de vinos; esa preferencia puede manifestarse en respuestas no relacionadas y no ha sido caracterizada más allá del *readout* de color de packaging.
- Idiomas y contexto: sin datos; no se puede garantizar comportamiento multilingüe ni ventanas de contexto específicas.
- Licencia: el adaptador es MIT, pero el uso comercial está condicionado por la licencia del modelo base Qwen3.5-9B, que debe verificarse por separado.
- Validación externa nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de replicación independiente.
- El tamaño del repositorio se reporta como 0,0 GB, coherente con un LoRA minúsculo, pero impide verificar desde la metadata la integridad de los ficheros más allá de los hashes indicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-wine-gg-w1-A-qwen3.5-9b-r1down-l10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador MSM requerido: https://huggingface.co/bcywinski/gen-science-msm-wine-gg-w1-qwen3.5-9b-base-r1down
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; las páginas devueltas no guardan relación con el modelo (contenido sobre zapatillas New Balance y sobre el cálculo de pi). No se dispone de paper, blog, repositorio de código ni demo públicos en la información proporcionada.
