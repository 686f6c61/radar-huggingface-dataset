# ncsu-digital-manufacturing/teeth_retainer_v2

## Resumen

Teeth Retainer v2 no es un modelo de IA en el sentido habitual: es un activo de simulación 3D publicado en Hugging Face bajo el pipeline `robotics`. Concretamente, el repositorio contiene una escena OpenUSD para NVIDIA Isaac Sim que representa una célula de trabajo con cinta transportadora, mesa óptica Thorlabs, soporte y sensor estéreo Stereolabs ZED X, junto con una malla de escaneo de una férula dental (retainer) en formato STL y sus equivalentes USD. Lo desarrolla el grupo ncsu-digital-manufacturing de la North Carolina State University.

El activo está pensado para explorar flujos de manipulación y fabricación de férulas dentales en simulación. La geometría de la férula se incluye como asset USD local generado a partir del STL adjunto (1.385.355 triángulos, 702.614 vértices únicos), con dimensiones locales aproximadas de 64,1 × 16,2 × 53,0 mm tras aplicar un factor de escala de 0,001. La escena usa sistema de coordenadas Z-up con una unidad de escena equivalente a un metro.

Es relevante ahora porque ejemplifica el uso de Hugging Face como repositorio de activos de simulación robótica y gemelos digitales, no solo de pesos de redes neuronales. Aun así, conviene subrayar que el repositorio no contiene ninguna política entrenada, pesos, código de entrenamiento ni resultados de evaluación: es exclusivamente geometría y escena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (activo de simulación OpenUSD, no es un modelo neuronal) |
| Parametros totales | No disponible (no contiene pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | en (metadatos de la model card) |
| Licencia | No especificada en el repositorio inspeccionado |
| Formato de pesos | No aplica; formatos de asset: USDC (binario), USDA (texto), STL |
| Tipo de activo | Escena OpenUSD con malla STL adjunta |
| Escena principal | `ur5_teeth_v2.usd` (USDC) y `ur5_teeth_v2.usda` (texto), ~55 KB cada una |
| Malla de la férula | `retainer_scan.usdc` (17,9 MB), `retainer_scan.usda` (67,4 MB), `retainer_scan.stl` (69,3 MB) |
| Complejidad de malla | 1.385.355 triángulos; 702.614 vértices únicos |
| Dimensiones de la férula | ~64,1 × 16,2 × 53,0 mm (no medidas de forma independiente) |
| Sistema de coordenadas | Z-up; 1 unidad de escena = 1 metro |
| Timeline | Inicio 0; fin 1.000.000; 60 time codes por segundo |
| Física | Escena PhysX; 240 pasos de física por segundo; detección continua de colisiones; dinámicas GPU desactivadas |
| Software de referencia | Isaac Sim Full 6.0.1 (según captura incluida); URLs externas apuntan a la colección de assets de Isaac 5.0; compatibilidad no verificada |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El contenido es una escena OpenUSD compuesta por capas: la capa raíz define el entorno (cinta transportadora `ConveyorBelt_A06.usd`, mesa `ThorlabsTable/table_instanceable.usd`, soporte `stand.usd` y sensor `ZED_X.usdc`, todos referenciados desde `https://omniverse-content-staging.s3-us-west-2.amazonaws.com/Assets/Isaac/5.0/Isaac/`) y una referencia relativa a la malla local de la férula (`./meshes/retainer_scan/retainer_scan.usdc`). La férula tiene prim por defecto `/teeth_retainer` y malla `/teeth_retainer/base_link/retainer_scan`.

La geometría de la férula se generó a partir del STL incluido, escalando las coordenadas del escaneo por 0,001 para coincidir con la escala de malla del URDF suministrado. Los ficheros USDA se verificaron para equivalencia completa de capas con sus homólogos binarios en el momento de generación. La escena incluye nodos OmniGraph de Isaac Sim para creación de render products y publicación de cámara ROS 2 en `/World/stand/ZED_X_01/ActionGraph`, con frame ID `turtle` y varios parámetros sin valor explícito en la capa raíz.

Un detalle importante: pese al nombre `ur5` y a que algunos render products guardados apuntan a `/World/ur5e/...`, la capa raíz inspeccionada no define ni referencia ningún robot UR5/UR5e. No debe asumirse que haya robot ni controlador de manipulación funcional incluido.

## Capacidades

- Representación de una célula de trabajo de fabricación en Isaac Sim: cinta transportadora, mesa óptica, soporte y sensor estéreo ZED X.
- Carga de la geometría de una férula dental con material amarillo incluido en los assets USD.
- Integración de cámara mediante nodos OmniGraph para creación de render products.
- Publicación de cámara ROS 2 a través del bridge de Isaac Sim (grafo en `/World/stand/ZED_X_01/ActionGraph`).
- Configuración de física PhysX con detección continua de colisiones a 240 pasos por segundo.
- Edición e inspección en formato texto (USDA) de la escena y de la malla de la férula.
- No incluye: políticas entrenadas, pesos, código de entrenamiento, resultados de evaluación, robot definido ni controlador de manipulación.

## Casos de uso

- Prototipado de flujos de fabricación de férulas dentales: la escena permite situar la férula sobre la cinta o la mesa y experimentar con disposiciones de sensores y geometría antes de construir una célula real.
- Desarrollo de pipelines de visión con ROS 2: el grafo de cámara del sensor ZED X permite probar publicación de imágenes y render products en un entorno simulado antes de trasladar el código al hardware.
- Generación de datos sintéticos para percepción: la malla de alta densidad (1,38 M de triángulos) y el material de la férula permiten renderizar vistas sintéticas para entrenar o validar detectores de objetos pequeños.
- Validación de configuraciones de física: los ajustes PhysX incluidos (240 Hz, CCD activo, dinámicas GPU desactivadas) sirven como punto de partida para probar interacciones de contacto con la férula.
- Benchmarking de resolución de assets externos: la escena referencia assets remotos de NVIDIA y permite evaluar estrategias de cacheo o sustitución por copias locales en entornos sin acceso a Internet.
- Docencia y demostración de gemelos digitales: el repositorio ilustra cómo empaquetar una escena OpenUSD con su malla fuente y sus equivalentes en texto para inspección didáctica.
- Integración en pipelines de CI de activos 3D: los ficheros USDA legibles permiten validar diferencias y equivalencia de capas de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de política, métricas de manipulación ni comparativas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo neuronal); el coste es el de renderizar la escena en Isaac Sim.
- GPU recomendadas: no especificadas por el autor; Isaac Sim requiere GPU NVIDIA con soporte RTX. La escena tiene las dinámicas GPU de PhysX desactivadas, lo que reduce la dependencia de simulación física en GPU.
- Cabe en GPU de consumo: no confirmado por el autor; la malla de 1,38 M de triángulos y el material son ligeros para GPUs RTX modernas, pero no hay datos oficiales.
- Opciones de despliegue: NVIDIA Isaac Sim (versión de referencia 6.0.1 según captura; assets externos de Isaac 5.0; compatibilidad no verificada). No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: repositorio de 0,5 GB; conviene Git LFS para los assets gestionados por LFS.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada activos comparables de la misma categoría (escenas Isaac Sim con malla dental) ni modelos de IA con los que establecer una comparación significativa.

