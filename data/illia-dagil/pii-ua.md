# illia-dagil/pii-ua

## Resumen

pii-ua es un modelo de detección de información personal identificable (PII) en textos jurídicos ucranianos, desarrollado por illia-dagil. Se trata de un fine-tuning del modelo base Goader/liberta-large-v2 (una implementación de BERT-large adaptada al ucraniano, con 368 millones de parámetros) para la tarea de token classification, con el objetivo de localizar y etiquetar datos personales en resoluciones judiciales y otros documentos legales para su posterior pseudonimización.

El modelo resuelve un problema concreto del dominio legal ucraniano: la necesidad de anonimizar resoluciones judiciales publicadas en el registro electrónico (ЄДРСР) sustituyendo nombres, direcciones, números de identificación y otra información sensible por pseudónimos del estilo `ОСОБА_1`, `АДРЕСА_2`. Detecta cinco tipos de entidad (persona, dirección, número, información y organización) mediante un esquema BIO de 11 clases.

Es relevante porque la versión anterior (pii-ua-v2) presentaba un riesgo de desanonimización muy elevado (el 38,5 % de las personas conservaba su nombre visible en al menos una ocasión), mientras que esta versión lo reduce al 0,23 % (2 de 862 personas), manteniendo un macro F1 de 0,9043 en el conjunto de evaluación. El modelo está entrenado sobre un corpus de 100.988 documentos y se distribuye únicamente para inferencia en ucraniano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-large, fine-tuning de Goader/liberta-large-v2) |
| Parametros totales | 368.385.035 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (ventanas de 510 subword-tokens con solapamiento de 128 en documentos largos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor reporta fp32 y bf16 en entrenamiento) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT-large (24 capas, 1024 dimensiones ocultas, 16 cabezas de atención, 368 millones de parámetros) inicializado desde Goader/liberta-large-v2 y fine-tuneado como clasificador de tokens con 11 etiquetas en esquema BIO (O más B-/I- para cada uno de los cinco tipos de entidad). La cabeza de clasificación es lineal sobre la representación del primer subword de cada palabra, que es la unidad que recibe la etiqueta durante el entrenamiento.

El entrenamiento se realizó sobre el dataset illia-dagil/pii-ua en su revisión `oblast-centers-80+relabel-4-addresses`: 100.988 documentos (86.690 resoluciones judiciales y el resto de fuentes como Prozorro, licitaciones, RNSO, NAZK y registros públicos). Los documentos se fragmentaron en ventanas de 512 tokens con stride 128 y un máximo de 32 ventanas por documento, generando 566.573 ventanas de entrenamiento y 30.524 de validación. Se entrenaron 2 épocas (10.746 pasos) con AdamW, learning rate 2e-5, schedule lineal con calentamiento del 6 % de los pasos, weight decay 0,01, precisión bf16 y semilla 1, sobre una única NVIDIA B300. No se menciona RLHF ni DPO; es un fine-tuning supervisado clásico de token classification.

## Capacidades

- Detección de entidades de tipo persona (`ОСОБА`): nombres completos, apellidos con iniciales, en cualquier caso gramatical, incluyendo jueces, secretarios, abogados y partes.
- Detección de direcciones (`АДРЕСА`): direcciones con calle, o localidades pequeñas de residencia, registro o propiedad; excluye direcciones de tribunales y organismos públicos.
- Detección de números (`НОМЕР`): RNOKPP (identificador fiscal), pasaportes, teléfonos, IBAN y tarjetas, matrículas, VIN, números catastrales, códigos EDRPOU de sociedades, números de expediente y de unidades militares.
- Detección de información personal (`ІНФОРМАЦІЯ`): fechas de nacimiento y defunción, correo personal, sitios web, apodos y páginas de redes sociales.
- Detección de organizaciones (`ОРГАНІЗАЦІЯ`): nombres propios de tribunales, organismos públicos, bancos, sociedades, instituciones, centros de reclutamiento y establecimientos militares.
- Salida a nivel de token con etiquetas BIO, pensada para su agregación posterior en spans a nivel de palabra.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de clasificación de tokens.
- Capacidad monolingüe: solo ucraniano.

## Casos de uso

- Pseudonimización de resoluciones judiciales en el registro electrónico: el modelo permite sustituir automáticamente nombres, direcciones y números por pseudónimos (`ОСОБА_1`, `АДРЕСА_2`) antes de publicar sentencias, con un riesgo de desanonimización medido del 0,23 % en el conjunto de prueba.
- Anonimización de expedientes antes de compartirlos con terceros: integrado en un pipeline previo a la entrega de documentación a peritos, abogados externos o sistemas de gestión documental, reduce la exposición de datos personales en textos de 800 palabras por segundo en CPU.
- Cumplimiento normativo en bufetes y departamentos jurídicos: permite auditar corpus internos de sentencias y contratos para localizar PII antes de almacenarlos o entrenar otros modelos, con umbrales de confianza ajustables por tipo de entidad.
- Preparación de datasets para investigación jurídica: al etiquetar personas, direcciones y números, facilita la construcción de corpus anonimizados que cumplan con requisitos de protección de datos para su publicación o compartición académica.
- Desidentificación de documentos en procesos de digitalización de archivos judiciales: procesamiento por lotes de expedientes escaneados y transcritos, con ventanas de 512 tokens que cubren documentos largos mediante solapamiento.
- Filtrado de datos en registros públicos y plataformas de contratación: detección de PII en textos de Prozorro, licitaciones y registros, donde el modelo fue entrenado parcialmente, para evitar la publicación de datos personales en portales de transparencia.
- Enmascaramiento previo a la indexación o búsqueda: integrar el detector en un pipeline de búsqueda documental para que los índices almacenen pseudónimos en lugar de datos reales, manteniendo la utilidad de búsqueda sobre el resto del contenido.

