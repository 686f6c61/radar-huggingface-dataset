# mradermacher/persian-g2p-0.6b-GGUF

## Resumen

El modelo `persian-g2p-0.6b` es un modelo especializado en conversión grafema-a-fonema (G2P, grapheme-to-phoneme) para persa (farsi), desarrollado originalmente por el usuario `mehdi-hf` y cuantizado a formato GGUF por `mradermacher`. Su función es transformar texto escrito en persa a su representación fonética, resolviendo dos problemas clásicos del idioma: la desambiguación de homógrafos (palabras con la misma grafía pero distinta pronunciación) y la correcta identificación del ezafe (la vocal enclítica que marca relaciones genitivas y adjetivales). Es una pieza clave en pipelines de síntesis de voz (TTS) en persa.

El modelo cuenta con 596.049.920 parámetros (aproximadamente 0,6 mil millones) y está construido sobre una arquitectura de tipo Qwen3, según las etiquetas de la model card. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Esta versión GGUF, publicada el 23 de noviembre de 2026, incluye doce cuantizaciones estáticas que van desde Q2_K (0,4 GB) hasta f16 (1,3 GB), lo que lo hace desplegable en hardware muy modesto.

La relevancia actual del modelo radica en su especialización: frente a modelos de propósito general, un G2P dedicado con 0,6B parámetros ofrece una precisión superior en las particularidades fonéticas del persa a un coste computacional mínimo. Está entrenado sobre el dataset `MahtaFetrat/HomoRich-G2P-Persian`, diseñado específicamente para cubrir homógrafos y ezafe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (según etiquetas de la model card) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (versión cuantizada); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base `mehdi-hf/persian-g2p-0.6b` emplea una arquitectura transformer de tipo Qwen3, según las etiquetas declaradas en la model card. Con 596 millones de parámetros, se trata de un modelo compacto diseñado específicamente para la tarea G2P en persa, no para generación de texto general. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

El entrenamiento se realizó sobre el dataset `MahtaFetrat/HomoRich-G2P-Persian`, que por su nombre y las etiquetas asociadas está orientado a cubrir homógrafos (homograph-disambiguation) y el ezafe. La model card original no proporciona detalles adicionales sobre hiperparámetros, composición del corpus ni innovaciones técnicas específicas más allá de la especialización en estas dos problemáticas fonéticas del persa.

## Capacidades

- Conversión grafema-a-fonema (G2P) de texto persa a representación fonética.
- Desambiguación de homógrafos: resuelve la pronunciación correcta de palabras con la misma grafía pero distinta lectura.
- Identificación y marcado del ezafe en contextos genitivos y adjetivales.
- Soporte para pipelines de síntesis de voz (TTS) en persa, como etapa de preprocesamiento fonético.
- Modelo monolingüe: únicamente persa (farsi).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.
- Etiquetado como compatible con endpoints (endpoints_compatible) y de tipo conversacional en los tags de Hugging Face, aunque su función real es la transformación fonética.

## Casos de uso

- Síntesis de voz (TTS) en persa: el modelo actúa como etapa intermedia que convierte el texto de entrada en una secuencia fonética precisa, resolviendo homógrafos y ezafe antes de pasarla al sintetizador. Es su aplicación principal y para la que fue entrenado.
- Sistemas de lectura en voz alta para accesibilidad: integrado en lectores de pantalla o aplicaciones de accesibilidad para usuarios persohablantes, donde la pronunciación correcta de homógrafos es crítica para la comprensión.
- Asistentes de voz en persa: preprocesamiento fonético en pipelines de asistentes conversacionales que necesitan generar respuestas habladas naturales y correctas.
- Diccionarios y herramientas de aprendizaje de persa: generación automática de transcripciones fonéticas para cada entrada léxica, incluyendo la desambiguación de lecturas múltiples.
- Localización de contenido audiovisual: generación de guiones fonéticos para doblaje o subtitulado accesible en persa, donde la pronunciación del ezafe afecta a la naturalidad.
- Investigación lingüística y fonética computacional: herramienta de anotación automática de corpus persas con transcripciones fonéticas, útil para estudios de fonología y para entrenar otros modelos.
- Pipelines de datos para entrenamiento de TTS: generación masiva de pares texto-fonema para alimentar el entrenamiento de modelos de síntesis de voz en persa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB con cuantizaciones Q2_K a Q5_K_M; 0,6 GB con Q6_K; 0,7 GB con Q8_0; 1,3 GB con f16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 2 GB o más de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.).
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (0,6B) se espera inferencia en tiempo real en CPU y muy rápida en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| persian-g2p-0.6b (este) | 596M | no disponible | G2P persa | Apache 2.0 | GGUF, safetensors |
| mehdi-hf/persian-g2p-0.6b (base) | 596M | no disponible | G2P persa | Apache 2.0 | safetensors |
| Modelos G2P genéricos (p. ej. basados en reglas o seq2seq pequeños) | variable | no disponible | G2P multilingüe | variable | variable |

No se dispone de datos de benchmarks ni de modelos comparables directos documentados en la información proporcionada. La comparativa más directa es con su modelo base sin cuantizar, del que esta versión GGUF es una conversión estática.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta persa (farsi); no debe usarse para otras lenguas.
- Especializado exclusivamente en G2P: no es un modelo de generación de texto general, razonamiento ni código; usarlo fuera de su tarea producirá resultados deficientes.
- Riesgo de alucinación fonética: como todo modelo neuronal, puede generar transcripciones incorrectas en palabras raras, neologismos, nombres propios o préstamos no vistos en entrenamiento.
- La model card no documenta sesgos conocidos ni evaluación de robustez ante dominios fuera del corpus de entrenamiento.
- No se documenta la longitud de contexto, lo que limita el procesamiento de textos muy largos en una sola pasada; se recomienda segmentar.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar la precisión fonética; para producción se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset de entrenamiento para cumplir con posibles restricciones de datos.
- El repositorio registra 0 descargas en el momento de la consulta, lo que indica baja validación comunitaria; conviene evaluar el modelo en el dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/persian-g2p-0.6b-GGUF
- Modelo base: https://huggingface.co/mehdi-hf/persian-g2p-0.6b
- Dataset de entrenamiento: https://huggingface.co/datasets/MahtaFetrat/HomoRich-G2P-Persian
- Página de descargas del cuantizador: https://hf.tst.eu/model#persian-g2p-0.6b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
