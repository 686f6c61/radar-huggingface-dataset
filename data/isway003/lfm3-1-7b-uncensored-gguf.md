# iSway003/LFM3-1.7B-Uncensored-GGUF

## Resumen

LFM3-1.7B-Uncensored-GGUF es una cuantización GGUF de la versión "ablacionada en seguridad" del modelo LFM3-1.7B de LiquidAI, publicada por el usuario iSway003 (los cuantizados originales los produce el equipo de AtomicChat). Se trata de un transformer de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) cuyo propósito declarado es eliminar los rechazos de seguridad del modelo base mediante una edición de pesos dirigida, manteniendo el resto de capacidades intactas según las métricas reportadas por el autor.

La modificación consiste en una LoRA de rango 1 proyectada (dirección = media de activaciones dañinas menos media de activaciones inofensivas, con la componente inofensiva proyectada fuera) horneada en los pesos con un factor W*=2.0, seguida de cuantización AD (adaptive quantization). El modelo base es LiquidAI/LFM3-1.7B, un modelo de la familia LFM3 de LiquidAI orientado a generación de texto y conversación.

Es relevante ahora porque ofrece, en un paquete de 1,1-1,6 GB, un modelo pequeño ejecutable en local con llama.cpp que elimina por completo los rechazos en prompts dañinos (0,0 % frente a 61,7 % del base) sin degradación medible en MMLU (41,0 % en ambos) ni en recuperación de contexto largo (3/3 en ambos). La licencia subyacente es la LFM Open License v1.0, que impone restricciones de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de LiquidAI); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (se reporta prueba "needle" 3/3, sin cifra de ventana) |
| Tipos de cuantización | AD-Q6_K (7,31 bpw, 1,6 GB) y AD-Q4_K_M (5,20 bpw, 1,1 GB) |
| Idiomas soportados | en, zh, de |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizado); el base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de 1,7 mil millones de parámetros derivado de LiquidAI/LFM3-1.7B. La información disponible no detalla la composición del dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en el base. Lo que sí se documenta es el proceso de modificación: se calcula una dirección de rango 1 a partir de la diferencia entre la media de activaciones en prompts dañinos y la media en prompts inofensivos, se proyecta fuera la componente inofensiva y se hornea una LoRA con esa dirección en los pesos con factor W*=2.0. Posteriormente se aplica cuantización adaptativa (AD) para producir los dos niveles GGUF publicados.

El autor reporta controles de calidad: la edición dirigida reduce MMLU en 0,0 puntos (McNemar p=1.0), mientras que una edición aleatoria del mismo tamaño habría caído 1,3 puntos y con mayor divergencia KL (0,028 frente a 0,019 de la edición dirigida). También se verifican ausencia de bucles de razonamiento y de salidas vacías en W*=2.0. La inferencia requiere una compilación de llama.cpp con soporte para LFM3 (fusionado en el PR #31252, producido en el commit 19cce69).

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y alemán.
- Razonamiento general y respuesta a preguntas (MMLU 41,0 % en 2.000 preguntas).
- Recuperación de información en contexto largo (prueba needle 3/3).
- Eliminación de rechazos de seguridad: 0,0 % de rechazos en prompts dañinos y 0,0 % de falsos rechazos en XSTest.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo sin capa de rechazo para analizar cómo representa y responde a contenidos sensibles, comparándolo con el base (61,7 % de rechazos) en entornos controlados.
- Evaluación de técnicas de ablación: sirve como referencia reproducible de una edición de rango 1 con métricas publicadas (ΔKLD, MMLU, XSTest) para validar metodologías de modificación de pesos.
- Despliegue local en hardware modesto: con 1,1 GB en AD-Q4_K_M puede ejecutarse en CPU o GPU de gama baja mediante llama.cpp, útil para prototipos offline.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas que el modelo base rechazaría, en inglés, chino o alemán.
- Experimentación con cuantización adaptativa: los dos niveles AD permiten comparar calidad y tamaño (7,31 frente a 5,20 bpw) en pipelines de evaluación propios.
- Docencia y demostraciones de inferencia local: el tamaño reducido y el comando de una línea de llama-cli facilitan talleres sobre modelos cuantizados y su ejecución sin conexión.

## Benchmarks y rendimiento

| Métrica | Base | Uncensored |
|---|---|---|
| Rechazos en prompts dañinos | 61,7 % | 0,0 % |
| Falsos rechazos (XSTest) | 5,2 % | 0,0 % |
| MMLU (2.000 preguntas) | 41,0 % | 41,0 % (McNemar p=1.0) |
| Needle (contexto largo) | 3/3 | 3/3 |
| ΔKLD frente al base (neutral) | — | +0,019 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB para AD-Q4_K_M y 1,6 GB para AD-Q6_K, más overhead de contexto y del runtime.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM; también es viable en CPU.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Despliegue: llama.cpp (obligatorio un build con soporte LFM3, PR #31252, commit 19cce69); el tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detallan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Uncensored-GGUF (este) | 1,73 B | no disponible | LFM Open License v1.0 | GGUF (AD-Q4_K_M, AD-Q6_K) | Sin rechazos, MMLU 41,0 % |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | LFM Open License v1.0 | safetensors | Rechazos 61,7 %, MMLU 41,0 % |
| Otras alternativas de ~1,7 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Elimina deliberadamente los rechazos de seguridad: puede generar contenido dañino, ofensivo o ilegal; no es apto para aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación inherente a un modelo de 1,7 B; MMLU de 41,0 % indica capacidad de conocimiento limitada.
- Solo soporta inglés, chino y alemán; no se documenta castellano.
- La LFM Open License v1.0 impone restricciones de uso comercial; es necesario revisar el texto completo antes de cualquier despliegue productivo.
- Requiere un build específico de llama.cpp con soporte LFM3; versiones anteriores no cargarán el modelo.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional a la del autor.
- La model card original corresponde a AtomicChat; esta publicación de iSway003 redistribuye los cuantizados, por lo que conviene verificar la integridad de los archivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iSway003/LFM3-1.7B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Aplicación Atomic Chat: https://atomic.chat/
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de AtomicChat: https://x.com/atomic_chat_hq
- PR de llama.cpp con soporte LFM3: #31252 (commit 19cce69)
