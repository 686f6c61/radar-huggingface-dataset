# kaitchup/Qwen3.8-27B-SLQ-GGUF

## Resumen

Qwen3.8-27B-SLQ-GGUF es una cuantización comunitaria del modelo base Qwen/Qwen3.8-27B (27.320.697.856 parámetros) publicada por The Kaitchup. No se trata de un modelo nuevo ni de un entrenamiento adicional: es un conjunto de pesos GGUF generados con una versión personalizada de SLQ (Statistically-Lossless Quantization), un método que asigna precisiones mixtas por tensor en lugar de aplicar una plantilla de cuantización uniforme.

El proceso busca, para cada una de las 498 matrices completas del modelo (incluidas las embeddings y la cabeza de salida), el peso donante ya cuantizado que mejor reproduce la distribución de probabilidad del modelo BF16 de referencia, usando para ello las 10 tokens más probables. El resultado son tres ficheros con objetivos de fidelidad declarados (EAR del 98%, 98,5% y 99%) y tamaños de 18,876 GB, 20,703 GB y 23,697 GB respectivamente.

Su relevancia práctica es doble: por un lado ofrece una vía para ejecutar un modelo de 27B en GPUs de consumo de 24 GB con una pérdida de fidelidad medida y explícita; por otro, sirve como caso de estudio reproducible de cuantización mixta guiada por búsqueda sobre GGUF. El repositorio es solo de texto: no incluye tensores de visión ni proyector multimodal, y conserva tensores MTP cuantizados que no fueron evaluados ni validados para decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en el repo; no se detalla la configuración interna); incluye tensores MTP en el modelo base, conservados en estos GGUF |
| Parámetros totales | 27.320.697.856 (dato de safetensors del modelo base) |
| Parámetros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `--ctx-size 8192`) |
| Tipos de cuantización | Tres asignaciones SLQ de precisión mixta etiquetadas Q5_K_S, Q5_K_M y Q6_K (las etiquetas son de compatibilidad con el Hub, no plantillas estándar); por tensor se usan Q4_K, Q8_0, Q6_K y BF16; embeddings/cabeza de salida: Q4_K/Q8_0 (EAR98), Q4_K/BF16 (EAR98.5), Q6_K/BF16 (EAR99) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (texto completo incluido en el repositorio) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: cuantiza Qwen/Qwen3.8-27B, del que solo se declara la etiqueta de arquitectura `qwen3_5` y el recuento de parámetros. La innovación está en el procedimiento de cuantización. SLQ plantea la compresión como un problema de selección: para cada matriz se eligen candidatos procedentes de pesos ya cuantizados (UD-Q4_K_XL, UD-Q5_K_XL, UD-Q6_K_XL, Q4_0, Q8_0 y BF16 de unsloth/Qwen3.8-27B-GGUF, más IQ3_S de ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF) y se mide la fidelidad estadística frente a la referencia BF16.

La métrica guía es EAR (Expected Acceptance Rate), definida como el solapamiento entre las distribuciones de siguiente token del BF16 y del modelo comparado, renormalizadas ambas sobre las K tokens más probables de la referencia. EAR@10 usa las 10 tokens más probables; la variante de vocabulario completo cubre los 248.320 identificadores del vocabulario. La calibración empleó 512 secuencias de longitud 2.048. El corpus de calibración guió también la selección final, de modo que los valores publicados son fidelidad de calibración y no un resultado sobre un conjunto de evaluación independiente. En los tres ficheros finales no se seleccionó ningún tensor donante de GSQ/RCO, aunque sus candidatos permanecieron elegibles durante la búsqueda. Cada fichero conserva 351.008.768 bytes de tensores MTP cuantizados procedentes del donante UD-Q5_K_XL, desactivados durante la evaluación.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `text-generation` y `conversational`, y se sirve mediante `llama-server` con API compatible con OpenAI.
- Integración directa con llama.cpp: se validó la puntuación nativa de texto y la paridad del GGUF frente al modelo original en una NVIDIA GH200 con el commit `45451c366d4256f94fbc8845645e31a6b9155054`.
- Tres perfiles de fidelidad/tamaño intercambiables (EAR98, EAR98.5, EAR99) para ajustar el compromiso entre VRAM y calidad.
- Capacidades del modelo base no documentadas en la información disponible: no se detallan tool calling, function calling, razonamiento multi-paso, modo thinking, matemáticas ni código. No se deben asumir.
- Multilingüismo: no disponible; el repositorio no declara lista de idiomas.
- Sin visión: no se incluyen tensores de imagen/vídeo ni proyector multimodal, por lo que estos GGUF son exclusivamente de texto.
- MTP presente pero no utilizable como mejora validada: la validación no cubrió decodificación especulativa y el MTP se desactivó durante la evaluación.

