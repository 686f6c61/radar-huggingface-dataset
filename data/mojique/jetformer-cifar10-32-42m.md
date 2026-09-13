# mojique/jetformer-cifar10-32-42m

## Resumen

JetFormer CIFAR-10 32x32 42M es un modelo generativo de imágenes publicado por el usuario mojique en Hugging Face. Se trata de una implementación a pequeña escala de JetFormer, la arquitectura propuesta en el artículo arXiv:2411.19722, que combina un normalizing flow sobre parches de imagen con un decodificador autorregresivo de tipo transformer. El modelo tiene 42,2 millones de parámetros, se entrena desde cero sobre CIFAR-10 (imágenes de 32x32 píxeles) y es condicional por clase entre las diez categorías del dataset.

A diferencia de los modelos de difusión o de los enfoques con tokenizador externo (VQ-VAE y similares), este modelo es un modelo de verosimilitud de los píxeles crudos: no usa tokenizador preentrenado y calcula bits por sub-píxel directamente, lo que lo hace relevante para investigación en estimación de densidad y como referencia reproducible. La secuencia interna es corta (64 tokens de parche más 16 tokens de clase repetidos), de modo que no es un modelo de lenguaje ni admite condicionamiento textual.

Es relevante ahora porque ofrece un punto de comparación barato y reproducible (100 épocas en unas 8 horas sobre un Apple M5 Pro de 64 GB) entre flows y modelos autorregresivos, y porque publica pesos, configuración resuelta y ejemplos de muestras bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: normalizing flow de 32 acoplamientos de canales (cada uno un bloque ViT de anchura 192 y 3 cabezas sobre la rejilla 8x8 de parches 4x4) más decodificador autorregresivo estilo Gemma de 12 capas (anchura 384, 6 cabezas de consulta, 1 cabeza de clave/valor, MLP 1536, RoPE, dropout 0,1), con 16 tokens de clase repetidos y 256 componentes de mezcla gaussiana diagonal sobre 8 canales autorregresivos por token |
| Parámetros totales | 42,2 millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de lenguaje: 64 tokens de parche (rejilla 8x8 de parches de 4x4 píxeles, 48 canales por token) más 16 tokens de clase |
| Tipos de cuantización | No disponible. Solo se publican pesos en fp32; el muestreo admite autocast en bf16 para el decodificador (la cabeza afín del flow y la verosimilitud se mantienen en fp32) |
| Idiomas soportados | No aplica (generación de imágenes sin condicionamiento textual) |
| Licencia | MIT |
| Formato de pesos | `.pt` de PyTorch (formato de checkpoint 6, 161 MiB, pesos fp32, sin estado del optimizador). No se publican safetensors ni GGUF |
| Tamaño del repositorio | 0,2 GB |
| Fecha de publicación | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo factoriza la densidad de una imagen de 32x32x3 en dos etapas. Primero, un normalizing flow de 32 acoplamientos de canales con permutaciones aleatorias de canales transforma los píxeles; cada acoplamiento está parametrizado por un bloque ViT de anchura 192 y 3 cabezas que opera sobre la rejilla de 8x8 parches de 4x4 píxeles, con la escala afín acotada en 2. Después, un decodificador autorregresivo de 12 bloques estilo Gemma predice una mezcla de 256 gaussianas diagonales para los 8 primeros de los 48 canales de cada token de parche; los 40 canales restantes se factorizan bajo una gaussiana unitaria. No hay tokenizador preentrenado: el modelo es un modelo de verosimilitud de los píxeles crudos.

El entrenamiento usa la partición de entrenamiento de CIFAR-10 (50.000 imágenes) con volteos horizontales aleatorios, píxeles mapeados a [-1, 1] con ruido de dequantización uniforme y la partición de test como validación. El objetivo es bits por sub-píxel de la imagen cruda (verosimilitud de la mezcla más residuo gaussiano unitario menos el log-determinante del flow), con el currículo de ruido RGB del artículo (coseno de 32 a 0 en unidades de 8 bits), ruido latente de teacher forcing (desviación típica de hasta 0,3) y dropout de etiqueta de 0,1 para classifier-free guidance. La optimización comprende 100 épocas, lote de 128 (39.000 pasos de optimizador), AdamW con beta 0,9/0,95, tasa de aprendizaje máxima 3e-4 con 5 % de calentamiento lineal y decaimiento coseno hasta cero, weight decay independiente de la tasa de aprendizaje de 1e-4, recorte de gradiente en 1,0, semilla 0 y autocast bf16 dejando en fp32 la cabeza afín del flow y la verosimilitud. Todo el entrenamiento se ejecutó en un único Apple M5 Pro de 64 GB durante unas 8 horas.

## Capacidades

