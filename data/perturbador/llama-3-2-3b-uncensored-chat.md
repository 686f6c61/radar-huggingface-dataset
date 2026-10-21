# Perturbador/llama-3.2-3b-uncensored-chat

## Resumen

`Perturbador/llama-3.2-3b-uncensored-chat` es un ajuste fino (fine-tune) del modelo Llama 3.2 3B, publicado por el usuario Perturbador en HuggingFace y distribuido unicamente en formato GGUF para su uso con llama.cpp y Ollama. El repositorio contiene un unico archivo cuantizado, `Llama-3.2-3B.Q4_K_M.gguf`, ademas de un Modelfile de Ollama. El autor indica que el entrenamiento y la conversion se realizaron con Unsloth, y que el comportamiento del token BOS se ajusto para garantizar la compatibilidad con GGUF.

El modelo tiene 3.212.749.888 parametros totales, lo que lo situa en la categoria de modelos densos pequenos, aptos para inferencia en GPU de consumo e incluso en CPU. Por el nombre y el tamano, se trata de un derivado de la familia Llama 3.2, aunque la model card no documenta el proceso de fine-tune, el dataset utilizado, el numero de tokens de entrenamiento ni los hiperparametros. La etiqueta `uncensored` sugiere que se ha reducido o eliminado el alineamiento de seguridad del modelo original, si bien no se aporta ninguna descripcion tecnica del metodo empleado (abliteracion, DPO con datos sin filtrar, etc.).

