# diode37/MANATO-MoE-2B

## Resumen

MANATO 0.5 (`MoE-2B`) es un modelo de lenguaje jerarquico a nivel de byte desarrollado por el autor independiente diode37 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo entrenado desde cero (from scratch) sin atencion cuadratica estandar de Transformer, construido sobre una arquitectura propia denominada Memory Mosaics combinada con un esquema H-Net de chunking dinamico en dos etapas (byte y subword/frase). Cuenta con 1.890 millones de parametros totales y 737 millones de parametros activos por token, gracias a un esquema de mezcla de expertos (MoE) disperso con Top-2.

El modelo destaca por empaquetar en el mismo repositorio tanto los pesos entrenados (en INT8, BF8 y BF16) como el motor de inferencia completo en PyTorch puro, una CLI, una interfaz web y un notebook de Colab. Su diseno esta orientado a la inferencia en CPU y GPU de consumo, con un checkpoint INT8 de 1,88 GB que funciona en 3,85 GB de RAM en CPU y alcanza entre 165 y 247 caracteres por segundo en una RTX 3060.

Es relevante ahora por su enfoque neuro-simbolico: incorpora compuertas deterministas en CPU (`TraceALU` para aritmetica exacta y `ByteFSMJsonSchemaEnforcer` para garantizar JSON valido al 100 %) y un mecanismo de reloj dual asimetrico lectura/escritura que evita ejecutar la red profunda de 24 capas en aproximadamente el 90-91 % de los bytes de superficie. Se posiciona como una vista previa de investigacion (etapa 0.5) centrada en eficiencia, estructura y determinismo mas que en fluidez o conocimiento factual general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Memory Mosaics + H-Net jerarquico a nivel de byte, sin atencion cuadratica estandar; MoE disperso Top-2 con memoria persistente clusterizada (`P_k` / `P_v`) y `DeltaBank` asociativo |
| Parametros totales | 1,89 B (1.890 millones) |
| Parametros activos | 737 M |
| Longitud de contexto | no disponible (se documentan pruebas de extraccion needle en 16 KB y 64 KB) |
| Tipos de cuantizacion | INT8 (escala BF16 por canal), BF8 (`torch.float8_e5m2`), BF16 (precision completa) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch): `manato-moe-2b-int8.pt`, `manato-moe-2b-bf8.pt`, `manato-moe-2b-bf16.pt` |

Detalle de las etapas internas segun la model card:

| Etapa | Dimension | Notas |
|---|---|---|
| Stage 0 (capa de byte) | d = 768 | Vocabulario de 256 bytes UTF-8 crudos, sin tokenizador |
| Stage 1 (capa subword/frase) | d = 1280 | Chunking dinamico |
| Stage 2 (`MainNet`, razonamiento profundo) | d = 2304 | 24 capas, MoE Top-2 + memoria persistente + `DeltaBank` |

## Arquitectura y entrenamiento

El modelo abandona la autoatencion cuadratica clasica en favor de Memory Mosaics, una familia de arquitecturas asociativas, combinada con un esquema H-Net de dos etapas de chunking dinamico byte/palabra. La capa de byte (Stage 0, d = 768) opera sobre un vocabulario de 256 bytes UTF-8 sin tokenizador; la capa intermedia (Stage 1, d = 1280) agrupa en subwords o frases; y la `MainNet` (Stage 2, d = 2304, 24 capas) concentra el razonamiento profundo mediante MoE Top-2, memoria persistente clusterizada y un `DeltaBank` asociativo.

La innovacion central es el reloj dual asimetrico lectura/escritura con MTP multi-byte en Stage 0: la red profunda de 24 capas se omite en aproximadamente el 90-91 % de los bytes de superficie, y las escrituras de memoria asociativa solo se consolidan en fronteras de chunk semantico aprendidas. Ademas, incorpora compuertas de compilacion deterministas en CPU (enfoque neuro-simbolico "Option B"): `TraceALU` compila en linea aritmetica, conversion de unidades y calculo de fechas sin error, y `ByteFSMJsonSchemaEnforcer` es una maquina de estados finitos a nivel de byte que fuerza adherencia a JSON Schema. Los pesos de Stage 2 (`norm1` y `topic_carrier_proj`) estan reequilibrados mediante shifts exactos de potencia de 2 (gauge de Osborne inverso), preservando salidas `bfloat16` identicas bit a bit y protegiendo la fidelidad de cuantizacion INT8/BF8 (coseno medio de 0,9926).

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. La model card indica que el entrenamiento se realizo desde cero en dos GPU de consumo.

## Capacidades

- Generacion de texto a nivel de byte sin tokenizador, con soporte nativo de UTF-8 multibyte (incluido japones).
- Razonamiento estructurado y generacion de JSON conforme a esquema con validez sintactica garantizada del 100 % mediante `ByteFSMJsonSchemaEnforcer`.
- Aritmetica exacta, conversion de unidades y calculo de fechas mediante `TraceALU` (por ejemplo, `38*47=1786` resuelto de forma determinista).
- Formateo de llamadas a herramientas y agentes (documentado con benchmark propio `val_agent_tool`).
- Extraccion de informacion en contexto largo (pruebas needle de 16 KB y 64 KB con salida JSON).
- Enrutamiento de bytes con estado constante mediante el reloj dual, con coste computacional reducido en la mayoria de bytes.
- Capacidades multilingues limitadas a japones e ingles.
- Inferencia en CPU y GPU con el mismo motor incluido en el repositorio (CLI, Web UI y notebook de Colab).

## Casos de uso

