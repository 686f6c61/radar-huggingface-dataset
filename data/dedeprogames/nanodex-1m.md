# DedeProGames/NanoDex-1M

## Resumen

NanoDex-1M es un modelo de lenguaje decoder-only de 1.062.272 parametros entrenado desde cero por el usuario DedeProGames sobre el dataset fineweb-edu, utilizando el Space NanoDex Trainer de Hugging Science. Se trata de un artefacto de investigacion a escala nano: su objetivo no es competir con asistentes comerciales, sino hacer reproducible y observable el proceso completo de preentrenamiento de un transformer desde cero, con un coste de computo de apenas 43,8 minutos.

La arquitectura sigue el patron LlamaForCausalLM estandar, reducido en anchura y profundidad para ajustarse al presupuesto de parametros: 128 dimensiones ocultas, 5 capas, atencion con query agrupada (8 cabezas de consulta, 4 de clave/valor), MLP con activacion SiLU, RMSNorm, embeddings posicionales rotatorios y embeddings atados. La longitud de contexto es de 512 tokens y el vocabulario es un BPE personalizado de 2.048 entradas entrenado sobre el mismo corpus.

Su relevancia es fundamentalmente didactica y metodologica. Con 999.817.216 tokens vistos y una perdida final de 3,3092 (perplejidad 27,4), el modelo aprende formas de palabras, colocaciones frecuentes y algo de sintaxis, pero el propio autor advierte que no es un asistente util y que su salida no es factual. Publicado bajo licencia ODC-BY y en formato safetensors, sirve como banco de pruebas para pipelines de entrenamiento, tokenizadores, herramientas de inferencia y experimentos de ablacion a coste casi nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), SiLU MLP, RMSNorm, RoPE, GQA, embeddings atados, sin sesgos |
| Parametros totales | 1.062.272 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | ODC-BY |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano oculto | 128 |
| Numero de capas | 5 |
| Cabezas de atencion | 8 (4 de clave/valor) |
| Tamano de FFN | 288 |
| Vocabulario | 2.048 (BPE personalizado entrenado sobre fineweb-edu) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar de tipo Llama, escalado a la baja. Emplea MLP con activacion SiLU, normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE), atencion con query agrupada (GQA) con 8 cabezas de consulta y 4 de clave/valor, embeddings atados entre entrada y salida, y ninguna capa de sesgo. La configuracion resultante son 128 dimensiones ocultas, 5 capas, FFN de 288 unidades y un vocabulario de 2.048 tokens con tokenizador BPE entrenado especificamente sobre fineweb-edu.

El entrenamiento se realizo desde cero sobre HuggingFaceFW/fineweb-edu durante 3.814 pasos con 262.144 tokens por paso, lo que suma 999.817.216 tokens vistos. Se uso el optimizador AdamW con betas (0,9, 0,95), weight decay de 0,1 y recorte de gradiente de 1,0. El schedule de learning rate combina un 2% de warmup con decaimiento coseno hasta el 10% del valor pico de 3e-03. La perdida final reportada es de 3,3092, equivalente a una perplejidad de 27,4, y el tiempo total de entrenamiento fue de 43,8 minutos en el Space NanoDex Trainer. No se documenta ninguna fase de ajuste fino por instrucciones, RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva a nivel de palabra y colocacion frecuente, con sintaxis basica parcialmente adquirida.
- Generacion de texto no factual: el autor indica explicitamente que la salida no debe considerarse veraz.
- Modelado de lenguaje en ingles unicamente; no hay soporte multilingue documentado.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo "thinking", vision, audio ni multimodalidad.
- No se documenta soporte de rellenado (infilling), instrucciones ni plantillas de chat.
- Utilidad principal como sujeto de experimentacion: permite observar la evolucion de la perdida, el comportamiento del tokenizador y la dinamica de optimizacion en un entrenamiento completo y de coste minimo.

## Casos de uso

