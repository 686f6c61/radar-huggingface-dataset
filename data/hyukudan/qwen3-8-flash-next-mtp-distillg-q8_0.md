# hyukudan/Qwen3.8-Flash-Next-MTP-distillG-Q8_0

## Resumen

Qwen3.8-Flash-Next-MTP-distillG-Q8_0 es una cabeza de borrador (draft head) de predicción multi-token (MTP) destilada para el modelo Qwen3.8-Flash-Next, publicada en formato GGUF con cuantización Q8_0 por el usuario hyukudan. No es un modelo autónomo: se utiliza junto al modelo objetivo (target) `UD-Q4_K_XL` de Qwen3.8-Flash-Next dentro del motor de inferencia strix-halo-engine-lab, donde la cabeza propone tokens candidatos y el modelo objetivo verifica cada uno de ellos. El resultado es una decodificación especulativa exacta: los tokens generados son idénticos a los de la decodificación plana, pero el rendimiento de decodificación mejora de forma sustancial.

La cabeza tiene 2.607.150.848 parámetros (2,8 GB en Q8_0) y mantiene el mismo diseño y disposición de tensores que la cabeza MTP base publicada con el GGUF original de Qwen, pero se ha reentrenado mediante destilación contra el objetivo `UD-Q4_K_XL`. El interés práctico es claro: según la documentación del motor, el uso de esta cabeza junto con el bundle correspondiente eleva la velocidad de decodificación de 22,1 a 73,3 tok/s tras un prompt de 1K, y de 16,9 a 62,8 tok/s tras un prompt de 8K, en un nodo AMD Strix Halo.

La relevancia actual reside en que la decodificación especulativa se ha consolidado como la técnica estándar para acelerar la inferencia de LLM sin degradar la calidad, y este artefacto demuestra que una cabeza MTP destilada específicamente contra un objetivo cuantizado concreto puede aportar una mejora adicional del 10 % sobre la cabeza base. La licencia es la Qwen Community License 1.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de prediccion multi-token (MTP) para decodificacion especulativa, derivada de Qwen3.8-Flash-Next |
| Parametros totales | 2.607.150.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo Qwen3.8-Flash-Next) |
| Tipos de cuantizacion | Q8_0 (unico publicado); entrenamiento con copias de borrador Q8_0 / Q4_0 |
| Idiomas soportados | en, es, de, fr, it, pt, ru, ja, zh |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 2,8 GB |
| SHA-256 del archivo | `5516d3ce407783a424315b6a2a0d8b06341665bb3541b98e5db0fe944add4c3c` |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Objetivo de entrenamiento | unsloth/Qwen3.8-Flash-Next-GGUF, revision `38bb39ee97821de2c9009abb7e93950eec396e66`, `UD-Q4_K_XL` |
| Motor compatible | strix-halo-engine-lab (unico probado) |

## Arquitectura y entrenamiento

La cabeza es una MTP (multi-token prediction) que comparte la disposicion de tensores de la cabeza MTP base distribuida con el GGUF upstream de Qwen3.8-Flash-Next, de tamano identico (2.786.568.256 bytes) pero con contenido distinto. Se emplea en un esquema de decodificacion especulativa: la cabeza propone varios tokens candidatos (hasta profundidad 7 en cadena) y el modelo objetivo verifica cada uno, garantizando que la salida sea identica a la decodificacion plana.

El entrenamiento consistio en destilar la cabeza contra el objetivo `UD-Q4_K_XL`. Las etiquetas de entrenamiento fueron las propias distribuciones de siguiente token del modelo objetivo (top-32 log-probabilidades) y sus estados ocultos finales, registrados en ejecuciones teacher-forced del objetivo cuantizado. El entrenamiento atravesó la ruta cuantizada del borrador del motor (straight-through sobre las copias Q8_0 / Q4_0) con borradores encadenados hasta profundidad 7. Se realizaron dos rondas: la segunda continuo la primera durante 8.000 pasos sobre datos ampliados con un curriculum de profundidad. Solo los tensores entrenados se recodificaron a Q8_0; la cabecera GGUF y el resto de tensores son los de la cabeza base.

