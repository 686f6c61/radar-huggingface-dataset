# aashutoshkumarbhardwaj/astro-qwen2.5-7b-qlora

## Resumen

Astro-Qwen2.5-7B-QLoRA es un adaptador LoRA de ajuste fino (fine-tuning) sobre el modelo base Qwen/Qwen2.5-7B-Instruct, desarrollado por aashutoshkumarbhardwaj. Está especializado en razonamiento astronómico y de exoplanetas, entrenado con datos derivados del NASA Exoplanet Archive. El adaptador se publica bajo licencia Apache 2.0 y está diseñado para interpretar observaciones de exoplanetas, razonar sobre órbitas, propiedades planetarias y dinámica estelar.

El modelo se entrena mediante QLoRA con cuantización de 4 bits (NF4), lo que permite un ajuste eficiente con solo ~40,4 millones de parámetros entrenables (aproximadamente el 0,53 % del total). El adaptador se distribuye en formato safetensors y se integra con el ecosistema PEFT de Hugging Face. Al estar basado en Qwen2.5-7B-Instruct, hereda la ventana de contexto de 128K tokens y las capacidades generales de instrucción, aunque su especialización principal es el dominio astronómico.

La relevancia de este modelo radica en su enfoque de dominio específico: permite a los investigadores y desarrolladores adaptar un LLM general a tareas científicas concretas sin necesidad de reentrenar el modelo completo, reduciendo costes computacionales y manteniendo un rendimiento competitivo en tareas de astronomía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (Transformer decoder) |
| Parametros totales | Modelo base: 7B; adaptador: ~40,4M (entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredado del modelo base) |
| Tipos de cuantizacion | 4-bit NF4 (para entrenamiento QLoRA); el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica para el adaptador) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Transformer del modelo Qwen2.5-7B-Instruct, que emplea atención multi-cabeza estándar y capas de normalización. El ajuste fino se realiza mediante QLoRA (Quantized Low-Rank Adaptation), una técnica que congela los pesos del modelo base y entrena matrices de bajo rango en las proyecciones de atención y en las capas feed-forward. La configuración específica incluye r=16, lora_alpha=32 y lora_dropout=0.05, aplicada a los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. La cuantización del modelo base durante el entrenamiento es de 4 bits NF4 con doble cuantización y dtype de cómputo en float16.

El entrenamiento se realizó durante 2 épocas sobre un dataset generado a partir de observaciones estructuradas del NASA Exoplanet Archive. El dataset contiene 12.711 ejemplos de entrenamiento, 1.552 de validación y 1.582 de prueba, organizados en cuatro tareas principales: interpretación de observaciones, razonamiento orbital, razonamiento sobre propiedades planetarias y dinámica estelar. Cada ejemplo incluye metadatos estructurados como nombre del planeta, estrella anfitriona, método de descubrimiento, año de descubrimiento, período orbital, masa estelar, radio estelar y otras propiedades astronómicas disponibles.

## Capacidades

- Interpretación de observaciones de exoplanetas: el modelo puede analizar datos observacionales y extraer conclusiones sobre la naturaleza de los objetos celestes.
- Razonamiento orbital: es capaz de razonar sobre parámetros orbitales como período, semieje mayor, excentricidad y sus implicaciones.
- Razonamiento sobre propiedades planetarias: puede inferir y relacionar propiedades físicas de exoplanetas (masa, radio, densidad, temperatura) a partir de datos estructurados.
- Dinámica estelar: comprende conceptos de masa estelar, radio y su influencia en los sistemas planetarios.
- Generación de texto en dominio astronómico: produce explicaciones y descripciones coherentes sobre exoplanetas y sus estrellas anfitrionas.
- Herencia de capacidades generales del modelo base: al ser un adaptador sobre Qwen2.5-7B-Instruct, conserva las habilidades de instrucción, generación de código y razonamiento general del modelo original, aunque su especialización principal es el dominio astronómico.

## Casos de uso

