# jakeatx/slimder-qwen38-ream288-depth32-agentic-final-9336692-GGUF

## Resumen

El modelo `jakeatx/slimder-qwen38-ream288-depth32-agentic-final-9336692-GGUF` es una publicación de pesos en formato GGUF derivada de una base compacta de arquitectura MoE (mixture-of-experts) de 32 capas denominada REAM-288. Sobre esa base BF16 de 74.615.655.680 parámetros, el autor ha fusionado un adaptador LoRA de rango 32 entrenado hasta el token 9.336.692 y ha convertido el resultado con una implementación fijada de llama.cpp identificada como `qwen4exp`. El repositorio publica las cuantizaciones de forma incremental, una verificada cada vez.

El interés técnico del artefacto es doble. Por un lado, es un caso de compresión agresiva de modelos: la base procede de un tronco original de 48 capas reducido a 32, e incorpora una tabla n-gram PLE (per-layer embedding) al 50 % de capacidad, lo que sugiere una estrategia de reducción de cómputo y memoria con recuperación parcial de conocimiento mediante memorización n-gram. Por otro, está etiquetado explícitamente como `agentic` y `conversational`, lo que apunta a un ajuste orientado a flujos de agente y diálogo multi-turno, aunque el autor no documenta ni los datos de entrenamiento ni evaluaciones de capacidad.

Se trata de un lanzamiento muy reciente (publicado y actualizado el 10 de septiembre de 2026) con cero descargas y cero valoraciones en el momento de redactar esta ficha, sin benchmarks publicados y con un aviso explícito del autor sobre la incompatibilidad de la cabeza MTP (multi-token prediction) del modelo original de 48 capas con este tronco de 32. Debe considerarse, por tanto, material experimental de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) de tipo transformer, tronco de 32 capas (podado desde un original de 48), con tabla n-gram PLE al 50 % de capacidad |
| Parametros totales | 74.935.657.126 (safetensors del repo GGUF); 74.615.655.680 en la base compacta BF16 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `UD-Q4-K-XS` (receta Unsloth `UD-Q3_K_XL` con asignaciones IQ2/IQ3 XS promovidas a `IQ4_XS`), `Q4-K-M`, `UD-Q5-K-XL`, `Q8_0` |
| Idiomas soportados | no disponible (familia Qwen de base, soporte multilingue no confirmado por el autor) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en este repositorio; la base y el adaptador de origen, no disponible en la informacion proporcionada |

## Arquitectura y entrenamiento

La ficha del autor describe un pipeline de tres etapas. Primero, se parte de la base compacta REAM-288 de 32 capas en BF16, con 74.615.655.680 parámetros y una tabla n-gram PLE al 50 % de capacidad, procedente del modelo `jakeatx/slimder-qwen38-ream288-depth32-agentic-ngram50-compact`. Segundo, se fusiona un adaptador LoRA de rango 32 correspondiente al checkpoint en el token 9.336.692, cuyo origen es `jakeatx/ream-288-rank32-3m-adapter`, revisión `41947bd12f74482906995f47b5c8a7c5703cfca1`, ruta `milestones/checkpoint-wall-9336692/adapter`. Tercero, el modelo fusionado se convierte a GGUF con una versión fijada de llama.cpp que el autor etiqueta como `qwen4exp`.

La decisión de diseño más llamativa es la poda de profundidad: el modelo original tenía 48 capas y este tronco conserva 32, con la consiguiente pérdida de capacidad que el autor compensa parcialmente mediante la tabla n-gram PLE. El sufijo `288` del nombre no se explica en la documentación; no se especifica el número de expertos, la top-k de enrutamiento ni la dimensionalidad oculta, por lo que esos datos figuran como no disponibles. La etiqueta `qwen` y el nombre de la implementación de conversión apuntan a un origen dentro de la familia Qwen (la receta de cuantización menciona explícitamente un modelo "Qwen3.8"), pero el autor no declara el modelo fundacional subyacente.

