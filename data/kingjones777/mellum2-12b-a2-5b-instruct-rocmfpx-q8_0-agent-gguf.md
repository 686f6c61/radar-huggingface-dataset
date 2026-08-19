# kingjones777/Mellum2-12B-A2.5B-Instruct-ROCmFPX-Q8_0-AGENT-GGUF

## Resumen

Mellum2-12B-A2.5B-Instruct es un modelo de lenguaje de código abierto desarrollado por JetBrains, especializado en ingeniería de software. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 12.000 millones de parámetros totales y 2.500 millones de parámetros activos por token, lo que lo hace eficiente en inferencia sin sacrificar capacidad. El modelo cubre generación y edición de código, depuración, razonamiento multi-paso, uso de herramientas, llamada a funciones y asistencia conversacional para programación.

Esta ficha concreta corresponde a una cuantización GGUF en formato ROCmFPX de 8 bits, creada por kingjones777, optimizada específicamente para la GPU integrada AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo). El archivo pesa 11,88 GiB y alcanza una velocidad de decodificación de 74,93 tokens por segundo en ese hardware. Es importante destacar que esta versión requiere un fork de llama.cpp con soporte para los tipos de cuantización ROCmFPX y para la arquitectura Mellum, que aún no está integrada en el upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) - Mellum2 |
| Parametros totales | 12.149.923.072 (12B) |
| Parametros activos | 2.500.000.000 (2,5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX_AGENT (ftype 115), Q8_0_ROCMFPX (ftype 111), Q4_0_ROCMFPX_COHERENT (ftype 102) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con tipos ROCmFPX propietarios del fork) |

## Arquitectura y entrenamiento

Mellum2 es un modelo de lenguaje de tipo Mixture-of-Experts con 12B parámetros totales y 2,5B activos por token, lo que reduce el coste computacional por inferencia manteniendo una capacidad comparable a modelos densos de mayor tamaño. Segun el informe tecnico (arXiv:2605.31268), esta especializado en ingenieria de software: generacion y edicion de codigo, depuracion, razonamiento multi-paso, uso de herramientas, llamada a funciones y programacion agente.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. La cuantizacion ROCmFPX de 8 bits se genero a partir de un GGUF BF16 de 24.311.968.416 bytes, verificado byte a byte contra el blob original, lo que garantiza una conversion sin perdidas adicionales mas alla de la propia cuantizacion.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, incluyendo completado de codigo (code completion).
- Edicion y refactorizacion de codigo existente.
- Depuracion: identificacion y correccion de errores en fragmentos de codigo.
- Razonamiento multi-paso para tareas complejas de programacion.
- Llamada a funciones (function calling) y uso de herramientas (tool use).
- Programacion agente: ejecucion de tareas autonomas de desarrollo con planificacion y ejecucion de pasos.
- Asistencia conversacional para programacion, con capacidad de mantener dialogos multi-turno.
- Soporte multilingue limitado al ingles (segun la model card, solo `en`).

## Casos de uso

- Asistente de programacion en IDE: el modelo puede integrarse en editores como JetBrains para ofrecer completado de codigo, sugerencias de refactorizacion y explicaciones de fragmentos, aprovechando su especializacion en ingenieria de software.
- Depuracion automatizada: dado un stack trace o un fragmento con errores, el modelo puede proponer correcciones y explicar la causa raiz, reduciendo el tiempo de resolucion de incidencias.
- Agente de codificacion autonomo: gracias a su soporte de tool calling y razonamiento multi-paso, puede ejecutar tareas como "anade una nueva ruta a la API" o "corrige el bug en el modulo de autenticacion" de forma semi-autonoma.
- Generacion de tests unitarios: el modelo puede crear casos de prueba a partir de la descripcion de una funcion o de un fragmento de codigo, mejorando la cobertura sin intervencion manual.
- Chat de soporte tecnico especializado: en un entorno controlado, puede responder preguntas sobre APIs, frameworks o patrones de diseno, con la ventaja de su contexto de 2,5B activos que permite ejecutarlo en hardware modesto.
- Educacion y formacion en programacion: el modelo puede actuar como tutor explicando conceptos, revisando ejercicios y proponiendo soluciones alternativas, con un coste de inferencia bajo gracias a su arquitectura MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye verificaciones puntuales de correccion con un presupuesto de 1024 tokens:

