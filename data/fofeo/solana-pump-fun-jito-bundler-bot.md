# Fofeo/solana-pump-fun-jito-bundler-bot

## Resumen

`Fofeo/solana-pump-fun-jito-bundler-bot` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es una aplicación ejecutable para Windows x64 (un supuesto bot de trading para Solana con integración de Jito y Pump.fun), distribuida como archivo ZIP de 4,8 MB con contraseña de descompresión. El repositorio no contiene pesos de ningún tipo, ni arquitectura de red neuronal, ni pipeline de inferencia; la model card es en realidad un README de instalación de software con instrucciones para ejecutar un binario `.exe` como administrador.

El autor declarado es el usuario "Fofeo" y la licencia indicada es MIT. El repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, y se creó y actualizó el 24 de noviembre de 2026. Los metadatos de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) corresponden a los idiomas en que está redactada la documentación del programa, no a capacidades lingüísticas de un modelo.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA: no hay parámetros, contexto, cuantizaciones ni benchmarks. Lo relevante aquí es advertir de la naturaleza del contenido y de los riesgos de seguridad asociados a la ejecución de binarios de procedencia no verificada que manipulan claves y transacciones financieras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicación Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (idiomas de la documentación) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`: `schedule-1-cheat-trainer-v1.2.2-win64.zip`, 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El repositorio describe un programa de escritorio para Windows x64 con módulos funcionales orientados a operativa en Solana: motor de bundles Jito/MEV, gestor de múltiples wallets mediante Lookup Tables (hasta 20 wallets), copia de operaciones de wallets "smart money", sandbox de paper trading y enrutado de órdenes por WebSocket/gRPC. La model card menciona cifras como 129 Hz de sondeo, latencias inferiores a 40 ms y "6 worker threads", pero no aporta código fuente, binarios verificables ni artefactos auditables en el repositorio de Hugging Face.

El binario se distribuye a través de enlaces a GitHub Releases de terceros (`arjunzimmermann624/schedule-1-cheat-trainer` y `Giusepper00/solana-pump-fun-jito-bundler-bot`), no desde el propio repositorio de Hugging Face. La discrepancia entre el nombre del paquete (`schedule-1-cheat-trainer`) y el del supuesto bot, junto con la contraseña fija de descompresión (`2026`) y la petición de ejecución como administrador, son indicios claros de una cadena de distribución no trazable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No dispone de tool calling, function calling ni capacidades de agente en el sentido de un LLM.
- Según su README, el programa afirmaría ofrecer: bundles Jito/MEV con tip dinámico, gestión de hasta 20 wallets en el mismo bloque, copia de operaciones de wallets de ballenas, sandbox de paper trading y enrutado de órdenes de baja latencia.
- Estas capacidades no están verificadas por código, tests ni auditoría alguna en el repositorio.
- Idiomas de la interfaz/documentación: los 14 listados en los metadatos.

## Casos de uso

- No procede evaluar casos de uso de un modelo de IA porque el artefacto no lo es.
- Escenario declarado por el autor: automatización de compra/venta de tokens en Pump.fun con inclusión atómica vía Jito. No se puede recomendar su uso: implica manejar claves privadas de wallets y fondos reales con software de procedencia no verificada.
- Escenario declarado: copia de operaciones de wallets de ballenas. Requiere acceso a claves y APIs de terceros, con riesgo elevado de robo de fondos.
- Escenario declarado: simulación de estrategias (paper trading). Sería el único uso con riesgo financiero bajo, pero sigue requiriendo ejecutar un binario no auditado en la máquina del usuario.
- Uso legítimo alternativo: ninguna aplicación de IA, ya que no hay pesos ni pipeline.
- Uso como referencia: consultar la model card únicamente como ejemplo de repositorio mal etiquetado en Hugging Face, útil para estudiar patrones de distribución sospechosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de ningún tipo; las cifras de latencia y consistencia que aparecen en la model card (sub-40 ms, 98,3 %, 129 Hz) son afirmaciones del autor sin evidencia adjunta.

## Requisitos de hardware

- Plataforma declarada: Windows 10 u 11 de 64 bits.
- VRAM: no aplica (no hay modelo neuronal).
- GPU: no aplica.
- CPU/RAM: no especificados en la información disponible.
- Despliegue: ejecución directa del binario `schedule-1-cheat-trainer-v1.2.2-win64.exe` como administrador, según el README. No hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo.
- Latencia y throughput: solo cifras declaradas por el autor, sin metodología ni reproducibilidad.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de la categoría "software de trading en Solana", no se dispone de información verificable sobre alternativas en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de seguridad alto: distribución de un `.exe` comprimido con contraseña fija, alojado en repositorios de GitHub de terceros no vinculados al autor del repositorio de Hugging Face, con instrucciones para ejecutarlo como administrador.
- Posible malware o stealer de claves: un programa que opera con wallets de Solana necesita claves privadas; la ejecución de binarios no auditados en ese contexto puede provocar la pérdida total de fondos.
- Nombre incoherente: el paquete se llama `schedule-1-cheat-trainer`, lo que sugiere reutilización de una plantilla de distribución ajena y refuerza la sospecha de artefacto fraudulento.
- Cero señales de confianza: 0 descargas, 0 likes, sin código fuente, sin issues, sin historial de versiones verificable.
- Licencia MIT declarada, pero sin archivo LICENSE ni código en el repositorio que permita verificar su aplicabilidad.
- Posible incumplimiento de las políticas de Hugging Face sobre contenido no relacionado con modelos y sobre distribución de software potencialmente malicioso.
- No usar en producción bajo ninguna circunstancia sin auditoría independiente del binario y del canal de distribución.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Fofeo/solana-pump-fun-jito-bundler-bot
- Release de GitHub referenciada en la model card (terceros, no verificada): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Repositorio de GitHub referenciado en la model card (terceros, no verificado): https://github.com/Giusepper00/solana-pump-fun-jito-bundler-bot/releases/latest
