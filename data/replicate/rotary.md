# replicate/rotary

## Resumen

`replicate/rotary` no es un modelo de lenguaje, sino un paquete de kernels de cómputo publicado en el Hub de HuggingFace bajo la librería `kernels`. Concretamente, implementa la operación de rotary positional embedding (RoPE) aplicada sobre los tensores de query y key en mecanismos de atención, una pieza presente en prácticamente todas las arquitecturas transformer modernas (Llama, Mistral, Qwen, etc.). El repositorio expone dos funciones: `apply_rotary` y `apply_rotary_transformers`.

El paquete está pensado para consumirse con la librería `kernels` de HuggingFace, que permite descargar y cargar kernels precompilados para distintos backends y versiones de framework sin necesidad de compilar desde fuente. El repositorio ocupa 0,4 GB, lo que es coherente con un paquete que incluye artefactos binarios precompilados para varias combinaciones de dispositivo y versión de biblioteca.

Es relevante ahora porque forma parte de la estrategia de HuggingFace de distribuir kernels optimizados como artefactos versionados en el Hub. La model card incluye un aviso importante: a partir del 13 de septiembre de 2026 se eliminarán los repositorios de kernels con tipo "model", por lo que es necesario usar una versión reciente de la librería `kernels`. No se trata, en ningún caso, de un modelo generativo y no debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (kernel de computo para rotary positional embedding; no es un modelo) |
| Parametros totales | no aplica (no es un modelo con pesos entrenados) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (no entrenado; los artefactos son binarios compilados por backend) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible; el repositorio contiene kernels compilados distribuidos vía la libreria `kernels` |
| ID en el Hub | replicate/rotary |
| Autor | replicate |
| Libreria | kernels |
| Tamano del repositorio | 0,4 GB |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |
| Funciones expuestas | `apply_rotary`, `apply_rotary_transformers` |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento asociado. `rotary` es una implementación de kernel de la transformación RoPE (rotary positional embedding), que rota pares de dimensiones de los tensores de query y key con frecuencias dependientes de la posición, inyectando información posicional relativa en el mecanismo de atención. La variante `apply_rotary_transformers` indica compatibilidad con la firma utilizada habitualmente por la librería Transformers, lo que facilita sustituir la implementación de referencia por esta versión optimizada.

El repositorio se distribuye a través del sistema de kernels de HuggingFace, que resuelve en tiempo de carga el binario adecuado según el dispositivo, la versión de PyTorch u otro framework y el backend disponible. No se documenta en la información proporcionada qué backends concretos están cubiertos (CUDA, ROCm, CPU, Metal), ni el número de tokens o composición de dataset alguno, porque no aplica: no existe entrenamiento, RLHF ni DPO. La model card indica que existe un script de benchmark asociado al kernel, ejecutable mediante `kernels benchmark`, pero no publica resultados.

## Capacidades

- Aplicación de rotary positional embedding sobre tensores de query y key en mecanismos de atención.
- Función `apply_rotary` como interfaz genérica.
- Función `apply_rotary_transformers` como variante compatible con el ecosistema Transformers.
- Distribución como artefacto precompilado cargable con `get_kernel("kernels-community/rotary", version=...)`.
- Versionado explícito: la carga requiere indicar una versión concreta del kernel.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni soporte multilingüe, porque no es un modelo de lenguaje.

## Casos de uso

