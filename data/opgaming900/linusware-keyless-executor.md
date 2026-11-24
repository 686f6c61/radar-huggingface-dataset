# OPGAMING900/linusware-keyless-executor

## Resumen

El artefacto publicado bajo el identificador `OPGAMING900/linusware-keyless-executor` no es un modelo de inteligencia artificial. Se trata de un repositorio de Hugging Face que distribuye un supuesto ejecutor de scripts para Roblox (un "executor" orientado a la inyección de código Luau en el cliente del juego), empaquetado como binario portable para Windows 10/11 de 64 bits. No contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

La model card describe un ejecutor con funciones como adjuntar múltiples instancias, sincronización de offsets tras parches del cliente, un hub de scripts integrado y compatibilidad declarada con el 98 % de sUNC. El paquete se distribuye como archivo ZIP de 4,8 MB protegido con contraseña, que contiene un ejecutable (`schedule-1-cheat-trainer-2026-v1.2.2-win64.exe`) alojado en un repositorio de GitHub de terceros, no en Hugging Face.

Desde el punto de vista de evaluación de modelos, este repositorio carece de relevancia técnica: no hay arquitectura, parámetros, contexto, cuantizaciones ni benchmarks que analizar. La ficha se limita a documentar lo que el artefacto declara ser y a señalar los riesgos asociados a su naturaleza (binario de terceros, contraseña en la documentación, alertas de SmartScreen reconocidas por el propio autor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio; no implican capacidades lingüísticas de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni información sobre datos, tokens, etapas de preentrenamiento, ajuste supervisado o preferencias. La documentación describe un ejecutable portable para Windows x64 con funciones de inyección de scripts en el cliente de Roblox, gestión de hilos (15 worker threads declarados), sondeo a 456 Hz para sincronización de offsets y 143 Hz para el hub de scripts, y una VM Luau puente.

Los únicos datos técnicos declarados son de ingeniería de software, no de aprendizaje automático: tiempos de respuesta objetivo inferiores a 22 ms y 38 ms en dos flujos, compatibilidad sUNC superior al 98 %, y soporte de funciones como `hookmetamethod`, `getgc` y Drawing API. No hay información verificable sobre el binario, su cadena de compilación ni su procedencia.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües; las etiquetas de idioma del repositorio son metadatos de catalogación.
- El artefacto declara, como software, funciones de ejecución de scripts Luau, adjuntado a múltiples instancias del cliente, hub de presets en la nube y compatibilidad con APIs de instrumentación del entorno Roblox.

## Casos de uso

- Ninguno recomendado en el contexto de evaluación de modelos de IA: el artefacto no es un modelo y no puede emplearse en tareas de generación, clasificación, extracción o razonamiento.
- Auditoría de seguridad: un equipo puede analizar el binario en un entorno aislado para determinar qué modifica en el sistema, qué tráfico de red genera y qué permisos solicita.
- Investigación de malware y cadena de suministro: estudiar el patrón de distribución (ZIP con contraseña, enlace a GitHub de terceros, instrucciones para desactivar avisos de SmartScreen) como ejemplo de técnica de evasión.
- Formación en concienciación: usar el caso como muestra de por qué no deben ejecutarse binarios de procedencia no verificada descargados desde repositorios de modelos.
- Documentación de políticas: alimentar las reglas de moderación de una plataforma para detectar repositorios que suplantan la categoría de modelo con distribución de ejecutables.
- No se identifican casos de uso legítimos de inferencia, despliegue o integración en pipelines de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad de modelo (MMLU, HumanEval, GSM8K ni equivalentes) porque no contiene un modelo. Las únicas cifras declaradas son de latencia de software (menos de 22 ms y menos de 38 ms en dos flujos) y de compatibilidad (98 % sUNC), sin metodología de medición publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados del binario: Windows 10 u 11 de 64 bits, procesadores Intel o AMD x64, ejecución como administrador.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son relevantes para este artefacto).
- Latencia y throughput: no disponibles más allá de las cifras de respuesta declaradas por el autor, no verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que el artefacto no es un modelo de IA. Frente a ejecutores de scripts para Roblox, la comparación queda fuera del alcance de esta ficha y no se dispone de datos verificables de alternativas.

## Limitaciones y advertencias

- No es un modelo de IA pese a estar alojado en Hugging Face; no debe evaluarse ni desplegarse como tal.
- El binario se distribuye fuera de Hugging Face, en un repositorio de GitHub de terceros, con un nombre de archivo (`schedule-1-cheat-trainer-2026-v1.2.2-win64.exe`) incoherente con el identificador del repositorio.
- El archivo va protegido con contraseña (`2026`) documentada en la propia model card, un patrón habitual para dificultar el análisis automatizado por parte de antivirus y plataformas.
- El autor reconoce explícitamente que Windows Defender y SmartScreen pueden alertar y recomienda desactivar o ignorar esos avisos y ejecutar como administrador; esto incrementa el riesgo de ejecución de código malicioso.
- No hay verificación de integridad, firma de código ni trazabilidad del binario.
- La licencia MIT declarada se refiere a los metadatos del repositorio; no aclara derechos sobre el binario distribuido ni sobre el software de terceros con el que interactúa.
- El uso de ejecutores de scripts en Roblox puede infringir los términos de servicio de la plataforma y conllevar el bloqueo de cuentas.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto porque no hay modelo; cualquier evaluación en esos términos carece de sentido.
- Riesgo de suplantación: el repositorio utiliza etiquetas y estructura de model card para aparentar ser un artefacto de IA, lo que puede inducir a error en pipelines automatizados de descubrimiento de modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OPGAMING900/linusware-keyless-executor
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/francescoc822/schedule-1-cheat-trainer-2026/releases/download/v1.2.0/schedule-1-cheat-trainer-2026-v1.2.2-win64.zip
- Página de releases citada en la model card: https://github.com/AdrianVieira80315/linusware-keyless-executor/releases/latest
- Paper, blog, demo o documentación técnica adicional: no disponible.