- Generación de imágenes de 32x32 píxeles condicionada por clase entre las diez categorías de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión).
- Modelado de densidad explícito: devuelve bits por sub-píxel, lo que permite evaluar verosimilitud sobre datos de validación.
- Muestreo configurable mediante classifier-free guidance (`--cfg-weight`, `--cfg-mode` con modos densidad, interpolación o ninguno), temperatura y método de muestreo (`sample`, `mean`, `mode`).
- Filtrado por identificadores de clase en la CLI (`--class-ids`) para generar lotes de una o varias clases concretas.
- Cálculo integrado de métricas FID e Inception Score con torch-fidelity contra el conjunto de entrenamiento de CIFAR-10 (`--fid --is`).
- Exportación y reanudación parcial: el repositorio permite exportar el checkpoint a formato 6 y arrancar un nuevo entrenamiento con `--init-from`; no admite `--resume-from` con estado porque el optimizador no se publica.
- Ejecución en CPU, CUDA y MPS (Apple Silicon) seleccionable en la construcción del modelo.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso, visión de entrada, audio ni generación de texto.

## Casos de uso

- Investigación en estimación de densidad: el modelo reporta bits por sub-píxel limpios sobre la partición de test (3,706), lo que permite comparar normalizing flows frente a modelos autorregresivos y de difusión con una métrica de verosimilitud y no solo con FID.
- Aumento de datos para clasificadores de CIFAR-10: se pueden generar lotes balanceados por clase con `--class-ids` y usar las imágenes sintéticas como regularización en el entrenamiento de clasificadores pequeños, midiendo el impacto con la partición de test real.
- Ablaciones controladas de guiado y muestreo: la CLI expone peso y modo de CFG, temperatura y método de muestreo, de modo que se puede estudiar el compromiso entre fidelidad (FID) y diversidad (Inception Score) sin reentrenar.
- Reproducción y docencia: el entrenamiento completo cabe en unas 8 horas en un portátil Apple M5 Pro de 64 GB, y el repositorio incluye la configuración resuelta y el comando de exportación, lo que lo hace apto para cursos prácticos de modelos generativos.
- Pruebas de detección de anomalías y out-of-distribution: al ser un modelo de densidad explícito, se puede usar la verosimilitud asignada a una imagen como puntuación para discriminar datos dentro y fuera de la distribución de CIFAR-10.
- Estudio de memorización y privacidad: comparar muestras generadas con el conjunto de entrenamiento permite analizar solapamiento y riesgo de reproducción de ejemplos en modelos generativos de baja resolución.
- Desarrollo de infraestructura: sirve como caso de prueba ligero para pipelines de exportación de checkpoints, integración con Hugging Face Hub y validación de métricas con torch-fidelity antes de escalar a modelos mayores.
- Prototipado de generación condicionada por clase sin tokenizador externo: útil para equipos que quieran evaluar arquitecturas de flujo más decodificador sin depender de un VQ-VAE preentrenado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (marcados como no verificados). Corresponden a CIFAR-10 32x32.

| Métrica | Valor | Condiciones | Verificado |
|---|---|---|---|
| FID | 22,6 | 5.000 muestras balanceadas por clase frente al conjunto de entrenamiento, CFG 2, temperatura 0,7 | No |
| Inception Score | 7,95 | Las mismas 5.000 muestras | No |
| Bits por sub-píxel (validación limpia) | 3,706 | Partición de test | No |

Notas sobre los datos: la model card etiqueta la tercera métrica como `bits_per_dim` pero su nombre la describe como "clean validation bits per sub-pixel"; el valor 3,706 corresponde a bits por sub-píxel. No se han publicado en la información disponible resultados comparativos con otros modelos ni la tabla completa de bits por sub-píxel por época (la model card incluye los encabezados de época 10, 30, 50, 70, 80, 90 y 100 con sus valores de ruido RGB, pero los valores de la fila de métricas aparecen truncados).

## Requisitos de hardware

- El checkpoint pesa 161 MiB en fp32, de modo que los pesos de inferencia ocupan menos de 1 GB; no se publica una cifra oficial de VRAM para inferencia. La estimación derivada del tamaño del checkpoint lo sitúa holgadamente por debajo de 1 GB con autocast bf16.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4090, etc., y también en CPU y en Apple Silicon vía MPS.
- El autor entrenó el modelo en un único Apple M5 Pro con 64 GB de memoria unificada. No se publica la VRAM necesaria para reentrenar; un equipo de 64 GB unificados es la única configuración documentada.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama, TGI ni GGUF. El despliegue se realiza con la librería propia `jetformer` (versión 0.1.0 para el checkpoint exportado, 0.1.1 para la instalación con extra de Hugging Face) instalada desde `git+https://github.com/alexojica/JetFormer.git`.
- Puntos de entrada disponibles: `jetformer-sample` (muestreo y métricas), `jetformer-export` (exportación de checkpoints) y `python -m jetformer.train` (entrenamiento o inicialización desde pesos).
- Latencia y throughput: no disponible. No se publican tiempos de generación por imagen ni imágenes por segundo.
- Carga del checkpoint con `torch.load(..., weights_only=True)`; el archivo contiene únicamente tensores, números, cadenas y contenedores simples.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. La comparación que sigue es estructural y cualitativa.

