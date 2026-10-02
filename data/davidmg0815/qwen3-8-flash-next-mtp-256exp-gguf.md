# Davidmg0815/Qwen3.8-Flash-Next-MTP-256exp-GGUF

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un cabezal de prediccion multi-token (MTP) en formato GGUF pensado para acelerar la decodificacion especulativa del modelo Qwen3.8-Flash-Next, un MoE de 176B parametros podado de 512 a 256 expertos por ISTA-DASLab. El autor, Davidmg0815, parte del cabezal original de unsloth (4,1 GB, 512 expertos) y lo rebanada a 256 expertos, reduciendo el archivo a 2,8 GB (2.619.602.688 parametros) a cambio de una tasa de aceptacion menor.

El interes practico esta en que documenta, con mediciones, como hacer funcionar `--spec-type draft-mtp` en llama.cpp con un cabezal separado sobre un modelo podado: requiere un build con el PR "Qwen4Exp: add MTP" (#29761) mas un parche de un solo hunk incluido en el propio repositorio. En CPU el cabezal ofrece una mejora clara (+47 % de throughput con esta version, +61 % con la de 512 expertos); en la GPU probada por el autor la ganancia es desigual y reduce el contexto utilizable.

Es, por tanto, material de ingenieria de despliegue y de experimentacion con decodificacion especulativa, no un modelo conversacional autonomo. El repositorio tiene 0 descargas y 0 likes, y el propio autor advierte que las cifras son indicaciones de una sola ejecucion por celda, no benchmarks formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal de prediccion multi-token (MTP) con capa draft propia (`blk.48`) y enrutado MoE, para el modelo anfitrion Qwen3.8-Flash-Next (MoE, implementacion Qwen4Exp en llama.cpp) |
| Parametros totales | 2.619.602.688 (~2,62B) segun metadatos del repositorio |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para el cabezal; el contexto utilizable depende del modelo anfitrion. En las pruebas se sirvieron slots de 64K, 48K y 32K segun configuracion |
| Tipos de cuantizacion | Q8_0 (archivo `mtp-Qwen3.8-Flash-Next-256exp-Q8_0.gguf`); el modelo principal referenciado en los ejemplos usa IQ1_M |
| Idiomas soportados | no disponible (heredado del modelo anfitrion Qwen; en las pruebas se genero prosa en aleman) |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | GGUF; el repositorio incluye ademas un parche (`qwen4exp-mtp-only-kpool.patch`), un mapa de expertos (`expert_map.json`) y un script (`prune_head.py`) |

## Arquitectura y entrenamiento

El artefacto es un cabezal MTP separado: un archivo GGUF que se carga como modelo propio mediante el flag `-md` de `llama-server`, con su propio `expert_count` y su propia capa draft (`blk.48`). No hay entrenamiento ni ajuste fino: el autor rebanó los expertos de la capa draft del cabezal original de unsloth de 512 a 256, copiando bloques Q8_0 completos sin recuantizar y parcheando el campo `expert_count`. El cabezal de 512 expertos sin modificar funciona tal cual sobre el modelo de 256 expertos, porque el desajuste de numero de expertos no afecta a la carga.

La seleccion de que 256 expertos conservar es heuristica. El autor recupero `expert_map.json` de forma exacta y sin calibracion: los routers MoE (`blk.N.ffn_gate_inp.weight`) estan almacenados sin cuantizar (BF16) y son identicos byte a byte entre la release sin podar (`ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF`) y la podada, con similitud coseno de 1,0 y 256 indices unicos por capa (obtenidos por peticiones HTTP con rangos). Sin embargo, ese mapa no indica que expertos necesita el cabezal: el router de la capa draft (`blk.48`) no coincide con ninguno de los 48 routers del tronco (mejor similitud coseno de la puerta compartida: 0,12) y cada capa del tronco conserva un subconjunto distinto cuya union son los 512 expertos. Por ello se mantuvieron los 256 expertos presentes en mas capas del tronco. La capa draft no se reentreno.

## Capacidades

- Decodificacion especulativa MTP: actua como modelo borrador para proponer tokens que el modelo anfitrion verifica, con `--spec-type draft-mtp` y control del numero de tokens borrador via `--spec-draft-n-max`.
- Aceleracion de inferencia en CPU: incremento medido de hasta +47 % de throughput en el escenario de prueba (8 hilos, contexto 4096, prompt de codigo, 160 tokens).
- Aceleracion en GPU, condicionada: ganancias de entre +4 % y +23 % en codigo, con perdidas de entre -3 % y -32 % en prosa en la configuracion probada.
- Integracion con llama.cpp: pensado para `llama-server` con carga de cabezal separado (`-md`), no para inferencia independiente.
- Ajuste de memoria del cabezal: soporta desplazamiento del cabezal a otra tarjeta y cuantizacion de su propia cache KV (`-devd`, `--tensor-split`, `-ctkd`, `-ctvd`).
- No es un modelo de chat ni de generacion autonoma: no se documentan capacidades de razonamiento, codigo, vision, tool calling ni agentes para este artefacto.
- Variante `shared` no soportada: el formato `nextn_shared_target_tensors` es rechazado por llama.cpp upstream con el error `tensor 'token_embd.weight' not found`.

## Casos de uso

- Acelerar inferencia de Qwen3.8-Flash-Next en CPU: en equipos sin GPU suficiente, cargar el modelo principal con `-md mtp-Qwen3.8-Flash-Next-256exp-Q8_0.gguf` y `--spec-type draft-mtp` eleva el throughput de 3,49 a 5,13 tok/s en el escenario medido, lo que hace viable servir un MoE de 176B en hardware modesto.
- Servicio de generacion de codigo en GPU con presupuesto de memoria limitado: usando `n-max 2` sobre slots de 64K se midio 67,1 tok/s en codigo frente a 61,5 tok/s sin especulacion, con la ventaja de que el cabezal de 2,8 GB ocupa menos VRAM que el original de 4,1 GB.
- Despliegue multi-slot con `llama-server`: la combinacion `-devd CUDA0 --tensor-split 45,55 -ctkd q5_1 -ctvd q5_1` permite alojar el cabezal en la primera tarjeta y mantener tres slots de 48K estables (64,0 tok/s en codigo), util para servir varios usuarios concurrentes.
- Reproduccion de experimentos de decodificacion especulativa: el repositorio incluye el parche, el mapa de expertos y el script de poda, lo que permite auditar y repetir el proceso de reduccion de expertos del cabezal sobre otras releases podadas.
- Evaluacion comparativa de cabezales MTP: sirve como punto de comparacion frente al cabezal completo de 512 expertos para medir el coste en tasa de aceptacion (74,8 % frente a 81,7 %) y en tamano de archivo (2,8 GB frente a 4,1 GB).
- Investigacion sobre seleccion de expertos en cabezales de borrador: el autor senala explicitamente que una seleccion basada en estadisticas de uso del router draft probablemente funcionaria mejor, lo que convierte este repositorio en una base para experimentar con criterios alternativos de poda.
- Integracion en pipelines internos de CI/CD o de generacion masiva de codigo donde el coste por token en CPU sea el cuello de botella, siempre que se acepte la perdida de rendimiento en prosa descrita por el autor.

## Benchmarks y rendimiento

El autor advierte que son mediciones de una sola ejecucion por celda, con temperatura 0, sin modo thinking, y que deben tratarse como indicaciones, no como benchmarks formales.

CPU, 8 hilos, contexto 4096, un prompt de codigo, 160 tokens:

| Configuracion | tok/s | Tasa de aceptacion del borrador |
|---|---|---|
| Sin especulacion | 3,49 | - |
| Cabezal original, 512 expertos | 5,61 (+61 %) | 81,7 % (98/120) |
| Este cabezal, 256 expertos | 5,13 (+47 %) | 74,8 % (95/127) |

GPU, 2 tarjetas de 20 GB, 3 slots, KV en q5_1, 3 ejecuciones de 400 tokens, mismo build en todas las filas. Linea base sin cabezal: 61,5 tok/s tanto en codigo como en prosa; `ngram-map-k` no aporta nada (60,3 / 61,5).

| Configuracion | Codigo (tok/s) | Prosa en aleman (tok/s) | Notas |
|---|---|---|---|
| Cabezal 256, 3x64K, n-max 1 | 55,4 | 49,4 | |
| Cabezal 256, 3x64K, n-max 2 | 67,1 | 50,3 | |
| Cabezal 256, 3x64K, n-max 3 | 70,5 | 59,6 (45-70) | Inestable: OOM de CUDA con tres prompts paralelos de 54k |
| Cabezal 256, 3x64K, n-max 3, p-min 0,6 | 58,9 | 41,2 | |
| Cabezal 256, 3x48K, n-max 3 | 64,0 | 41,9 | Estable con tres prompts paralelos de 39k |
| Cabezal original 512, 3x32K, n-max 3 | 75,5 | 54,3 | No probado bajo carga |
| Cualquiera de los dos cabezales, 3x96K | - | - | No carga |

Veredicto del autor para su hardware: en codigo +4 % a +23 %, en prosa -3 % a -32 %, y el contexto utilizable baja de 3x96K a 3x48K (cabezal de 256) o 3x32K (cabezal original). En esa GPU dejo el MTP desactivado; en CPU lo considera rentable.

## Requisitos de hardware

- Tamano del artefacto: 2,8 GB en Q8_0 para el cabezal podado a 256 expertos; 4,1 GB para el cabezal original de 512 expertos. Ambos cifras son solo del cabezal, no del modelo anfitrion.
- Modelo anfitrion: Qwen3.8-Flash-Next es un MoE de 176B parametros podado de 512 a 256 expertos; en los ejemplos se usa la cuantizacion IQ1_M partida en dos ficheros (`Qwen3.8-Flash-Next-GSQ-RCO-IQ1_M-00001-of-00002.gguf`).
- GPU probadas: 2 tarjetas de 20 GB. Con el cabezal y su contexto juntos en una sola tarjeta se consumen aproximadamente 3,2 GB, y en ese caso solo cargan 3x32K con el cabezal podado.
- Distribucion recomendada por el autor: `-devd CUDA0 --tensor-split 45,55 -ctkd q5_1 -ctvd q5_1`. `-devd` coloca el cabezal en la primera tarjeta y el reparto desigual le hace sitio; `-ctkd`/`-ctvd` importan porque la cache KV del propio cabezal es f16 por defecto.
- CPU: probado con 8 hilos y contexto 4096, alcanzando 5,13 tok/s con este cabezal y 5,61 tok/s con el de 512 expertos.
- Opciones de despliegue: exclusivamente llama.cpp (`llama-server`) con `-md` y `--spec-type draft-mtp`. Se requiere un build que incluya el PR "Qwen4Exp: add MTP" (#29761, 2026-10-01) mas el parche de un hunk de este repositorio; sin el parche, `-md` aborta con `GGML_ASSERT(buffer) failed` al arrancar el servidor.
- No se documentan datos de latencia distintos de los tok/s anteriores, ni soporte para vLLM, TGI, Ollama u otros motores.

## Comparativa con modelos similares

No se dispone de comparativas con cabezales MTP de otros proyectos. Los unicos terminos de comparacion documentados son variantes del mismo artefacto y la linea base sin especulacion.

| Alternativa | Tamano | Tasa de aceptacion (CPU) | Efecto en throughput | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este cabezal (256 expertos) | 2,8 GB | 74,8 % (95/127) | +47 % en CPU; +4 % a +23 % en codigo en GPU segun configuracion | qwen-community-1.0 | Repositorio Davidmg0815, 0 descargas |
| Cabezal original de unsloth (512 expertos) | 4,1 GB | 81,7 % (98/120) | +61 % en CPU; 75,5 tok/s en codigo con 3x32K en GPU | qwen-community-1.0 | `unsloth/Qwen3.8-Flash-Next-GGUF` |
| Sin especulacion (linea base) | - | - | 3,49 tok/s en CPU; 61,5 tok/s en GPU | qwen-community-1.0 | - |
| `ngram-map-k` | - | no disponible | Sin mejora: 60,3 / 61,5 tok/s | qwen-community-1.0 | llama.cpp |

## Limitaciones y advertencias

- La seleccion de los 256 expertos es heuristica (los que sobreviven en mas capas del tronco), no esta basada en el uso real del router de la capa draft, que no coincide con ninguno de los routers del tronco (mejor similitud coseno de 0,12).
- La capa draft no se reentreno, por lo que la tasa de aceptacion cae respecto al cabezal completo (74,8 % frente a 81,7 %).
- Requiere un build de llama.cpp no estandar: PR #29761 mas un parche local. Sin ambos, el servidor falla al arrancar con `GGML_ASSERT(buffer) failed`.
- En GPU el resultado es desigual: el autor midio perdidas de hasta -32 % en prosa y una reduccion del contexto utilizable de 3x96K a 3x48K o 3x32K. La configuracion con n-max 3 sobre 3x64K produjo OOM de CUDA con tres prompts paralelos de 54k.
- Las mediciones son de una sola ejecucion por celda y el propio autor pide tratarlas como indicaciones, no como benchmarks. No hay resultados de MMLU, HumanEval, GSM8K ni similares.
- La variante `shared` del cabezal no es soportada por llama.cpp upstream.
- Licencia `qwen-community-1.0` (`other`): hay que revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin validacion externa. El autor ya corrigio una version anterior de la model card, lo que indica que las cifras pueden cambiar.
- No es un modelo utilizable de forma autonoma: sin el modelo anfitrion y el build parcheado no genera nada.
- No disponible: sesgos conocidos, idiomas soportados y riesgo de alucinacion especificos de este artefacto (heredados, en su caso, del modelo anfitrion Qwen3.8-Flash-Next).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Davidmg0815/Qwen3.8-Flash-Next-MTP-256exp-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cabezal y GGUF de referencia: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Release podada y cuantizada por ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Release sin podar de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Pull request de llama.cpp "Qwen4Exp: add MTP": #29761 (2026-10-01), referenciado en la model card; URL no disponible en la informacion proporcionada
- Parche contra llama.cpp `46ca246` (`src/models/qwen4exp.cpp`): incluido en el repositorio como `qwen4exp-mtp-only-kpool.patch`
- Script de poda: incluido en el repositorio como `prune_head.py`
- Mapa de expertos: incluido en el repositorio como `expert_map.json`