## Limitaciones y advertencias

- No contiene políticas entrenadas, pesos, código de entrenamiento ni resultados de evaluación; no es un modelo de IA.
- La licencia no está especificada en el repositorio inspeccionado: no hay autorización explícita para uso comercial ni para redistribución.
- El nombre incluye `ur5` y algunos render products apuntan a `/World/ur5e/...`, pero la capa raíz no define ni referencia ningún robot UR5/UR5e. No asumir robot ni controlador de manipulación.
- Varios render products guardados apuntan a una jerarquía `/World/ur5e/ZED_X/...` inexistente; otros apuntan al sensor bajo `/World/stand/ZED_X_01/...`. Hay que seleccionar prims de cámara válidos.
- El frame ID de cámara configurado es `turtle`, y varios inputs del grafo no tienen valores explícitos en la capa raíz.
- La escena referencia assets remotos de NVIDIA en S3; sin acceso a esas URLs hay que sustituirlos por copias locales.
- Los ficheros USDA de la escena mantienen la referencia relativa al USDC de la férula: abrir el USDA sigue requiriendo el USDC. Para usar el USDA de la férula hay que cambiar la referencia en `/teeth_retainer`.
- Binarios y textos son copias separadas; tras editar uno hay que reexportar el otro para mantener consistencia.
- El STL contiene solo geometría; el material amarillo está en los assets USD.
- Las dimensiones físicas de la férula no se han medido de forma independiente.
- La compatibilidad de software no está verificada (captura en Isaac Sim 6.0.1 frente a assets de Isaac 5.0).
- Antes de simular hay que revisar errores de resolución de assets y de grafos, y configurar geometría de colisión y propiedades físicas.

## Enlaces

- Hugging Face: https://huggingface.co/ncsu-digital-manufacturing/teeth_retainer_v2
- Assets externos referenciados (prefijo Isaac 5.0): https://omniverse-content-staging.s3-us-west-2.amazonaws.com/Assets/Isaac/5.0/Isaac/
- Cinta transportadora: https://omniverse-content-staging.s3-us-west-2.amazonaws.com/Assets/Isaac/5.0/Isaac/Props/Conveyors/ConveyorBelt_A06.usd
- Mesa Thorlabs: https://omniverse-content-staging.s3-us-west-2.amazonaws.com/Assets/Isaac/5.0/Isaac/Props/Mounts/ThorlabsTable/table_instanceable.usd
- Soporte: https://omniverse-content-staging.s3-us-west-2.amazonaws.com/Assets/Isaac/5.0/Isaac/Props/Mounts/Stand/stand.usd
- Sensor Stereolabs ZED X: https://omniverse-content-staging.s3-us-west-2.amazonaws.com/Assets/Isaac/5.0/Isaac/Sensors/Stereolabs/ZED_X/ZED_X.usdc
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
