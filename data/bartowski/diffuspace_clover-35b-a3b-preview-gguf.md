# bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Diffuspace, distribuido bajo licencia Apache 2.0. La ficha que nos ocupa corresponde a la cuantización GGUF realizada por bartowski a partir del checkpoint original, publicada el 3 de noviembre de 2026. El modelo combina una arquitectura MoE con componentes de difusión, según indican las etiquetas del repositorio, y está orientado a generación de texto conversacional y uso con tool calling.

El nombre indica 35B de parámetros totales con 3B activos por token, lo que sitúa al modelo en la categoría de MoE disperso: capacidad de almacenamiento alta con coste de cómputo por token relativamente bajo. El checkpoint en safetensors registra 34.660.610.688 parámetros reales. La cuantización de bartowski emplea llama.cpp build b12074 con imatrix, lo que permite desplegar el modelo en hardware de consumo mediante formatos que van desde bf16 (69,38 GB) hasta Q4_K_S (20,95 GB).

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras cuantizaciones GGUF de un modelo MoE con difusión de Diffuspace; por otro, advierte de que se trata de una versión "Preview" con muy poca información pública verificable (cero descargas y cero likes en el momento de la consulta), por lo que las evaluaciones de calidad deben tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con componentes de difusión, según etiquetas del repositorio; detalles internos no disponibles |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | 3B (según nomenclatura A3B; confirmación oficial no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S (y otras en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información pública disponible confirma que se trata de un transformer con mezcla de expertos (MoE), con 34,66B de parámetros totales y una designación A3B que sugiere 3B de parámetros activos por token. Las etiquetas del repositorio incluyen además "diffusion", lo que apunta a la incorporación de técnicas de difusión en el entrenamiento o en el proceso de generación, aunque no se detalla el mecanismo exacto. El modelo requiere código personalizado ("custom-code"), lo que implica que no funciona con implementaciones estándar de transformers sin adaptaciones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la combinación MoE-difusión. La cuantización de bartowski emplea imatrix, un método que calibra la cuantización con datos representativos para preservar mejor la calidad en bits bajos, y se generó con llama.cpp b12074. El prompt format sigue el esquema ChatML con etiquetas `<|im_start|>` y `<|im_end|>`, e incluye un bloque `<think>` al inicio de la respuesta del asistente, lo que sugiere un modo de razonamiento explícito.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de prompt ChatML.
- Tool calling / function calling mediante un esquema XML documentado (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Modo de razonamiento explícito: el prompt format abre un bloque `<think>` antes de la respuesta.
- Capacidad de razonamiento multi-paso orientada a agentes, derivada del soporte de tool calling y del bloque de pensamiento.
- Soporte de instrucciones de sistema y definiciones de herramientas en el turno de sistema.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Visión, audio u otras modalidades: no disponibles; la entrada declarada es solo texto.

## Casos de uso

- **Asistentes conversacionales con tool calling**: el modelo puede gestionar diálogos multi-turno e invocar funciones externas (por ejemplo, consultas a APIs de precios de acciones) siguiendo el formato XML documentado, lo que lo hace adecuado para agentes de atención al cliente que necesitan consultar sistemas internos.
- **Automatización de flujos con agentes**: gracias al bloque `<think>` y al soporte de llamadas a funciones, puede encadenar razonamiento y acciones en pipelines de automatización (consulta, decisión, ejecución) sin necesidad de un orquestador externo complejo.
- **Generación de texto en local con hardware de consumo**: la cuantización Q4_K_M (22,32 GB) permite ejecutar el modelo en una GPU de 24 GB o en configuraciones con memoria unificada, lo que facilita prototipado y despliegue en estaciones de trabajo sin clúster.
- **Prototipado de investigación sobre MoE y difusión**: al ser un modelo "Preview" con pesos abiertos, sirve para estudiar el comportamiento de arquitecturas MoE con componentes de difusión en tareas de generación de texto.
- **Procesamiento por lotes de conversaciones**: con llama.cpp y cuantizaciones Q5/Q6 se puede desplegar en servidores modestos para tareas de clasificación, resumen o reescritura de conversaciones, siempre que se valide la calidad previamente.
- **Integración en entornos con requisitos de licencia permisiva**: la licencia Apache 2.0 facilita su uso comercial y su incorporación en productos propietarios, algo relevante para equipos que descartan licencias restrictivas.
- **Evaluación comparativa de cuantizaciones**: el repositorio ofrece un amplio abanico de formatos (bf16, Q8_0, Q6_K_L, Q4_K_M, IQ4_NL, etc.), útil para medir el impacto de la cuantización en la calidad de salida de un MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según tamaño de archivo GGUF): bf16 ~69,4 GB; Q8_0 ~36,9 GB; Q6_K ~30,7 GB; Q5_K_M ~27,0 GB; Q4_K_M ~22,3 GB; Q4_K_S ~21,0 GB.
- **GPU recomendadas**: para bf16 y Q8_0, A100 80 GB o H100; para Q6_K y Q5_K_M, A100 40 GB o dos RTX 4090; para Q4_K_M y Q4_K_S, una RTX 4090 (24 GB) o RTX 3090.
- **¿Cabe en GPU de consumo?**: sí, en cuantizaciones Q4_K_M y Q4_K_S cabe en GPUs de 24 GB; en Q5_K_M y Q6_K requiere 32 GB o memoria unificada (Apple Silicon de gama alta).
- **Opciones de despliegue**: llama.cpp (versión b12074 o superior), Ollama, y servidores compatibles con GGUF; el modelo requiere código personalizado, por lo que conviene verificar la compatibilidad con vLLM y TGI antes de usarlos.
- **Latencia y throughput**: no disponibles. Al ser un MoE con 3B activos, se espera un coste por token inferior al de un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Clover-35B-A3B-Preview | 34,66B | 3B (según nombre) | no disponible | Apache 2.0 | GGUF / safetensors | Repo bartowski y base Diffuspace |
| Mixtral 8x7B | 46,7B | ~12,9B | 32k | Apache 2.0 | safetensors / GGUF | Amplia |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32k | Apache 2.0 | safetensors / GGUF | Amplia |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32k | DeepSeek License | safetensors / GGUF | Amplia |

La comparación es orientativa: no hay datos de rendimiento publicados para Clover que permitan una comparación cuantitativa con estas alternativas. La principal diferencia es la incorporación de componentes de difusión y su estado "Preview", frente a modelos MoE consolidados con ecosistema y evaluaciones públicas.

## Limitaciones y advertencias

- Modelo en estado "Preview": no hay benchmarks públicos ni validación independiente de calidad; no se recomienda para producción sin evaluación previa.
- Cero descargas y cero likes en el momento de la consulta: ausencia de retroalimentación de la comunidad.
- Requiere código personalizado ("custom-code"), lo que puede complicar la integración con frameworks estándar y aumentar el coste de mantenimiento.
- Idiomas soportados no especificados: riesgo de comportamiento deficiente fuera del inglés o de los idiomas vistos en entrenamiento.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en conversaciones largas.
- Riesgo de alucinación inherente a los modelos generativos; especialmente relevante en tool calling, donde una llamada mal formada puede romper el pipeline.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el código personalizado deben revisarse por si incorporan componentes con licencias adicionales.
- El tamaño del repo (566,6 GB) y la multitud de cuantizaciones pueden dificultar la selección del archivo adecuado; se recomienda Q4_K_M como punto de partida según el autor.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- llama.cpp (release b12074): https://github.com/ggml-org/llama.cpp/releases/tag/b12074
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
