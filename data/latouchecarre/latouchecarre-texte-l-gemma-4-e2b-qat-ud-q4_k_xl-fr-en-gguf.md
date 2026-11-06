# LaToucheCarre/LaToucheCarre-Texte-L-Gemma-4-E2B-QAT-UD-Q4_K_XL-FR-EN-GGUF

## Resumen

LaToucheCarre-Texte-L-Gemma-4-E2B-QAT-UD-Q4_K_XL-FR-EN-GGUF es una derivación del modelo Gemma 4 E2B en su variante instruction-tuned y cuantizada con entrenamiento sensible a la cuantización (QAT) de Google, publicada originalmente por Google DeepMind bajo licencia Apache 2.0 y reconvertida a GGUF por Unsloth. El autor, LaToucheCarre, distribuye esta versión con un vocabulario drásticamente recortado: de los 262.144 tokens del vocabulario original se eliminan 103.311 (un 39,4 %), conservando únicamente aquellos cuya escritura es latina y compatible con francés e inglés. El objetivo es reducir el peso en disco y, sobre todo, la RAM de host que llama.cpp reserva para las tablas de vocabulario.

El modelo está pensado para una tarea muy concreta: corrección gramatical y ortográfica de textos en francés e inglés dentro de un asistente de escritura local para Windows (La Touche Carré), que no envía texto a ningún servidor. Con 3.544.217.379 parámetros totales según los safetensors del modelo base (nótese que la nomenclatura "E2B" de Gemma alude a parámetros efectivos, no al total), el archivo GGUF ocupa 2.005 MB tras el recorte, frente a los 2.620 MB del original sin recortar.

La relevancia actual reside en dos factores: por un lado, demuestra una técnica de poda de vocabulario sin reentrenamiento ni recuantización que preserva la calidad de salida en la tarea objetivo (98 aciertos sobre 104 faltas etiquetadas, cero palabras dañadas); por otro, ofrece un punto de comparación práctico frente al palier anterior del mismo producto (Gemma 4 E4B IQ3_XXS recortado), con un tercio menos de peso y un rendimiento superior en velocidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), con tabla de embeddings por capa (`per_layer_token_embd`) |
| Parámetros totales | 3.544.217.379 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens en las pruebas del autor (no se especifica el máximo arquitectónico) |
| Tipos de cuantización | Q4_K_XL dinámica (UD) sobre base QAT; el repositorio base de Unsloth incluye otras variantes UD |
| Idiomas soportados | francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B instruction-tuned en versión QAT, es decir, entrenado con cuantización simulada para que la pérdida de precisión al convertir a 4 bits sea mínima. Unsloth aplica sobre esa base una cuantización dinámica GGUF (UD, "unsloth dynamic"), que asigna distintos tipos de cuantización a distintas capas según su sensibilidad. La innovación específica de esta ficha no está en el entrenamiento sino en la modificación post-hoc del vocabulario: se eliminan 103.311 tokens no latinos o incompatibles con francés e inglés, se recortan las filas correspondientes de `token_embd.weight` y de `per_layer_token_embd.weight`, se filtran las fusiones BPE y se renumeran los tokens especiales. No hay reentrenamiento ni recuantización: los pesos restantes quedan intactos.

El autor verifica que la misma poda aplicada a otros Gemma de su catálogo produce texto idéntico al original en once correos con 104 faltas etiquetadas bajo decodificación glotona (temperatura 0), lo que sugiere que la eliminación de tokens no afecta a la salida en ese dominio. La razón de fondo es que llama.cpp mantiene las tablas de vocabulario en CPU aunque el resto de capas se descarguen en GPU, de modo que el recorte impacta principalmente en la RAM de host; para moverlas a la GPU existe la opción `--override-tensor "token_embd\.weight=CUDA0,per_layer_token_embd\.weight=CUDA0"`. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en francés e inglés, con soporte de turnos multi-turno.
- Corrección gramatical y ortográfica: caso de uso principal declarado por el autor, evaluado sobre once correos con 104 faltas etiquetadas.
- Razonamiento desactivable: las pruebas se realizan con el modo razonamiento apagado ("raisonnement désactivé"), lo que sugiere que el modelo base lo incorpora.
- Ejecución en llama.cpp, con compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidad multilingüe limitada a fr y en por construcción: el vocabulario recortado elimina escrituras no latinas, por lo que otros idiomas quedan fuera de alcance.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Corrección de correos y textos administrativos en local: el modelo procesa once correos con 104 faltas en 5,8 s en GPU o 57,6 s en CPU, con cero palabras dañadas, lo que lo hace apto para un flujo de escritura asistida sin salida a red.
- Asistente de escritura de escritorio para Windows: integrado en La Touche Carré, permite dictado y corrección sin enviar texto a servidores, con 1.369 MB de VRAM y 894 MB de RAM de host en modo GPU.
- Despliegue en equipos sin GPU dedicada: con 2.081 MB de RAM en modo CPU y 36,3 tokens/s de generación, es viable en portátiles convencionales para tareas de corrección por lotes.
- Preprocesado de textos antes de publicación: normalización ortográfica y gramatical de contenido en francés e inglés en pipelines editoriales, con temperatura 0 para resultados deterministas.
- Filtrado y limpieza de corpus: al conservar solo vocabulario latino compatible con fr/en, puede emplearse para detectar y normalizar texto que contenga caracteres fuera de ese repertorio.
- Evaluación de técnicas de poda de vocabulario: sirve como referencia reproducible para medir el impacto de recortar embeddings en calidad de salida y en consumo de memoria, dado que el autor publica métricas detalladas de VRAM, RAM, latencia y tasa de generación.
- Sustitución de modelos mayores en productos con restricciones de memoria: reemplaza al palier anterior (Gemma 4 E4B IQ3_XXS recortado, 2.973 MB) con un tercio menos de peso, 2,2 veces más velocidad en CPU y un 36 % más en GPU, a costa de una falta adicional (98 frente a 99 sobre 104).

