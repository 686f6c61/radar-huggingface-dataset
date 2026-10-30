# mlx-community/Index-Translate-9B-MLX-mxfp8

## Resumen

Index-Translate-9B-MLX-mxfp8 es la conversión al formato MLX, con cuantización mxfp8 de 8 bits, del modelo IndexTeam/Index-Translate-9B, un modelo de lenguaje de 8.953.801.728 parámetros (~8,95 B) especializado en traducción automática. La conversión la ha realizado la organización mlx-community usando mlx-lm 0.32.2, y está pensada para ejecutarse de forma nativa en Apple Silicon (chips de las series M1 a M4).

El modelo base se presenta como un modelo conversacional orientado a traducción, con licencia Apache 2.0, y la etiqueta `qwen3_5` del repositorio indica que emplea una arquitectura de tipo Qwen3.5. La versión cuantizada reduce el tamaño del repositorio a 9,3 GB, frente a los ~18 GB que ocuparían los pesos en precisión completa, lo que permite cargarlo en la memoria unificada de Macs de consumo.

Su relevancia actual radica en la combinación de un modelo de traducción reciente y con licencia permisiva junto al ecosistema MLX, que facilita la inferencia local y privada en Mac sin depender de APIs externas ni de GPUs de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tipo Qwen3.5 (según la etiqueta `qwen3_5` del repositorio) |
| Parámetros totales | 8.953.801.728 (~8,95 B) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | mxfp8 (coma flotante de 8 bits con microescalado por bloques) |
| Idiomas soportados | no disponible (el modelo está orientado a traducción) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo deriva de IndexTeam/Index-Translate-9B, cuyo repositorio incluye la etiqueta `qwen3_5`, lo que apunta a una arquitectura transformer tipo Qwen3.5 de tipo denso; no hay indicios de que sea un modelo de mezcla de expertos (MoE). La versión aquí documentada no modifica la arquitectura: es una conversión a MLX con cuantización mxfp8, un formato de coma flotante de 8 bits que utiliza escalas compartidas por bloques (microescalado) para mantener la precisión numérica con una huella de memoria aproximada de 1 byte por parámetro, lo que explica los 9,3 GB del repositorio.

Sobre el entrenamiento del modelo base no hay datos disponibles en la información proporcionada: se desconocen el número de tokens, la composición del corpus, el contexto de entrenamiento y si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detalla qué pares de idiomas cubre, aunque su denominación y etiquetas (`translation`, `index`) lo presentan como un modelo especializado en traducción con capacidades conversacionales.

## Capacidades

- Traducción automática: es el propósito declarado del modelo base (nombre y etiqueta `translation`), con generación de texto como pipeline principal.
- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican soporte de diálogo multi-turno.
- Plantillas de chat: el tokenizador incluye `chat_template`, como muestra el ejemplo de uso del README con `apply_chat_template`.
- Ejecución local en Apple Silicon mediante la API de Python de mlx-lm (`load` y `generate`).
- No hay información disponible sobre tool calling / function calling, capacidades de agentes, visión, audio ni modos de razonamiento (thinking mode).

## Casos de uso

- Traducción local y privada en Mac: al ejecutarse íntegramente en el dispositivo con ~9,3 GB de pesos, permite traducir correos, contratos o documentación sensible sin enviar datos a servicios externos, algo adecuado para sectores con requisitos de confidencialidad.
- Integración en aplicaciones macOS e iOS: la API de Python de mlx-lm permite incorporar traducción sin conexión como funcionalidad nativa de una app, sin coste por token ni latencia de red.
- Pretraducción en flujos de localización: puede generar borradores de traducción (machine translation post-editing) que un traductor humano revisa y corrige, acelerando la producción de contenido multilingüe.
- Traducción por lotes de corpus: en pipelines de investigación o minería de textos, mlx-lm permite traducir grandes volúmenes de documentos en local, por ejemplo para preparar datasets multilingües.
- Asistente de escritura multilingüe: en clientes de chat locales (LM Studio, MLX Studio) puede usarse para redactar o reescribir mensajes en otros idiomas aprovechando su perfil conversacional.
- Prototipado de agentes de traducción: su plantilla de chat y soporte multi-turno permiten construir cadenas simples de traducción con revisión o reescritura, por ejemplo traducir, verificar terminología y pulir el registro en pasos sucesivos.
- Chat multilingüe ligero: como modelo conversacional de ~9 B cuantizado, sirve para asistencia general en entornos donde se prioriza la ejecución offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la ficha del modelo cuantizado ni el material consultado incluyen métricas de calidad de traducción (BLEU, COMET, FLORES) ni benchmarks generales (MMLU, HumanEval, GSM8K) para el modelo base o la versión MLX.

