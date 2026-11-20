# CladeTeam/CENO-600M-A230M-1m

## Resumen

CENO-600M-A230M-1m es un modelo fundacional de lenguaje de ADN desarrollado por CladeTeam, concebido como un modelo causal de generación sobre secuencias genómicas. Se trata del checkpoint de extensión de contexto largo (1.048.576 tokens) de la familia CENO de 600M de parámetros, construido sobre una arquitectura híbrida Mamba / Attention / Mixture-of-Experts inspirada en Nemotron-H de NVIDIA. El modelo no requiere alineamiento múltiple de secuencias (MSA) como entrada, lo que simplifica su uso frente a aproximaciones genómicas más clásicas.

El modelo cuenta con 630,8 millones de parámetros totales con 8 expertos MoE y activación top-2 por token, 20 capas ocultas, tamaño oculto de 1024 y 16 cabezas de atención. Su tokenizador es a nivel de carácter (byte/ASCII) con un vocabulario de solo 512 entradas, mapeando directamente las bases de ADN a sus códigos ASCII. Esta elección de tokenización evita problemas de vocabulario específico del dominio y facilita el procesamiento directo de secuencias nucleotídicas.

La relevancia de este checkpoint radica en su ventana de contexto efectiva extremadamente larga (1M de tokens) combinada con un backbone híbrido sin ventana de contexto fija declarada, lo que lo hace adecuado para tareas genómicas que requieren modelar dependencias a gran escala, como la generación de secuencias largas, la extracción de embeddings genómicos y la adaptación a tareas downstream mediante fine-tuning o probing. Su licencia Apache-2.0 facilita su uso comercial e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 630.794.080 (630,8M) |
| Parametros activos | Top-2 de 8 expertos por token (no se especifica el recuento activo exacto) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento (sin ventana fija declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,3 GB), código empaquetado con `trust_remote_code=True` |

| Parametro adicional | Valor |
|---|---|
| Capas ocultas | 20 |
| Tamano oculto | 1024 |
| Cabezas de atencion | 16 |
| Tamano intermedio | 4096 |
| Expertos MoE | 8 (top-2 por token) |
| Vocabulario | 512 (byte / carácter) |
| Precision | bfloat16 |
| `model_type` | `ceno` |
| Clase | `CENOForCausalLM` |
| Tokenizador | `CENOCharLevelTokenizer` |
| Hardware requerido | GPU CUDA (kernels Mamba) para forward/generación |

## Arquitectura y entrenamiento

El modelo emplea un backbone híbrido que combina capas Mamba (modelos de espacio de estados), capas de atención y capas de mezcla de expertos (MoE), siguiendo la arquitectura Nemotron-H de NVIDIA. Esta combinación busca eficiencia en secuencias largas (Mamba) junto con la capacidad de modelado selectivo de la atención, mientras que la MoE con 8 expertos y enrutamiento top-2 reduce el coste computacional por token manteniendo capacidad. El tokenizador es a nivel de carácter, mapeando cada base de ADN a su código ASCII, con un vocabulario de 512 entradas.

Este checkpoint corresponde a la etapa 4 del entrenamiento (extensión de contexto largo) de la familia CENO, entrenado con una longitud de secuencia de 1.048.576 tokens. No se dispone en la información proporcionada de detalles sobre el número total de tokens de entrenamiento, la composición del dataset genómico, ni si se aplicaron técnicas de RLHF/DPO. El modelo no requiere entradas de alineamiento múltiple de secuencias (MSA). La implementación de referencia está derivada de la implementación de Nemotron-H en Hugging Face y el tokenizador del `CharLevelTokenizer` de Evo2 (Arc Institute), ambos bajo Apache-2.0.

## Capacidades

