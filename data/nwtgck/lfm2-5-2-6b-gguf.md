# nwtgck/LFM2.5-2.6B-GGUF

## Resumen

LFM2.5-2.6B-GGUF es la version cuantizada en formato GGUF del modelo LiquidAI/LFM2.5-2.6B, publicada por el usuario nwtgck. Se trata de una reproduccion comunitaria pensada para ejecucion local con llama.cpp y otros runners compatibles con GGUF. El modelo base pertenece a la familia LFM2.5 de Liquid AI, una generacion de modelos hibridos disenada explicitamente para despliegue en dispositivo (on-device), que amplia la arquitectura LFM2 con preentrenamiento extendido y aprendizaje por refuerzo.

El modelo cuenta con 2.697.198.592 parametros (aproximadamente 2,7 mil millones), lo que lo situa en la categoria de modelos pequenos capaces de ejecutarse en hardware de consumo. Soporta 16 idiomas declarados (arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita) y esta etiquetado como conversacional.

Su relevancia actual radica en que permite desplegar un modelo multilingue de ~2,7B en portatiles, moviles o equipos sin GPU dedicada mediante cuantizacion GGUF. El repositorio incluye ademas un checkpoint especifico obtenido mediante Quantization-Aware Distillation (QAD) en formato Q4_0, distinto de la cuantizacion Q4_0 aplicada a posteriori sobre el modelo ya entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 hibrida (familia LFM2 de Liquid AI, optimizada para on-device); detalles internos completos no disponibles en la informacion proporcionada |
| Parametros totales | 2.697.198.592 (~2,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF; se menciona explicitamente Q4_0 (tanto posterior al entrenamiento como QAD). Otras cuantizaciones no detalladas |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base LiquidAI/LFM2.5-2.6B) |

## Arquitectura y entrenamiento

El modelo base LFM2.5 pertenece a la familia de modelos hibridos de Liquid AI, construida sobre la arquitectura LFM2 y orientada al despliegue en dispositivo. Segun la model card, LFM2.5 amplia el preentrenamiento de LFM2 y anade una fase de aprendizaje por refuerzo (reinforcement learning). No se detalla en la informacion proporcionada el numero exacto de tokens de entrenamiento, la composicion del dataset ni el uso concreto de tecnicas como RLHF o DPO mas alla de la mencion generica al aprendizaje por refuerzo.

La innovacion tecnica mas destacable documentada en esta ficha es la disponibilidad de un checkpoint QAD (Quantization-Aware Distillation) en formato Q4_0. Este checkpoint se distingue del Q4_0 obtenido mediante cuantizacion posterior al entrenamiento: el primero incorpora la cuantizacion dentro del proceso de destilacion, lo que habitualmente reduce la perdida de calidad respecto a la cuantizacion a posteriori. La model card recomienda parametros de generacion concretos para llama.cpp (temperatura 0.1, top-k 50, repeat-penalty 1.1), lo que sugiere un ajuste orientado a respuestas deterministicas y conversacionales.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline declarado: text-generation, etiqueta conversational).
- Soporte multilingue para 16 idiomas: arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integracion en infraestructuras de inferencia estandar.
- Ejecucion local mediante llama.cpp, con soporte de modo conversacion (flag --conversation).
- Capacidades de razonamiento y codigo: no confirmadas explicitamente en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es unicamente text-generation.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Cuantizacion QAD Q4_0 especifica para preservar calidad en entornos con poca memoria.

## Casos de uso

