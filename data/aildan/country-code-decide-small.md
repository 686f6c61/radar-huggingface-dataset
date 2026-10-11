# aildan/country-code-decide-small

## Resumen

CountryCode-Decide (small, v1.2) es un modelo de clasificación de texto desarrollado por el usuario aildan, especializado en normalizar cadenas de texto libre que designan un país o un estado de EE. UU. hacia códigos ISO 3166-1 alpha-2 y ISO 3166-2:US. El modelo no se limita a asignar una etiqueta: devuelve probabilidades calibradas, una lista de candidatos y, cuando no puede alcanzar la tasa de error solicitada, **se abstiene** de responder. Está pensado para tareas de back-office como la normalización de campos de país, jurisdicción o nacionalidad en registros mercantiles y procesos de KYB (know your business), siempre con revisión humana de las abstenciones.

El modelo se apoya en el encoder multilingüe jhu-clsp/mmBERT-small y añade dos cabezas de clasificación. Se distribuye en formato ONNX (int8 y fp32), pesa unos 75 MB en su versión cuantizada y resuelve una cadena en aproximadamente 4 ms en CPU, lo que permite desplegarlo sin GPU ni PyTorch. La relevancia actual radica en su enfoque de predicción selectiva con calibración certificada por dominio: el autor publica umbrales de confianza para tasas de error del 2 % y el 5 % según el dominio, algo poco habitual en modelos de normalización de entidades.

