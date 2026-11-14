# crw72/Qwen3-Coder-Next-oQ4e-fp16

## Resumen
Qwen3-Coder-Next-oQ4e-fp16 es una cuantizacion de precision mixta del modelo Qwen/Qwen3-Coder-Next, desarrollada por el usuario crw72 mediante la herramienta oQ (oMLX v0.8.0rc1). El modelo resultante pesa 46 GB en disco (42,881 GiB de pesos logicos) y esta empaquetado en formato MLX safetensors, pensado para su ejecucion en hardware Apple Silicon. El checkpoint completo contiene 79.674.391.296 parametros (aproximadamente 79,7 mil millones) y emplea una media efectiva de 4,623 bits por peso.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de codigo de gran tamano en equipos con memoria unificada de 64 GB o superior, algo inviable con los pesos originales en bf16/fp16 (que ocuparian del orden de 160 GB). La cuantizacion mezcla capas en 4 bits afines (grupo 64) con un pequeno subconjunto en 8 bits y fp16, preservando presumiblemente las capas mas sensibles a la precision.

La informacion disponible sobre la arquitectura interna, el entrenamiento y los benchmarks del modelo base no esta presente en los datos proporcionados; esta ficha se limita a los datos verificables del repositorio de cuantizacion y del modelo base referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3-Coder-Next, familia qwen3_next) |
| Parametros totales | 79.674.391.296 (79,674B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 4-bit grupo 64 (77,309B, 4,50 bits/peso), affine 8-bit grupo 128 (0,151B, 8,25 bits/peso), affine 8-bit grupo 64 (2,162B, 8,50 bits/peso), FP16 (0,052B, 16 bits/peso); media efectiva 4,623 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 46,043 GB / 42,881 GiB |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura del modelo base (tipo de transformer, uso de MoE, atencion lineal o hibrida) ni sobre el corpus de entrenamiento, el numero de tokens o las fases de RLHF/DPO. El tag `qwen3_next` sugiere que pertenece a la familia Qwen3 Next, pero los detalles tecnicos no estan documentados en la informacion proporcionada.

La innovacion destacable de esta publicacion es el proceso de cuantizacion en si: oQ (oMLX v0.8.0rc1) aplica precision mixta asignando 4 bits afines con grupo de 64 a la practica totalidad de los pesos (97,032%), mientras que un 2,714% (2,162B) se mantiene en 8 bits con grupo 64 y un 0,190% (0,151B) en 8 bits con grupo 128; solo 0,052B permanecen en FP16. Esta distribucion busca reducir el error de cuantizacion en las capas mas sensibles sin disparar el tamano del checkpoint.

## Capacidades
- Generacion de codigo: el modelo base esta etiquetado como Coder, por lo que se orienta a tareas de programacion, aunque no hay documentacion explicita de capacidades en los datos disponibles.
- Razonamiento y generacion de texto general: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia local en Apple Silicon: capacidad efectiva derivada del formato MLX del checkpoint.

## Casos de uso
- Asistencia a la programacion en local: ejecutar el modelo en un Mac con memoria unificada suficiente para autocompletar, refactorizar y explicar codigo sin enviar el codigo a servicios en la nube, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Revision de codigo en pipelines internos: integrar el modelo como paso de analisis previo a la revision humana, aprovechando su condicion de modelo Coder para detectar patrones problematicos en diffs.
- Generacion de tests unitarios: dado un modulo existente, producir casos de prueba adicionales en local, reduciendo la dependencia de APIs externas.
- Documentacion tecnica automatizada: generar docstrings y documentacion de API a partir del codigo fuente, tarea repetitiva y bien acotada que se beneficia de la inferencia local.
- Migracion de bases de codigo: traducir fragmentos entre lenguajes o frameworks mediante instrucciones, con el modelo ejecutandose en el propio equipo del desarrollador.
- Prototipado offline en entornos air-gapped: usar el checkpoint MLX en maquinas sin conectividad, donde no es posible recurrir a servicios de inferencia remotos.
- Experimentacion con cuantizacion: servir como referencia practica para estudiar el impacto de la precision mixta oQ en la calidad de salida frente al modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: el checkpoint ocupa 42,881 GiB de pesos (46,043 GB en disco), por lo que se necesita memoria unificada de al menos 48 GB solo para los pesos; con margen para el grafo de computacion y la cache KV, se recomienda 64 GB o mas.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon (series M1/M2/M3/M4 con memoria unificada de 64 GB o superior, como M2 Max/M3 Max/M4 Max o Ultra). No hay soporte documentado para GPU NVIDIA en esta publicacion.
- Cabe en GPU consumer: no aplica en el sentido habitual; en Apple Silicon requiere configuraciones de gama alta con memoria unificada amplia.
- Opciones de despliegue: MLX (libreria declarada) y oMLX; no hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI con este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| crw72/Qwen3-Coder-Next-oQ4e-fp16 | 79,674B | no disponible | 4,623 bits/peso medio (oQ) | apache-2.0 | safetensors MLX |
| Qwen/Qwen3-Coder-Next (base) | 79,674B | no disponible | bf16/fp16 (original) | apache-2.0 | safetensors |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion verificable es con el modelo base: este checkpoint reduce el almacenamiento de aproximadamente 160 GB (pesos en 16 bits) a 42,881 GiB, a cambio de una perdida de precision media de 4,623 bits por peso. No se dispone de datos sobre otras cuantizaciones comparables del mismo modelo base.

## Limitaciones y advertencias
- Perdida de precision: la cuantizacion a 4,623 bits/peso medio puede degradar la calidad de generacion frente al modelo base, especialmente en tareas de razonamiento complejo o codigo con dependencias sutiles; no se han publicado evaluaciones comparativas.
- Plataforma restringida: el formato MLX limita el uso a hardware Apple Silicon; no es directamente portable a CUDA.
- Sesgos: no disponibles; no hay documentacion sobre sesgos del modelo base en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado; al ser un modelo de codigo, existe riesgo de generar APIs o funciones inexistentes, por lo que se recomienda validacion automatica de la salida.
- Idiomas: no disponibles; no se puede confirmar el soporte multilingue.
- Contexto: no disponible; no se puede planificar el uso con ventanas largas sin verificar la documentacion del modelo base.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar los terminos del modelo base Qwen/Qwen3-Coder-Next por si imponen condiciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes, sin pipeline declarado, por lo que no hay evidencia de validacion comunitaria.
- Uso en produccion: al ser una cuantizacion de terceros, no cuenta con el respaldo del equipo original de Qwen; para produccion se recomienda evaluar exhaustivamente la calidad frente al modelo base.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/crw72/Qwen3-Coder-Next-oQ4e-fp16
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
