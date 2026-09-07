# Kovach-Enterprises/hyperneat-r8-compress

## Resumen

HyperNEAT × JAX compressor vs R8 es un compresor sin pérdidas desarrollado por Kovach-Enterprises, especializado en optimizar el grafo de recursos de aplicaciones tipo Android (drawables). En lugar de ser un modelo de lenguaje, se trata de una red CPPN (Compositional Pattern-Producing Network) evolucionada mediante HyperNEAT y ejecutada en JAX. Su función es decidir qué recursos mantener y cuáles descartar, reordenar el flujo de datos resultante y comprimirlo con LZMA o zlib, eligiendo el algoritmo que ofrezca mejores resultados.

El modelo se presenta como una alternativa a la optimización de recursos de R8, consiguiendo una reducción adicional del tamaño del paquete. Según las mediciones del autor, el método HyperNEAT alcanza 568 bytes frente a los 650 bytes de R8 optimizado con zlib9, una diferencia de -82 bytes. La integridad de los datos se verifica mediante SHA-256, preservando el hash original. El genoma de la red consta de 153 parámetros en formato float16, almacenados en `cppn_theta.f16`.

Aunque se trata de un proyecto experimental (0 descargas y 0 likes en HuggingFace), resulta relevante para desarrolladores e investigadores interesados en técnicas de compresión de recursos, neuroevolución aplicada y optimización de artefactos Android.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CPPN (Compositional Pattern-Producing Network) evolucionada con HyperNEAT |
| Parametros totales | 153 parámetros float16 (`cppn_theta.f16`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | f16 (float16) |

## Arquitectura y entrenamiento

El modelo se basa en una red CPPN, un tipo de red neuronal que genera patrones composicionales a partir de coordenadas espaciales. En este caso, la CPPN ha sido evolucionada mediante HyperNEAT, un algoritmo de neuroevolución que optimiza los pesos y la topología de la red para resolver una tarea concreta. La implementación utiliza JAX como framework de cálculo, lo que permite ejecutar el proceso en CPU o GPU.

El entrenamiento se realiza mediante un script de evolución (`src/evolve.py`), que optimiza el genoma de la red para maximizar la compresión del grafo de recursos. No se especifica el número de generaciones ni la composición del dataset de entrenamiento. La innovación principal reside en la combinación de tres técnicas: selección de recursos "true-live" (manteniendo los blobs realmente utilizados), reordenación del flujo de datos para mejorar la compresión y elección adaptativa entre LZMA y zlib según cuál produzca un resultado más pequeño. No se ha aplicado RLHF ni DPO, ya que no es un modelo generativo.

## Capacidades

- Compresión sin pérdidas de recursos drawable en un grafo de dependencias tipo Android.
- Mantenimiento de la integridad de los datos mediante verificación SHA-256 (hash preservado: `13499d575b6371f10ca8d252e9e43f34de314293e3d6879b4e6bd435572c4cd4`).
- Selección automática de recursos: descarta drawables sobre-mantenidos por librerías y fuerza la inclusión de blobs realmente vivos.
- Reordenación del stream de recursos para mejorar la ratio de compresión.
- Cambio dinámico entre LZMA y zlib, eligiendo el algoritmo que produzca un resultado más pequeño.
- Ejecución en CPU mediante `JAX_PLATFORMS=cpu`.
- Soporte de contenedor Podman mediante `./scripts/run-podman.sh`.

## Casos de uso

- Optimización de recursos en aplicaciones Android: el modelo puede integrarse en un pipeline de build para reducir el tamaño de los drawables empaquetados, consiguiendo un APK o AAB más ligero sin perder recursos necesarios.
- Integración en sistemas de CI/CD: gracias a su ejecución por línea de comandos, puede incorporarse como paso de post-procesado en Jenkins o GitHub Actions, automatizando la compresión de recursos tras cada compilación.
- Investigación en compresión de grafos de dependencias: el modelo sirve como referencia para estudiar cómo la neuroevolución puede resolver problemas de selección y reordenación de nodos en grafos de recursos.
- Mantenimiento de integridad en sistemas embebidos: al preservar el hash SHA-256 original, puede utilizarse en entornos donde se requiere verificar que los recursos comprimidos no han sido alterados.
- Evaluación comparativa de algoritmos de compresión: proporciona una base empírica para comparar el rendimiento de HyperNEAT frente a técnicas clásicas como zlib o LZMA en tareas de compresión de recursos.
- Empaquetado de recursos para aplicaciones con restricciones de tamaño: en escenarios donde el tamaño del paquete es crítico (por ejemplo, aplicaciones para dispositivos con almacenamiento limitado), el modelo ofrece una reducción adicional de hasta 82 bytes frente a R8 optimizado.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a una medición de compresión sin pérdidas con JAX 0.4.38. No se han encontrado benchmarks adicionales en la información disponible.

| Metodo | Bytes |
|---|---|
| Naive (sin shrink) zlib9 | 50031 |
| R8 + broad drawable keep zlib9 | 50031 |
| R8 optimizado shrink + zlib9 | 650 |
| HyperNEAT keep + reorder + lzma | 568 |
| Delta vs R8 opt zlib | -82 |

## Requisitos de hardware

- VRAM estimada: no aplica. El modelo se ejecuta en CPU mediante `JAX_PLATFORMS=cpu`.
- GPU recomendadas: no requiere GPU. Cualquier máquina con Python y JAX instalado puede ejecutar el script de evolución.
- Compatibilidad con GPU de consumo: no aplica, ya que no se necesita aceleración gráfica.
- Opciones de despliegue: script Python (`src/evolve.py`) o contenedor Podman (`./scripts/run-podman.sh`).
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tiempo de ejecución.

## Comparativa con modelos similares

| Metodo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperNEAT compressor | 153 float16 | no aplica | 568 bytes | MIT | HuggingFace |
| R8 optimizado shrink + zlib9 | no aplica | no aplica | 650 bytes | Apache 2.0 (Android Open Source Project) | Open source |
| Naive zlib9 | no aplica | no aplica | 50031 bytes | zlib | Open source |

## Limitaciones y advertencias

- Modelo experimental: presenta 0 descargas y 0 likes en HuggingFace, lo que indica una adopción muy limitada y falta de validación externa.
- Ámbito de aplicación muy restringido: solo está diseñado para comprimir recursos drawable tipo Android; no es aplicable a otros tipos de datos ni a tareas de lenguaje.
- Dependencia de JAX: requiere un entorno Python con JAX instalado, lo que puede complicar su integración en sistemas que no usan este framework.
- Coste computacional desconocido: el proceso de evolución puede ser costoso, pero no se han publicado datos sobre tiempo de ejecución ni recursos necesarios.
- Ausencia de documentación técnica extensa: no se proporciona información detallada sobre el algoritmo de evolución, el dataset de entrenamiento ni la configuración de hiperparámetros.
- Licencia MIT permite uso comercial, pero la especificidad del modelo limita su utilidad práctica en proyectos generales.
- No se garantiza compatibilidad con todas las versiones de R8, Android Gradle Plugin o formatos de recursos.

## Enlaces

- HuggingFace: https://huggingface.co/Kovach-Enterprises/hyperneat-r8-compress
- HyperNEAT (Wikipedia): https://en.wikipedia.org/wiki/HyperNEAT
- Otros enlaces: no disponibles en la información proporcionada.
