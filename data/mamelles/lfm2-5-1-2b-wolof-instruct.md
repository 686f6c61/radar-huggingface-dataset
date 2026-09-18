# mamelles/LFM2.5-1.2B-Wolof-Instruct

## Resumen

LFM2.5-1.2B-Wolof-Instruct es un ajuste fino de instrucciones sobre `LiquidAI/LFM2.5-1.2B-Base`, publicado por el usuario `mamelles`. Se trata de un artefacto de producción privado, descrito por su propio autor como experimental y no como una versión pública estable. Su objetivo declarado es la adaptación al wolof mediante un protocolo de preentrenamiento continuado sobre un corpus de wolof limpiado, seguido de una etapa de ajuste por instrucciones con datos reweightados.

El modelo tiene 1.316.289.280 parámetros (unos 1,32 mil millones) y se distribuye únicamente en formato `safetensors` para la librería `transformers`, con un repositorio de 2,6 GB. Pertenece a la familia LFM2 de Liquid AI (etiqueta `lfm2`), aunque el repositorio no publica detalles de capas, longitud de contexto, licencia ni lista de idiomas soportados. La tokenización corresponde a la familia `65k-ext`, y el propio autor advierte que las métricas BPB no deben compararse como perplejidad entre las familias de tokenizador de 65k y 128k.

Su relevancia actual es doble: por un lado, ejemplifica el flujo de trabajo de adaptación lingüística de bajo coste para lenguas con pocos recursos, como el wolof; por otro, deja explícito que la ortografía, el code-switching, la factualidad, el razonamiento, el comportamiento en contexto largo y la seguridad no han sido validados de forma exhaustiva. Es, por tanto, material de investigación y evaluación, no un modelo listo para producción sin revisión de hablantes nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2 (etiqueta `lfm2` de Liquid AI); el repositorio no especifica el detalle de capas ni el tipo exacto (atencion, convolucional o hibrida). No disponible |
| Parametros totales | 1.316.289.280 (~1,32 mil millones), dato real de `safetensors` |
| Parametros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos `safetensors` en su precision original, sin artefactos GGUF, AWQ, GPTQ ni variantes cuantizadas |
| Idiomas soportados | Wolof (idioma objetivo del ajuste). No hay lista oficial de idiomas; el resto de lenguas no esta validado |
| Licencia | No disponible; el repositorio no declara licencia |
| Formato de pesos | `safetensors` (libreria `transformers`, `pipeline_tag: text-generation`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. La etiqueta `lfm2` y el modelo base `LiquidAI/LFM2.5-1.2B-Base` situan al modelo dentro de la familia LFM2 de Liquid AI, pero el repositorio no publica numero de capas, dimension del espacio oculto, mecanismo de atencion ni longitud de contexto entrenada. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.) para este artefacto.

El proceso de entrenamiento descrito en la model card consta de dos etapas. Primero, un preentrenamiento continuado sobre el protocolo de corpus de wolof limpiado. Segundo, una etapa de ajuste por instrucciones (Instruct) con datos reweightados que excluyen el split de test del Hub de origen, aunque el autor advierte que podrian haber existido ejemplos similares a los de los benchmarks en el preentrenamiento upstream. Las filas crudas de datos privados no se incluyen en el repositorio. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion, ni el numero de tokens de entrenamiento. La tokenizacion empleada es de la familia `65k-ext`, y el autor subraya que las comparaciones de BPB entre las familias de tokenizador de 65k y 128k no son validas como comparacion de perplejidad.

## Capacidades

- Generacion de texto conversacional en wolof: el artefacto esta etiquetado como `text-generation` y `conversational`, y su etapa de ajuste es de tipo Instruct.
- Seguimiento de instrucciones: pasa por una etapa Instruct con datos reweightados, segun el manifiesto de entrenamiento.
- Adaptacion linguistica al wolof: el preentrenamiento continuado se realiza sobre un corpus de wolof limpiado y el uso previsto es la evaluacion de la adaptacion a este idioma.
- Manejo de code-switching: contemplado en las advertencias del autor, pero explicitamente no validado.
- Tool calling / function calling: no disponible; no se menciona soporte en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; el razonamiento se declara no validado de forma exhaustiva.
- Multilinguismo general: no disponible; solo se documenta el wolof como idioma objetivo.
- Vision, audio, modo de pensamiento (thinking): no disponible; no se declaran capacidades multimodales ni modos de razonamiento explicito.

## Casos de uso

