# Phoonnx/vits-mimic3_gu_IN_cmu-indic_low

## Resumen

`vits-mimic3_gu_IN_cmu-indic_low` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado por el usuario Phoonnx para su uso con la librería `phoonnx`, una implementación ligera de inferencia TTS. El modelo proviene del repositorio agregador `Phoonnx/phoonnx-vits`, concretamente de la carpeta `mimic3__gu_IN__cmu-indic_low`, y conserva la ruta de archivos original de ese repositorio. Se trata de una voz VITS para gujarati (`gu_IN`) derivada del conjunto de datos CMU Indic, marcada como variante `low` (presumiblemente de baja calidad o tamaño reducido de muestras).

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional variacional adversario que genera waveform directamente a partir de texto sin necesidad de un vocoder separado. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a despliegue en entornos con recursos limitados. La licencia declarada es MIT, aunque la model card advierte que las licencias siguen a los originales por subcarpeta y que algunas voces del repositorio fuente carecen de licencia explícita.

El modelo no presenta descargas ni interacciones en el momento de la consulta y no incluye datos de benchmarks, idiomas declarados en metadatos ni especificaciones técnicas detalladas más allá de la etiqueta de pipeline `text-to-speech`. Su relevancia es acotada: cubre una voz de gujarati dentro de un ecosistema de voces empaquetadas para `phoonnx`, útil para proyectos que necesiten TTS multilingüe ligero con licencia permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS condicional variacional con discriminador adversarial) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible; pesos en ONNX (formato de despliegue, no cuantización declarada) |
| Idiomas soportados | gujarati (`gu_IN`), según el identificador de la voz; no hay lista formal en metadatos |
| Licencia | MIT (declarada), con advertencia de que las licencias siguen a los originales por subcarpeta |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional condicionado por alineamiento monotónico (MAS), un decoder generativo y un discriminador adversarial multi-periodo, todo entrenado conjuntamente. Esto permite generar waveform directamente desde fonemas o caracteres sin vocoder externo, con latencia baja y calidad razonable para voces compactas. La variante `low` del nombre suele indicar un modelo entrenado con menos pasos o menor capacidad, orientado a inferencia rápida.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset CMU Indic, ni si hubo ajuste fino con RLHF/DPO (poco habitual en TTS). El modelo se distribuye como artefacto ONNX listo para inferencia con `phoonnx`, sin tarjeta técnica que detalle hiperparámetros, muestreo o duración de entrenamiento. La innovación destacable es el empaquetado: pesos ONNX portables y una integración directa con la librería `phoonnx` mediante el voice id `mimic3/gu_IN/cmu-indic_low`.

## Capacidades

- Síntesis de voz (text-to-speech) en gujarati a partir de texto de entrada.
- Generación de waveform end-to-end sin vocoder separado, gracias a la arquitectura VITS.
- Inferencia en formato ONNX, compatible con runtimes ONNX (ONNX Runtime, etc.).
- Integración con la librería `phoonnx` mediante voice id `mimic3/gu_IN/cmu-indic_low`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es un modelo TTS puro.
- No se documentan capacidades multilingües más allá del gujarati.

## Casos de uso

- **Lectura de contenido en gujarati**: convertir artículos, noticias o documentación a audio para aplicaciones de accesibilidad o consumo pasivo, aprovechando que el modelo es ligero (0,1 GB) y desplegable en servidores modestos.
- **Asistentes de voz para atención al cliente en gujarati**: generar respuestas habladas en un pipeline de IVR o chatbot, con la ventaja de una licencia MIT que facilita su integración comercial.
- **Aplicaciones móviles o embebidas de TTS offline**: al ser ONNX y compacto, puede ejecutarse en dispositivos con recursos limitados mediante ONNX Runtime, sin depender de servicios en la nube.
- **Generación de audiolibros o podcasts automatizados**: sintetizar textos largos por fragmentos y concatenar el audio, usando la voz `low` para previsualizaciones rápidas o borradores.
- **Localización de interfaces y notificaciones**: producir avisos hablados en gujarati dentro de aplicaciones de transporte, banca o salud, donde se requiere una voz neutra y un despliegue sencillo.
- **Prototipado de pipelines TTS multilingües con `phoonnx`**: usar esta voz junto con otras del repositorio `Phoonnx/phoonnx-vits` para construir un sistema que seleccione idioma dinámicamente, aprovechando el mismo runtime y formato de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se estima un consumo de memoria muy bajo, del orden de cientos de MB durante la inferencia, aunque no hay cifra oficial.
- **GPU recomendadas**: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, NVIDIA T4, RTX 3060 o superiores) debería ser suficiente. También es viable en CPU.
- **Consumer GPU**: previsiblemente sí, dado el tamaño reducido; no hay confirmación oficial.
- **Opciones de despliegue**: ONNX Runtime y la librería `phoonnx` (https://github.com/TigreGotico/phoonnx). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-mimic3_gu_IN_cmu-indic_low` | VITS | gujarati (`gu_IN`) | no aplica | MIT (con caveat por subcarpeta) | ONNX | Hugging Face, 0 descargas |
| Otras voces de `Phoonnx/phoonnx-vits` | VITS | múltiples (p. ej. `tw-kasanoma`, `ny-kasanoma`, `vmw-kasanoma`) | no aplica | variable por subcarpeta (algunas `other`) | ONNX | Hugging Face |
| Piper (voces CMU Indic equivalentes) | VITS | múltiples, incluido gujarati | no aplica | variable según voz | ONNX | GitHub releases / Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada, por lo que la comparación se limita a parámetros estructurales y licencia.

## Limitaciones y advertencias

- **Licencia ambigua en la práctica**: aunque la tarjeta declara MIT, el propio README advierte que las licencias siguen a los originales por subcarpeta y que algunas voces del repositorio fuente no tienen licencia declarada. Conviene revisar el README de la carpeta antes de un uso comercial.
- **Calidad potencialmente limitada**: el sufijo `low` sugiere una variante de menor calidad o tamaño; no hay métricas (MOS) que lo confirmen.
- **Idioma restringido**: solo se identifica gujarati; no hay soporte documentado de otros idiomas ni de code-switching.
- **Sin datos de sesgo ni alucinación**: al ser un modelo TTS, el riesgo de alucinación se traduce en pronunciaciones erróneas o prosodia incorrecta, pero no se documentan evaluaciones al respecto.
- **Sin benchmarks ni validación externa**: no hay resultados publicados que permitan estimar su calidad frente a alternativas.
- **Ecosistema nicho**: depende de la librería `phoonnx`; la integración con otros frameworks TTS no está documentada.
- **Metadatos incompletos**: no se declaran parámetros, contexto, cuantizaciones ni idiomas en los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-mimic3_gu_IN_cmu-indic_low
- Repositorio fuente de voces: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería `phoonnx`: https://github.com/TigreGotico/phoonnx
- Repositorio de voces Kasanoma (referenciado en la licencia): https://github.com/michsethowusu/kasanoma
