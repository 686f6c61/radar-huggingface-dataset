# Hansda/gujarati-voice-compact

## Resumen

Gujarati Voice · compact browser TTS es un modelo de síntesis de voz (text-to-speech) de una sola voz para gujarati, adaptado de la arquitectura Tiny Voca y publicado por el autor Hansda. El modelo genera audio a 24 kHz y está diseñado específicamente para inferencia en navegador, con un peso cuantizado de apenas 826.255 bytes (unos 0,83 MB) en formato INT6. Se distribuye bajo licencia Apache 2.0 y el repositorio tiene un tamaño de 0,0 GB, lo que refleja su orientación a despliegues ligeros en cliente.

La relevancia del modelo reside en su enfoque de compresión extrema: combina un grafo comprimido, pesos empaquetados y un desempaquetador en un único artefacto que se ejecuta junto a un runtime y un frontend de idioma compartidos que se descargan por separado. El modelo se entrenó sobre un corpus sintético de 20 horas en gujarati generado por Maya 2 Native con la voz Jahnavi, y utiliza un fonemizador recurrente entrenado con etiquetas de pronunciación de eSpeak NG.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni la arquitectura interna detallada más allá de la referencia a Tiny Voca y a la "arquitectura compacta bengalí aceptada con su residuo de forma de onda aprendido". El modelo no registra descargas ni likes en el momento de la consulta y fue creado el 19 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptación de Tiny Voca (arquitectura compacta bengalí con residuo de forma de onda aprendido); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT6 (con tensores sensibles seleccionados a 8 bits); fuente FP32 incluida |
| Idiomas soportados | gujarati (gu) |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto de navegador comprimido (grafo comprimido + pesos empaquetados + desempaquetador); fuente FP32 incluida; no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Tiny Voca, una arquitectura de TTS compacta, y adopta la "arquitectura compacta bengalí aceptada con su residuo de forma de onda aprendido". Genera audio a 24 kHz con una sola voz. La cuantización INT6 utiliza valores calibrados de 6 bits, manteniendo ciertos tensores sensibles a 8 bits para preservar calidad. El artefacto de navegador incluye el grafo comprimido, los pesos empaquetados y el desempaquetador; el runtime compartido y el frontend de idioma se descargan por separado. Se incluye la fuente FP32 de la variante con mejor puntuación para permitir entrenamiento adicional.

El entrenamiento se realizó sobre el corpus sintético Hansda/gujarati-maya2-jahnavi-20h, de 20 horas, generado por Maya 2 Native con la voz Jahnavi incorporada. El tokenizador se entrenó con las transcripciones de entrenamiento del dataset, y el fonemizador recurrente se entrenó usando etiquetas de pronunciación de eSpeak NG. La inferencia en navegador emplea el fonemizador aprendido y el léxico incluidos. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) de una sola voz en gujarati a 24 kHz.
- Inferencia en navegador mediante un artefacto compacto con runtime y frontend de idioma compartidos.
- Fonemización aprendida con léxico incluido para la conversión de texto a fonemas.
- Cuantización INT6 con tensores sensibles a 8 bits para reducir el tamaño del modelo.
- Fuente FP32 incluida para reentrenamiento o ajuste fino.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Lectura por voz en aplicaciones web: el modelo puede integrarse en el navegador para leer contenido en gujarati sin enviar texto a un servidor, gracias a su artefacto de menos de 1 MB y al runtime compartido.
- Accesibilidad para usuarios con discapacidad visual: permite convertir texto de páginas web o aplicaciones en audio en gujarati directamente en el cliente, reduciendo la dependencia de servicios externos.
- Aprendizaje de idiomas: puede utilizarse para generar pronunciaciones de texto gujarati en herramientas educativas, apoyándose en el fonemizador entrenado con etiquetas de eSpeak NG.
- Asistentes de voz embebidos: adecuado para interfaces de voz ligeras en dispositivos con recursos limitados, dado el reducido tamaño del modelo cuantizado.
- Prototipado rápido de TTS en gujarati: la fuente FP32 incluida permite a investigadores ajustar o reentrenar el modelo sobre nuevos datos sin partir de cero.
- Aplicaciones de lectura de noticias o documentos: el modelo puede narrar artículos o documentos en gujarati en el navegador, con una latencia potencialmente baja al ejecutarse localmente.
- Pruebas de concepto de TTS multilingüe: sirve como referencia de arquitectura compacta para adaptar voces a otros idiomas siguiendo el mismo enfoque de cuantización y empaquetado.

## Benchmarks y rendimiento

| Cuantización | Bytes del modelo en navegador | MOS previsto en validación | MOS previsto en test | CER en test |
|---|---:|---:|---:|---:|
| INT6 | 826.255 | 2,287 | 2,323 | 5,23 % |

Notas de la model card: UTMOSv2 se evaluó con 24 clips reservados y semillas 17, 29 y 43 por split. El CER independiente por ASR se basa en 72 clips reservados cuando están disponibles; cada variante incluye un archivo `test/cer.json` que identifica el reconocedor. Las puntuaciones incluyen el error del reconocedor y usan el split de test específico del idioma.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto de navegador INT6 ocupa 826.255 bytes, por lo que la inferencia se plantea en cliente y no en GPU dedicada.
- GPU recomendadas: no aplica para el modo navegador; para la fuente FP32 no se especifican requisitos.
- ¿Cabe en GPU de consumo? El artefacto INT6 está diseñado para ejecutarse en navegador, lo que implica que cabe en dispositivos de consumo, pero no se detallan requisitos de memoria.
- Opciones de despliegue: inferencia en navegador con el runtime y frontend de idioma compartidos; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han publicado datos de comparación con otras alternativas de TTS compacto para gujarati.

## Limitaciones y advertencias

- El modelo está entrenado únicamente con datos sintéticos generados por Maya 2 Native, lo que puede limitar la naturalidad y diversidad de voces respecto a datos humanos.
- Solo soporta gujarati (gu); no se documentan otros idiomas.
- La calidad medida es moderada: MOS previsto de 2,323 en test y CER del 5,23 %, con la advertencia de que las puntuaciones incluyen el error del reconocedor ASR.
- El modelo tiene una sola voz (Jahnavi), sin control de estilo, emoción ni velocidad documentado.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al ser un modelo de TTS sintético puede presentar artefactos de pronunciación en textos fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe consultar la atribución y licencia del dataset de origen para el texto fuente.
- El repositorio no registra descargas ni likes, y el tamaño es de 0,0 GB, lo que puede indicar que los artefactos no están disponibles o que el modelo es muy reciente.
- No se dispone de información sobre el número de parámetros ni la longitud de contexto, lo que dificulta evaluar su escalabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Hansda/gujarati-voice-compact
- Dataset de entrenamiento: https://huggingface.co/datasets/Hansda/gujarati-maya2-jahnavi-20h
- Commit del dataset: https://huggingface.co/datasets/Hansda/gujarati-maya2-jahnavi-20h/commit/433f3159a88016e287f67ce1ffb2efa8f084af16
- Maya 2 Native: https://huggingface.co/maya-research/maya2-native
- Tiny Voca (arquitectura base): https://github.com/n4ze3m/tiny-voca