- Análisis de catálogos de exoplanetas: el modelo puede procesar grandes volúmenes de datos del NASA Exoplanet Archive y generar resúmenes interpretativos de las propiedades de los planetas y sus estrellas.
- Asistente de investigación astronómica: investigadores pueden consultar al modelo sobre relaciones entre parámetros orbitales y propiedades planetarias, obteniendo explicaciones razonadas.
- Generación de informes automáticos: a partir de datos estructurados de observaciones, el modelo puede redactar informes técnicos sobre descubrimientos o candidatos a exoplanetas.
- Educación y divulgación: el adaptador puede utilizarse para crear materiales educativos que expliquen conceptos de exoplanetas y dinámica estelar de forma accesible.
- Validación cruzada de datos: el modelo puede ayudar a verificar la coherencia de nuevos datos observacionales comparándolos con patrones aprendidos del archivo de la NASA.
- Integración en pipelines de ciencia de datos: al ser un adaptador PEFT, puede integrarse en flujos de procesamiento de datos astronómicos para enriquecer automáticamente los registros con descripciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador específico. El autor no ha proporcionado comparaciones cuantitativas con otros modelos en tareas de astronomía.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,2 GB, pero requiere cargar el modelo base Qwen2.5-7B-Instruct completo.
- Para inferencia con el modelo base en 4 bits (NF4), se estima un consumo de VRAM de unos 4-5 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) o superiores.
- En 8 bits, el consumo sube a unos 7-8 GB, siendo viable en RTX 3080 (10 GB) o RTX 4070 (12 GB).
- En precisión completa (float16), se necesitan aproximadamente 14-16 GB de VRAM, recomendándose GPUs como RTX 4090 (24 GB) o A100 (40 GB).
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` de Hugging Face, o integrarse en frameworks como vLLM, llama.cpp u Ollama (si se convierte a GGUF). No se proporcionan instrucciones específicas de despliegue en la model card.
- La latencia y el throughput dependen del hardware y del framework utilizado; no se han publicado mediciones específicas para este adaptador.

## Comparativa con modelos similares

| Modelo | Base | Tamaño del adaptador | Especialización | Licencia | Contexto |
|---|---|---|---|---|---|
| Astro-Qwen2.5-7B-QLoRA (este) | Qwen2.5-7B-Instruct | ~40,4M | Astronomía y exoplanetas | Apache 2.0 | 128K |
| Rudraksh225/qwen2.5-7b-vedaz-astrologer-lora | unsloth/Qwen2.5-7B-Instruct-bnb-4bit | No especificado | Astrología védica (persona asistente) | No especificada | 128K (heredado) |
| Qwen2.5-7B-Instruct (modelo base) | - | - | General | Apache 2.0 | 128K |

La comparativa se limita a características estructurales, ya que no se dispone de benchmarks comunes. El adaptador de astrología es otro ejemplo de LoRA sobre Qwen2.5-7B, pero orientado a un dominio completamente distinto. El modelo base general ofrece capacidades amplias, mientras que este adaptador se centra en tareas astronómicas específicas.

## Limitaciones y advertencias

- Es un adaptador de dominio específico: su rendimiento fuera del ámbito astronómico puede degradarse significativamente, ya que el ajuste fino se realizó exclusivamente con datos de exoplanetas.
- No se han documentado sesgos específicos, pero al entrenarse con datos del NASA Exoplanet Archive, puede heredar sesgos de selección de ese catálogo (por ejemplo, preferencia por planetas detectados con ciertos métodos).
- Riesgo de alucinación en datos numéricos: al ser un modelo generativo, puede producir valores plausibles pero incorrectos si se le piden predicciones fuera de los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct también está bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- No se proporcionan instrucciones de uso ni ejemplos de inferencia en la model card, lo que puede dificultar su integración en producción.
- El adaptador se entrenó con solo 2 épocas, lo que podría implicar un ajuste insuficiente para tareas muy específicas o una sensibilidad a la variabilidad de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aashutoshkumarbhardwaj/astro-qwen2.5-7b-qlora
- Informe técnico de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Colección de modelos Qwen2.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen25
- Ejemplo de adaptador similar (astrología): https://huggingface.co/Rudraksh225/qwen2.5-7b-vedaz-astrologer-lora
