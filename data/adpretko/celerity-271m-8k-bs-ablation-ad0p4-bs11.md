# adpretko/celerity-271m-8k-bs-ablation-ad0p4-bs11

## Resumen

Celerity 271M 8K (ad0.4_bs11) es un checkpoint de 271 millones de parámetros publicado por el usuario de Hugging Face adpretko y convertido desde el formato nativo CS de Cerebras al formato de Hugging Face. Se trata de un artefacto de investigación perteneciente a una ablación de tamaño de lote global (batch size) dentro de la familia "Celerity 271M / 8K": el entrenamiento mantiene fijos el learning rate (0,15) y tau_ema (0,1745) mientras varía el batch size, ajustando el weight decay para conservar tau_ema constante. En esta variante concreta el batch size global es 11 y el attention dropout es 0,4 con schedule constante.

El modelo es un transformer decoder de 271 M de parámetros con embeddings posicionales ALiBi y una longitud máxima de secuencia de 8192 tokens. Se entrenó durante 60 104 pasos con cbcore 2.6.0 sobre infraestructura Cerebras y residuo dropout, stochastic depth y LayerDrop a cero. El repositorio ocupa 0,5 GB y requiere cargar el modelo con `trust_remote_code=True`, ya que utiliza código de modelado propio ("custom Celerity Hugging Face modeling code") que no forma parte de la librería estándar de transformers.

Su relevancia es fundamentalmente metodológica y de reproducibilidad: sirve para estudiar cómo afecta el tamaño de lote al resultado del entrenamiento a esta escala, y para validar la cadena de conversión Cerebras → Hugging Face. No es un modelo orientado a producción: no declara licencia, idiomas, pipeline ni resultados de evaluación, y acumula cero descargas y cero "likes" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder con embeddings posicionales ALiBi (según la model card) |
| Parámetros totales | 271 M (según el nombre del checkpoint) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (maximum sequence length) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; repositorio PyTorch de 0,5 GB con código de modelado propio, requiere `trust_remote_code=True` |
| Autor | adpretko |
| Fecha de creación | 2026-10-04 |
| Última actualización | 2026-10-04 |
| Tipo de checkpoint | Ablación de batch size (`ad0.4_bs11`), checkpoint origen `checkpoint_60104.mdl` |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,5 GB |
| Etiquetas | pytorch, celerity, custom_code, region:us |

## Arquitectura y entrenamiento

El modelo es un transformer decoder autorregresivo con codificación posicional ALiBi, una elección que permite cierta extrapolación de longitud más allá de la ventana de entrenamiento sin reentrenar los embeddings posicionales. El checkpoint corresponde a un experimento de ablación identificado como `ad0.4_bs11`, convertido desde el formato CS de Cerebras mediante un conversor cuyo commit es `0e3d5d375695293479df9d2a3717f05f71a345b4`. Los hiperparámetros declarados son: attention dropout 0,4 con schedule constante, peak learning rate 0,15, batch size global de entrenamiento 11, weight decay 0,0006356381190145931, tau_ema 0,1745, 60104 pasos de entrenamiento, residual dropout 0,0, stochastic depth 0,0 y LayerDrop 0,0. El entorno de ejecución de origen es cbcore 2.6.0.

La model card no aporta información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se documentan innovaciones técnicas más allá del uso de ALiBi y de la infraestructura Cerebras. Cabe señalar que el attention dropout (0,4) es un hiperparámetro exclusivo de entrenamiento: sus efectos ya están incorporados en los pesos aprendidos y la evaluación en Hugging Face se realiza con dropout desactivado mediante `model.eval()`. El diseño del experimento (learning rate y tau_ema fijos, batch size variable, weight decay reajustado) lo sitúa como una pieza de un estudio de escalado tipo leyes de escala, no como un modelo final optimizado.

## Capacidades

- Generación de texto autoregresiva: es la función implícita de un transformer decoder causal entrenado con objetivo de modelado de lenguaje.
- Contexto de 8192 tokens, útil para tareas con documentos o conversaciones relativamente largas.
- Extrapolación posicional potencial gracias a ALiBi, aunque no se documenta ninguna evaluación al respecto.
- Tool calling / function calling: no disponible; la model card no lo menciona.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia documentada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- La model card no documenta ninguna capacidad específica más allá de la conversión de formato y los hiperparámetros de entrenamiento; cualquier afirmación adicional sobre capacidades sería especulativa.

## Casos de uso

