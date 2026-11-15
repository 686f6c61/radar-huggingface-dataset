# Imok282/lunar-hazard-unet

## Resumen

Lunar Hazard U-Net (identificador `Imok282/lunar-hazard-unet`) es un modelo de segmentación de imagen binaria desarrollado por el usuario Imok282 en el marco del proyecto Adinfinitium, presentado en el contexto de Space Apps. Su tarea es clasificar, píxel a píxel, el terreno del polo sur lunar como seguro o inseguro, entendiendo por inseguro aquel con pendiente igual o superior a 12 grados según los datos del instrumento LOLA de la misión LRO de la NASA, con una resolución de 5 metros por píxel.

El modelo aborda un problema práctico de la navegación lunar: los datos de altimetría láser solo cubren aproximadamente el 10 % de los píxeles de una ventana de observación, de modo que la mayor parte de la etiqueta procede de interpolación. La red reconstruye el mapa de peligro a partir de cinco canales de entrada derivados del terreno, la máscara láser y el mapa de error de la NASA, y su salida alimenta el coste de ruta y la penalización de puntuación del denominado "cerebro del rover" del proyecto.

Arquitectónicamente es una U-Net residual con atención multi-cabeza en las escalas gruesas (AttnUNet), con 60.361.561 parámetros, entrada de 5 canales y profundidad 4. El repositorio ocupa 0,2 GB y el checkpoint principal, `hazard_unet_big.pt`, pesa 241.510.445 bytes. La licencia es Apache-2.0 y el modelo está pensado exclusivamente para investigación, educación y evaluación comparativa de métodos de navegación en lugares de aterrizaje lunar, no para vuelo ni decisiones operativas de aterrizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AttnUNet: U-Net residual con self-attention multi-cabeza en las escalas gruesas (`in_ch 5, base 72, depth 4, blocks 2, heads 8, attn_levels 2`) |
| Parametros totales | 60.361.561 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen; ventanas de terreno de 5 m por píxel) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch (`hazard_unet_big.pt`, 241.510.445 bytes, id `cd6c4383eb`, sha256 `91393b30…672a0`) |

## Arquitectura y entrenamiento

El modelo es una U-Net residual con mecanismos de self-attention multi-cabeza en las dos escalas más gruesas del encoder y del decoder (`attn_levels 2`, 8 cabezas), con 72 canales base y profundidad 4. La entrada tiene 5 canales: pendiente rellenada por encima del límite, altura filtrada paso alto, máscara láser, mapa de error de la NASA y distancia al píxel láser más cercano. La salida es un único logit por píxel que representa la probabilidad de terreno inseguro.

El entrenamiento se realizó sobre datos de terreno LRO LOLA a 5 m de resolución, con 40 épocas planificadas de 200 pasos cada una, de las que se completaron 37. Los sitios de entrenamiento fueron Site01, Site04, Site06, Site07, Site20, Haworth, Shoemaker y DM2; el mejor checkpoint se seleccionó por F1 de validación en Site11. Cabe destacar que Haworth representa 19 de las 60 teselas de entrenamiento, un desequilibrio geográfico relevante. La model card no documenta el uso de RLHF, DPO ni ajuste por preferencias, lo cual es coherente con una tarea de segmentación supervisada. El proyecto incorpora además un procedimiento denominado Dream-RSI, un bucle de auto-mejora offline con compuerta de validación congelada que acepta candidatos solo si no introducen regresiones; en el caso del modelo de peligro, las cifras de mejora proyectada (F1 fresh de 0,757 a 0,779) son proyecciones, no medidas.

## Capacidades

- Segmentación binaria de terreno inseguro (pendiente igual o superior a 12 grados) a resolución de 5 m por píxel sobre datos LRO LOLA.
- Reconstrucción del mapa de peligro a partir de una cobertura láser parcial (aproximadamente el 10 % de los píxeles medidos en una ventana).
- Integración de cinco canales de features derivadas del terreno, la máscara láser y el mapa de error de la NASA.
- Salida de probabilidad por píxel que alimenta el coste de ruta y la penalización de puntuación del rover en el proyecto Adinfinitium.
- Soporte de inferencia en CPU (el ejemplo de uso de la model card carga el checkpoint con `device="cpu"`).
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni multilingües.

## Casos de uso

