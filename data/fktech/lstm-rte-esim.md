# FKTech/lstm-rte-esim

## Resumen

FKTech/lstm-rte-esim es un modelo de inferencia de relación textual (RTE, *Recognizing Textual Entailment*) publicado en HuggingFace por el usuario FKTech. Se trata de una implementación ligera y de estilo ESIM (*Enhanced Sequential Inference Model*) basada en una red BiLSTM, entrenada sobre el corpus RTE con embeddings GloVe de 300 dimensiones congelados. Es, por tanto, un modelo discriminativo de clasificación de pares de frases (entailment / no entailment), no un modelo generativo.

El modelo es deliberadamente pequeño: 967.170 parámetros entrenables, con una capa oculta de 128 unidades y un repositorio que ocupa 0,0 GB. El autor reporta una exactitud de validación de 0,5783 sobre RTE. Se distribuye con licencia MIT, lo que permite uso comercial sin restricciones adicionales, e incluye tres ficheros: `best_model.pt` (state_dict de PyTorch), `vocab.json` y `config.json`.

Su relevancia es principalmente académica o didáctica: sirve como referencia mínima de una arquitectura ESIM implementada en PyTorch, útil para estudiar el flujo de codificación, inferencia local y composición de inferencia sin dependencia de GPUs. No está pensado para sustituir a los modelos transformer actuales en tareas de NLI en producción, dado su bajo rendimiento reportado y la ausencia de documentación sobre el contexto máximo o los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiLSTM de estilo ESIM (Enhanced Sequential Inference Model), capa oculta de 128 unidades |
| Parametros totales | no disponible (967.170 parámetros entrenables; los embeddings GloVe-300d están congelados y su tamaño depende del `vocab_size`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en formato de estado PyTorch; no se documentan variantes GGUF, GPTQ o AWQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`best_model.pt`), junto con `vocab.json` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema clásico de ESIM: codificación de entrada con una BiLSTM compartida sobre ambos textos, modelado de inferencia local entre las representaciones alineadas de premisa e hipótesis, y una fase de composición de inferencia que agrega las diferencias y productos elemento a elemento antes de la clasificación final. En esta implementación concreta, el autor fija la dimensión oculta en 128 (`hid=128`) y define una clase `ESIMLite` para cargar el modelo, indicando que debe pasarse una matriz de embeddings ficticia de forma `(vocab_size, 300)`; el modelo real carga los vectores GloVe-300d desde el vocabulario asociado.

El entrenamiento se realizó sobre el corpus RTE con los embeddings GloVe de 300 dimensiones congelados, de modo que solo se optimiza el resto de la red (967.170 parámetros). No se documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en modelos discriminativos de este tipo). La única métrica reportada por el autor es una exactitud de validación de 0,5783.

## Capacidades

- Clasificación de relación textual (RTE): determina si una hipótesis se deduce de una premisa, tarea binaria de *textual entailment*.
- Procesamiento de pares de secuencias: la arquitectura ESIM está diseñada específicamente para comparar dos textos de entrada de forma interactiva.
- Codificación de frases con embeddings estáticos: emplea representaciones GloVe-300d congeladas, sin contextualización dinámica.
- Inferencia en CPU: por su tamaño reducido, puede ejecutarse sin GPU.
- No dispone de generación de texto, razonamiento multi-paso, matemáticas, código, visión ni audio.
- No se documenta soporte de *tool calling*, *function calling* ni uso como agente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo *thinking*, cadena de pensamiento, salidas estructuradas): no disponibles.

## Casos de uso

- Experimentación académica con arquitecturas ESIM: permite reproducir y estudiar el pipeline completo de un modelo de inferencia textual clásico en PyTorch con muy pocos recursos, útil en cursos de procesamiento de lenguaje natural.
- Prototipado rápido de clasificadores de pares de frases: sirve como línea base inicial antes de migrar a un transformer preentrenado, dado que su carga y ejecución son inmediatas.
- Pruebas de integración en pipelines educativos de CI: al ocupar menos de 1 GB y no requerir GPU, puede incluirse en *tests* automáticos que verifiquen flujos de inferencia de extremo a extremo.
- Comparación de técnicas de embedding estático frente a contextual: útil como punto de referencia en estudios que midan la ganancia de usar BERT o RoBERTa frente a GloVe congelado sobre RTE.
- Ejecución en entornos con restricciones de hardware: dispositivos embebidos, portátiles sin GPU o contenedores con memoria limitada donde no cabe un modelo transformer.
- Validación de infraestructura de despliegue: sirve como modelo de humo (*smoke test*) para verificar que un servidor de inferencia de PyTorch o TorchServe funciona correctamente antes de desplegar modelos mayores.
- No se recomienda su uso en atención al cliente, generación de código, agentes o cualquier tarea generativa, ya que el modelo es exclusivamente discriminativo.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| RTE | Exactitud de validacion | 0,5783 | Valor reportado por el autor en la model card |
| RTE | Parametros entrenables | 967.170 | No incluye los embeddings GloVe congelados |

