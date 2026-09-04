# DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-4bit

## Resumen

K2-Horizon-MoVA-36B-A4B-MLX-4bit es una conversión a cuantización 4-bit del modelo K2-Horizon-MoVA-36B-A4B, desarrollado por el Institute of Foundation Models (IFM). La conversión ha sido realizada por DreamFoundries específicamente para MLXHub, utilizando su fork de `mlx-lm`. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con atención Mixture-of-Values (MoVA), que almacena 36.000 millones de parámetros pero activa solo 4.000 millones por token. Esta característica lo hace especialmente adecuado para despliegue local en hardware de Apple, donde el framework MLX aprovecha la memoria unificada de las GPU Apple Silicon.

El modelo se publica bajo licencia Apache-2.0 y está disponible en formato safetensors para MLX. Según el blog de IFM, la variante 36B-A4B alcanza un rendimiento cercano al modelo denso K2 Horizon 32B, activando aproximadamente 4.000 millones de parámetros por token, lo que lo convierte en una opción eficiente para inferencia local. No se han publicado resultados de benchmarks comparativos para esta conversión MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención Mixture-of-Values (MoVA) |
| Parametros totales | 36B |
| Parametros activos | 4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (affine, group size 64) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo K2-Horizon-MoVA-36B-A4B es el miembro sparse de la familia K2-Horizon. Su arquitectura combina un enfoque Mixture-of-Experts (MoE) con una atención basada en Mixture-of-Values (MoVA). Esto significa que, aunque el modelo almacena 36.000 millones de parámetros, solo un subconjunto de aproximadamente 4.000 millones se activa en cada token, lo que reduce significativamente el coste computacional de la inferencia.

Los datos de entrenamiento provienen de los datasets `IFM/K2-Horizon-Pretrain-Data` e `IFM/K2-Horizon-Midtrain-Data`. No se dispone de información sobre procesos de alineación como RLHF o DPO. Una innovación técnica destacable es que los routers K2 (`mlp.gate` y `self_attn.v_router`) permanecen sin cuantizar en la conversión MLX, lo que preserva la precisión de las rutas de selección de expertos.

## Capacidades

- Generación de texto conversacional en inglés, según los tags del modelo (`conversational`, `text-generation`).
- Eficiencia computacional: al activar solo 4B parámetros por token, ofrece un rendimiento cercano a un modelo denso de 32B con un coste de inferencia notablemente menor.
- Ejecución local en Apple Silicon mediante el framework MLX, con integración directa en MLXHub.
- Modelo abierto bajo licencia Apache-2.0, lo que permite su adaptación y despliegue en entornos propios.
- No se dispone de información sobre soporte de tool calling, visión, audio o capacidades multimodales.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede ejecutarse con MLX en Macs con Apple Silicon, ofreciendo un asistente de texto sin conexión que no depende de servicios en la nube.
- Prototipado rápido de aplicaciones de IA en Apple: gracias a la integración con MLXHub, los desarrolladores pueden cargar el modelo con `mlx_lm` y experimentar en pocas líneas de código.
- Investigación en arquitecturas MoE: el modelo sirve como referencia abierta para estudiar la atención MoVA y la eficiencia de los parámetros activos en modelos sparse.
- Despliegue en entornos con privacidad de datos: al ser Apache-2.0 y ejecutarse localmente, es adecuado para aplicaciones que requieren que los datos no salgan de la infraestructura del usuario.
- Generación de contenido editorial en inglés: puede redactar borradores, correos electrónicos o textos creativos, aprovechando su capacidad conversacional.
- Análisis de documentos en inglés: puede resumir o extraer información de textos, aunque la longitud de contexto no está especificada, por lo que se debe validar su comportamiento con ventanas largas antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README de la conversión MLX indica explícitamente que no hay benchmarks comparativos de calidad y rendimiento para esta conversión. El blog de IFM afirma que el modelo base 36B-A4B alcanza un rendimiento cercano al modelo denso K2 Horizon 32B, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. El modelo está diseñado para ejecutarse con MLX en Apple Silicon.
- Compatibilidad con GPU de consumo: no aplica, ya que MLX es un framework exclusivo para hardware Apple.
- Opciones de despliegue: MLX (`mlx_lm`) y MLXHub. No se mencionan otras opciones como vLLM, llama.cpp o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B | 36B | 4B | MoE + MoVA | no disponible | Apache-2.0 |
| K2 Horizon 32B | 32B | 32B (dense) | Dense | no disponible | Apache-2.0 |

Según el blog de IFM, el modelo 36B-A4B alcanza casi el rendimiento del modelo denso 32B activando solo 4B parámetros. No se dispone de información sobre otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés, según la información de HuggingFace.
- No se han publicado benchmarks de calidad ni rendimiento para esta conversión MLX.
- La longitud de contexto no está especificada, por lo que su uso en tareas de ventana larga requiere validación previa.
- Al ser una conversión MLX, solo es compatible con hardware Apple Silicon, no con GPUs CUDA.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos pueden estar alojados externamente; se debe verificar la integridad antes de usar en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se dispone de información sobre sesgos específicos.
- La licencia Apache-2.0 permite uso comercial, pero se deben cumplir las condiciones de atribución.

## Enlaces

- HuggingFace: https://huggingface.co/DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-4bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Blog de IFM: https://ifm.ai/blog/k2
- MLXHub: https://mlxhub.app/open-model?repo=DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-4bit
