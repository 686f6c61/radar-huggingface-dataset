# Andreevai/Qwen3-0.6B-GGUF

## Resumen

Andreevai/Qwen3-0.6B-GGUF es un repositorio de cuantizaciones GGUF del modelo Qwen3-0.6B, desarrollado originalmente por Alibaba Cloud (equipo Qwen) y empaquetado por el usuario Andreevai. El modelo base es un transformer causal de tipo decoder-only con 751.632.384 parametros reales (etiquetado comercialmente como "0.6B"), disenado para generacion de texto y razonamiento en entornos con recursos muy limitados. Este repositorio concreto resuelve el problema de desplegar el modelo en CPU, moviles y GPUs de gama baja mediante cuantizaciones de 4, 5 y 8 bits generadas con llama.cpp.

La relevancia actual del modelo radica en su modo dual: incorpora un modo de razonamiento explicito (etiquetas `<think>...</think>`) y un modo conversacional directo, lo que permite alternar entre respuestas rapidas y cadenas de razonamiento segun la tarea. Con una ventana de contexto de hasta 32.768 tokens y licencia Apache 2.0, se posiciona como una opcion viable para prototipado, agentes ligeros, clasificacion de texto y despliegue en el borde (edge computing).

El repositorio incluye tres ficheros GGUF verificados con plantillas de tokenizer funcionales, lo que facilita su uso inmediato en Ollama, llama.cpp, LM Studio, Jan y cualquier runtime compatible con el formato GGUF y la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen3), 28 capas, 16 cabezas de consulta, 8 cabezas KV, GQA, activacion SwiGLU |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (461 MB), Q5_K_M (525 MB), Q8_0 (767 MB) |
| Idiomas soportados | en, ru, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp b11951, commit a71c00f0b) |

## Arquitectura y entrenamiento

El modelo base Qwen3-0.6B es un transformer decoder-only causal con 28 capas, 16 cabezas de atencion de consulta y 8 cabezas KV, empleando Grouped Query Attention (GQA) para reducir el coste de memoria del KV cache durante la inferencia. La capa feed-forward usa activacion SwiGLU. El modelo incorpora un modo dual de generacion: razonamiento explicito dentro de etiquetas `<think>...</think>` y respuesta directa sin cadena de pensamiento. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde a la model card oficial de Qwen/Qwen3-0.6B y no esta incluida en la informacion proporcionada.

La innovacion tecnica de este repositorio concreto es el proceso de cuantizacion: se ha utilizado llama.cpp en su release b11951 (commit a71c00f0b) con arquitectura Little-Endian y plantillas de tokenizer verificadas, lo que garantiza compatibilidad con los runtimes mas habituales. Las cuantizaciones K-quant (Q4_K_M y Q5_K_M) aplican cuantizacion mixta por bloques, preservando mayor precision en las capas mas sensibles, mientras que Q8_0 ofrece una precision de 8 bits casi sin perdida respecto a FP16.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 32.768 tokens.
- Razonamiento explicito en modo thinking mediante etiquetas `<think>...</think>`, activable o desactivable por prompt.
- Generacion de codigo y resolucion de problemas matematicos basicos (capacidad heredada del modelo base Qwen3).
- Soporte multilingue: ingles, ruso, chino y cobertura multilingue adicional.
- Compatibilidad con la API de OpenAI a traves de `llama-server`, lo que habilita integracion con clientes que esperan ese contrato.
- Despliegue en Ollama mediante referencia directa `hf.co/Andreevai/Qwen3-0.6B-GGUF:...`.
- Compatibilidad con LM Studio, Jan y Faraday mediante importacion directa del fichero GGUF.
- No se documenta soporte de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion proporcionada.

## Casos de uso

