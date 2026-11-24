# EDGARCHETOS/photon-sol-sniper-bot

## Resumen

El repositorio identificado como `EDGARCHETOS/photon-sol-sniper-bot` no contiene un modelo de inteligencia artificial. Se trata de una publicacion en Hugging Face que distribuye un supuesto binario ejecutable para Windows (`photon-sol-sniper-bot-v1.2.0-win64.exe`) empaquetado en un archivo ZIP protegido con contrasena, orientado a la operativa automatizada de trading de criptomonedas en la red Solana (copytrade de "smart money", bundles Jito/MEV, sniper de lanzamientos de tokens).

La model card no describe ninguna arquitectura neuronal, pesos, tokenizador ni proceso de entrenamiento: es material promocional de un programa de escritorio. No hay pipeline declarado, no hay descargas ni interacciones registradas y la fecha de creacion indicada (2026-11-24) es futura respecto a la redaccion de esta ficha, lo que resulta anomala.

Desde la perspectiva de evaluacion de modelos, esta ficha debe interpretarse como una advertencia: el artefacto no es evaluable como modelo de IA y presenta multiples senales de riesgo de seguridad (binario opaco, contrasena en el propio README, instrucciones para desactivar avisos de SmartScreen y ejecutar como administrador). No se recomienda su descarga ni ejecucion en entornos de produccion o de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como aplicacion de escritorio x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio; no implica capacidad linguistica real del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 8,9 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe funcionalidades de un programa de trading: copytrade de carteras de ballenas, sandbox de paper trading sobre libros de ordenes en vivo, motor de bundles Jito/MEV con dimensionado dinamico de propinas, almacen de claves local AES-256, bundler de 20 wallets mediante Lookup Tables y un filtro pre-compra de honeypots basado en verificacion de autoridades de mint/freeze y bloqueo de liquidez.

Las unicas cifras tecnicas declaradas son de consumo de recursos del ejecutable (por ejemplo, menos de 27 MB de RAM para el sandbox y menos de 37 MB para el motor de bundles, con 11 hilos de trabajo) y porcentajes de "consistencia" sin metodologia de medicion (98,4 % y 98,7 %). No se especifican tokens de entrenamiento, composicion de dataset, RLHF, DPO ni ninguna innovacion de inferencia, porque no aplica.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en modelos.
- Funcionalidad declarada (no verificada): copytrade de wallets, paper trading, construccion de bundles Jito/MEV, gestion local de claves, bundling multi-wallet y filtrado de honeypots.
- Capacidades multilingues: no aplicables; los idiomas listados son etiquetas del repositorio.
- Capacidades especiales: ninguna verificable; el binario es opaco y no se publica codigo fuente ni hash de integridad.

## Casos de uso

No se identifican casos de uso legitimos como modelo de IA. Los escenarios que plantea el autor son de naturaleza financiera y conllevan riesgos regulatorios y de seguridad:

- Trading automatizado en Solana: el autor propone ejecucion de ordenes mediante bundles atomicos; requeriria claves privadas reales en el equipo del usuario, con riesgo directo de perdida de fondos.
- Copytrade de wallets: replicaria posiciones de terceros sin garantia de rentabilidad ni de legalidad segun jurisdiccion.
- Sniper de lanzamientos de tokens: expone al usuario a tokens fraudulentos pese al filtro de honeypots declarado.
- Paper trading: unico uso relativamente inocuo, pero no verificable sin ejecutar el binario.
- Gestion de claves: el supuesto vault AES-256 local no es auditable al no publicarse codigo.
- Evaluacion de seguridad: el artefacto puede usarse como muestra en analisis de malware en un entorno aislado (sandbox, maquina virtual sin red), nunca en un equipo de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de "98,4 %" y "98,7 %" de consistencia carecen de definicion, conjunto de evaluacion y metodologia, por lo que no son comparables con metricas de modelos (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11, x64 (Intel y AMD).
- Huella en disco declarada: paquete ZIP de 8,9 MB.
- Memoria RAM declarada por el autor: menos de 27 MB y menos de 37 MB segun modulo, con 11 hilos de trabajo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; no se publican mediciones reproducibles.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable, ya que el artefacto no es un modelo de IA. Frente a modelos open source reales (por ejemplo, familias tipo Llama, Mistral o Qwen), la comparacion carece de sentido: aquellos publican pesos en safetensors/GGUF, tokenizador, arquitectura y evaluaciones; este repositorio solo distribuye un ejecutable de Windows.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en evaluaciones tecnicas ni en comparativas de modelos.
- Binario opaco distribuido en un ZIP con contrasena incluida en el propio README: patron habitual en campanas de distribucion de malware.
- Instrucciones explicitas para ejecutar como administrador y desactivar o ignorar avisos de Windows Defender/SmartScreen: incrementa el riesgo de compromiso del sistema.
- Fecha de creacion futura (2026-11-24) y contadores de descargas y valoraciones en la model card ("280K+ descargas", "99 % verificado") no verificables y probablemente inflados.
- Riesgo financiero directo: la operativa de trading con claves privadas reales puede provocar perdida total de fondos.
- Riesgo regulatorio: el trading automatizado y el copytrade pueden incumplir normativa local segun jurisdiccion.
- Licencia MIT declarada, pero sin codigo fuente publicado no es posible auditar el cumplimiento ni la ausencia de componentes maliciosos.
- Sin sesgos de modelo que evaluar (no hay modelo), pero si posibles sesgos de diseno en los filtros de tokens declarados, no auditables.
- Riesgo de alucinacion no aplicable; el riesgo equivalente es la promesa de funcionalidad no demostrada.
- Recomendacion: no descargar ni ejecutar; en caso de analisis, hacerlo en maquina virtual aislada y sin acceso a red ni a claves.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EDGARCHETOS/photon-sol-sniper-bot
- Repositorio GitHub referenciado en la model card: https://github.com/pointer-smith/photon-sol-sniper-bot
- Releases referenciadas: https://github.com/pointer-smith/photon-sol-sniper-bot/releases/latest
- Paquete directo citado por el autor (no recomendado): https://github.com/pointer-smith/photon-sol-sniper-bot/releases/latest/download/photon-sol-sniper-bot-v1.2.0-win64.zip
- Paper, blog o demo oficiales: no disponible
