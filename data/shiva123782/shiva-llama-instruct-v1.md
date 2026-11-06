# shiva123782/Shiva-Llama-Instruct-v1

## Resumen

Shiva-Llama-Instruct-v1 es un ajuste fino (fine-tuning) del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 bajo la organización shiva-ai-labs. A pesar del nombre comercial, no deriva de la familia Llama sino de la arquitectura Qwen2, concretamente del decodificador transformer de 0,5 mil millones de parámetros de Alibaba. El modelo se ha entrenado sobre el corpus timdettmers/openassistant-guanaco mediante una cuantización QLoRA de 4 bits en formato NormalFloat (NF4), con una pérdida de entrenamiento declarada de 0,842.

El problema que declara resolver es el de la preservación de identidad y la robustez frente a ataques de tipo jailbreak, mediante lo que el autor denomina "Identity Firewall" y verificaciones formales con el solver SMT Z3. La model card incluye afirmaciones de haber superado mil millones de tests de identidad y 200 millones de tests adversarios, aunque estos resultados no están verificados de forma independiente y proceden únicamente del autor.

Por tamaño (0,5B parámetros) y contexto heredado de Qwen2.5 (32 768 tokens), se posiciona en la categoría de modelos ultraligeros para inferencia local en CPU o GPU de gama baja. Es relevante como ejemplo de fine-tuning con QLoRA sobre una base pequeña, pero sus afirmaciones de "production frontier model" y certificaciones de cumplimiento del EU AI Act deben tomarse con cautela: el repositorio tiene 0,0 GB de tamaño declarado y 485 descargas, lo que sugiere que los pesos completos podrían no estar presentes en el repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Qwen2) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-0.5B-Instruct soporta 32 768 tokens) |
| Tipos de cuantizacion | 4-bit NormalFloat (NF4) QLoRA; se mencionan GGUF y llama.cpp en los tags |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); se mencionan GGUF y llama.cpp en tags |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder causal con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU, típico de la familia Qwen2. La innovación declarada no está en la arquitectura sino en el proceso de ajuste: QLoRA con cuantización NF4 de 4 bits, entrenado sobre el dataset openassistant-guanaco (conversaciones de instrucciones) y con una pérdida final de 0,842. El autor menciona el uso de "KaveriAI Autonomous Studio" como plataforma de entrenamiento, sin más detalles técnicos sobre hiperparámetros, número de tokens vistos o composición exacta del dataset.

La parte más llamativa de la model card son las afirmaciones de verificación formal: pruebas con el solver Z3 sobre invariantes de memoria (UNSAT en 10^9 estados), un "Identity Firewall" basado en BLA Counter-REA para bloquear jailbreaks, y baterías de tests de identidad (1K, 1 lakh, 1 crore, 20 crore, 1 billion). No se aporta información sobre RLHF, DPO ni decodificación especulativa. Los artefactos JSON de estas pruebas se enlazan en el repositorio, pero no hay evidencia independiente de su validez ni de que correspondan a evaluaciones estándar de la comunidad.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés, heredadas del ajuste sobre openassistant-guanaco.
- Razonamiento multi-turno básico, limitado por el tamaño de 0,5B parámetros.
- Soporte declarado de tool calling y function calling a través de los tags `vllm`, `sglang` y `ollama`, aunque no se documenta el formato exacto de las plantillas.
- Compatibilidad con despliegue en vLLM, SGLang, Ollama, LM Studio, llama.cpp y text-generation-inference.
- Capacidades multilingües limitadas al inglés según el campo `language: en`.
- Modo "identity firewall" para preservar la identidad del modelo frente a intentos de override de sistema (declarado por el autor, no verificado).
- No se declaran capacidades de visión, audio ni modos de razonamiento extendido (thinking).

## Casos de uso

