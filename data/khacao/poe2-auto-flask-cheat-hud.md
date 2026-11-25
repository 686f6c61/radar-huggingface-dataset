# Khacao/poe2-auto-flask-cheat-hud

## Resumen

`Khacao/poe2-auto-flask-cheat-hud` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un ejecutable portable para Windows x64 presentado como herramienta de trampas (cheat) para el videojuego Path of Exile 2, con superposicion HUD, auto-flask, ESP y radar. El autor lo distribuye como archivo ZIP con contrasena y lo enlaza a un binario alojado en un repositorio de GitHub de terceros.

El repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni ningun artefacto propio de un modelo de lenguaje. La model card es un texto promocional de descarga que incluye enlaces a un binario `.exe`, instrucciones para desactivar advertencias del antivirus y una contrasena de extraccion. No hay pipeline declarado, ni dataset, ni informacion de entrenamiento.

Desde la perspectiva de evaluacion de modelos, este repositorio debe clasificarse como no conforme con la categoria y tratarse como software de terceros potencialmente malicioso. La ficha se completa a continuacion con los campos obligatorios, indicando explicitamente la ausencia de datos tecnicos de modelo en todos los casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario portable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas en la model card, sin validacion) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No aplica. El repositorio no describe ninguna arquitectura de red neuronal, ni transformer, ni MoE, ni SSM, ni modelo hibrido. No se declara numero de tokens de entrenamiento, composicion de dataset, ni fases de RLHF, DPO o ajuste supervisado, porque no existe un proceso de entrenamiento documentado.

La model card describe en su lugar un supuesto "user-mode external core" con renderizado por Desktop Duplication, polling a 282 Hz, superposicion externa a 144 Hz, suavizado de entrada por curvas de Bezier y una tecla de panico (`END`) para descargar el proceso. Son afirmaciones de marketing sobre un ejecutable de cheat, sin codigo fuente, sin trazabilidad de build y sin verificacion independiente. El binario se distribuye comprimido con contrasena (`2026`) y alojado fuera de Hugging Face, lo que impide cualquier auditoria del contenido real.

## Capacidades

- No hay capacidades de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No hay soporte de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingues reales; los codigos de idioma son etiquetas de metadatos sin funcionalidad asociada.
- Segun la model card, el binario afirmaria ofrecer: superposicion externa con cajas 2D/3D, esqueletos y ESP de distancia; radar 2D y filtro de loot; auto-flask; suavizado de apuntado con radio de FOV configurable y VisCheck; y supuesta evasion de captura de pantalla en OBS, ShadowPlay y Discord.
- Estas capacidades no son verificables y su naturaleza (trampas en un juego multijugador) implica incumplimiento de los terminos de servicio del juego.

## Casos de uso

No se identifican casos de uso legitimos de IA para este repositorio. Los escenarios que la model card sugiere son los siguientes, descritos solo a efectos de analisis de riesgo:

- Automatizacion de trampas en Path of Exile 2: el binario afirmaria gestionar frascos y superponer informacion de enemigos y objetos, lo que viola los terminos de servicio del juego y puede conllevar el baneo de la cuenta.
- Evasion de sistemas antitrampas: la supuesta capa de renderizado "stream-proof" estaria disenada para ocultar la superposicion a herramientas de captura, un patron tipico de software de evasion.
- Distribucion de software con ofuscacion: el ZIP protegido con contrasena y el binario alojado en un repositorio de terceros son vectores habituales de malware; no debe ejecutarse en entornos de produccion ni personales.
- Investigacion de malware: un analista podria usar el repositorio como muestra para estudiar tecnicas de ingenieria social en model cards (badges falsos, enlaces a binarios, instrucciones para desactivar SmartScreen), siempre en sandbox aislada y sin ejecucion directa.
- Auditoria de cadena de suministro en Hugging Face: sirve como ejemplo de contenido que deberia filtrarse por politicas de plataforma al no ser un modelo y enlazar a ejecutables externos.
- Formacion en seguridad: utilizable como caso practico de identificacion de indicadores de compromiso (contrasena en el README, enlaces a GitHub ajenos, promesas de evasion de antivirus).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no es un modelo de IA.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue: no aplica (no hay soporte para vLLM, llama.cpp, Ollama ni TGI).
- Huella declarada por el autor: tamano de paquete de 4,8 MB y menos de 32 MB de RAM en ejecucion, cifras no verificadas.
- Latencia y throughput: no disponibles; las cifras de 282 Hz de polling y menos de 4 ms de respuesta son afirmaciones del autor sin validacion.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Frente a otros artefactos de la misma categoria (ejecutables de cheat para Windows), no se dispone de informacion verificable para establecer una comparacion tecnica.

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en evaluaciones de LLM, pipelines de inferencia ni catalogos de modelos.
- Riesgo de malware elevado: el binario se distribuye fuera de Hugging Face, comprimido con contrasena y con instrucciones explicitas para desactivar SmartScreen y whitelistear el directorio. Estos son indicadores clasicos de software malicioso.
- La licencia MIT declarada en los metadatos no cubre el binario de terceros enlazado y no aporta ninguna garantia juridica sobre el contenido real.
- Uso en juegos multijugador: la funcionalidad descrita (auto-flask, ESP, radar, evasion de captura) constituye trampa y puede provocar el baneo permanente de cuentas y acciones legales segun la jurisdiccion.
- Etiquetas de idioma no verificadas: los 14 codigos de idioma son metadatos sin respaldo funcional.
- Sin trazabilidad: no hay hash publicados, firma de codigo, repositorio fuente ni historial de builds que permitan auditar el ejecutable.
- Alucinacion y sesgos: no aplica, al no existir componente generativo.
- Recomendacion: no descargar ni ejecutar el artefacto; reportar el repositorio a la plataforma por contenido enganoso y enlace a binarios no auditados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Khacao/poe2-auto-flask-cheat-hud
- Enlace de descarga del ZIP citado en la model card (no recomendado): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
- Repositorio GitHub de terceros citado: https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026
- Releases del repositorio de terceros citado: https://github.com/Virginie22931/poe2-auto-flask-cheat-hud/releases/latest
- Paper, blog o demo oficial: no disponible
