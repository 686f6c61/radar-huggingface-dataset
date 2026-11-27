# LocalOptimum/Qwen3-8B-CryptoRisk

## Resumen

Qwen3-8B-CryptoRisk es un adaptador LoRA (entrenado con QLoRA en cuantizacion NF4) sobre el modelo base Qwen/Qwen3-8B, publicado por el usuario LocalOptimum. Su proposito es muy concreto: extraer el estado de un protocolo o componente de activo digital a partir de un informe de noticias en chino con marca temporal, devolviendo cuatro campos estructurados (`target_state`, `source_id`, `quote` y `rationale`). No es un modelo de proposito general, sino un componente de extraccion de evidencia dentro de un sistema mayor de gestion de riesgo para mercados de criptoactivos.

El adaptador corresponde a la version `261128` evaluada en la tesis *基于LLM Agent技术的数字货币市场风控算法研究与应用* (investigacion sobre algoritmos de control de riesgo en mercados de moneda digital basados en tecnologia de agentes LLM). La logica que convierte la evidencia extraida en una recomendacion de riesgo (reglas de admision de fuentes, herramientas numericas y politica) no forma parte del adaptador: se ejecuta por separado en la implementacion de investigacion del autor.

Es relevante ahora porque ejemplifica un patron habitual en IA financiera open source: un modelo base grande y generalista, adaptado con un conjunto de datos pequeno y especializado (2.313 ejemplos etiquetados por modelo, sin verificacion humana) para una tarea de extraccion estructurada y auditable. Su utilidad practica esta acotada al dominio y al idioma (solo chino), y su licencia no esta declarada de forma explicita en la model card, aunque el base se distribuye bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre proyecciones de atencion y feed-forward |
| Parametros totales | 8.000 millones (modelo base Qwen3-8B); el adaptador LoRA anade un conjunto reducido de pesos, no cuantificado en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-8B, no confirmada) |
| Tipos de cuantizacion | NF4 (QLoRA) para el entrenamiento; carga del base en 4 bits NF4 con `compute_dtype=bfloat16` segun el ejemplo de carga |
| Idiomas soportados | chino (zh) |
| Licencia | no disponible (el modelo base Qwen/Qwen3-8B se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-8B en la revision `b968826d9c46dd6066d109eabc6255188de91218`, un transformer decoder-only de 8.000 millones de parametros. El entrenamiento uso cuantizacion NF4, una epoca, semilla 17, rango LoRA 16, alpha 32 y dropout 0.05, actualizando siete proyecciones de atencion y feed-forward. El conjunto de supervision factual expandido contenia 2.313 ejemplos etiquetados por modelo con `human_verified=false`, es decir, sin verificacion humana de las etiquetas.

La innovacion tecnica no esta en la arquitectura, sino en el diseno de la tarea: el modelo debe extraer un estado concreto de un informe periodistico con marca temporal y justificarlo mediante una cita textual (`quote`) que se valida contra el propio informe. La evaluacion comprueba que los fragmentos citados aparezcan realmente en el texto de entrada, lo que actua como mecanismo de control de alucinacion a nivel de sistema. El SHA-256 del archivo de pesos publicado es `7ba5ebfd868f9f0aaaf8e0a9f67f39360a4f2b3e9007ab8c06dfd0fabc592f5a`.

## Capacidades

- Extraccion de evidencia estructurada: dado un informe de noticias en chino con marca temporal y un objetivo (protocolo o componente de activo digital), devuelve `target_state`, `source_id`, `quote` y `rationale`.
- Generacion de texto condicionada a la plantilla de chat del tokenizador base, con `enable_thinking=False` en la configuracion de evaluacion.
- Verificacion de citas: el diseno de la tarea exige que el campo `quote` sea un fragmento literal del informe suministrado, lo que permite validacion automatica.
- Capacidad multilingue: limitada al chino segun los metadatos del modelo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el adaptador se concibe como un componente dentro de un sistema de agentes, pero la orquestacion multi-paso reside en el harness externo, no en el adaptador.
- Vision y audio: no soportados.

## Casos de uso

- Extraccion de evidencia en pipeline de riesgo de criptoactivos: el adaptador recibe un informe de noticias en chino y un objetivo, y devuelve el estado del protocolo con cita verificable; el harness externo aplica despues reglas de admision de fuentes y herramientas numericas para emitir una recomendacion de exposicion.
- Monitorizacion de eventos de dano en curso: el modelo puede marcar casos de dano continuado (en la evaluacion detecto 7 de 24 casos de referencia), lo que permite alimentar alertas tempranas en un sistema de vigilancia de protocolos.
- Auditoria y trazabilidad de decisiones: al exigir una cita literal del informe, cada extraccion es auditable; util en entornos donde se requiere justificar por que se emitio una recomendacion de reduccion de exposicion.
- Investigacion academica en NLP financiero: el adaptador y su harness sirven como referencia reproducible para experimentos de extraccion de evidencia y evaluacion de agentes LLM en dominios financieros.
- Generacion de datasets etiquetados: el modelo puede usarse para etiquetar grandes volumenes de informes con el esquema de cuatro campos, aunque con la advertencia de que las etiquetas originales no fueron verificadas por humanos.
- Simulacion retrospectiva de politicas de riesgo: integrado en el replay de precios descrito por el autor, permite comparar estrategias de reduccion de exposicion (el adaptador con aviso directo obtuvo un valor final de USD 9.925,89 y un drawdown maximo del 3,34% en la simulacion descrita).
- Prototipado de agentes financieros especializados: como componente de extraccion dentro de un agente mayor que combine recuperacion de noticias, extraccion y politica de decision.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Informes evaluados | 249 informes sobre 28 objetivos no vistos en entrenamiento |
| Salidas que pasan comprobaciones de estructura y cita | 245 de 249 |
| Salidas que coinciden con el estado de referencia | 154 de 249 |
| Deteccion de casos de dano en curso | 7 de 24 casos de referencia |
| Falsos positivos en casos sin dano | 5 sobre 225 casos |
| Replay retrospectivo (adaptador con aviso directo) | Valor final USD 9.925,89; drawdown maximo 3,34% |
| Replay retrospectivo (extraccion factual + marco basado en reglas) | Valor final USD 9.904,25; drawdown maximo 3,92% |
| Replay retrospectivo (base original, aviso directo) | Valor final USD 9.904,68; drawdown maximo 4,57% |
| Replay retrospectivo (base original, extraccion + reglas) | Valor final USD 9.872,33; drawdown maximo 5,55% |
| Control de media exposicion fija | Valor final USD 9.930,18; drawdown maximo 3,10% |

Nota: las referencias de la evaluacion son juicios del propio modelo, y algunos informes de entrenamiento mencionan objetivos de evaluacion. Las ventanas del replay se solapan y las comparaciones describen simulaciones historicas sobre eventos ya utilizados.

## Requisitos de hardware

- VRAM estimada para inferencia: el ejemplo de carga usa el base en 4 bits NF4 con `device_map={"": 0}`, lo que situa el modelo en el rango de 6-7 GB de VRAM para el base cuantizado, mas el adaptador LoRA (repo de 0,1 GB). Cifra orientativa, no confirmada en la informacion disponible.
- GPU recomendadas: una unica GPU con al menos 8 GB de VRAM para la carga en 4 bits; GPU de datacenter (A100, H100) no son necesarias para inferencia del adaptador, aunque el autor no publica mediciones.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 4070) usando cuantizacion 4 bits.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft` + `bitsandbytes`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT sobre un base estandar, seria tecnicamente posible fusionarlo con el base y servirlo con esas herramientas, pero no esta verificado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-CryptoRisk (este) | 8.000 M (base) + LoRA | no disponible | Adaptador LoRA especializado en extraccion de evidencia financiera en chino | no disponible (base Apache 2.0) | Hugging Face, repo de 0,1 GB |
| Qwen/Qwen3-8B (base) | 8.000 M | no disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| Alternativas especializadas en NLP financiero | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye comparaciones con otros adaptadores o modelos especializados en riesgo de criptoactivos, por lo que la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Etiquetas de entrenamiento sin verificacion humana (`human_verified=false`): la calidad de la supervision depende de las etiquetas generadas por modelo, lo que puede propagar sesgos y errores.
- Las referencias de evaluacion son juicios del propio modelo, no anotaciones humanas independientes; los resultados deben interpretarse con cautela.
- Algunos informes de entrenamiento mencionan objetivos que forman parte del conjunto de evaluacion, lo que puede inflar las metricas de forma optimista.
- Riesgo de alucinacion: aunque el diseno exige citas literales verificables, 4 de 249 salidas no pasaron las comprobaciones de estructura y cita en la evaluacion.
- Baja sensibilidad a casos de dano en curso: detecto 7 de 24 casos de referencia, con 5 falsos positivos sobre 225 casos sin dano.
- Limitacion idiomatica: solo soporta chino; no hay evidencia de funcionamiento en castellano u otros idiomas.
- Ambito muy restringido: no es un modelo de proposito general; fuera de la tarea de extraccion de estado de protocolos de activos digitales su rendimiento no esta caracterizado.
- Licencia no declarada en la model card: antes de uso comercial debe verificarse la licencia del adaptador y respetarse la del base (Apache 2.0).
- Las simulaciones de replay son retrospectivas, con ventanas solapadas y sobre eventos ya utilizados; no constituyen evidencia de rendimiento futuro.
- El sistema completo de recomendacion de riesgo requiere el harness externo (reglas de admision, herramientas numericas y politica); el adaptador por si solo no emite avisos de riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LocalOptimum/Qwen3-8B-CryptoRisk
- Version etiquetada 261128: https://huggingface.co/LocalOptimum/Qwen3-8B-CryptoRisk/tree/261128
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencia del base (Apache 2.0): https://huggingface.co/Qwen/Qwen3-8B/blob/b968826d9c46dd6066d109eabc6255188de91218/LICENSE
- Repositorio de investigacion (harness de riesgo): https://github.com/ranxi2001/agent-crypto-guard/tree/87e6b50/experiments/ch6_fusion/risk_harness
- Codigo del prompt factual y validacion: https://github.com/ranxi2001/agent-crypto-guard/blob/87e6b50/experiments/ch6_fusion/risk_harness/decomposed.py
- Registro de entrenamiento: https://github.com/ranxi2001/agent-crypto-guard/blob/87e6b50/reports/metrics/expanded_facts_20261124/training/seed17.json
- Resultados del replay emparejado: https://github.com/ranxi2001/agent-crypto-guard/blob/87e6b50/reports/metrics/holder_qwen_balances_20261128/summary.json
