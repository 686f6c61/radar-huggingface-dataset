# Eskrers/gemma4-e4b-uranium-gguf

## Resumen

`Eskrers/gemma4-e4b-uranium-gguf` es una conversión a formato GGUF de un ajuste fino sobre un modelo de la familia Gemma 4, en su variante E4B (presumiblemente "effective 4B", un tamaño efectivo de aproximadamente 4.000 millones de parámetros activos o equivalentes). El modelo resultante, denominado internamente `gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking`, incorpora un ajuste fino orientado a eliminar restricciones de alineamiento ("uncensored") y a habilitar un modo de razonamiento explícito ("Thinking"). El autor, Eskrers, lo publica en Hugging Face con 0 descargas y 0 likes en el momento de la ficha.

El repositorio contiene únicamente pesos en GGUF para su uso con llama.cpp, junto con el proyector multimodal (`mmproj`) en F16, lo que indica que el modelo base es un vision-language model capaz de procesar imágenes además de texto. La conversión se realizó con Unsloth, herramienta habitual para fine-tuning acelerado y exportación a GGUF.

La relevancia de esta ficha es limitada: se trata de una publicación de un autor individual, sin model card detallada, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados. Cualquier evaluación seria debe partir de la información del modelo Gemma 4 original (no disponible en esta ficha) y tratar este artefacto como un experimento comunitario no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (vision-language), base Gemma 4; detalles no disponibles |
| Parametros totales | 7.518.069.290 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se confirma si E4B implica MoE o tamaño efectivo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y F16 (proyector multimodal mmproj en F16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal GGUF F16 |

## Arquitectura y entrenamiento

La información disponible no permite detallar la arquitectura interna del modelo base. Por los tags (`vision-language-model`) y por la presencia de un archivo `mmproj` en F16, se deduce que el modelo combina un transformer de lenguaje con un codificador visual y un proyector multimodal, siguiendo el esquema habitual de los modelos Gemma multimodales. El sufijo E4B del nombre sugiere una variante de tamaño efectivo de 4B, pero no se confirma si se trata de una arquitectura MoE, de destilación o de una convención de nomenclatura del autor.

El proceso de entrenamiento declarado es un fine-tuning seguido de conversión a GGUF mediante Unsloth. El nombre del checkpoint (`HERETIC-UNCENSORED-Thinking`) indica un ajuste orientado a reducir el rechazo de peticiones y a forzar un modo de razonamiento con trazas de pensamiento. No se especifican número de tokens de entrenamiento, composición del dataset, ni si se empleó RLHF, DPO u otra técnica de alineamiento. La model card no documenta hiperparámetros, semillas ni metodología de evaluación.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de imágenes (vision-language model), mediante `llama-mtmd-cli` y el proyector `mmproj`.
- Modo de razonamiento explícito ("Thinking"), presumiblemente con trazas de cadena de pensamiento.
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones que el modelo base alineado.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere uso tras una API compatible con llama.cpp.
- Soporte de plantillas de chat vía `--jinja`.
- Tool calling / function calling: no disponible (no declarado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades de audio: no disponible.

## Casos de uso

- Inferencia local de texto con llama.cpp: el archivo Q4_K_M permite ejecutar el modelo en hardware de consumo mediante `llama-cli`, útil para prototipos y pruebas offline sin depender de APIs.
- Análise de imágenes en local: con `llama-mtmd-cli` y el proyector F16 se pueden procesar capturas, diagramas o documentos escaneados en entornos sin conectividad, siempre que el hardware lo permita.
- Experimentación con modos de razonamiento: el sufijo "Thinking" permite comparar respuestas con y sin trazas de pensamiento en tareas de lógica o matemáticas, como base para investigación sobre cadenas de pensamiento.
- Estudio de ajustes "uncensored": útil para investigadores que analizan cómo el fine-tuning altera las tasas de rechazo y los sesgos residuales respecto al modelo base.
- Generación de datos sintéticos controlada: en pipelines internos donde se necesita texto sin filtros de seguridad, con revisión humana posterior obligatoria.
- Despliegue en endpoints compatibles: integración en servicios que hablan el protocolo de llama.cpp para servir chat multimodal a aplicaciones cliente.
- Evaluación comparativa de cuantizaciones: comparar Q4_K_M frente a otras cuantizaciones del mismo modelo para medir degradación de calidad en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa aproximadamente 4-5 GB, por lo que cabe en GPUs de consumo con 8 GB o más; el proyector F16 añade unos cientos de MB.
- El repo completo pesa 6,3 GB, lo que refleja el tamaño conjunto de los artefactos publicados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para uso local; A100/H100 para servir múltiples peticiones concurrentes.
- Cabe en GPU de consumo: sí, con la cuantización Q4_K_M en GPUs de 8 GB en adelante (con margen para contexto y overhead).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), y entornos compatibles con GGUF como Ollama o LM Studio si aceptan el proyector multimodal.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Eskrers/gemma4-e4b-uranium-gguf | 7.518.069.290 (base) | no disponible | no disponible | GGUF | Fine-tuning comunitario "uncensored" con vision |
| Gemma 4 E4B (base oficial) | no disponible en esta ficha | no disponible | no disponible | safetensors/GGUF | Modelo de referencia del que deriva este ajuste |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede determinar si el uso comercial está permitido; debe consultarse la licencia del modelo Gemma 4 original antes de cualquier despliegue.
- Ajuste "uncensored": reduce los filtros de seguridad del modelo base, lo que aumenta el riesgo de generar contenido dañino, sesgado o ilegal; requiere moderación externa en producción.
- Riesgo elevado de alucinación: no hay benchmarks ni evaluaciones publicadas que permitan estimar la fiabilidad.
- Idiomas no declarados: no se confirma el soporte multilingüe ni la calidad en castellano.
- Contexto no documentado: se desconoce la ventana máxima y su comportamiento en conversaciones largas.
- Publicación sin tracción (0 descargas, 0 likes): no hay evidencia de uso comunitario ni de validación independiente.
- Nomenclatura ambigua (E4B, HERETIC, UNCENSORED): dificulta rastrear el modelo base exacto y reproducir el ajuste.
- Sin información sobre tool calling ni sobre formatos de plantilla más allá de `--jinja`.
- No apto como base para producción sin evaluación propia de sesgos, seguridad y calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Eskrers/gemma4-e4b-uranium-gguf
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
