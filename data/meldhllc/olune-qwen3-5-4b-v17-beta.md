# MeldhLLC/Olune-Qwen3.5-4B-v17-beta

## Resumen

Olune-Qwen3.5-4B-v17-beta es un fine-tune de texto completo (no una cuantizacion del modelo original) creado por MeldhLLC sobre Qwen/Qwen3.5-4B, publicado en formato GGUF y cuantizado en Q4_K_M. El modelo se distribuye como artefacto de beta limitada para la experiencia de diario personal y reflexion filosofica en dispositivo ("on-device") de la aplicacion Olune. No es un modelo generalista: su corpus de entrenamiento esta orientado a conversaciones filosoficas y de cuestiones vitales, con un componente de ejemplos de incertidumbre calibrada.

El artefacto pesa 2.783.446.496 bytes (2,8 GB) y contiene 4.326.350.848 parametros en 441 tensores de un GGUF v3 con arquitectura declarada `qwen35`. El GGUF anuncia 262.144 tokens de contexto, pero las pruebas reportadas por el autor en un Pixel 10a se limitaron a 4.096 tokens, por lo que el contexto largo no esta validado. El entrenamiento consistio en un adaptador LoRA de rango 16 en BF16 sobre un corpus congelado de 4.713 ejemplos (mas 370 de evaluacion), durante dos epocas y 590 pasos, posteriormente fusionado a pesos de 16 bits y cuantizado por Unsloth.

Su relevancia actual es acotada y experimental: sirve como caso de estudio de fine-tuning de nicho sobre un modelo base pequeno, de evaluacion de degradacion por cuantizacion (Q2_K a Q5_K_M) en hardware movil y de construccion de productos de reflexion asistida con salvaguardas a nivel de aplicacion. El autor advierte explicitamente que el fichero GGUF no incorpora las protecciones de la aplicacion (pausa ante crisis, recursos mostrados al usuario, filtros de salida) y que el modelo no debe usarse para intervencion en crisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada de Qwen/Qwen3.5-4B (identificador GGUF `qwen35`, 441 tensores); tipo exacto no detallado en la informacion disponible |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens anunciados en el GGUF; 4.096 tokens usados en las pruebas de Olune (el contexto mayor no fue validado) |
| Tipos de cuantizacion | Q4_K_M (artefacto publicado, `general.file_type=15`); se mencionan tambien Q2_K, Q3_K_M y Q5_K_M en las pruebas comparativas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF v3 (fichero `Qwen3.5-4B.Q4_K_M.gguf`); los pesos fusionados se generaron en 16 bits antes de la conversion |
| Tamano del repositorio | 2,8 GB |
| Revision upstream fijada | `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` (Qwen/Qwen3.5-4B) |
| Fecha de entrenamiento/exportacion | 13 de septiembre de 2026 |
| SHA-256 del fichero | `934480d34aae5304a5b0c05b2a5762c430a81041877875d32a811e626b61f720` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B en una revision concreta y congelada. Sobre esa base se entreno un adaptador LoRA de rango 16 en BF16 con un corpus de texto congelado de la version v17 de Olune: 4.713 ejemplos de entrenamiento y 370 de evaluacion, dos epocas y 590 pasos. El adaptador se fusiono en pesos de 16 bits, se convirtio a GGUF y se cuantizo a Q4_K_M con Unsloth. El resultado, por tanto, contiene el entrenamiento especifico de Olune y no equivale a una cuantizacion estandar del modelo original.

Segun los registros del proyecto citados en la model card, el corpus combina un conjunto sintetico fundacional de conversaciones filosoficas y de cuestiones vitales, anadidos y ediciones posteriores para Olune, y 200 ejemplos de incertidumbre calibrada. No se distribuyen ni el adaptador ni el checkpoint fusionado, ni el corpus como dataset; los registros de origen y revision se conservan de forma privada y el fichero de entrenamiento congelado no incluye campos de origen o permiso por registro. El autor no afirma que cada respuesta o premisa factica este verificada de forma independiente. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles orientada a reflexion filosofica y cuestiones vitales.
- Respuestas de acompanamiento reflexivo en formato de diario personal, con un modo de respuesta calibrado en incertidumbre gracias a los 200 ejemplos especificos del corpus.
- Conversacion multiturno bajo la plantilla de chat de Qwen3.5 (el autor advierte que otras plantillas, prompts y ajustes de muestreo no han pasado sus pruebas).
- Soporte multimodal: no se reclama. Aunque el modelo base Qwen3.5 admite otras modalidades, tanto el entrenamiento de Olune como la evaluacion del GGUF fueron exclusivamente de texto.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles; no se ha realizado una evaluacion amplia de idiomas.
- Modo "thinking" u otras capacidades especiales: no documentadas.

