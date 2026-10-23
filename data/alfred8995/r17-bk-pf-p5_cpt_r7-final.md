# alfred8995/r17-bk-pf-p5_cpt_r7-final

## Resumen

`alfred8995/r17-bk-pf-p5_cpt_r7-final` es un checkpoint de aproximadamente 1.178 millones de parámetros (1,18 B) publicado por el usuario Alfred Smith (`alfred8995`) en Hugging Face. El repositorio está etiquetado con `safetensors` y `mistral`, lo que sitúa la arquitectura en la familia Transformer de tipo Mistral, aunque el recuento de parámetros no corresponde a ninguna release canónica de Mistral AI (Mistral 7B tiene 7.240 millones), por lo que se trata de un modelo de menor tamaño, presumiblemente con configuración propia. El nombre del repositorio incluye el segmento `cpt`, habitual para denotar *continued pre-training*, y `final`, lo que sugiere un checkpoint resultante de un proceso de preentrenamiento continuado sobre un modelo base.

No se ha publicado model card, pipeline declarado, idiomas soportados ni resultados de evaluación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el acceso está restringido: requiere aceptar condiciones en Hugging Face antes de descargar los pesos.

Su relevancia es, por tanto, la de un artefacto de investigación de acceso limitado y sin validación pública. Resulta útil como punto de partida para experimentación con modelos de ~1 B de parámetros y para inspeccionar el efecto de un *continued pre-training*, pero no es apto para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Mistral (según el tag `mistral` del repositorio); número de capas, cabezas, `hidden_size` y tipo de atención: no disponible |
| Parámetros totales | 1.178.399.488 (~1,18 B), según los safetensors del repositorio |
| Parámetros activos | no disponible (no hay indicios de arquitectura MoE en los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors y no incluye variantes GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | no disponible |
| Licencia | `other` (licencia no estándar; el acceso está restringido y sujeto a aceptación de condiciones) |
| Formato de pesos | safetensors (tamaño del repositorio: 2,4 GB) |

## Arquitectura y entrenamiento

El único dato estructural disponible es la etiqueta `mistral`, que en Hugging Face se aplica habitualmente a modelos con arquitectura Transformer decoder-only (atención causal, RMSNorm, SwiGLU y RoPE). Con 1,18 B de parámetros y 2,4 GB de pesos, el checkpoint encaja con un almacenamiento en fp16/bf16 (2 bytes por parámetro ≈ 2,36 GB), coherente con un único fichero de pesos sin cuantizar. No se dispone de información sobre el número de capas, dimensión oculta, configuración de atención (MHA/GQA), vocabulario ni tokenizador.

Respecto al entrenamiento, el segmento `cpt` del identificador sugiere *continued pre-training* sobre un modelo previamente entrenado, y el sufijo `final` apunta a un checkpoint de cierre de una ejecución. No obstante, no se han publicado el número de tokens de entrenamiento, la composición del corpus, el modelo base de partida ni si hubo fases de ajuste supervisado, RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, atención con ventana deslizante, etc.).

## Capacidades

- Generación de texto autoregresiva: capacidad esperable por la arquitectura, pero no verificada mediante evaluación publicada.
- Razonamiento, matemáticas y código: no disponible; no hay benchmarks ni ejemplos que lo respalden.
- Tool calling / function calling: no disponible; no se documenta plantilla de chat ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; al no confirmarse ajuste por instrucciones, no se puede asumir.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Modo *thinking*, visión o audio: no disponible; no hay indicios de modalidades adicionales ni de cabeceras específicas.
- Ajuste por instrucciones: no disponible; el pipeline no está declarado y el nombre del checkpoint sugiere un modelo base o de preentrenamiento continuado, no un modelo alineado.

## Casos de uso

