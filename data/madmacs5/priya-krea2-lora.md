# madmacs5/priya-krea2-lora

## Resumen

El paquete `priya-krea2-lora`, desarrollado por mad_macs, es un adaptador LoRA para el modelo generativo de imágenes Krea 2. Está diseñado para añadir la identidad visual de un personaje ficticio llamado Priya, caracterizado por rasgos indios, ojos marrones oscuros y pelo oscuro. El repositorio contiene dos ficheros de pesos en formato `safetensors`: un LoRA principal de rostro/identidad (`priya_face_v4_blend.safetensors`) y un LoRA opcional para cuerpo esbelto (`priya_slim_body.safetensors`).

El modelo base Krea 2, de Krea AI, es un generador de imágenes orientado a fotorrealismo, y este LoRA se ha entrenado desde cero sobre una mezcla de tres bases Krea 2 (RawGirl, Realism y DarkBeast) para conseguir un bloqueo de identidad más nítido y una piel natural. Al ser un LoRA, no es un modelo independiente: requiere el modelo base para funcionar. La información disponible no incluye datos de parámetros, licencia ni métricas de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible (pesos en `safetensors`) |
| Idiomas soportados | no aplicable (generación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

El modelo se presenta como un par de LoRAs, no como un modelo base. El LoRA principal de rostro (`priya_face_v4_blend.safetensors`) fue reentrenado desde cero sobre una mezcla de tres checkpoints de Krea 2 (RawGirl, Realism y DarkBeast) para mejorar la retención de identidad y la calidad de la piel. El LoRA complementario (`priya_slim_body.safetensors`) está diseñado para combinarse con el anterior y producir una silueta más estilizada. No se detalla la cantidad de tokens de entrenamiento, el dataset utilizado, ni si se aplicaron técnicas como RLHF o DPO, probablemente porque no aplican a un adaptador de difusión.

## Capacidades

- Generación de imágenes fotorrealistas de un personaje de rasgos indios, con trigger word `priya_face`.
- Ajuste de intensidad del LoRA de rostro entre 0.2 y 0.5, siendo 0.3 el valor recomendado para equilibrio entre identidad y fidelidad al prompt.
- Apilamiento de dos LoRAs en una misma sesión: el LoRA de rostro al 0.6 y el LoRA de cuerpo al 0.8, usando la misma semilla, para obtener una vista trasera o lateral con cuerpo esbelto.
- Capacidad de generar composiciones en tomas frontales sin el LoRA de cuerpo, preservando una silueta más curvilínea.
- Optimización para estilos fotorrealistas, iluminación natural y luz diurna suave.
- No ofrece capacidades de texto, tool calling, agentes ni soporte multilingüe, al tratarse de un adaptador para un modelo de difusión.

## Casos de uso

- Ilustración de novelas visuales o cómics digitales: permite mantener la apariencia del personaje Priya de forma consistente a lo largo de múltiples ilustraciones, activando el LoRA de rostro con el trigger word.
- Creación de fanart o contenido de ficción para comunidades de IA generativa: el LoRA es adecuado para generar retratos del personaje en distintas escenas, aprovechando la compatibilidad con Krea 2 y la estética fotorrealista.
- Diseño de personajes para juegos de rol o campañas de worldbuilding: se pueden generar variaciones del mismo personaje con distintos atuendos, fondos o expresiones, manteniendo la identidad facial.
- Generación de imágenes de stock para marcas ficticias o campañas publicitarias conceptuales: la inclusión del LoRA permite usar un rostro recurrente en diferentes piezas visuales sin depender de banco de imágenes.
- Prototipado visual para proyectos de narrativa interactiva: el stack de LoRAs de rostro y cuerpo permite obtener alternativas de figura más esbelta para encuadres concretos, lo que resulta útil al iterar sobre el diseño del personaje.
- Experimentación artística sobre modelos de difusión: sirve como ejemplo de LoRA de identidad combinado con otra adaptación, y puede integrarse en flujos de trabajo de Civitai para evaluación y ajustes de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se aportan datos de comparaciones objetivas con otros modelos, ni métricas de calidad de imagen, identidad o fidelidad de prompt.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un LoRA, el requisito real de memoria depende del modelo base Krea 2, cuyos requisitos no se especifican en la documentación proporcionada.
- GPU recomendada: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: puede cargarse en entornos que soporten LoRAs de Krea 2, como Civitai. No se indican herramientas específicas de servidor (vLLM, llama.cpp, Ollama, TGI)
  porque no aplican a este tipo de adaptador de difusión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparativos con otros LoRAs de personajes, checkpoints de Krea 2 o adaptadores similares. No se conocen alternativas concretas de la misma categoría con las que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El personaje representado es ficticio; todas las imágenes generadas son producto de IA.
- El LoRA de rostro fue reentrenado sobre una mezcla de bases Krea 2, por lo que puede presentar variaciones de identidad si se usa fuera del rango de fuerza recomendado (0.2–0.5).
- El LoRA de cuerpo está destinado a tomas traseras o laterales; en tomas frontales su uso puede restar calidad al resultado o interferir con la silueta deseada.
- No hay una licencia declarada, por lo que el uso comercial es incierto y debe consultarse con el autor antes de explotar el modelo en producción.
- No se dispone de información sobre sesgos, ya que no hay estudios de evaluación publicados.
- La escasez de datos técnicos (parámetros, proceso de entrenamiento, benchmarks) limita la capacidad de evaluar el modelo de forma rigurosa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/madmacs5/priya-krea2-lora
- Ecosistema Krea 2 en Civitai: https://civitai.com/ecosystems/krea2
- Tag de LoRA en Civitai: https://civitai.com/tag/lora
