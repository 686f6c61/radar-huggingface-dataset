# mradermacher/Baligh-1.7B-i1-GGUF

## Resumen

Baligh-1.7B es un modelo de lenguaje de 1.700 millones de parametros desarrollado por Kandil7, especializado en arabe y en dominio islamico. Parte de la arquitectura Qwen3 y ha sido sometido a un proceso de continued-pretraining sobre corpus arabes de gran escala, seguido de instruction-tuning mediante QLoRA. Esta version concreta, publicada por mradermacher, es una recuantizacion en formato GGUF con tecnicas de imatrix (importance matrix) para preservar la calidad en cuantizaciones agresivas.

El modelo resuelve el problema de la baja representacion del arabe y del conocimiento islamico en los LLM generalistas. Su tamano compacto (1,7B) lo hace desplegable en hardware de consumo, lo que resulta relevante para aplicaciones de atencion al cliente, consulta de fatwas y procesamiento de texto arabe en entornos con recursos limitados.

La relevancia actual radica en la combinacion de un modelo base moderno (Qwen3), un entrenamiento especifico de dominio y una distribucion en multiples cuantizaciones GGUF (desde IQ1_S hasta Q6_K) que cubren desde entornos de muy baja memoria hasta configuraciones de alta fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3) |
| Parametros totales | 1.034.740 (dato reportado en safetensors del repo base; el nombre comercial indica 1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (imatrix) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3, una arquitectura transformer densa. El proceso de entrenamiento consta de dos fases: continued-pretraining sobre un corpus arabe compuesto por ArabicWeb24 (LightOn), ArabicText-Large, TheArabicPile_Dialects (Premio AI) y CIDAR (arbml), y posteriormente instruction-tuning mediante QLoRA sobre datasets de instrucciones arabes (evol-instruct-arabic de FreedomIntelligence) y un corpus de fatwas islamicas (islamweb-fatwa-ar de Kandil7).

La innovacion principal reside en la especializacion de dominio: el continued-pretraining sobre corpus arabes dialectales y clasicos, combinado con el ajuste sobre fatwas, produce un modelo con conocimiento profundo del arabe y del derecho islamico que un modelo generalista del mismo tamano no alcanza. La recuantizacion con imatrix de mradermacher permite preservar la perplejidad en cuantizaciones de 2-4 bits, donde los modelos pequenos suelen degradarse gravemente. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto en arabe e ingles, con especial fluidez en registro formal y religioso.
- Razonamiento y respuesta a preguntas sobre derecho islamico (fiqh, fatwas).
- Comprension de dialectos arabes gracias al corpus TheArabicPile_Dialects.
- Instrucciones multi-turno (instruction-tuned mediante QLoRA).
- Procesamiento de texto clasico arabe y contenido web contemporaneo.
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada a arabe e ingles.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno en arabe formal y dialectal, adecuado para bancos, telcos y comercio electronico en paises del Golfo y el Magreb.
- Consulta de fatwas y orientacion religiosa: el ajuste sobre islamweb-fatwa-ar lo hace util como asistente de primera linea en aplicaciones de consulta islamica, siempre con supervision humana.
- Procesamiento de documentos arabes: clasificacion, resumen y extraccion de informacion de textos arabes clasicos y contemporaneos en pipelines de digitalizacion.
- Traduccion asistida ar-en: apoyo a traductores en la version inglesa de textos arabes, con conocimiento del contexto cultural.
- Moderacion de contenido en foros arabes: deteccion de discurso inapropiado con comprension de dialectos que los modelos generalistas suelen fallar.
- Despliegue en edge o entornos con poca VRAM: con cuantizaciones Q4_K_M (aprox. 1 GB) cabe en GPUs de 4-8 GB o incluso en CPU, permitiendo inferencia local en paises con infraestructura limitada.
- Educacion: generacion de material didactico de lengua arabe y ciencias islamicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,5 GB (IQ1_S) y 1,5 GB (Q6_K) para los pesos; anadir overhead de contexto KV cache (dependiente de la longitud de contexto, no especificada).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060). Para mayor throughput, RTX 4090 o A100, aunque el modelo esta sobredimensionado para estas GPUs.
- Cabe en GPU consumer: si, en practicamente todas las GPUs modernas con 4 GB o mas; tambien en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF), TGI.
- Latencia y throughput: no disponibles. Por tamano, se espera inferencia en tiempo real en GPU consumer y aceptable en CPU con cuantizaciones bajas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Baligh-1.7B | ~1,7B | no disponible | ar, en | Apache 2.0 | GGUF, safetensors |
| Qwen3-1.7B | 1,7B | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |
| Fanar-1-9B | 9B | no disponible | ar, en | no disponible | safetensors |
| ALLaM-7B | 7B | no disponible | ar, en | no disponible | safetensors |

Baligh-1.7B se distingue por su especializacion islamica y su reducido tamano, aunque carece de la cobertura multilingue de Qwen3 y de la escala de Fanar o ALLaM. Los datos de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- Sesgos: el corpus de entrenamiento incluye textos religiosos y web arabe, lo que puede introducir sesgos doctrinales y culturales; no se ha documentado un proceso de alineacion etica.
- Alucinacion: riesgo elevado en un modelo de 1,7B, especialmente en consultas de fatwas donde una respuesta incorrecta tiene consecuencias graves; requiere validacion humana.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar tareas de contexto largo.
- Idioma: cobertura limitada a arabe e ingles; no apto para otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la exactitud del contenido religioso.
- Produccion: el dato de parametros en safetensors (1.034.740) es incoherente con el nombre comercial (1,7B), lo que sugiere un posible error de reporte; conviene verificar antes de dimensionar infraestructura.
- Fecha de creacion futura (2026-11-19) en los metadatos, lo que indica posible inconsistencia en el registro del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Baligh-1.7B-i1-GGUF
- Modelo base: https://huggingface.co/Kandil7/Baligh-1.7B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Baligh-1.7B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Baligh-1.7B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
