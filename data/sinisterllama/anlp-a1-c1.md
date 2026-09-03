# SinisterLlama/anlp-a1-c1

## Resumen

El modelo `SinisterLlama/anlp-a1-c1` es un transformer seq2seq estándar de tipo encoder-decoder, desarrollado por Eshaan Sharma (SinisterLlama) como parte de la asignatura ANLP (Advanced Natural Language Processing) en el IIIT Hyderabad. Su propósito específico es el descifrado de texto cifrado (_ciphertext decryption_), una tarea de transformación de secuencias que recibe un texto cifrado como entrada y produce el texto plano correspondiente como salida.

Con solo 11,67 millones de parámetros, se trata de un modelo muy compacto, diseñado para demostrar los fundamentos de la arquitectura transformer en un contexto académico. Utiliza normalización posterior a la capa (Post-LayerNorm), codificación posicional sinusoidal y atención multi-cabeza (MHA). Aunque no es un modelo de propósito general, su publicación en Hugging Face bajo licencia MIT lo hace accesible para experimentación y aprendizaje.

La relevancia de este modelo radica en su valor didáctico: representa una implementación limpia y reproducible de un transformer clásico aplicado a una tarea de criptoanálisis neuronal. No compite con los grandes modelos de lenguaje actuales, pero ofrece un punto de partida útil para quienes estudian arquitecturas seq2seq o desean explorar aplicaciones de PLN en criptografía.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Post-LN, PE sinusoidal, MHA) |
| Parametros totales | 11,67 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (presumiblemente PyTorch, librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer seq2seq estándar, tal como se describe en el artículo original "Attention Is All You Need". Emplea una pila de bloques encoder y decoder con normalización posterior a cada subcapa (Post-LayerNorm), codificación posicional sinusoidal y atención multi-cabeza (MHA). No se especifican innovaciones técnicas particulares; se trata de una implementación canónica.

En cuanto al entrenamiento, la model card no proporciona información sobre el conjunto de datos, el número de tokens, el proceso de optimización ni si se aplicaron técnicas como RLHF o DPO. Dado que es una tarea académica, es probable que se haya entrenado con un corpus específico de pares cifrado-plano, pero estos detalles no están documentados en la información disponible. El modelo fue creado el 3 de septiembre de 2026 y actualizado al día siguiente, lo que sugiere un ciclo de desarrollo corto.

## Capacidades

- Descifrado de texto cifrado: transforma secuencias de entrada cifradas en texto plano, como indica su etiqueta `ciphertext-decryption`.
- Procesamiento de secuencias de longitud variable gracias a la arquitectura seq2seq.
- Generación de texto en inglés, ya que el idioma declarado es `en`.
- Operación como modelo autónomo con la librería transformers de Hugging Face, compatible con los pipelines estándar de la biblioteca.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se menciona soporte multilingüe más allá del inglés.

## Casos de uso

- Entorno educativo: sirve como ejemplo práctico para enseñar el funcionamiento interno de un transformer seq2seq, incluyendo atención, codificación posicional y normalización.
- Investigación en criptoanálisis neuronal: permite experimentar con el descifrado automático de cifrados clásicos (sustitución, transposición) en un contexto de laboratorio.
- Pruebas de concepto para sistemas de descifrado automático: su pequeño tamaño facilita la iteración rápida y la integración en prototipos de herramientas de análisis de criptogramas.
- Benchmark de arquitecturas: puede utilizarse como referencia para comparar variantes de transformers (por ejemplo, Pre-LN vs. Post-LN) en tareas de transformación de secuencias.
- Estudio de la influencia del tamaño del modelo: al tener solo 11,67 M de parámetros, permite analizar cómo afecta la capacidad del modelo a la precisión en tareas de descifrado.
- Reutilización como componente de preprocesamiento: aunque no está diseñado para ello, podría adaptarse para tareas de normalización o transformación de texto en inglés, siempre que se ajuste a su dominio de entrada.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación sobre la tarea de descifrado de texto cifrado:

| Metrica | Valor |
|---|---|
| Exactitud a nivel de bit | 93,60 % |
| Exactitud a nivel de secuencia | 68,07 % |
| BLEU | 98,84 % |
| ROUGE-1 | 99,38 % |
| ROUGE-2 | 98,15 % |
| ROUGE-L | 99,38 % |
| Distancia de Levenshtein media | 0,41 |

Estos valores indican que el modelo es capaz de descifrar la mayoría de los caracteres correctamente, aunque la exactitud a nivel de secuencia completa es notablemente menor (68,07 %), lo que sugiere que falla en algunas secuencias completas. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tener 11,67 M de parámetros, el modelo ocupa aproximadamente 47 MB en FP32 (4 bytes por parámetro). Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU sin problemas para inferencia.
- Compatibilidad con consumer GPU: sí, sin ninguna restricción.
- Opciones de despliegue: al ser un modelo de la librería transformers, puede cargarse con `AutoModelForSeq2SeqLM` y ejecutarse en frameworks como PyTorch. No se mencionan herramientas específicas como vLLM, llama.cpp u Ollama, pero dado su tamaño, cualquiera de ellas podría soportarlo.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la inferencia debería ser prácticamente instantánea para secuencias cortas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. Existen otros repositorios en Hugging Face con nombres similares (por ejemplo, `ZappY-AI/anlp-a1` y `neemon/anlp-a1-c1`), pero sus características no están documentadas en los resultados de búsqueda. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo académico: no ha sido diseñado ni validado para uso en producción; su rendimiento en escenarios reales de descifrado es desconocido.
- Sesgos: no se ha evaluado la presencia de sesgos, y al estar entrenado solo en inglés, puede no generalizar a otros idiomas.
- Alucinación: como todo modelo generativo, puede producir salidas incorrectas o inventar texto cuando el cifrado es ambiguo o fuera de su distribución de entrenamiento.
- Exactitud limitada: la exactitud a nivel de secuencia es solo del 68,07 %, lo que implica que en aproximadamente un tercio de las secuencias el descifrado completo falla.
- Longitud de contexto desconocida: no se especifica la longitud máxima de las secuencias de entrada, lo que limita su uso en textos largos.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero al no haber documentación sobre los datos de entrenamiento, el usuario debe asumir la responsabilidad sobre su uso.
- Sin soporte para tareas fuera del dominio de descifrado: no es adecuado para generación de texto general, resumen, traducción u otras tareas comunes de PLN.

## Enlaces

- [Hugging Face: SinisterLlama/anlp-a1-c1](https://huggingface.co/SinisterLlama/anlp-a1-c1)
- [GitHub: ANLP-Assignment1](https://github.com/SinisterLlamma/ANLP-Assignment1)
