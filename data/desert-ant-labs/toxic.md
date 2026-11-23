# desert-ant-labs/toxic

## Resumen

Toxic es un modelo de clasificación de texto especializado en detección de discurso de odio, abuso y amenazas, desarrollado por Desert-Ant-Labs. Su particularidad principal es que está disenado para ejecutarse íntegramente en dispositivo (on-device), sin enviar el texto a ningún servidor, lo que permite moderar contenido antes de que se publique preservando la privacidad del usuario. El modelo clasifica el texto en tres cabeceras de contenido (HATEFUL, ABUSIVE, THREAT) y ocho cabeceras de colectivo objetivo (RACE, RELIGION, NATIONAL_ETHNIC_ORIGIN, SEXUAL_ORIENTATION, GENDER, DISABILITY, AGE, OTHER).

La arquitectura es una red de clasificación de texto ligera con una tabla de embeddings compartida (cuantizada a 4 bits) y un grafo de cómputo cuantizado a 8 bits, distribuido en formatos Core ML (Apple) y LiteRT/TFLite (Android, Linux, Windows, Node, navegador). La ventana de contexto es de 128 tokens (aproximadamente 80 palabras), con procesamiento por ventanas solapadas para textos más largos. El modelo soporta 35 idiomas y está en estado beta (versión de pesos v0.2.2).

