# Chooozy/delta-executor-pc

## Resumen

El identificador `Chooozy/delta-executor-pc` no corresponde a un modelo de inteligencia artificial, sino a un repositorio alojado en Hugging Face cuyo contenido es una supuesta utilidad de tipo *executor* para Roblox distribuida como binario portable para Windows x64. La model card no describe ninguna arquitectura de red neuronal, ni pesos, ni tokenizador, ni proceso de entrenamiento: se limita a instrucciones de descarga, extracción con contraseña y ejecución de un fichero `.exe` con privilegios de administrador.

El material encontrado presenta los patrones típicos de las campañas de distribución de *malware* disfrazadas de herramientas de *cheats* o *executors*: enlaces de descarga alojados en repositorios de GitHub ajenos al autor declarado, archivo comprimido protegido con contraseña (lo que evita el análisis automático por parte de antivirus y servicios de inspección), instrucciones explícitas para desactivar o ignorar Windows Defender y SmartScreen, y solicitud de ejecución como administrador. No hay información verificable sobre qué contiene el binario.

Desde la perspectiva de evaluación de modelos, esta ficha no puede completarse con datos técnicos reales porque no existen. Se documenta el artefacto, se advierte de su naturaleza y se recomienda no descargarlo ni ejecutarlo. Cualquier uso en producción es desaconsejado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, no verificable) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El repositorio no contiene ficheros de pesos en formatos estándar (`safetensors`, `GGUF`, `ONNX`, etc.), ni configuración de transformer, MoE o SSM, ni tokenizador, ni scripts de entrenamiento. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) describen un ejecutable, no un modelo.

La model card describe módulos funcionales de una herramienta de ejecución de scripts para Roblox (sincronización de *offsets* tras parches, compatibilidad sUNC, editor Monaco, adjuntado multi-instancia, directorio de auto-ejecución y *script hub*). Ninguno de estos elementos constituye entrenamiento, ajuste fino ni alineación de un modelo de lenguaje. No hay datos sobre volumen de tokens, composición del corpus, RLHF o DPO porque el artefacto no es un modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta *tool calling* ni *function calling* en el sentido de los modelos de IA.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües reales; los códigos de idioma de los metadatos son etiquetas del repositorio, no una indicación de competencia lingüística.
- No dispone de modo *thinking*, visión, audio ni ninguna modalidad.
- El artefacto declara funcionalidades de *executor* para Roblox (inyección de scripts, *hooks*, API de dibujo), lo que se asocia habitualmente a la manipulación de clientes de juego y puede contravenir los términos de servicio de la plataforma.

## Casos de uso

- Ninguno recomendado. No se identifica un caso de uso legítimo para un modelo de IA, porque no lo es.
- Evaluación de modelos: no aplica; no hay modelo que evaluar.
- Investigación en seguridad: el artefacto podría emplearse como muestra en un entorno aislado y sin red para analizar técnicas de distribución de *malware* (contraseña en el ZIP, enlaces a repositorios de terceros, instrucciones para desactivar Defender). Requiere máquina virtual desechable y ausencia de credenciales.
- Docencia sobre ingeniería social: sirve como ejemplo de model card fraudulenta que imita el formato de un repositorio de modelos para distribuir un ejecutable.
- Monitorización de Hugging Face: útil como caso de estudio para políticas de moderación de contenido y detección de repositorios abusivos.
- Análisis de cadena de suministro: permite ilustrar el riesgo de descargar binarios desde enlaces de GitHub no controlados por el autor declarado.
- Auditoría de licencias: la licencia MIT declarada no aporta garantías sobre el binario ni sobre su procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, y las cifras que aparecen en la model card (porcentajes de compatibilidad, latencias en milisegundos) son afirmaciones de marketing sin metodología verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card (`< 29 ms`, `< 11 ms`) no son verificables.
- Requisitos del artefacto: Windows 10 u 11 de 64 bits, privilegios de administrador para ejecutar el binario, y 7-Zip o WinRAR para extraer el archivo protegido con contraseña.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque el artefacto no es un modelo de IA. Como referencia de contraste, un modelo de lenguaje real de tamaño pequeño (por ejemplo, en el rango de 1 a 8 mil millones de parámetros) publicaría pesos en `safetensors`, una arquitectura documentada, una longitud de contexto declarada y resultados de evaluación reproducibles; nada de ello está presente aquí.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA pese a estar alojado en Hugging Face; los metadatos de idioma y licencia no describen un artefacto de aprendizaje automático.
- Distribución mediante ZIP con contraseña (`2026`) y enlaces a repositorios de GitHub de terceros: técnica habitual para evadir el escaneo automático de antivirus y servicios de análisis.
- Instrucciones explícitas para ignorar o desactivar Windows Defender y SmartScreen y ejecutar como administrador: indicio fuerte de comportamiento malicioso o no auditado.
- Riesgo elevado de *malware*: el binario podría instalar *stealers* de credenciales, *ransomware* o *backdoors*. No hay forma de verificar su contenido sin análisis en entorno aislado.
- La licencia MIT declarada no implica que el binario sea seguro ni que su código fuente esté disponible; no se ha publicado código fuente.
- Uso potencialmente contrario a los términos de servicio de Roblox y a la legislación sobre manipulación de software de terceros.
- No apto para producción, ni para entornos corporativos, ni para máquinas con datos sensibles.
- Los sesgos, la alucinación y las limitaciones de contexto no aplican como tales, pero la model card contiene afirmaciones no verificables que pueden inducir a error.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Chooozy/delta-executor-pc
- Enlace de descarga citado en la model card (no recomendado): https://github.com/RenSiekiera/repo-cheat-mod-menu/releases/download/v1.2.0/repo-cheat-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub citado como origen alternativo (no recomendado): https://github.com/vikramlarsson/delta-executor-pc/releases/latest
- No se han encontrado papers, blogs técnicos, repositorios de código fuente ni demos verificables asociados a este artefacto.
