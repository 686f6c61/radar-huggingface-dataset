# seomh/opd-sftb8dm15e-s2000-qwen3moe30b-ot3math-step10

## Resumen

El modelo `seomh/opd-sftb8dm15e-s2000-qwen3moe30b-ot3math-step10` es un ajuste fino alojado en HuggingFace por el usuario `seomh`, publicado el 12 de octubre de 2026. El identificador y las etiquetas (`safetensors`, `qwen3`) apuntan a un ajuste supervisado (SFT) sobre un modelo de la familia Qwen3 con arquitectura Mixture-of-Experts, presumiblemente el checkpoint intermedio número 10 de una ejecución de entrenamiento de 2000 pasos sobre un corpus de matemáticas. No se ha publicado model card, por lo que la mayor parte de los metadatos (licencia, idiomas, contexto, dataset exacto) no están confirmados.

El dato más llamativo es la discrepancia entre el nombre y el contenido real: pese a que el identificador incluye `qwen3moe30b`, el recuento de parámetros almacenados en los ficheros safetensors es de 8.190.735.360 (unos 8,19 mil millones), muy por debajo de los ~30.000 millones que sugiere la nomenclatura. El repositorio ocupa 16,4 GB y los pesos están en BF16. Esto sugiere un modelo recortado, un checkpoint parcial o una configuración que no se explica en la información disponible.

