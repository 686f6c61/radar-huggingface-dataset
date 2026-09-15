# DarkWhiteProductions/Indra-4B-Base

## Resumen

Indra-4B-Base es un modelo de lenguaje causal publicado por el usuario DarkWhiteProductions en HuggingFace bajo el identificador `DarkWhiteProductions/Indra-4B-Base`. Se trata de un modelo de 4.022.470.400 parametros (aproximadamente 4B) almacenado en formato safetensors y distribuido a traves de la libreria `transformers`, con un repositorio de 8,1 GB, lo que resulta coherente con pesos en precision de 16 bits sin cuantizar.

El modelo se presenta con las etiquetas `causal-lm`, `reasoning`, `conversational`, `research`, `experimental` y `custom-code`, ademas de la etiqueta `qwen`, lo que sugiere una posible base arquitectonica derivada de la familia Qwen, aunque no se ha publicado documentacion tecnica que lo confirme. La etiqueta `custom_code` implica que la carga del modelo requiere `trust_remote_code=True` y la ejecucion de codigo Python incluido en el propio repositorio, un factor relevante de seguridad para cualquier integracion en produccion.

El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones adicionales en HuggingFace antes de poder descargar los pesos. La licencia declarada es `other`, sin que se haya especificado el texto concreto, y el unico idioma declarado es el ingles. El modelo presenta un volumen de adopcion muy bajo (4 descargas y 0 likes en el momento de la consulta), por lo que debe considerarse un experimento de investigacion mas que una opcion contrastada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Las etiquetas indican `causal-lm` y `custom_code`, con posible ascendencia Qwen, pero no se ha publicado documentacion de la arquitectura |
| Parametros totales | 4.022.470.400 |
| Parametros activos | No aplicable: no hay informacion que indique que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos safetensors; no se documentan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | `other` (sin texto de licencia especificado) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,1 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Libreria de inferencia | transformers |
| Codigo personalizado | Si (`custom_code`; requiere `trust_remote_code=True`) |
| Fecha de creacion | 21 de febrero de 2026 |
| Ultima actualizacion | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF, DPO o RLVR. La unica evidencia disponible son las etiquetas del repositorio, que apuntan a un modelo de lenguaje causal (`causal-lm`) con soporte de razonamiento y uso conversacional, y una etiqueta `qwen` que sugiere que la implementacion puede reutilizar componentes, tokenizador o configuracion de esa familia. La etiqueta `custom_code` confirma que el repositorio incluye codigo propio necesario para instanciar el modelo, probablemente una definicion de arquitectura modificada respecto a la implementacion estandar de `transformers`.

Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa, atencion con ventana deslizante o mecanismos híbridos SSM-transformer. Cualquier afirmacion al respecto seria especulativa, por lo que se marca como no disponible. Dado el caracter `experimental` y `research` declarado por el autor y el escaso numero de descargas, es razonable asumir que se trata de un modelo en fase temprana de desarrollo, sin validacion externa conocida.

## Capacidades

- Generacion de texto autoregresiva en ingles, segun la tarea declarada `text-generation`.
- Razonamiento: la etiqueta `reasoning` sugiere entrenamiento o ajuste orientado a tareas de razonamiento, aunque no se aportan detalles ni evaluaciones que lo cuantifiquen.
- Uso conversacional: la etiqueta `conversational` indica soporte de dialogos multi-turno, si bien no se documenta la plantilla de chat ni el formato de prompt recomendado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la metadata del repositorio; no se declaran otros idiomas.
- Capacidades especiales (modo thinking explicito, vision, audio): no disponible.
- Generacion de codigo: no se declara de forma explicita; la etiqueta `custom-code` hace referencia al codigo de modelado, no a una capacidad de generacion de codigo.

## Casos de uso

