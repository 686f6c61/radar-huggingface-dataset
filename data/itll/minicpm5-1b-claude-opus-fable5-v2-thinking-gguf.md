# ITLL/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF

## Resumen

MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF es la distribucion cuantizada en formato GGUF del checkpoint de transformadores GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking, un ajuste fino del modelo base OpenBMB/MiniCPM5-1B. El repositorio lo publica el usuario ITLL y su proposito es facilitar el despliegue local en llama.cpp, Ollama, LM Studio, jan y KoboldCpp sin necesidad de infraestructura de servidor. El modelo conserva la plantilla de chat nativa de MiniCPM5 embebida en los metadatos del GGUF.

El modelo resuelve el problema de ejecutar un asistente conversacional con capacidad de razonamiento explicito (modo thinking) y de invocacion de herramientas en hardware modesto. Con 1.080.632.832 parametros totales y un contexto declarado de hasta 131.072 tokens en el `config.json` upstream, se posiciona como una opcion ligera para prototipado y automatizacion local. La version V2 refuerza el comportamiento de tool calling y function calling respecto a la V1, segun la model card.

La relevancia actual reside en la combinacion de tres factores: licencia Apache-2.0 heredada del modelo base, soporte bilingue ingles-chino y una mejora medible en benchmarks de invocacion de funciones (BFCL y API-Bank) frente a MiniCPM5-1B sin ajustar. El repositorio ocupa 3,3 GB e incluye cuantizaciones Q8_0 (aproximadamente 1,1 GB) y F16 (aproximadamente 2,1 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de OpenBMB/MiniCPM5-1B; no se detalla en la informacion disponible) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens segun `config.json` upstream; el contexto usable depende del runtime GGUF y del hardware |
| Tipos de cuantizacion | Q8_0 y F16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el checkpoint original esta en formato Transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenBMB/MiniCPM5-1B, un transformer decoder-only de aproximadamente 1.000 millones de parametros. La model card no detalla la composicion del dataset de preentrenamiento original ni el numero de tokens utilizados. Sobre esa base, el autor del checkpoint GnLOLot realizo un ajuste fino supervisado sobre datos denominados "Fable 5" en su version V2, orientado a reforzar el comportamiento de invocacion de herramientas y el seguimiento de instrucciones. No se especifica en la informacion disponible si se emplearon tecnicas de RLHF, DPO u otras tecnicas de alineacion adicionales.

La innovacion tecnica destacable de esta distribucion es la preservacion de la plantilla de chat nativa de MiniCPM5 dentro de los metadatos del GGUF, lo que permite que runtimes como llama.cpp, LM Studio o KoboldCpp apliquen el formato correcto de turnos sin configuracion manual. El modelo expone un modo thinking (razonamiento en cadena antes de la respuesta final) que puede desactivarse mediante `enable_thinking=False`, con parametros de muestreo diferenciados para cada modo: `temperature=0.9, top_p=0.95` en modo Think y `temperature=0.7, top_p=0.95` en modo No Think.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat integrada.
- Razonamiento explicito en modo thinking: emite bloques de cadena de pensamiento antes de la respuesta final.
- Tool calling y function calling reforzados en la version V2 respecto a la V1.
- Generacion de codigo, depuracion y flujos de ingenieria de software.
- Seguimiento de instrucciones con mayor adherencia a restricciones de tarea segun la model card.
- Soporte bilingue: ingles y chino.
- Contexto largo declarado de hasta 131.072 tokens (sujeto a limitaciones del runtime).
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).

## Casos de uso