- **Prototipado rápido de asistentes conversacionales en local**: al ser un modelo de 0,5B en 4 bits, cabe en cualquier portátil y permite iterar sobre prompts y plantillas de chat sin coste de API. Adecuado para validar flujos antes de escalar a modelos mayores.
- **Chatbots de soporte de bajo coste en inglés**: con 32 768 tokens de contexto heredados de Qwen2.5, puede mantener conversaciones multi-turno con historial largo en escenarios de FAQ y atención al cliente sencilla, donde la latencia y el coste importan más que la precisión fina.
- **Generación de texto en dispositivos edge**: su tamaño permite ejecutarlo en Raspberry Pi, móviles de gama alta o navegadores vía WebGPU/llama.cpp, útil para asistentes offline o aplicaciones de privacidad estricta.
- **Fine-tuning educativo y experimentación con QLoRA**: sirve como caso de estudio reproducible de ajuste con cuantización NF4 sobre un dataset público, útil para cursos y tutoriales de IA open source.
- **Pruebas de robustez frente a jailbreaks**: el "Identity Firewall" declarado lo hace candidato para experimentar con defensas de prompt injection y comparar su comportamiento con el modelo base sin ajustar.
- **Generación de datos sintéticos de bajo coste**: puede producir pares pregunta-respuesta en inglés para aumentar datasets de entrenamiento de modelos mayores, siempre con revisión humana por el riesgo de alucinación.
- **Integración en pipelines de CI/CD para pruebas de regresión de chat**: al ser ligero y determinista con temperatura 0, se puede usar como "modelo canario" para verificar que los cambios en plantillas de prompt no rompen el formato de salida.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Verificado |
|---|---|---|
| Training Loss (openassistant-guanaco) | 0,842 | No |
| SMT Memory Invariant (Z3) | UNSAT (10^9 estados probados) | No |
| Identity Invariant | 100,00 % | No |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. Las métricas anteriores son artefactos internos del autor y no permiten comparación directa con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en 4 bits, aproximadamente 0,4-0,6 GB; en fp16, alrededor de 1 GB. El modelo base Qwen2.5-0.5B-Instruct en fp16 ocupa ~1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100). En la práctica, una CPU moderna con 4-8 GB de RAM es suficiente.
- **Cabe en GPU consumer**: sí, en todas las GPU consumer de los últimos diez años, incluidas integradas con memoria compartida.
- **Opciones de despliegue**: transformers + PEFT (adaptadores LoRA), vLLM, SGLang, llama.cpp, Ollama, LM Studio, text-generation-inference. Los tags del repo indican compatibilidad con todos ellos, aunque no se documentan los artefactos GGUF concretos.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Por el tamaño, se espera un throughput de cientos a miles de tokens por segundo en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shiva-Llama-Instruct-v1 | 0,5B | no disponible (base: 32 768) | Apache 2.0 | Hugging Face, 485 descargas |
| Qwen2.5-0.5B-Instruct | 0,5B | 32 768 | Apache 2.0 | Hugging Face, ampliamente usado |
| SmolLM2-360M-Instruct | 0,36B | 8 192 | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | 1,1B | 2 048 | Apache 2.0 | Hugging Face |

El modelo base Qwen2.5-0.5B-Instruct es la referencia directa: mismo tamaño, mismo contexto y misma licencia, pero con evaluación pública y comunidad activa. SmolLM2-360M-Instruct es una alternativa aún más ligera para edge. TinyLlama-1.1B-Chat ofrece el doble de parámetros con contexto mucho menor. No hay benchmarks comparables publicados para Shiva-Llama-Instruct-v1 que permitan afirmar una mejora sobre su base.

## Limitaciones y advertencias

- **Afirmaciones no verificadas**: las certificaciones de "1 billion identity tests", "20 crore adversarial tests blocked" y "EU AI Act Tier-1 compliant" proceden únicamente del autor y no cuentan con verificación independiente. No deben usarse como garantía en producción.
- **Riesgo de alucinación**: con 0,5B parámetros, la tasa de alucinación es alta en tareas de conocimiento factual, matemáticas y razonamiento complejo.
- **Idioma**: solo se declara inglés (`language: en`); el rendimiento en castellano será limitado y no evaluado.
- **Contexto**: aunque el base soporta 32 768 tokens, la model card no confirma el contexto efectivo tras el ajuste; conviene validarlo empíricamente.
- **Sesgos**: el dataset openassistant-guanaco contiene sesgos de sus fuentes originales; no se documenta ningún proceso de mitigación.
- **Licencia**: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar también los términos del modelo base y de los datasets empleados.
- **Repositorio**: tamaño declarado de 0,0 GB y 485 descargas; los pesos o adaptadores podrían no estar completos en el repo, lo que impediría su uso directo.
- **Nombre engañoso**: se llama "Llama" pero deriva de Qwen2; no debe confundirse con la familia Llama de Meta.
- **Caveat de producción**: no hay información sobre evaluación de seguridad estándar (toxicity, red-teaming independiente) ni sobre latencia medida; no se recomienda para aplicaciones críticas sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/Shiva-Llama-Instruct-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/timdettmers/openassistant-guanaco
- Informe de tests Kaveri: https://huggingface.co/shiva123782/Shiva-Llama-Instruct-v1/raw/main/Kaveri-Test-Report.json
- Informe de identidad Kaveri: https://huggingface.co/shiva123782/Shiva-Llama-Instruct-v1/raw/main/Kaveri-Identity-Test-Report.json
- Verificación del Identity Firewall: https://huggingface.co/shiva123782/Shiva-Llama-Instruct-v1/raw/main/Identity-Firewall-Verification.json
- Prueba formal Z3: https://huggingface.co/shiva123782/Shiva-Llama-Instruct-v1/raw/main/Z3-Formal-Proof-1B-Invariants.json
- Notebook de ejemplo: https://huggingface.co/shiva123782/Shiva-Llama-Instruct-v1/raw/main/Shiva_Llama_Instruct_v1.ipynb
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Ollama: https://ollama.com
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
