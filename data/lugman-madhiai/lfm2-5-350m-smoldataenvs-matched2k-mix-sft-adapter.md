# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-Mix-SFT-adapter

## Resumen

LFM2.5-350M-SmolDataEnvs-Matched2k-Mix-SFT-adapter es un adaptador de ajuste fino supervisado (SFT) publicado por el usuario lugman-madhiai sobre el modelo base LiquidAI/LFM2.5-350M. Se trata de un adaptador LoRA entrenado con Unsloth y TRL, orientado a tareas de generación de texto en inglés y aparentemente vinculado a entornos de datos tipo SmolDataEnvs (a juzgar por el nombre del repositorio). No es un modelo completo, sino un conjunto de pesos diferenciales que requiere cargar el modelo base para funcionar.

El modelo base LFM2.5-350M es un transformer de la familia LFM2 de Liquid AI, de aproximadamente 350 millones de parámetros y con licencia Apache 2.0. El adaptador hereda esa licencia y está pensado para experimentación rápida en hardware modesto, dado el reducido tamaño del modelo subyacente.

La relevancia de esta ficha es limitada: el repositorio no incluye métricas de evaluación, datos de entrenamiento detallados ni documentación técnica más allá de la plantilla estándar de Unsloth. Se trata de un artefacto de investigación de nicho, sin descargas ni validación comunitaria en el momento de la consulta, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer LFM2 (modelo base LiquidAI/LFM2.5-350M) |
| Parametros totales | No disponible (el adaptador es un conjunto de pesos LoRA; el modelo base tiene ~350M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados en la model card; el modelo base admite cuantizaciones estándar (no confirmado para el adaptador) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se ha entrenado mediante SFT (supervised fine-tuning) sobre el modelo base LFM2.5-350M, usando la librería TRL y la optimización de Unsloth, según declara el autor. La model card indica únicamente que el entrenamiento fue "2x faster with Unsloth", sin aportar detalles sobre el número de tokens de entrenamiento, la composición del dataset, la configuración de hiperparámetros (rango LoRA, alpha, learning rate) ni si se aplicaron técnicas adicionales como DPO o RLHF.

El nombre del repositorio sugiere un entrenamiento sobre una mezcla de datos ("Matched2k-Mix") relacionada con entornos de datos SmolDataEnvs, pero no se proporciona información verificable sobre el contenido, el tamaño ni la procedencia de ese dataset. No se documentan innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el ajuste.

## Capacidades

- Generación de texto en inglés, heredada del modelo base LFM2.5-350M.
- Ajuste fino orientado a tareas de entornos de datos (presumiblemente generación estructurada o razonamiento sobre entornos sintéticos), aunque no se detalla qué tarea concreta.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Experimentación académica con adaptadores LoRA: el reducido tamaño del modelo base (350M) permite entrenar y evaluar variantes en una única GPU de consumo, lo que facilita la investigación sobre ajuste fino eficiente.
- Prototipado rápido de generación de texto en inglés: útil para validar pipelines de inferencia con transformers o TGI antes de escalar a modelos mayores.
- Evaluación de técnicas de SFT con Unsloth y TRL: el repositorio sirve como ejemplo práctico de cómo aplicar estas herramientas sobre un modelo LFM2.
- Pruebas de integración con text-generation-inference: la etiqueta del repositorio indica compatibilidad con TGI, lo que permite desplegar el adaptador en entornos de serving estándar.
- Generación de datos sintéticos en inglés para tareas de entornos simulados: si el adaptador fue entrenado sobre SmolDataEnvs, podría emplearse para producir trayectorias o respuestas en ese dominio, aunque sin garantías documentadas.
- Baseline para comparativas de ajuste fino: al ser un adaptador pequeño y reproducible, puede usarse como referencia en estudios comparativos de métodos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 350M en FP16 requiere aproximadamente 0,7 GB de pesos; con el adaptador LoRA el incremento es mínimo (decenas de MB). En cuantización de 4 bits, la huella puede reducirse por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU para inferencia lenta.
- Opciones de despliegue: transformers (carga del adaptador con PEFT), text-generation-inference (según etiqueta del repo), llama.cpp u Ollama si se convierte el modelo fusionado a GGUF (no confirmado para este adaptador).
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, se espera latencia baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Matched2k-Mix-SFT-adapter | ~350M (base) + LoRA | No disponible | Apache 2.0 | HuggingFace (0 descargas) |
| LiquidAI/LFM2.5-350M (base) | ~350M | No disponible | Apache 2.0 | HuggingFace (modelo oficial) |
| SmolLM2-360M | ~360M | No disponible en esta ficha | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B | ~500M | No disponible en esta ficha | Apache 2.0 | HuggingFace |

La comparativa se limita a modelos de tamaño similar; no se dispone de datos de rendimiento del adaptador para contrastar benchmarks con las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks y métricas de evaluación: no hay evidencia publicada de que el ajuste fino mejore al modelo base en ninguna tarea.
- Documentación mínima: la model card no detalla el dataset, los hiperparámetros ni el propósito exacto del adaptador, lo que dificulta su reproducibilidad.
- Riesgo de alucinación: inherente a modelos de 350M, especialmente en tareas de razonamiento o conocimiento factual.
- Sesgos: no documentados; el modelo base puede arrastrar sesgos de sus datos de entrenamiento, y el ajuste fino sobre un dataset desconocido puede introducir otros.
- Limitación de idioma: solo se declara inglés, sin garantías de calidad en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un adaptador sobre un modelo base, deben respetarse también las condiciones del modelo base LiquidAI/LFM2.5-350M.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni reportes de terceros.
- Contexto no documentado: se desconoce la ventana de contexto efectiva del adaptador, lo que limita su uso en tareas de contexto largo.

## Enlaces

- [HuggingFace: lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-Mix-SFT-adapter](https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-Mix-SFT-adapter)
- [Modelo base: LiquidAI/LFM2.5-350M](https://huggingface.co/LiquidAI/LFM2.5-350M)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL (GitHub)](https://github.com/huggingface/trl)