## Requisitos de hardware

- Memoria: los pesos ocupan 9,3 GB; se recomienda disponer de unos 12 GB de memoria unificada libres para el modelo más la caché KV y el sistema. Estimación orientativa, no dato oficial.
- Hardware compatible: exclusivamente Apple Silicon (chips Apple M1 o posteriores), ya que MLX es un framework diseñado para esta plataforma. No funciona en GPUs NVIDIA (A100, H100, RTX 4090) ni en entornos CUDA estándar.
- Cabe en equipos de consumo: sí, en Macs con 16 GB de memoria unificada de forma ajustada, y con holgura en configuraciones de 24, 32 o 36 GB (MacBook Pro, Mac mini, Mac Studio).
- Despliegue: mlx-lm (pip install mlx-lm) como vía principal; también cargable en aplicaciones con soporte MLX como LM Studio o MLX Studio. No es compatible directamente con vLLM, TGI ni llama.cpp, que requieren otros formatos (para estos sería necesario el modelo original o una conversión a GGUF).
- Latencia y throughput: no hay cifras publicadas. La cuantización a 8 bits reduce a la mitad el ancho de banda de memoria necesario frente a pesos en bf16 (~18 GB), lo que habitualmente se traduce en mayor velocidad de generación en Apple Silicon, pero no disponemos de medidas concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Index-Translate-9B-MLX-mxfp8 (este modelo) | 8,95 B | no disponible | Apache 2.0 | HuggingFace, formato MLX (solo Apple Silicon) |
| IndexTeam/Index-Translate-9B (base) | 8,95 B | no disponible | Apache 2.0 | HuggingFace, safetensors en precisión completa (~18 GB) |
| Qwen3-8B | 8,2 B | 32.768 (131.072 con YaRN) | Apache 2.0 | HuggingFace, GGUF, vLLM, amplio ecosistema |
| Llama 3.1 8B | 8,03 B | 128K | Llama 3.1 Community | HuggingFace, GGUF, vLLM, amplio ecosistema |

Las especificaciones de Qwen3-8B y Llama 3.1 8B corresponden a sus fichas públicas. Ambos son modelos generales de tamaño similar, no especializados en traducción, y a diferencia de este modelo sí funcionan con vLLM, llama.cpp y GPUs NVIDIA. Frente al modelo base sin cuantizar, esta versión mxfp8 ofrece la misma arquitectura con la mitad de huella de memoria, a costa de una posible pérdida mínima de precisión por la cuantización. No es posible comparar rendimiento por la ausencia de benchmarks publicados.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato MLX solo funciona de forma nativa en Apple Silicon; no es utilizable con vLLM, llama.cpp, TGI ni en GPUs de datacenter sin conversiones adicionales.
- Sin validación pública: no hay benchmarks publicados ni descargas registradas (0 en el momento de redactar la ficha), por lo que conviene evaluar la calidad de traducción con métricas propias (BLEU, COMET) y pruebas de dominio antes de cualquier uso en producción.
- Contexto no documentado: al desconocer la longitud de ventana, existe riesgo de truncamiento en documentos largos; verifíquese en la configuración del modelo base.
- Idiomas no documentados: no se especifican los pares de idiomas soportados ni el comportamiento con idiomas fuera de su cobertura.
- Pérdida por cuantización: mxfp8 puede degradar ligeramente la calidad respecto a los pesos en precisión completa del modelo base.
- Riesgo de alucinación: como todo LLM aplicado a traducción, puede omitir contenido, añadir información inexistente o parafrasear de forma infiel, especialmente en textos técnicos, legales o con terminología específica.
- Licencia: Apache 2.0 permite el uso comercial, la modificación y la redistribución, con la obligación de conservar los avisos de licencia y la atribución; no concede marcas registradas.
- Modelo muy reciente: creado el 29 de octubre de 2026, carece de historial de uso comunitario y de reportes de problemas.

## Enlaces

- Modelo: https://huggingface.co/mlx-community/Index-Translate-9B-MLX-mxfp8
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-9B
- Organización mlx-community: https://huggingface.co/mlx-community
- Repositorio de MLX (GitHub): https://github.com/ml-explore/mlx
- Repositorio de mlx-lm (GitHub): https://github.com/ml-explore/mlx-lm
- Sitio web de MLX: https://mlx-framework.org/
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- MLX Studio: https://mlx.studio/
