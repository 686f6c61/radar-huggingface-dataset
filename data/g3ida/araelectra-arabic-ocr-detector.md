# g3ida/araelectra-arabic-ocr-detector

## Resumen

AraELECTRA Arabic OCR Detector es un modelo de clasificación de tokens (token-classification) desarrollado por el usuario g3ida, diseñado para resolver una única pregunta por palabra: si esa palabra contiene un error introducido por un proceso de OCR en textos árabes. El modelo parte del checkpoint aubmindlab/araelectra-base-discriminator y se ha afinado para la detección de corrupción post-OCR, con 135.194.113 parámetros y un peso de repositorio de 0,5 GB. Se publica bajo licencia Apache 2.0 y está pensado exclusivamente para árabe.

Su relevancia radica en la arquitectura elegida: ELECTRA se preentrena con detección de tokens reemplazados (replaced token detection), una tarea casi idéntica a la de señalar palabras corruptas por OCR. El autor conserva la cabeza discriminadora preentrenada en lugar de sustituirla por un clasificador de inicialización aleatoria, lo que permite alcanzar F1 93,9 en datos reservados con solo dos épocas de ajuste fino. Es la etapa A (detección) de un pipeline de corrección post-OCR de dos modelos y también la etapa D, donde el mismo modelo audita las reparaciones del corrector.