En cuanto al entrenamiento, se conoce únicamente el punto de parada del LoRA (token 9.336.692) y el rango del adaptador (32). No hay información sobre el volumen total de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otro alineamiento posterior. Tampoco se documenta ningún proceso de evaluación.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y con pipeline `text-generation`, orientado a diálogo multi-turno.
- Orientación a agentes: la etiqueta `agentic` y el nombre del adaptador (`agentic-final`) indican un ajuste específico para flujos de agente, aunque no se detallan las tareas concretas ni el formato de instrucciones.
- Soporte de tool calling / function calling: no disponible; no se documenta ninguna capacidad de invocación de herramientas ni un esquema de plantilla de chat.
- Razonamiento multi-paso y planificación: no disponible; no hay evidencia publicada ni evaluación que lo respalde.
- Capacidades multilingües: no disponible; el autor no publica la lista de idiomas soportados.
- Capacidades especiales: la tabla n-gram PLE al 50 % de capacidad forma parte de la arquitectura y puede emplearse en decodificación asistida por n-gramas, pero su funcionamiento efectivo no está descrito. El autor advierte que la cabeza MTP (multi-token prediction) no está incluida ni validada en estos GGUF, por lo que la decodificación especulativa con MTP queda fuera del alcance de esta publicación.
- Modo "thinking", visión, audio: no disponible.

## Casos de uso

- Estudio de técnicas de compresión de modelos: el repositorio documenta explícitamente una poda de 48 a 32 capas combinada con una tabla n-gram PLE y una fusión de LoRA de rango 32, lo que lo convierte en un caso práctico para investigadores que quieran reproducir o auditar el impacto de estas técnicas sobre un MoE de ~75.000 millones de parámetros.
- Comparación de recetas de cuantización: al publicar cuatro variantes (`UD-Q4-K-XS`, `Q4-K-M`, `UD-Q5-K-XL`, `Q8_0`) con la misma base, permite medir de forma controlada la degradación de calidad y el coste en almacenamiento de cada receta, incluyendo una receta no estándar que promueve tensores IQ2/IQ3 a `IQ4_XS`.
- Evaluación local de agentes con datos sensibles: al ser un GGUF cuantizado en Q4 de ~45 GB, puede ejecutarse íntegramente en una estación de trabajo con 64 GB de memoria unificada o en dos GPU de 24 GB, sin enviar datos a servicios externos, lo que resulta adecuado para prototipos de agentes sobre información confidencial.
- Banco de pruebas de decodificación especulativa: el propio autor plantea la conexión del cabezal MTP como un hito de compatibilidad en tiempo de ejecución; este repositorio sirve como punto de partida para validar si un draft head entrenado sobre 48 capas es reutilizable en un tronco de 32.
- Sustrato para fine-tuning posterior: la base compacta en BF16 y el adaptador LoRA están publicados por separado, de modo que un equipo puede reaplicar el merge con sus propios hiperparámetros o entrenar un LoRA nuevo sobre la base sin depender de los GGUF ya convertidos.
- Despliegue en endpoints compatibles con la API de Hugging Face: la etiqueta `endpoints_compatible` indica que los GGUF pueden servirse a través de la infraestructura de endpoints, útil para pruebas de integración de una API de generación de texto.
- Experimentación con cuantizaciones de muy bajo bit para hardware limitado: la variante `UD-Q4-K-XS` está diseñada explícitamente para ocupar menos almacenamiento preservando los tensores críticos, lo que la hace candidata para entornos donde el presupuesto de disco es la restricción principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y el repositorio no tiene evaluaciones de terceros en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo propio a partir de 74.935.657.126 parámetros, sin incluir caché KV ni overhead de runtime):
  - `UD-Q4-K-XS`: aproximadamente 42-44 GB de pesos.
  - `Q4-K-M`: aproximadamente 45-47 GB de pesos.
  - `UD-Q5-K-XL`: aproximadamente 52-55 GB de pesos.
  - `Q8_0`: aproximadamente 79-82 GB de pesos.
- GPU profesionales: A100 80 GB y H100 80 GB cubren sin problema `Q4-K-M`, `UD-Q4-K-XS` y `UD-Q5-K-XL`, y quedan al límite con `Q8_0` una vez sumada la caché KV. Para `Q8_0` con contexto largo son recomendables dos A100 80 GB o dos H100 80 GB.
- GPU de gama alta para consumidor: una RTX 4090 o RTX 3090 de 24 GB no alberga ninguna de las cuantizaciones completa; es necesario repartir pesos entre VRAM y RAM con llama.cpp. Dos RTX 4090 (48 GB) permiten cargar `UD-Q4-K-XS` y `Q4-K-M` con poco margen. Una RTX 6000 Ada de 48 GB es una opción de una sola tarjeta para Q4.
- Memoria unificada: Apple Silicon con 64 GB permite ejecutar las variantes Q4 con offloading parcial; 128 GB (Mac Studio Ultra) permite cargar Q5 con holgura.
- Opciones de despliegue: llama.cpp y `llama-server` son la vía natural, dado que el autor fija una implementación concreta (`qwen4exp`). Ollama y LM Studio pueden importar el GGUF si el archivo se añade manualmente. El soporte de GGUF en vLLM es experimental y puede no reconocer los tensores de la tabla n-gram PLE; TGI no ofrece soporte nativo de GGUF. No se documenta compatibilidad con ningún otro servidor.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a parámetros, licencia y formato. Los datos de los modelos alternativos proceden de sus fichas públicas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| slimder-qwen38-ream288-depth32-agentic (este modelo) | 74.935.657.126 | no disponible | no disponible | Apache-2.0 | GGUF |
| Qwen3-30B-A3B | 30.500.000.000 aprox. | 3.300.000.000 aprox. | 32.768 nativo, extensible con YaRN | Apache-2.0 | safetensors, GGUF |
| Qwen3-32B | 32.800.000.000 aprox. | denso (no MoE) | 32.768 nativo, extensible con YaRN | Apache-2.0 | safetensors, GGUF |
| Llama-3.3-70B-Instruct | 70.600.000.000 aprox. | denso (no MoE) | 128.000 | Llama 3.3 Community License | safetensors, GGUF |

