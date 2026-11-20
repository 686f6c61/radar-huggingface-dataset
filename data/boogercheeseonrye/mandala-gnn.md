# BoogerCheeseOnRye/mandala-gnn

## Resumen

Mandala-GNN es un prototipo de investigación desarrollado por el usuario BoogerCheeseOnRye que implementa una red neuronal de grafos (GNN) geométrica de 405.342 parámetros. Su tarea es la reconstrucción de parches enmascarados (masked-patch reconstruction) sobre un dibujo de celosía hexagonal dibujado a mano de 128×128 píxeles. La topología del grafo (203 nodos y 2.092 aristas, con conexiones radiales, de anillo y de radio) se extrajo directamente de tres dibujos con rotulador, no de un benchmark estándar.

El modelo no es un modelo de lenguaje ni una base fundacional: no procesa texto, no tiene capacidades generativas generales y no se puede aplicar a imágenes arbitrarias. Su interés técnico reside en la arquitectura `RadialAttention`, que incorpora sesgos geométricos (RBF sobre longitud de arista, armónicos cos/sin del ángulo, radios de los extremos y tipo de arista) en los logits de atención, combinada con una `ChaosPyramid` de pooling multi-escala.

La relevancia del release es doble: por un lado, demuestra que un prior de simetría angular y una agregación multi-escala mejoran sustancialmente la reconstrucción de un sector no visto (MSE de 0,0030 frente a 0,0154 del baseline de media); por otro, publica un resultado negativo explícito: reordenar las aristas de forma aleatoria sobre las mismas posiciones de nodo obtiene una puntuación a menos de 2 puntos de la celosía original, lo que sugiere que la geometría concreta no es lo que aporta la mejora, sino la atención consciente de la geometría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN geométrica con `RadialAttention` (atención con sesgo geométrico) y `ChaosPyramid` (pooling multi-escala con skips residuales) |
| Parametros totales | 405.342 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; grafo de 203 nodos y 2.092 aristas) |
| Tipos de cuantizacion | no disponible (checkpoint de 1,7 MB en CPU, sin cuantización publicada) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible (el autor no declara licencia sobre el código ni sobre los dibujos fuente) |
| Formato de pesos | `model.pt` (PyTorch, 225 tensores, CPU) |

## Arquitectura y entrenamiento

El modelo procesa un grafo de 203 nodos y 2.092 aristas. Cada nodo lleva un parche local que se pasa por `RadialAttention`, donde los logits de atención reciben un sesgo aprendible calculado a partir de: una función de base radial (RBF) sobre la longitud de la arista, armónicos cos/sin del ángulo de la arista, los radios de ambos extremos y el tipo de arista. Los mensajes se escalan por una compuerta de arista aprendida por cabeza. La configuración es de 3 niveles de profundidad, 2 bloques, 4 cabezas, dimensión 64, 4 armónicos y 8 bins RBF.

La salida de atención pasa por `ChaosPyramid`, que aplica pooling de celdas espaciales con reducción ×3, skips residuales con compuerta de vuelta hacia arriba y una mezcla softmax de read-outs de media y máximo por nivel. La cabeza final predice el parche 4×4 pooled de cada nodo oculto.

El entrenamiento es deliberadamente mínimo: 400 pasos, 88 segundos en un solo hilo de CPU, sobre un dataset de ablaciones (`BoogerCheeseOnRye/mandala-gnn-ablations`). No se reporta uso de RLHF, DPO ni datos externos. La innovación técnica destacable es la incorporación de priors geométricos directamente en la atención, junto con la publicación de ablaciones que aíslan la contribución de cada componente (armónicos angulares, compuerta de arista, pirámide multi-escala).

## Capacidades

