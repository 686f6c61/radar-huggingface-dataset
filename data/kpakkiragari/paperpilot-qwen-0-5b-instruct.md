# kpakkiragari/PaperPilot-Qwen-0.5B-Instruct

## Resumen

PaperPilot-Qwen-0.5B-Instruct es un modelo de lenguaje pequeño (SLM) especializado, ajustado (fine-tuned) sobre `Qwen/Qwen2.5-0.5B-Instruct` por el desarrollador kpakkiragari. Su propósito es muy concreto: funcionar como asistente neuronal completamente local para inteligencia documental, traduciendo instrucciones en lenguaje natural a llamadas de herramientas (tool calls) en JSON estricto sobre más de 78 herramientas de manipulación de PDF y documentos del ecosistema PaperPilot.

El problema que resuelve es el de la orquestación de herramientas documentales sin conexión a la nube: en lugar de depender de un LLM grande vía API, este modelo de 494 millones de parámetros genera llamadas a herramientas válidas (simples o encadenadas en pipelines de varios pasos) con latencias inferiores a 50 ms por token, lo que lo hace viable en dispositivos locales, aplicaciones de escritorio Tauri o ejecución en navegador vía WebGPU/WASM.

Su relevancia está en el nicho de los agentes privados y "air-gapped": al ser 100 % offline y sin telemetría, es adecuado para entornos con requisitos estrictos de privacidad documental. Arquitecturalmente hereda el transformer de Qwen2.5, se distribuye en safetensors y GGUF, y su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5), ajustado desde Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 (~0,49 B, dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | No disponible (se distribuye en GGUF, pero no se detallan las variantes) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste supervisado sobre Qwen2.5-0.5B-Instruct, un transformer decoder de la familia Qwen2.5 de Alibaba. No es una arquitectura nueva: el valor del fine-tuning reside en el dominio, no en la arquitectura. El modelo se ha especializado en emitir JSON estricto conforme al esquema de las herramientas de PaperPilot, tanto para operaciones individuales como para arrays JSON de llamadas encadenadas en orden de ejecución.

Una innovación destacable del comportamiento aprendido es el encadenado dinámico de parámetros: el modelo es capaz de propagar rutas de ficheros intermedios entre pasos de un pipeline (por ejemplo, `/tmp/inter_1.pdf` -> `/tmp/inter_2.pdf` -> `output.pdf`), lo que permite descomponer objetivos complejos ("unir dos PDF y comprimir el resultado") en secuencias de tool calls coherentes. No se ha publicado información sobre el dataset de ajuste (tamaño en tokens, composición), ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generacion de JSON estricto para tool calling: emite llamadas válidas al esquema de más de 78 herramientas de PDF y documentos de PaperPilot.
- Orquestacion multi-paso: genera arrays JSON de llamadas encadenadas para flujos de trabajo complejos, con propagación automática de rutas de ficheros intermedios.
- Inteligencia documental local: traducción de instrucciones en lenguaje natural a operaciones sobre PDF (combinar, comprimir, etc.).
- Ejecucion en dispositivo: diseñado para correr vía WebGPU/WASM en navegador, en aplicaciones de escritorio Tauri, o con llama.cpp.
- Privacidad total: funcionamiento 100 % offline, sin telemetría ni envío de datos a la nube.
- Baja latencia: generación de tokens por debajo de 50 ms según el autor.
- Formato conversacional: usa chat template estándar de transformers (`apply_chat_template`) con roles system/user.
- No se ha publicado información sobre capacidades de razonamiento general, código, matemáticas, visión o audio; al ser un modelo de 0,5 B especializado, el uso general debe considerarse limitado.

## Casos de uso

- Automatizacion de flujos de trabajo con PDF en escritorio: un usuario escribe "combina estos tres informes y comprime el resultado" y el modelo genera el array JSON de tool calls que la aplicación ejecuta localmente, sin subir documentos a ningún servicio.
- Agentes documentales air-gapped: en entornos corporativos o gubernamentales sin salida a internet, el modelo actúa como cerebro de un agente que manipula contratos, expedientes o informes confidenciales.
- Integracion en aplicaciones Tauri: al ser ultraligero, puede embeberse en apps de escritorio multiplataforma como asistente neuronal para operaciones documentales, sin backend en la nube.
- Procesamiento en navegador con WebGPU/WASM: herramientas web que procesan PDF localmente pueden usar el modelo para interpretar la intención del usuario sin servidor.
- Pipelines de automatizacion documental: integración en scripts o flujos RPA donde un operador describe la tarea en lenguaje natural y el modelo la convierte en operaciones deterministas sobre ficheros.
- Asistentes de productividad offline: gestión local de bibliotecas de documentos (fusionar, dividir, comprimir, convertir) mediante chat, útil para equipos con políticas estrictas de privacidad.
- Prototipado rapido de agentes con tool calling: por su tamaño y licencia permisiva, es una base ligera para experimentar con patrones de orquestación de herramientas sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento facilitado por el autor es una latencia de generacion de tokens inferior a 50 ms, sin detallar el hardware empleado ni la metodologia de medicion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 494 M de parametros en FP16, aproximadamente 1 GB de VRAM o RAM; en cuantizacion GGUF (Q4/Q8), por debajo de 500 MB. No se han publicado cifras oficiales.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna o incluso CPU es suficiente dado el tamano del modelo. No hay recomendaciones oficiales.
- Cabe con holgura en GPUs de consumo: sí, en cualquier GPU con 2 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050 o superiores), e incluso integridas.
- Opciones de despliegue: transformers (codigo de ejemplo en la model card), llama.cpp (formato GGUF disponible), Ollama (compatible via GGUF), WebGPU/WASM en navegador y aplicaciones de escritorio Tauri. No se menciona soporte para vLLM o TGI.
- Latencia y throughput: el autor declara generacion de tokens por debajo de 50 ms; no se ha publicado throughput ni latencia end-to-end en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| PaperPilot-Qwen-0.5B-Instruct | ~494 M | Tool calling documental (PDF), offline | Apache-2.0 | Safetensors y GGUF en HuggingFace |
| Qwen2.5-0.5B-Instruct (base) | ~494 M | Uso general, chat, tool calling generico | Apache-2.0 | Ampliamente disponible |
| Octopus v2 (Nota: referencial) | ~2 B | Function calling en dispositivo | Restringida/No comercial | HuggingFace (licencia limitada) |

