# harness-hub/LFM2.5-24B-A2B-claude-code-GGUF

## Resumen

LFM2.5-24B-A2B-claude-code-GGUF es la versión en formato GGUF de un adaptador LoRA entrenado por harness-hub sobre el modelo base LiquidAI/LFM2.5-24B-A2B, un modelo de lenguaje híbrido de arquitectura mezcla de expertos (MoE) de Liquid AI. El adaptador fue entrenado con aprendizaje por refuerzo dentro de Claude Code, el agente de programación de Anthropic, con el objetivo de mejorar el rendimiento del modelo en tareas de análisis de datos y uso de herramientas dentro de ese entorno de agente.

La particularidad de esta ficha es que se trata de un adaptador, no de un modelo completo: el archivo F16 en GGUF pesa unos 37 MB y debe ejecutarse sobre los pesos base de LiquidAI (también en GGUF) mediante llama.cpp. La propia model card reconoce de forma transparente que, tras 100 pasos de entrenamiento, no se midió ningún cambio respecto al modelo base, por lo que su valor práctico actual es más experimental que productivo. Aun así, es relevante como ejemplo documentado de cómo servir un modelo open source local a Claude Code a través de la API de mensajes de Anthropic implementada en llama-server.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LFM2.5-24B-A2B (MoE, base de Liquid AI) |
| Parametros totales | 24.000 millones (modelo base); 18.710.528 parametros de tensor en el repositorio del adaptador |
| Parametros activos | ~2.000 millones (base A2B, "active 2B"; no disponible confirmación oficial en la ficha) |
| Longitud de contexto | 65.536 tokens (valor usado en el comando de ejemplo con `--c 65536`) |
| Tipos de cuantizacion | El adaptador se distribuye en F16; el base se recomienda en Q8_0 o Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other", heredada de LiquidAI/LFM2.5-24B-A2B) |
| Formato de pesos | GGUF (adaptador LoRA convertido con `convert_lora_to_gguf.py`) |

## Arquitectura y entrenamiento

El modelo base, LFM2.5-24B-A2B de Liquid AI, es un modelo mezcla de expertos (MoE) con unos 24.000 millones de parametros totales y aproximadamente 2.000 millones activos por token, lo que reduce significativamente el coste de inferencia frente a un modelo denso equivalente. Sobre ese base se aplica un adaptador LoRA (Low-Rank Adaptation), una tecnica de ajuste eficiente que entrena matrices de bajo rango añadidas a los pesos originales sin modificar el modelo completo.

El entrenamiento se realizo con aprendizaje por refuerzo durante 100 pasos, utilizando como entorno de entrenamiento Claude Code, el agente de terminal de Anthropic, y el framework Harbor (de ahi el nombre del adaptador). El dominio de evaluacion fue el analisis de datos, con 100 tareas evaluadas en pass@1 y un ruido estimado de ±5 puntos. El resultado declarado por el autor es que no se midio ninguna mejora respecto al modelo base. El adaptador se convirtio a GGUF F16 desde el formato PEFT con el script `convert_lora_to_gguf.py` de llama.cpp, y fue entrenado sobre los pesos BF16 del base, por lo que se recomienda usar el base en Q8_0 para minimizar la desviacion del comportamiento aprendido.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base LFM2.5-24B-A2B.
- Tool calling / function calling: el adaptador esta pensado para agentes que dependen de llamadas a herramientas; en llama.cpp requiere la opcion `--jinja` para activarlo.
- Integracion con Claude Code: llama-server expone la API de mensajes de Anthropic, lo que permite usar el modelo como backend local de Claude Code mapeando los tres niveles de modelo (Opus, Sonnet, Haiku) al mismo alias.
- Ejecucion de tareas de analisis de datos en entornos de agente (dominio objetivo del entrenamiento con Harbor).
- Despliegue local y offline al completo, sin dependencia de APIs externas de pago.
- Cualquier capacidad adicional (vision, audio, thinking mode) no esta documentada en la informacion disponible.

## Casos de uso

