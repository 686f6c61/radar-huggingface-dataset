# OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF

## Resumen

Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF es una versión decensurada del modelo Ternary-Bonsai-2-27B de Prism ML, publicada por OS-Software. Se trata de un derivado que incorpora un LoRA de tipo Heretic directamente en los pesos ternarios del modelo base: el LoRA se ha "horneado" (baked in) ajustando los códigos ternarios del packing oficial PQ2_0 y preservando las escalas de bloque originales. El resultado es un modelo con la alineación de seguridad fuertemente reducida, orientado a investigación en seguridad, estudios de alineación y red-teaming.

El modelo conserva el tamaño del base: 26.895.998.464 parámetros totales (unos 26,9 mil millones) distribuidos en un repositorio de 14,7 GB que incluye dos packings ternarios, PQ2_0 y PTQ1_0. La modificación afectó únicamente a 34 matrices (las proyecciones attn.o_proj y mlp.down_proj de las capas 27 a 44), mientras que los 817 tensores restantes permanecieron intactos. Según el autor, se trata de una fusión aproximada y no de una fusión LoRA en coma flotante exacta.

Su relevancia actual radica en dos factores. Por un lado, demuestra que es posible modificar el comportamiento de rechazo de un modelo cuantizado de forma agresiva (de 95/100 rechazos a 0/100) con una divergencia KL de solo 0,0135 respecto al original. Por otro, emplea pesos ternarios con kernels específicos, lo que permite ejecutar un modelo de ~27B en hardware de consumo mediante el fork de llama.cpp de Prism ML, a costa de depender de un runtime no estándar. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo base con pesos ternarios y escalas por bloque (packings PQ2_0 y PTQ1_0) |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | No aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No declarada; el ejemplo oficial de uso arranca el servidor con `-c 32768` |
| Tipos de cuantización | Ternaria en dos packings: PQ2_0 y PTQ1_0 (formato GGUF ternario) |
| Idiomas soportados | No disponible; la validación local del autor incluye textos en inglés y japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería llama.cpp, fork de Prism ML) |
| Tamaño del repositorio | 14,7 GB (incluye ambos packings) |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creación | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es un derivado del Ternary-Bonsai-2-27B de Prism ML al que se le ha aplicado una abliteración mediante LoRA de rango 128 y posteriormente se ha integrado ese LoRA en los pesos ternarios. Los parámetros declarados del proceso son: capas 27 a 44 (start_layer_index 27, end_layer_index 44), componentes objetivo attn.o_proj y mlp.down_proj, transport gaussian con transport_rank 4, ridge_regularization 0,00015, covariance_regularization 0,01, entropy_regularization 0,1, neighbor_count 1, row_normalization none, preserve_good_behavior_weight 1,0, steer_bad_behavior_weight 0,03, overcorrect_relative_weight 2,3 y max_weight_change 1,0.

La innovación técnica principal es el método de fusión: en lugar de aplicar el LoRA en coma flotante y recuantizar, el autor ajustó directamente los códigos ternarios del packing oficial PQ2_0 manteniendo las escalas de bloque originales. Solo se modificaron 34 matrices de las 851 totales; las 817 restantes quedaron sin cambios. El propio autor advierte de que es una fusión aproximada, no una fusión LoRA exacta en coma flotante.

