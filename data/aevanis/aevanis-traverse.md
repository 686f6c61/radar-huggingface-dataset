# Aevanis/Aevanis-Traverse

## Resumen

Aevanis-Traverse es un cabezal de percepción geométrica para robótica de locomoción y navegación autónoma, desarrollado por Aevanis. Su función es transformar una única imagen monocular RGB en un mapa denso de ocupación espacial 3D, una rejilla de seguridad de apoyos (foothold), ángulos de inclinación del terreno y coeficientes de riesgo de deslizamiento, sin necesidad de sensores LiDAR mecánicos. El modelo se presenta como una alternativa de bajo coste, peso y consumo a los sistemas tradicionales de percepción 3D.

La arquitectura combina un tallo híbrido basado en ConvNeXt, que preserva discontinuidades de profundidad y gradientes de sombra de alta frecuencia en 2D, con un upsampling transpuesto denso que expande tokens latentes de 14x14 a una rejilla de transitabilidad de 28x28. Sobre esa representación se ejecutan varias cabezas de tarea geométrica que predicen de forma concurrente normales del terreno (pitch y roll), coeficientes de fricción dinámica y mapas de apoyo seguro en un único forward pass.

El modelo está orientado a bucles de control en tiempo real en robots cuadrúpedos, bípedos y rovers, con una latencia declarada inferior a 2,8 ms (más de 150 Hz). Se distribuye bajo licencia Apache-2.0 y está etiquetado para despliegue en edge AI. El repositorio de HuggingFace figura con 0 GB de tamaño y sin descargas ni likes en el momento de la consulta, lo que sugiere una publicación muy reciente o un estado de disponibilidad incompleto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: tallo ConvNeXt + upsampling transpuesto denso + cabezas multi-tarea geométricas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no aplica (modelo de percepción por fotograma; entrada 1x3x224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt; `aevanis_traverse_nano.pt`) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un pipeline de percepción monocular con tres etapas. Primero, un tallo convolucional híbrido tipo ConvNeXt tokeniza la imagen de entrada preservando detalles de alta frecuencia relevantes para la estimación de profundidad, como bordes de discontinuidad y sombras. Segundo, un upsampling transpuesto denso expande los tokens latentes de 14x14 a una rejilla de 28x28 que representa la transitabilidad del terreno. Tercero, varias cabezas de affordance geométrica predicen simultáneamente el mapa de apoyos seguros, los ángulos de inclinación (pitch y roll) y el riesgo de deslizamiento superficial.

El modelo se comercializa en una variante denominada "nano" (`model_scale="nano"`), pensada para edge AI y bucles de control de alta frecuencia. No se especifican en la información disponible el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO, algo poco habitual en modelos de percepción robótica. Tampoco se detalla si el entrenamiento usó supervisión con ground truth de LiDAR, SLAM o datasets de terreno anotados.

La innovación principal declarada es la sustitución de LiDAR mecánico por geometría inferida de una sola cámara, con latencia inferior a 2,8 ms y salidas multi-tarea en un único forward pass, lo que facilita su integración en bucles de equilibrio y planificación de pasos.

## Capacidades

- Estimación de profundidad monocular y generación de pseudo-LiDAR denso a partir de una imagen RGB.
- Predicción de mapas de transitabilidad y apoyos seguros en una rejilla de 28x28.
- Estimación de normales del terreno y ángulos de inclinación (pitch y roll) con error declarado de ±1,8°.
- Predicción de coeficiente de fricción dinámica y riesgo de deslizamiento (salida escalar entre 0 y 1).
- Inferencia en tiempo real con latencia inferior a 2,8 ms (más de 150 FPS) en el variante nano.
- Diseñado para robótica cuadrúpeda, bípeda y rovers; no se documentan capacidades de tool calling, agentes ni multilingüismo.
- No se documentan capacidades de visión general, audio, thinking mode ni generación de texto.

## Casos de uso

