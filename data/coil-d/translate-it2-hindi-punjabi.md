# COIL-D/translate-it2-hindi-punjabi

## Resumen

COIL-D/translate-it2-hindi-punjabi es un modelo de traduccion automatica neuronal especializado en el par hindi-punjabi (y punjabi-hindi), publicado por el usuario COIL-D en HuggingFace. Se trata de un ajuste fino del modelo ai4bharat/indictrans2-indic-indic-dist-320M, desarrollado originalmente por AI4Bharat, por lo que hereda su arquitectura transformer encoder-decoder orientada a traduccion entre lenguas indicas.

El modelo cuenta con 320.861.184 parametros (aproximadamente 320M) y se distribuye en formato safetensors con la libreria transformers y pipeline de traduccion. La relevancia de este tipo de ajustes radica en la escasez relativa de modelos abiertos de calidad para pares linguisticos indicos especificos, donde las alternativas multilingues genericas suelen rendir peor que un modelo destilado y afinado para un unico par.

El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargar los pesos. La licencia declarada es MIT, lo que en principio permite uso comercial, aunque la licencia del modelo base debe verificarse de forma independiente. No se han publicado datos de benchmarks, numero de tokens de entrenamiento ni composicion del dataset de ajuste en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (IndicTrans2, seq2seq) |
| Parametros totales | 320.861.184 (aproximadamente 320M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se listan variantes cuantizadas) |
| Idiomas soportados | hindi (hi) y punjabi (pa); direcciones declaradas hin-pan y pan-hin |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | ai4bharat/indictrans2-indic-indic-dist-320M |
| Pipeline | translation (text2text-generation) |
| Requiere codigo remoto | si (tag custom_code) |
| Tamano del repositorio | 1,3 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura corresponde a IndicTrans2 en su variante destilada de 320M, un transformer encoder-decoder clasico para traduccion automatica, no un modelo decoder-only ni una arquitectura MoE o hibrida. El modelo emplea tokenizacion con etiquetas de lengua del tipo `hin_Deva` y `pan_Guru` para indicar idioma y escritura, un rasgo caracteristico de la familia IndicTrans2, y requiere `trust_remote_code=True` junto con las dependencias del ecosistema IndicTrans (por ejemplo, IndicTransToolkit) para la preprocesado y el postprocesado correctos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones de preferencia. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias del modelo base (entrenamiento multilingue indico con vocabulario compartido y etiquetas de lengua). El ajuste se presenta como un fine-tune sobre el checkpoint indico-indico destilado, restringido al par hindi-punjabi en ambas direcciones.

## Capacidades

- Traduccion de texto hindi a punjabi y de punjabi a hindi, segun las etiquetas declaradas en el repositorio.
- Generacion texto-a-texto (pipeline `text2text-generation`) con entrada y salida en texto plano.
- Manejo de las escrituras devanagari (hindi) y gurmuji (punjabi) a traves de las etiquetas de lengua del tokenizador de IndicTrans2.
- Ejecucion en CPU y GPU por su tamano reducido, lo que facilita el despliegue en entornos con recursos limitados.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No se documentan capacidades de vision, audio ni multimodalidad.
- El soporte multilingue se limita a los dos idiomas indicados; no hay evidencia de transferencia a otros pares.

## Casos de uso

