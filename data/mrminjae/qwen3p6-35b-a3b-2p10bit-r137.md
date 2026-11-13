# mrminjae/qwen3p6-35b-a3b-2p10bit-r137

## Resumen

`mrminjae/qwen3p6-35b-a3b-2p10bit-r137` es un checkpoint de investigación publicado por el usuario mrminjae que consiste en una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B. La particularidad tecnica es que solo los expertos enrutados del modelo MoE se han cuantizado a una media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) se mantienen en BF16. Los pesos se almacenan descomprimidos en tensores BF16, de modo que cargan directamente con `transformers` o vLLM sin necesidad de kernels de cuantización especiales.

El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture-of-Experts (MoE) multimodal con capacidad image-text-to-text, desarrollado por Alibaba Qwen. Aunque el nombre comercial sugiere 35B de parametros, el recuento real de parametros en safetensors es de 67.319.436.656 (unos 67,3 mil millones), lo que indica que el total del modelo MoE es mayor que la cifra nominal. El checkpoint ocupa 134,7 GB en el repositorio.

La relevancia de esta publicacion es limitada y experimental: se trata de un checkpoint interno sin descargas ni interacciones, sin model card detallada, sin benchmarks y sin licencia explicita mas alla de la herencia del modelo base. Es util como referencia para quienes investigan tecnicas de cuantización extrema de expertos en arquitecturas MoE, pero no es un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, tipo `qwen3_5_moe` |
| Parametros totales | 67.319.436.656 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16 (pesos almacenados descomprimidos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (tensores BF16 descomprimidos) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts, identificado en los tags de Hugging Face como `qwen3_5_moe`, con pipeline `image-text-to-text`, lo que implica capacidades multimodales de entrada imagen y texto. El checkpoint derivado no introduce cambios arquitectonicos: es una transformacion de pesos que cuantiza exclusivamente los expertos enrutados a una media de 2,10 bits, manteniendo el resto de componentes (atención, embeddings, router y capas densas) en BF16. Los pesos se almacenan ya descomprimidos en tensores BF16, por lo que la carga es compatible con `transformers` y vLLM estandar, sin necesidad de kernels de cuantización especificos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documenta ninguna innovacion tecnica adicional en el checkpoint (decodificacion especulativa, atención lineal, etc.). El identificador interno `r137` sugiere una iteracion de investigación dentro de una serie de experimentos de cuantización del autor.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base.
- Procesamiento multimodal image-text-to-text: acepta imagenes y texto como entrada (segun el pipeline declarado).
- Razonamiento multi-paso y generacion de codigo: capacidades propias de la familia Qwen3, aunque no documentadas explicitamente en este checkpoint.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles (los idiomas no estan declarados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion en cuantizacion extrema de MoE: el checkpoint sirve para estudiar el impacto de reducir los expertos enrutados a 2,10 bits manteniendo el resto en BF16, comparando calidad frente al modelo base completo.
- Experimentacion academica con modelos multimodales comprimidos: util para laboratorios que necesitan reducir el espacio en disco de un MoE multimodal de ~67B sin implementar kernels de cuantizacion personalizados, ya que los pesos cargan en `transformers` estandar.
- Prototipado de pipelines image-text-to-text en entornos con VRAM limitada: al almacenarse en BF16 descomprimido, el ahorro es de disco y de ancho de banda de carga, no de VRAM en ejecucion, por lo que encaja en escenarios de investigacion mas que de despliegue.
- Evaluacion de degradacion por cuantizacion: permite medir la perdida de calidad en tareas de generacion de texto y vision comparando contra Qwen3.6-35B-A3B en BF16.
- Reproducibilidad de experimentos internos: al estar etiquetado como `r137`, facilita replicar resultados de una serie de experimentos de cuantizacion.
- Base para futuros fine-tunes experimentales: puede servir como punto de partida para investigar si el ajuste fino recupera calidad perdida por la cuantizacion de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se almacenan en BF16 descomprimido, por lo que en memoria ocupan aproximadamente el mismo espacio que el modelo base (~67,3B parametros en BF16, del orden de 130-135 GB). El ahorro de la cuantizacion a 2,10 bits aplica al almacenamiento en disco, no a la VRAM en ejecucion con `transformers`/vLLM estandar.
- GPU recomendadas: para cargar el modelo completo en BF16 se necesitan multiples GPU de alta gama (A100 80GB, H100 80GB) o configuraciones multi-GPU; una sola GPU consumer no es suficiente.
- Cabe en consumer GPU: no, en su forma actual de pesos BF16 descomprimidos. Seria necesario aplicar una cuantizacion adicional en tiempo de carga (por ejemplo, a 4 u 8 bits) para reducir el footprint.
- Opciones de despliegue: `transformers` y vLLM (segun el autor, carga con stock `transformers` / vLLM). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r137 | 67,3B (total) | no disponible | no disponible (hereda del base) | safetensors BF16 descomprimido | Checkpoint experimental, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | ~67,3B (total, segun safetensors del derivado) | no disponible | no disponible en la informacion | safetensors | Modelo original sin cuantizar |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación interno (`r137`) sin documentacion de calidad, sin benchmarks y sin validacion publica; no apto para produccion sin evaluacion previa.
- La cuantizacion de expertos a 2,10 bits puede degradar la calidad de forma significativa en tareas que dependan de la capacidad de los expertos; no se han publicado metricas que lo cuantifiquen.
- Los pesos se almacenan descomprimidos en BF16, por lo que el requisito de VRAM en inferencia es practicamente el del modelo base completo (~130-135 GB); el ahorro solo se materializa en disco.
- Licencia no declarada explicitamente; el autor remite a la licencia del modelo base, que debe verificarse antes de cualquier uso comercial.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero inherentes a cualquier modelo de lenguaje de gran escala sin evaluacion publica.
- Sin descargas ni likes en Hugging Face, lo que impide contrastar su comportamiento con la comunidad.
- No se confirma soporte de tool calling ni de modo agente en este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r137
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
