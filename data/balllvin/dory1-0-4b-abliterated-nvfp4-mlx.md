# balllvin/Dory1.0-4B-abliterated-NVFP4-MLX

## Resumen

Dory1.0-4B-abliterated-NVFP4-MLX es una conversión al ecosistema MLX de Apple del modelo Dory 1.0 4B de NVIDIA (Nemotron-Labs), en su variante "abliterated" y cuantizada en NVFP4. El autor, balllvin, parte del build NVFP4 para vLLM y reempaqueta los mismos códigos de 4 bits y escalas de bloque en un formato que MLX carga de forma nativa en Apple Silicon. El resultado es un modelo de 3.975.229.440 parámetros (aproximadamente 4B) que ocupa 3,2 GB en el repositorio.

La modificación principal respecto al original de NVIDIA es la abliteración: se elimina la dirección de rechazo mediante el método OBLITERATUS, proyectándola fuera de todos los escritores residuales (`o_proj`, `down_proj` y el embedding). Posteriormente se aplica destilación consciente de cuantización (QAD) para recuperar parte de la calidad del profesor bf16. El objetivo declarado es la investigación sobre alineamiento y refusal, no el uso en producción.

Es relevante ahora porque demuestra un flujo completo de cuantización NVFP4 portado a MLX con verificación byte a byte, y porque publica métricas de refusal comparadas con el modelo original de NVIDIA (13,1% frente a 54,5% en prompts dañinos), lo que lo convierte en un caso de estudio útil sobre los límites y riesgos de las técnicas de abliteración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base NVIDIA Nemotron-Labs Dory 1.0 4B); detalles internos no disponibles |
| Parametros totales | 3.975.229.440 (≈4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4-bit, W4A16) con escalas de bloque; solo se distribuye esta variante |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW 1.1 (pesos, config y tokenizer); código de `tools/` bajo MIT |
| Formato de pesos | safetensors (MLX), con `nvfp4_source.safetensors` y metadatos en `nvfp4_mlx.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base NVIDIA Nemotron-Labs Dory 1.0 4B, un transformer decoder-only de aproximadamente 4B parámetros. Sobre esa base, el autor aplica abliteración con el método OBLITERATUS: la dirección de rechazo se proyecta fuera de cada escritor residual (`o_proj`, `down_proj` y el embedding), de modo que el modelo deja de representar internamente la señal asociada al rechazo. Después, el build NVFP4 se reentrena hacia su profesor bf16 mediante destilación consciente de cuantización (ruta R1: primero abliterar, después QAD), con 17 pasos y una tasa de aprendizaje de 1e-5.

La conversión a MLX no reentrena pesos: reutiliza los mismos códigos de 4 bits y escalas de bloque del build NVFP4, reordenados para que `mx.quantized_matmul` los lea directamente. Como MLX no admite el tensor scale (`weight_scale_2`), el conversor lo pliega dentro de los 72 vectores de puerta (`s_gate`, `suv_gate`), que se almacenan en fp32 y son los únicos tensores modificados. El script `verify.py` confirma 507 tensores y 3.201.564.672 bytes idénticos frente al build NVFP4. El modelo tiene el modo de razonamiento (thinking) activado de forma permanente, con un número de bucles recomendado de 2 por defecto y 4 para tareas difíciles.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento explícito: la respuesta se emite en el campo `reasoning` antes del contenido final.
- Razonamiento multi-paso mediante bucles de pensamiento configurables (2 por defecto, 4 para tareas difíciles).
- Conocimiento general evaluado con MMLU (0,837 sobre 300 preguntas en el build NVFP4).
- Servidor compatible con la API de chat de OpenAI a través de `mlx_lm server` o del script `tools/serve.py`.
- Reducción drástica del rechazo de peticiones: 13 de 99 prompts dañinos rechazados en la ejecución MLX, frente a 54 de 99 del modelo de NVIDIA.
- No se documentan capacidades de tool calling, function calling, visión, audio ni soporte multilingüe más allá del inglés.

## Casos de uso

- Investigación sobre alineamiento y refusal: el modelo permite estudiar cómo la proyección de la dirección de rechazo afecta a la tasa de negativas y a la calidad general, con métricas publicadas comparables frente al original de NVIDIA.
- Evaluación de técnicas de abliteración: sirve como referencia reproducible para medir el impacto de OBLITERATUS combinado con QAD, ya que el repositorio incluye los scripts de conversión y verificación.
- Desarrollo y pruebas en Apple Silicon: al cargarse de forma nativa en MLX, permite validar pipelines de inferencia local en Mac sin depender de CUDA ni de vLLM.
- Benchmarking de cuantización NVFP4 en MLX: el par de repositorios (NVFP4 para vLLM y MLX para Mac) permite comparar el mismo modelo en dos stacks y documentar diferencias de comportamiento.
- Experimentos de razonamiento con bucles de pensamiento: el parámetro de loop count (2 o 4) permite estudiar el compromiso entre profundidad de razonamiento, longitud de respuesta y coste computacional.
- Docencia y divulgación sobre seguridad de modelos: las cifras de refusal y las advertencias explícitas del autor lo convierten en un ejemplo práctico de los riesgos de distribuir variantes abliterated.
- Prototipado de asistentes conversacionales en local: con 3,2 GB de pesos y API compatible con OpenAI, es viable montar un servidor de pruebas en un Mac sin infraestructura adicional.

## Benchmarks y rendimiento

| Medida | Resultado | Stack y ajustes |
|---|---:|---|
| Prompts dañinos rechazados (MLX) | 13 de 99 (13,1%; IC 95%: 7,8-21,2%) | MLX, 4 bucles, thinking on, temperatura 1,0, top-p 0,95, 16.384 tokens nuevos |
| Prompts inocuos rechazados (MLX) | 2 de 100 (2,0%; IC 95%: 0,6-7,0%) | Mismos ajustes |
| Tokens de finalización medianos | 658 (dañinos), 4.367 (inocuos) | Mismos ajustes |
| Prompts dañinos rechazados (NVFP4) | 23 de 99 (23,2%) | vLLM, 4 bucles, thinking on, ejecución de laboratorio |
| Prompts dañinos rechazados (NVIDIA NVFP4) | 54 de 99 (54,5%) | Mismos ajustes |
| Prompts inocuos rechazados (NVFP4) | 0 de 99 | Mismos ajustes |
| Prompts inocuos rechazados (NVIDIA NVFP4) | 19% | Mismos ajustes |
| MMLU (300 preguntas, build NVFP4) | 0,837 (NVIDIA NVFP4: 0,840) | vLLM, 4 bucles, thinking on |

El autor advierte que las filas de MLX y vLLM provienen de stacks y muestreos distintos, por lo que las tasas de refusal no son una comparación homogénea. La ejecución MLX es una sola pasada sobre conjuntos de prompts sellados y no publicados. MMLU solo se midió en vLLM. No se han publicado resultados de GPQA Diamond, tareas financieras ni de código en la información disponible.

## Requisitos de hardware

- VRAM/espacio de pesos: 3,2 GB de repositorio en cuantización NVFP4 de 4 bits; el espacio en memoria unificada necesario para inferencia es algo superior por el contexto y las cachés KV, aunque no se publica una cifra exacta.
- Plataforma objetivo: Apple Silicon exclusivamente; el repositorio está pensado para cargarse con MLX en un Mac. Para otras plataformas debe usarse el build NVFP4 con vLLM.
- GPU recomendadas: no aplica en el sentido tradicional; se ejecuta sobre memoria unificada de chips Apple. Para el build NVFP4 equivalente, el autor cita vLLM pero no especifica GPU concretas (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecución en GPUs NVIDIA de consumo para este repositorio MLX.
- Opciones de despliegue: `mlx_lm server` (servidor estándar) o `tools/serve.py` del repositorio, ambos con API compatible con OpenAI. Requiere `mlx==0.32.4` y el fork fijado de mlx-lm de pmichalas (`208065f3354e8c2645b658493b6aeb94eb0aaa77`), además de `sentencepiece` y `protobuf`.
- Latencia y throughput: no disponibles. El autor solo documenta una prueba de carga en un único Mac Apple Silicon y advierte que las respuestas con thinking consumen entre 650 y 1.200 tokens incluso en preguntas simples, lo que implica latencias altas con `max_tokens` bajos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Refusal en prompts dañinos | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dory1.0-4B-abliterated-NVFP4-MLX (este) | ≈4B | no disponible | 13,1% (MLX) / 23,2% (NVFP4) | 0,837 (NVFP4) | OpenMDW 1.1 | Hugging Face, MLX |
| NVIDIA Nemotron-Labs Dory 1.0 4B NVFP4 (original) | ≈4B | no disponible | 54,5% | 0,840 | OpenMDW 1.1 | Hugging Face, vLLM |
| Dory1.0-4B-abliterated-Arete-NVFP4 | ≈4B | no disponible | no disponible | no disponible | OpenMDW 1.1 | Hugging Face |
| Dory1.0-4B-abliterated-Arete-NVFP4-MLX | ≈4B | no disponible | no disponible | no disponible | OpenMDW 1.1 | Hugging Face, MLX |

La comparación más informativa es contra el original de NVIDIA: mismo tamaño y licencia, pero con una tasa de refusal mucho menor a costa de perder 0,003 puntos de MMLU en la medición publicada. Las variantes Arete (tras el entrenamiento de valores de Nous Research) se mencionan en la model card pero sin métricas propias en la información disponible.

## Limitaciones y advertencias

- El modelo está abliterado y puede generar contenido dañino: el propio autor lo declara no seguro para uso sin supervisión ni para aplicaciones de cara al usuario.
- Sesgos conocidos: no documentados explícitamente, pero al derivar de un base entrenado principalmente en inglés y sin evaluación de sesgos publicada, se deben asumir los del modelo original.
- Riesgo de alucinación: no evaluado en este repositorio; el modo thinking siempre activo puede aumentar la longitud de las respuestas sin garantizar su veracidad.
- Limitación de idioma: solo inglés; no hay soporte multilingüe documentado.
- Limitación de contexto: la longitud de contexto no se especifica en la información disponible, lo que impide planificar despliegues con documentos largos.
- Thinking permanente: las respuestas son largas (mediana de 658 a 4.367 tokens) y un `max_tokens` bajo devuelve contenido vacío, lo que complica integraciones con límites estrictos.
- Calidad medida de forma parcial: solo refusal rates y MMLU en vLLM; no hay MMLU en MLX ni evaluaciones de GPQA, finanzas o código.
- Validación limitada: solo se probó en un único Mac Apple Silicon.
- Licencia: OpenMDW 1.1 para pesos, config y tokenizer; el código de `tools/` es MIT. El método OBLITERATUS es AGPL-3.0, aunque no se incluye código suyo en el repositorio. Conviene revisar los términos de OpenMDW 1.1 antes de un uso comercial.
- Aviso técnico: al cargar se imprime una advertencia del tokenizer sobre `fix_mistral_regex` que el autor no ha rastreado.
- El conversor solo admite carpetas Dory W4A16_NVFP4 con un único `model.safetensors`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/Dory1.0-4B-abliterated-NVFP4-MLX
- Build NVFP4 para vLLM: https://huggingface.co/balllvin/Dory1.0-4B-abliterated-NVFP4
- Variante con entrenamiento Arete (NVFP4): https://huggingface.co/balllvin/Dory1.0-4B-abliterated-Arete-NVFP4
- Variante con entrenamiento Arete (MLX): https://huggingface.co/balllvin/Dory1.0-4B-abliterated-Arete-NVFP4-MLX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Fork de mlx-lm con soporte Dory: https://github.com/pmichalas/mlx-lm (commit `208065f3354e8c2645b658493b6aeb94eb0aaa77`)
- Método OBLITERATUS: no disponible (referenciado en la model card sin enlace)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