- Extraccion de datos estructurados en pipelines: el modelo genera JSON conforme a esquema con validez garantizada por `ByteFSMJsonSchemaEnforcer`, lo que permite integrarlo en procesos ETL o de scraping donde un JSON malformado rompe el pipeline. Es adecuado por su determinismo sintactico incluso con texto japones multibyte.
- Razonamiento sobre documentos largos: las pruebas needle de 16 KB y 64 KB con salida JSON (0,3958 y 0,3541 bpb) indican uso para localizar y extraer respuestas concretas en documentos extensos, como contratos o informes.
- Agentes y orquestacion de herramientas: el benchmark `val_agent_tool` (1,4320 bpb) sugiere su uso en la generacion de llamadas a funciones y formatos de agente, integrándose en flujos multi-paso donde la salida debe ser parseable.
- Calculo determinista en produccion: `TraceALU` resuelve aritmetica, conversiones de unidades y fechas sin error, lo que lo hace util en asistentes financieros, calculadoras de precios o sistemas de reservas donde no se tolera alucinacion numerica.
- Inferencia en portatiles sin GPU: el checkpoint INT8 de 1,88 GB funciona en 3,85 GB de RAM en CPU (FBGEMM AVX-512 VNNI) a 49,7 caracteres/s, adecuado para aplicaciones de escritorio o entornos sin acelerador.
- Despliegue en GPU de consumo: en una RTX 3060 alcanza 165-247 caracteres/s con el checkpoint INT8, lo que permite prototipos interactivos o demos locales con la Web UI incluida.
- Investigacion en arquitecturas eficientes: al incluir pesos en BF16 y el motor completo en PyTorch puro, sirve como base para estudiar Memory Mosaics, MoE con reloj dual y chunking byte-level.

## Benchmarks y rendimiento

Resultados publicados en la model card (metrica bits per byte, bpb, menor es mejor):

| Benchmark | Metrica | Resultado |
|---|---|---:|
| Prosa japonesa held-out (`val_ja_new`) | bpb | 1,7029 |
| Dialogo libre japones (`val_ja_free_dialogue_tf`) | bpb | 1,7694 |
| Formateo de agente y tool-call (`val_agent_tool`) | bpb | 1,4320 |
| JSON Schema estructurado (`val_json_schema` + ByteFSM) | bpb / validez sintactica | 2,2724 / 100,0 % JSON valido |
| Extraccion needle contexto largo 16 KB / 64 KB | bpb de respuesta JSON | 0,3958 / 0,3541 |
| Cross-modal balanceado 6 categorias (N = 600) | bpb medio de respuesta | 0,8210 |

Rendimiento de inferencia declarado:

| Hardware | Precision | Throughput | Memoria |
|---|---|---:|---:|
| CPU (FBGEMM AVX-512 VNNI) | INT8 | 49,7 caracteres/s | 3,85 GB RAM |
| RTX 3060 | INT8 | 165-247 caracteres/s | no disponible |

No se han publicado resultados en benchmarks estandar de la comunidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: INT8 y BF8 ocupan 1,88 GB en disco; BF16 ocupa 3,60 GB. En CPU, el checkpoint INT8 se ejecuta en 3,85 GB de RAM.
- GPU recomendadas: RTX 3060 (6 GB o mas) validada para INT8; GPU de 8 GB o mas para el checkpoint BF16 en precision completa.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas para INT8/BF8 y 8 GB o mas para BF16.
- Despliegue: motor de inferencia propio incluido en el repositorio (`MANATOInferenceEngine`), CLI `quickstart_manato.py`, servidor web `manato_live_server.py` y notebook de Colab. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 49,7 caracteres/s en CPU con INT8; 165-247 caracteres/s en RTX 3060 con INT8. No se proporcionan datos para BF8 ni BF16.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones con otros modelos. Se ofrece una comparacion estructural con alternativas de tamano y proposito similares, marcando los datos no disponibles:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MANATO 0.5 (MoE-2B) | 1,89 B totales / 737 M activos | no disponible | Apache 2.0 | Byte-level, Memory Mosaics, MoE, neuro-simbolico |
| Alternativa de ~2B tipo Transformer | ~2 B | no disponible | variable | Transformer denso con tokenizador |
| Alternativa MoE pequena | no disponible | no disponible | variable | MoE con atencion cuadratica |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Modelo en etapa de vista previa de investigacion (0.5): la fluidez en prosa japonesa abierta y el recuerdo factual general estan por debajo de LLM frontera con tokenizador de subwords, segun el propio autor.
- Entrenado desde cero en dos GPU de consumo: la cobertura de conocimiento del mundo es limitada.
- Idiomas restringidos a japones e ingles; no se documenta soporte de castellano.
- Longitud de contexto no especificada en la model card; solo se documentan pruebas de extraccion hasta 64 KB.
- Riesgo de alucinacion en conocimiento factual abierto, aunque las rutas deterministas (`TraceALU`, `ByteFSM`) mitigan errores en aritmetica y formato JSON.
- Las garantias de JSON valido y calculo exacto dependen de usar las compuertas neuro-simbolicas incluidas; sin ellas, el comportamiento es el de un modelo de lenguaje probabilistico.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental conviene validar su comportamiento en el dominio concreto antes de produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/diode37/MANATO-MoE-2B
- Notebook de inicio rapido en Colab: https://colab.research.google.com/huggingface/diode37/MANATO-MoE-2B/blob/main/public_release/MANATO_MoE_2B_Quickstart.ipynb
- Repositorio Git (clonado con LFS skip): https://huggingface.co/diode37/MANATO-MoE-2B
