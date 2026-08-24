# lokomotifai/hushmark-modernbert-tr-149m

## Resumen

`hushmark-modernbert-tr-149m` es un modelo de etiquetado de secuencias (token-classification) para la detección de información personal identificable (PII) en texto turco, desarrollado por Lokomotif AI como parte de su sistema Hushmark, una solución offline-first para el cumplimiento de la ley KVKK (protección de datos personales en Turquía). El modelo se basa en `ytu-ce-cosmos/modernbert-tr-base`, una adaptación al turco de ModernBERT, y añade una cabeza de clasificación BIO por cada uno de los doce tipos de entidad NER propios de Hushmark: persona, dirección, organización, fecha de nacimiento, salud, religión, etnia, opinión política, vida sexual, antecedentes penales, referencia biométrica y afiliación sindical.

El modelo está diseñado para sustituir al anterior sistema basado en GLiNER, que presentaba un rendimiento muy inferior en la evaluación bloqueada. Con 148,7 millones de parámetros y una ventana de contexto de 384 tokens durante el entrenamiento (aunque la arquitectura soporta hasta 8.192), este candidato ha superado la puerta de adopción interna, pero aún no se ha convertido en el modelo por defecto en producción debido a limitaciones de generalización detectadas en texto real fuera de los patrones sintéticos de entrenamiento. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) con cabezas de etiquetado BIO por tipo de entidad |
| Parametros totales | 148.765.476 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 384 tokens en entrenamiento; 8.192 soportados por la arquitectura |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | no especificado; el repositorio incluye la etiqueta `onnx`, lo que sugiere disponibilidad en formato ONNX además de safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ytu-ce-cosmos/modernbert-tr-base`, un encoder ModernBERT preentrenado en turco. Sobre esta base se añaden doce cabezas de clasificación independientes, cada una con tres etiquetas (O, B, I) para su tipo de entidad correspondiente. Esta elección de cabezas separadas, en lugar de una única secuencia de etiquetas BIO, permite representar entidades anidadas o solapadas, algo frecuente en texto administrativo turco (por ejemplo, una dirección que contiene una organización). El modelo no es generativo ni admite tool calling; es exclusivamente un extractor de entidades.

El entrenamiento se realizó sobre un corpus de 114.983 documentos, divididos en train (51.275), dev (4.421), evaluación bloqueada (5.513) y cuarentena (53.774). Las fuentes incluyen paquetes externos de PII turca, documentos generados sintéticamente para las ocho categorías especiales, negativos extraídos de texto real y negativos basados en reglas. Se empleó una GPU NVIDIA A100-SXM4-80GB, con precisión bf16, batch size 32, longitud máxima 384, 3 épocas, learning rate de 3e-5 para el encoder y 1e-4 para las cabezas, 200 pasos de warm-up, peso de clase externa 1.0 frente a 8.0 para B/I, y validación cada 300 pasos con paciencia 6. El entrenamiento duró 575,5 segundos en 4.500 pasos, con un pico de memoria de 9.965.534.720 bytes (~9,3 GB). El checkpoint seleccionado fue el de mejor F1 estricto macro en dev (0,9994 en el paso 2.700).

## Capacidades

- Detección de doce tipos de entidades PII: persona, dirección, organización, fecha de nacimiento, salud, religión, etnia, opinión política, vida sexual, antecedentes penales, referencia biométrica y afiliación sindical.
- Etiquetado multi-etiqueta con solapamiento: permite que una entidad contenga otra (por ejemplo, una organización dentro de una dirección).
- Condicionamiento de categorías especiales: las ocho categorías sensibles (salud, religión, etc.) solo se etiquetan cuando están atribuidas a un sujeto de datos; por ejemplo, "Hipertansiyon Türkiye genelinde yaygındır" (la hipertensión es común en Turquía) se considera negativo, mientras que "Hasta, migren nedeniyle rapor talep etti" (el paciente solicitó un informe por migraña) es positivo.
- Soporte de inferencia en formato ONNX, lo que facilita el despliegue en entornos de producción con ONNX Runtime.
- No soporta generación de texto, razonamiento conversacional, tool calling ni capacidades multimodales.

## Casos de uso

- Cumplimiento de la ley KVKK en empresas turcas: el modelo puede escanear documentos internos, contratos o bases de datos para localizar y marcar datos personales que deben ser protegidos o anonimizados antes de su tratamiento.
- Anonimización de expedientes médicos y legales: permite identificar menciones de salud, religión, opinión política u otras categorías sensibles en informes clínicos o sentencias judiciales, facilitando la redacción manual o automática.
- Filtrado de PII en logs de aplicaciones: al integrarse como un servicio de inferencia, puede procesar registros de servidores o trazas de depuración para eliminar nombres, direcciones o fechas de nacimiento antes de su almacenamiento o análisis.
- Preparación de datasets para entrenamiento de modelos: antes de publicar o compartir conjuntos de datos en turco, el modelo puede detectar y eliminar PII, reduciendo el riesgo de fuga de información personal.
- Moderación de contenido en foros y redes sociales: identifica publicaciones que contengan datos personales de terceros (por ejemplo, números de teléfono, direcciones) para su revisión o eliminación automática.
- Búsqueda y redacción en archivos periodísticos: ayuda a los medios a localizar menciones de datos sensibles en noticias antiguas antes de su republicación digital, cumpliendo con normativas de privacidad.

## Benchmarks y rendimiento

La evaluación bloqueada, realizada una única vez sobre 5.513 documentos, arrojó los siguientes resultados comparados con el modelo incumbente `hushmark-tr` (basado en GLiNER):

| Metrica | Candidato (v2) | Incumbente (v1) |
|---|---|---|
| Macro strict-F1 | **0,9961** | 0,3668 |

Mejora absoluta: +0,6294 (mínimo requerido: +0,05). No se registraron regresiones por tipo superiores a 0,02.

Desglose por tipo de entidad (strict F1):

| Tipo | v2 | v1 | Tipo | v2 | v1 |
|---|---|---|---|---|---|
| ADDRESS | 1,0000 | 0,0034 | HEALTH | 1,0000 | 0,2849 |
| BIOMETRIC_REF | 1,0000 | 0,0887 | ORG | 0,9808 | 0,6996 |
| CRIMINAL | 1,0000 | 0,1092 | PERSON | 0,9955 | 0,6398 |
| DOB | 0,9860 | 0,8828 | POLITICAL | 1,0000 | 0,1467 |
| ETHNICITY | 1,0000 | 0,5246 | RELIGION | 0,9912 | 0,3614 |
| SEXUAL_LIFE | 1,0000 | 0,3697 | UNION | 1,0000 | 0,2902 |

Sin embargo, el propio autor advierte que estos números miden el aprendizaje del corpus sintético, no la comprensión del turco real. Un conjunto de diez sondas escritas a mano fuera de los marcos del generador obtuvo 8/10 aciertos, con un fallo crítico en la construcción adjetival "Hasta Ayşe Yılmaz migren tanısıyla başvurdu" (la paciente Ayşe Yılmaz acudió con diagnóstico de migraña), donde no se detectó la entidad `HEALTH`. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, dado que el modelo es un encoder de NER y no un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: con 148,7 millones de parámetros, el modelo en precisión bf16 ocupa aproximadamente 300 MB, en int8 unos 150 MB y en 4-bit unos 75 MB (estimaciones basadas en el tamaño de parámetros; no hay datos oficiales). Más overhead de activaciones, cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1650, RTX 3060, etc.) o incluso CPU para inferencia por lotes pequeña. Para despliegue de alto rendimiento, una A10 o A100 sería suficiente, aunque no es necesaria.
- Opciones de despliegue: al ser un modelo encoder, se puede servir con Hugging Face Transformers, ONNX Runtime (dada la etiqueta `onnx`), o mediante frameworks de inferencia como vLLM (aunque no es el caso típico para encoders). También es posible ejecutarlo en CPU con `transformers` o `optimum`.
- Latencia y throughput: no disponible en la documentación. Dado el tamaño, se espera una latencia de milisegundos por documento en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro strict-F1 (locked) | Licencia | Notas |
|---|---|---|---|---|---|
| hushmark-modernbert-tr-149m (candidato) | 148,7M | 384 (entrenamiento) / 8192 (arquitectura) | 0,9961 | Apache-2.0 | Basado en ModernBERT-tr, cabezas por tipo |
| hushmark-tr (incumbente, GLiNER) | no disponible | no disponible | 0,3668 | no disponible | Modelo GLiNER de vocabulario abierto, superado ampliamente |
| hushmark-berturk-112m (challenger) | 112M | no disponible | no disponible | no disponible | Challenger privado, aún no integrado en producción |
| ytu-ce-cosmos/modernbert-tr-base (base) | 149M | 8192 | no aplica | Apache-2.0 | Modelo base sin cabezas de NER, usado como punto de partida |

## Limitaciones y advertencias

- Falsos negativos en construcciones lingüísticas fuera de los marcos de entrenamiento: el modelo falla en patrones como "migren tanısıyla" (con diagnóstico de migraña), lo que puede ser crítico en contextos médicos o legales.
- No es una garantía de anonimización ni de cumplimiento legal: el autor indica explícitamente que es una ayuda de detección y que los operadores deben validar el modelo con sus propios datos.
- Categorías especiales condicionadas a la atribución a un sujeto: si una mención de salud o religión no está claramente atribuida a una persona, el modelo puede no etiquetarla, lo que podría ser un problema en ciertos usos.
- No está entrenado para duplicar identificadores deterministas (DNI, pasaportes, números de tarjeta) ni secretos; estos son rechazados en el límite del esquema del corpus, por lo que el modelo no los detecta.
- El rendimiento en texto real puede ser inferior al de la evaluación bloqueada, que se basa en datos generados con los mismos patrones sintéticos del entrenamiento.
- Aunque la licencia es Apache-2.0, el modelo aún no es el default en producción; su adopción está pendiente de resolver las limitaciones de generalización.
- Posible sesgo derivado del uso de datos sintéticos y de un léxico de 550 entradas para las categorías especiales, que puede no cubrir la variabilidad del turco real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lokomotifai/hushmark-modernbert-tr-149m
- Repositorio GitHub de Hushmark: https://github.com/lokomotifai/hushmark
- Perfil de Lokomotif AI en Hugging Face: https://huggingface.co/lokomotifai/models
- Modelo base ModernBERT-tr: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-base
- Blog de ModernBERT (Answer.AI / LightOn): https://huggingface.co/blog/modernbert
- Repositorio de investigación de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
