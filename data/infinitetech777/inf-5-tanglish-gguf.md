# infinitetech777/INF-5-Tanglish-GGUF

## Resumen

INF-5-Tanglish-GGUF es la quinta iteracion de la serie INF de Infinite Tech Private Limited, un conjunto de pesos publicados en Hugging Face exclusivamente para que la aplicacion movil de la compania pueda descargarlos en dispositivos de sus usuarios. Se distribuye en formato GGUF, lo que indica que esta pensado para inferencia local en hardware modesto mediante runtimes compatibles con este formato (llama.cpp, Ollama, etc.).

El modelo cuenta con 1.720.574.976 parametros (aproximadamente 1,72 mil millones), un tamano propio de modelos on-device que buscan equilibrar calidad conversacional y huella de memoria reducida. El nombre sugiere especializacion en tanglish (mezcla de tamil e ingles), aunque la model card no documenta explicitamente los idiomas soportados ni la composicion del entrenamiento.

La relevancia de esta ficha es limitada desde el punto de vista de la comunidad open source: la licencia `infinite-tech-use-only` prohibe explicitamente cualquier uso distinto de la descarga por parte de la app oficial, incluyendo redistribucion y obras derivadas. No hay descargas ni likes registrados, y la informacion publica sobre arquitectura, datos de entrenamiento y benchmarks es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.720.574.976 (aprox. 1,72 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo se distribuye en GGUF; no se detallan los niveles incluidos) |
| Idiomas soportados | no disponible (el nombre sugiere tanglish, sin confirmacion en la model card) |
| Licencia | infinite-tech-use-only (propietaria, uso restringido a la app Infinite) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. Por el tamano (1,72 B de parametros) y el formato de distribucion (GGUF), es plausible que se trate de un transformer decoder-only optimizado para inferencia en dispositivo, pero la model card no confirma ni el tipo de atencion, ni el esquema de normalizacion, ni si emplea tecnicas como GQA o decodificacion especulativa.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, la presencia de fases de RLHF, DPO o SFT, ni si el modelo ha sido destilado o podado a partir de una base mayor. La unica informacion tecnica verificable es el recuento de parametros (1.720.574.976) y el tamano del repositorio (1,1 GB), coherente con una cuantizacion de pocos bits por peso para un modelo de este tamano.

## Capacidades

- Generacion de texto conversacional: la unica etiqueta funcional declarada es `conversational`, lo que apunta a un uso como chatbot de dialogo.
- Soporte de tanglish: el nombre del repositorio sugiere manejo de texto mezclado tamil-ingles, aunque no hay documentacion que lo confirme ni evaluaciones publicadas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el artefacto puede servirse a traves de infraestructura de inferencia estandar.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Vision, audio o modo thinking: no disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Integracion en la app Infinite: el caso de uso declarado por el autor es la descarga de pesos por parte de la aplicacion oficial para ofrecer inferencia local a sus usuarios; cualquier otro escenario queda fuera de los terminos de la licencia.
- Asistente conversacional on-device en dispositivos de gama media: con 1,72 B de parametros y distribucion GGUF, el modelo esta dimensionado para ejecutarse en telefonos o portatiles sin GPU dedicada, siempre dentro de la app propietaria.
- Procesamiento de texto tanglish en local: si la especializacion sugerida por el nombre se confirma, podria emplearse para normalizar o responder mensajes en tamil romanizado dentro del producto de Infinite.
- Evaluacion interna de la familia INF: util para que el equipo de Infinite compare la iteracion 5 frente a versiones anteriores en tareas de dialogo.
- Referencia tecnica para terceros: investigadores pueden inspeccionar el GGUF para estudiar decisiones de cuantizacion de modelos de 1,7 B, sin poder reutilizar los pesos.
- Despliegue en entornos de borde con requisitos de privacidad: al ejecutarse localmente, evita enviar conversaciones a servidores externos, un argumento habitual en asistentes on-device.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de 1,72 B en GGUF, una cuantizacion Q4_K_M ocuparia en torno a 1,0-1,1 GB de memoria, Q8_0 alrededor de 1,8 GB y FP16 unos 3,4 GB; estos calculos son estimaciones genericas basadas en el recuento de parametros, no datos del autor.
- GPU recomendadas: no disponible. Por tamano, cabria en GPUs consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060), si bien no hay validacion publicada.
- Cabe en consumer GPU: previsiblemente si, en modelos con al menos 4 GB de VRAM o en CPU con 2-4 GB de RAM libre, aunque no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere soporte en plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| INF-5-Tanglish-GGUF | 1,72 B | no disponible | infinite-tech-use-only (propietaria) | GGUF | Publico en HF, uso restringido |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Publico, uso comercial permitido |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Publico, uso comercial con condiciones |
| Gemma 2 2B IT | 2,61 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Publico, uso comercial con condiciones |

La comparativa se ofrece como referencia de categoria (modelos de 1-3 B para inferencia local); no existen datos publicados de rendimiento de INF-5 que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia extremadamente restrictiva: `infinite-tech-use-only` prohibe cualquier uso, redistribucion u obra derivada fuera de la app Infinite, lo que excluye de facto el uso comercial, la investigacion reproducible y la integracion en productos de terceros.
- Ausencia total de documentacion tecnica: sin arquitectura, contexto, datos de entrenamiento ni evaluaciones, es imposible validar el comportamiento del modelo antes de desplegarlo.
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks ni model card sustantiva, no puede estimarse la fiabilidad en dominios factuales.
- Idiomas no confirmados: la especializacion en tanglish es una inferencia a partir del nombre del repositorio, no un dato verificado.
- Sin adopcion comunitaria: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion independiente.
- Fecha de publicacion atipica (2026-11-10): conviene verificar la integridad y procedencia del repositorio antes de cualquier uso.
- Sin garantias de soporte: al ser pesos publicados solo para consumo interno de la app, no cabe esperar mantenimiento ni actualizaciones documentadas para terceros.

## Enlaces

- Hugging Face: https://huggingface.co/infinitetech777/INF-5-Tanglish-GGUF
- Licencia referenciada en la model card: LICENSE (dentro del repositorio de Hugging Face)
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
