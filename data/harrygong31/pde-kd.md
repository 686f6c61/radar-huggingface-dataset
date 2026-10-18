# harrygong31/pde-kd

## Resumen

PDE-KD es un conjunto de pesos de dos mapas de características aprendidos (`pde-kd-frame` y `pde-kd-3d`) que forman parte de la métrica de evaluación distribucional PDE-KD, presentada en *A Distributional Evaluation Metric for Chaotic Physical Systems* (Gong, Jiang, He, Li, 2026). No es un modelo generativo ni un LLM: su función es proyectar estados de simulaciones de ecuaciones en derivadas parciales (PDEs) a un espacio de 512 dimensiones para comparar poblaciones de estados mediante una discrepancia de kernel. El repositorio lo publica el autor `harrygong31` en HuggingFace con licencia MIT y pipeline `feature-extraction`.

El mapa 2D es un ResNet-18 que recibe un frame de 13 canales canónicos a 512x512 y devuelve un vector de 512 dimensiones, además de una cabeza de 46 salidas. El mapa 3D es un ResNet-18 inflado que recibe una ventana de 20 frames consecutivos de 13 canales a 512x512 y devuelve también 512 dimensiones. Ambos se entrenaron en JAX/Flax sobre TPU v5e y se exportaron a PyTorch; el número exacto de parámetros no se publica, aunque los ficheros de pesos en float32 ocupan 45 MB y 133 MB respectivamente.

Su relevancia es práctica: los sistemas caóticos no se evalúan bien con errores punto a punto, y PDE-KD propone comparar distribuciones de trayectorias completas con las condiciones iniciales como unidad de evidencia. Estos pesos permiten reproducir esa métrica sin reentrenar los mapas, con verificación sha256 y uso en CPU o CUDA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 2D (`pde-kd-frame`) y ResNet-18 3D (`pde-kd-3d`); redes convolucionales, no transformer |
| Parámetros totales | no disponible; los pesos en float32 ocupan 45 MB (2D) y 133 MB (3D) |
| Parámetros activos | no aplica; no es un modelo MoE |
| Longitud de contexto | no aplica en tokens; entrada de 1 frame (2D) o ventana de 20 frames consecutivos (3D) |
| Tipos de cuantización | no disponible; solo se publican tensores float32, sin variantes cuantizadas |
| Idiomas soportados | no aplica; procesa campos físicos, no texto |
| Licencia | MIT |
| Formato de pesos | `.npz` con tensores float32 en layout PyTorch, sin pickle; incluye `.sha256.json` y `head_layout.json` |
| Entrada | 13 canales canónicos a 512x512; 1 frame (2D) o 20 frames (3D) |
| Salida | 512-d (media global); el mapa 2D añade una cabeza de 46 salidas |
| Cabeza 2D | 18 coeficientes de PDE, 9 logits de clase y 19 logits de régimen |
| Pipeline de HuggingFace | feature-extraction |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 en la información disponible |
| Fecha de creación en HuggingFace | 2026-10-18 |

## Arquitectura y entrenamiento

El mapa 2D es un ResNet-18 con entrada de 13 canales y resolución 512x512. Cada sistema dispersa sus campos en 13 ranuras canónicas, se normaliza con z-score por sistema y canal usando estadísticas del split de entrenamiento y se redimensiona bilinealmente a 512x512; no hay aumentación. La red produce un vector de 512 dimensiones tras un global mean pool y una cabeza empaquetada de 46 salidas: 18 coeficientes de PDE, 9 logits de clase y 19 logits de régimen. El objetivo combina entropía cruzada de 9 clases, MSE enmascarado con peso 2,0 sobre los coeficientes de PDE de la clase (por ejemplo, números de Rayleigh y Prandtl mapeados a [0,1]) y entropía cruzada con peso 0,5 sobre las etiquetas de régimen.

El mapa 3D continúa el entrenamiento 2D desde el paso 46.368, se infla a 3D (cada convolución salvo las proyecciones 1x1 de atajo gana una anchura temporal de tres frames, inicializada para reproducir la red 2D frame a frame) y se afina con clips de 20 frames, el mismo dato y el mismo objetivo, durante 129.312 pasos de 32 clips. El mapa 2D se entrenó con AdamW, tasa máxima 1e-4, 22.176 pasos (batch global 256 y luego 1.024), 11,1 M de frames y 1.298 horas de chip v5e. Los datos cubren nueve clases y 70.770/1.813/1.710 trayectorias de entrenamiento/validación/prueba; los splits retienen condiciones iniciales, no valores de coeficientes.

