# pisthyt/overwatch-esp-aimbot

## Resumen

`pisthyt/overwatch-esp-aimbot` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es la model card de una herramienta de trampas (cheat) para el videojuego Overwatch, distribuida como un ejecutable de Windows de 64 bits (`repo-cheat-mod-menu-v1.2.2-win64.exe`, build `v4.5.4`) empaquetado en un archivo ZIP de 4,8 MB protegido con la contraseña `2026`. El autor declarado en Hugging Face es el usuario `pisthyt`, aunque la propia model card atribuye la publicación al repositorio de GitHub `GimetuLoxa79/overwatch-esp-aimbot`.

El artefacto describe funcionalidades propias de un aimbot y un ESP (Extra Sensory Perception): escáner dinámico de offsets, capa de renderizado «stream-proof» que oculta la superposición a OBS, ShadowPlay y Discord, radar 2D con filtro de loot, suavizado de entrada por curvas de Bézier con radio de FOV configurable, VisCheck y una tecla de pánico (`END`) para descargar el proceso. Se distribuye como binario externo en modo usuario, sin inyección de DLL en el proceso del juego, y declara compatibilidad con Windows 10/11 x64.

Es relevante ahora únicamente como caso de estudio de riesgo en la cadena de suministro de artefactos alojados en plataformas de modelos: un paquete con etiquetas de modelo, licencia MIT y 14 idiomas declarados que en realidad entrega un ejecutable de terceros con contraseña en el archivo comprimido, sin pesos, sin arquitectura y sin pipeline. No existe ningún transformer, ningún parámetro ni ningún contexto que evaluar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible; el artefacto es `repo-cheat-mod-menu-v1.2.2-win64.zip` (4,8 MB) con binario `.exe` |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de red neuronal, ni dataset, ni proceso de entrenamiento, ni RLHF/DPO. El contenido técnico descrito en la model card corresponde a un programa nativo para Windows x64 con las siguientes características declaradas por el autor: núcleo externo en modo usuario que emplea Desktop Duplication para el renderizado sin hooks internos, escáner dinámico de offsets con resolución automática de firmas de punteros tras los parches del juego, y reparto de carga entre 9 y 13 hilos de trabajo según el módulo. El consumo de memoria se declara por debajo de 34 MB y el tiempo de respuesta por debajo de 7 ms.

Las cifras anteriores son afirmaciones del autor en la model card y no han sido verificadas de forma independiente. No hay paper, repositorio de código fuente, pesos ni artefacto auditable que permita reproducir o validar el comportamiento descrito.

## Capacidades

- Ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- El soporte multilingüe es puramente declarativo en los metadatos (14 idiomas), sin artefacto lingüístico asociado.
- Funcionalidades declaradas por el autor, propias de un cheat: ESP con radar 2D y filtro de loot por rareza, aimbot con suavizado Bézier y radio de FOV configurable, VisCheck, ocultación de la superposición ante capturadores de pantalla y tecla de pánico `END`.

## Casos de uso

Ninguno legítimo en el ámbito de la IA open source. Los escenarios realistas son de análisis de riesgo y no de despliegue:

- Análisis de cadena de suministro en plataformas de modelos: estudiar cómo un artefacto etiquetado como modelo puede entregar un binario ejecutable con contraseña, útil para diseñar políticas de moderación y filtros de subida.
- Formación en seguridad defensiva: usar la model card como ejemplo documentado de ingeniería social (insignias de «99 % verificado», contador de descargas inflado, instrucciones para ejecutar como administrador y desactivar avisos de SmartScreen).
- Concienciación sobre riesgos de ejecución de binarios: ilustrar por qué no debe ejecutarse como administrador un archivo descargado de un repositorio de modelos.
- Auditoría de metadatos: revisar cómo etiquetas como `license:mit` o `region:us` pueden aplicarse a contenido que no es un modelo, y qué implicaciones tiene para los pipelines automáticos de descubrimiento.
- Investigación sobre integridad competitiva en videojuegos: documentar la existencia y las tácticas de distribución de herramientas de trampa en plataformas de modelos.
- Detección y bloqueo automatizado: alimentar reglas de clasificación que identifiquen repositorios con patrones de cheat (enlaces a releases de GitHub, contraseñas de extracción, instrucciones de ejecución como administrador).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas métricas presentes son afirmaciones del autor sobre el propio programa (menos de 34 MB de RAM, menos de 7 ms de respuesta, 9 a 13 hilos de trabajo), sin metodología ni verificación independiente. No son comparables con benchmarks de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica; el requisito declarado es Windows 10/11 de 64 bits sobre CPU Intel o AMD x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna. El «despliegue» descrito consiste en extraer un ZIP con contraseña y ejecutar un `.exe` como administrador.
- Latencia y throughput: no disponibles como métricas de inferencia; las cifras del autor (menos de 7 ms) se refieren a la respuesta del programa de trampas.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable: este repositorio no contiene un modelo de IA. Frente a un modelo open source real, las diferencias son categóricas, no de rendimiento.

| Criterio | `pisthyt/overwatch-esp-aimbot` | Modelo de IA open source típico |
|---|---|---|
| Contenido | Binario `.exe` en ZIP con contraseña | Pesos en safetensors/GGUF |
| Parámetros | No aplica | Millones a cientos de miles de millones |
| Contexto | No aplica | Miles a millones de tokens |
| Licencia | MIT declarada sobre un ejecutable | MIT, Apache 2.0, Llama, etc. |
| Auditabilidad | Nula (sin código fuente ni pesos) | Alta (pesos y a menudo código) |
| Uso previsto | Trampas en un videojuego | Generación, razonamiento, código |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto ni procesa lenguaje; cualquier evaluación como modelo es un error de categoría.
- Riesgo de seguridad alto: se instruye al usuario a extraer un ZIP protegido con contraseña y ejecutar un `.exe` como administrador, lo que impide el escaneo previo del contenido y eleva los privilegios del binario.
- La propia model card reconoce que Windows Defender y SmartScreen generan alertas y ofrece instrucciones para sortearlas; esto es un indicador de riesgo, no una garantía de legitimidad.
- Sin código fuente, sin pesos y sin trazabilidad del binario: no es posible verificar qué hace realmente el ejecutable ni si incluye código malicioso adicional.
- Uso prohibido por los términos de servicio de Overwatch y potencialmente ilegal según la jurisdicción; puede conllevar el baneo de la cuenta y responsabilidades civiles.
- La licencia MIT declarada no aporta garantías sobre el binario ni sobre su procedencia; aplicarla a un ejecutable de terceros sin código fuente es, como mínimo, cuestionable.
- Los contadores de descargas y valoraciones de la model card (522 K descargas, «99 % verificado») no son verificables y deben tratarse como afirmaciones promocionales.
- Los metadatos de idioma (14 idiomas) no corresponden a ninguna capacidad lingüística del artefacto.
- Recomendación: no descargar ni ejecutar el artefacto; reportar el repositorio a la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pisthyt/overwatch-esp-aimbot
- Repositorio de GitHub citado en la model card: https://github.com/GimetuLoxa79/overwatch-esp-aimbot
- Releases citadas en la model card: https://github.com/GimetuLoxa79/overwatch-esp-aimbot/releases/latest
- URL de descarga referenciada (no recomendada): https://github.com/RenSiekiera/repo-cheat-mod-menu/releases/download/v1.2.0/repo-cheat-mod-menu-v1.2.2-win64.zip
