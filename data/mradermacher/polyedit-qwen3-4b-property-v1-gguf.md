# mradermacher/polyedit-qwen3-4b-property-v1-GGUF

## Resumen

Polyedit Qwen3-4B Property v1 (GGUF) es la versión cuantizada del modelo `luca0621/polyedit-qwen3-4b-property-v1`, un ajuste fino completo (full fine-tuning) del modelo Qwen3-4B orientado a la descripción y predicción de propiedades de polímeros, con instrucciones en coreano. El modelo original lo desarrolla el usuario luca0621 y las cuantizaciones las publica mradermacher, un conocido distribuidor de versiones GGUF para llama.cpp y derivados.

El modelo resuelve un problema muy concreto: convertir un LLM generalista de 4.400 millones de parámetros en un asistente de dominio para química de polímeros que responde en coreano siguiendo instrucciones del dataset `polyedit-korean-property-instructions-v6`. No es un modelo de propósito general ni compite en benchmarks de razonamiento abstracto: es una herramienta vertical para investigación de materiales, documentación técnica y extracción de propiedades fisicoquímicas.

Su relevancia ahora es práctica: al estar disponible en GGUF con cuantizaciones desde 1,9 GB hasta 8,9 GB, se puede ejecutar en hardware de consumo y en estaciones de trabajo de laboratorio sin GPU de datacenter, algo crítico cuando los datos de formulaciones son confidenciales y no pueden salir de la red local. La licencia, sin embargo, no es Apache 2.0 pura: incorpora términos adicionales de referencia de PolyOne que deben revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3-4B (no se detalla en la ficha la configuración de capas, cabezas ni atención) |
| Parametros totales | 4.411.424.256 (4,41 mil millones), según safetensors del modelo base |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada (no confirmada para el ajuste fino) |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Coreano (ko), según el campo `language` de la model card |
| Licencia | `qwen-apache-with-polyone-reference-terms` (identificador `other`), con enlace a LICENSE.md del modelo base |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors para transformers |
| Tamano del repositorio | 39,7 GB (suma de todas las cuantizaciones publicadas) |
| Fecha declarada de publicación | 2026-10-28 (creación) y 2026-10-28 (última actualización) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B, un transformer denso de 4.400 millones de parámetros, sobre el que se ha aplicado un ajuste fino completo (etiqueta `full-finetuning`), no un adaptador LoRA. El autor del modelo base no documenta en esta ficha el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; lo único confirmado es el corpus de instrucciones utilizado: `luca0621/polyedit-korean-property-instructions-v6`, centrado en propiedades de polímeros y redactado en coreano.

El repositorio que nos ocupa no entrena nada: mradermacher aplica cuantización estática (quantize_version 2, salida `convert_type: hf`) sobre los pesos del modelo base y publica los ficheros GGUF resultantes. No hay cuantizaciones ponderadas por imatrix disponibles en el momento de la consulta, según indica el propio autor, por lo que los quants IQ y K publicados son estáticos y pueden presentar una pérdida de calidad algo mayor que sus equivalentes con imatrix, especialmente en Q2_K y Q3.

## Capacidades

- Generación de texto conversacional en coreano con instrucciones de dominio químico.
- Descripción y razonamiento sobre propiedades de polímeros (el eje central del dataset de ajuste fino).
- Seguimiento de instrucciones estructuradas, al estar entrenado sobre un corpus de instrucciones (`...-instructions-v6`).
- Extracción y normalización de información técnica a partir de texto (fichas técnicas, artículos, notas de laboratorio).
- Formato conversacional (`conversational` en los tags), apto para pipelines de chat multi-turno.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que permite servirlo detrás de una API compatible con OpenAI.
- Tool calling / function calling: no documentado en la información disponible para este ajuste fino.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision, audio y modo "thinking" explícito: no documentados.
- Multilingüismo: limitado al coreano según la model card; no se declara soporte de castellano ni de inglés.

## Casos de uso

