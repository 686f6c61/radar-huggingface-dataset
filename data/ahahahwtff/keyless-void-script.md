# ahahahwtff/keyless-void-script

## Resumen

`ahahahwtff/keyless-void-script` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una página de descarga de un supuesto ejecutable para Windows 11/64 bits, etiquetado como `keyless-void-script`. La model card no describe arquitectura, pesos, tokenizador ni proceso de entrenamiento alguno; en su lugar incluye instrucciones para descargar un ZIP de 8,9 MB desde un repositorio de GitHub de terceros (`doriskaya7559/keyless-void-script`), extraerlo con la contraseña `2026` y ejecutar un binario como administrador.

El texto del README describe funcionalidades propias de un *cheat* o herramienta de trampas para videojuegos: núcleo externo en modo usuario con acceso directo a memoria, overlay externo a 144 Hz con cajas delimitadoras y esqueletos, radar 2D con filtro de botín, tecla de pánico (`END`) para descargar el proceso y un escáner dinámico de offsets que resuelve firmas de punteros tras los parches del juego. Menciona además un supuesto «anticheat bypass» y una «protección HWID», lo que sitúa el artefacto en el ámbito del software de evasión.

Por tanto, esta ficha no puede documentar especificaciones de un modelo lingüístico porque no existen. El repositorio no contiene pesos, no tiene pipeline declarado, registra cero descargas y cero *likes*, y su creación y actualización están separadas por un segundo (2026-11-24T07:01:53 y 07:01:54). La relevancia aquí es de naturaleza distinta: sirve como ejemplo de repositorio señuelo en Hugging Face que redirige a descargas externas potencialmente maliciosas, y conviene advertir de ello a desarrolladores e investigadores que exploren el Hub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una página de descarga de un ejecutable) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; corresponden a los idiomas de la documentación, no a capacidades del artefacto) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un `.zip` de 8,9 MB con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El README describe un programa nativo para Windows 10/11 de 64 bits (`keyless-void-script-v1.2.0-win64.exe`, build `v3.7.2`, identificador `91E70C087E`) empaquetado en un ZIP de 8,9 MB protegido con contraseña. Las «capacidades» enumeradas son módulos de manipulación de memoria de otros procesos: lectura directa de memoria en modo usuario sin *hooks* DLL internos, overlay renderizado mediante Desktop Duplication API, escaneo de offsets a 312 Hz y sondeo del radar a 249 Hz.

El uso de una contraseña fija en el archivo comprimido y la distribución mediante un repositorio de GitHub ajeno al Hub son patrones habituales para dificultar el análisis automatizado y el escaneo por parte de las plataformas. No hay información sobre el origen del binario, su cadena de compilación ni auditoría alguna. No se ha publicado ningún detalle sobre dataset, RLHF, DPO ni innovación técnica en el sentido de la IA.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta *tool calling* ni *function calling*.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje natural; los 14 idiomas listados son los de la documentación del repositorio.
- Funcionalidad declarada por el autor (software de trampas para juegos): overlay externo con cajas 2D/3D y esqueletos, radar 2D con filtro de botín por rareza, perfiles JSON intercambiables en caliente, tecla de pánico `END` y escáner dinámico de offsets.
- El propio README menciona mecanismos de evasión de sistemas antitrampas y de identificación de hardware (HWID).

## Casos de uso

No procede. Un artefacto de esta naturaleza no tiene casos de uso legítimos en desarrollo de software, investigación en IA ni producción. Los escenarios que el autor plantea (trampas en videojuegos multijugador) conllevan incumplimiento de los términos de servicio de los juegos, riesgo de baneo y, potencialmente, responsabilidad legal según la jurisdicción.

- Auditoría de seguridad defensiva: un analista puede usar este repositorio como muestra de referencia de patrón señuelo en el Hub (metadatos de modelo con etiquetas de idioma, licencia MIT y pipeline ausente que redirigen a un binario externo protegido con contraseña).
- Formación en concienciación: sirve como ejemplo didáctico de ingeniería social dirigida a desarrolladores, con badges falsos de descargas (498K+) y valoraciones (4,8/5) que no se corresponden con las métricas reales del Hub (0 descargas, 0 *likes*).
- Detección y filtrado: los equipos que operan réplicas internas del Hub pueden usar las firmas de este repositorio (contraseña en el README, enlace a GitHub de terceros, instrucciones de «ejecutar como administrador») para construir reglas de cuarentena.
- Análisis de malware: el binario puede someterse a análisis estático y dinámico en una máquina virtual aislada para extraer indicadores de compromiso.
- Respuesta a incidentes: si un usuario corporativo ha descargado el ZIP, el equipo de seguridad puede emplear los hashes y el nombre del artefacto para localizar y erradicar la instalación.
- Documentación de cumplimiento: registrar el repositorio como ejemplo de contenido no conforme con las políticas de uso del Hub para justificar procesos de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README incluye cifras de rendimiento del ejecutable (respuesta del overlay en menos de 18 ms, sondeo a 249 Hz y 312 Hz, consumo inferior a 31 MB de RAM, consistencia del 98,9 %), pero son afirmaciones del autor sin verificación independiente y no corresponden a ninguna tarea de evaluación de modelos.

## Requisitos de hardware

- VRAM: no aplica; no hay pesos ni inferencia neuronal.
- GPU: no aplica. El README menciona renderizado por Desktop Duplication, pero no especifica requisitos de GPU.
- Sistema operativo: Windows 10/11 de 64 bits, según el autor.
- Almacenamiento: el archivo ZIP ocupa 8,9 MB; el tamaño descomprimido no se indica.
- Memoria RAM: el autor afirma un consumo inferior a 31 MB.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: no disponibles como métricas de modelo; las cifras del README no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Si se compara con otros repositorios señuelo del Hub, la información pública es insuficiente para establecer una tabla rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo lingüístico carece de sentido.
- Riesgo de seguridad elevado: distribución de un binario opaco desde un repositorio de GitHub de terceros, con contraseña fija (`2026`) que dificulta el escaneo automático y con instrucciones explícitas de ejecutarlo como administrador.
- El propio README reconoce que Windows Defender y SmartScreen pueden alertar y recomienda desactivar o ignorar esas protecciones, lo que constituye una señal de alarma clásica.
- Las métricas mostradas (498K+ descargas, 4,8/5) son badges estáticos del README y no reflejan las métricas reales del Hub (0 descargas, 0 *likes*).
- La licencia MIT declarada en los metadatos no implica que el binario externo sea auditable ni que su código fuente esté disponible.
- Uso en juegos multijugador: viola los términos de servicio habituales, puede conllevar el baneo permanente de cuentas y, en algunas jurisdicciones, responsabilidad civil o penal.
- Los mecanismos de evasión de antitrampas y de HWID descritos pueden entrar en conflicto con legislación de ciberseguridad.
- No hay garantía de integridad: el ZIP y el ejecutable no están firmados digitalmente según la información disponible.
- Fecha de creación y actualización separadas por un segundo, autor sin historial verificable y ausencia de pipeline: indicios de repositorio automatizado o señuelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ahahahwtff/keyless-void-script
- Repositorio de GitHub referenciado en el README (no verificado): https://github.com/doriskaya7559/keyless-void-script
- Descarga directa citada en el README (no recomendada, no verificada): https://github.com/doriskaya7559/keyless-void-script/releases/latest/download/keyless-void-script-v1.2.0-win64.zip
