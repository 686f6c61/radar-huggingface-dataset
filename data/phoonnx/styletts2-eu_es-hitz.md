# Phoonnx/styletts2-eu_es-hitz

## Resumen

styletts2-eu_es-hitz es un modelo de sintesis de voz (text-to-speech) en euskera (eu-ES) basado en la arquitectura StyleTTS2, desarrollado originalmente por el HiTZ Center y empaquetado en formato ONNX por Phoonnx para su uso con la libreria phoonnx. El modelo toma como entrada texto en euskera, lo normaliza y lo convierte a fonemas IPA mediante el fonemizador AhoTTS de la libreria scriptconv, y genera audio con dos voces disponibles: `hitz/eu-antton` y `hitz/eu-maider`.

El modelo resuelve la necesidad de sintesis de voz de calidad en una lengua de bajos recursos como el euskera, ofreciendo una alternativa ligera (0,3 GB de repositorio) y desplegable localmente sin dependencias de servicios en la nube. Su empaquetado en ONNX y su integracion con phoonnx y el ecosistema OVOS facilitan su uso tanto en Python como en asistentes de voz.

La relevancia actual radica en la escasez de modelos TTS open source para lenguas minoritarias y en la licencia Apache-2.0, que permite uso comercial sin restricciones adicionales. El modelo esta orientado a inferencia eficiente y no requiere GPU de altas prestaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | euskera (eu-ES) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas ahotts en alfabeto IPA |
| Voces incluidas | hitz/eu-antton, hitz/eu-maider |
| Tamano del repositorio | 0,3 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo se basa en StyleTTS2, una arquitectura de sintesis de voz que combina un generador acustico con un discriminador de estilo y que emplea difusion para el modelado de prosodia y estilo. StyleTTS2 se caracteriza por separar el contenido linguistico del estilo del habla, lo que permite generar voces con entonacion natural a partir de fonemas de entrada. El modelo original fue entrenado por el HiTZ Center para euskera y posteriormente exportado a ONNX por Phoonnx.

No se dispone en la informacion proporcionada de datos sobre el numero de horas de audio de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. La unica innovacion documentada es el empaquetado ONNX para inferencia portable y la integracion del front-end de texto mediante el fonemizador AhoTTS de scriptconv, que normaliza el texto y lo convierte a fonemas IPA antes de la sintesis.

## Capacidades

- Sintesis de voz a partir de texto en euskera (eu-ES), con salida en formato WAV.
- Dos voces preentrenadas: `hitz/eu-antton` y `hitz/eu-maider`.
- Normalizacion y fonemizacion automatica del texto mediante AhoTTS (scriptconv).
- Generacion de audio con modelado de estilo y prosodia propio de StyleTTS2.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso programatico en Python a traves de `TTSModelManager` de phoonnx.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo exclusivamente TTS).
- Capacidad multilingue limitada al euskera.

## Casos de uso

- Lectura de contenido en euskera: el modelo convierte articulos, noticias o documentacion a audio para accesibilidad o consumo en movilidad, gracias a su front-end de fonemizacion especifico para euskera.
- Asistentes de voz locales: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, permite dotar de voz en euskera a asistentes domesticos sin conexion a la nube.
- Senalizacion y avisos automatizados: generacion de mensajes de voz para transporte publico, aeropuertos o edificios publicos en euskera, con las dos voces disponibles para alternar locutores.
- Audiolibros y narracion: sintesis de textos largos en euskera para produccion de audiolibros, aprovechando el modelado de estilo de StyleTTS2 para una prosodia mas natural.
- Pruebas de accesibilidad web: generacion de audio bajo demanda para lectores de pantalla en sitios web institucionales del Pais Vasco.
- Investigacion en TTS para lenguas de bajos recursos: el modelo sirve como base para experimentos de fine-tuning, evaluacion de prosodia o comparacion de arquitecturas en euskera, al estar disponible en ONNX y con licencia permisiva.
- Prototipado de interfaces conversacionales: desarrollo de chatbots de voz en euskera en entornos de prueba, con despliegue local y sin coste por API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,3 GB, por lo que la huella en memoria es reducida y compatible con GPUs de gama baja o incluso CPU.
- GPU recomendadas: no se especifican; por el tamano del modelo, es viable en GPUs consumer como RTX 3060, RTX 4060 o superiores, asi como en CPU.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM disponible, aunque el dato exacto no esta publicado.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. Al estar en formato ONNX, puede ejecutarse con ONNX Runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Formato | Licencia | Contexto/Tamano |
|---|---|---|---|---|---|
| styletts2-eu_es-hitz | euskera (eu-ES) | StyleTTS2 | ONNX | Apache-2.0 | 0,3 GB repo |
| HiTZ/StyleTTS2-eu (upstream) | euskera | StyleTTS2 | no disponible | Apache-2.0 | no disponible |
| Otros modelos StyleTTS2 de la coleccion Phoonnx | varios | StyleTTS2 | ONNX | variable | variable |

No se dispone de datos de rendimiento comparativo (MOS, RTF) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta euskera; no es multilingue y no debe usarse con texto en otros idiomas sin esperar resultados incorrectos.
- La entrada debe pasar por el fonemizador AhoTTS de scriptconv; un texto mal normalizado o con caracteres no soportados puede producir fonemas incorrectos y audio defectuoso.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar prosodia o pronunciacion incorrecta en palabras poco frecuentes, nombres propios o neologismos.
- No se han publicado evaluaciones de sesgo, calidad (MOS) ni robustez en la informacion disponible.
- Solo hay dos voces disponibles (`hitz/eu-antton` y `hitz/eu-maider`), lo que limita la variedad de locutores.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento originales del HiTZ Center para cumplir con posibles restricciones de los corpus utilizados.
- El modelo esta empaquetado para phoonnx; su uso fuera de esa libreria requiere adaptar la inferencia ONNX manualmente.
- No dispone de control explicito de emocion o estilo en la interfaz documentada, aunque la arquitectura StyleTTS2 lo permita tecnicamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-eu_es-hitz
- Modelo upstream (HiTZ Center): https://huggingface.co/HiTZ/StyleTTS2-eu
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
