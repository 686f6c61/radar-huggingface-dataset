# guillekenzo/aros-af6fb701-Roxy

## Resumen

`guillekenzo/aros-af6fb701-Roxy` es un adaptador LoRA de tipo DreamBooth para generación de texto a imagen, entrenado sobre el modelo base `krea/Krea-2-Raw` y pensado para su uso con la variante `krea/Krea-2-Turbo`. Lo publica el usuario de Hugging Face `guillekenzo`, que mantiene un catálogo amplio de LoRAs de temática similar bajo la misma convención de nombres (`aros-<hash>-<nombre>`). El adaptador inyecta un concepto concreto, invocado mediante el token de activación `jsmx woman`, que según los ejemplos de la model card produce retratos y escenas de una mujer en distintos entornos (interior, exterior, fondo neutro).

Se trata de un artefacto de personalización, no de un modelo fundacional: no aporta capacidades nuevas de razonamiento ni de lenguaje, sino que especializa el prior visual del modelo base hacia un sujeto concreto. Su relevancia es práctica para quien ya trabaje con el ecosistema Krea 2 y quiera reproducir una identidad visual consistente sin reentrenar el modelo completo. El repositorio ocupa 0,4 GB, un tamaño coherente con un conjunto de pesos LoRA en precisión alta más las imágenes de muestra.

