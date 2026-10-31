# mradermacher/Kitchoon-V4-26B-A4B-i1-GGUF

## Resumen

Kitchoon-V4-26B-A4B-i1-GGUF es un repositorio de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo SubMaroon/Kitchoon-V4-26B-A4B, publicado por mradermacher, un colaborador muy conocido en la comunidad de Hugging Face por generar cuantizaciones optimizadas de modelos populares para su uso con llama.cpp. El sufijo "26B-A4B" indica que se trata de un modelo de mezcla de expertos (MoE) con aproximadamente 26.000 millones de parametros totales y unos 4.000 millones activos por token, lo que permite una inferencia rapida con una calidad cercana a modelos densos mucho mayores.

La relevancia de esta ficha radica en la disponibilidad de cuantizaciones: el repositorio ofrece mas de 20 variantes que van desde IQ1_S hasta Q6_K, cubriendo un rango amplisimo de compromisos entre tamaño en disco, uso de memoria y precision. Esto hace que un modelo de 26B total sea ejecutable en hardware de consumo, algo especialmente atractivo para la arquitectura MoE, donde solo los parametros activos influyen de forma dominante en la latencia.

El modelo base (Kitchoon-V4-26B-A4B) es un merge o fine-tune de la comunidad cuyo origen exacto no esta documentado en la model card. No se ha publicado informacion sobre su entrenamiento, datos, benchmarks ni licencia, por lo que esta ficha documenta principalmente las cuantizaciones disponibles y las consideraciones practicas para su despliegue con llama.cpp y herramientas derivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (por nomenclatura A4B); detalles no disponibles |
| Parametros totales | 26B aprox. (28.444.095 tensor elements registrados en safetensors) |
| Parametros activos | ~4B por token (inferido de la nomenclatura "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado con imatrix; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

La nomenclatura del modelo (26B-A4B) sigue la convencion habitual para designar modelos de mezcla de expertos: 26.000 millones de parametros totales y unos 4.000 millones activos por token. En una arquitectura MoE, cada token se procesa solo por un subconjunto de expertos, lo que reduce drasticamente el coste computacional por token respecto a un modelo denso equivalente. Sin embargo, la model card no detalla el numero de expertos, la estrategia de enrutamiento ni la arquitectura base concreta, por lo que estos datos no estan disponibles.

Sobre el entrenamiento del modelo base no hay informacion publicada: no se conocen el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El repositorio de mradermacher no modifica el modelo: se limita a generar cuantizaciones GGUF con matriz de importancia (imatrix), una tecnica que calcula estadisticas de activacion sobre un dataset de calibracion para asignar con mayor precision los niveles de cuantizacion en los tensores mas sensibles, mejorando la calidad de las variantes de baja bit (IQ1-IQ3) frente a cuantizaciones naive.

## Capacidades

Dado que no se ha publicado una model card detallada del modelo base, las capacidades concretas no estan disponibles. De forma general, un modelo MoE de 26B/4B activos de esta categoria suele ofrecer:

- Generacion de texto conversacional multi-turno
- Razonamiento general y seguimiento de instrucciones
- Generacion y completado de codigo (sin confirmacion documentada)
- Buen equilibrio entre latencia y calidad gracias a los ~4B de parametros activos por token
- Compatibilidad con el ecosistema llama.cpp (incluidos servidores OpenAI-compatible y backends GPU/CPU)

No hay informacion sobre tool calling, capacidades agenticas, vision, audio ni modos de razonamiento extendido.

## Casos de uso

- **Chatbot local en hardware de consumo**: con cuantizaciones Q4_K_M o IQ4_XS, el modelo puede ejecutarse en una GPU de consumo con VRAM limitada, aprovechando que solo ~4B de parametros activos garantizan una velocidad de generacion alta.
- **Servidor de inferencia casero con CPU o hibrido CPU/GPU**: las cuantizaciones IQ2/IQ3 permiten alojar el modelo en equipos sin GPU dedicada o con offloading parcial a traves de llama.cpp.
- **Evaluacion y comparacion de cuantizaciones**: el amplio abanico de variantes (mas de 20) lo hace util como banco de pruebas para medir la degradacion de calidad frente al tamaño en distintos niveles de bit.
- **Integracion en aplicaciones con backends compatibles con GGUF**: puede usarse con Ollama, LM Studio, llama-cpp-python o koboldcpp para prototipado rapido de aplicaciones locales.
- **Asistente de escritorio privado**: al ejecutarse localmente, no envia datos a servicios externos, adecuado para entornos con requisitos de privacidad.
- **Investigacion sobre eficiencia MoE**: la combinacion de 26B totales y 4B activos sirve como sujeto de estudio para tecnicas de cuantizacion en modelos dispersos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco existen datos publicos de MMLU, HumanEval, GSM8K ni otras metricas para el modelo base Kitchoon-V4-26B-A4B.

## Requisitos de hardware

- **VRAM / memoria estimada por cuantizacion** (aproximada para 26B parametros):
  - IQ1_S / IQ1_M: ~5-6 GB
  - IQ2_M / Q2_K: ~7-9 GB
  - Q3_K_M / IQ3_M: ~10-12 GB
  - Q4_K_M / IQ4_XS: ~13-16 GB
  - Q5_K_M: ~17-19 GB
  - Q6_K: ~20-22 GB
- **GPU recomendadas**: RTX 3060 de 12 GB (hasta Q3), RTX 4060 Ti 16 GB o RTX 4090 de 24 GB (hasta Q5/Q6); en la nube, cualquier GPU con 24 GB de VRAM (L4, A10G, RTX A6000) cubre las cuantizaciones medias-altas.
- **Consumer GPU**: si, cabe en GPUs de consumo con las cuantizaciones IQ2 a Q4; para Q5/Q6 se recomienda 24 GB de VRAM o offloading parcial a RAM.
- **CPU**: ejecutable en CPU pura con RAM de 16 GB (cuantizaciones bajas) o 32 GB (cuantizaciones altas), con velocidades razonables gracias a los ~4B de parametros activos.
- **Despliegue**: llama.cpp (nativo, formato GGUF), Ollama, LM Studio, koboldcpp, llama-cpp-python, y servidores compatibles con la API de OpenAI basados en llama.cpp. No esta pensado para vLLM o TGI sin conversion previa.
- **Latencia y throughput**: no disponibles; al ser MoE con ~4B activos, se espera una velocidad de generacion comparable a la de un modelo denso de 3-5B en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kitchoon-V4-26B-A4B (base) | ~26B | ~4B | safetensors / GGUF | no disponible | Cuantizaciones imatrix amplias; documentacion escasa |
| Qwen3-30B-A3B | 30B | 3B | safetensors / GGUF | Apache 2.0 | MoE similar, muy documentado, benchmarks publicados |
| OLMoE-1B-7B | 7B | 1B | safetensors / GGUF | Apache 2.0 | MoE mas pequeño, totalmente abierto (datos y pesos) |
| Llama 3.2 3B | 3B | 3B (denso) | safetensors / GGUF | Licencia Llama 3.2 | Denso de tamaño activo equivalente, ecosistema maduro |

La ventaja de Kitchoon-V4 frente a estas alternativas es la disponibilidad inmediata de mas de 20 cuantizaciones imatrix; su desventaja es la falta de documentacion, benchmarks y licencia clara.

## Limitaciones y advertencias

- **Licencia no disponible**: no se puede confirmar el permiso para uso comercial. Antes de cualquier despliegue en produccion, hay que verificar la licencia del modelo base SubMaroon/Kitchoon-V4-26B-A4B y de su modelo origen.
- **Alucinaciones**: no hay datos de evaluacion, por lo que el riesgo de alucinacion es desconocido; se recomienda validacion humana en tareas criticas.
- **Documentacion ausente**: sin model card del modelo base, no se conocen contexto maximo, idiomas, plantilla de chat ni capacidades exactas; una plantilla de chat incorrecta degrada gravemente la calidad.
- **Origen como merge/fine-tune de comunidad**: los merges pueden heredar sesgos y licencias de todos los modelos progenitores, y su comportamiento es menos predecible que el de modelos entrenados de forma integral.
- **Cuantizaciones agresivas**: las variantes IQ1_S/IQ2 pueden sufrir perdidas notables de coherencia y razonamiento; para uso serio se recomiendan Q4_K_M o superiores.
- **Sin soporte multimodal documentado**: el repositorio indica skip_mmproj, es decir, no incluye proyector multimodal.
- **Repositorio reciente y sin traccion**: 0 descargas y 0 likes en el momento de la ficha; conviene contrastar con la comunidad antes de adoptarlo en produccion.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Kitchoon-V4-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V4-26B-A4B
- Perfil del autor: https://huggingface.co/mradermacher
- Paper, blog o demo: no disponibles