- 17 × 23 → 391 (correcto)
- Capital de Japon → Tokyo (correcto)
- Dias en 2024 → 366 (correcto)

El autor advierte explicitamente que no se realizaron pruebas de perplexity, ni comparaciones de calidad contra el modelo original, ni evaluaciones de contexto largo o de tool-calling. Por tanto, no es posible ofrecer una tabla comparativa fiable con otros modelos.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 11,88 GiB, por lo que se recomienda al menos 16 GB de VRAM para cargar el modelo completo con margen para el contexto y las activaciones.
- GPU recomendada: AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo) es el hardware de referencia, con una velocidad de decodificacion de 74,93 tok/s. Tambien puede ejecutarse en otras GPUs AMD compatibles con ROCm, aunque no se han publicado mediciones.
- En GPUs de consumo: no se ha probado en hardware NVIDIA o Intel. Dado el formato ROCmFPX, es probable que no funcione en CUDA sin una re-cuantizacion a un formato estandar (por ejemplo, Q8_0 clasico).
- Opciones de despliegue: requiere un fork de llama.cpp con soporte para los tipos ROCmFPX (repositorio `charlie12345/ROCmFPX`) y para la arquitectura Mellum (PR #23966 pendiente de fusion). No es compatible con llama.cpp estandar, ni con vLLM, Ollama o TGI en sus versiones oficiales.
- Latencia y throughput: 74,93 tok/s (mediana de 3 ejecuciones) en Ryzen AI MAX+ 395 con ROCm 7.2.4. La variante de 4 bits alcanza 104,99 tok/s en el mismo hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Mellum2-12B-A2.5B-Instruct pertenece a la categoria de modelos MoE de ~12B con ~2,5B activos, similar a otros como Qwen3-30B-A3B o DeepSeek-V3-Lite, pero no hay mediciones de rendimiento relativas disponibles. La licencia Apache-2.0 y la especializacion en codigo lo diferencian de alternativas de proposito general, pero sin benchmarks no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Requiere un fork especifico de llama.cpp: el modelo no carga en la version estandar de llama.cpp (error `invalid ggml type 103`) ni en otras herramientas de inferencia convencionales. Esto limita su portabilidad y su integracion en pipelines existentes.
- Solo ingles: la model card indica `language: [en]`, por lo que no es adecuado para tareas en otros idiomas sin un ajuste adicional.
- Sin evaluacion de calidad: el autor no realizo pruebas de perplexity, ni comparaciones A/B contra el modelo original, ni evaluaciones de contexto largo o tool-calling. Los unicos checks son tres preguntas de memoria, insuficientes para garantizar el comportamiento en produccion.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo o con presupuestos de tokens reducidos.
- Contexto limitado no verificado: no se ha probado el rendimiento con ventanas de contexto largas, por lo que no se recomienda su uso en tareas que requieran procesar documentos extensos.
- Dependencia de hardware AMD: la cuantizacion ROCmFPX esta disenada para gfx1151; en otras arquitecturas puede no funcionar o requerir re-cuantizacion.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Instruct-ROCmFPX-Q8_0-AGENT-GGUF
- Variante de 4 bits: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Instruct-ROCmFP4-GGUF
- Variante de 8 bits sin AGENT: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Instruct-ROCmFPX-Q8_0-GGUF
- Modelo base (JetBrains): https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Instruct
- Informe tecnico Mellum2 (arXiv): https://arxiv.org/abs/2605.31268
- Fork de llama.cpp con soporte ROCmFPX: https://github.com/charlie12345/ROCmFPX
- PR de la arquitectura Mellum en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/23966
- Repositorio de conversion y evaluacion GGUF: https://github.com/altibola/Mellum2-12B-A2.5B-Instruct-GGUF
