# mradermacher/Heliactis-3-7B-GGUF

## Resumen

Heliactis-3-7B-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo base Heliactis-3-7B, publicado por el usuario mradermacher en Hugging Face. El modelo original lo desarrolla ApollonLabs, y esta version se limita a ofrecer los pesos convertidos a distintos niveles de cuantizacion para facilitar su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El repositorio contiene unicamente los ficheros cuantizados (no los pesos originales en safetensors), con un total de 48,7 GB distribuidos entre las distintas variantes. Segun los metadatos del repositorio, el modelo cuenta con 8.999.178.240 parametros, lo que corresponde a un modelo de aproximadamente 9.000 millones de parametros (pese a la denominacion "7B" del nombre original, el recuento real de parametros es superior).

La relevancia de esta ficha es practica: permite a desarrolladores evaluar rapidamente la disponibilidad de cuantizaciones GGUF de un modelo conversacional y decidir si encaja en su infraestructura. No obstante, la informacion publica disponible es muy escasa: no se detallan arquitectura, datos de entrenamiento, licencia ni idiomas, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.999.178.240 (aprox. 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); repo de 48,7 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Heliactis-3-7B en la documentacion proporcionada. La model card del repositorio GGUF unicamente indica que se trata de cuantizaciones estaticas del modelo original `ApollonLabs/Heliactis-3-7B`, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversion desde pesos en formato Hugging Face (probablemente safetensors) a GGUF mediante el flujo habitual de llama.cpp.

No se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, arquitecturas hibridas, etc.). Toda esta informacion debe considerarse no disponible a partir de las fuentes consultadas.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a traves de infraestructura de inferencia compatible con la API de Hugging Face.
- Razonamiento, codigo, matematicas y vision: no disponible (no se documenta ninguna de estas capacidades).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: al ofrecerse en GGUF con variantes desde Q2_K hasta Q8_0, el modelo puede ejecutarse en llama.cpp sobre CPU o GPU consumer, lo que facilita pruebas de concepto sin infraestructura dedicada.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` permite usar el modelo como base para chatbots de prueba en entornos de desarrollo antes de escalar a un modelo mayor o con licencia clara.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 variantes de cuantizacion, lo que permite medir el impacto de la compresion en calidad y velocidad para un modelo de ~9B parametros.
- Integracion en pipelines con Ollama o llama.cpp: los ficheros GGUF son directamente consumibles por estas herramientas, lo que simplifica la incorporacion del modelo en flujos de trabajo existentes.
- Experimentacion academica: investigadores que necesiten un modelo conversacional de tamano medio para estudios de sesgo, alucinacion o evaluacion de calidad pueden usar estas cuantizaciones en hardware modesto.
- Servido mediante endpoints compatibles: la etiqueta `endpoints_compatible` indica que puede desplegarse en servicios de inferencia que acepten el formato de API de Hugging Face, util para pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el numero de parametros (~9B) y las cuantizaciones ofrecidas, Q4_K_M requeriria del orden de 5-6 GB de VRAM, Q8_0 en torno a 9-10 GB y f16 aproximadamente 18 GB; estas cifras son estimaciones generales, no datos del autor.
- GPU recomendadas: no disponible en la documentacion. Por tamano, una RTX 3060 de 12 GB o superior podria alojar cuantizaciones Q4 y Q5; una RTX 4090 (24 GB) permitiria Q8_0 y f16 con holgura.
- Cabe en GPU consumer: si, previsiblemente en modelos con 8 GB o mas de VRAM para cuantizaciones Q4, aunque no hay confirmacion oficial.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere soporte adicional en endpoints de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre el modelo base Heliactis-3-7B ni de modelos comparables en la documentacion proporcionada, por lo que no es posible establecer una comparativa fiable de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo original `ApollonLabs/Heliactis-3-7B` antes de cualquier despliegue en produccion.
- Ausencia de documentacion tecnica: no se detallan arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para tareas concretas.
- Riesgo de alucinacion: no cuantificado ni documentado por el autor.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no disponibles.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en modelos de este tamano; se recomienda Q4_K_M o superior para uso real.
- El nombre "7B" no coincide con el recuento real de parametros (~9B), lo que puede llevar a estimaciones erroneas de requisitos de memoria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Heliactis-3-7B-GGUF
- Modelo base: https://huggingface.co/ApollonLabs/Heliactis-3-7B
