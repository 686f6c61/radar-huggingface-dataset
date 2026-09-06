# rayaanoidpr/vjepa-wm-bigrun

## Resumen

El modelo `rayaanoidpr/vjepa-wm-bigrun` es un modelo de mundo (world model) para robots cuadrúpedos, desarrollado por el usuario `rayaanoidpr` sobre la base de la arquitectura V-JEPA 2.1 de Meta. Está diseñado para aprender representaciones visuales y predecir la dinámica futura de un robot a partir de comandos de control, combinando un encoder ViT-B/384 congelado con un mecanismo de enmascaramiento causal de tubelets y cabezas auxiliares de predicción de velocidad. El repositorio contiene dos checkpoints de un "big run": el paso 4000 y el paso 8000, con un tamaño total de 0.2 GB en formato PyTorch (.pt).

El problema que resuelve es la predicción de estados futuros en entornos de robótica, lo que permite planificar acciones y entrenar políticas sin necesidad de interacción física continua. Según la model card, el checkpoint final (paso 8000) alcanza una similitud coseno de características de 0.890 en ICE-1 y 0.854 en SPX-2, y mejora la señal de control en un 58% y un 79% respectivamente frente a comandos barajados. Es relevante porque demuestra que los modelos de mundo basados en V-JEPA pueden capturar la dinámica de un robot cuadrúpedo con un coste computacional moderado, aunque se trata de un artefacto de investigación sin licencia ni soporte oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-JEPA 2.1 ViT-B/384 (encoder congelado) + predictor de mundo |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo de vídeo, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo combina un encoder V-JEPA 2.1 ViT-B/384 congelado con un predictor de mundo. El encoder procesa vídeo con enmascaramiento causal de tubelets (con límites {6, 8, 10}). Se añaden tokens de comando por ventana, lo que permite condicionar la predicción a las acciones del robot. La pérdida principal es una LN-L1 ponderada por movimiento, y se incluye una cabeza auxiliar de consistencia de velocidad con lambda 0.5. Durante el entrenamiento se aplica un dropout de comandos del 25%. El entrenamiento se realizó en fp32 con batch 4, stride 4 y aproximadamente 40 misiones. No se menciona uso de RLHF, DPO ni otros ajustes supervisados posteriores. El checkpoint final corresponde al paso 8000, tras una fase inicial de 16 misiones en el paso 4000.

## Capacidades

- Predicción de vídeo futuro a partir de comandos de control, con capacidad de anticipar desplazamientos a horizontes de 3 segundos.
- Extracción de representaciones visuales robustas mediante el encoder V-JEPA, con similitud coseno de 0.890/0.854 en conjuntos held-out.
- Estimación de velocidad del robot a través de la cabeza auxiliar, con RMSE de 0.061 m/s (ICE-1) y 0.052 m/s (SPX-2) cuando se usan comandos reales.
- Sensibilidad a la señal de control: el modelo distingue comandos reales de comandos barajados, lo que indica que la predicción depende de la acción.
- Modelado de la dinámica de un robot cuadrúpedo en entornos específicos (ICE-1, SPX-2).
- No soporta generación de texto, tool calling, agentes, ni capacidades multilingües, al ser un modelo de visión.

## Casos de uso

- Planificación de movimiento en robótica: el modelo puede usarse como predictor de estados futuros para evaluar trayectorias candidatas antes de ejecutarlas, reduciendo el ensayo-error físico. Su capacidad de anticipar desplazamientos a 3 segundos permite descartar acciones que llevarían a configuraciones no deseadas.
- Entrenamiento de políticas con aprendizaje por refuerzo basado en modelo: al simular las consecuencias de comandos, el world model puede generar rollouts sintéticos para entrenar controladores sin necesidad de un simulador físico completo.
- Validación de controladores en simulación: se pueden inyectar comandos de control y comparar el vídeo predicho con el real para depurar estrategias de locomoción en entornos como ICE-1 o SPX-2.
- Estimación de velocidad y estado del robot: la cabeza auxiliar de velocidad proporciona una señal de velocidad que puede integrarse en el lazo de control o en sistemas de odometría visual.
- Investigación en representaciones autosupervisadas: el encoder V-JEPA puede utilizarse como extractor de características para tareas de percepción downstream, como clasificación de terrenos o detección de obstáculos.
- Benchmarking de modelos de mundo: los checkpoints ofrecen una referencia para comparar la calidad de predicción de dinámica en robots cuadrúpedos, especialmente en métricas de coseno de características y RMSE de velocidad.

## Benchmarks y rendimiento

Según la model card, los resultados de evaluación held-out (ICE-1 / SPX-2) para el checkpoint del paso 8000 son:

| Métrica | ICE-1 | SPX-2 |
|---|---|---|
| Similitud coseno de características | 0.890 | 0.854 |
| RMSE de velocidad con comandos reales (m/s) | 0.061 | 0.052 |
| RMSE de velocidad con comandos barajados (m/s) | 0.097 | 0.092 |
| Mejora de la señal de control | +58% | +79% |
| Desplazamiento a 3 s (causal, steady-far) | 0.34 m | 0.49 m |
| Desplazamiento a 3 s (copy, steady-far) | 0.61-0.78 m | 0.61-0.78 m |

Nota: el rango 0.61-0.78 m corresponde a la línea base copy reportada en la model card, sin desglose por conjunto. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible (no se han publicado requisitos oficiales).
- Opciones de despliegue: no disponible. Los pesos se distribuyen en formato .pt, por lo que se requiere el código de V-JEPA para cargarlos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. El modelo es un checkpoint de investigación derivado de V-JEPA de Meta, pero no se dispone de datos comparativos con otros modelos de mundo para robots cuadrúpedos en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos potenciales del modelo.
- Al ser un modelo de visión y no de lenguaje, el riesgo de alucinación textual no aplica; sin embargo, las predicciones de vídeo pueden ser inexactas en entornos no vistos.
- La licencia no está especificada, por lo que el uso comercial o la redistribución requieren consultar al autor.
- Los datos de entrenamiento son aproximadamente 40 misiones de un robot cuadrúpedo, lo que limita la generalización a otros robots, terrenos o condiciones de iluminación.
- El repositorio no incluye documentación sobre el preprocesado de vídeo ni el protocolo de comandos, lo que dificulta la reproducibilidad.
- No hay garantías de soporte ni mantenimiento; es un artefacto de investigación con descargas y likes en cero.

## Enlaces

- HuggingFace: https://huggingface.co/rayaanoidpr/vjepa-wm-bigrun
- Repositorio oficial de V-JEPA (Meta): https://github.com/facebookresearch/jepa
