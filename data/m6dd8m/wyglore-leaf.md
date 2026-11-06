# m6dd8m/wyglore-leaf

## Resumen

WygLore Leaf (잎, "hoja" en coreano) es un plugin de memoria a largo plazo para RisuAI, un frontend de rol conversacional con modelos de lenguaje. No se trata de un modelo de IA en sentido estricto, sino de una extensión que intercepta el flujo de conversación para extraer, almacenar y recuperar fragmentos de memoria entre turnos. El repositorio alojado en Hugging Face bajo el identificador `m6dd8m/wyglore-leaf` actúa como manifiesto de actualizaciones y depósito de changelogs, no como alojamiento de pesos.

El plugin se complementa con un servidor local opcional llamado "뿌리" (raíz), que permite respaldar memorias, migrar historiales entre chats y delegar el cálculo y almacenamiento de recuerdos. La versión actual documentada es Leaf 3.4.4 junto con Root Server 1.4.5, con fecha de actualización del 2 de noviembre de 2026. El proyecto declara 5.791 comprobaciones automáticas superadas en el plugin y 810 en el servidor, además de 83 notas de versión publicadas.

La relevancia de esta ficha es limitada en el contexto de evaluación de modelos: no hay arquitectura de red neuronal, parámetros, contexto ni benchmarks que analizar. Lo que sí resulta evaluable es su función como capa de memoria persistente para agentes conversacionales, un patrón técnico cada vez más común en aplicaciones de rol y asistentes de larga duración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin de software, no modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (distribución en ZIP y JS; manifiesto `version.json`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento que describir. WygLore Leaf es un plugin escrito en JavaScript que se instala sobre RisuAI y opera en tiempo de inferencia sobre el modelo que el usuario tenga configurado en ese frontend. Su lógica interna, según la model card, consiste en extraer un fragmento de memoria por cada intercambio conversacional, registrarlo en un almacén denominado "기억뜰" (jardín de memoria) junto con las relaciones entre recuerdos y sus marcas temporales, y en cada nueva petición recuperar únicamente los fragmentos relevantes para la escena actual en lugar de enviar el almacén completo.

El componente servidor (Root) se ejecuta localmente en `http://127.0.0.1:6003` y añade funciones de respaldo, migración por lotes de memorias entre chats y gestión de tokens de conexión y dispositivos. La arquitectura es, por tanto, de tipo cliente-servidor opcional con persistencia local por sesión, aislamiento de memorias entre chats distintos y no modificación de las tarjetas de personaje ni del historial original. No se documentan innovaciones como decodificación especulativa, atención lineal ni técnicas de RLHF/DPO, ya que no aplican a este tipo de artefacto.

## Capacidades

- Extracción automática de fragmentos de memoria a partir de cada turno de conversación.
- Registro de relaciones entre recuerdos y de la evolución temporal de cada uno.
- Recuperación selectiva por relevancia respecto a la escena actual, en lugar de inyección del almacén completo.
- Persistencia de memorias entre sesiones y aislamiento estricto por chat.
- No alteración de las tarjetas de personaje ni de los historiales existentes.
- Servidor local opcional para respaldo, migración por lotes y gestión de tokens.
- Compatibilidad con cuatro builds de RisuAI: V3, V2 (Stable), Legacy y Pocket (PocketRisu).
- Interfaz de administración en `127.0.0.1:6003` con registro de administrador, emisión de ficheros de conexión y verificación por huella.
- Gestión de Vertex (registro y sustitución) y emisión o revocación de tokens de dispositivo desde el panel.
- Soporte exclusivo de coreano en la documentación y la interfaz.

## Casos de uso

- Rol conversacional de larga duración: el plugin permite que un personaje recuerde hechos de sesiones anteriores sin reinyectar todo el historial, lo que reduce el consumo de contexto del modelo subyacente y mantiene coherencia narrativa a lo largo de semanas.
- Asistentes personales con memoria persistente: usuarios de RisuAI pueden mantener conversaciones temáticas recurrentes (proyectos, lecturas, planificación) donde el plugin recupera solo los recuerdos afines a la consulta actual.
- Despliegue sin servidor: en entornos sin infraestructura adicional, el modo local mantiene todas las memorias en el cliente, adecuado para uso individual en escritorio.
- Respaldo y migración de memorias: mediante Root Server, un usuario puede exportar el jardín de memoria de varios chats en un único archivo y trasladarlos a otro equipo o instalación, útil para cambios de hardware o reinstalaciones.
- Aislamiento por chat en entornos multiusuario: al no mezclar memorias entre conversaciones, resulta apto para gestionar varios personajes o hilos temáticos en una misma instalación sin contaminación cruzada.
- Investigación sobre memoria en agentes: el plugin sirve como banco de pruebas para estudiar estrategias de extracción y recuperación de recuerdos en diálogos largos, dado que su código fuente es público bajo Apache 2.0.
- Integración en flujos de rol con modelos locales: combinado con un backend de inferencia propio, permite construir un asistente conversacional con memoria persistente sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de calidad de software: 5.791 comprobaciones automáticas superadas en Leaf y 810 en Root Server, además de 83 notas de versión. No se ofrecen cifras de latencia, throughput ni precisión de recuperación de memorias.

## Requisitos de hardware

- No aplica VRAM para el plugin en sí: se ejecuta dentro de RisuAI y consume recursos del navegador o del entorno de escritorio donde corra el frontend.
- El consumo de memoria del plugin depende del tamaño del jardín de memoria acumulado; el repositorio ocupa 0,1 GB, mayoritariamente documentación, capturas y archivos fuente.
- Root Server se ejecuta en Windows mediante `wyglore-root.bat` y en macOS, Linux y Android (Termux) mediante `wyglore-root.sh`; no se especifican requisitos mínimos de CPU ni RAM.
- El modelo de lenguaje subyacente lo aporta el usuario a través de RisuAI; los requisitos de GPU dependen por completo de ese modelo y no del plugin.
- Opciones de despliegue del plugin: instalación manual mediante ZIP o actualización automática a través de la ruta oficial de RisuAI (`WygLoreLeaf-*-latest.js`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Producto | Tipo | Persistencia | Servidor | Licencia | Idiomas |
|---|---|---|---|---|---|
| WygLore Leaf 3.4.4 | Plugin de memoria para RisuAI | Sí, por chat | Opcional (Root 1.4.5) | Apache 2.0 | Coreano |
| MemGPT / Letta | Framework de memoria para agentes | Sí, jerárquica | Requiere backend | Apache 2.0 | Inglés principalmente |
| Mem0 | Capa de memoria para LLMs | Sí, vectorial | Servicio o local | Apache 2.0 | Inglés principalmente |
| SillyTavern + extensiones de memoria | Frontend con plugins | Variable según extensión | No | AGPL-3.0 (núcleo) | Multiidioma |

La comparación es aproximada: WygLore Leaf está acoplado específicamente a RisuAI y su documentación es exclusivamente coreana, mientras que las alternativas son frameworks genéricos con comunidades internacionales. No se dispone de datos comparativos de rendimiento entre estas soluciones.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por sí mismo ni puede evaluarse con métricas como MMLU, HumanEval o GSM8K.
- Documentación, interfaz y changelogs exclusivamente en coreano, lo que limita su adopción fuera de esa comunidad.
- Dependencia total de RisuAI: no funciona con otros frontends ni con pipelines de agentes estándar.
- La calidad de la memoria está condicionada por el modelo subyacente que el usuario configure; el plugin no garantiza extracción correcta de recuerdos.
- Riesgo de acumulación de recuerdos irrelevantes o erróneos si la selección por relevancia falla, con posible degradación de la coherencia conversacional.
- El servidor Root expone un panel en `127.0.0.1:6003`; la model card advierte explícitamente de no publicar la dirección de administración, los ficheros de conexión ni los respaldos.
- La gestión de tokens de administrador y de dispositivo requiere cuidado operativo; una filtración permitiría acceso a las memorias almacenadas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de auditorías independientes desaconseja su uso en producción sin validación propia.
- Fechas de creación y actualización del repositorio (2026) y recuento de descargas (0) sugieren un proyecto de nicho con escasa tracción verificable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/m6dd8m/wyglore-leaf
- Carpeta de descargas manuales (Proton Drive): https://drive.proton.me/urls/430G895V60#EBi501HzFXu6
- Changelog del plugin (`release.md`): https://huggingface.co/m6dd8m/wyglore-leaf/blob/main/release.md
- Changelog del servidor (`root-release.md`): https://huggingface.co/m6dd8m/wyglore-leaf/blob/main/root-release.md
- Guía de usuario (`user-guide.md`): https://huggingface.co/m6dd8m/wyglore-leaf/blob/main/user-guide.md
- Manifiesto de versión (`version.json`): https://huggingface.co/m6dd8m/wyglore-leaf/blob/main/version.json
- Código fuente público de Leaf 3.4.4: https://huggingface.co/m6dd8m/wyglore-leaf/blob/main/sources/wyglore-leaf-public-3.4.4.zip
- Código fuente público de Root Server 1.4.5: https://huggingface.co/m6dd8m/wyglore-leaf/blob/main/sources/wyglore-root-public-1.4.5.zip
