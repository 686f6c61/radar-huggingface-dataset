# moeshawky/Azrael-ternary-9B

## Resumen

Azrael-ternary-9B es una versión cuantizada a pesos ternarios del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicado por el usuario moeshawky en HuggingFace. Se trata de un experimento de cuantización extrema que reduce los pesos de las capas lineales a valores del conjunto {-1, 0, 1} con escalas por grupo de 128 elementos, aplicando una receta de reconstrucción capa por capa consciente de las activaciones (Recipe A) sobre hardware TPU v5e-8 mediante el runtime TorchTPU. El modelo base emplea la arquitectura Qwen3.5 con un esquema híbrido que combina capas Gated DeltaNet (atención lineal recurrente) con capas de atención estándar.

El interés de esta ficha es doble: por un lado documenta una técnica de cuantización ternaria aplicada a un transformer híbrido moderno de 9B parámetros; por otro, expone las limitaciones de un artefacto que, en el momento de su publicación, no está comprimido al formato empaquetado de 1,58 bits y cuyo GGUF conserva tensores en F32, lo que anula buena parte del ahorro de memoria esperado. El repositorio no incluye resultados de benchmarks de calidad downstream, solo métricas internas de fidelidad de la cuantización (KL frente al profesor, similitud coseno de logits).

La relevancia práctica es acotada: el modelo está pensado para el harness "think" de MiMo y su uso previsto es la experimentación con cuantización ternaria en TPU, no el despliegue en producción. Los pesos publicados son "fake-quantized": los códigos ternarios se almacenan junto a pesos maestros en F32, de modo que la inferencia no aprovecha todavía las ventajas de memoria y cómputo de un formato de 1,58 bits real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 con capas Gated DeltaNet (3 GDN + 1 atención por grupo) |
| Parámetros totales | 9B (heredados del modelo base MiMo-V2.6-Distill-Qwen-9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria por grupos (group size 128), pesos {-1, 0, 1} con escalas por grupo; GGUF en F32 (sin compresión TQ2_0) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`azrael-ternary-9b.gguf`) más metadatos PyTorch (`g4_metadata.pt`, `g5_metadata.pt`, `g6_results.pt`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base MiMo-V2.6-Distill-Qwen-9B, descrita en la model card como Qwen3.5, con 32 capas y un patrón híbrido de 3 capas Gated DeltaNet por cada capa de atención. La cuantización se aplica a las proyecciones lineales mediante el módulo `GroupwiseTernaryLinear`, que usa un estimador de gradiente directo (STE) con escalas por grupo de 128 elementos y optimización AdamW sobre activaciones reales del modelo MiMo. El proceso se ejecutó en TPU v5e-8 (8 réplicas de 16 GB HBM cada una) con TorchTPU sobre torch 2.15.0+cu132.

La receta se validó por etapas ("gates"): conectividad TPU (G0), una proyección individual `in_proj_qkv` (G1), el MLP completo con proyecciones gate/up/down (G2), un grupo híbrido de 3 GDN más 1 atención (G3), el modelo completo de 32 capas (G4), la exportación a GGUF (G5) y la validación con harness (G6). Las métricas de fidelidad reportadas son una KL de 83,80 frente al profesor en G4, una similitud coseno de logits de 0,822 en G4 y de aproximadamente 0,884 por proyección en G2. La aritmética del estado recurrente de Gated DeltaNet se mantiene en precisión original, no ternarizada.

## Capacidades

- Generación de texto en inglés, heredada del modelo base destilado de Qwen.
- Razonamiento y matemáticas: capacidades del base MiMo-V2.6-Distill-Qwen-9B, no verificadas tras la cuantización.
- Uso previsto con el harness "think" de MiMo, según indica la model card.
- Soporte de tool calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Visión y audio: no disponibles.
- Modo thinking explícito: no documentado en la información proporcionada.

## Casos de uso

- Investigación en cuantización ternaria: el modelo sirve como banco de pruebas para evaluar la receta Recipe A (reconstrucción consciente de activaciones con STE) sobre arquitecturas híbridas GDN/atención, comparando la KL y la similitud coseno de logits frente al profesor en cada etapa.
- Validación de pipelines TorchTPU en TPU: los scripts y gates G0-G6 documentan un flujo completo de cuantización y exportación en TPU v5e-8, reutilizable para otros modelos de tamaño similar.
- Estudio de degradación por cuantización extrema: con una similitud coseno de logits de 0,822 en el modelo completo, permite medir cuánto aguanta una tarea concreta antes de que la calidad caiga de forma inaceptable.
- Prototipado de exportación GGUF: el archivo de 36,03 GB con 627 tensores sirve para probar herramientas de conversión y carga de GGUF con pesos ternarios en F32, aunque no aproveche aún el formato empaquetado.
- Docencia y divulgación: ejemplo reproducible de cuantización por grupos con escalas, útil para explicar STE, group size y métricas de fidelidad.
- Evaluación de la aritmética recurrente en precisión mixta: al mantener Gated DeltaNet en precisión original, permite aislar el impacto de ternarizar solo las proyecciones lineales del transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas reportadas son internas al proceso de cuantización:

| Métrica | Valor |
|---|---|
| G4 Teacher KL | 83,80 |
| G4 Logit cos_sim | 0,822 |
| G2 Per-projection cos_sim | ~0,884 |
| G5 GGUF file size | 36,03 GB (F32) |
| G5 Tensors | 627 |

## Requisitos de hardware

- El GGUF publicado ocupa 36,03 GB en F32, por lo que la inferencia requiere al menos esa cantidad de memoria más el overhead del runtime; no cabe en GPUs de consumo de 24 GB sin recortes adicionales.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con 48 GB o más para cargar el archivo completo.
- En consumer GPU: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) con el archivo actual; requeriría una compresión real a 1,58 bits o una cuantización adicional del GGUF.
- Despliegue: llama.cpp u Ollama para el GGUF; vLLM o TGI no soportan de forma estándar pesos ternarios en F32 con escalas por grupo.
- El entrenamiento y la cuantización se realizaron en TPU v5e-8 con TorchTPU; la inferencia en TPU no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Azrael-ternary-9B | 9B | no disponible | Ternaria (group 128), GGUF F32 | Apache 2.0 | HuggingFace, 0 descargas |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9B | no disponible | Original en precisión completa | no disponible en esta ficha | HuggingFace (modelo base) |
| BitNet b1.58 (referencia de la técnica) | variable | no disponible | Ternaria empaquetada 1,58 bits | no disponible en esta ficha | no disponible en esta ficha |

