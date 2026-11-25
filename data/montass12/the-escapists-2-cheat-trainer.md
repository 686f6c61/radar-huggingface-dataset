# montass12/the-escapists-2-cheat-trainer

## Resumen

El repositorio `montass12/the-escapists-2-cheat-trainer` no contiene un modelo de inteligencia artificial, sino un supuesto "cheat trainer" para el videojuego *The Escapists 2*, empaquetado como ejecutable portable para Windows 10 y Windows 11 de 64 bits. La model card se presenta con el formato habitual de Hugging Face (etiquetas de licencia, idioma y región), pero su contenido es una página de descarga de software de terceros con instrucciones de instalación, contraseña de archivo y enlaces a binarios alojados en repositorios de GitHub ajenos al autor declarado.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni datos de entrenamiento. El repositorio declara catorce idiomas en sus metadatos, pero esa lista refleja los idiomas de la interfaz del ejecutable, no capacidades lingüísticas de un modelo. Cualquier evaluación como modelo de lenguaje, visión o razonamiento carece de sentido con la información disponible.

La relevancia de esta ficha es, por tanto, documental y de advertencia: sirve para identificar un artefacto que se hace pasar por modelo en el Hub y que distribuye un binario con nombre de otro juego (*Monster Hunter Wilds*), contraseña de descompresión y enlaces de descarga externos, un patrón habitual en campañas de distribución de software no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; corresponden a la interfaz del ejecutable) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de red neuronal, ni corpus de entrenamiento, ni proceso de alineación (RLHF, DPO u otro). El artefacto descrito es un binario `monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe` (build `v1.6.3`, identificador `EF555010EE`) comprimido en un ZIP de 4,8 MB protegido con la contraseña `2026`.

La model card menciona componentes propios de un trainer de juego (suavizado de entrada Bézier, radar 2D, filtro de loot, overlay externo a 144 Hz, escáner dinámico de offsets, capa de render excluida de capturas), con cifras de latencia y consumo de RAM (`< 14 ms`, `< 53 MB`, `< 22 ms`, `< 27 ms`) y porcentajes de consistencia (`98,8 %`, `97,2 %`) que no vienen respaldados por ninguna medición reproducible. No se documenta ningún proceso de entrenamiento porque no existe.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües más allá de los textos de interfaz listados en los metadatos.
- El ejecutable declarado ofrece, según su propia descripción, funciones de trainer sobre el juego *The Escapists 2*: suavizado de entrada, radar 2D, filtro de objetos por rareza, overlay con cajas delimitadoras y esqueletos, y escaneo de offsets tras parches del juego.
- Estas funciones no son verificables con la información disponible y no constituyen capacidades de IA.

## Casos de uso

- Catalogación de artefactos sospechosos en el Hub: registrar el repositorio como ejemplo de model card que suplanta el formato de ficha de modelo para distribuir un binario, útil en tareas de moderación y curación de datasets.
- Formación en seguridad para desarrolladores: usar la estructura de la página (contraseña de archivo, enlaces a repositorios de terceros, nombre de binario incoherente con el título) como caso práctico de identificación de descargas de riesgo.
- Auditoría de metadatos: comprobar cómo un repositorio puede declarar licencia MIT, catorce idiomas y etiquetas de plataforma sin que ello implique ninguna garantía sobre el contenido distribuido.
- Documentación de políticas de ingesta: establecer reglas que excluyan de los pipelines de datos los repositorios sin pesos, sin tokenizador y sin `pipeline_tag`, como es el caso.
- Análisis de campañas de distribución: estudiar la reutilización de nombres de juegos populares (*The Escapists 2*, *Monster Hunter Wilds*) y de builds con identificadores falsos para aumentar la aparente legitimidad.
- Investigación de procedencia: rastrear la discrepancia entre el autor declarado (`montass12`) y las cuentas de GitHub enlazadas (`Giovanni9790`, `Isabela3497`) como indicio de cadena de suministro no verificada.
- Concienciación de usuarios finales: ilustrar por qué no debe ejecutarse como administrador un binario descargado de un repositorio de modelos, tal como indican las propias instrucciones del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras del repositorio son latencias y consumos declarados por el propio artefacto (respuesta `< 14 ms`, `< 22 ms`, `< 27 ms`; RAM `< 53 MB`; consistencia `98,8 %` y `97,2 %`), sin metodología, hardware de referencia ni posibilidad de reproducción. No se presentan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplicable; el artefacto declara funcionar en Windows 10 y Windows 11 de 64 bits sin requisitos de GPU.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto no es servible como modelo.
- Requisitos declarados: Windows 10/11 x64, descompresión con 7-Zip o WinRAR y contraseña `2026`, y ejecución como administrador.
- Latencia y throughput: solo cifras declaradas por el autor, no verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. A modo de contraste estructural, se incluye una tabla con la diferencia frente a un repositorio de modelo convencional:

| Criterio | Este repositorio | Repositorio de modelo típico |
|---|---|---|
| Pesos publicados | No (solo un ZIP con un `.exe`) | Sí (safetensors, GGUF) |
| Tokenizador | No | Sí |
| `pipeline_tag` | No disponible | Declarado (text-generation, etc.) |
| Arquitectura documentada | No | Sí |
| Evaluaciones reproducibles | No | Habitualmente sí |
| Licencia | MIT declarada | MIT, Apache-2.0, Llama, etc. |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en ningún trabajo técnico o académico.
- El binario distribuido lleva el nombre de otro juego (*Monster Hunter Wilds*) distinto del título del repositorio (*The Escapists 2*), lo que indica falta de coherencia en el empaquetado.
- Los enlaces de descarga apuntan a repositorios de GitHub de cuentas distintas del autor declarado en Hugging Face, sin cadena de custodia verificable.
- Se solicita ejecutar el `.exe` como administrador y extraerlo con una contraseña fija (`2026`), una combinación que impide la inspección automática por parte de antivirus y motores de análisis.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- La licencia MIT declarada en los metadatos no garantiza nada sobre el binario enlazado, que se aloja fuera del Hub y no está cubierto por el repositorio.
- Riesgo de alucinación: no aplica a un modelo, pero sí a la model card, que presenta métricas y capacidades sin respaldo.
- Uso comercial: desaconsejado; además, la modificación de videojuegos puede infringir los términos de servicio del juego y la legislación aplicable en la jurisdicción del usuario.
- No debe ejecutarse en entornos de producción, máquinas con credenciales ni equipos de trabajo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/montass12/the-escapists-2-cheat-trainer
- Enlace de descarga citado en la model card (ZIP, 4,8 MB): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Releases citadas en la model card: https://github.com/Isabela3497/the-escapists-2-cheat-trainer/releases/latest
- Paper, blog o demo oficial: no disponible
