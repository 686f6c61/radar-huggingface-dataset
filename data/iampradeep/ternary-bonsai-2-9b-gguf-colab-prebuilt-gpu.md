# IamPradeep/Ternary-Bonsai-2-9B-GGUF-Colab-Prebuilt-GPU

## Resumen

Ternary-Bonsai-2-9B es un modelo de lenguaje y visión derivado de Qwen3.5-9B en el que los pesos del transformer de lenguaje se han cuantizado de forma ternaria a valores {-1, 0, +1}, reduciendo el peso del modelo a aproximadamente 2,42 GB en la variante PQ2_0 frente a los ~17,9 GB que ocuparía en FP16. La arquitectura subyacente se mantiene sin cambios respecto al modelo base, incluyendo una ventana de contexto de 262.144 tokens y la capacidad de procesar entrada visual mediante un proyector multimodal separado. El repositorio, publicado por el usuario IamPradeep, distribuye los ficheros GGUF junto con un paquete binario precompilado de llama.cpp (fork PrismML) pensado para arrancar el modelo en Google Colab en menos de un minuto.

El interés del proyecto reside en la combinación de tres factores poco habituales en un mismo artefacto: cuantización ternaria extrema, contexto de 262K tokens y soporte de visión, todo empaquetado para ejecución inmediata en GPU de consumo o en entornos cloud gratuitos. Incluye además un cabezal de predicción multi-token (MTP) para decodificación especulativa, lo que permite acelerar la generación sin un modelo borrador independiente.