Frente a su modelo base (Qwen2.5-0.5B-Instruct), PaperPilot ofrece mayor fiabilidad en el esquema JSON de un ecosistema concreto de herramientas documentales y en el encadenado multi-paso, a costa de versatilidad general. Frente a alternativas de function calling en dispositivo de mayor tamano, su ventaja es el consumo de recursos minimo y la licencia Apache-2.0 plenamente comercial.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta afinado para tool calling sobre las herramientas de PaperPilot; su rendimiento en conversacion general, razonamiento o codigo no esta documentado y probablemente sea inferior al de la base Qwen2.5-0.5B-Instruct.
- Idioma: entrenado y documentado solo en ingles; no hay garantias de funcionamiento en espanol ni en otros idiomas.
- Riesgo de alucinacion en tool calls: como todo modelo pequeno, puede generar JSON con parametros incorrectos o inventar herramientas inexistentes; se recomienda validar el esquema de salida antes de ejecutar operaciones sobre ficheros.
- Contexto: la model card no especifica la longitud de ventana; hay que verificarla antes de procesar instrucciones largas o muchos documentos.
- Dataset de entrenamiento no documentado: no se conocen los datos usados en el fine-tuning, lo que dificulta evaluar sesgos o cobertura de casos limite.
- Discrepancia de identificadores: la model card usa el ID `KrushnaVardhanReddy/PaperPilot-Qwen-0.5B-Instruct` en el ejemplo de codigo, mientras que el repositorio es `kpakkiragari/PaperPilot-Qwen-0.5B-Instruct`; conviene verificar el ID correcto antes de descargar.
- Proyecto de autor individual con descargas modestas (605) y sin likes: madurez y mantenimiento no garantizados para uso en produccion.
- Licencia Apache-2.0: sin restricciones de uso comercial, pero sin garantias; el modelo se ofrece "tal cual".

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kpakkiragari/PaperPilot-Qwen-0.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct

No se han encontrado enlaces adicionales (paper, blog o demo) en la informacion disponible.
