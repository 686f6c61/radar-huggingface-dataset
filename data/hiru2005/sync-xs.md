# hiru2005/Sync-XS

## Resumen

Sync-XS es un pack de expertos re-cuantizado del modelo Qwen3.8-Flash-Next, publicado por el usuario independiente hiru2005 bajo el identificador `hiru2005/Sync-XS`. No se trata de un modelo entrenado desde cero, sino de una re-cuantizacion de los expertos enrutados del modelo base de Qwen en un formato trellis de la familia Gyro / QTIP, con ancho de bits elegido por experto. Su objetivo es reducir los requisitos de memoria del modelo original para que pueda ejecutarse en un PC de consumo con 24 GB de RAM o menos, a costa de una perdida de fidelidad respecto al modelo de referencia.

La relevancia de este artefacto es doble. Por un lado, explora tecnicas de cuantizacion agresiva sobre arquitecturas MoE, un terreno donde los metodos tradicionales por bloques tienen dificultades por la dispersion de los expertos. Por otro lado, su uso esta atado a un runtime propietario y experimental, Sync-Strata, un fork del proyecto Strata, lo que lo aleja de los formatos estandar del ecosistema (no es GGUF, no carga en llama.cpp). El propio autor lo etiqueta como experimental y las cifras de velocidad aun estan pendientes de medir.

