# Jojocodex/minimax-h3-spatial-physics-lora

## Resumen

El modelo **Jojocodex/minimax-h3-spatial-physics-lora** es un adaptador LoRA diseñado para el modelo de generación de vídeo **MiniMax-H3** (de Comfy-Org). Desarrollado por el usuario Jojocodex, este LoRA tiene como objetivo dotar al modelo base de capacidades mejoradas de razonamiento espacial y física de objetos, permitiendo generar vídeos donde los elementos interactúan de forma coherente: colisiones, apilamientos, caídas, deslizamientos y oclusiones. Se trata de una especialización que no cubre movimiento humano, centrándose exclusivamente en la dinámica de objetos inanimados.

El adaptador se distribuye bajo licencia Apache-2.0 y ocupa aproximadamente 0.2 GB en formato safetensors. Está entrenado sobre un subconjunto de 700 clips procedentes de datasets públicos de razonamiento físico (CLEVRER, WISA y PhyCo-Kubric) y se integra fácilmente en ComfyUI mediante un nodo LoraLoader. Su relevancia radica en que permite a modelos de vídeo genéricos producir escenas con física más plausible sin necesidad de reentrenar el modelo completo, un aspecto crítico para aplicaciones de simulación, animación y generación de contenido educativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre MiniMax-H3 (modelo de difusión de vídeo) |
| Parametros totales | No disponible (rank 16, archivo ~0.2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | No especificado (prompts en inglés en los ejemplos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) que modifica las capas de atención del modelo base MiniMax-H3, un transformer de difusión para generación de vídeo. El entrenamiento se realizó con el framework **ai-toolkit**, con un rank de 16 y resolución de 512×512 píxeles, generando secuencias de 90 fotogramas a 24 fps. Los datos de entrenamiento provienen de tres datasets públicos de física y razonamiento espacial: CLEVRER (eventos de colisión y movimiento), WISA (interacciones entre objetos) y PhyCo-Kubric (escenas físicas sintéticas). En total se utilizaron 700 clips con captions puramente espaciales y físicos, sin incluir personajes ni descripciones de apariencia.

Una innovación destacable es el recorte de las capas `adaln_proj` (417 claves eliminadas), lo que hace al LoRA compatible con el acelerador Turbo de MiniMax-H3, permitiendo apilarlo con otros adaptadores de aceleración sin conflicto. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Generación de vídeos con física de objetos realista: colisiones, apilamientos, caídas, deslizamientos y oclusiones.
- Razonamiento espacial de objetos puros, sin dependencia de movimiento humano.
- Activación mediante prompts descriptivos en lenguaje natural (sin trigger word fijo), por ejemplo: "a red ball rolls off the table and falls to the floor".
- Compatible con ComfyUI mediante LoraLoader, con fuerza recomendada entre 0.8 y 1.0.
- Integración con el acelerador Turbo de MiniMax-H3 para inferencia más rápida.
- Soporte para escenas con múltiples objetos y relaciones espaciales complejas.

## Casos de uso

- **Simulación de escenas para animación**: un estudio puede usar el LoRA para generar rápidamente storyboards animados donde objetos interactúan físicamente (una pelota que rebota, bloques que se derrumban), ahorrando tiempo en previsualización.
- **Creación de contenido educativo de física**: profesores pueden generar vídeos que ilustran conceptos como conservación del momento o energía potencial, describiendo escenas como "un péndulo golpea una pila de cajas" y obteniendo vídeos coherentes.
- **Generación de assets para videojuegos**: diseñadores pueden crear clips de prueba de mecánicas de física (caídas, colisiones) sin necesidad de motores físicos complejos, integrando el LoRA en pipelines de generación procedural.
- **Prototipado de escenas para publicidad**: agencias pueden generar vídeos conceptuales de productos que caen, se apilan o ruedan, para presentar ideas a clientes antes de la producción real.
- **Investigación en visión por computador**: el LoRA permite generar datasets sintéticos de vídeo con anotaciones físicas implícitas, útiles para entrenar modelos de predicción de movimiento o interacción.
- **Aumento de datos para robótica**: se pueden crear vídeos de objetos manipulados (deslizamientos, apilamientos) para entrenar sistemas de percepción y planificación de movimiento en entornos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de rendimiento ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos específicos para este LoRA.
- Dado que es un adaptador sobre MiniMax-H3, se requiere la infraestructura del modelo base. MiniMax-H3 es un modelo de difusión de vídeo de gran tamaño (varios GB), por lo que se recomienda una GPU con al menos 24 GB de VRAM para inferencia a 512×512.
- Para despliegue en producción, se sugiere usar ComfyUI (entorno recomendado por el autor) o frameworks compatibles con modelos de difusión de vídeo (por ejemplo, Diffusers de HuggingFace si se adapta).
- El LoRA añade una sobrecarga mínima de memoria (0.2 GB), por lo que el cuello de botella principal es el modelo base.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros LoRAs específicos para física espacial en generación de vídeo con los que comparar directamente.

## Limitaciones y advertencias

- **Alcance limitado a objetos**: el LoRA no cubre movimiento humano ni animación de personajes, como advierte explícitamente el autor.
- **Dependencia del modelo base**: requiere MiniMax-H3 (Comfy-Org) para funcionar; no es un modelo autónomo.
- **Posibles alucinaciones físicas**: aunque mejora la coherencia, en escenas complejas o con múltiples interacciones puede generar comportamientos no realistas.
- **Datos de entrenamiento limitados**: solo 700 clips, lo que puede limitar la generalización a escenarios no representados en los datasets originales.
- **Sesgos de los datasets**: CLEVRER y PhyCo-Kubric son entornos sintéticos, por lo que la física aprendida puede no transferirse perfectamente a entornos reales.
- **Licencia Apache-2.0**: permite uso comercial y modificación, pero se debe mantener la atribución y no se ofrece garantía.
- **Sin información sobre seguridad o sesgos éticos**: no se documentan evaluaciones de sesgo o contenido dañino.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Jojocodex/minimax-h3-spatial-physics-lora)
- [Modelo base MiniMax-H3 (Comfy-Org)](https://huggingface.co/Comfy-Org/MiniMax-H3)
