# burningfeet/backup2026-09-24-Qwen3.6-35B-A3B-Uncensored-Genesis-Final-GGUF

## Resumen

Este repositorio contiene una cuantización en formato GGUF del modelo Qwen3.6-35B-A3B en su variante "Uncensored", publicada por el usuario burningfeet. Se trata de un derivado del modelo HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, un ajuste sin alineación de seguridad sobre la arquitectura Qwen3.6 de Alibaba. El modelo es multimodal (pipeline image-text-to-text), con arquitectura de mezcla de expertos (MoE) y aproximadamente 34.660 millones de parámetros totales, de los cuales alrededor de 3.000 millones se activan por token según la nomenclatura A3B del nombre.

La relevancia de esta ficha radica en que combina tres características poco habituales en un único artefacto: capacidades de visión, ventana de contexto larga (según las referencias del blog consultado) y ausencia de filtros de rechazo, todo ello empaquetado en GGUF para inferencia local. El repositorio tiene un tamaño de 61,0 GB y las cuantizaciones se han generado con imatrix, lo que permite desplegarlo en hardware de consumo mediante cuantizaciones de baja precisión.

El acceso al repositorio está restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo. En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 likes, y se publicó el 24 de septiembre de 2026. La licencia declarada es Apache-2.0, si bien conviene verificar la licencia del modelo base antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y torre de visión; pipeline image-text-to-text |
| Parámetros totales | 34.660.610.688 (≈34.660 millones) |
| Parámetros activos | ≈3.000 millones por token (según la nomenclatura A3B del nombre; no confirmado en la información disponible) |
| Longitud de contexto | no disponible (las referencias web mencionan contexto largo, sin cifra concreta) |
| Tipos de cuantización | GGUF generado con imatrix; se mencionan variantes K_P, sin listado completo disponible. El repo ocupa 61,0 GB en total |
| Idiomas soportados | inglés (en), chino (zh) y multilingüe |
| Licencia | Apache-2.0 (declarada para el repo; verificar la del modelo base) |
| Formato de pesos | GGUF (safetensors solo como referencia del recuento de parámetros del modelo original) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.6, un transformer con capas de mezcla de expertos: el modelo declara 34.660 millones de parámetros totales y, por la nomenclatura A3B, activaría aproximadamente 3.000 millones por token. Esta configuración reduce el coste computacional por token respecto a un modelo denso del mismo tamaño, algo que se traduce en velocidades de decodificación más propias de un modelo de 3B que de uno de 35B cuando los expertos no activados pueden mantenerse en RAM o disco. Además, incorpora una torre de visión que habilita la entrada de imágenes junto con texto (image-text-to-text), lo que exige un fichero proyector multimodal (mmproj) adicional en los despliegues GGUF.

Sobre el entrenamiento no se dispone de información: no se han publicado el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Lo único documentado es el proceso de ajuste del modelo base por parte de HauhauCS, orientado a eliminar los rechazos, y la posterior cuantización con imatrix realizada por burningfeet para producir los ficheros GGUF. El repositorio de GitHub asociado al modelo base reporta "0/465 refusals", es decir, ninguna negativa ante un conjunto de 465 peticiones de evaluación, lo que confirma el efecto del ajuste sin alineación.

## Capacidades

- Generación de texto conversacional en inglés, chino y otros idiomas (etiqueta multilingual).
- Razonamiento y preservación del "thinking" mejoradas respecto a versiones anteriores de Qwen, según la ficha de la librería de Ollama.
- Generación y edición de código dentro de flujos agénticos, con soporte declarado para agentic coding.
- Comprensión de imágenes: entrada image-text-to-text, útil para descripción, OCR y extracción de información de capturas o fotografías.
- Procesamiento de contexto largo (las referencias web lo mencionan explícitamente, aunque sin cifra publicada).
- Ausencia deliberada de filtros de rechazo: responde a peticiones que los modelos alineados rechazarían.
- Conversación multiturno en formato chat (etiqueta conversational).
- Compatibilidad declarada con endpoints (tag endpoints_compatible), lo que facilita su publicación como servicio HTTP.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Escritura creativa y de ficción sin restricciones temáticas: el ajuste uncensored permite trabajar con narrativa adulta, terror explícito o diálogos crudos sin que el modelo se niegue, algo que los modelos alineados bloquean sistemáticamente.
- Análisis de documentos con imágenes: al aceptar entradas image-text-to-text, puede extraer datos de facturas, capturas de pantalla o formularios escaneados y devolverlos estructurados, integrándose en un pipeline de digitalización.
- Asistente de código autoalojado: con 3.000 millones de parámetros activos por token, la generación es rápida incluso en GPUs modestas, lo que lo hace adecuado para autocompletado y revisión en entornos donde el código no puede salir de la red corporativa.
- Investigación en seguridad y alineación: sirve como sujeto de pruebas para medir tasas de rechazo, estudiar jailbreaks y comparar el comportamiento de un modelo sin alinear frente a su equivalente oficial. El propio repo base reporta 0/465 rechazos, lo que lo convierte en una línea base útil.
- Despliegue en hardware de consumo: con cuantizaciones de baja precisión en GGUF y descarga de expertos a RAM, se puede ejecutar en equipos sin GPU de gama alta, según las referencias que mencionan funcionamiento con 6 GB de VRAM.
- Procesamiento de datos en entornos con soberanía de datos: al ejecutarse localmente, permite tratar textos e imágenes sensibles (sanitarios, legales, recursos humanos) sin enviarlos a APIs externas.
- Atención al cliente en inglés y chino: el soporte multilingüe en/zh lo hace apto para mercados asiáticos y anglosajones con un único modelo, aunque se desconoce su rendimiento real en castellano.
- Generación de contenido sintético para aumento de datos: puede producir diálogos, descripciones de imágenes y textos etiquetados para entrenar otros modelos, sin las restricciones temáticas de las alternativas alineadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo reportado proviene del repositorio de GitHub del modelo base:

