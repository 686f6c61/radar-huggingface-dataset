# khtsly/Nalu-2.0-Base

## Resumen

Nalu 2.0-Base es un modelo de lenguaje de tipo decoder denso especializado en generación de código Luau y Roblox, desarrollado por el usuario khtsly bajo el paraguas de la familia LuauCoder 2.0. Con 337,7 millones de parámetros totales (304M no correspondientes a embeddings), es el miembro más pequeño de una familia que también incluye Moana 2B y Kai 0.6B. Su propósito es servir como modelo base para autocompletado y continuación de código en el ecosistema Roblox, un nicho escasamente cubierto por los modelos generalistas.

Se trata de un modelo base sin plantilla de chat ni ajuste por instrucciones: continúa texto crudo en lugar de seguir órdenes, por lo que debe alimentarse con el inicio del código que se desea completar. Emplea una arquitectura transformer con 24 capas, atención con mezcla de capas RoPE y NoPE, y un diseño de atención poco convencional (CCVHA + DiffAttn V2 + XSA) que busca eficiencia en un tamaño reducido.

Su relevancia radica en dos factores: la especialización vertical en Luau (lenguaje derivado de Lua usado en Roblox) y su orientación a ejecución on-device, lo que lo hace candidato para integrarse en editores o herramientas locales sin depender de infraestructura en la nube. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (CCVHA + DiffAttn V2 + XSA) |
| Parametros totales | 337.689.648 (338M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en safetensors) |
| Idiomas soportados | Ingles (ingles para codigo y texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,7 GB) |

Otros datos tecnicos relevantes: 24 capas, 18 con RoPE y 6 con NoPE; dimensión oculta 1024; 16 cabezas de consulta (8 computadas) y 2 cabezas KV; dimensión de cabeza 128; dimensión oculta del feed-forward 3072; activación SwiGLU; normalización RMSNorm con QK-Norm; RoPE theta 500.000; vocabulario de 32.768 tokens; embeddings atados; logit soft cap de ±30; conexiones residuales Block AttnRes en 6 bloques de 4 capas.

## Arquitectura y entrenamiento

Nalu 2.0-Base es un transformer decoder denso de 24 capas con una composición de atención híbrida: 18 capas usan RoPE y 6 usan NoPE, una combinación que suele emplearse para mejorar la generalización posicional y la extrapolación de contexto. El mecanismo de atención se describe como CCVHA + DiffAttn V2 + XSA, con 16 cabezas de consulta (de las cuales 8 se computan), 2 cabezas KV y dimensión de cabeza de 128. Emplea Grouped-Query Attention de facto (16 Q frente a 2 KV) y convoluciones depthwise (2 taps) más 2 taps por cabeza, junto con un head postmix de rango 2.

El feed-forward usa SwiGLU con dimensión intermedia de 3072, normalización RMSNorm con QK-Norm y embeddings atados. Las conexiones residuales se organizan en Block AttnRes con 6 bloques de 4 capas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO; al ser un modelo base, es esperable que no haya ajuste por preferencias, pero no está confirmado en la documentación. Tampoco se detalla la innovación de decodificación especulativa ni técnicas de atención lineal más allá de las mencionadas.

## Capacidades

- Generación y continuación de código Luau y Roblox a partir de un prefijo de código.
- Autocompletado de funciones, tablas y patrones idiomáticos del ecosistema Roblox.
- Modelo base sin instrucciones: no soporta diálogo ni formato de chat; requiere prompting por continuación.
- Capacidad multilingüe limitada al inglés (según la model card).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Orientado a ejecución on-device por su reducido tamaño (338M parámetros).

## Casos de uso

- Autocompletado en editores de código para Roblox Studio: el modelo continúa el código Luau a partir del prefijo escrito por el desarrollador, integrándose en un plugin de editor mediante inferencia local gracias a sus 338M de parámetros.
- Generación de boilerplate de scripts Luau: a partir de una firma de función o una estructura de tabla, el modelo completa la implementación típica de patrones Roblox (eventos, servicios, remotes).
- Herramientas de formación y snippets: un asistente local que sugiere fragmentos de código Luau en documentación o tutoriales, sin coste de API y con latencia baja en CPU o GPU de consumo.
- Prototipado rápido de lógica de juego: completar funciones auxiliares (interpolación, gestión de inventario, temporizadores) a partir de un comentario o firma inicial.
- Inferencia en dispositivos de gama baja: al caber en memoria de GPUs integradas o incluso CPU, permite desplegar asistencia de código en entornos sin acceso a la nube.
- Base para fine-tuning específico: al ser un modelo base con licencia Apache 2.0, sirve como punto de partida para ajuste supervisado en dominios concretos de Roblox (por ejemplo, un estilo de código de un estudio).
- Filtrado o clasificación de código Luau: mediante continuación condicionada, puede emplearse en tareas auxiliares de generación de ejemplos para tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,7 GB de pesos, más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos moderados.
- En cuantización de 8 bits o 4 bits (si se generan pesos GGUF, no publicados), cabría en menos de 0,5 GB, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs integradas; también es viable en CPU.
- Cabe holgadamente en GPU consumer y en dispositivos con poca memoria.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `attn_implementation="sdpa"` o `"flash_attention_2"`; no se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, y el uso de código personalizado puede complicar la conversión a GGUF.
- Latencia y throughput: no disponibles; por tamaño, se espera latencia muy baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nalu 2.0-Base | 338M | no disponible | Luau / Roblox | Apache 2.0 | Hugging Face (khtsly) |
| Kai 0.6B (LuauCoder 2.0) | 0,6B (aprox.) | no disponible | Luau / Roblox | no disponible en la informacion | Misma familia |
| Moana 2B (LuauCoder 2.0) | 2B (aprox.) | no disponible | Luau / Roblox | no disponible en la informacion | Misma familia |
| Modelos generalistas pequeños (p. ej. Qwen2.5-Coder-0.5B) | 0,5B | 32K (tipico) | Codigo general | Apache 2.0 | Hugging Face |

La comparación con modelos generalistas pequeños es aproximada: no se dispone de benchmarks de Nalu 2.0-Base que permitan contrastar rendimiento en Luau frente a alternativas. La ventaja diferencial es la especialización en el ecosistema Roblox y el tamaño reducido para on-device.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene formato de chat; usarlo como asistente conversacional producirá resultados deficientes.
- Riesgo de alucinación en APIs de Roblox: puede generar llamadas a servicios o métodos inexistentes o con firmas incorrectas.
- Idiomas: solo inglés documentado; el soporte de otros idiomas no está garantizado.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse presumiblemente con código, puede reproducir patrones y estilos de repositorios públicos.
- Licencia Apache 2.0 permite uso comercial, pero el uso de `trust_remote_code=True` implica ejecutar código del autor; conviene auditar el código personalizado antes de desplegarlo en producción.
- Sin cuantizaciones oficiales publicadas ni integración documentada con runtimes de inferencia populares, lo que puede requerir trabajo adicional de conversión.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/khtsly/Nalu-2.0-Base
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