- Navegación de robots cuadrúpedos en terreno irregular: el modelo genera una rejilla de apoyos seguros de 28x28 por fotograma, que el planificador de pasos puede usar para seleccionar puntos de apoyo estables en escaleras, rocas o pendientes.
- Control de equilibrio en bípedos: con latencia inferior a 2,8 ms, las salidas de pitch y roll alimentan el bucle de control postural a más de 150 Hz, permitiendo correcciones de inclinación en tiempo real.
- Rovers de exploración en exteriores: la estimación de riesgo de deslizamiento permite clasificar superficies como hielo, barro o grava suelta y ajustar la velocidad o la ruta antes de comprometer el avance.
- Sustitución de LiDAR en plataformas de bajo coste: al operar solo con una cámara monocular, reduce peso, consumo y coste en drones terrestres, robots de reparto o plataformas educativas donde un LiDAR mecánico es inviable.
- Inspección industrial y mantenimiento: un rover equipado con el modelo puede evaluar pendientes y superficies resbaladizas en plantas, almacenes o entornos de obra para planificar rutas seguras.
- Robótica de asistencia y logística interior: detección de desniveles, rampas y suelos pulidos en almacenes, con salidas de transitabilidad que el sistema de navegación puede integrar en su coste de ruta.
- Investigación en percepción monocular: como componente de referencia o baseline para comparar técnicas de pseudo-LiDAR y affordance geométrica en robótica de locomoción.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas internas de validación del propio modelo, no comparativas con otros sistemas:

| Metrica | Valor declarado |
|---|---|
| Dense foothold BCE loss | 0,1405 |
| Error de inclinación del terreno | ±1,8° |
| MSE de riesgo de deslizamiento | 0,00753 (objetivo < 0,010) |
| Latencia | < 2,8 ms (150+ Hz) |

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval o GSM8K, no aplicables a este modelo) ni comparativas con otros modelos de percepción en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo "nano" de percepción por fotograma con entrada 224x224, se espera un consumo moderado, pero no se publican cifras.
- GPU recomendadas: no disponible. El enfoque edge AI sugiere GPUs integradas o de gama baja para robótica, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: PyTorch nativo según el quickstart (`AevanisTraverseAgent`); no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama.
- Latencia y throughput: menos de 2,8 ms por fotograma (más de 150 FPS) según el autor; no se especifica el hardware de referencia de esa medición.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables con especificaciones verificables. La categoría (percepción monocular de terreno para robótica) incluye propuestas como Depth Anything o sistemas de traversability learning, pero no se aportan datos de comparación en la documentación del modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Aevanis-Traverse | no disponible | no aplica (percepción por fotograma) | Apache-2.0 | HuggingFace, repo de 0 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio figura con 0 GB de tamaño y sin descargas ni likes, lo que puede indicar que los pesos no están efectivamente publicados o que la publicación es incompleta; conviene verificar la disponibilidad real antes de integrarlo.
- Todas las métricas de rendimiento (±1,8°, MSE 0,00753, latencia < 2,8 ms) son declaraciones del autor sin validación externa ni comparativa pública.
- No se documentan los datos de entrenamiento, el dominio de terreno cubierto ni la robustez ante condiciones de iluminación adversas (noche, lluvia, deslumbramiento), lo que limita la evaluación de su generalización.
- La estimación monocular de profundidad es sensible a escalas y a ambigüedades geométricas; no se especifica cómo se calibra la escala métrica de las salidas.
- No se documentan sesgos ni riesgos de alucinación en el sentido lingüístico, pero sí existe riesgo de predicciones geométricas erróneas en superficies no vistas durante el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; no se indica si hay restricciones adicionales por patentes o datasets de entrenamiento.
- No hay información sobre cuantización, exportación a formatos de despliegue en edge (ONNX, TensorRT) ni requisitos mínimos de hardware, lo que dificulta planificar una integración en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Aevanis/Aevanis-Traverse
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
