# aaiiaxom/indicconformer-bodo-onnx-int8

## Resumen

IndicConformer Bodo ONNX INT8 es una conversión a formato ONNX y cuantización a INT8 del modelo de reconocimiento automático del habla (ASR) IndicConformer de AI4Bharat, especializado en el idioma bodo (`brx`). Lo publica la Assam AI Initiative (AAII) con el objetivo de facilitar el despliegue ligero en entornos con recursos limitados, incluida la inferencia en navegador para aplicaciones de dictado por voz. El modelo base IndicConformer es una arquitectura Conformer con cabecera CTC entrenada por AI4Bharat para lenguas de la India.

La relevancia de esta versión radica en que elimina la dependencia del stack completo de NVIDIA NeMo durante la inferencia: el grafo ONNX exportado integra el frontend de audio (STFT y preprocesado Mel) dentro del propio modelo, de modo que acepta audio crudo y devuelve la transcripción en un único paso ejecutable con ONNX Runtime. Esto abre la puerta a despliegues en CPU, en el navegador y en dispositivos de borde.

El repositorio ocupa aproximadamente 0,2 GB y la salida se produce en escritura devanagari. Se trata de una versión de despliegue cuantizada, no de un modelo nuevo entrenado desde cero, por lo que su comportamiento debe evaluarse frente al checkpoint original de NeMo antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con cabecera CTC; frontend STFT/Mel integrado en el grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio definida por la configuración de preprocesado) |
| Tipos de cuantizacion | INT8 |
| Idiomas soportados | Bodo (`brx`), salida en escritura devanagari |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model_cpu_int8.onnx`) |

## Arquitectura y entrenamiento

El modelo base IndicConformer de AI4Bharat emplea una arquitectura Conformer, que combina bloques de autoatención con convoluciones para capturar dependencias locales y globales en la secuencia de audio. Sobre el encoder se sitúa una cabecera CTC para la decodificación de la transcripción. En esta conversión, el grafo ONNX incluye el frontend de audio completo: la señal cruda pasa por STFT y preprocesado Mel, entra en el encoder Conformer y sale por la cabecera CTC, todo dentro del mismo modelo exportado.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si el modelo original incorporó etapas de ajuste fino con RLHF o DPO (poco habituales en ASR). La innovación técnica destacable de esta release es la integración del preprocesado dentro del grafo y la cuantización INT8, que reducen dependencias externas y el coste computacional de la inferencia. La decodificación empleada en la ruta de despliegue exportada es CTC.

## Capacidades

- Reconocimiento automático del habla en bodo (`brx`) con salida en escritura devanagari.
- Inferencia de extremo a extremo desde audio crudo: el modelo incluye STFT, Mel y encoder en un único grafo ONNX.
- Ejecución mediante ONNX Runtime en CPU, sin necesidad del stack de NVIDIA NeMo.
- Cuantización INT8 orientada a despliegues ligeros y en cliente (navegador).
- Apta para aplicaciones de dictado por voz y transcripción de audio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del propio ASR.
- Capacidad multilingüe limitada al idioma bodo según la información disponible.

## Casos de uso

- Dictado por voz en navegador: el modelo puede ejecutarse con ONNX Runtime en el cliente y transcribir audio en bodo sin enviar datos a un servidor, gracias al grafo autocontenido con preprocesado integrado.
- Aplicaciones de accesibilidad para hablantes de bodo: transcripción en tiempo real de voz a texto en herramientas de subtitulado o comunicación asistida.
- Herramientas educativas en lengua bodo: conversión de material hablado a texto devanagari para digitalización de contenidos escolares.
- Prototipado de ASR para lenguas de la India: base ligera para experimentar con pipelines de reconocimiento de habla sin montar NeMo.
- Transcripción de audio en dispositivos de borde: al ser INT8 y ejecutable en CPU, encaja en entornos con poca memoria y sin GPU.
- Integración en aplicaciones web de tecnología lingüística de AAII: el modelo se preparó específicamente para los flujos de dictado por voz de la iniciativa.
- Preprocesado de corpus orales: generación de transcripciones preliminares de grabaciones en bodo para su posterior revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa aproximadamente 0,2 GB, lo que sugiere un modelo compacto apto para entornos con memoria reducida.
- VRAM estimada: no disponible de forma explícita; al ser una versión INT8 para CPU, puede ejecutarse sin GPU.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo está orientado a inferencia en CPU.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el nombre del fichero (`model_cpu_int8.onnx`) indica una ruta de ejecución en CPU.
- Opciones de despliegue: ONNX Runtime (incluida inferencia en navegador); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| aaiiaxom/indicconformer-bodo-onnx-int8 | Bodo (`brx`) | ONNX | INT8 | CC-BY-4.0 | Frontend integrado, orientado a CPU/navegador |
| ai4bharat/IndicConformer | Lenguas de la India (incl. bodo) | NeMo | Original (sin cuantizar) | CC-BY-4.0 | Modelo base; requiere stack NeMo |
| Otras conversiones ONNX de IndicConformer | Según idioma | ONNX | Variable | Según original | No disponibles en la información proporcionada |

## Limitaciones y advertencias

- Al ser una versión cuantizada, pueden aparecer pequeñas diferencias numéricas o de precisión respecto al checkpoint original de NeMo.
- La ruta de despliegue exportada utiliza decodificación CTC, lo que puede limitar el rendimiento frente a otras estrategias de decodificación.
- El rendimiento depende del idioma, las condiciones de grabación, las características del hablante y el dominio; debe evaluarse sobre datos propios antes de producción.
- Cobertura limitada al idioma bodo; no es un modelo multilingüe general.
- Riesgo de errores de transcripción y de alucinación de texto en audio ruidoso o fuera de dominio (comportamiento habitual en ASR, no cuantificado en la información disponible).
- Sesgos: no documentados en la información proporcionada.
- Licencia CC-BY-4.0: permite uso comercial con atribución; debe respetarse la atribución a AI4Bharat y revisarse la licencia del modelo original.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aaiiaxom/indicconformer-bodo-onnx-int8
- Modelo base AI4Bharat IndicConformer: https://huggingface.co/ai4bharat/IndicConformer
- Código original IndicConformerASR (GitHub): https://github.com/AI4Bharat/IndicConformerASR
- Código de conversión ONNX (AAII): https://github.com/aaiiaxomi/IndicConformerASR_ONNX_Conversion
