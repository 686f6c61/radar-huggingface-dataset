# mradermacher/Mimesis-26B-A4B-GGUF

## Resumen

Mimesis-26B-A4B-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo Mimesis-26B-A4B, publicada por el usuario mradermacher. El modelo original lo desarrolla SubMaroon y se distribuye bajo los tags `gemma4`, `moe`, `roleplay`, `distillation` y `experimental`, lo que indica que se trata de un modelo de arquitectura Mixture of Experts derivada de la familia Gemma 4, afinado específicamente para roleplay y generación conversacional, y entrenado mediante destilación. El repositorio cuantizado tiene como único propósito facilitar la ejecución local del modelo original en hardware de consumo mediante llama.cpp y derivados.

El dato más relevante a nivel técnico es el recuento real de parámetros en safetensors: 25.233.142.046 (aproximadamente 25,2 mil millones). El sufijo A4B del nombre sugiere, según la convención habitual de los MoE, en torno a 4 mil millones de parámetros activos por token, aunque el autor no publica esa cifra de forma explícita. El repositorio ocupa 182,9 GB, lo que corresponde a los pesos originales en precisión completa más los ficheros GGUF de las distintas cuantizaciones.

La ficha resulta relevante ahora porque permite evaluar un modelo experimental de roleplay de gran tamaño con licencia y contexto no documentados, y porque las cuantizaciones publicadas (desde Q2_K de 10,7 GB hasta Q8_0 de 27,0 GB) hacen viable su despliegue en estaciones de trabajo con GPU de consumo. No obstante, la ausencia de model card detallada, benchmarks y licencia explícita obliga a tratar el modelo con cautela en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 (tag `gemma4`, `moe`) |
| Parámetros totales | 25.233.142.046 (25,2 B) |
| Parámetros activos | no disponible (el sufijo A4B sugiere ~4 B activos, sin confirmación del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas; sin quants con imatrix) |
| Idiomas soportados | inglés (en), ruso (ru) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Modelo base | SubMaroon/Mimesis-26B-A4B |
| Tamaño del repositorio | 182,9 GB |
| Librería declarada | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts etiquetado como `gemma4`, lo que lo sitúa en la línea de modelos Gemma de Google. El tag `moe` confirma el uso de capas con enrutamiento disperso a expertos, y el nombre A4B apunta a un régimen de aproximadamente 4 mil millones de parámetros activos por token sobre un total de 25,2 mil millones, un ratio de activación cercano al 16 %. El tag `distillation` indica que el entrenamiento del modelo base recurrió a destilación, presumiblemente desde un modelo mayor, aunque el autor no detalla el profesor utilizado ni el volumen de datos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. La model card del repositorio cuantizado es puramente operativa: documenta los ficheros GGUF generados y enlaza al modelo original, sin reproducir detalles de entrenamiento. Las cuantizaciones son estáticas, sin variantes ponderadas con imatrix, lo que según el propio autor puede implicar una calidad ligeramente inferior a la de quants con matriz de importancia en los rangos bajos.

## Capacidades

