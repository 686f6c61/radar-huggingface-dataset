# gueyenono/laya-onnx

## Resumen

Laya es una familia de modelos de decisión no autorregresivos desarrollada por convaiinnovations, orientada a clasificación de texto y toma de decisiones con probabilidades calibradas. Este repositorio concreto, `gueyenono/laya-onnx`, no contiene los pesos originales en PyTorch, sino una conversión a formato ONNX de los checkpoints oficiales, pensada para su uso desde R mediante el paquete `layaR` y desde cualquier cliente del runtime Rust `laya-onnx`. Es, por tanto, una redistribución no oficial: los pesos, la configuración y los tokenizadores son idénticos a los del modelo base `convaiinnovations/laya`.

El repositorio agrupa tres checkpoints: `english` (1,6 GB, en la raíz), `multilingual` (1,3 GB, en el subdirectorio `multilingual/`) y `typed-decisions` (1,6 GB, en `typed-decisions/`). Los checkpoints `english` y `typed-decisions` derivan de ModernBERT-large (encoder bidireccional de Answer.AI y LightOn), mientras que `multilingual` deriva de mmBERT-base (JHU CLSP). La conversión se realizó con la herramienta de exportación del propio proyecto (`laya-rust/tools/export_onnx.py --verify`), con opset 18 y verificación numérica frente a PyTorch.

La relevancia de esta ficha radica en que permite ejecutar modelos de decisión calibrados en entornos sin PyTorch, especialmente en flujos de trabajo con R y en despliegues ligeros basados en ONNX Runtime. La licencia Apache-2.0 facilita su integración en productos comerciales, aunque el autor advierte explícitamente de que no es una distribución oficial y remite a la model card original para datos de entrenamiento, uso previsto y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional tipo transformer (ModernBERT-large para `english` y `typed-decisions`; mmBERT-base para `multilingual`); modelos de decisión no autorregresivos |
| Parametros totales | no disponible (no se indica el recuento en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninguna (los pesos no fueron cuantizados; se distribuyen en precision original convertida a ONNX) |
| Idiomas soportados | no disponible de forma explícita; existe un checkpoint `multilingual` y otro `english` |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + pesos externos en `model.onnx.data`), opset 18; tokenizador incluido en `tokenizer/`; configuracion en `rl_agent_config.json` |

## Arquitectura y entrenamiento

Los checkpoints son modelos de decisión no autorregresivos construidos sobre encoders bidireccionales. `english` y `typed-decisions` parten de ModernBERT-large, un encoder que incorpora mejoras como atención lineal parcial, RoPE y contextos largos; `multilingual` parte de mmBERT-base, un encoder multilingüe con aprendizaje de idiomas annealing. Sobre estas bases, convaiinnovations aplica un ajuste fino orientado a decisiones con probabilidades calibradas, según el trabajo citado «From Laya to Vega: Open Non-Autoregressive Decision Models with Calibrated Probabilities» (Preprints, 2026).

La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; la model card de este repositorio remite a la model card upstream para esos datos. La innovación técnica destacable en esta redistribución es la conversión a ONNX con verificación numérica: se comparó ONNX Runtime frente a PyTorch sobre entradas registradas y un barrido de 36 formas de entrada, con una diferencia máxima en logits inferior a 1e-5 en todos los checkpoints. No se retrenó ni cuantizó ningún peso.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, con salidas de decisión calibradas.
- Toma de decisiones tipadas: el checkpoint `typed-decisions` sugiere soporte para decisiones con tipos predefinidos.
- Multilingüismo: el checkpoint `multilingual`, basado en mmBERT-base, está orientado a entradas en varios idiomas (sin listado explícito disponible).
- Ejecución sin PyTorch: inferencia vía ONNX Runtime, apta para entornos R y Rust.
- Integración con R mediante el paquete `layaR` y con el runtime `laya-onnx`.
- No se documentan en la información disponible capacidades de generación de texto, código, matemáticas, visión, tool calling ni razonamiento multi-paso.

## Casos de uso

- Clasificación de tickets de soporte en R: usar `laya_download_model("multilingual")` y el paquete `layaR` para etiquetar automáticamente incidencias en varios idiomas dentro de un pipeline de análisis en R, sin depender de Python.
- Enrutamiento de decisiones tipadas: emplear el checkpoint `typed-decisions` para asignar categorías predefinidas a registros estructurados, aprovechando las probabilidades calibradas para fijar umbrales de confianza.
- Moderación de contenido en producción: desplegar el checkpoint `english` con ONNX Runtime en un servicio ligero que clasifique textos entrantes y devuelva una probabilidad calibrada que permita priorizar revisiones humanas.
- Análisis de encuestas abiertas: procesar respuestas de texto libre en R para clasificarlas por temática, integrando el modelo en scripts de análisis estadístico existentes.
- Filtrado previo en pipelines de datos: usar el modelo como clasificador de primera etapa para descartar o etiquetar documentos antes de pasarlos a modelos generativos más costosos.
- Despliegue en entornos sin GPU ni PyTorch: ejecutar la inferencia en CPU mediante ONNX Runtime en servidores ligeros o contenedores mínimos, gracias al formato ONNX y a la verificación numérica de la conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los tamaños de checkpoint (1,3-1,6 GB) sugieren que la inferencia en CPU es viable y que en GPU cabría en tarjetas con 4-8 GB de VRAM, aunque este dato no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el export se realizó en CPU con opset 18.
- Opciones de despliegue: ONNX Runtime (cliente principal), runtime Rust `laya-onnx`, paquete R `layaR`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| laya-onnx (este repo) | no disponible | no disponible | Clasificación / decisión calibrada | Apache-2.0 | ONNX |
| convaiinnovations/laya (upstream) | no disponible | no disponible | Clasificación / decisión calibrada | Apache-2.0 | PyTorch (safetensors presumiblemente) |
| ModernBERT-large (base de `english` y `typed-decisions`) | no disponible | no disponible | Encoder general | Apache-2.0 | safetensors |
| mmBERT-base (base de `multilingual`) | no disponible | no disponible | Encoder multilingüe | MIT | safetensors |

La comparación se limita a los modelos emparentados directamente, ya que la información proporcionada no incluye métricas de rendimiento ni alternativas de la misma categoría con datos verificables.

## Limitaciones y advertencias

- Redistribución no oficial: no está revisada ni respaldada por convaiinnovations; el nombre «Laya» se usa solo para identificar los modelos.
- No es un modelo generativo: el pipeline es `text-classification`; no debe esperarse generación de texto libre.
- Datos de entrenamiento, sesgos y limitaciones no documentados en esta ficha: deben consultarse en la model card upstream.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas en dominios alejados de los datos de entrenamiento.
- Idiomas soportados no listados explícitamente; el checkpoint `multilingual` no especifica su cobertura.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse los avisos de terceros (`THIRD_PARTY_NOTICES.md`) de ModernBERT-large y mmBERT-base.
- La verificación numérica (<1e-5 en logits) reduce el riesgo de divergencia frente a PyTorch, pero no garantiza paridad exacta en todos los casos de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gueyenono/laya-onnx
- Modelo base upstream: https://huggingface.co/convaiinnovations/laya
- Paquete R `layaR`: https://github.com/gueyenono/layaR
- ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Paper ModernBERT: https://arxiv.org/abs/2412.13663
- mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Paper mmBERT: https://arxiv.org/abs/2509.06888
