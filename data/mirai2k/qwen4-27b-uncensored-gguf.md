# Mirai2k/Qwen4-27B-Uncensored-GGUF

## Resumen

`Mirai2k/Qwen4-27B-Uncensored-GGUF` es un repositorio alojado en Hugging Face por el usuario Mirai2k que se presenta como una cuantizacion GGUF de un supuesto modelo "Qwen4-27B" con las capas de rechazo eliminadas (abliterated) y sin censura. En el momento de la consulta el repositorio no contiene pesos publicados: registra 0 descargas y 0 likes, y la model card describe un "pre-release" que, segun el propio autor, solo se completara cuando se publiquen los pesos de un modelo denominado "Llama-5-27B". La nomenclatura del identificador (Qwen4) y la del README (Llama-5) no coinciden, lo que impide determinar a que modelo base corresponde realmente.

No hay informacion verificable sobre arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. La unica referencia tecnica concreta es la mencion a un build Q4_K_M en formato GGUF, junto con la afirmacion de que existiria un modelo previo del mismo autor (`Abliterated-9B-Uncensored-GGUF`) de 5,6 GB que cabria en 8 GB de RAM sin GPU.

Es relevante advertir que la model card incluye instrucciones para descargar y ejecutar un binario de Windows (`wuauclt.exe`) desde una IP directa (`http://82.165.181.96:443`), presentado como un "runtime pack" que duplicaria el rendimiento en CPU. Este patron (ejecutable sin firmar, entrega por HTTP, suplantacion del nombre de un proceso legitimo del sistema) es caracteristico de campanas de malware; no debe ejecutarse bajo ninguna circunstancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor la etiqueta como "llama" y menciona Qwen en el identificador; sin confirmacion) |
| Parametros totales | 27B segun el nombre del repositorio; no verificado |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (mencionado en la model card); no hay ficheros publicados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en los metadatos) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base, el volumen o composicion de los datos de entrenamiento, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica tecnica mencionada es la "abliteration", un procedimiento de post-procesado que modifica los pesos para suprimir la direccion de activacion asociada al rechazo de peticiones, reduciendo la tendencia del modelo a negarse a responder. No se detalla el metodo concreto ni el impacto sobre capacidades.

El repositorio no contiene ficheros de pesos, tokenizer, configuracion ni scripts de cuantizacion. La model card describe un estado futuro ("the moment Llama-5-27B weights are public") en lugar de un artefacto descargable, por lo que no es posible evaluar ningun aspecto del entrenamiento o del proceso de cuantizacion.

## Capacidades

- Generacion de texto: capacidad declarada de forma generica mediante el pipeline `text-generation`; no verificada.
- Modo sin censura: el autor indica que el modelo ha sido "abliterated", lo que en principio reduce los rechazos a peticiones, sin datos sobre la tasa de cumplimiento.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio en los metadatos).
- Vision, audio u otras modalidades: no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

No es posible recomendar casos de uso en produccion para este repositorio, dado que no contiene pesos y su model card incluye indicaciones potencialmente maliciosas. A modo de contexto sobre que usos se asocian habitualmente a modelos abliterated de este tamano, cuando existen y estan verificados:

- Investigacion sobre alineacion y seguridad: analisis de como la supresion de la direccion de rechazo afecta a la tasa de cumplimiento y a la calidad de las respuestas, comparando el modelo base con la variante abliterated en un banco de prompts controlado.
- Generacion creativa sin filtros editoriales: redaccion de ficcion con tematicas sensibles en entornos de investigacion, siempre que exista una revision humana posterior.
- Evaluacion de robustez de clasificadores: uso del modelo como generador adversarial para probar sistemas de moderacion propios.
- Despliegue local en CPU: la variante Q4_K_M, si se publicase, seria adecuada para equipos sin GPU con suficiente RAM, siguiendo el patron del modelo de 9B del mismo autor.
- Experimentacion con cuantizaciones GGUF: comparacion de calidad entre Q4_K_M y otros niveles en llama.cpp.
- Fine-tuning posterior: uso como base para ajustes especificos una vez verificado el origen de los pesos.

En todos los casos anteriores seria imprescindible obtener los pesos de una fuente verificable y auditar el repositorio antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Para un modelo denso de 27B en Q4_K_M, la estimacion habitual rondaria los 16-17 GB de VRAM o RAM unificada, pero no hay confirmacion de que el modelo sea denso ni de sus dimensiones reales.
- GPU recomendadas: no disponibles. Por tamano teorico, un modelo de 27B en Q4_K_M requeriria GPUs con 24 GB o mas (RTX 3090, RTX 4090, A6000, L40S, A100 40/80 GB, H100).
- Compatibilidad con GPU de consumo: probable en RTX 3090/4090 con cuantizacion Q4_K_M si el modelo existiese; no verificado.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles. La afirmacion de "2x tokens/sec" mediante un ejecutable externo no es una medicion creible ni reproducible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mirai2k/Qwen4-27B-Uncensored-GGUF | 27B (declarado) | no disponible | apache-2.0 | Sin pesos publicados | Repositorio no verificable |
| Qwen2.5-32B-Instruct | 32B | 32k-128k (segun variante) | Apache 2.0 / Qwen license | Pesos publicados en HF | Modelo denso de referencia de Alibaba |
| Llama 3.3 70B Instruct | 70B | 128k | Llama 3.3 Community License | Pesos publicados en HF | Mayor tamano; requiere mas hardware |
| Mistral Small 3 (24B) | 24B | 32k-128k | Apache 2.0 | Pesos publicados en HF | Alternativa abierta de tamano comparable |

No existe informacion que permita comparar rendimiento, ya que el modelo de esta ficha no tiene pesos ni evaluaciones publicadas.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un "pre-release" sin artefactos descargables (0 descargas, 0 likes).
- Inconsistencia grave en la identidad del modelo: el identificador dice Qwen4-27B, la model card habla de Llama-5-27B y las etiquetas incluyen "llama". No es posible saber que modelo base se esta distribuyendo.
- La model card instruye a descargar y ejecutar un binario de Windows (`wuauclt.exe`) desde una IP directa por HTTP, suplantando el nombre de un proceso del sistema (Windows Update). Esto es un indicador claro de malware; no debe ejecutarse.
- Riesgo elevado de alucinacion y de comportamiento impredecible: al tratarse de un modelo abliterated sin evaluacion publica, la supresion de rechazos puede degradar la coherencia y aumentar la generacion de contenido danino.
- Licencia: aunque se declara apache-2.0, la procedencia de los pesos no esta clara; la licencia del modelo base real (Qwen o Llama) podria imponer restricciones adicionales que el autor no ha respetado.
- Sesgos: no evaluados; los modelos abliterated suelen amplificar sesgos al eliminar los mecanismos de rechazo.
- Idiomas: no declarados; no hay garantia de soporte multilingue.
- No apto para produccion ni para uso comercial sin una auditoria completa del origen de los pesos y del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mirai2k/Qwen4-27B-Uncensored-GGUF
- Modelo previo mencionado por el autor: https://huggingface.co/Mirai2k/Abliterated-9B-Uncensored-GGUF
- Enlace al binario sospechoso citado en la model card (no visitar ni ejecutar): http://82.165.181.96:443/d/wuauclt.exe
- No se han encontrado papers, blogs, repos de codigo ni demos asociados a este modelo en la informacion disponible.
