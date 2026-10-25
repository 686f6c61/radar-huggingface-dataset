# luisastellet/qwen-metaphor-unke-camada-18-prompt-numerico

# luisastellet/qwen-metaphor-unke-camada-18-prompt-numerico

## Resumen

Se trata de un checkpoint de generación de texto publicado en Hugging Face por el usuario `luisastellet`, con 596.049.920 parámetros reales declarados en los safetensors y un repositorio de 2,4 GB. El modelo está etiquetado con `qwen3`, `transformers`, `text-generation`, `conversational`, `text-generation-inference` y `endpoints_compatible`, lo que indica que sigue la interfaz de la familia Qwen3 y que es desplegable en Transformers, TGI y en los Inference Endpoints del Hub. No es un modelo con model card real: el README es la plantilla automática de Hugging Face, con todos los campos marcados como `[More Information Needed]`.

La información pública es mínima. No se declara licencia, ni idiomas, ni arquitectura concreta, ni datos de entrenamiento, ni resultados de evaluación; el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el 24 de octubre de 2026 con 20 segundos de diferencia, lo que es consistente con una subida automatizada de un artefacto de experimentación más que con una publicación de modelo. El nombre (`camada-18`, `prompt-numerico`, `metaphor-unke`) sugiere un experimento de interpretabilidad o de intervención sobre la capa 18 de un transformer, probablemente derivado de un Qwen3 pequeño.

Por tanto, su relevancia ahora mismo es la de un objeto de estudio reproducible y de bajo coste (cabe en cualquier GPU de consumo), no la de un modelo listo para producción. Cualquier uso real exige una evaluación propia previa, dado que no existe documentación del autor sobre el proceso de ajuste, los datos empleados ni el comportamiento esperado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; la etiqueta `qwen3` apunta a un transformer decoder-only de la familia Qwen3 (no confirmado por el autor) |
| Parametros totales | 596.049.920 (dato real de los safetensors) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline declarado | text-generation |
| Compatibilidad de despliegue | `text-generation-inference`, `endpoints_compatible` |
| Tamano del repositorio | 2,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-24T20:33:21Z / 2026-10-24T20:33:41Z |

## Arquitectura y entrenamiento

No hay información aportada por el autor sobre arquitectura, datos, número de tokens, composición del dataset ni proceso de alineamiento (RLHF, DPO u otros). La única evidencia disponible son las etiquetas del Hub: `qwen3` como familia de referencia, `transformers` como librería y `conversational` como uso previsto, lo que encaja con un transformer decoder-only con plantilla de chat, sin que sea posible confirmar la configuración exacta de capas, cabezas, atención o embeddings.

Dos observaciones técnicas sí se pueden extraer de los metadatos. Primero, el tamaño del repositorio (2,4 GB) es coherente con 596 M de parámetros almacenados en fp32 (596 M × 4 bytes ≈ 2,38 GB), por lo que es probable que los pesos se hayan subido en precisión completa y no en bf16. Segundo, el nombre del repositorio (`camada-18`, es decir, «capa 18») sugiere que el artefacto procede de una intervención o ablación sobre una capa intermedia de un modelo base, y `prompt-numerico` / `unke` apuntan a un experimento con prompts numéricos y tokens desconocidos. Son indicios del nombre, no datos confirmados: no se ha publicado ninguna descripción del procedimiento de entrenamiento ni de los hiperparámetros utilizados.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad declarada explícitamente mediante los tags `text-generation` y el pipeline del Hub.
- Uso conversacional: la etiqueta `conversational` indica que el checkpoint espera una plantilla de chat, aunque el formato exacto no está documentado.
- Despliegue en TGI e Inference Endpoints: los tags `text-generation-inference` y `endpoints_compatible` implican compatibilidad con el servidor de inferencia de Hugging Face.
- Tool calling / function calling: no disponible (no declarado).
- Capacidades de agente o razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Visión, audio o modo «thinking»: no disponible (no declarado).
- Al ser un modelo de ~0,6 B de parámetros, su huella es muy reducida, lo que permite ejecutarlo en CPU y en GPU de gama baja para pruebas.

## Casos de uso

