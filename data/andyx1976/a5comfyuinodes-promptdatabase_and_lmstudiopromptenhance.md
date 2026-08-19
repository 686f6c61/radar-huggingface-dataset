# Andyx1976/A5comfyuinodes-PromptDatabase_and_LMStudioPromptenhance

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de dos nodos personalizados para ComfyUI, desarrollados por Andyx1976. El primero, `A5Prompt Database`, permite almacenar y recuperar prompts (o cualquier texto) en un archivo JSON local, organizados en tres categorías. El segundo, `A5LMStudio Prompt Enhancer`, envía un prompt de sistema, un prompt de usuario y opcionalmente una imagen a un servidor LLM local (como LMStudio) que exponga una API compatible con OpenAI, y devuelve el prompt mejorado como una cadena de texto utilizable en cualquier campo de entrada de ComfyUI.

La relevancia de este proyecto radica en que integra modelos de lenguaje locales en flujos de generación de imágenes, evitando depender de servicios en la nube y manteniendo el control sobre los datos. Incluye características como selección de modelo mediante desplegable, modos de bypass inteligente, descarga de modelos de ComfyUI de VRAM durante la ejecución del LLM, y soporte para modelos de visión. Está pensado para usuarios de ComfyUI que quieran automatizar la mejora de prompts sin salir de su entorno de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo, es codigo de nodos para ComfyUI) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del LLM externo) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (depende del LLM externo) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (codigo fuente Python y archivos de configuracion JSON) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una implementacion de nodos personalizados para ComfyUI escritos en Python. El nodo `A5Prompt Database` gestiona un archivo JSON (`a5prompt_database.json`) en la carpeta local del nodo, donde almacena prompts con nombres y en tres categorias independientes. El nodo `A5LMStudio Prompt Enhancer` se comunica con un servidor LLM local a traves de una API compatible con OpenAI (por ejemplo, LMStudio), enviando peticiones HTTP con el prompt de sistema, el prompt de usuario y opcionalmente una imagen. No hay entrenamiento ni ajuste de pesos; la logica se basa en la orquestacion de llamadas a la API y en la gestion de estados (modos "Always run LLM", "Use last prompt" y "Bypass if unchanged").

Entre las innovaciones tecnicas destacan: la deteccion de modelos con capacidad de vision mediante un algoritmo heuristico, la posibilidad de descargar modelos de ComfyUI de la VRAM antes de ejecutar el LLM para evitar agotamiento de memoria, y un editor emergente para revisar y editar los prompts mejorados, con almacenamiento de los ultimos cinco por flujo y sesion.

## Capacidades

- Gestion de una base de datos local de prompts (o textos arbitrarios) con nombres y categorias, accesible desde cualquier flujo de ComfyUI.
- Mejora de prompts mediante un LLM local (LMStudio u otro servidor OpenAI-compatible) usando un prompt de sistema y un prompt de usuario.
- Envio opcional de imagenes al LLM para mejorar prompts basandose en contenido visual (requiere un modelo de vision cargado en el servidor).
- Seleccion de modelo desde un desplegable que lista los modelos disponibles en el servidor, sin necesidad de copiar identificadores manualmente.
- Modos de ejecucion flexibles: siempre ejecutar el LLM, reutilizar el ultimo prompt mejorado (con edicion manual posible), o omitir la ejecucion si la entrada no ha cambiado.
- Descarga automatica de modelos de ComfyUI de la VRAM cuando se ejecuta el LLM, para evitar conflictos de memoria.
- Almacenamiento de hasta cinco prompts mejorados recientes por flujo y sesion, con editor emergente para modificarlos.
- Soporte para autenticacion mediante token API (opcional) para funciones de carga/descarga de modelos en LMStudio.

## Casos de uso

- Optimizacion de prompts para generacion de imagenes en ComfyUI: el nodo mejora automaticamente un prompt basico usando un LLM local, enriqueciendo descripciones y detalles antes de pasarlo al modelo de difusion.
- Automatizacion de flujos de trabajo con variaciones de estilo: al cambiar la imagen de entrada o el prompt, el nodo regenera la mejora solo cuando es necesario, ahorrando tiempo y recursos.
- Gestion centralizada de prompts reutilizables: el nodo de base de datos permite guardar prompts favoritos o plantillas en tres categorias, disponibles en todos los flujos de la instalacion de ComfyUI.
- Integracion de LLMs de vision en pipelines de edicion: enviar una imagen generada o cargada al LLM para obtener sugerencias de mejora del prompt basadas en el contenido visual.
- Uso como base de datos generica de texto: almacenar cualquier tipo de texto (notas, configuraciones, fragmentos) con nombres y categorias, accesible desde ComfyUI.
- Pruebas de diferentes LLMs locales: el desplegable de modelos permite cambiar rapidamente entre modelos cargados en LMStudio para comparar la calidad de las mejoras de prompts sin reiniciar el servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El rendimiento depende enteramente del LLM local utilizado y del hardware donde se ejecute el servidor. Los nodos en si no introducen latencia significativa mas alla de la llamada HTTP a la API local.

## Requisitos de hardware

- Los nodos no requieren GPU propia; solo necesitan una instalacion funcional de ComfyUI y Python.
- Para usar el nodo de mejora de prompts, se necesita un servidor LLM local (por ejemplo, LMStudio) con un modelo cargado. Los requisitos de VRAM y GPU dependen del modelo LLM elegido.
- Si se utiliza la funcion de descarga de modelos de ComfyUI de VRAM, se recomienda una GPU con suficiente memoria para el modelo de difusion y el LLM (o gestionar la memoria de forma secuencial).
- Opciones de despliegue: los nodos se instalan copiando las carpetas en `custom_nodes` de ComfyUI. No requieren herramientas adicionales.
- Latencia: la latencia de la mejora de prompts es la de la llamada al LLM local, tipicamente de unos pocos segundos a decenas de segundos segun el modelo y hardware.

## Comparativa con modelos similares

No existen modelos comparables en el sentido tradicional, ya que no es un modelo de IA. Como nodos de ComfyUI, se pueden comparar con otros nodos de mejora de prompts existentes en la comunidad, aunque no se dispone de datos concretos de alternativas. La principal diferencia es que este repositorio combina base de datos de prompts y mejora via LLM local en un solo paquete, con soporte para vision y gestion de VRAM.

## Limitaciones y advertencias

- Los prompts y textos guardados en el nodo de base de datos se almacenan en texto plano en un archivo JSON local, sin cifrado. No deben usarse para informacion sensible.
- El token API del servidor LMStudio, si se configura, tambien se guarda en texto plano en el archivo JSON, lo que supone un riesgo de seguridad si el sistema es compartido.
- La funcion de carga/descarga de modelos de LMStudio requiere que la autenticacion por token este habilitada en el servidor; de lo contrario, solo se puede usar el modelo cargado por defecto.
- El nodo de mejora de prompts depende de la disponibilidad y correcta configuracion del servidor LLM local. Si el servidor no esta activo o la API no es compatible, el nodo fallara.
- Los modos de bypass y reutilizacion de prompts pueden comportarse de forma inesperada si se editan manualmente los prompts mejorados, ya que las ediciones manuales se ignoran en la comprobacion de cambios.
- No hay garantias de soporte a largo plazo ni mantenimiento activo, ya que el proyecto no esta en GitHub ni en el gestor de ComfyUI Manager.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Andyx1976/A5comfyuinodes-PromptDatabase_and_LMStudioPromptenhance
- No se proporcionan otros enlaces (paper, blog, repo de codigo) en la informacion disponible.
