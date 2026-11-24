# Rootless67/solana-pump-fun-jito-bundler-bot

## Resumen

`Rootless67/solana-pump-fun-jito-bundler-bot` es un repositorio alojado en Hugging Face que, pese a su identificador y a las etiquetas de la plataforma, no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows 10 y Windows 11 (x64) distribuido como archivo ZIP de 4,8 MB que, según su model card, implementa un bot de trading para el ecosistema Solana, con módulos orientados a la plataforma Pump.fun, a los bundles de Jito y a la ejecución multi-cartera mediante Lookup Tables.

El artefacto se presenta como una aplicación portable sin dependencias externas, con un ejecutable denominado `fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe` y build `v4.9.9 (FC1988)`. La model card describe subsistemas de filtrado de honeypots, sandbox de paper trading, copia de operaciones de carteras de ballenas, take profit escalonado y un motor de bundles Jito con dimensionamiento dinámico de propinas. No se declara ninguna arquitectura de red neuronal, número de parámetros, longitud de contexto ni proceso de entrenamiento.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de lenguaje: la información disponible no permite verificar capacidades de generación de texto, razonamiento o código. La relevancia del repositorio es nula desde el punto de vista de la IA open source, y su interés se limita al ámbito de herramientas financieras automatizadas, con las advertencias de seguridad que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como ZIP con binario `.exe` para Windows) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red neuronal, composición del dataset ni proceso de entrenamiento (RLHF, DPO u otros), porque el artefacto no es un modelo entrenado. La model card describe exclusivamente un conjunto de módulos de ejecución para trading en Solana: filtro pre-compra de honeypots con verificación de autoridades de mint/freeze y bloqueo de LP, sandbox de paper trading contra libros de órdenes en vivo, copia de operaciones de carteras de ballenas, take profit multinivel con trailing stop, bundler de 20 carteras mediante Lookup Tables y motor de bundles Jito con propinas dinámicas. Los tiempos de respuesta declarados oscilan entre menos de 6 ms y menos de 23 ms según el módulo, y el sondeo del filtro de honeypots se cifra en 180 Hz. Estos datos proceden únicamente de la model card y no han sido verificados de forma independiente.

## Capacidades

- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de tool calling ni de function calling en el sentido de los modelos de lenguaje.
- No se declara soporte de agentes ni de razonamiento multi-paso basado en LLM.
- La model card enumera funcionalidades de trading automatizado: filtrado de honeypots, paper trading, copia de ballenas, take profit escalonado, bundling multi-cartera y envío de bundles Jito.
- Los idiomas listados en los metadatos (14 idiomas) corresponden a la declaración del repositorio, no a capacidades lingüísticas verificadas de un modelo.

## Casos de uso

- Simulación de estrategias sin riesgo: el módulo de paper trading permitiría probar configuraciones contra libros de órdenes en vivo antes de operar con capital real, según la descripción del autor.
- Automatización de salidas escalonadas: el take profit multinivel con trailing stop se orientaría a la gestión sistemática de posiciones abiertas.
- Ejecución atómica multi-cartera: el bundler de 20 carteras con Lookup Tables se plantea para operaciones coordinadas en el mismo bloque.
- Envío de transacciones con prioridad: el motor de bundles Jito con propina dinámica se destinaría a mejorar la inclusión en bloque en la red Solana.
- Réplica de carteras de ballenas: el módulo de copia de operaciones replicaría posiciones de carteras monitorizadas con dimensionamiento proporcional.
- Filtrado previo de tokens: la verificación de autoridades de mint/freeze y de bloqueo de liquidez se usaría como criba antes de cualquier compra.

Ninguno de estos casos puede validarse con la información disponible; se recogen tal como los describe la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, al no ser un modelo de IA.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Tamaño del paquete: 4,8 MB (ZIP), con ejecutable portable sin dependencias externas según el autor.
- Opciones de despliegue: ejecución directa del binario `.exe` en Windows; no se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card cita tiempos de respuesta de menos de 6 ms a menos de 23 ms por módulo y sondeo a 180 Hz; no verificados.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de lenguaje y no existen alternativas comparables en la categoría de modelos de IA. Las herramientas de trading automatizado en Solana constituyen un dominio distinto y no se dispone de datos verificables para establecer una comparación técnica.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: las etiquetas de Hugging Face y el identificador pueden inducir a confusión.
- Señales claras de riesgo de seguridad: el binario se distribuye mediante enlaces a repositorios de GitHub de terceros, no a través de la infraestructura de Hugging Face, e incluye una contraseña de descompresión fija (`2026`), un patrón habitual en campañas de distribución de malware.
- El nombre del ejecutable (`fisch-script-auto-catch-macro-2026`) no guarda relación con la funcionalidad declarada, lo que sugiere contenido reciclado o suplantación.
- Se solicita ejecutar el binario como administrador, lo que amplía el impacto potencial de cualquier código malicioso.
- No hay verificación independiente de los tiempos de respuesta, la tasa de descargas ni los módulos anunciados.
- Uso en producción desaconsejado: no debe ejecutarse en sistemas con carteras de criptomonedas, claves privadas o credenciales.
- La licencia MIT declarada no exime de responsabilidad sobre el contenido del binario ni garantiza su integridad.
- Riesgo de fraude financiero: las herramientas de trading automatizado con promesas de baja latencia son un vector frecuente de estafas y de robo de fondos.
- No se dispone de información sobre sesgos, alucinación o limitaciones idiomáticas porque no hay modelo subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Rootless67/solana-pump-fun-jito-bundler-bot
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Releases citadas en la model card (GitHub de terceros): https://github.com/onurcatalano5862/solana-pump-fun-jito-bundler-bot/releases/latest
