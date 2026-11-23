# ferreslabs/krun-one-v1-multimodal

## Resumen

Krun One v1 multimodal (internamente M1.5c) es un modelo de decisión multimodal desarrollado por ferreslabs. No es un modelo generativo: combina un núcleo de texto congelado (Krun One v1, 879 millones de parámetros) con torres de visión y audio también congeladas, y añade una capa de fusión entrenada de apenas 26,7 millones de parámetros. Su salida es siempre una decisión estructurada y tipada (`choice`, `noul`, `score`, `multi`), nunca texto libre.

El modelo resuelve un problema concreto: convertir imágenes, documentos (escaneos, capturas de pantalla, PDF o DOCX con o sin capa de texto) y audio en evidencia para tomar decisiones clasificatorias. Integra SigLIP2 base NaFlex como torre visual, Whisper-small para ASR y rama acústica, y RapidOCR PP-OCRv5 mobile para extracción de texto, todo orquestado por adaptadores multimodales entrenados.

Es relevante porque ofrece un pipeline multimodal completo y determinista con latencias muy bajas (13,5 ms para imagen, ~79 ms para página escaneada con OCR, ~77 ms para 5 s de audio en una RTX 4090), licencia Apache-2.0 en los pesos de fusión y soporte para cuatro idiomas (inglés, portugués, español y francés). Su naturaleza de "modelo de decisión" con abstención lo orienta a sistemas de clasificación y enrutamiento en producción más que a asistentes conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusión multimodal sobre núcleo de texto congelado + torres de visión (SigLIP2) y audio (Whisper-small) congeladas; adaptadores y LoRA entrenados |
| Parametros totales | ~1.244 millones (879,4 M texto + 92,9 M visión + 241,7 M audio + 3,1 M OCR + 26,7 M fusión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo incluye pesos PyTorch y ONNX para OCR; el modelo base aparece como `quantized` en los tags) |
| Idiomas soportados | Inglés (en), portugués (pt), español (es), francés (fr) |
| Licencia | Apache-2.0 (pesos de fusión); las torres mantienen sus licencias originales |
| Formato de pesos | PyTorch y ONNX (componente OCR); tamaño del repo 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es una fusión de componentes congelados. El núcleo textual Krun One v1 (879,4 M de parámetros) permanece inmutable; sobre él se montan tres torres también congeladas: SigLIP2 base NaFlex (92,9 M) para visión, Whisper-small (241,7 M) para ASR y rama acústica, y RapidOCR PP-OCRv5 mobile (3,1 M, en formato ONNX) para detección y reconocimiento de texto latino. La parte entrenada, M1.5c, consta de un adaptador de imagen compartido con documentos, un adaptador de audio, embeddings de modalidad y un LoRA r16 sobre la cabeza de decisión, sumando 26,7 M de parámetros.

El entrenamiento de la fusión se realizó sobre un conjunto heterogéneo de datos: COCO 2017 para imágenes, DocLayNet para layout documental, CORD v2 para recibos, MInDS-14 y FLEURS para voz, SIB-200 para etiquetas temáticas, CREMA-D para emoción actuada y habla sintética de Kokoro-82M. No se documenta el número total de tokens ni el uso de RLHF o DPO; el modelo no genera texto, por lo que el paradigma de alineación generativa no aplica. La innovación principal es la conversión de todas las modalidades en evidencia para una misma cabeza de decisión tipada, con abstención explícita como señal de salida.

## Capacidades

- Clasificación y decisión estructurada sobre texto, imágenes, documentos y audio con salidas tipadas (`choice`, `noul`, `score`, `multi`).
- Comprensión de documentos: procesa escaneos, capturas de pantalla y PDF/DOCX con o sin capa de texto, combinando OCR y visión.
- Reconocimiento de layout documental (DocLayNet) con categorías como tipo de documento y estructura.
- Reconocimiento de voz (ASR) mediante Whisper-small integrado.
- Análisis de intención en habla real (evaluado sobre MInDS-14).
- Clasificación de imágenes visual-only.
- Señal débil de emoción actuada (reconocimiento limitado, según el autor).
- Abstención ante entradas no fiables (advisory en el caso de medios).
- Capacidades multilingües en inglés, portugués, español y francés.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Clasificación de documentos entrantes en back office: el modelo decide el tipo de documento (factura, recibo, formulario) a partir de escaneos o PDF, con 96,1% en documentos sintéticos y 100% en tipo CORD según la model card, adecuado para enrutamiento automático.
- Extracción de decisiones sobre recibos: con CORD v2 en el entrenamiento, puede clasificar y puntuar campos de recibos para alimentar sistemas de contabilidad o gastos.
- Triaje de capturas de pantalla en soporte técnico: la lectura de texto vía OCR alcanza 99,2% en la evaluación, útil para categorizar tickets con imágenes adjuntas.
- Enrutamiento de llamadas por intención: el ASR integrado más la clasificación de intención (89,7% en MInDS-14) permite dirigir llamadas a departamentos sin transcripción generativa.
- Moderación y clasificación de imágenes en pipelines de contenido: la rama visual-only (64,8%) sirve para etiquetado preliminar o filtrado con abstención cuando la confianza es baja.
- Automatización documental con abstención: en flujos donde un error es costoso, la salida `noul` permite derivar casos dudosos a revisión humana, reduciendo falsos positivos en producción.
- Análisis de audio corto en dispositivos: latencias de ~77 ms para 5 s de audio en RTX 4090 lo hacen viable para clasificación en tiempo casi real de clips breves.

