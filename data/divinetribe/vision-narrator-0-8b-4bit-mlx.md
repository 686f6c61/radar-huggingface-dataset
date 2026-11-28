# divinetribe/Vision-Narrator-0.8B-4bit-mlx

## Resumen

Vision Narrator 0.8B (4-bit MLX) es un modelo de vision-lenguaje desarrollado por divinetribe (Nice Dreamz) como fine-tuning del modelo base Qwen/Qwen3.5-0.8B. Está diseñado específicamente para asistir a personas ciegas y con baja visión, respondiendo a preguntas sobre imágenes capturadas con la cámara de un teléfono móvil. El modelo forma parte de la aplicación RealTime AI Cam, disponible para iOS y Android, y ejecuta toda la inferencia de forma local y offline en el dispositivo.

La propuesta central del modelo es responder primero la pregunta concreta del usuario (sí/no, un número, un color, un nombre) antes de añadir contexto descriptivo, en lugar de generar una descripción genérica de la escena. Está entrenado con el conjunto de datos VizWiz, que recoge preguntas reales formuladas por personas ciegas sobre fotografías tomadas por ellas mismas. Con 852.985.920 parámetros totales y un tamaño de repositorio de 1,3 GB, el modelo está cuantizado a 4 bits en su componente de lenguaje mientras mantiene la torre de visión a precisión completa.

La relevancia actual del modelo reside en su enfoque de accesibilidad en el borde (edge computing): demuestra que un modelo de visión-lenguaje de menos de mil millones de parámetros puede ofrecer utilidad real en tareas de asistencia visual en tiempo real sobre hardware móvil de consumo, sin conexión a internet ni servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base Qwen3.5 con torre de visión; fine-tuning LoRA) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit affine con group size 64 en el componente de lenguaje; torre de visión a precisión completa (el autor reporta que 8-bit y 4-bit en visión degradan la precisión) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de visión-lenguaje, y se ha adaptado mediante fine-tuning con LoRA. La innovación técnica principal es la asimetría en la cuantización: el componente de lenguaje se comprime a 4 bits (affine, group size 64), mientras que la torre de visión permanece a precisión completa. El autor justifica esta decisión indicando que comprimir la visión provocaba errores en la lectura de importes monetarios; en sus pruebas, 8-bit en visión redujo la precisión al 96,2 % y 4-bit al 91,5 %.

El entrenamiento se centró en preguntas reales del conjunto de datos VizWiz, formuladas por personas ciegas sobre fotografías propias. La versión v09 del modelo se reentrenó para priorizar la respuesta directa a la pregunta sobre la descripción de la escena, corrigiendo el comportamiento de versiones anteriores que generaban descripciones completas independientemente de la pregunta. El modelo también está entrenado para declarar incapacidad de respuesta cuando la imagen no permite determinarla, con una tasa de acierto del 92,0 % en fotografías no respondibles. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto a partir de imágenes (image-to-text) y respuesta a preguntas visuales (visual question answering).
- Respuesta directa a preguntas concretas: sí/no, cantidades numéricas, colores, nombres y texto impreso.
- Descripción de escenas con indicación de posición relativa de objetos ("a tu izquierda", "justo delante").
- Lectura de documentos: identificación del tipo de documento, remitente, importe y consecuencias (por ejemplo, fechas de vencimiento de facturas).
- Declaración explícita de incapacidad de respuesta cuando la imagen es insuficiente (foto oscura, recortada o borrosa), con sugerencia de acción correctiva.
- Ejecución totalmente offline en dispositivo móvil (probado en iPhone 14 Pro Max).
- Soporte de dos modos mediante system prompts diferenciados: modo pregunta y modo descripción.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Asistencia a personas ciegas o con baja visión: el modelo responde preguntas sobre el entorno inmediato capturado con la cámara del teléfono, con respuestas breves en una frase aptas para síntesis de voz y ejecución offline.
- Lectura de correspondencia y facturas: identifica el tipo de documento, el remitente, el importe y las consecuencias de no pagar, útil para personas que necesitan comprender correspondencia administrativa sin asistencia externa.
- Verificación de estado de electrodomésticos: responde a preguntas como si una luz está encendida, si un depósito está lleno o si un indicador concreto está activo, con respuestas de sí/no directas.
- Descripción de escenas para orientación: indica qué obstáculos o personas hay delante y a los lados, con referencias espaciales relativas al usuario, adecuado para desplazamientos en interiores.
- Aplicaciones móviles de accesibilidad: integrable en apps iOS y Android mediante MLX, con un tamaño de aproximadamente 620 MB que permite su distribución y ejecución en hardware de consumo.
- Detección de calidad de imagen en flujos de captura: el modelo señala cuándo una foto es demasiado oscura, está recortada o es ilegible, y sugiere al usuario cómo repetir la captura, lo que puede integrarse en pipelines de verificación de documentos.
- Asistencia en tareas cotidianas de cocina o compras: comprobar si un envase está vacío, leer etiquetas o identificar productos, siempre en inglés y con conectividad nula.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 295 preguntas de VizWiz con fotografías excluidas del entrenamiento, usando la métrica estándar de VizWiz (acuerdo con 10 respuestas humanas):