No obstante, conviene señalar que se trata de un artefacto de distribución (GGUF + binarios), no de un modelo entrenado desde cero por el autor del repositorio, y que la información pública disponible sobre benchmarks, licencia explícita y composición del dataset de entrenamiento es muy limitada. El número de parámetros reportado en safetensors (1.470.621.184) no coincide con la denominación comercial "9B", lo que sugiere que la cifra corresponde a un subconjunto de tensores o a un componente concreto y no al total del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B (arquitectura sin cambios), con proyector visual multimodal y cabezal MTP opcional |
| Parametros totales | No disponible de forma fiable; el nombre comercial indica 9B, mientras que el dato safetensors reporta 1.470.621.184 (probable subconjunto de tensores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Ternaria {-1, 0, +1}; variante PQ2_0 (~2,42 GB); proyector visual en Q8_0 (~624 MB) y BF16 (referencia) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (según la model card, heredada de Qwen3.5-9B) |
| Formato de pesos | GGUF (modelo principal, proyector mmproj y variante MTP) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del transformer Qwen3.5-9B sin modificaciones estructurales, pero sustituye los pesos del decodificador de lenguaje por valores ternarios en el rango {-1, 0, +1}. Esta cuantización reduce drásticamente el espacio de almacenamiento (de ~17,9 GB en FP16 a ~2,42 GB en PQ2_0) manteniendo la ventana de contexto de 262K tokens. El soporte multimodal se implementa mediante un proyector visual independiente distribuido como fichero mmproj en GGUF, disponible en Q8_0 (recomendado para producción) y en BF16 (solo como referencia de precisión).

El repositorio incluye además una variante con cabezal de predicción multi-token (MTP) que actúa como borrador para decodificación especulativa, con profundidad de borrador recomendada de 2. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO; tampoco se documenta el proceso de ternarización (PTQ, QAT u otra técnica). El paquete binario precompilado corresponde a un fork de llama.cpp denominado PrismML, necesario para aprovechar las funciones de decodificación especulativa y el modo razonamiento.

## Capacidades

- Generación de texto conversacional multi-turno con prompts de sistema.
- Razonamiento explícito activable mediante el flag `--reasoning on` (modo thinking), con presupuesto de salida recomendado de al menos 8.192 tokens.
- Comprensión de imágenes: descripción detallada, respuesta a preguntas visuales y lectura de texto en imágenes (con `--image-min-tokens 1024` para texto denso).
- Decodificación especulativa mediante cabezal MTP integrado (profundidad 2), sin necesidad de modelo borrador externo.
- Contexto largo de hasta 262.144 tokens, útil para documentos extensos o conversaciones prolongadas.
- Compatibilidad con `llama-cli` y presumiblemente `llama-server` del fork PrismML.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente, aunque el modo thinking sugiere cierto soporte de razonamiento encadenado.
- Idiomas: no disponibles.

## Casos de uso

- **Análisis de documentos largos en Colab o portátil con GPU modesta**: gracias a los 262K tokens de contexto y a los ~2,42 GB del fichero PQ2_0, se puede cargar un corpus extenso (contratos, informes, papers) y hacer preguntas sobre él sin infraestructura dedicada.
- **Asistente visual para accesibilidad**: el modelo puede describir imágenes subidas por el usuario con detalle, usando el proyector Q8_0, en un flujo tipo notebook interactivo o aplicación web ligera.
- **Extracción de información de capturas y documentos escaneados**: con `--image-min-tokens 1024` el modelo lee texto pequeño en imágenes, lo que permite transcribir formularios, tickets o pantallazos en pipelines de digitalización.
- **Prototipado rápido de chatbots conversacionales**: la combinación de binario precompilado y GGUF ligero permite levantar un endpoint conversacional en minutos, útil para demos y validación de producto antes de invertir en infraestructura.
- **Generación asistida con latencia reducida en GPU de consumo**: la decodificación especulativa con MTP acelera la generación de tokens en tarjetas como RTX 4090 o T4, adecuada para aplicaciones interactivas donde el tiempo de respuesta importa.
- **Investigación sobre cuantización ternaria**: el artefacto sirve como banco de pruebas para medir la degradación de calidad frente al Qwen3.5-9B original en tareas de razonamiento, visión y contexto largo.
- **Educación y experimentación en entornos gratuitos**: al ejecutarse en Colab en menos de un minuto, es viable en cursos y talleres donde no se dispone de clústeres GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~2,5-3 GB para el modelo PQ2_0 en solitario; añadir ~0,7 GB si se carga el proyector visual Q8_0; añadir ~2-3 GB adicionales de overhead de contexto KV para ventanas muy largas (el contexto de 262K puede requerir decenas de GB de KV cache según configuración).
- **GPU recomendadas**: T4 (Colab gratuito) suficiente para el modelo base en contexto corto; RTX 3090/4090, A10G, L4 o A100 para contexto largo y visión concurrente.
- **Cabe en GPU de consumo**: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs con 8 GB o más para contexto moderado.
- **Opciones de despliegue**: `llama-cli` y `llama-server` del fork PrismML incluido en el repositorio (`llama_bin.tar.gz`); requiere runtime CUDA 12 (`nvidia-cuda-runtime-cu12`, `nvidia-cublas-cu12`, `nvidia-cuda-nvrtc-cu12`). Compatibilidad con vLLM, Ollama o TGI: no documentada.
- **Latencia y throughput**: no disponibles de forma numérica; la model card afirma arranque en menos de un minuto en Colab incluyendo descarga y setup, y recomienda decodificación especulativa con MTP para acelerar la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Cuantización extrema | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B (PQ2_0) | ~9B (nominal) | 262K | Sí (mmproj Q8_0) | Ternaria {-1,0,+1} | Apache 2.0 (según model card) | GGUF + binarios en HF |
| Qwen3.5-9B (modelo base) | ~9B | 262K | Sí | No (FP16/BF16) | Apache 2.0 | Pesos originales en HF |
| BitNet b1.58 (referencia académica) | Variable (2B-3.9B publicados) | No disponible | No | Ternaria {-1,0,+1} | No disponible | Pesos de investigación |
| Llama 3.2 11B Vision | 11B | 128K | Sí | No | Llama Community License | HF, Ollama, vLLM |

La comparación directa con Qwen3.5-9B es la más informativa: Ternary-Bonsai-2-9B es esencialmente el mismo modelo con pesos ternarios, por lo que la diferencia esperada está en la fidelidad de las respuestas y no en la arquitectura o el contexto. Frente a BitNet b1.58, este artefacto aporta multimodalidad y contexto de 262K, pero carece de la documentación académica y los benchmarks publicados del trabajo original de Microsoft Research. Frente a Llama 3.2 11B Vision, ofrece mayor contexto y menor huella en disco, aunque con calidad no verificada por benchmarks públicos.

## Limitaciones y advertencias

- **Calidad no verificada**: no hay benchmarks publicados que cuantifiquen la degradación introducida por la ternarización frente a Qwen3.5-9B; el uso en producción sin evaluación propia es arriesgado.
- **Riesgo de alucinación**: inherente a los modelos de ~9B, potencialmente amplificado por la cuantización ternaria, especialmente en tareas de razonamiento matemático o factual.
- **Discrepancia en el recuento de parámetros**: el dato safetensors (1.470.621.184) no concuerda con el nombre "9B"; conviene verificar la composición real de los tensores antes de asumir capacidades.
- **Licencia**: la model card declara Apache 2.0 heredada de Qwen3.5-9B, pero el campo de licencia del repositorio Hugging Face figura como "no disponible"; conviene confirmar los términos antes de uso comercial.
- **Dependencia de un fork no estándar**: la decodificación especulativa MTP y posiblemente otras funciones requieren el binario PrismML incluido, lo que limita la portabilidad a otros runners (vLLM, TGI, Ollama) y complica el mantenimiento.
- **Proyector BF16 inestable**: la propia model card advierte de que el mmproj BF16 puede provocar caídas de `llama-server` con peticiones concurrentes; usar siempre Q8_0.
- **Contexto largo y KV cache**: aunque el modelo soporte 262K tokens, la memoria necesaria para la caché KV en ventanas completas puede exceder la VRAM de GPUs de consumo.
- **Idiomas no documentados**: se desconoce el soporte real del castellano y de otros idiomas distintos del inglés.
- **Repositorio con 0 descargas y 0 likes**: sin validación comunitaria; el artefacto es reciente y no ha sido auditado por terceros.
- **Fecha de creación futura en los metadatos** (2026-11-10): inconsistencia que sugiere posibles errores en la publicación del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IamPradeep/Ternary-Bonsai-2-9B-GGUF-Colab-Prebuilt-GPU
- Modelo base referenciado (Qwen3.5-9B): no se proporciona enlace directo en la información disponible
- Fork de llama.cpp (PrismML): no se proporciona enlace directo; se distribuye como `llama_bin.tar.gz` dentro del repositorio
- Paper de BitNet b1.58 (referencia técnica sobre cuantización ternaria): no disponible en la información proporcionada