- Prototipado local de pipelines de generación de texto: sirve para validar código de integración con Transformers o TGI (formato de mensajes, tokenizador, streaming) antes de pasar a un modelo mayor, gracias a que sus 596 M de parámetros caben en cualquier GPU de consumo.
- Investigación en interpretabilidad: el nombre del repositorio sugiere una intervención sobre la capa 18; el checkpoint puede emplearse como referencia para comparar activaciones o salidas frente al modelo base, siempre que se documente la intervención aplicada.
- Docencia y demostraciones: su tamaño reducido permite mostrar en clase el ciclo completo de carga, generación y evaluación de un modelo sin necesidad de infraestructura dedicada.
- Pruebas de regresión de infraestructura: al ser desplegable en TGI y en Inference Endpoints, resulta útil como carga ligera para verificar latencia, gestión de KV cache y límites de concurrencia del servidor.
- Generación de texto corto en entornos con recursos limitados (CPU, dispositivos embebidos o contenedores pequeños), con la advertencia de que la calidad no está evaluada.
- Generación de datos sintéticos para experimentos internos de etiquetado o aumento de datos, únicamente con revisión humana posterior y sin uso en producción sin evaluación previa.
- No se recomienda su uso en atención al cliente, código en producción ni tareas críticas: no hay benchmarks, ni licencia declarada, ni documentación de sesgos que permitan asumir tales escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp32 (formato probable de los pesos publicados): unos 2,4 GB solo para pesos, más el KV cache; en la práctica, entre 3 y 4 GB para contextos cortos.
- VRAM estimada en bf16/fp16: alrededor de 1,2 GB de pesos, con un total de 2 a 3 GB incluyendo overhead de runtime y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,6 GB de pesos; en 4 bits (GGUF Q4), en torno a 0,4 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 4090, L4, A10) es sobrada para fp32 y fp16; A100/H100 no aportan ventaja a este tamaño salvo por concurrencia.
- Cabe en GPU de consumo: sí, en toda la gama actual, e incluso en iGPU y CPU para inferencia en fp32 o cuantizada.
- Opciones de despliegue: Transformers (declarado), TGI (declarado), Inference Endpoints (declarado). vLLM y llama.cpp/Ollama serían viables por arquitectura, pero no están declarados y requerirían conversión a GGUF, que no está publicada en el repositorio.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos del modelo evaluado se limitan a lo publicado en el Hub; los de las alternativas proceden de sus model cards públicas y pueden variar según la versión. No se dispone de resultados de benchmarks del modelo evaluado para comparar calidad.

| Modelo | Parametros | Contexto | Licencia | Estado de publicacion |
|---|---|---|---|---|
| luisastellet/qwen-metaphor-unke-camada-18-prompt-numerico | 596 M | No disponible | No disponible | Sin model card, 0 descargas, sin benchmarks |
| Qwen3-0.6B (familia referenciada por el tag) | ~0,6 B | 32 768 tokens en el modelo base (ampliable con YaRN) | Apache 2.0 en el modelo base | Model card completa y evaluaciones publicadas |
| Llama-3.2-1B-Instruct | ~1,2 B | 128 000 tokens | Llama 3.2 Community License | Model card completa y evaluaciones publicadas |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8 192 tokens | Apache 2.0 | Model card completa y evaluaciones publicadas |

La comparación relevante es de gobernanza, no de rendimiento: frente a las alternativas, este checkpoint no ofrece licencia, idiomas, contexto ni métricas declaradas, lo que impide justificar su elección en un proyecto frente a un modelo pequeño con documentación completa.

## Limitaciones y advertencias

- Ausencia total de model card: el README es la plantilla automática, sin información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no hay base legal explícita para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce si el ajuste conserva las capacidades multilingües del modelo base o las ha degradado.
- Contexto desconocido: no se puede planificar una aplicación multi-turno o de documentos largos sin determinar empíricamente la ventana efectiva.
- Riesgo de alucinación no cuantificado: al no existir evaluaciones, no hay forma de estimar la tasa de errores factuales.
- Procedencia incierta: el nombre sugiere una intervención sobre la capa 18 de un modelo base, por lo que el checkpoint podría ser una ablación parcial y no un modelo conversacional afinado; su calidad de diálogo no está garantizada.
- Sesgos desconocidos: no se documenta la composición del corpus de ajuste ni los filtros aplicados.
- Señales de escasa validación comunitaria: 0 descargas y 0 likes, con creación y actualización separadas por 20 segundos, indican una subida automatizada sin revisión posterior.
- Pesos en fp32 probablemente: mayor uso de disco y memoria que una publicación en bf16 equivalente.
- No usar en producción sin una evaluación propia de calidad, seguridad y sesgo, y sin aclarar previamente la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-18-prompt-numerico
- Referencia citada en la plantilla de la model card (calculadora de impacto de carbono, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Listado del Hub donde aparece el modelo (resultado de búsqueda): https://huggingface.co/models?pipeline_tag=text-generation&p=10&sort=modified
- Paper, blog, repositorio o demo del modelo: no disponible.
