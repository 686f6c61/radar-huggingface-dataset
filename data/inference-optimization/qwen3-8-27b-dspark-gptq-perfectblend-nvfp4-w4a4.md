# inference-optimization/Qwen3.8-27B-DSpark-GPTQ-PerfectBlend-NVFP4-W4A4

## Resumen

El modelo `inference-optimization/Qwen3.8-27B-DSpark-GPTQ-PerfectBlend-NVFP4-W4A4` no es un modelo de chat autónomo, sino un *drafter* (borrador) de decodificación especulativa del tipo DSpark, cuantizado en NVFP4 y derivado de `RedHatAI/Qwen3.8-27B-speculator.dspark`. Su función es proponer secuencias de tokens candidatos que el modelo objetivo, `Qwen/Qwen3.8-27B`, verifica en paralelo, de modo que se reduzca el número de pasos de decodificación y, con ello, la latencia de generación. Lo publica el usuario `inference-optimization` y se distribuye bajo licencia Apache 2.0 con la librería `speculators`.

Técnicamente es una pieza de infraestructura: pesa 1.3 GB, contiene 1.988.431.617 parámetros (≈1,99 mil millones) y se ha cuantizado con GPTQ en formato NVFP4 W4A4 (4 bits en pesos y activaciones) usando un observador *expanded-MSE*, amortiguación de Hessiano de 0.1 y 1.892 registros de calibración de estados ocultos alineados con el modelo objetivo. El repositorio incluye además la trazabilidad completa del proceso en `provenance/quantization/`.

