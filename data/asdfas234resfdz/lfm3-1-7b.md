# asdfas234resfdz/LFM3-1.7B

## Resumen
LFM3-1.7B es un modelo de lenguaje de texto de 1.730 millones de parametros (1,73B) desarrollado por Liquid AI y publicado en Hugging Face bajo el identificador `asdfas234resfdz/LFM3-1.7B`. Se trata de un checkpoint post-entrenado (finetune del modelo base `LiquidAI/LFM3-1.7B-Base`) orientado a agentes locales, tool calling, salidas estructuradas y ajuste fino especifico de dominio. Su propuesta central es ofrecer capacidades agenticas en el borde (edge), es decir, en telefonos y portatiles, con un consumo de memoria de aproximadamente 1 GB a 4 bits.

La arquitectura es un transformer hibrido de tres componentes (tri-hybrid) con 24 capas: 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Esta combinacion busca reducir el coste computacional del mecanismo de atencion clasico manteniendo una ventana de contexto de 256.000 tokens (entrada mas salida), un tamano notable para un modelo de este numero de parametros.

El modelo es relevante en el ecosistema open source porque cubre un nicho poco atendido: modelos pequenos, multilingues (16 idiomas) y con contexto muy largo que pueden ejecutarse en hardware de consumo y fine-tunearse en una sola GPU. No obstante, el propio autor advierte que no esta recomendado para programacion agentica ni razonamiento multi-paso complejo debido a su tamano reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido tri-hybrid: 24 capas (13 gated short convolutions, 5 sliding-window attention, 6 global attention) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | 4 bits mencionado por el autor (~1 GB de memoria); no se detallan otros esquemas |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento
La arquitectura es un transformer hibrido de tres tipos de capa dispuestos en 24 niveles: 13 capas de convolucion corta con compuerta, 5 capas de atencion de ventana deslizante y 6 capas de atencion global. El vocabulario es de 128.000 tokens. Esta mezcla persigue un equilibrio entre eficiencia en inferencia (las convoluciones y la atencion local son mas baratas que la atencion global completa) y capacidad de modelar dependencias de largo alcance gracias a las capas de atencion global intercaladas, lo que permite sostener la ventana de 256K tokens.

El checkpoint es un modelo post-entrenado sobre `LiquidAI/LFM3-1.7B-Base`. Segun la model card, el post-entrenamiento esta orientado a "agentic harnesses" como Hermes Agent, Pi y OpenClaw, lo que implica datos de instrucciones, tool calling y salidas estructuradas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa. El modelo requiere `custom_code` en transformers, lo que indica que la implementacion de la arquitectura no es nativa en la libreria y depende de codigo propio del autor.

## Capacidades
- Generacion de texto conversacional multi-turno en 16 idiomas (incluido el espanol).
- Tool calling y function calling, con entrenamiento explicito para harnesses agenticos.
- Salidas estructuradas (structured outputs), adecuadas para integracion con APIs y pipelines.
- Capacidades agenticas basicas dentro del contexto de 256K tokens.
- Ajuste fino de dominio en una sola GPU (single-GPU fine-tuning) segun el autor.
- Ejecucion en el borde: aproximadamente 1 GB de memoria a 4 bits, apto para telefonos y portatiles.
- No incluye vision, audio ni modo thinking explicito; es un modelo exclusivamente de texto.
- No recomendado por el autor para programacion agentica ni razonamiento multi-paso complejo.

## Casos de uso
- Atencion al cliente automatizada en dispositivo: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a sus 256K tokens de contexto, ejecutandose localmente en un portatil o telefono con ~1 GB a 4 bits, lo que evita enviar datos del usuario a la nube.
- Asistente personal offline multilingue: al soportar 16 idiomas, puede desplegarse como asistente local que responde en el idioma del usuario sin conexion, usando cuantizacion de 4 bits en hardware de consumo.
- Tool calling en aplicaciones de escritorio: integrado en un harness agentico (Hermes Agent, Pi, OpenClaw), el modelo puede invocar funciones locales (calendario, ficheros, APIs internas) y devolver salidas estructuradas para su parseo automatico.
- Extraccion de informacion y salidas estructuradas: en pipelines de procesamiento documental, el modelo puede transformar texto libre en JSON u otros formatos definidos, aprovechando el entrenamiento en structured outputs y su contexto largo para documentos extensos.
- Clasificacion y enrutamiento de tickets: fine-tuneado en una sola GPU sobre datos de dominio, puede clasificar y enrutar solicitudes de soporte en varios idiomas con bajo coste de inferencia.
- Prototipado rapido de agentes de dominio: equipos que necesitan validar un agente especializado (legal, sanitario, financiero) pueden ajustar el modelo base con sus propios datos y desplegarlo en hardware modesto antes de escalar a modelos mayores.
- Procesamiento de documentos largos en el borde: con 256K tokens de contexto, puede resumir o responder preguntas sobre contratos o informes extensos en un portatil, sin depender de servicios en la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la etiqueta `eval-results`, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de otras evaluaciones en los datos facilitados.

## Requisitos de hardware
- VRAM estimada: aproximadamente 1 GB a 4 bits segun el autor; en precision completa (fp16/bf16) se situaria en torno a 3,5 GB solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con 4-8 GB de VRAM es suficiente en cuantizacion; una RTX 4090 o A100/H100 permitiria ejecutar en fp16 y con batches mayores.
- Cabe en GPU consumer: si, en tarjetas con 4 GB o mas en cuantizacion de 4 bits; en fp16 requiere al menos 6-8 GB.
- Opciones de despliegue: transformers (con `custom_code`, requisito indicado por el autor). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B (este) | 1,73B | 256K | LFM Open License v1.0 | Hibrido tri-hybrid, 16 idiomas, orientado a agentes en el borde |
| Modelos comparables | no disponible | no disponible | no disponible | No se dispone de datos de alternativas en la informacion proporcionada |

No se dispone de informacion sobre modelos comparables de la misma categoria en los datos facilitados, por lo que no es posible establecer una comparativa con cifras verificables.

## Limitaciones y advertencias
- El propio autor desaconseja su uso para programacion agentica y razonamiento multi-paso complejo por su tamano reducido (1,73B).
- Riesgo de alucinacion: la model card recomienda usar retrieval o busqueda para tareas con alta carga de conocimiento, lo que implica que el conocimiento parametrico es limitado.
- Sesgos conocidos: no se documentan en la informacion disponible; como todo modelo entrenado con datos web, es probable que herede sesgos, pero no hay datos concretos.
- Limitaciones de contexto: aunque la ventana es de 256K tokens, no se documenta el rendimiento real en contextos muy largos (degradacion, atencion efectiva).
- Licencia: LFM Open License v1.0 (categoria "other"). No se detallan en la informacion disponible las restricciones exactas para uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de desplegar en produccion.
- Requiere `custom_code` en transformers, lo que anade complejidad de integracion y dependencia del codigo del autor.
- El repositorio tiene 0 likes y 438 descargas, y fue creado y actualizado en la misma fecha; es un checkpoint reciente con poca validacion comunitaria.
- No se confirma soporte en frameworks de inferencia optimizados (vLLM, llama.cpp, Ollama, TGI), lo que puede limitar el rendimiento en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/asdfas234resfdz/LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
- Coleccion LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
