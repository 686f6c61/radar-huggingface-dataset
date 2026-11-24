# eriwar/qwen2.5-coder-1.5b-solana-operator

## Resumen

`eriwar/qwen2.5-coder-1.5b-solana-operator` es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba, desarrollado por el usuario eriwar. El modelo recibe como entrada una peticion de operacion sobre la red Solana junto con una descripcion del entorno, y produce exactamente un script de bash que ejecuta dicha operacion contra un validador local de Solana. No es un asistente general de Solana, sino un modelo de tarea especifica: sus scripts invocan la CLI `solana` y diez comandos auxiliares que no forman parte de ninguna instalacion estandar.

La relevancia del modelo reside en su enfoque de entrenamiento: combina SFT (supervised fine-tuning) sobre 85 scripts expertos verificados con GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo, donde cada rollout se ejecuto en un contenedor aislado con `solana-test-validator` y se puntuo mediante un verificador de estado de cadena. Esto lo convierte en un ejemplo practico de RL aplicado a generacion de scripts ejecutables con recompensa basada en ejecucion real.

Con 1.543.714.304 parametros (aproximadamente 1,5 mil millones), licencia Apache 2.0 y un tamano de repositorio de 3,1 GB en formato safetensors, el modelo esta pensado para despliegues ligeros y experimentacion en entornos de desarrollo blockchain. Su ventana de contexto heredada del modelo base y su naturaleza de tarea acotada lo hacen adecuado para pipelines de automatizacion, no para conversacion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max length 2048) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-Coder-1.5B-Instruct, sin modificaciones estructurales: el ajuste se realizo mediante LoRA (rank 16, alpha 32) en dos etapas, ambas fusionadas en los pesos publicados. La primera etapa fue un SFT sobre 85 scripts expertos verificados (17 tareas x 5 variantes de valor), durante 10 epocas con longitud maxima de 2048 tokens. La segunda etapa aplico GRPO partiendo del modelo SFT: 136 pasos, tamano de grupo 4, temperatura 0,9, learning rate 2e-5 y beta KL de 0,05.

La innovacion tecnica clave es el bucle de recompensa basado en ejecucion: cada rollout se ejecuto en un contenedor sandbox (sin red, 1 CPU, 2 GB de memoria) con `solana-test-validator` (Agave 2.3.13) y fue evaluado por un verificador que comprueba el estado de la cadena. La recompensa combina formato, exito de la tarea y un bonus de eficiencia condicionado al exito (scripts mas cortos puntuan mas alto). Se publico el checkpoint con mejor resultado en validacion held-out (paso 102). Las 17 tareas cubren consultas de balance, transferencias, creacion y fondeo de keypairs, despliegue de programas y cambios de autoridad de upgrade, llamadas a instrucciones Anchor (con argumentos struct y bytes, y PDAs), codificacion Borsh, lectura y simulacion de estado de cuentas, expectativa de errores de programa especificos, y flujos multi-paso que codifican ABI, aplican keccak y firman con secp256k1 antes de enviar.

## Capacidades

- Generacion de scripts bash ejecutables para operaciones concretas sobre un validador local de Solana.
- Consulta de balances mediante `solana balance <addr> --lamports`.
- Transferencias de SOL con `solana transfer`, incluyendo `--allow-unfunded-recipient` y `--keypair`.
- Creacion de keypairs con `solana-keygen new --no-bip39-passphrase -s -f -o` y extraccion de pubkey.
- Despliegue de programas y cambios de autoridad de upgrade con `solana program set-upgrade-authority`.
- Llamadas a instrucciones Anchor a traves de la CLI `sol-call` (construccion, firma, envio y simulacion).
- Derivacion de PDAs con `sol-pda` usando semillas `str:`, `pubkey:`, `hex:`, `u8:`, `u16le:`, `u32le:`, `u64le:`.
- Codificacion y decodificacion Borsh (`borsh-encode`, `borsh-decode`).
- Codificacion ABI de Ethereum (`abi-encode`) y operaciones con claves secp256k1 (`eth-keygen`, `eth-address`, `eth-sign`).
- Lectura y decodificacion de cuentas on-chain con IDL (`sol-account`).
- Composicion de flujos multi-paso que combinan ABI encoding, keccak256 y firma secp256k1 antes del envio.
- Extraccion de campos de salidas JSON con `jq` y de texto con `cut`.
- No soporta tool calling generico, agentes conversacionales ni multi-step reasoning abierto: su salida es un unico script.
- Capacidades multilingues limitadas al ingles en la practica (idioma declarado: en).

## Casos de uso

