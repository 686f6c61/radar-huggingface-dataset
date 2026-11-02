# Lernex/Metis-1.6-Praxis-FP8

## Resumen

Metis-1.6 Praxis FP8 es la versión cuantizada a FP8 del modelo Metis-1.6 Praxis, desarrollado por Lernex. Se trata de un modelo de generación de texto con arquitectura híbrida que combina mezcla de expertos (MoE) con capas Mamba, orientado a tareas de razonamiento y conversación. El checkpoint emplea el formato `compressed-tensors` en FP8 y está pensado específicamente para su despliegue en motores de inferencia como vLLM, SGLang y Dromos, con soporte nativo de parser de razonamiento y de tool calling.

El modelo base cuenta con 3.077.520.815 parámetros totales (según los pesos en safetensors) y esta versión FP8 reduce el peso del repositorio a 3,5 GB frente a los 6,16 GB del checkpoint BF16, manteniendo según el autor el 99,8 % de la media de benchmarks del modelo en BF16. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en productos.

La relevancia de esta ficha reside en que se trata de un checkpoint cuantizado de un modelo poco difundido, con muy pocas descargas y sin datos públicos de idiomas, por lo que la evaluación debe apoyarse en la información declarada por el autor y en los benchmarks publicados en su model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE) y capas Mamba |
| Parámetros totales | 3.077.520.815 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (compressed-tensors); existen también versiones BF16 y NVFP4 del modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, FP8) |

## Arquitectura y entrenamiento

La información disponible indica que Metis-1.6 Praxis emplea una arquitectura híbrida que combina mezcla de expertos (MoE) con capas Mamba, según las etiquetas del repositorio y la model card. No se especifican en la información proporcionada el número de expertos, el número de parámetros activos por token, la longitud de contexto ni la composición del dataset de entrenamiento. Tampoco se detalla si el entrenamiento incluyó RLHF, DPO u otras fases de alineamiento.

La innovación técnica destacable de este checkpoint concreto es la cuantización FP8 mediante `compressed-tensors`, diseñada para ejecutarse con las tensor cores FP8 de las GPU compatibles. Según el autor, cada capa redondea su entrada a FP8 por token y la multiplica por los pesos FP8 en la GPU. El modelo incluye además un parser de razonamiento específico (`metis`) y un parser de tool calls, integrados mediante los plugins `vllm-metis` y `sglang-metis`, y el modo de pensamiento (thinking) está activado por defecto. El repositorio incluye código personalizado (`custom_code`), por lo que requiere `--trust-remote-code` en vLLM.

## Capacidades

- Generación de texto conversacional con soporte de plantilla de chat y modo de pensamiento (thinking) activado por defecto, desactivable mediante `enable_thinking: false`.
- Razonamiento explícito: el modelo separa el bloque de pensamiento de la respuesta final en los motores compatibles.
- Tool calling / function calling con parser tipado (`--tool-call-parser metis`) y elección automática de herramientas (`--enable-auto-tool-choice`).
- Integración con endpoints compatibles con la API de OpenAI en vLLM, SGLang y Dromos.
- Capacidades multilingües: no disponible (no se declaran idiomas en la información proporcionada).
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes conversacionales con razonamiento: el modo thinking permite al modelo elaborar cadenas de razonamiento antes de responder, útil en atención al cliente o asistentes técnicos donde se requiere justificar la respuesta.
- Agentes con tool calling: la integración con parsers de herramientas en vLLM y SGLang permite construir agentes que invoquen APIs externas, bases de datos o funciones de negocio en flujos multi-paso.
- Generación de código en pipelines: el autor recomienda temperatura 1.0 sin penalización para código en modo thinking, lo que sugiere uso en asistentes de programación y generación de parches.
- Despliegue en infraestructura con GPU de gama media: el tamaño FP8 de 3,53 GB y los 3.077 millones de parámetros permiten servir el modelo en una sola GPU consumer, reduciendo costes frente al BF16.
- Prototipado rápido de aplicaciones LLM: Dromos ofrece instalación en un comando y servidor OpenAI-compatible en local, adecuado para entornos de desarrollo y pruebas.
- Servicio de inferencia de baja latencia: según el autor, el checkpoint FP8 decodifica un 14 % más rápido que BF16 en Dromos para un solo stream, lo que lo hace apto para aplicaciones interactivas con requisitos de latencia ajustados.
- Evaluación e investigación: al ser un modelo pequeño con arquitectura híbrida MoE-Mamba y licencia Apache 2.0, resulta útil para experimentación académica en eficiencia de arquitecturas y cuantización.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados con lm-evaluation-harness 0.4.13 mediante log-likelihood sobre cada ítem, comparando BF16 y FP8 del mismo checkpoint:

