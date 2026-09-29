# SlavaTikh/gemma-sft-v13-final

## Resumen

SlavaTikh/gemma-sft-v13-final es un adaptador LoRA (librería PEFT) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base google/gemma-4-26B-A4B-it, la variante instruct de la familia Gemma 4 de Google DeepMind. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de aproximadamente 0,1 GB que debe cargarse junto al modelo base para poder ejecutarse. El entrenamiento se realizó con TRL 1.14.1 sobre PEFT 0.21.1, Transformers 5.17.0, PyTorch 2.11.0+cu128 y Datasets 5.0.1.

El autor es un usuario individual (SlavaTikh), sin organización asociada, y el repositorio no incluye model card descriptiva más allá de la plantilla autogenerada por TRL. El identificador del modelo base sugiere una arquitectura de mezcla de expertos (MoE) con 26.000 millones de parámetros totales y 4.000 millones activos por token, aunque estos datos no se confirman en la documentación del adaptador.

La relevancia actual del artefacto es limitada: registra 0 descargas y 0 likes, no declara idiomas soportados y la licencia aparece como un marcador de posición sin contenido ("license"), lo que impide confirmar las condiciones de uso comercial. Es, por tanto, un experimento de ajuste reproducible pero sin validación externa ni documentación de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer (modelo base MoE, segun el identificador del base) |
| Parametros totales | No disponible en el adaptador; el modelo base sugiere 26B (inferido del identificador "26B-A4B") |
| Parametros activos | No disponible en el adaptador; el modelo base sugiere 4B (inferido del identificador "A4B") |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos de adaptador en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card contiene el marcador "licence: license" sin texto legal) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | google/gemma-4-26B-A4B-it |
| Libreria | peft |
| Pipeline | text-generation |
| Framework de entrenamiento | TRL 1.14.1, PEFT 0.21.1, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1, Tokenizers 0.23.2 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que modifica los pesos de google/gemma-4-26B-A4B-it sin reentrenar el modelo completo. El método de ajuste declarado es SFT (supervised fine-tuning), es decir, aprendizaje supervisado sobre pares de entrada y salida, sin que la model card indique que se haya aplicado posteriormente RLHF, DPO u otra fase de alineamiento adicional. La única referencia técnica reproducible es la pila de software: TRL para el bucle de entrenamiento, PEFT para la inyección de los adaptadores y Transformers 5.17.0 como runtime.

No se especifica el número de tokens de entrenamiento, la composición del dataset, el rango (rank) ni el alpha del adaptador, los módulos objetivo, la tasa de aprendizaje, el número de épocas ni la estrategia de enmascarado de la pérdida. Tampoco se documenta si el ajuste cubrió solo el decodificador de texto o también componentes multimodales del modelo base, ni si se emplearon técnicas como packing de secuencias o gradient checkpointing. El nombre "v13-final" apunta a un proceso iterativo con al menos trece versiones previas, pero esas versiones no están enlazadas ni descritas.

## Capacidades

- Generación de texto conversacional: la etiqueta de pipeline es text-generation y la model card incluye etiquetas "conversational" y "text-generation", con un ejemplo de uso mediante `transformers.pipeline` sobre un turno de usuario.
- Seguimiento de instrucciones: es la finalidad declarada del SFT sobre un modelo base de tipo instruct.
- Capacidades heredadas del modelo base: no documentadas en este repositorio. Cualquier capacidad concreta (código, matemáticas, razonamiento multi-paso, visión, audio) no puede confirmarse a partir de la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Modo de razonamiento explícito ("thinking"): no disponible.

## Casos de uso

Los siguientes escenarios son propuestas condicionadas a que el adaptador reproduzca las capacidades del modelo base y a que la licencia final permita el uso previsto; no están respaldados por evaluaciones publicadas.

- Prototipado de asistentes conversacionales de dominio específico: al ser un adaptador LoRA de 0,1 GB, puede cargarse sobre el modelo base con `PeftModel` para probar rápidamente un tono o formato de respuesta ajustado sin redistribuir los pesos completos.
- Evaluación de pipelines de ajuste con TRL: sirve como caso de referencia para reproducir un flujo SFT completo (Datasets 5.0.1, TRL 1.14.1, PEFT 0.21.1) en un entorno con PyTorch 2.11.0+cu128.
- Ajuste incremental sobre un modelo MoE grande con recursos limitados: el formato de adaptador permite iterar sobre el comportamiento del modelo sin almacenar copias de 26B parámetros en cada experimento.
- Sustitución de adaptadores en caliente: al ser un artefacto PEFT independiente, puede intercambiarse con otros adaptadores sobre el mismo base para comparar estilos de respuesta en una misma infraestructura de servicio (por ejemplo, vLLM con soporte LoRA).
- Generación de texto asistida en investigación: útil para estudiar cómo un SFT breve altera la distribución de salidas de un modelo MoE instruct, comparando contra el base sin ajustar.
- Documentación y análisis de reproducibilidad: sirve como ejemplo de model card autogenerada a la que le faltan los campos críticos (datos, hiperparámetros, licencia), útil para ilustrar buenas y malas prácticas de publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritméticas a partir del tamaño del modelo base (26B parámetros, 4B activos según el identificador) y no proceden de mediciones publicadas para este adaptador.

