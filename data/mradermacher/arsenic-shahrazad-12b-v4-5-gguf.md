# mradermacher/Arsenic-Shahrazad-12B-v4.5-GGUF

## Resumen

Arsenic-Shahrazad-12B-v4.5-GGUF es una versión cuantizada en formato GGUF del modelo original Arsenic-Shahrazad-12B-v4.5, desarrollado por Lambent y convertido por mradermacher. Se trata de un modelo de 12 mil millones de parámetros orientado a conversación, con un enfoque narrativo y de rol (el nombre sugiere una temática de cuentos y narración). Esta ficha se centra en la variante GGUF, que permite su ejecución en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles.

La relevancia de esta versión radica en que ofrece múltiples cuantizaciones (desde Q2_K hasta F16) que permiten ajustar el equilibrio entre calidad y requisitos de memoria según el hardware disponible. Sin embargo, la información pública sobre el modelo base es muy limitada: no se especifican arquitectura, datos de entrenamiento ni licencia en la ficha de HuggingFace. Los resultados de búsqueda indican que existen versiones anteriores (v4.1, v4.3.1, v4.4.2) y una variante con RLVR, lo que sugiere un desarrollo iterativo, pero no se han publicado detalles técnicos sustanciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 12 mil millones (12B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible (probablemente ingles, sin confirmar) |
| Licencia | no disponible (la version rlvr usa cc-by-nc-4.0, pero no se confirma para esta) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo original Arsenic-Shahrazad-12B-v4.5. Dado el tamaño de 12B, es probable que se trate de un transformer denso similar a otras familias de modelos de esa escala, pero no hay confirmacion. Tampoco se conocen los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. La version GGUF es una conversion de los pesos originales a formato cuantizado, realizada por mradermacher, que no altera la arquitectura subyacente.

La unica informacion tecnica disponible proviene de los comentarios de la model card: se indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere que la conversion se realizo a partir de pesos en formato HuggingFace y que se aplico cuantizacion a los tensores de salida. No se menciona ninguna innovacion arquitectonica especifica.

## Capacidades

- Generacion de texto conversacional y narrativo, probablemente orientado a roleplay y cuentos, segun el nombre del modelo.
- Soporte de tool calling: no confirmado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- La variante GGUF permite ejecucion local en CPU y GPU con motores como llama.cpp, Ollama o LM Studio, lo que facilita su uso en entornos sin acceso a APIs.

## Casos de uso

- Creacion de narrativa interactiva: el modelo puede generar historias y dialogos en juegos de rol o ficcion interactiva, aprovechando su probable especializacion en narracion. Su ejecucion local via GGUF permite integrarlo en aplicaciones de escritorio o web sin depender de servicios externos.
- Asistente de escritura creativa: puede servir como generador de ideas, descripciones o dialogos para escritores, ofreciendo alternativas de estilo y tono. La cuantizacion Q8_0 o F16 ofreceria mayor fidelidad para este uso.
- Chatbots de entretenimiento: ideal para prototipos de personajes conversacionales en plataformas de chat, gracias a su capacidad de mantener conversaciones con un estilo definido. Con cuantizaciones bajas como Q2_K, puede ejecutarse en equipos con poca RAM.
- Experimentacion con cuantizacion: al estar disponible en multiples formatos (Q2_K a F16), permite estudiar el impacto de la cuantizacion en la calidad de salida para un modelo de 12B, util para investigadores que evaluan trade-offs de memoria y rendimiento.
- Desarrollo de aplicaciones offline: al ser un archivo GGUF, se puede embeber en aplicaciones moviles o de escritorio que requieran procesamiento local de lenguaje natural sin conexion, siempre que se respete la licencia (aun no confirmada).
- Evaluacion comparativa de modelos de 12B: puede utilizarse como referencia en pruebas de generacion de texto o razonamiento frente a otros modelos de tamano similar, aunque no hay benchmarks publicados que respalden su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. La ausencia de informacion impide cualquier comparacion cuantitativa con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para un modelo de 12B en FP16 se necesitan aproximadamente 24 GB de VRAM; con Q8_0 unos 12-13 GB; con Q4_K_M unos 7-8 GB; con Q2_K unos 4-5 GB. Estas cifras son estimaciones generales para modelos densos de 12B y pueden variar segun la implementacion.
- GPU recomendadas: para cuantizaciones altas (F16, Q8_0) se requiere una GPU con 16-24 GB (por ejemplo, RTX 4090, A100). Para Q4_K_M o inferiores, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB podrian ser suficientes. Tambien puede ejecutarse solo en CPU con suficiente RAM (16-32 GB).
- Si cabe en consumer GPU: si, con cuantizaciones Q4_K_M o inferiores en GPUs de gama media-alta. Las cuantizaciones Q2_K y Q3_K pueden ejecutarse incluso en GPUs con 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp, text-generation-webui (con backend llama.cpp). Tambien es posible usar bindings de Python como llama-cpp-python.
- Latencia y throughput: no disponibles. Dependen del hardware y la cuantizacion; en una GPU moderna con Q4_K_M se esperan decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo no tiene benchmarks publicados ni especificaciones detalladas de arquitectura. Como referencia generica, otros modelos de 12B como Mistral-7B (7B) o Llama-2-13B (13B) tienen documentacion extensa, pero Arsenic-Shahrazad no puede compararse directamente sin datos. Se recomienda consultar el repositorio original de Lambent para obtener mas detalles, aunque no se ha encontrado en la busqueda.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion publica. Al ser un modelo de rol y narracion, podria reflejar sesgos presentes en sus datos de entrenamiento, pero no se puede confirmar.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin datos de evaluacion, no se puede cuantificar.
- Limitaciones de contexto o idioma: la longitud de contexto no esta especificada. Si el modelo base tiene un contexto corto (por ejemplo, 4K), podria limitar conversaciones largas.
- Restricciones de licencia: la licencia no esta indicada en la ficha. La version rlvr del mismo modelo usa cc-by-nc-4.0, lo que prohibe uso comercial, pero no se confirma que esta version aplique la misma licencia. Es imprescindible verificar la licencia antes de cualquier uso en produccion.
- Caveat para produccion: al ser una cuantizacion no oficial de un modelo de terceros, no hay garantias de calidad ni soporte. La ausencia de documentacion tecnica dificulta la depuracion de problemas.
- Contenido potencialmente inapropiado: el nombre "Shahrazad" y la etiqueta "Not-For-All-Audiences" en la version rlvr sugieren que el modelo puede generar contenido explicito o para adultos, lo que requiere moderacion en aplicaciones publicas.

## Enlaces

- Repositorio de HuggingFace de la version GGUF: https://huggingface.co/mradermacher/Arsenic-Shahrazad-12B-v4.5-GGUF
- Modelo original (Lambent): https://huggingface.co/Lambent/Arsenic-Shahrazad-12B-v4.5 (no verificado en la busqueda)
- Version anterior v4.1: https://huggingface.co/mradermacher/Arsenic-Shahrazad-12B-v4.1-GGUF
- Version rlvr: https://huggingface.co/mradermacher/Arsenic-Shahrazad-12B-rlvr-GGUF
- Version v4.3.1 (via Protect AI): https://protectai.com/insights/models/mradermacher/Arsenic-Shahrazad-12B-v4.3.1-GGUF/f8a0da9378e8d46bb9376d7768fae9c5e11d28f3/versions
