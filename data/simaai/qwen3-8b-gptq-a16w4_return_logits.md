# simaai/Qwen3-8B-GPTQ-a16w4_return_logits

## Resumen

Qwen3-8B-GPTQ-a16w4_return_logits es una compilación del modelo Qwen3-8B de Alibaba Qwen, publicada por SiMa.ai para su plataforma de aceleración Modalix. No se trata de un modelo nuevo ni de un fine-tuning, sino de un artefacto precompilado y cuantizado específicamente para ejecutar benchmarks de precisión (accuracy benchmarking) sobre el hardware Modalix de SiMa.ai. El modelo base conserva la arquitectura y los pesos de Qwen3-8B, pero se ha transformado mediante cuantización GPTQ A16W4 (activaciones en BF16, pesos en INT4) y se ha compilado con la opción `--return_logits` para poder extraer logits y comparar la salida del backend Modalix con la del backend de Hugging Face.

La relevancia de esta publicación es acotada pero clara: permite a los equipos que trabajan con hardware de inferencia en el borde (edge) validar que la ejecución cuantizada en Modalix no degrada significativamente la precisión respecto a la referencia en FP/BF16. El repositorio incluye resultados de benchmarks en tareas como HellaSwag, PIQA, TriviaQA, Wikitext y WinoGrande, ejecutados íntegramente en el backend Modalix, aunque las columnas correspondientes al backend de Hugging Face aparecen vacías en la model card.

