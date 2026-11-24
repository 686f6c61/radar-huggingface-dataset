# Hisohkoyage/delta-executor-pc-v3

## Resumen

`Hisohkoyage/delta-executor-pc-v3` no es un modelo de inteligencia artificial. El repositorio de Hugging Face, pese a estar alojado en esa plataforma, contiene una model card que en realidad distribuye un ejecutable de Windows (`delta-executor-pc-v3-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB protegido con la contraseña `2026`). El contenido se presenta como un "executor" para Roblox, es decir, una herramienta de terceros que inyecta scripts Luau en el cliente del juego mediante adjunción a memoria de proceso y sincronización de offsets tras los parches del cliente.

No existe información alguna sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni datos de entrenamiento. Los metadatos de Hugging Face listan etiquetas de plataforma (`windows`, `windows-11`, `x64`, `portable`) e idiomas (`en`, `ru`, `zh`, `es`, `pt`, `tr`, `de`, `fr`, `ja`, `ko`, `ar`, `pl`, `vi`, `id`), pero estos campos describen la interfaz del programa, no capacidades lingüísticas de un modelo. La licencia declarada es MIT.

Su relevancia para desarrolladores e investigadores es nula en el ámbito de la IA. La ficha se redacta para dejar constancia de que el artefacto no es un modelo y para advertir de los riesgos asociados a la descarga de binarios de procedencia no verificada, con cero descargas y cero "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; corresponden a la interfaz del programa) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene pesos, configuración de transformer, tokenizador ni pipeline de entrenamiento. La model card describe un programa para Windows 10 (22H2) y Windows 11 (24H2) que, según el autor, realiza adjunción a memoria de proceso, sincronización de offsets tras los parches del cliente, ejecución multi-instancia con 16 hilos de trabajo y compatibilidad declarada del 98 % con la suite sUNC (incluyendo `hookmetamethod`, `getgc` y Drawing API). También menciona un editor Monaco integrado y un "script hub" con presets en la nube.

Todos estos datos provienen exclusivamente del texto del autor y no han sido verificados de forma independiente. No hay información sobre el compilador, las dependencias, el proceso de build ni el código fuente, pese a la licencia MIT declarada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de comprensión o generación; los códigos de idioma del repositorio describen la localización de la interfaz.
- El programa declara, según su autor, ejecución de scripts Luau, adjunción a procesos, multi-instancia y un editor con resaltado de sintaxis.

## Casos de uso

- Ninguno en el ámbito de la IA. El artefacto no permite inferencia, fine-tuning, evaluación de benchmarks ni integración en pipelines de datos.
- Auditoría de seguridad: un equipo puede analizar el binario en un entorno aislado para documentar su comportamiento, sus llamadas al sistema y sus mecanismos de persistencia.
- Formación en detección de malware: el caso sirve como ejemplo de repositorio que se hace pasar por un modelo en Hugging Face para distribuir un ejecutable.
- Estudio de ingeniería social: la model card emplea insignias de valoración, contraseña de descompresión y enlaces a un repositorio de GitHub de terceros, un patrón habitual en campañas de distribución de software no deseado.
- Verificación de políticas de plataforma: permite comprobar cómo los filtros de Hugging Face gestionan contenido que no es un modelo.
- Documentación de riesgos: sirve para ilustrar por qué conviene revisar los metadatos (cero descargas, pipeline vacío, etiquetas incoherentes) antes de ejecutar cualquier artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos, porque el artefacto no es un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10 (22H2) o Windows 11 (24H2), procesador x64 (Intel o AMD), 8,9 MB de paquete comprimido y ejecución como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; el autor cita tiempos de respuesta inferiores a 7 ms y consumos de memoria de 30 a 41 MB por subsistema, sin verificación independiente.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que el artefacto no es un modelo de IA. Frente a modelos reales de la misma plataforma (por ejemplo, cualquier LLM con pesos en safetensors y pipeline declarado), las diferencias son absolutas: aquí no hay parámetros, contexto, licencia de pesos ni evaluación reproducible.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en comparativas, rankings ni evaluaciones.
- El binario se distribuye sin código fuente verificable, pese a la licencia MIT declarada.
- La ejecución como administrador y la petición de desactivar avisos de Windows Defender o SmartScreen son señales de riesgo elevado.
- El repositorio tiene cero descargas y cero interacciones, y enlaza a un repositorio de GitHub de un tercero (`hansdeboer5300`) ajeno al autor del espacio en Hugging Face.
- La contraseña de descompresión publicada (`2026`) impide el análisis automático por parte de motores antivirus basados en firmas de archivo.
- Uso potencialmente contrario a los términos de servicio de Roblox; no se pronuncia sobre legalidad en otras jurisdicciones.
- Riesgo de alucinación, sesgos y limitaciones de contexto: no aplica, al no existir modelo.
- No se debe ejecutar en máquinas de producción ni en entornos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hisohkoyage/delta-executor-pc-v3
- Repositorio de GitHub enlazado por el autor: https://github.com/hansdeboer5300/delta-executor-pc-v3
- Descarga directa citada en la model card (no recomendada): https://github.com/hansdeboer5300/delta-executor-pc-v3/releases/latest/download/delta-executor-pc-v3-v1.2.0-win64.zip
