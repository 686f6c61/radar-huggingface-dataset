# Marselox/schedule-i-mod-menu-download

## Resumen

`Marselox/schedule-i-mod-menu-download` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es, según la propia model card del autor, un paquete ejecutable para Windows de 64 bits distribuido como `schedule-i-mod-menu-download-v1.2.0-win64.zip` (8,9 MB, contraseña `2026`), que el autor describe como un "game cheat" para el videojuego *Schedule I*. El repositorio no contiene pesos, tokenizadores, configuraciones de arquitectura ni artefactos propios de un modelo de lenguaje.

La ficha se ha elaborado a partir de los metadatos disponibles en Hugging Face (0 descargas, 0 likes, licencia MIT, 14 etiquetas de idioma) y del texto de la model card. Cabe señalar que la model card mezcla identificadores: el ID de Hugging Face es `Marselox/schedule-i-mod-menu-download`, pero los enlaces de descarga apuntan a un repositorio de GitHub distinto (`HozefiTaqo37/schedule-i-mod-menu-download`), lo que constituye una inconsistencia relevante.

Dado que no existe información sobre arquitectura, parámetros, contexto ni entrenamiento, la mayoría de los campos técnicos de esta ficha se marcan como "no disponible". Se documenta el contenido tal como aparece en la información proporcionada, sin inferir capacidades de modelo que no existen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete ejecutable para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni artefactos de aprendizaje automático. La model card describe componentes de un ejecutable de Windows: un "core externo en modo usuario" con renderizado mediante Desktop Duplication, un escáner dinámico de offsets con 10 hilos de trabajo, un filtro de loot con radar 2D con 6 hilos, suavizado de entrada Bézier, una capa de renderizado "stream-proof" y perfiles JSON intercambiables en caliente con sondeo a 385 Hz. Estos datos provienen exclusivamente del texto del autor y no han sido verificados.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación de modelado, porque no existe proceso de entrenamiento asociado.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Las etiquetas multilingües (14 idiomas) corresponden a metadatos del repositorio, no a capacidades lingüísticas verificadas.
- Según la model card, el ejecutable incluye módulos descritos como radar 2D, filtro de loot, suavizado de entrada, escáner de offsets y perfiles intercambiables; estas afirmaciones proceden del autor y no están verificadas.

## Casos de uso

- No procede. Al no ser un modelo de IA, no tiene aplicaciones legítimas de generación de texto, código, visión, atención al cliente, análisis de datos ni ninguna de las tareas típicas de un modelo.
- El artefacto descrito es un ejecutable de terceros presentado como mod/cheat para un videojuego; su uso concreto queda fuera del ámbito de esta ficha y conlleva los riesgos indicados en la sección de limitaciones.
- Cualquier escenario de uso productivo o de investigación con modelos de lenguaje es inaplicable a este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica en el sentido de VRAM o GPU: el artefacto descrito es un ejecutable para Windows 10/11 de 64 bits.
- La model card menciona un consumo de RAM inferior a 42 MB y un tiempo de respuesta inferior a 29 ms, datos aportados por el autor y no verificados.
- No se especifican GPU recomendadas, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni latencia o throughput de inferencia, porque no existe inferencia de modelo.
- El paquete se distribuye como ZIP de 8,9 MB con contraseña `2026`.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque este repositorio no contiene un modelo. Compararlo con modelos de lenguaje sería inapropiado.

## Limitaciones y advertencias

- Inconsistencia de identificadores: el repositorio de Hugging Face (`Marselox/schedule-i-mod-menu-download`) enlaza descargas a un repositorio de GitHub diferente (`HozefiTaqo37/schedule-i-mod-menu-download`), lo que impide verificar la procedencia del binario.
- Ejecutable de terceros: la distribución de un `.exe` con contraseña de extracción y instrucciones para ejecutarlo como administrador es un patrón de riesgo; no hay garantía sobre el contenido real del binario.
- La propia model card reconoce que Windows Defender o SmartScreen pueden alertar sobre el ejecutable y recomienda desactivar o ignorar esas comprobaciones, lo que aumenta el riesgo de seguridad.
- Uso como "game cheat": puede infringir los términos de servicio del videojuego y acarrear bloqueos de cuenta; además, la ingeniería de offsets y hooks puede comprometer la integridad del sistema.
- Licencia MIT declarada, pero aplicada a un artefacto cuya naturaleza real no está verificada; la licencia no cubre responsabilidades derivadas del uso del binario.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia comunitaria de funcionamiento ni de seguridad.
- No hay sesgos, alucinaciones ni limitaciones de contexto que evaluar, porque no hay modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/schedule-i-mod-menu-download
- Repositorio de GitHub referenciado en la model card: https://github.com/HozefiTaqo37/schedule-i-mod-menu-download
- Release referenciada en la model card: https://github.com/HozefiTaqo37/schedule-i-mod-menu-download/releases/latest
- Paquete directo referenciado en la model card: https://github.com/HozefiTaqo37/schedule-i-mod-menu-download/releases/latest/download/schedule-i-mod-menu-download-v1.2.0-win64.zip
