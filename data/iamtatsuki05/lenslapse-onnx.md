# iamtatsuki05/lenslapse-onnx

## Resumen

LensLapse ONNX es una colección de checkpoints convertidos a formato ONNX para su ejecución en navegador, diseñada como infraestructura de la herramienta de interpretabilidad LensLapse. No es un modelo de lenguaje generativo al uso, sino un paquete de artefactos que permite visualizar la evolución de las representaciones internas (logit-lens) a lo largo del entrenamiento de distintos transformers. El autor, iamtatsuki05, lo publica bajo licencia Apache-2.0 y lo asocia a un artículo en AACL 2026 (demo).

El núcleo del repositorio son 20 checkpoints espaciados logarítmicamente de las tres variantes Pythia (14M, 70M y 160M) de EleutherAI, que cubren los pasos de entrenamiento 0 a 143.000. A ello se suman conjuntos de checkpoints intermedios de otros modelos (MAP-Neo 250M, Aquila-135M, BLOOM-560M) y conversiones de solo pesos finales de GPT-2, SmolLM2-135M, Qwen3-0.6B, OPT-125M y Gemma 3 270M, pensadas como ejemplos de cobertura arquitectónica.

Su relevancia es metodológica: demuestra una receta de conversión ONNX genérica entre familias de decoder (GPT-NeoX, Llama, GPT-2, OPT, Gemma) y expone casos donde la heurística de resolución de atributos falló y hubo que corregirla. El tamaño del repositorio (32,2 GB) refleja la acumulación de backbone y lens por cada checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (múltiples familias: GPT-NeoX, Llama-style, GPT-2-style, OPT, Gemma) |
| Parametros totales | Variable por submodelo: 14M, 70M, 160M (Pythia); 250M (MAP-Neo); 135M (Aquila, SmolLM2); 560M (BLOOM); 125M (OPT); 270M (Gemma 3); 0.6B (Qwen3); ~124M (GPT-2) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (backbone y lens exportados en `.f16.onnx`); referencia FP32 para validación de paridad |
| Idiomas soportados | No disponible (los tags indican "multilingual" pero no se detalla) |
| Licencia | Apache-2.0 (excepto OPT-125M, con licencia no permisiva y no comercial) |
| Formato de pesos | ONNX (`.f16.onnx` para backbone y lens) + `manifest.json` por directorio |

## Arquitectura y entrenamiento

El repositorio no entrena modelos, sino que convierte checkpoints existentes a ONNX para inferencia en navegador. Cada checkpoint se descompone en dos artefactos: un `backbone.f16.onnx` que recibe `input_ids` y `attention_mask` y devuelve los estados ocultos de todas las capas `[L+1, B, T, H]`, y un `lens.f16.onnx` que aplica la normalización final y el unembedding para producir logits `[N, V]`. Esta separación permite al frontend de LensLapse interrogar por capa y por paso de entrenamiento.

La receta de conversión es genérica entre arquitecturas y resuelve la pila de decodificadores mediante heurísticas de atributos (GPT-NeoX, Llama-style, GPT-2). El proceso de exportación incluye una comprobación de paridad contra la referencia FP32 en PyTorch (`assert fp32_diff < 0.05`). Dos casos revelaron carencias reales: OPT, cuyo stack está en `model.model.decoder` (dos saltos de atributo, no uno), lo que obligó a soportar rutas punteadas multi-salto en `src/lenslapse/arch.py`; y Gemma 3, cuya RMSNorm calcula `normalized(x) * (1 + weight)` en lugar de `normalized(x) * weight`, lo que producía una desviación máxima de logits de 23,2 frente a la referencia FP32 y fue detectada por la propia aserción de paridad.

## Capacidades

- Conversión de checkpoints de transformers decoder-only a ONNX ejecutable en navegador.
- Interfaz de logit-lens por capa: proyección de estados ocultos intermedios al espacio de vocabulario.
- Soporte de múltiples pasos de entrenamiento por modelo (hasta 20 en Pythia), permitiendo visualizar dinámicas de entrenamiento.
- Cobertura arquitectónica de cinco familias: GPT-NeoX (Pythia, GPT-2), Llama-style (SmolLM2, Qwen3), OPT, Gemma 3 y Aquila.
- Soporte de checkpoints intermedios publicados por terceros (MAP-Neo, Aquila, BLOOM).
- Salida de estados ocultos completos `[L+1, B, T, H]` para análisis de representaciones internas.
- No es un modelo generativo: no realiza tool calling, agentes ni razonamiento autónomo.

## Casos de uso

