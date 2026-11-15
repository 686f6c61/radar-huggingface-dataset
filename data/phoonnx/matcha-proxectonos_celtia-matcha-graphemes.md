# Phoonnx/matcha-proxectonos_celtia-matcha-graphemes

## Resumen

`Phoonnx/matcha-proxectonos_celtia-matcha-graphemes` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx). Se trata de una extracción del repositorio agregador `Phoonnx/phoonnx-matcha`, concretamente de la carpeta `proxectonos__celtia-matcha-graphemes`, y conserva la estructura de rutas original. El modelo se publica bajo la licencia GPL-3.0.

La arquitectura subyacente es Matcha, un esquema de TTS no autorregresivo basado en modelos de flujo (flow matching) que combina un acoustic model condicionado por texto con un vocoder neuronal para generar la forma de onda. El nombre del identificador sugiere que la entrada se procesa a nivel de grafemas (no fonemas) y que el modelo está asociado al proyecto ProxectoNós / Celtia, orientado a la lengua galaica. La información pública disponible no detalla el número de parámetros, la longitud de contexto ni los idiomas formalmente soportados.

El modelo es relevante para desarrolladores que necesiten integrar TTS en gallego dentro de pipelines ligeros y desplegables mediante ONNX Runtime, especialmente en entornos donde no se dispone de GPU dedicada. Su tamaño de repositorio (0,1 GB) y su empaquetado para phoonnx lo sitúan en la categoría de modelos de voz compactos orientados a inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha (TTS no autorregresivo con flow matching) + vocoder neuronal; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repositorio no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible oficialmente; el identificador sugiere gallego (ProxectoNós/Celtia) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Matcha es una familia de modelos de TTS que emplea un esquema de generación basado en flow matching condicionado por la representación textual, seguido de un vocoder que transforma el espectrograma o la representación acústica intermedia en forma de onda. El identificador `matcha-graphemes` indica que el front-end textual trabaja directamente sobre grafemas en lugar de una conversión fonética explícita, lo que simplifica el pipeline pero puede afectar a la precisión en lenguas con reglas ortográficas complejas.

La información proporcionada no incluye detalles sobre el corpus de entrenamiento, el número de tokens o muestras utilizadas, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en TTS). Tampoco se documentan innovaciones técnicas adicionales más allá del propio esquema Matcha y la exportación a ONNX para inferencia portable.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`).
- Procesamiento de entrada a nivel de grafemas, sin requerir un lexicón fonético externo.
- Inferencia mediante ONNX Runtime, lo que permite despliegue en CPU y en múltiples plataformas.
- Integración nativa con la librería phoonnx a través del voice id `proxectonos/celtia-matcha-graphemes`.
- Generación de audio condicionada por un vocoder incluido en el paquete.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- Lectura de contenido web en gallego: el modelo puede convertir artículos o textos de interfaces en audio para accesibilidad, aprovechando el front-end basado en grafemas que evita depender de un diccionario fonético específico.
- Asistentes de voz locales: al ejecutarse sobre ONNX Runtime, puede integrarse en aplicaciones de escritorio o móviles sin conexión a servicios en la nube, reduciendo latencia y preservando privacidad.
- Audiolibros y narración automatizada: adecuado para generar narraciones de documentos largos por lotes, dado el reducido tamaño del paquete (0,1 GB) que facilita el despliegue en servidores modestos.
- Sistemas de anuncios públicos y señalización: síntesis de mensajes cortos en gallego para paneles informativos o transporte, donde se requiere una voz consistente y un despliegue embebido.
- Integración en pipelines de phoonnx: uso como una voz más dentro de una aplicación que ya emplea el ecosistema phoonnx para gestionar múltiples voces y modelos.
- Pruebas y prototipado de TTS en gallego: útil para investigadores que necesiten una línea base funcional antes de entrenar o ajustar modelos propios, aunque la licencia GPL-3.0 condiciona su uso en productos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) es plausible su ejecución en CPU con consumo de memoria del orden de cientos de MB, aunque no se documenta oficialmente.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de pequeño tamaño, cualquier GPU con soporte de ONNX Runtime (por ejemplo, series RTX o A-series) podría ejecutarlo, pero no hay cifras publicadas.
- Compatibilidad con GPU de consumo: probable en la mayoría de tarjetas actuales dado el tamaño reducido, si bien no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (principal), a través de la librería phoonnx. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/matcha-proxectonos_celtia-matcha-graphemes | TTS Matcha (ONNX) | no disponible | no aplica | GPL-3.0 | ONNX | Hugging Face (phoonnx) |
| Piper (voces comunitarias) | TTS VITS (ONNX) | no disponible | no aplica | MIT (mayoría de voces) | ONNX | Hugging Face / rhasspy |
| Coqui TTS (modelos VITS) | TTS VITS | variable | no aplica | MPL-2.0 / otras | PyTorch, ONNX | Coqui / Hugging Face |
| Matcha-TTS (referencia académica) | TTS Matcha | no disponible | no aplica | MIT | PyTorch | GitHub |

La comparación se limita a categorías y licencias, ya que no hay datos públicos de parámetros ni métricas de calidad para el modelo evaluado. Frente a Piper, la diferencia principal es la licencia (GPL-3.0 frente a MIT en muchas voces) y el enfoque en gallego; frente a Coqui TTS, el modelo evaluado es más ligero y específico de una única voz.

## Limitaciones y advertencias

- La licencia GPL-3.0 impone obligaciones de copyleft: el uso en productos propietarios o distribuidos puede requerir liberar el código derivado, lo que limita su adopción comercial cerrada.
- No se documentan los idiomas soportados oficialmente; el uso en lenguas distintas del gallego puede producir pronunciaciones incorrectas.
- El front-end basado en grafemas puede generar errores en palabras con ortografía irregular o extranjerismos.
- No hay información sobre sesgos de voz (género, acento, edad) ni sobre la diversidad del corpus de entrenamiento.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos o prosodia anómala en textos fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- No se documentan límites de longitud de texto por inferencia; textos largos pueden requerir segmentación manual.
- La model card es mínima y remite a la licencia del repositorio fuente sin detallar condiciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-proxectonos_celtia-matcha-graphemes
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-matcha
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
