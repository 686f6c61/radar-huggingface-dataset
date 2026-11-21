# medievalo/Qwen2.5-1.5B-Arabizi-MSA-Transliterator

## Resumen

Qwen2.5-1.5B-Arabizi-MSA-Transliterator es un ajuste fino del modelo Qwen2.5-1.5B-Instruct de Alibaba, desarrollado por el usuario medievalo, cuyo proposito es convertir texto en arabe escrito con alfabeto latino (arabizi o franco-arabe) y arabe estandar moderno (MSA) transcrito foneticamente a escritura arabe nativa. Por ejemplo, transforma "salam" en "سلام" y resuelve digitos foneticos como 3 (ع), 7 (ح) o 9/q (ق).

El modelo aborda un problema practico de la comunidad arabohablante: escribir en arabe con teclados QWERTY sin distribucion arabe, asi como la normalizacion de texto ruidoso procedente de chats y redes sociales para su uso en pipelines de PLN en arabe. Cubre MSA y dialectos magrebi, egipcio, levantino y del Golfo.

Se trata de un modelo compacto de 1.543.714.304 parametros (1,5B), con licencia Apache 2.0, publicado en noviembre de 2026 y con cero descargas en el momento de la ficha. Su interes radica en que mejora drasticamente la transliteracion respecto al modelo base en zero-shot, reduciendo el Character Error Rate de 0,7206 a 0,2947 y elevando el chrF++ de 16,25 a 40,74.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con ajuste LoRA fusionado |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-1.5B-Instruct; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; sin GGUF oficial) |
| Idiomas soportados | ar, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tamano del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2, y se ajusta mediante LoRA con rango r=16, lora_alpha=32 aplicado a todas las capas de proyeccion lineal. El entrenamiento consistio en una epoca con learning rate 2e-4, scheduler coseno y tamano de lote efectivo de 32; posteriormente los adaptadores se fusionaron en pesos FP16.

Los datos de entrenamiento provienen del dataset medievalo/arabizi-msa-transliteration, con aproximadamente 36.000 pares paralelos latin-arabe que combinan corpus publicos de arabizi multidialectal y pares sinteticos de MSA fonetico. La perdida de validacion final fue de 0,8018, con una precision media de token del 84,54%. No se documenta el uso de RLHF ni DPO; el ajuste es supervisado sobre pares de transliteracion.

## Capacidades

- Transliteracion de arabizi (alfabeto latino) a escritura arabe nativa, incluyendo la resolucion de digitos foneticos (3, 7, 9, q) segun el contexto.
- Cobertura unificada de MSA y dialectos magrebi (marroqui, tunecino, argelino), egipcio, levantino y del Golfo.
- Resolucion contextual de ortografia: ta marbuta (ة) y colocacion de hamza a partir de la frase.
- Salida directa en escritura arabe sin preambulo conversacional ni texto de relleno.
- Generacion de texto conversacional heredada del modelo base (formato chat con apply_chat_template).
- Capacidades multilingues limitadas a arabe e ingles segun la model card.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Escritura en arabe con teclado QWERTY: el modelo convierte lo que el usuario teclea en alfabeto latino ("3afak sift liya l'adresse dyal dar") a escritura arabe ("عافاك سيفت ليا الAdresse ديال دار"), permitiendo redactar en arabe sin distribucion de teclado arabe.
- Normalizacion de texto de redes sociales: preprocesar mensajes de chat y publicaciones con arabizi antes de alimentar pipelines de analisis de sentimiento, topic modeling o NER en arabe.
- Preprocesamiento para PLN en arabe: convertir corpus ruidosos en latin a escritura arabe estandar para modelos posteriores de traduccion, resumen o clasificacion.
- Preservacion dialectal en transcripcion: al mantener el dialecto del hablante (magrebi, egipcio, levantino o del Golfo) en lugar de normalizar a MSA, es util para estudios sociolinguisticos y datasets dialectales.
- Digitalizacion de conversaciones informales: transformar historiales de mensajeria con arabizi a texto arabe legible para archivo o busqueda.
- Generacion de datos de entrenamiento: producir pares latin-arabe adicionales para aumentar datasets de transliteracion o de normalizacion ortografica.

## Benchmarks y rendimiento

Evaluacion sobre el split de test estratificado multidialectal del dataset medievalo/arabizi-msa-transliteration (MSA, egipcio, levantino, magrebi y del Golfo):

| Modelo | Character Error Rate (CER) | chrF++ |
|---|---|---|
| Qwen/Qwen2.5-1.5B-Instruct (zero-shot) | 0,7206 | 16,25 |
| medievalo/Qwen2.5-1.5B-Arabizi-MSA-Transliterator (v1.0) | 0,2947 | 40,74 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en FP16 (coincide con el tamano del repositorio); en cuantizacion de 8 bits rondaria 1,6 GB y en 4 bits unos 0,9 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para FP16, como RTX 3050, RTX 3060, RTX 4060 o superiores; para mayor throughput, A100 o H100.
- Cabe en GPU consumer: si, en la mayoria de tarjetas graficas modernas con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (con device_map="auto"), text-generation-inference (el modelo incluye el tag text-generation-inference y endpoints_compatible); no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medievalo/Qwen2.5-1.5B-Arabizi-MSA-Transliterator | 1,5B | no disponible | Transliteracion arabizi/MSA a arabe | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible | Generacion de texto general | Apache 2.0 | Hugging Face |
| Otros transliteradores arabizi | no disponible | no disponible | Transliteracion | no disponible | no disponible |

La comparacion directa con otros transliteradores arabizi especializados no esta disponible en la informacion proporcionada. Frente a su modelo base, la mejora en CER (0,7206 a 0,2947) y chrF++ (16,25 a 40,74) es el dato comparativo documentado.

## Limitaciones y advertencias

- Sobreinsercion de vocales largas en MSA formal: al escribir vocales cortas explicitas (tashkeel) en MSA, como "kayfa 7aluka" o "uridu", el modelo puede insertar vocales largas adicionales ("كيفا حلوك", "اوردي"). El autor lo atribuye a que el split sintetico de MSA elimino el tashkeel antes de la conversion y lo planifica para la v1.1.
- La salida es siempre arabe sin vocalizar (sin tashkeel).
- Riesgo de alucinacion y de errores ortograficos en entradas ambiguas o muy ruidosas; el CER de 0,2947 implica que aproximadamente un 30% de caracteres pueden diferir del texto de referencia.
- Cobertura dialectal limitada a los dialectos representados en el dataset (magrebi, egipcio, levantino y del Golfo); otros dialectos o variedades no documentadas pueden degradar el rendimiento.
- Idiomas soportados limitados a arabe e ingles; no se garantiza comportamiento en otras lenguas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el rendimiento en el dominio concreto antes de produccion.
- Modelo con cero descargas y sin validacion externa en el momento de la ficha; considerar su madurez limitada.
- No se publican pesos cuantizados oficiales, lo que puede complicar el despliegue en entornos de bajos recursos sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medievalo/Qwen2.5-1.5B-Arabizi-MSA-Transliterator
- Dataset de entrenamiento: https://huggingface.co/datasets/medievalo/arabizi-msa-transliteration
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
