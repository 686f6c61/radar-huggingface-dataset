# NagaYu/mondegreen

## Resumen

Mondegreen es un sistema de corrección de errores de transcripción ASR (reconocimiento automático del habla) para japonés, desarrollado por NagaYu. El problema que resuelve es el de los términos fuera de vocabulario (nombres de personas, productos, jerga de equipo) que Whisper y otros modelos ASR no reconocen correctamente, y que no caben en el prompt de 244 tokens de Whisper. En lugar de intentar inyectar un glosario en el prompt, Mondegreen aplica una corrección posterior local, basada en un índice fonético que restringe las sustituciones a un conjunto finito de candidatos legales derivados del glosario del usuario.

El sistema combina un índice fonético con restricciones duras (no aprendidas) y un adaptador LoRA basado en Qwen2.5-0.5B que solo reordena los candidatos ya dentro del conjunto legal. El componente crítico es `gate.json`, una regresión logística calibrada sobre 18 características de los spans que decide si una corrección procede o no. El modelo está diseñado para ejecutarse completamente en local, sin llamadas de red, con un consumo de memoria de 196 MB y un rendimiento de 464 caracteres por segundo en un Apple M2. La licencia es Apache-2.0 y el idioma soportado es únicamente japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-0.5B (adaptador LoRA) + índice fonético con restricciones duras |
| Parametros totales | 0.5B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa spans cortos, no texto completo) |
| Tipos de cuantizacion | 4-bit (GGUF Q4_K_M) |
| Idiomas soportados | Japones (exclusivamente) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (modelo cuantizado) |

## Arquitectura y entrenamiento

Mondegreen no es un modelo de lenguaje generativo convencional. Su arquitectura es hibrida: un índice fonético (`PhoneticIndex`) calcula el conjunto legal de reemplazos para cada span de texto, aplicando cinco restricciones duras: distancia fonética normalizada ≤ 0.28, distancia absoluta ≤ 0.25 + 0.20·√mora, diferencia de conteo de moras ≤ 34%, requisito de homofonia casi exacta para palabras de diccionario comun, y una guarda de contencion para evitar eliminar honorificos. Estas restricciones se evaluan antes de que se ejecute cualquier modelo.

El adaptador LoRA (basado en Qwen2.5-0.5B) solo reordena los candidatos que ya estan dentro del conjunto legal. No puede anadir terminos nuevos, ni reescribir gramatica, ni salirse del glosario. En glosarios sinteticos, solo alrededor del 1% de los spans tienen mas de un candidato legal, por lo que el LM rara vez se consulta. El entrenamiento es completamente sintetico: los glosarios se generan con `GlossaryBuilder`, las frases portadoras con `SentenceFactory`, y los errores con un modelo de corrupcion fonetica que perturba la lectura y la re-renderiza como kanji homofono. No se usan audio real, nombres reales ni evaluacion con LLM.

El componente `gate.json` es una regresion logistica calibrada sobre 18 caracteristicas interpretables de los spans, con AUC 0.985, ECE 0.053 y umbral 0.82. Su funcion es decir "no" a correcciones arriesgadas.

## Capacidades

- Correccion de errores ASR en japones mediante sustitucion de spans basada en glosario privado.
- Restriccion dura fonetica: las sustituciones solo pueden provenir del glosario del usuario, nunca de inventar terminos.
- Reordenamiento de candidatos con LM cuantizado a 4-bit (Q4_K_M) cuando hay mas de una opcion legal.
- Ejecucion completamente local, sin llamadas de red, apta para audio confidencial.
- Modo CLI con explicacion de cada edicion (`mondegreen explain`).
- API Python integrable en pipelines ASR existentes.
- Soporte de glosarios de hasta 10.000 terminos con aceleracion por n-gramas (recall del 99.67% vs. busqueda exhaustiva).
- Cuantizacion segura: eliminar el LM por completo cuesta menos de 2 puntos de recall, segun `tests/test_quantization.py`.

## Casos de uso

- Transcripcion de reuniones internas confidenciales: el sistema corrige nombres de colegas y jerga de equipo sin que el audio o la transcripcion salgan de la maquina, gracias a su ejecucion local sin red y su memoria de 196 MB.
- Correccion de actas medicas o legales: glosarios con terminologia especializada se aplican como restricciones duras, evitando que el modelo invente terminos que no estan en el glosario.
- Post-procesado de transcripciones de Whisper en produccion: se integra como un paso posterior que recibe el texto de Whisper y devuelve la version corregida, con una tasa de dano de 0.00009 frente al 0.00657 de un LLM en la nube.
- Asistentes de voz para dominios especificos (productos, nombres de marca): el glosario se compila como restriccion fonetica, de modo que el asistente pronuncia y escribe correctamente los nombres propios de la empresa.
- Archivado y busqueda de transcripciones: al corregir terminos del glosario, se mejora la indexacion y recuperacion de documentos transcritos, reduciendo el WER de 0.2541 a 0.1217 en la evaluacion publicada.
- Despliegue en dispositivos con recursos limitados: con 196 MB de pico de memoria y soporte de cuantizacion GGUF, puede ejecutarse en portatiles, mini-PCs o dispositivos edge sin GPU dedicada.

