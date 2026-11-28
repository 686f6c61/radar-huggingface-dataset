# Sayansantra/LFM3-2.0B-WSP-V5-GGUF

## Resumen

LFM3-2.0B-WSP-V5-GGUF es la distribucion en formato GGUF del modelo Sayansantra/LFM3-2.0B-WSP-V5, un ajuste fino orientado a tool calling y uso agentico construido sobre LiquidAI/LFM3-1.7B. El modelo resultante cuenta con 2.017.366.080 parametros (aproximadamente 2,02B) y 29 capas, y ha sido convertido a GGUF con llama.cpp b12774 para su ejecucion local en CPU y GPU de gama baja. El autor lo describe como un modelo de tool calling "equation-seeded", es decir, inicializado a partir de una formulacion o semilla matematica concreta sobre el modelo base de Liquid AI.

La relevancia de esta publicacion radica en su enfoque practico: en lugar de competir en capacidades generales, se especializa en function calling y flujos agenticos, un nicho donde los modelos pequenos suelen fallar por falta de adherencia al esquema JSON y de gestion de la irrelevancia (decidir no invocar ninguna herramienta). El autor reporta resultados en el benchmark BFCL V4 de UC Berkeley Gorilla, con un 87,19% en Non-Live Python AST, un 80,83% en Irrelevance, un 83,16% en el agregado de 6 splits Core y un 69,03% en Full Live sobre un conjunto de evaluacion de 4.091 tareas.

El repositorio ofrece dos cuantizaciones, Q4_K_M (1,18 GB) y Q8_0 (2,01 GB), lo que permite desplegarlo en portatiles, moviles y entornos edge mediante Ollama, LM Studio o llama.cpp. La licencia es la LFM Open License v1.0 heredada del modelo base de Liquid AI, con posibles restricciones para uso comercial que conviene revisar antes de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM3-1.7B), 29 capas |
| Parametros totales | 2.017.366.080 (aprox. 2,02B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (tambien existen pesos safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se construye sobre LiquidAI/LFM3-1.7B, un transformer de 29 capas al que se le ha aplicado un ajuste fino adicional por parte de Sayansantra, dando lugar a un modelo de aproximadamente 2,02B de parametros. El autor lo describe como "equation-seeded", un termino que sugiere una inicializacion o condicionamiento basado en formulaciones matematicas durante el proceso de ajuste, aunque la model card no detalla la metodologia exacta ni el volumen de datos de entrenamiento empleado. No se especifica si hubo RLHF, DPO u otras tecnicas de alineacion, ni la composicion del dataset de ajuste.

La especializacion principal es el tool calling y el comportamiento agentico, con enfasis en la evaluacion mediante BFCL (Berkeley Function Calling Leaderboard). El modelo base LFM3-1.7B de Liquid AI emplea una arquitectura transformer convencional; no se documenta en la informacion disponible el uso de atencion lineal, SSM ni mecanismos hibridos. La conversion a GGUF se realizo con llama.cpp b12774, y los pesos estan optimizados para inferencia local con llama.cpp, Ollama y LM Studio.

## Capacidades

- Generacion de texto conversacional en formato chat.
- Tool calling y function calling con adherencia a esquemas, evaluado en BFCL V4.
- Comportamiento agentico multi-paso orientado a invocacion de herramientas.
- Gestion de irrelevancia: capacidad de decidir no invocar ninguna funcion cuando la consulta no lo requiere (80,83% en Irrelevance).
- Soporte de evaluacion en escenarios Non-Live (Python AST), Live y Core splits de BFCL.
- Compatibilidad con endpoints y APIs de inferencia (tag endpoints_compatible).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Agentes de automatizacion local en portatiles: con la cuantizacion Q4_K_M (1,18 GB) el modelo cabe en equipos sin GPU dedicada y puede gestionar bucles de invocacion de herramientas en asistentes de escritorio o CLI, gracias a su especializacion en function calling.
- Integracion en asistentes de soporte tecnico: el modelo puede decidir entre responder directamente o invocar APIs internas (consulta de tickets, estado de pedidos) apoyandose en su buen rendimiento en Irrelevance para evitar llamadas innecesarias.
- Orquestacion de herramientas en entornos edge y moviles: su tamano reducido y formato GGUF permiten desplegarlo en dispositivos con memoria limitada mediante Ollama o LM Studio, sin depender de la nube.
- Prototipado rapido de pipelines agenticos: los desarrolladores pueden validar esquemas de function calling y flujos multi-paso en local antes de escalar a modelos mayores, usando Q8_0 (2,01 GB) para mayor fidelidad en la precision de las llamadas.
- Automatizacion de tareas de back-office: invocacion de funciones para consultar bases de datos, generar informes o actualizar registros en CRM, con control de alucinaciones limitado por el esquema estricto de las herramientas.
- Evaluacion y benchmarking de tool calling: util como baseline ligero para comparar estrategias de prompting y esquemas de herramientas contra el leaderboard BFCL V4 en entornos de investigacion.
- Asistentes de codigo con invocacion de herramientas: integracion en editores o pipelines CI/CD para ejecutar acciones como lanzar tests o consultar repositorios mediante function calling.

## Benchmarks y rendimiento

Resultados reportados por el autor en BFCL V4 (UC Berkeley Gorilla), sobre un conjunto de 4.091 tareas:

| Benchmark | Resultado |
|---|---|
| Non-Live Python AST | 87,19% |
| Irrelevance | 80,83% |
| 6-Split Core (agregado) | 83,16% |
| Full Live | 69,03% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numericas directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB para Q4_K_M y 2,1 GB para Q8_0 en inferencia, mas overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en iGPU con memoria compartida suficiente.
- Despliegue: llama.cpp (b11960 / b12774 o superior), Ollama, LM Studio, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de muestreo sugeridos por el autor: `--temp 0.1 --top-k 50 --repeat-penalty 1.1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-2.0B-WSP-V5-GGUF | 2,02B | no disponible | Tool calling / agentico | LFM Open License v1.0 | GGUF en HF |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Generacion de texto general | LFM Open License v1.0 | safetensors en HF |
| Otros modelos pequenos de tool calling | no disponible | no disponible | Function calling | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks de modelos alternativos comparables que permitan una comparacion numerica directa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo base de Liquid AI, puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: presente como en cualquier modelo de 2B; la especializacion en tool calling reduce el riesgo en invocaciones estructuradas, pero no lo elimina en generacion libre.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados; no se debe asumir soporte multilingue sin validacion.
- Restricciones de licencia: la LFM Open License v1.0 puede imponer condiciones para uso comercial; es obligatorio revisar el archivo LICENSE antes de desplegar en produccion.
- Madurez del modelo: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicacion reciente y poco validada por la comunidad.
- Precisión en escenarios Live: el 69,03% en Full Live es notablemente inferior al 87,19% en Non-Live, lo que sugiere degradacion en llamadas con APIs reales y requiere validacion especifica en produccion.
- Dependencia de version de llama.cpp: el autor indica versiones concretas (b11960 / b12774); versiones antiguas pueden no cargar correctamente el GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Sayansantra/LFM3-2.0B-WSP-V5-GGUF
- Modelo base ajustado (BF16): https://huggingface.co/Sayansantra/LFM3-2.0B-WSP-V5
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Pull request en el leaderboard BFCL V4: https://github.com/ShishirPatil/gorilla/pull/1402
- Licencia: https://huggingface.co/Sayansantra/LFM3-2.0B-WSP-V5-GGUF/blob/main/LICENSE