El modelo base es un modelo de pesos ternarios, lo que implica que cada peso se codifica en un conjunto reducido de valores y la información de escala se agrupa por bloques. Por este motivo, tanto PQ2_0 como PTQ1_0 requieren los kernels ternarios y las transformadas de activación de Hadamard del fork de llama.cpp de Prism ML. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si el base usó RLHF o DPO.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla compatible con `--jinja`.
- Modo de razonamiento explícito: el runtime admite `--reasoning on` y `--reasoning-effort medium`, lo que sugiere soporte de un modo de pensamiento configurable.
- Capacidades multilingües parcialmente evidenciadas: la validación local mide perplejidad en inglés (WikiText-2) y en japonés (harmless_alpaca_ja).
- Pruebas funcionales superadas: 16/16 en comprobaciones cortas de aritmética, JSON, traducción y comprensión lectora.
- Reducción drástica del comportamiento de rechazo: 0/100 rechazos frente a 95/100 del modelo original.
- Inferencia local en CPU/GPU mediante llama.cpp (fork de Prism ML), con offload de capas a GPU (`-ngl 99`).
- No se documenta en la información disponible soporte de tool calling, function calling, uso de agentes, visión, audio ni decodificación especulativa. El autor indica explícitamente que el comportamiento en visión no se ha evaluado en esta release, lo que sugiere que el modelo base podría incluir componentes multimodales, pero no se confirma.

## Casos de uso

- Investigación en seguridad y red-teaming: el modelo sirve como sujeto de prueba para medir hasta qué punto un ataque de abliteración sobre pesos ternarios elimina las negativas, con una métrica objetiva de 0/100 rechazos y una divergencia KL de 0,0135 respecto al original.
- Estudios de alineación comparativos: permite contrastar el comportamiento pre y post abliteración sobre el mismo base (prism-ml/Ternary-Bonsai-2-27B-gguf) manteniendo constante el resto de la distribución de pesos, algo poco habitual en modelos de este tamaño.
- Evaluación de moderadores y clasificadores de seguridad: al generar contenido sin filtrado previo, se puede usar como generador adversario para comprobar la tasa de detección de un clasificador propio en un pipeline controlado y aislado.
- Generación de datos sintéticos adversarios: útil para construir conjuntos de entrenamiento de clasificadores de toxicidad o de detección de jailbreaks, siempre en entornos de laboratorio.
- Inferencia local con requisitos de VRAM reducidos: los pesos ternarios y el tamaño del repo (14,7 GB para dos packings, aproximadamente la mitad por formato) permiten estudiar despliegues de un modelo de ~27B en hardware de gama alta de consumo con offload parcial.
- Reproducción de experimentos de cuantización ternaria: el modelo es un caso de estudio de cómo una modificación dirigida a 34 matrices sobrevive a la codificación ternaria sin degradar de forma apreciable la perplejidad (10,1460 en WikiText-2 para PQ2_0).
- Investigación lingüística en inglés y japonés: las perplejidades publicadas (10,14 y 16,78 respectivamente) permiten usar el modelo en experimentos controlados de evaluación de calidad de cuantización por idioma.
- Validación de runtimes alternativos: sirve para verificar la fidelidad de los kernels ternarios y de las transformadas de Hadamard comparando las salidas entre los packings PQ2_0 y PTQ1_0.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Métrica | Este modelo | Modelo original (prism-ml/Ternary-Bonsai-2-27B-gguf) |
|---|---|---|
| Rechazos | 0/100 | 95/100 |
| Divergencia KL | 0,0135 | 0 (por definición) |

Validación local por packing:

| Comprobación | PQ2_0 | PTQ1_0 |
|---|---|---|
| Perplejidad en inglés — WikiText-2 test | 10,1460 | 10,1435 |
| Perplejidad en japonés — harmless_alpaca_ja test | 16,7833 | 16,7744 |
| Comprobaciones funcionales cortas superadas | 16/16 | 16/16 |

