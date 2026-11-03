# DVSun/g1-advanced-robotic

## Resumen

G1 Advanced Robotic es un repositorio de modelos para el robot humanoide Unitree G1 de 29 grados de libertad (DOF), publicado por el usuario DVSun en HuggingFace. No se trata de un modelo de lenguaje, sino de un conjunto de artefactos de política robótica entrenados en simulación con MuJoCo: un modelo de flow matching estado-latente (300.000 updates con EMA) que genera estados futuros y latentes VAE a partir del historial propioceptivo, y un VAE de seguimiento de movimiento de referencia con 1576 dimensiones de entrada y 29 de salida, exportado a ONNX.

El modelo de flow matching acepta gradientes en la entrada y soporta guidance de velocidad planar, lo que lo orienta a investigación en control generativo de humanoides. El repositorio incluye además un ONNX decoder-only cuyo contrato de entrada es `latent[32]` más `history[930]`, pensado para usarse en conjunto con el VAE según las instrucciones del directorio correspondiente.

Es relevante ahora como ejemplo de aplicación de flow matching a locomoción y tracking de movimiento en humanoides de bajo coste, aunque el propio autor advierte que es una versión de investigación en simulación: el entrenamiento está completo, pero la guía de velocidad no alcanza aún el objetivo de mejora real del proyecto y no se ha validado en hardware físico ni en despliegue en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching estado-latente (generativa, sobre representación VAE); VAE de seguimiento de movimiento; decoder-only ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial de entrada de 930 dimensiones en el decoder; 1576 dimensiones de entrada en el VAE) |
| Tipos de cuantizacion | no disponible (exportación a ONNX) |
| Idiomas soportados | zh, en (documentación) |
| Licencia | no disponible |
| Formato de pesos | ONNX (VAE y decoder-only); artefactos de flow matching según directorio `10-29_flow_300000_velocity_v1` |
| Dimension de entrada/salida VAE | 1576 dimensiones de entrada, 29 dimensiones de salida |
| Entradas del decoder ONNX | `latent[32]`, `history[930]` |
| Entrenamiento | 300.000 updates con EMA (flow matching) |
| Plataforma de simulación | MuJoCo |
| Robot objetivo | Unitree G1, 29 DOF |

## Arquitectura y entrenamiento

El componente principal es un modelo de flow matching que opera en un espacio estado-latente: dado el historial propioceptivo del robot, genera estados futuros y latentes del VAE. El modelo fue entrenado durante 300.000 updates con media móvil exponencial (EMA) de los pesos, y admite gradientes en la entrada, lo que permite aplicar guidance durante la generación (por ejemplo, guía de velocidad planar). El segundo componente es un VAE de seguimiento de acciones de referencia, con media posterior en su mejor checkpoint (43250), que mapea 1576 dimensiones de entrada a 29 dimensiones de salida correspondientes a las articulaciones del G1. Ambos se complementan mediante un decoder-only exportado a ONNX que consume un latente de 32 dimensiones y un historial de 930 dimensiones.

No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens o episodios, ni sobre el uso de RLHF o DPO (no aplicables en este dominio). Tampoco se detalla la arquitectura interna de las redes (número de capas, dimensiones ocultas, tipo de bloques). El autor indica que se trata de una versión de investigación en simulación: el entrenamiento está finalizado, pero la guía de velocidad no cumple aún el criterio de aceptación de mejora real del proyecto y no se ha validado en robot físico ni en tiempo real.

## Capacidades

- Generación de estados futuros y latentes VAE a partir del historial propioceptivo del Unitree G1 de 29 DOF.
- Soporte de guidance de velocidad planar durante la generación, con gradientes habilitados en la entrada.
- Seguimiento de movimientos de referencia mediante el VAE (1576 → 29 dimensiones).
- Exportación a ONNX para integración en pipelines de inferencia (VAE y decoder-only).
- Uso en simulación MuJoCo para investigación en control generativo de humanoides.
- Documentación bilingüe zh/en.
- No dispone de capacidades de lenguaje, visión, audio, tool calling ni razonamiento multi-paso; no es un modelo de propósito general.

## Casos de uso

- Investigación en flow matching aplicado a robótica: el modelo permite estudiar cómo la generación en espacio latente condicionada por historial propioceptivo se traduce en trayectorias de estado plausibles para un humanoide de 29 DOF, usando MuJoCo como entorno de evaluación.
- Tracking de movimientos de referencia en simulación: el VAE de 1576 a 29 dimensiones puede emplearse para reproducir capturas de movimiento o políticas de referencia sobre el G1 dentro de MuJoCo, sirviendo de base para comparar políticas de imitación.
- Experimentos de guidance de velocidad: al aceptar gradientes en la entrada, el modelo permite probar funciones de coste (por ejemplo, velocidad planar deseada) y medir su efecto en las trayectorias generadas, aunque el autor advierte que aún no se alcanza el objetivo de mejora real.
- Generación de datos sintéticos de estado para entrenamiento: los estados futuros generados pueden usarse como datos aumentados para entrenar o evaluar controladores downstream en simulación.
- Integración en pipelines ONNX: el VAE y el decoder-only pueden cargarse con runtime ONNX dentro de herramientas de simulación o evaluación, facilitando la reproducibilidad de experimentos.
- Estudio de robustez de políticas generativas: comparar la distribución de estados generados frente a trayectorias reales de referencia en MuJoCo para analizar modos de fallo antes de plantear transferencia a hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un criterio de aceptación de mejora de velocidad que la guía actual no cumple, pero no se proporcionan métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,1 GB, lo que sugiere que los artefactos son ligeros y podrían ejecutarse en CPU, aunque no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio es plausible, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime para los artefactos ONNX; el resto de artefactos requiere seguir las instrucciones del directorio `10-29_flow_300000_velocity_v1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponible; el autor indica que no se ha validado el despliegue en tiempo real.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de flow matching estado-latente para el Unitree G1 de 29 DOF.

## Limitaciones y advertencias

- Versión de investigación en simulación: no validada en robot físico ni en despliegue en tiempo real.
- La guía de velocidad no alcanza el objetivo de mejora real definido por el proyecto.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- Sin métricas publicadas de rendimiento, robustez o tasa de éxito en tareas.
- Documentación limitada y parcialmente en chino; los contratos de entrada del decoder (`latent[32]`, `history[930]`) deben respetarse según las instrucciones del directorio correspondiente.
- Sin información sobre sesgos, alucinación o limitaciones de contexto en el sentido habitual de modelos de lenguaje; los riesgos se refieren a fallos de política (inestabilidad, deriva) en simulación.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- HuggingFace: https://huggingface.co/DVSun/g1-advanced-robotic
- Directorio del modelo de flow matching: `10-29_flow_300000_velocity_v1/README.md` (dentro del repositorio)
- VAE ONNX: `10-26_advanced_robotic_vae_best_43250.onnx`
- Metadatos del VAE: `10-26_advanced_robotic_vae_best_43250.json`
- Parity del VAE: `10-26_advanced_robotic_vae_best_43250.parity.npz`
