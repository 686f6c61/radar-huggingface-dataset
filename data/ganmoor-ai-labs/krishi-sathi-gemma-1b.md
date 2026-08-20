# ganmoor-ai-labs/krishi-sathi-gemma-1b

## Resumen

Krishi Sathi 1B (Gemma) es un modelo de lenguaje bilingüe (kannada e inglés) especializado en asesoramiento agrícola para el estado de Karnataka, en la India. Desarrollado por el laboratorio ganmoor-ai-labs, se presenta como un asistente de campo para agricultores que funciona completamente sin conexión, pensado para ejecutarse en teléfonos Android de gama baja. El modelo es un fine-tune LoRA sobre google/gemma-3-1b-it, con pesos fusionados y una versión cuantizada en GGUF Q4_K_M de aproximadamente 814 MB, lo que permite su uso en dispositivos con 3 GB de RAM.

La relevancia de este modelo radica en su enfoque práctico: está entrenado con datos reales de consultas al Kisan Call Centre de Karnataka (unas 42 000 llamadas entre 2009 y 2023), adaptados a un formato de respuesta breve y fundamentada. Además, incorpora un comportamiento de rechazo explícito para preguntas sobre precios de mercado, meteorología o estado de subvenciones, derivando al agricultor a los canales oficiales correspondientes. Se distribuye bajo la licencia Gemma, lo que permite uso comercial sujeto a los Términos de Uso de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-3-1B-it) |
| Parametros totales | 999 885 952 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF), safetensors (precisión completa) |
| Idiomas soportados | kannada (kn), inglés (en) |
| Licencia | Gemma (sujeta a Gemma Terms of Use y Prohibited Use Policy) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-1b-it, un transformer decoder-only con 1 000 millones de parámetros aproximadamente. Sobre esta base se aplicó un fine-tune con LoRA (Low-Rank Adaptation) y posterior fusión de pesos. El entrenamiento se realizó con tres fuentes de datos principales: consultas del Kisan Call Centre de Karnataka (2 900 grupos de preguntas ponderados por frecuencia, extraídos de 42 000 llamadas reales), preguntas de agronomía general adaptadas al contexto indio (filtradas de KisanVaani y reescritas por un profesor), y unos 1 650 ejemplos de "honestidad offline" que enseñan al modelo a rechazar preguntas sobre datos en vivo (precios, clima, estado de subvenciones) y a redirigir al usuario a canales oficiales como e-NAM/APMC, Meghdoot/IMD o Raitha Samparka Kendra. El corpus en kannada se generó mediante traducción automática con IndicTrans2 (rotary en-indic-1B). El dataset fue decontaminado para eliminar cualquier ejemplo que contuviera precios de mercado actuales.

## Capacidades

- Generación de texto conversacional en formato de chat Gemma (`<start_of_turn>user … <end_of_turn>`).
- Respuestas bilingües en kannada e inglés, con mayor fluidez en inglés.
- Rechazo explícito de preguntas sobre precios, meteorología o estado de subvenciones, sin inventar cifras.
- Respuestas estructuradas y concisas, sin degeneración por repetición observada en las evaluaciones del autor.
- Capacidad de seguir instrucciones de forma limpia, gracias al fine-tune sobre la versión instruct de Gemma-3.
- No soporta tool calling, visión ni otras modalidades; es exclusivamente texto.

## Casos de uso

