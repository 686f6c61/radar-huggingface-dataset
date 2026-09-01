# Prannesshkva/QU-SSM-130M-MoE

## Resumen

QU-SSM-130M-MoE es un modelo de lenguaje fundacional de 134,89 millones de parámetros desarrollado por Prannessh K.V.A. (usuario Prannesshkva en Hugging Face), que combina una recurrencia unitaria de grupo de Lie continuo (SO(N) ≅ SU(2)) con una arquitectura de mezcla de expertos (MoE) dispersa con 8 expertos y enrutamiento top-2. El modelo está entrenado nativamente en hardware Google Cloud TPU v5e y su objetivo principal es superar la limitación de disipación de memoria exponencial que presentan los SSM reales clásicos como Mamba-1/2, manteniendo un coste de memoria estrictamente constante O(1) durante la generación autorregresiva.

El modelo utiliza una recurrencia con ángulos de fase dinámicos dependientes de la entrada, a diferencia de los SSM complejos previos que usaban ángulos estáticos, y un mecanismo de amortiguación de memoria desacoplado mediante una puerta de olvido independiente. Está entrenado sobre el dataset TinyStories de Ronen Eldan, orientado a la generación de historias cortas en inglés, y se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors. Su relevancia radica en ser una propuesta experimental que combina eficiencia lineal con preservación estricta de la norma unitaria, lo que lo hace interesante para investigación en arquitecturas de estado espacio (SSM) de próxima generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM cuasi-unitario con recurrencia de grupo de Lie continuo (SO(2) dinámico) + MoE disperso SwiGLU (8 expertos, top-2) |
| Parametros totales | 134.893.056 (134,89 M) |
| Parametros activos | 78,27 M |
| Longitud de contexto | No especificada explícitamente; probado hasta 2048 tokens (long-horizon norm retention L=64 a 2048) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una recurrencia de estado definida como h_t = γ_t · R(θ_t) · h_{t-1} + u_t, donde R(θ_t) es una matriz de rotación SO(2) con ángulo θ_t generado dinámicamente a partir de la entrada (θ_t = W_θ · x_t + θ_base). Esta rotación preserva estrictamente la norma (‖R(θ_t)‖₂ = 1,0), lo que evita la disipación exponencial de memoria que sufren los SSM reales. El factor γ_t es una puerta de olvido independiente calculada con una sigmoide (γ_t = σ(W_γ · x_t + b_γ)), permitiendo un control explícito de la amortiguación de memoria. La salida SSM pasa por una proyección de lectura con puerta SiLU y conexión residual.

La capa MoE utiliza 8 expertos SwiGLU con dimensión feed-forward de 1024 y activa los 2 mejores por token (top-2). La dimensión oculta del modelo es 512, con 6 capas y estado SSM de dimensión 8. El vocabulario usa el tokenizador BPE de GPT-2 (50.257 tokens). El algoritmo de scan es un "Exact Continuous Prefix Scan (S + iΦ)" que procesa la secuencia completa de forma paralela. El entrenamiento se realizó sobre TinyStories, un dataset de historias cortas en inglés, aunque no se especifica el número total de tokens ni si se usaron técnicas de alineación como RLHF o DPO. La implementación requiere código personalizado (trust_remote_code=True) y no es compatible con la API estándar de Transformers sin ese ajuste.

## Capacidades

- Generación de texto causal en inglés, especialmente historias cortas y narrativas simples (entrenado en TinyStories).
- Razonamiento sintáctico y de sentido común básico: la batería de pruebas reporta una precisión del 75,0% en tareas zero-shot de sondeo sintáctico y de sentido común.
- Preservación de información a largo plazo: retiene el 98,7% de la norma de estado en secuencias de 64 a 2048 tokens, demostrando ausencia de gradientes desvanecidos en expansión de contexto de 32x.
- Memoria de inferencia constante: usa 0,19 MB de memoria de estado por paso, independiente de la longitud de secuencia (O(1)).
- Eficiencia de parámetros: solo 78,27 M de parámetros activos por token gracias al enrutamiento top-2 de expertos.
- No se reportan capacidades de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Generación de historias cortas para niños: el modelo está entrenado específicamente en TinyStories, por lo que puede generar narrativas coherentes y gramaticalmente simples adecuadas para lectores jóvenes o para aumentar datasets educativos.
- Prototipado de arquitecturas SSM eficientes: investigadores pueden usar este modelo como referencia para estudiar el comportamiento de recurrencias unitarias dinámicas con MoE, especialmente en lo relativo a retención de memoria a largo plazo.
- Evaluación de eficiencia en dispositivos con memoria limitada: su memoria de estado constante de 0,19 MB permite desplegarlo en entornos embebidos o de edge computing donde la memoria de activaciones es un cuello de botella.
- Investigación en modelos de lenguaje sub-200M: sirve como punto de comparación para estudiar el rendimiento de arquitecturas lineales frente a transformers del mismo tamaño en tareas de generación.
- Generación de texto en inglés con baja latencia: al ser un modelo pequeño con solo 6 capas y 78 M de parámetros activos, puede ejecutarse en CPU o GPU de gama baja para aplicaciones de respuesta en tiempo real.
- Experimentación académica sobre regularización de norma y estabilidad de entrenamiento: su diseño con rotaciones unitarias estrictas ofrece un caso de estudio para validar teorías sobre desvanecimiento de gradientes en SSM profundos.

