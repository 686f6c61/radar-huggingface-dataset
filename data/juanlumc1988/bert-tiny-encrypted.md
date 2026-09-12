# juanlumc1988/bert-tiny-encrypted

## Resumen

juanlumc1988/bert-tiny-encrypted es un repositorio de Hugging Face que no contiene un modelo cargable, sino un unico fichero cifrado, `artifact.enc`, publicado como prueba de concepto de un canal de distribucion confidencial de modelos. El artefacto es un criptograma AES-256-GCM de un archivo tar sin comprimir que a su vez contiene `google/bert_uncased_L-2_H-128_A-2`, un transformer encoder BERT diminuto (2 capas, hidden 128, 2 cabezas de atencion, en torno a 4,4 M de parametros) re-serializado a safetensors.

El problema que aborda no es de modelado sino de MLOps y confidential computing: como publicar un artefacto de modelo de forma abierta sin revelar su contenido, de modo que el unico secreto sea la clave, que nunca viaja junto al fichero. El identificador del repositorio se liga al criptograma como datos asociados, de forma que el artefacto no puede reubicarse en otro repositorio sin que falle la autenticacion.

Es relevante como patron reproducible para pipelines que necesitan desplegar modelos en entornos con requisitos de confidencialidad: el flujo descrito monta la clave desde un Secret de Kubernetes, descarga y verifica el artefacto, lo descifra en memoria y carga el modelo en un volumen respaldado por RAM, sin que el texto en claro llegue a disco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) del modelo subyacente `google/bert_uncased_L-2_H-128_A-2`: 2 capas, hidden 128, 2 cabezas de atencion |
| Parametros totales | En torno a 4,4 M (modelo subyacente) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (modelo subyacente) |
| Tipos de cuantizacion | No disponible; el artefacto contiene safetensors sin cuantizar |
| Idiomas soportados | No disponible en el repositorio; el modelo subyacente es la variante `uncased` de BERT, orientada a texto en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | `artifact.enc`: nonce (12 bytes) \|\| ciphertext \|\| GCM tag (16 bytes); safetensors en claro una vez descifrado |
| Cifrado | AES-256-GCM con el id del repositorio como datos asociados |
| Pipeline | No disponible |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB reportados por Hugging Face |

## Arquitectura y entrenamiento

El modelo subyacente es BERT en su configuracion minima: un encoder transformer con 2 capas, dimension oculta 128 y 2 cabezas de atencion. Fue entrenado por Google con los objetivos estandar de BERT (masked language modeling y next sentence prediction) sobre corpus de texto, y aqui se re-serializa a safetensors para empaquetarlo en el artefacto cifrado. No se indica en la informacion disponible ningun proceso de fine-tuning, RLHF o DPO sobre esta copia.

La innovacion tecnica no reside en el modelo, sino en el canal de distribucion. El criptograma sigue el formato `nonce (12 bytes) || ciphertext || GCM tag (16 bytes)` con AES-256-GCM, y el identificador `juanlumc1988/bert-tiny-encrypted` se incorpora como associated data, de modo que cualquier intento de reubicar el fichero en otro repositorio rompe la verificacion de integridad. El consumo previsto se apoya en Kubernetes: la clave se monta desde un Secret, el artefacto se descarga, se verifica y se descifra en memoria, y el modelo se carga en un volumen respaldado por RAM, evitando que el texto en claro toque disco.

## Capacidades

- El repositorio, por si mismo, no expone ninguna capacidad de inferencia: contiene un fichero cifrado y no un modelo cargable.
- El modelo subyacente (`bert_uncased_L-2_H-128_A-2`) es un encoder de proposito general, no un modelo generativo; sus usos tipicos son extraccion de caracteristicas, embeddings de frases, clasificacion de secuencias, reconocimiento de entidades y question answering extractivo tras fine-tuning.
- No soporta generacion de texto libre, razonamiento multi-paso, codigo ni matematicas en el sentido de un modelo de lenguaje generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion del repositorio.
- Capacidad destacable del artefacto: demostrar distribucion confidencial de modelos con verificacion de integridad ligada al repositorio y descifrado en memoria.

## Casos de uso

