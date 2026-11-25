# Snapjam2641/maybeehub-scripthub-20

## Resumen

El repositorio `Snapjam2641/maybeehub-scripthub-20` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 (denominado "Maybeehub Scripthub 20", versión v4.1.7) distribuido como archivo ZIP de 4,8 MB con contraseña de extracción. La model card describe módulos de tipo "trainer" orientados al juego *Kingdom Come: Deliverance 2*, con funciones como suavizado de entrada, escáner de offsets dinámicos y capas de exclusión de captura de pantalla. No hay pesos, arquitectura, tokenizador ni pipeline de inferencia asociados.

Por tanto, no es posible evaluar el artefacto como modelo lingüístico: no existen parámetros, longitud de contexto, tipos de cuantización ni formatos de pesos. Los tags del repositorio (windows, windows-11, x64, portable) y la licencia MIT son los únicos metadatos técnicos verificables. La ficha siguiente refleja esta ausencia de datos de forma explícita, sin inferir especificaciones que no constan en la información proporcionada.

La relevancia de esta entrada es nula para el desarrollo o la investigación en IA open source. Se documenta aquí únicamente para dejar constancia de que el identificador no corresponde a un modelo y para advertir de los riesgos asociados a la ejecución de binarios de procedencia no verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto descrito en la model card es un ejecutable nativo de Windows (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, build v4.1.7, firma 3E10525A0C) empaquetado en un ZIP de 4,8 MB protegido con la contraseña "2026". Los módulos mencionados (core externo en modo usuario, suavizado de entrada Bézier a 198 Hz de sondeo, escáner de offsets dinámicos con resolución de firmas de punteros, capa de render a prueba de captura de stream, perfiles JSON intercambiables en caliente y tecla de pánico END) corresponden a técnicas de manipulación de memoria de procesos, no a componentes de un transformer, MoE o SSM.

No consta información sobre datasets, tokens de entrenamiento, RLHF, DPO ni ninguna innovación en decodificación o atención. Cualquier afirmación sobre arquitectura o entrenamiento sería una invención y, por tanto, se omite.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe real; los códigos de idioma del repositorio son metadatos de etiquetado, no una indicación de competencia lingüística del artefacto.
- Las funciones descritas en la model card son de manipulación de un proceso de juego en Windows (suavizado de entrada, escaneo de offsets, exclusión de captura), no capacidades de un modelo.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no admite casos de uso de inferencia, generación o análisis.
- No se recomienda su ejecución en entornos de desarrollo, investigación o producción, dado que se trata de un binario de procedencia no verificada que requiere permisos de administrador y cuya finalidad declarada es la modificación de un proceso de juego.
- Cualquier escenario de uso legítimo (por ejemplo, automatización de tareas o asistencia al desarrollo) queda fuera del alcance de lo que este repositorio ofrece.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, porque el artefacto no es un modelo lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos ni inferencia).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del artefacto según la model card: Windows de 64 bits, extracción del ZIP con contraseña "2026" y ejecución como administrador. Se mencionan consumos de memoria del orden de 19 MB y 46 MB en módulos concretos, pero no son datos verificables ni relevantes para despliegue de IA.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Compararlo con modelos lingüísticos (por tamaño, contexto o licencia) carecería de sentido técnico.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal es un error de clasificación.
- El artefacto es un ejecutable de Windows distribuido con contraseña y sin firma de código verificable en la información disponible; su ejecución con privilegios de administrador implica un riesgo de seguridad elevado.
- La model card incluye enlaces de descarga que apuntan a repositorios de GitHub de terceros, no al propio repositorio de Hugging Face, lo que dificulta la trazabilidad del binario.
- La finalidad declarada (modificación de un proceso de juego) puede vulnerar los términos de servicio del juego y la legislación aplicable en materia de software.
- La licencia MIT declarada se refiere al repositorio, pero no garantiza la legalidad ni la seguridad del binario distribuido.
- No hay evidencia de auditoría, reproducibilidad ni mantenimiento; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- No debe utilizarse como sustituto de un modelo lingüístico en ningún pipeline de producción.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Snapjam2641/maybeehub-scripthub-20
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub de terceros): https://github.com/QanutuYom38/maybeehub-scripthub-20/releases/latest
