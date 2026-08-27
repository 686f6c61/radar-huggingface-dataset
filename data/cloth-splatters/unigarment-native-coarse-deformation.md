# Cloth-splatters/unigarment-native-coarse-deformation

## Resumen

UniGarment native coarse — deformation es un modelo de correspondencia densa entre nubes de puntos de prendas, desarrollado por el equipo Cloth-splatters como parte del framework UniGarmentManip. Su objetivo es establecer correspondencias punto a punto entre una prenda deformada y una plantilla canónica, lo que resulta esencial para tareas robóticas de manipulación de ropa como desplegar, plegar o colgar. No se trata de un modelo de lenguaje ni de un estimador de estado, sino de un descriptor basado en PointNet++ con 512 características, entrenado desde cero sobre el conjunto de datos DexGarmentLab (colección de elevación/deformación del 22 de agosto de 2026).

El modelo se publica con licencia MIT y se distribuye en tres checkpoints específicos por categoría de prenda: tops, dress y trousers. Cada checkpoint incluye su configuración de entrenamiento exacta, métricas de validación y un barrido de deformación reservado. Según la model card, es la mejor receta de deformación completada hasta la fecha según las métricas de correspondencia densa, con un error medio de 2,28 cm y un 56,61 % de puntos dentro de 2 cm en las categorías de prueba. Su relevancia radica en ofrecer un componente reutilizable y reproducible para sistemas de manipulación de prendas, con un tamaño de repositorio de solo 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet++ descriptor (backbone UniGarment) |
| Parametros totales | no disponible (descriptor de 512 features) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa nubes de puntos, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo emplea un backbone PointNet++ adaptado por UniGarment, que produce descriptores de 512 características por punto. Se entrena desde cero con la pérdida de correspondencia gruesa publicada en UniGarmentManip, que combina supervisión a nivel de punto y a nivel semántico. El entrenamiento se realizó con el optimizador Adam (LR 1e-3, weight decay 1e-5), batch size 16 y 40.000 pasos por categoría. Se aplicó una probabilidad de pares exactos entre fases de 0,75, lo que fuerza al modelo a aprender correspondencias robustas ante deformaciones grandes. El código de entrenamiento está disponible en el repositorio UniGarmentManip, con un registro de recetas reproducible (`marlowe_matrix.json`) y un lanzador de manifiestos.

## Capacidades

- Correspondencia densa punto a punto entre nubes de puntos de prendas deformadas y una plantilla canónica.
- Soporte para tres categorías de prenda: tops, dresses y trousers, con checkpoints específicos por categoría.
- Predicción de correspondencias semánticas (identificación de partes de la prenda) además de correspondencias geométricas.
- Métricas de evaluación integradas: error medio denso, porcentaje de puntos dentro de 2 cm, exactitud de surface-ID, error semántico y tasa de intercambio izquierda/derecha.
- No es un modelo generativo ni de lenguaje; su salida son mapas de correspondencia, no texto.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Desplegado robótico de prendas: el modelo proporciona correspondencias entre la configuración actual de la prenda y una plantilla, permitiendo al robot planificar agarres y movimientos para extenderla sobre una superficie.
- Plegado autónomo de ropa: al conocer la correspondencia densa, el sistema puede identificar los puntos de agarre adecuados y secuenciar los pliegues necesarios.
- Colgado de prendas en perchas: la correspondencia semántica ayuda a localizar el cuello o la cintura para posicionar la prenda correctamente.
- Clasificación y organización de ropa: aunque no es un clasificador, las correspondencias permiten normalizar la pose de la prenda antes de aplicar algoritmos de clasificación.
- Simulación de deformaciones: el modelo puede usarse para transferir deformaciones entre prendas de la misma categoría, útil en entornos de simulación robótica.
- Benchmarking de métodos de correspondencia: al publicar métricas y checkpoints, sirve como referencia para comparar nuevas técnicas de correspondencia densa en prendas.

## Benchmarks y rendimiento

La model card reporta métricas sobre tres categorías de prueba reservadas (macro promedio, semilla 0):

| Metrica | Resultado |
|---|---:|
| Dense mean error | 2,28 cm |
| Dense within 2 cm | 56,61 % |
| Exact surface-ID top-1 | 12,32 % |
| Semantic mean error | 5,01 cm |
| Semantic within 5 cm | 64,78 % |
| Left/right swap rate | 1,95 % |

No se han publicado resultados en benchmarks estándar tipo MMLU o HumanEval, ya que no es un modelo de lenguaje. Los desgloses por categoría y por fase/bin están disponibles en los archivos `test_metrics.json` de cada checkpoint.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU en la documentación disponible.
- Dado que el modelo es un descriptor PointNet++ de 512 características y el repositorio pesa 0,1 GB, es razonable esperar que se ejecute en GPUs de consumo como una RTX 3060 o superior, aunque no hay datos confirmados.
- El código de carga usa PyTorch y CUDA (`cuda:0`), por lo que se asume un entorno con GPU NVIDIA.
- No se mencionan opciones de despliegue como vLLM u Ollama, ya que no es un modelo de lenguaje. La inferencia se realiza mediante el loader del repositorio (`build_descriptor_model` y `load_adapted_checkpoint`).
- No se dispone de estimaciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El campo queda pendiente de evaluación externa.

## Limitaciones y advertencias

- No es un estimador de estado ni un modelo de dinámica: solo produce correspondencias, no predice la evolución temporal de la prenda.
- Entrenado únicamente para tres categorías de prenda; su uso fuera de estas categorías puede producir resultados incorrectos.
- Las métricas reportadas son medias sobre categorías de prueba; el rendimiento puede variar significativamente según la fase de deformación o la complejidad de la prenda.
- La tasa de intercambio izquierda/derecha (1,95 %) indica que aún existen errores de simetría que pueden afectar a tareas de manipulación.
- La exactitud de surface-ID top-1 es baja (12,32 %), lo que sugiere que la identificación precisa de puntos individuales es limitada; la correspondencia semántica es más fiable.
- Licencia MIT permite uso comercial, pero el modelo depende de código externo (DexGarmentLab GAM PointNet++ y UniGarmentManip) cuyas licencias deben verificarse por separado.
- No se proporcionan garantías de robustez ante prendas muy arrugadas o con oclusiones severas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cloth-splatters/unigarment-native-coarse-deformation
- Paper UniGarmentManip (arXiv): https://arxiv.org/abs/2405.06903
- Página del proyecto UniGarmentManip: https://warshallrho.github.io/unigarmentmanip/
- Perfil del autor en HuggingFace: https://huggingface.co/Cloth-splatters
