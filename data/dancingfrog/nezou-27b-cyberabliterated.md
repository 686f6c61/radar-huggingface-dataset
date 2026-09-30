# dancingfrog/Nezou-27B-CyberAbliterated

## Resumen

Nezou-27B-CyberAbliterated es un checkpoint de precisión completa (BF16) derivado de Qwen/Qwen3.8-27B, el modelo denso multimodal de la familia Qwen3.8, publicado por el usuario dancingfrog. No es un fine-tune ni un reentrenamiento: es una edición de pesos en forma cerrada que elimina la dirección de rechazo del modelo base mediante una técnica de "abliteration" dirigida a prompts de investigación en seguridad (ciberseguridad autorizada). El resultado conserva intactos la arquitectura, el torreón de visión, el tokenizer, la plantilla de chat y el modo de pensamiento del modelo original.

El modelo cuenta con 27.781.427.952 parámetros reales (27,78 mil millones), se distribuye en 18 fragmentos de safetensors con 1.199 tensores y un total de 55.562.855.904 bytes de pesos (unos 52 GiB en disco). Solo se editaron 80 tensores: las matrices de proyección `self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj` de las capas 24 a 63 del modelo de lenguaje. Los fragmentos 1 a 7 y el 18 son idénticos byte a byte al modelo base.

