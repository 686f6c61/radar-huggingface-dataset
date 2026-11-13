# darcyyao/qwen3-1.7b-planner-smoke-grpo-GGUF

## Resumen

`darcyyao/qwen3-1.7b-planner-smoke-grpo-GGUF` es un ajuste fino del modelo Qwen3-1.7B de Alibaba, publicado por el usuario darcyyao en Hugging Face y distribuido en formato GGUF para su uso con llama.cpp y Ollama. El nombre del repositorio sugiere un entrenamiento orientado a tareas de planificacion (planner) mediante GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo, aunque la model card no documenta el proceso de entrenamiento ni el dataset utilizado. El modelo fue entrenado y convertido a GGUF con la herramienta Unsloth.

Se trata de un modelo de aproximadamente 1.720 millones de parametros, lo que lo situa en la categoria de modelos pequenos aptos para hardware de consumo. El repositorio ocupa 2,9 GB e incluye dos cuantizaciones: Q4_K_M y Q8_0, ademas de un Modelfile para Ollama. El modelo base Qwen3-1.7B es un transformer denso con capacidades multilingues y modo de razonamiento, si bien esta ficha no puede confirmar que dichas capacidades se conserven tras el ajuste fino.

La relevancia de este modelo es limitada y experimental: cuenta con cero descargas y cero likes en el momento de la consulta, la model card es minima (generada automaticamente por la plantilla de Unsloth) y no se especifican licencia, idiomas ni resultados de evaluacion. Debe tratarse como un artefacto de investigacion o una prueba de concepto, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B; no documentada en la model card) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el recuento de parametros) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por herencia del modelo base Qwen3-1.7B, cabe esperar un transformer denso con atencion por grupos (GQA) y soporte de modo de razonamiento, pero estos detalles no estan confirmados en la informacion disponible. El sufijo "planner-smoke-grpo" indica que el ajuste fino se realizo con GRPO, un algoritmo de optimizacion de politica relativa a grupos popularizado por DeepSeek, aplicado presumiblemente a tareas de planificacion. El termino "smoke" sugiere una ejecucion de prueba o de validacion del pipeline de entrenamiento, no un entrenamiento completo.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de SFT previas o posteriores, ni hiperparametros de RL. La conversion a GGUF se realizo con Unsloth, que segun la model card acelera el entrenamiento "2x" respecto a alternativas, aunque no se aportan mediciones. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Planificacion de tareas, segun el nombre del modelo; sin evaluacion publicada que lo respalde.
- Compatibilidad con llama.cpp mediante `llama-cli` y con Ollama mediante el Modelfile incluido.
- Soporte de plantillas de chat Jinja (`--jinja` en los comandos de ejemplo).
- Capacidades multilingues: presumiblemente heredadas de Qwen3, pero no confirmadas en la model card.
- Modo de razonamiento (thinking): no confirmado tras el ajuste fino.
- Tool calling / function calling: no confirmado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Vision o audio: no disponible (la referencia a `llama-mtmd-cli` es generica de la plantilla de Unsloth, no una indicacion de que este modelo sea multimodal).

## Casos de uso

- Prototipado de agentes de planificacion: el modelo puede emplearse para generar descomposiciones de tareas en pasos en entornos de experimentacion con llama.cpp u Ollama, dado su reducido tamano y su supuesta especializacion en planificacion.
- Pruebas de pipelines de RL: sirve como artefacto de referencia para validar flujos de entrenamiento con GRPO y conversion a GGUF con Unsloth antes de escalar a modelos mayores.
- Inferencia local en equipos modestos: con la cuantizacion Q4_K_M (aproximadamente 1 GB de pesos) puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion de texto sin requisitos de latencia estrictos.
- Evaluacion comparativa de ajustes finos: util como baseline para medir el efecto de un entrenamiento GRPO breve frente al Qwen3-1.7B original en tareas de planificacion.
- Demostraciones y docencia: su tamano y su formato GGUF facilitan mostrar el ciclo completo de ajuste fino y despliegue en un portatil.
- Experimentos de investigacion reproducibles: al incluir dos cuantizaciones, permite estudiar la degradacion de calidad entre Q4_K_M y Q8_0 en tareas de razonamiento estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M en torno a 1,1-1,3 GB de pesos; Q8_0 en torno a 1,8-2,0 GB. Con overhead de contexto, Q4_K_M cabe en 2-3 GB de VRAM y Q8_0 en 3-4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Consumer GPU: si, cabe en practicamente cualquier GPU de consumo reciente e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF (LM Studio, llama-cpp-python). No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| darcyyao/qwen3-1.7b-planner-smoke-grpo-GGUF | 1,72 B | no disponible | no disponible | GGUF | Ajuste GRPO experimental, sin evaluacion |
| Qwen/Qwen3-1.7B (base) | 1,72 B | 32 768 tokens (segun documentacion publica de Qwen3) | Apache 2.0 (segun documentacion publica de Qwen3) | safetensors, GGUF | Modelo oficial con evaluaciones publicadas |
| Llama 3.2 1B Instruct | 1,24 B | 131 072 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa oficial con soporte amplio |
| Gemma 3 1B IT | 1 B | 32 768 tokens | Gemma Terms of Use | safetensors, GGUF | Alternativa oficial de Google |

La comparativa se basa en datos publicos de los modelos oficiales; los valores de contexto y licencia del modelo de darcyyao no estan confirmados en su model card.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor o asumirse la licencia del modelo base Qwen3 (Apache 2.0) con cautela.
- No hay resultados de evaluacion que respalden la calidad del ajuste fino en tareas de planificacion.
- El sufijo "smoke" sugiere un entrenamiento de prueba; es probable que el ajuste sea limitado y pueda degradar capacidades del modelo base.
- Riesgo de alucinacion inherente a modelos de 1,7 B de parametros, especialmente en razonamiento multi-paso.
- Idiomas soportados no documentados; el rendimiento fuera del ingles y el chino es incierto.
- Longitud de contexto no documentada; no debe asumirse la ventana del modelo base sin verificacion.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni de validacion externa.
- No apto para produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/darcyyao/qwen3-1.7b-planner-smoke-grpo-GGUF
- Unsloth (herramienta de entrenamiento y conversion): https://github.com/unslothai/unsloth
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
