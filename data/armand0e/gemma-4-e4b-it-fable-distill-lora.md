# armand0e/Gemma-4-E4B-it-Fable-Distill-LoRA

## Resumen

El modelo `armand0e/Gemma-4-E4B-it-Fable-Distill-LoRA` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `unsloth/gemma-4-E4B-it`, que a su vez es una versión afinada de Gemma 4 E4B de Google. Desarrollado por el usuario armand0e, este LoRA se presenta como una destilación de "fábulas" (Fable Distill), lo que sugiere un ajuste orientado a la generación de narraciones o contenido de estilo fabulístico, aunque no se proporcionan detalles adicionales sobre el conjunto de datos ni el proceso de entrenamiento.

El modelo base, Gemma 4 E4B, es un modelo de 4.4 mil millones de parámetros con una ventana de contexto de hasta 256K tokens, soporte multimodal (texto e imagen) y un modo de razonamiento (Thinking Mode). Está diseñado para ejecutarse en GPUs de consumo con al menos 8 GB de VRAM, y se ofrece bajo licencia Apache 2.0. Este LoRA, al ser un adaptador ligero (0.3 GB), hereda las capacidades del modelo base y las adapta a la tarea específica de la destilación de fábulas.

La relevancia de este modelo radica en que permite especializar un modelo eficiente y de alto rendimiento sin necesidad de reentrenar toda la arquitectura, lo que reduce costes computacionales y facilita la personalización para tareas concretas de generación de texto narrativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base: Gemma 4 E4B, probablemente Mixture-of-Experts con 4.4B parámetros activos) |
| Parámetros totales | no disponible (el adaptador LoRA ocupa 0.3 GB; el base tiene 4.4B) |
| Parámetros activos | no disponible (depende de la arquitectura del base) |
| Longitud de contexto | hasta 256K tokens (heredado del modelo base) |
| Tipos de cuantización | no disponible (el repositorio no especifica; el base admite cuantizaciones comunes como Q4, Q8, etc.) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: los datos de parámetros y contexto provienen del modelo base `google/gemma-4-E4B`; el adaptador LoRA no modifica estas características.

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre `unsloth/gemma-4-E4B-it`, una variante de Gemma 4 E4B afinada para instrucciones. Gemma 4 E4B es un modelo de lenguaje de gran escala desarrollado por Google, con una arquitectura de tipo transformer y, según la documentación oficial, disponible en variantes densas y Mixture-of-Experts (MoE). Para la variante E4B se estima que es una arquitectura MoE con 4.4 mil millones de parámetros activos, optimizada para eficiencia en entornos de recursos limitados.

El entrenamiento del LoRA se realizó con la librería Unsloth, que acelera el fine-tuning mediante optimizaciones de memoria y cómputo (se indica que el entrenamiento fue 2x más rápido). No se han publicado detalles sobre el conjunto de datos, el número de tokens utilizados o el método de alineación (RLHF, DPO, etc.). El nombre "Fable-Distill" sugiere un proceso de destilación de conocimiento a partir de fábulas, pero no hay evidencia concreta en la documentación.

## Capacidades

- **Generación de texto narrativo**: el modelo hereda del base la capacidad de generar texto coherente y creativo, especialmente orientado a narraciones, cuentos o fábulas.
- **Razonamiento**: soporta razonamiento multi-paso y modo "Thinking" (si el base lo incluye), útil para tareas que requieren lógica.
- **Soporte multimodal**: el modelo base acepta entradas de imagen además de texto, aunque el LoRA no indica si esta capacidad se mantiene intacta.
- **Contexto largo**: con hasta 256K tokens, puede manejar documentos extensos o conversaciones largas.
- **Tool calling**: el base Gemma 4 E4B soporta llamadas a herramientas y funciones, pero no se confirma que el LoRA las preserve.
- **Multilingüismo**: el modelo base soporta más de 140 idiomas, pero la model card del LoRA solo lista "en", por lo que se limita a inglés en esta versión.

## Casos de uso

