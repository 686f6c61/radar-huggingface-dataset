# rodof4/dont-splash-script

## Resumen

El repositorio `rodof4/dont-splash-script` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows x64 distribuido como archivo comprimido (`delta-executor-pc-2026-v1.2.2-win64.zip`, 4,8 MB) que, segun su propia model card, incluye modulos de tipo "executor" con funciones de overlay externo, escaneo de offsets de memoria, suavizado de entrada tipo bezier y exclusion de captura de pantalla. No hay pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia asociados.

El contenido de la model card describe tecnicas propias de herramientas de trampas para videojuegos (ESP de cajas delimitadoras y esqueletos, VisCheck, perfiles "Legit"/"Visual", polling a 322 Hz y 141 Hz, ejecucion en modo usuario con lectura directa de memoria). El propio texto promociona la evasion de sistemas de captura como OBS, ShadowPlay y Discord, lo que constituye una senal de alarma clara sobre la finalidad del binario.

Desde la perspectiva de evaluacion de modelos, esta ficha no puede aportar especificaciones de arquitectura, parametros, contexto ni benchmarks porque no existe ningun modelo subyacente. La informacion se limita a metadatos de Hugging Face (0 descargas, 0 likes, licencia MIT declarada, etiquetas multilingues) y a un README con instrucciones de descarga y ejecucion de un ejecutable de procedencia dudosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio) |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto descrito es un ejecutable nativo para Windows x64 (`delta-executor-pc-2026-v1.2.2-win64.exe`, build `v1.5.6`) empaquetado en un ZIP de 4,8 MB protegido con la contrasena `2026`. La model card menciona modulos como "Stream-Proof Render Layer", "Dynamic Offset Scanner", "Bezier Input Smoothing", "Hot-Swap JSON Profiles", "User-Mode External Core" y "144Hz+ External Overlay", todos ellos propios de software de automatizacion o trampas en juegos, no de un sistema de aprendizaje automatico.

No hay informacion sobre datos de entrenamiento, tokens procesados, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia (decodificacion especulativa, atencion lineal). Cualquier afirmacion en ese sentido seria inventada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, codigo, matematicas ni razonamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de procesamiento de lenguaje natural; las etiquetas de idioma del repositorio no corresponden a capacidades del artefacto.
- El binario descrito incluye, segun su autor, overlay externo con cajas 2D/3D y esqueletos, escaneo de offsets de memoria, suavizado de entrada y perfiles JSON intercambiables.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad de inferencia neuronal.

## Casos de uso

- No procede: al no ser un modelo de IA, no existen casos de uso legitimos de inferencia, generacion o analisis.
- Evaluacion de seguridad: el repositorio puede utilizarse como muestra para estudiar patrones de distribucion de software potencialmente malicioso (ZIP con contrasena, enlaces a repositorios de terceros, promocion de evasion de captura).
- Analisis de malware: un equipo de seguridad podria inspeccionar el binario en un entorno aislado para determinar su comportamiento real.
- Investigacion de model cards enganosas: sirve como ejemplo de publicacion en Hugging Face que no cumple los criterios de un modelo y que mezcla metadatos de modelo con distribucion de ejecutables.
- Formacion en higiene de cadena de suministro: ilustra por que no deben ejecutarse binarios descargados de repositorios con cero descargas y cero likes.
- No se recomienda su uso en produccion, desarrollo ni entornos personales bajo ninguna circunstancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay inferencia).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles.
- Latencia y throughput: no disponibles.
- Requisitos del artefacto: Windows 10/11 de 64 bits, procesador Intel o AMD x64, 4,8 MB de espacio en disco para el ZIP y permisos de administrador segun las instrucciones del autor.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Como referencia de categoria, se podria comparar con otros repositorios de Hugging Face que distribuyen ejecutables en lugar de pesos, pero no se dispone de datos verificables para establecer una tabla fiable.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la ficha de Hugging Face esta siendo utilizada para distribuir un ejecutable de Windows.
- La model card incluye instrucciones para desactivar o evadir sistemas de captura (OBS, ShadowPlay, Discord) y funciones propias de trampas en videojuegos, lo que puede violar terminos de servicio y legislacion aplicable.
- El binario se distribuye en un ZIP protegido con contrasena (`2026`), practica habitual para dificultar el analisis automatico por parte de antivirus y plataformas.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`dawidb9567/delta-executor-pc-2026`) distintos del propietario del repositorio de Hugging Face, lo que incrementa el riesgo de cadena de suministro.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso legitimo ni de comunidad que valide el artefacto.
- Riesgo elevado de malware, robo de credenciales o instalacion de software no deseado. No debe ejecutarse en ningun sistema sin analisis previo en sandbox.
- La licencia MIT declarada no otorga garantias y no cubre el uso indebido del binario.
- No apto para uso comercial, educativo ni de investigacion sin las debidas precauciones de seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rodof4/dont-splash-script
- Repositorio de GitHub citado en la model card: https://github.com/Bach1819/dont-splash-script
- Repositorio de GitHub de descarga citado: https://github.com/dawidb9567/delta-executor-pc-2026
- Enlace de descarga directa citado: https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
