# aldigobbler/canyon-racer-lfm2-230m-v1.5-gguf

## Resumen

Canyon Racer LFM2.5-230M v1.5 (GGUF) es una política de juego derivada del modelo base LiquidAI/LFM2.5-230M, un transformer de 229.693.184 parámetros (aproximadamente 230 millones) desarrollado por LiquidAI. El autor del ajuste es aldigobbler, que ha publicado esta versión en formato GGUF para su uso con llama.cpp. No se trata de un modelo de chat general, sino de una política especializada que responde a observaciones compactas del estado de un juego con una única palabra de acción.

El modelo resuelve un problema muy concreto: controlar la nave del juego Canyon Racer traduciendo observaciones del entorno en decisiones discretas (`left`, `right`, `up`, `down`, `a` para saltar, `b` para guardar y `wait` para soltar botones). Se entrenó mediante SFT experto seguido de PPO con un profesor congelado (`main11`) y una penalización KL de coeficiente 0,02, y se publica con la LoRA ya fusionada en los pesos del modelo de lenguaje.

La relevancia de esta ficha es acotada: es un ejemplo de cómo un modelo de lenguaje pequeño puede convertirse en un agente de control para entornos con acciones discretas, con un tamaño de repositorio de 0,6 GB y dos cuantizaciones disponibles (Q4_K_M de ~147 MB y BF16 de ~441 MB). Su utilidad fuera del juego es limitada, pero sirve como referencia para pipelines de RL sobre modelos pequeños y para despliegues de inferencia en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM2.5-230M); ajuste LoRA fusionado |
| Parametros totales | 229.693.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos; la model card remite a la licencia del modelo base y a la del proyecto Canyon Racer (CC-BY-NC-SA 4.0 para la lógica original del juego) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-230M, un transformer de aproximadamente 230 millones de parámetros. Sobre él se aplicó una LoRA de rango 32 que posteriormente se fusionó en los pesos para esta release; el GGUF exportado contiene únicamente el modelo de lenguaje fusionado, sin la cabeza de valor ni el prior de acción del LM. El checkpoint publicado corresponde a la iteración 350 del entrenamiento.

El proceso de entrenamiento combina SFT con datos de experto y PPO con un profesor congelado (`main11`) y una penalización KL de coeficiente 0,02. La función de recompensa asigna +1 por obstáculo superado, +5 por ítem, +10 por subida de nivel, −1 por colisión y +0,002 por fotograma. La configuración de PPO es de una época, minibatch de 192, 96 entornos y repetición de acción de 4. La evaluación sobre 16 semillas reservadas, hasta fin de partida con un tope de seguridad de 600 s, arroja una puntuación mediana de 640, media de 719,4, máxima de 1160 y una supervivencia mediana de 145,5 s; el mejor resultado observado durante la ejecución fue una mediana de 695 en la iteración 320.

## Capacidades

- Generación de una única palabra de acción a partir de una observación del estado del juego: `left`, `right`, `up`, `down`, `a` (salto), `b` (guardar) y `wait` (soltar botones).
- Control de agente en un entorno con acciones discretas y física de salto (mantener `a` para saltar más alto; en el aire no hay colisión).
- Seguimiento de instrucciones mediante un prompt de sistema compacto y una observación estructurada con el último estado y la última acción.
- No soporta tool calling, function calling ni razonamiento multi-paso general.
- No dispone de capacidades de visión, audio ni modo de pensamiento.
- Capacidades multilingües no disponibles; el prompt de sistema está en inglés.

## Casos de uso

- Control automatizado de la nave en Canyon Racer: el modelo recibe la observación del entorno generada por `canyon_env.py` y devuelve una acción discreta que el bucle del juego aplica directamente. Es el caso de uso principal y para el que fue entrenado.
- Evaluación de pipelines de RL sobre modelos pequeños: sirve como referencia para comparar SFT + PPO con profesor congelado frente a otras configuraciones, dado que la model card documenta recompensas, hiperparámetros y métricas de evaluación.
- Agente embebido de bajo coste: con ~147 MB en Q4_K_M, puede ejecutarse en CPU mediante llama.cpp en dispositivos con recursos muy limitados, útil para prototipos de control en tiempo real.
- Generación de datos de comportamiento: las trayectorias producidas por la política pueden registrarse como datos de imitación para entrenar políticas posteriores o para analizar el equilibrio entre exploración y explotación.
- Pruebas de integración de llama.cpp con agentes: el modelo permite validar pipelines de inferencia con salidas restringidas a un vocabulario de siete palabras, incluyendo el filtrado de respuestas inválidas.
- Reproducción de experimentos de RL: el checkpoint de la iteración 350 y las métricas publicadas permiten reproducir la evaluación sobre las 16 semillas reservadas y comparar con la iteración 320 (mediana 695).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de evaluación específicas del juego:

| Metrica | Valor |
|---|---|
| Puntuacion mediana (16 semillas reservadas) | 640 |
| Puntuacion media | 719,4 |
| Puntuacion maxima | 1160 |
| Supervivencia mediana | 145,5 s |
| Mejor mediana observada durante el entrenamiento | 695 (iteracion 320) |

## Requisitos de hardware

- VRAM estimada: ~147 MB para Q4_K_M y ~441 MB para BF16, según los tamaños de fichero indicados en la model card.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer con al menos 1 GB de memoria libre es suficiente, aunque no se documentan pruebas en hardware concreto.
- Cabe en GPU consumer: sí, en cualquier GPU con memoria suficiente para el fichero correspondiente; también es viable en CPU.
- Opciones de despliegue: llama.cpp (librería declarada en los metadatos); otros runners compatibles con GGUF no están documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Canyon Racer LFM2.5-230M v1.5 | 229.693.184 | no disponible | GGUF | no disponible (remite a base y proyecto) | Politica de juego (7 acciones) |
| LiquidAI/LFM2.5-230M | ~230 M | no disponible | safetensors | no disponible | Modelo base de lenguaje |
| Otros modelos de ~230 M para control | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (políticas de juego basadas en modelos de lenguaje de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat general: solo responde con una de las siete palabras de acción; cualquier otra salida se considera inválida y penalizada.
- Depende de un prompt de sistema y de un formato de observación concretos; desviarse de ellos degrada el comportamiento.
- Riesgo de alucinación: puede emitir palabras fuera del vocabulario de acciones, lo que requiere validación en el bucle del juego.
- Sesgos conocidos: no documentados; al ser una política entrenada en un entorno sintético, su comportamiento está ligado a la distribución de observaciones del juego.
- Limitaciones de contexto e idioma: la longitud de contexto no está disponible y el prompt está en inglés; no se documentan capacidades multilingües.
- Restricciones de licencia: la licencia del modelo no está indicada en los metadatos; la model card remite a la licencia del modelo base y a la del proyecto Canyon Racer (CC-BY-NC-SA 4.0 para la lógica original), lo que puede impedir uso comercial. Conviene verificar ambas antes de producción.
- El GGUF no incluye la cabeza de valor ni el prior de acción del LM, por lo que no es posible reanudar el entrenamiento PPO a partir de este fichero.
- El repositorio no registra descargas ni likes, y la fecha de creación indicada es 2026-11-15, lo que conviene contrastar antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/aldigobbler/canyon-racer-lfm2-230m-v1.5-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
