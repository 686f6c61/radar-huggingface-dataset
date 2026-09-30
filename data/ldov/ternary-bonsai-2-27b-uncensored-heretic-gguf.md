# ldov/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF

## Resumen

Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF es una versión decensurada y cuantizada en GGUF del modelo Ternary-Bonsai-2-27B de Prism ML, publicada por el usuario ldov (la model card atribuye el trabajo a OS-Software). El modelo base es un transformer causal de 26.895.998.464 parámetros (unos 26,9 mil millones) derivado de Qwen3.8 27B, con atención híbrida y pesos ternarios (valores en {-1, 0, +1} en una base rotada fija) más escalas de grupo en FP16. Su rasgo distintivo es la compresión extrema: aproximadamente 1,72 bits por peso, lo que reduce el peso del modelo a unos 5,9 GB conservando, según Prism ML, el 98,2 % del rendimiento de referencia de Qwen3.8 27B.

Sobre esa base, el autor aplica una LoRA de tipo Heretic (abliteración de la dirección de rechazo) que se funde directamente en los códigos ternarios: se modifican 34 matrices y los 817 tensores restantes quedan intactos, preservando las escalas de bloque originales. El resultado es una fusión aproximada, no una fusión exacta en coma flotante. El efecto medido es una caída de las negativas de 95/100 en el modelo original a 0/100 en esta versión, con una divergencia KL de 0,0135 respecto al modelo de partida.

El modelo es relevante en el ecosistema actual porque demuestra que se puede llevar un modelo multimodal de ~27B a un consumo de memoria de gama de consumo mediante cuantización ternaria, y porque documenta de forma transparente el coste de una abliteración agresiva sobre pesos ya cuantizados. Está publicado con licencia Apache 2.0, aunque su model card lo restringe explícitamente a investigación y experimentación (seguridad, alineamiento y red-teaming), desaconsejando su despliegue en servicios públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida, pesos ternarios en base rotada fija y escalas de grupo en FP16 (derivado de Qwen3.8 27B) |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | 32.768 tokens en el ejemplo de uso del autor (`-c 32768`); no se especifica el máximo oficial de la familia |
| Tipos de cuantizacion | Empaquetados ternarios PTQ1_0 y PQ2_0 (≈1,72 bits/peso, código ternario de ~1,585 bits más escala de 16 bits amortizada cada 128 pesos) |
| Idiomas soportados | No disponible en los metadatos de HuggingFace; validado localmente en inglés y japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros separados para PTQ1_0 y PQ2_0) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.8 27B: un modelo de lenguaje causal con mecanismo de atención híbrido (combinación de atención completa y capas de atención lineal), lo que reduce el coste de caché KV en contextos largos. Sobre este esqueleto, Prism ML sustituye las matrices por pesos ternarios en una base rotada fija mediante transformadas de Hadamard, manteniendo escalas de grupo en FP16. El resultado ocupa unos 5,9 GB y conserva, según el autor del modelo base, el 98,2 % del rendimiento en benchmarks de Qwen3.8 27B. El modelo base acepta además entrada de visión, por lo que es multimodal.

La versión aquí descrita parte del empaquetado oficial PQ2_0 y le incorpora una LoRA de abliteración de rango 128, generada con Heretic y aplicada ajustando los códigos ternarios sin tocar las escalas de bloque. La intervención afecta a las capas 27 a 44 y a los componentes `attn.o_proj` y `mlp.down_proj`. Los hiperparámetros declarados incluyen `preserve_good_behavior_weight` = 1,0, `steer_bad_behavior_weight` = 0,03, `overcorrect_relative_weight` = 2,3, `transport` gaussiano con `transport_rank` = 4, `ridge_regularization` = 0,00015, `entropy_regularization` = 0,1 y `covariance_regularization` = 0,01, con un cambio máximo de peso de 1,0. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base; no disponible.

## Capacidades

