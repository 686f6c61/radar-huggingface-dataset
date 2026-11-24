# ibrahim8844/shuriken-solana-evm-sniper-bot

## Resumen

`ibrahim8844/shuriken-solana-evm-sniper-bot` es un repositorio alojado en Hugging Face que, pese a su identificador y a las etiquetas de la plataforma, no contiene un modelo de inteligencia artificial. La model card describe un supuesto ejecutable para Windows x64 denominado `fisch-script-auto-catch-macro-v1.2.2-win64.exe` (build `v1.9.4`, código `0A5E47`), distribuido como archivo ZIP de 4,8 MB con contraseña de extracción `2026` y alojado en un repositorio de GitHub de terceros. No se declara arquitectura neuronal, número de parámetros, longitud de contexto ni formato de pesos.

El contenido se presenta como un bot de trading con funcionalidades de "sniper" sobre Solana y EVM: enrutado de órdenes, filtros antihaneypot, motor de bundles Jito/MEV, bóveda local de claves AES-256 y agrupación de 20 carteras mediante Lookup Tables. Se trata, por tanto, de una aplicación de escritorio empaquetada, no de un modelo de lenguaje ni de un sistema de IA generativa, por lo que las métricas habituales de esta ficha (parámetros, contexto, benchmarks) no son aplicables.

La relevancia de esta entrada es fundamentalmente de advertencia: el repositorio presenta indicios claros de distribución de software potencialmente malicioso (ejecutable con privilegios de administrador, archivo comprimido protegido con contraseña para evadir análisis automáticos, enlaces a repositorios de GitHub no verificados y discrepancia entre el nombre del proyecto y el del binario). No debe confundirse con un modelo open source evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como aplicación nativa Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye como ZIP con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe un binario Windows x64 (`fisch-script-auto-catch-macro-v1.2.2-win64.exe`, build `v1.9.4`, identificador `0A5E476A37`) que, según el autor, implementa módulos de ejecución de operaciones en cadenas Solana y EVM. Las supuestas características técnicas incluyen enrutado de órdenes con latencia inferior a 40 ms, sondeo a 128 Hz para el motor de bundles Jito/MEV, sondeo a 174 Hz para el agrupador de 20 carteras con Lookup Tables, filtro antihaneypot con tiempo de respuesta inferior a 8 ms, uso de memoria inferior a 54 MB y seis hilos de trabajo.

No se aporta información sobre datasets, tokens de entrenamiento, técnicas de alineación (RLHF, DPO) ni innovaciones en decodificación. La única "innovación" declarada es de índole operativa (ejecución multi-cartera en el mismo bloque, firma local no custodial), no algorítmica.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- Según la model card, ejecutaría operaciones de trading automatizado en Solana y EVM (compras anticipadas o "sniping").
- Filtro previo a la compra de tokens con honeypot, verificación de autoridades de mint/freeze y bloqueo de liquidez.
- Motor de bundles Jito/MEV con inclusión atómica en bloque y dimensionamiento dinámico de propinas.
- Bóveda local de claves AES-256 con firma no custodial.
- Agrupación de hasta 20 carteras mediante Lookup Tables para ejecución en el mismo bloque.
- Interfaz de usuario en 14 idiomas según los metadatos.

Ninguna de estas capacidades está verificada de forma independiente ni respaldada por documentación técnica reproducible.

## Casos de uso

- Evaluación de seguridad de la cadena de suministro: el repositorio sirve como caso de estudio para formar a equipos en la detección de artefactos sospechosos en Hugging Face (binarios con contraseña, enlaces externos, discrepancias de nombre).
- Análisis de malware en entorno aislado: un investigador podría extraer el ZIP en una máquina virtual sin red y con instantánea previa para caracterizar el binario, sin ejecutarlo en producción.
- Concienciación sobre riesgos de trading automatizado: el material ilustra patrones habituales de ingeniería social en el sector de las criptomonedas (promesas de latencia submilisegundo, descargas "gratuitas").
- Monitorización de repositorios de la plataforma: permite ejemplificar reglas de filtrado para pipelines que ingieren modelos desde Hugging Face y deben descartar artefactos que no son pesos.
- Formación en respuesta a incidentes: sirve para practicar el aislamiento de un host comprometido tras la ejecución de un ejecutable con privilegios de administrador.
- Documentación de políticas internas: útil como referencia para redactar listas de denegación de descargas en entornos corporativos.

No se recomienda su uso para ninguna finalidad funcional real de trading.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (menos de 40 ms de enrutado, 98,9 % de consistencia, 128 Hz y 174 Hz de sondeo, menos de 54 MB de RAM) son afirmaciones del autor sin metodología, sin entorno de prueba y sin verificación externa; no constituyen benchmarks reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10/11 de 64 bits.
- Memoria RAM declarada por el autor: menos de 54 MB durante la ejecución de los módulos descritos.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: solo cifras del autor, no verificadas; ver sección de benchmarks.

## Comparativa con modelos similares

No procede una comparativa con modelos de IA. A modo de contraste con otras entradas de la misma plataforma:

| Criterio | Este repositorio | Modelo de lenguaje típico en HF | Bot de trading comercial |
|---|---|---|---|
| Naturaleza | Ejecutable Windows empaquetado | Pesos neuronales | Servicio alojado |
| Pesos publicados | No | Sí (safetensors, GGUF) | No |
| Parámetros / contexto | No aplica | Documentados | No aplica |
| Verificabilidad | Nula (ZIP con contraseña) | Reproducible | Auditoría contractual |
| Licencia | MIT (declarada) | Variable | Propietaria |
| Riesgo para el usuario | Alto | Bajo o medio | Medio (riesgo financiero) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe inventariarse como tal ni evaluarse con métricas de NLP.
- Indicios de riesgo elevado: binario `.exe` que se solicita ejecutar como administrador, archivo ZIP protegido con contraseña (técnica habitual para evadir análisis de antivirus y sandboxes) y enlaces de descarga alojados en repositorios de GitHub de terceros no vinculados al autor declarado.
- Discrepancia de nombres: el proyecto se anuncia como bot de trading, pero el binario se llama `fisch-script-auto-catch-macro`, lo que sugiere reutilización de artefactos ajenos.
- Cero descargas y cero "likes" en el momento de la consulta, frente a las "854K+ descargas" que afirma la model card: contradicción que refuerza la sospecha de contenido engañoso.
- Licencia MIT declarada, pero sin archivo de licencia verificable ni titularidad clara; no debe asumirse permiso de uso comercial sobre el binario.
- Riesgo financiero intrínseco: cualquier herramienta de "sniping" implica pérdida potencial de fondos y exposición de claves privadas; la supuesta bóveda local AES-256 no está auditada.
- Posible incumplimiento de las condiciones de uso de Hugging Face y de las políticas de las cadenas de bloques objetivo.
- No debe ejecutarse en entornos corporativos, con carteras reales ni en máquinas con datos sensibles. Si se analiza, hacerlo en una VM desechable sin red y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ibrahim8844/shuriken-solana-evm-sniper-bot
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/AlessiaPolyakov/shuriken-solana-evm-sniper-bot
- Paper, blog técnico, demo o repositorio oficial del modelo: no disponible.
