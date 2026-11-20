# Joakimpalm-Zen/Qwen3.8-27B-GSQ-RCO-IQ3_S-recovered-GGUF

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ3_S-recovered-GGUF es un artefacto de investigación publicado por el usuario Joakimpalm-Zen dentro del proyecto Xyntetik. Se trata de una cuantización IQ3_S del modelo Qwen3.8-27B (26.895.998.464 parámetros) en la que se han reentrenado por destilación únicamente los campos de escala fp16 (`d`/`dmin`) de cada bloque cuantizado, manteniendo intactos los códigos enteros, el formato, la longitud en bytes y las rutas de carga del fichero fuente de ISTA-DASLab. El objetivo declarado es la "recuperación de escalas" (*scale recovery*): acercar la distribución del fichero cuantizado a la del modelo padre en BF16.

El resultado es un fichero de 14,9 GB (11.771.546.784 bytes para el tensor principal) que sirve donde lo hace el original, pero que el propio autor califica explícitamente como artefacto de investigación y no como un lanzamiento de propósito general. La fidelidad medida contra la referencia float32 de Qwen es de KLD medio 0,4119 (8 veces por encima del umbral de 0,05 fijado por el proyecto) y top-1 cualificado por margen del 85,04 %, con una perplejidad de corpus de 21,54 frente a 73,29 del padre, lo que indica que su distribución de siguiente token es distinta, no una copia con más ruido.

La relevancia actual es metodológica: documenta con evidencia reproducible (registros de ejecución, logs, métricas de fidelidad y HellaSwag, código) una técnica de cirugía de modelos aplicable a otros modelos, y demuestra que retocar solo las escalas de cuantización puede mover un fichero cuantizado hacia su padre sin alterar el formato. Incluye además un cabezal de borrador MTP para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; etiqueta `gated-deltanet` en el repo, sin detalle técnico publicado) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (GGUF), con escalas fp16 `d`/`dmin` reentrenadas; cabezal MTP en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (14,9 GB de repositorio; 11.771.546.784 bytes el fichero principal) |

## Arquitectura y entrenamiento

El fichero es una cuantización IQ3_S de bloques, en la que cada bloque cuantizado almacena códigos enteros más dos campos de escala en fp16 (`d` y `dmin`). El autor conserva íntegros los códigos enteros, el layout de bytes y los offsets del fichero fuente de ISTA-DASLab, y modifica exclusivamente los campos de escala de los bloques cuantizados de 399 tensores. Los tensores no cuantizados coinciden bit a bit con el padre Qwen/Qwen3.8-27B en la revisión `1d4bf0f2`.

El reentrenamiento de escalas se realiza por destilación de conocimiento contra el padre en BF16, de extremo a extremo, sobre un corpus descrito como "half-prose". El método de GSQ-RCO ajusta códigos y escalas sobre datos de calibración, y la recuperación de escalas de este fichero lo desplaza hacia el padre: el KLD mejora respecto al fuente sin modificar (0,5616 y 0,4718 en las dos ventanas medidas) hasta 0,4119 y 0,4084, con significación estadística declarada (Wilcoxon sobre KLD, p = 1,7e-10 y p = 0,0017). Se incluye un cabezal de borrador MTP (`Qwen3.8-27B-MTP-Q8_0.gguf`) para decodificación especulativa, con aproximadamente 1,9x de velocidad de decodificación en llama.cpp sobre GPU y 1,1x en Runner 1.1.3 sobre CUDA (1,5x en su ruta int8 opcional).

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y es compatible con endpoints.
- Inferencia estándar de un modelo de 27 B en formato GGUF: cualquier motor que lea el fichero fuente lee este.
- Decodificación especulativa mediante el cabezal MTP incluido en el mismo repositorio.
- Compatibilidad con Xyntetik Runner v0.5.3 o superior en CUDA (kernels i-quant sobre tensor cores, sin fallback a CPU) y v0.5.6 o superior en Metal (kernels i-quant con codebook, verificación byte-exacta contra CPU).
- Soporte de tool calling, agentes, razonamiento multi-paso, matemáticas, código o visión: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre cuantización: servir como caso de estudio reproducible de recuperación de escalas por destilación, comparando KLD y top-1 antes y después del reentrenamiento con el fichero fuente de ISTA-DASLab.
- Despliegue en hardware con VRAM limitada: al ocupar 14,9 GB en disco y mantener el formato IQ3_S, permite servir un modelo de 27 B en GPUs de consumo alto o en servidores con una sola GPU de 24 GB, con la advertencia de fidelidad del autor.
- Evaluación de pipelines de decodificación especulativa: el cabezal MTP Q8_0 permite medir la ganancia de velocidad (aproximadamente 1,9x en llama.cpp sobre GPU) en una carga de trabajo real antes de adoptarla en producción.
- Pruebas de compatibilidad de motores de inferencia: útil para validar que un motor (llama.cpp, Xyntetik Runner u otros que lean el fichero fuente) carga correctamente ficheros GGUF con escalas modificadas y produce texto coherente.
- Generación de texto conversacional en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos internos o comerciales, siempre que se acepte que la distribución difiere de la del padre.
- Reproducción de experimentos de cirugía de modelos: el dataset de evidencia incluye registros de ejecución, logs y código, lo que permite replicar el procedimiento sobre otros modelos o verificar las métricas declaradas.

