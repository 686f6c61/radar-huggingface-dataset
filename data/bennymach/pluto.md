# bennymach/pluto

## Resumen

Pluto es un modelo de lenguaje causal de estilo GPT desarrollado por el usuario de HuggingFace bennymach como proyecto de aprendizaje sobre la construccion de modelos de lenguaje. Se trata de una implementacion propia en PyTorch, no basada en la libreria Transformers, que se distribuye junto con el codigo fuente necesario (`model.py` con las clases `GPT` y `GPTConfig`) para cargar el checkpoint de inferencia. El repositorio tiene un tamano de 0,1 GB, lo que sitúa el modelo en la categoria de modelos pequenos.

El modelo emplea el tokenizador BPE de GPT-2 a traves de `tiktoken` y esta pensado para generacion de texto con un formato de prompt orientado a instrucciones (`### Instruction:` / `### Response:`). Su ventana de contexto es de solo 256 tokens, lo que limita severamente su aplicabilidad en tareas que requieran contexto extendido o conversaciones multi-turno largas.

La relevancia de Pluto es fundamentalmente didactica: sirve como ejemplo reproducible de como se construye, entrena y publica un modelo causal desde cero en PyTorch. No obstante, su naturaleza experimental, la ausencia de datos de entrenamiento publicados y sus limitaciones declaradas por el propio autor (salidas inexactas, repetitivas o inseguras) lo hacen inadecuado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de estilo GPT (implementacion propia en PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch personalizado (no safetensors ni GGUF; requiere `model.py`) |

## Arquitectura y entrenamiento

Pluto es un transformer causal de estilo GPT implementado manualmente en PyTorch, con las clases `GPT` y `GPTConfig` definidas en `model.py`. El checkpoint publicado es un checkpoint PyTorch personalizado, no un `AutoModelForCausalLM` de Transformers, por lo que no es cargable directamente con las utilidades estandar de HuggingFace. El tokenizador es el BPE de GPT-2 obtenido via `tiktoken`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales. El autor indica que el tag de release registra el checkpoint seleccionado para esta version y recomienda mantener los checkpoints de entrenamiento y el estado del optimizador en un archivo separado, no incluirlos en la release de inferencia. El repositorio ocupa 0,1 GB, coherente con un modelo de parametros reducidos, aunque el numero exacto no se especifica.

## Capacidades

- Generacion de texto autoregresiva de tipo causal.
- Formateo de prompts para ajuste por instrucciones mediante las plantillas `### Instruction:` y `### Response:`.
- Tokenizacion basada en BPE de GPT-2 mediante `tiktoken`.
- Carga mediante codigo propio en PyTorch (`GPT`, `GPTConfig`), no mediante la API `AutoModelForCausalLM`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues especificas.
- No se documentan capacidades especiales (vision, audio, thinking mode).

## Casos de uso

- Experimentacion educativa: reproduce el ciclo completo de carga de un modelo causal en PyTorch usando `model.py`, util para quienes aprenden como se implementa un GPT desde cero.
- Pruebas de tokenizacion: permite experimentar con el tokenizador BPE de GPT-2 via `tiktoken` en un pipeline minimo de generacion de texto.
- Demostraciones de formato de instrucciones: sirve para ilustrar como se estructura un prompt de ajuste por instrucciones con las plantillas `### Instruction:` / `### Response:`.
- Prototipado de scripts de inferencia: al requerir codigo propio, es util como base para practicar la escritura de bucles de generacion autoregresiva y gestion de checkpoints en PyTorch.
- Docencia sobre limitaciones de contexto: con 256 tokens, es un ejemplo claro para mostrar el impacto de una ventana de contexto corta en la calidad y coherencia de la generacion.
- Referencia de empaquetado de releases: el autor documenta buenas practicas sobre separar checkpoints de inferencia de los de entrenamiento y del estado del optimizador, util como ejemplo de gestion de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,1 GB, lo que sugiere que el checkpoint cabe holgadamente en cualquier GPU consumer moderna, aunque el numero de parametros no se especifica.
- GPU recomendadas: no disponible. Por el tamano del repo, es plausible ejecutarlo en CPU o en GPUs de gama baja, pero no hay datos oficiales.
- Compatibilidad con GPU consumer: probablemente si, dado el tamano del checkpoint (0,1 GB), aunque no confirmado por el autor.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa, ya que usa un checkpoint PyTorch personalizado y requiere `model.py`. El despliegue se realiza mediante codigo PyTorch propio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Pluto (bennymach) | no disponible | 256 tokens | no disponible | Checkpoint PyTorch propio | HuggingFace, repo 0,1 GB |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT (segun publicacion original) | Safetensors / PyTorch | Ampliamente disponible |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT (segun publicacion original) | Safetensors / PyTorch | Ampliamente disponible |
| Modelos GPT didacticos tipo nanoGPT | variable | variable | MIT (segun repositorio) | Checkpoint PyTorch | Repositorios publicos |

La comparativa se limita a modelos de la misma categoria (GPT pequenos de proposito didactico), ya que no se dispone de datos de parametros ni de rendimiento de Pluto. La principal diferencia frente a GPT-2 es la integracion con `tiktoken`, la ventana de contexto reducida (256 frente a 1024 tokens) y la necesidad de codigo propio para la carga.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte que las salidas pueden ser inexactas, repetitivas o inseguras.
- Ventana de contexto de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- No es un checkpoint de Transformers (`AutoModelForCausalLM`); requiere cargar `model.py` con las clases `GPT` y `GPTConfig`.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Idiomas soportados no documentados; no hay garantia de calidad en castellano ni en otros idiomas.
- Sin datos publicados sobre sesgos, dataset de entrenamiento ni evaluaciones de seguridad.
- Riesgo elevado de alucinacion y degeneracion de la generacion por el tamano reducido y la falta de ajuste documentado.
- No apto para produccion: sin benchmarks, sin cuantizaciones publicadas y sin soporte de frameworks de despliegue estandar.
- Numero de parametros no especificado, lo que impide estimar con precision requisitos de memoria y latencia.

## Enlaces

- HuggingFace: https://huggingface.co/bennymach/pluto
- Repositorio del modelo (incluye `model.py`): disponible en la pagina de HuggingFace del modelo
- Tokenizador `tiktoken` (GPT-2 BPE): https://github.com/openai/tiktoken
