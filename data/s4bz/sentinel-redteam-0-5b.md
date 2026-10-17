# s4bz/sentinel-redteam-0.5b

## Resumen

Sentinel-RedTeamer 0.5B es un adaptador LoRA de generacion de texto afinado sobre Qwen/Qwen2.5-0.5B-Instruct, publicado por el autor s4bz (Jeya Sabarinath R) bajo licencia MIT. El modelo esta especializado en tareas de seguridad ofensiva aplicada a aplicaciones basadas en LLM: sintesis de payloads adversariales, auditoria de prompt injection segun el OWASP Top 10 para LLM, extraccion de system prompts, exfiltracion de tokens canary y evasion de jailbreaks. Se presenta como el motor adversarial de la plataforma Sentinel AI Data Securer.

La propuesta es inusual: en lugar de un clasificador defensivo que se limita a marcar texto malicioso, el modelo se plantea como un pentester autonomo que genera sondas adaptativas y, cuando un objetivo rechaza un ataque, calcula un pivote de segundo turno (ataque Crescendo). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, coherente con un adaptador PEFT y no con pesos completos.

Conviene senalar una discrepancia importante: la model card describe repetidamente un modelo "Sentinel-RedTeamer-7B" basado en Qwen2.5-7B-Instruct, mientras que el identificador del repositorio y el campo base_model apuntan a Qwen2.5-0.5B-Instruct. Los datos de entrenamiento citados (QLoRA 4-bit, rango 16, alpha 32, 450+ secuencias) corresponden a ese pipeline descrito para el 7B y no se confirman para la variante 0.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 0,49 B del modelo base (aprox., Qwen2.5-0.5B) mas el adaptador LoRA (parametros del adaptador no disponibles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-0.5B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (la model card menciona QLoRA NF4 durante entrenamiento y GGUF para Ollama, pero no se listan cuantizaciones publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF mencionado pero no publicado |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de aproximadamente 0,49 B de parametros, con atencion causal estandar, RoPE y soporte de plantilla de chat. Sobre el se aplica un adaptador LoRA, por lo que el repositorio solo contiene los pesos del adaptador y requiere cargar el modelo base por separado mediante PEFT. No hay evidencia en la informacion proporcionada de modificaciones arquitectonicas adicionales (no hay MoE, SSM ni atencion lineal).

El pipeline de entrenamiento descrito en la model card (que corresponde al modelo 7B, no necesariamente a esta variante) emplea QLoRA de 4 bits con cuantizacion NF4, rango de LoRA 16 y alpha 32, sobre un dataset de 450+ secuencias adversariales multi-turno sintetizadas. El metodo de alineacion es fine-tuning supervisado sobre datos de red-teaming; no se menciona RLHF ni DPO. Entre las innovaciones funcionales destacadas estan la sintesis de sondas resistentes a evasion y el pivote adaptativo tipo Crescendo ante rechazos del objetivo.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat tipo instruct.
- Sintesis de payloads de prompt injection directa: escape de delimitadores, sobrecarga cognitiva y anulacion de instrucciones.
- Extraccion de system prompts mediante trucos de traduccion inversa, trampas de esquema JSON y continuacion de prefijos.
- Sondas de exfiltracion de tokens canary (multi-turno) contra secretos sinteticos.
- Generacion de jailbreaks: personalidades duales, reencuadre academico y sandboxes hipoteticos.
- Envenenamiento de argumentos de herramientas/MCP (inyeccion de comandos, SQL injection, path traversal).
- Diagnostico de rechazos y calculo de pivotes adaptativos (ataque Crescendo) en segundo turno.
- Generacion de guia de remediacion y configuracion de guardrails junto a cada vulnerabilidad diagnosticada.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Auditoria de aplicaciones LLM en preproduccion: generar de forma sistematica un conjunto de sondas OWASP LLM01-LLM10 contra un chatbot corporativo y registrar que entradas provocan fugas o anulaciones de instrucciones.
- Pruebas de fuga de system prompt: evaluar si un asistente revela sus instrucciones internas usando trampas de traduccion inversa y continuacion de prefijos antes de exponerlo a usuarios reales.
- Validacion de mecanismos de defensa: medir la tasa de exito de guardrails y filtros de entrada/salida frente a payloads de evasión generados dinamicamente.
- Formacion de equipos de seguridad: construir un banco de ejemplos adversariales etiquetados para entrenar a analistas en tecnicas de prompt injection y jailbreak.
- Evaluacion de agentes con herramientas: comprobar si un agente que invoca funciones externas es vulnerable a manipulacion de argumentos (inyeccion de comandos o path traversal) a traves de la entrada del usuario.
- Deteccion de fugas de secretos sinteticos: desplegar tokens canary en un entorno controlado y verificar si el modelo objetivo es capaz de exfiltrarlos en conversaciones multi-turno.
- Generacion de material de remediacion: producir recomendaciones concretas de mitigacion y configuracion de guardrails a partir de cada vulnerabilidad encontrada, integrables en un informe de auditoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bf16/fp16; en torno a 0,3-0,5 GB con cuantizacion de 4 bits (estimacion a partir del tamano del modelo base de 0,49 B; no confirmada por el autor).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; tambien es viable en CPU por el reducido tamano del modelo base.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 y cualquier iGPU reciente con suficiente memoria compartida.
- Opciones de despliegue: transformers + PEFT (ruta oficial en la model card), y potencialmente llama.cpp/Ollama tras conversion a GGUF (mencionado, pero no publicado). vLLM y TGI no confirmados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentinel-RedTeamer 0.5B | 0,49 B + LoRA | 32.768 (heredado) | Adaptador de red-teaming | MIT | HuggingFace (0 descargas) |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 | Instruct generalista | Apache 2.0 (segun el modelo base) | HuggingFace, ampliamente distribuido |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Instruct generalista | Llama 3.2 Community License | HuggingFace |
| Clasificadores defensivos de prompt injection (p. ej. variantes tipo Granite Guardian) | Variable | Variable | Clasificador defensivo | Variable | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Sentinel-RedTeamer 0.5B frente a estas alternativas.

## Limitaciones y advertencias

- Discrepancia en la model card: el texto describe un modelo de 7B (Sentinel-RedTeamer-7B, base Qwen2.5-7B-Instruct) mientras que el repositorio corresponde a 0.5B (base Qwen2.5-0.5B-Instruct). Las capacidades y el pipeline descritos pueden no corresponder a esta variante.
- Modelo orientado exclusivamente al ingles; no hay soporte multilingue declarado.
- Repositorio sin descargas ni likes en el momento de la consulta y tamano de 0.0 GB, por lo que no hay validacion comunitaria ni evidencia publica de calidad.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion inherente a un modelo de 0,49 B; sus payloads y recomendaciones de remediacion deben revisarse manualmente.
- Sesgos: no documentados; al derivar de un modelo instruct generalista puede reproducir sesgos del corpus de Qwen.
- Uso dual: el modelo esta disenado para generar contenido ofensivo. Su uso contra sistemas de terceros sin autorizacion explicita puede ser ilegal. La propia model card exige autorizacion, uso de tokens canary sinteticos y registro/limitacion de tasa.
- Licencia MIT en el adaptador, pero conviene verificar los terminos del modelo base Qwen2.5-0.5B-Instruct antes de uso comercial.
- Al ser un adaptador LoRA, el despliegue requiere cargar el modelo base por separado, lo que aumenta la complejidad operativa y el consumo de memoria frente a un modelo unico.
- Soporte de tool calling y de agentes multi-paso no confirmado.
- Idiomas distintos del ingles no soportados de forma fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s4bz/sentinel-redteam-0.5b
- Perfil del autor: https://huggingface.co/s4bz
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de la plataforma Sentinel (AI Data Securer): https://github.com/s4bztories/ai-data-securer
- SENTINEL RED, suite de red-teaming: https://sentinelred.dev/
- Lista de modelos ofensivos open-weight: https://github.com/JoasASantos/Offensive-Security-AI-Models
- Recopilacion de herramientas de AI red teaming: https://www.marktechpost.com/2026/04/17/top-ai-red-teaming-tools/
