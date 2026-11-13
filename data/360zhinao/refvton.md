# 360ZhiNao/RefVTON

## Resumen

RefVTON es un modelo de prueba virtual (virtual try-on) de persona a persona desarrollado por 360ZhiNao (Qihoo 360), diseñado para superponer una prenda objetivo sobre la imagen de una persona. Su particularidad frente a propuestas anteriores es que incorpora una imagen de referencia adicional: otra persona vistiendo la misma prenda, lo que permite al modelo preservar con mayor fidelidad la textura del tejido y los detalles de diseño de la ropa. El modelo se apoya en el backbone Flux-Kontext y se distribuye mediante pesos LoRA, lo que reduce el coste de almacenamiento y despliegue.

La propuesta resuelve un problema práctico del comercio electrónico: los modelos de try-on clásicos reciben únicamente la imagen de la prenda y la persona, perdiendo información sobre cómo cae o se arruga el tejido en un cuerpo real. RefVTON permite usar como entrada una imagen de referencia con la prenda puesta para mejorar la fidelidad del resultado. Funciona tanto como modelo de inpainting (colocando la prenda en la zona enmascarada) como en modo de transferencia directa sobre el cuerpo.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato `.safetensors` a dos resoluciones (512x384 y 1024x768), y va acompañado de un informe técnico en arXiv (2511.00956). Está orientado a inferencia en inglés y su pipeline declarado es image-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion basado en Flux-Kontext con adaptadores LoRA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos en bf16 para inferencia segun el ejemplo) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (LoRA: `512_384_pytorch_lora_weights.safetensors`, `1024_768_pytorch_lora_weights.safetensors`) |

## Arquitectura y entrenamiento

RefVTON se construye sobre el modelo de difusion Flux-Kontext, al que se le aplican adaptadores LoRA entrenados específicamente para la tarea de prueba virtual. El modelo opera en dos modos: como modelo de inpainting, colocando la prenda objetivo en las regiones enmascaradas de la imagen de la persona, o como transferencia directa de la prenda sobre el cuerpo. La innovación principal es la incorporación de una imagen de referencia adicional (otra persona vistiendo la misma prenda) que actúa como guía visual para preservar la textura del material y los detalles de diseño.

El entrenamiento emplea datos generados por el propio equipo: dado que los conjuntos públicos VITON-HD y DressCode no incluyen imágenes de referencia con la prenda puesta, los autores generan estas referencias sintéticamente usando Flux-Kontext y Qwen2.5-VL-32B (a través de un script `generate_reference.py`). El modelo puede evaluarse también en modo sin referencia sobre VITON-HD y DressCode. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Prueba virtual de persona a persona: superpone una prenda objetivo sobre la imagen de una persona manteniendo la pose y el cuerpo.
- Modo inpainting: coloca la prenda en las regiones enmascaradas de la imagen.
- Modo de transferencia directa: aplica la prenda sobre el cuerpo sin máscara explícita.
- Uso de imagen de referencia adicional: una imagen de otra persona vistiendo la prenda mejora la preservación de textura y detalles.
- Funcionamiento sin referencia sobre benchmarks públicos (VITON-HD, DressCode).
- Generación de imágenes a dos resoluciones: 512x384 y 1024x768.
- Capacidades multilingües: limitadas al inglés según la model card.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Prueba virtual en comercio electrónico: el modelo permite al cliente subir una foto propia y una imagen de referencia con la prenda puesta para obtener una previsualización realista del resultado, mejorando la decisión de compra y reduciendo devoluciones.
- Generación de catálogos de moda: a partir de una foto de producto y una imagen de referencia, el equipo de marketing puede generar imágenes de la prenda sobre distintos modelos sin sesiones fotográficas adicionales.
- Sustitución de prendas en fotografía de producto: usando el modo inpainting, se puede cambiar la prenda de una imagen existente preservando la pose y el fondo originales.
- Evaluación de fidelidad de tejidos: gracias a la imagen de referencia, el modelo resulta adecuado para prendas con texturas complejas (punto, denim, seda) donde los modelos sin referencia pierden detalle.
- Integración en pipelines de generación de contenido: el script de inferencia acepta `accelerate` con múltiples procesos, lo que facilita el procesamiento por lotes en entornos de producción.
- Investigación en síntesis de imagen condicionada: el modelo sirve como base para experimentos de transferencia de prendas y como referencia para comparar métodos con y sin imagen de referencia.
- Personalización de avatares: generación de imágenes de un mismo avatar con distintas prendas para aplicaciones de moda virtual o videojuegos.

## Benchmarks y rendimiento

La model card indica que el modelo alcanza "state-of-the-art performance on public benchmarks" y menciona métricas de evaluación (FID, KID, SSIM, LPIPS) sobre VITON-HD y DressCode, pero no se incluyen los valores numéricos en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al apoyarse en Flux-Kontext en bf16, se requiere una GPU con memoria suficiente para el backbone completo más los adaptadores LoRA.
- GPU recomendadas: el ejemplo de inferencia usa `accelerate launch --num_processes 8`, lo que sugiere despliegue multi-GPU; no se especifican modelos concretos (A100, H100, RTX 4090).
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: script de inferencia propio (`inference.py`) con `accelerate`, precisión mixta `bf16`, batch size 1. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de imagen en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Referencia adicional | Resoluciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RefVTON | Difusión (Flux-Kontext + LoRA) | Sí | 512x384, 1024x768 | Apache 2.0 | Pesos LoRA en HF |
| VITON-HD (baseline) | GAN | No | 1024x768 | No disponible | Código público |
| DressCode (baseline) | GAN | No | No disponible | No disponible | Código público |

No se dispone de datos comparativos de rendimiento numérico entre RefVTON y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse con datasets de moda, es probable que herede sesgos de representación corporal y demográficos de dichos datos.
- Riesgo de alucinación visual: como modelo generativo, puede producir texturas o detalles de prenda inexistentes, especialmente en modo sin referencia.
- Limitaciones de idioma: la model card declara únicamente inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el backbone Flux-Kontext subyacente puede tener sus propias condiciones que deben verificarse.
- Caveat de producción: el conjunto de datos completo con imágenes de referencia aún no se ha publicado; solo hay un pequeño conjunto de test. La generación de referencias requiere pesos de Flux-Kontext y Qwen2.5-VL-32B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.
- La evaluación sin referencia sobre VITON-HD y DressCode requiere que las rutas de datos contengan "viton" o "DressCode" para activar los modos correspondientes.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/RefVTON
- Hugging Face (alternativo citado en la model card): https://huggingface.co/qihoo360/RefVTON
- arXiv (informe técnico): https://arxiv.org/abs/2511.00956
- GitHub: https://github.com/360CVGroup/REFVTON
- VITON-HD (dataset): https://github.com/shadow2496/VITON-HD
- DressCode (dataset): https://github.com/aimagelab/dress-code
