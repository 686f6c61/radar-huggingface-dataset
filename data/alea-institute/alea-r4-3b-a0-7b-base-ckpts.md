# alea-institute/alea-r4-3B-A0.7B-Base-ckpts

## Resumen

ALEA R4 3B-A0.7B Base es el modelo sucesor de ALEA R3, desarrollado por alea-institute, y se publica aquí como una colección de checkpoints intermedios de preentrenamiento, no como un modelo final. Emplea la arquitectura Qwen3-MoE sin modificaciones (clase `Qwen3MoeForCausalLM`, sin `trust_remote_code`): 3.315.557.632 parámetros totales con embeddings de entrada/salida atados y aproximadamente 673 millones de parámetros activos por token, gracias a 48 expertos enrutados con enrutamiento top-6. El contexto es de 4.096 tokens y el tokenizador es propio (`alea-v2b-sw32k`, BPE de 32.768 tokens).

El problema que aborda es la transparencia en el preentrenamiento: cada checkpoint vive en su propia rama del repositorio (`s1-step1000`, `s2-step5000`, `s3-step19000`, etc.), de modo que un investigador puede cargar cualquier estado intermedio con `transformers` y `revision=` y trazar qué aprende el modelo a lo largo del entrenamiento. Los datos son exclusivamente de dominio jurídico, regulatorio y financiero de fuentes públicas de EE. UU. (KL3M Data Project), más datos sintéticos, de diccionario, de conocimiento y de tareas generados por ALEA.

Es relevante ahora por dos motivos. Primero, porque es un MoE de apenas 673M activos entrenado en una única GPU NVIDIA GH200, lo que lo convierte en un caso de estudio práctico sobre eficiencia de entrenamiento. Segundo, porque la model card advierte explícitamente de que son checkpoints base sin instrucción y con las comprobaciones de seguridad y comportamiento pendientes: no es un lanzamiento, sino material de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE estándar (`Qwen3MoeForCausalLM`); 32 capas, d_model 1.280, 16 cabezas de consulta / 8 de clave-valor (head_dim 128), QK-norm, RoPE (theta 1e6), 48 expertos enrutados (FFN 512) con top-6, embeddings entrada/salida atados |
| Parametros totales | 3.315.557.632 (embeddings entrada/salida atados) |
| Parametros activos | ≈ 673 millones por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Solo bf16 safetensors publicados; no hay GGUF, INT8 ni cuantizaciones oficiales |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 (contenido derivado de WordNet sujeto a `WORDNET_LICENSE.txt` adicional) |
| Formato de pesos | safetensors en bf16 (≈ 6,6 GB por rama/checkpoint) |

Otros datos de interés: tokenizador `alea-v2b-sw32k` (BPE de 32.768 tokens, con tokens de control y plantilla de chat; antepone `<|start|>` automáticamente); repositorio completo de 185,7 GB por acumulación de checkpoints; 43 descargas y 0 likes en el momento de la consulta; creado el 19 de octubre de 2026 y actualizado el 24 de octubre de 2026; pipeline `text-generation`; etiquetas `legal`, `moe`, `qwen3_moe`, `lawful-data`, `checkpoints`, `endpoints_compatible`, `region:us`.

## Arquitectura y entrenamiento

Transformer denso por capa pero con capa FFN sustituida por mezcla de expertos: 48 expertos de FFN de dimensión 512, de los cuales se activan 6 por token. Con 32 capas y d_model 1.280, el resultado es un modelo de 3,32B parámetros que solo computa 673M por token, lo que reduce el coste de inferencia muy por debajo de un denso equivalente. Se mantienen los detalles del Qwen3-MoE original: QK-norm, RoPE con theta 1e6 y embeddings de entrada/salida atados. Al ser arquitectura estándar, los pesos cargan con `transformers` 4.51 o superior (probado con 5.17; en versiones anteriores a 4.56 hay que usar `torch_dtype=` en lugar de `dtype=`) y con `Qwen3MoeForCausalLM` de vLLM.

