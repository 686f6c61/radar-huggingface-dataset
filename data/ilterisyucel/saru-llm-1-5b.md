# ilterisYucel/saru-llm-1.5b

## Resumen

Saru LLM 1.5B es un modelo de lenguaje ajustado por ilterisYucel sobre la base Qwen2.5-1.5B-Instruct mediante QLoRA/SFT. Su proposito es muy concreto: extraer informacion estructurada en formato JSON a partir de documentos de mediacion (arabuluculuk) en turco, convirtiendo texto libre procedente de documentos UDF, PDF, DOCX o XLS en un esquema fijo de 21 campos. No es un modelo conversacional de proposito general, sino un extractor especializado de un unico dominio.

El modelo resuelve un problema acotado pero real en el ambito juridico-administrativo turco: la digitalizacion y normalizacion de expedientes de mediacion. Con 1.543.714.304 parametros (1,5B), un contexto de entrenamiento maximo de 2048 tokens y un ajuste de solo 3 epocas sobre 412 ejemplos de entrenamiento, se posiciona como una herramienta ligera y desplegable en hardware de consumo, no como un modelo de razonamiento general.

Su relevancia actual radica en su tamano reducido y su licencia Apache 2.0, que permiten ejecutarlo localmente con llama.cpp en una GPU de portatil de 8 GB. La contrapartida es un alcance muy limitado: el propio autor advierte que el ajuste es de tarea unica y que las capacidades generales de instruccion pueden degradarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (maximo de entrenamiento); ventana nativa del modelo base no especificada en la informacion disponible |
| Tipos de cuantizacion | GGUF (incluye q4_0 segun el ejemplo de uso); QLoRA 4-bit NF4 para entrenamiento |
| Idiomas soportados | Turco (dominio de entrenamiento); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo completo) y GGUF; adaptador PEFT/LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5B parametros, y se ajusta mediante QLoRA con cuantizacion 4-bit NF4. La configuracion de LoRA es r=16, alpha=32, con 3 epocas, learning rate 2e-4 y longitud de secuencia 2048. El entrenamiento se realizo en una RTX 5050 Laptop de 8 GB de VRAM en aproximadamente 37 minutos, lo que da una idea clara de la escala del ajuste.

El corpus de entrenamiento esta compuesto por documentos de mediacion **sinteticos**, con datos sinteticos en los campos identificativos. Se uso un conjunto de 412 ejemplos de entrenamiento y 69 de evaluacion. La perdida de evaluacion del modelo base fue de 0,957 y tras el ajuste bajo a 0,175 sobre las 69 filas de evaluacion. El autor indica que la coincidencia de campos en conjuntos reales deterministas mejora respecto al modelo base, aunque no se publican cifras concretas de esa mejora. No se menciona uso de RLHF ni DPO; el proceso es SFT supervisado sobre el esquema de extraccion.

## Capacidades