| Métrica | Resultado | Fuente |
|---|---|---|
| Tasa de rechazo (evaluación propia) | 0 de 465 peticiones rechazadas | GitHub chenfei66/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |

## Requisitos de hardware

- VRAM estimada para pesos en BF16/FP16: ≈69 GB (34.660 millones de parámetros a 16 bits). No cabe en ninguna GPU de consumo.
- VRAM estimada en Q8_0: ≈37 GB. Requiere una A100 40 GB, una H100 o varias GPUs de consumo.
- VRAM estimada en Q4_K_M: ≈20-21 GB. Cabe en una RTX 4090 (24 GB) o en una RTX 3090 (24 GB) con margen para contexto.
- Cuantizaciones de muy baja precisión (Q2/IQ2 y variantes K_P citadas): ≈10-13 GB, lo que permite ejecución en GPUs de 12-16 GB combinando con descarga de expertos a RAM.
- El blog consultado afirma que puede ejecutarse con 6 GB de VRAM; dado el tamaño del modelo, esto solo es viable con cuantización extrema y offloading parcial de expertos a CPU y RAM, con la consiguiente caída de velocidad.
- Como referencia de velocidad, al activar unos 3.000 millones de parámetros por token el throughput de decodificación se aproxima al de un modelo denso de 3B, siempre que los expertos no activados queden en memoria.
- Opciones de despliegue: llama.cpp y sus derivados, Ollama (existe una entrada qwen3.6:35b-a3b en su librería), LM Studio y llama-cpp-python. Para vLLM o TGI no hay confirmación de compatibilidad con estos ficheros GGUF ni con el proyector de visión.
- Para usar la entrada de imágenes en llama.cpp es necesario descargar además el fichero mmproj correspondiente al proyector multimodal, si está incluido en el repositorio.
- Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| burningfeet/backup2026-09-24-...Genesis-Final-GGUF (este) | 34.660 M totales, ≈3.000 M activos | no disponible | Apache-2.0 | GGUF (imatrix) | Cuantización del base; repo de 61,0 GB; 0 descargas |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 34.660 M totales, ≈3.000 M activos | no disponible | no disponible | safetensors (base) | Modelo base sin cuantizar; reporta 0/465 rechazos |
| burningfeet/backup-2026-09-15-...Genesis-Hermes-Final-GGUF | no disponible | no disponible | no disponible | GGUF | Variante alternativa del mismo autor con ajuste Hermes; sin datos de rendimiento publicados |
| Qwen3.6-35B-A3B (versión oficial, vía Ollama) | familia 35B-A3B | no disponible | no disponible | GGUF distribuido por Ollama | Versión alineada; la ficha de Ollama destaca mejoras en agentic coding y preservación del razonamiento |

No se dispone de datos de benchmark comparativos entre estas variantes, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo sin alineación de seguridad: no incorpora filtros de rechazo, por lo que puede generar contenido ilegal, dañino, sesgado o sexualmente explícito sin advertencia. No es apto para aplicaciones orientadas al público general sin una capa de moderación externa.
- Riesgo elevado de alucinación: al tratarse de un ajuste libre sobre un modelo base, no hay evidencia de que se hayan aplicado técnicas de calibración o mitigación de alucinaciones. No se han publicado evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponibles. No se ha documentado ninguna auditoría de sesgo para este ajuste ni para su modelo base.
- Cobertura de idiomas: las etiquetas solo garantizan inglés, chino y multilingüe genérico, sin confirmación de rendimiento en castellano. Es previsible un desempeño inferior en español que en inglés o chino.
- Longitud de contexto sin confirmar: las referencias web mencionan contexto largo, pero no se publica la cifra exacta, lo que impide dimensionar correctamente el uso de RAG o el análisis de documentos extensos.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace, lo que complica la automatización de descargas y la integración en CI/CD.
- Licencia: aunque el repositorio declara Apache-2.0, es un derivado de un modelo base de terceros. Antes de un uso comercial hay que verificar la licencia del modelo HauhauCS y la de Qwen3.6 original, así como las obligaciones de atribución.
- Cuantizaciones de muy baja precisión: las variantes pensadas para 6 GB de VRAM degradan notablemente la calidad, especialmente en razonamiento y en tareas multimodales.
- Procedencia y trazabilidad: el repositorio es un backup con 0 descargas y 0 likes, publicado por un autor que mantiene múltiples copias de modelos similares (algunas marcadas explícitamente como "ERRONEOUS"). Conviene verificar la integridad de los ficheros antes de usarlos en producción.
- Sin soporte ni mantenimiento garantizado: no hay documentación de versionado, changelog ni canal de soporte para esta cuantización concreta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/burningfeet/backup2026-09-24-Qwen3.6-35B-A3B-Uncensored-Genesis-Final-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Perfil del autor en HuggingFace: https://huggingface.co/burningfeet
- Repositorio de GitHub del modelo base: https://github.com/chenfei66/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Ficha en la librería de Ollama: https://ollama.com/library/qwen3.6:35b-a3b
- Artículo de análisis (CSDN, en chino): https://blog.csdn.net/weixin_41961749/article/details/161501525
- Copia previa marcada como errónea por el propio autor: https://huggingface.co/burningfeet/backup-2026-09-12-ERRONEOUS-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF
