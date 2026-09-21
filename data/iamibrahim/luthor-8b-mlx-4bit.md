# IAMIbrahim/luthor-8b-mlx-4bit

## Resumen

Luthor 8B MLX 4bit es una version cuantizada a 4 bits del modelo Luthor 8B, un ajuste fino (fine-tune) de Qwen3-8B orientado especificamente a dirigir herramientas de terminal y de edicion de ficheros dentro de un bucle de agente. Lo publica el usuario IAMIbrahim en Hugging Face bajo licencia Apache 2.0 y esta empaquetado en formato MLX con safetensors, es decir, pensado para ejecutarse en Apple Silicon mediante la libreria `mlx-lm`. El repositorio ocupa 4,6 GB (4,3 GB en disco tras la conversion) y contiene 8.190.735.360 parametros.

El problema que aborda es el de los agentes locales de codigo: en lugar de depender de APIs externas, permite que un modelo de 8B ejecute llamadas a funciones y comandos de terminal desde un portatil Mac. El autor lo presenta como el build recomendado por equilibrio entre tamano, velocidad y calidad dentro de una familia de cuatro cuantizaciones (8 bits, 6 bits, 4 bits y mixta 3-6), con 19,2 tokens por segundo y un pico de memoria de 4,79 GB medidos en un Apple M3 de 24 GB.

La relevancia actual es doble: por un lado, demuestra que la inferencia en memoria unificada de Apple esta limitada por ancho de banda, de modo que las cuantizaciones mas agresivas son mas rapidas y no mas lentas; por otro, el autor documenta explicitamente que no existe todavia una evaluacion de calidad ("trained, not yet evaluated"), por lo que debe tratarse como artefacto de investigacion y no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Qwen3-8B); no se documentan modificaciones estructurales |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits MLX, 4,500 bits por peso, grupo de cuantizacion de 64; la familia incluye builds de 8, 6, 4 y mixta 3-6 bits |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (no se distribuye GGUF) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B, un transformer denso de aproximadamente 8.200 millones de parametros, sobre el que se ha realizado un ajuste fino supervisado orientado a tareas de agente. El autor no detalla en esta ficha la composicion del dataset ni el numero de tokens de entrenamiento, y remite a la model card del modelo base para datos de entrenamiento, hiperparametros y limitaciones. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion posteriores.

La innovacion destacable de este repositorio no esta en el entrenamiento sino en el proceso de cuantizacion: se ha aplicado cuantizacion post-entrenamiento con `mlx_lm convert -q --q-bits 4 --q-group-size 64`. El autor documenta que un build de 3,284 bits por peso (denominado `mixed_2_6`) se genero y se descarto porque degeneraba en repeticiones de tokens en lugar de texto coherente, y senala que por debajo de aproximadamente 4 bits por peso esta cuantizacion post-entrenamiento rompe el modelo, siendo necesario un entrenamiento consciente de la cuantizacion (QAT) para alcanzar compresiones tipo ternario.

El formato conversacional espera un bloque `<tools>` de estilo Hermes en el mensaje de sistema, el modelo emite `<tool_call>` y espera recibir `<tool_response>`. Las herramientas deben declararse exactamente igual que durante el entrenamiento para que el modelo funcione correctamente.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat aplicable mediante `tokenizer.apply_chat_template`.
- Llamada a herramientas (tool calling / function calling) con un protocolo explicito basado en `<tool_call>` y `<tool_response>`.
- Ejecucion dentro de bucles de agente: el modelo esta ajustado para dirigir herramientas de terminal y de edicion de ficheros, lo que incluye diagnosticar fallos de tests, inspeccionar ficheros y proponer parches.
- Razonamiento multi-paso implicito en el bucle de agente (observar resultado de herramienta, decidir siguiente accion).
- Capacidades heredadas del modelo base Qwen3-8B en generacion de codigo y matematicas, aunque no se aportan mediciones especificas en esta ficha.
- Capacidad multilingue: limitada al ingles segun la etiqueta de idioma del repositorio.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito tipo "thinking".

