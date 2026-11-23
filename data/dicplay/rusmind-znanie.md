# DICPlay/RusMind-Znanie

## Resumen

RusMind-Znanie (en ruso, "Знание", "conocimiento") es un modelo de lenguaje conversacional desarrollado por DICPlay dentro de su familia abierta RusMind, orientada al mercado rusoparlante. Se trata de un fine-tuning del modelo base google/gemma-4-26B-A4B-it, una arquitectura de mezcla de expertos (MoE) con aproximadamente 26.000 millones de parámetros totales y unos 4.000 millones activos por token. El autor lo posiciona como el buque insignia de su línea abierta y como el modelo con "los conocimientos más amplios" de la familia, con enfasis en historia y cultura de Rusia, legislacion, regiones y pueblos del pais.

El modelo se distribuye principalmente en formato GGUF (cuantizacion Q4_K_M de 15,6 GB) para su uso con llama.cpp, LM Studio u Ollama, y esta pensado para ejecutarse tanto en la nube (es el modelo que responde en rusmind.ru) como en equipos locales con al menos 24 GB de memoria. Su enfoque no es tanto competir en benchmarks generalistas como ofrecer cobertura profunda de conocimiento factual y cultural ruso en ruso y en ingles, con una licencia propia (rusmind-license) que conviene revisar antes de un uso comercial.

