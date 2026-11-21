# neutronai-code/Quark-12B-A2.5B-v0.7-GGUF

## Resumen

Quark-12B-A2.5B-v0.7-GGUF es la versión cuantizada en formato GGUF del modelo Quark-12B-A2.5B-v0.7, desarrollado por NeutronAI (neutronai-code). Se trata de un modelo especializado en autocompletado de código (tab-completion) y relleno de huecos (fill-in-the-middle, FIM), no de un modelo conversacional. Su arquitectura es de mezcla de expertos (MoE) con 12.149.923.072 parámetros totales, de los cuales solo 2.500 millones están activos por token, lo que permite una inferencia rápida en hardware de consumo.

El modelo deriva del modelo base Mellum2-12B-A2.5B-Base de JetBrains, cuya arquitectura `mellum` es soportada por llama.cpp a partir de la release b12606, utilizada para la conversión. La versión GGUF incluye dos ficheros: Q4_K_M (8,1 GB) y Q8_0 (12,9 GB). Según la model card, la cuantización a Q4_K_M no degrada de forma medible el rendimiento en el benchmark FIM propio del autor, donde obtiene un 60,8 % de aciertos frente al 59,8 % del modelo en bf16.

La relevancia de esta publicación radica en que ofrece un modelo MoE de 12B con solo 2,5B activos, empaquetado para ejecutarse en 16 GB de RAM mediante llama.cpp, con un rendimiento declarado a la altura de Qwen2.5-Coder-14B (60,5 %) en la tarea de FIM, pero con aproximadamente una sexta parte del cómputo por token. La licencia es Apache 2.0, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), arquitectura `mellum` (Mellum2 de JetBrains) |
| Parametros totales | 12.149.923.072 (12B) |
| Parametros activos | 2.5B por token |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (bf16 en el modelo base) |
| Idiomas soportados | code (lenguajes de programación; no se especifica lista) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE): 12B parámetros totales con 2,5B activos por token, lo que reduce el coste computacional por token en comparación con un modelo denso del mismo tamaño. La arquitectura subyacente es `mellum`, correspondiente al modelo Mellum2-12B-A2.5B-Base de JetBrains, y su soporte en llama.cpp requiere la release b12606 o posterior. La conversión a GGUF se realizó desde los pesos en bf16.

El entrenamiento está orientado específicamente a fill-in-the-middle con formato suffix-first: el prompt se construye con `<fim_suffix>`, `<fim_prefix>` y `<fim_middle>`, e incluye soporte para contexto de repositorio mediante bloques `<filename>`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El benchmark FIM propio del autor evalúa 600 huecos extraídos de 10 repositorios, puntuando cada completado con los tests del propio repositorio.

## Capacidades

- Relleno de huecos de código (fill-in-the-middle) en formato suffix-first con los tokens `<fim_suffix>`, `<fim_prefix>` y `<fim_middle>`.
- Autocompletado de código en editor (tab-completion), que es el caso de uso principal declarado.
- Uso de contexto de repositorio: acepta pares (ruta, firmas) de ficheros relacionados mediante bloques `<filename>`, ordenados por relevancia.
- Generación de código condicionada por prefijo y sufijo simultáneamente, lo que permite insertar código coherente con el contexto posterior.
- No es un modelo de chat: no se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No se documentan capacidades multimodales (visión, audio) ni multilingües fuera del código.

## Casos de uso

- Autocompletado en el editor (tab-completion): el modelo recibe el prefijo y el sufijo del fichero actual y genera la inserción; su bajo número de parámetros activos (2,5B) permite latencias compatibles con la escritura interactiva en un portátil.
- Relleno de huecos en refactorizaciones: dado un fragmento de código eliminado entre dos secciones existentes, el modelo reconstruye la implementación coherente con el sufijo ya presente, algo que un modelo causal puro no puede hacer con la misma precisión.
- Generación de tests o stubs a partir de firmas: usando el contexto de repositorio (`<filename>` con firmas de ficheros relacionados), el modelo puede completar funciones nuevas respetando las APIs existentes del proyecto.
- Asistente de código en IDE con contexto multi-fichero: la inclusión de pares (ruta, firmas) permite condicionar la completación a las definiciones de otros módulos del repositorio, útil en bases de código grandes.
- Servicio local de completado para equipos con hardware limitado: el fichero Q4_K_M (8,1 GB) se ejecuta en 16 GB de RAM vía `llama-server`, lo que permite desplegar un servidor de completado en estaciones de trabajo sin GPU dedicada.
- Evaluación y benchmarking de pipelines de FIM: el modelo sirve como referencia para medir la calidad de sistemas de completado contra tests reales de repositorio, dado que el autor publica la metodología (600 huecos, 10 repositorios).
- Integración en herramientas de CI para sugerencias de parche: aunque no es un modelo de chat, puede usarse para proponer rellenos en diff hunks con contexto de fichero, sujeto a validación posterior por tests.

