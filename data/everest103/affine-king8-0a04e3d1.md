# everest103/affine-king8-0a04e3d1

## Resumen

El modelo `affine-king8-0a04e3d1` es un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado en HuggingFace por el usuario `everest103`. Según el tag `qwen3_5_moe`, se trata de una implementación basada en la arquitectura Qwen3.5 MoE, aunque no se dispone de información oficial que lo confirme. El modelo cuenta con 35.951.822.704 parámetros (35,95 mil millones) y su repositorio ocupa 71,9 GB, lo que sugiere un almacenamiento en precisión de 16 bits (FP16 o BF16). Fue creado el 7 de septiembre de 2026 y actualizado el mismo día.

Se trata de un modelo con muy poca documentación pública: no se ha publicado información sobre licencia, idiomas soportados, longitud de contexto, datos de entrenamiento ni benchmarks. A pesar de ello, su tamaño y arquitectura MoE lo convierten en un candidato potencial para tareas de generación de texto y razonamiento a gran escala, aunque su uso en producción requiere precaución debido a la ausencia de especificaciones oficiales y a su bajo número de descargas (5).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (según tag) |
| Parámetros totales | 35.951.822.704 (35,95 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se identifica como MoE (Mixture of Experts) basada en la familia Qwen3.5, según el tag `qwen3_5_moe`. No se dispone de información sobre el número de expertos, el mecanismo de enrutamiento ni la configuración exacta de la red. Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el número de tokens, la composición del dataset, si se aplicó RLHF, DPO u otras técnicas de alineación. No hay innovaciones técnicas documentadas.

## Capacidades

- No se dispone de información oficial sobre las capacidades específicas del modelo.
- Se desconoce si soporta tool calling, agentes, visión, audio o cualquier otra capacidad especial.
- Al ser un modelo MoE de gran tamaño, es razonable esperar que pueda realizar tareas de generación de texto y razonamiento, pero no hay confirmación.

## Casos de uso

- No se dispone de información oficial sobre casos de uso validados. El modelo no cuenta con documentación ni benchmarks publicados, por lo que no es posible recomendar aplicaciones concretas con seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones basadas en el tamaño y formato de pesos:

- VRAM estimada para inferencia: aproximadamente 72 GB en precisión FP16/BF16, 36 GB en cuantización de 8 bits y 18 GB en cuantización de 4 bits.
- GPU recomendadas: A100 80GB, H100 80GB para FP16/BF16; RTX 4090 (24 GB) podría ejecutarlo en cuantización de 4 bits, aunque sin garantía.
- Posibilidad de ejecución en GPU de consumo: sí, con cuantización de 4 bits y una GPU con al menos 24 GB de VRAM, pero no está confirmado.
- Opciones de despliegue: no disponibles. Por el formato safetensors, es probable que pueda cargarse con Transformers o vLLM, pero no hay confirmación oficial. No se ha publicado una conversión a GGUF, por lo que llama.cpp u Ollama no son opciones directas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. No se han publicado benchmarks ni especificaciones que permitan una comparación objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no evaluado.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede confirmar si el modelo es de uso libre, incluido el uso comercial.
- Caveat importante para producción: el modelo tiene solo 5 descargas y ninguna documentación, lo que indica que es experimental y no ha sido validado por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/everest103/affine-king8-0a04e3d1
- Perfil del usuario en HuggingFace: https://huggingface.co/everest103
- Datasets del usuario: https://huggingface.co/everest103/datasets

No se han encontrado papers, blogs ni demos disponibles.
