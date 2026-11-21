# kaitchup/DaisyRose-27B-chimachima-kaiPTQ

## Resumen

DaisyRose-27B-chimachima-kaiPTQ es una cuantizacion en formato GGUF del modelo RadixArk/DaisyRose-27B, publicada por el usuario kaitchup bajo el marco de trabajo kaiPTQ. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el repositorio contiene pesos cuantizados con la tecnica chimachima y calibracion mediante matrices de importancia (imatrix), orientados a inferencia eficiente en CPU y GPU de gama media. El pipeline declarado es text-generation y la licencia es Apache-2.0, heredada del modelo base.

El dato de parametros totales registrado en los safetensors del repositorio es de 8.595.836.340, aproximadamente 8,6 mil millones, una cifra que no concuerda con el sufijo "27B" del nombre del modelo base. Esta discrepancia debe tenerse en cuenta antes de planificar el despliegue, ya que el tamano real del repo (15,4 GB) es coherente con un modelo de unos 8-9 mil millones de parametros cuantizados a precisiones medias-altas, no con uno de 27 mil millones. No se dispone de informacion adicional que resuelva esta inconsistencia.

La relevancia del modelo es practica: ofrece una via para ejecutar el modelo base en entornos con recursos limitados usando llama.cpp u otros runners compatibles con GGUF, con acceso restringido que exige aceptar condiciones en Hugging Face. No hay descargas ni valoraciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base RadixArk/DaisyRose-27B; arquitectura no especificada en la informacion) |
| Parametros totales | 8.595.836.340 (segun safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion kaiPTQ y calibracion imatrix (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 15,4 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base RadixArk/DaisyRose-27B en los datos proporcionados. El repositorio es una cuantizacion post-entrenamiento (PTQ) del modelo base, realizada con el metodo chimachima dentro del ecosistema kaiPTQ, que emplea matrices de importancia (imatrix) para calibrar la cuantizacion y preservar las capas mas sensibles. Los tags incluyen referencias a tres papers en arXiv (2505.22988, 2406.11235 y 2609.36173), presumiblemente relacionados con las tecnicas de cuantizacion aplicadas, aunque no se detalla su contenido.

No hay informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens procesados, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones de arquitectura como atencion lineal o decodificacion especulativa. Todo lo relativo al entrenamiento original queda fuera del alcance de esta ficha.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica uso previsto para dialogos multi-turno.
- Inferencia compatible con endpoints: el tag "endpoints_compatible" sugiere integracion con APIs de servidores de inferencia estandar.
- Cuantizacion optimizada con imatrix: pensada para mantener calidad en precisiones reducidas.
- Compatibilidad con el ecosistema GGUF: ejecutable en llama.cpp y runners derivados.
- Capacidades especificas de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible.

## Casos de uso

- Despliegue en hardware de consumo: al estar en formato GGUF y con un peso de repo de 15,4 GB, puede ejecutarse en GPU consumer con 16-24 GB de VRAM o incluso en CPU con RAM suficiente, usando llama.cpp u Ollama.
- Prototipado de chatbots: el tag conversacional y la licencia Apache-2.0 permiten integrar el modelo en prototipos de atencion al cliente o asistentes internos sin restricciones comerciales derivadas de la licencia.
- Inferencia en servidores sin GPU dedicada: la cuantizacion GGUF permite servir el modelo en CPU, adecuado para entornos de desarrollo o validacion donde no hay aceleradores disponibles.
- Evaluacion comparativa de tecnicas de cuantizacion: util para investigadores que quieran medir el impacto de kaiPTQ con imatrix frente a otras cuantizaciones del mismo modelo base.
- Pipelines de generacion de texto por lotes: la naturaleza del formato GGUF y la compatibilidad con endpoints facilitan su integracion en tareas de procesamiento masivo de texto.
- Experimentacion academica: al ser un artefacto derivado con papers asociados en los tags, sirve como referencia reproducible para estudiar metodos de PTQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con un repo de 15,4 GB, se necesitan al menos 16 GB de VRAM para cargar los pesos en GPU sin offloading; con cuantizaciones mas agresivas (si estan disponibles en el repo) podria reducirse, pero los niveles concretos no se documentan.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB o H100 para margen holgado; GPUs de 16 GB como RTX 4080 o A4000 pueden funcionar segun el nivel de cuantizacion.
- Cabe en GPU consumer: si, en modelos con 16 GB o mas de VRAM, siempre que se use una cuantizacion adecuada.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF; el tag "endpoints_compatible" sugiere soporte para servidores de inferencia con API.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-chimachima-kaiPTQ | 8.595.836.340 (segun safetensors) | no disponible | GGUF | Apache-2.0 | Gated en Hugging Face |
| RadixArk/DaisyRose-27B (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras cuantizaciones del mismo base | no disponible | no disponible | GGUF probablemente | Apache-2.0 (heredada) | no disponible |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria mas alla del propio modelo base.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre indica "27B" pero los safetensors registran 8.595.836.340 parametros; conviene verificar el modelo base antes de asumir capacidades.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que impide su descarga automatizada sin autenticacion.
- Cuantizacion post-entrenamiento: al ser un artefacto PTQ, puede presentar degradacion de calidad respecto al modelo base, especialmente en tareas de razonamiento o codigo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento que permita validar su calidad frente a otras cuantizaciones.
- Idiomas no documentados: se desconoce el soporte multilingue real.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin conocer la ventana del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay datos especificos sobre mitigaciones.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base por si impone restricciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaitchup/DaisyRose-27B-chimachima-kaiPTQ
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Paper arXiv 2505.22988: https://arxiv.org/abs/2505.22988
- Paper arXiv 2406.11235: https://arxiv.org/abs/2406.11235
- Paper arXiv 2609.36173: https://arxiv.org/abs/2609.36173