## Benchmarks y rendimiento

| Modelo | Benchmark FIM (600 huecos, 10 repos) | Notas |
|---|---:|---|
| Quark-12B-A2.5B-v0.7 Q4_K_M (GGUF) | 60,8 % | 8,1 GB; gana 28 huecos y pierde 22 frente a bf16 (dentro del ruido) |
| Quark-12B-A2.5B-v0.7 bf16 | 59,8 % | Modelo base sin cuantizar |
| Qwen2.5-Coder-14B | 60,5 % | Modelo denso, ~6 veces más cómputo por token |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M requiere unos 8,1 GB de pesos y, según la model card, funciona en 16 GB de RAM; Q8_0 ocupa 12,9 GB y necesita más memoria disponible.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, Q4_K_M cabe en GPUs consumer con 12-16 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) y en GPUs de datacenter (A100, H100) con holgura.
- Cabe en GPU consumer: sí, con el fichero Q4_K_M en GPUs de 12 GB o más; también puede ejecutarse en CPU con 16 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-server`, release b12606 o posterior por el soporte de la arquitectura `mellum`). No se documenta soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no se publican cifras. El autor destaca que los 2,5B parámetros activos permiten ejecución rápida en portátil, pero sin datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | FIM (bench del autor) | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| Quark-12B-A2.5B-v0.7 | 12B (MoE) | 2,5B | no disponible | 60,8 % (Q4_K_M) | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-Coder-14B | 14B (denso) | 14B | no disponible en esta ficha | 60,5 % | no disponible en esta ficha | no disponible en esta ficha |
| Mellum2-12B-A2.5B-Base (JetBrains) | 12B (MoE) | 2,5B | no disponible | no disponible | Apache 2.0 (según model card) | safetensors (base) |

La comparación se limita a los datos aportados por el autor; no se dispone de resultados propios verificados para los modelos alternativos en este benchmark.

## Limitaciones y advertencias

- No es un modelo de chat: enviar prompts conversacionales o usar el endpoint `/infill` de llama.cpp (que ordena prefijo primero) produce resultados incorrectos; debe usarse `/v1/completions` con el formato suffix-first.
- El benchmark de referencia es propio del autor (600 huecos de 10 repositorios, puntuados con los tests del repositorio); no es un benchmark estándar y no es directamente comparable con cifras de HumanEval o similar.
- La cuantización Q4_K_M se declara sin degradación medible, pero la diferencia observada (60,8 % vs 59,8 %) está dentro del ruido según el propio autor; no hay garantía de equivalencia en otros dominios.
- Sesgos conocidos: no documentados. Al entrenarse solo con código, puede reproducir sesgos presentes en los repositorios de entrenamiento (estilos, APIs obsoletas, código con vulnerabilidades).
- Riesgo de alucinación: como todo modelo generativo de código, puede producir APIs inexistentes o firmas incorrectas; requiere validación con tests o compilación.
- Limitaciones de idioma: la etiqueta de idioma es únicamente `code`; no se documenta soporte de lenguaje natural ni de documentación multilingüe.
- Longitud de contexto: no disponible; el ejemplo de la model card usa `-c 8192`, pero no se confirma como máximo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base (Mellum2 de JetBrains) y de los datos de entrenamiento, no detalladas en la información disponible.
- Requiere llama.cpp b12606 o posterior por el soporte de la arquitectura `mellum`; versiones anteriores no cargarán el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente (21 de noviembre de 2026) sin validación comunitaria.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/neutronai-code/Quark-12B-A2.5B-v0.7-GGUF
- Modelo base: https://huggingface.co/neutronai-code/Quark-12B-A2.5B-v0.7
- Modelo base original (Mellum2-12B-A2.5B-Base, JetBrains): no disponible en la información proporcionada
- llama.cpp (release b12606): no disponible enlace directo en la información proporcionada
- Paper, blog o demo: no disponible
