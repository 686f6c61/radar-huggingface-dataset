# DICPlay/RusMind-Znanie

## Resumen

RusMind · Znanie (Знание) es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por DICPlay dentro de su familia abierta RusMind, orientada al idioma ruso. Se trata de un fine-tuning del modelo base google/gemma-4-26B-A4B-it, con aproximadamente 26 000 millones de parametros totales y alrededor de 4000 millones activos por paso, distribuido en formato GGUF. El autor lo posiciona como el modelo insignia de su linea abierta y como el que responde en su servicio en la nube rusmind.ru.

El modelo esta especializado en conocimiento sobre historia y cultura de Rusia, legislacion, regiones y pueblos del pais, y valores familiares tradicionales, con capacidad de conversacion en ruso e ingles. Su relevancia actual radica en que ofrece un MoE de ~26B con solo ~4B activos en un unico archivo GGUF de 15,6 GB cuantizado a Q4_K_M, lo que permite ejecutarlo en equipos con 24 GB de memoria (VRAM o RAM) mediante llama.cpp, LM Studio u Ollama.

La ficha se basa exclusivamente en la informacion publicada en Hugging Face y en la model card del autor; los datos no presentes en dichas fuentes se indican como no disponibles. Cabe senalar que el modelo base referenciado (google/gemma-4-26B-A4B-it) y las fechas de creacion y actualizacion del repositorio (octubre y noviembre de 2026) figuran tal cual en los metadatos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre base google/gemma-4-26B-A4B-it |
| Parametros totales | 25 233 142 046 (~25,2 mil millones) |
| Parametros activos | ~4000 millones por paso (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica version publicada, 15,6 GB); otras no disponibles |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | rusmind-license (licencia propia, marcada como "other" en Hugging Face) |
| Formato de pesos | GGUF (libreria gguf, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos (MoE), heredada del modelo base google/gemma-4-26B-A4B-it, del que constituye un fine-tuning segun el campo `base_model_relation: finetune`. La nomenclatura "26B-A4B" del modelo base indica aproximadamente 26 000 millones de parametros totales y unos 4000 millones activos, coherente con el recuento real de parametros del repositorio (25,2 mil millones). El autor no detalla el numero de expertos, la estrategia de enrutamiento ni la configuracion de atencion.

No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de fine-tuning, ni si se emplearon tecnicas de RLHF, DPO o similar. La model card describe el ajuste como orientado a conocimiento sobre Rusia (historia, cultura, leyes, regiones, pueblos y valores familiares), sin aportar detalles metodologicos. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con enfasis en conocimiento factual sobre Rusia.
- Conocimiento especializado en historia y cultura de Rusia, legislacion, regiones y pueblos del pais, y valores familiares tradicionales, segun la model card.
- Produccion de poesia: el autor afirma que son "los mejores versos entre los modelos abiertos de RusMind".
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (modo `-cnv` en llama.cpp).
- Soporte de tool calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado para este modelo.
- Modo de razonamiento explicito (thinking): no documentado para este modelo (si existe en otros modelos de la familia, como Sokol 4.7).
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente conversacional en ruso: el modelo puede gestionar dialogos multi-turno mediante llama.cpp con el flag `-cnv`, adecuado para prototipos de atencion al usuario en ruso con despliegue local.
- Consultas sobre legislacion y administracion rusa: su ajuste especifico en leyes y regiones lo hace util como asistente de referencia interna para equipos que trabajan con normativa rusa, siempre con verificacion humana.
- Educacion y divulgacion cultural: generacion de material didactico sobre historia, cultura y pueblos de Rusia, aprovechando su conocimiento especializado en estas areas.
- Generacion creativa en ruso: composicion de poemas y textos literarios, area en la que el autor declara un rendimiento destacado dentro de su familia.
- Despliegue en equipos de sobremesa con 24 GB: al ser un GGUF Q4_K_M de 15,6 GB, puede ejecutarse en estaciones de trabajo o portatiles de gama alta sin GPU dedicada de gran capacidad, usando RAM del sistema.
- Integracion en LM Studio u Ollama: permite incorporar el modelo a flujos de trabajo locales de escritorio para tareas de redaccion y consulta en ruso e ingles sin conexion.
- Traduccion y adaptacion ru-en: su soporte bilingue permite tareas de reescritura y adaptacion de contenido entre ambos idiomas, aunque no se documenta calidad de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de MERA v2 para otros modelos de la familia (Sokol 4.7 y Vspyshka 4.7), pero no para RusMind · Znanie.

## Requisitos de hardware

- VRAM/RAM estimada: el autor recomienda un PC con 24 GB de memoria (tarjeta grafica o memoria del sistema) para el unico archivo publicado, Q4_K_M de 15,6 GB.
- GPU recomendadas: no disponibles de forma explicita; por tamano del archivo, encajan GPU con 16 GB o mas de VRAM (por ejemplo, RTX 4090, RTX 4080, A100, H100) o configuraciones con offload a RAM.
- Viabilidad en GPU de consumo: si, en tarjetas con al menos 16 GB de VRAM; en equipos con menos VRAM puede requerir offload parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp (comando documentado con `llama-cli`), LM Studio, Ollama y otras aplicaciones compatibles con GGUF; tambien disponible en el servicio web rusmind.ru.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind · Znanie | ~25,2B totales, ~4B activos | no disponible | no disponible | rusmind-license | GGUF en Hugging Face |
| RusMind · Sokol 4.7 | 8,9B | no disponible | MERA v2: 0,279 | no disponible en esta ficha | Pesos y GGUF en Hugging Face |
| RusMind · Vspyshka 4.7 | 7,5B | no disponible | MERA v2: 0,191 | no disponible en esta ficha | Pesos y GGUF en Hugging Face |
| GigaChat 3.5 Reasoning (Sber) | 432B | no disponible | por encima de Sokol 4.7 en MERA v2 | no disponible en esta ficha | no disponible en esta ficha |

La comparacion directa con modelos de otros fabricantes del mismo tamano no puede establecerse con rigor porque la informacion proporcionada no incluye benchmarks de Znanie. Los datos de la familia RusMind proceden de la propia model card del autor.

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste esta orientado explicitamente a historia, cultura, leyes y "valores familiares tradicionales" de Rusia, lo que puede introducir un sesgo editorial y una perspectiva nacional concreta en las respuestas.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; el enfasis en conocimiento factual sobre legislacion y regiones exige verificacion en usos sensibles.
- Limitaciones de idioma: solo se declaran ruso e ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- Longitud de contexto: no publicada; no debe asumirse una ventana larga sin verificacion.
- Licencia: se trata de una licencia propia ("rusmind-license", marcada como "other"), no una licencia open source estandar; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial. El autor ofrece contacto para licencias de organizacion.
- Unica cuantizacion publicada: solo Q4_K_M; no hay versiones de mayor o menor precision disponibles en el repositorio.
- Datos de rendimiento ausentes: no hay benchmarks del modelo, lo que dificulta evaluar su calidad frente a alternativas.
- Procedencia del modelo base: el modelo base indicado (google/gemma-4-26B-A4B-it) y las fechas del repositorio figuran en los metadatos; conviene verificar su disponibilidad y condiciones en la fuente original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Znanie
- Carpeta de la version 3.2: https://huggingface.co/DICPlay/RusMind-Znanie/tree/main/v3.2
- Servicio en la nube: https://rusmind.ru
- Modelo RusMind · Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo RusMind · Vspyshka 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo RusMind · Momentum: https://huggingface.co/DICPlay/RusMind-Momentum
- Modelo RusMind · Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
