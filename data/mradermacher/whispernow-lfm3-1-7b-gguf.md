# mradermacher/whispernow-lfm3-1.7b-GGUF

## Resumen
Whispernow LFM3 1.7B es un modelo de lenguaje especializado en limpieza y normalizacion de transcripciones de voz (transcript cleanup), desarrollado por el usuario category271 y distribuido en formato GGUF por mradermacher. Se construye sobre LFM3-1.7B de Liquid AI, un modelo de texto de 1.700 millones de parametros basado en la arquitectura tri-hybrid de la familia LFM3, disenada para agentes locales y aplicaciones especializadas con una ventana de contexto de 256K tokens y tool calling nativo. El modelo resuelve un problema concreto: tomar la salida cruda de un sistema de speech-to-text (con muletillas, repeticiones, puntuacion ausente y errores de segmentacion) y devolver un texto limpio y legible.

La relevancia de esta ficha radica en que el modelo original esta afinado sobre el dataset whispernow-cleanup y se ofrece exclusivamente en ingles, con cuantizaciones estaticas que van desde Q2_K (0,9 GB) hasta f16 (3,6 GB), lo que lo hace desplegable en hardware de consumo. La licencia lfm1.0 impone condiciones especificas que conviene revisar antes de un uso comercial.

Es importante senalar que este repositorio no contiene los pesos originales en safetensors, sino unicamente conversiones GGUF generadas por mradermacher; el modelo base es category271/whispernow-lfm3-1.7b. El pipeline no esta declarado en la model card y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 tri-hybrid (modelo base LFM3-1.7B de Liquid AI) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (segun documentacion de LFM3-1.7B) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (safetensors solo en el modelo base) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura LFM3 tri-hybrid de Liquid AI, presentada por el fabricante como la base de LFM3-1.7B para agentes locales, con 256K tokens de contexto y tool calling nativo. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

El ajuste especifico de Whispernow se realizo sobre el dataset category271/whispernow-cleanup, orientado a la tarea de transcript cleanup. La model card del repositorio GGUF no documenta hiperparametros, regimen de entrenamiento ni innovaciones tecnicas adicionales; la unica informacion verificable es la conversion a GGUF con quantize_version 2 y output_tensor_quantised 1, realizada por mradermacher.

## Capacidades
- Limpieza de transcripciones: eliminacion de muletillas, repeticiones y falsos arranques en la salida de sistemas de speech-to-text.
- Normalizacion de texto: restauracion de puntuacion, mayusculas y segmentacion en parrafos legibles.
- Generacion de texto conversacional: la etiqueta conversational aparece en los metadatos del repositorio.
- Tool calling nativo: heredado de la arquitectura LFM3-1.7B segun la documentacion de Liquid AI.
- Ventana de contexto larga: hasta 256K tokens, adecuada para transcripciones de reuniones o clases extensas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio nativo ni modo thinking en la informacion disponible.

## Casos de uso
- Postprocesado de dictado en productividad personal: el modelo recibe la transcripcion cruda de una herramienta de dictado y devuelve texto con puntuacion y parrafos, aprovechando su ajuste especifico sobre whispernow-cleanup.
- Limpieza de actas de reuniones: con 256K tokens de contexto puede procesar transcripciones de varias horas en una sola pasada y eliminar redundancias sin perder el hilo.
- Subtitulado y transcripcion de contenido audiovisual: normaliza la salida de ASR antes de publicar subtitulos, reduciendo el trabajo editorial manual.
- Integracion en pipelines de agentes de voz: al heredar tool calling nativo de LFM3, puede encadenarse con APIs de calendario o CRM tras limpiar la instruccion dictada por el usuario.
- Asistentes de accesibilidad: conversion de dictado a texto estructurado para usuarios con movilidad reducida, ejecutable en local gracias a las cuantizaciones de 1 GB.
- Despliegue en el borde (edge): las versiones Q4_K_S y Q4_K_M (1,2 GB) permiten ejecutar la limpieza de transcripciones en portatiles sin GPU dedicada mediante llama.cpp u Ollama.
- Preprocesado en sistemas de documentacion clinica o legal: normalizacion de notas dictadas antes de su almacenamiento, siempre que se valide la licencia lfm1.0 para el sector.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 0,9 GB para Q2_K, 1,2 GB para Q4_K_M, 1,9 GB para Q8_0 y 3,6 GB para f16, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3060, RTX 4060) es suficiente; en entornos de servidor, A100 o H100 no aportan ventaja por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, practicamente en todas las tarjetas modernas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| Whispernow LFM3 1.7B (esta ficha) | 1,73B | 256K | Limpieza de transcripciones en ingles | lfm1.0 | GGUF |
| LFM3-1.7B (Liquid AI) | 1,7B | 256K | Modelo de texto general para agentes locales | lfm1.0 | no disponible en la informacion |
| Modelos de limpieza de transcripciones de 1-2B | no disponible | no disponible | Transcript cleanup | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias
- Idioma: el modelo esta entrenado y etiquetado exclusivamente para ingles; su uso con transcripciones en castellano no esta respaldado por la model card.
- Licencia lfm1.0: es una licencia "other" con condiciones especificas; es imprescindible revisar el archivo LICENSE del modelo base antes de cualquier uso comercial.
- Riesgo de alucinacion: como todo modelo generativo, puede introducir palabras o frases no presentes en la transcripcion original durante la limpieza; conviene validar en dominios sensibles.
- Ausencia de benchmarks: no hay evaluacion publicada de calidad de limpieza, lo que dificulta estimar la tasa de error frente a alternativas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El repositorio contiene solo GGUF; para inspeccionar los pesos originales hay que acudir al modelo base category271/whispernow-lfm3-1.7b.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/whispernow-lfm3-1.7b-GGUF
- Modelo base: https://huggingface.co/category271/whispernow-lfm3-1.7b
- Dataset de ajuste: https://huggingface.co/datasets/category271/whispernow-cleanup
- Documentacion de LFM3-1.7B (Liquid AI): https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Pagina de conveniencia de mradermacher: https://hf.tst.eu/model#whispernow-lfm3-1.7b-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