El entrenamiento se hizo con OLMo-core sobre una única NVIDIA GH200, con 1.048.576 tokens por paso, optimizador AdamW y una tasa de aprendizaje de 4e-4 constante tras un calentamiento de 2.000 pasos, siguiendo un esquema WSD (el decaimiento llegaría en una fase posterior). Los datos son exclusivamente "lawful data": texto jurídico, regulatorio y financiero de registro público de EE. UU. procedente del KL3M Data Project, más datos sintéticos, de diccionario, de conocimiento y de tareas creados por ALEA. No se documenta en la información disponible ninguna fase de RLHF, DPO o ajuste por instrucciones: son checkpoints de modelo base. La model card organiza el entrenamiento en tres etapas (S1, S2 y S3) y publica un checkpoint aproximadamente cada 1.000 pasos hasta el paso 19.000-20.000.

## Capacidades

- Generación de texto autoregresiva en inglés, con especialización en registro jurídico, regulatorio y financiero.
- Aprendizaje en contexto (ICL): la suite interna de ICL alcanza 69,4 en el checkpoint `s3-step19000`, frente a 0,2 en el paso 1.000.
- Sondeo de conocimiento (knowledge probe): 87,6 global y 92,1 en el subconjunto jurídico en `s3-step19000`.
- Completado de cláusulas y fórmulas contractuales típicas ("This Agreement shall be governed by and construed in accordance with...").
- Plantilla de chat en el tokenizador y tokens de control, lo que facilita la conversión a formato instruccional mediante ajuste posterior.
- No dispone de tool calling ni function calling: es un modelo base sin ajuste de instrucciones y la información disponible no documenta ninguna capacidad de agente.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Multilingüismo: no disponible; la model card declara únicamente inglés.

## Casos de uso

- Estudio de dinámica de entrenamiento: cargar checkpoints intermedios con `revision=s2-step7000`, `s3-step14000`, etc. y medir la evolución de la perplejidad (BPB), del conocimiento factual y del aprendizaje en contexto. Es exactamente el uso para el que el autor publica las ramas.
- Investigación sobre eficiencia de MoE: reproducir el comportamiento de un modelo de 3,32B totales y 673M activos entrenado en una sola GH200, útil para calibrar presupuestos de cómputo y comparar enrutamiento top-6 frente a alternativas.
- Extracción de entidades y cláusulas en contratos: al haber sido preentrenado sobre registro público jurídico, sirve como base para fine-tuning de NER legal (partes, fechas, jurisdicción, indemnizaciones) con un conjunto etiquetado pequeño.
- Generación de datos sintéticos legales: usar el modelo para producir borradores de cláusulas y texto regulatorio que alimenten el entrenamiento de modelos mayores, filtrando después por calidad y verificando contra fuentes primarias.
- Fine-tuning supervisado para asistentes de dominio: aplicar SFT/DPO sobre un checkpoint tardío para construir un asistente de consulta normativa circunscrito a un corpus concreto, con recuperación aumentada por delante.
- Clasificación y enrutamiento documental: con 4.096 tokens de contexto y bajo coste por token, clasificar escritos regulatorios, resoluciones o prospectos financieros en categorías predefinidas mediante prompts de pocos ejemplos.
- Reproducción académica de tokenizadores de dominio: el par `alea-v2b-sw32k` más un checkpoint permite estudiar el efecto de un vocabulario de 32.768 tokens especializado en textos legales frente a tokenizadores generalistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas internas de validación por checkpoint: BPB en conjunto reservado, un sondeo de conocimiento (global y jurídico) y una suite de aprendizaje en contexto (ICL).