## Benchmarks y rendimiento

| Tarea | Resultado (val_eval) |
|---|---|
| Documentos visual-only (media) | 68,0% |
| DocLayNet layout | 38,7% |
| Capturas de pantalla (texto vía OCR) | 99,2% |
| Habla real (MInDS-14 + FLEURS) | 85,1% |
| MInDS-14 intención | 89,7% |
| Imágenes (visual-only) | 64,8% |
| Documentos híbridos: tipo sintético | 96,1% |
| Documentos híbridos: categoría DocLayNet | 94,5% |
| Documentos híbridos: tipo CORD | 100% |
| Latencia imagen (RTX 4090, p50) | 13,5 ms |
| Latencia página escaneada con OCR (p50) | ~79 ms |
| Latencia 5 s audio (p50) | ~77 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo y no aplica ese tipo de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ~1,24 mil millones de parámetros totales, la inferencia en fp32 ronda los 5 GB y en fp16 los 2,5 GB, aunque las torres congeladas pueden ejecutarse por separado.
- GPU recomendadas: RTX 4090 (referencia de latencia del autor), A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, por tamaño; se ha validado en RTX 4090 con latencias p50 de 13,5 ms (imagen) a ~79 ms (documento con OCR).
- Opciones de despliegue: runtime propio `krun_one.v1.multimodal.runtime` del repositorio GitHub krun-ai/krun-one; el OCR se sirve en ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Throughput: no disponible; solo se publican latencias p50 por tipo de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krun One v1 multimodal | ~1.244 M (26,7 M entrenados) | No disponible | Decisión multimodal tipada con abstención | Apache-2.0 (fusión) | Hugging Face + GitHub |
| Modelos VLM generativos (p. ej. familia LLaVA) | Miles de millones | Variable | Generación de texto sobre imagen | Variable | Hugging Face |
| Clasificadores documentales especializados | Decenas de millones | No aplica | Clasificación de layout | Variable | Hugging Face |
| Pipelines ASR + clasificador (Whisper + cabecera) | ~242 M + cabecera | No aplica | Clasificación de audio | MIT/Apache-2.0 | Hugging Face |

No se dispone de comparativas directas publicadas con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El habla de más de ~20 s puede truncarse; el límite duro es de 30 s.
- Clases de layout débiles: notas al pie y leyendas presentan bajo rendimiento (DocLayNet layout global 38,7%).
- El reconocimiento de emoción actuada es solo una señal débil, no fiable para producción sensible.
- La abstención en medios es advisory: no debe tratarse como garantía de rechazo ante entradas dudosas.
- Solo admite una página de medios para tokens de visión; no soporta vídeo.
- No genera texto: no sirve para resúmenes, respuestas conversacionales ni razonamiento libre.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas en dominios no cubiertos por el entrenamiento.
- Las torres conservan sus licencias originales (SigLIP2 Apache-2.0; Whisper MIT/Apache-2.0; PaddleOCR/RapidOCR Apache-2.0); verificar cumplimiento en uso comercial combinado.
- Los datos de entrenamiento incluyen conjuntos con licencias específicas (CREMA-D ODbL/DbCL, SIB-200 CC-BY-SA-4.0); revisar `NOTICE.md` antes de redistribuir.

## Enlaces

- Hugging Face: https://huggingface.co/ferreslabs/krun-one-v1-multimodal
- Modelo base textual: https://huggingface.co/ferreslabs/krun-one-v1
- Repositorio GitHub: https://github.com/krun-ai/krun-one
- SigLIP2 base NaFlex: https://huggingface.co/google/siglip2-base-patch16-naflex
- Whisper-small: https://huggingface.co/openai/whisper-small
- RapidOCR (PP-OCRv5): no disponible enlace directo en la información proporcionada
- Documentación de limitaciones (`KNOWN_LIMITATIONS.md`) y `NOTICE.md`: referenciados en la model card, sin URL directa disponible
