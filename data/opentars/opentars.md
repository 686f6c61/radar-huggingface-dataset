# OpenTARS/openTARS

## Resumen

openTARS es un asistente de IA local para escritorio desarrollado por el proyecto OpenTARS, distribuido bajo licencia MIT. No se trata de un modelo de lenguaje en sentido estricto, sino de una aplicación de escritorio completa (versión 5.2 "Ranger", revisión 2026110101) que orquesta modelos locales para automatizar tareas sobre el sistema operativo: abrir programas, pulsar botones por nombre, escribir, buscar en la web, inspeccionar la pantalla y ejecutar comandos. Está disponible para Linux (paquete `.deb` para Ubuntu/Debian), Windows 10/11 y macOS 12 o superior.

El repositorio de Hugging Face es un espejo del proyecto; la fuente de verdad, las issues y las releases se gestionan en GitHub. El asistente se apoya en dos modelos propios de la familia Gargantua: Gargantua 2 (2B parámetros, con visión) como modelo principal y Gargantua 2 Lite (0.8B parámetros, ejecutable en CPU) como alternativa ligera. La propuesta de valor es el procesamiento íntegramente local, sin suscripciones ni envío de datos a la nube.

La información disponible en este repositorio es muy limitada: el tamaño del repo es de 0.0 GB, no hay pipeline declarado, no hay descargas ni likes, y la model card no incluye especificaciones técnicas del modelo subyacente (arquitectura, contexto, cuantizaciones). Los detalles de arquitectura y entrenamiento deben consultarse en las fichas de los modelos Gargantua 2 y Gargantua 2 Lite.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (aplicación de escritorio que orquesta modelos locales; modelos Gargantua 2 y Gargantua 2 Lite) |
| Parámetros totales | no disponible para el paquete; los modelos referenciados son de 2B (Gargantua 2) y 0.8B (Gargantua 2 Lite) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), portugués (pt) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene `opentars_all.deb` y el código fuente en `app/`; no se listan pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de los modelos Gargantua 2 ni Gargantua 2 Lite en este repositorio. La model card describe únicamente la aplicación openTARS: un asistente de escritorio que combina control de interfaz gráfica (apertura de programas, clic por nombre de botón, escritura), búsqueda web, captura y análisis de pantalla y ejecución de comandos, todo ello apoyado en modelos locales. Se desconoce si emplea RLHF, DPO, decodificación especulativa u otras técnicas de entrenamiento.

El paquete incluye el binario/instalador para Ubuntu/Debian (`opentars_all.deb`) y el código fuente de la aplicación junto con los instaladores en `app/empacotamento/`. Los instaladores de Windows y macOS se describen como "early" y solo probados en ejecuciones automatizadas y en un portátil Windows.

## Capacidades

- Control de escritorio: apertura de programas, clic en botones identificados por nombre, escritura de texto y ejecución de comandos del sistema.
- Búsqueda web integrada.
- Análisis de pantalla (capacidad de "mirar la pantalla"), lo que implica un componente de visión; el modelo principal Gargantua 2 (2B) incluye visión según la model card.
- Uso de herramientas (tool-use), tal y como declaran los tags del repositorio.
- Procesamiento local: los datos no salen de la máquina del usuario.
- Soporte multilingüe limitado a inglés y portugués.
- Ejecución en CPU mediante Gargantua 2 Lite (0.8B).
- No se documentan capacidades de razonamiento multi-paso, function calling estructurado ni modo "thinking" más allá del uso de herramientas descrito.

## Casos de uso

- Automatización de tareas de escritorio en Linux: instalación del paquete `.deb` en Ubuntu/Debian para que el asistente abra aplicaciones y ejecute comandos por indicación en lenguaje natural, útil en entornos donde no se permite enviar datos a servicios cloud.
- Soporte técnico asistido en Windows: un técnico puede dictar acciones ("abre el panel de configuración", "pulsa el botón Guardar") y el asistente las ejecuta, reduciendo pasos manuales en tareas repetitivas.
- Automatización en macOS para flujos de trabajo personales: escritura y búsqueda web guiadas por voz o texto, con procesamiento local que evita filtraciones de datos sensibles.
- Despliegue en equipos sin GPU: Gargantua 2 Lite (0.8B) permite ejecutar el asistente en CPU, adecuado para portátiles modestos o máquinas virtuales sin aceleración hardware.
- Entornos con requisitos de privacidad: al procesar todo localmente, encaja en escenarios donde el uso de asistentes cloud está restringido (sanidad, legal, administración pública con políticas estrictas de datos).
- Prototipado e investigación en agentes de escritorio: el código fuente en `app/` y la licencia MIT permiten a desarrolladores extender el asistente, integrar nuevos modelos o adaptar el control de interfaz a aplicaciones propias.
- Pruebas de automatización de GUI: uso del componente de clic por nombre de botón y análisis de pantalla para validar flujos de interfaz en pipelines de QA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo principal Gargantua 2 es de 2B parámetros con visión; la VRAM dependerá de la cuantización, que no se documenta.
- GPU recomendadas: no disponible.
- Ejecución en CPU: sí, mediante Gargantua 2 Lite (0.8B), según la model card.
- GPU de consumo: no se especifica compatibilidad con RTX 4090, RTX 3090 u otras; el modelo de 2B es, en principio, apto para GPUs de consumo con VRAM suficiente, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: la aplicación se distribuye como paquete nativo (`.deb`, instaladores PowerShell y shell). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openTARS (Gargantua 2 / Lite) | Asistente de escritorio con modelos locales | 2B / 0.8B (modelos referenciados) | no disponible | MIT | Hugging Face (espejo) y GitHub |
| Alternativas de asistente de escritorio local | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría (asistentes de escritorio con control de GUI y modelos locales). Los datos de parámetros, contexto y rendimiento de los modelos Gargantua no están publicados en este repositorio.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura, contexto, cuantizaciones ni rendimiento de los modelos subyantes; cualquier evaluación seria requiere consultar las fichas de Gargantua 2 y Gargantua 2 Lite.
- Idiomas limitados a inglés y portugués; no hay soporte declarado de castellano.
- Instaladores de Windows y macOS en estado temprano, probados solo en ejecuciones automatizadas y en un único portátil Windows; riesgo de fallos en producción.
- Los comandos de instalación descargan y ejecutan código desde GitHub (`irm ... | iex`, `curl ... | bash`); la propia model card advierte de leer el script antes de ejecutarlo.
- Riesgo de alucinación y de acciones erróneas: al ejecutar comandos y clics sobre el sistema operativo, un error del modelo puede tener consecuencias reales (borrado de archivos, cambios de configuración). No se documentan mecanismos de confirmación o sandboxing.
- Sin datos sobre sesgos del modelo.
- Licencia MIT permite uso comercial, pero al tratarse de un espejo, la gobernanza y el mantenimiento dependen del repositorio de GitHub.
- Cero descargas y cero likes en el momento de la consulta, lo que indica un proyecto incipiente sin validación comunitaria.
- No se especifican requisitos de hardware ni compatibilidad con GPUs concretas, lo que dificulta planificar un despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/OpenTARS/openTARS
- GitHub (fuente de verdad): https://github.com/project-opentars/OpenTARS
- Sitio web: https://project-opentars.github.io/OpenTARS/
- Modelo Gargantua 2: https://huggingface.co/OpenTARS/Gargantua-2
- Modelo Gargantua 2 Lite: https://huggingface.co/OpenTARS/Gargantua-2-Lite
- Demo de Gargantua 2 Lite: https://huggingface.co/spaces/OpenTARS/Gargantua-2-Lite-demo