- Docencia y divulgacion de preentrenamiento: dado que el entrenamiento completo cabe en 43,8 minutos y el modelo ocupa unos pocos megabytes, se puede usar en un aula o taller para mostrar paso a paso como un transformer adquiere estadisticas del lenguaje, inspeccionando la perdida y las muestras generadas.
- Pruebas de humo en infraestructura de inferencia: sirve como modelo de carga minima para validar que un pipeline con transformers, endpoints compatibles o text-generation-inference funciona correctamente antes de desplegar modelos grandes, ya que su descarga y arranque son practicamente instantaneos.
- Validacion de pipelines de datos y tokenizacion: al incluir un BPE propio de 2.048 entradas entrenado sobre fineweb-edu, permite verificar extremo a extremo el flujo de tokenizacion, troceado de secuencias a 512 tokens y empaquetado de lotes.
- Experimentos de ablacion y comparativas controladas: investigadores pueden variar profundidad, anchura, vocabulario o schedule de learning rate sobre esta configuracion de referencia (loss 3,3092, ppl 27,4) para aislar el efecto de cada decision de diseno sin incurrir en costes de computo relevantes.
- Generacion de texto de relleno para interfaces y demostraciones: es adecuado para poblar maquetas de UI, pruebas de carga de frontales o demos que solo necesitan texto con forma de ingles plausible y no contenido factual.
- Pruebas de conversion y cuantizacion de pesos: su tamano permite convertir rapidamente safetensors a GGUF u otros formatos y comprobar el comportamiento numerico de distintas precisiones sin necesidad de GPU.
- Ejecucion en dispositivos embebidos y sin GPU: con aproximadamente 2 MB en precision de 16 bits, es viable ejecutarlo en CPU, Raspberry Pi o moviles para validar despliegues en el borde con recursos extremadamente limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida final de entrenamiento de 3,3092, correspondiente a una perplejidad de 27,4 sobre el corpus de entrenamiento. No hay resultados de MMLU, HumanEval, GSM8K, HellaSwag ni ninguna otra evaluacion estandar, y no se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision razonable. Los pesos ocupan aproximadamente 4,25 MB en fp32 y 2,1 MB en fp16/bf16, por lo que el cuello de botella es el runtime y no los pesos.
- GPU recomendadas: cualquiera, incluidas GPU integradas. No se requiere A100, H100 ni RTX 4090; tarjetas de gama baja o antiguas son mas que suficientes.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo, e incluso se ejecuta sin GPU en CPU. El repositorio ocupa 0,0 GB segun los metadatos de HuggingFace.
- Opciones de despliegue: transformers con AutoModelForCausalLM y AutoTokenizer, tal como documenta el autor. El modelo esta etiquetado como compatible con text-generation-inference y endpoints, por lo que vLLM o TGI son teoricamente viables, aunque no se proporcionan recetas. No se publican pesos GGUF, por lo que Ollama o llama.cpp requeririan una conversion previa. El uso de cuantizacion no esta documentado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones con otros modelos. A continuacion se recogen los datos verificables del propio modelo y se marcan como no disponibles los de las alternativas, que deberian corresponder a la categoria de modelos de lenguaje de escala nano entrenados desde cero con propositos educativos o de investigacion (por ejemplo, artefactos similares a los generados con nanoGPT o modelos de la familia TinyStories).

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoDex-1M | 1.062.272 | 512 | loss 3,3092 / ppl 27,4 (entrenamiento) | ODC-BY | HuggingFace (safetensors) |
| Alternativa de escala nano 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa de escala nano 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables en la informacion suministrada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Escala nano: con 1.062.272 parametros y 999.817.216 tokens vistos, el modelo solo adquiere formas de palabras, colocaciones comunes y algo de sintaxis. El propio autor lo describe como un artefacto de investigacion y no como un asistente utilizable.
- Salida no factual: la model card advierte explicitamente de que el contenido generado no es factual. El riesgo de alucinacion es total por diseno, ya que no existe conocimiento factual fiable almacenado ni fase de alineacion.
- Cobertura de idioma limitada al ingles. No hay soporte multilingue, por lo que su uso en castellano no esta contemplado ni validado.
- Ventana de contexto de solo 512 tokens, insuficiente para conversaciones multi-turno, documentacion larga o tareas de recuperacion.
- Ausencia total de alineacion: no hay RLHF, DPO ni ajuste por instrucciones, por lo que no responde a comandos ni sigue formatos de chat.
- Licencia ODC-BY: permite uso comercial siempre que se otorgue la atribucion correspondiente, pero esta pensada originalmente para bases de datos, por lo que conviene revisar su aplicacion a pesos de modelo antes de integrarlo en un producto.
- Sin datos de benchmarks, no es posible evaluar su comportamiento fuera de la distribucion de fineweb-edu ni compararlo objetivamente con alternativas.
- No se publican pesos cuantizados, artefactos GGUF ni recetas de despliegue en servidores de inferencia de alto rendimiento.
- El modelo fue creado y actualizado el 12 de septiembre de 2026, sin descargas ni interacciones registradas, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DedeProGames/NanoDex-1M
- Space del entrenador NanoDex Trainer: https://huggingface.co/spaces/hugging-science/nanodex-trainer
- Dataset de entrenamiento fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Perfil del autor en HuggingFace: https://huggingface.co/DedeProGames

Los resultados de la busqueda web proporcionada no contienen informacion relacionada con NanoDex-1M ni con modelos de su categoria, por lo que no se incluyen como enlaces relevantes.
