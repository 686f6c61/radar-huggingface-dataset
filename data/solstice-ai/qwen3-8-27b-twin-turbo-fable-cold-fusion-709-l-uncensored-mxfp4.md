# Solstice-AI/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-MXFP4

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-MXFP4 es una cuantización en formato OCP Microscaling FP4 (MXFP4) de un modelo derivado de la familia Qwen3.8, publicada por Solstice-AI. El modelo original y la fusión GAIN fueron realizados por DavidAU, mientras que Solstice-AI se encarga de la cuantización y el empaquetado. Se distribuye mediante `compressed-tensors` con escalado dinámico por grupos y está orientado a inferencia de alto rendimiento en aceleradores modernos, con soporte declarado para vLLM y SGLang.

El modelo se presenta como multimodal (pipeline `image-text-to-text`), con soporte de visión mediante proyector `mmproj`, y está etiquetado como "uncensored" dentro del ecosistema Project Heretic. La model card indica una ventana de contexto máxima de 262.144 tokens en la configuración de servicio con vLLM. Los idiomas declarados son inglés y chino.

Un dato relevante y contradictorio: el nombre del modelo indica "27B", pero el recuento real de parámetros en safetensors es de 460.730.096 (aproximadamente 0,46 mil millones), y el tamaño del repositorio es de 1,0 GB. Esta discrepancia debe tenerse en cuenta antes de cualquier despliegue en producción, ya que las estimaciones de VRAM y rendimiento basadas en el nombre no se corresponden con el artefacto publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8; detalles específicos no disponibles) |
| Parámetros totales | 460.730.096 (según safetensors); el nombre indica "27B" |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según configuración de ejemplo en vLLM) |
| Tipos de cuantización | MXFP4 (OCP Microscaling FP4, 4 bits, escalado dinámico por grupos vía `compressed-tensors`) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `compressed-tensors` (MXFP4); tags indican también GGUF y `mmproj` para visión |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su ascendencia Qwen3.8 y la etiqueta `qwen3_5` en los tags. Se trata de un transformer multimodal con capacidad de visión (pipeline `image-text-to-text` y presencia de `mmproj`), lo que implica un codificador visual acoplado a un modelo de lenguaje. El modelo base es una fusión GAIN ("Cold-Fusion", "TWIN-TURBO", "Fable") realizada por DavidAU sobre un modelo Qwen3.8 de 27B, posteriormente ajustada dentro del proyecto Heretic para eliminar restricciones de contenido ("uncensored").

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La innovación técnica documentada se limita al formato de cuantización: MXFP4 con escalado dinámico por grupos, que reduce el peso a 4 bits por parámetro manteniendo bloques de escala compartidos, lo que permite mayor throughput en aceleradores con soporte nativo de FP4. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (image-text-to-text) mediante proyector `mmproj`.
- Razonamiento y generación de contenido sin las restricciones habituales de alineación (etiqueta "uncensored").
- Soporte multilingüe limitado a inglés y chino según la model card.
- Compatibilidad con motores de inferencia de alto rendimiento: vLLM y SGLang, con soporte de tensor parallelism.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documentan modos de "thinking" ni capacidades de audio.

## Casos de uso

- Despliegue de chat multimodal en producción: el modelo acepta entradas de imagen y texto, por lo que puede integrarse en asistentes que respondan preguntas sobre capturas, diagramas o documentos escaneados, siempre que se valide primero la coherencia entre el nombre "27B" y los 0,46B reales de parámetros.
- Procesamiento de documentos largos en inglés o chino: la ventana de 262.144 tokens permite ingerir contratos, informes o hilos de conversación extensos en una sola pasada, útil para resumen y extracción de entidades.
- Inferencia de alto throughput en aceleradores con FP4: el formato MXFP4 y el soporte de vLLM/SGLang lo hacen adecuado para servir muchas peticiones concurrentes en hardware con soporte nativo de microscaling, reduciendo el coste por token frente a FP16.
- Investigación sobre alineación y censura: al ser una variante "uncensored" de Project Heretic, sirve como objeto de estudio para comparar comportamientos de rechazo frente al modelo base alineado.
- Prototipado rápido en entornos con poca VRAM: con un repositorio de 1,0 GB, el artefacto cabe en GPUs de consumo, lo que facilita pruebas locales antes de escalar.
- Evaluación comparativa de técnicas de cuantización: permite medir la degradación de calidad de MXFP4 frente a otros formatos (GGUF, FP8) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 460,7 M de parámetros en MXFP4 (4 bits), los pesos ocupan aproximadamente 0,23 GB; el repositorio completo es de 1,0 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM, incluyendo la caché KV para contextos moderados.
- La ventana de 262.144 tokens exige una caché KV considerable; para contextos muy largos se recomienda GPU con 24 GB o más (RTX 4090, A100, H100) o bien tensor parallelism.
- GPUs recomendadas para producción: A100, H100 o aceleradores con soporte nativo de FP4 (generaciones recientes de NVIDIA). En consumer, RTX 4090 y superiores.
- Opciones de despliegue: vLLM (`vllm serve` con `--max-model-len 262144`) y SGLang, según la model card. El tag GGUF sugiere compatibilidad adicional con llama.cpp/Ollama, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (MXFP4) | 460,7 M (real) / "27B" (nombre) | 262.144 | Apache 2.0 | compressed-tensors MXFP4 | Cuantización de un merge GAIN uncensored |
| Modelo base DavidAU (sin cuantizar) | no disponible | no disponible | Apache 2.0 | safetensors | Referencia de calidad previa a cuantización |
| Qwen3.8-27B original | 27B (según nombre) | no disponible | no disponible | no disponible | Modelo de partida de la familia Qwen3.8 |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre ("27B") y el recuento real de parámetros (460,7 M): verificar el artefacto antes de dimensionar infraestructura.
- Modelo etiquetado como "uncensored": puede generar contenido sin filtros de seguridad, lo que supone un riesgo para despliegues públicos y requiere moderación externa.
- Riesgo de alucinación no cuantificado; al ser un modelo pequeño en parámetros reales, la fiabilidad factual puede ser limitada.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado.
- La fusión GAIN y los ajustes Heretic pueden introducir degradaciones no documentadas respecto al Qwen3.8 original.
- Aunque la licencia es Apache 2.0, el uso comercial debe revisarse contra las licencias del modelo base y de los componentes del merge.
- Solo 342 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.
- No se documentan evaluaciones de seguridad, sesgos ni robustez.

## Enlaces

- Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-MXFP4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Perfil del autor del modelo original: https://huggingface.co/DavidAU
- Perfil del cuantizador: https://huggingface.co/Solstice-AI
