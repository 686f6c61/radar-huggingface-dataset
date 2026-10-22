# 0arch-io/kisoku-3b-sft

## Resumen

Kisoku 3B SFT es la versión ajustada por instrucciones del modelo base Kisoku 3B Base, desarrollado **desde cero** (preentrenamiento y SFT) por un investigador individual, 0arch-io, con el apoyo de una beca de Google TPU Research Cloud (TRC). Emplea la arquitectura Granite (`GraniteForCausalLM`), idéntica a un transformer decoder-only tipo Llama pero con escalado de logits en tiempo de ejecución (factor 55,43), lo que permite convertir los pesos a GGUF y servirlos localmente con llama.cpp.

El modelo tiene 3.562.712.064 parámetros reales según los safetensors (el repositorio de GitHub lo denomina "3.2b"), 28 capas, dimensión oculta 3072, FFN de 8192, 24 cabezas de atención y 6 cabezas KV con Grouped-Query Attention, vocabulario de 128.256 tokens y una ventana de contexto de 4.096 tokens. El SFT se realizó con MaxText sobre TPU (unas 2.499 iteraciones, pérdida final ~1,6) usando una plantilla de chat propia en texto plano (`### User` / `### Assistant`) y un tokenizador personalizado incluido en el repositorio.

Su relevancia es fundamentalmente metodológica y de investigación: documenta de forma transparente un pipeline completo de entrenamiento en JAX/MaxText sobre TPU v4-32 con datos DCLM-Baseline 1.0 y FineWeb-Edu, y ofrece pesos con licencia Apache 2.0 y formato GGUF. El propio autor lo marca como **superado (superseded)** por Kisoku 1.6B y advierte de que el modelo base está infraentrenado, sin alineación de seguridad y enfocado al inglés, por lo que no es un candidato realista para producción frente a modelos del mismo tamaño con más cómputo de preentrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteForCausalLM (transformer decoder-only, denso, tipo Llama con logit scaling) |
| Parametros totales | 3.562.712.064 (~3,56 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | GGUF Q8_0 publicado (3,5 GB); el resto de cuantizaciones GGUF (Q4_K_M, Q5_K_M, etc.) no están documentadas en la información disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 7,1 GB) y GGUF (Q8_0) |
| Capas | 28 |
| Dimensión oculta | 3.072 |
| Tamaño FFN | 8.192 |
| Cabezas de atención / KV | 24 / 6 (GQA), dimensión por cabeza 128 |
| Vocabulario | 128.256 tokens (tokenizador propio en `kisoku-sft-tokenizer/`) |
| Función de activación | SiLU |
| Logit scaling | 55,43 (específico de Granite) |
| Plantilla de chat | texto plano propio: `### User` / `### Assistant` |
| Modelo base | 0arch-io/kisoku-3b-base |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de tipo Granite: 28 capas con atención multi-cabeza con 24 cabezas de consulta y 6 cabezas KV (GQA, ratio 4:1), dimensión de cabeza 128, FFN de 8.192 con activación SiLU, normalización y embeddings de 128.256 entradas. La particularidad frente a Llama es el *runtime logit scaling* con factor 55,43: los logits se reescalan en la cabeza de salida, lo que aplana drásticamente la distribución y obliga a ajustar la temperatura en inferencia (el autor recomienda ~0,01 para un comportamiento estándar, o bien un script proxy incluido que ajusta temperatura e inyecta `logit_bias` para tokens especiales).

El preentrenamiento se ejecutó con MaxText (JAX) sobre un TPU v4-32 durante 460.000 pasos, usando DCLM-Baseline 1.0 y FineWeb-Edu como corpus. El ajuste supervisado (SFT) se hizo también con MaxText sobre TPU, en torno a 2.499 pasos hasta una pérdida final de ~1,6, con una plantilla de chat en texto plano diseñada explícitamente para evitar problemas de tokens especiales fuera de vocabulario típicos de los tokenizadores de la familia Llama. No se aplicó RLHF ni DPO. El pipeline completo (código, tokenizador, documentación) es público, lo que convierte al modelo en un caso de estudio reproducible de entrenamiento *from scratch* en TPU con un presupuesto de cómputo limitado.

## Capacidades