- Planificación de rutas de rover en simulación: el mapa de probabilidad de peligro se usa como capa de coste para que el planificador evite pendientes superiores a 12 grados, aprovechando que la red reconstruye zonas sin retorno láser.
- Evaluación comparativa de métodos de segmentación de peligro lunar: sirve como referencia frente a la línea base de regla de pendiente (F1 0,951 frente a 0,817 en los sitios reservados Site23 y Site42).
- Selección de lugares de aterrizaje en estudios académicos: la máscara de terreno inseguro permite descartar zonas de aterrizaje con pendientes excesivas antes de simulaciones de descenso.
- Generación de cartografía de peligro a partir de altimetría parcial: útil cuando solo se dispone de retornos láser dispersos (3,7–14,2 % de cobertura por ventana) y se necesita una estimación densa del terreno.
- Docencia y divulgación en ciencia planetaria: el modelo y su comparación con la línea base física son un ejemplo didáctico de segmentación semántica aplicada a datos de la NASA.
- Investigación en auto-mejora offline de modelos: el marco Dream-RSI documentado en la model card puede reproducirse con este modelo como caso de estudio de entrenamiento con compuerta de no regresión.

## Benchmarks y rendimiento

F1 para píxeles inseguros, red frente a la línea base de regla de pendiente sobre superficie rellenada. Los conjuntos reservados son Site23 (13 ventanas) y Site42 (6 ventanas); los frescos son seis sitios no vistos (DM1, LM7, NPA–NPD).

| Conjunto de prueba | F1 U-Net | F1 línea base regla de pendiente |
|---|---|---|
| Reservados Site23 + Site42 (19 ventanas) | 0,951 [0,932; 0,967] | 0,817 |
| Site23 solo (13 ventanas) | 0,965 | 0,899 |
| Site42 solo (6 ventanas) | 0,917 | 0,567 |
| Seis sitios frescos | 0,757 [0,501; 0,805] | 0,292 |

En sitios frescos, el recall es del 81,3 % y la tasa de falsas alarmas del 5,1 %. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card; con 60,36 M de parámetros en precisión completa el checkpoint ocupa aproximadamente 241 MB, por lo que la inferencia es viable en GPU de gama baja y en CPU.
- GPU recomendadas: no se especifican en la información proporcionada; por tamaño, cualquier GPU consumer con al menos 1–2 GB de VRAM libre debería poder ejecutar el modelo.
- Cabe en GPU consumer: sí, por el tamaño del checkpoint (241 MB) y el número de parámetros.
- Opciones de despliegue: carga mediante PyTorch con las funciones `load_checkpoint` y `predict_probability` del paquete `worldmodel.hazard` del repositorio del proyecto; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de segmentación).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lunar Hazard U-Net (este modelo) | 60.361.561 | 5 m por píxel; ventanas de terreno LRO LOLA | F1 0,951 en reservados; 0,757 en sitios frescos | Apache-2.0 | Hugging Face |
| Línea base regla de pendiente (referencia física) | no aplica | 5 m por píxel | F1 0,817 en reservados; 0,292 en sitios frescos | no aplica | Implementación del propio proyecto |
| Otros modelos de segmentación lunar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de segmentación de peligro lunar en la documentación proporcionada.

## Limitaciones y advertencias

- Rendimiento débil en terreno plano: F1 de 0,24 a 0,70 en los sitios frescos planos (NPA–NPD), con omisión del 38–75 % de los píxeles inseguros en esos cuatro sitios.
- Aproximadamente el 90 % de los píxeles de etiqueta son interpolación de la NASA, y solo el 3,7–14,2 % de una ventana de prueba contiene retorno láser; la comparación favorece a la red porque la pendiente de la línea base y el mapa de error de la NASA también son entradas de la red.
- Desequilibrio geográfico en el entrenamiento: Haworth supone 19 de las 60 teselas.
- El modelo está limitado a la tarea y dominio para los que fue entrenado (polo sur lunar, datos LRO LOLA a 5 m); no es un modelo de propósito general ni procesa lenguaje.
- Riesgo de generalización limitado a sitios no vistos, como muestra la caída de F1 de 0,951 a 0,757 en sitios frescos.
- Uso previsto exclusivamente para investigación, educación y evaluación comparativa; no apto para vuelo, decisiones de aterrizaje operativas ni sistemas de seguridad crítica. Todos los resultados son de simulación o de sitios lunares reservados, no de rendimiento en misión real.
- Licencia Apache-2.0: permite uso comercial con atribución, pero el autor restringe explícitamente el uso operativo y de seguridad crítica.
- Las cifras de mejora proyectada mediante Dream-RSI no son medidas y no deben tratarse como rendimiento garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Imok282/lunar-hazard-unet
- Repositorio del proyecto (código de uso): https://github.com/oasisk/adinfinitium-handoff
- Model card: incluida en la página de Hugging Face del modelo
- Paper, blog o demo adicionales: no disponible en la información proporcionada
