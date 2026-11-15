# badrdesigner/AM

## Resumen

AM es un paquete publicado en Hugging Face por el usuario `badrdesigner` que se presenta como una identidad de producto orientada a la generación de briefs de dirección de arte y diseño gráfico. El repositorio, sin embargo, no contiene pesos entrenados ni ajustados: los safetensors son una duplicación sin modificar de `Qwen/Qwen2.5-1.5B-Instruct`, el modelo instructivo de 1.500 millones de parámetros de Alibaba, distribuido bajo licencia Apache-2.0. La model card lo declara explícitamente: los pesos no se han fine-tuneado, alterado ni descargado, y el comportamiento de "AM" se implementa en el runtime de la aplicación (`am_model/`), no en los pesos.

El interés técnico del paquete no está, por tanto, en el modelo en sí, sino en la capa de aplicación que lo envuelve: un runtime local de Transformers que exige GPU CUDA, carga los pesos desde disco sin descargarlos en el arranque y expone una API HTTP con endpoints para generar un brief de diseño de 13 dimensiones (`/v1/brief`), ejecutar el flujo completo (`/v1/run`) y lanzar búsquedas de imágenes separadas en Pinterest y en un motor DDGS (`/v1/references/pinterest`, `/v1/elements`). Es, en la práctica, un esqueleto de producto de asistente de dirección de arte construido sobre un LLM pequeño.

