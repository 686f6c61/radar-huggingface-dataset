# darrellbest/Qwen3.8-Flash-Next-Magma-Coder-W4A16

## Resumen

Qwen3.8-Flash-Next-Magma-Coder-W4A16 es una cuantización comunitaria no oficial del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario darrellbest en Hugging Face. El propósito declarado del repositorio es alojar un checkpoint en formato compressed-tensors W4A16 (int4 con grupo de 128 y simetría, orientado a vLLM) en el que los expertos enrutados y la atención QSA se almacenan en int4 mientras el resto de pesos permanece en bf16. El autor indica explícitamente que el trabajo está en curso y que los pesos aún se están construyendo y subiendo, por lo que el repositorio figura con un tamaño de 0,0 GB en el momento de la consulta.

La relevancia de esta ficha radica en su enfoque de cuantización: emplea una calibración orientada a código y agentes (transcripciones de agentes KannaCode, SWE-bench Lite con issues y parches dorados, código fuente de Magma y KannaCode, hermes-function-calling-v1, MATH-500, GSM8K y ultrachat_200k) y conserva los 512 expertos y la cabeza MTP del modelo base, sin fine-tuning ni poda. Además, introduce un plan de precisión mixta por experto que asigna anchos de bits distintos a cada una de las 73.728 proyecciones de experto, con una reducción estimada del error de reconstrucción del ~46 % frente a 4 bits uniforme con el mismo tamaño.

No se dispone de información sobre la arquitectura interna, el número de parámetros, la longitud de contexto ni los idiomas del modelo base Qwen3.8-Flash-Next en los datos proporcionados, por lo que esos campos se marcan como no disponibles. El modelo se distribuye bajo la licencia Qwen Community License 1.0, con cláusulas específicas para productos con más de 100 millones de usuarios activos mensuales o 20 millones de dólares de ingresos mensuales, y para negocios de Model-as-a-Service o asistentes de productividad con IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; la cuantización menciona expertos enrutados y atención QSA, compatible con un esquema MoE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base conserva 512 expertos según la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 en formato compressed-tensors (int4, grupo 128, simétrico); expertos enrutados y atención QSA en int4, resto en bf16; la línea GGUF asociada ofrece builds v2 (uniforme, 131 GB), v3 (por experto en contenedor Q8_0, 188 GB) y un formato compacto por experto de Magma (~122 GB) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | compressed-tensors W4A16 para vLLM; la línea GGUF asociada usa GGUF con contenedor Q8_0; también existe un layout MLX (`qwen4_exp`) en la línea Magma |

## Arquitectura y entrenamiento

La información disponible describe la cuantización, no la arquitectura completa del modelo base. Según la model card, el checkpoint cuantizado conserva los 512 expertos y la cabeza MTP (multi-token prediction) del modelo original, y aplica int4 a los expertos enrutados y a la atención QSA, manteniendo el resto de pesos en bf16. No se realizó fine-tuning ni poda: se trata exclusivamente de una compresión de pesos. El esquema de cuantización es compressed-tensors W4A16 con grupo de 128 y simetría, pensado para su ejecución en vLLM.

El aspecto técnico más destacado es el plan de precisión mixta por experto. El autor asigna un tipo de cuantización a cada una de las 73.728 proyecciones de experto, dando más bits a los expertos a los que enrutan los textos de código, tool calling y razonamiento, y menos a los que apenas se usan. La cifra declarada de ~46 % de reducción del error de reconstrucción (ponderado por enrutamiento y por la imatrix) corresponde a la comparación con 4 bits uniforme a igual número de bytes. La verificación KL de extremo a extremo está en curso. Este formato por experto solo se puede aprovechar en el runtime Magma (con anchos de bits nativos por experto); llama.cpp, LM Studio, Ollama, MLX estándar y vLLM almacenan un único ancho de bits por bloque de expertos de cada capa, por lo que ejecutan el build uniforme v2. La calibración emplea una imatrix y textos que no se distribuyen, e incluye, solo en la versión v2, transcripciones privadas de sesiones de agente de código del autor, filtradas de secretos.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next; no se detallan capacidades específicas en la información disponible.
- Generación de código: la calibración está orientada explícitamente a código (KannaCode, Magma, SWE-bench Lite), lo que sugiere un sesgo de calibración hacia tareas de programación.
- Tool calling / function calling: se emplea NousResearch hermes-function-calling-v1 en la calibración, lo que indica soporte previsto para llamadas a funciones.
- Razonamiento matemático: se incluyen MATH-500 y GSM8K en el conjunto de calibración.
- Agentes y razonamiento multi-paso: la calibración con transcripciones de agentes y parches de SWE-bench Lite apunta a un uso previsto en flujos agénticos.
- Decodificación especulativa: el modelo base conserva la cabeza MTP, y la línea Magma adopta un enfoque de drafting MTP + prompt-lookup.
- Capacidades multilingües: no disponible.
- Visión: la línea GGUF asociada menciona un proyector de visión proporcionado por Unsloth, pero no se confirma su disponibilidad en este checkpoint W4A16.

## Casos de uso

