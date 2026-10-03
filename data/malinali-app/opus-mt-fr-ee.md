# malinali-app/opus-mt-fr-ee

## Resumen

El modelo `malinali-app/opus-mt-fr-ee` es un modelo de traducción automática francés → ewe (idioma hablado en Ghana, Togo y Benín) publicado por el equipo de Malinali, una aplicación de traducción orientada a inferencia en dispositivo. Se trata de una redistribución del modelo `Helsinki-NLP/opus-mt-fr-ee`, desarrollado dentro del proyecto OPUS-MT de la Universidad de Helsinki, que el autor ha reempaquetado en formato safetensors y con tokenizadores rápidos convertidos de SentencePiece a JSON para su uso con el runtime Candle.

El modelo emplea la arquitectura Marian, un transformer encoder-decoder específico para traducción automática neuronal, con 75.554.618 parámetros totales y un tamaño de repositorio de 0,3 GB. Es, por tanto, un modelo compacto que puede ejecutarse en CPU, en GPU de gama de entrada e incluso en dispositivos móviles, lo que encaja con el objetivo declarado de despliegue on-device.

Su relevancia radica en dos factores: cubre un par de idiomas de bajos recursos (fr → ee) poco atendido por los modelos multilingües masivos, y ofrece un empaquetado ligero y listo para entornos con recursos limitados. La model card indica que no se ha realizado entrenamiento adicional: Malinali solo redistribuye los pesos del modelo original y adapta los tokenizadores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, text2text-generation) |
| Parámetros totales | 75.554.618 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (los modelos OPUS-MT de este tamaño suelen estar limitados a ~512 tokens) |
| Tipos de cuantización | no se distribuyen pesos cuantizados; el repositorio contiene safetensors en precisión completa. Cuantización INT8/INT4 posible mediante conversión externa |
| Idiomas soportados | fr (francés), ee (ewe) |
| Licencia | no disponible en HuggingFace; la model card remite a la licencia del modelo original (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer completo con encoder y decoder, diseñado específicamente para traducción automática neuronal y entrenado con el framework Marian NMT. A diferencia de los modelos decoder-only, está optimizado para tareas seq2seq: recibe una secuencia origen y genera la traducción token a token. El tokenizador está desdoblado en dos ficheros (`tokenizer-enc.json` para el idioma origen y `tokenizer-dec.json` para el destino), lo que refleja el uso habitual de vocabularios SentencePiece separados en la familia OPUS-MT.

En cuanto al entrenamiento, la información proporcionada no incluye detalles sobre el número de tokens, la composición del corpus ni si se aplicaron técnicas de ajuste como RLHF o DPO. La model card de Malinali indica explícitamente que no se ha realizado un ajuste adicional: la única intervención del publicador es el reempaquetado de pesos en safetensors y la conversión de los tokenizadores SentencePiece a formato Hugging Face fast tokenizer para permitir la inferencia con Candle mediante la librería `marian_flutter`. Los detalles de entrenamiento del modelo base habría que consultarlos en la documentación del proyecto OPUS-MT.

## Capacidades

- Traducción de texto de francés a ewe, en modo texto a texto.
- Ejecución en dispositivo (on-device) mediante el runtime Candle, orientada a entornos móviles y sin conexión.
- Inferencia ligera en CPU gracias a su tamaño reducido (75,5 M de parámetros).
- Compatibilidad con la librería `transformers` y con el pipeline `translation`.
- Compatibilidad declarada con `endpoints_compatible`, lo que permite servirla como endpoint de inferencia.
- Uso de tokenizadores rápidos separados para origen y destino, lo que reduce el coste de preprocesado.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo estrictamente de traducción.

## Casos de uso

- Traducción en aplicaciones móviles sin conexión: el modelo puede embeberse en una app Android o iOS mediante Candle y ofrecer traducción fr → ee sin depender de red, algo crítico en regiones de Ghana, Togo o Benín con conectividad limitada.
- Atención ciudadana y servicios públicos en zonas francófonas de África Occidental: permite traducir comunicados administrativos, formularios o avisos sanitarios del francés al ewe para su difusión local.
- Localización de documentación y señalética: traducción de manuales técnicos, prospectos médicos o carteles de obra del francés al ewe para organizaciones no gubernamentales y agencias de cooperación.
- Traducción de contenido educativo: conversión de materiales escolares o cursos redactados en francés a ewe, aprovechando que el modelo funciona en hardware modesto y puede desplegarse en escuelas con equipos básicos.
- Preprocesado dentro de pipelines de datos multilingües: generación automática de pares fr → ee para aumentar corpus de entrenamiento de modelos mayores de traducción o para evaluación de modelos multilingües.
- Integración en asistentes de mensajería: traducción de conversaciones en tiempo real dentro de aplicaciones de chat, donde la latencia baja es posible gracias al reducido tamaño del modelo.
- Traducción como servicio interno autoalojado: desplegado detrás de un endpoint compatible con la API de `transformers`, sirve para digitalizar correspondencia o documentación interna de organizaciones que operan en francés y ewe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de calidad de traducción (BLEU, chrF, COMET) ni comparaciones cuantitativas con otros sistemas, y los resultados de la búsqueda web no aportan datos técnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos derivados del número de parámetros, no publicados por el autor):
  - FP32: ~302 MB de pesos.
  - FP16/BF16: ~151 MB de pesos.
  - INT8: ~76 MB de pesos.
  - INT4: ~38 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 o superiores. Modelos de gama alta como RTX 4090, A100 o H100 están sobredimensionados para este modelo, salvo que se ejecute en lotes muy grandes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e integrada. También funciona en CPU sin GPU dedicada.
