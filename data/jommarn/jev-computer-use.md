# Jommarn/JEV-Computer-Use

## Resumen

JEV-Computer-Use es un modelo de decisión orientado a la interacción con entornos de escritorio y navegador (computer use y browser agent), desarrollado por el usuario Jommarn y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como un agente de "System-One", es decir, un modelo que emite decisiones rápidas en un único paso hacia adelante en lugar de generar cadenas de razonamiento textual largas antes de cada acción. Para ello emplea una formulación de "slot de candidato de lectura única": en lugar de producir texto libre, el modelo emite probabilidades calibradas sobre un conjunto discreto de acciones candidatas etiquetadas como A, B, C, etc.

La propuesta técnica se apoya en tres pilares: un esquema de lectura de acción de un solo token, un pipeline de entrenamiento con GRPO interactivo en línea sobre un Chromium headless gestionado con Playwright, y un verificador semántico basado en un modelo visión-lenguaje de la familia Qwen. La política se entrena combinando entropía cruzada, una pérdida de calibración de Brier y una regularización KL en forma cerrada analítica.

El modelo se publica con pipeline de text-generation y etiquetas que lo sitúan en el espacio de gui-grounding y browser-agent. La información pública disponible es muy escasa: la model card no especifica arquitectura base concreta, número de parámetros, longitud de contexto ni idiomas soportados. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado el 1 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de la familia Qwen según las etiquetas; arquitectura base concreta no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card describe un modelo de decisión con formulación de "slot de candidato de lectura única". En lugar de generar una secuencia de razonamiento textual antes de cada acción, el modelo produce en un solo paso hacia adelante una distribución de probabilidad sobre un conjunto discreto de acciones candidatas identificadas por letras (A, B, C, etc.). Esta elección de diseño busca reducir la latencia de decisión por debajo del segundo, algo crítico en bucles de control de agentes que interactúan con interfaces gráficas.

El entrenamiento se realiza mediante GRPO (Group Relative Policy Optimization) interactivo en línea, ejecutando el agente contra un Chromium headless real controlado con Playwright. La verificación de las trayectorias se automatiza con un juez visión-lenguaje basado en Qwen, que evalúa semánticamente si la acción ejecutada cumple el objetivo. La función de pérdida combina entropía cruzada, una pérdida de calibración de Brier y una regularización KL en forma cerrada analítica, con el objetivo declarado de obtener una política calibrada. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni detalles sobre la arquitectura base (transformer denso, MoE u otra).

## Capacidades

- Toma de decisiones sobre acciones discretas de interfaz gráfica mediante lectura de un solo token (etiquetas A, B, C, etc.).
- Navegación web automatizada en entornos Chromium headless a través de Playwright.
- Grounding de interfaz gráfica (gui-grounding): selección de acciones sobre elementos de la UI.
- Emisión de probabilidades calibradas de acción, pensadas para integrarse en bucles de control de agentes.
- Entrenamiento con refuerzo interactivo en línea (GRPO) contra un navegador real.
- Verificación semántica automática de trayectorias mediante un juez VLM de Qwen.
- No se documentan capacidades de tool calling genérico, visión nativa del propio modelo, audio, ni modo de razonamiento extendido.

## Casos de uso

- Automatización de tareas repetitivas en navegador: el modelo puede seleccionar acciones sobre elementos de la página en un bucle de control con Playwright, aprovechando la latencia de decisión de un solo paso para ejecutar secuencias largas de clics y rellenos de formulario.
- Agentes de QA de interfaces web: ejecución de recorridos de prueba sobre una aplicación en Chromium headless, con verificación semántica de cada paso mediante el juez VLM descrito en la model card.
- Rellenado y envío de formularios web: selección de campos y acciones de envío a partir de un conjunto de candidatos, útil en flujos de back-office donde la latencia importa.
- Extracción de datos de portales con interacción: navegación por listados y paginación en sitios que requieren clics reales, donde un agente de texto libre sería demasiado lento.
- Investigación en aprendizaje por refuerzo para agentes: el repositorio incluye el entorno de GRPO interactivo con Playwright y el verificador VLM, por lo que sirve como banco de pruebas reproducible para experimentos de RL en computer use.
- Prototipado de asistentes de escritorio con control de ratón y teclado: la formulación de acciones discretas calibradas permite umbralizar decisiones y añadir lógica de seguridad antes de ejecutar la acción.
- Evaluación de calibración de políticas: la pérdida de Brier y la KL analítica hacen del modelo un caso de estudio para medir la fiabilidad de las probabilidades de acción en agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del modelo no se especifica en la información proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la model card únicamente documenta el arranque mediante el script `start.sh` del repositorio de GitHub asociado.
- Latencia y throughput: la model card afirma latencia de decisión inferior al segundo gracias a la lectura de acción de un solo token, pero no se aportan mediciones concretas ni condiciones de hardware.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de arquitectura que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información pública es extremadamente escasa: no se declaran parámetros, contexto, idiomas ni formato de pesos, lo que impide evaluar su idoneidad en producción.
- El modelo está especializado en decisiones de acción sobre interfaces; no se documentan capacidades generales de generación de texto, código o matemáticas.
- No se especifican sesgos conocidos ni evaluación de seguridad; al entrenarse contra entornos web reales, puede heredar sesgos de las páginas utilizadas en el bucle de RL.
- Riesgo de alucinación de acciones: la formulación de candidatos discretos no elimina la posibilidad de seleccionar acciones incorrectas sobre la UI; la model card no reporta tasas de error.
- No se documenta el soporte multilingüe; la interacción con interfaces en idiomas distintos del usado en entrenamiento puede degradarse.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni documentación sobre procedencia de datos de entrenamiento.
- El repositorio tiene cero descargas y cero likes, y fue publicado recientemente; no hay evidencia de uso en producción ni validación independiente.
- El verificador VLM depende de un modelo Qwen externo, lo que añade requisitos de hardware y latencia al pipeline de entrenamiento, no necesariamente a la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jommarn/JEV-Computer-Use
- Repositorio de entrenamiento e inferencia: https://github.com/pidsana42-lgtm/JEV-Computer-Use
