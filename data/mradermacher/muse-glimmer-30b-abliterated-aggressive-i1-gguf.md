# mradermacher/Muse-Glimmer-30B-Abliterated-Aggressive-i1-GGUF

## Resumen

Muse-Glimmer-30B-Abliterated-Aggressive-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `jorkle/Muse-Glimmer-30B-Abliterated-Aggressive`, preparada por mradermacher, un conocido cuantizador de la comunidad. El modelo base es una versión "abliterated" (de-refusal) de un modelo de 30B parámetros, lo que significa que se han eliminado los mecanismos de rechazo que suelen incorporar los modelos alineados, permitiendo respuestas sin restricciones de seguridad. Está diseñado para uso conversacional y, según la model card, es un modelo de visión (vision model), aunque no se detallan sus capacidades multimodales específicas.

La relevancia de esta ficha radica en que ofrece a desarrolladores e investigadores una opción de despliegue local eficiente mediante formatos GGUF, con múltiples niveles de cuantización que permiten ajustar el equilibrio entre calidad y consumo de recursos. Al estar basado en Apache-2.0, su uso comercial está permitido sin restricciones adicionales. Sin embargo, la falta de información pública sobre la arquitectura y entrenamiento del modelo base limita la evaluación técnica profunda.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se desconoce si es transformer, MoE, etc.) |
| Parametros totales | 27.854.794.240 (~27,85 mil millones) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (todos con imatrix) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivos .gguf) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura del modelo base `Muse-Glimmer-30B-Abliterated-Aggressive`. El nombre sugiere que podría ser un modelo de 30 mil millones de parámetros, pero los parámetros reales son 27,85 mil millones, lo que podría indicar una arquitectura con embeddings compartidos o algún tipo de sparse MoE, aunque no se confirma. El proceso de "abliteration" (de-refusal) se aplica mediante una técnica que elimina las direcciones de rechazo del modelo, probablemente usando LoRA para ajustar los pesos sin un entrenamiento completo. No hay datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se utilizaron técnicas como RLHF o DPO. La cuantización i1 de mradermacher emplea imatrix (importance matrix) para optimizar la asignación de bits según la importancia de cada tensor, mejorando la calidad respecto a cuantizaciones estáticas.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta `conversational`).
- Modelo de visión (vision model) según la model card, aunque no se especifican detalles sobre procesamiento de imágenes.
- Sin mecanismos de rechazo (abliterated), por lo que puede responder a solicitudes que otros modelos alineados bloquearían.
- Soporte de tool calling y function calling: no se menciona en la información disponible.
- Capacidades de agentes y razonamiento multi-paso: no se menciona.
- Multilingüe: solo inglés (etiqueta `en`).
- Compatible con endpoints (etiqueta `endpoints_compatible`).

## Casos de uso

- Chatbots sin restricciones de contenido: al ser abliterated, puede emplearse en entornos donde se requiera una generación de texto libre de filtros de seguridad, como investigación en IA o simulación de diálogos sin censura.
- Despliegue local en hardware limitado: gracias a los quants desde 9,9 GB (IQ2_M) hasta 23 GB (Q6_K), puede ejecutarse en GPUs consumer de 12-24 GB, ideal para prototipos y pruebas sin depender de servicios en la nube.
- Integración en aplicaciones de procesamiento de lenguaje natural en inglés: tareas como resumen, extracción de información o generación creativa, siempre que el contenido no requiera moderación.
- Experimentación con modelos de visión y lenguaje: si se dispone del archivo mmproj (en el repo estático), podría usarse para tareas que combinan imágenes y texto, aunque no hay documentación específica.
- Evaluación de técnicas de abliteration: permite comparar el comportamiento de un modelo sin rechazos frente a su versión alineada, útil para investigación en seguridad y alineación.
- Uso en pipelines de inferencia con llama.cpp, Ollama o vLLM: al ser GGUF, es compatible con estos motores, facilitando su integración en aplicaciones de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización:
  - i1-IQ2_M (9,9 GB): cabe en GPUs con 12 GB de VRAM (p. ej., RTX 3060, RTX 4070).
  - i1-Q4_K_M (17 GB): requiere al menos 20 GB de VRAM (RTX 3090, RTX 4080, A5000).
  - i1-Q6_K (23 GB): necesita 24 GB o más (RTX 4090, A100 40GB).
- GPU recomendadas: RTX 3090/4090 para quants medios y altos; A100/H100 para máxima calidad y throughput.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), text-generation-webui.
- Latencia y throughput: no se proporcionan datos, pero se espera que los quants más pequeños (IQ2_M, Q3_K_M) ofrezcan mayor velocidad a costa de calidad, mientras que Q6_K será más lento pero con mejor fidelidad.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (30B abliterated cuantizados). Se recomienda consultar el modelo base original para posibles comparaciones con otras variantes de Muse-Glimmer.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido dañino, ofensivo o ilegal sin filtros. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- Solo soporta inglés; no se garantiza un rendimiento aceptable en otros idiomas.
- La cuantización introduce pérdida de calidad, especialmente en los quants más bajos (IQ2_M, Q2_K). Se recomienda usar Q4_K_M o superior para tareas críticas.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto. Se desconoce la longitud máxima de entrada.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas.
- Al ser una cuantización de un tercero, no hay garantía de que el proceso de abliteration haya sido aplicado correctamente o de que los pesos sean fieles al original.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Abliterated-Aggressive-i1-GGUF
- Repositorio con quants estáticos (incluye mmproj si existe): https://huggingface.co/mradermacher/Muse-Glimmer-30B-Abliterated-Aggressive-GGUF
- Modelo base (jorkle): https://huggingface.co/jorkle/Muse-Glimmer-30B-Abliterated-Aggressive