- Investigación sobre leyes de escala y tamaño de lote: el checkpoint es una muestra concreta de una ablación que mantiene fijos el learning rate y tau_ema mientras varía el batch size global. Permite reproducir y comparar curvas de pérdida frente a batch size dentro de la misma familia.
- Estudio del efecto del attention dropout: al tratarse de la variante con `ad0.4` y schedule constante, sirve como punto de comparación directo frente a otros checkpoints de la familia (por ejemplo, la variante `ad0p1`) para medir el impacto del dropout de atención en tareas downstream.
- Validación de herramientas de conversión Cerebras CS → Hugging Face: el modelo es útil como caso de prueba reproducible para verificar que un conversor (commit `0e3d5d3...`) genera pesos cargables y funcionales con el código de modelado propio.
- Baseline ligero para experimentos de ajuste fino en una sola GPU: con 271 M de parámetros y 0,5 GB de pesos, es viable probar recetas de SFT o LoRA en GPUs de gama media antes de trasladarlas a modelos mayores, reduciendo coste y tiempo de iteración.
- Evaluación de extrapolación posicional con ALiBi: permite diseñar experimentos que comparen perplejidad dentro de los 8192 tokens frente a secuencias más largas, comprobando empíricamente el comportamiento del sesgo ALiBi.
- Pruebas de infraestructura de inferencia con código remoto: dado que exige `trust_remote_code=True`, resulta adecuado para validar pipelines que deben ejecutar código de modelado de terceros en entornos aislados y controlados.
- Docencia y prototipado: un transformer decoder pequeño con contexto largo es un banco de pruebas asequible para explicar entrenamiento, conversión de checkpoints y evaluación de modelos sin necesidad de clústeres grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, perplejidad u otras), y la búsqueda web no aporta datos de rendimiento para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,54 GB en fp16/bf16 y 1,08 GB en fp32, calculado a partir de los 271 M de parámetros. Son estimaciones derivadas del recuento de parámetros, no datos publicados por el autor.
- Memoria adicional por KV cache: a 8192 tokens el coste extra depende del número de capas y cabezas, que no se documenta. En modelos de esta escala suele ser modesto (decenas a unos pocos cientos de megabytes en fp16), pero no puede cuantificarse con precisión sin la configuración de arquitectura.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería bastar para inferencia en fp16, incluidas NVIDIA GTX 1660, RTX 3060, RTX 4060 o superiores; también tarjetas de datacenter (A100, H100) aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en la práctica totalidad de GPU de consumo modernas; también podría ejecutarse en CPU con memoria suficiente.
- Opciones de despliegue: al no existir pesos GGUF ni soporte confirmado en frameworks estándar, la vía documentada es PyTorch con `transformers` y `trust_remote_code=True`. El uso con vLLM, TGI, llama.cpp u Ollama no está documentado y requeriría trabajo adicional de integración o conversión de formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa orientativa por escala de parámetros. Los datos de los modelos alternativos proceden de sus fichas públicas; los de Celerity 271M 8K provienen de la información del repositorio. No se dispone de métricas de rendimiento para Celerity, por lo que la comparación se limita a características técnicas.

| Modelo | Parámetros | Contexto | Posicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Celerity 271M 8K (ad0.4_bs11) | 271 M | 8192 | ALiBi | no disponible | Hugging Face, código propio con `trust_remote_code` |
| SmolLM2-360M | ~362 M | 8192 | RoPE | Apache-2.0 | Hugging Face, integración estándar |
| Pythia-410M | ~405 M | 2048 | RoPE | Apache-2.0 | Hugging Face, integración estándar |
| GPT-2 medium | ~355 M | 1024 | embeddings absolutos | MIT modificada | Hugging Face, integración estándar |

En términos de contexto, Celerity 271M 8K iguala a SmolLM2-360M (8192 tokens) y supera claramente a Pythia-410M y GPT-2 medium. Como contrapartida, carece de licencia declarada, de resultados publicados y del soporte de herramientas estándar que sí ofrecen las alternativas. No es posible comparar rendimiento porque no hay benchmarks disponibles para este checkpoint.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse ningún derecho de uso comercial. Cualquier uso en producción requiere contactar con el autor para aclarar los términos.
- Ausencia total de evaluación: no hay benchmarks, ni perplejidad, ni resultados de tareas downstream. La calidad real del modelo es desconocida.
- Riesgo de alucinación elevado por tamaño: con 271 M de parámetros, la coherencia factual y el razonamiento complejo estarán limitados en comparación con modelos de mayor escala.
- Idiomas no documentados: se desconoce si el modelo fue entrenado predominantemente en inglés o en varios idiomas. No debe asumirse soporte del castellano sin verificación empírica.
- Es un checkpoint de ablación, no un modelo final: la configuración (batch size 11, attention dropout 0,4, learning rate 0,15 durante 60104 pasos) está diseñada para estudiar un efecto concreto, por lo que puede estar lejos de la configuración óptima de calidad.
- Carga con `trust_remote_code=True`: implica ejecutar código Python proporcionado por el repositorio. Debe revisarse el código antes de cargarlo y aislarlo en un entorno controlado, especialmente en infraestructura compartida.
- Ecosistema limitado: sin pesos GGUF, sin cuantizaciones publicadas y sin soporte confirmado en vLLM, TGI, Ollama o llama.cpp. El despliegue eficiente exigiría trabajo adicional.
- Validación comunitaria nula: cero descargas y cero "likes" en la fecha de creación, sin issues ni discusiones públicas que permitan contrastar su comportamiento.
- Fecha del repositorio: el modelo figura creado el 2026-10-04, lo que conviene verificar antes de integrarlo en cualquier flujo dependiente de versiones.
- Ausencia de información sobre datos de entrenamiento: no se conocen composición del dataset, número de tokens ni posibles sesgos heredados de los datos, lo que impide evaluar riesgos de sesgo de forma fundamentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-bs-ablation-ad0p4-bs11
- Variante relacionada (ad0p1): https://huggingface.co/adpretko/celerity-271m-8k-ad0p1
- Variante relacionada (residual dropout 0.0): https://huggingface.co/adpretko/celerity-271m-8k-residual-dropout-0p0