La comparación con BitNet b1.58 es pertinente por la técnica, pero Azrael no implementa el formato empaquetado de 1,58 bits, por lo que no compite en eficiencia de memoria con las implementaciones nativas ternarias.

## Limitaciones y advertencias

- Los pesos son "fake-quantized": los códigos ternarios conviven con pesos maestros en F32, de modo que no se obtiene el ahorro de memoria de un formato de 1,58 bits real.
- El GGUF usa tensores F32 en lugar de TQ2_0 comprimido por compatibilidad de formato; el archivo de 36 GB no refleja el tamaño teórico de un modelo ternario de 9B.
- La compresión al formato empaquetado de 1,58 bits queda como trabajo futuro según el autor.
- La similitud coseno de logits de 0,822 en el modelo completo indica una divergencia notable respecto al profesor; la calidad downstream no está medida.
- La KL de 83,80 frente al profesor es alta y sugiere degradación significativa de la distribución de salida.
- Solo se declara soporte de inglés; no hay validación multilingüe.
- El modelo está diseñado para el harness "think" de MiMo; su comportamiento fuera de ese entorno no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y la degradación observada desaconsejan su uso en producción.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- No se especifica la longitud de contexto soportada.
- Riesgo de alucinación: no evaluado; la cuantización extrema puede incrementarlo.

## Enlaces

- [HuggingFace: moeshawky/Azrael-ternary-9B](https://huggingface.co/moeshawky/Azrael-ternary-9B)
- [Modelo base: XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B](https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B)
- Paper, blog o repositorio de TorchTPU: no disponible en la información proporcionada.
- Repositorio del harness "think" de MiMo: no disponible en la información proporcionada.