- Generación de secuencias genómicas de ADN de forma autorregresiva (modelo causal de lenguaje sobre nucleótidos).
- Extracción de embeddings genómicos para tareas downstream (probe, clasificación, etc.).
- Adaptación mediante fine-tuning a tareas genómicas específicas.
- Modelado de dependencias de largo alcance gracias a su contexto de entrenamiento de 1M de tokens y a un backbone sin ventana fija declarada.
- Procesamiento directo de secuencias de ADN mediante tokenización a nivel de carácter (sin vocabulario biológico especializado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable (modelo de secuencias de ADN).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Generación de secuencias genómicas: el modelo puede generar tramos de ADN de forma autorregresiva, útil para tareas de diseño de secuencias o exploración de regiones genómicas, aprovechando su tokenización a nivel de base y su contexto de 1M de tokens.
- Extracción de embeddings para genómica: se pueden obtener representaciones vectoriales de secuencias de ADN para alimentar clasificadores downstream (por ejemplo, predicción de regiones regulatorias) mediante probing sobre las activaciones del modelo.
- Fine-tuning para tareas genómicas específicas: al ser un checkpoint base, es el punto de partida para adaptar el modelo a tareas como anotación funcional o predicción de elementos genómicos mediante ajuste supervisado.
- Modelado de contextos genómicos largos: gracias a su entrenamiento con secuencias de hasta 1.048.576 tokens, es adecuado para tareas que requieren capturar dependencias a gran escala en el genoma, como el modelado de dominios topológicos o regiones cromosómicas extensas.
- Investigación en modelos de lenguaje de ADN: sirve como base para estudiar el comportamiento de arquitecturas híbridas Mamba/MoE en dominios biológicos y comparar con modelos de atención pura.
- Punto de partida para pipelines de predicción de efectos de variantes (VEP): aunque la model card indica que los checkpoints con prefijo `CENO-P-*` son los orientados a VEP, este checkpoint base puede emplearse para adaptación o para construir dichos pipelines mediante delta de log-verosimilitud entre secuencia wild-type y variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 630,8M de parámetros en bfloat16, lo que supone aproximadamente 1,26 GB solo para los pesos. Con overhead de activaciones y kernels, se estima un uso de VRAM de unos 2-4 GB en bfloat16, aunque no se dispone de cifras oficiales.
- GPU recomendadas: se requiere una GPU CUDA para forward y generación, ya que las capas Mamba necesitan kernels CUDA (mamba-ssm, causal-conv1d). No se especifican modelos concretos; cualquier GPU CUDA compatible con dichos kernels debería ser suficiente.
- Cabe en GPU consumer: sí, por tamaño de parámetros (630,8M) es previsible que quepa en GPU consumer con suficiente VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (ruta de precisión single-GPU, sin padding, con un máximo de 131.072 tokens por prefill); el repositorio incluye una entrada vLLM para prefills mayores. Entorno probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-600M-A230M-1m | 630,8M | 1.048.576 tokens (entrenamiento) | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face (CladeTeam) |
| Evo2 (Arc Institute) | no disponible en la informacion | no disponible | no disponible | Apache-2.0 (tokenizador derivado) | no disponible |
| Nemotron-H (NVIDIA) | no disponible en la informacion | no disponible | Híbrida Mamba/Attention/MoE | Apache-2.0 (código base) | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un checkpoint base de lenguaje de ADN; no está orientado a conversación ni a lenguaje natural, por lo que no debe evaluarse con benchmarks de NLP convencionales.
- Requiere GPU CUDA para forward y generación debido a los kernels Mamba; la carga de configuración, tokenizador y pesos es segura en CPU, pero la inferencia no.
- La ruta de precisión de Hugging Face es single-GPU, sin padding y con un máximo de 131.072 tokens por prefill; para prefills mayores debe usarse la entrada vLLM del repositorio.
- La corrección numérica no garantiza generaciones libres de repeticiones ni biológicamente funcionales, según advierte la propia model card.
- No se dispone de información sobre sesgos, riesgo de alucinación en el sentido biológico, ni evaluación de calidad de las secuencias generadas.
- La licencia Apache-2.0 permite uso comercial, pero el código empaquetado deriva de Nemotron-H (NVIDIA) y del tokenizador de Evo2 (Arc Institute); deben respetarse las atribuciones indicadas en los archivos `LICENSE` y `NOTICE`.
- No se especifican tipos de cuantización soportados ni idiomas, por lo que el despliegue en entornos con requisitos de cuantización no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-600M-A230M-1m
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Implementación de referencia Nemotron-H (NVIDIA, Hugging Face): no disponible como enlace directo en la información
- Tokenizador Evo2 (Arc Institute): no disponible como enlace directo en la información
