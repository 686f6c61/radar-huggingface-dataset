# NeuR0mancR/Scotoma-2-31B-MTP-GGUF

## Resumen

Scotoma-2-31B-MTP-GGUF es la distribucion en formato GGUF de un modelo borrador (drafter) de prediccion multi-token (MTP) disenado para acelerar la decodificacion especulativa de ReadyArt/gemma-4-31B-it-scotoma-2, un modelo afinado de Gemma 4 de 31B orientado a roleplay y escritura creativa. Lo desarrolla el usuario NeuR0mancR y sustituye al drafter oficial de Google: no altera el texto que genera el modelo principal, solo la velocidad a la que lo produce.

El modelo no es un generador autonomo. Se carga junto al modelo principal mediante `--model-draft` en llama.cpp y propone tokens candidatos que el modelo grande verifica en paralelo. Su utilidad es puramente de inferencia: reduce el coste por token generado en despliegues de Scotoma-2 sin tocar la calidad del output.

Los pesos publicados son de pequeno tamano (el repo ocupa 0,9 GB y el safetensors declarado suma 469.518.852 parametros, es decir, unos 470M), coherente con la funcion de drafter. La ficha se publico el 7 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador de prediccion multi-token (MTP drafter); arquitectura interna detallada no disponible |
| Parametros totales | 469.518.852 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (build de referencia) y Q4_0 (aproximadamente un punto menos de aceptacion, misma velocidad según el autor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | GGUF (libreria `gguf`); el modelo base tambien se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter MTP para decodificacion especulativa. En este esquema, un modelo pequeno propone varios tokens futuros y el modelo grande los valida en una sola pasada, aceptando el prefijo correcto y descartando el resto. El autor indica que fue entrenado sobre Scotoma-2 (el nombre del artefacto, `mtp_drafter_scotoma2_31B`, lo sugiere) y que reemplaza al drafter oficial de Google para Gemma 4 31B.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la arquitectura interna del borrador (numero de capas, dimension oculta, mecanismo de atencion). La innovacion relevante es su integracion con el modo `draft-mtp` de llama.cpp mediante los parametros `--spec-type draft-mtp`, `--spec-draft-n-max 4` y `--spec-draft-p-min 0.0`.

## Capacidades

- Decodificacion especulativa: propone hasta 4 tokens candidatos por paso (`--spec-draft-n-max 4`) para que el modelo principal los verifique.
- Aceleracion de inferencia: el autor reporta aproximadamente +2% de tokens por segundo frente al drafter de Google a temperatura 1, tanto en Q8_0 como en Q4_0.
- Compatibilidad con llama.cpp: se carga con `llama-server` mediante `--model-draft` y el tipo especulativo `draft-mtp`.
- No genera texto de forma autonoma: requiere el modelo principal (Gemma 4 31B Scotoma-2) cargado en paralelo.
- No se declaran capacidades de tool calling, agentes, vision, audio ni modo thinking; el modelo hereda el rol de su modelo principal (roleplay y escritura creativa).
- Soporte multilingue: no disponible.

## Casos de uso

- Aceleracion de servidores de roleplay: desplegar Scotoma-2 con este drafter en llama.cpp para reducir la latencia de generacion en conversaciones multi-turno, manteniendo intacto el estilo y el contenido del modelo principal.
- Escritura creativa interactiva: en herramientas de generacion de narrativa donde el usuario espera respuesta fluida, el drafter mejora el throughput a temperatura 1, que es el regimen tipico de este tipo de tareas.
- Inferencia en hardware de gama alta con memoria limitada: al ocupar menos de 1 GB en Q8_0, el drafter anade poca presion de VRAM sobre el modelo principal cuantizado (por ejemplo, Q4_K_M).
- Benchmarking de decodificacion especulativa: comparar la aceptacion del drafter propio frente al de Google en un mismo servidor llama.cpp para medir la ganancia real en el hardware objetivo.
- Servicios de generacion por lotes: en pipelines que priorizan tokens por segundo sobre latencia de primer token, la mejora de throughput se traduce en menor coste por peticion.
- Prototipado de configuraciones de despliegue: probar distintas combinaciones de cuantizacion (Q8_0 frente a Q4_0) y de `--spec-draft-n-max` para ajustar el equilibrio entre velocidad y tasa de aceptacion.

## Benchmarks y rendimiento

El unico dato publicado es la mejora de velocidad reportada por el autor en un NVIDIA GB10 con llama.cpp:

| Metrica | Drafter de Google | Scotoma-2-31B-MTP (Q8_0 y Q4_0) | Condiciones |
|---|---|---|---|
| Tokens por segundo | referencia | aproximadamente +2% | temperatura 1, llama.cpp, NVIDIA GB10 |
| Modo greedy | referencia | mejora marginal | llama.cpp, NVIDIA GB10 |
| Aceptacion Q4_0 frente a Q8_0 | no aplica | aproximadamente 1 punto menos | segun el autor, misma velocidad |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es esperable en un modelo borrador que no genera de forma autonoma.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para el drafter en Q8_0 (el repositorio completo ocupa 0,9 GB); Q4_0 reduce aun mas el espacio.
- Requiere ademas el modelo principal Gemma 4 31B Scotoma-2 cuantizado, cuyo consumo de VRAM depende de la cuantizacion elegida (por ejemplo, Q4_K_M en el ejemplo del autor).
- GPU recomendadas: el autor valido el rendimiento en un NVIDIA GB10; no se publican pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo junto al modelo principal siempre que la VRAM total permita cargar ambos; el drafter por si solo es de tamano minimo.
- Opciones de despliegue: llama.cpp (`llama-server` con `--spec-type draft-mtp` y `--model-draft`). Otros motores (vLLM, TGI, Ollama) no se mencionan en la informacion disponible.
- Latencia y throughput: mejora de aproximadamente +2% en tokens por segundo a temperatura 1 en NVIDIA GB10; sin datos de latencia absoluta.

## Comparativa con modelos similares

| Modelo | Funcion | Parametros | Formato | Licencia | Rendimiento relativo |
|---|---|---|---|---|---|
| Scotoma-2-31B-MTP (este) | Drafter MTP para Gemma 4 31B Scotoma-2 | 469.518.852 | GGUF (Q8_0, Q4_0) | apache-2.0 | +2% t/s frente al drafter de Google en GB10, temperatura 1 |
| Drafter oficial de Google para Gemma 4 | Drafter MTP de referencia | no disponible | no disponible | no disponible | referencia base |
| ReadyArt/gemma-4-31B-it-scotoma-2 | Modelo principal afinado (roleplay, escritura creativa) | 31B (por el nombre) | safetensors y GGUF (Q4_K_M en el ejemplo) | no disponible | modelo verificado, no comparable como drafter |

No se dispone de informacion sobre otros drafters de terceros para Gemma 4 con los que comparar directamente.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: sin el modelo principal cargado no produce texto util.
- La mejora reportada es modesta (aproximadamente +2% en tokens por segundo) y se midio en un unico hardware (NVIDIA GB10) y configuracion; puede no reproducirse en otras GPU o versiones de llama.cpp.
- En modo greedy la mejora es marginal, segun el propio autor.
- Q4_0 pierde aproximadamente un punto de aceptacion frente a Q8_0; conviene validar la tasa de aceptacion en el caso de uso concreto.
- No se publican datos sobre sesgos, riesgo de alucinacion ni comportamiento multilingue del drafter; al no generar texto propio, estos riesgos recaen en el modelo principal.
- La licencia declarada es apache-2.0, pero el model card enlaza a la licencia de Gemma 4; conviene revisar ambas antes de un uso comercial.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.
- No hay informacion sobre contexto maximo soportado ni sobre compatibilidad con motores distintos de llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuR0mancR/Scotoma-2-31B-MTP-GGUF
- Modelo base (safetensors): https://huggingface.co/NeuR0mancR/Scotoma-2-31B-MTP
- Modelo principal: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Perfil del autor: https://huggingface.co/NeuR0mancR
- Perfil de ReadyArt: https://huggingface.co/ReadyArt
- Perfil de AesSedai: https://huggingface.co/AesSedai
- Perfil de Google (drafter base): https://huggingface.co/google
