# DICPlay/RusMind-Vspyshka

## Resumen

RusMind Vspyshka (Вспышка, "destello" en ruso) es un modelo de lenguaje de 7.518.069.290 parámetros desarrollado por DICPlay, un fine-tune del modelo base google/gemma-4-E4B-it orientado al idioma ruso y al despliegue en dispositivo (on-device) sin conexión a internet. Se distribuye exclusivamente en formato GGUF para su uso con llama.cpp, LM Studio y Ollama, y está diseñado para ejecutarse en ordenadores de sobremesa potentes y teléfonos de gama alta. La versión destacada, 4.7, se publicó el 29 de octubre de 2026.

El modelo se posiciona como una alternativa compacta para tareas en ruso, con especial énfasis en corrección ortográfica y de puntuación, razonamiento, conocimiento cultural y geográfico de Rusia, y comprensión de matices humanos. Según la model card, ocupa el segundo puesto entre todos los modelos de hasta 10.000 millones de parámetros en el benchmark independiente MERA v2, con una puntuación global de 0,191, solo por detrás de otro modelo de la misma familia (RusMind Sokol 4.7).

La relevancia actual del modelo radica en su relación tamaño-rendimiento: con 7,5 mil millones de parámetros supera en MERA v2 a modelos como Qwen3.5-9B, Gemma 4 E4B, T-lite o A-Vibe, y en tareas concretas se acerca a modelos de 24.000 y 32.000 millones de parámetros. Su licencia propietaria (rusmind-license) y su enfoque en inferencia local offline lo sitúan en un nicho distinto al de los grandes modelos en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de google/gemma-4-E4B-it; sin detalle en la model card) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mini (3,8 GB), Lite (4,2 GB), Q4_K_M (5,3 GB), Q8_0 (8,0 GB); Q2_K–Q6_K y BF16 (15,1 GB) en el repo RusMind-Vspyshka-4.7 |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | rusmind-license (propietaria, etiquetada como "other") |
| Formato de pesos | GGUF (libreria gguf); BF16 disponible en la version 4.5 y en el repo de cuantizaciones 4.7 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la model card. Se trata de un fine-tune (base_model_relation: finetune) del modelo google/gemma-4-E4B-it, por lo que hereda la arquitectura del transformer de Gemma 4. El numero de parametros reportado (7.518.069.290) corresponde a los pesos en safetensors del modelo base. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

La model card menciona que el modelo esta optimizado para ejecucion local en dispositivo y sin conexion, y que se distribuye en cuantizaciones que van desde 3,8 GB (Mini) hasta 15,1 GB (BF16). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito en esta variante (el modo de razonamiento se atribuye a la version Sokol 4.7, no a Vspyshka).

## Capacidades

- Generacion de texto conversacional en ruso e ingles.
- Correccion de ortografia y puntuacion: puntuacion de 0,719 en MERA v2 (SAGE), con 0,760 en signos de puntuacion.
- Razonamiento y logica: 0,385 en MERA v2 (razonamiento) y 0,330 en NewReasoning.
- Conocimiento de cultura y regiones de Rusia: 0,228 en MERA v2.
- Comprension de tareas centradas en personas: 0,257 en MERA v2.
- Respuestas en personaje (role-play): 0,537 en Characters.
- Reconocimiento de relaciones semanticas y antonimos: 0,465 en LIMUR y 0,373 en Enantiosemy.
- Preguntas de opcion multiple: 0,328 en RUBIN.
- Soporte de tool calling / function calling: 0,302 en GorillaHard, con seleccion correcta de herramienta en el 86 % de los casos y 100 % de robustez frente a inyeccion de instrucciones.
- Seguimiento de instrucciones complejas: 0,300 en IFHard.
- Comprension del humor: 0,196 en Humor.
- Capacidades multilingues limitadas a ruso e ingles.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito en esta variante.

## Casos de uso

- Correccion ortografica y de puntuacion en produccion editorial: con 0,719 en SAGE y 0,760 en puntuacion, el modelo puede integrarse en un pipeline de revision de textos rusos para detectar y corregir errores antes de publicacion, ejecutandose localmente sin enviar contenido a terceros.
- Asistente de escritura offline en dispositivos: al distribuirse en cuantizaciones desde 3,8 GB, puede desplegarse en portatiles y telefonos de gama alta para ayudar a redactar, resumir y reescribir textos en ruso sin conexion.
- Atencion al cliente en ruso: su puntuacion de 0,257 en tareas centradas en personas y su capacidad conversacional multi-turno lo hacen adecuado para chatbots de soporte en empresas que operan en Rusia y requieren inferencia local por motivos de privacidad.
- Generacion de codigo asistida con tool calling: con 0,302 en GorillaHard y 86 % de seleccion correcta de herramienta, puede integrarse en entornos de desarrollo para invocar funciones, consultar APIs o ejecutar comandos en flujos de CI/CD.
- Educacion y tutoria: su rendimiento en razonamiento (0,385) y en preguntas de opcion multiple (0,328) permite usarlo como tutor que explica conceptos, resuelve ejercicios y responde preguntas de estudio en ruso.
- Role-play y generacion de personajes: con 0,537 en Characters, es util para videojuegos, narrativa interactiva y aplicaciones de entretenimiento que requieren respuestas coherentes con un personaje definido.
- Procesamiento de documentos y extraccion de relaciones semanticas: sus puntuaciones en LIMUR (0,465) y Enantiosemy (0,373) lo hacen apto para tareas de analisis de texto, desambiguacion y organizacion de informacion en corpus rusos.
- Despliegue en entornos con requisitos de soberania de datos: al ser offline y con licencia propia, encaja en organizaciones que no pueden usar APIs en la nube por normativa.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark MERA v2 (octubre de 2026) y los publica el propio autor del modelo en su model card.

