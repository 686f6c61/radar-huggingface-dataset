# mradermacher/wag-4b-GGUF

## Resumen

wag-4b-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo base `skyuu72/wag-4b`, publicado por el usuario mradermacher, conocido por generar versiones cuantizadas de modelos abiertos para inferencia en CPU y GPU de gama baja. Se trata, por tanto, de un artefacto de distribución y no de un modelo entrenado desde cero: el repositorio no aporta pesos originales ni información sobre el entrenamiento, sino conversiones a distintos niveles de precisión.

El nombre del repositorio indica un tamaño aproximado de 4.000 millones de parámetros, aunque no se dispone de confirmación oficial en la model card. El autor documenta únicamente los metadatos de la conversión: versión de cuantización 2, tensores cuantizados en la salida y origen de tipo `hf`, lo que sugiere una conversión desde pesos en formato HuggingFace.

La relevancia de este tipo de repositorios es práctica: permiten ejecutar un modelo de ~4B en hardware de consumo mediante llama.cpp u otras herramientas compatibles con GGUF, con niveles de cuantización que van desde Q2_K (máxima compresión) hasta x-f16 (máxima fidelidad). No obstante, la ausencia de model card descriptiva, licencia declarada y datos de evaluación limita su uso en entornos de producción sin una verificación previa del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible (el nombre sugiere ~4B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (conversión desde pesos HuggingFace) |
| Modelo base | skyuu72/wag-4b |
| Versión de cuantización | 2 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. El repositorio es una conversión de pesos (`convert_type: hf`) con cuantización estática (`quantize_version: 2`, `output_tensor_quantised: 1`), lo que implica que las escalas de cuantización se calcularon durante la conversión y no en tiempo de ejecución.

No hay datos públicos en esta ficha sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO o cualquier innovación técnica del modelo original. Cualquier afirmación al respecto requeriría consultar la model card de `skyuu72/wag-4b`, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto: no confirmada explícitamente en la información disponible, aunque se presupone por tratarse de un modelo de lenguaje de ~4B.
- Razonamiento, código y matemáticas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Despliegue local: al estar en formato GGUF, es compatible con motores de inferencia orientados a CPU y GPU de consumo (llama.cpp y derivados), siempre que la arquitectura del modelo base esté soportada por dichos motores.

## Casos de uso

Dado que no se dispone de información sobre las capacidades reales del modelo base, los siguientes casos son aplicaciones genéricas plausibles para un modelo de ~4B cuantizado, no casos verificados:

- Inferencia local en portátil o equipo de sobremesa: usar las cuantizaciones Q4_K_M o Q5_K_M para ejecutar el modelo en CPU o en GPU de gama media sin depender de servicios en la nube.
- Prototipado rápido y pruebas de concepto: emplear Q8_0 o x-f16 cuando se quiera minimizar la pérdida de precisión durante la evaluación comparativa con el modelo original.
- Despliegue en dispositivos con memoria limitada: usar Q2_K o Q3_K_S en entornos con menos de 4 GB de VRAM/RAM dedicados al modelo.
- Generación de texto offline en entornos sin conectividad: al ser pesos locales, permite operar sin acceso a internet.
- Integración en pipelines de generación aumentada por recuperación (RAG): siempre que el contexto del modelo base lo permita, algo que no se ha podido verificar.
- Experimentación académica con cuantización: el repositorio ofrece 12 variantes del mismo modelo, útil para estudiar el impacto de la cuantización en la calidad de salida.
- Filtrado o clasificación de texto a pequeña escala: si el modelo base tiene instrucciones ajustadas, podría emplearse para tareas de etiquetado; sin confirmación, debe validarse empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones con modelos de referencia.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del tamaño nominal de ~4B parámetros, no datos publicados por el autor:

- x-f16: ~8 GB de pesos; requiere GPU con 10-12 GB de VRAM para contexto corto.
- Q8_0: ~4,3 GB de pesos; ejecutable en RTX 3060 12 GB, RTX 4060 Ti 16 GB.
- Q6_K: ~3,3 GB; viable en GPU de 6-8 GB.
- Q5_K_M: ~2,9 GB; viable en GPU de 6 GB o en CPU con 8 GB de RAM.
- Q4_K_M / Q4_K_S: ~2,4-2,5 GB; opción equilibrada para GPU de 4-6 GB.
- IQ4_XS: ~2,2 GB; pensada para maximizar calidad por byte.
- Q3_K_L / Q3_K_M / Q3_K_S: ~1,9-2,2 GB; aptas para equipos modestos.
- Q2_K: ~1,6 GB; máxima compresión, con degradación esperable de calidad.

Requisitos adicionales:
- La caché KV añade memoria proporcional a la longitud de contexto; con contexto largo, las cifras anteriores pueden duplicarse.
- GPU recomendadas: cualquier GPU con soporte CUDA/Metal/ROCm compatible con llama.cpp (RTX 3060, RTX 4090, Apple Silicon M-series). Para A100/H100 no aporta ventaja especial un modelo de este tamaño, salvo por despliegue por lotes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros motores con soporte GGUF. vLLM y TGI priorizan safetensors, por lo que requerirían el modelo original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible elaborar una comparativa rigurosa porque se desconoce la arquitectura, el contexto, la licencia y el rendimiento del modelo base `skyuu72/wag-4b`.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wag-4b-GGUF (este repositorio) | ~4B (según nombre) | no disponible | no disponible | HuggingFace |
| skyuu72/wag-4b (base) | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas de ~4B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan capacidades, datos de entrenamiento ni evaluación.
- Licencia no declarada: no puede confirmarse que el uso comercial esté permitido. Es imprescindible verificar la licencia del modelo base `skyuu72/wag-4b` antes de cualquier despliegue.
- Idiomas no especificados: se desconoce si el modelo está optimizado para castellano, inglés u otras lenguas.
- Contexto desconocido: no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; sin benchmarks no hay forma de cuantificarlo.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable; solo recomendables cuando la memoria es el factor limitante.
- Sesgos: no evaluados ni documentados.
- Fecha de creación del repositorio (2026-09-22 según los metadatos) y cero descargas/me gusta: sin validación por parte de la comunidad, lo que incrementa el riesgo de artefactos no verificados.
- Los resultados de la búsqueda web proporcionada no guardan relación con el modelo (corresponden a un portal búlgaro de información empresarial) y no aportan ningún dato técnico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/wag-4b-GGUF
- Modelo base: https://huggingface.co/skyuu72/wag-4b
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- Paper, blog o demo oficial: no disponible
- Repositorio de código: no disponible
- Resultados de búsqueda web relevantes: ninguno (los resultados devueltos no están relacionados con el modelo)