- Investigacion sobre arquitecturas causales personalizadas: dado que el repositorio incluye codigo propio de modelado y esta etiquetado como `research` y `experimental`, el caso de uso mas realista es el estudio de la implementacion concreta y su comparacion con la arquitectura base de la que deriva.
- Experimentacion academica con modelos de 4B: el tamano permite entrenamiento completo o ajuste fino con LoRA en una GPU unica, lo que lo hace util para reproducir experimentos de ajuste supervisado en entornos con recursos limitados.
- Evaluacion de la propia calidad del modelo: antes de cualquier uso practico, resultaria necesario ejecutar baterias propias de evaluacion (perplejidad, tareas de razonamiento, coherencia conversacional), ya que no existe informacion publica de rendimiento.
- Generacion de texto en ingles en prototipos internos: para tareas de completado de texto o generacion de borradores en entornos controlados y no criticos, siempre que se asuma la ausencia de garantias de calidad.
- Base para ajuste fino especifico de dominio: al ser un modelo base y no un modelo instruido de forma confirmada, puede servir como punto de partida para fine-tuning supervisado sobre un corpus propio en ingles.
- Estudio de seguridad en la carga de modelos con `custom_code`: el caso permite analizar los riesgos de ejecutar codigo remoto de un autor desconocido con `trust_remote_code=True`, un escenario relevante para equipos de plataforma y seguridad.
- Despliegue en hardware de consumo como banco de pruebas: con unos 8 GB de pesos en 16 bits, cabe en GPU de consumo con suficiente VRAM para validar pipelines de inferencia antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar en la metadata del repositorio ni en los resultados de busqueda consultados. Tampoco se dispone de mediciones de latencia o throughput publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8-9 GB solo para pesos, mas el espacio de activaciones y cache KV, lo que situa el requisito practico en torno a 10-12 GB para contextos moderados.
- VRAM estimada en INT8: aproximadamente 4-5 GB de pesos.
- VRAM estimada en INT4 (si se generan cuantizaciones compatibles): aproximadamente 2,5-3,5 GB de pesos.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100, L40S o RTX 4090 (24 GB) como opcion de gama alta para consumo. Para INT4/INT8 basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB.
- Compatibilidad con GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080 y RTX 4090 en FP16, y en tarjetas de 8 GB con cuantizacion INT4. Estas estimaciones derivan del recuento de parametros y no de mediciones publicadas por el autor.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es el unico metodo confirmado, dado que no se publican pesos GGUF ni artefactos para vLLM, llama.cpp, Ollama o TGI. La compatibilidad con vLLM dependeria de que la arquitectura personalizada este soportada, lo cual no esta documentado.
- Latencia y throughput: no disponible. No se han publicado mediciones.
- Advertencia de seguridad: al requerir ejecucion de codigo del repositorio, se recomienda desplegar en un entorno aislado (contenedor sin acceso a red, sin credenciales) durante la evaluacion inicial.

## Comparativa con modelos similares

La comparativa se limita a parametros, contexto y licencia, ya que no existen datos de rendimiento publicados para Indra-4B-Base. Los datos de los modelos alternativos corresponden a informacion publica de sus respectivos repositorios.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Indra-4B-Base | 4,02B | No disponible | `other` (sin especificar) | Gated, requiere aceptar condiciones |
| Qwen3-4B | ~4,0B | 32.768 tokens nativos (ampliable) | Apache 2.0 | Abierta, sin gating |
| Llama 3.2 3B | 3,2B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Abierta con aceptacion de licencia |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Abierta, sin gating |

Diferencias relevantes: frente a las alternativas, Indra-4B-Base no publica longitud de contexto, no ofrece una licencia con texto definido, restringe el acceso mediante gating, requiere codigo personalizado y no cuenta con evaluaciones de rendimiento. Las alternativas citadas ofrecen licencias permisivas y especificaciones completas, lo que las hace preferibles para cualquier uso en produccion con los datos actuales.

## Limitaciones y advertencias

- Ausencia total de evaluaciones publicadas: no hay benchmarks, comparativas ni resultados de validacion que permitan estimar la calidad del modelo.
- Licencia `other` sin texto especificado: no se puede determinar si el uso comercial esta permitido, que obligaciones de atribucion existen ni si hay restricciones derivadas de la licencia del modelo base.
- Acceso restringido: el gating impide la descarga automatizada en pipelines de CI/CD sin gestion previa de credenciales y aceptacion de condiciones.
- Ejecucion de codigo remoto: la etiqueta `custom_code` implica `trust_remote_code=True`, lo que supone un riesgo de seguridad si el repositorio no se audita previamente.
- Modelo base sin alineacion confirmada: no se documenta RLHF, DPO ni ajuste por instrucciones, por lo que la salida puede ser incoherente con formatos de chat sin un ajuste posterior.
- Idioma unico: solo se declara ingles, con el consiguiente riesgo de degradacion severa en castellano u otros idiomas.
- Longitud de contexto desconocida: no es posible planificar casos de uso que dependan de ventanas largas ni estimar el consumo de cache KV.
- Riesgo de alucinacion: no cuantificado por el autor; en modelos de 4B sin evaluacion publicada, la tasa de invencion de hechos suele ser relevante, pero no existen datos para este modelo concreto.
- Sesgos: no se ha publicado ningun analisis de sesgos ni la composicion del corpus de entrenamiento, por lo que se desconoce el perfil de sesgos del modelo.
- Adopcion practicamente nula: 4 descargas y 0 likes, sin issues ni discusiones publicas que permitan contrastar experiencias de uso.
- Ausencia de cuantizaciones oficiales: no hay artefactos GGUF, AWQ o GPTQ publicados, lo que complica el despliegue en hardware limitado sin trabajo adicional de conversion.
- Estatus experimental: el propio autor etiqueta el modelo como `experimental` y `research`, lo que desaconseja su uso en sistemas en produccion sin una validacion exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/DarkWhiteProductions/Indra-4B-Base
- Paper: no disponible
- Blog tecnico: no disponible
- Repositorio de codigo: no disponible (el repositorio de HuggingFace incluye codigo personalizado, pero no se ha localizado un repositorio externo)
- Demo: no disponible
- Resultados de la busqueda web: no se ha encontrado ningun resultado relevante sobre el modelo. Las consultas devolvieron exclusivamente listados de programacion televisiva en frances, sin relacion alguna con el modelo ni con su autor.
