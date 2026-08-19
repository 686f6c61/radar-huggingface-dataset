# Macvex/albedo-unc

## Resumen

`Macvex/albedo-unc` es un checkpoint de salvamento (salvage) creado por el usuario Macvex, que consiste en una fusión LoRA aplicada sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según la escasa información disponible, se trata de un modelo de arquitectura `qwen3_5_moe` (mezcla de expertos) con 35.107.181.936 parámetros totales, alojado en formato `safetensors` con precisión BF16 y un tamaño de repositorio de 70,2 GB. El propio autor lo describe como "H1 merged checkpoint salvage" y aclara que es un "seguro TTL privado; no es una presentación hasta que se supere la puerta de la etapa 5", lo que sugiere que es un checkpoint intermedio de un proceso de entrenamiento o ajuste, no un modelo final destinado a producción.

No se dispone de model card detallada, licencia, idiomas soportados ni información sobre el proceso de entrenamiento más allá de la referencia al modelo base. La relevancia de este modelo es limitada: al ser un checkpoint de salvamento sin documentación pública, su utilidad principal es servir como respaldo técnico dentro del flujo de trabajo del autor, no como un modelo listo para uso general. Los resultados de búsqueda web no aportan información adicional sobre este modelo concreto; los enlaces encontrados corresponden a otros modelos del mismo autor (`Macvex/rda`, `Macvex/se02`) y a un dataset de visión por computador no relacionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es `qwen3_5_moe`, una variante de mezcla de expertos (MoE) de la familia Qwen3.5. No se dispone de detalles sobre el número de expertos, la estrategia de enrutamiento ni el tamaño de los parámetros activos. El modelo se construyó mediante la fusión de un adaptador LoRA sobre el checkpoint base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un ajuste fino de un modelo Qwen3.5 MoE. No hay información pública sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El autor indica que es un "checkpoint de salvamento" con un propósito temporal y privado, lo que sugiere que el entrenamiento aún está en curso o que el checkpoint se conserva como respaldo ante fallos.

## Capacidades

No se dispone de información verificable sobre las capacidades del modelo. La model card no describe tareas soportadas, y no hay demos ni documentación adicional. Dado que se basa en una arquitectura Qwen3.5 MoE, es plausible que herede capacidades de generación de texto, razonamiento y posiblemente tool calling, pero esto no está confirmado. Se recomienda tratar cualquier afirmación sobre capacidades como especulativa hasta que el autor publique documentación.

## Casos de uso

No se pueden enumerar casos de uso concretos sin información fiable sobre el modelo. Al ser un checkpoint de salvamento sin documentación, no está destinado a aplicaciones prácticas. Cualquier uso en producción sería prematuro y arriesgado. Se recomienda esperar a que el autor publique una versión estable y documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene pesos en BF16 con un tamaño total de 70,2 GB, lo que implica un requisito mínimo de VRAM de aproximadamente 70 GB para cargar el modelo completo en memoria.
- Para inferencia en GPU, se necesitaría al menos una GPU con 80 GB de VRAM (por ejemplo, A100 80GB o H100 80GB) o varias GPUs en paralelo.
- No cabe en GPUs de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB, etc.) sin cuantización.
- No se dispone de información sobre cuantizaciones disponibles (GGUF, AWQ, GPTQ, etc.), por lo que no se puede recomendar un despliegue en llama.cpp u Ollama.
- Opciones de despliegue: vLLM o TGI podrían soportar el modelo si se dispone de la VRAM necesaria, pero no hay confirmación oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo comparte arquitectura con otros checkpoints del mismo autor (`Macvex/rda`, `Macvex/se02`), pero no hay datos de rendimiento ni especificaciones detalladas. Tampoco se conocen modelos comparables de la misma categoría con los que contrastar de forma objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo es un checkpoint de salvamento privado, no una versión final. El propio autor advierte que "no es una presentación hasta que se supere la puerta de la etapa 5".
- No hay licencia especificada, lo que impide cualquier uso comercial o redistribución legal.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto.
- No se conocen los idiomas soportados ni la calidad de generación en distintos dominios.
- Cualquier uso en producción es desaconsejable por la falta de información y la naturaleza provisional del checkpoint.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido evaluado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Macvex/albedo-unc
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- Otros modelos del autor: https://huggingface.co/Macvex/rda y https://huggingface.co/Macvex/se02
- Resultados de búsqueda web (no relacionados directamente): https://github.com/GDAOSU/Olbedo y https://arxiv.org/abs/2602.22025