Los datos de entrenamiento comprenden aproximadamente 2,3 M de tokens de articulos de Wikipedia en nueve idiomas (es, en, de, fr, it, pt, ru, ja, zh) y archivos de codigo abierto, mas respuestas generadas por el propio objetivo a partir de pasajes de Wikipedia (articulos, explicaciones, resumenes, traducciones), transcripciones de agentes y explicaciones de codigo abierto (unos 0,47 M de tokens en la primera ronda y 2.409 respuestas en la segunda). Aproximadamente dos tercios son ingles y espanol, y cerca de un quinto es codigo. La evaluacion se realizo con 141 prompts reservados sobre temas no vistos.

## Capacidades

- Decodificacion especulativa exacta: propone tokens candidatos que el objetivo verifica, sin alterar la calidad de la salida.
- Aceleracion de decodificacion en el motor strix-halo-engine-lab: de 22,1 a 73,3 tok/s tras prompt de 1K y de 16,9 a 62,8 tok/s tras prompt de 8K.
- Mejora del 10,0 % en decodificacion (media geometrica sobre 8 cargas de trabajo, 256 tokens) frente a la cabeza MTP base.
- Mejora del 14-15 % en prosa en ingles y espanol frente a la cabeza base.
- Soporte multilingue en nueve idiomas (en, es, de, fr, it, pt, ru, ja, zh), con mayor cobertura en ingles y espanol.
- Trabajo sobre codigo: aproximadamente un quinto de los datos de entrenamiento son archivos de codigo abierto.
- Integracion con agentes: parte de los datos de entrenamiento son transcripciones de agentes.
- No es un modelo autonomo: no genera respuestas por si misma, solo acelera el objetivo.

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar la cabeza junto al objetivo `UD-Q4_K_XL` en strix-halo-engine-lab para triplicar el throughput de decodificacion (de 22,1 a 73,3 tok/s) sin cambiar los tokens generados, lo que reduce coste y latencia en servicios de generacion de texto.
- Servidores de chat con contexto largo: con prompts de 8K la decodificacion pasa de 16,9 a 62,8 tok/s, adecuado para asistentes conversacionales multi-turno que mantienen historiales extensos.
- Generacion de codigo asistida: al entrenarse con codigo abierto y transcripciones de agentes, la cabeza mantiene una alta tasa de aceptacion en tareas de autocompletado y generacion de codigo, acelerando pipelines de CI/CD que invocan al modelo.
- Traduccion y procesamiento multilingue: con datos en nueve idiomas, acelera tareas de traduccion (especialmente en/es) y resumen de documentos sin modificar la salida del objetivo.
- Agentes autonomos y razonamiento multi-paso: las transcripciones de agentes en el entrenamiento permiten acelerar bucles de tool calling y planificacion donde el modelo objetivo genera muchos tokens secuenciales.
- Despliegue en hardware consumer de gama alta: un nodo AMD Strix Halo con 128 GB puede ejecutar el objetivo cuantizado y esta cabeza, ofreciendo velocidades de decodificacion cercanas a las de GPU dedicadas en un equipo integrado.
- Evaluacion e investigacion en decodificacion especulativa: sirve como referencia reproducible para estudiar el impacto de la destilacion de cabezas MTP contra objetivos cuantizados concretos.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del motor en un nodo AMD Strix Halo (`gfx1151`, 128 GB), mismo binario, decodificacion greedy y tokens identicos en ambas ramas.

| Medicion | Decodificacion plana (`--no-mtp`) | Con esta cabeza y bundle | Mejora |
|---|---|---|---|
| Prompt 1K, 300 tokens | 22,1 tok/s | 73,3 tok/s | 3,3x |
| Prompt 1K, 1.200 tokens | no disponible | 81,3 tok/s | no disponible |
| Prompt 8K, 300 tokens | 16,9 tok/s | 62,8 tok/s | 3,7x |
| Esta cabeza vs cabeza MTP base (8 cargas, 256 tokens) | cabeza base | +10,0 % (media geometrica) | +10,0 % |
| Prosa en ingles y espanol vs cabeza base | cabeza base | +14-15 % | +14-15 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que la cabeza no altera la calidad de salida del objetivo.

