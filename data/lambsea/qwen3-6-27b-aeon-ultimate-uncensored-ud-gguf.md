# lambsea/Qwen3.6-27B-AEON-Ultimate-Uncensored-UD-GGUF

## Resumen

El modelo `lambsea/Qwen3.6-27B-AEON-Ultimate-Uncensored-UD-GGUF` es una colección de cuantizaciones GGUF en formato Unsloth Dynamic (UD) del modelo base `AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16`, desarrollado por el usuario lambsea. Se trata de un modelo de 27.320 millones de parámetros con arquitectura híbrida GatedDeltaNet + attention, donde 48 de sus 64 capas utilizan un mecanismo recurrente SSM (State Space Model) combinado con atención tradicional. El modelo está diseñado para ofrecer un rendimiento de razonamiento avanzado, soporte de visión (a través de un encoder mmproj) y decodificación especulativa MTP (Multi-Token Prediction), todo ello en un formato optimizado para inferencia local.

La relevancia de esta versión radica en su proceso de cuantización refinado: cada grupo de tensores recibe una precisión explícita basada en análisis de sensibilidad KL, preservando los tensores críticos de recurrencia SSM en F16/F32 para evitar la acumulación de errores. Además, se incluye una matriz de importancia (imatrix) calibrada en múltiples dominios (general, código, razonamiento y agentes) con 65.536 tokens de contexto. El modelo soporta una ventana de contexto nativa de 262.144 tokens, ampliable a 524.288 mediante escalado YaRN, y mantiene capacidades de visión y MTP intactas. Está disponible en cuatro niveles de cuantización (Q8_0, Q6_K, Q5_K_M, IQ4_XS) que equilibran calidad y uso de VRAM, siendo Q6_K el recomendado por su relación calidad/tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GatedDeltaNet + attention (48 de 64 capas con SSM recurrente) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativo; 524.288 con escalado YaRN |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, IQ4_XS (formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo base BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 emplea una arquitectura híbrida que combina capas de atención tradicional con capas recurrentes basadas en GatedDeltaNet. De las 64 capas totales, 48 utilizan un mecanismo SSM recurrente donde los errores de cuantización pueden acumularse a lo largo de las posiciones de los tokens, mientras que las 16 restantes usan atención estándar. Esta hibridación permite manejar contextos muy largos de forma eficiente, aunque requiere un cuidado especial en la cuantización de los tensores de recurrencia.

La versión GGUF UD (Unsloth Dynamic) aplica un proceso de cuantización con overrides por tensor: se realizó un análisis de sensibilidad KL midiendo la divergencia al cuantizar cada grupo de tensores a Q4_0 mientras el resto permanecía en F16. Como resultado, se asignaron 685 overrides explícitos, preservando en F16 los tensores de recurrencia SSM (`ssm_alpha`, `ssm_beta`, `ssm_out`, `attn_qkv`, `attn_gate`), así como las normas, biases y la capa MTP. Los tensores pequeños como `ssm_a`, `ssm_conv1d`, `ssm_dt` y `ssm_norm` se mantienen en F32. El resto de tensores (FFN middle, embeddings) se cuantizan según el nivel base elegido.

La imatrix se generó con un generador nativo en PyTorch GPU (del repositorio `a4501150/super-quant`) usando 65.536 tokens de contexto, calibrando sobre 13 datasets de HuggingFace distribuidos en cuatro dominios: general (1M tokens), código (750K), razonamiento (500K) y agentes (500K). Las matrices por dominio se fusionaron con pesos iguales (enfoque DI-MATRIX). No se dispone de información sobre el preentrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento complejo: soporta modo de pensamiento (`enable_thinking`) que produce cadenas de razonamiento en bloques ` thinking` antes de la respuesta final.
- Soporte de visión: el archivo mmproj F16 (885 MB) contiene el encoder de visión completo, permitiendo comprensión de imágenes y vídeo mediante la bandera `--mmproj` en llama-server.
- Decodificación especulativa MTP: la cabeza de predicción multi-token (blk.64) se mantiene en F16 y permite acelerar la generación entre 1.5 y 2 veces con `--spec-type draft-mtp`.
- Capacidades agénticas: calibrado con datasets de function calling (glaive-function-calling-v2, xlam-function-calling-60k, hermes-function-calling-v1), lo que indica soporte para tool calling y flujos de agente.
- Contexto largo: ventana nativa de 262.144 tokens, ampliable a 524.288 con escalado YaRN, adecuada para procesamiento de documentos extensos.
- Multilingüe: no confirmado en la información disponible, aunque el modelo base Qwen3.6 suele ser multilingüe; no se especifican idiomas concretos.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 524K tokens) gracias a su ventana ampliable, manteniendo el historial completo de interacciones y aplicando políticas de empresa mediante el modo de razonamiento.
- Generación de código en producción: su calibración con datasets de código y razonamiento permite autocompletar, refactorizar y explicar fragmentos de código, integrándose en pipelines de CI/CD para revisión automática.
- Análisis de documentos técnicos con visión: al combinar el encoder de visión con el contexto largo, puede extraer información de PDFs escaneados, diagramas o capturas de pantalla y razonar sobre ellos en un mismo prompt.
- Agentes autónomos con tool calling: su entrenamiento con datasets de function calling lo hace adecuado para construir agentes que consultan APIs, bases de datos o ejecutan acciones en entornos controlados.
- Razonamiento matemático y científico: el dominio de razonamiento calibrado (OpenMathInstruct-2, OpenR1-Math-220k) lo habilita para resolver problemas matemáticos paso a paso, útil en tutorías o investigación.
- Procesamiento de corpus extensos: con 262K tokens nativos, puede resumir libros completos, analizar expedientes legales o realizar búsquedas semánticas sobre documentos largos sin necesidad de chunking.
- Despliegue local con privacidad: al ser GGUF y ejecutable con llama.cpp, puede desplegarse en infraestructura propia sin enviar datos a la nube, manteniendo confidencialidad en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una tabla comparativa de calidad entre cuantizaciones, medida en perplejidad (PPL) y divergencia KL respecto al modelo F16, evaluada en una NVIDIA RTX PRO 6000 Blackwell (96 GB VRAM) con llama.cpp fork:

