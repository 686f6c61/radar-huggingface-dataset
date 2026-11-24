# rxrejected/inzoi-cheat-trainer-download

## Resumen

`rxrejected/inzoi-cheat-trainer-download` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es un supuesto "cheat trainer" (herramienta de trampas) para el videojuego InZOI, empaquetado como un archivo ZIP para Windows x64. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

El contenido de la model card es material promocional de un binario ejecutable distribuido mediante un enlace externo a GitHub Releases, con instrucciones para descomprimir un ZIP protegido con contraseña (`2026`) y ejecutar un `.exe` como administrador. La metadata declara licencia MIT y una lista de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) que corresponde a la localización del material promocional, no a capacidades lingüísticas de un modelo.

Por tanto, esta ficha no puede documentar arquitectura, entrenamiento, capacidades ni benchmarks, porque no existe ningún modelo subyacente. Se advierte de que el patrón observado (repositorio señuelo en Hugging Face, enlace a binario externo, ZIP con contraseña, instrucciones para desactivar avisos de SmartScreen y ejecutar como administrador) es característico de campañas de distribución de malware. No se debe descargar ni ejecutar el contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los idiomas listados corresponden al material promocional, no a un modelo) |
| Licencia | MIT (declarada en la metadata del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El artefacto descrito en la model card es `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip` (4,8 MB), que contiene un binario `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` etiquetado como build `v3.9.3 (D187AE)`. La model card menciona componentes propios de una herramienta de trampas para videojuegos (escáner de offsets, overlay externo a 144 Hz, ESP con cajas delimitadoras y esqueletos, panic key `END`, capa de render excluida de capturas de OBS/ShadowPlay), ninguno de los cuales constituye un modelo de aprendizaje automático.

La discrepancia entre el nombre del repositorio (InZOI) y el nombre del binario (Kingdom Come: Deliverance 2) es una señal adicional de contenido reempaquetado o fraudulento. No se dispone de información sobre datos de entrenamiento, tokens procesados, composición del dataset ni técnicas de alineación (RLHF, DPO) porque no aplica.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo; la lista de idiomas de la metadata describe la localización del material promocional.
- No dispone de modo "thinking", visión, audio ni ninguna modalidad de entrada/salida propia de un modelo.
- El único "contenido" técnico declarado es un ejecutable de terceros para Windows con funciones de manipulación de memoria de un videojuego.

## Casos de uso

- Ninguno legítimo en el ámbito de IA, desarrollo de software o investigación.
- No es adecuado para generación de texto, asistentes conversacionales, análisis de documentos, traducción automática ni ninguna tarea de procesamiento de lenguaje natural.
- No es adecuado para integración en pipelines de CI/CD, RAG, agentes autónomos ni sistemas de recomendación.
- No es adecuado para fine-tuning ni como base para modelos derivados.
- No es adecuado para evaluación comparativa de modelos.
- Su uso previsto declarado (trampas en un videojuego) infringe habitualmente los términos de servicio de las plataformas de juego y puede conllevar el bloqueo de cuentas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos, porque el repositorio no contiene un modelo evaluable.

## Requisitos de hardware

- VRAM para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica.
- Requisito real declarado por el autor: sistema Windows 10 u 11 de 64 bits, ejecución del `.exe` como administrador y extracción previa de un ZIP con contraseña.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que el repositorio no aloja un modelo de IA. Cualquier comparación con modelos de lenguaje, de visión o multimodales sería improcedente.

## Limitaciones y advertencias

- No es un modelo de IA: no debe tratarse como tal en catálogos, evaluaciones ni pipelines.
- Riesgo de seguridad elevado: el patrón (repositorio señuelo, enlace a binario externo, ZIP con contraseña, instrucciones para desactivar SmartScreen y ejecutar como administrador) coincide con tácticas habituales de distribución de malware.
- Inconsistencia de nombres: el repositorio referencia InZOI mientras el binario se denomina Kingdom Come: Deliverance 2, lo que sugiere reempaquetado o suplantación.
- Cero descargas y cero likes en el momento de la consulta, sin historial ni reputación del autor.
- Fecha de creación y actualización (2026-11-24) posterior a la fecha actual en muchos contextos de consulta, lo que constituye otra anomalía de metadata.
- La licencia MIT declarada no otorga ninguna garantía sobre el binario distribuido externamente ni sobre su legalidad o seguridad.
- Uso comercial: desaconsejado por completo; además, la distribución de herramientas de trampa para videojuegos puede vulnerar términos de servicio y normativa de protección de software en algunas jurisdicciones.
- No debe ejecutarse en entornos de producción, máquinas de desarrollo ni equipos con credenciales almacenadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rxrejected/inzoi-cheat-trainer-download
- Enlace de descarga citado en la model card (GitHub Releases, no verificado y desaconsejado): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Página de releases citada en la model card: https://github.com/Wisniewski2110/inzoi-cheat-trainer-download/releases/latest
