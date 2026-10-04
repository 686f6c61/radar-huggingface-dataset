# DunkRonit/anlp-a2-part1-moe_top2_active

## Resumen

`DunkRonit/anlp-a2-part1-moe_top2_active` es un transformer decoder-only entrenado desde cero para traducción automática de vietnamita y japonés a inglés. Lo publica el usuario DunkRonit como parte de la asignatura ANLP (Advanced Natural Language Processing), con el identificador `anlp-a2-part1`, y su variante de FFN es `moe_top2_active`, es decir, una capa de mezcla de expertos que activa los dos expertos con mayor puntuación por token.

El modelo tiene 24.098.688 parámetros totales, de los cuales 17.020.800 (aproximadamente el 70,6 %) están activos por token. Se entrenó sobre 39.003.133 tokens del corpus paralelo `belumind/en-vi-ja-curated-500k-triplets`. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato safetensors.

Su relevancia es fundamentalmente académica y comparativa: sirve como banco de pruebas reproducible para estudiar el compromiso entre parámetros totales y parámetros activos en arquitecturas MoE de escala reducida, aplicadas a una tarea de traducción bidireccional de origen (vi→en y ja→en). No es un modelo de propósito general ni compite con sistemas de traducción comerciales; su interés está en el diseño experimental y en la posibilidad de ejecutarlo íntegramente en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de mezcla de expertos (MoE, top-2 activos por token) |
| Parámetros totales | 24.098.688 |
| Parámetros activos | 17.020.800 por token (≈70,6 % del total) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni cuantizaciones oficiales) |
| Idiomas soportados | vietnamita (vi), japonés (ja), inglés (en); la traducción se realiza únicamente hacia inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only entrenado desde cero, sin inicialización a partir de un modelo preentrenado. La innovación estructural está en la capa feed-forward: en lugar de una FFN densa, se emplea una mezcla de expertos con enrutamiento top-2, de forma que cada token se procesa únicamente con los dos expertos mejor puntuados. Eso explica la diferencia entre los 24,1 millones de parámetros almacenados y los 17,0 millones efectivamente activados por token, un ratio de activación del 70,6 % que indica un reparto relativamente denso de los parámetros entre los expertos seleccionados.

El entrenamiento consumió 39.003.133 tokens del conjunto `belumind/en-vi-ja-curated-500k-triplets`, un corpus de tripletas paralelas en vietnamita, japonés e inglés. El autor registra la ejecución en Weights & Biases bajo el identificador `moe_top2_active-db95d986`. No se documenta en la model card el uso de RLHF, DPO, ajuste por instrucciones ni ninguna otra fase de alineación posterior al preentrenamiento supervisado. El formato de entrada es una plantilla explícita de idioma: `<vi> source <en>` o `<ja> source <en>`, y el modelo continúa generando la traducción en inglés hasta el token `<eos>`.

## Capacidades

- Traducción de vietnamita a inglés mediante el prefijo `<vi> ... <en>`.
- Traducción de japonés a inglés mediante el prefijo `<ja> ... <en>`.
- Generación autoregresiva token a token hasta emitir `<eos>`.
- Condicionamiento por etiqueta de idioma origen explícita en la propia secuencia de entrada.
- Ejecución en CPU o GPU de gama baja por su reducido tamaño (24,1 M de parámetros).
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado para agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento extendido (thinking mode).
- No tiene capacidades de visión, audio ni multimodalidad.
- No se documenta capacidad de traducción inversa (inglés a vietnamita o a japonés).

## Casos de uso

