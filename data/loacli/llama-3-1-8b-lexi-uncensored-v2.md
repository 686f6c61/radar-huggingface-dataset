# Loacli/Llama-3.1-8B-Lexi-Uncensored-V2

## Resumen

Llama-3.1-8B-Lexi-Uncensored-V2 es un ajuste fino (fine-tune) del modelo Llama-3.1-8B-Instruct publicado por el usuario de HuggingFace Loacli. Se trata de la segunda versión de la familia "Lexi Uncensored", cuyo linaje original corresponde a Orenguteng; esta V2 se presenta como "más compliant" y "más inteligente" que la versión anterior, manteniendo el objetivo de eliminar las capas de alineación y rechazo del modelo base para producir respuestas sin filtros.

El modelo conserva la arquitectura transformer decoder-only de Llama 3.1 con 8.030.261.248 parámetros (~8B), pesos en safetensors y un total de 16,1 GB en el repositorio, lo que corresponde a precisión BF16. El problema que resuelve es concreto: ofrecer una variante de Llama 3.1 8B que no aplique rechazos ni moralización en las respuestas, algo demandado en investigación sobre alineación, generación creativa sin restricciones y pruebas de robustez de sistemas de moderación.

Su relevancia es limitada y muy específica: el repositorio no tiene descargas ni likes y los resultados de benchmarks declarados apuntan a la ficha de Orenguteng, no a evaluaciones propias verificadas. Además, el autor advierte de que la cuantización Q4 presenta problemas de rechazo por pérdida del fine-tune, por lo que recomienda ejecutar en F16 o Q8. Es, por tanto, un modelo para entornos controlados y con supervisión humana, no para producción orientada al usuario final sin una capa de alineación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), basada en Llama-3.1-8B-Instruct |
| Parametros totales | 8.030.261.248 (~8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens heredados de Llama 3.1; no especificado en la model card |
| Tipos de cuantizacion | BF16 (pesos publicados), F16, Q8 y Q4 según las recomendaciones del autor (GGUF vía conversión) |
| Idiomas soportados | No disponible en la model card (el modelo base Llama 3.1 declara 8 idiomas oficiales) |
| Licencia | llama3.1 (Llama 3.1 Community License Agreement) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only con atención completa, normalización RMSNorm y activación SwiGLU, con un total de 8.030.261.248 parámetros. El fine-tune no altera la topología del modelo base, sino que redistribuye el comportamiento mediante ajuste supervisado sobre el checkpoint Instruct, eliminando el sesgo de rechazo característico de los modelos alineados.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o preference optimization. El autor únicamente indica dos cambios respecto a la V1: mayor cumplimiento de instrucciones ("more compliant") y mejora de capacidad de razonamiento ("smarter"). Como innovación operativa, la model card recomienda un system prompt explícito de razonamiento paso a paso ("Think step by step with a logical reasoning and intellectual sense before you provide any response") o, alternativamente, un system prompt mínimo (un simple punto) para maximizar la ausencia de filtros. Es obligatorio mantener los tokens de sistema en la plantilla oficial de Llama 3.1 8B Instruct durante la inferencia.

## Capacidades

- Generación de texto conversacional multi-turno en inglés (idioma no declarado formalmente).
- Razonamiento paso a paso cuando se le induce mediante system prompt explícito.
- Generación de código y texto técnico, heredada del checkpoint Instruct.
- Cumplimiento de instrucciones sin rechazos: acepta peticiones que el modelo base rechazaría, incluidas las éticas o legales dudosas.
- Soporte de plantilla de chat de Llama 3.1 Instruct (roles system/user/assistant).
- Compatibilidad declarada con text-generation-inference y endpoints_compatible, lo que facilita su despliegue en infraestructura tipo HuggingFace Inference Endpoints.
- No se declaran capacidades de visión, audio, tool calling ni uso de agentes en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: sirve como contraste "no alineado" frente a Llama-3.1-8B-Instruct para medir la eficacia de capas de rechazo y estudiar cómo se distribuyen las respuestas ante prompts sensibles.
- Pruebas de robustez de sistemas de moderación: al ser altamente compliant, permite generar un corpus adversario de respuestas no filtradas para entrenar o validar clasificadores de contenido.
- Escritura creativa sin restricciones: narrativa de ficción con violencia explícita, terror o temas controvertidos, donde los modelos alineados introducen rechazos o autocensura que rompen la continuidad del texto.
- Red teaming de productos LLM: generación de jailbreaks y prompts límite para evaluar las defensas de otros sistemas antes de un despliegue.
- Generación de datos sintéticos para ajuste fino: producción de pares instrucción-respuesta sobre dominios marginales que los modelos alineados se niegan a cubrir, con revisión humana posterior.
- Despliegue interno de asistentes especializados en nichos sensibles (salud sexual, derecho penal, reducción de daños) donde la política de rechazo del modelo base resulta contraproducente, siempre con una capa de alineación propia antes de exponerlo como servicio.
- Evaluación comparativa de cuantizaciones: útil para estudiar la degradación del fine-tune al cuantizar, ya que el propio autor documenta pérdida de compliance en Q4 frente a Q8/F16.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados; `verified: false`). La fuente enlazada apunta a la ficha de `Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2`, no a una evaluación independiente de este repositorio.

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | strict accuracy | 77,92 |
| BBH | 3-shot | acc_norm | 29,69 |
| MATH Lvl 5 | 4-shot | exact match | 16,92 |
| GPQA | 0-shot | acc_norm | 4,36 |
| MuSR | 0-shot | acc_norm | 7,77 |
| MMLU-PRO | 5-shot | accuracy | 30,90 |
| Promedio (Avg.) | — | — | 27,93 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni comparaciones directas con el modelo base medidas por el autor.

