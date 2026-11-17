# AcxelinLabs/hisaabsaathi-model

## Resumen

HisaabSaathi es un modelo de etiquetado semantico derivado de Qwen2.5-0.5B-Instruct, desarrollado por Acxelin Labs para su aplicacion homonima, un libro de cuentas por voz offline dirigido a trabajadores con salario diario en India. La tarea del modelo es acotada y concreta: recibe una frase hablada junto con los numeros que contiene y determina la funcion de cada cifra (horas, piezas, tarifa, salario, cantidad recibida, anticipo, gasto u otro). La aritmetica no la realiza el modelo, sino la propia aplicacion, lo que reduce el riesgo de errores de calculo en produccion.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct (aproximadamente 500 millones de parametros) y se ha ajustado mediante LoRA sobre la tarea de etiquetado en hindi, oriya, telugu, kannada, tamil e ingles. Los pesos se han fusionado, convertido a 8 bits con litert-torch y empaquetado como bundle `.task` de MediaPipe LLM Inference para ejecucion en CPU en dispositivos Android.

Su relevancia radica en el enfoque de despliegue: un modelo de menos de 600 MB que corre integramente en el dispositivo, sin conexion, para una poblacion con conectividad limitada. La licencia Apache-2.0, heredada del modelo base, facilita su reutilizacion y auditoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste LoRA fusionado |
| Parametros totales | ~0,5 mil millones (heredados de Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no se documenta en la model card) |
| Tipos de cuantizacion | 8 bits (LiteRT, litert-torch); unico artefacto publicado |
| Idiomas soportados | hindi (hi), oriya (or), telugu (te), kannada (kn), tamil (ta), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.task` (MediaPipe LLM Inference, LiteRT 8-bit); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct. Sobre esa base se aplico un ajuste LoRA especifico para la tarea de etiquetado de numeros en frases habladas, en seis idiomas. Tras el entrenamiento, los pesos LoRA se fusionaron con los del modelo base y el conjunto resultante se convirtio a 8 bits mediante litert-torch, empaquetandose como bundle de MediaPipe LLM Inference para Android. El tokenizador y la plantilla de chat se toman sin modificaciones del bundle LiteRT oficial de Qwen2.5-0.5B-Instruct publicado por Google.

No se documentan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO adicionales. La unica innovacion tecnica destacable es el pipeline de conversion a LiteRT 8-bit con empaquetado MediaPipe, orientado a inferencia en CPU en dispositivos moviles. El artefacto publicado tiene 513.718.731 bytes y un sha256 verificable.

## Capacidades

- Etiquetado semantico de numeros en frases habladas: clasifica cada cifra como horas, piezas, tarifa, salario, recibido, anticipo, gasto u otro.
- Generacion de texto condicionada a la tarea de etiquetado, no conversacion general.
- Cobertura multilingue en hindi, oriya, telugu, kannada, tamil e ingles.
- Inferencia completamente offline en dispositivo Android mediante MediaPipe LLM Inference sobre CPU.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No se documenta capacidad de razonamiento matematico: la aritmetica la realiza la aplicacion anfitriona.

## Casos de uso

- Libro de cuentas por voz para trabajadores con salario diario: la aplicacion captura una frase como "trabaje ocho horas a cincuenta rupias" y el modelo etiqueta "ocho" como horas y "cincuenta" como tarifa, dejando el calculo del total a la app. Es el caso de uso original y el unico documentado por el autor.
- Registro de gastos e ingresos en campo: el modelo distingue entre "recibido", "anticipo" y "gasto" en frases coloquiales, lo que permite construir un libro de cuentas estructurado sin conexion.
- Digitalizacion de notas de voz en zonas con conectividad intermitente: al ejecutarse en CPU en el dispositivo, no requiere red ni servidores, lo que lo hace adecuado para entornos rurales.
- Aplicaciones de microcontabilidad para cooperativas y ONG: el etiquetado multilingue permite procesar registros en cinco idiomas indios y en ingles con un unico modelo de 600 MB.
- Asistencia a la transcripcion estructurada: combinado con un motor de reconocimiento de voz local, el modelo convierte transcripciones en campos estructurados para su exportacion a hojas de calculo o bases de datos.
- Prototipado de asistentes de voz de dominio restringido: sirve como referencia de pipeline completo (fine-tuning LoRA, cuantizacion LiteRT, empaquetado MediaPipe) para equipos que quieran replicar el flujo en otras tareas de etiquetado.

## Benchmarks y rendimiento

Los unicos resultados publicados por el autor son sobre frases de test reservadas, construidas a partir de las mismas plantillas que los datos de entrenamiento:

| Evaluacion | Resultado |
|---|---|
| Etiquetado exacto antes de la conversion a 8 bits | 133 de 140 (95 %) |
| Etiquetado exacto tras conversion a 8 bits | 37 de 40 |
| Modelo base sin ajuste fino | 7 % |

El propio autor advierte que, al provenir las frases de test de las mismas plantillas que el entrenamiento, el rendimiento sobre habla real sera inferior. No se publican resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia en CPU en dispositivos Android.
- Tamano del artefacto: 513.718.731 bytes (aproximadamente 0,5 GB) en formato `.task` de 8 bits.
- GPU recomendadas: no aplica; el runtime documentado es MediaPipe LLM Inference sobre CPU.
- Compatibilidad con GPU de consumo: no documentada; el modelo no se distribuye en formatos para llama.cpp, vLLM ni Ollama.
- Opciones de despliegue: MediaPipe LLM Inference (Android). No se publican pesos en safetensors, GGUF ni otros formatos que permitan usar vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| HisaabSaathi (este modelo) | ~0,5 mil millones | no disponible | hi, or, te, kn, ta, en | Apache-2.0 | `.task` LiteRT 8-bit |
| Qwen2.5-0.5B-Instruct (base) | ~0,5 mil millones | no disponible | multilingue (incluye en, hi y otros) | Apache-2.0 | safetensors, GGUF, LiteRT |
| Qwen2.5-1.5B-Instruct | ~1,5 mil millones | no disponible | multilingue | Apache-2.0 | safetensors, GGUF |
| Gemma 2B | ~2 mil millones | no disponible | multilingue | terminos de Gemma | safetensors, GGUF |

La comparacion relevante es con el modelo base: HisaabSaathi es un ajuste especializado que sacrifica generalidad por una tarea concreta, a cambio de un artefacto mas pequeno y listo para movil. Frente a Qwen2.5-1.5B o Gemma 2B, ofrece menor huella pero tambien menor capacidad general; su ventaja esta en el empaquetado para Android y en el ajuste de dominio.

## Limitaciones y advertencias

- El rendimiento del 95 % (o 37/40 tras cuantizacion) se midio sobre frases generadas con las mismas plantillas que el entrenamiento; el autor reconoce que el habla real obtendra resultados inferiores.
- El modelo solo etiqueta numeros; no realiza aritmetica ni razonamiento general. Usarlo fuera de esa tarea producira resultados poco fiables.
- No se documentan sesgos especificos, pero al entrenarse sobre frases de trabajadores con salario diario en India puede presentar sesgos de dominio y de registro linguistico.
- Riesgo de alucinacion en entradas fuera de distribucion (frases largas, numeros ambiguos, ruido de transcripcion de voz).
- El unico artefacto publicado es un bundle `.task` de 8 bits para MediaPipe; no hay pesos en safetensors ni GGUF, lo que limita la inspeccion, el reentrenamiento y el despliegue en otros runtimes.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye tal cual.
- La fecha de creacion del repositorio (2026-11-17) y el numero de descargas (0) indican que no hay validacion externa ni comunidad establecida.
- No se documenta la longitud de contexto efectiva del bundle empaquetado, lo que impide planificar entradas largas con garantias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AcxelinLabs/hisaabsaathi-model
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Bundle LiteRT oficial de Qwen2.5-0.5B-Instruct (referenciado en la model card): no disponible como enlace directo en la informacion proporcionada
- Repositorio o demo de HisaabSaathi: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
