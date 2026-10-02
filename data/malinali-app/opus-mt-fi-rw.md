# malinali-app/opus-mt-fi-rw

## Resumen

El modelo `malinali-app/opus-mt-fi-rw` es un sistema de traducción automática neuronal para el par de idiomas finés (fi) → kinyarwanda (rw), empaquetado por el proyecto Malinali para inferencia en dispositivo (on-device). No se trata de un modelo entrenado desde cero: es una redistribución de los pesos del modelo upstream `Helsinki-NLP/opus-mt-fi-rw`, desarrollado por el grupo Helsinki-NLP dentro del proyecto OPUS-MT, con los tokenizadores convertidos de SentencePiece a formato JSON de tokenizador rápido de Hugging Face.

La arquitectura es Marian, un transformer encoder-decoder específico para traducción automática, con 76.448.777 parámetros (aproximadamente 76,4 millones). El repositorio ocupa 0,3 GB y se distribuye en formato safetensors, con dos tokenizadores rápidos separados (uno para el idioma origen y otro para el destino) pensados para el motor `marian_flutter` sobre Candle.

Su relevancia es acotada pero concreta: cubre un par de idiomas de bajos recursos (finés→kinyarwanda) que apenas está representado en modelos multilingües grandes, y lo hace con un tamaño lo bastante reducido como para ejecutarse en CPU, móvil o dispositivos embebidos sin conexión. El repositorio no tiene descargas ni likes registrados y no publica métricas propias; su valor práctico depende del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traducción automática) |
| Parametros totales | 76.448.777 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizar; admite conversión externa a otros formatos) |
| Idiomas soportados | finés (fi) como origen; kinyarwanda (rw) como destino |
| Licencia | no disponible en la información proporcionada; la model card remite a la licencia del modelo upstream (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) + tokenizadores rápidos en JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) |

## Arquitectura y entrenamiento

La arquitectura Marian es un transformer seq2seq con encoder y decoder, diseñado específicamente para traducción automática y optimizado para ser más ligero y rápido que los transformers de propósito general. El modelo forma parte de la familia OPUS-MT de Helsinki-NLP, entrenada sobre corpus paralelos del proyecto OPUS. El repositorio no aporta detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; esa información corresponde al modelo upstream y no se reproduce aquí.

La contribución concreta de Malinali no es el entrenamiento, sino el reempaquetado: parte de los pesos de `Helsinki-NLP/opus-mt-fi-rw`, los publica en safetensors y convierte los tokenizadores SentencePiece originales a formato de tokenizador rápido de Hugging Face. El objetivo declarado es la inferencia local mediante el motor Candle (`marian_flutter`), dentro de la aplicación Malinali, que funciona en dispositivo sin depender de servidores externos. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto de finés (fi) a kinyarwanda (rw), en una única dirección.
- Generación de texto condicionada a la tarea de traducción (pipeline `text2text-generation`).
- Ejecución en dispositivo mediante Candle, sin necesidad de backend remoto.
- Compatibilidad con la librería `transformers` y con el tag `endpoints_compatible` para despliegue en infraestructura de inferencia estándar.
- Tokenización rápida separada para origen y destino, lo que facilita el preprocesado y el postprocesado en el pipeline de traducción.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento.
- No tiene capacidades multimodales (sin visión ni audio).
- No es un modelo de instrucciones ni de chat: solo traduce.

## Casos de uso