Su relevancia actual es doble. Por un lado, sirve como caso de estudio de una técnica de modificación de comportamiento muy quirúrgica, aplicada sobre una arquitectura híbrida reciente (`qwen3_5`, con Gated DeltaNet de atención lineal combinada con atención completa) y con soporte de visión. Por otro, es el checkpoint exacto del que se cuantizó la variante NVFP4/FP8 del mismo autor, pensada para servir en una única GPU de consumo. La model card advierte explícitamente de que su propósito es responder a prompts de seguridad que el modelo base rechazaría, lo que lo convierte en una herramienta para equipos de seguridad y no en un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen3_5` (Gated DeltaNet de atención lineal + atención completa), multimodal visión-lenguaje, 64 capas de lenguaje |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Checkpoint nativo en BF16; variante cuantizada separada con NVFP4 en las MLP y FP8 en atención, KV y lm_head; no se listan GGUF en este repositorio |
| Idiomas soportados | Inglés (`en`), según los metadatos de la model card |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (BF16, 18 fragmentos, 1.199 tensores, 55.562.855.904 bytes) |

Otros datos de interés: pipeline `image-text-to-text`, librería `transformers`, repositorio de 55,6 GB, autor `dancingfrog`, creado y actualizado el 29 de septiembre de 2026, 0 descargas y 0 "likes" en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones: un transformer híbrido de la familia `qwen3_5` que combina capas de atención lineal Gated DeltaNet (identificables por `linear_attn.out_proj`) con capas de atención completa (`self_attn.o_proj`), más un codificador de visión para entrada de imágenes. El modelo de lenguaje tiene 64 capas y, según la receta publicada, se ejecuta por defecto en modo de pensamiento (*thinking mode*), con soporte de los parámetros `reasoning_effort` y `preserve_thinking` del modelo base.

No hay entrenamiento en el sentido habitual: no hubo fine-tuning, ni pasos de gradiente, ni mezcla de datasets, ni RLHF o DPO. El procedimiento aplicado es una abliteración de dirección única, en la familia de Heretic / mlx-abliteration:

1. **Sondeo.** Se ejecuta el modelo base sobre un conjunto fijo de prompts de ciberseguridad (investigación autorizada) y se capturan activaciones por capa en las 64 capas del modelo de lenguaje. Para cada capa se extrae la dirección principal de las activaciones relacionadas con el rechazo mediante PCA (`mean_direction`).
2. **Selección.** Se toma la dirección media de rechazo normalizada de la capa 53 como dirección única de abliteración (norma unitaria).
3. **Aplicación.** Para cada capa de la 24 a la 63 se proyecta fuera esa dirección en tres matrices de pesos por capa: `self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj`, según `W' = W − s · (r ⊗ (rᵀ W))` con `s = 1.0`. Después, cada columna de `W'` se reescala a la norma de columna original de `W`, de modo que la magnitud global de los pesos (y el resto del comportamiento del modelo) se mantiene estable.
4. **Resultado.** 80 tensores modificados en sitio. El codificador de visión, los embeddings, las normas, `config.json`, el tokenizer, la plantilla de chat y la configuración de generación no se tocaron.

La evaluación publicada se hizo bajo *fake-quantization* de 4 bits para anticipar el comportamiento tras cuantizar, no en BF16. Los conjuntos de prueba fueron tres: ciberseguridad (61 prompts, 3 rechazos, 4,9 %), dañinos (20 prompts, 0 rechazos, 0 %) y benignos (20 prompts, 0 rechazos, 0 %).

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat del modelo base.
- Razonamiento explícito en modo de pensamiento, activable por plantilla de chat (`enable_thinking`) y ajustable con `reasoning_effort` y `preserve_thinking`.
- Entrada de imágenes (`image-text-to-text`): el torreón de visión se conserva sin cambios, por lo que mantiene las capacidades visión-lenguaje del modelo base.
- Respuesta a prompts de investigación en seguridad y ciberseguridad que el modelo base rechazaría, objetivo declarado de la abliteración.
- Servicio mediante endpoints compatibles con la API de OpenAI, lo que facilita su integración en herramientas existentes.
- Capacidades multilingües: limitadas al inglés según los metadatos disponibles; no se documentan otros idiomas.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible para este checkpoint (depende del modelo base, cuya model card no se ha consultado en detalle).
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo de pensamiento es el único mecanismo de razonamiento descrito.
- Capacidades especiales documentadas: visión, modo de pensamiento, abliteración de la dirección de rechazo en las capas 24-63.

## Casos de uso

- **Investigación de seguridad autorizada:** explicar el funcionamiento de clases de vulnerabilidades (por ejemplo, errores de formato de cadena) en el contexto de un programa de divulgación o de una auditoría con permiso explícito. Es el caso para el que el checkpoint fue construido y donde su tasa de rechazo medida es del 4,9 % sobre 61 prompts.
- **Ejercicios CTF y formación interna:** generar y explicar retos de captura de bandera, o servir como asistente de un entorno de laboratorio aislado donde el equipo de seguridad practica técnicas ofensivas.
- **Red teaming de sistemas propios:** emplear el modelo como generador de casos de prueba adversarios contra los filtros y clasificadores de una organización, siempre sobre infraestructura propia y con autorización documentada.
- **Revisión de código con foco en seguridad:** analizar repositorios o fragmentos de código en busca de patrones inseguros, aprovechando que el modelo puede aceptar también capturas de pantalla o diagramas gracias al torreón de visión.
- **Análisis de imágenes técnicas:** interpretar capturas de tráfico de red, diagramas de topología, salidas de herramientas o paneles de monitorización al ser un modelo `image-text-to-text`.
- **Triaje asistido de alertas:** mantener conversaciones multi-turno para resumir y contextualizar alertas de un SIEM, con el modelo desplegado en la propia infraestructura para no enviar datos sensibles a terceros.
- **Generación de documentación y material de concienciación:** producir guías internas sobre clases de ataque, vectores de entrada o procedimientos de respuesta, a partir de las cuales el equipo de seguridad redacta el material final.
- **Servicio self-hosted en un endpoint compatible con OpenAI:** integrar el modelo en herramientas internas (IDE, terminal, orquestadores) mediante una API `/v1`, con el control de acceso delegado a la plataforma que lo expone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evaluación publicada es la de tasas de rechazo bajo *fake-quantization* de 4 bits:

| Conjunto de prompts | Prompts | Rechazos | Tasa de rechazo |
|---|---|---|---|
| Ciberseguridad (investigación autorizada) | 61 | 3 | 4,9 % |
| Dañinos | 20 | 0 | 0 % |
| Benignos | 20 | 0 | 0 % |

No hay datos publicados de degradación de capacidades generales tras la abliteración, ni comparación con el modelo base en tareas estándar.

## Requisitos de hardware

- **VRAM para inferencia:** el autor indica que se necesitan aproximadamente 60 GiB de VRAM o más para un servicio con contexto utilizable en BF16. Los pesos ocupan 55,56 GB (unos 52 GiB), por lo que el margen para caché KV en una GPU de 80 GiB es limitado.
- **GPU recomendadas:** una única aceleradora de 80 GiB (A100 80 GB, H100 80 GB) o un grupo multi-GPU con paralelismo tensorial.
- **GPU de consumo:** no cabe en una GPU de consumo de 32 GiB. El propio autor remite a la variante cuantizada NVFP4, verificada para funcionar en una RTX 5090 de 32 GiB.
- **Opciones de despliegue:** es un checkpoint BF16 estándar, sin flags de cuantización especiales, y funciona en SGLang o vLLM. Dado que la arquitectura es el híbrido `qwen3_5` (Gated DeltaNet + atención completa), es necesario usar builds que soporten esa arquitectura (el autor menciona las *nightlies* actuales de SGLang/vLLM). No se documenta soporte en llama.cpp u Ollama para este repositorio.
- **Latencia y throughput:** no disponibles en la información proporcionada.
- **Configuración de muestreo recomendada:** modo de pensamiento con `temperature=1.0`, `top_p=0.95`, `top_k=20`; modo sin pensamiento con `temperature=0.7`, `top_p=0.80`, `top_k=20`, `presence_penalty=1.5`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nezou-27B-CyberAbliterated (este) | 27,78 B | No disponible | safetensors BF16 (18 fragmentos) | Apache-2.0 | Abliteración de dirección única (capa 53, aplicada a capas 24-63); 4,9 % de rechazo en 61 prompts de ciberseguridad |
| Qwen/Qwen3.8-27B (base) | 27 B (según la card) | No disponible | No disponible | Apache-2.0 | Modelo oficial sin modificar; conserva el comportamiento de rechazo original |
| Nezou-27B-CyberAbliterated-NVFP4 | Mismo modelo cuantizado | No disponible | NVFP4 + FP8 | Apache-2.0 | Cuantización PTQ con NVIDIA ModelOpt a partir de este checkpoint; verificada en una RTX 5090 de 32 GiB |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF | No disponible | No disponible | GGUF (escalera estándar) | No disponible | Otra abliteración del mismo modelo base mediante proceso a nivel de pesos, convertida a GGUF para llama.cpp |
| Qwen3.8-27B "OBLITERATED" (Pliny) | No disponible | No disponible | No disponible | No disponible | Variante que reporta 0,0 % de rechazo sobre 842 prompts dañinos, con foco declarado en ciberseguridad y generación de jailbreaks |

No se dispone de contexto, datos de rendimiento ni resultados de benchmarks comparables entre estas variantes, por lo que la comparación se limita a linaje, formato y licencia.

## Limitaciones y advertencias

- **Eliminación deliberada de salvaguardas:** el propósito declarado del checkpoint es responder a prompts que el modelo base rechaza. Aunque la evaluación se centra en ciberseguridad, la tabla publicada muestra también 0 % de rechazo sobre 20 prompts dañinos, lo que indica que el efecto no se limita al dominio objetivo. Requiere controles de acceso estrictos y uso exclusivamente autorizado.
- **Riesgo de alucinación:** no se documenta ninguna evaluación de fidelidad. En dominios técnicos como la explicación de vulnerabilidades o exploits, un detalle inventado puede ser especialmente engañoso; toda salida debe verificarse.
- **Evaluación muy limitada:** 101 prompts en total, y realizados bajo *fake-quantization* de 4 bits, no en BF16. No hay benchmarks estándar ni medición de degradación de capacidades generales tras la abliteración.
- **Sesgos:** no documentados por el autor. Al entrenarse solo en inglés, el comportamiento en otros idiomas no está caracterizado.
- **Limitación de idioma:** los metadatos declaran únicamente inglés (`en`).
- **Contexto:** no se especifica la ventana de contexto en la información disponible, lo que impide planificar despliegues que dependan de contexto largo.
- **Dependencia de frameworks recientes:** al ser una arquitectura híbrida `qwen3_5`, requiere builds de SGLang o vLLM que la soporten (el autor menciona *nightlies*), lo que introduce riesgo de inestabilidad o cambios de comportamiento entre versiones.
- **Licencia:** Apache-2.0 heredada del modelo base, lo que en principio permite uso comercial. No obstante, la responsabilidad legal y ética del uso recae por completo en quien despliega el modelo, y las políticas de uso aceptable del modelo original podrían no estar reflejadas en este derivado.
- **Sin validación comunitaria:** el repositorio presenta 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay corroboración independiente de sus resultados ni de su estabilidad.
- **No apto para producción de propósito general:** no se recomienda exponerlo directamente a usuarios finales sin moderación externa, dado que su comportamiento por defecto es no rechazar solicitudes sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dancingfrog/Nezou-27B-CyberAbliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante cuantizada NVFP4: https://huggingface.co/dancingfrog/Nezou-27B-CyberAbliterated-NVFP4
- Abliteración alternativa en GGUF del mismo base: https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF
- Análisis de la variante "OBLITERATED" del mismo modelo base: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
