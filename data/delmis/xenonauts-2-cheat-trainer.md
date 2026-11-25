# delmis/xenonauts-2-cheat-trainer

## Resumen

El repositorio `delmis/xenonauts-2-cheat-trainer` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un supuesto "cheat trainer" (herramienta de trampas) para el videojuego *Xenonauts 2* distribuido como ejecutable portable para Windows x64. No dispone de arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociado; el campo `pipeline` figura como no disponible y las descargas y "likes" son cero en el momento de la consulta.

La model card publicada presenta inconsistencias graves que conviene señalar: el título y las etiquetas hacen referencia a *Xenonauts 2*, pero el binario y el archivo comprimido se denominan `monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64`, es decir, apuntan a otro juego distinto (*Monster Hunter Wilds*). Además, el enlace de descarga apunta a un repositorio de GitHub de un tercero (`martina1713`) y no al propio autor del repositorio de Hugging Face, e incluye una contraseña de descompresión fija (`2026`) y la instrucción de ejecutar el binario como administrador.

Por todo ello, esta ficha no puede tratar el artefacto como un modelo de IA: no hay parámetros, contexto, licencia de pesos ni datos de entrenamiento que documentar. Lo que sigue describe el contenido tal como aparece publicado, marcando como "no disponible" todo aquello que no existe o no se puede verificar, y advirtiendo de los riesgos de seguridad asociados a la ejecución de binarios de procedencia dudosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El artefacto es un archivo `monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip` de 4,8 MB que, según la model card, contiene un ejecutable `monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe` identificado como build `v1.3.7 (920847)`. La descripción menciona componentes propios de herramientas de modding o scripting de juegos (editor tipo Monaco, "script hub", compatibilidad "sUNC", `hookmetamethod`, `getgc`, Drawing API, "multi-instance attach"), pero no aporta ninguna información verificable sobre su implementación interna, sus dependencias ni su cadena de compilación.

No hay datos de entrenamiento, dataset, tokens procesados, RLHF, DPO ni innovación técnica alguna en el sentido de modelos de lenguaje. La model card mezcla terminología de marketing ("zero frame-time spikes", "376 Hz polling", "< 31 MB RAM") sin trazabilidad ni referencias que permitan auditarla.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de APIs de modelos.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son metadatos del repositorio, no capacidades del artefacto.
- Según la model card (no verificado), el ejecutable ofrecería funciones de "trainer" para un videojuego: adjuntarse a procesos, sincronizar offsets tras parches, ejecutar scripts y ofrecer un editor integrado.
- El nombre del binario y del ZIP no coincide con el juego indicado en el título, lo que impide determinar a qué juego afecta realmente.

## Casos de uso

- No aplica como modelo de IA en ningún pipeline de NLP, visión, código o agentes.
- Auditoría de seguridad: analizar el ZIP y el EXE en un entorno aislado (sandbox, máquina virtual sin red) para determinar su comportamiento antes de cualquier ejecución.
- Estudio de casos de供应链 maliciosa: documentar cómo una model card puede suplantar la identidad de un juego, redirigir descargas a repositorios de terceros y solicitar privilegios de administrador.
- Formación en higiene de seguridad: usar el ejemplo como material didáctico sobre por qué no se deben ejecutar binarios con contraseña fija distribuidos desde repositorios no oficiales.
- Verificación de metadatos en Hugging Face: comprobar cómo los campos `tags`, `language` y `license` pueden rellenarse de forma automática sin relación con el contenido real.
- Monitorización de repositorios: incluir este tipo de artefactos en listas de bloqueo o en reglas de detección de contenido no relacionado con IA en plataformas de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es evaluable con MMLU, HumanEval, GSM8K ni métricas equivalentes, y las cifras que aparecen en la model card (latencia "< 33 ms", "< 31 MB RAM", "376 Hz") carecen de metodología y no son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo indicado: Windows 10/11 de 64 bits (x64).
- Tamaño del paquete: 4,8 MB comprimido.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles ni verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, porque el artefacto no es un modelo. Frente a herramientas legítimas de modding de videojuegos, la diferencia principal es que aquí no hay código fuente público, el binario está empaquetado con contraseña y la descarga se redirige a un repositorio de GitHub ajeno al autor del repositorio de Hugging Face.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier uso previsto para generación de texto, código o razonamiento es inviable.
- Inconsistencia de identidad: el título menciona *Xenonauts 2* pero el binario y el ZIP se llaman `monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64`, lo que sugiere copia de plantilla o suplantación.
- Descarga redirigida: el enlace apunta a un repositorio de GitHub de otro usuario (`martina1713`), no al autor del repositorio de Hugging Face.
- Ejecución como administrador: la model card instruye a ejecutar el `.exe` con privilegios elevados, lo que amplía el impacto de cualquier comportamiento malicioso.
- Contraseña fija de descompresión (`2026`): práctica habitual para evadir análisis automatizados de antivirus y sandboxes.
- Cero descargas y cero "likes": no hay evidencia de uso legítimo ni de comunidad que lo respalde.
- Licencia MIT declarada en metadatos, pero sin archivo `LICENSE` verificable ni código fuente que la acompañe; la licencia no cubre responsabilidad alguna sobre el binario.
- Riesgo de malware: un ejecutable portable de procedencia desconocida que pide privilegios de administrador debe tratarse como no fiable por defecto.
- Fecha de creación y actualización (2026-11-24) posterior a la fecha habitual de consulta, lo que puede indicar metadatos manipulados.
- No usar en producción ni en equipos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/delmis/xenonauts-2-cheat-trainer
- Enlace de descarga citado en la model card (repositorio de terceros, no verificado): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado como archivo alternativo: https://github.com/javed21948/xenonauts-2-cheat-trainer/releases/latest
