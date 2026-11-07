# mlx-community/Kestrel-4B-Coder-8bit

## Resumen

Kestrel-4B-Coder es un ajuste fino (fine-tune) compacto orientado a generacion de codigo y flujos de trabajo con agentes, construido a partir de Qwen3.5-4B (via la version de Unsloth). Lo publica la comunidad MLX en formato de 8 bits para inferencia en Apple Silicon, aunque el modelo original lo firma Jackrong. Su proposito es acercar la "inteligencia util" al dispositivo: codigo practico, razonamiento compacto y uso de herramientas que puedan ejecutarse en hardware personal sin depender de inferencia remota.

El modelo hereda de Qwen3.5-4B una arquitectura transformer con componentes de vision (pipeline image-text-to-text) y pesos MTP/NextN para decodificacion especulativa, que el fine-tune conserva. Cuenta con 4.539.265.536 parametros totales y un repositorio de 5,2 GB en esta variante de 8 bits. Esta pensado explicitamente para inferencia local, edge computing y despliegue on-device.

La relevancia actual reside en su enfoque de "hacer que cada token cuente": un bucle de trabajo Read → Reason → Call Tools → Edit → Test con pensamiento compacto para reducir generacion innecesaria en agentes que repiten el ciclo muchas veces. Se distribuye bajo licencia Apache 2.0 y soporta seis idiomas (en, zh, ko, ja, ru, es).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con componentes de vision; pesos MTP/NextN para decodificacion especulativa |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (esta variante); existen variantes 4-bit y GGUF Q8_0 en otros repos |
| Idiomas soportados | en, zh, ko, ja, ru, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (variante MLX 8-bit); GGUF disponible en el repo del autor |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal (image-text-to-text) que conserva sus componentes de vision y sus pesos MTP/NextN. El fine-tune se preparo fusionando la adaptacion de codigo sobre unsloth/Qwen3.5-4B, manteniendo el tokenizer y la plantilla de chat del adaptador de publicacion, que debe usarse para interacciones de chat y herramientas.

El corpus de entrenamiento contiene aproximadamente 150.000 ejemplos de codigo y razonamiento complejo. Se compone de unas 40.000 muestras de interaccion con agentes y uso de herramientas destiladas de Qwen3.8-27B (llamadas multi-turno, seguimiento de estado del entorno, autocorreccion y reflexion); ejemplos de algoritmos densos y generacion de codigo destilados de Qwen3.8-Flash-Next y Qwen3.8-Max (implementacion de algoritmos, sintaxis rigurosa, manejo de casos limite y refactorizacion); y ejemplos seleccionados de la familia nvidia/Nemotron para razonamiento logico e instrucciones estrictas. El control de calidad aplica validacion sintactica basada en AST, deduplicacion, limpieza y filtros de ejecucion en sandbox.

## Capacidades

- Generacion de codigo: implementacion de algoritmos, refactorizacion y manejo de casos limite.
- Razonamiento multi-paso con modo de pensamiento compacto.
- Tool calling y function calling, con seguimiento de estado del entorno y autocorreccion.
- Flujos de agente multi-turno (bucle Read → Reason → Call Tools → Edit → Test).
- Capacidades multimodales de vision heredadas de Qwen3.5-4B (pipeline image-text-to-text).
- Soporte multilingue en ingles, chino, coreano, japones, ruso y espanol.
- Decodificacion especulativa mediante pesos MTP/NextN (multi-token prediction).
- Orientado a inferencia local y on-device.

## Casos de uso

