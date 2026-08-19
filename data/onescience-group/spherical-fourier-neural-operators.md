# OneScience-Group/Spherical-Fourier-Neural-Operators

## Resumen

El paquete Spherical Fourier Neural Operator (SFNO) publicado por OneScience-Group es una adaptación independiente y ejecutable de la arquitectura de operadores neuronales esféricos propuesta en el artículo *Spherical Fourier Neural Operators: Learning Stable Dynamics on the Sphere* (Bonev et al., 2023). No se trata de un modelo preentrenado con pesos, sino de un paquete de verificación (*smoke package*) que integra la implementación oficial de NVIDIA `torch-harmonics` para realizar transformadas armónicas esféricas (SHT), entrenar un operador sobre campos esféricos sintéticos y ejecutar rollouts autorregresivos a corto plazo. Su propósito es facilitar la investigación en dinámica de sistemas en la esfera y servir como base para futuros experimentos con datos meteorológicos ERA5.

El paquete está orientado a la comunidad de ciencia de la Tierra y aprendizaje automático, con soporte para entornos GPU y DCU (aceleradores chinos). Incluye scripts de entrenamiento, inferencia y análisis de resultados, aunque las métricas generadas (RMSE y ACC) no son comparables con las del artículo porque no incorporan ponderación esférica ni climatología de referencia. La arquitectura se basa en bloques de operadores espectrales con transformadas armónicas esféricas, pero el tamaño del modelo en esta distribución es reducido (2 bloques, dimensión de embedding 8) y opera sobre campos de baja resolución (17×32). No se proporcionan pesos entrenados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador neuronal esférico con transformadas armónicas esféricas (SHT) basado en `torch-harmonics` |
| Parametros totales | no disponible (configuracion de humo: 2 bloques, embed dim 8) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de pronostico de campos, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se mencionan) |
| Idiomas soportados | en, zh (documentacion y metadatos) |
| Licencia | other (con terminos de terceros, ver `THIRD_PARTY.md`) |
| Formato de pesos | PyTorch `.pth` (checkpoints de entrenamiento) |

## Arquitectura y entrenamiento

El modelo implementa un operador neuronal esférico que aprende la evolucion de sistemas dinamicos sobre la esfera mediante transformadas armonicas esfericas (SHT). La arquitectura sigue el esquema del articulo de Bonev et al.: cada bloque aplica una SHT, filtra los coeficientes espectrales y realiza la transformada inversa. En esta distribucion, la configuracion es minima (2 bloques, dimension de embedding 8) y opera sobre campos sinteticos suaves de forma `[B,2,17,32]`. No se incluyen datos reales de ERA5; el entrenamiento se realiza con campos aleatorios generados en memoria, formando pares consecutivos en el tiempo. El proceso incluye entrenamiento multi-epoca, validacion temporal, programacion de tasa de aprendizaje y parada temprana. No se aplican tecnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La implementacion se apoya en `torch-harmonics` de NVIDIA y no reproduce los experimentos completos del paper (SWE/ERA5), que requieren datos reales, ponderacion esferica y un entrenamiento en dos etapas.

## Capacidades

- Verificacion de transformadas armonicas esfericas (SHT), filtrado espectral y SHT inversa.
- Entrenamiento e inferencia con campos esfericos sinteticos generados en memoria.
- Rollout autorregresivo a corto plazo para analisis de estabilidad.
- Guardado y recuperacion de checkpoints (entrenamiento, mejor modelo, historial).
- Generacion de metricas basicas (RMSE y ACC) y graficas comparativas.
- Soporte para entornos GPU (CUDA) y DCU (aceleradores chinos) mediante paquetes `onescience[earth-gpu]` y `onescience[earth-dcu]`.
- Interfaz preparada para futura integracion con datos ERA5 de 26 o 73 canales (requiere desarrollo adicional).

## Casos de uso

- Investigacion en operadores esfericos: el paquete permite validar la correcta implementacion de SHT y filtrado espectral, util para experimentos academicos sobre dinamica en la esfera.
- Verificacion rapida de entornos de desarrollo: al generar datos sinteticos sin descargas externas, es adecuado para comprobar la instalacion de `torch-harmonics` y el flujo de entrenamiento/inferencia en una maquina nueva.
- Prototipado de modelos de pronostico del tiempo: sirve como base para construir un modelo operativo con datos ERA5, aunque requiere anadir cargadores de datos, variables, divisiones formales y perdida ponderada por area.
- Pruebas de concepto en hardware DCU: al incluir instrucciones para entornos DCU, permite evaluar la viabilidad de entrenar operadores esfericos en aceleradores no NVIDIA.
- Educacion en aprendizaje automatico para ciencias de la Tierra: el codigo es legible y modular, ideal para ensenar conceptos de operadores neuronales y transformadas esfericas.
- Evaluacion de estabilidad a corto plazo: el script de inferencia genera rollouts de unos pocos pasos, util para estudiar la divergencia de modelos no entrenados o con pesos aleatorios (aunque no representa resultados reales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparables con el articulo original. El paquete incluye un script de analisis que calcula RMSE y ACC, pero el propio autor advierte que estas metricas no son fiables: el RMSE no incorpora pesos de integracion esferica y el ACC usa la media espacial de la muestra en lugar de una climatologia a largo plazo. Por tanto, no hay datos de rendimiento que puedan compararse con otros modelos de pronostico del tiempo.

## Requisitos de hardware

- CPU: puede ejecutar la configuracion pequena (campos 17×32, 2 bloques) sin problemas.
- GPU: recomendada para entrenamiento completo con ERA5 (no incluido en este paquete).
- VRAM estimada: no disponible (depende de la configuracion; la actual es minima).
- GPUs compatibles: cualquier GPU NVIDIA con CUDA; tambien aceleradores DCU mediante el paquete `onescience[earth-dcu]`.
- Opciones de despliegue: scripts Python directos con PyTorch; no se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de pronostico del tiempo (como FourCastNet, GraphCast o Pangu-Weather). Este paquete no incluye pesos preentrenados ni resultados de validacion, por lo que no es posible establecer una comparacion cuantitativa. Se limita a ser una implementacion de referencia para operadores esfericos.

## Limitaciones y advertencias

- No es un modelo preentrenado: no incluye pesos entrenados ni reproduce los resultados del articulo original.
- Configuracion reducida: el tamano del modelo (2 bloques, embed dim 8) es insuficiente para tareas reales de pronostico.
- Metricas no comparables: RMSE y ACC generados no usan ponderacion esferica ni climatologia, por lo que no deben utilizarse para evaluar calidad.
- Datos sinteticos: el entrenamiento se realiza con campos aleatorios suaves, sin unidades fisicas ni significado temporal real.
- Requiere desarrollo adicional: para usar con ERA5 es necesario implementar cargadores de datos, variables, divisiones temporales y perdida ponderada por area.
- Licencia "other": se remite a `THIRD_PARTY.md` para los terminos de terceros (incluido `torch-harmonics`); no se especifican restricciones de uso comercial.
- Sin soporte de tool calling ni capacidades de lenguaje: es un modelo de pronostico de campos, no un LLM.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/Spherical-Fourier-Neural-Operators
- Paper: https://proceedings.mlr.press/v202/bonev23a.html
- Implementacion oficial de NVIDIA: https://github.com/NVIDIA/torch-harmonics
- Repositorio principal de OneScience (Gitee): https://gitee.com/onescience-ai/onescience
- Repositorio principal de OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio de habilidades de OneScience (Gitee): https://gitee.com/onescience-ai/oneskills
- Repositorio de habilidades de OneScience (GitHub): https://github.com/onescience-ai/oneskills
