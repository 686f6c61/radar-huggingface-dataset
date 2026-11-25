# Jianqiao1/MiniMax-H3-Image-Lossless-Pruned-ComfyUI

## Resumen

MiniMax-H3-Image-Lossless-Pruned-ComfyUI es un checkpoint derivado y podado del modelo de generación y edición de imágenes MiniMax-H3-Image de MiniMaxAI, publicado por el usuario Jianqiao1. No se trata de un modelo entrenado desde cero, sino de una conversión optimizada para ComfyUI que aplica la técnica de poda WaveCut: precalcula la modulación temporal (AdaLN) en una rejilla fija de timesteps y sustituye la red de modulación temporal por un codificador one-hot compacto y proyecciones. El resultado es una reducción del checkpoint BF16 de aproximadamente 66,3 GB a 40,2 GB, con una variante INT8 ConvRot de unos 21,0 GB.

La relevancia de esta ficha radica en que el autor afirma equivalencia píxel a píxel con el modelo completo BF16 en la ruta de condicionamiento por imagen de referencia dentro de ComfyUI, manteniendo las cinco comparaciones realizadas con RGB idéntico. Esa equivalencia no se sostiene en modo texto-a-imagen puro ni frente al pipeline original de Transformers/Diffusers, y la variante INT8 introduce error de cuantización adicional. El modelo está pensado para despliegue local en ComfyUI con el nodo nativo Load Diffusion Model / UNETLoader, sin nodos personalizados.

