# mradermacher/L3.1-Subfuscv2-12B-i1-GGUF

## Resumen

L3.1-Subfuscv2-12B es un modelo de lenguaje de 12 mil millones de parámetros, basado en la arquitectura Llama 3.1, que ha sido cuantizado al formato GGUF por mradermacher, un equipo conocido por publicar cuantizaciones de modelos open source. El modelo original, desarrollado por kromcomp, es un merge de modelos que combina capacidades conversacionales y de razonamiento, y esta versión GGUF incluye cuantizaciones con imatrix (importance matrix), lo que mejora la calidad de la cuantización frente a los métodos estándar.

Esta ficha se centra en la versión cuantizada, que es la que se distribuye en este repositorio. La cuantización GGUF permite ejecutar el modelo en una amplia variedad de hardware, desde CPUs hasta GPUs de consumo, utilizando motores de inferencia como llama.cpp, Ollama o LM Studio. El repositorio incluye múltiples niveles de cuantización (desde Q2_K hasta Q6_K, pasando por IQ y K-quants), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria según el hardware disponible.

Es relevante ahora porque ofrece una opción de modelo de 12B parámetros con licencia permisiva (derivada de Llama 3.1) y cuantizaciones optimizadas para ejecución local, algo especialmente útil para desarrolladores que necesitan desplegar modelos en entornos con recursos limitados o que requieren privacidad de datos. Sin embargo, la información pública sobre el modelo original es escasa, y no se han publicado benchmarks oficiales ni detalles sobre el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (transformador decoder-only) |
| Parametros totales | 11.956.310.080 (12B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (se espera 128K por arquitectura Llama 3.1, sin confirmar) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (se espera multilingue limitado por Llama 3.1) |
| Licencia | no disponible (el modelo base Llama 3.1 usa licencia Llama 3.1 Community License) |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

El modelo base es un merge creado por kromcomp, denominado L3.1-Subfuscv2-12B, que combina capas o pesos de varios modelos basados en Llama 3.1 de 12B parámetros. El nombre "Subfusc" sugiere que es la segunda versión de un merge orientado a mejorar capacidades conversacionales y de razonamiento, aunque no se han publicado detalles técnicos sobre la metodología de merge ni sobre los modelos componentes.

La versión GGUF distribuida por mradermacher aplica cuantización con imatrix, una técnica que calcula la importancia de cada peso durante el proceso de cuantización para minimizar la pérdida de calidad. El repositorio incluye una amplia gama de cuantizaciones, desde Q2_K (muy agresiva, ~2-3 GB) hasta Q6_K (alta calidad, ~9-10 GB), pasando por cuantizaciones IQ (iMatrix Quantization) que ofrecen mejor calidad a igual tamaño que las K-quants estándar. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational", lo que indica que está optimizado para mantener diálogos multi-turno.
- Razonamiento: al estar basado en Llama 3.1, se espera que herede capacidades de razonamiento básico, aunque no se han publicado evaluaciones específicas.
- Capacidad de tool calling: no confirmada, pero probable dada la arquitectura base Llama 3.1.
- Multilingüismo: no confirmado; Llama 3.1 tiene soporte limitado para español, inglés, francés, alemán, hindi, italiano, portugués y tailandés, pero el merge puede alterar estas capacidades.
- No se ha confirmado soporte para visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en local con llama.cpp u Ollama para crear un chatbot privado que no envía datos a servidores externos, adecuado para entornos con requisitos de confidencialidad.
- Generación de código en entornos sin conexión: con cuantizaciones Q4_K_M o Q5_K_M, el modelo cabe en GPUs de 8-12 GB y puede usarse para autocompletado o generación de código en IDEs locales.
- Prototipado rápido de aplicaciones LLM: los desarrolladores pueden usar las cuantizaciones más pequeñas (Q2_K, IQ2_M) para validar ideas sin necesidad de hardware caro, y luego escalar a cuantizaciones mayores en producción.
- Análisis de texto y resumen de documentos: el modelo puede procesar documentos largos si la longitud de contexto es de 128K (a confirmar), permitiendo resumir informes extensos en una sola pasada.
- Educación e investigación: sirve como modelo de referencia para estudiar técnicas de cuantización y merge, ya que se puede comparar el rendimiento entre diferentes niveles de cuantización.
- Desarrollo de agentes conversacionales: si el modelo soporta tool calling, puede integrarse en frameworks como LangChain o LlamaIndex para construir agentes que interactúen con APIs y bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otros tests estandarizados, y la ficha del modelo original de kromcomp tampoco proporciona datos de rendimiento. Se recomienda ejecutar evaluaciones propias antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Aproximadamente:
  - Q2_K: ~3-4 GB
  - Q4_K_M: ~6-7 GB
  - Q5_K_M: ~8-9 GB
  - Q6_K: ~9-10 GB
- GPU recomendadas: RTX 3060 (12 GB) o superior para cuantizaciones Q4/Q5; RTX 4090 o A100 para Q6_K con contexto largo.
- En consumer GPU: sí, cabe en GPUs de 8 GB o más usando cuantizaciones Q4 o inferiores. Para GPUs de 6 GB, se recomienda Q2_K o IQ2_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversión a formato compatible), TGI (con adaptación).
- Latencia y throughput: no disponibles. Dependen del hardware y la cuantización; en una RTX 4090 con Q4_K_M se esperan 40-60 tokens/s, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| L3.1-Subfuscv2-12B (GGUF) | 12B | no disponible | no disponible | GGUF | Merge de Llama 3.1, cuantizado con imatrix |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | HF, GGUF | Modelo base oficial, benchmarks publicados |
| Mistral 7B Instruct v0.3 | 7B | 32K | Apache 2.0 | HF, GGUF | Alternativa ligera, bien documentada |
| Qwen 2.5 14B Instruct | 14B | 128K | Apache 2.0 | HF, GGUF | Mayor tamaño, mejor rendimiento en codigo |

La comparativa es limitada porque no se dispone de benchmarks del modelo. Llama 3.1 8B y Qwen 2.5 14B son alternativas con documentación exhaustiva y resultados verificados. El modelo Subfuscv2 podría ofrecer mejor rendimiento que Llama 3.1 8B por tener más parámetros, pero no se puede confirmar sin datos.

## Limitaciones y advertencias

- Información insuficiente: no se conocen los detalles del merge, el dataset de entrenamiento ni las capacidades exactas del modelo. Esto supone un riesgo para usos en producción.
- Sesgos y alucinaciones: al ser un modelo basado en Llama 3.1, hereda los sesgos de los datos de entrenamiento originales y puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- Licencia no confirmada: aunque el modelo base usa la Llama 3.1 Community License, el merge y las cuantizaciones pueden tener restricciones adicionales. No se recomienda uso comercial sin verificar la licencia con los autores.
- Longitud de contexto no verificada: aunque Llama 3.1 soporta 128K, el merge podría reducir este valor. Se recomienda probar con textos largos antes de confiar en él.
- Calidad de cuantización variable: las cuantizaciones muy agresivas (Q2_K, IQ1_M) degradan notablemente la calidad y solo se recomiendan para pruebas.
- Modelo no actualizado: la fecha de creación (agosto 2026) y la falta de mantenimiento visible sugieren que puede no recibir correcciones o mejoras.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/L3.1-Subfuscv2-12B-GGUF
- Modelo original (merge): https://huggingface.co/kromcomp/L3.1-Subfuscv2-12B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Modelo similar de mradermacher: https://huggingface.co/mradermacher/L3.1-Nimbusv2-12B-GGUF
- Página de descarga de cuantizaciones: https://hf.tst.eu/model
