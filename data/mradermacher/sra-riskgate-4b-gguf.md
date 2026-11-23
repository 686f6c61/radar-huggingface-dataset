# mradermacher/SRA-RiskGate-4B-GGUF

## Resumen

SRA-RiskGate-4B es un modelo de lenguaje especializado en evaluación de riesgos para pagos con stablecoins, cumplimiento normativo y detección de fraude en entornos de agentes autónomos. Lo desarrolla sriram1983007 y esta versión concreta la publica mradermacher como cuantización estática en formato GGUF del modelo original. El modelo parte de una base Qwen3 de 4.022.468.096 parámetros (aproximadamente 4B) y se ha ajustado con TRL para tareas de risk assessment en el dominio de pagos Web3, incluyendo protocolos como x402, EIP-3009 y EIP-712, además de gestión de disputas, reembolsos y detección de prompt injection en flujos de pago agénticos.

El interés del modelo radica en su especialización vertical: no es un modelo generalista, sino una herramienta de "puerta de riesgo" (risk gate) pensada para insertarse en pipelines de agentes que ejecutan pagos con USDC u otras stablecoins. Cubre casos como la verificación de cumplimiento OFAC, la evaluación de disputas y la detección de fraude financiero, lo que lo hace relevante para equipos que construyen infraestructura de pagos automatizados y necesitan un componente de decisión local, reproducible y de bajo coste.

Al estar publicado en GGUF con cuantizaciones desde Q2_K hasta f16, el modelo puede desplegarse en hardware modesto, incluso en CPU o GPUs de consumo, lo que facilita su integración como filtro previo en arquitecturas multi-agente. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3 (según tags del modelo) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; también existen cuantizaciones con imatrix en el repo i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es SRA-RiskGate-4B, construido sobre una arquitectura Qwen3 de aproximadamente 4B parámetros. Según los tags de la model card, el ajuste se realizó con TRL (Transformer Reinforcement Learning), lo que sugiere un proceso de fine-tuning supervisado o preferencias sobre el modelo base Qwen3. El dataset asociado es `sriram1983007/sra-stablecoin-risk-bench`, orientado a evaluar riesgos en pagos con stablecoins.

La especialización cubre dominios técnicos concretos: x402 (protocolo de pagos HTTP), EIP-3009 (transferencias autorizadas de tokens), EIP-712 (firma tipada estructurada), gestión de disputas y reembolsos, cumplimiento OFAC, detección de fraude y protección frente a prompt injection en agentes de pago. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Esta versión GGUF es una cuantización estática (quantize_version 2, output_tensor_quantised 1) del modelo original en safetensors.

## Capacidades

- Evaluación de riesgo en transacciones con stablecoins (USDC y similares), incluyendo scoring de fraude y detección de patrones anómalos.
- Cumplimiento normativo: verificación de listas OFAC y evaluación de riesgo regulatorio en pagos.
- Comprensión de estándares Web3: x402, EIP-3009 y EIP-712 para validar y razonar sobre autorizaciones de pago.
- Gestión de disputas y reembolsos: análisis de casos y recomendación de resolución.
- Detección de prompt injection en flujos de agentes que ejecutan pagos.
- Soporte para agentes y razonamiento multi-paso en el contexto de pagos agénticos (agentic payments).
- Integración con MCP (Model Context Protocol) y AgentKit según los tags del modelo.
- Generación de texto conversacional en inglés.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Puerta de riesgo previa a pagos agénticos: el modelo se inserta como paso de validación antes de que un agente ejecute una transferencia con USDC, evaluando la transacción contra criterios de fraude y cumplimiento y devolviendo una decisión de aprobación o bloqueo.
- Filtro de cumplimiento OFAC en tiempo real: en un pipeline de pagos, el modelo analiza los metadatos de la operación y el contexto de la contraparte para señalar posibles coincidencias con listas de sanciones antes de autorizar.
- Detección de prompt injection en agentes financieros: al procesar instrucciones de usuario o contenido externo, el modelo identifica intentos de manipulación que podrían desviar fondos o alterar la lógica de pago.
- Resolución asistida de disputas: dado un caso de disputa con historial de transacciones y comunicaciones, el modelo genera un análisis estructurado y una recomendación de reembolso o rechazo.
- Validación de firmas EIP-712 y autorizaciones EIP-3009: el modelo razona sobre la estructura de las autorizaciones firmadas para detectar inconsistencias o parámetros sospechosos antes de su ejecución on-chain.
- Auditoría y reproducibilidad de decisiones de riesgo: al ser un modelo pequeño y desplegable localmente en GGUF, permite registrar y reproducir las evaluaciones de riesgo en entornos de auditoría sin depender de APIs externas.
- Backend de compliance para fintechs Web3: integrado vía llama.cpp u Ollama, sirve como componente de bajo coste en arquitecturas multi-agente donde cada decisión de pago requiere una evaluación documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M, 4,4 GB con Q8_0 y 8,2 GB con f16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_S o Q4_K_M (2,5-2,6 GB) en tarjetas como GTX 1650, RTX 3050 o superiores; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors es compatible con transformers y potencialmente con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| SRA-RiskGate-4B | ~4B | no disponible | Riesgo en pagos stablecoin, compliance Web3 | Apache 2.0 | GGUF, safetensors |
| Qwen3-4B (base) | ~4B | no disponible | Propósito general | Apache 2.0 | safetensors, GGUF |
| Modelos generalistas de 3-4B (p. ej. Llama 3.2 3B, Phi-3-mini) | 3-4B | 128K (Llama 3.2), 4K-128K (Phi-3) | Propósito general | Licencias variables | safetensors, GGUF |

La comparación directa con alternativas especializadas en riesgo de pagos Web3 no está disponible en la información proporcionada. Frente a modelos generalistas del mismo tamaño, la ventaja de SRA-RiskGate-4B es su ajuste específico en dominios de compliance y pagos agénticos; la desventaja es su menor cobertura lingüística (solo inglés) y la ausencia de benchmarks públicos que permitan cuantificar la mejora.

## Limitaciones y advertencias

- Idiomas: solo inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Sesgos: al estar entrenado sobre un dataset específico de riesgo en stablecoins, puede heredar sesgos de ese corpus y mostrar un rendimiento desigual ante jurisdicciones o protocolos no representados.
- Riesgo de alucinación: como todo modelo generativo, puede producir evaluaciones de riesgo plausibles pero incorrectas; no debe usarse como única fuente de decisión en cumplimiento regulatorio.
- Contexto: la longitud de contexto no está documentada, lo que limita la planificación de casos con historiales largos.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las obligaciones regulatorias aplicables (OFAC, KYC, etc.) que el modelo no sustituye.
- Producción: no hay benchmarks publicados que validen su precisión frente a alternativas; se recomienda evaluarlo contra el dataset `sra-stablecoin-risk-bench` antes de desplegarlo en un pipeline real.
- Esta versión es una cuantización de terceros (mradermacher); la calidad puede diferir de la del modelo original en safetensors, especialmente en cuantizaciones Q2 y Q3.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/SRA-RiskGate-4B-GGUF
- Modelo base: https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/SRA-RiskGate-4B-i1-GGUF
- Dataset de evaluación: https://huggingface.co/datasets/sriram1983007/sra-stablecoin-risk-bench
- Página de resumen del cuantizador: https://hf.tst.eu/model#SRA-RiskGate-4B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
