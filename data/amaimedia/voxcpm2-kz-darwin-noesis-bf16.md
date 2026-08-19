# AMAImedia/VoxCPM2-KZ-Darwin-NOESIS-BF16

## Resumen

VoxCPM2-KZ-Darwin-NOESIS-BF16 es un modelo de síntesis de voz (text-to-speech) derivado de VoxCPM2, desarrollado por AMAImedia como parte de la plataforma de doblaje multilingüe NOESIS. El modelo integra de forma permanente los pesos de un adaptador LoRA entrenado para kazajo, lo que elimina la necesidad de cargar adaptadores en tiempo de inferencia y simplifica el despliegue. Está pensado para producción, con pesos en BF16 y licencia Apache 2.0.

La arquitectura combina un modelo de lenguaje (LM) de 28 capas con un encoder de 12 capas, un transformador de difusión (DiT) y un AudioVAE que convierte audio de 16 kHz a 48 kHz. Con aproximadamente 2,29 mil millones de parámetros, el modelo soporta kazajo como idioma principal y ruso como secundario. Su relevancia radica en ofrecer una solución TTS lista para usar en kazajo, un idioma con pocos recursos comerciales, dentro de un ecosistema de doblaje automatizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (LM + Encoder + DiT + AudioVAE) |
| Parametros totales | 2.290.004.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (usa LongRoPE en el LM, sin valor publicado) |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | kazajo (kk), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en VoxCPM2, una arquitectura TTS que combina un modelo de lenguaje autoregresivo (28 capas, hidden=2048, GQA con 16/2 cabezas, vocabulario de 73 448 tokens) con un encoder de 12 capas (hidden=1024, 16 cabezas), un transformador de difusión (DiT) de 12 capas con solver CFM euler y un AudioVAE que muestrea a 16 kHz y genera a 48 kHz. El LM emplea LongRoPE para extender el contexto, aunque no se especifica el valor exacto.

El entrenamiento consistió en la fusión de un adaptador LoRA de rango 32 (escala 1.0) entrenado para kazajo, aplicado sobre las proyecciones q/k/v/o de los 28 bloques del LM (160 capas fusionadas). La fusión se realizó mediante la operación W_merged = W_base + (lora_B @ lora_A) * scale, con scale = lora_alpha / lora_rank = 1.0. Este proceso elimina la carga dinámica del adaptador y reduce la sobrecarga de memoria en inferencia. El modelo se integra en el marco DHCF-FNO de NOESIS como profesor TTS para destilación de conocimiento hacia un especialista TTS-10B.

## Capacidades

- Síntesis de voz en kazajo (idioma principal) y ruso (secundario).
- Generación de audio de alta calidad a 48 kHz de frecuencia de muestreo.
- Inferencia sin carga de adaptadores externos, gracias a la fusión LoRA permanente.
- Compatible con el pipeline `text-to-speech` de HuggingFace.
- Integración con el ecosistema VoxCPM2 para procesamiento de voz.
- Adecuado para tareas de doblaje y generación de contenido hablado multilingüe.

## Casos de uso

- Doblaje automatizado de contenido audiovisual: el modelo puede generar voces en kazajo para doblar series, películas o vídeos corporativos, integrándose en el pipeline de NOESIS para producción a gran escala.
- Generación de audiolibros en kazajo: permite convertir texto literario o técnico en audio natural, con soporte de contexto largo gracias a LongRoPE en el LM.
- Asistentes de voz locales: puede integrarse en sistemas embebidos o servicios en la nube para proporcionar respuestas habladas en kazajo, sin necesidad de servicios externos.
- Educación y aprendizaje de idiomas: genera ejemplos de pronunciación en kazajo y ruso para aplicaciones de enseñanza de lenguas.
- Accesibilidad: convierte contenido escrito en audio para personas con discapacidad visual, con soporte multilingüe.
- Producción de contenido para redes sociales: crea voces en off para vídeos, podcasts o anuncios en kazajo, reduciendo costes de locución humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en BF16 ocupan aproximadamente 4,6 GB (2,29B parámetros × 2 bytes). Con overhead de inferencia (activaciones, cache, etc.), se recomienda al menos 8 GB de VRAM para inferencia básica.
- GPU recomendadas: RTX 3060 12 GB, RTX 4090, A100 40 GB o superiores para producción con mayor throughput.
- En consumer GPU: sí, cabe en GPUs con 12 GB o más, como RTX 3060, RTX 4070, etc.
- Opciones de despliegue: al ser un modelo basado en VoxCPM2, se puede servir con frameworks compatibles con safetensors y pipelines de HuggingFace (Transformers, TTS). No se menciona soporte explícito para vLLM, llama.cpp u Ollama, que están orientados a LLMs.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos TTS similares en la información proporcionada. Se podría comparar con otros modelos TTS multilingües como VoxCPM original, XTTS o Bark, pero no hay métricas concretas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos de voz, puede presentar variaciones en la pronunciación según el acento o dialecto.
- Riesgo de alucinación: en TTS, el riesgo se manifiesta como pronunciaciones incorrectas o entonación artificial en textos poco comunes o con nombres propios.
- Limitaciones de idioma: el modelo está optimizado para kazajo y ruso; otros idiomas no están soportados oficialmente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de licencia y atribución.
- Caveat de producción: al ser un modelo fusionado con LoRA, no es posible ajustar el adaptador sin reentrenar; cualquier modificación requiere re-fusión de pesos.
- Dependencia de la calidad del texto de entrada: la síntesis puede degradarse con texto mal puntuado o con errores ortográficos.

## Enlaces

- [HuggingFace - VoxCPM2-KZ-Darwin-NOESIS-BF16](https://huggingface.co/AMAImedia/VoxCPM2-KZ-Darwin-NOESIS-BF16)
- [AMAImedia.com](https://www.amaimedia.com)
- [Perfil de X de AMAImedia](https://x.com/AMAImediacom)
- [LinkedIn de Ilia Bolotnikov](https://www.linkedin.com/in/ilia-bolotnikov)