- Generación de texto conversacional con plantilla de chat gestionada mediante `--jinja` en `llama-server`.
- Modo de razonamiento explícito, activable con `--reasoning on` y ajustable con `--reasoning-effort medium`; el model card recomienda `temperature` 1,0, `top-p` 0,95 y `top-k` 20 para este modo.
- Capacidad multimodal de visión heredada del modelo base, según la documentación de Prism ML (no evaluada en esta release, tal como advierte el propio autor).
- Capacidades agénticas declaradas por Prism ML para la familia Bonsai 2 27B.
- Multilingüismo parcialmente verificado: pruebas de perplejidad en inglés y japonés, con 16/16 comprobaciones funcionales superadas (aritmética, JSON, traducción y comprensión lectora).
- Reducción drástica del comportamiento de rechazo: 0 negativas sobre 100 frente a 95 sobre 100 del modelo original.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.

## Casos de uso

- Investigación en seguridad y alineamiento: el modelo sirve como sujeto de estudio para medir cómo una abliteración sobre pesos ternarios altera la distribución de respuestas, comparando la divergencia KL de 0,0135 con la tasa de rechazo de 0/100.
- Red-teaming de sistemas de moderación: al generar contenido que el modelo base rechazaba, permite estresar clasificadores y filtros de salida antes de desplegarlos en producción.
- Experimentación con cuantización ternaria: con 1,72 bits por peso, es un banco de pruebas para estudiar la pérdida de calidad de empaquetados PTQ1_0 frente a PQ2_0 en tareas concretas.
- Inferencia local en hardware de gama de consumo: sus ~5,9 GB de pesos permiten ejecutar un modelo de 27B en tarjetas con 12 GB de VRAM o en equipos Apple Silicon con memoria unificada, sin depender de la nube.
- Evaluación comparativa de empaquetados: las perplejidades medidas (10,1460 en PQ2_0 frente a 10,1435 en PTQ1_0 sobre WikiText-2) permiten reproducir la metodología de validación del autor y comprobar si las diferencias entre kernels afectan a casos reales.
- Generación de texto en inglés y japonés en un entorno controlado: las pruebas funcionales cubren aritmética, formato JSON, traducción y comprensión lectora, lo que da un punto de partida para pipelines de extracción estructurada.
- Docencia y demostraciones técnicas: sirve para ilustrar el compromiso entre compresión extrema y preservación de capacidades sin necesidad de infraestructura de centro de datos.
- Prototipado de asistentes conversacionales con contexto largo: los 32.768 tokens configurados en el ejemplo de uso permiten mantener conversaciones multi-turno extensas sobre documentación técnica en un único equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos aportados por el autor son métricas locales y una comparación de rechazos:

| Metrica | Este modelo | Modelo original (prism-ml/Ternary-Bonsai-2-27B-gguf) |
|---|---:|---:|
| Negativas (refusals) | 0/100 | 95/100 |
| Divergencia KL | 0,0135 | 0 (por definición) |
| Perplejidad en inglés (WikiText-2 test), PQ2_0 | 10,1460 | No disponible |
| Perplejidad en inglés (WikiText-2 test), PTQ1_0 | 10,1435 | No disponible |
| Perplejidad en japonés (harmless_alpaca_ja test), PQ2_0 | 16,7833 | No disponible |
| Perplejidad en japonés (harmless_alpaca_ja test), PTQ1_0 | 16,7744 | No disponible |
| Comprobaciones funcionales cortas | 16/16 (ambos empaquetados) | No disponible |

