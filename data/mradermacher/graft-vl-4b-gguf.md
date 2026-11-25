# mradermacher/Graft-VL-4B-GGUF

## Resumen

Graft-VL-4B-GGUF es una conversión a formato GGUF del modelo multimodal Graft-VL-4B, publicado por el usuario mradermacher en Hugging Face. Se trata de una cuantización estática generada con llama.cpp a partir de los pesos originales de sayantan1/Graft-VL-4B, pensada para facilitar la inferencia local en hardware de consumo mediante herramientas compatibles con GGUF (llama.cpp, Ollama, LM Studio, etc.).

El dato más relevante y a la vez más llamativo es el recuento de parámetros: aunque el nombre comercial indica "4B", los safetensors del repositorio original suman 415.347.712 parámetros (aproximadamente 0,42 mil millones). Esta discrepancia sugiere que el identificador "4B" no corresponde al tamaño real del modelo o que los pesos publicados son parciales (por ejemplo, solo un componente del sistema multimodal). No hay información pública en la model card que aclare esta cuestión.

La ficha se limita a documentar lo que consta en los metadatos y la model card del repositorio. La información sobre arquitectura, datos de entrenamiento, licencia, idiomas y rendimiento no está disponible en la documentación proporcionada, por lo que se indica explícitamente en cada apartado correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 415.347.712 (según safetensors del repo original; el nombre indica "4B") |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors |
| Tamano del repo | 1,3 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-11-24 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Graft-VL-4B en la documentación proporcionada. El sufijo "VL" del nombre sugiere un modelo visión-lenguaje (vision-language), pero no hay confirmación técnica en la model card ni en los metadatos. Tampoco consta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es el proceso de conversión: la model card indica `convert_type: hf`, `quantize_version: 2` y `output_tensor_quantised: 1`, lo que corresponde al flujo estándar de cuantización estática de llama.cpp a partir de pesos en formato Hugging Face. No se especifica si se conservó el proyector multimodal (`mmproj`) en las cuantizaciones publicadas; el campo `skip_mmproj` aparece vacío, por lo que no puede confirmarse su inclusión.

## Capacidades

- Generación de texto: presumible, aunque no documentada en la model card.
- Capacidades de visión: el nombre "VL" lo sugiere, pero no hay confirmación ni detalles sobre resolución de imagen, tipos de entrada o tareas soportadas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

Dada la ausencia de documentación funcional, los casos de uso solo pueden plantearse de forma condicional:

- Evaluación exploratoria de modelos visión-lenguaje: el formato GGUF permite probar el modelo en llama.cpp con bajo coste de infraestructura antes de comprometerse con despliegues mayores.
- Prototipado en hardware de consumo: con cuantizaciones Q4_K_M o Q5_K_M y un tamaño de repo de 1,3 GB, el modelo podría ejecutarse en GPUs de gama media o incluso en CPU, si bien el recuento real de parámetros (415 M) hace pensar en un modelo pequeño.
- Investigación sobre cuantización: útil para estudiar el impacto de distintas cuantizaciones (de Q2_K a Q8_0) en un modelo multimodal concreto.
- Pruebas de integración con Ollama o LM Studio: validar pipelines de inferencia local con modelos GGUF de visión antes de pasar a modelos mayores.
- Fines educativos: analizar el flujo de conversión HF a GGUF y las diferencias entre cuantizaciones estáticas.
- Despliegue en entornos con restricciones de memoria: la cuantización Q2_K permitiría ejecución en dispositivos con muy poca VRAM, aunque con degradación de calidad probable.

En ningún caso estos casos de uso están respaldados por benchmarks o documentación del autor; deben tratarse como hipótesis a validar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable. Con 415 M parámetros reales, una cuantización Q4_K_M ocuparía del orden de 250-300 MB, y Q8_0 en torno a 450 MB; sin embargo, el nombre "4B" y el tamaño del repo (1,3 GB) apuntan a que los pesos publicados podrían no representar el modelo completo, por lo que estas cifras son orientativas.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con 4 GB o más de VRAM debería ser suficiente si el modelo real es de 415 M; si fuese realmente de 4B, se necesitarían 8-12 GB en cuantizaciones Q4-Q5.
- ¿Cabe en GPU de consumo? Probablemente sí en la mayoría de tarjetas recientes (RTX 3060 en adelante), pero no puede confirmarse sin datos del modelo base.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el componente visual haría falta confirmar la disponibilidad del `mmproj`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre el modelo base (arquitectura, tamaño real, licencia) para establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre ("4B") y el recuento real de parámetros (415 M): puede tratarse de un modelo parcial, de un error de nomenclatura o de un componente de un sistema mayor. Verificar antes de cualquier uso en producción.
- Licencia no especificada: no puede garantizarse el uso comercial. Contactar con el autor original (sayantan1) antes de desplegar.
- Idiomas soportados no documentados: riesgo de comportamiento deficiente fuera del idioma de entrenamiento (desconocido).
- Sin benchmarks ni evaluación publicada: no hay evidencia de calidad, sesgos o robustez.
- Riesgo de alucinación: inherente a cualquier modelo generativo y no cuantificado en este caso.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad, especialmente en tareas multimodales.
- Posible ausencia del proyector multimodal en el paquete GGUF: si `mmproj` no está incluido, el modelo no podrá procesar imágenes aunque el nombre lo sugiera.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Graft-VL-4B-GGUF
- Modelo original: https://huggingface.co/sayantan1/Graft-VL-4B
