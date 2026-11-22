# farc077/Celine_Sophie_Rae_KREA2

## Resumen

Celine_Sophie_Rae_KREA2 es un adaptador LoRA de tipo text-to-image publicado por el usuario farc077 en Hugging Face. Se trata de un ajuste fino ligero sobre el modelo base krea/Krea-2-Raw, orientado a la generación de imágenes de una persona concreta ("influencer") a partir de descripciones textuales. El adaptador se entrenó con la herramienta OneShotLoRA, según indica el propio autor en la model card, y emplea la palabra de activación `C3L1N35R` para invocar el concepto aprendido.

El repositorio es de tamaño reducido (0,2 GB), coherente con un LoRA y no con un modelo completo, y no registra descargas ni interacciones en el momento de la consulta. La información disponible es escasa: no se detallan datos de entrenamiento, hiperparámetros, número de pasos ni composición del dataset. La licencia figura como "other", sin que la model card concrete los términos exactos de uso comercial.

Su relevancia es acotada y práctica: sirve como ejemplo de adaptador de identidad sobre un modelo de difusión reciente (Krea-2-Raw) y permite a desarrolladores evaluar el flujo de trabajo LoRA + palabra de activación en pipelines de generación de imágenes con ComfyUI, que es el entorno que aparecen en los nombres de los ficheros de ejemplo de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion text-to-image krea/Krea-2-Raw |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de imagen en el sentido de tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las palabras de activacion y prompts de ejemplo estan en ingles) |
| Licencia | other (terminos no concretados en la model card) |
| Formato de pesos | no disponible (repositorio de 0,2 GB; previsiblemente safetensors de LoRA, sin confirmar) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base krea/Krea-2-Raw para especializarlo en un concepto visual concreto. No se trata por tanto de un transformer entrenado desde cero, sino de un ajuste fino paramétricamente eficiente sobre un modelo de difusión preexistente. La model card no especifica sobre qué módulos del modelo base se aplican las matrices (atención, cross-attention, MLP), ni el rango utilizado, ni la tasa de aprendizaje.

El entrenamiento se realizó con la plataforma OneShotLoRA, según la única referencia técnica de la model card. No se documenta el número de imágenes de entrenamiento, la resolución, el número de pasos, el optimizador ni si se aplicaron técnicas de regularización o captions automáticos. Tampoco se indica si el adaptador se entrenó con el modelo base en precisión completa o cuantizado. La palabra de activación definida es `C3L1N35R`, que debe incluirse en el prompt para activar la identidad aprendida.

## Capacidades

- Generación de imágenes text-to-image de una identidad concreta ("Celine Sophie Rae") condicionada por la palabra de activación `C3L1N35R`.
- Control de vestuario y entorno mediante prompts descriptivos en inglés, como muestran los ejemplos de la model card (camisa formal y blazer en oficina, vestido rosa en un campo, camiseta blanca y vaqueros).
- Composición de escenas con indicaciones de postura y mirada a cámara ("She is looking at the camera").
- Integración en flujos de trabajo de ComfyUI, a juzgar por los nombres de los ficheros de salida de ejemplo (`ComfyUI_temp_*.png`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking"; son ajenas a un adaptador de difusión de este tipo.
- Capacidad multilingüe: no disponible; los prompts de ejemplo están en inglés y no hay evidencia de soporte de otros idiomas.

## Casos de uso

- Creación de contenido para redes sociales: generar variaciones de una misma identidad virtual con distintos estilismos y localizaciones usando el trigger `C3L1N35R` junto con descripciones de ropa y escena, como en los ejemplos de la model card.
- Pruebas de concepto de moda o estilismo: evaluar combinaciones de prendas (camisa formal, blazer, vestido, vaqueros) sobre una figura consistente antes de producir un catálogo real.
- Prototipado de personajes para narrativa visual: mantener la coherencia de un personaje a lo largo de varias ilustraciones o viñetas generando cada escena con el mismo trigger y prompts descriptivos.
- Evaluación técnica de LoRA sobre Krea-2-Raw: comparar la fidelidad de identidad y la capacidad de seguir instrucciones de vestuario frente a otros adaptadores del mismo modelo base en un pipeline de ComfyUI.
- Generación de material para presentaciones o mockups: obtener imágenes de una persona en contexto de oficina corporativa (traje y blazer) para ilustrar documentos internos.
- Docencia y experimentación con difusión: usar el adaptador como ejemplo mínimo (0,2 GB) para explicar el funcionamiento de LoRA, palabras de activación y condicionamiento textual en modelos text-to-image.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende enteramente del modelo base krea/Krea-2-Raw, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del adaptador (0,2 GB) es irrelevante frente al peso del modelo base, que es el que determina el requisito real de memoria.
- Opciones de despliegue: ComfyUI es el entorno evidenciado por los nombres de los ficheros de ejemplo; no se confirman otras opciones (Diffusers, Automatic1111, InvokeAI) en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia estructural, cualquier LoRA de identidad sobre el mismo modelo base krea/Krea-2-Raw compartiría arquitectura y requisitos de hardware, diferenciándose únicamente en el concepto aprendido y en la calidad del entrenamiento, extremo que no puede evaluarse sin benchmarks ni muestras adicionales.

## Limitaciones y advertencias

- Información técnica muy escasa: no se documentan hiperparámetros, dataset, rango del LoRA ni módulos afectados, lo que dificulta reproducir o auditar el entrenamiento.
- Licencia "other" sin términos concretos: no puede confirmarse que el uso comercial esté permitido; es imprescindible contactar con el autor o revisar el repositorio antes de usarlo en producción.
- Riesgo de uso indebido de identidad: al tratarse de un adaptador de una persona concreta ("influencer"), su uso para generar imágenes no consentidas de personas reales plantea problemas legales y éticos en materia de derechos de imagen.
- Dependencia total del modelo base: la calidad, los sesgos y las limitaciones de krea/Krea-2-Raw se heredan sin que la model card los detalle.
- Idiomas: los prompts de ejemplo están en inglés y no hay evidencia de que el trigger funcione igual de bien con prompts en castellano.
- Sin métricas de fidelidad de identidad ni de seguimiento de instrucciones: no es posible cuantificar su rendimiento frente a otros adaptadores.
- Repositorio sin descargas ni interacciones: no hay evidencia de comunidad, validación externa ni mantenimiento.
- Riesgo de alucinación visual (artefactos, anatomía incorrecta, incoherencias de vestuario) propio de los modelos de difusión, no cuantificado en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farc077/Celine_Sophie_Rae_KREA2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Herramienta de entrenamiento citada: https://oneshotlora.com