## Requisitos de hardware

- VRAM/RAM estimada para la cabeza: 2,8 GB en Q8_0, adicionales a los del modelo objetivo `UD-Q4_K_XL`.
- Hardware de referencia probado: nodo AMD Strix Halo (`gfx1151`) con 128 GB de memoria unificada.
- GPU recomendadas: no disponible; solo se ha probado en el motor strix-halo-engine-lab sobre Strix Halo.
- Cabe en GPU consumer: no confirmado; el modelo objetivo cuantizado y la cabeza requieren memoria suficiente para ambos.
- Opciones de despliegue: exclusivamente strix-halo-engine-lab (comando `strix-hip-decode-token`); otros runtimes no han sido probados.
- Latencia y throughput: 73,3 tok/s tras prompt de 1K y 62,8 tok/s tras prompt de 8K en el hardware de referencia.
- Configuracion: requiere el bundle `qwen-distill-g-yarn.mtp-bundle.json`, el archivo GGUF de esta cabeza y el directorio `data/draft-vocab/`; el bundle fija el SHA-256 de la cabeza y del objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MTP-distillG-Q8_0 (esta ficha) | 2.607.150.848 | GGUF Q8_0 | Cabeza MTP destilada, +10 % vs base | qwen-community-1.0 | Hugging Face |
| Cabeza MTP base de Qwen3.8-Flash-Next (`MTP/mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf`) | mismo tamano y layout | GGUF Q8_0 | Cabeza MTP sin destilar | qwen-community-1.0 | Incluida en el GGUF upstream |
| Qwen3.8-Flash-Next (modelo objetivo) | no disponible | safetensors / GGUF | Modelo generativo completo | qwen-community-1.0 | Hugging Face (Qwen) |

La comparativa se limita a la cabeza base y al objetivo, ya que no se dispone de informacion sobre otras cabezas MTP destiladas comparables.

## Limitaciones y advertencias

- Entrenada y fijada para el objetivo `UD-Q4_K_XL` de la revision `38bb39ee97821de2c9009abb7e93950eec396e66`; con otro objetivo o cuantizacion la tasa de aceptacion no esta medida y el pin del bundle no lo admite.
- Solo verificada en strix-halo-engine-lab; otros runtimes no han sido probados.
- La ganancia depende del contenido: medida en ingles, espanol y codigo; otros idiomas tienen una cuota menor en los datos de entrenamiento.
- No es un modelo autonomo: no puede usarse sin el modelo objetivo y el motor compatibles.
- No modifica la calidad de salida; el objetivo verifica cada token. Solo afecta a la velocidad.
- No se debe renombrar la cabeza base a este nombre: el motor fija esta cabeza por SHA-256 y un archivo con hash distinto provoca decodificacion plana.
- Licencia Qwen Community License 1.0: sus condiciones se aplican a cualquier uso de la cabeza, incluido el comercial; conviene revisar el texto completo antes de desplegar.
- Riesgo de sesgos y alucinaciones: heredado del modelo objetivo Qwen3.8-Flash-Next, no de la cabeza en si.
- Sin datos publicados de benchmarks de calidad ni de latencia en otros hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyukudan/Qwen3.8-Flash-Next-MTP-distillG-Q8_0
- Modelo original Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- GGUF objetivo (unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Espejo del GGUF objetivo: https://huggingface.co/hyukudan/Qwen3.8-Flash-Next-GGUF-mirror
- Repositorio del motor strix-halo-engine-lab: https://github.com/hyukudan/strix-halo-engine-lab
- Bundle de receta MTP: https://github.com/hyukudan/strix-halo-engine-lab/blob/main/recipes/qwen-distill-g-yarn.mtp-bundle.json
- Directorio draft-vocab: https://github.com/hyukudan/strix-halo-engine-lab/tree/main/data/draft-vocab
- Documentacion de Qwen3.8 en el motor: https://github.com/hyukudan/strix-halo-engine-lab/blob/main/docs/models/qwen3.8/README.md
- MTP en linea de comandos: https://github.com/hyukudan/strix-halo-engine-lab/blob/main/docs/engine/speculative/mtp-native-cli.md