## Benchmarks y rendimiento

| Metrica | Este fichero | Fuente ISTA-DASLab (sin modificar) | Padre Qwen3.8-27B float32 | Umbral del proyecto |
|---|---|---|---|---|
| KLD medio (ventana principal) | 0,4119 | 0,5616 | referencia | ≤ 0,05 |
| Top-1 cualificado por margen (ventana principal) | 85,04 % | 82,48 % | referencia | ≥ 97 % |
| KLD medio (posiciones 4.000-5.999) | 0,4084 | 0,4718 | referencia | ≤ 0,05 |
| Top-1 cualificado por margen (posiciones 4.000-5.999) | 86,12 % | 86,36 % | referencia | ≥ 97 % |
| Perplejidad de corpus | 21,54 | 53,48 | 73,29 | no disponible |
| KLD medio (ancla anterior, 500 prefijos Wikitext-2, banda de empate 0,5 nat) | 0,0450 | no disponible | BF16 GGUF del proyecto | no disponible |
| Top-1 cualificado por margen (ancla anterior) | 97,80 % (top-1 plano 87,20 %) | no disponible | BF16 GGUF del proyecto | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor menciona registros de HellaSwag en el dataset de evidencia, pero no se incluyen cifras en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 14,9 GB en disco; en IQ3_S se necesita aproximadamente esa cantidad más overhead de contexto y caché KV, por lo que conviene prever 16-20 GB de VRAM según longitud de contexto.
- GPU recomendadas: A100, H100 o RTX 4090 para servicio en producción; el autor valida explícitamente CUDA con Xyntetik Runner v0.5.3 o superior (kernels i-quant sobre tensor cores, sin fallback a CPU).
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) y previsiblemente en algunas de 16 GB con contexto reducido; no se documenta el caso de 12 GB.
- Apple Silicon: soportado por Xyntetik Runner v0.5.6 o superior en Metal, con kernels i-quant con codebook verificados byte-exactos contra CPU.
- Opciones de despliegue: llama.cpp, Xyntetik Runner (CUDA y Metal) y cualquier motor que lea el fichero fuente de ISTA-DASLab. vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles de forma absoluta; el cabezal MTP reporta aproximadamente 1,9x de decodificación en llama.cpp sobre GPU y 1,1x en Runner 1.1.3 sobre CUDA (1,5x en su ruta int8 opcional).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-GSQ-RCO-IQ3_S-recovered (este) | 26,9 B | no disponible | GGUF IQ3_S | Apache 2.0 | KLD 0,41 frente a float32; escalas reentrenadas por destilación |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | 26,9 B | no disponible | GGUF IQ3_S | Apache 2.0 | KLD 0,47-0,56 frente a float32; fichero fuente sin modificar |
| Qwen/Qwen3.8-27B | 26,9 B | no disponible | safetensors (float32/BF16) | Apache 2.0 | Referencia de fidelidad; perplejidad de corpus 73,29 |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Fidelidad fuera del umbral: KLD medio 0,41 frente a la referencia float32, 8 veces el límite de 0,05 del proyecto, y top-1 cualificado por margen del 85-86 % frente al 97 % exigido.
- No es una cuantización fiel: es un derivado aprendido de Qwen3.8-27B; su distribución de siguiente token es distinta de la del padre, no una versión con más ruido.
- El autor lo declara explícitamente artefacto de investigación, no un lanzamiento de propósito general; no debe tratarse como sustituto del padre en producción sin evaluar el impacto en la tarea concreta.
- La métrica favorable del ancla anterior (KLD 0,0450, top-1 97,80 %) solo es válida para 500 prefijos cortos de Wikitext-2 con banda de empate de 0,5 nat, y no describe el comportamiento en textos más largos o de otro dominio.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un derivado con distribución alterada, la evaluación de sesgos y alucinaciones del padre no es directamente trasladable.
- Idiomas soportados y longitud de contexto: no disponibles; no se puede garantizar el comportamiento multilingüe ni en contextos largos.
- Requisitos de motor: en CUDA exige Xyntetik Runner v0.5.3 o superior para servir el fichero completo sin fallback a CPU; en Metal, v0.5.6 o superior.
- Licencia Apache 2.0 permite uso comercial, pero la alteración de las escalas y la divergencia respecto al padre deben tenerse en cuenta en cualquier auditoría de modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Joakimpalm-Zen/Qwen3.8-27B-GSQ-RCO-IQ3_S-recovered-GGUF
- Modelo base (GGUF de ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Colección del experimento (Model Surgery and Scale Recovery): https://huggingface.co/collections/Joakimpalm-Zen/xyntetik-research-model-surgery-and-scale-recovery-6aa98bab0ecb9723f310c770
- Dataset de evidencia (registros, logs, fidelidad y HellaSwag, código): https://huggingface.co/datasets/Joakimpalm-Zen/Qwen3.8-27B-GSQ-RCO-scale-recovery-evidence
- Repositorio Xyntetik Runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Fila de soporte en el roster (fichero principal): https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#qwen3.8-27b-gsq-rco-iq3_s-recovered
- Fila de soporte en el roster (cabezal MTP): https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#qwen3.8-27b-mtp-q8_0
- Resultados de la comunidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/community-results.md
- Papers citados en las etiquetas: arXiv:2604.18556 y arXiv:2605.00649 (sin título ni detalle en la información disponible)
