# florianvoss/Qwen2.5-0.5B-Instruct-Autoround-a16w4

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un artefacto compilado: Qwen2.5-0.5B-Instruct-Autoround-a16w4 es la versión de Qwen2.5-0.5B-Instruct (previamente cuantizada por simaai en formato Autoround) compilada por florianvoss para el acelerador SiMa Modalix mediante la librería LLiMa (Neat 0.6.0). El objetivo es desplegar un modelo de lenguaje de 0,49 mil millones de parámetros en hardware de inferencia de borde, no en GPU convencional, con pesos de 4 bits y activaciones BF16.

El paquete incluye 131 ejecutables ELF, un directorio `devkit/` con los recursos de runtime y el script `compile.sh` que documenta los argumentos exactos de compilación. La compilación fija la longitud de contexto máxima en 4096 tokens con grupos de prefill de 128, muy por debajo de los 32.768 tokens nativos del modelo Qwen2.5 original, y conserva los tamaños de grupo y las excepciones de precisión mixta del modelo prequantizado de origen.

Su relevancia es acotada pero específica: sirve como referencia de cómo se empaqueta un LLM pequeño para el ecosistema SiMa Modalix y como artefacto listo para `llima run` en ese hardware. El propio autor advierte que la validación se limita a que la compilación y el despliegue local terminaron correctamente y que los ficheros superaron la verificación por checksum; no se han realizado mediciones de precisión ni de rendimiento en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) compilado a ModelGraph nativo para SiMa Modalix |
| Parametros totales | 0,49 B (heredados de Qwen2.5-0.5B-Instruct) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens en este artefacto (límite fijado en compilación); el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens nativos |
| Tipos de cuantizacion | a16w4: activaciones BF16, pesos de 4 bits con tamaños de grupo y excepciones de precisión mixta preservados del origen, embeddings y caché KV en INT8 |
| Idiomas soportados | No disponible en la ficha de este artefacto; el modelo base Qwen2.5 declara soporte de 29 idiomas |
| Licencia | Apache 2.0 (se aplican los términos del modelo de origen) |
| Formato de pesos | Artefactos compilados: 131 ejecutables ELF en `elf_files/` y assets de runtime en `devkit/`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only con normalización RMSNorm, atención con RoPE y capas densas (sin mezcla de expertos). Sobre esa base, simaai aplicó cuantización Autoround y este repositorio realiza una compilación con el Model Compiler de SiMa, que traduce el grafo a un ModelGraph nativo ejecutable en el acelerador. La compilación se lanzó con 16 procesos en paralelo, cada uno con un hilo de simulador, y con compartición de filtros activada por defecto para los componentes de lenguaje.

Los detalles de entrenamiento del modelo original (número de tokens, composición del corpus, fases de SFT, DPO o RLHF) no se documentan en la información disponible de este repositorio ni en su model card; solo se enlaza el modelo base Qwen2.5-0.5B-Instruct y su licencia. La innovación técnica de este artefacto no está en el entrenamiento sino en el empaquetado: pesos ya cuantizados incrustados en el binario compilado, excepciones de precisión mixta conservadas, embeddings y caché KV en INT8, y selección de la longitud de contexto y de las resoluciones de imagen en el momento de la compilación. `compilation.json` registra las revisiones del modelo fuente y del compilador utilizadas.

## Capacidades

- Generación de texto conversacional e instruccional en el rango propio de un modelo de 0,5 B: respuestas cortas, reformulación y resumen de pasajes breves.
- Razonamiento básico de un solo paso y aritmética simple, con degradación rápida en cadenas de razonamiento largas.
- Generación de código en fragmentos pequeños (funciones sueltas, expresiones, correcciones puntuales), sin garantías en tareas de varios ficheros.
- Seguimiento de instrucciones en formato chat, heredado del ajuste Instruct de Qwen2.5.
- Capacidad multilingüe heredada del modelo base (29 idiomas declarados por Qwen), aunque no verificada en este artefacto.
- Sin soporte de tool calling, function calling ni flujos de agente multi-paso documentado en esta ficha.
- Sin capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Ejecución exclusiva en SiMa Modalix con runtime LLiMa compatible; no es un modelo portable a vLLM, llama.cpp, Ollama o TGI.

## Casos de uso

- Asistentes embebidos en dispositivo Modalix: el modelo puede mantener conversaciones de varios turnos dentro de los 4096 tokens de contexto, suficiente para diálogos de soporte breve sin salir del hardware local.
- Enrutado y clasificación de intenciones en el borde: con 0,49 B y pesos de 4 bits, es viable usarlo como clasificador generativo de consultas entrantes antes de derivar a un sistema mayor, reduciendo el tráfico de red.
- Extracción de entidades y campos en textos cortos: resúmenes de partes de incidencia, notas de campo o formularios de menos de 4 KB de texto, con la ventaja de que los datos no abandonan el dispositivo.
- Generación de texto offline en entornos sin conectividad: dispositivos industriales, kioscos o equipamiento de campo donde no hay enlace a la nube y se requiere una respuesta textual mínima.
- Prototipado y validación de pipelines LLiMa: sirve como caso de prueba reproducible para verificar que un entorno de compilación y un runtime Modalix funcionan antes de portar modelos mayores del mismo fabricante.
- Sustitución de lógica basada en reglas por generación controlada: plantillas de respuesta, reformulación de mensajes de error o normalización de texto en flujos internos donde un modelo grande sería sobredimensionado.
- Evaluación comparativa de cuantización a16w4: al conservar grupos y excepciones de precisión mixta, permite estudiar la pérdida de calidad frente al modelo de origen en hardware de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la cola de compilación no realiza mediciones de precisión ni de rendimiento en tiempo de ejecución sobre Modalix; únicamente se verificó que la compilación completa y el despliegue local finalizaron correctamente y que los ficheros coinciden con sus checksums.

