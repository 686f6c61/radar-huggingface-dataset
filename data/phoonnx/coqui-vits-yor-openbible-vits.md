# Phoonnx/coqui-vits-yor-openbible-vits

## Resumen

`Phoonnx/coqui-vits-yor-openbible-vits` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, derivado del modelo `coqui/yor-openbible-vits` del ecosistema Coqui TTS. Lo publica el usuario Phoonnx como parte de la colección `Phoonnx/phoonnx-coqui-vits`, una serie de conversiones a ONNX pensadas para el motor de inferencia [phoonnx](https://github.com/TigreGotico/phoonnx). El modelo está especializado en yoruba (`yo`) y se ha entrenado con el corpus OpenBible, un conjunto de grabaciones de lectura bíblica en ese idioma.

Se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura de síntesis neuronal end-to-end que combina un codificador de texto, un predictor de duración, un flujo normalizador y un decodificador vocacional basado en HiFi-GAN. VITS es conocida por generar audio de alta calidad en una sola pasada, sin necesidad de un vocoder externo, y por su relativa ligereza en comparación con modelos de difusión o autoregresivos.

La relevancia de esta ficha es doble: por un lado, documenta un recurso de TTS para un idioma de bajos recursos como el yoruba; por otro, ejemplifica el patrón de distribución de modelos Coqui TTS convertidos a ONNX para su uso en producción con motores ligeros. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto adecuado para despliegues en CPU o GPU de gama baja.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; la longitud de entrada depende del texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | yoruba (`yo`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Tamaño del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Librería | phoonnx |
| Voice ID | `coqui/yor-openbible-vits` |
| Dataset de entrenamiento | OpenBible (yoruba) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS original, un sistema de síntesis end-to-end que integra en un único modelo el codificador de texto, el predictor de duración, el flujo normalizador y el decodificador de audio. Esta integración permite generar formas de onda directamente a partir de la secuencia de texto sin un vocoder separado, lo que simplifica el despliegue y reduce la latencia. La variante concreta corresponde a la implementación de Coqui TTS, que añade capas de normalización y un diseño de entrenamiento adversarial con una discriminadora multiperiodo.

Los datos de entrenamiento provienen del corpus OpenBible en yoruba, un conjunto de grabaciones de lectura bíblica. No se dispone de información sobre el número de horas de audio, la composición exacta del dataset, ni sobre si se aplicaron técnicas de fine-tuning adicionales, RLHF o ajuste por hablante. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura VITS y de la conversión a ONNX para su uso con el motor phoonnx.

## Capacidades

- Síntesis de voz (text-to-speech) en yoruba a partir de texto escrito.
- Generación de audio en una sola pasada gracias a la arquitectura VITS end-to-end.
- Ejecución mediante ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencias de PyTorch.
- Integración con el motor phoonnx a través del voice ID `coqui/yor-openbible-vits`.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües más allá del yoruba.
- No se documentan modos especiales como thinking mode, visión o audio de entrada.

## Casos de uso

- **Lectura automatizada de textos en yoruba**: el modelo puede convertir artículos, noticias o documentación escrita en yoruba a audio, lo que resulta útil para medios de comunicación o instituciones que quieran ofrecer versiones accesibles de sus contenidos en este idioma.
- **Accesibilidad para personas con discapacidad visual**: integrado en lectores de pantalla o aplicaciones de accesibilidad, permite que hablantes de yoruba escuchen contenido digital que de otro modo solo estaría disponible en texto.
- **Asistentes de voz para atención al cliente**: dado su tamaño compacto (~0,1 GB) y su formato ONNX, puede desplegarse en servidores modestos para responder consultas en yoruba en aplicaciones de banca, telecomunicaciones o administración pública.
- **Locución para contenido educativo**: escuelas y plataformas de e-learning pueden generar narraciones en yoruba para cursos, cuentos infantiles o materiales didácticos sin necesidad de un locutor humano.
- **Sistemas de megafonía y avisos públicos**: en entornos donde se requiere anunciar información en yoruba (transporte, aeropuertos, edificios públicos), el modelo puede generar avisos pregrabados o dinámicos.
- **Prototipado de aplicaciones de voz en idiomas de bajos recursos**: investigadores y desarrolladores pueden usar este modelo como base para experimentar con TTS en yoruba, evaluar la calidad de la conversión ONNX o comparar con otras aproximaciones.
- **Integración en pipelines de datos**: el formato ONNX y el voice ID facilitan su inclusión en flujos automatizados de generación de audio por lotes, por ejemplo para doblar vídeos o generar audiolibros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo VITS compacto (~0,1 GB en disco), la inferencia puede ejecutarse en CPU sin GPU dedicada. En GPU, el consumo de VRAM es mínimo (por debajo de 1 GB en la mayoría de configuraciones).
- **GPU recomendadas**: cualquier GPU moderna es suficiente; no se requiere una A100 ni H100. Una GTX 1650, RTX 3060 o incluso una GPU integrada pueden manejar la inferencia.
- **¿Cabe en GPU de consumo?**: sí, en cualquier GPU de consumo actual e incluso en CPU.
- **Opciones de despliegue**: ONNX Runtime (CPU o GPU), el motor phoonnx, y potencialmente otros runners compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia baja en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| Phoonnx/coqui-vits-yor-openbible-vits | VITS (ONNX) | Yoruba | CC-BY-SA-4.0 | ONNX | ~0,1 GB |
| coqui/yor-openbible-vits (original) | VITS | Yoruba | CC-BY-SA-4.0 | PyTorch | no disponible |
| Otros modelos Coqui TTS para yoruba | VITS | Yoruba | variable | PyTorch | no disponible |

No se dispone de información suficiente para comparar rendimiento (MOS, latencia, throughput) con alternativas. La comparativa se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- **Idioma único**: el modelo está entrenado exclusivamente para yoruba; no se debe esperar un rendimiento aceptable en otros idiomas.
- **Dominio restringido**: el corpus OpenBible consiste en lectura bíblica, por lo que el modelo puede presentar un estilo prosódico poco natural para otros tipos de texto (conversacional, técnico, etc.).
- **Riesgo de alucinación y artefactos**: como todo modelo TTS, puede generar pronunciaciones incorrectas, omisiones o artefactos acústicos ante texto fuera de distribución o con ortografía atípica.
- **Sesgos**: al entrenarse con un corpus religioso, el modelo puede reflejar sesgos de estilo y vocabulario propios de ese dominio.
- **Licencia CC-BY-SA-4.0**: permite uso comercial, pero exige atribución y compartir las obras derivadas bajo la misma licencia. Es importante revisar las implicaciones para productos que integren el modelo.
- **Sin datos de evaluación**: no se han publicado métricas objetivas (MOS, WER) ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- **Documentación escasa**: no se detallan parámetros, cuantizaciones disponibles ni requisitos exactos de hardware, lo que limita la planificación de producción.
- **Formato ONNX**: aunque facilita el despliegue, puede requerir herramientas específicas para inspeccionar o modificar el modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/coqui-vits-yor-openbible-vits)
- [Colección Phoonnx/phoonnx-coqui-vits](https://huggingface.co/Phoonnx/phoonnx-coqui-vits)
- [Repositorio phoonnx en GitHub](https://github.com/TigreGotico/phoonnx)
- [Modelo original coqui/yor-openbible-vits](https://huggingface.co/coqui/yor-openbible-vits) (referenciado en la model card)