| Rama | Paso | Etapa | Tokens vistos | BPB reservado | Conocimiento global / jurídico | Suite ICL |
|---|---:|---|---:|---:|---:|---:|
| s1-step1000 | 1.000 | S1 | 1,05B | 0,956 | 31,1 / 29,9 | 0,2 |
| s1-step2000 | 2.000 | S1 | 2,10B | 0,695 | 33,1 / 42,7 | 2,0 |
| s1-step3000 | 3.000 | S1 | 3,15B | 0,622 | 38,7 / 51,2 | 7,0 |
| s1-step4000 | 4.000 | S1 | 4,19B | 0,585 | 42,9 / 61,0 | 19,2 |
| s2-step5000 | 5.000 | S2 | 5,24B | 0,557 | 76,4 / 84,8 | 36,8 |
| s2-step6000 | 6.000 | S2 | 6,29B | 0,542 | 78,4 / 86,6 | 32,8 |
| s2-step7000 | 7.000 | S2 | 7,34B | 0,532 | 81,7 / 87,8 | 49,0 |
| s2-step8000 | 8.000 | S2 | 8,39B | 0,524 | 82,9 / 86,0 | 46,8 |
| s2-step9000 | 9.000 | S2 | 9,44B | 0,517 | 83,8 / 91,5 | 57,2 |
| s2-step10000 | 10.000 | S2 | 10,49B | 0,513 | 81,7 / 88,4 | 56,6 |
| s2-step11000 | 11.000 | S2 | 11,53B | 0,507 | 84,4 / 92,7 | 57,6 |
| s2-step12000 | 12.000 | S2 | 12,58B | 0,505 | 84,1 / 93,3 | 60,8 |
| s2-step12400 | 12.400 | S2 | 13,00B | 0,504 | 84,6 / 92,1 | 56,2 |
| s3-step13000 | 13.000 | S3 | 13,63B | 0,483 | 84,3 / 87,2 | 60,0 |
| s3-step14000 | 14.000 | S3 | 14,68B | 0,481 | 81,7 / 90,8 | 67,4 |
| s3-step15000 | 15.000 | S3 | 15,73B | 0,477 | 84,4 / 89,6 | 64,6 |
| s3-step16000 | 16.000 | S3 | 16,78B | 0,475 | 83,5 / 87,8 | 59,6 |
| s3-step17000 | 17.000 | S3 | 17,83B | 0,474 | 82,8 / 89,0 | 65,2 |
| s3-step18000 | 18.000 | S3 | 18,87B | 0,473 | 82,8 / 92,7 | 63,2 |
| s3-step19000 | 19.000 | S3 | 19,92B | 0,471 | 87,6 / 92,1 | 69,4 |

La model card consultada se interrumpe en el paso 20.000, por lo que los datos de ramas posteriores no están disponibles. Obsérvese que el salto grande de conocimiento se produce entre `s1-step4000` (42,9) y `s2-step5000` (76,4), coincidiendo con el cambio de etapa.

## Requisitos de hardware

- VRAM para inferencia en bf16: ≈ 6,6 GB de pesos. La caché KV, calculada a partir de 32 capas × 8 cabezas KV × head_dim 128 × 2 bytes, ocupa unos 128 KB por token, es decir, ≈ 512 MB a los 4.096 tokens de contexto máximo. Con activaciones y overhead de runtime, el total estimado se sitúa en 8-10 GB.
- Cuantizaciones hipotéticas (no publicadas): INT8 ≈ 3,3 GB e INT4 ≈ 1,7 GB de pesos, alcanzables convirtiendo los safetensors, pero el autor no distribuye esos formatos.
- Cabe sin problema en GPU de consumo: RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB), RTX 4060 Ti de 16 GB e incluso tarjetas de 12 GB en bf16 con contexto recortado. Al ser MoE con 673M activos, el cómputo por token es reducido.
- GPU de centro de datos: A100, H100, GH200 y L40S quedan sobradamente dimensionadas; el cuello de botella es memoria, no cómputo.
- Despliegue: `transformers` 4.51+ (probado con 5.17) con `device_map="auto"`, y vLLM mediante `Qwen3MoeForCausalLM`. Soporte en llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos/token | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ALEA R4 3B-A0.7B (este) | 3,32B | ≈ 673M | 4.096 | CC-BY-4.0 | MoE 48 expertos top-6; checkpoints base intermedios |
| ALEA R3 MoE | 2B (según denominación del repo) | 417M (según denominación del repo) | no disponible | no disponible | Predecesor directo; el autor lo enlaza como modelo anterior de la saga |
| Familia Qwen3-MoE | no disponible en la información proporcionada | no disponible | no disponible | no disponible | R4 reutiliza su arquitectura, su tokenizador no, y no se aportan comparaciones directas |