## Benchmarks y rendimiento

Datos publicados por el autor sobre once correos con 104 faltas etiquetadas, contexto 8.192, razonamiento desactivado, temperatura 0, en RTX 5090 (Vulkan) y Ryzen 7 7800X3D (16 hilos) con llama.cpp:

| Archivo | Modo | Disco | Faltas /104 | Palabras dañadas | VRAM | RAM | 11 correos | Generación |
|---|---|---|---|---|---|---|---|---|
| Este archivo (QAT UD-Q4_K_XL recortado) | GPU | 2.005 MB | 98 | 0 | 1.369 MB | 894 MB | 5,8 s | 321 tok/s |
| Este archivo (QAT UD-Q4_K_XL recortado) | CPU | 2.005 MB | 98 | 0 | 0 | 2.081 MB | 57,6 s | 36,3 tok/s |
| Anterior L (E4B IQ3_XXS recortado) | GPU | 2.973 MB | 99 | 0 | 2.249 MB | 1.083 MB | 9,1 s | 217 tok/s |
| Anterior L (E4B IQ3_XXS recortado) | CPU | 2.973 MB | 99 | 0 | 0 | 3.115 MB | 128 s | 16,2 tok/s |

El autor descarta la variante QAT UD-Q2_K_XL del mismo modelo por degradación: 62 a 67 faltas sobre 104 y entre 80 y 105 palabras dañadas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en GPU: 1.369 MB con contexto 8.192 y todas las capas en tarjeta, según medición del autor en RTX 5090 con backend Vulkan.
- RAM de host en modo GPU: 894 MB, correspondiente a las tablas de vocabulario que llama.cpp mantiene en CPU por defecto.
- RAM en modo CPU exclusivo: 2.081 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; el autor valida RTX 5090. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, con 2 GB de VRAM disponible; también en CPU con 2,1 GB de RAM.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), con tag `endpoints_compatible`; no se documenta compatibilidad con vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput medidos: 5,8 s para once correos en GPU y 57,6 s en CPU; 321 tok/s en GPU y 36,3 tok/s en CPU.
- Optimización opcional: `--override-tensor "token_embd\.weight=CUDA0,per_layer_token_embd\.weight=CUDA0"` para trasladar las tablas de vocabulario a la GPU y liberar RAM de host.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Disco / cuantización | Faltas /104 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Gemma 4 E2B QAT UD-Q4_K_XL recortado) | 3.544.217.379 | 8.192 en pruebas | 2.005 MB / Q4_K_XL | 98 | Apache 2.0 | Hugging Face |
| Gemma 4 E4B IQ3_XXS recortado (palier anterior del mismo producto) | no disponible | no disponible | 2.973 MB / IQ3_XXS | 99 | Apache 2.0 | Hugging Face (catálogo del autor) |
| Gemma 4 E2B QAT UD-Q2_K_XL (misma base, cuantización menor) | 3.544.217.379 | no disponible | no disponible / Q2_K_XL | 62-67 | Apache 2.0 | Hugging Face (Unsloth) |
| unsloth/gemma-4-E2B-it-qat-GGUF (base sin recorte) | 3.544.217.379 | no disponible | 2.620 MB / UD-Q4_K_XL | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks estándar para comparar con alternativas de otros fabricantes en la misma categoría.

## Limitaciones y advertencias

- El recorte de vocabulario elimina 103.311 tokens; el modelo no puede procesar ni generar texto en escrituras no latinas ni en idiomas distintos de francés e inglés, lo que invalida su uso multilingüe general.
- La evaluación se limita a once correos con 104 faltas etiquetadas en el dominio de corrección gramatical; no hay evidencia publicada sobre otras tareas (razonamiento, código, matemáticas) ni sobre benchmarks estándar.
- Riesgo de alucinación no cuantificado: no se han publicado métricas de fidelidad factual ni de comportamiento en dominios abiertos.
- La variante de cuantización inferior (Q2_K_XL) del mismo modelo muestra degradación severa (hasta 105 palabras dañadas), lo que indica sensibilidad a cuantizaciones agresivas; no se recomienda bajar de Q4.
- Las tablas de vocabulario permanecen en CPU por defecto en llama.cpp, lo que consume 894 MB de RAM de host incluso en modo GPU; requiere el flag `--override-tensor` para moverlas.
- No se documentan sesgos conocidos, restricciones adicionales de licencia para uso comercial (Apache 2.0 permite uso comercial) ni caveats de producción más allá de los indicados.
- "Gemma" es marca registrada de Google; el autor lo declara explícitamente.
- El repositorio tiene 58 descargas y 0 likes en el momento de la consulta, con actualización del 30 de octubre de 2026: la validación externa es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LaToucheCarre/LaToucheCarre-Texte-L-Gemma-4-E2B-QAT-UD-Q4_K_XL-FR-EN-GGUF
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-E2B-it
- Cuantización GGUF de Unsloth: https://huggingface.co/unsloth/gemma-4-E2B-it-qat-GGUF
- Producto del autor: https://latouchecarre.fr