## Benchmarks y rendimiento

Resultados sobre el conjunto de prueba de 240 resoluciones judiciales del ЄДРСР con datos personales restaurados sintéticamente (reto «Pseudonimización de datos personales en textos»). La métrica principal es macro F1 sobre cuatro tipos con IoU ≥ 0,5 a nivel de documento completo; el tipo organización no forma parte del test.

| Metrica | pii-ua | pii-ua-v2 (version anterior) |
|---|---:|---:|
| Puntuacion (NER macro F1, IoU >= 0,5) | 0,9043 | 0,8883 |
| NER macro P / R | 0,857 / 0,962 | 0,971 / 0,821 |
| NER macro F1, limites exactos | 0,834 | 0,854 |
| Riesgo de desanonimizacion (personas con nombre visible al menos una vez) | 0,0023 (2 de 862) | 0,3852 (332 de 862) |
| Consistencia B³ F1 | 0,705 | 0,688 |

Resultados por tipo de entidad en el conjunto de prueba:

| Tipo | P | R | F1 | F1, limites exactos |
|---|---:|---:|---:|---:|
| ОСОБА | 1,000 | 1,000 | 1,000 | 0,981 |
| АДРЕСА | 0,925 | 1,000 | 0,961 | 0,854 |
| НОМЕР | 0,751 | 0,971 | 0,847 | 0,818 |
| ІНФОРМАЦІЯ | 0,754 | 0,875 | 0,810 | 0,683 |

En validación (30.524 ventanas de los documentos de entrenamiento, seqeval, cinco tipos) el macro F1 es 0,9457: ОСОБА 0,996, НОМЕР 0,954, ІНФОРМАЦІЯ 0,957, ОРГАНІЗАЦІЯ 0,937, АДРЕСА 0,885.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,5-1,7 GB, según la medición del autor (hasta 1,7 GB de memoria en CPU con fp32).
- En bf16 o fp16 la huella se reduce a alrededor de 0,8-1 GB, aunque el autor no publica mediciones específicas en GPU para esas precisiones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100, H100 y B300; el entrenamiento se realizó en una NVIDIA B300.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers con `AutoModelForTokenClassification` y `AutoTokenizer` (requiere `trust_remote_code=True` por el tokenizador LiBERTa). El pipeline estándar `pipeline("token-classification")` no es utilizable directamente porque el tokenizador no devuelve `word_ids()` ni offsets; es necesario implementar el troceado por palabras y la agregación de spans manualmente, como muestra la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en Apple M1 Pro (CPU, fp32, 8 hilos) procesa una resolución judicial media en aproximadamente 1 segundo, unos 800 palabras por segundo. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de PII en ucraniano en la documentación proporcionada. La única comparación disponible es con la versión anterior del propio modelo:

| Modelo | Parametros | Contexto | Macro F1 (test) | Riesgo de desanonimizacion | Licencia |
|---|---|---|---|---|---|
| pii-ua | 368 M | 512 tokens | 0,9043 | 0,0023 | no disponible |
| pii-ua-v2 | no disponible | no disponible | 0,8883 | 0,3852 | no disponible |

## Limitaciones y advertencias

- El modelo se entrenó principalmente con resoluciones judiciales; su precisión en correspondencia, textos médicos u otros dominios no ha sido evaluada.
- Sesgo hacia el sobremarcado: en el test produjo 144 falsos positivos de tipo НОМЕР frente a 13 falsos negativos. En la práctica esto implica que puede marcar en exceso números catastrales y de registro, lo que obliga a revisión humana o a umbrales de confianza ajustados.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse si se permite el uso comercial. Es imprescindible contactar con el autor antes de utilizarlo en producción.
- El modelo es monolingüe (ucraniano); no procesa textos en otros idiomas.
- La longitud de contexto efectiva es de 512 tokens por ventana; los documentos largos requieren troceado con solapamiento y una heurística de agregación de etiquetas entre ventanas (el autor usa la etiqueta de la ventana donde la palabra está más lejos del borde).
- El tokenizador requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio del autor; conviene auditar ese código antes de desplegarlo en entornos sensibles.
- El pipeline estándar de token-classification de transformers no funciona directamente con este modelo; la integración requiere implementación manual del troceado por palabras y de la reconstrucción de spans.
- La evaluación se realizó sobre datos personales restaurados sintéticamente, no sobre documentos reales con PII original; el rendimiento en producción puede diferir.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y negativos en la detección, con implicaciones legales si se usa sin supervisión en procesos de anonimización obligatoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/illia-dagil/pii-ua
- Dataset de entrenamiento: https://huggingface.co/datasets/illia-dagil/pii-ua
- Modelo base: https://huggingface.co/Goader/liberta-large-v2
