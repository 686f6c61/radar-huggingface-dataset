# OpenDCAI/Omni-Edu-27B-GGUF

## Resumen

Omni-Edu-27B es un modelo multimodal de tipo image-text-to-text orientado al ambito educativo, desarrollado por OpenDCAI. La variante documentada aqui es una conversion a formato GGUF del modelo original `lhpku20010120/Omni-Edu-27B`, realizada con llama.cpp para permitir su ejecucion en hardware de consumo mediante cuantizacion. El modelo cuenta con 26.895.998.464 parametros totales (aproximadamente 27B) y esta etiquetado internamente como basado en la familia Qwen 3.5 (`qwen3_5`).

La relevancia de esta publicacion radica en que ofrece un modelo de gran tamano con capacidad de procesamiento de imagenes en formatos cuantizados que caben en GPUs de consumo: la version Q4_K_M ocupa 15,41 GiB y la Q6_K 20,57 GiB, lo que abre la puerta a su despliegue local sin infraestructura de centro de datos. Ademas, requiere un proyector multimodal separado (`mmproj`) para el procesamiento de imagenes.

La informacion publicada por el autor es escasa: no se detallan datos de entrenamiento, composicion del dataset, benchmarks ni idiomas soportados. La licencia figura como "other", remitiendo a los terminos del modelo original, lo que exige verificacion previa a cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Qwen 3.5 segun tags del autor; detalles no disponibles |
| Parametros totales | 26.895.998.464 (aprox. 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | BF16 (sin cuantizar), Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican los terminos del modelo original `lhpku20010120/Omni-Edu-27B`) |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal `mmproj-OmniEdu-27B-F16.gguf` |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que acepta entrada de imagen y texto y genera texto (pipeline `image-text-to-text`). Los tags del autor lo asocian a la familia Qwen 3.5, lo que sugiere una arquitectura derivada de dicha familia, aunque no se publican detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de fusion multimodal. El procesamiento de imagenes se realiza mediante un proyector multimodal independiente en formato F16, compartido por las cuatro cuantizaciones del modelo principal.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. La model card unicamente documenta el proceso de conversion y cuantizacion con llama.cpp, no el entrenamiento del modelo base. El ejemplo de ejecucion incluye el flag `--reasoning off`, lo que indica que el modelo incorpora algun modo de razonamiento desactivable, pero no se detalla su funcionamiento.

## Capacidades

- Generacion de texto conversacional a partir de entradas de texto e imagen (pipeline image-text-to-text).
- Procesamiento de imagenes mediante el proyector multimodal `mmproj-OmniEdu-27B-F16.gguf`.
- Modo de razonamiento desactivable mediante el flag `--reasoning off` en llama-server.
- Orientacion declarada al ambito educativo (tag `education`).
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`), lo que permite integrarlo en clientes como Cherry Studio apuntando a `http://127.0.0.1:8080/v1`.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion publicada.
- Idiomas soportados: no disponibles en la informacion publicada.

## Casos de uso

- Tutoria educativa local: el modelo puede desplegarse en un equipo con GPU de consumo usando la cuantizacion Q4_K_M (15,41 GiB) para ofrecer asistencia conversacional a estudiantes sin dependencia de servicios en la nube, algo relevante en entornos con requisitos de privacidad.
- Analisis de material didactico con imagenes: gracias al pipeline image-text-to-text y al proyector multimodal, puede procesar diagramas, figuras o capturas de ejercicios y generar explicaciones textuales sobre ellos.
- Correccion asistida de ejercicios: integrado mediante llama-server con API compatible con OpenAI, puede incorporarse en una aplicacion web de aula para revisar respuestas y generar retroalimentacion textual.
- Prototipado de asistentes de estudio en escritorio: la disponibilidad de cuantizaciones Q6_K (20,57 GiB) y Q8_0 (26,63 GiB) permite elegir el equilibrio entre calidad y requisitos de VRAM segun el hardware del investigador.
- Investigacion sobre modelos multimodales educativos: al ser una conversion GGUF de un modelo de 27B, sirve como base para experimentos de evaluacion comparativa en entornos locales con llama.cpp.
- Despliegue en estaciones de trabajo sin GPU de centro de datos: la version Q4_K_M permite ejecutar un modelo de 27B con vision en GPUs de gama alta de consumo, facilitando pruebas de concepto de aplicaciones educativas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de pesos, sin contar overhead de contexto ni el proyector):
  - BF16: 50,11 GiB.
  - Q8_0: 26,63 GiB.
  - Q6_K: 20,57 GiB.
  - Q4_K_M: 15,41 GiB.
- El proyector multimodal `mmproj-OmniEdu-27B-F16.gguf` debe cargarse adicionalmente para entrada de imagen; su tamano no se especifica en la informacion disponible.
- GPU recomendadas: no disponibles de forma explicita. Por tamano de pesos, Q4_K_M requiere al menos ~16 GiB de VRAM (por ejemplo, RTX 4090 de 24 GB o RTX 4080 de 16 GB con margen ajustado); Q8_0 y BF16 requieren GPUs profesionales tipo A100/H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: Q4_K_M y Q6_K son las opciones viables en GPUs de 24 GB; Q8_0 y BF16 no caben en GPUs de consumo actuales de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-server`) segun la model card; otros motores compatibles con GGUF no se mencionan.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas (contexto, idiomas, benchmarks) que permitan una comparativa rigurosa con alternativas de la misma categoria. Como referencia estructural, se puede contrastar con otros modelos multimodales de ~27B en formato GGUF, pero no se han publicado metricas comparables en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| Omni-Edu-27B GGUF | ~27B | no disponible | other | GGUF | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia es "other" y remite a los terminos del modelo original `lhpku20010120/Omni-Edu-27B`; es imprescindible revisar dichos terminos antes de cualquier uso comercial.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni evaluaciones de seguridad.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no esta garantizado.
- La longitud de contexto no esta publicada; el ejemplo de la model card usa 8192 tokens, que puede ser insuficiente para tareas de contexto largo.
- La cuantizacion Q4_K_M puede degradar la calidad respecto a BF16, especialmente en tareas multimodales y de razonamiento.
- El modelo requiere descargar el proyector multimodal por separado para el procesamiento de imagenes; sin el, solo funciona con texto.
- El repositorio ocupa 122 GB, lo que implica un coste de almacenamiento considerable si se descargan varias cuantizaciones.
- No hay informacion sobre el proceso de entrenamiento ni validacion del modelo base, lo que limita la evaluacion de su fiabilidad en produccion.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/OpenDCAI/Omni-Edu-27B-GGUF
- Arbol de archivos del repositorio: https://huggingface.co/OpenDCAI/Omni-Edu-27B-GGUF/tree/main
- Modelo base: https://huggingface.co/lhpku20010120/Omni-Edu-27B
- llama.cpp (herramienta de conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
