# chibifire/MotionBricks-G1-GGML

## Resumen

MotionBricks-G1-GGML es una conversión a formato GGML/GGUF de los checkpoints de generación de movimiento de NVIDIA MotionBricks, adaptados para el robot humanoide Unitree G1. El modelo ha sido convertido por el proyecto motion-bricks.cpp, que permite ejecutar la inferencia en CPU y mediante Vulkan. No es un modelo de lenguaje: se trata de un sistema de generación de movimiento que produce poses y trayectorias de cuerpo completo para un esqueleto de 34 articulaciones.

El paquete incluye los checkpoints de pose, raíz y decodificador VQ, junto con 15 primitivas de estilo que permiten variar la expresividad del movimiento generado. Según la model card, el bundle completo contiene 183.148.382 parámetros F32 aprendidos, mientras que los metadatos de HuggingFace registran 136.588.272 parámetros en safetensors. El repositorio tiene un tamaño de 0,7 GB.

La relevancia de este modelo radica en que acerca un modelo de generación de movimiento de NVIDIA a un formato abierto y portable (GGUF), facilitando su uso en aplicaciones de robótica y simulación sin necesidad de infraestructura de GPU especializada. La licencia es la NVIDIA Open Model License, que impone restricciones de redistribución y uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; pipeline de generación de movimiento con checkpoints de pose, raíz y decodificador VQ |
| Parametros totales | 136.588.272 (según metadatos de HuggingFace); el bundle completo declara 183.148.382 parámetros F32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de generación de movimiento, no aplica contexto de texto) |
| Tipos de cuantizacion | F32 nativo (GGUF) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | NVIDIA Open Model License (etiqueta "other") |
| Formato de pesos | GGUF (conversión nativa F32) |

## Arquitectura y entrenamiento

MotionBricks-G1-GGML no es un modelo de lenguaje, sino una conversión de los checkpoints de NVIDIA MotionBricks para generación de movimiento. La arquitectura interna no está documentada en la información disponible; se sabe que el paquete contiene checkpoints de pose, raíz y un decodificador VQ, así como 15 primitivas de estilo. El sistema genera movimiento de cuerpo completo para el esqueleto de 34 articulaciones del robot Unitree G1.

Los pesos originales proceden de NVIDIA y se distribuyen a través de Git LFS en el repositorio NVlabs/GR00T-WholeBodyControl. La conversión a GGUF fue realizada por el proyecto motion-bricks.cpp, que incluye un script de descarga de pesos (scripts/download_gguf_weights.py) y archivos MANIFEST.json y SHA256SUMS para verificar la procedencia. No se proporcionan datos sobre el entrenamiento original (tokens, composición del dataset, RLHF/DPO), por lo que este aspecto queda no disponible.

## Capacidades

- Generación de movimiento de cuerpo completo: produce poses y trayectorias para el esqueleto de 34 articulaciones del Unitree G1.
- Incluye 15 primitivas de estilo que permiten variar la expresividad y el estilo del movimiento generado.
- Incorpora un decodificador VQ para reconstruir movimientos a partir de representaciones latentes.
- Inferencia en CPU y Vulkan gracias a la conversión GGML/GGUF.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni tiene capacidades multilingües, de visión o audio.

## Casos de uso

- Control de movimiento para robots humanoides Unitree G1: el modelo genera poses y trayectorias de cuerpo completo, lo que permite planificar movimientos para un robot real o simulado. Es adecuado porque está diseñado específicamente para el esqueleto de 34 articulaciones del G1.
- Simulación robótica en entornos virtuales: se puede integrar en simuladores para generar movimientos realistas y validar comportamientos antes del despliegue físico. La conversión GGUF facilita la integración en pipelines de simulación.
- Animación de personajes humanoides: las primitivas de estilo permiten generar animaciones variadas para personajes digitales, útil en videojuegos o producción audiovisual.
- Investigación en aprendizaje por refuerzo: el modelo puede usarse para generar datos de demostración o como política de movimiento inicial en tareas de control de robots.
- Prototipado en hardware de bajo consumo: al ejecutarse en CPU y Vulkan, permite probar el modelo en robots o estaciones de trabajo sin GPU dedicada, reduciendo la barrera de entrada.
- Generación de movimientos con estilo controlado: las 15 primitivas de estilo ofrecen un mecanismo para ajustar la expresividad del movimiento, lo que resulta útil en aplicaciones de animación o en el diseño de comportamientos robóticos.
- Integración en stacks de robótica: el modelo puede empaquetarse como un módulo de generación de movimiento en un sistema de control robótico, gracias a su formato GGUF y su ejecución en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo es pequeño (0,7 GB en F32), pero no se especifica el consumo de VRAM.
- GPU recomendadas: no se indican modelos concretos; cualquier GPU compatible con Vulkan puede ejecutar la inferencia.
- Cabe en GPUs de consumo: sí, al ser un modelo de ~0,7 GB y ejecutarse en CPU/Vulkan.
- Opciones de despliegue: motion-bricks.cpp (CPU y Vulkan).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo está sujeto a la NVIDIA Open Model License; la redistribución requiere conservar el acuerdo y la atribución de NVIDIA, y no otorga derechos adicionales.
- No es un modelo de lenguaje: no puede generar texto ni realizar tareas de razonamiento lingüístico.
- Pesos en F32 sin cuantizar: el tamaño del archivo es mayor que el de un GGUF cuantizado, lo que puede limitar el despliegue en dispositivos con poca memoria.
- Dependencia de pesos externos: los pesos originales se distribuyen mediante Git LFS en el repositorio de NVIDIA, no en un repositorio HuggingFace separado.
- Sin benchmarks publicados: no se dispone de métricas de rendimiento para comparar con otros modelos.
- Posibles sesgos o limitaciones del modelo original no documentados: la información disponible no detalla el comportamiento en casos límite.

## Enlaces

- HuggingFace (chibifire): https://huggingface.co/chibifire/MotionBricks-G1-GGML
- HuggingFace (LocalAI-io): https://huggingface.co/LocalAI-io/MotionBricks-G1-GGML
- GitHub del proyecto motion-bricks.cpp: https://github.com/localai-org/motion-bricks.cpp
- Repositorio original de NVIDIA (revisión fijada): https://github.com/NVlabs/GR00T-WholeBodyControl/tree/a0732b642c0333077e127a2f56ab0014c196bca4/motionbricks
