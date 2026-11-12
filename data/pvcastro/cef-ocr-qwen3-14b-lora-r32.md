# pvcastro/cef-ocr-qwen3-14b-lora-r32

## Resumen

El modelo `pvcastro/cef-ocr-qwen3-14b-lora-r32` es un adaptador LoRA (QLoRA) de extracción de información estructurada, construido sobre el modelo base Qwen3-14B en cuantización 4 bits (NF4). Lo desarrolla el usuario `pvcastro` y su propósito es convertir el texto OCR completo de matrículas inmobiliarias brasileñas (documentos registrales de inmuebles) en un JSON con exactamente 34 campos estructurados, cada uno con valor, evidencia textual y origen de la etiqueta. No realiza OCR ni procesa imágenes: consume texto OCR ya extraído.

El adaptador tiene 128.450.560 parámetros entrenables (rango 32, alpha 64) y se entrenó con QLoRA sobre 1.003 documentos de entrenamiento y 111 de validación, todos de apartamentos, con contexto de entrenamiento de 12.288 tokens. En inferencia se recomienda una ventana de 32.768 tokens, reservando hasta 2.048 para la respuesta, y `enable_thinking=False`. Es relevante para equipos que necesiten automatizar la digitalización de registros inmobiliarios con validación de esquema estricta y trazabilidad de la evidencia por campo.

El artefacto es un adaptador privado: el repositorio contiene solo los pesos LoRA, el tokenizer y los metadatos de inferencia, y requiere acceso autenticado y descarga separada del modelo base. Está etiquetado únicamente para portugués y su licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-14B) con adaptador LoRA/QLoRA |
| Parametros totales | 128.450.560 parámetros de adaptador entrenables (el modelo base Qwen3-14B se descarga aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en inferencia (hasta 2.048 reservados para respuesta); 12.288 tokens en entrenamiento |
| Tipos de cuantizacion | Base en BitsAndBytes NF4 (4 bits); entrenamiento en BF16; no entrenado sobre el checkpoint AWQ |
| Idiomas soportados | Portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); librería `peft` |
| Rank / alpha / dropout | 32 / 64 / 0 |
| Modelo base | unsloth/Qwen3-14B-bnb-4bit (revisión `b455922269e4678c84f854fe38a6993d73614a1e`) |
| Tamaño del repositorio | 0,5 GB |
| SHA-256 del adaptador | `dc4a649992077aab936bd1e18a97f199e388ea1e5137846843080bc93361c870` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-14B, un transformer decoder-only de 14 mil millones de parámetros. El entrenamiento emplea QLoRA: la base permanece congelada en cuantización 4 bits NF4 y solo se actualizan los 128.450.560 parámetros del adaptador LoRA (rango 32, alpha 64, dropout 0). Se usó learning rate 1e-4, tres épocas, semilla 42, batch 1 con acumulación de 16 y precisión BF16, en un entorno con Python 3.11 y CUDA 12.8. El contexto de entrenamiento fue de 12.288 tokens.

El conjunto de datos consta de 1.003 documentos de entrenamiento y 111 de validación, restringidos a apartamentos, con validación separada por grupo de edificio para evitar filtración entre splits. Las etiquetas de entrenamiento son de origen Luna y las de test de origen Astra OCR; ninguna de las dos es anotación humana de referencia (gold standard). El checkpoint seleccionado es el de menor pérdida de validación (paso 189, `eval_loss=0.03253575786948204`). La innovación principal no es arquitectónica sino de contrato de salida: el modelo devuelve un JSON con 34 campos fijos, cada uno con `valor`, `evidencia` y `origem_rotulo`, representando la ausencia con los tres atributos nulos en lugar de cero o `false`.

## Capacidades

- Extracción de información estructurada: genera un JSON con exactamente los 34 campos definidos en `campos.json` a partir de texto OCR completo de matrículas inmobiliarias.
- Trazabilidad por campo: cada campo incluye el valor extraído, la evidencia textual que lo respalda y el origen de la etiqueta.
- Manejo explícito de ausencia: distingue ausencia (tres atributos nulos) de valores cero o `false`.
- Procesamiento de documentos largos: soporta entradas de hasta 32.768 tokens, cubriendo documentos de 3 a 18 páginas de PDF con OCR minimizado íntegro.
- Generación determinista recomendada: el benchmark usó `do_sample=False`; el autor recomienda no muestrear para esta tarea.
- Modo sin razonamiento: se debe invocar con `enable_thinking=False` en el chat template.
- No realiza OCR ni acepta imágenes: solo consume texto OCR ya extraído.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- Capacidad multilingüe limitada al portugués según los metadatos del modelo.

## Casos de uso

