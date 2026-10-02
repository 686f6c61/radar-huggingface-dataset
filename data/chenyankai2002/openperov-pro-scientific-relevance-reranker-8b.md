# ChenYanKai2002/OpenPerov-Pro-Scientific-Relevance-Reranker-8B

## Resumen

OpenPerov-Pro-Scientific-Relevance-Reranker-8B es un adaptador LoRA de reordenacion (reranking) supervisado, desarrollado por Yankai Chen, Zhi Wan y Tao Jing, que se monta sobre el modelo base Qwen/Qwen3-Reranker-8B. Su funcion dentro del framework OpenPerov Pro es ordenar por relevancia cientifica un conjunto fijo de articulos (Top-40) sobre perovskitas y fotovoltaica, preservando la pertenencia de los articulos al conjunto. No es un modelo generativo de proposito general, sino un componente de recuperacion aprendido dentro de una arquitectura de evidencia guiada.

El adaptador se publica como pesos PEFT (LoRA con rango 16, alpha 32 y dropout 0.05) en formato safetensors, con un tamano de repositorio de aproximadamente 0,2 GB, lo que confirma que solo contiene el delta de los pesos y no los pesos completos del modelo base. La puntuacion de relevancia se calcula como la diferencia de logits del siguiente token entre `yes` y `no`, un esquema tipico de los rerankers de Qwen3.

