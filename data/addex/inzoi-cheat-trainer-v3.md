# Addex/inzoi-cheat-trainer-v3

## Resumen

El repositorio `Addex/inzoi-cheat-trainer-v3` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un artefacto de tipo "cheat trainer" para el videojuego InZOI, distribuido como binario portable para Windows 10 (22H2) y Windows 11 (24H2). La model card describe un ejecutable (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`, build `v4.6.6`) empaquetado en un ZIP de 4,8 MB protegido con contraseña, con funcionalidades propias de herramientas de trampas: radar 2D, overlay externo, filtrado de loot, suavizado de entrada Bézier y teclas de pánico.

No existe ninguna arquitectura de red neuronal asociada: no hay pesos, no hay tokenizador, no hay pipeline de inferencia y el repositorio no declara parámetros, contexto ni cuantizaciones. Los tags de Hugging Face (`windows`, `x64`, `portable`) y los idiomas listados (14 códigos ISO) corresponden a los metadatos de la distribución del ejecutable, no a capacidades lingüísticas de un modelo.

La relevancia de esta ficha es, por tanto, negativa: sirve para documentar que el identificador referenciado no es un modelo de IA y advertir de los riesgos asociados a la distribución de binarios de este tipo (contraseñas en archivos comprimidos, enlaces a repositorios de terceros y contenido no verificado). Cualquier evaluación como modelo de lenguaje, visión o agente carece de sentido con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible como modelo; la model card lista en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id como metadatos de distribucion |
| Licencia | MIT |
| Formato de pesos | no disponible; el artefacto es un ZIP con un `.exe` (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip`, 4,8 MB) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo ni proceso de entrenamiento. La model card describe un programa externo en modo usuario ("user-mode external core") que, según el autor, utiliza Desktop Duplication para renderizar un overlay sin inyección de DLL, con sondeo declarado a 289 Hz y 400 Hz según el módulo, 9 hilos de trabajo y un mecanismo de descarga por tecla de pánico (`END`) con tiempo de respuesta declarado inferior a 22 ms. Estos datos son afirmaciones del autor en la model card y no han sido verificados de forma independiente.

No se documenta ningún conjunto de datos, número de tokens, proceso de RLHF/DPO ni innovación en el ámbito del aprendizaje automático. El repositorio no incluye información sobre compilación reproducible, cadena de suministro del binario ni auditoría del ejecutable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve problemas matemáticos ni escribe código.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües como modelo; los códigos de idioma son metadatos de la ficha.
- Las únicas funciones descritas son propias de un trainer de videojuego: radar 2D, filtro de loot, overlay externo con cajas delimitadoras y esqueletos, suavizado de entrada Bézier, perfiles JSON intercambiables en caliente y tecla de pánico.
- No dispone de modo "thinking", visión, audio ni ninguna capacidad propia de un modelo fundacional.

## Casos de uso

- No aplica: al no ser un modelo de IA, no existen casos de uso legítimos de inferencia, generación o razonamiento.
- Documentación de artefactos no-modelo en Hugging Face: útil para catalogar identificadores que, pese a aparecer bajo el dominio de modelos, contienen binarios de otro tipo y deben excluirse de pipelines de evaluación.
- Auditoría de seguridad interna: permite ejemplificar patrones de riesgo (ZIP con contraseña embebida en la ficha, enlaces a repositorios de GitHub de terceros, ejecutable que requiere permisos de administrador) para formar a equipos en revisión de dependencias.
- Filtrado en buscadores de modelos: sirve como caso de prueba para clasificadores que detecten contenido no relacionado con IA en catálogos de modelos.
- Análisis de metadatos: los tags y la estructura de la model card pueden usarse para estudiar cómo se etiqueta contenido ajeno a IA en plataformas de modelos.
- Formación en licencias: el contraste entre una licencia MIT declarada y la naturaleza del binario es un ejemplo didáctico de por qué la licencia por sí sola no garantiza idoneidad técnica ni legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación de modelos. Los únicos números presentes (289 Hz, 400 Hz, 9 hilos, < 22 ms, 144 Hz+) son afirmaciones del autor sobre el comportamiento del ejecutable y no constituyen benchmarks reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), 64 bits.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un `.exe` portable que, según la ficha, debe ejecutarse como administrador.
- Latencia y throughput: no disponibles como métricas de modelo; las cifras de sondeo y respuesta son declaraciones del autor no verificadas.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Compararlo con LLM, modelos de visión o agentes sería metodológicamente incorrecto.

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en evaluaciones de rendimiento, benchmarks ni comparativas de modelos.
- La model card contiene enlaces de descarga a repositorios de GitHub de terceros y una contraseña de descompresión (`2026`) embebida; este patrón es habitual en distribuciones de malware y requiere precaución extrema.
- El binario se presenta como ejecutable portable que debe lanzarse como administrador, lo que amplía la superficie de riesgo en el sistema anfitrión.
- La licencia MIT declarada no implica que el contenido sea seguro, legal en todas las jurisdicciones ni compatible con los términos de servicio del videojuego al que hace referencia.
- No hay verificación independiente de las capacidades declaradas (radar, overlay, suavizado Bézier, tiempos de respuesta).
- No hay información sobre sesgos, alucinación o limitaciones de contexto e idioma porque no aplica a un modelo de lenguaje.
- Uso comercial: la licencia MIT permitiría teóricamente la redistribución, pero la naturaleza del artefacto y su relación con un videojuego comercial hacen aconsejable una revisión legal específica antes de cualquier uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que impide cualquier validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addex/inzoi-cheat-trainer-v3
- Repositorio de GitHub referenciado en la model card: https://github.com/kprice417/inzoi-cheat-trainer-v3
- Repositorio de GitHub referenciado para la descarga: https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026
- Enlace de descarga citado en la model card: https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Paper, blog o demo: no disponibles.
