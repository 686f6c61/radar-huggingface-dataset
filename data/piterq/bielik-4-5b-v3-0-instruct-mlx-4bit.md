# PiterQ/Bielik-4.5B-v3.0-Instruct-MLX-4bit

## Resumen

Bielik-4.5B-v3.0-Instruct-MLX-4bit es una copia cuantizada del modelo instructivo polaco speakleash/Bielik-4.5B-v3.0-Instruct, publicada por el usuario PiterQ para su ejecución en local sobre silicio de Apple mediante MLX. No se trata de un modelo nuevo ni de un fine-tuning: el repositorio contiene únicamente los pesos originales convertidos a 4 bits, con el tokenizador y la plantilla de chat intactos respecto al repositorio oficial de SpeakLeash.

El modelo base lo desarrollan SpeakLeash y ACK Cyfronet AGH, y está especializado en polaco (etiqueta de idioma `pl`). Con 4.757.260.288 parámetros totales (aproximadamente 4,76 mil millones) y un peso en disco de 2,87 GB tras la cuantización, está pensado para inferencia en dispositivo: iPhone, iPad y Mac con chips de la serie M. La licencia es Apache 2.0, la misma que la del modelo original.

Su relevancia práctica es doble: por un lado, permite llevar un modelo de casi 5B parámetros especializado en polaco a memoria unificada de dispositivos Apple con un coste de calidad acotado (perplejidad 6,42 frente a 5,73 del bf16 original en la comprobación publicada por el autor); por otro, emplea un esquema mixto 4/6 bits que protege las capas más sensibles en lugar de aplicar 4 bits uniformes, lo que reduce la degradación respecto a una cuantización plana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (el repositorio etiqueta la familia como `llama`); detalles de arquitectura del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 4.757.260.288 (~4,76B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX afín, group size 64; pesos a 4 bits con 6 bits en capas sensibles (`v_proj`, `down_proj` seleccionadas y `lm_head`); 4,82 bits por peso de media. El repositorio original ofrece bf16 y 8 bits |
| Idiomas soportados | Polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 2,9 GB / 2,87 GB de pesos |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre el preentrenamiento ni el alineamiento del modelo base; solo documenta el proceso de cuantización. Según la model card, la conversión se realizó con `mlx-lm` 0.32.2 mediante `mlx_lm convert -q --q-bits 4 --q-group-size 64 --quant-predicate mixed_4_6`, partiendo de los pesos originales en bfloat16 del repositorio de SpeakLeash. Se trata, por tanto, de una transformación puramente de pesos: no hay fine-tuning, ni cambio de tokenizador, ni modificación de la plantilla de chat.

La innovación técnica está en el predicado de cuantización mixto 4/6: en lugar de aplicar 4 bits a todas las matrices, se mantienen a 6 bits determinadas capas `v_proj` y `down_proj` (las consideradas más sensibles) y la cabeza `lm_head`, lo que eleva el coste medio a 4,82 bits por peso a cambio de preservar calidad. El resultado son 2,87 GB frente a los 2,68 GB de una cuantización plana a 4 bits, con una mejora de perplejidad de 6,73 a 6,42 en la comprobación publicada. Para datos de entrenamiento (número de tokens, composición del corpus, fases de RLHF/DPO) hay que remitirse a la model card del modelo base, no incluida en la información disponible.

## Capacidades

- Generación de texto conversacional en polaco, con plantilla de chat instructiva heredada del modelo base.
- Respuesta a preguntas factuales y de cultura general (el ejemplo de la model card es «Jaka jest stolica Polski?»).
- Resumen de textos, según los ocho prompts sintéticos de validación empleados por el autor.
- Comprensión lectora sobre texto en polaco.
- Aritmética básica y cálculo sencillo, validado en la misma batería de prompts.
- Traducción, según la misma batería de comprobación cualitativa.
- Generación de textos cortos de estilo SMS/mensajería.
- Ejecución en dispositivo mediante MLX (`mlx-lm` en Python, `mlx-swift-lm` en Swift para iOS/iPadOS/macOS).
- Modo de decodificación greedy documentado en las pruebas; no se documenta modo de razonamiento explícito, tool calling ni capacidades multimodales.

## Casos de uso

- Asistentes conversacionales offline en iPhone e iPad: el modelo cabe en 2,87 GB de pesos y se ejecuta con `mlx-swift-lm`, lo que permite un chatbot en polaco sin conexión ni envío de datos a la nube, útil en entornos con requisitos de privacidad.
- Procesamiento de texto en el dispositivo para aplicaciones de notas o correo: resumen y reescritura de párrafos en polaco sin salir del terminal, con latencia aceptable en chips M-series.
- Respuesta a preguntas sobre documentación local: con prompts que incluyan el contexto en la ventana, el modelo sirve para lectura comprensiva de fragmentos en polaco (trámites, manuales, FAQ), siempre que se respete el límite de contexto real del modelo base.
- Traducción asistida polaco-español o polaco-inglés en herramientas de escritorio: adecuado para borradores y textos cotidianos; requiere revisión humana en textos técnicos o jurídicos.
- Prototipado rápido en Mac sin GPU dedicada: al ser MLX, permite iterar sobre prompts y plantillas de chat en un portátil Apple antes de decidir si se despliega la versión bf16 o 8 bits en servidor.
- Educación y demos de cuantización: el repositorio documenta el comando exacto y las métricas de perplejidad por variante, por lo que sirve como caso de estudio reproducible de cuantización mixta 4/6 con MLX.
- Filtrado y clasificación de textos cortos en polaco (moderación, etiquetado, respuestas cerradas) en pipelines locales donde no se requiere tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor solo incluye una comprobación de perplejidad declarada explícitamente como «indicative sanity check, not a benchmark», sobre ~21.500 tokens de texto de Wikipedia en polaco (10 artículos, ventanas de 1024 tokens, menor es mejor):

| Variante | Tamano | Perplejidad |
|---|---|---|
| Original bf16 (SpeakLeash) | 9,51 GB | 5,73 |
| 8 bits oficial (SpeakLeash) | 5,06 GB | 5,73 |
| Este repositorio — 4 bits mixto 4/6 | 2,87 GB | 6,42 |
| 4 bits plano, group 64 | 2,68 GB | 6,73 |

Además, el autor indica que las respuestas a 8 prompts sintéticos breves en polaco (chat, resumen, datos factuales, comprensión lectora, aritmética, consejo, traducción, SMS) se mantienen cercanas a la versión oficial de 8 bits con decodificación greedy, sin aportar puntuaciones numéricas.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: en torno a 3 GB para los pesos (2,87 GB) más el overhead del runtime MLX y la caché KV; con contextos cortos es razonable asumir un total de 3,5-4 GB, aunque la cifra exacta depende de una longitud de contexto que no se documenta.
- GPU recomendadas: no aplica en el sentido habitual; el repositorio está orientado a Apple silicon (serie M1/M2/M3/M4 y chips A-series recientes en iPhone/iPad). No hay soporte CUDA documentado en este repositorio.
- Cabe en hardware de consumo: sí, en cualquier Mac con 8 GB de memoria unificada o más, y en dispositivos iOS/iPadOS con suficiente memoria libre; es una de las razones de ser de esta cuantización.
- Opciones de despliegue: `mlx-lm` (Python) y `mlx-swift-lm` (Swift) son las rutas documentadas. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama en este repositorio, ya que el formato es MLX y no GGUF.
- Latencia y throughput: no disponibles. El autor no publica medidas de tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

No hay datos de modelos comparables de terceros en la información proporcionada. La comparación posible es interna, entre las variantes del mismo modelo base:

| Modelo | Parametros | Contexto | Perplejidad (pl) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-4.5B-v3.0-Instruct-MLX-4bit (este) | 4,76B | No disponible | 6,42 | Apache 2.0 | MLX, 2,87 GB |
| Bielik-4.5B-v3.0-Instruct 8 bits oficial | 4,76B | No disponible | 5,73 | Apache 2.0 | Repositorio SpeakLeash, 5,06 GB |
| Bielik-4.5B-v3.0-Instruct bf16 | 4,76B | No disponible | 5,73 | Apache 2.0 | Repositorio SpeakLeash, 9,51 GB |
| 4 bits plano (referencia del autor) | 4,76B | No disponible | 6,73 | Apache 2.0 | Variante de conversión, 2,68 GB |

Frente a alternativas de otros fabricantes (por ejemplo, modelos multilingües pequeños de la misma escala) no se dispone de datos de rendimiento en la información proporcionada, por lo que no se establece comparación.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y evaluado para polaco; su rendimiento en castellano no está documentado y previsiblemente será inferior.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de toxicidad para este repositorio ni para el modelo base en la información disponible.
- Alucinación: es un modelo de ~4,76B parámetros; la comprobación del autor con prompts factuales es cualitativa y no cuantifica la tasa de error. No debe usarse como fuente de verdad sin verificación.
- Contexto: se desconoce la longitud de contexto soportada; planificar prompts largos sin confirmarlo con el modelo base puede provocar truncamientos silenciosos.
- Pérdida de calidad por cuantización: la perplejidad sube de 5,73 a 6,42 (+12% aproximadamente) y el autor advierte de que la comparación es una comprobación indicativa, no un benchmark. Para tareas sensibles a la precisión conviene usar la versión de 8 bits.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una copia de pesos de un tercero conviene conservar la atribución a SpeakLeash y ACK Cyfronet AGH, tal como hace la model card.
- Portabilidad: los pesos están en formato MLX; no son directamente utilizables en vLLM, TGI, llama.cpp ni Ollama sin una conversión adicional.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (21-10-2026); no hay evidencia de uso en producción ni de validación independiente.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre el modelo; los enlaces encontrados no guardan relación con el tema y se han descartado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PiterQ/Bielik-4.5B-v3.0-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
- SpeakLeash: https://speakleash.org/
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
