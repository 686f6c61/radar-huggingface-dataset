# balllvin/Dory1.0-4B-abliterated-Arete-NVFP4-MLX

## Resumen

Dory1.0-4B-abliterated-Arete-NVFP4-MLX es una compilación comunitaria del modelo Dory 1.0 4B de NVIDIA (Nemotron-Labs), adaptada para su ejecución en Apple Silicon mediante el framework MLX. El modelo original ha sido sometido a un proceso de "abliteration" (eliminación de mecanismos de rechazo) y posteriormente ajustado con datos de valores de Nous Research (Arete). Esta versión concreta mantiene los mismos códigos de cuantización NVFP4 de 4 bits y las escalas de bloque del modelo original, pero reorganiza los tensores para que MLX pueda cargarlos directamente.

El modelo cuenta con 3.975.229.440 parámetros totales (aproximadamente 4B) y está empaquetado en un repositorio de 3,2 GB. Está diseñado exclusivamente para generación de texto en inglés y utiliza un modo de razonamiento ("thinking") que produce la respuesta en el campo `reasoning` antes de generar el contenido final. Es un modelo "looped", con 2 bucles por defecto y 4 para tareas complejas.

La relevancia de esta ficha radica en que documenta un caso de despliegue de un modelo abliterated en hardware de Apple, con cuantización NVFP4, y advierte explícitamente de que se trata de una herramienta de investigación no apta para uso en producción sin supervisión. El autor indica que todas las métricas publicadas se midieron sobre el archivo NVFP4 original con vLLM, no sobre esta compilación MLX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (modelo con bucles recurrentes), basado en NVIDIA Nemotron-Labs Dory 1.0 4B |
| Parámetros totales | 3.975.229.440 (≈4B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits), con códigos de 4 bits y escalas de bloque; tensores bf16 y vectores gate en fp32 |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW 1.1 (pesos, config y tokenizer); código en `tools/` bajo MIT |
| Formato de pesos | safetensors (MLX), con `nvfp4_source.safetensors` y `nvfp4_mlx.json` como metadatos de conversión |

## Arquitectura y entrenamiento

El modelo se basa en NVIDIA Nemotron-Labs Dory 1.0 4B, un transformer de aproximadamente 4B parámetros con una particularidad estructural: es un modelo "looped", es decir, que aplica sus capas de forma recurrente. El autor indica que por defecto se ejecutan 2 bucles y que para tareas difíciles se pueden usar 4. No se dispone de información detallada sobre el número de capas, dimensión oculta o composición exacta del dataset de preentrenamiento original.

Sobre el modelo base se aplicó un proceso de abliteration (método OBLITERATUS, AGPL-3.0, sin código incluido en este repositorio) que elimina los mecanismos de rechazo, y posteriormente un ajuste fino con el dataset `NousResearch/arete-data-pairs`, orientado a valores y comportamiento. Según la model card, las respuestas de entrenamiento de Arete no contienen rechazos. La cuantización NVFP4 se realizó sobre el modelo resultante y luego se convirtió a formato MLX plegando la escala de tensor (`weight_scale_2`) en los vectores gate, ya que MLX no acepta ese parámetro de entrada en `mx.quantized_matmul`. La verificación encontró los 507 tensores, con 3.201.564.672 bytes idénticos al build NVFP4; solo los 72 vectores gate cambiaron.

## Capacidades

- Generación de texto conversacional en inglés.
- Modo de razonamiento ("thinking") activado por defecto: el modelo razona antes de responder y deposita el razonamiento en el campo `reasoning`.
- Razonamiento multi-paso mediante bucles configurables (2 por defecto, 4 para tareas difíciles).
- Aritmética básica: en la prueba de carga respondió correctamente a "What is 17 times 23?" con "17 × 23 = 391".
- Respuesta a peticiones dañinas en la mayoría de los casos (comportamiento derivado de la abliteration).
- No se documenta soporte de tool calling, function calling, visión, audio ni capacidades de agente en la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo es útil para estudiar cómo la abliteration y el ajuste con datos de valores (Arete) modifican las tasas de rechazo. Los datos publicados (26,3% de rechazo a peticiones dañinas frente a 13,1% del modelo solo abliterated) permiten analizar el efecto del ajuste con Arete en entornos controlados de laboratorio.
- Evaluación de cuantización NVFP4 en Apple Silicon: sirve para medir latencia, uso de memoria y fidelidad de la conversión MLX frente al build NVFP4 original en vLLM, dado que el autor proporciona scripts `convert.py` y `verify.py` para reproducir y comprobar la conversión.
- Pruebas de robustez frente a jailbreaks: al ser un modelo abliterated, permite evaluar clasificadores de seguridad y filtros de contenido que se colocarían por delante en un pipeline, midiendo cuántas peticiones dañinas pasan.
- Generación de texto creativo y conversacional sin restricciones: para prototipos de escritura o diálogo donde se requiere un modelo que no rechace temas sensibles, siempre en entornos de investigación y con revisión humana.
- Estudio de modelos "looped": permite experimentar con el número de bucles (2 frente a 4) y observar el efecto en la calidad del razonamiento y en el coste computacional, algo poco habitual en modelos de 4B.
- Docencia y demostraciones de despliegue local: el servidor MLX se levanta con `python -m mlx_lm server` sin necesidad de carpeta `tools/`, lo que facilita demostraciones en un Mac sin GPU dedicada.
- Análisis de sesgos y errores factuales: la caída en la puntuación de Propaganda Eval (1,540 con Arete frente a 1,993 del abliterated) y la observación de "respuestas más cortas con errores factuales confiados" lo hacen útil para estudiar calibración y alucinación.