- Asistente de codigo en local: integrado en un IDE o editor sobre Apple Silicon con LM Studio, el modelo genera y corrige codigo sin enviar el contexto a un servicio remoto, gracias a su tamano de 4B y su cuantizacion de 8 bits.
- Agente de refactorizacion: el bucle de leer, razonar, llamar herramientas, editar y probar permite aplicar cambios acotados en un repositorio y verificar el resultado mediante ejecucion en sandbox.
- Automatizacion de tareas con tool calling: el modelo puede encadenar llamadas a funciones (lectura de ficheros, ejecucion de tests, consultas a APIs) en pipelines de CI/CD o scripts de mantenimiento.
- Generacion de tests y validacion: dado su entrenamiento en sintaxis rigurosa y casos limite, resulta adecuado para producir pruebas unitarias y comprobar su ejecucion.
- Asistencia multimodal en dispositivo: al conservar la vision de Qwen3.5-4B, puede procesar capturas de pantalla o diagramas junto con texto para tareas de documentacion tecnica.
- Prototipado en edge computing: su tamano compacto permite desplegarlo en dispositivos con presupuesto de memoria ajustado para asistentes de desarrollo offline.
- Soporte multilingue de codigo: util para equipos que trabajan en espanol, japones, coreano, ruso o chino y necesitan explicaciones y comentarios en su idioma.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 164 tareas de programacion, cinco muestras por tarea y 820 generaciones por modelo, con Q8_0 GGUF, llama.cpp CUDA, decodificacion especulativa MTP con longitud de borrador maxima 2, temperatura 0,2 y top-p 0,95:

| Metrica | Kestrel-4B-Coder | Qwen3.5-4B | Qwopus3.5-9B-Coder-Flash | Qwen3.5-9B |
|---|---|---|---|---|
| HumanEval Pass@1 | 83,66% | 72,56% | 91,83% | 85,24% |
| HumanEval Pass@5 | 94,51% | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

Los datos de HumanEval+ no estan completos en la informacion proporcionada. No se han publicado otros resultados de benchmarks (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: esta variante de 8 bits ocupa aproximadamente 5,2 GB de pesos; en inferencia se anade overhead de contexto y cache KV. La variante de 4 bits reduce el requisito aproximadamente a la mitad.
- GPU recomendadas: no se especifican en la informacion. El autor reporta resultados en Apple Silicon con LM Studio y en llama.cpp con CUDA.
- Cabe en GPU de consumo: si, por su tamano de 4B; las variantes de 8 y 4 bits son aptas para GPUs consumer con suficiente memoria (no se detalla el minimo exacto).
- Opciones de despliegue: MLX (esta variante), llama.cpp y LM Studio (GGUF), transformers; el modelo base es compatible con endpoints.
- Latencia y throughput: no disponibles de forma numerica; el autor menciona el uso de decodificacion especulativa MTP para acelerar la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval Pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kestrel-4B-Coder | 4,54B | no disponible | 83,66% | Apache 2.0 | Hugging Face (MLX 8-bit, 4-bit, GGUF) |
| Qwen3.5-4B | 4B (aprox.) | no disponible | 72,56% | no disponible en la informacion | Hugging Face |
| Qwopus3.5-9B-Coder-Flash | 9B (aprox.) | no disponible | 91,83% | no disponible en la informacion | Hugging Face |
| Qwen3.5-9B | 9B (aprox.) | no disponible | 85,24% | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Los benchmarks son ejecutados por el autor, no por un tercero independiente; deben interpretarse con cautela.
- El modelo es un fine-tune compacto de 4B: en tareas de codigo muy complejas queda por debajo de alternativas de 9B en HumanEval Pass@1.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en APIs o librerias poco representadas en el corpus.
- El corpus de entrenamiento esta dominado por ejemplos destilados de modelos mayores; puede heredar sesgos de esos modelos.
- No se dispone de informacion sobre la longitud de contexto efectiva, lo que limita la planificacion de casos con ventanas largas.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del modelo base Qwen3.5-4B y de los datos destilados.
- El soporte de idiomas se limita a los seis declarados; el rendimiento en otros idiomas no esta garantizado.
- Esta variante MLX esta pensada para Apple Silicon; para otras plataformas debe usarse la version GGUF o el checkpoint original.

## Enlaces

- Modelo en Hugging Face (MLX 8-bit): https://huggingface.co/mlx-community/Kestrel-4B-Coder-8bit
- Variante MLX 4-bit: https://huggingface.co/mlx-community/Kestrel-4B-Coder-4bit
- Checkpoint fusionado del autor: https://huggingface.co/Jackrong/Kestrel-4B-Coder
- GGUF con pesos MTP: https://huggingface.co/Jackrong/Kestrel-4B-Coder-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Version de Unsloth del modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Framework Unsloth en GitHub: https://github.com/unslothai/unsloth
- Colaborador (X): https://x.com/KyleHessling1