Su relevancia actual radica en la combinación de moderación multilingüe, latencia muy baja (2,0 ms por mensaje corto en un iPhone 16 Pro) y despliegue multiplataforma sin dependencia de infraestructura en la nube. La licencia es propietaria de tipo source-available, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de clasificación de texto con tabla de embeddings compartida y grafo de cómputo cuantizado (no se especifica el tipo exacto de transformer o red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens por ventana (aproximadamente 80 palabras); ventanas solapadas para textos más largos |
| Tipos de cuantizacion | Capas del grafo a 8 bits; tabla de embeddings a 4 bits |
| Idiomas soportados | 35 (ar, bg, ca, cs, da, de, el, en, es, et, fi, fr, ga, he, hi, hr, hu, id, it, ja, ko, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh) |
| Licencia | desert-ant-labs-source-available (propietaria, source-available) |
| Formato de pesos | Core ML compilado (.mlmodelc), LiteRT (.tflite), tabla de embeddings binaria (.bin), tokenizador binario (.bin) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de lo descrito en la model card: se trata de un clasificador de texto con múltiples cabeceras de salida (tres de contenido y ocho de colectivo objetivo), una tabla de embeddings compartida entre los dos runtimes (Core ML y LiteRT) y un grafo de cómputo cuantizado. En Apple, el grafo se ejecuta íntegramente en el Neural Engine; en el resto de plataformas se ejecuta mediante LiteRT. El SDK no aplica preprocesado al texto (no convierte a minúsculas, no recorta, no elimina puntuación, emojis ni marcado).

No se han publicado datos sobre el volumen de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la cuantización mixta (4 bits en embeddings, 8 bits en capas) y la ejecución en Neural Engine. Los umbrales por defecto de cada cabecera se eligieron sobre un conjunto de validación, según la model card.

## Capacidades

- Clasificación de contenido tóxico en tres categorías: HATEFUL (incitación al odio o violencia contra un grupo), ABUSIVE (lenguaje insultante o degradante) y THREAT (amenaza de violencia).
- Identificación del colectivo objetivo en textos hateful mediante ocho cabeceras: raza, religión, origen nacional o étnico, orientación sexual, género, discapacidad, edad y otros.
- Salida de probabilidades por cabecera en el rango 0–1, junto con los umbrales aplicados y las cabeceras activadas.
- Umbrales configurables por cabecera para ajustar la sensibilidad (subir para marcar menos, bajar para marcar más).
- Procesamiento de textos largos mediante ventanas solapadas de 128 tokens, asignando al texto la puntuación máxima de cualquiera de sus ventanas.
- Soporte multilingüe en 35 idiomas.
- Ejecución on-device en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Integración mediante SDK en Swift, Kotlin y JavaScript/TypeScript.
- No dispone de tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Moderación previa a la publicación en redes sociales y foros: el SDK analiza el comentario antes de enviarlo y, si `isToxic` es verdadero, lo retiene para revisión, con una latencia de 2,0 ms en iPhone 16 Pro que permite hacerlo de forma síncrona en la interfaz.
- Filtrado en aplicaciones de mensajería y chats: al ejecutarse on-device y sin enviar texto a servidores, preserva el cifrado extremo a extremo y la privacidad de las conversaciones, algo crítico en mensajería personal.
- Moderación en clientes de correo y suites ofimáticas: el modelo puede advertir al redactor antes de enviar un mensaje abusivo, usando la cabecera ABUSIVE y los umbrales configurables para ajustar la sensibilidad por contexto.
- Protección de menores en plataformas educativas y comunidades infantiles: el despliegue en navegador y en dispositivos móviles permite filtrar contenido en el propio cliente sin infraestructura de moderación centralizada, con soporte para 35 idiomas.
- Análisis de comentarios en aplicaciones de noticias y medios: el procesamiento por ventanas solapadas permite analizar comentarios de hasta varios cientos de palabras, reteniendo los que superen el umbral en HATEFUL o THREAT.
- Sistemas de soporte y atención al cliente: el modelo puede clasificar mensajes entrantes de usuarios para derivar los que contengan amenazas o abuso a un flujo de escalado, con la ventaja de que el texto no sale del dispositivo del agente o del cliente.
- Investigación en ciencias sociales y análisis de discurso: la salida estructurada por cabeceras (contenido y colectivo objetivo) permite cuantificar tipos de toxicidad y colectivos afectados en corpus multilingües, aunque el límite de 128 tokens por ventana exige segmentar documentos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una latencia de 2,0 ms para un mensaje corto en un iPhone 16 Pro, sin métricas de precisión, recall, F1 ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está pensado para ejecución en CPU, GPU integrada o Neural Engine. El grafo Core ML ocupa 43 MB, el grafo LiteRT 44 MB y la tabla de embeddings 50 MB, con un total aproximado de 137 MB de pesos (el repositorio completo ocupa 1,1 GB).
- GPU recomendadas: no se especifican; en Apple se ejecuta en el Neural Engine, y en el resto de plataformas mediante LiteRT (CPU/GPU según el runtime).
- Cabe en cualquier dispositivo consumer moderno: iPhone, iPad, Mac, Apple TV, Vision Pro, dispositivos Android, PC con Linux o Windows y navegadores. No requiere GPU dedicada.
- Opciones de despliegue: SDK oficial en Swift (Core ML), Kotlin (LiteRT) y JavaScript/TypeScript (LiteRT en navegador y Node). Los pesos se descargan de Hugging Face en el primer uso y se cachean.
- Latencia: 2,0 ms por mensaje corto en iPhone 16 Pro según la model card. No se publican datos de throughput ni latencia en otras plataformas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. A continuación se indica qué datos faltan para una comparación rigurosa:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue on-device |
|---|---|---|---|---|---|
| Toxic (desert-ant-labs) | no disponible | 128 tokens/ventana | 35 | source-available propietaria | Sí (Core ML, LiteRT) |
| Alternativas de clasificación de toxicidad | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo en estado beta (versión de pesos v0.2.2): la API y el comportamiento pueden cambiar.
- Ventana de contexto limitada a 128 tokens (unas 80 palabras) por ventana; los textos largos se analizan por ventanas solapadas y se puntúan con el máximo, lo que puede generar falsos positivos por fragmentos aislados.
- No se han publicado métricas de precisión, recall ni F1, por lo que no es posible evaluar su fiabilidad frente a falsos positivos y negativos.
- Riesgo de sesgo: al ser un clasificador de toxicidad multilingüe, puede tener un rendimiento desigual entre idiomas y colectivos; no se documenta la composición del dataset ni procesos de mitigación de sesgos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas (falsos positivos y negativos) que pueden afectar a la libertad de expresión o dejar pasar contenido dañino.
- Licencia propietaria source-available: el uso comercial está sujeto a los términos de https://license.desertant.com/, que no se detallan en la información disponible; es imprescindible revisarlos antes de integrarlo en producción.
- La descarga de pesos desde Hugging Face en el primer uso requiere conectividad; el modo offline solo funciona tras el cacheo inicial.
- El SDK no normaliza el texto (no convierte a minúsculas, no elimina emojis ni marcado), por lo que el comportamiento depende del texto tal cual se escribe.
- No soporta generación de texto, razonamiento ni tool calling: su uso está acotado a clasificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/toxic
- Pesos v0.2.2: https://huggingface.co/desert-ant-labs/toxic/tree/v0.2.2
- Demo: https://desertant.com/models/toxic/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descargas y cacheo del modelo: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
