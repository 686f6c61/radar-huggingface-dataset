# musatur/Alpona-1.0-9B

## Resumen

Alpona-1.0-9B es un modelo de lenguaje de 8.950 millones de parámetros (8.953.803.264 en BF16) especializado en la generación de RTL, es decir, módulos de Verilog y SystemVerilog sintetizables a partir de especificaciones escritas en inglés. Lo desarrolla el equipo del proyecto EOI 122, con financiación de la beca BIRDI dentro del programa SICIP, en el marco del proyecto "LLM-Guided RTL Design and Verification". Parte de Qwen3.5-9B, al que se aplica un post-entrenamiento sobre un corpus de Verilog construido a partir del dataset CodeV-R1.

El modelo resuelve un problema muy concreto del flujo de diseño de hardware: traducir una especificación funcional en código RTL correcto y sintetizable, una tarea donde los modelos generalistas fallan con frecuencia por cuestiones de semántica temporal, protocolos de bus y construcciones no sintetizables. Alpona-1.0-9B emplea una arquitectura híbrida de solo decodificador (`Qwen3_5ForCausalLM`), es multimodal en origen pero se distribuye sin el codificador visual, y mantiene la ventana de contexto de 262.144 tokens del modelo base.

Su relevancia actual radica en dos factores. Primero, publica resultados medidos con los testbenches oficiales de VerilogEval v2 y RTLLM v2, con una mejora sustancial sobre el modelo base (74,3 % frente a 48,5 % en pass@1 de VerilogEval v2). Segundo, se distribuye como pesos completos fusionados en un único archivo safetensors, sin adaptadores ni directorios de checkpoint, lo que simplifica el despliegue. La licencia CC BY-SA 4.0 impone, eso sí, condiciones de compartir igual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrida (`Qwen3_5ForCausalLM`, `model_type: qwen3_5_text`) |
| Parámetros totales | 8.953.803.264 (8,95B) en BF16 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos BF16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (un único archivo, 17,9 GB de descarga; repositorio de 53,7 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de solo decodificador con arquitectura híbrida, identificada en la model card mediante el tipo `qwen3_5_text` y la clase `Qwen3_5ForCausalLM`. Hereda del modelo base Qwen3.5-9B la ventana de contexto de 262.144 tokens, pero no incluye el codificador visual del original: el repositorio contiene únicamente los pesos de la torre de texto. No se detalla en la información disponible qué combinación concreta de mecanismos (atención completa, atención lineal u otros) compone la parte híbrida, ni la distribución de capas.

El entrenamiento consiste en un post-entrenamiento (finetune) sobre un corpus de Verilog construido a partir del dataset CodeV-R1, publicado bajo CC BY-SA 4.0 y compuesto por problemas de diseño Verilog emparejados con trazas de razonamiento. No se especifica el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron fases de RLHF o DPO. La innovación técnica más destacable no está en la arquitectura sino en el protocolo de evaluación: el modelo se puntúa con un bucle de reparación que le permite compilar y simular su propio código contra un testbench generado por él mismo, y corregirlo a partir de la salida del compilador y del simulador, sin acceso al testbench ni al diseño de referencia del benchmark. Ese bucle no forma parte del repositorio.

Un detalle operativo crítico es el modo de razonamiento: el prefijo del prompt termina en un `<think>` abierto, y la plantilla de chat del repositorio lo aplica automáticamente con `add_generation_prompt=True`. Evaluar el modelo con el bloque de razonamiento cerrado degrada notablemente la puntuación.

## Capacidades

- Generación de módulos Verilog y SystemVerilog sintetizables a partir de una especificación funcional en inglés, con una única salida de módulo completo y la interfaz solicitada.
- Modo de razonamiento (thinking) obligatorio: el modelo emite una traza de razonamiento extensa antes del código, lo que exige presupuestos amplios de `max_new_tokens` (el ejemplo de la model card usa 8192).
- Razonamiento multi-paso orientado a diseño de hardware: descomposición de la especificación, elección de estructura y escritura del RTL.
- Generación de testbenches propios, que habilita el bucle de auto-reparación a partir de errores de compilación y simulación.
- Capacidad de conversación multi-turno mediante plantilla de chat con roles `system` y `user`.
- Soporte de contexto largo: hasta 262.144 tokens, útil para especificaciones extensas, jerarquías de módulos o documentación de protocolos.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión, audio o tareas multimodales: no disponibles; el codificador visual del modelo base no se incluye.
- Uso como agente autónomo de EDA: no documentado más allá del bucle de reparación descrito en la evaluación.

## Casos de uso

- **Generación de RTL a partir de especificaciones de diseño:** un ingeniero describe en inglés la interfaz y el comportamiento de un módulo (por ejemplo, un contador síncrono de 4 bits) y el modelo devuelve un módulo SystemVerilog completo. Es adecuado porque se ha post-entrenado específicamente sobre pares especificación-RTL y alcanza un 74,3 % de pass@1 en VerilogEval v2 con bucle de reparación.
- **Asistencia a diseñadores en tareas de dificultad baja y media:** el modelo resuelve el 94,4 % de las tareas fáciles y el 52,8 % de las medias del conjunto de 30 tareas del proyecto en pass@1 sin reparación, lo que lo hace útil como primer borrador que el ingeniero revisa y ajusta.
- **Generación de bancos de pruebas preliminares:** al producir su propio testbench para el bucle de reparación, puede emplearse para obtener esqueletos de testbench que luego se sustituyen por los oficiales del equipo de verificación.
- **Docencia e investigación en generación de RTL con LLM:** el modelo y sus resultados publicados sirven como línea base reproducible para experimentos sobre post-entrenamiento en dominios de EDA, con métricas estándar (VerilogEval v2, RTLLM v2).
- **Exploración de variantes de diseño:** gracias a la ventana de 262.144 tokens, se le puede alimentar con una jerarquía de módulos existente y una especificación de cambio para generar una variante del bloque afectado, manteniendo el contexto del resto del diseño.
- **Prototipado rápido en flujos de CI de hardware:** integrado en un pipeline que compile y simule automáticamente la salida, el modelo puede generar candidatos de RTL y descartar los que no pasen lint o síntesis, reduciendo el trabajo manual en las etapas iniciales del diseño.
- **Aprendizaje de SystemVerilog sintetizable:** estudiantes que necesitan ejemplos funcionales a partir de un enunciado pueden usar el modelo como generador de referencia, siempre con verificación posterior por simulación.

## Benchmarks y rendimiento

Resultados publicados por el autor, puntuados con los testbenches oficiales de cada benchmark y con el bucle de reparación activado:

| Benchmark | pass@1 | pass@5 |
|---|---:|---:|
| VerilogEval v2 (156 tareas spec-to-RTL) | 74,3 % | 79,2 % |
| RTLLM v2 (50 diseños) | 66,7 % | 73,4 % |

Comparación con el modelo base, según los datos publicados por ChipMATE y citados en la model card:

| Modelo | VerilogEval v2 pass@1 | VerilogEval v2 pass@5 | RTLLM v2 pass@1 | RTLLM v2 pass@5 |
|---|---:|---:|---:|---:|
| Qwen3.5-9B | 48,5 % | 66,6 % | 36,1 % | 57,8 % |
| Alpona-1.0-9B | 74,3 % | 79,2 % | 66,7 % | 73,4 % |

Desglose por dificultad sobre las 30 tareas de VerilogEval del baseline M4 del proyecto (pass@1, %):

| Modelo | Configuración | Fácil | Media | Difícil | Total (30) |
|---|---|---:|---:|---:|---:|
| Qwen3.5-9B | solo | 87,5 | 41,7 | 8,3 | 53,3 |
| Qwen3.5-9B | con bucle de reparación | 100,0 | 58,3 | 8,3 | 65,0 |
| Alpona-1.0-9B | solo | 94,4 | 52,8 | 0,0 | 58,9 |
| Alpona-1.0-9B | con bucle de reparación | 100,0 | 75,0 | 0,0 | 70,0 |

Fuente: tablas 2.2 y 2.4 del Segundo Informe Trimestral del proyecto. Los resultados de la tabla principal corresponden a la configuración con bucle de reparación; el código de ejemplo del repositorio ejecuta el modelo solo, sin ese bucle.

## Requisitos de hardware

- **VRAM para BF16:** aproximadamente 18 GB para los pesos, más espacio para la caché KV. La model card no cuantifica el consumo de la caché KV a 262.144 tokens, que con 8,95B de parámetros y contexto completo puede ser muy elevado; en la práctica conviene limitar la longitud de contexto a la necesaria.
- **GPU recomendadas:** A100 40 GB o 80 GB, H100 80 GB y, en general, cualquier GPU con 24 GB o más para BF16 con contexto moderado (RTX 3090, RTX 4090, L40S, A6000).
- **GPU de consumo:** cabe en RTX 3090 y RTX 4090 con 24 GB en BF16 si se limita el contexto; no cabe en GPUs de 16 GB o menos sin cuantización, y el repositorio no publica pesos cuantizados.
- **Requisitos de software:** `transformers>=5.14.1`, `torch` y `accelerate`. La arquitectura híbrida `qwen3_5_text` no carga en versiones anteriores de transformers.
- **Opciones de despliegue:** la model card solo documenta el uso con `transformers` (`AutoModelForCausalLM` con `dtype="bfloat16"` y `device_map="auto"`). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF en el repositorio hace que llama.cpp y Ollama no sean utilizables directamente sin conversión propia.
- **Latencia y throughput:** no disponibles. El modo thinking genera trazas largas antes del código, lo que incrementa de forma notable los tokens de salida y, por tanto, el tiempo por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | VerilogEval v2 pass@1 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Alpona-1.0-9B | 8,95B | 262.144 | 74,3 % (con reparación) / 58,9 % en 30 tareas sin reparación | CC BY-SA 4.0 | Hugging Face, pesos fusionados |
| Qwen3.5-9B (base) | 9B | 262.144 | 48,5 % (con reparación, según ChipMATE) | no disponible en la información proporcionada | Hugging Face |
| CodeV-R1 (modelo del dataset de origen) | no disponible | no disponible | no disponible | no disponible | Hugging Face (dataset) |

No se dispone en la información proporcionada de datos comparativos de otros modelos especializados en RTL (por ejemplo, variantes de VeriGen, RTLCoder o CodeV) que permitan una comparación de parámetros, contexto y rendimiento con cifras verificables. La comparación más sólida disponible es la del modelo base Qwen3.5-9B, sobre el que Alpona mejora en 25,8 puntos de pass@1 en VerilogEval v2 y en 30,6 puntos en RTLLM v2, en ambos casos con el bucle de reparación.

## Limitaciones y advertencias

- **Tareas difíciles:** en las seis tareas difíciles del conjunto de 30, el modelo no resuelve ninguna, ni con ni sin bucle de reparación. Su utilidad práctica se concentra en diseños de dificultad baja y media.
- **Diseños de bus y protocolos:** las tasas de acierto en tareas de estilo protocolo son bajas según la figura 2.5 del informe del proyecto, lo que desaconseja su uso directo en bloques de interconexión complejos.
- **Salidas largas:** el modo thinking obligatorio genera razonamiento extenso antes del código; con un presupuesto de `max_new_tokens` insuficiente el módulo puede quedar truncado.
- **Corrección del código generado:** la salida puede contener errores funcionales, construcciones no sintetizables y problemas de temporización. Todo módulo debe verificarse con simulación contra un testbench independiente, lint y síntesis antes de usarse en hardware real.
- **Modo de razonamiento:** desactivar o cerrar el bloque de razonamiento degrada gravemente la puntuación; no debe usarse como un modelo de generación directa sin thinking.
- **Idioma:** solo inglés. Las especificaciones en castellano no están soportadas de forma declarada.
- **Alcance multimodal:** el codificador visual no se incluye, por lo que no puede procesar imágenes pese a descender de un modelo multimodal.
- **Licencia:** CC BY-SA 4.0 permite uso comercial, pero impone atribución y obligación de compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con flujos propietarios de diseño de hardware.
- **Uso en sistemas críticos:** la model card excluye explícitamente su uso sin revisión humana en hardware de seguridad crítica (médico, automoción, aeroespacial).
- **Sesgos y alucinación:** no se documentan evaluaciones de sesgo ni tasas de alucinación. En este dominio, la alucinación se manifiesta como RTL que compila pero no implementa la funcionalidad especificada.
- **Madurez del ecosistema:** 10 descargas y 0 likes en el momento de la consulta, sin pesos cuantizados publicados ni integración confirmada con servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/musatur/Alpona-1.0-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/zhuyaoyu/CodeV-R1-dataset
- Benchmark VerilogEval: https://github.com/NVlabs/verilog-eval
- Benchmark RTLLM: https://github.com/hkust-zhiyao/RTLLM