## Casos de uso

- Diario reflexivo en dispositivo: integrado en una aplicacion movil mediante llama.cpp u otro runtime GGUF, el modelo genera preguntas y respuestas de reflexion personal sin enviar datos a la nube, aprovechando que el fichero Q4_K_M ocupa 2,8 GB y cabe en un telefono de gama alta.
- Prototipado de fine-tunes de nicho: sirve como referencia de como un LoRA de rango 16 sobre un modelo de 4B puede especializar el comportamiento conversacional hacia un dominio concreto con menos de 5.000 ejemplos.
- Estudio de degradacion por cuantizacion: los cuatro niveles comparados (Q2_K, Q3_K_M, Q4_K_M, Q5_K_M) permiten analizar como la cuantizacion afecta a repeticion, atribucion de citas y errores de contenido filosofico en un mismo modelo.
- Investigacion sobre calibracion de incertidumbre: los 200 ejemplos de incertidumbre calibrada del corpus permiten estudiar si el modelo expresa duda de forma adecuada en dominios sin respuesta verificable.
- Evaluacion de latencia en hardware movil: el modelo es un banco de pruebas para medir prefill y decodificacion en NPU/CPU de telefono (16,201 tokens/s de prefill y 1,477 tokens/s de decodificacion en un Pixel 10a con Q4_K_M).
- Generacion de material de reflexion para aplicaciones de bienestar: produccion de preguntas abiertas y textos breves de acompanamiento, siempre con revision humana y sin funciones terapeuticas ni de crisis.
- Pruebas de seguridad y alineacion en entornos controlados: el autor documento fallos en comprobaciones de crisis inminente, lo que lo convierte en un caso util para estudiar donde fallan las salvaguardas de aplicacion frente a las del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos publicados son mediciones de despliegue en dispositivo, no comparables a benchmarks academicos:

| Prueba | Condiciones | Resultado |
|---|---|---|
| Comparativa headless de 7 prompts, 64 tokens | Pixel 10a, GGUF Q4_K_M | 81,212 s de tiempo de pared mediano; 16,201 tokens/s de prefill; 1,477 tokens/s de decodificacion |
| Comparativa de cuantizaciones (Q2_K, Q3_K_M, Q4_K_M, Q5_K_M) | Mismas condiciones | Q2_K entro en bucles repetitivos; Q3_K_M y Q5_K_M mantuvieron errores observados de atribucion o de contenido filosofico |
| Comparativa de un solo arranque en frio, 64 tokens | Pixel 10a, Q4_K_M frente a Olune Qwen3-8B Q4 | El 4B Q4 fue mas rapido que el 8B Q4 en ese dispositivo |
| Comprobacion de respuesta natural, 10 casos | No especificado | 7 de 10 completados superaron los dos minutos (rango observado de 89 a 288,6 s); se observaron defectos de repeticion, atribucion, exactitud y modo de respuesta |
| Comprobacion de crisis inminente, 3 casos | Arranque en frio | Las tres respuestas mostradas por la ruta de aplicacion contenian contenido personalizado inseguro |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero Q4_K_M ocupa 2,78 GB, por lo que se necesita aproximadamente ese espacio mas la cache KV correspondiente al contexto configurado. El autor no publica cifras de VRAM; con 4.096 tokens de contexto cabe con holgura en dispositivos con 4-6 GB de memoria disponible.
- Despliegue en movil: las pruebas documentadas se hicieron en un Google Pixel 10a con los GGUF Q2_K, Q3_K_M, Q4_K_M y Q5_K_M.
- GPU de escritorio: no se han publicado pruebas en A100, H100, RTX 4090 u otras GPU en la informacion disponible.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del fichero, pero no esta validado por el autor; la unica plataforma evaluada es un telefono.
- Opciones de despliegue: cualquier runtime compatible con GGUF v3 (llama.cpp, Ollama, LM Studio y equivalentes). El soporte en vLLM o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: en el unico escenario medido (Pixel 10a, Q4_K_M, 7 prompts de 64 tokens) el tiempo de pared mediano fue de 81,212 s, con 16,201 tokens/s de prefill y 1,477 tokens/s de decodificacion. En la comprobacion de respuesta natural, 7 de 10 generaciones superaron los dos minutos (rango de 89 a 288,6 s).
- Almacenamiento: 2,8 GB para el repositorio, con el fichero unico de 2.783.446.496 bytes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado | Notas |
|---|---|---|---|---|---|---|
| Olune-Qwen3.5-4B-v17-beta | 4.326.350.848 | 262.144 anunciados; 4.096 validados en pruebas | Apache-2.0 | GGUF v3 (Q4_K_M) | Sin benchmarks estandar; mediciones en Pixel 10a | Fine-tune LoRA r-16 orientado a reflexion filosofica; beta limitada |
| Qwen/Qwen3.5-4B (base) | No disponible en la informacion proporcionada | No disponible | Apache-2.0 | No disponible | No disponible | Modelo original de Qwen (Alibaba Cloud); admite otras modalidades ademas de texto |
| Olune Qwen3-8B (version anterior de Olune) | No disponible | No disponible | No disponible | GGUF Q4 | En la comparativa de un arranque en frio, mas lento que el 4B Q4 en Pixel 10a | Referencia interna citada por el autor para comparar latencia |

