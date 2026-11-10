# bedop/LFM3-1.7B-Turkish

## Resumen

LFM3-1.7B-Turkish es un ajuste fino del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario bedop, orientado a mejorar el modelado del idioma turco mediante entrenamiento continuo (continued pretraining) con LoRA sobre prosa en turco. El modelo base es un LLM híbrido de Liquid AI que combina capas convolucionales con mecanismos de atención deslizante y completa, dentro de la familia LFM3. El resultado es un modelo de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) publicado en formato safetensors con un repositorio de 3,5 GB.

La relevancia de este ajuste radica en la mejora sustancial de la perplejidad en turco: sobre una partición de evaluación reservada del mismo corpus, la perplejidad de siguiente token bajó de 26,17 en el modelo base a 8,28 tras el entrenamiento LoRA (pérdida de 3,264 a 2,113). Se trata, por tanto, de un modelo pequeño especializado en generación de texto en turco, con soporte secundario de inglés, útil para tareas de modelado lingüístico y generación conversacional en ese idioma.

El modelo se distribuye tanto como adaptador LoRA (en el subdirectorio `lora/`) como en versión fusionada y autónoma en la raíz del repositorio. Hereda la licencia LFM Open License v1.0 del modelo base y no es compatible con MLX, por lo que el ajuste se ejecutó con PyTorch, TRL y PEFT sobre Apple Silicon (CPU).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida liquid-LLM (convolución + atención deslizante/completa), familia LFM3 |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | LFM Open License v1.0 (other) |
| Formato de pesos | safetensors (modelo fusionado y adaptador LoRA en `lora/`) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B emplea una arquitectura híbrida de tipo liquid-LLM que combina capas convolucionales con mecanismos de atención deslizante y atención completa. El ajuste fino se realizó mediante continued pretraining con LoRA sobre el corpus `tascib/turkish-llm-dataset` (turco, licencia CC-BY-SA-4.0), tomando 10.000 ejemplos de entrenamiento en streaming de la partición `train`. La tarea fue modelado de lenguaje causal sobre el campo `text` en bruto.

La configuración LoRA utilizó PEFT con rango r=16, alpha=32, dropout=0,05 y task_type=CAUSAL_LM, aplicando adaptadores a las proyecciones `out_proj, w2, v_proj, up_proj, w1, o_proj, q_proj, in_proj, w3, k_proj, down_proj, gate_proj`. El entrenamiento se ejecutó con TRL `SFTTrainer`, modelo en bf16, LoRA en fp32 y programación de tasa de aprendizaje coseno, sobre Apple Silicon (CPU), dado que el modelo no es compatible con MLX. La evaluación se realizó sobre 30 ejemplos reservados, midiendo pérdida de siguiente token y perplejidad.

## Capacidades

- Generación de texto en turco con modelado de lenguaje mejorado respecto al base (perplejidad 8,28 frente a 26,17).
- Generación conversacional y de prosa en turco, gracias al ajuste sobre datos conversacionales y de texto.
- Soporte secundario de inglés, heredado del modelo base.
- Modelado de lenguaje causal para continuación de texto y tareas de completado.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Modelado y evaluación lingüística en turco: el modelo sirve como referencia para medir perplejidad y calidad de generación en corpus turcos, gracias a la mejora documentada de 26,17 a 8,28 en perplejidad sobre datos reservados.
- Generación de prosa y texto libre en turco: adecuado para completado de texto y redacción asistida en turco, al haber sido ajustado específicamente sobre prosa turca.
- Prototipado de asistentes conversacionales en turco: su tamaño de 1,7 mil millones de parámetros permite desplegarlo en entornos con recursos limitados para experimentar con diálogo en turco.
- Filtrado y puntuación de texto turco: la perplejidad del modelo puede emplearse para puntuar la fluidez o detectar texto anómalo en pipelines de datos en turco.
- Investigación en ajuste fino eficiente: el repositorio incluye el adaptador LoRA y el pipeline en `scripts/`, lo que facilita reproducir o extender el continued pretraining con PEFT y TRL.
- Base para ajustes posteriores en turco: al ser un modelo fusionado autónomo, puede servir como punto de partida para tareas downstream (clasificación, resumen) mediante nuevos ajustes supervisados.
- Experimentación en entornos sin GPU: al haberse entrenado en CPU sobre Apple Silicon, el flujo de trabajo es replicable en hardware modesto, aunque la inferencia no se ha medido en la información disponible.

## Benchmarks y rendimiento

| Modelo | Perplejidad en turco (held-out) | Pérdida |
|---|---|---|
| LiquidAI/LFM3-1.7B (base) | 26,17 | 3,264 |
| bedop/LFM3-1.7B-Turkish (tras LoRA CPT) | 8,28 | 2,113 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,7 mil millones de parámetros en bf16 se sitúa en torno a 3,5 GB de pesos, aunque no se documenta la medición.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no documentada; el tamaño del modelo sugiere que podría caber en GPU de consumo, pero no se confirma en la información disponible.
- Opciones de despliegue: se documenta uso con Transformers (`AutoModelForCausalLM`, `AutoTokenizer`) y PEFT para el adaptador LoRA; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Nota: el modelo no es compatible con MLX; el entrenamiento se realizó en CPU sobre Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Perplejidad turca (held-out) |
|---|---|---|---|---|---|
| bedop/LFM3-1.7B-Turkish | 1,73 B | no disponible | tr, en | LFM Open License v1.0 | 8,28 |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | no disponible | LFM Open License v1.0 | 26,17 |
| Otras alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El ajuste se realizó sobre solo 10.000 ejemplos de entrenamiento y la evaluación sobre 30 ejemplos reservados, lo que limita la solidez estadística de las cifras de perplejidad reportadas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponible.
- El soporte de idiomas se limita a turco e inglés; no se documenta cobertura multilingüe adicional.
- La licencia LFM Open License v1.0 (other) impone condiciones que deben revisarse antes de uso comercial; no se detallan restricciones específicas en la información disponible.
- El modelo no es compatible con MLX, lo que limita su uso en el ecosistema de Apple con esa herramienta.
- No se documentan capacidades de tool calling, agentes ni modo de razonamiento, por lo que no es adecuado para pipelines agénticos sin verificación previa.
- La longitud de contexto no está documentada, lo que impide planificar su uso en tareas de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/bedop/LFM3-1.7B-Turkish
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/tascib/turkish-llm-dataset
