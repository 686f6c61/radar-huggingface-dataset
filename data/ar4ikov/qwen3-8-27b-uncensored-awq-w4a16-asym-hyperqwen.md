# Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen

## Resumen

Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen es una versión cuantizada y prefabricada para servir con HyperQwen del modelo Qwen3.8-27B-Uncensored, un ajuste fino "abliterated" (sin alineamiento de seguridad) derivado de Qwen/Qwen3.8-27B. Lo publica el usuario Ar4ikov y su propósito es muy concreto: permitir que un modelo de 27.356.728.560 parámetros se sirva en una única tarjeta gráfica de 24 GB dejando espacio suficiente para la caché KV y para decodificación especulativa.

El checkpoint parte de la exportación en int4 asimétrico AWQ (grupo 128, con zero points, cuantizada con llm-compressor desde pesos bf16) y aplica encima la transformación del pipeline `prepare/` de HyperQwen: `lm_head` y `embed_tokens` pasan a int8 simétrico (grupo 128), el módulo MTP también a int8 y se añade una cabeza draft de 40.960 filas para decodificación especulativa. El cuerpo (64 capas) y la torre de visión permanecen intactos, con la torre y las proyecciones de puerta SSM en bf16. El resultado es un repositorio de 16,9 GB listo para vLLM 0.29.0, con licencia Apache-2.0.

Su relevancia es doble: por un lado demuestra una receta práctica de cuantización híbrida (int4 en el cuerpo, int8 en cabezas y embeddings) que evita repetir un paso de preparación de ~10 minutos en CPU por máquina; por otro, sirve de caso de estudio sobre arquitecturas híbridas Gated-DeltaNet + atención con decodificación especulativa MTP en GPUs de consumo. El modelo es multimodal (pipeline `image-text-to-text`) y su comportamiento conversacional hereda del finetune sin censura de orcarouter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated-DeltaNet / atención, 64 capas, con cabeza MTP (multi-token prediction) y torre de visión |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens con `--max-model-len 65536` en vLLM estándar; probado hasta 100.000 con caché KV en fp8 y perfil `CTX=long`; máximo oficial del modelo base: no disponible |
| Tipos de cuantizacion | Cuerpo: int4 asimétrico AWQ W4A16, grupo 128, con zero points. `lm_head`, `embed_tokens` y módulo MTP: int8 simétrico grupo 128. Torre de visión, proyecciones de puerta SSM y normas de la cabeza MTP: bf16. Variante `-fast` con `lm_head` en int4-GPTQ. Perfiles W4A8 (int8 en activaciones) documentados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), librería vllm |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas Gated-DeltaNet (un modelo de espacio de estados con puertas) con capas de atención convencional, 64 capas en total, más una torre de visión que lo habilita como modelo imagen-texto-a-texto. Incluye un módulo MTP (multi-token prediction) con ocho capas lineales, incluida `mtp.fc`, que actúa como cabeza predictora extra y se reutiliza para decodificación especulativa. La model card menciona explícitamente los "AWQ mappings for the hybrid Gated-DeltaNet / attention layers", lo que confirma que la receta de cuantización tuvo que adaptarse a esta mezcla de tipos de capa en lugar de aplicar un esquema homogéneo.

No se documenta en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el finetune sin censura de orcarouter/Qwen3.8-27B-Uncensored. Lo que sí se detalla es la receta de cuantización: el cuerpo se cuantizó a int4 asimétrico con grupo 128 y zero points usando llm-compressor partiendo de pesos bf16, y el pipeline de HyperQwen cuantizó después las cabezas a int8 simétrico con un error de ida y vuelta declarado de 0,7 % para `lm_head` y 0,65 % para `embed_tokens`. La innovación destacable no está en el entrenamiento sino en el empaquetado: se precalcula la cabeza draft (40.960 filas recortadas del `lm_head` int8) y el índice de vocabulario, de modo que el usuario final solo descarga en lugar de repetir el proceso de preparación.

## Capacidades