| Metrica | v08 | v09 |
|---|---|---|
| Precisión global | 46,1 % | 66,4 % |
| Preguntas de sí/no | 10,9 % | 62,5 % |
| Preguntas numéricas | 47,3 % | 61,3 % |
| Otras preguntas | 50,2 % | 60,7 % |
| Acierto al decir "no puedo saberlo" en fotos no respondibles | 78,0 % | 92,0 % |
| Respuesta primero | 34,6 % | 65,8 % |

Prueba de descripción: 192/200 hechos correctos en v09 frente a 194/200 en v08. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa aproximadamente 620 MB en su versión 4-bit, por lo que requiere menos de 1 GB de memoria unificada para inferencia.
- GPU recomendadas: Apple Silicon (probado en iPhone 14 Pro Max); la librería MLX está orientada a chips de Apple. No hay información sobre soporte en GPU NVIDIA.
- Cabe en GPU de consumo: sí, en cualquier chip Apple Silicon reciente y en dispositivos móviles iOS y Android según el autor.
- Opciones de despliegue: MLX (mlx-vlm) como librería principal; el autor menciona despliegue en iOS y Android. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vision Narrator 0.8B (4-bit MLX) | 852.985.920 | No disponible | VQA para accesibilidad, offline en móvil | Apache 2.0 | Hugging Face, MLX |
| Qwen/Qwen3.5-0.8B (modelo base) | No disponible | No disponible | Vision-lenguaje general | No disponible | Hugging Face |
| Alternativas comparables de VQA móvil | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables adicionales de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se han publicado capacidades en castellano ni en otros idiomas.
- Debilidad conocida en la interpretación de indicadores de dirección de ascensores: suele responder que no puede determinarlo; responde mejor a preguntas sobre qué flecha está iluminada.
- Riesgo de alucinación mitigado parcialmente mediante entrenamiento para declarar incapacidad, pero no eliminado; el autor reporta un 92,0 % de acierto en la declaración de no poder responder, lo que implica un 8 % de fallos en ese comportamiento.
- La cuantización a 4 bits del componente de lenguaje puede degradar tareas que requieran precisión fina; el autor mantiene la visión a precisión completa precisamente por este motivo.
- El modelo está diseñado para asistencia a personas ciegas; no debe usarse como única fuente de información en decisiones críticas de seguridad (medicamentos, riesgos físicos, documentos legales).
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo se distribuye como fine-tuning de Qwen3.5-0.8B, cuyas condiciones de licencia deben verificarse por separado.
- No se dispone de información sobre sesgos demográficos, culturales o lingüísticos del modelo.
- El rendimiento reportado se basa en 295 preguntas de un único conjunto de evaluación; la generalización a otros dominios no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Vision-Narrator-0.8B-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del código fuente: https://github.com/nicedreamzapp/RealTimeAICam
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- App Store (iPhone): https://apps.apple.com/us/app/realtime-ai-cam/id6751230739
- Google Play (Android): https://play.google.com/store/apps/details?id=com.mattmacosko.realtimeaicam
- Dataset VizWiz: https://vizwiz.org/tasks-and-datasets/vqa/
- Paper VizWiz (arXiv:1802.08218): https://arxiv.org/abs/1802.08218
- Paper VizWiz (arXiv:2002.08565): https://arxiv.org/abs/2002.08565