| Modelo | Tipo | Parámetros | Condicionamiento | Licencia | Disponibilidad | FID en CIFAR-10 |
|---|---|---|---|---|---|---|
| jetformer-cifar10-32-42m (mojique) | Flow de canales + decodificador autorregresivo | 42,2 M | Por clase (10 clases) | MIT | Pesos `.pt` en Hugging Face | 22,6 (declarado) |
| JetFormer (Tschannen et al., arXiv:2411.19722) | Flow más transformer autorregresivo, sin tokenizador | No disponible | No disponible | No disponible | No disponible | No disponible |
| Jet (arXiv:2412.15129) | Normalizing flow con acoplamientos de canales | No disponible | No es un modelo de imagen completo | No disponible | No disponible | No disponible |
| Otros generativos de CIFAR-10 (difusión, GAN) | Difusión o GAN | No disponible | Por clase | No disponible | No disponible | No disponible |

El valor de FID de 22,6 queda lejos de los mejores resultados publicados en CIFAR-10 en la literatura de difusión y GAN, algo esperable en un modelo de 42,2 M de parámetros entrenado 100 épocas en hardware de consumo y optimizado ante todo para verosimilitud.

## Limitaciones y advertencias

- Sesgos y dominio: el modelo solo ha visto CIFAR-10, 50.000 imágenes de 32x32 píxeles con diez clases muy gruesas y sesgos propios del dataset (fotografías de baja resolución, categorías desequilibradas en el mundo real, ausencia de rostros y de escenas complejas). No es un generador de imágenes de propósito general.
- Resolución y condicionamiento fijos: genera exclusivamente 32x32 píxeles y solo acepta una etiqueta de clase de CIFAR-10. No admite prompts de texto, imágenes de entrada, máscaras ni edición.
- Riesgo de alucinación en sentido generativo: las muestras pueden ser incoherentes o mezclar rasgos de varias clases, especialmente con temperaturas altas o pesos de CFG bajos. No existe un mecanismo de verificación factual porque no hay salida textual ni basada en conocimiento.
- Calidad medida: el FID declarado de 22,6 es alto en términos absolutos y todas las métricas están marcadas como no verificadas por el autor. El repositorio tiene 0 descargas y 0 "likes", por lo que no cuenta con validación independiente de la comunidad.
- Limitaciones de reproducibilidad: el checkpoint publicado no incluye el estado del optimizador, el planificador ni el estado del generador de números aleatorios, de modo que no se puede reanudar un entrenamiento con `--resume-from`; solo reiniciar desde los pesos con `--init-from`. El entrenamiento se realizó con MPS, lo que puede introducir diferencias numéricas frente a CUDA.
- Dependencia de código propio: no hay formatos estándar (safetensors, GGUF) ni integración con servidores de inferencia habituales; el uso requiere instalar la librería `jetformer` desde el repositorio de GitHub.
- Licencia: MIT, lo que permite uso comercial y modificación con atribución y sin garantías. No hay restricciones adicionales declaradas, pero tampoco se ofrece ninguna garantía de idoneidad para producción.
- Idiomas: no aplica, ya que el modelo no procesa ni genera texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mojique/jetformer-cifar10-32-42m
- Checkpoint directo: https://huggingface.co/mojique/jetformer-cifar10-32-42m/resolve/main/jetformer_cifar10_32_42m_100ep.pt
- Muestras de ejemplo (CFG 2, temperatura 0,7): https://huggingface.co/mojique/jetformer-cifar10-32-42m/resolve/main/samples_cfg2_t0.7.png
- Implementación y código de entrenamiento: https://github.com/alexojica/JetFormer
- Artículo de JetFormer: https://arxiv.org/abs/2411.19722
- Artículo de Jet (normalizing flow): https://arxiv.org/abs/2412.15129
- Dataset CIFAR-10 en Hugging Face: https://huggingface.co/datasets/uoft-cs/cifar10
- Los resultados de búsqueda web proporcionados no contienen ningún enlace relevante para este modelo: todos apuntan a hilos de foros de soporte de Microsoft sin relación con JetFormer ni con generación de imágenes.