| Cuantizacion | Tamano | tg t/s | PPL | KL mean | KL max | KL p99.9 |
|--------------|--------|--------|-----|---------|--------|----------|
| F16 | 50.9 GB | 30.9 | 5.7215 | — | — | — |
| UD-Q8_0 | 34.7 GB | 44.7 | 5.7055 | 0.0029 | 5.23 | 0.22 |
| UD-Q6_K | 30.6 GB | 49.1 | 5.7046 | 0.0045 | 7.64 | 0.33 |
| UD-Q5_K_M | 28.7 GB | 46.9 | 5.7589 | 0.0111 | 5.09 | 2.04 |
| UD-IQ4_XS | 25.9 GB | 56.5 | 5.7630 | 0.0236 | 4.53 | 1.97 |

Estos datos indican que la cuantización Q6_K ofrece la mejor relación calidad/velocidad, con una PPL incluso ligeramente inferior a la del modelo F16, mientras que IQ4_XS es la opción más rápida y ligera pero con mayor divergencia KL.

## Requisitos de hardware

- VRAM estimada para inferencia: según el archivo GGUF elegido, se necesitan al menos 26 GB para IQ4_XS (25.9 GB), 29 GB para Q5_K_M (28.7 GB), 31 GB para Q6_K (30.6 GB) y 35 GB para Q8_0 (34.7 GB). El modelo F16 requiere unos 51 GB.
- GPU recomendadas: para Q6_K o menor, una RTX 4090 (24 GB) no es suficiente; se requiere al menos una GPU con 32 GB (por ejemplo, A6000, A100 40GB, RTX PRO 6000). Para Q8_0 o F16, se necesitan GPUs de 48 GB o más (A100 80GB, H100, RTX PRO 6000 Blackwell).
- En consumer GPU: no cabe en GPUs de gama media (16-24 GB). Solo GPUs de gama alta con 32 GB o más podrían ejecutar las cuantizaciones más pequeñas.
- Opciones de despliegue: llama.cpp (llama-server o llama-cli) es la opción recomendada, con soporte para flash attention, escalado YaRN, MTP y visión. También puede usarse con otros runners compatibles con GGUF como Ollama o LM Studio, aunque las funciones avanzadas (MTP, imatrix) requieren el fork específico de llama.cpp.
- Latencia y throughput: según la tabla, en una RTX PRO 6000 Blackwell, la generación alcanza entre 44.7 y 56.5 tokens por segundo dependiendo de la cuantización, con Q6_K ofreciendo 49.1 t/s. Con MTP activado, se puede esperar un 1.5-2x adicional de velocidad.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más relevante es entre las distintas cuantizaciones del propio modelo, ya que todas derivan del mismo BF16 base. Se puede considerar que compite con otros modelos de 27B de la familia Qwen3.6, pero no hay datos de benchmarks para establecer una comparativa objetiva. Por tanto, la comparativa con alternativas externas se considera no disponible.

## Limitaciones y advertencias

- Licencia no disponible: el modelo no especifica una licencia, lo que impide conocer las restricciones de uso comercial o modificaciones. Se recomienda contactar con el autor antes de usarlo en producción.
- Contenido no censurado: el nombre "Uncensored" indica que el modelo puede generar contenido sin filtros de seguridad, lo que conlleva riesgos de sesgos, lenguaje ofensivo o información inapropiada. Debe evaluarse cuidadosamente antes de exponerlo a usuarios finales.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en dominios no cubiertos por sus datos de calibración.
- Limitaciones de contexto: aunque soporta 262K tokens nativos, el uso de YaRN para extender a 524K puede degradar la calidad en los extremos de la ventana. Además, la memoria necesaria para el contexto completo es elevada (se recomienda usar caché KV cuantizada q8_0).
- Dependencia de un fork específico: las funciones avanzadas (MTP, imatrix, DFlash) requieren el fork de llama.cpp de `a4501150`, no la versión oficial. Esto puede limitar la portabilidad y el soporte.
- Hardware exigente: las cuantizaciones más pequeñas requieren al menos 26 GB de VRAM, lo que excluye la mayoría de GPUs de consumo. Para aprovechar todo el potencial (contexto largo, visión, MTP) se necesitan GPUs profesionales de 48 GB o más.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/lambsea/Qwen3.6-27B-AEON-Ultimate-Uncensored-UD-GGUF
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Fork de llama.cpp con soporte para DFlash y MTP: https://github.com/a4501150/llama.cpp
- Repositorio del generador de imatrix (super-quant): https://github.com/a4501150/super-quant
