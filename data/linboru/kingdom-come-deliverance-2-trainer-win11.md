# Linboru/kingdom-come-deliverance-2-trainer-win11

## Resumen

El repositorio `Linboru/kingdom-come-deliverance-2-trainer-win11` no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows etiquetado como "trainer" del videojuego *Kingdom Come: Deliverance 2*, distribuido a través de Hugging Face bajo una licencia MIT declarada. La model card describe utilidades de tipo overlay externo, ESP de cajas delimitadoras, radar 2D, filtro de botín y perfiles JSON intercambiables en caliente, junto con instrucciones de descarga de un archivo `.zip` alojado en GitHub.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni datos de entrenamiento. Los tags de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) corresponden a la localización del ejecutable, no a capacidades lingüísticas de un modelo. El pipeline no está definido y el repositorio registra cero descargas y cero likes en el momento de la consulta.

Esta ficha se redacta por completitud estructural, pero debe interpretarse como una advertencia: el artefacto no es un modelo de lenguaje y no debe evaluarse como tal. Además, la model card incluye enlaces de descarga a binarios ejecutables de terceros con contraseña de archivo, un patrón habitual en campañas de distribución de software potencialmente no deseado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; paquete de software para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (localización del ejecutable) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (distribución en `.zip` con `.exe` para Windows) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es una red neuronal ni un modelo entrenado. La model card describe un "user-mode external core" con overlay externo a 144 Hz, sondeo a 229 Hz, suavizado de entrada Bézier, radar 2D con filtro de botín por rareza, tecla de pánico (`END`) para descarga determinista y perfiles JSON intercambiables en caliente sobre 6 hilos de trabajo. Estas descripciones corresponden a técnicas de manipulación de memoria y renderizado de un proceso de juego en Windows, no a componentes de aprendizaje automático.

No se documentan conjuntos de datos, tokens de entrenamiento, fases de RLHF/DPO ni innovaciones en atención o decodificación. El binario citado (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`, build `v4.5.3`/`D48E51`, 4,8 MB) se distribuye comprimido con contraseña `2026` y se enlaza a un repositorio de GitHub de terceros (`YokoCastro3813/fisch-script-auto-catch-macro-2026`), no al propio repositorio de Hugging Face.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No dispone de tool calling ni function calling en el sentido de integración con APIs de modelos.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de comprensión o generación; los idiomas listados son etiquetas de localización del paquete.
- Las funciones descritas son de modificación de un proceso de juego: overlay externo, ESP de cajas y esqueletos, radar 2D, filtro de botín, perfiles de configuración y descarga por tecla de pánico.

## Casos de uso

- No procede. El artefacto no es un modelo de IA y no tiene aplicaciones en generación de texto, atención al cliente, generación de código, análisis documental, RAG ni pipelines de agentes.
- El único uso descrito por el autor es la ejecución de un trainer sobre el videojuego *Kingdom Come: Deliverance 2* en Windows 10/11 de 64 bits, con extracción previa del `.zip` mediante contraseña y ejecución como administrador.
- Cualquier evaluación como modelo de lenguaje, comparación con LLM o despliegue en infraestructura de inferencia (vLLM, TGI, llama.cpp, Ollama) carece de sentido técnico para este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, porque el artefacto no es un modelo evaluable en esos términos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de red neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo requerido según el autor: Windows 10 u 11 de 64 bits (x64).
- Opciones de despliegue: ejecución directa del `.exe` en Windows; no es compatible con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles; el autor menciona cifras de overlay (144 Hz, sondeo a 229 Hz, respuesta < 34 ms, < 32-33 MB de RAM) sin metodología verificable.

## Comparativa con modelos similares

| Criterio | Este artefacto | Modelo de lenguaje típico (referencia genérica) |
|---|---|---|
| Naturaleza | Paquete de software para Windows (trainer de juego) | Red neuronal entrenada |
| Parámetros | no disponible | Depende del modelo |
| Contexto | no disponible | Depende del modelo |
| Benchmarks de IA | no disponible | MMLU, HumanEval, GSM8K, etc. |
| Licencia | MIT (declarada) | Variable |
| Despliegue | `.exe` en Windows x64 | vLLM, TGI, llama.cpp, Ollama |

No se identifican modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. Cualquier comparación con LLM, modelos de visión o modelos de audio sería categorialmente incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como modelo en catálogos, comparativas ni evaluaciones de benchmarks.
- La model card incluye enlaces de descarga a binarios ejecutables alojados en un repositorio de GitHub de terceros, con contraseña de archivo (`2026`) y ejecución como administrador; este patrón es habitual en distribución de software potencialmente no deseado o malicioso.
- La discrepancia entre el nombre del repositorio (`kingdom-come-deliverance-2-trainer-win11`) y el nombre del binario (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`) es una señal de alarma sobre la procedencia y la integridad del contenido.
- Uso de trainers en videojuegos: puede violar los términos de servicio del juego y conllevar sanciones en modos multijugador o anticheat.
- Licencia MIT declarada, pero sin verificación de que el autor tenga derechos sobre todos los componentes distribuidos; el uso comercial no está documentado más allá de la propia licencia.
- Riesgo de seguridad: ejecutar binarios de origen no verificado como administrador expone el sistema a compromiso total.
- Cero descargas y cero likes en el momento de la consulta; sin comunidad ni validación independiente.
- No hay información sobre sesgos, alucinación ni limitaciones de contexto porque no aplican a un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Linboru/kingdom-come-deliverance-2-trainer-win11
- Repositorio de GitHub citado en la model card (descarga del binario): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Página de releases citada: https://github.com/denisevandenberg110/kingdom-come-deliverance-2-trainer-win11/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