El repo ocupa 61,8 GB y contiene los dos checkpoints publicados (BF16 e INT8), además de los activos de comparación. La licencia es la MiniMax-H3-Image Community License Agreement del modelo base, por lo que se trata de un derivado sujeto a las condiciones del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (base MiniMax-H3-Image) con poda WaveCut de la red de modulación temporal AdaLN; no se detalla la arquitectura interna del backbone en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint podado) e INT8 ConvRot (checkpoint cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (MiniMax-H3-Image Community License Agreement) |
| Formato de pesos | safetensors (checkpoints para ComfyUI) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3-Image es un modelo de difusión para generación y edición de imágenes. Esta ficha no dispone de detalles sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO; esa información no está presente en la documentación proporcionada.

La innovación técnica de este derivado es la poda WaveCut, descrita en el repositorio github.com/iamwavecut/MiniMax-H3-Image-Pruned. Consiste en precalcular la modulación temporal en los timesteps fijos de muestreo y reemplazar la red de modulación temporal grande por un codificador one-hot de tiempo y proyecciones compactas. El autor adaptó el método a la ruta de imagen de referencia de ComfyUI, capturando la modulación AdaLN del modelo BF16 completo. En la variante BF16 se conservan los pesos del backbone restante; en la variante INT8 se cuantiza el backbone manteniendo los pesos de modulación en BF16. Los valores de modulación provienen del modelo BF16 completo ejecutándose en ComfyUI, y el checkpoint base completo en BF16 procede de AI-KSK/MiniMax-H3-Image-Full-BF16-ComfyUI, con checkpoints de comparación de Comfy-Org.

## Capacidades

- Generación de imágenes texto-a-imagen, aunque el autor advierte que en modo texto-a-imagen puro sin referencia la calidad es inferior, con texturas toscas.
- Edición y generación condicionada por imagen de referencia: el modelo está específicamente adaptado a la ruta de referencia de ComfyUI, y una imagen de referencia (incluso completamente negra) mejora los resultados.
- Generación a alta resolución: las pruebas documentadas se realizaron a 4096 × 4096.
- Muestreo con rejilla fija de seis pasos y un schedule sigma personalizado recomendado por el pipeline original.
- Integración nativa en ComfyUI mediante Load Diffusion Model / UNETLoader, sin nodos personalizados.
- Soporte de CPU offloading cuando la VRAM es insuficiente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; no disponibles.

## Casos de uso

- Generación de imágenes de alta resolución en local: el checkpoint BF16 podado de 40,2 GB permite producir imágenes a 4096 × 4096 en ComfyUI con una reducción de almacenamiento de unos 26 GB respecto al modelo completo, manteniendo equivalencia píxel a píxel en la ruta de referencia.
- Edición condicionada por imagen de referencia: flujos en los que se parte de una imagen guía (incluida una imagen negra de las mismas dimensiones que la salida) para estabilizar la generación, aprovechando que el checkpoint captura la modulación de esa ruta.
- Despliegue en estaciones con VRAM limitada: la variante INT8 ConvRot de 21,0 GB reduce los requisitos de memoria y almacenamiento, a costa de introducir error de cuantización no equivalente al BF16.
- Prototipado rápido de pipelines de difusión en ComfyUI: al cargar con el nodo nativo UNETLoader, se integra en grafos existentes sin dependencias de nodos personalizados.
- Reproducción de resultados con semilla fija: el uso de una rejilla de seis pasos, Euler, CFG 1 y un schedule sigma concreto permite repetir experimentos de forma controlada en el entorno documentado.
- Evaluación comparativa de técnicas de poda: sirve como referencia para comparar checkpoints podados frente al modelo completo BF16 y frente a las versiones de Comfy-Org, con imágenes de comparación publicadas.
- Generación de imágenes de referencia para flujos de posproducción: texturas, piel, cabello y textiles finos aparecen entre los escenarios evaluados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor documenta únicamente comparaciones visuales cualitativas y de equivalencia píxel a píxel: cinco prompts, 25 imágenes de prueba, misma semilla por prompt, resolución 4096 × 4096, imagen de referencia negra a tamaño completo, Euler, CFG 1 y seis pasos de muestreo, ejecutado en ComfyUI 0.45.0 sobre una RTX 5090 con Comfy Kitchen Attention. El resultado declarado es que las cinco comparaciones del checkpoint BF16 podado coinciden píxel a píxel en RGB con el modelo completo BF16 en la ruta de referencia; la variante INT8 no preserva esa equivalencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma numérica. El checkpoint BF16 ocupa 40,2 GB en disco y el INT8 unos 21,0 GB; la VRAM necesaria para inferencia no se detalla.
- GPU recomendadas: el autor reporta pruebas en una RTX 5090. No se especifican otras GPU validadas.
- GPU de consumo: no se confirma que quepa en GPU de consumo distintas de la RTX 5090 empleada en las pruebas; no disponible.
- Despliegue: ComfyUI con Load Diffusion Model / UNETLoader, con CPU offloading opcional si la VRAM es insuficiente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles. Las pruebas usan seis pasos de muestreo, Euler y CFG 1, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Image Full BF16 (M1) | no disponible | no disponible | 66,3 GB | MiniMax-H3-Image Community License | Baseline completo, sin poda |
| Este modelo, BF16 podado (M2) | no disponible | no disponible | 40,2 GB | MiniMax-H3-Image Community License | Equivalencia píxel a píxel en ruta de referencia |
| Comfy-Org pruned BF16 (M3) | no disponible | no disponible | 40,2 GB | MiniMax-H3-Image Community License | Checkpoint podado alternativo de Comfy-Org |
| Comfy-Org INT8 ConvRot (M5) | no disponible | no disponible | 21,0 GB | MiniMax-H3-Image Community License | Cuantización INT8, con error de cuantización |
| Este modelo, INT8 ConvRot (M4) | no disponible | no disponible | 21,0 GB | MiniMax-H3-Image Community License | INT8 con modulación BF16 capturada de la ruta de referencia |

No se dispone de datos de parámetros, contexto ni benchmarks para comparar con modelos de otras familias; no disponible.

## Limitaciones y advertencias

- La equivalencia píxel a píxel solo está verificada en la ruta de imagen de referencia de ComfyUI, con la rejilla fija de timesteps, seis pasos, Euler, CFG 1 y el entorno de prueba descrito; no se garantiza en otras configuraciones.
- En modo texto-a-imagen puro sin referencia, el modelo produce resultados de menor calidad y no preserva equivalencia con el modelo completo, porque el original redondea de forma distinta con y sin referencia.
- No se reclama equivalencia píxel a píxel frente al pipeline original de Transformers/Diffusers; las pruebas se hicieron exclusivamente con la implementación de ComfyUI.
- La variante INT8 introduce error de cuantización en el backbone y no mantiene la equivalencia píxel a píxel.
- El schedule sigma personalizado de seis pasos es necesario para acercarse a la calidad del pipeline original; usar otra configuración puede degradar los resultados.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación visual (artefactos, texturas incorrectas): el autor reporta texturas toscas en modo sin referencia, pero no se cuantifica.
- Licencia: se trata de un checkpoint derivado sujeto a la MiniMax-H3-Image Community License Agreement; es necesario revisar sus términos antes de cualquier uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 25 de noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria.
- Idiomas soportados no disponibles; al ser un modelo de imagen, la relevancia de este dato es limitada, pero no se documenta el soporte multilingüe de los prompts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jianqiao1/MiniMax-H3-Image-Lossless-Pruned-ComfyUI
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Checkpoint BF16 completo de AI-KSK: https://huggingface.co/AI-KSK/MiniMax-H3-Image-Full-BF16-ComfyUI
- Checkpoints de comparación de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Método de poda WaveCut: https://github.com/iamwavecut/MiniMax-H3-Image-Pruned
