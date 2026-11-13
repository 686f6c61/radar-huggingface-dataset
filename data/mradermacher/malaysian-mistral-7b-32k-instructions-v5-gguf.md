# mradermacher/malaysian-mistral-7b-32k-instructions-v5-GGUF

## Resumen

Malaysian Mistral 7B 32K Instructions v5 es un modelo de lenguaje de 7.241.732.096 parametros (aproximadamente 7,24 mil millones) afinado para instrucciones y especializado en malayo (aunque la model card declara `en` como idioma). El modelo original fue desarrollado por mesolitica sobre una base Mistral de 7B con ventana de contexto extendida a 32.000 tokens. Esta ficha describe la version cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

La relevancia de esta publicacion radica en que ofrece un conjunto completo de cuantizaciones estaticas (desde Q2_K hasta f16) de un modelo de instrucciones con contexto largo, lo que facilita su despliegue local en entornos con recursos limitados. El repositorio ocupa 63,9 GB en total, pero las cuantizaciones individuales van desde 2,8 GB (Q2_K) hasta 14,6 GB (f16), lo que abre la puerta a inferencia en GPUs consumer y en CPU.

Se trata, por tanto, de un artefacto de distribucion mas que de un modelo nuevo: no introduce arquitectura ni entrenamiento propios, sino que empaqueta los pesos del modelo base de mesolitica en formato GGUF. La licencia no esta declarada en la informacion disponible y el modelo base no se especifica con detalle en la model card mas alla de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral 7B, segun el nombre del modelo base) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens (segun el nombre del modelo base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card); el nombre del modelo sugiere malayo, pero no se declara explicitamente |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su nombre (`malaysian-mistral-7b-32k-instructions-v5`), que indica una base Mistral de 7B con contexto de 32.000 tokens y un afinado para instrucciones (probablemente SFT, aunque no se confirma). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

La contribucion de esta publicacion es exclusivamente la cuantizacion: mradermacher ha generado cuantizaciones estaticas (no se indica que haya cuantizaciones ponderadas/imatrix en el momento de la publicacion) mediante el pipeline de llama.cpp. El proceso de conversion es de tipo `hf` y la version de cuantizacion es la 2, con `output_tensor_quantised: 1`.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, segun el sufijo `instructions` del modelo base.
- Manejo de contexto largo de hasta 32.000 tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Capacidad multilingue limitada: la model card declara solo `en`, aunque el nombre del modelo sugiere orientacion al malayo; no se confirma soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- Compatible con el ecosistema `transformers` y con el formato GGUF para llama.cpp, Ollama y otros runners compatibles.

## Casos de uso

- Asistencia conversacional en malayo o ingles: el modelo puede gestionar dialogos multi-turno gracias a su ventana de 32.000 tokens, util para chatbots de atencion al cliente en mercados del sudeste asiatico.
- Procesamiento de documentos largos: resumen y extraccion de informacion de contratos, articulos o informes que superen los 8.000 tokens, aprovechando el contexto extendido.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (4,5 GB) o Q5_K_M (5,2 GB) puede ejecutarse en GPUs consumer de 8 GB o en CPU con llama.cpp, sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones de IA generativa: al estar disponible en GGUF, se integra facilmente en entornos de desarrollo con Ollama o llama.cpp para pruebas de concepto.
- Generacion de texto asistida en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, adecuado para sectores regulados.
- Educacion e investigacion: util como modelo de referencia para experimentos de cuantizacion y evaluacion de calidad en contextos largos con recursos limitados.
- Traduccion o adaptacion de contenido entre ingles y malayo, si se confirma la competencia linguistica del modelo base (no verificada en la informacion disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,8 GB
  - Q3_K_M: ~3,6 GB
  - Q4_K_M: ~4,5 GB
  - Q5_K_M: ~5,2 GB
  - Q6_K: ~6,0 GB
  - Q8_0: ~7,8 GB
  - f16: ~14,6 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para las cuantizaciones mas altas y contextos largos.
- Cabe en GPU consumer: si, practicamente todas las cuantizaciones hasta Q8_0 caben en GPUs de 8-12 GB; f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Tambien es posible usar el modelo base en `transformers` con safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| malaysian-mistral-7b-32k-instructions-v5 (GGUF, este) | 7,24 B | 32.000 | no disponible | GGUF | Afinado para instrucciones, orientado a malayo/ingles |
| Mistral 7B Instruct v0.2 | 7,24 B | 32.000 | Apache 2.0 | safetensors, GGUF | Referencia generalista en ingles, ampliamente soportado |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y rendimiento general, licencia restrictiva |
| Qwen2.5 7B Instruct | 7,62 B | 32.768 (128K en variantes) | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Fuerte en multilingue y codigo |

La comparacion con Mistral 7B Instruct v0.2 es la mas directa por compartir base y tamano; sin embargo, no se dispone de datos de benchmarks para establecer diferencias de rendimiento. Llama 3.1 8B y Qwen2.5 7B ofrecen contextos mayores o licencias mas claras, pero no estan especializados en malayo.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base antes de desplegarlo en produccion.
- La model card declara unicamente `en` como idioma, pese al nombre "malaysian"; el soporte real de malayo no esta verificado en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de 7B afinados para instrucciones, especialmente en tareas de conocimiento factual y contextos muy largos.
- No se documentan sesgos conocidos, pero al no especificarse la composicion del dataset de entrenamiento no puede evaluarse su alineacion ni sus sesgos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso practico.
- No hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion, lo que limita la calidad en tamanos pequenos.
- El repositorio completo ocupa 63,9 GB; conviene descargar solo la cuantizacion necesaria.
- No se garantiza soporte de tool calling ni de agentes; no debe asumirse para pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/malaysian-mistral-7b-32k-instructions-v5-GGUF
- Modelo base: https://huggingface.co/mesolitica/malaysian-mistral-7b-32k-instructions-v5
- Pagina de descargas del autor: https://hf.tst.eu/model#malaysian-mistral-7b-32k-instructions-v5-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