- Traducción por lotes de documentación técnica japonesa a inglés: el modelo acepta ficheros completos segmentados por frases y genera la versión inglesa sin coste de API externa, ya que los 24,1 M de parámetros permiten procesar grandes volúmenes en una sola máquina.
- Preprocesado de corpus de investigación: dado que el corpus de entrenamiento son tripletas vi-ja-en, el modelo puede usarse para generar traducciones inglesas de referencia y comparar métricas entre arquitecturas MoE y densas del mismo presupuesto de parámetros.
- Traducción de tickets de soporte en vietnamita y japonés hacia inglés: útil en mesas de ayuda donde el personal domina el inglés y necesita entender la incidencia original antes de responder.
- Normalización de texto multilingüe para pipelines de búsqueda o análisis de sentimiento: se traduce la entrada a inglés para aplicar después herramientas de NLP que solo existen o rinden mejor en ese idioma.
- Subtitulado y localización de contenidos asiáticos: al ser un modelo pequeño, se puede integrar en un flujo local de generación de subtítulos en inglés a partir de transcripciones en vi o ja.
- Docencia y prácticas de NLP: sirve como ejemplo ejecutable de enrutamiento top-2 en MoE, de plantillas de prompt con etiquetas de idioma y de entrenamiento desde cero sobre corpus paralelos.
- Despliegue en entornos sin GPU o con conectividad limitada: cabe en memoria de un portátil y no requiere servicios en la nube.
- Ablación experimental en investigación sobre MoE: permite medir el efecto de variar el número de expertos activos manteniendo fijo el presupuesto de tokens de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente informa del número de parámetros totales, los parámetros activos por token y el volumen de tokens de entrenamiento (39.003.133), y remite a una ejecución de Weights & Biases sin métricas de calidad de traducción (BLEU, chrF, COMET o similares) publicadas en la ficha.

## Requisitos de hardware

- Tamaño de pesos en precisión de 32 bits: aproximadamente 96 MB.
- Tamaño de pesos en 16 bits: aproximadamente 48 MB.
- Tamaño de pesos en 8 bits: aproximadamente 24 MB.
- Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1050 Ti o una RTX 3050, e incluso en memoria de CPU de un único hilo de trabajo.
- GPU recomendadas: ninguna específica; el modelo está limitado por el código de carga y el throughput de la implementación, no por la VRAM. Una RTX 4090 o una A100 estarían infrautilizadas.
- Opciones de despliegue: el autor especifica cargar el modelo con `src.part1.model.Transformer.from_pretrained("DunkRonit/anlp-a2-part1-moe_top2_active")` desde el repositorio de la asignatura, lo que implica una implementación propia en PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia estándar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| DunkRonit/anlp-a2-part1-moe_top2_active | 24,1 M totales / 17,0 M activos | vi, ja → en | no disponible | safetensors, requiere código propio |
| Helsinki-NLP/opus-mt-vi-en | no disponible en la información proporcionada | vi → en | no disponible en la información proporcionada | transformers |
| Helsinki-NLP/opus-mt-ja-en | no disponible en la información proporcionada | ja → en | no disponible en la información proporcionada | transformers |
| facebook/nllb-200-distilled-600M | 600 M (según la denominación del modelo) | multilingüe (200 idiomas) | no disponible en la información proporcionada | transformers |

Los tres modelos alternativos se citan como referencias de la misma categoría funcional (traducción hacia inglés y traducción multilingüe), pero sus datos concretos de parámetros, licencia y rendimiento no se han verificado en la búsqueda disponible y deben consultarse en sus fichas oficiales.

## Limitaciones y advertencias

- Modelo de asignatura: no se declara licencia, por lo que el uso comercial queda en un limbo legal y no puede asumirse permiso de explotación.
- Entrenado con solo 39.003.133 tokens, un volumen muy reducido que limita la cobertura léxica y el manejo de dominios especializados.
- Traducción unidireccional: solo vi→en y ja→en; no se ha entrenado para traducir desde o hacia otros pares.
- Riesgo elevado de alucinación y de deriva semántica en frases largas, términos técnicos poco frecuentes y nombres propios.
- Longitud de contexto no documentada: se desconoce el límite máximo de tokens de entrada.
- Ausencia total de benchmarks publicados, por lo que no hay evidencia cuantitativa de calidad de traducción.
- Sin fases documentadas de RLHF, DPO o ajuste de seguridad: puede reproducir sesgos presentes en el corpus de entrenamiento y no tiene filtros de contenido.
- Requiere una implementación personalizada (`src.part1.model.Transformer`) del repositorio de la asignatura, lo que añade dependencia de código no empaquetado como biblioteca estándar.
- Sin variantes cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que descarta su uso directo con llama.cpp u Ollama.
- Cero descargas y cero likes en HuggingFace en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- La fecha de creación registrada en el repositorio (2026-10-04) resulta anómala y conviene verificarla antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DunkRonit/anlp-a2-part1-moe_top2_active
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/dunkronit-iiit-hyderabad/anlp-a2-part1/runs/moe_top2_active-db95d986
- Corpus de entrenamiento citado: `belumind/en-vi-ja-curated-500k-triplets`
- No se han encontrado enlaces adicionales relevantes (papers, repositorios de código o demos) en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo.
