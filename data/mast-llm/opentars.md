# Mast-LLM/openTARS

## Resumen

openTARS es un asistente de IA local para escritorio desarrollado por Mast-LLM, distribuido como aplicación para Linux, Windows y macOS. No se trata de un modelo de lenguaje en sentido estricto, sino de un repositorio espejo en Hugging Face del código fuente y del paquete de instalación de una aplicación que orquesta modelos locales mediante llama.cpp. El repositorio contiene el paquete `.deb` para Ubuntu/Debian (versión 5.3 "Tesseract", revisión 2026111301), el código fuente de la aplicación y la licencia MIT.

La aplicación permite al usuario interactuar con el sistema operativo mediante lenguaje natural: abrir programas, pulsar botones por nombre, escribir texto, buscar en la web, inspeccionar la pantalla y ejecutar comandos. Todo el procesamiento ocurre en la máquina del usuario, sin suscripciones ni dependencia de servicios en la nube. Para ello, openTARS descarga en el primer arranque el motor llama.cpp y el modelo principal Gargantua 2.5, verificados ambos mediante SHA-256 fijo.

La relevancia de openTARS reside en su enfoque de agente de escritorio completamente local con capacidades de tool use y control del sistema. El repositorio en Hugging Face tiene un tamaño de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y actúa únicamente como espejo: la fuente de verdad, las incidencias y las releases se gestionan en GitHub. El modelo subyacente principal es Gargantua 2.5, basado en Gemma 4 E4B con visión y audio, aunque openTARS en sí no es un modelo entrenado por Mast-LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación de escritorio que orquesta modelos locales mediante llama.cpp; no es un modelo de lenguaje |
| Parametros totales | no disponible (depende del modelo subyacente; el principal es Gargantua 2.5, basado en Gemma 4 E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (gestionados por llama.cpp y el modelo descargado) |
| Idiomas soportados | en, pt |
| Licencia | MIT |
| Formato de pesos | no disponible (la aplicación descarga el motor llama.cpp y el modelo Gargantua 2.5 en el primer arranque) |

## Arquitectura y entrenamiento

openTARS no es un modelo entrenado, sino una aplicación de escritorio que actúa como capa de orquestación sobre modelos locales ejecutados con llama.cpp. La aplicación descarga en el primer arranque el motor de inferencia (llama.cpp) y el modelo principal (Gargantua 2.5), verificando cada artefacto contra un SHA-256 fijo. La arquitectura interna de la aplicación incluye un clasificador de peticiones minúsculo llamado Murph, integrado en la propia app, que presumiblemente decide cómo enrutar las solicitudes del usuario hacia las distintas capacidades del sistema.

El ecosistema de modelos que openTARS puede utilizar está compuesto por varias variantes de la familia Gargantua, todas construidas sobre modelos Gemma 4: Gargantua 2.5 (Gemma 4 E4B, con visión y audio) como modelo principal, Gargantua Lite Gen 3 (Gemma 4 E2B) como versión reducida, Gargantua Pro Gen 1 (Gemma 4 12B) para misiones en máquina virtual, Gargantua Code Gen 2 para programación y Murph como clasificador de peticiones. No se dispone de información sobre el proceso de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Control del escritorio mediante lenguaje natural: abrir programas, pulsar botones por nombre, escribir texto y ejecutar comandos del sistema.
- Búsqueda web integrada como herramienta accesible desde la conversación.
- Inspección de la pantalla (capacidad de "mirar" la pantalla), lo que habilita interacción basada en el estado visual del escritorio.
- Tool use / function calling: la aplicación está etiquetada explícitamente con `tool-use` y orientada a la invocación de herramientas del sistema.
- Procesamiento completamente local: los datos permanecen en la máquina del usuario, sin suscripciones ni servicios en la nube.
- Capacidades multimodales heredadas del modelo subyacente Gargantua 2.5 (Gemma 4 E4B), que incluye visión y audio.
- Soporte multilingüe limitado a inglés (en) y portugués (pt) según los metadatos del repositorio.
- Clasificación de peticiones mediante el modelo minúsculo Murph, integrado en la aplicación.

## Casos de uso

- Automatización de tareas de escritorio en Linux, Windows y macOS: el usuario describe en lenguaje natural una acción ("abre el navegador y busca X") y openTARS la ejecuta mediante tool use sobre el sistema operativo, sin necesidad de escribir scripts.
- Asistencia técnica presencial con inspección de pantalla: la capacidad de mirar la pantalla permite diagnosticar el estado de una aplicación o guiar al usuario en función de lo que se muestra, útil en soporte de primer nivel.
- Ejecución de comandos guiada por lenguaje natural: para desarrolladores y administradores de sistemas que quieren lanzar comandos sin recordar la sintaxis exacta, con la ventaja de que todo el procesamiento ocurre en local.
- Entornos con requisitos de privacidad: al no enviar datos a la nube, openTARS es adecuado para equipos que manejan información sensible y no pueden usar asistentes basados en API externas.
- Automatización de flujos de trabajo repetitivos en el escritorio: pulsar botones por nombre y escribir texto permite encadenar interacciones con aplicaciones de escritorio que no exponen API, algo que los asistentes en la nube no pueden hacer directamente.
- Programación asistida: mediante la variante Gargantua Code Gen 2, la aplicación puede emplearse para tareas de generación de código dentro del propio entorno de escritorio del desarrollador.
- Uso en máquinas virtuales para tareas de mayor exigencia: la variante Gargantua Pro Gen 1 (Gemma 4 12B) está pensada para "misiones en una máquina virtual", lo que permite aislar tareas complejas del sistema anfitrión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo Gargantua seleccionado (Gemma 4 E2B, E4B o 12B) y de la cuantización aplicada por llama.cpp, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la aplicación está diseñada para ejecutarse localmente, pero no se detallan los requisitos mínimos ni máximos.
- Opciones de despliegue: la aplicación se instala mediante scripts de PowerShell (Windows 10/11), shell (macOS 12 o superior) y paquete `.deb` (Ubuntu/Debian y derivados). El motor de inferencia es llama.cpp, descargado automáticamente en el primer arranque junto con el modelo Gargantua 2.5.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openTARS | Aplicación de escritorio con orquestación de modelos locales | no disponible (depende del modelo subyacente) | no disponible | MIT | Hugging Face (espejo), GitHub, sitio web oficial |
| Gargantua 2.5 | Modelo de lenguaje local (Gemma 4 E4B) con visión y audio | no disponible | no disponible | no disponible | Hugging Face (Mast-LLM/Gargantua-2.5) |
| Gargantua Lite Gen 3 | Modelo de lenguaje local (Gemma 4 E2B) | no disponible | no disponible | no disponible | Hugging Face (Mast-LLM/Gargantua-2.5-Lite) |
| Gargantua Pro Gen 1 | Modelo de lenguaje local (Gemma 4 12B) | no disponible | no disponible | no disponible | Hugging Face (Mast-LLM/Gargantua-Pro) |

No se dispone de información sobre modelos comparables de otros desarrolladores en la documentación proporcionada, por lo que la comparativa se limita a las variantes de la propia familia Gargantua.

## Limitaciones y advertencias

- Idiomas soportados limitados a inglés y portugués según los metadatos; no se declara soporte de castellano.
- El repositorio es únicamente un espejo: las incidencias, releases y la fuente de verdad están en GitHub, por lo que el repositorio de Hugging Face puede quedar desactualizado.
- Los scripts de instalación descargan y ejecutan código desde GitHub; el propio autor recomienda leer el script antes de ejecutarlo, lo que introduce un riesgo de seguridad en entornos corporativos.
- La aplicación descarga el motor llama.cpp y el modelo en el primer arranque, lo que requiere conexión a internet inicial y espacio en disco no especificado.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones de contexto del modelo subyacente en la documentación proporcionada.
- La licencia MIT se aplica al repositorio de openTARS; las licencias de los modelos Gargantua subyacentes no se detallan en la información disponible y deben verificarse antes de un uso comercial.
- El repositorio registra cero descargas y cero likes, lo que indica una adopción muy limitada y poca validación por parte de la comunidad en el momento de la consulta.
- No se especifican requisitos mínimos de hardware ni compatibilidad con GPU concretas, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mast-LLM/openTARS
- Código fuente y releases en GitHub: https://github.com/MastLLM/OpenTARS
- Sitio web oficial: https://mastllm.github.io/OpenTARS/
- Verificación del paquete: https://mastllm.github.io/OpenTARS/verify.html
- Modelo principal Gargantua 2.5: https://huggingface.co/Mast-LLM/Gargantua-2.5
- Modelo Gargantua Lite Gen 3: https://huggingface.co/Mast-LLM/Gargantua-2.5-Lite
- Modelo Gargantua Pro Gen 1: https://huggingface.co/Mast-LLM/Gargantua-Pro
- Modelo Gargantua Code Gen 2: https://huggingface.co/Mast-LLM/Gargantua-Code-Gen2
- Modelo Murph: https://huggingface.co/Mast-LLM/Murph
