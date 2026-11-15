# maxgfr/s6-secrets-verify-pico

## Resumen

s6-secrets-verify-pico es un verificador ternario de candidatos a secreto desarrollado por maxgfr dentro del proyecto skycmd, escrito integramente en Rust. No es un modelo generativo: es un clasificador binario de decision (pipeline `text-classification`) que recibe un estado construido a partir de una candidata propuesta por un motor de reglas (un valor, su linea, sus vecinos y su fichero) y responde a una unica pregunta: si ese valor es una credencial real que deberia revocarse. Con 445.345 parametros y un fichero de unos 250 KB en formato GGUF, su interes no reside en el rendimiento bruto sino en el planteamiento: un modelo minúsculo, determinista y de latencia muy baja que actua como segunda etapa sobre las salidas de un escaner de secretos convencional.

El modelo es relevante por su honestidad metodologica y por su condicion de resultado negativo publicado. Segun su model card, incumplio su puerta pre-registrada G1: se exigia un F1 a nivel de linea al menos 0,15 puntos por encima del mejor escaner de reglas sobre el conjunto de test de CredData en la lectura "todos los repositorios", y alcanzo 0,8561 frente al umbral de 0,8832 derivado de Betterleaks (0,7332 + 0,15). Las otras seis puertas se cumplieron, incluida una calibracion excelente (ECE de 0,0073) y una latencia mediana de 1.606 microsegundos por candidata. El autor lo publica para que el resultado sea verificable y reproducible, no para su uso en produccion, y declara explicitamente que no entra en secretgate ni se continua en esta forma.

La ficha se redacta, por tanto, sobre un artefacto de investigacion con valor como referencia tecnica y como caso de estudio de pre-registro y evaluacion rigurosa, no como componente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red ternaria de decision (clasificador binario) sobre estado construido a partir de candidata de reglas y features manuales; implementacion en Rust |
| Parametros totales | 445.345 (la metadata de safetensors del repo indica 193.793; discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no procesa texto libre; recibe un estado de candidata) |
| Tipos de cuantizacion | ternaria (pesos ternarios); un unico fichero GGUF de aproximadamente 250 KB |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia interna de la red (numero de capas, dimensiones, esquema de ternarizacion ni funcion de perdida). Lo que si se especifica es su interfaz: el modelo no lee texto, sino un estado derivado de una candidata generada por el motor de reglas de secretgate, combinado con features manuales definidas en `crates/sky-infer/src/secret_cand.rs`. La salida es una probabilidad de que el valor sea una credencial real; en la variante v3 del sistema se aplica un umbral de P(real) ≥ 0,34933 para aceptar la candidata.

El entrenamiento y la evaluacion se realizaron sobre repositorios reales, a diferencia de la version anterior s6-secrets-pico, que leia textos completos y fallaba en ficheros reales. La evaluacion se hizo sobre el conjunto de test de CredData (221 repositorios reales) a nivel de linea, con un universo filtrado que elimina las filas de categoria `UUID`, decision tomada tras leer filas de entrenamiento y validacion y antes de leer ningun fichero de test. El proceso esta pre-registrado en `docs/s6-secrets2-prereg.md`, con ocho enmiendas anteriores a la ejecucion y una novena posterior que autoriza la publicacion del modelo pese al fallo de la puerta G1. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, que en un clasificador de este tamano resultarian inusuales.

## Capacidades

- Clasificacion binaria de candidatas a secreto: dado un valor propuesto por un motor de reglas y su contexto (linea, vecinos, fichero), estima la probabilidad de que sea una credencial real revocable.
- Calibracion de probabilidades: ECE de 0,0073 sobre las candidatas del test de CredData, lo que permite usar el score como probabilidad interpretable y fijar umbrales con sentido.
- Deteccion de secretos en repositorios reales a nivel de linea, con F1 de 0,8561 en el universo filtrado y 0,8114 excluyendo el repositorio mas grande.
- Deteccion sobre informes de incidencias (issue reports): F1 de 0,8162 sobre 8.123 candidatas con 888 secretos.
- Baja tasa de falsos positivos en texto limpio: 0,35% de ficheros con alguna candidata aceptada (31 de 8.825), y ninguna de las 110 candidatas aceptadas resulto ser una credencial real tras revision manual.
- Inferencia nativa de muy baja latencia: mediana de 1.606 microsegundos por candidata, por debajo del limite de 3 ms de la puerta G6.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto. No dispone de demo publica porque requeriria portar el generador de candidatas de secretgate y las features manuales.

