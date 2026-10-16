# geter62/monkeystudio

## Resumen

MonkeyStudio es una aplicación de creación 3D de código abierto pensada para teléfonos Android con poca memoria (4 GB de RAM), desarrollada por el usuario geter62 y construida sobre Godot 4.x con GDScript. Se presenta como una base para una herramienta móvil de estilo Blender: modelado procedural, esculpido, rigging esquelético, simulación de tela y pelo, y animación por keyframes. El repositorio incluye el código fuente completo y un APK de depuración listo para instalar.

El proyecto no es un modelo de inteligencia artificial. La propia model card aclara de forma explícita que el código actual no contiene ningún componente de IA, aprendizaje automático o LLM: no hay fichero de pesos, ni red neuronal, ni llamadas a una API de IA. La mención a "construido con un asistente de IA" se refiere únicamente a cómo se escribió el código, no a funcionalidad en tiempo de ejecución.

El interés de esta ficha radica en su propuesta de arquitectura de memoria para dispositivos débiles, no en un modelo generativo. La idea central es no mantener nunca todas las funcionalidades residentes en RAM a la vez, combinando presupuesto de memoria duro, carga diferida, expulsión LRU y reciclaje de mallas para evitar cierres por Out-Of-Memory en móviles de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación Godot 4.x escrita en GDScript (no es un modelo neuronal) |
| Parametros totales | no aplicable (no es un modelo de IA) |
| Parametros activos | no aplicable (no es una arquitectura MoE) |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | en, hi |
| Licencia | MIT |
| Formato de pesos | no aplicable; el repositorio contiene código fuente y un APK de depuración |
| Paquete Android | com.monkeycode.monkeystudio |
| Versión | 0.1.0 (versionCode 1) |
| Tamano del APK | ~55 MB |
| Arquitecturas de CPU | arm64-v8a, armeabi-v7a (32 y 64 bits) |
| minSdk | 24 (Android 7.0) |
| targetSdk | 36 |
| Firma | clave de depuración de Android (solo instalación por sideload) |
| Tamano del repositorio | 0.1 GB |
| Motor / librería | Godot (library_name: godot) |
| Presupuesto de RAM por defecto | 512 MB, limitado automáticamente a 1/8 de la RAM física |
| Fecha de creación | 2026-10-16 |
| Fecha de actualización | 2026-10-16 |

## Arquitectura y entrenamiento

No existe entrenamiento ni componente de aprendizaje automático. MonkeyStudio es una aplicación nativa de Godot 4.x cuyo núcleo es un gestor de memoria y un catálogo de funcionalidades bajo demanda. El sistema se articula en cinco piezas documentadas en `docs/ARCHITECTURE.md`. `MemoryManager` mantiene un presupuesto de RAM duro (512 MB por defecto) y registra los recursos como `id -> ruta + coste` en lugar de cargarlos; `acquire(id)` los carga al primer uso, `release(id)` suelta una referencia y, a cero referencias, el recurso pasa a ser candidato de expulsión. La expulsión sigue una política LRU sobre recursos con cero referencias, nunca sobre uno en uso, y además consulta `OS.get_memory_info()` para forzar la expulsión cuando el sistema operativo informa de menos de 128 MB libres.

Sobre esa base se apoyan otras tres capas. `FeatureRegistry` cataloga cada herramienta como metadatos y solo instancia un módulo al activarlo, destruyéndolo y liberando su RAM al desactivarlo, de modo que "cerrar la herramienta libera la memoria" es automático. `MeshPool` recicla objetos `ArrayMesh` vaciando sus superficies (liberando búferes de GPU) pero reutilizando el objeto, lo que evita la rotación constante de asignaciones. `VertexBufferManager` estima el coste de RAM y VRAM antes de construir una malla y realiza una única subida a GPU por edición, ya que las GPU móviles rinden mal con miles de actualizaciones pequeñas de búfer. Por último, la calidad adaptativa desactiva primero las sombras y luego reduce el presupuesto de subpasos de simulación cuando la tasa de fotogramas se mantiene por debajo de 30.

## Capacidades

- Modelado procedural con mallas generadas: cubo, esfera, cilindro, plano, toro, icósfera y cabeza de mono.
- Esculpido con pinceles de tipo draw, grab, pinch, smooth y flatten.
- Construcción de esqueletos con `Skeleton3D` y ponderación automática de cuatro influencias por vértice.
- Simulación de tela y pelo mediante muelles de masa Verlet con gravedad y viento configurables.
- Animación por keyframes sobre el sistema de animación nativo del motor (`Animation`).
- Cámara táctil con órbita, zoom por pellizco y desplazamiento.
- Interfaz con materiales oscuros, paneles plegables y HUD.
- Gestión de memoria con carga diferida, expulsión LRU, reciclaje de mallas y estimación previa de coste de VRAM.
- Calidad adaptativa automática según la tasa de fotogramas.
- Idiomas de la ficha: inglés e hindi.
- No incluye tool calling, ni agentes, ni razonamiento multi-paso, ni modos de pensamiento, ni visión o audio: no es un modelo de IA.

