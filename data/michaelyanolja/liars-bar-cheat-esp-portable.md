# MichaelYanolja/liars-bar-cheat-esp-portable

## Resumen

`MichaelYanolja/liars-bar-cheat-esp-portable` no es un modelo de IA: es un repositorio alojado en Hugging Face cuyo contenido es un supuesto ejecutable portable para Windows x64 etiquetado como "cheat ESP" (overlay de wallhack/ESP) para el juego *Liar's Bar*. La model card no describe ninguna arquitectura neuronal, pesos, tokenizador ni pipeline de inferencia; el campo `pipeline` figura como no disponible y las descargas y "likes" son cero en el momento de la consulta.

El artefacto promocionado es un ZIP de 8,9 MB (`liars-bar-cheat-esp-portable-v1.2.0-win64.zip`) protegido con contraseña, distribuido mediante enlaces a un repositorio de GitHub de terceros (`XuzilaVa72/liars-bar-cheat-esp-portable`) y no mediante los mecanismos habituales de Hugging Face. La model card incluye badges con cifras de descargas y valoraciones que no se corresponden con las métricas reales del repositorio.

Desde el punto de vista de un desarrollador o investigador, este repositorio no tiene utilidad como modelo: no hay nada que evaluar, desplegar ni integrar. Su relevancia práctica es la de un caso de abuso de la plataforma Hugging Face para distribuir binarios opacos con instrucciones de ejecución como administrador, lo que constituye un riesgo de seguridad evidente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no implica capacidad lingüística de un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto promocionado es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe funcionalidades propias de un software de trampas para videojuegos: radar 2D con filtro de loot, overlay externo a 144 Hz con cajas delimitadoras 2D/3D y esqueletos de huesos, escáner dinámico de offsets con resolución automática de firmas de punteros tras parches, suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad, y una capa de render "stream-proof" que afirma excluir la captura en OBS, ShadowPlay y Discord.

Ninguna de esas afirmaciones es verificable desde el repositorio: no hay código fuente, hashes publicados, firmas ni artefactos auditables en Hugging Face. Las cifras que aparecen en la model card (polling a 329 Hz, 99,3 % de consistencia, 96,7 % de consistencia del escáner, 12 hilos de trabajo, menos de 59 MB y menos de 22 MB de RAM) son afirmaciones del autor sin respaldo técnico. El patrón descrito —ZIP con contraseña, ejecutable "portable", instrucciones de "Run as Administrator", avisos sobre falsos positivos de Windows Defender y SmartScreen— coincide con la distribución habitual de malware empaquetado o de droppers en repositorios de terceros.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo; los códigos de idioma de los metadatos son etiquetas del repositorio.
- El artefacto promocionado afirma ofrecer overlay ESP, radar 2D, filtro de loot, escáner de offsets y suavizado de puntería para el juego *Liar's Bar*; todas estas capacidades son no verificadas.
- No hay demo, API, endpoint de inferencia ni pesos publicados.

## Casos de uso

- Ninguno como modelo de IA. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia, por lo que no puede integrarse en ninguna aplicación de procesamiento de lenguaje, visión o generación.
- Auditoría de seguridad: un equipo de seguridad puede usar este repositorio como ejemplo documentado de patrón de abuso de Hugging Face para distribuir binarios opacos, y emplearlo en formación sobre ingeniería social y cadenas de suministro.
- Investigación de malware: el ZIP y el ejecutable promocionados son candidatos a análisis en un entorno aislado (sandbox, máquina virtual sin red) para determinar su comportamiento real.
- Elaboración de reglas de detección: los indicadores de la model card (nombre de archivo, contraseña de archivo `2026`, petición de privilegios de administrador, avisos de Defender) pueden alimentar firmas y políticas de bloqueo en proxies y filtros de correo.
- Documentación de políticas de plataforma: sirve como referencia para justificar la retirada de repositorios que no contienen artefactos de IA y que enlazan a descargas externas.
- Formación de usuarios: caso práctico para explicar por qué no debe ejecutarse como administrador un binario descargado de un repositorio sin reputación, descargas ni verificación de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos, porque el repositorio no contiene un modelo. Las cifras de rendimiento que aparecen en la model card (329 Hz de polling, 99,3 % y 96,7 % de consistencia, 144 Hz de overlay) son afirmaciones del autor sin metodología, sin conjunto de prueba y sin verificación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; ninguna de estas herramientas puede cargar este repositorio.
- Requisitos del artefacto promocionado según el autor: Windows de 64 bits (Intel o AMD x64), ejecución como administrador, 8,9 MB de espacio en disco para el ZIP y menos de 59 MB de RAM en ejecución. Estas cifras son declaraciones del autor y no están verificadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque este repositorio no es un modelo de IA. Frente a repositorios legítimos de modelos abiertos (por ejemplo, pesos en safetensors con model card técnica, licencia clara y métricas publicadas), este repositorio carece de todos los elementos que permiten una comparación: no hay parámetros, contexto, benchmarks ni artefactos de inferencia.

| Criterio | Este repositorio | Modelo abierto típico en Hugging Face |
|---|---|---|
| Contenido | Enlace a ZIP/EXE de terceros | Pesos en safetensors/GGUF |
| Arquitectura documentada | No | Sí |
| Benchmarks publicados | No | Habitualmente sí |
| Descargas y likes | 0 y 0 | Métricas reales de la plataforma |
| Auditabilidad | Nula (binario opaco con contraseña) | Alta (pesos y configuración verificables) |
| Riesgo de seguridad | Alto | Bajo o nulo por diseño |

## Limitaciones y advertencias

- No es un modelo de IA: no debe tratarse como tal en catálogos, comparativas ni pipelines de evaluación.
- Riesgo de seguridad alto: la model card pide descargar un ZIP protegido con contraseña, extraerlo y ejecutar un `.exe` como administrador. Ese patrón es habitual en la distribución de malware, droppers e infostealers.
- Los enlaces apuntan a un repositorio de GitHub de terceros (`XuzilaVa72/liars-bar-cheat-esp-portable`) ajeno a Hugging Face; la integridad del binario no está garantizada por ninguna firma ni hash publicado.
- Los avisos sobre falsos positivos de Windows Defender y SmartScreen en la propia model card son una señal de alarma, no una garantía de legitimidad.
- Las métricas de descargas (432K+), valoración (99 % verificado) y tamaño de build que aparecen en los badges no coinciden con las métricas reales del repositorio (0 descargas, 0 likes) y deben considerarse no fiables.
- Uso del artefacto promocionado en un videojuego: puede infringir los términos de servicio de *Liar's Bar* y de la plataforma correspondiente, con riesgo de suspensión de cuenta.
- La licencia MIT declarada en los metadatos no aporta ninguna garantía sobre el binario distribuido externamente ni sobre su legalidad en el contexto de uso.
- No debe ejecutarse en un equipo de producción ni en una máquina con credenciales; cualquier análisis debe hacerse en un entorno aislado y sin red.
- No hay soporte, mantenimiento ni comunidad: cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MichaelYanolja/liars-bar-cheat-esp-portable
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/XuzilaVa72/liars-bar-cheat-esp-portable
- Página de releases referenciada (no verificada): https://github.com/XuzilaVa72/liars-bar-cheat-esp-portable/releases/latest
- Descarga directa referenciada en la model card (no verificada; no recomendada): https://github.com/XuzilaVa72/liars-bar-cheat-esp-portable/releases/latest/download/liars-bar-cheat-esp-portable-v1.2.0-win64.zip
