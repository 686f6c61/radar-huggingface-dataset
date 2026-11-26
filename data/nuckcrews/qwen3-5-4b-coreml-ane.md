# nuckcrews/Qwen3.5-4B-CoreML-ANE

## Resumen

Qwen3.5-4B-CoreML-ANE es una conversión del modelo de texto Qwen3.5-4B (desarrollado originalmente por Alibaba Qwen) al formato Core ML, empaquetada específicamente para ejecutarse sobre el Neural Engine (ANE) de los chips Apple Silicon. El autor de la conversión es el usuario de Hugging Face `nuckcrews`. El paquete no contiene un único modelo monolítico, sino que el modelo se ha dividido en nueve partes más una cabeza de salida, con la tabla de embeddings separada en ficheros binarios propios.

El problema que resuelve es la ejecución local eficiente de un LLM de 4.000 millones de parámetros en hardware Apple, aprovechando la unidad neuronal dedicada en lugar de la GPU o la CPU. Esto resulta relevante para aplicaciones iOS y macOS que necesitan inferencia en el dispositivo sin conexión, con baja latencia y sin enviar datos a servidores externos. La conversión parte de la versión ya cuantizada a 4 bits de MLX (`mlx-community/Qwen3.5-4B-MLX-4bit`), lo que condiciona tanto el tamaño como la precisión efectiva del modelo resultante.

El repositorio ocupa 4,8 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base. La información pública disponible es muy limitada: no se especifican idiomas soportados, pipeline ni resultados de benchmarks, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura del modelo base Qwen3.5-4B), convertido a Core ML y segmentado en 9 partes mas una cabeza de salida |
| Parametros totales | 4 mil millones (aprox., segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (derivado de `mlx-community/Qwen3.5-4B-MLX-4bit`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`*.mlmodelc` compilados) mas `embedding.bin`, `embedding.scales` y `model.json` con la descripcion del layout |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B, un transformer de 4.000 millones de parametros desarrollado por Alibaba Qwen. Sobre esa base, esta publicacion no reentrena ni ajusta el modelo: se limita a convertir los pesos a Core ML y a trocear el grafo en nueve segmentos mas una cabeza, de modo que el Neural Engine pueda ejecutar cada bloque dentro de los limites de memoria y compilacion del ANE. La tabla de embeddings se extrae a ficheros separados (`embedding.bin` y `embedding.scales`), y `model.json` documenta como se ensamblan las piezas.

La fuente de la conversion es la variante MLX ya cuantizada a 4 bits, por lo que la perdida de precision respecto al modelo original en BF16/F16 viene heredada de ese paso previo. No se documentan en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO; esos datos corresponderian a la model card del modelo base Qwen3.5-4B, no a esta conversion. Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla del propio particionado para ANE.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-4B.
- Razonamiento y respuesta a instrucciones en la medida en que lo soporte el modelo base (no verificado en esta conversion).
- Generacion de codigo y resolucion de problemas matematicos, segun las capacidades del modelo base.
- Ejecucion sobre el Neural Engine de Apple Silicon, con los `*.mlmodelc` compilados para iOS 27 o macOS 27.
- Separacion de la tabla de embeddings en ficheros propios, lo que permite gestionarla fuera del grafo principal.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Inferencia en el dispositivo en apps iOS: integracion de los `*.mlmodelc` en una aplicacion para iOS 27 que necesite generar texto sin conexion y sin enviar datos a la nube, aprovechando el ANE para reducir consumo energetico.
- Asistentes de escritorio en macOS: un chatbot local dentro de una app macOS 27 que use el modelo para redactar, resumir o responder preguntas sobre documentos del usuario, manteniendo los datos en el equipo.
- Procesamiento por lotes en local: generacion de resumenes o clasificacion de textos sobre ficheros locales en un Mac con Apple Silicon, donde el ANE libera la GPU para otras tareas.
- Prototipado de funciones de IA en apps existentes: validar rapidamente la calidad de Qwen3.5-4B en un producto Apple antes de decidir si se adopta el modelo base completo en otro runtime.
- Escenarios con requisitos de privacidad: aplicaciones medicas, legales o financieras que no pueden enviar contenido a servidores externos y necesitan un LLM embebido de 4B en el dispositivo.
- Evaluacion comparativa de runtimes: banco de pruebas para medir latencia y throughput del ANE frente a MLX, llama.cpp o Core ML sobre GPU en el mismo hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de latencia o throughput en hardware Apple concreto.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 4,8 GB, por lo que se necesita al menos ese espacio libre para los pesos y los ficheros de embeddings.
- Sistema operativo: los programas compilados (`*.mlmodelc`) requieren iOS 27 o macOS 27, segun la model card.
- Acelerador: Neural Engine de Apple Silicon; no se documenta soporte para GPU o CPU como fallback en esta publicacion.
- VRAM/RAM estimada: no disponible de forma explicita; a partir del tamano del repo (4,8 GB) y de la cuantizacion a 4 bits, cabe esperar un consumo de memoria en el orden de varios gigabytes, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no aplica en el sentido tradicional; el destino es el ANE de chips Apple Silicon (M-series y equivalentes en iPhone/iPad). No se especifican modelos concretos de chip.
- Despliegue: Core ML con los `*.mlmodelc` y el `model.json` de layout; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nuckcrews/Qwen3.5-4B-CoreML-ANE | ~4B | no disponible | Core ML (`*.mlmodelc`) | Apache 2.0 | Conversion para ANE, requiere iOS/macOS 27 |
| mlx-community/Qwen3.5-4B-MLX-4bit | ~4B | no disponible | MLX (4 bits) | Apache 2.0 (heredada) | Fuente de esta conversion; orientado a GPU/CPU en Apple Silicon |
| Qwen/Qwen3.5-4B | ~4B | no disponible | safetensors (original) | Apache 2.0 | Modelo base sin cuantizar; maxima fidelidad, mayor coste de memoria |

## Limitaciones y advertencias

- La cuantizacion a 4 bits heredada de la version MLX puede degradar la calidad respecto al modelo base en tareas sensibles a la precision numerica.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad para esta conversion concreta; habria que remitirse a la model card de Qwen3.5-4B.
- La dependencia de iOS 27 o macOS 27 limita el despliegue a versiones de sistema muy recientes.
- El particionado en nueve bloques mas una cabeza y la separacion de los embeddings anaden complejidad de integracion: el consumidor debe respetar el layout descrito en `model.json`.
- No se especifican idiomas soportados en esta publicacion, por lo que no se puede garantizar el comportamiento multilingue sin consultar el modelo base.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-4B antes de un uso comercial.
- El repositorio no registra descargas ni likes, y la informacion tecnica es escasa; no hay evidencia publica de validacion en produccion.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nuckcrews/Qwen3.5-4B-CoreML-ANE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Fuente de la conversion (MLX 4 bits): https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-4bit
