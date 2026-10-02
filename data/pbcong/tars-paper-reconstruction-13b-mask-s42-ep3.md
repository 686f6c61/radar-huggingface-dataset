# pbcong/tars-paper-reconstruction-13b-mask-s42-ep3

## Resumen

TARS paper 13b es un checkpoint de ajuste fino completo (epoch 3) publicado por el usuario pbcong bajo el identificador `pbcong/tars-paper-reconstruction-13b-mask-s42-ep3`. Se construye sobre `liuhaotian/llava-v1.5-13b`, un modelo multimodal (vision-lenguaje) de 13.350.839.296 parametros en total, y se distribuye en formato safetensors con un tamano de repositorio de 26,7 GB.

El modelo esta orientado a tareas de "reconstruccion de papers": el autor lo enmarca en una linea de trabajo sobre evaluacion de articulos cientificos generados por agentes de IA, en linea con el framework "Paper Reconstruction Evaluation" descrito en el paper arXiv 2604.01128. La model card aclara que los perfiles de paper son reconstrucciones con supuestos documentados y no checkpoints de los autores originales.

Es relevante en la medida en que se alinea con la investigacion reciente sobre evaluacion de presentacion y alucinacion en papers escritos por IA. No obstante, el checkpoint es de publicacion muy reciente, no tiene descargas ni likes registrados, carece de licencia e idiomas declarados y no presenta benchmarks medidos (el propio autor indica "Measured benchmarks: pending").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (tag `llava_llama`): transformer multimodal con encoder de vision, proyector y LLM causal; derivado de `liuhaotian/llava-v1.5-13b` |
| Parametros totales | 13.350.839.296 (~13,35 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible para este checkpoint; el modelo base LLaVA-1.5-13B emplea 4096 tokens, sin confirmacion para este ajuste |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia LLaVA (`llava_llama`), es decir, un transformer causal de lenguaje acoplado a un encoder de vision y un proyector que alinea ambos espacios. El modelo base declarado es `liuhaotian/llava-v1.5-13b`, un modelo multimodal de la serie LLaVA 1.5. Este checkpoint concreto es el resultado de un ajuste fino completo (full fine-tuning) durante 3 epocas, en el formato LLaVA original.

El autor advierte de que debe cargarse con el cargador TARS/LLaVA fijado ("pinned TARS/LLaVA loader") y no con un cargador LoRA de Hugging Face. Los ajustes de entrenamiento y las revisiones se documentan en el fichero `reproduction.json`, aunque no se detallan en la informacion proporcionada. No consta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se describen innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto y procesamiento multimodal derivado del modelo base LLaVA-1.5-13B (vision + lenguaje).
- Reconstruccion de articulos cientificos (paper reconstruction) como tarea principal declarada por el autor.
- Capacidades de razonamiento y generacion propiciadas por el LLM subyacente de 13 B de parametros.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Reconstruccion de papers: reconstruir el contenido de articulos cientificos a partir de materiales parciales, que es la tarea que da nombre al checkpoint (`paper-reconstruction`).
- Evaluacion de articulos generados por IA: analizar presentacion y posibles alucinaciones en papers escritos automaticamente, en linea con el framework del paper arXiv 2604.01128.
- Analisis de documentos con componente visual: aprovechar la base multimodal LLaVA-1.5 para procesar figuras, tablas o diagramas presentes en publicaciones.
- Asistencia a revision cientifica: generar borradores estructurados (resumen, metodos, resultados) a partir de notas, dado el tamano de 13 B que permite seguimiento de instrucciones.
- Investigacion academica experimental: usar el checkpoint como punto de partida para reproducir los ajustes descritos en `reproduction.json`.
- Base para ajuste adicional: al ser un full fine-tuning en formato LLaVA original, puede servir como punto de partida para nuevos experimentos de dominio cientifico.

Nota: no se documentan casos de uso adicionales ni validaciones de produccion en la informacion proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explicitamente "Measured benchmarks: pending" (benchmarks medidos pendientes).

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 13,35 B de parametros): aproximadamente 26,7 GB en precision fp16/bf16, unos 13,4 GB en int8 y unos 6,7 GB en int4. Son estimaciones derivadas del recuento de parametros, no cifras oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, un modelo de 13 B en fp16 requiere GPUs de clase A100 40 GB, H100 o multiples GPU. No se confirma compatibilidad con ninguna GPU concreta.
- Cabe en GPU de consumo: en fp16 no cabria en GPUs de 24 GB (RTX 4090/3090) sin cuantizacion; con cuantizacion int4 podria aproximarse a tarjetas de 24 GB, aunque no hay variantes de cuantizacion publicadas ni validacion oficial.
- Opciones de despliegue: el autor exige cargar el modelo con el cargador TARS/LLaVA fijado, no con un cargador LoRA de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pbcong/tars-paper-reconstruction-13b-mask-s42-ep3 | 13,35 B | no disponible | no disponible | HuggingFace (0 descargas) |
| liuhaotian/llava-v1.5-13b (modelo base) | ~13 B | 4096 tokens | no disponible en esta ficha | HuggingFace (modelo de referencia ampliamente usado) |
| Otros derivados LLaVA-1.5-13B | ~13 B | 4096 tokens | variable segun autor | HuggingFace |

No se dispone de datos de rendimiento del modelo propuesto, por lo que no es posible una comparacion cuantitativa. La comparativa se limita a parametros, contexto y disponibilidad, y se marca el resto como no disponible.

## Limitaciones y advertencias

- El autor advierte de que los perfiles de paper son reconstrucciones con supuestos documentados y no checkpoints de los autores originales; no deben tomarse como reproducciones fieles.
- Riesgo de alucinacion: el modelo esta vinculado a la evaluacion de alucinaciones en papers generados por IA, lo que implica un riesgo relevante de contenido fabricado, especialmente en contextos cientificos.
- No se han publicado benchmarks medidos ("Measured benchmarks: pending"), por lo que no hay evidencia cuantitativa de calidad o fiabilidad.
- Ausencia de licencia declarada: no se especifican condiciones de uso comercial ni restricciones, lo que impide determinar su idoneidad legal para produccion.
- No se declaran idiomas soportados; se desconoce su cobertura multilingue.
- Carga restringida: requiere el cargador TARS/LLaVA fijado y no funciona con cargadores LoRA estandar de Hugging Face.
- Publicacion de muy reciente creacion (1 de octubre de 2026 segun los metadatos), con 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- Sesgos conocidos: no disponible.

## Enlaces

- HuggingFace: https://huggingface.co/pbcong/tars-paper-reconstruction-13b-mask-s42-ep3
- Modelo base: https://huggingface.co/liuhaotian/llava-v1.5-13b
- Paper "Paper Reconstruction Evaluation" (arXiv): https://arxiv.org/abs/2604.01128
- PDF del paper: https://arxiv.org/pdf/2604.01128
- Abstract en ADS: https://ui.adsabs.harvard.edu/abs/2026arXiv260401128M/abstract
- Version en alphaXiv: https://www.alphaxiv.org/abs/2604.01128v1
- Ficha en Catalyzex: https://www.catalyzex.com/paper/paper-reconstruction-evaluation-evaluating
