# ryugyosoft/NeoHorse-1-4B-onw

## Resumen

NeoHorse-1-4B-onw es una conversion del modelo TokenRhythm/NeoHorse-1-4B al formato del motor onw ("ore no NPU ga konna ni ugoku wake nai"), un runtime que ejecuta modelos de lenguaje exclusivamente sobre la NPU integrada de los procesadores Intel Core Ultra. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos originales (bf16) se han recuantizado a INT4/INT8 y reorganizado en segmentos para que el motor los cargue y ejecute en la NPU. El autor de la conversion es ryugyosoft, y el modelo base es a su vez un ajuste fino de Qwen/Qwen3.5-4B orientado a uso agentico.

La arquitectura es la de Qwen3.5: 32 capas que combinan Gated DeltaNet (24 capas) con atencion con compuertas (8 capas), en una configuracion densa de 4.000 millones de parametros y solo texto. Los idiomas declarados son japones e ingles, y la licencia es Apache 2.0, heredada del modelo original.

Su relevancia es practica: demuestra inferencia de un LLM de 4B enteramente en NPU sobre un PC de consumo, con 2,4 GB de descarga, unos 6 GB de memoria de trabajo y una velocidad medida de 6,3 a 6,5 tok/s en una NPU 3720 (Core Ultra 9 285HX), aproximadamente 1,6 veces mas rapido que Qwen3.5-9B en el mismo hardware. Incluye soporte de tool calling con llamadas paralelas y modo de pensamiento con salida separada en `reasoning_content`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 24 capas Gated DeltaNet + 8 capas de atencion con compuertas (32 capas en total), igual que Qwen3.5 |
| Parametros totales | 4B (aproximadamente 4.000 millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos de los segmentos en INT4 con tamano de grupo 128; capa de salida en INT8; embeddings en INT4 |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario del motor onw: ficheros `seg*_S1.xml`, `seg*_S16.xml` y `seg*.bin` (4 segmentos mas la capa de salida), `shared.bin`, `engine.json` y ficheros de tokenizador y configuracion. No hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo conserva la estructura del base: 32 capas divididas en 24 capas Gated DeltaNet y 8 capas de atencion con compuertas, el mismo esquema hibrido de Qwen3.5, con la capa de salida compartida con los embeddings (weight tying). Es un modelo exclusivamente de texto. Esta conversion no ha implicado entrenamiento alguno: los pesos proceden del modelo original recuantizados y reempaquetados.

La adaptacion al hardware es la parte tecnica destacable. El motor divide las 32 capas en cuatro secciones de 8 capas y aplica INT4 con grupo 128 a los pesos de cada seccion, INT8 a la capa de salida y INT4 a los embeddings (referenciados desde el host). DeltaNet se ejecuta de dos formas segun la fase: durante la generacion usa una formulacion matricial para un solo token, y durante el preprocesado de prompts usa una forma paralela por bloques de 16 tokens basada en una inversion matricial exacta por duplicacion de bloque. Para evitar desbordamientos, las salidas que en FP16 resultan demasiado pequenas se escalan por 1024 y el RMSNorm con compuertas posterior se preprocesa en consecuencia. La capa de salida, al estar compartida con los embeddings, se omite en el preprocesado de prompts, donde los logits no son necesarios.

## Capacidades

- Generacion de texto conversacional en japones e ingles, con pipeline declarado de text-generation.
- Tool calling mediante API compatible con OpenAI (parametro `tools`), incluyendo llamadas paralelas a varias herramientas.
- Uso agentico: el modelo base fue ajustado especificamente para harness de agentes, llamada a herramientas, codigo y seguimiento de instrucciones.
- Modo de pensamiento (thinking) con la traza de razonamiento devuelta por separado en el campo `reasoning_content`.
- Ejecucion local completa sobre NPU Intel, sin GPU ni exposicion de datos a servicios externos.
- Servido como endpoint compatible con OpenAI en `http://localhost:8000/v1`, lo que permite conectarlo a clientes y frameworks existentes.
- No dispone de capacidades de vision, audio ni generacion de imagenes.

## Casos de uso

- Asistentes de agentes en local: el modelo puede ejecutar bucles de razonamiento multi-paso con llamada a herramientas sobre el endpoint compatible con OpenAI, sin salir del PC del usuario, algo adecuado para entornos con requisitos de privacidad o sin conectividad.
- Automatizacion de escritorio con NPU: al consumir unos 6 GB de memoria de trabajo y no requerir GPU dedicada, encaja en portatiles con Core Ultra para tareas de agente que operan sobre aplicaciones locales.
- Atencion al cliente en japones e ingles: el soporte de tool calling permite conectarlo a sistemas de consulta de pedidos, bases de conocimiento o CRMs, manteniendo conversaciones multi-turno dentro de la ventana de contexto del modelo.
- Generacion y asistencia de codigo: el ajuste del modelo base incluye codigo, y el soporte de herramientas permite integrarlo en flujos que consultan repositorios, ejecutan tests o crean parches dentro de un pipeline de CI.
- Extraccion y transformacion de datos estructurados: con llamadas a funciones puede mapear texto libre a esquemas JSON definidos, util para procesar tickets, correos o formularios.
- Prototipado y evaluacion de modelos en edge: sirve como banco de pruebas para medir latencia y consumo de un LLM de 4B en NPU antes de decidir un despliegue mayor.
- Demostraciones y formacion: al instalarse con un unico comando y arrancar en unos 20 segundos tras la primera compilacion, es practico para talleres donde se quiera mostrar inferencia local sin infraestructura.
- Sustitucion de llamadas a API en entornos air-gapped: el modelo y el motor funcionan sin red una vez descargados, por lo que puede usarse en instalaciones aisladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento proporcionados son de velocidad y de fidelidad respecto al modelo original en CPU:

| Metrica | Valor |
|---|---|
| Velocidad de generacion (NPU 3720, Core Ultra 9 285HX) | 6,3 a 6,5 tok/s |
| Comparacion de velocidad | Aproximadamente 1,6 veces mas rapido que Qwen3.5-9B en la misma NPU |
| Procesamiento de prompt | 23 tokens en aproximadamente 0,8 s |
| Coincidencia con el modelo original (bf16, CPU) con modo de pensamiento | 24 de 24 tokens identicos en comparacion con teacher forcing |
| Coincidencia sin modo de pensamiento | Identica hasta el token de fin de respuesta `<|im_end|>` |
| Primer token en 20 preguntas en japones | 18 de 20 coinciden con el original |
| Coincidencia NPU frente a CPU (FP32) | Identica |
| Evaluacion agentica del modelo base (10 evaluaciones, media) | 58,9 a 64,9 (mejora de 6 a 10 puntos sobre Qwen3.5-4B, dato del autor del modelo base) |

## Requisitos de hardware

- Hardware obligatorio: NPU integrada en Intel Core Ultra. Series 1 y 2 (Meteor Lake, Arrow Lake, Lunar Lake) y serie 3 (Panther Lake).
- Sistema operativo: Windows 11 o Ubuntu 22.04 o superior.
- Almacenamiento: 2,4 GB de descarga; el repositorio ocupa 2,5 GB.
- Memoria de trabajo tras la carga: aproximadamente 6 GB, por lo que un equipo con 16 GB de RAM resulta suficiente.
- VRAM: no aplica, el motor esta disenado para ejecutarse unicamente en NPU, no en GPU.
- Tiempo de carga: aproximadamente 6 minutos la primera vez (compilacion para NPU) y aproximadamente 20 segundos en arranques posteriores.
- Despliegue: motor onw (descarga independiente del repositorio de pesos), con interfaz grafica y servidor compatible con OpenAI. Los formatos GGUF, safetensors o el uso con vLLM, llama.cpp, Ollama o TGI no estan soportados con estos pesos.
- Instalacion: script de PowerShell en Windows o instalador `curl` en Ubuntu, documentados en el repositorio del motor.
- Configuracion de muestreo recomendada por el autor del modelo base: temperature 1.0, top_p 0.95, top_k 20. El motor onw usa generacion voraz por defecto.
- Latencia y throughput: los valores de 6,3 a 6,5 tok/s y 0,8 s para 23 tokens de prompt estan medidos en una NPU 3720; el rendimiento variara segun la NPU y la memoria del equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NeoHorse-1-4B-onw | 4B denso | No disponible | Formato onw, solo NPU Intel | 6,3 a 6,5 tok/s en NPU 3720 | Apache 2.0 | HuggingFace, requiere motor onw |
| TokenRhythm/NeoHorse-1-4B | 4B denso | No disponible | Peso original bf16 (CPU/GPU) | No disponible en esta informacion | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-4B | 4B denso | No disponible | Safetensors, GPUs convencionales | Inferior al NeoHorse-1-4B en evaluaciones agenticas segun el autor (6 a 10 puntos menos) | No disponible en esta informacion | HuggingFace |
| Qwen/Qwen3.5-9B | 9B denso | No disponible | Safetensors, GPUs convencionales | Aproximadamente 1,6 veces mas lento que NeoHorse-1-4B-onw en la misma NPU | No disponible en esta informacion | HuggingFace |

No se dispone de datos de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) para ninguno de los modelos de la tabla en la informacion proporcionada, por lo que la comparacion se limita a tamanos, formatos y las metricas de velocidad citadas.