- Asistente de programacion en local: el modelo puede generar funciones, explicar codigo y depurar errores ejecutandose en llama.cpp o LM Studio sobre un portatil, gracias a su tamano de 1B parametros y a la cuantizacion Q8_0 de aproximadamente 1,1 GB.
- Automatizacion de agentes con invocacion de herramientas: la mejora en BFCL live (63,33 % frente a 60,24 % del base) y API-Bank (22,10 % frente a 7,30 %) lo hace adecuado para pipelines donde el modelo debe seleccionar y rellenar funciones de una API definida.
- Prototipado de flujos con razonamiento explicito: el modo thinking permite inspeccionar la cadena de razonamiento en tareas de clasificacion o planificacion antes de integrar el modelo en produccion.
- Chatbot de soporte tecnico bilingue ingles-chino: el soporte nativo de ambos idiomas y la ventana de contexto amplia permiten gestionar conversaciones con historial extenso y documentacion adjunta.
- Procesamiento de documentos largos en local: con hasta 131.072 tokens de contexto declarado, puede resumir o extraer informacion de ficheros extensos siempre que el hardware permita cargar la ventana completa.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local mediante GGUF, es apto para escenarios donde los datos no pueden salir de la maquina, como analisis de codigo propietario o documentacion interna.
- Evaluacion comparativa de ajustes finos: sirve como referencia ligera para medir el impacto de tecnicas de post-entrenamiento en modelos de 1B dentro de un laboratorio de investigacion.

## Benchmarks y rendimiento

Resultados publicados en la model card para el checkpoint de transformadores MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking:

| Modelo | BFCL non_live | BFCL live | API-Bank |
|---|---|---|---|
| MiniCPM5-1B (Base) | 41,51 % | 60,24 % | 7,30 % |
| MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking | 43,06 % | 63,33 % | 22,10 % |

| Dominio Tau-Bench | MiniCPM5-1B (Base) | MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking |
|---|---|---|
| Airline | 0,34 (17/50) | 0,36 (18/50) |
| Retail | 0,052 (6/115) | 0,070 (8/115) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general o codigo en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q8_0 y aproximadamente 2,1 GB con F16, mas el espacio para la cache KV segun la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar la version Q8_0; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen para contextos largos. Tambien es viable en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en placas integradas con suficiente RAM compartida.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, jan, KoboldCpp y otros runtimes compatibles con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking (este) | 1,08 B | 131.072 tokens declarados | Tool calling + thinking | Apache-2.0 | GGUF, Transformers |
| MiniCPM5-1B (OpenBMB) | 1 B (aproximado) | 131.072 tokens declarados | Base generalista | Apache-2.0 | Transformers |
| MiniCPM5-1B-Claude-Opus-Fable5-Thinking (V1) | 1,08 B | 131.072 tokens declarados | Tool calling + thinking (version previa) | Apache-2.0 | GGUF |

La comparacion con modelos de otros fabricantes del mismo rango no esta disponible en la informacion proporcionada. Frente al modelo base, la V2 mejora BFCL live en 3,09 puntos porcentuales y API-Bank en 14,8 puntos porcentuales; frente a la V1, la model card indica un refuerzo del comportamiento de tool calling sin cuantificar la mejora.

## Limitaciones y advertencias

- El modelo puede emitir bloques de razonamiento antes de la respuesta final; los consumidores deben filtrar o procesar esos bloques si solo esperan texto de salida.
- Escala de 1B parametros: no es un modelo de frontera y su rendimiento en tareas complejas de razonamiento o conocimiento factual sera limitado en comparacion con modelos mayores.
- El contexto usable real depende del runtime GGUF y de la VRAM/RAM disponible; cargar 131.072 tokens exige una cache KV considerable.
- Sesgos conocidos: no se documentan en la informacion disponible; al heredar el preentrenamiento de MiniCPM5-1B, puede reproducir sesgos presentes en sus datos de origen.
- Riesgo de alucinacion: no cuantificado en la model card; es esperable en un modelo de este tamano, especialmente en tareas factuales.
- Cobertura idiomatica limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion.
- Los benchmarks publicados corresponden al checkpoint de transformadores; no se han publicado resultados especificos para las cuantizaciones GGUF, que pueden degradar ligeramente la calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ITLL/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF
- Checkpoint de transformadores: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking
- Version GGUF anterior (V1): https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- README en chino: https://huggingface.co/ITLL/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF/blob/main/README-cn.md