- Asistencia a la programación en producción: el checkpoint está calibrado con código fuente y parches de SWE-bench Lite, por lo que es adecuado para tareas de reparación de bugs y generación de parches en pipelines de CI/CD, siempre que se ejecute en vLLM con soporte compressed-tensors.
- Agentes de código autónomos: la calibración con transcripciones de agentes KannaCode y con hermes-function-calling-v1 lo orienta a bucles de tool calling y razonamiento multi-paso en entornos de desarrollo.
- Despliegue en vLLM con requisitos de memoria reducidos: el formato W4A16 con expertos en int4 y resto en bf16 permite servir el modelo con menor huella de memoria que el checkpoint bf16 original, manteniendo la cabeza MTP para decodificación especulativa.
- Evaluación de cuantizaciones para investigación: el repositorio documenta el plan de precisión mixta por experto y la metodología KL, lo que lo convierte en material de referencia para estudiar el impacto de la cuantización selectiva de expertos.
- Razonamiento matemático asistido: la inclusión de MATH-500 y GSM8K en la calibración sugiere un uso razonable en resolución de problemas matemáticos, aunque no hay benchmarks publicados que lo confirmen.
- Experimentación con runtimes alternativos: la línea asociada permite comparar el build uniforme v2 (131 GB), el build por experto v3 (188 GB) y el formato compacto de Magma (~122 GB) en cuanto a calidad y velocidad.
- Uso interno en empresas: la licencia exime del requisito de licencia separada al uso puramente interno que no exponga el modelo a terceros, lo que facilita su adopción en herramientas internas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica declarada es la reducción estimada del ~46 % del error de reconstrucción de los pesos de experto (ponderado por enrutamiento e imatrix) frente a 4 bits uniforme a igual tamaño, junto con una verificación KL de extremo a extremo aún en curso. En la línea GGUF asociada se mencionan velocidades medidas de 6-9 tok/s para el build v3 en una GPU de 96 GB (con algunos expertos ejecutándose en CPU) frente a unos 55 tok/s para el build v2, pero no son cifras de este checkpoint W4A16.

## Requisitos de hardware

- VRAM estimada: no disponible para este checkpoint W4A16; el repositorio figura con 0,0 GB porque los pesos aún no se han subido.
- Referencias de la línea asociada: build uniforme v2 de 131 GB, build por experto v3 de 188 GB y formato compacto de Magma de ~122 GB.
- GPU recomendadas: no disponibles para este checkpoint; la model card cita una GPU de 96 GB como escenario de prueba para el build v3 de la línea GGUF.
- Viabilidad en GPU de consumo: no disponible; los tamaños de 122-188 GB de la línea asociada exceden la VRAM de las GPU de consumo habituales.
- Opciones de despliegue: vLLM con soporte compressed-tensors para este checkpoint; llama.cpp, LM Studio y Ollama para los builds GGUF v2/v3; runtime Magma para el formato compacto por experto; MLX con el layout `qwen4_exp` en la línea Magma.
- Latencia y throughput: no disponibles para este checkpoint; en la línea GGUF v3 se midieron 6-9 tok/s en una GPU de 96 GB frente a ~55 tok/s para v2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darrellbest/Qwen3.8-Flash-Next-Magma-Coder-W4A16 | no disponible | no disponible | compressed-tensors W4A16 (int4 grupo 128) | qwen-community-1.0 | Repositorio creado, pesos en construcción (0,0 GB) |
| darrellbest/Qwen3.8-Flash-Next-Magma-Coder-GGUF | no disponible | no disponible | GGUF (v2 uniforme 131 GB, v3 por experto 188 GB) | qwen-community-1.0 | Disponible según la model card |
| VnimanieAI/Qwen3.8-Flash-Next-W4A16 | no disponible | no disponible | W4A16 (referencia de layout y `quantization_config`) | no disponible | Referenciado como layout de referencia |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | safetensors bf16 (presumiblemente) | qwen-community-1.0 | Modelo base oficial de Qwen |

## Limitaciones y advertencias

- Cuantización no oficial: el autor declara explícitamente que no está afiliado ni respaldado por Qwen o Alibaba.
- Trabajo en curso: los pesos aún se están construyendo y subiendo; el repositorio figura con 0,0 GB, por lo que no es utilizable en el momento de la consulta.
- Verificación incompleta: la verificación KL de extremo a extremo está en curso y no se han publicado benchmarks de calidad.
- Precisión mixta por experto no soportada en herramientas estándar: llama.cpp, MLX estándar y vLLM almacenan un solo ancho de bits por bloque de expertos, por lo que solo ejecutan el build uniforme v2; el formato compacto de Magma no carga en herramientas estándar.
- Calibración no distribuida: ni los textos de calibración ni la imatrix se publican, lo que limita la reproducibilidad.
- Datos privados en la calibración v2: incluye transcripciones privadas de sesiones de agente del autor, filtradas de secretos pero no distribuidas.
- Licencia restrictiva para servicios: los negocios de Model-as-a-Service o de asistente de productividad con IA (codificación u ofimática) necesitan una licencia separada de Qwen antes de cualquier uso comercial; el uso puramente interno que no exponga nada a terceros está exento.
- Obligación de atribución: los productos o servicios comerciales con más de 100 millones de usuarios activos mensuales o 20 millones de dólares de ingresos mensuales deben mostrar de forma prominente el nombre del modelo.
- Sin garantía: el software y sus salidas se proporcionan "tal cual".
- Sesgos y alucinación: no hay información específica publicada; se aplican los riesgos generales del modelo base, no documentados en la información disponible.
- Idiomas y contexto: no disponibles, lo que impide evaluar limitaciones de idioma o de ventana de contexto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización GGUF asociada: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-GGUF
- Build GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Layout de referencia W4A16: https://huggingface.co/VnimanieAI/Qwen3.8-Flash-Next-W4A16
- mlx-serve (ddalcu, MIT): https://github.com/ddalcu/mlx-serve
- Issue #80 de Magma (GGUF/CUDA): no disponible como enlace directo en la información proporcionada
