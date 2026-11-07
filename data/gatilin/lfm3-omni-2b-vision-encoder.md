# gatilin/lfm3-omni-2b-vision-encoder

## Resumen

`gatilin/lfm3-omni-2b-vision-encoder` es una extraccion comunitaria del codificador visual (`model.vision_tower.*`) y del proyector multimodal (`model.multi_modal_projector.*`) del modelo `LiquidAI/LFM3-Omni-2B`, fijada a la revision `21d75123f86c1f7ffb4bef1ea202710c4e7ebe67`. No es un modelo generativo: es un componente de extraccion de caracteristicas visuales que transforma imagenes en embeddings proyectados al espacio del modelo de lenguaje original. El autor conserva nombres, dtypes, formas y valores de los tensores del modelo fuente, pero excluye el LLM, los componentes de audio y la generacion de salida.

El modelo base, LFM3-Omni-2B, es el primer modelo omnicanal de Liquid AI: un unico modelo end-to-end de 2B parametros que entiende texto, imagen, video y audio, y responde en texto, voz o texto y voz intercalados. Esta disenado para ejecucion en dispositivo (on-device), sustituyendo a la vez un ASR, un VLM, un LLM y un TTS. Es un modelo no razonador (non-reasoning).

La relevancia de este repositorio es acotada: sirve para reutilizar la torre visual de LFM3-Omni-2B en pipelines propios de extraccion de caracteristicas o para estudiar el componente visual de forma aislada. El autor advierte que la torre comparte nombres y formas de tensor con LFM3-VL-2B, pero los bytes muestreados difieren, por lo que deben usarse los pesos correspondientes al modelo fuente previsto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual (vision tower) mas proyector multimodal, extraidos de LFM3-Omni-2B |
| Parametros totales | 189.380.352 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (componente sin contexto de texto propio) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License 1.0 (con condiciones de uso comercial) |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente el `vision_tower` y el `multi_modal_projector` del modelo LFM3-Omni-2B. La entrada son `pixel_values` ya patchificados junto con `image_grid_thw`, procesados mediante el `Lfm3VlImageProcessor` incluido y configurado desde `processor_config.json`. La salida son embeddings visuales proyectados, listos para inyectarse en el espacio del LLM original. No se incluye el modelo de lenguaje, los componentes de audio ni la cabeza de generacion.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO para este componente. El autor indica que los nombres y formas de tensor coinciden con LFM3-VL-2B pero los valores difieren, y remite a `tensor_mapping.json`, `extraction.json` y `validation.json` para la trazabilidad y los limites del smoke test en CPU. No se describe ninguna innovacion tecnica adicional del codificador.

## Capacidades

- Extraccion de caracteristicas visuales: convierte imagenes patchificadas en embeddings proyectados.
- Integracion con el procesador de imagen upstream `Lfm3VlImageProcessor`.
- Pipeline declarado: `image-feature-extraction`.
- No incluye generacion de texto, razonamiento, codigo, matematicas ni capacidades conversacionales.
- No incluye tool calling ni function calling.
- No incluye soporte de agentes ni razonamiento multi-paso.
- No incluye componentes de audio, pese a que el modelo base es omnicanal.
- Capacidades multilingues: no disponibles en este componente.
- No dispone de modo thinking ni de salida de voz.

## Casos de uso

- Extraccion de embeddings visuales para busqueda semantica de imagenes: el componente genera vectores proyectados que pueden indexarse en una base vectorial y consultarse por similitud, sin cargar el LLM completo.
- Preprocesado en pipelines de vision-lenguaje: sirve como etapa de codificacion visual cuando ya se dispone del LLM de LFM3-Omni-2B por separado y se quiere controlar el flujo de datos entre modulos.
- Analisis y depuracion del componente visual de LFM3-Omni-2B: al conservar nombres, dtypes y formas de tensor, permite inspeccionar activaciones y comparar con el modelo original fijado a la revision indicada.
- Clasificacion de imagenes por caracteristicas congeladas: los embeddings proyectados pueden alimentar clasificadores ligeros entrenados sobre ellos en lugar de reentrenar la torre.
- Investigacion sobre alineacion vision-lenguaje: el proyector multimodal aislado permite estudiar como se mapean las caracteristicas visuales al espacio del LLM, comparando con LFM3-VL-2B.
- Prototipado en CPU: el autor incluye un smoke test en CPU documentado en `validation.json`, util para validar la carga y las formas de entrada y salida antes de desplegar en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta un smoke test en CPU cuyas formas de entrada y salida se recogen en `validation.json`; no se aportan metricas de calidad, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 189,4 M de parametros, los pesos en fp32 ocupan aproximadamente 0,76 GB y en fp16 aproximadamente 0,38 GB, a lo que hay que sumar activaciones y el procesador de imagen.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el componente es ligero y no requiere GPU de datacenter.
- GPU de consumo: por el numero de parametros, cabe previsiblemente en cualquier GPU consumer moderna con suficiente VRAM libre, aunque el autor no lo confirma.
- Opciones de despliegue: el autor indica PyTorch, Transformers 5.21.1, accelerate, safetensors, Pillow y NumPy, con carga mediante `component.load_model(root)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/lfm3-omni-2b-vision-encoder | 189,4 M (solo torre y proyector) | no disponible | Codificador visual | LFM Open License 1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-Omni-2B | 2B (modelo completo) | no disponible | Omnicanal any-to-any | LFM Open License 1.0 | Hugging Face |
| LFM3-VL-2B | no disponible | no disponible | Vision-lenguaje | no disponible | Referenciado por el autor; misma estructura de tensores pero valores distintos |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: carece de LLM, de componentes de audio y de generacion de salida; solo produce embeddings visuales.
- Los tensores comparten nombres y formas con LFM3-VL-2B pero los bytes difieren; usar pesos del modelo equivocado produce resultados incorrectos sin error evidente.
- La validacion documentada se limita a un smoke test en CPU; no hay garantias de calidad en produccion.
- Sesgos conocidos: no disponibles; al derivar de LFM3-Omni-2B, hereda los sesgos de sus datos de entrenamiento, no documentados aqui.
- Riesgo de alucinacion: no aplica directamente al no generar texto, pero los embeddings pueden amplificar sesgos del modelo base en etapas posteriores.
- Limitaciones de contexto o idioma: no disponibles para este componente.
- Licencia LFM Open License 1.0 con condiciones de uso comercial: es necesario revisar el archivo `LICENSE` antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (2026-11-07), sin historial de mantenimiento.
- Dependencia de una version concreta de Transformers (5.21.1), lo que puede complicar la integracion en entornos con versiones distintas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gatilin/lfm3-omni-2b-vision-encoder
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentacion de LFM3-Omni-2B: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Archivos de trazabilidad citados por el autor: `tensor_mapping.json`, `extraction.json`, `validation.json` (en el repositorio)
- Licencia: `LICENSE` (LFM Open License 1.0, en el repositorio)
