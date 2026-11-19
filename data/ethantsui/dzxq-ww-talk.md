# EthanTsui/dzxq-ww-talk

## Resumen

dzxq-ww-talk es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario EthanTsui en Hugging Face. Se trata de un modelo especializado en generar intervenciones de un jugador controlado por ordenador dentro de una partida de "hombres lobo" (werewolf) integrada en el juego de mesa "對坐象棋" (ajedrez cara a cara). El modelo recibe como entrada la informacion del tablero que ese jugador puede ver y produce de una a tres frases de intervencion en chino tradicional de Taiwan, junto con el objetivo de su voto.

El modelo se ha entrenado mediante LoRA sobre el modelo base y posteriormente se han fusionado los pesos. Los pesos se han convertido a ONNX en cuantizacion de 4 bits (variantes q4f16 y q4) para ejecutarse directamente en el navegador mediante transformers.js y WebGPU. El repositorio ocupa aproximadamente 1,0 GB y la licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada: no es un modelo de proposito general, sino una pieza de un sistema ludico concreto. Resulta interesante como ejemplo de despliegue de un LLM pequeno cuantizado en el cliente (navegador) sin infraestructura de servidor, y como caso de especializacion por LoRA sobre un modelo de menos de mil millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5; tag `qwen3_5_text`), no disponible el detalle exacto de capas y dimensiones |
| Parametros totales | 0,8 mil millones (modelo base Qwen/Qwen3.5-0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX 4 bits en variantes q4f16 y q4 |
| Idiomas soportados | chino (zh), con salida en chino tradicional de Taiwan |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (para transformers.js); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. Sobre el se aplico un ajuste fino con LoRA orientado a una tarea muy concreta: generar intervenciones de un rol de hombre lobo a partir de la informacion de estado que ese jugador tiene disponible en la partida. Tras el entrenamiento, los adaptadores LoRA se fusionaron con los pesos base y el resultado se exporto a ONNX con cuantizacion de 4 bits (q4f16 y q4) para su ejecucion en el navegador.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens utilizados ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia cadena de conversion a ONNX y la integracion con transformers.js y WebGPU.

## Capacidades

- Generacion de texto conversacional breve: produce entre una y tres frases por turno, en chino tradicional de Taiwan.
- Generacion de decisiones de voto: ademas del texto, el modelo emite el objetivo de voto del jugador.
- Razonamiento situado: interpreta la informacion de estado visible por el jugador (rol, jugadas previas, intervenciones de otros) para construir su respuesta.
- Ejecucion en el navegador del cliente mediante transformers.js y WebGPU, sin necesidad de backend.
- Capacidades multilingues limitadas al chino; no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Jugador NPC en partidas de hombre lobo dentro del juego "對坐象棋": el modelo genera las intervenciones y el voto de un jugador automatico a partir del estado visible, manteniendo el ritmo de la partida sin llamadas a un servidor.
- Prototipado de agentes conversacionales en el navegador: sirve como referencia para integrar un LLM de 0,8 B cuantizado con transformers.js y WebGPU en una aplicacion web.
- Demostraciones educativas de ajuste fino con LoRA: el repositorio ilustra el flujo completo desde un modelo base hasta un artefacto ONNX desplegable en cliente.
- Simulacion de roles sociales en juegos de deduccion: el modelo puede reutilizarse como base para otros roles conversacionales con estado acotado y respuestas cortas.
- Evaluacion de inferencia en cliente con WebGPU: util para medir latencia y consumo de recursos de un modelo de 4 bits en equipos de usuario final.
- Generacion de dialogos breves y tematicos en chino tradicional: aplicable a contenido ludico o narrativo de formato corto donde el contexto sea estructurado y acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con pesos ONNX de 4 bits y un repositorio de 1,0 GB, la huella de pesos ronda el gigabyte, a lo que hay que sumar el estado de activaciones y el contexto.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en el navegador; no se documentan modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del modelo y la cuantizacion de 4 bits, aunque el autor no publica una lista de dispositivos verificados.
- Opciones de despliegue: transformers.js con WebGPU en el navegador; el formato ONNX tambien permite ejecucion con runtimes compatibles con ONNX, aunque no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| dzxq-ww-talk | 0,8 B | no disponible | Apache 2.0 | ONNX 4 bits | Especializado en un juego concreto, en navegador |
| Qwen/Qwen3.5-0.8B | 0,8 B | no disponible | no disponible en la informacion | safetensors | Modelo base de proposito general |
| Alternativas de menos de 1 B para navegador | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta entrenado para un unico juego y un unico rol; su comportamiento fuera de ese contexto no esta validado.
- Idioma limitado al chino tradicional de Taiwan; no se garantiza un comportamiento correcto en otros idiomas o variantes.
- Riesgo de alucinacion: al generar intervenciones de un juego de deduccion, puede producir afirmaciones incoherentes con el estado de la partida si la entrada no esta bien estructurada.
- Sesgos: no se documentan analisis de sesgo; al derivar de un modelo base de proposito general, puede heredar sesgos de este.
- Sin datos de contexto maximo ni de rendimiento: dificulta planificar su uso en produccion mas alla del caso previsto.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B, no detalladas en la informacion disponible.
- Repositorio sin descargas ni valoraciones en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por terceros.
- Dependencia de WebGPU: el rendimiento en cliente depende del navegador y del hardware del usuario final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EthanTsui/dzxq-ww-talk
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
