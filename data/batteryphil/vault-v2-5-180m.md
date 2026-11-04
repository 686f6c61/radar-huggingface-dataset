# batteryphil/VAULT-v2.5-180M

## Resumen

VAULT v2.5-180M es un modelo de generación de texto de 239,3 millones de parámetros reales (180,6M declarados por el autor) desarrollado por Philip Bartsch (`@batteryphil`) bajo licencia MIT. Se presenta como una arquitectura recurrente post-Transformer y post-SSM denominada VAULT (Variance-Weighted Associative Unitary Lattice Tensor), que sustituye la caché KV de crecimiento lineal por bancos de memoria asociativa de pesos rápidos basados en celdas de Kenyon co-primas, con direccionamiento mediante convolución circular ligada a fase y aritmética del teorema chino de los restos.

El modelo se entrenó desde cero en una única GPU de consumo de 16 GB (AMD Radeon RX 9060 XT) sobre 0,594 miles de millones de tokens (0,575B de preentrenamiento continuado más 19,7M de tokens de SFT de precisión). Su propuesta diferencial es la decodificación en tiempo O(1): la latencia por token no crece con la longitud de contexto, y el estado de memoria puede expandirse en inferencia mediante "Elastic Co-Prime Mitosis" de 220 a 2.002 celdas sin reentrenar.

Es relevante como pieza de investigación en arquitecturas recurrentes eficientes y memoria asociativa, no como modelo de producción generalista: su rendimiento en benchmarks académicos está muy por debajo de modelos densos del mismo orden de magnitud entrenados con dos o tres órdenes más de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente post-Transformer / post-SSM (VAULT), celdas de Kenyon co-primas con fast-weights, atención lineal y convolución circular ligada a fase; `d_model=768`, `n_layers=16`, `H_q=12`, `G_vault=4`, `d_head=64`, `d_ff=2048` |
| Parametros totales | 239.342.672 (safetensors); el autor declara 180,6M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado a 2.048 tokens; extrapolación zero-shot evaluada hasta 32K y 128K con mitosis |
| Tipos de cuantizacion | No disponible (solo se documentan pesos safetensors; no se listan GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,9 GB), código custom (`trust_remote_code`) |

## Arquitectura y entrenamiento

VAULT abandona tanto la caché KV no acotada de los Transformers como la matriz de estado única con decaimiento exponencial de Mamba y los RNN lineales. En su lugar, enruta entidades de alta saliencia hacia 4 bancos de memoria asociativa de pesos rápidos ("Co-Prime Kenyon Cells") con conjuntos de primos P = {47, 53, 59, 61}, lo que da 220 celdas y 8,97 millones de direcciones CRT. El direccionamiento se realiza mediante convolución circular ligada a fase. Las celdas no direccionadas tienen decaimiento temporal pasivo nulo (γ = 1,0), de modo que la memoria retenida no se degrada por el paso de tokens.

La innovación central es la "Elastic Co-Prime Mitosis": la capacidad de memoria puede expandirse en tiempo de inferencia, sin reentrenamiento, hasta 2.002 celdas (P = {491, 499, 503, 509}, 62,7 mil millones de direcciones CRT), manteniendo la misma latencia de decodificación por token. El entrenamiento se realizó desde cero en una sola GPU de consumo de 16 GB sobre 0,594B tokens totales (0,575B de preentrenamiento continuado y 19,7M de SFT). El autor documenta kernels Triton fusionados de decodificación (`_vault_v2_5_fft_bind_64_kernel`, `_vault_v2_5_salience_pool_decode_kernel`, `_vault_v2_5_local_syntax_decode_kernel`, `_vault_v2_decode_fw_kernel`) con paridad verificada frente a una implementación monolítica FP32: diferencia máxima de prefill 5,91e-5, mediana de decodificación en 128 pasos 2,46e-5 y 100,00% de acuerdo en Top-1.

## Capacidades

- Generación de texto conversacional en inglés, con modo chat (`model.chat(...)`) y streaming token a token.
- Razonamiento básico y respuesta a preguntas de cultura general y ciencia elemental (evaluado en SciQ, ARC, PIQA, HellaSwag, Winogrande, BoolQ, LAMBADA).
- Generación de código sencillo: la model card incluye ejemplos de funciones Python (máximo y suma de una lista).
- Recuperación en contexto de múltiples agujas ("multi-needle retrieval") con 83,3% de recall exacto a 32K pese a haberse entrenado solo a 2K.
- Memoria asociativa de largo plazo con direccionamiento CRT y expansión de capacidad en inferencia (220, 508, 942 o 2.002 celdas).
- Decodificación O(1): latencia por token constante independientemente de la longitud de contexto.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Investigación en arquitecturas recurrentes eficientes: sirve como banco de pruebas reproducible (una GPU de 16 GB, 0,594B tokens) para estudiar memoria asociativa con direccionamiento CRT frente a caché KV y SSM.
- Experimentos de extrapolación de contexto: permite medir recuperación de agujas a 32K y 128K con un modelo entrenado a 2K, útil para estudiar generalización posicional en RNN lineales.
- Evaluación de latencia O(1) en streaming: su decodificación estable en torno a 20,6 ms/token entre 2K y 128K lo hace adecuado para demostrar pipelines de inferencia con coste por token independiente de la longitud de entrada.
- Pruebas de expansión de estado en caliente: la mitosis de 220 a 2.002 celdas permite investigar escalado de memoria en producción sin reentrenar ni reiniciar el servicio.
- Docencia y divulgación: implementación compacta de conceptos avanzados (fast-weights, convolución circular, CRT, kernels Triton) ejecutable en hardware de consumo.
- Generación de texto y código de baja exigencia en entornos con recursos muy limitados, siempre que se acepte su calidad limitada en inglés.
- Prototipado de asistentes conversacionales con contexto largo en inglés donde prime la latencia constante sobre la calidad lingüística.