| Benchmark MERA v2 | RusMind Vspyshka (7,5 mM) | Qwen3.5-9B (9 mM) | Gemma 4 E4B (8 mM) | T-lite (8 mM) | A-Vibe (8 mM) |
|---|---|---|---|---|---|
| Puntuacion global | 0,191 | 0,186 | 0,170 | 0,130 | 0,113 |
| Razonamiento | 0,385 | 0,339 | 0,367 | 0,218 | 0,187 |
| Tareas centradas en personas | 0,257 | 0,218 | 0,172 | 0,169 | 0,132 |
| Cultura y regiones de Rusia | 0,228 | 0,118 | 0,199 | 0,196 | 0,171 |

| Benchmark MERA v2 | RusMind Vspyshka (7,5 mM) | RuadaptQwen3-32B (32 mM) | Zero-Mistral (24 mM) |
|---|---|---|---|
| Puntuacion global | 0,191 | 0,163 | 0,160 |
| Razonamiento | 0,385 | 0,342 | 0,213 |
| Tareas centradas en personas | 0,257 | 0,177 | 0,235 |

| Tarea MERA v2 | Puntuacion |
|---|---|
| Correccion ortografica y de puntuacion (SAGE) | 0,719 |
| Respuestas en personaje (Characters) | 0,537 |
| Relacion de palabra en texto (LIMUR) | 0,465 |
| Antonimos (Enantiosemy) | 0,373 |
| Logica y razonamiento (NewReasoning) | 0,330 |
| Preguntas de opcion multiple (RUBIN) | 0,328 |
| Tool calling (GorillaHard) | 0,302 |
| Instrucciones complejas (IFHard) | 0,300 |
| Humor | 0,196 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otros benchmarks estandar fuera de MERA v2.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB con cuantizacion Mini (3,8 GB), 4,5 GB con Lite (4,2 GB), 5,5-6 GB con Q4_K_M (5,3 GB) y 8,5-9 GB con Q8_0 (8,0 GB), asumiendo margen para el contexto y el runtime.
- GPU recomendadas: tarjetas consumer con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070) para Q4_K_M; 12 GB o mas (RTX 4070 Ti, RTX 4080) para Q8_0; A100 o H100 no son necesarias para este tamano, pero pueden usarse para servir multiples instancias.
- Cabe en GPU consumer: si, en cualquier GPU con 8 GB o mas de VRAM para las cuantizaciones Mini, Lite y Q4_K_M; Q8_0 requiere unos 10 GB.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (segun la model card) y cualquier runtime compatible con GGUF; los tags indican compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MERA v2 global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Vspyshka 4.7 | 7,5 mM | no disponible | 0,191 | rusmind-license (propietaria) | GGUF en Hugging Face |
| Qwen3.5-9B (Alibaba) | 9 mM | no disponible | 0,186 | no disponible | no disponible |
| Gemma 4 E4B (Google) | 8 mM | no disponible | 0,170 | no disponible | no disponible |
| T-lite (T-Bank) | 8 mM | no disponible | 0,130 | no disponible | no disponible |
| A-Vibe (Avito) | 8 mM | no disponible | 0,113 | no disponible | no disponible |

En la comparativa con modelos de mayor tamano, Vspyshka (0,191) supera a RuadaptQwen3-32B (0,163) y Zero-Mistral (0,160) en la puntuacion global de MERA v2, aunque en tareas centradas en personas Zero-Mistral (0,235) se acerca a Vspyshka (0,257). No se dispone de datos de contexto ni de licencia para los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al estar entrenado especificamente para ruso, puede presentar sesgos culturales y geograficos hacia Rusia.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de tasas de alucinacion; como modelo de 7,5 mM, es esperable un riesgo mayor que en modelos de mayor tamano en tareas de conocimiento factual.
- Limitaciones de contexto: la longitud de contexto no esta disponible, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Limitaciones de idioma: solo ruso e ingles; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Restricciones de licencia: la licencia rusmind-license es propietaria y etiquetada como "other"; es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que no se detallan en la informacion disponible las condiciones exactas.
- Caveat para produccion: el modelo se distribuye principalmente en GGUF y esta pensado para inferencia local; el repo ocupa 127,7 GB, por lo que conviene descargar solo la cuantizacion necesaria. La variante 4.5 solo ofrece BF16 (15,1 GB) y las versiones comprimidas de esa version se anuncian como pendientes.
- El modelo base es google/gemma-4-E4B-it, sujeto a las condiciones de uso de Google; la licencia final del fine-tune puede imponer restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Repositorio de cuantizaciones 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo RusMind Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Demo en linea: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Carpeta de la version 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka/tree/main/v4.7
- Carpeta de la version 4.5: https://huggingface.co/DICPlay/RusMind-Vspyshka/tree/main/v4.5
- Carpeta de la version 3.5: https://huggingface.co/DICPlay/RusMind-Vspyshka/tree/main/v3.5
