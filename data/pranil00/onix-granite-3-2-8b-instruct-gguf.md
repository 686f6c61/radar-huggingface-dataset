# pranil00/ONIX-granite-3.2-8b-instruct-GGUF

## Resumen

ONIX-granite-3.2-8b-instruct-GGUF es una cuantizacion en formato GGUF (Q4_K_M) del modelo IBM Granite 3.2 8B Instruct, publicada por el usuario pranil00 bajo la etiqueta comunitaria "ONIX". No se trata de un modelo entrenado desde cero, sino de una conversion de pesos del modelo base original de IBM a un formato optimizado para inferencia local con llama.cpp y Ollama. El peso resultante ocupa 4,60 GB, lo que permite ejecutarlo en hardware de consumo.

El modelo base, Granite 3.2 8B Instruct, es un transformer denso de 8 mil millones de parametros desarrollado por IBM, disenado para tareas de generacion de texto, razonamiento, codigo y uso empresarial con soporte de tool calling. La cuantizacion Q4_K_M reduce la precision de los pesos a 4 bits con una mezcla de escalas, buscando un equilibrio entre calidad y tamano.

La relevancia de esta publicacion es practica: ofrece una via sencilla para desplegar Granite 3.2 8B Instruct en equipos sin GPU de datacenter, mediante Ollama o llama.cpp. La model card es minima y no aporta datos sobre el proceso de cuantizacion mas alla de indicar que se realizo en Apple Silicon con Metal y que fue "verificada" mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base IBM Granite 3.2 8B Instruct) |
| Parametros totales | 8 mil millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base IBM Granite 3.2 8B Instruct, un transformer denso de 8 mil millones de parametros. Esta publicacion no entrena ni afina el modelo: solo convierte los pesos originales a GGUF con cuantizacion Q4_K_M mediante llama.cpp. La model card indica que la conversion se realizo en Apple Silicon con Metal y que los tensores fueron verificados como "autenticos".

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens, el proceso de alineacion (RLHF/DPO) ni innovaciones tecnicas del modelo base. Cualquier dato de ese tipo debe consultarse en la model card oficial de ibm-granite/granite-3.2-8b-instruct.

## Capacidades

- Generacion de texto instructivo, heredada del modelo base Granite 3.2 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (segun el modelo base).
- Generacion de codigo y tareas de matematicas (segun el modelo base).
- Soporte de tool calling / function calling (segun el modelo base).
- Capacidades multilingues: no disponibles en la informacion proporcionada para esta publicacion.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.
- Ejecucion local en CPU y GPU de consumo mediante llama.cpp y Ollama.

## Casos de uso

- Prototipado local de asistentes conversacionales: la cuantizacion Q4_K_M de 4,60 GB permite levantar un servidor de chat en un portatil con Ollama y probar flujos multi-turno sin depender de la nube.
- Desarrollo offline en entornos sin conectividad: al ejecutarse con llama.cpp en CPU, sirve para generar texto y codigo en maquinas aisladas o con requisitos de privacidad estrictos.
- Evaluacion rapida de Granite 3.2 8B Instruct: util para comparar la calidad del modelo base frente a otras alternativas antes de invertir en despliegues a mayor escala.
- Integracion en pipelines de CI/CD para tareas auxiliares: generacion de descripciones de commits, resumenes de diffs o borradores de documentacion, ejecutando el modelo en runners con GPU modestas.
- Educacion y experimentacion: permite a estudiantes ejecutar un modelo de 8B en hardware asequible para estudiar cuantizacion, formatos GGUF y tecnicas de inferencia.
- Despliegue en edge o estaciones de trabajo: con 4,60 GB de pesos, encaja en equipos con 8 GB de RAM/VRAM, adecuado para tareas de generacion de texto de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 5-6 GB para cargar los pesos Q4_K_M (4,60 GB) mas el contexto y overhead de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, etc.); en Apple Silicon, equipos con 16 GB de memoria unificada o mas.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM; tambien puede ejecutarse en CPU con suficiente RAM.
- Opciones de despliegue: Ollama (`ollama run pranil00/ONIX-granite-3.2-8b-instruct-GGUF`) y llama.cpp (`llama-cli`). No se indica soporte para vLLM o TGI en esta publicacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-granite-3.2-8b-instruct-GGUF (esta ficha) | 8B (denso) | no disponible | GGUF Q4_K_M | Apache 2.0 | Hugging Face |
| ibm-granite/granite-3.2-8b-instruct | 8B (denso) | no disponible | safetensors | Apache 2.0 | Hugging Face (oficial IBM) |
| Otras cuantizaciones GGUF de Granite 3.2 8B Instruct | 8B (denso) | no disponible | GGUF (varias) | Apache 2.0 | Hugging Face (comunidad) |

La comparativa se limita al modelo base oficial y a otras cuantizaciones comunitarias, ya que no se dispone de datos de rendimiento para contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo base en safetensors; la degradacion exacta no esta documentada en la model card.
- La publicacion es de un usuario comunitario (pranil00) y no de IBM; no hay garantia oficial de soporte ni de mantenimiento.
- La model card es minima: no detalla el proceso de cuantizacion, la verificacion de calidad ni los idiomas soportados.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base IBM Granite 3.2 mantenga esa misma licencia en su publicacion oficial.
- No se han publicado benchmarks especificos para esta cuantizacion; el rendimiento real puede diferir del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-granite-3.2-8b-instruct-GGUF
- Modelo base oficial: https://huggingface.co/ibm-granite/granite-3.2-8b-instruct
- llama.cpp (herramienta de cuantizacion e inferencia): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
