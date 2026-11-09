# mradermacher/LFM3-Omni-2B-Uncensored-i1-GGUF

## Resumen

`mradermacher/LFM3-Omni-2B-Uncensored-i1-GGUF` es un conjunto de cuantizaciones GGUF generadas por mradermacher a partir del modelo base `OpenIntelligenceNet/LFM3-Omni-2B-Uncensored`. Se trata, por tanto, de una distribucion derivada y no de un modelo entrenado desde cero: el trabajo de este repositorio consiste en producir versiones cuantizadas (imatrix y weighted) del modelo original para facilitar su ejecucion en hardware con recursos limitados mediante llama.cpp y ecosistemas compatibles.

El nombre sugiere que el modelo base pertenece a la familia LFM3 (Liquid Foundation Model 3) de Liquid AI en su variante Omni de 2B parametros, y que ha sido sometido a un proceso de "uncensoring" por parte de OpenIntelligenceNet, es decir, un ajuste fino orientado a reducir los rechazos y filtros de seguridad del modelo original. No obstante, la model card de este repositorio no aporta informacion sobre el proceso de entrenamiento, la composicion del dataset ni las capacidades reales del modelo.

La relevancia de este repositorio es practica: ofrece un abanico amplio de niveles de cuantizacion (desde IQ1_S hasta Q6_K) que permiten desplegar un modelo multimodal de 2B en equipos de consumo. El repositorio tiene un tamano declarado de 0.0 GB y cero descargas en el momento de la consulta, lo que indica que es una publicacion muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia LFM3 Omni; no confirmado en la informacion) |
| Parametros totales | 899.013 (dato de safetensors del repo; no coherente con el "2B" del nombre, ver advertencias) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de pesos en formato HF/safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El identificador "LFM3-Omni" apunta a la familia Liquid Foundation Model 3 en su variante Omni, que en el catalogo de Liquid AI corresponde a modelos multimodales; sin embargo, este repositorio no confirma ni detalla dicha arquitectura, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras.

Lo unico verificable es el proceso de cuantizacion: la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, y especifica que se generaron cuantizaciones "weighted/imatrix" del modelo `OpenIntelligenceNet/LFM3-Omni-2B-Uncensored`. El uso de matrices de importancia (imatrix) permite calcular los factores de cuantizacion a partir de estadisticas de activacion, lo que en la practica reduce la perdida de calidad en niveles agresivos como IQ2 o IQ1. El ajuste "uncensored" del modelo base no esta documentado en este repositorio.

## Capacidades

- Generacion de texto: capacidad esperada por herencia del modelo base, no verificada en la informacion disponible.
- Capacidades multimodales ("Omni"): el nombre sugiere entrada multimodal, pero no se confirma en la model card ni en los metadatos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo "uncensored": el ajuste del modelo base busca reducir rechazos, pero su alcance y efectos no estan documentados.
- Capacidad de ejecucion local: confirmada por el formato GGUF y la variedad de cuantizaciones.

## Casos de uso

- Despliegue en equipos de consumo: las cuantizaciones Q4_0, Q4_K_M e IQ4_XS permiten ejecutar un modelo de ~2B en GPUs con 4-6 GB de VRAM o en CPU mediante llama.cpp, adecuado para prototipos locales sin infraestructura cloud.
- Experimentacion con modelos sin filtros: el ajuste "uncensored" del base lo hace util para investigacion sobre comportamiento de modelos y evaluacion de sesgos, siempre en entornos controlados y con revision humana.
- Pruebas de pipelines GGUF: sirve como banco de pruebas para validar integraciones con llama.cpp, Ollama o servidores compatibles antes de pasar a modelos mayores.
- Evaluacion comparativa de cuantizaciones: al ofrecer 24 variantes (de IQ1_S a Q6_K), permite medir el impacto de la cuantizacion en calidad y velocidad sobre un mismo modelo base.
- Generacion de texto asistida en local: tareas de redaccion, resumen o chat en escenarios con requisitos de privacidad donde no se desea enviar datos a la nube, sujeto a validacion de calidad.
- Educacion y divulgacion: util para demostrar el funcionamiento de la cuantizacion y el despliegue local de LLM en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no confirmarse el tamano real del modelo. Para un modelo de ~2B en Q4_K_M se situaria en torno a 1,5-2,5 GB; en Q6_K, en torno a 2,5-3,5 GB; en IQ1_S, por debajo de 1 GB. Estas cifras son estimaciones por tamano nominal y no mediciones del repositorio.
- GPU recomendadas: no disponible. Por tamano nominal, una RTX 3060 de 12 GB o superior seria suficiente en todas las cuantizaciones; una RTX 4090 o A100 no aportarian ventaja significativa por el cuello de botella de memoria.
- GPU de consumo: si, previsiblemente cabe en GTX 1650 (4 GB), RTX 3050 (8 GB) y superiores en cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF (LM Studio, koboldcpp, servidores basados en llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Uncensored-i1-GGUF (este) | 899.013 segun safetensors; "2B" en el nombre | no disponible | no disponible | GGUF | Cuantizaciones derivadas, sin benchmarks publicados |
| OpenIntelligenceNet/LFM3-Omni-2B-Uncensored | no disponible | no disponible | no disponible | safetensors (HF) | Modelo base del que derivan estas cuantizaciones |
| Familia LFM3 de Liquid AI (referencia por nombre) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Incoherencia en el recuento de parametros: el metadato de safetensors indica 899.013 parametros, muy lejos de los "2B" del nombre. Puede tratarse de un error de publicacion o de un artefacto de conversion; debe verificarse antes de cualquier uso en produccion.
- Licencia no declarada: no se especifica licencia, lo que impide confirmar si el uso comercial esta permitido. Contactar con el autor antes de cualquier despliegue comercial.
- Modelo derivado sin documentacion: la model card no describe el entrenamiento, los datos ni las capacidades; no hay garantias de calidad ni de comportamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas no puede acotarse.
- Sesgos: el ajuste "uncensored" puede aumentar la probabilidad de contenido sesgado, ofensivo o inseguro; requiere moderacion externa en cualquier aplicacion expuesta a usuarios.
- Idiomas no declarados: no puede confirmarse el soporte multilingue ni la calidad en castellano.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que las cuantizaciones hayan sido probadas.
- Advertencia de seguridad: el contenido de la model card se ha tratado solo como datos de referencia, no como instrucciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-Omni-2B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/OpenIntelligenceNet/LFM3-Omni-2B-Uncensored
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
