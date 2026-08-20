# ghgdhhsacd/Qwen3.8-27B-Ridge-GGUF

## Resumen

Qwen3.8-27B-Ridge-GGUF es una cuantizacion GGUF de alta calidad del modelo multimodal Qwen/Qwen3.8-27B, publicada por el equipo de Empero (usuario `ghgdhhsacd` en Hugging Face). Se trata de un archivo pensado para ejecutarse en runtimes estandar como llama.cpp, Ollama, LM Studio, jan y KoboldCpp, sin necesidad de modificaciones ni parches especificos. La cuantizacion, denominada "Ridge", es una mezcla de tipos de datos ajustada a la arquitectura hibrida del modelo base, que combina capas Gated-DeltaNet con capas de atencion completa.

El modelo base, Qwen3.8-27B, es un checkpoint de 27 320 millones de parametros con una ventana de contexto nativa de 262 144 tokens, ampliable hasta 1 millon mediante extension YaRN. Es multimodal (imagen y texto) y presenta un modo de razonamiento ("thinking") activado por defecto. Esta cuantizacion conserva la cabeza de decodificacion especulativa MTP (Multi-Token Prediction) del modelo original, lo que permite acelerar la generacion en runtimes compatibles.

La relevancia de este archivo reside en que, con un peso de solo 11,73 GiB (3,69 bpw), ofrece una calidad de perplexity muy cercana a la del checkpoint BF16 (+9,3 %), mientras que las cuantizaciones planas de 2 bits de la competencia suelen degradar significativamente el estado interno Gated-DeltaNet. Es una opcion solida para desplegar un modelo de 27 B con razonamiento y vision en GPU de consumo de 16-24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas, 48 Gated-DeltaNet + 16 atencion full (patron 3 GDN + 1 GatedAttn por bloque) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativa; extension YaRN hasta 1 000 000 |
| Tipos de cuantizacion | Ridge mix a 3,69 bpw (estado GDN en Q8_0, mixers en Q4_K, FFN en IQ2); mmproj vision en BF16 |
| Idiomas soportados | Ingles y chino (modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo principal) + mmproj BF16 separado para vision |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer hibrido que intercala tres capas de Gated-DeltaNet (una variante de state-space model con atencion lineal y control de estado) por cada capa de atencion full. Esta configuracion reduce el coste de la atencion en contextos largos y permite la ventana de 262K tokens con un coste de KV cache menor que un transformer clasico. La cuantizacion Ridge, desarrollada por Empero, no es un entrenamiento nuevo sino una conversion de pesos con importancia matrix (imatrix) calibrada sobre 80 fragmentos de 512 tokens de wikitext y codigo, con el objetivo de proteger el estado GDN (`ssm_alpha` / `ssm_beta`) y los mixers, que son especialmente sensibles a la cuantizacion de baja precision.

La receta de cuantizacion mantiene el estado GDN en Q8_0, los mixers en Q4_K, y aplica IQ2 solo en las FFN intermedias, lo que permite ahorrar bits sin sacrificar la fidelidad del camino de estado. La cabeza MTP (blk.64 / nextn) se conserva en Q6_K y no recibe imatrix, por lo que cuantizaciones tipo IQ2/IQ3 en esa parte abortarian. El resultado es un archivo de 11,73 GiB con una perplexity medida de 7,82 ± 0,14 frente a 7,15 ± 0,12 del BF16 de referencia (+9,3 %).

## Capacidades

- Generacion de texto con modo de razonamiento ("thinking") activado por defecto, desactivable con `--reasoning off`.
- Razonamiento multi-step y pensamiento extendido gracias al modo thinking del modelo base.
- Comprension multimodal de imagenes (requiere el archivo `mmproj-Qwen3.8-27B-BF16.gguf`).
- Ventana de contexto larga: 262K tokens nativos, ampliable a 1M con extension YaRN.
- Decodificacion especulativa MTP (multi-token prediction) integrada en el GGUF, acelerable con `--spec-type draft-mtp` en llama.cpp.
- Soporte de tool calling / function calling (capacidad heredada del modelo base, no verificada en esta cuantizacion).
- Capacidades multilingues limitadas a ingles y chino (idiomas del modelo base).
- Compatible con runtimes estandar: llama.cpp, Ollama, LM Studio, jan, KoboldCpp.

## Casos de uso

- Despliegue local en GPU de 16-24 GB: gracias a los 11,73 GiB de peso y la conservacion del modo de razonamiento, se puede ejecutar un asistente con capacidad de pensamiento en tarjetas como RTX 4080/4090 o RTX 5000, sin necesidad de hardware de datacenter.
- Generacion de codigo asistida: el modelo base soporta tool calling y el modo thinking permite razonar sobre problemas de programacion; la cuantizacion mantiene la calidad de la atencion full y del estado GDN, por lo que es viable en pipelines de CI/CD con llama-server y `--spec-type draft-mtp` para acelerar la generacion.
- Razonamiento sobre documentos largos: con 262K tokens de contexto nativo, puede procesar libros, informes tecnicos o codigo fuente completo en una sola pasada, ideal para agentes de analisis de documentacion.
- Chat multimodal en local: con el `mmproj` BF16, el modelo puede responder sobre imagenes, util para asistentes de soporte que necesitan interpretar capturas de pantalla o diagramas en entornos sin acceso a APIs de pago.
- Agentes autonomos con memoria extensa: la ventana de 1M tokens (via YaRN) permite mantener historiales de conversacion muy largos o estados de tareas complejas sin perder contexto, con la aceleracion de la decodificacion MTP.
- Evaluacion y experimentacion de cuantizaciones: la comparativa de perplexity publicada por Empero la convierte en una referencia para estudiar el impacto de la cuantizacion en arquitecturas hibridas Gated-DeltaNet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo proporciona medidas de perplexity sobre un corpus propio de wikitext y codigo, comparadas con el checkpoint BF16 convertido:

