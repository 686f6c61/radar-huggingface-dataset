# girenit/girenit-KVKK-PII-150M

## Resumen

girenit-KVKK-PII-150M es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en turco. Lo desarrolla el autor girenit dentro del proyecto KVKK PrivacyOps, cuyo nombre remite a la ley turca de protección de datos personales (Kişisel Verilerin Korunması Kanunu). Se trata de un fine-tune del modelo base ytu-ce-cosmos/modernbert-tr-base y suma 149.361.451 parámetros (unos 150M), con licencia Apache-2.0 y pesos en safetensors.

El modelo cubre 21 categorías de span, entre ellas identificadores turcos específicos como TCKN (número de identidad), IBAN_TR, PHONE_TR, VEHICLE_PLATE_TR o PASSPORT_TR, junto con categorías de datos especialmente sensibles (HEALTH_DATA, BIOMETRIC_DATA, GENETIC_DATA, POLITICAL_OPINION, RELIGION, SEXUAL_LIFE, UNION_MEMBERSHIP, CRIMINAL_CONVICTION_SECURITY). Su relevancia práctica está en que buena parte de los detectores PII disponibles están orientados al inglés, mientras que el cumplimiento de KVKK y del RGPD en corpus turcos exige reconocer formatos y identificadores locales.

La ficha debe leerse con cautela: el autor lo etiqueta como research preview (versión v2), el conjunto de entrenamiento público es íntegramente sintético y determinista, y el F1 de validación de 1.0000 se obtuvo sobre ese mismo split sintético. La propia model card advierte de que esa cifra no debe interpretarse como rendimiento real de cumplimiento normativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de la familia ModernBERT (fine-tune de ytu-ce-cosmos/modernbert-tr-base) |
| Parámetros totales | 149.361.451 (≈150M) |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería transformers) |
| Tarea (pipeline) | token-classification |
| Categorías de entidad | 21 (ADDRESS, BIOMETRIC_DATA, CRIMINAL_CONVICTION_SECURITY, CREDIT_CARD, DATE_OF_BIRTH, DEVICE_ID, EMAIL, FINANCIAL_DATA, GENETIC_DATA, HEALTH_DATA, IBAN_TR, IPV4, PASSPORT_TR, PERSON, PHONE_TR, POLITICAL_OPINION, RELIGION, SEXUAL_LIFE, TCKN, UNION_MEMBERSHIP, VEHICLE_PLATE_TR) |
| Dataset asociado | girenit/girenit-KVKK-Bench |
| Tamaño del repositorio | 0,6 GB |
| Compatibilidad con endpoints | Sí (etiqueta endpoints_compatible) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un encoder de la familia ModernBERT, la arquitectura del modelo base ytu-ce-cosmos/modernbert-tr-base, adaptada a etiquetado de secuencias mediante fine-tuning supervisado. La model card no detalla hiperparámetros, número de tokens de entrenamiento, composición exacta del dataset, esquema de etiquetado (BIO, BILUO u otro), ni si se aplicaron técnicas de ajuste adicionales. No hay constancia de fases de RLHF o DPO, algo esperable en un clasificador de tokens y no en un modelo generativo.

El dato de entrenamiento más relevante es la naturaleza de los datos: el conjunto público es determinista y completamente sintético, sin registros de clientes, y las 21 categorías se generaron de forma controlada. El autor recomienda complementar el modelo con una capa determinista de reglas para identificadores con dígito de control (TCKN, IBAN, tarjetas) y evaluar cada categoría sobre un corpus institucional revisado por juristas antes de cualquier despliegue en producción. El resultado de validación publicado es F1 = 1.0000 sobre el split sintético, una cifra coherente con entrenar y validar sobre datos generados por el mismo proceso, y que el propio autor desaconseja extrapolar.

## Capacidades

- Etiquetado de tokens (NER) para 21 categorías de PII y datos personales en texto turco.
- Reconocimiento de identificadores locales turcos: TCKN, IBAN_TR, PHONE_TR, VEHICLE_PLATE_TR, PASSPORT_TR.
- Detección de categorías de datos especialmente protegidas: salud, biometría, genética, convicciones penales, opinión política, religión, vida sexual y afiliación sindical.
- Detección de identificadores técnicos y de contacto: EMAIL, IPV4, DEVICE_ID, ADDRESS, DATE_OF_BIRTH.
- Detección de datos financieros: CREDIT_CARD, FINANCIAL_DATA, IBAN_TR.
- Detección de personas (PERSON) como entidad nombrada.
- Integración con el ecosistema transformers mediante el pipeline token-classification y compatibilidad declarada con endpoints gestionados.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, capacidades de agente, visión, audio ni modo de pensamiento: es exclusivamente un clasificador discriminativo.
- Capacidad multilingüe: no disponible; el modelo declara únicamente turco.

## Casos de uso