- Generación de texto conversacional multi-turno en el pipeline `image-text-to-text`.
- Comprensión de imágenes: la model card indica que describe correctamente imágenes en todos los perfiles medidos (se cita una prueba con un cuadrado rojo dibujado, un círculo azul y una línea de texto).
- Decodificación especulativa nativa mediante la cabeza MTP incluida, con 2,58 a 3,49 tokens aceptados por paso según el perfil.
- Compatibilidad con el decodificador especulativo DFlash2 (k=15 en la línea de producción).
- Servicio con caché KV en bf16 o fp8 y con perfil de contexto largo de hasta 100.000 tokens en las pruebas del autor.
- Soporte de cuantización de activaciones (W4A8) mediante `INT8_ACT=int8` y `PREFILL_ATTN=int8` en la línea de producción.
- Comportamiento "uncensored" (abliterated): responde sin las restricciones de alineamiento del modelo original, heredado del finetune base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 27B en una estación de trabajo con una sola GPU de 24 GB: el repositorio pesa 16,9 GB en int4, lo que deja margen para caché KV (entre 37.834 y 164.705 tokens de pool según el perfil medido) sin necesidad de servidores multi-GPU.
- Asistentes conversacionales con contexto largo: el perfil `CTX=long MAX_LEN=100000` con caché fp8 permite mantener conversaciones o documentos de hasta 100.000 tokens, adecuado para análisis de documentación extensa o historiales de soporte.
- Procesamiento de documentos con imágenes: al aceptar entrada imagen-texto, puede extraer y describir contenido de capturas, diagramas o páginas escaneadas dentro de un mismo flujo conversacional.
- Generación asistida por decodificación especulativa en producción: gracias a la cabeza MTP incluida y al soporte de DFlash2, se obtienen entre 107 y 136 tokens/s en una RTX 3090 con respuestas de 1.024 tokens, lo que hace viable servir a usuarios concurrentes (hasta 481 tokens/s agregados con 8 peticiones simultáneas).
- Entornos de investigación sobre arquitecturas híbridas SSM + atención: el checkpoint conserva intactos los mapeos AWQ de las capas Gated-DeltaNet, lo que permite estudiar el impacto de la cuantización int4 asimétrico en este tipo de capas.
- Investigación sobre decodificación especulativa: el repositorio incluye la cabeza draft y la lista de identificadores de vocabulario, lo que facilita medir tasas de aceptación (tok/step) sin reentrenar componentes.
- Investigación sobre alineamiento y censura: al ser una variante abliterated, sirve como punto de comparación frente a la versión alineada para estudiar diferencias de comportamiento, siempre que el caso de uso lo justifique legal y éticamente.
- Servicio de baja latencia en primera respuesta: la línea de producción documentada reporta un TTFT de 96 ms en el perfil de 36.000 tokens con decodificación especulativa DFlash2 k=15.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni MMMU). Lo único medido y documentado son cifras de throughput y aceptación especulativa en RTX 3090 (350 W) con vLLM 0.29.0, rama `Ar4ikov/HyperQwen@awq-asym`, segunda ejecución tras el arranque, `VISION=1` y la torre de visión transmitida desde RAM del host por imagen:

| Perfil | C1 T=default (tok/s) | C1 T=0 (tok/s) | tok/step | C8 T=default (tok/s) | Pool KV (tokens) |
|---|---|---|---|---|---|
| `SPEC=mtp CTX=fast` (64k, KV bf16) | 107,4 | 117,2 | 2,71 / 2,85 | 441 | 70.933 |
| `SPEC=dflash2 CTX=fast KV_MEM=4300000000 DFLASH_MAX_LEN=49152` | 123,0 | 135,7 | 3,15 / 3,41 | 481 | 49.662 |
| Línea de producción: DFlash2 k=15 + `INT8_ACT=int8 PREFILL_ATTN=int8` (36k; TTFT 96 ms) | 117,5 | 134,0 | 3,12 / 3,49 | no aplica (4 slots) | 37.834 |
| `SPEC=mtp CTX=long MAX_LEN=100000` (KV fp8) | 84,4 | 92,1 | 2,58 / 2,73 | 464 | 164.705 |

C1 denota una única secuencia con respuestas de 1.024 tokens; C8, ocho secuencias concurrentes. Las mediciones de kernels y los perfiles W4A8 adicionales están en el repositorio TurboQwen.

## Requisitos de hardware

