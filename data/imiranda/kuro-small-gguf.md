# iMiranda/kuro-small-gguf

## Resumen

Kuro-Small es una variante ligera del modelo Kuro, publicada por el usuario iMiranda en HuggingFace. Se trata de una cuantización en formato GGUF (Q4_K_M) del modelo Qwen/Qwen2.5-1.5B-Instruct, diseñada específicamente para ejecutarse en equipos modestos con 8 GB de RAM total y sin GPU dedicada, usando únicamente CPU. El modelo incorpora una personalidad llamada "Kuro" mediante un system prompt inyectado en tiempo de ejecución, sin modificar los pesos originales. Su objetivo principal es ofrecer un asistente conversacional técnico y directo, optimizado para entornos de terminal pura (TTY), con un consumo de memoria inferior a 2 GiB durante la inferencia.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only de 1.500 millones de parámetros desarrollado por Alibaba, con una ventana de contexto nativa de hasta 32.768 tokens y vocabulario BPE de 151.000 entradas. Al estar cuantizado a 4 bits, el archivo GGUF ocupa aproximadamente 1.0 GiB, lo que permite cargarlo en máquinas con poca RAM. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. La relevancia actual radica en la creciente demanda de modelos pequeños, eficientes y desplegables en hardware de bajo coste, especialmente para aplicaciones de asistencia local, automatización de tareas y prototipado rápido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (decoder-only, GQA) |
| Parametros totales | 1.543.714.304 (1.5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 tokens (recomendado: 2.048) |
| Tipos de cuantizacion | Q4_K_M (4-bit principal + 6-bit K/V) |
| Idiomas soportados | portugues, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención de consultas agrupadas (GQA) y un vocabulario BPE de 151.000 entradas. La arquitectura Qwen2.5 incorpora mejoras sobre versiones anteriores, como una mayor eficiencia en la atención para contextos largos y un entrenamiento con datos multilingües. El modelo instruct fue alineado mediante técnicas de ajuste fino supervisado y RLHF (según la documentación oficial de Qwen), lo que le confiere capacidades de seguimiento de instrucciones y rechazo de contenido inseguro.

Kuro-Small no introduce ningún entrenamiento adicional: es una repack del modelo base cuantizado a GGUF Q4_K_M mediante la herramienta `llama-quantize` de llama.cpp. La personalidad "Kuro" se aplica exclusivamente en runtime a través de un system prompt que define un estilo de comunicación directo, técnico y conciso, sin modificar los pesos. El archivo GGUF incluye el chat template Jinja2 (ChatML de Qwen), pero no el system prompt, que debe inyectarse manualmente en la herramienta de inferencia.

## Capacidades

- Generacion de texto conversacional multilingue (portugues e ingles), con estilo directo y tecnico gracias al system prompt.
- Razonamiento basico y resolucion de problemas en tareas de corta duracion; el propio prompt advierte de las limitaciones de un modelo de 1.5 B para razonamiento largo.
- Generacion de codigo funcional en Python y otros lenguajes, priorizando soluciones que funcionen en hardware real.
- Soporte de chat multi-turno mediante el modo interactivo de llama.cpp (`-cnv`).
- Compatible con herramientas que consumen GGUF: LM Studio, Ollama, Jan, llama.cpp, entre otras.
- Capacidad de seguir instrucciones y rechazar contenido inseguro (heredada del alineamiento de Qwen2.5-Instruct).
- No dispone de capacidades de vision, audio ni tool calling nativas (el modelo base de 1.5 B no las incluye).

## Casos de uso

- Asistente local en terminal para desarrolladores: ejecutar `llama-cli` en un equipo con 8 GB de RAM y CPU-only para consultar sintaxis, depurar errores o resolver dudas de programacion sin conexion a internet.
- Automatizacion de tareas de scripting: generar funciones Python, comandos shell o fragmentos de codigo para pipelines de datos, con respuesta rapida (~15-20 tok/s en CPU i7-1355U) y bajo consumo de memoria.
- Chat de soporte tecnico interno: desplegar el modelo en un servidor ligero con llama.cpp para responder preguntas frecuentes sobre herramientas de desarrollo, con la personalidad "Kuro" que evita rodeos y da respuestas concisas.
- Prototipado rapido de asistentes conversacionales: usar el GGUF en Ollama o LM Studio para validar flujos de dialogo y estilos de respuesta antes de migrar a modelos mas grandes.
- Educacion y formacion: servir como ejemplo de despliegue de modelos cuantizados en hardware modesto, mostrando como un LLM de 1.5 B puede ejecutarse en un portatil estandar sin GPU.
- Entornos con restricciones de hardware: aplicaciones embebidas, Raspberry Pi o maquinas virtuales con poca RAM donde un modelo mayor no cabe; Kuro-Small ocupa menos de 2 GiB de RSS en inferencia.
- Generacion de documentacion tecnica corta: producir resumenes, comentarios de codigo o explicaciones de conceptos en portugues o ingles, con estilo directo y sin florituras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para Kuro-Small en la informacion disponible. El modelo es una cuantizacion de Qwen2.5-1.5B-Instruct, cuyos resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) estan documentados por el equipo de Qwen, pero no se incluyen aqui al no estar proporcionados en la ficha. El autor reporta mediciones de rendimiento en runtime:

