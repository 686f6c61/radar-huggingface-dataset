# CaiYuanhao/X-Gaussian

## Resumen

X-Gaussian es un método de reconstrucción y síntesis de vistas novedosas para imagen de rayos X y tomografía computarizada (CT), presentado en ECCV 2024 por Cai Yuanhao y colaboradores. No es un modelo de lenguaje: es un pipeline de reconstrucción 3D basado en *3D Gaussian Splatting* con un módulo de radiación diferenciable que modela la física de atenuación de rayos X, lo que permite reconstruir volúmenes CT directamente desde proyecciones 2D y renderizar vistas X-ray sintéticas desde ángulos arbitrarios.

El repositorio de Hugging Face (0,6 GB) contiene los pesos entrenados para cinco escenas CT (chest, foot, head, abdomen, pancreas) más tres escaneos reales, junto con el código PyTorch necesario para inferencia y optimización. La relevancia práctica está en que sustituye parte del coste computacional de la reconstrucción iterativa clásica (FBP, SART) por una representación explícita de gaussianas optimizable por gradiente, con tiempos de convergencia notablemente menores según los autores.

Es una herramienta de nicho para imagen médica e inspección no destructiva, no un modelo generativo de propósito general. Su licencia Apache 2.0 facilita el uso comercial, aunque el dominio de aplicación (datos clínicos) impone sus propias restricciones regulatorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D Gaussian Splatting con renderizador radiativo diferenciable (X-ray) |
| Parametros totales | no disponible (depende del número de gaussianas por escena; no se publica cifra agregada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia de texto) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa PyTorch; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints PyTorch (`.pth`); repo de 0,6 GB |
| Libreria | PyTorch |
| Escenas incluidas | 5 escenas CT + 3 escaneos reales |

## Arquitectura y entrenamiento

X-Gaussian representa el volumen mediante un conjunto de gaussianas 3D con posición, covarianza, opacidad y coeficientes de atenuación. Un renderizador radiativo diferenciable proyecta estas gaussianas a lo largo de los rayos X aplicando la ley de Beer-Lambert, de modo que la imagen sintética se obtiene integrando la atenuación acumulada. Esto permite optimizar la representación directamente contra proyecciones reales mediante descenso de gradiente, sin necesidad de reconstrucción volumétrica intermedia.

El entrenamiento se realiza por escena (no es un modelo fundacional preentrenado en un corpus masivo): se optimizan las gaussianas a partir de un conjunto de proyecciones X-ray o sinogramas CT. La innovación principal es el módulo de radiación diferenciable, que sustituye el renderizado óptico estándar de 3DGS por un modelo físico de atenuación, y un esquema de inicialización/crecimiento de gaussianas adaptado a la geometría cónica de rayos X. La model card no detalla el número de iteraciones, la composición exacta de los datasets ni si se emplea regularización adicional; esos datos deben consultarse en el paper (arXiv:2403.04116).

## Capacidades

