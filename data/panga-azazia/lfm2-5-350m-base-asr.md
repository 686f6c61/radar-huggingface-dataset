# Panga-Azazia/LFM2.5-350M-Base-ASR

## Resumen

LFM2.5-350M-Base-ASR es un ajuste fino (finetune) del modelo base LiquidAI/LFM2.5-350M-Base, publicado por el usuario Panga-Azazia en HuggingFace. Se trata de un modelo de generación de texto de pequeño tamaño (350 millones de parámetros según la nomenclatura del modelo base) que hereda la arquitectura de la familia LFM2 de LiquidAI y que, según la model card, fue entrenado con Unsloth y la librería TRL de HuggingFace, lo que permitió un entrenamiento aproximadamente dos veces más rápido.

El interés de esta ficha es limitado pero relevante como caso de estudio: la model card es mínima (no incluye datos de entrenamiento, composición del dataset, ni resultados de evaluación) y el nombre del repositorio incluye el sufijo "ASR", aunque el pipeline declarado en HuggingFace es text-generation y el único idioma declarado es el inglés. No hay documentación que aclare si el ajuste fino estaba orientado a tareas relacionadas con habla, transcripción o procesamiento de texto derivado de ASR.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el contexto máximo efectivo tras el ajuste ni métricas de rendimiento. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo: los enlaces encontrados tratan sobre el pez panga (Pangasianodon hypophthalmus) y no guardan relación con este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2 (LiquidAI); detalles concretos no disponibles en la informacion proporcionada |
| Parametros totales | 350M segun la nomenclatura del modelo base (no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; no se listan archivos GGUF) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (fine-tuning) del checkpoint LiquidAI/LFM2.5-350M-Base, que pertenece a la familia LFM2 de LiquidAI. La model card no detalla la arquitectura interna, el número de capas, la dimensión oculta ni la configuración de atención, por lo que no es posible confirmar aquí si se trata de un transformer denso convencional o de una arquitectura híbrida con capas convolucionales. El tag `lfm2` confirma únicamente la familia de origen.

En cuanto al entrenamiento, la única información disponible es que se realizó con Unsloth y TRL, lo que según el autor resultó en un entrenamiento "2x más rápido". No se especifica el número de tokens, la composición del dataset, si hubo fases de RLHF, DPO u otra alineación, ni la duración o el hardware empleado. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación, etc.).

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base LFM2.5-350M-Base.
- Idioma: únicamente inglés declarado en los metadatos del repositorio.
- Compatibilidad con `text-generation-inference` y `transformers`, según los tags del repositorio.
- Tag `endpoints_compatible`, lo que indica que el repositorio puede desplegarse en los endpoints gestionados de HuggingFace.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. A pesar del sufijo "ASR" en el nombre, no hay documentación que confirme capacidades de reconocimiento automático de habla.

## Casos de uso

- Prototipado rápido de aplicaciones de generación de texto en inglés: por su tamaño (350M) el modelo se puede cargar en cualquier portátil y permite validar pipelines de inferencia sin coste de GPU dedicada.
- Fine-tuning posterior sobre dominios específicos: al ser un checkpoint ya ajustado y con licencia Apache 2.0, sirve como punto de partida para nuevos ajustes con Unsloth o TRL en inglés.
- Clasificación y etiquetado de texto ligero: tareas de extracción de entidades, categorización o generación de resúmenes cortos donde la latencia importa más que la calidad máxima.
- Despliegue en el edge: inferencia en CPU, Raspberry Pi o dispositivos con menos de 1 GB de memoria disponible para los pesos en cuantización de 4 bits.
- Generación de texto en tiempo real para interfaces interactivas: al tener un coste computacional bajo, permite tasas de tokens por segundo altas en hardware modesto, adecuado para autocompletado o chatbots simples.
- Evaluación de técnicas de ajuste eficiente: el repositorio documenta el uso de Unsloth + TRL, por lo que es útil como referencia reproducible de un pipeline de fine-tuning rápido.
- Experimentación académica sobre modelos pequeños: permite estudiar comportamientos de modelos de 350M en tareas de NLP sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Cualquier otra métrica | no disponible |

## Requisitos de hardware

- VRAM estimada (calculada a partir de 350M parámetros, no publicada por el autor):
  - FP16/BF16: aproximadamente 0,7 GB de pesos; con caché KV y overhead, en torno a 1,5-2 GB de VRAM.
  - INT8: aproximadamente 0,35 GB de pesos.
  - 4 bits (Q4_K_M o similar): aproximadamente 0,2-0,25 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 3060, RTX 4090). GPU de datacenter (A100, H100) no son necesarias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- También es viable la inferencia en CPU, en dispositivos tipo Raspberry Pi 5 o en móviles de gama alta.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), y los endpoints compatibles de HuggingFace según el tag `endpoints_compatible`. El soporte en vLLM, llama.cpp u Ollama no está confirmado en la información disponible, ya que no se publican archivos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Panga-Azazia/LFM2.5-350M-Base-ASR | 350M | no disponible | Apache 2.0 | HuggingFace | no disponible |
| LiquidAI/LFM2.5-350M-Base | 350M | no disponible | Apache 2.0 | HuggingFace | no disponible |
| HuggingFaceTB/SmolLM2-360M | 360M | no disponible en esta ficha | Apache 2.0 | HuggingFace | no disponible |
| Qwen/Qwen2.5-0.5B | 494M | 32 768 tokens (dato público, no verificado en esta ficha) | Apache 2.0 | HuggingFace | no disponible |

No se dispone de datos de benchmarks del modelo evaluado, por lo que no es posible establecer una comparación cuantitativa de rendimiento con las alternativas. Los datos de los modelos comparables se incluyen a título orientativo y deberían verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: es imposible conocer la calidad real del ajuste fino frente al modelo base.
- La model card es mínima: no documenta dataset, hiperparámetros, número de tokens ni metodología de evaluación.
- El sufijo "ASR" del nombre no está respaldado por ninguna documentación y contradice el pipeline declarado (`text-generation`); se desconoce si el ajuste estaba orientado a texto derivado de transcripciones o si es un nombre heredado del proyecto original.
- Idiomas: solo se declara inglés. No hay evidencia de soporte para castellano ni para otros idiomas.
- Riesgo de alucinación: inherente a los modelos de 350M, que tienen menor capacidad de mantener coherencia factual en generaciones largas.
- Sesgos conocidos: no documentados por el autor. Un modelo de este tamaño entrenado sobre corpus no especificados puede reproducir sesgos presentes en los datos del modelo base.
- Limitaciones de contexto: se desconoce la ventana máxima efectiva tras el ajuste.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento no están documentados, por lo que conviene revisar la licencia del modelo base LiquidAI/LFM2.5-350M-Base antes de un despliegue en producción.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta (creado y actualizado el 5 de octubre de 2026), lo que implica ausencia de validación por parte de la comunidad.
- No hay artefactos de cuantización publicados, lo que puede dificultar el despliegue en entornos que requieran GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Panga-Azazia/LFM2.5-350M-Base-ASR
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M-Base
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: https://github.com/huggingface/trl
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos hacen referencia al pez panga y no guardan relación con el repositorio.
