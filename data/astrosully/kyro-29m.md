# Astrosully/Kyro-29M

## Resumen

Kyro-29M es un modelo de lenguaje de 29,1 millones de parámetros entrenado desde cero por el autor independiente Astrosully. Se trata de un transformer decoder-only de tipo pre-norm, descendiente directo de la arquitectura nanochat de Andrej Karpathy, con seis capas, anchura de 448 y siete cabezas de atención. Su particularidad principal no es el rendimiento bruto, sino el método de diseño: la arquitectura y la receta de entrenamiento fueron descubiertas por un agente de investigación autónomo que ejecutó cientos de experimentos cronometrados en una GPU de portátil (RTX 4060), y el resultado final se entrenó a escala completa en una única RTX 5090 alquilada durante 14,9 horas.

El modelo se entrenó sobre 30.000 millones de tokens (aproximadamente 1.030 tokens por parámetro) a partir de una mezcla de FineWeb-Edu, SmolLM-Corpus, FineMath y Wikipedia, tokenizados con un vocabulario propio de 16.384 entradas BPE a nivel de byte. El resultado es un modelo base (no instruido) con una ventana de contexto de solo 512 tokens, orientado exclusivamente al inglés y publicado bajo licencia Apache 2.0.

Es relevante ahora por dos motivos. Primero, como demostración metodológica de que un bucle de autoresearch con verificación automática puede producir decisiones de arquitectura no triviales (value residual, atajos tipo U-Net, token smear, cabeza de salida entrenada con Muon) en un presupuesto de cómputo mínimo. Segundo, como caso de estudio de entrenamiento eficiente: 5,2 × 10¹⁸ FLOPs para un modelo que alcanza 1,084 bits por byte en validación de FineWeb-Edu. No obstante, sus cifras absolutas en benchmarks de sentido común lo sitúan muy por debajo de modelos pequeños contemporáneos, por lo que su interés es fundamentalmente educativo y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-norm (estilo nanochat) con RMSNorm sin parámetros, SwiGLU, RoPE parcial, value residual, atajos U-Net, token smear y escalares residuales por capa |
| Parametros totales | 29.125.844 (14,7 M en embedding de entrada y cabeza de salida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan versiones GGUF, INT8 ni INT4) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` en float32 (117 MB); tokenizador en fichero de rangos tiktoken (`kyro.tiktoken`) más `tokenizer_config.json` |

Datos adicionales de arquitectura: 6 capas, anchura 448, 7 cabezas de atención con dimensión de cabeza 64, vocabulario de 16.384 tokens (BPE a nivel de byte), embeddings de entrada y salida no atados, sin sesgos y sin logit softcap. Cómputo de entrenamiento aproximado de 5,2 × 10¹⁸ FLOPs.

## Arquitectura y entrenamiento

La arquitectura parte de un transformer decoder-only pre-norm con normalización RMSNorm sin parámetros aprendidos, MLP SwiGLU con expansión 8/3, ausencia de sesgos y embeddings de entrada y salida independientes. Sobre esa base, el agente de autoresearch incorporó cuatro modificaciones que redujeron la pérdida de validación a presupuesto de tiempo fijo: embeddings rotatorios parciales (RoPE aplicado solo a la primera mitad de cada cabeza de 64 dimensiones, dejando la otra mitad sin señal posicional); escalares residuales por capa y de salto de entrada, de modo que cada bloque calcula `λ_res·x + λ_0·x₀` sobre la embedding normalizada; value residual al estilo ResFormer (arXiv 2410.17897), donde las capas 1 a 5 suman un múltiplo aprendido de los values de atención de la capa 0 a los propios; atajos tipo U-Net, en los que la capa 5−i vuelve a sumar la entrada de la capa i mediante un escalar aprendido; y token smear, una puerta aprendida por canal que mezcla la embedding de cada posición con la del token anterior de forma estrictamente causal. Todos estos añadidos arrancan en cero, de forma que el modelo empieza entrenando como un transformer plano y aprende cuánto usar de cada mecanismo.

El entrenamiento se dividió en dos fases. La búsqueda de arquitectura la realizó un agente LLM que editaba un único `train.py` y entrenaba exactamente 5 minutos por edición en una RTX 4060 Laptop sobre TinyStories con el mismo tokenizador de 16K; el arnés conservaba un cambio solo si la mejora en bits por byte superaba el suelo de ruido medido, con comprobaciones de causalidad, fugas de datos, banda de recuento de parámetros, reserva de VRAM y sandbox sin red, y reauditaba a 15 minutos las mejoras prometedoras. El agente mantuvo Muon para matrices con LR alto (0,08 sobre lote de referencia de 2¹⁹ tokens) y momentum constante 0,95, 32K tokens por paso, decaimiento lineal del LR hasta cero con decaimiento de weight decay aparejado, diseño ancho y poco profundo con vocabulario de 16K, y la cabeza de salida entrenada con Muon a un tamaño de actualización 2× el de una matriz de bloque; rechazó tras medición differential attention, hyper-connections, QK-norm, atención comprimida, memoria de n-gramas y pesos ternarios. La configuración ganadora (`7b25048`) se congeló y se entrenó a escala completa sobre una mezcla de 14,5B tokens construida para la ejecución (FineWeb-Edu, SmolLM-Corpus, FineMath y Wikipedia), aunque la model card declara 30B tokens de entrenamiento en la cabecera y 14,5B en la sección de datos, discrepancia que conviene tener en cuenta.

## Capacidades

- Generación de texto en inglés: continuación de texto libre y generación de párrafos cortos coherentes a partir de un prompt.
- Modelado de lenguaje base: útil para perplejidad, bits por byte y evaluación de recetas de entrenamiento, no para tareas instruccionales.
- Razonamiento elemental: resuelve parcialmente tareas de sentido común y ciencia a nivel de elección múltiple (ver benchmarks), sin capacidad de razonamiento multi-paso fiable.
- Conocimiento factual limitado: absorbido de FineWeb-Edu, Wikipedia y FineMath, con cobertura superficial y alta propensión a error en detalles.
- Capacidad matemática básica: influida por el subconjunto FineMath, suficiente para aritmética simple y notación elemental, no para problemas competitivos.
- Multilingüismo: nulo más allá del inglés; el vocabulario de 16K está entrenado sobre FineWeb-Edu y está optimizado para inglés.
- Tool calling / function calling: no soportado.
- Comportamiento agéntico y razonamiento multi-paso: no soportado.
- Modo thinking, visión, audio: no disponibles.
- Instrucción y diálogo: no disponibles en esta variante; existe una versión instruida publicada por separado (`Astrosully/Kyro-29M-Instruct`).

## Casos de uso

- Docencia y divulgación de arquitecturas transformer: el repositorio incluye un `modeling_kyro.py` de unas 200 líneas que solo depende de PyTorch, `safetensors` y `tiktoken`, lo que permite leer, modificar y ejecutar el modelo completo en una sesión de clase sin capas de abstracción.
- Investigación en recetas de entrenamiento: sirve como línea base reproducible para comparar variantes de normalización, posicionalidad o inicialización a escalas de decenas de millones de parámetros y presupuestos de cómputo de horas.
- Reproducción de experimentos de autoresearch: el modelo y su receta documentada permiten replicar el bucle de búsqueda de arquitectura con verificación automática y estudiar qué decisiones sobreviven a la reauditoría.
- Prototipado rápido en CPU: con 117 MB en float32 y 29 M de parámetros, la inferencia cabe holgadamente en CPU y en cualquier GPU de consumo, lo que facilita pruebas de integración de tokenizadores, pipelines de decodificación y utilidades de evaluación sin coste de infraestructura.
- Evaluación comparativa de tokenizadores: al usar un vocabulario BPE propio de 16K entrenado sobre FineWeb-Edu, es un banco de pruebas para medir el impacto del tamaño de vocabulario en bits por byte y en velocidad de entrenamiento.
- Generación de texto de relleno y demostraciones: útil para ejemplos de continuación de texto en documentación técnica, tutoriales y pruebas de interfaz donde la calidad factual no es crítica y el coste debe ser prácticamente nulo.
- Estudio de eficiencia energética: con una ejecución de 14,9 horas en una única RTX 5090 y 5,2 × 10¹⁸ FLOPs, permite analizar curvas de escalado y eficiencia de cómputo en el régimen de modelos sub-100M.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Ninguno está verificado de forma independiente (`verified: false`).

| Benchmark | Metrica | Resultado (0-shot) |
|---|---|---|
| HellaSwag | acc_norm | 29,4 |
| ARC-Easy | acc_norm | 41,0 |
| ARC-Challenge | acc_norm | 23,2 |
| PIQA | acc_norm | 58,7 |
| SciQ | acc_norm | 63,3 |
| LAMBADA (OpenAI) | acc | 25,0 |

Adicionalmente, la model card declara 1,084 bits por byte en validación de FineWeb-Edu. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas de razonamiento, código o matemáticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (117 MB de pesos más estados de activación y caché KV para 512 tokens). En float16 o bfloat16 bajaría a unos 60 MB de pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una RTX 4060 Laptop; el modelo se entrenó y evaluó en ese perfil y en una RTX 5090. También funciona en CPU sin problemas.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas (RTX 20xx, 30xx, 40xx, 50xx) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: no es una arquitectura `transformers`, por lo que `AutoModel` no lo carga. El despliegue estándar es el script propio `modeling_kyro.py` con PyTorch, `safetensors` y `tiktoken`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni versiones GGUF.
- Latencia y throughput estimados: no disponibles. Por el tamaño (29 M de parámetros, 512 tokens de contexto) se espera decodificación muy rápida en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kyro-29M | 29,1 M | 512 | Apache 2.0 | safetensors (float32) | Arquitectura propia, no `transformers`; solo inglés; base sin instruir |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | safetensors, GGUF | Aproximadamente 4,6× más parámetros; integración nativa en `transformers` y llama.cpp |
| GPT-2 small | 124 M | 1.024 | MIT | safetensors, GGUF | Referencia histórica; aproximadamente 4,3× más parámetros; ampliamente soportado |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | safetensors, GGUF | Aproximadamente 38× más parámetros; no comparable en presupuesto de cómputo |

La comparación debe leerse con cautela: Kyro-29M opera en un régimen de cómputo muy inferior y no se han publicado evaluaciones cruzadas con estos modelos en la información disponible. En benchmarks de sentido común, sus cifras (HellaSwag 29,4; PIQA 58,7) están por debajo de lo que se espera de modelos de 100 M o más parámetros entrenados con recetas convencionales, lo que es consistente con su escala y con un presupuesto de entrenamiento de 5,2 × 10¹⁸ FLOPs.

## Limitaciones y advertencias

- Ventana de contexto de solo 512 tokens: insuficiente para documentos largos, conversaciones multi-turno extensas o código con contexto amplio.
- Solo inglés: no hay soporte multilingüe; el vocabulario de 16K está entrenado sobre FineWeb-Edu y penaliza otros idiomas.
- Modelo base sin instruir: no sigue instrucciones, no mantiene formato de diálogo y no está alineado; requiere few-shot o ajuste fino para tareas concretas.
- Riesgo alto de alucinación: con 29 M de parámetros y conocimiento factual superficial, cualquier dato concreto generado debe verificarse.
- Sesgos: no se documenta ningún análisis de sesgo; al entrenarse sobre FineWeb-Edu, Wikipedia y FineMath, hereda los sesgos de esas fuentes sin mitigación conocida.
- Benchmarks no verificados: todos los resultados del model-index están marcados como `verified: false` y proceden del propio autor.
- Discrepancia en datos de entrenamiento: la cabecera de la model card indica 30B tokens, mientras que la sección de datos describe una mezcla de 14,5B tokens; conviene tratar la cifra como no confirmada.
- Integración limitada: al no ser una arquitectura `transformers`, no funciona con `AutoModel`, vLLM, TGI ni llama.cpp sin trabajo de portabilidad; no hay pesos GGUF ni cuantizaciones publicadas.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no apto para pipelines agénticos.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no obstante, la calidad del modelo hace inviable su uso comercial en producción más allá de experimentación.
- Sin garantías de mantenimiento: autor independiente, cero descargas y cero likes en el momento de la ficha, lo que sugiere un proyecto de investigación personal sin soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Astrosully/Kyro-29M
- Versión instruida: https://huggingface.co/Astrosully/Kyro-29M-Instruct
- Paper de ResFormer (value residual): https://arxiv.org/abs/2410.17897
- nanochat (arquitectura de referencia de Karpathy): no disponible en la información proporcionada
- Repositorio de código: no disponible (el script `modeling_kyro.py` se distribuye dentro del repositorio de HuggingFace)
- Demo o Space: no disponible
- Blog del autor: no disponible