| Candidate | Size | BPW | Wiki-style PPL | vs BF16 |
|---|---:|---:|---:|---|
| BF16 GGUF (conversion propia) | 50,89 GiB | 16,00 | 7,15 ± 0,12 | — |
| Ridge-3.7bpw | 11,73 GiB | 3,69 | 7,82 ± 0,14 | +9,3 % |

Rendimiento medido en una RTX PRO 6000 Blackwell (96 GB) con llama.cpp CUDA, `-ngl 99` y contexto corto: aproximadamente 54 tokens/s de generacion y 130 tokens/s de prompt. Un unico punto de datos, no un barrido sistematico.

## Requisitos de hardware

- VRAM estimada: el archivo principal pesa 12,59 GB; con contexto modesto y KV cache cabe en 16 GB, siendo 24 GB la opcion comoda para anadir el `mmproj` y contexto mayor.
- GPU recomendadas: RTX 4080/4090 (16-24 GB) para uso interactivo; RTX PRO 6000 Blackwell (96 GB) medido a ~54 tok/s; tarjetas de datacenter (A100, H100) no son necesarias.
- Si cabe en GPU de consumo: si, a partir de 16 GB VRAM, con contexto corto y sin `mmproj`; con contexto largo o vision, se recomienda 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (via `ollama run hf.co/empero-ai/Qwen3.8-27B-Ridge-GGUF` o Modelfile local), LM Studio, jan, KoboldCpp.
- Latencia y throughput: 54 tok/s generacion y 130 tok/s prompt en RTX PRO 6000 Blackwell (96 GB) con `-ngl 99` y contexto corto; en GPU de 16-24 GB se esperan cifras menores, no publicadas.

## Comparativa con modelos similares

Se compara la cuantizacion Ridge con otras cuantizaciones del mismo modelo base (Qwen3.8-27B), publicadas en Hugging Face con fechas similares. No hay comparacion directa con modelos de tamano equivalente de otros fabricantes en la informacion disponible.

| Archivo | Publicador | Tamano | Banda nominal | PPL vs BF16 |
|---|---:|---:|---|---|
| BF16 (conversion propia) | empero-ai | 50,89 GiB | 16 bpw | 7,15 |
| UD-IQ2_XXS | unsloth | 8,39 GiB | ~2,1 bpw | no medido (unsloth cita 82,5 % top-1 vs BF16) |
| UD-IQ2_M | unsloth | 9,61 GiB | ~2,4 bpw | no medido |
| IQ2_XXS | bartowski | 8,75 GiB | ~2,2 bpw | no medido |
| Q3_K_S | unsloth | 11,71 GiB | ~3,1 bpw | no medido |
| Ridge-3.7bpw (este) | empero-ai | 11,73 GiB | 3,69 bpw | 7,82 (+9 %) |
| IQ3_XXS | bartowski | 11,76 GiB | ~2,9 bpw | no medido |
| UD-Q3_K_XL | unsloth | 12,52 GiB | ~3,4 bpw | no medido |

La ventaja del Ridge es que, a un tamano similar al Q3_K_S (11,7 GiB), ofrece un 3,69 bpw con una calidad de PPL medida, mientras que las alternativas de 2 bpw son mas pequenas pero degradan el estado GDN. La licencia Apache-2.0 de todas las variantes permite uso comercial sin restricciones.

## Limitaciones y advertencias

- La cuantizacion a 3,7 bpw introduce una degradacion de perplexity del +9,3 % frente al BF16; para tareas de precision critica (razonamiento matematico de alto nivel, codigo complejo) puede ser preferible una cuantizacion mayor.
- El estado GDN y los mixers son sensibles a la cuantizacion; aunque Ridge los protege con Q8_0 y Q4_K, cuantizaciones mas agresivas (2 bpw) de otras publicaciones degradan notablemente el modelo en estas rutas.
- La cabeza MTP no tiene imatrix y usa Q6_K; si se intenta cuantizar `blk.64` con IQ2/IQ3, el proceso abortara.
- El modo de razonamiento ("thinking") esta activado por defecto y puede generar respuestas mas largas; es necesario desactivarlo con `--reasoning off` para inferencias directas.
- La vision requiere el archivo `mmproj` BF16 separado (0,93 GB) y anade VRAM; sin el, el modelo no procesa imagenes.
- La ventana de contexto de 262K tokens hace que la KV cache domine el uso de VRAM; con contexto muy largo, se necesita offload a CPU o GPU con mas de 24 GB.
- El modelo base solo soporta ingles y chino; no hay evidencia de capacidades multilingues mas amplias en esta cuantizacion.
- No se han publicado benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) para esta cuantizacion; la calidad se infiere solo por perplexity y rendimiento de generacion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener restricciones adicionales en su propia tarjeta; se recomienda revisar la licencia del modelo original antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face del archivo GGUF: https://huggingface.co/ghgdhhsacd/Qwen3.8-27B-Ridge-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Cuantizaciones de referencia de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizaciones de referencia de bartowski: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Sitio de Empero: https://empero.org
