# maxgfr/s6-secrets-verify-pico

## Resumen

s6-secrets-verify-pico es un clasificador de texto de tipo "verificador de candidatos" desarrollado por maxgfr dentro del proyecto skycmd. No es un modelo generativo ni un LLM convencional: recibe una propuesta generada por un motor de reglas (un valor, su linea, sus vecinos y su fichero) y emite un juicio binario sobre si ese valor es una credencial real que deberia revocarse. Con 445.345 parametros y un fichero GGUF de 249.984 bytes, su interes no esta en el rendimiento bruto sino en el planteamiento metodologico: es un experimento pre-registrado que fallo su puerta de validacion y se publica como resultado negativo reproducible.

El modelo es la segunda version de s6-secrets-pico. La primera leia textos completos y fracaso sobre ficheros reales; esta se entreno y evaluo sobre repositorios reales del conjunto CredData. La arquitectura sigue el patron "reglas primero, juez aprendido despues" ya usado por CredSweeper de Samsung, Credential Digger de SAP y FP Remover de GitGuardian, pero con un tamano dos ordenes de magnitud menor (249 KB frente a los 11,5 MB del `ml_model.onnx` de CredSweeper).

Su relevancia actual es doble. Por un lado, demuestra que un verificador ternario diminuto puede acercarse al rendimiento de escaneres de reglas en deteccion de secretos. Por otro, y de forma explicita, el autor documenta que no alcanzo la puerta G1 (F1 de linea 0,8561 frente al umbral 0,8832 exigido) y desaconseja su uso como detector autonomo. Se distribuye unicamente como opcion experimental, desactivada por defecto, dentro de la herramienta secretgate desde la version 1.9.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal ternaria de decision (clasificador binario sobre candidatos) |
| Parametros totales | 445.345 (193.793 segun metadatos de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ternaria (pesos en {-1, 0, +1}); fichero GGUF de 249.984 bytes |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del fichero | 249.984 bytes (aprox. 250 KB) |
| Pipeline | text-classification |
| Tarea | verificacion de candidatos a secreto (P(real) >= 0,34933) |

## Arquitectura y entrenamiento

El modelo implementa un clasificador de decision de "sistema uno": una red ternaria de muy baja capacidad que actua como juez sobre la salida de un motor de reglas. El flujo es el siguiente: el motor de reglas propone un candidato (un valor concreto, su linea, sus vecinos y su fichero de origen) y el modelo evalua ese unico valor en su contexto respondiendo a la pregunta "es este valor una credencial real que deberia revocarse?". Los pesos se almacenan en representacion ternaria, lo que explica que 445.345 parametros ocupen solo 250 KB en GGUF.

El entrenamiento y la evaluacion se realizaron sobre repositorios reales, empleando el conjunto CredData y un conjunto de informes de incidencias. El autor no republica estos datos porque contienen credenciales reales. La evaluacion se hizo sobre 221 repositorios de test de CredData nunca vistos durante el entrenamiento. El proceso se rigio por un protocolo pre-registrado con siete puertas de validacion definidas antes de la ejecucion (documento `docs/s6-secrets2-prereg.md`, seccion 8), con ocho enmiendas previas a la ejecucion y una novena posterior que autoriza la publicacion del resultado fallido. No se documenta en la informacion disponible el uso de RLHF, DPO ni detalles sobre el numero de tokens de entrenamiento.

## Capacidades

- Clasificacion binaria de candidatos a secreto: dado un valor propuesto por reglas y su contexto (linea, vecinos, fichero), estima la probabilidad de que sea una credencial real.
- Umbral de decision calibrado en P(real) >= 0,34933.
- Integracion como verificador de segunda etapa en pipelines de deteccion de secretos basados en reglas.
- Capacidad de anadir redacciones sobre las que ya detectan las reglas, sin poder eliminarlas ni modificarlas.
- Ejecucion en Rust y compilacion a WASM (el proyecto skycmd es 100 % Rust).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Multilingue: no; unicamente ingles.

## Casos de uso

- Verificacion de falsos positivos en escaneo de secretos: integrado en secretgate como opcion experimental, el modelo recibe los candidatos que las reglas ya han marcado y anade redacciones adicionales en la salida de herramientas. Es el unico uso soportado oficialmente y esta desactivado por defecto.
- Investigacion sobre modelos de decision de muy bajo coste: sirve como referencia reproducible de un clasificador ternario de 250 KB para estudiar el equilibrio entre capacidad y tamano en tareas de filtrado.
- Reproduccion de resultados negativos: el fichero permite verificar de forma independiente las cifras del informe tecnico y del BENCH.md del proyecto skycmd.
- Hook de pre-commit en desarrollo local: al ejecutarse en Rust/WASM y anadir como maximo unos 1,25 s a un hook, es viable en flujos de integracion continua donde no se quiere depender de servicios externos.
- Filtrado en entornos con recursos muy limitados: su tamano de 250 KB permite desplegarlo en dispositivos embebidos o navegador via WASM, aunque con la advertencia de que no debe usarse como detector autonomo.
- Docencia y divulgacion sobre metodologia pre-registrada: el par modelo + pre-registro + informe es un ejemplo completo de publicacion de un resultado fallido con puertas definidas a priori.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la puerta G1 del protocolo pre-registrado, medida como F1 de linea sobre el test de CredData (221 repositorios no vistos en entrenamiento).

| Metrica | Resultado | Umbral exigido | Veredicto |
|---|---|---|---|
| G1, todos los repositorios | 0,8561 | Betterleaks 0,7332 + 0,15 = 0,8832 | Falla (diferencia +0,123) |
| G1, sin el repositorio mas grande | 0,8114 | Betterleaks 0,5367 + 0,15 = 0,6867 | Se cumple |
| G2 a G7 | no detallado en la informacion disponible | no disponible | Se cumplen (segun el autor) |
| s6-secrets v3 (reglas + modelo) | 0,8477 | 0,8832 | Falla G1 de nuevo |

El sistema combinado s6-secrets v3, que marca una linea cuando las reglas por defecto de secretgate la marcan o cuando el modelo acepta un candidato en ella, alcanzo 0,8477 en la misma puerta y tambien la fallo. El coste operativo medido de la opcion experimental es de una redaccion en el 0,46 % de 8.825 ficheros reales limpios sin ruta y en el 0,27 % con ruta.

## Requisitos de hardware

- VRAM estimada: practicamente despreciable; el fichero GGUF ocupa 249.984 bytes y los pesos son ternarios, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; el modelo no requiere GPU para inferencia razonable.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en CPU. La ejecucion de referencia es en Rust y WASM.
- Opciones de despliegue: binario Rust del proyecto skycmd, modulo WASM, y la herramienta secretgate (version 1.9.0 o superior) que descarga los cuatro ficheros de datos con verificacion sha256. No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia: el autor reporta como maximo unos 1,25 s anadidos a un hook de pre-commit. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Desarrollador | Enfoque | Tamano | Licencia | Estado |
|---|---|---|---|---|---|
| s6-secrets-verify-pico | maxgfr | Verificador ternario de candidatos propuestos por reglas | 249.984 bytes | Apache 2.0 | Publicado como resultado negativo; fallo G1 |
| CredSweeper (ml_model.onnx) | Samsung | Validador ML sobre reglas | 11.545.911 bytes | no disponible en la informacion | En produccion |
| Credential Digger | SAP (archivado) | Reglas + validacion | no disponible | no disponible en la informacion | Archivado |
| FP Remover | GitGuardian | Reduccion de falsos positivos | no disponible | no disponible en la informacion | En produccion (blog) |

La comparacion directa de rendimiento con CredSweeper, Credential Digger y FP Remover no esta disponible en la informacion proporcionada; el autor solo usa Betterleaks como referencia de escaner de reglas en la puerta G1.

## Limitaciones y advertencias

- El modelo fallo su puerta de validacion pre-registrada G1 (F1 0,8561 frente a 0,8832 exigido) y el autor lo desaconseja explicitamente como detector autonomo.
- Solo funciona como segunda etapa: requiere que un motor de reglas proponga candidatos; no detecta secretos por si mismo.
- Solo puede anadir redacciones sobre lo que las reglas detectan; nunca elimina ni modifica sus resultados.
- Entrenado y evaluado unicamente en ingles.
- Riesgo de falsos positivos medido: redaccion en el 0,46 % de 8.825 ficheros limpios sin ruta y en el 0,27 % con ruta.
- Los datos de entrenamiento (CredData e informes de incidencias) contienen credenciales reales y no se republican.
- Licencia Apache 2.0 permite uso comercial, pero el autor no recomienda su uso en produccion mas alla de la opcion experimental de secretgate.
- No hay tercera lectura ni continuacion prevista del trabajo sobre este modelo.
- La demo publica usa un proponente simplificado de una sola regla y envia los flags de filtro como falsos, por lo que muestra el juicio del modelo sobre esos registros, no el sistema medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-secrets-verify-pico
- Space de demo: https://huggingface.co/spaces/maxgfr/s6-secrets-verify-pico
- Demo en el sitio del proyecto: https://maxgfr.github.io/skycmd/secrets-verify/
- Codigo fuente (skycmd, Rust): https://github.com/maxgfr/skycmd
- Herramienta secretgate: https://github.com/maxgfr/secretgate
- Pagina del verificador en secretgate: https://github.com/maxgfr/secretgate/blob/main/docs/verifier.md
- Pre-registro s6-secrets v2: https://github.com/maxgfr/skycmd/blob/main/docs/s6-secrets2-prereg.md
- Pre-registro s6-secrets v3: https://github.com/maxgfr/skycmd/blob/main/docs/s6-secrets3-prereg.md
- Benchmarks (BENCH.md): https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-secrets-verify-pico-s6-secrets-v2-a-verifier-of-rule-candidates-pre-registered-gate-failed
- Resultados de evaluacion v2: https://github.com/maxgfr/skycmd/blob/main/runs/s6-secrets2/eval-test/results.md
- Resultados de evaluacion v3: https://github.com/maxgfr/skycmd/blob/main/runs/s6-secrets3/eval-test/results.md
- Pagina de resultados del proyecto: https://maxgfr.github.io/skycmd/results/#s6-secrets-verify-pico-failed
- Informe tecnico: https://maxgfr.github.io/skycmd/paper/
- Guia de uso real: https://maxgfr.github.io/skycmd/use/#secrets
- Space general del proyecto: https://huggingface.co/spaces/maxgfr/skycmd
- Version anterior del modelo: https://huggingface.co/maxgfr/s6-secrets-pico
- CredSweeper (Samsung): https://github.com/Samsung/CredSweeper
- Credential Digger (SAP): https://github.com/SAP-archive/credential-digger
- FP Remover (GitGuardian): https://blog.gitguardian.com/fp-remover-cuts-false-positives-by-half/