## Benchmarks y rendimiento

La evaluacion publicada usa 400 frases reservadas, un glosario de 10.000 terminos, y un glosario de evaluacion disjunto del de entrenamiento tanto por superficie como por lectura. Los numeros de las condiciones (B) y (C) son simulados, no medidos con Whisper real.

| Condicion | CER | WER | Recall de terminos | Tasa de dano |
|---|---:|---:|---:|---:|
| (A) Whisper crudo | 0.2842 | 0.2541 | 25.3% | 0.00000 |
| (B) Whisper con `initial_prompt` | 0.2796 | 0.2509 | 27.2% | 0.00009 |
| (C) LLM en la nube post-procesado | 0.0893 | 0.0944 | 83.0% | 0.00657 |
| (D) Mondegreen | 0.1105 | 0.1217 | 66.3% | 0.00009 |
| (E) Mondegreen cuantizado | 0.1105 | 0.1217 | 66.3% | 0.00009 |

| Metrica | Valor |
|---|---|
| Rendimiento | 464 caracteres/segundo (glosario de 10.000 terminos) |
| 1 hora de transcripcion | 45 segundos |
| Pico de memoria | 196 MB |
| Maquina de prueba | Apple M2, 16.0 GB |
| Red | ninguna |

El hallazgo principal es que el LLM en la nube gana en recall de terminos (83.0% vs 66.3%) pero hace 73 veces mas dano (0.00657 vs 0.00009), ademas de requerir que la transcripcion salga de la maquina.

## Requisitos de hardware

- VRAM estimada: 196 MB de pico de memoria en Apple M2 con el modelo cuantizado a 4-bit; cabe en cualquier hardware moderno.
- GPU recomendadas: no requiere GPU; funciona en CPU (probado en Apple M2). Con GPU, el rendimiento seria superior.
- Compatibilidad con GPU de consumo: si, cualquier GPU con mas de 1 GB de VRAM es suficiente; tambien funciona sin GPU.
- Opciones de despliegue: paquete Python (`pip install git+https://github.com/NagaYu/mondegreen`), CLI, API Python. El adaptador LoRA usa transformers; el modelo cuantizado usa GGUF (compatible con llama.cpp y derivados).
- Latencia y rendimiento: 464 caracteres/segundo con glosario de 10.000 terminos en Apple M2; 45 segundos para procesar 1 hora de transcripcion.

## Comparativa con modelos similares

| Modelo | Enfoque | Recall de terminos | Tasa de dano | Privacidad | Licencia |
|---|---|---|---|---|---|
| Mondegreen | Correccion local con restriccion fonetica dura | 66.3% | 0.00009 | Total (sin red) | Apache-2.0 |
| Whisper con `initial_prompt` | Inyeccion de glosario en el prompt | 27.2% | 0.00009 | Total (sin red) | MIT |
| LLM en la nube post-procesado | LLM generico (p.ej. GPT-4) corrige la transcripcion | 83.0% | 0.00657 | Nula (la transcripcion sale del dispositivo) | Comercial |

La comparativa se basa en los datos publicados en la model card. No se dispone de comparaciones con otros sistemas de correccion ASR locales (como VADER o NeMo) en la informacion disponible.

## Limitaciones y advertencias

- Solo japones: la tabla de moras, los costes de confusion y las reglas de POS son especificos del japones. No funciona en otros idiomas.
- Dependencia de `fugashi`/`pyopenjtalk`: sin estas librerias, se usa una tabla de respaldo de 4.030 kanjis sin informacion de POS, lo que impide que la proteccion de palabras comunes funcione y eleva la tasa de dano. Se recomienda instalar `mondegreen[g2p]`.
- El acelerador de candidatos por n-gramas no es exacto (99.67% de recall vs. busqueda exhaustiva con 10.000 terminos). Los fallos solo causan correcciones omitidas, nunca ilegales, porque el limite se re-verifica en cada candidato puntuado.
- La evaluacion se realizo con glosarios sinteticos y errores ASR simulados, no con audio real. Los numeros de las condiciones (B) y (C) son simulados, no medidos.
- Riesgo de alucinacion: el sistema no puede inventar terminos fuera del glosario, pero si puede aplicar una correccion incorrecta si el glosario contiene terminos foneticamente ambiguos.
- Uso previsto: el glosario puede contener nombres personales. Solo debe usarse con datos bajo el control del usuario, nunca sobre actas de reuniones de terceros ni con glosarios de nombres sin relacion con el usuario.
- El sistema maneja solo texto, nunca audio directamente, y no realiza llamadas de red.

## Enlaces

- Modelo: https://huggingface.co/NagaYu/mondegreen
- Repositorio: https://github.com/NagaYu/mondegreen
- Space de demostracion: https://huggingface.co/spaces/NagaYu/mondegreen
- Dataset de errores ASR: https://huggingface.co/datasets/NagaYu/mondegreen-asr-errors
- Perfil del autor: https://huggingface.co/NagaYu
- Proyecto relacionado (Llama-Nexus): https://github.com/NagaYu/llama-nexus
- Proyecto relacionado (Customs): https://github.com/NagaYu/customs