Se trata de una publicación experimental con 7 descargas y 0 «likes», sin pipeline declarado ni proveedor de inferencia asociado. Es relevante únicamente como artefacto de investigación sobre ajuste fino de modelos MoE en dominios matemáticos, no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE), basada en la familia Qwen3 (inferido del tag `qwen3` y del nombre del repositorio; no confirmado en model card) |
| Parametros totales | 8.190.735.360 (~8,19 mil millones, dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El repositorio no incluye model card ni documentación técnica, de modo que la descripción de la arquitectura y del entrenamiento solo puede inferirse del identificador. La etiqueta `qwen3` y el fragmento `qwen3moe30b` apuntan a un modelo base de la familia Qwen3 con mezcla de expertos, mientras que el prefijo `opd` y la cadena `sftb8dm15e-s2000` sugieren una ejecución de ajuste supervisado con tamaño de lote 8, una tasa de aprendizaje codificada como `m15e` y un total de 2000 pasos de optimización. El sufijo `ot3math` probablemente hace referencia a un subconjunto de matemáticas (posiblemente derivado de OpenThoughts) y `step10` al décimo checkpoint de esa ejecución. Ninguno de estos extremos está verificado por el autor.

La innovación técnica, si existe, no está documentada. No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, atención lineal, decodificación especulativa ni ninguna otra optimización. El hecho de que el recuento real de parámetros (8,19B) no coincida con los ~30B implícitos en el nombre impide determinar qué configuración de expertos se está cargando realmente.

## Capacidades

- Generación de texto: capacidad heredada del modelo base Qwen3, no verificada para este ajuste.
- Razonamiento matemático: presumiblemente el foco del ajuste, dado el sufijo `ot3math`, pero sin evaluación publicada.
- Razonamiento paso a paso (chain-of-thought): no confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo «thinking», visión o audio: no disponible.
- Plantilla de chat: los repositorios hermanos del mismo autor incluyen `chat template`, lo que sugiere que este también podría incluirla, aunque no está confirmado para esta versión concreta.

## Casos de uso

Dado que no existe model card, los siguientes escenarios se derivan exclusivamente del nombre del repositorio y son hipotéticos; deben validarse antes de cualquier uso real:

- Resolución de problemas matemáticos: un ajuste sobre un corpus tipo `ot3math` estaría orientado a producir soluciones razonadas paso a paso para ejercicios de álgebra, cálculo o competición, aprovechando la herencia de Qwen3 como modelo de razonamiento.
- Tutoría educativa: generación de explicaciones graduadas de conceptos matemáticos para estudiantes, siempre que se valide la calidad de las respuestas con evaluación humana.
- Generación de datos sintéticos: uso del checkpoint para producir pares pregunta-respuesta de matemáticas que alimenten el entrenamiento de modelos menores o destilados.
- Verificación de derivaciones: revisión automática de pasos intermedios en demostraciones o resoluciones, aunque el riesgo de alucinación matemática exige un verificador simbólico externo.
- Investigación sobre ajuste fino de MoE: comparación de este checkpoint (`step10`) con sus hermanos (`step20`, distintas tasas de aprendizaje) para estudiar dinámicas de convergencia en modelos con mezcla de expertos.
- Reproducción de experimentos: dado que el autor publica múltiples variantes con nomenclatura sistemática, el repositorio puede servir para replicar configuraciones de SFT sobre Qwen3 MoE.
- Evaluación de recorte de modelos: la discrepancia entre nombre (~30B) y parámetros reales (8,19B) convierte al modelo en un objeto de estudio sobre poda o extracción parcial de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: ~16,4 GB solo para los pesos, más KV cache. Con contexto corto, un total en torno a 20-24 GB.
- VRAM estimada en cuantización de 8 bits: ~8,5 GB. En 4 bits: ~4,5 GB (requiere conversión a GGUF o formato equivalente, no incluida en el repositorio).
- GPU recomendadas en BF16: NVIDIA A100 40 GB, A100 80 GB, H100, L40S 48 GB. En una RTX 4090 (24 GB) cabe en BF16 con contexto limitado y batch pequeño.
- Consumer GPU: sí, es viable en RTX 3090/4090 (24 GB) en BF16 con contextos moderados, y en tarjetas de 12-16 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI y Transformers directamente con los safetensors; llama.cpp y Ollama requieren una conversión previa a GGUF que no está publicada.
- Latencia y throughput: no disponibles. Al desconocerse el número de parámetros activos, no puede estimarse la ventaja típica de un MoE frente a un modelo denso equivalente.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `seomh/...qwen3moe30b-ot3math-step10` | 8,19B (safetensors) | no disponible | no disponible | no disponible | HuggingFace, 7 descargas |
| Qwen3-30B-A3B (base presumible) | ~30B | ~3B | 32K nativo (ampliable) | Apache 2.0 (según anuncio de Alibaba) | HuggingFace y proveedores de inferencia |
| Qwen3-8B (alternativa densa de tamaño similar) | ~8B | no aplica | 32K nativo (ampliable) | Apache 2.0 (según anuncio de Alibaba) | HuggingFace y proveedores de inferencia |
| Qwen2.5-Math-7B-Instruct | ~7B | no aplica | no disponible | licencia Qwen | HuggingFace |

Los datos de las filas de Qwen3 proceden del anuncio público de Alibaba sobre la familia Qwen3 (seis modelos densos y dos MoE). Para el modelo objeto de esta ficha, la mayoría de las celdas son «no disponible» por ausencia de model card.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan dataset, hiperparámetros, evaluación ni intención de uso.
- Licencia no disponible: no puede asumirse uso comercial. Debe contactarse con el autor antes de cualquier despliegue productivo.
- Discrepancia entre nombre y tamaño: el identificador sugiere 30B y los safetensors contienen 8,19B; esto puede indicar un modelo podado, mal etiquetado o un checkpoint incompleto.
- Riesgo elevado de alucinación matemática: cualquier ajuste sobre datos de razonamiento sin verificación simbólica puede producir derivaciones plausibles pero incorrectas.
- Sesgos: no evaluados ni documentados.
- Limitaciones de idioma y contexto: no disponibles, aunque la familia Qwen3 tiene sesgo hacia inglés y chino.
- Confusión de versiones: el autor publica numerosas variantes con nomenclatura muy similar (`lr2e-5-s500`, `lr5e-5-s500`, `step10`, `step20`), lo que aumenta el riesgo de seleccionar el checkpoint equivocado.
- Madurez: con 7 descargas y 0 «likes», es un artefacto experimental sin validación por la comunidad.
- Sin proveedor de inferencia: no está desplegado en ningún servicio gestionado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/seomh/opd-sftb8dm15e-s2000-qwen3moe30b-ot3math-step10
- Repositorio hermano (step20): https://huggingface.co/seomh/opd-sftb8dm15e-lr2e-5-s500-qwen3moe30b-ot3math-step20
- Repositorio hermano (step10, otra tasa): https://huggingface.co/seomh/opd-sftk8dm15e-lr5e-5-s500-qwen3moe30b-ot3math-step10
- Anuncio de Alibaba sobre la familia Qwen3: https://home.alibabagroup.com/en-US/document-1853940226976645120
- Cronología de modelos Qwen: https://www.scriptbyai.com/qwen-timeline/