| Entorno | Valor |
|---|---|
| CPU | Intel i7-1355U (10 cores, 12 threads) |
| RAM total | 16 GiB |
| GPU | ninguna (CPU-only) |
| RSS en inferencia | < 2.0 GiB (medido: ~1.8 GiB con ctx=2048) |
| Throughput esperado | ~15-20 tok/s (estimado por el autor) |
| Contexto recomendado | 2048 tokens |

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- RAM libre minima: aproximadamente 5 GiB para el modelo y el sistema operativo; el RSS medido es de ~1.8 GiB con contexto 2048.
- GPU recomendada: ninguna (CPU-only). Si se desea aceleracion, cualquier GPU con soporte de llama.cpp (por ejemplo, RTX 3060 o superior) puede cargar el modelo en VRAM, aunque no es necesario.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio, Jan, y cualquier herramienta compatible con GGUF. Tambien puede servirse via llama.cpp server para acceso HTTP.
- Latencia y throughput: en un i7-1355U se esperan ~15-20 tokens por segundo; la latencia de primer token depende del hardware y del contexto cargado.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU con al menos 2 GB de VRAM (el modelo ocupa ~1.0 GiB), pero el uso principal es CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso tipico |
|---|---|---|---|---|---|
| **Kuro-Small** (Qwen2.5-1.5B) | 1.5 B | 32.768 (recom. 2.048) | Q4_K_M | Apache 2.0 | Asistente local en CPU, 8 GB RAM |
| **Kuro** (Phi-3.5-mini) | 3.8 B | 4.096 (recom.) | GGUF (no especificado) | MIT | Asistente local con mayor capacidad, 10-11 GiB RAM libre |
| **Qwen2.5-1.5B-Instruct** (base) | 1.5 B | 32.768 | safetensors (BF16) | Apache 2.0 | Modelo base sin cuantizar, requiere mas RAM (~3 GiB) |
| **Llama-3.2-1B-Instruct** | 1.2 B | 128.000 | GGUF disponible | Llama 3.2 | Alternativa de tamano similar, contexto mayor, licencia propietaria |

Kuro-Small se distingue por su extremo bajo consumo de memoria y su personalidad inyectada via prompt, lo que lo hace ideal para equipos con 8 GB de RAM. En comparacion con Kuro (3.8 B), sacrifica capacidad tecnica a cambio de mayor velocidad y menor uso de RAM. Frente al modelo base sin cuantizar, ofrece un archivo mucho mas pequeno y ejecutable en CPU sin necesidad de GPU.

## Limitaciones y advertencias

- El modelo tiene solo 1.5 B de parametros, por lo que su capacidad de razonamiento complejo, matematicas avanzadas o generacion de codigo extenso es limitada. El propio system prompt recomienda dividir tareas largas en pasos cortos.
- La personalidad "Kuro" no esta en los pesos; si se usa el GGUF sin inyectar el system prompt, el comportamiento sera el del Qwen2.5-1.5B-Instruct estandar, no el estilo directo de Kuro.
- Los idiomas soportados son portugues e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas, aunque el modelo base de Qwen tiene cierta capacidad multilingue.
- Riesgo de alucinacion: como todo LLM, puede inventar informacion cuando no conoce la respuesta. El system prompt intenta mitigarlo, pero no lo elimina.
- Contexto recomendado de 2048 tokens: aunque el modelo soporta hasta 32.768, el autor recomienda 2048 para mantener el bajo consumo de RAM; usar contextos mayores aumentara el RSS.
- No se han publicado evaluaciones de sesgos o seguridad especificas para esta cuantizacion; la alineacion heredada de Qwen2.5-Instruct reduce riesgos, pero no los elimina.
- El modelo no soporta tool calling, vision ni audio; solo texto.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Qwen2.5 tiene sus propios terminos (Apache 2.0 tambien), por lo que no hay conflicto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iMiranda/kuro-small-gguf
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Variante original Kuro (Phi-3.5): https://huggingface.co/iMiranda/kuro-phi3.5-gguf
