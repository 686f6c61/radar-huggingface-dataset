# dealignai/Qwen3.8-Flash-Next-ABLITERATED-NVFP4

## Resumen

Qwen3.8-Flash-Next-ABLITERATED-NVFP4 es una versión modificada del modelo Qwen3.8-Flash-Next de Alibaba, publicada por el usuario dealignai en HuggingFace. Se trata de un build "abliterated" (eliminación de rechazos de seguridad) aplicado directamente a los pesos del modelo, sin fine-tuning ni trucos de prompt, y cuantizado a NVFP4 (precisión de 4 bits). El modelo base es un MoE multimodal de gran tamaño (119.602.003.859 parámetros según safetensors, con 6 mil millones activos por token) que soporta razonamiento en varios niveles (low, medium, xhigh), decodificación especulativa MTP y procesamiento de imagen y vídeo.

La relevancia de este modelo radica en que permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, manteniendo prácticamente intactas sus capacidades generales (la pérdida en MMLU es de solo 0,18 puntos porcentuales). Está pensado exclusivamente para investigación de seguridad, red-teaming y evaluación de riesgos, y su licencia (qwen-community-license-1.0) restringe su uso comercial. La versión NVFP4 está optimizada para servir con SGLang en configuraciones tensor-parallel, por ejemplo sobre 2× NVIDIA DGX Spark (GB10).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención GDN + QSA (Qwen4) |
| Parametros totales | 119.602.003.859 (safetensors) |
| Parametros activos | 6 mil millones aprox. |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit); también existe versión FP8 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | safetensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE híbrida que combina atención GDN (Grouped Dot-product Attention) y QSA (Quadratic Self-Attention), según la documentación oficial de Qwen en GitHub. Incorpora además un módulo de decodificación especulativa MTP (Multi-Token Prediction) que acelera la generación al predecir varios tokens por paso. El modelo base fue entrenado con un coste computacional aproximadamente 9 veces inferior al de su predecesor Qwen3.7-Plus, manteniendo o mejorando capacidades en tareas de programación y ofimática.

La modificación abliterated se realiza a nivel de pesos, eliminando los vectores de dirección responsables de los rechazos de seguridad. No hay fine-tuning, LoRA, destilación ni datos sintéticos implicados; el cambio reside exclusivamente en los pesos, por lo que funciona con el chat template estándar y el system prompt por defecto. La cuantización NVFP4 se aplicó posteriormente con NVIDIA ModelOpt, reduciendo el tamaño del modelo a 135 GB en el repositorio.

## Capacidades

- Generación de texto y razonamiento multinivel (low, medium, xhigh) conservados del modelo base.
- Procesamiento multimodal de imagen y vídeo: reconocimiento de formas, colores, OCR, descripción de movimiento y objetos.
- Decodificación especulativa MTP funcional: el "draft head" crackeado coincide con el modelo principal, logrando ~2,4 tokens aceptados por paso.
- Sin rechazos de seguridad: el modelo cumple con peticiones dañinas, ilegales o no éticas en el 100 % de los casos evaluados (HarmBench-320, greedy decoding).
- Coherencia preservada: sin bucles en código, matemáticas, razonamiento o texto largo (greedy).
- Configuración de generación estándar: temperatura 1.0, top_p 0.95, top_k 20.

## Casos de uso

- Investigación en seguridad y red-teaming: evaluar el comportamiento de un LLM sin mecanismos de rechazo en escenarios adversariales, identificando vulnerabilidades y riesgos potenciales.
- Estudio de técnicas de alineación: comparar respuestas entre el modelo base alineado y esta versión abliterated para medir el impacto de los rechazos en la utilidad y la seguridad.
- Desarrollo de sistemas de moderación de contenido: utilizar el modelo como generador de contenido problemático para entrenar clasificadores o filtros de seguridad.
- Evaluación de capacidades multimodales sin restricciones: probar el reconocimiento de imágenes y vídeo en contextos donde el modelo base rechazaría responder (por ejemplo, análisis de imágenes médicas o de seguridad).
- Análisis de razonamiento en escenarios extremos: estudiar cómo el modelo razona sobre temas sensibles cuando no hay barreras de rechazo, útil para diseñar mejores métodos de control.
- Pruebas de robustez de la cuantización: comparar el rendimiento NVFP4 frente a la versión FP8 o el modelo original en tareas de generación y razonamiento.