## Casos de uso

- Asistente local en estación de trabajo: con EAR98 (18,876 GB) el modelo cabe íntegramente en una GPU de 24 GB y se sirve con `llama-server --n-gpu-layers 99`, lo que permite un asistente conversacional sin dependencia de la nube y con licencia Apache 2.0.
- Sustitución de un despliegue BF16 de 27B por restricción de VRAM: el fichero EAR99 (23,697 GB) reduce el peso a menos de la mitad de los aproximadamente 54,6 GB que ocuparía el BF16 (estimación a 2 bytes por parámetro), manteniendo un 99,000026% de EAR@10 medido frente a la referencia.
- Evaluación de la propia técnica SLQ: los tres ficheros permiten reproducir la curva EAR frente a tamaño de pesos activos y comparar asignaciones de precisión por capa, algo útil para investigación en cuantización.
- Servicio de inferencia compatible con OpenAI en infraestructura propia: el endpoint `/v1/chat/completions` de `llama-server` permite apuntar clientes existentes al modelo sin cambiar el código de integración.
- Procesamiento por lotes de texto en local: con una única GPU de 48 GB (A6000, L40S, RTX 6000 Ada) o 80 GB (A100/H100) se puede aumentar `--ctx-size` y throughput, manteniendo los datos dentro de la organización.
- Pruebas de decodificación especulativa con MTP: los tensores MTP cuantizados están presentes (351 MB) y podrían habilitarse experimentalmente, pero requieren validación propia porque el autor no la realizó.
- Comparación de ficheros GGUF en pipelines de CI: al ser artefactos estáticos con tamaños y métricas declaradas, sirven como referencia para verificar descargas, hashes y comportamiento de distintos backends de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor lo indica de forma explícita: la equivalencia estadística en tareas downstream no está establecida para estas publicaciones. La única métrica reportada es la fidelidad estadística frente al BF16:

| Variante | Fichero GGUF | Pesos de texto activos (GB) | Fichero completo (GB) | EAR@10 medido |
|---|---|---:|---:|---:|
| EAR98 | Qwen3.8-27B-SLQ-EAR98-Q5_K_S.gguf | 18,514 | 18,876 | 98,000383% |
| EAR98.5 | Qwen3.8-27B-SLQ-EAR98.5-Q5_K_M.gguf | 20,341 | 20,703 | 98,500187% |
| EAR99 | Qwen3.8-27B-SLQ-EAR99-Q6_K.gguf | 23,335 | 23,697 | 99,000026% |

Los tamaños están en GB decimales (1 GB = 1.000.000.000 bytes) y los pesos activos excluyen MTP, metadatos y alineación. Un EAR de 0,99 significa un 99% de solapamiento medio de probabilidad sobre el soporte medido; no implica un 99% de acierto en benchmarks ni respuestas generadas idénticas.

## Requisitos de hardware