| Clase | Fuente | Supervisión |
|---|---|---|
| shear flow, Rayleigh-Bénard, Euler (fronteras abiertas y periódicas), active matter | The Well (CC-BY-4.0) | coeficientes de PDE |
| viscoelastic instability, Gray-Scott | The Well (CC-BY-4.0) | regímenes / patrones |
| compressible Euler (CE), Navier-Stokes (NS) | PDEgym de Poseidon (CC-BY-NC-4.0) | regímenes |

Ambos mapas se entrenaron en JAX/Flax sobre TPU v5e y se exportaron una vez a PyTorch; en frames de validación de Rayleigh-Bénard, el port coincide con el forward de JAX con diferencia absoluta máxima de 6,6e-7 para las features 2D y 1,8e-6 para las 3D.

## Capacidades

- Extracción de características de campos físicos en un vector de 512 dimensiones, con un mapa para un frame individual y otro para ventanas temporales de 20 frames.
- Construcción de la métrica PDE-KD: discrepancia de kernel entre una población de estados simulados y una población de referencia, usando la MMD cuadrática bajo el kernel polinómico cúbico de KID.
- Test de dos muestras a nivel de condición inicial (`two_sample_test`) para poblaciones con condiciones iniciales disjuntas, y test compartido para rollouts que parten de las condiciones iniciales de la referencia.
- Cabeza auxiliar en el mapa 2D con 18 salidas de coeficientes de PDE, 9 logits de clase y 19 logits de régimen.
- Cobertura de los nueve sistemas de entrenamiento y de 20 sistemas con estadísticas de canal comprometidas: los nueve anteriores más Turbulent Radiative Layer 2D, HRRR, ERA5 y ocho conjuntos de RealPDEBench, de los que el paper usa los dos de FSI.
- Integración con PyTorch en CPU o CUDA mediante el paquete `pdekd`, con descarga automática de pesos, verificación de sha256 por fichero y por tensor, y modo offline.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión natural, audio ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Evaluación de simuladores de PDEs caóticas: se embeben las trayectorias de referencia y las generadas por el simulador, se construye un `KidBucket` y se estima la discrepancia PDE-KD junto con un p-valor por permutación a nivel de condición inicial. Es adecuado porque la unidad de evidencia es la trayectoria completa y no un error punto a punto, que en sistemas caóticos puede ser engañoso.
- Benchmarking de operadores neuronales y modelos surrogate: para arquitecturas como FNO, DeepONet o Poseidon, se comparan las distribuciones de sus rollouts contra la referencia en los sistemas cubiertos, con condiciones iniciales de prueba disjuntas. El mapa 3D es preferible cuando importa la coherencia temporal de 20 frames.
- Control de regresión en solvers numéricos: tras cambiar una versión del solver, una malla o un esquema de integración, se calcula la PDE-KD entre la nueva población de estados y la referencia para detectar cambios distribucionales antes de que aparezcan fallos visibles.
- Selección de hiperparámetros y early stopping en el entrenamiento de surrogates: se usa la PDE-KD sobre validación con condiciones iniciales retenidas como criterio complementario al error medio, evitando seleccionar modelos que solo ajustan bien trayectorias concretas.
- Análisis de rollouts largos y sensibilidad a condiciones iniciales: con el test de IC compartida se evalúan rollouts que parten de las mismas condiciones iniciales que la referencia, y con el mapa 3D se analizan ventanas de 20 frames para estudiar la deriva temporal.
- Extracción de embeddings para análisis de regímenes: los vectores de 512 dimensiones pueden alimentar clustering, clasificación o visualización de estados, y la cabeza 2D permite obtener coeficientes de PDE, clase y régimen de forma auxiliar.
- Evaluación frente a reanálisis y datos reales: para HRRR, ERA5, Turbulent Radiative Layer 2D o los conjuntos FSI de RealPDEBench, se puede comparar una simulación con la población de referencia siempre que el sistema esté entre los 20 con estadísticas comprometidas y se respete el preprocesado.
- Despliegue offline en HPC o entornos aislados: el paquete `pdekd` permite descargar los pesos en una máquina con red, verificarlos con `sha256sum -c SHA256SUMS`, colocarlos en `$PDEKD_ASSETS` y activar `PDEKD_OFFLINE=1` para su uso sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No procede comparar MMLU, HumanEval o GSM8K: el modelo no es generativo de texto.

