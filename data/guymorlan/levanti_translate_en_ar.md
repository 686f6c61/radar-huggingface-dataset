# guymorlan/levanti_translate_en_ar

## Resumen

Levanti es un modelo de traduccion automatica ingles-arabe levantino coloquial desarrollado por Guy Mor-Lan (Universidad Hebrea de Jerusalen). Se trata de un ajuste fino de Helsinki-NLP/opus-mt-en-ar, un transformer encoder-decoder de la familia MarianNMT, entrenado durante 8 epocas sobre el dataset Levanti. Su particularidad es que soporta generacion condicionada por dialecto mediante un token prefijo en la entrada.

El modelo resuelve un problema concreto: la mayoria de traductores ingles-arabe producen arabe estandar moderno (MSA), poco adecuado para conversacion cotidiana en el Levante. Levanti permite generar variantes dialectales de Palestina (P), Libano (L), Siria (S) y Egipto (E) indicando el prefijo correspondiente al inicio del texto de entrada.

Con 76,4 millones de parametros y un repositorio de 0,3 GB, es un modelo compacto orientado a despliegue ligero y traduccion de registros coloquiales. Su licencia CC BY-SA 4.0 permite uso comercial con atribucion y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianNMT) |
| Parametros totales | 76.355.922 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no documentado por el autor) |
| Idiomas soportados | en (entrada), ar (salida, con dialectos palestino, libanes, sirio y egipcio) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Helsinki-NLP/opus-mt-en-ar, un transformer encoder-decoder de tipo MarianNMT ampliamente utilizado para traduccion. Sobre esa base se realizo un ajuste fino supervisado durante 8 epocas con el dataset guymorlan/levanti, compuesto por pares ingles-arabe dialectal. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

La innovacion principal es el condicionamiento por dialecto mediante un token prefijo seguido de espacio: "P" para palestino, "L" para libanes, "S" para sirio y "E" para egipcio. Esto permite que un unico modelo genere variantes dialectales distintas sin necesidad de mantener cuatro modelos separados. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de texto de ingles a arabe coloquial levantino y egipcio.
- Generacion condicionada por dialecto mediante token prefijo (P, L, S, E).
- Traduccion de registro coloquial e informal (contracciones, expresiones habladas) gracias al entrenamiento sobre datos dialectales.
- Pipeline de traduccion estandar de transformers (`pipeline("translation", ...)`).
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`) y despliegue en Azure (tag `deploy:azure`).
- No soporta tool calling, agentes, vision ni audio segun la informacion disponible.
- Capacidad multilingue limitada a la pareja en-ar; no se documenta soporte de otros idiomas.

## Casos de uso

- Traduccion de conversaciones informales para aplicaciones de mensajeria: el modelo traduce frases coloquiales inglesas a dialectos levantinos, util para chats y asistentes conversacionales dirigidos a usuarios de Palestina, Libano, Siria o Egipto.
- Localizacion de contenido para redes sociales: permite adaptar publicaciones y subtitulos a la variante dialectal de cada pais indicando el prefijo correspondiente.
- Generacion de datos sinteticos dialectales: util para aumentar corpus de arabe coloquial etiquetados por dialecto en tareas de NLP posteriores.
- Prototipado rapido de traduccion en entornos con recursos limitados: con 76 millones de parametros y 0,3 GB de pesos, se puede desplegar en CPU o GPU de gama baja para demos y pruebas.
- Investigacion en traduccion dialectal: sirve como linea base para experimentos de condicionamiento por dialecto en pares de idiomas con variacion regional alta.
- Herramientas de apoyo a la comunicacion para ONGs y servicios publicos que atienden poblacion araboparlante con registros coloquiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,3 GB de pesos, con overhead adicional de activaciones; cabe en cualquier GPU consumer.
- VRAM estimada en fp16: aproximadamente 0,15 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090); tambien viable en CPU.
- Cabe en GPU consumer y en entornos sin GPU; el modelo es adecuado para inferencia en CPU con latencias de decenas a cientos de milisegundos por frase.
- Opciones de despliegue: transformers (pipeline nativo), Hugging Face Inference Endpoints, Azure (tag `deploy:azure`). No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| guymorlan/levanti_translate_en_ar | 76,4 M | no disponible | en, ar (dialectal) | cc-by-sa-4.0 | Condicionamiento por dialecto (P/L/S/E) |
| Helsinki-NLP/opus-mt-en-ar | no disponible en la informacion | no disponible | en, ar (MSA) | cc-by-sa-4.0 | Modelo base; sin variacion dialectal |
| Otros traductores en-ar de MarianNMT | no disponible | no disponible | en, ar | variable | No se dispone de datos comparativos en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con muy pocas descargas (15) y sin likes; no hay evidencia de validacion externa ni benchmarks publicos.
- Entrenado sobre un unico dataset (guymorlan/levanti) cuya composicion y tamano no se detallan; riesgo de sobreajuste al dominio y estilo del corpus.
- El condicionamiento por dialecto depende de que el token prefijo se coloque correctamente al inicio de la entrada; un uso incorrecto puede producir salidas en dialecto no deseado o en MSA.
- Riesgo de alucinacion y de traducciones inexactas en frases largas o complejas, habitual en modelos Marian de este tamano.
- La longitud de contexto no esta documentada; probablemente limitada (tipico de MarianNMT, en torno a 512 tokens), lo que restringe entradas largas.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia; revisar implicaciones antes de integrar en productos propietarios.
- No se documentan sesgos especificos, pero al entrenarse sobre datos dialectales puede reflejar sesgos regionales o de registro del corpus.
- No apto para traduccion juridica, medica o tecnica formal, dado su enfoque coloquial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guymorlan/levanti_translate_en_ar
- Dataset Levanti: https://huggingface.co/datasets/guymorlan/levanti
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-ar
