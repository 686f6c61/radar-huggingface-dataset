# bahattinyunus/kam-r1-nano-1.5b-gguf

## Resumen

KAM-R1-Nano 1.5B es un modelo de generación de texto en formato GGUF publicado por Bahattin Yunus Çetin (@bahattinyunus) bajo licencia Apache 2.0. Según su model card, se trata de un modelo derivado de DeepSeek-R1 1.5B, ajustado para razonamiento con cadena de pensamiento (`<think>`) y orientado a despliegue en hardware restringido (edge computing, entre 1 y 2 GB de RAM, con estrés térmico por encima de 85 °C). El repositorio contiene los pesos cuantizados listos para su uso con Ollama mediante una única orden.

El modelo forma parte de una familia más amplia denominada KAM, que el autor presenta como un motor cognitivo local (air-gapped) para vehículos no tripulados, estaciones de guerra electrónica y sistemas de defensa autónomos. La model card describe una arquitectura teórica de ocho capas que combina inferencia activa de Karl Friston, redes neuronales líquidas con resolución Runge-Kutta, cuantización ternaria BitNet b1.58, telemetría eBPF y compilación JIT en C++20. Conviene subrayar que estas afirmaciones arquitectónicas no vienen acompañadas de documentación técnica verificable ni de pesos en formato safetensors que las respalden: el dato real disponible es un total de 1.777.088.000 parámetros y un repositorio de 1,1 GB.

Su relevancia actual es limitada pero concreta: ofrece un modelo de razonamiento de pequeño tamaño, en turco e inglés, empaquetado para ejecución local en dispositivos con recursos muy ajustados. No obstante, la ausencia de benchmarks reproducibles, de código de entrenamiento público verificable y de tracción en la comunidad (0 descargas, 0 likes en el momento de la consulta) obliga a tratar las capacidades declaradas con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma verificable. La model card declara un esquema híbrido ("Tri-Hybrid Liquid-SSM": Conv1D + SWA + RK4 LTC con MoE de 8 expertos y Top-2), pero no se aportan pesos ni configuración que lo confirmen. El modelo base declarado es DeepSeek-R1 1.5B, de arquitectura transformer densa |
| Parametros totales | 1.777.088.000 (dato real del repositorio) |
| Parametros activos | No disponible (la model card menciona un MoE con Top-2 sobre 8 expertos, sin cifras) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repositorio ocupa 1,1 GB; no se detallan los niveles Q4_K_M, Q5_K_M, etc. incluidos) |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con Ollama) |

## Arquitectura y entrenamiento

La información disponible no permite verificar la arquitectura real del modelo. El autor declara que se apoya en DeepSeek-R1 1.5B como base y que incorpora un motor de razonamiento con modo `<think>` (cadena de pensamiento). Sobre esa base, la model card describe una capa adicional de componentes teóricos: inferencia activa con minimización de energía libre variacional y energía libre esperada, funciones de barrera de control (CLF/CBF) para garantizar estabilidad asintótica, un módulo de guerra electrónica con análisis de palabras de descripción de pulso y un planificador de misiones que descompone intenciones en lenguaje natural en grafos acíclicos dirigidos.

En el plano del entrenamiento, no se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se publican los scripts de ajuste más allá de una referencia a `scripts/train_kam_persona.py` en el repositorio de GitHub del autor. Las innovaciones técnicas citadas (decodificación especulativa con un modelo borrador de 1.5B, cuantización ternaria BitNet b1.58 con matriz Hessiana `imatrix`, compilación JIT en memoria con `memfd_create`) aparecen como afirmaciones sin resultados reproducibles asociados.

## Capacidades

