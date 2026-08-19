# AutomatosX/AX-gemma-4-31b-MLX-AXQ-6bit-MTP

## Resumen

El modelo `AX-gemma-4-31b-MLX-AXQ-6bit-MTP` es una cuantización de precisión mixta (AXQ) del modelo `google/gemma-4-31B-it` de Google, realizada por AutomatosX. Está optimizado para ejecutarse en Apple Silicon mediante la librería MLX e incorpora un drafter de multi-token prediction (MTP) para decodificación especulativa, lo que puede acelerar la generación de texto en hardware de Apple. El repositorio incluye los pesos cuantizados del modelo principal, un drafter auxiliar y los manifiestos de configuración necesarios para el motor AX Engine.

El modelo está certificado como Checkpoint Tier 1 en cuanto a tamaño, retención de calidad (≥0.98) e integridad de conversión, aunque la aceleración por MTP no está certificada. La cuantización AXQ de 6 bits reduce el tamaño del modelo base de 31B a aproximadamente 24,4 GB en disco, manteniendo un equilibrio entre rendimiento y fidelidad. Está diseñado para tareas de generación de texto y conversación, con soporte de visión declarado pero no certificado, y sin soporte de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 31B (transformer, base: `google/gemma-4-31B-it`) |
| Parametros totales | 6.312.325.436 (conteo en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQ 6-bit (mixed-precision, ~6.00 BPW) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint instruct de Gemma 4 31B, no un entrenamiento desde cero. La cuantización AXQ (AXQuant) aplica precisión mixta para reducir el tamaño de los pesos manteniendo la calidad, con un objetivo de 6 bits por peso (BPW ≈ 6.00). Además, incluye un drafter `gemma-4-31b-it-assistant` que permite decodificación especulativa multi-token (MTP) en el motor AX Engine, activable mediante variables de entorno. No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre técnicas como RLHF o DPO; estos datos corresponden al modelo original de Google y no se detallan en la información disponible.

## Capacidades

- Generación de texto y conversación (pipeline `text-generation`).
- Decodificación especulativa con MTP (multi-token prediction) mediante un drafter auxiliar, activable por configuración.
- Soporte de visión declarado como `present-not-certified` (los pesos de visión están presentes pero no se ha validado su funcionamiento con MLX-VLM).
- Sin soporte de audio (no hay torre de audio ni pesos asociados).
- Compatible con el ecosistema MLX para Apple Silicon.
- No se documenta soporte explícito de tool calling, agentes o razonamiento multi-paso; se asume que hereda las capacidades del modelo base, pero no están verificadas en esta versión cuantizada.

## Casos de uso

- Despliegue local en Macs con Apple Silicon: al estar optimizado para MLX, permite ejecutar un modelo de 31B cuantizado en equipos con memoria unificada suficiente, ideal para prototipado y aplicaciones offline.
- Chatbots y asistentes conversacionales: el modelo base instruct está afinado para diálogo; esta cuantización mantiene la calidad con un tamaño reducido, adecuado para integración en aplicaciones de escritorio o servidores locales.
- Generación de texto creativo: redacción de artículos, correos, guiones o contenido técnico, aprovechando la capacidad de generación fluida del modelo base.
- Análisis de documentos y resumen: puede procesar textos largos (contexto no especificado, pero se asume similar al modelo base) para extraer información o resumir contenido.
- Investigación en eficiencia de modelos: como ejemplo de cuantización AXQ con MTP, útil para estudiar el impacto de la precisión mixta en modelos grandes.
- Pruebas de decodificación especulativa: el drafter MTP permite experimentar con aceleración de inferencia en Apple Silicon, aunque esta funcionalidad no está certificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Destinado a Apple Silicon (M1/M2/M3/M4 y posteriores) con soporte MLX.
- El tamaño del repositorio es de 24,4 GB; se recomienda al menos 32 GB de RAM unificada para cargar el modelo completo con margen para la generación.
- Para el drafter MTP adicional, se requiere memoria extra (no cuantificada).
- Despliegue mediante MLX y el motor AX Engine; no se mencionan opciones como vLLM o llama.cpp.
- La latencia y el throughput dependen del chip concreto; no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras cuantizaciones de Gemma 4 o modelos similares en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantización de 6 bits puede introducir una ligera degradación de calidad frente al modelo original; la certificación Tier 1 garantiza una retención ≥0.98, pero no es una validación exhaustiva.
- La aceleración por MTP no está certificada; su uso puede no ofrecer mejoras de velocidad y podría requerir ajustes adicionales.
- El soporte de visión está presente pero no certificado; el smoke test con MLX-VLM falló, por lo que no se garantiza su funcionamiento.
- No hay soporte de audio.
- La licencia Gemma de Google impone restricciones de uso comercial; es necesario revisar los términos específicos antes de desplegar en producción.
- Los idiomas soportados no están documentados; se asume que son los del modelo base, pero no se confirma.
- No se proporcionan benchmarks ni datos de rendimiento; cualquier afirmación sobre velocidad o calidad debe validarse en el hardware objetivo.

## Enlaces

- [HuggingFace: AutomatosX/AX-gemma-4-31b-MLX-AXQ-6bit-MTP](https://huggingface.co/AutomatosX/AX-gemma-4-31b-MLX-AXQ-6bit-MTP)
- [Certificado Tier 1 (AXQuant)](https://github.com/defai-digital/axquant/blob/main/docs/certifications/gemma4-31b-axq6-tier1.md)