## Casos de uso

- Segunda etapa de un escaner de secretos en CI/CD: el motor de reglas propone candidatas y este verificador filtra los falsos positivos antes de abrir una alerta o bloquear un merge, reduciendo el ruido que degrada la confianza en este tipo de herramientas. Es adecuado por su latencia sub-2 ms y su calibracion.
- Auditoria de repositorios historicos: aplicar el par reglas + verificador sobre el arbol completo de un repositorio para priorizar que credenciales revocar primero, usando la probabilidad calibrada como criterio de ordenacion.
- Triaje de informes de incidencias y fugas publicadas: procesar issue reports con valores expuestos y clasificar cuales corresponden a secretos reales, con un F1 de 0,8162 en este escenario.
- Investigacion sobre verificadores ligeros: servir como linea base reproducible para comparar arquitecturas ternarias de muy bajo coste frente a escaneres de reglas y modelos de tamano medio como cbx-secrets-detector-17M.
- Caso de estudio metodologico: ejemplo documentado de pre-registro de puertas de evaluacion, analisis de bootstrap pareado por repositorios y publicacion de resultados negativos, util para equipos que disenan evaluaciones de modelos.
- Despliegue en entornos con recursos minimos: al ocupar unos 250 KB, puede embeberse en herramientas de linea de comandos o agentes locales escritos en Rust sin dependencias de GPU.
- No es adecuado como unico mecanismo de deteccion: su valor esta en combinacion con un generador de candidatas basado en reglas, no como clasificador autonomo de texto.

## Benchmarks y rendimiento

Resultados sobre el test de CredData (221 repositorios reales), a nivel de linea, universo filtrado (filas de categoria `UUID` eliminadas):

| Sistema | Precision | Recall | F1 linea | F1 sin el mayor |
|---|---:|---:|---:|---:|
| s6-secrets-verify-pico | 0,8387 | 0,8741 | 0,8561 | 0,8114 |
| Betterleaks 1.10.1 | 0,7694 | 0,7002 | 0,7332 | 0,5367 |
| secretgate default engine | 0,8176 | 0,6560 | 0,7279 | 0,5072 |
| Gitleaks 8.30.1 | 0,8546 | 0,5980 | 0,7037 | 0,4080 |
| cbx-secrets-detector-17M | 0,8265 | 0,5820 | 0,6830 | 0,8493 |
| Regresion logistica de tamano comparable (256 KiB) | 0,7345 | 0,8652 | 0,7945 | 0,7179 |

Otras metricas reportadas:

| Metrica | Valor |
|---|---|
| F1 a nivel de candidata (33.809 candidatas, 9.623 positivas) | 0,8827 |
| PR-AUC a nivel de candidata | 0,9335 |
| ECE en candidatas del test | 0,0073 |
| F1 en issue reports (8.123 candidatas, 888 secretos) | 0,8162 |
| F1 de Gitleaks en issue reports | 0,7104 |
| F1 de cbx-secrets-detector-17M en issue reports | 0,8616 |
| Ficheros limpios con candidata aceptada | 0,35% (31 de 8.825) |
| Latencia mediana nativa por candidata | 1.606 microsegundos |

Bootstrap pareado por repositorios (1.000 remuestreos, 95%): diferencia frente a Betterleaks de +0,1229 [0,0413; 0,3613] en todos los repositorios y +0,2748 [0,1743; 0,3796] excluyendo el mayor. La puerta G1 exigia +0,15 y no se alcanzo en la lectura completa.

## Requisitos de hardware

