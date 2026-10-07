# Shayde182/rhymeai-gemma-4-gguf

## Resumen

RhymeAI Gemma 4 (E2B / E4B) es una familia de ajustes finos LoRA sobre los modelos Gemma 4 E2B-it y E4B-it de Google (distribuidos por Unsloth), publicados por el usuario Shayde182 para la aplicacion nativa de composicion de canciones RhymeAI / Writers Block. El modelo resuelve una tarea muy concreta: asistir en la escritura de letras dentro de la propia aplicacion, siguiendo un formato de prompt fijo y ejecutandose 100% offline sobre llama.cpp en dispositivos moviles. Se distribuye unicamente en formato GGUF cuantizado, con variantes Q4_K_M de 3,2 GB (E2B) y 5,0 GB (E4B) y adaptadores LoRA en F16 de 48 MB y 70 MB.

La relevancia de esta ficha esta en su naturaleza de artefacto de produccion: no es un modelo generalista, sino un ajuste orientado a cuatro tareas de escritura (sugerencia de siguiente linea con rima, reescritura de pasajes, reescritura de palabra unica y sinonimos). El autor reporta mejoras muy grandes en el cumplimiento de formato y en la tasa de rima correcta respecto a los modelos base, lo que ilustra el impacto de un ajuste LoRA pequeno (r=16) cuando se entrena con datos verificados automaticamente.

El repositorio tiene 153 descargas y 0 likes en HuggingFace, con licencia Apache 2.0, y fue creado el 8 de julio de 2026 y actualizado el 6 de octubre de 2026. El dato de parametros via safetensors en el repo es 25.337.856, coherente con el tamano de los adaptadores LoRA mas que con el modelo base completo, cuyo recuento no se detalla en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base de la familia Gemma 4; variantes internas no detalladas en la informacion disponible) |
| Parametros totales | 25.337.856 segun safetensors del repo (corresponde a los adaptadores LoRA; el recuento del modelo base no se detalla) |
| Parametros activos | no disponible (no se indica que los modelos base sean MoE) |
| Longitud de contexto | 2048 tokens en la configuracion de evaluacion del autor; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); adaptadores LoRA en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) y adaptadores LoRA GGUF F16 |

## Arquitectura y entrenamiento

Los modelos son ajustes finos mediante QLoRA sobre Gemma 4 E2B-it y E4B-it. La configuracion de entrenamiento declarada es r=16, alpha=16, 2 epocas, learning rate 2e-4 con scheduler coseno, batch efectivo de 16 y perdida con mascara sobre el prompt (prompt-masked loss). El conjunto de entrenamiento consta de 4.947 ejemplos sinteticos generados a partir de letras semilla originales y verificados automaticamente por maquina antes del entrenamiento para comprobar la correccion de rima y de formato (comprobacion de rima con el diccionario CMU). El autor afirma que no se usaron letras con copyright ni datos de usuarios.

El entrenamiento se realizo con Unsloth sobre una GPU Colab L4; posteriormente los adaptadores se fusionaron y cuantizaron con llama.cpp (`llama-export-lora` + `llama-quantize`, Q4_K_M). El formato de prompt esperado es el crudo de Gemma con marcadores de turno (`<start_of_turn>user\n...` y `<start_of_turn>model\n`) y la cadena de parada `<end_of_turn>`, lo que obliga a respetar exactamente ese esquema para obtener el comportamiento entrenado.

## Capacidades

- Generacion de texto creativo orientado a letras de canciones.
- Sugerencia de siguiente linea con restriccion de rima, siguiendo el formato de la aplicacion.
- Reescritura de pasajes completos de una letra.
- Reescritura de una unica palabra dentro de una linea.
- Generacion de sinonimos.
- Ejecucion totalmente offline en el dispositivo (on-device) mediante llama.cpp.
- Soporte de tool calling / function calling: no disponible (no se menciona).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un objetivo del ajuste).
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo de razonamiento, vision o audio: no disponibles.

## Casos de uso

