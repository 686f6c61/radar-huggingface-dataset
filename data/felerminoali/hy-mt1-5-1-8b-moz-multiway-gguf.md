# felerminoali/HY-MT1.5-1.8B-moz-multiway-gguf

## Resumen

HY-MT1.5-1.8B-moz-multiway (GGUF) es una compilacion cuantizada en formato GGUF del modelo de traduccion felerminoali/HY-MT1.5-1.8B-moz-multiway, un ajuste fino del modelo Tencent HY-MT1.5-1.8B. Lo desarrolla felerminoali y esta orientado a la traduccion multilingue entre portugues, ingles y varias lenguas de Mozambique y paises vecinos: emakhuwa, chichewa (Malaui), nyanja (Mozambique), tsonga (Sudafrica), xichangana (Mozambique) y sena. El modelo resuelve el problema de la traduccion automatica de alta calidad para lenguas de bajos recursos, un ambito donde los modelos comerciales suelen rendir mal por falta de datos.

El modelo tiene 1.791.080.448 parametros y se distribuye cuantizado en Q4_K_M, con un tamano aproximado de 1,1 GB repartido en tres ficheros GGUF de menos de 512 MB cada uno. Esta fragmentacion permite cargarlo en el navegador mediante wllama (llama.cpp compilado a WebAssembly), lo que habilita traduccion completamente local en el cliente sin enviar texto a un servidor. Es la pieza que utiliza el traductor en navegador CATfrica.