El repositorio ocupa 24,1 GB e incluye unicamente los pesos densos y los expertos re-cuantizados; el resto de componentes (embeddings, tabla n-gram/PLE, tokenizer, proyeccion multimodal) vive en un repositorio compartido, `hiru2005/Sync-shared`. La licencia declarada es la Qwen Community License 1.0, heredada del modelo base. No se dispone de informacion publica sobre arquitectura interna, numero de parametros ni longitud de contexto del modelo original en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (hereda la del modelo base Qwen3.8-Flash-Next; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion trellis de la familia Gyro / QTIP, ancho de bits por experto (no es GGUF ni GPTQ/AWQ) |
| Idiomas soportados | no disponible (la calibracion cubre codigo, documentacion, enciclopedias, varios idiomas y trazas de agente, sin listado cerrado) |
| Licencia | Qwen Community License 1.0 (etiquetada como `other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | Pesos propietarios del runtime Sync-Strata; no compatible con llama.cpp, GGUF ni Strata upstream |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, de la familia Qwen, y la relacion declarada es `quantized`. Sobre esa base, el autor ha re-cuantizado los expertos enrutados a un formato trellis de la familia Gyro / QTIP, con un ancho de bits elegido por experto. Los pesos densos tambien se incluyen en el pack, mientras que los embeddings, la tabla n-gram/PLE y otros componentes se delegan al repositorio compartido `hiru2005/Sync-shared`. Esta separacion implica que el pack no es autocontenido: necesita descargarse junto con las partes compartidas (`native-gguf`, `mtp-rt`, `tokenizer` y, opcionalmente, `mmproj`) para funcionar.

La calibracion se realizo con texto publico (codigo, documentacion, articulos enciclopedicos en varios idiomas y trazas de agente) y con cierto volumen de logs de chat del propio autor, cuyo texto no se distribuye. No hay informacion sobre datos de entrenamiento del modelo base, procesos de RLHF/DPO, ni innovaciones de decodificacion mas alla del soporte de "tail skip" (R4, R7, R10) en el runtime. Las tecnicas de cuantizacion referenciadas son QTIP (Tseng et al., 2024) y el formato Gyro de agentionai.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, sujetas a la degradacion introducida por la cuantizacion (fidelidad Top-1 del 81,46 %).
- Codigo: la evaluacion por dominios muestra un comportamiento estable en el dominio `code` (+0,7 % frente a la forma anterior de Sync-XS).
- Capacidades multilingues: la calibracion incluye varios idiomas y la evaluacion reporta dominios `english`, `ja_docs`, `ja_lit`, `ja_chat` y `multilingual`; el listado oficial de idiomas no esta disponible.
- Uso en agentes: el dominio `agent` es el que presenta mayor desviacion (+5,5 % frente a la forma previa), por lo que el rendimiento en tareas de agente es el mas afectado por la cuantizacion.
- Soporte multimodal: el runtime contempla un componente `mmproj` opcional en las partes compartidas, aunque no se detalla que modalidades cubre.
- Tool calling / function calling: no confirmado explicitamente para este pack; depende de lo que soporte el modelo base, extremo no documentado en la informacion disponible.
- Thinking mode, audio u otras capacidades especiales: no disponible.

## Casos de uso

- **Inferencia local en PC de gama media**: el pack esta pensado para equipos con 24 GB de RAM o menos y una GPU NVIDIA RTX 30/40 (driver R580 o superior), de modo que un usuario sin estacion de trabajo profesional pueda ejecutar un MoE grande con el runtime Sync-Strata.
- **Experimentacion con cuantizacion trellis**: util para investigadores que quieran medir el impacto de anchos de bits variables por experto en la fidelidad de un MoE, comparando KL y Top-1 contra el modelo original.
- **Prototipado de agentes en local con advertencias**: puede servir para iterar en flujos de agente fuera de la nube, a sabiendas de que el dominio `agent` es el mas degradado (+5,5 % de desviacion en la evaluacion).
- **Desarrollo y depuracion de codigo en local**: el dominio `code` se mantiene practicamente intacto (+0,7 %), por lo que el modelo puede usarse como asistente de programacion en editor sobre hardware de consumo.
- **Traduccion y trabajo con documentacion tecnica**: los dominios `docs` y `multilingual` presentan desviaciones minimas (-0,6 % y -0,2 %), lo que lo hace aceptable para tareas de redaccion tecnica en varios idiomas.
- **Evaluacion comparativa de runtimes**: como banco de pruebas para comparar Sync-Strata con Strata upstream o con variantes GGUF como IQ3_XXS, ya que el autor publica metricas de KL relativas entre ellos.
- **Educacion y divulgacion**: permite mostrar en un equipo de consumo como se comporta un MoE cuantizado frente al original, con cifras de perplejidad y acuerdo Top-1 medibles.

## Benchmarks y rendimiento

Evaluacion `eval_v4` del autor (8 dominios, 1.400 ventanas; profesor = GGUF Q8_0 del modelo original). Las cifras de KL son respecto al original (menor es mejor).

| Metrica | Sync-XS |
|---|---:|
| KL al modelo original (todas las posiciones) | 0,2851 |
| Acuerdo Top-1 con el modelo original | 81,46 % |
| Perplejidad | 4,958 |
| p99 | 3,47 |

Comparacion relativa en "escala B" (signo negativo = Sync-XS mas cercano al original):

| Comparado con | Sync-XS es |
|---|---:|
| Gyro-S (upstream) | -16,1 % (mejor; solo `docs` +1,2 %) |
| IQ3_XXS | +48,7 % |
| Gyro-M (upstream) | +39,3 % |
| Sync-S (KL 0,2310) | +34,8 % |
| Sync-M (KL 0,1642) | +102,2 % |

Desglose por dominio frente a la forma anterior de Sync-XS: `english` +2,1 %, `ja_docs` -0,4 %, `ja_lit` +0,1 %, `ja_chat` -2,2 %, `code` +0,7 %, `docs` -0,6 %, `multilingual` -0,2 %, `agent` +5,5 % (el peor).

Rendimiento de velocidad: no disponible. La tabla de `jbench decode (tok/s)` y `dsh chat (tok/s)` figura como "To be measured" tanto en Windows como en Linux, y no hay cifras para GTX 10 ni Radeon.

## Requisitos de hardware

- **RAM/VRAM**: recomendado para PCs con 24 GB de RAM o menos. Los minimos de RAM y VRAM estan por medir segun el autor.
- **GPU soportadas**: NVIDIA RTX 30/40 series con driver R580 o superior (soporte confirmado). RTX 20, GTX 16 y RTX 50 se esperan funcionales pero no verificadas. GTX 10, Radeon RX 6000/7000/9000 y las iGPU Radeon de Ryzen AI Max (Strix Halo: 8060S, 8050S, 8040S) son experimentales y no verificadas. Otras iGPU e Intel no soportadas.
- **CPU**: se requiere AVX2.
- **Almacenamiento**: NVMe recomendado; el pack (24,1 GB) debe convivir con las partes compartidas (`native-gguf`, `mtp-rt`, `tokenizer`, `mmproj` opcional).
- **Despliegue**: exclusivamente mediante Sync-Strata (fork de Strata). No carga en llama.cpp, Ollama, vLLM ni TGI; no es GGUF.
- **Latencia y throughput**: no disponibles (pendientes de medir). El hardware de referencia del autor es Ryzen 7 7800X3D, 32 GB DDR5, RTX 3080 12 GB y NVMe.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL / calidad | Licencia | Runtime |
|---|---|---|---|---|---|
| Sync-XS | no disponible (MoE) | no disponible | KL 0,2851; Top-1 81,46 % | Qwen Community 1.0 | Sync-Strata |
| Gyro-S (upstream) | no disponible (mismo base) | no disponible | KL relativo +16,1 % peor que Sync-XS | Qwen Community 1.0 (heredada) | Strata |
| Sync-S | no disponible (mismo base) | no disponible | KL 0,2310 (mejor que Sync-XS) | Qwen Community 1.0 | Sync-Strata |
| Sync-M | no disponible (mismo base) | no disponible | KL 0,1642 (mejor que Sync-XS) | Qwen Community 1.0 | Sync-Strata |
| IQ3_XXS (GGUF) | no disponible | no disponible | KL +48,7 % peor que Sync-XS | Qwen Community 1.0 (heredada) | llama.cpp |

Los datos de parametros, contexto y rendimiento absoluto del modelo base Qwen3.8-Flash-Next no estan disponibles en la informacion proporcionada, por lo que la comparativa se limita a las metricas de fidelidad publicadas por el autor.

## Limitaciones y advertencias

- **Caracter experimental**: el propio autor etiqueta el modelo como experimental; las cifras de velocidad no estan medidas y el soporte de hardware esta parcialmente sin verificar.
- **Dependencia de un runtime propietario**: solo funciona con Sync-Strata, un fork de Strata; no es portable a llama.cpp, Ollama, vLLM ni TGI.
- **Pack no autocontenido**: requiere descargar `hiru2005/Sync-shared`; sin esas partes el modelo no arranca.
- **Degradacion medible**: acuerdo Top-1 del 81,46 % con el original y KL de 0,2851; el dominio `agent` es el mas afectado (+5,5 % de desviacion frente a la forma previa).
- **Riesgo de alucinacion**: heredado del modelo base y potencialmente agravado por la cuantizacion; no hay evaluacion especifica de factualidad.
- **Idiomas**: la lista oficial no esta disponible; la cobertura se infiere de la calibracion y del desglose por dominios (ingles, japones, multilingue).
- **Licencia**: Qwen Community License 1.0. Productos comerciales con mas de 100 millones de usuarios activos mensuales o 20 millones de USD de ingresos mensuales deben mostrar el nombre del modelo; el uso como Model-as-a-Service o asistente laboral de IA requiere licencia separada de Qwen. Hay que conservar el archivo `LICENSE` en cada copia.
- **Reproducibilidad**: la calibracion incluye logs de chat privados del autor que no se distribuyen, lo que impide reproducir exactamente la cuantizacion.
- **Sesgos**: no documentados; se heredan del corpus del modelo base y de la calibracion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hiru2005/Sync-XS
- Partes compartidas: https://huggingface.co/hiru2005/Sync-shared
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime Sync-Strata: https://github.com/hiruhiru2005/sync-strata
- Strata upstream: https://github.com/Niko1221/Strata
- Gyro-S GGUF de referencia: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- llama.cpp / ggml: https://github.com/ggml-org/llama.cpp
- Pagina de donaciones del autor: https://ko-fi.com/hiruhiru2005
