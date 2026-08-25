# oktayd/Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision-FreeToken

## Resumen

Este modelo es un derivado comunitario de Qwen3.6-35B-A3B, un MoE multimodal de Alibaba con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token. El autor, oktayd, ha aplicado una cadena de intervenciones sobre el checkpoint base `huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated`: primero una abliteración adicional (reducción de rechazos), después dos intervenciones específicas de dirección de refusal (Heretic y OBLITERATUS Nuclear), y finalmente un ajuste fino supervisado (SFT) con datasets de function calling y trazas de razonamiento agéntico de la familia Hermes, más una mezcla de coding. El resultado es un modelo orientado a uso agéntico y tool calling, con la capa de visión y el predictor multi-token (MTP/NextN) preservados.

La relevancia actual radica en que combina la eficiencia del MoE de Qwen3.6 (solo ~3B activos) con un comportamiento de razonamiento heredado de la destilación de Claude 4.7 Opus, y con una alineación reducida que elimina muchos rechazos. Está pensado para desarrolladores que necesitan un modelo local con capacidades de agente, coding y visión, bajo licencia Apache 2.0. El contexto nativo es de 262 144 tokens, con un techo extendido declarado de hasta ~1 010 000 tokens, aunque el autor advierte que esa cifra es una capacidad de arquitectura y no ha sido re-benchmarked en este derivado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con encoder de visión (familia `qwen3_5_moe` / Qwen3.6) |
| Parametros totales | 35 107 181 936 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262 144 nativo; hasta ~1 010 000 extendido (no validado en este derivado) |
| Tipos de cuantizacion | no disponible (repo publicado en BF16 safetensors) |
| Idiomas soportados | en (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.6-35B-A3B: un transformer causal con enrutamiento de expertos de grano fino, 256 expertos enrutados de los cuales 8 se activan por token, más 1 experto compartido. El tamaño oculto es 2048, con 40 capas de texto y un tamaño intermedio de experto de 512. Incluye un encoder de visión que se ha preservado íntegramente (333 tensores protegidos, 0 discrepancias) y un módulo de predicción multi-token (MTP/NextN) también preservado (19 tensores protegidos). El entrenamiento del derivado consistió en: (1) partir de un checkpoint ya abliterado de Huihui, (2) aplicar una intervención Heretic adaptada a la disposición de expertos del MoE, (3) aplicar una intervención OBLITERATUS Nuclear adicional, y (4) realizar un SFT con los datasets `NousResearch/hermes-function-calling-v1` y `lambda/hermes-agent-reasoning-traces`, más una mezcla preparada de coding, terminal, archivos y repositorios. El ajuste se hizo mediante LoRA/PEFT con Unsloth y posteriormente se fusionaron los adaptadores en el checkpoint final BF16. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento multi-paso, con comportamiento de razonamiento heredado de la destilación de Claude 4.7 Opus (según la línea del checkpoint upstream).
- Function calling y tool use estructurado, gracias al SFT con Hermes function calling.
- Capacidades agénticas: uso de herramientas en múltiples pasos, razonamiento sobre trazas de agente.
- Coding agéntico: manejo de terminal, archivos, repositorios y flujos multi-herramienta.
- Visión: el encoder de visión se ha preservado, permitiendo entrada imagen-texto (pipeline `image-text-to-text`).
- Predicción multi-token (MTP/NextN) preservada, que puede acelerar la decodificación en backends compatibles.
- Multilingüe: la model card declara únicamente inglés, aunque el modelo base Qwen3.6 soporta más idiomas; este derivado no los garantiza.

## Casos de uso

- Agente de coding autónomo: el modelo puede integrarse en un entorno de desarrollo con herramientas de terminal, edición de archivos y control de repositorios, ejecutando tareas de depuración y refactorización de forma multi-paso gracias a su SFT agéntico y su ventana de contexto de 262K tokens.
- Asistente de atención al cliente con tool calling: puede gestionar conversaciones multi-turno, consultar bases de conocimiento o APIs externas mediante function calling, y mantener el contexto de la interacción durante largas sesiones.
- Análisis de imágenes con razonamiento: al preservar el encoder de visión, puede describir, clasificar o responder preguntas sobre imágenes combinando razonamiento textual y comprensión visual, útil en entornos de documentación técnica o moderación de contenido.
- Generación de código en pipelines de CI/CD: su capacidad de function calling permite conectarlo a sistemas de build y test, generando parches o sugerencias de corrección a partir de logs de error.
- Prototipado de agentes de investigación: con las trazas de razonamiento de Hermes, puede planificar y ejecutar búsquedas web o consultas a APIs en varios pasos, resumiendo resultados con razonamiento encadenado.
- Despliegue local de un asistente multimodal sin censura: para entornos de investigación donde se necesita un modelo sin rechazos frecuentes, con licencia Apache 2.0 y capacidad de ejecución en hardware consumer gracias a sus ~3B parámetros activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones para este derivado concreto. Se puede inferir que el rendimiento será similar al del modelo base Qwen3.6-35B-A3B, que según el blog de Alibaba supera a su predecesor Qwen3.5-35B-A3B en tareas de agentic coding, pero no hay datos verificables para esta variante.

## Requisitos de hardware

- El checkpoint BF16 completo ocupa aproximadamente 71.9 GB (35B parámetros × 2 bytes), por lo que se necesita una GPU con al menos 80 GB de VRAM para cargarlo sin cuantizar (p. ej., A100 80GB, H100 80GB).
- Con cuantización a 4 bits (no publicada en el repo, pero posible mediante herramientas como llama.cpp o GPTQ), el modelo podría caber en GPUs consumer de 24 GB (RTX 3090/4090), aunque no se han proporcionado archivos cuantizados.
- Dado que solo ~3B parámetros están activos por token, la inferencia es rápida en términos de cómputo, pero el acceso a los pesos completos requiere mucha memoria.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se generan archivos GGUF), o transformers con el pipeline estándar. No se han publicado mediciones de latencia o throughput para este derivado.
- Para uso con visión y MTP, se recomienda verificar la compatibilidad del backend con el encoder de visión y el módulo NextN.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | ~35B | ~3B | 262K nativo | Apache 2.0 | Modelo original de Alibaba, con benchmarks publicados |
| Qwen3.5-35B-A3B (predecesor) | ~35B | ~3B | 262K nativo | Apache 2.0 | Superado por Qwen3.6 en agentic coding según Alibaba |
| Este derivado (oktayd) | ~35B | ~3B | 262K nativo | Apache 2.0 | Sin benchmarks publicados; añade abliteración, Heretic, OBLITERATUS y SFT Hermes |

