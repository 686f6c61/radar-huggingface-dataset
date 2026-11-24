# mono11111/bybit-binance-perp-copytrade-bot-pc

## Resumen

La entrada `mono11111/bybit-binance-perp-copytrade-bot-pc` alojada en Hugging Face no es un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable de Windows (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) presentado como bot de copytrading de perpetuos para Bybit y Binance. El autor lo publica bajo licencia MIT y lo etiqueta con lenguajes y plataformas, pero no incluye pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

No existe información sobre arquitectura, parámetros, contexto o entrenamiento porque el artefacto no es un modelo entrenado. La model card es un texto promocional con enlaces a binarios alojados en repositorios de GitHub de terceros, una contraseña de extracción (`2026`) y afirmaciones de rendimiento (latencia sub-40 ms, bóveda AES-256, motor MEV) que no vienen acompañadas de código fuente verificable ni de resultados reproducibles.

Desde la perspectiva de un evaluador técnico, esta ficha debe interpretarse como una advertencia: el repositorio no contiene un modelo evaluable y presenta múltiples señales de riesgo (binario ofuscado, contraseña en el archivo, ejecución como administrador, nombres de fichero incoherentes con el producto anunciado). Cualquier uso en producción requeriría auditoría independiente del binario, algo que queda fuera del alcance de esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del autor) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO u otros). El contenido descrito en la model card es un ejecutable nativo para Windows 10/11 x64, distribuido como archivo comprimido de 4,8 MB, sin código fuente asociado en el propio repositorio de Hugging Face.

Las afirmaciones técnicas de la model card (bóveda de claves AES-256 local, enrutamiento de órdenes sub-40 ms, motor de bundles Jito/MEV, filtro antihoneypot, bundler de 20 wallets con Lookup Tables) no están respaldadas por documentación técnica, repositorio de código abierto ni benchmarks reproducibles. No es posible verificar su implementación ni su corrección.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No dispone de soporte de tool calling ni de function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni comportamiento de agente basado en IA.
- Las etiquetas multilingües del autor no implican capacidades lingüísticas del artefacto; probablemente describen la localización de la interfaz del supuesto bot.
- La model card atribuye al binario funciones de trading (take profit multinivel, enrutamiento de órdenes, gestión de claves locales, filtro de tokens), pero ninguna es verificable desde el repositorio.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque el artefacto no lo es. Los escenarios que la model card sugiere (copytrading de perpetuos, ejecución automatizada de órdenes, gestión de claves) conllevan riesgos financieros y de seguridad significativos y no deberían adoptarse sin auditoría del binario por parte de un equipo de seguridad independiente.

- Auditoría de seguridad de binarios: un analista podría usar el ZIP como muestra para estudiar técnicas de empaquetado y ofuscación, siempre en un entorno aislado y sin ejecución en producción.
- Investigación de campañas de distribución de software no verificado: el repositorio sirve como ejemplo de patrón de publicación (contraseña en el archivo, enlaces a repositorios de terceros, nombres de fichero incoherentes) para formación en concienciación.
- Análisis de metadatos de Hugging Face: útil para estudiar cómo se etiquetan repositorios que no son modelos, con fines de moderación o catalogación.
- Formación en detección de fraudes: el texto de la model card puede emplearse como caso práctico de señales de alarma en supuestas herramientas financieras.
- Evaluación de políticas de licencia: sirve para discutir cómo una licencia MIT aplicada a un binario no verificado no aporta garantías de seguridad ni de calidad.
- Documentación de riesgos en plataformas de modelos: permite ilustrar la necesidad de controles de publicación para artefactos que no son modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (sub-40 ms, 166 Hz, 98,6 % de consistencia, 12 hilos) no están respaldadas por metodología, código ni datos reproducibles, por lo que no se recogen como resultados válidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama, TGI no son relevantes aquí).
- Requisitos del artefacto según el autor: Windows 10/11 x64, ejecución como administrador, extracción con contraseña `2026`.
- Latencia y throughput: no verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Compararlo con LLM open source (Llama, Mistral, Qwen, DeepSeek) carecería de sentido técnico.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal en un catálogo o pipeline es un error de clasificación.
- El binario se distribuye comprimido con contraseña y se solicita ejecutarlo como administrador: patrón habitual en campañas de malware.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros con nombres incoherentes respecto al producto anunciado (`monster-hunter-wilds-trainer-mod-2026` frente a un supuesto bot de trading).
- No hay código fuente, ni firma del binario, ni hashes publicados para verificación de integridad.
- Las afirmaciones de rendimiento y seguridad (AES-256, MEV, sub-40 ms) no son auditables.
- Riesgo financiero elevado: un bot de trading que opere con claves reales puede provocar pérdidas patrimoniales.
- La licencia MIT del repositorio no otorga ninguna garantía sobre el binario distribuido ni sobre su comportamiento en ejecución.
- Sesgos conocidos y riesgo de alucinación: no aplica al no ser un modelo generativo; el equivalente aquí es la desinformación presente en la model card.
- No debe desplegarse en entornos de producción ni en máquinas con acceso a claves de exchange.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mono11111/bybit-binance-perp-copytrade-bot-pc
- Enlace de descarga citado en la model card (repositorio de terceros, no verificado): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado como alternativo (no verificado): https://github.com/amaxwell46/bybit-binance-perp-copytrade-bot-pc/releases/latest
- Paper, blog o demo oficial: no disponible.