- Acelerar la inferencia de modelos con RoPE: sustituir la implementación de referencia de rotary embedding por esta versión de kernel en el forward pass de atención, reduciendo el coste de esa operación en modelos tipo Llama o Mistral.
- Integración en pipelines de Transformers: usar `apply_rotary_transformers` como reemplazo directo de la función equivalente de la librería, minimizando cambios en el código existente.
- Despliegue reproducible con versiones fijadas: al requerir una versión explícita del kernel, permite anclar la versión en entornos de producción y evitar derivas silenciosas entre despliegues.
- Evaluación comparativa de kernels: emplear el script `kernels benchmark` para medir el rendimiento de esta implementación frente a alternativas en el mismo hardware antes de adoptarla.
- Reducción de tiempos de compilación en imagen de contenedor: al consumir un artefacto precompilado en lugar de compilar extensiones CUDA en el build, se simplifica la construcción de imágenes Docker para serving.
- Investigación en eficiencia de atención: servir como componente de referencia al estudiar el impacto del coste de las operaciones posicionales dentro del bloque de atención, especialmente en contextos largos donde el barrido de posiciones crece.
- Fine-tuning de modelos con RoPE: aplicar el mismo kernel durante el paso hacia adelante en entrenamiento o ajuste fino, siempre que el backend y el dispositivo estén soportados por el paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que existe un script de benchmarking ejecutable con `kernels benchmark kernels-community/rotary --version <version>`, pero no incluye cifras de latencia, throughput ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el kernel no almacena pesos, su huella en memoria es la de los tensores de entrada y salida de la operación de rotary embedding.
- GPU recomendadas: no disponible en la información proporcionada; debe consultarse la compatibilidad de la librería `kernels` con el hardware objetivo.
- Compatibilidad con GPU de consumo: no disponible; depende de los backends compilados incluidos en el artefacto de 0,4 GB.
- Opciones de despliegue: carga mediante `from kernels import get_kernel` tras instalar con `pip install -U kernels`. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Alternativa | Tipo | Licencia | Disponibilidad | Datos comparables |
|---|---|---|---|---|
| replicate/rotary | Kernel precompilado de rotary embedding vía libreria `kernels` | BSD-3-Clause | Hub de HuggingFace, libreria `kernels` | No disponible |
| kernels-community/rotary | Kernel de rotary publicado por la comunidad de kernels (referenciado en la propia model card) | no disponible | Hub de HuggingFace, libreria `kernels` | No disponible |
| Implementacion de referencia en Transformers (`apply_rotary_pos_emb`) | Función Python/PyTorch incluida en la librería | Apache-2.0 (segun la licencia de Transformers) | Incluida en la instalación de Transformers | No disponible |
| kernels-community/flash-attn3 | Kernel de atención citado en el aviso de la model card como ejemplo de repositorio afectado por la retirada | no disponible | Hub de HuggingFace, libreria `kernels` | No disponible |

No se dispone de cifras de rendimiento de ninguna de las alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni admite prompts, y no debe presentarse como tal en catálogos de modelos.
- Solo cubre la operación de rotary positional embedding; no implementa el mecanismo de atención completo ni otras capas.
- La carga exige especificar una versión concreta del kernel; usar una versión antigua puede provocar interrupciones.
- Aviso de retirada: a partir del 13 de septiembre de 2026 se eliminarán los repositorios de kernels con tipo "model" en el Hub. Es imprescindible usar una versión reciente de `kernels` para evitar fallos.
- No se documentan los backends soportados, por lo que puede no funcionar en hardware distinto de aquel para el que se compilaron los artefactos.
- Sin descargas ni likes registrados y con fecha de creación y actualización idénticas, lo que sugiere un paquete sin adopción verificable ni mantenimiento posterior documentado.
- No se especifican sesgos, riesgos de alucinación ni comportamiento multilingüe porque no aplica a un kernel de cómputo.
- Licencia BSD-3-Clause: permite uso comercial y modificación con obligación de conservar el aviso de copyright y la cláusula de exención de responsabilidad; no incluye concesión de patentes.
- No se dispone de garantías de compatibilidad numérica exacta frente a la implementación de referencia; conviene validar la equivalencia de resultados antes de sustituirla en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/replicate/rotary
- Libreria `kernels` de HuggingFace: https://github.com/huggingface/kernels
- Incidencias sobre la retirada de repositorios de kernels: https://github.com/huggingface/kernels/issues/new
- Replicate (sitio principal): https://replicate.com/
- Replicate en GitHub: https://github.com/replicate
- Explorador de Replicate: https://replicate.com/explore