No se dispone de datos suficientes en la informacion proporcionada para comparar con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental de beta limitada: no es terapeuta, servicio de crisis, herramienta medica ni fuente garantizada de exactitud factica o filosofica.
- Seguridad: en una comprobacion de crisis inminente con tres casos, las tres respuestas de la ruta de aplicacion contenian contenido personalizado inseguro. El modelo no debe usarse para intervencion en crisis.
- Las salvaguardas de Olune (pausa por defecto ante prompts detectados como crisis, presentacion de recursos, filtros de salida) son comportamiento de la aplicacion y no estan embebidas en el GGUF. Descargar y ejecutar el fichero sin esa capa no reproduce ninguna proteccion.
- Riesgo de repeticion: la cuantizacion Q2_K entro en bucles repetitivos; en la comprobacion de respuesta natural se observaron tambien defectos de repeticion.
- Errores de atribucion y de contenido filosofico: observados en Q3_K_M y Q5_K_M, y en la comprobacion de respuesta natural.
- Riesgo de alucinacion: el propio autor declara que no se verifica de forma independiente cada respuesta ni cada premisa factica.
- Latencia alta en el escenario medido: 81,212 s de mediana para 7 prompts cortos y mas de dos minutos en 7 de 10 generaciones de respuesta natural.
- Contexto largo no validado: aunque el GGUF anuncia 262.144 tokens, las pruebas de Olune usaron 4.096 tokens.
- Idioma: solo ingles; no se ha realizado una evaluacion amplia de idiomas.
- Entorno no validado: otras plantillas de chat, prompts, ajustes de muestreo, dispositivos y contextos mas largos no han sido aceptados por las pruebas de Olune.
- Corpus sin trazabilidad por registro: el fichero de entrenamiento congelado no incluye campos de origen o permiso por registro, y los registros de revision se conservan en privado.
- Licencia: Apache-2.0, lo que permite uso comercial, pero no implica respaldo de Qwen ni de Alibaba Cloud (ver `NOTICE` de Meldh para los cambios: LoRA v17, fusion a 16 bits, conversion a GGUF y cuantizacion Q4_K_M).
- Identidad del repositorio: el autor indica que la identidad del repositorio y la revision inmutable alojada solo quedan establecidas tras la publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MeldhLLC/Olune-Qwen3.5-4B-v17-beta
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Fichero de sumas de verificacion: https://huggingface.co/MeldhLLC/Olune-Qwen3.5-4B-v17-beta/blob/main/SHA256SUMS
- Manifiesto del artefacto: https://huggingface.co/MeldhLLC/Olune-Qwen3.5-4B-v17-beta/blob/main/artifact-manifest.json
- Licencia: https://huggingface.co/MeldhLLC/Olune-Qwen3.5-4B-v17-beta/blob/main/LICENSE
- Aviso de atribucion de Meldh: https://huggingface.co/MeldhLLC/Olune-Qwen3.5-4B-v17-beta/blob/main/NOTICE
- Paper tecnico de Qwen3.5-4B y blog oficial: no disponible en la informacion proporcionada.
- Repositorio de Unsloth (herramienta de cuantizacion citada): no se proporciona enlace en la informacion disponible.
