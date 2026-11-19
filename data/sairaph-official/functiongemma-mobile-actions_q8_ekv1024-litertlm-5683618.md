# sairaph-official/functiongemma-mobile-actions_q8_ekv1024.litertlm-5683618

## Resumen

Este repositorio contiene una réplica sin modificaciones del modelo `functiongemma-mobile-actions_q8_ekv1024.litertlm`, publicado originalmente por la comunidad LiteRT y alojado por sairaph-official para su uso en la aplicación LLM Server. Se trata de un ajuste fino de `google/functiongemma-270m-it`, el modelo Gemma de 270 millones de parámetros orientado a invocación de funciones (function calling), especializado aquí en acciones móviles y empaquetado en formato LiteRT-LM para inferencia en dispositivo.

El modelo resuelve el problema de ejecutar agentes ligeros de invocación de funciones en teléfonos y dispositivos de borde sin depender de la nube: al estar cuantizado a 8 bits y limitado a una ventana de embeddings/KV de 1024 tokens, reduce huella y consumo de memoria a costa de un contexto corto. Su relevancia actual radica en la tendencia a integrar modelos pequeños de función-calling dentro de aplicaciones móviles con latencia baja y privacidad local.

La arquitectura subyacente es la de Gemma (transformer decoder-only) con 270M parámetros, ajustada para instrucciones y function calling. El repositorio no incluye pesos en safetensors ni GGUF, sino un único artefacto `.litertlm` de 284.426.240 bytes (unos 0,3 GB) pensado para el runtime LiteRT-LM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma), ajuste fino para function calling |
| Parametros totales | 270M (modelo base `google/functiongemma-270m-it`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (embedding KV length) |
| Tipos de cuantizacion | Q8 (entero de 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | LiteRT-LM (`.litertlm`), 284.426.240 bytes, sha256 `92109695f911d1872fa8ae07c1e3ff0ed70f2c3d1690d410ec6db8587c2ab409` |

## Arquitectura y entrenamiento

El modelo parte de `google/functiongemma-270m-it`, un transformer decoder-only de la familia Gemma con 270 millones de parámetros, ajustado para seguir instrucciones y emitir llamadas a funciones. Sobre esa base, el ajuste `mobile-actions` lo especializa en acciones específicas de dispositivos móviles (function calling orientado a aplicaciones y sistema operativo). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en este ajuste concreto.

La innovación técnica principal no está en la arquitectura sino en el empaquetado: el modelo se distribuye en formato LiteRT-LM, con cuantización Q8 y una longitud de embeddings/KV fijada en 1024 tokens, lo que lo hace apto para generación de secuencias en motores de inferencia LiteRT sobre hardware móvil y de borde. El repositorio de Sairaph es una copia byte a byte de los ficheros upstream, sin modificaciones, e incluye los términos de uso y la política de uso prohibido de Gemma.

## Capacidades

- Generación de texto e invocación de funciones (function calling) como capacidad central.
- Comportamiento de agente ligero para acciones móviles (tags `agent`, `mobile-actions`, `function-calling`).
- Ejecución en dispositivo mediante el runtime LiteRT-LM, con soporte de operaciones personalizadas para modelos de secuencia.
- Cuantización Q8 que reduce huella y memoria en tiempo de ejecución.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento extendido, visión o audio: no disponibles.

## Casos de uso

- Asistentes móviles con invocación de funciones: el modelo traduce lenguaje natural a llamadas estructuradas de acciones del sistema (abrir apps, ajustar ajustes), adecuado por su especialización en `mobile-actions` y su formato LiteRT para ejecución local.
- Automatización de tareas en el dispositivo: encadenar acciones dentro de una app sin conexión a la nube, aprovechando la inferencia on-device y la cuantización Q8 para reducir consumo.
- Privacidad de datos del usuario: al ejecutarse localmente mediante LiteRT-LM, las peticiones y el contexto no salen del dispositivo, lo que resulta adecuado para asistentes con datos sensibles.
- Integración en aplicaciones Android/edge: el artefacto `.litertlm` se carga directamente en el runtime LiteRT-LM, simplificando el despliegue frente a alternativas que requieren servidores GPU.
- Enrutamiento de intenciones en interfaces conversacionales: con contexto de 1024 tokens, encaja en diálogos cortos donde se mapea la intención del usuario a una función concreta.
- Prototipado de agentes de bajo coste: el tamaño de 270M y el formato Q8 permiten experimentar con pipelines de function calling en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el artefacto ocupa 284.426.240 bytes (unos 0,3 GB) en Q8, lo que sugiere una huella de memoria del orden de cientos de megabytes, aunque el runtime añade sobrecarga no cuantificada en la información.
- GPU recomendadas: no disponibles; el modelo está orientado a ejecución en dispositivo móvil y borde mediante LiteRT-LM, no a GPUs de servidor.
- ¿Cabe en GPU de consumo? No se especifica; el formato `.litertlm` está pensado para el runtime LiteRT-LM, no para vLLM, llama.cpp u Ollama.
- Opciones de despliegue: runtime LiteRT-LM o capa de interpretación LiteRT con soporte de operaciones personalizadas para modelos de secuencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| functiongemma-mobile-actions_q8_ekv1024 (este) | 270M | 1024 tokens | LiteRT-LM Q8 | Gemma Terms of Use | Especializado en acciones móviles, on-device |
| google/functiongemma-270m-it | 270M | no disponible | no disponible | Gemma Terms of Use | Modelo base del ajuste, function calling genérico |
| Alternativas de function calling on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de información de comparación en la fuente |

## Limitaciones y advertencias

- Contexto muy corto: 1024 tokens de embedding/KV limitan conversaciones largas y el encadenamiento de muchos pasos; no apto para tareas con contexto extenso.
- Especialización estrecha: el ajuste está orientado a acciones móviles y function calling; su rendimiento en tareas generales de texto o razonamiento no está documentado.
- Riesgo de alucinación: como todo modelo de 270M, puede generar llamadas a funciones inexistentes o argumentos incorrectos; requiere validación en producción.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Idiomas: no se especifican los idiomas soportados.
- Licencia: uso sujeto a los Gemma Terms of Use, incluida la sección 3.2 de restricciones y la Gemma Prohibited Use Policy; es necesario revisar ambas antes de un uso comercial.
- Repositorio espejo: es una copia sin modificaciones de un repo upstream; el autor del espejo no ofrece garantías adicionales y el repo upstream no incluía ficheros de licencia (los añadió Sairaph).
- Sin datos de benchmarks ni de latencia: no es posible estimar rendimiento comparado sin pruebas propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sairaph-official/functiongemma-mobile-actions_q8_ekv1024.litertlm-5683618
- Repositorio upstream: https://huggingface.co/litert-community/functiongemma-mobile-actions_q8_ekv1024.litertlm
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Gemma Terms of Use: https://gemma.ai/resources/terms.md
- Gemma Prohibited Use Policy: https://gemma.ai/resources/prohibited-use.md
