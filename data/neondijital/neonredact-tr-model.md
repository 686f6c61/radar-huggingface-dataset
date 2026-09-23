# neondijital/neonredact-tr-model

## Resumen

NeonRedact-TR es un modelo de detección de información personal identificable (PII) en turco, desarrollado por el usuario neondijital y afinado a partir de urchade/gliner_multi-v2.1. No es un modelo generativo: es un extractor de entidades de tipo token-classification construido sobre la librería GLiNER, que recibe un texto y una lista de etiquetas escritas en lenguaje natural y devuelve los tramos de caracteres (spans) que corresponden a cada etiqueta. Su objetivo es localizar datos personales en documentos turcos antes de que salgan de la organización, para poder redactarlos o seudonimizarlos.

El modelo cubre 16 etiquetas pensadas para el contexto turco: nombre, dirección, T.C. kimlik numarası, vergi kimlik numarası, IBAN, tarjeta de crédito, teléfono móvil, teléfono fijo, correo electrónico, matrícula de vehículo, fecha de nacimiento, nombre de institución, profesión, parentesco, estado de salud y condición procesal. Se entrenó sobre el conjunto neondijital/neonredact-tr, con 10 000 registros sintéticos, 36 plantillas de documento y 16 etiquetas, en tres épocas sobre una única T4 durante aproximadamente 14 minutos.

Su relevancia actual es doble. Por un lado, los modelos multilingües de PII incluyen el turco entre sus idiomas pero no están diseñados para él: no reconocen identificadores turcos (T.C. kimlik, vergi kimlik, IBAN turco, matrículas) y tienden a arrastrar los sufijos de caso dentro del span, lo que rompe la redacción. Por otro, en el banco independiente NeonRedact-TR Bench (300 documentos turcos, 1 206 entidades) el modelo combinado con una capa de reglas con validación de dígitos de control obtiene 0,790 de micro F1, frente a 0,356 de OpenMed v2 y 0,348 de OpenAI Privacy Filter. Se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (backbone mDeBERTa, según la model card) con cabecera de clasificación de spans al estilo GLiNER (NER zero-shot) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (tag `pytorch`, librería `gliner`); el formato de fichero concreto no está documentado. Tamaño del repositorio: 1,2 GB |
| Tarea (pipeline) | token-classification (extracción de spans de entidades) |
| Modelo base | urchade/gliner_multi-v2.1 |
| Etiquetas soportadas | 16: `kişi adı`, `adres`, `T.C. kimlik numarası`, `vergi kimlik numarası`, `IBAN`, `kredi kartı numarası`, `cep telefonu`, `sabit telefon`, `e-posta adresi`, `araç plakası`, `doğum tarihi`, `kurum adı`, `meslek`, `akrabalık`, `sağlık durumu`, `taraf sıfatı` |
| Dataset de entrenamiento | neondijital/neonredact-tr (10 000 registros sintéticos, 36 plantillas, 16 etiquetas) |
| Descargas / likes | 37 descargas, 0 likes |
| Fecha de publicación / actualización | 10 de septiembre de 2026 / 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de GLiNER: un encoder transformer (mDeBERTa, según la model card) al que se añade una cabeza que puntúa la compatibilidad entre representaciones de spans candidatos y representaciones de las etiquetas proporcionadas en tiempo de inferencia. Esto permite formular la extracción como un problema zero-shot: el usuario define las etiquetas con texto libre y el modelo devuelve los tramos que mejor encajan. Al no ser un modelo autorregresivo, no genera texto ni modifica la entrada; solo devuelve offsets de caracteres y etiquetas, y la decisión de redactar, sustituir o enmascarar queda en manos de la aplicación.

El ajuste fino se hizo desde urchade/gliner_multi-v2.1 sobre el dataset neondijital/neonredact-tr, compuesto por 10 000 registros sintéticos generados a partir de 36 plantillas de documento y 16 etiquetas. El entrenamiento fue de tres épocas sobre una única GPU T4, en torno a 14 minutos. El autor documenta tres rondas de iteración necesarias: la primera confundía las etiquetas de identificadores con las palabras clave que las preceden; la segunda lo corrigió pero empezó a leer números de identidad nacional como IBAN; la tercera separó los tipos de identificador en contextos oracionales propios y colocó números de referencia de documento junto a IBAN reales para que el modelo aprendiera a distinguir qué número largo es cuál. La tercera ronda no produjo falsos positivos en las sondas de validación retenidas.

La innovación principal no está en la arquitectura, sino en el tratamiento de la morfología turca: el modelo devuelve el span sin el sufijo de caso apostrofado (`Ayşe Öztürk` en lugar de `Ayşe Öztürk'ün`) y sin el buffer pronominal de los nombres de institución (`Ege Üniversitesi` a partir de `Ege Üniversitesi'nden`), de modo que la sustitución no destruye la gramática de la frase.

