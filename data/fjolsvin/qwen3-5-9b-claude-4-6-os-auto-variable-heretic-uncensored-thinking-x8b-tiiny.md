# fjolsvin/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-X8b-tiiny

## Resumen

fjolsvin/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-X8b-tiiny es un fine-tune del modelo base Qwen/Qwen3.5-9B, publicado por el usuario fjolsvin en Hugging Face. Se trata de un reempaquetado (repackaging) del modelo original DavidAU/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-X8b, adaptado por la herramienta tiiny-forge para que la importacion de Tiiny Pocket acepte el modelo como un fine-tune de la tienda Qwen/Qwen3.5-9B. Los pesos son identicos al original; los unicos cambios son la incorporacion de merges.txt desde Qwen/Qwen3.5-9B y la declaracion del modelo base en la model card.

El modelo pertenece a la familia de fine-tunes "abliterated" o "uncensored", orientados a eliminar los mecanismos de rechazo (refusal) del modelo original y habilitar un modo de razonamiento extendido ("thinking") inspirado en el estilo de Claude. Incluye etiquetas que indican soporte de razonamiento, modo thinking y capacidades de vision (pipeline image-text-to-text), aunque la informacion disponible sobre estas capacidades es muy limitada.

Con 9.409.813.744 parametros reales (segun safetensors) y un tamano de repositorio de 18,8 GB, el modelo se posiciona en la gama de 9B, un tamano manejable para despliegue en GPU de consumo con cuantizacion. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque las implicaciones eticas y legales de un modelo "uncensored" requieren consideracion cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), no disponible el detalle exacto |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; el autor no detalla cuantizaciones publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer de la familia Qwen3.5, con 9.409.813.744 parametros. El modelo base es Qwen/Qwen3.5-9B. El fine-tune original (DavidAU) aplica tecnicas de "abliteration" o "heretic" para eliminar los rechazos del modelo, junto con un modo de razonamiento ("thinking") que emula el estilo de Claude 4.6 OS. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

El reempaquetado por tiiny-forge no modifica los pesos: solo anade merges.txt desde el modelo base y actualiza la model card para declarar correctamente el base_model. La model card original indica que los pesos de normalizacion y embedding son mas cercanos a Qwen/Qwen3.5-9B (distancia relativa ~0,001) que a Qwen/Qwen3.5-9B-Base (~0,003), lo que confirma la linea de descendencia. No hay informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y razonamiento en modo "thinking" (etiqueta reasoning).
- Capacidades de vision declaradas en el pipeline image-text-to-text (aunque no se detallan en la model card).
- Modo "uncensored" o "abliterated": el modelo ha sido modificado para reducir los rechazos ante solicitudes que el modelo base rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Otras capacidades especiales: modo "Claude thinking" (razonamiento extendido estilo Claude), segun la model card.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de modelos "abliterated" y comparar respuestas con el modelo base para analizar los efectos de eliminar los rechazos.
- Generacion creativa sin restricciones: util para escritura de ficcion, guiones o contenido creativo donde el modelo base aplicaria filtros.
- Experimentacion con modos de razonamiento: el modo "thinking" permite probar tecnicas de razonamiento extendido en tareas de logica o matematicas.
- Desarrollo de prototipos de chatbot: con 9B parametros y licencia Apache 2.0, es viable para prototipos en GPU de consumo.
- Evaluacion de tecnicas de fine-tuning: sirve como caso de estudio de fine-tunes comunitarios y de reempaquetado para plataformas como Tiiny Pocket.
- Analisis de sesgos y comportamiento: permite investigar como el proceso de abliteration afecta a la coherencia, la veracidad y los sesgos del modelo.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de Nightmedia, pero los datos estan incompletos (solo se muestran algunos valores para el modelo fine-tuneado). Se reproduce lo disponible:

| Benchmark | Fine-tune (instruct mode, mxfp8) | Qwen3.5-9B-Instruct (mxfp8) |
|---|---|---|
| ARC-C | 0,637 | 0,571 |
| ARC-E | 0,835 | 0,719 |
| BoolQ | 0,889 | 0,895 |
| HellaSwag | ... (no disponible) | 0,683 |
| OpenBookQA | ... (no disponible) | 0,426 |
| PIQA | ... (no disponible) | 0,770 |
| Winogrande | ... (no disponible) | 0,671 |

Los valores del fine-tune estan truncados en la informacion proporcionada; solo se dispone de ARC-C, ARC-E y BoolQ. No se han publicado resultados completos de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parametros, en FP16 se requieren aproximadamente 18,8 GB de VRAM; en cuantizacion de 8 bits, unos 9,4 GB; en 4 bits, unos 4,7 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: A100 40GB, H100, RTX 4090 (24 GB) para FP16; RTX 3090/4080 para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizacion 8 o 4 bits; en RTX 3060 12GB solo con cuantizacion 4 bits.
- Opciones de despliegue: transformers (formato safetensors), potencialmente vLLM, llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fjolsvin/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-X8b-tiiny | 9,4B | No disponible | Apache 2.0 | Fine-tune uncensored con thinking |
| Qwen/Qwen3.5-9B | 9B | No disponible | No disponible | Modelo base, alineado |
| DavidAU/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-X8b | 9,4B | No disponible | Apache 2.0 | Fine-tune original (pesos identicos) |

No se dispone de datos de rendimiento comparativo completos para establecer una comparativa robusta con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "uncensored": la eliminacion de rechazos puede producir contenido ofensivo, peligroso o ilegal; no es adecuado para produccion sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; los fine-tunes agresivos pueden degradar la coherencia.
- Idiomas: solo ingles declarado; no se garantiza un buen rendimiento en castellano.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas; se recomienda revision legal.
- Benchmarks incompletos: solo se dispone de tres metricas parciales, insuficientes para evaluar el rendimiento global.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa.
- La model card original no declara el modelo base; la atribucion se basa en proximidad de pesos, no en una declaracion explicita del autor.

## Enlaces

- Hugging Face: https://huggingface.co/fjolsvin/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-X8b-tiiny
- Modelo original: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-X8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
