# HAYKOZAQ/zenless-zone-zero-mod-menu-free

## Resumen

El repositorio identificado como `HAYKOZAQ/zenless-zone-zero-mod-menu-free` no contiene un modelo de inteligencia artificial. Se trata de un paquete publicado en Hugging Face que, segun su propia model card, distribuye un ejecutable de Windows (`solara-executor-v3-keyless-v1.2.2-win64.exe`) empaquetado en un archivo ZIP de 4,8 MB protegido con contrasena. El contenido se presenta como un "mod menu" para el videojuego Zenless Zone Zero, con funciones descritas como radar 2D, overlay externo a 144 Hz, filtro de loot y suavizado de entrada tipo bezier.

El artefacto no incluye pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia. Los tags del repositorio (windows, x64, portable) y los idiomas declarados corresponden a la metadata del ejecutable, no a capacidades linguisticas de un modelo. Por tanto, esta ficha no puede documentar especificaciones tecnicas de un modelo de lenguaje, vision o multimodal.

Desde la perspectiva de evaluacion de modelos, este repositorio debe clasificarse como contenido ajeno al ecosistema de IA open source. La publicacion de binarios ejecutables con contrasena en plataformas de modelos, junto con tecnicas de evasion de captura de pantalla (OBS, ShadowPlay, Discord) y un "panic key" para cerrar el proceso, constituye un patron de riesgo de seguridad. No se recomienda su descarga ni ejecucion en entornos de desarrollo o investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los idiomas listados corresponden a metadata del binario: en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) |
| Licencia | MIT (declarada en la model card) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni documentacion de arquitectura neuronal, dataset, tokens de entrenamiento o tecnicas de alineacion como RLHF o DPO. La unica "arquitectura" descrita es la de un ejecutable de Windows que, segun el autor, opera mediante overlay externo, polling a frecuencias declaradas de 348 Hz, 384 Hz y 426 Hz, y perfiles JSON intercambiables en caliente. Estos datos provienen exclusivamente de la model card y no han sido verificados.

No existe informacion sobre el origen del binario, el codigo fuente, la cadena de compilacion ni los procesos que ejecuta tras el arranque. La presencia de una contrasena de extraccion (`2026`) y de enlaces de descarga alojados en repositorios de GitHub de terceros dificulta cualquier auditoria.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe codigo ni procesa lenguaje natural.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No dispone de modo de razonamiento, vision, audio ni multimodalidad.
- El binario declara funcionalidades de modificacion de un videojuego: radar 2D, filtro de loot por rareza, ESP de cajas delimitadoras 2D/3D, esqueletos de huesos y distancia.
- Declara una capa de render "stream-proof" orientada a excluirse de la captura en OBS, ShadowPlay y Discord.
- Declara una tecla de panico (`END`) para terminar el proceso con liberacion de handles.
- Declara perfiles JSON intercambiables (presets Legit, Visual y Custom).

## Casos de uso

No se identifican casos de uso legitimos dentro del desarrollo de software, la investigacion en IA o el despliegue de modelos. Los escenarios que la model card sugiere son:

- Modificacion de un videojuego de terceros, lo que puede contravenir los terminos de servicio del juego y las leyes de propiedad intelectual aplicables.
- Evasion de sistemas de captura de pantalla en streaming, lo que puede facilitar la difusion de trampas sin deteccion.
- Distribucion de binarios ofuscados con contrasena, practica incompatible con la reproducibilidad cientifica y con las politicas de cadena de suministro segura.
- Ejecucion de codigo no auditado con privilegios de administrador en Windows, con riesgo de compromiso del sistema anfitrion.
- Uso como señuelo en campanas de ingenieria social dirigidas a jugadores, dado el esquema de descarga con contrasena y multiples repositorios intermedios.
- Publicacion en Hugging Face aprovechando la visibilidad de la plataforma para distribuir software ajeno a modelos, lo que degrada la calidad del catalogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (frecuencias de polling, tiempos de respuesta inferiores a 6 ms, valoracion de 4,8/5, 151K descargas) son afirmaciones de marketing sin verificacion independiente y no constituyen metricas de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no es un modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Espacio en disco: aproximadamente 4,8 MB para el ZIP, mas el espacio de extraccion.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son auditables.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de IA tipico en Hugging Face |
|---|---|---|
| Contenido | Ejecutable de Windows en ZIP | Pesos en safetensors o GGUF |
| Pesos | No disponibles | Disponibles y versionados |
| Arquitectura documentada | No | Si (transformer, MoE, SSM, etc.) |
| Reproducibilidad | Nula (binario cerrado con contrasena) | Alta (pesos y tokenizador publicos) |
| Auditoria de seguridad | Imposible sin ingenieria inversa | Posible mediante revision de pesos y codigo |
| Licencia | MIT declarada sobre un binario | MIT, Apache 2.0, Llama, etc. |
| Uso previsto | Modificacion de videojuego | Inferencia de lenguaje, vision o multimodal |

No se identifican modelos comparables porque el artefacto no pertenece a la categoria de modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generacion de texto, codigo o razonamiento queda fuera de lugar.
- El binario se distribuye comprimido con contrasena y alojado en repositorios de GitHub de terceros, lo que impide verificar su integridad y procedencia.
- Declara explicitamente funciones de evasion de captura de pantalla, lo que sugiere un diseno orientado a ocultar su actividad.
- La ejecucion como administrador amplia el impacto potencial de cualquier codigo malicioso embebido.
- La licencia MIT declarada no garantiza la legalidad del uso del software respecto a los terminos de servicio del videojuego ni respecto a derechos de terceros.
- Los enlaces de descarga apuntan a cuentas de GitHub no verificadas y pueden cambiar o desaparecer, rompiendo la trazabilidad.
- Las cifras de rendimiento y popularidad de la model card no son verificables y deben tratarse como no fiables.
- Riesgo de suplantacion: el nombre del repositorio imita practicas de distribucion de mods, un vector habitual de malware dirigido a jugadores.
- No apto para entornos de produccion, CI/CD ni investigacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HAYKOZAQ/zenless-zone-zero-mod-menu-free
- Enlace de descarga citado en la model card (GitHub, cuenta de terceros): https://github.com/GraceFernandez01321/solara-executor-v3-keyless/releases/download/v1.2.0/solara-executor-v3-keyless-v1.2.2-win64.zip
- Repositorio de releases citado en la model card: https://github.com/kenjiharris46/zenless-zone-zero-mod-menu-free/releases/latest
