# LoganResearch/Adaptive-Repetition-Controller-ARC

## Resumen

Adaptive Repetition Controller (ARC) es un adaptador LoRA de investigacion publicado por LoganResearch que implementa CF-HoT, una intervencion aprendida en tiempo de decodificacion para mitigar la degeneracion repetitiva en modelos de lenguaje autorregresivos. No es un modelo base autonomo: se aplica sobre LoganResearch/ARC-Base-8B, un modelo de 8.000 millones de parametros de la familia Llama, y anade un predictor de riesgo de apenas 50.000 parametros que estima, a partir de los estados ocultos de las 32 capas del transformer, si el siguiente token va a formar parte de un bucle degenerativo.

El problema que aborda es conocido: la repeticion no deseada en generacion long-form. Las soluciones habituales (repetition_penalty de Hugging Face, frequency_penalty de OpenAI, decodificacion contrastiva) aplican penalizaciones uniformes sobre tokens repetidos, sin distinguir entre repeticion natural (articulos, pronombres) y repeticion patologica. ARC aprende esa distincion y solo penaliza cuando el riesgo predicho supera un umbral, lo que segun el autor reduce la tasa de repeticion un 48,4 % y aumenta la diversidad Distinct-2 un 16,7 % sin tocar los pesos del modelo base.

Su relevancia ahora es metodologica: demuestra que una sonda lineal ligera sobre estados ocultos intermedios puede capturar senal predictiva de degeneracion y usarse para una intervencion quirurgica en los logits, con un coste de parametros practicamente nulo (0,0006 % del modelo base). Esta pensado para investigadores que trabajen en decodificacion controlada, no como sustituto de un pipeline de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Llama de 8B; incluye predictor de riesgo MLP de ~50K parametros con proyecciones por capa |
| Parametros totales | No disponible para el adaptador (repo de 0,2 GB); modelo base 8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base ARC-Base-8B, no declarada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El componente central es un predictor de riesgo que recibe los estados ocultos de las 32 capas del modelo base. Cada capa pasa por una proyeccion lineal de 4096 a 16 dimensiones; las 32 representaciones resultantes se agregan con pesos por capa normalizados por softmax (un parametro aprendido por capa), y el vector agregado atraviesa un MLP de dos capas ocultas de 64 neuronas con activacion GELU que emite un logit de riesgo. Durante la decodificacion, si el riesgo supera el umbral, se resta una penalizacion a los logits de los tokens recientes antes del muestreo. La intervencion no modifica la atencion ni las representaciones aprendidas del modelo base, lo que permite activarla y desactivarla sin recargar pesos.

El adaptador LoRA se entrena sobre ARC-Base-8B; la model card no especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO. La innovacion declarada es la agregacion aprendida por capas: distintas capas codifican informacion distinta y el modelo aprende cuales son mas predictivas del riesgo de repeticion. El autor reporta una separacion de 125x entre el riesgo medio en tokens que finalmente se repiten (0,998) y en tokens que no (0,008).

## Capacidades

- Generacion de texto en ingles con supresion adaptativa de repeticion en tiempo de decodificacion.
- Prediccion de riesgo de degeneracion a partir de estados ocultos, con F1 declarado de 0,99.
- Intervencion selectiva sobre logits: penaliza solo cuando el riesgo es alto, preservando repeticion natural.
- Mejora de diversidad lexica: Distinct-2 pasa de 0,836 a 0,976 segun el autor.
- Compatible con el ecosistema PEFT/Transformers: se carga como adaptador sobre el modelo base.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking de forma nativa; hereda unicamente las capacidades del modelo base.
- Multilingue: no; el tag de idioma declara solo ingles.

## Casos de uso

