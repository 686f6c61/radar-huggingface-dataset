# skala3-telescope/kf_deberta_finanace_ft

## Resumen

kf_deberta_finanace_ft es un modelo de embeddings de frases (sentence-transformers) especializado en terminología financiera y contable coreana, construido sobre el checkpoint oficial kakaobank/kf-deberta-base (185 millones de parámetros). Lo desarrolla el usuario skala3-telescope y resuelve un problema muy concreto: alinear y discriminar nombres de cuentas de estados financieros DART (el sistema coreano de divulgación electrónica) bajo taxonomía K-IFRS, incluyendo la distinción entre cuentas semánticamente próximas pero contablemente opuestas (por ejemplo, activo corriente frente a no corriente, o ingreso frente a gasto).

El modelo produce embeddings densos de 768 dimensiones con pooling de media y una longitud máxima de secuencia de 128 tokens, orientado a similitud por coseno. Se ha afinado en dos etapas: primero un alineamiento general de frases en coreano con KLUE-NLI y KLUE-STS, y después un ajuste multitarea sobre 106.874 pares financieros con un 15 % de replay de los datos generales para evitar el olvido catastrófico. Su relevancia actual radica en el auge de pipelines RAG sobre informes financieros: un recuperador genérico confunde cuentas con nombres parecidos, mientras que este modelo incorpora márgenes para pares negativos duros y contexto jerárquico del estado financiero.

La ficha se basa exclusivamente en la model card y en los metadatos de Hugging Face. El repositorio figura como privado según las instrucciones del autor, con 0 descargas en el momento de la consulta, y la licencia no está declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DebertaV2Model + Mean Pooling (Sentence-Transformers) |
| Parametros totales | 185.290.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | coreano (principal) e inglés (términos financieros cruzados) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 0,7 GB) |
| Dimension de embedding | 768 |
| Funcion de similitud | coseno (se recomienda normalización L2) |
| Modelo base | kakaobank/kf-deberta-base |
| Libreria | sentence-transformers 6.3.0, transformers 5.23.0, PyTorch 2.15.0+cu132 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder DeBERTa-v2 (variante coreana kf-deberta-base) del que se extrae la representación de la secuencia mediante mean pooling para obtener un vector de 768 dimensiones. El pipeline sentence-transformers declara explícitamente `max_seq_length: 128`, lo que limita el modelo a nombres de cuenta, etiquetas y fragmentos cortos, no a documentos completos. El entrenamiento sigue un esquema de dos etapas denominado `sts_first`: una etapa 0 de alineamiento general en coreano con 14.163 pares de KLUE-NLI (implicación y contradicción) y KLUE-STS (similitud ≥ 3,0) durante 3 épocas, y una etapa 1 multitarea sobre 106.874 pares financieros mezclados con un 15 % de replay de los pares KLUE (121.037 pares totales, 2 épocas, batch 64, learning rate 2e-5, temperatura 0,05, bf16).

