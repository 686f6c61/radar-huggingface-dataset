# irishbumfuzzle/anlp-a2-p1-moe-top2

## Resumen

`irishbumfuzzle/anlp-a2-p1-moe-top2` es un checkpoint académico publicado en HuggingFace por el usuario `irishbumfuzzle` como parte 1 de la asignatura Advanced NLP (Assignment 2, Monsoon 2026). Se trata de un transformer decoder-only de 35.670.528 parámetros totales (29.379.072 activos) con capas de mezcla de expertos (MoE) de 4 expertos y enrutamiento top-2, dimensión de modelo D=512, 6 capas, 8 cabezas de atención, vocabulario BPE de 32.768 tokens y embeddings atados. Corresponde al checkpoint `final`, es decir, al final del presupuesto de entrenamiento.

El modelo resuelve una única tarea: traducción de vietnamita y japonés a inglés, formulada como generación autoregresiva sobre el formato `<lang> src <en> tgt`. El entrenamiento consumió 145.020.416 tokens del conjunto `belumind/en-vi-ja-curated-500k-triplets`. No es un modelo de propósito general: es un artefacto de evaluación académica, sin benchmarks publicados, sin licencia declarada y con cero descargas y cero likes en el momento de redactar esta ficha.

Su relevancia es principalmente didáctica y metodológica: permite estudiar el comportamiento de un enrutador MoE top-2 frente a una línea base densa a una escala de cómputo muy baja (menos de 150 millones de tokens), y sirve como ejemplo reproducible de traducción multilingüe con un decoder-only pequeño. Como herramienta de producción no está validado ni documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas MoE (4 expertos, enrutamiento top-2) |
| Parametros totales | 35.670.528 (~35,7 M) |
| Parametros activos | 29.379.072 (~29,4 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica `model.pt` (state_dict sin cuantizar) |
| Idiomas soportados | La model card declara la tarea vi/ja -> en; los metadatos de HuggingFace no declaran idiomas |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt` con state_dict y config), `config.json`, `tokenizer.json` (BPE byte-level v32768) |

Detalles arquitectónicos adicionales declarados: D=512, 6 capas, 8 cabezas de atención, vocabulario de 32.768 tokens, embeddings atados (tied embedding).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención completa y capas de mezcla de expertos. El componente MoE consta de 4 expertos con enrutamiento top-2, lo que explica la diferencia entre parámetros totales (35,67 M) y activos (29,38 M): en cada paso solo se activan dos expertos por token. La dimensión oculta es 512, con 6 capas y 8 cabezas (64 dimensiones por cabeza), y el vocabulario de 32.768 tokens procede de un tokenizador BPE byte-level entrenado sobre el split de entrenamiento del propio corpus. Los embeddings de entrada y salida están atados.

El entrenamiento se realizó sobre un presupuesto de 145.020.416 tokens extraídos de `belumind/en-vi-ja-curated-500k-triplets`, con el objetivo de traducción vi/ja -> en serializado mediante el prefijo `<lang> src <en> tgt`. El checkpoint publicado es el estado al agotar el presupuesto de tokens ("final"), no necesariamente el de mejor validación. No se documentan hiperparámetros de optimización, composición exacta del dataset, ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO) o instrucciones: esa información no está disponible.

## Capacidades

- Traducción de vietnamita a inglés y de japonés a inglés bajo el formato de prompt `<lang> src <en> tgt`.
- Generación de texto autoregresiva propia de un modelo decoder-only, condicionada al prefijo de idioma.
- Manejo de escrituras no latinas (vietnamita con diacríticos y japonés) gracias al tokenizador BPE byte-level de 32.768 tokens.
- Eficiencia de parámetros: al activar solo dos de los cuatro expertos, el coste de cómputo por token se corresponde con 29,4 M de parámetros activos frente a 35,7 M totales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo "thinking": no disponibles.
- Capacidades multilingües fuera de vi/ja -> en: no documentadas.

## Casos de uso

- Pre-traducción de documentación técnica del vietnamita al inglés: el modelo puede envolverse en un microservicio que reciba texto en vietnamita y devuelva una primera versión en inglés revisable por un traductor humano, aprovechando su tamaño reducido (71 MB en fp16) para ejecutarlo incluso en CPU.
- Traducción japonés-inglés en preprocesado de corpus de investigación: útil para convertir grandes volúmenes de texto japonés a inglés antes de indexarlo o analizarlo, siempre que se valide la calidad por muestreo, ya que no hay métricas publicadas.
- Filtrado y aumentación de corpus paralelos: las salidas del modelo pueden puntuarse con métricas tipo COMET y usarse para descartar pares ruidosos en un corpus en-vi-ja, dado que fue entrenado precisamente sobre ese dominio.
- Estudio de enrutamiento MoE en entornos docentes: con 4 expertos y top-2 resulta viable analizar el balanceo de carga entre expertos, la especialización por idioma o token y la brecha entre parámetros totales y activos sin necesidad de clústeres de GPU.
- Evaluación de tokenizadores BPE byte-level para escrituras no latinas: el `tokenizer.json` de 32.768 tokens permite medir tasas de compresión y fertilidad sobre vietnamita y japonés de forma aislada.
- Despliegue en entornos con memoria restringida (edge, portátiles, contenedores pequeños): con 35,7 M de parámetros, el modelo en fp16 ocupa aproximadamente 71 MB y puede servirse sin GPU dedicada.
- Reproducción de experimentos académicos: al publicarse el state_dict junto a `config.json`, otro investigador puede cargar el checkpoint y reanudar o comparar el entrenamiento con su propia línea base densa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de traducción (BLEU, chrF, COMET ni similares), ni comparaciones con líneas base, ni curvas de validación.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 35.670.528 parámetros, sin contar caché de activaciones): ~143 MB en fp32, ~71 MB en fp16/bf16, ~36 MB en int8 y ~18 MB en int4. Son estimaciones aritméticas; el repositorio no publica pesos cuantizados.
- Tamano del repositorio: 0,1 GB, coherente con los pesos en precisión completa del modelo.
- GPU recomendadas: no hay requisitos publicados. Por tamaño, cualquier GPU consumer con 2 GB o más de VRAM (por ejemplo, una GTX 1050 Ti o superior, RTX 3060, RTX 4090) está sobradamente dimensionada; A100 o H100 serían innecesarias.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU, dado el reducido número de parámetros.
- Opciones de despliegue: no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama. La carga requiere el código del repositorio de la asignatura (`src.part1.model.TransformerLM` y `src.part1.data.load_tokenizer`) y los pesos en `model.pt`; no se publican pesos en safetensors ni en GGUF. Sería necesaria una conversión manual del state_dict al formato de `transformers` u otro runtime para poder usar esos servidores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada, y este checkpoint carece de licencia, benchmarks y especificación de contexto, por lo que una comparación cuantitativa sería especulativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `irishbumfuzzle/anlp-a2-p1-moe-top2` | 35,67 M totales / 29,38 M activos | no disponible | no disponible | HuggingFace, requiere código propio |
| Alternativas comparables de traduccion vi/ja-en | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en HuggingFace ni en la model card, no puede asumirse ningún derecho de uso comercial. Debe tratarse como material académico sin autorización explícita de reutilización.
- Dependencia de código externo: el checkpoint solo carga con el repositorio de la asignatura (`src.part1.model`, `src.part1.data`). No funciona con `transformers`, vLLM, llama.cpp ni Ollama sin una conversión previa.
- Ausencia total de benchmarks: no hay BLEU, chrF ni COMET publicados, por lo que la calidad de traducción es desconocida y debe medirse antes de cualquier uso.
- Presupuesto de entrenamiento muy bajo: 145.020.416 tokens es un volumen reducido, lo que limita la cobertura léxica y la fluidez, especialmente en dominios especializados.
- Longitud de contexto no documentada: se desconoce la ventana máxima soportada, lo que impide planificar el truncado o el troceado de documentos largos.
- Formato de prompt obligatorio: el modelo espera el esquema `<lang> src <en> tgt`; usarlo con otras plantillas produce salidas no fiables.
- Riesgo de alucinacion: al ser un modelo generativo pequeño, puede producir contenido plausible pero incorrecto, especialmente con entradas fuera de la distribución del corpus de entrenamiento o ante frases largas y ambiguas.
- Sesgos: no se documenta la composición, el filtrado ni la procedencia del dataset `belumind/en-vi-ja-curated-500k-triplets`, por lo que no es posible auditar sesgos de género, registro o dominio.
- Idiomas limitados: solo se declara la dirección vi/ja -> en; no hay evidencia de funcionamiento en la dirección inversa ni en otros pares de idiomas.
- Señales de adopción nulas: 0 descargas y 0 likes en el momento de redactar esta ficha, y última actualización el 21 de septiembre de 2026, 8 minutos después de su creación, lo que sugiere un artefacto de entrega académica sin mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/irishbumfuzzle/anlp-a2-p1-moe-top2
- Paper, blog, repositorio o demo: no disponible.
- La búsqueda web realizada no devolvió ningún enlace relevante al modelo; los resultados obtenidos correspondían a agencias de viajes y paquetes turísticos sin relación con el contenido de esta ficha.