- Generación de texto y seguimiento de instrucciones básico en inglés, tras el ajuste supervisado sobre el checkpoint base.
- Conversación de un solo turno o multi-turno dentro de la plantilla `### User` / `### Assistant`, con hasta 4.096 tokens de contexto compartido entre historial y respuesta.
- Razonamiento y conocimientos factuales limitados: al estar el base infraentrenado, no se debe esperar un rendimiento competitivo en tareas que exijan conocimiento enciclopédico o cadenas de razonamiento largas.
- Generación de código: capacidad no evaluada ni documentada en la información disponible; no hay evidencia publicada de calidad en HumanEval ni similares.
- Multilingüismo: únicamente inglés declarado; el tokenizador es propio y no se ha validado su comportamiento en castellano u otros idiomas.
- Tool calling / function calling: no disponible (no documentado ni entrenado explícitamente para ello).
- Uso como agente o razonamiento multi-paso: no disponible (sin entrenamiento específico ni modo *thinking*).
- Capacidades multimodales (visión, audio): inexistentes; el modelo es solo texto.
- Despliegue local: compatible con llama.cpp / `llama-server` en formato GGUF Q8_0, con endpoint compatible con la API de OpenAI (`/v1/chat/completions`).
- Tokenizador y plantilla de chat personalizados incluidos en el repositorio, reutilizables para experimentos propios.

## Casos de uso

- **Investigación sobre entrenamiento en TPU con MaxText**: el repositorio publica configuración, pasos y datos; sirve como referencia reproducible para estudiar el coste y las curvas de pérdida de un preentrenamiento de ~3,5 B en un v4-32, algo poco habitual en modelos abiertos de este tamaño.
- **Prototipado de pipelines de SFT**: al partir de un base checkpoint público y una plantilla de chat propia, es un banco de pruebas barato para validar recetas de instrucción, formateo de datos y evaluación antes de escalar a modelos mayores.
- **Despliegue local de chat en inglés sobre hardware de consumo**: el GGUF Q8_0 de 3,5 GB se sirve con `llama-server -c 4096` en una GPU de 8-12 GB o incluso en CPU, útil para demos internas, tests de integración de clientes compatibles con OpenAI y entornos sin conectividad.
- **Banco de pruebas de seguridad y *red-teaming***: el modelo carece de alineación (sin RLHF/DPO), por lo que puede emplearse en entornos controlados para estudiar modos de fallo, sesgos y comportamiento de un modelo sin filtros, nunca expuesto a usuarios finales.
- **Docencia sobre arquitecturas y tokenización**: permite ilustrar en clase las diferencias entre un tokenizador Llama y uno propio de 128.256 entradas, el efecto del logit scaling de Granite y el impacto de la temperatura en el muestreo.
- **Evaluación comparativa de cuantizaciones GGUF**: con un Q8_0 publicado y la posibilidad de generar otras cuantizaciones, sirve para medir degradación de perplejidad y latencia en llama.cpp en un modelo de ~3,5 B con GQA.
- **Generación de texto auxiliar de bajo riesgo** (etiquetado aproximado, resúmenes cortos en inglés, plantillas de respuesta) en flujos internos donde la calidad se valida a posteriori, no en atención al cliente directa.
- **Base para *fine-tuning* domain-specific**: la licencia Apache 2.0 y el tamaño contenido permiten reentrenar el modelo completo en una sola GPU de 24-80 GB con LoRA o QLoRA para dominios muy acotados en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a gráficas de benchmarks en `0arch.io/kisoku`, pero no se incluyen cifras (MMLU, HumanEval, GSM8K ni otras) en el material proporcionado, y el autor califica explícitamente el modelo base como infraentrenado y no competitivo. No se ofrecen tampoco datos de latencia o throughput.

## Requisitos de hardware

- **Pesos en BF16/FP16**: ~7,1 GB (coincide con el tamaño del repositorio). Con caché KV a 4.096 tokens (~84 KB por token según 28 capas × 6 cabezas KV × 128 dims × 2 × 2 bytes ≈ 344 MB) el consumo total ronda los 8-10 GB de VRAM; encaja en RTX 4080/4090 (16-24 GB), L4 (24 GB) y A100/H100 sin problema.
- **GGUF Q8_0**: 3,5 GB de pesos, ~4-5 GB de VRAM en total; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y en GPUs de 8 GB con contexto reducido.
- **GGUF Q4_K_M estimado**: ~2,2 GB de pesos y ~4 GB de VRAM estimados (una ficha de terceros indica ~4 GB de VRAM estimada y ~8 GB de disco para el paquete GGUF); viable en GPUs de 6-8 GB y en CPU.
- **CPU**: al ser un modelo de 3,5 B con GQA, la inferencia en CPU con llama.cpp es viable para uso interactivo con pocos usuarios concurrentes, aunque no hay cifras de tokens/s publicadas.
- **Opciones de despliegue documentadas**: llama.cpp / `llama-server` (comando incluido en la model card) y cualquier cliente compatible con la API de OpenAI apuntando a `http://localhost:8900/v1`. Carga en Transformers mediante `GraniteForCausalLM`. vLLM, TGI u Ollama no están documentados en la información disponible para este checkpoint concreto.
- **Ajuste de inferencia obligatorio**: por el logit scaling de 55,43, hay que usar temperatura ~0,01 o el script proxy incluido; de lo contrario el muestreo estándar (temperatura 0,7-1,0) produce salidas degeneradas.
- **Entrenamiento**: preentrenamiento y SFT ejecutados en TPU v4-32 con MaxText/JAX; no se dispone de estimación de horas ni de coste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Benchmark publicado |
|---|---|---|---|---|---|
| Kisoku 3B SFT | 3,56 B (3,56 B activos) | 4.096 | Apache 2.0 | en | no disponible |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 | Llama 3.2 Community License | multilingüe | sí (no comparable aquí) |
| Qwen2.5 3B Instruct | 3,09 B | 32.768 | Apache 2.0 | multilingüe (incl. es) | sí (no comparable aquí) |
| Gemma 2 2B IT | 2,61 B | 8.192 | Gemma Terms of Use | multilingüe | sí (no comparable aquí) |