- **Prototipado rapido en local**: con el fichero Q4_K_M de 461 MB, un desarrollador puede levantar un servidor compatible con OpenAI (`llama-server -m Qwen3-0.6B-Q4_K_M.gguf --port 8080`) y validar prompts, plantillas y flujos conversacionales sin coste de API ni dependencia de red.
- **Asistente embebido en movil o dispositivo de bajo consumo**: la cuantizacion Q4_K_M cabe en menos de 500 MB de almacenamiento y permite ejecucion en CPU, lo que la hace apta para aplicaciones Android/iOS con Ollama o llama.cpp integrado.
- **Clasificacion y etiquetado de texto a gran escala**: el contexto de 32.768 tokens permite procesar documentos largos completos en una sola pasada, util para categorizacion de tickets, moderacion o extraccion de entidades en pipelines por lotes.
- **Generacion de codigo asistida en entornos sin GPU**: la cuantizacion Q5_K_M (525 MB) preserva mejor las capacidades de razonamiento y codigo, y puede integrarse en editores o scripts CLI mediante llama.cpp para autocompletado y explicacion de fragmentos.
- **Razonamiento paso a paso para tareas educativas**: el modo `<think>` permite generar explicaciones detalladas de problemas matematicos o logicos, util en plataformas de tutoria automatizada donde se quiere mostrar el razonamiento al estudiante.
- **Traduccion y procesamiento multilingue ligero**: con soporte para ingles, ruso y chino, el modelo puede emplearse en tareas de traduccion o resumen en aplicaciones con requisitos de privacidad que impiden enviar datos a la nube.
- **Evaluacion comparativa de cuantizaciones**: el repositorio ofrece tres niveles de precision del mismo modelo, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de generacion antes de decidir el despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: Q4_K_M aproximadamente 0,5-1 GB; Q5_K_M aproximadamente 0,6-1,2 GB; Q8_0 aproximadamente 0,9-1,5 GB (incluyendo overhead de contexto y KV cache).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060); en A100/H100 el modelo esta infrautilizado pero funciona sin problemas.
- **Consumer GPU**: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPUs y CPUs.
- **CPU**: ejecutable en CPU sin GPU; el fichero Q4_K_M es adecuado para portatiles y mini-PC.
- **Movil**: Q4_K_M (461 MB) es viable en dispositivos Android/iOS de gama media-alta con llama.cpp u Ollama.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Jan, Faraday, y cualquier runtime compatible con GGUF.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Andreevai/Qwen3-0.6B-GGUF | 751.632.384 | 32.768 | Apache 2.0 | GGUF | HuggingFace (112 descargas) |
| Qwen/Qwen3-0.6B (original) | 751.632.384 | 32.768 | Apache 2.0 | safetensors | HuggingFace (oficial) |
| Qwen/Qwen3-0.6B-Base | no disponible | no disponible | Apache 2.0 | safetensors | HuggingFace (oficial) |

Las alternativas de otros fabricantes en el rango sub-1B (Llama 3.2 1B, Gemma 2 2B, SmolLM2) no estan documentadas en la informacion proporcionada, por lo que no se incluyen datos comparativos de rendimiento.

## Limitaciones y advertencias

- **Riesgo de alucinacion**: con 751 millones de parametros, la tasa de alucinacion es significativamente mayor que en modelos de mayor tamano; no es adecuado para tareas que requieran precision factual sin verificacion.
- **Capacidad de razonamiento limitada**: el modo `<think>` funciona, pero la profundidad de razonamiento esta acotada por el tamano del modelo; tareas complejas de matematicas o logica pueden producir cadenas incorrectas.
- **Idiomas**: aunque se declara soporte multilingue, la calidad fuera de ingles, chino y ruso puede degradarse notablemente; el castellano no figura entre los idiomas declarados.
- **Perdida por cuantizacion**: Q4_K_M introduce perdida medible de calidad frente a FP16; para evaluacion de benchmarks se recomienda Q8_0.
- **Tool calling no documentado**: no se confirma soporte de function calling ni de agentes multi-paso, lo que limita su uso en pipelines agenticos.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base Qwen3-0.6B por si hubiera condiciones adicionales no reflejadas en este repositorio.
- **Mantenimiento**: el repositorio tiene 0 likes y 112 descargas, lo que sugiere un proyecto personal sin garantias de mantenimiento a largo plazo; para produccion conviene considerar las cuantizaciones oficiales del equipo Qwen si existen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Andreevai/Qwen3-0.6B-GGUF
- Modelo base (instruct): https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base (base): https://huggingface.co/Qwen/Qwen3-0.6B-Base
- llama.cpp (runtime): https://github.com/ggml-org/llama.cpp
- Ollama (runtime): https://ollama.com
- LM Studio: https://lmstudio.ai
- Jan: https://jan.ai