- Anonimización previa a LLM: interceptar prompts en turco y enmascarar TCKN, IBAN_TR, PHONE_TR, EMAIL o PERSON antes de enviarlos a un modelo generativo externo, reduciendo la exposición de datos personales a terceros.
- Cumplimiento KVKK y RGPD: rastrear y clasificar repositorios documentales turcos para construir un inventario de tratamientos de datos personales que alimente registros de actividades y evaluaciones de impacto (DPIA), especialmente en las categorías del artículo 6.
- Redacción de logs y trazas: pasar los logs de aplicaciones y sistemas internos por el modelo para localizar y ofuscar identificadores antes de almacenarlos o enviarlos a plataformas de observabilidad.
- Pre-anotación para revisión legal humana: usar las predicciones como primera pasada sobre contratos, expedientes o reclamaciones, dejando la validación final a revisores jurídicos, tal como exige el propio autor del modelo.
- Filtrado en atención al cliente: detectar datos sensibles en tickets y conversaciones multi-turno para decidir si se enmascaran, se segregan en un circuito restringido o se activan controles adicionales de acceso.
- Cribado en procesos de selección y RRHH: identificar datos de salud, afiliación sindical u opinión política en currículos y expedientes, categorías donde el tratamiento está especialmente restringido.
- Enmascaramiento en tiempo de ejecución: integrar el modelo como paso previo a la persistencia en un backend de chat o formularios web, bloqueando o difuminando el span sensible antes de escribir en base de datos.
- Auditoría de datos en procesos de migración o compartición: analizar lotes masivos de documentos para verificar que los conjuntos exportados no contienen identificadores que debieran haberse seudonimizado.

## Benchmarks y rendimiento

| Evaluación | Conjunto | Métrica | Resultado |
|---|---|---|---|
| Validación del autor | Split sintético del autor | F1 | 1.0000 |

No se han publicado resultados de benchmarks en la información disponible más allá de ese F1 de validación sobre datos sintéticos. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones NER estándar en turco, ni comparaciones con detectores PII de terceros. El propio autor advierte que el 1.0000 no representa rendimiento real de cumplimiento y debe interpretarse únicamente como señal de que el modelo ajusta correctamente la distribución sintética de entrenamiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6 GB en FP32 y 0,3 GB en FP16/BF16 para los pesos; con activaciones y batch pequeño, el consumo real se sitúa por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (GTX 1650, RTX 3050, T4, L4). Para lotes grandes o alto throughput, una A10G, L4 o A100 resulta holgada pero innecesaria en términos de memoria.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna de gama baja y media. También es viable la inferencia en CPU para volúmenes moderados dado el tamaño de 150M parámetros.
- Opciones de despliegue: pipeline token-classification de transformers; exportación a ONNX u otros formatos mediante las herramientas estándar del ecosistema; endpoints gestionados de Hugging Face (el modelo lleva la etiqueta endpoints_compatible). No hay confirmación en la documentación proporcionada sobre soporte en vLLM, llama.cpp u Ollama, y al ser un encoder de clasificación no es un caso de uso típico de esos motores generativos.
- Latencia y throughput: no disponible. No se publican mediciones de latencia, tokens por segundo ni resultados de pruebas de carga.

## Comparativa con modelos similares

No se han publicado comparativas de este modelo con alternativas de la misma categoría. Como referencia mínima se incluye el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Idioma | Licencia | Tarea |
|---|---|---|---|---|---|
| girenit-KVKK-PII-150M | 149.361.451 | No disponible | Turco | Apache-2.0 | Detección de PII/KVKK (21 categorías) |
| ytu-ce-cosmos/modernbert-tr-base | No disponible en la información proporcionada | No disponible | Turco | No disponible en la información proporcionada | Modelo base de lenguaje (encoder) |
| Otros detectores PII en turco | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento, contexto ni licencia de detectores PII alternativos en turco dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El F1 de 1.0000 procede de un split sintético generado de forma determinista; no es un indicador válido de rendimiento sobre texto turco real.
- El modelo no puede determinar el cumplimiento legal ni elegir una base jurídica; la revisión humana es obligatoria según el propio autor.
- El entrenamiento es íntegramente sintético, sin registros de clientes, lo que implica un riesgo alto de mala generalización ante jerga, abreviaturas, errores ortográficos, dialectos, texto informal de redes sociales u OCR de baja calidad.
- Idiomas: solo turco. Su uso sobre textos en otros idiomas no está soportado y probablemente produzca falsos positivos o negativos.
- Identificadores con dígito de control (TCKN, IBAN, tarjetas): el autor recomienda complementar con una capa determinista de reglas, ya que el modelo por sí solo puede validar formatos inverosímiles.
- Riesgo de alucinación en sentido estricto: no aplica, porque no es un modelo generativo. El riesgo equivalente es el de falsos positivos y falsos negativos en la detección de spans.
- Antes de producción, el autor exige evaluar cada categoría sobre un corpus específico de la institución y revisado por juristas.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no exime de las obligaciones derivadas de KVKK, RGPD u otras normativas aplicables al tratamiento de datos personales.
- Se trata de una research preview (v2) sin garantías de mantenimiento, con 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación independiente por parte de la comunidad.
- No se documentan la longitud de contexto soportada, el esquema de etiquetado, los umbrales de decisión recomendados ni el tokenizador, lo que dificulta reproducir o calibrar el comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/girenit/girenit-KVKK-PII-150M
- Modelo base: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-base
- Dataset asociado (girenit-KVKK-Bench): https://huggingface.co/datasets/girenit/girenit-KVKK-Bench
- Papers, blogs, repositorios o demos adicionales: no se han encontrado en la búsqueda web realizada; los resultados devueltos correspondían a páginas genéricas del motor de búsqueda sin relación con el modelo.