- **Generación de cuentos y fábulas personalizadas**: el modelo puede crear narraciones originales con estilo literario, adecuado para aplicaciones educativas o de entretenimiento infantil.
- **Asistente de escritura creativa**: para autores que necesitan ideas, giros argumentales o descripciones, el modelo puede generar borradores que luego se refinan.
- **Chatbot de narración interactiva**: con su ventana de contexto de 256K, puede mantener conversaciones largas y coherentes, ideal para juegos de rol o experiencias narrativas.
- **Aplicación de tutoría en idiomas**: aunque el LoRA solo está en inglés, puede servir para practicar comprensión lectora y redacción de fábulas en entornos de aprendizaje.
- **Generación de contenido para redes sociales**: el modelo puede producir historias breves o anécdotas con tono narrativo, útil para blogs o publicaciones.
- **Prototipado rápido de sistemas de generación de texto**: gracias a su pequeño tamaño de adaptador y su base eficiente, puede integrarse en pipelines de desarrollo para probar ideas de generación de historias sin grandes costes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas para este modelo concreto. El modelo base Gemma 4 E4B tiene resultados publicados por Google, pero no se dispone de ellos en el contexto de esta ficha.

## Requisitos de hardware

- **VRAM estimada**: el modelo base Gemma 4 E4B requiere un mínimo de 8 GB de VRAM para inferencia en cuantización FP16. Con cuantizaciones más agresivas (por ejemplo, 4-bit), podría ejecutarse en GPUs con 4-6 GB.
- **GPU recomendadas**: RTX 3060 (12 GB), RTX 4070, RTX 4080, RTX 4090, así como GPUs de datacenter como A100 o H100 para mayor throughput.
- **Compatibilidad con GPUs de consumo**: sí, cabe en GPUs de gama media y alta (RTX 3060 en adelante). Con cuantización 8-bit o 4-bit, puede funcionar en tarjetas con 6 GB.
- **Opciones de despliegue**: el repositorio está etiquetado para `text-generation-inference` (TGI), por lo que puede servirse con la stack de Hugging Face. También es compatible con `transformers` y `safetensors`. Se puede usar con vLLM, llama.cpp (si se convierte a GGUF) o Ollama.
- **Latencia y throughput**: no se dispone de datos específicos para este LoRA. En general, un modelo de 4.4B activos puede generar aproximadamente 30-50 tokens/s en una RTX 4090 con cuantización 4-bit, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|--------|------------|----------|----------|----------------|
| Gemma 4 E4B (base) | 4.4B | 256K | Apache 2.0 | HuggingFace |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 license | HuggingFace |
| Qwen 2.5 3B | 3B | 32K | Apache 2.0 | HuggingFace |
| Gemma 4 E4B LoRA (este) | 4.4B + LoRA | 256K | Apache 2.0 | HuggingFace |

Comparado con alternativas de tamaño similar, este modelo ofrece una ventana de contexto mucho mayor (256K frente a 128K o 32K) y una licencia permisiva. Sin embargo, no se dispone de datos de rendimiento para comparar de forma objetiva. La ventaja principal es su eficiencia en hardware de consumo y su naturaleza de adaptador ligero.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo base puede heredar sesgos de los datos de entrenamiento de Gemma 4, aunque no se ha documentado una evaluación específica para este LoRA.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o inconsistente, especialmente en tareas de razonamiento.
- **Limitaciones de idioma**: la model card solo indica inglés, por lo que su uso en otros idiomas puede degradar la calidad.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no se proporciona garantía.
- **Caveat de producción**: al ser un LoRA no documentado, no hay evidencia de pruebas de robustez o seguridad. Se recomienda una evaluación exhaustiva antes de usarlo en entornos de producción.
- **Dependencia del modelo base**: el adaptador requiere el modelo base `unsloth/gemma-4-E4B-it` para funcionar; no es un modelo autónomo.

## Enlaces

- [Hugging Face - armand0e/Gemma-4-E4B-it-Fable-Distill-LoRA](https://huggingface.co/armand0e/Gemma-4-E4B-it-Fable-Distill-LoRA)
- [Google Gemma 4 E4B (modelo base)](https://huggingface.co/google/gemma-4-E4B)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
- [Documentación oficial de Gemma 4](https://ai.google.dev/gemma/docs/core/model_card_4)