Su relevancia ahora es doble: por un lado, explora la combinación de decodificación especulativa con cuantización de muy baja precisión (NVFP4) para abaratar el *serving* de un modelo de 27B; por otro, es un ejemplo de publicación con procedencia reproducible. Ahora bien, el propio autor indica que la evaluación está pendiente: no hay resultados de aceptación, velocidad ni calidad, y no se reclama soporte nativo NVFP4 en H100 (el ejemplo de servicio usa el backend de emulación de vLLM).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa DSpark (derivado de RedHatAI/Qwen3.8-27B-speculator.dspark); detalles internos de la arquitectura: no disponibles |
| Parámetros totales | 1.988.431.617 (≈1,99 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE; no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 W4A4 (4 bits en pesos y activaciones) mediante GPTQ, con observador expanded-MSE y amortiguación de Hessiano de 0.1; formato compressed-tensors |
| Idiomas soportados | No disponible (el drafter opera sobre el vocabulario del modelo objetivo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y compressed-tensors (librería `speculators`) |

## Arquitectura y entrenamiento

La información disponible describe el artefacto como un drafter DSpark para decodificación especulativa, derivado exactamente de `RedHatAI/Qwen3.8-27B-speculator.dspark` en la revisión `7f33c272e5da240978e0d55767abab8193d74b95` y pensado para emparejarse con `Qwen/Qwen3.8-27B` en la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. No se documentan en la ficha el tipo de bloque, el número de capas, la dimensión oculta ni el mecanismo exacto de predicción de tokens del borrador, por lo que esos datos quedan como no disponibles. Lo que sí se especifica es que no se trata de un modelo de chat independiente.

El proceso de cuantización sí está descrito con detalle: GPTQ en NVFP4 con observador *expanded-MSE*, 0.1 de amortiguación de Hessiano y 1.892 registros de calibración de estados ocultos alineados con el objetivo. La calibración proviene de una muestra proporcional local de `shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated`, que a su vez deriva de `mlabonne/open-perfectblend`; no es la colección PerfectBlend original sin modificar. Se solicitaron 2.048 ejemplos, había 1.892 registros alineados disponibles y se usaron todos, con un límite de secuencia de 2.048. El autor no redistribuye los prompts de calibración, pero sí incluye comandos, manifiestos, parches, scripts y el digest SHA-256 de los pesos publicados.

## Capacidades

- Decodificación especulativa: genera borradores de tokens que el modelo objetivo `Qwen/Qwen3.8-27B` valida, con un valor de referencia de 8 tokens por paso (`--spec-tokens 8`) en el ejemplo de servicio.
- Integración con vLLM mediante `--spec-model` y `--spec-method dspark`, con configuración de kernel explícita (`linear_backend: emulation`).
- Formato compressed-tensors, pensado para cargarse en pilas de inferencia que soporten este esquema de cuantización.
- No es un modelo de chat: no genera respuestas por sí mismo ni mantiene conversaciones.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles (dependen del modelo objetivo, no del drafter).
- Capacidades multilingües, visión, audio o modo *thinking*: no disponibles.
- Trazabilidad y reproducibilidad del pipeline de cuantización como capacidad del artefacto (carpeta `provenance/quantization/`).

## Casos de uso

- Aceleración de un servidor de chat con vLLM: se despliega `Qwen/Qwen3.8-27B` como modelo principal y este drafter como `--spec-model`, de forma que cada paso de decodificación verifique varios tokens candidatos y se reduzca el tiempo por token en cargas conversacionales.
- Reducción de coste por token en producción: al disminuir el número de pasos secuenciales sobre el modelo de 27B, se aprovecha mejor la GPU y baja el coste computacional por respuesta generada, siempre que la tasa de aceptación sea suficiente (dato aún no medido).
- Asistentes interactivos de baja latencia: en aplicaciones donde el tiempo hasta el primer token y la fluidez de escritura son críticos, el drafter añade poco coste de memoria (1,3 GB de repositorio) frente al objetivo.
- Asistencia de código en IDE: la generación de código suele ser altamente predecible en tramos largos, un escenario favorable para la decodificación especulativa; el modelo objetivo seguiría produciendo el texto final.
- Despliegues con presupuesto de VRAM ajustado: el drafter ocupa una fracción pequeña de memoria, por lo que puede convivir con un objetivo cuantizado en GPUs de gama alta de consumo, siempre que la pila soporte compressed-tensors.
- Investigación sobre cuantización NVFP4 en cabezas especulativas: el repositorio incluye manifiestos y scripts, lo que permite reproducir el proceso de GPTQ con calibración alineada al objetivo y estudiar su efecto sobre la aceptación.
- Validación interna de pipelines de serving con backend de emulación: útil para equipos que quieran probar rutas NVFP4 en vLLM sin depender de kernels nativos.
- Auditoría de procedencia de artefactos cuantizados: el digest SHA-256 y los comandos de cuantización permiten verificar la cadena de custodia de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación está pendiente y que no se incluyen resultados completos de aceptación, velocidad ni calidad; el checkpoint cuenta únicamente con procedencia de cuantización, sin validación de servicio ni matriz de evaluación finalizada.

## Requisitos de hardware

- El repositorio completo pesa 1,3 GB, cifra que acota el espacio en disco y da una referencia del orden de magnitud de los pesos del drafter.
- VRAM para el drafter: no confirmada por el autor; a partir del tamaño del repositorio, se puede estimar en torno a 1-2 GB adicionales de memoria, más el coste de activaciones y buffers del kernel. Estimación no verificada.
- VRAM del modelo objetivo `Qwen/Qwen3.8-27B`: no disponible.
- GPU recomendadas: no disponibles para el conjunto completo; el ejemplo de servicio emplea el backend de emulación de vLLM para NVFP4 y el autor no reclama soporte nativo NVFP4 en H100.
- Encaje en GPU de consumo: el drafter por sí solo cabe en cualquier GPU consumer con varios GB libres; si se usa junto a un objetivo de 27B, dependerá de la cuantización de dicho objetivo, dato no disponible.
- Opciones de despliegue: vLLM con `--spec-model` y `--spec-method dspark`, y la librería `speculators` como `library_name`. No se documentan rutas para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la evaluación está pendiente y no se aportan cifras de tokens por segundo ni de tasa de aceptación.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Cuantización | Licencia | Estado |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-DSpark-GPTQ-PerfectBlend-NVFP4-W4A4 (este) | Drafter especulativo DSpark | 1,99 mil millones | No disponible | NVFP4 W4A4 con GPTQ | apache-2.0 | Publicado, sin evaluar |
| RedHatAI/Qwen3.8-27B-speculator.dspark | Drafter especulativo de origen | No disponible | No disponible | No disponible (revisión base sin cuantizar) | No disponible | Origen del artefacto |
| Qwen/Qwen3.8-27B | Modelo objetivo (no equivalente) | No disponible | No disponible | No disponible | No disponible | Pareja de despliegue obligatoria |
| Cabezas especulativas alternativas (EAGLE-3, Medusa, MTP) | Otras familias de decodificación especulativa | No disponible | No disponible | No disponible | No disponible | Sin comparación pública con este artefacto |

No se dispone de datos públicos de rendimiento que permitan comparar este drafter con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere obligatoriamente un modelo objetivo compatible y una pila de inferencia que soporte decodificación especulativa DSpark; por sí solo no genera respuestas.
- Evaluación pendiente: no existen resultados publicados de tasa de aceptación, latencia ni calidad, de modo que no se puede afirmar que aporte ganancia neta de rendimiento.
- Ahorro no garantizado: en cuantizaciones de muy baja precisión, un drafter puede perder precisión en sus propuestas y reducir la tasa de aceptación, lo que anularía la ventaja de velocidad; esto no se ha medido aquí.
- Soporte de kernels: el ejemplo oficial usa el backend de emulación de vLLM para NVFP4, sin reclamar soporte nativo en H100; el rendimiento en ese modo puede ser inferior al de kernels nativos.
- Inconsistencia de metadatos: entre las etiquetas del repositorio figura `8-bit` y `compressed-tensors`, mientras que el nombre y la model card describen NVFP4 W4A4 (4 bits). Conviene verificar la configuración real antes de desplegar.
- Calibración derivada: la muestra de calibración procede de una regeneración de `mlabonne/open-perfectblend`, no del conjunto original, lo que puede introducir sesgos de dominio en la cuantización.
- Idiomas soportados: no disponibles; la cobertura lingüística dependerá del vocabulario y del comportamiento del modelo objetivo.
- Riesgo de alucinación: no evaluado para este artefacto; en decodificación especulativa, el riesgo recae en el modelo verificador, pero una mala aceptación puede degradar la distribución de salida si la verificación no es exacta.
- Licencia Apache 2.0 para el drafter, lo que permite uso comercial de esta pieza; las condiciones del modelo objetivo `Qwen/Qwen3.8-27B` y del drafter original de Red Hat no se detallan en la información disponible y deben comprobarse por separado.
- Madurez: el repositorio acumula 0 descargas y 0 valoraciones y fue creado el 28 de septiembre de 2026, por lo que carece de validación por parte de la comunidad.
- Los datos de calibración no se redistribuyen, lo que limita la reproducción completa del pipeline por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/Qwen3.8-27B-DSpark-GPTQ-PerfectBlend-NVFP4-W4A4
- Drafter de origen: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Conjunto de calibración regenerado: https://huggingface.co/shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated
- Conjunto de calibración original: https://huggingface.co/mlabonne/open-perfectblend
- Procedencia de la cuantización: carpeta `provenance/quantization/` dentro del repositorio del modelo
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
