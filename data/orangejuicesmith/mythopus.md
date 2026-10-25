# orangejuicesmith/mythopus

## Resumen

mythopus (publicado bajo el identificador `orangejuicesmith/mythopus`, aunque la model card cita el repo `Shadow0482/mythos`) es un ajuste fino del modelo multimodal `google/gemma-4-E2B-it`, a su vez derivado del modelo sin censura `prithivMLmods/gemma-4-E2B-it-Uncensored-MAX`. El autor lo distribuye únicamente en formato GGUF, cuantizado en Q5_K_M, junto con un proyector multimodal independiente en BF16, lo que lo hace directamente ejecutable con llama.cpp tanto en modo texto como en modo visión-lenguaje.

El ajuste se realizó mediante LoRA y SFT supervisado sobre unas 40.000 muestras de alta calidad del denominado "Opus 4.7 dataset", que incluye trazas de razonamiento encadenado (chain-of-thought). Según el autor, el entrenamiento se hizo con Unsloth, se fusionaron los adaptadores en los pesos base y después se convirtió el resultado a GGUF con las herramientas oficiales de llama.cpp.

El dato objetivo disponible es el recuento de parámetros de los safetensors: 4.647.450.147 (aproximadamente 4,65 mil millones). No hay información publicada sobre longitud de contexto, licencia explícita, idiomas soportados ni resultados de benchmarks, lo que limita seriamente su evaluación para producción. Es relevante ahora porque ejemplifica el flujo habitual de la comunidad: fine-tuning ligero de un modelo base multimodal, orientado a eliminar restricciones de contenido y a publicar artefactos GGUF listos para inferencia local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de google/gemma-4-E2B-it (modelo base multimodal de tipo vision-language / any-to-any). No se especifica si es transformer denso, MoE o híbrido |
| Parámetros totales | 4.647.450.147 (según safetensors del repositorio) |
| Parámetros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q5_K_M (modelo principal) y BF16 para el proyector multimodal (mmproj) |
| Idiomas soportados | No disponible (la model card no los declara) |
| Licencia | No disponible (no declarada en el repositorio; debe verificarse la licencia del modelo base Gemma) |
| Formato de pesos | GGUF (llama.cpp); el repositorio también contiene safetensors según los metadatos de parámetros |
| Pipeline declarado | any-to-any |
| Tamaño del repositorio | 23,7 GB |
| Fecha de creación / actualización | 24 de octubre de 2026 (sin actualizaciones posteriores) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible. El modelo hereda la del base `google/gemma-4-E2B-it`, del que la model card solo indica que es un modelo de visión-lenguaje con soporte de proyector multimodal (mmproj). El ajuste fino se aplicó sobre la variante ya descensurada `prithivMLmods/gemma-4-E2B-it-Uncensored-MAX`, por lo que launcensura del comportamiento se preserva explícitamente según el autor.

El entrenamiento consistió en SFT con LoRA (PEFT/TRL) sobre aproximadamente 40.000 pares instrucción-respuesta del "Opus 4.7 dataset", que incluye trazas de chain-of-thought, con limpieza, deduplicación y filtrado de calidad previos, y un split 95/5 entre entrenamiento y validación. El modelo base se cargó en cuantización de 4 bits durante el entrenamiento para ahorrar VRAM, en un entorno multi-GPU. Tras el entrenamiento se fusionaron los adaptadores LoRA en los pesos, se guardó en formato Hugging Face y se convirtió a GGUF con las herramientas de llama.cpp, generando el fichero principal en Q5_K_M y el proyector multimodal en BF16. No se documentan hiperparámetros concretos (learning rate, rango/alpha de LoRA, épocas, número de tokens vistos) ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat tipo Gemma (roles system/user/assistant).
- Razonamiento encadenado: el dataset de ajuste incluye trazas de chain-of-thought, orientadas a mejorar el seguimiento de instrucciones y el razonamiento paso a paso.
- Procesamiento de imágenes: el repositorio incluye un proyector multimodal (`BF16-mmproj.gguf`) que habilita inferencia visión-lenguaje mediante `llama-mtmd-cli`.
- Ejecución en modo texto puro mediante `llama-cli` con el flag `--jinja` para aplicar la plantilla de chat.
- Comportamiento sin censura declarado por el autor, heredado del modelo base `gemma-4-E2B-it-Uncensored-MAX`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en los metadatos de HuggingFace).
- No se documentan capacidades de tool calling, function calling, razonamiento agéntico multi-paso, audio ni otros modos distintos de texto e imagen.

## Casos de uso