No se han publicado resultados comparativos adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y ninguno de ellos sería aplicable a un modelo discriminativo de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la mayoría de configuraciones. Los 967.170 parámetros entrenables ocupan unos 3,9 MB en fp32; la matriz de embeddings GloVe-300d congelada domina el consumo y depende del `vocab_size` (aproximadamente 60 MB si el vocabulario ronda las 50.000 entradas y 480 MB si ronda las 400.000, en fp32). Estas cifras son estimaciones, no datos confirmados por el autor.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con al menos 2 GB de memoria (GTX 1050, RTX 3050, T4) es más que suficiente si se desea acelerar la inferencia.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en CPU exclusivamente.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre `best_model.pt`) usando la clase `ESIMLite` indicada por el autor; exportación a TorchScript u ONNX para servir con ONNX Runtime; integración en un servicio propio con FastAPI o TorchServe. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que estas herramientas están orientadas a modelos generativos con arquitecturas transformer o SSM.
- Latencia y throughput estimados: no disponibles. Se espera una latencia muy baja por el tamaño del modelo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FKTech/lstm-rte-esim | BiLSTM estilo ESIM con GloVe congelado | 967.170 entrenables | no disponible | MIT | HuggingFace |
| ESIM original (Chen et al., 2017) | BiLSTM con atencion e inferencia local | no disponible en la informacion proporcionada | no disponible | no disponible | Implementaciones publicas en distintos repositorios |
| InferSent (Facebook Research) | BiLSTM con embeddings GloVe entrenados en SNLI | no disponible en la informacion proporcionada | no disponible | no disponible | Codigo y pesos publicos |
| Cross-encoder transformer ajustado en RTE (por ejemplo, RoBERTa-large) | Transformer encoder con clasificacion | cientos de millones | 512 tokens tipicamente | variable segun el modelo base | HuggingFace |

La comparación cuantitativa de rendimiento no está disponible: la única cifra publicada para este modelo es la exactitud de validación de 0,5783, y no se dispone de resultados verificables de las alternativas dentro de la información proporcionada. Cualitativamente, los cross-encoders transformer ajustados en RTE obtienen resultados muy superiores en la literatura, a costa de un tamaño y unos requisitos de cómputo mucho mayores.

## Limitaciones y advertencias

- Rendimiento bajo: la exactitud de validación reportada (0,5783) es muy reducida para la tarea RTE, donde los modelos transformer de referencia superan ampliamente esa cifra. No es adecuado para producción sin reentrenamiento o ajuste.
- Riesgo de sesgo: al usar embeddings GloVe-300d, el modelo hereda los sesgos de género, raza y religión presentes en el corpus con el que se entrenaron esos vectores. No hay documentación de mitigación.
- Idiomas: no se especifica el idioma de entrenamiento. El uso de GloVe-300d y del corpus RTE apunta al inglés, pero la model card no lo confirma, por lo que el comportamiento en castellano es desconocido.
- Longitud de contexto: no documentada. Los modelos BiLSTM de este tipo suelen truncar las secuencias a longitudes cortas, pero no hay dato confirmado.
- Alucinación: el modelo es discriminativo y produce una etiqueta de clasificación, por lo que no genera texto; el riesgo equivalente es la clasificación errónea de pares de frases.
- Repositorio vacío: el tamaño del repositorio figura como 0,0 GB y no registra descargas ni *likes*, lo que sugiere que los pesos podrían no estar efectivamente subidos o que el repositorio está prácticamente vacío. Conviene verificar la disponibilidad de `best_model.pt` antes de planificar cualquier uso.
- Dependencia de una clase propia: la carga requiere la clase `ESIMLite` y una matriz de embeddings ficticia, lo que implica que el código de definición del modelo debe obtenerse aparte; un `torch.load` directo del `state_dict` no es suficiente.
- Licencia: MIT, sin restricciones para uso comercial, pero sin garantías de ningún tipo por parte del autor.
- Ausencia de pipeline declarado: el campo `pipeline` no está definido en HuggingFace, por lo que no se integra automáticamente con las utilidades estándar de la librería `transformers`.
- Singularidad del repositorio: no hay métricas de adopción ni issues documentados, lo que reduce la probabilidad de soporte o mantenimiento por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FKTech/lstm-rte-esim

La búsqueda web realizada no devolvió enlaces relevantes al modelo: los resultados obtenidos corresponden a contenido no relacionado con inteligencia artificial y han sido descartados. No se han localizado papers, blogs, repositorios ni demos adicionales asociados a FKTech/lstm-rte-esim.
