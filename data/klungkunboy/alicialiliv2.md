# klungkunboy/alicialiliv2

## Resumen

`klungkunboy/alicialiliv2` es un adaptador LoRA de tipo DreamBooth para la familia de modelos de difusion Krea 2, desarrollado por el usuario klungkunboy. El adaptador se entrena sobre el checkpoint base `krea/Krea-2-Raw` y está pensado para invocarse sobre la variante Turbo del mismo modelo, tal como demuestran las muestras publicadas en la model card, generadas con 8 pasos de inferencia y `guidance_scale=0.0`. Su función es inyectar un concepto concreto (una identidad o personaje asociado al token `alicialiliv2`) en el espacio latente del modelo base, sin necesidad de reentrenar la red completa.

El repositorio tiene un tamaño de 1.0 GB, lo que es coherente con un adaptador LoRA de rango medio para un modelo de difusion de gran tamaño. La licencia declarada es Apache 2.0 y la librería de referencia es `diffusers`, con pipeline `text-to-image`. El modelo se publicó el 5 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes, por lo que se trata de un artefacto reciente y sin validación comunitaria.

La relevancia de esta ficha es acotada: no es un modelo fundacional ni un LLM, sino un adaptador de personalización visual. Resulta útil para quien quiera reproducir el concepto entrenado o como plantilla para entender el flujo de entrenamiento e inferencia de LoRA sobre Krea 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusion Krea 2; no se especifica la arquitectura interna del modelo base |
| Parametros totales | no disponible (el repo pesa 1.0 GB, pero no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image, no语言 model) |
| Tipos de cuantizacion | no disponible; la model card usa `torch.bfloat16` en el ejemplo de inferencia |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato habitual de LoRA en `diffusers`; no se detalla en la card) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth sobre `krea/Krea-2-Raw`. DreamBooth es una técnica de personalización que ajusta un subconjunto de pesos (las matrices de bajo rango del LoRA) para que el modelo asocie un token raro (`alicialiliv2`) con un concepto visual concreto. Al ser LoRA, no se modifican los pesos del modelo base: se añaden matrices de descomposición de bajo rango en las capas de atención y/o proyección, lo que reduce drásticamente el coste de entrenamiento y el tamaño del artefacto (1.0 GB en este caso).

La model card no detalla el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje ni la composición del dataset. Tampoco indica si se aplicaron técnicas de regularización, aumento de datos o balanceo de prompts. Sí especifica que el adaptador se muestra sobre Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`, lo que sugiere que el entrenamiento se hizo sobre la variante RAW y se validó sobre Turbo, un patrón habitual para aprovechar la velocidad de Turbo en inferencia sin sacrificar la calidad de entrenamiento de RAW.

No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá del uso estándar de DreamBooth + LoRA.

## Capacidades

- Generación de imágenes text-to-image condicionada por el token `alicialiliv2`, que activa el concepto aprendido.
- Personalización de identidad o personaje: el adaptador permite reproducir un sujeto concreto en distintos escenarios (retrato cyberpunk, espíritu forestal, astronauta en Marte, según las muestras).
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers`, incluyendo carga mediante `load_lora_weights`.
- Inferencia rápida sobre Krea 2 Turbo: las muestras se generaron con 8 pasos y `guidance_scale=0.0`, lo que indica que el adaptador funciona en régimen de pocos pasos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de difusión, no un LLM.
- Capacidades multilingües: no documentadas; los prompts de ejemplo están en inglés.
- No se documentan capacidades de visión, audio ni thinking mode.

## Casos de uso

- **Generación de retratos de personaje consistente**: usar el token `alicialiliv2` en prompts para producir variaciones del mismo sujeto en distintos entornos (ciudad cyberpunk, bosque fantástico, Marte). El adaptador mantiene la identidad gracias al entrenamiento DreamBooth, y Turbo permite iterar rápido con 8 pasos.
- **Prototipado de arte conceptual**: un estudio puede generar bocetos de un personaje en múltiples escenarios con un solo prompt base, reduciendo el tiempo de exploración visual antes de pasar a producción.
- **Pruebas de integración con `diffusers`**: sirve como ejemplo mínimo de cómo cargar un LoRA sobre `Krea2Pipeline` y ejecutar inferencia con `guidance_scale=0.0`, útil para validar pipelines propios.
- **Generación de material para ilustración editorial**: crear imágenes de un personaje recurrente para portadas o artículos, manteniendo coherencia visual entre piezas.
- **Investigación en personalización de modelos de difusión**: el adaptador puede usarse como caso de estudio para comparar DreamBooth-LoRA frente a otras técnicas (Textual Inversion, IP-Adapter) sobre Krea 2.
- **Contenido para redes o demos**: generar imágenes temáticas de un personaje concreto para publicaciones, siempre que se respete la licencia Apache 2.0 y las condiciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` sobre `cuda`, lo que sugiere que se necesita una GPU con al menos 16-24 GB de VRAM para el modelo base en bf16; el LoRA añade una sobrecarga mínima (1.0 GB en disco).
- **GPU recomendadas**: no especificadas. Por el uso de bf16 y el pipeline de difusión, se puede inferir que se requiere una GPU moderna (A100, H100, RTX 4090 o similar), pero no hay dato confirmado.
- **¿Cabe en consumer GPU?**: no confirmado. Depende del tamaño del modelo base Krea 2, que no se detalla en la información proporcionada.
- **Opciones de despliegue**: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (único método documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- **Latencia y throughput**: no disponibles. Las muestras se generaron con 8 pasos, lo que sugiere baja latencia en Turbo, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros adaptadores LoRA comparables sobre Krea 2, ni de modelos de personalización alternativos (Textual Inversion, IP-Adapter) con métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados. Al ser un adaptador entrenado sobre un concepto concreto, puede heredar sesgos del dataset de entrenamiento y del modelo base Krea 2, pero no se especifican.
- **Riesgo de alucinación**: en modelos de difusión, el equivalente es la generación de artefactos visuales o la deriva del concepto cuando el prompt se aleja del dominio de entrenamiento. No se documenta.
- **Limitaciones de contexto o idioma**: no se especifican; los prompts de ejemplo están en inglés y no hay evidencia de soporte multilingüe.
- **Restricciones de licencia**: el adaptador declara Apache 2.0, pero el modelo base `krea/Krea-2-Raw` puede tener sus propias condiciones. Es imprescindible revisar la licencia del modelo base antes de uso comercial.
- **Caveats para producción**: el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria. La model card no documenta el dataset de entrenamiento, los hiperparámetros ni las limitaciones, lo que dificulta evaluar su robustez. El tamaño de 1.0 GB sugiere un LoRA de rango relativamente alto, pero no se confirma.
- **Dependencia del modelo base**: el adaptador no funciona de forma autónoma; requiere cargar `krea/Krea-2-Turbo` (o RAW) y aplicar el LoRA. Cualquier cambio en el pipeline de Krea 2 puede romper la compatibilidad.

## Enlaces

- [Hugging Face: klungkunboy/alicialiliv2](https://huggingface.co/klungkunboy/alicialiliv2)
- [Modelo base: krea/Krea-2-Raw](https://huggingface.co/krea/Krea-2-Raw)
- [Modelo Turbo: krea/Krea-2-Turbo](https://huggingface.co/krea/Krea-2-Turbo)
- [Documentación de diffusers](https://huggingface.co/docs/diffusers)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
