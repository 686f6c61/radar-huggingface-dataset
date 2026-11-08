# fabricioslv/erika-qwen3-4b-mobile-adapter

## Resumen

erika-qwen3-4b-mobile-adapter es un adaptador de ajuste fino (fine-tuning) publicado por el usuario fabricioslv en Hugging Face, construido sobre el modelo base unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit. Se trata, por tanto, de una especializacion de Qwen3-4B-Instruct-2507, la variante de 4 mil millones de parametros de la familia Qwen3 de Alibaba, en su version de julio de 2025 y cuantizada a 4 bits por Unsloth para facilitar el entrenamiento con recursos limitados. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que contiene unicamente los pesos del adaptador y no el modelo completo.

El modelo se ha entrenado con Unsloth, una libreria de optimizacion que acelera el ajuste fino (el autor afirma un entrenamiento 2x mas rapido) y reduce el consumo de memoria mediante kernels personalizados y tecnicas de ahorro de VRAM. La model card es minima: no documenta el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni los objetivos concretos del ajuste. La unica informacion declarada es el modelo base, la licencia Apache 2.0 y el idioma ingles.

Su relevancia es limitada y experimental: no registra descargas ni interacciones, no incluye evaluacion alguna y el nombre sugiere un uso orientado a entornos moviles, aunque no se aporta ninguna evidencia tecnica que lo respalde. Debe tratarse como un artefacto de investigacion personal, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); el adaptador es un modulo de ajuste fino sobre esa base |
| Parametros totales | 4 mil millones en el modelo base; el adaptador anade un numero no especificado de parametros adicionales |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero el autor no lo declara) |
| Tipos de cuantizacion | El modelo base de partida esta cuantizado a 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4 mil millones de parametros. Sobre esa base, fabricioslv ha aplicado un ajuste fino supervisado (SFT) o posiblemente un ajuste con preferencias, aunque la model card no especifica la tecnica exacta; las etiquetas del repositorio incluyen trl, lo que apunta al uso de la libreria TRL de Hugging Face para el entrenamiento. El modelo base de partida es la version de Unsloth cuantizada a 4 bits, lo que indica que el entrenamiento se realizo con cuantizacion QLoRA o similar para reducir requisitos de memoria.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF o DPO, ni ninguna innovacion tecnica especifica del adaptador. La unica innovacion documentada pertenece a la herramienta, no al modelo: Unsloth afirma acelerar el entrenamiento 2x mediante kernels optimizados y gestion eficiente de la memoria. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa.

## Capacidades

- Generacion de texto en ingles, heredada de las capacidades del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento basico y respuesta a instrucciones, segun la naturaleza Instruct del modelo base.
- Generacion de codigo y resolucion de problemas matematicos sencillos, capacidades propias de la familia Qwen3.
- Posible soporte de tool calling y function calling, aunque no esta verificado en el adaptador.
- Capacidades multilingues limitadas al ingles segun la declaracion del autor; el modelo base soporta mas idiomas, pero el ajuste puede haber degradado ese comportamiento.
- No se documenta modo thinking, vision, audio ni ninguna capacidad especial adicional.
- No hay evidencia de que el adaptador preserve todas las capacidades del modelo base; el ajuste fino puede haber provocado olvido catastrofico en tareas no representadas en el dataset.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el adaptador puede desplegarse con transformers y servir como base para experimentar con respuestas especializadas, siempre que se valide su calidad frente al modelo original.
- Investigacion sobre ajuste fino eficiente: sirve como ejemplo practico de un pipeline Unsloth + TRL sobre Qwen3-4B cuantizado a 4 bits, util para estudiar tecnicas de QLoRA y sus efectos.
- Pruebas de despliegue en entornos con recursos limitados: al derivar de un modelo de 4B, puede ejecutarse en GPUs de consumo medio si se cuantiza de nuevo a GGUF o se sirve con vLLM en precision reducida.
- Evaluacion comparativa de adaptadores: util para medir el impacto de un ajuste fino concreto frente al modelo base en tareas de instruccion y generacion de texto.
- Generacion de texto asistida en ingles para tareas de baja criticidad, como borradores o resumenes, con revision humana obligatoria.
- Base para un segundo ajuste fino: el adaptador puede servir como punto de partida para experimentos posteriores, aunque la falta de documentacion dificulta reproducir el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de evaluacion, comparaciones con el modelo base ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en FP16 requiere aproximadamente 8-9 GB; en cuantizacion de 4 bits, alrededor de 3-4 GB. El adaptador anade una sobrecarga minima, pero debe cargarse junto al modelo base.
- GPU recomendadas: para FP16, una RTX 3090, RTX 4090, A10G o A100; para 4 bits, una RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en cuantizacion de 4 bits (RTX 3060, RTX 4060 Ti, RTX 4070 y superiores).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repositorio), vLLM y llama.cpp/Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| erika-qwen3-4b-mobile-adapter | 4B (base) + adaptador | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3-4B-Instruct-2507 (base) | 4B | No disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Otros adaptadores sobre Qwen3-4B | 4B (base) + adaptador | Variable | Variable | Hugging Face, comunidad |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa con alternativas. La comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset, el proceso de entrenamiento y la evaluacion; imposible reproducir o auditar el ajuste.
- Riesgo elevado de olvido catastrofico: el ajuste puede haber degradado capacidades del modelo base no representadas en los datos de entrenamiento.
- Riesgo de alucinacion inherente a los modelos de 4B, agravado por la falta de evaluacion.
- Idiomas limitados al ingles declarado; el uso en castellano no esta garantizado ni documentado.
- Sesgos desconocidos: al no documentarse el dataset, no pueden identificarse sesgos especificos.
- Licencia Apache 2.0 permisiva para uso comercial, pero el autor no ofrece garantias sobre el comportamiento del adaptador en produccion.
- Cero descargas y cero interacciones: no hay evidencia de uso real ni validacion por parte de la comunidad.
- El nombre sugiere un uso movil que no esta respaldado por ninguna optimizacion documentada (no hay pesos GGUF ni cuantizaciones publicadas en el repositorio).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fabricioslv/erika-qwen3-4b-mobile-adapter
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Tutorial de ajuste fino de Qwen3-4B en Azure Databricks: https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
- Adaptadores sobre Qwen3-4B en Hugging Face: https://huggingface.co/models?other=base_model%3Aadapter%3AQwen%2FQwen3-4B
