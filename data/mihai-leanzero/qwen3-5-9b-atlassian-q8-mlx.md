# Mihai-LeanZero/Qwen3.5-9B-Atlassian-Q8-mlx

## Resumen

Qwen3.5-9B-Atlassian-Q8-mlx es un ajuste fino del modelo Qwen3.5-9B de Alibaba Qwen, desarrollado por LeanZero y publicado por el usuario Mihai-LeanZero. El modelo está especializado en el ecosistema Atlassian: Forge (la plataforma de desarrollo de apps), Jira, Confluence y Jira Service Management (JSM). El ajuste se realizó mediante LoRA sobre el modelo base y los pesos del adaptador se fusionaron en el modelo final, que se distribuye cuantizado a 8 bits (group size 64) en formato MLX para su ejecución en Apple Silicon.

El modelo resuelve un problema concreto: la generación de aplicaciones Forge completas y manifiestos válidos a partir de instrucciones breves, además de responder con precisión a preguntas sobre identificadores, endpoints y ámbitos de las APIs de Atlassian. Con 9.409.813.744 parámetros, se posiciona como la variante pequeña de la familia Atlassian de LeanZero, que también incluye un modelo de 27B entrenado con la misma mezcla de datos.

La relevancia actual reside en su enfoque vertical: en lugar de competir en capacidades generales, optimiza el conocimiento de un dominio muy específico (el desarrollo sobre Atlassian) con un presupuesto de cómputo modesto, ejecutable en un único Mac Studio. Incluye además una cabeza de predicción multi-token (MTP) para decodificación especulativa, lo que mejora el throughput en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3.5-9B la define; se han medido pruebas hasta 32.768 tokens) |
| Tipos de cuantizacion | 8 bits, group size 64 (MLX) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `mtp.safetensors` para la cabeza MTP |
| Modelo base | Qwen/Qwen3.5-9B |
| Metodo de ajuste | LoRA fusionado en los pesos |
| Tamano del repositorio | 12,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de aproximadamente 9.400 millones de parámetros. Sobre él se aplicó un ajuste LoRA que posteriormente se fusionó en los pesos, y el conjunto se cuantizó de bf16 a 8 bits con group size 64 usando mlx-node y mlx-lm. Se distribuye como un checkpoint `qwen3_5` estándar, compatible con cualquier cargador de modelos de mlx-community, e incluye una cabeza de predicción multi-token (MTP) separada que habilita decodificación especulativa.