- Asistente agrícola offline en zonas rurales: el modelo puede ejecutarse en un teléfono Android de gama baja (Q4_K_M ≈ 814 MB) y responder consultas sobre cultivos, plagas o prácticas agronómicas sin necesidad de conexión a internet.
- Consultas sobre dosis y productos fitosanitarios: el modelo genera explicaciones sobre productos químicos, pero el diseño previsto exige verificar las dosis con una tabla adjunta (`dosage_table.json`) antes de mostrar cualquier número al agricultor.
- Derivación a canales oficiales: ante preguntas sobre precios de mercado o clima, el modelo responde indicando al usuario que consulte e-NAM/APMC, Meghdoot/IMD o su Raitha Samparka Kendra local, evitando inventar datos.
- Formación y divulgación agrícola: puede utilizarse como material de apoyo en talleres o escuelas de campo, proporcionando respuestas básicas sobre agronomía adaptadas al contexto de Karnataka.
- Prototipado de aplicaciones de asesoramiento agrícola: al ser un modelo pequeño y con licencia comercial (bajo términos Gemma), sirve como base para desarrollar aplicaciones móviles o web de consulta agrícola en entornos con recursos limitados.
- Investigación en modelos multilingües de bajo recurso: el enfoque de entrenamiento con datos reales de llamadas y traducción automática puede servir de referencia para otros dominios o idiomas regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe evaluaciones cualitativas del autor: rechazo correcto de preguntas sobre datos en vivo, respuestas bien estructuradas, fluidez en inglés superior a la media de la familia, y kannada fluido pero con errores ocasionales de caracteres y cierta imprecisión en diagnóstico de enfermedades o ventanas de siembra.

## Requisitos de hardware

- VRAM estimada para inferencia: la versión Q4_K_M ocupa aproximadamente 814 MB, por lo que puede ejecutarse en dispositivos con 3 GB de RAM (teléfonos Android de gama baja).
- GPU recomendadas: no se requiere GPU para la versión cuantizada; puede ejecutarse en CPU. Para la versión safetensors completa (≈ 4 GB), se recomienda una GPU con al menos 6 GB de VRAM (p. ej., RTX 2060 o superior).
- Compatibilidad con GPU de consumo: sí, cualquier GPU con suficiente VRAM puede ejecutar la versión completa; la cuantizada funciona incluso en CPU.
- Opciones de despliegue: Ollama (se incluye un `Modelfile` en el repositorio), llama.cpp, o cualquier runtime compatible con GGUF. Para la versión safetensors, puede usarse vLLM o TGI, aunque el tamaño reducido hace que la CPU sea suficiente.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño de 1B parámetros, se espera una latencia de decodificación de unos 20-40 tokens/s en CPU moderna y mayor en GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos. El propio autor menciona una variante hermana, krishi-sathi-sarvam-2b, basada en Sarvam-1, que ofrece una generación en kannada aproximadamente 4 veces más rápida pero con licencia de investigación no comercial. No se han publicado métricas objetivas que permitan una comparación cuantitativa. El modelo base google/gemma-3-1b-it es el punto de partida, pero no se han realizado evaluaciones comparativas formales entre el fine-tune y su base.

## Limitaciones y advertencias

- Modelo experimental y educativo: se distribuye "tal cual", sin garantía de ningún tipo, y no constituye asesoramiento agrícola profesional.
- Riesgo de alucinación: puede generar información incorrecta o desactualizada, especialmente en diagnóstico de enfermedades o dosis de productos químicos.
- Limitaciones en kannada: la fluidez es inferior a la variante Sarvam-1; se observan errores ocasionales de caracteres en escritura extranjera y cierta imprecisión en consejos sobre ventanas de siembra.
- Riesgo de reproducir productos químicos obsoletos: el modelo puede mencionar sustancias cuya autorización ha cambiado (p. ej., Monocrotophos, prohibido para hortalizas en India). Es imprescindible verificar con la etiqueta del producto y las autoridades locales.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso, incluida la Prohibited Use Policy de Google. El uso comercial está permitido, pero debe cumplirse con dichos términos.
- No apto para decisiones críticas: no debe utilizarse como sustituto de análisis de suelo, diagnóstico experto o avisos oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ganmoor-ai-labs/krishi-sathi-gemma-1b
- Variante Sarvam-1 (mencionada en la model card): https://huggingface.co/ganmoor-ai-labs/krishi-sathi-sarvam-2b
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
