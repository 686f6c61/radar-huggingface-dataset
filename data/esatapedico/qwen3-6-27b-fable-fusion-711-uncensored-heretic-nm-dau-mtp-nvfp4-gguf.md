# esatapedico/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-NVFP4-GGUF

## Resumen

Esta ficha describe una familia de cuatro cuantizaciones GGUF del modelo `Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP`, publicadas por el usuario `esatapedico` en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un trabajo de conversión y ensamblado de tensores: el backbone NVFP4 procede del checkpoint safetensors de `maci0`, el fine-tune subyacente es de `DavidAU` y el modelo original es `Qwen/Qwen3.6-27B` de Alibaba. El objetivo declarado es conservar la ventaja de prefill de NVFP4, reducir el tamaño del archivo por debajo de los 24 GB y acelerar la decodificación mediante una cabeza MTP de mayor calidad.

El modelo subyacente es un transformer denso de 27.320.698.848 parámetros (unos 27,3 mil millones), con 64 capas y una disposición híbrida Gated DeltaNet + Gated Attention. Su contexto nativo es de 262.144 tokens. La familia publicada aquí ofrece cuatro niveles (LOW, MEDIUM, HIGH y VERY-HIGH) que comparten un backbone NVFP4 idéntico de 496 tensores (13,70 GB) y difieren únicamente en diez tensores: la cabeza de salida, el embedding de tokens y los ocho tensores de la cabeza de borrador MTP.

La relevancia de esta publicación es doble. Por un lado, demuestra un flujo de conversión que preserva el tipo nativo GGML 40 (NVFP4) sin re-cuantización ni ida y vuelta de dequant/requant, algo poco habitual. Por otro, integra la cabeza MTP de decodificación especulativa dentro del propio GGUF, de modo que no hace falta un archivo drafter separado. Está pensada para hardware Blackwell (sm_120) y para despliegues en llama.cpp con presupuestos de VRAM ajustados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido Gated DeltaNet + Gated Attention (64 capas) |
| Parámetros totales | 27.320.698.848 (27,3 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | NVFP4 (backbone), Q5_0, Q8_0, IQ4_XS, Q6_K, BF16, F32 (según nivel) |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipo nativo GGML 40 para NVFP4) |

Detalle de los cuatro niveles publicados:

| Nivel | lm_head (`output.weight`) | token_embd | Cabeza MTP | Tamaño |
|---|---|---|---|---|
| LOW | Q5_0 (0,87 GB) | IQ4_XS | IQ4_XS | 15,49 GB |
| MEDIUM | Q8_0 (1,35 GB) | Q6_K | IQ4_XS | 16,34 GB |
| HIGH | BF16 (2,54 GB) | Q6_K | IQ4_XS | 17,53 GB |
| VERY-HIGH | BF16 | BF16 | BF16 | 19,65 GB |

Composición de tensores (idéntica en los cuatro niveles salvo los diez tensores extra, sobre un total de 1.858):

