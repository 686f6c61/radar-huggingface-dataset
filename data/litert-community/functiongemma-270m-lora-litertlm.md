# litert-community/functiongemma-270m-lora-litertlm

## Resumen

FunctionGemma 270M LoRA LiteRT-LM es una variante del modelo Gemma de 270 millones de parámetros, adaptada mediante LoRA y empaquetada en formato LiteRT-LM (antes TFLite) por la comunidad `litert-community`. El modelo está pensado para ejecución en dispositivos de borde (edge), principalmente móviles y sistemas embebidos, donde el runtime LiteRT permite inferencia eficiente sin necesidad de GPUs dedicadas. La nomenclatura "function" sugiere un ajuste orientado a *function calling* o invocación de herramientas, aunque no se dispone de documentación oficial que lo confirme.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue más que de un modelo base: combina pesos en safetensors con artefactos tflite en un repositorio de 1,2 GB. El modelo base subyacente es Gemma de 270M, una variante compacta de la familia Gemma de Google DeepMind, pero la información pública disponible sobre este repositorio concreto es muy limitada (16 descargas, 0 likes, sin model card sustantiva).

No se dispone de información sobre licencia, idiomas soportados, pipeline ni resultados de evaluación en la información proporcionada. Los datos que siguen se limitan a lo verificable en el repositorio y a las características conocidas de la familia Gemma 270M, marcando explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma); adaptación LoRA sobre el modelo base |
| Parámetros totales | 270M (según nomenclatura del repositorio) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo incluye artefactos tflite, presumiblemente cuantizados, sin detalle publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y tflite (LiteRT-LM) |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA sobre un modelo Gemma de 270M parámetros, empaquetado para el runtime LiteRT-LM. La arquitectura subyacente es la de un transformer decoder-only de la familia Gemma, aunque no se especifica la configuración exacta (número de capas, dimensión oculta, cabezas de atención) en la información disponible. El ajuste LoRA sugiere un entrenamiento de bajo rango sobre el modelo base, presumiblemente para especializarlo en invocación de funciones, aunque no se documenta el dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

La innovación técnica principal es el empaquetado en LiteRT-LM, el formato de Google para despliegue de modelos en dispositivos con aceleración por GPU móvil (Adreno, Mali) y NPU. No se dispone de información sobre la composición del dataset, el proceso de destilación, ni técnicas de decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto autoregresiva, propia de un modelo de 270M parámetros.
- Presunta especialización en *function calling* o invocación de herramientas, deducida del nombre "functiongemma", sin confirmación documental.
- Capacidades multilingües: no disponible.
- Soporte de tool calling: presumible por el nombre, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.
- Modo *thinking*: no disponible.

## Casos de uso

- **Invocación de funciones en aplicaciones móviles**: el modelo podría integrarse en apps Android o iOS para interpretar intenciones del usuario y mapearlas a llamadas de API locales, aprovechando su tamaño reducido y el runtime LiteRT para inferencia on-device sin conexión.
- **Asistentes de voz embebidos**: con 270M parámetros, el modelo cabe en memoria de un dispositivo móvil y podría gestionar la fase de comprensión de intención en un pipeline de asistente por voz, delegando la síntesis a componentes especializados.
- **Automatización de tareas en el dispositivo**: clasificación de comandos y enrutamiento a acciones del sistema (encender wifi, crear recordatorios) sin enviar datos a la nube, lo que mejora la privacidad.
- **Prototipado rápido de agentes edge**: investigadores pueden usar el modelo como base para experimentar con LoRA y function calling en entornos con recursos limitados, gracias al formato tflite y al tamaño del repo (1,2 GB).
- **Filtrado y clasificación de texto local**: el modelo puede emplearse para tareas de clasificación ligera o extracción de entidades en aplicaciones de bajo consumo energético.
- **Componente de un sistema multi-modelo**: actuar como "router" o clasificador de intenciones delante de un modelo mayor en la nube, reduciendo costes de tokens y latencia en peticiones simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de 270M en fp16 se estiman del orden de 0,5-1 GB, y en cuantización int8 aproximadamente 0,3 GB, aunque no hay datos oficiales.
- GPU recomendadas: no disponibles; el formato LiteRT-LM está orientado a GPU móviles (Adreno, Mali) y NPU de dispositivos Android.
- ¿Cabe en GPU de consumo? Sí, con margen amplio en cualquier GPU de consumo moderna (RTX 3060 o superior), aunque el objetivo del empaquetado es el despliegue móvil.
- Opciones de despliegue: runtime LiteRT-LM (antes TFLite); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| FunctionGemma 270M LoRA LiteRT-LM | 270M | no disponible | no disponible | safetensors, tflite | Hugging Face, 16 descargas |
| Gemma 270M (base) | 270M | no disponible | Gemma Terms of Use (presunto) | safetensors | Amplia |
| EmbeddingGemma 740M LiteRT-LM | 740M | no disponible | no disponible | tflite | Hugging Face, litert-community |
| Gemma 4 E2B IT LiteRT-LM | no disponible | no disponible | no disponible | tflite | Hugging Face, litert-community |

La comparativa se limita a otros artefactos del mismo autor (`litert-community`), ya que no se dispone de datos de rendimiento para contrastar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información pública muy escasa: sin model card sustantiva, sin licencia declarada y sin idiomas especificados, lo que impide evaluar su idoneidad para producción.
- Con 270M parámetros, la capacidad de razonamiento, coherencia en contextos largos y precisión factual es limitada en comparación con modelos de mayor tamaño; riesgo elevado de alucinación en tareas abiertas.
- El ajuste LoRA específico para function calling, de confirmarse, puede degradar el rendimiento en tareas generales de generación de texto.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los términos del modelo base Gemma y del adaptador.
- Riesgo de sesgos heredados del modelo base Gemma y del dataset de ajuste, no documentados.
- El formato LiteRT-LM limita el despliegue a entornos compatibles; no hay evidencia de soporte en ecosistemas estándar de servidor.
- Sin datos de benchmarks, no es posible comparar su rendimiento real con alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/functiongemma-270m-lora-litertlm
- Organización LiteRT Community: https://huggingface.co/litert-community