No se han encontrado en la información disponible comparaciones publicadas con otros modelos de la misma categoría (MoE pequeños especializados en dominio jurídico), ni cifras de benchmarks que permitan un enfrentamiento cuantitativo. La comparativa con Qwen3-MoE se limita a la arquitectura: ALEA R4 usa la clase estándar, pero con tokenizador propio de 32.768 tokens y datos exclusivamente jurídicos.

## Limitaciones y advertencias

- No es un modelo instruccional ni un producto: son checkpoints de preentrenamiento intermedios y el autor indica explícitamente que el estado de seguridad y comportamiento está "pendiente de comprobaciones finales". No debe desplegarse de cara al público.
- Solo inglés. Cualquier uso en castellano u otras lenguas carece de garantías y probablemente produzca resultados degradados.
- Contexto de 4.096 tokens, corto para revisión de contratos completos o expedientes regulatorios extensos; obliga a trocear documentos.
- Riesgo alto de alucinación en materia jurídica: el modelo puede generar citas, números de resolución o referencias normativas verosímiles pero inexistentes. Cualquier salida debe verificarse contra la fuente primaria.
- Sesgo de jurisdicción y de fuente: el corpus es de registro público de EE. UU. (KL3M), por lo que el modelo refleja terminología, instituciones y marcos regulatorios estadounidenses, y hereda los sesgos presentes en esos documentos.
- Calidad muy variable entre ramas: el BPB va de 0,956 en `s1-step1000` a 0,471 en `s3-step19000`. Elegir mal la rama produce un modelo prácticamente inútil; las ramas tempranas no deben usarse para nada que no sea investigación.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el contenido derivado de WordNet añade condiciones adicionales recogidas en `WORDNET_LICENSE.txt`, que hay que revisar antes de redistribuir.
- Validación comunitaria prácticamente nula (43 descargas, 0 likes) y fecha de creación muy reciente; no hay informes independientes de calidad.
- El repositorio completo ocupa 185,7 GB; conviene descargar una sola rama (≈ 6,6 GB) con `revision=` para no arrastrar todos los checkpoints.
- El tokenizador antepone `<|start|>` de forma automática; hay que tenerlo en cuenta al construir pipelines que ya añadan tokens especiales, para no duplicarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alea-institute/alea-r4-3B-A0.7B-Base-ckpts
- Rama de ejemplo (paso 19.000): https://huggingface.co/alea-institute/alea-r4-3B-A0.7B-Base-ckpts/tree/s3-step19000
- Predecesor ALEA R3 MoE: https://huggingface.co/alea-institute/alea-r3-moe-2b-a417m
- KL3M Data Project: mencionado en la model card como origen de los datos, sin URL en la información proporcionada.
- Repositorio OLMo-core (framework de entrenamiento citado): sin URL en la información proporcionada.
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Las entradas devueltas corresponden a una empresa francesa de mobiliario de oficina (aleaoffice.com), a un sitio de ejercicios de matemáticas (mathalea.fr), a la definición de "aléa" en el diccionario Larousse, a una empresa de mecanizado en Corrèze (alea19600.com) y a la página de Wikipedia del término "Aléa"; ninguna guarda relación con alea-institute ni con este modelo.
