# indahl/indahl-margin

## Resumen

`indahl/indahl-margin` no es un modelo de lenguaje, sino un plugin para Claude Code publicado por Heuremen LLC bajo licencia MIT. Su función es el análisis de sensibilidad de una conclusión frente a la variación de un parámetro clave: dado un resultado, una predicción o un diseño que depende de un número ajustado, el plugin calcula en qué punto ese parámetro rompe la conclusión y compara el margen obtenido con la incertidumbre declarada del propio parámetro.

La herramienta devuelve dos elementos: el punto de ruptura (el valor del parámetro a partir del cual la conclusión deja de sostenerse) y un veredicto en tres categorías (ROBUST, FRAGILE o CANNOT_TELL), según si el margen supera o no la incertidumbre declarada. Está pensada para usarse antes de una ejecución costosa, una preregistración o una decisión de lanzamiento, o cuando un resultado descansa sobre un único número ajustado.

El plugin se invoca dentro de Claude Code mediante el comando `/margin` y no requiere dependencias externas ni contacta servicios remotos: opera en la sesión del usuario y solo abre las fuentes que se le indiquen. Fue propuesto y especificado por Sage, árbitro externo de Heuremen LLC, el 13 de noviembre de 2026, y renombrado ese mismo día desde `indahl-slack` para evitar que se confundiera con una integración de Slack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin para Claude Code, no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del contexto de la sesión de Claude Code) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no aplica; se distribuye como plugin de Claude Code) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado con pesos, sino de una skill empaquetada como plugin de Claude Code. La model card no describe arquitectura de red neuronal, dataset de entrenamiento, número de tokens ni proceso de alineación (RLHF/DPO), porque no existen: la lógica del plugin se ejecuta sobre el modelo subyacente de Claude Code en la sesión del usuario.

La innovación funcional es el procedimiento de análisis de margen: identifica el parámetro crítico de una conclusión, calcula su punto de ruptura y lo contrasta con la incertidumbre declarada para emitir un veredicto categórico. El plugin se distribuye a través del marketplace de plugins de Heuremen LLC y su código fuente está disponible en el repositorio de GitHub del autor.

## Capacidades

- Análisis de sensibilidad de una conclusión respecto a un parámetro clave, con cálculo del punto de ruptura.
- Emisión de veredicto en tres categorías: ROBUST (margen mayor que la incertidumbre), FRAGILE (margen menor que la incertidumbre) y CANNOT_TELL (no hay información suficiente para decidir).
- Invocación mediante el comando `/margin` seguido de la afirmación a comprobar.
- Ejecución local dentro de la sesión de Claude Code, sin dependencias externas.
- Sin contacto con servicios remotos; solo accede a las fuentes que el usuario indique.
- Soporte de tool calling y agentes: heredado de Claude Code, no documentado de forma específica en la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Validación previa a una preregistración: antes de registrar un estudio, se ejecuta `/margin` sobre la hipótesis principal para comprobar si el tamaño de efecto asumido soporta variaciones razonables del parámetro crítico.
- Decisión de lanzamiento de producto: si el lanzamiento depende de una mejora de conversión del 4 %, el plugin calcula a partir de qué valor la decisión deja de ser rentable y lo compara con el intervalo de confianza del experimento.
- Revisión de resultados experimentales: cuando una conclusión descansa sobre un único número ajustado (por ejemplo, un umbral de clasificación), el plugin identifica el punto de ruptura y emite un veredicto ROBUST o FRAGILE.
- Control de calidad en pipelines de análisis: integrado en la fase de revisión de un informe, detecta afirmaciones frágiles antes de que se publiquen o se usen para tomar decisiones.
- Evaluación de modelos y benchmarks: antes de declarar que un modelo supera a otro, se comprueba cuánto puede moverse la métrica clave antes de que la comparación se invierta.
- Auditoría de decisiones empresariales: en comités de inversión o planificación, se contrasta la robustez de las proyecciones frente a la incertidumbre declarada de sus supuestos.
- Formación y revisión metodológica: sirve como herramienta didáctica para que investigadores y analistas interioricen la diferencia entre margen de seguridad e incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el plugin no ejecuta pesos propios y se apoya en el modelo subyacente de Claude Code.
- GPU recomendadas: no aplica; el cómputo lo realiza la infraestructura de Claude Code.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: instalación mediante el marketplace de plugins de Claude Code (`/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-margin@heuremen`).
- Latencia y throughput: no disponibles; dependen del modelo subyacente y de la complejidad del análisis solicitado.

## Comparativa con modelos similares

| Herramienta | Tipo | Función | Licencia | Disponibilidad |
|---|---|---|---|---|
| indahl-margin | Plugin de Claude Code | Análisis de margen y punto de ruptura con veredicto | MIT | Hugging Face y GitHub |
| Análisis de sensibilidad manual (Sobol, one-at-a-time) | Metodología estadística | Exploración de sensibilidad de parámetros | No aplica | Implementaciones en R/Python |
| Pruebas de robustez ad hoc en notebooks | Scripts personalizados | Verificación puntual de conclusiones | Variable | No estandarizada |

No se dispone de información sobre modelos o herramientas directamente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, código, matemáticas ni visión; su alcance se limita al análisis de margen descrito.
- El veredicto CANNOT_TELL indica que el plugin no dispone de información suficiente; no debe interpretarse como una validación de la conclusión.
- La calidad del análisis depende de que el usuario proporcione la incertidumbre declarada del parámetro; si esta es incorrecta, el veredicto será engañoso.
- No se documentan sesgos conocidos, pero al operar sobre el modelo subyacente de Claude Code hereda los sesgos y el riesgo de alucinación de este.
- Idiomas soportados no disponibles; la model card está redactada en inglés.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución, sin restricciones adicionales documentadas.
- El plugin solo abre las fuentes que el usuario le indique; no contacta servicios remotos, lo que limita su alcance a la información disponible en la sesión.
- La fecha de creación indicada (2026-11-15) es futura respecto a la información de referencia; conviene verificar la vigencia del repositorio antes de adoptarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-margin
- Repositorio GitHub: https://github.com/Heuremen-LLC/indahl-margin
- Código fuente del plugin: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/margin
- Sitio del autor: https://indahl.ai
- Política de privacidad: https://indahl.ai/privacy
- Términos de uso: https://indahl.ai/terms
