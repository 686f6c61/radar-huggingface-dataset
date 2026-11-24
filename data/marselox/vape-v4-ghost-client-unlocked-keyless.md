# Marselox/vape-v4-ghost-client-unlocked-keyless

## Resumen

`Marselox/vape-v4-ghost-client-unlocked-keyless` no es un modelo de inteligencia artificial ni un artefacto de aprendizaje automatico. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un ejecutable de Windows (`vape-v4-ghost-client-unlocked-keyless-v1.2.0-win64.exe`) empaquetado en un ZIP de 8,9 MB protegido con contrasena, distribuido a traves de enlaces a GitHub Releases. La model card lo describe como un "ghost client" para Windows 10/11 de 64 bits, es decir, software de trampas (cheat) para videojuegos con funciones de overlay externo, ESP (deteccion de jugadores a traves de paredes), smoothing de entrada y evasion de capturas de pantalla.

El artefacto no contiene pesos, tokenizador, configuracion de transformers ni pipeline declarado. Las etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y la licencia MIT son metadatos del repositorio, no indicativos de capacidades linguisticas de un modelo. No existe arquitectura, numero de parametros ni ventana de contexto que reportar.

Desde la perspectiva de un editor tecnico de IA open source, este repositorio debe clasificarse como no computacional y potencialmente malicioso: un binario cerrado, con contrasena de extraccion, alojado fuera de Hugging Face y con tecnicas descritas de evasion de deteccion. No es evaluable como modelo y no debe desplegarse en ningun entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible como capacidad de modelo; el repositorio declara 14 etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible; el artefacto es un `.exe` dentro de un `.zip` de 8,9 MB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-24 |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de red neuronal, corpus de entrenamiento, tokens procesados ni fases de ajuste (SFT, RLHF, DPO). El contenido descrito en la model card es un binario compilado para Windows x64 con modulos de escaneo de offsets, overlay externo a 144 Hz, perfiles JSON intercambiables en caliente, suavizado de entrada Bezier y una capa de render "stream-proof" orientada a excluirse de OBS, ShadowPlay y la captura de Discord. Ninguna de estas afirmaciones es verificable ni constituye una innovacion en IA.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de un modelo; las etiquetas de idioma del repositorio son metadatos de indexacion.
- El binario declara funciones de cheat para videojuegos: ESP con cajas 2D/3D y esqueletos de huesos, smoothing de punteria con radio de FOV y VisCheck, tecla de panico (`END`) y evasion de captura de pantalla.

## Casos de uso

No existen casos de uso legitimos como modelo de IA. Los escenarios que el autor describe son:

- Trampas en videojuegos multijugador mediante overlay externo con ESP y asistencia de punteria, lo que viola habitualmente los terminos de servicio de los juegos y puede conllevar el baneo de cuentas.
- Evasion de sistemas antitrampas y de captura de pantalla, con riesgo de sanciones y de dano reputacional para quien lo integre.
- Distribucion de software cerrado con contrasena de extraccion, un patron habitual en campanas de malware; no debe ejecutarse en equipos de desarrollo, CI/CD ni entornos de produccion.
- Indexacion fraudulenta en Hugging Face: el repositorio ocupa espacio de un hub de modelos para distribuir un ejecutable, lo que degrada la calidad del catalogo y expone a los usuarios a riesgo de seguridad.
- Cualquier uso en investigacion de IA, evaluacion de modelos o prototipado es inaplicable: no hay pesos, API ni inferencia que probar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA porque el artefacto no es un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del binario declarados por el autor: Windows 10 u 11 de 64 bits, ejecucion como administrador, menos de 41 MB de RAM para el modulo de panico y menos de 25 MB para la capa de render, segun la model card.
- Latencia y throughput: no disponibles; las cifras de 144 Hz y 182 Hz de polling son afirmaciones del autor sin verificacion independiente.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos similares" porque el artefacto no es un modelo de IA. Frente a modelos open source reales (por ejemplo, familias tipo Llama, Mistral o Qwen), la comparacion carece de sentido: aquellos publican pesos, tokenizador y evaluaciones; este repositorio publica un ejecutable con contrasena.

| Criterio | Este repositorio | Modelo de IA open source tipico |
|---|---|---|
| Pesos publicados | No | Si (safetensors, GGUF) |
| Parametros | No disponible | Declarados |
| Contexto | No disponible | Declarado |
| Evaluaciones | Ninguna | Benchmarks publicados |
| Reproducibilidad | Nula (binario cerrado) | Alta |
| Riesgo de seguridad | Alto (ejecutable con evasion) | Bajo |

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse en comparativas de modelos ni evaluarse con herramientas de IA.
- Binario cerrado distribuido fuera de Hugging Face a traves de enlaces a GitHub Releases, con contrasena de extraccion (`2026`) que impide el analisis previo y es un indicador clasico de campana maliciosa.
- La model card incluye instrucciones para desactivar o sortear avisos de Windows Defender y SmartScreen, lo que supone un riesgo directo de seguridad para el usuario.
- El software declara funciones de evasion de capturas y de sistemas antitrampas; su uso puede violar terminos de servicio, leyes de proteccion de datos y normativa sobre fraude informatico en funcion de la jurisdiccion.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario ni sobre su origen; la ausencia de codigo fuente impide auditar su comportamiento.
- Cero descargas y cero likes en el momento de la consulta: sin senal de comunidad ni de validacion independiente.
- Riesgo de suplantacion: el nombre del repositorio imita patrones de nombres de modelos (`vape-v4-ghost-client-unlocked-keyless`) para aparecer en busquedas de usuarios que buscan artefactos de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/vape-v4-ghost-client-unlocked-keyless
- Release referenciada en la model card (no verificar ni ejecutar): https://github.com/francescolin622/vape-v4-ghost-client-unlocked-keyless/releases/latest
- No se han encontrado papers, blogs, demos ni repositorios de codigo adicionales en la informacion disponible.
