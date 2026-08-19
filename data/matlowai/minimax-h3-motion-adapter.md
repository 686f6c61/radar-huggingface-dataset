# MATLOWAI/MiniMax-H3-Motion-Adapter

## Resumen

El modelo MATLOWAI/MiniMax-H3-Motion-Adapter es un adaptador LoRA de rango 16 desarrollado por MATLOWAI para el modelo base MiniMax-H3 (fl2va). Su función es corregir un defecto conocido en el paso de "de-rope" del pipeline de generación de vídeo de ComfyUI-MAINodes: cuando el movimiento es muy rápido, el modelo base sobre-produce y el resultado alterna entre avance y "snap" fotograma a fotograma. Este adaptador, entrenado específicamente para esa tarea, enseña al modelo a gastar el reloj extra en suavidad en lugar de invención.

Se publica como una versión piloto intermedia mientras el autor desarrolla un adaptador más ambicioso que internalice todo el pipeline de dos pasadas. El adaptador es un archivo safetensors de 63 MB, con licencia MIT, y se aplica únicamente al paso de de-rope, no al primer paso de texto a vídeo. Está pensado para usarse con ComfyUI y el paquete de nodos ComfyUI-MAINodes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre MiniMax-H3 (fl2va) |
| Parametros totales | no disponible (solo se indica rank 16, alpha 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (adaptador de video, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16, entrenado sobre el checkpoint MiniMax-H3 fl2va. La tarea de entrenamiento consistió en retener los fotogramas dentro de un "burst" de movimiento (holdout-infilling), mantener el resto como contexto limpio (kept_label 1.0) y predecir los tokens retenidos. Se usaron 38 clips generados por el propio autor, recortados de 15 vídeos creados con MiniMax-H3 (escenas físicas, peleas, cadenas, una placa de diálogo), sin material real ni de terceros.

El entrenamiento duró aproximadamente 4,6 horas en una GPU, con 375 pasos, learning rate 1e-4, optimizador adamw8bit y precisión bf16. El autor utilizó una extensión propia de ai-toolkit para H3, con empaquetado span-aware verificado bit-exact contra ComfyUI. La innovación principal es que el adaptador se entrena específicamente para el paso de de-rope, no para la generación general, lo que permite corregir el comportamiento del modelo base en ese contexto concreto.

## Capacidades

- Mejora la suavidad en movimiento rápido, reduciendo la alternancia advance/snap en los fotogramas.
- Reduce la sobre-producción fotograma a fotograma (de 1.76-2.93 a 1.09-1.23 en las pruebas del autor).
- Se transfiere al checkpoint Ref2VA, por lo que un solo archivo sirve para los grafos fl2va y ref2va.
- Funciona como adaptador para el paso de de-rope en ComfyUI-MAINodes, cargable con un LoraLoaderModelOnly estándar.
- No es un modelo generativo independiente; requiere el modelo base MiniMax-H3 y el pipeline de ComfyUI-MAINodes.

## Casos de uso

- Mejora de escenas de acción con movimiento rápido: el adaptador reduce la alternancia advance/snap en clips de peleas o movimientos bruscos, manteniendo la fluidez sin inventar contenido extra.
- Post-procesado de vídeo generado con MiniMax-H3 en ComfyUI: se aplica únicamente al paso de de-rope, corrigiendo la sobre-producción del modelo base en ese paso concreto.
- Integración en pipelines de generación de vídeo con ComfyUI-MAINodes: el grafo de ejemplo `motion_pipeline_adapter_api.json` permite cargar el adaptador y usarlo directamente en el flujo de trabajo.
- Ajuste de movimiento en clips de diálogo o personajes: con valores de inject bajos (0.45 para diálogo, 0.30 para identidad o props), el adaptador suaviza el movimiento sin degradar la identidad del personaje.
- Animación anime de alta velocidad: en este tipo de contenido el adaptador gana en todas las configuraciones, por lo que es adecuado para producciones de anime con movimiento muy rápido.
- Reducción de artefactos en producción: al disminuir la sobre-producción fotograma a fotograma, se obtienen vídeos más estables y con menos parpadeo, útil para integración en flujos de renderizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El autor proporciona métricas propias de evaluación sobre cuatro clips que el adaptador no vio durante el entrenamiento (una pelea, un anillo de espada anime, un cambio de personaje y un primer plano de diálogo), comparando con el mismo grafo sin adaptador y con un suelo de ruido de misma semilla:

| Metrica | Resultado |
|---|---|
| Mejora de alternancia advance/snap | 4 de 4 clips (4.6 a 6.1 veces el suelo) |
| Sobre-produccion fotograma a fotograma | De 1.76-2.93 a 1.09-1.23 en los cuatro clips |
| Preferencia de operadores ciegos (adaptador vs sin adaptador, misma semilla) | 7 a favor, 0 en contra, 1 sin preferencia |
| Transferencia a Ref2VA | Mismas ganancias en ambos checkpoints |
| Perdida de fidelidad de anclaje en keyframes nativos | Aproximadamente 1 dB |
| Muting de color (saturacion media) | Ref2VA: 46 a 38 (denoise 0.40), 54 a 40 (0.70); fl2va: 54 a 40 (de-rope 3x) |

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPUs concretas en la información disponible.
- El adaptador es un archivo de 63 MB, por lo que su carga en memoria es mínima; el requisito principal es el del modelo base MiniMax-H3, que no se detalla.
- Se usa dentro de ComfyUI, por lo que se requiere una GPU compatible con CUDA y suficiente VRAM para ejecutar MiniMax-H3 y el pipeline de ComfyUI-MAINodes.
- El entrenamiento se realizó en una sola GPU (sin especificar modelo) durante 4,6 horas, lo que sugiere que el adaptador es ligero de entrenar.
- Para inferencia, se recomienda seguir las instrucciones de ComfyUI-MAINodes y cargar el adaptador con un LoraLoaderModelOnly.

## Comparativa con modelos similares

No disponible. No se proporciona información sobre adaptadores de movimiento comparables para MiniMax-H3 u otros modelos de vídeo.

## Limitaciones y advertencias

- Pérdida de fidelidad de anclaje: el adaptador cuesta aproximadamente 1 dB de fidelidad en keyframes nativos, por lo que no es recomendable para contenido donde la fidelidad del anclaje sea crítica.
- Sobre-corrección en contenido calmado: suaviza cadenas que no necesitan suavizado; debe desactivarse en contenido sin movimiento rápido.
- Muting de color y adelgazamiento de efectos de partículas: reduce la saturación y adelgaza efectos como partículas; el efecto es peor en Ref2VA y en pasadas de de-rope completas. Si el color es el sujeto, se debe bajar la fuerza o aceptar la pérdida.
- Sesgo hacia anime: el adaptador funciona muy bien en anime de alta velocidad, pero en trabajo de acción real con personajes requiere valores de inject más bajos.
- Aplicación restringida: debe aplicarse solo al paso de de-rope, no al primer paso de texto a vídeo.
- Mantener el tail guide activado: desactivarlo cuesta identidad aproximadamente 3 veces el suelo, independientemente del adaptador.
- Licencia MIT permite uso comercial, pero el modelo base MiniMax-H3 puede tener su propia licencia; se debe revisar la licencia de MiniMax-H3 antes de usar el adaptador en producción.

## Enlaces

- HuggingFace: https://huggingface.co/MATLOWAI/MiniMax-H3-Motion-Adapter
- Demo page (ejemplos y comparativas): https://matlowai.github.io/ComfyUI-MAINodes/#adapter
- Repositorio ComfyUI-MAINodes (nodos, grafo de ejemplo y notas de ajuste): https://github.com/matlowai/ComfyUI-MAINodes