El modelo no genera texto ni corrige: únicamente emite logits por token que, agregados a nivel de palabra, marcan si esta es sospechosa de error. Está calibrado como componente de un pipeline y no como herramienta autónoma, con un umbral por defecto de 0,5 (logit) situado por encima de su propio pico de F1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (discriminador base, transformer encoder con cabeza de deteccion de tokens) |
| Parametros totales | 135.194.113 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (punto de truncado indicado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ELECTRA, un esquema de preentrenamiento en el que un corrompedor sustituye algunos tokens de la secuencia y el modelo aprende a identificar cuáles han sido reemplazados. Al ser esta tarea prácticamente idéntica a la detección de errores OCR, el autor conserva la cabeza discriminadora preentrenada del checkpoint aubmindlab/araelectra-base-discriminator en lugar de reemplazarla por un clasificador inicializado aleatoriamente. El ajuste fino se realizó durante dos épocas, suficientes según el autor para alcanzar un F1 de 93,9 en datos reservados.

El entrenamiento se hizo sobre libros árabes escaneados, tanto clásicos como modernos, según declara la model card. La salida del modelo son logits por token, no por palabra: una palabra se marca como errónea si cualquiera de sus subtokens supera el umbral, lo que exige mapear los offsets de los tokens a los intervalos de palabra (la utilidad `Detector.flags` de la librería acompañante realiza esta agregación). La entrada esperada es texto OCR con la shadda eliminada y el resto de diacríticos intactos; eliminar por completo los diacríticos supone, según el autor, un cambio de dominio sin beneficio. No se documentan en la información disponible datos sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Clasificación de tokens a nivel de palabra para detectar errores introducidos por OCR en texto árabe.
- Detección de corrupción ortográfica o de caracteres (palabras deformadas por el reconocimiento óptico).
- Reutilización como auditor de un corrector post-OCR (etapa D del pipeline): vuelve a pasar el detector sobre el texto ya corregido para verificar las reparaciones.
- Funcionamiento con umbral configurable sobre el logit, lo que permite ajustar el equilibrio entre precisión, exhaustividad y tasa de falsas alarmas.
- Etiquetado de palabras aguas abajo del truncado a 512 tokens como "limpias" por defecto, comportamiento orientado a minimizar falsos positivos.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al árabe; otros idiomas no están soportados ni evaluados.

## Casos de uso

- Digitalización de fondos bibliográficos árabes: tras pasar un OCR sobre libros escaneados, el detector marca las palabras corruptas para que un corrector posterior (o un revisor humano) las priorice, reduciendo el coste de revisión manual en corpus de gran volumen.
- Corrección post-OCR en pipelines de dos etapas: el modelo actúa como etapa A generando máscaras de error por palabra que alimentan al corrector, y como etapa D auditando la salida de este, gracias a su naturaleza de clasificador rápido y ligero.
- Indexación y búsqueda en corpus históricos: detectar y aislar palabras corruptas antes de construir índices permite mejorar la recuperación de documentos sin necesidad de reescanear las fuentes.
- Control de calidad de proveedores OCR: al puntuar la densidad de errores detectados por página o documento, permite comparar la calidad de distintos motores o configuraciones de reconocimiento sobre el mismo corpus árabe.
- Filtrado de ruido en datasets de entrenamiento: marcar palabras corruptas permite limpiar corpus destinados a entrenar otros modelos de lengua árabe, evitando propagar errores de OCR.
- Preservación de patrimonio textual: en proyectos de digitalización de manuscritos y ediciones clásicas, el detector ayuda a localizar zonas problemáticas donde el OCR falla de forma sistemática (tipografías, diacríticos, ligaduras).
- Auditoría de traducciones o transcripciones asistidas por OCR: la validación de que el texto intermedio está limpio antes de pasarlo a un traductor o a un analizador morfológico evita arrastrar errores a etapas posteriores.

## Benchmarks y rendimiento

Resultados sobre datos reservados, según la model card. El umbral es un logit, no una probabilidad: 0,0 equivale a p=0,5.

| Umbral | Precision | Recall | Tasa de falsas alarmas |
|---:|---:|---:|---:|
| 0,0 | 93,8 % | 89,8 % | 6,2 % |
| **0,5** | **95,3 %** | **87,7 %** | **4,7 %** |
| 1,0 | 96,6 % | 85,5 % | 3,4 % |

F1 en validación de 91,9 frente a 88,4 en libros nunca vistos durante el entrenamiento. Esa diferencia de 3,5 puntos es casi enteramente de precisión y constituye, según el autor, la cifra honesta de generalización del modelo.

## Requisitos de hardware

- VRAM estimada: alrededor de 0,5-0,6 GB en fp32 para los 135 millones de parámetros; aproximadamente 0,3 GB en fp16 y por debajo de 0,2 GB en cuantizaciones de 8 bits. El repositorio ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 y H100, donde el limitante será el throughput del pipeline de datos antes que la memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU para volúmenes moderados, dado el reducido tamaño del modelo.
- Opciones de despliegue: la vía documentada es la librería transformers (`AutoModelForPreTraining` + `AutoTokenizer`) y el envoltorio `arabic-postocr` del autor. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado en la información disponible datos comparativos con otros modelos de detección de errores OCR en árabe. El único punto de referencia documentado es el checkpoint base aubmindlab/araelectra-base-discriminator, del que este modelo hereda la arquitectura y la cabeza discriminadora preentrenada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g3ida/araelectra-arabic-ocr-detector | 135.194.113 | 512 tokens | F1 93,9 (reservado), F1 validacion 91,9 | apache-2.0 | HuggingFace |
| aubmindlab/araelectra-base-discriminator | no disponible en la informacion proporcionada | no disponible | no disponible (checkpoint base, no afinado para esta tarea) | no disponible en la informacion proporcionada | HuggingFace |
| Otros detectores post-OCR en arabe | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo detecta corrupción, no incorrección: captura una palabra deformada, pero no una palabra real colocada en el lugar equivocado. El autor mide que vuelve a marcar texto fluido pero incorrecto en menos del 15 % de los casos.
- Está ajustado como componente de un pipeline, no para uso autónomo. El umbral por defecto de 0,5 se sitúa por encima del pico de F1 del propio modelo porque, aguas abajo, un corrector paga dos veces por una falsa alarma y solo una por un fallo de detección.
- Las palabras que quedan más allá del punto de truncado a 512 tokens no pueden activarse y se consideran "limpias" por defecto, lo que produce omisiones en textos largos procesados de una sola pasada.
- Entrenado únicamente sobre libros árabes escaneados (clásicos y modernos); otros dominios, como prensa, redes sociales, documentos administrativos o texto manuscrito, no han sido evaluados.
- Requiere una fase de mapeo de offsets de subtokens a palabras; usarlo directamente sobre logits por token sin esa agregación produce resultados incorrectos.
- Es sensible a la vista de entrada: espera shadda eliminada y resto de diacríticos intactos; alterar ese preprocesado supone un cambio de dominio.
- Licencia Apache 2.0, que permite uso comercial, pero el repositorio no incluye información sobre los sesgos del corpus de entrenamiento ni garantías de exactitud.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de sus resultados fuera de lo declarado por el autor.
- La model card referencia la librería `arabic-postocr` en una URL con el marcador de posición `OWNER`, por lo que el enlace funcional al repositorio no está confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g3ida/araelectra-arabic-ocr-detector
- Modelo base: https://huggingface.co/aubmindlab/araelectra-base-discriminator
- Repositorio de la libreria arabic-postocr: https://github.com/OWNER/arabic-postocr (marcador de posicion en la model card, URL no confirmada)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
