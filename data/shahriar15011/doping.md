# shahriar15011/Doping

## Resumen

Doping es un modelo generativo de imagen de dominio muy restringido, desarrollado por Shahriar Mahmud (vinculado al proyecto Neather Launcher), que sintetiza skins de Minecraft de 64×64 píxeles en formato RGBA a partir de una semilla aleatoria. No acepta prompts de texto: es un modelo de generación incondicional, de modo que cada semilla produce una skin nueva y directamente utilizable en el juego. Con 46,97 millones de parámetros y entrenado desde cero, se posiciona como una alternativa ligera y autoalojable frente a pipelines de difusión de gran escala para esta tarea concreta.

La relevancia del modelo es acotada pero clara: cubre un nicho (generación procedural de skins de Minecraft) con un coste computacional mínimo, licencia Apache 2.0 y un notebook de Colab que funciona en una GPU T4 gratuita. El repositorio ocupa 0,1 GB, lo que facilita su descarga y despliegue en entornos con recursos limitados.

No se dispone de información sobre el volumen del dataset de entrenamiento, la composición de los datos ni los resultados de evaluación. La model card está truncada en el momento de la consulta, por lo que varios detalles técnicos (arquitectura exacta del U-Net, configuración del flow matching, número de pasos de muestreo) no pueden confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con flow matching (rectified flow); entrenado desde cero |
| Parametros totales | 46,97 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (generación incondicional de imagen; sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo sin entrada de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene pesos PyTorch; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo emplea una U-Net entrenada desde cero con un objetivo de flow matching (rectified flow), una formulación de modelos generativos que aprende un campo de velocidad que transporta una distribución de ruido hacia la distribución de datos. En este caso, la distribución objetivo son skins de Minecraft de 64×64 píxeles con canal alfa, lo que da una dimensionalidad de salida muy baja (4.096 píxeles por canal) y explica que un modelo de menos de 50 millones de parámetros sea viable.

La generación es puramente incondicional: la semilla controla la muestra inicial de ruido y, por tanto, la identidad de la skin resultante, pero no existe condicionamiento por texto, etiqueta o imagen de referencia. No se ha publicado información sobre el número de tokens o imágenes de entrenamiento, la procedencia del dataset de skins, ni si se aplicaron etapas de ajuste fino. La model card menciona un parámetro "Best of" en el notebook, que sugiere un muestreo con selección entre varias candidatas, pero no se detalla el criterio de selección.

## Capacidades

- Generación incondicional de imágenes: produce una skin de Minecraft de 64×64 RGBA por cada semilla.
- Soporte de dos variantes de brazos: clásicos y slim, según se indica en la model card.
- Salida directamente utilizable: el PNG generado se puede subir al juego sin postproceso.
- Reproducibilidad por semilla: la misma semilla regenera la misma skin con "Best of = 1".
- Visualización 3D integrada en el notebook de Colab (vistas frontal, trasera, izquierda y derecha, más animación de caminar).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada de texto.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento.

## Casos de uso

- Generación masiva de skins para servidores de Minecraft: el modelo permite crear catálogos de skins únicos iterando semillas, sin coste por inferencia significativo y sin dependencia de servicios externos.
- Herramientas de personalización para launchers: integrado en un launcher como Neather, puede ofrecer al usuario un botón de "skin aleatoria" que genere una variante nueva en cada pulsación.
- Prototipado rápido de assets para mods y packs: los desarrolladores pueden generar variaciones de skins para poblar NPC o personajes secundarios sin encargar arte.
- Investigación educativa en modelos generativos: con 47 millones de parámetros y una salida de 64×64, es un banco de pruebas asequible para experimentar con flow matching y rectified flow en una GPU de consumo.
- Aplicaciones de entretenimiento y demos: el visor 3D del notebook permite mostrar skins rotables en streams, vídeos o demostraciones interactivas.
- Generación de datasets sintéticos: las skins producidas pueden servir para aumentar corpus de entrenamiento de clasificadores o detectores de skins en pipelines de moderación.
- Despliegue en entornos con recursos mínimos: al ocupar 0,1 GB y caber en una T4, puede ejecutarse en instancias gratuitas o en equipos sin GPU dedicada para tareas por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 46,97 millones de parámetros en fp32 el modelo ocupa aproximadamente 188 MB, y en fp16 unos 94 MB, a lo que hay que sumar el estado del sampler y los buffers de activación.
- GPU recomendadas: el notebook oficial está pensado para una NVIDIA T4 gratuita de Colab; cualquier GPU con al menos 4 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, dado el reducido tamaño del modelo.
- Opciones de despliegue: PyTorch nativo y el notebook de Colab proporcionado; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables directamente aquí).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Doping | 46,97 M | Semilla aleatoria | Skin Minecraft 64×64 RGBA | Apache 2.0 | HuggingFace + Colab |
| Stable Diffusion 1.5 (fine-tunes de pixel art) | ~860 M (U-Net) | Prompt de texto | Imagen general, requiere ajuste para skins | CreativeML OpenRAIL-M | Amplia |
| Pixel art GANs / modelos de pixel art de dominio específico | no disponible | Semilla o condicionamiento | Sprites de baja resolución | variable | variable |

No se dispone de información sobre modelos comparables entrenados específicamente para skins de Minecraft con la misma formulación de flow matching. La comparación con Stable Diffusion es orientativa: Doping es aproximadamente 18 veces más pequeño en parámetros y no admite prompts, pero está especializado y es más ligero de desplegar.

## Limitaciones y advertencias

- Generación incondicional: no se puede dirigir el resultado con texto ni con una referencia visual; la única palanca es la semilla.
- Calidad y coherencia no verificadas: no hay benchmarks ni métricas publicadas que permitan estimar la tasa de skins utilizables frente a generaciones defectuosas.
- Sesgos del dataset desconocidos: al no documentarse la procedencia de las skins de entrenamiento, no se puede evaluar la diversidad de estilos ni posibles sesgos de representación.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de artefactos visuales: píxeles inconsistentes o regiones mal alineadas con el mapa UV de la skin.
- Sin soporte de idioma ni de texto: no es un modelo de lenguaje y no debe evaluarse como tal.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset subyacente, que no se documenta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: proyecto reciente y sin validación comunitaria.
- Model card incompleta: falta información sobre el proceso de entrenamiento, los hiperparámetros y el muestreo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shahriar15011/Doping
- Notebook de Colab: https://colab.research.google.com/drive/16rmJO3zTSSj74BzkMXWlVk8n5cVqjBSW?usp=sharing
- Notebook descargable (.ipynb): https://huggingface.co/shahriar15011/Doping/resolve/main/Doping_Colab.ipynb?download=true
- Notebook en HuggingFace: https://huggingface.co/shahriar15011/Doping/blob/main/Doping_Colab.ipynb
- Neather Launcher: https://neatherlauncher.github.io/
- Perfil del autor: https://www.facebook.com/shahriar.mahmud.5686
