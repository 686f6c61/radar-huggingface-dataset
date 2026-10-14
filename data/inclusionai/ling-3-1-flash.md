# inclusionAI/Ling-3.1-flash

## Resumen

Ling-3.1-flash es un modelo de lenguaje de tipo mezcla de expertos (MoE) con razonamiento híbrido, desarrollado por inclusionAI (grupo Ant), que se presenta como una evolución de Ling-3.0-flash orientada a tareas del mundo real. El modelo combina 560.000 millones de parámetros totales con 25.000 millones de parámetros activos por token, lo que permite desplegarlo con un coste de cómputo por token muy inferior al de un modelo denso de tamaño equivalente.

La innovación arquitectónica principal es un diseño híbrido que alterna capas de atención lineal KDA (Kimi Delta Attention) con capas de atención Gated MLA en una proporción 7:1 (63 capas KDA y 9 capas Gated MLA), lo que reduce el coste de la ventana de contexto larga. El modelo declara una ventana de contexto de 1 millón de tokens en la model card, aunque proveedores de inferencia como OpenRouter anuncian 262.144 tokens de contexto con 262.144 tokens de salida máxima; esta discrepancia conviene verificarla antes de integrarlo en producción.

Es relevante ahora porque ataca directamente tareas agénticas y de productividad real (agentes generales, búsqueda, ofimática, ingeniería de software y uso de terminal), con soporte para tool calling, modo de razonamiento activable y decodificación especulativa MTP/NEXTN. La licencia MIT y la disponibilidad en HuggingFace y OpenRouter lo hacen atractivo para despliegues comerciales, aunque su huella de memoria (573,8 GB de repositorio, pesos en FP8) exige hardware de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida lineal (63 capas KDA + 9 capas Gated MLA, ratio 7:1; 4 capas densas) |
| Parametros totales | 560.000 millones (572.120.680.768 según safetensors) |
| Parametros activos | 25.000 millones por token |
| Longitud de contexto | 1.000.000 de tokens (model card); 262.144 tokens según OpenRouter |
| Tipos de cuantizacion | FP8 (pesos publicados en FP8); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8), custom_code |
| Cabezas de atencion | 64 |
| Hidden size | 4096 |
| Expertos enrutados | 512 (8 activados) + 1 experto compartido |
| Tamano intermedio de experto | 1280 |
| Tamano intermedio denso | 10240 |
| Tamano de vocabulario | 157184 |
| Pipeline | text-generation |
| Tamano del repositorio | 573,8 GB |

## Arquitectura y entrenamiento

Ling-3.1-flash es un transformer MoE con atención híbrida. El bloque se compone de 72 capas transformer en total, de las cuales 63 son capas KDA (lineales) y 9 son capas Gated MLA, manteniendo una proporción 7:1 que reduce el coste computacional y de memoria de la ventana de contexto. Añade 4 capas densas. La capa MoE emplea enrutamiento con 512 expertos enrutados y 1 experto compartido, activando 8 expertos por token, con un tamaño intermedio de experto de 1280 y un tamaño intermedio denso de 10240. La dimensión oculta es 4096 y el vocabulario alcanza 157.184 entradas.

El modelo se describe como un modelo de razonamiento híbrido nativo, es decir, permite activar o desactivar el modo de pensamiento mediante el parámetro `enable_thinking` del chat template. Incorpora decodificación especulativa MTP/NEXTN, integrada en la imagen de SGLang, y optimizaciones de decodificación para arquitecturas Hopper (variables `SGLANG_ENABLE_FP8_BLOCK_GEMV` y `SGLANG_ENABLE_FUSED_KDA_OUTPUT_QUANT`, con aproximadamente un 10 % más de velocidad en decodificación con batch 1). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento híbrido, con modo de pensamiento activable mediante `chat_template_kwargs.enable_thinking`.
- Razonamiento agéntico multi-paso y de horizonte largo (cientos de rondas de tool calls con compactación de contexto repetida, según el harness LingCode).
- Tool calling y function calling, con parsers específicos en vLLM (`ling3` como tool-call-parser y reasoning-parser).
- Uso de terminal y herramientas de línea de comandos (evaluado en Terminal-Bench 4.0).
- Ingeniería de software y tareas de repositorio (evaluado en SWE-bench Pro y FrontierSWE).
- Productividad ofimática y tareas de oficina (evaluado en GDPVal-AA V2.1).
- Dominio sanitario (HealthBench Professional) y financiero.
- Integración declarada con frameworks de agentes de código: Claude Code, Kilo Code, Qwen Code, Hermes Agent y OpenClaw.
- Capacidades multilingües: no disponible.
- Visión y audio: no disponible.

## Casos de uso

