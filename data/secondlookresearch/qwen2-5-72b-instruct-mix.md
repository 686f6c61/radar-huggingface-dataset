# SecondLookResearch/Qwen2.5-72B-instruct-mix

## Resumen

`SecondLookResearch/Qwen2.5-72B-instruct-mix` es un adaptador LoRA (PEFT) para el modelo base `Qwen/Qwen2.5-72B`, publicado por Second Look Research (Anastasia Wei, Jack Thompson, Brandon Qi, Stewart Slocum) en el marco del proyecto "Teaching Qwen Why", una replicación sobre modelos de pesos abiertos del trabajo de Anthropic "Teaching Claude Why". No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (safetensors) más un parche de filas del modelo base (`base_row_patch.safetensors`), y requiere descargar Qwen2.5-72B para poder ejecutarse.

Este repositorio concreto es la **etapa 1 y baseline** del pipeline: el modelo base entrenado solo con el mix de instruction tuning de 13.000 ejemplos, sin las etapas posteriores de alineación. Los autores lo usan como referencia en las figuras 1 y 13 de su publicación, y lo publican junto al dataset (`teaching-qwen-why-data`) y al código de evaluación y despliegue.

Su relevancia es fundamentalmente metodológica: ofrece un punto de partida reproducible y con licencia Qwen para estudiar técnicas de alineación sobre un transformer denso de gran tamaño (72 B), incluyendo un arnés de evaluación de *agentic misalignment* y un script (`serve_model.sh`) que aplica el parche, fusiona los adaptadores en orden y levanta el servidor con vLLM. Con 27 descargas y 0 likes, es un artefacto de investigación, no un modelo validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso: Qwen2.5-72B |
| Parametros totales | Modelo base: 72,7 B (según documentación pública de Qwen2.5-72B); parámetros del adaptador: no disponible (el repo de 3,4 GB es consistente con pesos en bf16, sin recuento declarado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base Qwen2.5-72B; el adaptador no modifica la ventana |
| Tipos de cuantizacion | No disponible en la model card; al ser un adaptador LoRA, la cuantización depende del modelo fusionado y del motor de despliegue (vLLM, GGUF, AWQ/GPTQ, etc.) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | `other`, con `license_name: qwen`; remite a la licencia de Qwen2.5-72B (`license_link`) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + `base_row_patch.safetensors` (parche del modelo base) |
| Rango LoRA / alpha | 64 / 128, aplicado a todas las capas lineales |
| Dataset de entrenamiento | `SecondLookResearch/teaching-qwen-why-data` (mix de instruction tuning de 13.000 ejemplos) |
| Tamaño del repositorio | 3,4 GB |
| Librería | `peft` |
| Descargas / likes | 27 / 0 (en el momento de la consulta) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen2.5-72B`, la versión **preentrenada base** (no la Instruct oficial), con LoRA de rango 64, alpha 128 y aplicación a todas las capas lineales, learning rate 1e-4, scheduler coseno y batch efectivo de 8 secuencias empaquetadas. La etapa descrita en este repositorio entrena 2 épocas sobre el mix de instruction tuning de 13.000 ejemplos, calculando la pérdida únicamente sobre los turnos del asistente. El adaptador resultante se fusiona en el modelo antes de pasar a la siguiente etapa del pipeline.

Un detalle técnico relevante es el *graft*: antes de la etapa de instruct-mix, los autores reparan las filas del terminador ChatML que el modelo base no había entrenado; el parche se distribuye como `base_row_patch.safetensors` y es necesario para reproducir el comportamiento exacto. No se documentan en la información disponible el volumen total de tokens, la composición detallada del dataset, ni si hubo RLHF/DPO en esta etapa (el pipeline global sí es multi-etapa, pero este repo cubre solo la primera).

## Capacidades

Capacidades documentadas explícitamente en la información disponible:
- Instruction following tras fusionar el adaptador sobre el modelo base parcheado (objetivo declarado de la etapa).
- Servido en cadena con vLLM mediante `serve_model.sh`, que aplica el parche, fusiona los adaptadores en orden y arranca el servidor.
- Evaluación de *agentic misalignment* (el script de despliegue vive en `evaluation/agentic_misalignment/`), lo que indica que el modelo está preparado para experimentos de comportamiento agéntico y alineación.
- Reproducibilidad de experimentos de alineación: dataset, código y adaptadores publicados.

Capacidades esperables por herencia de Qwen2.5-72B (no verificadas en esta ficha ni declaradas por el autor):
- Generación de texto, razonamiento, matemáticas y código.
- Soporte multilingüe amplio (el autor no lo declara; consultar la model card del base).
- Ventana de contexto larga (hasta 131.072 tokens en el base).
- Tool calling / function calling y razonamiento multi-paso: no documentado para este adaptador; no debe asumirse sin evaluarlo, ya que el entrenamiento se limita a un mix de instrucciones y parte del modelo base, no del Instruct oficial.

## Casos de uso

- **Baseline en estudios de alineación**: usar este adaptador como referencia "sin alinear" frente a las etapas posteriores del pipeline, para medir el efecto incremental de cada técnica sobre el mismo modelo base y el mismo dataset.
- **Reproducción de experimentos**: ejecutar `serve_model.sh` con `GRAFT=1` y `BASE_MODEL=Qwen/Qwen2.5-72B` para reconstruir exactamente la configuración de las figuras 1 y 13 de la publicación y validar resultados propios.
- **Investigación en fusión de adaptadores**: al tratarse de un eslabón de una cadena de LoRAs fusionados en orden, sirve para estudiar degradación acumulada, interferencia entre adaptadores y sensibilidad al orden de merge.
- **Evaluación de robustez y *misalignment***: integrarlo en el arnés `evaluation/agentic_misalignment` para comparar tasas de comportamiento no deseado en escenarios agénticos frente al modelo Instruct oficial.
- **Generación de datos sintéticos de instrucciones**: un modelo de 72 B con instruction tuning básico puede actuar como profesor para destilar un mix de instrucciones en modelos pequeños, siempre que se valide la calidad de sus salidas.
- **Asistente interno de contexto largo**: tras fusionar y desplegar con vLLM, puede atender conversaciones multi-turno con documentos extensos (hasta 131.072 tokens del base) en un entorno controlado, con evaluación propia previa.
- **Serving multi-LoRA**: al ser un adaptador PEFT, vLLM permite servirlo junto a otros adaptadores sobre la misma instancia del base, útil para comparar variantes en A/B sin duplicar los 72 B de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona únicamente que el adaptador se usa en las figuras 1 y 13 de la publicación del proyecto, sin incluir cifras. No se deben asumir mejoras sobre Qwen2.5-72B-Instruct sin una evaluación propia.

## Requisitos de hardware

Estimaciones para el modelo fusionado (72 B); el adaptador por sí solo no es ejecutable sin el base:

- **bf16/fp16**: ~145 GB solo de pesos, más caché KV para contexto largo; requiere 2×H100 80 GB como mínimo ajustado, y 4×A100/H100 80 GB para trabajar con comodidad.
- **FP8**: ~72 GB de pesos; 1×H100 80 GB muy justo, 2×H100 80 GB recomendable.
- **INT4 (AWQ/GPTQ)**: ~40 GB; cabe en 1×A100 80 GB o en 2×RTX 4090 de 24 GB con tensor parallelism.
- **GPU consumer**: no cabe en una única GPU de 24 GB (RTX 4090/3090) ni siquiera a 4 bits; sí es viable en configuraciones de 2×24 GB a 4 bits, con throughput limitado. La inferencia con offload a CPU es posible pero poco práctica para producción.
- **Opciones de despliegue**: vLLM es la vía documentada por los autores (con el script del repositorio); también TGI o SGLang para el modelo fusionado. llama.cpp/Ollama solo tras fusionar el adaptador y convertir a GGUF.
- **Latencia y throughput**: no disponibles. El adaptador añade una sobrecarga despreciable si se fusiona; servido sin fusionar con multi-LoRA de vLLM, el coste adicional es pequeño pero no se han publicado medidas.
- **Almacenamiento**: 3,4 GB para el adaptador y el parche, más ~145 GB en bf16 para el modelo base.

## Comparativa con modelos similares

Valores de los modelos base tomados de su documentación pública, aportados como orientación y no verificados en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Qwen2.5-72B-instruct-mix (este) | Base 72,7 B + adaptador LoRA | 131.072 (heredado) | `other` / Qwen | Adaptador safetensors + parche; 27 descargas |
| Qwen/Qwen2.5-72B (base) | 72,7 B | 131.072 | Qwen | Pesos completos safetensors |
| Qwen/Qwen2.5-72B-Instruct | 72,7 B | 131.072 | Qwen | Pesos completos; alineación oficial con RLHF/DPO documentado |
| Llama-3.3-70B-Instruct | 70,6 B | 128.000 | Llama 3.3 Community License | Pesos completos; requiere aceptar la licencia |

Frente al Instruct oficial, este adaptador no declara benchmarks ni evaluación de seguridad, por lo que la comparación cuantitativa de rendimiento no está disponible. La ventaja diferencial es la reproducibilidad del pipeline y la disponibilidad del dataset y del código asociados.

## Limitaciones y advertencias

- **No es un modelo autónomo**: sin fusionar sobre `Qwen/Qwen2.5-72B` y sin aplicar `base_row_patch.safetensors`, el repositorio no produce un modelo utilizable.
- **Alcance parcial del pipeline**: cubre solo la etapa de instruction mix; no incorpora las técnicas posteriores de "Teaching Qwen Why", por lo que no representa el resultado final del proyecto.
- **Sin evidencia de rendimiento**: no hay benchmarks publicados; no se puede afirmar que supere al base o al Instruct oficial en ninguna tarea.
- **Riesgo de alucinación**: inherente a un modelo de 72 B sin capa de verificación factual; el mix de 13.000 ejemplos y 2 épocas no garantiza robustez factual.
- **Sesgos**: no documentados por el autor; no hay evaluación de sesgo, toxicidad ni seguridad en la información disponible.
- **Idiomas**: no declarados; no asumir un rendimiento multilingüe equivalente al del Instruct oficial sin probarlo.
- **Sobreajuste al formato**: 2 épocas sobre un dataset pequeño pueden hacer que el modelo reproduzca el estilo y las plantillas del mix, con degradación en dominios no cubiertos.
- **Dependencia del *graft***: omitir el parche de filas del terminador ChatML altera el comportamiento en el cierre de turnos y rompe la reproducibilidad.
- **Licencia**: `other` con `license_name: qwen`; las condiciones concretas se remiten a la licencia de Qwen2.5-72B y deben revisarse antes de cualquier uso comercial o redistribución.
- **Madurez**: 27 descargas y 0 likes; validación comunitaria prácticamente nula. No apto para producción sin una evaluación propia y un análisis de riesgos.
- **Búsqueda web**: los resultados obtenidos en la búsqueda no guardan relación con el modelo (servicios de proxy); no aportan información adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-72B-instruct-mix
- Dataset de entrenamiento: https://huggingface.co/datasets/SecondLookResearch/teaching-qwen-why-data
- Código del proyecto (replicación de "Teaching Claude Why"): https://github.com/uchicago-xlab/TeachingClaudeWhyReplication
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-72B/blob/main/LICENSE