- Traduccion de documentacion administrativa entre hindi y punjabi: el modelo puede procesar parrafos de textos oficiales, formularios y circulares para ciudadanos de regiones donde ambas lenguas conviven, con un coste de inferencia muy bajo al ser un modelo de 320M.
- Localizacion de interfaces y contenidos web: integrado en un pipeline de CI/CD, permite generar versiones en hindi y punjabi de cadenas de texto y articulos, reduciendo el trabajo manual de traductores para contenido de bajo riesgo.
- Subtitulado y transcripcion de medios: combinado con un sistema de reconocimiento de voz, traduce transcripciones hindi a punjabi (o viceversa) para publicacion de subtitulos en plataformas regionales.
- Atencion al cliente en centros de contacto: como capa de traduccion en un sistema de mensajeria, permite que un agente que solo domina hindi atienda consultas escritas en punjabi, siempre con revision humana en casos sensibles.
- Generacion de material educativo bilingue: traduccion de apuntes, ejercicios y glosarios entre ambos idiomas para escuelas y programas de formacion profesional en zonas bilingues.
- Procesamiento por lotes de corpus para investigacion linguistica: al ser un modelo pequeno y con licencia MIT, resulta adecuado para traducir grandes volumenes de texto en experimentos de analisis contrastivo hindi-punjabi sin costes de API.
- Preprocesado en sistemas de recuperacion de informacion multilingue: traduccion de consultas de usuario de punjabi a hindi para consultar indices o bases de datos que solo contienen documentos en hindi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para los pesos, mas el consumo del runtime (del orden de 2-3 GB en total).
- VRAM estimada en FP16/BF16: aproximadamente 0,65 GB para los pesos, en torno a 1,5-2 GB con overhead del runtime.
- VRAM estimada en INT8: aproximadamente 0,35 GB para los pesos, viable incluso en GPUs de gama de entrada.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1660, e incluso en iGPU con memoria compartida suficiente. Tambien es viable la inferencia en CPU.
- Para despliegues de alto throughput en servidor se pueden usar A100, H100 o L4, aunque el modelo esta claramente sobredimensionado para estas GPUs en terminos de memoria; el cuello de botella seria la latencia de red y el preprocesado, no la VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` e IndicTransToolkit para el preprocesado; conversion a CTranslate2 u ONNX Runtime para acelerar la inferencia; FastAPI o TorchServe para exponer un servicio HTTP. No hay indicios de soporte oficial en llama.cpp, Ollama, vLLM o TGI para este checkpoint concreto (vLLM y TGI tienen soporte limitado para modelos encoder-decoder con codigo remoto).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| COIL-D/translate-it2-hindi-punjabi | 320M (320.861.184) | hindi, punjabi | no disponible | MIT | restringido (gated) |
| ai4bharat/indictrans2-indic-indic-dist-320M | 320M | 22 lenguas indicas | no disponible | MIT | abierto |
| ai4bharat/indictrans2-indic-indic-dist-200M | 200M | 22 lenguas indicas | no disponible | MIT | abierto |
| ai4bharat/indictrans2-indic-indic-1B | 1B | 22 lenguas indicas | no disponible | MIT | abierto |
| facebook/nllb-200-distilled-600M | 600M | 200 lenguas | no disponible | CC-BY-NC-4.0 | abierto |

El modelo aqui descrito se diferencia del checkpoint base unicamente por el ajuste fino al par hindi-punjabi, por lo que su ventaja esperable es una mayor especializacion en ese par a cambio de perder cobertura multilingue. No se dispone de datos de rendimiento comparativo que permitan cuantificar esa mejora.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes: no hay evidencia cuantitativa de la calidad de traduccion frente al modelo base.
- Riesgo de alucinacion y de traducciones incorrectas o inventadas, especialmente en terminologia tecnica, nombres propios y textos con estructura compleja (tablas, codigo, HTML).
- Cobertura limitada a dos idiomas y a las direcciones declaradas; no hay garantia de funcionamiento en otros pares indicos ni en variantes dialectales del punjabi o del hindi.
- Sesgos potenciales heredados del corpus de entrenamiento del modelo base, que no se documenta en esta ficha.
- La licencia declarada es MIT, pero al ser un derivado de un modelo de terceros conviene verificar las condiciones del checkpoint base antes de un uso comercial.
- El acceso esta restringido (gated): es obligatorio aceptar condiciones en HuggingFace y disponer de un token con permisos para descargar los pesos, lo que complica la automatizacion en pipelines.
- El modelo requiere `trust_remote_code=True` y dependencias especificas (IndicTrans/IndicTransToolkit); omitir el preprocesado con etiquetas de lengua degrada gravemente la salida.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso ni mantenimiento conocido: no hay garantia de soporte, actualizaciones o correccion de errores.
- La fecha de creacion y actualizacion registrada en HuggingFace es del 29 de septiembre de 2026, un dato anomalo que conviene verificar.
- La referencia arXiv incluida en las etiquetas (arxiv:2609.28826) no se ha podido contrastar con ninguna publicacion en la busqueda realizada.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/COIL-D/translate-it2-hindi-punjabi
- Modelo base: https://huggingface.co/ai4bharat/indictrans2-indic-indic-dist-320M
- Repositorio oficial de IndicTrans2 (AI4Bharat): https://github.com/AI4Bharat/IndicTrans2
- IndicTransToolkit: https://github.com/VarunGumma/IndicTransToolkit
- Paper de IndicTrans2: https://arxiv.org/abs/2301.08745
- Referencia arXiv declarada en las etiquetas del repositorio: https://arxiv.org/abs/2609.28826 (no verificada)
