# dimondim0nych/SpesML-1.0

## Resumen

SpesML-1.0 es un generador de imágenes condicional por clase, de tamano muy reducido, especializado en formas geométricas de color plano sobre fondo blanco. Lo desarrolla el usuario dimondim0nych y se publica en Hugging Face bajo licencia MIT. No es un modelo de lenguaje ni un difusor de propósito general: es un decodificador condicional que transforma un vector latente y una etiqueta de forma en una máscara de 64×64 píxeles, a la que se aplica el color de forma separada para garantizar exactitud cromática.

El modelo emplea una arquitectura propia denominada Spes, consistente en un decodificador condicional con cuatro bloques de sobremuestreo, entrenado con un esquema de autoencoder variacional (BCE sobre máscara agudizada, Dice loss y divergencia KL con calentamiento lineal). Cuenta con 345.393 parámetros en float32, lo que lo sitúa en el rango de los modelos experimentales o de juguete, no de producción general.

Su relevancia es acotada y muy específica: sirve como banco de pruebas para generación condicional de formas sintéticas, como generador de datos sintéticos para tareas de visión artificial y como ejemplo didáctico de arquitecturas condicionales mínimas. No debe confundirse con un modelo generativo de imágenes de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador condicional Spes (vector latente + embedding de forma, cuatro bloques de sobremuestreo) |
| Parametros totales | 345.393 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; etiquetas de clase en inglés en la interfaz) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura Spes es un decodificador condicional que recibe un vector latente y un embedding de forma (una de cinco formas) y produce una máscara de 64×64 píxeles mediante cuatro bloques de sobremuestreo. El color se aplica por separado a partir de la etiqueta de color, de modo que cada color resultante es exacto y no se aprende de forma aproximada. El modelo tiene 345.393 parámetros y 369 "neuronas" contadas como canales de mapas de características. Los pesos se distribuyen en `model.safetensors` en float32.

El entrenamiento usa datos sintéticos generados de forma procedural: 300 imágenes por clase, 9.000 en total, con una forma de color plano por imagen, tamano, posición y rotación aleatorios, dibujadas a 4× de resolución con antialiasing y reducidas a 64×64. La función de pérdida combina entropía cruzada binaria por imagen sobre la máscara agudizada, Dice loss y divergencia KL con calentamiento lineal, en configuración de autoencoder variacional. Se optimiza con AdamW (lr 2e-3, decaimiento coseno, weight decay 1e-4), batch de 64 y 35 épocas, todo en CPU (Intel Core i5-1235U) en unos 44 minutos. No se documenta el uso de RLHF, DPO ni datos externos.

## Capacidades

- Generación condicional de imágenes de 64×64 píxeles con una forma geométrica y un color exacto sobre fondo blanco.
- Clasificación condicional en 30 clases: 6 colores (rojo, naranja, amarillo, verde, azul, morado) × 5 formas (círculo, cuadrado, triángulo, polígono, rombo).
- Control de tamano, posición y rotación de la forma dentro de la imagen, heredado de la distribución de entrenamiento.
- Generación por lotes mediante `--count N`, con salida en cuadrícula cuando N > 1.
- Escalado de la imagen de salida mediante `--scale N`.
- Reproducibilidad mediante semilla (`--seed N`).
- Muestreo desde la distribución previa N(0, I) mediante `--sampling prior` (resultados peores, especialmente fuera de círculos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de clasificadores de formas geométricas: el modelo puede producir lotes de máscaras con forma y color controlados, útiles para aumentar datasets de visión artificial en tareas de detección o segmentación de formas planas.
- Pruebas de pipelines de aumento de datos: al permitir fijar semilla y generar cuadrículas, se puede integrar en tests automatizados que verifiquen invariantes de color exacto y geometría controlada.
- Docencia y divulgación sobre autoencoders variacionales condicionales: el modelo, con 345.393 parámetros y entrenamiento en CPU en 44 minutos, sirve como ejemplo mínimo reproducible de VAE condicional con pérdida Dice y KL.
- Prototipado rápido de interfaces de generación condicional: el script `inference.py` con entrada interactiva de color y forma permite validar flujos de selección de atributos antes de escalar a modelos mayores.
- Benchmark de infraestructura de inferencia en CPU: por su tamano mínimo, permite medir latencia y throughput de despliegues ligeros sin depender de GPU.
- Generación de recursos gráficos simples para maquetas y pruebas de UI: iconos o indicadores de forma y color plano a 64×64, ampliables con `--scale`, para prototipos que no requieren calidad fotorrealista.
- Verificación de exactitud cromática en sistemas de render: al aplicar el color por separado de la máscara, sirve para comprobar que un pipeline downstream respeta valores RGB exactos definidos en `model.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no existe evaluación cuantitativa sobre datos reservados y que la precisión de forma varía entre clases y la novedad no se ha medido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos en float32 ocupan aproximadamente 1,4 MB (345.393 parámetros × 4 bytes).
- GPU recomendadas: no se requieren; el modelo se entrenó y se ejecuta en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para esta carga.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el entrenamiento documentado se hizo en una CPU Intel Core i5-1235U.
- Opciones de despliegue: PyTorch nativo mediante `inference.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles de forma numérica; el entrenamiento completo en CPU tardó unos 44 minutos, lo que sugiere inferencia por imagen en el orden de milisegundos en CPU, aunque no se publica medición.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni de modelos comparables de la misma categoría (generadores condicionales mínimos de formas geométricas) en la información disponible. Las alternativas genéricas de generación de imágenes condicional (difusores como Stable Diffusion o modelos tipo GAN) difieren en orden de magnitud en parámetros, resolución y propósito, y no se dispone de cifras comparativas publicadas para este modelo concreto.

## Limitaciones y advertencias

- Solo genera geometría plana: no produce otros objetos, fondos ni texturas.
- Las salidas siguen de cerca los ejemplos de entrenamiento; la novedad no se ha medido y el modo por defecto usa los latentes medios de las imágenes de entrenamiento (`latents.safetensors`), por lo que los resultados se parecen a los datos vistos.
- La precisión de forma varía entre clases y no hay evaluación cuantitativa sobre datos reservados.
- El muestreo desde N(0, I) con `--sampling prior` da resultados peores, especialmente para formas distintas del círculo.
- Resolución fija de 64×64 píxeles, sin soporte de otras resoluciones.
- Los datos de entrenamiento son sintéticos, generados de forma procedural y no publicados; no es posible auditar la distribución completa.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de desviación geométrica: formas mal formadas o posiciones fuera de distribución en modos de muestreo no supervisados.
- No se documentan sesgos demográficos ni lingüísticos por la naturaleza del modelo, pero tampoco se ha realizado ninguna auditoría de sesgo.
- Licencia MIT: permite uso comercial y modificación con atribución y conservación del aviso de copyright; no se especifican restricciones adicionales.
- Para producción: modelo experimental con 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento documentado; no recomendable como componente crítico sin validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/dimondim0nych/SpesML-1.0
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
