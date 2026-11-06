# hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-GGUF

## Resumen
connectailab-rl-CHOCO-BRAIN_GUARD-v1-GGUF es un modelo derivado de Qwen/Qwen3.5-0.8B, afinado por Hwihwa Lab mediante aprendizaje por refuerzo (PPO) y fusión de adaptadores LoRA, y distribuido unicamente en formato GGUF Q8_0. No se plantea como un chatbot generalista, sino como un motor de decisión ("córtex prefrontal externo") orientado a la emisión de veredictos estructurados de riesgo en comercio electrónico y fintech: bloquear, auditar, escalar o aprobar transacciones y reclamaciones. Su propuesta de valor es la ejecución local de baja latencia en hardware de borde mediante Ollama, LM Studio o llama.cpp, sin dependencia de la nube.

El modelo hereda la arquitectura del Qwen3.5-0.8B (752.393.024 parámetros reales según los safetensors del repo base) y se distribuye cuantizado en 8 bits, con un tamaño de repositorio de 1,6 GB. Incorpora el denominado protocolo JEV (Judgment-Evaluation-Verification) como marco de decisión y una función de penalización agresiva del riesgo, calibrada para priorizar la preservación de capital frente a la conversación fluida.

Es relevante ahora porque cubre un nicho poco atendido: guardarraíles deterministas y auditables para operaciones financieras en local, con licencia Apache 2.0 y soporte declarado en inglés y coreano. Ahora bien, la documentación disponible es escasa en detalles técnicos verificables (composición del dataset, hiperparámetros de PPO, evaluación independiente), por lo que debe tratarse como una propuesta de nicho a validar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B); ajuste PPO + fusión LoRA |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (8 bits); no se distribuyen otros formatos |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors del modelo afinado |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 752 millones de parámetros, y se especializa mediante una política de aprendizaje por refuerzo con PPO, seguida de destilación de política y fusión de los adaptadores LoRA en los pesos base. El resultado se exporta exclusivamente a GGUF Q8_0, lo que sugiere que el flujo de publicación se orienta a inferencia local en llama.cpp y derivados (Ollama, LM Studio) más que a entrenamiento o fine-tuning posterior por parte de terceros.

La model card describe el protocolo JEV (Judgment-Evaluation-Verification) como marco de decisión y menciona una "función de penalización agresiva del riesgo" que calibra la política hacia la preservación de capital. No se especifican el número de tokens de entrenamiento, la composición del dataset, la mezcla de datos sintéticos frente a reales, ni los hiperparámetros de PPO (clipping, coeficiente de entropía, número de pasos). Tampoco se documenta ninguna innovación de atención o decodificación; la única particularidad técnica reseñable es la fusión de LoRA tras el RL y la cuantización Q8_0 como único artefacto distribuido.

## Capacidades
- Emisión de veredictos de acción estructurados con cuatro claves: `BLOCK` (fraude con puntuación ≥ 0,70), `AUDIT` (abuso de reembolsos con puntuación ≥ 0,60), `ESCALATE` (riesgo legal o de cumplimiento) y `APPROVE` (señal de bajo riesgo verificada).
- Clasificación de riesgo de transacciones y reclamaciones con umbrales explícitos definidos en la propia model card.
- Razonamiento de decisión orientado a política (no conversacional), con salidas breves y accionables en lugar de texto extenso.
- Soporte de agentes y multiagente a través del ecosistema Connect AI Lab / Connect Tycoon, según las etiquetas del repositorio.
- Capacidades multilingües limitadas a inglés y coreano.
- Ejecución en local ("on-device") sin llamadas a API externas, con el objetivo declarado de latencia cero en hardware de borde.
- No se documentan capacidades de visión, audio, tool calling explícito ni modo de pensamiento extendido.

## Casos de uso
- Filtro previo a la autorización de pagos: el modelo recibe la señal de la transacción y devuelve `BLOCK` o `APPROVE` con umbral fijo (0,70), integrándose como paso determinista antes de la pasarela de pago y ejecutándose en local para no exponer datos de tarjeta a terceros.
- Auditoría de abuso de reembolsos: con umbral 0,60, suspende automáticamente la devolución y enruta el caso a un canal de investigación secundario, reduciendo la fuga por devoluciones fraudulentas recurrentes.
- Escalado de disputas y contracargos: cuando detecta riesgo legal o regulatorio, emite `ESCALATE` y deriva a un ejecutivo humano, lo que encaja en flujos de cumplimiento con trazabilidad de la decisión.
- Guardarraíl de agentes autónomos de compras: actúa como capa de verificación entre el agente y la ejecución de la operación, bloqueando acciones de alto riesgo sin necesidad de un modelo mayor en la nube.
- Despliegue en comercio de proximidad o pymes sin infraestructura cloud: al caber en un binario GGUF de 1,6 GB y ejecutarse en Ollama o LM Studio, permite disponer de un motor de decisión en un portátil o mini-PC sin GPU dedicada.
- Prototipado de políticas de riesgo para "solopreneurs": permite simular y ajustar reglas de bloqueo y auditoría sobre datos históricos antes de comprometerse con un proveedor de fraude comercial.
- Evaluación de cumplimiento en fintech regulada: la licencia Apache 2.0 y la ejecución local facilitan auditorías internas del binario y de las decisiones emitidas, aunque la ausencia de evaluación independiente limita su uso como control único.