## Requisitos de hardware

- VRAM en BF16/F16: ~16,1 GB solo para pesos, más caché KV; en la práctica 20-24 GB para contextos moderados.
- VRAM en Q8: ~8,5-9 GB de pesos; viable en GPUs de 12-16 GB con contexto corto.
- VRAM en Q4: ~4,5-5,5 GB; cabe en GPUs consumer de 8 GB, pero el autor advierte de problemas de rechazo por pérdida del fine-tune en esta cuantización.
- GPU recomendadas: A100 40/80 GB o H100 para serving concurrente con contexto largo; RTX 4090 (24 GB) para BF16 en single-GPU; RTX 3090/4080 (16-24 GB) para Q8; RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q8 con contexto reducido.
- Cabe en GPU consumer: sí, en BF16 con una RTX 4090 o 3090; en Q8 con 12 GB o más.
- Opciones de despliegue: transformers, vLLM, TGI (text-generation-inference, declarado en los tags), llama.cpp/Ollama tras conversión a GGUF, y HuggingFace Inference Endpoints (endpoints_compatible).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Alineación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Lexi-Uncensored-V2 (este) | ~8B | 128k (heredado) | Sin alinear (uncensored) | Llama 3.1 | HuggingFace, 0 descargas |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | ~8B | 128k (heredado) | Sin alinear | Llama 3.1 | HuggingFace, modelo de referencia del linaje |
| meta-llama/Llama-3.1-8B-Instruct | ~8B | 128k | Alineado (RLHF + filtros) | Llama 3.1 | HuggingFace, ampliamente adoptado |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32k | Alineado | Apache 2.0 | HuggingFace |

Rendimiento comparado: no disponible con datos verificados. Los benchmarks de la tabla anterior corresponden a la evaluación publicada para el modelo de Orenguteng, por lo que no permiten atribuir diferencias de rendimiento a este fine-tune concreto.

## Limitaciones y advertencias

- Modelo explícitamente sin alinear: el autor advierte de que "será altamente compliant con cualquier petición, incluso poco ética" y recomienda implementar una capa de alineación propia antes de exponerlo como servicio.
- Riesgo de contenido dañino, ilegal o sexualmente explícito en las salidas; la responsabilidad legal y ética recae por completo en quien despliega el modelo.
- Riesgo de alucinación y de razonamiento defectuoso: los resultados en BBH (29,69), GPQA (4,36) y MuSR (7,77) son bajos en términos absolutos; el modelo no es fiable para tareas que exijan razonamiento multi-paso o conocimiento científico preciso.
- MATH Lvl 5 con 16,92 de exact match indica capacidad matemática limitada; no debe usarse como solver sin verificación.
- La cuantización Q4 pierde parte del fine-tune y provoca rechazos intermitentes según el propio autor; para preservar el comportamiento descrito hay que usar F16 o Q8, con el coste de VRAM asociado.
- Requiere mantener los tokens de sistema de la plantilla de Llama 3.1 Instruct; un prompt mal formateado degrada notablemente la calidad de las respuestas.
- Idiomas soportados no declarados en la model card; el rendimiento fuera del inglés no está caracterizado y probablemente sea inferior.
- Los benchmarks declarados no están verificados y la fuente enlazada corresponde a otro repositorio (Orenguteng), por lo que no deben tomarse como validación de esta versión.
- Licencia Llama 3.1: uso comercial permitido bajo los términos de Meta, con obligaciones de atribución, política de uso aceptable y cláusula de terminación si se superan los 700 millones de usuarios mensuales.
- Repositorio sin descargas ni validación de la comunidad (0 descargas, 0 likes); no hay evidencia externa de calidad ni de estabilidad del checkpoint.
- Fecha de creación declarada en 2026-10-28, inusual y a verificar; la trazabilidad del linaje respecto a la versión de Orenguteng no está documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Loacli/Llama-3.1-8B-Lexi-Uncensored-V2
- Modelo de referencia del linaje: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Resultados detallados citados: https://huggingface.co/datasets/open-llm-leaderboard/details_Orenguteng__Llama-3.1-8B-Lexi-Uncensored-V2
- Licencia Llama 3.1 Community: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
