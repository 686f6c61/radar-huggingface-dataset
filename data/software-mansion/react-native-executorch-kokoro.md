# software-mansion/react-native-executorch-kokoro

## Resumen

El repositorio `software-mansion/react-native-executorch-kokoro` aloja el modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad, en formato ExecuTorch para su ejecución en dispositivos móviles mediante la librería React Native ExecuTorch de Software Mansion. Este paquete permite generar voz sintética en ocho idiomas (inglés, francés, alemán, español, italiano, portugués, polaco e hindi) directamente en el dispositivo, sin necesidad de conexión a internet, lo que lo hace relevante para aplicaciones de accesibilidad, asistentes de voz y narración offline.

El modelo base, Kokoro-82M, cuenta con 82 millones de parámetros y se exporta aquí en dos sub-modelos encadenados: un predictor de duración y un sintetizador de forma de onda, ambos compilados a archivos `.pte` con optimización XNNPACK para CPU. La entrada de texto soporta un rango dinámico de 1 a 128 tokens, y el repositorio incluye además los recursos de preprocesamiento G2P (grapheme-to-phoneme) necesarios para convertir texto en fonemas antes de la síntesis.

La relevancia actual de este modelo radica en que ofrece una solución de síntesis de voz on-device de bajo coste computacional, integrable en aplicaciones React Native sin depender de servicios en la nube. Incluye variantes afinadas específicamente para alemán y polaco, lo que amplía su utilidad en entornos multilingües reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (síntesis de voz), exportado a ExecuTorch con backend XNNPACK |
| Parámetros totales | 82 millones (modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1-128 tokens (entrada dinámica) |
| Tipos de cuantización | fp32 (archivos `.pte` con sufijo `xnnpack_fp32`) |
| Idiomas soportados | en, fr, de, es, it, pt, pl, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pte` (ExecuTorch), con manifiestos `config.json` |

## Arquitectura y entrenamiento

El modelo base es Kokoro-82M, un sistema de síntesis de voz de 82 millones de parámetros. El repositorio no incluye detalles sobre el entrenamiento original del modelo base, pero se sabe que es un modelo de tipo Transformer diseñado para TTS, que genera la forma de onda directamente a partir de texto y fonemas. En esta exportación, el modelo se divide en dos sub-modelos que se ejecutan secuencialmente:

1. **Predictor de duración** (`duration_predictor_*_xnnpack_fp32.pte`): predice la duración de cada token y las características de prosodia `d`. Se exporta con tres métodos de entrada fija: `forward_32`, `forward_64` y `forward_128`, correspondientes a los buckets de tokens rellenados.
2. **Sintetizador** (`synthesizer_*_xnnpack_fp32.pte`): codifica el texto, predice F0 (frecuencia fundamental) y decodifica la forma de onda. Se exporta con formas dinámicas detrás de un único método `forward`.

El repositorio incluye tres variantes: `standard` (multilingüe general), `german` y `polish`, estas dos últimas afinadas para sus respectivos idiomas. Además, se proporcionan los datos y modelos de fonemización G2P (en formato ExecuTorch) necesarios para la conversión de grafemas a fonemas, un paso previo imprescindible para la síntesis.

## Capacidades

- Síntesis de voz (text-to-speech) en 8 idiomas: inglés, francés, alemán, español, italiano, portugués, polaco y hindi.
- Variantes afinadas específicamente para alemán y polaco, mejorando la naturalidad en estos idiomas.
- Preprocesamiento G2P (grapheme-to-phoneme) integrado, con modelos de fonemización por idioma.
- Voces pre-computadas (embeddings de hablante) disponibles en el directorio `voices/`, que permiten seleccionar características vocales sin necesidad de entrenamiento adicional.
- Ejecución on-device completa, sin conexión a internet, diseñada para aplicaciones React Native.
- Entrada dinámica de 1 a 128 tokens, lo que permite manejar frases de longitud variable sin reconfiguración.

## Casos de uso

- **Aplicaciones de accesibilidad**: lectores de pantalla para personas con discapacidad visual que necesiten convertir texto en voz audible directamente en el móvil, sin depender de servicios externos.
- **Asistentes de voz offline**: integración en apps de asistencia personal que responden por voz en zonas sin cobertura o en entornos donde la privacidad es crítica.
- **Narración de contenido**: generación de audiolibros o podcasts a partir de texto en múltiples idiomas, con la posibilidad de seleccionar diferentes voces precomputadas.
- **Aprendizaje de idiomas**: aplicaciones educativas que pronuncian palabras o frases en varios idiomas para practicar pronunciación, aprovechando la variante afinada para alemán y polaco.
- **Traducción de voz en tiempo real**: con la entrada de 1 a 128 tokens y la ejecución on-device, puede integrarse en pipelines de traducción de frases cortas para turismo o comunicación internacional.
- **Prototipado rápido de TTS**: desarrolladores de React Native pueden integrar el modelo en sus apps con pocas líneas de código mediante la librería `react-native-executorch`, ideal para MVP o pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM**: no aplica para GPU; el modelo está optimizado para CPU mediante XNNPACK, por lo que no requiere memoria de gráficos dedicada.
- **GPU**: no necesaria. El backend XNNPACK está diseñado para CPUs de dispositivos móviles.
- **Compatibilidad con consumer GPU**: no aplica; el objetivo es ejecución en dispositivos móviles (smartphones, tablets).
- **Opciones de despliegue**: mediante la librería React Native ExecuTorch (paquete `react-native-executorch`), o con cualquier runtime compatible con ExecuTorch v1.0.0. Para uso fuera de React Native, se puede seguir el script de ejemplo en el repositorio de exportación.
- **Latencia y throughput**: no se han publicado métricas específicas. La entrada limitada a 128 tokens y la optimización XNNPACK sugieren que la síntesis de frases cortas puede completarse en tiempo real en dispositivos móviles modernos, aunque no hay datos cuantitativos disponibles.

## Comparativa con modelos similares

No hay datos disponibles para una comparativa directa con modelos alternativos en la información proporcionada. El modelo base Kokoro-82M es un TTS de pequeño tamaño, y existen alternativas como VITS, Tacotron o Coqui TTS, pero no se dispone de métricas comparativas en este repositorio. La principal diferenciación de esta exportación es su integración específica con React Native ExecuTorch, que la hace única en el ecosistema móvil.

## Limitaciones y advertencias

- **Compatibilidad**: los archivos `.pte` fueron exportados con ExecuTorch v1.0.0 y no se garantiza compatibilidad hacia adelante; versiones anteriores del runtime pueden no funcionar con estos archivos.
- **Longitud de entrada**: la entrada está limitada a 128 tokens, lo que restringe la síntesis a frases cortas o párrafos breves; textos más largos requieren segmentación.
- **Idiomas limitados**: aunque cubre 8 idiomas, no incluye otros idiomas comunes como chino, japonés o árabe, lo que puede ser un inconveniente para aplicaciones globales.
- **Calidad de voz**: al ser un modelo de 82 millones de parámetros, la naturalidad de la voz puede ser inferior a modelos más grandes como VALL-E o Tortoise, aunque ofrece una relación calidad-tamaño adecuada para móvil.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero es necesario verificar que la licencia del modelo base (hexgrad/Kokoro-82M) sea compatible con los usos previstos.
- **Riesgo de alucinación**: en TTS, el riesgo se manifiesta como pronunciación incorrecta de nombres propios o palabras fuera del vocabulario; el sistema G2P ayuda a mitigarlo, pero no lo elimina.
- **Sesgos**: los datos de entrenamiento del modelo original pueden incluir sesgos de género, edad o acento en las voces, aunque no se documentan explícitamente.

## Enlaces

- HuggingFace: [software-mansion/react-native-executorch-kokoro](https://huggingface.co/software-mansion/react-native-executorch-kokoro)
- Modelo original: [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- Repositorio GitHub de React Native ExecuTorch: [software-mansion/react-native-executorch](https://github.com/software-mansion/react-native-executorch)
- Documentación de React Native ExecuTorch: [Getting Started](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started)
- Sitio web de React Native ExecuTorch: [https://executorch.swmansion.com/](https://executorch.swmansion.com/)
- Paquete npm: [react-native-executorch](https://www.npmjs.com/package/react-native-executorch)
- Proyecto Phonemis (preprocesamiento G2P): [https://github.com/IgorSwat/Phonemis](https://github.com/IgorSwat/Phonemis)
- Script de ejemplo de inferencia: [kokoro-export/demo/inference_example.py](https://github.com/NorbertKlockiewicz/kokoro-export/blob/main/demo/inference_example.py)