- VRAM mínima para descarga completa en GPU: 18,876 GB (EAR98), 20,703 GB (EAR98.5) y 23,697 GB (EAR99), sin contar caché KV ni memoria del contexto.
- GPU de 24 GB (RTX 3090, RTX 4090): EAR98 y EAR98.5 caben con margen para contexto moderado; EAR99 queda prácticamente sin espacio para caché KV, por lo que resulta inviable con contexto útil.
- GPU de 32 GB (RTX 5090) y 48 GB (RTX A6000, L40S, RTX 6000 Ada): permiten cualquiera de las tres variantes con ventanas de contexto amplias.
- GPU de 80 GB (A100, H100) y GH200: entorno en el que el autor validó la paridad del GGUF; adecuado para contextos largos y servir a varios clientes.
- GPU de consumo de 12-16 GB: solo con descarga parcial de capas (`--n-gpu-layers` reducido) y el resto en CPU/RAM, con la penalización de latencia correspondiente.
- Opciones de despliegue: llama.cpp (`llama-server`) con soporte de la arquitectura Qwen3.8, que es el runtime validado; cualquier otro backend GGUF (Ollama, LM Studio) requiere comprobar que soporta dicha arquitectura.
- Latencia y throughput: no disponibles; el autor no publica cifras de tokens por segundo ni de tiempo hasta el primer token.
- Repositorio: 63,3 GB en total, ya que aloja las tres variantes; conviene descargar un solo fichero con `hf download ... <fichero>`.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Contexto | Fidelidad declarada | Licencia |
|---|---:|---:|---|---|---|
| Qwen3.8-27B (BF16, referencia) | 27,32 B | ~54,6 GB (estimado) | no disponible | referencia (EAR 100%) | Apache 2.0 |
| Este repo, EAR98 | 27,32 B | 18,876 GB | no disponible | EAR@10 98,000383% | Apache 2.0 |
| Este repo, EAR98.5 | 27,32 B | 20,703 GB | no disponible | EAR@10 98,500187% | Apache 2.0 |
| Este repo, EAR99 | 27,32 B | 23,697 GB | no disponible | EAR@10 99,000026% | Apache 2.0 |

Alternativas dentro de la misma familia, usadas como donantes y por tanto directamente comparables en origen: unsloth/Qwen3.8-27B-GGUF (plantillas UD-Q4_K_XL, UD-Q5_K_XL, UD-Q6_K_XL, Q4_0, Q8_0 y BF16) e ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF (IQ3_S, método GSQ/RCO). De estas dos publicaciones no se dispone en la información proporcionada de tamaños exactos, contexto, métricas de fidelidad ni resultados de benchmarks, por lo que la comparación cuantitativa queda en "no disponible". La diferencia metodológica sí es conocida: las plantillas de Unsloth aplican esquemas de cuantización predefinidos, mientras que SLQ selecciona precisión por matriz optimizando el solapamiento de distribuciones frente al BF16.

## Limitaciones y advertencias

- Las etiquetas Q5_K_S, Q5_K_M y Q6_K de los nombres de fichero son etiquetas de compatibilidad y de familia de precisión dominante; no describen la asignación real de bits por tensor, que es mixta y específica de SLQ. No deben interpretarse como cuantizaciones estándar de llama.cpp.
- EAR mide fidelidad estadística en calibración, no calidad en tareas. El propio autor advierte de que la equivalencia estadística en benchmarks downstream no se ha establecido y de que los valores proceden del mismo corpus usado para seleccionar el modelo.
- No hay datos de benchmarks, idiomas soportados ni longitud de contexto en la información disponible; cualquier despliegue en producción debe validar estas dimensiones por cuenta propia.
- Sin capacidades multimodales: no se incluyen tensores de visión ni proyector, pese a que el modelo base parece contemplarlos; el uso queda restringido a texto.
- Los tensores MTP están presentes pero desactivados en la evaluación; la decodificación especulativa no fue validada y su uso es experimental.
- La validación se hizo con un commit concreto de llama.cpp en una GH200; otras versiones o backends pueden no reproducir el comportamiento.
- Riesgo de alucinación y sesgos: no documentados en el repositorio; son heredados del modelo base y de sus datos de entrenamiento, sobre los que esta ficha no aporta información.
- Licencia Apache 2.0 permite uso comercial, pero los derechos de atribución de los autores originales (Qwen, Unsloth, ISTA-DASLab, autores de SLQ) deben conservarse según el texto incluido en el repositorio.
- Al ser una publicación comunitaria con 239 descargas y 19 likes en el momento de la consulta, no existe el mismo nivel de soporte, mantenimiento ni auditoría que en una publicación oficial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de SLQ: https://arxiv.org/abs/2605.02404
- Repositorio de SLQ: https://github.com/IST-DASLab/SLQ
- Donantes GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Donante GSQ/RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Runtime de inferencia (llama.cpp): https://github.com/ggml-org/llama.cpp
- Newsletter del autor: https://kaitchup.substack.com/subscribe
- Apoyo al autor: https://buymeacoffee.com/kaitchup