La comparación cuantitativa de calidad no es posible: Kisoku 3B SFT no publica resultados de benchmarks y su autor reconoce que el preentrenamiento está por debajo del presupuesto de tokens de los modelos citados. Las diferencias objetivas están en la ventana de contexto (4.096 frente a 8.192-128.000), en el soporte multilingüe (solo inglés) y en la ausencia de alineación por RLHF/DPO. Sus ventajas relativas son la licencia Apache 2.0 sin cláusulas adicionales, la transparencia total del pipeline de entrenamiento y el soporte GGUF inmediato. Dentro del propio proyecto, Kisoku 1.6B es la versión vigente y sustituye a este checkpoint.

## Limitaciones y advertencias

- **Modelo superado**: la propia model card indica que esta es la versión 1 y que el lanzamiento actual es Kisoku 1.6B; no se recomienda iniciar nuevos desarrollos sobre este checkpoint.
- **Base infraentrenado**: el autor admite que el modelo necesita más tokens de preentrenamiento para ser competitivo; previsiblemente fallará en conocimiento factual, matemáticas y razonamiento multi-paso.
- **Sin alineación de seguridad**: no se aplicó RLHF ni DPO, por lo que no hay filtros ni rechazo de peticiones dañinas; no debe exponerse a usuarios finales sin una capa de moderación externa.
- **Solo inglés**: no hay evidencia de calidad en castellano; el tokenizador es propio y su comportamiento fuera del inglés no está validado (posible fragmentación excesiva y mayor coste por token).
- **Contexto corto**: 4.096 tokens limitan casos de uso con documentos largos, RAG con muchos fragmentos o conversaciones extensas.
- **Peculiaridad de inferencia**: el logit scaling de 55,43 exige temperatura ~0,01 o el proxy incluido; usar la configuración estándar de un cliente OpenAI produce resultados degenerados y puede interpretarse erróneamente como un fallo del modelo.
- **Riesgo de alucinación elevado** en un modelo pequeño, poco entrenado y sin alineación; cualquier salida factual debe verificarse.
- **Adopción muy baja**: 13 descargas y 1 *like* en el momento de la consulta, sin issues ni evaluaciones de terceros que permitan contrastar calidad; el único GGUF de terceros localizado es el de `mradermacher`.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero no exime de responsabilidad sobre las salidas; conviene conservar los avisos de atribución y citar el soporte de Google TRC.
- **Sesgos**: no se han publicado análisis de sesgo; los corpus DCLM-Baseline y FineWeb-Edu son filtrados pero no están libres de sesgos de dominio, idioma y representación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0arch-io/kisoku-3b-sft
- Modelo base: https://huggingface.co/0arch-io/kisoku-3b-base (referenciado como `0arch-io/kisoku-3b-base`; también aparece https://huggingface.co/0arch-io/kisoku-3b)
- Versión vigente Kisoku 1.6B: https://huggingface.co/0arch-io/kisoku-1.6b
- Página del proyecto (log de entrenamiento, gráficas de benchmark, instrucciones): https://0arch.io/kisoku
- Repositorio GitHub del proyecto: https://github.com/0arch-io/kisoku (subcarpeta SFT: https://github.com/0arch-io/kisoku/tree/main/sft)
- Repositorio GitHub Kisoku 3.2b: https://github.com/0arch-io/Kisoku-3.2b
- MaxText (framework de entrenamiento): https://github.com/AI-Hypercomputer/maxtext
- Google TPU Research Cloud (TRC): https://sites.research.google/trc/
- GGUF de terceros (mradermacher): https://huggingface.co/mradermacher/kisoku-3b-sft-gguf
- Ficha de terceros con estimación de VRAM: https://free2aitools.com/model/mradermacher/kisoku-3b-sft-gguf
