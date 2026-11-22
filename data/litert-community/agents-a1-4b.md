# litert-community/Agents-A1-4B

## Resumen

Agents-A1-4B es un modelo de lenguaje de 4 mil millones de parametros desarrollado por InternScience, disenado especificamente para tareas agenticas y de tool calling. Se construye sobre la arquitectura hibrida Qwen3.5-4B, que combina 24 capas de GatedDeltaNet (atencion lineal con regla delta con compuertas) intercaladas con 8 capas de atencion completa con compuertas, lo que permite que el consumo de memoria se mantenga practicamente plano respecto a la longitud de contexto.

La version aqui descrita es una conversion realizada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`) para inferencia on-device con el runtime LiteRT-LM de Google. Esta conversion conserva unicamente el decodificador de texto (se elimina la torre de vision del modelo original), mantiene el modo de razonamiento (thinking) y el formato nativo XML de tool calling del modelo base, y declara activaciones en fp32.

Su relevancia radica en que ofrece capacidades agenticas reales en un paquete de entre 2,7 y 4,4 GB, apto para ejecucion en dispositivos de borde (moviles, portatiles, equipos consumer) sin GPU dedicada de datacenter, con licencia Apache 2.0 y soporte para cuantizacion int8 e int4 mixta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 24 capas GatedDeltaNet (atencion lineal, regla delta con compuertas) + 8 capas de atencion completa con compuertas (base Qwen3.5-4B) |
| Parametros totales | 4B (segun nombre y modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Presupuesto de KV cache de 4096 tokens en las 8 capas de atencion; memoria casi constante por las capas lineales |
| Tipos de cuantizacion | int8 dinamico (lineales y embedding) y int4 mixta (bloque 32 min-max en lineales, int8 channelwise en embedding y lm_head) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); requiere litert-lm >= 0.15 |

## Arquitectura y entrenamiento

El modelo base, InternScience/Agents-A1-4B, emplea la arquitectura hibrida de Qwen3.5-4B: 24 capas de GatedDeltaNet basadas en la regla delta con compuertas (una forma de atencion lineal con estado recurrente) intercaladas con 8 capas de atencion completa con compuertas. Esta combinacion hace que solo las 8 capas de atencion mantengan KV cache, mientras que las capas lineales operan con un estado de tamano fijo, de modo que el uso de memoria crece de forma practicamente plana con la longitud de contexto. El modelo esta orientado a tareas agenticas: razonamiento multi-paso, llamadas a herramientas y generacion en formato XML nativo.

La conversion a LiteRT-LM conserva el export en coma flotante del modelo original y aplica dos recetas de cuantizacion: int8 dinamico sobre lineales y embedding, manteniendo en float las convoluciones, la regla delta y las 48 proyecciones de decaimiento/compuerta de GatedDeltaNet (`in_proj_a` / `in_proj_b`); y una receta mixta int4 con cuantizacion por bloques de 32 (min-max) en lineales e int8 channelwise en embedding y lm_head. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto con modo de razonamiento (thinking) activable y desactivable.
- Tool calling nativo en formato XML, disenado para integracion con agentes.
- Razonamiento multi-paso y flujos agenticos.
- Aritmetica basica y resolucion de operaciones (multiplicaciones de varios digitos verificadas en las pruebas del autor).
- Generacion y comprension de codigo (la tokenizacion de codigo se conserva identica a la del repositorio original).
- Soporte multilingue parcial: el tokenizador maneja correctamente chino, japones, coreano, arabe, hindi, thai y tamil, aunque no se detalla el rendimiento por idioma.
- Inferencia on-device en CPU y GPU (Metal en Mac, backend Android) con LiteRT-LM.

## Casos de uso

- Asistentes agenticos en movil: el modelo cabe en 2,7 GB en int4 mixta y puede ejecutarse en un smartphone de gama alta (el autor cita pruebas en Galaxy S26), gestionando conversaciones multi-turno con tool calling nativo.
- Automatizacion de tareas con herramientas en el dispositivo: el formato XML nativo de llamadas a funciones permite orquestar APIs locales (calendario, ficheros, shell) sin enviar datos a la nube.
- Razonamiento aritmetico y verificacion de calculos: util para asistentes financieros o de calculo cotidiano, con modo thinking para operaciones complejas.
- Generacion de codigo en entornos de desarrollo locales: integrable en editores o pipelines ligeros donde no se dispone de GPU de datacenter, gracias a su tamano reducido y soporte de CPU.
- Procesamiento de texto multilingue en el borde: el tokenizador corregido maneja marcas combinantes en hindi, thai, tamil y arabe con harakat, adecuado para aplicaciones de traduccion o resumen local.
- Prototipado de agentes sin infraestructura: investigadores pueden desplegar el modelo en un portatil con LiteRT-LM para validar flujos agenticos antes de escalar a modelos mayores.
- Aplicaciones de privacidad estricta: al ejecutarse integramente en el dispositivo, permite procesar datos sensibles sin salida a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor documenta pruebas de correctitud cualitativas:

| Prueba | Resultado |
|---|---|
| Seis preguntas de multiplicacion, greedy (top-k 1), thinking desactivado, CPU M4 Max (int8, version 2026-10-13) | 18/18 terminan solas con el producto correcto |
| Aritmetica (17 x 23), thinking desactivado, CPU M4 Max (int8, version 2026-10-13) | 3/3 terminan solas |
| Aritmetica (17 x 23), thinking activado, CPU M4 Max (int8, version 2026-10-13) | 2/3 cierran el razonamiento y responden; 1/3 cortada por limite de tokens |
| Seis preguntas de multiplicacion, GPU Mac (int8, version anterior) | 6/6 terminan solas con el producto correcto, en 18-19 caracteres |
| Chequeo de 8 preguntas, GPU Mac (int8, version anterior, temperatura 0) | 8/8 |

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,75 GB para el fichero int4 mixto y 4,42 GB para el int8 (tamanos decimales de fichero).
- GPU recomendadas: no se especifican modelos de datacenter; el autor prueba en GPU Metal de Mac M4 Max y en backend Android (Galaxy S26).
- Cabe en GPU consumer: si, en cualquier GPU con al menos 3-5 GB de memoria libre; tambien en CPU y en moviles de gama alta.
- Opciones de despliegue: runtime LiteRT-LM (version >= 0.15, probado en 0.17.1, 0.18.0 y nightly 0.18.0.dev20260919); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numerica; el autor reporta ejecuciones con limite de 400 tokens y 1000 tokens en CPU M4 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agents-A1-4B (LiteRT-LM) | 4B | 4096 tokens de KV cache en 8 capas | Hibrida GatedDeltaNet + atencion | Apache 2.0 | Hugging Face (litert-community) |
| InternScience/Agents-A1-4B (original) | 4B | no disponible | Hibrida Qwen3.5-4B con vision | Apache 2.0 | Hugging Face (InternScience) |
| Qwen3.5-4B (base arquitectonica) | 4B | no disponible | Hibrida GatedDeltaNet + atencion | no disponible en la informacion | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La conversion elimina la torre de vision: no procesa imagenes, solo texto.
- El presupuesto de KV cache es de 4096 tokens en las capas de atencion; contextos mas largos dependen del estado recurrente de las capas lineales y pueden degradar la calidad.
- Se han documentado defectos de cuantizacion en versiones anteriores del fichero int8 (respuestas que continuaban tras la respuesta correcta hasta el limite de tokens, o razonamientos que no cerraban). La version del 2026-10-13 corrige el problema en CPU, pero el autor recomienda usar el fichero int4 mixto en Android.
- El tokenizador de versiones anteriores al 2026-10-16 dividia incorrectamente texto con marcas combinantes (hindi, thai, tamil, arabe con harakat); debe usarse la version actualizada.
- Riesgo de alucinacion inherente a modelos de 4B; no se han publicado evaluaciones de sesgo.
- Idiomas soportados no documentados oficialmente; el rendimiento multilingue no esta cuantificado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden imponer restricciones adicionales no detalladas.
- Requiere litert-lm >= 0.15; versiones anteriores no soportan el binding de buffers de estado de la arquitectura hibrida.

## Enlaces

- Repositorio LiteRT-LM: https://huggingface.co/litert-community/Agents-A1-4B
- Modelo base: https://huggingface.co/InternScience/Agents-A1-4B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