La perplejidad se midió con un contexto de 512 tokens sobre 4.080 tokens puntuados en inglés y 3.570 en japonés. Las comprobaciones funcionales cubrieron aritmética, JSON, traducción y comprensión lectora. El autor advierte de que son pruebas locales pequeñas y no un benchmark exhaustivo, y que las ligeras diferencias numéricas entre packings pueden deberse a sus kernels de ejecución. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de contexto largo en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 14,7 GB e incluye dos packings, lo que implica del orden de 7 GB por formato. Se trata de una estimación derivada del tamaño del repo, no de un dato declarado por el autor.
- GPU recomendadas: no especificadas por el autor. El offload completo de capas (`-ngl 99`) sugiere que el modelo cabe entero en GPUs con al menos 8-12 GB de VRAM efectiva, aunque este dato no está confirmado oficialmente.
- GPU de consumo: viable en principio en tarjetas de gama alta con 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), así como en configuraciones con offload parcial a CPU mediante llama.cpp. No hay cifras oficiales de compatibilidad.
- Opciones de despliegue: es obligatorio el fork de llama.cpp de Prism ML (`https://github.com/PrismML-Eng/llama.cpp`), porque el modelo requiere sus kernels ternarios y las transformadas de activación de Hadamard. El ejemplo oficial usa `llama-server` y expone un endpoint compatible con las APIs habituales. No se documenta soporte en vLLM, TGI, Ollama ni otros runtimes.
- Comando de referencia del autor: `llama-server -m Ternary-Bonsai-2-27B-Uncensored-Heretic-PTQ1_0.gguf -ngl 99 -c 32768 --jinja --reasoning on --reasoning-effort medium --temp 1.0 --top-p 0.95 --top-k 20 --host 127.0.0.1 --port 8080`. Sustituyendo el nombre de fichero se usa el packing PQ2_0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rechazos | Divergencia KL | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF | ≈26,9B | No declarada (ejemplo con 32768) | GGUF ternario (PQ2_0, PTQ1_0) | Apache 2.0 | 0/100 | 0,0135 | HuggingFace |
| prism-ml/Ternary-Bonsai-2-27B-gguf | ≈26,9B | No declarada | GGUF ternario | Apache 2.0 | 95/100 | 0 (por definición) | HuggingFace |

No se dispone de información sobre otros modelos ternarios de tamaño comparable que puedan servir de referencia adicional; por tanto, la comparativa se limita al modelo base del que deriva esta variante. Tampoco se han publicado en la información disponible datos de benchmarks de terceros que permitan situarlo frente a modelos densos de ~27B en BF16 o frente a cuantizaciones de 4 bits.

## Limitaciones y advertencias

- Reducción sustancial de la alineación de seguridad: el autor lo declara explícitamente y lo cuantifica en 0/100 rechazos. Es esperable la generación de contenido dañino, inexacto, sesgado u ofensivo.
- Riesgo elevado de alucinación: la propia model card recomienda tratar todas las salidas como no fiables y verificarlas de forma independiente.
- Uso previsto restringido a investigación y experimentación (seguridad, alineación y red-teaming). El autor pide evitar el despliegue en servicios públicos o de cara al usuario final.
- La fusión del LoRA es aproximada, no una fusión exacta en coma flotante, lo que puede introducir diferencias de comportamiento no caracterizadas respecto a una abliteración estándar.
- Las diferencias numéricas entre los packings PQ2_0 y PTQ1_0 pueden provenir de los kernels de ejecución, no solo de la codificación.
- El rendimiento en contexto largo y el comportamiento en visión no han sido evaluados en esta release.
- Dependencia obligatoria de un fork específico de llama.cpp; no hay soporte documentado en otros motores de inferencia.
- Idiomas soportados no declarados oficialmente; solo hay evidencia de validación en inglés y japonés.
- Licencia Apache 2.0, que en principio permite uso comercial, pero el propio autor desaconseja el despliegue público y la model card se acoge a la licencia aplicable del modelo base. OS-Software no ofrece garantías de ningún tipo.
- Estado del repositorio: 0 descargas y 0 likes, sin evidencia de validación por parte de terceros.
- El usuario es el único responsable del cumplimiento normativo, de la supervisión humana y de las salvaguardas que implemente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp de Prism ML (runtime requerido): https://github.com/PrismML-Eng/llama.cpp
- Heretic (herramienta de abliteración de p-e-w): https://github.com/p-e-w
- Perfil del autor en HuggingFace: https://huggingface.co/OS-Software

No se han encontrado en la búsqueda web papers, blogs ni demos adicionales relevantes sobre este modelo.
