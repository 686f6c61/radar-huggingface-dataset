# 7son/delta-executor-pc-v3

## Resumen

`7son/delta-executor-pc-v3` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Pese a aparecer en la plataforma con etiquetas propias de un modelo (idiomas, licencia MIT, región), la model card describe en realidad un ejecutor de scripts para Roblox distribuido como binario portable para Windows 10/11 x64, empaquetado en un ZIP de 4,8 MB protegido con contraseña. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

El artefacto se presenta como "Delta Executor PC V3" (build `v4.6.5`, `046B1D`) e incluye instrucciones para descargar un ejecutable desde enlaces de GitHub, extraerlo con la contraseña `2026` y ejecutarlo como administrador. La model card emplea terminología de fichas de modelos (idiomas soportados, compatibilidad, benchmarks de rendimiento en RAM y latencia) para describir lo que en la práctica es software de ejecución de scripts Luau sobre clientes de Roblox.

Desde la perspectiva de evaluación de modelos, esta ficha debe interpretarse como una **advertencia**: el repositorio no es evaluable como modelo y su contenido encaja con patrones habituales de distribución de software potencialmente no deseado (ejecutables sin firma, contraseñas en archivos comprimidos, avisos explícitos sobre alertas de Windows Defender y SmartScreen). No se recomienda su descarga ni ejecución en entornos de desarrollo o investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutor de scripts para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, no verificables como capacidades del artefacto) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La model card describe un binario Windows (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`) que, según el autor, realiza "adjunción instantánea al cliente" de Roblox mediante un puente de máquina virtual Luau, gestión de scripts en la nube, adjunción multi-instancia con 16 hilos de trabajo y compatibilidad declarada del 98 % con la suite sUNC (incluyendo `hookmetamethod`, `getgc` y Drawing API). También menciona un editor integrado tipo Monaco.

No se aportan datos sobre conjuntos de entrenamiento, tokens procesados, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia. Las cifras que aparecen en la model card (consumo de RAM inferior a 41 MB, 30 MB, 31 MB; tiempos de respuesta inferiores a 7 ms) son métricas de rendimiento del ejecutable, no de un modelo. No hay información verificable sobre el origen del binario, su cadena de compilación ni su código fuente.

## Capacidades

- No aplica: el repositorio no contiene un modelo de lenguaje, visión, audio ni multimodal.
- No hay soporte de generación de texto, razonamiento, código o matemáticas en el sentido de un modelo de IA.
- No hay tool calling ni function calling documentado como capacidad de modelo.
- No hay soporte de agentes ni razonamiento multi-paso.
- Las "capacidades" descritas en la model card corresponden a funciones de un ejecutor de scripts para Roblox (adjunción a procesos, ejecución de scripts Luau, editor multi-pestaña), no a un modelo.
- No hay modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA: no hay pesos ni API de inferencia que integrar en pipelines de NLP, visión o generación de código.
- Evaluación de seguridad de la cadena de suministro: el repositorio puede utilizarse como caso de estudio de model cards fraudulentas que imitan fichas de modelos para distribuir binarios.
- Auditoría de repositorios en Hugging Face: útil como ejemplo de artefacto que debería filtrarse en pipelines automáticos de descubrimiento de modelos por ausencia de pesos y presencia de ejecutables.
- Formación en detección de software potencialmente no deseado: la estructura (ZIP con contraseña, enlaces a releases de GitHub, avisos sobre SmartScreen) es representativa de patrones de distribución sospechosos.
- No se recomienda su uso en producción, investigación ni entornos de usuario final.
- No se recomienda su uso como sustituto de ningún modelo de lenguaje en aplicaciones de atención al cliente, generación de código, análisis de datos o similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas presentes en la model card son de consumo de recursos del ejecutable (RAM y latencia), no comparables con benchmarks de modelos (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del artefacto distribuido: Windows 10 (22H2) o Windows 11 (24H2) de 64 bits, procesadores Intel o AMD x64, ejecución como administrador según las instrucciones del autor.
- Latencia y throughput: no disponible como modelo; la model card cita tiempos de respuesta inferiores a 7 ms para ciertas operaciones del ejecutable, sin metodología verificable.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Cualquier comparación con modelos de lenguaje, visión o multimodal sería categóricamente incorrecta.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador ni configuración de modelo: no es desplegable como modelo de IA.
- La model card imita el formato de una ficha de modelo (idiomas, licencia, benchmarks) para describir software ejecutable, lo que puede inducir a error en pipelines automatizados de descubrimiento.
- Distribución mediante ZIP con contraseña (`2026`) y enlaces a releases de GitHub ajenos al repositorio de Hugging Face: práctica habitual en campañas de distribución de software no verificado.
- La propia model card reconoce que Windows Defender y SmartScreen pueden emitir alertas sobre el ejecutable, lo que indica ausencia de firma de código o reputación establecida.
- No hay código fuente, hash de verificación ni información sobre la cadena de compilación del binario.
- Riesgo elevado de seguridad: ejecutar binarios sin firma como administrador en un equipo de desarrollo o investigación expone el sistema a malware, robo de credenciales y persistencia no autorizada.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el contenido del binario distribuido por canales externos.
- No se debe utilizar en producción, en entornos corporativos ni en máquinas con datos sensibles.
- Se recomienda reportar el repositorio a Hugging Face si se confirma que infringe las políticas de contenido de la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/7son/delta-executor-pc-v3
- Enlace de descarga citado en la model card (release de GitHub de terceros, no verificado): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Página de releases citada en la model card (repositorio de terceros, no verificado): https://github.com/hansdeboer5300/delta-executor-pc-v3/releases/latest
- No se han encontrado papers, blogs técnicos ni demos oficiales asociados a este repositorio.
