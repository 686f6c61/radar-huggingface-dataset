# mrsirg97-rgb/osmos-evo-1017

## Resumen

osmos-evo-1017 es un paquete de pesos cuantizados en formato GGUF para ejecutar el modelo DeepSeek-V4.1-Flash-1017 sobre hardware AMD Strix Halo (concretamente el Ryzen AI Max+ 395, arquitectura gfx1151, con 128 GB de memoria unificada). No se trata de un modelo entrenado desde cero, sino de una distribución de cuantizaciones optimizadas y un drafter de decodificación especulativa que el autor, mrsirg97-rgb, empaqueta junto a su herramienta libosmos. El modelo base es DeepSeek-V4.1-Flash-1017, con 96.323.502.080 parámetros totales según los safetensors del repositorio base.

La contribución principal del repositorio no son los pesos completos (que el instalador descarga desde los repositorios de unsloth, fijados a un commit y a un SHA-256), sino las diferencias y parches que permiten reconstruir dos packs propios, `osmos-evo` y `osmos-evo-A`, a partir de las cuantizaciones UD-IQ1_M y UD-IQ2_XXS de unsloth. Estos packs incorporan requantizaciones selectivas de tensores (expertos enrutados, atención y cabeza de salida) y un drafter DSpark de DeepSeek requantizado a IQ2_XS, con el objetivo de mejorar la calidad y la velocidad de decodificación en un equipo de consumo con memoria unificada.