La perplejidad se midió con contexto de 512 tokens sobre 4.080 tokens puntuados en inglés y 3.570 en japonés, según el autor. El propio autor advierte que son pruebas locales pequeñas y que el rendimiento en contexto largo y el comportamiento de visión no se han evaluado en esta release.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 5,9 GB según el fabricante del modelo base; el repositorio completo ocupa 14,7 GB porque incluye más de un empaquetado (PTQ1_0 y PQ2_0), no porque una sola inferencia necesite ese espacio.
- Memoria adicional para caché KV: no disponible como cifra oficial. Depende del contexto configurado y de la proporción de capas de atención lineal del híbrido; en el ejemplo de uso se emplean 32.768 tokens.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM. Encajan con holgura tarjetas tipo RTX 3060 12 GB, RTX 4070/4080, RTX 4090, A100 y H100; en estas dos últimas el modelo es claramente de gama baja y se desaprovecharía el hardware.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 12 GB o más, y en equipos Apple Silicon con memoria unificada suficiente. En GPUs de 8 GB el ajuste depende del contexto y de los overheads del runtime; sin datos publicados, es una estimación.
- Opciones de despliegue: es obligatorio usar el fork de llama.cpp de Prism ML (PrismML-Eng/llama.cpp), ya que tanto PTQ1_0 como PQ2_0 requieren sus kernels ternarios y las transformadas de Hadamard sobre las activaciones. El binario `llama-server` funciona con el comando indicado en la model card. Compatibilidad con vLLM, TGI, Ollama u otros motores: no disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguno de los dos empaquetados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / compresion | Licencia | Notas |
|---|---:|---|---|---|---|
| ldov/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF | 26,9 mil millones | 32.768 tokens en el ejemplo de uso | GGUF ternario, ~1,72 bits/peso, 0/100 rechazos, KL 0,0135 | Apache 2.0 | Abliteración fundida en los pesos ternarios; requiere el fork de llama.cpp de Prism ML |
| prism-ml/Ternary-Bonsai-2-27B-gguf (original) | 26,9 mil millones | No disponible | GGUF ternario, ~1,72 bits/peso, 95/100 rechazos | Apache 2.0 (según la derivada) | Modelo base sin decensurar; referencia de la comparación de rechazos y de la divergencia KL |
| OrcaRouter Ternary Bonsai 2 27B Uncensored (Continuum-AI-Corp) | 26,9 mil millones (base `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`) | No disponible | Abliteración en tiempo de ejecución, sin re-cuantizar los pesos | No disponible | Enfoque alternativo: no modifica los pesos, aplica ablación de la dirección de rechazo en runtime |
| Qwen3.8 27B | 27 mil millones (aprox.) | No disponible | FP16/otras | No disponible | Modelo de origen de la familia; Prism ML afirma que Ternary Bonsai 2 27B conserva el 98,2 % de su rendimiento |

## Limitaciones y advertencias

- La alineación de seguridad ha sido sustancialmente reducida. El propio autor advierte de una mayor probabilidad de generar contenido dañino, inexacto, sesgado u ofensivo, y limita el uso a investigación, estudios de alineamiento y red-teaming.
- Riesgo elevado de alucinación y de afirmaciones no verificadas: el autor indica que todas las salidas deben tratarse como no fiables y verificarse de forma independiente.
- Sesgos: no se ha publicado ninguna evaluación de sesgos en la información disponible. La abliteración actúa sobre la dirección de rechazo, no sobre sesgos de representación, que permanecen sin caracterizar.
- La fusión de la LoRA es aproximada, no exacta en coma flotante. Solo se modificaron 34 matrices de 851 tensores totales, ajustando códigos ternarios y conservando las escalas de bloque, lo que introduce error acumulado respecto a una fusión convencional.
- Cobertura de idiomas no caracterizada: solo hay validación publicada en inglés y japonés; el resto de idiomas, incluido el español, no está evaluado.
- Rendimiento en contexto largo y comportamiento de visión sin evaluar en esta release; las pruebas de perplejidad usaron únicamente 512 tokens de contexto.
- Dependencia de un runtime específico: sin el fork de llama.cpp de Prism ML no hay soporte para los kernels ternarios ni para las transformadas de Hadamard, lo que complica el despliegue en plataformas gestionadas.
- La licencia declarada es Apache 2.0, pero la model card restringe el uso a investigación y desaconseja servicios públicos o de cara al usuario final; conviene revisar la compatibilidad entre ambas indicaciones antes de un uso comercial.
- Los ficheros son cuantizaciones ternarias: no es posible recuperar precisión FP16 a partir de ellos, y los ajustes finos posteriores sobre el GGUF son inviables en la práctica.
- Existe una discrepancia de atribución entre los metadatos de HuggingFace (autor `ldov`) y la model card (OS-Software), que conviene tener en cuenta al citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ldov/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
- Página alternativa del mismo modelo (OS-Software): https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Documentación de la familia Bonsai 2 27B: https://docs.prismml.com/bonsai-2-27b
- Anuncio de Bonsai 2 27B en PrismML: https://prismml.com/news/bonsai-2-27b
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Versión alternativa con abliteración en runtime (OrcaRouter): https://github.com/Continuum-AI-Corp/OrcaBonsai-27B-Uncensored
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Repositorio GGUF del autor con las cuantizaciones ternarias: https://huggingface.co/ldov/Ternary-Bonsai-2-27B-gguf
