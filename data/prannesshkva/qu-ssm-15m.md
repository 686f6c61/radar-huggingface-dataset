# Prannesshkva/QU-SSM-15M

## Resumen

QU-SSM-15M es un modelo de lenguaje causal basado en State Space Models (SSM) desarrollado por Prannessh K.V.A. Su principal contribución teórica es la eliminación de la disipación contractiva de Hurwitz que afecta a las recurrencias lineales de los SSM convencionales, parametrizando las transiciones en el grupo de Lie SO(N) mediante la transformación de Cayley. Esto permite que la norma del estado recurrente se mantenga estrictamente acotada incluso con secuencias largas, evitando el colapso de estado típico en modelos como S4 o Mamba bajo ciertas condiciones.

El modelo cuenta con 6 capas, d_model=256, d_state=16 y d_ff=768, y fue preentrenado desde cero durante 7.000 pasos (3 épocas) en una GPU Tesla P100 con datos sintéticos conversacionales y educativos. Aunque la model card declara 16,9 millones de parámetros, los pesos en safetensors suman 29.778.784 parámetros; esta discrepancia puede deberse a la inclusión de embeddings y cabeceras de salida. El modelo está pensado como una prueba de concepto académica para validar la estabilidad de recurrencias unitarias en SSM, no como un sistema listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State Space Model (SSM) con recurrencia cuasi-unitaria SO(N) vía transformación de Cayley y gating dinámico de olvido |
| Parametros totales | 29.778.784 (según safetensors); 16.907.872 declarados en la model card |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (probado en benchmarks NIAH; no hay especificación oficial) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Business Source License 1.1 (BSL 1.1) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de QU-SSM se basa en una recurrencia lineal donde la matriz de transición es un operador unitario construido a partir de un generador skew-simétrico H = W - W^T perteneciente al álgebra de Lie so(N). La matriz unitaria U se obtiene mediante la transformación de Cayley: U = (I - H/2)^{-1}(I + H/2), lo que garantiza que su norma es exactamente 1. La recurrencia resultante es h_t = γ_t · (U_t h_{t-1}) + σ(Δ_t) · (x_t ⊗ B_t), donde γ_t es un gate de olvido dinámico con valores en (0,1]. Este diseño elimina la disipación contractiva que hace que la norma del estado decaiga exponencialmente en SSM estándar.

El cálculo de la recurrencia se realiza mediante un scan paralelo causal basado en FFT 1D, con complejidad O(L log L), lo que permitió alcanzar un throughput de 24.000 tokens por segundo durante el entrenamiento en una Tesla P100. El entrenamiento se llevó a cabo durante 7.000 pasos con 3 épocas sobre un dataset sintético de texto conversacional y educativo, reduciendo la pérdida de entropía cruzada de 216,61 a 4,6196 (una reducción del 97,9%). No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto causal en inglés, con soporte para completar frases y generar secuencias cortas mediante muestreo autoregresivo.
- Estabilidad de la norma del estado recurrente en secuencias de hasta 16.384 tokens, sin colapso de norma ni explosión de gradientes, gracias a la parametrización unitaria.
- Inferencia eficiente en términos de memoria y cómputo gracias al scan FFT paralelo, que permite procesar secuencias largas con un coste logarítmico.
- No dispone de tool calling, function calling, capacidades multimodales, visión ni modo de razonamiento explícito.
- El modelo es multilingüe solo en la medida en que el tokenizador y los datos de entrenamiento (en inglés) lo permitan; no se reportan pruebas en otros idiomas.

## Casos de uso

- Investigación académica sobre estabilidad de recurrencias en SSM: el modelo sirve como banco de pruebas para validar teóricamente que las rotaciones unitarias SO(N) evitan el colapso de estado, útil para comparar con Mamba o S4 en entornos de laboratorio.
- Prototipado de arquitecturas de estado espacio-tiempo en entornos con recursos limitados: su tamaño reducido (menos de 30M parámetros) permite ejecutar experimentos de ablación y análisis de comportamiento en portátiles con GPU básicas o incluso en CPU.
- Generación de texto simple en inglés para aplicaciones educativas o de demostración, como asistentes de vocabulario o generadores de historias cortas en un nivel de lectura escolar (entrenado con TinyStories).
- Evaluación de técnicas de paralelización con FFT en recurrencias causales: el código puede servir como referencia para implementar scans paralelos en otros modelos, dado que el autor publica el código fuente con la licencia BSL 1.1.
- Enseñanza de conceptos de álgebra de Lie y transformaciones de Cayley aplicadas a deep learning: el modelo es un ejemplo concreto y ejecutable para cursos de arquitecturas avanzadas.
- Pruebas de inferencia en dispositivos de baja potencia (Raspberry Pi, teléfonos móviles) gracias a su pequeño tamaño y a la ausencia de atención cuadrática, aunque requeriría convertir los pesos a formatos como GGUF o ONNX, lo que no está disponible actualmente.