## Limitaciones y advertencias

- Dependencia total del hardware: solo funciona sobre NPU Intel Core Ultra con el motor onw; no se puede ejecutar en GPU NVIDIA o AMD, en Apple Silicon ni en CPU convencional dentro de este formato.
- No hay datos publicados sobre sesgos, alucinacion, toxicidad o robustez para este modelo ni para su base.
- Cobertura idiomatica limitada: solo japones e ingles declarados. El rendimiento en castellano no esta documentado y previsiblemente sera bajo.
- Longitud de contexto no declarada en la informacion disponible, lo que impide planificar aplicaciones con documentos largos sin verificacion previa.
- Fidelidad de la cuantizacion no absoluta: 18 de 20 primeras respuestas coinciden con el original en japones, y 2 casos divergen. En tareas sensibles a tokens exactos conviene validar contra el modelo bf16.
- Los pesos no incluyen safetensors ni GGUF, por lo que no se pueden reutilizar directamente con el ecosistema habitual de herramientas.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio incluye el fichero LICENSE original con la atribucion de copyright de Qwen, que debe conservarse.
- El rendimiento depende de la NPU concreta y de la memoria del equipo; las cifras de 6,3 a 6,5 tok/s corresponden a un unico equipo de prueba.
- El primer arranque requiere unos 6 minutos de compilacion para la NPU, lo que complica despliegues con arranques frecuentes o contenedores efimeros.
- El motor onw y los pesos son proyectos independientes: hay que descargar y mantener ambos, y las versiones deben ser compatibles.
- El modelo base fue ajustado por un tercero distinto del autor de esta conversion; no hay documentacion publica detallada del dataset de ajuste ni de su procedimiento de alineacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryugyosoft/NeoHorse-1-4B-onw
- Motor onw: https://huggingface.co/ryugyosoft/onw
- Documentacion tecnica del motor onw: https://huggingface.co/ryugyosoft/onw/blob/main/TECHNICAL.md
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Modelo del que deriva el base: https://huggingface.co/Qwen/Qwen3.5-4B
- Imagenes de la interfaz del motor: https://huggingface.co/ryugyosoft/onw/resolve/main/images/onw-models.png, https://huggingface.co/ryugyosoft/onw/resolve/main/images/onw-server.png, https://huggingface.co/ryugyosoft/onw/resolve/main/images/onw-settings.png
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la busqueda web realizada.