| Tipo GGML | Tensores | Tamaño | Componente |
|---|---|---|---|
| NVFP4 | 496 | 13,70 GB | 64 bloques transformer (QKV, salida de atención, gate/up/down de FFN, gates) |
| F32 | 1.352 | 0,01 GB | normas, gates, escalas |
| Dependiente del nivel | 10 | Variable | `output.weight`, `token_embd.weight`, `blk.64.*` (cabeza MTP, incl. `nextn.eh_proj`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas que combina capas de Gated DeltaNet con capas de Gated Attention, una disposición híbrida que busca reducir el coste de atención en contextos largos manteniendo la calidad de atención completa en parte de la red. El contexto nativo es de 262.144 tokens. Sobre esta base, `DavidAU` aplicó un proceso de fine-tune y merge (denominado Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP) del que no se detallan en la información disponible ni el volumen de tokens, ni la composición del dataset, ni si hubo RLHF o DPO.

La innovación técnica principal de esta publicación no está en el entrenamiento, sino en el ensamblado de tensores. El backbone NVFP4 se convierte a GGUF preservando el tipo nativo GGML 40 desde el checkpoint de `maci0`, sin re-cuantización. Los diez tensores restantes se cuantizan por nivel: la cabeza de salida actúa como principal palanca de calidad (Q5_0 → Q8_0 → BF16), mientras que la cabeza de borrador MTP se mantiene en IQ4_XS para preservar la calidad de las predicciones del drafter, que es lo que hace rentable la decodificación especulativa. La cabeza MTP está embebida en el GGUF y se activa en llama.cpp con `--spec-type draft-mtp`.

El autor indica que el modelo es capaz de visión, aunque los GGUF publicados son solo de texto: la funcionalidad se obtiene emparejándolos con el proyector de visión del repositorio `DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF` (archivos `mmproj-BF16.gguf`, `mmproj-F16.gguf` o `mmproj-F32.gguf`) mediante el parámetro `--mmproj`.

## Capacidades

- Generación de texto conversacional y de un solo turno, con pipeline declarado `text-generation`.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.6-27B, si bien no se aportan resultados concretos en la información disponible.
- Generación de código: el autor menciona explícitamente el uso en coding y tool use como escenario relevante para la elección del sampler.
- Reproducción literal de cadenas largas (rutas, identificadores, argumentos de herramientas), motivo por el que el autor retiró la recomendación del sampler DRY.
- Capacidad de visión (fuera de los GGUF, mediante proyector `mmproj` externo).
- Decodificación especulativa con cabeza MTP embebida, activable con `--spec-type draft-mtp`.
- Soporte multilingüe declarado (etiquetas `en` y `multilingual`); el grado de cobertura por idioma no está detallado.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque el autor lo trata como caso de uso relevante.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local con presupuesto de VRAM ajustado: los niveles LOW (15,49 GB) y MEDIUM (16,34 GB) permiten ejecutar un modelo de 27 B en una GPU consumer de 16 GB o en una configuración de dos GPU de 16 GB, manteniendo la capacidad de generar y completar código en un IDE o CLI.
- Reproducción fiel de rutas y argumentos en pipelines de herramientas: el autor desaconseja el sampler DRY precisamente para preservar la reproducción literal de cadenas largas, lo que hace estos GGUF adecuados para agentes que emiten comandos de shell, rutas de fichero o JSON de llamadas a funciones.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir repositorios completos, expedientes o transcripciones extensas en una sola ventana, siempre que la VRAM permita cachear el contexto.
- Despliegue en estaciones de trabajo Blackwell: al estar orientado a sm_120 y conservar el backbone NVFP4, encaja en equipos con GPU RTX 50xx o Blackwell profesional donde interesa maximizar el throughput de prefill.
- Aceleración de decodificación en producción: la cabeza MTP embebida permite activar decodificación especulativa sin gestionar un segundo archivo de drafter, simplificando el empaquetado de contenedores y el versionado de artefactos.
- Análisis de imágenes con documentación técnica: emparejando el GGUF con un `mmproj` BF16 se puede usar el modelo para extraer texto de capturas, diagramas o documentación escaneada, aunque el GGUF en sí sea solo de texto.
- Experimentación e investigación sobre cuantización NVFP4: la preservación del tipo GGML 40 sin re-cuantización convierte esta familia en un banco de pruebas útil para medir el impacto real de NVFP4 frente a Q4/Q5 en un modelo de 27 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona de forma cualitativa una ventaja de prefill derivada de NVFP4 y una mejora de velocidad de decodificación gracias a la cabeza MTP, pero no aporta cifras de tokens por segundo, latencias ni puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas. Tampoco se documentan comparaciones numéricas entre los cuatro niveles.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño de archivo marca el mínimo aproximado. LOW requiere unos 15,5 GB, MEDIUM unos 16,3 GB, HIGH unos 17,5 GB y VERY-HIGH unos 19,7 GB, a los que hay que sumar la caché KV del contexto utilizado.
- GPU recomendadas: el autor apunta explícitamente a Blackwell sm_120. En la práctica, los niveles LOW y MEDIUM caben en una GPU de 16 GB (por ejemplo, una RTX 5060 Ti de 16 GB) o en configuraciones de dos GPU de 16 GB, que es el setup que el autor declara haber usado. Los niveles HIGH y VERY-HIGH requieren 24 GB o más (RTX 4090, RTX 5090, A100 40 GB, H100).
- Cabe en GPU consumer: sí, en función del nivel. LOW y MEDIUM en 16 GB; HIGH y VERY-HIGH en 24 GB.
- Opciones de despliegue: llama.cpp es el runtime de referencia, dado que el formato es GGUF y el tipo NVFP4 corresponde al tipo GGML 40. La decodificación especulativa se activa con `--spec-type draft-mtp`. El repositorio incluye la etiqueta `endpoints_compatible`. No se documenta soporte para vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La información disponible no permite una comparación numérica fiable con alternativas, ya que no se aportan benchmarks. La tabla siguiente recoge únicamente los datos estructurales conocidos del modelo y de su base.

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.6-27B-Fable-Fusion-711 NVFP4 GGUF) | 27,3 B | 262.144 | GGUF NVFP4 + extras | Apache 2.0 | Cuatro niveles de 15,49 a 19,65 GB; MTP embebida |
| Qwen/Qwen3.6-27B | 27 B (denso) | 262.144 | Safetensors | Apache 2.0 | Modelo base original de Alibaba |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP | 27 B (denso) | No disponible en esta información | Safetensors | Apache 2.0 | Fine-tune y merge sobre el que se construye esta familia |
| maci0/Qwen3.6-27B-Fable-Fusion-711-...-NVFP4 | 27 B (denso) | No disponible en esta información | Safetensors NVFP4 | Apache 2.0 | Checkpoint de origen del backbone NVFP4 |

