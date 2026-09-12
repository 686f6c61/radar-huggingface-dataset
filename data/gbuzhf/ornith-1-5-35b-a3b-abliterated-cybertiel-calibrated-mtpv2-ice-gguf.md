# gbuzhf/Ornith-1.5-35B-A3B-Abliterated-CyberTiel-Calibrated-MTPv2-ICE-GGUF

## Resumen

Ornith-1.5-35B-A3B-Abliterated-CyberTiel-Calibrated-MTPv2-ICE-GGUF es una familia de cuantizaciones GGUF publicada por el usuario gbuzhf sobre los pesos abliterados de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, un modelo de arquitectura MoE (etiquetado como qwen35moe) de 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, segun la nomenclatura A3B del nombre.

El problema que resuelve es de eficiencia de cuantizacion: el autor aplica una importance matrix (imatrix) "trunk-matched" y una metodologia propia llamada ICE (Isolation of Compounding E..., definicion truncada en la informacion disponible), con el objetivo de obtener una fidelidad al maestro BF16 superior a la de escaleras de cuantizacion convencionales del mismo tamano. Incluye ademas la cabeza MTPv2 (multi-token prediction) entrenada del propio modelo y una plantilla de chat Qwen-Sharp v22.4.1 sin marca.

Es relevante ahora porque permite ejecutar un MoE de ~35B con ~3B activos en GPUs de consumo (24-32 GB) con perdidas de fidelidad medidas y documentadas, y porque el checkpoint es abliterado: el comportamiento de rechazo ha sido suprimido en los pesos, lo que lo hace util para investigacion sobre alineacion y peligroso para despliegue sin aislamiento. La licencia es MIT y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen35moe`); 256 expertos enrutados, 8 activos por token, mas experto compartido |
| Parametros totales | 35.505.251.456 (aproximadamente 35,5 B) |
| Parametros activos | aproximadamente 3 B por token (segun el sufijo A3B; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix; cuatro niveles ICE (19G, 21G, 23G, 25G) mas maestro BF16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); maestro BF16 tambien en GGUF (71,07 GB) |
| Tamano del repositorio | 158,4 GB |
| Cabezas adicionales | MTPv2 (multi-token prediction) entrenada, incluida en la cuantizacion |
| Plantilla de chat | Qwen-Sharp v22.4.1 (sin marca) |
| Modelo base | huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated (relacion: quantized) |
| Descargas / likes | 1.392 / 1 |
| Fecha de creacion / actualizacion | 2026-09-10 / 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) con 256 expertos enrutados de los que solo 8 se activan por token, ademas de un experto compartido y una cabeza de prediccion multi-token (MTPv2) ya entrenada en el modelo base. El autor justifica sus decisiones de cuantizacion precisamente con esa dispersion: dado que solo 8 de 256 expertos disparan por token, un bit invertido en `ffn_*_exps` vale aproximadamente un 3 % de un bit en atencion, experto compartido o cabeza de salida, que se ejecutan en todos los tokens. De ahi que publique dos columnas de bits por peso (`active bpw`, ponderado por esa frecuencia y excluyendo `token_embd`, con MTP puntuado aparte, y `file bpw`, que es simplemente tamano entre parametros).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de post-entrenamiento (RLHF/DPO) del modelo base en los datos proporcionados. Lo que si esta documentado es el procesamiento posterior aplicado por el autor: cuantizacion contra una importance matrix "trunk-matched" (la misma imatrix y plantilla de chat que el repositorio peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP), generacion de cuatro niveles ICE situados deliberadamente entre los escalones habituales de la escalera `UD`, e incorporacion del maestro BF16. La metodologia ICE se describe como "Isolation of Compounding E...", pero la definicion aparece truncada en la model card disponible.

## Capacidades

- Generacion de texto conversacional multilingue en ingles y chino (pipeline `text-generation`, formato conversacional).
- Razonamiento y generacion de codigo heredados del modelo base Ornith-1.5-35B-A3B; el autor cita explicitamente "reasoning, tool use or speed" como dimensiones que sus mediciones de KLD no evaluan.
- Soporte de prediccion multi-token mediante la cabeza MTPv2 integrada, util para decodificacion especulativa en llama.cpp.
- Ejecucion local y en servidor mediante llama.cpp, con compatibilidad declarada con endpoints (`endpoints_compatible`).
- Comportamiento sin rechazos: al ser un checkpoint abliterado, responde a peticiones que un modelo con salvaguardas declinaria.
- No se declaran capacidades de vision, audio ni tool calling explicito en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y abliteration: comparar las respuestas del checkpoint abliterado con las del equivalente con salvaguardas (TIEL-Calibrated) sobre el mismo conjunto de prompts permite medir que comportamientos se degradan al suprimir las direcciones de rechazo.
- Generacion de codigo en local sobre GPU de consumo: el nivel `23G-ICE` (22,84 GB) entra en 24 GB de VRAM con contexto utilizable a KV `q8_0`, lo que permite tener un asistente de codigo sin enviar codigo propietario a una API externa.
- Redaccion tecnica bilingue ingles-chino: al estar entrenado y declarar solo `en` y `zh`, es adecuado para documentacion, traduccion tecnica y resumen de documentacion de proveedores chinos donde otros modelos pequenos pierden terminologia.
- Despliegue en pipelines de CI/CD con llama.cpp: el formato GGUF y la cabeza MTPv2 permiten decodificacion especulativa, reduciendo la latencia por token en tareas por lotes como revision de diffs o generacion de mensajes de commit.
- Evaluacion de cuantizacion y reproducibilidad: el repositorio publica la salida cruda de `llama-perplexity` en `measurements/`, de modo que sirve como caso de estudio metodologico para comparar escaleras de cuantizacion a igual numero de bytes.
- Prototipado de agentes en entorno aislado: con una ventana de contexto no documentada, su uso razonable es el de un componente de generacion dentro de una sandbox con red y ejecucion de codigo restringidas, nunca como agente con acceso libre al sistema.
- Servicio de escritura creativa sin filtros: el caracter abliterado lo hace apto para narrativa con contenido que los modelos alineados rechazan, siempre que el operador asuma la responsabilidad legal y etica del contenido generado.

## Benchmarks y rendimiento

El autor no publica benchmarks de razonamiento, codigo o conocimiento. Lo que publica es una medicion de fidelidad de cuantizacion: divergencia KL frente al maestro BF16 del propio repositorio, sobre WikiText-2 raw test, 64 fragmentos, `n_ctx` 2048, con `Mean PPL(base) = 7,577170 ± 0,080481`. Las filas `UD-*` provienen de peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP y cuantizan los mismos pesos huihui-abliterated, por lo que son directamente comparables.

| Fichero | Tamano | KLD media | KLD 99 % | KLD 99,9 % | Ratio PPL | Mismo top-1 | active bpw | file bpw | overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `UD-Q5_K_XL` | 26,98 GB | 0,024029 | 0,2520 | 0,9873 | 0,9927 | 94,00 % | 7,833 | 6,077 | 96,6 |
| `25G-ICE` | 24,85 GB | 0,028589 | 0,2919 | 1,1147 | 0,9864 | 93,32 % | 7,686 | 5,599 | 96,1 |
| `23G-ICE` | 22,84 GB | 0,033146 | 0,3304 | 1,1405 | 0,9864 | 92,68 % | 7,523 | 5,146 | 95,6 |
| `UD-Q4_K_XL` | 22,75 GB | 0,035699 | 0,3651 | 1,3015 | 0,9770 | 92,63 % | 7,474 | 5,123 | 95,4 |
| `UD-Q4_K_M` | 22,52 GB | 0,036217 | 0,3761 | 1,2884 | 0,9753 | 92,40 % | 7,130 | 5,073 | 95,3 |
| `21G-ICE` | 20,85 GB | 0,039589 | 0,4162 | 1,5265 | 0,9840 | 92,22 % | 7,357 | 4,698 | 95,0 |
| `UD-Q4_K_S` | 21,28 GB | 0,040310 | 0,4156 | 1,5351 | 0,9795 | 91,98 % | 7,025 | 4,793 | 94,9 |
| `19G-ICE` | 18,82 GB | 0,059336 | 0,6120 | 1,9325 | 0,9987 | 90,09 % | 7,192 | 4,241 | 93,1 |
| `UD-IQ4_XS` | 18,12 GB | 0,068901 | 0,7185 | 2,3927 | 1,0435 | 89,59 % | 6,757 | 4,082 | 92,4 |

Comparacion a igual numero de bytes (curva `UD` interpolada al tamano exacto de cada nivel ICE):

| Nivel | ICE (KLD media) | UD a igual tamano | Ganancia | Bytes extra que necesitaria UD |
|---|---:|---:|---:|---:|
| `19G-ICE` | 0,059336 | 0,061165 | 3,0 % | +0,18 GB |
| `21G-ICE` | 0,039589 | 0,043387 | 8,8 % | +0,64 GB |
| `23G-ICE` | 0,033146 | 0,035411 | 6,4 % | +0,71 GB |
| `25G-ICE` | 0,028589 | 0,029333 | 2,5 % | +0,27 GB |

Advertencias del propio autor: la KLD es una medida intra-linaje y no es comparable entre repositorios distintos; dos escalones `UD` adyacentes separados por 226 MB difieren un 1,43 %, por lo que las ganancias observadas equivalen a unos 0,2-0,7 GB de VRAM a igual fidelidad; `19G-ICE` y `25G-ICE` estan interpolados sobre huecos amplios y son indicativos; una comprobacion de interpolacion con datos retenidos dio un error del 0,43 %, de modo que cualquier diferencia por debajo del 0,5 % debe tratarse como ruido. El fichero mas fiel de la tabla es `UD-Q5_K_XL` (26,98 GB).

## Requisitos de hardware

- `19G-ICE` (18,82 GB): encaja en un equipo con 24 GB de RAM+VRAM combinados, con el mayor margen de contexto de toda la escalera.
- `21G-ICE` (20,85 GB): clase `UD-Q4_K_S`, tambien para el perfil de 24 GB.
- `23G-ICE` (22,84 GB): punto de entrada recomendado por el autor; clase `UD-Q4_K_XL`, ajustado pero viable en 24 GB y comodo en 32 GB.
- `25G-ICE` (24,85 GB): requiere 32 GB; es el nivel mas cercano a BF16 de los cuatro ICE.
- BF16 (71,07 GB): maestro, pensado para generar cuantizaciones propias, no para inferencia en GPU de consumo.
- GPU recomendadas: no especificadas por el autor. Por tamano, los perfiles de 18-25 GB apuntan a RTX 3090/4090 (24 GB), RTX 5090 o A6000 (32-48 GB) en el rango alto; el BF16 requiere como minimo 80 GB de VRAM (A100/H100) o descarga parcial a CPU.
- Despliegue: llama.cpp es la via oficial (biblioteca declarada `gguf`) y el repositorio se marca como compatible con endpoints. Otros runners (Ollama, vLLM, TGI) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. El modelo incorpora MTPv2, lo que habilita decodificacion especulativa en llama.cpp, pero el autor no publica cifras de tokens por segundo y advierte que sus mediciones de KLD no dicen nada sobre velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Fidelidad / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`23G-ICE`) | 35,5 B totales, ~3 B activos | no disponible | KLD media 0,033146; mismo top-1 92,68 %; overall 95,6 | MIT | GGUF en HuggingFace |
| `peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP` (`UD-Q4_K_XL`) | mismos pesos base, 22,75 GB | no disponible | KLD media 0,035699; mismo top-1 92,63 %; overall 95,4 | no disponible en la informacion proporcionada | GGUF en HuggingFace |
| `UD-Q5_K_XL` (misma linea) | mismos pesos base, 26,98 GB | no disponible | KLD media 0,024029; mismo top-1 94,00 %; overall 96,6 | no disponible en la informacion proporcionada | GGUF en HuggingFace |
| `gbuzhf/Ornith-1.5-35B-A3B-TIEL-Calibrated-MTPv2-ICE-GGUF` (variante con salvaguardas) | 35,5 B totales, ~3 B activos | no disponible | no disponible (no se publican mediciones en la informacion proporcionada) | MIT | GGUF en HuggingFace |
| Modelo base `huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated` | 35,5 B totales | no disponible | no disponible | MIT (segun este repositorio derivado) | safetensors/GGUF segun el repositorio original |

## Limitaciones y advertencias

- Modelo abliterado y sin censura: el comportamiento de rechazo ha sido suprimido en los pesos. Cumplira peticiones que un modelo con salvaguardas declina, y el operador es responsable del uso.
- Riesgo de inyeccion de prompts sin red de seguridad: al no existir un mecanismo de rechazo que actue como ultimo freno, una inyeccion desde una pagina hostil o desde codigo de terceros no encuentra contramedida interna. El propio autor recomienda aislar el modelo a nivel de sistema operativo y controlar su acceso a red y a ejecucion de codigo.
- No hay benchmarks de razonamiento, codigo, matematicas ni uso de herramientas. Las unicas metricas publicadas miden fidelidad de cuantizacion frente al maestro, no calidad de respuesta: el autor lo advierte de forma explicita.
- La medicion de KLD es intra-linaje y no comparable con la de otros repositorios; para comparar entre linajes hay que usar perplejidad.
- Longitud de contexto no documentada: no se puede planificar un caso de uso que dependa de una ventana concreta sin medirla previamente.
- Cobertura idiomatica limitada a ingles y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Licencia MIT, que permite uso comercial, pero la ausencia de salvaguardas traslada al operador el cumplimiento normativo (contenido, proteccion de datos, responsabilidad por el contenido generado).
- Repositorio con muy poca traccion social (1 like, 1.392 descargas) y sin historial de validacion por terceros; los pesos base derivan de una cadena de derivaciones (huihui-ai sobre Ornith-1.5) cuya trazabilidad de datos de entrenamiento no se documenta aqui.
- El BF16 de 71,07 GB y el repositorio completo de 158,4 GB requieren almacenamiento y ancho de banda considerables para su descarga y gestion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-Abliterated-CyberTiel-Calibrated-MTPv2-ICE-GGUF
- Mediciones crudas (`llama-perplexity`): https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-Abliterated-CyberTiel-Calibrated-MTPv2-ICE-GGUF/tree/main/measurements
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Variante con salvaguardas del mismo autor: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-TIEL-Calibrated-MTPv2-ICE-GGUF
- Repositorio de la escalera `UD` de referencia (imatrix y plantilla de chat compartidas): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a contenidos sin relacion sobre la localidad de Steyr, Austria).