- Inferencia local de visión-lenguaje en estación de trabajo: con el fichero Q5_K_M y el mmproj en BF16 se puede describir, clasificar o extraer información de imágenes sin conexión, usando `llama-mtmd-cli` sobre llama.cpp.
- Procesamiento por lotes de documentos escaneados: al ser un modelo de ~4,6B parámetros en 5 bits, cabe en una GPU de consumo y permite ejecutar OCR semántico o resumen de capturas y páginas escaneadas a un coste marginal bajo.
- Asistente conversacional autoalojado con requisitos de contenido flexibles: el ajuste sin censura resulta adecuado para entornos de investigación o creación de ficción donde se necesita que el modelo no rechace temas sensibles, siempre con revisión humana.
- Generación de razonamiento paso a paso para conjuntos de datos sintéticos: al haberse entrenado con trazas de chain-of-thought, puede emplearse para producir borradores de cadenas de razonamiento que luego se filtran y se usan como material de entrenamiento.
- Prototipado rápido de aplicaciones any-to-any: la etiqueta de pipeline `any-to-any` y el formato GGUF permiten integrarlo en un prototipo de demo con llama.cpp o con servidores compatibles con la API de OpenAI sin pasos de conversión adicionales.
- Experimentación académica sobre fine-tuning de sub-4B: sirve como caso de estudio reproducible del pipeline Unsloth + LoRA + fusión + conversión GGUF sobre un modelo base multimodal.
- Evaluación comparativa de comportamientos sin censura: útil en estudios de safety para medir tasas de rechazo, toxicidad y alucinación frente al modelo base alineado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y el repositorio no aporta comparaciones cuantitativas con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para el fichero principal en Q5_K_M: en torno a 3,2-3,5 GB solo para los pesos (estimación a partir de 4,65B parámetros a ~5,5 bits por parámetro); hay que sumar el proyector multimodal en BF16, cuyo tamaño exacto no se detalla.
- Presupuesto práctico en modo texto: aproximadamente 4-5 GB de VRAM considerando pesos y caché KV para contextos moderados (estimación; el contexto real soportado no está documentado).
- Presupuesto práctico en modo multimodal: añadir varios cientos de megabytes a un par de gigabytes por el mmproj en BF16; se recomienda reservar 6-8 GB de VRAM para operar con holgura.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores). En 6 GB podría funcionar con contexto reducido.
- GPU profesionales: A100, H100 o L40S no son necesarias para esta cuantización; resultan sobredimensionadas salvo que se quiera servir con mucho paralelismo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`) es la vía soportada de forma explícita. vLLM, TGI u Ollama no se mencionan en la documentación; la compatibilidad con Ollama requeriría verificar el soporte del mmproj y de la arquitectura del modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mythopus (orangejuicesmith/mythopus) | 4.647.450.147 | No disponible | No disponible | GGUF (Q5_K_M + mmproj BF16) | Fine-tuning SFT con LoRA sobre ~40.000 muestras; sin censura declarada |
| google/gemma-4-E2B-it (modelo base) | No disponible en la información | No disponible | No disponible (términos de Google Gemma, a verificar) | No disponible | Modelo multimodal alineado original; referencia de comportamiento y seguridad |
| prithivMLmods/gemma-4-E2B-it-Uncensored-MAX | No disponible en la información | No disponible | No disponible | No disponible | Base inmediata del ajuste; ya sin censura |
| Alternativas de ~3-5B multimodales (p. ej. familias Qwen-VL pequeñas, SmolVLM, Gemma 3n) | No disponibles en la información proporcionada | No disponible | No disponible | No disponible | No se aportan datos verificados en esta ficha; requieren comparación directa antes de elegir |

No se dispone de datos de rendimiento comparado (benchmarks) que permitan afirmar superioridad frente a ninguna de estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, GSM8K, HumanEval ni MMMU; el rendimiento real es desconocido.
- Licencia no declarada: no se especifica la licencia del ajuste ni se reproducen los términos del modelo base. Antes de un uso comercial hay que verificar la licencia de `google/gemma-4-E2B-it` y las condiciones de redistribución de un modelo derivado.
- Modelo explícitamente sin censura: el autor declara preservar el comportamiento del base "Uncensored-MAX", lo que implica mayor probabilidad de generar contenido sensible, ofensivo o inseguro. Requiere filtros y revisión humana en cualquier despliegue público.
- Riesgo de alucinación: al ser un modelo de ~4,6B parámetros con ajuste SFT sobre datos generados por otro modelo (Claude Opus 4.7), puede reproducir errores factuales y estilo del generador original, incluidas trazas de razonamiento inventadas.
- Idiomas no declarados: se desconoce el soporte multilingüe real más allá del inglés; el dataset de ajuste parece estar orientado a instrucciones en inglés.
- Longitud de contexto desconocida: no se puede dimensionar la caché KV ni garantizar conversaciones largas o documentos extensos.
- Inconsistencia de identidad: los metadatos apuntan a `orangejuicesmith/mythopus` mientras la model card usa `Shadow0482/mythos`; conviene confirmar el repositorio correcto antes de descargar.
- Solo se documentan dos artefactos GGUF (Q5_K_M y mmproj BF16) frente a un repositorio de 23,7 GB, lo que sugiere ficheros adicionales no descritos.
- Naturaleza de "any-to-any": la etiqueta de pipeline sugiere más modalidades de las realmente documentadas; la evidencia disponible solo cubre texto e imagen.
- Sin métricas de latencia ni soporte confirmado en motores de serving de alto rendimiento (vLLM, TGI), lo que complica el despliegue escalado.
- Fecha de creación futura (octubre de 2026) y cero descargas o likes: no hay validación de la comunidad ni informes independientes de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orangejuicesmith/mythopus
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Base sin censura: https://huggingface.co/prithivMLmods/gemma-4-E2B-it-Uncensored-MAX
- Unsloth (herramienta de fine-tuning citada): https://github.com/unslothai/unsloth
- llama.cpp (conversión y ejecución GGUF): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la información proporcionada papers, blogs técnicos, demos ni repositorios adicionales del autor.