## Benchmarks y rendimiento

La model card reporta dos conjuntos de resultados. El primero es un benchmark de aguja en el pajar (NIAH) que mide la norma del estado recurrente a distintas profundidades y longitudes de contexto:

| Longitud de contexto | Profundidades probadas | Norma del estado (\|\|h\|\|) | Estado |
|---|---|---|---|
| 1.024 tokens | 10%, 30%, 50%, 70%, 90% | 4,7699 | Estable, sin colapso |
| 2.048 tokens | 10%, 30%, 50%, 70%, 90% | 5,2679 | Estable, sin colapso |
| 4.096 tokens | 10%, 30%, 50%, 70%, 90% | 4,7914 | Estable, sin colapso |
| 8.192 tokens | 10%, 30%, 50%, 70%, 90% | 4,7578 | Estable, sin colapso |
| 16.384 tokens | 10%, 30%, 50%, 70%, 90% | 4,8636 | Estable, sin colapso |

El segundo conjunto evalúa la perplejidad en datos dentro y fuera de distribución:

| Split | Dataset | Entropía cruzada (NLL) | Perplejidad (PPL) |
|---|---|---|---|
| In-distribution | Sintético conversacional y educativo (validación) | 4,6196 | 101,5 |
| Out-of-distribution | WikiText-2 (test) | 9,0166 | 8.238,5 |

No se han publicado resultados comparativos con otros modelos (p. ej., Mamba-15M, RWKV-15M) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 29,8M parámetros en fp32, el peso ocupa aproximadamente 119 MB; en fp16 serían ~60 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM e incluso en memoria RAM de un portátil.
- GPU recomendadas: cualquier GPU con soporte CUDA (desde GTX 1050 hasta RTX 4090) o incluso CPU para inferencia lenta. El entrenamiento se realizó en una Tesla P100 (16 GB).
- El modelo es adecuado para dispositivos de borde y entornos de bajos recursos, aunque no se proporcionan archivos cuantizados (GGUF, GPTQ) ni ONNX.
- Opciones de despliegue: mediante Hugging Face Transformers con `trust_remote_code=True` (requiere código personalizado). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: durante el entrenamiento se alcanzaron 24.000 tokens/segundo en P100 con el scan FFT; en inferencia el throughput será similar o superior, aunque no se reportan cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos de la misma categoría (SSM pequeños como Mamba-15M, RWKV-15M o S4-mini) en la información proporcionada. No se han publicado resultados estandarizados como MMLU, HumanEval o GSM8K para QU-SSM-15M, por lo que no es posible realizar una comparación cuantitativa objetiva.

## Limitaciones y advertencias

- Licencia BSL 1.1: no es una licencia open source convencional. Permite uso no comercial y académico, pero restringe el uso comercial hasta que se cumplan las condiciones de cambio (change date). Cualquier despliegue en producción requiere revisión legal.
- Entrenamiento en datos sintéticos de nivel escolar (TinyStories y similares): el modelo tiene un vocabulario limitado y una perplejidad muy alta (8.238) en texto adulto enciclopédico como WikiText-2. No es adecuado para tareas que requieran conocimiento general o registro formal.
- Discrepancia en el número de parámetros: la model card declara 16,9M mientras que los safetensors contienen 29,8M. Esta inconsistencia puede deberse a la inclusión de embeddings o capas de salida y debe aclararse antes de usar el modelo en experimentos que dependan del conteo exacto.
- Requiere `trust_remote_code=True` al cargar, lo que implica ejecutar código arbitrario del autor. Se recomienda auditar el código antes de usarlo en entornos seguros.
- No se han evaluado sesgos, alucinaciones ni comportamientos tóxicos; los datos sintéticos reducen la exposición a contenido dañino pero también limitan la generalización.
- El modelo no soporta tool calling, agentes ni razonamiento multi-step; es exclusivamente un generador de texto causal.
- No hay garantías de soporte ni mantenimiento; es un proyecto de investigación individual con una única versión publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prannesshkva/QU-SSM-15M
- Studio interactivo: https://huggingface.co/spaces/Prannesshkva/QU-SSM-Studio
- Registro Zenodo con DOI: https://doi.org/10.5281/zenodo.22177118
- Perfil del autor en GitHub: https://github.com/prannesshkva
- Página personal del autor: https://prannesshkva.vercel.app/index.html