No se dispone de datos de rendimiento comparado con otros modelos de 27 B, por lo que no se puede establecer una comparación de calidad.

## Limitaciones y advertencias

- No es un modelo entrenado: se trata de una conversión y ensamblado de tensores sobre artefactos existentes. Cualquier limitación del fine-tune de `DavidAU` se hereda íntegramente.
- El autor advierte de un "modo de fallo de bucle de repetición" poco frecuente, que los niveles MEDIUM, HIGH y VERY-HIGH mitigan parcialmente elevando la precisión de los tensores de salida. LOW es el más expuesto.
- La recomendación de sampler DRY fue retirada: interfiere con la reproducción literal de cadenas largas, lo que puede romper rutas, identificadores y argumentos de herramientas en flujos de código y agentes.
- El autor pide explícitamente no tratar las cifras de rendimiento como significativas, ya que no se aportan mediciones formales.
- Dependencia de hardware Blackwell: el backbone NVFP4 y el tipo GGML 40 requieren un runtime y una GPU que lo soporten; en hardware anterior el rendimiento o la compatibilidad pueden degradarse.
- Los GGUF son solo de texto. La visión requiere descargar un `mmproj` de otro repositorio y emparejarlo manualmente.
- Idiomas: se declara inglés y multilingüe, pero no se especifica cobertura ni calidad por idioma. Para castellano no hay evaluación publicada.
- Riesgo de alucinación: no cuantificado en la información disponible. Al ser un fine-tune "uncensored", cabe esperar una menor resistencia a generar contenido sensible o factualmente incorrecto.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la cadena de atribución (Alibaba, DavidAU, maci0, esatapedico) y las condiciones de los artefactos intermedios.
- El repositorio ocupa 84,5 GB, aunque cada archivo individual sea mucho menor; hay que planificar el almacenamiento.
- Trazabilidad limitada: el autor no documenta el proceso de evaluación ni métricas de perplejidad por nivel.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-NVFP4-GGUF
- Modelo base (fine-tune): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Repositorio de cuantizaciones y proyectores de visión de DavidAU: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Checkpoint NVFP4 en safetensors: https://huggingface.co/maci0/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-NVFP4
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen3.6-27B
- Sitio del autor: https://www.esatapedico.com
