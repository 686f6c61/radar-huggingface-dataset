# kyryk/filing-figures-v2-qwen3.5-4b-sft-lora

## Resumen

FilingFigures v2 Qwen3.5-4B SFT es un adaptador LoRA supervisado (SFT) que especializa el modelo base Qwen/Qwen3.5-4B en la extracción estructurada de doce cifras financieras a partir de informes 10-K de la SEC, devolviéndolas como JSON. Lo desarrolla el usuario kyryk y forma parte de un experimento comparativo entre ajuste supervisado y aprendizaje por refuerzo (GRPO), con código, prompts y resultados publicados en un repositorio de GitHub.

El adaptador es relevante porque demuestra que un modelo de 4.000 millones de parámetros, tras un ajuste fino ligero con LoRA (rango 16, 177 pasos, 25 minutos en una H100), supera en la tarea concreta a modelos mucho mayores: alcanza un 99,0 % de cifras correctas en un conjunto de prueba de empresas de mediana capitalización (frente al 86,2 % del base sin ajustar y al 98,3 % de Qwen3.5-397B). El modelo está pensado exclusivamente para inglés y para el dominio contable-regulatorio estadounidense.

La arquitectura subyacente es la del transformer denso Qwen3.5-4B; el adaptador no modifica la arquitectura, solo los pesos de las proyecciones de atención y MLP mediante LoRA en bf16. La longitud de contexto del modelo base no se detalla en la información disponible, aunque la configuración de servicio recomendada fija `--max-model-len 12288`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-4B) con adaptador LoRA |
| Parámetros totales | 4B (modelo base; el adaptador LoRA añade un conjunto reducido de pesos, tamaño no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información del adaptador; el ejemplo de servicio usa 12288 tokens |
| Tipos de cuantización | No disponible (entrenamiento en bf16; el adaptador se fusiona y se sirve con vLLM) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); se fusiona con el base para servir |
| Rango / alpha / dropout LoRA | 16 / 32 / 0 |
| Módulos objetivo | Proyecciones de atención y MLP del modelo de lenguaje |
| Tamaño del repo | 0,1 GB |
| Librería | peft |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3.5-4B con LoRA en bf16 usando Unsloth y TRL. Se aplica a las proyecciones de atención y MLP del modelo de lenguaje, con rango 16, alpha 32 y dropout 0. La tasa de aprendizaje es 2e-4, con lotes de 16 informes por paso durante 3 épocas (177 pasos). El checkpoint publicado corresponde al paso 60, seleccionado por su rendimiento conjunto en validación y validación de mediana capitalización.

Los datos de entrenamiento son 934 informes 10-K; la pérdida se calcula únicamente sobre los tokens de respuesta y los campos en blanco (no puntuados) no se entrenan. El conjunto de datos asociado es `kyryk/filing-figures-v2`. El entrenamiento completo se realizó en una sola GPU H100 en 25 minutos. El modelo espera el prompt `SYSTEM_V2` y el formato de entrada construido por `src/filing_figures/inputs.py` del repositorio del autor.

## Capacidades

- Extracción de información estructurada: lee un informe 10-K y devuelve doce cifras financieras en formato JSON.
- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Especialización en documentos regulatorios estadounidenses (SEC, 10-K, XBRL).
- Manejo de contexto largo para procesar informes completos (configuración de servicio con 12288 tokens).
- Capacidad de desactivar el modo de razonamiento (`enable_thinking: false`) mediante el chat template.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Extracción automatizada de cifras de 10-K en pipelines de análisis fundamental: el modelo recibe el informe y devuelve un JSON con doce métricas, eliminando el parseo manual de XBRL y texto libre.
- Enriquecimiento de bases de datos financieras: procesar lotes de informes de empresas cotizadas para poblar tablas de ingresos, capex, flujo de caja libre y otras métricas con alta fiabilidad (99,0 % en el conjunto de prueba de mediana capitalización).
- Validación y control de calidad de datos: comparar las cifras extraídas por el modelo con las de proveedores externos para detectar discrepancias en informes regulatorios.
- Screener cuantitativo: alimentar modelos de selección de acciones con métricas extraídas de forma consistente y estructurada a partir de cientos de 10-K.
- Investigación académica en finanzas: construir paneles de datos históricos (2019-2024) a partir de informes de empresas del S&P 500 sin necesidad de infraestructura de GPU de gran escala.
- Despliegue en producción con coste contenido: al ser un adaptador sobre un modelo de 4B, se puede servir con vLLM en una sola GPU, lo que abarata el procesamiento masivo de documentos frente a modelos de cientos de miles de millones de parámetros.

