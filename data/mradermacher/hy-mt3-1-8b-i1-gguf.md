# mradermacher/Hy-MT3-1.8B-i1-GGUF

## Resumen

Hy-MT3-1.8B-i1-GGUF es una cuantización en formato GGUF del modelo de traducción Hy-MT3-1.8B, desarrollado originalmente por Tencent y redistribuido por el usuario mradermacher. Se trata de un modelo especializado en traducción automática multilingüe que cubre más de 90 idiomas, desde los principales (chino, inglés, español, francés, alemán) hasta lenguas de bajos recursos como cebuano, waray, gaélico escocés o yidis. La versión aquí descrita emplea cuantizaciones con imatrix (importance matrix), una técnica que reduce el peso del modelo preservando mejor la calidad que la cuantización estática convencional.

El modelo base tiene 1.182.560 parámetros según los safetensors publicados, aunque la nomenclatura "1.8B" sugiere un tamaño nominal de aproximadamente 1.800 millones de parámetros; esta discrepancia no está aclarada en la información disponible. La ficha se centra en la distribución GGUF, pensada para inferencia local con llama.cpp y herramientas compatibles, con licencia Apache 2.0 que permite uso comercial.

Su relevancia radica en combinar una cobertura lingüística amplísima con un tamaño que cabe en hardware de consumo, lo que lo hace atractivo para pipelines de traducción on-premise, aplicaciones multilingües y escenarios donde no se puede depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de traducción, familia Hy-MT3) |
| Parametros totales | 1.182.560 (según safetensors del modelo base); nomenclatura nominal 1.8B |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | más de 90 (zh, en, es, fr, de, ja, ko, ar, ru, hi, entre otros muchos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Hy-MT3-1.8B en la documentación proporcionada. Por la nomenclatura y la tarea (traducción), se trata presumiblemente de un transformer encoder-decoder o decoder-only especializado en traducción, pero este dato no está confirmado. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La contribución técnica de esta ficha es la cuantización con imatrix: mradermacher genera una matriz de importancia a partir de datos de calibración y la usa para ponderar la cuantización, lo que típicamente produce una perplejidad menor que la cuantización estática a igual tamaño de archivo. El repositorio incluye el propio archivo imatrix (`Hy-MT3-1.8B.imatrix.gguf`, 0,1 GB) para que otros puedan generar sus propias cuantizaciones. También existen cuantizaciones estáticas en el repositorio hermano `mradermacher/Hy-MT3-1.8B-GGUF`.

## Capacidades

- Traducción automática multilingüe entre más de 90 idiomas, incluyendo pares con lenguas de bajos recursos.
- Cobertura de idiomas europeos (español, catalán, gallego, euskera, portugués, francés, italiano, alemán, neerlandés, polaco, checo, eslovaco, esloveno, croata, serbio, búlgaro, rumano, húngaro, griego, finés, sueco, danés, noruego, islandés, irlandés, galés, etc.).
- Cobertura de idiomas asiáticos y de Oriente Medio (chino, japonés, coreano, hindi, bengalí, tamil, telugu, malayo, indonesio, tailandés, vietnamita, camboyano, birmano, árabe, hebreo, persa, urdu, etc.).
- Cobertura de lenguas africanas y de bajos recursos (suajili, amárico, afrikáans, yoruba, etc., según la lista de idiomas).
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica on-premise: el modelo puede desplegarse con llama.cpp en servidores propios y traducir manuales y guías entre los idiomas cubiertos sin enviar datos a terceros, algo crítico en entornos con requisitos de confidencialidad.
- Localización de aplicaciones y webs: dado su tamaño reducido, permite traducir cadenas de interfaz y contenido de marketing en lote, con la ventaja de una licencia Apache 2.0 que no impone restricciones de uso comercial.
- Atención al cliente multilingüe: integrado en un pipeline de preprocesado, puede normalizar y traducir mensajes entrantes de usuarios en decenas de idiomas antes de pasarlos a un sistema de clasificación o a un LLM mayor.
- Traducción de lenguas de bajos recursos: su cobertura de idiomas como cebuano, waray, gaélico escocés o yidis lo hace útil para proyectos de preservación lingüística y acceso a contenido donde los modelos comerciales tienen poca cobertura.
- Procesamiento de corpus de investigación: investigadores pueden traducir grandes volúmenes de textos académicos o datos cualitativos en local, con control total sobre el pipeline y sin coste por token.
- Subtitulado y transcripción multilingüe: combinado con un modelo de ASR, puede traducir transcripciones a múltiples idiomas en tiempo casi real en hardware de consumo.
- Aplicaciones de escritorio y móviles: las cuantizaciones pequeñas (Q4_K_M, IQ4_XS) permiten empaquetar el modelo en aplicaciones de escritorio con requisitos modestos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~1,8B parámetros, las cuantizaciones Q4 rondan 1-1,5 GB; Q5 en torno a 1,3-1,8 GB; Q6 cerca de 1,5-2 GB; Q8 aproximadamente 2-2,5 GB; las cuantizaciones de 2-3 bits (IQ2, Q2_K, IQ3) quedan por debajo de 1 GB. Estas cifras son estimaciones basadas en el tamaño nominal y pueden variar según el modelo concreto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4-Q5 con comodidad; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque para este tamaño las GPUs de consumo son suficientes.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas con 4 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No se indica compatibilidad con vLLM o TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-i1-GGUF (este) | ~1,8B (nominal) | no disponible | >90 | Apache 2.0 | GGUF |
| mradermacher/Hy-MT3-1.8B-GGUF | ~1,8B (nominal) | no disponible | >90 | Apache 2.0 | GGUF (estático) |
| tencent/Hy-MT3-1.8B (base) | ~1,8B (nominal) | no disponible | >90 | Apache 2.0 | safetensors |
| NLLB-200 (Meta) | 600M-54B | 512 tokens | 200 | CC-BY-NC (no comercial) | safetensors, GGUF |
| M2M-100 (Meta) | 418M-12B | 1024 tokens | 100 | MIT | safetensors |

La comparativa con NLLB-200 y M2M-100 es orientativa: no se dispone de datos de rendimiento de Hy-MT3 que permitan una comparación cuantitativa. La principal ventaja de Hy-MT3 frente a NLLB-200 es su licencia Apache 2.0 (frente a CC-BY-NC), que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo base; como todo sistema de traducción, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación y de traducciones incorrectas, especialmente en pares de idiomas de bajos recursos o en textos muy especializados.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en documentos largos.
- La discrepancia entre el nombre "1.8B" y el recuento de safetensors (1.182.560) no está aclarada y conviene verificarla antes de dimensionar el hardware.
- Las cuantizaciones de muy baja precisión (IQ1, IQ2) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar los términos del modelo base original de Tencent por si hubiera condiciones adicionales no reflejadas en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento de estas cuantizaciones concretas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Hy-MT3-1.8B-i1-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Hy-MT3-1.8B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Hy-MT3-1.8B-i1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
