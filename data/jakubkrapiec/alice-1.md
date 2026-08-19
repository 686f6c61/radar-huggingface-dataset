# jakubkrapiec/alice-1

## Resumen

Alice-1 es un modelo de aprendizaje automático diseñado para predecir el valor de CRF (Constant Rate Factor) necesario para alcanzar un objetivo de calidad VMAF en la codificación de vídeo. Desarrollado por Jakub Krąpiec, este modelo emplea LightGBM (Gradient Boosting Decision Trees) y se entrena sobre 1,76 millones de muestras extraídas de aproximadamente 54.000 curvas CRF→VMAF medidas en 18.098 vídeos de origen (material de archivo con licencia CC0/CC-BY y secuencias de prueba estándar). El modelo está pensado para pipelines de codificación por título o por escena, donde conocer el CRF correcto sin tener que realizar múltiples codificaciones de prueba supone un ahorro computacional significativo.

El modelo toma como entrada 20 características de contenido (estadísticas espaciales y temporales, resolución, codec, VMAF objetivo y características de sonda opcionales) y devuelve un CRF predicho junto con un intervalo de predicción al 80%. Cubre los codecs x264, x265, VP9 y AV1 (SVT-AV1) en resoluciones de 720p, 1080p, 1440p y 2160p, para valores de VMAF objetivo entre 60 y 95. La relevancia actual de Alice-1 radica en que permite optimizar el punto de operación de codificadores de vídeo de forma rápida y barata, sin necesidad de iteraciones de prueba y error.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LightGBM GBDT (Gradient Boosting Decision Trees) |
| Parámetros totales | No disponible (1.266 árboles, 511 hojas; tamaño de modelo 59,6 MB en texto) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible (modelo en formato de texto plano, no usa cuantización de pesos) |
| Idiomas soportados | No aplicable (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | `model.txt` (formato de texto de LightGBM) y archivos `model_q10.txt` / `model_q90.txt` para los cuantiles |

## Arquitectura y entrenamiento

Alice-1 se basa en un modelo LightGBM de la familia GBDT cuantil. La predicción puntual es la mediana (cuantil 50) de un conjunto de 1.266 árboles con 511 hojas. Los límites del intervalo de predicción (q10 y q90) se obtienen de dos modelos adicionales, `model_q10.txt` y `model_q90.txt`. El modelo fue entrenado con LightGBM 4.7.

El entrenamiento utilizó un conjunto de datos de 1,76 millones de muestras generadas a partir de ~54.000 curvas CRF→VMAF medidas sobre 18.098 vídeos de origen (vídeos de archivo CC0/CC-BY y secuencias de prueba estándar). Las características de entrada incluyen estadísticas de contenido (SI, TI, vmafmotion), resolución de origen y destino, codec (como variable categórica), VMAF objetivo y cuatro características de sonda opcionales que se obtienen de una codificación de prueba de 2 segundos. El modelo está diseñado para funcionar con características calculadas sobre el segmento de vídeo ya reescalado a la resolución objetivo (bicubic), lo que replica exactamente las condiciones de entrenamiento.

No se especifica el uso de RLHF o DPO; es un modelo de regresión cuantil supervisada.

## Capacidades

- Predicción de CRF para alcanzar un valor VMAF objetivo en codificación de vídeo.
- Soporte para cuatro codecs: x264, x265, VP9 y AV1 (SVT-AV1).
- Resoluciones de salida: 720p, 1080p, 1440p y 2160p.
- Rango de VMAF objetivo: 60–95.
- Proporciona intervalo de predicción al 80% (q10–q90) para evaluar la incertidumbre.
- Funciona con características de contenido ligeras (SI, TI, vmafmotion) que requieren un decodificado y un paso de filtro, sin necesidad de codificar el segmento completo.
- Incluye modo con sonda de codificación de 2 segundos (v2.0) para mayor precisión, o modo sin sonda (--no-probe) que mantiene la precisión a nivel v1.x.

## Casos de uso

- **Generador de escalera de codificación por título (per-title ladder):** Alice-1 puede predecir el CRF necesario para cada punto de la escalera (resolución y VMAF objetivo) sin tener que probar múltiples CRFs por cada punto, reduciendo el coste computacional de generar una escalera óptima.
- **Controlador de calidad por escena (constrained-quality encoder):** en un pipeline de codificación por escena, el modelo puede estimar el CRF para cada escena a partir de las características de contenido de la escena, garantizando una calidad uniforme (p. ej., VMAF fijo) con un solo pase de codificación.
- **Optimización de almacenamiento y ancho de banda:** al predecir el CRF que logra un VMAF objetivo, se puede seleccionar el punto de codificación más eficiente en bits para una calidad dada, reduciendo el tamaño de los archivos sin sacrificar calidad percibida.
- **Transcodificación adaptativa en plataformas de streaming:** el modelo permite ajustar dinámicamente el CRF para cada segmento de vídeo según el contenido, mejorando la eficiencia de la codificación en entornos de transcodificación masiva.
- **Investigación en codificación de vídeo:** sirve como herramienta de referencia para estudiar la relación entre características de contenido y calidad percibida (VMAF), facilitando la comparación de distintos codecs y resoluciones.
- **Integración en pipelines de análisis de vídeo:** se puede usar junto con herramientas como ffmpeg y libvmaf para decidir automáticamente el punto de operación de codificación en entornos de procesamiento de vídeo automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas comparativas en la model card ni en la documentación pública.

## Requisitos de hardware

- **CPU:** el modelo es ligero (57 MB de archivo de texto) y se ejecuta sin GPU. La inferencia es del orden de milisegundos por segmento, incluso en CPUs modestas.
- **Memoria:** menos de 1 GB de RAM para cargar el modelo y ejecutar las predicciones.
- **GPU:** no necesaria. El coste computacional principal proviene de la extracción de características (decodificación de vídeo y filtros ffmpeg), no del modelo en sí.
- **Dependencias:** Python 3.10+, `lightgbm`, `numpy`, `pandas` y un binario de `ffmpeg` con `libvmaf` (`vmafmotion`). Para el modo con sonda, se requiere también el CLI de `vmaf`.
- **Despliegue:** se integra en scripts Python o pipelines de procesamiento de vídeo. No requiere infraestructura de servidores de inferencia dedicada.

## Comparativa con modelos similares

No disponible. No se han identificado otros modelos públicos que realicen la misma tarea específica de predicción de CRF a partir de características de contenido y VMAF objetivo. La comparativa con modelos de codificación tradicionales (basados en reglas empíricas) no se encuentra documentada en la información disponible.

## Limitaciones y advertencias

- **Sesgos de datos:** el modelo se entrenó exclusivamente con vídeos de stock CC0/CC-BY y secuencias de prueba estándar. Puede no generalizar correctamente a contenido muy distinto (p. ej., vídeo generado por IA, contenido con ruido excesivo, o material de archivo con características muy diferentes).
- **Dependencia de características de sonda:** la precisión mejora notablemente con las características de sonda (v2.0), pero la sonda requiere una codificación de 2 segundos y medición de VMAF, lo que añade un coste de cómputo. Sin sonda, la precisión cae al nivel v1.x.
- **Escalado y resolución:** las características deben calcularse en la resolución objetivo con escalado bicubic. Cualquier desviación de este proceso (otro escalador, resolución distinta) puede degradar la precisión.
- **Rango de validez:** el modelo solo es válido para VMAF entre 60 y 95, y para las resoluciones y codecs especificados. Fuera de este rango, las predicciones no son fiables.
- **Licencia y uso comercial:** no se ha especificado la licencia del modelo. Se recomienda contactar con el autor antes de usarlo en producción comercial.
- **Alucinación o errores:** al ser un modelo de regresión, puede producir valores de CRF fuera del rango legal del codec. El script `predict.py` recorta y redondea el resultado, pero el usuario debe tener en cuenta que la predicción puede ser inexacta para casos extremos.
- **Dependencia de ffmpeg y libvmaf:** el funcionamiento correcto depende de una instalación de ffmpeg con el filtro `vmafmotion` y de la herramienta `vmaf` para las sondas. Fallos en estas herramientas pueden dar errores en tiempo de ejecución.

## Enlaces

- [Modelo en Hugging Face: jakubkrapiec/alice-1](https://huggingface.co/jakubkrapiec/alice-1)
- [Perfil de GitHub del autor: jakubkrapiec](https://github.com/jakubkrapiec)