- Punto de partida para *continued pre-training* de dominio: el checkpoint puede inicializar un entrenamiento adicional sobre corpus especializado (legal, sanitario, industrial) con un coste de cómputo contenido al tener 1,18 B de parámetros; requiere validar antes la tokenización y la longitud de contexto real.
- Ajuste fino supervisado (SFT) para un asistente vertical: al ser un modelo pequeño, un SFT con LoRA cabe en una sola GPU consumer y permite iterar rápido sobre datos propios antes de comprometerse con un modelo mayor.
- Generación de texto en infraestructura limitada: despliegue en entornos *on-premise* o *edge* con GPU de 8-12 GB, donde un modelo de 7 B no cabría con contexto razonable.
- Etiquetado y clasificación de texto por lotes: uso como extractor o clasificador tras añadir una cabeza de clasificación, procesando grandes volúmenes con coste por token bajo.
- Extracción de información estructurada (NER, JSON a partir de documentos): tras ajuste específico, adecuado para pipelines de ingesta documental donde la latencia importa más que la calidad máxima.
- RAG ligero en local: con cuantización INT4 el modelo ocuparía menos de 1 GB de pesos, lo que permite ejecutarlo junto al índice vectorial en la misma máquina; requiere evaluar primero la calidad de generación con contexto.
- Filtrado y preprocesado de datasets: uso como modelo de *scoring* o deduplicación semántica en la construcción de corpus de entrenamiento de modelos mayores.
- Experimentación académica y ablaciones: útil para estudiar el efecto del *continued pre-training* a pequeña escala comparando contra el modelo base de origen (desconocido).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (cálculo derivado del recuento de parámetros, no publicado por el autor): ~2,4 GB de pesos en fp16/bf16; ~1,2 GB en INT8; ~0,6-0,8 GB en INT4. A ello hay que sumar caché KV y activaciones, cuyo tamaño depende de la longitud de contexto, que se desconoce.
- GPU recomendadas: para fp16 con contexto moderado, una GPU de 8 GB o superior es suficiente (RTX 3060 Ti, RTX 4060, RTX 3070, L4, T4). Para servir varias peticiones concurrentes con contexto largo, se recomienda A10G, L40S, A100 o H100 por ancho de banda y capacidad de memoria.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 6-8 GB o más. En INT4 podría ejecutarse incluso en iGPU con memoria unificada, a costa de latencia.
- Opciones de despliegue: Transformers + PyTorch es la vía directa con los safetensors publicados. vLLM y TGI son viables si la arquitectura es compatible con Mistral, pero no está confirmado. llama.cpp y Ollama requieren convertir previamente a GGUF, conversión que no se ha publicado y que habría que generar.
- Latencia y throughput: no disponible. No hay datos de tokens por segundo ni de tamaño de lote soportado.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este checkpoint, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Los datos de los modelos de referencia provienen de su documentación pública.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `alfred8995/r17-bk-pf-p5_cpt_r7-final` | ~1,18 B | no disponible | `other` (no estándar, acceso restringido) | Gated, 0 descargas |
| TinyLlama-1.1B | ~1,1 B | 2.048 tokens | Apache 2.0 | Abierto, ampliamente utilizado |
| Llama 3.2 1B | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | Abierto con condiciones |
| Qwen2.5-1.5B | ~1,54 B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 (mayoría de variantes) | Abierto |

Frente a estas alternativas, el modelo aquí descrito no aporta métricas verificables ni una licencia clara, y su acceso restringido dificulta la reproducibilidad. Su interés es principalmente experimental.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, tokenizador, plantilla de prompt ni hiperparámetros, lo que impide reproducir el entrenamiento.
- Licencia `other` con acceso restringido: es imprescindible revisar los términos asociados al *gate* antes de cualquier uso comercial; la licencia no garantiza permisos de redistribución ni de uso en producción.
- Sin evaluación publicada: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad; cualquier afirmación sobre calidad es especulativa.
- Riesgo de alucinación: no consta que se haya aplicado RLHF, DPO o filtrado de seguridad, algo habitual en checkpoints de preentrenamiento continuado.
- Idiomas desconocidos: el campo de idiomas está vacío; es probable un sesgo hacia el idioma dominante del corpus de *continued pre-training*, que no se declara.
- Contexto desconocido: no debe asumirse una ventana larga; hay que verificar `max_position_embeddings` en el `config.json` antes de diseñar prompts o pipelines RAG.
- Sesgos: no evaluados ni documentados; en modelos base de este tamaño los sesgos de género, etnia y religión suelen ser apreciables.
- Checkpoint intermedio: el sufijo `final` no garantiza que sea la mejor iteración de la ejecución; conviene comparar con otras revisiones del mismo autor si existen.
- Fecha de creación anómala (2026-10-23): el metadato del repositorio no es coherente con la fecha actual, lo que conviene tener en cuenta al citar el modelo.
- Formato único: al no haber GGUF ni cuantizaciones publicadas, cualquier despliegue con llama.cpp u Ollama exige una conversión propia y su validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alfred8995/r17-bk-pf-p5_cpt_r7-final
- Perfil del autor en Hugging Face: https://huggingface.co/alfred8995
- Paper, blog, repositorio o demo adicionales: no disponible (las búsquedas web realizadas no devolvieron documentación asociada a este checkpoint).
