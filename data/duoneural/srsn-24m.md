# DuoNeural/SRSN-24M

## Resumen

SRSN-24M (Symplectic Recurrent State Network) es un modelo de lenguaje recurrente de 24 millones de parámetros desarrollado por DuoNeural AI Laboratory (Jesse Caldwell, Aura y Archon). Su propuesta central es sustituir el transformer por una recurrencia formulada como sistema dinámico Port-Hamiltoniano: cada paso temporal se resuelve con un integrador simpléctico sobre una celda de oscilador armónico amortiguado con parámetros aprendidos (SDOC). El objetivo declarado es eliminar por construcción la explosión y el desvanecimiento de gradientes típicos de las RNN clásicas, manteniendo un coste de memoria constante en la longitud de secuencia.

El modelo se entrena íntegramente en CPU sobre una APU de consumo (AMD Ryzen 5 3550H), con kernels C++ propios compilados con AVX2, FMA y OpenMP. Según la model card, la campaña de preentrenamiento ha procesado más de 36,5 millones de tokens y el checkpoint publicado corresponde al paso 1100, con una pérdida de validación de 6,4873. El repositorio ocupa 0,2 GB y los pesos definitivos se subirán al completar la campaña de 100 millones de tokens.

Es relevante ahora como experimento de arquitectura alternativa en un contexto dominado por transformers y modelos de estado (SSM): propone memoria O(1) en secuencia mediante el método adjunto analítico y un mecanismo de memoria asociativa emergente (bifurcación a pozos dobles) que el autor documenta empíricamente. No obstante, se trata de un modelo en fase de investigación, sin benchmarks estándar publicados ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN simpléctica basada en sistemas Port-Hamiltonianos; celda SDOC (oscilador armónico amortiguado no lineal) con integrador simpléctico (Δt = 0,1) |
| Parametros totales | 24M (según nombre del modelo; desglose no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch `.pt` (no se mencionan safetensors ni GGUF) |

## Arquitectura y entrenamiento

La celda recurrente SDOC modela cada canal oculto como un oscilador con frecuencia natural aprendida (ω²), amortiguamiento por token γ[t] = σ(W_damp·x[t]) y acoplamiento anarmónico α. El estado se divide en posición q y momento p, actualizados con un integrador simpléctico que preserva la estructura J−R del sistema Port-Hamiltoniano; la salida es y[t] = q[t] ⊙ SiLU(p[t]). La función de potencial V(q) = ½ω²q² + α·ln(cosh(q)) bifurca a dos equilibrios estables cuando α < 0 y |α| > ω², lo que el autor interpreta como registros de memoria asociativa para correferencia y sintaxis.

El entrenamiento se realizó sobre 36,5 millones de tokens en una APU AMD Ryzen 5 3550H, con retropropagación mediante el método adjunto analítico resuelto hacia atrás en el tiempo, lo que evita almacenar activaciones a lo largo de la secuencia (memoria O(1) en longitud). Los kernels AVX2 en C++ con pybind11 reducen la huella residente a 674–704 MB, un 54 % menos que la línea base de PyTorch ATen. No se documentan datos sobre composición del corpus, RLHF/DPO ni fases de alineamiento.

## Capacidades

- Generación de texto autoregresiva (pipeline declarado: text-generation).
- Modelado de secuencias con memoria de estado constante, independiente de la longitud.
- Memoria asociativa emergente mediante pozos dobles aprendidos (38 de 3840 parámetros α negativos confirmados, saturación del 100 % de los negativos).
- Entrenamiento e inferencia en CPU sin GPU, gracias a los kernels AVX2/FMA/OpenMP.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Soporte multilingüe: no disponible (no se declaran idiomas).

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como banco de pruebas reproducible para estudiar dinámicas Hamiltonianas, integradores simplécticos y estabilidad de gradientes en secuencias largas, con un coste de cómputo accesible en hardware de consumo.
- Experimentos de memoria asociativa: la bifurcación a pozos dobles permite analizar cómo emergen registros de estado estables durante el entrenamiento, útil para estudiar correferencia y binding sintáctico en modelos recurrentes.
- Prototipado en entornos sin GPU: al ejecutarse a 217–264 tokens/s en una APU Ryzen 5 3550H con menos de 700 MB residentes, es adecuado para docencia, demos y validación de ideas en portátiles modestos.
- Estudio del método adjunto analítico: permite comparar el coste de memoria O(1) frente a la retropropagación a través del tiempo estándar en tareas de modelado de lenguaje.
- Base para fine-tuning de dominio muy pequeño: con 24M de parámetros y licencia MIT, puede ajustarse en CPU para tareas de generación acotadas (por ejemplo, plantillas o texto sintético) donde no se requiera calidad de un LLM.
- Reproducción de la campaña de preentrenamiento: el harness y los kernels están abiertos en GitHub, lo que facilita replicar los resultados y extender la campaña más allá de los 100M de tokens previstos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos empíricos reportados por el autor son de entrenamiento e inferencia:

| Metrica | Valor |
|---|---|
| Pérdida de validación (paso 1100) | 6,4873 |
| Tokens de preentrenamiento | > 36,5M |
| Pozos dobles confirmados (α negativos) | 38 / 3840 (100 % de los negativos) |
| min(α) / max(α) | −0,219848 / +0,211055 |
| Desviación espectral σ(α) | 0,030863 (+907,9 % sobre la línea base, 46 checkpoints sin reversión) |
| Media de α | 0,098063 ± 0,0019 |
| Throughput (APU Ryzen 5 3550H) | 217–264 tokens/s |
| Huella de memoria activa | 674–704 MB (54 % menos que PyTorch ATen) |

## Requisitos de hardware

- VRAM: no aplica en el escenario documentado; el modelo está diseñado para CPU. En GPU, la huella sería inferior a 1 GB en fp32 para 24M de parámetros (estimación teórica, no verificada por el autor).
- GPU recomendadas: no disponibles; el autor no reporta ejecución en GPU.
- CPU: funciona en una APU de consumo (AMD Ryzen 5 3550H) con soporte AVX2, FMA y OpenMP.
- Cabe en cualquier equipo de consumo con AVX2; no requiere GPU dedicada.
- Despliegue: harness propio en GitHub con extensión C++ compilada vía pybind11; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 217–264 tokens/s en la APU citada; sin datos para otras plataformas.

## Comparativa con modelos similares

No hay comparaciones publicadas con modelos de la misma categoría. Como referencia estructural, se pueden considerar alternativas recurrentes/SSM de escala pequeña, aunque no se dispone de datos comparativos de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SRSN-24M | 24M | no disponible | MIT | Pesos pendientes de subida; código en GitHub |
| Mamba (variantes pequeñas) | ~130M en adelante | hasta 2k–32k según variante | Apache 2.0 | Hugging Face |
| RWKV (variantes pequeñas) | desde ~169M | hasta 4k+ | Apache 2.0 | Hugging Face |

La comparación de rendimiento no está disponible: SRSN-24M no reporta métricas en tareas estándar y su escala (24M) es inferior a la de las alternativas citadas.

## Limitaciones y advertencias

- Modelo en fase de investigación: los checkpoints aún no están subidos al repositorio; solo se anuncia su publicación al completar la campaña de 100M de tokens.
- Sin benchmarks estándar: no hay evidencia publicada de calidad en tareas de lenguaje, razonamiento o código.
- Corpus de entrenamiento muy pequeño (36,5M de tokens) y sin documentación de composición, lo que limita la calidad y generalidad del texto generado.
- Idiomas no declarados; no se garantiza un comportamiento correcto en castellano ni en ningún otro idioma.
- Longitud de contexto no especificada; aunque la memoria es O(1) en secuencia, no se documenta el rango efectivo de dependencias.
- Riesgo elevado de alucinación y de texto incoherente por escala y datos; no apto para producción sin validación exhaustiva.
- Sesgos desconocidos: no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia MIT: permite uso comercial, pero al no haber pesos publicados ni garantías de calidad, su aplicabilidad práctica es limitada.
- Dependencia de AVX2/FMA para el rendimiento declarado; en CPUs sin estas extensiones el throughput sería previsiblemente mucho menor (no cuantificado).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/SRSN-24M
- Repositorio GitHub: https://github.com/DuoNeural/SRSN
- Preprint (v0.1, alojado en el repositorio GitHub): https://github.com/DuoNeural/SRSN
- Cita: Caldwell, Jesse; Aura; Archon. "SRSN: Symplectic Recurrent State Networks via Port-Hamiltonian Dynamics with Native AVX2 Analytical Adjoint Kernels". DuoNeural AI Laboratory Preprint, 2026.
