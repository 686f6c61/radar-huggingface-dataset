# kataguru/Apodex-1.1-mini-Finnish-Uncensored-GGUF

## Resumen

Apodex-1.1-mini-Finnish-Uncensored-GGUF es una colección de cuantizaciones GGUF publicada por el usuario kataguru sobre el modelo base `apodex/Apodex-1.1-mini`. Según la model card del autor, el modelo base emplea una arquitectura híbrida descrita como Qwen3.5 MoE con componentes Mamba/SSM, 256 expertos y atención lineal, con un total de 35.505.251.456 parámetros (unos 35,5 mil millones según los pesos safetensors del repositorio). El repositorio ocupa 223,8 GB e incluye versiones cuantizadas de 3 a 6 bits, además de un proyector multimodal (`mmproj`) para entrada de imágenes.

La modificación principal que introduce kataguru respecto al modelo base consiste, según su propia documentación, en una ortogonalización residual de vectores de rechazo (denominada SOMA/ARA), un ajuste SFT ligero de anclaje al finlandés y a la "honestidad epistémica", y la integración de una plantilla de chat propia (Kataguru Master Chat Template v1.0). Todo ello con el objetivo declarado de eliminar comportamientos de rechazo y mejorar la generación nativa en finés.

El aspecto técnico más relevante es la conservación del cabezal MTP (Multi-Token Prediction) / NextN nativo en la capa 40, con 20 tensores adicionales cuantizados, lo que permite decodificación especulativa sin modelo borrador separado. El autor afirma ganancias de velocidad de generación del 30 % al 50 % con este mecanismo en `llama.cpp`. El modelo está pensado para inferencia local en LM Studio, llama.cpp y Ollama, con licencia Apache 2.0 y soporte de finlandés e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida descrita por el autor como Qwen3.5 MoE + Mamba/SSM, 256 expertos, atención lineal |
| Parámetros totales | 35.505.251.456 (≈35,5 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el autor usa `-c 16384` como ejemplo de ejecución, no como especificación) |
| Tipos de cuantización | Q3_K_M (~16 GB), IQ4_XS (~18 GB), Q4_K_M (~20 GB), Q5_K_M (~24 GB), Q6_K (~27 GB); proyector multimodal `mmproj` en BF16 (861 MB) |
| Idiomas soportados | finlandés (fi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El autor describe el modelo base como una arquitectura híbrida Qwen3.5 MoE combinada con Mamba/SSM, con 256 expertos y atención lineal. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Tampoco se especifican los parámetros activos por token ni el mecanismo exacto de enrutamiento de expertos.

La innovación técnica destacada por kataguru es doble. Por un lado, el proceso SOMA/ARA de ortogonalización residual, que según el autor neutraliza los vectores de rechazo aprendidos; a esto se suma un ajuste SFT ligero de anclaje al finés y a la "honestidad epistémica". Por otro, se preserva íntegramente el cabezal MTP/NextN nativo de la capa 40 (20 tensores adicionales), cuantizado junto con el resto del modelo, lo que habilita decodificación especulativa (`--spec-type draft-mtp`) con hasta un 30–50 % más de velocidad de generación según el autor, sin necesidad de un modelo borrador externo. El vocabulario y la tokenización nativos del modelo base no se modifican.

## Capacidades

- Generación de texto conversacional en finlandés e inglés.
- Razonamiento (etiqueta `reasoning` declarada por el autor), sin datos cuantitativos de rendimiento.
- Capacidad multimodal de visión mediante el proyector `mmproj` en BF16 (`llama-mtmd-cli`), para descripción e interpretación de imágenes.
- Decodificación especulativa nativa por cabezal MTP, con ganancia declarada de velocidad del 30–50 %.
- Comportamiento "uncensored": el autor indica que el modelo responde sin aplicar reglas de rechazo.
- Plantilla de chat propia (Kataguru Master Chat Template v1.0) integrada.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y uso conversacional.
- No se documenta soporte explícito de tool calling / function calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Asistencia conversacional en finlandés: el ajuste de anclaje al finés y la plantilla de chat propia permiten mantener diálogos multi-turno coherentes en este idioma, poco cubierto por modelos generalistas.
- Interpretación de imágenes con salida en finés: usando `llama-mtmd-cli` con el proyector `mmproj`, se pueden describir o analizar imágenes y obtener la respuesta en finlandés, útil para tareas de accesibilidad o catalogación local.
- Generación de texto creativo sin rechazos: el comportamiento "uncensored" declarado lo hace adecuado para escritura de ficción o guiones donde otros modelos aplican filtros.
- Inferencia 100 % local en equipos de consumo: las cuantizaciones Q3_K_M (~16 GB) e IQ4_XS (~18 GB) permiten desplegarlo en GPU con 16–24 GB de VRAM sin enviar datos a servicios externos.
- Procesamiento de documentación interna en finlandés: resúmenes, extracción de información y reescritura de textos en un idioma con recursos limitados, ejecutado en infraestructura propia.
- Traducción asistida fi-en / en-fi: con soporte declarado para ambos idiomas, puede emplearse como apoyo en flujos de traducción técnica que requieran revisión humana posterior.
- Prototipado rápido con LM Studio u Ollama: la disponibilidad de GGUF y la compatibilidad con estas herramientas permiten evaluar el modelo en minutos sin configuración compleja.
- Experimentación con decodificación especulativa: el cabezal MTP preservado sirve como banco de pruebas para medir aceleraciones de inferencia en `llama.cpp` sin modelo borrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada, ni comparaciones numéricas con modelos de referencia. El único dato de rendimiento declarado es la mejora de velocidad del 30–50 % atribuida al uso del cabezal MTP para decodificación especulativa.

## Requisitos de hardware

- Q3_K_M (~16 GB): 16 GB de VRAM, la opción más ligera para memoria limitada.
- IQ4_XS (~18 GB): 20–24 GB de VRAM.
- Q4_K_M (~20 GB): 24–32 GB de VRAM, o 32 GB o más de RAM combinados con GPU; versión recomendada por el autor por su relación calidad/velocidad.
- Q5_K_M (~24 GB): 32 GB de VRAM o 64 GB de RAM.
- Q6_K (~27 GB): 32 GB de VRAM o más, calidad casi sin pérdida.
- Proyector multimodal `mmproj` BF16 (861 MB): compatible con cualquier configuración.
- GPU de consumo: las variantes de 3 y 4 bits caben en tarjetas de 16–24 GB (por ejemplo, RTX 4090 de 24 GB con Q3_K_M, IQ4_XS o Q4_K_M). Las variantes de 5 y 6 bits requieren GPU de gama profesional (A100 40/80 GB, H100) o partición en GPU más RAM.
- Despliegue: LM Studio, llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli`) y Ollama, según la model card.
- El autor advierte que, por ser MoE, lo óptimo es mantener el modelo completo en VRAM; si no, conviene al menos ubicar en GPU las capas de atención y los expertos activos.
- Latencia y throughput concretos: no disponibles; solo se indica la mejora relativa del 30–50 % con MTP.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye especificaciones de modelos comparables de la misma categoría (tamaño o tarea) más allá de la referencia al modelo base `apodex/Apodex-1.1-mini` y a la supuesta arquitectura Qwen3.5 MoE, de la que no se aportan datos verificables de rendimiento ni de configuración para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Rendimiento óptimo condicionado al MoE: si los expertos no caben en VRAM y se descargan a CPU, el throughput se degrada; el autor lo señala explícitamente.
- Comportamiento "uncensored": el modelo no aplica reglas de rechazo, por lo que puede generar contenido inapropiado, ofensivo o legalmente problemático. Requiere filtrado y supervisión en cualquier despliegue de producción.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual; al tratarse de un ajuste ligero sobre un modelo base, la tasa de alucinación es desconocida.
- Cobertura idiomática limitada a finlandés e inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Ausencia de benchmarks: no hay evidencia publicada de rendimiento en razonamiento, código o matemáticas que respalde las etiquetas declaradas.
- Proyecto sin tracción verificable: 0 descargas y 0 "likes" en el momento de la consulta, con fecha de creación en 2026, lo que implica ausencia de validación por parte de la comunidad.
- Trazabilidad de las afirmaciones: detalles como "Qwen3.5 MoE + Mamba/SSM", "256 expertos" o la eficacia del proceso SOMA/ARA proceden únicamente de la model card del autor y no se han contrastado con documentación independiente.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar las obligaciones de atribución y el estado del modelo base `apodex/Apodex-1.1-mini` del que deriva.
- Sin documentación sobre tool calling ni evaluación de sesgos; cualquier uso en agentes debe validarse antes de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kataguru/Apodex-1.1-mini-Finnish-Uncensored-GGUF
- Modelo base: `apodex/Apodex-1.1-mini` (referenciado en la model card, sin URL directa proporcionada)
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo. Los resultados devueltos (temas de GitHub sobre `chatgpt-api`, repositorios de jailbreaks tipo DAN y artículos en vietnamita sobre ChatGPT) no guardan relación con Apodex-1.1-mini y se descartan.