- VRAM: no aplica en la practica; el fichero GGUF ocupa unos 250 KB y la inferencia es nativa en CPU.
- GPU recomendadas: ninguna necesaria. El autor reporta inferencia nativa en Rust con mediana de 1.606 microsegundos por candidata, lo que sugiere ejecucion en CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el cuello de botella real es el generador de candidatas de secretgate, no el modelo.
- Opciones de despliegue: integracion mediante el proyecto skycmd (100% Rust) y el runtime de inferencia del propio proyecto; no se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y al ser un clasificador de estado y no un modelo de lenguaje, esas herramientas no son directamente aplicables.
- Latencia y throughput: mediana de 1.606 microsegundos por candidata en la puerta G6; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | F1 linea (CredData) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s6-secrets-verify-pico | 445.345 (metadata safetensors: 193.793) | Verificador ternario sobre candidatas de reglas | 0,8561 | Apache 2.0 | GGUF en Hugging Face, sin demo |
| cbx-secrets-detector-17M | 17M | Detector de secretos | 0,6830 (0,8493 sin el mayor) | no disponible | no disponible |
| Betterleaks 1.10.1 | no aplica (reglas) | Escaner de reglas | 0,7332 | no disponible | herramienta publica |
| Gitleaks 8.30.1 | no aplica (reglas) | Escaner de reglas | 0,7037 | no disponible | herramienta publica |
| Regresion logistica de tamano comparable | 256 KiB | Clasificador lineal | 0,7945 | no disponible | no disponible |

## Limitaciones y advertencias

- Resultado negativo: el modelo incumplio su puerta pre-registrada G1 en la lectura "todos los repositorios" (0,8561 frente a 0,8832 exigidos). El autor indica explicitamente que se publica como resultado y no para su uso, y que no entra en secretgate.
- Sistema v3 tambien fallido: la variante que combina reglas y modelo alcanzo 0,8477 frente al mismo umbral de 0,8832, con lo que G1 volvio a fallar. No hay una tercera lectura prevista y el trabajo en esta linea se da por terminado.
- Sesgo de evaluacion por repositorio: el repositorio de test mas grande concentra 5.165 de las 10.463 filas positivas y los escaneres de reglas rinden bien en el; excluyendolo, el modelo supera ampliamente a Betterleaks, lo que indica una sensibilidad fuerte a la composicion del corpus.
- Dependencia de un componente externo: el modelo no procesa texto; necesita el generador de candidatas de secretgate y las features manuales de `secret_cand.rs`. Sin ese pipeline no es utilizable, y por eso no hay demo en navegador.
- Cobertura linguistica limitada al ingles; no se documenta comportamiento en otros idiomas.
- Riesgo de falso negativo en credenciales que el motor de reglas no proponga: al actuar como segunda etapa, hereda los fallos de recall de la primera.
- Tasa de falsos positivos baja pero no nula: 0,35% de ficheros limpios con alguna candidata aceptada, aunque la revision manual de las 110 candidatas no encontro credenciales reales.
- Sin datos publicados sobre sesgos demograficos, toxicidad o comportamiento fuera del dominio de deteccion de secretos; no aplica como modelo generativo.
- Licencia Apache 2.0 permite uso comercial, pero la condicion de resultado negativo y la ausencia de soporte continuado desaconsejan su uso en produccion.
- Discrepancia entre los parametros declarados en la model card (445.345) y los de la metadata de safetensors (193.793), no aclarada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-secrets-verify-pico
- Version anterior: https://huggingface.co/maxgfr/s6-secrets-pico
- Repositorio del proyecto: https://github.com/maxgfr/skycmd
- Pagina de resultados: https://maxgfr.github.io/skycmd/results/
- Pre-registro v2: https://github.com/maxgfr/skycmd/blob/main/docs/s6-secrets2-prereg.md
- Pre-registro v3: https://github.com/maxgfr/skycmd/blob/main/docs/s6-secrets3-prereg.md
- Benchmarks: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-secrets-verify-pico-s6-secrets-v2-a-verifier-of-rule-candidates-pre-registered-gate-failed
- Resultados del test v2: https://github.com/maxgfr/skycmd/blob/main/runs/s6-secrets2/eval-test/results.md
- Resultados del test v3: https://github.com/maxgfr/skycmd/blob/main/runs/s6-secrets3/eval-test/results.md
- Proyecto secretgate: https://github.com/maxgfr/secretgate
