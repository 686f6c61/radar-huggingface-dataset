# Kovach-Enterprises/hyperneat-r8-compressor

# Ficha técnica: HyperNEAT R8 Compressor

## Resumen

El modelo HyperNEAT R8 Compressor, desarrollado por Kovach-Enterprises, es una herramienta de optimización de recursos para Android que utiliza neuroevolución para reducir el tamaño de los APK. En lugar de ser un modelo de lenguaje, se trata de una red neuronal evolutiva (Compositional Pattern Producing Network, CPPN) implementada en JAX, que consulta un sustrato bidimensional de código y recursos para decidir qué nodos eliminar del grafo de aplicación. El objetivo es superar las limitaciones del shrinkage de recursos estándar de Android, concretamente de la opción `android.r8.optimizedResourceShrinking=true` (R8-opt), logrando reducciones adicionales de tamaño de hasta un 41% en los benchmarks publicados.

El modelo no es un reemplazo de R8: no emite DEX, sino que genera un keep-set (conjunto de nodos a conservar) que coincide con el oráculo runtime-live, es decir, la máxima reducción segura posible. Está diseñado para ejecutarse como un paso posterior a R8-opt en un entorno JAX, y los pesos evolucionados consisten en 241 parámetros almacenados en archivos `.npy`. Su relevancia actual radica en la importancia de reducir el tamaño de las aplicaciones Android para mejorar la distribución en Google Play y la experiencia de usuario en dispositivos con almacenamiento limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Compositional Pattern Producing Network (CPPN) evolucionada mediante HyperNEAT |
| Parámetros totales | 241 floats (parámetros evolucionados) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .npy (resultados/*_theta.npy) |

## Arquitectura y entrenamiento

El modelo emplea HyperNEAT (Hypercube-based NeuroEvolution of Augmenting Topologies), una técnica de neuroevolución que evoluciona una CPPN. La CPPN genera un patrón de activación sobre un sustrato 2-D que representa los nodos de código y recursos de la aplicación. Los nodos cuya activación cae por debajo de un umbral se eliminan, siempre que no sean necesarios para el runtime. El entrenamiento se realizó con JAX 0.4.38 en CPU, con la semilla 20260907, y no utilizó backpropagation ni RLHF/DPO; el proceso es evolutivo.

La innovación principal es la aplicación de neuroevolución a la optimización de recursos de Android. El keep-set generado por HyperNEAT parte del keep-set de R8-opt y solo elimina nodos que R8-opt conserva de forma conservadora (por ejemplo, por reflexión o JNI) pero que no están en el oráculo runtime-live. Los resultados reportados indican que el modelo alcanza la máxima reducción segura posible en los benchmarks evaluados.

## Capacidades

- Optimización de tamaño de APK: reduce el tamaño de los recursos eliminando nodos no necesarios, con reducciones del 39% al 41% frente a R8-opt en los benchmarks publicados.
- Compatibilidad con el pipeline de Android: funciona sobre el keep-set de R8-opt y no requiere cambios en el proceso de compilación estándar.
- Generación de keep-sets: el modelo produce un conjunto de nodos a conservar que coincide con el oráculo runtime-live, garantizando que no se eliminen nodos necesarios.
- No es un modelo de lenguaje: no genera texto, código, razonamiento ni matemáticas; no soporta tool calling, agentes ni procesamiento de lenguaje natural.
- Ejecución en CPU: el modelo es ligero y puede ejecutarse en entornos sin GPU, como contenedores Podman rootless.
- Neuroevolución: la CPPN evolucionada se adapta al grafo de la aplicación, permitiendo una poda específica por proyecto.

## Casos de uso

- Publicación de APK en Google Play: el modelo se ejecuta tras R8-opt para reducir el tamaño final del APK, lo que facilita cumplir los límites de tamaño de Google Play y mejora la tasa de descarga.
- Optimización de apps multi-form-factor: para aplicaciones que apuntan a móviles, tabletas y wearables, el modelo logra un ahorro del 39,3% frente a R8-opt, reduciendo el peso de cada variante.
- Integración en pipelines CI/CD: se puede empaquetar en un contenedor Podman rootless y ejecutarse como paso de build, generando automáticamente el keep-set reducido sin intervención manual.
- Distribución en mercados con restricciones de ancho de banda: en regiones donde el tamaño de descarga es crítico, el modelo reduce el peso de la APK, mejorando la experiencia de usuario y reduciendo costes de datos.
- Investigación en neuroevolución aplicada a compiladores: sirve como caso de estudio de cómo las CPPN pueden resolver problemas de optimización de grafos en el ámbito de la compilación.
- Experimentación con límites de reducción: para desarrolladores que deseen explorar reducciones más agresivas que las opciones estándar de R8, el modelo ofrece un enfoque basado en un oráculo runtime-live.

## Benchmarks y rendimiento

| Bench | Classic R8 | R8-opt | HyperNEAT | vs R8-opt |
|---|---:|---:|---:|---:|
| APK Manager | 32.07 MB | 13.20 MB | 7.79 MB | −41.0% |
| Debloat.app | 896.6 KB | 366.4 KB | 218.0 KB | −40.5% |
| Multi-form-factor 50% | 11.90 MB | 4.90 MB | 2.97 MB | −39.3% |

El modelo reporta `all_beat_r8_opt: true`, lo que significa que supera a R8-opt en todos los benchmarks. Las fuentes de las columnas R8-opt son: SuriDevs (APK Manager 25.1 MB → 13.2 MB con AGP 8.12), Debloat.app (R8-optimised APK: 366.4 KB) y Google (mejora >50% vs classic shrinker en apps multi-form-factor). No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 MB, el modelo no requiere GPU y se ejecuta en CPU.
- GPU recomendadas: ninguna; funciona con JAX 0.4.38 en CPU.
- Compatible con hardware de consumo: sí, cualquier CPU moderna con soporte para JAX es suficiente.
- Opciones de despliegue: Podman rootless usando el Containerfile incluido, o ejecución local con `PYTHONPATH=src python3 -m hyperneat_r8`.
- Latencia y throughput: no disponible; no se han publicado mediciones de rendimiento en tiempo de ejecución.

## Comparativa con modelos similares

| Modelo | Tamaño resultante (APK Manager) | Enfoque | Keep-set |
|---|---|---|---|
| Classic R8 | 32.07 MB | Poda de código + recursos con reglas AAPT2 | Incondicional |
| R8-opt | 13.20 MB | Joint code+resource reachability desde entradas | Conservador (reflexión/JNI) |
| HyperNEAT | 7.79 MB | Neuroevolución de CPPN sobre sustrato 2-D | Runtime-live oracle |

No se han identificado otros modelos de IA comparables en esta categoría; la comparativa se centra en las herramientas estándar de Android contra las que se valida el modelo.

## Limitaciones y advertencias

- No es un reemplazo de R8: el modelo no emite DEX y requiere el keep-set de R8-opt como punto de partida.
- Dependencia de R8-opt: sin la opción `android.r8.optimizedResourceShrinking=true`, el modelo no tiene base sobre la que operar.
- Resultados específicos: los benchmarks se limitan a tres casos (APK Manager, Debloat.app y Multi-form-factor 50%) y pueden no generalizar a todos los proyectos Android.
- Semilla y entorno: los pesos evolucionados corresponden a la semilla 20260907 y a JAX 0.4.38; otros entornos pueden producir resultados diferentes.
- Falta de evaluación de sesgos: al no ser un modelo de lenguaje, no se han evaluado sesgos, pero tampoco se ha documentado la robustez del keep-set en proyectos con reflexión dinámica compleja.
- Licencia MIT: permite uso comercial, pero hay que revisar las licencias de las dependencias (JAX, Podman) para despliegues de producción.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto ni contenido semántico.

## Enlaces

- HuggingFace: https://huggingface.co/Kovach-Enterprises/hyperneat-r8-compressor
- Wikipedia HyperNEAT: https://en.wikipedia.org/wiki/HyperNEAT
- GitHub HyperNEAT original: https://github.com/MisterTea/HyperNEAT
