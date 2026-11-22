# RJCed/MARITES-v1

## Resumen

MARITES-v1 es un ajuste fino (fine-tuning) del modelo Qwen3-14B, desarrollado por el usuario RJCed y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto derivado de la versión cuantizada en 4 bits de Qwen3-14B preparada por Unsloth (`unsloth/Qwen3-14B-unsloth-bnb-4bit`), entrenado con las librerías Unsloth y TRL de Hugging Face. La model card es mínima y no documenta el dataset de ajuste, el propósito específico ni los hiperparámetros empleados.

El modelo hereda la arquitectura y las capacidades del Qwen3-14B original, un transformer denso de 14 mil millones de parámetros con soporte de contexto largo y modo de razonamiento, aunque la información publicada por el autor no confirma qué características del modelo base se preservan tras el ajuste. El repositorio ocupa 0,5 GB, lo que sugiere que los pesos publicados podrían estar en un formato compacto o cuantizado, si bien este dato no se detalla en la documentación.

Su relevancia es limitada en el momento de la publicación: no registra descargas ni interacciones, carece de resultados de benchmarks y no incluye documentación sobre el proceso de entrenamiento. Resulta útil como ejemplo de flujo de trabajo de ajuste fino con Unsloth y TRL sobre Qwen3, pero no constituye una opción recomendable para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B) |
| Parametros totales | 14 000 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no documentada en la model card; el modelo base Qwen3-14B soporta contexto largo, pero el valor exacto no se especifica) |
| Tipos de cuantizacion | No disponible (el modelo base de partida está en 4 bits bnb; los pesos publicados no se detallan) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tag de la librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3-14B, un transformer denso de 14 mil millones de parámetros desarrollado por Alibaba Qwen. El ajuste fino se realizó sobre la variante `unsloth/Qwen3-14B-unsloth-bnb-4bit`, una versión del modelo base cuantizada en 4 bits con bitsandbytes y optimizada para entrenamiento eficiente con Unsloth. Según la model card, el entrenamiento se ejecutó con Unsloth y la librería TRL de Hugging Face, lo que permitió, según el autor, un entrenamiento "2x más rápido".

No se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros como la tasa de aprendizaje, el número de épocas o la estrategia de enmascaramiento. Tampoco se especifica si se aplicaron técnicas como LoRA, QLoRA o ajuste completo, aunque el uso de Unsloth y de un modelo base cuantizado en 4 bits apunta a un enfoque de ajuste eficiente en parámetros. No se declara ninguna innovación técnica adicional más allá de la aceleración del entrenamiento proporcionada por las herramientas empleadas.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3-14B.
- Razonamiento y resolución de problemas de complejidad media, sujeto a la preservación de estas capacidades tras el ajuste (no verificado).
- Generación de código y matemáticas, capacidades propias de la familia Qwen3 (no evaluadas en esta versión).
- Soporte de tool calling y function calling: no documentado en la model card; se desconoce si se preserva tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara únicamente inglés, aunque el modelo base Qwen3 es multilingüe; el ajuste podría haber reducido el soporte a otros idiomas.
- Modo de razonamiento (thinking mode): no documentado en esta versión.

## Casos de uso

- Experimentación con ajuste fino: el modelo sirve como referencia para reproducir un pipeline de entrenamiento con Unsloth y TRL sobre Qwen3-14B, útil para desarrolladores que quieran validar su flujo de trabajo antes de aplicarlo a dominios propios.
- Generación de texto en inglés para prototipos: puede emplearse en entornos de prueba para generar respuestas conversacionales en inglés, siempre que se valide la calidad frente al modelo base.
- Evaluación comparativa de ajustes: útil como punto de partida para medir el impacto de un fine-tuning sobre Qwen3-14B en tareas concretas, comparando sus salidas con las del modelo original.
- Investigación sobre degradación de capacidades: permite estudiar cómo un ajuste fino con dataset no documentado afecta a las capacidades originales del modelo base (código, matemáticas, multilingüismo).
- Base para nuevos ajustes: al estar bajo licencia Apache 2.0, puede servir como punto de partida para ajustes posteriores en dominios específicos, con la cautela de partir de un modelo ya ajustado y cuantizado.
- Docencia y formación: adecuado como ejemplo práctico en cursos sobre fine-tuning eficiente de modelos de lenguaje con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Como referencia orientativa del modelo base Qwen3-14B, la inferencia en FP16 requiere aproximadamente 28 GB de VRAM, en 8 bits unos 14-16 GB y en 4 bits unos 8-10 GB; estas cifras corresponden al modelo base y no han sido verificadas para MARITES-v1.
- GPU recomendadas: no documentadas por el autor. Para el modelo base de 14B se suelen emplear A100, H100 o RTX 4090; no hay confirmación de que MARITES-v1 funcione con estos requisitos.
- Compatibilidad con GPU de consumo: no confirmada. Si los pesos publicados mantienen la cuantización de 4 bits del modelo base, podría caber en GPU con 12-16 GB de VRAM, pero este extremo no está documentado.
- Opciones de despliegue: la model card incluye el tag `text-generation-inference` y la librería `transformers`, lo que sugiere compatibilidad con TGI y con el ecosistema de Hugging Face. No se documenta soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MARITES-v1 | 14B (heredados) | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino sin documentación de dataset ni benchmarks |
| Qwen3-14B (modelo base) | 14B | No disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente utilizado | Modelo original con documentación completa y benchmarks publicados por el desarrollador |
| unsloth/Qwen3-14B-unsloth-bnb-4bit | 14B | No disponible en esta ficha | Apache 2.0 | Hugging Face | Variante cuantizada en 4 bits para entrenamiento eficiente, base de MARITES-v1 |
| Alternativas de 14B open source (p. ej. Mistral o Llama de tamaño similar) | ~13-14B | Variable según modelo | Variable (Apache 2.0 o licencias comunitarias) | Hugging Face | No se dispone de datos comparativos de rendimiento para MARITES-v1 |

No se dispone de datos de rendimiento de MARITES-v1 que permitan una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos, calidad y adecuación a dominios concretos.
- Riesgo elevado de alucinación y de degradación de capacidades respecto al modelo base, al no haberse publicado evaluaciones.
- El ajuste se realizó sobre una versión cuantizada en 4 bits, lo que puede introducir pérdida de precisión adicional respecto al modelo original en FP16.
- Idiomas: la model card declara únicamente inglés; el uso en castellano u otros idiomas no está garantizado y podría producir resultados deficientes.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo, ya que el autor no ofrece garantías ni documentación técnica.
- Sin descargas ni interacciones en Hugging Face: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- No se documenta soporte de tool calling, agentes ni modo de razonamiento; no debe asumirse que estas capacidades del modelo base se conservan.
- El repositorio ocupa 0,5 GB, un tamaño inferior al esperado para pesos completos de un modelo de 14B; conviene verificar el contenido real del repositorio antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RJCed/MARITES-v1
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