## Casos de uso

- Agente de reparacion de tests en local: se le pasa el error de la suite de pruebas y el modelo decide que fichero leer, que comando ejecutar y que parche aplicar, usando el ciclo `<tool_call>` / `<tool_response>` sobre un Mac sin conexion a APIs externas.
- Asistente de terminal en el portatil del desarrollador: con 4,79 GB de pico de memoria, puede convivir con un IDE y un navegador en equipos de 16-24 GB de memoria unificada, ejecutando comandos de shell de forma asistida.
- Automatizacion de tareas de mantenimiento de repositorios: refactorizaciones acotadas, renombrado de simbolos o actualizacion de dependencias a traves de herramientas de edicion de ficheros declaradas en el bloque `<tools>`.
- Integracion en pipelines de CI/CD autoalojados en runners macOS: el modelo puede consumir la salida de un fallo de build y proponer un parche como primer paso de un flujo humano-en-el-bucle.
- Prototipado de investigacion sobre agentes: al ser un artefacto pequeno y ejecutable localmente, sirve para estudiar formatos de tool calling, tasas de acierto en la eleccion de herramienta y robustez ante respuestas erroneas del entorno.
- Escenarios con requisitos de privacidad: al ejecutarse en local sobre MLX, el codigo y los ficheros del usuario no salen del equipo, lo que encaja en entornos con datos sensibles o con restricciones de salida a Internet.
- Educacion y demostraciones: permite ilustrar como se construye un bucle de agente completo (system prompt con herramientas, llamada, respuesta, nueva llamada) con un modelo de 8B en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo esta entrenado pero no evaluado ("trained, not yet evaluated") y que el benchmark de puerta de salida (ship-gate) no se ha ejecutado.

Los unicos datos de rendimiento medidos son de velocidad y memoria, obtenidos en un Apple M3 con 24 GB de memoria unificada, `mlx-lm` 0.31.3, generacion de 150 tokens con `--temp 0.0`:

| Build | Tamano en disco | Bits por peso | Tokens/s | Memoria pico |
|---|---|---|---|---|
| mlx-8bit | 8,1 GB | 8,500 | 10,6 | 8,80 GB |
| mlx-6bit | 6,2 GB | 6,500 | 13,8 | 6,77 GB |
| mlx-4bit (este) | 4,3 GB | 4,500 | 19,2 | 4,79 GB |
| mlx-mixed-3-6 | 3,9 GB | 4,088 | 21,1 | 4,38 GB |

## Requisitos de hardware