- Extracción estructurada de propiedades de polímeros: dado un PDF o una ficha técnica en coreano, el modelo genera una tabla con valores de Tg, Tm, densidad, índice de fluidez y demás propiedades. Su ajuste específico reduce la necesidad de prompts largos con ejemplos.
- Asistente interno de I+D de materiales: desplegado en local (2,7-3,3 GB con Q4_K_M o Q5_K_M), permite a investigadores consultar terminología y rangos típicos de propiedades sin enviar formulaciones confidenciales a una API externa.
- Normalización de nomenclatura química coreano-inglés: traducción y unificación de nombres de monómeros y aditivos en catálogos y bases de datos internas, tarea donde un modelo generalista suele introducir variantes inconsistentes.
- Preclasificación de candidatos antes de simulación: filtrar formulaciones plausibles o descartar combinaciones incoherentes antes de lanzar cálculos de dinámica molecular o DFT, ahorrando horas de cómputo.
- Resumen de literatura científica en coreano: condensar artículos y patentes del sector en fichas de dos o tres frases con los datos experimentales clave, para alimentar un repositorio de conocimiento interno.
- Soporte a técnicos de planta: chatbot de consulta rápida sobre fichas de seguridad y propiedades de materiales, ejecutable en un portátil o en una estación con GPU de gama media.
- Anotación asistida de datasets: generar primeras etiquetas de propiedades sobre texto no estructurado que después un especialista revisa y corrige, acelerando la construcción de corpus propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna evaluación específica de química o de extracción de propiedades, y el autor del modelo base no aporta métricas en los datos disponibles. Tampoco hay información sobre latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia (con overhead de contexto habitual de 2-4 GB adicionales según longitud de prompt y tamaño de batch):
  - Q2_K (1,9 GB): ~4 GB de VRAM.
  - IQ4_XS (2,6 GB) / Q4_K_S (2,7 GB) / Q4_K_M (2,8 GB): ~5-6 GB de VRAM.
  - Q5_K_M (3,3 GB): ~6-7 GB de VRAM.
  - Q6_K (3,7 GB): ~7-8 GB de VRAM.
  - Q8_0 (4,8 GB): ~8-10 GB de VRAM.
  - f16 (8,9 GB): ~11-12 GB de VRAM; el propio autor lo califica de "overkill" para este tamaño.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para f16 con contexto amplio; A10G, L4 o A100/H100 solo si se necesita servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, con claridad. Cualquier GPU con 8 GB o más ejecuta Q4_K_M o Q5_K_M con holgura; con 6 GB conviene bajar a IQ4_XS o Q3_K_L.
- Opciones de despliegue: llama.cpp y llama-cpp-python (ruta nativa para GGUF), Ollama y LM Studio para pruebas locales, servidores compatibles con OpenAI sobre llama.cpp para integración en aplicaciones, y vLLM o TGI solo con soporte experimental de GGUF (para producción a escala conviene partir del modelo base en safetensors y servirlo con vLLM o TGI en fp16/bf16).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| polyedit-qwen3-4b-property-v1 (este) | 4,41 B | No disponible | Polímeros, coreano | qwen-apache-with-polyone-reference-terms | GGUF + safetensors (modelo base) |
| Qwen3-4B (base) | ~4,0 B | No verificado en esta ficha | Propósito general, multilingüe | Apache 2.0 | safetensors, GGUF de terceros |
| Llama 3.2 3B Instruct | ~3,2 B | No verificado en esta ficha | Propósito general, multilingüe | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 3 4B IT | ~4 B | No verificado en esta ficha | Propósito general, multilingüe | Gemma Terms of Use | safetensors, GGUF |

Las cifras de parámetros y licencias de los modelos alternativos proceden de su documentación pública y no se han verificado contra la fuente en esta ficha; la columna de contexto se marca como no verificada por la misma razón. La diferencia clave de este modelo no es el rendimiento bruto, sino la especialización vertical y el idioma: un Qwen3-4B genérico superará probablemente a este ajuste fino en tareas generales y en castellano, pero no en terminología de polímeros en coreano.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente coreano (`ko`). El rendimiento en castellano o inglés no está documentado y previsiblemente será muy inferior al de un modelo generalista del mismo tamaño.
- Dominio estrecho: el ajuste fino se centra en propiedades de polímeros. Puede degradarse en química fuera de ese ámbito y en tareas generales de razonamiento.
- Riesgo de alucinación en valores numéricos: al ser un modelo de 4,4 B especializado en propiedades, existe riesgo real de generar cifras plausibles pero incorrectas (temperaturas de transición, densidades, ratios). Cualquier dato debe validarse contra la fuente primaria antes de usarse en decisiones de ingeniería.
- Licencia: `qwen-apache-with-polyone-reference-terms` no es una licencia OSI estándar. Los términos de referencia de PolyOne pueden imponer condiciones adicionales al uso comercial; es obligatorio leer el LICENSE.md del modelo base antes de desplegarlo en producción.
- Cuantizaciones de baja precisión: Q2_K (1,9 GB) y Q3_K_M (2,3 GB) reducen la calidad de forma apreciable; para extracción de datos técnicos conviene Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no hay quants ponderados disponibles, lo que limita la calidad por tamaño de fichero frente a alternativas con imatrix.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de terceros sobre su comportamiento real.
- Sin benchmarks: no existen métricas publicadas que permitan comparar su precisión frente al modelo base o frente a alternativas.
- Fecha de publicación declarada en 2026-10-28: conviene verificar la vigencia y el estado de mantenimiento del repositorio antes de adoptarlo.
- Este repositorio es solo una redistribución cuantizada; los posibles fallos de entrenamiento o de datos provienen del modelo base y no se corrigen aquí.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/polyedit-qwen3-4b-property-v1-GGUF
- Modelo base: https://huggingface.co/luca0621/polyedit-qwen3-4b-property-v1
- Dataset de instrucciones: https://huggingface.co/datasets/luca0621/polyedit-korean-property-instructions-v6
- Licencia del modelo base (LICENSE.md): https://huggingface.co/luca0621/polyedit-qwen3-4b-property-v1/blob/main/LICENSE.md
- Página de descargas del cuantizador: https://hf.tst.eu/model#polyedit-qwen3-4b-property-v1-GGUF
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede infraestructura al cuantizador: https://www.nethype.de/
- Papers, blogs o demos adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