## Capacidades

- Extracción de entidades nombradas (NER) zero-shot en turco: acepta etiquetas definidas como texto libre y devuelve spans a nivel de carácter.
- Detección de identificadores específicos de Turquía: T.C. kimlik numarası, vergi kimlik numarası, IBAN turco, matrícula de vehículo y tarjeta de crédito. El modelo base no reconoce ninguno de estos formatos.
- Detección de teléfonos móviles (por ejemplo `0532 111 22 33`), que el modelo base pasa por alto.
- Detección de parentesco (`kardeşi`) y de personas designadas por su rol en textos jurídicos y clínicos (`müvekkilim`, `davalı`, `hastam`).
- Recorte correcto del span en IBAN, devolviendo `TR3300...` sin la palabra clave `IBAN` que lo precede.
- Etiquetado de 16 categorías de PII, incluidas dirección, correo electrónico, fecha de nacimiento, institución, profesión, estado de salud y condición procesal.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico: es un componente de extracción, no un agente.
- Capacidad multilingüe: no disponible. El modelo está declarado y ajustado únicamente para turco, pese a partir de un backbone multilingüe.

## Casos de uso

- Cumplimiento de KVKK y RGPD en despachos jurídicos: el modelo localiza nombres, identificadores y datos de salud en expedientes turcos antes de compartirlos con terceros, con la ventaja de que reconoce el T.C. kimlik numarası y el vergi kimlik numarası, que los modelos orientados a la UE no buscan.
- Anonimización previa al envío a modelos generativos: se ejecuta el detector como paso previo en una canalización y se sustituyen los spans por marcadores o seudónimos, de modo que el texto que llega a una API externa ya no contiene identificadores directos.
- Redacción de historiales clínicos: permite enmascarar el nombre del paciente, la profesión, el parentesco y el estado de salud, además de las referencias al paciente por rol (`hastam`), frecuentes en la escritura clínica turca.
- Construcción de pipelines de DLP (data loss prevention) para correo y repositorios documentales: el modelo actúa como clasificador de spans y se combina con expresiones regulares y validación de dígito de control para decidir si un documento se bloquea o se marca para revisión.
- Preprocesado para anotación humana: los spans detectados con umbral alto se proponen como anotaciones iniciales, reduciendo el trabajo manual de etiquetado en la creación de corpus de PII en turco.
- Enmascaramiento en procesos de atención al cliente: los agentes pueden pegar conversaciones en una herramienta interna que detecta teléfonos, correos y números de documento antes de almacenar o escalar el caso.
- Auditoría y búsqueda sobre archivos históricos: al devolver offsets de caracteres, los spans se indexan y permiten localizar qué documentos contienen qué categorías de datos personales, útil para responder a solicitudes de acceso o supresión.
- Enriquecimiento anonimizado para analítica: se sustituyen los identificadores por categorías derivadas (por ejemplo, distrito o año de nacimiento) y se conserva el resto de la estructura del documento para su análisis agregado.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test retenido de NeonRedact-TR Bench v1: 300 documentos turcos, 1 206 entidades, micro F1 con intervalo de confianza del 95 % por bootstrap.

| Metrica | Este modelo + reglas | Este modelo solo | OpenMed v2 | OpenAI PF |
|---|---|---|---|---|
| Todas las etiquetas (micro F1) | 0,790 [0,766, 0,814] | 0,730 | 0,356 | 0,348 |
| Persona, dirección, teléfono, correo, fecha de nacimiento | 0,834 | 0,804 | 0,338 | 0,347 |
| Fuga de sufijos (suffix leakage) | 0,0 % | 0,0 % | 1,4 % | 18,4 % |
| Falsas alarmas en texto sin PII | 72,6 % | 79,0 % | 69,4 % | 37,1 % |

Comparación cualitativa entre el modelo base y el ajustado, con la misma frase y el mismo umbral de 0,5:

| Entidad | gliner_multi-v2.1 | Este modelo |
|---|---|---|
| `Ayşe Öztürk` | detectada | detectada |
| `85592807206` (T.C. ID) | no detectada | detectada |
| `0532 111 22 33` | no detectada | detectada |
| `kardeşi` (parentesco) | no detectada | detectada |
| Span de IBAN | `IBAN TR3300...` (incluye la etiqueta) | `TR3300...` |