- Reconstrucción de parches enmascarados sobre un grafo hexagonal fijo de 203 nodos y 2.092 aristas.
- Predicción del parche 4×4 pooled de cada nodo oculto a partir del contexto del grafo.
- Generalización a un sector de 45° no visto durante el entrenamiento (wedge r = 0,90; wedge MSE = 0,0030).
- Tarea secundaria de clasificación mediante una cabeza small side task (sin detalles adicionales publicados).
- Inferencia en CPU con latencia aproximada de 0,25 s por forward pass.
- Servidor de demo local (`python -m mandalanet.serve`) que pinta la página en ~1 s antes de cargar torch.
- No soporta tool calling, function calling, agentes, multi-step reasoning, texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Investigación en geometric deep learning: reproducir las ablaciones publicadas (eliminación de armónicos angulares, de la compuerta de arista, reordenación aleatoria de aristas) para estudiar qué componentes aportan realmente la mejora en tareas de reconstrucción sobre grafos con simetría.
- Estudio de priors de simetría en GNNs: el modelo sirve como banco de pruebas controlado (405k parámetros, 88 s de entrenamiento) para evaluar cómo los sesgos geométricos afectan a la generalización fuera de distribución en un sector no visto.
- Docencia y divulgación: el servidor de demo local permite visualizar en tiempo real cómo un modelo rellena un sector oculto de un dibujo, con latencias de ~0,25 s por forward pass, adecuado para demostraciones interactivas.
- Prototipado de pipelines de reconstrucción sobre mallas: el código de `mandalanet.train` acepta un dibujo y un tipo de malla (`--mesh hex`) y produce un checkpoint en 88 s en CPU, lo que facilita iterar sobre variantes de malla y pooling.
- Análisis de resultados negativos en publicación científica: el hallazgo de que aristas aleatorias sobre las mismas posiciones puntúan a menos de 2 puntos de la celosía original es un caso de estudio útil sobre la atribución de mejoras en arquitecturas geométricas.
- Referencia para diseño de atención con sesgos geométricos: `RadialAttention` puede servir de inspiración para tareas de reconstrucción sobre grafos con estructura angular conocida (mallas, cristales, redes de sensores), aunque sin validación fuera de este dominio.

## Benchmarks y rendimiento

Resultados publicados en la model card para la tarea de reconstrucción del sector de 45° retenido (wedge):

| Modelo | wedge r | wedge MSE |
|---|---|---|
| Mean-patch floor | – | 0,0154 |
| MLP plano (sin aristas, sin pirámide) | 0,00 | 0,0286 |
| Pyramid pooling, sin aristas | 0,73 | 0,0177 |
| Honeycomb mesh, modelo completo | 0,90 | 0,0030 |

Ablaciones sobre el modelo completo:

| Variante | wedge r |
|---|---|
| Modelo completo | 0,90 |
| Sin armónicos angulares | 0,24 |
| Sin compuerta de arista aprendida | 0,08 |
| Aristas reordenadas al azar (mismas posiciones) | dentro de 2 puntos del honeycomb |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; el checkpoint pesa 1,7 MB y el modelo tiene 405.342 parámetros.
- GPU recomendadas: no necesarias; el autor entrena y ejecuta en CPU de un solo hilo.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU de teléfono (88 s de entrenamiento).
- Opciones de despliegue: servidor propio del repo (`python -m mandalanet.serve --model runs/main-hex/model.pt --port 8000`); no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~0,25 s por forward pass; ~1 s para pintar la página inicial del demo. No se reporta throughput por lotes.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras GNNs geométricas, masked autoencoders sobre grafos ni modelos de reconstrucción de mallas. El propio autor indica que la topología se extrajo de dibujos propios y no de un benchmark, lo que dificulta una comparación directa con alternativas de la literatura.

## Limitaciones y advertencias

- Es un prototipo de investigación, no un modelo fundacional: no procesa texto, no generaliza a imágenes arbitrarias y no tiene interfaz más allá del servidor de demo.
- El modelo solo reconstruye parches de un dibujo concreto de 128×128 de una teselación hexagonal; la cabeza de clasificación es una tarea secundaria menor.
- El resultado negativo publicado (aristas aleatorias a menos de 2 puntos del honeycomb) cuestiona que la geometría específica del dibujo sea la que aporta la mejora; conviene no sobreinterpretar el rendimiento como validación de la malla concreta.
- No se declara licencia sobre el código ni sobre los dibujos fuente; el uso comercial queda sin marco legal explícito.
- El checkpoint solo es funcional con el código del repositorio de GitHub (mismos nombres de capa y misma malla); no es portable a otros frameworks sin reimplementación.
- No hay datos publicados sobre sesgos, alucinación o comportamiento fuera de distribución más allá del sector de 45° retenido.
- El demo no está alojado en Hugging Face (solo se alojan Docker Spaces para cuentas PRO); requiere ejecución local.
- El repositorio en Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BoogerCheeseOnRye/mandala-gnn
- Página del proyecto y paper: https://boogercheeseonrye.github.io/mandala-gnn/
- Código y ablaciones completas: https://github.com/BoogerCheeseOnRye/mandala-gnn
- Dataset de ablaciones: https://huggingface.co/datasets/BoogerCheeseOnRye/mandala-gnn-ablations