La comparación con alternativas de la misma categoría resulta incompleta por dos motivos: se desconoce cuántos parámetros activa el modelo por token (dato esencial en un MoE para estimar coste de inferencia) y no existen benchmarks que permitan situarlo frente a Qwen3-30B-A3B o Llama-3.3-70B-Instruct. Hasta que se publiquen evaluaciones, la única ventaja verificable del modelo es la licencia Apache-2.0 sin restricciones comerciales.

## Limitaciones y advertencias

- Ausencia total de validación externa: cero descargas y cero valoraciones, sin benchmarks publicados ni evaluaciones de terceros.
- Riesgo de degradación por poda de profundidad: el tronco conserva 32 de las 48 capas originales; el autor no cuantifica la pérdida de capacidad resultante ni si la tabla n-gram PLE la compensa por completo.
- Cabeza MTP no validada: el propio autor advierte que los GGUF no incluyen una cabeza MTP validada y que la del modelo sin podar de 48 capas podría no ser compatible con este tronco de 32. Cualquier intento de decodificación especulativa con MTP es, por tanto, un experimento abierto.
- Dependencia de una implementación concreta: la conversión se realizó con una versión fijada de llama.cpp etiquetada como `qwen4exp`, no necesariamente idéntica a las versiones estándar del repositorio oficial. Es posible que builds recientes no reproduzcan exactamente el comportamiento esperado.
- Alcance lingüístico desconocido: el autor no publica la lista de idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano o en cualquier otro idioma concreto.
- Soporte de herramientas y agentes no demostrado: pese a las etiquetas `agentic`, no se documenta formato de plantilla de chat, esquema de function calling ni trazas de ejecución de agentes.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje generativo; sin evaluaciones publicadas no puede acotarse su magnitud en tareas de conocimiento factual.
- Trazabilidad del linaje: la ficha indica que los shards de origen pueden eliminarse tras verificar cada shard fusionado, y no se declara el modelo fundacional subyacente más allá de las etiquetas de la familia Qwen. Conviene revisar los términos de licencia de la base original antes de un uso comercial, aunque la licencia declarada aquí sea Apache-2.0.
- Fecha y madurez: el repositorio se creó y actualizó el mismo día (10 de septiembre de 2026), de modo que se trata de un artefacto recién publicado y sujeto a cambios.
- Longitud de contexto no disponible: imposibilita dimensionar la caché KV y planificar despliegues con contexto largo.
- Publicación incremental de cuantizaciones: el autor publica una cuantización verificada cada vez, por lo que no puede asumirse que las cuatro variantes estén disponibles simultáneamente en todo momento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/slimder-qwen38-ream288-depth32-agentic-final-9336692-GGUF
- Modelo base declarado: https://huggingface.co/jakeatx/slimder-qwen38-ream288-depth32-agentic-ngram50-compact
- Adaptador LoRA de origen: https://huggingface.co/jakeatx/ream-288-rank32-3m-adapter (revisión `41947bd12f74482906995f47b5c8a7c5703cfca1`, ruta `milestones/checkpoint-wall-9336692/adapter`)
- Repositorio de llama.cpp, implementación de conversión (la variante concreta `qwen4exp` no se enlaza en la información proporcionada): https://github.com/ggml-org/llama.cpp
- Recetas de cuantización Unsloth, mencionadas por el autor como origen de las asignaciones de tensores: https://huggingface.co/unsloth
- No se encontraron enlaces adicionales relevantes en la búsqueda web: los resultados devueltos correspondían a guías de videojuegos sin relación con el modelo.