- Atención al cliente automatizada: con 1M de tokens de contexto (según la model card), el modelo puede mantener conversaciones multi-turno muy largas y consultar documentación extensa sin truncar, manteniendo coherencia a lo largo de sesiones prolongadas.
- Agentes de codificación en producción: soporta tool calling y se integra en Claude Code, Kilo Code, Qwen Code y Hermes Agent, por lo que puede conectarse a pipelines de CI/CD para generar parches, ejecutar tests y resolver incidencias de repositorio de forma autónoma.
- Automatización de tareas de terminal y DevOps: evaluado en Terminal-Bench 4.0, es adecuado para agentes que ejecutan comandos shell, diagnostican entornos y aplican correcciones en servidores.
- Asistentes de productividad ofimática: con resultados declarados en GDPVal-AA V2.1, puede redactar, resumir y transformar documentos largos, hojas de cálculo y flujos administrativos con uso de herramientas.
- Búsqueda aumentada sobre corpus extensos: la ventana de contexto larga y el modo de razonamiento permiten razonar sobre grandes volúmenes de documentos recuperados en un único contexto, útil para motores de respuesta empresarial.
- Soporte en dominios regulados: los resultados declarados en HealthBench Professional y en el dominio financiero lo orientan a asistentes de apoyo clínico-administrativo y análisis financiero con supervisión humana.
- Ejecución de flujos agénticos vía API gestionada: disponible en OpenRouter con precios de 0,075 USD por millón de tokens de entrada y 0,225 USD por millón de salida, lo que permite prototipar sin infraestructura propia.

## Benchmarks y rendimiento

La model card menciona evaluación en GDPVal-AA V2.1, HealthBench Professional, FrontierSWE, Terminal-Bench 4.0, SWE-bench Pro, Automationbench, MCP-Atlas y SkillsBench, pero no se han publicado en la información disponible los valores numéricos de estos benchmarks. Se indica que Ling-3.1-flash mejora respecto a Ling-3.0-flash en tareas del mundo real.

No se han publicado resultados de benchmarks numéricos (MMLU, HumanEval, GSM8K y similares) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 560 GB; el repositorio completo pesa 573,8 GB, por lo que no cabe en una sola GPU de centro de datos convencional.
- Configuraciones verificadas según el autor: 8x H200 con paralelismo de tensor 8 y paralelismo de expertos 8 (TP8 + EP8); 4x GB300 con TP4 + EP4. También se citan recetas verificadas para H800, H100 y B200.
- GPU recomendadas: H200, GB300, B200, H100, H800. El uso de FP8 y las optimizaciones Hopper sugieren que H100/H200 son el objetivo principal.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090 y similares); el tamaño de pesos en FP8 supera ampliamente los 24 GB de una RTX 4090 y los 48 GB de una RTX 6000 Ada.
- Opciones de despliegue: SGLang (recomendado, imagen `lmsysorg/sglang:dev-ling-3.1-flash` con soporte day-0, decodificación especulativa NEXTN y optimizaciones Hopper) y vLLM (compilación desde la rama `vllm`). Ollama, llama.cpp y TGI no aparecen citados en la información disponible.
- Parámetros de sampling recomendados: temperature 1.0, top_p 0.95, top_k 20, con `enable_thinking` activado para mejor rendimiento.
- Latencia y throughput: no se proporcionan cifras concretas; solo la mejora aproximada del 10 % en decodificación con batch 1 al activar las optimizaciones Hopper.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ling-3.1-flash | 560B / 25B | 1M (card) / 262.144 (OpenRouter) | MIT | HuggingFace, OpenRouter, ModelScope |
| DeepSeek-V3 | 671B / 37B | 128K | Licencia propia DeepSeek | HuggingFace |
| Qwen3-235B-A22B | 235B / 22B | 128K (extensible) | Apache 2.0 | HuggingFace, ModelScope |
| Kimi K2 | 1T / 32B | 128K | MIT modificada | HuggingFace |

Los datos de rendimiento comparado no están disponibles en la información proporcionada. La comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Discrepancia de contexto: la model card declara 1M de tokens, mientras que OpenRouter anuncia 262.144 tokens. Es necesario verificar la ventana real antes de diseñar flujos que dependan de un contexto muy largo.
- Idiomas soportados: no disponibles en la información proporcionada; no se puede garantizar un rendimiento multilingüe equilibrado.
- Sesgos conocidos: no se documentan en la información disponible.
- Riesgo de alucinación: no se documenta mitigación específica; como en cualquier LLM, conviene validar las salidas en dominios sensibles (sanitario, financiero).
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribución de copyright y aviso de licencia; no se declaran restricciones adicionales.
- Requiere `trust_remote_code` y código personalizado (`custom_code`), lo que implica ejecutar código del repositorio y revisar su contenido por seguridad.
- Huella de hardware muy alta: 573,8 GB de repositorio y pesos FP8 de ~560 GB, lo que limita el despliegue a clústeres con múltiples aceleradores H100/H200/GB300/B200.
- El harness LingCode, usado en las evaluaciones de codificación, no está confirmado como open source ("we are considering open-sourcing it in the future"), por lo que los resultados que dependen de él no son reproducibles con las herramientas públicas actuales.
- No se han publicado detalles de entrenamiento (tokens, dataset, RLHF/DPO), lo que dificulta auditar su comportamiento.

## Enlaces

- HuggingFace: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Organización en HuggingFace: https://huggingface.co/inclusionAI
- ModelScope: https://modelscope.cn/organization/inclusionAI
- OpenRouter: https://openrouter.ai/inclusionai/ling-3.1-flash
- Cookbook de SGLang para Ling-3.1-flash: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.1-flash
- Repositorio de vLLM (rama vllm): https://github.com/vllm-project/vllm
- Ficha en benchable.ai: https://benchable.ai/models/inclusionai/ling-3.1-flash-20261002
- Ficha en llm-stats.com: https://llm-stats.com/models/ling-3.1-flash
- Ficha en neura.market: https://www.neura.market/models/inclusionai-ling-3-1-flash
