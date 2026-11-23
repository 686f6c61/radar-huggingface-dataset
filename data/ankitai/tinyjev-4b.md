# AnkitAI/TinyJev-4B

## Resumen

TinyJev-4B es un modelo de decisión tipada ("typed decisions") desarrollado por AnkitAI, afinado a partir de Qwen/Qwen3.5-4B. No es un modelo generativo al uso: recibe un texto de estado y un conjunto de preguntas con opciones predefinidas, y devuelve únicamente una probabilidad por cada opción, sin producir prosa. Está diseñado específicamente para la API de decisión de Ollama (`/v1/systemone`, disponible desde Ollama 0.35.1), lo que lo convierte en una pieza pensada para integrarse en pipelines de clasificación y enrutamiento automatizado.

El modelo parte de una arquitectura transformer densa de 4.539.265.536 parámetros (4,5B), con una ventana de contexto de 16k tokens que permite procesar documentos completos —contratos, políticas, hilos de correo— en una sola petición. Según la model card, se entrenó con LoRA r8/alpha 16 sobre todas las capas lineales del modelo de lenguaje, fusionada posteriormente en los pesos finales, usando el conjunto público Tev1 de Together AI más 1.269 preguntas sobre NDAs de ContractNLI.

Su relevancia actual radica en que cubre un nicho poco atendido: modelos pequeños, desplegables en local vía Ollama, especializados en clasificación con opciones cerradas y contexto largo. Frente a alternativas como Tev1 4B (ventana de 2k) o Nimble 9B (8k), TinyJev 4B ofrece 16k de contexto con un tamaño de 4,5B, lo que lo hace viable en hardware de consumo. La licencia es Apache 2.0 y los pesos están disponibles en safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-4B), afinado con LoRA fusionada |
| Parametros totales | 4.539.265.536 (4,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (16k) |
| Tipos de cuantizacion | Q8_0 (4,5 GB) y Q4_K_M (2,7 GB) publicados; GGUF disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (Ollama) |

## Arquitectura y entrenamiento

TinyJev-4B se construye sobre Qwen3.5-4B, un transformer denso de 4,5B parámetros. El ajuste se realizó con LoRA de rango 8 y alpha 16 aplicada a todas las capas lineales del modelo de lenguaje, y los adaptadores se fusionaron en los pesos finales, de modo que el artefacto distribuido no requiere cargar LoRA por separado. La cabeza de salida no genera texto libre: Ollama puntúa cada pregunta con un único forward pass y aplica softmax sobre las letras de las opciones, de manera que las probabilidades devueltas son las propias del modelo.

El entrenamiento usó el conjunto público Tev1 de Together AI (37.840 decisiones, licencia MIT), re-renderizado byte a byte con el prompt exacto que construye Ollama, más 1.269 preguntas de documentos largos procedentes de NDAs del split de entrenamiento de ContractNLI (mediana de 2,3k tokens, máximo de 11,8k). La función de pérdida se aplicó sobre la letra de respuesta única, con learning rate 5e-5, schedule coseno, una época y una única A100 durante aproximadamente dos horas. Se excluyeron explícitamente todos los ítems de JevBench y OpenDecision, y una comprobación de 13-gramas contra ambos conjuntos no detectó solapamiento.

## Capacidades

- Clasificación con opciones cerradas: devuelve una probabilidad por cada opción ofrecida en la pregunta, sin generar texto libre.
- Tipos de pregunta soportados: `choice` (selección entre criterios con descripción) y `noul` (sí/no), según el ejemplo de la model card.
- Procesamiento de documentos largos: ventana de 16k tokens que permite introducir contratos, políticas o hilos de correo completos en una sola petición.
- Enrutamiento y triaje: asignación de equipos o categorías según criterios definidos por el desarrollador.
- Detección de contradicciones en contratos: distingue entre "lo dice", "dice lo contrario" y "no se pronuncia" sobre cláusulas concretas.
- Integración con Ollama: endpoint `/v1/systemone` y paquete Python `tinyjev` (`tinyjev.load("TinyJev-4B").predict({...})`).
- Soporte de despliegue local sin conexión: descarga directa de los GGUF y el `Modelfile` del repositorio.
- Capacidad multimodal declarada en los tags (`image-text-to-text`), aunque la model card no documenta uso de visión ni entrenamiento con imágenes.
- No se documenta soporte de tool calling, agentes multi-paso ni modo de razonamiento extendido.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y una pregunta `choice` con criterios (devoluciones, envíos, facturación) y devuelve la probabilidad de cada equipo. El ejemplo de la model card lo ilustra con un caso de zapatos tardíos y cargos duplicados. Es adecuado porque elimina la generación de prosa y reduce la latencia a un forward pass por pregunta.
- Enrutamiento de correo entrante: clasificación de hilos de correo completos en categorías operativas gracias a la ventana de 16k, que permite incluir el hilo entero sin truncar.
- Análisis de contratos y NDAs: verificación de si un contrato dice, contradice o guarda silencio sobre cláusulas concretas. En la evaluación con 60 NDAs no vistas, TinyJev alcanza 0,806 frente a 0,406 de Tev1 tal como se distribuye en Ollama, precisamente por su ventana mayor.
- Moderación y escalado a humano: pregunta `noul` para decidir si un caso requiere atención humana urgente, integrada en un flujo donde el modelo solo puntúa y el código decide el umbral.
- Automatización de formularios y encuestas: asignación de respuestas abiertas a categorías predefinidas con probabilidades calibradas, útil para agregación estadística posterior.
- Control de agentes en entornos simulados: la demo de Jev Grand Prix muestra el modelo eligiendo la trazada y los pedales en cada decisión, con el código encargado de la conducción. Es un patrón aplicable a cualquier bucle donde el modelo solo selecciona entre acciones discretas.
- Filtrado previo en pipelines RAG: decidir si un documento recuperado responde a una pregunta concreta antes de invocar un modelo generativo mayor, ahorrando coste y latencia.

## Benchmarks y rendimiento

Resultados medidos a través de `/v1/systemone` de Ollama 0.35.1, con los mismos inputs y pesos Q8_0:

| Modelo | JevBench publico (231) | OpenDecision 500 | Contratos: 60 NDAs no vistas (180 preguntas) |
|---|---:|---:|---:|
| TinyJev 4B v2 | 0,766 | 490 | 0,806 |
| Tev1 4B, tal como se distribuye (ventana 2k) | 0,688 | 487 | 0,406 |
| Tev1 4B, ventana ampliada a 16k | 0,762 | 487 | 0,728 |
| Qwen3.5-4B sin afinado | 0,693 | 479 | no disponible |

En decisiones cortas, TinyJev v2 está a la par de Tev1 con ventana de 16k: 177 frente a 176 de los 231 ítems de JevBench, y 490 frente a 487 en OpenDecision. La ventaja aparece en documentos largos. En los 19 ítems de política larga de JevBench, Tev1 sigue ganando por 8 a 6. En la columna de contratos, Tev1 tal como se distribuye rechaza 26 de los 60 NDAs por exceder su ventana, y esas preguntas cuentan como fallo; el 46% de las preguntas son contradicciones ("dice lo contrario"), planteadas primero.

Debilidad conocida y medida: razonamiento multi-paso con fechas y números. Obtiene 1 de los 15 ítems temporales difíciles de JevBench, igual que Tev1.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5 GB con cuantización Q8_0 y 2,7 GB con Q4_K_M, más el overhead del contexto (hasta 16k tokens).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para Q8_0 con contexto largo; A100 o H100 para servir varias peticiones concurrentes.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y en Apple Silicon con memoria unificada suficiente.
- Despliegue: Ollama 0.35.1 o superior mediante `/v1/systemone`, o `ollama create tinyjev -f Modelfile` con los GGUF del repositorio. El paquete Python `tinyjev` actúa como cliente del Ollama local. No se documenta soporte para vLLM, TGI o llama.cpp directo.
- Latencia: aproximadamente 1,8 s por pregunta con un prompt de 700 tokens en un M1 Mac mini a Q8_0. La demo de Jev Grand Prix reporta unos 5 s por decisión en el mismo hardware.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench (231) | OpenDecision 500 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| TinyJev 4B v2 | 4,5B | 16k | 0,766 | 490 | Apache 2.0 | Hugging Face, Ollama (`parable/tinyjev`) |
| Tev1 4B | 4B | 2k (16k si se amplía) | 0,688 (0,762 a 16k) | 487 | no disponible en la información | Ollama |
| Tev1 0.8B | 0,8B | 2k | no disponible | no disponible | no disponible en la información | Ollama |
| Nimble 9B | 9B | 8k | no disponible | no disponible | no disponible en la información | Ollama |
| Qwen3.5-4B sin afinado | 4,5B | no disponible | 0,693 | 479 | no disponible en la información | Hugging Face |

TinyJev 4B se posiciona como la opción de mayor contexto entre los modelos de decisión de lanzamiento de Ollama, con un tamaño intermedio entre Tev1 0.8B y Nimble 9B. Su ventaja medible se concentra en documentos largos; en decisiones cortas empata con Tev1 ampliado a 16k.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente `en`; no hay evidencia de rendimiento en castellano u otros idiomas.
- Razonamiento temporal y numérico débil: 1 de 15 ítems temporales difíciles de JevBench, el mismo resultado que Tev1.
- No genera texto: cualquier caso de uso que requiera explicaciones, resúmenes o prosa necesita otro modelo.
- Dependencia de Ollama 0.35.1 o superior: el formato de prompt está entrenado byte a byte para esa API, por lo que usarlo fuera de ella puede degradar el rendimiento.
- Riesgo de calibración: las probabilidades dependen del softmax sobre letras de opción; con muchas opciones o criterios ambiguos la distribución puede volverse difusa.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3.5-4B y de datos de decisiones en inglés, puede heredar sesgos del modelo base y del conjunto Tev1.
- Alucinación: al no generar texto libre, el riesgo de invención es bajo, pero puede asignar alta probabilidad a una opción incorrecta en documentos ambiguos o con cláusulas contradictorias.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias del modelo base Qwen3.5-4B y del conjunto de datos Tev1 (MIT) en la cadena de derivación.
- El tag `image-text-to-text` no está respaldado por documentación de entrenamiento multimodal; no debe asumirse capacidad de visión en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnkitAI/TinyJev-4B
- Repositorio GitHub: https://github.com/ankit-aglawe/tinyjev
- Paquete PyPI: https://pypi.org/project/tinyjev/
- Modelo en Ollama: https://ollama.com/parable/tinyjev
- Conjunto de entrenamiento Tev1: https://github.com/togethercomputer/tev1
- JevBench: https://github.com/fstandhartinger/jevbench
- Benchmark OpenDecision: https://github.com/ankit-aglawe/tinyjev/tree/main/benchmarks/opendecision
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- Demo Jev Grand Prix: https://github.com/enoyola/jev-grand-prix
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
