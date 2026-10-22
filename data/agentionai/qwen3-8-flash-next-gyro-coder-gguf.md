# agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF

## Resumen

Qwen3.8-Flash-Next Gyro-Coder es una cuantización extrema y especializada en código del modelo base Qwen/Qwen3.8-Flash-Next, un mixto de expertos (MoE) de 125B parámetros según su model card (116.514.464.640 parámetros reales en safetensors). Lo publica AgentionAI bajo el identificador agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF y su objetivo es claro: hacer que un modelo de esa escala quepa en una única tarjeta gráfica de 24 GB, en concreto 19,92 GiB de pesos en GPU (21,1 GiB con 64k de contexto y caché KV en q8_0). Para lograrlo aplica dos recortes agresivos y combinados: conserva solo 256 de los 512 expertos por capa (los que según su búsqueda evolutiva son relevantes para programación, dejando unos 65B parámetros en GPU) y almacena esos pesos con un codificador trellis propio a 2,125 bits por peso.

La relevancia del artefacto está en la técnica de compresión, no en el modelo base: AgentionAI afirma que su formato supera en calidad a cuantizaciones IQ3_XXS y UD-Q2_K_XL que ocupan un 20-25% más de memoria, y reporta una tasa de coincidencia top-1 del 93,1% con el modelo completo sobre Python reservado (KLD 0,165). El precio que se paga es una pérdida notable en conocimiento general y texto abierto (top-1 del 80,8% en descripciones de conocimiento cotidiano y 70,8% en material técnico de 2026), por lo que el autor recomienda las variantes Gyro-S y Gyro-M para uso general.