- Asistentes conversacionales en dispositivo: el modelo puede gestionar dialogos multi-turno ejecutandose localmente con llama.cpp, sin enviar datos a servidores externos, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Traduccion y atencion multilingue: con 16 idiomas soportados, puede emplearse en tareas de traduccion, resumen o atencion al cliente en mercados internacionales desde una unica instancia.
- Prototipado rapido en portatiles: al pesar aproximadamente 1,5-1,8 GB en Q4_0, permite iterar sobre prompts y flujos conversacionales en equipos sin GPU dedicada.
- Aplicaciones de escritorio y herramientas ofimaticas: integrable mediante llama.cpp o bindings compatibles (llama-cpp-python) para funciones de redaccion, reescritura y resumen offline.
- Despliegue en el borde (edge) y dispositivos embebidos: su tamano reducido y su orientacion on-device lo hacen apto para entornos con memoria limitada y sin conectividad.
- Clasificacion y extraccion de informacion en texto: uso como modelo base para tareas de etiquetado, categorizacion o extraccion de campos en pipelines de procesamiento documental.
- Evaluacion comparativa de cuantizaciones: el repositorio permite comparar la calidad del checkpoint QAD Q4_0 frente al Q4_0 posterior al entrenamiento en un mismo formato, util para estudiar el impacto de la destilacion consciente de cuantizacion.
- Chatbots de bajo coste en produccion: al ser un modelo de ~2,7B, el coste por token en GPU es bajo, lo que permite servir volumenes altos de peticiones sencillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web realizada no devolvio datos tecnicos relevantes sobre el modelo (los resultados obtenidos eran ajenos al mismo), y la model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): aproximadamente 5,4 GB en F16, ~2,9 GB en Q8_0 y ~1,5-1,8 GB en Q4_0. Son estimaciones derivadas del numero de parametros (2,7B), no datos publicados en la ficha.
- La cache KV anade memoria adicional que depende de la longitud de contexto, el numero de capas y la precision de la cache; no disponible en la informacion proporcionada.
- GPU recomendadas: no disponibles de forma explicita para este modelo. Por tamano, cualquier GPU consumer reciente (por ejemplo, gama RTX 30/40 con 6-8 GB o mas) deberia poder ejecutar las cuantizaciones Q4_0 y Q8_0.
- Compatible con CPU: si, gracias al formato GGUF y llama.cpp; el modelo esta pensado para despliegue on-device, por lo que puede ejecutarse sin GPU.
- Opciones de despliegue: llama.cpp (uso documentado en la model card), y por extension runners compatibles con GGUF como Ollama, LM Studio o bindings de llama-cpp-python. El tag endpoints_compatible sugiere compatibilidad con infraestructura de endpoints.
- Parametros de generacion sugeridos por el autor: temperatura 0.1, top-k 50, repeat-penalty 1.1 con llama-cli.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nwtgck/LFM2.5-2.6B-GGUF (este) | ~2,7B | no disponible | lfm1.0 | GGUF en HuggingFace |
| LiquidAI/LFM2.5-2.6B (base) | ~2,7B | no disponible | lfm1.0 | safetensors en HuggingFace |
| Alternativas de ~3B on-device (Llama 3.2 3B, Qwen2.5 3B, Gemma 2 2B) | ~2-3B | no disponible en la informacion proporcionada | varian; consultar cada modelo | safetensors y GGUF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con estas alternativas. La comparativa estructural se limita a la categoria de tamano y al formato de distribucion.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; el modelo base no documenta en esta ficha una evaluacion de sesgos.
- Riesgo de alucinacion: inherente a los modelos generativos de ~2,7B; no se han publicado evaluaciones de fidelidad o veracidad en la informacion disponible.
- Limitaciones de contexto: la longitud de contexto del modelo no se especifica en la informacion proporcionada, lo que impide garantizar tareas de contexto largo.
- Limitaciones de idioma: aunque se declaran 16 idiomas, el nivel de competencia real por idioma no esta documentado en la informacion disponible.
- Restricciones de licencia: la licencia es lfm1.0 (license: other). Es imprescindible revisar el texto completo de la licencia LFM 1.0 antes de cualquier uso comercial, ya que puede incluir condiciones especificas de atribucion o restricciones de uso.
- Naturaleza del repositorio: es una cuantizacion comunitaria (autor nwtgck), no oficial de Liquid AI; la calidad de las cuantizaciones y su mantenimiento dependen del autor.
- Diferenciacion de checkpoints: existen al menos dos archivos Q4_0 (QAD y posterior al entrenamiento) con comportamiento potencialmente distinto; conviene verificar cual se esta utilizando en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- Configuracion recomendada: el autor sugiere temperatura muy baja (0.1) y repeat-penalty 1.1; usar otros valores puede degradar la calidad de las respuestas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nwtgck/LFM2.5-2.6B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Repositorio GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF
- Checkpoint QAD Q4_0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/blob/main/LFM2.5-2.6B-QAD-Q4_0.gguf
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Plataforma LEAP: https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