La relevancia de esta ficha es limitada pero concreta: es un ejemplo tipico de modelo comunitario sin evaluacion publica, con cero descargas y cero likes en el momento de la consulta, creado el 20 de octubre de 2026 y actualizado el mismo dia. Resulta util para quien busque un modelo conversational de ~3B ejecutable en local sin restricciones de contenido, pero no dispone de benchmarks, licencia declarada ni idiomas documentados, por lo que su uso en produccion exige una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.2 3B por nombre y tamano; no documentado en la model card) |
| Parametros totales | 3.212.749.888 (3,21 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.2 3B declara 128.000 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (unico archivo publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | no disponible (la model card no la especifica) |
| Formato de pesos | GGUF para llama.cpp; no se listan safetensors en la model card |
| Tamano del repositorio | 4,0 GB |
| Etiquetas | gguf, llama, llama.cpp, unsloth, endpoints_compatible, conversational |
| Fecha de creacion / actualizacion | 2026-10-20 / 2026-10-20 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por el identificador del repositorio y el recuento de parametros (3,21 B), el modelo parece un fine-tune del transformer decoder-only de Llama 3.2 3B, que emplea atención con query grouping (GQA), normalizacion RMSNorm pre-norm, activaciones SwiGLU y embeddings rotatorios (RoPE). No se confirma en la documentacion ningun cambio estructural respecto al modelo base.

En cuanto al entrenamiento, el autor solo indica que el fine-tune y la conversion a GGUF se hicieron con Unsloth, y que el proceso fue "2x mas rapido" gracias a esa libreria. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF, DPO o alguna tecnica de eliminacion de rechazos, ni los hiperparametros de ajuste. Tampoco se detalla que se entiende por "uncensored" en este caso. El unico detalle tecnico adicional es el ajuste del comportamiento del token BOS para que el modelo funcione correctamente en llama.cpp, un paso habitual al convertir pesos de Llama 3.2 a GGUF.

## Capacidades

- Generacion de texto conversational multi-turno, orientada a chat (etiqueta `conversational`).
- Respuestas presumiblemente menos restrictivas que el modelo base en temas sensibles, segun la etiqueta `uncensored`; el alcance real no esta documentado.
- Ejecucion local en llama.cpp mediante `llama-cli -hf Perturbador/llama-3.2-3b-uncensored-chat --jinja`, con soporte de plantilla de chat Jinja.
- Despliegue sencillo en Ollama gracias al Modelfile incluido en el repositorio.
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.

## Casos de uso

- **Asistente conversational local y offline**: el modelo puede ejecutarse en un portatil con llama.cpp u Ollama sin conexion a internet, lo que resulta adecuado para prototipos de chat en entornos con requisitos de privacidad o sin acceso a la red.
- **Escritura creativa y roleplay sin filtros**: la orientacion `uncensored` lo hace util para generar ficcion con tematicas adultas o violentas, donde los modelos alineados suelen rechazar la peticion; conviene revisar el contenido generado antes de publicarlo.
- **Generacion de datos sinteticos para pipelines de moderacion**: se puede emplear para producir ejemplos de texto toxico o sensible que despues alimenten y evalien clasificadores de contenido, siempre en un entorno controlado y con supervision humana.
- **Red teaming y evaluacion de seguridad**: sirve como modelo de referencia "sin alinear" para comparar respuestas frente a un Llama 3.2 3B Instruct original y medir la eficacia de las capas de mitigacion en un producto.
- **Prototipado rapido en GPU de consumo**: con Q4_K_M ocupa del orden de 2 GB de pesos, por lo que cabe en tarjetas de 6-8 GB y permite iterar en el diseno de prompts y plantillas de chat sin coste de API.
- **Base para fine-tunes posteriores**: al ser un modelo de 3,21 B con licencia no declarada, puede servir como punto de partida experimental para ajustes con LoRA/QLoRA en una unica GPU, aunque la ambiguedad legal de la licencia desaconseja usarlo en productos comerciales.
- **Chat integrado en herramientas de escritorio**: mediante llama-cpp-python o el binding de Ollama se puede incrustar en un editor, una CLI o una app de notas para tareas de reescritura y resumen de textos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no cuenta con descargas ni valoraciones que permitan inferir un rendimiento observado.

## Requisitos de hardware

- **VRAM estimada (Q4_K_M)**: alrededor de 2,0-2,3 GB para los pesos, mas la cache KV. Con contexto de 8.000 tokens y GQA, la cache anade del orden de 1-2 GB, por lo que el consumo total se situa en torno a 4 GB.
- **VRAM estimada (FP16)**: aproximadamente 6,4 GB solo para los pesos, mas cache KV; no se distribuye en este formato, habria que convertir el GGUF o partir del modelo base.
- **GPU recomendadas**: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4060). Para FP16 conviene una RTX 4080/4090 (16-24 GB) o una A10/A100.
- **GPU de gama baja**: cabe en tarjetas de 6 GB (RTX 2060, GTX 1660 Ti) con contexto reducido; tambien funciona en CPU con llama.cpp, con velocidades de pocos tokens por segundo.
- **Opciones de despliegue**: llama.cpp (`llama-cli` con `--jinja`), Ollama (Modelfile incluido), LM Studio, llama-cpp-python y servidores compatibles con la API de Ollama. Para vLLM o TGI seria necesario convertir los pesos a safetensors o servir el modelo base ajustado.
- **Latencia y throughput**: no disponibles; el autor no publica mediciones. En una GPU consumer de gama media es esperable una generacion interactiva para un modelo de 3B en Q4_K_M, pero no hay datos verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Perturbador/llama-3.2-3b-uncensored-chat | 3,21 B | no disponible (128k en el base) | no disponible | Solo GGUF Q4_K_M, 0 descargas | Sin benchmarks ni evaluacion publica |
| Llama 3.2 3B Instruct (Meta) | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Safetensors y GGUF oficiales, ampliamente usado | Alineado, con benchmarks publicados por Meta |
| Qwen2.5 3B Instruct (Alibaba) | 3,09 B | 32.768 tokens (128k en variantes Turbo) | Apache 2.0 | Safetensors y GGUF, alta adopcion | Multilingue declarado, buenos resultados en codigo y matematicas |
| Phi-3.5-mini Instruct (Microsoft) | 3,8 B | 128.000 tokens | MIT | Safetensors y GGUF, amplia adopcion | Enfocado a razonamiento y codigo, contexto largo |

La comparacion de rendimiento no es posible: el modelo de Perturbador no publica metricas, por lo que la unica referencia objetiva son los resultados que Meta, Alibaba y Microsoft reportan para sus respectivos modelos base.

## Limitaciones y advertencias

- **Ausencia total de evaluacion**: no hay benchmarks, ni ficha de datos, ni descripcion del fine-tune; el comportamiento real solo puede conocerse mediante pruebas propias.
- **Riesgo de contenido danino**: la etiqueta `uncensored` implica que el alineamiento de seguridad puede haberse reducido o eliminado, con lo que aumenta la probabilidad de generar contenido ofensivo, ilegal o peligroso. No es recomendable exponerlo directamente a usuarios finales sin una capa de moderacion.
- **Alucinacion**: al ser un modelo de 3,21 B, la tasa de afirmaciones incorrectas en tareas factuales o de razonamiento largo es previsiblemente alta; no hay datos que lo cuantifiquen.
- **Licencia no declarada**: la model card no especifica licencia. Al derivar de Llama 3.2, es probable que se aplique la Llama 3.2 Community License y su politica de uso aceptable, que restringe ciertos usos; la ausencia de declaracion explicita es un riesgo legal para uso comercial o redistribucion.
- **Idiomas no documentados**: no se indica que idiomas soporta; el rendimiento en castellano no esta verificado y podria ser inferior al de un modelo con entrenamiento multilingue declarado.
- **Formato unico**: solo se publica GGUF Q4_K_M, lo que limita el ajuste fino de precision y obliga a convertir pesos para usar vLLM o TGI.
- **Ajuste del token BOS**: el autor modifico el comportamiento del token BOS para GGUF; un uso incorrecto de la plantilla de chat (`--jinja`) puede degradar la calidad de las respuestas.
- **Madurez del repositorio**: cero descargas y cero likes en el momento de la consulta, sin issues ni discusion; no hay senales de mantenimiento ni de validacion por la comunidad.
- **Fecha de creacion atipica**: el repositorio figura creado el 2026-10-20, lo que conviene verificar antes de citarlo.

## Enlaces

- HuggingFace: https://huggingface.co/Perturbador/llama-3.2-3b-uncensored-chat
- Unsloth (libreria usada para el fine-tune y la conversion): https://github.com/unslothai/unsloth
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos asociados a este modelo.