- Generación de texto conversacional y de roleplay, ámbito declarado explícitamente en los tags del modelo.
- Razonamiento multi-turno orientado a personajes y diálogo prolongado, aunque sin datos públicos sobre longitud de contexto efectiva.
- Capacidades multilingües limitadas a inglés y ruso según los metadatos de idioma.
- Ejecución local mediante llama.cpp y ecosistema GGUF, con soporte para offloading parcial a CPU.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está afinado específicamente para este dominio según los tags, y las cuantizaciones Q4_K_M y Q5_K_M ofrecen un equilibrio razonable entre calidad y huella de memoria para sesiones conversacionales largas en una sola GPU.
- Prototipado de chatbots de personaje: con Q4_K_S (15,6 GB) se puede desplegar un asistente con personalidad definida en una RTX 4090 de 24 GB, dejando margen para el contexto KV.
- Investigación sobre destilación en MoE: al ser un modelo experimental con etiqueta `distillation`, sirve para estudiar cómo se comportan las cuantizaciones agresivas (Q2_K, Q3_K) sobre conocimiento destilado en arquitecturas dispersas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once variantes del mismo modelo, lo que permite medir la degradación de perplejidad y coherencia conversacional entre Q2_K y Q8_0 sobre un mismo prompt set.
- Generación de diálogo en ruso e inglés: para aplicaciones bilingües en esos dos idiomas, el modelo puede emplearse como generador de respuestas en un pipeline de chat, siempre que se valide la calidad caso por caso.
- Despliegue en estaciones sin GPU dedicada de gran VRAM: las variantes Q2_K (10,7 GB) y Q3_K_S (12,3 GB) permiten ejecución con offloading parcial a CPU en equipos con 16 GB de RAM y GPU modesta, a costa de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~10,7 GB, Q3_K_S ~12,3 GB, Q3_K_M ~13,4 GB, Q3_K_L ~13,9 GB, IQ4_XS ~14,2 GB, Q4_K_S ~15,6 GB, Q4_K_M ~16,9 GB, Q5_K_S ~18,1 GB, Q5_K_M ~19,2 GB, Q6_K ~22,7 GB, Q8_0 ~27,0 GB. A estas cifras hay que sumar el espacio para la caché KV, cuyo tamaño depende del contexto configurado y no está documentado.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40 GB o H100 para Q6_K y Q8_0 con contextos largos; RTX 3090 (24 GB) como alternativa económica para cuantizaciones de 4 y 5 bits.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q5_K_M en tarjetas de 16-24 GB; Q6_K y Q8_0 requieren 24 GB con contexto corto o 40 GB para mayor holgura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI a través de servidores de inferencia, aunque no se especifica cuáles.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4 B activos, se espera un throughput superior al de un denso de 25 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mimesis-26B-A4B-GGUF | 25,2 B totales, ~4 B activos (sugerido) | no disponible | no disponible | GGUF | Roleplay, destilación, experimental |
| Gemma 2 27B (referencia de familia) | 27 B densos | 8K | Gemma Terms of Use | safetensors, GGUF | Modelo denso de propósito general de la misma familia nominal |
| Mixtral 8x7B | 46,7 B totales, 12,9 B activos | 32K | Apache 2.0 | safetensors, GGUF | MoE de referencia con licencia permisiva |
| Qwen2.5 32B | 32,5 B densos | 128K | Apache 2.0 | safetensors, GGUF | Alternativa densa con contexto largo y licencia clara |

La comparación es aproximada: no se dispone de benchmarks de Mimesis que permitan contrastar calidad, y la licencia del modelo no está publicada, lo que impide confirmar su aptitud para uso comercial frente a las alternativas con licencia Apache 2.0.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que contactar con el autor del modelo base antes de desplegarlo en producción.
- Modelo etiquetado como `experimental`: no ha pasado por un proceso de validación pública ni se han publicado evaluaciones de calidad.
- Riesgo de alucinación y de deriva de personaje inherente a los modelos afinados para roleplay, con posible pérdida de coherencia en conversaciones muy largas.
- Cobertura lingüística limitada a inglés y ruso; el castellano no figura entre los idiomas soportados, por lo que el rendimiento en español es incierto.
- Longitud de contexto no documentada: no se puede planificar el dimensionado de la caché KV ni garantizar el manejo de documentos largos.
- Cuantizaciones estáticas sin imatrix: las variantes de 2 y 3 bits pueden degradar notablemente la coherencia; el propio autor marca Q3_K_M como "lower quality".
- Sin datos de sesgos, filtrado de seguridad ni alineación; no apto para aplicaciones sensibles sin una capa adicional de moderación.
- El repositorio pesa 182,9 GB en total, lo que exige planificar la descarga selectiva de la cuantización concreta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mimesis-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Mimesis-26B-A4B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Mimesis-26B-A4B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