La información pública es muy escasa: la model card se limita al token de activación, tres prompts de ejemplo y un fragmento de código para `diffusers`. No se documentan hiperparámetros de entrenamiento, composición del dataset, número de pasos ni métricas de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre un modelo de difusión texto-a-imagen; arquitectura del base no detallada en la información disponible |
| Parametros totales | no disponible (repo de 0,4 GB; los pesos LoRA son un subconjunto de bajo rango) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusión; la longitud de prompt efectiva la fija el modelo base) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial usa `torch.bfloat16` |
| Idiomas soportados | no disponible (el prompt de ejemplo está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors para `diffusers` (formato LoRA); no se declara GGUF |
| Modelo base | `krea/Krea-2-Raw` (entrenamiento); inferencia de ejemplo sobre `krea/Krea-2-Turbo` |
| Token de activación | `jsmx woman` |
| Librería | `diffusers` |
| Pipeline | `text-to-image` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth, es decir, un conjunto de matrices de bajo rango que se insertan en las capas del modelo de difusión base y se entrenan con un número reducido de imágenes de un sujeto concreto. El autor indica que el entrenamiento se realizó sobre `krea/Krea-2-Raw` y que las muestras publicadas se generaron aplicando el LoRA sobre `krea/Krea-2-Turbo` con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere un uso orientado a la variante destilada de pocos pasos.

No se especifican en la información disponible el número de imágenes de entrenamiento, la resolución, el rango del LoRA, la tasa de aprendizaje, el número de pasos ni si se aplicaron técnicas adicionales (regularización, captioning por recorte, etc.). Tampoco se documenta ninguna innovación técnica más allá del procedimiento estándar de DreamBooth-LoRA.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por el modelo base Krea 2, con especialización en un sujeto concreto invocado mediante `jsmx woman`.
- Reproducción consistente de una identidad visual (rostro y apariencia) en distintos contextos descritos en el prompt: interiores, exteriores y fondos neutros.
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers` mediante `load_lora_weights`.
- Funcionamiento en modo de pocos pasos sobre Krea 2 Turbo (8 pasos en los ejemplos), lo que reduce el coste de inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento; no aplican a un LoRA de difusión.
- Cobertura multilingüe del prompt: no disponible; los ejemplos están en inglés.

## Casos de uso

- Producción de retratos consistentes de un personaje: el LoRA permite generar la misma identidad en múltiples escenas manteniendo el token `jsmx woman` en el prompt, útil para storyboards, cómics o narrativa visual seriada.
- Pruebas de concepto para branding de personaje: generar variaciones de entorno (interior, exterior, fondo neutro) de un mismo sujeto para evaluar su lectura visual antes de invertir en un rodaje o en un modelo entrenado a mayor escala.
- Ilustración para publicaciones: crear imágenes de acompañamiento para artículos o redes con un personaje recurrente, usando Krea 2 Turbo en 8 pasos para iterar rápido.
- Maquetación de catálogos o fichas de producto con figura humana: el adaptador permite fijar el aspecto del modelo y variar solo el atrezzo y la localización mediante el prompt.
- Base para fine-tuning posterior: al ser un LoRA Apache 2.0 sobre un base identificado, sirve como punto de partida para mezclar con otros LoRAs o continuar el entrenamiento con más imágenes del mismo sujeto.
- Evaluación comparativa de adaptadores: útil para quien investigue la estabilidad de DreamBooth-LoRA sobre Krea 2, ya que el autor publica una familia de adaptadores con la misma convención y permite comparar resultados entre ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud facial, etc.) ni comparaciones con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende enteramente del modelo base Krea 2, que no se detalla en la información proporcionada. El LoRA en sí añade una sobrecarga mínima (repo de 0,4 GB).
- GPU recomendadas: no disponibles en la información. El ejemplo oficial asume una GPU CUDA con `torch.bfloat16`.
- ¿Cabe en GPU de consumo? No disponible; habría que consultar los requisitos de `krea/Krea-2-Turbo`, que no se incluyen aquí.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión).
- Latencia y throughput: no disponibles. El ejemplo usa 8 pasos de inferencia con `guidance_scale=0.0`, lo que en la práctica reduce el coste frente a configuraciones de 20-50 pasos, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Token de activación | Licencia | Documentación |
|---|---|---|---|---|---|
| `guillekenzo/aros-af6fb701-Roxy` | LoRA DreamBooth | `krea/Krea-2-Raw` | `jsmx woman` | Apache 2.0 | Mínima (token, 3 samples, snippet) |
| `guillekenzo/aros-09cc5fd4-MellowDuality` | LoRA (misma familia) | no disponible en la búsqueda | no disponible | Apache 2.0 (según listado) | No consultada |
| `guillekenzo/aros-00ae1a96-Lynx` | LoRA (misma familia) | `krea2` (según tags) | no disponible | Apache 2.0 | No consultada |

No se dispone de información sobre adaptadores equivalentes de otros autores para Krea 2 en el material proporcionado, por lo que la comparación se limita a la propia familia de LoRAs del mismo autor.

## Limitaciones y advertencias

- Documentación muy escasa: no hay datos de entrenamiento, hiperparámetros ni evaluación, lo que impide reproducir el adaptador o estimar su calidad de forma objetiva.
- Riesgo de sobreajuste al sujeto: al ser un DreamBooth con un token específico, puede degradar la diversidad de poses y expresiones o contaminar el prompt cuando no se invoca el token.
- Sesgos: no documentados. Al especializarse en un sujeto concreto ("woman"), puede arrastrar sesgos de género y apariencia del dataset de entrenamiento, que no se describe.
- Alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, artefactos en manos y rostros o incoherencias entre prompt y resultado, especialmente con `guidance_scale=0.0` y solo 8 pasos.
- Licencia Apache 2.0 declarada por el autor, pero conviene verificar la licencia del modelo base `krea/Krea-2-Raw` y `krea/Krea-2-Turbo` antes de un uso comercial, ya que las condiciones del base prevalecen sobre el adaptador.
- Sin garantías de soporte ni mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su robustez.
- El token `jsmx woman` está en inglés; no se documenta comportamiento con prompts en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guillekenzo/aros-af6fb701-Roxy
- Perfil del autor: https://huggingface.co/guillekenzo
- LoRA relacionado de la misma familia: https://huggingface.co/guillekenzo/aros-00ae1a96-Lynx
- Modelo base de entrenamiento: https://huggingface.co/krea/Krea-2-Raw
- Modelo base usado en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