La relevancia actual del modelo radica en dos factores: por un lado, la escasez relativa de modelos abiertos especializados en ruso con calidad conversacional y tamano moderado; por otro, la existencia de un ecosistema propio (web, familia de modelos, benchmark MERA) que DICPlay esta construyendo alrededor de la marca RusMind. No obstante, la informacion publica disponible sobre el modelo es escasa y muy centrada en marketing, sin datos de benchmarks propios ni detalles del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, derivada de google/gemma-4-26B-A4B-it |
| Parametros totales | 25.233.142.046 (~25,2 mil millones) |
| Parametros activos | ~4 mil millones (por el sufijo A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada); no se detallan otras |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | rusmind-license (licencia propia, marcada como "other") |
| Formato de pesos | GGUF (repo de 16,8 GB; archivo principal de 15,6 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo google/gemma-4-26B-A4B-it: un transformer con mezcla de expertos en el que solo se activa una fraccion de los parametros por token (~4B de ~26B), lo que reduce el coste computacional de inferencia manteniendo una capacidad de representacion propia de un modelo mucho mayor. RusMind-Znanie es un fine-tuning sobre ese modelo base, segun la relacion `base_model_relation: finetune` declarada en la model card.

No se han publicado detalles sobre el proceso de entrenamiento: ni el numero de tokens utilizados, ni la composicion del dataset de ajuste, ni si se emplearon tecnicas de RLHF, DPO u otras. La model card unicamente describe el enfasis tematico del ajuste (historia y cultura de Rusia, leyes, regiones y pueblos, valores familiares tradicionales) y destaca la calidad de su generacion de poesia en ruso. Tampoco se documentan innovaciones tecnicas propias mas alla de lo heredado del modelo base.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con especial cobertura de conocimiento sobre historia, cultura, legislacion, regiones y pueblos de Rusia.
- Generacion de poesia en ruso, presentada por el autor como la mejor de las modelos abiertas de la familia RusMind.
- Conversacion multi-turno (etiqueta `conversational` y modo `-cnv` en llama.cpp).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor remite a otros modelos de la familia (Sokol 4.7) para el modo de razonamiento.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues limitadas a ruso e ingles.

## Casos de uso

- Asistente conversacional en ruso para atencion al cliente: el modelo puede mantener dialogos multi-turno en ruso con conocimiento factual solido, adecuado para dominios como administracion publica, turismo o servicios locales.
- Consultas sobre legislacion y tramites rusos: su enfasis declarado en leyes y regiones lo hace util para prototipos de asistentes informativos sobre normativa, siempre con verificacion humana por el riesgo de alucinacion.
- Contenido editorial y divulgativo sobre historia y cultura rusa: generacion de borradores de articulos, resumenes o material educativo en ruso con cobertura tematica amplia.
- Generacion de poesia y texto creativo en ruso: caso de uso destacado explicitamente por el autor, aprovechable en aplicaciones de entretenimiento o contenido cultural.
- Despliegue local en equipos con 24 GB de memoria: al distribuirse en GGUF Q4_K_M, puede ejecutarse con llama.cpp, LM Studio u Ollama en estaciones de trabajo o PCs de gama alta sin conexion a internet.
- Traduccion y adaptacion de contenido entre ruso e ingles: el soporte bilingue permite tareas de reescritura y localizacion, aunque sin garantias de calidad equivalentes a modelos especializados en traduccion.
- Backend conversacional en la nube: es el modelo que responde en rusmind.ru, por lo que puede integrarse via API o endpoints compatibles en productos orientados a usuarios rusoparlantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de RusMind-Znanie en la informacion disponible. La model card incluye cifras de MERA v2 para otros modelos de la familia (Sokol 4.7 con 0,279 y Vspyshka 4.7 con 0,191), pero no para Znanie, por lo que no se pueden presentar resultados propios ni comparaciones directas.

## Requisitos de hardware

- VRAM/memoria estimada: el autor recomienda un PC con 24 GB de memoria (ya sea VRAM o RAM) para el archivo Q4_K_M de 15,6 GB, dejando margen para el contexto y el runtime.
- GPU recomendadas: no se especifican modelos concretos; por capacidad, encajan GPU de 24 GB o mas (RTX 3090, RTX 4090, A100, H100) o configuraciones con offloading a RAM del sistema.
- GPU de consumo: si cabe en RTX 3090/4090 (24 GB) con la cuantizacion Q4_K_M; en GPUs de 16 GB o menos requeriria offloading parcial a RAM y perdida de velocidad.
- Opciones de despliegue: llama.cpp (comando `llama-cli -m ... -cnv` documentado), LM Studio, Ollama y cualquier runtime compatible con GGUF; tambien disponible via la web rusmind.ru.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4B parametros activos, el coste por token es inferior al de un modelo denso de 26B, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| RusMind-Znanie | ~25,2B totales / ~4B activos (MoE) | no disponible | ru, en | rusmind-license | GGUF | Fine-tuning de Gemma 4 26B-A4B; enfasis en conocimiento ruso |
| RusMind-Sokol 4.7 | 8,9B | no disponible | ru, en | rusmind-license | pesos completos y GGUF | Modo de razonamiento; 0,279 en MERA v2 segun el autor |
| RusMind-Vspyshka 4.7 | 7,5B | no disponible | ru, en | rusmind-license | pesos completos y GGUF | 0,191 en MERA v2; orientado a dispositivo |
| T-pro (T-Bank) | 33B | no disponible | ru, en | no disponible | no disponible | Referencia rusa de mayor tamano citada en la model card |
| GigaChat 3.5 Ultra (Sber) | 432B | no disponible | ru | no disponible | no disponible | Modelo propietario de gran escala citado como referencia |

La comparacion directa con alternativas de la misma categoria (modelos abiertos rusoparlantes de ~25B en formato GGUF) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste esta orientado explicitamente a "valores familiares tradicionales" y a una determinada vision de la historia y la cultura rusas, lo que puede introducir sesgos editoriales e ideologicos en las respuestas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion factica incorrecta, especialmente critico en el ambito legal, donde el autor no ofrece garantias de exactitud.
- Cobertura limitada a ruso e ingles: no hay soporte declarado para castellano ni otros idiomas, por lo que su uso en entornos hispanohablantes requeriria traduccion intermedia.
- Longitud de contexto no documentada: se desconoce la ventana real del fine-tuning, lo que dificulta planificar cargas con documentos largos.
- Licencia restrictiva: la rusmind-license es una licencia propia marcada como "other"; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Informacion tecnica escasa: no se publican datos de entrenamiento, benchmarks propios ni mediciones de latencia, lo que limita la evaluacion rigurosa en produccion.
- Unica cuantizacion publicada: solo se ofrece Q4_K_M, sin alternativas de mayor o menor precision para ajustar el equilibrio calidad/memoria.
- Modelo reciente y con pocas senales de adopcion: 452 descargas y 0 likes en el momento de la consulta, sin validacion independiente de su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Znanie
- Carpeta de la version 3.2: https://huggingface.co/DICPlay/RusMind-Znanie/tree/main/v3.2
- Web oficial / demo en la nube: https://rusmind.ru
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- RusMind-Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind-Vspyshka 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- RusMind-Momentum: https://huggingface.co/DICPlay/RusMind-Momentum
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
