# pr3vail/Kimodo-SOMA-RP-v1.1

## Resumen

Kimodo-SOMA-RP-v1.1 es un modelo de difusión de movimiento cinemático (kinematic motion diffusion) desarrollado por NVIDIA que genera animaciones esqueléticas tridimensionales (3D) a partir de una descripción textual y/o restricciones de movimiento, como poses completas del cuerpo, posiciones de extremidades, trayectorias y waypoints. El modelo pertenece a la familia Kimodo, que incluye variantes entrenadas sobre distintos esqueletos y conjuntos de datos; esta versión concreta está entrenada sobre el esqueleto SOMA de 30 articulaciones con el dataset propietario Bones Rigplay.

El modelo resuelve el problema de generar datos de movimiento humano realistas y controlables sin necesidad de captura de movimiento (mocap) costosa, lo que resulta relevante para aplicaciones de robótica humanoides, simulación industrial, generación de datos sintéticos y producción de animación. Su arquitectura es un modelo de difusión basado en un transformer de dos etapas, con aproximadamente 282 millones de parámetros y una ventana de generación máxima de 10 segundos (300 frames a 30 fps). La versión v1.1 introduce mejoras menores sobre la v1, como una partición de entrenamiento actualizada para no solaparse con los conjuntos de test del benchmark Kimodo Motion Generation Benchmark, una limpieza adicional de datos y mayor estabilidad en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion con transformer de dos etapas |
| Parametros totales | 283.281.777 (282 M segun la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 300 frames (10 segundos a 30 fps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el texto de entrada es en ingles, aunque no se especifica) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimodo es un modelo de difusion que genera movimiento esqueletico 3D mediante un proceso de denoising iterativo. La arquitectura es un transformer de dos etapas, disenado para procesar entradas heterogeneas: texto (como string), duracion (numero de frames) y restricciones de pose (matrices que pueden incluir posiciones 3D de articulaciones, matrices de rotacion 3x3, direccion de heading 2D y posicion de raiz 2D). El modelo produce como salida la traslacion de la raiz (matriz de num_frames x 3) y las rotaciones de las 30 articulaciones (matriz de num_frames x 30 x 3 x 3), a 30 fps.

El entrenamiento se realizo sobre el dataset propietario Bones Rigplay, que contiene 700 horas de captura de movimiento humano sobre el esqueleto SOMA con descripciones textuales asociadas. El dataset incluye menos de 1 billon de tokens de texto y se aplicaron diversas aumentaciones para expandir la variedad de texto y movimiento. Los conjuntos de test del Kimodo Motion Generation Benchmark se mantuvieron fuera del entrenamiento para permitir comparaciones justas con otros modelos. La version v1.1 incluye una particion de entrenamiento ligeramente mayor que la v1, limpieza adicional de datos para eliminar artefactos de muneca y hombro, y mejoras en la estabilidad del entrenamiento.

## Capacidades

- Generacion de movimiento esqueletico 3D a partir de texto: el modelo interpreta descripciones en lenguaje natural y produce animaciones de cuerpo completo coherentes con la descripcion.
- Control por restricciones de pose: admite restricciones parciales o completas sobre posiciones 3D de articulaciones, matrices de rotacion, direccion de heading y posicion de raiz, permitiendo un control fino del movimiento generado.
- Generacion condicionada por duracion: el usuario especifica el numero de frames (hasta 300, equivalente a 10 segundos a 30 fps).
- Salida estandarizada: produce traslacion de raiz y rotaciones de articulaciones en formato de matrices, listo para ser usado en pipelines de animacion o robotica.
- Compatibilidad con el esqueleto SOMA de 30 articulaciones, disenado para representar el cuerpo humano de forma estandar.
- Modelo listo para uso comercial bajo la NVIDIA Open Model License, con despliegue global.

## Casos de uso

- Demostraciones para robots humanoides: el modelo puede generar trayectorias de movimiento para robots con esqueleto similar al humano, como el Unitree G1 (aunque esta version usa SOMA, la familia Kimodo incluye variantes retargeteadas a G1). Se usaria para crear movimientos de demostracion sin necesidad de teleoperacion o captura de movimiento.
- Digital humans para simulaciones industriales y digital twins: generar animaciones realistas de trabajadores virtuales en entornos simulados, por ejemplo para evaluar ergonomia, flujos de trabajo o seguridad en fabricas.
- Generacion de datos sinteticos para entrenamiento: producir grandes volumenes de datos de movimiento etiquetados con texto, utiles para entrenar otros modelos de vision por computador o de prediccion de movimiento.
- Animacion para juegos y medios: los desarrolladores pueden generar animaciones de personajes a partir de descripciones textuales, acelerando el pipeline de produccion y reduciendo costes de captura de movimiento.
- Prototipado rapido de coreografias o movimientos: un disenador puede describir un movimiento ("caminar hacia adelante y saludar con la mano derecha") y obtener una animacion base que luego puede refinar en herramientas de animacion.
- Investigacion en generacion de movimiento: el modelo sirve como punto de partida para estudios academicos sobre control de movimiento, edicion de animaciones o generacion condicionada, gracias a su compatibilidad con el benchmark Kimodo Motion Generation Benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la version v1.1 es compatible con el Kimodo Motion Generation Benchmark, pero no se incluyen metricas cuantitativas (como FID, R-precision o diversity) en los materiales proporcionados.

## Requisitos de hardware

- El modelo tiene aproximadamente 283 millones de parametros y un tamano de repositorio de 1.1 GB, lo que lo hace relativamente ligero en comparacion con modelos de lenguaje de gran tamano.
- La model card indica compatibilidad con microarquitecturas NVIDIA Ampere, Blackwell y Lovelace, y sistemas operativos Linux y Windows.
- Se requiere una GPU NVIDIA con soporte CUDA para un rendimiento optimo; el modelo esta disenado para ejecutarse en sistemas acelerados por GPU.
- No se proporcionan datos especificos de VRAM, latencia o throughput en la informacion disponible. Dado el tamano del modelo, es probable que quepa en GPUs de consumo como la RTX 3060 o superiores, pero no se puede confirmar sin pruebas.
- El runtime principal es PyTorch, por lo que se puede desplegar con frameworks estandar de inferencia como Hugging Face Transformers o directamente con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares en la misma categoria (generacion de movimiento 3D condicionada por texto). La familia Kimodo incluye otras variantes (Kimodo-SOMA-SEED, Kimodo-G1-RP, Kimodo-G1-SEED, Kimodo-SMPLX-RP) que se diferencian por el esqueleto y el dataset de entrenamiento, pero no se proporcionan datos comparativos de rendimiento entre ellas. No se han identificado modelos de terceros con caracteristicas equivalentes en la informacion disponible.

## Limitaciones y advertencias

- La duracion maxima de generacion esta limitada a 10 segundos (300 frames a 30 fps), lo que puede ser insuficiente para animaciones largas o secuencias continuas.
- El modelo esta entrenado exclusivamente sobre el esqueleto SOMA de 30 articulaciones; para otros esqueletos (como SMPLX o robots G1) se necesitan las variantes especificas de la familia Kimodo.
- El dataset de entrenamiento es propietario (Bones Rigplay), por lo que no se puede auditar externamente su composicion ni sus posibles sesgos. No se han documentado sesgos especificos, pero la diversidad de movimientos y textos puede estar limitada por el origen de los datos.
- Existe riesgo de generar movimientos no realistas o con artefactos, especialmente en articulaciones como munecas y hombros, aunque la version v1.1 incluye limpieza de datos para reducir estos problemas.
- La licencia NVIDIA Open Model License permite uso comercial, pero es necesario revisar los terminos completos de la licencia para asegurar el cumplimiento en cada caso de uso.
- El modelo no es un modelo de lenguaje general; su unica funcion es generar movimiento esqueletico. No admite tareas de texto libre, razonamiento o generacion de codigo.
- No se proporcionan garantias de rendimiento en hardware no NVIDIA; el modelo esta optimizado para GPUs NVIDIA y puede no funcionar correctamente en otras plataformas.

## Enlaces

- Repositorio de HuggingFace del autor: https://huggingface.co/pr3vail/Kimodo-SOMA-RP-v1.1
- Repositorio oficial de NVIDIA en HuggingFace: https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.1
- Repositorio de la version v1 (NVIDIA): https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1
- Codigo oficial en GitHub: https://github.com/nv-tlabs/kimodo
- Pagina del proyecto: https://research.nvidia.com/labs/sil/projects/kimodo/
- Technical report (PDF): https://research.nvidia.com/labs/sil/projects/kimodo/assets/kimodo_tech_report.pdf
- Benchmark Kimodo Motion Generation Benchmark: https://huggingface.co/datasets/nvidia/Kimodo-Motion-Gen-Benchmark