- Visualización de dinámicas de entrenamiento: el conjunto de 20 checkpoints de Pythia (pasos 0-143.000) permite observar cómo evoluciona la predicción por capa a lo largo del entrenamiento, útil para investigación en interpretabilidad.
- Análisis de logit-lens en navegador: el par backbone+lens permite proyectar estados ocultos intermedios al vocabulario sin infraestructura de GPU, facilitando demos docentes y reproducibilidad.
- Estudio comparado entre arquitecturas: las conversiones de GPT-2, SmolLM2, Qwen3, OPT y Gemma 3 permiten contrastar cómo distintas normalizaciones (LayerNorm, RMSNorm, RMSNorm con offset de Gemma) afectan a las representaciones.
- Docencia de mecánica interna de transformers: la separación backbone/lens y la interfaz de pasos hace tangible el concepto de representación por capa para estudiantes.
- Validación de recetas de exportación ONNX: el repositorio documenta fallos reales (OPT, Gemma 3) y sus correcciones, sirviendo como referencia para pipelines de conversión de otros modelos.
- Investigación en scaling laws a pequeña escala: los checkpoints de MAP-Neo 250M (etiquetados por millones de tokens) permiten estudiar la evolución por volumen de datos, no solo por pasos de optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye métricas de paridad de exportación (desviación máxima de logits FP16 frente a FP32) en cada `manifest.json`, pero no resultados de evaluación de tareas.

## Requisitos de hardware

- Al ser artefactos ONNX para navegador, el despliegue típico es en cliente (WebAssembly/WebGPU) o en servidor ligero, no en GPU de datacenter.
- VRAM estimada: los backbones van de ~16 MB (Pythia-14M) a ~1197 MB (Qwen3-0.6B); los lens de ~13 MB a ~514 MB (BLOOM-560M). Cabe en cualquier GPU consumer e incluso en CPU para los modelos pequeños.
- GPU recomendadas: ninguna específica; para ejecución en servidor, una RTX 4090 o superior es sobrada para cualquier submodelo individual.
- Cabe en GPU consumer: sí, todos los submodelos por separado.
- Opciones de despliegue: ONNX Runtime (web o nativo); el frontend oficial es LensLapse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| LensLapse ONNX (este repo) | 14M-0.6B (por submodelo) | No disponible | ONNX | Apache-2.0 (excepto OPT) | Interpretabilidad / logit-lens |
| Pythia (EleutherAI) | 14M-12B | 2048 | safetensors | Apache-2.0 | Modelos base con checkpoints públicos |
| GPT-2 (OpenAI) | ~124M-1.5B | 1024 | safetensors/PyTorch | MIT | Modelo base |
| SmolLM2 (HuggingFace) | 135M-1.7B | 8192 | safetensors | Apache-2.0 | Modelos pequeños de propósito general |

La comparativa es aproximada: LensLapse no compite como modelo generativo, sino como infraestructura de interpretabilidad construida sobre esos modelos base.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable para generación, razonamiento ni agentes; es un paquete de artefactos de interpretabilidad.
- La licencia Apache-2.0 del repositorio no cubre necesariamente los pesos subyacentes: OPT-125M tiene licencia no permisiva y no comercial, y debe revisarse antes de cualquier uso.
- Los checkpoints de solo pesos finales (GPT-2, SmolLM2, Qwen3, OPT, Gemma 3) no permiten estudiar dinámicas de entrenamiento, a diferencia de los conjuntos Pythia, MAP-Neo, Aquila y BLOOM.
- Los datos de idiomas no están detallados pese al tag "multilingual"; la cobertura lingüística real no está documentada.
- La paridad FP16 frente a FP32 está validada con umbral de 0,05 en logits, pero no se documentan desviaciones agregadas por modelo en esta ficha.
- El tamaño del repositorio (32,2 GB) exige descarga selectiva por subdirectorio; no es práctico clonarlo completo para un caso puntual.
- Sin datos de benchmarks de tareas, no es posible comparar calidad de representaciones entre submodelos a partir de esta información.

## Enlaces

- Hugging Face: https://huggingface.co/iamtatsuki05/lenslapse-onnx
- Paper (AACL 2026 demo): https://aclanthology.org/2026.aacl-demo.9/
- Código: https://github.com/iamtatsuki05/lenslapse
- PyPI: https://pypi.org/project/lenslapse/
- Documentación: https://lenslapse.iamtatsuki05.com/docs/
- Página del proyecto: https://lenslapse.iamtatsuki05.com/about/
- Demo en vídeo: https://www.youtube.com/watch?v=OBnvG9Ru3j8
- Demo en navegador: https://lenslapse.iamtatsuki05.com/
