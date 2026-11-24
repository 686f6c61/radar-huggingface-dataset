# Scliper/schedule-i-mod-menu-unlocked

## Resumen

`Scliper/schedule-i-mod-menu-unlocked` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face que distribuye un supuesto menú de trucos (cheat/mod menu) para el videojuego *Schedule I*, empaquetado como un ejecutable portable para Windows 10 y 11 de 64 bits. El autor lo publica bajo licencia MIT y lo etiqueta con lenguajes y plataformas, pero el contenido es un binario de terceros, no pesos de un modelo entrenado.

La model card describe módulos de superposición externa, radar 2D, filtro de botín, suavizado de entrada Bézier y escaneo dinámico de offsets, además de un archivo ZIP protegido con contraseña. No se proporciona información sobre arquitectura neuronal, parámetros, contexto, dataset de entrenamiento ni benchmarks. Por tanto, esta ficha no puede evaluar capacidades de IA, sino únicamente documentar lo que el repositorio declara.

Es relevante ahora como advertencia: los repositorios de este tipo suelen aparecer en plataformas de modelos y pueden confundirse con artefactos legítimos. Cualquier evaluación técnica debe limitarse a señalar la ausencia de datos verificables y los riesgos asociados a la ejecución de binarios opacos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del autor) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un ejecutable `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio distribuye un archivo `rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip` de 4,8 MB, protegido con la contraseña `2026`, que contiene un ejecutable `rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe` identificado como build `v3.0.8 (542984)`. La model card menciona un núcleo externo en modo usuario, renderizado mediante Desktop Duplication, escaneo dinámico de offsets y suavizado de entrada, pero no aporta especificaciones verificables ni código fuente.

No se indica número de tokens, composición de dataset, RLHF, DPO ni ninguna innovación técnica de aprendizaje automático. La etiqueta `pipeline` está vacía y no hay tarjetas de modelo con métricas. Cualquier afirmación sobre rendimiento (por ejemplo, 443 Hz de sondeo o 99,6 % de consistencia) procede exclusivamente del texto promocional del autor y no es verificable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas se refieren a etiquetas de idioma del repositorio, no a competencia lingüística de un modelo.
- El binario declara funciones de superposición externa, radar 2D, filtro de botín, cajas 2D/3D, esqueletos de huesos y suavizado de entrada, orientadas a un videojuego concreto.
- No hay modo de pensamiento, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Documentación de repositorios atípicos: usar esta ficha para identificar que un artefacto etiquetado como modelo no contiene pesos ni pipeline de IA, y evitar incluirlo en catálogos de modelos.
- Auditoría de seguridad: analizar el ZIP y el ejecutable en un entorno aislado para comprobar qué modifican, qué permisos solicitan y si coinciden con lo declarado en la model card.
- Formación en higiene de dependencias: emplear el caso como ejemplo de por qué no deben ejecutarse binarios opacos descargados de plataformas de modelos.
- Gestión de riesgos de licencia: revisar que la licencia MIT declarada no cubre el contenido de terceros ni exime de responsabilidades por modificación de software de juego.
- Investigación sobre contaminación de repositorios: estudiar patrones de repositorios que mezclan etiquetas de modelos con software de trucos para mejorar filtros de moderación.
- Respuesta a incidentes: si un equipo ha descargado el paquete, disponer de una referencia de sus nombres de archivo, contraseña y build para localizarlo y retirarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación de modelos de lenguaje, porque el artefacto no es un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica; el autor declara ejecución nativa en Windows 10 (22H2) y Windows 11 (24H2) sobre procesadores Intel y AMD x64.
- Cabe en cualquier PC con Windows x64; el paquete ocupa 4,8 MB y el autor afirma un uso de memoria inferior a 33 MB para el renderizado.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; se distribuye como ejecutable portable.
- Latencia y throughput: el autor declara sondeo a 443 Hz y respuestas inferiores a 35-37 ms, pero son cifras no verificables.

## Comparativa con modelos similares

No disponible. No se conocen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Tampoco se dispone de comparación fiable con otros menús de trucos para el mismo juego.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como LLM ni incluirse en comparativas de modelos.
- El binario se distribuye comprimido con contraseña y sin código fuente, lo que impide auditar su comportamiento.
- Riesgo elevado de malware: los ejecutables de trucos descargados de repositorios no verificados suelen ser vectores de troyanos, mineros o stealers; la propia model card menciona alertas de Windows Defender y SmartScreen.
- La licencia MIT declarada no garantiza la legalidad ni la seguridad del contenido; modificar un videojuego puede infringir sus términos de servicio.
- Las capacidades y métricas citadas (Hz, ms, porcentajes) proceden del texto promocional y no están respaldadas por pruebas independientes.
- Las etiquetas de idioma no implican soporte lingüístico real del binario.
- Uso comercial: no procede; además, la modificación de juegos puede conllevar restricciones contractuales ajenas a la licencia del repositorio.
- No debe ejecutarse en máquinas de producción ni con privilegios de administrador sin aislamiento previo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Scliper/schedule-i-mod-menu-unlocked
- Releases del autor en GitHub (según la model card): https://github.com/christiancosta335/schedule-i-mod-menu-unlocked/releases/latest
- Paquete directo citado en la model card: https://github.com/Shuji50/rob-run-cheat-mod-menu-pc/releases/download/v1.2.0/rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip
- No se han encontrado papers, blogs técnicos ni demos adicionales en la información proporcionada.