Su relevancia actual radica en dos factores: por un lado, cubre un conjunto de lenguas africanas practicamente ausente en los modelos de traduccion mainstream; por otro, su empaquetado GGUF fragmentado demuestra que es viable ejecutar traduccion neuronal de calidad en entornos con recursos limitados, incluidos navegadores y dispositivos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Tencent HY-MT1.5-1.8B; detalles especificos de capas y atencion no disponibles) |
| Parametros totales | 1.791.080.448 (~1,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; los ejemplos de uso emplean n_ctx de 2048 |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | Portugues (pt), ingles (en), emakhuwa (vmw), chichewa de Malaui (ny), nyanja de Mozambique (ny/ts segun tag), tsonga de Sudafrica (ts), xichangana de Mozambique (seh) y sena |
| Licencia | Tencent HY Community License Agreement (license_name: tencent-hy-community) |
| Formato de pesos | GGUF dividido en tres partes (00001-of-00003, 00002-of-00003, 00003-of-00003) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Tencent HY-MT1.5-1.8B, un transformer de aproximadamente 1,8 mil millones de parametros especializado en traduccion. La informacion disponible no detalla la configuracion interna de capas, cabezas de atencion ni el esquema exacto de atencion, por lo que esos datos deben consultarse en el repositorio del modelo base de Tencent. El ajuste fino realizado por felerminoali amplia la cobertura linguistica del modelo original hacia lenguas de Mozambique y regiones vecinas, un conjunto tipicamente infrarrepresentado en los corpus de traduccion.

No se han publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el ajuste. La model card menciona que el modelo original admite "retrieval hints" en el prompt, es decir, pistas de recuperacion que pueden incorporarse para mejorar la traduccion; la version GGUF funciona correctamente sin ellas. La innovacion tecnica mas destacable de esta publicacion no esta en la arquitectura sino en el empaquetado: la cuantizacion Q4_K_M y la division en fragmentos de menos de 512 MB permiten la carga progresiva en wllama y el despliegue en navegador.

## Capacidades

- Traduccion multilingue multiway entre portugues, ingles y las lenguas emakhuwa, chichewa (Malaui), nyanja (Mozambique), tsonga (Sudafrica), xichangana (Mozambique) y sena.
- Traduccion en ambas direcciones (multiway), no limitada a un unico par de idiomas.
- Generacion de texto conversacional segun el tag `conversational` del repositorio.
- Ejecucion en navegador mediante wllama (WebAssembly) y en local mediante llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte opcional de pistas de recuperacion (retrieval hints) en el prompt, heredado del modelo base.
- Decodificacion greedy recomendada (temperature 0, repetition penalty 1.05) para maximizar la fidelidad de la traduccion.
- No se documentan capacidades de vision, audio, tool calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Traduccion en navegador sin servidor: integrado via wllama con los tres fragmentos GGUF, permite traducir texto localmente en el cliente, sin enviar contenido a ninguna API externa. Es el caso de uso principal declarado (CATfrica).
- Atencion ciudadana en Mozambique: traduccion de comunicaciones oficiales entre portugues e emakhuwa, nyanja, xichangana o sena para servicios publicos y ONG que operan en zonas rurales.
- Documentacion sanitaria y educativa: traduccion de materiales de salud, agricultura o educacion a lenguas locales, donde los modelos comerciales carecen de cobertura.
- Aplicaciones offline en dispositivos de gama baja: al ocupar ~1,1 GB en Q4_K_M y ejecutarse con llama.cpp, puede desplegarse en portatiles sin GPU o en entornos con conectividad intermitente.
- Traduccion de contenido web y redes sociales: procesamiento de textos cortos en tiempo real dentro de una extension de navegador o widget web, aprovechando la carga progresiva de los fragmentos.
- Preservacion linguistica y corpus: generacion de traducciones de referencia y ampliacion de corpus paralelos para lenguas con pocos recursos, con revision humana posterior.
- Integracion en pipelines de investigacion: uso via llama.cpp o endpoints compatibles para experimentos de traduccion de bajo recursos con licencia comunitaria de Tencent.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1-1,5 GB para la cuantizacion Q4_K_M, incluyendo overhead de contexto (n_ctx 2048).
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Despliegue: llama.cpp (llama-completion), wllama (navegador via WebAssembly), y cualquier runtime compatible con GGUF. No se documenta soporte especifico de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La carga en navegador es progresiva por fragmentos de ~500 MB, lo que condiciona el tiempo de arranque inicial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| HY-MT1.5-1.8B-moz-multiway (GGUF) | ~1,8 B | No disponible | pt, en + 6 lenguas africanas | Tencent HY Community | GGUF Q4_K_M |
| tencent/HY-MT1.5-1.8B (base) | ~1,8 B | No disponible | Cobertura general del modelo original | Tencent HY Community | Safetensors (repo original) |
| felerminoali/HY-MT1.5-1.8B-moz-multiway (base del GGUF) | ~1,8 B | No disponible | pt, en + lenguas de Mozambique | Tencent HY Community | Safetensors |

No se dispone de datos de rendimiento comparativo ni de alternativas equivalentes para lenguas de Mozambique en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia Tencent HY Community **no se aplica en la Union Europea, el Reino Unido ni Corea del Sur**: el modelo no puede usarse en esas jurisdicciones. Es una restriccion critica para cualquier despliegue en Espana o la UE.
- Es un ajuste fino sobre un modelo de traduccion; no debe esperarse razonamiento general, codigo ni matematicas de calidad.
- Riesgo de alucinacion y de traducciones inexactas en lenguas de bajos recursos, donde los datos de entrenamiento son escasos. Se recomienda revision humana en contextos criticos.
- Solo se publica la cuantizacion Q4_K_M; no hay versiones de mayor precision (Q8, F16) en el repositorio, lo que limita la evaluacion de la perdida por cuantizacion.
- El contexto efectivo no esta documentado; los ejemplos usan 2048 tokens, insuficiente para documentos largos.
- La decodificacion debe ser greedy (temperature 0); el uso de muestreo puede degradar la fidelidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del rendimiento.
- La fecha de creacion indicada (2026-11-15) es posterior a la redaccion de esta ficha; conviene verificar la vigencia y el estado del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/felerminoali/HY-MT1.5-1.8B-moz-multiway-gguf
- Modelo base del ajuste: https://huggingface.co/felerminoali/HY-MT1.5-1.8B-moz-multiway
- Modelo original de Tencent: https://huggingface.co/tencent/HY-MT1.5-1.8B
- Licencia: https://huggingface.co/felerminoali/HY-MT1.5-1.8B-moz-multiway-gguf/blob/main/LICENSE.txt
- wllama (llama.cpp WebAssembly): https://github.com/ngxson/wllama