La innovación técnica principal es la construcción de pares negativos duros. A partir de datos de coincidencia de importes en años consecutivos (`chain`/`chain_x`) se detectaron 25.684 casos ruidosos por conflicto de ID de cuenta estándar o por antónimos contables (corriente frente a no corriente, corto frente a largo, adquisición frente a disposición, aumento frente a disminución, ingreso frente a gasto, suma frente a resta); esos casos se eliminaron del conjunto positivo y se reutilizaron como negativos duros de máxima prioridad. Sobre la pérdida InfoNCE bidireccional se añade una Hard-Negative Margin Loss que penaliza similitudes de coseno superiores a 0,35 con el par negativo mínimo. La composición de datos es mayoritariamente sectorial: el 95,1 % corresponde a estados financieros DART de 2.638 empresas cotizadas y auditadas de todos los sectores, taxonomía IFRS/K-IFRS (etiquetas coreano-inglés, definiciones oficiales, jerarquía de presentación, signos de suma y resta) y anotaciones de unidades; el 4,9 % restante cubre desgloses de notas, siete agendas de informes de analistas y mapeo de cuentas de relaciones con inversores.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación densa (pipeline `sentence-similarity` y `feature-extraction`).
- Alineación de nombres de cuentas de estados financieros DART con la taxonomía estándar K-IFRS, en coreano e inglés.
- Discriminación de antónimos contables: distingue pares como corriente/no corriente, corto/largo plazo, adquisición/disposición o ingreso/gasto.
- Codificación de contexto jerárquico mediante prefijos de sección (por ejemplo `[BS|비유동부채]`) para desambiguar cuentas con el mismo nombre en secciones distintas.
- Anotación de unidades y slots monetarios (por ejemplo `(단위: 백만원)` o `KRW Billion`), aunque el autor recomienda delegar la conversión numérica al parser determinista.
- Recuperación RAG sobre informes de analistas y agendas de investigación (evaluado en `agenda_eval_v2`).
- Mapeo de cuentas de relaciones con inversores en coreano e inglés hacia cuentas DART.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo de embeddings, no generativo).
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Normalización de cuentas en pipelines de extracción de estados financieros: el modelo recibe el nombre de cuenta tal como aparece en el documento y devuelve el vecino más cercano de la taxonomía K-IFRS; con un 0,882 de precisión en `chain_dev_v1` (frente a 0,568 del modelo base) es adecuado para consolidar series históricas de una misma cuenta entre ejercicios.
- Recuperación RAG sobre informes anuales y notas: al indexar etiquetas de cuenta y definiciones oficiales con este encoder, el recuperador devuelve la cuenta correcta aunque la consulta use sinónimos o inglés; la ventana de 128 tokens obliga a indexar por fragmentos cortos, lo que encaja con la granularidad de una cuenta o una nota.
- Desambiguación de cuentas homónimas en secciones distintas: ante consultas como `[BS|비유동부채] 이연수익`, el prefijo de sección permite separar la cuenta correcta de su homónima corriente; útil en validadores de cuadres contables.
- Detección de errores de signo o clasificación: la capacidad de discriminar antónimos (0,637 en `antonym_discrim_v2` frente a 0,047 del base) permite marcar pares sospechosos como posibles errores de mapeo en un proceso de control de calidad de datos.
- Mapeo de informes de analistas a cuentas contables: los informes usan abreviaturas y términos en inglés; el modelo alcanza 0,832 en `irdart_telecom_v1` (0,348 en el base), por lo que sirve para enlazar afirmaciones de analistas con partidas DART en un pipeline de research.
- Búsqueda semántica de agendas de inversión: con 0,560 en `agenda_eval_v2`, se puede usar para agrupar y recuperar informes por temática en un buscador interno de research, siempre con un umbral de confianza y revisión humana.
- Deduplicación de catálogos de cuentas entre filiales: al comparar embeddings de los catálogos de distintas sociedades del grupo se detectan cuentas equivalentes con nombres distintos, reduciendo el trabajo manual de consolidación.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando el modelo con su base kakaobank/kf-deberta-base (métrica de precisión de alineación salvo donde se indica):

| Evaluacion | Items | Base | Modelo | Observaciones |
|---|---|---|---|---|
| chain_dev_v1 (150 empresas cotizadas) | 9.257 | 0,568 (unseen 0,512) | 0,882 (unseen 0,681) | Alineación general de cuentas |
| chain_telecom_v1 (4 telecos) | 402 | 0,617 (unseen 0,643) | 0,915 (unseen 0,830) | Pares nuevos no vistos, +18,7 pp |
| irdart_telecom_v1 (IR ko/en a DART) | 89 | 0,348 (unseen 0,356) | 0,832 (unseen 0,711) | Cuentas en inglés y abreviaturas |
| antonym_discrim_v2 | 300 | 0,047 (unseen 0,058) | 0,637 (unseen 0,510) | Discriminación de antónimos |
| agenda_eval_v2 (agendas de analistas) | 50 | 0,440 | 0,560 | RAG sobre informes no vistos |
| KLUE-STS (correlación de Spearman) | 519 | 0,455 | 0,820 | Retención de similitud general |

