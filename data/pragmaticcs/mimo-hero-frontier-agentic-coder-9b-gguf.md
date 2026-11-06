# pragmaticcs/MiMo-HERO-Frontier-Agentic-Coder-9B-GGUF

## Resumen

MiMo-HERO-Frontier-Agentic-Coder-9B-GGUF es un modelo de lenguaje causal de 9B parámetros publicado por el usuario pragmaticcs en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un merge (fusión de pesos) de tres modelos base: Qwen3.5-9B de Qwen, HERO-9B de XLearning-SCU y MiMo-V2.6-Distill-Qwen-9B de XiaomiMiMo. El merge se ha realizado con la técnica DARE (Drop And REscale), un método de fusión de modelos que elimina diferencias de parámetros de forma aleatoria y reescala los pesos restantes para preservar las capacidades de cada modelo fuente.

El objetivo declarado del modelo es servir como modelo "agentic coder" de frontera en un tamaño compacto: combina las capacidades de razonamiento y generación de código de los modelos base con soporte específico para tool calling, uso de navegador (browser-use) y flujos de trabajo de agentes multi-paso. Los tags incluyen deltanet y linear-attention, lo que sugiere que al menos parte de la arquitectura procedente de los modelos base emplea mecanismos de atención lineal o híbridos tipo DeltaNet.

El modelo se distribuye en formato GGUF (con imatrix para cuantizaciones de calidad) orientado a su ejecución local mediante llama.cpp y herramientas derivadas como Ollama. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Cabe destacar que el repositorio está marcado como restringido (gated), por lo que es necesario aceptar las condiciones del autor en Hugging Face antes de descargarlo. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), presumiblemente híbrido con DeltaNet/linear-attention según tags del repo (no disponible detalle exacto) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (cuantizaciones concretas no disponibles en la informacion proporcionada) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo original en safetensors/transformers, 47,4 GB de tamano total) |

## Arquitectura y entrenamiento

El modelo es un merge de tres modelos de ~9B parámetros mediante la técnica DARE (descrita en el artículo arXiv:2311.03099, referenciado en los tags del repo). DARE funciona eliminando de forma aleatoria las diferencias entre los pesos de los modelos fuente y un modelo base compartido, y reescalando las diferencias restantes por un factor inverso a la probabilidad de retención. Esto permite fusionar modelos que comparten inicialización (en este caso, todos derivados de la familia Qwen de 9B) sin degradar sus capacidades individuales. El segundo artículo referenciado (arXiv:2412.06464) corresponde a la literatura sobre DeltaNet/attention lineal, coherente con los tags deltanet y linear-attention del repositorio.

No se ha realizado entrenamiento adicional sobre el merge según la información disponible: no hay datos sobre tokens de entrenamiento, composición del dataset ni procesos RLHF/DPO propios de este modelo. Las capacidades de razonamiento, código y agentes proceden de los modelos fuente: Qwen3.5-9B (modelo base), HERO-9B (variante orientada a agentes) y MiMo-V2.6-Distill-Qwen-9B (modelo destilado de Xiaomi, presumiblemente con destilación de razonamiento). El detalle de la arquitectura exacta resultante del merge (proporciones DARE, capas afectadas) no está disponible en la información proporcionada.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Generacion y edicion de codigo: el modelo se posiciona como "agentic coder", heredando las capacidades de codigo de los modelos base Qwen3.5 y MiMo.
- Razonamiento: la procedencia de MiMo-V2.6-Distill (modelo destilado) sugiere capacidades de razonamiento tipo chain-of-thought, aunque no consta un modo thinking explicito.
- Tool calling / function calling: indicado explicitamente en los tags del repositorio.
- Capacidades agenticas: tags agentic y browser-use indican soporte para flujos de agentes y uso de navegador automatizado.
- Multilingue: ingles y chino.
- Compatibilidad con el ecosistema llama.cpp (formato GGUF con imatrix).

