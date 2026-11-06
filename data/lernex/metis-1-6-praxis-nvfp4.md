# Lernex/Metis-1.6-Praxis-NVFP4

## Resumen

Metis-1.6 Praxis NVFP4 es la versión cuantizada a 4 bits (formato NVFP4) del modelo Metis-1.6 Praxis, desarrollado por Lernex. Se trata de un modelo de generación de texto de tipo Mixture-of-Experts (MoE) con componentes Mamba, orientado a tareas de razonamiento y conversación. Su interés principal radica en que comprime el modelo original BF16 a 2,01 GB, aproximadamente un tercio del tamaño, conservando el 99,0 % de la puntuación media de benchmarks del modelo en BF16 y decodificando un 27 % más rápido en un solo flujo.

El modelo cuenta con 1.886.563.631 parámetros totales según los pesos en safetensors. La cuantización NVFP4 está pensada específicamente para el motor de inferencia propietario de Lernex, Dromos, y no es compatible con vLLM, SGLang ni Transformers, lo que limita su portabilidad a ese ecosistema concreto. Está publicado bajo licencia Apache 2.0 y su model card remite a un informe técnico en arXiv.

La relevancia de esta ficha radica en que documenta un caso de cuantización agresiva (4 bits) con pérdida de precisión mínima medida, pero con un coste claro en interoperabilidad: solo se ejecuta en Dromos, sobre CUDA 12/13, Metal o CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con componentes Mamba (según tags del autor) |
| Parámetros totales | 1.886.563.631 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona secuencias de 8.192 tokens en el ejemplo de memoria) |
| Tipos de cuantización | NVFP4 (4 bits, formato propietario de Dromos); el modelo base está disponible en BF16 y FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4), requiere `custom_code` y el motor Dromos |

## Arquitectura y entrenamiento

La información disponible indica que Metis-1.6 Praxis emplea una arquitectura Mixture-of-Experts con componentes Mamba, según las etiquetas declaradas por el autor (`mixture-of-experts`, `mamba`, `reasoning`). No se detallan en la model card el número de expertos, el número de parámetros activos por token, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica la longitud de contexto nativa del modelo base.

La innovación técnica documentada se centra en la cuantización NVFP4 y en su integración con Dromos. El motor ofrece dos modos de multiplicación: por defecto expande los pesos a 16 bits y opera en BF16 (solo se redondean los pesos), mientras que con `--fast-math` utiliza los tensor cores de 4 y 8 bits de la GPU, redondeando las entradas a FP4 para los expertos y a FP8 por token para el resto de proyecciones. La model card reporta que el modo por defecto conserva el 99,0 % de la media BF16 en siete tareas zero-shot, y el modo `--fast-math` el 98,2 %.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento con modo de pensamiento (`thinking`) activado por defecto; la salida de razonamiento se devuelve en el campo `reasoning_content`.
- Soporte de tool calling / function calling, con las llamadas parseadas en `tool_calls`.
- Capacidades de razonamiento orientadas a código (la model card recomienda temperatura 1.0 sin penalización para código en modo thinking).
- Ejecución en GPU NVIDIA (CUDA 12 y 13), Apple Silicon (Metal) y CPU a través de Dromos.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistentes conversacionales con razonamiento explícito: el modo thinking por defecto permite obtener trazas de razonamiento separadas de la respuesta final, útiles para depuración y para aplicaciones que necesitan auditar el proceso de decisión.
- Integración de agentes con tool calling: el parseo nativo de `tool_calls` y la exposición de una API compatible con OpenAI (`dromos serve`) facilitan montar agentes que invocan funciones externas en pipelines propios.
- Despliegue en hardware de gama media: con 2,01 GB de pesos, un GPU de 6 GB puede alojar el modelo completo con espacio para 18 secuencias de 8.192 tokens, lo que habilita prototipos y servicios de baja concurrencia en estaciones de trabajo modestas.
- Generación de código asistida: el modelo admite un modo de sampling específico para código (temperatura 1.0, sin penalización) dentro del modo thinking, adecuado para autocompletado y explicación de fragmentos en entornos de desarrollo.
- Inferencia en portátiles Apple Silicon: al ejecutarse sobre Metal, permite llevar el modelo a equipos Mac sin GPU dedicada para tareas de razonamiento y conversación offline.
- Servicios locales compatibles con la API de OpenAI: `dromos serve praxis:nvfp4` levanta un endpoint en `http://127.0.0.1:8080/v1`, lo que permite sustituir llamadas a APIs en la nube por inferencia local en aplicaciones ya construidas sobre ese contrato.
- Evaluación comparativa de cuantización: útil como referencia para estudiar la degradación de precisión de NVFP4 frente a BF16 en tareas zero-shot, dado que la model card publica las puntuaciones de ambos.