## Casos de uso

- Modelado 3D en Android de gama baja: un usuario puede crear primitivas y esculpirlas en un teléfono con 4 GB de RAM, ya que el gestor de memoria limita el consumo a 512 MB por defecto y evita cierres por OOM.
- Rigging rápido sobre dispositivos móviles: la ponderación automática de cuatro influencias permite montar un esqueleto funcional sin herramientas de escritorio.
- Previsualización de simulación de tela y pelo: artistas pueden probar parámetros de gravedad y viento antes de exportar el trabajo a un pipeline de escritorio.
- Bloqueo de animaciones sencillas por keyframes: la pista de animación nativa permite montar ciclos básicos para prototipos de juego directamente en el dispositivo.
- Base para un editor 3D embebido en un juego: la `FeatureRegistry` permite añadir herramientas como entradas sin tocar el núcleo de memoria, útil para editores in-game.
- Banco de pruebas de arquitecturas de memoria en móvil: los desarrolladores pueden estudiar `MemoryManager`, `MeshPool` y `VertexBufferManager` como referencia para aplicaciones que deben sobrevivir en RAM reducida.
- Punto de partida para integrar generación de mallas con IA: la propia model card describe cómo enchufar un backend ONNX/TFLite que devuelva el mismo diccionario `{verts, indices, uvs}` que el generador procedural actual.
- Docencia de simulación Verlet y rigging: el código es legible en GDScript y está cubierto por una suite de pruebas headless de 25 comprobaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que cada módulo está cubierto por una suite de pruebas headless automatizada con 25 comprobaciones, todas superadas, y que la calidad adaptativa actúa cuando la tasa de fotogramas cae por debajo de 30, pero no se ofrecen cifras de FPS, latencia ni consumo medido en dispositivos concretos.

## Requisitos de hardware

- Dispositivo Android con minSdk 24 (Android 7.0) o superior y targetSdk 36.
- RAM del dispositivo objetivo: 4 GB, con un presupuesto de aplicación de aproximadamente 1,2 a 1,5 GB antes de que el sistema operativo empiece a matar procesos; la app se autolimita a 512 MB por defecto (1/8 de la RAM física).
- Arquitecturas de CPU soportadas: arm64-v8a y armeabi-v7a.
- No se requieren GPU de escritorio ni aceleradores: el destino es la GPU integrada del teléfono. No hay datos de VRAM ni de GPU recomendadas porque no es un modelo de IA.
- Despliegue: instalación del APK por `adb install -r build/MonkeyStudio.apk` o instalación manual habilitando "instalar desde orígenes desconocidos". El APK está firmado con clave de depuración y está pensado para pruebas por sideload, no para Google Play.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No existe un modelo de IA comparable porque MonkeyStudio no es un modelo. La comparación pertinente es con herramientas de creación 3D, y los datos de las alternativas son de carácter general, no extraídos de la información proporcionada.

| Herramienta | Plataforma | Licencia | Estado | Relevancia frente a MonkeyStudio |
|---|---|---|---|---|
| MonkeyStudio | Android (Godot 4.x) | MIT | Base funcional, v0.1.0 | Enfoque en RAM reducida (4 GB) y arquitectura de memoria explícita |
| Blender | Escritorio (Windows, macOS, Linux) | GPL | Maduro, más de 25 años de desarrollo | Referencia de funcionalidad; MonkeyStudio se declara explícitamente no equivalente |
| Aplicaciones de modelado 3D para Android | Android | varía | Variable | No se dispone de datos concretos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, ni red neuronal, ni API de IA. Cualquier expectativa de generación de texto, código o visión es infundada.
- No está libre de errores: el autor advierte explícitamente de que ningún software lo está y que esto es una base funcional, no un clon completo de Blender.
- Funcionalidades del roadmap aún no implementadas: desenvoltura UV, operaciones booleanas, baking, importación y exportación OBJ/glTF/USD, pila de deshacer, LOD de geometría dinámica, un conjunto de pinceles más amplio y perfiles de rendimiento por dispositivo.
- El APK está firmado con clave de depuración y solo admite sideload; no es apto para distribución en Google Play tal cual.
- Idiomas documentados limitados a inglés e hindi; no hay datos sobre cobertura de localización de la interfaz.
- Despliegue ligado al ecosistema Android y al motor Godot 4.x; no hay versiones para iOS, escritorio o web en la información disponible.
- Alcance de memoria acotado por diseño: el presupuesto de 512 MB y la expulsión LRU limitan la complejidad de las escenas que se pueden mantener residentes.
- La licencia MIT permite uso comercial, pero al tratarse de una versión 0.1.0 conviene evaluar su madurez antes de integrarla en producción.
- No se han publicado evaluaciones de rendimiento, consumo de batería o estabilidad en dispositivos concretos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/geter62/monkeystudio
- Documentación de arquitectura interna: `docs/ARCHITECTURE.md` (dentro del repositorio)
- APK de depuración: `build/MonkeyStudio.apk` (dentro del repositorio)
- Otros enlaces (papers, blogs, demos): no disponible