- Naturaleza del runtime: el repositorio esta en formato MLX, por lo que la ruta de ejecucion soportada es Apple Silicon con memoria unificada. No se distribuyen pesos GGUF ni safetensors estandar para CUDA.
- Memoria para este build: 4,79 GB de pico medidos en un Apple M3 de 24 GB con `mlx-lm`. El tamano de pesos en disco es de 4,3 GB, por lo que en un equipo con 16 GB de memoria unificada deberia caber dejando margen para el sistema, aunque esa cifra concreta no esta verificada en la informacion proporcionada.
- Memoria para los otros builds de la familia: 8,80 GB (8 bits), 6,77 GB (6 bits) y 4,38 GB (mixta 3-6), todos medidos en el mismo M3.
- GPU recomendadas: no aplica en el sentido habitual; el modelo esta pensado para chips de la serie M de Apple. No hay datos de VRAM para A100, H100 o RTX 4090, y ejecutarlo en esas plataformas requeriria convertir los pesos a otro formato, algo que no se documenta.
- Cabe en GPU de consumo: si se habla de equipos Apple, si, en Mac con 16 GB o mas de memoria unificada. En GPUs NVIDIA de consumo no hay una ruta soportada por el propio repositorio.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate` o API de Python `load`/`generate`). No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI con estos pesos.
- Latencia y throughput: 19,2 tokens/s en el M3 de 24 GB con generacion de 150 tokens y temperatura 0. El autor senala que las cuantizaciones mayores son mas lentas porque la inferencia en Apple Silicon esta limitada por ancho de banda de memoria.
- Conversion: el propio autor documenta como reproducir el build con `python -m mlx_lm convert --hf-path IAMIbrahim/luthor-8b --mlx-path luthor-8b-4bit -q --q-bits 4 --q-group-size 64`.

## Comparativa con modelos similares

La informacion disponible permite comparar este build con los otros tres de la misma familia, todos derivados del mismo modelo base y ejecutados en el mismo hardware:

| Build | Bits por peso | Tokens/s | Memoria pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luthor-8b-mlx-8bit | 8,500 | 10,6 | 8,80 GB | Apache 2.0 | Publico en Hugging Face |
| luthor-8b-mlx-6bit | 6,500 | 13,8 | 6,77 GB | Apache 2.0 | Publico en Hugging Face |
| luthor-8b-mlx-4bit | 4,500 | 19,2 | 4,79 GB | Apache 2.0 | Publico en Hugging Face |
| luthor-8b-mlx-mixed-3-6 | 4,088 | 21,1 | 4,38 GB | Apache 2.0 | Publico en Hugging Face |
| luthor-8b (base) | Sin cuantizar | No disponible | No disponible | Apache 2.0 | Publico en Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos de terceros en la informacion proporcionada, por lo que no es posible establecer una comparacion rigurosa con alternativas de otros autores en la misma categoria (modelos de 8B orientados a agentes y tool calling).

## Limitaciones y advertencias

- Modelo no evaluado: la propia model card advierte de que esta entrenado pero no evaluado y de que el benchmark de puerta de salida no se ha ejecutado. Debe tratarse como artefacto de investigacion, no como componente listo para produccion.
- Sin datos de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna prueba de acierto en tool calling, por lo que no se puede estimar su calidad relativa frente al modelo base ni frente a otras alternativas.
- Dependencia del formato de herramientas: el modelo espera que las herramientas se declaren exactamente igual que en el entrenamiento (bloque `<tools>` estilo Hermes) y que las respuestas vuelvan como `<tool_response>`. Cualquier desviacion en el formato puede degradar el comportamiento.
- Riesgo de alucinacion en llamadas a herramientas: al no haber evaluacion publicada, no se conoce la tasa de argumentos incorrectos, herramientas inexistentes o comandos peligrosos. En un agente con acceso a terminal, un `tool_call` mal formado puede tener consecuencias destructivas si no se aplican permisos y confirmaciones.
- Limite de cuantizacion: por debajo de aproximadamente 4 bits por peso la cuantizacion post-entrenamiento degrada el modelo hasta producir repeticiones de tokens, segun documenta el autor con el build descartado `mixed_2_6`.
- Idioma: soporte declarado unicamente para ingles. No se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Plataforma: los pesos estan en formato MLX y el unico runtime soportado es `mlx-lm` sobre Apple Silicon. No hay rutas documentadas para CUDA, ROCm ni aceleradores de otro tipo.
- Contexto: no se especifica la longitud de contexto soportada por este fine-tune, lo que impide planificar cargas con ventanas largas.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe evidencia externa de funcionamiento en produccion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y se indique los cambios. Conviene verificar las condiciones del modelo base Qwen3-8B antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-4bit
- Modelo base (Luthor 8B): https://huggingface.co/IAMIbrahim/luthor-8b
- Build de 8 bits: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-8bit
- Build de 6 bits: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-6bit
- Build mixta 3-6 bits: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-mixed-3-6
- Referencia citada por el autor sobre cuantizacion ternaria (Bonsai 2): https://www.mindstudio.ai/blog/bonsai-2-27b-ternary-quantization
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo. Los unicos enlaces utiles son los de Hugging Face listados arriba.
