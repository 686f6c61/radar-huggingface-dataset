# mradermacher/l3.2-3b-63-deg2-GGUF

## Resumen

`mradermacher/l3.2-3b-63-deg2-GGUF` es una coleccion de cuantizaciones GGUF del modelo base `semran1/l3.2-3b-63-deg2`, un modelo de lenguaje de aproximadamente 3.212 millones de parametros (3,2B) orientado a conversacion y publicado originalmente con la libreria `transformers`. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF conocido por generar versiones estaticas de modelos pequenos y medianos para su uso en llama.cpp y entornos de inferencia local.

El modelo base parece derivarse de la familia Llama 3.2 (por el prefijo `l3.2` y el tamano de 3B, coherente con Llama 3.2 3B), aunque la model card no confirma explicitamente la arquitectura ni el linaje. El sufijo `63-deg2` sugiere un ajuste fino o una variante especifica del autor `semran1`, probablemente orientada a generacion conversacional en ingles. La relevancia de esta publicacion radica en que ofrece el modelo en formatos comprimidos de 1,5 a 6,5 GB, lo que permite ejecutarlo en hardware de consumo.

La informacion disponible es limitada: no hay datos publicados sobre contexto, licencia, benchmarks ni composicion del dataset de entrenamiento. Esta ficha refleja exclusivamente lo que consta en la model card y en los metadatos de Hugging Face, marcando como "no disponible" todo aquello que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder-only, sin confirmar) |
| Parametros totales | 3.212.749.824 (3,2B) |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (segun metadatos) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base `semran1/l3.2-3b-63-deg2`. Por el nombre y el numero de parametros, es plausible que se trate de un transformer decoder-only derivado de Llama 3.2 3B, pero la model card no lo confirma. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El unico dato tecnico verificable es el recuento de parametros (3.212.749.824) y que el modelo esta etiquetado como `conversational`.

El trabajo de mradermacher consiste en la conversion a GGUF y la generacion de cuantizaciones estaticas (sin imatrix ni pesos ponderados, segun indica el propio autor). Las cuantizaciones cubren desde Q2_K (1,5 GB) hasta f16 (6,5 GB), pasando por opciones intermedias IQ4_XS, Q4_K_M y Q5_K_M. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de pensamiento) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del modelo.
- Compatibilidad con `transformers` (libreria declarada) y con el ecosistema GGUF/llama.cpp.
- Etiqueta `endpoints_compatible`, lo que indica que puede servirse a traves de endpoints compatibles con la API de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido.
- No se documenta soporte multilingue mas alla del ingles.
- No se documentan capacidades de codigo o matematicas de forma explicita.

## Casos de uso

- Prototipado conversacional local: el modelo, en cuantizacion Q4_K_M (2,1 GB), puede ejecutarse en un portatil con GPU integrada o CPU para validar flujos de chatbot antes de escalar a modelos mayores.
- Asistentes de escritorio offline: al caber en menos de 3 GB en Q5_K_M, se puede integrar en aplicaciones de escritorio que requieran privacidad total sin conexion a internet.
- Experimentacion academica con cuantizaciones: util para comparar la degradacion de calidad entre Q2_K, Q4_K_M y Q8_0 en un modelo de 3B, como parte de estudios sobre compresion de modelos.
- Generacion de texto en entornos con recursos limitados: Raspberry Pi 5, mini-PC o moviles de gama alta pueden ejecutar la version Q3_K_S (1,6 GB) para tareas de generacion corta.
- Filtrado y clasificacion de textos en ingles: tareas de etiquetado, resumen corto o reescritura donde no se requiere un modelo grande y prima la latencia baja.
- Base para ajuste fino adicional: al estar disponible el modelo base en safetensors, se puede partir de el para fine-tuning especifico antes de volver a cuantizar a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,5 GB
  - Q4_K_M: ~2,1 GB
  - Q5_K_M: ~2,4 GB
  - Q8_0: ~3,5 GB
  - f16: ~6,5 GB
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones Q4 y Q5 con margen para contexto. Para f16 se recomienda 8 GB o mas (RTX 3060 Ti, RTX 4070, A10).
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos ocho anos, y en muchas integradas (Intel Iris Xe, AMD Radeon 680M) en cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI a traves de llama.cpp server o vLLM (este ultimo con soporte GGUF limitado).
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo de 3B en Q4_K_M, es esperable un throughput de decenas de tokens por segundo en GPU consumer y de un solo digito a baja decena en CPU, pero no se ha verificado para esta publicacion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/l3.2-3b-63-deg2-GGUF | 3,2B | no disponible | no disponible | GGUF | Cuantizaciones estaticas de un fine-tune de semran1 |
| Llama 3.2 3B Instruct (Meta) | 3,2B | 128k (segun Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo oficial de referencia con contexto largo y licencia conocida |
| Qwen2.5 3B Instruct | 3,1B | 32k (segun Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva y buen rendimiento multilingue |
| Phi-3.5-mini | 3,8B | 128k (segun Microsoft) | MIT | safetensors, GGUF | Modelo de Microsoft con contexto largo y licencia MIT |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La licencia no esta declarada en la model card, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- No se documenta la longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion.
- Al ser un fine-tune de un autor individual (`semran1`) sin documentacion tecnica publica, el riesgo de sesgos, alucinaciones y comportamientos no deseados es mayor que en modelos con model card completa.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; el propio autor recomienda Q4_K_S o Q4_K_M para uso general.
- El modelo base no incluye informacion sobre datos de entrenamiento, por lo que no se puede evaluar el riesgo de memorizacion de datos personales o copyrighted.
- No se han publicado evaluaciones de seguridad, alineacion ni red-teaming.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/l3.2-3b-63-deg2-GGUF
- Modelo base: https://huggingface.co/semran1/l3.2-3b-63-deg2
- Pagina de descargas del autor: https://hf.tst.eu/model#l3.2-3b-63-deg2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
