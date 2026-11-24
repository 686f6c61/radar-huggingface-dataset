# daffy0208/bybit-binance-perp-copytrade-bot-win11

## Resumen

No se ha publicado ningún modelo de inteligencia artificial en el repositorio `daffy0208/bybit-binance-perp-copytrade-bot-win11`. El contenido alojado en Hugging Face es una model card que distribuye un supuesto binario ejecutable para Windows 11 de 64 bits, empaquetado en un archivo ZIP de 8,9 MB y protegido con la contraseña `2026`, que se presenta como un bot de copytrading de perpetuos entre Bybit y Binance. No existe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociado.

El artefacto no resuelve ningún problema de procesamiento de lenguaje ni de aprendizaje automático: sus etiquetas (`windows`, `windows-11`, `x64`, `portable`) describen un ejecutable de escritorio, no un modelo. La model card incluye instrucciones para descargar el ZIP desde un repositorio de GitHub de terceros, extraerlo con contraseña y ejecutarlo como administrador, además de indicaciones para desactivar las advertencias de Windows Defender y SmartScreen.

Desde la perspectiva de la evaluación de modelos, esta ficha no puede completarse con datos técnicos reales porque no los hay. Los apartados siguientes reflejan esa ausencia de forma explícita y señalan los riesgos de seguridad asociados a la distribución de binarios cerrados con instrucciones para eludir controles del sistema operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card, referidos a la documentación del ejecutable, no a capacidades lingüísticas de un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de 8,9 MB) |

## Arquitectura y entrenamiento

No aplica. No se describe ninguna arquitectura de red neuronal, conjunto de datos de entrenamiento, proceso de ajuste fino, RLHF, DPO ni innovación técnica de inferencia. El artefacto es un ejecutable compilado para Windows x64 cuyo contenido interno no es verificable a partir de la información proporcionada.

La model card menciona módulos funcionales del supuesto bot (motor de bundles Jito/MEV, enrutamiento de órdenes con latencia inferior a 40 ms, filtro de honeypots, almacén local de claves AES-256) y cifras como 169 Hz de sondeo o 98,3 % de consistencia, pero no aporta metodología, código fuente ni artefactos reproducibles que permitan validarlas.

## Capacidades

- No se trata de un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No dispone de soporte de tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni comportamiento agente basado en un modelo fundacional.
- Las capacidades declaradas por el autor son las de un supuesto bot de trading: copia de operaciones en perpetuos, gestión de take profit por niveles, simulación en papel y verificación de contratos.
- Estas capacidades no están verificadas de forma independiente y no pueden confirmarse a partir de los metadatos del repositorio.

## Casos de uso

- No se identifican casos de uso legítimos de evaluación de modelos, ya que el artefacto no es un modelo.
- El uso previsto por el autor sería la automatización de operaciones de copytrading en perpetuos, un escenario con riesgo financiero directo y sin garantías de funcionamiento verificadas.
- Un analista podría emplear este repositorio como ejemplo de distribución de binarios no auditables en plataformas de modelos, para documentar patrones de riesgo en la cadena de suministro.
- Un equipo de seguridad podría usar la model card como muestra de ingeniería social orientada a la ejecución de ejecutables con privilegios elevados.
- Un investigador de políticas de plataforma podría estudiar la convivencia de artefactos no relacionados con IA en catálogos de modelos.
- En ningún caso se recomienda su ejecución en entornos de producción, personales o con acceso a claves de exchange.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere VRAM ni GPU: no es un modelo de inferencia.
- Requiere un sistema Windows 10 u 11 de 64 bits, según la model card.
- El autor declara un consumo inferior a 36 MB de RAM en ejecución, dato no verificado.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI.
- No se dispone de mediciones independientes de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Cualquier comparación con modelos de lenguaje, de visión o multimodales sería improcedente.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la ficha de Hugging Face se emplea para distribuir un ejecutable de terceros.
- La descarga se redirige a un repositorio de GitHub ajeno a Hugging Face, lo que impide verificar la integridad y procedencia del binario.
- La instrucción de ejecutar el `.exe` como administrador y de desactivar Windows Defender y SmartScreen supone un riesgo elevado de seguridad.
- El uso de una contraseña fija (`2026`) para el ZIP reduce la trazabilidad y dificulta el análisis automatizado del contenido.
- No hay código fuente publicado, ni compilación reproducible, ni auditoría independiente.
- Las afirmaciones de rendimiento (latencia inferior a 40 ms, 98,3 % de consistencia, 169 Hz de sondeo) carecen de metodología y de evidencia.
- El uso de un bot de trading conlleva riesgo de pérdida de capital, y la gestión de claves de exchange en un binario no auditado agrava ese riesgo.
- La licencia MIT declarada se refiere al repositorio, no necesariamente al binario distribuido desde un dominio externo.
- No se recomienda su uso en producción, ni en equipos con acceso a carteras de criptomonedas, ni en entornos corporativos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/daffy0208/bybit-binance-perp-copytrade-bot-win11
- Repositorio de GitHub citado en la model card: https://github.com/RobertMitsotakis/bybit-binance-perp-copytrade-bot-win11
- Enlace de descarga directa citado en la model card: https://github.com/RobertMitsotakis/bybit-binance-perp-copytrade-bot-win11/releases/latest/download/bybit-binance-perp-copytrade-bot-win11-v1.2.0-win64.zip
- Paper, blog, demo o repositorio de código del modelo: no disponible
