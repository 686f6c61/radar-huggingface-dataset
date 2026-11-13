# mrminjae/qwen3p6-35b-a3b-2p10bit-r147

## Resumen

Qwen3.6-35B-A3B 2.10-bit (r147) es un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, publicado por el usuario mrminjae en Hugging Face. Se trata de una cuantización selectiva: los expertos enrutados del modelo MoE se almacenan a una media efectiva de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanecen en BF16. Los pesos se distribuyen dequantizados en tensores BF16, de modo que el modelo carga con `transformers` estándar y con vLLM sin necesidad de kernels especiales.

El modelo base es un Mixture-of-Experts de 35.107.181.936 parámetros totales (etiqueta `qwen3_5_moe`), orientado a generación de texto y a tareas image-text-to-text. La propuesta de esta variante es reducir el coste de almacenamiento y de ancho de banda de memoria de los expertos manteniendo intacta la precisión del resto de la red, lo que resulta relevante para despliegues con VRAM limitada o para servir el modelo en GPUs de gama alta consumer.

La información publicada por el autor es mínima: no se detallan idiomas, licencia explícita (se indica que sigue la del modelo base), composición del dataset de calibración ni resultados de evaluación. El repositorio ocupa 70,2 GB y no registra descargas ni likes en el momento de la consulta, por lo que debe tratarse como un artefacto experimental sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, etiqueta `qwen3_5_moe`; capacidades image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización selectiva de expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la del modelo base Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (BF16), compatible con `transformers` y vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos, donde cada token activa un subconjunto de expertos según un router aprendido. Sobre esa estructura, esta variante aplica una cuantización post-entrenamiento únicamente a los pesos de los expertos enrutados, con una precisión media de 2,10 bits, mientras que atención, embeddings, proyecciones del router y el resto de componentes se mantienen en BF16. Los tensores se guardan ya dequantizados en BF16, de forma que la inferencia no requiere código personalizado.

No se ha publicado información sobre el dataset de calibración, el algoritmo de cuantización (por ejemplo GPTQ, AWQ o una variante propia), el número de tokens de entrenamiento del modelo base ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El identificador interno «r147» sugiere una iteración de un proceso de investigación, sin mayor contexto público.

## Capacidades

- Generación de texto conversacional y de formato largo, heredada del modelo base Qwen3.6-35B-A3B.
- Procesamiento image-text-to-text, según la etiqueta del pipeline del repositorio, lo que implica entrada multimodal de imagen y texto.
- Razonamiento multi-paso y matemáticas: presumiblemente soportadas por el modelo base, aunque no hay evaluación publicada para esta variante cuantizada.
- Generación de código: capacidad esperable del base, no verificada en este checkpoint.
- Tool calling y function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Modo thinking explícito, visión o audio: no disponible en la documentación publicada.

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint permite estudiar cómo afecta una precisión media de 2,10 bits en los expertos a la calidad de salida, comparando contra el modelo base en BF16 con el mismo prompt set.
- Despliegue en GPUs con VRAM ajustada: al almacenar los expertos a 2,10 bits efectivos, el peso en disco y en memoria es menor que el del base, lo que facilita probar un MoE de 35B en entornos con menos de 80 GB de VRAM, siempre que se valide la pérdida de calidad.
- Servido con vLLM para experimentos de throughput: al cargar con vLLM estándar, puede integrarse en pipelines de evaluación comparativa de latencia y tokens por segundo frente al modelo original.
- Prototipado de asistentes multimodales: la etiqueta image-text-to-text permite experimentar con flujos de pregunta-respuesta sobre imágenes en entornos de investigación, sin compromiso de producción.
- Generación de código en entornos controlados: útil para pipelines internos de CI/CD donde se prioriza el coste de memoria sobre la precisión máxima, con revisión humana obligatoria.
- Base para fine-tuning ligero: al estar en BF16 dequantizado, puede servir como punto de partida para adaptaciones con LoRA en tareas específicas, aunque la pérdida inicial de calidad por la cuantización debe tenerse en cuenta.
- Evaluación de robustez y alucinación: comparar respuestas del checkpoint cuantizado frente al base en dominios sensibles para medir el impacto de la cuantización en la fidelidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 70,2 GB en safetensors BF16; en carga completa se requiere al menos esa cantidad de memoria, más overhead de activaciones y KV cache. No se dispone de cifras oficiales del autor.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para carga completa en una sola GPU; configuraciones multi-GPU para entornos con menos memoria por dispositivo.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en carga completa; requeriría sharding multi-GPU o conversión adicional a formatos de menor precisión, no documentada.
- Opciones de despliegue: `transformers` estándar y vLLM, según indica el autor. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r147 | 35,1 B | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible (sigue la del base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1 B | no disponible | BF16 original | la del modelo Qwen | Hugging Face |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación interna («Internal research checkpoint»), sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- La cuantización a 2,10 bits en los expertos puede degradar la calidad de forma no medida; no hay benchmarks publicados que cuantifiquen la pérdida frente al base.
- Licencia no declarada explícitamente; el autor remite a la del modelo base Qwen/Qwen3.6-35B-A3B, que debe verificarse antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin comprobación.
- Riesgo de alucinación inherente a los modelos generativos, potencialmente amplificado por la cuantización agresiva de los expertos.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los de su dataset de entrenamiento.
- No se especifica el método de cuantización ni el dataset de calibración, lo que dificulta la reproducibilidad.
- El tamaño del repositorio (70,2 GB) implica requisitos de almacenamiento y de ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r147
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
