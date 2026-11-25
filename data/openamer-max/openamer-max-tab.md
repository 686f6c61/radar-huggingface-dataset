# openamer-max/openamer-max-tab

## Resumen

OpenAmer-Tab es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,62B) desarrollado por openamer-max, un proyecto suizo que construye una familia de asistentes locales organizados por el hardware objetivo de cada nivel (reloj, teléfono, tablet, escritorio). Este modelo ocupa el tercer escalón de esa familia y está pensado para ejecutarse en tablets y equipos de gama media, de forma totalmente offline. Se distribuye principalmente como GGUF cuantizado en Q4_K_M con un tamaño de 4,4 GB y una ventana de contexto de 16k tokens.

Técnicamente es un ajuste fino mediante LoRA sobre Qwen/Qwen2.5-7B-Instruct, por lo que hereda la arquitectura transformer densa del modelo base de Alibaba. El ajuste se orienta a un comportamiento conversacional de asistente de producto: responder con precisión sobre las capacidades de OpenAmer, rechazar honestamente cuando la respuesta no está en el contexto y mantener la polaridad correcta de las negaciones. Los idiomas declarados son alemán, bosnio, croata, serbio e inglés.

Su relevancia actual radica en el enfoque de despliegue: inferencia en CPU con latencias declaradas de 0,2 a 1,1 segundos, integración directa con Ollama y llama.cpp, y una licencia Apache-2.0 que permite uso comercial sin restricciones adicionales. El autor publica además un conjunto de evaluación congelado de 45 casos que aplica de forma uniforme a todos los niveles de la familia, lo que facilita comparaciones entre tamaños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct mediante LoRA) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,62B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16k tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF, 4,4 GB); f16 (14,5 GB) |
| Idiomas soportados | Aleman (de), bosnio (bs), croata (hr), serbio (sr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repositorio de 4,7 GB |
| Libreria de inferencia | llama.cpp, Ollama |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Metodo de ajuste | LoRA |
| Fecha de creacion | 2026-11-11 |
| Ultima actualizacion | 2026-11-23 |
| Descargas en Hugging Face | 845 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer denso con atención estándar y RoPE, y se adapta mediante LoRA. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO adicionales sobre el ajuste supervisado. El autor tampoco detalla el rango o los módulos objetivo del adaptador LoRA.

La innovación declarada no es arquitectónica sino metodológica y de despliegue: un conjunto de evaluación congelado de 45 casos que se aplica de forma idéntica a todos los niveles de la familia (Watch, Phone, Tab, Desktop, Pro, Ultra) para que las puntuaciones sean comparables entre tamaños. El autor documenta además un proceso de depuración del propio evaluador, corrigiendo errores como comprobaciones de sinónimos unidas con AND en lugar de OR, rechazos de seguridad contabilizados como infracciones y diacríticos bosnios (`č/ć/š/ž/đ`) marcados erróneamente como deriva de idioma. Se recomienda mantener `repeat_penalty` en 1.0, ya que valores como 1.1 penalizan palabras que una negación necesita repetir y pueden invertir su polaridad.

## Capacidades

- Generación de texto conversacional multi-turno en alemán, bosnio, croata, serbio e inglés.
- Respuesta a preguntas de producto con hechos correctos y rechazos honestos cuando la información no está en el contexto.
- Manejo correcto de la polaridad de negaciones (por ejemplo, distinguir "funciona en iPhone" de "no funciona en Android").
- Procesamiento de documentos (Word, Excel, PDF), código, aritmética y resumen, capacidades heredadas del base de 7B.
- Contexto de 16k tokens para documentos de longitud media.
- Ejecución offline en CPU mediante llama.cpp y Ollama.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistente de producto offline en tablet: el modelo responde preguntas sobre las capacidades y limitaciones de la familia OpenAmer con rechazos honestos cuando no dispone de la respuesta, ejecutándose en local sin conexión.
- Atención al cliente en mostrador o quiosco: con 16k tokens de contexto puede gestionar conversaciones multi-turno y consultar documentación de producto embebida en el prompt, con latencias de 0,2 a 1,1 segundos en CPU.
- Resumen de documentos en dispositivos de gama media: procesa archivos Word, Excel y PDF de longitud moderada dentro de la ventana de 16k tokens sin necesidad de GPU.
- Soporte multilingüe para los Balcanes y el ámbito germanoparlante: cubre alemán, bosnio, croata y serbio en una sola implementación, útil para organizaciones que atienden a esas comunidades.
- Prototipado rápido con Ollama: el comando `ollama run amersacirovic/openamer-max-tab` permite tener un asistente funcional en un solo paso, adecuado para demos y pruebas de concepto.
- Asistencia básica de código y aritmética en entornos sin GPU: el base de 7B conserva capacidad general suficiente para tareas de programación sencillas y cálculos, con la salvedad de que no hay garantía en multiplicaciones de cuatro dígitos.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en local bajo Apache-2.0, permite procesar información sensible sin enviarla a servicios externos.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Conjunto congelado de 45 casos (producto) | 42/45 (93,3 %) |
| Conjunto congelado de 23 casos no vistos (sin contaminación) | 22/23 (95,7 %) |
| Desglose del conjunto de 23 casos | hechos 7/7 · paráfrasis 3/3 · rechazos 5/5 · bosnio 2/3 · rechazos en bosnio 1/1 · largo 1/1 · corto 1/1 · borde 2/2 |
| Prueba nueva de 12 preguntas nunca vistas | 12/12 (verificado por contenido) |
| Latencia en CPU | 0,2 – 1,1 s |

La medición de 45 casos se realizó con el GGUF distribuido sobre Ollama (informe `reports/v2_openamer-max-tab.json`). El caso fallido del conjunto de 23 corresponde a la formulación bosnia débil: ante "Mogu li koristiti OpenAmer bez interneta?" responde correctamente en sustancia pero no emplea las palabras "internet" ni "mreža". No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- RAM estimada: aproximadamente 6 GB para la versión Q4_K_M de 4,4 GB.
- VRAM medida: 8 GB para el modelo multimodal VL-8B de la familia; para Tab no se especifica VRAM, ya que está orientado a CPU.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecución en CPU en tablets y equipos de gama media.
- Cabe en GPU de consumo: no se documenta, pero por tamaño (4,4 GB en Q4_K_M) sería viable en GPUs con 6-8 GB de VRAM si se ejecuta con llama.cpp con offload parcial.
- Opciones de despliegue: Ollama (recomendado, comando único), llama.cpp con el GGUF directo y Modelfile incluido, API compatible con endpoints.
- Latencia: 0,2 – 1,1 s en CPU según el autor. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenAmer-Tab | 7,62B | 16k | Apache-2.0 | GGUF | Ajuste LoRA de Qwen2.5-7B-Instruct; 42/45 en su benchmark propio |
| Qwen2.5-7B-Instruct | 7,62B | 32k (modelo base) | Apache-2.0 | safetensors, GGUF | Modelo base; contexto mayor y capacidades generales más amplias, sin el ajuste conversacional de producto |
| OpenAmer-Phone | 3,09B | no disponible | Apache-2.0 | GGUF | Nivel inferior de la misma familia; 43/45 en el mismo conjunto congelado |
| OpenAmer-Desktop | 14,7B | no disponible | Apache-2.0 | GGUF | Nivel superior de la misma familia; 44/45 en el mismo conjunto congelado |

La comparación con Qwen2.5-7B-Instruct es directa por herencia: Tab reduce el contexto de 32k a 16k y especializa el comportamiento conversacional a costa de capacidad general. No se dispone de datos de benchmarks estándar para comparar con otras alternativas de 7B.

## Limitaciones y advertencias

- Formulación bosnia débil: responde correctamente en sustancia pero puede omitir términos clave esperados ("internet", "mreža"), lo que provoca el único fallo del conjunto de 23 casos.
- Sin garantía en multiplicaciones de cuatro dígitos; conviene verificar la aritmética antes de confiar en ella.
- No sustituye a un modelo grande: con 7,62B las cadenas de razonamiento largas son frágiles.
- Contexto limitado a 16k tokens, la mitad que el modelo base, lo que restringe el procesamiento de documentos extensos.
- Sensibilidad a `repeat_penalty`: debe mantenerse en 1.0; valores superiores pueden invertir la polaridad de las negaciones.
- Cobertura idiomática restringida a cinco idiomas; no se declara soporte de español.
- No se documentan resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), lo que dificulta la comparación objetiva con otros modelos de 7B.
- Riesgo de alucinación inherente a los modelos de 7B; el ajuste busca mitigarlo con rechazos honestos, pero no lo elimina.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero conviene verificar las obligaciones de atribución del modelo base Qwen2.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-tab
- Ollama registry: https://ollama.com/amersacirovic/openamer-max-tab
- Web del proyecto: https://openamer-max.github.io
- Guía de dispositivos (Gerätepass): https://openamer-max.github.io/geraetepass/
- Demo en navegador: https://openamer-max-openamer-max-demo.hf.space
- API de traducción (138 idiomas): https://openamer-max-openamer-translate.hf.space/health
- Código fuente: https://github.com/openamer-max/openamer
- Dataset de benchmark: https://huggingface.co/datasets/openamer-max/openamer-max-benchmark
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Nivel inferior (Phone): https://huggingface.co/openamer-max/openamer-max-phone
- Nivel inferior (Watch): https://huggingface.co/openamer-max/openamer-max-watch