El entrenamiento se realizó en una ronda de dos épocas completas (4.300 pasos, learning rate 5e-5) sobre la mezcla m7 del modelo de 27B: 18.189 muestras, aproximadamente 6,1 millones de tokens. La composición del dataset incluye doce apps Forge escritas por LeanZero, cinco fixtures de forge-sim, manifiestos generados por esquema y validados con el validador de Atlassian, ejemplos de UI Kit que compilan con @forge/react 12, documentación de Forge en texto y en pares pregunta-respuesta con control de verbatim, hechos de endpoints y scopes extraídos de seis especificaciones OpenAPI de Atlassian, un compendio de investigación comunitaria de LeanZero, 220 hilos públicos de la Atlassian Developer Community, apps del modelo de 27B que pasaron las puertas de validación en dos rondas de rejection sampling (431 + 937), 362 pares de corrección validadas por el validador y una porción de replay de código general. Se entrenó con `reasoning_effort=medium` y `preserve_thinking=false`.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés, con modo de pensamiento (thinking) activable o desactivable.
- Conocimiento especializado de Forge, Jira, Confluence y Jira Service Management: módulos, manifiestos, endpoints, scopes y APIs.
- Generación de manifiestos Forge válidos según el validador oficial de Atlassian.
- Generación de aplicaciones Forge completas que compilan con tsc contra los tipos reales de @forge/*.
- Respuesta a preguntas sobre identificadores y hechos de las APIs de Atlassian (con mejor rendimiento en hechos anteriores a abril de 2026).
- Soporte de tool calling y function calling mediante el parser `qwen3_coder_xml` en Rapid-MLX.
- Soporte de razonamiento multi-paso con parser de razonamiento `qwen3`.
- Decodificación especulativa mediante cabeza MTP (hasta 3 tokens especulativos).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Generación de aplicaciones Forge a partir de una descripción breve: el modelo produce el manifiesto y el código de la app; en las pruebas, 16 de 25 apps completas compilaron con tsc contra los tipos reales de @forge/*, lo que lo hace útil como primer borrador en un flujo con validación posterior.
- Asistencia en el desarrollo de módulos UI Kit: el modelo ha sido entrenado con ejemplos que compilan con @forge/react 12, por lo que puede generar componentes de panel, páginas y acciones dentro de apps Forge.
- Consulta técnica sobre APIs de Atlassian: responde preguntas sobre endpoints, scopes y módulos con una precisión del 69% en el sondeo de identificadores con thinking desactivado, frente al 15% del modelo base, lo que lo hace adecuado para asistentes internos de documentación.
- Automatización de migraciones Atlassian: dado su conocimiento de Jira, Confluence y JSM, puede ayudar a redactar scripts y planes de migración entre instancias o productos.
- Validación y corrección de manifiestos: el modelo puede generar manifiestos candidatos que después se pasan por el validador oficial; los 362 pares de corrección del dataset lo entrenan para proponer arreglos a errores de validación.
- Agente de escritorio integrado: se sirve mediante Rapid-MLX (el motor de la app Elzi de LeanZero) con tool calling y decodificación especulativa, lo que permite integrarlo en un agente local que consulte Jira o Confluence.
- Generación de código general con sesgo Atlassian: la porción de replay de código general del dataset permite usarlo también para tareas de programación no específicas del ecosistema, aunque su especialización es el dominio Atlassian.

## Benchmarks y rendimiento

| Prueba | Base 9B sin ajustar | 9B ajustado | 27B release (v0.5) |
|---|---|---|---|
| Identificadores pre/post 2026-04, thinking on | 15% / 15% | 62% / 15% | 85% / 15% |
| Identificadores, thinking off (servido) | n/a | 69% / 38% | 85% / 31% |
| Manifiestos válidos (de 25) | n/a | 19 | 31,3 |
| App completa que pasa todas las puertas (de 25) | n/a | 16 | 30,0 |
| Bucles por pierna (4 piernas) | 0 / 0 / 5 / 3 | 0 / 0 / 4 / 0 | 0 / 0 / 1 / 0 |
| No terminación por pierna | 28 / 23 / 33 / 23% | 18 / 8 / 13 / 0% | 38 / 30 / 35 / 13% |
| KLD / top-1 (8 bits fusionado vs base+adaptador) | - | 0,0537 / 99,14% | 0,0339 / 99,56% |
| Aceptación MTP / speedup | - | 67% / 1,14x, 1,09x, 1,08x, 1,05x | 58% / 1,45x, 1,38x, 1,38x, 1,27x |
| Carga en LM Studio | - | PASS | PASS |

Datos adicionales medidos: pérdida de validación de 0,575 sobre la mezcla de entrenamiento y 0,959 sobre la mezcla de la ronda 1 del 27B. Sonda de fuga: 0 fugas sobre 112 salidas (26 coincidencias de regex, de las cuales 21 marcadas como alucinadas y 5 como token alucinado). Throughput MTP en Rapid-MLX, un solo stream: decodificación de 63 a 72 tok/s (1,14x) a 128 tokens, de 63 a 69 tok/s (1,09x) a 2.048, de 61 a 66 tok/s (1,08x) a 8.192 y de 54 a 57 tok/s (1,05x) a 32.768.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 12,8 GB en disco; al ser un modelo MLX de 8 bits, requiere aproximadamente esa cantidad de memoria unificada para cargarse, más overhead de contexto.
- Hardware de referencia: el autor lo entrenó, sirvió y evaluó en un único Apple Silicon Mac Studio; no se especifica el modelo exacto de chip.
- GPU recomendadas: no aplica de forma directa, ya que el formato MLX está pensado para Apple Silicon. No se documenta ejecución en GPU NVIDIA o AMD en la información disponible.
- Cabe en Apple Silicon con al menos 16 GB de memoria unificada (estimación basada en el tamaño del repo de 12,8 GB); no se confirma en la información proporcionada.
- Opciones de despliegue: Rapid-MLX (fork de LeanZero, motor de la app Elzi), LM Studio con motor MLX y mlx-lm.
- Latencia y throughput: medidos con MTP en Rapid-MLX, un solo stream, entre 54 y 72 tok/s según la longitud de contexto (ver tabla de benchmarks). Sin MTP no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-Atlassian-Q8-mlx | 9,4B | no disponible | Forge, Jira, Confluence, JSM | Apache 2.0 | MLX 8 bits |
| Qwen3.5-9B (base) | 9,4B | no disponible | Generalista | Apache 2.0 (segun modelo base) | bf16 y otras |
| Qwen3.5-9B-Atlassian 27B (familia LeanZero) | no disponible (27B nominal) | no disponible | Forge, Jira, Confluence, JSM | Apache 2.0 | MLX |

El modelo de 27B de la misma familia supera al de 9B en todas las pruebas medidas (85% frente a 62% en identificadores con thinking activo, 30,0 frente a 16 apps completas de 25, y mayor speedup MTP de 1,45x frente a 1,14x), a cambio de un mayor consumo de memoria. El modelo base sin ajustar rinde muy por debajo en el dominio Atlassian (15% en identificadores), lo que cuantifica la ganancia del ajuste. No se dispone de datos de benchmarks de otros modelos especializados en Atlassian para una comparación más amplia.

## Limitaciones y advertencias

- El modelo no es un compilador: el propio autor recomienda emparejarlo con el validador de manifiestos de Atlassian y con tsc para verificar las salidas.
- El conocimiento de hechos posteriores a abril de 2026 es nulo en las pruebas (15% de acierto, igual que el modelo base); solo mejora en hechos anteriores a esa fecha (62% frente a 15%).
- Rendimiento inferior al modelo de 27B de la misma familia en todas las métricas publicadas; una segunda ronda de entrenamiento con la mezcla v0.4 del 27B no alcanzó el umbral de publicación (18 de 25 apps completas y 19 de 25 manifiestos frente al umbral de 20/20) y no se publicó.
- Riesgo de alucinación documentado: la sonda de fuga detectó 21 coincidencias marcadas como alucinadas sobre 112 salidas.
- Bucles de generación genuinos detectados en una de las cuatro piernas de muestreo (4 bucles) y no terminación de hasta el 18% en la primera pierna; requiere límites de tokens y control de parada en producción.
- Idioma limitado al inglés según la model card; no se documenta soporte de castellano ni de otros idiomas.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo se distribuye únicamente en formato MLX de 8 bits, lo que limita su despliegue a entornos Apple Silicon o a conversiones manuales.
- El formato MLX no es directamente compatible con vLLM, TGI o llama.cpp; la información disponible solo documenta Rapid-MLX, LM Studio y mlx-lm.
- No se especifica la longitud de contexto oficial del modelo en la información proporcionada, aunque las pruebas de throughput llegan a 32.768 tokens.
- Dependencia de un fork específico (Rapid-MLX de LeanZero) para el tool calling, el parser de razonamiento y la decodificación especulativa MTP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.5-9B-Atlassian-Q8-mlx
- Página de la familia Atlassian de LeanZero: https://leanzero.net/portfolio/atlassian-models
- LeanZero: https://leanzero.net
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Servicios de migraciones Atlassian: https://leanzero.net/services/atlassian-migrations
- Elzi (app de escritorio con Rapid-MLX): https://leanzero.net/portfolio/elzi
- Wheel del motor Rapid-MLX: https://downloads.leanzero.net/engine/leanzero_engine-0.14.3%2Blz.29-py3-none-any.whl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
