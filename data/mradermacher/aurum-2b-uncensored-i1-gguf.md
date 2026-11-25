# mradermacher/Aurum-2B-Uncensored-i1-GGUF

## Resumen

Aurum-2B-Uncensored-i1-GGUF es una cuantización en formato GGUF del modelo Aurum-2B-Uncensored, publicada por el usuario mradermacher. Se trata de una conversión de los pesos originales (alojados en el repositorio 2Beyes/Aurum-2B-Uncensored) a múltiples niveles de cuantización, generados con el método de imatrix/weighted quants, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base se presenta como una variante "uncensored" de 2B de parámetros, es decir, un modelo afinado para reducir los rechazos y filtros de seguridad habituales en asistentes alineados. La ficha del repositorio no documenta el proceso de entrenamiento, el dataset ni la arquitectura concreta, por lo que gran parte de las especificaciones técnicas quedan como no disponibles.

La relevancia de esta publicación es fundamentalmente práctica: ofrece un abanico amplio de cuantizaciones (desde IQ1_S hasta Q6_K, además de Q4_0 y Q4_1) que cubren desde escenarios de muy baja memoria hasta calidad casi completa, lo que facilita el despliegue local del modelo en GPUs modestas o incluso en CPU. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 812.958 (dato del safetensors del modelo base; el nombre comercial indica 2B, discrepancia no aclarada por el autor) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_K_S, Q4_K_M, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. El nombre sugiere un transformer de aproximadamente 2B de parámetros, pero el dato de safetensors del modelo base (812.958 parámetros) contradice esa cifra y no viene explicado. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otro tipo de alineamiento.

La única información técnica relevante es el proceso de cuantización: los GGUF se han generado con quantize_version 2, output_tensor_quantised 1 y convert_type hf, empleando cuantizaciones ponderadas con imatrix. La etiqueta "nicoboss" aparece en los metadatos del proceso de conversión. No se detalla qué dataset de calibración se usó para la imatrix.

## Capacidades

- Generación de texto conversacional en formato chat, presumiblemente con plantilla de instrucciones (no documentada).
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones que los modelos alineados convencionales.
- Ejecución local mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- Soporte de cuantizaciones de muy baja precisión (IQ1_S, IQ1_M) para entornos con memoria extremadamente limitada.
- Capacidades de tool calling, agentes, visión, audio o razonamiento multi-paso: no disponibles / no documentadas.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M o IQ4_XS permiten ejecutar el modelo en GPUs con 4-6 GB de VRAM o en CPU con 8-16 GB de RAM, útil para prototipos locales sin conexión.
- Experimentación con modelos sin filtros: investigadores que estudian el comportamiento de modelos "uncensored" pueden usar esta variante para comparar respuestas frente a versiones alineadas.
- Generación creativa sin restricciones: escritura de ficción, roleplay o guiones donde los filtros de seguridad de asistentes comerciales resultan limitantes.
- Pruebas de pipelines GGUF: sirve como modelo de prueba ligero para validar integraciones con llama.cpp, Ollama o servidores compatibles antes de escalar a modelos mayores.
- Educación y demostraciones: su reducido tamaño y variedad de cuantizaciones lo hacen adecuado para talleres sobre cuantización e inferencia local.
- Evaluación de técnicas de cuantización: la disponibilidad de 24 variantes permite medir el impacto de la precisión en la calidad de salida sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~2B, las cuantizaciones Q4 rondan 1,2-1,5 GB; Q6_K en torno a 1,8-2 GB; las IQ1/IQ2 pueden bajar de 1 GB. Cifras orientativas, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 4060, GTX 1660) para cuantizaciones Q4/Q5; GPUs de 8 GB o más (RTX 3060 Ti, RTX 4070) para Q6_K con contexto amplio.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4 GB o más, y en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aurum-2B-Uncensored-i1-GGUF | ~2B (según nombre; discrepancia con safetensors) | no disponible | no disponible | GGUF | 24 cuantizaciones, sin benchmarks publicados |
| Alternativas de ~2B "uncensored" en GGUF | ~2B | variable | variable | GGUF | No se dispone de datos concretos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos concretos.

## Limitaciones y advertencias

- Ausencia total de documentación sobre entrenamiento, dataset y alineamiento: imposible evaluar sesgos de forma fundamentada.
- Comportamiento "uncensored": mayor riesgo de generar contenido dañino, ofensivo o inexacto; no recomendado para aplicaciones de cara al público sin filtros adicionales.
- Discrepancia entre el nombre (2B) y el recuento de parámetros del safetensors (812.958): conviene verificar el modelo base antes de usarlo en producción.
- Riesgo de alucinación elevado en modelos pequeños, especialmente en cuantizaciones IQ1/IQ2, donde la degradación de calidad es notable.
- Licencia no especificada: no se puede confirmar la legalidad del uso comercial; consultar el repositorio del modelo base (2Beyes/Aurum-2B-Uncensored).
- Idiomas y contexto no documentados: no asumir soporte multilingüe ni ventanas largas.
- Repositorio sin descargas ni validación de la comunidad: sin garantías de calidad o mantenimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aurum-2B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/2Beyes/Aurum-2B-Uncensored