- Objetivo de diseño declarado: servir el modelo en **una sola tarjeta de 24 GB**, con espacio para caché KV y decodificación especulativa. El caso medido es una RTX 3090 a 350 W.
- Huella de pesos: 16,9 GB en el repositorio (int4 asimétrico del cuerpo más cabezas int8). El `lm_head` y `embed_tokens` en bf16 ocupaban 2,5 GB cada uno en la exportación original; la cabeza MTP, 850 MB, y ahora está en int8.
- GPU recomendadas: RTX 3090 es la única verificada en la información disponible. Para A100, H100, RTX 4090, RTX 5090 u otras, no disponible.
- ¿Cabe en GPU de consumo? Sí, según el autor, en tarjetas de 24 GB. Modelos concretos distintos de la RTX 3090: no disponible.
- Opciones de despliegue: vLLM 0.29.0 (carga el checkpoint sin parches, pero sin decodificación especulativa, sin cabeza draft ni ruta Marlin int8; con `--max-model-len 65536`); la rama `Ar4ikov/HyperQwen@awq-asym` con la serie de parches y `marlin-int8-asym-zp` para las funciones completas; contenedor Docker vía `github.com/Ar4ikov/TurboQwen` (perfil `single`, con torre de visión activada mediante `VISION=1`). llama.cpp, Ollama o TGI: no disponibles en la información proporcionada.
- Throughput y latencia medidos: 84,4 a 135,7 tokens/s en una sola secuencia según perfil y temperatura; 441 a 481 tokens/s con ocho secuencias concurrentes; TTFT de 96 ms en el perfil de producción de 36.000 tokens.
- Nota de rendimiento: la torre de visión se transmite desde RAM del host por imagen en las pruebas (`VISION=1`), lo que influye en la latencia cuando se procesan imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (AWQ-W4A16-ASYM-HyperQwen) | 27.356.728.560 | int4 asim. AWQ cuerpo + int8 en cabezas/embeddings + MTP | 65.536 (hasta 100.000 probado) | safetensors, vllm | apache-2.0 | 90 descargas, 0 likes |
| Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM | mismo (exportación fuente) | int4 asim. AWQ g128, cabezas y MTP en bf16 | no disponible | safetensors | apache-2.0 | pública |
| Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen-fast | mismo | igual, con `lm_head` en int4-GPTQ | no disponible | safetensors | apache-2.0 | pública; variante "fast" mono-usuario |
| Qwen/Qwen3.8-27B | no disponible en la información proporcionada | bf16 (modelo raíz) | no disponible | no disponible | apache-2.0 | pública |

No se dispone de datos de benchmarks que permitan comparar calidad (MMLU, HumanEval, GSM8K) con alternativas de la misma categoría, por lo que la comparación se limita a formato, cuantización y licencia.

## Limitaciones y advertencias

- Es un modelo **sin censura** (abliterated): no incorpora el alineamiento de seguridad del modelo original, por lo que puede generar contenido que los modelos alineados rechazarían. Requiere evaluación y filtros propios antes de cualquier uso en producción orientado a usuarios finales.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni benchmarks de referencia en la información disponible.
- La cuantización int4 del cuerpo introduce degradación no medida respecto al bf16 original. La model card solo reporta el error de ida y vuelta de las cabezas int8 (0,7 % y 0,65 %), no la pérdida de calidad global.
- El conjunto de calibración y la receta completa están en el `recipe.yaml` de la exportación fuente, que no se ha facilitado; sin él no es posible auditar la calibración.
- Muchas funciones avanzadas (decodificación especulativa MTP, cabeza draft, ruta Marlin int8 asimétrico) requieren una **rama parcheada de vLLM** y no funcionan con vLLM estándar, lo que complica el mantenimiento y las actualizaciones.
- La torre de visión se transmite desde RAM del host en las configuraciones medidas, lo que añade latencia y consumo de memoria del sistema cuando se procesan imágenes.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingüe homogéneo, y el finetune sin censura puede degradar idiomas distintos del inglés sin que existan datos públicos al respecto.
- Licencia Apache-2.0 en el repositorio, pero la procedencia del finetune sin censura y de los pesos del modelo raíz "Qwen3.8-27B" no se verifica en la información proporcionada; conviene revisar la cadena de custodia antes de un uso comercial.
- Adopción muy baja (90 descargas, 0 likes) y fechas de creación y actualización de septiembre de 2026: no hay validación independiente del comportamiento del checkpoint.
- El rendimiento medido corresponde a una única configuración de hardware (RTX 3090, 350 W) y a la segunda ejecución tras el arranque; no se ofrecen datos de estabilidad en ejecuciones prolongadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen
- Exportación fuente en HuggingFace: https://huggingface.co/Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM
- Variante rápida: https://huggingface.co/Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen-fast
- Finetune sin censura de origen: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio HyperQwen: https://github.com/syv-ai/HyperQwen
- Rama parcheada para AWQ asimétrico y decodificación especulativa: https://github.com/Ar4ikov/HyperQwen/tree/awq-asym
- Repositorio TurboQwen (contenedor, benchmarks y perfiles de servicio): https://github.com/Ar4ikov/TurboQwen