- Traducción offline en aplicaciones móviles: el modelo, con 76,4 millones de parámetros, cabe en un teléfono y permite traducir finés→kinyarwanda sin conexión gracias al motor Candle, útil en contextos con conectividad limitada.
- Herramientas de comunicación para cooperación internacional y ONG: organizaciones que operan entre Finlandia y Ruanda pueden integrar el modelo para traducir documentos, formularios y mensajes internos en el propio dispositivo, evitando enviar datos sensibles a servicios en la nube.
- Atención a personas migrantes y refugiadas: traducción de instrucciones, avisos administrativos o información sanitaria desde el finés al kinyarwanda en puntos de atención presencial.
- Procesamiento por lotes de corpus: al ser compatible con `transformers` y con endpoints de inferencia, se puede usar para traducir grandes volúmenes de texto de forma automatizada en pipelines de datos.
- Educación y material didáctico: traducción de apuntes, glosarios o materiales formativos del finés al kinyarwanda para programas de formación bilingües.
- Investigación en traducción de bajos recursos: sirve como línea base ligera para el par fi→rw, un par poco cubierto, sobre el que comparar técnicas de ajuste fino o destilación.
- Integración en asistentes de escritura o teclados predictivos: al ser un modelo pequeño, se puede incrustar en editores de texto o teclados para ofrecer traducción instantánea mientras se escribe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye métricas BLEU, chrF ni evaluaciones sobre conjuntos de test para el par fi→rw. El proyecto OPUS-MT publica evaluaciones para sus modelos en el repositorio de Helsinki-NLP, pero no se dispone aquí de cifras concretas para este par de idiomas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 306 MB solo para los pesos; en FP16, unos 153 MB; en INT8, en torno a 76 MB. Hay que sumar el consumo de memoria de las activaciones y de los tokenizadores, pero el modelo es muy ligero.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA T4, RTX 3060 o superior ofrece un margen amplio. No es necesario hardware de centro de datos.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual y también en iGPU integradas, dado su tamaño reducido.
- Cabe en CPU: sí, es viable en CPU de escritorio e incluso en dispositivos embebidos como Raspberry Pi 4 o 5 y en móviles, que es precisamente el objetivo del empaquetado.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; Candle mediante `marian_flutter`; y, tras conversión, otros runtimes ligeros. Los tags del repositorio indican compatibilidad con endpoints de inferencia.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 76 millones de parámetros, en CPU la latencia por frase corta suele ser de decenas a pocos cientos de milisegundos, y en GPU es prácticamente instantánea, pero no se aportan cifras medidas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| malinali-app/opus-mt-fi-rw | 76,4 M | fi→rw | no disponible (remite a upstream) | safetensors + tokenizers JSON | Reempaquetado para on-device |
| Helsinki-NLP/opus-mt-fi-rw | ~76 M (mismo modelo base) | fi→rw | habitualmente CC-BY 4.0 | PyTorch / SentencePiece | Modelo upstream original |
| facebook/nllb-200-distilled-600M | 600 M | 200 idiomas, incluye fi y rw | CC-BY-NC 4.0 | safetensors / transformers | Multilingüe, mucho mayor; licencia no comercial |
| facebook/m2m100_418M | 418 M | 100 idiomas, incluye fi y rw | MIT | safetensors / transformers | Multilingüe, permite seleccionar idioma origen y destino |

Los datos de parámetros y licencias de los modelos comparativos corresponden a información pública ampliamente conocida; la longitud de contexto de cada uno no se detalla aquí por no estar incluida en la información proporcionada.

## Limitaciones y advertencias

- Traducción unidireccional: solo cubre finés→kinyarwanda, no la dirección inversa.
- Par de bajos recursos: al tratarse de una combinación poco representada en corpus paralelos, la calidad puede ser inferior a la de pares con más datos, con riesgo de omisiones, repeticiones o traducciones literales incorrectas.
- Riesgo de alucinación en traducción automática: el modelo puede generar contenido que no aparece en el texto origen o dejar segmentos sin traducir, especialmente con entradas largas, ruidosas o fuera de dominio.
- Sin datos de contexto publicados: se desconoce la longitud máxima de secuencia soportada en la configuración distribuida, lo que obliga a verificar el `config.json` antes de procesar documentos largos.
- Licencia no confirmada: el repositorio no declara licencia propia y remite a la del modelo upstream (habitualmente CC-BY 4.0). Antes de un uso comercial es imprescindible verificar los términos reales del modelo original y cumplir con la atribución requerida.
- Sesgos heredados: al provenir de un corpus OPUS con dominios concretos, el modelo puede reflejar sesgos de género, culturales o de registro presentes en los datos de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad para este empaquetado concreto, por lo que se recomienda evaluar sobre un conjunto propio antes de usarlo en producción.
- Repositorio sin adopción: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- No apto para tareas distintas de la traducción: no sigue instrucciones, no razona, no ejecuta herramientas ni mantiene conversaciones.
- Orientado a segmentos, no a documentos completos: el flujo de traducción debe dividir el texto en unidades manejables y gestionar el contexto entre segmentos por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-fi-rw
- Modelo base (Helsinki-NLP): https://huggingface.co/Helsinki-NLP/opus-mt-fi-rw
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app
