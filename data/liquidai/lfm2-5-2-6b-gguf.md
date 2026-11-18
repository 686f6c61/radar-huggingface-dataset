# LiquidAI/LFM2.5-2.6B-GGUF

## Resumen

LFM2.5-2.6B-GGUF es la distribucion en formato GGUF del modelo LFM2.5-2.6B de Liquid AI, un modelo de lenguaje de 2.697.198.592 parametros (aproximadamente 2,7 mil millones) disenado especificamente para despliegue en dispositivo (on-device). Forma parte de la familia LFM2.5, que la compania presenta como una evolucion de la arquitectura hibrida LFM2 con preentrenamiento extendido y aprendizaje por refuerzo adicional. El repositorio incluye pesos cuantizados listos para llama.cpp, ademas de un checkpoint de destilacion con conciencia de cuantizacion (QAD) en Q4_0 y sus pesos fuente en safetensors FP32.

El modelo resuelve el problema de ejecutar inferencia de calidad en hardware modesto: portatiles, estaciones de trabajo sin GPU dedicada de gran VRAM o incluso dispositivos de borde. Con 2,7 mil millones de parametros y cuantizacion Q4_0, el peso se situa en el entorno de 1,5-1,7 GB, lo que permite cargarlo en CPU y en GPUs de consumo de gama media. El soporte declarado de 16 idiomas (arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita) lo hace util para aplicaciones multilingues locales.

La relevancia actual del modelo radica en la combinacion de tres factores: licencia propia LFM1.0 (no estandar, requiere revision), arquitectura hibrida orientada a eficiencia y disponibilidad inmediata en GGUF con soporte de llama.cpp, lo que reduce la friccion de adopcion. El repositorio acumula mas de 96.000 descargas, lo que indica traccion real en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (familia LFM2, segun model card); detalles internos no disponibles |
| Parametros totales | 2.697.198.592 (aproximadamente 2,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_0 (post-entrenamiento) y QAD Q4_0 (destilacion con conciencia de cuantizacion); pesos fuente FP32 en safetensors |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, marcada como "other") |
| Formato de pesos | GGUF y safetensors (checkpoint QAD en FP32) |

## Arquitectura y entrenamiento

Liquid AI describe LFM2.5 como una familia de modelos hibridos construida sobre la arquitectura LFM2, con preentrenamiento extendido y una fase posterior de aprendizaje por refuerzo. La model card del repositorio GGUF no detalla la composicion interna de la arquitectura (atencion, capas recurrentes o mezcla de ambas), el numero de tokens de entrenamiento ni la composicion del dataset; esa informacion se remite a la model card del modelo base LiquidAI/LFM2.5-2.6B.

