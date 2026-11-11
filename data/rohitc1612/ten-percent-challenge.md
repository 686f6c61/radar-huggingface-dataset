# rohitc1612/ten-percent-challenge

## Resumen

`ten-percent-challenge` es una compresión extrema del modelo suizo multilingüe `joelbarmettler/gheim-ch-560m`, un clasificador de tokens RoBERTa de 560 millones de parámetros especializado en detección de información personal identificable (PII) en documentos en alemán, francés, italiano y romanche. El autor, `rohitc1612`, lo presenta como su envío oficial al reto `DeusExperiments/ten-percent-challenge`, cuyo objetivo es reducir el peso de un modelo a menos del 10 % de su tamaño original sin perder fidelidad sustancial.

El paquete final ocupa 109 MB frente a los 1.118 MB del modelo original en FP16, es decir, un 9,24 % del tamaño, con una retención de fidelidad declarada del 97,35 % sobre 28.872 documentos de examen bloqueados y 86.031 entidades PII anotadas. La compresión combina cuantización GPTQ secuencial con pesos mixtos de 2 y 3 bits, empaquetado entrópico mediante rANS, poda de vocabulario con respaldo de caracteres y un mecanismo de ajuste por feedback humano vía activación steering sin modificar los pesos.

La relevancia actual del modelo radica en su doble vertiente: por un lado, demuestra que es posible desplegar un detector PII multilingüe en entornos con recursos muy limitados; por otro, introduce un canal de retroalimentación en producción que permite corregir errores sin reentrenar, algo poco habitual en modelos cuantizados a tan baja precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (XLM-RoBERTa), token classification |
| Parametros totales | 560M (modelo base); empaquetado final ~103,29 MB de pesos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ mixto 2-bit y 3-bit en capas lineales; embeddings escalonados (3.000 tokens a 4-bit, 8.000 a 3-bit, resto a 2-bit); empaquetado rANS (~1,46 bits por parámetro efectivo) |
| Idiomas soportados | de, fr, it, rm |
| Licencia | MIT |
| Formato de pesos | `model.bin` propietario (rANS + GPTQ empaquetado), cargable con `shipload.py`; no se distribuye en safetensors ni GGUF |
| Pipeline | token-classification |
| Etiquetas | 8 tipos de entidad PII (`cat:account_number`, `cat:private_date`, `cat:private_email`, `cat:private_person`, `cat:private_phone`, `cat:private_url`, `cat:secret`, `cat:private_address`) |
| Modelo base | `joelbarmettler/gheim-ch-560m` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder transformer tipo RoBERTa multilingüe (linaje XLM-RoBERTa) con 560M parámetros, adaptado a clasificación de tokens para etiquetado BIO de entidades PII. El autor no documenta en la model card el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; estos datos deben considerarse no disponibles. La evaluación, en cambio, sí especifica el corpus de examen: 28.872 documentos provenientes de sentencias judiciales suizas (`entscheidsuche`), actas parlamentarias (`curia_vista`), PII sintética y fuentes reservadas en romanche.

La innovación técnica principal no está en el entrenamiento sino en el proceso de compresión. Se aplica GPTQ secuencial con ordenación de activaciones por magnitud de la diagonal hessiana (`act_order=True`) y búsqueda exhaustiva de umbrales de recorte, dando lugar a capas lineales en 2 y 3 bits. Los pesos resultantes se empaquetan con codificación entrópica rANS, alcanzando ~1,46 bits por parámetro. El vocabulario se poda de 250.002 subtokens a unos 58.000 relevantes para el dominio suizo, con un mapeo de respaldo a caracteres individuales que evita que nombres y direcciones raras caigan en `<unk>`. Por último, se incorpora un mecanismo de *activation steering* con núcleo RBF que calcula un centroide latente a partir de correcciones humanas y aplica un vector de dirección mediante forward hooks de PyTorch, sin modificar un solo peso (los pesos permanecen bit-idénticos).

## Capacidades

- Detección y clasificación de entidades PII en ocho categorías: números de cuenta/IBAN, fechas privadas, correos electrónicos, nombres de personas, teléfonos suizos (fijos y móviles), URLs personales, secretos (contraseñas, claves API, credenciales) y direcciones postales.
- Etiquetado a nivel de token (token classification) sobre texto en alemán, francés, italiano y romanche.
- Procesamiento por lotes mediante CLI (`predict.py`) sobre ficheros JSONL.
- Ajuste en producción mediante feedback humano: `feedback.py` ingiere hasta 25 anotaciones de corrección y genera un estado de steering (`feedback_state.pt`) que se aplica en inferencia sin reentrenar.
- Inferencia autocontenida sin dependencias externas más allá de Python, NumPy y PyTorch, gracias a los módulos `shipcodec.py`, `shipload.py` y `shiptok.py`.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; el modelo es exclusivamente un clasificador de tokens.

## Casos de uso