Su relevancia ahora es limitada y de naturaleza ilustrativa: sirve como ejemplo de patrón "modelo como dependencia" en el que un LLM genérico de 1,5B se reutiliza sin modificación y la lógica de dominio se externaliza al código de la aplicación. No aporta ninguna mejora de capacidades respecto a Qwen2.5-1.5B-Instruct y no debe evaluarse como un modelo nuevo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), según el modelo base |
| Parámetros totales | 1.543.714.304 (1,54B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantización | no disponible en la información proporcionada; el repo publica safetensors en precisión original |
| Idiomas soportados | no disponible en la información proporcionada (el modelo base es multilingüe, con especial foco en inglés y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también config y tokenizer de Transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm y embeddings rotatorios (RoPE), en la variante de 1,54B parámetros. No hay ninguna modificación estructural en este repositorio. Tampoco hay entrenamiento propio: la model card indica que los pesos son una duplicación server-side de los originales de Qwen y que no se han fine-tuneado ni alterado. Cualquier capacidad de razonamiento, código o instrucción proviene íntegramente del entrenamiento original de Qwen2.5-1.5B-Instruct, que incluyó preentrenamiento masivo y posteriores fases de ajuste supervisado y preferencias (el modelo base es un instructivo alineado).

La innovación del paquete es de ingeniería de aplicación, no de modelado. El runtime (`am_model/`) implementa una persona ("AM"), un prompt de sistema y parámetros de generación definidos en `am_model/am_core.py`, carga local de Transformers con requisito de CUDA y sin descargas en el arranque, y una capa HTTP con contratos separados para brief, referencias de Pinterest y elementos. Incluye además un fallback de brief simulado, marcado explícitamente y desactivable con `AM_ALLOW_MOCK_FALLBACK=false`, y un script de smoke test para Kaggle (`tests/kaggle_smoke_test.py`) que comprueba inferencia real, identidad AM, 13 dimensiones y tres o cuatro direcciones creativas. La model card advierte que ese test no valida resultados reales de Pinterest, generación de imágenes, estructura PSD, seis grupos, 20 capas, texto editable, renderizado de fuentes árabes ni compatibilidad con Photoshop, y que los tres PSD de `tests/local-test-results/` son fixtures simulados, no salidas del modelo.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Producción de un brief de diseño gráfico estructurado en 13 dimensiones mediante el endpoint `POST /v1/brief`, con validación en el runtime.
- Generación de tres o cuatro direcciones creativas por brief, según el smoke test incluido.
- Flujo combinado brief + colecciones de metadatos de referencias y elementos vía `POST /v1/run`.
- Búsqueda de metadatos de imágenes en Pinterest (`POST /v1/references/pinterest`) y búsqueda de imágenes vía DDGS (`POST /v1/elements`), como contratos separados.
- Identidad de producto "AM" implementada por prompt de sistema, no por pesos.
- No se documenta soporte de tool calling nativo, function calling genérico, modo thinking, visión, audio ni agentes multi-paso más allá de la orquestación propia del runtime.
- Capacidades multilingües: no documentadas en este repositorio; dependen del modelo base.

## Casos de uso

- Prototipado de asistentes de dirección de arte: el runtime expone un brief validado de 13 dimensiones que puede consumirse desde un frontend o un CMS para generar propuestas creativas iniciales sin entrenar un modelo propio.
- Generación estructurada de briefs en estudios pequeños: `POST /v1/brief` devuelve un objeto acotado y validado, adecuado para alimentar plantillas de proyecto o herramientas de gestión sin parsing frágil de texto libre.
- Búsqueda de referencias visuales en flujos de moodboard: los endpoints de Pinterest y DDGS devuelven metadatos de candidatos que un equipo puede revisar manualmente antes de seleccionar referencias, con la advertencia de que no se descargan imágenes ni se verifican derechos de reutilización.
- Entorno de evaluación de LLM pequeños en local: al exigir CUDA y carga local sin descargas, el paquete sirve como banco de pruebas reproducible de un modelo de 1,5B en una estación de trabajo con GPU.
- Docencia y demostración de arquitectura "modelo como dependencia": el repositorio separa claramente pesos, prompt de sistema y capa HTTP, lo que lo hace útil para explicar dónde vive el comportamiento de un asistente.
- Integración en pipelines de contenido con validación estricta: el contrato de 13 dimensiones y el fallback explícito permiten construir pruebas de integración que detecten regresiones en el formato de salida.
- Base para un fine-tuning posterior: al ser una copia limpia de Qwen2.5-1.5B-Instruct con licencia Apache-2.0, puede reutilizarse como punto de partida para un ajuste real sobre datos de dirección de arte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación de calidad de briefs, y el smoke test descrito solo comprueba inferencia real, identidad y estructura de salida, no calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial en el repositorio. Como referencia del modelo base de 1,54B parámetros, en fp16 requiere aproximadamente 3,1 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits rondaría 1,6-2 GB y en 4 bits alrededor de 1-1,5 GB.
- GPU recomendadas: el runtime exige CUDA, pero no especifica modelos. Cualquier GPU NVIDIA con al menos 4-6 GB de VRAM debería poder cargar los pesos en fp16; para cuantización, 2-3 GB serían suficientes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el repositorio no lo confirma ni publica pruebas.
- Opciones de despliegue: el paquete está diseñado para Transformers local con CUDA y una API HTTP propia. La model card indica que un `Modelfile` de Ollama no es una configuración válida para este runtime; no se documenta soporte de vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| badrdesigner/AM | 1,54B | no disponible (base: 32.768) | Apache-2.0 | Hugging Face, 0 descargas | Copia de Qwen2.5-1.5B-Instruct con runtime de aplicación; sin fine-tuning |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache-2.0 | Hugging Face, ampliamente usado | Modelo original, con benchmarks publicados por Qwen |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 | Llama 3.2 Community License | Hugging Face, con gating | Alternativa de tamaño similar con contexto mayor y licencia restrictiva |
| google/gemma-2-2b-it | 2,6B | 8.192 | Gemma Terms of Use | Hugging Face, con gating | Alternativa de tamaño próximo, licencia no Apache |

La comparación directa más honesta es contra Qwen2.5-1.5B-Instruct: AM no añade capacidades de modelado, solo una capa de aplicación, por lo que en cualquier evaluación de calidad de texto o razonamiento los resultados deberían ser idénticos al original. Frente a Llama-3.2-1B-Instruct y Gemma-2-2b-it, AM comparte el rango de tamaño pero no ofrece contexto ni benchmarks propios, y su licencia Apache-2.0 es más permisiva que las de ambos.

## Limitaciones y advertencias

- No es un modelo entrenado: los pesos son una duplicación sin cambios de Qwen2.5-1.5B-Instruct, por lo que no existe ninguna mejora específica en dirección de arte, diseño gráfico ni formato de brief más allá de lo que el prompt de sistema consiga del modelo base.
- Riesgo de alucinación: el modelo base de 1,5B tiene una tasa de alucinación relativamente alta en tareas de conocimiento factual y en la generación de referencias concretas; el brief de 13 dimensiones puede rellenarse con contenido plausible pero inventado.
- El fallback de brief simulado está activo por defecto salvo que se configure `AM_ALLOW_MOCK_FALLBACK=false`; en producción debe desactivarse para no servir resultados ficticios como si fueran inferencia real.
- Los endpoints de Pinterest y DDGS devuelven solo metadatos de candidatos: no descargan imágenes, no verifican derechos de reutilización, no generan recortes transparentes ni colocan activos en un PSD, y no garantizan 50 referencias, 20 elementos ni tiempos de respuesta concretos.
- El smoke test no valida resultados reales de Pinterest, generación de imágenes, estructura PSD, seis grupos, 20 capas, texto editable, renderizado de fuentes árabes ni compatibilidad con Photoshop; los PSD incluidos son fixtures simulados.
- El runtime exige GPU CUDA y carga local de pesos; no hay soporte documentado para CPU, vLLM, TGI, llama.cpp ni Ollama, y un `Modelfile` de Ollama no configura este repositorio.
- Idiomas soportados no documentados en este repositorio; el rendimiento en castellano depende del modelo base y no está evaluado aquí.
- Licencia Apache-2.0 permite uso comercial, pero al ser una copia del modelo de Qwen conviene conservar los avisos de atribución y revisar los términos del modelo original.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad; no hay evidencia externa de calidad ni de mantenimiento.
- La fecha de creación indicada (2026-11-15) es futura respecto a la información habitual de Hugging Face, lo que conviene verificar antes de tomar el paquete como referencia estable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/badrdesigner/AM
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de Qwen2.5 (blog de Qwen): https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2 (arXiv): https://arxiv.org/abs/2407.10671
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Documentación de huggingface_hub y `snapshot_download`: https://huggingface.co/docs/huggingface_hub
