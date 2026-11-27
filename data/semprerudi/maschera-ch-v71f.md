# semprerudi/maschera-ch-v71f

## Resumen

maschera-ch-v71f es un modelo de clasificación de tokens (token classification) especializado en la detección de datos personales en documentos suizos. Lo desarrolla semprerudi como componente de reconocimiento de MASCHERA, una aplicación de escritorio gratuita (Windows, macOS, Linux y Docker) que enmascara información personal en documentos antes de enviarlos a un servicio de IA de terceros. El modelo cubre las tres lenguas nacionales suizas (alemán, francés e italiano) además del inglés; el romanche no está soportado.

Técnicamente es un fine-tuning de jhu-clsp/mmBERT-base, un transformer de arquitectura ModernBERT de 22 capas y 307.603.295 parámetros, con una cabeza de clasificación BIO de 95 etiquetas sobre 47 tags. Su ventana de contexto es de 512 tokens, por lo que los documentos largos se procesan por ventanas desde la herramienta que lo integra. Los pesos se distribuyen en safetensors (1,2 GB) y la licencia es MIT.

La relevancia del modelo reside en su enfoque de despliegue local: todo el procesamiento ocurre en el dispositivo del usuario, sin enviar datos a ningún servidor. Es el sucesor de maschera-ch-v63b e incorpora dos etiquetas nuevas (JOBTITLE y FAMILYROLE) y la detección de nombres en cabeceras de actas («Protokoll») como personas en lugar de organizaciones. Se distribuye con MASCHERA 2.5.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), 22 capas |
| Parametros totales | 307.603.295 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (documentos largos procesados por ventanas por la herramienta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | de, fr, it, en (romanche no soportado) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 1,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/mmBERT-base, un encoder ModernBERT multilingüe de 22 capas y 308M de parámetros, sobre el que se aplica un fine-tuning para clasificación de tokens con esquema BIO. La cabeza de clasificación emite 95 etiquetas BIO sobre 47 tags (contrato `6abcddcc`, que amplía los 45 tags del contrato `b7a96dc9` con JOBTITLE y FAMILYROLE). La taxonomía cubre identificadores suizos con dígito de control (AHV, UID, IBAN, referencia QR, GLN), direcciones, nombres, títulos de puesto, roles familiares, fechas y referencias administrativas.

El entrenamiento se realizó exclusivamente con datos sintéticos, generados a partir de plantillas y nomenclaturas del repositorio, con valores extraídos de fuentes administrativas suizas abiertas; el autor declara que el modelo nunca ha visto un documento real. No se partió de cero: el modelo continúa desde maschera-ch-v63b, ampliando la cabeza de clasificación con las cuatro nuevas etiquetas y conservando exactamente las 91 filas existentes. Los valores de evaluación proceden de una zona de holdout, de modo que ninguno fue visto durante el entrenamiento. No se documentan en la información disponible detalles sobre RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Clasificación de tokens para detección de datos personales (PII) con esquema BIO y 95 etiquetas.
- Reconocimiento de identificadores suizos con dígito de control: AHV (número de seguridad social), UID, IBAN, referencia QR y GLN.
- Detección de direcciones (calle, número de edificio, código postal, ciudad), nombres completos, títulos de puesto y roles familiares.
- Detección de fechas y referencias administrativas.
- Soporte multilingüe para alemán, francés, italiano e inglés en un único modelo.
- Capacidad de enmascaramiento y pseudonimización: sustitución de spans detectados por marcadores (por ejemplo, `[FULLNAME_1]`, `[AHVN13_1]`, `[STREET_1]`).
- Reconocimiento de nombres en cabeceras de actas («Protokoll») como personas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de etiquetado, no generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Enmascaramiento previo al envío a servicios de IA: el modelo etiqueta los spans con datos personales de un documento administrativo suizo para que la herramienta los sustituya por marcadores antes de que el texto salga del dispositivo. Es su uso principal y el que motiva su diseño.
- Cumplimiento de protección de datos en el sector público suizo: departamentos y administraciones pueden pseudonimizar correspondencia antes de compartirla con proveedores externos, reduciendo la exposición de datos personales en flujos que pasan por servicios en la nube.
- Procesamiento de correspondencia empresarial multilingüe: al cubrir de, fr, it y en, una misma instalación puede tratar documentos de las distintas regiones lingüísticas sin cambiar de modelo.
- Anonimización de expedientes antes de su publicación o archivo: como paso previo a la difusión de documentos, con revisión humana obligatoria del resultado dado el riesgo de fuga en torno al 1 % en documentos reales.
- Integración en herramientas de escritorio locales: al pesar 1,2 GB en safetensors y ejecutarse sobre ModernBERT, puede empaquetarse en aplicaciones de escritorio que corren en el propio equipo del usuario, sin GPU dedicada necesariamente.
- Detección de identificadores con dígito de control en flujos de validación: el modelo reconoce AHV, UID, IBAN, referencia QR y GLN, útil para localizar y verificar identificadores suizos en lotes de documentos.
- Etiquetado de datos para pipelines de NLP: los spans detectados pueden servir como entrada para otras etapas de procesamiento que requieran separar información personal del contenido.

## Benchmarks y rendimiento

| Metrica | Sintetico | Documentos gold |
|---|---|---|
| Tamano del conjunto | 2000 documentos, 31.168 spans gold | 9 documentos, 280 spans gold |
| Tasa de fuga (leak rate) | 0,16 % (426 fugas) | 1,27 % (6 fugas) |
| Micro-F1 | 0,900 | 0,757 |
| Sobre-enmascaramiento | 2757 | 119 |
| Reproducible | si | no |

El autor advierte que las cifras sintéticas no son comparables con las de ch-v63b (0,02 %, 13 fugas) porque el generador y el contrato de etiquetas cambiaron. De las 426 fugas sintéticas, 379 corresponden a las dos etiquetas nuevas: el modelo detecta aproximadamente el 41 % de los títulos de puesto (325 fugas) y el 55 % de los roles familiares (54 fugas). Las otras 45 etiquetas fugan 47 veces sobre 27.322 spans. Los documentos gold contienen datos personales reales y no se publican, por lo que no son recomputables por terceros. El autor señala además que el conjunto de test resuelve poco: dos modelos separados por menos de aproximadamente 0,06 de micro-F1 no pueden distinguirse con él.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 307M de parámetros y pesos en safetensors de 1,2 GB, la inferencia en fp32 requiere del orden de 1,2 GB de memoria para los pesos, sin contar activaciones.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada explícitamente en la información; por tamaño (308M de parámetros) es plausible en GPUs de consumo, pero no se aporta dato verificado.
- Opciones de despliegue: la información disponible solo menciona `transformers` como librería y el empaquetado dentro de la aplicación MASCHERA (Windows, macOS, Linux, Docker). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| maschera-ch-v71f | 307.603.295 | 512 tokens | MIT | Especializado en PII de documentos suizos; datos sintéticos; 0,16 % de fuga en test sintético |
| maschera-ch-v63b | no disponible | no disponible | no disponible | Predecesor directo; 0,02 % de fuga y 13 fugas en su conjunto sintético, no comparable por cambio de generador y contrato de etiquetas |
| jhu-clsp/mmBERT-base | 308M (aprox.) | no disponible | no disponible | Modelo base ModernBERT multilingüe; no especializado en PII |

No se dispone en la información proporcionada de comparaciones con otros modelos de detección de PII de la misma categoría.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: nunca ha visto un documento real, lo que limita la generalización a formatos y redacciones no representados en las plantillas.
- Tasa de fuga en documentos reales de aproximadamente el 1 % (1,27 % en los nueve documentos gold): no es cero. El autor exige revisión humana del texto enmascarado antes de transmitirlo.
- Es pseudonimización, no anonimización: mientras exista el diccionario de sustitución el proceso es reversible y, conforme a la ley suiza de protección de datos, los datos siguen siendo personales.
- El sobre-enmascaramiento es deliberado: el modelo está ajustado para preferir una palabra de más enmascarada frente a una fuga; el sobre-enmascaramiento creció principalmente en organizaciones (42) y títulos de puesto (20) respecto a ch-v63b.
- Rendimiento débil en las dos etiquetas nuevas: detecta en torno al 41 % de los títulos de puesto y el 55 % de los roles familiares, por su ambigüedad léxica y por los señuelos introducidos en el entrenamiento.
- El conjunto de evaluación gold no es reproducible por terceros al contener datos personales reales, y el conjunto sintético depende de plantillas y generador, por lo que sus cifras cambian si estos cambian.
- El test set actual tiene poder discriminativo limitado: diferencias inferiores a aproximadamente 0,06 de micro-F1 no son concluyentes.
- Contexto de solo 512 tokens: los documentos largos requieren troceado por ventanas, con el riesgo de perder contexto en los límites.
- El romanche no está soportado.
- No apto para redacción desatendida, decisiones automatizadas ni como única salvaguarda antes de publicar un documento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantía de cumplimiento normativo; es un paso de preparación, no una garantía de conformidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/semprerudi/maschera-ch-v71f
- Modelo predecesor: https://huggingface.co/semprerudi/maschera-ch-v63b
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Sitio web de MASCHERA: https://www.maschera.ch/
- Código fuente y descargas: https://github.com/semprerudi/maschera