No se dispone de datos comparativos de rendimiento entre este derivado y otros modelos de la misma categoría, ya que el autor no ha publicado evaluaciones.

## Limitaciones y advertencias

- El modelo ha sido sometido a intervenciones de reducción de rechazo (abliterated, Heretic, OBLITERATUS Nuclear). Esto implica que puede generar contenido dañino, ofensivo o inapropiado sin filtros de seguridad. No es adecuado para despliegues en producción orientados al público sin una capa de moderación externa.
- La model card declara únicamente inglés como idioma soportado; el uso en otros idiomas puede degradar la calidad.
- El contexto extendido de ~1M tokens es una capacidad de arquitectura heredada, no validada en este derivado. Se requiere prueba empírica por backend antes de usarlo con ventanas largas.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- El autor advierte que "Claude 4.7 Opus" se refiere a la línea de destilación de razonamiento del checkpoint upstream, no a un entrenamiento independiente sobre el modelo propietario de Anthropic.
- Aunque la licencia Apache 2.0 permite uso comercial, el contenido generado por el modelo puede incurrir en responsabilidades legales si se utiliza sin supervisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oktayd/Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision-FreeToken
- Modelo base (Huihui abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated
- Modelo original Qwen3.6-35B-A3B (Alibaba): https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Blog de Alibaba Cloud sobre Qwen3.6-35B-A3B: https://www.alibabacloud.com/blog/qwen3-6-35b-a3b-agentic-coding-power-now-open-to-all_603043
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset Hermes agent reasoning traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
