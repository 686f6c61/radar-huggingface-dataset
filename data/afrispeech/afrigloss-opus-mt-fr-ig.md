# AfriSpeech/afrigloss-opus-mt-fr-ig

## Resumen

AfriSpeech/afrigloss-opus-mt-fr-ig es un modelo de traduccion automatica frances → igbo desarrollado por AfriSpeech dentro del marco Afri-Gloss-MT. Se trata de un fine-tuning de MarianMT (arquitectura transformer encoder-decoder de OPUS-MT) con 74.834.364 parametros, disenado especificamente para traduccion con restricciones de glosario o terminologia controlada.

La caracteristica diferencial del modelo es la capacidad de inyectar terminos objetivo en el texto fuente delimitados por angulos (`<termino>`), de modo que la traduccion generada preserva esos terminos de forma fluida en la salida. Esto resuelve el problema de consistencia terminologica en traduccion especializada, un requisito habitual en dominios tecnicos, legales o medicos donde la variacion lexica no es aceptable.

El modelo es relevante para el ecosistema de lenguas africanas de bajos recursos, donde los sistemas de traduccion genericos suelen producir traducciones inconsistentes de terminologia especializada. Su tamano reducido (0,3 GB en safetensors) y su licencia Apache 2.0 lo hacen adecuado para despliegue en produccion tanto en CPU como en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT / OPUS-MT) |
| Parametros totales | 74.834.364 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via transformers) |
| Idiomas soportados | frances (fr) → igbo (ibo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura MarianMT, un transformer encoder-decoder con atencion multi-cabeza estandar, optimizado para traduccion automatica neuronal. MarianMT es conocido por su eficiencia computacional y su idoneidad para despliegue en entornos con recursos limitados, en contraste con modelos de traduccion de mayor tamano basados en LLM.

El fine-tuning se realizo sobre el subconjunto `ig` del dataset AfriSpeech/gloss-mt-train-fr, construido a partir de corpus paralelos de AfriSpeech/africa-corpus y AfriSpeech/african-corpus-jw. Segun la model card, el entrenamiento utilizo corpus bilingues completos con sustituciones verificadas de sintagmas nominales in-place al 100%, lo que ensena al modelo a respetar los terminos inyectados entre angulos. No se especifica el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un modelo de traduccion supervisada, lo habitual seria entrenamiento con perdida de entropia cruzada sobre pares paralelos.

La innovacion principal es el mecanismo de restriccion de glosario zero-shot: el modelo aprende a identificar tokens delimitados por `<...>` en la fuente y a reproducirlos como terminos fijos en la traduccion, manteniendo la fluidez gramatical del resto de la oracion.

## Capacidades

- Traduccion automatica frances → igbo con salida fluida.
- Control de terminologia mediante inyeccion de terminos entre angulos (`<termino>`) en el texto fuente.
- Preservacion de terminos de glosario en la traduccion generada (zero-shot terminology control).
- Traduccion de oraciones simples y compuestas con sustitucion in-place de sintagmas nominales.
- Inferencia rapida en CPU y GPU gracias al tamano reducido del modelo.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del par fr → igbo.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Traduccion tecnica con terminologia controlada: en documentacion de producto o manuales, se inyectan los terminos tecnicos entre angulos para garantizar que la traduccion al igbo use el lexico aprobado por el equipo de localizacion, evitando variaciones inconsistentes.
- Localizacion de interfaces y software: integracion en pipelines de localizacion donde los nombres de funciones, menus o campos deben traducirse de forma uniforme; el modelo preserva los terminos inyectados sin romper la gramatica de la frase.
- Traduccion de contenido legal o administrativo: en contratos o formularios donde ciertos terminos juridicos tienen equivalentes fijados por normativa, el glosario inyectado asegura el cumplimiento terminologico.
- Traduccion medica y sanitaria: para materiales de salud publica dirigidos a hablantes de igbo, donde terminos como nombres de enfermedades o tratamientos deben traducirse con precision y consistencia.
- Sistemas de traduccion asistida (CAT): el modelo puede actuar como motor de sugerencias en herramientas de traduccion asistida, donde el traductor define el glosario del proyecto y el modelo genera borradores que respetan esos terminos.
- Despliegue en entornos con recursos limitados: gracias a sus 74,8 millones de parametros y su formato safetensors de 0,3 GB, puede ejecutarse en CPU o en GPUs de gama baja para servicios de traduccion en linea o procesamiento por lotes.
- Investigacion en lenguas de bajos recursos: sirve como base para experimentos de traduccion con restricciones lexicas en igbo y para comparar tecnicas de terminologia controlada en lenguas africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,3 GB para los pesos, mas overhead de activaciones y tokenizador; en la practica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 0,15 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en GTX 1650, RTX 3050, RTX 4090, A100 o H100 sin problemas.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: transformers (MarianMTModel/MarianTokenizer), y en general cualquier runtime compatible con modelos Marian/OPUS-MT; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera inferencia en milisegundos por oracion en GPU y decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriSpeech/afrigloss-opus-mt-fr-ig | 74,8 M | no disponible | fr → igbo | Apache 2.0 | HuggingFace |
| Helsinki-NLP/opus-mt-fr-ig (OPUS-MT generico) | no disponible en la informacion | no disponible | fr → igbo | no disponible en la informacion | HuggingFace |
| NLLB-200 (variante destilada 600M) | 600 M | no disponible | multilingue (200 lenguas, incluye igbo) | CC-BY-NC 4.0 (no comercial) | HuggingFace |

La comparativa se limita a alternativas de traduccion fr → igbo; no se dispone de datos de rendimiento comparativo en la informacion proporcionada. La ventaja principal del modelo Afri-Gloss-MT frente a OPUS-MT generico es el control de glosario; frente a NLLB-200, su licencia Apache 2.0 permite uso comercial sin restricciones y su tamano es mucho menor.

## Limitaciones y advertencias

- Solo soporta la direccion frances → igbo; no se documenta traduccion inversa ni otros pares de idiomas.
- La longitud de contexto no esta especificada; oraciones muy largas pueden degradar la calidad o truncarse.
- Riesgo de alucinacion y de traduccion incorrecta en dominios especializados fuera de los datos de entrenamiento.
- La eficacia del control de glosario depende de que los terminos inyectados sigan el formato `<termino>` y de que el modelo los haya visto en contextos similares durante el entrenamiento.
- No se documentan sesgos especificos, pero al entrenarse sobre corpus paralelos puede heredar sesgos de las fuentes originales.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones de los datasets de entrenamiento subyacentes.
- El modelo tiene solo 19 descargas y 0 likes en HuggingFace, lo que sugiere validacion limitada por parte de la comunidad; conviene evaluarlo en el dominio concreto antes de usarlo en produccion.
- No hay benchmarks publicados que permitan estimar su calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AfriSpeech/afrigloss-opus-mt-fr-ig
- Dataset de entrenamiento: https://huggingface.co/datasets/AfriSpeech/gloss-mt-train-fr
- Coleccion Afri-Gloss-MT Models: https://huggingface.co/collections/AfriSpeech/afri-gloss-mt-models-6adce3a3c13c6a86f07b6e6d
- Paper citado (referencia en model card): Owusu, Mich-Seth, "Afri-Gloss-MT: In-Place Glossary Constraints for African Machine Translation", arXiv preprint, 2026 (sin enlace directo disponible)