La innovacion tecnica mas concreta que documenta el repositorio es la incorporacion de un checkpoint QAD (Quantization-Aware Distillation): un proceso de destilacion que tiene en cuenta la cuantizacion durante el entrenamiento, de modo que el modelo cuantizado a Q4_0 conserva mejor el comportamiento del modelo original que una cuantizacion posterior convencional. El repositorio distingue explicitamente entre `LFM2.5-2.6B-QAD-Q4_0.gguf` (QAD) y `LFM2.5-2.6B-Q4_0.gguf` (cuantizacion post-entrenamiento), ambos en formato Q4_0. Los pesos fuente QAD en FP32 se publican en el subdirectorio `qad/` para fine-tuning y experimentacion, con la advertencia de que los resultados QAD publicados aplican al GGUF Q4_0 y que la inferencia directa en FP32/BF16 u otros formatos de cuantizacion puede comportarse de forma distinta.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia incluida en el repositorio.
- Razonamiento y respuesta a preguntas en 16 idiomas, incluido el espanol.
- Generacion de codigo y tareas de texto estructurado (no se detalla soporte especifico de tool calling en la informacion disponible).
- Ejecucion local en CPU y GPU mediante llama.cpp, con parametros de generacion recomendados (`--temp 0.1 --top-k 50 --repeat-penalty 1.1`).
- Fine-tuning y experimentacion a partir de los pesos fuente QAD en FP32 mediante Transformers (`subfolder="qad"`).
- Compatibilidad con endpoints (tag `endpoints_compatible` en el repositorio).
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente conversacional local en portatil: con cuantizacion Q4_0 el modelo ocupa del orden de 1,5-1,7 GB, por lo que puede ejecutarse en CPU con llama.cpp sin GPU dedicada, adecuado para prototipos de chat privados sin enviar datos a la nube.
- Procesamiento de documentos multilingues en el borde: el soporte de 16 idiomas permite clasificar, resumir o extraer informacion de textos en espanol, frances, aleman, arabe o japones en un dispositivo local, sin depender de APIs externas.
- Integracion en aplicaciones de escritorio y moviles: al distribuirse como GGUF y ser compatible con llama.cpp, puede embeberse en herramientas de escritorio o apps moviles que necesitan generacion de texto offline.
- Generacion de codigo asistida en entornos con recursos limitados: el modelo puede completar fragmentos y explicar codigo en local; conviene validar la calidad con benchmarks propios, ya que no se publican resultados en la informacion disponible.
- Filtrado y moderacion de contenido en tiempo real: un modelo de 2,7 B cuantizado ofrece latencia baja en CPU, lo que permite clasificar mensajes entrantes en un pipeline de moderacion sin coste de API.
- Fine-tuning especifico de dominio: los pesos fuente QAD en FP32 permiten ajustar el modelo a un dominio concreto (legal, sanitario, atencion al cliente) y volver a cuantizar despues, manteniendo la ventaja del entrenamiento con conciencia de cuantizacion.
- Despliegue en entornos air-gapped: organizaciones con requisitos de confidencialidad pueden ejecutar el modelo completamente offline en hardware propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la documentacion del modelo base (LiquidAI/LFM2.5-2.6B) para mas detalles, pero no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas numericas en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-1,7 GB con Q4_0 (estimacion a partir de 2,7 B parametros y 4 bits por peso, mas overhead de contexto); no confirmada por el autor.
- Pesos fuente FP32: del orden de 10,8 GB (2,7 B x 4 bytes), mas overhead, para fine-tuning o inferencia sin cuantizar.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con 4 GB o mas de VRAM deberia poder alojar la version Q4_0.
- Cabe en GPU de consumo: si, previsiblemente en practicamente toda la gama actual (RTX 3060 en adelante, e incluso integradas con memoria compartida), aunque no hay confirmacion oficial.
- Opciones de despliegue: llama.cpp (soporte documentado con `llama-cli -hf`), y por extension del formato GGUF, otros runners compatibles como Ollama o servidores basados en llama.cpp; vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-GGUF | 2,7 B | no disponible | lfm1.0 | GGUF, safetensors | Hibrido, orientado a on-device, QAD Q4_0 |
| Alternativas de ~2-3 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa numerica con modelos de la misma categoria. La model card no incluye tablas comparativas ni referencias a modelos competidores.

## Limitaciones y advertencias

- Licencia LFM1.0: es una licencia propia de Liquid AI, no una licencia open source estandar. Es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial; la informacion disponible no detalla las restricciones concretas.
- Sesgos conocidos: no documentados en la informacion disponible; como todo modelo entrenado con datos web, es previsible que herede sesgos de esos datos.
- Riesgo de alucinacion: no cuantificado por el autor; en un modelo de 2,7 B el riesgo es estructuralmente mayor que en modelos de mayor tamano.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; el rendimiento en los 16 idiomas declarados puede variar y no se publican evaluaciones por idioma.
- Comportamiento dependiente de la cuantizacion: los resultados QAD publicados aplican al GGUF Q4_0; la inferencia en FP32/BF16 u otros formatos puede diferir, segun advierte el propio autor.
- Parametros de generacion recomendados especificos (`--temp 0.1 --top-k 50 --repeat-penalty 1.1`): desviarse de ellos puede degradar la calidad de las respuestas.
- No se documentan capacidades de tool calling, agentes ni vision; no asumir su disponibilidad en produccion sin validacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Checkpoint QAD Q4_0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/blob/main/LFM2.5-2.6B-QAD-Q4_0.gguf
- Pesos fuente QAD (safetensors): https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/tree/main/qad
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Plataforma LEAP: https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
