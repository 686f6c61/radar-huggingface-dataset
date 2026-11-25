# barozp/Ternary-Bonsai-2.5-27B-Uncensored-MTPLX-2bit

## Resumen

Ternary Bonsai 2.5 27B Uncensored MTPLX 2-bit es un empaquetado de pesos de un modelo multimodal (texto e imagen) de 27.359 millones de parámetros, derivado de Qwen3.8-27B de Alibaba Cloud y destilado por Prism ML en su familia Bonsai con cuantización ternaria. Sobre esa base, AtomicChat aplicó una edición de tipo abliteration que elimina la dirección de rechazo del modelo original, y el autor barozp lo ha reempaquetado para el runtime MTPLX (versión 2.13 o superior) en Apple Silicon, incorporando la cabeza de predicción multi-token (MTP) de Prism ML como modelo borrador para decodificación especulativa.

El interés técnico del paquete reside en tres elementos combinados: pesos ternarios con rotación (rotated ternary weights) que el runtime MTPLX ejecuta de forma nativa, una cabeza MTP de 4 bits con grupo de 32 que actúa como draft model, y una torre de visión que mantiene la capacidad image-text-to-text. El resultado ocupa 8,6 GB en disco más 0,27 GB de la cabeza borrador, un tamaño que permite servir un modelo de 27B en un equipo con 24 GB de memoria unificada.

La relevancia actual está en la eficiencia: el autor reporta 53,5 tokens por segundo a profundidad MTP 2 (1,80x frente a la inferencia sin drafting) en un Apple M5 Pro con 24 GB, con una tasa de aceptación de borradores del 95,3% en primera posición y 88,9% en segunda. La licencia es Apache 2.0 y el modelo está publicado el 25 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención completa en 16 de 64 capas, pesos ternarios rotados y cabeza MTP para decodificación especulativa |
| Parámetros totales | 27.359.638.768 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el KV cache consume 64 KB por token) |
| Tipos de cuantización | Ternaria (2-bit) en los pesos de lenguaje; 4-bit con grupo de 32 en la cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `mtp.safetensors`) |
| Tamaño en disco | 8,6 GB (pesos + torre de visión) + 0,27 GB (cabeza borrador) |
| Runtime | MTPLX 2.13 o superior, Apple Silicon (MLX) |
| Modelo base | prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit; AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de 27B con 64 capas, de las cuales 16 emplean atención completa (el resto presumiblemente atención lineal o de ventana deslizante, aunque la model card no lo detalla). Los pesos de lenguaje son los pesos ternarios rotados de Prism ML, una representación de 2 bits que el runtime MTPLX ejecuta de forma nativa sin descompresión previa a punto flotante. La edición de AtomicChat modifica 36 matrices para eliminar la dirección de rechazo, y el archivo `uncensored-provenance.json` documenta esa procedencia. El paquete incluye además una torre de visión, lo que conserva la modalidad image-text-to-text del modelo original.

La pieza diferencial es la cabeza MTP (`mtp/mtp-v2-head.safetensors` en el paquete oficial de MLX), un draft head de 4 bits con grupo de 32 cuyos pesos se copian byte a byte y cuyas ocho vectores de normalización se convierten de float32 a float16. Esta cabeza desciende de la de Qwen 3.8 27B y se conecta mediante los campos que MTPLX lee en `config.json`. El entrenamiento original corresponde a Qwen3.8-27B de Alibaba Cloud; no se dispone de datos sobre número de tokens, composición del dataset ni si hubo RLHF o DPO. El archivo `mtplx_runtime.json` contiene el registro de verificación generado por `mtplx forge verify --stamp`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y respuesta en texto (pipeline image-text-to-text).
- Decodificación especulativa mediante cabeza MTP integrada, con profundidades 0 a 3.
- Razonamiento y generación de código: la suite de verificación del autor usa un prompt de código de hasta 2.048 tokens nuevos.
- Respuestas sin filtro de rechazo (abliterated): atiende peticiones que el modelo original declina.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el paquete está diseñado para MTPLX sobre MLX y ocupa 8,6 GB más 0,27 GB, por lo que se sirve en un equipo con 24 GB de memoria unificada sin GPU dedicada. Es el escenario natural del modelo.
- Generación de código asistida en estación de trabajo: la verificación del autor se hizo con un prompt de código de hasta 2.048 tokens, y la decodificación especulativa a profundidad 2 alcanza 53,5 tok/s, suficiente para autocompletado interactivo.
- Análisis de imágenes con descripción textual: la torre de visión permite enviar capturas, diagramas o documentos escaneados y obtener respuestas en lenguaje natural, útil para triaje de documentación técnica en local.
- Procesamiento por lotes de texto sensible a privacidad: al ejecutarse íntegramente en local, permite tratar corpus que no deben salir de la máquina, con la salvedad de que el modelo está desafinado en rechazos.
- Investigación sobre cuantización ternaria: sirve como banco de pruebas para medir la pérdida de calidad de pesos de 2 bits frente al modelo Qwen3.8-27B original en tareas concretas.
- Evaluación de decodificación especulativa: la cabeza MTP con profundidades 0 a 3 y las tasas de aceptación por posición publicadas lo convierten en un caso de estudio reproducible para ajustar el parámetro `--depth` en otras cargas de trabajo.
- Experimentación con modelos sin censura en entornos controlados: útil para estudiar el comportamiento de modelos abliterated, siempre dentro de la legalidad aplicable.