## Benchmarks y rendimiento

La model card del autor reporta las siguientes métricas, medidas en Google Cloud TPU v5e:

| Métrica | Valor |
|---|---|
| Long-Horizon Norm Retention (L=64 a 2048) | 98,7% |
| Validation NLL Loss | 4,2396 |
| Validation Perplexity (PPL) | 69,38 |
| Reasoning Battery Accuracy | 75,0% |
| Inference Step Memory | 0,19 MB |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval, GSM8K o HellaSwag en la información disponible. La perplexidad de 69,38 en validación es alta en comparación con modelos transformer del mismo tamaño entrenados en TinyStories, aunque la arquitectura es experimental y está orientada a eficiencia, no a máxima calidad lingüística.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 134,89 M de parámetros totales, en FP32 ocuparía aproximadamente 540 MB de pesos. Con cuantización a FP16 o BF16, ~270 MB; en INT8, ~135 MB. La memoria de estado adicional es insignificante (0,19 MB por paso). Cabe en cualquier GPU moderna con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer (NVIDIA GTX 10xx en adelante, RTX 20xx/30xx/40xx, AMD RX 6000/7000) puede ejecutar el modelo sin problemas. Incluso una Raspberry Pi 5 con 8 GB de RAM podría ejecutarlo en CPU con llama.cpp si existiera una conversión GGUF (no disponible actualmente).
- Entrenamiento: el modelo se entrenó en TPU v5e, pero no se especifican requisitos mínimos para reentrenamiento o fine-tuning.
- Opciones de despliegue: al ser un modelo con código personalizado (custom code), la forma principal de uso es mediante Hugging Face Transformers con `trust_remote_code=True`. No se ha publicado soporte para vLLM, Ollama, llama.cpp ni TGI en la información disponible.
- Latencia y throughput: no se han publicado mediciones de latencia ni throughput. Dado el tamaño y la arquitectura lineal, se espera una generación rápida en GPU, pero los datos concretos no están disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas del autor contra otros modelos. A continuación se presenta una comparación estructural basada en datos conocidos de modelos del mismo rango de tamaño, pero sin resultados de benchmarks directos:

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| QU-SSM-130M-MoE | 134,89 M (78,27 M activos) | No especificado (probado hasta 2048) | SSM unitario + MoE | Apache-2.0 |
| Mamba-130M | ~130 M | No especificado (típicamente 2048) | SSM selectivo | Apache-2.0 |
| GPT-2 Small | 124 M | 1024 | Transformer decoder | MIT |
| TinyStories-33M | 33 M | No especificado | Transformer | Apache-2.0 |

Nota: Mamba-130M y GPT-2 Small son modelos reales con licencias abiertas, pero los datos de contexto y rendimiento exactos pueden variar. No se ha encontrado ninguna comparativa directa entre QU-SSM y estos modelos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado exclusivamente sobre TinyStories, un dataset de historias infantiles en inglés, el modelo tiene un vocabulario y dominio limitados a narrativa simple. No es adecuado para tareas técnicas, científicas o de dominio abierto.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido factualmente incorrecto o incoherente, especialmente fuera del dominio de historias cortas.
- Limitaciones de contexto: la longitud de contexto máxima no está documentada formalmente; solo se ha probado hasta 2048 tokens. No se garantiza un comportamiento estable más allá de ese rango.
- Limitaciones de idioma: solo soporta inglés. No hay evidencia de capacidades multilingües.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero requiere atribución y no incluye cláusula de indemnización de patentes. Es necesario revisar los términos completos.
- Dependencia de código personalizado: el modelo requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código arbitrario del autor. Esto supone un riesgo de seguridad en entornos de producción y dificulta su integración en pipelines estándar.
- Madurez limitada: el modelo tiene 0 descargas y 0 likes en Hugging Face, no ha sido revisado por la comunidad ni validado de forma independiente. Las métricas reportadas provienen del propio autor y no han sido verificadas externamente.
- Rendimiento lingüístico bajo: la perplexidad de validación de 69,38 es alta, lo que indica una calidad de generación limitada incluso para el dominio de historias infantiles. No es recomendable para aplicaciones que requieran fluidez natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prannesshkva/QU-SSM-130M-MoE
- Perfil del autor en Hugging Face: https://huggingface.co/Prannesshkva
- GitHub del autor: https://github.com/prannesshkva
- Dataset de entrenamiento (TinyStories): https://huggingface.co/datasets/roneneldan/TinyStories
- Repositorio de Mamba (referencia de arquitectura SSM): https://github.com/state-spaces/mamba
- Otro modelo del autor (Ael-504M): https://huggingface.co/Prannesshkva/Ael-504M