| Tarea | Métrica | BF16 | FP8 |
|---|---|---|---|
| MMLU | acc | 37,61 | 38,26 |
| HellaSwag | acc_norm | 56,09 | 55,91 |
| ARC-Easy | acc_norm | 54,38 | 54,29 |
| ARC-Challenge | acc_norm | 34,98 | 34,13 |
| OpenBookQA | acc_norm | 38,00 | 37,80 |
| PIQA | acc_norm | 73,23 | 72,85 |
| WinoGrande | acc | 58,48 | 58,80 |
| **Media** | | **50,40** | **50,29** |

El autor advierte que la columna BF16 de esta tabla puntúa respuestas generadas, mientras que la comparación directa debe hacerse entre las columnas BF16 y FP8 de esta misma tabla, no con la model card del modelo base. No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks de razonamiento o código.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB solo para pesos en FP8; con overhead de KV cache y activaciones, se recomienda al menos 8 GB de VRAM para contexto moderado.
- GPU recomendadas: GPU con soporte de tensor cores FP8 (por ejemplo, H100, L40S, Ada Lovelace en adelante) para aprovechar el modo `--fast-math`; en GPU sin FP8 nativo, Dromos expande los pesos por defecto.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070 y superiores), siempre que el motor soporte la arquitectura híbrida.
- Opciones de despliegue: vLLM con el plugin `vllm-metis`, SGLang con `sglang-metis`, y Dromos (`dromos run praxis:fp8` o `dromos serve praxis:fp8`). Transformers no lee este formato para esta arquitectura; para Transformers debe usarse el repositorio BF16.
- Latencia y throughput: el autor declara una decodificación un 14 % más rápida que BF16 en Dromos para un solo stream; no se proporcionan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables de la misma categoría (tamaño, arquitectura híbrida MoE-Mamba o licencia). La model card solo referencia las otras variantes del mismo modelo:

| Modelo | Formato | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|
| Metis-1.6 Praxis FP8 | FP8 (compressed-tensors) | 3,53 GB | Apache 2.0 | HuggingFace |
| Metis-1.6 Praxis | BF16 | 6,16 GB | Apache 2.0 | HuggingFace |
| Metis-1.6 Praxis NVFP4 | NVFP4 | no disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- El modelo tiene muy poca tracción pública: 0 descargas y 0 likes en el momento de la consulta, lo que dificulta la validación independiente de sus capacidades.
- Los benchmarks publicados son moderados (media de 50,29 en siete tareas zero-shot), con MMLU de 38,26 y ARC-Challenge de 34,13, lo que sugiere un rendimiento limitado en conocimiento general y razonamiento complejo.
- No se declaran los idiomas soportados; el rendimiento en castellano es desconocido y debe validarse empíricamente antes de usarlo en producción.
- No se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- El checkpoint requiere `--trust-remote-code` y plugins específicos (`vllm-metis`, `sglang-metis`), lo que añade dependencias de terceros y superficie de riesgo en producción.
- Transformers no soporta este formato para la arquitectura del modelo; debe usarse el repositorio BF16 si se necesita ese ecosistema.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad o tasas de alucinación.
- Aunque la licencia Apache 2.0 permite uso comercial, el código personalizado del repositorio y los plugins deben auditarse antes de integrarlos en productos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lernex/Metis-1.6-Praxis-FP8
- Modelo base BF16: https://huggingface.co/Lernex/Metis-1.6-Praxis
- Variante NVFP4: https://huggingface.co/Lernex/Metis-1.6-Praxis-NVFP4
- Informe técnico: https://arxiv.org/abs/2610.37903
- Colección Metis-1.6: https://huggingface.co/collections/Lernex/metis-16-6adc52e150d985721d894f6b
- Sitio del autor: https://lernex.com
- Perfil en X: https://x.com/Lernex_ai
- Repositorio Dromos: https://github.com/lernex/dromos
- Plugin vLLM: https://github.com/lernex/vllm-metis
- Plugin SGLang: https://github.com/lernex/sglang-metis