Es un artefacto marcado explícitamente como experimental: el formato de tensor y los kernels pueden cambiar, requiere una compilación propia de llama.cpp (Vulkan, distribuida en Docker) y **no carga en llama.cpp estándar** a pesar de la etiqueta TQ2_0 del Hub. La licencia declarada es qwen-community-1.0 (license: other), heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Qwen/Qwen3.8-Flash-Next; cada capa conserva 256 de sus 512 expertos |
| Parametros totales | 116.514.464.640 (116,5B) segun safetensors; la model card del autor indica 125B para el modelo base. El subconjunto de expertos conservado deja unos 65B parametros en GPU |
| Parametros activos | no disponible |
| Longitud de contexto | 64.000 tokens (64k; probado con `-c 65536` y cache KV q8_0) |
| Tipos de cuantizacion | TQ2_0 (trellis-coded quantization con rotacion de Hadamard, ~2,125 bits por peso, familia QTIP); existe una version del mismo conjunto de expertos a 8 bits mencionada por el autor, no publicada en este repo |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | qwen-community-1.0 (campo `license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF (un unico archivo `Qwen3.8-Flash-Next-Gyro-Coder-TQ2_0.gguf`, 70,6 GiB en disco); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE de la familia Qwen3.8-Flash-Next, con 512 expertos por capa. Gyro-Coder no reentrena nada: poda el espacio de expertos y recuantiza. Para elegir qué 256 expertos por capa conservar, AgentionAI mapeó primero qué expertos concentran cada dominio y después ejecutó una búsqueda evolutiva que propuso y puntuó unos 2.200 conjuntos candidatos de expertos en 14 ejecuciones; los mejores se materializaron como modelos completos y se sometieron a pruebas de código, bucles y conocimiento. El espacio de búsqueda declarado es de ~10⁷³²⁸ combinaciones para el modelo completo (~10¹⁵² por capa), lo que da idea de que el resultado es una elección heurística, no óptima.

La segunda pieza técnica es el codificador trellis propio (tipos de trellis y kernels de AgentionAI, en la familia de QTIP, Tseng et al., 2024), con rotación de Hadamard, que comprime a 2,125 bits por peso. El archivo final incluye además una tabla de n-gramas de 50,7 GiB que se mantiene en disco y se explota mediante la opción `--ngram-on-disk` de su build de llama.cpp; de ahí que el archivo ocupe 70,6 GiB aunque el peso en GPU sea de 19,92 GiB. La model card menciona soporte de decodificación especulativa (MTP draft) en las mediciones de velocidad. No se aportan datos sobre el dataset de entrenamiento original, número de tokens, ni sobre fases de RLHF/DPO.

## Capacidades

- Generación de código en tareas bien especificadas: implementar funciones, corregir bugs a partir de una traza, refactorizar y explicar código.
- Rendimiento medido en 8 tareas de programación auto-evaluadas (caché LRU, fusión de intervalos, corrección de bug desde traza, refactorización, script bash, SQL, parseo de CSV en JavaScript y cambio multi-archivo), con 2 semillas cada una.
- Modo "thinking" activado en las pruebas del autor, con hasta 64k tokens de contexto.
- Integración como backend compatible con la API de OpenAI (`http://127.0.0.1:8080/v1`) y con interfaz web de chat, pensado para conectarse a agentes de código y plugins de editor.
- Conversacional multi-turno (tag `conversational`) sobre el servidor llama.cpp incluido.
- Capacidades multilingües: no disponibles como dato declarado; el comportamiento observado en las pruebas se limita a Python, shell, SQL y JavaScript.
- No se declaran capacidades de visión, audio ni tool calling explícito en la información proporcionada.

## Casos de uso

- **Asistente de código en local sobre una sola GPU de 24 GB**: desplegando el archivo TQ2_0 con el build de llama.cpp de AgentionAI en una RTX 3090/4090 o 7900 XTX, se obtiene un modelo de ~65B parámetros efectivos en GPU sin depender de la nube; útil para equipos con requisitos de confidencialidad del código.
- **Corrección de bugs a partir de trazas de error**: la tarea de "bug fix from a trace" está entre las evaluadas; el modelo encaja en flujos donde se pega un stack trace y el código relevante y se pide un parche acotado.
- **Refactorizaciones guiadas y cambios multi-archivo**: con 64k de contexto se pueden pasar varios ficheros de un módulo y pedir cambios coherentes entre ellos, un escenario que la model card incluye explícitamente en su batería de pruebas.
- **Generación de scripts de automatización**: scripts bash y consultas SQL son dos de las tareas evaluadas, por lo que resulta apropiado para utilidades de operaciones, migraciones y limpieza de datos.
- **Backend para agentes de código en el editor**: al exponer una API compatible con OpenAI en el puerto 8080, se puede apuntar allí un plugin de editor o un agente tipo Continue o similares, manteniendo el tráfico en la red local.
- **Parseo y transformación de datos**: la tarea de parseo de CSV en JavaScript sugiere uso en pipelines de conversión de formatos y ETL ligero donde el modelo genera el código de transformación en lugar de ejecutarlo.
- **Docencia y revisión de código**: explicar fragmentos y proponer mejoras en un entorno sin conexión, con la advertencia de que su conocimiento general es limitado y no debe usarse como fuente de referencia.

## Benchmarks y rendimiento

Calidad frente al modelo completo (Q8_0, los 512 expertos), medida con `-c 2048`, según la model card:

| Conjunto de evaluacion | KLD (menor es mejor) | Top-1 (mayor es mejor) |
|---|---:|---:|
| Python (ficheros reservados) | 0,165 | 93,1% |
| shell | 0,417 | 80,9% |
| conocimiento (descripciones de cosas cotidianas) | 0,301 | 80,8% |
| reservado (escritura tecnica y codigo de 2026) | 0,579 | 70,8% |

Pruebas de código: 13 de 16 superadas (8 tareas auto-evaluadas x 2 semillas, thinking activado, 64k tokens). El mismo conjunto de expertos a 8 bits supera 15 de 16, lo que aísla la pérdida atribuible a la cuantización a 2,125 bits.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM**: 19,92 GiB solo para pesos; 21,1 GiB con 64k de contexto y caché KV en q8_0. Encaja en tarjetas de 24 GB.
- **GPU objetivo**: RTX 3090, RTX 4090 y Radeon RX 7900 XTX (24 GB). El build distribuido usa Vulkan, por lo que cubre AMD e Intel; para NVIDIA hay que cambiar los flags de Docker por `--gpus all -e NVIDIA_DRIVER_CAPABILITIES=all`.
- **Almacenamiento**: 70,6 GiB en disco (incluye la tabla de n-gramas de 50,7 GiB), recomendable NVMe rápido porque `--ngram-on-disk` la mantiene en disco durante la inferencia.
- **Despliegue**: exclusivamente el build propio de llama.cpp de AgentionAI (imagen Docker `agentionai/agention-llama:server`) con `-ngl 999 -fa on --jinja --ngram-on-disk`. **llama.cpp estándar no puede cargar este archivo.** vLLM, TGI y Ollama no están soportados según la información disponible. Strata (0.2.2) todavía no reconoce este archivo.
- **Rendimiento**: 11-22 tok/s por stream en Strix Halo (Vulkan, borrador MTP) con dos streams simultáneos generando respuestas largas. No hay datos de throughput en RTX 3090/4090.
- **Parámetros de muestreo recomendados**: `--temp 0.6 --top-p 0.95 --top-k 20 --min-p 0.05`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria en GPU | Calidad relativa | Licencia |
|---|---|---|---|---|---|
| Gyro-Coder (TQ2_0) | 116,5B totales, ~65B en GPU tras poda de expertos | 64k | 19,92 GiB (21,1 GiB con 64k) | Python top-1 93,1%; reservado 70,8% | qwen-community-1.0 |
| Gyro-S (misma familia) | no disponible | no disponible | 27,64 GiB | Recomendado por el autor para uso general ademas de codigo | qwen-community-1.0 |
| Gyro-M (misma familia) | no disponible | no disponible | 34,98 GiB | Reservado KLD 0,291 (mejor que 0,579 del Coder) | qwen-community-1.0 |
| Qwen3.8-Flash-Next completo en Q8_0 | 116,5B (512 expertos) | 64k | no disponible (referencia de calidad) | Referencia: top-1 100% por definicion | qwen-community-1.0 |
| Cuantizaciones IQ3_XXS / UD-Q2_K_XL | no disponible | no disponible | 20-25% mas que Gyro-Coder | El autor situa a Gyro-M por delante de ambas, no a Gyro-Coder | no disponible |

## Limitaciones y advertencias

- **Marcado como experimental**: el formato de tensor y los kernels pueden cambiar y los archivos se volverán a publicar; no es apto para producción sin fijar una versión concreta.
- **Incompatibilidad con llama.cpp estándar**: la etiqueta TQ2_0 es solo una clase de tamaño para el Hub; el archivo requiere el build propio de AgentionAI. Esto crea dependencia de un proveedor y complica la portabilidad.
- **Pérdida de conocimiento general**: el propio autor reconoce que el recorte de la mitad de los expertos degrada texto general y conocimiento (KLD 0,579 y top-1 70,8% en el conjunto reservado), y recomienda Gyro-S o Gyro-M para trabajo abierto.
- **Riesgo de alucinación**: no se han publicado evaluaciones de veracidad ni de tasa de alucinación; el KLD elevado en dominios fuera de código sugiere mayor desviación del modelo de referencia en esos contextos.
- **Idiomas**: no se declara lista de idiomas soportados. Las pruebas del autor se centran en Python, shell, SQL y JavaScript; el rendimiento en castellano no está documentado.
- **Sesgos**: no se han publicado análisis de sesgo en la información disponible.
- **Licencia**: qwen-community-1.0, marcada como `other`. Conviene revisar los términos del modelo base Qwen antes de cualquier uso comercial; no se detallan restricciones específicas en la información proporcionada.
- **Dependencia de disco**: la tabla de n-gramas de 50,7 GiB obliga a mantener almacenamiento rápido; sin ella, el rendimiento y posiblemente la calidad cambian.
- **Madurez ecosistema**: 0 descargas y 14 likes en el momento de la consulta; sin soporte en Strata 0.2.2 ni en herramientas estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variantes Gyro-S / Gyro-M: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Build de llama.cpp de AgentionAI: https://gitlab.com/agentionai-group/llama.cpp
- Strata: https://github.com/Niko1221/Strata
- Paper de referencia de la familia de cuantización QTIP (Tseng et al., 2024): no disponible como enlace en la información proporcionada
