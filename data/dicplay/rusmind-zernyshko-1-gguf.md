# DICPlay/RusMind-Zernyshko-1-GGUF

## Resumen

RusMind Zernyshko 1 es un modelo de lenguaje conversacional en ruso desarrollado por DICPlay, presentado como la variante mas compacta de la familia RusMind y entrenado desde cero. Con 35,46 millones de parametros y una arquitectura transformer de 8 capas con dimension oculta de 512, esta disenado para ejecutarse en hardware extremadamente limitado, incluyendo dispositivos de bajos recursos. Su peso en formato F16 ronda los 72 MB, lo que lo situa en la categoria de modelos ultra-ligeros.

El modelo emplea el formato de dialogo ChatML y una ventana de contexto de 1024 tokens, suficiente para conversaciones cortas de asistente. Se distribuye principalmente en formato GGUF para su uso con llama.cpp, LM Studio y Ollama, y los pesos en safetensors estan disponibles en un repositorio separado para su uso con Transformers.

Su relevancia actual reside en la experimentacion con modelos de lenguaje de muy bajo coste computacional y en el desarrollo de IA en ruso desde cero, sin depender de destilacion de modelos mayores. No obstante, su tamano limita severamente sus capacidades de razonamiento, conocimiento factual y generacion de codigo, por lo que debe considerarse una pieza de investigacion o de demostracion mas que un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (8 capas, dimension 512) |
| Parametros totales | 35.463.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16 (unico archivo publicado en el repo GGUF) |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay) |
| Formato de pesos | GGUF (F16) y safetensors en repo separado |

## Arquitectura y entrenamiento

La model card indica que se trata de un modelo entrenado completamente desde cero, con 8 capas y una dimension de 512, lo que da lugar a los 35,46 millones de parametros. No se especifica en la informacion disponible el tipo de atencion, la funcion de activacion, el uso de normalizacion RMSNorm, RoPE u otras variantes arquitectonicas concretas, ni si se emplearon tecnicas como decodificacion especulativa o atencion lineal.

Tampoco se detalla el volumen de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron fases de ajuste supervisado, RLHF o DPO. La unica informacion disponible sobre el formato de interaccion es el uso de plantillas ChatML y el enfoque conversacional. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de lo citado seria especulativa.

## Capacidades

- Generacion de texto conversacional en ruso con formato ChatML.
- Respuestas de asistente en dialogos de corta duracion dentro de una ventana de 1024 tokens.
- Ejecucion completamente offline en hardware de muy bajos recursos.
- Compatibilidad con llama.cpp, LM Studio y Ollama mediante el formato GGUF.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de pensamiento explicito.
- Capacidad multilingue limitada al ruso segun la metadata del modelo.

## Casos de uso

- Demostracion educativa de entrenamiento desde cero: util para ilustrar el pipeline completo de un modelo de lenguaje en charlas y cursos, dado su reducido tamano y su publicacion en GGUF y safetensors.
- Pruebas de integracion con llama.cpp: sirve como modelo de humo para validar pipelines de inferencia, plantillas ChatML y despliegue en entornos embebidos antes de pasar a modelos mayores.
- Experimentacion con IA en ruso a escala reducida: permite estudiar el comportamiento de un modelo monolingue ruso de 35M de parametros en tareas de generacion corta.
- Prototipado de asistentes conversacionales offline: adecuado para validar la experiencia de usuario de un chatbot de respuestas breves en dispositivos sin conectividad.
- Evaluacion de tecnicas de cuantizacion y formatos GGUF: su tamano minimo facilita ciclos de prueba rapidos con distintas configuraciones de llama.cpp.
- Educacion e investigacion sobre limitaciones de escala: util como caso base para comparar curvas de calidad frente a modelos del mismo orden de magnitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F16 (el archivo pesa 72 MB; el consumo real depende del runtime y del contexto reservado).
- GPU recomendadas: no se especifican; el modelo esta pensado para CPU y hardware de muy bajos recursos.
- Cabe en cualquier GPU consumer e incluso en CPU sin aceleracion dedicada; la model card menciona ejecucion en dispositivos como un Nokia N95 o electrodomesticos, lo que refleja su vocacion de ultraligero.
- Opciones de despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-1-GGUF -cnv`), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-1-GGUF`) y LM Studio (busqueda «RusMind Zernyshko»). Para Transformers, pesos safetensors en el repo DICPlay/RusMind-Zernyshko-1.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind Zernyshko 1 | 35,46 M | 1024 | Ruso | RusMind License (uso comercial restringido) | GGUF, safetensors |
| RusMind Zernyshko 1.6 | no disponible | no disponible | Ruso | RusMind License (segun repo enlazado) | no disponible |
| Alternativas de 30-50M en otros idiomas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La unica comparacion documentada por el autor es cualitativa: Zernyshko 1.6 ofrece mayor calidad con un tamano similar.

## Limitaciones y advertencias

- Capacidad de razonamiento y conocimiento factual muy limitada por sus 35M de parametros; no es adecuado para tareas que requieran precision factual o codigo.
- Ventana de contexto de solo 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Modelo monolingue en ruso; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo elevado de alucinacion y de respuestas incoherentes fuera de dominios muy acotados.
- Sesgos potenciales derivados del corpus de entrenamiento, no documentados en la informacion disponible.
- Licencia RusMind License: uso gratuito para fines personales, no comerciales, de investigacion y evaluacion; el uso comercial, la reventa, la distribucion de versiones modificadas y la integracion en productos requieren contrato escrito con DICPlay.
- El modelo se distribuye «tal cual», sin garantias.
- El repositorio GGUF solo publica el archivo F16; no hay cuantizaciones Q4/Q8 en la informacion disponible.
- No se documentan evaluaciones de seguridad ni filtros de contenido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1-GGUF
- Repositorio safetensors: https://huggingface.co/DICPlay/RusMind-Zernyshko-1
- Version 1.6: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6
- Archivo F16: https://huggingface.co/DICPlay/RusMind-Zernyshko-1-GGUF/blob/main/RusMind-Zernyshko-1-F16.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-1-GGUF/blob/main/LICENSE
