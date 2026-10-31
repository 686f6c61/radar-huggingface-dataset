# mradermacher/RusMind-Vspyshka-4.7-i1-GGUF

## Resumen

RusMind-Vspyshka-4.7-i1-GGUF es una colección de cuantizaciones con matriz de importancia (imatrix/i1) del modelo RusMind-Vspyshka-4.7, publicado por el cuantizador mradermacher, un colaborador muy activo del ecosistema GGUF en Hugging Face. El modelo base es DICPlay/RusMind-Vspyshka-4.7, un modelo conversacional centrado en ruso e inglés, etiquetado como orientado a uso en dispositivo (on-device) y sin conexión (offline).

El repositorio no contiene pesos originales, sino versiones comprimidas en formato GGUF pensadas para ejecutarse con llama.cpp y derivados (Ollama, LM Studio, etc.). Con unos 7.500 millones de parámetros, el modelo cabe cómodamente en GPUs de consumo e incluso en equipos sin GPU, lo que lo hace relevante para despliegues locales de bajo coste. La propia model card indica que se trata de un modelo de visión, con los archivos mmproj disponibles en el repositorio estático hermano.

Es relevante porque amplía la oferta de modelos pequeños optimizados para ruso, un idioma con menos representación en modelos open source de tamaño reducido, y porque las cuantizaciones imatrix de mradermacher suelen ofrecer mejor relación calidad/tamaño que las cuantizaciones estáticas equivalentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer conversacional, base desconocida) |
| Parametros totales | 7.518.069.290 (~7,52 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | rusmind-license (other; consulta el texto de la licencia antes de uso comercial) |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El repositorio cuantizado no documenta la arquitectura subyacente del modelo base DICPlay/RusMind-Vspyshka-4.7. Dado su tamaño (~7,5 B parámetros) y su etiquetado como modelo conversacional compatible con llama.cpp, todo apunta a un transformer decoder denso, pero no hay confirmación en la información disponible. Tampoco se conocen detalles sobre el corpus de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización: mradermacher emplea cuantizaciones ponderadas con matriz de importancia (imatrix), que calculan estadísticas de activación sobre un corpus de calibración para asignar bits de forma más inteligente. Según la model card, los quants IQ suelen ser preferibles a los quants K de tamaño similar, y se proporciona además un archivo imatrix de 0,1 GB para que los usuarios generen sus propias cuantizaciones. Las cuantizaciones estáticas están disponibles en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con plantilla de chat compatible con llama.cpp.
- Comprension de imagenes: la model card indica que es un modelo de vision; los archivos mmproj se encuentran en el repositorio estatico (mradermacher/RusMind-Vspyshka-4.7-GGUF).
- Ejecucion local y offline: formato GGUF orientado a inferencia en dispositivo, sin dependencia de servicios en la nube.
- Flexibilidad de cuantizacion: 15 variantes de bits, desde ~4,5 GB (Q2_K) hasta ~6,3 GB (Q6_K), mas el archivo imatrix para crear cuantizaciones propias.
- Tool calling, agentes y capacidades de razonamiento avanzado: no disponible (sin documentacion en la informacion proporcionada).

## Casos de uso

- Asistentes conversacionales offline en ruso: el modelo puede desplegarse localmente con llama.cpp u Ollama para chatbots que funcionen sin conexion, util en entornos con restricciones de privacidad o conectividad.
- Analisis de imagenes en dispositivo: al tratarse de un modelo de vision, puede describir o responder preguntas sobre imagenes en equipos locales descargando los archivos mmproj del repositorio estatico.
- Aplicaciones de escritorio en ruso: su tamano de ~5-6 GB en cuantizacion media lo hace idoneo para integrarse en apps locales tipo LM Studio con requisitos de hardware modestos.
- Prototipado rapido en portatiles: la variante Q4_K_M (5,4 GB, recomendada por el autor) permite probar el modelo en GPUs de consumo o incluso en CPU con RAM suficiente.
- Bilinguismo ru/en en flujos de trabajo mixtos: util para equipos que trabajan con documentacion y comunicacion en ruso e ingles simultaneamente.
- Generacion de cuantizaciones personalizadas: el archivo imatrix incluido permite a desarrolladores crear variantes a medida para hardware especifico (movil, edge, embedded).
- Investigacion sobre cuantizacion: el conjunto completo de quants i1 sirve como banco de pruebas para comparar degradacion de calidad entre esquemas de bits en modelos de ~7,5 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente el tamano del archivo mas overhead de contexto. Ejemplos: i1-Q4_K_M (~5,4 GB) cabe en una GPU de 8 GB con holgura; i1-Q6_K (~6,3 GB) tambien cabe en 8 GB; i1-Q2_K (~4,5 GB) funciona incluso en equipos con 8 GB de RAM sin GPU.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090 para multiples variantes en paralelo). Al ser GGUF, tambien funciona en CPU puro con suficiente RAM.
- Consumer GPU: si, es uno de los puntos fuertes del modelo; todas las variantes (4,5-6,3 GB) caben en GPUs de 8 GB o mas.
- Despliegue: llama.cpp (repositorio nativo), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No esta orientado a vLLM o TGI, que requieren pesos HF completos.
- Latencia y throughput: no disponible; en GPU de consumo se esperan velocidades de decodificacion tipicas de modelos de 7-8 B cuantizados (decenas de tokens/segundo), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| RusMind-Vspyshka-4.7-i1-GGUF | 7,52 B | GGUF (imatrix) | ru, en | rusmind-license (other) | Vision, on-device, 15 quants |
| Qwen2.5-7B-Instruct (GGUF) | 7,6 B | GGUF | multilingue (incl. ru) | Apache 2.0 | Amplia cobertura de idiomas y benchmarks publicados |
| Llama 3.1 8B Instruct (GGUF) | 8 B | GGUF | multilingue (incl. ru) | Llama 3.1 Community License | Ecosistema muy maduro, soporte tool calling |
| Mistral 7B Instruct v0.3 (GGUF) | 7,2 B | GGUF | en (ru limitado) | Apache 2.0 | Menor rendimiento en ruso |