- Validacion de un canal de distribucion confidencial: permite comprobar de extremo a extremo el flujo descrito (montaje de clave desde un Secret de Kubernetes, descarga, autenticacion GCM y descifrado en memoria) antes de aplicarlo a modelos de mayor tamano.
- Prueba de concepto de confidential computing en MLOps: sirve para demostrar que un artefacto puede ser publico y a la vez confidencial, con la clave como unico secreto, sin exponer el modelo en claro.
- Integracion en CI/CD: el artefacto puede usarse como fixture en pruebas automatizadas que verifiquen que el descifrado falla si el repositorio cambia de identificador, gracias al uso del id como associated data.
- Extraccion de caracteristicas y embeddings en entornos restringidos, dado el tamano reducido del modelo subyacente (en torno a 4,4 M de parametros) y su bajo coste de computo.
- Clasificacion de texto ligera tras fine-tuning del modelo subyacente, apropiada para tareas de bajo coste y baja latencia sobre CPU.
- Material didactico y de reproducibilidad: el repositorio y el repositorio fuente en GitHub permiten reproducir el pipeline completo y estudiar decisiones de diseno de cifrado y despliegue.
- Pruebas de carga y empaquetado en un volumen respaldado por RAM, para medir el comportamiento del descifrado en memoria con modelos que no deben persistir en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion, ni tampoco referencias a MMLU, GLUE, SQuAD u otros conjuntos, ni comparaciones con modelos similares.

## Requisitos de hardware

- El modelo subyacente tiene en torno a 4,4 M de parametros, lo que en precision fp32 supone aproximadamente 17,6 MB de pesos; la huella de inferencia es inferior a 1 GB de RAM.
- No requiere GPU. Puede ejecutarse en CPU de forma holgada.
- Cabe en cualquier GPU de consumo (por ejemplo, RTX 3060 o superiores) e incluso en entornos sin GPU, aunque la GPU no aporta ventaja relevante a este tamano.
- El cuello de botella real no es el computo del modelo, sino la infraestructura de descifrado y despliegue: Kubernetes, gestion de Secrets y un volumen respaldado por RAM.
- Opciones de despliegue para el modelo subyacente una vez descifrado: PyTorch con `transformers` y ONNX Runtime. No se han documentado despliegues con vLLM, llama.cpp, Ollama o TGI, y el artefacto no esta en formato GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay artefactos directamente comparables en la informacion disponible en cuanto a distribucion confidencial; se trata de una prueba de concepto aislada. Como referencia del modelo subyacente, se incluyen alternativas de la misma familia de encoders diminutos; los recuentos de parametros proceden de la documentacion publica de esos modelos, no del repositorio analizado.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert_uncased_L-2_H-128_A-2 (subyacente) | ~4,4 M | 512 | Encoder BERT | Apache 2.0 | Publico en Hugging Face |
| prajjwal1/bert-mini | ~11,2 M | 512 | Encoder BERT | Apache 2.0 | Publico en Hugging Face |
| distilbert-base-uncased | ~66 M | 512 | Encoder destilado | Apache 2.0 | Publico en Hugging Face |
| juanlumc1988/bert-tiny-encrypted | No cargable sin clave | No disponible | Artefacto cifrado | Apache 2.0 | Repositorio publico, contenido cifrado |

Comparativa de rendimiento: no disponible, ya que no se han publicado metricas para este repositorio ni se incluyen resultados del modelo subyacente en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo cargable; descargarlo sin la clave produce bytes indistinguibles de datos aleatorios.
- El identificador del repositorio esta ligado como associated data, por lo que mover o copiar `artifact.enc` a otro repositorio provoca el fallo de la autenticacion GCM.
- No se documentan sesgos conocidos del modelo subyacente ni evaluaciones de sesgo en este repositorio.
- No hay informacion sobre alucinacion; el modelo subyacente es un encoder y no genera texto libre.
- No hay datos publicados sobre cobertura idiomatica ni limitaciones de contexto mas alla del maximo de 512 tokens del BERT subyacente.
- Se trata de una prueba de concepto: no hay indicios de que el pipeline haya sido auditado o endurecido para produccion, y requiere gestion segura de claves (Secret de Kubernetes) para funcionar.
- Licencia Apache 2.0, heredada del modelo subyacente; no se indican restricciones adicionales para uso comercial, pero conviene verificar el repositorio fuente antes de reutilizarlo.
- Cero descargas y cero likes: el artefacto no cuenta con validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: <https://huggingface.co/juanlumc1988/bert-tiny-encrypted>
- Pipeline y pasos de reproduccion: <https://github.com/juanlumc1988/confidential-model-distribution>
- Modelo subyacente: <https://huggingface.co/google/bert_uncased_L-2_H-128_A-2>
