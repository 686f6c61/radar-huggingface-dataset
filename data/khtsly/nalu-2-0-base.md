# khtsly/Nalu-2.0-Base

## Resumen

Nalu 2.0 Base es un modelo de lenguaje de tipo decoder denso especializado en la generacion de codigo Luau y Roblox, desarrollado por el usuario khtsly. Con 338 millones de parametros totales (304 millones no pertenecientes a embeddings), 24 capas y una ventana de contexto de 65.536 tokens, se posiciona como el miembro mas pequeno de la familia LuauCoder 2.0, que tambien incluye Moana 2B y Kai 0.6B. Su proposito es ofrecer generacion de codigo Luau de calidad en dispositivos con recursos limitados, gracias a su reducido tamano y a su diseno orientado a la inferencia on-device.

Se trata de un modelo base, sin plantilla de chat ni ajuste por instrucciones, por lo que su funcion es la continuacion de texto: se le proporciona el inicio del codigo y el modelo completa la secuencia. Esto lo hace especialmente adecuado para tareas de autocompletado de codigo dentro de editores y entornos de desarrollo de Roblox Studio, donde el contexto de las APIs de Roblox y la sintaxis de Luau es critico.

La relevancia actual del modelo radica en su enfoque vertical: en lugar de competir en capacidades generales, concentra su entrenamiento de 66.300 millones de tokens en un dominio especifico (Luau y Roblox), lo que permite obtener un rendimiento especializado con una huella de parametros muy reducida. Su licencia Apache 2.0 facilita su integracion comercial y su experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder denso (transformer) con 24 capas |
| Parametros totales | 338M (304M no-embedding) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors, bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Nalu 2.0 Base es un transformer decoder denso con 24 capas, dimension oculta de 1024 y una dimension de feed-forward de 3072 con activacion SwiGLU. Emplea normalizacion RMSNorm con QK-Norm y un vocabulario de 32.768 tokens con embeddings atados. La composicion de capas de atencion combina 18 capas con RoPE (theta de 500.000) y 6 capas sin RoPE (NoPE), lo que sugiere un diseno hibrido para mejorar la extrapolacion de contexto. El mecanismo de atencion incorpora CCVHA, DiffAttn V2 y XSA, con 16 cabezas de consulta (8 computadas), 2 cabezas KV y 8 cabezas de salida, con dimension de cabeza de 128. Las conexiones residuales usan Block AttnRes en 6 bloques de 4 capas, y se aplica un logit soft cap de ±30. El modelo incluye ademas convoluciones depthwise (2 taps) y un postmix de cabezas de rango 2.

El entrenamiento se realizo sobre 66.300 millones de tokens, aunque la model card no detalla la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (al ser un modelo base, es previsible que no haya ajuste por preferencias, pero no se confirma explicitamente). La innovacion principal reside en la combinacion de atencion con capas RoPE/NoPE y mecanismos como DiffAttn V2 y XSA, orientados a un mejor modelado de secuencias largas de codigo dentro de un presupuesto de parametros muy ajustado.

## Capacidades

- Generacion y continuacion de codigo Luau y scripts de Roblox.
- Autocompletado de funciones, estructuras de control y llamadas a APIs de Roblox.
- Modelo base sin plantilla de chat: no sigue instrucciones, solo continua texto.
- Capacidad de razonamiento limitada al dominio de codigo (no es un modelo generalista).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles (y sintaxis de Luau).
- Modo thinking, vision o audio: no disponible.
- Entrenado para inferencia on-device gracias a su reducido tamano.

## Casos de uso

- Autocompletado de codigo en Roblox Studio: el modelo puede integrarse como motor de sugerencias en el editor, completando lineas y bloques de Luau a partir del contexto previo, gracias a su ventana de 65.536 tokens y su entrenamiento especifico en APIs de Roblox.
- Generacion de scripts de gameplay: dado un comentario o el inicio de una funcion, el modelo completa la logica de un script (por ejemplo, un sistema de inventario o un controlador de personaje), lo que acelera el prototipado en proyectos de Roblox.
- Asistente de documentacion de codigo: puede continuar fragmentos de codigo para generar ejemplos de uso de APIs de Roblox, utiles en documentacion tecnica o tutoriales.
- Herramienta de refactorizacion asistida: al ser un modelo de continuacion, puede emplearse para proponer alternativas de implementacion a partir de un fragmento existente, siempre con supervision humana.
- Inferencia en dispositivos de bajos recursos: con 338M de parametros, puede desplegarse en portatiles o entornos sin GPU dedicada, lo que permite integrarlo en herramientas locales de desarrollo sin depender de la nube.
- Generacion de codigo en pipelines de CI para Roblox: puede usarse para producir snippets de prueba o plantillas de scripts en procesos automatizados de generacion de codigo, aunque requiere validacion posterior.
- Educacion y aprendizaje de Luau: sirve como modelo de continuacion para mostrar patrones de codigo idiomaticos en Roblox, util en entornos de formacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bfloat16 (338M parametros), inferior a 0,4 GB en cuantizacion de 8 bits y en torno a 0,2 GB en 4 bits (estimaciones teoricas a partir del numero de parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 o superior permite inferencia holgada. Tambien cabe en GPUs de gama baja e incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 1 GB de VRAM, y es viable en CPU.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), y previsiblemente llama.cpp u Ollama si se generan conversiones GGUF (no confirmado por el autor). El ejemplo de la model card usa `attn_implementation="sdpa"` o `"flash_attention_2"`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nalu 2.0 Base | 338M | 65.536 | Luau / Roblox | Apache 2.0 | Hugging Face |
| Kai 0.6B (LuauCoder 2.0) | 600M (aprox.) | No disponible | Luau / Roblox | No disponible | Hugging Face (familia LuauCoder) |
| Moana 2B (LuauCoder 2.0) | 2B (aprox.) | No disponible | Luau / Roblox | No disponible | Hugging Face (familia LuauCoder) |

Los datos de Kai y Moana provienen unicamente de la mencion en la model card de Nalu 2.0; no se dispone de sus especificaciones completas ni de benchmarks comparativos.

## Limitaciones y advertencias

- Es un modelo base sin plantilla de chat: no sigue instrucciones ni mantiene conversaciones; solo continua texto.
- Entrenado unicamente en ingles y en el dominio de Luau/Roblox; su rendimiento fuera de ese dominio sera limitado.
- Riesgo de alucinacion en APIs de Roblox: puede generar llamadas a funciones inexistentes o con firmas incorrectas, por lo que requiere validacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento (no detalladas).
- Requiere `trust_remote_code=True` por el codigo personalizado de la arquitectura, lo que implica ejecutar codigo del autor.
- No se han publicado benchmarks, por lo que su calidad real no esta cuantificada de forma publica.
- El numero de descargas (889) y likes (1) es bajo, lo que sugiere una adopcion limitada y poca validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/khtsly/Nalu-2.0-Base
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
