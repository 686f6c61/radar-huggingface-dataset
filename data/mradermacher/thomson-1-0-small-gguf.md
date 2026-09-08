# mradermacher/Thomson-1.0-Small-GGUF

## Resumen

Thomson-1.0-Small es un modelo fundacional de frontera desarrollado por Thomson Reuters, con un enfoque deliberado en trabajo profesional de alto impacto en los ámbitos legal, fiscal y periodístico. Pertenece a la familia Thomson-1.0 y se distribuye como modelo de pesos abiertos, aunque bajo una licencia restrictiva. El repositorio que nos ocupa, mradermacher/Thomson-1.0-Small-GGUF, contiene las cuantizaciones GGUF de dicho modelo, preparadas por el equipo de mradermacher para su uso en entornos locales con llama.cpp u otros motores compatibles.

El modelo tiene aproximadamente 34.660 millones de parámetros (34.660.610.688) y, según la información disponible, se ha desarrollado bajo un paradigma de aprendizaje continuo (Continual Learning). La presencia de archivos multimodales (mmproj) en el repositorio sugiere capacidades de visión, aunque no se detalla su alcance. Esta cuantización resulta relevante para desarrolladores e investigadores que necesitan evaluar un modelo de frontera en infraestructuras con recursos limitados, ya que ofrece varios niveles de compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible (no se ha confirmado si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (13.0 GB), Q3_K_M (16.9 GB), Q4_K_S (20.0 GB), Q6_K (28.6 GB), Q8_0 (37.0 GB), mmproj Q8_0 (0.7 GB), mmproj f16 (1.0 GB) |
| Idiomas soportados | en |
| Licencia | polyform-strict-1-0-0 |
| Formato de pesos | GGUF (el modelo base original se distribuye en safetensors) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles técnicos sobre la arquitectura interna del modelo, el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO. Lo que se conoce es que Thomson-1.0-Small es un modelo fundacional de frontera, miembro de pesos abiertos de la familia Thomson-1.0, desarrollado bajo un paradigma de aprendizaje continuo. Este enfoque se centra en dominios económicamente relevantes y de alto riesgo profesional, como el legal, el fiscal y el periodismo. La cuantización en GGUF no modifica la arquitectura subyacente, pero permite ejecutar el modelo en motores como llama.cpp con distintos niveles de compresión.

## Capacidades

- Generacion de texto conversacional en inglés, con un enfoque en dominios especializados y tareas generales.
- Competencia declarada en ambitos profesionales de alto impacto: legal, fiscal y periodismo.
- Capacidades multimodales sugeridas por la presencia de archivos mmproj (posible soporte de vision, aunque no se especifica su alcance).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se han publicado datos sobre capacidades multilingues mas alla del ingles.

## Casos de uso

- Asistencia legal: el modelo puede utilizarse para redactar borradores de contratos, resumir sentencias o analizar clausulas, aprovechando su entrenamiento orientado al ambito legal.
- Asesoramiento fiscal: aplicable a la interpretacion de normativa tributaria y a la generacion de informes preliminares para profesionales del sector.
- Periodismo de datos: util para resumir documentos extensos, identificar temas relevantes y apoyar la redaccion de articulos en ingles.
- Analisis de documentos corporativos: gracias a su tamano, puede procesar informes anuales, expedientes regulatorios o memorias de sostenibilidad.
- Chatbot interno para empresas del sector legal o financiero: permite ofrecer respuestas contextualizadas en ingles a consultas de empleados o clientes, con un despliegue local gracias a las cuantizaciones GGUF.
- Evaluacion de modelos de frontera en infraestructura limitada: las distintas cuantizaciones permiten probar el rendimiento del modelo en GPUs de consumo o en CPU, sin necesidad de un cluster de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos mas overhead de contexto y KV cache):
  - Q2_K: ~13 GB de pesos, se recomienda al menos 16 GB de VRAM.
  - Q3_K_M: ~17 GB de pesos, se recomienda al menos 20 GB de VRAM.
  - Q4_K_S: ~20 GB de pesos, se recomienda al menos 24 GB de VRAM (cabe en una RTX 4090 con margen ajustado).
  - Q6_K: ~29 GB de pesos, se recomienda al menos 32 GB de VRAM (A100 40 GB).
  - Q8_0: ~37 GB de pesos, se recomienda al menos 40 GB de VRAM (A100 80 GB o H100).
- GPUs recomendadas: RTX 4090 para Q4_K_S, A100 40 GB para Q6_K, A100 80 GB o H100 para Q8_0.
- Es posible ejecutar el modelo en CPU con llama.cpp, especialmente con las cuantizaciones mas bajas (Q2_K, Q3_K_M).
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con GGUF. El modelo original en safetensors puede desplegarse con vLLM o TGI, aunque no se dispone de informacion sobre su rendimiento en estos entornos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion suficiente sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: polyform-strict-1-0-0 no es una licencia de codigo abierto en sentido OSI. Impone condiciones estrictas sobre el uso, la modificacion y la redistribucion. Es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Solo soporta ingles: el modelo no ha sido entrenado para otros idiomas, lo que limita su aplicacion en entornos multilingues.
- Rendimiento no verificado: al no existir benchmarks publicados, no es posible comparar su rendimiento con otros modelos de tamano similar.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en dominios especializados donde la precision es critica.
- No se dispone de informacion sobre sesgos conocidos, limitaciones de contexto ni restricciones de uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Thomson-1.0-Small-GGUF
- Modelo base: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Perfil de mradermacher: https://huggingface.co/mradermacher