- Generacion long-form controlada: en la redaccion de articulos o informes extensos, el predictor detecta el inicio de un bucle y penaliza los tokens implicados, evitando que el modelo repita frases en parrafos largos donde las penalizaciones fijas degradan la fluidez.
- Investigacion en decodificacion: sirve como banco de pruebas para estudiar si los estados ocultos contienen senal predictiva de degeneracion y para comparar intervenciones aprendidas frente a penalizaciones heuristicas.
- Ajuste fino de pipelines de muestreo: equipos que ya usan repetition_penalty pueden sustituirlo por esta intervencion condicional y medir el impacto en Distinct-2 y en la tasa de repeticion con sus propios prompts.
- Generacion de resumenes y descripciones: en tareas donde el modelo tiende a repetir entidades o formulas, la penalizacion selectiva reduce la redundancia sin eliminar la repeticion gramatical necesaria.
- Chat multi-turno con respuestas largas: al mantener la coherencia en turnos extensos, evita que el modelo se quede atascado reformulando la misma idea, aunque el contexto maximo depende del modelo base.
- Experimentacion academica reproducible: al ser un adaptador de 0,2 GB con licencia Apache 2.0, permite replicar el metodo en laboratorios con una sola GPU y comparar con decodificacion contrastiva.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card; no verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Repetition Reduction | 48,4 % |
| Risk Separation | 125x |
| F1 Score | 0,99 |
| Risk @ Repeating Tokens | 0,998 |
| Risk @ Non-Repeating Tokens | 0,008 |

| Metrica de generacion | Baseline | Con CF-HoT | Cambio |
|---|---|---|---|
| Tasa de repeticion | 33,9 % | 17,5 % | -48,4 % |
| Distinct-2 | 0,836 | 0,976 | +16,7 % |

| Metodo | Adaptativo | Aprendido | Reduccion de repeticion |
|---|---|---|---|
| HuggingFace repetition_penalty | No | No | ~20-30 % |
| OpenAI frequency_penalty | No | No | ~25-35 % |
| Contrastive Decoding | No | No | ~30-40 % |
| CF-HoT (este) | Si | Si | 48,4 % |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,2 GB; el modelo base de 8B requiere aproximadamente 16 GB en bf16 y unos 5-6 GB en cuantizacion de 4 bits.
- GPU recomendadas: A100 40 GB u H100 para inferencia en bf16 sin cuantizar; RTX 4090 (24 GB) suficiente para el modelo base en bf16.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16 y en tarjetas de 8-12 GB con cuantizacion del modelo base, aunque el adaptador solo se distribuye en safetensors.
- Opciones de despliegue: Transformers + PEFT + accelerate segun la model card; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la intervencion sobre logits requeriria integracion a medida en esos motores.
- Latencia y throughput: no disponibles; el predictor anade un MLP de ~50K parametros por token generado, coste despreciable frente al forward del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| Adaptive Repetition Controller (ARC) | Adaptador LoRA + predictor | ~50K (adaptador) sobre base 8B | No disponible | Intervencion aprendida en decodificacion | Apache 2.0 |
| HuggingFace repetition_penalty | Heuristica de decodificacion | 0 | No aplica | Penalizacion uniforme | Apache 2.0 |
| OpenAI frequency_penalty | Heuristica de decodificacion | 0 | No aplica | Penalizacion por frecuencia | API propietaria |
| Contrastive Decoding | Tecnica de decodificacion | 0 | No aplica | Comparacion con modelo experto/amateur | Depende de implementacion |

No se dispone de comparativas con modelos de la misma categoria (adaptadores de control de generacion) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun el tag de idioma; el comportamiento en otros idiomas no esta documentado.
- Resultados declarados por el autor y marcados como no verificados; no hay evaluacion independiente ni publicacion revisada por pares (el paper figura como "forthcoming").
- Depende de ARC-Base-8B: no funciona como modelo autonomo y hereda las limitaciones, sesgos y alucinaciones del base.
- La intervencion sobre logits requiere acceso al bucle de decodificacion; no es compatible de forma directa con servidores de inferencia estandar sin modificaciones.
- El umbral de riesgo y la magnitud de la penalizacion no se detallan en la model card, lo que dificulta reproducir el comportamiento exacto.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigacion con 4 descargas no hay garantias de mantenimiento ni soporte.
- Riesgo de sobrepenalizacion en textos donde la repeticion es estilistica o necesaria (poesia, listas, formulas), no cuantificado en la model card.
- No se especifican requisitos de contexto maximo ni comportamiento en generaciones muy largas mas alla de los resultados declarados.

## Enlaces

- Hugging Face: https://huggingface.co/LoganResearch/Adaptive-Repetition-Controller-ARC
- Modelo base: https://huggingface.co/LoganResearch/ARC-Base-8B
- GitHub: https://github.com/Loganwins/HolonomyTransformer
- Paper: no disponible (figura como "forthcoming" en la model card)
