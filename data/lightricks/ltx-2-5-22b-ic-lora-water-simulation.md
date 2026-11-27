# Lightricks/LTX-2.5-22b-IC-LoRA-Water-Simulation

## Resumen

LTX-2.5-22b-IC-LoRA-Water-Simulation es un adaptador LoRA de tipo IC (In-Context) desarrollado por Lightricks para su modelo base de generación de vídeo LTX-2.5, de 22 000 millones de parámetros. El adaptador está especializado en la simulación de agua en vídeo: a partir de un vídeo de entrada y una referencia, aplica efectos de fluido realistas (ondas, salpicaduras, superficies líquidas, interacción con objetos) manteniendo la estructura temporal y el movimiento del material original. Se distribuye como un único fichero de pesos (diffusion-single-file) de aproximadamente 1 GB, lo que refleja que se trata de un LoRA y no de un modelo completo.

El modelo resuelve un problema concreto del flujo de trabajo VFX y de postproducción: generar simulaciones de agua coherentes temporalmente sin recurrir a motores de fluidos tradicionales ni a costosos pipelines de render. Al ser un LoRA sobre LTX-2.5, hereda las capacidades del modelo base (vídeo a vídeo, control de movimiento, consistencia temporal) y añade un sesgo específico hacia la física del agua. Es relevante ahora porque los modelos de difusión de vídeo han alcanzado calidad suficiente para sustituir parte del trabajo de simulación en producciones ligeras, y este adaptador empaqueta ese conocimiento en un artefacto pequeño y fácil de integrar.

La ficha se basa exclusivamente en la información pública disponible del repositorio de Hugging Face; los detalles de arquitectura interna del LoRA y de los datos de entrenamiento no están publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre el modelo de difusión de vídeo LTX-2.5 |
| Parametros totales | no disponible (el modelo base LTX-2.5 tiene 22 000 millones; el adaptador no declara su recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye como fichero único de difusión; no se listan variantes GGUF/FP8) |
| Idiomas soportados | en (inglés) |
| Licencia | ltx-2.x-community-license (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | diffusion-single-file (fichero único, ~1,0 GB de repositorio) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de tipo IC (In-Context) pensado para inyectarse en el modelo base Lightricks/LTX-2.5, un modelo de difusión de vídeo de 22 000 millones de parámetros. La etiqueta "IC-LoRA" indica que el adaptador condiciona la generación a partir de un contexto de referencia (imagen o vídeo de control) además del propio vídeo de entrada, lo que permite transferir el comportamiento del agua a una secuencia existente sin regenerarla por completo. El pipeline declarado es video-to-video.

No se han publicado en la información disponible el número de pasos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del adaptador. Tampoco se detalla si el LoRA se aplica solo a las capas de atención o también a las capas de proyección temporal del modelo base. El tamaño del repositorio (~1 GB) es coherente con un adaptador de rango moderado sobre un modelo de 22B, no con un modelo completo.

## Capacidades

- Simulación de agua en vídeo: genera ondas, salpicaduras, superficies líquidas y flujos sobre secuencias de entrada, manteniendo la coherencia temporal.
- Video-to-video con control in-context: acepta una referencia que guía el estilo y el comportamiento del fluido.
- Transferencia de efectos VFX: aplica el efecto de agua sobre material existente sin sustituir la escena.
- Preservación de movimiento: al operar sobre un vídeo de entrada, conserva la estructura y el movimiento originales.
- Integración con el ecosistema LTX-2.5: hereda las capacidades del modelo base (consistencia temporal, resolución y control de cámara según lo que ofrezca LTX-2.5).
- Idiomas: las etiquetas solo declaran inglés para prompts y metadatos.
- No se declaran capacidades de tool calling, agentes, audio ni razonamiento multi-paso; es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Postproducción VFX ligera: aplicar agua sobre una toma rodada en seco (por ejemplo, una calle o una maqueta) para generar charcos, lluvia o superficies inundadas sin simulación de fluidos dedicada.
- Previsualización de planos: generar versiones previas de una secuencia con agua para validar encuadre y movimiento antes del render final.
- Publicidad y contenido para redes: añadir efectos de agua a clips de producto (bebidas, cosmética, deporte acuático) de forma rápida y consistente.
- Videojuegos y cinemáticas: producir material de referencia o texturas animadas de agua para prototipos y tráilers.
- Educación y divulgación científica: ilustrar fenómenos de fluidos (olas, corrientes, salpicaduras) sobre grabaciones existentes.
- Restauración y mejora de metraje: reforzar o reconstruir la apariencia del agua en material antiguo o de baja calidad.
- Arte generativo y experimentación: explorar variaciones de simulación de agua sobre una misma toma cambiando la referencia in-context.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base LTX-2.5 (22B), que requiere GPUs de alta gama.
- GPU recomendadas: no disponible en la información; por el tamaño del modelo base, se espera necesitar A100/H100 o equivalentes con suficiente VRAM.
- ¿Cabe en GPU de consumo? No disponible; el adaptador en sí ocupa ~1 GB, pero el modelo base de 22B condiciona el requisito real.
- Opciones de despliegue: no se listan en la información (no se confirman vLLM, llama.cpp, Ollama ni TGI; es un pipeline de difusión de vídeo, no un LLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (LoRA de simulación de agua sobre difusión de vídeo) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar la licencia ltx-2.x-community-license en Hugging Face.
- Licencia "other": es una licencia comunitaria propia de Lightricks; hay que revisar sus términos antes de cualquier uso comercial.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere Lightricks/LTX-2.5 y su pipeline.
- Idiomas: solo se declara inglés, lo que puede limitar prompts en castellano.
- Riesgo de artefactos: como todo modelo de difusión de vídeo, puede producir inconsistencias temporales, parpadeos o físicas de fluido poco realistas en escenas complejas.
- Sesgos: no se documentan sesgos específicos; al ser un modelo de vídeo, puede reflejar sesgos de los datos de entrenamiento del modelo base.
- Sin datos de benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente a alternativas.
- Uso en producción: conviene validar resultados en el pipeline concreto y prever revisión humana en VFX de calidad final.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Water-Simulation
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