| Metrica | Estado |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks del artefacto | No disponible |
| Precision en tiempo de ejecucion sobre Modalix | No medida por el autor |
| Latencia y throughput en Modalix | No disponible |
| Verificacion de compilacion y despliegue local | Completada con exito, segun el autor |
| Verificacion de integridad de ficheros | Checksums verificados, segun el autor |

## Requisitos de hardware

- No se ejecuta en GPU convencional: requiere un dispositivo SiMa Modalix y un runtime LLiMa compatible con la versión de compilación (Neat 0.6.0).
- VRAM estimada: no aplica; el consumo se mide en memoria del acelerador y no se publica en la ficha. El repositorio ocupa 0,8 GB en disco.
- GPU recomendadas (A100, H100, RTX 4090, etc.): no aplica. Este artefacto no tiene backend CUDA ni ROCm.
- Compatibilidad con GPU de consumo: no. Para ejecutar el modelo base Qwen2.5-0.5B-Instruct en hardware de consumo habría que usar el repositorio de origen en safetensors con llama.cpp u Ollama, no este paquete compilado.
- Opciones de despliegue: descarga con `hf download` y ejecución con `llima run ./Qwen2.5-0.5B-Instruct-Autoround-a16w4`. La recompilación requiere un entorno de Model Compiler compatible, con variables `MODEL_DIR` y `OUTPUT_DIR` y argumentos adicionales opcionales.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y despliegue | Rendimiento |
|---|---|---|---|---|---|
| florianvoss/Qwen2.5-0.5B-Instruct-Autoround-a16w4 | 0,49 B | 4096 tokens | Apache 2.0 | ELF compilado, solo SiMa Modalix con LLiMa | No disponible |
| simaai/Qwen2.5-0.5B-Instruct-Autoround-Safetensors (origen) | 0,49 B | No disponible en la informacion | Apache 2.0 | Safetensors prequantizado Autoround | No disponible |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | Safetensors, convertible a GGUF; vLLM, llama.cpp, Ollama, TGI | Benchmarks publicados por Qwen, no incluidos en esta ficha |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Safetensors y GGUF; amplio soporte de runtimes | No disponible en esta ficha |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | Safetensors y GGUF; amplio soporte de runtimes | No disponible en esta ficha |

La diferencia clave frente a las alternativas no es de calidad sino de portabilidad: este artefacto solo es ejecutable en Modalix, mientras que los demás pueden desplegarse en CPU, GPU y servicios en la nube con runtimes estándar.

## Limitaciones y advertencias

- Capacidad limitada por el tamaño: con 0,49 B de parámetros, la precisión en razonamiento multi-paso, matemáticas y código complejo es baja en comparación con modelos de 7 B o superiores.
- Riesgo elevado de alucinación, especialmente en preguntas factuales y en generación de código con APIs que el modelo no ha visto; no se han publicado evaluaciones de fidelidad para este artefacto.
- Contexto recortado a 4096 tokens en la compilación, frente a los 32.768 del modelo base; los documentos largos deben trocearse antes de la inferencia.
- Idiomas soportados no documentados en esta ficha; aunque el modelo base declara 29 idiomas, no hay verificación del comportamiento tras la cuantización a 4 bits ni de la compilación.
- Sin datos de evaluación de la pérdida de calidad introducida por la cuantización a16w4 con excepciones de precisión mixta.
- Dependencia total del hardware y del runtime: no hay backend alternativo, y un cambio de versión de LLiMa o del Model Compiler puede invalidar los binarios.
- Ausencia de tracción comunitaria: 0 descargas y 1 like en el momento de la consulta, lo que reduce la probabilidad de que los fallos estén detectados y documentados.
- La licencia Apache 2.0 permite uso comercial, pero se aplican los términos del modelo de origen Qwen2.5-0.5B-Instruct; conviene revisar el enlace de licencia incluido en la model card antes de un despliegue en producción.
- El autor no garantiza resultados de generación en Modalix: la validación se limita a la compilación y a la integridad de los ficheros.

## Enlaces

- Repositorio del modelo: https://huggingface.co/florianvoss/Qwen2.5-0.5B-Instruct-Autoround-a16w4
- Colección Neat 0.6.0: https://huggingface.co/collections/florianvoss/neat-060
- Modelo de origen (safetensors prequantizado): https://huggingface.co/simaai/Qwen2.5-0.5B-Instruct-Autoround-Safetensors/tree/b80467b07e6c223ee29a08246e21807ccbbcfc31
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/7ae557604adf67be50417f59c2c2f167def9a775/LICENSE
- Script de compilación incluido en el repositorio: `compile.sh`
- Registro de revisiones de compilación: `compilation.json`
