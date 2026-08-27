# manalejandro/Qwen2.5-Coder-1-5B-Instruct-f16-q4_k_m

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q4_K_M del modelo Qwen2.5-Coder-1.5B-Instruct, creada por el usuario manalejandro. El modelo base, desarrollado por Alibaba, es un modelo de lenguaje especializado en código con 1.540 millones de parámetros, arquitectura Qwen2 y una ventana de contexto nativa de 32.768 tokens. La cuantización reduce el peso de los pesos de 2,9 GB (F16) a aproximadamente 0,94 GB, lo que permite ejecutar el modelo en GPUs de gama baja con 4 GB de VRAM, como una GTX 1650, manteniendo un buen equilibrio entre calidad y requisitos de hardware.

La relevancia de esta ficha radica en que ofrece una opción práctica para desarrolladores que necesitan un modelo de generación de código ligero, rápido y desplegable en entornos con recursos limitados, sin renunciar a la licencia Apache 2.0 que permite uso comercial. Al ser una cuantización Q4_K_M, se sitúa en el punto óptimo de calidad frente a otras cuantizaciones más agresivas como Q4_0 o IQ3_XXS, según indica el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.540 millones (1,54B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (limitado en la cuantización para caber en 4 GB de VRAM) |
| Tipos de cuantizacion | Q4_K_M (≈4,85 bits/peso) |
| Idiomas soportados | ingles, multilingue (principalmente codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version 3) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-1.5B-Instruct emplea una arquitectura transformer decoder-only de la familia Qwen2, con atención causal estándar. Fue preentrenado por Alibaba sobre un corpus masivo de datos de código y posteriormente ajustado con instrucciones (instruction tuning) para tareas de generación, depuración y explicación de algoritmos. Según la información disponible, el modelo responde directamente sin cadena de pensamiento obligatoria, lo que lo hace rápido y adecuado para agentes interactivos.

La cuantización Q4_K_M fue generada con llama.cpp a partir del archivo GGUF F16 publicado por bartowski, que a su vez deriva del modelo original de Qwen. No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO en la información proporcionada; estos datos no están disponibles en la documentación consultada.

## Capacidades

- Generación de código en multiples lenguajes de programacion, con especial enfasis en Python, JavaScript, Java y otros lenguajes comunes.
- Depuracion de codigo: identifica errores y sugiere correcciones en fragmentos de codigo.
- Explicacion de algoritmos y conceptos de programacion de forma didactica.
- Refactorizacion simple de funciones y metodos.
- Soporte multilingue basico, aunque el rendimiento optimo se logra en ingles y codigo.
- No se especifica soporte para tool calling, function calling ni razonamiento multi-paso avanzado en la informacion disponible.

## Casos de uso

- Asistente de codigo en entornos de desarrollo integrado (IDE): el modelo puede completar funciones, generar esqueletos de clases y sugerir implementaciones simples, gracias a su bajo consumo de VRAM que permite ejecutarlo localmente en portatiles con GPU integrada o dedicada de gama baja.
- Educacion y aprendizaje de programacion: explicar algoritmos, depurar ejercicios y responder preguntas sobre conceptos de programacion, aprovechando su capacidad de generar respuestas directas y didacticas.
- Automatizacion de tareas de scripting: generar scripts de automatizacion (bash, Python) para operaciones repetitivas en sistemas embebidos o servidores con recursos limitados.
- Prototipado rapido de funciones: en pipelines de CI/CD, el modelo puede generar tests unitarios basicos o funciones auxiliares, integrándose mediante la API compatible con OpenAI de llama-server.
- Chatbot de soporte tecnico especializado en codigo: desplegado con Ollama o Docker Model Runner, puede atender consultas de desarrolladores sobre errores comunes, sintaxis y mejores practicas, con una latencia baja en hardware modesto.
- Analisis estatico ligero: revisar fragmentos de codigo en busca de errores de sintaxis o logicos simples, como parte de herramientas de revision de codigo en entornos sin acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, y la busqueda web no ha proporcionado datos cuantitativos adicionales. Se recomienda consultar la documentacion del modelo base Qwen2.5-Coder-1.5B-Instruct para obtener referencias de rendimiento, aunque no se garantiza que los resultados sean directamente extrapolables a esta cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos (0,94 GB) mas el cache KV, lo que permite ejecucion completa en GPUs con 4 GB de VRAM.
- GPU recomendadas: GTX 1650, GTX 1060 6 GB, RTX 3050, o cualquier GPU con al menos 4 GB de VRAM. Tambien es viable en CPU con suficiente RAM (se recomienda al menos 8 GB).
- En consumer GPU: si, cabe en GPUs de gama baja y media.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-server con API compatible con OpenAI, Ollama, Docker Model Runner.
- Latencia y throughput: no se proporcionan datos especificos, pero al ser un modelo de 1,5B con cuantizacion Q4_K_M, se espera una generacion rapida en hardware moderno; en una GTX 1650 se pueden alcanzar decenas de tokens por segundo, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (F16) | 1,54B | 32.768 | Apache 2.0 | safetensors | Modelo base original, mayor precision pero 2,9 GB de pesos |
| Qwen2.5-Coder-1.5B-Instruct (Q4_K_M, este repo) | 1,54B | 32.768 | Apache 2.0 | GGUF | Cuantizacion ligera, 0,94 GB, apta para 4 GB VRAM |
| CodeLlama-7B (Q4_K_M) | 7B | 16.384 | Llama 2 license | GGUF | Modelo mas grande, requiere mas VRAM (~4 GB de pesos) |
| StarCoder2-3B (Q4_K_M) | 3B | 16.384 | Apache 2.0 | GGUF | Alternativa de tamano intermedio, contexto menor |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. La eleccion entre ellos dependera de los requisitos de VRAM, contexto y calidad deseada.

## Limitaciones y advertencias

- Modelo pequeno (1,5B): su capacidad es limitada para codebases grandes, logicas complejas o tareas que requieran razonamiento profundo. Puede generar codigo incorrecto o incompleto en escenarios avanzados.
- Riesgo de alucinacion: como todo LLM, puede inventar APIs, funciones o comportamientos inexistentes. Se recomienda validar el codigo generado.
- Contexto limitado a 32.768 tokens en esta cuantizacion, aunque el modelo base soporta hasta 128K; esta reduccion se realizo para ajustar el cache KV a GPUs de 4 GB.
- Sesgos potenciales: al estar entrenado principalmente con datos en ingles y codigo, puede tener un rendimiento inferior en otros idiomas o en dominios muy especializados.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion correspondiente.
- No se garantiza la compatibilidad con todas las herramientas de inferencia; se recomienda usar llama.cpp, Ollama o Docker Model Runner, que son los entornos probados por el autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/manalejandro/Qwen2.5-Coder-1-5B-Instruct-f16-q4_k_m
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Fuente GGUF original: https://huggingface.co/bartowski/Qwen2.5-Coder-1.5B-Instruct-GGUF
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Pagina de Ollama para Qwen2.5: https://ollama.com/library/qwen2.5:1.5b-instruct-q4_K_M
- Informacion adicional sobre el modelo base: https://huggingface.co/QuantFactory/Qwen2.5-Coder-1.5B-Instruct-GGUF
