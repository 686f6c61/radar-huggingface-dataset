# Serqan/MotionSmith-LensArt_UE

## Resumen

MotionSmith LensArt para Unreal Engine es un plugin de Unreal Editor orientado al texturizado de escenas asistido por IA. No se trata de un modelo de lenguaje ni de un modelo generativo con pesos publicados, sino de una herramienta que actúa como puente entre Unreal Engine 5.8 y backends de generación de imágenes externos (WebUI / Forge o ComfyUI). El flujo de trabajo consiste en encuadrar una superficie con una cámara de proyección, generar una imagen a través del backend configurado y proyectar y hornear (bake) el resultado sobre las texturas UV de la malla seleccionada.

El repositorio de Hugging Face, publicado por el usuario Serqan, tiene un tamaño de 0.0 GB, lo que indica que no contiene pesos de modelo ni artefactos de inferencia, sino previsiblemente material de referencia, imágenes de portada y documentación del plugin. La model card describe exclusivamente el funcionamiento del plugin dentro de Unreal Editor y remite a la web del fabricante para documentación y soporte.

El proyecto se encuentra en desarrollo activo y está dirigido a Unreal Engine 5.8 sobre Windows (Win64). Su relevancia radica en la integración de pipelines de difusión de imágenes en el flujo de trabajo de texturizado 3D dentro del editor, un nicho concreto para artistas técnicos y equipos de desarrollo de videojuegos que ya utilizan Forge o ComfyUI como backend generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin de Unreal Editor; no es un modelo con arquitectura propia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0.0 GB, sin pesos) |

## Arquitectura y entrenamiento

No disponible. MotionSmith LensArt no es un modelo entrenado con pesos publicados, sino un plugin de Unreal Editor que orquesta llamadas a backends de generación de imágenes externos. La model card no describe arquitectura de red, datos de entrenamiento, número de tokens ni procesos de RLHF o DPO, porque estos conceptos no aplican al artefacto publicado.

La única información técnica relevante es la de integración: el plugin se ejecuta dentro de Unreal Editor 5.8 en Windows (Win64), se conecta a un servidor de IA configurable (WebUI / Forge o ComfyUI) mediante un panel de ajustes de escena, permite añadir cámaras de proyección desde la vista actual, y realiza el bake de la imagen generada sobre el canal UV de la malla seleccionada. Algunos flujos requieren modelos o nodos específicos de ComfyUI, como CHORD para la generación de mapas PBR.

## Capacidades

- Proyección y bake de una sola cámara sobre la malla seleccionada, con posibilidad de combinar múltiples vistas para cubrir más superficie de la malla.
- Generación de imágenes guiada por profundidad, normales, máscaras e imágenes de referencia, en función del backend y del flujo de trabajo configurado.
- Pintado directo sobre la textura y marcado de áreas para pasadas adicionales de inpainting.
- Generación de mapas PBR mediante CHORD en ComfyUI.
- Aplicación de decals y exportación de mapas de textura.
- Conexión configurable a backends WebUI / Forge o ComfyUI desde el panel Scene → AI Server.
- Selección de checkpoint y entrada de prompt desde el panel Generate.
- Flujo Generate & Apply para hornear el resultado sobre la malla.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión nativa ni procesamiento de audio propias del plugin.

## Casos de uso

- Texturizado rápido de props y entornos en blockout: el artista encuadra la superficie con una cámara de proyección, introduce un prompt y hornea el resultado sobre las UV, lo que permite iterar sobre la apariencia de un asset sin salir de Unreal Editor.
- Cobertura de mallas complejas mediante combinación de vistas: al mezclar varias cámaras se pueden cubrir zonas de la malla que una sola proyección no alcanza, útil para geometría con curvaturas o superficies ocultas.
- Control de la generación mediante mapas guía: el uso de profundidad, normales y máscaras permite condicionar la imagen generada a la geometría real del mesh, lo que reduce inconsistencias entre la textura y la forma del objeto.
- Retoque e inpainting sobre texturas existentes: el pintado directo y el marcado de regiones para una nueva pasada de inpainting permiten corregir zonas concretas sin regenerar toda la textura.
- Generación de materiales PBR completos: mediante CHORD en ComfyUI se pueden producir mapas PBR junto con la textura base, lo que encaja en pipelines de materiales de Unreal.
- Integración en pipelines de arte técnico ya basados en ComfyUI o Forge: los equipos que ya disponen de estos backends pueden incorporar el plugin como capa de interacción dentro del editor, reutilizando sus checkpoints y nodos existentes.
- Exportación de mapas de textura para su uso fuera del plugin: los mapas generados y los decals aplicados pueden exportarse para integrarse en otros flujos de producción o en el propio proyecto de Unreal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No disponible la VRAM estimada de inferencia: el plugin no incluye pesos y delega la generación en un backend externo (WebUI / Forge o ComfyUI), por lo que los requisitos de GPU dependen del modelo de difusión que se cargue en dicho backend, no del plugin.
- No disponible la lista de GPU recomendadas para el plugin. La model card no especifica requisitos de GPU para Unreal Editor ni para el servidor de IA.
- Compatibilidad de plataforma documentada: Unreal Engine 5.8 sobre Windows (Win64). No se documenta soporte para otras plataformas.
- Opciones de despliegue: el plugin se conecta a un servidor WebUI / Forge o ComfyUI accesible desde el panel Scene → AI Server. No se documentan otros modos de despliegue.
- Latencia y throughput: no disponibles. Dependerán del backend, del checkpoint y del hardware donde se ejecute la generación.
- Requisitos adicionales: algunos flujos requieren modelos o nodos específicos de ComfyUI (por ejemplo, CHORD para mapas PBR).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos o herramientas comparables de la misma categoría (plugins de texturizado asistido por IA para Unreal Engine) con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El proyecto está en desarrollo activo según la model card; no se garantiza estabilidad de la API ni de los flujos de trabajo documentados.
- Dirigido exclusivamente a Unreal Engine 5.8 sobre Windows (Win64); no se documenta compatibilidad con otras versiones del motor ni con otros sistemas operativos.
- Requiere un backend externo operativo (WebUI / Forge o ComfyUI) y, en algunos flujos, modelos y nodos concretos; sin ellos el plugin no puede generar contenido.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribución.
- El repositorio de Hugging Face no contiene pesos (0.0 GB); no debe interpretarse como un modelo descargable para inferencia local.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del plugin; los sesgos y la calidad de las texturas generadas dependerán del checkpoint y del backend utilizados.
- Los idiomas declarados en los metadatos se limitan al inglés, lo que afecta a la documentación y posiblemente a la interfaz.
- No se documentan garantías de calidad, soporte a largo plazo ni compatibilidad con pipelines de CI/CD.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Serqan/MotionSmith-LensArt_UE
- Página de producto de LensArt UE: https://www.motionsmithai.com/p/motionsmith-lensart-ue.html
- Guía de configuración y referencia ilustrada del panel: https://www.motionsmithai.com/p/motionsmith-lensart-docs.html
- Soporte de MotionSmith: https://www.motionsmithai.com/p/support.html