- Anonimización de expedientes judiciales: el modelo puede etiquetar nombres, direcciones y fechas en sentencias suizas antes de su publicación, aprovechando que fue evaluado sobre el corpus `entscheidsuche` y que cubre los cuatro idiomas oficiales.
- Cumplimiento del RGPD en pipelines documentales: integrado como paso previo a indexación o archivado, detecta correos, teléfonos e IBAN en documentos internos con un footprint de 109 MB que cabe en cualquier contenedor.
- Redacción de actas parlamentarias: sobre el corpus `curia_vista`, permite localizar datos personales de ciudadanos mencionados en intervenciones antes de difundir transcripciones.
- Despliegue en entornos con recursos mínimos: al ocupar ~103 MB de pesos y requerir únicamente Python, NumPy y PyTorch, puede ejecutarse en dispositivos edge o contenedores sin GPU dedicada.
- Filtrado de secretos en repositorios y logs: la categoría `cat:secret` (con 98,43 % de retención) permite construir un escáner de credenciales y claves API en textos multilingües suizos.
- Mejora continua con revisión humana: equipos de compliance pueden anotar falsos positivos o negativos y regenerar el estado de steering con `feedback.py`, aplicándolo en la siguiente tanda de inferencia sin reentrenar el modelo.
- Detección de PII en romanche: al ser uno de los pocos modelos que cubre este idioma, resulta adecuado para administraciones cantonales de Grisones que gestionan documentación en las cuatro lenguas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el examen bloqueado de 28.872 documentos y 86.031 entidades doradas:

| Grupo | Entidades doradas | Precisión base | Precisión cuantizada | Retención | Estado |
|---|---|---|---|---|---|
| Todos los ítems | 86.031 | 0,883 | 0,874 | 97,35 % | Global |
| `cat:account_number` | 2.357 | 0,951 | 0,949 | 99,64 % | PASS |
| `cat:private_date` | 29.338 | 0,821 | 0,824 | 98,66 % | PASS |
| `cat:private_email` | 2.561 | 0,992 | 0,985 | 99,17 % | PASS |
| `cat:private_person` | 33.002 | 0,912 | 0,899 | 96,49 % | PASS |
| `cat:private_phone` | 3.426 | 0,940 | 0,935 | 99,50 % | PASS |
| `cat:private_url` | 5.323 | 0,971 | 0,967 | 99,17 % | PASS |
| `cat:secret` | 395 | 0,965 | 0,952 | 98,43 % | PASS |
| `cat:private_address` | 9.629 | 0,856 | 0,815 | 93,47 % | Sub-par |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable dado que el modelo es un clasificador de tokens y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; dado que los pesos empaquetados ocupan ~103 MB, el modelo descomprimido en memoria debería situarse en el orden de varios cientos de MB, pero el autor no publica la cifra exacta.
- GPU recomendadas: no especificadas. El modelo base es de 560M parámetros y la inferencia se realiza con PyTorch, por lo que cualquier GPU con suficiente memoria para el modelo descomprimido es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque el autor no documenta requisitos mínimos.
- Opciones de despliegue: el paquete es autocontenido y se ejecuta con `predict.py` (CLI) o mediante la API Python (`shipload.load_model` y `shiptok.load_tokenizer`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato `model.bin` propietario impide usarlos directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|---|
| `rohitc1612/ten-percent-challenge` | 560M (base) | no disponible | de, fr, it, rm | MIT | `model.bin` (rANS + GPTQ) | 109 MB |
| `joelbarmettler/gheim-ch-560m` | 560M | no disponible | de, fr, it, rm | no disponible | safetensors/PyTorch | 1.118 MB (FP16) |
| Alternativas genéricas de detección PII | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con su modelo base, del que conserva el 97,35 % de fidelidad con un 9,24 % del tamaño. No se dispone de información sobre otros modelos comparables de detección PII multilingüe suiza en la documentación proporcionada.

## Limitaciones y advertencias

- La categoría `cat:private_address` queda por debajo del umbral de calidad (93,47 % de retención, marcada como "Sub-par" por el propio autor), por lo que su uso en producción para direcciones postales requiere revisión humana.
- El modelo solo cubre alemán, francés, italiano y romanche; no soporta castellano ni otras lenguas.
- No se documentan sesgos conocidos, pero al entrenarse sobre corpus judiciales y parlamentarios suizos puede presentar sesgos de dominio y de representación geográfica o lingüística.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y negativos en la clasificación; la precisión global del 0,874 implica un margen de error no despreciable.
- La licencia MIT permite uso comercial, pero el modelo base `joelbarmettler/gheim-ch-560m` no declara licencia en la información disponible, lo que conviene verificar antes de explotarlo comercialmente.
- El formato de pesos propietario y los scripts autocontenidos limitan la integración con ecosistemas estándar (vLLM, TGI, llama.cpp); requiere usar los módulos `shipload`, `shiptok` y `shipcodec`.
- El mecanismo de steering por feedback acepta como máximo 25 anotaciones por ciclo según la documentación, lo que acota la magnitud de las correcciones aplicables.
- No se documentan la longitud de contexto ni los datos de entrenamiento, lo que dificulta evaluar su comportamiento en documentos muy largos o en dominios alejados del corpus suizo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rohitc1612/ten-percent-challenge
- Modelo base: https://huggingface.co/joelbarmettler/gheim-ch-560m
- Reto `DeusExperiments/ten-percent-challenge`: no disponible como URL verificada en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
