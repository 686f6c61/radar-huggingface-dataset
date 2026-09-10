# birwatkar123/neuropil

## Resumen

Neuropil es una aplicacion Android de codigo abierto que actua como cliente para el atlas interactivo en 3D del sistema nervioso central del macho adulto de *Drosophila melanogaster*. No se trata de un modelo de inteligencia artificial generativa ni de un modelo de lenguaje; es una herramienta de visualizacion cientifica desarrollada por birwatkar123, basada en el proyecto previo Cerebra. Resuelve la necesidad de explorar de forma interactiva las 166.700 neuronas reconstruidas del conectoma de la mosca de la fruta, un recurso relevante para la neurociencia y la conectomica. La arquitectura de la app combina un envoltorio de Capacitor 6 con React 19, Vite 7 y Three.js, y utiliza WebGL2 para el renderizado acelerado por GPU. Se distribuye como APK de depuracion de 59,6 MB y el repositorio en HuggingFace tiene un tamano de 0,1 GB. Esta ficha documenta que, aunque esta alojado en HuggingFace, el proyecto no incluye pesos de modelo ni parametros de red neuronal.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cliente Android (Capacitor 6) con frontend React 19 / Vite 7 / Three.js y renderizado WebGL2. No es un modelo de IA. |
| Parámetros totales | No disponible (no es un modelo de parámetros). |
| Parámetros activos | No aplica (no es un modelo MoE). |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). |
| Tipos de cuantización | No aplica. |
| Idiomas soportados | No disponible. |
| Licencia | MIT. |
| Formato de pesos | No aplica (se distribuye como APK, no como pesos de modelo). |

## Arquitectura y entrenamiento

La aplicacion no se basa en una arquitectura de red neuronal, sino en una arquitectura de cliente movil: el nucleo visual se implementa con Three.js sobre WebGL2, embebido en una aplicacion Android mediante Capacitor 6. El frontend usa React 19 con Vite 7. Segun la informacion disponible, no existe entrenamiento de modelo ni pipeline de inferencia; el proyecto incluye datos de reconstruccion neuronal del conectoma de *Drosophila*, que se renderizan en tiempo real. La innovacion tecnica destacable es la capacidad de visualizar 166.700 neuronas simultaneamente en un dispositivo movil gracias al renderizado por GPU. No se ha realizado entrenamiento con RLHF ni DPO, al no tratarse de un modelo de lenguaje.

## Capacidades

- Exploracion interactiva en 3D de 166.700 neuronas reconstruidas del sistema nervioso central de *Drosophila melanogaster* macho adulto.
- Busqueda de neuronas por nombre o tipo.
- Secuencia cinematografica de introduccion.
- Acceso al contexto del articulo cientifico y a los creditos de la reconstruccion.
- Interfaz oscura con tematica ocular y pantalla de carga con el logotipo de Neuropil.
- Decodificacion de video H.264 acelerada por hardware en el dispositivo.
- No incluye capacidades de generacion de texto, codigo, razonamiento ni tool calling, al no ser un modelo de IA.

## Casos de uso

- Investigacion en conectomica: los neurocientificos pueden explorar la morfologia de neuronas individuales y la conectividad local para verificar reconstrucciones o generar hipotesis sobre circuitos. La aplicacion permite filtrar por nombre o tipo y observar cada neurona en un contexto espacial completo.
- Docencia en neurociencia: en cursos de biologia o neurociencia, la herramienta sirve como recurso de visualizacion para mostrar la complejidad de un sistema nervioso de insecto. Su interaccion tactil y la secuencia cinematografica facilitan la comprension.
- Divulgacion cientifica: para museos o actividades de puertas abiertas, la app puede instalarse en dispositivos Android y mostrar a publico no especializado la estructura del conectoma de la mosca. El repositorio incluye creditos y contexto del articulo para aportar rigor.
- Comparacion de reconstrucciones: los investigadores pueden usar la app para comparar morfologias entre tipos celulares de la misma cepa. La busqueda por nombres permite localizar rapidamente neuronas concretas.
- Desarrollo de visualizaciones WebGL2: el codigo fuente sirve como ejemplo para desarrollar aplicaciones de renderizado de grandes mallas de puntos o lineas en dispositivos moviles. Gestionar 166.700 objetos en WebGL2 es un caso de estudio practico.
- Pruebas de rendimiento movil: los desarrolladores pueden usar el APK para evaluar la capacidad de distintos dispositivos Android para renderizar escenas complejas con Three.js, midiendo la fluidez y el uso de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no aplican metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no es un modelo de IA; no requiere memoria de VRAM especifica).
- GPU recomendadas: no disponible (la aplicacion emplea WebGL2 y se ejecuta en la GPU del dispositivo movil; no se especifican modelos concretos).
- Compatibilidad con GPU de consumo: no aplica (es una aplicacion Android, no un modelo ejecutable en PC).
- Opciones de despliegue: APK de depuracion (`app-debug.apk`) instalable manualmente en Android 8+; tambien se puede compilar desde el codigo fuente con Capacitor y Gradle. No se ofrecen opciones de despliegue en servidor como vLLM, Ollama o TGI.
- Latencia y rendimiento: no disponible (no se han publicado mediciones de throughput ni latencia).

## Comparativa con modelos similares

No disponible. El proyecto no es un modelo de IA, por lo que no existe una comparacion de parametros ni de rendimiento con modelos de lenguaje. En cuanto a aplicaciones de atlas de conectomica, no se proporcionan alternativas en la informacion disponible.

## Limitaciones y advertencias

- El paquete es un build de depuracion (`assembleDebug`) firmado con una clave de depuracion, no apto para distribucion en la Play Store ni para uso en produccion.
- Disponible solo para Android; no existe version para iOS ni para escritorio.
- La instalacion requiere habilitar "Instalar apps desconocidas" en el dispositivo, lo que supone un riesgo de seguridad si el APK se descarga de fuentes no verificadas.
- El repositorio en HuggingFace no tiene descargas ni me gustas, lo que indica que el proyecto es reciente o no ha sido validado por la comunidad.
- No se especifican los idiomas de la interfaz ni si existen traducciones disponibles.
- Al ser una herramienta de visualizacion cientifica, no debe utilizarse para diagnostico clinico ni para decisiones medicas.
- Los datos de reconstruccion neuronal pueden contener errores o incompletitudes; el articulo original debe consultarse como referencia primaria.
- No implementa ninguna capacidad de IA generativa, por lo que no genera texto, ni razona, ni soporta tool calling.

## Enlaces

- HuggingFace: https://huggingface.co/birwatkar123/neuropil
- GitHub: https://github.com/birwatkar123-collab/neuropil
- Autor original de Cerebra: https://github.com/Mukhsin0508
