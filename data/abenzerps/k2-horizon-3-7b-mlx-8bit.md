# abenzerps/K2-Horizon-3.7B-MLX-8bit

## Resumen

K2-Horizon-3.7B es un modelo de lenguaje denso tipo decoder-only desarrollado por IFM, orientado a razonamiento, generación de código, trabajo con contexto largo y uso de herramientas. Su característica más distintiva es una ventana de contexto nativa de 524.288 tokens (512K), excepcional para un modelo de solo 3,7B de parámetros. Esta ficha cubre la conversión MLX en 8-bit publicada por abenzerps, que adapta el checkpoint original al ecosistema de Apple Silicon mediante MLX-LM.

La conversión utiliza cuantización affine de 8 bits con grupo de tamaño 64, reduciendo el peso del modelo a 5,4 GB. Incluye un adaptador personalizado (`k2_horizon_mlx.py`) que preserva la RMSNorm agrupada característica de K2 Horizon, y requiere `--trust-remote-code` para su carga. El modelo es exclusivamente de texto, sin proyector de visión ni archivos MTP, y se distribuye bajo licencia Apache-2.0 con soporte declarado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 5.058.255.360 (safetensors, incluye metadatos de cuantizacion; base: 3,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | MLX affine 8-bit, grupo de 64 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

K2-Horizon-3.7B es un transformer denso decoder-only. La conversión MLX en 8-bit preserva la arquitectura original del checkpoint de IFM, incluyendo la RMSNorm agrupada (grouped RMSNorm) que distingue a la familia K2 Horizon. Para ello, el repositorio incluye un adaptador Python personalizado (`k2_horizon_mlx.py`) que debe cargarse con `--trust-remote-code` en MLX-LM. El modelo es solo texto; no se incluyen proyector de visión ni archivos MTP (multi-token prediction).

No se dispone de información detallada sobre los datos de entrenamiento del modelo base: número de tokens procesados, composición del dataset ni pipeline de alineación (RLHF/DPO). La model card del autor no proporciona estos datos.

## Capacidades

- Generación de texto y conversación multi-turno
- Razonamiento y resolución de problemas complejos
- Generación de código
- Trabajo con contexto largo de hasta 512K tokens
- Uso de herramientas (tool use)
- Capacidades multilingües: solo inglés declarado en la model card

## Casos de uso

- Análisis de documentos extensos: con 512K tokens de contexto, puede procesar libros completos, codebases enteras o expedientes legales en una sola pasada, sin necesidad de chunking ni RAG.
- Generación de código en producción: su capacidad de tool calling permite integrarlo en pipelines de CI/CD para autocompletado, revisión de pull requests y refactorización.
- Agentes conversacionales: el soporte de tool use permite construir asistentes que interactúan con APIs y servicios externos de forma autónoma.
- Razonamiento multi-paso: adecuado para tareas de planificación y resolución de problemas que requieren cadenas de razonamiento extensas.
- Procesamiento de logs y telemetría: la ventana de 512K permite analizar grandes volúmenes de logs de sistemas o trazas distribuidas en una sola consulta.
- Asistencia en investigación: búsqueda y síntesis de información en corpus extensos de papers, documentación técnica o normativa.
- Despliegue en Apple Silicon: al estar en formato MLX, es directamente ejecutable en Macs con chips M1/M2/M3/M4 sin necesidad de capas de compatibilidad adicionales.

## Benchmarks y rendimiento

La model card del autor referencia una imagen con resultados de benchmarks del checkpoint original IFM/K2-Horizon-3.7B, pero los valores numéricos no están disponibles en formato texto en la información proporcionada. No se pueden reportar cifras concretas sin riesgo de inventar datos.

## Requisitos de hardware

- Tamaño del repositorio: 5,4 GB (cuantización 8-bit)
- Memoria estimada para inferencia: al menos 5,4 GB de memoria unificada para el modelo, más la caché KV que crece proporcionalmente con la longitud de contexto
- GPU recomendadas: cualquier Apple Silicon con al menos 8 GB de memoria unificada (M1, M2, M3, M4); para contexto de 512K se recomienda 16 GB o más
- El formato MLX es exclusivo de Apple Silicon; no es directamente utilizable en GPUs NVIDIA o AMD
- Opciones de despliegue: MLX-LM (`mlx_lm.generate`), con `--trust-remote-code` obligatorio
- No se dispone de datos de latencia ni throughput publicados para esta conversión

## Comparativa con modelos similares

No se dispone de información suficiente en los datos proporcionados para establecer una comparativa rigurosa con modelos alternativos. La combinación de 3,7B de parámetros con 512K de contexto es poco común en modelos densos de ese tamaño, lo que dificulta encontrar equivalentes directos. No se han publicado datos comparativos en la información disponible.

## Limitaciones y advertencias

- Modelo solo texto: no procesa imágenes, audio ni vídeo
- Solo inglés: no soporta otros idiomas de forma declarada
- Requiere `--trust-remote-code`: el adaptador `k2_horizon_mlx.py` es código personalizado que debe ejecutarse con confianza; se recomienda auditar el contenido del repositorio antes de usarlo en producción
- La cuantización 8-bit puede introducir una ligera degradación de calidad respecto al checkpoint original en mayor precisión
- La caché KV para 512K tokens de contexto puede consumir una cantidad significativa de memoria, incluso con cuantización; el requisito real de memoria depende de la longitud de contexto utilizada
- Formato MLX específico de Apple Silicon: no es directamente utilizable con vLLM, llama.cpp, Ollama u otros runners estándar
- No se dispone de información sobre sesgos, alucinaciones o comportamiento en producción del modelo base
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy temprana y poca validación comunitaria

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abenzerps/K2-Horizon-3.7B-MLX-8bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Revisión fuente del checkpoint: https://huggingface.co/IFM/K2-Horizon-3.7B/tree/633f52ad28b17edeabd82afc61d2d13b4c59a561
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
