# n4ze3m/yatm-quickdraw-diffusion

## Resumen

El modelo `n4ze3m/yatm-quickdraw-diffusion`, desarrollado por el usuario n4ze3m, es un modelo de difusión condicional por clase que genera garabatos de 32x32 píxeles en escala de grises, inspirado en el dataset Quick, Draw! de Google. Con apenas 1,5 millones de parámetros (6,1 MB en fp32), está diseñado para ejecutarse íntegramente en el navegador mediante ONNX Runtime, permitiendo un muestreo DDIM completo de 25 pasos sin necesidad de servidor. El modelo forma parte del proyecto "You Are the Model", un juego diario de dibujo donde el jugador interviene en el bucle de denoising, seleccionando la predicción de ruido que se aplica en cada paso, lo que hace que una mala elección descarrile el dibujo.

Técnicamente es un U-Net condicional por clase con predicción de epsilon, entrenado sobre 24 clases de garabatos más una clase nula para guidance libre de clasificador. El modelo se distribuye bajo licencia CC BY 4.0, igual que el dataset original. Su relevancia radica en demostrar que modelos de difusión extremadamente compactos pueden ser interactivos y ejecutarse en tiempo real en entornos web, abriendo la puerta a aplicaciones creativas y educativas de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net condicional por clase, predicción de epsilon |
| Parametros totales | 1.525.761 (6,1 MB en fp32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | fp32 (formato ONNX), bf16 en entrenamiento |
| Idiomas soportados | No aplica (generación de imágenes) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (opsed 17), PyTorch (ema.pt) |

## Arquitectura y entrenamiento

El modelo es un U-Net convolucional con condicionamiento por clase, entrenado para predecir el ruido (epsilon) añadido a una imagen limpia en un proceso de difusión. Utiliza un schedule de ruido coseno con 1000 pasos de entrenamiento, y en inferencia se emplea un muestreador DDIM con 25 pasos y guidance 3.0 (classifier-free guidance). La entrada es un tensor de ruido de forma `[batch, 1, 32, 32]`, un timestep `t` (0-999) y un índice de clase `y` (0-23, o 24 para la clase nula). La salida es la predicción de epsilon.

El entrenamiento se realizó durante 60.000 pasos con batch de 256, optimizador AdamW, EMA con factor 0.9995 y precisión bf16, en una NVIDIA GeForce RTX 3090 durante 1,43 horas (coste estimado de 0,221 dólares). El dataset usado es Google Quick, Draw! (`numpy_bitmap` de 28x28, rellenado a 32x32), con 12.000 dibujos por clase, filtrados para eliminar vacíos, sobre-inked y duplicados exactos, y divididos de forma determinista. El modelo se distribuye en ONNX para su uso en navegador, junto con un fichero de pesos PyTorch (EMA) para investigación.

## Capacidades

- Generación de garabatos de 32x32 en escala de grises (valores en [-1, 1]) para 24 clases concretas: gato, pez, flor, casa, velero, cara sonriente, estrella, paraguas, sobre, camiseta, helado, manzana, plátano, escalera, rayo, montaña, pantalones, copa de vino, gafas, muñeco de nieve, coche, avión, mano y guitarra.
- Condicionamiento por clase con soporte para classifier-free guidance (guidance scale 3.0 recomendada).
- Inferencia rápida y ligera: 1,5 millones de parámetros, suficiente para ejecutar un muestreo DDIM de 25 pasos en el navegador (según la descripción del autor).
- Reproducibilidad: los ficheros `yatm_v2.abar.json` y `yatm_v2.meta.json` permiten al muestreador JavaScript replicar exactamente el schedule de ruido y los parámetros de generación, garantizando que el resultado en navegador coincide con el de Python (diferencia máxima de 4,1e-03).
- Interactividad: el modelo está pensado para ser integrado en un juego donde el usuario decide qué predicción de ruido aplicar en cada paso, lo que requiere una inferencia rápida y de bajo coste.

## Casos de uso

- Juego interactivo de dibujo (el caso original): el modelo alimenta "You Are the Model", donde el jugador guía el proceso de denoising. Su pequeño tamaño permite ejecutar la inferencia en el cliente, sin latencia de red.
- Herramienta educativa para explicar difusión: al ser tan compacto y ejecutable en navegador, puede usarse como demo interactiva en clases de deep learning para visualizar cómo funciona el proceso de denoising paso a paso.
- Generación de sprites para prototipos: desarrolladores de juegos indie pueden usarlo para crear sprites de 32x32 de objetos simples (gatos, casas, coches, etc.) de forma procedural, aunque la resolución es baja y requiere postprocesado.
- Banco de pruebas para optimización de modelos ONNX: al ser un modelo pequeño con pesos en ONNX, sirve para evaluar técnicas de cuantización, pruning o compilación para web (WebAssembly, WebGPU).
- Experimentación con classifier-free guidance: su implementación sencilla (dos pasadas por muestra) permite estudiar el efecto de la escala de guidance en la calidad y diversidad de muestras con un coste computacional mínimo.
- Generación de arte generativo: artistas pueden integrar el modelo en proyectos de arte generativo basados en garabatos, aprovechando la licencia CC BY 4.0 para uso comercial con atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como FID, IS) en la información disponible. Sin embargo, la model card incluye una evaluación propia mediante un clasificador CNN (precisión del 95,4% sobre dibujos reales de test), que etiqueta correctamente el 99,9% de las muestras generadas con semilla fija y guidance 3.0. La clase con peor resultado es `coche` con un 98,4%. Además, se verifica la paridad entre Python y ONNX Runtime con una diferencia máxima absoluta de 4,1e-03 en un muestreo completo de 25 pasos.

