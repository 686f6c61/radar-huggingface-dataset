# desert-ant-labs/toxic

## Resumen

Toxic es un modelo de clasificación de texto desarrollado por Desert Ant Labs, un laboratorio europeo especializado en modelos de IA on-device. Su función principal es la detección de discurso de odio, abuso y amenazas en 23 idiomas europeos, actuando como herramienta de triaje para moderadores humanos. El modelo se distribuye en formatos optimizados para ejecución local en dispositivos móviles, navegadores y sistemas embebidos, sin necesidad de enviar texto a servidores externos.

El modelo se basa en un encoder transformer de la familia XLM-R (tokenizador SentencePiece-Unigram recortado a 95.552 piezas) con aproximadamente 159,6 millones de parámetros. Emplea una arquitectura multi-cabeza: tres cabezas de contenido (HATEFUL, ABUSIVE, THREAT) y diez cabezas de objetivo que identifican el grupo protegido al que se dirige el discurso. Los pesos cuantizados ocupan entre 80 y 100 MB según el formato, lo que permite su despliegue en hardware de consumo. La licencia es de código disponible (source-available) con restricciones específicas, no es open source estándar.

Su relevancia actual radica en ofrecer una alternativa de moderación de contenido que preserva la privacidad (inferencia 100% local) y que supera en precisión a modelos mucho más grandes en el benchmark Multilingual HateCheck, según los datos publicados por el propio laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (lineaje XLM-R, tokenizador SentencePiece-Unigram recortado a 95.552 piezas) |
| Parametros totales | ~159,6 millones (estado PyTorch fp32, vocabulario recortado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 blockwise-32 (LiteRT/TFLite), int4 + int4 embedding (ONNX), 4-bit palettized (Core ML), fp32 (PyTorch) |
| Idiomas soportados | 23: bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, nl, pl, pt, ro, sk, sl, sv |
| Licencia | desert-ant-labs-source-available-1.0 (código disponible, no open source) |
| Formato de pesos | TFLite (90,6 MB), ONNX (100,2 MB), Core ML mlmodelc (80,2 MB), PyTorch state dict (638,5 MB) |

## Arquitectura y entrenamiento

Toxic es un encoder transformer basado en la arquitectura XLM-R, con un tokenizador SentencePiece-Unigram recortado a 95.552 piezas para reducir el tamaño del vocabulario. El modelo comparte un único encoder para dos capas de salida multi-etiqueta: una capa de contenido con tres cabezas (HATEFUL, ABUSIVE, THREAT) y una capa de objetivo con diez cabezas correspondientes a los motivos de protección de la Directiva marco 2008/913/JHA (raza, color, religión, ascendencia, origen nacional o étnico, orientación sexual, género, discapacidad, edad y otro). Cada cabeza se entrena con supervisión específica y los umbrales de activación se definen por cabeza e idioma.

El entrenamiento se basó en anotaciones humanas de severidad, incluyendo los votos de la multitud de civil_comments para las etiquetas `insult` e `identity_attack`, así como equivalentes por corpus. No se menciona el uso de RLHF o DPO. Los pesos enviados se midieron directamente en los artefactos exportados, no extrapolados de un checkpoint de entrenamiento. La arquitectura incluye un mecanismo `disabled_heads` en los metadatos que permite desactivar cabezas que no superen una puerta de calidad, fijando su umbral a un valor inalcanzable en todas las plataformas.

## Capacidades

- Detección de discurso de odio (HATEFUL) según la definición de la UE (incitación pública a la violencia o al odio contra un grupo protegido).
- Clasificación de lenguaje abusivo e insultante (ABUSIVE), con ordenación por severidad. Es un superconjunto de HATEFUL.
- Detección de amenazas de violencia hacia personas o grupos (THREAT).
- Identificación del grupo protegido objetivo entre diez categorías (RACE, COLOUR, RELIGION, DESCENT, NATIONAL_ETHNIC_ORIGIN, SEXUAL_ORIENTATION, GENDER, DISABILITY, AGE, OTHER).
- Clasificación multi-etiqueta: un texto puede activar varias cabezas simultáneamente.
- Multilingüe: 23 idiomas europeos, con evaluación en siete de ellos (de, fr, nl, pt, es, it, pl) sobre Multilingual HateCheck real.
- Inferencia 100% on-device: no envía texto a servidores externos.
- Compatible con LiteRT/TFLite (Android/Linux), ONNX Runtime Web (navegador) y Core ML (iOS/macOS con CPU y Neural Engine).

## Casos de uso

- Moderación de comentarios en redes sociales y foros: el modelo clasifica mensajes entrantes en tiempo real y asigna una prioridad de revisión a los moderadores humanos, indicando si el mensaje es odio, abuso o amenaza y a qué grupo afecta.
- Filtrado de mensajes abusivos en plataformas de contenido generado por usuarios: puede integrarse en pipelines de publicación para retener mensajes sospechosos hasta su revisión, sin bloquear automáticamente.
- Moderación en juegos online y comunidades de jugadores: al ejecutarse en el dispositivo, no añade latencia de red y funciona sin conexión, adecuado para chats de voz o texto en tiempo real.
- Sistemas de atención al cliente: clasifica interacciones de usuarios para detectar lenguaje abusivo o amenazas hacia agentes humanos, permitiendo escalar el caso a supervisión antes de que la conversación continúe.
- Aplicaciones móviles de mensajería: integración como capa de protección para que los usuarios puedan marcar o bloquear mensajes ofensivos sin depender de servidores centrales.
- Auditoría de contenido en plataformas europeas: ayuda a cumplir con la normativa de la UE sobre discurso de odio, proporcionando un triaje inicial que un moderador humano debe validar.
- Herramientas de investigación social: análisis de corpus multilingües para estudiar la prevalencia de discurso de odio por grupo protegido e idioma, usando las cabezas de objetivo para desglosar resultados.

## Benchmarks y rendimiento

Según la model card, los resultados se midieron sobre los pesos enviados (shipped weights) y se desglosan por nivel de confianza. La métrica principal es macro-F1 sobre Multilingual HateCheck (MHC) real para siete idiomas de la UE.

| Benchmark | Alcance | Resultado |
|---|---|---|
| Multilingual HateCheck (7-EU) | de, fr, nl, pt, es, it, pl | macro-F1 0,8470 (pesos enviados) |
| Multilingual HateCheck (7-EU) | promedio de 3 ejecuciones de entrenamiento | macro-F1 0,834 |
| textdetox (binario tóxico-vs-limpio) | 5 idiomas | macro-F1 0,724 |
| offenseval2020 (binario tóxico-vs-limpio) | 3 idiomas | macro-F1 0,658 |

El modelo card especifica que los resultados de textdetox y offenseval2020 provienen de corpus fuera del dominio de desarrollo, sin linaje compartido con los benchmarks de entrenamiento. Para los otros 15 idiomas no cubiertos por MHC real, se utilizaron conjuntos de evaluación sintéticos traducidos y auditados, cuyos números se consideran estimaciones de desarrollo y no son comparables con MHC.

## Requisitos de hardware

- Inferencia en CPU: el modelo cuantizado (int4) pesa entre 80 y 100 MB, por lo que puede ejecutarse en CPUs de móviles y ordenadores sin GPU dedicada.
- GPU recomendada: no necesaria; el modelo está diseñado para edge y móvil. En caso de usar el checkpoint PyTorch (638 MB fp32), una GPU con 2-4 GB de VRAM es suficiente para inferencia.
- Compatibilidad con hardware de consumo: sí, cualquier smartphone con Android (LiteRT), iPhone con iOS/macOS (Core ML con Neural Engine) y navegadores modernos (ONNX Runtime Web).
- Opciones de despliegue: LiteRT/TFLite para Android y Linux, Core ML para iOS/macOS, ONNX Runtime Web para navegador, y PyTorch para investigación.
- Latencia y throughput: no se proporcionan cifras concretas, pero al ser un modelo de ~160 M parámetros cuantizado, se espera latencia de milisegundos en dispositivos móviles modernos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MHC 7-EU macro-F1 | Licencia | Despliegue |
|---|---|---|---|---|---|
| Toxic (desert-ant-labs) | ~159,6 M | no disponible | 0,847 | source-available | On-device (TFLite, ONNX, Core ML) |
| Shieldstral (Mistral) | 7 B (estimado) | no disponible | 0,79 (según Desert Ant Labs) | Apache 2.0 (Mistral) | Requiere GPU (16 GB VRAM según el sitio del fabricante) |
| Guard models para móvil | no disponible | no disponible | 0,65 (según Desert Ant Labs) | no disponible | On-device |

La comparativa se basa en los datos publicados por Desert Ant Labs en su sitio web. No se dispone de información oficial de Shieldstral ni de otros modelos de guardia para verificar estos números. Toxic supera en MHC 7-EU a Shieldstral (0,847 vs 0,79) y a los modelos de guardia para móvil (0,65), con un tamaño mucho menor.

## Limitaciones y advertencias

- Es una herramienta de triaje, no un veredicto: sus salidas son señales de escalada para revisión humana, no decisiones autónomas de eliminación de contenido.
- La cabeza ABUSIVE no indica a quién va dirigido el abuso: no distingue si el objetivo es el lector, una persona nombrada o nadie en particular. Integraciones no deben inferir direccionalidad a partir del nombre o de una puntuación alta.
- Los modos de fallo están publicados en la model card y deben leerse antes de integrar el modelo en cualquier ruta de aplicación de normas.
- Los resultados para 15 de los 23 idiomas se basan en conjuntos sintéticos traducidos, no en el benchmark real Multilingual HateCheck; su precisión puede diferir en producción.
- La licencia desert-ant-labs-source-available-1.0 no es open source estándar; puede imponer restricciones al uso comercial o a la redistribución. Se recomienda revisar los términos en https://license.desertant.com/1.0 antes de su uso.
- El modelo no es un detector de toxicidad general: está especializado en discurso de odio según la normativa europea, por lo que puede no detectar otras formas de contenido problemático (acoso, desinformación, etc.).
- No se ha publicado información sobre sesgos demográficos o lingüísticos específicos; se recomienda evaluar el modelo en el dominio y los idiomas de uso antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/toxic
- Modelo especializado en inglés: https://huggingface.co/desert-ant-labs/toxic-en
- Demo interactiva (Space): https://huggingface.co/spaces/desert-ant-labs/toxic-demo
- Sitio web del modelo: https://desertant.com/models/toxic/
- Organización en GitHub: https://github.com/Desert-Ant-Labs
- Sitio web de Desert Ant Labs: https://desertant.com/
- Licencia: https://license.desertant.com/1.0