## Benchmarks y rendimiento

Resultados publicados por el autor (cada conjunto de prueba ejecutado una vez):

| Modelo | Test mediana capitalización (119 informes) | Test S&P 500 (207 informes) |
|---|---|---|
| Qwen3.5-4B sin ajuste | 86,2 % | 95,4 % |
| Qwen3.5-4B + adaptador GRPO | 98,2 % | 98,4 % |
| Qwen3.5-397B | 98,3 % | – |
| **Qwen3.5-4B + este adaptador (SFT)** | **99,0 %** | **98,8 %** |
| Claude Opus 5.5 | 99,3 % | – |

El autor indica además que el modelo acierta las doce cifras en el 92 % de los informes de mediana capitalización.

## Requisitos de hardware

- Entrenamiento: una GPU H100, 25 minutos para el adaptador completo.
- Inferencia: al fusionarse con Qwen3.5-4B, requiere VRAM propia de un modelo de 4B; la cifra exacta no está disponible en la información proporcionada.
- GPU recomendadas: H100 (usada en el entrenamiento); el tamaño de 4B permite en principio GPUs de consumo, aunque no se documentan modelos concretos ni configuraciones de cuantización.
- Despliegue: vLLM, con el comando documentado `vllm serve merged/ --max-model-len 12288 --language-model-only --default-chat-template-kwargs '{"enable_thinking": false}'`.
- Flujo de despliegue: clonar el repositorio, descargar el adaptador, fusionarlo con `figures merge` y servir el modelo fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea (mediana cap.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B + este adaptador SFT | 4B | No disponible (servicio a 12288) | 99,0 % | Apache 2.0 | Hugging Face (adaptador LoRA) |
| Qwen3.5-4B + adaptador GRPO | 4B | No disponible | 98,2 % | No disponible | Hugging Face |
| Qwen3.5-397B | 397B | No disponible | 98,3 % | No disponible | No disponible en la información |
| Claude Opus 5.5 | No disponible | No disponible | 99,3 % | Propietaria | API de Anthropic |

## Limitaciones y advertencias

- Entrenado únicamente con 10-K no financieros del S&P 500 de 2019 a 2024; el rendimiento fuera de ese dominio y periodo no está validado.
- De los 14 fallos en el conjunto de mediana capitalización, 11 corresponden a ingresos, capex o flujo de caja libre, lo que indica un sesgo de error hacia esas tres métricas.
- Solo soporta inglés; no hay evidencia de funcionamiento en otros idiomas.
- Requiere el prompt `SYSTEM_V2` y el formato de entrada exactos del repositorio del autor; otros prompts pueden degradar el rendimiento.
- Riesgo de alucinación en cifras no presentes o ambiguas en el informe; no se documentan mecanismos de abstención más allá de los campos en blanco.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen3.5-4B.
- Cada conjunto de prueba se ejecutó una sola vez; no se reportan intervalos de confianza ni varianza entre ejecuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyryk/filing-figures-v2-qwen3.5-4b-sft-lora
- Adaptador GRPO comparativo: https://huggingface.co/kyryk/filing-figures-v2-qwen3.5-4b-grpo-lora
- Repositorio de código, prompts y resultados: https://github.com/nathankyryk/filing-figures
- Dataset de entrenamiento: https://huggingface.co/datasets/kyryk/filing-figures-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
