# mradermacher/SRA-RiskGate-4B-i1-GGUF

## Resumen

SRA-RiskGate-4B es un modelo de lenguaje de 4.022 millones de parámetros (4,02B) especializado en evaluación de riesgo en pagos con stablecoins, cumplimiento normativo y detección de fraude en entornos agénticos. Lo desarrolla sriram1983007 y esta ficha cubre la cuantización GGUF realizada por mradermacher (variante i1, con imatrix), publicada bajo licencia Apache 2.0. El modelo parte de la familia Qwen3 (etiqueta `qwen3` en la model card) y está afinado con TRL para tareas de risk assessment en el ecosistema x402, EIP-3009 y EIP-712.

El problema que aborda es concreto: los agentes autónomos que ejecutan pagos con stablecoins (USDC) necesitan un mecanismo de "puerta de riesgo" que evalúe si una transacción, un reembolso o una disputa debe autorizarse, bloquearse o escalarse. El modelo está entrenado sobre el dataset `sriram1983007/sra-stablecoin-risk-bench` y cubre también detección de prompt injection en flujos de pago agénticos, verificación de listas OFAC y reproducibilidad de decisiones.

La relevancia actual radica en que el despliegue en formato GGUF permite ejecutar este clasificador/evaluador de riesgo en hardware de consumo, integrándolo localmente en pipelines de agentes (MCP, AgentKit) sin depender de APIs externas para decisiones sensibles de cumplimiento. El repo ocupa 48,0 GB e incluye 25 cuantizaciones distintas, desde IQ1_S (1,2 GB) hasta Q6_K (3,4 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, segun etiqueta `qwen3` de la model card) |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (tambien existe version static en `mradermacher/SRA-RiskGate-4B-GGUF`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo con 25 ficheros cuantizados + fichero imatrix); el modelo base esta en safetensors via transformers |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de las etiquetas `qwen`, `qwen3` y `transformers`, que sitúan el modelo base en la familia Qwen3. Es un transformer decoder-only de 4,02B parámetros afinado con TRL (tag `trl`), lo que indica un ajuste supervisado y/o preferencias sobre el modelo base. No se especifican el numero de tokens de entrenamiento ni la composición exacta del dataset.

El entrenamiento se orienta a un dominio muy vertical: evaluación de riesgo en pagos con stablecoins. Los tags revelan las areas cubiertas: `eip-3009` (transferencias autorizadas con firma), `eip-712` (firmas tipadas), `x402` (protocolo de pago HTTP para agentes), `ofac` (listas de sanciones), `prompt-injection`, `fraud-detection` y `agentic-payments`. El dataset asociado es `sriram1983007/sra-stablecoin-risk-bench`, lo que sugiere un banco de pruebas de evaluación especifico del dominio. No se documentan innovaciones arquitectonicas como atención lineal o decodificación especulativa; la innovación es de dominio, no de arquitectura.

## Capacidades

- Evaluación de riesgo de transacciones con stablecoins (USDC) y clasificación de autorización, bloqueo o escalado.
- Análisis de firmas EIP-712 y autorizaciones EIP-3009 para detectar patrones anómalos.
- Detección de fraude en flujos de pago agénticos.
- Detección de prompt injection en entornos de agentes que manejan pagos.
- Verificación de cumplimiento frente a listas OFAC y criterios de compliance.
- Gestión de disputas y reembolsos (tags `disputes`, `refunds`).
- Soporte de tool calling y function calling (tags `mcp`, `agentkit`, `ai-agents`).
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Capacidades multilingues: solo inglés declarado.
- No se documentan capacidades de visión, audio ni modo "thinking" explicito.

## Casos de uso

- Puerta de riesgo en agentes de pago: el modelo se invoca antes de ejecutar una transferencia USDC vía x402 y devuelve una decisión de autorizar, bloquear o escalar, actuando como capa de control local sin latencia de red externa.
- Filtro anti prompt injection en pasarelas agénticas: se intercala en el flujo MCP/AgentKit para inspeccionar instrucciones entrantes y detectar intentos de manipular la lógica de pago del agente.
- Cumplimiento OFAC en tiempo real: se consulta contra cada contraparte y firma de transacción para marcar direcciones o patrones sospechosos antes de liquidar.
- Gestión automatizada de disputas y reembolsos: el modelo analiza el contexto de la disputa (importe, historial, firma) y propone una resolución clasificada para revisión humana o ejecución directa.
- Auditoría y reproducibilidad de decisiones: al ser un modelo pequeño y desplegable en local con GGUF, permite registrar y reproducir exactamente la misma evaluación de riesgo en cada ejecución, requisito habitual en auditorías de compliance.
- Prototipado en estación de trabajo: con la cuantización Q4_K_M (2,6 GB) se puede iterar sobre reglas de riesgo y prompts en una GPU de consumo antes de pasar a producción.
- Clasificación batch de transacciones historicas: para revisar carteras o logs de pagos y etiquetar operaciones de riesgo retroactivamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas especificas del dataset `sra-stablecoin-risk-bench`.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): IQ1_S ~1,2 GB; IQ2_M ~1,6 GB; IQ3_M ~2,1 GB; IQ4_XS ~2,4 GB; Q4_K_M ~2,6 GB; Q5_K_M ~3,0 GB; Q6_K ~3,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB o superiores para margen holgado con contexto largo.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna con 6 GB o mas puede ejecutar Q4_K_M o Q5_K_M; las cuantizaciones IQ2/IQ3 caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, llama-cpp-python; para el modelo base sin cuantizar, vLLM o TGI con los safetensors de `sriram1983007/SRA-RiskGate-4B`.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo de 4B en GGUF, se espera un throughput alto en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, el modelo pertenece a la familia Qwen3 de 4B, pero no se aportan métricas que permitan una comparación rigurosa con alternativas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SRA-RiskGate-4B (i1-GGUF) | 4,02B | no disponible | Apache 2.0 | GGUF (25 cuants) | Especializado en riesgo de pagos stablecoin |
| Qwen3-4B (referencia de familia) | ~4B | no disponible en esta ficha | no disponible en esta ficha | safetensors/GGUF | Base generalista; el afinamiento de dominio es la diferencia clave |
| Alternativas de dominio | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion disponible |

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en inglés; no se garantiza comportamiento fiable en castellano ni en otros idiomas.
- Es un modelo de dominio muy estrecho (pagos stablecoin, compliance, agentes); su rendimiento fuera de ese ámbito sera probablemente pobre.
- Riesgo de alucinación inherente a un modelo de 4B: no debe usarse como única fuente de verdad en decisiones de cumplimiento regulatorio sin validación humana o reglas deterministas complementarias.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; la propia model card las marca como "for the desperate" o "lower quality".
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de origen pueden tener condiciones adicionales no detalladas en esta ficha; conviene verificar en el repo original.
- No se documentan sesgos especificos, pero al estar entrenado sobre datos de riesgo financiero puede heredar sesgos de las fuentes subyacentes (por ejemplo, sobrerrepresentación de determinadas jurisdicciones o patrones de fraude).
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso en conversaciones o documentos largos.
- La fecha de creación del repo (2026-10-20) y las etiquetas de ecosistemas emergentes (x402, agentic-payments) indican un modelo muy reciente; la madurez y validación externa son limitadas.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/SRA-RiskGate-4B-i1-GGUF
- Modelo base: https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- Cuantizaciones static: https://huggingface.co/mradermacher/SRA-RiskGate-4B-GGUF
- Dataset de evaluación: https://huggingface.co/datasets/sriram1983007/sra-stablecoin-risk-bench
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#SRA-RiskGate-4B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
