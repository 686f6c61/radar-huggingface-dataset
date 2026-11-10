# kabachuha/GLM-5.3-Flash-control-vectors

## Resumen

GLM-5.3-Flash-control-vectors es una colección de vectores de control (control vectors) para el modelo de lenguaje zai-org/GLM-5.3-Flash, publicada por el usuario kabachuha en Hugging Face. No se trata de un modelo de pesos completos, sino de un adaptador que modifica el comportamiento del modelo base mediante la manipulación de activaciones internas (activation steering), sin necesidad de reentrenamiento. Su propósito es permitir un ajuste fino del tono narrativo, el enfoque de los personajes y los elementos estilísticos en tareas de escritura creativa y roleplay.

Los vectores disponibles cubren cinco ejes de personalidad: optimismo frente a nihilismo, compasión frente a sadismo, empatía frente a sociopatía, honestidad frente a maquiavelismo y humildad frente a narcisismo. Cada eje se compone de un vector de "debias" y dos vectores direccionales (positivo y negativo) que se aplican conjuntamente durante la inferencia. El autor advierte que los vectores se generaron a partir de solo 128 tripletas de muestra, frente a las aproximadamente 4000 recomendadas, por lo que presentan ruido y podrían refinarse en el futuro.

El repositorio tiene un tamaño de 0.0 GB y registra 0 descargas y 1 like en el momento de la consulta. Está etiquetado como compatible con endpoints, con licencia CC-BY-4.0 y orientado exclusivamente al idioma inglés. La relevancia actual radica en que ofrece una vía ligera y sin reentrenamiento para controlar el estilo de un modelo grande, aunque su madurez y soporte son limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de control (activation steering) sobre el modelo base zai-org/GLM-5.3-Flash; no es un modelo transformer completo |
| Parametros totales | 180.224 (según safetensors del repositorio; corresponde a los vectores, no al modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (los vectores se distribuyen en formato GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (vectores); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

Los control vectors son direcciones en el espacio de activaciones de un modelo de lenguaje que, al sumarse o restarse durante la inferencia, desplazan el comportamiento del modelo hacia un polo semántico concreto. En este caso, cada eje de personalidad se construye a partir de pares de tripletas de texto que ejemplifican los dos extremos del rasgo (por ejemplo, optimismo frente a nihilismo). El autor generó cada par de vectores a partir de 128 tripletas de muestra, muy por debajo de las ~4000 recomendadas, lo que introduce ruido en las direcciones resultantes. La creación de cada par de vectores requiere aproximadamente 2 horas en el equipo del autor.

La aplicación práctica requiere un vector de "debias" junto con el vector positivo o negativo del eje correspondiente; ambos deben aplicarse simultáneamente, ya que los vectores están calibrados contra el modelo debiased y no funcionan por separado. Si se aplican ambos polos del mismo eje a la vez, se anulan mutuamente. El autor probó los vectores en su fork personal de Project Maya (basado en llama.cpp), por lo que su compatibilidad con llama.cpp estándar u otros derivados no está garantizada. No se dispone de información sobre el proceso de entrenamiento del modelo base GLM-5.3-Flash ni sobre el volumen de datos utilizado para generar los vectores.

## Capacidades

- Ajuste del tono narrativo en textos de ficción y escritura creativa mediante la modulación de rasgos de personalidad.
- Control del enfoque de personajes y de elementos estilísticos en narrativa y roleplay.
- Aplicación de conceptos de los vectores en dominios cruzados, como la generación de SVG o temas de interfaz (el autor muestra ejemplos de generación de SVGs con sesgo nihilista u optimista).
- Modulación de cinco ejes de personalidad: optimismo/nihilismo, compasión/sadismo, empatía/sociopatía, honestidad/maquiavelismo y humildad/narcisismo.
- Compatibilidad con el modelo base GLM-5.3-Flash a través de un fork específico de Project Maya; no se documenta soporte de tool calling, agentes ni razonamiento multi-paso, ya que estas capacidades dependerían del modelo base.
- Soporte multilingüe limitado al inglés según la model card.

## Casos de uso

- Escritura creativa con tono controlado: un autor puede aplicar el vector de optimismo o nihilismo para ajustar el registro emocional de un relato sin reentrenar el modelo, útil en la generación de borradores con atmósferas diferenciadas.
- Roleplay y personajes con personalidad definida: en entornos de ficción interactiva, los vectores de empatía o narcisismo permiten que un personaje mantenga un rasgo coherente a lo largo de la conversación, siempre que se aplique el vector de debias correspondiente.
- Generación de arte procedural y SVG: el autor documenta que los conceptos de los vectores se transfieren a la generación de SVGs (por ejemplo, un gato con sesgo optimista frente a uno nihilista), lo que permite explorar variaciones estilísticas en herramientas de diseño generativo.
- Prototipado de narrativas ramificadas: un equipo de guion puede generar múltiples versiones de una misma escena con distintos sesgos de personalidad para comparar y seleccionar el tono adecuado antes de producir el texto final.
- Investigación en interpretabilidad y steering: los vectores sirven como material de estudio para analizar cómo direcciones de activación concretas afectan a la salida de un modelo grande, aunque su ruido por el bajo número de tripletas debe tenerse en cuenta.
- Ajuste de asistentes conversacionales con tono específico: en un chatbot de acompañamiento o entretenimiento, el vector de compasión o humildad puede suavizar respuestas en un fork de Project Maya, siempre que se asuma la falta de garantías de compatibilidad con llama.cpp estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los vectores en sí; dependera del modelo base GLM-5.3-Flash y de su cuantizacion (el autor menciona un archivo GGUF del modelo base con cuantizacion IQ3_S en cuatro partes, lo que sugiere un modelo de gran tamano).
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no disponible; el autor ejecuta el modelo base en un fork de Project Maya con cuantizacion IQ3_S, lo que indica que se necesita una GPU con VRAM suficiente para ese formato, pero no se especifica el modelo concreto.
- Opciones de despliegue: fork personal de Project Maya (https://github.com/kabachuha/project-maya/tree/cvector-creator); compatibilidad con llama.cpp estandar no garantizada. No se documenta soporte para vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kabachuha/GLM-5.3-Flash-control-vectors | Vectores de control sobre GLM-5.3-Flash | 180.224 (vectores) | No disponible | CC-BY-4.0 | Hugging Face, 0 descargas, 1 like |
| zai-org/GLM-5.3-Flash | Modelo base de lenguaje | No disponible | No disponible | No disponible | Hugging Face (referenciado como base) |
| Otros conjuntos de control vectors para modelos abiertos | Vectores de control | No disponible | No disponible | Variable | No disponible |

No se dispone de datos de rendimiento comparativo entre estos vectores y alternativas similares, ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- Los vectores se generaron con solo 128 tripletas de muestra frente a las ~4000 recomendadas, por lo que son ruidosos y pueden producir efectos inconsistentes.
- El vector de debias debe aplicarse obligatoriamente junto con el vector positivo o negativo del eje; no funcionan de forma aislada.
- Si se aplican ambos polos del mismo eje simultáneamente, se anulan entre sí.
- Solo se han publicado los vectores de personalidad; las alteraciones de estilo y longitud no están disponibles en esta versión.
- La compatibilidad con llama.cpp estándar y sus derivados no está garantizada; el autor solo los ha probado en su fork personal de Project Maya.
- El soporte de idiomas se limita al inglés según la model card.
- Riesgo de alucinación y sesgos: no documentado específicamente para estos vectores, pero heredado del modelo base GLM-5.3-Flash, del que no se proporcionan detalles.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo base puede tener sus propias restricciones que no se detallan en esta ficha.
- El repositorio tiene 0 descargas y 1 like, lo que indica una adopción muy baja y ausencia de validación comunitaria.
- El autor advierte que la creación de cada par de vectores requiere aproximadamente 2 horas en su equipo, lo que limita la frecuencia de actualizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kabachuha/GLM-5.3-Flash-control-vectors
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Fork de Project Maya utilizado por el autor: https://github.com/kabachuha/project-maya/tree/cvector-creator
- Project Maya original (mw00): no se proporciona URL directa en la informacion disponible.
