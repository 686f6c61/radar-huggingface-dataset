# airesearchteam/Uncensored-Model-Settings-and-Presets

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una colección de recursos de configuración para modelos de texto y de imagen ya existentes. Concretamente, incluye cuatro presets de muestreo (sampler presets) para backends de generación de texto local orientados a roleplay y chat, así como dos librerías de prompts negativos para checkpoints de la familia SDXL y una guía de ajustes de muestreo para SDXL. El autor es el usuario `airesearchteam` y el contenido está marcado explícitamente como no apto para todos los públicos (`not-for-all-audiences`).

La relevancia de este repositorio reside en que ofrece una configuración inicial probada para usuarios que quieren ajustar el comportamiento de modelos de texto como Llama o Mistral en entornos de roleplay, y para quienes usan SDXL y necesitan prompts negativos efectivos. No hay ningún modelo entrenado aquí; se trata de archivos de configuración (JSON y listas de texto) listos para importar o copiar en distintos front-ends.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplicable (no es un modelo, es una colección de presets) |
| Parámetros totales | No aplicable |
| Parámetros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantización | No aplicable |
| Idiomas soportados | No disponible (los presets son agnósticos al idioma, pero la documentación está en inglés) |
| Licencia | CC-BY-4.0 (para los presets y listas) |
| Formato de pesos | No aplicable (archivos JSON y listas de texto plano) |

## Arquitectura y entrenamiento

No hay arquitectura ni entrenamiento porque no se trata de un modelo. El repositorio contiene cuatro presets de muestreo en formato JSON (Balanced, Creative, Stable, Deterministic) con valores para `temperature`, `top_p`, `top_k`, `min_p` y `repetition_penalty`. También incluye dos listas de prompts negativos (una para fotografía y otra para ilustración) y una guía de ajustes de sampler para SDXL (CFG, pasos, sampler y resolución). No hay datos de entrenamiento ni innovaciones técnicas en el sentido de investigación, pero los presets están diseñados para evitar problemas comunes como la deriva del personaje en conversaciones largas o los artefactos de cuantización en modelos pequeños.

## Capacidades

- Presets de muestreo para texto: cuatro configuraciones listas para usar que controlan la aleatoriedad y la repetición en generaciones de chat o roleplay.
- Prompts negativos para SDXL: dos listas separadas (fotográfica e ilustración) que ayudan a reducir artefactos no deseados en imágenes.
- Guía de ajustes de sampler para SDXL: explica qué valores de CFG, pasos y resolución usar y por qué.
- Compatibilidad con la mayoría de backends de texto: los presets usan campos estándar (`temperature`, `top_p`, etc.) que la mayoría de backends leen directamente.
- Documentación de troubleshooting: consejos para diagnosticar errores comunes como negativas a mitad de conversación o deriva de personaje tras 30+ turnos.
- No incluye ningún modelo de IA entrenado; por tanto, no tiene capacidades de generación, razonamiento, visión, ni soporte de tools por sí mismo.

## Casos de uso

- Roleplay local con modelos de texto: los presets `Balanced` y `Creative` son adecuados para sesiones de roleplay con modelos como Mistral 7B o Llama 3, donde se busca un equilibrio entre coherencia y creatividad. Se importan directamente en front-ends como SillyTavern o TextGen WebUI.
- Chat de larga duración: el preset `Stable` está pensado para sesiones de más de 100 turnos, con una repetición penalty de 1.05 y temperatura 0.85, lo que reduce la probabilidad de que el modelo repita frases o se desvíe del tema.
- Comparación reproducible de modelos: el preset `Deterministic` (temperatura 0, repetición 1.0) permite evaluar distintos checkpoints con la misma configuración, útil para benchmarks locales o pruebas A/B.
- Generación de imágenes con SDXL: las listas de prompts negativos se pueden copiar en la interfaz de Automatic1111 o ComfyUI para mejorar la calidad de las imágenes, reduciendo artefactos típicos como dedos malformados o texturas irregulares.
- Optimización de flujo de trabajo en ComfyUI: la guía de sampler settings ofrece valores de CFG, steps y resolución que pueden aplicarse en nodos de ComfyUI para obtener resultados más consistentes.
- Entornos de chat con moderación personalizada: aunque el contenido es NSFW, los presets pueden usarse en chats con restricciones de contenido si se combina con un sistema de prompts adecuado, aunque no se incluye ningún filtro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene un modelo, por lo que no hay métricas de calidad de generación, latencia ni throughput asociadas.

## Requisitos de hardware

- No se requiere hardware específico para usar los presets, ya que son archivos de configuración.
- Para usar los presets de texto se necesita un backend de generación local (como llama.cpp, vLLM, o Ollama) que soporte los campos estándar de sampler. La VRAM dependerá del modelo que se use, no de estos presets.
- Para usar los prompts negativos y la guía de SDXL se necesita una GPU con al menos 8 GB de VRAM para SDXL en su resolución nativa (1024x1024), aunque se puede reducir a 6 GB con optimizaciones.
- Opciones de despliegue: los presets se pueden importar en front-ends como SillyTavern, TextGen WebUI, KoboldAI, o usar directamente con backends como llama.cpp o TGI.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo, por lo que no se puede comparar con otros modelos de IA. Los recursos que contiene son complementarios a modelos existentes, no una alternativa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto ni imágenes por sí mismo. Solo contiene configuraciones para otros modelos.
- Contenido explícito: el repositorio está marcado como `not-for-all-audiences` y el enlace externo que aparece en la model card dirige a una página de comparación de generadores NSFW. Se recomienda precaución en entornos profesionales o educativos.
- Compatibilidad variable: no todos los front-ends aceptan presets en formato JSON; algunos requieren importarlos a través de su propio menú, lo que puede dar errores si se hace mal.
- Artefactos de cuantización: el autor señala que las negativas a mitad de conversación suelen deberse a cuantizaciones por debajo de Q4, y sugiere subir un nivel de cuantización antes de modificar el prompt del sistema.
- Deriva de personaje: el preset `Stable` ayuda a mitigar la deriva en conversaciones largas, pero no la elimina por completo; se recomienda reinyectar un resumen de 60-80 tokens si la conversación supera los 30 turnos.
- La licencia CC-BY-4.0 aplica solo a los presets y listas; el resultado de su uso (texto o imágenes generadas) depende del checkpoint que se utilice, por lo que hay que revisar la licencia de cada modelo antes de uso comercial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/airesearchteam/Uncensored-Model-Settings-and-Presets
- Página de comparativa de generadores (enlace de la model card): https://top-ai-nsfw.pages.dev
