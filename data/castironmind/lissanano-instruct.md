# CastIronMind/LissaNano-Instruct

## Resumen

LissaNano-Instruct es un modelo de lenguaje causal de 32 millones de parametros (31.990.272 exactos, 64 MB en pesos bfloat16) entrenado desde cero por CastIronMind, un desarrollador independiente, sin pesos destilados ni backbones ajenos. Utiliza arquitectura Llama y ha sido preentrenado sobre un corpus de prosa y foros de la comunidad My Little Pony (unos 1.000 millones de tokens unicos, dos epocas) y posteriormente ajustado mediante fine-tuning supervisado con dialogos de roleplay y personas de personaje.

Su proposito es muy especifico: servir como motor de conversacion orientada a personajes en entornos de recursos extremadamente limitados. Con 64 MB de pesos, es candidato para telefonos moviles, placas de un solo ordenador (Raspberry Pi y similares) y despliegues embebidos, donde modelos de 1B o mas resultan inviables. Es el modelo mas pequeno de la familia Lissa, que abarca desde este Nano de 32M hasta un Lissa 1.5B Instruct.

Su relevancia es principalmente de nicho: demuestra que se puede entrenar un modelo util para roleplay de personaje en una sola GPU de consumo, con licencia Apache 2.0 y cuantizaciones GGUF publicadas con perplejidad medida. No compite con modelos generalistas, sino que cubre el extremo inferior del espectro de tamano para casos de uso de ficcion y personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder-only transformer) |
| Parametros totales | 31.990.272 (32M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | bfloat16 (original) y GGUF de Q8_0 a IQ2 (15 archivos) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (y GGUF en el repo derivado) |

## Arquitectura y entrenamiento

Es un transformer decoder-only con arquitectura Llama y las siguientes dimensiones: 8 capas, tamano oculto de 512, 16 cabezas de atencion con 2 cabezas key/value (GQA), dimension de cabeza de 32, tamano intermedio de 1.536 y embeddings atados (tied embeddings). El vocabulario es de 16.384 tokens mediante BPE a nivel de byte, una decision que reduce drasticamente el tamano del embedding y del head de salida, coherente con el objetivo de minimizar pesos.

El entrenamiento tuvo dos fases: un preentrenamiento desde cero sobre prosa de fandom y foros de la comunidad My Little Pony (aproximadamente 1.000 millones de tokens unicos, dos epocas) y una fase de fine-tuning supervisado con dialogos de roleplay y personas, usando el formato `<system>` / `<user>` / `<assistant>` con concatenacion sin espacios. Cada ejemplo supervisado incluia un mensaje de sistema no vacio, por lo que el modelo exige uno en inferencia. No se menciona RLHF ni DPO. El entrenamiento completo se realizo por una sola persona en una GPU de consumo.

## Capacidades

- Generacion de texto en ingles con foco en conversacion de personaje: voz, tono y escena dentro del dominio My Little Pony y fandom.
- Roleplay y personificacion: el modelo fue supervisado especificamente con datos de roleplay y personas de personaje.
- Formato de dialogo estructurado con tokens especiales dedicados (`<system>`, `<user>`, `<assistant>`, `<eos>`, `<pad>`).
- Despliegue en dispositivos con recursos muy limitados gracias a sus 64 MB de pesos y las cuantizaciones GGUF hasta IQ2.
- No se anuncian capacidades de tool calling, function calling, agentes, vision ni audio.
- No esta orientado a razonamiento general, matematicas ni generacion de codigo.

## Casos de uso

- Chatbot de personaje en movil: con 64 MB en bf16 (menos cuantizado), puede ejecutarse localmente en un telefono para conversar como un personaje de fandom sin conexion ni servidor.
- Roleplay embebido en placas de bajo consumo: en una Raspberry Pi o similar, llama.cpp con los GGUF permite servir un personaje conversacional con latencia aceptable dada la escala minima del modelo.
- Prototipado rapido de bots de personaje: el formato de prompt simple y los tokens especiales facilitan integrar un personaje definido en el system prompt en minutos.
- Investigacion sobre modelos muy pequenos: al ser entrenado desde cero con configuracion documentada, sirve como sujeto de estudio para destilacion, cuantizacion extrema y efectos de corpus de nicho.
- Comparacion de cuantizaciones en navegador: el demo Lissa Playground permite evaluar en el navegador como afecta cada nivel de cuantizacion a la coherencia del texto.
- Juegos y ficcion interactiva: generacion de dialogo corto de personajes dentro de un juego o herramienta de escritura de fanfiction, donde el contexto de 1.024 tokens basta para escenas breves.
- Base para continued pretraining: aunque la variante recomendada para esto es LissaNano-Base, el checkpoint Instruct puede servir como punto de partida para ajustes adicionales de dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada es la perplejidad medida de cada cuantizacion GGUF frente al checkpoint bf16, disponible en el repositorio LissaNano-Instruct-GGUF.

## Requisitos de hardware

- VRAM para inferencia en bf16: 64 MB de pesos, mas overhead de runtime; cualquier GPU moderna sobra. Con cuantizaciones IQ2, el footprint baja aun mas.
- No requiere GPU: el objetivo declarado es edge deployment (telefonos, single-board computers, sistemas embebidos). En CPU puro es plenamente viable.
- Consumer GPUs: cualquier GPU, incluidas integradas, es suficiente; no hay requisito minimo relevante.
- Despliegue: transformers (PyTorch, sin kernels personalizados ni dependencias exoticas), llama.cpp mediante los GGUF publicados, y Ollama de forma indirecta al ser compatible con GGUF. No se menciona vLLM ni TGI, y por la escala del modelo no aportarian beneficio.
- Latencia y throughput: no disponibles; dada la escala (32M de parametros, contexto de 1.024 tokens), se espera inferencia muy rapida incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Foco |
|---|---|---|---|---|
| LissaNano-Instruct | 32M | 1.024 | Apache 2.0 | Roleplay de personaje, edge |
| LissaBrat-Instruct (misma familia) | 103M | no disponible | no disponible | Texto mas coherente, portatiles |
| Lissa 1.5B Instruct (misma familia) | 1,45B | no disponible | no disponible | Roleplay completo |

No hay modelos de terceros comparables publicados en la informacion disponible; en la categoria de modelos de rol de personaje pequenos, la alternativa natural dentro de la propia familia es LissaBrat-Instruct, que con 206 MB ofrece texto mas largo y coherente a cambio de un footprint mayor.

## Limitaciones y advertencias

- Contexto de solo 1.024 tokens: insuficiente para conversaciones largas, documentos o escenas extensas.
- Solo ingles: no hay soporte multilingue declarado.
- Dominio estrecho: entrenado sobre fandom My Little Pony y dialogos de roleplay; su rendimiento en texto general, codigo, matematicas o razonamiento sera pobre.
- Riesgo de alucinacion elevado, tipico de modelos de esta escala; no debe usarse como fuente de hechos.
- Exige un mensaje de sistema no vacio y el formato exacto de prompt; desviarse del layout degradara la salida.
- Sesgos del corpus de fandom: refleja las convenciones, tono y sesgos de esa comunidad concreta.
- Sin benchmarks publicados ni garantias de calidad mas alla de perplejidad de cuantizacion; conviene evaluarlo en el caso de uso real antes de produccion.
- Licencia Apache 2.0: sin restricciones de uso comercial relevantes, aunque el contenido generado esta condicionado por la naturaleza del entrenamiento.

## Enlaces

- Modelo: https://huggingface.co/CastIronMind/LissaNano-Instruct
- Cuantizaciones GGUF: https://huggingface.co/CastIronMind/LissaNano-Instruct-GGUF
- Demo Lissa Playground: https://huggingface.co/spaces/CastIronMind/Lissa-Playground
- LissaNano-Base: https://huggingface.co/CastIronMind/LissaNano-Base
- LissaBrat-Instruct: https://huggingface.co/CastIronMind/LissaBrat-Instruct
- Lissa 1.5B Instruct: https://huggingface.co/CastIronMind/Lissa-1.5B-Instruct
