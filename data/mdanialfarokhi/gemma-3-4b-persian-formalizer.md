# mdanialFarokhi/gemma-3-4b-persian-formalizer

## Resumen

`mdanialFarokhi/gemma-3-4b-persian-formalizer` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario mdanialFarokhi. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, que es una version cuantizada a 4 bits del Gemma 3 de 4B parametros en su variante instruction-tuned, optimizada con la libreria Unsloth. Por el nombre del repositorio, el adaptador esta orientado a la "formalizacion" de texto en persa, es decir, a convertir registros coloquiales o informales al persa formal.

El modelo hereda la arquitectura transformer decoder-only de Gemma 3 y su ventana de contexto nativa, aunque el adaptador en si no modifica la arquitectura, solo anade pesos LoRA sobre las capas del modelo base. El repositorio es muy ligero (0,2 GB) porque contiene unicamente los pesos del adaptador, no el modelo completo; para usarlo es necesario descargar tambien el modelo base cuantizado.

La relevancia de esta ficha es limitada: la model card esta practicamente vacia (todo son marcadores "[More Information Needed]"), no hay datos de entrenamiento, benchmarks ni licencia declarada, y el modelo registra 0 descargas y 0 likes en el momento de la consulta. Se documenta aqui como ejemplo de adaptador SFT de bajo coste sobre Gemma 3, pero cualquier uso en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA (PEFT) |
| Parametros totales | ~4B en el modelo base; el adaptador LoRA no declara numero de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantizacion | modelo base en bnb-4bit; el adaptador se distribuye en safetensors (precision no especificada) |
| Idiomas soportados | no disponible (por el nombre del repositorio, orientado a persa) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Gemma 3 4B instruction-tuned, un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, tal como define la familia Gemma 3. El modelo base utilizado es la version de Unsloth cuantizada a 4 bits (bnb-4bit), lo que permite el ajuste fino en GPUs de consumo. El adaptador en si es un LoRA de rango no especificado, entrenado mediante SFT con la pila `transformers` + `trl` + `unsloth` (PEFT 0.21.0 segun la model card).

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, hiperparametros (learning rate, rango LoRA, alpha, dropout) ni si se aplicaron tecnicas de alineacion adicionales como DPO o RLHF. La model card no documenta ninguna innovacion tecnica propia; toda la arquitectura y el conocimiento provienen del modelo base Gemma 3.

## Capacidades

- Generacion de texto conversacional, heredada de Gemma 3 4B instruction-tuned.
- Reescritura y formalizacion de texto en persa (objetivo declarado en el nombre del repositorio), presumiblemente transformando registros coloquiales a un registro formal.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 4B parametros del modelo base.
- Capacidades multilingues heredadas de Gemma 3, aunque el adaptador puede degradar el rendimiento en idiomas distintos del persa al haber sido ajustado para una tarea concreta.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Gemma 3 lo soporta, pero no hay garantia de que el adaptador lo preserve.
- Modo "thinking" o razonamiento extendido: no disponible en esta variante.
- Vision: el modelo base Gemma 3 4B es multimodal, pero el adaptador es de texto y no se documenta soporte de imagen.

## Casos de uso

- Normalizacion de textos persas en pipelines de datos: el adaptador puede aplicarse por lotes para convertir comentarios, resenas o mensajes de usuario en persa coloquial a un registro formal antes de indexarlos o analizarlos.
- Generacion de correspondencia formal en persa: redaccion de correos, cartas o comunicados a partir de borradores informales, usando el modelo como paso de reescritura.
- Preprocesamiento para NLP downstream: formalizar el texto antes de pasarlo a modelos de analisis de sentimiento, clasificacion o extraccion de entidades entrenados sobre persa formal.
- Moderacion y estandarizacion de contenido generado por usuarios: convertir mensajes informales a una forma canonica para aplicar reglas o filtros de forma mas consistente.
- Asistencia a la redaccion en entornos educativos o administrativos: ayuda a hablantes que dominan el persa coloquial a producir texto formal, con supervision humana.
- Prototipado e investigacion sobre adaptadores LoRA: el repositorio sirve como ejemplo minimo de SFT con Unsloth sobre Gemma 3 4B cuantizado, util para reproducir el flujo de entrenamiento en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa ~0,2 GB; el modelo base cuantizado a 4 bits requiere aproximadamente 3-4 GB de VRAM para inferencia, mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para el modelo base en 4 bits (RTX 3060, RTX 4060, RTX 4090). Para entrenamiento o ajuste adicional, se recomienda 16 GB o mas (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas al usar el modelo base cuantizado a 4 bits; en FP16 el modelo base de 4B ronda los 8 GB.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el base), vLLM con soporte LoRA, llama.cpp/Ollama si se fusionan los pesos y se convierten a GGUF. TGI no documentado para este adaptador.
- Latencia y throughput: no disponibles; dependen del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mdanialFarokhi/gemma-3-4b-persian-formalizer | ~4B (base) + LoRA | no disponible | Adaptador LoRA SFT | no disponible | Hugging Face, 0 descargas |
| google/gemma-3-4b-it | ~4B | no disponible en esta ficha | Modelo base instruction-tuned | Gemma Terms of Use | Hugging Face, ampliamente usado |
| unsloth/gemma-3-4b-it-unsloth-bnb-4bit | ~4B | no disponible en esta ficha | Modelo base cuantizado 4 bits | Gemma Terms of Use | Hugging Face |
| Adaptadores LoRA persas sobre Gemma (genericos) | ~4B (base) | no disponible | LoRA SFT | variable | Hugging Face, busqueda por "gemma persian lora" |

La comparativa se limita al ecosistema Gemma 3 porque no se dispone de datos de rendimiento del adaptador ni de alternativas especificas de formalizacion persa documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- La model card esta vacia: no hay informacion sobre dataset, hiperparametros, evaluacion ni uso previsto, lo que impide validar la calidad del ajuste.
- No se declara licencia, lo que genera incertidumbre legal para uso comercial; ademas, el modelo base Gemma 3 esta sujeto a los Gemma Terms of Use, que el adaptador no puede eludir.
- Riesgo de alucinacion y de sobre-formalizacion: al ser un ajuste especifico, puede alterar el significado original del texto al reescribirlo.
- Posible degradacion de capacidades generales (razonamiento, codigo, otros idiomas) tras el SFT, ya que el adaptador no documenta preservacion de las habilidades del modelo base.
- Sin datos de sesgos: no se ha evaluado el comportamiento en registros dialectales, genero, ni en variedades del persa distintas de la estandar.
- 0 descargas y 0 likes: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Para produccion, es imprescindible evaluar el adaptador con un conjunto propio de textos persas y comparar contra el modelo base sin ajustar.

## Enlaces

- Hugging Face: https://huggingface.co/mdanialFarokhi/gemma-3-4b-persian-formalizer
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit
- Gemma 3 (Google): https://huggingface.co/google/gemma-3-4b-it
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
