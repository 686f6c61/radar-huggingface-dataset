# mrminjae/qwen3p6-35b-a3b-2p03bit-r104

## Resumen

Qwen3.6-35B-A3B 2.03-bit (r104) es una cuantizacion experimental del modelo Qwen/Qwen3.6-35B-A3B, un transformer de tipo mixture-of-experts (MoE) con 35.107.181.936 parametros totales. La publica el usuario mrminjae en Hugging Face como checkpoint de investigacion interna, con la etiqueta `r104` como identificador de version. El problema que aborda es el de reducir el coste de almacenamiento y de transferencia de un modelo MoE de 35B sin recurrir a una cuantizacion uniforme de baja precision en todos los pesos.

La innovacion concreta es selectiva: solo los expertos enrutados se almacenan a una media de 2,03 bits, mientras que el resto de los pesos (atencion, embeddings, router, capas densas) permanece en BF16. Los pesos se guardan dequantizados en tensores BF16, de modo que el modelo carga con `transformers` y vLLM estandar sin necesidad de kernels de cuantizacion especiales. El repositorio ocupa 70,2 GB.

Es relevante ahora porque demuestra una via practica para comprimir MoE preservando la compatibilidad con el ecosistema de inferencia existente, a costa de un mayor tamano en disco frente a una cuantizacion int4/int8 clasica. Al tratarse de un checkpoint de investigacion con cero descargas y sin model card extendida, debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,03 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Sigue la licencia del modelo base (no especificada en la informacion disponible) |
| Formato de pesos | safetensors (carga con `transformers` y vLLM estandar) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Qwen3.6, con 35.107.181.936 parametros totales y capacidad multimodal image-text-to-text segun los tags del repositorio. Esta publicacion no entrena el modelo desde cero: parte de Qwen/Qwen3.6-35B-A3B y aplica una cuantizacion selectiva de los expertos enrutados a una media de 2,03 bits, manteniendo el resto de los pesos en BF16. Los pesos resultantes se almacenan dequantizados en tensores BF16, por lo que la inferencia no requiere kernels de baja precision especificos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo etapas de RLHF o DPO en el modelo base. Tampoco se detalla la tecnica exacta de cuantizacion (por ejemplo, si se aplico GPTQ, AWQ, RTN o una variante propia), mas alla de la media de 2,03 bits declarada para los expertos enrutados y del identificador interno `r104`. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3.6-35B-A3B.
- Procesamiento multimodal image-text-to-text, segun el tag `image-text-to-text` del repositorio.
- Razonamiento y generacion de codigo: capacidades propias de la familia Qwen3.6, no verificadas de forma independiente en esta publicacion.
- Tool calling y function calling: no confirmado de forma explicita en la informacion disponible; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible el listado de idiomas soportados.
- Modo thinking, vision o audio: solo la componente de vision implicita en el tag image-text-to-text; no hay detalle adicional.

## Casos de uso

- Investigacion sobre cuantizacion selectiva en MoE: el checkpoint sirve como referencia para medir la degradacion de calidad al comprimir solo los expertos enrutados a 2,03 bits frente al modelo base en BF16.
- Despliegue en entornos con VRAM limitada: al cargar pesos BF16 dequantizados, permite ejecutar un MoE de 35B en configuraciones de GPU unica de gama alta sin necesidad de kernels de cuantizacion especiales.
- Evaluacion comparativa de pipelines de inferencia: util para contrastar el comportamiento de `transformers` y vLLM estandar con este checkpoint frente al modelo base sin cuantizar.
- Prototipado de asistentes multimodales: el soporte image-text-to-text permite construir demos de descripcion de imagenes y dialogo sobre documentos visuales, siempre que se valide la calidad tras la cuantizacion.
- Generacion de codigo asistida en entornos de desarrollo internos: aprovechando las capacidades del modelo base, con validacion previa de la perdida de precision en tareas HumanEval o similares.
- Reproduccion de experimentos academicos: el identificador `r104` y la model card minima permiten citar y replicar la configuracion de cuantizacion en estudios sobre eficiencia de modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos dequantizados en BF16, la huella en memoria se aproxima a la del modelo base en BF16 (del orden de 70 GB para los 35.107.181.936 parametros), sin la reduccion que cabria esperar de una cuantizacion a 2 bits. No se dispone de cifras oficiales.
- GPU recomendadas: no disponible de forma oficial; por tamano, se requiere al menos una GPU con 80 GB (A100 80GB, H100 80GB) o configuraciones multi-GPU.
- Cabe en GPU de consumo: no de forma directa en una RTX 4090 (24 GB) sin tecnicas adicionales de offloading o cuantizacion en tiempo de carga.
- Opciones de despliegue: `transformers` y vLLM estandar, segun la model card. No se confirma soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p03bit-r104 | 35.107.181.936 | no disponible | Expertos a 2,03 bits, resto BF16 | Sigue la del base (no especificada) | Hugging Face, checkpoint de investigacion |
| Qwen/Qwen3.6-35B-A3B (base) | 35.107.181.936 | no disponible | BF16 | no disponible | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparativa cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Checkpoint de investigacion interna: la model card lo describe explicitamente como tal, sin garantias de calidad ni de estabilidad.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.
- Cuantizacion agresiva de los expertos a 2,03 bits de media: riesgo de degradacion en tareas de razonamiento, codigo y matematicas respecto al modelo base en BF16; no se han publicado evaluaciones.
- Pesos almacenados dequantizados en BF16: el ahorro en disco es limitado (70,2 GB) y no se traduce en una reduccion proporcional de VRAM en inferencia.
- Licencia no especificada de forma explicita: la model card indica que sigue la del modelo base, pero no se detalla cual es; verificar antes de cualquier uso comercial.
- Idiomas soportados no documentados: riesgo de comportamiento desigual en castellano y otras lenguas.
- Riesgo de alucinacion inherente a los modelos generativos, no cuantificado en esta publicacion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Ausencia de datos sobre contexto maximo, parametros activos y tecnica exacta de cuantizacion, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p03bit-r104
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