RusMind-Vspyshka-4.7 se diferencia por su foco en ruso y su capacidad de vision en un tamano compacto, aunque carece de documentacion publica de benchmarks y su licencia personalizada exige revision antes de uso comercial.

## Limitaciones y advertencias

- Licencia personalizada (rusmind-license, "other"): no es una licencia estandar open source; revisa el texto en el repositorio base antes de cualquier despliegue comercial, ya que puede incluir restricciones.
- Los quants de bits bajos (Q2_K, IQ2*) presentan degradacion notable de calidad; el propio autor sugiere alternativas IQ3_XXS o superiores. Evita Q4_0 salvo que la velocidad sea prioritaria.
- Los archivos mmproj (vision) estan en el repositorio estatico, no en este; necesitaras descargarlos aparte para usar capacidades de imagen.
- Sin benchmarks publicados: no es posible verificar el rendimiento real del modelo frente a alternativas; evalualo con tus propios casos de uso.
- Riesgo de alucinacion: no documentado especificamente, pero como todo LLM de ~7,5 B puede generar contenido incorrecto con fluidez, especialmente en dominios especializados.
- Cobertura de idiomas limitada a ruso e ingles; el rendimiento en espanol u otros idiomas no esta garantizado ni documentado.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento extendido.

## Enlaces

- Repositorio cuantizado (imatrix): https://huggingface.co/mradermacher/RusMind-Vspyshka-4.7-i1-GGUF
- Repositorio cuantizado (estatico, con mmproj): https://huggingface.co/mradermacher/RusMind-Vspyshka-4.7-GGUF
- Modelo base: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Pagina de descargas resumida: https://hf.tst.eu/model#RusMind-Vspyshka-4.7-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de quants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/
