# kaonai/grpo-kaon3-cr5c-calibrated-mean-n18-b004-step50

## Resumen

El modelo `grpo-kaon3-cr5c-calibrated-mean-n18-b004-step50`, publicado por el autor `kaonai`, es un checkpoint de ajuste fino de 25.805.933.872 parámetros sobre el modelo base `kaon-c-gemma4-26b-v10.1`, un sistema multimodal de la familia Gemma 4. Se distribuye como un merge standalone de pesos completos en bfloat16, no como un adaptador PEFT. La técnica de entrenamiento utilizada es GRPO (Group Relative Policy Optimization) con un sistema de recompensa de consenso calibrado, que agrega señales de recompensa R/S/W para optimizar las respuestas del modelo. El autor indica que se trata de un checkpoint intermedio en el paso 50 del optimizador, con estado de "sugerido no evaluado", por lo que su publicación no debe interpretarse como una aprobación para uso en producción. No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal de la familia Gemma 4 según tags) |
| Parámetros totales | 25.805.933.872 |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo pesos bfloat16 en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un merge standalone en bfloat16 de un adaptador PEFT sobre el modelo base `kaonai/kaon-c-gemma4-26b-v10.1`. El proceso de ajuste utiliza GRPO (Group Relative Policy Optimization) con una tasa de aprendizaje de 1e-4, beta de 0.04 y semilla 42. La recompensa se agrega mediante una media calibrada de márgenes R/S/W, y el muestreo se realiza con N18, seleccionando bottom3 y top3 para un consenso estricto de signo de tres vías. El checkpoint corresponde al paso 50 del optimizador. No se proporcionan datos sobre el dataset de entrenamiento, ni sobre la composición o el número de tokens. El autor incluye un `MERGE_AUDIT.json` para verificar la identidad de los pesos y confirma la paridad de logits representativos tras guardar y recargar.

## Capacidades

- Generación de texto y diálogo: el pipeline declarado es `text-generation` y el tag `conversational`.
- Entrada multimodal: el tag `image-text-to-text` indica la capacidad de recibir imágenes y texto, pero no hay especificaciones adicionales.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en la infraestructura de Hugging Face.
- No constan capacidades de tool calling, function calling, uso de agentes o razonamiento multietapa en la documentación disponible.
- No hay más capacidades documentadas; el checkpoint no ha sido evaluado, por lo que el rendimiento real en las tareas anteriores es desconocido.

## Casos de uso

Los siguientes casos de uso son hipotéticos y se deducen de las características públicas del modelo (multimodalidad y generación conversacional). No están validados por evaluaciones publicadas.

- Asistentes visuales de atención al cliente: el modelo podría responder preguntas sobre capturas o imágenes enviadas por usuarios, gracias a su entrada multimodal, aunque requiere una GPU con al menos 80 GB de VRAM para su carga en bfloat16.
- Accesibilidad para personas con discapacidad visual: puede generar descripciones de imágenes en tiempo real, lo que permite integrarlo en aplicaciones de lectura de pantalla.
- Análisis de documentos escaneados: extraer texto y relaciones de imágenes de facturas, formularios o diagramas, útil en procesos de digitalización de documentos.
- Generación de contenido para redes sociales: producir textos a partir de imágenes o viceversa, aprovechando la capacidad conversacional y multimodal.
- Tutoría educativa: explicar diagramas, gráficos o ecuaciones escritas a mano en formato conversacional, aprovechando la entrada de imágenes y la generación de texto.
- Investigación en alineación: utilizar el pipeline GRPO y la recompensa de consenso para estudiar la optimización de políticas en modelos de 25B, dado que el proceso de entrenamiento está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio tiene 51.6 GB en bfloat16, por lo que la carga completa de los pesos en BF16 requiere aproximadamente 52 GB de VRAM, más espacio para activaciones y caché KV.
- GPU recomendadas: A100 80GB, H100 80GB o superiores para una inferencia en bfloat16 sin cuantización.
- En GPU de consumo: no es viable sin cuantización; una RTX 4090 de 24 GB no puede alojar el modelo en BF16. Con cuantización a 4-bit (no publicada actualmente) sería posible, pero no existen artefactos GGUF o AWQ en el repositorio.
- Opciones de despliegue: se puede cargar mediante `transformers`, y es compatible con vLLM y TGI al ser un modelo de Hugging Face. Para llama.cpp u Ollama sería necesario generar primero una cuantización GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos equivalentes en la información proporcionada y no hay resultados de benchmarks publicados que permitan establecer una comparativa fiable.

## Limitaciones y advertencias

- El autor indica que este checkpoint es un "suggested unevaluated checkpoint" y que su publicación no es una autorización de promoción.
- No hay licencia declarada, por lo que el uso comercial u operativo plantea riesgos legales.
- No se especifican idiomas soportados; la calidad multilingüe es desconocida.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño, sin mitigaciones documentadas.
- No se han publicado benchmarks de razonamiento, matemáticas, código ni comprensión visual.
- La longitud de contexto es desconocida, lo que puede afectar a tareas que requieren ventanas largas.
- Los datos de entrenamiento no están documentados, por lo que no se puede descartar la presencia de sesgos o contenido sensible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kaonai/grpo-kaon3-cr5c-calibrated-mean-n18-b004-step50
- Modelo base: https://huggingface.co/kaonai/kaon-c-gemma4-26b-v10.1
- Archivo de auditoría del merge (dentro del repo): `MERGE_AUDIT.json`
- Archivo de hashes del manifiesto (dentro del repo): `MANIFEST.sha256`
