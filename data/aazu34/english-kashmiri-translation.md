# Aazu34/english-kashmiri-translation

## Resumen

English → Kashmiri Translation es un modelo de traducción automática neuronal especializado en el par inglés-kashmiri, desarrollado por Aazim Ameen (usuario Aazu34 en Hugging Face). Se distribuye como exportación ONNX de una arquitectura encoder-decoder, con el objetivo de ofrecer traducción totalmente offline que se ejecuta en CPU sin necesidad de servidor ni clave de API. El modelo traduce del inglés al kashmiri en escritura perso-árabe.

El modelo sigue la convención de IndicTrans2 para el preprocesado: el texto de origen se prefija con etiquetas de idioma (`eng_Latn kas_Arab`) antes de la tokenización. El repositorio ocupa 0,3 GB y separa los pesos del encoder (unos 74 MB) y del decoder (unos 205 MB), junto con tokenizadores independientes para cada lado (vocabulario inglés de 122.672 entradas).

Su relevancia radica en cubrir un par lingüístico de bajos recursos (kashmiri) con un artefacto ligero, portable y ejecutable en hardware modesto, lo que facilita el despliegue en entornos con conectividad limitada o requisitos de privacidad. No se dispone de información publicada sobre el proceso de entrenamiento, los datos utilizados ni métricas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (transformer), exportado a ONNX |
| Parametros totales | no disponible (pesos: ~74 MB encoder + ~205 MB decoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportacion ONNX en precision original) |
| Idiomas soportados | Ingles (en) y kashmiri (ks), direccion en → ks |
| Licencia | other |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`) con tokenizadores JSON |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura encoder-decoder de tipo transformer, exportada a formato ONNX con los pesos separados en ficheros externos (`encoder_model.onnx.data` y `decoder_shared.onnx.data`). La tokenización sigue la convención de IndicTrans2, con prefijado de etiquetas de idioma en el lado de origen y tokenizadores independientes para inglés y kashmiri. La decodificación es greedy y el decoder arranca desde el token `</s>` (id 2).

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, la procedencia de los datos paralelos ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se detalla si el modelo parte de un checkpoint preentrenado (por ejemplo, de la familia IndicTrans2) o si fue entrenado desde cero, aunque la convención de tokenización sugiere una relación con el ecosistema IndicTrans2. La innovación práctica destacable es el empaquetado ONNX autocontenido con un runner mínimo en Python (`inference.py`) que solo requiere numpy, onnxruntime y tokenizers.

## Capacidades

- Traducción de texto del inglés al kashmiri en escritura perso-árabe.
- Ejecución totalmente offline en CPU, sin dependencia de servicios externos ni claves de API.
- Preprocesado integrado mediante prefijado de etiquetas de idioma (`eng_Latn kas_Arab`).
- Decodificación greedy determinista.
- Runner de inferencia autónomo incluido en el repositorio.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al par inglés-kashmiri.

## Casos de uso

- Traducción de documentación y materiales formativos al kashmiri: útil para organizaciones que necesitan localizar contenidos en una lengua de bajos recursos sin depender de traductores comerciales en línea.
- Despliegue en entornos aislados o sin conectividad: al ejecutarse en CPU y sin API, encaja en instalaciones con requisitos de privacidad o redes desconectadas.
- Aplicaciones de escritorio o móviles integradas: el tamaño reducido del repositorio (0,3 GB) permite empaquetar el modelo dentro de una aplicación local.
- Preprocesado de corpus para investigación lingüística: generación de traducciones preliminares de textos ingleses para su revisión por hablantes nativos de kashmiri.
- Atención ciudadana o servicios públicos en regiones kashmiríes: traducción de avisos y formularios del inglés al kashmiri en portales con infraestructura limitada.
- Componente en pipelines de subtitulado o transcripción: combinado con el modelo complementario de reconocimiento de voz kashmiri del mismo autor, permite construir un flujo de traducción de audio inglés a texto kashmiri.
- Prototipado rápido de sistemas de traducción: el runner `inference.py` facilita la integración y validación en entornos de desarrollo sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU.
- Memoria RAM estimada: no disponible con precisión, pero el conjunto de pesos (~279 MB) permite inferencia en equipos con pocos gigabytes de RAM.
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente según el autor.
- Cabe en GPU de consumo: sí, aunque no es su objetivo; podría ejecutarse en cualquier GPU compatible con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime con numpy y tokenizers; el repositorio incluye `inference.py` como runner mínimo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| English → Kashmiri Translation (Aazu34) | no disponible (~279 MB de pesos) | no disponible | en → ks | other | ONNX |
| IndicTrans2 (AI4Bharat) | no disponible en la informacion proporcionada | no disponible | multilingue indio, incluye ks | no disponible | no disponible |
| NLLB-200 (Meta) | hasta 54.500 M (variante 54B); variantes menores disponibles | no disponible | 200 idiomas, incluye ks | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con la información disponible; el modelo de Aazu34 se distingue por su empaquetado ONNX ligero y su ejecución en CPU, mientras que IndicTrans2 y NLLB-200 son familias de mayor alcance y requisitos.

## Limitaciones y advertencias

- No se han publicado métricas de calidad (BLEU, chrF, COMET) ni evaluaciones humanas, por lo que se desconoce su precisión real.
- El modelo solo traduce en la dirección inglés → kashmiri; no se documenta la dirección inversa.
- La licencia es "other" sin texto visible en la información proporcionada; es imprescindible revisar los términos del repositorio antes de un uso comercial.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos neuronales, especialmente en un par de bajos recursos como el kashmiri.
- La decodificación greedy puede producir salidas menos fluidas que técnicas de búsqueda más avanzadas.
- No se especifica la longitud máxima de contexto soportada, lo que limita la planificación para documentos largos.
- El modelo no incluye capacidades de tool calling, agentes ni multimodalidad.
- El proyecto tiene cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aazu34/english-kashmiri-translation
- Modelo complementario de reconocimiento de voz kashmiri: https://huggingface.co/Aazu34/kashmiri-asr-ctc