La ficha se basa exclusivamente en la información disponible en la página de HuggingFace y en la model card aportada; la sección de evaluación de dicha model card aparece truncada en la información recibida, por lo que no se incluyen cifras de rendimiento no confirmadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base jhu-clsp/mmBERT-small) con dos cabezas de clasificación; se sirve como grafo ONNX |
| Parametros totales | no disponible (tamano del modelo: 75 MB en int8; el repo completo ocupa 0.3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (`model.int8.onnx`, servido) y fp32 (`model.onnx`, referencia) |
| Idiomas soportados | multilingue (lexico de entrenamiento con 372.683 nombres en 1.274 idiomas, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`, `model.onnx`) junto con `tokenizer.json`, `tokenizer_config.json`, `calibration.json` y `meta.json` |

## Arquitectura y entrenamiento

El modelo parte del encoder multilingüe jhu-clsp/mmBERT-small y le incorpora dos cabezas de clasificación: una para el codigo de pais (ISO 3166-1 alpha-2) y otra para el estado de EE. UU. (ISO 3166-2:US). Se distribuye como grafo ONNX con pesos en int8 para servicio en CPU y una version fp32 de referencia. La logica de decision (calibracion por temperaturas, umbrales certificados y reglas de candidatos) no vive en el grafo, sino en el objeto `CountryCoder` del repositorio del autor, que aplica dicha calibracion por dominio (`register` y `curated`).

El entrenamiento utilizo 142.925 ejemplos repartidos en tres fuentes: 98.517 nombres y codigos de lexico (68,9 %), 43.957 cadenas generadas (30,8 %) y 451 cadenas reales de registros (0,3 %). El lexico procede de CLDR 47 y Wikidata, con 86.406 claves distintas y 1.947 marcadas como genuinamente ambiguas. Las cadenas generadas provienen de nueve generadores (keyboard, format, translit, geo, pairs, affix, caprov, junk y regjunk), cada uno de los cuales supero cinco controles de calidad (G1 correccion de etiqueta con auditoria humana de 300 elementos por release y cero errores exigidos; G2 realismo; G3 utilidad en cadenas reales retenidas; G4 sin solapamiento con evaluacion; G5 reproducibilidad). Los generadores de OCR, parafrasis por LLM y regiones no superaron la puerta G3 y no se usaron. No se han documentado fases de RLHF o DPO, dado que se trata de un clasificador supervisado, no de un modelo generativo.

## Capacidades

- Clasificacion de cadenas de texto libre que designan un pais o un estado de EE. UU. hacia codigos ISO 3166-1 alpha-2 / ISO 3166-2:US.
- Manejo de errores tipograficos, abreviaturas, transliteraciones, nombres historicos y ruido de registro (etiquetas de placeholder, fechas, numeros).
- Direccionalidad segun el campo: acepta `field` con valores `country`, `jurisdiction`, `nationality` o `unknown`.
- Prediccion selectiva con absteccion: devuelve `abstain = True` cuando no puede cumplir la tasa de error objetivo (`alpha`).
- Salida con probabilidades calibradas por dominio (`register`, `curated`) y umbrales certificados (5 % en curado; 2 % y 5 % en registro).
- Lista de candidatos: hasta tres codigos con probabilidad calibrada >= 0,05.
- Deteccion de cadenas que no son lugares: devuelve `NONE` para placeholders, fechas, numeros y nombres de empresa generados.
- Manejo de cadenas con dos paises (etiquetadas como conjunto de ambos).
- Soporte de codigos de provincia canadiense en el campo de jurisdiccion de un registro estadounidense (mapea a `CA`).
- Multilingue: cubre nombres en 1.274 idiomas segun el lexico de entrenamiento.
- No se documenta tool calling, function calling ni razonamiento multi-paso; el modelo es un clasificador de una sola cadena, no un agente.

## Casos de uso

- Normalizacion de campos de pais en registros mercantiles: el modelo convierte variantes sucias ("Untted Klngdom", abreviaturas, transliteraciones) en codigos ISO, y el equipo humano revisa unicamente las abstenciones y las listas de candidatos.
- Onboarding KYB en entidades financieras: al procesar altas de empresas, normaliza el campo de jurisdiccion y pais de constitucion, con una tasa de error controlada gracias al parametro `alpha`.
- Deduplicacion de clientes y proveedores: mapear multiples grafias de un mismo pais a un unico codigo permite agregar registros que de otro modo no coincidirian.
- Enriquecimiento de datos en pipelines CRM/ERP: rellenar campos de pais normalizados a partir de texto libre introducido por operadores, sin GPU y con ~4 ms por cadena.
- Limpieza de datos historicos: interpretar nombres historicos o formas en desuso de paises y mapearlos al codigo ISO actual.
- Normalizacion de nacionalidades en formularios de compliance: usar `field="nationality"` para convertir adjetivos de nacionalidad y gentilicios a codigo de pais.
- Clasificacion de jurisdicciones de EE. UU.: mapear el estado escrito en texto libre a su codigo ISO 3166-2:US en registros estadounidenses.
- Deteccion de ruido en campos de pais: descartar (`NONE`) valores que no son lugares (placeholders, numeros, fechas) antes de alimentar sistemas posteriores.
- Preprocesado para modelos de direccion: usar CountryCode-Decide para resolver el campo de pais de forma fiable antes de pasar la direccion completa a otro sistema, dado que el modelo esta fuera de alcance para direcciones postales completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion, pero en la informacion proporcionada aparece truncada ("Fresh registers never used for..."), por lo que no se dispone de cifras completas. El autor indica que el codigo, la evaluacion y la documentacion estan en el repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada: no requiere GPU. El modelo es un clasificador sobre encoder que pesa ~75 MB en int8 y se ejecuta en CPU.
- GPU recomendadas: no aplica; el modelo esta disenado para inferencia en CPU.
- Cabe en cualquier equipo: el propio autor indica ejecucion en CPU con aproximadamente 4 ms por cadena.
- Opciones de despliegue: ONNX Runtime (`onnxruntime`), junto con `tokenizers` y `numpy`; no requiere PyTorch. La logica de decision esta en el objeto `CountryCoder` del repositorio del autor.
- Latencia y throughput estimados: ~4 ms por cadena en CPU (dato del autor). El throughput agregado en produccion no esta disponible.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de modelos comparables en la informacion proporcionada. Cualitativamente, cabe situar el modelo frente a alternativas genericas que resolven el mismo problema, aunque sin cifras de rendimiento publicadas que permitan una comparacion numerica:

| Alternativa | Tipo | Contexto | Licencia | Disponibilidad | Comparativa cuantitativa |
|---|---|---|---|---|---|
| CountryCode-Decide (small, v1.2) | Clasificador encoder sobre mmBERT-small, calibrado | Campo unico | Apache 2.0 | ONNX en HuggingFace | Base de referencia |
| Librerias de tablas de codigos (p. ej. mapeos ISO estaticos) | Reglas/diccionario | N/A | Segun libreria | Paquetes de software | No disponible |
| Modelos de normalizacion de entidades basados en LLM | Generativo | Largo | Variable | Variable | No disponible |

No se han facilitado resultados de benchmarks que permitan comparar parametros, contexto o rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Alcance restringido: el modelo lee un unico campo. No esta disenado para direcciones postales completas.
- Subdivisiones: solo cubre estados de EE. UU.; no cubre subdivisiones de otros paises.
- No ofrece asesoramiento legal; usarlo como sustituto de criterio juridico esta fuera de alcance.
- No debe usarse para tomar decisiones sobre personas sin revision humana.
- Riesgo de alucinacion: al ser un clasificador, no "inventa" texto, pero puede asignar un codigo incorrecto con alta confianza si la cadena es ambigua o esta fuera de la distribucion de entrenamiento. La absteccion mitiga este riesgo solo cuando se configura `alpha`.
- La calibracion certificada para el dominio de registro solo se aplica al pasar `domain="register"`; en otros dominios no esta certificada.
- Cobertura linguistica: aunque el lexico abarca 1.274 idiomas, la calidad por idioma no esta documentada de forma individual en la informacion disponible.
- Datos de entrenamiento: aproximadamente un tercio de los ejemplos son generados; el autor indica que ninguno se uso para calibracion o evaluacion.
- Licencia: Apache 2.0, lo que permite uso comercial, sujeto a los terminos de la licencia y al modelo base jhu-clsp/mmBERT-small.
- El modelo es muy reciente (subido el 2026-10-10) y cuenta con 0 descargas y 0 likes, por lo que no existe validacion de la comunidad en el momento de redactar esta ficha.
- Los requisitos de licencia del modelo base mmBERT deben verificarse por separado, ya que este dato no se detalla en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aildan/country-code-decide-small
- Repositorio de codigo, evaluacion y documentacion: https://github.com/aliildan/country-code-decide
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