No se han publicado resultados de benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K) en la información disponible, lo que es coherente con la naturaleza del modelo como encoder de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 185 millones de parámetros ocupan aproximadamente 0,74 GB; en fp16/bf16, unos 0,37 GB; en int8, alrededor de 0,19 GB. A ello hay que sumar el overhead de activaciones y del runtime, por lo que en la práctica basta con 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; para lotes grandes de indexación conviene una A100, H100 o L40S por throughput, y una RTX 4090 o RTX 3090 para desarrollo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060 o superior) e incluso en CPU para volúmenes moderados, dado el tamaño reducido del modelo.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`, por lo que es desplegable con el servidor TEI de Hugging Face), y exportación a ONNX para inferencia en CPU. No se documenta soporte de llama.cpp ni Ollama, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, un encoder de 185 millones de parámetros con secuencias de 128 tokens procesa lotes de cientos de textos por segundo en una GPU moderna, pero el dato no está publicado.
- Nota de acceso: el autor indica que el repositorio se opera como privado, por lo que la descarga requiere autenticación con token de Hugging Face (`hf auth login`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Enfoque |
|---|---|---|---|---|---|
| kf_deberta_finanace_ft | 185 M | 128 tokens | 768 | no disponible | Embeddings financieros coreano K-IFRS/DART |
| kakaobank/kf-deberta-base | 185 M | 512 tokens (típico de DeBERTa-v2) | 768 | no disponible | Encoder general coreano, sin ajuste de similitud |
| Dragonkue/BGE-m3-ko | no disponible en la información | no disponible | no disponible | no disponible | Embeddings multilingües generales |
| jhgan/ko-sroberta-multitask | 110 M aprox. (no confirmado) | no disponible | 768 | no disponible | Embeddings generales coreano (STS) |

La comparación con alternativas genéricas de embeddings en coreano no puede cuantificarse con datos de la información disponible: solo se dispone de la comparación directa contra el modelo base, que muestra mejoras de 20 a 60 puntos en las tareas financieras. Frente a un encoder general, la ventaja esperable es la precisión en terminología contable y la discriminación de antónimos; la desventaja es la ventana de 128 tokens, insuficiente para documentos completos.

## Limitaciones y advertencias

- Ventana de contexto muy corta (128 tokens): no admite documentos largos; hay que trocear por cuenta, etiqueta o frase.
- Especialización estrecha: está optimizado para terminología financiera coreana; su rendimiento en otros dominios o idiomas no está evaluado.
- Idiomas: el coreano es el idioma principal; el inglés solo se cubre para términos financieros cruzados, no como capacidad general.
- Riesgo de falsos positivos en cuentas homónimas si no se usa el prefijo de sección jerárquica recomendado por el autor.
- El modelo no genera texto ni razona: no debe usarse para tareas generativas, de tool calling ni de agentes.
- Sesgos: el entrenamiento se apoya en estados financieros de empresas cotizadas y auditadas coreanas (2.638 compañías) y en informes de analistas; puede infrarrepresentar sectores pequeños, empresas no cotizadas o terminologías no estándar.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de asignación incorrecta de cuentas cuando la similitud es alta entre candidatos; se recomienda umbral de confianza y validación contra el ID estándar de cuenta.
- Licencia no declarada: no hay confirmación de permisos para uso comercial. Además, el autor advierte que el entrenamiento usó etiquetas y definiciones de la taxonomía de la IFRS Foundation y un corpus interno de analistas, y recomienda mantener el repositorio privado y no redistribuir los datos de entrenamiento.
- Repositorio privado y con 0 descargas en el momento de la consulta: la disponibilidad pública a largo plazo no está garantizada.
- La conversión de unidades y los cálculos numéricos deben hacerse en código determinista, no delegarse al modelo.
- No se han publicado datos de latencia, throughput ni cuantizaciones oficiales, lo que dificulta planificar despliegues a gran escala sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skala3-telescope/kf_deberta_finanace_ft
- Modelo base: https://huggingface.co/kakaobank/kf-deberta-base
- Librería sentence-transformers: https://www.sbert.net/
- Servidor Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- DART (sistema coreano de divulgación electrónica): https://dart.fss.or.kr/
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.
