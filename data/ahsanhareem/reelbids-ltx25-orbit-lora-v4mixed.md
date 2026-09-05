# AhsanHareem/reelbids-ltx25-orbit-lora-v4mixed

## Resumen
`reelbids-ltx25-orbit-lora-v4mixed` es un adaptador LoRA desarrollado por AhsanHareem para el modelo de vídeo LTX-2.5. Su función es controlar el movimiento de cámara orbital en la generación de vídeos, permitiendo seleccionar la velocidad de la órbita mediante tokens de activación en el prompt. El repositorio tiene un tamaño de 4.0 GB y no incluye información sobre licencia ni idiomas.

El adaptador se entrenó con un dataset sintético de 14 escenas, 7 velocidades y 3 repeticiones, generado en Blender a 1024×576×97 píxeles y 24 fps. La configuración final utiliza rank 32, alpha 32, módulos de atención y una tasa de aprendizaje de 1e-4 durante 2000 pasos. Según el autor, el paso 1250 es el punto de mayor precisión.

La relevancia de este modelo radica en que un único adaptador cubre un rango continuo de velocidades de órbita (de 0.5 a 5.0), a diferencia de los LoRAs oficiales de LTX-2, que son de un solo velocidad y solo compatibles con la versión 19B. Esto lo hace útil para producción de vídeo con control fino del movimiento de cámara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre LTX-2.5 (modelo de vídeo) |
| Parametros totales | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA de bajo rango (rank 32, alpha 32) que se aplica únicamente a los módulos de atención del modelo base LTX-2.5. Según la información del autor en repos relacionados, LTX-2.5 es un modelo de vídeo de 22B para tareas de image-to-video, aunque el repositorio actual no detalla la arquitectura interna del modelo base.

El entrenamiento se realizó con un dataset sintético de 14 escenas, 7 velocidades y 3 repeticiones, con una resolución de 1024×576×97 píxeles y 24 fps, generado en Blender. La escalera de velocidades no está limitada y cada peldaño es distinto, lo que evita la duplicación de trayectorias de cámara. Se utilizó una tasa de aprendizaje de 1e-4 y 2000 pasos. El autor indica que el run 1 fue la única configuración que produjo un control de velocidad funcional; el run 2, que cambió simultáneamente rank, módulos objetivo, LR y número de pasos, colapsó el dial de velocidad. Se guardaron checkpoints cada 250 pasos, y el paso 1250 es el punto de mayor precisión según el autor.

## Capacidades
- Control de movimiento de cámara orbital en vídeos generados por LTX-2.5.
- Selección de velocidad mediante tokens de activación `rborbit sp05` a `rborbit sp50`, que corresponden a velocidades de 0.5 a 5.0.
- Un único adaptador cubre todo el rango de velocidades, en lugar de requerir un LoRA por velocidad.
- No se especifican capacidades de tool calling, agentes, razonamiento o multimodalidad; el modelo es exclusivamente un adaptador de control de cámara para vídeo.

## Casos de uso
- Producción de vídeo publicitario: el adaptador permite generar planos orbitales alrededor de un producto, ajustando la velocidad del movimiento con el token `rborbit spXX`. Es adecuado porque ofrece control preciso del ritmo visual sin necesidad de reentrenar el modelo.
- Contenido para redes sociales: para reels y vídeos cortos, la velocidad orbital se puede variar entre 0.5 y 5.0, lo que permite crear planos dinámicos que mantienen la atención del espectador.
- Previsualización de escenas 3D: al estar entrenado con datos de Blender, el adaptador reproduce movimientos de cámara orbitales similares a los de un render 3D, útil para previsualizar animaciones antes del renderizado final.
- Cinemáticas de videojuegos: los planos envolventes alrededor de personajes o entornos se pueden generar directamente con LTX-2.5, ahorrando tiempo en la producción de cinemáticas.
- Vídeos musicales: la órbita controlada permite rodar planos alrededor de artistas o instrumentos, con velocidades ajustables para sincronizar con el ritmo de la música.
- Arquitectura e interiorismo: generar recorridos orbitales alrededor de modelos de espacios o edificios, facilitando la presentación de proyectos a clientes.
- Investigación en control de cámara: el adaptador sirve como referencia para estudiar cómo los LoRAs pueden controlar parámetros continuos (velocidad) en modelos de vídeo, gracias a su escalera de velocidades sin clamp.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El README del autor menciona una métrica interna de error medio de zoom: la configuración final (run 1) obtuvo un 3.4% de error, mientras que la configuración descartada (run 2) alcanzó un 28.0%. Sin embargo, no se trata de un benchmark estándar ni se ofrecen comparaciones con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. Depende del modelo base LTX-2.5, que según información del autor es un modelo de vídeo de 22B.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se especifican en el repositorio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
El autor ha publicado otros adaptadores LoRA para LTX-2.5. A continuación se comparan los datos disponibles:

| Modelo | Tipo de movimiento | Rango de velocidad | Tamaño del repositorio | Licencia |
|---|---|---|---|---|
| reelbids-ltx25-orbit-lora-v4mixed | Órbita | 0.5–5.0 (trigger `rborbit sp05`–`sp50`) | 4.0 GB | No disponible |
| reelbids-ltx25-camera-lora | Dolly-in | 7 velocidades seleccionables | No disponible | No disponible |
| reelbids-ltx25-orbit-lora | Órbita | No disponible | No disponible | No disponible |
| LoRAs oficiales de LTX-2 (19B) | Cámara | Una sola velocidad por LoRA | No disponible | No disponible |

Según el README del repo `reelbids-ltx25-camera-lora`, los LoRAs oficiales de LTX-2 son de un solo velocidad y solo compatibles con la versión 19B, mientras que este adaptador cubre un rango continuo y está diseñado para LTX-2.5.

## Limitaciones y advertencias
- La licencia no está especificada, por lo que el uso comercial no está garantizado.
- El dataset de entrenamiento es sintético (Blender), lo que puede limitar la transferencia a vídeos reales con iluminación, texturas o movimientos de fondo complejos.
- El autor indica que la configuración del run 2 colapsó el control de velocidad, lo que sugiere una alta sensibilidad a los hiperparámetros de entrenamiento.
- Es un adaptador LoRA, no un modelo independiente; requiere el modelo base LTX-2.5 para funcionar.
- No se han publicado benchmarks públicos que validen su rendimiento frente a otros adaptadores de control de cámara.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad.
- Solo controla movimiento de cámara orbital; no ofrece otros tipos de movimiento (dolly, pan, tilt) a menos que se combine con otros LoRAs.

## Enlaces
- https://huggingface.co/AhsanHareem/reelbids-ltx25-orbit-lora-v4mixed
- https://huggingface.co/AhsanHareem/reelbids-ltx25-orbit-lora
- https://huggingface.co/AhsanHareem/reelbids-ltx25-camera-lora