El autor advierte explícitamente de que las puntuaciones de validación sobre un split retenido de los propios datos de entrenamiento son optimistas y por ese motivo no se publican. No se han publicado resultados adicionales de benchmarks fuera de NeonRedact-TR Bench en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. A partir del tamaño del repositorio (1,2 GB, que puede incluir estados de optimizador), la inferencia en FP16 debería caber holgadamente por debajo de 2 GB de VRAM; se trata de una estimación, no de un dato publicado.
- GPU para entrenamiento: el autor afinó el modelo en una única NVIDIA T4, tres épocas en unos 14 minutos, lo que indica que el ajuste fino es asequible en GPUs de gama media o en instancias cloud pequeñas.
- GPU recomendadas para inferencia: cualquier GPU con al menos 4-8 GB de VRAM (T4, RTX 3060/4060, RTX 4090); también es viable en CPU para volúmenes moderados, dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo reciente; el dato concreto de VRAM por cuantización no está publicado.
- Opciones de despliegue: la librería gliner sobre PyTorch es la vía documentada por el autor. No se documentan instrucciones específicas para vLLM, TGI, llama.cpp u Ollama; estos motores están orientados a modelos generativos y no aplican de la misma forma a un encoder de clasificación de spans. La exportación a ONNX no está documentada en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Micro F1 (todas las etiquetas) | Fuga de sufijos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| NeonRedact-TR + reglas | NER zero-shot (GLiNER) | no disponible | no disponible | 0,790 | 0,0 % | Apache 2.0 | HuggingFace |
| NeonRedact-TR solo | NER zero-shot (GLiNER) | no disponible | no disponible | 0,730 | 0,0 % | Apache 2.0 | HuggingFace |
| urchade/gliner_multi-v2.1 (base) | NER zero-shot multilingüe | no disponible | no disponible | no disponible en este banco | no disponible | no disponible | HuggingFace |
| OpenMed v2 | Detección de PII multilingüe | no disponible | no disponible | 0,356 | 1,4 % | no disponible | no disponible |
| OpenAI Privacy Filter | Filtro de privacidad | no disponible | no disponible | 0,348 | 18,4 % | no disponible | no disponible |

La comparación relevante es doble: frente a los modelos multilingües de PII, la ventaja está en los identificadores turcos y en el recorte correcto del span; frente al modelo base, la ventaja está en reconocer formatos de identificador turcos, teléfonos y parentesco, que el base no detecta.

## Limitaciones y advertencias

- Teléfonos fijos sin palabra clave: un número fijo en medio de una frase sin un término precedente (`... 0232 445 67 89 numarasından ...`) a menudo no se detecta. El autor recomienda mantener una comprobación por expresión regular en paralelo.
- Profesiones flexionadas: `eczacıymış` se devuelve completo en lugar de como `eczacı`. Al no ir separadas por apóstrofo, tres rondas de entrenamiento no resolvieron el problema.
- `taraf sıfatı` es la etiqueta más débil, por ser la que menos ejemplos de entrenamiento tiene.
- Datos de entrenamiento sintéticos y generados por plantillas: los documentos reales son más sucios. Las puntuaciones sobre el split retenido del propio dataset de entrenamiento son optimistas y no se publican por ese motivo.
- El modelo no ha visto ruido de OCR, artefactos de maquetación ni variantes dialectales de escritura.
- Sesgos conocidos: no disponibles. No obstante, al entrenarse sobre plantillas sintéticas, la distribución de nombres, direcciones y profesiones refleja los patrones de esas plantillas y no la diversidad real de la población turca.
- Riesgo de alucinación: en este contexto se traduce en falsos positivos, no en texto inventado. El dato es alto: 72,6 % de falsas alarmas en texto sin PII cuando se combina con la capa de reglas, y 79,0 % en el modelo solo. Esto implica que en producción hará falta revisión humana o filtros adicionales para no degradar documentos legítimos.
- Cobertura incompleta: no hay etiqueta para secretos (credenciales, claves) ni para fechas de eventos, según declara el propio autor.
- Detección no equivale a cumplimiento: eliminar identificadores directos no convierte un documento en anónimo bajo KVKK o RGPD, porque una combinación residual de atributos (año de nacimiento, distrito, profesión) puede seguir singularizando a una persona. El autor recomienda mantener a una persona en el bucle antes de que cualquier documento salga de la organización.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se declaran restricciones adicionales.
- Idiomas: solo turco. No se ha evaluado su comportamiento en otras lenguas pese al backbone multilingüe; no debe asumirse transferencia.
- Madurez: 37 descargas y 0 likes en el momento de la consulta, con una única fuente de evaluación (el banco del propio autor). Conviene validar con datos propios antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neondijital/neonredact-tr-model
- Dataset de entrenamiento: https://huggingface.co/datasets/neondijital/neonredact-tr
- Banco de evaluación NeonRedact-TR Bench v1: https://huggingface.co/datasets/neondijital/neonredact-tr-bench
- Resultados completos, salvedades y código: https://huggingface.co/datasets/neondijital/neonredact-tr-bench/blob/main/RESULTS.md
- Modelo base: https://huggingface.co/urchade/gliner_multi-v2.1
- La búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre turismo en Macao y no guardan relación con el contenido de esta ficha.
