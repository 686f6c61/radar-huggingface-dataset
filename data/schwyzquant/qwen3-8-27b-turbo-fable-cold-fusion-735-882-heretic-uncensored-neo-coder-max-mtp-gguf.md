# schwyzquant/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

schwyzquant/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un repositorio de cuantizaciones GGUF de un ajuste fino de tercera generación (multi-stage tune y multi-stage merge) construido sobre DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, derivado a su vez de un modelo de 27B de la familia Qwen 3.8. Lo publica el usuario schwyzquant y su aportación consiste en empaquetar los pesos en formato GGUF, en variantes "regular" y "MTP", con doble imatrix (DI-MATRIX).

El modelo se presenta como un ajuste "uncensored/abliterated" orientado a razonamiento, código y escritura creativa, con tres modos de pensamiento y una reducción declarada del bloque de razonamiento de entre la mitad y una décima parte respecto al modelo base. El autor afirma que la variante de 8 bits alcanza 735 puntos en ARC-C y supera los 880 en ARC-E, y que la de 4 bits llega a 719 en ARC-C.

Su interés práctico está en el despliegue local: el pipeline declarado es image-text-to-text, los idiomas soportados son inglés y chino, la licencia es Apache-2.0 y el repositorio ocupa 424,1 GB porque acumula muchos niveles de cuantización. Los parámetros totales registrados en safetensors son 26.895.998.464 (unos 26,9 B).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio no describe la arquitectura; se denomina Qwen3.8-27B y el pipeline declarado es image-text-to-text |
| Parámetros totales | 26.895.998.464 (~26,9 B) según los datos de safetensors del repositorio |
| Parámetros activos | No aplica / no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF, en variantes "Regular GGUF Quants" y "MTP GGUF Quants", generadas con doble imatrix (DI-MATRIX). El ejemplo de la model card usa Q4KS no imatrix; no se listan los niveles completos |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos cuantizados). El modelo base se etiqueta como bfloat16 y el conteo de parámetros procede de safetensors |
| Repositorio | schwyzquant, creado y actualizado el 2026-09-12 según los metadatos; 0 descargas y 0 likes en el momento de la consulta |
| Tamaño del repositorio | 424,1 GB (suma de todas las cuantizaciones publicadas) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (no se confirma si es un transformer denso, MoE o híbrido). Lo que sí se describe es el proceso de ajuste: un pipeline multi-stage tune, multi-fine tune y multi-stage merge sobre Qwen3.8-27B, con dos métodos propietarios denominados COLD FUSION (combinación de un componente "GAIN" con los entrenadores de Unsloth) y Fable Fusion 711. El método GAIN se describe como un mecanismo de programación que modifica dinámicamente el entrenamiento muestra a muestra en tiempo real según aprende el modelo; el autor afirma que esto mejoró las métricas sin "sobrecocinar" el modelo.

Los objetivos declarados del entrenamiento son cinco: aumentar la inteligencia general y la resolución de problemas, reducir el bloque de pensamiento entre la mitad y una décima parte (mediana en torno a dos tercios de reducción), reformatear y mejorar dicho bloque, acelerar la generación de tokens (en especial con MTP) y mantener o subir los benchmarks sin "benchmaxing". Los datasets empleados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se indica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El etiquetado como "heretic", "uncensored" y "abliterated" indica que se han eliminado o atenuado las capas de rechazo del modelo original.

## Capacidades

