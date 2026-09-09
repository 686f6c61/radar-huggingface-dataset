# madmacs5/naomi-krea2-lora

## Resumen

Naomi — Krea 2 Character LoRA es un adaptador de baja adaptación (LoRA) desarrollado por mad_macs para el modelo de difusión Krea 2. Añade la identidad de un personaje ficticio llamado Naomi, de rasgos oscuros y piel cálida, y está pensado para generar imágenes fotorrealistas con iluminación natural y aspecto de luz suave. El repositorio en HuggingFace (madmacs5/naomi-krea2-lora) incluye dos archivos: un LoRA principal de cara/identidad (`naomi_face_v4_blend.safetensors`) y un LoRA complementario de cuerpo delgado (`naomi_slim_body.safetensors`) que puede apilarse para ajustar la silueta en determinados planos. El tamaño total del repositorio es de 1,4 GB.

Se trata de una solución para mantener la consistencia de un personaje concreto sin tener que entrenar un modelo completo. El autor indica que el LoRA de cara fue reentrenado desde cero sobre una fusión de modelos Krea 2 (RawGirl + Realism + DarkBeast merge) para conseguir un mejor bloqueo de identidad y una textura de piel más natural. No se proporcionan datos sobre parámetros totales ni sobre el proceso de entrenamiento, y la longitud de contexto no aplica al ser un modelo de difusión de imágenes.

Este modelo resulta relevante para creadores e investigadores que trabajan con generación de imágenes y necesitan coherencia de personaje en producciones como cómics, concept art o modelaje virtual, aprovechando el trigger word `naomi_face` y el ajuste fino de la fuerza (strength) del LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base Krea 2 (difusión de imágenes) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (generación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`naomi_face_v4_blend.safetensors`, `naomi_slim_body.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un LoRA (Low-Rank Adaptation) que se aplica al modelo base Krea 2. Los LoRAs añaden factores de baja dimensión a las capas del modelo original, permitiendo especializarlo en una identidad concreta sin modificar el modelo completo. En este caso, el LoRA principal está entrenado para capturar el rostro de Naomi, mientras que el LoRA secundario adapta la silueta corporal en planos traseros o de espalda.

Según la información del autor, el LoRA de cara fue reentrenado desde cero sobre una fusión de modelos Krea 2 que combina los checkpoints RawGirl, Realism y DarkBeast, con el objetivo de lograr un bloqueo de identidad más preciso y una piel más natural. No se especifican hiperparámetros, dataset de entrenamiento ni número de pasos. El método de combinación de ambos LoRAs es un apilamiento (stacking) con valores de fuerza distintos: cara a 0,6 y cuerpo delgado a 0,8, utilizando el mismo seed para mantener coherencia.

## Capacidades

- Generación de imágenes fotorrealistas de un personaje ficticio con rasgos oscuros, piel cálida y estilo de luz ambiental suave.
- Control de identidad facial mediante el trigger word `naomi_face`, con una fuerza recomendada de 0,3 (rango útil de 0,2 a 0,5) y un punto óptimo para evitar sangrado de rasgos (identity bleed).
- Ajuste de silueta corporal mediante un LoRA complementario de cuerpo delgado, pensado para planos traseros, de espalda o laterales.
- Compatibilidad con apilamiento de LoRAs: se pueden combinar el LoRA facial y el corporal en una misma generación usando un mismo seed.
- Estilo fotorrealista y natural, orientado a escenas con iluminación diurna suave y retratos realistas.
- No dispone de soporte de tool calling, agentes ni razonamiento de lenguaje, al tratarse exclusivamente de un adaptador de difusión de imágenes.

## Casos de uso

- Retratos consistentes para ilustración de cómics: se genera una serie de viñetas del mismo personaje utilizando `naomi_face` con una fuerza de 0,3, garantizando que las facciones de Naomi no varíen entre viñetas. Resulta adecuado porque el LoRA está entrenado específicamente para bloquear la identidad facial.
- Concept art para videojuegos: se crean variaciones del personaje en distintas poses y atuendos manteniendo el rostro coherente, y se puede añadir el LoRA de cuerpo delgado cuando interese una silueta más estilizada. La combinación por seed favorece la repetición controlada de resultados.
- Perfiles y avatares de marca para redes sociales: se genera una imagen de perfil fotorrealista de un personaje ficticio con iluminación natural, útil para identidades visuales de proyectos creativos. El estilo fotorrealista del LoRA y del modelo base Krea 2 permite resultados presentables.
- Visualización de moda: se usa el LoRA de cuerpo delgado en planos de espalda y laterales para mostrar prendas sobre una silueta más esbelta, mientras el LoRA facial mantiene la identidad. Es adecuado porque el autor recomienda esta combinación justo para ese tipo de encuadres.
- Contenido de entretenimiento para fans: se genera una colección de imágenes de un personaje ficticio que acompaña una historia, con coherencia entre todas las ilustraciones. El control de fuerza y el trigger word facilitan la reproducibilidad.
- Pruebas de iluminación y fondo para fotografía digital: se realizan variaciones rápidas de un mismo personaje bajo diferentes luces y escenarios antes de decidir la composición final, ya que el LoRA mantiene la identidad sin reentrenar ningún modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño combinado de los archivos LoRA es de 1,4 GB, pero la VRAM necesaria la determina el modelo base Krea 2 y la configuración de generación.
- GPU recomendadas: no disponible. Depende completamente del modelo base Krea 2.
- Compatibilidad con GPU de consumo: no disponible. No se ofrecen datos específicos en la información proporcionada; la carga de un LoRA suele ser ligera, pero el modelo base es el factor limitante.
- Opciones de despliegue: no aplica para vLLM, llama.cpp, Ollama o TGI, ya que son frameworks orientados a modelos de lenguaje. Este LoRA se integra en herramientas de difusión de imágenes, aunque no se listan herramientas concretas en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información comparativa con otros LoRAs de personaje para Krea 2 en los datos proporcionados.

## Limitaciones y advertencias

- El personaje Naomi es ficticio y todas las imágenes están generadas por IA; no debe utilizarse para representar a personas reales.
- El LoRA está optimizado para el modelo base Krea 2 con merges concretos (RawGirl + Realism + DarkBeast). Puede no funcionar correctamente con otros modelos base o con configuraciones muy diferentes.
- La fuerza de aplicación es sensible: valores fuera del rango 0,2–0,5 en el LoRA facial pueden provocar pérdida de identidad o sangrado de rasgos en la imagen.
- El LoRA de cuerpo delgado está pensado solo para planos traseros, laterales o de espalda; usarlo en planos frontales puede alterar la silueta de forma no deseada, según advierte el propio autor.
- La licencia no está especificada en HuggingFace, por lo que no se garantiza que el modelo pueda usarse comercialmente. Es necesario contactar con el autor para aclarar los términos.
- El repositorio no presenta descargas ni likes en el momento de la consulta, lo que sugiere baja validación comunitaria o una publicación reciente sin difusión.
- No se dispone de información sobre datos de entrenamiento, lo que impide evaluar posibles sesgos en el generador de imágenes.

## Enlaces

- HuggingFace: [madmacs5/naomi-krea2-lora](https://huggingface.co/madmacs5/naomi-krea2-lora)
- Civitai (tag Krea 2): [https://civitai.com/tag/krea2](https://civitai.com/tag/krea2)
- Civitai (ecosistema Krea 2): [https://civitai.com/ecosystems/krea2](https://civitai.com/ecosystems/krea2)