## Benchmarks y rendimiento

| Benchmark | Modelo base (Qwen3.8-Flash-Next) | Este modelo (ABLITERATED NVFP4) | Diferencia |
|---|---|---|---|
| MMLU (2.280 preguntas, 40 por materia) | 82,11 % | 81,93 % | -0,18 pp |
| HarmBench-320 (cumplimiento de comportamientos dañinos, greedy) | — | 100 % (en todos los niveles de razonamiento) | — |

En MMLU por materias, la mayoría de las variaciones están dentro del ruido estadístico, aunque se observan caídas notables en college chemistry (-10 pp), college mathematics (-10 pp), formal logic (-10 pp), machine learning (-10 pp), professional law (-10 pp) y moral scenarios (-12 pp). No se dispone de resultados para HumanEval, GSM8K u otros benchmarks en la información proporcionada.

## Requisitos de hardware

- La model card recomienda servir el modelo con SGLang en configuración tensor-parallel sobre 2× NVIDIA DGX Spark (GB10). No se especifica la VRAM exacta, pero al ser cuantización NVFP4 (4-bit) el tamaño en memoria es de aproximadamente 60-70 GB por GPU.
- No es viable en GPUs de consumo estándar (RTX 4090 con 24 GB, por ejemplo); se necesitan al menos dos GPUs con memoria unificada o VRAM de servidor.
- Opciones de despliegue: SGLang con `--quantization modelopt_fp4 --fp4-gemm-backend flashinfer_cutlass`. También existe la versión FP8 del mismo autor para entornos con mayor capacidad.
- Parámetros de SGLang recomendados: `--page-size 64 --mamba-scheduler-strategy extra_buffer --mamba-track-interval 64`.
- La latencia y el throughput dependen fuertemente del hardware; con MTP activado se logran ~2,4 tokens aceptados por paso de decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~125B (6B activos) | 262K | BF16 (original) | qwen-community-license-1.0 | Modelo alineado con rechazos de seguridad |
| Qwen3.8-Flash-Next-ABLITERATED-NVFP4 (este) | ~119.6B (6B activos) | 262K | NVFP4 (4-bit) | qwen-community-license-1.0 | Sin rechazos, cuantizado, multimodal |
| Qwen3.8-Flash-Next-ABLITERATED-FP8 (mismo autor) | ~120B (estimado) | 262K | FP8 | qwen-community-license-1.0 | Misma modificación abliterated, mayor precisión |

La comparativa con otros MoE multimodales de la misma categoría (por ejemplo, Qwen3-VL o DeepSeek-VL) no está disponible en los datos proporcionados.

## Limitaciones y advertencias

- Modelo sin censura: generará contenido dañino, ilegal, no ético o peligroso. Es un artefacto de investigación y el autor declina toda responsabilidad sobre su uso.
- La cuantización NVFP4 puede introducir pequeñas degradaciones de precisión en tareas numéricas o de razonamiento formal (se observan caídas de hasta 12 pp en algunas materias de MMLU).
- No se han documentado sesgos específicos más allá de los inherentes al modelo base, pero al eliminar los rechazos, los sesgos preexistentes pueden manifestarse sin filtro.
- Riesgo de alucinación no evaluado específicamente; se asume similar al modelo base, aunque la cuantización podría incrementarlo ligeramente.
- Licencia qwen-community-license-1.0: restringe el uso comercial y la redistribución; hay que revisar los términos exactos antes de cualquier despliegue.
- El modelo solo se ha probado con SGLang y hardware específico (DGX Spark); otros entornos pueden requerir ajustes adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/Qwen3.8-Flash-Next-ABLITERATED-NVFP4
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Versión FP8 del mismo autor: https://huggingface.co/dealignai/Qwen3.8-Flash-Next-ABLITERATED-FP8
- Repositorio oficial de Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
