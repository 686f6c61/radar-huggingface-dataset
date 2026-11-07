# alivecat/supertonic-3-mnn-w8

## Resumen

Supertonic 3 MNN W8 es una conversión al formato MNN con cuantización de pesos a 8 bits del modelo de síntesis de voz Supertonic 3, desarrollado originalmente por Supertone. El modelo base es un TTS de código abierto con 99 millones de parámetros que funciona íntegramente en CPU, sin necesidad de GPU ni de servicios en la nube, y que cubre 31 idiomas. Esta versión concreta, publicada por el usuario alivecat, empaqueta los cuatro componentes del modelo (predictor de duración, codificador de texto, estimador de vectores y vocoder) en archivos MNN que suman 120,79 MB en total.

La relevancia de esta ficha radica en que permite desplegar un sistema TTS multilingüe en dispositivos de recursos limitados, como móviles, sistemas embebidos o portátiles sin acelerador gráfico, manteniendo una salida de audio a 44.100 Hz en mono. El paquete incluye diez voces oficiales (M1-M5 y F1-F5) y seis estilos de voz de la comunidad, lo que facilita la personalización sin reentrenamiento.

Al tratarse de una conversión cuantizada del modelo original, su evaluación debe hacerse contra el modelo base de Supertone: la cuantización a 8 bits reduce el tamaño y el coste computacional, pero puede introducir degradaciones en la calidad acústica que conviene validar en el caso de uso concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS por etapas: duration_predictor, text_encoder, vector_estimator y vocoder (formato MNN) |
| Parametros totales | 99 M (modelo base Supertonic 3) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos a 8 bits (W8); el runtime selecciona la ruta con `precision=fp32` |
| Idiomas soportados | 31 idiomas (modelo base); lista concreta no disponible |
| Licencia | BigScience Open RAIL-M (openrail) |
| Formato de pesos | MNN (4 archivos .mnn); configuracion en tts.json, unicode_indexer.json y voice_styles/*.json |
| Frecuencia de muestreo de salida | 44.100 Hz, mono |
| Tamano del paquete | 120,79 MB (4 archivos de modelo) |
| Voces incluidas | 10 oficiales (M1-M5, F1-F5) + 6 de comunidad (F6-zh, F7-gb, F8-gb, homme_clair, homme_moyen, voix_sombre) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura TTS modular en cuatro etapas: un predictor de duración que estima la longitud de cada unidad de texto, un codificador de texto que transforma la entrada lingüística en representaciones latentes, un estimador de vectores que genera las características acústicas y un vocoder que sintetiza la forma de onda final a 44.100 Hz. Esta descomposición permite sustituir o ajustar componentes por separado y es habitual en sistemas TTS neuronales modernos orientados a inferencia en dispositivo.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones técnicas específicas del modelo base en la documentación proporcionada. La model card de esta conversión solo documenta el proceso de cuantización y el empaquetado MNN, no el entrenamiento original. La versión W8 aplica cuantización de pesos a 8 bits sobre los cuatro componentes, lo que reduce el tamaño a 120,79 MB y abarata la inferencia en CPU, a costa de una posible pérdida de fidelidad acústica que no está cuantificada en la información disponible.

## Capacidades

- Síntesis de voz multilingüe: el modelo base cubre 31 idiomas, lo que permite generar audio en múltiples lenguas con un único paquete.
- Inferencia en CPU sin GPU: diseñado para ejecución local en dispositivo, sin dependencia de servicios en la nube ni API externas.
- Control de velocidad del habla mediante el parámetro `speed` del runtime.
- Selección de voz mediante `speaker_id`, con 10 voces oficiales y 6 estilos de comunidad.
- Salida de audio a 44.100 Hz en mono, adecuada para reproducción en altavoces y auriculares convencionales.
- Estabilidad de lectura mejorada respecto a Supertonic 2, con menos fallos de repetición y omisión en enunciados cortos y largos, según la documentación del modelo base.
- Mayor similitud de hablante en el conjunto de idiomas compartidos con Supertonic 2, según la misma fuente.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada en la información disponible.

## Casos de uso

- Lectura por voz en aplicaciones móviles sin conexión: el paquete de 120,79 MB y la ejecución en CPU permiten integrar TTS en apps Android o iOS que deben funcionar sin red, usando el runtime MNN y seleccionando la voz con `speaker_id`.
- Asistentes de accesibilidad para personas con discapacidad visual: la síntesis local a 44.100 Hz y el control de velocidad permiten leer pantallas y documentos en tiempo real sin enviar texto a servidores externos.
- Sistemas de navegación y avisos en vehículo: la inferencia en CPU encaja en unidades de infoentretenimiento con recursos limitados, donde no hay GPU dedicada y la latencia debe ser baja y predecible.
- Audiolibros y contenido educativo multilingüe: los 31 idiomas del modelo base y las voces de comunidad (incluidas F6-zh, F7-gb y F8-gb) permiten generar narraciones en varios idiomas con un solo pipeline.
- Prototipado rápido de interfaces conversacionales: al no requerir GPU ni infraestructura cloud, un equipo puede validar flujos de voz en portátiles convencionales antes de invertir en un despliegue mayor.
- Generación de avisos y mensajes dinámicos en sistemas embebidos: el formato MNN y el tamaño reducido facilitan el despliegue en dispositivos con memoria limitada para anuncios de transporte, comercio o domótica.
- Localización de contenido audiovisual: la combinación de varias voces y el control de velocidad permite doblar o locutar materiales en distintos idiomas sin depender de proveedores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU. El paquete ocupa 120,79 MB en disco y requiere memoria RAM adicional para el runtime y los buffers de audio.
- GPU recomendadas: no se requieren. La documentación del modelo base indica ejecución local en CPU sin GPU.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte CUDA ni Metal para esta conversión MNN.
- Opciones de despliegue: runtime compatible con Supertonic MNN-TTS, cargando la raíz del modelo y preservando la estructura de directorios (`mnn_models/`, `tts.json`, `unicode_indexer.json`, `voice_styles/`, `config.json`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Ejecucion en CPU |
|---|---|---|---|---|---|---|
| Supertonic 3 MNN W8 (esta ficha) | 99 M (base) | 31 (base) | No disponible | Open RAIL-M | MNN cuantizado W8 | Si |
| Supertonic 3 (original) | 99 M | 31 | No disponible | Open RAIL-M | Pesos originales (no especificado) | Si |
| Supertonic 2 | No disponible | 5 | No disponible | No disponible | No disponible | Si |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos TTS comerciales o de otros repositorios) no está disponible en la información proporcionada, por lo que no se incluyen datos que no puedan contrastarse.

## Limitaciones y advertencias

- La cuantización a 8 bits puede degradar la calidad acústica respecto al modelo base; no se han publicado métricas objetivas (MOS, similitud de hablante) para esta conversión concreta.
- No se dispone de la lista completa de los 31 idiomas soportados ni de su cobertura real; la model card no detalla el rendimiento por idioma.
- Riesgo de alucinación acústica y errores de pronunciación en textos con nombres propios, siglas, números o vocabulario fuera del dominio de entrenamiento; no hay datos sobre este comportamiento en la información disponible.
- Las voces de comunidad (F6-zh, F7-gb, F8-gb, homme_clair, homme_moyen, voix_sombre) provienen de terceros y su calidad, licencia y condiciones de uso pueden diferir de las voces oficiales; conviene revisar sus fuentes originales.
- La licencia BigScience Open RAIL-M impone restricciones de uso y condiciones de redistribución; es obligatorio revisar el archivo LICENSE y las atribuciones en NOTICE.md antes de un uso comercial.
- El modelo requiere un runtime específico compatible con Supertonic MNN-TTS; no es un paquete autocontenido y la integración depende de la disponibilidad de dicho runtime.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada de su funcionamiento.
- No se documentan mecanismos de seguridad, filtrado de contenido ni moderación en la generación de voz.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alivecat/supertonic-3-mnn-w8
- Modelo base en Hugging Face: https://huggingface.co/Supertone/supertonic-3
- Version upstream referenciada: https://huggingface.co/Supertone/supertonic-3/tree/3cadd1ee6394adea1bd021217a0e650ede09a323
- Sitio oficial de Supertonic 3: https://supertonic3.github.io/
- Estilos de voz de sam749: https://huggingface.co/spaces/sam749/supertonic3-custom-styles/tree/cdbbdf1180388f50ebd6838df50f5d7e4ab95f18/my_voice_styles
- Estilos de voz de ambassadia: https://huggingface.co/ambassadia/supertonic-3-mlx/tree/5112afb02b455ebb00bc6bc3cb181d29d82a8cc3/voice_styles
- Licencia Open RAIL-M: https://huggingface.co/alivecat/supertonic-3-mnn-w8/blob/main/LICENSE
- Aviso de atribucion: https://huggingface.co/alivecat/supertonic-3-mnn-w8/blob/main/NOTICE.md
