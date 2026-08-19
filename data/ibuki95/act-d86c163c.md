# ibuki95/act-d86c163c

## Resumen

El modelo `ibuki95/act-d86c163c` es un modelo de lenguaje de gran tamaño (LLM) con arquitectura de mezcla de expertos (MoE) basado en la familia Qwen3.5, desarrollado por el usuario ibuki95. Cuenta con aproximadamente 35.100 millones de parámetros y está diseñado para tareas de generación de texto y conversación, con soporte adicional para entrada multimodal (imagen y texto) según las etiquetas del repositorio. Se trata de un fine-tuning del modelo base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece derivar de una fusión de modelos de la serie Affine.

El modelo se publicó en agosto de 2026 y su acceso está restringido (gated), lo que implica que los usuarios deben aceptar condiciones específicas en Hugging Face antes de poder descargarlo. A pesar de su tamaño considerable, la documentación pública es muy escasa: no se han publicado detalles sobre el contexto máximo, los idiomas soportados, la licencia o los datos de entrenamiento. Esto limita su evaluación objetiva y su adopción en entornos de producción sin una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 (qwen3_5_moe) |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es de tipo MoE (mezcla de expertos), lo que implica que solo una fracción de los parámetros se activa por token durante la inferencia. Sin embargo, no se ha especificado el número de parámetros activos ni el número de expertos. El modelo está etiquetado como `image-text-to-text`, lo que sugiere que puede procesar tanto imágenes como texto, aunque el pipeline declarado es únicamente `text-generation`. Esto podría indicar que el modelo acepta entradas multimodales pero genera solo texto, o que la etiqueta es un remanente del proceso de fusión.

El modelo es un fine-tuning de `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un modelo de la serie Affine (posiblemente una fusión de varios modelos). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se conocen innovaciones técnicas específicas más allá de la propia arquitectura MoE heredada de Qwen3.5.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y el modelo está etiquetado como `conversational`, lo que indica que puede mantener diálogos multi-turno.
- Entrada multimodal: la etiqueta `image-text-to-text` sugiere que el modelo puede recibir imágenes como entrada adicional al texto, aunque no se ha confirmado su funcionamiento real.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el modelo puede desplegarse en plataformas de inferencia compatibles con la API de Hugging Face.
- No se han documentado capacidades específicas como tool calling, razonamiento avanzado, generación de código o soporte multilingüe. Estas capacidades no pueden asumirse sin evidencia.

## Casos de uso

Dado que la información pública es muy limitada, los casos de uso que se enumeran a continuación son hipotéticos y deben validarse con pruebas propias antes de considerar el modelo para producción.

- Asistentes conversacionales: el modelo podría emplearse para construir chatbots de atención al cliente o asistentes virtuales, aprovechando su naturaleza conversacional y su tamaño considerable para generar respuestas coherentes.
- Procesamiento de documentos con imágenes: si la capacidad multimodal se confirma, podría utilizarse para extraer información de capturas de pantalla, diagramas o documentos escaneados combinados con texto.
- Generación de contenido creativo: redacción de artículos, guiones o material de marketing, siempre que se valide la calidad de las respuestas.
- Análisis de texto en dominios específicos: tras un fine-tuning adicional, podría adaptarse a dominios como legal, médico o financiero, aunque no hay evidencia de que el modelo base ya esté especializado.
- Investigación académica: como modelo MoE de 35B, puede servir para estudiar el comportamiento de arquitecturas de mezcla de expertos en tareas de generación de texto.
- Prototipado rápido: gracias a su compatibilidad con endpoints, podría integrarse en entornos de desarrollo para probar ideas antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas. Tampoco hay comparaciones con modelos similares.

## Requisitos de hardware

- El repositorio ocupa 70,2 GB en formato safetensors, lo que da una idea del espacio en disco necesario para almacenar los pesos.
- Para inferencia con precisión FP16, se necesitarían aproximadamente 70 GB de VRAM (considerando 2 bytes por parámetro). Esto supera la capacidad de cualquier GPU de consumo actual (por ejemplo, RTX 4090 con 24 GB).
- Con cuantización a 8 bits, la VRAM requerida bajaría a unos 35 GB, todavía por encima de las GPUs de consumo. Con cuantización a 4 bits, se necesitarían unos 18 GB, lo que podría caber en una RTX 4090 o similar, aunque no se ha confirmado que existan versiones cuantizadas de este modelo.
- Para un despliegue eficiente se recomendarían GPUs de centro de datos como A100 (40/80 GB) o H100 (80 GB), o bien el uso de técnicas de offloading a CPU.
- Las opciones de despliegue incluyen vLLM, TGI o llama.cpp (si se generan archivos GGUF), aunque no se ha confirmado la compatibilidad con estas herramientas.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo pertenece a la familia Qwen3.5 MoE, pero no se conocen los parámetros activos ni el rendimiento real. Alternativas como Qwen3-30B-A3B (MoE de 30B totales y 3B activos) o DeepSeek-V2-Lite (16B MoE) podrían ser comparables en tamaño, pero sin datos de benchmarks no es posible realizar una comparación objetiva. Se recomienda consultar la documentación de estos modelos para evaluar alternativas.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en entornos corporativos o académicos.
- Documentación insuficiente: no se han publicado detalles sobre contexto, idiomas, licencia, datos de entrenamiento o sesgos. Esto impide una evaluación de riesgos adecuada.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos desconocidos: al no conocer la composición del dataset de entrenamiento, no se puede descartar la presencia de sesgos de género, raza o idioma.
- Tamaño y requisitos de hardware: con 35B parámetros, el modelo no es adecuado para despliegues en hardware de consumo sin cuantización agresiva, lo que puede degradar la calidad.
- Sin garantías de producción: al no haber benchmarks ni pruebas de robustez, no se recomienda su uso en aplicaciones críticas sin una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibuki95/act-d86c163c
- Perfil del autor: https://huggingface.co/ibuki95
- Modelo relacionado del mismo autor: https://huggingface.co/ibuki95/ver-3dda6046
- Página del modelo en Bytez: https://bytez.com/model/ibuki95/c4cew7zr
