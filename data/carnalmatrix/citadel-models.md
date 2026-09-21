# carnalMATRIX/citadel-models

## Resumen

citadel-models es un modelo de lenguaje publicado en Hugging Face por el usuario carnalMATRIX bajo el identificador `carnalMATRIX/citadel-models`. Se distribuye exclusivamente en formato GGUF, con etiquetas que lo describen como conversacional (`conversational`), compatible con endpoints y optimizado mediante imatrix (cuantización guiada por matriz de importancia). El repositorio ocupa 11,6 GB y la ficha de Hugging Face no incluye pipeline declarado, licencia, idiomas soportados ni documentación técnica asociada.

El dato objetivo más relevante es el recuento de parámetros: 11.907.350.576 (aproximadamente 11,9 mil millones). Se trata, por tanto, de un modelo de escala media, situado en la franja de 8 a 14 mil millones de parámetros, que es la que hoy resulta desplegable en GPU de consumo con cuantizaciones de 4 a 6 bits. No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados ni los resultados de evaluación.

Su relevancia actual es limitada y fundamentalmente práctica: al ser un GGUF con cuantización imatrix, puede ejecutarse en `llama.cpp`, Ollama o servidores compatibles con la API de OpenAI sin necesidad de infraestructura dedicada. No obstante, la ausencia total de licencia explícita, de documentación y de benchmarks hace que su adopción en entornos de producción requiera una evaluación propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 11.907.350.576 (aprox. 11,9 B) |
| Parametros activos | no aplica / no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion guiada por imatrix (niveles concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de 11,6 GB; etiqueta `endpoints_compatible`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la ficha de Hugging Face ni en los resultados de búsqueda disponibles. El recuento de parámetros (11,9 B) y el formato de distribución (GGUF con imatrix) son los únicos datos verificables. La etiqueta `imatrix` indica que las cuantizaciones se generaron utilizando una matriz de importancia calculada a partir de un corpus de calibración, una técnica habitual en `llama.cpp` para reducir la pérdida de calidad en cuantizaciones de 4 y 5 bits.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o mecanismos de atención alternativa. La etiqueta `conversational` sugiere que el modelo fue ajustado para diálogo multi-turno, pero no hay confirmación documental al respecto.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que el modelo está orientado a diálogo multi-turno, si bien no se especifica el formato de prompt esperado.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse a través de APIs compatibles con el esquema de Inference Endpoints.
- Ejecución local mediante GGUF: el formato de pesos permite su uso en `llama.cpp`, Ollama y otros motores que consumen GGUF, incluidas variantes cuantizadas de bajo consumo de memoria.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio): no disponible (no documentado).

## Casos de uso

- Asistente conversacional local: dado su tamaño (~11,9 B) y su distribución en GGUF, el modelo puede ejecutarse en una estación de trabajo con una GPU de consumo de 12 a 16 GB de VRAM para ofrecer chat privado sin enviar datos a servicios externos. La idoneidad depende de la calidad real del ajuste conversacional, que no está documentada.
- Despliegue en servidores de inferencia compatibles con la API de OpenAI: la etiqueta `endpoints_compatible` apunta a una integración directa en stacks que ya hablan ese protocolo, lo que simplifica sustituir un backend de inferencia por otro sin reescribir la capa de aplicación.
- Prototipado rápido con Ollama o `llama.cpp`: al ser un GGUF, puede cargarse en cuestión de minutos para validar una idea de producto antes de comprometerse con un modelo mayor o con una licencia más restrictiva.
- Procesamiento por lotes de texto en local: generación de resúmenes, reescritura o extracción de información sobre documentos internos en un entorno aislado, sin coste de API por token.
- Evaluación comparativa interna (bake-off): puede incorporarse como candidato adicional en una batería de pruebas propia frente a modelos de 8-14 B con licencia conocida, para decidir cuál se adopta en producción.
- Filtrado y clasificación de contenido en pipelines de datos: con el prompt adecuado, un modelo conversacional de este tamaño puede usarse para etiquetar o descartar registros antes de entrenar otros sistemas, siempre que se validen sus salidas.