- Extraccion estructurada de 21 campos desde texto de documentos de mediacion en turco: `buro_adi`, `dosya_no`, `basvuru_no`, `arabulucu_adi`, `arabulucu_sicil_no`, `basvurucular[]`, `karsi_taraflar[]`, `uyusmazlik_konusu`, `sonuc`, `surec_baslangic`, `surec_bitis`, `tutanak_tarihi`, `tutanak_yeri`, `ilk_toplanti_tarihi`, `ilk_toplanti_saati`, `ilk_toplanti_yeri`, `tutar`, `ucret_talep_tarihi`, `taraf_sayisi`, `aciklama` y `dosya_ozeti`.
- Generacion de un resumen del expediente (`dosya_ozeti`) junto a los campos estructurados.
- Salida en JSON valido, pensada para combinarse con `response_format` / JSON-schema en llama.cpp.
- Soporte de inferencia local mediante llama.cpp con la flag `--jinja` y servidor compatible con endpoints.
- Capacidades conversacionales generales: limitadas y potencialmente degradadas por el ajuste de tarea unica.
- Tool calling, agentes, vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Digitalizacion de expedientes de mediacion: el modelo recibe el texto extraido de un PDF o DOCX y devuelve un JSON con los 21 campos del esquema, lo que permite poblar bases de datos sin transcripcion manual.
- Normalizacion de archivos historicos: conversion de documentos UDF o XLS antiguos a un formato estructurado uniforme para su consulta posterior.
- Pre-relleno de formularios administrativos: a partir del texto del acta, se generan los campos de numero de expediente, fecha, lugar y partes implicadas para que un operador los revise.
- Extraccion de resumenes de expediente: el campo `dosya_ozeti` permite generar una sintesis breve del caso para indices o paneles de busqueda.
- Pipeline de validacion con revision humana: el modelo actua como primer paso de extraccion y un revisor valida los campos criticos, aprovechando su bajo coste de ejecucion en local.
- Prototipado en entornos con requisitos de privacidad: al ejecutarse en una GPU de 8 GB con llama.cpp, permite procesar documentos en infraestructura propia sin enviar datos a servicios externos.
- Extraccion por lotes en servidor modesto: con `-c 8192 -t 4 -np 1` en llama-server, puede atender peticiones secuenciales de documentos cortos en hardware de gama media.

## Benchmarks y rendimiento

| Metrica | Modelo base | Saru LLM 1.5B (fine-tuned) |
|---|---|---|
| Loss de evaluacion (69 filas) | 0,957 | 0,175 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato cuantitativo es la perdida de evaluacion sobre el conjunto sintetico de 69 ejemplos.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantizacion q4_0, un modelo de 1,5B ocupa del orden de 1 GB de pesos; con contexto de 2048-8192 tokens el consumo total se mantiene por debajo de 2-3 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM; el autor entreno en una RTX 5050 Laptop de 8 GB.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y similares; tambien es viable en CPU.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja` y `response_format`), y por extension cualquier runtime compatible con GGUF; el adaptador PEFT esta disponible para cargar sobre el modelo base con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saru LLM 1.5B | 1,5B | 2048 (entrenamiento) | Extraccion estructurada de mediacion en turco | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | Instruccion general multilingue | Apache 2.0 | Hugging Face |
| Otros extractores especializados en turco | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa es con su modelo base: Saru LLM mejora la perdida de evaluacion en la tarea especifica (0,957 a 0,175) a costa de un ajuste muy estrecho. No se dispone de datos de benchmarks que permitan compararlo con alternativas de extraccion estructurada de otros autores.

## Limitaciones y advertencias

- Alcance de tarea unico: es un SFT estrecho para extraccion; el seguimiento general de instrucciones puede haberse degradado.
- Contexto limitado: el maximo de entrenamiento es de 2048 tokens, por lo que los documentos largos se truncan y pueden perder campos.
- Datos sinteticos: el corpus de entrenamiento es sintetico, lo que puede provocar fallos en variantes de documento no vistas o en casos reales con formatos atipicos.
- Evaluacion de pequena escala: solo 69 ejemplos de evaluacion, insuficiente para garantizar robustez en produccion.
- Riesgo en partes multiples y apoderados: el autor advierte de posibles errores en documentos con varios comparecientes o representantes.
- Privacidad: las salidas no son anonimas; no debe procesarse datos personales sin base legal y se recomienda validacion determinista y revision humana.
- No es asesoramiento juridico: los resultados requieren supervision humana obligatoria.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad sobre el tratamiento de datos personales recae en el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilterisYucel/saru-llm-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Notas de entrenamiento (referenciadas por el autor): repositorio `saruapp/arabuluculuk-monorepo`, archivo `docs/FINE-TUNE-RUN-2026-11-26.md` (no se proporciona URL directa en la informacion disponible)
- llama.cpp: https://github.com/ggml-org/llama.cpp
