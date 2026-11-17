# mradermacher/Microtron-4B-GGUF

## Resumen

Microtron-4B-GGUF es la versión cuantizada en formato GGUF del modelo bunnycore/Microtron-4B, publicada por mradermacher el 7 de marzo de 2025. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF de un merge de modelos (fusión) generado con mergekit y lazymergekit, según indican las etiquetas de la model card. El modelo resultante cuenta con 4.512.746.560 parámetros totales (aproximadamente 4,5 mil millones) y está orientado exclusivamente al inglés.

La relevancia de esta ficha radica en que ofrece el modelo en una amplia gama de cuantizaciones estáticas (desde Q2_K hasta f16), lo que permite ejecutarlo en hardware de consumo con requisitos de VRAM muy dispares. El repositorio original (bunnycore/Microtron-4B) no proporciona en la información disponible detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks, por lo que gran parte de las especificaciones técnicas deben marcarse como no disponibles.

La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en productos derivados, siempre que se respeten las condiciones de atribución de dicha licencia. La librería declarada es transformers y las etiquetas incluyen "endpoints_compatible", lo que sugiere compatibilidad con despliegues tipo Hugging Face Inference Endpoints.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base generado mediante merge con mergekit/lazymergekit; arquitectura interna no especificada en la información disponible) |
| Parámetros totales | 4.512.746.560 (≈4,5 mil millones) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original está en formato transformers/safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base bunnycore/Microtron-4B. Las etiquetas del repositorio indican que se trata de un merge de modelos generado con mergekit y lazymergekit, una técnica que combina los pesos de varios modelos preentrenados para producir un modelo fusionado sin un entrenamiento adicional desde cero. No se especifica qué modelos se fusionaron, qué método de merge se empleó (SLERP, TIES, DARE, etc.) ni la composición del dataset de entrenamiento original.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la presencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio cuantizado se limita a describir el proceso de conversión a GGUF y a listar los ficheros disponibles; no incluye información sobre el entrenamiento del modelo subyacente. El proceso de cuantización realizado por mradermacher es estático (quantize_version: 2, output_tensor_quantised: 1), con conversión desde el formato Hugging Face original.

## Capacidades

- Generación de texto en inglés: el modelo está etiquetado exclusivamente para el idioma inglés, por lo que su uso en otros idiomas no está garantizado.
- Razonamiento y generación de contenido general: al ser un modelo de 4,5 mil millones de parámetros, se espera capacidad para tareas de lenguaje general, aunque no hay benchmarks que lo confirmen en la información disponible.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede desplegarse en infraestructuras de inferencia gestionadas compatibles con Hugging Face.
- Uso como modelo base para fine-tuning: al estar bajo licencia Apache 2.0 y en formato GGUF, puede servir como punto de partida para ajustes posteriores, aunque el formato GGUF no es el ideal para fine-tuning (sería preferible el modelo original en safetensors).
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Experimentación local en hardware de consumo: gracias a las cuantizaciones Q4_K_S y Q4_K_M (2,8 y 2,9 GB respectivamente), el modelo puede ejecutarse en GPUs con 4-6 GB de VRAM, lo que lo hace adecuado para pruebas y prototipado en equipos personales.
- Generación de texto en inglés para aplicaciones de bajo coste: con la cuantización Q4_K_M se obtiene un equilibrio entre calidad y velocidad, adecuado para tareas de generación de contenido, resúmenes o respuestas en inglés en entornos con recursos limitados.
- Despliegue en entornos edge o embebidos: la cuantización Q2_K (1,9 GB) permite ejecutar el modelo en dispositivos con memoria muy restringida, aunque con la pérdida de calidad asociada a las cuantizaciones de 2 bits.
- Base para experimentos de fusión de modelos: al ser un merge documentado con mergekit, puede utilizarse como referencia para estudiar el comportamiento de modelos fusionados y comparar su rendimiento con los modelos originales que lo componen.
- Prototipado de asistentes conversacionales en inglés: el modelo puede integrarse en pipelines de generación de texto con llama.cpp u Ollama para crear asistentes simples en inglés, siempre que se validen previamente sus capacidades reales mediante pruebas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite realizar estudios comparativos de calidad frente a tamaño para un mismo modelo, útil en investigación sobre técnicas de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~1,9 GB de pesos; con overhead de contexto, aproximadamente 2,5-3 GB de VRAM.
  - Q4_K_M: ~2,9 GB de pesos; aproximadamente 3,5-4,5 GB de VRAM en uso real.
  - Q8_0: ~4,9 GB de pesos; aproximadamente 5,5-6,5 GB de VRAM.
  - f16: ~9,1 GB de pesos; aproximadamente 10-11 GB de VRAM.
- GPU recomendadas: para Q4_K_M, una RTX 3060 (12 GB) o RTX 4060 (8 GB) es suficiente; para f16, se recomienda una RTX 4070 Ti o superior (12 GB o más). En entornos de servidor, una A100 o H100 no son necesarias para este tamaño, pero pueden usarse para despliegues de alta concurrencia.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q5_K_M caben en GPUs con 4-8 GB de VRAM; Q6_K y Q8_0 requieren 6-8 GB; f16 requiere al menos 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui, LM Studio). Para el modelo original en safetensors, vLLM o TGI si la arquitectura es compatible (no confirmado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa no verificada, un modelo de 4,5 mil millones de parámetros en Q4_K_M en una RTX 3060 podría generar del orden de decenas de tokens por segundo, pero este dato no está confirmado por el autor.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (arquitectura, contexto, benchmarks) para establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica "no disponible" para los campos que requerirían datos no presentes en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Microtron-4B-GGUF | ~4,5 B | no disponible | Apache 2.0 | GGUF | Merge con mergekit; solo inglés |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables |

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos conocidos: no se dispone de información sobre sesgos específicos; al ser un merge de modelos no documentado, los sesgos heredados de los modelos originales son desconocidos.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo de este tamaño, existe riesgo de generar información falsa o inventada, especialmente en tareas factuales.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de licencia y se atribuya adecuadamente. No obstante, al ser un merge, conviene verificar las licencias de los modelos originales fusionados (no disponibles en la información proporcionada).
- Caveat para producción: la ausencia de benchmarks y de documentación sobre el entrenamiento hace recomendable una evaluación exhaustiva antes de usar el modelo en entornos productivos. La cuantización Q3_K_M está marcada por el autor como "lower quality", por lo que se desaconseja para usos que requieran precisión.
- El repositorio tiene muy pocas descargas (30) y ningún "like", lo que sugiere una adopción limitada y poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/Microtron-4B-GGUF
- Modelo base original: https://huggingface.co/bunnycore/Microtron-4B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Microtron-4B-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Microtron-4B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