- Automatizacion de pruebas de integracion en Solana: el modelo genera scripts que despliegan programas y ejecutan instrucciones contra `solana-test-validator`, lo que permite montar suites de pruebas reproducibles en CI sin escribir el bash a mano.
- Aprovisionamiento de entornos de desarrollo: dado un entorno descrito, produce scripts que crean keypairs, los fondean y configuran autoridades de upgrade, acelerando la preparacion de entornos locales para equipos de desarrollo.
- Generacion de scripts de transferencia y consulta de balance: util para tareas operativas repetitivas donde se requiere mover SOL entre cuentas conocidas y verificar el estado resultante con `solana balance --lamports`.
- Ejecucion de llamadas Anchor complejas: el modelo construye invocaciones a `sol-call` con argumentos struct, bytes y PDAs derivadas, lo que simplifica la interaccion con programas Anchor desde scripts sin escribir codigo TypeScript.
- Flujos criptograficos multi-paso: combinando `abi-encode`, `eth-sign` y el envio posterior, el modelo puede generar scripts que firman payloads con secp256k1 y los someten a un programa, util en puentes o verificadores on-chain.
- Simulacion previa al envio: mediante `sol-call --simulate`, el modelo puede producir scripts que validan una instruccion antes de gastar lamports, adecuado para entornos de staging.
- Verificacion de errores esperados: el modelo genera scripts que provocan un error de programa concreto y comprueban el resultado, util para tests de regresion de programas Solana.
- No es adecuado para atencion al cliente, generacion de codigo general, razonamiento abierto ni tareas fuera del dominio Solana descrito.

## Benchmarks y rendimiento

La model card describe una evaluacion de 17 tareas held-out x 8 muestras (136 episodios), pero la informacion proporcionada se interrumpe antes de presentar los resultados numericos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,6 GB de pesos; en 4 bits, aproximadamente 0,8 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente en FP16 o cuantizacion; A100 y H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 8 GB o mas; en cuantizacion 4 bits cabe incluso en GPUs de 4 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no confirmado en la informacion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota: el modelo requiere en tiempo de ejecucion de los scripts un entorno con `solana` CLI (Agave 2.3.13), `solana-keygen`, `jq`, `cut` y los diez helpers descritos; el modelo en si solo genera el texto del script.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eriwar/qwen2.5-coder-1.5b-solana-operator | 1,5 B | no disponible | Generacion de scripts bash para Solana | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5 B | no disponible en la informacion | Codigo general e instrucciones | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7 B | no disponible en la informacion | Codigo general | Apache 2.0 | Hugging Face |
| Modelos generales tipo Llama 3.2 1B/3B | 1-3 B | no disponible en la informacion | Proposito general | Licencia Llama | Hugging Face / Meta |

El modelo se distingue de los alternativas generales por su especializacion estrecha en un dominio (Solana) y una tarea (scripts bash), a costa de perder capacidades conversacionales y de razonamiento general. Frente a Qwen2.5-Coder-1.5B-Instruct, su base, gana en precision para el dominio pero no es un sustituto para generacion de codigo general.

## Limitaciones y advertencias

- Modelo de tarea especifica: no es un asistente general de Solana ni de programacion; solo genera scripts para las 17 tareas cubiertas en entrenamiento.
- Dependencia de diez helpers no estandar (`sol-deploy`, `sol-call`, `sol-account`, `sol-pda`, `borsh-encode`, `borsh-decode`, `abi-encode`, `eth-keygen`, `eth-address`, `eth-sign`): sin ellos, los scripts no se ejecutan tal cual. El autor indica que hay que proporcionar equivalentes con los mismos argumentos y campos JSON de salida.
- Dependencia de convenciones de entorno concretas: RPC en `http://127.0.0.1:8899`, keypairs en `/keys/dev0.json` a `/keys/dev3.json`, artefactos en `/artifacts/target/deploy/` e IDLs en `/artifacts/target/idl/`, directorio `/work` escribible.
- Idioma: solo ingles declarado; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: puede generar comandos o flags inexistentes, especialmente fuera de las tareas vistas; el autor no documenta tasas de fallo.
- Entrenado con `solana-test-validator` (Agave 2.3.13); puede no funcionar contra versiones distintas de la CLI o de la red.
- Sin resultados de benchmarks publicados en la informacion disponible; no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Uso comercial permitido por Apache 2.0, pero la responsabilidad de adaptar los helpers y validar los scripts en produccion recae en el usuario.
- Cero descargas y cero likes en el momento de la consulta: modelo muy reciente y sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/eriwar/qwen2.5-coder-1.5b-solana-operator
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