El interés actual del repositorio radica en que demuestra una técnica de ajuste fino de cuantizaciones guiada por evaluación (midiendo divergencia KL contra los pesos originales y pruebas de recuperación a 1M de tokens), algo poco habitual en distribuciones GGUF. Todo el contenido es MIT y está pensado para un nicho muy concreto: inferencia local de un modelo de ~96B parámetros en un solo equipo AMD con 128 GB de memoria compartida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-V4.1-Flash-1017; presumiblemente transformer con expertos enrutados, no confirmado en la informacion) |
| Parametros totales | 96.323.502.080 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (segun la tabla de packs del repositorio) |
| Tipos de cuantizacion | GGUF: UD-IQ1_M, UD-IQ1_S, UD-IQ2_XXS (unsloth); IQ1_S, IQ2_XXS, Q2_K, Q5_K, Q8_0, MXFP4, MXFP8 en tensores concretos; drafter en IQ2_XS |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (parches y deltas; los pesos completos se descargan de repositorios externos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017 en la documentacion proporcionada; el repositorio solo describe el proceso de cuantizacion y empaquetado. Los indicios (expertos enrutados, router, proyecciones gate/up/down, bloques `mtp`) apuntan a una arquitectura de mezcla de expertos con decodificacion especulativa multi-token, pero no se confirma de forma explicita. Tampoco hay datos sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica del repositorio es el proceso de construccion de los packs. `osmos-evo-A` parte de UD-IQ1_M y aplica dos cambios evaluados contra los pesos originales: las proyecciones down de los expertos enrutados de las capas 20-39 se requantizan a Q2_K desde los originales MXFP4 con la matriz de importancia de unsloth, y la atencion (kv, q_a, q_b, output_a, output_b) y la cabeza de salida se requantizan a Q5_K mediante GPTQ. `osmos-evo` añade sobre esa base un parche que sustituye las proyecciones gate y up de los expertos enrutados de las capas 10-19 por las de UD-IQ2_XXS en IQ2_XXS. El drafter DSpark se empaqueta con matrices densas en Q8_0 y expertos en MXFP4, y luego se requantiza a IQ2_XS, reduciendolo de 7,97 a 4,68 GB. La seleccion de tensores se guio por una prueba de recuperacion a 1M de tokens (un codigo de acceso a 188K tokens de distancia) y biseccion de capas.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base DeepSeek-V4.1-Flash-1017, aunque no se detallan en la informacion disponible.
- Recuperacion de contexto largo: el repositorio documenta una prueba de recuperacion de un hecho a 188K tokens de distancia, con todos los hechos del test de 1M recordados y cada token de respuesta como primera eleccion del modelo.
- Decodificacion especulativa: incluye el drafter DSpark de DeepSeek (tres bloques `mtp`) requantizado, que permite decodificar en modo borrador con incrementos de velocidad de hasta ~85% en los packs medidos.
- Reproducibilidad bit a bit: la salida se declara reproducible bit a bit en las condiciones de la suite de evaluacion.
- Variante abliterada opcional: overlay `--abliterated` con el parche de huihui-ai (MIT), desactivado por defecto.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local de un modelo de ~96B en un solo equipo: el pack esta disenado para ejecutarse en un Ryzen AI Max+ 395 con 128 GB de memoria unificada, lo que permite tener un modelo grande en un equipo de sobremesa sin GPU dedicada de gran VRAM.
- Recuperacion de informacion en contextos muy largos: con 1.048.576 tokens de contexto y la prueba documentada de recuperacion a 188K tokens, es adecuado para analisis de repositorios completos, expedientes o transcripciones extensas en local.
- Decodificacion de baja latencia en hardware AMD: el drafter DSpark permite pasar de 17,7 a 32,8 tok/s en el pack por defecto, util para asistentes interactivos donde la velocidad de generacion importa.
- Flujos agénticos con trazas largas: el repositorio evalua explicitamente la divergencia KL sobre trazas de agente, lo que indica que el pack se ha optimizado para ese tipo de carga (razonamiento multi-paso con herramientas).
- Despliegue sin conexion o con requisitos de privacidad: al ejecutarse en local con pesos verificados por SHA-256, encaja en entornos donde no se puede enviar datos a la nube.
- Experimentacion con cuantizacion: sirve como caso de estudio reproducible para investigadores que quieran medir el impacto de requantizar tensores concretos (expertos, atencion, cabeza de salida) sobre la calidad, con comandos y numeros publicados en el repositorio.
- Reproduccion de resultados: la salida bit a bit reproducible y los SHA-256 fijados permiten replicar exactamente las mediciones de velocidad y calidad en otro equipo Strix Halo.

## Benchmarks y rendimiento

Los datos publicados son de calidad relativa (divergencia KL por token contra una referencia construida con los pesos originales, menor es mejor) y de velocidad de decodificacion en el hardware objetivo:

| Pack | KL Wiki text | KL trazas de agente | Top-1 (Wiki) | Hecho a 188K | Decode plano (tok/s) | Decode con drafter (tok/s) |
|---|---:|---:|---:|---:|---:|---:|
| `ud-iq2_xxs` | 0,126 | 0,036 | 92,4% | 0,983 | 14,2 | 26,0 |
| `osmos-evo` | 0,158 | 0,042 | 91,2% | 0,955 | 17,7 | 32,8 |
| `osmos-evo-a` | 0,175 | 0,0485 | 90,5% | 0,469 | 19,0 | 35,3 |
| `ud-iq1_m` | 0,190 | 0,048 | 90,3% | no disponible | 17,6 | 35,1 |

Condiciones de medida: decodificacion greedy con el perfil `performance` de AMD, 64K de contexto, tres preguntas de 256 tokens cada una y media de las tres. `osmos-evo` se midio en la version 0.7.6 de osmos y el resto en la 0.7.0. En el perfil `low-power`, `osmos-evo-A` decodifica 17,9 / 29,7 tok/s frente a 16,6 / 25,8 de UD-IQ1_M. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada. El repositorio no documenta otros equipos compatibles.
- VRAM/memoria estimada: el repositorio ocupa 61,7 GB, pero el pack final se compone de UD-IQ1_M (descargado de unsloth) mas el delta de 33,66 GB y el parche de 23,36 GB; el drafter ocupa 4,68 GB. El instalador dimensiona el presupuesto de expertos a la memoria libre de la GPU al arrancar (`--budget auto`).
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el repositorio no menciona soporte ni mediciones en estas GPU.
- Cabida en GPU de consumo: no hay datos para RTX 4090 u otras; el diseno asume memoria unificada de 128 GB.
- Opciones de despliegue: libosmos (instalador propio, `python3 tools/install/osmos_install.py osmos-evo --serve` o `--rig`), sobre llama.cpp/ggml para las herramientas de cuantizacion y ensamblado. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 17,7 tok/s en plano y 32,8 tok/s con drafter para `osmos-evo`; 19,0 / 35,3 para `osmos-evo-A`; 14,2 / 26,0 para UD-IQ2_XXS. La velocidad con drafter varia segun el prompt.
- Almacenamiento: en btrfs o XFS los bytes compartidos entre packs se clonan, por lo que el espacio extra es minimo.

## Comparativa con modelos similares

| Pack | Base | Calidad (KL trazas) | Top-1 Wiki | Hecho 188K | Decode plano / drafter (tok/s) | Licencia |
|---|---|---:|---:|---:|---:|---|
| `osmos-evo` | UD-IQ1_M + delta + parche | 0,042 | 91,2% | 0,955 | 17,7 / 32,8 | MIT |
| `osmos-evo-a` | UD-IQ1_M + delta | 0,0485 | 90,5% | 0,469 | 19,0 / 35,3 | MIT |
| `ud-iq1_m` (unsloth) | UD-IQ1_M | 0,048 | 90,3% | no disponible | 17,6 / 35,1 | MIT |
| `ud-iq2_xxs` (unsloth) | UD-IQ2_XXS | 0,036 | 92,4% | 0,983 | 14,2 / 26,0 | MIT |

La comparativa se limita a las cuantizaciones del mismo modelo base; no se dispone de datos frente a otros modelos de tamano o categoria similar. `osmos-evo` se situa a medio camino entre UD-IQ1_M y UD-IQ2_XXS en calidad, con 5,8 GB mas que `osmos-evo-A` y alrededor de un 5% menos de velocidad, y es un 25% mas rapido en plano y un 26% con drafter que UD-IQ2_XXS.

## Limitaciones y advertencias

- El repositorio no contiene los pesos completos: el instalador descarga UD-IQ1_M y UD-IQ2_XXS de unsloth; sin esos repositorios externos los parches no son utilizables.
- El hardware soportado es muy especifico (AMD Strix Halo, gfx1151, 128 GB); no hay evidencia de funcionamiento en otras GPU.
- Las mediciones de velocidad se tomaron en perfiles concretos de AMD (`performance` para la tabla principal, `low-power` para la comparativa de `osmos-evo-A`) y con una suite de tres preguntas, por lo que no representan cargas arbitrarias.
- La calidad se evalua con divergencia KL contra una referencia construida con los pesos originales, no con benchmarks estandar; no hay datos de MMLU, HumanEval o GSM8K.
- `osmos-evo-A` falla en la prueba de recuperacion a 188K tokens (0,469 frente a 0,955 de `osmos-evo`), lo que indica una degradacion clara en contextos muy largos para ese pack.
- El drafter reduce el tamano de 7,97 a 4,68 GB mediante requantizacion a IQ2_XS, lo que puede afectar a la tasa de aceptacion segun el prompt.
- La variante abliterada es opcional y esta desactivada por defecto; debe evaluarse antes de usarla en produccion.
- No hay informacion sobre sesgos, tasas de alucinacion ni idiomas soportados del modelo base en la documentacion proporcionada.
- La licencia MIT del repositorio cubre los parches y el empaquetado; conviene verificar la licencia del modelo base DeepSeek-V4.1-Flash-1017 antes de un uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mrsirg97-rgb/osmos-evo-1017
- Repositorio libosmos: https://github.com/mrsirg97-rgb/libosmos
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizaciones de unsloth: no disponible (referenciadas como UD-IQ1_M, UD-IQ1_S y UD-IQ2_XXS, sin URL en la informacion proporcionada)
- Proyecto Maya (`tools/ds4/drafter_pack.py`): no disponible (sin URL en la informacion proporcionada)
- llama.cpp: no disponible (referenciado como origen de los cuantizadores ggml, sin URL en la informacion proporcionada)
- Parche abliterado de huihui-ai: no disponible (sin URL en la informacion proporcionada)