- Generación de texto conversacional en turco e inglés.
- Razonamiento con cadena de pensamiento explícita mediante etiquetas `<think>`, heredado del linaje DeepSeek-R1.
- Ejecución local en dispositivos de borde con requisitos de memoria muy bajos (repositorio de 1,1 GB).
- Integración con Ollama mediante una única orden de descarga y ejecución.
- La model card declara planificación de misiones multi-paso, análisis de señales de radiofrecuencia y mutación de código en tiempo de ejecución; no se ha verificado ninguna de estas capacidades de forma independiente.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional en turco para dispositivos sin conectividad: el modelo puede desplegarse con Ollama en equipos con 1-2 GB de RAM y mantener diálogos multi-turno sin depender de la nube, lo que encaja en entornos air-gapped.
- Razonamiento paso a paso en entornos educativos: el modo `<think>` permite mostrar el proceso de resolución de problemas matemáticos o lógicos sencillos, útil para herramientas de tutoría que necesitan explicar el razonamiento y no solo la respuesta.
- Prototipado rápido de agentes locales: al ser un GGUF de 1,1 GB, sirve como modelo de pruebas para validar pipelines de agentes antes de escalar a modelos mayores de la misma familia (por ejemplo, `kam:7b` o `kam:apex`).
- Generación de borradores en inglés técnico: para resúmenes y respuestas breves en documentación interna donde no se requiera máxima calidad pero sí baja latencia en hardware modesto.
- Modelo borrador para decodificación especulativa: el autor lo propone explícitamente como "spekülatif taslak" (borrador especulativo) junto a modelos mayores de la familia, un uso coherente con su tamaño reducido.
- Filtrado y clasificación de texto en el borde: tareas de etiquetado, extracción de entidades o triaje de mensajes en dispositivos con CPU y poca memoria, donde un modelo de 1,5B cuantizado es suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card cita una "puntuación de benchmark cognitivo en vivo del 100,0/100" obtenida con un script propio (`evaluate_kam.py`, 23/23 pruebas unitarias y de integración superadas), pero se trata de una métrica interna del autor sin comparación con estándares públicos como MMLU, HumanEval o GSM8K, por lo que no se incluye como resultado de benchmark.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 1,1 GB, por lo que la inferencia cabe en aproximadamente 1,5-2 GB de memoria total (pesos más contexto y caché KV).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; el modelo está pensado para ejecución en CPU y en aceleradores de borde.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo reciente (GTX 1650, RTX 3050, RTX 4060, etc.) y en placas integradas con suficiente RAM compartida.
- Opciones de despliegue: Ollama (soporte explícito mediante `ollama run hf.co/bahattinyunus/kam-r1-nano-1.5b-gguf`); llama.cpp al ser formato GGUF; vLLM y TGI no están confirmados para este repositorio.
- Latencia y throughput: no disponibles. El autor cita cifras de compresión de memoria (10,13x) y ahorro energético (4,6x) para BitNet b1.58, pero sin metodología ni contexto de medición reproducibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAM-R1-Nano 1.5B | 1,78 B | No disponible | Apache 2.0 | GGUF | Ajuste declarado sobre DeepSeek-R1 1.5B; sin benchmarks públicos |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32.768 tokens (modelo base) | MIT | Safetensors, GGUF | Modelo de referencia del que deriva; benchmarks públicos disponibles |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Alternativa generalista con amplia adopción y soporte de tool calling |
| Llama-3.2-1B-Instruct | 1,24 B | 131.072 tokens | Llama 3.2 Community License | Safetensors, GGUF | Contexto muy superior; licencia con restricciones para grandes despliegues |

La comparación se basa en el tamaño y la categoría (modelos de 1-2B para generación de texto). No se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia de benchmarks públicos y reproducibles: las afirmaciones de rendimiento de la model card no son verificables de forma independiente.
- Discrepancia entre la arquitectura declarada y los artefactos publicados: la model card describe componentes (MoE, SSM líquido, BitNet b1.58) que no se reflejan en los pesos GGUF disponibles ni en la configuración del repositorio.
- Riesgo de alucinación: al ser un modelo de 1,5B ajustado para razonamiento, es propenso a generar cadenas de pensamiento plausibles pero incorrectas, especialmente en dominios técnicos especializados.
- Cobertura lingüística limitada a turco e inglés; el rendimiento en castellano no está documentado y previsiblemente será deficiente.
- Sesgos conocidos: no se documentan evaluaciones de sesgo; al derivar de un modelo base entrenado con datos web, hereda los sesgos de dicha fuente.
- Contexto máximo no especificado: no es posible planificar aplicaciones que dependan de ventanas largas sin conocer este dato.
- Advertencia de uso: la model card vincula el modelo a aplicaciones de defensa autónoma (vehículos no tripulados, guerra electrónica). Aunque la licencia Apache 2.0 permite el uso comercial, el despliegue en sistemas de armas o defensa autónoma plantea consideraciones éticas y legales que el desarrollador debe evaluar.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bahattinyunus/kam-r1-nano-1.5b-gguf
- Repositorio GitHub del proyecto KAM: https://github.com/bahattinyunus/kam
- Perfil del autor en GitHub: https://github.com/bahattinyunus
- Modelo hermano (Qwen 2.5 1.5B edge): https://huggingface.co/bahattinyunus/kam-1.5b-edge-gguf
- Modelo hermano (DeepSeek-R1 7B): https://huggingface.co/bahattinyunus/kam-r1-gguf
- Modelo hermano (Qwen 2.5 7B): https://huggingface.co/bahattinyunus/kam-7b-gguf
- Modelo hermano (Qwen3 8B): https://huggingface.co/bahattinyunus/kam-apex-8b-gguf
- Modelo hermano (Qwen 2.5 Coder 7B): https://huggingface.co/bahattinyunus/kam-coder-7b-gguf
- Modelo hermano (Qwen 2.5 Coder 1.5B): https://huggingface.co/bahattinyunus/kam-coder-nano-1.5b-gguf
- Modelo hermano (MoE BitNet b1.58): https://huggingface.co/bahattinyunus/kam-edge-moe-b158