Es relevante ahora porque ejemplifica el patron de especializacion vertical: en lugar de entrenar un modelo desde cero, se adapta un reranker multilingue grande a un dominio cientifico concreto con coste computacional bajo. La licencia Apache-2.0 del adaptador facilita su reutilizacion, aunque el corpus, el indice de recuperacion y los datos de entrenamiento no se publican. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen3-Reranker-8B) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA anadido es de rango 16 (recuento exacto de parametros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura de inferencia es la del modelo base Qwen3-Reranker-8B, un transformer decoder de 8.000 millones de parametros orientado a reordenacion de textos. Sobre el se aplica un adaptador LoRA con rango 16, alpha 32 y dropout 0.05, entrenado especificamente para puntuar la relevancia cientifica de articulos del dominio de perovskitas y energia fotovoltaica. La puntuacion se obtiene como la diferencia de logits del siguiente token entre las respuestas `yes` y `no`, y el adaptador se carga directamente sobre el modelo base mediante `peft.PeftModel.from_pretrained`. El repositorio incluye tambien la configuracion y el tokenizer.

No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que el corpus de literatura, el indice de recuperacion, los paquetes de evidencia privados y los ejemplos de entrenamiento no se incluyen en la publicacion; la implementacion publica acepta colecciones de evidencia aportadas por el usuario. Tampoco se detalla si hubo una fase de inicializacion de entrenamiento previa mas alla de mencionar que un adaptador de inicializacion anterior no es una dependencia de inferencia adicional.

## Capacidades

- Reordenacion de relevancia cientifica: ordena un conjunto fijo de articulos (Top-40) segun su relevancia para una consulta, manteniendo la pertenencia al conjunto.
- Puntuacion binaria yes/no: genera una puntuacion de relevancia a partir de la diferencia de logits entre los tokens `yes` y `no`.
- Dominio especializado en perovskitas y fotovoltaica: el ajuste LoRA esta orientado a literatura cientifica de este campo.
- Integracion con framework de evidencia guiada: forma parte del pipeline OpenPerov Pro, que usa OpenPerov Flash como backbone de respuesta y un selector de retencion de fuentes.
- Funcionamiento sobre texto en ingles: el unico idioma declarado es `en`.
- Carga como adaptador PEFT: se integra en flujos de HuggingFace Transformers + PEFT sin dependencias de inferencia adicionales.

No se declaran capacidades de generacion abierta, tool calling, function calling, razonamiento multi-paso como agente, vision ni audio en la informacion proporcionada.

## Casos de uso

- Reordenacion de resultados de busqueda cientifica: dado un conjunto de articulos recuperados sobre perovskitas, el modelo los reordena por relevancia para una consulta concreta, mejorando la precision de los primeros puestos en un buscador especializado.
- Revision sistematica de literatura: en un flujo de revision sobre fotovoltaica, se usa para priorizar que articulos de un pool fijo merecen lectura completa, reduciendo el esfuerzo manual de cribado.
- Componente de pipeline RAG cientifico: se inserta como etapa de reranking entre la recuperacion (retrieval) y la generacion de respuestas de un sistema de preguntas y respuestas tecnicas.
- Construccion de estados del arte asistidos: combinado con el backbone OpenPerov Flash, ayuda a ordenar la evidencia que se usara para redactar resumenes o sintesis de un tema.
- Filtrado de evidencia para asistentes de laboratorio: permite descartar articulos poco relevantes antes de alimentar un modelo generativo, reduciendo ruido en las respuestas.
- Evaluacion comparativa de estrategias de recuperacion: sirve como referencia para medir la mejora de nDCG@10 frente a rerankers genericos en dominios cientificos especificos.
- Curacion de datasets internos de I+D: en un equipo de materiales, ordena colecciones documentales internas aportadas por el usuario para priorizar lecturas segun su relevancia al proyecto.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la evaluacion de pool fijo corregida por expertos:

| Metrica | Valor |
|---|---|
| nDCG@10 | 0,8739 |
| Relevant@10 | 0,9616 |
| Grade-3 MRR | 0,9583 |

No se han publicado en la informacion disponible resultados comparativos frente a otros rerankers (MMLU, HumanEval, GSM8K u otras baterias estandar no aplican ni se reportan para este modelo).

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,2 GB (tamano del repositorio), pero la inferencia requiere cargar tambien el modelo base Qwen3-Reranker-8B.
- VRAM estimada orientativa para el modelo base de 8B: en precision bf16/fp16 en torno a 16-18 GB; en cuantizacion de 8 bits en torno a 9-10 GB; en cuantizacion de 4 bits en torno a 6-7 GB. Son estimaciones generales para modelos de 8B, no cifras publicadas por el autor.
- GPU recomendadas: A100, H100 o similares para despliegue en produccion con precision completa; RTX 4090, RTX 3090 o A6000 para uso en una sola GPU con cuantizacion.
- Cabe en GPU de consumo con cuantizacion (por ejemplo, RTX 4090 de 24 GB en bf16, o tarjetas de 8-12 GB en 4 bits), siempre que el modelo base se cargue con esquemas de cuantizacion.
- Opciones de despliegue: HuggingFace Transformers junto con PEFT para cargar el adaptador; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenPerov-Pro-Scientific-Relevance-Reranker-8B | 8B (base) + LoRA r16 | no disponible | Perovskitas / fotovoltaica (en) | Apache-2.0 | HuggingFace (adaptador PEFT) |
| Qwen/Qwen3-Reranker-8B (modelo base) | 8B | no disponible | General / multilingue | Segun el modelo base | HuggingFace |
| BGE-reranker-v2-m3 | no disponible en esta consulta | no disponible | General / multilingue | no disponible en esta consulta | HuggingFace |
| Cohere Rerank | no disponible en esta consulta | no disponible | General | Propietaria | API comercial |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada; la comparacion se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado: solo esta ajustado para relevancia cientifica en perovskitas y fotovoltaica; su uso fuera de ese dominio no esta validado.
- Idioma: unico idioma declarado `en`; no hay soporte multilingue documentado en este adaptador.
- Sesgo de dominio: al entrenarse sobre un corpus concreto no publicado, puede heredar sesgos de cobertura de ese corpus (revistas, autores, subcampos sobrerrepresentados).
- Riesgo de alucinacion: menor que en un modelo generativo, ya que su salida es una puntuacion de relevancia; aun asi, puede asignar puntuaciones altas a articulos tangencialmente relacionados.
- Dependencia del modelo base: requiere cargar Qwen3-Reranker-8B, con su propio coste de VRAM y su propia licencia y avisos, que deben preservarse.
- Reproducibilidad limitada: el corpus, el indice de recuperacion, los paquetes de evidencia y los ejemplos de entrenamiento no se publican, por lo que no es posible reproducir el entrenamiento ni la evaluacion completa.
- Ajuste al pool fijo: el modelo esta disenado para ordenar un conjunto fijo de articulos preservando su pertenencia; no se ha documentado su comportamiento como filtro o recuperador de primer nivel.
- Uso comercial: el adaptador es Apache-2.0, pero conviene verificar la licencia del modelo base antes de desplegarlo en produccion.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 0 likes), sin validacion independiente conocida.
- OCR: no disponible informacion sobre cuantizaciones oficiales ni sobre versiones GGUF del adaptador.

## Enlaces

- HuggingFace: https://huggingface.co/ChenYanKai2002/OpenPerov-Pro-Scientific-Relevance-Reranker-8B
- Repositorio de codigo, benchmarks y registros de evaluacion: https://github.com/Yan-Kai-Chen/OpenPerov
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-8B