- Opciones de despliegue: `transformers` (PyTorch), Candle mediante `marian_flutter`, CTranslate2, ONNX Runtime vía Optimum, y cualquier servidor HTTP que exponga el pipeline de traducción. vLLM y TGI no soportan de forma nativa la arquitectura Marian, por lo que no son opciones directas.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-fr-ee | 75.554.618 | fr → ee | no disponible | no disponible (remite a la del modelo base) | HuggingFace, safetensors + tokenizadores fast |
| Helsinki-NLP/opus-mt-fr-ee (modelo base) | ~75 M (mismo modelo) | fr → ee | no disponible | habitualmente CC-BY 4.0 | HuggingFace, pesos originales + SentencePiece |
| facebook/nllb-200-distilled-600M | ~600 M | 200 idiomas, incluye ee_Latn | no disponible en la información proporcionada | CC-BY-NC 4.0 (uso no comercial) | HuggingFace, transformers |
| Modelos de traducción comerciales (Google Translate, DeepL) | no disponible | múltiples, cobertura variable de ee | no disponible | propietaria | API en la nube |

El modelo de Malinali es, en la práctica, idéntico en pesos al modelo base de Helsinki-NLP: la diferencia está en el formato de distribución y en la orientación a inferencia on-device. Frente a NLLB-200, ofrece un tamaño mucho menor (unas ocho veces menos parámetros) y una licencia potencialmente más permisiva si se confirma la CC-BY 4.0 del upstream, a costa de cubrir un único par de idiomas.

## Limitaciones y advertencias

- Es un modelo de un solo par de idiomas: no traduce en la dirección ee → fr ni entre otros idiomas.
- El ewe es un idioma de bajos recursos, por lo que la calidad de traducción puede ser inferior a la de pares con más corpus disponibles; no se han publicado métricas que lo cuantifiquen.
- Riesgo de alucinación y de omisiones en frases largas o con terminología especializada, habitual en modelos de traducción de este tamaño.
- La longitud de contexto no está documentada en la información disponible; superar el límite real del modelo puede provocar truncamientos silenciosos.
- La licencia no está declarada en HuggingFace. La model card indica que debe seguirse la del modelo original, pero no la especifica con certeza, lo que introduce riesgo legal para uso comercial hasta verificarla en el repositorio de OPUS-MT.
- El repositorio tiene 0 descargas y 0 "likes", y las fechas de creación y actualización son de octubre de 2026: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- No se han publicado evaluaciones de sesgo. Al estar entrenado sobre corpus OPUS, puede heredar sesgos de género y de representación presentes en los datos originales.
- Al ser una redistribución sin entrenamiento adicional, cualquier limitación del modelo base de Helsinki-NLP se traslada íntegramente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-fr-ee
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-ee
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados correspondían a páginas de ayuda de YouTube y no guardan relación con el modelo).