- Generación de texto y razonamiento en tres modos de pensamiento, con bloques de razonamiento mucho más cortos que el modelo base (reducción declarada de 1/2 a 1/10, mediana de ~2/3).
- Generación de código, reforzada por el componente "NEO-CODER MAX" del nombre del modelo.
- Escritura creativa, narrativa, ficción de todos los géneros y roleplaying, según los objetivos declarados del ajuste.
- Formato conversacional multi-turno (tag "conversational").
- Tool calling / function calling: la model card remite a la pestaña "community" para resultados de terceros, donde afirma el mejor rendimiento en tool calling registrado hasta la fecha; no se aportan cifras en esta información.
- Capacidad multimodal de entrada: el pipeline declarado es image-text-to-text, aunque no se detallan modalidades, resolución de imagen ni arquitectura de visión.
- Multilingüe limitado a inglés y chino.
- Generación acelerada de tokens mediante las cuantizaciones MTP (multi-token prediction), orientadas a velocidad.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo está ajustado específicamente para ficción y todos los géneros, y su bloque de razonamiento reducido abarata la generación de textos extensos donde el "pensamiento" aporta poco valor.
- Roleplay y asistentes de personaje: sin capas de rechazo y con formato conversacional, encaja en front-ends tipo SillyTavern o similares que requieren coherencia de personaje en conversaciones multi-turno.
- Generación de código en local: el componente coder y el soporte declarado de tool calling permiten integrarlo en tareas de autocompletado, refactorización o scripts dentro de entornos sin conexión a APIs externas.
- Agentes con presupuesto de tokens ajustado: al recortar el bloque de pensamiento entre la mitad y una décima parte, reduce el coste por paso en bucles de razonamiento multi-step, algo crítico cuando cada llamada consume cuota de contexto.
- Investigación sobre alineación y seguridad: es un caso de estudio de un modelo "abliterated" para comparar comportamientos, tasas de rechazo y calidad antes y después de la eliminación de capas de seguridad.
- Despliegue en hardware de consumo: al publicarse en GGUF con niveles "regular" y "MTP", permite servir el modelo en una estación de trabajo con una o dos GPU de 24 GB, sin infraestructura de centro de datos.
- Contenido bilingüe inglés-chino: redacción y traducción de material técnico o creativo entre ambos idiomas, los únicos declarados.
- Experimentación con cuantización: el repositorio incluye doble imatrix y variantes MTP, útil para medir la pérdida de calidad por nivel de cuantización (el autor declara 735 de ARC-C en 8 bits frente a 719 en 4 bits).

## Benchmarks y rendimiento

Los únicos datos numéricos presentes en la información proceden de la propia model card (afirmaciones del autor, no verificadas de forma independiente):

| Benchmark | Resultado declarado | Condiciones |
|---|---|---|
| ARC-C | 735 | Cuantización de 8 bits |
| ARC-C | 719 | Cuantización de 4 bits |
| ARC-E | 880 (superado) | Cuantización de 8 bits |
| ARC-C frente a Qwen 3.8 27B | +144 puntos | Comparación declarada por el autor |
| Conjunto de 7 benchmarks críticos | Superior al Qwen 3.8 27B base | 4 y 8 bits, según el autor |
| Conjunto de 7 benchmarks críticos | Superior a Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B | Afirmación sin cifras desglosadas |
| Tool calling | "Mejor rendimiento registrado" | Remite a la pestaña "community", no incluida en esta información |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, ni evaluaciones de terceros accesibles. Estas cifras deben tratarse como declaraciones del autor del ajuste.

## Requisitos de hardware

Estimaciones calculadas a partir del tamaño de parámetros (~26,9 B); el repositorio no publica requisitos oficiales.