- Backend local para Claude Code: el caso de uso principal y documentado; se sirve el modelo con `llama-server` y se redirige Claude Code mediante `ANTHROPIC_BASE_URL`, permitiendo sesiones de programacion agenticas sin salir de la maquina local.
- Experimentacion con RL en agentes: al publicar el pipeline completo (entrenamiento con Harbor en Claude Code, conversion a GGUF y evaluacion), sirve como referencia reproducible para quien quiera ajustar modelos open source con refuerzo en entornos agenticos.
- Pruebas de tool calling con llama.cpp: el comando de ejemplo con `--jinja` y contexto de 65.536 tokens es un punto de partida util para validar que el flujo de llamadas a herramientas funciona en GGUF.
- Analisis de datos asistido en local: el dominio de evaluacion fue el analisis de datos; un equipo podria usarlo para explorar si el modelo base ya cubre sus necesidades antes de invertir en ajustes propios.
- Comparativa de cuantizaciones: la advertencia del autor sobre la deriva entre Q8_0 y Q4_K_M respecto al comportamiento aprendido en BF16 lo hace util como caso de estudio sobre el impacto de la cuantizacion en adaptadores LoRA.
- Prototipado de agentes con API compatible con Anthropic: cualquier herramienta que hable el protocolo de mensajes de Anthropic puede apuntar a este servidor, facilitando pruebas de agentes multi-paso con modelos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta version GGUF. La model card original del adaptador reporta una evaluacion de 100 tareas de analisis de datos en pass@1 (con ±5 puntos de ruido), con la conclusion de que no hubo cambio medible respecto al modelo base; esos numeros concretos no se incluyen en esta ficha y corresponden a vLLM en BF16, no a llama.cpp con cuantizacion.

## Requisitos de hardware

- El adaptador en si pesa solo unos 37 MB (F16), pero requiere cargar el modelo base LFM2.5-24B-A2B en GGUF, cuyo consumo domina la VRAM.
- Estimacion de VRAM para el base: con Q8_0, en torno a 24-26 GB; con Q4_K_M, en torno a 13-15 GB (estimaciones tipicas para un MoE de 24B; no disponible cifra oficial en la ficha).
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 5090 deberia alojar la variante Q4_K_M; para Q8_0 con holgura, una A100 40 GB, H100 o una GPU de 32 GB o mas.
- Es plausible ejecutar Q4_K_M en GPU de consumo de gama alta; para equipos sin GPU suficiente, llama.cpp permite descarga parcial a CPU/RAM con penalizacion de velocidad.
- Despliegue: llama.cpp (`llama-server` con `--lora` y `--jinja`) es el metodo documentado; la compatibilidad con Ollama, vLLM o TGI no esta descrita en la informacion disponible.
- Latencia y throughput: no disponible; al ser un MoE con ~2B de parametros activos, cabria esperar buena velocidad de generacion, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-claude-code-GGUF | Adaptador LoRA (GGUF) sobre MoE 24B-A2B | 24B base / ~2B activos | 65.536 tokens (en ejemplo) | lfm1.0 | Sin mejora medida frente al base; orientado a Claude Code |
| LiquidAI/LFM2.5-24B-A2B | MoE completo (GGUF oficial) | 24B / ~2B activos | no disponible en esta ficha | lfm1.0 | Modelo base; mismo comportamiento sin adaptador |
| Qwen3-30B-A3B | MoE completo | 30B / ~3B activos | hasta 128K (según version) | Apache 2.0 | Alternativa abierta de tamano y costo de inferencia comparable, con ecosistema de agentes mas maduro |

La comparativa con Qwen3-30B-A3B es orientativa: para uso agentico serio en local, esa alternativa ofrece licencia permisiva y soporte mas amplio, mientras que esta ficha tiene valor principalmente experimental.

## Limitaciones y advertencias

- Sin mejora medida: la propia model card indica que tras 100 pasos de entrenamiento no hay cambio observable respecto al modelo base, por lo que instalar el adaptador puede no aportar nada.
- No evaluado en GGUF: las puntuaciones del adaptador provienen de vLLM en BF16; el archivo GGUF no ha sido evaluado y una base cuantizada desplaza aun mas los resultados.
- Evaluacion estrecha: solo 100 tareas de analisis de datos, con ±5 puntos de ruido en pass@1; no hay evidencia de mejoras en otros dominios.
- Dependencia de la cuantizacion del base: el adaptador se entreno sobre BF16; usar Q4_K_M introduce deriva respecto al comportamiento aprendido.
- Requisito de configuracion: sin `--jinja` en llama-server, el tool calling no funciona y Claude Code no sera utilizable.
- Licencia lfm1.0: es una licencia personalizada ("other") enlazada a LiquidAI; conviene revisar sus terminos antes de cualquier uso comercial, pues no es una licencia estandar tipo Apache o MIT.
- Riesgo de alucinacion y sesgos: heredados del modelo base; no se documentan evaluaciones de seguridad especificas para este adaptador.
- Proyecto de nicho: con 46 descargas y 5 likes en el momento de la ficha, el mantenimiento y soporte comunitario son minimos.

## Enlaces

- Ficha del modelo GGUF: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-claude-code-GGUF
- Adaptador original (PEFT): https://huggingface.co/harness-hub/LFM2.5-24B-A2B-harbor-claude-code-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Base en GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- API de mensajes de Anthropic en llama.cpp (anuncio): https://huggingface.co/blog/ggml-org/anthropic-messages-api-in-llamacpp
- Documentacion de Claude Code: https://docs.claude.com/en/docs/claude-code/overview
- Referencia externa encontrada en la busqueda (sin relacion directa confirmada con este modelo): https://www.deepseek.com/en/harness/