No hay informacion disponible sobre capacidades de vision, audio u otras modalidades.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede integrarse en frameworks de agentes (con tool calling) para planificar y ejecutar tareas de programacion multi-paso, como refactorizar un repositorio, corregir bugs a partir de stack traces o escribir tests de forma iterativa.
- Automatizacion de navegador: gracias al tag browser-use, es adecuado para agentes que controlan un navegador (extraer datos, rellenar formularios, verificar flujos web), tarea donde un modelo de 9B cuantizado en GGUF permite ejecucion local y barata por paso.
- Asistente de codigo local y privado: al ejecutarse en GGUF via llama.cpp u Ollama, puede desplegarse en local para completar y explicar codigo sin enviar propiedad intelectual a APIs externas.
- Atencion al cliente con herramientas: el soporte de function calling permite construir chatbots que consultan APIs internas (estado de pedidos, inventario) manteniendo conversaciones multi-turno, con la ventaja de coste marginal cercano a cero en hardware propio.
- Razonamiento y resolucion de problemas en chino e ingles: util para equipos que operan en ambos idiomas, aprovechando la herencia de Qwen y MiMo en chino.
- Prototipado rapido de pipelines agenticos: su licencia Apache 2.0 y tamano compacto lo hacen idoneo para experimentar con orquestadores multi-agente antes de escalar a modelos mayores.
- Generacion de documentacion tecnica: puede usarse para documentar bases de codigo existentes combinando lectura de archivos (via herramientas) y generacion de texto estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud; para un modelo de ~9B parámetros en GGUF, una cuantización Q4_K_M ocupa aproximadamente 5,5-6 GB y una Q8_0 unos 9,5 GB, mas el KV cache dependiente de la longitud de contexto (no disponible).
- GPU recomendadas: no disponible; como referencia, una RTX 4090 (24 GB) permite ejecutar cuantizaciones altas con contexto amplio, y GPUs de 8-12 GB (RTX 3060/4060 Ti) permiten cuantizaciones Q4.
- Consumer GPUs: dado el formato GGUF y el tamano de ~9B, es razonable que funcione en GPUs de consumo de 8 GB en adelante con cuantizaciones de 4 bits, y completamente en CPU con RAM suficiente (16 GB recomendados), aunque esto no esta confirmado por el autor.
- Opciones de despliegue: llama.cpp (formato nativo del repo), Ollama, LM Studio y cualquier runtime compatible con GGUF. La compatibilidad con vLLM o TGI no consta (el repo GGUF no es directamente compatible con ellos; se requeriria el modelo original en safetensors).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| MiMo-HERO-Frontier-Agentic-Coder-9B-GGUF | 8,95B | GGUF | Apache 2.0 | Merge agentic/coder (Qwen3.5 + HERO-9B + MiMo-V2.6-Distill) |
| Qwen/Qwen3.5-9B (base) | ~9B | safetensors | no disponible | Modelo base generalista |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | ~9B | safetensors | no disponible | Destilacion de razonamiento sobre Qwen |
| XLearning-SCU/HERO-9B | ~9B | safetensors | no disponible | Variante orientada a agentes |

La ventaja diferencial del merge frente a sus fuentes es la combinacion de las tres lineas de especializacion (generalista, agentes y razonamiento destilado) en un unico modelo ejecutable localmente en GGUF. No se dispone de datos de rendimiento para cuantificar diferencias.

## Limitaciones y advertencias

- El repositorio esta restringido (gated): hay que aceptar las condiciones del autor en Hugging Face antes de poder descargarlo.
- No se han publicado benchmarks ni evaluaciones: el rendimiento real del merge no esta verificado, y los merges DARE pueden degradar capacidades de los modelos fuente si la fusion no esta bien calibrada.
- Con 0 descargas registradas en el momento de la ficha, el modelo tiene practicamente sin comunidad ni validacion externa.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- No hay informacion sobre longitud de contexto, lo que dificulta planificar cargas agenticas que requieren ventanas largas.
- Los merges heredan los sesgos y el riesgo de alucinacion de los tres modelos fuente; no existen evaluaciones de seguridad especificas de este merge.
- La licencia Apache 2.0 del merge es permisiva, pero conviene revisar las licencias de los modelos base (Qwen, HERO, MiMo) para usos comerciales, ya que no constan en la informacion disponible.
- Al tratarse de un GGUF derivado de un merge, la compatibilidad con plantillas de chat y tool calling en llama.cpp puede requerir ajuste manual del prompt template.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pragmaticcs/MiMo-HERO-Frontier-Agentic-Coder-9B-GGUF
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base HERO-9B: https://huggingface.co/XLearning-SCU/HERO-9B
- Modelo base MiMo-V2.6-Distill-Qwen-9B: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Articulo sobre DARE (arXiv:2311.03099): https://arxiv.org/abs/2311.03099
- Articulo sobre DeltaNet/linear attention (arXiv:2412.06464): https://arxiv.org/abs/2412.06464
