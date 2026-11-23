# gcm365notes/exchange-deleted-item-recovery-notes

## Resumen

El repositorio `gcm365notes/exchange-deleted-item-recovery-notes` no contiene un modelo de inteligencia artificial. Se trata de un repositorio de documentación que aloja una breve nota administrativa sobre Microsoft 365 y Exchange, en concreto sobre la configuración de la recuperación de elementos eliminados y de la recuperación de elementos individuales en buzones de correo. El autor es el usuario `gcm365notes` y el contenido se publica bajo licencia CC BY 4.0.

El texto describe el flujo de eliminación de un mensaje en Outlook (Deleted Items, Recoverable Items y desaparición definitiva) y recomienda revisar el periodo de retención de elementos eliminados, activar la recuperación de elementos individuales y ampliar la ventana de recuperación (por ejemplo, de los 14 días habituales a 30 días) cuando la licencia lo permita. También advierte de que esta configuración no sustituye a una copia de seguridad ni a una retención por litigio.

Dado que no existen pesos, arquitectura ni artefactos de inferencia, esta ficha documenta la ausencia de un modelo y recoge los datos disponibles del repositorio, sin atribuirle capacidades de generación de texto, razonamiento ni ninguna otra función propia de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; repositorio de documentación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (el repositorio no contiene archivos de modelo) |

## Arquitectura y entrenamiento

No aplica. El repositorio es de solo documentación y no incluye arquitectura de red neuronal, datos de entrenamiento, proceso de ajuste (RLHF, DPO u otros) ni innovaciones técnicas de inferencia. La model card del autor indica explícitamente que se trata de una nota administrativa breve sobre Microsoft 365 y que no hay archivos de modelo.

El contenido técnico del documento se limita a recomendaciones de configuración de Exchange: revisar el periodo de retención de elementos eliminados, activar la recuperación de elementos individuales, probar la recuperación en un buzón antes de aplicar el cambio de forma generalizada y documentar conjuntamente los ajustes de recuperación y de retención por litigio.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No dispone de soporte de tool calling ni de function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües propias de un modelo; el contenido está redactado en inglés.
- No incluye modo de pensamiento, visión, audio ni ninguna otra modalidad.
- Su única función es servir como nota de referencia sobre la configuración de recuperación de elementos eliminados en Exchange y Microsoft 365.

## Casos de uso

- Consulta de referencia para administradores de Microsoft 365: la nota describe qué ajustes de Exchange determinan si un correo eliminado puede recuperarse, y puede usarse como recordatorio al revisar la configuración de un tenant pequeño.
- Definición de una ventana de retención razonable: el documento propone 30 días como punto de partida práctico frente a los 14 días habituales, siempre que la licencia lo permita, lo que sirve de guía para dimensionar la política de recuperación.
- Activación de la recuperación de elementos individuales: la nota explica que esta opción permite restaurar un mensaje eliminado de Recoverable Items dentro de la ventana configurada, útil como lista de comprobación en tareas de administración.
- Prueba de recuperación en un buzón piloto: recomienda eliminar un mensaje, purgarlo de Deleted Items y confirmar que un administrador puede recuperarlo antes de aplicar el cambio de forma generalizada.
- Comunicación interna a empleados: el texto sugiere informar al personal, en una frase, durante cuánto tiempo se puede recuperar el correo eliminado, para evitar suposiciones de recuperación indefinida.
- Documentación conjunta de recuperación y retención: la nota insiste en no acortar los periodos de retención por litigio o de políticas de retención al ajustar la recuperación, lo que resulta útil para redactar procedimientos internos coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, ya que no hay pesos ni modelo que ejecutar.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA, sino documentación administrativa sobre Microsoft 365.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un artefacto de inferencia: no puede utilizarse para generar texto, código ni respuestas.
- El contenido es una nota administrativa breve y no constituye una guía completa de recuperación ante desastres.
- El propio autor advierte de que la recuperación de elementos individuales no protege frente a un desastre a nivel de tenant ni sustituye a una copia de seguridad de terceros.
- No debe acortarse un periodo de retención por litigio o de una política de retención para "ordenar" la configuración; los ajustes de recuperación y de retención deben documentarse conjuntamente.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el contenido no incluye garantías técnicas ni soporte.
- El repositorio no registra descargas ni likes y no dispone de pipeline declarado; su valor es puramente documental.
- El texto incluye una referencia comercial a una empresa de servicios IT (Call IT Mate, Loganholme QLD) que conviene tratar como contenido promocional del autor, no como recomendación técnica independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gcm365notes/exchange-deleted-item-recovery-notes
- Referencia comercial citada en la model card: https://callitmate.com.au/services-areas/gold-coast-it-support/
