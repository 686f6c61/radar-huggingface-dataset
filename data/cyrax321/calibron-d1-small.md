# Cyrax321/calibron-d1-small

## Resumen

`calibron-d1-small` es un modelo de decisión compacto desarrollado por el usuario Cyrax321 dentro de la familia Calibron (`calibron-d1`). Se presenta como un modelo de "inteligencia de decisión" orientado a aprendizaje por refuerzo offline (offline RL), construido sobre una arquitectura propietaria denominada Calibrated Adaptive Decision Engine (Calibron). No es un modelo de lenguaje generativo, sino un predictor de decisiones que, dado un estado y un retorno objetivo (return-to-go), produce una acción o decisión.

El modelo es extremadamente pequeño: 2.265.228 parámetros totales, con una dimensión de modelo (`d_model`) de 192, 4 capas y 4 cabezas de atención, y una longitud de contexto de solo 20 pasos. El repositorio ocupa 0,1 GB y los pesos están en formato safetensors. Se distribuye bajo licencia AGPL-3.0.

Su relevancia es limitada en el ecosistema actual: se trata de un modelo experimental con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación extensa. Resulta útil como referencia para quienes investigan modelos de decisión ligeros o arquitecturas de offline RL de pequeño tamaño, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Calibron (Calibrated Adaptive Decision Engine): transformer con d_model=192, n_layers=4, n_heads=4, context_len=20 |
| Parametros totales | 2.265.228 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 20 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de decisión, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura Calibron se describe como un motor de decisión adaptativo calibrado. Los parámetros publicados indican un transformer compacto con `d_model=192`, 4 capas y 4 cabezas de atención, con una ventana de contexto de 20 pasos. El espacio de acciones es continuo (`Discrete Action Space: False`). La inferencia se realiza mediante la clase `DecisionPredictor` del paquete `calibron.inference`, que recibe un array de estados (forma `(batch, 11)`) y un return-to-go (forma `(batch, 1)`), y devuelve una predicción de decisión.

El entrenamiento se realizó sobre benchmarks de trayectorias offline (offline RL), con 23.000 pasos completados y una mejor pérdida de validación de -2,753110. No se especifican el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card advierte que la generalización fuera de distribución depende de la cobertura del dataset de entrenamiento.

## Capacidades

- Predicción de decisiones condicionada a estado y return-to-go (offline RL).
- Manejo de acciones continuas (espacio de acciones no discreto).
- Ventana de contexto de 20 pasos para secuencias de estado.
- Inferencia por lotes mediante `DecisionPredictor.predict(states, rtg)`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso ni razonamiento encadenado.
- No tiene capacidades multilingües ni generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en offline RL: sirve como banco de pruebas de bajo coste para validar pipelines de entrenamiento y evaluación de decisión con retorno condicionado, gracias a sus 2,26 M de parámetros y su rápida iteración.
- Control de políticas en entornos simulados: puede integrarse en simuladores ligeros donde el estado tenga 11 dimensiones y el horizonte sea corto (20 pasos), como experimentos de control continuo.
- Prototipado de sistemas de recomendación secuencial: el condicionamiento por return-to-go permite explorar políticas que priorizan recompensas futuras en secuencias cortas de interacción.
- Educación y docencia: modelo adecuado para explicar conceptos de offline RL y calibración de decisiones sin requerir hardware especializado.
- Evaluación comparativa de arquitecturas de decisión: su tamaño reducido permite compararlo frente a políticas baseline en experimentos controlados.
- Generación de datos sintéticos de decisión: puede emplearse para producir trayectorias etiquetadas en entornos con dinámica conocida y estado de 11 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la mejor pérdida de validación reportada por el autor: -2,753110 tras 23.000 pasos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (2,26 M de parámetros ocupan aproximadamente 9 MB en FP32 y 4,5 MB en FP16), más el overhead del runtime de PyTorch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: el paquete `calibron` con `DecisionPredictor` sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia o categoría (modelos de decisión offline RL de tamaño similar) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenado sobre benchmarks de trayectorias offline; la generalización fuera de distribución depende de la cobertura del dataset.
- No debe desplegarse en bucles críticos de seguridad sin validación específica del dominio.
- Ventana de contexto muy corta (20 pasos), lo que limita su uso en secuencias largas.
- Sin benchmarks publicados ni métricas comparativas que permitan evaluar su calidad frente a alternativas.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el código fuente derivado.
- Modelo de decisión, no lingüístico: no apto para tareas de generación de texto, código o razonamiento general.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí riesgo de decisiones erróneas fuera del dominio de entrenamiento.
- Sin información sobre sesgos, composición del dataset ni procesos de alineación.

## Enlaces

- Hugging Face: https://huggingface.co/Cyrax321/calibron-d1-small
