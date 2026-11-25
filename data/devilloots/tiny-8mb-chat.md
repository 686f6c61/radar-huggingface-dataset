# devilloots/tiny-8mb-chat

## Resumen

Tiny8MB Chat es un modelo de lenguaje de tipo decoder-only Transformer desarrollado por el usuario devilloots y publicado en Hugging Face bajo licencia MIT. Con tan solo 3.868.928 parametros (embedding con pesos atados) y un checkpoint de aproximadamente 9,85 MB en FP16, se presenta como un experimento de entrenamiento desde cero orientado a demostrar que es posible obtener un modelo conversacional minimo con recursos muy limitados: fue entrenado en dos GPUs Tesla T4 en 53,5 segundos en total.

La arquitectura incorpora componentes propios de modelos modernos de mayor escala, como RMSNorm, SwiGLU, Grouped-Query Attention (8 cabezas de consulta y 2 de clave/valor) y RoPE, junto con un tokenizador BPE de 4096 tokens. El entrenamiento se dividio en dos fases: una pre-entrenamiento mixto con TinyStories y Alpaca Q&A (6,91 millones de tokens, 480 pasos, perdida final 2,655) y un ajuste supervisado suave con recuperacion de contexto (11.358 ejemplos, 350 pasos, perdida final 2,390).

Su relevancia es fundamentalmente didactica y de investigacion: sirve como banco de pruebas reproducible para estudiar el comportamiento de tecnicas modernas de arquitectura en un regimen de parametros extremadamente bajo, y como ejemplo de pipeline completo de entrenamiento (tokenizacion, pre-entrenamiento, SFT) ejecutable en hardware modesto. No esta pensado para cargas de produccion reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RMSNorm + SwiGLU + GQA + RoPE) |
| Parametros totales | 3.868.928 (embeddings con pesos atados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens (`block_size=192`) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP16, ~9,85 MB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only de 4 capas con `d_model=256`, `mlp_dim=704` y `block_size=192`. Emplea RMSNorm como normalizacion, SwiGLU como funcion de activacion en el bloque feed-forward, Grouped-Query Attention con 8 cabezas de consulta y 2 cabezas de clave/valor (ratio 4:1) y codificacion posicional rotatoria (RoPE). Los embeddings de entrada y la cabeza de salida comparten pesos, lo que reduce el recuento total de parametros. El tokenizador es un BPE de 4096 tokens (`bpe_4096.json`).

El entrenamiento se ejecuto desde cero en 2 GPUs Tesla T4. La fase 1 (pre-entrenamiento mixto) uso 6,91 millones de tokens combinando TinyStories y Alpaca Q&A, con 480 pasos en 30,7 segundos y una perdida final de 2,655. La fase 2 (SFT suave con recuperacion de contexto) uso 11.358 ejemplos durante 350 pasos en 21,0 segundos, alcanzando una perdida final de 2,390. No se documentan en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional basica, entrenada sobre pares de pregunta-respuesta de Alpaca.
- Generacion de texto narrativo simple, gracias a la inclusion de TinyStories en el pre-entrenamiento.
- Recuperacion de contexto dentro de la ventana de 192 tokens (fase 2 orientada explicitamente a ello).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el corpus de entrenamiento (TinyStories y Alpaca) es predominantemente en ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Docencia y divulgacion de arquitecturas Transformer: el modelo permite recorrer de principio a fin un pipeline de pre-entrenamiento y SFT con componentes modernos (GQA, SwiGLU, RoPE) en menos de un minuto de computo en GPUs consumer, lo que lo hace idoneo para talleres practicos.
- Reproduccion de experimentos de investigacion: al estar entrenado desde cero y con hiperparametros documentados, sirve como linea base controlada para estudiar el efecto de cambios en tokenizador, atencion o activacion a escala minima.
- Pruebas de infraestructura de inferencia: su tamano (~10 MB en FP16) permite validar rapidamente pipelines de despliegue, scripts de carga de checkpoints PyTorch o integraciones con frameworks antes de escalar a modelos mayores.
- Generacion de cuentos cortos y texto narrativo simple: el entrenamiento con TinyStories lo hace adecuado para producir micro-relatos dentro de la ventana de 192 tokens, util en demos de generacion de texto.
- Prototipado de asistentes conversacionales minimos: puede emplearse para validar interfaces de chat y flujos de pregunta-respuesta en entornos de prueba, sin coste de inferencia significativo.
- Educacion sobre limitaciones de los LLM: sirve para demostrar de forma tangible como el tamano, el contexto y los datos de entrenamiento condicionan la coherencia, la factualidad y la capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta las perdidas finales de entrenamiento (2,655 en la fase 1 y 2,390 en la fase 2), que no son comparables con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16; el checkpoint ocupa ~9,85 MB y el estado de inferencia es minimo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el propio entrenamiento se realizo en 2x Tesla T4.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: la libreria indicada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos en GGUF no hay una ruta directa a llama.cpp sin conversion.
- Latencia y throughput: no disponibles; por el tamano del modelo se espera una latencia muy baja, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales en la informacion proporcionada. A modo de referencia estructural, se comparan caracteristicas conocidas de modelos de escala minima:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Tiny8MB Chat (devilloots) | 3,87 M | 192 | MIT | PyTorch `.pt` |
| Modelos tipo TinyStories (p. ej. variantes de 1-10 M) | ~1-10 M | variable | variable | variable |
| Modelos tipo SmolLM-135M | 135 M | 2048 | Apache 2.0 | safetensors, GGUF |

La comparacion de rendimiento con alternativas no esta disponible.

## Limitaciones y advertencias

- Capacidad muy limitada: con 3,87 M de parametros y 4 capas, la coherencia, el razonamiento y la factualidad son muy reducidos; no es apto para tareas de produccion.
- Ventana de contexto de solo 192 tokens, insuficiente para conversaciones largas o documentos.
- Riesgo elevado de alucinacion y de generar respuestas plausibles pero incorrectas, agravado por el corpus de entrenamiento (TinyStories y Alpaca).
- Sesgos potenciales heredados de TinyStories y Alpaca; no se documenta ninguna evaluacion de sesgo.
- Idiomas: no se declaran idiomas soportados; el entrenamiento parece centrado en ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Licencia MIT: permite uso comercial, pero el modelo no ofrece garantias de calidad ni de idoneidad para ningun fin.
- No se publican pesos en formatos estandar de inferencia (GGUF, safetensors) ni se documenta compatibilidad con servidores de inferencia habituales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devilloots/tiny-8mb-chat
- TinyStories (dataset de referencia): https://huggingface.co/datasets/roneneldan/TinyStories
- Alpaca (dataset de referencia): https://github.com/tatsu-lab/stanford_alpaca
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.
