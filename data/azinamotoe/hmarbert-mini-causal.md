# azinamotoe/HmarBERT-mini-causal

## Resumen

HmarBERT-mini-causal es un modelo de lenguaje causal de 16,91 millones de parámetros desarrollado por azinamotoe y mantenido por la Hmar Heritage Foundation. Se obtiene adaptando el modelo enmascarado azinamotoe/HmarBERT-mini a un decodificador autorregresivo (is_decoder=True, máscara de atención triangular inferior), de modo que predice la siguiente palabra en lugar de reconstruir tokens enmascarados. Su propósito declarado es servir como motor de predicción de siguiente palabra para teclados predictivos móviles (Android/iOS) y para autocompletado local en Termux o interfaces de línea de comandos.

Técnicamente es un transformer tipo BERT de solo 4 capas, con tamaño oculto de 384, 6 cabezas de atención e intermedio de 1536, y un vocabulario WordPiece de 24.576 tokens que cubre la diacrítica y la morfología del hmar (hmr, ISO 639-3, familia zo). Está optimizado para ventanas de hasta 64 tokens, que es el escenario típico de escritura en un teclado, y el autor declara latencias inferiores a 5 ms por token en CPU de móvil o portátil.

Su relevancia es doble. Por un lado, es un ejemplo de reciclaje de un modelo enmascarado hacia uso generativo con un coste computacional mínimo (32,2 MB en FP16). Por otro, es una de las pocas iniciativas públicas orientadas a lenguas zo con recursos digitales escasos. El repositorio no tiene descargas ni valoraciones y no se han publicado benchmarks, por lo que debe considerarse un artefacto experimental sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT de 4 capas configurado como decodificador causal (is_decoder=True, máscara de atención triangular inferior) |
| Parámetros totales | 16.906.368 (16,91 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 64 tokens (ventana optimizada para escritura en teclado) |
| Tipos de cuantización | no se publican pesos cuantizados; a partir del tamaño de pesos serían viables FP16 (~32,2 MB), INT8 (~17 MB) e INT4 (~8,5 MB), pero no están disponibles en el repositorio |
| Idiomas soportados | hmar (hmr, ISO 639-3); etiquetado también como zo-languages (familia zo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño oculto | 384 |
| Cabezas de atención | 6 |
| Tamaño intermedio | 1536 |
| Vocabulario | 24.576 tokens WordPiece (con diacrítica y morfología hmar) |
| Modelo base | azinamotoe/HmarBERT-mini (entrenamiento bidireccional) |
| Dataset de alineamiento | hmar-heritage-org/sentences |
| Pipeline | text-generation |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 21 de septiembre de 2026 (según HuggingFace) |

## Arquitectura y entrenamiento

El modelo parte de HmarBERT-mini, un BERT miniatura que completó 48 épocas de preentrenamiento bidireccional (24 épocas sobre frases y 24 sobre párrafos). HmarBERT-mini-causal reutiliza esos pesos y los adapta a un decodificador: se activa is_decoder=True y una máscara de atención triangular inferior, de forma que el token i solo puede atender a los tokens con índice menor o igual que i. La cabeza de modelado es una BertLMHeadModel, y la alineación de las proyecciones de atención se realiza sobre frases limpias y segmentadas del corpus hmar-heritage-org/sentences, con el objetivo de predecir la palabra siguiente únicamente a partir del historial conversacional previo.

La arquitectura resultante mantiene el tamaño oculto de 384, 6 cabezas y 1536 de dimensión intermedia, con 4 capas apiladas del bloque encoder de BERT reutilizado como decoder. No se documenta el número de tokens de entrenamiento, la composición completa del corpus, ni procesos de ajuste por preferencias (RLHF, DPO o similares). Tampoco se detalla el número de pasos, la tasa de aprendizaje ni el presupuesto de cómputo de la fase de adaptación causal, por lo que la diferencia real entre los pesos bidireccionales originales y los causales no es auditable con la información publicada.

## Capacidades

- Generación de texto autorregresiva restringida: predice la siguiente palabra o token a partir del contexto previo, con devolución de probabilidades (por ejemplo, top-3 con porcentajes).
- Predicción de siguiente palabra de baja latencia: el autor declara menos de 5 ms por token en CPU de móvil o portátil básico, lo que lo hace apto para inferencia en el propio dispositivo.
- Motor de teclado predictivo: pensado explícitamente para sugerencias en teclados Android/iOS, con ventanas de hasta 64 tokens.
- Autocompletado en terminal: uso previsto en Termux y entornos CLI para sugerencias instantáneas con huella de memoria mínima.
- Cobertura léxica del hmar: vocabulario WordPiece de 24.576 tokens con diacrítica y morfología de la lengua.
- Ejecución local sin servicios externos: los pesos FP16 ocupan unos 32,2 MB, lo que permite despliegue totalmente offline.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento de agente ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta multilingüismo: el modelo está etiquetado exclusivamente para hmr.

## Casos de uso

- Teclado predictivo en Android e iOS: el modelo puede integrarse como motor de sugerencia de siguiente palabra en el IME, ya que su ventana de 64 tokens coincide con el contexto típico de escritura y su latencia declarada es inferior a 5 ms por token en CPU móvil.
- Autocompletado en Termux y herramientas de línea de comandos: permite ofrecer sugerencias de comandos o texto en hmar sin conexión, con un consumo de memoria que ronda las decenas de megabytes en FP16.
- Mensajería instantánea offline: aplicaciones de chat para comunidades hmar pueden sugerir la continuación de frases en local, evitando enviar texto del usuario a servidores externos.
- Herramientas de alfabetización y aprendizaje del hmar: ejercicios de completado de frases y práctica de escritura con retroalimentación inmediata, aprovechando la cobertura de diacrítica del vocabulario.
- Normalización y ayuda a la anotación de corpus: al predecir la siguiente palabra sobre frases segmentadas, puede asistir en la revisión de transcripciones y en la detección de segmentaciones anómalas en corpus de hmar.
- Documentación y preservación lingüística: generación asistida de borradores y ampliación de textos en una lengua con pocos recursos digitales, siempre con revisión humana dado el riesgo de alucinación.
- Prototipado de investigación en lenguas de bajos recursos: sirve como referencia barata para estudiar la conversión de modelos enmascarados a causales con presupuestos de cómputo mínimos.
- Sistemas embebidos y dispositivos de gama baja: por tamaño de pesos (32,2 MB en FP16), puede ejecutarse en Raspberry Pi o en dispositivos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye dos ejemplos cualitativos de predicción de siguiente palabra para las entradas "Ka lawm" e "Invaithai", sin métricas asociadas. Tampoco se aportan cifras de perplejidad, precisión top-k, throughput ni comparaciones con otros modelos.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 67,6 MB (cálculo a partir de 16.906.368 parámetros).
- Pesos en FP16: aproximadamente 32,2 MB, valor declarado por el autor.
- Cuantización INT8 estimada: en torno a 17 MB; INT4 estimada: en torno a 8,5 MB. No se distribuyen pesos cuantizados.
- VRAM estimada para inferencia en GPU: menos de 1 GB incluyendo el runtime de PyTorch, por lo que cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) y también en CPU exclusivamente.
- Inferencia en CPU: viable y es el escenario objetivo; el autor declara menos de 5 ms por token en CPU de móvil o portátil básico.
- Memoria en RAM: del orden de decenas a centenas de megabytes según el framework y el lote.
- GPU recomendadas: no se requieren GPU; cualquier GPU con al menos 1 GB de VRAM es sobradamente suficiente.
- Opciones de despliegue: Transformers con BertTokenizerFast y BertLMHeadModel sobre PyTorch, tal como se documenta en la model card. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y la arquitectura de decoder derivada de BERT no es un formato estándar en esos motores.
- Latencia y throughput: solo se declara la latencia por token (<5 ms en CPU); no se publican cifras de throughput agregado ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HmarBERT-mini-causal | 16,91 M | hasta 64 tokens | Causal (decoder) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| HmarBERT-mini (modelo base) | 16,91 M (según la model card del modelo causal) | no disponible | Bidireccional (encoder) | Apache 2.0 | HuggingFace |
| Otros modelos generativos para hmar | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas documentadas en la información proporcionada |

No se dispone de comparativas de rendimiento con modelos de tamaño similar, ya que no se han publicado benchmarks. La única comparación verificable es estructural: el modelo base usa atención bidireccional y el modelo causal emplea máscara triangular inferior, reutilizando los mismos pesos preentrenados.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 64 tokens, insuficiente para diálogos largos, documentos o resúmenes. La coherencia se degrada rápidamente fuera de ese rango.
- Modelo muy pequeño (16,91 M de parámetros): la capacidad de razonamiento, la cohesión a nivel de párrafo y el seguimiento de instrucciones son limitados por diseño.
- Riesgo elevado de alucinación y de agramaticalidad fuera del dominio de entrenamiento, especialmente en textos largos o con vocabulario ausente del vocabulario WordPiece.
- Alineamiento causal derivado, no nativo: los pesos proceden de un preentrenamiento bidireccional y se han reorientado a un decodificador. No se documenta el protocolo, el volumen de datos ni las métricas de esa adaptación, por lo que la calibración de las probabilidades no está verificada.
- Monolingüe: solo se declara soporte de hmar (hmr). Se desconoce el comportamiento con code-switching, préstamos del inglés u otras lenguas zo.
- Sin benchmarks publicados: no hay métricas objetivas de perplejidad, precisión top-k ni calidad de generación, ni validación por terceros.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar esta ficha, lo que implica ausencia de retroalimentación comunitaria y de casos de uso verificados.
- Sin mecanismos de seguridad documentados: no se mencionan filtros de contenido, moderación ni ajuste por preferencias (RLHF/DPO), de modo que la salida puede contener texto inapropiado o sesgado.
- Sesgos: no se documenta la composición del corpus hmar-heritage-org/sentences ni su distribución temática, dialectal o de género, por lo que no es posible evaluar sesgos de representación dentro de la propia lengua.
- Licencia: el modelo se distribuye bajo Apache 2.0, que permite uso comercial, pero la licencia del corpus de alineamiento y de los datos de preentrenamiento del modelo base debe verificarse por separado antes de un despliegue en producción.
- No apto como generador de texto general: está diseñado y optimizado para la predicción de siguiente palabra a corta distancia, no para generación libre de documentos.
- Advertencia de despliegue: al no existir integración documentada con motores de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), la puesta en producción requiere una integración propia sobre Transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azinamotoe/HmarBERT-mini-causal
- Modelo base: https://huggingface.co/azinamotoe/HmarBERT-mini
- Dataset de alineamiento: https://huggingface.co/datasets/hmar-heritage-org/sentences
- Organización mantenedora: https://huggingface.co/hmar-heritage-org