| Métrica | Valor |
|---|---|
| Precisión del clasificador (test) | 95,4% |
| Muestras generadas etiquetadas correctamente (guidance 3.0) | 99,9% |
| Peor clase (coche) | 98,4% |
| Diferencia máx. Python vs ONNX Runtime (25 pasos) | 4,1e-03 |

Estos datos son mediciones del autor, no comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB (el modelo pesa 6,1 MB en fp32; la inferencia de un batch pequeño es trivial para cualquier GPU moderna, incluso integradas).
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU (por ejemplo, en un portátil) o en cualquier GPU con soporte ONNX Runtime. El entrenamiento se realizó en una RTX 3090, pero la inferencia es mucho menos exigente.
- En consumer GPU: sí, cabe en cualquier tarjeta, incluidas las de gama baja (GTX 1650, RTX 3050) y también en iGPU.
- Opciones de despliegue: ONNX Runtime (web, Python, C++), PyTorch (para el fichero ema.pt), y posiblemente en navegador mediante ONNX Runtime Web (la descripción indica que está diseñado para ello).
- Latencia y throughput: no se proporcionan mediciones exactas, pero al ser un modelo de 1,5M de parámetros y 25 pasos DDIM, se espera una generación de una imagen en milisegundos en GPU y en decenas de milisegundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. En la búsqueda se encontró `jamesaasher/quickdraw-text-diffusion`, un modelo de difusión condicionado por texto que genera garabatos de 64x64 usando CLIP, pero no se tienen sus especificaciones ni resultados. Ambos comparten el mismo dataset y objetivo (generar garabatos estilo Quick, Draw!), pero difieren en el tipo de condicionamiento (clase vs texto) y resolución. No hay datos de rendimiento comparables.

## Limitaciones y advertencias

- Resolución fija de 32x32: no es adecuado para aplicaciones que requieran imágenes de mayor tamaño sin un postprocesado (upscaling).
- Número limitado de clases (24): no cubre todos los conceptos del dataset Quick, Draw! (que tiene 345 categorías).
- Posibles sesgos del dataset: Quick, Draw! contiene dibujos de usuarios de internet, lo que puede reflejar sesgos culturales y demográficos en la representación de ciertos objetos (por ejemplo, la forma de dibujar una casa o un coche).
- Sin control fino de la composición: al ser un modelo condicional por clase, no permite generar variaciones controladas mediante texto o atributos específicos; solo la clase global.
- Licencia CC BY 4.0: permite uso comercial siempre que se atribuya la autoría. No hay restricciones adicionales, pero se debe cumplir la atribución.
- Riesgo de alucinación visual: como cualquier modelo generativo, puede producir garabatos deformes o irreconocibles, especialmente con guidance baja o semillas adversas.
- Dependencia del ecosistema ONNX: el fichero principal es ONNX opsed 17; para usarlo en otros frameworks puede requerir conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/n4ze3m/yatm-quickdraw-diffusion
- Dataset Quick, Draw! (Google): https://github.com/googlecreativelab/quickdraw-dataset
- Página del juego Quick, Draw!: https://quickdraw.withgoogle.com/
- Datos de Quick, Draw!: https://quickdraw.withgoogle.com/data
- Modelo similar (text-conditional): https://huggingface.co/jamesaasher/quickdraw-text-diffusion
