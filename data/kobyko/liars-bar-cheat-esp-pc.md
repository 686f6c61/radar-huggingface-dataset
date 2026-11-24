# Kobyko/liars-bar-cheat-esp-pc

## Resumen

El repositorio `Kobyko/liars-bar-cheat-esp-pc` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete de software malicioso distribuido a traves de la plataforma, cuyo contenido es un supuesto "cheat" (trampa) con ESP (extra sensory perception, vision a traves de paredes) para el videojuego *Liar's Bar*. El artefacto real es un archivo ZIP de 8,9 MB que contiene un ejecutable para Windows de 64 bits, protegido con contrasena y alojado en un repositorio de GitHub de terceros.

El paquete se presenta con tecnicas tipicas de ingenieria social: insignias falsas de descargas (216K+), valoraciones inventadas (5,0/5), instrucciones para ejecutar el binario como administrador y una contrasena de extraccion. La model card no describe ninguna arquitectura de red neuronal, parametros, contexto ni datos de entrenamiento; los campos tecnicos habituales de un modelo (pipeline, pesos, tokenizador) estan ausentes.

Desde la perspectiva de evaluacion de modelos, esta ficha documenta un artefacto no valido: no es un modelo de IA, no es reproducible, no es auditable y su ejecucion implica riesgos de seguridad. Se incluye aqui unicamente para dejar constancia tecnica de su existencia y naturaleza dentro del catalogo de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, no capacidades del artefacto) |
| Licencia | MIT (declarada en la model card) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` win64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto es un binario `liars-bar-cheat-esp-pc-v1.2.0-win64.exe` (build declarado `v3.5.7`, firma `8924DF74E1`) empaquetado en un ZIP de 8,9 MB protegido con contrasena `2026`. Segun la model card, el programa incluiria modulos de radar 2D, filtro de loot, overlay externo a 144 Hz, escaner dinamico de offsets, suavizado de entrada Bezier y una tecla de panico (`END`) para descargar el proceso.

No hay datos de entrenamiento, tokens, composicion de dataset, RLHF, DPO ni innovaciones tecnicas de aprendizaje automatica. Los "modulos" descritos son funcionalidades de un programa de trampas para un videojuego, no componentes de un sistema de IA.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; las etiquetas de idioma son metadatos de la model card.
- No dispone de modo thinking, vision, audio ni ninguna capacidad cognitiva.
- El unico comportamiento descrito es la manipulacion de memoria de un proceso de juego en Windows (ESP, radar, overlay).

## Casos de uso

- No aplica: el artefacto no es un modelo de IA y no tiene casos de uso legitimos de inferencia.
- Uso fraudulento potencial: distribucion de software no verificado a traves de un repositorio de modelos, con instrucciones para ejecutarlo como administrador.
- Riesgo de seguridad: el binario se descarga desde un repositorio de GitHub de terceros (`meijimenez425/liars-bar-cheat-esp-pc`) y requiere extraccion con contrasena, patron habitual de evasion de analisis automatizado.
- Riesgo de incumplimiento: el uso de trampas en videojuegos multijugador vulnera habitualmente los terminos de servicio de las plataformas y puede conllevar el baneo de cuentas.
- No recomendado para produccion, investigacion ni evaluacion de modelos.
- Documentacion: util unicamente como ejemplo de contenido no valido en catalogos de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (97,4% de consistencia, 332 Hz de polling, 242 Hz, 9 hilos de trabajo) son afirmaciones publicitarias del autor sin metodologia ni verificacion, no resultados de evaluacion de un modelo.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (segun la model card).
- VRAM estimada: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requiere ejecucion como administrador, lo que amplia la superficie de riesgo del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Kobyko/liars-bar-cheat-esp-pc` | no disponible (no es un modelo) | no disponible | MIT declarada | Hugging Face (artefacto ZIP) |
| Modelos de IA comparables | no disponible | no disponible | no disponible | no disponible |

No existe categoria de modelo comparable: el artefacto no es un modelo de IA, por lo que no se puede contrastar con alternativas de la misma tarea.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo elevado de malware: binario no firmado, alojado fuera de Hugging Face, con contrasena de extraccion y ejecucion como administrador.
- La licencia MIT declarada no aporta garantias sobre el contenido del ejecutable ni sobre su procedencia.
- Las metricas y valoraciones de la model card (216K+ descargas, 5,0/5) no son verificables y probablemente son inventadas.
- Riesgo legal y de terminos de servicio: el uso de trampas en juegos multijugador puede vulnerar contratos de usuario y normativa de proteccion de sistemas.
- No hay sesgos de modelo que evaluar, pero si un riesgo claro de dano al usuario final.
- No apto para produccion, investigacion ni entornos corporativos.

## Enlaces

- Hugging Face: https://huggingface.co/Kobyko/liars-bar-cheat-esp-pc
- Repositorio de releases citado en la model card: https://github.com/meijimenez425/liars-bar-cheat-esp-pc/releases/latest
- Paquete ZIP citado en la model card: https://github.com/meijimenez425/liars-bar-cheat-esp-pc/releases/latest/download/liars-bar-cheat-esp-pc-v1.2.0-win64.zip
