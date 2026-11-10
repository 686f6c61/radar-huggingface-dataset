# OMAR-ESLAM/Tasmee

## Resumen

Tasmee es una conversión a ONNX del modelo `obadx/muaalem-model-v3_2`, un sistema de reconocimiento fonético del árabe coránico orientado a la evaluación de la pronunciación (tajwid). El autor de la conversión es el usuario de Hugging Face OMAR-ESLAM, mientras que el modelo original pertenece a obadx. El objetivo declarado es ejecutar el modelo en el navegador, gracias al formato ONNX, lo que lo hace adecuado para aplicaciones web de aprendizaje y corrección de recitación sin depender de infraestructura de servidor.

El modelo no es un LLM generativo: se trata de un cabezal de fonemas ("phonemes head") que trabaja sobre audio y produce una secuencia de fonemas asociada a la recitación. Esto lo sitúa en la categoría de modelos de reconocimiento de habla especializados, no en la de modelos de lenguaje. Su relevancia actual reside en la combinación de un dominio muy específico (recitación coránica) con un formato de despliegue ligero y portable (ONNX), que permite inferencia en cliente.

La información pública disponible es muy limitada: la model card es mínima, no se detallan arquitectura, número de parámetros, contexto ni idiomas más allá de la referencia implícita al árabe coránico. El repositorio ocupa 2,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: obadx/muaalem-model-v3_2; cabezal de fonemas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; el modelo base figura como quantized) |
| Idiomas soportados | no disponible (orientado al árabe coránico por el dominio del modelo base) |
| Licencia | other (ver LICENSE y NOTICE en el repositorio) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. La model card únicamente indica que se trata de una conversión desde `obadx/muaalem-model-v3_2` mediante el cuaderno `tools/export-muaalem-onnx.ipynb`, y que el resultado es un "phonemes head", es decir, la parte del pipeline que transforma representaciones acústicas en fonemas. El modelo base aparece etiquetado como cuantizado (`base_model:quantized:obadx/muaalem-model-v3_2`), lo que sugiere que la exportación parte de una versión ya reducida en precisión.

No constan datos sobre volumen de entrenamiento, composición del corpus, uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debería consultarse en la model card del modelo original de obadx, que no forma parte de la información proporcionada.

## Capacidades

- Reconocimiento fonético de audio: el modelo produce una secuencia de fonemas a partir de una entrada de audio, según se deduce del nombre "phonemes head" y del dominio del modelo base.
- Evaluación de pronunciación en recitación coránica: el contexto de uso declarado es la corrección de tajwid, con la advertencia explícita de que no sustituye a un maestro cualificado.
- Inferencia en navegador: al estar exportado a ONNX, puede ejecutarse en entornos JavaScript/WASM en el cliente.
- Capacidades multilingües: no disponibles; el dominio apunta al árabe coránico.
- Tool calling, agentes, razonamiento multi-paso, visión, audio generativo o modo "thinking": no disponibles; no es un modelo generativo de propósito general.

## Casos de uso

- Aplicación web de práctica de recitación: el modelo puede cargarse en el navegador vía ONNX Runtime Web y comparar los fonemas producidos por el usuario con la secuencia esperada, ofreciendo retroalimentación inmediata sin enviar audio a un servidor.
- Herramienta de autoevaluación para estudiantes de tajwid: integrada en una plataforma educativa, permite detectar desviaciones fonéticas en la pronunciación y señalar los puntos a corregir antes de la revisión con un profesor.
- Corrección asistida en academias coránicas: el modelo actúa como primer filtro automático sobre grabaciones de alumnos, de modo que el docente revisa únicamente los casos marcados como problemáticos.
- Investigación en fonética árabe: la salida de fonemas permite construir corpus anotados automáticamente y analizar patrones de pronunciación en grandes volúmenes de audio.
- Aplicaciones offline de bajo recurso: al ejecutarse en cliente con ONNX, es viable en dispositivos sin GPU dedicada o con conectividad limitada, útil en contextos educativos con infraestructura reducida.
- Integración en pipelines de evaluación masiva: un servidor puede usar el mismo grafo ONNX con ONNX Runtime para procesar lotes de grabaciones y generar informes de calidad de recitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 2,1 GB, por lo que la huella en memoria es del orden de gigabytes, dependiendo de la precisión efectiva de los pesos ONNX.
- GPU recomendadas: no disponibles; al ser un modelo exportado a ONNX orientado a navegador, el objetivo declarado es la ejecución en CPU/WASM en cliente.
- Compatibilidad con GPU de consumo: probable en términos de tamaño (2,1 GB de repositorio), pero no confirmada por el autor.
- Opciones de despliegue: ONNX Runtime (incluida la variante Web para navegador); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de reconocimiento fonético coránico ni datos de rendimiento que permitan una comparación rigurosa. El único punto de referencia mencionado es el modelo base `obadx/muaalem-model-v3_2`, del que esta ficha es una conversión a ONNX.

## Limitaciones y advertencias

- El autor advierte explícitamente de que es un modelo de IA que puede cometer errores y que no sustituye a un maestro cualificado (en árabe en la propia model card).
- La licencia es "other": es imprescindible revisar los ficheros LICENSE y NOTICE del repositorio antes de cualquier uso, especialmente comercial, y verificar también las condiciones del modelo base `obadx/muaalem-model-v3_2`.
- La model card es mínima y no documenta sesgos, dominio de entrenamiento, cobertura dialectal ni limitaciones de contexto; no hay base para evaluar su robustez fuera del árabe coránico.
- Riesgo de alucinación o error en la transcripción fonética no cuantificado por falta de benchmarks publicados.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación comunitaria del artefacto exportado.
- Al ser una conversión de un modelo cuantizado, puede existir una pérdida de precisión respecto al modelo original que no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OMAR-ESLAM/Tasmee
- Modelo base: https://huggingface.co/obadx/muaalem-model-v3_2
- Cuaderno de exportación citado en la model card: `tools/export-muaalem-onnx.ipynb` (ruta dentro del repositorio; no se proporciona URL directa)
