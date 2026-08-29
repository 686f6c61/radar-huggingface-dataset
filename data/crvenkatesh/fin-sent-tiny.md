# crvenkatesh/fin-sent-tiny

## Resumen

`fin-sent-tiny` es un clasificador de sentimiento financiero en miniatura desarrollado por Venkatesh Ramachandran (usuario `crvenkatesh`) como ejercicio de aprendizaje. Clasifica frases breves de estilo noticioso financiero en tres categorías: positivo, neutral y negativo. Con solo 21.203 parámetros, el modelo emplea una arquitectura personalizada compuesta por una capa de embedding, un mean pooling y un pequeño MLP, todo implementado sobre la librería `transformers` de Hugging Face. Está entrenado sobre aproximadamente 90 frases etiquetadas a mano, inspiradas en el conjunto Financial PhraseBank (Malo et al., 2014). Su relevancia no reside en su rendimiento, sino en servir como referencia funcional y didáctica para entender cómo se construye, entrena y guarda un modelo compatible con Hugging Face desde cero, sin necesidad de GPU ni grandes recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Personalizada: embedding + mean pooling + MLP |
| Parametros totales | 21.203 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (el texto de entrenamiento está en inglés financiero, pero no se declara oficialmente) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no utiliza una arquitectura transformer estándar, sino una red neuronal simple definida a medida: una capa de embedding que convierte los tokens en vectores, seguida de un mean pooling que promedia las representaciones de la secuencia, y finalmente un pequeño MLP que produce logits para las tres clases. Esta arquitectura se integra con la API de `transformers` mediante un `PretrainedConfig` y un `PreTrainedModel` personalizados, lo que permite cargar y guardar el modelo con los métodos estándar de Hugging Face. El entrenamiento se realizó sobre un conjunto de unas 90 frases escritas a mano, con distribución equilibrada entre las tres etiquetas, y no se aplicaron técnicas como RLHF o DPO. La innovación principal es demostrar que es posible crear un modelo compatible con el ecosistema Hugging Face con una arquitectura no estándar y un pipeline completo que funciona en segundos en CPU.

## Capacidades

- Clasificación de sentimiento en texto financiero corto: asigna una etiqueta positiva, neutral o negativa a frases de una o dos oraciones.
- Procesamiento de secuencias de longitud variable (aunque la longitud máxima no está documentada, por diseño práctico se limita a frases cortas).
- Inferencia rápida y ligera: al tener solo 21.203 parámetros, el modelo puede ejecutarse en CPU con latencia de milisegundos.
- Integración con `transformers`: permite usar `PreTrainedTokenizerFast` y el modelo personalizado mediante `from_pretrained`.
- No dispone de generación de texto, tool calling, capacidades de agente, visión, audio ni soporte multilingüe.

## Casos de uso

- Ejemplo didáctico para aprender a construir modelos personalizados en Hugging Face: el repositorio incluye el archivo `modeling.py` con la definición completa, lo que permite estudiar cómo se integra una arquitectura propia con `PretrainedConfig` y `PreTrainedModel`.
- Prototipado rápido de un pipeline de clasificación de texto: se puede cargar el modelo y el tokenizador en pocas líneas de código para probar la infraestructura de inferencia sin necesidad de entrenar un modelo grande.
- Pruebas de concepto en entornos sin GPU: al ser tan pequeño, funciona en cualquier máquina con Python, lo que facilita validar flujos de trabajo en CI/CD o en entornos embebidos.
- Enseñanza de fundamentos de NLP: sirve como ejemplo tangible de cómo se entrena un clasificador desde cero, incluyendo el entrenamiento del tokenizador, el bucle de entrenamiento y la evaluación.
- Verificación de compatibilidad con el ecosistema Hugging Face: puede usarse para probar la carga de modelos personalizados en plataformas como Inference Endpoints o en pipelines de `transformers`.
- Benchmark de referencia para comparar con modelos más grandes: su bajo rendimiento (precisión ~61% en un conjunto de test de 18 ejemplos) permite ilustrar la diferencia entre un modelo de juguete y uno real, y sirve como punto de partida para discutir mejoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La única métrica reportada en la model card es una precisión del 61% sobre un conjunto de test de 18 ejemplos, frente a una línea base aleatoria del 33%. Este dato, aunque no proviene de un benchmark formal, indica que el modelo ha aprendido algo más que el azar, pero está lejos de ser fiable para uso real.

## Requisitos de hardware

- VRAM estimada: menos de 1 MB (los pesos ocupan unos 85 KB en formato de 32 bits, o menos en float16).
- GPU recomendada: ninguna; el modelo se ejecuta cómodamente en CPU.
- Compatible con cualquier GPU consumer (RTX 3060, 4090, etc.) si se desea acelerar, pero no es necesario.
- Opciones de despliegue: puede usarse con la librería `transformers` directamente, o empaquetarse en servicios como Hugging Face Inference Endpoints (el tag `endpoints_compatible` sugiere compatibilidad). También puede convertirse a ONNX o TorchScript si se requiere, aunque no está documentado.
- Latencia estimada: del orden de microsegundos a milisegundos por inferencia en CPU moderna, dependiendo de la longitud del texto.

## Comparativa con modelos similares

No disponible. No se conocen modelos de la misma categoría (clasificación de sentimiento financiero con ~21k parámetros) con los que comparar. Modelos como FinBERT (110 millones de parámetros) o los basados en BERT son órdenes de magnitud más grandes y se entrenan con conjuntos de datos extensos, por lo que no son comparables directamente. La ausencia de benchmarks y la naturaleza didáctica del modelo impiden establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Entrenado con solo ~90 frases etiquetadas a mano, lo que limita enormemente su generalización a texto financiero real.
- Precisión baja (61% en test), muy por debajo de lo necesario para uso en producción.
- No es adecuado para textos largos o con matices complejos; falla en oraciones ambiguas o con doble sentido.
- Posibles sesgos derivados de la selección manual de frases de entrenamiento, que no representan la diversidad del lenguaje financiero real.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- No se documentan idiomas soportados; aunque el entrenamiento es en inglés financiero, no hay garantía de funcionamiento en otros idiomas.
- Al ser una arquitectura personalizada, no se puede cargar con `AutoModel` directamente; se necesita el archivo `modeling.py` del repositorio, lo que limita su portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crvenkatesh/fin-sent-tiny
- Perfil del autor: https://huggingface.co/crvenkatesh/models