| Comprobación técnica | Mapa 2D | Mapa 3D |
|---|---|---|
| Diferencia absoluta máxima JAX vs PyTorch en frames de validación de Rayleigh-Bénard | 6,6e-7 | 1,8e-6 |

Esta tabla no es un benchmark de calidad predictiva; mide la fidelidad del port de JAX/Flax a PyTorch.

## Requisitos de hardware

- Requisitos oficiales: no disponibles. El paquete se instala con PyTorch en versión CPU o CUDA según la plataforma.
- VRAM estimada: no hay cifra oficial. Los pesos son pequeños (45 MB para el mapa 2D y 133 MB para el 3D), pero las activaciones dominan. Como estimación orientativa no validada, el mapa 2D debería funcionar en GPUs de consumo con 4-8 GB para lotes pequeños; el mapa 3D, con entrada de 20x13x512x512 y convoluciones 3D, requiere probablemente 16-24 GB para lotes pequeños.
- GPU recomendadas: no se especifican. Por memoria, una RTX 4090 (24 GB), una A100 (40/80 GB) o una H100 son opciones razonables para el mapa 3D; el mapa 2D cabe en GPUs de consumo. CPU es posible, pero no se publican tiempos.
- Despliegue: `pdekd` sobre PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje. La descarga automática verifica sha256; los assets se guardan en `$PDEKD_ASSETS`, por defecto `~/.cache/pdekd` o `$XDG_CACHE_HOME/pdekd`.
- Latencia y throughput: no publicados.
- Almacenamiento: repositorio de 0,2 GB; ficheros de pesos de 45 MB y 133 MB.

## Comparativa con modelos similares

| Modelo | Entrada | Salida | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PDE-KD frame (2D) | 1 frame, 13x512x512 | 512-d + cabeza de 46 salidas | no disponible; pesos de 45 MB | 1 frame | MIT | HuggingFace |
| PDE-KD 3D | 20 frames, 13x512x512 | 512-d | no disponible; pesos de 133 MB | 20 frames | MIT | HuggingFace |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible | no se han identificado en la información proporcionada |

No se han identificado en la información proporcionada otros mapas de características aprendidos para evaluación distribucional de PDEs comparables. Las métricas FID/KID estándar para imágenes no son equivalentes y no se aportan resultados frente a ellas.

## Limitaciones y advertencias

- No es un modelo generativo ni un LLM: no genera texto, código, imágenes naturales ni audio; no admite prompts, tool calling ni agentes.
- Alcance limitado a los nueve sistemas de entrenamiento y a los 20 sistemas con estadísticas comprometidas. No se documenta en la información disponible la generalización a otras PDEs, mallas, resoluciones o regímenes; el preprocesado fija 512x512.
- Preprocesado estricto: 13 canales canónicos, z-score por sistema y canal con estadísticas de entrenamiento, redimensionado bilineal a 512x512 y ninguna aumentación. Un preprocesado distinto invalida la comparación.
- El mapa 2D tiene una cabeza de 46 salidas; el mapa 3D solo produce features de 512 dimensiones. No se debe usar la cabeza 2D con el mapa 3D.
- Licencia de los pesos MIT, pero los datos de entrenamiento incluyen The Well (CC-BY-4.0) y PDEgym de Poseidon (CC-BY-NC-4.0). El uso comercial de los pesos debería revisarse a la luz de la licencia no comercial de parte de los datos; esto no constituye asesoramiento legal.
- Solapamientos y duplicados divulgados: en Euler con fronteras abiertas y gamma=1,22, el directorio de entrenamiento contenía las trayectorias de prueba 0-49 de The Well; The Well duplica trayectorias entre splits (shear flow: 89 de 112 trayectorias
