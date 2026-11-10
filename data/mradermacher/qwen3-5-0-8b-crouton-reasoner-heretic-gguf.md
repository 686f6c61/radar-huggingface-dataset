# mradermacher/Qwen3.5-0.8B-Crouton-Reasoner-heretic-GGUF

## Resumen

Qwen3.5-0.8B-Crouton-Reasoner-heretic-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-heretic, publicada por mradermacher. El modelo subyacente es un ajuste fino por destilación y SFT (con LoRA) sobre una base Qwen3.5 de 0,8B de parámetros, orientado a razonamiento y marcado explícitamente como "heretic", "uncensored", "decensored" y "abliterated", lo que indica que se ha aplicado una técnica de eliminación de rechazos (abliteration) para reducir las negativas del modelo ante ciertas peticiones.

El interés de esta publicación es doble. Por un lado, ofrece variantes GGUF listas para usar con llama.cpp y derivados (Ollama, LM Studio, etc.) de un modelo muy pequeño (752.393.024 parámetros reales según safetensors), lo que permite ejecutarlo en hardware de consumo modesto. Por otro, el repo incluye ficheros mmproj, lo que sugiere soporte multimodal (visión) en el modelo base, aunque la model card no detalla la arquitectura interna.

La licencia es Apache 2.0 según los metadatos, y el idioma declarado es únicamente inglés. No se han publicado resultados de benchmarks ni detalles sobre el contexto máximo en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5-0.8B. Según las etiquetas del repo, el entrenamiento combina destilación y SFT con LoRA sobre el dataset Stormtrooperaim/Crouton-Alpha-Distilled, y posteriormente se aplica una técnica de abliteration ("heretic") para eliminar comportamientos de rechazo. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La publicación de mradermacher es únicamente una conversión a GGUF con cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf). No aporta entrenamiento adicional ni modifica los pesos más allá de la cuantización. La presencia de ficheros mmproj indica que el modelo base incorpora un proyector multimodal, presumiblemente para entrada de imágenes, aunque no se detalla su funcionamiento.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y modo "reasoner" (según el nombre del modelo; sin detalles técnicos disponibles).
- Entrada multimodal probable (presencia de ficheros mmproj), sin confirmación explícita en la model card.
- Comportamiento "uncensored"/"abliterated": menor tasa de rechazos ante peticiones que otros modelos rechazarían.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Experimentación con modelos pequeños en local: las cuantizaciones Q4_K_M (0,6 GB) y Q8_0 (0,9 GB) permiten probar un modelo de razonamiento en portátiles sin GPU dedicada mediante llama.cpp u Ollama.
- Investigación sobre abliteration y alineación: útil para estudiar cómo afecta la eliminación de rechazos al comportamiento del modelo en tareas sensibles, comparando con el modelo base sin modificar.
- Prototipado rápido de asistentes conversacionales en inglés: el tamaño reducido permite iterar con baja latencia en CPU o GPU de gama baja.
- Pruebas de pipelines multimodales: los ficheros mmproj permiten evaluar entrada de imágenes en un modelo de menos de 1B de parámetros, útil para validar arquitecturas antes de escalar.
- Generación de texto en entornos con recursos muy limitados: la cuantización Q2_K (0,5 GB) cabe en dispositivos con poca memoria, aunque con pérdida de calidad.
- Evaluación comparativa de cuantizaciones: el repo ofrece 12 variantes, lo que facilita medir el impacto de la cuantización en perplejidad y calidad para un modelo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,7 GB para cuantizaciones Q2_K a Q4_K_M; 0,9 GB para Q8_0; 1,6 GB para f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU sin GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; los ficheros mmproj requieren soporte multimodal del runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Crouton-Reasoner-heretic (este) | 752M | no disponible | Apache 2.0 | GGUF | Ajuste destilado + abliterated, solo inglés |
| Qwen3.5-0.8B base | ~0,8B | no disponible | no disponible | safetensors | Modelo original sin ajuste ni abliteration |
| Otros modelos <1B (p. ej. Llama 3.2 1B, Gemma 2 2B) | 1-2B | 8K-128K (según modelo) | licencias variables | GGUF, safetensors | Comparativa no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": puede generar contenido que otros modelos rechazarían; no apto para producción sin filtros adicionales.
- Entrenado y declarado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Tamaño muy reducido (752M): capacidad de razonamiento y conocimiento factual limitados en comparación con modelos de 7B o superiores.
- Riesgo elevado de alucinación inherente a modelos pequeños.
- No se documentan sesgos específicos, pero el dataset de destilación (Crouton-Alpha-Distilled) no está descrito en detalle.
- La licencia Apache 2.0 permite uso comercial, pero el comportamiento "uncensored" puede implicar riesgos legales o de reputación si se despliega sin moderación.
- No se especifica la longitud de contexto máxima; asumir valores conservadores hasta verificarlo.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- [Hugging Face: mradermacher/Qwen3.5-0.8B-Crouton-Reasoner-heretic-GGUF](https://huggingface.co/mradermacher/Qwen3.5-0.8B-Crouton-Reasoner-heretic-GGUF)
- [Modelo base: Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-heretic](https://huggingface.co/Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-heretic)
- [Dataset: Stormtrooperaim/Crouton-Alpha-Distilled](https://huggingface.co/datasets/Stormtrooperaim/Crouton-Alpha-Distilled)
- [Cuantizaciones imatrix: mradermacher/Qwen3.5-0.8B-Crouton-Reasoner-heretic-i1-GGUF](https://huggingface.co/mradermacher/Qwen3.5-0.8B-Crouton-Reasoner-heretic-i1-GGUF)
- [Página de resumen de mradermacher](https://hf.tst.eu/model#Qwen3.5-0.8B-Crouton-Reasoner-heretic-GGUF)
- [Solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [README de referencia de TheBloke sobre GGUF](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [Gráfico de perplejidad de ikawrakow](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