## Benchmarks y rendimiento

Datos de la model card (EleutherAI `lm-eval`, misma GPU de 16 GB; base v2.4 con 0,575B tokens frente a SFT v2.5 con 0,594B tokens):

| Benchmark | VAULT v2.4 base | VAULT v2.5 SFT | Mamba-2 130M (300B tok) | SmolLM 135M (600B tok) |
|---|---|---|---|---|
| SciQ con pasaje (acc_norm) | 50,40% | 71,80% | 73,20% | 76,40% |
| SciQ closed-book (acc_norm) | 37,00% | 50,70% | 46,70% | 64,70% |
| ARC-Easy (acc_norm) | 37,71% | 45,37% | 42,38% | 57,41% |
| ARC-Challenge (acc_norm) | 23,12% | 23,72% | 23,81% | 28,92% |
| PIQA (acc_norm) | 57,02% | 58,22% | 63,71% | 68,44% |
| HellaSwag (acc_norm) | 35,73% | 37,13% | 43,07% | 45,60% |
| Winogrande (acc) | 49,64% | 50,43% | 53,28% | 52,72% |
| BoolQ (acc / acc_norm) | 56,93% / 62,93% | 41,53% / 51,33% | 56,33% / 61,40% | 59,87% / 63,20% |
| LAMBADA (acc) | 12,27% | 13,73% | 42,93% | 36,87% |
| WikiText-2 (BPB / TokPPL) | 1,5447 / 93,97 | 1,5466 / 94,51 | 0,9645 / 19,98 | 0,9686 / 17,26 |
| Media zero-shot 9 tareas | 39,98% | 43,63% | 49,49% | 54,55% |

Rendimiento de decodificación y escalado de estado (kernels Triton fusionados, FP32):

| Configuración | Prefill | Estado | Decodificación |
|---|---|---|---|
| 220 celdas @ 2K tokens | 10.214 tok/s | 227,3 MB | 20,61 ms/token (48,5 tok/s) |
| 220 celdas @ 128K tokens | 13.119 tok/s | 227,3 MB | 20,53 ms/token (48,7 tok/s) |
| 2.002 celdas (mitosis) @ 128K tokens | 2.798 tok/s | 2.009,7 MB | 20,59 ms/token (48,6 tok/s) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 239,3M parámetros (aproximadamente 0,96 GB en FP32, 0,48 GB en FP16/BF16); con overhead de activaciones y estado asociativo cabe holgadamente en GPUs de 4-8 GB.
- Estado asociativo en memoria: 227,3 MB con 220 celdas y 2.009,7 MB con 2.002 celdas, independiente de la longitud de contexto.
- GPU recomendadas: cualquier GPU con soporte CUDA o ROCm; el autor entrenó y evaluó en una AMD Radeon RX 9060 XT de 16 GB. Funciona también en CPU (sin los kernels Triton).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060/4070/4090, RX 6000/7000) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; kernels Triton opcionales en Linux CUDA/ROCm para las rutas O(1) fusionadas (48,8 tok/s declarados). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 10.214 a 13.119 tok/s con 220 celdas y 2.798 tok/s con 2.002 celdas; decodificación estable en torno a 20,6 ms/token (48,5-48,7 tok/s) entre 2K y 128K tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media zero-shot 9 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VAULT v2.5-180M | 239,3M | 2K entrenado; 32K-128K por extrapolación | 43,63% | MIT | HuggingFace + GitHub |
| Mamba-2 130M | 130M | No disponible en la información | 49,49% | No disponible en la información | Referencia citada por el autor |
| SmolLM 135M | 135M | No disponible en la información | 54,55% | No disponible en la información | Referencia citada por el autor |

La comparación debe leerse con cautela: VAULT se entrenó con 0,594B tokens frente a los 300B de Mamba-2 130M y los 600B de SmolLM 135M. La ventaja de VAULT no es la calidad lingüística sino la latencia de decodificación constante y la expansión de memoria en inferencia.

## Limitaciones y advertencias

- Calidad lingüística muy limitada: perplejidad en WikiText-2 de 94,51 (BPB 1,5466), frente a 17-20 de modelos del mismo tamaño entrenados con dos o tres órdenes más de tokens.
- LAMBADA de 13,73% y HellaSwag de 37,13% indican una modelización débil del lenguaje natural y del sentido común.
- El SFT degrada BoolQ de 62,93% a 51,33% (acc_norm), una pérdida de 15,40 puntos en `acc`: señal de olvido catastrófico o sobreajuste al conjunto de precisión.
- Solo inglés; no hay evidencia de capacidades multilingües.
- Contexto de entrenamiento de solo 2.048 tokens; el uso más allá de esa longitud depende de extrapolación no garantizada, aunque el autor reporta 83,3% de recall exacto a 32K.
- Riesgo elevado de alucinación y de respuestas incoherentes en dominios abiertos, dado el escaso volumen de entrenamiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del autor: auditar antes de usar en producción.
- Sin soporte documentado de tool calling, agentes, visión ni cuantizaciones estándar (GGUF, AWQ, GPTQ), lo que limita su integración en stacks de despliegue habituales.
- Proyecto con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria independiente de los resultados reportados.
- Licencia MIT permite uso comercial, pero la ausencia de garantías y la calidad del modelo desaconsejan su uso en producción sin evaluación propia.

## Enlaces

- HuggingFace: https://huggingface.co/batteryphil/VAULT-v2.5-180M
- Repositorio GitHub: https://github.com/batteryphil/VAULT
- Perfil del autor en GitHub: https://github.com/batteryphil