- Asistentes conversacionales en wolof: el modelo puede emplearse para prototipar interfaces de dialogo en wolof, con la advertencia de que la ortografia y el comportamiento conversacional no han sido validados por hablantes nativos.
- Investigacion en adaptacion linguistica de bajo recurso: sirve como punto de partida reproducible para estudiar preentrenamiento continuado e instruction tuning sobre un corpus de wolof limpiado, comparando curvas de BPB dentro de la misma familia de tokenizador (`65k-ext`).
- Generacion de datos sinteticos en wolof: puede utilizarse para producir borradores de texto y pares de instruccion-respuesta que despues se filtren y revisen manualmente, alimentando futuros ciclos de ajuste.
- Traduccion asistida y postedicion: como generador de borradores en flujos wolof-otras lenguas, siempre con revision humana, dado que la factualidad y el code-switching no estan validados.
- Anotacion y etiquetado asistido: integrado en herramientas internas para preetiquetar corpus en wolof (categorias, resumenes, reformulaciones), reduciendo el coste de la anotacion manual antes de la revision por nativos.
- Evaluacion comparativa de modelos para lenguas africanas: al ser un artefacto experimental con manifiesto de entrenamiento, resulta util como linea base en protocolos de evaluacion internos frente a otros ajustes sobre el mismo modelo base.
- Material educativo y de alfabetizacion digital en wolof: generacion de explicaciones y ejercicios de borrador, con supervision docente y revision linguistica obligatoria.
- Despliegue en entornos con recursos limitados: con ~1,32 mil millones de parametros, es candidato a ejecucion en una sola GPU de consumo o incluso en CPU si se convierte a formatos cuantizados, para tareas de demostracion y evaluacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que solo se incluyen las metricas realmente medidas en `metrics.json` y que la ausencia de una metrica implica que no fue medida, sin que deba inferirse ningun valor.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no publicada por el autor):
  - BF16/FP16: aproximadamente 2,6 GB solo de pesos; con cache KV y overhead del runtime, del orden de 4 a 6 GB para contextos moderados.
  - INT8: aproximadamente 1,4 GB de pesos.
  - 4 bits: aproximadamente 0,8 a 1,0 GB de pesos.
- GPU recomendadas: no disponible. Por tamano, el modelo es apto para GPUs de consumo con 8 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090) en cuantizaciones de 4 a 8 bits; no requiere A100 ni H100 salvo para entrenamiento o ajuste fino.
- Cabe en GPU de consumo: si, previsiblemente en cualquier tarjeta con 8 GB o mas de VRAM en cuantizacion de 4 a 8 bits. Sin confirmacion oficial por parte del autor.
- Opciones de despliegue: `transformers` es el soporte documentado. Otros runtimes (vLLM, TGI, llama.cpp, Ollama) no estan confirmados y dependerian de que soporten la arquitectura LFM2 y de que exista una conversion a GGUF, que el repositorio no proporciona.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este artefacto, por lo que la comparacion se limita a parametros, licencia y disponibilidad. Los modelos alternativos citados son referencias de tamano comparable en el ecosistema abierto; no se comparan resultados de benchmarks porque no hay metricas publicadas para el modelo analizado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-1.2B-Wolof-Instruct | 1,32 mil millones | No disponible | No disponible | Repositorio HuggingFace publico; descrito por el autor como artefacto privado experimental |
| LiquidAI/LFM2.5-1.2B-Base | No disponible en la informacion proporcionada | No disponible | No disponible | Modelo base en HuggingFace |
| Llama 3.2 1B Instruct | 1,24 mil millones | 128k | Licencia comunitaria de Llama | Pesos abiertos con aceptacion de terminos |
| Qwen2.5 1.5B Instruct | 1,54 mil millones | 32.768 tokens | Apache 2.0 | Amplia disponibilidad, incluidas variantes cuantizadas |
| Gemma 2 2B Instruct | 2,6 mil millones | 8.192 tokens | Terminos de uso de Gemma | Pesos abiertos con aceptacion de terminos |

## Limitaciones y advertencias

- Caracter experimental: el propio autor lo define como artefacto de produccion privado, en curso y no una version publica; no se hace ninguna afirmacion de calidad no registrada.
- Validacion incompleta: ortografia del wolof, code-switching, factualidad, razonamiento, comportamiento en contexto largo y seguridad no han sido validados de forma exhaustiva.
- Revision por hablantes nativos necesaria: se indica explicitamente antes de cualquier uso mas amplio.
- Riesgo de alucinacion: no cuantificado; al no haber validacion de factualidad, debe asumirse riesgo elevado en tareas de conocimiento.
- Contaminacion potencial: el autor advierte que podrian haber existido ejemplos similares a los de los benchmarks en el preentrenamiento upstream, aunque el split de test del Hub se excluyo de los datos de instruccion.
- Licencia no declarada: el repositorio no indica licencia, por lo que no puede asumirse permiso para uso comercial. Debe consultarse la licencia del modelo base `LiquidAI/LFM2.5-1.2B-Base` antes de cualquier despliegue.
- Idiomas: solo el wolof esta documentado como objetivo; no hay lista oficial de idiomas soportados ni garantias fuera de ese idioma.
- Contexto: la longitud de contexto no esta publicada, lo que impide planificar cargas con ventanas largas.
- Comparabilidad de metricas: el autor advierte que el BPB de la familia `65k-ext` no debe compararse como perplejidad frente a la familia de 128k.
- Datos de entrenamiento no reproducibles: las filas crudas privadas no se incluyen en el repositorio.
- Reproduccion de benchmarks: al no publicarse resultados, no es posible verificar afirmaciones de rendimiento con terceros.
- Sin soporte confirmado de tool calling, agentes ni multimodalidad.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mamelles/LFM2.5-1.2B-Wolof-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Organizacion LiquidAI en HuggingFace: https://huggingface.co/LiquidAI
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo (los resultados correspondian a paginas de ayuda de Gmail sin relacion con el artefacto). No se dispone de paper, blog, repositorio de codigo ni demo adicionales en la informacion proporcionada.