El contexto máximo indicado es de 4096 tokens, muy por debajo de los 32 768 nativos de Qwen3-8B, lo que refleja una limitación impuesta por la compilación para Modalix. La licencia es Apache 2.0, heredada del modelo base, y el repositorio ocupa 12,1 GB. No está pensado como modelo de generación de texto de propósito general, sino como herramienta de validación de precisión en un stack hardware/software concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 8 000 millones (aproximado, segun modelo base Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (segun model card) |
| Tipos de cuantizacion | GPTQ A16W4: activaciones BF16, pesos INT4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto compilado para SiMa.ai Modalix (incluye `devkit/` y `elf_files/`); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer decoder-only de la familia Qwen3 desarrollada por Alibaba Qwen. La model card de este repositorio no aporta detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esa información debe consultarse en la ficha original de Qwen/Qwen3-8B. Lo que sí documenta esta publicación es el proceso de transformación: cuantización GPTQ con esquema A16W4, es decir, pesos en INT4 y activaciones en BF16, seguida de compilación para el backend Modalix mediante las herramientas de SiMa.ai (Neat Runtime y LLiMa).

La innovación técnica relevante aquí no está en la arquitectura del modelo, sino en el pipeline de compilación: el flag `--return_logits` permite que el artefacto compilado devuelva logits en lugar de solo tokens generados, lo que habilita la comparación directa de distribuciones de probabilidad entre el backend Modalix y el backend de Hugging Face. Esto es lo que permite ejecutar tareas de evaluación tipo lm-evaluation-harness (HellaSwag, PIQA, etc.) sobre hardware Modalix sin necesidad de recompilar el modelo fuente. No se documentan técnicas como decodificación especulativa, atención lineal ni variantes híbridas en esta ficha.

## Capacidades

- Generación de texto autoregresiva, heredada de Qwen3-8B.
- Retorno de logits para evaluación de precisión (capacidad específica de esta compilación).
- Ejecución de tareas de benchmark de comprensión del lenguaje: HellaSwag, PIQA, WinoGrande, TriviaQA y Wikitext (perplejidad).
- Integración con el CLI `llima-benchmark accuracy` para comparar backend Modalix frente a backend Hugging Face.
- Despliegue en dispositivos SiMa.ai Modalix mediante `llima pull` o copia directa vía `scp`.
- No se documentan en esta ficha capacidades de tool calling, agentes, visión, audio ni modo thinking; deben verificarse en el modelo base Qwen3-8B.

## Casos de uso

- Validación de precisión en hardware Modalix: ejecutar `llima-benchmark accuracy` con tareas como HellaSwag y PIQA para cuantificar la degradación introducida por la cuantización A16W4 frente a la referencia en BF16. Es el propósito principal declarado del repositorio.
- Comparación de backends en pipelines de CI: integrar el benchmark en un flujo automatizado que compare los resultados del backend Modalix con los del backend Hugging Face antes de promover una nueva compilación a producción.
- Auditoría de cuantización: usar los valores de bits_per_byte y perplejidad en Wikitext (0,7226 y 1,6501 respectivamente) como referencia para detectar regresiones cuando se recompila el modelo con distintas configuraciones.
- Evaluación de despliegues edge: verificar que un dispositivo Modalix concreto, con su versión de Neat Runtime y LLiMa, produce resultados consistentes en tareas de razonamiento lingüístico antes de desplegar aplicaciones de generación de texto en el borde.
- Reproducibilidad de benchmarks: servir como artefacto fijo y versionado para que distintos equipos obtengan resultados comparables en la misma suite de tareas (HellaSwag, PIQA, TriviaQA, Wikitext, WinoGrande).
- Diagnóstico de configuración de hardware: detectar problemas de instalación del runtime (por ejemplo, `llima` no encontrado o servidor de benchmark no arrancado) usando una suite de tareas conocida como caso de prueba controlado.

## Benchmarks y rendimiento

Resultados publicados en la model card, ejecutados en el backend Modalix. Las columnas del backend Hugging Face aparecen vacías en la información disponible, por lo que no es posible calcular la diferencia absoluta.

| Tarea | Version | Filtro | n-shot | Metrica | Direccion | Valor Modalix | Stderr | Valor HF | Stderr HF |
|---|---|---:|---:|---|---|---:|---:|---|---|
| hellaswag | 1.0 | none | 0 | acc | higher | 0,5578 | 0,0050 | no disponible | no disponible |
| hellaswag | 1.0 | none | 0 | acc_norm | higher | 0,7394 | 0,0044 | no disponible | no disponible |
| piqa | 1.0 | none | 0 | acc | higher | 0,7497 | 0,0101 | no disponible | no disponible |
| piqa | 1.0 | none | 0 | acc_norm | higher | 0,7584 | 0,0100 | no disponible | no disponible |
| triviaqa | 3.0 | remove_whitespace | 0 | exact_match | higher | 0,0003 | 0,0001 | no disponible | no disponible |
| wikitext | 2.0 | none | 0 | bits_per_byte | lower | 0,7226 | N/A | no disponible | no disponible |
| wikitext | 2.0 | none | 0 | byte_perplexity | lower | 1,6501 | N/A | no disponible | no disponible |
| wikitext | 2.0 | none | 0 | word_perplexity | lower | 14,5603 | N/A | no disponible | no disponible |
| winogrande | 1.0 | none | 0 | acc | higher | 0,6654 | 0,0133 | no disponible | no disponible |

Tamaños de muestra empleados: HellaSwag 10 042, PIQA 1 838, TriviaQA 17 944, Wikitext 62, WinoGrande 1 267. El resultado de TriviaQA (exact_match de 0,0003) es prácticamente nulo y sugiere que la tarea no está bien alineada con el formato de evaluación empleado o con el modelo; conviene interpretarlo con cautela.

## Requisitos de hardware

- Hardware objetivo: dispositivo SiMa.ai Modalix (acelerador de inferencia en el borde). No está pensado para GPU convencional.
- Almacenamiento: el repositorio ocupa 12,1 GB; en Modalix los modelos se ubican por defecto en `/media/nvme/llima/models`.
- VRAM estimada en GPU convencional: no disponible; el artefacto está compilado para Modalix y no se distribuye como pesos en safetensors o GGUF listos para vLLM, llama.cpp u Ollama.
- Software requerido: SiMa.ai CLI, Neat Runtime (incluye el runtime LLiMa) y el CLI `llima-benchmark` en la máquina anfitriona.
- Despliegue: `llima pull Qwen3-8B-GPTQ-a16w4_return_logits` en el dispositivo, o descarga con `hf download` y copia mediante `scp` al directorio de modelos de Modalix.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| simaai/Qwen3-8B-GPTQ-a16w4_return_logits | ~8B | 4096 | GPTQ A16W4 | Benchmark de precision en Modalix | Apache 2.0 | HuggingFace (compilado para Modalix) |
| Qwen/Qwen3-8B | ~8B | 32 768 (nativo, segun modelo base) | FP/BF16 original | Generacion de texto de proposito general | Apache 2.0 | HuggingFace |
| Otras compilaciones SiMa.ai para Modalix | no disponible | no disponible | no disponible | Despliegue de generacion de texto en Modalix | no disponible | Coleccion de LLMs de SiMa.ai (referenciada en la model card) |

La comparación directa con alternativas de la misma categoría (modelos de 8B para benchmarking) no está disponible en la información proporcionada. La diferencia clave frente a Qwen3-8B original es el contexto reducido a 4096 tokens y la orientación exclusiva a evaluación de precisión, no a generación en producción.

## Limitaciones y advertencias

- La cuantización A16W4 introduce desviaciones menores respecto al modelo en precisión completa; la propia model card lo advierte.
- El artefacto está compilado con `--return_logits` para benchmarking; para despliegues de generación de texto estándar, SiMa.ai recomienda usar el modelo correspondiente de su colección de LLMs.
- El contexto máximo es de 4096 tokens, muy inferior al nativo de Qwen3-8B, lo que limita su uso en tareas de contexto largo.
- El resultado de TriviaQA (exact_match 0,0003) es anómalamente bajo y cuestiona la validez de esa tarea en esta configuración; no debe tomarse como medida fiable de conocimiento factual.
- No se dispone de resultados del backend Hugging Face en la model card, por lo que no es posible cuantificar la degradación real por cuantización con los datos publicados.
- El modelo solo es ejecutable en hardware SiMa.ai Modalix con el stack Neat/LLiMa; no es portable a GPU convencional ni a frameworks estándar de inferencia.
- No se documentan sesgos específicos, riesgos de alucinación ni restricciones adicionales de licencia más allá de Apache 2.0; deben evaluarse sobre el modelo base Qwen3-8B.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que indica una adopción muy limitada y poca validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/simaai/Qwen3-8B-GPTQ-a16w4_return_logits
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Guia de inicio de SiMa.ai Neat: https://developer.sima.ai/software/getting-started/
- Documentacion de benchmark de precision MOLE: https://developer.sima.ai/software/genai-llima/mole
