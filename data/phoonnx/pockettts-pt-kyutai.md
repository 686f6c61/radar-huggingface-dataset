# Phoonnx/pockettts-pt-kyutai

## Resumen

pockettts-pt-kyutai es un modelo de síntesis de voz (text-to-speech) en portugués derivado de Pocket TTS, la familia de modelos TTS de Kyutai, empaquetado en formato ONNX por el proyecto Phoonnx para su uso con la librería homónima. El repositorio no contiene pesos nuevos ni un entrenamiento propio: es una conversión y distribución del modelo original de Kyutai para portugués, con el objetivo de facilitar su despliegue en Python y en el ecosistema de asistentes de voz OVOS.

El modelo resuelve el problema de convertir texto en portugués a audio inteligible con múltiples voces predefinidas (26 voces listadas en la model card). Su relevancia práctica radica en el empaquetado ONNX y la integración con un plugin de OVOS, lo que permite desplegarlo en entornos donde no se dispone de PyTorch o donde se prioriza la portabilidad del runtime. El tamaño del repositorio es de 0,8 GB.

La información pública disponible es limitada: no se detallan parámetros, arquitectura interna ni datos de entrenamiento en la model card, por lo que buena parte de las especificaciones de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pocket TTS (arquitectura interna no detallada en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; cuantizaciones no especificadas) |
| Idiomas soportados | portugués (`pt`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (repositorio de 0,8 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Pocket TTS de Kyutai y se distribuye como conversión ONNX realizada por KevinAHM y empaquetada por Phoonnx. La model card no describe la arquitectura interna (número de capas, tipo de decoder, vocoder, etc.), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino. Tampoco se documenta ninguna innovación técnica específica más allá del propio diseño de Pocket TTS.

El front-end de texto es relevante desde el punto de vista técnico: phoonnx delega la normalización en la librería scriptconv, que en este modelo utiliza `UnicodeCodepointPhonemizer`, es decir, el texto se convierte directamente en puntos de código Unicode como entrada del modelo, sin un fonemizador específico del portugués. Este detalle condiciona el comportamiento del sistema ante números, abreviaturas o símbolos.

## Capacidades

- Síntesis de voz a partir de texto en portugués, con salida en formato WAV.
- Selección entre 26 voces predefinidas (alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell, vera).
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable desde `mycroft.conf`.
- Uso programático en Python a través de `TTSModelManager` y el método `synthesize_wav`.
- Ejecución sobre runtime ONNX, lo que permite despliegue sin dependencia de PyTorch.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción, tool calling ni razonamiento; es un modelo exclusivamente TTS.

## Casos de uso

- Asistentes de voz en OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz en `mycroft.conf` y obtener síntesis en portugués sin cambios en el resto del stack del asistente.
- Síntesis embebida en aplicaciones Python: mediante `TTSModelManager` y `synthesize_wav` se puede generar audio en un fichero WAV dentro de un pipeline de aplicación, con la ventaja de usar un runtime ONNX ligero.
- Lectura de contenido en portugués: conversión de artículos, notificaciones o mensajes de sistema a audio para aplicaciones de accesibilidad o consumo pasivo.
- Generación de avisos y locuciones pregrabadas dinámicamente: sustitución de ficheros de audio estáticos por síntesis en tiempo de ejecución cuando el texto cambia con frecuencia.
- Prototipado de interfaces conversacionales en portugués: disponer de 26 voces permite probar distintas identidades sonoras sin entrenar modelos propios.
- Despliegue en entornos con restricciones de dependencias: al estar en ONNX y no requerir PyTorch, encaja en contenedores o dispositivos donde el stack de inferencia debe ser mínimo.
- Investigación comparativa de TTS multilingüe: sirve como referencia de la variante portuguesa de Pocket TTS frente a otras lenguas de la misma colección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 0,8 GB en disco, lo que da una cota superior aproximada del espacio de pesos.
- GPU recomendadas: no disponibles. Al ejecutarse sobre ONNX, puede funcionar tanto en CPU como en GPU según el proveedor de ejecución configurado, pero no se documentan requisitos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y runtime ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Voces | Contexto / parámetros |
|---|---|---|---|---|---|
| pockettts-pt-kyutai (este modelo) | pt | ONNX | CC-BY-4.0 | 26 | no disponible |
| Otras variantes de Pocket TTS en la colección Phoonnx | distintas lenguas | ONNX | CC-BY-4.0 (según upstream) | variable | no disponible |
| kyutai/pocket-tts (upstream) | multilingüe | pesos originales de Kyutai | CC-BY-4.0 | variable | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas en la información proporcionada, por lo que la comparación se limita a formato, licencia e idioma.

## Limitaciones y advertencias

- Solo soporta portugués (`pt`); no es un modelo multilingüe.
- El front-end usa puntos de código Unicode sin fonemizador específico del portugués, lo que puede degradar la pronunciación de números, abreviaturas y símbolos.
- No se documentan sesgos conocidos, pero al no publicarse detalles del dataset de entrenamiento no es posible evaluar sesgos de acento, género o registro.
- Riesgo de alucinación no aplicable en el sentido habitual de generación de texto, pero sí existe riesgo de prosodia incorrecta o pronunciaciones erróneas en textos fuera de dominio.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es obligatorio citar la autoría de Kyutai y respetar los términos de la licencia upstream.
- El repositorio tiene pocas descargas (27) y ningún "like", lo que sugiere poca validación por parte de la comunidad; conviene evaluar la calidad de las voces antes de usarlo en producción.
- No se especifican parámetros, contexto ni cuantizaciones, lo que dificulta estimar costes de inferencia y planificar el despliegue.
- La fecha de creación del repositorio (2026-11-14) es posterior a la fecha actual en muchos entornos; verificar la vigencia y procedencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pockettts-pt-kyutai
- Upstream de Kyutai (portugués): https://huggingface.co/kyutai/pocket-tts/tree/main/languages/portuguese
- Conversión ONNX de KevinAHM: https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/portuguese
- Colección Pocket TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