- Peso del adaptador: 0,1 GB adicionales sobre el modelo base, en cualquier configuración.
- VRAM para el modelo base en fp16/bf16: en torno a 52 GB solo para pesos, más caché KV y activaciones.
- VRAM en cuantización de 8 bits: aproximadamente 26 GB de pesos.
- VRAM en cuantización de 4 bits: aproximadamente 13-15 GB de pesos, más overhead de runtime y caché KV.
- GPU de centro de datos: A100 80 GB, H100 80 GB o H200 para fp16/bf16 sin cuantizar.
- GPU de gama profesional: A6000 48 GB o L40S 48 GB con cuantización de 8 bits.
- GPU de consumo: una RTX 4090 de 24 GB podría ejecutar el modelo solo con cuantización de 4 bits y contexto corto; una RTX 3090 de 24 GB queda en el mismo límite. No cabe en GPU de 8-16 GB en ninguna configuración razonable.
- Coste computacional por token: al tratarse de un MoE con 4B parámetros activos, el cómputo de inferencia se aproxima al de un modelo denso de 4B, mientras que la memoria requerida sigue siendo la de 26B. Esto desacopla memoria y latencia.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores PEFT; también es posible fusionar el adaptador con el base (`merge_and_unload`) y servir el modelo resultante. llama.cpp y Ollama dependen de la disponibilidad de una versión GGUF del modelo base y de soporte para Gemma 4, que no se documenta aquí.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SlavaTikh/gemma-sft-v13-final | Adaptador LoRA (base 26B/A4B) | No disponible | No disponible | 0 descargas, 0 likes | Requiere el modelo base; sin benchmarks |
| google/gemma-4-26B-A4B-it | 26B totales / 4B activos (segun identificador) | No disponible | No disponible en la informacion proporcionada | Modelo base oficial de Google DeepMind | Punto de partida del adaptador; capacidades completas no documentadas aquí |
| Otros adaptadores LoRA sobre Gemma 4 | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información proporcionada |

No se dispone de datos suficientes para comparar rendimiento (MMLU, HumanEval, GSM8K u otros) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia indeterminada: la model card incluye el marcador "licence: license" sin texto legal, por lo que no puede confirmarse si el uso comercial está permitido. Antes de cualquier despliegue en producción debe aclararse este punto, y en última instancia prevalecerá la licencia del modelo base google/gemma-4-26B-A4B-it.
- Sesgos desconocidos: no se documenta la composición del dataset de SFT, de modo que no es posible evaluar sesgos de género, etnia, idioma o dominio introducidos por el ajuste.
- Riesgo de alucinación: como cualquier modelo generativo ajustado por SFT sin una fase explícita de alineamiento o verificación factual, puede producir contenido plausible pero incorrecto, especialmente en dominios especializados.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta implican que no existe evidencia externa de calidad, estabilidad ni reproducibilidad.
- Dependencia del modelo base: no es un modelo autónomo. Necesita descargar y ejecutar google/gemma-4-26B-A4B-it, con el coste de almacenamiento y VRAM asociado, además de aceptar las condiciones de acceso del repositorio base.
- Idiomas no especificados: el campo de idiomas está vacío, por lo que se desconoce el comportamiento fuera del inglés o de los idiomas cubiertos por el modelo base.
- Contexto no especificado: se desconoce la ventana de contexto efectiva tras el ajuste; no debe asumirse la del modelo base sin verificarla.
- Ausencia de hiperparámetros: sin rank, alpha, módulos objetivo ni número de pasos, es imposible reproducir el entrenamiento o auditar su alcance.
- Nomenclatura de versiones opaca: el sufijo "v13-final" sugiere iteraciones previas no publicadas ni enlazadas, lo que dificulta el seguimiento de cambios.
- Fechas del repositorio: la creación y la última actualización se registran como 2026-09-29, posteriores en varios meses entre sí (15:41 y 15:51), lo que indica una subida en un único intervalo de diez minutos.
- Idoneidad para producción: no recomendable sin una evaluación propia, sin licencia aclarada y sin benchmarks que respalden la mejora frente al modelo base sin ajustar.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/SlavaTikh/gemma-sft-v13-final
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio de TRL: https://github.com/huggingface/trl
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
- Repositorio de la librería gemma de Google DeepMind: https://github.com/google-deepmind/gemma
- Artículo de Wikipedia sobre Gemma: https://en.wikipedia.org/wiki/Gemma_(language_model)
- Guía de SFT multimodal con TRL: https://huggingface.co/docs/trl/main/en/training_vlm_sft
- Cuaderno de fine-tuning de Gemma con SFT de NVIDIA: https://github.com/NVIDIA/GenerativeAIExamples/blob/main/finetuning/Gemma/sft.ipynb