## Benchmarks y rendimiento

Los datos publicados corresponden al build NVFP4 ejecutado con vLLM, no a esta compilación MLX. El autor lo advierte explícitamente.

| Build | Harmful refused (99) | Benign refused (100) | MMLU (300) |
|---|---:|---:|---:|
| NVIDIA NVFP4 | 56,6% | 17,0% | 0,830 |
| Abliterated | 13,1% | 0,0% | 0,857 |
| Abliterated + Arete (este modelo) | 26,3% | 0,0% | 0,833 |

Propaganda Eval fact score (4 bucles): 1,540 para este modelo, frente a 1,823 del NVIDIA NVFP4 y 1,993 del abliterated. El autor señala que Arete redujo la puntuación, con respuestas más cortas y errores factuales confiados.

Prueba de carga en Apple Silicon (fork fijado de mlx-lm, `mlx_lm.load`): carga en 0,9 s y respuesta correcta a "What is 17 times 23?" con pensamiento cerrado y "17 × 23 = 391". No se publican cifras de throughput ni latencia por token.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 3,2 GB en cuantización NVFP4 de 4 bits; se necesita al menos esa cantidad de memoria libre, más overhead de ejecución y caché KV.
- Hardware objetivo: Apple Silicon (Mac con chip M-series). El modelo está empaquetado específicamente para MLX.
- GPU dedicadas: no aplica a esta compilación; para NVIDIA se debe usar el repositorio NVFP4 original con vLLM.
- Cabe en GPU de consumo: sí, en el sentido de que 3,2 GB de pesos caben en cualquier Mac con memoria unificada de 8 GB o más; no se documenta el comportamiento en GPUs consumer NVIDIA para esta build.
- Opciones de despliegue: MLX con `mlx==0.32.4` y el fork fijado de `mlx-lm` (`pmichalas/mlx-lm`, commit `208065f3354e8c2645b658493b6aeb94eb0aaa77`), más `sentencepiece` y `protobuf`. Servidor mediante `python -m mlx_lm server` o `tools/serve.py` con `--temp 1.0 --top-p 0.95`.
- Latencia y throughput: solo se documenta la carga en 0,9 s y una respuesta aritmética correcta; no hay cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dory1.0-4B-abliterated-Arete-NVFP4-MLX (este) | ≈4B | no disponible | OpenMDW 1.1 | safetensors MLX (NVFP4) | Build para Apple Silicon; MMLU 0,833; 26,3% harmful refused |
| balllvin/Dory1.0-4B-abliterated-Arete-NVFP4 | ≈4B | no disponible | OpenMDW 1.1 | safetensors NVFP4 | Mismo modelo para vLLM/NVIDIA; métricas medidas aquí |
| Dory 1.0 4B (abliterated, sin Arete) | ≈4B | no disponible | OpenMDW 1.1 (derivada) | no disponible | MMLU 0,857; 13,1% harmful refused; 0% benign refused |
| NVIDIA Nemotron-Labs Dory 1.0 4B (original) | ≈4B | no disponible | OpenMDW 1.1 | no disponible | MMLU 0,830; 56,6% harmful refused; 17,0% benign refused |

No se dispone de información sobre otros modelos de 4B comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está abliterated: responde a la mayoría de peticiones dañinas (73,7% no rechazadas en la evaluación de 99 prompts). No es seguro para uso sin supervisión ni para aplicaciones de cara al usuario.
- Riesgo elevado de alucinación: el autor documenta "respuestas más cortas con errores factuales confiados" tras el ajuste con Arete, con caída del fact score de Propaganda Eval de 1,993 a 1,540.
- Ningún benchmark se ejecutó sobre esta compilación MLX; todas las cifras provienen del archivo NVFP4 con vLLM.
- El modo de razonamiento está activado por defecto: con un `max_tokens` bajo se obtiene `content` vacío porque el modelo consume tokens en el campo `reasoning`.
- Al cargar se emite una advertencia del tokenizer sobre `fix_mistral_regex`, que también aparece con el archivo NVFP4 de NVIDIA.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Licencia OpenMDW 1.1 para pesos, config y tokenizer; el código de `tools/` es MIT. El método de abliteration OBLITERATUS es AGPL-3.0, aunque no se incluye código suyo. Es una compilación comunitaria independiente, no revisada ni respaldada por NVIDIA ni por Nous Research.
- Longitud de contexto no documentada; no se debe asumir una ventana larga sin verificarla.
- Solo 4 descargas y 0 likes en el momento de la consulta: ecosistema muy reducido, sin validación comunitaria extensa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/Dory1.0-4B-abliterated-Arete-NVFP4-MLX
- Modelo base NVFP4: https://huggingface.co/balllvin/Dory1.0-4B-abliterated-Arete-NVFP4
- Dataset de ajuste: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Fork de mlx-lm con soporte Dory: https://github.com/pmichalas/mlx-lm (commit `208065f3354e8c2645b658493b6aeb94eb0aaa77`)
- MLX (Apple): https://github.com/ml-explore/mlx