- VRAM para inferencia, solo pesos: ~54 GB en FP16/BF16; ~28-29 GB en Q8_0; ~22 GB en Q6_K; ~19 GB en Q5_K_M; ~16-17 GB en Q4_K_M; ~13-14 GB en Q3_K_M.
- Caché KV adicional: no determinable, porque no se especifica la longitud de contexto soportada.
- GPU de centro de datos: A100 40 GB o 80 GB, H100 80 GB y L40S 48 GB para Q8_0 o BF16 con contexto amplio.
- Consumer GPU: cabe en una RTX 4090, RTX 3090 o RTX 5090 de 24 GB en cuantizaciones de 4 y 5 bits; en 6 bits queda muy justo con contexto corto; Q8_0 requiere reparto entre dos GPU de 24 GB o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. Se etiqueta como "endpoints_compatible". vLLM admite GGUF con limitaciones; TGI no es la vía recomendada para este formato.
- Latencia y throughput: no disponibles. La model card afirma mejoras de velocidad por las variantes MTP y por el menor número de tokens de pensamiento, pero no publica tokens/s ni latencias medidas.
- Almacenamiento: 424,1 GB para el repositorio completo; una sola cuantización de 4 bits ocupa del orden de 16-17 GB en disco.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (GGUF de Qwen3.8-27B-TURBO-...-NEO-CODER-MAX) | ~26,9 B | No disponible | ARC-C 735 (8 bits) y 719 (4 bits), según el autor | Apache-2.0 | GGUF, 0 descargas |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (base directo) | 27 B nominal | No disponible | No se aportan cifras propias en esta información | No disponible | Pesos originales (safetensors/bfloat16) |
| Qwen 3.8 27B (base original sin ajustar) | 27 B nominal | No disponible | El autor le atribuye 144 puntos menos en ARC-C que a este ajuste | No disponible | No disponible |
| Qwen3.6-35B-A3B | 35 B totales, ~3 B activos por nomenclatura | No disponible | El autor afirma que este ajuste lo supera en los 7 benchmarks críticos | No disponible | No disponible |
| Qwen3.6 27B y Qwen3.5 27B | 27 B nominal | No disponible | El autor afirma que este ajuste los supera en los 7 benchmarks críticos | No disponible | No disponible |

Los datos de contexto, licencia y disponibilidad de los modelos comparados no figuran en la información proporcionada. No se dispone de fuentes independientes que confirmen las comparaciones.

## Limitaciones y advertencias

- Modelo "uncensored", "abliterated" y "heretic": se han eliminado o atenuado las capas de rechazo, por lo que puede generar contenido ofensivo, ilegal o inseguro sin filtros. No es adecuado para aplicaciones de cara al público sin moderación externa.
- Las cifras de benchmark son declaraciones del autor del ajuste, sin verificación independiente accesible en la información disponible. La afirmación de "+144 puntos de ARC-C" sobre el modelo base es extraordinaria y debe verificarse antes de tomar decisiones.
- No se especifica la longitud de contexto, dato crítico para dimensionar caché KV y para casos de uso con documentos largos.
- Idiomas limitados a inglés y chino: el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de fidelidad, veracidad ni tasas de error publicadas.
- Sesgos: no se documenta ningún proceso de evaluación de sesgos ni de mitigación. El entrenamiento se ha centrado en métricas de capacidad, no de seguridad.
- Cadena de licencias: aunque este repositorio declara Apache-2.0, el modelo base es un ajuste de un modelo Qwen sin licencia documentada en esta información. Conviene verificar los términos de toda la cadena antes de un uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con fecha de creación y actualización idénticas (2026-09-12). No hay historial de mantenimiento.
- Tamaño del repositorio: 424,1 GB. Descargar el repositorio completo es inviable en la mayoría de entornos; hay que seleccionar un único archivo de cuantización.
- Nomenclatura engañosa: los identificadores "Qwen3.8 27B", "Qwen3.6 35B-A3B" y "Qwen 3.5 27B" no se corresponden con lanzamientos documentados en la información proporcionada; conviene contrastar su existencia y especificaciones en fuentes oficiales.
- El pipeline declarado es image-text-to-text, pero no se documenta ninguna capacidad de visión en la model card: la multimodalidad no está confirmada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/schwyzquant/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Trabajo previo citado en la model card (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Datasets citados: DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets (referenciados en las etiquetas del repositorio; sin URL directa en la información disponible)
- Pestaña "community" del repositorio: referenciada por el autor para experiencias de usuario, benchmarks de terceros y cuantizaciones alternativas
- Búsqueda web: los resultados devueltos corresponden a páginas de ayuda de YouTube y a Zhihu, sin relación con el modelo. No se ha encontrado ningún paper, blog, repositorio o demo adicional en la información disponible.
