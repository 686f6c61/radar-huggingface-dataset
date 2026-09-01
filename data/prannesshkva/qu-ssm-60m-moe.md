# Prannesshkva/QU-SSM-60M-MoE

## Resumen

QU-SSM-60M-MoE es un modelo fundacional de lenguaje de 64,3 millones de parámetros desarrollado por Prannessh KVA, que combina una recurrencia de espacio de estados cuasi-unitaria basada en grupos de Lie continuos (SO(N) ≅ SU(2)) con una arquitectura de mezcla de expertos (Mixture-of-Experts, MoE) dispersa con 4 expertos SwiGLU y enrutamiento Top-2. El modelo está entrenado nativamente en hardware Google Cloud TPU v5e sobre el dataset TinyStories, y su principal innovación técnica es eliminar la disipación exponencial de memoria que presentan los SSM reales clásicos como Mamba-1/2, manteniendo un coste de memoria por paso estrictamente constante O(1) durante la generación autoregresiva.

El modelo está diseñado como una prueba de concepto académica y de investigación, no como un producto listo para producción. Su relevancia radica en demostrar que es posible combinar recurrencias unitarias continuas (que preservan la norma de forma estricta) con sparse MoE, logrando una retención de memoria a largo plazo verificada empíricamente del 101,7% en expansiones de contexto de 32x, sin sufrir problemas de desvanecimiento de gradientes. Con una ventana de contexto no documentada explícitamente, pero con una memoria de estado de 0,19 MB por paso, el modelo se posiciona como un banco de pruebas para arquitecturas eficientes en memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM cuasi-unitario con recurrencia continua SO(N) + MoE disperso (SwiGLU, 4 expertos, Top-2) |
| Parametros totales | 64.296.576 (64,30 M) |
| Parametros activos | 44,64 M (Top-2 de 4 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina una capa de espacio de estados recurrente con una capa de mezcla de expertos. La recurrencia se define como h_t = γ_t · R(θ_t) · h_{t-1} + u_t, donde R(θ_t) es una matriz de rotación unitaria de 2x2 (SO(2)) con un ángulo de fase dinámico dependiente de la entrada: θ_t = W_θ · x_t + θ_base. Esta rotación preserva estrictamente la norma (‖R(θ_t)‖₂ = 1,00000). El factor γ_t es una puerta de olvido desacoplada, calculada como γ_t = σ(W_γ · x_t + b_γ), que modula la memoria de forma independiente. La salida del estado pasa por una proyección de lectura con puerta SiLU y conexión residual.

El componente MoE utiliza 4 expertos SwiGLU con dimensión oculta 768 y activa los 2 mejores por token (k=2). El modelo tiene 6 capas, dimensión oculta 384, dimensión de estado SSM N=8 y vocabulario de 50.257 tokens (BPE de GPT-2). El algoritmo de escaneo es un "Exact Continuous Prefix Scan" con complejidad S + iΦ. No se ha publicado información sobre el número total de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO. El entrenamiento se realizó en TPU v5e, aunque no se especifican detalles del proceso de optimización.

## Capacidades

- Generación de texto causal en inglés, con capacidad de completar historias y texto narrativo simple.
- Razonamiento sintáctico y de sentido común básico: el autor reporta una precisión del 75,0% en una batería de razonamiento zero-shot.
- Retención de memoria a largo plazo: verificación empírica de retención de norma del 101,7% para secuencias de longitud 64 a 2048, lo que indica ausencia de desvanecimiento de gradientes en expansiones de contexto de 32x.
- Inferencia con memoria de estado constante de 0,19 MB por paso, independiente de la longitud de la secuencia.
- No se documenta soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- Capacidad multilingüe limitada: el modelo solo ha sido entrenado con datos en inglés (TinyStories).

## Casos de uso

- Investigación académica en arquitecturas de SSM: el modelo sirve como banco de pruebas para estudiar el comportamiento de recurrencias unitarias continuas, la retención de memoria a largo plazo y la interacción con sparse MoE. Los investigadores pueden reproducir los experimentos reportados y comparar con Mamba-1/2.
- Prototipado rápido de generación de texto: por su tamaño reducido (64 M parámetros), es adecuado para entornos de desarrollo donde se necesita un modelo causal pequeño que pueda ejecutarse en CPU o GPU de gama baja sin requisitos especiales.
- Generación de historias cortas y narrativa infantil: al estar entrenado exclusivamente en TinyStories, el modelo es capaz de producir cuentos simples y coherentes en inglés, útil para aplicaciones educativas o de entretenimiento infantil.
- Educación y demostración de arquitecturas eficientes: sirve como ejemplo didáctico para explicar conceptos como SSM, MoE, unitariedad y memoria O(1) en clases de aprendizaje automático o talleres prácticos.
- Evaluación comparativa de eficiencia de memoria: permite medir el coste de memoria por paso en generación autoregresiva frente a modelos transformer del mismo tamaño, gracias a su estado constante de 0,19 MB.
- Experimentación con adaptación de dominio: al ser un modelo pequeño y de licencia Apache 2.0, se puede fine-tunear para dominios específicos (por ejemplo, textos técnicos simples) con recursos computacionales limitados, aunque su capacidad está restringida por el tamaño.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. Los datos disponibles provienen de telemetría propia del autor, medida en TPU v5e:

| Metrica | Valor |
|---|---|
| Retencion de norma a largo plazo (L=64 a 2048) | 101,7% |
| Loss NLL de validacion | 4,3440 |
| Perplejidad de validacion | 77,01 |
| Precision en bateria de razonamiento (zero-shot) | 75,0% |
| Memoria por paso de inferencia | 0,19 MB |

Estas métricas no son directamente comparables con benchmarks estándar de la industria y deben interpretarse como indicadores internos del autor.

## Requisitos de hardware

- VRAM estimada: con 64,3 M de parámetros, el modelo en FP32 ocupa aproximadamente 257 MB. En cuantización FP16 o BF16, alrededor de 129 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas o de gama baja.
- GPU recomendadas: cualquier GPU moderna (desde NVIDIA GTX 1650 en adelante) puede ejecutar el modelo sin problemas. No requiere GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, es perfectamente viable en GPUs de consumo como RTX 3060, RTX 4060 o incluso en CPU.
- Opciones de despliegue: al ser un modelo causal con integración en Transformers (requiere `trust_remote_code=True`), se puede ejecutar con la biblioteca `transformers` de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, aunque por su tamaño podría adaptarse con esfuerzo.
- Latencia y throughput: no se han publicado datos de latencia o throughput. Dado el tamaño, se espera una generación muy rápida en GPU moderna (típicamente >100 tokens/s), pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con modelos de la misma categoría. El modelo es una propuesta de investigación única que combina SSM cuasi-unitario y MoE, sin equivalentes comerciales directos. Como referencia conceptual, se puede comparar con Mamba-1 y Mamba-2 (SSMs reales) en términos de retención de memoria, pero no se tienen datos públicos de rendimiento de estos modelos en las mismas condiciones. La comparativa queda pendiente de futuras publicaciones.

## Limitaciones y advertencias

- Entrenado exclusivamente en TinyStories: el modelo solo conoce un dominio muy restringido de texto (historias infantiles simples). Su capacidad de generalización a otros dominios es extremadamente limitada.
- Solo soporta inglés: no se ha entrenado con otros idiomas, por lo que no es adecuado para tareas multilingües.
- Tamaño muy reducido: con 64 M de parámetros, su capacidad de razonamiento complejo, codificación o matemáticas es prácticamente nula. No debe utilizarse en aplicaciones que requieran precisión o conocimiento factual.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido plausible pero incorrecto, especialmente fuera del dominio de entrenamiento.
- Sesgos no documentados: no se han realizado estudios de sesgos. El dataset TinyStories puede contener sesgos culturales o de género no analizados.
- Naturaleza experimental: el modelo es una prueba de concepto. No hay garantías de estabilidad, reproducibilidad ni soporte a largo plazo.
- Dependencia de código personalizado: para cargar el modelo se requiere `trust_remote_code=True`, lo que implica ejecutar código del autor no auditado. Se recomienda revisar el código antes de usarlo en entornos de producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte. El usuario asume toda la responsabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Prannesshkva/QU-SSM-60M-MoE
- Perfil del autor en Hugging Face: https://huggingface.co/Prannesshkva
- GitHub del autor: https://github.com/prannesshkva
- Portafolio del autor: https://prannesshkva.vercel.app/projects.html
