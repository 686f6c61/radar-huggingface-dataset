# emillykkegrann/ekko-v1-tiny-GGUF

## Resumen

ekko-v1-tiny es un modelo de reconocimiento automático del habla (ASR) especializado en danés, desarrollado originalmente por RyeAI y derivado de `nvidia/parakeet-rnnt-110m-da-dk`. Esta ficha documenta el mirror del cuantizado q5_0 en formato GGUF publicado por el usuario emillykkegrann, que replica byte a byte el archivo original alojado en el repositorio upstream bajo `gguf-parakeet.cpp/ekko-v1-tiny-q5_0.gguf`. El objetivo del mirror es permitir que la herramienta Codictate transcriba dictado en danés mediante parakeet.cpp sin depender de que el repositorio original permanezca inalterado.

El modelo cuenta con 112.861.197 parámetros totales (aproximadamente 113 millones), lo que lo sitúa en la categoría de modelos ASR compactos y desplegables en hardware modesto. La arquitectura subyacente es un modelo RNNT (Recurrent Neural Network Transducer) de NVIDIA, adaptado por RyeAI para el idioma danés, y el artefacto publicado aquí es únicamente el cuantizado q5_0 en GGUF, de unos 134,7 MB.

Su relevancia práctica reside en que ofrece transcripción de voz en danés con un consumo de recursos muy bajo y un formato compatible con el runtime parakeet.cpp, lo que facilita su integración en aplicaciones de escritorio o utilidades de dictado sin infraestructura de GPU dedicada. No se trata de un modelo de propósito general: su alcance se limita al reconocimiento de voz en danés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer), derivada de nvidia/parakeet-rnnt-110m-da-dk |
| Parámetros totales | 112.861.197 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q5_0 (único formato publicado en este mirror) |
| Idiomas soportados | danés (da) |
| Licencia | NVIDIA Open Model License (con CC BY 4.0 de RyeAI y términos de CoRal y FT Speech) |
| Formato de pesos | GGUF (parakeet.cpp); el repositorio upstream incluye además .nemo y export ONNX |

## Arquitectura y entrenamiento

La arquitectura es un RNNT, un tipo de modelo transducer empleado habitualmente en ASR que combina un encoder acústico, un predictor de red recurrente y una red de unión para alinear secuencias de audio y texto. El modelo base es `nvidia/parakeet-rnnt-110m-da-dk`, con unos 110 millones de parámetros, adaptado por RyeAI al danés como ekko-v1-tiny. El mirror documentado aquí no ha sido reconvertido ni reentrenado: es una copia byte a byte del GGUF q5_0 generado por RyeAI para parakeet.cpp.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que los términos de CoRal y FT Speech aplican en adición a la licencia de NVIDIA, lo que sugiere que el entrenamiento o la adaptación emplearon esos corpus daneses, pero no se especifican cifras ni proporciones.

## Capacidades

- Reconocimiento automático del habla (ASR) en danés, con salida de transcripción a partir de audio.
- Adecuado para dictado y transcripción de voz en aplicaciones de escritorio, como demuestra su uso en Codictate.
- Funcionamiento mediante el runtime parakeet.cpp, orientado a inferencia ligera y local.
- No se documentan capacidades de traducción, diarización de hablantes, marcas de tiempo a nivel de palabra ni puntuación automática en la información disponible.
- No dispone de tool calling, function calling ni capacidades de agente.
- No es un modelo multimodal ni generativo de texto: su única tarea es la transcripción de audio.

## Casos de uso

- Dictado por voz en danés en aplicaciones de escritorio: el modelo transcribe audio a texto mediante parakeet.cpp, integrándose en herramientas como Codictate con un consumo de recursos mínimo gracias a sus ~113 millones de parámetros y al cuantizado q5_0 de 134,7 MB.
- Subtitulado y transcripción de reuniones en danés: al ejecutarse localmente y en formato GGUF, permite procesar grabaciones sin enviar audio a servicios externos, lo que resulta útil por privacidad y coste.
- Asistentes de voz locales para danés: su tamaño reducido facilita la integración en pipelines de reconocimiento de comandos o entrada por voz en aplicaciones de escritorio.
- Transcripción de notas de voz y entrevistas: el modelo puede convertir archivos de audio en texto para su posterior indexación o búsqueda, con un footprint de disco inferior a 150 MB.
- Prototipado de aplicaciones ASR en danés: sirve como baseline ligero para evaluar calidad de transcripción antes de escalar a modelos mayores, gracias a su formato GGUF y a la disponibilidad del checkpoint .nemo y ONNX upstream.
- Herramientas de accesibilidad: entrada por voz para usuarios que necesitan dictar en danés en entornos con hardware limitado, ya que el modelo puede ejecutarse en CPU mediante parakeet.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio original `RyeAI/ekko-v1-tiny` para consultar los detalles de evaluación, que no se incluyen en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 112,9 millones de parámetros y un cuantizado q5_0 de 134,7 MB, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 1 GB de memoria libre sería suficiente, aunque no se confirma compatibilidad con runtimes CUDA concretos.
- Cabe en GPU consumer: sí, por tamaño (cualquier RTX o equivalente); el runtime parakeet.cpp está orientado a ejecución local.
- Opciones de despliegue: parakeet.cpp (runtime previsto por el autor del mirror); para otros formatos, el repositorio upstream ofrece .nemo y ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ekko-v1-tiny (este mirror) | 112.861.197 | no disponible | danés | NVIDIA Open Model License | GGUF q5_0 |
| nvidia/parakeet-rnnt-110m-da-dk | ~110 M (modelo base) | no disponible | danés | NVIDIA Open Model License | .nemo, ONNX |
| Whisper small (referencia ASR) | ~244 M | 30 s de audio | multilingüe | MIT | safetensors, GGUF, etc. |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y formato; los datos de Whisper small se incluyen como referencia de categoría y no proceden de la documentación del modelo.

## Limitaciones y advertencias

- El modelo solo soporta danés; no se debe esperar transcripción fiable en otros idiomas.
- Es un mirror no oficial: no lo mantiene RyeAI, y cualquier corrección o actualización debe consultarse en el repositorio original.
- Solo se publica el cuantizado q5_0; no hay otras cuantizaciones en este repositorio.
- La licencia es la NVIDIA Open Model License, con términos adicionales de CC BY 4.0 de RyeAI y de los corpus CoRal y FT Speech; es necesario revisar `MODEL_LICENSE.md`, `NOTICE` y `LICENSES/` antes de cualquier uso comercial.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente con audio ruidoso, acentos o vocabulario técnico; no se documentan métricas de WER en la información disponible.
- No se documentan sesgos específicos, pero al estar entrenado con corpus daneses concretos puede presentar peor rendimiento en variedades dialectales no representadas.
- No dispone de funcionalidades de puntuación, diarización ni marcas de tiempo documentadas, lo que limita su uso directo en producción sin postprocesado.
- El autor del mirror indica que retirará el repositorio si RyeAI lo solicita, por lo que su disponibilidad a largo plazo no está garantizada.

## Enlaces

- Mirror en Hugging Face: https://huggingface.co/emillykkegrann/ekko-v1-tiny-GGUF
- Modelo original: https://huggingface.co/RyeAI/ekko-v1-tiny
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-rnnt-110m-da-dk
- Runtime parakeet.cpp: https://github.com/mudler/parakeet.cpp
- Aplicación Codictate: https://github.com/EmilLykke/codictate
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