- Reconstrucción 3D directa de volúmenes CT a partir de proyecciones 2D, sin paso intermedio de retroproyección filtrada.
- Síntesis de vistas X-ray novedosas desde ángulos no observados durante la optimización.
- Renderizado de volúmenes anatómicos (tórax, pie, cabeza, abdomen, páncreas) y de escaneos reales.
- Optimización por escena con convergencia por gradiente sobre la representación gaussiana.
- Exportación de la representación para visualización y renderizado en tiempo interactivo una vez optimizada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reconstrucción CT acelerada en investigación: optimizar el volumen directamente desde sinogramas reducidos para estudiar protocolos de baja dosis, aprovechando que el renderizador radiativo evita la retroproyección filtrada completa.
- Síntesis de vistas X-ray para aumento de datos: generar proyecciones desde ángulos arbitrarios a partir de un escaneo existente para entrenar detectores o segmentadores con más variedad angular.
- Inspección no destructiva industrial: reconstruir piezas metálicas o componentes electrónicos desde proyecciones X-ray y renderizar vistas internas para detectar poros o grietas.
- Docencia y visualización anatómica: renderizar volúmenes de tórax, cabeza o abdomen de forma interactiva para material formativo, usando las cinco escenas CT incluidas.
- Validación de algoritmos de reconstrucción: usar las escenas de referencia como *ground truth* sintético para comparar métodos clásicos (FBP, SART) frente a enfoques basados en gaussianas.
- Prototipado de pipelines de imagen médica: integrar el código PyTorch en flujos de experimentación con datos propios, dado que la licencia Apache 2.0 permite modificación y uso comercial.
- Investigación en *novel view synthesis* aplicada a rayos X: extender el método a nuevas geometrías de escaneo o modalidades (CBCT, fluoroscopia) partiendo del código liberado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (ECCV 2024, arXiv:2403.04116) para las métricas cuantitativas (PSNR, SSIM, LPIPS y tiempos de convergencia), que no se reproducen en el repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; depende del número de gaussianas y de la resolución de renderizado. El repo pesa 0,6 GB, lo que da una cota inferior del espacio de pesos, pero el consumo en inferencia/optimización es mayor.
- GPU recomendadas: no especificadas por el autor. Por la naturaleza del método (optimización por gradiente con renderizado diferenciable), se requiere una GPU NVIDIA con soporte CUDA; una RTX 3090/4090 (24 GB) es un punto de partida razonable para escenas de tamaño moderado, y A100/H100 para volúmenes grandes o barridos de hiperparámetros.
- ¿Cabe en GPU de consumo? Probablemente sí para las escenas incluidas en una GPU de 24 GB, aunque no hay confirmación oficial; verificar en el repositorio de GitHub.
- Opciones de despliegue: PyTorch nativo (scripts del repositorio de GitHub) y demo en Hugging Face Spaces. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Representación | Licencia | Disponibilidad |
|---|---|---|---|---|
| X-Gaussian | Gaussian splatting radiativo para X-ray/CT | Gaussianas 3D + renderizador de atenuación | Apache 2.0 | Pesos y código públicos |
| NeRF-based CT (p. ej. variantes de NeRF médico) | Campos de radiancia neuronales para reconstrucción | MLP implícita | variable según implementación | Código público en su mayoría |
| FBP / SART clásicos | Reconstrucción analítica e iterativa | Volumen voxelizado | dominio público / libre | Implementaciones múltiples (ASTRA, TIGRE) |

La comparación cuantitativa de rendimiento (PSNR, tiempo de convergencia) no está disponible en la información proporcionada y debe extraerse del paper.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo fundacional: no admite prompts de texto, tool calling ni razonamiento; cualquier uso fuera de reconstrucción/síntesis X-ray es inadecuado.
- El modelo se optimiza por escena; no generaliza a un volumen nuevo sin reoptimizar, lo que limita su uso como servicio preentrenado.
- Los pesos incluidos cubren cinco escenas CT y tres escaneos reales; su aplicabilidad a otras anatomías o geometrías no está garantizada.
- Riesgo de artefactos de reconstrucción con pocas proyecciones o geometrías fuera de distribución; validar siempre contra *ground truth* o reconstrucción clásica.
- Uso clínico: a pesar de la licencia Apache 2.0, cualquier aplicación diagnóstica requiere validación regulatoria (MDR en la UE, FDA en EE. UU.); el modelo no está certificado como dispositivo médico.
- Sesgos: los datasets de entrenamiento pueden sobrerrepresentar determinadas anatomías o poblaciones; no se documenta composición demográfica.
- No se documentan cuantizaciones ni formatos optimizados para despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/CaiYuanhao/X-Gaussian
- Dataset: https://huggingface.co/datasets/CaiYuanhao/X-Gaussian
- Demo: https://huggingface.co/spaces/CaiYuanhao/X-Gaussian
- Paper (arXiv): https://arxiv.org/abs/2403.04116
- Página del proyecto: https://caiyuanhao1998.github.io/project/X-Gaussian/
- Código (GitHub): https://github.com/caiyuanhao1998/X-Gaussian
- Artículo divulgativo (Zhihu): https://zhuanlan.zhihu.com/p/717744222
- Hilo en X (AK): https://x.com/_akhaliq/status/1765929288044290253