## Benchmarks y rendimiento

Resultados zero-shot sobre lm-evaluation-harness 0.4.13, puntuados por log-likelihood sobre todos los ítems. Las columnas NVFP4 decodifican los pesos de este repositorio y los ejecutan en la implementación de referencia con las activaciones de Dromos.

| Tarea | Métrica | BF16 | NVFP4 | NVFP4 `--fast-math` |
|---|---|---|---|---|
| MMLU | acc | 37,61 | 36,00 | 35,71 |
| HellaSwag | acc_norm | 56,09 | 55,66 | 55,24 |
| ARC-Easy | acc_norm | 54,38 | 54,12 | 53,66 |
| ARC-Challenge | acc_norm | 34,98 | 34,22 | 33,79 |
| OpenBookQA | acc_norm | 38,00 | 37,60 | 37,60 |
| PIQA | acc_norm | 73,23 | 72,42 | 72,47 |
| WinoGrande | acc | 58,48 | 59,35 | 58,09 |
| **Media** | | **50,40** | **49,91** | **49,51** |

La model card advierte que la tarjeta del modelo BF16 puntúa respuestas generadas, por lo que estas columnas deben compararse entre sí y no con las de dicha tarjeta. Además, se reporta una decodificación un 27 % más rápida que BF16 en un solo flujo.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,01 GB de pesos en NVFP4; un GPU de 6 GB aloja el modelo completo con espacio para 18 secuencias de 8.192 tokens.
- GPU recomendadas: NVIDIA con CUDA 12 o 13; la model card menciona explícitamente GPUs de la serie RTX 50 para el modo `--fast-math` (tensor cores de 4 y 8 bits). También funciona en Apple Silicon vía Metal y en CPU.
- Cabe en GPU de consumo: sí, en GPUs de 6 GB o más.
- Opciones de despliegue: exclusivamente Dromos (`dromos run praxis:nvfp4`, `dromos serve praxis:nvfp4`, `pip install dromos`). No es compatible con vLLM, SGLang ni Transformers; para esos motores debe usarse la variante FP8 o BF16.
- Latencia y throughput: se reporta una decodificación un 27 % más rápida que BF16 en un solo flujo; no se publican cifras absolutas de latencia ni de throughput con concurrencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa disponible es con las otras variantes del mismo modelo:

| Modelo | Formato | Tamaño | Motor compatible | Licencia |
|---|---|---|---|---|
| Metis-1.6 Praxis NVFP4 | NVFP4 | 2,01 GB | Dromos | Apache 2.0 |
| Metis-1.6 Praxis FP8 | FP8 | no disponible | vLLM, SGLang | Apache 2.0 |
| Metis-1.6 Praxis | BF16 | no disponible | Transformers | Apache 2.0 |

## Limitaciones y advertencias

- Incompatibilidad de motores: vLLM, SGLang y Transformers no leen el formato NVFP4; el uso queda restringido al motor Dromos de Lernex.
- Riesgo de dependencia de proveedor: el formato y el motor son propietarios, lo que condiciona la portabilidad y la migración futura.
- Precisión reducida: la media de benchmarks cae de 50,40 (BF16) a 49,91 (NVFP4) y a 49,51 con `--fast-math`; MMLU pierde 1,61 puntos en el modo por defecto.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera de los idiomas cubiertos por el entrenamiento original.
- Longitud de contexto nativa no documentada; el dato de 8.192 tokens aparece solo como ejemplo de asignación de memoria, no como límite oficial.
- Sesgos y alucinación: no se documentan análisis específicos de sesgo ni tasas de alucinación en la información disponible.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones de uso del motor Dromos, que es software separado.
- Métricas de benchmarks no directamente comparables con la tarjeta del modelo BF16, según advierte el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lernex/Metis-1.6-Praxis-NVFP4
- Modelo base BF16: https://huggingface.co/Lernex/Metis-1.6-Praxis
- Variante FP8: https://huggingface.co/Lernex/Metis-1.6-Praxis-FP8
- Informe técnico: https://arxiv.org/abs/2610.37903
- Colección Metis-1.6: https://huggingface.co/collections/Lernex/metis-16-6adc52e150d985721d894f6b
- Motor Dromos: https://github.com/lernex/dromos
- Sitio del autor: https://lernex.com
- Perfil en X: https://x.com/Lernex_ai