- Digitalización de registros inmobiliarios: el modelo convierte el OCR completo de una matrícula en un JSON de 34 campos con evidencia, lo que permite alimentar bases de datos registrales sin transcripción manual y auditar cada valor contra el texto fuente.
- Validación y control de calidad documental: la aplicación puede validar el esquema JSON y contrastar los campos críticos contra el texto OCR, usando el campo `evidencia` para revisión humana selectiva de los casos dudosos.
- Automatización de due diligence inmobiliaria: en procesos de compraventa o financiación, el modelo extrae titulares, cargas, áreas y valores de forma homogénea para múltiples documentos, reduciendo el tiempo de revisión por expediente.
- Integración en pipelines de back office: al ser un adaptador PEFT sobre Qwen3-14B, se puede servir con el mismo stack de inferencia que el modelo base (Unsloth + PEFT en GPU CUDA) y encadenar tras un motor OCR en un flujo por lotes.
- Gestión de carteras de alquiler y propiedades: extracción masiva de datos de matrículas de apartamentos para mantener actualizado un inventario de inmuebles con áreas, fracción ideal y valores.
- Cumplimiento y auditoría registral: la salida estructurada con evidencia facilita generar informes auditables de los campos extraídos y detectar discrepancias entre documentos.
- Procesamiento de documentos largos: gracias a la ventana de 32.768 tokens, un único documento de hasta 18 páginas se procesa sin truncar páginas, evitando pérdidas silenciosas de información.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 129 documentos de test (730 páginas de PDF, 3 a 18 por documento), con OCR minimizado íntegro y sin recorte adicional de contexto:

| Métrica | Resultado |
|---|---|
| Concordancia por campo con tolerancias | 94,14% (4.129/4.386) |
| Concordancia cuando la etiqueta tiene valor | 92,79% (2.856/3.078) |
| Relleno indebido en etiquetas ausentes | 2,68% (35/1.308) |
| JSON válido | 129/129 |
| Tiempo medio de extracción (RTX 4090) | 43,02 s/documento |
| Mediana / p95 (RTX 4090) | 42,24 / 53,17 s/documento |
| Igualdad normalizada sin tolerancias | 86,94% |

Las tolerancias aceptan un 0,5% en áreas y fracción ideal, R$ 1 en valores y un 60% de palabras comunes en los campos textuales indicados en el esquema. El tiempo medido corresponde solo al LLM sobre el OCR ya disponible y no incluye el OCR. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-14B en 4 bits NF4 ocupa aproximadamente 8-10 GB de pesos, más el adaptador (0,5 GB en disco) y el KV cache para contextos de hasta 32.768 tokens; se recomienda al menos 16 GB de VRAM para inferencia con contexto largo.
- GPU recomendadas: RTX 4090 (el autor midió 43,02 s/documento de media con este modelo cargado), A100 y H100 para mayor throughput o despliegue concurrente.
- GPU de consumo: cabe en tarjetas de 16 GB o más en cuantización 4 bits; por debajo de 16 GB el contexto de 32.768 tokens puede no caber.
- Opciones de despliegue: el camino evaluado es Unsloth + PEFT en GPU CUDA con `load_in_4bit=True`; sustituir la base, la cuantización, fusionar el adaptador o cambiar de motor de inferencia exige una nueva validación.
- Latencia y throughput: media 43,02 s/documento, mediana 42,24 s y p95 53,17 s en RTX 4090 con contexto completo y `do_sample=False`.
- Requisito de acceso: el repositorio es privado; hace falta autenticación (`hf auth login` o `HF_TOKEN`) con permiso de lectura.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos en la información proporcionada. Como referencia estructural, el adaptador hereda las características del modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cef-ocr-qwen3-14b-lora-r32 (este) | 128,45 M de adaptador sobre Qwen3-14B | 32.768 tokens en inferencia | no disponible | Repositorio privado |
| Qwen3-14B (base) | 14 B | no disponible en esta información | no disponible en esta información | Público en Hugging Face |
| Alternativas de extracción estructurada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio restringido: entrenado solo con apartamentos; el rendimiento en otros tipos de inmueble no está validado.
- Idiomas: etiquetado únicamente para portugués; no se documenta soporte de otros idiomas.
- Etiquetas no humanas: tanto el entrenamiento (Luna) como el test (Astra OCR) usan etiquetas automáticas, no anotación humana de referencia, lo que limita la interpretación de las métricas.
- Sin OCR: el modelo no procesa imágenes ni ejecuta OCR; requiere texto OCR previo.
- Riesgo de relleno: un 2,68% de relleno indebido en etiquetas ausentes; la aplicación debe validar el contrato y verificar los campos críticos.
- Sin gramática JSON restringida: la versión evaluada no usó gramática JSON restringida en la generación; el JSON debe parsearse y validarse en la aplicación.
- Sensibilidad al contexto: las entradas que no caben en 32.768 tokens deben rechazarse, no truncarse silenciosamente.
- Dependencia del entorno: sustituir la base, la cuantización, fusionar el adaptador o cambiar de motor de inferencia invalida los resultados medidos.
- Licencia no declarada: no hay información sobre condiciones de uso comercial; debe confirmarse con el autor antes de usarlo en producción.
- Privacidad: el repositorio es privado y no incluye PDFs, textos OCR, ejemplos individuales, etiquetas ni logs de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pvcastro/cef-ocr-qwen3-14b-lora-r32
- Modelo base: https://huggingface.co/unsloth/Qwen3-14B-bnb-4bit
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