## Benchmarks y rendimiento

El autor publica una medición de velocidad con `mtplx forge verify` en MTPLX 2.13.3, Apple M5 Pro con 24 GB y macOS 27.2.1, sobre la suite `long-code-uncapped` (un prompt de código, hasta 2.048 tokens nuevos):

| Profundidad MTP | tok/s | Respecto a profundidad 0 | Borradores aceptados por posición |
|---:|---:|---:|---|
| 0 | 29,6 | 1,00x | — |
| 1 | 49,6 | 1,67x | 95,7% |
| 2 (por defecto) | 53,5 | 1,80x | 95,3%, 88,9% |
| 3 | 48,2 | 1,63x | 91,4%, 79,2%, 62,9% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La tabla anterior mide exclusivamente throughput y aceptación de borradores, no precisión.

## Requisitos de hardware

- VRAM o memoria unificada: 8,6 GB de pesos más 0,27 GB de cabeza borrador; el KV cache consume 64 KB por token, de modo que 32.000 tokens de contexto añaden aproximadamente 2 GB.
- Hardware objetivo: Apple Silicon con MLX; la medición oficial se realizó en un Apple M5 Pro con 24 GB.
- GPU NVIDIA: no disponible; el paquete depende del runtime MTPLX y de MLX, no de CUDA.
- Cabe en GPU de consumo: no aplicable en el formato entregado; en Apple Silicon cabe en equipos de 16 GB o más según la longitud de contexto.
- Despliegue: MTPLX 2.13 o superior (`mtplx serve`, `mtplx run --depth N`). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: 53,5 tok/s a profundidad 2 en M5 Pro con 24 GB; 29,6 tok/s sin drafting. Son cifras de un solo prompt y el propio autor advierte que otros tipos de texto aceptarán menos borradores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B Uncensored MTPLX 2-bit | 27,36B | no disponible | Ternaria 2-bit + MTP 4-bit | Apache 2.0 | Hugging Face, runtime MTPLX |
| barozp/Ternary-Bonsai-2.5-27B-Uncensored-MLX-2bit | 27,36B | no disponible | Ternaria 2-bit | Apache 2.0 | Hugging Face, loader MLX de Prism ML |
| AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF | 27,36B | no disponible | GGUF (nivel no especificado) | Apache 2.0 | Hugging Face, llama.cpp y derivados |
| prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit | 27,36B | no disponible | Ternaria 2-bit | Apache 2.0 | Hugging Face, MLX |
| Qwen3.8-27B (origen) | 27B | no disponible | Punto flotante original | no disponible en esta ficha | Hugging Face |

Los cuatro primeros son variantes del mismo conjunto de pesos con distintos empaquetados y runtimes; la comparación relevante es de formato y velocidad, no de capacidad. No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas de otros fabricantes.

## Limitaciones y advertencias

- Modelo abliterated: AtomicChat eliminó la dirección de rechazo en 36 matrices. Responderá a peticiones que el modelo original declina, sin filtro de contenido más allá de lo codificado en los pesos. Requiere uso responsable y conformidad con la legislación local.
- La cuantización ternaria de 2 bits implica una pérdida de precisión frente a Qwen3.8-27B en punto flotante; no se han publicado evaluaciones que cuantifiquen esa degradación.
- Riesgo de alucinación: no documentado por el autor; aplicable el comportamiento general de modelos de 27B cuantizados agresivamente.
- Sesgos: no documentados en la información disponible.
- Idiomas soportados: no especificados; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Longitud de contexto: no declarada; el coste de KV cache (64 KB por token) limita el contexto práctico según la memoria disponible.
- Dependencia de runtime: requiere MTPLX 2.13 o superior y Apple Silicon. No hay soporte indicado para CUDA, vLLM, llama.cpp ni TGI en este paquete.
- Las cifras de rendimiento provienen de un único prompt de código; en otros dominios la tasa de aceptación de borradores será menor y la ganancia frente a profundidad 0 se reducirá.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin rechazos recae en el desplegador.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados publicados.

## Enlaces

- Hugging Face: https://huggingface.co/barozp/Ternary-Bonsai-2.5-27B-Uncensored-MTPLX-2bit
- Variante para el loader MLX de Prism ML: https://huggingface.co/barozp/Ternary-Bonsai-2.5-27B-Uncensored-MLX-2bit
- Modelo base MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit
- Modelo base GGUF sin censura: https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF
- Runtime MTPLX: https://github.com/youssofal/MTPLX
