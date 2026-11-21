# mradermacher/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic es un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) derivado de la familia Qwen3.5 y distribuido en formato GGUF por el usuario mradermacher. Se trata de un merge de tipo DELLA que combina el modelo base spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic con técnicas de "abliteration" (eliminación de rechazos) y "heretic" (decensurado), orientadas a reducir las negativas del modelo ante peticiones que un modelo alineado estándar rechazaría. El resultado es un modelo conversacional sin censura, con capacidades declaradas de razonamiento y visión (multimodal, según el tag `vision` y los ficheros `mmproj` incluidos).

El modelo se publica bajo licencia Apache 2.0 y está pensado para su uso con llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, etc.). Su relevancia actual radica en que ofrece una alternativa de ~9B parámetros que cabe en GPUs de consumo con cuantizaciones de 4 bits (en torno a 5-6 GB) y que, al estar decensurado, permite experimentación con casos de uso que los modelos alineados bloquean, a costa de asumir riesgos de contenido dañino o sesgado.

La información disponible es limitada: la model card del repositorio GGUF es fundamentalmente una ficha de cuantizaciones generada automáticamente, sin datos sobre arquitectura interna, composición del dataset de entrenamiento, benchmarks ni idiomas soportados más allá del inglés declarado. Esta ficha refleja únicamente los datos verificables en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles internos no disponibles) |
| Parámetros totales | 9.197.093.888 (≈9,2B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para la parte multimodal |
| Idiomas soportados | inglés (declarado en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones estáticas); también existe versión i1 con cuantizaciones ponderadas/imatrix en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un merge de tipo DELLA (técnica de fusión de modelos que opera sobre las diferencias de pesos entre modelos) a partir del modelo base spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic, que a su vez deriva de la familia Qwen3.5. La model card no proporciona detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni configuración exacta del transformer. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación; de hecho, el propósito declarado del modelo es precisamente el opuesto: eliminar o atenuar los rechazos aprendidos durante el alineamiento mediante técnicas de abliteration y decensurado ("heretic").

La innovación técnica más destacable, según los tags y los ficheros disponibles, es la inclusión de capacidad multimodal (visión) mediante ficheros `mmproj` en Q8_0 y f16, que actúan como suplemento multi-modal para el modelo en llama.cpp. También se declara capacidad de razonamiento (`reasoning`), aunque no se detalla si emplea un modo de pensamiento explícito ni cómo se activa. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat (tag `conversational`).
- Razonamiento declarado mediante el tag `reasoning`; no se detalla el mecanismo.
- Capacidad de visión (multimodal) mediante los ficheros `mmproj` incluidos en el repositorio.
- Modelo decensurado/abliterated: reduce los rechazos ante peticiones que un modelo alineado estándar bloquearía.
- Compatible con llama.cpp y con endpoints compatibles (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés; el resto no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Experimentación en investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo varía el comportamiento de un Qwen3.5 de ~9B tras aplicar abliteration y decensurado, comparándolo con el modelo base alineado en tareas de rechazo y cumplimiento.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas que los modelos alineados suelen rechazar, ejecutada localmente con llama.cpp en una GPU de consumo.
- Análisis de imágenes en local: gracias a los ficheros `mmproj`, se puede usar el modelo para describir o razonar sobre imágenes en un pipeline de llama.cpp, con la ventaja de que los datos no salen del equipo.
- Prototipado de asistentes conversacionales privados: despliegue en Ollama o LM Studio para conversaciones multi-turno en inglés, con cuantización Q4_K_M (≈5,9 GB) que cabe en GPUs de 8 GB.
- Evaluación de robustez y red-teaming: uso del modelo como sujeto de pruebas para medir la eficacia de filtros de contenido o clasificadores de seguridad en producción, al disponer de una variante que tiende a producir contenido que otros modelos evitan.
- Pruebas de concepto de pipelines multimodales con GGUF: integración del modelo y su mmproj en aplicaciones de escritorio o servidores ligeros donde no se dispone de infraestructura para modelos multimodales de mayor tamaño.
- Fine-tuning o destilación sobre una base decensurada: uso como punto de partida para ajustes específicos de dominio en los que se quiera evitar que el modelo base imponga rechazos no deseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ≈ 4,0 GB; Q3_K_S ≈ 4,5 GB; Q3_K_M ≈ 4,8 GB; Q3_K_L ≈ 5,1 GB; IQ4_XS ≈ 5,5 GB; Q4_K_S ≈ 5,6 GB; Q4_K_M ≈ 5,9 GB; Q5_K_S ≈ 6,6 GB; Q5_K_M ≈ 6,7 GB; Q6_K ≈ 7,7 GB; Q8_0 ≈ 9,9 GB; f16 ≈ 18,5 GB. Para visión hay que sumar el mmproj: ≈0,7 GB (Q8_0) o ≈1,0 GB (f16).
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB son suficientes; para Q8_0 o f16 se recomienda RTX 4090 de 24 GB, A100 o H100. Con cuantizaciones Q3 o Q2 podría caber en GPUs de 6-8 GB, con pérdida de calidad.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q4_K_M o inferiores; en 6 GB solo con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints tipo OpenAI. No se indica soporte de vLLM ni TGI para este formato.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic (este) | ≈9,2B | no disponible | Apache 2.0 | GGUF | Merge DELLA decensurado con visión |
| Qwen3.5 9B (modelo base de la familia) | ≈9B (según familia) | no disponible | no disponible en esta información | safetensors/GGUF | Modelo alineado estándar; rechaza contenido sensible |
| Otros GGUF decensurados de ~8-9B (p. ej. variantes abliterated de Llama 3.1 8B) | ≈8B | 128K en Llama 3.1 | Llama 3.1 Community License | GGUF | Alternativa consolidada, sin visión declarada en la información disponible |

La comparación cuantitativa de rendimiento no está disponible al no haberse publicado benchmarks para este modelo.

## Limitaciones y advertencias

- Modelo decensurado: reduce deliberadamente los rechazos, por lo que puede generar contenido ofensivo, peligroso o ilegal; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo elevado de alucinación y de respuestas inseguras al haberse atenuado el alineamiento; no se han publicado evaluaciones de seguridad.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la legalidad del contenido generado en jurisdicciones concretas.
- Es un merge de tercera parte sobre un modelo base no oficial de Qwen3.5; la procedencia y calidad de los datos de entrenamiento del modelo base no están documentadas.
- El repositorio ocupa 85,1 GB e incluye múltiples cuantizaciones; conviene descargar solo el fichero necesario.
- Las capacidades multimodales dependen de los ficheros `mmproj` y del soporte de llama.cpp; no se garantiza su funcionamiento en todos los runtimes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