## Benchmarks y rendimiento
La model card reporta una validación sobre 713 transacciones reales no vistas (177 intentos de fraude confirmados) y 40 meses de operación empresarial estocástica. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Baseline basado en reglas | CHOCO-BRAIN_GUARD-v1 | Ventaja declarada |
|---|---|---|---|
| Ataques de fraude detectados | 138 / 177 | 158 / 177 | +20 fraudes bloqueados |
| Pérdida financiera prevenida | 68 % | 88 % de reducción | +20 puntos porcentuales |
| Beneficio operativo mensual | 3,05 M KRW/mes | 10,62 M KRW/mes | +248 % |

Estos datos proceden exclusivamente del autor y no se acompañan de una evaluación independiente, de la metodología de muestreo de las 713 transacciones ni de intervalos de confianza; deben interpretarse como indicativos y no como validación externa.

## Requisitos de hardware
- VRAM estimada: al tratarse de un GGUF Q8_0 de 752 M de parámetros, el peso de los pesos ronda los 0,8 GB; con overhead de contexto y runtime, es razonable esperar menos de 2 GB de memoria, aunque el autor no publica cifras oficiales.
- GPU recomendadas: no disponible en la documentación; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) es sobradamente suficiente, y también CPU.
- Cabe en GPU consumer: sí, con amplio margen; incluso en iGPU y en CPU de portátil.
- Opciones de despliegue: Ollama, LM Studio y llama.cpp, según la model card. No se menciona soporte de vLLM ni TGI para este artefacto GGUF.
- Latencia y throughput: el autor declara "zero-latency" y veredictos en 0,05 segundos en hardware de borde, pero no se especifica el hardware de referencia ni el método de medición; no verificable de forma independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| connectailab-rl-CHOCO-BRAIN_GUARD-v1-GGUF | 752 M | no disponible | Guardarraíl de decisión fintech (RL/PPO + LoRA) | Apache 2.0 | GGUF Q8_0 |
| Qwen/Qwen3.5-0.8B (base) | ~752 M | no disponible | LLM generalista conversacional | Apache 2.0 | safetensors y derivados |
| Llama Guard (familia Meta) | no disponible | no disponible | Clasificación de seguridad de contenido | Llama Community License | safetensors, GGUF |
| Modelos de fraude basados en reglas o gradient boosting | no aplica | no aplica | Scoring tabular de fraude | Propietaria habitual | no aplica |

La comparación con Llama Guard es solo categórica: este modelo aborda riesgo financiero y de negocio, no seguridad de contenido conversacional. Frente al Qwen3.5-0.8B base, la diferencia es de especialización y formato, no de escala.

## Limitaciones y advertencias
- Documentación técnica incompleta: no se publican tokens de entrenamiento, composición del dataset, hiperparámetros de PPO ni detalles del protocolo JEV más allá de los umbrales.
- Los benchmarks son autoinformados, sin evaluación independiente ni metodología reproducible; el "+248 % de beneficio" no debe tomarse como garantía.
- Idiomas limitados a inglés y coreano; no hay soporte declarado de castellano, lo que restringe su uso directo en mercados hispanohablantes.
- Longitud de contexto no especificada, lo que impide planificar casos con historiales largos de transacciones o conversaciones multi-turno.
- Riesgo de alucinación no evaluado: aunque el modelo se presenta como determinista, no se documentan pruebas de robustez ante entradas adversariales o fuera de distribución.
- Posibles sesgos derivados de los datos de entrenamiento (no descritos) y de la función de penalización agresiva, que puede favorecer falsos positivos de bloqueo y afectar a clientes legítimos.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre decisiones financieras automatizadas recae en el integrador; conviene mantener revisión humana en `BLOCK` y `ESCALATE`.
- Solo se distribuye GGUF Q8_0; no hay safetensors del modelo afinado, lo que dificulta el fine-tuning posterior y la inspección de pesos.
- El repositorio tiene 1008 descargas y 0 likes, con fecha de creación en octubre de 2026: madurez y adopción aún muy limitadas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub de Hwihwa Lab: https://github.com/Hwihwa-Lab
- Repositorio Connect Tycoon (banner y documentación referenciada): https://github.com/wonseokjung/connect-tycoon
- Documentación en coreano: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-GGUF/blob/main/README_KR.md
- Licencia: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-GGUF/blob/main/LICENSE