La idoneidad concreta en cada caso no puede confirmarse con la información disponible: no hay benchmarks ni documentación de capacidades publicados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación en la ficha de Hugging Face ni en los resultados de búsqueda consultados.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación basada en los 11,9 B de parámetros, no en datos publicados por el autor):
  - Cuantización de 4 bits (~Q4_K_M): aproximadamente 7-8 GB de VRAM para los pesos, más 1-3 GB de caché KV según contexto.
  - Cuantización de 5 bits (~Q5_K_M): aproximadamente 8-9 GB.
  - Cuantización de 6 bits (~Q6_K): aproximadamente 10-11 GB.
  - Cuantización de 8 bits (~Q8_0): aproximadamente 12-13 GB.
  - Precisión completa FP16/BF16: aproximadamente 24 GB.
- GPU recomendadas: no disponibles en la documentación del modelo. Por tamaño, resultan adecuadas una RTX 3090 o RTX 4090 (24 GB) para cualquier cuantización, una RTX 4080 o 4070 Ti Super (16 GB) para cuantizaciones de 4 a 8 bits, y GPU profesionales tipo A100, H100 o L40S si se requiere servir varias instancias concurrentes.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más de VRAM si se emplean cuantizaciones de 4 bits; con 16 GB se cubren con holgura las cuantizaciones de 4 a 8 bits.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio, `llama-cpp-python`, servidores compatibles con la API de OpenAI sobre GGUF (por ejemplo `llama.cpp` en modo servidor u Ollama), y backends con soporte GGUF como text-generation-inference en configuraciones específicas. vLLM requeriría convertir los pesos a safetensors, algo que no está documentado.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque se desconocen el contexto, la licencia, los idiomas y el rendimiento de `citadel-models`. A modo de referencia de categoría (franja de 7-15 B de parámetros), se incluyen modelos ampliamente documentados con datos públicos:

| Modelo | Parametros | Contexto | Licencia | Formato principal |
|---|---|---|---|---|
| carnalMATRIX/citadel-models | 11,9 B | no disponible | no disponible | GGUF |
| Llama 3.1 8B Instruct | 8,03 B | 128 000 tokens | Llama 3.1 Community License | safetensors, GGUF |
| Qwen2.5 14B Instruct | 14,7 B | 32 768 tokens (hasta 131 072 con configuracion) | Apache 2.0 | safetensors, GGUF |
| Gemma 2 9B IT | 9,24 B | 8 192 tokens | Gemma Terms of Use | safetensors, GGUF |
| Mistral 7B Instruct v0.3 | 7,25 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF |

Los datos de los modelos de referencia proceden de sus fichas públicas. La comparación de rendimiento con `citadel-models` no puede realizarse al no existir benchmarks publicados de este último.

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia explícita impide determinar si el uso comercial está permitido. En la práctica, esto supone un riesgo legal y desaconseja su adopción en producción sin aclaración previa del autor.
- Sesgos conocidos: no disponible. No se ha publicado información sobre la composición del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Riesgo de alucinación: no cuantificado. No hay benchmarks ni evaluaciones de fidelidad publicados.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto real y los idiomas soportados. No debe asumirse un rendimiento correcto en castellano ni en tareas multilingües.
- Ausencia de documentación: no hay ficha técnica, paper, blog ni repositorio asociado. El formato de prompt, la plantilla de chat y los hiperparámetros de generación recomendados no están especificados.
- Trazabilidad del entrenamiento: se desconoce el modelo base, los datos utilizados y el proceso de ajuste, lo que impide auditar el origen del conocimiento del modelo.
- Adopción limitada: con 0 descargas y 1 like en el momento de la consulta, no existe una comunidad que haya validado su comportamiento ni reportado fallos.
- Producción: antes de usarlo en cualquier sistema real conviene ejecutar una evaluación propia con el caso de uso concreto, verificar la plantilla de chat y confirmar los términos de licencia con el autor.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/carnalMATRIX/citadel-models
- Repositorio, paper, blog o demo del autor: no disponible.
- Los resultados de búsqueda web consultados no contienen información relacionada con el modelo: devuelven exclusivamente portales de noticias locales griegos sobre la isla de Cefalonia (inkefalonia.gr, kefaloniapress.gr, kefalonialife.gr, kefalonianea.gr), sin ninguna conexión con `citadel-models`.