- Asistente de composicion integrado en app movil: el modelo corre en el telefono mediante llama.cpp (3,2 GB el E2B Q4_K_M y 5,0 GB el E4B Q4_K_M), de modo que la app puede ofrecer asistencia de escritura sin enviar la letra del usuario a ningun servidor.
- Sugerencia de rimas en tiempo real: el ajuste eleva la tasa de formato correcto del 4% al 96% en el E2B y la tasa de rima del 60% al 92%, lo que lo hace viable como autocompletado de lineas mientras el usuario escribe.
- Reescritura de estrofas: la tarea de reescritura de pasaje pasa del 0% de formato correcto en el E2B base al 100% en el ajustado, lo que permite ofrecer "reescribe esta estrofa" como funcionalidad fiable.
- Sustitucion de palabras y busqueda de sinonimos: util para evitar repeticiones o ajustar la metrica; el E4B ajustado alcanza un 78% en la tarea de reescritura de palabra unica.
- Escritura creativa sin conexion: escenarios sin red (aviones, zonas rurales, festivales) donde el modelo debe funcionar igualmente al estar embebido en la app.
- Prototipado rapido en escritorio con llama.cpp: los mismos GGUF permiten probar la funcionalidad en un portatil antes de empaquetarla en movil.
- Educacion musical y talleres de letras: el modelo puede usarse como herramienta de apoyo en ejercicios guiados de rima y reescritura, siempre con supervision humana.
- Investigacion sobre ajustes LoRA pequenos: el par de adaptadores F16 (48 MB y 70 MB) sirve como caso de estudio reproducible de QLoRA aplicado a una tarea estrecha y verificable.

## Benchmarks y rendimiento

Resultados del arnes de evaluacion de 43 casos del autor, con temperatura 0,8, top-k 40, top-p 0,95 y contexto de 2048 tokens:

| Tarea | E2B base → ajustado | E4B base → ajustado |
|---|---|---|
| Sugerencias — formato correcto | 4% → 96% | 4% → 83% |
| Sugerencias — rima correcta | 60% → 92% | 82% → 84% |
| Reescritura de pasaje — formato | 0% → 100% | 33% → 83% |
| Reescritura de palabra unica | 56% → 22% | 11% → 78% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: E2B Q4_K_M ocupa 3,2 GB y E4B Q4_K_M 5,0 GB de peso en disco; el consumo en ejecucion sera algo superior por el contexto y los buffers de llama.cpp.
- Perfil objetivo declarado por el autor: telefonos de gama media con 4–8 GB de RAM para el E2B y dispositivos grandes con 10 GB o mas de RAM para el E4B.
- Cabe en GPU de consumo: si, cualquier GPU con 4–8 GB de VRAM puede ejecutar estas cuantizaciones (por ejemplo, RTX 3060/4060 en adelante), aunque el destino previsto es CPU movil.
- Opciones de despliegue: llama.cpp (motor principal), y por compatibilidad de formato GGUF, tambien Ollama o bindings basados en llama.cpp. El autor no menciona vLLM ni TGI, que no consumen GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles (el autor no publica tiempos de generacion).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con otros modelos en la informacion proporcionada; la unica comparacion documentada es interna, entre los modelos base y sus versiones ajustadas.

| Version | Peso Q4_K_M | Formato sugerencias | Rima sugerencias | Formato pasaje | Palabra unica |
|---|---|---|---|---|---|
| Gemma 4 E2B-rhymeai | 3,2 GB | 96% | 92% | 100% | 22% |
| Gemma 4 E4B-rhymeai | 5,0 GB | 83% | 84% | 83% | 78% |

Como referencia de categoria, cabria comparar con otros asistentes de escritura on-device, pero no hay datos disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles (el autor no documenta analisis de sesgos).
- Riesgo de alucinacion: no evaluado; al ser un modelo generativo creativo, puede producir rimas o palabras inventadas o forzadas, especialmente en la variante E2B en la tarea de reescritura de palabra unica (22% de exito, por debajo del 56% del modelo base).
- Limitaciones de contexto: el arnes de evaluacion usa 2048 tokens de contexto, lo que limita la cantidad de letra que cabe en una sola generacion; el contexto nativo del modelo base no se especifica.
- Limitaciones de idioma: no se declaran idiomas soportados; el formato de prompt esta en ingles y no hay evidencia de buen rendimiento en castellano u otros idiomas.
- Restricciones de licencia: la licencia es Apache 2.0, lo que en principio permite uso comercial, pero conviene revisar las condiciones de la licencia del modelo base Gemma 4, ya que los terminos de uso de Google pueden imponer restricciones adicionales.
- Caveats para produccion: el modelo espera de forma estricta los marcadores de turno de Gemma (`<start_of_turn>` / `<end_of_turn>`); cualquier desviacion del formato entrenado degradara el cumplimiento de formato. Ademas, la evaluacion se basa en un unico arnes de 43 casos del propio autor, sin validacion externa ni comparacion con modelos de referencia.
- El dato de parametros safetensors (25.337.856) parece corresponder a los adaptadores y no al modelo base, por lo que no debe interpretarse como el tamano real del modelo desplegado.

## Enlaces

- HuggingFace: https://huggingface.co/Shayde182/rhymeai-gemma-4-gguf
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Paper, blog, repositorio o demo adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo (los resultados obtenidos versaban sobre el fruto del jacquier y recetas de cocina, sin relacion con esta ficha).
